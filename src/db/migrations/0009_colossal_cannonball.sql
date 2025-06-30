ALTER TABLE `areas` MODIFY COLUMN `kpi_id` bigint unsigned NOT NULL;--> statement-breakpoint
ALTER TABLE `areas` DROP COLUMN `name`;