import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

type ApiKeyRow = {
  id: string;
  label: string;
  maskedSuffix: string;
  purpose: string;
  requests24h: number;
  created: string;
  lastUsed: string | null;
  createdBy: string;
};

const MOCK_KEYS: ApiKeyRow[] = [
  {
    id: "1",
    label: "DUNE_SIM_EVM_API_KEY",
    maskedSuffix: "DOiH",
    purpose: "Cockpit API",
    requests24h: 0,
    created: "6 days ago",
    lastUsed: "4 days ago",
    createdBy: "you@workspace.local",
  },
  {
    id: "2",
    label: "SIM-MCP",
    maskedSuffix: "KU8W",
    purpose: "Cockpit API",
    requests24h: 0,
    created: "3 days ago",
    lastUsed: null,
    createdBy: "you@workspace.local",
  },
];

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
      <circle cx={11} cy={11} r={7} />
      <path d="M21 21l-4.2-4.2" strokeLinecap="round" />
    </svg>
  );
}

function KeyIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
      <path
        d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 11-7.778 7.778 5.5 5.5 0 017.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CopyIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
      <rect x={9} y={9} width={13} height={13} rx={2} />
      <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
    </svg>
  );
}

export function ApiKeysPage() {
  const [query, setQuery] = useState("");
  const [copyId, setCopyId] = useState<string | null>(null);
  const [newNotice, setNewNotice] = useState(false);

  useEffect(() => {
    const prev = document.title;
    document.title = "API keys — Cockpit";
    return () => {
      document.title = prev;
    };
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return MOCK_KEYS;
    return MOCK_KEYS.filter(
      (k) =>
        k.label.toLowerCase().includes(q) ||
        k.maskedSuffix.toLowerCase().includes(q) ||
        k.purpose.toLowerCase().includes(q)
    );
  }, [query]);

  async function copyRow(row: ApiKeyRow) {
    const text = `${row.label} (****${row.maskedSuffix})`;
    try {
      await navigator.clipboard.writeText(text);
      setCopyId(row.id);
      window.setTimeout(() => setCopyId(null), 2000);
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="border-b border-ink/10 dark:border-zinc-800">
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-12">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-muted dark:text-zinc-500">Cockpit workspace</p>

        <div className="mt-6 flex min-h-[7rem] flex-col items-stretch justify-end gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0 flex-1 space-y-2">
            <h1 className="font-serif text-3xl font-normal tracking-tight text-ink dark:text-zinc-100 sm:text-4xl">Keys</h1>
            <p className="max-w-xl text-sm leading-relaxed text-ink-muted dark:text-zinc-400">
              Manage your API keys below and see{" "}
              <Link to="/platform" className="font-medium text-ink underline-offset-2 hover:underline dark:text-zinc-200">
                platform docs
              </Link>{" "}
              to get started.
            </p>
          </div>
          <div className="shrink-0 rounded-2xl border border-ink/15 bg-canvas/80 px-5 py-4 dark:border-zinc-700 dark:bg-zinc-900/60">
            <p className="text-xs font-medium uppercase tracking-wider text-ink-muted dark:text-zinc-500">Keys</p>
            <p className="mt-1 font-display text-3xl font-semibold tabular-nums text-ink dark:text-zinc-100">{MOCK_KEYS.length}</p>
          </div>
        </div>

        <section className="mt-12 flex flex-col gap-6">
          <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <label className="relative block min-w-0 flex-1 sm:max-w-xs">
              <span className="sr-only">Search by name or key</span>
              <SearchIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted dark:text-zinc-500" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by name or key"
                className="w-full rounded-xl border border-ink/15 bg-canvas py-2 pl-9 pr-3 text-sm text-ink placeholder:text-ink-faint focus:border-ink/25 focus:outline-none focus:ring-1 focus:ring-ink/15 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:placeholder:text-zinc-600 dark:focus:border-zinc-600 dark:focus:ring-zinc-600"
              />
            </label>
            <button
              type="button"
              onClick={() => {
                setNewNotice(true);
                window.setTimeout(() => setNewNotice(false), 5000);
              }}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-ink px-4 py-2 text-sm font-medium text-canvas transition hover:bg-ink/90 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-zinc-200"
            >
              <KeyIcon />
              New
            </button>
          </div>

          {newNotice ? (
            <p className="rounded-xl border border-amber-500/25 bg-amber-500/10 px-4 py-3 text-sm text-amber-950 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-100" role="status">
              Key creation will connect to your organization backend when Cockpit Cloud APIs are enabled for this workspace.
            </p>
          ) : null}

          <div className="overflow-x-auto rounded-2xl border border-ink/15 dark:border-zinc-700">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="border-b border-ink/10 bg-ink/[0.02] dark:border-zinc-800 dark:bg-zinc-900/50">
                <tr>
                  <th className="whitespace-nowrap px-4 py-3 font-medium text-ink dark:text-zinc-200 sm:px-6">Key</th>
                  <th className="whitespace-nowrap px-2 py-3 font-medium text-ink dark:text-zinc-200">Purpose</th>
                  <th className="whitespace-nowrap px-2 py-3 font-medium text-ink dark:text-zinc-200">Requests (24h)</th>
                  <th className="whitespace-nowrap px-2 py-3 font-medium text-ink dark:text-zinc-200">Created</th>
                  <th className="whitespace-nowrap px-2 py-3 font-medium text-ink dark:text-zinc-200">Last used</th>
                  <th className="whitespace-nowrap px-2 py-3 font-medium text-ink dark:text-zinc-200">Created by</th>
                  <th className="w-12 px-2 py-3 sm:w-14" aria-label="Actions" />
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/10 dark:divide-zinc-800">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-10 text-center text-ink-muted dark:text-zinc-500">
                      No keys match your search.
                    </td>
                  </tr>
                ) : (
                  filtered.map((row) => (
                    <tr key={row.id} className="bg-canvas/30 dark:bg-transparent">
                      <td className="px-4 py-4 sm:px-6">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs text-ink dark:text-zinc-200 sm:text-sm">
                            {row.label}
                            <span className="text-ink-muted dark:text-zinc-500"> (****{row.maskedSuffix})</span>
                          </span>
                          <button
                            type="button"
                            onClick={() => copyRow(row)}
                            className="inline-flex shrink-0 rounded-lg p-1.5 text-ink-muted transition hover:bg-ink/5 hover:text-ink dark:text-zinc-500 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
                            aria-label={copyId === row.id ? "Copied" : `Copy ${row.label}`}
                          >
                            <CopyIcon />
                          </button>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-2 py-4">
                        <span className="inline-flex rounded-full border border-ink/15 bg-ink/[0.04] px-2.5 py-0.5 text-xs font-medium text-ink-muted dark:border-zinc-600 dark:bg-zinc-800/80 dark:text-zinc-300">
                          {row.purpose}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-2 py-4 tabular-nums text-ink dark:text-zinc-300">{row.requests24h}</td>
                      <td className="whitespace-nowrap px-2 py-4 text-ink-muted dark:text-zinc-400">{row.created}</td>
                      <td className="whitespace-nowrap px-2 py-4 text-ink-muted dark:text-zinc-400">{row.lastUsed ?? "—"}</td>
                      <td className="min-w-[10rem] px-2 py-4 text-ink-muted dark:text-zinc-400">{row.createdBy}</td>
                      <td className="w-12 sm:w-14" />
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <p className="text-xs text-ink-muted dark:text-zinc-500">
            Preview data for layout only. Real keys, rotation, and usage stats need a connected Cockpit API tenant.
          </p>
        </section>
      </div>
    </div>
  );
}
