CREATE TABLE `admin_login_attempts` (
	`attempt_key` text PRIMARY KEY NOT NULL,
	`fail_count` integer DEFAULT 0 NOT NULL,
	`window_start` text NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
