import { getCockpitAgent } from "./cockpitAgent.js";
import { TaskPacketSchema } from "./context/schemas.js";
import { loadContextDocs } from "./context/loaders.js";
import { getTaskPacketContextKeys } from "./taskPacketKeys.js";

export async function runCockpitAgentWithTaskPacket(raw: unknown) {
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

  return getCockpitAgent().invoke({ messages });
}
