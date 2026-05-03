import { tool } from "langchain";
import { z } from "zod";

const BASE_URL = "https://api.globaltradealert.org/api/v1/dpa";

/**
 * Digital Policy Alert API (Global Trade Alert)
 * Docs: https://api.globaltradealert.org/api/doc/dpa/
 * Auth: Authorization: APIKey [key]
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

    const body: Record<string, unknown> = {
      query,
      limit: Math.min(limit ?? 10, 100),
      offset: 0,
    };
    if (jurisdiction) body.implementer = [jurisdiction];
    if (policyArea) body.policy_area = [policyArea];

    const res = await fetch(`${BASE_URL}/events/`, {
      method: "POST",
      headers: {
        Authorization: `APIKey ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      if (res.status === 429) throw new Error("Digital Policy Alert rate limit hit -- retry after backoff");
      if (res.status === 401) throw new Error("Digital Policy Alert: invalid or missing API key");
      throw new Error(`Digital Policy Alert search failed: ${res.status} ${await res.text()}`);
    }

    const data = await res.json() as {
      id: number;
      title: string;
      url: string;
      description: string;
      date: string;
      status: string;
      event_type: string;
      action_type: string;
      implementers: { name: string; id: number }[];
      threads: { id: number; name: string; slug: string }[];
      policy_area: string;
      policy_instrument: string;
      implementation_level: string;
      intervention_title: string;
      intervention_url: string;
    }[];

    return JSON.stringify({
      total: data.length,
      results: data.map((e) => ({
        id: e.id,
        title: e.title,
        url: e.url,
        date: e.date,
        status: e.status,
        actionType: e.action_type,
        policyArea: e.policy_area,
        policyInstrument: e.policy_instrument,
        implementers: e.implementers.map((i) => i.name),
        threads: e.threads.map((t) => t.name),
        implementationLevel: e.implementation_level,
        description: e.description,
        interventionTitle: e.intervention_title,
        interventionUrl: e.intervention_url,
      })),
    });
  },
  {
    name: "digital_policy_search",
    description:
      "Search Digital Policy Alert for regulatory interventions on digital policy topics. Covers data protection, data localization, cross-border data flows, AI governance, content regulation, and enforcement actions across 50+ jurisdictions since 2021. Relevant for RDTII Pillar 6 (cross-border data policies) and Pillar 7 (domestic data protection). Returns structured events with jurisdiction, date, status, policy area, and source URL.",
    schema: z.object({
      query: z.string().min(2).describe("Search query (e.g. 'data localization', 'cross-border data transfer', 'personal data protection')."),
      jurisdiction: z.string().optional().describe("Country name to filter results (e.g. 'Indonesia', 'Singapore')."),
      policyArea: z.string().optional().describe("Filter by policy area name (e.g. 'Data governance')."),
      limit: z.number().int().min(1).max(100).optional().describe("Max results (default 10)."),
    }),
  }
);
