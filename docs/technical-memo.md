# Technical Memo — Cockpit Intelligence
**Team:** Cockpit Intelligence
**Hackathon:** Global Hackathon Using AI for Digital Trade Regulatory Analysis (UNESCAP / KMITL 2026)

---

## 1. Proposed System Architecture

Cockpit Intelligence is a seven-stage evidence pipeline that transforms raw legal documents into structured, audit-ready RDTII evidence records. Each stage is independently retriable and produces typed outputs consumed by the next stage.

```
Discover → Retrieve → Parse → Extract → Map → Verify → Report
```

**Stage definitions:**

| Stage | What it does | Current status |
|-------|-------------|----------------|
| **Discover** | Tavily web search scoped to target jurisdiction, preferring official government domains (`.gov.*`, `.go.*`). Content-quality check using multilingual legal markers rejects JS-rendered navigation pages. | ✅ Implemented |
| **Retrieve** | `documentFetch` tool fetches PDF and HTML. `pdf-parse` for machine-readable PDFs. Tavily extract fallback for bot-protected portals. pasal.id structured API for Indonesian law. | ✅ Implemented |
| **Parse (OCR)** | Tesseract.js in-process OCR for image-based documents. Accepts URL directly — no external image storage required. Multilingual: English, Bahasa, Thai, Vietnamese, Chinese, Japanese, Korean, Russian. | ✅ Implemented (newly activated) |
| **Extract** | `clauseExtractor` LLM tool with multilingual system prompt. Enforces verbatim excerpts. Classifies clause type (rule, obligation, prohibition, exception, definition, scope, penalty). Long documents split on structural boundaries (Pasal/BAB/Article/Section) to stay within context limits. | ✅ Implemented |
| **Map** | `pillarMapper` LLM tool assigns each clause to Pillar 6 or Pillar 7 with sub-indicator, 1–3 sentence rationale, and confidence score (0–1). Clauses below 0.7 confidence are flagged `needs_human_review`. | ✅ Implemented |
| **Verify** | `citationVerifier` re-fetches the source URL and confirms the verbatim excerpt appears in the original document. Mismatches are flagged `disputed`. Every action produces an `AuditTrace` entry. | ✅ Implemented |
| **Report** | `reportFormatter` tool assembles verified `EvidenceRecord` objects into structured JSON + markdown with cross-jurisdiction coverage gap analysis. | ✅ Implemented (newly activated) |

**Domain entity chain (fully traceable):**
```
LegalDocument → Clause → PillarMapping → EvidenceRecord → AuditTrace
```

**Infrastructure:**
- **Frontend:** React 19 + Vite + TypeScript + Tailwind CSS. Dashboard with real-time SSE streaming of investigation results, rendered as formatted markdown.
- **API:** Hono (Node.js) serving `POST /v1/investigate` as Server-Sent Events. Extracts user JWT from `Authorization` header; persists results to Supabase after agent completes.
- **Agent runtime:** LangChain + OpenAI-compatible client (z.ai / GLM-5.1). Multi-agent orchestrator with five specialized subagents: `discovery`, `parser`, `legal_mapper`, `verifier`, `report_agent`.
- **Database:** Supabase (PostgreSQL) with RLS policies. Tables: `evidence_records`, `mapping_activity`, `profiles`.
- **RDTII baseline data:** 31 country RDTII score files converted from official UNESCAP xlsx datasets, loaded as context for confidence calibration.

---

## 2. Tools, Models, and Methods

**LLM:**
- **Primary:** GLM-5.1 via z.ai (OpenAI-compatible endpoint). Used for clause extraction, pillar mapping, and agent orchestration.
- **Fallback:** Anthropic Claude via z.ai AgentRouter. Used when GLM-5.1 is unavailable.
- Both accessed through a single `ChatOpenAI` LangChain client with configurable `baseURL` — no vendor lock-in.

**Search and retrieval:**
- **Tavily API** — web search (`/search`) and content extraction (`/extract`). The extract endpoint handles JavaScript-rendered pages and bot-protected government portals that block plain `fetch`.
- **pasal.id API** — official Indonesian legal database. Returns pre-structured article objects (Pasal number, heading, content) — bypasses PDF parsing and OCR entirely for Indonesian law.
- **Digital Policy Alert API** — real-time tracker of digital policy interventions across 50+ jurisdictions. Used for Pillar 6/7 regulatory context and AI governance risk assessment.

**Document processing:**
- `pdf-parse` — machine-readable PDF text extraction.
- `tesseract.js` v6 — in-process OCR for image-based documents. No external storage required; accepts URL directly.
- Custom multilingual content-quality check — 16 regex patterns covering legal structural markers in English, Bahasa Indonesia/Melayu, Thai, Vietnamese, Filipino, Khmer, Lao, Burmese, Chinese, Japanese, Korean, and Russian. Rejects JS-rendered navigation pages before they reach the LLM.

**RDTII context:**
- 31 country RDTII score files (official UNESCAP xlsx, converted to markdown) loaded as agent context for confidence calibration and cross-country comparison.
- 7 UNESCAP/UNECA source documents (CPTA, RCDTRA, APTIR 2025, AI Trade Facilitation Initiative, Digital Trade Regulatory Review 2025) fetched live via Tavily and stored as context files.

**Methods:**
- **Source priority ranking:** official gov portals → regional bodies → UN/treaty sites → gazette databases → Tavily extract as last resort. Enforced in `fetchWithFallback`.
- **Targeted slice extraction:** for long documents, text is split on structural boundaries (Pasal/BAB/Article/Section/Chapter markers) and processed in multiple LLM calls, each within the 15k character context limit. Results are merged and deduplicated.
- **Confidence gating:** mappings below 0.7 are flagged `needs_human_review` and excluded from auto-generated reports. The system never forces a label on ambiguous clauses — they receive `disputed` status with an explanation.

---

## 3. Accuracy, Transparency, and Cost-Efficiency

### Accuracy

**Anti-hallucination at three levels:**

1. **Extraction constraint** — The `clauseExtractor` system prompt explicitly prohibits paraphrasing: *"Preserve exact wording in originalExcerpt — do not paraphrase."* The LLM identifies clause boundaries and classifies clause type; it cannot rewrite legal text.

2. **Citation verification** — The `citationVerifier` tool independently re-fetches the source URL and searches for the verbatim excerpt in the retrieved document. If the exact string is not found, the record is flagged `disputed` with the message: *"Excerpt not found verbatim in source document — possible paraphrase or OCR error."* This catches the most common LLM failure mode: producing a correct paraphrase that is not the actual statutory text.

3. **Confidence gating** — Every `PillarMapping` carries a confidence score (0–1). Scores below 0.7 trigger automatic `needs_human_review` flagging. The system never auto-approves low-confidence mappings.

**RDTII baseline calibration** — Extracted evidence is cross-referenced against official UNESCAP RDTII scores for 31 countries. Significant divergence between extracted evidence and baseline scores is surfaced as a flag for human review.

### Transparency

Every `EvidenceRecord` stores a complete audit trail:
- Source URL (official government portal)
- Article/section reference
- Verbatim excerpt (never paraphrased)
- Pillar assignment + sub-indicator
- 1–3 sentence mapping rationale
- Confidence score
- Verification status (`verified` / `disputed` / `needs_human_review`)
- Model name and extraction timestamp

All outputs are human-reviewable. The system explicitly states what it is not allowed to do: it stores references and scores, not legal conclusions. Final legal interpretation is the responsibility of human analysts.

The codebase is fully open source. The pipeline stages, domain entity contracts, and pillar definitions are documented in `context/domain/` and versioned alongside the code.

### Cost-Efficiency

**LLM call minimization:**
- pasal.id API returns pre-structured article text — no LLM call needed for Indonesian document parsing.
- Targeted slice extraction avoids sending the full document to the LLM; only the relevant article range is processed per call.
- `clauseExtractor` is called once per document slice; `pillarMapper` and `citationVerifier` are called once per extracted clause. A typical jurisdiction analysis (8 clauses) costs approximately 8 × 3 = 24 LLM calls.

**Caching:**
- RDTII baseline scores are pre-converted from xlsx to markdown and loaded from disk — no API call per query.
- UNESCAP context documents are scraped once and stored as local markdown files. The `unescap_fetch` tool is used for live refresh only when needed.

**Model selection:**
- GLM-5.1 (z.ai) is used as the primary model — significantly lower cost than GPT-4 or Claude Sonnet for structured extraction tasks, with comparable accuracy on legal clause classification.
- The model is configurable via `ANTHROPIC_MODEL` env var — teams can switch to a cheaper model for bulk processing or a more capable model for ambiguous clauses without code changes.

**Graceful degradation:**
- All external API calls have timeouts and graceful fallbacks. A failed Tavily search does not block the pipeline — the system logs the failure and continues with other jurisdictions.
- The `workspaceHealth` tool pings all dependencies at startup and reports which services are active, allowing operators to identify cost-incurring services before running large batch jobs.

---

*Cockpit Intelligence is open source. Repository: `/home/zidan/Documents/Github/cockpit-intelligence`*
*Contact: [placeholder@email.com]*
