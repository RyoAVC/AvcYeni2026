CREATE TABLE IF NOT EXISTS `commerce_install_jobs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`job_id` text NOT NULL,
	`license_id` integer NOT NULL,
	`customer_id` integer NOT NULL,
	`store_key` text NOT NULL,
	`installation_id` text NOT NULL,
	`target_domain` text NOT NULL,
	`environment` text DEFAULT 'production' NOT NULL,
	`status` text DEFAULT 'queued' NOT NULL,
	`current_step` text DEFAULT 'enrollment' NOT NULL,
	`enrollment_token_hash` text NOT NULL,
	`enrollment_expires_at` text NOT NULL,
	`agent_id` text DEFAULT '' NOT NULL,
	`agent_version` text DEFAULT '' NOT NULL,
	`safe_summary` text DEFAULT '' NOT NULL,
	`artifact_json` text DEFAULT '{}' NOT NULL,
	`claimed_at` text DEFAULT '' NOT NULL,
	`completed_at` text DEFAULT '' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS `idx_commerce_install_jobs_job_id` ON `commerce_install_jobs` (`job_id`);
CREATE UNIQUE INDEX IF NOT EXISTS `idx_commerce_install_jobs_enrollment_hash` ON `commerce_install_jobs` (`enrollment_token_hash`);
CREATE INDEX IF NOT EXISTS `idx_commerce_install_jobs_license_status` ON `commerce_install_jobs` (`license_id`,`status`);
CREATE TABLE IF NOT EXISTS `commerce_install_job_events` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`job_id` text NOT NULL,
	`status` text NOT NULL,
	`step` text NOT NULL,
	`safe_code` text DEFAULT '' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
CREATE INDEX IF NOT EXISTS `idx_commerce_install_job_events_job` ON `commerce_install_job_events` (`job_id`,`created_at`);
