ALTER TABLE `packages` ADD `runtime` text DEFAULT 'node' NOT NULL;
--> statement-breakpoint
ALTER TABLE `packages` ADD `version` text DEFAULT '1.0.0' NOT NULL;
--> statement-breakpoint
ALTER TABLE `packages` ADD `package_url` text DEFAULT '' NOT NULL;
--> statement-breakpoint
ALTER TABLE `packages` ADD `package_checksum` text DEFAULT '' NOT NULL;
--> statement-breakpoint
ALTER TABLE `packages` ADD `entrypoint` text DEFAULT '' NOT NULL;
--> statement-breakpoint
ALTER TABLE `packages` ADD `manifest_json` text DEFAULT '{}' NOT NULL;
--> statement-breakpoint
ALTER TABLE `packages` ADD `install_status` text DEFAULT 'not_installed' NOT NULL;
