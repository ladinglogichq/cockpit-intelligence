import { useEffect } from "react";
import { Link } from "react-router-dom";
import { SiteFooter } from "../components/SiteFooter";
import { SiteHeader } from "../components/SiteHeader";

/**
 * Methodology note: how agents extract and map legal text from regulation documents
 * to RDTII Pillar 6 (cross-border data policies), Pillar 7 (domestic data protection),
 * Pillar 8 (internet intermediary liability), and Pillar 9 (accessing commercial content).
 */

export function BlogPage() {
  useEffect(() => {
    const prev = document.title;
    document.title = "Blog — Cockpit";
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
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-muted">Blog · Evidence pipeline</p>
            <h1 className="mt-3 max-w-3xl font-serif text-4xl font-normal tracking-tight text-ink sm:text-5xl">
              Reading regulation intelligence: how agents extract and map legal text
            </h1>
            <p className="mt-4 max-w-2xl text-lg text-ink-muted">
              Retrieving a law is the easy part. Turning it into structured, citable evidence that maps to a specific
              pillar indicator—without hallucinating obligations—is where the pipeline matters.
            </p>
          </div>
        </div>

        <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
          <section id="discovery" aria-labelledby="discovery-heading" className="scroll-mt-24">
            <h2 id="discovery-heading" className="font-display text-2xl font-semibold tracking-tight text-ink">
              Stage 1 — Discover
            </h2>
            <p className="mt-4 text-base leading-relaxed text-ink-muted">
              The discovery agent searches gazette repositories, regulatory body websites, and treaty databases for
              primary sources. It returns ranked URLs with publication date, jurisdiction, and document type. No content
              is stored until the next stage confirms the document is in scope.
            </p>
          </section>

          <section aria-labelledby="retrieve-heading" className="mt-14 border-t border-ink/10 pt-12">
            <h2 id="retrieve-heading" className="font-display text-2xl font-semibold tracking-tight text-ink">
              Stage 2 — Retrieve & parse
            </h2>
            <p className="mt-4 text-base leading-relaxed text-ink-muted">
              The parser agent fetches the document (PDF, HTML, or scanned image), runs OCR where needed, and segments
              it into <strong className="font-medium text-ink/90">clause-level chunks</strong>. Each chunk carries the
              source URL, page reference, and character offsets so every downstream citation is traceable to the
              original.
            </p>
          </section>

          <section aria-labelledby="mapping-heading" className="mt-14 border-t border-ink/10 pt-12">
            <h2 id="mapping-heading" className="font-display text-2xl font-semibold tracking-tight text-ink">
              Stage 3 — Extract & map
            </h2>
            <p className="mt-4 text-base leading-relaxed text-ink-muted">
              The legal mapper agent scores each clause against RDTII Pillar 6 (cross-border data transfer), Pillar 7
              (domestic data protection), Pillar 8 (internet intermediary liability), and Pillar 9 (accessing commercial content)
              sub-indicators. Confidence below 0.70 is automatically flagged{" "}
              <code className="rounded bg-canvas-subtle px-1 text-sm">needs_human_review</code>. Clauses that span multiple
              pillars produce separate mapping records, each tagged <code className="rounded bg-canvas-subtle px-1 text-sm">cross_pillar</code>.
            </p>
          </section>

          <section aria-labelledby="verify-heading" className="mt-14 border-t border-ink/10 pt-12">
            <h2 id="verify-heading" className="font-display text-2xl font-semibold tracking-tight text-ink">
              Stage 4 — Verify
            </h2>
            <p className="mt-4 text-base leading-relaxed text-ink-muted">
              The verifier agent re-fetches the source document and checks that the extracted clause text matches the
              live primary source. If the document has changed since retrieval, the evidence record is marked stale and
              queued for re-extraction. The system never silently uses outdated evidence.
            </p>
          </section>

          <section aria-labelledby="limits-heading" className="mt-14 border-t border-ink/10 pt-12">
            <h2 id="limits-heading" className="font-display text-xl font-semibold text-ink">
              What this is not
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-ink-muted">
              This page describes pipeline architecture, not legal advice. Pillar indicator mapping is an analytical
              tool; jurisdiction coverage varies; your legal and compliance teams own the sign-off. Cockpit's product
              surfaces evolve—verify current capabilities in app and in your order documentation.
            </p>
          </section>

          <nav
            className="mt-14 flex flex-col gap-4 border-t border-ink/10 pt-10 text-sm sm:flex-row sm:flex-wrap sm:gap-x-8"
            aria-label="Continue reading"
          >
            <Link
              to="/"
              className="font-medium text-ink underline decoration-ink/25 underline-offset-4 transition hover:text-ink-muted"
            >
              ← Home
            </Link>
            <Link
              to="/explore-data"
              className="font-medium text-ink underline decoration-ink/25 underline-offset-4 transition hover:text-ink-muted"
            >
              Compliance-ready exports
            </Link>
            <Link
              to="/pricing"
              className="font-medium text-ink underline decoration-ink/25 underline-offset-4 transition hover:text-ink-muted"
            >
              Pricing
            </Link>
          </nav>
        </article>
      </main>
      <SiteFooter />
    </>
  );
}
