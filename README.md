### This is my first attempt at creating a full Vibe Code project.
The task is here: https://github.com/dancingteeth/aisyncday_vibe  — it’s not fully finished yet.
The main issues were with builds (fixing errors), slow Cursor performance, and updating the frontend.


#### Chat GPT
Chat GPT 5.1 Pro asked to create a cursor prompts based on github code https://chatgpt.com/share/e/69344dc4-bc0c-8013-957d-c9590f39bf99

Cursor uses auto mode

### Phase 0 – Prime Cursor with context
- Prompt 0 — Context & constraints

### Phase 1 – Project scaffolding & tooling 
- Prompt 1 — Scaffold Next.js 14 project and base dependencies 
- Prompt 2 — Create base layout, theme, and navigation shell 

### Phase 2 – Supabase schema, pgvector, and seeding 
- Prompt 3 — Design Supabase schema from participants_mocked.json 
- Prompt 4 — Implement TypeScript types and Supabase client helpers 
- Prompt 5 — Create a seeding script from participants_mocked.json 
- Prompt 6 — Embedding generation and storage pipeline 

### Phase 3 – Core pages wired to Supabase 
- Prompt 7 — Hook Dashboard and Participants list to Supabase
- Prompt 8 — Participant profile page

### Phase 4 – Social Anxiety Traffic Light
- Prompt 9 — Map custom fields and build Status page
- Prompt 10 — Implement Coffee Break Roulette matching logic & UI

### Phase 6 – Agentic Search (RAG + LLM)
- Prompt 11 — Design API and flow for Agentic Search
- Prompt 12 — Implement Agentic Search backend
- Prompt 13 — Implement Agentic Search chat UI
- Prompt 14 — Implement an "Intro Generator" on participant pages

### Phase 8 – Data swapping, custom fields, and parsers
- Prompt 15 — Implement data swapping between mocked and real data
- Prompt 16 — Document custom fields mapping in code

### Phase 9 – VIBE_LOG_AUTO documentation
- Prompt 17 — Create and maintain docs/VIBE_LOG_AUTO.md

### Phase 10 – Deployment and polish
- Prompt 18 — Prepare app for production build and Vercel deployment


# ===============================





# Community OS - Hackathon Project

A Next.js 14 application for connecting participants at tech events, featuring Agentic Search, Social Anxiety Traffic Light, Coffee Break Roulette, and more.

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   - Copy `.env.local.example` to `.env.local`
   - Fill in your Supabase and OpenAI API keys
   
   **Required environment variables:**
   - `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anonymous/public key
   - `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key (for scripts)
   - `OPENAI_API_KEY` - Your OpenAI API key (for embeddings and LLM)
   
   **Optional environment variables:**
   - `OPENAI_EMBEDDING_MODEL` - Embedding model (default: `text-embedding-3-small`)
   - `OPENAI_LLM_MODEL` - LLM model (default: `gpt-4o-mini`)
   - `USE_REAL_DATA` - Set to `true` to use real participant data (default: `false`)
   - `ADMIN_PASSWORD` - Password for admin panel access (required for `/admin` route)

3. **Run database migrations:**
   ```bash
   # Apply migrations in Supabase dashboard or via CLI
   ```

4. **Seed data:**
   ```bash
   # Use mocked data (default)
   npx tsx scripts/seed-participants.ts
   
   # Or use real data (if available)
   export USE_REAL_DATA=true
   npx tsx scripts/seed-participants.ts
   ```

5. **Generate embeddings:**
   ```bash
   npx tsx scripts/generate-embeddings.ts
   ```

6. **Run development server:**
   ```bash
   npm run dev
   ```

## Data Swapping

The project supports switching between mocked and real participant data:

- **Mocked data** (`participants_mocked.json`) - Safe for public repos
- **Real data** (`participants.json`) - Private, git-ignored

See [docs/DATA_SWAPPING.md](./docs/DATA_SWAPPING.md) for complete guide.

**Quick switch:**
```bash
# Validate both files
npx tsx scripts/swap-data.ts --validate

# Switch to real data with backup
npx tsx scripts/swap-data.ts --to-real --backup

# Use real data
export USE_REAL_DATA=true
npx tsx scripts/seed-participants.ts
```

## Features

- **Agentic Search** - Natural language search with LLM explanations
- **Social Anxiety Traffic Light** - Status indicators for availability
- **Coffee Break Roulette** - Serendipitous participant matching
- **Intro Generator** - AI-powered introduction messages
- **Participant Profiles** - Detailed participant information

## Custom Fields Mapping

The project uses 14 custom fields (7 strings + 7 arrays) with specific semantic meanings:

### String Fields
- **custom_1**: Enhanced/Parsed Bio - Enriched biography for search
- **custom_2**: Location - Geographic location
- **custom_3**: Timezone - Participant timezone
- **custom_4**: Last Updated - ISO timestamp of last update
- **custom_5**: Traffic Light Status - Availability status (green/yellow/red)
- **custom_6**: Availability Text - Free-form availability message
- **custom_7**: Experience - Additional professional experience

### Array Fields
- **custom_array_1**: Parsed Skills - Additional skills from parsing
- **custom_array_2**: Interests - Participant interests/hobbies
- **custom_array_3**: Data Sources - Track where data came from (e.g., ["telegram", "linkedin"])
- **custom_array_4**: Common Interests - Shared interests from matching
- **custom_array_5**: Custom Tags - Categorization tags for search
- **custom_array_6**: Reserved
- **custom_array_7**: Reserved

### Usage in Features
- **Social Anxiety Traffic Light**: Uses `custom_5` (status) and `custom_6` (availability text)
- **Coffee Break Roulette**: Uses `custom_array_1` (parsed skills), `custom_array_2` (interests), `custom_array_4` (common interests)
- **Agentic Search**: Uses `custom_1` (enhanced bio), `custom_array_1` (parsed skills), `custom_array_2` (interests), `custom_array_5` (tags)

All custom fields are accessed via type-safe helper functions in `src/lib/constants/field-mappings.ts`.

## Documentation

- [Data Swapping Guide](./docs/DATA_SWAPPING.md)
- [Project Structure](./docs/STRUCTURE.md)
- [Agentic Search Design](./docs/AGENTIC_SEARCH_DESIGN.md)
- [Status Feature](./docs/STATUS_FEATURE.md)
- [Roulette Feature](./docs/ROULETTE_FEATURE.md)

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS + shadcn/ui
- Supabase (Postgres + Auth + Realtime + pgvector)
- OpenAI API

## Deployment

Deploy to Vercel in minutes. See [DEPLOY_SETUP.md](./init-docs/DEPLOY_SETUP.md) for detailed instructions.

### Quick Deploy

1. **Prepare your repository:**
   - Push your code to GitHub (make it public or ensure you're logged in)

2. **URL-encode your repository URL:**
   ```bash
   # Using Node.js
   node -e "console.log(encodeURIComponent('https://github.com/yourusername/your-repo-name'))"
   ```

3. **Create deploy link:**
   ```
   https://vercel.com/new/clone?repository-url=YOUR_ENCODED_REPO_URL&env=NEXT_PUBLIC_SUPABASE_URL,NEXT_PUBLIC_SUPABASE_ANON_KEY,OPENAI_API_KEY
   ```

4. **Set environment variables in Vercel:**
   - `NEXT_PUBLIC_SUPABASE_URL` - From Supabase Dashboard → Settings → API
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` - From Supabase Dashboard → Settings → API
   - `OPENAI_API_KEY` - From OpenAI Dashboard
   - `SUPABASE_SERVICE_ROLE_KEY` - For server-side operations (optional, needed for seeding)

5. **Deploy and verify:**
   - Vercel will build and deploy automatically
   - Visit `/health` endpoint to verify connectivity

### Post-Deployment Checklist

- [ ] Verify health check at `/health` endpoint
- [ ] Run database migrations in Supabase
- [ ] Seed participant data (use Vercel CLI or Supabase dashboard)
- [ ] Generate embeddings for search functionality
- [ ] Test all features (Search, Status, Roulette, Intro Generator)

### Environment Variables Reference

| Variable | Required | Description | Where to Get It |
|----------|----------|-------------|-----------------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ Yes | Supabase project URL | Supabase Dashboard → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ Yes | Supabase anonymous key | Supabase Dashboard → Settings → API |
| `OPENAI_API_KEY` | ✅ Yes | OpenAI API key | OpenAI Dashboard → API Keys |
| `SUPABASE_SERVICE_ROLE_KEY` | ⚠️ Optional | Service role key for scripts | Supabase Dashboard → Settings → API |
| `OPENAI_EMBEDDING_MODEL` | ❌ No | Embedding model name | Default: `text-embedding-3-small` |
| `OPENAI_LLM_MODEL` | ❌ No | LLM model name | Default: `gpt-4o-mini` |
| `USE_REAL_DATA` | ❌ No | Use real participant data | Default: `false` |

**Note:** Variables starting with `NEXT_PUBLIC_` are exposed to the browser. Never commit service role keys or API keys to your repository.

## Health Check

Visit `/health` to verify deployment status:

```bash
curl https://your-app.vercel.app/health
```

The endpoint checks:
- ✅ Environment variables are set
- ✅ Supabase connectivity
- ✅ Database accessibility

## Security

- Real participant data (`participants.json`) is git-ignored
- Environment variables for sensitive keys
- Row Level Security (RLS) in Supabase
- Service role keys only used server-side
