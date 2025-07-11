import { InferSelectModel } from "drizzle-orm";
import {
  sqliteTable,
  text,
  integer,
  foreignKey,
  unique,
} from "drizzle-orm/sqlite-core";
import { v4 } from "uuid";

export const user = sqliteTable("User", {
  id: text("id").notNull().primaryKey().$defaultFn(v4),
  email: text("email").notNull(),
  password: text("password"),
  externalId: text("externalId"),
});

export type User = InferSelectModel<typeof user>;

//TODO: change to recordId
export const record = sqliteTable(
  "Record",
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
        name: "Record_userId_User_id_fk",
      }),
    };
  }
);

export type Record = InferSelectModel<typeof record>;

export const webhook = sqliteTable(
  "Webhook",
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
      WebhookUserIdUserIdFk: foreignKey({
        columns: [table.userId],
        foreignColumns: [user.id],
        name: "Activity_userId_User_id_fk",
      }),
      WebhookSyncIdFk: foreignKey({
        columns: [table.syncId],
        foreignColumns: [syncPipeline.syncId],
        name: "Activity_SyncId_SyncPipeline_syncId_fk"
      }),
    };
  }
);

export type Webhook = InferSelectModel<typeof webhook>;

export const syncPipeline = sqliteTable(
  "SyncPipeline",
  {
    id: text("id").notNull().primaryKey().$defaultFn(v4),
    syncId: text("syncId").notNull().unique(),
    source: text("source").notNull(),
    lastSynced: integer("lastSynced", { mode: "timestamp" }).notNull(),
    status: text("status").notNull(),
    data: text("data", { mode: "json" }),
    userId: text("userId").notNull(),
    config: text("config", { mode: "json" }),
    recordCount: integer("recordCount"),
  },
  (table) => {
    return {
      SyncPipelineUserIdUserIdFk: foreignKey({
        columns: [table.userId],
        foreignColumns: [user.id],
        name: "SyncPipeline_userId_user_id_fk",
      }),
    }
  }
);

export type SyncPipeline = InferSelectModel<typeof syncPipeline>;
