CREATE TABLE `software_invoices` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`customer_id` integer NOT NULL,
	`order_id` integer,
	`title` text NOT NULL,
	`amount_note` text DEFAULT '' NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`note` text DEFAULT '' NOT NULL,
	`created_by_email` text DEFAULT '' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_software_invoices_customer` ON `software_invoices` (`customer_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `idx_software_invoices_status` ON `software_invoices` (`status`,`created_at`);
