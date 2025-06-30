ALTER TABLE `kpi_goals` MODIFY COLUMN `created_at` timestamp(2) NOT NULL DEFAULT (now());--> statement-breakpoint
ALTER TABLE `kpi_goals` MODIFY COLUMN `goal` json NOT NULL;--> statement-breakpoint
ALTER TABLE `kpi_goals` MODIFY COLUMN `type` enum('success_to_fail','fail_to_success') NOT NULL;