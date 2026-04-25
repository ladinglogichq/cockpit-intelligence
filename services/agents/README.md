# `@cockpit/agents`

Cockpit agent runtime: Deep Agents **supervisor** (`cockpitAgent`), **context loaders** from repo-root [`context/`](../context/), [`runCockpitAgentWithTaskPacket`](./src/runWithTaskPacket.ts), and **stub tools** (replace with real integrations server-side).

## Run / extend agents

**Recommended context load order** (same as [`docs/architecture/services-agents-context-starter.md`](../docs/architecture/services-agents-context-starter.md#agent-context-load-order-recommended)): [`context/index.md`](../context/index.md) → `rules/global.md` → `templates/task-packet.md` → domain docs → `integrations.md` + provider `docs/` → `normalization-examples.md` when touching adapters. Defaults: `src/context/registry.ts` `TASK_TYPE_DEFAULT_CONTEXT`.

| Resource | Purpose |
| -------- | ------- |
| [docs/context-engineering-playbook.md](../docs/context-engineering-playbook.md) | How to scope prompts, task packets, and repo context |
| [context/templates/task-packet.md](../context/templates/task-packet.md) | Human-editable task packet template |
| [docs/architecture/services-agents-context-starter.md](../docs/architecture/services-agents-context-starter.md) | Full design notes (parity with this package) |
| [docs/README.md — Reader paths](../docs/README.md#reader-paths) | Adapter vs agents vs “explain the system” |
| [context/index.md](../context/index.md) | Canonical context pack: source of truth, load order, file index |

## Commands

```bash
npm install
npm run typecheck
npm run task-packet:dry-run
```

- **`task-packet:dry-run`** — parses `examples/sample-task-packet.json`, resolves context keys, loads markdown from repo-root `context/`. No Anthropic call.
- **`task-packet:run`** — full Deep Agent invoke; requires `ANTHROPIC_API_KEY`.

## Environment

- `OPENROUTER_API_KEY` — required for OpenRouter model access
- `OPENROUTER_MODEL` — optional override; defaults to `openrouter:anthropic/claude-sonnet-4-6`
- `COCKPIT_AHMIA_ENABLED` — set to `false` to disable the `ahmia_search` tool (default: enabled). Uses Ahmia’s public [`/onions/`](https://ahmia.fi/onions/) export with an in-memory cache (~1h). Full-text search on Ahmia is browser-based; the tool returns URL substring matches plus the HTTPS search link for Tor Browser.
- `COCKPIT_HUDSON_ROCK_ENABLED` — set to `false` to disable the `hudson_rock_lookup` tool (default: enabled). Calls Hudson Rock’s public Community API at `cavalier.hudsonrock.com` (email, username, domain, URLs-by-domain, IP). Community rate limit is 50 requests / 10 seconds; the integration uses best-effort in-process throttling. See [`docs/hudson-rock-community-api.md`](../docs/hudson-rock-community-api.md).

## Domain contracts

Normalization and integration boundaries: [`context/domain/integrations.md`](../context/domain/integrations.md), [`context/domain/entities.md`](../context/domain/entities.md).
