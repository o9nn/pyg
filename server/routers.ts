import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { storagePut } from "./storage";
import { TRPCError } from "@trpc/server";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  characters: router({
    list: publicProcedure
      .input(z.object({
        sortBy: z.enum(['recent', 'popular', 'trending']).optional(),
        limit: z.number().min(1).max(100).optional().default(20),
        offset: z.number().min(0).optional().default(0),
        creatorId: z.number().optional(),
      }).optional())
      .query(async ({ input }) => {
        return await db.getCharacters({
          isPublic: true,
          sortBy: input?.sortBy,
          limit: input?.limit,
          offset: input?.offset,
          creatorId: input?.creatorId,
        });
      }),

    get: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const character = await db.getCharacterById(input.id);
        if (!character) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Character not found' });
        }
        // Increment view count
        await db.incrementCharacterView(input.id);
        return character;
      }),

    create: protectedProcedure
      .input(z.object({
        name: z.string().min(1).max(255),
        description: z.string().min(1),
        personality: z.string().min(1),
        scenario: z.string().optional(),
        firstMessage: z.string().min(1),
        avatarUrl: z.string().optional(),
        backgroundUrl: z.string().optional(),
        tags: z.array(z.string()).optional(),
        isPublic: z.boolean().optional().default(true),
        // NNECCO Cognitive Architecture fields
        traits: z.object({
          playfulness: z.number().min(0).max(1).optional(),
          intelligence: z.number().min(0).max(1).optional(),
          chaotic: z.number().min(0).max(1).optional(),
          empathy: z.number().min(0).max(1).optional(),
          sarcasm: z.number().min(0).max(1).optional(),
          selfAwareness: z.number().min(0).max(1).optional(),
        }).optional(),
        frame: z.object({
          primary: z.enum(['strategy', 'play', 'chaos', 'social', 'learning']),
          secondary: z.enum(['strategy', 'play', 'chaos', 'social', 'learning']).optional(),
        }).optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const { traits, frame, ...rest } = input;
        const characterId = await db.createCharacter({
          ...rest,
          creatorId: ctx.user.id,
          tags: input.tags ? JSON.stringify(input.tags) : null,
          isPublic: input.isPublic ? 1 : 0,
          traits: traits ? JSON.stringify(traits) : null,
          frame: frame ? JSON.stringify(frame) : null,
        });
        return { id: characterId };
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().min(1).max(255).optional(),
        description: z.string().min(1).optional(),
        personality: z.string().min(1).optional(),
        scenario: z.string().optional(),
        firstMessage: z.string().min(1).optional(),
        avatarUrl: z.string().optional(),
        backgroundUrl: z.string().optional(),
        tags: z.array(z.string()).optional(),
        isPublic: z.boolean().optional(),
        // NNECCO Cognitive Architecture fields
        traits: z.object({
          playfulness: z.number().min(0).max(1).optional(),
          intelligence: z.number().min(0).max(1).optional(),
          chaotic: z.number().min(0).max(1).optional(),
          empathy: z.number().min(0).max(1).optional(),
          sarcasm: z.number().min(0).max(1).optional(),
          selfAwareness: z.number().min(0).max(1).optional(),
        }).optional(),
        frame: z.object({
          primary: z.enum(['strategy', 'play', 'chaos', 'social', 'learning']),
          secondary: z.enum(['strategy', 'play', 'chaos', 'social', 'learning']).optional(),
        }).optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const character = await db.getCharacterById(input.id);
        if (!character) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Character not found' });
        }
        if (character.creatorId !== ctx.user.id) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'You can only edit your own characters' });
        }

        const { id, tags, isPublic, traits, frame, ...updateData } = input;
        await db.updateCharacter(id, {
          ...updateData,
          tags: tags ? JSON.stringify(tags) : undefined,
          isPublic: isPublic !== undefined ? (isPublic ? 1 : 0) : undefined,
          traits: traits ? JSON.stringify(traits) : undefined,
          frame: frame ? JSON.stringify(frame) : undefined,
        });
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const character = await db.getCharacterById(input.id);
        if (!character) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Character not found' });
        }
        if (character.creatorId !== ctx.user.id) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'You can only delete your own characters' });
        }

        await db.deleteCharacter(input.id);
        return { success: true };
      }),

    toggleStar: protectedProcedure
      .input(z.object({ characterId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const isStarred = await db.toggleCharacterStar(ctx.user.id, input.characterId);
        return { isStarred };
      }),

    isStarred: protectedProcedure
      .input(z.object({ characterId: z.number() }))
      .query(async ({ input, ctx }) => {
        return await db.isCharacterStarred(ctx.user.id, input.characterId);
      }),
  }),

  chats: router({
    list: protectedProcedure
      .query(async ({ ctx }) => {
        return await db.getUserChats(ctx.user.id);
      }),

    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input, ctx }) => {
        const chat = await db.getChatById(input.id);
        if (!chat) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Chat not found' });
        }
        if (chat.userId !== ctx.user.id) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'You can only access your own chats' });
        }
        return chat;
      }),

    getMessages: protectedProcedure
      .input(z.object({ chatId: z.number() }))
      .query(async ({ input, ctx }) => {
        const chat = await db.getChatById(input.chatId);
        if (!chat) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Chat not found' });
        }
        if (chat.userId !== ctx.user.id) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'You can only access your own chats' });
        }
        return await db.getChatMessages(input.chatId);
      }),

    create: protectedProcedure
      .input(z.object({
        characterId: z.number(),
        title: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const character = await db.getCharacterById(input.characterId);
        if (!character) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Character not found' });
        }

        // Create chat
        const chatId = await db.createChat({
          userId: ctx.user.id,
          characterId: input.characterId,
          title: input.title || `Chat with ${character.name}`,
        });

        // Add first message from character
        await db.createMessage({
          chatId,
          role: 'assistant',
          content: character.firstMessage,
        });

        // Increment character chat count
        await db.incrementCharacterChat(input.characterId);

        return { id: chatId };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const chat = await db.getChatById(input.id);
        if (!chat) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Chat not found' });
        }
        if (chat.userId !== ctx.user.id) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'You can only delete your own chats' });
        }

        await db.deleteChat(input.id);
        return { success: true };
      }),

    sendMessage: protectedProcedure
      .input(z.object({
        chatId: z.number(),
        content: z.string().min(1),
      }))
      .mutation(async ({ input, ctx }) => {
        const chat = await db.getChatById(input.chatId);
        if (!chat) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Chat not found' });
        }
        if (chat.userId !== ctx.user.id) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'You can only send messages to your own chats' });
        }

        // Save user message
        const messageId = await db.createMessage({
          chatId: input.chatId,
          role: 'user',
          content: input.content,
        });

        return { id: messageId };
      }),
  }),

  upload: router({
    image: protectedProcedure
      .input(z.object({
        filename: z.string(),
        contentType: z.string(),
        data: z.string(), // base64 encoded
      }))
      .mutation(async ({ input, ctx }) => {
        // Decode base64
        const buffer = Buffer.from(input.data, 'base64');
        
        // Generate unique filename
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(7);
        const fileKey = `${ctx.user.id}/characters/${timestamp}-${random}-${input.filename}`;

        // Upload to S3
        const { url } = await storagePut(fileKey, buffer, input.contentType);

        return { url, fileKey };
      }),
  }),
});

export type AppRouter = typeof appRouter;
