# AGENTS.md — Block Explorer UI

## Commands

```bash
npm run dev                    # Dev server on :5000 (NOT :3000)
npm run build                  # Production build
npm run build:standalone       # Standalone build for Docker
npm run lint                   # ESLint via next lint
npm run pw:test:local          # Playwright E2E (all browsers, headless)
npm run pw:test:local:chromium # Single browser, --headed
```

No `npm test` — only Playwright E2E tests exist.

## Critical Gotchas

- **Port is 5000**, not the Next.js default 3000
- **Dev/build runs `helpers/versions.js` first** — writes `NEXT_PUBLIC_COMMIT_HASH` to `.env.local`. If git fails, the command fails.
- **`react-env` wraps dev/start** — `@beam-australia/react-env` injects `REACT_APP_*` env vars into the browser as `window.__ENV`. Do not use `process.env` for runtime config in components; use `Config.ts` which reads via `env()`.
- **Package manager field says `pnpm` but CI/scripts use `npm`** — stick with `npm install` / `npm ci`.
- **Path alias `@/*` maps to project root** (no `src/` directory).

## Architecture

- **Pages router** (Next.js 15), not App Router. Routes live in `pages/`.
- **`Config.ts`** at root is the single source of truth for API endpoints, pagination sizes, refresh intervals, and precision settings.
- **API layer**: `services/FetchingService.ts` (REST via @hiveio/wax) and `services/Hive.ts` (Hive node RPC).
- **Data fetching**: React Query v4 (`@tanstack/react-query`). Hooks in `hooks/api/`. Use `queryKey` arrays, `keepPreviousData: true` for pagination.
- **Formatters**: All blockchain asset formatting goes through Wax library — do not format amounts manually.

## Git Workflow

- Branch naming: `USER_NAME/BRANCH_NAME`
- PR target: `develop` (staging)
- `master` = production
- Rebase outdated branches, don't merge

## Docker

- Two image variants: root `/` and subdirectory `/explorer` (set via `NEXT_PUBLIC_BASE_PATH` at build)
- Build: `scripts/build_instance.sh "$(pwd)"`
- Run: `scripts/run_instance.sh --image=<img> --api-endpoint=<api> --port=5000`
- Dockerfile uses multi-stage build with standalone output

## Testing

- Playwright E2E only, tests in `tests/playwright/e2e/`
- Local config: `playwright.local5000.config.ts` (baseURL `localhost:5000`)
- CI runs 3 browsers × 5 shards with `--update-snapshots`
- Tests require a running app — no webServer auto-start in local config
- `trace: 'retain-on-failure'` is enabled

## Style Conventions

- Components: `React.FC<Props>`, PascalCase filenames
- Hooks: `use` prefix, in `hooks/api/` or `hooks/common/`
- TypeScript strict mode + `forceConsistentCasingInFileNames`
- Styling: Tailwind utility classes + CSS variables (`--color-*`)
- No comments unless asked
