#!/usr/bin/env bash
# Publish this repo to yeni.avcieticaret.com/v2 and restart the Node service.
set -euo pipefail

APP_DIR="/home/avccom/yeni/v2/app"
ROOT_DIR="/home/avccom/yeni"
NODE_BIN="/opt/node-v22.23.1-linux-x64/bin"
export PATH="${NODE_BIN}:${PATH}"
export NEXT_PUBLIC_BASE_PATH="/v2"
export NEXT_PUBLIC_SITE_ORIGIN="https://yeni.avcieticaret.com"
export WRANGLER_LOG_PATH="${APP_DIR}/.wrangler/wrangler.log"

cd "${APP_DIR}"
if ! command -v npm >/dev/null 2>&1; then
  echo "npm not found on PATH" >&2
  exit 1
fi

npm ci --include=dev
export NODE_ENV="production"

npx vinext build

SERVICE_FILE="/etc/systemd/system/avci-yeni-v2.service"
if [ ! -f "${SERVICE_FILE}" ]; then
  cp "${APP_DIR}/.deploy-avci-yeni-v2.service" "${SERVICE_FILE}"
  systemctl daemon-reload
  systemctl enable avci-yeni-v2.service
fi

cp "${APP_DIR}/hosting/yeni-index.php" "${ROOT_DIR}/index.php"
cp "${APP_DIR}/hosting/yeni.htaccess" "${ROOT_DIR}/.htaccess"

systemctl restart avci-yeni-v2.service
systemctl is-active avci-yeni-v2.service
curl -sI -o /dev/null -w "local_v2:%{http_code}\n" --max-time 15 http://127.0.0.1:4121/v2 || true
curl -sI -o /dev/null -w "local_v2_demo:%{http_code}\n" --max-time 15 http://127.0.0.1:4121/v2/demo-portal || true
