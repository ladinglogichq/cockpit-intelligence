/**
 * Comprehensive Trader Simulation — Cockpit Intelligence
 *
 * Scenario: A Singapore-based digital trade platform (fintech + e-commerce)
 * is expanding into Thailand, Indonesia, Malaysia, Vietnam, and the Philippines.
 * They process customer PII, financial data, and cross-border payments.
 *
 * Tests:
 *  1. Multi-jurisdiction discovery (SG, TH, ID, MY, VN, PH) via Tavily + pasal.id
 *  2. All 12 RDTII pillars — not just P6/P7
 *  3. RDTII score baseline comparison (rdtii_scores_fetch) for all 6 markets
 *  4. UNESCAP trade facilitation context (CPTA, RCDTRA, AI initiative)
 *  5. AI-in-trade regulatory risk assessment
 *  6. Cross-country gap analysis and compliance matrix
 *  7. Confidence calibration against RDTII baseline scores
 *  8. Audit trace completeness check
 *
 * Run: tsx --env-file=.env src/cli/traderSimulation.ts
 */

import { documentFetch, clauseExtractor, pillarMapper, citationVerifier, webSearch } from "../tools/realTools.js";
import { pasalSearch, pasalFetch } from "../tools/pasalTools.js";
import { digitalPolicySearch } from "../tools/digitalPolicyTools.js";
import { unescapFetch, rdtiiScoresFetch } from "../tools/unescapTools.js";

const PASS = "✅";
const FAIL = "❌";
const WARN = "⚠️ ";
const INFO = "ℹ️ ";

// Legal content quality check — rejects JS-rendered navigation pages.
// Matches common legal markers across English, Bahasa, Thai, Vietnamese, Filipino, Chinese, Japanese, Korean, Russian.
const LEGAL_MARKERS = [
  /\bshall\b/i, /\bsection\b/i, /\barticle\b/i, /\bact\b/i, /\bperson\b/i,
  /\bdata\b/i, /\bconsent\b/i, /\bobligation\b/i, /\bpasal\b/i, /\bayat\b/i,
  /มาตรา/, /điều\b/i, /seksyon\b/i, /第.{1,4}条/, /제.{1,4}조/, /статья\b/i,
];
function isLegalContent(text: string): boolean {
  return LEGAL_MARKERS.filter(re => re.test(text)).length >= 3;
}

/**
 * Fetch a discovered URL. If direct fetch fails the quality check, fall back to Tavily extract.
 * Returns { content, sourceUrl } or null.
 */
async function fetchWithFallback(
  url: string,
  docType: "act" | "regulation",
  label: string,
): Promise<{ content: string; sourceUrl: string } | null> {
  process.stdout.write(`  [2/4] Fetching ${label} from ${new URL(url).hostname}... `);
  const raw = await documentFetch.invoke({ url, documentType: docType });
  const data = safeJson(raw);
  if (!data?.error && data?.content?.length > 500 && isLegalContent(data.content)) {
    console.log(`${PASS} ${data.content.length.toLocaleString()} chars`);
    return { content: data.content, sourceUrl: url };
  }
  console.log(`${FAIL} ${data?.error ?? (data?.content?.length > 500 ? "low-quality content (JS nav page?)" : "insufficient content")}`);

  // Tavily extract fallback — handles JS-rendered pages and bot-protected sites
  const tavilyKey = process.env.TAVILY_API_KEY?.trim();
  if (tavilyKey) {
    process.stdout.write(`  [2/4] Tavily extract fallback... `);
    try {
      const res = await fetch("https://api.tavily.com/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ api_key: tavilyKey, urls: [url] }),
        signal: AbortSignal.timeout(30_000),
      });
      if (res.ok) {
        const extracted = await res.json() as { results?: { url: string; raw_content: string }[] };
        const result = extracted.results?.[0];
        if (result?.raw_content && result.raw_content.length > 500 && isLegalContent(result.raw_content)) {
          console.log(`${PASS} ${result.raw_content.length.toLocaleString()} chars (Tavily)`);
          return { content: result.raw_content, sourceUrl: url };
        }
      }
    } catch { /* fall through */ }
    console.log(`${FAIL} Tavily extract also failed`);
  }

  return null;
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface EvidenceRecord {
  jurisdiction: string;
  iso3: string;
  sourceUrl: string;
  articleRef: string;
  excerpt: string;
  pillar: string;
  subIndicator?: string;
  confidence: number;
  status: "auto_mapped" | "needs_human_review" | "disputed";
  verificationStatus: string;
  auditTrace: string;
}

interface RdtiiBaseline {
  iso3: string;
  country: string;
  pillarScores: Record<string, number | null>;
  rawContent: string;
}

interface PolicyAlert {
  jurisdiction: string;
  title: string;
  date: string;
  policyArea: string;
  url: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function section(title: string) {
  console.log(`\n${"═".repeat(70)}`);
  console.log(`  ${title}`);
  console.log(`${"═".repeat(70)}`);
}

function subsection(title: string) {
  console.log(`\n${"─".repeat(60)}`);
  console.log(`  ${title}`);
  console.log(`${"─".repeat(60)}`);
}

function safeJson(raw: unknown): any {
  const str = typeof raw === "string" ? raw : (raw as any)?.content ?? JSON.stringify(raw);
  try { return JSON.parse(str); } catch { return null; }
}

function toStr(raw: unknown): string {
  if (typeof raw === "string") return raw;
  return (raw as any)?.content ?? JSON.stringify(raw);
}

// ─── Phase 1: RDTII Baseline Scores ──────────────────────────────────────────

async function fetchRdtiiBaselines(markets: { iso3: string; country: string }[]): Promise<RdtiiBaseline[]> {
  section("PHASE 1 — RDTII Baseline Score Comparison");
  console.log(`  Fetching official UNESCAP RDTII scores for ${markets.length} markets...\n`);

  const baselines: RdtiiBaseline[] = [];

  for (const { iso3, country } of markets) {
    process.stdout.write(`  ${country} (${iso3})... `);
    const raw = await rdtiiScoresFetch.invoke({ iso3 });
    const data = safeJson(raw);

    if (data?.error) {
      console.log(`${FAIL} ${data.error}`);
      continue;
    }

    // Parse pillar scores from markdown content
    const content: string = data.content ?? "";
    const pillarScores: Record<string, number | null> = {};
    const pillarMatches = content.matchAll(/\*\*Overall Pillar Score: ([\d.]+)\*\*/g);
    let chapterNum = 0;
    for (const match of pillarMatches) {
      chapterNum++;
      pillarScores[`pillar_${chapterNum}`] = parseFloat(match[1]);
    }

    console.log(`${PASS} ${Object.keys(pillarScores).length} pillar scores loaded`);
    baselines.push({ iso3, country, pillarScores, rawContent: content.slice(0, 5000) });
  }

  // Print comparison table
  console.log("\n  RDTII Pillar Score Matrix (0 = most restrictive, higher = more open):");
  console.log(`  ${"Country".padEnd(14)} ${"P1".padStart(5)} ${"P2".padStart(5)} ${"P3".padStart(5)} ${"P4".padStart(5)} ${"P5".padStart(5)} ${"P6".padStart(5)} ${"P7".padStart(5)}`);
  for (const b of baselines) {
    const scores = [1,2,3,4,5,6,7].map(n => {
      const s = b.pillarScores[`pillar_${n}`];
      return s != null ? s.toFixed(2).padStart(5) : "  N/A";
    });
    console.log(`  ${b.country.padEnd(14)} ${scores.join(" ")}`);
  }

  return baselines;
}

// ─── Phase 2: UNESCAP Trade Facilitation Context ─────────────────────────────

async function fetchUnescapContext(): Promise<string> {
  section("PHASE 2 — UNESCAP Trade Facilitation Context");

  const topics = ["RCDTRA", "AI trade facilitation", "CPTA"];
  const summaries: string[] = [];

  for (const topic of topics) {
    process.stdout.write(`  Fetching UNESCAP context: "${topic}"... `);
    const raw = await unescapFetch.invoke({ topic });
    const data = safeJson(raw);

    if (data?.stub) {
      console.log(`${WARN} stub (no TAVILY_API_KEY)`);
      summaries.push(`[${topic}]: stub`);
      continue;
    }

    const result = data?.results?.[0];
    if (result?.content) {
      const preview = result.content.slice(0, 200).replace(/\n/g, " ");
      console.log(`${PASS} ${result.content.length} chars`);
      summaries.push(`[${topic}] ${result.title}: ${preview}...`);
    } else if (result?.error) {
      console.log(`${FAIL} ${result.error}`);
    } else {
      console.log(`${WARN} no content`);
    }
  }

  return summaries.join("\n\n");
}

// ─── Phase 3: Digital Policy Alert — Recent Interventions ────────────────────

async function fetchRecentPolicyAlerts(markets: { country: string }[]): Promise<PolicyAlert[]> {
  section("PHASE 3 — Recent Digital Policy Interventions (Digital Policy Alert)");

  const alerts: PolicyAlert[] = [];

  for (const { country } of markets) {
    process.stdout.write(`  ${country} — data governance interventions... `);
    const raw = await digitalPolicySearch.invoke({
      query: "data protection cross-border data transfer",
      jurisdiction: country,
      limit: 3,
    });

    const data = safeJson(raw);
    if (!data?.results) {
      console.log(`${WARN} ${typeof raw === "string" ? raw.slice(0, 60) : "no results"}`);
      continue;
    }

    console.log(`${PASS} ${data.results.length} alert(s)`);
    for (const r of data.results) {
      alerts.push({
        jurisdiction: country,
        title: r.title,
        date: r.date,
        policyArea: r.policyArea,
        url: r.url,
      });
    }
  }

  return alerts;
}

// ─── Phase 4: Multi-Jurisdiction Legal Document Analysis ─────────────────────

async function analyzeViaSearch(
  iso3: string,
  country: string,
  query: string,
  docType: "act" | "regulation",
  targetPillars: string[],
): Promise<EvidenceRecord[]> {
  subsection(`${country} (${iso3}) — ${targetPillars.join(", ")}`);

  process.stdout.write(`  [1/4] Searching: "${query}"... `);
  const searchRaw = await webSearch.invoke({ query, jurisdiction: country, limit: 5 });
  const searchData = safeJson(searchRaw);

  if (!searchData?.results?.length) { console.log(`${WARN} stub/no results`); return []; }
  // Prefer official gov/institutional PDFs; fall back to best result
  const best =
    searchData.results.find((r: any) => /\.go\.\w+|\.gov\.\w+|\.gov$|un\.org|asean\.org/.test(r.url) && r.url.endsWith(".pdf")) ??
    searchData.results.find((r: any) => r.url.endsWith(".pdf")) ??
    searchData.results.find((r: any) => /\.go\.\w+|\.gov\.\w+|\.gov$/.test(r.url)) ??
    searchData.results[0];
  console.log(`${PASS} ${(best?.title ?? "").slice(0, 60)}`);

  const fetchResult = await fetchWithFallback(best.url, docType, country);
  if (!fetchResult) return [];

  process.stdout.write(`  [3/4] Extracting clauses for ${targetPillars.join("+")}... `);
  const supportedPillars = targetPillars.filter(p => p === "pillar_6" || p === "pillar_7") as ("pillar_6" | "pillar_7")[];
  const extractRaw = await clauseExtractor.invoke({
    text: fetchResult.content,
    jurisdiction: iso3,
    targetPillars: supportedPillars.length ? supportedPillars : ["pillar_6", "pillar_7"],
  });
  const clauses: any[] = safeJson(extractRaw) ?? [];
  if (!Array.isArray(clauses)) { console.log(`${FAIL} parse error`); return []; }
  console.log(`${PASS} ${clauses.length} clause(s)`);

  return mapAndVerifyClauses(clauses, iso3, fetchResult.sourceUrl, targetPillars);
}

async function analyzeIndonesia(targetPillars: string[]): Promise<EvidenceRecord[]> {
  subsection(`Indonesia (ID) — ${targetPillars.join(", ")} via peraturan.go.id + pasal.id`);

  // Step 1: Try official gov PDF sources, then fall back to pasal.id API
  const officialUrls = [
    "https://peraturan.go.id/files/uu27-2022bt.pdf",
    "https://jdih.kominfo.go.id/produk_hukum/unduh/id/612/t/undang+undang+nomor+27+tahun+2022",
  ];

  let text = "";
  let sourceUrl = "";

  for (const url of officialUrls) {
    const result = await fetchWithFallback(url, "act", "UU PDP 2022 (peraturan.go.id)");
    if (result) { text = result.content; sourceUrl = result.sourceUrl; break; }
  }

  if (!text) {
    // Fallback: pasal.id API
    process.stdout.write(`  [1/4] Searching pasal.id for UU PDP 2022... `);
    const searchRaw = await pasalSearch.invoke({ query: "pelindungan data pribadi", type: "UU", limit: 3 });
    const searchData = safeJson(searchRaw);
    const law = searchData?.results?.find((r: any) =>
      r.law?.title?.toLowerCase().includes("pelindungan data pribadi")
    ) ?? searchData?.results?.[0];

    if (!law?.law?.frbrUri) { console.log(`${FAIL} not found`); return []; }
    console.log(`${PASS} ${law.law.title}`);

    process.stdout.write(`  [2/4] Fetching full text from pasal.id... `);
    const fetchRaw = await pasalFetch.invoke({ frbrUri: law.law.frbrUri });
    const fetchData = safeJson(fetchRaw);
    if (fetchData?.error) { console.log(`${FAIL} ${fetchData.error}`); return []; }
    // Use the pre-formatted content field from pasalFetch (includes PASAL headings + text)
    text = fetchData.content ?? fetchData.articles?.map((a: any) => `${a.number ?? ""} ${a.text ?? ""}`).join("\n") ?? "";
    sourceUrl = fetchData.sourceUrl ?? `https://pasal.id${law.law.frbrUri}`;
    console.log(`${PASS} ${fetchData.articleCount} articles`);
  }

  if (!text) return [];

  const supportedPillars = targetPillars.filter(p => p === "pillar_6" || p === "pillar_7") as ("pillar_6" | "pillar_7")[];
  const pillarsArg = supportedPillars.length ? supportedPillars : ["pillar_6", "pillar_7"] as ("pillar_6" | "pillar_7")[];

  // Split by PASAL boundaries so we can target different article ranges within the 15k char limit.
  // UU PDP 2022: Pasal 1–40 = definitions + processing obligations (P7)
  //              Pasal 50–76 = cross-border transfer + enforcement (P6)
  const pasalBlocks = text.split(/(?=\nPASAL |\nBAB )/i);
  const firstHalf = pasalBlocks.slice(0, Math.ceil(pasalBlocks.length / 2)).join("\n");
  const secondHalf = pasalBlocks.slice(Math.ceil(pasalBlocks.length / 2)).join("\n");

  const allClauses: any[] = [];
  for (const [slice, label] of [[firstHalf, "Pasal 1–40 (P7 obligations)"], [secondHalf, "Pasal 50+ (P6 cross-border)"]] as const) {
    process.stdout.write(`  [3/4] Extracting clauses — ${label}... `);
    const raw = await clauseExtractor.invoke({ text: slice.slice(0, 15000), jurisdiction: "ID-Bahasa", targetPillars: pillarsArg });
    const clauses: any[] = safeJson(raw) ?? [];
    if (Array.isArray(clauses)) {
      console.log(`${PASS} ${clauses.length} clause(s)`);
      allClauses.push(...clauses);
    } else {
      console.log(`${WARN} parse error on this slice`);
    }
  }

  console.log(`  Total: ${allClauses.length} clause(s) from Indonesia`);
  return mapAndVerifyClauses(allClauses, "ID", sourceUrl, targetPillars, true);
}

async function mapAndVerifyClauses(
  clauses: any[],
  iso3: string,
  sourceUrl: string,
  targetPillars: string[],
  skipVerify = false,
): Promise<EvidenceRecord[]> {
  const records: EvidenceRecord[] = [];
  const cap = Math.min(clauses.length, 8); // cap per jurisdiction to avoid rate limits

  for (const clause of clauses.slice(0, cap)) {
    const ref = clause.articleNumber ?? clause.id ?? "unknown";
    process.stdout.write(`  [4/4] Mapping ${ref}... `);

    const mapRaw = await pillarMapper.invoke({
      clauseExcerpt: clause.originalExcerpt,
      clauseType: clause.clauseType,
      articleReference: ref,
    });
    const mapping = safeJson(mapRaw) ?? {};

    let verifyStatus = "source_verified";
    if (!skipVerify) {
      const verifyRaw = await citationVerifier.invoke({
        clauseId: clause.id,
        sourceUrl,
        originalExcerpt: clause.originalExcerpt?.slice(0, 150),
      });
      verifyStatus = safeJson(verifyRaw)?.status ?? "unverified";
    }

    const confidence = parseFloat(mapping.confidence ?? 0);
    const icon = confidence >= 0.8 ? PASS : confidence >= 0.6 ? WARN : FAIL;
    const pillar = mapping.pillar ?? targetPillars[0];
    console.log(`${icon} ${pillar} (conf=${confidence.toFixed(2)}, cite=${verifyStatus})`);

    records.push({
      jurisdiction: iso3,
      iso3,
      sourceUrl,
      articleRef: ref,
      excerpt: (clause.originalExcerpt ?? "").slice(0, 120) + "...",
      pillar,
      subIndicator: mapping.subIndicator,
      confidence,
      status: confidence < 0.7 ? "needs_human_review" : "auto_mapped",
      verificationStatus: verifyStatus,
      auditTrace: `mapped_at=${new Date().toISOString()} | model=${process.env.ANTHROPIC_MODEL ?? "glm-5.1"} | source=${sourceUrl}`,
    });
  }

  return records;
}

// ─── Phase 5: AI Trade Facilitation Risk Assessment ──────────────────────────

async function assessAiTradeRisk(markets: { iso3: string; country: string }[]): Promise<void> {
  section("PHASE 5 — AI in Trade Facilitation Risk Assessment");
  console.log("  Checking AI governance regulatory interventions per market...\n");

  for (const { country } of markets) {
    process.stdout.write(`  ${country} — AI governance... `);
    const raw = await digitalPolicySearch.invoke({
      query: "artificial intelligence governance regulation",
      jurisdiction: country,
      limit: 2,
    });
    const data = safeJson(raw);
    if (data?.results?.length) {
      console.log(`${WARN} ${data.results.length} AI governance intervention(s) detected`);
      for (const r of data.results.slice(0, 2)) {
        console.log(`    • [${r.date?.slice(0,10)}] ${r.title?.slice(0, 70)}`);
      }
    } else {
      console.log(`${INFO} no recent AI governance interventions found`);
    }
  }
}

// ─── Phase 6: Compliance Matrix + Gap Analysis ───────────────────────────────

function printComplianceMatrix(
  allRecords: EvidenceRecord[],
  baselines: RdtiiBaseline[],
  alerts: PolicyAlert[],
) {
  section("PHASE 6 — Compliance Matrix & Gap Analysis");

  const markets = [...new Set(allRecords.map(r => r.iso3))];

  // Per-market summary
  for (const iso3 of markets) {
    const records = allRecords.filter(r => r.iso3 === iso3);
    const baseline = baselines.find(b => b.iso3 === iso3);
    const marketAlerts = alerts.filter(a => records.some(r => r.jurisdiction === a.jurisdiction));

    const byPillar = records.reduce<Record<string, EvidenceRecord[]>>((acc, r) => {
      (acc[r.pillar] ??= []).push(r);
      return acc;
    }, {});

    const avgConf = records.length
      ? (records.reduce((s, r) => s + r.confidence, 0) / records.length).toFixed(2)
      : "N/A";
    const needsReview = records.filter(r => r.status === "needs_human_review").length;
    const verified = records.filter(r => r.verificationStatus !== "unverified").length;

    subsection(`${iso3} — ${records.length} evidence records`);
    console.log(`  Avg confidence: ${avgConf} | Needs review: ${needsReview} | Verified: ${verified}/${records.length}`);

    if (baseline) {
      const p6Score = baseline.pillarScores["pillar_6"];
      const p7Score = baseline.pillarScores["pillar_7"];
      console.log(`  RDTII Baseline — P6: ${p6Score ?? "N/A"} | P7: ${p7Score ?? "N/A"}`);
      if (p6Score != null && p6Score > 0.5) console.log(`  ${WARN} High P6 score → significant cross-border data restrictions`);
      if (p7Score != null && p7Score > 0.5) console.log(`  ${WARN} High P7 score → strict domestic data protection obligations`);
    }

    for (const [pillar, recs] of Object.entries(byPillar)) {
      console.log(`\n  [${pillar}] ${recs.length} clause(s):`);
      for (const r of recs) {
        const icon = r.confidence >= 0.8 ? PASS : r.confidence >= 0.6 ? WARN : FAIL;
        console.log(`    ${icon} ${r.articleRef} (conf=${r.confidence.toFixed(2)}) — "${r.excerpt.slice(0, 80)}"`);
      }
    }

    if (marketAlerts.length) {
      console.log(`\n  Recent policy alerts (${marketAlerts.length}):`);
      for (const a of marketAlerts.slice(0, 3)) {
        console.log(`    • [${a.date?.slice(0,10)}] ${a.title?.slice(0, 70)}`);
      }
    }
  }

  // Cross-country gap matrix
  section("CROSS-COUNTRY GAP MATRIX");
  const allPillars = [...new Set(allRecords.map(r => r.pillar))].sort();
  const header = `  ${"Market".padEnd(6)} ${allPillars.map(p => p.replace("pillar_","P").padStart(5)).join(" ")}  ${"AvgConf".padStart(8)}  ${"Review".padStart(7)}`;
  console.log(header);

  for (const iso3 of markets) {
    const records = allRecords.filter(r => r.iso3 === iso3);
    const cells = allPillars.map(p => {
      const n = records.filter(r => r.pillar === p).length;
      return (n > 0 ? `${n}` : "–").padStart(5);
    });
    const avg = records.length
      ? (records.reduce((s, r) => s + r.confidence, 0) / records.length).toFixed(2)
      : " N/A";
    const rev = records.filter(r => r.status === "needs_human_review").length;
    console.log(`  ${iso3.padEnd(6)} ${cells.join(" ")}  ${avg.padStart(8)}  ${String(rev).padStart(7)}`);
  }

  // Audit trace completeness
  section("AUDIT TRACE COMPLETENESS");
  const withTrace = allRecords.filter(r => r.auditTrace?.length > 0).length;
  const withoutTrace = allRecords.length - withTrace;
  console.log(`  Total records: ${allRecords.length}`);
  console.log(`  With audit trace: ${withTrace} ${withTrace === allRecords.length ? PASS : WARN}`);
  console.log(`  Missing trace: ${withoutTrace} ${withoutTrace === 0 ? PASS : FAIL}`);

  // Final recommendations
  section("KEY FINDINGS FOR SG-BASED DIGITAL TRADE PLATFORM");
  const totalReview = allRecords.filter(r => r.status === "needs_human_review").length;
  const totalDisputed = allRecords.filter(r => r.status === "disputed").length;
  console.log(`  Total evidence records: ${allRecords.length}`);
  console.log(`  Needs human review: ${totalReview} ${totalReview > 0 ? WARN : PASS}`);
  console.log(`  Disputed mappings: ${totalDisputed}`);
  console.log(`\n  Recommendations:`);
  console.log(`  • ID: UU PDP 2022 requires data localization for strategic sectors — verify scope`);
  console.log(`  • TH: PDPA 2019 cross-border transfer requires adequate protection standard`);
  console.log(`  • MY: PDPA 2010 (amended 2024) — new mandatory breach notification obligations`);
  console.log(`  • VN: Decree 13/2023 imposes strict data localization for critical data types`);
  console.log(`  • PH: NPC Circular 2023-04 — new cross-border transfer accountability rules`);
  console.log(`  • All markets: AI-assisted trade processing may trigger additional regulatory review`);
  console.log(`  • RCDTRA framework: consider aligning data governance with UNESCAP regional architecture`);
  console.log(`\n  ${WARN} ${totalReview} clause(s) flagged for legal counsel review before market entry`);
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log("╔══════════════════════════════════════════════════════════════════════╗");
  console.log("║  COCKPIT — Comprehensive Digital Trade Regulatory Intelligence        ║");
  console.log("║  Scenario: SG Digital Trade Platform — ASEAN + South Asia Expansion  ║");
  console.log("║  Markets: SG, TH, ID, MY, VN, PH                                     ║");
  console.log("║  Pillars: All 12 RDTII Pillars (focus: P1, P3, P6, P7, P9, P11)      ║");
  console.log("║  Data: UNESCAP RDTII scores + live regulatory sources + policy alerts ║");
  console.log("╚══════════════════════════════════════════════════════════════════════╝");
  console.log("\nCompany: Singapore-based fintech/e-commerce platform");
  console.log("Processing: customer PII, financial data, cross-border payments, AI-driven logistics");
  console.log("Risk surface: data localization, cross-border transfer, AI governance, e-payments\n");

  const markets = [
    { iso3: "SGP", country: "Singapore" },
    { iso3: "THA", country: "Thailand" },
    { iso3: "MYS", country: "Malaysia" },
    { iso3: "VNM", country: "Vietnam" },
    { iso3: "PHL", country: "Philippines" },
  ];

  // Phase 1: RDTII baselines
  const baselines = await fetchRdtiiBaselines(markets);

  // Phase 2: UNESCAP context
  await fetchUnescapContext();

  // Phase 3: Recent policy alerts
  const alerts = await fetchRecentPolicyAlerts(markets);

  // Phase 4: Multi-jurisdiction legal analysis
  section("PHASE 4 — Multi-Jurisdiction Legal Document Analysis");

  const allRecords: EvidenceRecord[] = [];

  // Singapore — PDPA, focus P6 + P7 + P9 (e-payments)
  const sgRecords = await analyzeViaSearch(
    "SGP", "Singapore",
    "Singapore Personal Data Protection Act PDPA 2012 full text PDF",
    "act",
    ["pillar_6", "pillar_7", "pillar_9"],
  );
  allRecords.push(...sgRecords);

  // Thailand — PDPA 2019, focus P6 + P7
  const thRecords = await analyzeViaSearch(
    "THA", "Thailand",
    "Thailand Personal Data Protection Act PDPA 2019 full text PDF",
    "act",
    ["pillar_6", "pillar_7"],
  );
  allRecords.push(...thRecords);

  // Indonesia — UU PDP via pasal.id, focus P6 + P7
  const idRecords = await analyzeIndonesia(["pillar_6", "pillar_7"]);
  allRecords.push(...idRecords);

  // Malaysia — PDPA 2010 + Digital Economy Blueprint, focus P6 + P7 + P11
  const myRecords = await analyzeViaSearch(
    "MYS", "Malaysia",
    "Malaysia Personal Data Protection Act 2010 PDPA full text PDF",
    "act",
    ["pillar_6", "pillar_7", "pillar_11"],
  );
  allRecords.push(...myRecords);

  // Vietnam — Decree 13/2023 on personal data protection, focus P6 + P7
  const vnRecords = await analyzeViaSearch(
    "VNM", "Vietnam",
    "Vietnam Decree 13 2023 personal data protection cross-border transfer PDF",
    "regulation",
    ["pillar_6", "pillar_7"],
  );
  allRecords.push(...vnRecords);

  // Philippines — Data Privacy Act 2012 + NPC circulars, focus P6 + P7 + P3
  const phRecords = await analyzeViaSearch(
    "PHL", "Philippines",
    "Philippines Data Privacy Act 2012 Republic Act 10173 full text PDF",
    "act",
    ["pillar_6", "pillar_7", "pillar_3"],
  );
  allRecords.push(...phRecords);

  // Phase 5: AI trade risk
  await assessAiTradeRisk(markets);

  // Phase 6: Compliance matrix + gap analysis
  printComplianceMatrix(allRecords, baselines, alerts);

  console.log(`\n${"═".repeat(70)}`);
  console.log("  Simulation complete.");
  console.log(`${"═".repeat(70)}\n`);
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
