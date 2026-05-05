/**
 * Scrapes 7 UNESCAP/UNECA trade intelligence URLs and writes markdown files
 * to context/domain/unescap/<slug>.md for use by the Cockpit agent pipeline.
 *
 * Usage: tsx scripts/ingest-unescap.ts
 */
import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT_DIR = path.join(REPO_ROOT, "context/domain/unescap");

const SOURCES = [
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

async function scrapeUrl(url: string): Promise<string> {
  const tavilyKey = process.env.TAVILY_API_KEY?.trim();

  // Try Tavily extract first (handles bot-protected sites)
  if (tavilyKey) {
    const res = await fetch("https://api.tavily.com/extract", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ api_key: tavilyKey, urls: [url] }),
      signal: AbortSignal.timeout(30_000),
    });
    if (res.ok) {
      const data = await res.json() as {
        results?: { url: string; raw_content: string }[];
        failed_results?: { url: string; error: string }[];
      };
      const result = data.results?.[0];
      if (result?.raw_content && result.raw_content.length > 100) {
        return result.raw_content.trim();
      }
      const failed = data.failed_results?.[0];
      if (failed) throw new Error(`Tavily extract failed: ${failed.error}`);
    }
  }

  // Fallback: direct fetch
  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      Accept: "text/html,application/xhtml+xml",
    },
    signal: AbortSignal.timeout(20_000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);

  const html = await res.text();
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  const pageTitle = titleMatch?.[1]?.trim() ?? "";
  const cleaned = html
    .replace(/<(script|style|nav|header|footer|aside)[^>]*>[\s\S]*?<\/\1>/gi, "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#\d+;/g, " ")
    .replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim();
  const lines = cleaned.split("\n").map((l) => l.trim()).filter((l) => l.length > 20);
  return [pageTitle ? `# ${pageTitle}\n` : "", lines.join("\n")].join("\n");
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });

  for (const src of SOURCES) {
    const outPath = path.join(OUT_DIR, `${src.slug}.md`);
    let body: string;

    try {
      console.log(`Fetching: ${src.url}`);
      const text = await scrapeUrl(src.url);
      body = `---
title: "${src.title}"
url: "${src.url}"
topic: "${src.topic}"
scraped_at: "${new Date().toISOString()}"
status: ok
---

${text}
`;
      console.log(`  ✓ ${src.slug}.md (${text.length} chars)`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.warn(`  ✗ ${src.slug}: ${msg}`);
      body = `---
title: "${src.title}"
url: "${src.url}"
topic: "${src.topic}"
scraped_at: "${new Date().toISOString()}"
status: error
error: "${msg}"
---

# ${src.title}

Source URL: ${src.url}
Topics: ${src.topic}

> Scraping failed: ${msg}
> Re-run \`tsx scripts/ingest-unescap.ts\` or manually paste content here.
`;
    }

    await writeFile(outPath, body, "utf8");
  }

  console.log(`\nDone. Files written to context/domain/unescap/`);
}

main().catch((e) => { console.error(e); process.exit(1); });
