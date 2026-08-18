ALTER TABLE `customers` ADD `domain_name` text DEFAULT '' NOT NULL;
--> statement-breakpoint
ALTER TABLE `customers` ADD `domain_expires_at` text DEFAULT '' NOT NULL;
--> statement-breakpoint
ALTER TABLE `customers` ADD `hosting_expires_at` text DEFAULT '' NOT NULL;
