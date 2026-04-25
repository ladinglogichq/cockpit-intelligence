import { useEffect } from "react";
import { Link } from "react-router-dom";
import { SiteFooter } from "../components/SiteFooter";
import { SiteHeader } from "../components/SiteHeader";
import { ArrowRight } from "../components/icons";

const MOCK_ALERT = {
  id: "EVD-2048",
  title: "Cross-border transfer clause flagged (Kenya DPA)",
  severity: "high" as const,
  status: "needs_review" as const,
  summary:
    "Clause 31(c) imposes data localisation requirements that may conflict with the entity's EU-to-Africa transfer mechanism. Confidence: 0.61 — flagged for human review.",
};

const MOCK_JURISDICTION = {
  label: "Jurisdiction context",
  code: "KEN-DPA-2019",
  region: "Africa · East",
  tags: ["Pillar 7", "Domestic data protection", "Localisation requirement"],
};

const PILLARS = [
  {
    title: "Discover",
    body: "Surface data protection laws, gazette notices, and treaty amendments across jurisdictions in one retrieval queue, tuned for multi-language, high-volume regulatory environments.",
  },
  {
    title: "Extract & Map",
    body: "Parse legal documents down to clause level, map each clause to RDTII Pillar 6 or 7 sub-indicators, and score confidence so analysts know what needs review.",
  },
  {
    title: "Verify & Report",
    body: "Verify citations against source documents, attach human review gates for low-confidence mappings, and export defensible evidence bundles your team can stand behind.",
  },
] as const;

export function PlatformPage() {
  useEffect(() => {
    const prevTitle = document.title;
    const desc =
      "Preview Cockpit for regulation intelligence: evidence records, pillar mappings, and analyst review workflows. Illustrative UI only.";
    document.title = "Platform | Cockpit";

    const metaDesc = document.querySelector('meta[name="description"]');
    const prevDesc = metaDesc?.getAttribute("content") ?? "";
    if (metaDesc) metaDesc.setAttribute("content", desc);

    const ogTitle = document.querySelector('meta[property="og:title"]');
    const prevOgTitle = ogTitle?.getAttribute("content") ?? "";
    if (ogTitle) ogTitle.setAttribute("content", "Platform | Cockpit");

    const ogDesc = document.querySelector('meta[property="og:description"]');
    const prevOgDesc = ogDesc?.getAttribute("content") ?? "";
    if (ogDesc) ogDesc.setAttribute("content", desc);

    return () => {
      document.title = prevTitle;
      if (metaDesc) metaDesc.setAttribute("content", prevDesc);
      if (ogTitle) ogTitle.setAttribute("content", prevOgTitle);
      if (ogDesc) ogDesc.setAttribute("content", prevOgDesc);
    };
  }, []);

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-ink focus:text-canvas"
      >
        Skip to content
      </a>
      <SiteHeader />
      <main id="main" className="min-h-[70vh] bg-canvas">
        <div className="border-b border-ink/10 bg-grid-fade">
          <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-16">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-muted">Platform preview</p>
            <h1 className="mt-3 max-w-3xl font-serif text-4xl font-normal tracking-tight text-ink sm:text-5xl">
              Regulation intelligence, before it falls through the cracks
            </h1>
            <p className="mt-4 max-w-2xl text-lg leading-relaxed text-ink-muted">
              Cockpit blends multi-source document retrieval with LLM-based clause extraction so your team can discover, map,
              and verify data protection obligations with evidence you can defend. Below is a{" "}
              <strong className="font-medium text-ink/90">read-only preview</strong>: no live data or integrations in this
              marketing build.
            </p>
          </div>
        </div>

        <section className="border-b border-ink/10 py-14 sm:py-16" aria-labelledby="pillars-heading">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <h2 id="pillars-heading" className="font-serif text-2xl font-normal tracking-tight text-ink sm:text-3xl">
              How teams use Cockpit
            </h2>
            <ul className="mt-10 grid gap-8 sm:grid-cols-3">
              {PILLARS.map((p) => (
                <li key={p.title}>
                  <h3 className="font-display text-lg font-semibold text-ink">{p.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-ink-muted">{p.body}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="py-14 sm:py-16" aria-labelledby="mock-ui-heading">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <             h2 id="mock-ui-heading" className="font-serif text-2xl font-normal tracking-tight text-ink sm:text-3xl">
              Preview: evidence record and jurisdiction context
            </h2>
            <p className="mt-3 max-w-2xl text-sm text-ink-muted">
              Illustrative panels only (copy and structure). Connect your stack when you move past the marketing site.
            </p>

            <div className="mt-10 grid gap-6 lg:grid-cols-2">
              <article
                className="flex flex-col border border-ink/15 bg-canvas-subtle/40 p-6 sm:p-8"
                aria-labelledby="mock-alert-title"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-sm bg-ink/10 px-2 py-0.5 text-xs font-medium text-ink">Evidence</span>
                  <span className="text-xs text-ink-muted">{MOCK_ALERT.id}</span>
                </div>
                <h3 id="mock-alert-title" className="mt-4 font-display text-xl font-semibold text-ink">
                  {MOCK_ALERT.title}
                </h3>
                <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <dt className="text-ink-muted">Confidence</dt>
                    <dd className="font-medium capitalize text-ink">{MOCK_ALERT.severity}</dd>
                  </div>
                  <div>
                    <dt className="text-ink-muted">Status</dt>
                    <dd className="font-medium capitalize text-ink">{MOCK_ALERT.status}</dd>
                  </div>
                </dl>
                <p className="mt-4 flex-1 text-sm leading-relaxed text-ink-muted">{MOCK_ALERT.summary}</p>
              </article>

              <article
                className="flex flex-col border border-ink/15 bg-canvas-subtle/40 p-6 sm:p-8"
                aria-labelledby="mock-jurisdiction-title"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-sm bg-ink/10 px-2 py-0.5 text-xs font-medium text-ink">Jurisdiction</span>
                  <span className="text-xs text-ink-muted">{MOCK_JURISDICTION.region}</span>
                </div>
                <h3 id="mock-jurisdiction-title" className="mt-4 font-display text-xl font-semibold text-ink">
                  {MOCK_JURISDICTION.label}
                </h3>
                <p className="mt-2 font-mono text-sm text-ink/90">{MOCK_JURISDICTION.code}</p>
                <ul className="mt-4 flex flex-wrap gap-2" aria-label="Tags">
                  {MOCK_JURISDICTION.tags.map((t) => (
                    <li key={t}>
                      <span className="inline-block border border-ink/15 px-2 py-1 text-xs text-ink-muted">{t}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-6 text-sm leading-relaxed text-ink-muted">
                  Jurisdiction and pillar mapping views ship in a full deployment; here we show how analysts scan context next to an evidence record.
                </p>
              </article>
            </div>

            <div className="mt-12 flex flex-wrap items-center gap-4">
              <Link
                to="/pricing"
                className="group inline-flex min-h-[44px] items-center gap-2 bg-accent px-6 py-3 text-base font-semibold text-canvas transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-canvas"
              >
                View pricing
                <ArrowRight className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                to={{ pathname: "/", hash: "get-started" }}
                className="inline-flex min-h-[44px] items-center border border-ink/25 px-6 py-3 text-base font-semibold text-ink transition-colors hover:border-ink/50 hover:bg-ink/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-canvas"
              >
                Get started
              </Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
