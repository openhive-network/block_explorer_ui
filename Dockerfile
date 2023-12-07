# syntax=docker/dockerfile:1.5
# Build with: docker buildx bake --progress=plain local-build

FROM node:18.15-alpine3.17 AS base

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
ENTRYPOINT ["/sbin/tini", "--", "/home/node/app/docker-entrypoint.sh"]
CMD ["node", "server.js"]
