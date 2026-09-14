ALTER TABLE customers ADD COLUMN trial_expires_at TEXT NOT NULL DEFAULT '';
CREATE TABLE customer_setup_tokens (
 token_hash TEXT PRIMARY KEY, customer_id INTEGER NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
 purpose TEXT NOT NULL DEFAULT 'demo_invite' CHECK(purpose IN ('demo_invite')),
 expires_at TEXT NOT NULL, used_at TEXT, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_customer_setup_tokens_customer ON customer_setup_tokens(customer_id);
