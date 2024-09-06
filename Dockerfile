# syntax=docker/dockerfile:1.5
# Build with: docker buildx bake --progress=plain local-build

FROM node:18.20-alpine3.20 AS base

FROM base AS deps

RUN apk add --no-cache libc6-compat
WORKDIR /home/node/app
RUN chown node /home/node/app
USER node
RUN mkdir ~/.npm-global
ENV NPM_CONFIG_PREFIX=/home/node/.npm-global
ENV PATH=$PATH:/home/node/.npm-global/bin
RUN <<-EOF
    npm install -g @beam-australia/react-env@3.1.1
    npm install -g sharp@0.32.4
EOF
COPY --chown=node package.json package-lock.json* ./
RUN npm ci

FROM base AS builder

WORKDIR /home/node/app
RUN <<-EOF
    apk add --no-cache git
    chown node /home/node/app
EOF
COPY --from=deps --chown=node /home/node/app/node_modules ./node_modules
COPY --chown=node . .
USER node
ENV NEXT_TELEMETRY_DISABLED 1
RUN npm run build:standalone

FROM base AS runner

ARG BUILD_TIME
ARG GIT_COMMIT_SHA
ARG GIT_CURRENT_BRANCH
ARG GIT_LAST_LOG_MESSAGE
ARG GIT_LAST_COMMITTER
ARG GIT_LAST_COMMIT_DATE

RUN apk add --no-cache tini

WORKDIR /home/node/app
RUN chown node /home/node/app
ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

USER node
RUN mkdir ~/.npm-global
ENV NPM_CONFIG_PREFIX=/home/node/.npm-global
ENV PATH=$PATH:/home/node/.npm-global/bin
ENV NEXT_SHARP_PATH=/home/node/.npm-global/lib/node_modules/sharp

COPY --from=deps --chown=node /home/node/.npm-global /home/node/.npm-global
COPY --from=builder --chown=node /home/node/app/.next/standalone ./
COPY --from=builder --chown=node /home/node/app/docker/docker-entrypoint.sh /home/node/app/docker-entrypoint.sh
COPY --from=builder --chown=node /home/node/app/.env* ./

EXPOSE 5000
ENV PORT 5000

# HOSTNAME environment variable is set by Docker automatically
HEALTHCHECK CMD wget --no-verbose --tries=1 --spider http://$HOSTNAME:$PORT || exit 1

RUN chmod +x /home/node/app/docker-entrypoint.sh

LABEL org.opencontainers.image.created="$BUILD_TIME"
LABEL org.opencontainers.image.url="https://hive.io/"
LABEL org.opencontainers.image.documentation="https://gitlab.syncad.com/hive/block_explorer_ui"
LABEL org.opencontainers.image.source="https://gitlab.syncad.com/hive/block_explorer_ui"
#LABEL org.opencontainers.image.version="${VERSION}"
LABEL org.opencontainers.image.revision="$GIT_COMMIT_SHA"
LABEL org.opencontainers.image.licenses="MIT"
LABEL org.opencontainers.image.ref.name="HAF Block Explorer UI"
LABEL org.opencontainers.image.title="HAF Block Explorer UI Image"
LABEL org.opencontainers.image.description="Runs HAF Block Explorer User Interface application"
LABEL io.hive.image.branch="$GIT_CURRENT_BRANCH"
LABEL io.hive.image.commit.log_message="$GIT_LAST_LOG_MESSAGE"
LABEL io.hive.image.commit.author="$GIT_LAST_COMMITTER"
LABEL io.hive.image.commit.date="$GIT_LAST_COMMIT_DATE"

ENTRYPOINT ["/sbin/tini", "--", "/home/node/app/docker-entrypoint.sh"]
CMD ["node", "server.js"]
