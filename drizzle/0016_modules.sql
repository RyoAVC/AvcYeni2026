CREATE TABLE `modules` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`category` text DEFAULT 'pazaryeri' NOT NULL,
	`summary` text DEFAULT '' NOT NULL,
	`features` text DEFAULT '' NOT NULL,
	`price_note` text DEFAULT '' NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_modules_slug` ON `modules` (`slug`);--> statement-breakpoint
CREATE INDEX `idx_modules_status_sort` ON `modules` (`status`,`sort_order`);
