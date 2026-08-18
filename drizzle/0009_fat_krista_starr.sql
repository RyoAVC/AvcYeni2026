ALTER TABLE `leads` ADD `request_key` text;--> statement-breakpoint
CREATE UNIQUE INDEX `idx_leads_request_key` ON `leads` (`request_key`);--> statement-breakpoint
PRAGMA optimize;
