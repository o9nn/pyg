# Upstream Repository Research Notes

## 1. Galatea Frontend (PygmalionAI/galatea-frontend)
- **Status**: Archived Jan 4, 2026 (read-only)
- **Stack**: React + TypeScript + Vite + TailwindCSS + Firebase
- **Structure**: Monorepo with `web/`, `server/` (Go), `shared/`
- **Pages**: Account, Beta, Characters, Chat, ContactUs, Landing, Login, NotFound, PrivacyPolicy, Register, TermsOfService
- **Frontend src**: apis/, assets/, components/, contexts/, pages/
- **Key Features**: Character browsing, chat interface, user accounts, landing page, responsive design
- **Auth**: Firebase + GoTrue (Supabase-compatible)
- **Docker**: docker-compose with minio, gotrue, galatea-server, postgres

## 2. Paphos Backend (PygmalionAI/paphos-backend)
- **Status**: Active, 13 commits, early WIP
- **Stack**: Crystal language + Lucky framework + PostgreSQL
- **Structure**: actions/, emails/, models/, operations/, queries/, serializers/
- **Key Features**: Chat resource with associations, user auth, password reset operations
- **API**: RESTful under /api/v1
- **Database**: PostgreSQL with Lucky ORM migrations

## 3. Aphrodite Engine (aphrodite-engine/aphrodite-engine)
- **Status**: Active, v0.10.0, 1.7k stars, 1578 commits
- **Stack**: Python + C++ + CUDA (vLLM-based)
- **Key Features**:
  - OpenAI-compatible API on port 2242
  - Continuous batching, PagedAttention
  - Quantization support (GGUF, GPTQ, AWQ, etc.)
  - `--single-user-mode` flag for dev environments
  - Speculative decoding, multi-LoRA, multimodal
  - DRY, XTC, Mirostat samplers
  - 8-bit KV cache
- **Launch**: `aphrodite run <model> [--single-user-mode]`
- **Docker**: `alpindale/aphrodite-openai:latest`
- **Config**: YAML-based config with basic_args, sampling, api_key settings
- **API**: OpenAI-compatible chat completions at /v1/chat/completions

## Current pyg Repo State
- Already has: React 19 + TypeScript + Vite + TailwindCSS frontend
- Already has: Node.js + Express + tRPC 11 backend
- Already has: MySQL + Drizzle ORM database
- Already has: Aphrodite client integration (server/aphrodite.ts)
- Already has: SSE streaming endpoint
- Already has: NNECCO cognitive architecture integration
- Already has: Character CRUD, chat management, star/favorite system
- Missing: Aphrodite engine deployment config, Docker compose, enhanced frontend features
- Missing: User profile, follow/unfollow, search, advanced chat features
- Missing: Production-ready inference engine configuration
