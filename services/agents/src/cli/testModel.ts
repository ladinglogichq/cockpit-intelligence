import { ChatAnthropic } from "@langchain/anthropic";

const m = new ChatAnthropic({
  model: process.env.ANTHROPIC_MODEL ?? "claude-sonnet-4-5-20250514",
  clientOptions: {
    apiKey: process.env.ANTHROPIC_API_KEY,
    baseURL: process.env.ANTHROPIC_BASE_URL ?? "https://agentrouter.org/",
  },
});

const r = await m.invoke("Say hello in one word");
console.log("MODEL RESPONSE:", JSON.stringify(r.content));
