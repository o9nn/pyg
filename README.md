# Pygmalion Chat Clone

A full-stack AI character chat application inspired by [Pygmalion.chat](https://pygmalion.chat/), built with React, Node.js, tRPC, and integrated with the [Aphrodite Engine](https://github.com/aphrodite-engine/aphrodite-engine) for AI-powered conversations.

## Features

### Core Functionality
- **Character Management**: Create, browse, and interact with AI characters
- **Real-time Chat**: Engage in conversations with AI characters using streaming responses
- **Character Creation**: Build custom characters with personality, scenarios, and avatars
- **Community Features**: Star favorite characters, track popularity and chat counts
- **Authentication**: Secure user authentication with JWT-based sessions
- **Responsive Design**: Beautiful purple/pink gradient theme optimized for all devices

### Technical Stack
- **Frontend**: React 19 + TypeScript + Vite + TailwindCSS 4
- **Backend**: Node.js + Express + tRPC 11
- **Database**: MySQL with Drizzle ORM
- **AI Engine**: Aphrodite (OpenAI-compatible API)
- **File Storage**: S3-compatible storage for character avatars
- **Real-time**: Server-Sent Events (SSE) for streaming AI responses

## Architecture

### Database Schema
- **users**: User accounts with OAuth authentication
- **characters**: AI character definitions (name, personality, scenario, etc.)
- **chats**: Conversation sessions between users and characters
- **messages**: Individual messages within chats
- **character_stars**: User favorites/stars for characters
- **follows**: Creator following relationships (planned)

### API Structure
- **tRPC Procedures**: Type-safe API endpoints for all operations
  - `characters.*`: Character CRUD, starring, filtering
  - `chats.*`: Chat management and message history
  - `upload.*`: Image upload for avatars
- **Streaming Endpoint**: POST `/api/chat/stream` for real-time AI responses

### Aphrodite Integration
The application integrates with Aphrodite Engine, an OpenAI-compatible inference server for large language models:

- **Location**: `server/aphrodite.ts`
- **Features**: 
  - Streaming chat completions
  - Character-based system prompts
  - Conversation history formatting
  - Connection health checks

## Setup Instructions

### Prerequisites
- Node.js 18+ and pnpm
- MySQL database
- (Optional) Aphrodite Engine instance

### Installation

1. **Clone and install dependencies**:
   ```bash
   cd pygmalion-clone
   pnpm install
   ```

2. **Configure environment variables**:
   The following are automatically injected by the Manus platform:
   - `DATABASE_URL` - MySQL connection string
   - `JWT_SECRET` - Session signing secret
   - `OAUTH_SERVER_URL` - OAuth backend URL
   - `VITE_APP_TITLE` - Application title
   - `VITE_APP_LOGO` - Logo URL

   **Required for Aphrodite integration** (add via Manus UI or `.env`):
   - `APHRODITE_API_URL` - Base URL of your Aphrodite instance (default: `http://localhost:2242/v1`)
   - `APHRODITE_API_KEY` - API key for authentication (default: `EMPTY`)

3. **Push database schema**:
   ```bash
   pnpm db:push
   ```

4. **Start development server**:
   ```bash
   pnpm dev
   ```

### Deploying Aphrodite Engine

To enable AI chat responses, you need to deploy an Aphrodite Engine instance:

1. **Follow the official guide**: https://github.com/aphrodite-engine/aphrodite-engine

2. **Quick Docker setup**:
   ```bash
   docker run --gpus all \
     -v ~/.cache/huggingface:/root/.cache/huggingface \
     -p 2242:2242 \
     --env "HUGGING_FACE_HUB_TOKEN=<your_token>" \
     alpindale/aphrodite-engine:latest \
     --model PygmalionAI/pygmalion-2-7b \
     --api-keys EMPTY
   ```

3. **Configure the application**:
   Set `APHRODITE_API_URL=http://your-server:2242/v1` in your environment

## Usage

### Creating Characters
1. Sign in to the application
2. Click "Create" in the navigation
3. Fill in character details:
   - **Name**: Character's name
   - **Description**: Brief overview
   - **Personality**: Detailed traits and speaking style
   - **Scenario**: Context for conversations (optional)
   - **First Message**: Opening greeting
   - **Avatar**: Upload character image

### Chatting with Characters
1. Browse characters on the Explore page
2. Click a character to view details
3. Click "Start Chat" to begin a conversation
4. Type messages and receive AI-generated responses

### API Integration

The streaming chat endpoint can be called directly:

```typescript
// POST /api/chat/stream
{
  "chatId": 123,
  "userMessage": "Hello!"
}

// Response: Server-Sent Events stream
data: {"chunk": "Hello"}
data: {"chunk": " there"}
data: {"chunk": "!"}
data: {"done": true}
```

## Development

### Project Structure
```
├── client/               # Frontend React application
│   ├── src/
│   │   ├── pages/       # Page components
│   │   ├── components/  # Reusable UI components
│   │   └── lib/         # tRPC client setup
├── server/              # Backend Node.js application
│   ├── routers.ts       # tRPC procedure definitions
│   ├── db.ts            # Database query helpers
│   ├── aphrodite.ts     # Aphrodite engine integration
│   ├── streamingRouter.ts # SSE streaming endpoint
│   └── _core/           # Framework internals
└── drizzle/             # Database schema and migrations
    └── schema.ts
```

### Adding New Features

1. **Database changes**: Edit `drizzle/schema.ts` and run `pnpm db:push`
2. **Backend logic**: Add queries in `server/db.ts`
3. **API endpoints**: Add procedures in `server/routers.ts`
4. **Frontend**: Use `trpc.*.useQuery/useMutation` hooks

## Configuration

### Aphrodite Parameters
Adjust AI generation in `server/aphrodite.ts`:
- `temperature`: Randomness (0.0-2.0, default: 0.7)
- `maxTokens`: Response length (default: 500)
- `topP`: Nucleus sampling (default: 0.9)
- `stopSequences`: Custom stop tokens

### Theme Customization
Edit `client/src/index.css` to modify the purple/pink gradient theme colors.

## Limitations & Future Work

### Current Limitations
- Streaming chat responses require frontend EventSource integration
- User profile pages not yet implemented
- Follow/unfollow creators feature planned but not built
- Search functionality UI exists but needs backend implementation

### Planned Features
- [ ] Real-time streaming integration in chat UI
- [ ] User profile pages with character galleries
- [ ] Creator following system
- [ ] Advanced character search and filtering
- [ ] Character tags and categories
- [ ] Message editing and regeneration
- [ ] Chat history export
- [ ] Character versioning

## Resources

- **Pygmalion.chat**: https://pygmalion.chat/
- **Aphrodite Engine**: https://github.com/aphrodite-engine/aphrodite-engine
- **Aphrodite Documentation**: https://aphrodite.pygmalion.chat/
- **PygmalionAI GitHub**: https://github.com/PygmalionAI

## License

This is an educational project demonstrating full-stack AI chat application development. Please refer to the original Pygmalion and Aphrodite projects for their respective licenses.

## Contributing

This project serves as a foundation for building AI character chat applications. Feel free to extend it with additional features, improve the UI, or integrate different AI backends.
