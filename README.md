# Cockpit

AI-powered digital trade regulatory intelligence — built for the [UN ESCAP Global Hackathon on Using AI for Digital Trade Regulatory Analysis 2026](https://www.unescap.org/events/2026/global-hackathon-using-ai-digital-trade-regulatory-analysis).

## Mission

Digital trade regulations are fragmented across hundreds of jurisdictions, written in multiple languages, and updated continuously. Analysts and policymakers who need to compare regulatory environments — for trade negotiations, compliance, or investment decisions — spend weeks manually reading statutes and mapping clauses to frameworks.

Cockpit automates this. Given a jurisdiction and a target policy area, Cockpit's AI agent pipeline discovers official legal documents, extracts relevant clauses, maps them to the [RDTII 2.1 framework](https://www.unescap.org/projects/rcdtra/coverage), verifies citations against source text, and produces audit-ready evidence records — in minutes, not weeks.

The initial focus is on **Pillar 6** (Cross-Border Data Policies) and **Pillar 7** (Domestic Data Protection & Privacy), with the architecture designed to extend across all 12 RDTII pillars.

## RDTII Framework

The [Regional Digital Trade Integration Index (RDTII) 2.1](https://www.unescap.org/projects/rcdtra) defines 12 policy pillars across three clusters. Cockpit maps extracted legal clauses to these pillars with confidence scores and sub-indicator assignments.

### Traditional Trade Policy

| Pillar | Name | Description |
|--------|------|-------------|
| 1 | Tariffs and Trade Defense on ICT Imports | Tariffs, trade defense measures, WTO ITA signatories |
| 10 | Non-Tariff Measures on ICT Goods & Digital Services | Non-technical NTMs on imported/exported ICT goods and digital services |
| 11 | Technical Standards and Procedures | Regulatory transparency, international standards adoption, encryption, self-certification |

### Digital Governance

| Pillar | Name | Description |
|--------|------|-------------|
| **6** | **Cross-Border Data Policies** ✦ | Cross-border data transfer rules, data localization requirements, adequacy mechanisms |
| **7** | **Domestic Data Protection & Privacy** ✦ | Personal data protection frameworks, data subject rights, DPA authority, breach notification |
| 8 | Internet Intermediary Liability | Safe harbour regimes, monitoring obligations, intermediary liability rules |
| 9 | Accessing Commercial Content | Blocking, filtering, and licensing restrictions on online commercial content |
| 12 | Online Sales and Transactions | E-commerce regulations, online payment restrictions, consumer protection frameworks |

### Other Domestic Regulations

| Pillar | Name | Description |
|--------|------|-------------|
| 2 | Public Procurement of ICT Goods & Services | Discrimination in procurement, WTO GPA participation |
| 3 | Foreign Direct Investment in Digital Sectors | FDI rules for computer services, online broadcasting, investment screening |
| 4 | Intellectual Property Rights | Patents, copyrights, trade secrets in the digital economy, WIPO treaty participation |
| 5 | Telecommunications Regulations & Competition | Telecom liberalization, anticompetitive practices, WTO Telecom Reference Paper |

✦ Current implementation focus.

## How it works

```
Discover → Retrieve → Parse (OCR) → Extract clauses → Map to RDTII → Verify citations → Report
```

1. **Discover** — Web search for official statutes, regulations, and gazettes by jurisdiction
2. **Retrieve** — Fetch and store legal documents (PDF, HTML, scanned)
3. **Parse** — OCR extraction for image-based or scanned documents
4. **Extract** — AI clause extraction targeting specific RDTII pillars
5. **Map** — Assign clauses to pillar sub-indicators with confidence scores (0–1)
6. **Verify** — Citation verifier confirms excerpts match source text verbatim
7. **Report** — Structured EvidenceRecords with full audit traces, ready for cross-jurisdiction comparison

All evidence is traceable: `LegalDocument → Clause → PillarMapping → EvidenceRecord → AuditTrace`.

## Hackathon

**Event:** UN ESCAP Global Hackathon on Using AI for Digital Trade Regulatory Analysis  
**Period:** 1 April – 31 October 2026 | Bangkok, Thailand  
**Application deadline:** 31 May 2026  
**Apply:** [eng.kmitl.ac.th/digitaltradehack2026](https://www.eng.kmitl.ac.th/digitaltradehack2026/) · [Application form](https://www.jotform.com/form/260591342899065)  
**Contact:** [trade@un.org](mailto:trade@un.org)

## Tech stack

- **Frontend:** Vite 6, React 19, TypeScript, React Router 7, Tailwind CSS
- **AI:** Anthropic Claude (agent pipeline via LangChain)
- **Search:** Tavily API (legal document discovery)
- **Backend:** Hono API, Supabase (auth, database, storage)

## Getting started

```bash
cp frontend/.env.example frontend/.env
npm install --prefix frontend
npm run dev
```

Dev server: [http://localhost:5173](http://localhost:5173)

Optional API: `npm run dev:api` → [http://localhost:8787/health](http://localhost:8787/health), [http://localhost:8787/v1/dashboard](http://localhost:8787/v1/dashboard)

Agents dry-run (no LLM call): `npm run task-packet:dry-run`

### Environment

See `frontend/.env.example` — `VITE_SITE_URL`, Supabase vars, and `ANTHROPIC_API_KEY` / `TAVILY_API_KEY` for the agent pipeline.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Dev server with HMR (`frontend`) |
| `npm run dev:api` | Minimal Hono API (`services/api`) |
| `npm run build` | Production build to `frontend/dist` |
| `npm run preview` | Preview production build locally |
| `npm run typecheck:agents` | Typecheck `services/agents` |
| `npm run typecheck:api` | Typecheck `services/api` |
| `npm run task-packet:dry-run` | Validate task packet + load context (no Anthropic call) |

## Notes

- Do not commit real `.env` secrets; use `.env.example` as a template.
- RDTII pillar definitions and sub-indicators: [`context/domain/rdtii-pillars.md`](context/domain/rdtii-pillars.md)
- Domain entities (LegalDocument, Clause, PillarMapping, EvidenceRecord): [`context/domain/entities.md`](context/domain/entities.md)
- Agent pipeline and tool stubs: [`services/agents/`](services/agents/)
- Technical integration notes: [`docs/README.md`](docs/README.md)
- Context pack index for agents and contributors: [`context/index.md`](context/index.md)
