#!/usr/bin/env bash
# The checks AIDEV's verification slots run (.aidev/project.yaml), as one junit
# report per suite: each named step is a test case, its log the failure body.
#
#   .aidev/run-checks.sh <suite> <step>...     steps: lint typecheck unit build
#
#   lint       `next lint` (package.json `lint`, CI's lint job)
#   typecheck  tsc --noEmit
#   unit       Jest (package.json `test:unit`), every test its own junit case in
#              $out/unit-junit.xml (converted from Jest's --json report)
#   build      `next build` of the app. package.json `build` first runs
#              helpers/versions.js, which asks git for the commit; a workflow's
#              container has no usable .git, so the hash comes from the
#              environment (AIDEV_COMMIT_SHORT_SHA when set) instead.
set -uo pipefail
cd "$(dirname "$0")/.."

suite="${1:?usage: $0 <suite> <step>...}"; shift
out="test-results/aidev-$suite"
rm -rf "$out"; mkdir -p "$out"
cases="$out/cases.tsv"; : > "$cases"

# shellcheck source=pnpm-deps.sh
if ! source .aidev/pnpm-deps.sh; then
    printf 'case\tinstall\tfail\t0\tpnpm install --offline failed\n' >> "$cases"
    source .aidev/junit-helpers.sh; junit_write_cases "$out/junit.xml" "$suite" "$cases"
    exit 1
fi
source .aidev/junit-helpers.sh

status=0
step() {
    local name="$1"; shift
    local log="$out/$name.log" t0=$SECONDS rc=0
    echo "== $name" >&2
    "$@" > "$log" 2>&1 < /dev/null || rc=$?
    if [ "$rc" -eq 0 ]; then
        printf 'case\t%s\tpass\t%s\t\n' "$name" "$((SECONDS - t0))" >> "$cases"
    else
        status=1; tail -40 "$log" >&2
        printf 'case\t%s\tfail\t%s\texit %s\t%s\n' "$name" "$((SECONDS - t0))" "$rc" "$log" >> "$cases"
    fi
}

next_build() {
    NEXT_PUBLIC_COMMIT_HASH="${AIDEV_COMMIT_SHORT_SHA:-$(git rev-parse --short HEAD 2>/dev/null || echo unknown)}" \
        pnpm exec next build
}

# Jest's JSON report -> junit, one case per test (no reporter dependency needed).
jest_junit() {
    JSON="$1" JUNIT="$2" node -e '
const fs = require("fs");
const esc = (s) => String(s).replace(/[<>&"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "\"": "&quot;" })[c]);
const r = JSON.parse(fs.readFileSync(process.env.JSON, "utf8"));
const suites = r.testResults.map((f) => {
  const file = f.name.replace(process.cwd() + "/", "");
  const cases = f.assertionResults.map((a) => {
    const open = `<testcase classname="${esc(file)}" name="${esc(a.fullName)}" time="${(a.duration || 0) / 1000}">`;
    if (a.status === "failed") return `${open}<failure message="${esc((a.failureMessages[0] || "").split("\n")[0])}">${esc(a.failureMessages.join("\n"))}</failure></testcase>`;
    if (a.status === "pending" || a.status === "skipped" || a.status === "todo") return `${open}<skipped/></testcase>`;
    return `${open}</testcase>`;
  });
  if (!f.assertionResults.length && f.failureMessage)
    cases.push(`<testcase classname="${esc(file)}" name="(suite failed to run)"><failure message="suite failed">${esc(f.failureMessage)}</failure></testcase>`);
  const fails = cases.filter((c) => c.includes("<failure")).length;
  return `<testsuite name="${esc(file)}" tests="${cases.length}" failures="${fails}">\n${cases.join("\n")}\n</testsuite>`;
});
fs.writeFileSync(process.env.JUNIT, `<?xml version="1.0" encoding="UTF-8"?>\n<testsuites>\n${suites.join("\n")}\n</testsuites>\n`);'
}

unit_tests() {
    local rc=0
    pnpm exec jest --ci --json --outputFile="$out/jest.json" || rc=$?
    [ -s "$out/jest.json" ] && jest_junit "$out/jest.json" "$out/unit-junit.xml"
    return "$rc"
}

for s in "$@"; do
    case "$s" in
        lint) step lint pnpm exec next lint ;;
        typecheck) step typecheck pnpm exec tsc --noEmit ;;
        unit) step unit unit_tests ;;
        build) step build next_build ;;
        *) echo "unknown step: $s" >&2; exit 2 ;;
    esac
done
junit_write_cases "$out/junit.xml" "$suite" "$cases"
exit "$status"
