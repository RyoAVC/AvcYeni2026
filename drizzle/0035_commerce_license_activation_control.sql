ALTER TABLE `commerce_license_installations` ADD `product` text DEFAULT 'avci-commerce' NOT NULL;
--> statement-breakpoint
ALTER TABLE `commerce_license_installations` ADD `activation_count` integer DEFAULT 0 NOT NULL;
--> statement-breakpoint
ALTER TABLE `commerce_license_installations` ADD `first_activated_at` text DEFAULT '' NOT NULL;
--> statement-breakpoint
CREATE TABLE `commerce_license_verification_events` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`license_id` integer DEFAULT 0 NOT NULL,
	`customer_id` integer DEFAULT 0 NOT NULL,
	`request_hash` text NOT NULL,
	`ip_address` text DEFAULT '' NOT NULL,
	`outcome` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_commerce_license_verification_rate` ON `commerce_license_verification_events` (`request_hash`,`created_at`);
--> statement-breakpoint
CREATE INDEX `idx_commerce_license_verification_license` ON `commerce_license_verification_events` (`license_id`,`created_at`);
