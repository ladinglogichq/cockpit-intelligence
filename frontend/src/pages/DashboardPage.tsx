import { useEffect, useId, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useWorkspaceComposer } from "../context/WorkspaceComposerContext";
import { useDashboardData } from "../hooks/useDashboardData";
import { DashboardOverview } from "../components/DashboardOverview";

const SUGGESTIONS = [
  "What rules apply when sharing customer data across ASEAN countries?",
  "How can I send data to partners in different countries legally?",
  "What do I need to know about privacy when collecting customer info?",
  "How do I show my business follows the rules for audits?",
] as const;

export function DashboardPage() {
  const { setQuery, investigateState, resetInvestigation } = useWorkspaceComposer();
  const headingId = useId();
  const { data, loading, error, refetch, clearWorkspace } = useDashboardData();
  const [isClearing, setIsClearing] = useState(false);

  useEffect(() => {
    const prev = document.title;
    document.title = "Dashboard — Cockpit";
    return () => { document.title = prev; };
  }, []);

  // Auto-refresh dashboard when investigation persists new records
  useEffect(() => {
    if (investigateState.status === "done" && investigateState.persisted) {
      refetch();
    }
  }, [investigateState, refetch]);

  async function handleClearWorkspace() {
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
          What trade rules do you need to check?
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-ink-muted dark:text-zinc-400">
          Search in plain English—no technical knowledge needed. We'll find the rules that matter for your business.
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
                Your answer
              </p>
              <div className="flex items-center gap-3">
                {investigateState.status === "done" && investigateState.persisted ? (
                  <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300">
                    {investigateState.persisted} record{investigateState.persisted !== 1 ? "s" : ""} saved
                  </span>
                ) : null}
                <button
                  type="button"
                  onClick={resetInvestigation}
                  className="text-xs text-ink-muted hover:text-ink dark:text-zinc-500 dark:hover:text-zinc-300"
                >
                  Clear
                </button>
              </div>
            </div>
            <div className="px-4 py-4 text-sm leading-relaxed text-ink dark:text-zinc-200">
              {investigateState.status === "loading" && (
                <p className="text-ink-muted dark:text-zinc-500">Looking this up…</p>
              )}
              {investigateState.status === "error" && (
                <p className="text-red-600 dark:text-red-400" role="alert">
                  {investigateState.message}
                </p>
              )}
              {investigateState.status === "done" && (
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  className="prose prose-sm max-w-none dark:prose-invert prose-table:text-xs prose-th:font-semibold prose-td:align-top prose-headings:font-display prose-headings:font-semibold prose-code:text-xs prose-code:bg-ink/[0.06] prose-code:px-1 prose-code:py-0.5 prose-code:rounded dark:prose-code:bg-zinc-800"
                >
                  {investigateState.content}
                </ReactMarkdown>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Dashboard data */}
      <div className="mt-10 w-full max-w-screen-md">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-medium text-ink dark:text-zinc-100">Your findings</h2>
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
