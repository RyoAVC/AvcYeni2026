CREATE TABLE `lead_notes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`lead_id` integer NOT NULL,
	`content` text NOT NULL,
	`author_email` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`lead_id`) REFERENCES `leads`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_lead_notes_lead_created_at` ON `lead_notes` (`lead_id`,`created_at`);
--> statement-breakpoint
PRAGMA optimize;
