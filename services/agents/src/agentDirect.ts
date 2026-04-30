import Anthropic from "@anthropic-ai/sdk";
import { PLANNER_SYSTEM_PROMPT } from "./context/prompts.js";
import {
  workspaceHealth,
  webSearch,
  documentFetch,
  ocrExtract,
  clauseExtractor,
  pillarMapper,
  citationVerifier,
} from "./tools/realTools.js";

const TOOL_DEFS: Anthropic.Tool[] = [
  { name: "workspace_health", description: workspaceHealth.description, input_schema: { type: "object" as const, properties: {}, required: [] } },
  { name: "web_search", description: webSearch.description, input_schema: { type: "object" as const, properties: { query: { type: "string" }, jurisdiction: { type: "string" }, limit: { type: "number" } }, required: ["query"] } },
  { name: "document_fetch", description: documentFetch.description, input_schema: { type: "object" as const, properties: { url: { type: "string" }, documentType: { type: "string" } }, required: ["url"] } },
  { name: "ocr_extract", description: ocrExtract.description, input_schema: { type: "object" as const, properties: { documentId: { type: "string" }, pages: { type: "string" } }, required: ["documentId"] } },
  { name: "clause_extractor", description: clauseExtractor.description, input_schema: { type: "object" as const, properties: { text: { type: "string" }, jurisdiction: { type: "string" }, targetPillars: { type: "array", items: { type: "string" } } }, required: ["text"] } },
  { name: "pillar_mapper", description: pillarMapper.description, input_schema: { type: "object" as const, properties: { clauseExcerpt: { type: "string" }, clauseType: { type: "string" }, articleReference: { type: "string" } }, required: ["clauseExcerpt"] } },
  { name: "citation_verifier", description: citationVerifier.description, input_schema: { type: "object" as const, properties: { clauseId: { type: "string" }, sourceUrl: { type: "string" }, originalExcerpt: { type: "string" } }, required: ["clauseId", "sourceUrl", "originalExcerpt"] } },
];

const TOOL_HANDLERS: Record<string, (input: Record<string, unknown>) => Promise<string>> = {
  workspace_health: () => (workspaceHealth as any).func({}),
  web_search: (i) => (webSearch as any).func(i),
  document_fetch: (i) => (documentFetch as any).func(i),
  ocr_extract: (i) => (ocrExtract as any).func(i),
  clause_extractor: (i) => (clauseExtractor as any).func(i),
  pillar_mapper: (i) => (pillarMapper as any).func(i),
  citation_verifier: (i) => (citationVerifier as any).func(i),
};

export async function runAgentDirect(userMessage: string): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY?.trim();
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY is not set.");

  const client = new Anthropic({
    apiKey,
    baseURL: process.env.ANTHROPIC_BASE_URL?.trim() ?? "https://agentrouter.org/",
  });

  const model = process.env.ANTHROPIC_MODEL?.trim() ?? "claude-3-5-sonnet-20241022";
  const messages: Anthropic.MessageParam[] = [{ role: "user", content: userMessage }];

  for (let turn = 0; turn < 10; turn++) {
    const response = await client.messages.create({
      model,
      max_tokens: 4096,
      system: PLANNER_SYSTEM_PROMPT,
      tools: TOOL_DEFS,
      messages,
    });

    messages.push({ role: "assistant", content: response.content });

    if (response.stop_reason === "tool_use") {
      const toolResults: Anthropic.ToolResultBlockParam[] = [];
      for (const block of response.content) {
        if (block.type !== "tool_use") continue;
        const handler = TOOL_HANDLERS[block.name];
        let result: string;
        try {
          result = handler ? await handler(block.input as Record<string, unknown>) : `Unknown tool: ${block.name}`;
        } catch (err) {
          result = `Error: ${err instanceof Error ? err.message : String(err)}`;
        }
        toolResults.push({ type: "tool_result", tool_use_id: block.id, content: result });
      }

      messages.push({ role: "user", content: toolResults });
      continue;
    }

    if (response.stop_reason) {
      return response.content
        .filter((b): b is Anthropic.TextBlock => b.type === "text")
        .map((b) => b.text)
        .join("\n");
    }
  }

  return "Agent reached maximum turns without a final response.";
}
