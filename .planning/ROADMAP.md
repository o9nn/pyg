# Roadmap

## Milestone 1: Core NNECCO Integration (v1)

**Goal**: Implement the core features of the NNECCO cognitive architecture, including the enhanced backend, the Aphrodite engine configuration, and the updated frontend UI.

### Phase 1: Backend API Enhancement (R1)
- **Goal**: Update the backend to support the NNECCO cognitive model.
- **Tasks**:
  - `[ ]` Extend the `characters` database schema with `traits` and `frame` columns.
  - `[ ]` Update the `characters` tRPC router for CRUD operations on the new fields.
  - `[ ]` Implement the enhanced system prompt generation in `server/aphrodite.ts`.
  - `[ ]` Implement dynamic adjustment of generation parameters based on traits.
  - `[ ]` Verify that the streaming endpoint uses the new prompt and parameters.
- **Success Criteria**: The backend can successfully create, read, update, and delete characters with NNECCO-specific attributes, and the inference requests are correctly formatted with the enhanced data.

### Phase 2: Inference Engine Setup (R2)
- **Goal**: Configure and containerize the Aphrodite inference engine for development.
- **Tasks**:
  - `[ ]` Create and configure the `docker-compose.yml` file.
  - `[ ]` Define the `pyg-backend`, `aphrodite-engine`, and `mysql` services.
  - `[ ]` Configure the `aphrodite-engine` service for single-user mode.
  - `[ ]` Ensure all services can communicate with each other within the Docker network.
- **Success Criteria**: The entire platform can be launched with a single `docker compose up` command, and the backend can successfully connect to the Aphrodite engine.

### Phase 3: Frontend UI Implementation (R3)
- **Goal**: Update the frontend to support the creation and interaction with NNECCO-powered characters.
- **Tasks**:
  - `[ ]` Implement the new character creation/editing form with fields for traits and frames.
  - `[ ]` Enhance the chat interface for a more polished user experience.
  - `[ ]` Implement a robust SSE handling mechanism.
- **Success Criteria**: Users can create and edit characters with NNECCO attributes, and the chat interface provides a smooth, real-time experience.

## Milestone 2: Advanced Features & Polish (v2)

**Goal**: Implement advanced features to enhance the user experience and the cognitive capabilities of the AI characters.

### Phase 4: Advanced Frontend Features (R4)
- **Goal**: Add social and community features to the platform.
- **Tasks**:
  - `[ ]` Implement user profile pages.
  - `[ ]` Implement a follow/unfollow system for creators.
  - `[ ]` Add search and filtering capabilities to the character exploration page.
- **Success Criteria**: Users can create profiles, follow their favorite creators, and easily discover new characters.

### Phase 5: Advanced Cognitive Features (R5)
- **Goal**: Enhance the cognitive capabilities of the AI characters.
- **Tasks**:
  - `[ ]` Implement dynamic frame shifting during conversations.
  - `[ ]` Introduce a meta-cognitive reflection mechanism.
- **Success Criteria**: Characters exhibit more dynamic and adaptive behavior, and can demonstrate a degree of self-improvement over time.
