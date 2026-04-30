import { useEffect, useId, useState } from "react";
import { useWorkspaceComposer } from "../context/WorkspaceComposerContext";
import { useDashboardData } from "../hooks/useDashboardData";
import { DashboardOverview } from "../components/DashboardOverview";

const SUGGESTIONS = [
  "Summarize data protection clauses for Kenya DPA",
  "Which jurisdictions have cross-border transfer restrictions?",
  "What evidence records need human review?",
  "Compare Pillar 7 coverage across Singapore and Nigeria",
] as const;

export function DashboardPage() {
  const { setQuery, investigateState, resetInvestigation } = useWorkspaceComposer();
  const headingId = useId();
  const { data, loading, error, clearWorkspace } = useDashboardData();
  const [isClearing, setIsClearing] = useState(false);

  useEffect(() => {
    const prev = document.title;
    document.title = "Dashboard — Cockpit";
    return () => { document.title = prev; };
  }, []);

  // Reset investigation state on page load for clean slate
  useEffect(() => {
    resetInvestigation();
  }, [resetInvestigation]);

  async function handleClearWorkspace() {
    setIsClearing(true);
    await clearWorkspace();
    resetInvestigation();
    setIsClearing(false);
  }

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
          Natural-language entry for jurisdiction scans, clause analysis, and evidence records.
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

      {/* Investigation result */}
      {investigateState.status !== "idle" && (
        <div className="mt-8 w-full max-w-screen-md">
          <div className="rounded-2xl border border-ink/10 bg-canvas dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center justify-between border-b border-ink/10 px-4 py-3 dark:border-zinc-800">
              <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted dark:text-zinc-500">
                Investigation result
              </p>
              <button
                type="button"
                onClick={resetInvestigation}
                className="text-xs text-ink-muted hover:text-ink dark:text-zinc-500 dark:hover:text-zinc-300"
              >
                Clear
              </button>
            </div>
            <div className="px-4 py-4 text-sm leading-relaxed text-ink dark:text-zinc-200">
              {investigateState.status === "loading" && (
                <p className="text-ink-muted dark:text-zinc-500">Running investigation…</p>
              )}
              {investigateState.status === "error" && (
                <p className="text-red-600 dark:text-red-400" role="alert">
                  {investigateState.message}
                </p>
              )}
              {investigateState.status === "done" && (
                <pre className="whitespace-pre-wrap font-sans">{investigateState.content}</pre>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Dashboard data */}
      <div className="mt-10 w-full max-w-screen-md">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-medium text-ink dark:text-zinc-100">Workspace data</h2>
          <button
            type="button"
            onClick={handleClearWorkspace}
            disabled={isClearing || !data}
            className="rounded-lg border border-ink/10 bg-ink/[0.02] px-3 py-1.5 text-xs font-medium text-ink-muted transition hover:border-ink/20 hover:bg-ink/[0.04] hover:text-ink disabled:cursor-not-allowed disabled:opacity-40 dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-500 dark:hover:border-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
          >
            {isClearing ? "Clearing…" : "Clear workspace"}
          </button>
        </div>
        {loading ? (
          <p className="text-center text-sm text-ink-muted dark:text-zinc-500">Loading workspace data…</p>
        ) : error ? (
          <p className="text-center text-sm text-red-600 dark:text-red-400" role="alert">{error}</p>
        ) : data ? (
          <DashboardOverview data={data} />
        ) : null}
      </div>
    </div>
  );
}
