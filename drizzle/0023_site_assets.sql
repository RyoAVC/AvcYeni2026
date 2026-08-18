CREATE TABLE `site_assets` (
	`kind` text PRIMARY KEY NOT NULL,
	`mime` text NOT NULL,
	`data` text NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
