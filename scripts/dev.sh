#!/usr/bin/env sh
set -eu

pids=""

stop() {
  kill $pids 2>/dev/null || true
}

trap stop INT TERM EXIT

pnpm --dir backend/express dev &
pids="$pids $!"
pnpm --dir app/web dev &
pids="$pids $!"
pnpm --dir app/admin dev &
pids="$pids $!"
uv --directory backend/ai/py-version/llms-service run main.py &
pids="$pids $!"

wait
