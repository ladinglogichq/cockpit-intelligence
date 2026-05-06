import { Link } from "react-router-dom";

type ProductLink = { label: string; href: string } | { label: string; to: string };
type DeveloperLink = { label: string; to: string };

const product: ProductLink[] = [
  { label: "Platform", to: "/platform" },
  { label: "Pricing", to: "/pricing" },
];

const developers: DeveloperLink[] = [
  { label: "Developers", to: "/developers" },
  { label: "Blog", to: "/blog" },
  { label: "Explore data", to: "/explore-data" },
  { label: "Methodology", to: "/methodology/risk-exposure" },
];

export function SiteFooter() {
  return (
    <footer id="docs" className="border-t border-ink/10 bg-canvas pb-12 pt-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <a href="#" className="inline-flex items-center gap-3">
              <span className="font-display text-lg font-semibold italic tracking-tight text-ink">
                Cockpit
              </span>
            </a>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-ink-muted">
              A regulation intelligence platform for discovering, mapping, and verifying data protection obligations with evidence you can defend.
            </p>
            <p className="mt-3 text-xs font-medium tracking-wide text-ink-faint">
              A partnership between{" "}
              <a
                href="https://daemonprotocol.com"
                target="_blank"
                rel="noopener noreferrer"
                className="underline decoration-ink/20 hover:decoration-ink/40"
              >
                Daemon Blockint Technologies
              </a>{" "}
              and{" "}
              <a
                href="https://ladinglogic.com"
                target="_blank"
                rel="noopener noreferrer"
                className="underline decoration-ink/20 hover:decoration-ink/40"
              >
                Lading Logic
              </a>
            </p>
          </div>
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-ink-faint">Product</h3>
            <ul className="mt-4 space-y-3">
              {product.map((l) => (
                <li key={l.label}>
                  {"to" in l ? (
                    <Link to={l.to} className="text-sm text-ink hover:text-ink-muted">
                      {l.label}
                    </Link>
                  ) : (
                    <a href={l.href} className="text-sm text-ink hover:text-ink-muted">
                      {l.label}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-ink-faint">
              Developers
            </h3>
            <ul className="mt-4 space-y-3">
              {developers.map((l) => (
                <li key={l.label}>
                  <Link to={l.to} className="text-sm text-ink hover:text-ink-muted">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-16 flex flex-col gap-4 border-t border-ink/10 pt-8 text-sm text-ink-faint sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Cockpit. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="text-ink-muted hover:text-ink">
              Privacy
            </a>
            <a href="#" className="text-ink-muted hover:text-ink">
              Terms
            </a>
            <a href="#" className="text-ink-muted hover:text-ink">
              Security
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
