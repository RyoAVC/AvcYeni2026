CREATE INDEX `idx_leads_status_created_at` ON `leads` (`status`,`created_at`);
--> statement-breakpoint
PRAGMA optimize;
