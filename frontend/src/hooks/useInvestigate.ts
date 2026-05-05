import { useCallback, useState } from "react";
import type { ComposerMode } from "../context/WorkspaceComposerContext";
import { supabase } from "../utils/supabase";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8787";

export type InvestigateState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "done"; content: string; persisted?: number }
  | { status: "error"; message: string };

export function useInvestigate() {
  const [state, setState] = useState<InvestigateState>({ status: "idle" });

  const investigate = useCallback(async (
    query: string,
    mode: ComposerMode,
    jurisdiction?: string,
    onPersisted?: () => void,
  ) => {
    if (!query.trim()) return;
    setState({ status: "loading" });

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (session?.access_token) headers["Authorization"] = `Bearer ${session.access_token}`;

      const res = await fetch(`${API_URL}/v1/investigate`, {
        method: "POST",
        headers,
        body: JSON.stringify({ query, mode, jurisdiction }),
      });

      if (!res.ok || !res.body) {
        setState({ status: "error", message: `API error: ${res.status}` });
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let content = "";
      let persisted: number | undefined;
      let finished = false;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        for (const line of decoder.decode(value, { stream: true }).split("\n")) {
          if (!line.startsWith("data: ")) continue;
          try {
            const event = JSON.parse(line.slice(6)) as { type: string; content?: string; count?: number };
            if (event.type === "chunk" && event.content) {
              content += event.content;
            } else if (event.type === "persisted") {
              persisted = event.count;
              onPersisted?.();
            } else if (event.type === "done") {
              finished = true;
              setState({ status: "done", content, persisted });
            } else if (event.type === "error") {
              finished = true;
              setState({ status: "error", message: event.content ?? "Unknown error" });
            }
          } catch {
            // malformed SSE line — skip
          }
        }
      }

      if (!finished && content) setState({ status: "done", content, persisted });
    } catch (err) {
      setState({ status: "error", message: err instanceof Error ? err.message : "Network error" });
    }
  }, []);

  const reset = useCallback(() => setState({ status: "idle" }), []);

  return { state, investigate, reset };
}
