// services/agents/src/context/loaders.ts
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { CONTEXT_REGISTRY } from "./registry.js";
import { ContextDocSchema } from "./schemas.js";

const REPO_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../../.."
);

export async function loadContextDocs(keys: string[]) {
  const uniqueKeys = [...new Set(keys)];
  const docs = await Promise.all(
    uniqueKeys.map(async (key) => {
      const relativePath = CONTEXT_REGISTRY[key as keyof typeof CONTEXT_REGISTRY];
      if (!relativePath) throw new Error(`Unknown context key: ${key}`);
      const absolutePath = path.join(REPO_ROOT, relativePath);
      const content = await readFile(absolutePath, "utf8");
      return ContextDocSchema.parse({
        key,
        path: relativePath,
        title: key,
        content,
      });
    })
  );
  return docs;
}
