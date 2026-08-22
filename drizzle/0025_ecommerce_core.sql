CREATE TABLE `categories` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`parent_id` integer,
	`description` text DEFAULT '' NOT NULL,
	`image_url` text DEFAULT '' NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`seo_title` text DEFAULT '' NOT NULL,
	`seo_description` text DEFAULT '' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_categories_slug` ON `categories` (`slug`);
--> statement-breakpoint
CREATE INDEX `idx_categories_parent` ON `categories` (`parent_id`);
--> statement-breakpoint
CREATE INDEX `idx_categories_status_sort` ON `categories` (`status`,`sort_order`);
--> statement-breakpoint
CREATE TABLE `brands` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`logo_url` text DEFAULT '' NOT NULL,
	`website` text DEFAULT '' NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_brands_slug` ON `brands` (`slug`);
--> statement-breakpoint
CREATE INDEX `idx_brands_status_sort` ON `brands` (`status`,`sort_order`);
--> statement-breakpoint
CREATE TABLE `products` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`sku` text DEFAULT '' NOT NULL,
	`barcode` text DEFAULT '' NOT NULL,
	`category_id` integer,
	`brand_id` integer,
	`short_description` text DEFAULT '' NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`price` integer DEFAULT 0 NOT NULL,
	`discounted_price` integer,
	`cost_price` integer DEFAULT 0 NOT NULL,
	`vat_rate` integer DEFAULT 20 NOT NULL,
	`stock` integer DEFAULT 0 NOT NULL,
	`critical_stock` integer DEFAULT 5 NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`is_featured` integer DEFAULT 0 NOT NULL,
	`images` text DEFAULT '[]' NOT NULL,
	`variants` text DEFAULT '[]' NOT NULL,
	`seo_title` text DEFAULT '' NOT NULL,
	`seo_description` text DEFAULT '' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_products_slug` ON `products` (`slug`);
--> statement-breakpoint
CREATE INDEX `idx_products_sku` ON `products` (`sku`);
--> statement-breakpoint
CREATE INDEX `idx_products_category` ON `products` (`category_id`);
--> statement-breakpoint
CREATE INDEX `idx_products_brand` ON `products` (`brand_id`);
--> statement-breakpoint
CREATE INDEX `idx_products_status_featured` ON `products` (`status`,`is_featured`);
--> statement-breakpoint
CREATE INDEX `idx_products_stock` ON `products` (`stock`);
--> statement-breakpoint
CREATE TABLE `campaigns` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`type` text DEFAULT 'percentage' NOT NULL,
	`discount_value` integer DEFAULT 0 NOT NULL,
	`min_spend` integer DEFAULT 0 NOT NULL,
	`target_type` text DEFAULT 'all' NOT NULL,
	`target_id` integer,
	`status` text DEFAULT 'active' NOT NULL,
	`starts_at` text DEFAULT '' NOT NULL,
	`ends_at` text DEFAULT '' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_campaigns_status` ON `campaigns` (`status`);
--> statement-breakpoint
CREATE INDEX `idx_campaigns_type` ON `campaigns` (`type`);
--> statement-breakpoint
CREATE TABLE `coupons` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`code` text NOT NULL,
	`type` text DEFAULT 'percentage' NOT NULL,
	`discount_value` integer DEFAULT 0 NOT NULL,
	`min_spend` integer DEFAULT 0 NOT NULL,
	`max_discount` integer DEFAULT 0 NOT NULL,
	`usage_limit` integer DEFAULT 100 NOT NULL,
	`used_count` integer DEFAULT 0 NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`starts_at` text DEFAULT '' NOT NULL,
	`ends_at` text DEFAULT '' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_coupons_code` ON `coupons` (`code`);
--> statement-breakpoint
CREATE INDEX `idx_coupons_status` ON `coupons` (`status`);
--> statement-breakpoint
CREATE TABLE `audit_logs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_email` text NOT NULL,
	`action` text NOT NULL,
	`entity` text NOT NULL,
	`entity_id` text DEFAULT '' NOT NULL,
	`details` text DEFAULT '' NOT NULL,
	`ip_address` text DEFAULT '' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_audit_logs_user` ON `audit_logs` (`user_email`,`created_at`);
--> statement-breakpoint
CREATE INDEX `idx_audit_logs_entity` ON `audit_logs` (`entity`,`entity_id`);
--> statement-breakpoint
CREATE INDEX `idx_audit_logs_created_at` ON `audit_logs` (`created_at`);
--> statement-breakpoint
CREATE TABLE `integrations` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`provider_key` text NOT NULL,
	`category` text NOT NULL,
	`name` text NOT NULL,
	`status` text DEFAULT 'passive' NOT NULL,
	`config` text DEFAULT '{}' NOT NULL,
	`last_sync_at` text DEFAULT '' NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_integrations_provider_key` ON `integrations` (`provider_key`);
--> statement-breakpoint
CREATE INDEX `idx_integrations_category_status` ON `integrations` (`category`,`status`);
