/**
 * Hudson Rock Community API — public OSINT endpoints (infostealer-derived signals).
 * Docs: community API overview; rate limit 50 requests / 10 seconds.
 * Base: https://cavalier.hudsonrock.com/api/json/v2/osint-tools/
 *
 * Use for investigative context only; results are not legal verdicts. Respect Hudson Rock terms and community norms.
 */

const BASE = "https://cavalier.hudsonrock.com/api/json/v2/osint-tools/";
const USER_AGENT = "Cockpit-Agents/1.0 (+https://cockpitintel.com)";
const FETCH_TIMEOUT_MS = 30_000;

/** 50 requests per 10 seconds — sliding window (best-effort, in-process). */
const WINDOW_MS = 10_000;
const MAX_REQ_PER_WINDOW = 50;
const requestTimestamps: number[] = [];

async function respectRateLimit(): Promise<void> {
  for (;;) {
    const now = Date.now();
    while (requestTimestamps.length > 0 && now - requestTimestamps[0]! > WINDOW_MS) {
      requestTimestamps.shift();
    }
    if (requestTimestamps.length < MAX_REQ_PER_WINDOW) {
      requestTimestamps.push(now);
      return;
    }
    const oldest = requestTimestamps[0]!;
    const wait = WINDOW_MS - (now - oldest) + 25;
    await new Promise((r) => setTimeout(r, Math.min(Math.max(wait, 50), WINDOW_MS)));
  }
}

export type HudsonRockKind = "email" | "username" | "domain" | "urls_by_domain" | "ip";

export type HudsonRockResult = {
  source: "hudsonrock.com";
  kind: HudsonRockKind;
  requestUrl: string;
  ok: boolean;
  status?: number;
  /** Parsed JSON when response is JSON; otherwise short text snippet */
  data?: unknown;
  error?: string;
  note?: string;
};

function normalizeDomain(input: string): string {
  let s = input.trim();
  try {
    if (s.includes("://")) {
      const u = new URL(s.startsWith("http") ? s : `https://${s}`);
      s = u.hostname;
    }
  } catch {
    /* use as-is */
  }
  return s.replace(/^www\./, "");
}

function sanitizeValue(kind: HudsonRockKind, value: string): string {
  const v = value.trim();
  switch (kind) {
    case "domain":
    case "urls_by_domain":
      return normalizeDomain(v);
    default:
      return v;
  }
}

function buildUrl(kind: HudsonRockKind, value: string): string {
  const enc = encodeURIComponent(value);
  switch (kind) {
    case "email":
      return `${BASE}search-by-email?email=${enc}`;
    case "username":
      return `${BASE}search-by-username?username=${enc}`;
    case "domain":
      return `${BASE}search-by-domain?domain=${enc}`;
    case "urls_by_domain":
      return `${BASE}urls-by-domain?domain=${enc}`;
    case "ip":
      return `${BASE}search-by-ip?ip=${enc}`;
  }
}

export async function queryHudsonRock(kind: HudsonRockKind, rawValue: string): Promise<HudsonRockResult> {
  const value = sanitizeValue(kind, rawValue);
  if (!value) {
    return {
      source: "hudsonrock.com",
      kind,
      requestUrl: "",
      ok: false,
      error: "Empty value after sanitization.",
    };
  }

  if (process.env.COCKPIT_HUDSON_ROCK_ENABLED === "false") {
    return {
      source: "hudsonrock.com",
      kind,
      requestUrl: buildUrl(kind, value),
      ok: false,
      note: "Hudson Rock integration disabled (COCKPIT_HUDSON_ROCK_ENABLED=false).",
    };
  }

  const requestUrl = buildUrl(kind, value);

  await respectRateLimit();

  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const res = await fetch(requestUrl, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "User-Agent": USER_AGENT,
      },
      signal: controller.signal,
    });

    const status = res.status;
    const text = await res.text();

    let data: unknown;
    try {
      data = JSON.parse(text) as unknown;
    } catch {
      data = { rawText: text.slice(0, 8000) };
    }

    return {
      source: "hudsonrock.com",
      kind,
      requestUrl,
      ok: res.ok,
      status,
      data,
      note: res.ok
        ? undefined
        : `HTTP ${status}. Hudson Rock may return errors for invalid input or rate limits.`,
    };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return {
      source: "hudsonrock.com",
      kind,
      requestUrl,
      ok: false,
      error: msg,
    };
  } finally {
    clearTimeout(t);
  }
}
