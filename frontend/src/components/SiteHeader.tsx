import { useEffect, useId, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useGetStarted } from "../context/GetStartedContext";
import { WORKSPACE_NAV } from "../nav/workspaceNav";
import { GetStartedTrigger } from "./GetStartedTrigger";

type DesktopNavItem = { label: string; to: string };

/** Marketing pages — secondary alongside workspace. */
const marketingNav: DesktopNavItem[] = [
  { label: "Platform", to: "/platform" },
  { label: "Pricing", to: "/pricing" },
  { label: "Developers", to: "/developers" },
  { label: "Blog", to: "/blog" },
];

/** Mobile: large section links (existing pattern). */
const mobileNav: DesktopNavItem[] = [
  { label: "Platform", to: "/platform" },
  { label: "Pricing", to: "/pricing" },
  { label: "Developers", to: "/developers" },
  { label: "Blog", to: "/blog" },
];

export function SiteHeader() {
  const { pathname } = useLocation();
  const { markGetStartedPressed, hasPressedGetStarted } = useGetStarted();
  /** Workspace routes — product shell after Get started (session). */
  const showWorkspaceNav =
    hasPressedGetStarted && WORKSPACE_NAV.some((item) => item.to === pathname);
  const [open, setOpen] = useState(false);
  const navId = useId();

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  function close() {
    setOpen(false);
  }

  const barGap = showWorkspaceNav
    ? "gap-3 sm:gap-4 lg:gap-6"
    : "gap-5 sm:gap-6 lg:gap-8";
  const navItemGap = showWorkspaceNav
    ? "gap-x-2 md:gap-x-2.5 lg:gap-x-3 xl:gap-x-4 2xl:gap-x-5"
    : "gap-x-4 sm:gap-x-5 md:gap-x-6";

  return (
    <header className="sticky top-0 z-50 border-b border-ink/10 bg-canvas/95 backdrop-blur-md">
      <div
        className={`mx-auto flex h-16 max-w-6xl min-w-0 items-center px-4 sm:px-6 ${barGap}`}
      >
        <Link
          to="/"
          className="flex shrink-0 items-center gap-3 rounded-sm outline-none ring-ink ring-offset-2 ring-offset-canvas focus-visible:ring-2"
        >
          <span className="font-display text-lg font-semibold tracking-tight text-ink">
            Cockpit
          </span>
        </Link>

        <nav
          className={`hidden min-w-0 flex-1 items-center justify-center md:flex ${navItemGap}`}
          aria-label="Primary"
        >
          {showWorkspaceNav
            ? WORKSPACE_NAV.map((item) => {
                const active = pathname === item.to;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    aria-current={active ? "page" : undefined}
                    className={`whitespace-nowrap text-sm font-medium transition hover:text-ink ${
                      active ? "text-ink" : "text-ink-muted"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })
            : marketingNav.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className="whitespace-nowrap text-sm font-medium text-ink-muted transition hover:text-ink"
                >
                  {item.label}
                </Link>
              ))}
        </nav>

        <div className="hidden shrink-0 md:block">
          <GetStartedTrigger className="inline-flex items-center justify-center whitespace-nowrap bg-accent px-5 py-2 text-sm font-semibold text-canvas transition-opacity hover:opacity-90" />
        </div>

        <button
          type="button"
          className="inline-flex min-h-[34px] min-w-[60px] items-center justify-center border border-ink/20 px-3 py-2 text-sm font-medium text-ink md:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls={navId}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? "Close" : "Menu"}
        </button>
      </div>

      {open ? (
        <>
          <div
            className="fixed inset-0 top-16 z-40 bg-ink/35 md:hidden"
            aria-hidden
            onClick={close}
          />
          <nav
            id={navId}
            className="fixed inset-x-0 bottom-0 top-16 z-40 flex flex-col overflow-y-auto bg-canvas md:hidden"
            role="dialog"
            aria-modal="true"
            aria-label="Site navigation"
          >
            <div className="flex min-h-[min(100dvh-4rem,900px)] flex-1 flex-col px-4 pb-10 pt-2">
              <ul className="mobile-nav-list flex flex-col">
                {showWorkspaceNav ? (
                  <li className="border-b border-ink/10 py-3">
                    <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted">Workspace</p>
                    <ul className="mt-2 flex flex-col gap-0">
                      {WORKSPACE_NAV.map((item) => {
                        const active = pathname === item.to;
                        return (
                          <li key={item.to}>
                            <Link
                              to={item.to}
                              aria-current={active ? "page" : undefined}
                              className={`flex min-h-11 items-center py-2 text-base font-medium hover:text-ink ${
                                active ? "text-ink" : "text-ink-muted"
                              }`}
                              onClick={close}
                            >
                              {item.label}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </li>
                ) : null}

                {mobileNav.map((item) => (
                  <li key={item.to} className="mobile-nav-item border-b border-ink/10">
                    <Link
                      to={item.to}
                      className="mobile-nav-link flex min-h-[72px] items-center py-4 font-display text-2xl font-medium text-ink sm:text-[1.75rem]"
                      onClick={close}
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}

                <li className="mobile-nav-item border-b border-ink/10">
                  <Link
                    to="/dashboard"
                    className="mobile-nav-link flex min-h-[72px] w-full items-center py-4 text-left font-display text-2xl font-semibold text-ink sm:text-[1.75rem]"
                    onClick={() => {
                      markGetStartedPressed();
                      close();
                    }}
                  >
                    Get started
                  </Link>
                </li>
              </ul>

              <div className="mobile-nav-meta mt-auto flex flex-col gap-6 border-t border-ink/10 pt-10">
                <a
                  href="mailto:hello@cockpit.io"
                  className="text-sm font-medium text-ink-muted hover:text-ink"
                  onClick={close}
                >
                  hello@cockpit.io
                </a>
                <p className="text-sm leading-relaxed text-ink-faint">
                  © {new Date().getFullYear()} Cockpit. Regulation intelligence for teams that need
                  defensible outcomes.
                </p>
              </div>
            </div>
          </nav>
        </>
      ) : null}
    </header>
  );
}
