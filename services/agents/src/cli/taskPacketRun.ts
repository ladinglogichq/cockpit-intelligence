/**
 * Full task-packet run: parse + load context + invoke Cockpit Deep Agent (requires ANTHROPIC_API_KEY).
 */
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { runCockpitAgentWithTaskPacket } from "../runWithTaskPacket.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const agentsRoot = path.resolve(here, "../..");

async function main() {
  if (!process.env.ANTHROPIC_API_KEY?.trim()) {
    console.error("Missing ANTHROPIC_API_KEY — set it to run the agent, or use npm run task-packet:dry-run instead.");
    process.exit(2);
  }
  const fileArg = process.argv[2];
  if (!fileArg) {
    console.error("Usage: taskPacketRun <path-to-task-packet.json>");
    process.exit(1);
  }
  const abs = path.isAbsolute(fileArg) ? fileArg : path.join(agentsRoot, fileArg);
  const raw = JSON.parse(await readFile(abs, "utf8"));
  const result = await runCockpitAgentWithTaskPacket(raw);
  console.log(JSON.stringify(result, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
