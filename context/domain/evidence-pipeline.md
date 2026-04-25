# Evidence pipeline — stage definitions and agent responsibilities

Canonical reference for Cockpit's regulation intelligence pipeline. Each stage maps to one or more agent roles and produces typed outputs consumed by downstream stages.

**Related:** [entities.md](./entities.md) (domain types), [rdtii-pillars.md](./rdtii-pillars.md) (pillar definitions), [rules/global.md](../rules/global.md) (pipeline overview), [integrations.md](./integrations.md) (adapter patterns).

---

## Pipeline overview

```
Discover → Retrieve → Parse → Extract → Map → Verify → Report
```

Each stage is independently retriable. Failed stages produce an AuditTrace entry and do not block other jurisdictions.

---

## Stage 1 — Discover

**Agent:** `discovery`
**Purpose:** Find official legal documents relevant to a target jurisdiction and RDTII pillar.

| Input | Output |
| ----- | ------ |
| Jurisdiction (ISO 3166-1 alpha-2), target pillars, optional topic keywords | List of candidate document URLs with metadata (title, document type, language, source type) |

**Tools:** `web_search`, `document_fetch` (metadata-only mode)

**Rules:**
- Prefer official government and regulator sources over secondary databases.
- Search in the jurisdiction's official language(s) when known.
- Return at least the top 5 candidates per jurisdiction, ranked by source reliability.
- Log each search query and result set as an AuditTrace entry.

---

## Stage 2 — Retrieve

**Agent:** `parser` (retrieval phase)
**Purpose:** Download the full document and store it with metadata.

| Input | Output |
| ----- | ------ |
| Document URL, expected document type | LegalDocument record with raw file in object storage |

**Tools:** `document_fetch`

**Rules:**
- Detect language (BCP 47) and page count.
- Compute content hash for dedup.
- Flag image-only PDFs for OCR in the next stage.
- Store the original file unmodified; never alter source material.

---

## Stage 3 — Parse

**Agent:** `parser` (extraction phase)
**Purpose:** Extract structured text from the document, applying OCR when needed.

| Input | Output |
| ----- | ------ |
| LegalDocument record (with raw file) | Segmented text: articles, sections, paragraphs, footnotes, headings, page references |

**Tools:** `ocr_extract`

**Rules:**
- Preserve original document structure: headings, article numbering, footnotes, page numbers.
- Never paraphrase or summarize during parsing.
- Flag documents that could not be fully OCR'd for manual review.
- Output must retain page-level anchors for audit traceability.

---

## Stage 4 — Extract

**Agent:** `legal_mapper` (extraction phase)
**Purpose:** Identify clauses relevant to Pillar 6 and Pillar 7.

| Input | Output |
| ----- | ------ |
| Segmented text from Stage 3, jurisdiction context | List of Clause records with article references, original excerpts, and clause type |

**Tools:** `clause_extractor`

**Rules:**
- Extract verbatim text — never paraphrase the original.
- Classify each clause by type: `rule`, `obligation`, `prohibition`, `exception`, `definition`, `scope`, `penalty`.
- Tag subject matter using the controlled vocabulary in [entities.md](./entities.md) (`data_transfer`, `data_localization`, `consent`, `retention`, etc.).
- Include page number and article/section reference for every clause.

---

## Stage 5 — Map

**Agent:** `legal_mapper` (mapping phase)
**Purpose:** Assign each extracted clause to a Pillar 6 or Pillar 7 sub-indicator with rationale and confidence.

| Input | Output |
| ----- | ------ |
| Clause records from Stage 4, pillar definitions from [rdtii-pillars.md](./rdtii-pillars.md) | PillarMapping records with pillar label, sub-indicator, rationale, confidence |

**Tools:** `pillar_mapper`

**Rules:**
- Every mapping must include a 1–3 sentence rationale.
- Confidence scores follow thresholds in [rdtii-pillars.md](./rdtii-pillars.md#confidence-thresholds).
- Clauses with confidence < 0.7 are flagged `needs_human_review`.
- Cross-pillar clauses produce two PillarMapping records, both flagged `cross_pillar`.
- Never force a mapping — ambiguous clauses get `disputed` status, not a low-confidence `auto_mapped`.

---

## Stage 6 — Verify

**Agent:** `verifier`
**Purpose:** Validate citation accuracy and mapping quality before evidence is finalized.

| Input | Output |
| ----- | ------ |
| PillarMapping records + source LegalDocuments | Verified/disputed/rejected PillarMapping records + AuditTrace entries |

**Tools:** `citation_verifier`

**Checks performed:**
1. **Citation accuracy** — Does the `originalExcerpt` match text in the source document?
2. **Article reference** — Is the `articleNumber` correct?
3. **Mapping logic** — Does the clause actually impose the type of obligation claimed in the rationale?
4. **Confidence calibration** — Is the confidence score reasonable given the clause language?

**Rules:**
- Rejected mappings must include a rejection reason.
- Ambiguous clauses get status `disputed` with explanation, not `rejected`.
- Every verification action produces an AuditTrace entry.
- Verification must not modify the original clause excerpt.

---

## Stage 7 — Report

**Agent:** `report_agent`
**Purpose:** Assemble verified evidence into structured reports and cross-country comparison tables.

| Input | Output |
| ----- | ------ |
| Verified EvidenceRecord set | Structured report (JSON + human-readable), cross-country comparison table, audit summary |

**Rules:**
- Only include `verified` or `needs_review` (human-approved) evidence in final reports.
- Every record must show: country, document, source URL, clause reference, original excerpt, pillar label, rationale, confidence.
- Flag evidence gaps (jurisdictions without coverage, pillars without clauses).
- Reports must be exportable as structured data (JSON) and human-readable format.
- Include an audit summary showing pipeline provenance for each evidence record.

---

## Error handling

| Failure mode | Response |
| ------------ | -------- |
| Document unretrievable (404, blocked) | Log AuditTrace, skip document, continue with other candidates |
| OCR failure (partial or complete) | Flag document for manual review, continue with extractable pages |
| Low-confidence mapping (< 0.5) | Flag `needs_human_review`, do not include in auto-generated reports |
| Citation mismatch during verification | Mark mapping `disputed`, log details in AuditTrace |
| Rate limit from search/OCR provider | Retry with exponential backoff per [integrations.md](./integrations.md) |

---

## Concurrency

Each jurisdiction can be processed independently through the full pipeline. Within a jurisdiction, stages are sequential (discover → retrieve → parse → extract → map → verify). The report stage runs after all jurisdictions complete their verify stage.

```
Jurisdiction A: discover → retrieve → parse → extract → map → verify ─┐
Jurisdiction B: discover → retrieve → parse → extract → map → verify ─┤→ report
Jurisdiction C: discover → retrieve → parse → extract → map → verify ─┘
```
