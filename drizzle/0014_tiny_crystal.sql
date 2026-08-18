CREATE TABLE `customers` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`phone` text NOT NULL,
	`phone_normalized` text DEFAULT '' NOT NULL,
	`company` text DEFAULT '' NOT NULL,
	`city` text DEFAULT '' NOT NULL,
	`interest` text DEFAULT '' NOT NULL,
	`note` text DEFAULT '' NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`created_by_email` text DEFAULT '' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_customers_email` ON `customers` (`email`);--> statement-breakpoint
CREATE INDEX `idx_customers_status_created_at` ON `customers` (`status`,`created_at`);--> statement-breakpoint
CREATE INDEX `idx_customers_phone_normalized` ON `customers` (`phone_normalized`);