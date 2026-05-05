import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL ?? "";
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

interface EvidenceRow {
  workspace_id: string;
  jurisdiction: string;
  statute: string;
  article_section: string;
  pillar: string;
  confidence: number;
  status: string;
  excerpt: string;
  rationale: string;
  source_url: string;
}

/**
 * Parse evidence records from agent text output.
 * Handles both:
 *  - Simulation CLI format: ✅ Section 26 (conf=0.95, cite=verified) — "excerpt"
 *  - Agent prose format: JSON blocks, pillar mentions with article refs and excerpts
 */
export function parseEvidenceRecords(
  text: string,
  jurisdiction: string,
): EvidenceRow[] {
  const records: EvidenceRow[] = [];

  // Strategy 1: match simulation-style mapping lines
  // ✅/⚠️/❌ ArticleRef (conf=N, cite=status) — "excerpt"
  const simRe = /[✅⚠️❌]\s+(.+?)\s+\(conf=([\d.]+),\s*cite=(\w+)\)\s+[—-]\s+"([^"]{10,})"/g;

  // Strategy 2: match JSON evidence record blocks the agent may emit
  // {"pillar":"pillar_6","articleReference":"...","originalExcerpt":"...","confidence":0.9}
  const jsonRe = /\{[^{}]*"pillar"\s*:\s*"(pillar_\d+)"[^{}]*"(?:articleReference|article_section)"\s*:\s*"([^"]+)"[^{}]*"(?:originalExcerpt|excerpt)"\s*:\s*"([^"]{10,})"[^{}]*"confidence"\s*:\s*([\d.]+)[^{}]*\}/g;

  // Strategy 3: match pillar-labelled sections with article + excerpt
  // [pillar_6] ... ArticleRef ... "excerpt"
  const sectionRe = /\[?(pillar_\d+)\]?[^\n]*\n(?:[^\n]*\n){0,3}[^\n]*?((?:Section|Article|Pasal|Điều|มาตรา|제\d+조)\s*[\d.()a-z]+)[^\n]*\n[^\n]*?"([^"]{20,})"/gi;

  let currentPillar = "pillar_7";

  // Run strategy 1
  let m: RegExpExecArray | null;
  // Track pillar context from surrounding [pillar_X] markers
  const pillarBlocks = text.split(/\[pillar_(\d+)\]/);
  for (let i = 0; i < pillarBlocks.length; i++) {
    if (/^\d+$/.test(pillarBlocks[i])) { currentPillar = `pillar_${pillarBlocks[i]}`; continue; }
    simRe.lastIndex = 0;
    while ((m = simRe.exec(pillarBlocks[i])) !== null) {
      const conf = parseFloat(m[2]);
      records.push({
        workspace_id: "",
        jurisdiction,
        statute: "Extracted via Cockpit agent",
        article_section: m[1].trim(),
        pillar: currentPillar,
        confidence: conf,
        status: conf < 0.7 ? "needs_review" : "verified",
        excerpt: m[4].trim(),
        rationale: `Mapped to ${currentPillar} with confidence ${conf}. Citation: ${m[3]}.`,
        source_url: "",
      });
    }
  }

  // Run strategy 2 — JSON blocks
  jsonRe.lastIndex = 0;
  while ((m = jsonRe.exec(text)) !== null) {
    const conf = parseFloat(m[4]);
    // Avoid duplicates from strategy 1
    if (!records.some(r => r.article_section === m![2] && r.excerpt === m![3])) {
      records.push({
        workspace_id: "",
        jurisdiction,
        statute: "Extracted via Cockpit agent",
        article_section: m[2].trim(),
        pillar: m[1],
        confidence: conf,
        status: conf < 0.7 ? "needs_review" : "verified",
        excerpt: m[3].trim(),
        rationale: `Mapped to ${m[1]} with confidence ${conf}.`,
        source_url: "",
      });
    }
  }

  // Run strategy 3 — section-labelled prose
  sectionRe.lastIndex = 0;
  while ((m = sectionRe.exec(text)) !== null) {
    if (!records.some(r => r.excerpt === m![3])) {
      records.push({
        workspace_id: "",
        jurisdiction,
        statute: "Extracted via Cockpit agent",
        article_section: m[2].trim(),
        pillar: m[1],
        confidence: 0.75,
        status: "verified",
        excerpt: m[3].trim(),
        rationale: `Mapped to ${m[1]} from agent prose output.`,
        source_url: "",
      });
    }
  }

  return records;
}

export async function persistToSupabase(
  records: Omit<EvidenceRow, "workspace_id">[],
  workspaceId: string,
  jwt: string,
  query: string,
): Promise<number> {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) return 0;
  if (!records.length) return 0;

  // Use service role key but set workspace_id explicitly — bypasses RLS for server-side writes
  const sb = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: { persistSession: false },
    global: { headers: { Authorization: `Bearer ${jwt}` } },
  });

  const rows = records.map((r) => ({ ...r, workspace_id: workspaceId }));

  const [evRes, maRes] = await Promise.all([
    sb.from("evidence_records").insert(rows),
    sb.from("mapping_activity").insert({
      workspace_id: workspaceId,
      jurisdiction: [...new Set(records.map((r) => r.jurisdiction))].join(", "),
      detail: `${records.length} clause(s) extracted — "${query.slice(0, 80)}"`,
    }),
  ]);

  if (evRes.error) console.error("[persist] evidence_records insert error:", evRes.error.message);
  if (maRes.error) console.error("[persist] mapping_activity insert error:", maRes.error.message);

  return evRes.error ? 0 : rows.length;
}
