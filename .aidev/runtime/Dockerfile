# The image AIDEV runs this project's suites in (`environment.image` in
# .aidev/project.yaml), built on ccc's node-test-tools: node and pnpm come from
# that image, so nothing here pins a tool version. Suites run with `--network none`,
# so the image carries a pnpm store filled from pnpm-lock.yaml. Build and pin it
# with .aidev/runtime/build.sh; see .aidev/README.md.
ARG BASE_IMAGE
FROM ${BASE_IMAGE}

# pnpm runs as the base ships it: with no network it must not try to fetch the
# `packageManager` version when ccc's pnpm has moved past it.
ENV HOME=/tmp \
    npm_config_store_dir=/opt/pnpm-store \
    npm_config_manage_package_manager_versions=false \
    NEXT_TELEMETRY_DISABLED=1 \
    HUSKY=0 \
    DO_NOT_TRACK=1

COPY package.json pnpm-lock.yaml .npmrc /tmp/pnpm-fetch/
RUN cd /tmp/pnpm-fetch \
    && pnpm fetch \
    && cd / && rm -rf /tmp/pnpm-fetch \
    && chmod -R a+rwX /opt/pnpm-store
