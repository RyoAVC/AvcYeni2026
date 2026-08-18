CREATE INDEX `idx_leads_source_created_at` ON `leads` (`source`,`created_at`);--> statement-breakpoint
PRAGMA optimize;
