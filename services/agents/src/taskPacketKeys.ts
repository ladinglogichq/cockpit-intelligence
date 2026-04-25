import { TASK_TYPE_DEFAULT_CONTEXT } from "./context/registry.js";
import type { TaskPacket } from "./context/schemas.js";

export function getTaskPacketContextKeys(packet: TaskPacket): string[] {
  const defaults = TASK_TYPE_DEFAULT_CONTEXT[packet.taskType] ?? [];
  return [...new Set([...defaults, ...packet.mustLoadContext])];
}
