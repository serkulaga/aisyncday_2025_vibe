# VIBE_LOG_AUTO.md - Development Log

## Project Overview

**Community OS** is a hackathon project for TechSapiens AI Sync Day, implementing "The Serendipity Engine" challenge. It's a Next.js 14 application that helps participants at tech events discover connections through AI-powered search, status management, and serendipitous matching.

### Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS + shadcn/ui components
- **Backend**: Supabase (Postgres + Auth + Realtime + pgvector)
- **AI**: OpenAI API (embeddings: text-embedding-3-small, LLM: gpt-4o-mini)
- **Deployment**: Vercel (planned)

### Core Features

1. **Agentic Search** - Natural language search with RAG and LLM explanations
2. **Social Anxiety Traffic Light** - Status indicators for availability
3. **Coffee Break Roulette** - Serendipitous participant matching
4. **Intro Generator** - AI-powered introduction messages
5. **Participant Profiles** - Comprehensive participant information display

---

## Development Chronology

### Phase 0: Context & Planning

**Prompt 0** - Initial context and requirements gathering

**Outcome**: 
- Analyzed requirements from README.md, DATA_WORKFLOW.md, CUSTOM_FIELDS_GUIDE.md
- Understood 31-field participant schema (16 original + 14 custom + 1 metadata)
- Defined feature scope and architecture

**Design Decisions**:
- Chose Next.js 14 App Router for modern React patterns
- Selected Supabase for backend (Postgres + pgvector for vector search)
- Decided on OpenAI for embeddings and LLM generation

---

### Phase 1: Project Scaffolding & Tooling

**Prompt 1** - Scaffold Next.js 14 project and base dependencies

**Commands Executed**:
```bash
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --yes
npm install @supabase/supabase-js @supabase/ssr openai
npm install lucide-react class-variance-authority clsx tailwind-merge tailwindcss-animate
npx shadcn@latest init
npx shadcn@latest add button card input badge avatar separator select radio-group label textarea toast dialog skeleton
```

**Outcome**:
- Next.js 14 project initialized with TypeScript
- All dependencies installed
- shadcn/ui configured with default theme

**Design Decisions**:
- Used `src/` directory structure for better organization
- Configured import alias `@/*` for cleaner imports
- Selected Slate color scheme for shadcn/ui (professional look)

**Prompt 2** - Create base layout, theme, and navigation shell

**Outcome**:
- Root layout with Inter font
- Top navigation bar with links to all features
- Dashboard placeholder page with statistics slots
- Consistent spacing and typography system

**Files Created**:
- `src/app/layout.tsx`
- `src/components/layout/navbar.tsx`
- `src/app/page.tsx` (Dashboard)
- Placeholder pages for all routes

---

### Phase 2: Supabase Schema, pgvector, and Seeding

**Prompt 3** - Design Supabase schema from participants_mocked.json

**Design Decisions**:
- **Table name**: `participants` (clear, descriptive)
- **pgvector dimension**: 1536 (text-embedding-3-small default)
- **Embedding column**: `embedding vector(1536)` with HNSW index for fast similarity search
- **RLS policies**: Allow anonymous read for hackathon demo, controlled updates
- **Indexes**: GIN for array fields (skills, looking_for), HNSW for vector search

**Outcome**:
- Created migration `001_create_participants_table.sql`
- All 31 fields mapped with appropriate SQL types
- Indexes optimized for common queries
- RLS policies for secure access

**Key Schema Details**:
- Used `text[]` for array fields (Postgres native arrays)
- `embedding vector(1536)` for pgvector compatibility
- Added `created_at` and `updated_at` timestamps
- Set sensible defaults (empty strings/arrays)

**Prompt 4** - Implement TypeScript types and Supabase client helpers

**Design Decisions**:
- **Dual type system**: Database types (snake_case) vs Application types (camelCase)
- **Transform layer**: Separate transformation functions for DB ↔ App conversion
- **Client separation**: Browser client (public keys) vs Server client (service role)
- **Error handling**: Graceful handling of missing data, null checks

**Outcome**:
- `src/types/index.ts` - Application-facing types (camelCase)
- `src/types/database.ts` - Database-facing types (snake_case)
- `src/lib/supabase/client.ts` - Client creation helpers
- `src/lib/supabase/transform.ts` - Type transformation utilities
- `src/lib/supabase/participants.ts` - Data access layer

**Files Created**:
- Complete type system with all 31 fields
- Server and client-side Supabase helpers
- Functions for CRUD operations and similarity search

**Prompt 5** - Create seeding script from participants_mocked.json

**Errors Encountered**:

1. **Error**: `ERR_MODULE_NOT_FOUND` - Script path doubled when run from scripts directory
   - **Resolution**: Updated documentation to clarify running from project root

2. **Error**: `Cannot find module '@supabase/supabase-js'`
   - **Resolution**: User needed to run `npm install @supabase/supabase-js`

3. **Error**: Missing environment variables despite `.env.local` existing
   - **Resolution**: 
     - Added explicit `dotenv.config({ path: ".env.local" })`
     - Added try-catch for missing dotenv package
     - Provided clear error messages with instructions

**Design Decisions**:
- **Idempotent upsert**: Uses `upsert()` with `onConflict` to handle re-runs safely
- **Batch processing**: Processes participants in batches of 10
- **Validation**: Validates each participant before insertion
- **Error tracking**: Logs created vs updated counts

**Outcome**:
- `scripts/seed-participants.ts` - Robust seeding script
- Validation of JSON structure
- Detailed logging of operations
- Error handling with clear messages

**Prompt 6** - Embedding generation and storage pipeline

**Design Decisions**:
- **Embedding model**: `text-embedding-3-small` (1536 dimensions, cost-effective, good quality)
- **Searchable text combination**: Combines bio, skills, aiUsage, and custom fields (custom_1, custom_array_1, custom_array_2, custom_array_5)
- **Batch processing**: Processes participants sequentially with error handling per participant
- **Idempotency**: `--all` flag for regeneration, otherwise skips existing embeddings

**Why text-embedding-3-small**:
- Sufficient quality for semantic search
- Lower cost than larger models
- 1536 dimensions provide good granularity
- Fast generation for batch processing

**Outcome**:
- `scripts/generate-embeddings.ts` - Embedding pipeline
- Function to build searchable text from participant data
- Error handling per participant (doesn't crash on single failure)
- Progress logging

**Migration Created**:
- `002_create_similarity_search_function.sql` - RPC function for efficient vector similarity search

---

### Phase 3: Core Pages Wired to Supabase

**Prompt 7** - Hook Dashboard and Participants list to Supabase

**Design Decisions**:
- **Server Components**: Used for data fetching (efficient, SEO-friendly)
- **Client Components**: Used only for interactive UI (filters, search)
- **Filtering**: Server-side filtering with URL search params for sharing/bookmarking
- **Pagination**: Implemented for large datasets (default 20 per page)

**Outcome**:
- Dashboard shows real statistics: total participants, top skills, status counts
- Participants list page with search and filter capabilities
- Filter by: name, skill, traffic light status
- `src/lib/supabase/stats.ts` - Statistics calculation
- `src/lib/supabase/filters.ts` - Filtered participant fetching

**Prompt 8** - Participant profile page

**Outcome**:
- Dynamic route `/participants/[id]` with full participant information
- Visual status badge component
- All fields displayed in organized cards
- Placeholder for conversation starter (later replaced with Intro Generator)

---

### Phase 4: Social Anxiety Traffic Light

**Prompt 9** - Map custom fields and build Status page

**Design Decisions**:
- **Field mapping**:
  - `custom_5`: Traffic light status ("green" | "yellow" | "red")
  - `custom_6`: Availability text (free-form message)
- **Why this mapping**: Clear semantic separation, allows for both structured status and flexible messaging
- **Storage**: localStorage for current participant selection (persists across sessions)
- **Real-time updates**: Supabase Realtime could be added later for live status changes

**Outcome**:
- Status management page (`/status`)
- Visual traffic light indicator
- Dropdown for participant selection
- Status update functionality
- `updateTrafficLightStatus()` function in data access layer

**Prompt 10** - Implement Coffee Break Roulette matching logic & UI

**Design Decisions**:
- **Matching algorithm**: Weighted scoring system
  - Skill overlap: 40% (Jaccard similarity)
  - Interest overlap: 30% (normalized)
  - Complementary needs: 20% (bidirectional keyword matching)
  - Non-obvious connections: 10% (startup stage, shared goals)
- **Exclusion rules**: Self, red status participants, previous matches
- **Explanation generation**: Rule-based (no LLM) - lists shared skills/interests
- **Why no LLM**: Faster, more predictable, cost-effective for this feature

**Outcome**:
- `src/lib/matching/roulette.ts` - Matching algorithm
- `/roulette` page with participant selection and match display
- Match cards with relevance scores and explanations
- "Spin Again" functionality that excludes previous matches

---

### Phase 6: Agentic Search (RAG + LLM)

**Prompt 11** - Design API and flow for Agentic Search

**Design Decisions**:
- **RAG architecture**: Query → Embedding → Vector Search → Re-ranking → LLM Explanation
- **Embedding model**: Same as participant embeddings (text-embedding-3-small) for consistency
- **LLM model**: gpt-4o-mini (cost-effective, sufficient quality for explanations)
- **Temperature**: 0.3 (more deterministic, reduces hallucinations)
- **Re-ranking**: Combines vector similarity (70%) with keyword matching (30%)
- **Hallucination prevention**: 
  - Explicit system prompt constraints
  - Only provide matched participants in context
  - Low temperature
  - Token limits (200 max)

**Why this approach**:
- Vector search provides semantic understanding
- Keyword re-ranking boosts exact matches
- LLM generates natural explanations from grounded data
- Multiple safeguards prevent hallucinations

**Outcome**:
- Complete design document (`docs/AGENTIC_SEARCH_DESIGN.md`)
- API contract defined (Server Action approach)
- Error handling strategy
- Performance considerations (caching, timeouts)

**Prompt 12** - Implement Agentic Search backend

**Design Decisions**:
- **Server Action vs API Route**: Chose Server Action for type safety and simpler DX
- **Similarity scores**: Extract from Supabase RPC function results
- **Missing embeddings check**: Clear error message directing to run embedding script
- **Error handling**: Graceful degradation (returns participants without explanation if LLM fails)

**Outcome**:
- `src/lib/search/types.ts` - Type definitions
- `src/lib/search/embeddings.ts` - Query embedding generation
- `src/lib/search/rerank.ts` - Keyword-based re-ranking
- `src/lib/search/explain.ts` - LLM explanation generation
- `src/lib/search/agentic-search.ts` - Main orchestration
- `src/app/search/actions.ts` - Server action entry point

**Prompt 13** - Implement Agentic Search chat UI

**Design Decisions**:
- **Chat-like interface**: Familiar UX pattern (like ChatGPT)
- **React Transitions**: Non-blocking UI during search
- **Message history**: Scrollable panel with query/response pairs
- **Loading states**: Clear feedback during async operations
- **Error display**: User-friendly messages, especially for missing embeddings

**Outcome**:
- `/search` page with chat interface
- Search input with Enter key support
- Explanation display component
- Participant match cards with relevance scores
- Copy-to-clipboard for generated explanations

---

### Phase 7: Extra Feature - Intro Generator

**Prompt 14** - Implement Intro Generator on participant pages

**Design Decisions**:
- **LLM model**: gpt-4o-mini (same as search explanations)
- **Temperature**: 0.7 (slightly higher for more natural conversation)
- **Max tokens**: 200 (keep concise)
- **No emojis**: Explicit in prompt (professional tone)
- **Grounded prompts**: Only uses participant data from database

**Outcome**:
- `src/lib/intro/generator.ts` - Intro generation logic
- `src/app/participants/[id]/actions.ts` - Server action
- `src/app/participants/[id]/intro-generator.tsx` - UI component
- Two modes: Select participant or describe audience
- Copy-to-clipboard functionality

---

### Phase 8: Data Swapping and Field Mapping

**Prompt 15** - Implement data swapping between mocked and real data

**Design Decisions**:
- **Environment variable**: `USE_REAL_DATA` (clear, explicit)
- **Safety first**: Defaults to mocked data if real file doesn't exist
- **File locations**: Check multiple locations (root and src/data/)
- **Backup system**: Optional backup creation before swapping
- **Validation**: Comprehensive structure validation before swap

**Why this approach**:
- Prevents accidental use of real data
- Easy switching without code changes
- Validates compatibility before swapping
- Safe backup mechanism

**Outcome**:
- `src/lib/data/config.ts` - Configuration utility
- `scripts/swap-data.ts` - Swap utility with validation
- Updated `.gitignore` to exclude `participants.json`
- `docs/DATA_SWAPPING.md` - Complete guide

**Prompt 16** - Document custom fields mapping in code

**Design Decisions**:
- **Central module**: Single source of truth for field mappings
- **Type-safe helpers**: Avoid magic strings throughout codebase
- **Immutable patterns**: Helper functions return new objects
- **Comprehensive documentation**: Each field documented with purpose and usage

**Field Mapping Summary**:
- `custom_1`: Enhanced/Parsed Bio (Agentic Search)
- `custom_2`: Location (optional features)
- `custom_3`: Timezone (scheduling)
- `custom_4`: Last Updated timestamp (data tracking)
- `custom_5`: Traffic Light Status (Status feature)
- `custom_6`: Availability Text (Status feature)
- `custom_7`: Experience (profile enhancement)
- `custom_array_1`: Parsed Skills (Search, Roulette)
- `custom_array_2`: Interests (Roulette, Search)
- `custom_array_3`: Data Sources (provenance tracking)
- `custom_array_4`: Common Interests (Roulette matching)
- `custom_array_5`: Custom Tags (Search)
- `custom_array_6`, `custom_array_7`: Reserved

**Outcome**:
- `src/lib/constants/field-mappings.ts` - Complete field mapping module
- Type-safe helper functions for all fields
- README section summarizing mappings
- `docs/FIELD_MAPPING_USAGE.md` - Usage guide

---

## Key Technical Decisions

### Why pgvector over alternatives?
- Native Postgres extension (no external services)
- Efficient HNSW indexing for fast similarity search
- Easy integration with Supabase
- Cost-effective (no additional service fees)

### Why Server Components for data fetching?
- Better performance (server-side rendering)
- SEO-friendly
- Reduced client bundle size
- Secure (API keys never exposed to client)

### Why separate DB and App types?
- Database uses snake_case (Postgres convention)
- Application uses camelCase (JavaScript convention)
- Transform layer maintains type safety
- Clear separation of concerns

### Why RPC function for similarity search?
- Efficient (computed in database)
- Can return similarity scores
- Avoids large data transfers
- Leverages Postgres query optimization

### Why gpt-4o-mini for LLM?
- Cost-effective for hackathon budget
- Sufficient quality for explanations and intros
- Fast response times
- Good enough for demo purposes

---

## Error Resolution Summary

1. **Module resolution issues**: Fixed by running scripts from project root
2. **Missing dependencies**: Clear error messages directing to install packages
3. **Environment variable loading**: Explicit dotenv.config() with path specification
4. **TypeScript path aliases**: Linter warnings are false positives (resolved at build time)
5. **Missing embeddings**: Graceful error handling with clear user instructions

---

## Future Improvements (Noted but Not Implemented)

- Real-time status updates via Supabase Realtime
- LLM-powered conversation starters on participant pages (implemented as Intro Generator instead)
- Caching for embeddings and LLM responses
- Rate limiting for search API
- Advanced filters in search UI
- Export search results functionality
- Multi-turn conversation in search
- Analytics and usage tracking

---

## Guidelines for Future Contributors

### Adding to This Log

When making significant changes or encountering issues, please append to this log with:

1. **Chronological entry** - Add new sections in chronological order
2. **Prompt reference** - Note the prompt or task that led to the work
3. **Design decisions** - Explain why you made specific choices
4. **Errors encountered** - Document any errors and their resolutions
5. **Outcome** - List files created/modified and key functionality

### Format

```markdown
**Prompt X** - Brief description

**Design Decisions**:
- Decision 1 and reasoning
- Decision 2 and reasoning

**Errors Encountered** (if any):
- Error description
  - Resolution steps

**Outcome**:
- Files created/modified
- Key functionality added
```

### What to Document

- ✅ Major feature additions
- ✅ Architecture changes
- ✅ Significant refactoring
- ✅ Error resolutions
- ✅ Performance optimizations
- ✅ Design decisions (especially trade-offs)
- ❌ Minor bug fixes (unless they reveal important patterns)
- ❌ Simple UI tweaks

### Keeping the Log Useful

- Be concise but informative
- Focus on "why" not just "what"
- Include code snippets only if they illustrate key points
- Link to relevant documentation files
- Update the "Future Improvements" section as needed

---

**Last Updated**: 2024-12-07
**Project Status**: Core features complete, ready for deployment

