import { tool } from "langchain";
import { z } from "zod";

export const reportFormatter = tool(
  async ({ records, title }: { records: string; title?: string }) => {
    let parsed: any[];
    try {
      parsed = JSON.parse(records);
      if (!Array.isArray(parsed)) throw new Error("not array");
    } catch {
      return JSON.stringify({ error: "records must be a JSON array of EvidenceRecord objects" });
    }

    const byJurisdiction = parsed.reduce<Record<string, any[]>>((acc, r) => {
      const key = r.jurisdiction ?? r.iso3 ?? "unknown";
      (acc[key] ??= []).push(r);
      return acc;
    }, {});

    const byPillar = parsed.reduce<Record<string, any[]>>((acc, r) => {
      (acc[r.pillar ?? "unknown"] ??= []).push(r);
      return acc;
    }, {});

    const needsReview = parsed.filter(r => r.status === "needs_human_review" || r.status === "needs_review");
    const avgConf = parsed.length
      ? (parsed.reduce((s, r) => s + (r.confidence ?? 0), 0) / parsed.length).toFixed(2)
      : "N/A";

    // Markdown table
    const tableRows = parsed.map(r =>
      `| ${r.jurisdiction ?? ""} | ${r.pillar ?? ""} | ${r.articleRef ?? r.article_section ?? ""} | ${(r.confidence ?? 0).toFixed(2)} | ${r.status ?? ""} | ${(r.excerpt ?? r.originalExcerpt ?? "").slice(0, 80)}... |`
    );

    const markdown = [
      `# ${title ?? "Cockpit Intelligence — Evidence Report"}`,
      `\nGenerated: ${new Date().toISOString()}`,
      `\n## Summary`,
      `- Total records: ${parsed.length}`,
      `- Jurisdictions: ${Object.keys(byJurisdiction).join(", ")}`,
      `- Average confidence: ${avgConf}`,
      `- Needs human review: ${needsReview.length}`,
      `\n## Evidence Records`,
      `| Jurisdiction | Pillar | Article | Confidence | Status | Excerpt |`,
      `|---|---|---|---|---|---|`,
      ...tableRows,
      `\n## Coverage Gaps`,
      ...Object.entries(byJurisdiction).map(([jur, recs]) => {
        const pillars = new Set(recs.map(r => r.pillar));
        const missing = ["pillar_6", "pillar_7"].filter(p => !pillars.has(p));
        return missing.length ? `- ${jur}: missing ${missing.join(", ")}` : `- ${jur}: ✅ P6 + P7 covered`;
      }),
    ].join("\n");

    return JSON.stringify({
      title: title ?? "Cockpit Intelligence — Evidence Report",
      generatedAt: new Date().toISOString(),
      summary: {
        totalRecords: parsed.length,
        jurisdictions: Object.keys(byJurisdiction),
        pillarCoverage: Object.fromEntries(Object.entries(byPillar).map(([p, r]) => [p, r.length])),
        averageConfidence: parseFloat(avgConf),
        needsReview: needsReview.length,
      },
      records: parsed,
      markdown,
    });
  },
  {
    name: "report_formatter",
    description:
      "Assemble verified EvidenceRecord objects into a structured report with cross-jurisdiction comparison table, coverage gap analysis, and exportable JSON + markdown. Input must be a JSON array of EvidenceRecord objects.",
    schema: z.object({
      records: z.string().describe("JSON array of EvidenceRecord objects to format into a report."),
      title: z.string().optional().describe("Report title (default: 'Cockpit Intelligence — Evidence Report')."),
    }),
  }
);
