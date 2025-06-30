CREATE TABLE `kpi_tracking` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`date` timestamp(2) NOT NULL,
	`area_id` bigint unsigned NOT NULL,
	`kpi_id` bigint unsigned NOT NULL,
	`kpigoal_id` bigint unsigned NOT NULL,
	`status` enum('disabled','empty','success','fail','mid'),
	`value` bigint,
	`values` json NOT NULL,
	`company_id` bigint unsigned NOT NULL,
	CONSTRAINT `kpi_tracking_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `kpi_tracking` ADD CONSTRAINT `kpi_tracking_area_id_areas_id_fk` FOREIGN KEY (`area_id`) REFERENCES `areas`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `kpi_tracking` ADD CONSTRAINT `kpi_tracking_kpi_id_kpi_id_fk` FOREIGN KEY (`kpi_id`) REFERENCES `kpi`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `kpi_tracking` ADD CONSTRAINT `kpi_tracking_kpigoal_id_kpi_goals_id_fk` FOREIGN KEY (`kpigoal_id`) REFERENCES `kpi_goals`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `kpi_tracking` ADD CONSTRAINT `kpi_tracking_company_id_companies_id_fk` FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE no action ON UPDATE no action;