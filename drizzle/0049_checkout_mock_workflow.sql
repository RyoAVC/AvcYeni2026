CREATE TABLE checkout_orders (
 id TEXT PRIMARY KEY, package_id INTEGER NOT NULL REFERENCES packages(id),
 package_slug TEXT NOT NULL, email TEXT NOT NULL, name TEXT NOT NULL, domain TEXT NOT NULL,
 amount_kurus INTEGER NOT NULL CHECK(amount_kurus > 0), duration_days INTEGER NOT NULL CHECK(duration_days > 0),
 rights_json TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','paid','failed')),
 mode TEXT NOT NULL DEFAULT 'mock' CHECK(mode = 'mock'),
 customer_id INTEGER REFERENCES customers(id), license_id INTEGER REFERENCES commerce_license_installations(id),
 created_at TEXT NOT NULL, paid_at TEXT
);
CREATE UNIQUE INDEX idx_checkout_reserved_domain ON checkout_orders(domain) WHERE status IN ('pending','paid');
CREATE TABLE checkout_license_rights (
 license_id INTEGER NOT NULL REFERENCES commerce_license_installations(id),
 right_key TEXT NOT NULL, label TEXT NOT NULL, scopes_json TEXT NOT NULL,
 status TEXT NOT NULL CHECK(status = 'active'), PRIMARY KEY(license_id, right_key)
);
CREATE TABLE checkout_setup_tokens (
 token_hash TEXT PRIMARY KEY, customer_id INTEGER NOT NULL REFERENCES customers(id),
 expires_at TEXT NOT NULL, used_at TEXT
);
CREATE TABLE checkout_mail_jobs (
 order_id TEXT PRIMARY KEY REFERENCES checkout_orders(id),
 status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','sending','sent')),
 lease_until TEXT, sent_at TEXT
);
