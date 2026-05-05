import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { stream } from "hono/streaming";
import { runAgentDirect } from "../../agents/src/agentDirect.js";
import { parseEvidenceRecords, persistToSupabase } from "./persist.js";

const app = new Hono();

app.get("/health", (c) => c.json({ ok: true, service: "cockpit-api" }));

/** Decode JWT payload without verification (verification is done by Supabase RLS) */
function jwtUserId(jwt: string): string | null {
  try {
    const payload = JSON.parse(Buffer.from(jwt.split(".")[1], "base64url").toString());
    return payload.sub ?? null;
  } catch {
    return null;
  }
}

/**
 * POST /v1/investigate
 * Body: { query: string, mode?: string, jurisdiction?: string }
 * Response: SSE — each event: { type: "chunk"|"done"|"persisted"|"error", content?: string, count?: number }
 */
app.post("/v1/investigate", async (c) => {
  const body = await c.req.json<{ query: string; mode?: string; jurisdiction?: string }>();
  if (!body.query?.trim()) return c.json({ error: "query is required" }, 400);

  const jwt = c.req.header("Authorization")?.replace(/^Bearer\s+/i, "") ?? "";
  const workspaceId = jwtUserId(jwt);

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

      // Persist to Supabase if user is authenticated
      if (workspaceId && jwt) {
        const jurisdiction = body.jurisdiction ?? body.query.trim().slice(0, 40);
        const records = parseEvidenceRecords(content, jurisdiction);
        const count = await persistToSupabase(records, workspaceId, jwt, body.query.trim());
        if (count > 0) {
          await s.write(`data: ${JSON.stringify({ type: "persisted", count })}\n\n`);
        }
      }

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

const port = Number(process.env.PORT ?? "8787");
serve({ fetch: app.fetch, port }, (info) => {
  console.log(`cockpit-api listening on http://localhost:${info.port}`);
});
