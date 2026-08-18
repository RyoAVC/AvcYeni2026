CREATE TABLE `support_tickets` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`customer_id` integer NOT NULL,
	`topic` text DEFAULT 'diger' NOT NULL,
	`subject` text NOT NULL,
	`message` text DEFAULT '' NOT NULL,
	`note` text DEFAULT '' NOT NULL,
	`status` text DEFAULT 'open' NOT NULL,
	`created_by_email` text DEFAULT '' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_support_tickets_customer` ON `support_tickets` (`customer_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `idx_support_tickets_status` ON `support_tickets` (`status`,`created_at`);
