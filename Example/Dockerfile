# syntax=docker/dockerfile:1
FROM node:22-alpine AS base
LABEL maintainer="henryallsuch"

WORKDIR /app

# ── Dependencies ──────────────────────────────────────────────────────────────

FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# ── Builder ───────────────────────────────────────────────────────────────────

FROM base AS builder
COPY package.json package-lock.json tsconfig.json ./
RUN npm ci
COPY src ./src
RUN npm run build

# ── Runtime ───────────────────────────────────────────────────────────────────

FROM base AS runtime

ENV NODE_ENV=production \
    PORT=3000 \
    LOG_LEVEL=info

RUN addgroup --system --gid 1001 nodejs \
 && adduser  --system --uid 1001 appuser

COPY --from=deps    --chown=appuser:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=appuser:nodejs /app/dist        ./dist

USER appuser

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:${PORT}/health || exit 1

ENTRYPOINT ["node", "dist/index.js"]
