import { Message } from "ai";
import { InferSelectModel } from "drizzle-orm";
import {
  sqliteTable,
  text,
  integer,
  foreignKey,
} from "drizzle-orm/sqlite-core";
import { v4 } from "uuid";

export const user = sqliteTable("User", {
  id: text("id").notNull().primaryKey().$defaultFn(v4),
  email: text("email").notNull(),
  password: text("password"),
  externalId: text("externalId"),
});

export type User = InferSelectModel<typeof user>;

export const chat = sqliteTable(
  "Chat",
  {
    id: text("id").notNull().primaryKey().$defaultFn(v4),
    createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
    messages: text("messages", { mode: "json" }).$type<Message[]>().notNull(),
    userId: text("userId").notNull(),
    systemPrompt: text("systemPrompt").notNull(),
    tools: text("tools", { mode: "json" }).notNull(),
    modelName: text("modelName").notNull(),
    modelProvider: text("modelProvider").notNull(),
  },
  (table) => {
    return {
      // For foreign keys in SQLite, the recommended Drizzle approach:
      chatUserIdUserIdFk: foreignKey({
        columns: [table.userId],
        foreignColumns: [user.id],
        name: "Chat_userId_User_id_fk",
      }),
    };
  }
);

export type Chat = InferSelectModel<typeof chat>;

export const syncedObject = sqliteTable(
  "SyncedObject",
  {
    id: text("id").notNull().primaryKey().$defaultFn(v4),
    syncObjectId: text("syncObjectId").notNull(),
    externalId: text("externalId").notNull(),
    createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
    updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull(),
    source: text("source").notNull(),
    data: text("data", { mode: "json" }).notNull(),
    userId: text("userId").notNull(),
  },
  (table) => {
    return {
      SyncedObjectUserIdUserIdFk: foreignKey({
        columns: [table.userId],
        foreignColumns: [user.id],
        name: "SyncedObject_userId_User_id_fk",
      }),
    };
  }
);

export type SyncedObject = InferSelectModel<typeof syncedObject>;

export const activity = sqliteTable(
  "Activity",
  {
    id: text("id").notNull().primaryKey().$defaultFn(v4),
    syncId: text("syncId"),
    event: text("event").notNull(),
    source: text("source").notNull(),
    receivedAt: integer("receivedAt", { mode: "timestamp" }).notNull(),
    data: text("data", { mode: "json" }).notNull(),
    userId: text("userId").notNull(),
  },
  (table) => {
    return {
      ActivityUserIdUserIdFk: foreignKey({
        columns: [table.userId],
        foreignColumns: [user.id],
        name: "Activity_userId_User_id_fk",
      }),
    };
  }
);

export type Activity = InferSelectModel<typeof activity>;
