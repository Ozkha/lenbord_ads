ALTER TABLE `kpi` DROP FOREIGN KEY `kpi_goal_id_kpi_goals_id_fk`;
--> statement-breakpoint
ALTER TABLE `kpi_goals` ADD `kpi_id` bigint unsigned NOT NULL;--> statement-breakpoint
ALTER TABLE `kpi_goals` ADD `created_at` datetime(2);--> statement-breakpoint
ALTER TABLE `kpi_goals` ADD CONSTRAINT `kpi_goals_kpi_id_kpi_id_fk` FOREIGN KEY (`kpi_id`) REFERENCES `kpi`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `kpi` DROP COLUMN `goal_id`;