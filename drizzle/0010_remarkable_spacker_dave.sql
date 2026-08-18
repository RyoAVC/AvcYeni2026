ALTER TABLE `leads` ADD `phone_normalized` text DEFAULT '' NOT NULL;--> statement-breakpoint
UPDATE `leads`
SET `phone_normalized` = replace(replace(replace(replace(replace(replace(replace(replace(`phone`, ' ', ''), '+', ''), '-', ''), '(', ''), ')', ''), '.', ''), '/', ''), char(9), '');--> statement-breakpoint
UPDATE `leads`
SET `phone_normalized` = CASE
	WHEN substr(`phone_normalized`, 1, 2) = '00' THEN substr(`phone_normalized`, 3)
	WHEN length(`phone_normalized`) = 11 AND substr(`phone_normalized`, 1, 1) = '0' THEN '90' || substr(`phone_normalized`, 2)
	WHEN length(`phone_normalized`) = 10 AND substr(`phone_normalized`, 1, 1) = '5' THEN '90' || `phone_normalized`
	ELSE `phone_normalized`
END;--> statement-breakpoint
CREATE INDEX `idx_leads_phone_normalized_created_at` ON `leads` (`phone_normalized`,`created_at`);--> statement-breakpoint
PRAGMA optimize;
