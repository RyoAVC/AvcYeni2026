CREATE TABLE `site_visits` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`day` text NOT NULL,
	`path` text NOT NULL,
	`referrer_host` text DEFAULT '' NOT NULL,
	`visitor_key` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_site_visits_day` ON `site_visits` (`day`);--> statement-breakpoint
CREATE INDEX `idx_site_visits_day_path` ON `site_visits` (`day`,`path`);--> statement-breakpoint
CREATE INDEX `idx_site_visits_day_visitor` ON `site_visits` (`day`,`visitor_key`);