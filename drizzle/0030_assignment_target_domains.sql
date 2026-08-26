ALTER TABLE `customer_module_instances` ADD `target_domain` text DEFAULT '' NOT NULL;
--> statement-breakpoint
ALTER TABLE `customer_integration_instances` ADD `target_domain` text DEFAULT '' NOT NULL;
