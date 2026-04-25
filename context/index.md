# Cockpit context pack — canonical index

**Agents — load this first:** Open this file before other `context/` docs when orienting or scoping work. Then follow [**Recommended load order (agents)**](#recommended-load-order-agents) below. For provider APIs, continue to [`docs/README.md`](../docs/README.md) and the integration notes listed there.

**Status:** This file is the **single** top-level index for `context/` (no parallel "master" list elsewhere). If navigation drifts, update here first.

Single map of the **checked-in context layer**: what each file is for, **source of truth** by concept, **recommended load order** for agents, and pointers to [`docs/`](../docs/README.md) for provider-specific integration notes.

**Related:** [docs/README.md — Reader paths](../docs/README.md#reader-paths), [context-engineering-playbook.md](../docs/context-engineering-playbook.md), [architecture/target-repo-layout.md](../docs/architecture/target-repo-layout.md).

---

## Source of truth by concept

| Concept | Authoritative file |
| ------- | ------------------ |
| Agent behavior, scope, pipeline workflow | [rules/global.md](./rules/global.md) |
| Task shape (goal, taskType, mustLoadContext, …) | [templates/task-packet.md](./templates/task-packet.md) — schema: [`services/agents`](../services/agents/README.md) `TaskPacketSchema` |
| Canonical domain types (Jurisdiction, LegalDocument, Clause, PillarMapping, EvidenceRecord, AuditTrace) | [domain/entities.md](./domain/entities.md) |
| RDTII Pillar 6 & 7 definitions and sub-indicators | [domain/rdtii-pillars.md](./domain/rdtii-pillars.md) |
| Evidence pipeline stages (discover → verify → report) | [domain/evidence-pipeline.md](./domain/evidence-pipeline.md) |
| Roles, permissions, audit expectations | [domain/rbac-audit.md](./domain/rbac-audit.md) |
| Adapters, env patterns, failure policy | [domain/integrations.md](./domain/integrations.md) |
| Service boundaries (stub) | [architecture/monorepo-map.md](./architecture/monorepo-map.md) |
| Coding task template | [templates/agent-coder-task.md](./templates/agent-coder-task.md) |
| Provider APIs, Tavily, Supabase, OCR, … | [`docs/README.md`](../docs/README.md) index — not duplicated here |

If two files disagree, **domain/** and **rules/** win for product semantics; **docs/** wins for vendor API details. Update the authoritative file when contracts change.

---

## Recommended load order (agents)

Order follows **rules → task → domain → pipeline → policy → integrations → vendor docs**.

1. [rules/global.md](./rules/global.md) — behavior envelope, non-negotiables, and core pipeline definition.
2. [templates/task-packet.md](./templates/task-packet.md) — how the task is structured.
3. [domain/entities.md](./domain/entities.md) — canonical domain model (Jurisdiction, LegalDocument, Clause, PillarMapping, EvidenceRecord, AuditTrace).
4. [domain/rdtii-pillars.md](./domain/rdtii-pillars.md) — Pillar 6 & 7 definitions, sub-indicators, mapping criteria.
5. [domain/evidence-pipeline.md](./domain/evidence-pipeline.md) — pipeline stage definitions and agent responsibilities.
6. [domain/rbac-audit.md](./domain/rbac-audit.md) — who can do what; what to log.
7. [domain/integrations.md](./domain/integrations.md) — normalization, env patterns, **error/retry policy**.
8. [architecture/monorepo-map.md](./architecture/monorepo-map.md) — where services live (target layout).
9. **Provider docs as needed** — [docs/README.md](../docs/README.md) (Tavily, Supabase, OCR providers).

For implementation work, add [templates/agent-coder-task.md](./templates/agent-coder-task.md) after the task packet.

---

## File index (`context/`)

### Rules

| File | When to use |
| ---- | ----------- |
| [rules/global.md](./rules/global.md) | Every agent turn; defines Cockpit goals, non-negotiables, pipeline workflow, and coding defaults |

### Templates

| File | When to use |
| ---- | ----------- |
| [templates/task-packet.md](./templates/task-packet.md) | Structuring tasks that must match `TaskPacketSchema` |
| [templates/agent-coder-task.md](./templates/agent-coder-task.md) | Focused coding tasks (parser, schema, UI, agent node, etc.) |

### Architecture (stubs)

| File | When to use |
| ---- | ----------- |
| [architecture/monorepo-map.md](./architecture/monorepo-map.md) | Service boundaries and links to target layout / diagrams |

### Domain

| File | When to use |
| ---- | ----------- |
| [domain/entities.md](./domain/entities.md) | Any change touching Jurisdiction, LegalDocument, Clause, PillarMapping, EvidenceRecord, AuditTrace |
| [domain/rdtii-pillars.md](./domain/rdtii-pillars.md) | Pillar definitions, sub-indicator mapping criteria, confidence thresholds |
| [domain/evidence-pipeline.md](./domain/evidence-pipeline.md) | Pipeline stage definitions, agent handoff points |
| [domain/rbac-audit.md](./domain/rbac-audit.md) | Roles, matrix, sensitive actions |
| [domain/integrations.md](./domain/integrations.md) | Adapters, secrets, retries, checklist |

---

## `docs/` integration notes (repository root)

Authoritative list and reader paths: [`docs/README.md`](../docs/README.md). Use **Adapter implementation path** in [domain/integrations.md](./domain/integrations.md) for the doc map from topic → file.

---

## Runtime wiring

The [`services/agents`](../services/agents/README.md) package loads selected paths via `CONTEXT_REGISTRY` in [`services/agents/src/context/registry.ts`](../services/agents/src/context/registry.ts). To add a new context file to **default** agent loads, update the registry and, if needed, `TASK_TYPE_DEFAULT_CONTEXT`.
