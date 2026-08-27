ALTER TABLE `modules` ADD `runtime` text DEFAULT 'node' NOT NULL;
--> statement-breakpoint
ALTER TABLE `modules` ADD `version` text DEFAULT '1.0.0' NOT NULL;
--> statement-breakpoint
ALTER TABLE `modules` ADD `package_url` text DEFAULT '' NOT NULL;
--> statement-breakpoint
ALTER TABLE `modules` ADD `package_checksum` text DEFAULT '' NOT NULL;
--> statement-breakpoint
ALTER TABLE `modules` ADD `entrypoint` text DEFAULT '' NOT NULL;
--> statement-breakpoint
ALTER TABLE `modules` ADD `manifest_json` text DEFAULT '{}' NOT NULL;
--> statement-breakpoint
ALTER TABLE `modules` ADD `install_status` text DEFAULT 'not_installed' NOT NULL;
