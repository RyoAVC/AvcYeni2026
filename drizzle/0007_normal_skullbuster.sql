CREATE INDEX `idx_leads_interest_created_at` ON `leads` (`interest`,`created_at`);--> statement-breakpoint
PRAGMA optimize;
