import { and, desc, eq, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, users,
  Character, InsertCharacter, characters,
  Chat, InsertChat, chats,
  Message, InsertMessage, messages,
  CharacterStar, InsertCharacterStar, characterStars,
  Follow, InsertFollow, follows
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Character queries
export async function getCharacters(filters?: {
  search?: string;
  tags?: string[];
  creatorId?: number;
  isPublic?: boolean;
  sortBy?: 'recent' | 'popular' | 'trending';
  limit?: number;
  offset?: number;
}) {
  const db = await getDb();
  if (!db) return [];

  const conditions = [];
  if (filters?.isPublic !== undefined) {
    conditions.push(eq(characters.isPublic, filters.isPublic ? 1 : 0));
  }
  if (filters?.creatorId) {
    conditions.push(eq(characters.creatorId, filters.creatorId));
  }

  let baseQuery = db.select().from(characters);
  
  if (conditions.length > 0) {
    baseQuery = baseQuery.where(conditions.length === 1 ? conditions[0] : and(...conditions) as any) as any;
  }

  let sortedQuery: any = baseQuery;
  if (filters?.sortBy === 'popular') {
    sortedQuery = baseQuery.orderBy(desc(characters.starCount));
  } else if (filters?.sortBy === 'trending') {
    sortedQuery = baseQuery.orderBy(desc(characters.chatCount));
  } else {
    sortedQuery = baseQuery.orderBy(desc(characters.createdAt));
  }

  if (filters?.limit) {
    sortedQuery = sortedQuery.limit(filters.limit);
  }
  if (filters?.offset) {
    sortedQuery = sortedQuery.offset(filters.offset);
  }

  return await sortedQuery;
}

export async function getCharacterById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(characters).where(eq(characters.id, id)).limit(1);
  return result[0];
}

export async function createCharacter(data: InsertCharacter) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(characters).values(data);
  return result[0].insertId;
}

export async function updateCharacter(id: number, data: Partial<InsertCharacter>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(characters).set(data).where(eq(characters.id, id));
}

export async function deleteCharacter(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(characters).where(eq(characters.id, id));
}

export async function incrementCharacterView(id: number) {
  const db = await getDb();
  if (!db) return;
  
  await db.update(characters)
    .set({ viewCount: sql`${characters.viewCount} + 1` })
    .where(eq(characters.id, id));
}

export async function incrementCharacterChat(id: number) {
  const db = await getDb();
  if (!db) return;
  
  await db.update(characters)
    .set({ chatCount: sql`${characters.chatCount} + 1` })
    .where(eq(characters.id, id));
}

export async function toggleCharacterStar(userId: number, characterId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const existing = await db.select()
    .from(characterStars)
    .where(and(eq(characterStars.userId, userId), eq(characterStars.characterId, characterId)))
    .limit(1);
  
  if (existing.length > 0) {
    await db.delete(characterStars)
      .where(and(eq(characterStars.userId, userId), eq(characterStars.characterId, characterId)));
    await db.update(characters)
      .set({ starCount: sql`${characters.starCount} - 1` })
      .where(eq(characters.id, characterId));
    return false;
  } else {
    await db.insert(characterStars).values({ userId, characterId });
    await db.update(characters)
      .set({ starCount: sql`${characters.starCount} + 1` })
      .where(eq(characters.id, characterId));
    return true;
  }
}

export async function isCharacterStarred(userId: number, characterId: number) {
  const db = await getDb();
  if (!db) return false;
  
  const result = await db.select()
    .from(characterStars)
    .where(and(eq(characterStars.userId, userId), eq(characterStars.characterId, characterId)))
    .limit(1);
  
  return result.length > 0;
}

export async function getUserChats(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select()
    .from(chats)
    .where(eq(chats.userId, userId))
    .orderBy(desc(chats.updatedAt));
}

export async function getChatById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(chats).where(eq(chats.id, id)).limit(1);
  return result[0];
}

export async function createChat(data: InsertChat) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(chats).values(data);
  return result[0].insertId;
}

export async function deleteChat(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(messages).where(eq(messages.chatId, id));
  await db.delete(chats).where(eq(chats.id, id));
}

export async function getChatMessages(chatId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select()
    .from(messages)
    .where(eq(messages.chatId, chatId))
    .orderBy(messages.createdAt);
}

export async function createMessage(data: InsertMessage) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(messages).values(data);
  return result[0].insertId;
}
