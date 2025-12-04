import { Router } from "express";
import { createContext } from "./_core/context";
import * as db from "./db";
import { buildSystemPrompt, formatMessages, generateChatResponse } from "./aphrodite";

/**
 * Streaming chat router for Server-Sent Events (SSE)
 * 
 * This handles streaming AI responses from the Aphrodite engine
 * to the frontend in real-time using SSE.
 */
export const streamingRouter = Router();

/**
 * POST /api/chat/stream
 * 
 * Stream AI response for a chat message
 * Body: { chatId: number, userMessage: string }
 */
streamingRouter.post("/chat/stream", async (req, res) => {
  try {
    const { chatId, userMessage } = req.body;

    if (!chatId || !userMessage) {
      res.status(400).json({ error: "Missing chatId or userMessage" });
      return;
    }

    // Get user from session
    const ctx = await createContext({ req, res, info: {} as any });
    if (!ctx.user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    // Verify chat ownership
    const chat = await db.getChatById(chatId);
    if (!chat) {
      res.status(404).json({ error: "Chat not found" });
      return;
    }
    if (chat.userId !== ctx.user.id) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    // Get character
    const character = await db.getCharacterById(chat.characterId);
    if (!character) {
      res.status(404).json({ error: "Character not found" });
      return;
    }

    // Save user message
    await db.createMessage({
      chatId,
      role: "user",
      content: userMessage,
    });

    // Get conversation history
    const messages = await db.getChatMessages(chatId);

    // Build prompt
    const systemPrompt = buildSystemPrompt(character);
    const formattedMessages = formatMessages(
      systemPrompt,
      messages.map(m => ({ role: m.role, content: m.content }))
    );

    // Set up SSE
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    let fullResponse = "";

    try {
      // Stream response from Aphrodite
      for await (const chunk of generateChatResponse(formattedMessages)) {
        fullResponse += chunk;
        res.write(`data: ${JSON.stringify({ chunk })}\n\n`);
      }

      // Save assistant message
      await db.createMessage({
        chatId,
        role: "assistant",
        content: fullResponse,
      });

      // Send completion signal
      res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
      res.end();
    } catch (error) {
      console.error("[Streaming] Error:", error);
      res.write(`data: ${JSON.stringify({ error: "Failed to generate response" })}\n\n`);
      res.end();
    }
  } catch (error) {
    console.error("[Streaming] Request error:", error);
    if (!res.headersSent) {
      res.status(500).json({ error: "Internal server error" });
    }
  }
});
