CREATE TABLE IF NOT EXISTS mobile_push_devices (
  id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
  customer_id INTEGER NOT NULL,
  session_id TEXT NOT NULL,
  store_key TEXT NOT NULL,
  device_installation_id TEXT NOT NULL,
  platform TEXT NOT NULL CHECK(platform IN ('ios','android')),
  provider TEXT NOT NULL DEFAULT 'expo' CHECK(provider IN ('expo')),
  token_hash TEXT NOT NULL,
  token_ciphertext TEXT NOT NULL,
  token_nonce TEXT NOT NULL,
  app_version TEXT NOT NULL DEFAULT '',
  permission_status TEXT NOT NULL DEFAULT 'granted',
  last_seen_at TEXT NOT NULL DEFAULT '',
  revoked_at TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(customer_id, device_installation_id),
  UNIQUE(token_hash)
);
CREATE INDEX IF NOT EXISTS idx_mobile_push_customer_store ON mobile_push_devices(customer_id,store_key,revoked_at);
CREATE INDEX IF NOT EXISTS idx_mobile_push_session ON mobile_push_devices(session_id,revoked_at);
