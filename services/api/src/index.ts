import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { stream } from "hono/streaming";
import { runAgentDirect } from "../../agents/src/index.js";

const app = new Hono();

app.get("/health", (c) => c.json({ ok: true, service: "cockpit-api" }));

/**
 * POST /v1/investigate
 * Body: { query: string, mode?: string, jurisdiction?: string }
 * Response: SSE — each event: { type: "chunk"|"done"|"error", content?: string }
 */
app.post("/v1/investigate", async (c) => {
  const body = await c.req.json<{ query: string; mode?: string; jurisdiction?: string }>();

  if (!body.query?.trim()) return c.json({ error: "query is required" }, 400);

  const userMessage = [
    `Goal: ${body.query.trim()}`,
    body.jurisdiction ? `Jurisdiction: ${body.jurisdiction}` : "",
    `Mode: ${body.mode ?? "investigation"}`,
  ].filter(Boolean).join("\n");

  c.header("Content-Type", "text/event-stream");
  c.header("Cache-Control", "no-cache");
  c.header("Access-Control-Allow-Origin", "*");

  return stream(c, async (s) => {
    await s.write(`: ping\n\n`);
    try {
      const content = await runAgentDirect(userMessage);
      await s.write(`data: ${JSON.stringify({ type: "chunk", content })}\n\n`);
      await s.write(`data: ${JSON.stringify({ type: "done" })}\n\n`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      await s.write(`data: ${JSON.stringify({ type: "error", content: msg })}\n\n`);
    }
  });
});

app.options("/v1/investigate", (c) => {
  c.header("Access-Control-Allow-Origin", "*");
  c.header("Access-Control-Allow-Methods", "POST, OPTIONS");
  c.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  return c.body(null, 204);
});

const port = Number(process.env.PORT ?? 8787);
serve({ fetch: app.fetch, port }, (info) => {
  console.log(`cockpit-api listening on http://localhost:${info.port}`);
});
