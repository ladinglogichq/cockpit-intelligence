import { useEffect } from "react";
import { Link } from "react-router-dom";
import { SiteFooter } from "../components/SiteFooter";
import { SiteHeader } from "../components/SiteHeader";

/**
 * Developer-facing documentation: open-source codebase, technical architecture,
 * and output format examples for integration teams.
 */

export function DevelopersPage() {
  useEffect(() => {
    const prev = document.title;
    document.title = "Developers — Cockpit";
    return () => {
      document.title = prev;
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
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-muted">Developers</p>
            <h1 className="mt-3 max-w-3xl font-serif text-4xl font-normal tracking-tight text-ink sm:text-5xl">
              Build on Cockpit
            </h1>
            <p className="mt-4 max-w-2xl text-lg text-ink-muted">
              Full open-source codebase, documented architecture, and machine-readable outputs for your own
              compliance workflows.
            </p>
          </div>
        </div>

        <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
          <section aria-labelledby="opensource-heading" className="scroll-mt-24">
            <h2 id="opensource-heading" className="font-display text-2xl font-semibold tracking-tight text-ink">
              Full Open-Source Codebase
            </h2>
            <p className="mt-4 text-base leading-relaxed text-ink-muted">
              Cockpit is fully open source under Apache 2.0. Everything you need to self-host, extend, or
              integrate is documented and reproducible.
            </p>
            <ul className="mt-6 space-y-3 text-base leading-relaxed text-ink-muted">
              <li className="flex gap-3">
                <span className="text-ink">·</span>
                <span><strong className="font-medium text-ink/90">Apache 2.0 license</strong> — commercial use,
                modification, and distribution allowed with attribution</span>
              </li>
              <li className="flex gap-3">
                <span className="text-ink">·</span>
                <span><strong className="font-medium text-ink/90">Complete README</strong> — setup instructions,
                architecture overview, and contribution guidelines</span>
              </li>
              <li className="flex gap-3">
                <span className="text-ink">·</span>
                <span><strong className="font-medium text-ink/90">Environment setup</strong> — Docker compose and
                local dev scripts for one-command startup</span>
              </li>
              <li className="flex gap-3">
                <span className="text-ink">·</span>
                <span><strong className="font-medium text-ink/90">TypeScript throughout</strong> — type-safe codebase
                for confident refactoring and extensions</span>
              </li>
            </ul>
          </section>

          <section aria-labelledby="docs-heading" className="mt-14 border-t border-ink/10 pt-12">
            <h2 id="docs-heading" className="font-display text-2xl font-semibold tracking-tight text-ink">
              Technical Documentation
            </h2>
            <p className="mt-4 text-base leading-relaxed text-ink-muted">
              Understand how extraction and mapping work, and swap to your own models when needed.
            </p>
            <ul className="mt-6 space-y-3 text-base leading-relaxed text-ink-muted">
              <li className="flex gap-3">
                <span className="text-ink">·</span>
                <span><strong className="font-medium text-ink/90">Extraction logic</strong> — step-by-step breakdown of
                how legal documents are parsed and clause-level segments are identified</span>
              </li>
              <li className="flex gap-3">
                <span className="text-ink">·</span>
                <span><strong className="font-medium text-ink/90">Mapping architecture</strong> — how pillar assignments
                are scored, confidence thresholds are applied, and cross-pillar flags are set</span>
              </li>
              <li className="flex gap-3">
                <span className="text-ink">·</span>
                <span><strong className="font-medium text-ink/90">Self-hosted models</strong> — instructions for
                swapping to open-weight models like Llama, Mistral, or your own fine-tunes</span>
              </li>
              <li className="flex gap-3">
                <span className="text-ink">·</span>
                <span><strong className="font-medium text-ink/90">API reference</strong> — full documentation of
                endpoints, request/response schemas, and authentication</span>
              </li>
            </ul>
          </section>

          <section aria-labelledby="output-heading" className="mt-14 border-t border-ink/10 pt-12">
            <h2 id="output-heading" className="font-display text-2xl font-semibold tracking-tight text-ink">
              Output Sample
            </h2>
            <p className="mt-4 text-base leading-relaxed text-ink-muted">
              Machine-readable files with everything you need for downstream processing, reporting, and audit
              trails.
            </p>
            <div className="mt-6 rounded-xl border border-ink/10 bg-ink/[0.02] p-4 dark:border-zinc-800 dark:bg-zinc-900/40">
              <pre className="overflow-x-auto text-xs font-mono text-ink dark:text-zinc-200">
{`{
  "id": "EVD-2048",
  "jurisdiction": "Kenya",
  "statute": "Data Protection Act, 2019",
  "articleSection": "Section 31(c)",
  "pillar": "pillar_6",
  "pillarSubIndicator": "6.2",
  "confidence": 0.61,
  "status": "needs_review",
  "excerpt": "A data controller or processor shall establish and
    maintain appropriate technical and organisational measures
    to ensure that personal data is stored and processed within
    the territory of Kenya...",
  "rationale": "Mandates data storage and processing within Kenyan
    territory, indicating a localization requirement under
    Pillar 6.2.",
  "sourceUrl": "https://kenyalaw.org/dpa-2019",
  "extractedAt": "2025-01-15T08:30:00Z",
  "discoveryTags": ["localization", "data-residency", "cross-border"]
}`}
              </pre>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-ink-muted">
              Each record includes indicator mapping, exact citations, verbatim snippets, and discovery tags
              for filtering and analysis.
            </p>
          </section>

          <nav
            className="mt-14 flex flex-col gap-4 border-t border-ink/10 pt-10 text-sm sm:flex-row sm:flex-wrap sm:gap-x-8"
            aria-label="Related pages"
          >
            <Link
              to="/blog"
              className="font-medium text-ink underline decoration-ink/25 underline-offset-4 transition hover:text-ink-muted"
            >
              Evidence pipeline walkthrough
            </Link>
            <Link
              to="/explore-data"
              className="font-medium text-ink underline decoration-ink/25 underline-offset-4 transition hover:text-ink-muted"
            >
              Export formats
            </Link>
            <Link
              to="/pricing"
              className="font-medium text-ink underline decoration-ink/25 underline-offset-4 transition hover:text-ink-muted"
            >
              Pricing
            </Link>
          </nav>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
