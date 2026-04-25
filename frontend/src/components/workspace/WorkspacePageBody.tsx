import type { ReactNode } from "react";

export type WorkspacePageBodyProps = {
  title: string;
  kicker?: string;
  intro: string;
  panelCaption: string;
  children?: ReactNode;
};

/** Main document block for workspace routes — styled for the dashboard shell (incl. dark mode). */
export function WorkspacePageBody({
  title,
  kicker = "Cockpit workspace",
  intro,
  panelCaption,
  children,
}: WorkspacePageBodyProps) {
  return (
    <div className="border-b border-ink/10 dark:border-zinc-800">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-muted dark:text-zinc-500">{kicker}</p>
        <h1 className="mt-3 font-serif text-3xl font-normal tracking-tight text-ink dark:text-zinc-100 sm:text-4xl">{title}</h1>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-ink-muted dark:text-zinc-400 sm:text-base">{intro}</p>
        <div
          className="mt-10 min-h-[200px] rounded-2xl border border-dashed border-ink/20 bg-canvas/50 p-6 dark:border-zinc-700 dark:bg-zinc-900/40 sm:p-8"
          aria-label="Data panel placeholder"
        >
          <p className="text-xs font-semibold uppercase tracking-wider text-ink-faint dark:text-zinc-500">Panel reserved</p>
          <p className="mt-2 text-sm text-ink-muted dark:text-zinc-400">{panelCaption}</p>
          {children}
        </div>
      </div>
    </div>
  );
}
