import type { ReactNode } from "react";
import { SiteFooter } from "./SiteFooter";
import { SiteHeader } from "./SiteHeader";

type ProductPageShellProps = {
  title: string;
  kicker?: string;
  intro: string;
  panelCaption: string;
  children?: ReactNode;
};

export function ProductPageShell({ title, kicker = "Cockpit workspace", intro, panelCaption, children }: ProductPageShellProps) {
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
          <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-14">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-muted">{kicker}</p>
            <h1 className="mt-3 font-serif text-3xl font-normal tracking-tight text-ink sm:text-4xl">{title}</h1>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-ink-muted sm:text-base">{intro}</p>
            <div
              className="mt-10 min-h-[200px] rounded-2xl border border-dashed border-ink/20 bg-canvas-subtle/50 p-6 sm:p-8"
              aria-label="Data panel placeholder"
            >
              <p className="text-xs font-semibold uppercase tracking-wider text-ink-faint">Panel reserved</p>
              <p className="mt-2 text-sm text-ink-muted">{panelCaption}</p>
              {children}
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
