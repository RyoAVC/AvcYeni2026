#!/usr/bin/env bash
# Publish this repo to yeni.avcieticaret.com/v2 and restart the Node service.
set -euo pipefail

APP_DIR="/home/avccom/yeni/v2/app"
V1_DIR="/home/avccom/yeni/v1/app"
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

# v1 slotundan gelen .env dosyaları /v2 derlemesinde basePath'i ezebilir.
rm -f .env .env.local .env.production .env.production.local 2>/dev/null || true
if [ -f "${V1_DIR}/.dev.vars" ]; then
  cp "${V1_DIR}/.dev.vars" "${APP_DIR}/.dev.vars"
fi

# Gizli müşteri paneli önizlemesi — wrangler/vinext .dev.vars okur.
if [ -f "${APP_DIR}/.dev.vars" ]; then
  if grep -q '^CUSTOMER_PORTAL_PREVIEW=' "${APP_DIR}/.dev.vars"; then
    sed -i 's/^CUSTOMER_PORTAL_PREVIEW=.*/CUSTOMER_PORTAL_PREVIEW=1/' "${APP_DIR}/.dev.vars"
  else
    echo "CUSTOMER_PORTAL_PREVIEW=1" >> "${APP_DIR}/.dev.vars"
  fi
else
  echo "CUSTOMER_PORTAL_PREVIEW=1" > "${APP_DIR}/.dev.vars"
fi

npm ci --include=dev
export NODE_ENV="production"

echo "Building v2 with NEXT_PUBLIC_BASE_PATH=${NEXT_PUBLIC_BASE_PATH}"
NEXT_PUBLIC_BASE_PATH="/v2" NEXT_PUBLIC_SITE_ORIGIN="https://yeni.avcieticaret.com" npx vinext build

if ! grep -rq '/v2/assets/' dist/server 2>/dev/null; then
  echo "v2 build artifact is missing /v2 asset prefix" >&2
  exit 1
fi

SERVICE_FILE="/etc/systemd/system/avci-yeni-v2.service"
cp "${APP_DIR}/.deploy-avci-yeni-v2.service" "${SERVICE_FILE}"
systemctl daemon-reload
systemctl enable avci-yeni-v2.service

cp "${APP_DIR}/.deploy-avci-yeni-v2.service" "${SERVICE_FILE}"
systemctl daemon-reload
systemctl enable avci-yeni-v2.service

bash "${APP_DIR}/scripts/sync-yeni-proxy.sh" "${APP_DIR}"

chown -R avccom:avccom "${APP_DIR}" "${ROOT_DIR}/index.php" "${ROOT_DIR}/.htaccess" 2>/dev/null || true

systemctl restart avci-yeni-v2.service
systemctl is-active avci-yeni-v2.service

health_code="000"
for attempt in 1 2 3 4 5 6 7 8 9 10; do
  sleep 3
  health_code="$(curl -sI -o /dev/null -w "%{http_code}" --max-time 10 http://127.0.0.1:4121/v2/demo-portal || echo 000)"
  echo "local_v2_demo_try_${attempt}:${health_code}"
  if [ "${health_code}" = "200" ]; then
    break
  fi
done

if [ "${health_code}" != "200" ]; then
  echo "v2 health check failed for /v2/demo-portal (last code: ${health_code})" >&2
  exit 1
fi

public_code="$(curl -sI -o /dev/null -w "%{http_code}" --max-time 20 https://yeni.avcieticaret.com/v2/demo-portal || echo 000)"
echo "public_v2_demo:${public_code}"
if [ "${public_code}" != "200" ]; then
  echo "public v2 health check failed (last code: ${public_code})" >&2
  exit 1
fi
