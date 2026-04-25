// services/agents/src/context/schemas.ts
import * as z from "zod";

export const TaskPacketSchema = z.object({
  goal: z.string(),
  why: z.string(),
  taskType: z.enum([
    "discovery",
    "extraction",
    "pillar_mapping",
    "verification",
    "reporting",
    "schema",
    "ui",
    "agent",
  ]),
  jurisdiction: z.string().optional(),
  targetPillars: z
    .array(z.enum(["pillar_6", "pillar_7"]))
    .default(() => ["pillar_6", "pillar_7"]),
  allowedScope: z.array(z.string()).default(() => []),
  mustLoadContext: z.array(z.string()).default(() => []),
  mustCheckSymbols: z.array(z.string()).default(() => []),
  constraints: z.array(z.string()).default(() => []),
  deliverable: z.array(z.string()).default(() => []),
  doneCriteria: z.array(z.string()).default(() => []),
});

export type TaskPacket = z.infer<typeof TaskPacketSchema>;

export const ContextDocSchema = z.object({
  key: z.string(),
  path: z.string(),
  title: z.string(),
  content: z.string(),
});

export const PlanSchema = z.object({
  summary: z.string(),
  jurisdictions: z.array(z.string()).default(() => []),
  pipelineStages: z
    .array(z.enum(["discover", "retrieve", "parse", "extract", "map", "verify", "report"]))
    .default(() => []),
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
