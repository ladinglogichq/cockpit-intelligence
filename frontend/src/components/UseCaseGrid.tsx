import { Link } from "react-router-dom";
import { ArrowOut } from "./icons";

type CaseCard =
  | {
      n: string;
      title: string;
      body: string;
      href: string;
    }
  | {
      n: string;
      title: string;
      body: string;
      to: string;
    };

const cases: CaseCard[] = [
  {
    n: "01",
    title: "Multi-entity investigations",
    body: "Trace flows across chains and entities with reproducible steps and exportable audit trails.",
    to: "/cases",
  },
  {
    n: "02",
    title: "Alert enrichment",
    body: "Enrich raw alerts with context, dismiss noise, or escalate with everything an analyst needs.",
    to: "/alerts",
  },
  {
    n: "03",
    title: "Defensible reports",
    body: "Generate structured intelligence summaries aligned to how your team reviews and signs off.",
    to: "/reports",
  },
  {
    n: "04",
    title: "Custom workspaces",
    body: "Spin up purpose-built tools and dashboards for specialized investigative programs.",
    to: "/dashboard",
  },
];

export function UseCaseGrid() {
  return (
    <section id="use-cases" className="border-t border-ink/10 bg-canvas py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <h2 className="max-w-2xl font-serif text-3xl font-normal tracking-tight text-ink sm:text-4xl">
          Designed for real investigation workloads
        </h2>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:gap-6">
          {cases.map((c) => {
            const className =
              "group relative flex border border-ink/10 bg-canvas-raised p-6 transition hover:border-ink/25 hover:bg-canvas-subtle";
            const inner = (
              <>
                <div className="min-w-0 flex-1 pr-8">
                  <p className="text-xs font-semibold uppercase tracking-wider text-ink-faint">{c.n}</p>
                  <h3 className="mt-2 font-display text-xl font-semibold text-ink">{c.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-muted">{c.body}</p>
                </div>
                <span className="absolute right-5 top-5 text-ink-faint transition group-hover:text-ink">
                  <ArrowOut />
                </span>
              </>
            );
            return "to" in c ? (
              <Link key={c.n} to={c.to} className={className}>
                {inner}
              </Link>
            ) : (
              <a key={c.n} href={c.href} className={className}>
                {inner}
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
