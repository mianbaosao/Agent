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

if ! is_running "$BACKEND_PID"; then
  if port_in_use "$BACKEND_PORT"; then
    echo "Port $BACKEND_PORT is already in use. Backend not started."
  else
    jar="$(latest_backend_jar)"
    if [[ -z "$jar" ]]; then
      echo "No backend jar found. Run ./scripts/build-backend.sh first."
    else
      echo "Starting backend on http://localhost:$BACKEND_PORT"
      nohup java -jar "$jar" --server.port="$BACKEND_PORT" > "$BACKEND_LOG" 2>&1 &
      echo $! > "$BACKEND_PID"
    fi
  fi
else
  echo "Backend already running: PID $(cat "$BACKEND_PID")"
fi

if ! is_running "$FRONTEND_PID"; then
  if port_in_use "$FRONTEND_PORT"; then
    echo "Port $FRONTEND_PORT is already in use. Frontend not started."
  else
    echo "Building frontend..."
    cd "$ROOT_DIR"
    npm --workspace frontend run build
    echo "Starting frontend on http://localhost:$FRONTEND_PORT"
    nohup npm --workspace frontend run start -- --port "$FRONTEND_PORT" > "$FRONTEND_LOG" 2>&1 &
    echo $! > "$FRONTEND_PID"
  fi
else
  echo "Frontend already running: PID $(cat "$FRONTEND_PID")"
fi

echo ""
echo "Local production services requested."
echo "Frontend: http://localhost:$FRONTEND_PORT"
echo "Backend:  http://localhost:$BACKEND_PORT"
