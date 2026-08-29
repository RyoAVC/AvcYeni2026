ALTER TABLE commerce_install_jobs ADD COLUMN agent_token_hash TEXT NOT NULL DEFAULT '';
ALTER TABLE commerce_install_jobs ADD COLUMN agent_token_expires_at TEXT NOT NULL DEFAULT '';
CREATE UNIQUE INDEX IF NOT EXISTS idx_commerce_install_jobs_agent_token ON commerce_install_jobs(agent_token_hash) WHERE agent_token_hash <> '';
