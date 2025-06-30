CREATE TABLE `boards` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`company_id` bigint unsigned NOT NULL,
	CONSTRAINT `boards_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `boards` ADD CONSTRAINT `boards_company_id_companies_id_fk` FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE no action ON UPDATE no action;