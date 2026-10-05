#!/usr/bin/env bash
set -euo pipefail

REPOSITORY_URL="https://github.com/PhucPhamHong-dev/PRN232_TaskTrackAssignment2"
FRONTEND_URL="https://qe190133-prn232-ass2-fe.vercel.app"
BACKEND_URL="https://qe190133-prn232-ass2-be.onrender.com"

check_url() {
  local label="$1"
  local url="$2"
  local expected="${3:-}"
  for attempt in {1..12}; do
    body="$(curl --location --silent --show-error --fail --max-time 90 "$url" 2>/dev/null || true)"
    if [[ -n "$body" ]] && { [[ -z "$expected" ]] || grep -qi "$expected" <<<"$body"; }; then
      echo "$label is healthy: $url"
      return 0
    fi
    echo "Waiting for $label (attempt $attempt/12)..."
    sleep 10
  done
  echo "$label failed: $url" >&2
  return 1
}

check_url "Repository" "$REPOSITORY_URL" "TaskTrack"
check_url "Frontend" "$FRONTEND_URL" "TaskTrack"
check_url "Backend health" "$BACKEND_URL/health" "healthy"
check_url "Swagger" "$BACKEND_URL/swagger/index.html" "Swagger UI"
