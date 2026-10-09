CREATE TABLE `appointments` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`title` text NOT NULL,
	`category` text NOT NULL,
	`person` integer NOT NULL,
	`status` text NOT NULL,
	`date` text NOT NULL,
	`time` text NOT NULL,
	`book_by` text NOT NULL,
	`location` text NOT NULL,
	`note` text NOT NULL,
	`created_at` text NOT NULL,
	`version` integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE INDEX `appointments_user_idx` ON `appointments` (`user_id`);