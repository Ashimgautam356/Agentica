FROM node:24-alpine AS base

WORKDIR /app
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH

RUN corepack enable && corepack prepare pnpm@11.9.0 --activate

FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

FROM deps AS builder
COPY . .
ENV DATABASE_URL=postgresql://user:password@localhost:5432/database
RUN pnpm db:generate \
  && pnpm build \
  && pnpm prune --prod \
  && rm -rf \
    node_modules/.pnpm/prisma@* \
    node_modules/.pnpm/@prisma+studio-* \
    node_modules/.pnpm/@prisma+engines@* \
    node_modules/.pnpm/typescript@* \
    node_modules/.pnpm/*typescript-eslint* \
    node_modules/.pnpm/eslint@* \
    node_modules/.pnpm/@eslint* \
    node_modules/.pnpm/@types+*

FROM node:24-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=4000

RUN addgroup -S app && adduser -S app -G app

COPY --from=builder --chown=app:app /app/node_modules ./node_modules
COPY --from=builder --chown=app:app /app/dist ./dist
COPY --from=builder --chown=app:app /app/package.json ./package.json

USER app
EXPOSE 4000
CMD ["node", "dist/server.js"]
