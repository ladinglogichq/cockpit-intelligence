// services/agents/src/context/schemas.ts
//
// Canonical domain entities from context/domain/entities.md:
// - Jurisdiction, LegalDocument, Clause, PillarMapping, EvidenceRecord, AuditTrace
// - Do not invent synonyms; update entities.md when contracts change.

import * as z from "zod";

// ============================================================================
// Core Task Schema
// ============================================================================

export const TaskPacketSchema = z.object({
  goal: z.string().describe("High-level objective in Cockpit regulation intelligence terms"),
  why: z.string().describe("Business justification for this task"),
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
  jurisdiction: z.string().optional().describe("Jurisdiction ISO 3166-1 alpha-2 code or name"),
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

// ============================================================================
// Canonical Domain Entity Schemas
// ============================================================================

// Jurisdiction: Country or territory being analyzed
export const JurisdictionSchema = z.object({
  id: z.string().describe("UUID or prefixed ULID"),
  name: z.string().describe("Official country name (English)"),
  iso3166: z.string().describe("ISO 3166-1 alpha-2 code (e.g. SG, KE, NG)"),
  region: z.string().describe("UN region or RDTII grouping"),
  primaryLanguages: z.array(z.string()).describe("BCP 47 codes of official/legal languages"),
  regulatoryBody: z.string().describe("Primary data protection authority name"),
  regulatoryBodyUrl: z.string().url().optional(),
  status: z.enum(["active", "pending", "no_coverage"]),
});

export type Jurisdiction = z.infer<typeof JurisdictionSchema>;

// LegalDocument: Official legal text retrieved from a source
export const LegalDocumentSchema = z.object({
  id: z.string(),
  jurisdictionId: z.string().describe("FK to Jurisdiction"),
  title: z.string().describe("Official document title (original language)"),
  titleTranslated: z.string().optional(),
  documentType: z.enum(["act", "regulation", "decree", "directive", "guideline", "amendment", "treaty", "circular"]),
  sourceUrl: z.string().url().describe("URL where document was retrieved"),
  sourceType: z.enum(["gazette", "regulator_website", "legal_portal", "manual_upload"]),
  language: z.string().describe("BCP 47 of the document"),
  publicationDate: z.string().date().optional(),
  effectiveDate: z.string().date().optional(),
  contentHash: z.string().describe("Hash of raw document for dedup"),
  rawStoragePath: z.string().optional(),
  ocrApplied: z.boolean(),
  pageCount: z.number().int().optional(),
  retrievedAt: z.string().datetime(),
  retrievedBy: z.string(),
});

export type LegalDocument = z.infer<typeof LegalDocumentSchema>;

// Clause: Discrete legal provision extracted from a LegalDocument
export const ClauseSchema = z.object({
  id: z.string(),
  legalDocumentId: z.string().describe("FK to LegalDocument"),
  articleNumber: z.string().describe("Article, section, or paragraph reference"),
  subdivision: z.string().optional(),
  pageNumber: z.number().int().optional(),
  originalExcerpt: z.string().describe("Verbatim text from source document"),
  translatedExcerpt: z.string().optional(),
  clauseType: z.enum(["rule", "obligation", "prohibition", "exception", "definition", "scope", "penalty"]),
  subjectMatter: z.array(z.string()).describe("Controlled tags from entities.md"),
  extractedAt: z.string().datetime(),
  extractedBy: z.string(),
});

export type Clause = z.infer<typeof ClauseSchema>;

// PillarMapping: Assignment of a Clause to an RDTII pillar with rationale
export const PillarMappingSchema = z.object({
  id: z.string(),
  clauseId: z.string().describe("FK to Clause"),
  pillar: z.enum(["pillar_6", "pillar_7"]),
  subIndicator: z.string().optional().describe("RDTII sub-indicator (e.g. 6.1, 6.2, 7.3)"),
  mappingRationale: z.string().describe("1-3 sentence explanation of pillar mapping"),
  confidence: z.number().min(0).max(1).describe("Confidence score 0-1"),
  status: z.enum(["auto_mapped", "verified", "disputed", "rejected"]),
  verifiedBy: z.string().optional(),
  verifiedAt: z.string().datetime().optional(),
  flags: z.array(z.string()).default(() => []),
});

export type PillarMapping = z.infer<typeof PillarMappingSchema>;

// EvidenceRecord: Complete, audit-ready record for reporting
export const EvidenceRecordSchema = z.object({
  id: z.string(),
  jurisdictionId: z.string().describe("FK to Jurisdiction"),
  legalDocumentId: z.string().describe("FK to LegalDocument"),
  clauseId: z.string().describe("FK to Clause"),
  pillarMappingId: z.string().describe("FK to PillarMapping"),
  country: z.string().describe("Denormalized jurisdiction name"),
  documentTitle: z.string().describe("Denormalized document title"),
  sourceUrl: z.string().url().describe("Denormalized source URL"),
  pageNumber: z.number().int().optional(),
  articleSection: z.string().describe("Denormalized article/section reference"),
  originalExcerpt: z.string().describe("Denormalized verbatim excerpt"),
  translatedExcerpt: z.string().optional(),
  pillar: z.enum(["pillar_6", "pillar_7"]),
  subIndicator: z.string().optional(),
  mappingRationale: z.string().describe("Why this clause maps to the pillar"),
  confidence: z.number().min(0).max(1),
  status: z.enum(["draft", "verified", "published", "retracted"]),
  createdAt: z.string().datetime(),
});

export type EvidenceRecord = z.infer<typeof EvidenceRecordSchema>;

// AuditTrace: Immutable log of system actions for compliance and provenance
export const AuditTraceSchema = z.object({
  id: z.string(),
  actorId: z.string().describe("Agent id, user id, or 'system'"),
  action: z.string().describe("Stable verb, e.g. document.retrieved, clause.extracted"),
  resourceType: z.string().describe("e.g. legal_document, clause, pillar_mapping"),
  resourceId: z.string(),
  before: z.record(z.any()).optional().describe("Redacted snapshot of previous state"),
  after: z.record(z.any()).optional().describe("Redacted snapshot of new state"),
  metadata: z.record(z.any()).optional(),
  timestamp: z.string().datetime(),
});

export type AuditTrace = z.infer<typeof AuditTraceSchema>;

// ============================================================================
// Supporting Schemas
// ============================================================================

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
