import { tool } from "langchain";
import { z } from "zod";

const BASE_URL = "https://api.digitalpolicyalert.org/v1";

/**
 * Digital Policy Alert API
 * Register for a free demo key at: https://digitalpolicyalert.org/auth/sign-in?redirect=/account/api-keys
 * Covers 23,000+ regulatory events across 50+ jurisdictions since 2021.
 * Relevant RDTII pillars: 6 (data localization, cross-border flows), 7 (data protection, privacy enforcement)
 */
export const digitalPolicySearch = tool(
  async ({
    query,
    jurisdiction,
    policyArea,
    limit,
  }: {
    query: string;
    jurisdiction?: string;
    policyArea?: string;
    limit?: number;
  }) => {
    const apiKey = process.env.DIGITAL_POLICY_ALERT_API_KEY?.trim();

    if (!apiKey) {
      const scope = [jurisdiction && `jurisdiction: ${jurisdiction}`, policyArea && `area: ${policyArea}`]
        .filter(Boolean)
        .join(", ");
      return `[stub -- set DIGITAL_POLICY_ALERT_API_KEY to enable] Digital Policy Alert search: "${query}"${scope ? ` (${scope})` : ""}`;
    }

    const params = new URLSearchParams({ q: query, limit: String(Math.min(limit ?? 10, 50)) });
    if (jurisdiction) params.set("jurisdiction", jurisdiction);
    if (policyArea) params.set("policy_area", policyArea);

    const res = await fetch(`${BASE_URL}/events?${params}`, {
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    });

    if (!res.ok) {
      if (res.status === 429) throw new Error("Digital Policy Alert rate limit hit -- retry after backoff");
      if (res.status === 401) throw new Error("Digital Policy Alert: invalid or missing API key");
      throw new Error(`Digital Policy Alert search failed: ${res.status}`);
    }

    const data = await res.json() as {
      total: number;
      events: {
        id: string;
        title: string;
        jurisdiction: string;
        date: string;
        status: string;
        policy_area: string;
        description: string;
        source_url: string;
        direction: string; // "restrictive" | "enabling"
      }[];
    };

    return JSON.stringify({
      total: data.total,
      results: data.events.map((e) => ({
        id: e.id,
        title: e.title,
        jurisdiction: e.jurisdiction,
        date: e.date,
        status: e.status,
        policyArea: e.policy_area,
        direction: e.direction,
        description: e.description,
        sourceUrl: e.source_url,
      })),
    });
  },
  {
    name: "digital_policy_search",
    description:
      "Search Digital Policy Alert for regulatory interventions on digital policy topics. Covers data protection, data localization, cross-border data flows, AI governance, content regulation, and enforcement actions across 50+ jurisdictions since 2021. Relevant for RDTII Pillar 6 (cross-border data policies) and Pillar 7 (domestic data protection). Returns structured events with jurisdiction, date, status, policy area, and source URL.",
    schema: z.object({
      query: z.string().min(2).describe("Search query (e.g. 'data localization', 'cross-border data transfer', 'personal data protection')."),
      jurisdiction: z.string().optional().describe("Country name or ISO code to filter results (e.g. 'Indonesia', 'Singapore', 'SG')."),
      policyArea: z
        .enum(["data_protection", "ai_governance", "content_platform", "taxation", "enforcement", "international_cooperation"])
        .optional()
        .describe("Filter by policy area. Use 'data_protection' for Pillar 6/7 queries."),
      limit: z.number().int().min(1).max(50).optional().describe("Max results (default 10)."),
    }),
  }
);
