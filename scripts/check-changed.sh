#!/usr/bin/env sh
set -eu

mode="${1:-}"

if [ "$mode" = "--staged" ]; then
  files="$(git diff --cached --name-only)"
else
  files="$(git diff --name-only HEAD)"
fi

if [ -z "$files" ]; then
  echo "No changed files to check."
  exit 0
fi

run_js_checks() {
  dir="$1"

  pnpm --dir "$dir" format:check
  pnpm --dir "$dir" lint
  pnpm --dir "$dir" check-types
}

has_changed() {
  prefix="$1"

  printf '%s\n' "$files" | grep -q "^$prefix"
}

ran_any=0

if has_changed "app/web/"; then
  ran_any=1
  run_js_checks "app/web"
fi

if has_changed "app/admin/"; then
  ran_any=1
  run_js_checks "app/admin"
fi

if has_changed "backend/express/"; then
  ran_any=1
  run_js_checks "backend/express"
fi

if has_changed "backend/ai/py-version/llms-service/"; then
  ran_any=1
  uv --directory backend/ai/py-version/llms-service run --group dev python -m black --check .
  uv --directory backend/ai/py-version/llms-service run ruff check .
fi

if [ "$ran_any" -eq 0 ]; then
  echo "No app/backend files changed; skipping checks."
fi
