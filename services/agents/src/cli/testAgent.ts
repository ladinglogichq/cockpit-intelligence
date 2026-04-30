import Anthropic from "@anthropic-ai/sdk";

const apiKey = process.env.ANTHROPIC_API_KEY?.trim();
if (!apiKey) throw new Error("ANTHROPIC_API_KEY is not set.");

const client = new Anthropic({
  apiKey,
  baseURL: process.env.ANTHROPIC_BASE_URL?.trim() ?? "https://agentrouter.org/",
});

export async function testAgent() {
  const message = "What are cross-border data transfer rules in Singapore PDPA? Be concise.";
  const response = await client.messages.create({
    model: "claude-3-5-sonnet-20241022",
    max_tokens: 4096,
    messages: [
      { role: "user", content: message },
    ],
  });

  const content = response.content[0]?.text;
  console.log("Response:", content);
  return content || "No response";
}
