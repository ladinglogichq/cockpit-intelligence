import snapshot from "./dashboard-snapshot.json";

export type PillarLabel = "pillar_6" | "pillar_7";

export type EvidenceStatus = "verified" | "needs_review" | "draft" | "retracted";

export type DashboardKpis = {
  jurisdictionsAnalyzed: number;
  clausesExtracted: number;
  mappingsVerified: number;
  reportsReady: number;
};

export type EvidenceRecord = {
  id: string;
  jurisdiction: string;
  statute: string;
  articleSection: string;
  pillar: PillarLabel;
  confidence: number;
  status: EvidenceStatus;
  excerpt: string;
  rationale: string;
  sourceUrl: string;
  extractedAt: string;
};

export type MappingActivityRow = {
  jurisdiction: string;
  detail: string;
  occurredAt: string;
};

export type DashboardSnapshot = {
  generatedAt: string;
  kpis: DashboardKpis;
  evidence: EvidenceRecord[];
  mappingActivity: MappingActivityRow[];
};

export const dashboardSnapshot = snapshot as DashboardSnapshot;
