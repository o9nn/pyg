# Pygmalion NNECCO Platform

> *"Wait, what if I play the worst card possible? Chat would love it hehe"* — Neuro-Sama

An open-source AI character chat platform powered by the **NNECCO** (Neural Network Embodied Cognitive Coprocessor Orchestrator) cognitive architecture and the **Aphrodite** inference engine. Characters don't just respond — they *think* through cognitive frames, personality traits, and embodied engagement.

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Galatea Frontend                       │
│  React + TypeScript + TailwindCSS + shadcn/ui           │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌───────────┐  │
│  │   Home   │ │ Explore  │ │Character │ │   Chat    │  │
│  │  (Hero)  │ │ (Browse) │ │ (Detail) │ │(Streaming)│  │
│  └──────────┘ └──────────┘ └──────────┘ └───────────┘  │
│  ┌──────────────────────────────────────────────────┐   │
│  │          CreateCharacter (NNECCO Traits)          │   │
│  │  [Trait Sliders] [Frame Selector] [Presets]       │   │
│  └──────────────────────────────────────────────────┘   │
└──────────────────────┬──────────────────────────────────┘
                       │ tRPC + SSE
┌──────────────────────┴──────────────────────────────────┐
│                    Paphos Backend                         │
│  Express + tRPC + Drizzle ORM + MySQL                   │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌───────────┐  │
│  │  Auth    │ │Characters│ │  Chats   │ │ Streaming │  │
│  │ Router   │ │  Router  │ │  Router  │ │  Router   │  │
│  └──────────┘ └──────────┘ └──────────┘ └───────────┘  │
│  ┌──────────────────────────────────────────────────┐   │
│  │         NNECCO Cognitive Engine                    │   │
│  │  buildSystemPrompt() → adjustGenerationParams()   │   │
│  └──────────────────────────────────────────────────┘   │
└──────────────────────┬──────────────────────────────────┘
                       │ OpenAI-compatible API
┌──────────────────────┴──────────────────────────────────┐
│                  Aphrodite Engine                         │
│  High-performance LLM inference                         │
│  PagedAttention + Speculative Decoding + Quantization   │
│  Single-user dev mode | GPU-accelerated                 │
└─────────────────────────────────────────────────────────┘
```

## NNECCO Cognitive Architecture

Characters are defined by six personality traits and a cognitive frame. These aren't cosmetic — they **directly modulate inference parameters** (temperature, top_p, max_tokens, repetition_penalty) and shape the system prompt.

### Personality Traits (0.0 - 1.0)

| Trait | Description | Inference Effect |
|-------|-------------|------------------|
| **Playfulness** | Humor, game-like framing | +temperature, +exploration |
| **Intelligence** | Reasoning depth, analysis | +max_tokens, +depth |
| **Chaotic** | Unpredictability, edge cases | +temperature, +top_p |
| **Empathy** | Emotional modeling | Social awareness in prompt |
| **Sarcasm** | Wit, irony, dry humor | Communication style in prompt |
| **Self-Awareness** | Meta-commentary | Self-reflection in prompt |

### Cognitive Frames

| Frame | Approach | System Prompt Injection |
|-------|----------|------------------------|
| **Strategy** | Long-term thinking | Optimization, tactical analysis |
| **Play** | Exploration, creativity | Entertainment, novelty |
| **Chaos** | Unpredictability | Surprise, assumption-breaking |
| **Social** | Relationship building | Connection, empathy |
| **Learning** | Knowledge acquisition | Understanding, growth |

### Built-in Character Presets

| Preset | Traits | Frame | Personality |
|--------|--------|-------|-------------|
| **Neuro-Sama** | P:0.8 I:0.9 C:0.7 E:0.6 S:0.75 SA:0.85 | Chaos+Play | Witty, chaotic AI VTuber |
| **Balanced** | All 0.5 | Strategy | Well-rounded default |
| **Wise Sage** | P:0.3 I:0.9 C:0.2 E:0.8 S:0.3 SA:0.7 | Learning | Patient, insightful mentor |
| **Trickster** | P:0.9 I:0.6 C:0.9 E:0.3 S:0.8 SA:0.5 | Chaos | Maximum unpredictability |
| **Companion** | P:0.6 I:0.5 C:0.2 E:0.9 S:0.2 SA:0.4 | Social | Warm, supportive friend |
| **Strategist** | P:0.3 I:0.9 C:0.3 E:0.4 S:0.5 SA:0.6 | Strategy | Analytical, precise |

## Quick Start

### Prerequisites

- Node.js 22+ and pnpm 10+
- MySQL 8.0+
- Docker & Docker Compose (for containerized deployment)
- NVIDIA GPU + CUDA (for Aphrodite inference)

### Development

```bash
git clone https://github.com/o9nn/pyg.git
cd pyg
pnpm install
cp .env.example .env   # edit with your config
pnpm db:push
pnpm dev
```

### Docker Compose (Full Stack)

```bash
# Without GPU (uses external Aphrodite instance)
docker compose up -d

# With GPU inference (requires NVIDIA GPU)
docker compose --profile gpu up -d
```

### Aphrodite Engine (Standalone)

```bash
# Using config file
aphrodite yaml aphrodite/config.yaml

# Or via Docker
docker run -d --gpus all -p 2242:2242 \
  -v ~/.cache/huggingface:/root/.cache/huggingface \
  alpindale/aphrodite-openai:latest \
  --model PygmalionAI/pygmalion-2-7b \
  --single-user-mode \
  --api-key pyg-dev-key \
  --port 2242
```

## Project Structure

```
pyg/
├── client/src/           # Galatea Frontend
│   ├── pages/            # Home, Explore, Character, Chat, CreateCharacter
│   ├── components/       # shadcn/ui components
│   ├── lib/              # tRPC client, utilities
│   └── contexts/         # Theme context
├── server/               # Paphos Backend
│   ├── _core/            # Express + tRPC setup
│   ├── routers.ts        # tRPC API routes (characters, chats, auth)
│   ├── streamingRouter.ts # SSE streaming with NNECCO param adjustment
│   ├── aphrodite.ts      # Aphrodite + NNECCO cognitive engine
│   ├── healthRouter.ts   # Health check endpoints
│   └── db.ts             # Database operations
├── drizzle/schema.ts     # MySQL schema (users, characters, chats, messages)
├── shared/nnecco.ts      # NNECCO type definitions
├── aphrodite/config.yaml # Single-user dev configuration
├── .planning/            # GSD planning documents
├── docker-compose.yml    # Full stack orchestration
├── Dockerfile            # Multi-stage Node.js build
└── .env.example          # Environment template
```

## API

### tRPC Routes

| Route | Type | Description |
|-------|------|-------------|
| `auth.me` | Query | Get current user |
| `characters.list` | Query | List characters (sort: recent/popular/trending) |
| `characters.get` | Query | Get character with NNECCO traits |
| `characters.create` | Mutation | Create character with traits + frame |
| `characters.update` | Mutation | Update character |
| `characters.toggleStar` | Mutation | Star/unstar character |
| `chats.create` | Mutation | Create new chat session |
| `chats.getMessages` | Query | Get chat message history |

### REST Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/chat/stream` | POST | SSE streaming chat (NNECCO-adjusted params) |
| `/health` | GET | Health check |
| `/health/ready` | GET | Readiness probe (checks DB + Aphrodite) |

## Technology Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19, TypeScript, TailwindCSS 4, shadcn/ui |
| Backend | Express, tRPC 11, Drizzle ORM |
| Database | MySQL 8.0 |
| Inference | Aphrodite Engine (OpenAI-compatible) |
| Build | Vite 7, esbuild |
| Deploy | Docker Compose |

## Upstream References

- [Galatea Frontend](https://github.com/PygmalionAI/galatea-frontend) — UI patterns and chat interface design
- [Paphos Backend](https://github.com/PygmalionAI/paphos-backend) — API architecture and data models
- [Aphrodite Engine](https://github.com/aphrodite-engine/aphrodite-engine) — High-performance LLM inference

## Cognitive Architecture Design

The NNECCO system is synthesized from three cognitive skill architectures:

- **neuro-nn**: Differentiable personality traits as neural network parameters
- **echo-introspect**: Self-aware cognitive monitoring and transformative experience handling
- **clawcog**: Multi-channel gateway routing with skill/plugin architecture

See `pyg_arch_spec.md` and `.planning/` for the full architectural specification.

## License

Open source. See upstream repositories for license details.
