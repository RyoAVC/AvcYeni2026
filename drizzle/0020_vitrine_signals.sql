CREATE TABLE `vitrine_signals` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`slug` text NOT NULL,
	`label` text NOT NULL,
	`value` text NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`status` text DEFAULT 'live' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_vitrine_signals_slug` ON `vitrine_signals` (`slug`);--> statement-breakpoint
CREATE INDEX `idx_vitrine_signals_status_sort` ON `vitrine_signals` (`status`,`sort_order`);
