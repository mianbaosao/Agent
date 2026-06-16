#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PID_DIR="$ROOT_DIR/.local/pids"
LOG_DIR="$ROOT_DIR/logs"
BACKEND_PID="$PID_DIR/backend.pid"
FRONTEND_PID="$PID_DIR/frontend.pid"
BACKEND_LOG="$LOG_DIR/backend.log"
FRONTEND_LOG="$LOG_DIR/frontend.log"
BACKEND_PORT="${BACKEND_PORT:-8000}"
FRONTEND_PORT="${FRONTEND_PORT:-3000}"

mkdir -p "$PID_DIR" "$LOG_DIR"

is_running() {
  local pid_file="$1"
  [[ -f "$pid_file" ]] && kill -0 "$(cat "$pid_file")" >/dev/null 2>&1
}

port_in_use() {
  local port="$1"
  lsof -i :"$port" -sTCP:LISTEN >/dev/null 2>&1
}

latest_backend_jar() {
  find "$ROOT_DIR/backend/target" -maxdepth 1 -type f -name "*.jar" ! -name "*.original" -print 2>/dev/null | sort | tail -1
}

start_backend() {
  if is_running "$BACKEND_PID"; then
    echo "Backend already running: PID $(cat "$BACKEND_PID")"
    return
  fi

  if port_in_use "$BACKEND_PORT"; then
    echo "Port $BACKEND_PORT is already in use. Backend not started."
    echo "Run ./scripts/status-local.sh to inspect ports."
    return
  fi

  local jar
  jar="$(latest_backend_jar)"
  if [[ -z "$jar" ]]; then
    echo "No backend jar found."
    echo "Build it first:"
    echo "  ./scripts/build-backend.sh"
    echo "or build from IDEA Maven package once."
    return
  fi

  echo "Starting backend on http://localhost:$BACKEND_PORT"
  nohup java -jar "$jar" --server.port="$BACKEND_PORT" > "$BACKEND_LOG" 2>&1 &
  echo $! > "$BACKEND_PID"
}

start_frontend() {
  if is_running "$FRONTEND_PID"; then
    echo "Frontend already running: PID $(cat "$FRONTEND_PID")"
    return
  fi

  if port_in_use "$FRONTEND_PORT"; then
    echo "Port $FRONTEND_PORT is already in use. Frontend not started."
    echo "Run ./scripts/status-local.sh to inspect ports."
    return
  fi

  echo "Starting frontend on http://localhost:$FRONTEND_PORT"
  cd "$ROOT_DIR"
  nohup npm --workspace frontend run dev -- --port "$FRONTEND_PORT" > "$FRONTEND_LOG" 2>&1 &
  echo $! > "$FRONTEND_PID"
}

start_backend
start_frontend

echo ""
echo "Local services requested."
echo "Frontend: http://localhost:$FRONTEND_PORT"
echo "Backend:  http://localhost:$BACKEND_PORT"
echo "Logs:"
echo "  ./scripts/logs-local.sh frontend"
echo "  ./scripts/logs-local.sh backend"
