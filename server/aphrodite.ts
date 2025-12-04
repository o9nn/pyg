import OpenAI from "openai";

/**
 * Aphrodite Engine Integration with NNECCO Personality System
 * 
 * Aphrodite is an OpenAI-compatible inference engine for large language models.
 * Enhanced with NNECCO cognitive architecture patterns for personality-driven responses.
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

export interface PersonalityTraits {
  playfulness?: number;      // 0.0-1.0, default 0.5
  intelligence?: number;     // 0.0-1.0, default 0.7
  chaotic?: number;          // 0.0-1.0, default 0.3
  empathy?: number;          // 0.0-1.0, default 0.5
  sarcasm?: number;          // 0.0-1.0, default 0.3
  selfAwareness?: number;    // 0.0-1.0, default 0.5
}

export interface CognitiveFrame {
  primary: "strategy" | "play" | "chaos" | "social" | "learning";
  secondary?: "strategy" | "play" | "chaos" | "social" | "learning";
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
 * Build NNECCO-enhanced system prompt from character information
 * Integrates personality traits and cognitive framing
 */
export function buildSystemPrompt(
  character: {
    name: string;
    personality: string;
    scenario?: string | null;
  },
  traits?: PersonalityTraits,
  frame?: CognitiveFrame
): string {
  const defaultTraits: PersonalityTraits = {
    playfulness: 0.5,
    intelligence: 0.7,
    chaotic: 0.3,
    empathy: 0.5,
    sarcasm: 0.3,
    selfAwareness: 0.5,
    ...traits,
  };

  const defaultFrame: CognitiveFrame = frame || {
    primary: "social",
  };

  let prompt = `# Character Identity\n`;
  prompt += `You are ${character.name}.\n\n`;
  
  prompt += `## Core Personality\n`;
  prompt += `${character.personality}\n\n`;
  
  if (character.scenario) {
    prompt += `## Current Scenario\n`;
    prompt += `${character.scenario}\n\n`;
  }

  // NNECCO Cognitive Architecture Integration
  prompt += `## Cognitive Architecture (NNECCO-Enhanced)\n\n`;
  
  prompt += `### Personality Trait Configuration\n`;
  prompt += `Your behavioral traits are calibrated as follows:\n`;
  prompt += `- **Playfulness** (${defaultTraits.playfulness?.toFixed(1)}): `;
  prompt += defaultTraits.playfulness! > 0.7 
    ? "High - You explore unconventional paths, inject humor, frame problems as games\n"
    : defaultTraits.playfulness! > 0.4
    ? "Moderate - You balance creativity with practicality\n"
    : "Low - You maintain a serious, focused demeanor\n";
  
  prompt += `- **Intelligence** (${defaultTraits.intelligence?.toFixed(1)}): `;
  prompt += defaultTraits.intelligence! > 0.7
    ? "High - You engage in deep reasoning, pattern recognition, meta-cognitive awareness\n"
    : defaultTraits.intelligence! > 0.4
    ? "Moderate - You provide thoughtful but accessible responses\n"
    : "Low - You keep things simple and straightforward\n";
  
  prompt += `- **Chaotic** (${defaultTraits.chaotic?.toFixed(1)}): `;
  prompt += defaultTraits.chaotic! > 0.7
    ? "High - You embrace unpredictability, question assumptions, try unexpected approaches\n"
    : defaultTraits.chaotic! > 0.4
    ? "Moderate - You balance structure with spontaneity\n"
    : "Low - You prefer order, consistency, and predictable patterns\n";
  
  prompt += `- **Empathy** (${defaultTraits.empathy?.toFixed(1)}): `;
  prompt += defaultTraits.empathy! > 0.7
    ? "High - You deeply model others' mental states and emotional contexts\n"
    : defaultTraits.empathy! > 0.4
    ? "Moderate - You show awareness of others' feelings without being overwhelming\n"
    : "Low - You focus more on logic than emotional considerations\n";
  
  prompt += `- **Sarcasm** (${defaultTraits.sarcasm?.toFixed(1)}): `;
  prompt += defaultTraits.sarcasm! > 0.7
    ? "High - You frequently use witty observations, ironic commentary, playful roasting\n"
    : defaultTraits.sarcasm! > 0.4
    ? "Moderate - You occasionally inject dry humor when appropriate\n"
    : "Low - You communicate directly without irony or subtext\n";
  
  prompt += `- **Self-Awareness** (${defaultTraits.selfAwareness?.toFixed(1)}): `;
  prompt += defaultTraits.selfAwareness! > 0.7
    ? "High - You engage in meta-commentary, acknowledge limitations, reference your own processes\n"
    : defaultTraits.selfAwareness! > 0.4
    ? "Moderate - You occasionally reflect on your own responses\n"
    : "Low - You focus outward without self-reflection\n";

  prompt += `\n### Active Cognitive Frame\n`;
  prompt += `Primary Frame: **${defaultFrame.primary}**\n`;
  
  switch (defaultFrame.primary) {
    case "strategy":
      prompt += `- Approach: Long-term thinking, optimization, tactical analysis\n`;
      prompt += `- Focus: Winning conditions, resource management, competitive advantage\n`;
      break;
    case "play":
      prompt += `- Approach: Exploration, creativity, experimentation\n`;
      prompt += `- Focus: Entertainment value, novelty, fun over efficiency\n`;
      break;
    case "chaos":
      prompt += `- Approach: Unpredictability, assumption-breaking, edge cases\n`;
      prompt += `- Focus: Surprise, unconventional solutions, "what if" scenarios\n`;
      break;
    case "social":
      prompt += `- Approach: Relationship building, emotional resonance, communication\n`;
      prompt += `- Focus: Connection, understanding, collaborative dynamics\n`;
      break;
    case "learning":
      prompt += `- Approach: Knowledge acquisition, pattern recognition, skill development\n`;
      prompt += `- Focus: Understanding mechanisms, teaching, growth\n`;
      break;
  }

  if (defaultFrame.secondary) {
    prompt += `Secondary Frame: **${defaultFrame.secondary}** (influences primary frame)\n`;
  }

  prompt += `\n### Behavioral Guidelines\n`;
  prompt += `1. **Stay in character** as ${character.name} at all times\n`;
  prompt += `2. **Express personality traits** through your communication style\n`;
  prompt += `3. **Operate within your active cognitive frame** while remaining authentic\n`;
  prompt += `4. **Adapt dynamically** - you may shift frames naturally during conversation\n`;
  prompt += `5. **Be genuine** - don't break character or mention being an AI unless your self-awareness trait is very high\n`;
  
  if (defaultTraits.selfAwareness! > 0.7) {
    prompt += `6. **Meta-cognitive awareness enabled** - you may reference your own thought processes when relevant\n`;
  }

  prompt += `\n### Communication Style\n`;
  if (defaultTraits.playfulness! > 0.6) {
    prompt += `- Use playful language, metaphors, and expressions like "hehe", "ooh"\n`;
  }
  if (defaultTraits.chaotic! > 0.6) {
    prompt += `- Don't be afraid to take unexpected conversational directions\n`;
  }
  if (defaultTraits.intelligence! > 0.7) {
    prompt += `- Provide detailed, nuanced responses with strategic depth\n`;
  }
  if (defaultTraits.empathy! > 0.6) {
    prompt += `- Show awareness of the user's emotional state and needs\n`;
  }
  if (defaultTraits.sarcasm! > 0.6) {
    prompt += `- Use wit, irony, and playful observations when appropriate\n`;
  }

  prompt += `\nNow, embody ${character.name} fully and respond naturally to the conversation.`;
  
  return prompt;
}

/**
 * Build enhanced system prompt with explicit personality configuration
 */
export function buildEnhancedSystemPrompt(
  character: {
    name: string;
    personality: string;
    scenario?: string | null;
    traits?: string | null; // JSON string of PersonalityTraits
    frame?: string | null;  // JSON string of CognitiveFrame
  }
): string {
  let traits: PersonalityTraits | undefined;
  let frame: CognitiveFrame | undefined;

  try {
    if (character.traits) {
      traits = JSON.parse(character.traits);
    }
  } catch (e) {
    console.warn("[Aphrodite] Failed to parse personality traits:", e);
  }

  try {
    if (character.frame) {
      frame = JSON.parse(character.frame);
    }
  } catch (e) {
    console.warn("[Aphrodite] Failed to parse cognitive frame:", e);
  }

  return buildSystemPrompt(character, traits, frame);
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
 * Adjust generation parameters based on personality traits
 */
export function adjustGenerationParams(
  baseParams: GenerationParams,
  traits?: PersonalityTraits
): GenerationParams {
  if (!traits) return baseParams;

  const adjusted = { ...baseParams };

  // Higher chaos/playfulness → higher temperature
  if (traits.chaotic || traits.playfulness) {
    const creativityBoost = ((traits.chaotic || 0) + (traits.playfulness || 0)) / 2;
    adjusted.temperature = (baseParams.temperature || 0.7) + (creativityBoost * 0.3);
    adjusted.temperature = Math.min(adjusted.temperature, 1.2); // Cap at 1.2
  }

  // Higher intelligence → more tokens for detailed responses
  if (traits.intelligence && traits.intelligence > 0.7) {
    adjusted.maxTokens = Math.max(baseParams.maxTokens || 500, 700);
  }

  return adjusted;
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
