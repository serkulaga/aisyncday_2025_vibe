# Community OS - Project Summary & Architecture

## Executive Summary

**Project:** Community OS - A hackathon prototype that transforms passive community guest lists into an active, searchable network.

**Core Problem:** Communities are just lists of names in Telegram chats. People don't know who has the skills/experiences they need, even when they're in the same room.

**Solution:** A Next.js web app with four key features:
1. **Agentic Search** - Natural language queries ("Who knows Rust and likes hiking?") answered by AI
2. **Social Anxiety Traffic Light** - Real-time availability status (Green/Yellow/Red)
3. **Coffee Break Roulette** - Intelligent matching algorithm for serendipitous connections
4. **Skill Exchange Board** - Visual board showing "can help" / "needs help" exchanges

---

## Data Model

### Participants Schema (31 fields)

**Original Fields (16):**
- Identity: `id`, `name`, `email`, `telegram`, `linkedin`, `photo`
- Professional: `bio`, `skills[]`, `hasStartup`, `startupStage`, `startupDescription`, `startupName`
- Community: `lookingFor[]`, `canHelp`, `needsHelp`, `aiUsage`

**Custom Fields (14) - Our Mappings:**
- `custom_1`: Enhanced/parsed bio
- `custom_2`: Location
- `custom_3`: Timezone
- `custom_4`: Last updated timestamp
- `custom_5`: Status (green/yellow/red for traffic light)
- `custom_6`: Availability text
- `custom_7`: Work experience
- `custom_array_1`: Parsed/extracted skills
- `custom_array_2`: Interests/hobbies
- `custom_array_3`: Data sources (e.g., ['telegram', 'linkedin'])
- `custom_array_4`: Common interests (calculated during matching)
- `custom_array_5`: Custom tags for search
- `custom_array_6`: Reserved
- `custom_array_7`: Reserved

---

## Architecture Overview

### Frontend (Next.js 14 App Router)
```
app/
├── layout.tsx              # Root layout
├── page.tsx                # Dashboard/home
├── search/page.tsx         # Agentic Search
├── traffic-light/page.tsx  # Status management
├── roulette/page.tsx       # Coffee Break Roulette
├── exchange/page.tsx       # Skill Exchange Board
├── profile/[id]/page.tsx   # Individual profiles
└── api/                    # API routes
    ├── search/route.ts
    ├── roulette/route.ts
    └── status/route.ts
```

### Backend (Supabase)
- **Table:** `participants` (all 31 fields + `embedding vector(1536)`)
- **Table:** `participant_status` (real-time status updates)
- **Extension:** pgvector (vector similarity search)
- **Feature:** Realtime subscriptions for status updates
- **Functions:** Vector search, compatibility calculation

### AI/ML Integration
- **Embeddings:** OpenAI `text-embedding-3-small` or `ada-002`
- **Chat:** OpenAI GPT for natural language search responses
- **Strategy:** RAG (Retrieval-Augmented Generation) for search

---

## Feature Breakdown

### 1. Agentic Search
- **Input:** Natural language query (e.g., "Who here knows Rust and likes hiking?")
- **Process:** Query → Embedding → Vector Search → Top 10 matches → LLM → Human-readable answer
- **Output:** Conversational response with participant names and reasons

### 2. Social Anxiety Traffic Light
- **Input:** User selects status (Green/Yellow/Red) + optional availability text
- **Process:** Update `participant_status` table → Real-time broadcast via Supabase Realtime
- **Output:** Status badge visible throughout app, real-time updates for all users

### 3. Coffee Break Roulette
- **Input:** Current participant ID
- **Process:** Calculate compatibility scores (skills, interests, complementary needs, non-obvious connections) → Rank → Top 3 matches
- **Output:** Match cards with scores, common interests, and "why this match" explanations

### 4. Skill Exchange Board
- **Input:** All participants' `canHelp` and `needsHelp` fields
- **Process:** Parse skills, match helpers with those who need help
- **Output:** Visual board showing exchanges, filters by skill category

---

## Tech Stack

- **Frontend:** Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui
- **Backend:** Supabase (Postgres + Auth + Realtime + pgvector)
- **AI:** OpenAI API (embeddings + chat completions)
- **Deployment:** Vercel
- **Development:** Cursor AI (vibe coding)

---

## Project Phases (12 Phases)

1. **Scaffolding** - Next.js setup, Tailwind, shadcn/ui
2. **Database Schema** - Supabase tables, pgvector, RLS policies
3. **Data Seeding** - Import from JSON, generate embeddings
4. **Infrastructure** - Utilities, hooks, data access layer
5. **Agentic Search** - Search page + API route + LLM integration
6. **Traffic Light** - Status updates + real-time subscriptions
7. **Roulette** - Matching algorithm + results display
8. **Exchange Board** - Visual board + skill matching
9. **Profiles & Navigation** - Profile pages + site navigation
10. **UI/UX Polish** - Styling, animations, responsiveness
11. **Documentation** - VIBE_LOG updates, README, code comments
12. **Deployment** - Vercel deployment + production testing

---

## Key Technical Decisions

1. **pgvector in Supabase** (not separate vector DB) - Simpler, good enough for hackathon scale
2. **Separate status table** (not just custom fields) - Better for real-time subscriptions
3. **Hybrid search** - Vector similarity + keyword filtering for better results
4. **Weighted matching** - Multiple factors (skills, interests, needs) for better pairings
5. **RAG pattern** - Vector search finds candidates, LLM generates natural response

---

## Success Criteria

✅ All 4 features implemented and functional  
✅ Real-time status updates working  
✅ Vector search returns relevant results  
✅ Matching algorithm produces good pairings  
✅ Clean, non-generic UI (no slop)  
✅ Deployed on Vercel  
✅ VIBE_LOG.md documents the process  
✅ Scalable (no hard-coded data, works with any participant dataset)

---

## Next Steps

1. Review this summary and architecture
2. Approve the plan or suggest modifications
3. Begin Phase 1: Project Scaffolding

---

**Full details available in:** `docs/VIBE_LOG.md`

