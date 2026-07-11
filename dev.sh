#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT"

usage() {
  cat <<'EOF'
Run Kindred locally.

Usage:
  ./dev.sh          Start Vite dev server (frontend only, port 5173)
  ./dev.sh full     Start Vercel dev (frontend + /api routes, port 5174)

Options:
  -h, --help        Show this help
EOF
}

MODE="vite"
case "${1:-}" in
  "" ) ;;
  full|vercel|api) MODE="vercel" ;;
  vite|frontend) MODE="vite" ;;
  -h|--help) usage; exit 0 ;;
  *) echo "Unknown option: $1" >&2; usage; exit 1 ;;
esac

if ! command -v node >/dev/null; then
  echo "Node.js is required. Install it from https://nodejs.org/" >&2
  exit 1
fi

if ! command -v npm >/dev/null; then
  echo "npm is required." >&2
  exit 1
fi

if [[ ! -d node_modules ]]; then
  echo "Installing dependencies..."
  npm install
fi

echo "Generating icons and share metadata..."
npm run icons
npm run share-meta

if [[ "$MODE" == "vercel" ]]; then
  if ! command -v vercel >/dev/null; then
    echo "Vercel CLI is required for full local dev (API routes)." >&2
    echo "Install with: npm install -g vercel" >&2
    exit 1
  fi

  echo "Starting Vercel dev on http://localhost:5174"
  echo "API routes and .env.local will be loaded."
  exec vercel dev --listen 5174 --yes
fi

echo "Starting Vite dev server on http://localhost:5173"
echo "Use './dev.sh full' to run API routes locally."
exec npm run dev
