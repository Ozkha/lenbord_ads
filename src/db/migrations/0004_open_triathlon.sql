CREATE TABLE `kpi_goals` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`json` json,
	`type` enum('success_to_fail','fail_to_success'),
	CONSTRAINT `kpi_goals_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `kpi` ADD `goal_id` bigint unsigned NOT NULL;--> statement-breakpoint
ALTER TABLE `kpi` ADD CONSTRAINT `kpi_goal_id_kpi_goals_id_fk` FOREIGN KEY (`goal_id`) REFERENCES `kpi_goals`(`id`) ON DELETE no action ON UPDATE no action;