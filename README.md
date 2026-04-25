# Cockpit

Public marketing site for Cockpit — blockchain intelligence for analysts, investigators, and compliance teams.

This repository contains the **Vite + React** frontend (landing, blog, pricing, product shell routes), plus **`services/agents`** (task-packet runner, stub tools) and a minimal **`services/api`** (health + dashboard snapshot JSON).

- **[`PRD.md`](PRD.md)** — product vision, planned APIs, and milestones (including features not shipped in this repo).
- **[`docs/`](docs/)** — technical reference notes for future integrations (agents, data, RPC); optional reading, not needed to run the site.

## Tech stack

- Vite 6, React 19, TypeScript, React Router 7, Tailwind CSS

## Getting started

From the repository root:

```bash
cp frontend/.env.example frontend/.env
npm install --prefix frontend
npm run dev
```

Or `cd frontend` and run `npm install` / `npm run dev` as before.

Dev server: [http://localhost:5173](http://localhost:5173)

Optional API (mock dashboard JSON for future UI wiring): `npm run dev:api` → [http://localhost:8787/health](http://localhost:8787/health), [http://localhost:8787/v1/dashboard](http://localhost:8787/v1/dashboard)

Agents: `npm run task-packet:dry-run` (validates a sample task packet and loads `context/` docs; no LLM).

### Environment (optional)

See `frontend/.env.example` — mainly `VITE_SITE_URL` and optional Supabase vars for client-side features.

## Scripts

| Command | Description |
|--------|-------------|
| `npm run dev` | Dev server with HMR (`frontend`) |
| `npm run dev:api` | Minimal Hono API (`services/api`) |
| `npm run build` | Production build to `frontend/dist` |
| `npm run preview` | Preview production build locally |
| `npm run typecheck:agents` | Typecheck `services/agents` |
| `npm run typecheck:api` | Typecheck `services/api` |
| `npm run task-packet:dry-run` | Validate task packet + load context (no Anthropic call) |

## Notes

- Do not commit real `.env` secrets; use `.env.example` as a template.
- Technical integration notes live under [`docs/`](docs/) (start at [`docs/README.md`](docs/README.md)).
- [`context/index.md`](context/index.md) is the canonical context pack index for agents and contributors.
