# Data Sources for RDTII Regulatory Intelligence

Canonical map of external data sources for the Cockpit evidence pipeline. Organized by pipeline stage and RDTII pillar. Agents should prefer sources higher in each list.

**Related:** [rdtii-pillars.md](./rdtii-pillars.md), [evidence-pipeline.md](./evidence-pipeline.md), [integrations.md](./integrations.md)

---

## UN ESCAP / RDTII Primary Sources

Canonical ground-truth sources for framework alignment. Load before any pillar mapping work.

| Source | URL | Use |
|--------|-----|-----|
| RDTII 2.1 Guide | [dtri.uneca.org](https://dtri.uneca.org/assets/data/publications/ESCAP-2025-MN-RDTII-2.1-guide-en.pdf) | Authoritative scoring criteria, sub-indicator definitions, evidence templates for all 12 pillars |
| ESCAP DTRI Initiative | [dtri.uneca.org/escap/home](https://dtri.uneca.org/escap/home) | Country scores, RDTII methodology, existing pillar-mapped regulatory reviews |
| ESCAP ASEAN Review | [dtri.uneca.org](https://dtri.uneca.org/assets/data/publications/ESCAP-2025-RP-Digital-trade-regulatory-review-ASEAN-en.pdf) | Pre-mapped reports for ASEAN; use as few-shot examples for extraction agent |
| ESCAP Asia-Pacific Review | [dtri.uneca.org](https://dtri.uneca.org/assets/data/publications/ESCAP-2025-RP-Digital-trade-regulatory-review-AP-en.pdf) | Pre-mapped reports for Asia-Pacific; use as few-shot examples |
| DTI Database | [cambridge.org](https://www.cambridge.org/core/journals/world-trade-review/article/global-trends-in-digital-trade-policies-and-practices-evidence-from-the-digital-trade-integration-database/F89A800B8C3E2F75E0F9F76C6BC32728) | 146 jurisdictions, 65 regulatory dimensions; strong overlap with RDTII indicators |
| UNCTAD Data Hub | [unctadstat.unctad.org](https://unctadstat.unctad.org) | Trade policy qualitative data, e-commerce legislation tracker, regulatory indicators |
| UNESCAP Library Databases | [unescap.org/library/databases](https://www.unescap.org/library/databases) | Online (open access) | Central repository of UN, ADB, World Bank, WTO, UNCTAD, IMF, OECD databases covering trade, development, and economic indicators |
| UNESCAP Data Explorer | [dataexplorer.unescap.org](https://dataexplorer.unescap.org/) | Online (open access) | Interactive tool for exploring UNESCAP data and visualizations |

---

## Pillar 6 -- Cross-Border Data Policies

Sources targeting data flow rules, localization mandates, and adequacy mechanisms.

| Source | URL | Access | Notes |
|--------|-----|--------|-------|
| **Digital Policy Alert** | [digitalpolicyalert.org](https://digitalpolicyalert.org) | API key (free demo) | Real-time tracker of digital policy interventions; filterable by country and policy area; covers data localization and cross-border flow rules. **Highest priority.** |
| OECD DSTRI | [oecd.org](https://www.oecd.org/en/topics/digital-services-trade-restrictiveness-index.html) | Free download | Catalogues restrictions on digital services trade including data rules; structured by country and sector |
| Global Data Alliance | [globaldataalliance.org](https://globaldataalliance.org/wp-content/uploads/2021/07/03022021gdacrossborderdatapolicyprinciples.pdf) | Free PDF | Compares cross-border data transfer rules across RTAs with clause-level citations |
| UNCTAD Cyberlaw Tracker | [unctad.org/cyberlaw](https://unctad.org/topic/ecommerce-and-digital-economy/ecommerce-law-reform/summary-adoption-e-commerce-legislation-worldwide) | Bulk download | Country-level legislation status for data protection across 195 jurisdictions; no REST API, download CSV |
| CCIA Digital Trade Barriers 2025 | [ccianet.org](https://ccianet.org/wp-content/uploads/2025/10/2025-Digital-Trade-Barriers-in-Asia-the-Pacific.pdf) | Free PDF | Asia-Pacific country breakdown of data localization and transfer restrictions with statutory references |

---

## Pillar 7 -- Domestic Data Protection & Privacy

Sources for DPA legislation, data subject rights, and breach notification laws.

| Source | URL | Access | Notes |
|--------|-----|--------|-------|
| **Digital Policy Alert** | [digitalpolicyalert.org](https://digitalpolicyalert.org) | API key (free demo) | Covers privacy regulations, data security requirements, and enforcement actions. **Highest priority.** |
| IAPP Global Privacy Law Navigator | [iapp.org](https://iapp.org/resources/global-privacy-directory/) | Free | Jurisdiction-by-jurisdiction summaries with statutory links; structured by DPA authority, breach notification, legal basis |
| DLA Piper Data Protection Laws | [dlapiperdataprotection.com](https://dlapiperdataprotection.com) | Free HTML | Structured summaries of national data protection laws with primary legislation links; scrapeable |
| OneTrust DataGuidance | [dataguidance.com](https://www.dataguidance.com) | Free tier | Machine-readable country profiles for 100+ jurisdictions covering consent, data subject rights, DPA contacts |
| Council of Europe CETS 108+ | [coe.int](https://www.coe.int/en/web/conventions/full-list?module=signatures-by-treaty&treatynum=223) | Free | Convention 108+ ratification status per country; key sub-indicator for Pillar 7 scoring |
| GDPR / EUR-Lex | [eur-lex.europa.eu](https://eur-lex.europa.eu) | Free REST API | Full text of GDPR and adequacy decisions; important for jurisdictions claiming EU adequacy as Pillar 6 mechanism |

---

## Official Legal Text Sources (Discover + Retrieve)

Primary statute and gazette sources for the Discover and Retrieve pipeline stages.

| Source | Coverage | Access | Notes |
|--------|----------|--------|-------|
| **pasal.id** | Indonesia (138k regulations) | REST API + token | Pre-structured articles; skip OCR for Indonesian law. Already integrated. |
| CommonLII | Asia-Pacific legislation, case law | Free HTML/PDF | |
| FAOLEX (FAO) | 200+ country legislation | Free, XML export | |
| WIPO Lex | IP laws + digital-related statutes | Free API | `wipolex.wipo.int` |
| World Bank Legal Database | Investment, telecom, ICT legislation | Free | |
| AustLII / PACLII | Pacific/ASEAN region legal texts | Free scrape | |
| EUR-Lex | EU legislation full text | Free REST API | |
| ICT Regulatory Tracker (ITU) | Telecom & ICT laws by country (Pillar 5) | Free download | |

---

## Trade Agreement & Treaty Sources

Critical for Pillars 1, 3, 4, 5, 10, 11 and cross-border transfer mechanism detection (Pillar 6).

| Source | URL | Notes |
|--------|-----|-------|
| WTO RTA Database | [rtais.wto.org](https://rtais.wto.org) | Full text of 350+ RTAs with digital trade chapters; REST API |
| CPTPP / DEPA / DEFA texts | Various | Model digital trade agreement clauses; use as semantic templates for clause classification |
| Asia Foundation DTA Dataset | [asiafoundation.org](https://asiafoundation.org/wp-content/uploads/2024/05/Digital-Trade-Agreements-in-Asia-and-the-Pacific_Tech-Policy.pdf) | Pre-analyzed provisions across Asia-Pacific DTAs; covers data flow, localization, source code protection |
| WTO ITA Participation List | [wto.org](https://www.wto.org) | Pillar 1 ICT tariff commitments; JSON via WTO API |
| UNCTAD Investment Policy Hub | [investmentpolicy.unctad.org](https://investmentpolicy.unctad.org) | FDI screening rules and digital sector restrictions (Pillar 3) |

---

## OCR & Document Parsing

For the Parse stage on scanned legal documents.

| Tool | Notes |
|------|-------|
| Google Cloud Vision OCR / AWS Textract | Handles scanned gazette PDFs, multi-column layouts, and non-Latin scripts (Thai, Khmer, Lao, Myanmar) |
| Adobe PDF Extract API | Preserves document structure (sections, article numbers, tables) critical for citation accuracy |
| `pdfplumber` / `PyMuPDF` | For clean machine-generated PDFs; integrate directly into `services/agents` |

---

## Multilingual Legal Translation

Target jurisdictions span Thai, Indonesian, Vietnamese, Chinese, Japanese, Khmer.

| Tool | Notes |
|------|-------|
| DeepL API | Highest accuracy for legal translation, especially EN/JP and EN/ZH; preserves terminology better than Google Translate |
| Helsinki-NLP OPUS-MT | Open-source multilingual models deployable locally; covers most ASEAN languages |
| ESCAP translations | RDTII reviews include pre-translated summaries; use as terminology anchors to prevent hallucinated legal term translations |

---

## Aggregated Regulatory Intelligence APIs

For enriching EvidenceRecords with comparative context and confidence calibration.

| Source | URL | Notes |
|--------|-----|-------|
| Digital Policy Alert API | [digitalpolicyalert.org/api-access](https://digitalpolicyalert.org/api-access) | Structured policy interventions with dates, jurisdictions, and policy area tags; closest to a real-time feed |
| Global Trade Alert | [globaltradealert.org](https://www.globaltradealert.org) | State interventions affecting trade including digital sector; downloadable CSV/API |
| OECD.Stat API | [stats.oecd.org](https://stats.oecd.org) | DSTRI scores, ICT trade data, broadband penetration for Pillar 5 context |
| World Bank Open Data API | [data.worldbank.org](https://data.worldbank.org) | ICT development indicators, governance scores; useful for confidence scoring calibration |

---

## Pipeline Stage Map

```
Stage           Recommended Sources
----------------------------------------------------------------------
Discover        Tavily + FAOLEX + WTO RTA + WIPO Lex
                Indonesia: pasal.id (already integrated)
Retrieve        CommonLII + EUR-Lex + national gazette scrapers
                Indonesia: pasal.id pasal_fetch tool
Parse (OCR)     Google Vision / Textract + pdfplumber
Extract         RDTII 2.1 Guide (context), ESCAP reviews (few-shot)
Map (Pillar 6)  Digital Policy Alert + OECD DSTRI + GDA Dashboard
Map (Pillar 7)  Digital Policy Alert + IAPP Navigator + DLA Piper
Verify          Source text verbatim match
Report          DTI Database (146-country comparison baseline)
```

**Highest-value additions not yet integrated:**
1. **Digital Policy Alert** -- structured, jurisdiction-tagged, pillar-relevant; covers both Pillar 6 and 7; API available
2. **UNCTAD Cyberlaw Tracker** -- 195-jurisdiction coverage; bulk CSV download; no REST API
