import OpenAI from "openai";

/**
 * Aphrodite Engine Integration
 * 
 * Aphrodite is an OpenAI-compatible inference engine for large language models.
 * It provides streaming chat completions with support for custom models.
 * 
 * Configuration:
 * - APHRODITE_API_URL: Base URL of the Aphrodite engine instance
 * - APHRODITE_API_KEY: API key for authentication (optional, depends on setup)
 */

const APHRODITE_API_URL = process.env.APHRODITE_API_URL || "http://localhost:2242/v1";
const APHRODITE_API_KEY = process.env.APHRODITE_API_KEY || "EMPTY";

// Initialize OpenAI client configured for Aphrodite
const aphroditeClient = new OpenAI({
  baseURL: APHRODITE_API_URL,
  apiKey: APHRODITE_API_KEY,
});

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface GenerationParams {
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  repetitionPenalty?: number;
  stopSequences?: string[];
}

/**
 * Generate AI chat response using Aphrodite engine
 * 
 * @param messages - Array of chat messages including system prompt and conversation history
 * @param params - Generation parameters for controlling the AI output
 * @returns AsyncIterable stream of response chunks
 */
export async function* generateChatResponse(
  messages: ChatMessage[],
  params: GenerationParams = {}
): AsyncIterable<string> {
  const {
    temperature = 0.7,
    maxTokens = 500,
    topP = 0.9,
    repetitionPenalty = 1.1,
    stopSequences = [],
  } = params;

  try {
    const stream = await aphroditeClient.chat.completions.create({
      model: "default", // Aphrodite uses the loaded model
      messages: messages.map(msg => ({
        role: msg.role,
        content: msg.content,
      })),
      temperature,
      max_tokens: maxTokens,
      top_p: topP,
      stop: stopSequences.length > 0 ? stopSequences : undefined,
      stream: true,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        yield content;
      }
    }
  } catch (error) {
    console.error("[Aphrodite] Error generating response:", error);
    throw new Error("Failed to generate AI response. Please check Aphrodite engine connection.");
  }
}

/**
 * Build system prompt from character information
 */
export function buildSystemPrompt(character: {
  name: string;
  personality: string;
  scenario?: string | null;
}): string {
  let prompt = `You are ${character.name}.\n\n`;
  prompt += `Personality: ${character.personality}\n\n`;
  
  if (character.scenario) {
    prompt += `Scenario: ${character.scenario}\n\n`;
  }
  
  prompt += `Stay in character and respond naturally as ${character.name} would. Do not break character or mention that you are an AI.`;
  
  return prompt;
}

/**
 * Format conversation history for Aphrodite
 */
export function formatMessages(
  systemPrompt: string,
  conversationHistory: Array<{ role: string; content: string }>
): ChatMessage[] {
  const messages: ChatMessage[] = [
    { role: "system", content: systemPrompt },
  ];

  for (const msg of conversationHistory) {
    if (msg.role === "user" || msg.role === "assistant") {
      messages.push({
        role: msg.role,
        content: msg.content,
      });
    }
  }

  return messages;
}

/**
 * Check if Aphrodite engine is accessible
 */
export async function checkAphroditeConnection(): Promise<boolean> {
  try {
    // Try to list models as a health check
    await aphroditeClient.models.list();
    return true;
  } catch (error) {
    console.error("[Aphrodite] Connection check failed:", error);
    return false;
  }
}
