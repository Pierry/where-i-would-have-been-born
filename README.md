# Where I Would Have Been Born

A modern React/Vite experience that lets you roll weighted population dice to see where you *might* have been born. It is intentionally playful but backed by reproducible UN population data and geographic metadata sourced via GeoNames and REST Countries.

## Project layout

```
├── AGENTS.md                # contributor guide
├── docs/                    # PRD, data plans, dictionaries
├── scripts/                 # data ingestion helpers
├── data/                    # raw + processed intermediate files
├── web/                     # Vite + React front-end
└── Makefile                 # common developer tasks
```

Key documents:
- [`docs/PRD.md`](docs/PRD.md): product requirements and release plan.
- [`docs/data-sourcing-plan.md`](docs/data-sourcing-plan.md): ingestion workflow for population + geography data.
- [`docs/data-dictionary.md`](docs/data-dictionary.md): schema served to the client.

## Getting started

```bash
make install       # installs npm dependencies inside web/
make dev           # runs Vite dev server (http://localhost:5173)
make build         # type-check + production build
make lint          # eslint across the repo
make test          # Vitest unit/integration suite
make test-e2e      # Playwright E2E run (launches Vite dev server)
make format        # Prettier formatting inside web/src
make refresh-data  # re-download population + flag data and regenerate country stats
```

Run `INSECURE_SSL=1 make refresh-data` if you are behind a TLS-intercepting proxy. The processed JSON is copied into `web/public/data/country-stats.json`, which the front-end fetches at runtime.

## Testing
- `make test` executes Vitest with jsdom + Testing Library.
- `make test-e2e` runs Playwright (chromium) against a temporary Vite dev server.

## Tech stack
- React 19 + TypeScript + Vite
- Custom hooks for population data + persistent history
- Modern flat UI with Virgil headlines, Inter body, and animated dice CTA
- LocalStorage-backed persistence with a pathway to IndexedDB
- Data scripts written in Python for portability plus Playwright/Vitest for regression safety
