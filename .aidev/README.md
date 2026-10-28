# block_explorer_ui under AIDEV

AIDEV verifies changes through the slots in `project.yaml`, integrates them into
`aidev/integration`, and people merge that into `develop` through merge requests (as in
hive/denser and hive/healthchecker-component). GitLab CI doesn't run for AIDEV branches;
see `.gitlab-ci.yml` `workflow:`.

## Suites

`.aidev/run-checks.sh <suite> <step>...` writes `test-results/aidev-<suite>/junit.xml`
(one case per step) and, for `unit`, `unit-junit.xml` (one case per Jest test).

| Step | What |
|---|---|
| `lint` | `eslint .` (CI's lint job) |
| `typecheck` | `next typegen` (writes `next-env.d.ts`), then `tsc --noEmit` |
| `unit` | Jest (`test:unit`) |
| `build` | `next build`. The commit hash comes from `AIDEV_COMMIT_SHORT_SHA` or git, not `helpers/versions.js` |

| Slot | Steps |
|---|---|
| quick | lint, typecheck, unit |
| full, canary | lint, typecheck, unit, build |
| static | lint, typecheck |
| baseline, coverage | unit |
| system | build |

The Playwright e2e suite (`tests/playwright`, live API) is not bound yet.

## The test runtime image (`runtime/`)

The suites run in a container with `--network none` and your uid. It is built on ccc's
`node-test-tools:develop`, which supplies Node and pnpm, and adds a pnpm store from
`pnpm fetch`. `pnpm-deps.sh` installs `node_modules` offline from it.

When `pnpm-lock.yaml`, `.npmrc` or `runtime/Dockerfile` change, rebuild (on the digest
`node-test-tools:develop` names then) and re-pin **in the same commit**:

```bash
.aidev/runtime/build.sh --push   # put the printed repo@sha256:<digest> in project.yaml environment.image
```
