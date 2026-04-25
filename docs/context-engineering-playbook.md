# Cockpit context engineering playbook

**Navigation:** Guided entry points live in [`docs/README.md`](README.md#reader-paths) — **Run or extend agents** → this playbook, [`context/templates/task-packet.md`](../context/templates/task-packet.md), and [`services/agents/`](../services/agents/README.md). **Canonical context pack** (source of truth, load order, file index): [`context/index.md`](../context/index.md). For adapters, use [`context/domain/integrations.md`](../context/domain/integrations.md) plus per-provider docs in [`docs/README.md`](README.md#index). For system overview, use [`architecture/overview-diagrams.md`](architecture/overview-diagrams.md) and [`architecture/target-repo-layout.md`](architecture/target-repo-layout.md).

---

A focused, opinionated set of principles and concrete patterns for using prompts, tools, state, and subagents to work effectively on Cockpit’s multi-layer codebase (marketing site, vendored agent libraries, integration notes, and future services described in [`PRD.md`](../PRD.md)). The core idea is to treat context as a **curated execution sandbox**, not a dumping ground, following Anthropic’s “smallest set of high-signal tokens” guidance and Martin Fowler’s “context engineering for coding agents” mental model. See [References](#references).

## Mapping to this repository

| Playbook layer | In this repo today | Notes |
| ---------------- | -------------------- | ----- |
| Persistent rules | [`context/rules/global.md`](../context/rules/global.md), [`CLAUDE.md`](../CLAUDE.md), ESLint/TS under [`frontend/`](../frontend/) | Root `context/` holds starter rules and domain stubs; expand as the platform grows. |
| Architecture / domain | [`docs/`](../docs/) notes, [`PRD.md`](../PRD.md), [target monorepo layout](architecture/target-repo-layout.md) | Planned API/dashboard/backends may live in another repo or branch; [`docs/README.md`](README.md) describes what is **not** shipped here. |
| Task-local | Cursor plans, agent task packets, branch names | Use structured packets (below) for non-trivial work. |
| Runtime / agent state | Plans, todos, validation checklists | Compaction and summaries matter for long tasks. |

The **concrete target tree** (`apps/`, `services/`, `packages/`, repo-root `context/`) lives in [architecture/target-repo-layout.md](architecture/target-repo-layout.md). It is **not** scaffolded in this repo yet; use that doc when you introduce a full platform monorepo. Until then, paths in [Shared repository / domain docs](#41-shared-repository--domain-docs) remain design targets.

---

## 1. Cockpit context ecosystem

Think of Cockpit’s context as four layers:

- **Persistent rules** — e.g. `context/rules/global.md` (when added), `.clang-format`, `tsconfig`, ESLint.
- **Architecture and domain** — e.g. `context/architecture/monorepo-map.md`, `context/domain/entities.md`, `context/domain/integrations.md`; for today’s repo, pair those with [`docs/`](README.md) and [`context/index.md`](../context/index.md).
- **Task-local** — `task-packet` (YAML/JSON), must-load docs, touched files, symbols.
- **Runtime / agent state** — plan, todos, validation checklists, risk notes.

Anthropic stresses that good context engineering is about **what tokens land in the window at inference time**, across system prompts, tools, examples, and histories. Fowler similarly calls out reusable prompts, tools, skills, and subagents as the core levers.

---

## 2. Core principles for Cockpit

### 2.1 Less is more

- Keep **global rules** compact; add only when you see a repeated class of failures.
- Load **domain docs** just-in-time, not by default.
- For complex changes, use **subagent isolation** and **summary-only** return values.

Anthropic’s “attention budget” and “context rot” arguments apply: Cockpit’s tree plus `backend/deepagentsjs` is large enough that huge context windows can drown signal.

### 2.2 Just-in-time + identifiers

- Encode architecture as **file paths**, **schema keys**, and **service names**, not wall-of-text descriptions.
- Let agents keep **lightweight identifiers** (e.g. `services/solana`, `packages/shared-types`) and fetch contents on demand via tools.

This matches hybrid retrieval: load a small base, then pull the right context at runtime.

### 2.3 Subagent decomposition

- **Supervisor** — plans Cockpit-level tasks.
- **Scout** — finds relevant files, tests, similar patterns.
- **Planner** — produces a typed change plan.
- **Implementer** — edits only approved files.
- **Verifier / Security** — runs lint, typecheck, tests, contract checks.

Expensive exploration stays in isolated contexts; the orchestrator sees summaries.

---

## 3. Prompt design patterns

### 3.1 Structured system prompts

Use sections and minimal, altitude-appropriate instructions: too much low-level logic in prompts makes the system brittle.

Example skeleton for a Cockpit supervisor:

```text
# Role
Cockpit supervisor orchestrator.

# Task
You will:
- Receive a Cockpit feature or bug as a task packet.
- Delegate work to subagents for:
  - collecting OSINT/dark web pages (collector)
  - analyzing text and extracting IOCs (researcher)
  - enriching wallets/protocols (enricher)
  - triaging alerts and managing cases (triage, case_agent)
- Do not do deep research, enrichment, or crawling yourself.

Use the "task" tool to delegate work.

## Output format
- Restate the task.
- List assumptions and unknowns.
- Name required context (context keys, files, symbols).
- Propose a plan as a list of steps with subagent names.
- Never invent new domain types; use canonical names from entities.md and domain docs.
```

### 3.2 Task packets

Encode non-trivial changes as a structured packet:

```ts
type TaskPacket = {
  goal: string; // What must change?
  why: string; // Why in Cockpit terms?
  taskType:
    | "schema"
    | "integration"
    | "ui"
    | "workflow"
    | "collector"
    | "agent"
    | "security"
    | "refactor";
  allowedScope: string[]; // allowed files/services
  mustLoadContext: string[]; // e.g. ["domain.entities", "integrations"]
  mustCheckSymbols: string[]; // e.g. ["WalletEnricher", "alert-service"]
  constraints: string[]; // e.g. "no client-side secrets"
  deliverable: string[]; // patches, tests, docs
  doneCriteria: string[];
  outputFormat?: "file" | "diff" | "markdown";
};
```

### 3.3 Agent-coder task template

For **single-shot coding or doc tasks** (minimal diff, explicit files, validation checklist), use the copy-paste template and examples in [`context/templates/agent-coder-task.md`](../context/templates/agent-coder-task.md). It matches the same guardrails as this playbook and is easy to fold into a `taskPacket` `goal` or chat turn.

### 3.4 Protecting rules

Add explicit guardrails:

- Do not invent new domain object names if a canonical name already exists.
- Do not change API/event payloads without updating contracts and consumers.
- Do not expose provider API keys or move provider-specific shapes into shared domain types.

---

## 4. Context management and tooling

### 4.1 Shared repository / domain docs

Put canonical truth under `/context` when you introduce it:

- `rules/global.md` — global coding, security, design rules.
- `architecture/monorepo-map.md` — service boundaries, ownership, event flows.
- `domain/entities.md`, `domain/integrations.md`, `domain/case-state-machine.md` — domain truth.
- `playbooks/*.md` — e.g. `add-source-adapter.md`, `add-entity-kind.md`.
- `templates/agent-coder-task.md` — minimal agent-coder prompt + worked examples (collector adapter, schema, LangGraph node, onboarding copy).

Until then, mirror the same intent in [`docs/`](README.md) and keep [`PRD.md`](../PRD.md) aligned with shipped code.

### 4.2 Retrieval strategy

- **Architecture search** — find service, entrypoint, shared lib, provider adapter.
- **Dependency search** — imports, usages, callers, tests, migrations.
- **Pattern search** — similar implementations, API styles, error handling.
- **History search** — past PRs, RFCs, design docs relevant to the change.

### 4.3 Stateful and reduced state

Use state channels with **reducers** for messages, touched files, hints, assumptions, risks. A LangGraph-style sketch:

```ts
const CockpitState = new StateSchema({
  messages: MessagesValue,
  taskPacket: TaskPacketSchema,
  loadedContextKeys: new ReducedValue(z.array(z.string()), { /* reducer */ }),
  loadedContextDocs: new ReducedValue(z.array(ContextDocSchema), { /* reducer */ }),
  touchedFiles: new ReducedValue(z.array(z.string()), { /* reducer */ }),
  decisions: new ReducedValue(z.array(z.string()), { /* reducer */ }),
  plan: PlanSchema.optional(),
  validation: ValidationSchema,
});
```

Reduced channels combine rather than grow unbounded so tokens do not explode.

### 4.4 Compaction and note-taking

- At the end of each substep, summarize: what changed, assumptions, what is still unclear.
- Store summaries in a scratchpad (`context/decisions.md` or DB-backed notes).
- For long-horizon tasks, **compact**: summarize state and prune old tool outputs; keep only the most recent high-signal artifacts.

---

## 5. Cockpit-specific workflow examples

### 5.1 Schema-level change

Purpose: add a new entity kind or change an alert schema.

1. Start with `taskPacket` for `taskType: "schema"`.
2. Load `domain/entities.md` and `domain/integrations.md` (or equivalent docs).
3. **Scout**: find all consumers of `Entity` or `Alert`.
4. **Plan**: minimal diff with migration notes.
5. **Implement**: only those files.
6. **Verify**: typecheck, tests, contract diff.

### 5.2 Dark web collector / AI pipeline

Purpose: add a new `.onion` adapter and AI-driven parsing.

1. `taskPacket` with `taskType: "collector"`.
2. Load `rules/global.md`, `domain/integrations.md`, `domain/entities.md` (or equivalents).
3. **Scout**: existing collector services and adapter shapes.
4. **Plan**: new adapter and parsing pipeline (e.g. crawl + entity mapping).
5. **Implement**: adapter, tests, Cockpit-level mapping.
6. **Validate**: small test pipeline on a benign fixture; check entities and IOCs.

---

## 6. Tooling and guardrails

Build a palette agents can use (names illustrative; wire to real MCP/RPC in deployment):

| Tool | Role |
| ---- | ---- |
| `search_files(query)` | Find services, tests, similar implementations |
| `load_context_docs(keys[])` | Fetch `/context/...` or mapped docs |
| `typecheck()`, `test()`, `run_contract_diff()` | Validation |
| `tor_fetch(url)` | Tor-aware fetch where applicable and authorized |
| `sim_enrich(wallet)`, `dune_query(queryId)` | Solana / analytics enrichment (server-side keys) |

Tools should be self-contained, minimal overlap, clearly described, and return token-efficient summaries.

---

## 7. Pitfall-avoidance checklist

- **Over-loading context** — Do not dump the whole tree into every call.
- **Over-engineering upfront** — Add rules and playbooks incrementally.
- **Illusion of control** — LLMs are probabilistic; use human review for high-risk changes.

Cockpit-specific:

- Avoid creating new domain types on every edit; use canonical names and contracts.
- Do not assume “everything is in context”; use identifiers and on-demand retrieval.
- Do not skip structured summaries on long-running tasks.

---

## References

1. Anthropic — [Effective context engineering for AI agents](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)
2. Martin Fowler — [Context engineering for coding agents](https://martinfowler.com/articles/exploring-gen-ai/context-engineering-coding-agents.html)
3. LangChain — [Graph API overview](https://docs.langchain.com/oss/javascript/langgraph/graph-api)
4. LangGraph.js — [StateGraph API reference](https://langchain-ai.github.io/langgraphjs/reference/classes/langgraph.StateGraph.html)
5. arXiv — [On the Impacts of Contexts on Repository-Level Code Generation](https://arxiv.org/abs/2406.11927)
6. ACL Anthology — [NAACL 2025 findings (paper 82)](https://aclanthology.org/2025.findings-naacl.82/)
7. ReadyTensor — [MAD-CTI: Multi-Agent Dark Web Cyber Threat Intelligence](https://app.readytensor.ai/publications/mad-cti-multi-agent-dark-web-cyber-threat-intelligence-XEdqagqw5LG0)
8. LangGraph — [Build multi-agent systems](https://langchain-ai.github.io/langgraph/how-tos/multi_agent/)

---

## Next steps (optional)

- Follow [architecture/target-repo-layout.md](architecture/target-repo-layout.md) when migrating from today’s [`frontend/`](../frontend/)-centric tree (marketing + lazy product shell) to `apps/web/` + `services/*` + `packages/*`.
- **Root `context/`** already has [`rules/`](../context/rules/global.md), [`domain/`](../context/domain/integrations.md), [`templates/task-packet.md`](../context/templates/task-packet.md), and [`architecture/monorepo-map.md`](../context/architecture/monorepo-map.md). Add a `context/playbooks/` tree (or expand templates) when operational runbooks outgrow ad hoc sections in this doc.
- **`services/agents/`** on disk implements `TaskPacketSchema`, loaders, and `cockpitAgent` ([`services/agents/README.md`](../services/agents/README.md), [services-agents-context-starter.md](architecture/services-agents-context-starter.md)); keep the Zod schema, prompts, and [`context/templates/task-packet.md`](../context/templates/task-packet.md) in sync as contracts evolve.
