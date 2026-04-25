# Domain: integrations

Provider and adapter boundaries for Cockpit regulation intelligence. **Secrets stay server-side**; never put API keys in the marketing `frontend/` bundle.

**Related:** [entities.md](./entities.md) (normalization targets), [evidence-pipeline.md](./evidence-pipeline.md) (pipeline stages), [rbac-audit.md](./rbac-audit.md) (who may trigger integrations).

---

## Adapter implementation path

1. Read **Principles** and **Environment variables** below (patterns only; no secrets in repo).
2. Open the **specific doc** for your provider in [`docs/README.md`](../../docs/README.md) ([Reader paths](../../docs/README.md#reader-paths) → *Implement an adapter*).
3. Map responses into domain types per [entities.md](./entities.md) and the **Normalization checklist** at the bottom of this file.

### Doc map (integrations → `docs/`)

| Topic | Document |
| ----- | -------- |
| Tavily (search / crawl / extract) | [tavily-cockpit-adaptation.md](../../docs/tavily-cockpit-adaptation.md) |
| Supabase: structured evidence / Postgres | [reference-datasets-supabase.md](../../docs/reference-datasets-supabase.md) |
| Supabase Storage (S3-style API) | [supabase-storage-s3.md](../../docs/supabase-storage-s3.md) |
| Agent runtime patterns | [agent-runtime-hermes-adaptation.md](../../docs/agent-runtime-hermes-adaptation.md) |

---

## Principles

1. **Adapters only** — External HTTP calls live in named services (e.g. `services/discovery`, `services/parser`, `services/verifier`), not in UI or ad hoc scripts in production.
2. **Normalize before domain** — Map provider DTOs to **LegalDocument**, **Clause**, **PillarMapping** in this folder; store raw payloads only in artifact or object storage when audit requires retention.
3. **Idempotency** — Ingestion jobs use stable keys (`contentHash`, document URLs) to avoid duplicate evidence records.
4. **Failure handling** — Timeouts, rate limits, and partial responses are **adapter concerns**; surface structured errors to jobs, not raw stack traces to users.

---

## Integration catalog (contract-level)

| Integration | Role | Adapter owner (target layout) | Notes |
| ----------- | ---- | ------------------------------- | ----- |
| **Tavily** (search / extract) | Legal document discovery, web search | `services/discovery` | Tavily-style search for official legal sources; robots/ToS |
| **OCR provider** (Tesseract / PaddleOCR / cloud) | Text extraction from scanned PDFs | `services/parser` | Server-side only; cloud fallback for difficult scans |
| **PDF parser** | Text extraction from digital PDFs | `services/parser` | Layout-aware chunking; preserve article structure |
| **Translation API** (optional) | Translate non-English legal text | `services/parser` or `services/legal-mapper` | Store translations in `translatedExcerpt`; never overwrite original |
| **Object storage** | Source documents, OCR output | Infra layer | Presigned URLs; encryption at rest |
| **Supabase Postgres** | Structured evidence records, jurisdiction data | `services/api` / `services/audit` | Evidence schema tables, audit traces |

Repo-specific notes and links live under [`docs/`](../../docs/README.md) (Tavily, Supabase, etc.).

---

## Environment variables (patterns)

Use **deployment-specific** secret stores in production. Names are illustrative:

| Pattern | Purpose |
| ------- | ------- |
| `TAVILY_API_KEY` | Web search and document discovery |
| `OCR_PROVIDER` | Which OCR backend to use (`tesseract`, `paddleocr`, `google_vision`) |
| `GOOGLE_VISION_API_KEY` | Cloud OCR fallback (if using Google Vision) |
| `TRANSLATION_API_KEY` | Translation service (if using external API) |
| `SUPABASE_URL` / `SUPABASE_SERVICE_KEY` | Database and storage |

Never commit values; document in runbooks, not in repo.

---

## Sync vs async

| Pattern | When |
| ------- | ---- |
| **Sync** | Single-document fetch, clause extraction for interactive review |
| **Async** | Multi-jurisdiction batch analysis, bulk OCR, full pipeline runs — job queue + status |

---

## Error, retry, and rate-limit policy (Cockpit defaults)

Adapters must implement consistent behavior; vendor READMEs describe **what** to call — this section defines **how Cockpit layers should behave** on failure.

| Situation | Expected behavior |
| --------- | ------------------- |
| **Transient network / 5xx** | Retry with **exponential backoff** and **jitter** (e.g. base 200ms, cap 30s, max 3–5 attempts for sync; higher for batch jobs with idempotency keys). |
| **429 / rate limit** | Honor **Retry-After** when present; otherwise backoff; reduce concurrency for bulk jobs; surface **structured** error to job runner (not raw headers to end users). |
| **4xx (client / bad request)** | **Do not** infinite-retry; log request id + redacted params; return a **typed** domain error for the caller. |
| **Timeouts** | Separate **connect** vs **read** timeouts per integration; fail fast on interactive paths; use **async** jobs for large batch OCR/search runs. |
| **Partial responses** | Adapters return **explicit** partial flags or complete failure; downstream stages must not treat half-filled DTOs as full normalization. |
| **Circuit breaking** | After repeated failures to the same dependency, **trip** open for a cooldown window; degrade gracefully (skip enrichment, queue for later). |
| **Document unretrievable** | Log AuditTrace entry with source URL and error; skip document, continue with other candidates. |
| **OCR failure** | Flag document for manual review; continue with extractable pages; log partial extraction in AuditTrace. |

**Logging:** Record integration name, operation, correlation id, and **redacted** error class — never log secrets or full provider bodies in production info logs.

**User-facing surfaces:** Return stable error codes + short messages; raw stack traces stay in server logs.

### Provider-specific retry / error notes (`docs/`)

| Doc | Section |
| ----- | ------- |
| [tavily-cockpit-adaptation.md](../../docs/tavily-cockpit-adaptation.md) | [Cockpit integration: retry, errors, timeouts](../../docs/tavily-cockpit-adaptation.md#cockpit-integration-retry-errors-timeouts) |
| [reference-datasets-supabase.md](../../docs/reference-datasets-supabase.md) | [Cockpit integration: retry, errors, timeouts](../../docs/reference-datasets-supabase.md#cockpit-integration-retry-errors-timeouts) |
| [supabase-storage-s3.md](../../docs/supabase-storage-s3.md) | [Cockpit integration: retry, errors, timeouts](../../docs/supabase-storage-s3.md#cockpit-integration-retry-errors-timeouts) |

---

## Normalization checklist

Before writing domain objects:

- [ ] Map document URLs to **LegalDocument** with `contentHash` for dedup
- [ ] Attach provenance (source URL, retrieval timestamp, agent id) to **Clause** and **PillarMapping**
- [ ] Preserve verbatim clause text in `originalExcerpt` — never paraphrase
- [ ] Store translations separately in `translatedExcerpt`
- [ ] Log pipeline actions as **AuditTrace** entries with appropriate `action` verbs
- [ ] Flag low-confidence mappings (< 0.7) with `needs_human_review`
