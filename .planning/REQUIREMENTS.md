# Requirements

## v1 (Core Implementation)

### R1: Backend API (Paphos-inspired)
- [ ] **R1.1**: Extend the `characters` table in `drizzle/schema.ts` to include `traits` and `frame` columns (both `text` type for JSON strings).
- [ ] **R1.2**: Update the `characters` tRPC router (`server/routers.ts`) to support CRUD operations for the new `traits` and `frame` fields.
- [ ] **R1.3**: Enhance the `buildEnhancedSystemPrompt` function in `server/aphrodite.ts` to dynamically construct the system prompt using the `traits` and `frame` data from the character.
- [ ] **R1.4**: Implement the `adjustGenerationParams` function in `server/aphrodite.ts` to modify sampling parameters (e.g., temperature) based on character traits.
- [ ] **R1.5**: Ensure the `/api/chat/stream` endpoint uses the enhanced prompt and adjusted parameters when calling the Aphrodite engine.

### R2: Inference Engine (Aphrodite)
- [ ] **R2.1**: Create a `docker-compose.yml` file in the root of the `pyg` repository.
- [ ] **R2.2**: Configure the `docker-compose.yml` to run three services: `pyg-backend`, `aphrodite-engine`, and `mysql`.
- [ ] **R2.3**: The `aphrodite-engine` service should use the `alpindale/aphrodite-openai:latest` image.
- [ ] **R2.4**: The `aphrodite-engine` service should be launched with the `--single-user-mode` flag and any other necessary configuration for development (e.g., model selection).
- [ ] **R2.5**: The `pyg-backend` service should be built from the local Dockerfile and configured to connect to the `aphrodite-engine` and `mysql` services.

### R3: Frontend UI (Galatea-inspired)
- [ ] **R3.1**: Update the character creation/editing page (`client/src/pages/CreateCharacter.tsx`) to include form fields for editing the `traits` (e.g., sliders for each trait) and `frame` (e.g., dropdowns for primary/secondary frames).
- [ ] **R3.2**: Modify the chat interface (`client/src/pages/Chat.tsx`) to provide a more polished and immersive user experience.
- [ ] **R3.3**: Implement a more robust SSE handling mechanism on the frontend to gracefully handle streaming responses, errors, and completion signals.

## v2 (Future Enhancements)

### R4: Advanced Frontend Features
- [ ] **R4.1**: Implement user profile pages.
- [ ] **R4.2**: Implement a system for following/unfollowing character creators.
- [ ] **R4.3**: Add a search and filtering system for characters on the Explore page.

### R5: Advanced Cognitive Features
- [ ] **R5.1**: Implement a mechanism for characters to dynamically shift their cognitive frames during a conversation based on the context.
- [ ] **R5.2**: Introduce a meta-cognitive layer that allows characters to reflect on their own responses and improve over time.
