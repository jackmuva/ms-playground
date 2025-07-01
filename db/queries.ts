"server-only";

import { createClient } from "@libsql/client";
import { genSaltSync, hashSync } from "bcrypt-ts";
import { desc, eq, and } from "drizzle-orm";
import { drizzle } from "drizzle-orm/libsql";
require('dotenv').config();

import { user, chat, User, SyncedObject, syncedObject, activity, Activity } from "./schema";

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

export async function saveChat({
  id,
  messages,
  email,
  systemPrompt,
  tools = [],
  modelName,
  modelProvider,
}: {
  id: string;
  messages: any;
  email: string;
  systemPrompt: string;
  tools: { name: string }[];
  modelName: string;
  modelProvider: string;
}) {
  try {
    const selectedChats = await db.select().from(chat).where(eq(chat.id, id));
    let user = await getUser(email);
    if (!user || user.length === 0) {
      if (email === STATIC_USER.email && process.env.ENABLE_AUTH === "false") {
        await createUser(email, "static-user-password", STATIC_USER.id);
        user = await getUser(email);
      } else {
        throw new Error("Could not find user");
      }
    }

    if (selectedChats.length > 0) {
      return await db
        .update(chat)
        .set({
          messages,
          systemPrompt,
          tools: tools.map((tool) => tool.name),
          modelName,
          modelProvider,
        })
        .where(eq(chat.id, id));
    }

    return await db.insert(chat).values({
      id,
      createdAt: new Date(),
      messages,
      userId: user[0].id,
      modelName,
      modelProvider,
      systemPrompt,
      tools: tools.map((tool) => tool.name),
    });
  } catch (error) {
    console.error("Failed to save chat in database", error);
    throw error;
  }
}

export async function deleteChatById({ id }: { id: string }) {
  try {
    return await db.delete(chat).where(eq(chat.id, id));
  } catch (error) {
    console.error("Failed to delete chat by id from database");
    throw error;
  }
}

export async function getChatsByUserId({ id }: { id: string }) {
  try {
    return await db
      .select()
      .from(chat)
      .where(eq(chat.userId, id))
      .orderBy(desc(chat.createdAt));
  } catch (error) {
    console.error("Failed to get chats by user from database");
    throw error;
  }
}

export async function getChatById({ id }: { id: string }) {
  try {
    const [selectedChat] = await db.select().from(chat).where(eq(chat.id, id));
    return selectedChat;
  } catch (error) {
    console.error("Failed to get chat by id from database");
    throw error;
  }
}

export async function getSyncedObjectByUserIdAndSource({ id, source }: { id: string, source: string }): Promise<Array<SyncedObject>> {
  try {
    return await db.select().from(syncedObject).where(and(eq(syncedObject.userId, id), eq(syncedObject.source, source)));
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
    return await db.insert(syncedObject).values({
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

