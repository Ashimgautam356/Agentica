FROM node:24-alpine AS base

WORKDIR /app
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH

RUN corepack enable && corepack prepare pnpm@11.9.0 --activate

FROM base AS builder
ARG VITE_API_BASE_URL=
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm build

FROM nginxinc/nginx-unprivileged:1.29-alpine AS runner

COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 8080
