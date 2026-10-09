CREATE TABLE `activity` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`actor` integer NOT NULL,
	`category` text NOT NULL,
	`message` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `activity_user_idx` ON `activity` (`user_id`);--> statement-breakpoint
CREATE TABLE `calls` (
	`user_id` text PRIMARY KEY NOT NULL,
	`id` text NOT NULL,
	`caller` integer NOT NULL,
	`caller_device` text NOT NULL,
	`callee_device` text DEFAULT '' NOT NULL,
	`offer` text NOT NULL,
	`answer` text DEFAULT '' NOT NULL,
	`state` text NOT NULL,
	`expires_at` integer NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `devices` (
	`key` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`device_id` text NOT NULL,
	`member` integer NOT NULL,
	`subscription` text NOT NULL,
	`preferences` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `devices_user_idx` ON `devices` (`user_id`);