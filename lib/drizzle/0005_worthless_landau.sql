PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_Activity` (
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
INSERT INTO `__new_Activity`("id", "syncId", "event", "source", "receivedAt", "data", "userId") SELECT "id", "syncId", "event", "source", "receivedAt", "data", "userId" FROM `Activity`;--> statement-breakpoint
DROP TABLE `Activity`;--> statement-breakpoint
ALTER TABLE `__new_Activity` RENAME TO `Activity`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `SyncPipeline_syncId_unique` ON `SyncPipeline` (`syncId`);