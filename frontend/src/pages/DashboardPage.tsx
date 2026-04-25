import { useEffect, useId } from "react";
import { useWorkspaceComposer } from "../context/WorkspaceComposerContext";

const SUGGESTIONS = [
  "Trace funds from this Solana address",
  "Summarize open alerts for custodial clusters",
  "What cases are blocked on review?",
  "Compare entity risk for two wallets",
] as const;

export function DashboardPage() {
  const { setQuery } = useWorkspaceComposer();
  const headingId = useId();

  useEffect(() => {
    const prev = document.title;
    document.title = "Dashboard — Cockpit";
    return () => {
      document.title = prev;
    };
  }, []);

  return (
    <div className="static flex w-full flex-col items-center pb-6 pt-6 md:mt-0 md:min-h-0 md:flex-1 md:justify-center md:pb-[10vh] md:pt-4">
      <div className="w-full text-center">
        <h1
          id={headingId}
          className="font-display text-2xl font-medium leading-snug tracking-tight text-ink dark:text-zinc-100 sm:text-[1.75rem]"
        >
          What do you want to investigate?
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-ink-muted dark:text-zinc-400">
          Natural-language entry for traces, alerts, and cases. Connectors and agents ship progressively.
        </p>
      </div>

      <div className="mt-8 flex w-full max-w-xl flex-wrap justify-center gap-2">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            type="button"
            className="rounded-full border border-ink/10 bg-canvas px-3 py-1.5 text-left text-xs font-medium text-ink-muted transition hover:border-ink/20 hover:bg-ink/[0.04] hover:text-ink dark:border-zinc-700 dark:bg-zinc-900/50 dark:text-zinc-400 dark:hover:border-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-200 sm:text-[13px]"
            onClick={() => setQuery(s)}
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}
