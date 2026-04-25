# Normalization examples

How **provider payloads** become Cockpit domain objects: **LegalDocument**, **Clause**, **PillarMapping**, **EvidenceRecord**, and **AuditTrace**. Patterns by **provider type**; values are **placeholders** — use stable ids, hashes, and policy-approved retention in production.

**Normative field definitions:** [entities.md](./entities.md). **Adapter rules:** [integrations.md](./integrations.md). **Pipeline stages:** [evidence-pipeline.md](./evidence-pipeline.md). **Pillar definitions:** [rdtii-pillars.md](./rdtii-pillars.md).

---

## Object types used in these examples

| Type | Role in normalization |
| ---- | -------------------- |
| **Jurisdiction** | Country or territory being analyzed. |
| **LegalDocument** | Official legal text retrieved from a source. |
| **Clause** | Discrete legal provision extracted from a document. |
| **PillarMapping** | Assignment of a clause to an RDTII pillar with rationale. |
| **EvidenceRecord** | Denormalized audit-ready record for reporting. |
| **AuditTrace** | Immutable log of a pipeline action. |

---

## End-to-end sketch (one jurisdiction analysis)

| Step | Pipeline stage | Domain object | Notes |
| ---- | -------------- | ------------- | ----- |
| 1 | Discover | **Jurisdiction** | `iso3166: "SG"`, `regulatoryBody: "PDPC"` |
| 2 | Discover | Search results | Tavily returns candidate URLs for Singapore data protection laws |
| 3 | Retrieve | **LegalDocument** | `title: "Personal Data Protection Act 2012"`, `sourceUrl`, `contentHash` |
| 4 | Parse | Segmented text | Articles, sections, paragraphs with page references |
| 5 | Extract | **Clause** | `articleNumber: "Section 26"`, `originalExcerpt` = verbatim text, `clauseType: "obligation"` |
| 6 | Map | **PillarMapping** | `pillar: "pillar_6"`, `confidence: 0.94`, `mappingRationale` |
| 7 | Verify | Updated **PillarMapping** | `status: "verified"`, verifier confirms citation accuracy |
| 8 | Report | **EvidenceRecord** | Denormalized view combining all fields for export |
| 9 | All stages | **AuditTrace** | Entries at each transition (retrieved, extracted, mapped, verified) |

---

## Web search results (Tavily / discovery)

**Situation:** Tavily search returns ranked URLs + snippets for "Singapore data protection cross-border transfer".

1. **Jurisdiction** (if new): `iso3166: "SG"`, `name: "Singapore"`, `regulatoryBody: "Personal Data Protection Commission"`.
2. Each search result is a **candidate document** — not yet a LegalDocument until retrieved and validated.
3. **AuditTrace:** `action: "document.discovered"`, `resourceType: "legal_document"`, metadata includes search query and result rank.

Treat search snippets as **untrusted** until the full document is retrieved and parsed; see [tavily-cockpit-adaptation.md](../../docs/tavily-cockpit-adaptation.md).

---

## PDF retrieval (gazette / regulator website)

**Situation:** Discovery found a PDF URL for the Kenya Data Protection Act 2019 on kenyalaw.org.

1. **LegalDocument:** `title: "Data Protection Act 2019"`, `jurisdictionId` → Kenya, `sourceType: "legal_portal"`, `documentType: "act"`, `language: "en"`, `sourceUrl`, `contentHash` = hash of raw PDF bytes.
2. Store raw PDF in object storage; record path in `rawStoragePath`.
3. Detect if PDF is image-based → set `ocrApplied: true` when OCR runs in the Parse stage.
4. **AuditTrace:** `action: "document.retrieved"`, `resourceType: "legal_document"`, metadata includes source URL and retrieval method.

---

## OCR output (scanned legal document)

**Situation:** Parser applies OCR to a scanned PDF of Nigeria's NDPA 2023.

1. OCR output preserves: headings, article numbering ("Section 43(1)"), footnotes, page references.
2. **Do not** paraphrase or summarize — store raw OCR text as intermediate artifact.
3. Segment into articles/sections for the Extract stage.
4. If OCR is partial (some pages unreadable), flag in **AuditTrace:** `action: "document.ocr_partial"`, metadata includes unreadable page numbers.

---

## Clause extraction (legal text → Clause)

**Situation:** Parser output for Singapore PDPA contains "Section 26 — Transfer limitation obligation".

1. **Clause:** `legalDocumentId` → the PDPA LegalDocument, `articleNumber: "Section 26"`, `pageNumber: 15`.
2. `originalExcerpt`: verbatim text — "An organisation shall not transfer any personal data to a country or territory outside Singapore except in accordance with requirements prescribed under this Act."
3. `clauseType: "obligation"`, `subjectMatter: ["data_transfer", "cross_border"]`.
4. If document is non-English, `translatedExcerpt` holds the English translation; `originalExcerpt` stays in the source language.
5. **AuditTrace:** `action: "clause.extracted"`, `resourceType: "clause"`, agent id of the extractor.

---

## Pillar mapping (Clause → PillarMapping)

**Situation:** Clause from Section 26 PDPA needs pillar assignment.

1. **PillarMapping:** `clauseId` → the Section 26 Clause, `pillar: "pillar_6"`, `subIndicator: "6.1"`.
2. `mappingRationale`: "This clause imposes a cross-border data transfer restriction, requiring compliance with prescribed safeguards before personal data leaves Singapore. This directly maps to Pillar 6.1 (data transfer restrictions)."
3. `confidence: 0.94` — high confidence because the clause explicitly uses "transfer" + "outside Singapore".
4. `status: "auto_mapped"` — awaiting verification.
5. **AuditTrace:** `action: "mapping.created"`, `resourceType: "pillar_mapping"`.

**Low-confidence example:** A clause about "data processing purposes" might be relevant to Pillar 7 but uses generic language.
- `confidence: 0.62` → automatically flagged `needs_human_review`.
- `status: "auto_mapped"`, `flags: ["needs_human_review", "ambiguous"]`.

---

## Cross-pillar clause

**Situation:** Kenya DPA Section 48 covers both cross-border transfer conditions (Pillar 6) and consent requirements (Pillar 7).

1. Create **two** PillarMapping records:
   - Pillar 6: `subIndicator: "6.1"`, `mappingRationale` focuses on transfer restriction aspect, `flags: ["cross_pillar"]`.
   - Pillar 7: `subIndicator: "7.2"`, `mappingRationale` focuses on consent/lawful processing aspect, `flags: ["cross_pillar"]`.
2. Both reference the same `clauseId`.

---

## Citation verification

**Situation:** Verifier checks Section 26 PDPA mapping.

1. Re-fetch source document (or use cached copy), locate Section 26 text.
2. Compare `originalExcerpt` against source text — must match verbatim.
3. If match: `status` → `"verified"`, `verifiedBy` = verifier agent id, `verifiedAt` = now.
4. If mismatch: `status` → `"disputed"`, log rejection reason in AuditTrace.
5. **AuditTrace:** `action: "mapping.verified"` or `action: "mapping.disputed"`, `resourceType: "pillar_mapping"`, before/after status.

---

## Evidence record assembly (report stage)

**Situation:** All verified mappings for Singapore are assembled into EvidenceRecords.

1. **EvidenceRecord:** denormalized from Jurisdiction + LegalDocument + Clause + PillarMapping.
2. Fields: `country: "Singapore"`, `documentTitle: "Personal Data Protection Act 2012"`, `sourceUrl`, `pageNumber: 15`, `articleSection: "Section 26"`, `originalExcerpt`, `pillar: "pillar_6"`, `mappingRationale`, `confidence: 0.94`, `status: "verified"`.
3. Only `verified` or human-approved `needs_review` records appear in final reports.

---

## Supabase Storage (S3-compatible)

**Situation:** Source PDF stored in a bucket; UI needs a reference.

1. Store **pointer** (bucket + key or presigned URL policy) on **LegalDocument** (`rawStoragePath`), not the secret key.
2. **LegalDocument** remains tied to **Jurisdiction** and pipeline provenance via app logic.

---

## AuditTrace (examples)

**Document retrieved (discovery agent):**

- `action`: `document.retrieved`
- `resourceType`: `legal_document`, `resourceId`: document id
- `metadata`: `{ "sourceUrl": "https://...", "method": "tavily_search" }`

**Clause extracted (legal mapper agent):**

- `action`: `clause.extracted`
- `resourceType`: `clause`, `resourceId`: clause id
- `metadata`: `{ "articleNumber": "Section 26", "clauseType": "obligation" }`

**Mapping verified (verifier agent):**

- `action`: `mapping.verified`
- `resourceType`: `pillar_mapping`
- `before`: `{ "status": "auto_mapped" }`, `after`: `{ "status": "verified" }`

**Mapping disputed (verifier agent):**

- `action`: `mapping.disputed`
- `resourceType`: `pillar_mapping`
- `metadata`: `{ "reason": "Excerpt does not match source document text at Section 26" }`

See [rbac-audit.md](./rbac-audit.md) and [entities.md](./entities.md) (**AuditTrace**).

---

## Anti-patterns

- **Clause** without `originalExcerpt` (verbatim text must always be present).
- **PillarMapping** without `mappingRationale` (every mapping needs justification).
- **PillarMapping** with confidence < 0.7 not flagged `needs_human_review`.
- **LegalDocument** without `contentHash` (dedup requires it).
- **Provider search snippets** used as `originalExcerpt` (must use text from the actual retrieved document).
- **Translated text** stored in `originalExcerpt` (translations go in `translatedExcerpt` only).
