#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

RED=$'\033[0;31m'
GREEN=$'\033[0;32m'
YELLOW=$'\033[1;33m'
BLUE=$'\033[0;34m'
NC=$'\033[0m'

log()  { printf '%s[dev]%s %s\n' "$BLUE"   "$NC" "$*"; }
ok()   { printf '%s[dev]%s %s\n' "$GREEN"  "$NC" "$*"; }
warn() { printf '%s[dev]%s %s\n' "$YELLOW" "$NC" "$*"; }
err()  { printf '%s[dev]%s %s\n' "$RED"    "$NC" "$*" >&2; }

kill_tree() {
  local pid="$1"
  local sig="${2:-TERM}"
  local children child

  # pgrep exits 1 when nothing matches; swallow it
  children="$(pgrep -P "$pid" 2>/dev/null || true)"

  for child in $children; do
    kill_tree "$child" "$sig"
  done

  # kill may fail if the process already exited; that's fine
  kill -"$sig" "$pid" 2>/dev/null || true
  return 0
}

kill_port() {
  local port="$1"
  local pids pid

  # NOTE: use || true, not | true
  pids="$(lsof -tiTCP:"$port" -sTCP:LISTEN 2>/dev/null || true)"

  if [ -n "$pids" ]; then
    warn "Port $port busy (pid(s): $pids) -- terminating"
    for pid in $pids; do
      kill_tree "$pid" TERM
    done

    sleep 1

    pids="$(lsof -tiTCP:"$port" -sTCP:LISTEN 2>/dev/null || true)"
    for pid in $pids; do
      kill_tree "$pid" KILL
    done

    ok "Port $port freed"
  fi
  return 0
}

DEV_PID=""
cleanup() {
  local code=$?
  log "Shutting down..."
  if [ -n "$DEV_PID" ]; then
    kill_tree "$DEV_PID" TERM
  fi
  exit "$code"
}

trap cleanup INT TERM

# 1. Kill any existing backend/frontend instances
log "Stopping existing backend (:4000) and frontend (:3000) instances"
kill_port 4000
kill_port 3000

# 2. Start infrastructure
log "Starting Postgres + Redis"
docker compose up -d

log "Waiting for Postgres + Redis to be ready"
for i in $(seq 1 30); do
  pg_ok=0
  rd_ok=0

  if docker compose exec -T postgres pg_isready -U campus -d campus_db >/dev/null 2>&1; then
    pg_ok=1
  fi
  if docker compose exec -T redis redis-cli ping 2>/dev/null | grep -q PONG; then
    rd_ok=1
  fi

  if [ "$pg_ok" = "1" ] && [ "$rd_ok" = "1" ]; then
    ok "Postgres + Redis are ready"
    break
  fi

  if [ "$i" = "30" ]; then
    err "Timed out waiting for Postgres/Redis"
    docker compose logs postgres redis
    exit 1
  fi

  sleep 1
done

# 3. Apply migrations + seed
log "Running migrations"
npm run migrate

# 4. Start backend + frontend
log "Starting backend (:4000) and frontend (:3000)"
ok "Frontend: http://localhost:3000"
ok "Backend:  http://localhost:4000"

npm run dev:all &
DEV_PID=$!
wait "$DEV_PID"
