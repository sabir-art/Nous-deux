CREATE TABLE `entries` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`kind` text NOT NULL,
	`title` text NOT NULL,
	`cents` integer NOT NULL,
	`member` integer NOT NULL,
	`category` text NOT NULL,
	`date` text NOT NULL,
	`note` text NOT NULL,
	`created_at` text NOT NULL,
	`version` integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE INDEX `entries_user_idx` ON `entries` (`user_id`);--> statement-breakpoint
CREATE TABLE `households` (
	`user_id` text PRIMARY KEY NOT NULL,
	`first` text NOT NULL,
	`second` text NOT NULL,
	`name` text NOT NULL,
	`budget` integer DEFAULT 0 NOT NULL,
	`version` integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `items` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`kind` text NOT NULL,
	`title` text NOT NULL,
	`quantity` text NOT NULL,
	`assignee` integer DEFAULT -1 NOT NULL,
	`due` text NOT NULL,
	`priority` integer DEFAULT 0 NOT NULL,
	`done` integer DEFAULT false NOT NULL,
	`created_at` text NOT NULL,
	`version` integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE INDEX `items_user_idx` ON `items` (`user_id`);