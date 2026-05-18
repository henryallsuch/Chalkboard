#!/usr/bin/env bash
# deploy.sh — build, test, and deploy the application
set -euo pipefail

# ── Config ────────────────────────────────────────────────────────────────────

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
LOG_FILE="${PROJECT_ROOT}/deploy.log"
DEPLOY_ENV="${1:-staging}"
IMAGE="${2:-}"

readonly VALID_ENVS=(staging production)
readonly COMPOSE_FILE="${PROJECT_ROOT}/docker-compose.${DEPLOY_ENV}.yml"

# ── Colours for output ────────────────────────────────────────────────────────

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # no colour

# ── Helpers ───────────────────────────────────────────────────────────────────

log()  { echo -e "${GREEN}[$(date '+%H:%M:%S')]${NC} $*" | tee -a "$LOG_FILE"; }
warn() { echo -e "${YELLOW}[WARN]${NC} $*" >&2; }
die()  { echo -e "${RED}[ERROR]${NC} $*" >&2; exit 1; }

require() {
  for cmd in "$@"; do
    command -v "$cmd" &>/dev/null || die "Required command not found: $cmd"
  done
}

# ── Validation ────────────────────────────────────────────────────────────────

validate_env() {
  local env="$1"
  for valid in "${VALID_ENVS[@]}"; do
    [[ "$env" == "$valid" ]] && return 0
  done
  die "Invalid environment '$env'. Must be one of: ${VALID_ENVS[*]}"
}

# ── Build ─────────────────────────────────────────────────────────────────────

build() {
  log "Building for $DEPLOY_ENV..."
  npm run build 2>&1 | tee -a "$LOG_FILE"

  if [[ -n "$IMAGE" ]]; then
    docker build \
      --build-arg NODE_ENV="$DEPLOY_ENV" \
      --label "git.sha=$(git rev-parse --short HEAD)" \
      --tag "$IMAGE" \
      .
  fi
}

# ── Tests ─────────────────────────────────────────────────────────────────────

run_tests() {
  log "Running test suite..."
  # Skip slow integration tests in staging
  if [[ "$DEPLOY_ENV" == "staging" ]]; then
    npm test -- --testPathIgnorePatterns='integration'
  else
    npm test
  fi
}

# ── Deploy ────────────────────────────────────────────────────────────────────

deploy() {
  log "Deploying to $DEPLOY_ENV..."

  [[ -f "$COMPOSE_FILE" ]] || die "Compose file not found: $COMPOSE_FILE"

  # Heredoc for the deploy manifest
  cat <<-MANIFEST >> "$LOG_FILE"
    deploy_time: $(date -u '+%Y-%m-%dT%H:%M:%SZ')
    environment: ${DEPLOY_ENV}
    git_sha:     $(git rev-parse HEAD)
    image:       ${IMAGE:-local}
	MANIFEST

  docker compose -f "$COMPOSE_FILE" pull
  docker compose -f "$COMPOSE_FILE" up -d --remove-orphans

  log "Waiting for health check..."
  local retries=0
  until curl -sf "http://localhost:${PORT:-3000}/health" | grep -q '"status":"ok"'; do
    ((retries++))
    [[ $retries -ge 30 ]] && die "Health check failed after 30 attempts"
    sleep 2
  done
}

# ── Cleanup on exit ───────────────────────────────────────────────────────────

cleanup() {
  local exit_code=$?
  [[ $exit_code -ne 0 ]] && warn "Deploy failed with exit code $exit_code"
}
trap cleanup EXIT

# ── Main ──────────────────────────────────────────────────────────────────────

main() {
  require docker npm git curl

  validate_env "$DEPLOY_ENV"
  log "Starting deploy pipeline → $DEPLOY_ENV"

  build
  run_tests
  deploy

  log "Deploy complete ✓"
}

main "$@"
