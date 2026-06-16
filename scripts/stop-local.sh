#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PID_DIR="$ROOT_DIR/.local/pids"

stop_one() {
  local name="$1"
  local pid_file="$PID_DIR/$name.pid"

  if [[ ! -f "$pid_file" ]]; then
    echo "$name is not tracked."
    return
  fi

  local pid
  pid="$(cat "$pid_file")"
  if kill -0 "$pid" >/dev/null 2>&1; then
    echo "Stopping $name: PID $pid"
    kill "$pid"
  else
    echo "$name PID file exists, but process is not running."
  fi
  rm -f "$pid_file"
}

case "${1:-all}" in
  backend)
    stop_one backend
    ;;
  frontend)
    stop_one frontend
    ;;
  all)
    stop_one frontend
    stop_one backend
    ;;
  *)
    echo "Usage: ./scripts/stop-local.sh [backend|frontend|all]"
    exit 1
    ;;
esac
