import { getCockpitAgent } from "./cockpitAgent.js";
import { TaskPacketSchema } from "./context/schemas.js";
import { loadContextDocs } from "./context/loaders.js";
import { getTaskPacketContextKeys } from "./taskPacketKeys.js";

export async function runCockpitAgentWithTaskPacket(raw: unknown): Promise<string> {
  const taskPacket = TaskPacketSchema.parse(raw);
  const keys = getTaskPacketContextKeys(taskPacket);
  const loadedContextDocs = await loadContextDocs(keys);

  const messages = [
    {
      role: "user" as const,
      content: [
        "Here is the structured task for Cockpit:",
        JSON.stringify(taskPacket, null, 2),
        "",
        "Here is the loaded context:",
        loadedContextDocs.map((d) => `## ${d.key}\n${d.content}`).join("\n\n"),
      ].join("\n"),
    },
  ];

  const result = await getCockpitAgent().invoke({ messages });

  // Extract final text from the last message
  const lastMsg = result.messages?.[result.messages.length - 1];
  if (!lastMsg) return "";
  const content = lastMsg.content;
  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    return content
      .map((b: { type?: string; text?: string }) => (b.type === "text" ? (b.text ?? "") : ""))
      .join("");
  }
  return JSON.stringify(content);
}
