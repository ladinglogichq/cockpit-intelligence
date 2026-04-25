> **Scope:** Reference for a **server-side** Chainalysis integration. This repo ships the **marketing frontend** only (`frontend/`). Implement the API client in your **API service** (not in the Vite bundle); paths below are illustrative.

# Chainalysis public Sanctions API (Cockpit)

## Cockpit service mapping

| Intended location | Path (target monorepo; see [architecture/target-repo-layout.md](./architecture/target-repo-layout.md)) |
| ----------------- | ---------------------------------------------------------------------------------------------------------- |
| Service | `services/intel/` — screening / policy-adjacent enrichment |
| Adapter (illustrative) | `services/intel/src/adapters/chainalysisSanctions.ts` (or under `services/gateway/` if only API routes wrap the client) |

**Domain:** [context/domain/integrations.md](../context/domain/integrations.md) · **Retry / errors:** [below](#cockpit-integration-retry-errors-timeouts)

## Where the full write-up lives

- **Official product / signup / current spec:** [public.chainalysis.com](https://public.chainalysis.com) (Sanctions API signup and documentation)  
- Keep a **local markdown note** in your API project (e.g. `docs/Chainalysis.md`) with endpoint details and terms if you need offline reference—do not commit API keys.

## How to call it (server-side)

The API does **not** support browser CORS; keys must stay on the server.

- **Env:** `CHAINALYSIS_API_KEY` in your API service environment (e.g. `.env`, gitignored).
- Implement a small helper module (e.g. `integrations/chainalysis/sanctionsApi.ts`) that wraps `GET https://public.chainalysis.com/api/v1/address/{address}` per Chainalysis docs.

Example:

```ts
import { checkChainalysisSanctionsAddress } from "./integrations/chainalysis/sanctionsApi.js";

const { identifications } = await checkChainalysisSanctionsAddress("0x...");
// Empty array => no sanctions listing returned for that address in this API response.
```

## Scope reminder

The public API is an **information** tool (SDN-linked crypto addresses per Chainalysis). It is **not** a substitute for legal advice, your own sanctions policy, or official OFAC / jurisdiction-specific determinations. Paid Chainalysis products may expose additional categories and clustering beyond this public API.

## Cockpit integration points

- **Domain:** [`context/domain/entities.md`](../context/domain/entities.md), [`context/domain/integrations.md`](../context/domain/integrations.md); normalization patterns: [`context/domain/normalization-examples.md`](../context/domain/normalization-examples.md) (Chainalysis section).
- **Where to implement:** Server-only helper (e.g. `integrations/chainalysis/sanctionsApi.ts` in your API service); never call from the Vite bundle.
- **Index:** [`context/index.md`](../context/index.md) — recommended agent load order.

## Cockpit integration: retry, errors, timeouts

- **HTTP:** Treat **5xx** and network blips with **limited retries** (backoff + jitter); **do not** retry indefinitely on **4xx** except documented idempotent cases.
- **429:** If returned, backoff; reduce concurrency for bulk screening jobs.
- **Timeouts:** Short **read** timeout for interactive checks; queue **batch** screens with larger timeouts and idempotency keys.
- **Mapping:** Map `identifications` into internal tags / triage fields per policy—never treat API output as a sole legal determination.

## Related reading (not Chainalysis)

Broader investigation context (Arkham research, public pages):

- [A Guide to Crypto Crime](https://info.arkm.com/research/a-guide-to-crypto-crime)
- [Online Sleuth: How to Be a Blockchain and Crypto Investigator](https://info.arkm.com/research/online-sleuth-how-to-be-a-blockchain-and-crypto-investigator)

Support (from vendor docs): `sanctions-api-support@chainalysis.com`
