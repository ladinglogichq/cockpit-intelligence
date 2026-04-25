# services/agents context starter

**Status:** `services/agents/` already exists on disk in this repository. This document is the **narrative spec** and code-reference companion for that package; update the on-disk files first, then keep the snippets below aligned.

**Current layout:**

```text
services/agents/
├── package.json
├── tsconfig.json
└── src/
    ├── cockpitAgent.ts
    ├── runWithTaskPacket.ts
    ├── index.ts
    ├── context/
    │   ├── registry.ts
    │   ├── loaders.ts
    │   ├── schemas.ts
    │   ├── prompts.ts
    │   └── index.ts
    └── tools/
        └── stubTools.ts
```

**Install:** from `services/agents/`, run `npm install`, then `npm run typecheck`.

**Loader paths:** `loaders.ts` resolves the repository root as four levels above `src/context` (`services/agents/src/context` → Cockpit root) and reads `context/...` files from there.

## Agent context load order (recommended)

One sequence for Cockpit agents (full notes: [`context/index.md`](../../context/index.md)):

1. [`context/index.md`](../../context/index.md) — canonical pack index and per-file “when to use.”
2. [`context/rules/global.md`](../../context/rules/global.md)
3. [`context/templates/task-packet.md`](../../context/templates/task-packet.md)
4. [`context/domain/entities.md`](../../context/domain/entities.md) → [`case-state-machine.md`](../../context/domain/case-state-machine.md) → [`scoring-rubric.md`](../../context/domain/scoring-rubric.md) → [`rbac-audit.md`](../../context/domain/rbac-audit.md)
5. [`context/domain/integrations.md`](../../context/domain/integrations.md) + the relevant file under [`docs/`](../README.md)
6. [`context/domain/normalization-examples.md`](../../context/domain/normalization-examples.md) when implementing or changing adapters

Default keys per `taskType`: [`src/context/registry.ts`](../../services/agents/src/context/registry.ts) `TASK_TYPE_DEFAULT_CONTEXT` (e.g. `agent` includes `context.pack.index` first).

---

## package.json

```json
{
  "name": "@cockpit/agents",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@langchain/anthropic": "^1.3.26",
    "deepagents": "^1.9.0",
    "langchain": "^1.3.1",
    "zod": "^3.24.0"
  },
  "devDependencies": {
    "@types/node": "^22.10.0",
    "typescript": "^5.7.0"
  }
}
```

## tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "skipLibCheck": true,
    "noEmit": true,
    "rootDir": "src",
    "resolveJsonModule": true
  },
  "include": ["src/**/*.ts"]
}
```

## src/context/registry.ts

```ts
// services/agents/src/context/registry.ts
export const CONTEXT_REGISTRY = {
  "context.pack.index": "context/index.md",
  "rules.global": "context/rules/global.md",
  "architecture.monorepo": "context/architecture/monorepo-map.md",
  "domain.entities": "context/domain/entities.md",
  "domain.integrations": "context/domain/integrations.md",
  "domain.case-state-machine": "context/domain/case-state-machine.md",
  "domain.scoring": "context/domain/scoring-rubric.md",
  "domain.rbac-audit": "context/domain/rbac-audit.md",
  "domain.normalization-examples": "context/domain/normalization-examples.md",
  "template.task-packet": "context/templates/task-packet.md",
  "template.agent-coder": "context/templates/agent-coder-task.md",
} as const;

export const TASK_TYPE_DEFAULT_CONTEXT: Record<string, readonly string[]> = {
  schema: [
    "rules.global",
    "architecture.monorepo",
    "domain.entities",
    "domain.integrations",
  ],
  integration: [
    "rules.global",
    "architecture.monorepo",
    "domain.integrations",
    "domain.entities",
    "domain.normalization-examples",
  ],
  workflow: [
    "rules.global",
    "architecture.monorepo",
    "domain.case-state-machine",
    "domain.scoring",
  ],
  security: [
    "rules.global",
    "architecture.monorepo",
    "domain.rbac-audit",
    "domain.integrations",
  ],
  ui: ["rules.global", "architecture.monorepo", "domain.entities"],
  collector: [
    "rules.global",
    "architecture.monorepo",
    "domain.entities",
    "domain.integrations",
  ],
  agent: [
    "context.pack.index",
    "rules.global",
    "architecture.monorepo",
    "domain.entities",
    "template.task-packet",
    "template.agent-coder",
  ],
  reporting: [
    "rules.global",
    "domain.entities",
    "domain.rbac-audit",
  ],
} as const;
```

## src/context/loaders.ts

Resolves **repo root** from this file’s location and joins `context/...` paths from the registry.

```ts
// services/agents/src/context/loaders.ts
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { CONTEXT_REGISTRY } from "./registry.js";
import { ContextDocSchema } from "./schemas.js";

const REPO_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../../.."
);

export async function loadContextDocs(keys: string[]) {
  const uniqueKeys = [...new Set(keys)];
  const docs = await Promise.all(
    uniqueKeys.map(async (key) => {
      const relativePath = CONTEXT_REGISTRY[key as keyof typeof CONTEXT_REGISTRY];
      if (!relativePath) throw new Error(`Unknown context key: ${key}`);
      const absolutePath = path.join(REPO_ROOT, relativePath);
      const content = await readFile(absolutePath, "utf8");
      return ContextDocSchema.parse({
        key,
        path: relativePath,
        title: key,
        content,
      });
    })
  );
  return docs;
}
```

## src/context/schemas.ts

```ts
// services/agents/src/context/schemas.ts
import * as z from "zod";

export const TaskPacketSchema = z.object({
  goal: z.string(),
  why: z.string(),
  taskType: z.enum([
    "schema",
    "integration",
    "ui",
    "workflow",
    "collector",
    "agent",
    "security",
    "reporting",
  ]),
  allowedScope: z.array(z.string()).default(() => []),
  mustLoadContext: z.array(z.string()).default(() => []),
  mustCheckSymbols: z.array(z.string()).default(() => []),
  constraints: z.array(z.string()).default(() => []),
  deliverable: z.array(z.string()).default(() => []),
  doneCriteria: z.array(z.string()).default(() => []),
});

export const ContextDocSchema = z.object({
  key: z.string(),
  path: z.string(),
  title: z.string(),
  content: z.string(),
});

export const PlanSchema = z.object({
  summary: z.string(),
  mustLoadContext: z.array(z.string()),
  touchedFiles: z.array(z.string()),
  steps: z.array(z.string()),
  risks: z.array(z.string()).default(() => []),
  validations: z.array(z.string()).default(() => []),
});

export const ValidationSchema = z.object({
  status: z.enum(["pending", "passed", "failed"]),
  checks: z.array(z.string()).default(() => []),
  findings: z.array(z.string()).default(() => []),
});
```

## src/context/prompts.ts

```ts
// services/agents/src/context/prompts.ts
export const PLANNER_SYSTEM_PROMPT = `
You are the Cockpit planning agent.

Rules:
- Use only canonical Cockpit domain terms.
- Respect provider boundaries for Sim, Dune, RPC, and external adapters.
- Prefer minimal edits and backward compatibility.
- If required context is missing, ask for it by key.
- Output only the structured plan.

Focus:
- Which context docs are required
- Which files are likely touched
- What validations must run
- Main implementation risks
`;

export const IMPLEMENTER_SYSTEM_PROMPT = `
You are the Cockpit implementation agent.

Rules:
- Stay inside allowed scope.
- Do not invent new domain entities.
- Do not change contracts without calling it out.
- Summarize touched files and risks.
`;
```

## src/context/index.ts

```ts
// services/agents/src/context/index.ts
export {
  CONTEXT_REGISTRY,
  TASK_TYPE_DEFAULT_CONTEXT,
} from "./registry.js";
export { loadContextDocs } from "./loaders.js";
export {
  TaskPacketSchema,
  ContextDocSchema,
  PlanSchema,
  ValidationSchema,
} from "./schemas.js";
export { PLANNER_SYSTEM_PROMPT, IMPLEMENTER_SYSTEM_PROMPT } from "./prompts.js";
```

## src/tools/stubTools.ts

Placeholder tools — replace with real Tor/proxy fetch, IOC pipelines, and server-side Sim/Dune clients. Names avoid collisions with Deep Agents built-ins (`task`, `ls`, `grep`, etc.).

```ts
import { tool } from "langchain";
import { z } from "zod";

export const torFetch = tool(
  async ({ url }: { url: string }) =>
    `[stub] Would fetch with Tor/proxy policies applied: ${url}`,
  {
    name: "tor_fetch",
    description: "Fetch a URL with Tor/proxy-aware routing for sensitive sources.",
    schema: z.object({ url: z.string().min(1) }),
  }
);

export const iocExtractor = tool(
  async ({ text }: { text: string }) =>
    `[stub] IOC extraction from text (${text.length} chars) — wire real extractor.`,
  {
    name: "ioc_extractor",
    description: "Extract IOCs and classifications from raw OSINT text.",
    schema: z.object({ text: z.string() }),
  }
);

export const threatClassifier = tool(
  async ({ text }: { text: string }) =>
    `[stub] Threat classification for ${text.length} chars of text.`,
  {
    name: "threat_classifier",
    description: "Classify severity/risk for analyst triage.",
    schema: z.object({ text: z.string() }),
  }
);

export const simWalletEnrich = tool(
  async ({ address }: { address: string }) =>
    `[stub] Sim enrichment for wallet ${address}`,
  {
    name: "sim_wallet_enrich",
    description: "Enrich a Solana wallet via Sim (server-side keys).",
    schema: z.object({ address: z.string() }),
  }
);

export const duneQuery = tool(
  async ({ queryId }: { queryId: number }) =>
    `[stub] Dune query ${queryId} — wire Dune API with server credentials.`,
  {
    name: "dune_query",
    description: "Run or reference a Dune query (server-side).",
    schema: z.object({ queryId: z.number() }),
  }
);
```

## src/cockpitAgent.ts

Uses `createDeepAgent` from `deepagents` (npm), `ChatAnthropic`, `PLANNER_SYSTEM_PROMPT`, and Cockpit stub tools. Set `ANTHROPIC_API_KEY` (and optionally `COCKPIT_ANTHROPIC_MODEL`).

```ts
import { createDeepAgent } from "deepagents";
import { ChatAnthropic } from "@langchain/anthropic";
import { PLANNER_SYSTEM_PROMPT } from "./context/prompts.js";
import {
  torFetch,
  iocExtractor,
  threatClassifier,
  simWalletEnrich,
  duneQuery,
} from "./tools/stubTools.js";

const model = new ChatAnthropic({
  model:
    process.env.COCKPIT_ANTHROPIC_MODEL ?? "claude-sonnet-4-20250514",
  temperature: 0,
});

export const cockpitAgent = createDeepAgent({
  model,
  systemPrompt: `
You are the Cockpit supervisor orchestrator.

You must:
- Accept a structured task packet for a Cockpit coding or workflow task.
- Load required context from the Cockpit context layer (provided in user messages).
- Delegate work to subagents for:
  - collecting OSINT / dark web sources (collector)
  - analyzing text and extracting IOCs (researcher)
  - enriching wallets / protocols (enricher)
  - triaging alerts and managing cases (triage, case_agent)
- Do not do deep research, enrichment, or crawling yourself.

Use the "task" tool to delegate work.

${PLANNER_SYSTEM_PROMPT}
`,
  tools: [iocExtractor, torFetch],
  subagents: [
    {
      name: "collector",
      description:
        "Crawls OSINT, dark web, and Solana-related sources; returns structured page and metadata.",
      systemPrompt: `
You are the Cockpit collector agent.
You are responsible for:
- Fetching and parsing OSINT and dark web pages.
- Using Tor/Proxies as needed for .onion and sensitive sources.
- Returning structured documents and metadata for Cockpit ingestion.

Use tools like "tor_fetch" to retrieve pages.
`,
      tools: [torFetch],
    },
    {
      name: "researcher",
      description:
        "Analyses OSINT text and extracts IOCs, classifications, and risk-level insight.",
      systemPrompt: `
You are the Cockpit research agent.
You are responsible for:
- Reading raw OSINT text and artifacts.
- Using IOC extraction and classification tools.
- Deciding which entities and IOCs matter for Cockpit cases.

Use the "ioc_extractor" and "threat_classifier" tools.
`,
      tools: [iocExtractor, threatClassifier],
    },
    {
      name: "enricher",
      description:
        "Enriches wallets, protocols, and domains with Solana context via Sim/Dune/RPC.",
      systemPrompt: `
You are the Cockpit enricher agent.
You are responsible for:
- Enriching wallets, protocols, and domains.
- Using Sim, Dune Analytics, and Solana RPC adapters (server-side).
- Returning structured enrichment data for Cockpit entities and cases.
`,
      tools: [simWalletEnrich, duneQuery],
    },
    {
      name: "triage",
      description:
        "Triage alerts and assign confidence, severity, and priority.",
      systemPrompt: `
You are the Cockpit triage agent.
You are responsible for:
- Reading alert and entity context.
- Assigning severity, confidence, and priority.
- Recommending triage status: new, triaged, escalated, false_positive, or duplicate.
`,
      tools: [],
    },
    {
      name: "case_agent",
      description:
        "Creates and manages Cockpit cases, evidence, and reports.",
      systemPrompt: `
You are the Cockpit case agent.
You are responsible for:
- Creating and updating cases.
- Adding evidence and notes.
- Preparing structured threat reports for export.
`,
      tools: [],
    },
  ],
});
```

## src/runWithTaskPacket.ts

Merges [registry.ts](#srccontextregistryts) defaults with `mustLoadContext`, loads markdown, and invokes the agent.

```ts
import { cockpitAgent } from "./cockpitAgent.js";
import { TaskPacketSchema, type TaskPacket } from "./context/schemas.js";
import { loadContextDocs } from "./context/loaders.js";
import { TASK_TYPE_DEFAULT_CONTEXT } from "./context/registry.js";

function contextKeysForTask(packet: TaskPacket): string[] {
  const defaults = TASK_TYPE_DEFAULT_CONTEXT[packet.taskType] ?? [];
  return [...new Set([...defaults, ...packet.mustLoadContext])];
}

export async function runCockpitAgentWithTaskPacket(raw: unknown) {
  const taskPacket = TaskPacketSchema.parse(raw);
  const keys = contextKeysForTask(taskPacket);
  const loadedContextDocs = await loadContextDocs(keys);

  const messages = [
    {
      role: "user" as const,
      content: [
        "Here is the structured task for Cockpit:",
        JSON.stringify(taskPacket, null, 2),
        "",
        "Here is the loaded context:",
        loadedContextDocs.map((d) => `## ${d.key}\n${d.content}`).join("\n\n"),
      ].join("\n"),
    },
  ];

  return cockpitAgent.invoke({ messages });
}
```

## src/index.ts

```ts
export {
  createCockpitAgent,
  getCockpitAgent,
  DEFAULT_OPENROUTER_MODEL,
} from "./cockpitAgent.js";
export { runCockpitAgentWithTaskPacket } from "./runWithTaskPacket.js";
export { getTaskPacketContextKeys } from "./taskPacketKeys.js";
export {
  TaskPacketSchema,
  type TaskPacket,
  loadContextDocs,
  CONTEXT_REGISTRY,
  TASK_TYPE_DEFAULT_CONTEXT,
} from "./context/index.js";
export { workspaceHealth } from "./tools/stubTools.js";
```

## Environment

- `ANTHROPIC_API_KEY` — required for `ChatAnthropic`.
- `COCKPIT_ANTHROPIC_MODEL` — optional override.

## References

- LangChain — [Deep Agents overview](https://docs.langchain.com/oss/javascript/deepagents/overview)
- LangChain — [Deep Agents quickstart](https://docs.langchain.com/oss/javascript/deepagents/quickstart)

## Optional: HTTP handler sketch (Hono)

```ts
// Example: mount on your API gateway
import { Hono } from "hono";
import { runCockpitAgentWithTaskPacket } from "./runWithTaskPacket.js";

const app = new Hono();
app.post("/agents/cockpit/invoke", async (c) => {
  const body = await c.req.json();
  const result = await runCockpitAgentWithTaskPacket(body);
  return c.json(result);
});
```

Add auth, rate limits, and body size limits before exposing publicly.

## Next step

Materialize these files under `services/agents/src/` (Agent mode or paste). Run `npm install` and `npm run typecheck` inside `services/agents/`.
