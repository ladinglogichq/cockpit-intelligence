# Cockpit — technical notes (`docs/`)

This folder holds **reference material** for future Cockpit integrations: agents, data pipelines, RPC providers, and compliance-adjacent APIs. It is **not** required to build or run the public marketing site.

## Relationship to this repository

- **In this repo:** the Vite + React app under [`frontend/`](../frontend/) (landing, blog, pricing, explore-data, methodology).
- **Not in this repo:** a Node API service, dashboard app, large datasets, or Supabase migrations. Some notes still mention paths like `backend/…` as **examples** for a separate backend repository or deployment—those paths are not present here unless you add them elsewhere.

## Reader paths

| Goal | Where to start |
| ---- | ---------------- |
| **Implement an adapter** (provider clients, env, normalization) | [context/domain/integrations.md](../context/domain/integrations.md) for principles and **env patterns**; per-integration notes in the [Index](#index) below (Dune/Sim, Helius, Tavily, Chainalysis, Supabase, etc.). |
| **Run or extend agents** (task packets, context loading, `services/agents`) | [context-engineering-playbook.md](./context-engineering-playbook.md), [context/templates/task-packet.md](../context/templates/task-packet.md), and [`services/agents/`](../services/agents/README.md). |
| **Explain the system** (today vs target, pipelines, agents layer) | [architecture/overview-diagrams.md](./architecture/overview-diagrams.md) and [architecture/target-repo-layout.md](./architecture/target-repo-layout.md). |
| **Canonical context pack** (source of truth, agent load order, file index) | [context/index.md](../context/index.md) |

## Index

| Document | Topic |
|----------|--------|
| [context/index.md](../context/index.md) | **Canonical index** for `context/`: source-of-truth table, recommended agent load order, per-file “when to use” |
| [context-engineering-playbook.md](./context-engineering-playbook.md) | Cockpit-specific context engineering: prompts, tools, state, subagents, task packets, and repo mapping |
| [architecture/target-repo-layout.md](./architecture/target-repo-layout.md) | **Target** monorepo tree: `context/`, `services/agents|collectors|intel|solana|…`, `apps/web/`, `packages/shared-types` (future; maps from today’s `frontend/`) |
| [architecture/overview-diagrams.md](./architecture/overview-diagrams.md) | **Mermaid** overview: today vs target mapping, intel/case pipeline, agents layer and task-packet sequence, backend→UI data flow (target), realtime SSE/WS sequence, initial load vs mutation (E2/E3), report/export (F), three-panel load/mutate/export summary (G) |
| [architecture/services-agents-context-starter.md](./architecture/services-agents-context-starter.md) | **Starter** `services/agents/`: context loaders, `cockpitAgent` (Deep Agents), stub tools, `runWithTaskPacket`, optional Hono route (sources in doc if TS not on disk) |
| [agent-runtime-hermes-adaptation.md](./agent-runtime-hermes-adaptation.md) | Hermes-style agent loops mapped to a future Cockpit analysis API |
| [chainalysis-sanctions-api.md](./chainalysis-sanctions-api.md) | Chainalysis public Sanctions API (server-side only) |
| [dune-data-stack.md](./dune-data-stack.md) | Dune / Sim / Data API vs warehouse patterns |
| [reference-datasets-supabase.md](./reference-datasets-supabase.md) | Bulk-loading reference datasets into Postgres (Supabase) |
| [rpc-helius-rpcfast-cockpit.md](./rpc-helius-rpcfast-cockpit.md) | Helius + RPC Fast for Solana RPC and streaming |
| [supabase-storage-s3.md](./supabase-storage-s3.md) | Supabase Storage S3-compatible API and auth modes |
| [tavily-cockpit-adaptation.md](./tavily-cockpit-adaptation.md) | Tavily search / crawl / extract for RAG and agents |
| [timesfm-cockpit-adaptation.md](./timesfm-cockpit-adaptation.md) | TimesFM-style forecasting in analytics lanes |
| [hudson-rock-community-api.md](./hudson-rock-community-api.md) | Hudson Rock Community API (infostealer OSINT; agent tool `hudson_rock_lookup`) |

For the current repo, start with [`README.md`](../README.md) for local development and [`context/index.md`](../context/index.md) for the canonical context pack and source-of-truth pointers.

## Agent-coder prompts

| File | Purpose |
| ---- | ------- |
| [`context/templates/agent-coder-task.md`](../context/templates/agent-coder-task.md) | Minimal Cockpit agent-coder template + examples (collector, schema, LangGraph node, onboarding) |
