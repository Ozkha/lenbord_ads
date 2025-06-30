CREATE TABLE `areas` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`board_id` bigint unsigned NOT NULL,
	`company_id` bigint unsigned NOT NULL,
	`kpi_id` bigint unsigned,
	CONSTRAINT `areas_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `kpi` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`name` varchar(150) NOT NULL,
	`metric` varchar(300) NOT NULL,
	`fields` json NOT NULL,
	`company_id` bigint unsigned NOT NULL,
	CONSTRAINT `kpi_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `areas` ADD CONSTRAINT `areas_board_id_boards_id_fk` FOREIGN KEY (`board_id`) REFERENCES `boards`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `areas` ADD CONSTRAINT `areas_company_id_companies_id_fk` FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `areas` ADD CONSTRAINT `areas_kpi_id_kpi_id_fk` FOREIGN KEY (`kpi_id`) REFERENCES `kpi`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `kpi` ADD CONSTRAINT `kpi_company_id_companies_id_fk` FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE no action ON UPDATE no action;