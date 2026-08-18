CREATE TABLE `__new_leads` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`phone` text NOT NULL,
	`company` text DEFAULT '' NOT NULL,
	`interest` text NOT NULL,
	`message` text DEFAULT '' NOT NULL,
	`status` text DEFAULT 'new' NOT NULL,
	`consent_at` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_leads` (`id`, `name`, `email`, `phone`, `company`, `interest`, `message`, `status`, `consent_at`, `created_at`, `updated_at`)
SELECT `id`, `name`, `email`, `phone`, `company`, `interest`, `message`, `status`, `consent_at`, `created_at`, `created_at` FROM `leads`;
--> statement-breakpoint
DROP TABLE `leads`;
--> statement-breakpoint
ALTER TABLE `__new_leads` RENAME TO `leads`;
--> statement-breakpoint
CREATE INDEX `idx_leads_email_created_at` ON `leads` (`email`,`created_at`);
--> statement-breakpoint
PRAGMA optimize;
