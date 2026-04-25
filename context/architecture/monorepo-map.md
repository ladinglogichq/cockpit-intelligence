# Monorepo map (starter)

This file is a **living stub**. Expand it as services land.

**Canonical target tree:** see [docs/architecture/target-repo-layout.md](../../docs/architecture/target-repo-layout.md). **Diagrams (Mermaid):** [docs/architecture/overview-diagrams.md](../../docs/architecture/overview-diagrams.md). **Full context index (load order, source of truth):** [context/index.md](../index.md).

**This repository today:** marketing app under `frontend/`; integration notes under `docs/`; optional vendored Deep Agents JS under `backend/deepagentsjs/`. Planned `apps/`, `services/*`, and `packages/*` from the target doc are not all present yet.

## Service boundaries (placeholder)

| Area | Responsibility |
| ---- | -------------- |
| `apps/web` (future) / `frontend` (today) | UI, evidence dashboard, clause viewer, audit table |
| `services/gateway` | Auth, RBAC, webhooks, rate limits |
| `services/discovery` | Legal document search and source discovery |
| `services/parser` | Document retrieval, OCR, text extraction, structural segmentation |
| `services/legal-mapper` | Clause extraction, RDTII pillar mapping, confidence scoring |
| `services/verifier` | Citation verification, mapping quality checks, human-review routing |
| `services/agents` | DeepAgents / LangGraph orchestration (regulation intelligence pipeline) |
| `services/audit` | Audit trace ingestion, storage, compliance views |
| `services/api` | BFF / REST API (`/health`, `/v1/evidence`) |

## Event flow (placeholder)

Discovery → document retrieval → OCR/parse → clause extraction → pillar mapping → verification → evidence records → reports → audit traces.
