import { useEffect } from "react";
import { Link } from "react-router-dom";
import { SiteFooter } from "../components/SiteFooter";
import { SiteHeader } from "../components/SiteHeader";

/**
 * Educational overview of how data protection compliance assessments are commonly modeled.
 * Taxonomy and thresholds vary by jurisdiction and framework—verify against your legal counsel.
 */

const COMPLIANCE_TAG_ROWS: readonly { tag: string; summary: string }[] = [
  {
    tag: "Cross-border data transfer restriction",
    summary: "Clauses that impose limitations on transferring personal data outside the jurisdiction without adequate safeguards or authorization.",
  },
  {
    tag: "Data localization requirement",
    summary: "Provisions requiring personal data to be stored and processed within national borders, with exceptions only for specific circumstances.",
  },
  {
    tag: "Consent obligation",
    summary: "Clauses requiring explicit, informed, and freely given consent from data subjects before processing personal data.",
  },
  {
    tag: "Data subject rights",
    summary: "Provisions granting individuals rights to access, correct, delete, or restrict processing of their personal data.",
  },
  {
    tag: "Breach notification requirement",
    summary: "Clauses mandating notification to data subjects and regulators within specified timeframes following a data breach.",
  },
  {
    tag: "Data retention limit",
    summary: "Requirements that personal data not be retained longer than necessary for the purpose for which it was collected.",
  },
  {
    tag: "Data processing agreement",
    summary: "Obligations to have written agreements with data processors that meet or exceed data controller responsibilities.",
  },
  {
    tag: "Data protection impact assessment",
    summary: "Requirements to conduct and document DPIAs for high-risk processing activities before they commence.",
  },
  {
    tag: "DPO appointment",
    summary: "Mandates for organizations to appoint a Data Protection Officer when meeting certain thresholds or processing sensitive data.",
  },
  {
    tag: "Data portability",
    summary: "Rights of data subjects to receive their personal data in a structured, commonly used, machine-readable format.",
  },
  {
    tag: "Special category data",
    summary: "Additional protections and restrictions for processing sensitive personal data such as health, biometric, or political opinions.",
  },
  {
    tag: "Third-party disclosure",
    summary: "Requirements and restrictions on sharing personal data with third parties, including consent and contractual safeguards.",
  },
  {
    tag: "Automated decision-making",
    summary: "Rights and safeguards regarding decisions made solely by automated means, including the right to human intervention.",
  },
  {
    tag: "International data transfer adequacy",
    summary: "Provisions related to transfers to countries deemed to have adequate data protection frameworks by the home jurisdiction.",
  },
  {
    tag: "Regulatory authority notification",
    summary: "Requirements to register or notify data protection authorities of certain processing activities or data breaches.",
  },
  {
    tag: "Purpose limitation",
    summary: "Requirements that personal data be collected for specified, explicit, and legitimate purposes and not further processed incompatibly.",
  },
  {
    tag: "Data minimization",
    summary: "Principles requiring that only data adequate, relevant, and limited to what is necessary for the intended purpose be collected.",
  },
];

export function RiskExposureMethodologyPage() {
  useEffect(() => {
    const prev = document.title;
    document.title = "Compliance assessment methodology — Cockpit";
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
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-muted">Methodology</p>
            <h1 className="mt-3 max-w-3xl font-serif text-4xl font-normal tracking-tight text-ink sm:text-5xl">
              Data protection compliance assessment
            </h1>
            <p className="mt-4 max-w-2xl text-lg text-ink-muted">
              Many compliance teams assess regulatory exposure by combining <strong className="font-medium text-ink/90">clause extraction</strong>,{" "}
              <strong className="font-medium text-ink/90">pillar mapping</strong>, and{" "}
              <strong className="font-medium text-ink/90">evidence verification</strong>. The ideas below describe common patterns—not a
              promise that Cockpit or any third party implements them identically.
            </p>
          </div>
        </div>

        <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
          <section aria-labelledby="tags-heading" className="scroll-mt-24">
            <h2 id="tags-heading" className="font-display text-2xl font-semibold tracking-tight text-ink">
              Compliance tags (illustrative)
            </h2>
            <p className="mt-4 text-base leading-relaxed text-ink-muted">
              Regulators and frameworks maintain taxonomies of <dfn>compliance obligations</dfn>—short labels attached to clauses
              in legal documents. Names and definitions differ by jurisdiction; the table is a neutral summary for onboarding and
              engineering design, not an exhaustive legal taxonomy.
            </p>
            <div className="mt-8 overflow-x-auto rounded-lg border border-ink/10">
              <table className="w-full min-w-[32rem] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-ink/10 bg-canvas-subtle/80">
                    <th scope="col" className="px-4 py-3 font-display font-semibold text-ink">
                      Tag (illustrative)
                    </th>
                    <th scope="col" className="px-4 py-3 font-display font-semibold text-ink">
                      Typical meaning
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {COMPLIANCE_TAG_ROWS.map((row) => (
                    <tr key={row.tag} className="border-b border-ink/10 last:border-b-0">
                      <th scope="row" className="whitespace-nowrap px-4 py-3 align-top font-medium text-ink">
                        {row.tag}
                      </th>
                      <td className="px-4 py-3 align-top text-ink-muted">{row.summary}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section aria-labelledby="metrics-heading" className="mt-14 border-t border-ink/10 pt-12">
            <h2 id="metrics-heading" className="font-display text-2xl font-semibold tracking-tight text-ink">
              Confidence scoring and coverage metrics
            </h2>
            <dl className="mt-6 space-y-4 text-base leading-relaxed text-ink-muted">
              <div>
                <dt className="font-medium text-ink">Confidence score</dt>
                <dd className="mt-1">
                  A numerical score (typically 0–1) representing the likelihood that a clause-to-pillar mapping is correct, based on
                  semantic similarity, keyword matching, and cross-referencing with established jurisprudence.
                </dd>
              </div>
              <div>
                <dt className="font-medium text-ink">Coverage percentage</dt>
                <dd className="mt-1">
                  The proportion of relevant legal documents successfully ingested, parsed, and mapped to pillars within a
                  jurisdiction or framework, so teams can assess completeness of their regulatory intelligence.
                </dd>
              </div>
            </dl>
          </section>

          <section aria-labelledby="clause-heading" className="mt-14 border-t border-ink/10 pt-12">
            <h2 id="clause-heading" className="font-display text-2xl font-semibold tracking-tight text-ink">
              Clause-level analysis (common patterns)
            </h2>
            <ol className="mt-6 list-decimal space-y-8 pl-5 text-base leading-relaxed text-ink-muted marker:text-ink/50">
              <li>
                <strong className="font-medium text-ink/90">Direct pillar match</strong> — The extracted clause carries clear
                indicators for RDTII Pillar 6 (Cross-Border Data Policies) or Pillar 7 (Domestic Data Protection & Privacy) based on
                explicit keywords and semantic analysis of the legal text.
              </li>
              <li>
                <strong className="font-medium text-ink/90">Indirect mapping via context</strong> — The engine analyzes
                surrounding clauses, section headers, and document structure to determine pillar affiliation when the clause
                itself is ambiguous, with confidence adjusted accordingly.
              </li>
              <li>
                <strong className="font-medium text-ink/90">Cross-jurisdiction comparison</strong> — Your organization maintains
                reference clauses from well-studied jurisdictions; the check identifies similar provisions across jurisdictions
                to inform mapping confidence and highlight regulatory convergence or divergence.
              </li>
            </ol>
          </section>

          <section aria-labelledby="verification-heading" className="mt-14 border-t border-ink/10 pt-12">
            <h2 id="verification-heading" className="font-display text-2xl font-semibold tracking-tight text-ink">
              Citation and evidence verification
            </h2>
            <ol className="mt-6 list-decimal space-y-8 pl-5 text-base leading-relaxed text-ink-muted marker:text-ink/50">
              <li>
                <strong className="font-medium text-ink/90">Source verification</strong> — Validate that each extracted clause
                matches verbatim with the source document, preserving article numbers, section references, and page numbers for
                accurate citation.
                <span className="mt-2 block text-sm text-ink-faint">
                  When working with scanned PDFs, OCR accuracy must be verified against the original to ensure no textual
                  artifacts have been introduced.
                </span>
              </li>
              <li>
                <strong className="font-medium text-ink/90">Citation formatting</strong> — Generate structured citations that
                  include document title, publication date, source URL, and specific article reference so evidence can be
                  independently verified by reviewers and auditors.
              </li>
              <li>
                <strong className="font-medium text-ink/90">Human review gates</strong> — Flag low-confidence mappings or
                ambiguous clauses for mandatory human review, with audit trails recording who verified what and when.
              </li>
            </ol>
            <p className="mt-8 text-sm leading-relaxed text-ink-faint">
              Citation formats, confidence thresholds, and which clauses require human review are policy-specific—configure
              and test them against your compliance review procedures and legal counsel requirements.
            </p>
          </section>

          <section aria-labelledby="disclaimer-heading" className="mt-14 border-t border-ink/10 pt-12">
            <h2 id="disclaimer-heading" className="font-display text-xl font-semibold text-ink">
              Disclaimer
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-ink-muted">
              This page is general educational material. It is not legal advice or a substitute for professional legal
              counsel. Regulatory interpretations, pillar mappings, and compliance assessments depend on your jurisdiction,
              specific business context, and internal policies.
            </p>
          </section>

          <nav
            className="mt-14 flex flex-col gap-4 border-t border-ink/10 pt-10 text-sm sm:flex-row sm:flex-wrap sm:gap-x-8"
            aria-label="Related pages"
          >
            <Link
              to="/explore-data"
              className="font-medium text-ink underline decoration-ink/25 underline-offset-4 transition hover:text-ink-muted"
            >
              Evidence record exports
            </Link>
            <Link
              to="/pricing"
              className="font-medium text-ink underline decoration-ink/25 underline-offset-4 transition hover:text-ink-muted"
            >
              Pricing
            </Link>
            <Link
              to="/#blog"
              className="font-medium text-ink underline decoration-ink/25 underline-offset-4 transition hover:text-ink-muted"
            >
              ← Blog teasers
            </Link>
          </nav>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
