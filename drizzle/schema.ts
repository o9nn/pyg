import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Characters table - stores AI character definitions with NNECCO cognitive architecture
 */
export const characters = mysqlTable("characters", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description").notNull(),
  personality: text("personality").notNull(),
  scenario: text("scenario"),
  firstMessage: text("firstMessage").notNull(),
  avatarUrl: text("avatarUrl"),
  backgroundUrl: text("backgroundUrl"),
  creatorId: int("creatorId").notNull(),
  tags: text("tags"), // JSON string array
  
  // NNECCO Cognitive Architecture Fields
  traits: text("traits"), // JSON string of PersonalityTraits (playfulness, intelligence, chaotic, empathy, sarcasm, selfAwareness)
  frame: text("frame"), // JSON string of CognitiveFrame (primary, secondary)
  
  isPublic: int("isPublic").default(1).notNull(), // 1 = true, 0 = false
  viewCount: int("viewCount").default(0).notNull(),
  chatCount: int("chatCount").default(0).notNull(),
  starCount: int("starCount").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Character = typeof characters.$inferSelect;
export type InsertCharacter = typeof characters.$inferInsert;

/**
 * Chats table - stores conversation sessions between users and characters
 */
export const chats = mysqlTable("chats", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  characterId: int("characterId").notNull(),
  title: varchar("title", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Chat = typeof chats.$inferSelect;
export type InsertChat = typeof chats.$inferInsert;

/**
 * Messages table - stores individual messages within chats
 */
export const messages = mysqlTable("messages", {
  id: int("id").autoincrement().primaryKey(),
  chatId: int("chatId").notNull(),
  role: mysqlEnum("role", ["user", "assistant", "system"]).notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Message = typeof messages.$inferSelect;
export type InsertMessage = typeof messages.$inferInsert;

/**
 * Character stars - many-to-many relationship for user favorites
 */
export const characterStars = mysqlTable("character_stars", {
  userId: int("userId").notNull(),
  characterId: int("characterId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type CharacterStar = typeof characterStars.$inferSelect;
export type InsertCharacterStar = typeof characterStars.$inferInsert;

/**
 * Follows - many-to-many relationship for following creators
 */
export const follows = mysqlTable("follows", {
  followerId: int("followerId").notNull(),
  followingId: int("followingId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Follow = typeof follows.$inferSelect;
export type InsertFollow = typeof follows.$inferInsert;
