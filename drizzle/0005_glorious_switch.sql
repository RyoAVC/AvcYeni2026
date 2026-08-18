ALTER TABLE `leads` ADD `source` text DEFAULT 'direct' NOT NULL;--> statement-breakpoint
ALTER TABLE `leads` ADD `utm_source` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `leads` ADD `utm_medium` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `leads` ADD `utm_campaign` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `leads` ADD `referrer_host` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `leads` ADD `landing_path` text DEFAULT '' NOT NULL;--> statement-breakpoint
PRAGMA optimize;
