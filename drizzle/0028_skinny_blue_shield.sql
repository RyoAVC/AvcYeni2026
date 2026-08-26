CREATE TABLE `commerce_portal_login_codes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`installation_id` integer NOT NULL,
	`customer_id` integer NOT NULL,
	`code_hash` text NOT NULL,
	`expires_at` text NOT NULL,
	`used_at` text DEFAULT '' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_commerce_portal_login_code_hash` ON `commerce_portal_login_codes` (`code_hash`);--> statement-breakpoint
CREATE INDEX `idx_commerce_portal_login_code_expiry` ON `commerce_portal_login_codes` (`expires_at`,`used_at`);