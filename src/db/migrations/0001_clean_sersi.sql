CREATE TABLE `users` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`name` varchar(254),
	`username` varchar(50) NOT NULL,
	`password` varchar(254) NOT NULL,
	`user_roles` enum('worker','board_moderator','admin') NOT NULL,
	`user_status` enum('active','inactive') NOT NULL DEFAULT 'active',
	`company_id` bigint unsigned NOT NULL,
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_username_unique` UNIQUE(`username`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD CONSTRAINT `users_company_id_companies_id_fk` FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE no action ON UPDATE no action;