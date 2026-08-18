CREATE TABLE `lead_activities` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`lead_id` integer NOT NULL,
	`action` text DEFAULT 'status_changed' NOT NULL,
	`from_status` text NOT NULL,
	`to_status` text NOT NULL,
	`actor_email` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`lead_id`) REFERENCES `leads`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_lead_activities_lead_created_at` ON `lead_activities` (`lead_id`,`created_at`);
--> statement-breakpoint
PRAGMA optimize;
