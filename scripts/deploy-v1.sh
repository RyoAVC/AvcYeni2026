#!/usr/bin/env bash
# Publish this repo to yeni.avcieticaret.com/v1 and restart the Node service.
set -euo pipefail

APP_DIR="/home/avccom/yeni/v1/app"
ROOT_DIR="/home/avccom/yeni"
NODE_BIN="/opt/node-v22.23.1-linux-x64/bin"
export PATH="${NODE_BIN}:${PATH}"
export NEXT_PUBLIC_BASE_PATH="/v1"
export NEXT_PUBLIC_SITE_ORIGIN="https://yeni.avcieticaret.com"
export WRANGLER_LOG_PATH="${APP_DIR}/.wrangler/wrangler.log"

cd "${APP_DIR}"
if ! command -v npm >/dev/null 2>&1; then
  echo "npm not found on PATH" >&2
  exit 1
fi
# NODE_ENV=production before npm ci skips vite/vinext (devDependencies).
npm ci --include=dev
export NODE_ENV="production"

npx vinext build
bash "${APP_DIR}/scripts/sync-yeni-proxy.sh" "${APP_DIR}"
systemctl restart avci-yeni-v1.service
systemctl is-active avci-yeni-v1.service
curl -sI -o /dev/null -w "local_v1:%{http_code}\n" --max-time 10 http://127.0.0.1:4120/v1 || true

V2_DIR="/home/avccom/yeni/v2/app"
mkdir -p "${V2_DIR}"
rsync -az --delete \
  --exclude node_modules \
  --exclude .wrangler \
  --exclude .sites-runtime \
  --exclude dist \
  --exclude .vinext \
  --exclude .next \
  --exclude .env \
  --exclude .env.* \
  --exclude .dev.vars \
  "${APP_DIR}/" "${V2_DIR}/"
bash "${V2_DIR}/scripts/deploy-v2.sh"
