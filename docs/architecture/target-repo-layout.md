# Target Cockpit monorepo layout (context + agents + services)

**Status:** Design target for a **future** unified repository that bakes **context engineering**, **multi-agent** workflows, and **regulation intelligence / RDTII evidence extraction** into a concrete structure. It does not describe the [current tree](#mapping-to-the-repository-today) (marketing `frontend/`, `docs/`, vendored `backend/deepagentsjs/`).

The layout follows curated, reusable prompts and rules (Anthropic [Effective context engineering for AI agents](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)) and the rules/skills/tools pattern for coding agents (Martin Fowler, [Context engineering for coding agents](https://martinfowler.com/articles/exploring-gen-ai/context-engineering-coding-agents.html)).

## Goals

| Area | Role |
| ---- | ---- |
| `context/` | Checked-in prompts, rules, domain truth, playbooks, templates — the reusable "skills and rules" layer for humans and agents. |
| `services/agents/` | Cockpit AI layer: DeepAgents supervisor, LangGraph graph, typed `taskPacket` / plan / validation, regulation tools. |
| `services/discovery/` | Web search and document discovery — finds official legal sources by jurisdiction and topic. |
| `services/parser/` | Document retrieval, OCR, text extraction, and structural segmentation (articles, sections, paragraphs). |
| `services/legal-mapper/` | Clause extraction, RDTII pillar mapping, confidence scoring, and evidence normalization. |
| `services/verifier/` | Citation verification, mapping quality checks, ambiguity flagging, and human-review routing. |
| `packages/shared-types/` | Canonical DTOs and event contracts so agents do not invent divergent types. |

## Repository tree (target)

```text
cockpit/
├── apps/
│   └── web/
│       ├── src/
│       │   ├── pages/
│       │   │   ├── dashboard/              # Evidence overview, KPIs, recent activity
│       │   │   ├── evidence/               # Evidence records browser with filters
│       │   │   ├── documents/              # Legal document viewer with clause highlights
│       │   │   ├── mappings/               # Pillar mapping table with audit trace
│       │   │   ├── jurisdictions/          # Country-by-country analysis view
│       │   │   └── reports/                # Evidence pack export and report builder
│       │   ├── components/
│       │   │   ├── clause-viewer/          # Side-by-side source text + interpretation
│       │   │   ├── pillar-badge/           # Pillar 6/7 indicator with confidence
│       │   │   ├── evidence-table/         # Sortable, filterable evidence grid
│       │   │   ├── audit-trail/            # Provenance chain visualization
│       │   │   └── document-inspector/     # PDF/OCR viewer with article anchors
│       │   ├── hooks/
│       │   │   ├── useEvidence.ts
│       │   │   ├── useDocuments.ts
│       │   │   ├── useMappings.ts
│       │   │   └── useJurisdictions.ts
│       │   └── lib/
│       │       └── cockpitClient.ts        # API to services/agents + services/legal-mapper
│       └── public/
│           └── assets/
│               └── icons/
│
├── services/
│   ├── gateway/                            # Auth, RBAC, webhooks, rate-limiting
│   │   ├── src/
│   │   │   ├── auth/
│   │   │   ├── rbac/
│   │   │   ├── webhooks/
│   │   │   └── index.ts
│   │   └── docker-compose.yml
│   │
│   ├── discovery/                          # Legal document discovery and search
│   │   ├── src/
│   │   │   ├── searchers/
│   │   │   │   ├── tavily/                 # Tavily-based web search for legal sources
│   │   │   │   ├── gazette/               # Official gazette crawlers
│   │   │   │   └── regulator/             # Regulator website monitors
│   │   │   ├── classifiers/
│   │   │   │   ├── jurisdictionClassifier.ts
│   │   │   │   ├── documentTypeClassifier.ts
│   │   │   │   └── languageDetector.ts
│   │   │   └── index.ts                    # Discovery orchestrator
│   │   └── docker-compose.yml
│   │
│   ├── parser/                             # Document retrieval, OCR, text extraction
│   │   ├── src/
│   │   │   ├── retrievers/
│   │   │   │   ├── pdfRetriever.ts        # PDF download + text extraction
│   │   │   │   ├── htmlRetriever.ts       # HTML page extraction
│   │   │   │   └── imageRetriever.ts      # Image-based document handling
│   │   │   ├── ocr/
│   │   │   │   ├── tesseract.ts           # Tesseract OCR adapter
│   │   │   │   ├── paddleocr.ts           # PaddleOCR adapter
│   │   │   │   └── cloudOcr.ts            # Cloud OCR fallback (Google Vision, etc.)
│   │   │   ├── segmenters/
│   │   │   │   ├── articleSegmenter.ts    # Split text into articles/sections
│   │   │   │   ├── footnoteExtractor.ts   # Extract footnotes and references
│   │   │   │   └── headingDetector.ts     # Detect structural headings
│   │   │   └── index.ts                    # Parser orchestrator
│   │   └── docker-compose.yml
│   │
│   ├── legal-mapper/                       # Clause extraction and pillar mapping
│   │   ├── src/
│   │   │   ├── extraction/
│   │   │   │   ├── clauseExtractor.ts     # Extract relevant clauses from text
│   │   │   │   └── clauseNormalizer.ts    # Normalize to evidence schema
│   │   │   ├── mapping/
│   │   │   │   ├── pillarMapper.ts        # Map clauses to RDTII Pillar 6/7
│   │   │   │   ├── subIndicatorMatcher.ts # Match to specific sub-indicators
│   │   │   │   └── confidenceScorer.ts    # Compute mapping confidence
│   │   │   ├── schemas/
│   │   │   │   └── evidenceSchema.ts      # Normalized evidence record shape
│   │   │   └── index.ts
│   │   └── docker-compose.yml
│   │
│   ├── verifier/                           # Citation verification and quality checks
│   │   ├── src/
│   │   │   ├── checks/
│   │   │   │   ├── citationChecker.ts     # Verify clause text against source
│   │   │   │   ├── mappingValidator.ts    # Validate pillar assignment logic
│   │   │   │   └── ambiguityDetector.ts   # Flag ambiguous or low-confidence mappings
│   │   │   ├── review/
│   │   │   │   ├── humanReviewRouter.ts   # Route flagged items for human review
│   │   │   │   └── auditLogger.ts         # Log verification decisions
│   │   │   └── index.ts
│   │   └── docker-compose.yml
│   │
│   ├── agents/                             # Cockpit's AI agent layer
│   │   ├── src/
│   │   │   ├── cockpitAgent.ts            # DeepAgents supervisor (regulation intelligence)
│   │   │   ├── context/
│   │   │   │   ├── registry.ts
│   │   │   │   ├── loaders.ts
│   │   │   │   ├── schemas.ts             # taskPacket, plan, validation
│   │   │   │   └── prompts.ts
│   │   │   ├── graph/
│   │   │   │   ├── state.ts              # LangGraph StateSchema
│   │   │   │   ├── nodes.ts             # discovery, parser, mapper, verifier, reporter
│   │   │   │   ├── routes.ts
│   │   │   │   └── index.ts             # compiled regulationGraph
│   │   │   ├── tools/
│   │   │   │   ├── webSearch.ts
│   │   │   │   ├── documentFetch.ts
│   │   │   │   ├── ocrExtract.ts
│   │   │   │   ├── clauseExtractor.ts
│   │   │   │   ├── pillarMapper.ts
│   │   │   │   └── citationVerifier.ts
│   │   │   └── index.ts
│   │   └── docker-compose.yml
│   │
│   ├── audit/                              # Audit trace ingestion, storage, views
│   │   ├── src/
│   │   │   ├── ingestion/
│   │   │   │   └── index.ts              # AuditTraceService
│   │   │   ├── storage/
│   │   │   │   └── index.ts
│   │   │   ├── views/
│   │   │   │   └── compliance.ts         # Evidence chain compliance views
│   │   │   └── index.ts
│   │   └── docker-compose.yml
│   │
│   └── api/                                # BFF / REST API
│       ├── src/
│       │   └── index.ts                   # Hono app: /health, /v1/evidence, /v1/jurisdictions
│       └── docker-compose.yml
│
├── packages/
│   ├── shared-types/                       # Shared DTOs, events, contracts
│   │   ├── src/
│   │   │   ├── jurisdiction.ts
│   │   │   ├── legalDocument.ts
│   │   │   ├── clause.ts
│   │   │   ├── pillarMapping.ts
│   │   │   ├── evidenceRecord.ts
│   │   │   ├── auditTrace.ts
│   │   │   ├── contracts.ts              # event contracts: ClauseExtracted, MappingVerified, etc.
│   │   │   └── index.ts
│   │   └── package.json
│   │
│   ├── shared-config/                      # Shared config, constants, env, feature flags
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   └── featureFlags.ts
│   │   └── package.json
│   │
│   └── shared-logger/                      # Unified logging, tracing, telemetry
│       ├── src/
│       │   └── index.ts
│       └── package.json
│
├── context/                                # Cockpit-specific context layer
│   ├── rules/
│   │   ├── global.md                      # Product identity, pipeline, non-negotiables
│   │   ├── security.md
│   │   ├── testing.md
│   │   └── typescript.md
│   │
│   ├── architecture/
│   │   ├── monorepo-map.md
│   │   ├── service-boundaries.md
│   │   └── data-flow.md
│   │
│   ├── domain/
│   │   ├── entities.md                    # Jurisdiction, LegalDocument, Clause, PillarMapping, EvidenceRecord, AuditTrace
│   │   ├── rdtii-pillars.md              # Pillar 6 & 7 definitions, sub-indicators
│   │   ├── evidence-pipeline.md          # Pipeline stages and agent responsibilities
│   │   ├── rbac-audit.md
│   │   └── integrations.md
│   │
│   ├── playbooks/
│   │   ├── add-jurisdiction.md
│   │   ├── add-document-source.md
│   │   ├── modify-pillar-mapping.md
│   │   ├── add-dashboard-page.md
│   │   ├── add-ocr-provider.md
│   │   └── evidence-review-workflow.md
│   │
│   └── templates/
│       ├── task-packet.md
│       ├── implementation-plan.md
│       └── verification-checklist.md
│
├── .envrc
├── package.json
├── tsconfig.json
├── docker-compose.yml
└── README.md
```

## How this ties to context engineering

- **`context/`** — Reusable, versioned rules, domain truth, playbooks, and templates (the skills/rules library agents load just-in-time).
- **`services/agents/`** — DeepAgents + LangGraph with `taskPacket`, `plan`, `validation` schemas and tool boundaries for regulation intelligence.
- **`packages/shared-types/`** + **`context/domain/`** — Canonical names and contracts to prevent agent-invented types.
- **`services/discovery/`**, **`services/parser/`**, **`services/legal-mapper/`**, **`services/verifier/`** — The regulation intelligence pipeline; agents govern behavior at each stage (search, OCR, extraction, verification, reporting).

## Mapping to the repository today

| Target | Current Cockpit repo |
| ------ | -------------------- |
| `apps/web/` | [`frontend/`](../frontend/) — Vite + React; marketing pages plus a **lazy-loaded product shell** (`/dashboard`, `/alerts`, `/cases`, `/entities`, `/reports`) — placeholders until APIs exist. |
| `services/*`, `packages/*`, repo-root `context/` | Repo-root `context/` is present with regulation intelligence domain model, and `services/api` + `services/agents` exist as lightweight stubs. Most broader pipeline services and `packages/*` remain target architecture. |
| `services/agents/` (Cockpit-specific) | A Cockpit-specific package exists under [`services/agents/`](../../services/agents/) with regulation intelligence agent roles (discovery, parser, legal-mapper, verifier, report-agent), while [`backend/deepagentsjs/`](../../backend/deepagentsjs/) remains vendored upstream Deep Agents JS for reference. |

When the monorepo grows, add **`context/`** at the repo root first so agents and contributors share one canonical layer; keep [`context-engineering-playbook.md`](../context-engineering-playbook.md) aligned with how you load and scope that tree.

## Starter files (in this repo)

- **Root `context/`** — Present: [`context/index.md`](../../context/index.md) (canonical index + load order), `rules/global.md`, `domain/entities.md` (RDTII evidence model), `architecture/monorepo-map.md`, `templates/task-packet.md`.
- **`services/agents/`** — Present on disk: TypeScript context layer + **Deep Agents** entrypoint (`cockpitAgent.ts`, `tools/stubTools.ts`, `runWithTaskPacket.ts`) with regulation intelligence agent roles and tools.

## Diagrams

- Renderable **Mermaid** views (today vs target, evidence pipeline, agents layer): [overview-diagrams.md](./overview-diagrams.md).
- **Reader paths** (how to navigate adapters, agents, and architecture docs): [docs/README.md](../README.md#reader-paths).

## Next steps (optional)

- Keep **`services/agents/`** healthy: run `npm install` / `npm run typecheck` under `services/agents/` after changes; align new tools and routes with the regulation intelligence pipeline.
- Replace **stub tools** with real search/OCR/extraction integrations — **server-side credentials only**; never ship secrets to the browser.
- Expand **`context/domain/*`** as contracts harden; add **`packages/shared-types/`** when the monorepo split lands so UI and services share DTOs.
- **Product UI:** wire `frontend/` product routes to a real **Cockpit API** / BFF and query cache when the pipeline services exist ([overview-diagrams.md](./overview-diagrams.md)).
- **MVP focus:** one-country-to-one-framework mapping with excellent evidence quality, OCR + citation-preserving extraction, transparent audit view showing source excerpt next to mapped pillar.
