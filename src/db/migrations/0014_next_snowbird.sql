CREATE TABLE `whos` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`label` varchar(255) NOT NULL,
	`company_id` bigint unsigned NOT NULL,
	CONSTRAINT `whos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `whos` ADD CONSTRAINT `whos_company_id_companies_id_fk` FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE no action ON UPDATE no action;