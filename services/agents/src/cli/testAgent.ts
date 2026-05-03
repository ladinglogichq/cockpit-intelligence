import Anthropic from "@anthropic-ai/sdk";

const apiKey = process.env.ANTHROPIC_API_KEY?.trim();
if (!apiKey) throw new Error("ANTHROPIC_API_KEY is not set.");

const client = new Anthropic({
  apiKey,
  baseURL: process.env.ANTHROPIC_BASE_URL?.trim() ?? "https://api.z.ai/api/anthropic/",
});

export async function testAgent() {
  const message = "What are cross-border data transfer rules in Singapore PDPA? Be concise.";
  const response = await client.messages.create({
    model: process.env.ANTHROPIC_MODEL ?? "claude-sonnet-4-5-20250929",
    max_tokens: 4096,
    messages: [{ role: "user", content: message }],
  });

  const block = response.content[0];
  const content = block?.type === "text" ? block.text : undefined;
  console.log("Response:", content);
  return content || "No response";
}
