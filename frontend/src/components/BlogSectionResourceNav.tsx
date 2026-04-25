import { Link } from "react-router-dom";
import { BLOG_RESOURCE_EXTERNAL, BLOG_RESOURCE_ROUTES } from "./blogSectionResourceLinks";

const pillBase =
  "inline-flex min-h-[44px] max-w-full items-center justify-center rounded-full border px-4 py-2.5 text-sm font-medium transition-[color,background-color,border-color,box-shadow] motion-safe:duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-canvas motion-reduce:transition-none";

const pillDefault = `${pillBase} border-ink/15 bg-canvas text-ink hover:border-ink/25 hover:bg-canvas-subtle/80`;

/** Resource pills under the landing blog strip; email signup is in the Newsletter section below. */
export function BlogSectionResourceNav() {
  return (
    <nav className="mt-10 border-t border-ink/10 pt-8" aria-label="Blog resources">
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-muted">Resources</p>
        <ul className="mt-4 flex list-none flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:gap-2.5">
          {BLOG_RESOURCE_ROUTES.map((item) => (
            <li key={item.to} className="min-w-0">
              <Link to={item.to} className={`${pillDefault} min-w-0 shrink`}>
                <span className="text-balance">{item.label}</span>
              </Link>
            </li>
          ))}
          {BLOG_RESOURCE_EXTERNAL.map((item) => (
            <li key={item.href} className="min-w-0">
              <a
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`${pillDefault} min-w-0 shrink`}
              >
                <span className="text-balance">{item.label}</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
