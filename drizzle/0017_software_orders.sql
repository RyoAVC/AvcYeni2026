CREATE TABLE `software_orders` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`customer_id` integer NOT NULL,
	`kind` text NOT NULL,
	`package_id` integer,
	`module_id` integer,
	`status` text DEFAULT 'draft' NOT NULL,
	`price_note` text DEFAULT '' NOT NULL,
	`note` text DEFAULT '' NOT NULL,
	`created_by_email` text DEFAULT '' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_software_orders_customer` ON `software_orders` (`customer_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `idx_software_orders_status` ON `software_orders` (`status`,`created_at`);
