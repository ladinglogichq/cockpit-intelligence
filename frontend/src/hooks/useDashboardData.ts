import { useCallback, useEffect, useState } from "react";
import { supabase } from "../utils/supabase";
import { useSupabaseAuth } from "../context/SupabaseAuthContext";
import type { DashboardSnapshot, EvidenceRecord, MappingActivityRow } from "../data/dashboardMock";

export function useDashboardData(): {
  data: DashboardSnapshot | null;
  loading: boolean;
  error: string | null;
  clearWorkspace: () => Promise<void>;
} {
  const { user } = useSupabaseAuth();
  const [data, setData] = useState<DashboardSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const clearWorkspace = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      await Promise.all([
        supabase.from("evidence_records").delete().eq("workspace_id", user.id),
        supabase.from("mapping_activity").delete().eq("workspace_id", user.id),
      ]);
      setData(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to clear workspace");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;

    let cancelled = false;
    setLoading(true);
    setError(null);

    Promise.all([
      supabase
        .from("evidence_records")
        .select("id,jurisdiction,statute,article_section,pillar,confidence,status,excerpt,rationale,source_url,extracted_at")
        .eq("workspace_id", user.id)
        .order("extracted_at", { ascending: false }),
      supabase
        .from("mapping_activity")
        .select("jurisdiction,detail,occurred_at")
        .eq("workspace_id", user.id)
        .order("occurred_at", { ascending: false }),
    ]).then(([evRes, maRes]) => {
      if (cancelled) return;
      if (evRes.error) { setError(evRes.error.message); setLoading(false); return; }
      if (maRes.error) { setError(maRes.error.message); setLoading(false); return; }

      const evidence: EvidenceRecord[] = (evRes.data ?? []).map((r) => ({
        id: r.id,
        jurisdiction: r.jurisdiction,
        statute: r.statute,
        articleSection: r.article_section,
        pillar: r.pillar as EvidenceRecord["pillar"],
        confidence: r.confidence,
        status: r.status as EvidenceRecord["status"],
        excerpt: r.excerpt,
        rationale: r.rationale,
        sourceUrl: r.source_url,
        extractedAt: r.extracted_at,
      }));

      const mappingActivity: MappingActivityRow[] = (maRes.data ?? []).map((r) => ({
        jurisdiction: r.jurisdiction,
        detail: r.detail,
        occurredAt: r.occurred_at,
      }));

      const jurisdictions = new Set(evidence.map((e) => e.jurisdiction));
      const snapshot: DashboardSnapshot = {
        generatedAt: new Date().toISOString(),
        kpis: {
          jurisdictionsAnalyzed: jurisdictions.size,
          clausesExtracted: evidence.length,
          mappingsVerified: evidence.filter((e) => e.status === "verified").length,
          reportsReady: 0,
        },
        evidence,
        mappingActivity,
      };

      setData(snapshot);
      setLoading(false);
    });

    return () => { cancelled = true; };
  }, [user]);

  return { data, loading, error, clearWorkspace };
}
