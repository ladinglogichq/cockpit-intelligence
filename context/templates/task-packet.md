# Task Packet

**Navigation:** Pair with the [context engineering playbook](../../docs/context-engineering-playbook.md) and the implemented schema in [`services/agents`](../../services/agents/README.md) (`TaskPacketSchema`). For coding-oriented tasks, see [agent-coder-task.md](./agent-coder-task.md). Guided entry points: [docs/README.md — Reader paths](../../docs/README.md#reader-paths).

---

## Goal

Describe exactly what must change.

## Why

Explain the product or domain need in Cockpit terms.

## Task type

Choose one:

- schema
- integration
- ui
- workflow
- collector
- agent
- security
- reporting

## Allowed scope

List the exact files, folders, or services allowed to change.

## Must-load context

List required context docs, for example:

- /context/rules/global.md
- /context/architecture/monorepo-map.md
- /context/domain/entities.md
- /context/templates/agent-coder-task.md (for single-shot coding tasks with the agent-coder protocol)

## Must-check symbols

List affected routes, tables, events, types, provider adapters, or tests.

## Constraints

Examples:

- no breaking changes
- preserve existing API contracts
- no client-side secrets
- no direct DB writes from UI
- add audit events if privileged behavior changes

## Deliverable

Examples:

- code patch
- updated docs
- migration
- tests
- validation summary

## Done criteria

Define completion precisely.

## Output format

1. Task understanding
2. Needed context
3. Plan
4. Touched files
5. Implementation summary
6. Validation
7. Risks / follow-ups
