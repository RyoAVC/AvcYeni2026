CREATE TABLE `packages` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`family` text DEFAULT 'eticaret' NOT NULL,
	`summary` text DEFAULT '' NOT NULL,
	`features` text DEFAULT '' NOT NULL,
	`price_note` text DEFAULT '' NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_packages_slug` ON `packages` (`slug`);--> statement-breakpoint
CREATE INDEX `idx_packages_status_sort` ON `packages` (`status`,`sort_order`);
