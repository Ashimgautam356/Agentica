FROM node:24-alpine AS base

WORKDIR /workspace
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH

RUN corepack enable && corepack prepare pnpm@11.9.0 --activate

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

RUN addgroup -S nodejs && adduser -S nextjs -G nodejs

COPY --from=web-builder --chown=nextjs:nodejs /workspace/app/web/.next/standalone ./
COPY --from=web-builder --chown=nextjs:nodejs /workspace/app/web/.next/static ./.next/static
USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
