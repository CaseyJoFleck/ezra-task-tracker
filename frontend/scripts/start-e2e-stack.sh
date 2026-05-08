#!/usr/bin/env bash
# Starts the CareOps API, waits for /health, then runs the Vite dev server.
# Used by Playwright (frontend/e2e). Run from repo: not needed for manual use.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FRONTEND_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
REPO_ROOT="$(cd "$FRONTEND_DIR/.." && pwd)"

# Avoid attaching Playwright to an unrelated API/Vite already listening on these ports.
kill_port_listeners() {
  local port="$1"
  local pids
  pids=$(lsof -nP -iTCP:"$port" -sTCP:LISTEN -t 2>/dev/null || true)
  if [ -n "$pids" ]; then
    kill -9 $pids 2>/dev/null || true
  fi
}

kill_port_listeners 5000
kill_port_listeners 5173
sleep 0.5

# Playwright uses the API's default SQLite file (`backend/careops.db`). Remove it so each
# E2E stack boot matches current `SeedData` instead of an accumulated local/dev database.
rm -f "$REPO_ROOT/backend/careops.db"

(cd "$REPO_ROOT/backend" && dotnet run --project src/CareOps.Api/CareOps.Api.csproj) &
API_PID=$!

cleanup() {
  kill "$API_PID" 2>/dev/null || true
}
trap cleanup EXIT INT TERM

cd "$FRONTEND_DIR"
npx wait-on -t 120000 "http://127.0.0.1:5000/health"

npm run dev -- --host 127.0.0.1 --port 5173
