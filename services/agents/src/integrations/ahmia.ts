/**
 * Ahmia.fi — public Tor hidden-service index (https://ahmia.fi/).
 * Full-text search UI is JS-heavy; the published /onions/ directory is fetchable and filterable by URL substring.
 * Respect Ahmia terms of use; rate-limit via cache; do not ship raw dumps to the browser.
 */

const ONIONS_URL = "https://ahmia.fi/onions/";
const SEARCH_URL = "https://ahmia.fi/search/";
const USER_AGENT = "Cockpit-Agents/1.0 (+https://cockpitintel.com)";
const CACHE_MS = 60 * 60 * 1000;
const FETCH_TIMEOUT_MS = 45_000;

type OnionCache = { text: string; fetchedAt: number };
let onionCache: OnionCache | null = null;

function onionUrlRegex(): RegExp {
  return /https?:\/\/[a-z2-7]{16,56}\.onion(?:\/[^\s<]*)?/gi;
}

export type AhmiaSearchResult = {
  source: "ahmia.fi";
  /** Open in Tor Browser for ranked full-text results (Cockpit does not execute Ahmia’s client-side search). */
  searchUrl: string;
  note: string;
  directoryMatches: { url: string }[];
};

export async function searchAhmiaDirectory(query: string, limit: number): Promise<AhmiaSearchResult> {
  const q = query.trim().toLowerCase();
  const searchUrl = `${SEARCH_URL}?q=${encodeURIComponent(query)}`;

  if (process.env.COCKPIT_AHMIA_ENABLED === "false") {
    return {
      source: "ahmia.fi",
      searchUrl,
      note: "Ahmia integration disabled (COCKPIT_AHMIA_ENABLED=false).",
      directoryMatches: [],
    };
  }

  const now = Date.now();
  if (!onionCache || now - onionCache.fetchedAt > CACHE_MS) {
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    try {
      const res = await fetch(ONIONS_URL, {
        headers: { "User-Agent": USER_AGENT, Accept: "text/html,*/*" },
        signal: controller.signal,
      });
      clearTimeout(t);
      if (!res.ok) {
        return {
          source: "ahmia.fi",
          searchUrl,
          note: `Could not refresh onion directory (HTTP ${res.status}). Use searchUrl in Tor Browser.`,
          directoryMatches: [],
        };
      }
      const text = await res.text();
      onionCache = { text, fetchedAt: now };
    } catch {
      clearTimeout(t);
      return {
        source: "ahmia.fi",
        searchUrl,
        note: "Failed to fetch Ahmia onion directory (timeout or network). Use searchUrl in Tor Browser.",
        directoryMatches: [],
      };
    }
  }

  const text = onionCache!.text;
  const matches: { url: string }[] = [];
  const seen = new Set<string>();

  for (const m of text.matchAll(onionUrlRegex())) {
    const url = m[0].replace(/\/+$/, "") || m[0];
    if (seen.has(url)) continue;
    if (q.length >= 2 && !url.toLowerCase().includes(q)) continue;
    seen.add(url);
    matches.push({ url });
    if (matches.length >= limit) break;
  }

  return {
    source: "ahmia.fi",
    searchUrl,
    note:
      "Directory listing is URL-only substring match on Ahmia’s public /onions/ export. For ranked full-text search, open searchUrl in Tor Browser. Follow Ahmia ToS; do not scrape aggressively.",
    directoryMatches: matches,
  };
}
