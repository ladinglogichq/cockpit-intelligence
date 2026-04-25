# Hudson Rock Community API (Cockpit adaptation)

**Purpose:** Wire Cockpit agents to Hudson Rock’s **public Community API** for infostealer-related OSINT signals (no API key in the community flow described here).

**Domain:** [context/domain/integrations.md](../context/domain/integrations.md) · **Implementation:** [`services/agents/src/integrations/hudsonRock.ts`](../services/agents/src/integrations/hudsonRock.ts), tool `hudson_rock_lookup` in [`stubTools.ts`](../services/agents/src/tools/stubTools.ts)

## Upstream

- **General:** Hudson Rock describes these endpoints as complimentary community resources; usage is open for researchers (confirm current terms on their site).
- **Rate limit:** 50 requests per 10 seconds (Cockpit applies best-effort in-process throttling; the remote service may still enforce limits).

## Endpoints (base path)

Base: `https://cavalier.hudsonrock.com/api/json/v2/osint-tools/`

| Kind (tool param) | HTTP | Path / query |
| ----------------- | ---- | ------------ |
| `email` | GET | `search-by-email?email=` |
| `username` | GET | `search-by-username?username=` |
| `domain` | GET | `search-by-domain?domain=` |
| `urls_by_domain` | GET | `urls-by-domain?domain=` |
| `ip` | GET | `search-by-ip?ip=` |

## Cockpit behavior

- **Server-side only:** The agent runtime calls these URLs from Node; do not expose as a browser-callable proxy without review.
- **Disable:** `COCKPIT_HUDSON_ROCK_ENABLED=false`
- **Not legal advice:** Outputs are investigative signals, not sanctions or attribution verdicts.

## Retry / errors

Treat non-2xx and parse failures as adapter errors; surface `status` and a short message to the agent. Back off if rate-limited (429 or repeated failures).
