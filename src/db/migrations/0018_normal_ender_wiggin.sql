CREATE TABLE `user_board_responsability` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`user_id` bigint unsigned NOT NULL,
	`board_id` bigint unsigned NOT NULL,
	CONSTRAINT `user_board_responsability_id` PRIMARY KEY(`id`),
	CONSTRAINT `user_board_responsability_user_id_board_id_unique` UNIQUE(`user_id`,`board_id`)
);
--> statement-breakpoint
ALTER TABLE `five_whys` DROP FOREIGN KEY `five_whys_who_id_whys_id_fk`;
--> statement-breakpoint
ALTER TABLE `five_whys` ADD CONSTRAINT `five_whys_who_id_whos_id_fk` FOREIGN KEY (`who_id`) REFERENCES `whos`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `user_board_responsability` ADD CONSTRAINT `user_board_responsability_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `user_board_responsability` ADD CONSTRAINT `user_board_responsability_board_id_boards_id_fk` FOREIGN KEY (`board_id`) REFERENCES `boards`(`id`) ON DELETE no action ON UPDATE no action;