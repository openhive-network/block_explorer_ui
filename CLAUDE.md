# Block Explorer UI

## Project Overview

Web-based GUI for exploring Hive blockchain data. Features include:
- Block and transaction browsing
- Account search and witness information
- Balance history and market data
- Witness schedules and governance proposals
- Blockchain operations and communities explorer

**Repository**: GitLab ID 415
**Main Branch**: `develop`
**Production Branch**: `master`

## Tech Stack

- **Framework**: Next.js 15.3.3, React 18.3.1, TypeScript 5.1.6 (strict mode)
- **Styling**: Tailwind CSS 3.4.12, Shadcn UI (Radix UI primitives)
- **Data Fetching**: React Query (TanStack Query) 4.29.25
- **Blockchain**: @hiveio/wax 1.28.4-rc0, @hiveio/hb-healthchecker-component
- **Charts**: ECharts 5.6.0, Recharts 2.9.2
- **Testing**: Playwright 1.47.0 (Chromium, Firefox, WebKit)
- **Runtime**: Node.js 18.20.0+

## Directory Structure

```
pages/              # Next.js page routing
components/         # React components
  ui/               # Shadcn UI base components
  home/             # Home page components
  account/          # Account-related components
  block/            # Block detail components
  Witnesses/        # Witness management
hooks/              # Custom React hooks
  api/              # API data fetching hooks
  common/           # Utility hooks (pagination, etc.)
contexts/           # React Context providers (Theme, Settings, HeadBlock)
services/           # API services (FetchingService, Hive RPC)
utils/              # Utility functions
types/              # TypeScript type definitions
i18n/               # Internationalization (11 languages)
styles/             # CSS variables for themes
tests/playwright/   # E2E test specs
scripts/            # Build and deployment scripts
docker/             # Docker configuration
```

## Development Commands

```bash
# Install
npm install

# Development
npm run dev                    # Start dev server (localhost:5000)

# Build
npm run build                  # Production build
npm run build:standalone       # Standalone build for Docker

# Lint
npm run lint                   # Run ESLint

# E2E Tests
npm run pw:test:local          # All browsers
npm run pw:test:local:chromium # Chromium only
npm run pw:test:local:firefox  # Firefox only
npm run pw:test:local:webkit   # WebKit only
```

**Docker:**
```bash
scripts/build_instance.sh "$(pwd)"
scripts/run_instance.sh --image=<img> --api-endpoint=<api> --port=5000

# Or with Docker Compose
cd docker && docker compose up --detach
```

## Key Files

| File | Purpose |
|------|---------|
| `Config.ts` | API endpoints, pagination sizes, precision settings, refresh intervals |
| `next.config.js` | Next.js config (standalone output, image domains, base path) |
| `tailwind.config.js` | Tailwind config with custom theme colors |
| `tsconfig.json` | TypeScript config (strict mode, path aliases `@/*`) |
| `playwright.config.ts` | E2E test configuration |
| `.gitlab-ci.yml` | CI/CD pipeline definition |
| `services/FetchingService.ts` | API wrapper using Wax library |
| `services/Hive.ts` | Hive node RPC calls |

## Coding Conventions

**Components**: Functional components with `React.FC<Props>`, PascalCase filenames
```typescript
interface ComponentProps {
  prop1: string;
  prop2?: number;
}

const MyComponent: React.FC<ComponentProps> = ({ prop1, prop2 }) => {
  return <div>Content</div>;
};

export default MyComponent;
```

**Hooks**: Custom API hooks use React Query with `useQuery`:
- `queryKey` arrays for cache management
- `keepPreviousData: true` for smooth pagination
- `enabled` for conditional fetching

**Naming**:
- Components: PascalCase
- Hooks: `use` prefix (useBalanceHistory, usePagination)
- Context: PascalCase + "Context" suffix

**Styling**:
- Tailwind CSS utility classes (primary)
- CSS variables for theme colors (`--color-*`)
- Dark mode via `dark:` prefix

**Path Aliases**: `@/*` maps to project root

## CI/CD Notes

**GitLab CI Pipeline Stages:**
1. **build** - Docker images (root `/` and subdirectory `/explorer` variants)
2. **test** - ESLint + Playwright E2E (3 browsers × 5 shards = 15 parallel jobs)
3. **test-report-aggregate** - Merge Playwright reports
4. **deploy** - Manual staging/test deployments
5. **cleanup** - Stop deployed instances

**Runner Tags:**
- `public-runner-docker`: build/lint/test jobs
- `hs-bexplorer`: deployment jobs

**Cache Key**: `block-explorer-ui-cache-1` (caches `.npm/`, `.next/`)

**Protected Tags**: `v*`, `0*`, `1*` push to registry-upload.hive.blog

## Environment Variables

**Build-time:**
```
NEXT_PUBLIC_COMMIT_HASH=<git-short-sha>
NEXT_PUBLIC_BASE_PATH=<subdirectory-path>
```

**Runtime:**
```
PORT=5000
REACT_APP_API_ADDRESS=https://api.hive.blog
REACT_APP_HIVE_BLOG_API_ADDRESS=https://api.hive.blog
```

**Theme Customization**: 26 color variables (REACT_APP_COLOR_*) for light/dark themes

## API Integration

- REST API via `FetchingService.ts` using Wax library
- Hive Node RPC via `services/Hive.ts`
- Default node providers: api.hive.blog, anyx.io, ausbit.dev, etc.
- Error handling through React Query

## Testing

Playwright E2E tests in `/tests/playwright/e2e/`:
- 3 browsers: Chromium, Firefox, WebKit
- 5 shards for parallel CI execution
- Traces retained on failure with screenshots
