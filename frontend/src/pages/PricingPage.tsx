import { useEffect, useId, useState } from "react";
import { SiteFooter } from "../components/SiteFooter";
import { SiteHeader } from "../components/SiteHeader";
import { GetStartedTrigger } from "../components/GetStartedTrigger";
import { PricingUsageSection } from "../components/PricingUsageSection";

type TierDef = {
  name: string;
  /** Monthly USD list price; 0 = free; null = custom / contact */
  monthly: number | null;
  blurb: string;
  cta: string;
  highlighted: boolean;
  features: string[];
};

/**
 * List-price tiers (illustrative). Annual option uses 10× monthly (two months off) — common SaaS pattern
 * aligned with API product pricing UX (e.g. sim.dune.com/pricing-style layouts: centered hero, toggle, cards).
 */
const TIERS: TierDef[] = [
  {
    name: "Free",
    monthly: 0,
    blurb: "Try agents and Tracer on a small monthly envelope.",
    cta: "Start free",
    highlighted: false,
    features: [
      "1 seat",
      "2k agent tool calls / month",
      "Solana + EVM via standard RPC",
      "Tracer: 1 active canvas",
      "Community support",
    ],
  },
  {
    name: "Starter",
    monthly: 99,
    blurb: "Solo analysts and proof-of-value pilots.",
    cta: "Get started",
    highlighted: false,
    features: [
      "1 seat",
      "25k agent tool calls / month",
      "Core chains (Solana, EVM)",
      "Tracer: 3 active canvases",
      "Email support",
    ],
  },
  {
    name: "Team",
    monthly: 349,
    blurb: "Investigation pods with shared evidence trails.",
    cta: "Get started",
    highlighted: true,
    features: [
      "Up to 5 seats",
      "150k agent tool calls / month",
      "Multi-chain + priority RPC lane",
      "Tracer: unlimited canvases",
      "Risk / sanctions bundle (fair use)",
      "Shared workspace & export audit logs",
    ],
  },
  {
    name: "Enterprise",
    monthly: null,
    blurb: "Regulated teams needing SLAs and custom data estates.",
    cta: "Contact sales",
    highlighted: false,
    features: [
      "Unlimited seats (named)",
      "Custom agent & usage envelopes",
      "Dedicated support & review windows",
      "VPC / data residency (where available)",
      "Custom integrations & DPAs",
    ],
  },
];

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width={16} height={16} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M20 6L9 17l-5-5"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function priceBlock(tier: TierDef, annual: boolean): { headline: string; sub: string } {
  if (tier.monthly === null) {
    return { headline: "Custom", sub: "Talk to us" };
  }
  if (tier.monthly === 0) {
    return { headline: "$0", sub: "forever · no card" };
  }
  if (!annual) {
    return {
      headline: `$${tier.monthly}`,
      sub: "per month",
    };
  }
  const yearly = tier.monthly * 10;
  const perMo = Math.round(yearly / 12);
  return {
    headline: `$${yearly.toLocaleString("en-US")}`,
    sub: `per year (~$${perMo}/mo)`,
  };
}

export function PricingPage() {
  const [annual, setAnnual] = useState(false);
  const toggleId = useId();
  const monthlyId = `${toggleId}-monthly`;
  const annualId = `${toggleId}-annual`;

  useEffect(() => {
    const prev = document.title;
    document.title = "Pricing — Cockpit";
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
      <main id="main" className="min-h-[70vh] bg-canvas text-ink">
        {/* Hero — centered, narrow measure (Sim-style pricing hero) */}
        <div className="border-b border-ink/10 bg-[radial-gradient(ellipse_120%_80%_at_50%_-40%,rgba(0,0,0,0.06),transparent)]">
          <div className="mx-auto max-w-2xl px-4 pb-12 pt-14 text-center sm:px-6 sm:pb-16 sm:pt-20">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-ink-muted">Pricing</p>
            <h1 className="mt-4 font-serif text-[2rem] font-normal leading-[1.15] tracking-tight text-ink sm:text-5xl sm:leading-[1.1]">
              Plans for on-chain intelligence
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-ink-muted sm:text-lg">
              Start free, then scale with usage-based envelopes. USD list prices; annual prepay saves versus monthly billing.
            </p>

            {/* Billing period toggle */}
            <div
              className="mx-auto mt-10 inline-flex items-center gap-1 rounded-full border border-ink/10 bg-canvas-subtle/80 p-1 shadow-[inset_0_1px_0_rgba(0,0,0,0.04)]"
              role="group"
              aria-label="Billing period"
            >
              <button
                id={monthlyId}
                type="button"
                onClick={() => setAnnual(false)}
                className={`min-h-[40px] rounded-full px-5 py-2 text-sm font-medium transition-colors ${
                  !annual ? "bg-canvas text-ink shadow-sm ring-1 ring-ink/10" : "text-ink-muted hover:text-ink"
                }`}
                aria-pressed={!annual}
              >
                Monthly
              </button>
              <button
                id={annualId}
                type="button"
                onClick={() => setAnnual(true)}
                className={`inline-flex min-h-[40px] items-center gap-2 rounded-full px-5 py-2 text-sm font-medium transition-colors ${
                  annual ? "bg-canvas text-ink shadow-sm ring-1 ring-ink/10" : "text-ink-muted hover:text-ink"
                }`}
                aria-pressed={annual}
              >
                Annual
                <span className="rounded-full bg-ink/10 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-ink/80">
                  Save 2 mo
                </span>
              </button>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-16">
          <div className="grid gap-5 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4 xl:gap-5">
            {TIERS.map((tier) => {
              const { headline, sub } = priceBlock(tier, annual);
              return (
                <section
                  key={tier.name}
                  className={`relative flex flex-col rounded-2xl border p-6 sm:p-7 ${
                    tier.highlighted
                      ? "border-ink bg-canvas shadow-[0_20px_50px_-24px_rgba(0,0,0,0.35)] ring-1 ring-ink/10 xl:z-[1] xl:scale-[1.02] xl:shadow-xl"
                      : "border-ink/12 bg-canvas-subtle/30"
                  }`}
                  aria-labelledby={`tier-${tier.name}`}
                >
                  {tier.highlighted ? (
                    <p className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-ink px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-canvas">
                      Most popular
                    </p>
                  ) : null}
                  <h2 id={`tier-${tier.name}`} className="font-display text-lg font-semibold tracking-tight text-ink">
                    {tier.name}
                  </h2>
                  <p className="mt-2 min-h-[2.75rem] text-sm leading-relaxed text-ink-muted">{tier.blurb}</p>
                  <div className="mt-6 border-t border-ink/10 pt-6">
                    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                      <span className="font-serif text-4xl font-normal tabular-nums tracking-tight text-ink">{headline}</span>
                    </div>
                    <p className="mt-1 text-sm text-ink-muted">{sub}</p>
                  </div>
                  <ul className="mt-8 flex-1 space-y-3 text-sm leading-relaxed">
                    {tier.features.map((f) => (
                      <li key={f} className="flex gap-3 text-ink/90">
                        <CheckIcon className="mt-0.5 shrink-0 text-ink/60" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-8">
                    {tier.name === "Enterprise" ? (
                      <a
                        href="mailto:support@daemonprotocol.com?subject=Cockpit%20Enterprise%20pricing"
                        className={`inline-flex min-h-[44px] w-full items-center justify-center rounded-xl px-4 text-sm font-semibold transition-opacity hover:opacity-90 ${
                          tier.highlighted
                            ? "bg-accent text-canvas"
                            : "border border-ink/20 bg-canvas text-ink hover:border-ink/35"
                        }`}
                      >
                        {tier.cta}
                      </a>
                    ) : (
                      <GetStartedTrigger
                        className={`inline-flex min-h-[44px] w-full items-center justify-center rounded-xl px-4 text-sm font-semibold transition-opacity hover:opacity-90 ${
                          tier.highlighted
                            ? "bg-accent text-canvas"
                            : "border border-ink/20 bg-canvas text-ink hover:border-ink/35"
                        }`}
                      >
                        {tier.cta}
                      </GetStartedTrigger>
                    )}
                  </div>
                </section>
              );
            })}
          </div>

          <p className="mx-auto mt-12 max-w-2xl text-center text-sm leading-relaxed text-ink-faint">
            Prefer a comparable API-style catalog for multichain compute? See{" "}
            <a
              href="https://sim.dune.com/pricing"
              target="_blank"
              rel="noreferrer noopener"
              className="font-medium text-ink/80 underline decoration-ink/25 underline-offset-[5px] transition-colors hover:text-ink hover:decoration-ink/50"
            >
              Sim by Dune — Pricing
            </a>{" "}
            for reference. Cockpit tiers above are independent list prices for planning only.
          </p>

          <PricingUsageSection />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
