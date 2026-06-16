#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
LOG_DIR="$ROOT_DIR/logs"

case "${1:-all}" in
  backend)
    touch "$LOG_DIR/backend.log"
    tail -f "$LOG_DIR/backend.log"
    ;;
  frontend)
    touch "$LOG_DIR/frontend.log"
    tail -f "$LOG_DIR/frontend.log"
    ;;
  all)
    touch "$LOG_DIR/backend.log" "$LOG_DIR/frontend.log"
    tail -f "$LOG_DIR/backend.log" "$LOG_DIR/frontend.log"
    ;;
  *)
    echo "Usage: ./scripts/logs-local.sh [backend|frontend|all]"
    exit 1
    ;;
esac
