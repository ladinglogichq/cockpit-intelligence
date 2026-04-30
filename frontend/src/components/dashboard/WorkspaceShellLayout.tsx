import { type FormEvent, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { useWorkspaceComposer } from "../../context/WorkspaceComposerContext";
import { DashboardThemeProvider } from "../../context/DashboardThemeContext";
import { WorkspaceComposerProvider } from "../../context/WorkspaceComposerContext";
import { WorkspaceProfileProvider } from "../../context/WorkspaceProfileContext";
import { WORKSPACE_NAV } from "../../nav/workspaceNav";
import { DashboardSidebarFooter } from "./DashboardSidebarFooter";
import { InvestigationComposerToolbar } from "./InvestigationComposerToolbar";

function MenuIcon({ open }: { open: boolean }) {
  return (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
      {open ? <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" /> : <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />}
    </svg>
  );
}

function WorkspaceShellLayoutInner() {
  const { pathname } = useLocation();
  const isDashboard = pathname === "/dashboard" || pathname === "/dashboard/";
  /** Investigation composer is dashboard-only; operational pages use full viewport for tables and panels. */
  const showInvestigationComposer = isDashboard;
  const { query, setQuery, attachments, removeAttachment, submitInvestigation } = useWorkspaceComposer();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    submitInvestigation();
  }

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex min-h-10 items-center rounded-lg px-3 text-sm font-medium transition-colors ${
      isActive
        ? "bg-ink/10 text-ink dark:bg-zinc-800 dark:text-zinc-100"
        : "text-ink-muted hover:bg-ink/5 hover:text-ink dark:text-zinc-400 dark:hover:bg-zinc-800/80 dark:hover:text-zinc-100"
    }`;

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-ink focus:text-canvas dark:focus:bg-zinc-100 dark:focus:text-zinc-950"
      >
        Skip to content
      </a>

      <div className="isolate flex h-dvh w-full overflow-hidden bg-canvas text-ink dark:bg-zinc-950 dark:text-zinc-100">
        {mobileNavOpen ? (
          <button
            type="button"
            className="fixed inset-0 z-40 bg-ink/35 dark:bg-black/50 md:hidden"
            aria-label="Close menu"
            onClick={() => setMobileNavOpen(false)}
          />
        ) : null}

        <aside
          id="workspace-sidebar"
          className={`fixed inset-y-0 left-0 z-50 flex w-[min(88vw,220px)] shrink-0 flex-col border-r border-ink/10 bg-canvas transition-transform duration-200 ease-out dark:border-zinc-800 dark:bg-zinc-950 md:static md:z-10 md:w-[200px] md:translate-x-0 ${
            mobileNavOpen ? "translate-x-0 shadow-xl" : "-translate-x-full md:translate-x-0"
          }`}
          aria-label="Workspace"
        >
          <div className="flex h-14 shrink-0 items-center justify-between border-b border-ink/10 px-3 dark:border-zinc-800">
            <Link
              to="/dashboard"
              className="font-display text-base font-semibold tracking-tight text-ink dark:text-zinc-100"
              onClick={() => setMobileNavOpen(false)}
            >
              Cockpit
            </Link>
            <Link
              to="/"
              className="text-xs font-medium text-ink-muted hover:text-ink dark:text-zinc-500 dark:hover:text-zinc-300"
              onClick={() => setMobileNavOpen(false)}
            >
              Home
            </Link>
          </div>
          <nav className="min-h-0 flex-1 space-y-0.5 overflow-y-auto p-2">
            {WORKSPACE_NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={navLinkClass}
                end={item.to === "/dashboard"}
                onClick={() => setMobileNavOpen(false)}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
          <DashboardSidebarFooter />
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex h-14 shrink-0 items-center justify-between border-b border-ink/10 px-2 dark:border-zinc-800 md:hidden">
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full text-ink-muted hover:bg-ink/5 hover:text-ink dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
              aria-expanded={mobileNavOpen}
              aria-controls="workspace-sidebar"
              onClick={() => setMobileNavOpen((v) => !v)}
            >
              <MenuIcon open={mobileNavOpen} />
            </button>
            <span className="font-display text-base font-semibold dark:text-zinc-100">Cockpit</span>
            <span className="w-10" aria-hidden />
          </header>

          <div
            id="main"
            role="main"
            className="relative flex min-h-0 flex-1 flex-col bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(0,0,0,0.04),transparent)] dark:bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(255,255,255,0.06),transparent)]"
          >
            <div className="scrollable-container min-h-0 flex-1 overflow-y-auto [scrollbar-gutter:stable]">
              <div
                className={`mx-auto flex min-h-full w-full flex-col px-4 md:px-6 ${
                  isDashboard ? "max-w-screen-md" : "max-w-6xl"
                }`}
              >
                <div className={isDashboard ? "min-h-0 flex-1" : "min-h-0 w-full flex-1 py-6 md:py-8"}>
                  <Outlet />
                </div>
              </div>
            </div>

            {showInvestigationComposer ? (
              <div className="shrink-0 border-t border-ink/10 bg-canvas/95 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/95 md:px-4">
                <form onSubmit={onSubmit} className="mx-auto w-full max-w-screen-md">
                  <div className="rounded-2xl border border-ink/[0.12] bg-canvas shadow-[0_2px_12px_rgba(0,0,0,0.06)] transition-shadow focus-within:border-ink/20 focus-within:shadow-[0_4px_20px_rgba(0,0,0,0.08)] dark:border-zinc-700 dark:bg-zinc-900 dark:shadow-[0_2px_24px_rgba(0,0,0,0.35)] dark:focus-within:border-zinc-600">
                    <label htmlFor="cockpit-composer-input" className="sr-only">
                      Investigation prompt
                    </label>
                    <textarea
                      id="cockpit-composer-input"
                      name="q"
                      rows={2}
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          if (query.trim()) onSubmit(e as unknown as FormEvent);
                        }
                      }}
                      placeholder="Type a query and press Enter or click Send"
                      className="min-h-[3.25rem] w-full resize-none rounded-t-2xl border-0 bg-transparent px-3 py-3 text-[15px] leading-relaxed text-ink placeholder:text-ink-faint focus:outline-none focus:ring-0 dark:text-zinc-100 dark:placeholder:text-zinc-600 sm:px-4 sm:text-base"
                    />
                    {attachments.length > 0 ? (
                      <div
                        className="flex flex-wrap gap-2 border-t border-ink/[0.08] px-3 py-2 dark:border-zinc-700/80"
                        aria-label="Attached files"
                      >
                        {attachments.map((a) => (
                          <span
                            key={a.id}
                            className="inline-flex max-w-full min-w-0 items-center gap-1.5 rounded-full border border-ink/15 bg-ink/[0.04] py-1 pl-2.5 pr-1 text-xs text-ink dark:border-zinc-600 dark:bg-zinc-800/60 dark:text-zinc-200"
                          >
                            <span className="truncate font-medium">{a.name}</span>
                            <span className="shrink-0 tabular-nums text-ink-muted dark:text-zinc-500">
                              {a.size >= 1024 ? `${(a.size / 1024).toFixed(1)} KB` : `${a.size} B`}
                            </span>
                            <button
                              type="button"
                              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-ink-muted hover:bg-ink/10 hover:text-ink dark:hover:bg-zinc-700 dark:hover:text-zinc-200"
                              aria-label={`Remove ${a.name}`}
                              onClick={() => removeAttachment(a.id)}
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    ) : null}
                    <InvestigationComposerToolbar />
                  </div>
                </form>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </>
  );
}

/**
 * Single parent for all workspace routes — sidebar, theme, and (on `/dashboard` only) investigation composer.
 * Child routes render via `<Outlet />`.
 */
export function WorkspaceShellLayout() {
  return (
    <DashboardThemeProvider>
      <WorkspaceProfileProvider>
        <WorkspaceComposerProvider>
          <WorkspaceShellLayoutInner />
        </WorkspaceComposerProvider>
      </WorkspaceProfileProvider>
    </DashboardThemeProvider>
  );
}
