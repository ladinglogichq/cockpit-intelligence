import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "../../..");
const evidenceSnapshotPath = path.join(repoRoot, "frontend/src/data/dashboard-snapshot.json");

const app = new Hono();

app.get("/health", (c) =>
  c.json({
    ok: true,
    service: "cockpit-api",
  })
);

app.get("/v1/evidence", async (c) => {
  try {
    const raw = await readFile(evidenceSnapshotPath, "utf8");
    return c.json(JSON.parse(raw));
  } catch {
    return c.json({ error: "snapshot_unavailable" }, 500);
  }
});

const port = Number(process.env.PORT ?? 8787);

serve(
  {
    fetch: app.fetch,
    port,
  },
  (info) => {
    console.log(`cockpit-api listening on http://localhost:${info.port}`);
  }
);
