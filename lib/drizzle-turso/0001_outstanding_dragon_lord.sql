ALTER TABLE `SyncedObject` RENAME TO `Record`;--> statement-breakpoint
ALTER TABLE `Activity` RENAME TO `Webhook`;--> statement-breakpoint
CREATE TABLE `SyncPipeline` (
	`id` text PRIMARY KEY NOT NULL,
	`syncId` text NOT NULL,
	`source` text NOT NULL,
	`lastSynced` integer NOT NULL,
	`status` text NOT NULL,
	`data` text,
	`userId` text NOT NULL,
	`config` text,
	`recordCount` integer,
	FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `SyncPipeline_syncId_unique` ON `SyncPipeline` (`syncId`);--> statement-breakpoint
DROP TABLE `Chat`;--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_Record` (
	`id` text PRIMARY KEY NOT NULL,
	`syncObjectId` text NOT NULL,
	`externalId` text NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	`source` text NOT NULL,
	`data` text NOT NULL,
	`userId` text NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_Record`("id", "syncObjectId", "externalId", "createdAt", "updatedAt", "source", "data", "userId") SELECT "id", "syncObjectId", "externalId", "createdAt", "updatedAt", "source", "data", "userId" FROM `Record`;--> statement-breakpoint
DROP TABLE `Record`;--> statement-breakpoint
ALTER TABLE `__new_Record` RENAME TO `Record`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE TABLE `__new_Webhook` (
	`id` text PRIMARY KEY NOT NULL,
	`syncId` text,
	`event` text NOT NULL,
	`source` text NOT NULL,
	`receivedAt` integer NOT NULL,
	`data` text NOT NULL,
	`userId` text NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`syncId`) REFERENCES `SyncPipeline`(`syncId`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_Webhook`("id", "syncId", "event", "source", "receivedAt", "data", "userId") SELECT "id", "syncId", "event", "source", "receivedAt", "data", "userId" FROM `Webhook`;--> statement-breakpoint
DROP TABLE `Webhook`;--> statement-breakpoint
ALTER TABLE `__new_Webhook` RENAME TO `Webhook`;