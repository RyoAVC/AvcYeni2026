ALTER TABLE `support_tickets` ADD `priority` text DEFAULT 'normal' NOT NULL;
--> statement-breakpoint
ALTER TABLE `support_tickets` ADD `first_responded_at` text DEFAULT '' NOT NULL;
--> statement-breakpoint
ALTER TABLE `support_tickets` ADD `closed_at` text DEFAULT '' NOT NULL;
--> statement-breakpoint
CREATE TABLE `customer_portal_profiles` (`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL, `customer_id` integer NOT NULL, `company_name` text DEFAULT '' NOT NULL, `logo_url` text DEFAULT '' NOT NULL, `monogram` text DEFAULT '' NOT NULL, `theme` text DEFAULT 'avci' NOT NULL, `color_mode` text DEFAULT 'day' NOT NULL, `ssl_warning_days` integer DEFAULT 30 NOT NULL, `tofy_click_threshold_bps` integer DEFAULT 1000 NOT NULL, `marketplace_setup_days` integer DEFAULT 7 NOT NULL, `onboarding_status` text DEFAULT 'not_started' NOT NULL, `onboarding_progress` integer DEFAULT 0 NOT NULL, `created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL, `updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_customer_portal_profiles_customer` ON `customer_portal_profiles` (`customer_id`);
--> statement-breakpoint
CREATE TABLE `customer_module_instances` (`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL, `customer_id` integer NOT NULL, `module_id` integer NOT NULL, `status` text DEFAULT 'planned' NOT NULL, `coverage` text DEFAULT '' NOT NULL, `enabled_at` text DEFAULT '' NOT NULL, `expires_at` text DEFAULT '' NOT NULL, `note` text DEFAULT '' NOT NULL, `created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL, `updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_customer_module_instances_unique` ON `customer_module_instances` (`customer_id`,`module_id`);
--> statement-breakpoint
CREATE INDEX `idx_customer_module_instances_status` ON `customer_module_instances` (`customer_id`,`status`);
--> statement-breakpoint
CREATE TABLE `customer_integration_instances` (`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL, `customer_id` integer NOT NULL, `integration_id` integer NOT NULL, `status` text DEFAULT 'planned' NOT NULL, `setup_progress` integer DEFAULT 0 NOT NULL, `health_score` integer DEFAULT 0 NOT NULL, `last_sync_at` text DEFAULT '' NOT NULL, `last_error_summary` text DEFAULT '' NOT NULL, `public_metadata` text DEFAULT '{}' NOT NULL, `created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL, `updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_customer_integration_instances_unique` ON `customer_integration_instances` (`customer_id`,`integration_id`);
--> statement-breakpoint
CREATE INDEX `idx_customer_integration_instances_status` ON `customer_integration_instances` (`customer_id`,`status`);
--> statement-breakpoint
CREATE TABLE `customer_metric_snapshots` (`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL, `customer_id` integer NOT NULL, `metric_key` text NOT NULL, `value` integer DEFAULT 0 NOT NULL, `unit` text DEFAULT 'count' NOT NULL, `source` text DEFAULT 'system' NOT NULL, `period_start` text DEFAULT '' NOT NULL, `period_end` text DEFAULT '' NOT NULL, `metadata` text DEFAULT '{}' NOT NULL, `created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL);
--> statement-breakpoint
CREATE INDEX `idx_customer_metric_snapshots_lookup` ON `customer_metric_snapshots` (`customer_id`,`metric_key`,`period_end`);
--> statement-breakpoint
CREATE TABLE `portal_notifications` (`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL, `customer_id` integer NOT NULL, `type` text DEFAULT 'info' NOT NULL, `title` text NOT NULL, `body` text DEFAULT '' NOT NULL, `priority` integer DEFAULT 0 NOT NULL, `target_section` text DEFAULT 'ozet' NOT NULL, `status` text DEFAULT 'active' NOT NULL, `source` text DEFAULT 'admin' NOT NULL, `visible_at` text DEFAULT '' NOT NULL, `expires_at` text DEFAULT '' NOT NULL, `created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL, `updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL);
--> statement-breakpoint
CREATE INDEX `idx_portal_notifications_visible` ON `portal_notifications` (`customer_id`,`status`,`visible_at`);
--> statement-breakpoint
CREATE TABLE `tofy_experiments` (`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL, `customer_id` integer NOT NULL, `name` text NOT NULL, `kind` text DEFAULT 'copy' NOT NULL, `status` text DEFAULT 'draft' NOT NULL, `control_label` text DEFAULT 'Kontrol' NOT NULL, `variant_label` text DEFAULT 'Varyant' NOT NULL, `result_summary` text DEFAULT '' NOT NULL, `starts_at` text DEFAULT '' NOT NULL, `ends_at` text DEFAULT '' NOT NULL, `created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL, `updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL);
--> statement-breakpoint
CREATE INDEX `idx_tofy_experiments_customer_status` ON `tofy_experiments` (`customer_id`,`status`);
--> statement-breakpoint
CREATE TABLE `customer_portal_documents` (`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL, `customer_id` integer NOT NULL, `title` text NOT NULL, `category` text DEFAULT 'document' NOT NULL, `url` text DEFAULT '' NOT NULL, `status` text DEFAULT 'active' NOT NULL, `created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL, `updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL);
--> statement-breakpoint
CREATE INDEX `idx_customer_portal_documents_customer` ON `customer_portal_documents` (`customer_id`,`status`);
