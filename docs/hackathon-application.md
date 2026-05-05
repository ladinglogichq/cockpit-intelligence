# UNESCAP AI Hackathon 2026 — Application Form Answers

**Form:** Global Hackathon Using AI for Digital Trade Regulatory Analysis
**Contact:** escap-digitaltrade-hackathon@un.org · regtech2026@kmitl.ac.th

---

## Team Information

**Participation Type:** Team

**Team Name:** Cockpit Intelligence

**Number of Members:** 2

---

### Member 1 (Primary Contact)

| Field | Value |
|-------|-------|
| Full Name | [PLACEHOLDER FIRST] [PLACEHOLDER LAST] |
| Roles | Technical Lead, Policy Lead |
| Gender | [PLACEHOLDER] |
| Nationality | [PLACEHOLDER] |
| Age | [PLACEHOLDER] |
| Email | [placeholder@email.com] |
| Phone | [+62] [XXXXXXXXXX] |
| Country of Residence | Indonesia |
| Postal Address | [PLACEHOLDER ADDRESS] |
| Affiliation | [PLACEHOLDER INSTITUTION] |
| Affiliation Position | [PLACEHOLDER POSITION] |
| Affiliation Category | Start Up / Independent / Others |

---

### Member 2

| Field | Value |
|-------|-------|
| Full Name | [PLACEHOLDER FIRST] [PLACEHOLDER LAST] |
| Roles | Technical Lead |
| Gender | [PLACEHOLDER] |
| Nationality | [PLACEHOLDER] |
| Age | [PLACEHOLDER] |
| Email | [placeholder2@email.com] |
| Phone | [+XX] [XXXXXXXXXX] |
| Country of Residence | [PLACEHOLDER] |
| Postal Address | [PLACEHOLDER ADDRESS] |
| Affiliation | [PLACEHOLDER INSTITUTION] |
| Affiliation Position | [PLACEHOLDER POSITION] |
| Affiliation Category | Start Up / Independent / Others |

---

## Initial Submission

### Project Title

**Cockpit Intelligence — AI-Powered RDTII Regulatory Evidence Pipeline**

---

### Short Proposal Summary (200 words)

Cockpit Intelligence is an open-source AI agent pipeline that automates discovery, extraction, mapping, and verification of digital trade regulatory evidence across Asia-Pacific jurisdictions, aligned to UNESCAP RDTII 2.1 framework.

The system accepts a jurisdiction and policy target, then executes a seven-stage pipeline: discover official legal documents via web search and government portals, retrieve and parse them, extract relevant clauses using a multilingual LLM, map each clause to RDTII Pillar 6 (Cross-Border Data Policies) or Pillar 7 (Domestic Data Protection & Privacy) with a confidence score, verify citations verbatim against source text, and produce structured EvidenceRecords with full audit traces.

The core pipeline — discovery, retrieval, clause extraction, pillar mapping, and citation verification — is implemented and has been tested across six ASEAN jurisdictions: Singapore, Thailand, Indonesia, Malaysia, Vietnam, and the Philippines. In our current demo run, the pipeline produced 48 evidence records with 100% audit trace completeness and an average confidence of 0.92. All outputs are traceable to official government sources.

Several components remain in active development for the full hackathon period: OCR for image-based scanned PDFs, full report generation agent, and Supabase persistence layer for the web dashboard. The architecture is designed to extend across all 12 RDTII pillars.

---

### Problem Understanding & Objectives (200 words)

Digital trade regulations governing cross-border data flows and domestic data protection are fragmented across hundreds of jurisdictions, written in multiple languages, updated continuously, and scattered across government portals, official gazettes, and legal databases. Analysts and policymakers who need to compare regulatory environments — for example, assessing whether a Singapore-based fintech platform can legally transfer customer data to servers in Thailand, Indonesia, and Vietnam — currently spend weeks manually reading statutes and mapping clauses to frameworks like RDTII.

This manual process is slow, error-prone, and does not scale. It also creates a knowledge gap: smaller economies and civil society actors lack the resources to conduct systematic regulatory analysis, leaving them underrepresented in digital trade policy discussions.

Cockpit Intelligence addresses this by automating core evidence pipeline. Our objectives for this hackathon are:

1. Demonstrate a working end-to-end pipeline from document discovery to verified evidence records across at least six Asia-Pacific jurisdictions.
2. Ensure every extracted clause is traceable to its official source with a verbatim citation.
3. Support multilingual legal text across major ASEAN languages.
4. Produce outputs that are reviewable and auditable by human legal experts — not black-box summaries.
5. Identify and document to remaining gaps (OCR, full report generation, dashboard persistence) as a clear roadmap for the full hackathon period.

---

### Policy Areas

- [x] Pillar 6 — Cross-border Data Policies *(mandatory, implemented)*
- [x] Pillar 7 — Domestic Data Policies *(mandatory, implemented)*
- [x] Pillar 3 — Foreign Direct Investment *(supplementary, partially tested)*
- [x] Pillar 9 — Access to online content *(supplementary, partially tested)*
- [x] Pillar 11 — Technical standards and conformity assessment *(supplementary, partially tested)*

---

### Q1) Linguistic Conflict in PDPA Clause

**Clause A:** *"An organisation shall not transfer any personal data to a country or territory outside Country A..."*
**Clause B:** *"...except in accordance with requirements prescribed under this Act to ensure that organisations provide a standard of protection to personal data so transferred that is comparable to that under this Act."*

#### 1.1) Linguistic conflict between two phrases (max 150 words)

The conflict lies in the tension between an absolute prohibition and a conditional exception. Clause A reads as a categorical ban — "shall not transfer" — which, read in isolation, would prohibit all cross-border transfers unconditionally. Clause B introduces a carve-out: transfers are permitted if they meet a prescribed adequacy standard.

The linguistic ambiguity arises from the phrase "comparable to that under this Act." This is a relative standard, not a defined threshold. "Comparable" could mean substantially equivalent (requiring a formal adequacy determination), functionally equivalent (requiring contractual safeguards), or merely similar in intent (a lower bar). Different interpretations produce materially different compliance obligations for data controllers.

A second conflict is temporal: Clause A uses present tense ("shall not"), while Clause B uses future-conditional framing ("to ensure"). This creates ambiguity about whether the adequacy assessment must precede the transfer or can be established concurrently.

#### 1.2) Which takes precedence and why (max 150 words)

Clause B takes precedence as the operative regulatory standard, because it is the more specific provision. In statutory interpretation, the principle of *lex specialis* holds that a specific rule overrides a general one. Clause A states a general prohibition; Clause B defines the specific conditions under which that prohibition is lifted. The two clauses must be read together as a single conditional rule: transfer is prohibited unless the adequacy standard is met.

The policy rationale is proportionality. An absolute prohibition on cross-border transfers would be incompatible with the operational reality of digital trade — cloud services, payment processing, and e-commerce inherently involve cross-border data flows. The legislature's intent is not to prohibit transfers but to ensure they occur with adequate protection. Clause B operationalises that intent by requiring a comparable standard, which aligns with the RDTII Pillar 6 framework's adequacy mechanism sub-indicator.

#### 1.3) How to programme your AI to make a correct decision (max 150 words)

Our system handles this through a two-stage extraction and mapping pipeline. In the extraction stage, the `clauseExtractor` tool is instructed to preserve verbatim excerpts and identify clause type (rule, obligation, exception, scope). It classifies Clause A as a `prohibition` and Clause B as an `exception` to that prohibition, tagging them with the same article reference.

In the mapping stage, the `pillarMapper` tool receives both clauses together with their types. The system prompt instructs the LLM: when a `prohibition` and an `exception` share the same article reference, treat them as a single conditional rule and map the combined clause to the pillar. The confidence score is computed on the combined clause, not each fragment independently.

If confidence falls below 0.7, the clause is flagged `needs_human_review` rather than auto-mapped. This prevents the system from forcing a low-confidence label on genuinely ambiguous provisions.

---

### Q2) End-to-End Approach (max 250 words)

Our pipeline follows RDTII evidence pipeline stages: collect → extract → classify → explain → cite → export.

**Collect (implemented):** Tavily web search scoped to the target jurisdiction, preferring official government domains (`.gov.sg`, `.go.id`, `.gov.ph`). A content-quality check using multilingual legal markers (English `shall/section`, Bahasa `Pasal/ayat`, Thai `มาตรา`, Vietnamese `Điều`, etc.) rejects JS-rendered navigation pages and triggers a Tavily extract fallback for bot-protected portals. For Indonesia, pasal.id API provides pre-structured article text directly from the official legal database. Machine-readable PDFs are parsed via `pdf-parse`.

**Extract (implemented):** The `clauseExtractor` LLM tool with a multilingual system prompt covering 11 ASEAN and Pacific languages. Long documents are split on structural boundaries and processed in targeted slices to stay within the 15k character context limit while covering the full document.

**Classify (implemented):** Each clause is classified by type (rule, obligation, prohibition, exception, definition, scope, penalty) and assigned to Pillar 6 or Pillar 7 with a sub-indicator and confidence score.

**Explain (implemented):** The `pillarMapper` produces a 1–3 sentence rationale for every mapping citing specific RDTII sub-indicator criteria.

**Cite (implemented):** The `citationVerifier` re-fetches the source URL and confirms the verbatim excerpt matches the original text. For pasal.id sources, the API response itself is the authoritative source.

**Export (partially implemented):** Structured `EvidenceRecord` objects are produced with full audit traces. Supabase persistence and the web dashboard are wired but require environment configuration to activate. OCR for image-based scanned PDFs is architecturally designed but not yet active — it is a priority for the next development phase.

---

### Q3) Data Sources & Scope for Demo (max 250 words)

**Target jurisdictions (6):** Singapore, Thailand, Indonesia, Malaysia, Vietnam, Philippines — covering ASEAN's major digital economies and representing diverse legal traditions and languages.

**Document types currently handled:**

**JS-rendered HTML:** Singapore SSO (`sso.agc.gov.sg`) — handled via Tavily extract which renders JavaScript before returning content

**Machine-readable PDF:** Thailand PDPA 2019, Malaysia PDPA 2010, Vietnam Decree 13/2023, Philippines Data Privacy Act 2012 — fetched and parsed via `pdf-parse`

**Structured API:** Indonesia pasal.id — returns pre-parsed article objects with headings, numbers, and content; bypasses PDF parsing entirely

**Bot-protected pages:** Philippines NPC (`privacy.gov.ph`), Official Gazette — direct fetch returns 403; Tavily extract fallback retrieves full content

**Source priority order enforced in code:**
1. Official government portals (`.gov.*`, `.go.*`)
2. Regional/international bodies (ASEAN, UN)
3. National gazette or statute databases
4. Tavily extract as last resort

**RDTII baseline data:** 31 country RDTII score files converted from official UNESCAP xlsx datasets, covering all 12 pillars. Used for confidence calibration and cross-country comparison in simulation.

**UNESCAP context:** Live content from CPTA, RCDTRA, APTIR 2025, AI Trade Facilitation Initiative, and Digital Trade Regulatory Review 2025 — fetched via Tavily and stored as context files for the agent pipeline.

**Not yet implemented — planned for full hackathon period:**
True OCR for image-based scanned PDFs (Tesseract.js integration is architecturally stubbed in the codebase but requires image storage configuration to activate — this is a planned next step.

---

### Q4) Evidence & Citation Method — Anti-Hallucination (max 250 words)

Every claim in Cockpit's output is anchored to a verbatim excerpt from an official source document. The anti-hallucination architecture operates at three levels, all of which are currently implemented:

**Level 1 — Extraction constraint:** The `clauseExtractor` system prompt explicitly prohibits paraphrasing. The instruction reads: *"Preserve exact wording in originalExcerpt — do not paraphrase."* The LLM is only permitted to identify clause boundaries and classify clause type; it cannot rewrite or summarise legal text.

**Level 2 — Citation verification:** The `citationVerifier` tool independently re-fetches the source URL and checks whether the verbatim excerpt appears in the retrieved document. If the excerpt cannot be located, the record is flagged `disputed` with a rejection reason. For pasal.id sources, the API response itself is the authoritative source, so citation is inherently verified.

**Level 3 — Confidence gating:** Every mapping includes a confidence score (0–1). Clauses with confidence below 0.7 are automatically flagged `needs_human_review` and excluded from auto-mapped outputs. The system never forces a label on ambiguous clauses.

**Audit trace:** Every `EvidenceRecord` stores: source URL, article/section reference, verbatim excerpt, pillar assignment, sub-indicator, rationale, confidence score, verification status, model name, and extraction timestamp. This trace is stored in Supabase and visible in the dashboard.

**Citation format in output:** `[Jurisdiction] [Statute] [Article/Section] — "[verbatim excerpt]" — Source: [URL]`

In the live demo, all 48 evidence records across 6 jurisdictions carry verified citations traceable to official government sources.

**What is not yet implemented:** Persistent storage of audit traces in the web dashboard requires Supabase environment configuration. The audit trace data structure is fully defined and populated in the agent pipeline; the database write layer is wired but not yet activated in the demo environment.

---

### Q5) Source Authority Pipeline (max 250 words)

Given three sources — (1) official HTML regulation page, (2) scanned PDF of an older amendment, (3) ministry guideline that paraphrases the law — our system handles them as follows, describing both current implementation and planned work:

**Step 1 — Authority classification (implemented):** The `fetchWithFallback` function applies a domain-based authority ranking. Official government domains (`.gov.*`, `.go.*`) are ranked highest. The HTML page from the official portal is classified as the primary authoritative source. The scanned PDF is classified as a secondary source. The ministry guideline is classified as non-binding context only.

**Step 2 — Content quality check (implemented):** A multilingual legal marker check confirms that the HTML page contains actual legal text, not a navigation page. If the check fails, the system falls through to the next source in the priority list.

**Step 3 — PDF parsing (implemented for machine-readable PDFs; OCR not yet active):** Machine-readable PDFs are processed via `pdf-parse`. For a scanned PDF of an older amendment, `pdf-parse` will attempt extraction; if the output is garbled or empty, the system falls back to Tavily extract.

**Step 4 — Conflict resolution (implemented):** If the HTML page and the amendment contain conflicting clause text, both are extracted as separate `EvidenceRecord` entries with different source URLs and flagged `disputed`. The ministry guideline text is never used as a primary citation; it may appear as supplementary context only.

**Step 5 — Citation output (implemented):** The final record cites the HTML page as the authoritative source with its URL, article number, and verbatim excerpt.

**Not yet implemented — planned for full hackathon period:**
True image-based OCR (Tesseract.js) is architecturally designed and stubbed in the codebase but requires image storage configuration to activate — this is a planned next step.

---

### Q6) Anti-Hallucination Technical Design (max 250 words)

**What the AI is allowed to do:**
- Identify clause boundaries in legal text using structural markers (article numbers, section headings, paragraph indentation)
- Classify clause type (rule, obligation, prohibition, exception, definition, scope, penalty)
- Assign a pillar label (Pillar 6 or Pillar 7) with a sub-indicator and a 1–3 sentence rationale
- Assign a confidence score based on keyword density and clause clarity
- Flag ambiguous clauses for human review

**What the AI is not allowed to do:**
- Paraphrase, summarise, or rewrite legal text (the `originalExcerpt` must be verbatim)
- Invent article references or source URLs
- Force a pillar assignment when confidence is below 0.7
- Produce a final output without a source URL and article reference

**How every claim is linked to exact evidence (implemented):**
Each `EvidenceRecord` stores: the verbatim excerpt, source URL, article/section reference, and the verification status from the `citationVerifier` tool. The verifier independently re-fetches the source and confirms the excerpt appears in the document. Records that fail verification are marked `disputed`, not silently accepted.

**One concrete failure case that the design catches (implemented and tested):**
The LLM occasionally extracts a clause that is a correct paraphrase of the law but is not verbatim text — for example, combining two sentences from different paragraphs into a single excerpt. The `citationVerifier` catches this: it searches for the exact string in the source document. If the string is not found, the record is flagged `disputed` with the message: *"Excerpt not found verbatim in source document — possible paraphrase or OCR error."* This record is excluded from auto-mapped outputs and queued for human review before being shown to the user.

**What remains in progress:**
The full `report_agent` — which assembles verified records into cross-country comparison tables and exportable JSON reports — is defined in the architecture and its subagent is wired in the orchestrator, but its tool integrations are not yet complete. This is a priority for the next development phase.

---

## Backup Links

*(To be added — YouTube/Drive link for concept video)*

---

## Application Agreement

- [x] I/We have read, understood, and agree to the Intellectual Property and Open Source terms

*(Signed agreement PDF to be uploaded)*

---

*Generated: 2026-05-05 | Team: Cockpit Intelligence | Contact: [placeholder@email.com]*
