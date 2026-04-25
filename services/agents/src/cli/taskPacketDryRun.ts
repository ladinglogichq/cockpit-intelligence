/**
 * Validates a task packet, resolves context keys, loads markdown from repo `context/`.
 * Does not call Anthropic — use for CI and local smoke tests.
 */
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { TaskPacketSchema } from "../context/schemas.js";
import { loadContextDocs } from "../context/loaders.js";
import { getTaskPacketContextKeys } from "../taskPacketKeys.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const agentsRoot = path.resolve(here, "../..");

async function main() {
  const fileArg = process.argv[2];
  if (!fileArg) {
    console.error("Usage: taskPacketDryRun <path-to-task-packet.json>");
    process.exit(1);
  }
  const abs = path.isAbsolute(fileArg) ? fileArg : path.join(agentsRoot, fileArg);
  const raw = JSON.parse(await readFile(abs, "utf8"));
  const packet = TaskPacketSchema.parse(raw);
  const keys = getTaskPacketContextKeys(packet);
  const loaded = await loadContextDocs(keys);
  console.log(
    JSON.stringify(
      {
        ok: true,
        taskType: packet.taskType,
        contextKeys: keys,
        loadedDocs: loaded.map((d) => ({ key: d.key, path: d.path, bytes: d.content.length })),
      },
      null,
      2
    )
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
