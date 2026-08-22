#!/usr/bin/env bash
# Copy yeni.avcieticaret.com PHP proxy files to every likely document root.
set -euo pipefail

APP_DIR="${1:-/home/avccom/yeni/v1/app}"
CANONICAL_ROOT="/home/avccom/yeni"
INDEX_SRC="${APP_DIR}/hosting/yeni-index.php"
HTACCESS_SRC="${APP_DIR}/hosting/yeni.htaccess"

if [ ! -f "${INDEX_SRC}" ] || [ ! -f "${HTACCESS_SRC}" ]; then
  echo "Missing proxy source files under ${APP_DIR}/hosting" >&2
  exit 1
fi

sync_proxy() {
  local target_root="$1"
  [ -d "${target_root}" ] || return 0
  cp "${INDEX_SRC}" "${target_root}/index.php"
  cp "${HTACCESS_SRC}" "${target_root}/.htaccess"
  echo "synced_proxy_to:${target_root}"
}

sync_proxy "${CANONICAL_ROOT}"

for candidate in \
  /home/avccom/public_html \
  /home/avccom/domains/yeni.avcieticaret.com/public_html \
  /home/avccom/yeni.avcieticaret.com/public_html \
  /var/www/yeni.avcieticaret.com \
  /var/www/html; do
  sync_proxy "${candidate}"
done

while IFS= read -r conf; do
  [ -n "${conf}" ] || continue
  docroot="$(awk '/^[[:space:]]*docRoot[[:space:]]/ { print $2; exit }' "${conf}" | tr -d '"')"
  sync_proxy "${docroot}"
done < <(grep -rl "yeni.avcieticaret.com" /usr/local/lsws/conf 2>/dev/null || true)

php -r "if (function_exists('opcache_reset')) { opcache_reset(); }" 2>/dev/null || true
if command -v /usr/local/lsws/bin/lswsctrl >/dev/null 2>&1; then
  /usr/local/lsws/bin/lswsctrl restart || true
fi

grep -q '127.0.0.1:4121' "${CANONICAL_ROOT}/index.php"
