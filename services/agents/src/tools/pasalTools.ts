import { tool } from "langchain";
import { z } from "zod";

const BASE_URL = "https://pasal.id/api/v1";

function pasalHeaders(): HeadersInit {
  const token = process.env.PASAL_API_TOKEN?.trim();
  if (!token) throw new Error("PASAL_API_TOKEN is not set.");
  return { Authorization: `Bearer ${token}` };
}

/** Search Indonesian regulations by keyword via pasal.id */
export const pasalSearch = tool(
  async ({ query, type, limit }: { query: string; type?: string; limit?: number }) => {
    const params = new URLSearchParams({ q: query, limit: String(Math.min(limit ?? 10, 20)) });
    if (type) params.set("type", type);

    const res = await fetch(`${BASE_URL}/search?${params}`, { headers: pasalHeaders() });

    if (!res.ok) {
      if (res.status === 429) throw new Error("pasal.id rate limit hit — retry after backoff");
      throw new Error(`pasal.id search failed: ${res.status}`);
    }

    const data = await res.json() as {
      query: string;
      total: number;
      results: {
        id: number;
        snippet: string;
        score: number;
        metadata: { type: string; node_type: string; node_number: string };
        work: { frbr_uri: string; title: string; number: string; year: number; status: string; type: string };
      }[];
      did_you_mean?: { work_id: number; similarity: number; work: { frbr_uri: string; title: string } }[];
    };

    return JSON.stringify({
      total: data.total,
      results: data.results.map((r) => ({
        snippet: r.snippet,
        score: r.score,
        articleNumber: `${r.metadata.node_type} ${r.metadata.node_number}`,
        law: {
          frbrUri: r.work.frbr_uri,
          title: r.work.title,
          number: r.work.number,
          year: r.work.year,
          status: r.work.status,
          type: r.work.type,
          sourceUrl: `https://pasal.id/peraturan/${r.work.type.toLowerCase()}/${r.work.frbr_uri.split("/").pop()}`,
        },
      })),
      ...(data.did_you_mean?.length ? { didYouMean: data.did_you_mean.map((d) => d.work.title) } : {}),
    });
  },
  {
    name: "pasal_search",
    description:
      "Search Indonesian legal regulations on pasal.id by keyword. Returns structured clauses with article references and law metadata. Use for jurisdiction ID (Indonesia). Supports filtering by regulation type (UU, PP, PERPRES, PERMEN, PERDA, etc.).",
    schema: z.object({
      query: z.string().min(2).describe("Search keyword in Indonesian or English (e.g. 'perlindungan data pribadi', 'transfer data')."),
      type: z
        .enum(["UU", "PP", "PERPRES", "PERMEN", "PERPPU", "PERDA", "POJK", "PBI", "KEPMEN"])
        .optional()
        .describe("Filter by regulation type. UU = national law, PP = government regulation, PERPRES = presidential regulation."),
      limit: z.number().int().min(1).max(20).optional().describe("Max results (default 10, max 20)."),
    }),
  }
);

/** Fetch full articles of an Indonesian regulation by FRBR URI via pasal.id */
export const pasalFetch = tool(
  async ({ frbrUri }: { frbrUri: string }) => {
    // Normalize: strip leading slash
    const path = frbrUri.replace(/^\//, "");

    const res = await fetch(`${BASE_URL}/laws/${path}`, { headers: pasalHeaders() });

    if (res.status === 404) return JSON.stringify({ error: `Regulation not found: ${frbrUri}` });
    if (!res.ok) {
      if (res.status === 429) throw new Error("pasal.id rate limit hit — retry after backoff");
      throw new Error(`pasal.id fetch failed: ${res.status}`);
    }

    const data = await res.json() as {
      work: { id: number; frbr_uri: string; title: string; number: string; year: number; status: string; type: string; type_name: string; content_verified: boolean };
      articles: { id: number; type: string; number: string; heading?: string; content: string | null; parent_id: number | null; sort_order: number }[];
      relationships?: { type: string; type_en: string; related_work: { frbr_uri: string; title: string; number: string; year: number; status: string } }[];
    };

    // Flatten articles into readable text for clause extraction
    const articleText = data.articles
      .filter((a) => a.content)
      .map((a) => `${a.type.toUpperCase()} ${a.number}${a.heading ? ` — ${a.heading}` : ""}\n${a.content}`)
      .join("\n\n");

    return JSON.stringify({
      frbrUri: data.work.frbr_uri,
      title: data.work.title,
      number: data.work.number,
      year: data.work.year,
      status: data.work.status,
      type: data.work.type,
      typeName: data.work.type_name,
      contentVerified: data.work.content_verified,
      sourceUrl: `https://pasal.id/peraturan/${data.work.type.toLowerCase()}/${data.work.frbr_uri.split("/").pop()}`,
      language: "id",
      articleCount: data.articles.length,
      content: articleText,
      relationships: data.relationships?.map((r) => ({
        type: r.type_en,
        title: r.related_work.title,
        frbrUri: r.related_work.frbr_uri,
        status: r.related_work.status,
      })) ?? [],
    });
  },
  {
    name: "pasal_fetch",
    description:
      "Fetch the full text and articles of an Indonesian regulation from pasal.id using its FRBR URI (e.g. 'akn/id/act/uu/2022/27' for UU No. 27/2022 on Personal Data Protection). Returns structured articles ready for clause extraction. Use for jurisdiction ID (Indonesia).",
    schema: z.object({
      frbrUri: z.string().describe("FRBR URI of the regulation (e.g. 'akn/id/act/uu/2022/27'). Obtained from pasal_search results."),
    }),
  }
);
