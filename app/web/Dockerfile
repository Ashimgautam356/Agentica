FROM node:24-alpine AS base

WORKDIR /workspace
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH

RUN corepack enable && corepack prepare pnpm@11.9.0 --activate

FROM base AS mcp-deps
COPY backend/ai/ts-version/package.json backend/ai/ts-version/pnpm-lock.yaml backend/ai/ts-version/pnpm-workspace.yaml ./backend/ai/ts-version/
RUN cd backend/ai/ts-version && pnpm install --frozen-lockfile

FROM mcp-deps AS mcp-builder
COPY backend/ai/ts-version ./backend/ai/ts-version
RUN cd backend/ai/ts-version && pnpm build && pnpm prune --prod

FROM base AS web-deps
COPY app/web/package.json app/web/pnpm-lock.yaml app/web/pnpm-workspace.yaml ./app/web/
RUN cd app/web && pnpm install --frozen-lockfile

FROM web-deps AS web-builder
COPY app/web ./app/web
ENV NEXT_TELEMETRY_DISABLED=1
RUN cd app/web && pnpm build

FROM node:24-alpine AS runner
WORKDIR /workspace/app/web
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV HOSTNAME=0.0.0.0
ENV PORT=3000
ENV MCP_SERVER_PATH=/workspace/backend/ai/ts-version/dist/index.js

RUN addgroup -S nodejs && adduser -S nextjs -G nodejs

COPY --from=web-builder --chown=nextjs:nodejs /workspace/app/web/.next/standalone ./
COPY --from=web-builder --chown=nextjs:nodejs /workspace/app/web/.next/static ./.next/static
COPY --from=mcp-builder --chown=nextjs:nodejs /workspace/backend/ai/ts-version/package.json /workspace/backend/ai/ts-version/package.json
COPY --from=mcp-builder --chown=nextjs:nodejs /workspace/backend/ai/ts-version/dist /workspace/backend/ai/ts-version/dist
COPY --from=mcp-builder --chown=nextjs:nodejs /workspace/backend/ai/ts-version/node_modules /workspace/backend/ai/ts-version/node_modules

USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
