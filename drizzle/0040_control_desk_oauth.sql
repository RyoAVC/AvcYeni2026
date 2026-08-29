CREATE TABLE IF NOT EXISTS control_desk_oauth_codes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code_hash TEXT NOT NULL UNIQUE,
  code_challenge TEXT NOT NULL,
  redirect_uri TEXT NOT NULL,
  actor_type TEXT NOT NULL,
  actor_email TEXT NOT NULL,
  display_name TEXT NOT NULL,
  customer_id INTEGER NOT NULL DEFAULT 0,
  roles_json TEXT NOT NULL DEFAULT '[]',
  scopes_json TEXT NOT NULL DEFAULT '[]',
  expires_at TEXT NOT NULL,
  used_at TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_control_desk_oauth_code_expiry ON control_desk_oauth_codes(expires_at, used_at);

CREATE TABLE IF NOT EXISTS control_desk_sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT NOT NULL UNIQUE,
  access_token_hash TEXT NOT NULL UNIQUE,
  refresh_token_hash TEXT NOT NULL UNIQUE,
  actor_type TEXT NOT NULL,
  actor_email TEXT NOT NULL,
  display_name TEXT NOT NULL,
  customer_id INTEGER NOT NULL DEFAULT 0,
  roles_json TEXT NOT NULL DEFAULT '[]',
  scopes_json TEXT NOT NULL DEFAULT '[]',
  device_name TEXT NOT NULL DEFAULT '',
  access_expires_at TEXT NOT NULL,
  refresh_expires_at TEXT NOT NULL,
  revoked_at TEXT NOT NULL DEFAULT '',
  last_used_at TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_control_desk_session_actor ON control_desk_sessions(actor_email, revoked_at);
