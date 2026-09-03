#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="${1:-$PWD}"
shift || true

if [[ "${1:-}" == "--files" ]]; then
  shift
  exec python3 "${SCRIPT_DIR}/lib/check_guardrails.py" "${ROOT}" --files "$@"
fi

exec python3 "${SCRIPT_DIR}/lib/check_guardrails.py" "${ROOT}" --all
