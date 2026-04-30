import type { DashboardSnapshot } from "../data/dashboardMock";

function formatShort(iso: string) {
  try {
    const d = new Date(iso);
    return new Intl.DateTimeFormat(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(d);
  } catch {
    return iso;
  }
}

function pillarClass(pillar: string) {
  switch (pillar) {
    case "pillar_6":
      return "bg-blue-500/15 text-blue-400 dark:bg-blue-500/20 dark:text-blue-300";
    case "pillar_7":
      return "bg-violet-500/15 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300";
    default:
      return "bg-zinc-500/15 text-zinc-500 dark:bg-zinc-500/20 dark:text-zinc-400";
  }
}

function pillarLabel(pillar: string) {
  switch (pillar) {
    case "pillar_6": return "Pillar 6";
    case "pillar_7": return "Pillar 7";
    default: return pillar;
  }
}

function statusClass(status: string) {
  switch (status) {
    case "verified":
      return "bg-emerald-500/15 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300";
    case "needs_review":
      return "bg-amber-500/15 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300";
    default:
      return "bg-zinc-500/15 text-zinc-500 dark:bg-zinc-500/20 dark:text-zinc-400";
  }
}

function confidencePercent(c: number) {
  return `${Math.round(c * 100)}%`;
}

type Props = { data: DashboardSnapshot };

export function DashboardOverview({ data }: Props) {
  return (
    <div className="flex flex-col gap-8 pt-6">
      <p className="text-center text-xs text-ink-muted dark:text-zinc-500 sm:text-left">
        Workspace snapshot · {formatShort(data.generatedAt)}
      </p>

      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4" aria-label="Key metrics">
        {[
          { label: "Jurisdictions", value: data.kpis.jurisdictionsAnalyzed },
          { label: "Clauses extracted", value: data.kpis.clausesExtracted },
          { label: "Mappings verified", value: data.kpis.mappingsVerified },
          { label: "Reports ready", value: data.kpis.reportsReady },
        ].map(({ label, value }) => (
          <li key={label} className="rounded-xl border border-ink/10 bg-ink/[0.02] p-4 dark:border-zinc-800 dark:bg-zinc-900/60">
            <p className="text-xs font-semibold uppercase tracking-wider text-ink-faint dark:text-zinc-500">{label}</p>
            <p className="mt-2 font-display text-3xl font-semibold tabular-nums text-ink dark:text-zinc-100">{value}</p>
          </li>
        ))}
      </ul>

      {data.evidence.length > 0 && (
        <section aria-labelledby="dash-evidence-heading">
          <h2 id="dash-evidence-heading" className="font-display text-lg font-medium text-ink dark:text-zinc-100">
            Recent evidence
          </h2>
          <ul className="mt-4 divide-y divide-ink/10 rounded-xl border border-ink/10 bg-ink/[0.02] dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-900/60">
            {data.evidence.map((e) => (
            <li key={e.id} className="flex flex-col gap-1 px-4 py-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`inline-block rounded px-2 py-0.5 text-xs font-medium uppercase tracking-wide ${pillarClass(e.pillar)}`}>
                  {pillarLabel(e.pillar)}
                </span>
                <span className={`inline-block rounded px-2 py-0.5 text-xs font-medium uppercase tracking-wide ${statusClass(e.status)}`}>
                  {e.status.replace("_", " ")}
                </span>
                <span className="text-xs tabular-nums text-ink-muted dark:text-zinc-500">
                  {confidencePercent(e.confidence)} confidence
                </span>
              </div>
              <p className="mt-1 text-sm font-medium text-ink dark:text-zinc-200">{e.statute} — {e.articleSection}</p>
              <p className="text-xs text-ink-muted dark:text-zinc-500">{e.jurisdiction}</p>
              <blockquote className="mt-1 border-l-2 border-ink/20 pl-3 text-xs italic text-ink-muted line-clamp-2 dark:border-zinc-700 dark:text-zinc-500">
                {e.excerpt}
              </blockquote>
              <time className="mt-1 text-xs text-ink-faint dark:text-zinc-600" dateTime={e.extractedAt}>
                Extracted {formatShort(e.extractedAt)}
              </time>
            </li>
            ))}
          </ul>
        </section>
      )}

      {data.mappingActivity.length > 0 && (
        <section aria-labelledby="dash-activity-heading">
        <h2 id="dash-activity-heading" className="font-display text-lg font-medium text-ink dark:text-zinc-100">
          Mapping activity
        </h2>
        <ul className="mt-4 space-y-3">
          {data.mappingActivity.map((m, i) => (
            <li
              key={`${m.jurisdiction}-${i}`}
              className="flex flex-col gap-1 border-b border-ink/10 pb-3 last:border-0 dark:border-zinc-800 sm:flex-row sm:justify-between"
            >
              <div>
                <p className="text-sm font-medium text-ink dark:text-zinc-200">{m.jurisdiction}</p>
                <p className="text-sm text-ink-muted dark:text-zinc-500">{m.detail}</p>
              </div>
              <time className="text-xs text-ink-faint dark:text-zinc-600 sm:shrink-0" dateTime={m.occurredAt}>
                {formatShort(m.occurredAt)}
              </time>
            </li>
          ))}
        </ul>
      </section>
      )}
    </div>
  );
}
