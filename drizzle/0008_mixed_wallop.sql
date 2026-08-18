ALTER TABLE `lead_notes` ADD `request_key` text;--> statement-breakpoint
CREATE UNIQUE INDEX `idx_lead_notes_request_key` ON `lead_notes` (`request_key`);--> statement-breakpoint
PRAGMA optimize;
