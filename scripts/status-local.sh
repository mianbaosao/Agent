#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PID_DIR="$ROOT_DIR/.local/pids"
BACKEND_PORT="${BACKEND_PORT:-8000}"
FRONTEND_PORT="${FRONTEND_PORT:-3000}"

print_pid_status() {
  local name="$1"
  local pid_file="$PID_DIR/$name.pid"
  if [[ -f "$pid_file" ]] && kill -0 "$(cat "$pid_file")" >/dev/null 2>&1; then
    echo "$name: running, PID $(cat "$pid_file")"
  else
    echo "$name: not running from local script"
  fi
}

print_port_status() {
  local label="$1"
  local port="$2"
  echo ""
  echo "$label port $port:"
  lsof -i :"$port" -sTCP:LISTEN || true
}

print_pid_status backend
print_pid_status frontend
print_port_status Backend "$BACKEND_PORT"
print_port_status Frontend "$FRONTEND_PORT"
