import { tool } from "langchain";
import { z } from "zod";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../../..");

// ============================================================================
// Tool: rdtii_scores_fetch
// ============================================================================

const ISO3_MAP: Record<string, string> = {
  ARM: "arm", AUS: "aus", AZE: "aze", BGD: "bgd", BRN: "brn", BTN: "btn",
  CHN: "chn", GEO: "geo", HKG: "hkg", IND: "ind", JPN: "jpn", KAZ: "kaz",
  KGZ: "kgz", KHM: "khm", KOR: "kor", LAO: "lao", MMR: "mmr", MNG: "mng",
  MYS: "mys", NPL: "npl", NZL: "nzl", PAK: "pak", PHL: "phl", PNG: "png",
  RUS: "rus", SGP: "sgp", THA: "tha", TKM: "tkm", TUR: "tur", VNM: "vnm",
  VUT: "vut",
};

export const rdtiiScoresFetch = tool(
  async ({ iso3, chapter }: { iso3: string; chapter?: number }) => {
    const slug = ISO3_MAP[iso3.toUpperCase()];
    if (!slug) {
      return JSON.stringify({ error: `Unknown ISO3 code: ${iso3}`, available: Object.keys(ISO3_MAP) });
    }
    const filePath = path.join(REPO_ROOT, "context/domain/rdtii-scores", `${slug}.md`);
    let content: string;
    try {
      content = await readFile(filePath, "utf8");
    } catch {
      return JSON.stringify({ error: `RDTII score file not found for ${iso3}. Run scripts/convert-rdtii-xlsx.py to generate it.` });
    }
    if (chapter !== undefined) {
      const match = content.match(new RegExp(`(## Chapter ${chapter}[\\s\\S]*?)(?=## Chapter \\d|$)`));
      if (!match) return JSON.stringify({ error: `Chapter ${chapter} not found for ${iso3}` });
      return JSON.stringify({ iso3, chapter, content: match[1].trim() });
    }
    return JSON.stringify({ iso3, content: content.slice(0, 50_000) });
  },
  {
    name: "rdtii_scores_fetch",
    description:
      "Retrieve UNESCAP RDTII (Regulatory Digital Trade Integration Index) score data for a specific country. Returns indicator-level scores, source legislation, evidence/impact text, and references for all 12 RDTII chapters. Available for 31 Asia-Pacific countries: ARM, AUS, AZE, BGD, BRN, BTN, CHN, GEO, HKG, IND, JPN, KAZ, KGZ, KHM, KOR, LAO, MMR, MNG, MYS, NPL, NZL, PAK, PHL, PNG, RUS, SGP, THA, TKM, TUR, VNM, VUT. Use for pillar mapping calibration, cross-country comparison, and evidence verification.",
    schema: z.object({
      iso3: z.string().length(3).describe("ISO 3166-1 alpha-3 country code (e.g. 'SGP', 'THA', 'IND')."),
      chapter: z.number().int().min(1).max(12).optional().describe("Filter to a specific RDTII chapter (1–12). Omit to return all chapters."),
    }),
  }
);

// ============================================================================
// Tool: unescap_fetch
// ============================================================================

export const UNESCAP_SOURCES = [
  {
    slug: "cpta",
    title: "UNESCAP – Capacity Building Programme on Trade Agreements (CPTA)",
    url: "https://www.unescap.org/projects/cpta",
    topic: "trade facilitation, capacity building, trade agreements",
  },
  {
    slug: "digital-trade-regulatory-review-2025",
    title: "UNESCAP – Digital Trade Regulatory Review: Asia and the Pacific 2025",
    url: "https://www.unescap.org/kp/2025/digital-trade-regulatory-review-asia-and-pacific-2025",
    topic: "digital trade regulation, RDTII, Asia-Pacific 2025",
  },
  {
    slug: "aptir-2025",
    title: "UNESCAP – Asia-Pacific Trade and Investment Report 2025 (APTIR)",
    url: "https://www.unescap.org/kp/APTIR2025",
    topic: "trade investment, Asia-Pacific, annual report 2025",
  },
  {
    slug: "ai-trade-facilitation",
    title: "UNESCAP – Artificial Intelligence (AI) Trade Facilitation Initiative",
    url: "https://www.unescap.org/news/artificial-intelligence-ai-trade-facilitation-initiative",
    topic: "AI, trade facilitation, digital trade, automation",
  },
  {
    slug: "dtri-trade-integration",
    title: "UNECA/ESCAP – Digital Trade Regulatory Integration (DTRI) Trade Integration",
    url: "https://dtri.uneca.org/escap/trade-integration",
    topic: "RDTII, digital trade integration, regulatory framework",
  },
  {
    slug: "generative-ai-trade-facilitation",
    title: "UNESCAP Blog – Generative AI in Trade Facilitation and Control",
    url: "https://www.unescap.org/blog/generative-ai-trade-facilitation-and-control-prefer-integration-revolution",
    topic: "generative AI, trade facilitation, customs, digital trade",
  },
  {
    slug: "rcdtra",
    title: "UNESCAP – Regional Cooperative Digital Trade Regulatory Architecture (RCDTRA)",
    url: "https://www.unescap.org/projects/rcdtra",
    topic: "digital trade regulation, regional cooperation, Asia-Pacific",
  },
] as const;

export const unescapFetch = tool(
  async ({ topic, url }: { topic?: string; url?: string }) => {
    const tavilyKey = process.env.TAVILY_API_KEY?.trim();

    const targets = url
      ? UNESCAP_SOURCES.filter((s) => s.url === url)
      : topic
        ? UNESCAP_SOURCES.filter((s) =>
            s.topic.toLowerCase().includes(topic.toLowerCase()) ||
            s.title.toLowerCase().includes(topic.toLowerCase()) ||
            s.slug.includes(topic.toLowerCase().replace(/\s+/g, "-"))
          )
        : [...UNESCAP_SOURCES];

    if (targets.length === 0) {
      return JSON.stringify({ error: "No matching UNESCAP sources found.", availableSlugs: UNESCAP_SOURCES.map((s) => s.slug) });
    }

    if (!tavilyKey) {
      return JSON.stringify({
        stub: true,
        message: "Set TAVILY_API_KEY to enable live UNESCAP fetching.",
        sources: targets.map((s) => ({ slug: s.slug, title: s.title, url: s.url, topic: s.topic })),
      });
    }

    const results = await Promise.all(
      targets.map(async (src) => {
        try {
          const res = await fetch("https://api.tavily.com/extract", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ api_key: tavilyKey, urls: [src.url] }),
            signal: AbortSignal.timeout(30_000),
          });
          if (!res.ok) throw new Error(`Tavily HTTP ${res.status}`);
          const data = await res.json() as {
            results?: { url: string; raw_content: string }[];
            failed_results?: { url: string; error: string }[];
          };
          const extracted = data.results?.[0];
          if (extracted?.raw_content) {
            return { slug: src.slug, title: src.title, url: src.url, topic: src.topic, content: extracted.raw_content.slice(0, 20_000) };
          }
          const failed = data.failed_results?.[0];
          return { slug: src.slug, title: src.title, url: src.url, topic: src.topic, error: failed?.error ?? "No content returned" };
        } catch (err) {
          return { slug: src.slug, title: src.title, url: src.url, topic: src.topic, error: (err as Error).message };
        }
      })
    );

    return JSON.stringify({ total: results.length, results });
  },
  {
    name: "unescap_fetch",
    description:
      "Fetch live content from UNESCAP/UNECA trade intelligence sources covering: CPTA (trade agreements capacity building), Digital Trade Regulatory Review Asia-Pacific 2025, APTIR 2025, AI Trade Facilitation Initiative, DTRI Trade Integration, Generative AI in Trade Facilitation, and RCDTRA (Regional Cooperative Digital Trade Regulatory Architecture). Use for discovery of UNESCAP regulatory programs, trade facilitation frameworks, and RDTII-aligned policy context. Filter by topic keyword or exact URL, or omit both to fetch all sources.",
    schema: z.object({
      topic: z.string().optional().describe("Keyword to filter sources (e.g. 'AI', 'RCDTRA', 'digital trade', 'trade facilitation')."),
      url: z.string().url().optional().describe("Fetch a specific UNESCAP source by exact URL."),
    }),
  }
);
