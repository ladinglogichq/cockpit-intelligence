// services/agents/src/context/registry.ts
export const CONTEXT_REGISTRY = {
  "context.pack.index": "context/index.md",
  "rules.global": "context/rules/global.md",
  "architecture.monorepo": "context/architecture/monorepo-map.md",
  "domain.entities": "context/domain/entities.md",
  "domain.rdtii-pillars": "context/domain/rdtii-pillars.md",
  "domain.evidence-pipeline": "context/domain/evidence-pipeline.md",
  "domain.integrations": "context/domain/integrations.md",
  "domain.rbac-audit": "context/domain/rbac-audit.md",
  "template.task-packet": "context/templates/task-packet.md",
  "template.agent-coder": "context/templates/agent-coder-task.md",
} as const;

export const TASK_TYPE_DEFAULT_CONTEXT: Record<string, readonly string[]> = {
  discovery: [
    "rules.global",
    "architecture.monorepo",
    "domain.entities",
    "domain.integrations",
  ],
  extraction: [
    "rules.global",
    "domain.entities",
    "domain.rdtii-pillars",
    "domain.evidence-pipeline",
  ],
  pillar_mapping: [
    "rules.global",
    "domain.entities",
    "domain.rdtii-pillars",
    "domain.evidence-pipeline",
  ],
  verification: [
    "rules.global",
    "domain.entities",
    "domain.rdtii-pillars",
    "domain.rbac-audit",
  ],
  reporting: [
    "rules.global",
    "domain.entities",
    "domain.rdtii-pillars",
    "domain.rbac-audit",
  ],
  schema: [
    "rules.global",
    "architecture.monorepo",
    "domain.entities",
    "domain.integrations",
  ],
  ui: ["rules.global", "architecture.monorepo", "domain.entities"],
  agent: [
    "context.pack.index",
    "rules.global",
    "architecture.monorepo",
    "domain.entities",
    "domain.rdtii-pillars",
    "domain.evidence-pipeline",
    "template.task-packet",
    "template.agent-coder",
  ],
} as const;
