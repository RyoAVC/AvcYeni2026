CREATE TABLE `commerce_license_installations` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`customer_id` integer NOT NULL,
	`store_key` text NOT NULL,
	`installation_id` text NOT NULL,
	`primary_domain` text NOT NULL,
	`plan` text DEFAULT 'start' NOT NULL,
	`commerce_version` text DEFAULT '1.0.0' NOT NULL,
	`scopes_json` text DEFAULT '[]' NOT NULL,
	`limits_json` text DEFAULT '{}' NOT NULL,
	`activation_token_hash` text NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`valid_until` text NOT NULL,
	`last_seen_at` text DEFAULT '' NOT NULL,
	`last_seen_version` text DEFAULT '' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_commerce_license_installation_identity` ON `commerce_license_installations` (`store_key`,`installation_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `idx_commerce_license_installation_token` ON `commerce_license_installations` (`activation_token_hash`);--> statement-breakpoint
CREATE INDEX `idx_commerce_license_installation_customer` ON `commerce_license_installations` (`customer_id`,`status`);