#!/usr/bin/env bash
# Start the portfolio locally: Astro dev site + admin dashboard.
#   ./start.sh          → dev site on :4321, admin on :4000
#   ./start.sh build    → build static site into frontend/dist (for nginx)
#   ./start.sh deploy   → build and upload to the VPS (see deploy/deploy.sh)
set -euo pipefail
cd "$(dirname "$0")"

if [ ! -d node_modules ]; then
  echo "Installing dependencies…"
  npm install
fi

export ASTRO_TELEMETRY_DISABLED=1

case "${1:-dev}" in
  build) npm run build ;;
  preview) npm run build && npm run preview ;;
  deploy) shift; deploy/deploy.sh "$@" ;;
  *)
    echo ""
    echo "  Site   → http://localhost:4321"
    echo "  Admin  → http://localhost:${ADMIN_PORT:-4000}"
    echo ""
    npm start
    ;;
esac
