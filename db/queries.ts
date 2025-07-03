"server-only";

import { createClient } from "@libsql/client";
import { genSaltSync, hashSync } from "bcrypt-ts";
import { desc, eq, and, max, inArray } from "drizzle-orm";
import { drizzle } from "drizzle-orm/libsql";
require('dotenv').config();

import { user, User, Record, record, activity, Activity, syncPipeline } from "./schema";

let db = drizzle(
  createClient({
    url: process.env.TURSO_DATABASE_URL ?? "libsql://no-database",
    authToken: process.env.TURSO_AUTH_TOKEN ?? "",
  })
)
if (process.env.LOCAL_DB === 'true') {
  db = drizzle(
    createClient({
      url: "file:./db.sqlite",
    })
  );
}

export const STATIC_USER = {
  id: "playground.local-static-user",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  email: "static-user@actionkit.playground",
  firstName: "Test",
  lastName: "User",
  emailVerified: true,
  profilePictureUrl: null,
  object: "user",
};

// Optionally, if not using email/pass login, you can
// use the Drizzle adapter for Auth.js / NextAuth
// https://authjs.dev/reference/adapter/drizzle

export async function getUser(email: string): Promise<Array<User>> {
  try {
    return await db.select().from(user).where(eq(user.email, email));
  } catch (error) {
    console.error("Failed to get user from database", error);
    throw error;
  }
}

export async function createUser(
  email: string,
  password: string,
  externalId?: string
) {
  let salt = genSaltSync(10);
  let hash = hashSync(password, salt);

  try {
    return await db.insert(user).values({ email, password: hash, externalId });
  } catch (error) {
    console.error("Failed to create user in database");
    throw error;
  }
}

export async function getSyncedObjectByUserIdAndSource({ id, source }: { id: string, source: string }): Promise<Array<Record>> {
  try {
    return await db.select().from(record).where(and(eq(record.userId, id), eq(record.source, source)));
  } catch (error) {
    console.error("Failed to get user's synced objects from database", error);
    throw error;
  }
}

export async function createSyncedObject({
  syncObjectId,
  externalId,
  createdAt,
  updatedAt,
  userId,
  data,
  source
}: {
  syncObjectId: string,
  externalId: string,
  createdAt: Date,
  updatedAt: Date,
  userId: string,
  data: string,
  source: string
}) {
  try {
    return await db.insert(record).values({
      syncObjectId: syncObjectId,
      externalId: externalId,
      createdAt: createdAt,
      updatedAt: updatedAt,
      userId: userId,
      data: data,
      source: source
    });
  } catch (error) {
    console.error("Failed to create/update synced object in database: ", error);
    throw error;
  }
}

export async function getActivityByUserIdAndSource({ id, source }: { id: string, source: string }): Promise<Array<Activity>> {
  try {
    return await db.select().from(activity).where(and(eq(activity.source, source), eq(activity.userId, id)));
  } catch (error) {
    console.error("Failed to get user's activity from database", error);
    throw error;
  }
}

export async function getSyncTriggerByUserIdAndSource({ id, source }: { id: string, source: string }): Promise<Array<Activity>> {
  try {
    return await db.select().from(activity)
      .where(and(
        eq(activity.event, "sync_triggered"),
        eq(activity.source, source),
        eq(activity.userId, id)))
      .orderBy(desc(activity.receivedAt))
      .limit(1);
  } catch (error) {
    console.error("Failed to get trigger activity from database", error);
    throw error;
  }
}


export async function createActivity({
  event,
  source,
  receivedAt,
  data,
  userId,
}: {
  event: string,
  source: string,
  receivedAt: Date,
  data: string,
  userId: string,
}) {
  try {
    return await db.insert(activity).values({
      event: event,
      source: source,
      receivedAt: receivedAt,
      data: data,
      userId: userId
    });
  } catch (error) {
    console.error("Failed to create activity in database");
    throw error;
  }
}

export async function createSyncTrigger({
  syncId,
  integration,
  receivedAt,
  data,
  userId,
}: {
  syncId: string,
  integration: string,
  receivedAt: Date,
  data: string,
  userId: string,
}) {
  try {
    return await db.insert(activity).values({
      syncId: syncId,
      event: "sync_triggered",
      source: integration,
      receivedAt: receivedAt,
      data: data,
      userId: userId
    });
  } catch (error) {
    console.error("Failed to create activity in database");
    throw error;
  }
}

export async function getAllSyncs({ userId }: { userId: string }) {
  try {
    return await db.select().from(syncPipeline).where(eq(syncPipeline.userId, userId));
  } catch (error) {
    console.error("Failed to retrieve syncs");
    throw error;
  }
}

export async function getSyncBySource({ userId, source }: { userId: string, source: string }) {
  try {
    return await db.select().from(syncPipeline).where(and(
      eq(syncPipeline.userId, userId),
      eq(syncPipeline.source, source))).limit(1);
  } catch (error) {
    console.error("Failed to retrieve syncs");
    throw error;
  }
}

export async function upsertSyncPipeline({
  syncId,
  source,
  lastSynced,
  status,
  userId,
  data,
  config,
  recordCount,
}: {
  syncId: string,
  source: string,
  lastSynced: Date,
  status: string,
  userId: string,
  data: string,
  config: string,
  recordCount: number,
}) {
  try {
    const pipeline = await db.select().from(syncPipeline).where(eq(syncPipeline.syncId, syncId));
    if (pipeline.length > 0) {
      return await db.update(syncPipeline).set({
        lastSynced: lastSynced,
        status: status,
        data: data,
        recordCount: recordCount,
        config: config,
      }).where(eq(syncPipeline.syncId, syncId));
    } else {
      return await db.insert(syncPipeline).values({
        syncId: syncId,
        source: source,
        lastSynced: lastSynced,
        status: status,
        userId: userId,
        data: data,
        config: config,
        recordCount: 0
      });
    }
  } catch (error) {
    console.error("failed to create pipeline record");
    throw error;
  }
}

export async function updateSyncStatus({
  syncId,
  data,
  recordCount,
  status,
  lastSynced,
}: {
  syncId: string,
  data: string,
  recordCount: number,
  status: string,
  lastSynced: Date,
}) {
  try {
    return await db.update(syncPipeline).set({
      syncId: syncId,
      data: data,
      recordCount: recordCount,
      status: status,
      lastSynced: lastSynced,
    }).where(eq(syncPipeline.syncId, syncId));
  } catch (error) {
    console.error("failed to update sync status");
    throw error;
  }
}
