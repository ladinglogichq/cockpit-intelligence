import { useEffect, useId, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useGetStarted } from "../context/GetStartedContext";
import { WORKSPACE_NAV } from "../nav/workspaceNav";
import { GetStartedTrigger } from "./GetStartedTrigger";

/** Learn dropdown — Documentation lives here to keep the desktop bar from overflowing mid-width viewports. */
const learnLinks = [
  { label: "Documentation", to: { pathname: "/", hash: "docs" } as const },
  { label: "Blog", href: "/blog" as const },
] as const;

/** In-app routes (no hash) — use React Router to avoid full reloads. */
function isSpaInternalPath(href: string) {
  return href.startsWith("/") && !href.includes("#");
}

const productItems = [
  { id: "sim", label: "Sim", href: "https://sim.io" as const },
  { id: "bellingcat", label: "Bellingcat", href: "https://bellingcat.com" as const },
] as const;

type DesktopNavItem = { label: string; to: string } | { label: string; href: string };

/** Marketing pages — secondary alongside workspace. */
const marketingNav: DesktopNavItem[] = [
  { label: "Platform", to: "/platform" },
  { label: "Pricing", to: "/pricing" },
];

function ChevronDown({ open }: { open: boolean }) {
  return (
    <svg
      className={`h-4 w-4 shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
      width={16}
      height={16}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden
    >
      <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Mobile: large section links (existing pattern). */
const mobileNav = [
  { label: "Contact", href: "mailto:hello@cockpit.io" },
  { label: "Get started", href: "#get-started" },
];

export function SiteHeader() {
  const { pathname } = useLocation();
  const { markGetStartedPressed, hasPressedGetStarted } = useGetStarted();
  /** Workspace routes — product shell after Get started (session). */
  const showWorkspaceNav =
    hasPressedGetStarted && WORKSPACE_NAV.some((item) => item.to === pathname);
  const [open, setOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState<"product" | "learn" | null>(null);
  const navId = useId();
  const productMenuId = useId();
  const learnMenuId = useId();
  const desktopNavRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    if (!openMenu) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenMenu(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openMenu]);

  useEffect(() => {
    if (!openMenu) return;
    const onPointerDown = (e: MouseEvent) => {
      if (desktopNavRef.current && !desktopNavRef.current.contains(e.target as Node)) {
        setOpenMenu(null);
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [openMenu]);

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
          ref={desktopNavRef}
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
            : null}

          <div className="relative">
            <button
              type="button"
              className="flex shrink-0 items-center gap-1 whitespace-nowrap text-sm font-medium text-ink-muted transition hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-canvas"
              aria-expanded={openMenu === "product"}
              aria-haspopup="true"
              aria-controls={productMenuId}
              id={`${productMenuId}-trigger`}
              onClick={() => setOpenMenu((m) => (m === "product" ? null : "product"))}
            >
              Ecosystem
              <ChevronDown open={openMenu === "product"} />
            </button>
            {openMenu === "product" ? (
              <ul
                id={productMenuId}
                role="menu"
                aria-labelledby={`${productMenuId}-trigger`}
                className="absolute left-0 top-full z-50 mt-1 min-w-[260px] rounded-md border border-ink/10 bg-canvas py-2 shadow-lg"
              >
                {productItems.map((item) => (
                    <li key={item.id} role="none">
                      <a
                        role="menuitem"
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block px-4 py-2.5 text-sm text-ink-muted transition hover:bg-ink/5 hover:text-ink"
                        onClick={() => setOpenMenu(null)}
                      >
                        {item.label}
                      </a>
                    </li>
                  )
                )}
              </ul>
            ) : null}
          </div>

          {marketingNav.map((item) =>
            "to" in item ? (
              <Link
                key={item.to}
                to={item.to}
                className="whitespace-nowrap text-sm font-medium text-ink-muted transition hover:text-ink"
              >
                {item.label}
              </Link>
            ) : (
              <a
                key={item.href}
                href={item.href}
                className="whitespace-nowrap text-sm font-medium text-ink-muted transition hover:text-ink"
              >
                {item.label}
              </a>
            ),
          )}

          <div className="relative">
            <button
              type="button"
              className="flex shrink-0 items-center gap-1 whitespace-nowrap text-sm font-medium text-ink-muted transition hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-canvas"
              aria-expanded={openMenu === "learn"}
              aria-haspopup="true"
              aria-controls={learnMenuId}
              id={`${learnMenuId}-trigger`}
              onClick={() => setOpenMenu((m) => (m === "learn" ? null : "learn"))}
            >
              Learn
              <ChevronDown open={openMenu === "learn"} />
            </button>
            {openMenu === "learn" ? (
              <ul
                id={learnMenuId}
                role="menu"
                aria-labelledby={`${learnMenuId}-trigger`}
                className="absolute left-0 top-full z-50 mt-1 min-w-[280px] rounded-md border border-ink/10 bg-canvas py-2 shadow-lg"
              >
                {learnLinks.map((item) => (
                  <li key={item.label} role="none">
                    {"to" in item ? (
                      <Link
                        role="menuitem"
                        to={item.to}
                        className="block px-4 py-2.5 text-sm text-ink-muted transition hover:bg-ink/5 hover:text-ink"
                        onClick={() => setOpenMenu(null)}
                      >
                        {item.label}
                      </Link>
                    ) : isSpaInternalPath(item.href) ? (
                      <Link
                        role="menuitem"
                        to={item.href}
                        className="block px-4 py-2.5 text-sm text-ink-muted transition hover:bg-ink/5 hover:text-ink"
                        onClick={() => setOpenMenu(null)}
                      >
                        {item.label}
                      </Link>
                    ) : (
                      <a
                        role="menuitem"
                        href={item.href}
                        className="block px-4 py-2.5 text-sm text-ink-muted transition hover:bg-ink/5 hover:text-ink"
                        onClick={() => setOpenMenu(null)}
                      >
                        {item.label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            ) : null}
          </div>

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

                <li className="border-b border-ink/10 py-3">
                  <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted">Ecosystem</p>
                  <ul className="mt-2 flex flex-col gap-0">
                    {productItems.map((item) => (
                        <li key={item.id}>
                          <a
                            href={item.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex min-h-11 items-center py-2 text-base font-medium text-ink-muted hover:text-ink"
                            onClick={close}
                          >
                            {item.label}
                          </a>
                        </li>
                      )
                    )}
                  </ul>
                </li>

                <li className="mobile-nav-item border-b border-ink/10">
                  <Link
                    to="/platform"
                    className="mobile-nav-link flex min-h-[72px] items-center py-4 font-display text-2xl font-medium text-ink sm:text-[1.75rem]"
                    onClick={close}
                  >
                    Platform
                  </Link>
                </li>
                <li className="mobile-nav-item border-b border-ink/10">
                  <Link
                    to="/pricing"
                    className="mobile-nav-link flex min-h-[72px] items-center py-4 font-display text-2xl font-medium text-ink sm:text-[1.75rem]"
                    onClick={close}
                  >
                    Pricing
                  </Link>
                </li>

                <li className="border-b border-ink/10 py-3">
                  <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted">Learn</p>
                  <ul className="mt-2 flex flex-col gap-0">
                    {learnLinks.map((item) => (
                      <li key={item.label}>
                        {"to" in item ? (
                          <Link
                            to={item.to}
                            className="flex min-h-11 items-center py-2 text-base font-medium text-ink-muted hover:text-ink"
                            onClick={close}
                          >
                            {item.label}
                          </Link>
                        ) : isSpaInternalPath(item.href) ? (
                          <Link
                            to={item.href}
                            className="flex min-h-11 items-center py-2 text-base font-medium text-ink-muted hover:text-ink"
                            onClick={close}
                          >
                            {item.label}
                          </Link>
                        ) : (
                          <a
                            href={item.href}
                            className="flex min-h-11 items-center py-2 text-base font-medium text-ink-muted hover:text-ink"
                            onClick={close}
                          >
                            {item.label}
                          </a>
                        )}
                      </li>
                    ))}
                  </ul>
                </li>

                {mobileNav.map((item) => {
                  const isCta = item.label === "Get started";
                  if (isCta) {
                    return (
                      <li key={item.label} className="mobile-nav-item border-b border-ink/10">
                        <Link
                          to="/dashboard"
                          className="mobile-nav-link flex min-h-[72px] w-full items-center py-4 text-left font-display text-2xl font-semibold text-ink sm:text-[1.75rem]"
                          onClick={() => {
                            markGetStartedPressed();
                            close();
                          }}
                        >
                          {item.label}
                        </Link>
                      </li>
                    );
                  }
                  return (
                    <li key={item.label} className="mobile-nav-item border-b border-ink/10">
                      <a
                        href={item.href}
                        className="mobile-nav-link flex min-h-[72px] items-center py-4 font-display text-2xl font-medium text-ink sm:text-[1.75rem]"
                        onClick={close}
                      >
                        {item.label}
                      </a>
                    </li>
                  );
                })}
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
