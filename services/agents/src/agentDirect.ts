import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
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
  const apiKey = process.env.ZAI_API_KEY?.trim() ?? process.env.ANTHROPIC_API_KEY?.trim();
  if (!apiKey) throw new Error("ZAI_API_KEY is not set.");

  const openai = new OpenAI({
    apiKey,
    baseURL: "https://api.z.ai/api/paas/v4/",
  });

  const model = process.env.ANTHROPIC_MODEL?.trim() ?? "glm-5.1";
  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [{ role: "user", content: userMessage }];

  for (let turn = 0; turn < 10; turn++) {
    const response = await openai.chat.completions.create({
      model,
      max_tokens: 4096,
      messages: [{ role: "system", content: PLANNER_SYSTEM_PROMPT }, ...messages],
      tools: TOOL_DEFS.map((t) => ({
        type: "function" as const,
        function: {
          name: t.name,
          description: t.description,
          parameters: t.input_schema,
        },
      })),
    });

    const choice = response.choices[0];
    messages.push({ role: "assistant", content: choice.message.content ?? null, tool_calls: choice.message.tool_calls });

    if (choice.finish_reason === "tool_calls" && choice.message.tool_calls?.length) {
      for (const tc of choice.message.tool_calls) {
        const handler = TOOL_HANDLERS[tc.function.name];
        let result: string;
        try {
          result = handler
            ? await handler(JSON.parse(tc.function.arguments) as Record<string, unknown>)
            : `Unknown tool: ${tc.function.name}`;
        } catch (err) {
          result = `Error: ${err instanceof Error ? err.message : String(err)}`;
        }
        messages.push({ role: "tool", tool_call_id: tc.id, content: result });
      }
      continue;
    }

    if (choice.finish_reason) {
      return choice.message.content ?? "";
    }
  }

  return "Agent reached maximum turns without a final response.";
}
