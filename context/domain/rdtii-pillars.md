# RDTII Pillar 6 & Pillar 7 — Definitions and mapping criteria

Canonical definitions for the two RDTII pillars targeted by Cockpit's regulation intelligence pipeline. **Do not invent pillar labels or sub-indicators** outside this file; update here when the RDTII framework evolves.

**Source:** ESCAP/UNECA *Regional Digital Trade Integration Index (RDTII) v2.1 Guide* — [dtri.uneca.org](https://dtri.uneca.org/assets/data/publications/ESCAP-2025-MN-RDTII-2.1-guide-en.pdf).

**Related:** [entities.md](./entities.md) (PillarMapping type), [evidence-pipeline.md](./evidence-pipeline.md) (mapping stage), [rules/global.md](../rules/global.md) (pipeline overview).

---

## Pillar 6 — Cross-Border Data Policies

Measures the regulatory environment governing the **transfer of data across national borders**. Covers restrictions, conditions, and enabling mechanisms that affect whether and how data can flow between jurisdictions.

### Scope

Clauses that:
- Restrict or condition **cross-border transfer** of personal or non-personal data
- Require **data localization** (storage or processing within national borders)
- Mandate **adequacy determinations** before transfers to foreign jurisdictions
- Impose **consent requirements** specific to cross-border data movement
- Establish **contractual safeguards** (standard contractual clauses, binding corporate rules)
- Create **exemptions or derogations** for cross-border transfers
- Regulate **government-to-government data sharing** agreements

### Sub-indicators

| ID | Sub-indicator | What to look for |
| -- | ------------- | ---------------- |
| 6.1 | Data transfer restrictions | Laws that prohibit or conditionally restrict sending data abroad |
| 6.2 | Data localization requirements | Mandates to store or process data within national territory |
| 6.3 | Adequacy and safeguard mechanisms | Frameworks for assessing foreign jurisdictions or requiring contractual protections |
| 6.4 | Cross-border consent rules | Consent obligations specific to international data transfers |
| 6.5 | Sectoral transfer exceptions | Sector-specific rules (financial, health, telecom) that modify general transfer rules |

### Mapping signals

A clause maps to Pillar 6 when it:
- Uses language like "transfer," "transmit," "disclose to a foreign," "outside the territory," "cross-border," "localization," "store within"
- References adequacy decisions, standard contractual clauses, or binding corporate rules
- Conditions data movement on government approval or certification
- Exempts certain transfers (e.g., for contract performance, vital interests)

---

## Pillar 7 — Domestic Data Protection & Privacy

Measures the **domestic legal framework** for protecting personal data and privacy rights within a jurisdiction. Covers the rules governing how data controllers and processors collect, use, store, and dispose of personal data.

### Scope

Clauses that:
- Define **personal data** and **sensitive personal data**
- Establish **lawful bases for processing** (consent, legitimate interest, legal obligation, etc.)
- Impose **data retention and deletion** requirements
- Mandate **breach notification** procedures and timelines
- Create or empower a **data protection authority** (DPA)
- Grant **data subject rights** (access, rectification, erasure, portability, objection)
- Require **privacy impact assessments** or data protection impact assessments
- Regulate **government access** to personal data (surveillance, law enforcement)
- Set **penalties and enforcement** mechanisms for non-compliance

### Sub-indicators

| ID | Sub-indicator | What to look for |
| -- | ------------- | ---------------- |
| 7.1 | Personal data definition and scope | How broadly personal data is defined; whether it includes pseudonymous or behavioral data |
| 7.2 | Lawful processing bases | Consent, contract, legal obligation, vital interest, public task, legitimate interest |
| 7.3 | Data subject rights | Access, rectification, erasure, restriction, portability, objection |
| 7.4 | Retention and deletion rules | Maximum retention periods, deletion obligations, archival exceptions |
| 7.5 | Breach notification | Mandatory notification timelines, thresholds, and recipients (DPA, data subjects) |
| 7.6 | DPA authority and independence | Establishment, powers, independence, and enforcement capability of the DPA |
| 7.7 | Government access controls | Rules governing law enforcement and intelligence access to personal data |
| 7.8 | Penalties and enforcement | Fine ranges, criminal penalties, enforcement track record |

### Mapping signals

A clause maps to Pillar 7 when it:
- Uses language like "personal data," "data subject," "controller," "processor," "consent," "retention," "breach," "notification," "access request," "erasure"
- References a data protection authority, commissioner, or supervisory body
- Sets out data handling obligations (collection limitation, purpose limitation, data minimization)
- Defines penalties for non-compliance with data protection rules
- Regulates government surveillance or law enforcement data access

---

## Cross-pillar clauses

Some clauses touch **both** pillars. For example, a consent rule that applies specifically to cross-border transfers has both a Pillar 6 (transfer condition) and Pillar 7 (consent basis) dimension.

**Policy:** When a clause is genuinely cross-pillar:
1. Create **two** PillarMapping records — one for each pillar.
2. Flag both with `cross_pillar` in the `flags` array.
3. The rationale for each mapping should explain the pillar-specific relevance.

---

## Confidence thresholds

| Range | Interpretation | Action |
| ----- | -------------- | ------ |
| 0.9–1.0 | High confidence — clear, unambiguous mapping | Auto-verify |
| 0.7–0.89 | Moderate confidence — likely correct but may benefit from review | Accept, optionally flag |
| 0.5–0.69 | Low confidence — ambiguous or borderline | Flag `needs_human_review` |
| < 0.5 | Very low confidence — likely incorrect or irrelevant | Flag `needs_human_review`, consider `rejected` |

**Rule:** Mappings with confidence < 0.7 **must** be flagged `needs_human_review`. The system should never force a low-confidence label — ambiguous clauses are flagged, not guessed.
