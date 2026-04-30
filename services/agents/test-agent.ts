import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY ?? "",
});

const messages = [
  {
    role: "user" as const,
    content: "Test extraction from Kenya DPA",
  },
];

async function test() {
  console.log("Testing Anthropic API and agent...");

  // First test Anthropic directly
  try {
    const simpleResponse = await client.messages.create({
      model: "claude-3-5-sonnet-20250514",
      max_tokens: 1024,
      messages: [
        { role: "user", content: "What is 2+2?" },
      ],
    });
    console.log("Simple Anthropic response:", simpleResponse.content[0]?.text);
  } catch (err) {
    console.error("Anthropic error:", err.message);
  }

  // Now test with tools
  const response = await client.messages.create({
    model: "claude-3-5-sonnet-20250514",
    max_tokens: 4096,
    system:
      "You are a legal clause extraction specialist for RDTII compliance analysis.\n\nExtract relevant clauses from this text for pillar mapping.\n\nReturn a JSON array of extracted clauses with this structure:\n[\n  {\n    \"id\": \"unique-id\",\n    \"articleNumber\": \"Section X\" or \"Article Y\",\n    \"originalExcerpt\": \"exact text from source\",\n    \"clauseType\": \"rule|obligation|prohibition|exception|definition|scope|penalty\",\n    \"subjectMatter\": [\"relevant\", \"tags\"],\n    \"confidence\": 0.85\n  }\n]\n\nGuidelines:\n- Only extract clauses that are directly relevant to Pillar 6 or Pillar 7\n- Preserve exact wording in originalExcerpt (do not paraphrase)\n- Include article/section references for verification\n- Classify clauseType appropriately\n- Set confidence based on clarity and relevance (0.5 to 1.0)\n- Skip administrative or procedural clauses\n- Return ONLY valid JSON, no other text or explanation",
    messages,
  });

  console.log("Agent response:", response.content[0]?.text);
  console.log("Tool use:", response.content[0]?.tool_use);
  console.log("Stop reason:", response.content[0]?.stop_reason);

  test().catch(console.error);
}
