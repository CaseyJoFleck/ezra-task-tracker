#!/usr/bin/env bash
# Starts the CareOps API, waits for /health, then runs the Vite dev server.
# Used by Playwright (frontend/e2e). Run from repo: not needed for manual use.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FRONTEND_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
REPO_ROOT="$(cd "$FRONTEND_DIR/.." && pwd)"

(cd "$REPO_ROOT/backend" && dotnet run --project src/CareOps.Api/CareOps.Api.csproj) &
API_PID=$!

cleanup() {
  kill "$API_PID" 2>/dev/null || true
}
trap cleanup EXIT INT TERM

cd "$FRONTEND_DIR"
npx wait-on -t 120000 "http://127.0.0.1:5000/health"

npm run dev -- --host 127.0.0.1 --port 5173
