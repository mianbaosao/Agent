#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKEND_DIR="$ROOT_DIR/backend"

cd "$BACKEND_DIR"

if [[ -x "./mvnw" ]]; then
  ./mvnw clean package -DskipTests
elif command -v mvn >/dev/null 2>&1; then
  mvn clean package -DskipTests
else
  echo "Maven is not available."
  echo "Install Maven, add Maven Wrapper, or build once from IDEA:"
  echo "  backend > Maven > Lifecycle > package"
  exit 1
fi

echo "Backend jar built under backend/target/"
