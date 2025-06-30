CREATE TABLE `five_whys` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`date` timestamp(2) NOT NULL,
	`what` varchar(255),
	`where_id` bigint unsigned NOT NULL,
	`why_id` bigint unsigned NOT NULL,
	`area_id` bigint unsigned NOT NULL,
	`company_id` bigint unsigned NOT NULL,
	CONSTRAINT `five_whys_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `wheres` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`label` varchar(255),
	`company_id` bigint unsigned NOT NULL,
	CONSTRAINT `wheres_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `whys` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`label` varchar(255),
	`company_id` bigint unsigned NOT NULL,
	CONSTRAINT `whys_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `five_whys` ADD CONSTRAINT `five_whys_where_id_wheres_id_fk` FOREIGN KEY (`where_id`) REFERENCES `wheres`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `five_whys` ADD CONSTRAINT `five_whys_why_id_whys_id_fk` FOREIGN KEY (`why_id`) REFERENCES `whys`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `five_whys` ADD CONSTRAINT `five_whys_area_id_areas_id_fk` FOREIGN KEY (`area_id`) REFERENCES `areas`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `five_whys` ADD CONSTRAINT `five_whys_company_id_companies_id_fk` FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `wheres` ADD CONSTRAINT `wheres_company_id_companies_id_fk` FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `whys` ADD CONSTRAINT `whys_company_id_companies_id_fk` FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE no action ON UPDATE no action;