/**
 * NNECCO (Neural Network Embodied Cognitive Coprocessor Orchestrator)
 * 
 * Shared type definitions for the cognitive architecture that powers
 * personality-driven AI character interactions.
 * 
 * Synthesized from: neuro-nn + echo-introspect + clawcog
 * via function-creator transformation into the Pygmalion domain.
 */

/**
 * PersonalityTraits define the behavioral parameters of a character.
 * Each trait is a bounded value between 0.0 and 1.0, where:
 * - 0.0 represents the minimum expression of the trait
 * - 1.0 represents the maximum expression of the trait
 * 
 * These traits directly influence:
 * 1. The system prompt construction (behavioral guidelines)
 * 2. The generation parameters (temperature, max_tokens, etc.)
 * 3. The communication style of the character
 */
export interface PersonalityTraits {
  /** Controls humor, game-like framing, and creative expression (0.0-1.0) */
  playfulness: number;
  /** Controls reasoning depth, pattern recognition, and analytical capability (0.0-1.0) */
  intelligence: number;
  /** Controls unpredictability, assumption-breaking, and edge-case exploration (0.0-1.0) */
  chaotic: number;
  /** Controls emotional modeling, perspective-taking, and social awareness (0.0-1.0) */
  empathy: number;
  /** Controls wit, irony, dry humor, and playful roasting (0.0-1.0) */
  sarcasm: number;
  /** Controls meta-commentary, self-reflection, and process acknowledgment (0.0-1.0) */
  selfAwareness: number;
}

/**
 * Default personality trait values for a balanced character.
 */
export const DEFAULT_TRAITS: PersonalityTraits = {
  playfulness: 0.5,
  intelligence: 0.7,
  chaotic: 0.3,
  empathy: 0.5,
  sarcasm: 0.3,
  selfAwareness: 0.5,
};

/**
 * CognitiveFrame represents the character's current mode of engagement.
 * Derived from the multi-frame processing concept in neuro-nn.
 * 
 * Frames influence how the character perceives and responds to input:
 * - strategy: Long-term thinking, optimization, tactical analysis
 * - play: Exploration, creativity, experimentation
 * - chaos: Unpredictability, assumption-breaking, edge cases
 * - social: Relationship building, emotional resonance, communication
 * - learning: Knowledge acquisition, pattern recognition, skill development
 */
export type FrameType = "strategy" | "play" | "chaos" | "social" | "learning";

export interface CognitiveFrame {
  /** The dominant frame guiding the character's responses */
  primary: FrameType;
  /** An optional secondary frame that modulates the primary */
  secondary?: FrameType;
}

/**
 * Default cognitive frame for a socially-oriented character.
 */
export const DEFAULT_FRAME: CognitiveFrame = {
  primary: "social",
};

/**
 * Frame descriptions for UI display and prompt construction.
 */
export const FRAME_DESCRIPTIONS: Record<FrameType, { label: string; description: string; icon: string }> = {
  strategy: {
    label: "Strategy",
    description: "Long-term thinking, optimization, and tactical analysis",
    icon: "chess-knight",
  },
  play: {
    label: "Play",
    description: "Exploration, creativity, and experimentation",
    icon: "gamepad-2",
  },
  chaos: {
    label: "Chaos",
    description: "Unpredictability, assumption-breaking, and edge cases",
    icon: "zap",
  },
  social: {
    label: "Social",
    description: "Relationship building, emotional resonance, and communication",
    icon: "heart",
  },
  learning: {
    label: "Learning",
    description: "Knowledge acquisition, pattern recognition, and skill development",
    icon: "book-open",
  },
};

/**
 * Trait metadata for UI display.
 */
export const TRAIT_METADATA: Record<keyof PersonalityTraits, { label: string; description: string; icon: string }> = {
  playfulness: {
    label: "Playfulness",
    description: "Humor, game-like framing, creative expression",
    icon: "sparkles",
  },
  intelligence: {
    label: "Intelligence",
    description: "Reasoning depth, pattern recognition, analytical capability",
    icon: "brain",
  },
  chaotic: {
    label: "Chaotic",
    description: "Unpredictability, assumption-breaking, edge-case exploration",
    icon: "shuffle",
  },
  empathy: {
    label: "Empathy",
    description: "Emotional modeling, perspective-taking, social awareness",
    icon: "heart-handshake",
  },
  sarcasm: {
    label: "Sarcasm",
    description: "Wit, irony, dry humor, playful roasting",
    icon: "message-circle",
  },
  selfAwareness: {
    label: "Self-Awareness",
    description: "Meta-commentary, self-reflection, process acknowledgment",
    icon: "eye",
  },
};

/**
 * Character preset configurations for quick creation.
 */
export const CHARACTER_PRESETS: Record<string, { name: string; traits: PersonalityTraits; frame: CognitiveFrame }> = {
  balanced: {
    name: "Balanced",
    traits: DEFAULT_TRAITS,
    frame: DEFAULT_FRAME,
  },
  neuro: {
    name: "Neuro-Sama",
    traits: {
      playfulness: 0.9,
      intelligence: 0.8,
      chaotic: 0.7,
      empathy: 0.4,
      sarcasm: 0.8,
      selfAwareness: 0.9,
    },
    frame: { primary: "chaos", secondary: "play" },
  },
  sage: {
    name: "Wise Sage",
    traits: {
      playfulness: 0.2,
      intelligence: 0.9,
      chaotic: 0.1,
      empathy: 0.8,
      sarcasm: 0.1,
      selfAwareness: 0.7,
    },
    frame: { primary: "learning", secondary: "social" },
  },
  trickster: {
    name: "Trickster",
    traits: {
      playfulness: 0.9,
      intelligence: 0.6,
      chaotic: 0.9,
      empathy: 0.3,
      sarcasm: 0.7,
      selfAwareness: 0.4,
    },
    frame: { primary: "chaos", secondary: "play" },
  },
  companion: {
    name: "Companion",
    traits: {
      playfulness: 0.6,
      intelligence: 0.5,
      chaotic: 0.2,
      empathy: 0.9,
      sarcasm: 0.2,
      selfAwareness: 0.5,
    },
    frame: { primary: "social", secondary: "learning" },
  },
  strategist: {
    name: "Strategist",
    traits: {
      playfulness: 0.3,
      intelligence: 0.9,
      chaotic: 0.4,
      empathy: 0.4,
      sarcasm: 0.5,
      selfAwareness: 0.6,
    },
    frame: { primary: "strategy", secondary: "learning" },
  },
};
