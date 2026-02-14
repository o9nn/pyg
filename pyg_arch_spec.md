# Pygmalion Architecture Specification: NNECCO Integration

**Version**: 1.0
**Date**: 2026-02-14
**Author**: Manus AI

## 1. Introduction

This document outlines the technical architecture for evolving the `pyg` repository into a sophisticated, personality-driven AI character chat platform. The architecture synthesizes concepts from the `neuro-nn`, `echo-introspect`, and `clawcog` skills, transformed through the `function-creator` paradigm to fit the Pygmalion ecosystem. The resulting architecture is codenamed **NNECCO (Neural Network Embodied Cognitive Coprocessor Orchestrator)**, as detailed in the project context file `nnecco.md`.

The core of this evolution is to replace the generic backend and frontend components with a more robust and feature-rich implementation inspired by the `galatea-frontend` and `paphos-backend`, while deeply integrating the advanced cognitive and personality models from the source skills into the `aphrodite-engine` and the overall application structure.

## 2. Core Principles

The architecture is guided by the following principles, derived from the source skills:

- **Personality as a First-Class Citizen**: Character personalities are not just descriptive text but are defined by a set of learnable, bounded parameters that directly influence behavior, as described in `neuro-nn`. These parameters will be stored in the database and used to dynamically construct the system prompt for the `aphrodite-engine`.
- **Multi-Frame Processing**: Characters will perceive and react to conversations through multiple cognitive frames (e.g., play, strategy, chaos, social), allowing for more dynamic and engaging interactions. The active frame will be part of the character's state and will influence the AI's responses.
- **Self-Awareness and Introspection**: Characters will possess a degree of self-awareness, enabling them to reflect on their own thoughts and actions. This will be implemented through a meta-cognitive layer in the prompt engineering, inspired by `Autognosis` and `echo-introspect`.
- **Modular and Extensible Architecture**: The system will be designed with a clear separation of concerns, allowing for future extensions and integrations. The `clawcog` skill's concept of a gateway with channels and agents will be adapted to a web-based architecture with a backend API gateway and a frontend client.

## 3. High-Level Architecture

The evolved `pyg` platform will consist of three main components:

1.  **Galatea-inspired Frontend**: A React-based single-page application providing the user interface for character creation, browsing, and chat.
2.  **Paphos-inspired Backend**: A Node.js and Express-based backend providing a tRPC API for managing users, characters, and chats.
3.  **Aphrodite Inference Engine**: The core AI engine responsible for generating character responses, enhanced with the NNECCO cognitive architecture.

```mermaid
graph TD
    subgraph "User's Browser"
        A[Galatea Frontend (React)]
    end

    subgraph "Server Infrastructure"
        B[Paphos Backend (Node.js/Express/tRPC)]
        C[Aphrodite Engine (Python/vLLM)]
        D[MySQL Database]
    end

    A -- tRPC API Calls --> B
    B -- Database Queries --> D
    B -- Inference Requests --> C
    C -- Generates Responses --> B
    B -- Streams Responses (SSE) --> A
```

## 4. Detailed Component Design

### 4.1. Database Schema (`drizzle/schema.ts`)

The existing database schema will be extended to support the NNECCO cognitive architecture. The `characters` table will be modified to include fields for personality traits and cognitive frames.

**`characters` table modifications:**

| Column | Type | Description |
| :--- | :--- | :--- |
| `traits` | `text` | JSON string representing the character's personality traits (e.g., `{"playfulness": 0.8, "intelligence": 0.9, ...}`). |
| `frame` | `text` | JSON string representing the character's current cognitive frame (e.g., `{"primary": "social", "secondary": "play"}`). |

### 4.2. Backend API (`server/`)

The backend will be responsible for the following:

-   **Character Management**: CRUD operations for characters, including their personality traits and cognitive frames.
-   **Chat Management**: Creating and managing chat sessions, and storing conversation history.
-   **Inference Orchestration**: Constructing the system prompt based on the character's personality and the conversation context, and making requests to the `aphrodite-engine`.
-   **Real-time Streaming**: Streaming the AI's responses back to the frontend using Server-Sent Events (SSE).

#### 4.2.1. Aphrodite Integration (`server/aphrodite.ts`)

The existing `aphrodite.ts` module will be enhanced to dynamically construct the system prompt based on the character's NNECCO parameters. The `buildEnhancedSystemPrompt` function will be the core of this integration.

```typescript
// Example of how the system prompt will be constructed
function buildEnhancedSystemPrompt(character: Character): string {
  const traits = JSON.parse(character.traits || '{}');
  const frame = JSON.parse(character.frame || '{}');

  let prompt = `You are ${character.name}.\n`;
  prompt += `${character.personality}\n\n`;

  // Add personality trait descriptions to the prompt
  prompt += `## Personality Trait Configuration\n`;
  prompt += `- Playfulness: ${traits.playfulness || 0.5}\n`;
  // ... and so on for other traits

  // Add cognitive frame information to the prompt
  prompt += `\n## Active Cognitive Frame\n`;
  prompt += `Primary Frame: ${frame.primary || 'social'}\n`;

  return prompt;
}
```

### 4.3. Frontend (`client/`)

The frontend will be enhanced with the following features, inspired by `galatea-frontend`:

-   **Character Creation/Editing UI**: Forms for creating and editing characters will include fields for setting their personality traits and default cognitive frame.
-   **Advanced Chat Interface**: The chat interface will be updated to provide a more immersive experience, with features such as typing indicators, message timestamps, and the ability to view character details.
-   **User Profiles and Social Features**: The frontend will be extended to include user profiles, the ability to follow creators, and other social features.

### 4.4. Aphrodite Engine Configuration

The `aphrodite-engine` will be configured for a single-user development environment. This will involve:

-   Using the `--single-user-mode` flag to minimize resource consumption.
-   Creating a `docker-compose.yml` file to manage the `aphrodite-engine` container alongside the `pyg` backend and database.
-   Selecting an appropriate model for character chat, such as a fine-tuned version of a Llama or Mistral model.

## 5. Implementation Roadmap

The implementation will follow the `get-shit-done` methodology, broken down into the following phases:

1.  **Phase 4: Create GSD planning documents**: Create `PROJECT.md`, `REQUIREMENTS.md`, and `ROADMAP.md` to guide the development process.
2.  **Phase 5: Implement Aphrodite inference engine configuration**: Set up the `aphrodite-engine` with Docker Compose and configure it for single-user development.
3.  **Phase 6: Implement Paphos backend**: Update the backend to support the new database schema and enhance the Aphrodite integration.
4.  **Phase 7: Implement Galatea frontend**: Enhance the frontend with the new character creation UI, chat interface, and social features.
5.  **Phase 8: Integration and Testing**: Perform end-to-end testing of the integrated platform.
6.  **Phase 9: Deployment and Delivery**: Push the final code to the `o9nn/pyg` repository and deliver the results.

## 6. Conclusion

This architecture provides a clear path for evolving the `pyg` repository into a powerful and engaging AI character chat platform. By synthesizing the advanced concepts from the `neuro-nn`, `echo-introspect`, and `clawcog` skills, the NNECCO architecture will enable the creation of truly dynamic and believable AI characters.
