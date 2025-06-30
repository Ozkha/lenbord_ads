CREATE TABLE `tasks` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`title` varchar(1000) NOT NULL,
	`date` timestamp(2) NOT NULL,
	`userid_assigned` bigint unsigned NOT NULL,
	`assigned_by_userid` bigint unsigned NOT NULL,
	`cause_id` bigint unsigned NOT NULL,
	`status` enum('todo','inprogress','completed') DEFAULT 'todo',
	`board_id` bigint unsigned NOT NULL,
	`area_id` bigint unsigned NOT NULL,
	CONSTRAINT `tasks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `tasks` ADD CONSTRAINT `tasks_userid_assigned_users_id_fk` FOREIGN KEY (`userid_assigned`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `tasks` ADD CONSTRAINT `tasks_assigned_by_userid_users_id_fk` FOREIGN KEY (`assigned_by_userid`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `tasks` ADD CONSTRAINT `tasks_cause_id_whys_id_fk` FOREIGN KEY (`cause_id`) REFERENCES `whys`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `tasks` ADD CONSTRAINT `tasks_board_id_boards_id_fk` FOREIGN KEY (`board_id`) REFERENCES `boards`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `tasks` ADD CONSTRAINT `tasks_area_id_areas_id_fk` FOREIGN KEY (`area_id`) REFERENCES `areas`(`id`) ON DELETE no action ON UPDATE no action;