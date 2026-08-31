CREATE TABLE IF NOT EXISTS mobile_push_deliveries (
  id integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  customer_id integer NOT NULL,
  store_key text DEFAULT '' NOT NULL,
  device_id integer NOT NULL,
  requested_by text DEFAULT '' NOT NULL,
  title text NOT NULL,
  status text DEFAULT 'queued' NOT NULL,
  provider_ticket_id text DEFAULT '' NOT NULL,
  error_code text DEFAULT '' NOT NULL,
  error_message text DEFAULT '' NOT NULL,
  created_at text DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_mobile_push_delivery_customer ON mobile_push_deliveries(customer_id,created_at);
CREATE INDEX IF NOT EXISTS idx_mobile_push_delivery_device ON mobile_push_deliveries(device_id,created_at);
