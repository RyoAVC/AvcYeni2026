ALTER TABLE `commerce_license_installations` ADD `billing_cycle` text DEFAULT 'annual' NOT NULL;
--> statement-breakpoint
ALTER TABLE `commerce_license_installations` ADD `billing_amount` text DEFAULT '' NOT NULL;
--> statement-breakpoint
ALTER TABLE `commerce_license_installations` ADD `payment_status` text DEFAULT 'pending' NOT NULL;
--> statement-breakpoint
ALTER TABLE `commerce_license_installations` ADD `next_payment_at` text DEFAULT '' NOT NULL;
--> statement-breakpoint
ALTER TABLE `commerce_license_installations` ADD `penalty_status` text DEFAULT 'none' NOT NULL;
--> statement-breakpoint
ALTER TABLE `commerce_license_installations` ADD `penalty_note` text DEFAULT '' NOT NULL;
--> statement-breakpoint
ALTER TABLE `commerce_license_installations` ADD `suspension_reason` text DEFAULT '' NOT NULL;
