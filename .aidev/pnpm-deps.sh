# Sourced by the .aidev suite scripts: make node_modules match pnpm-lock.yaml,
# offline, from the image's store. A marker records the lockfile and Node it was
# installed for; it is written only after an install that succeeded, and an
# install whose tools don't resolve is redone.
lock_id="$(sha256sum pnpm-lock.yaml | cut -d' ' -f1) $(node --version)"
marker=node_modules/.aidev-pnpm-lock
if [ "$(cat "$marker" 2>/dev/null)" != "$lock_id" ] || [ ! -e node_modules/.bin/next ] || [ ! -e node_modules/.bin/tsc ]; then
    echo "node_modules is not current for pnpm-lock.yaml: pnpm install --offline" >&2
    pnpm install --offline --frozen-lockfile < /dev/null || return 1
    [ -e node_modules/.bin/next ] && [ -e node_modules/.bin/tsc ] || { echo "pnpm install left no next/tsc" >&2; return 1; }
    printf '%s\n' "$lock_id" > "$marker.tmp" && mv "$marker.tmp" "$marker"
fi
