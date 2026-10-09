CREATE TABLE `house_access` (
	`id` integer PRIMARY KEY NOT NULL,
	`salt` text NOT NULL,
	`password_hash` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `house_login_limits` (
	`key` text PRIMARY KEY NOT NULL,
	`attempts` integer NOT NULL,
	`expires_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `house_sessions` (
	`token_hash` text PRIMARY KEY NOT NULL,
	`expires_at` integer NOT NULL
);
