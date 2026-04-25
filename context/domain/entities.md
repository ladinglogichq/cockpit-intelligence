# Cockpit domain entities

Canonical names and fields for Cockpit regulation intelligence objects. **Do not invent synonyms** for these types in code or prompts; update this doc when contracts change.

**Related:** [rdtii-pillars.md](./rdtii-pillars.md) (Pillar 6 & 7 definitions), [evidence-pipeline.md](./evidence-pipeline.md) (pipeline stages), [integrations.md](./integrations.md) (adapter principles), [rbac-audit.md](./rbac-audit.md) (who may change what).

---

## Identifiers and formats

- **id** — Opaque string (UUID or prefixed ULID).
- **timestamps** — ISO 8601 UTC unless otherwise noted.
- **language** — BCP 47 (e.g. `en`, `fr`, `sw`, `zh-CN`).
- **confidence** — 0–1 float; higher = more certain.

---

## Jurisdiction

Country or territory being analyzed. Anchors all documents and evidence.

| Field | Type | Notes |
| ----- | ---- | ----- |
| id | string | |
| name | string | Official country name (English) |
| iso3166 | string | ISO 3166-1 alpha-2 code (e.g. `SG`, `KE`, `NG`) |
| region | string | UN region or RDTII grouping (e.g. `Asia-Pacific`, `East Africa`) |
| primaryLanguages | string[] | BCP 47 codes of official/legal languages |
| regulatoryBody | string | Primary data protection authority name |
| regulatoryBodyUrl | string? | Official website URL |
| status | enum | `active` \| `pending` \| `no_coverage` |

---

## LegalDocument

An official legal text retrieved from a source (gazette, regulator website, legal portal, scanned PDF).

| Field | Type | Notes |
| ----- | ---- | ----- |
| id | string | |
| jurisdictionId | string | FK to Jurisdiction |
| title | string | Official document title (original language) |
| titleTranslated | string? | English translation if original is non-English |
| documentType | enum | `act` \| `regulation` \| `decree` \| `directive` \| `guideline` \| `amendment` \| `treaty` \| `circular` |
| sourceUrl | string | URL where document was retrieved |
| sourceType | enum | `gazette` \| `regulator_website` \| `legal_portal` \| `manual_upload` |
| language | string | BCP 47 of the document |
| publicationDate | date? | Official publication/enactment date |
| effectiveDate | date? | When the law took effect |
| contentHash | string | Hash of raw document for dedup |
| rawStoragePath | string? | Path to original file in object storage |
| ocrApplied | boolean | Whether OCR was used to extract text |
| pageCount | number? | Total pages in source document |
| retrievedAt | datetime | When the system fetched the document |
| retrievedBy | string | Agent id, job id, or `system` |

**Invariant:** Every LegalDocument references a **Jurisdiction**.

---

## Clause

A discrete legal provision extracted from a LegalDocument. The atomic unit of evidence.

| Field | Type | Notes |
| ----- | ---- | ----- |
| id | string | |
| legalDocumentId | string | FK to LegalDocument |
| articleNumber | string | Article, section, or paragraph reference (e.g. `Section 26`, `Art. 45(1)`) |
| subdivision | string? | Sub-article, paragraph, or clause identifier |
| pageNumber | number? | Page in source document where clause appears |
| originalExcerpt | string | Verbatim text from the source document |
| translatedExcerpt | string? | English translation if original is non-English |
| clauseType | enum | `rule` \| `obligation` \| `prohibition` \| `exception` \| `definition` \| `scope` \| `penalty` |
| subjectMatter | string[] | Controlled tags: `data_transfer`, `data_localization`, `consent`, `retention`, `government_access`, `breach_notification`, `dpa_authority`, `cross_border`, `exemption`, `processing_basis` |
| extractedAt | datetime | |
| extractedBy | string | Agent id that performed extraction |

**Invariant:** Every Clause references a **LegalDocument**. The `originalExcerpt` must be verbatim source text, never paraphrased.

---

## PillarMapping

Assignment of a Clause to an RDTII pillar with rationale.

| Field | Type | Notes |
| ----- | ---- | ----- |
| id | string | |
| clauseId | string | FK to Clause |
| pillar | enum | `pillar_6` \| `pillar_7` |
| subIndicator | string? | Specific RDTII sub-indicator (e.g. `6.1`, `6.2`, `7.3`) |
| mappingRationale | string | 1–3 sentence explanation of why the clause maps to this pillar |
| confidence | number | 0–1 |
| status | enum | `auto_mapped` \| `verified` \| `disputed` \| `rejected` |
| verifiedBy | string? | Agent or human reviewer id |
| verifiedAt | datetime? | |
| flags | string[] | e.g. `ambiguous`, `needs_human_review`, `cross_pillar`, `low_confidence` |

**Invariant:** Every PillarMapping references a **Clause**. Mappings with confidence < 0.7 should be flagged `needs_human_review`.

---

## EvidenceRecord

A complete, audit-ready record combining document, clause, and mapping for reporting. This is the primary output artifact.

| Field | Type | Notes |
| ----- | ---- | ----- |
| id | string | |
| jurisdictionId | string | FK to Jurisdiction |
| legalDocumentId | string | FK to LegalDocument |
| clauseId | string | FK to Clause |
| pillarMappingId | string | FK to PillarMapping |
| country | string | Denormalized jurisdiction name |
| documentTitle | string | Denormalized document title |
| sourceUrl | string | Denormalized source URL |
| pageNumber | number? | Denormalized page reference |
| articleSection | string | Denormalized article/section reference |
| originalExcerpt | string | Denormalized verbatim excerpt |
| translatedExcerpt | string? | Denormalized English translation |
| pillar | enum | `pillar_6` \| `pillar_7` |
| subIndicator | string? | RDTII sub-indicator |
| mappingRationale | string | Why this clause maps to the pillar |
| confidence | number | 0–1 |
| status | enum | `draft` \| `verified` \| `published` \| `retracted` |
| createdAt | datetime | |

**Purpose:** Denormalized view optimized for cross-country comparison tables and evidence export. Assembled from the normalized entities above.

---

## AuditTrace

Immutable log of system actions for compliance and provenance.

| Field | Type | Notes |
| ----- | ---- | ----- |
| id | string | |
| actorId | string | Agent id, user id, or `system` |
| action | string | Stable verb, e.g. `document.retrieved`, `clause.extracted`, `mapping.verified`, `mapping.rejected` |
| resourceType | string | e.g. `legal_document`, `clause`, `pillar_mapping`, `evidence_record` |
| resourceId | string | |
| before | object? | Redacted snapshot of previous state |
| after | object? | Redacted snapshot of new state |
| metadata | object? | Additional context (source URL, confidence delta, rejection reason) |
| timestamp | datetime | |

---

## Cross-cutting rules

1. Provider payloads (search results, raw PDFs, OCR output) are **not** domain objects until **normalized** into LegalDocument/Clause/PillarMapping.
2. All clause excerpts must be **verbatim** from the source. Translation is stored separately in `translatedExcerpt`.
3. Confidence scores below 0.7 trigger automatic `needs_human_review` flagging.
4. The system stores **references and scores**, not legal conclusions. Final legal interpretation is the responsibility of human analysts.
5. Every evidence chain must be traceable: LegalDocument → Clause → PillarMapping → EvidenceRecord, with AuditTrace entries at each transition.
