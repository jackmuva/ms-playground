ALTER TABLE `SyncedObject` RENAME TO `Record`;--> statement-breakpoint
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
PRAGMA foreign_keys=ON;