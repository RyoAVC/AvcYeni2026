CREATE TABLE `vitrine_toasts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`slug` text NOT NULL,
	`title` text NOT NULL,
	`text` text NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`status` text DEFAULT 'live' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_vitrine_toasts_slug` ON `vitrine_toasts` (`slug`);--> statement-breakpoint
CREATE INDEX `idx_vitrine_toasts_status_sort` ON `vitrine_toasts` (`status`,`sort_order`);
