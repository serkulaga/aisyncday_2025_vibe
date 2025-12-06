# Quick Fix: Search Not Finding Results

## Problem
Search returns "No participants matched your query" even though participants exist.

## Solution

The Agentic Search requires **embeddings** to be generated for all participants. Follow these steps:

### Step 1: Verify Participants Are Seeded

Check if participants are in your database. If not, seed them:

```bash
# From project root
npx tsx scripts/seed-participants.ts
```

This will:
- Load participants from `participants_mocked.json`
- Upsert them into your Supabase `participants` table
- **Note:** This does NOT generate embeddings (that's step 2)

### Step 2: Generate Embeddings

This is the critical step! Embeddings enable semantic search:

```bash
# From project root
npx tsx scripts/generate-embeddings.ts
```

This will:
- Fetch all participants from the database
- Generate embeddings using OpenAI API
- Store embeddings in the `embedding` column
- Show progress for each participant

**Options:**
- `--all` - Regenerate embeddings even if they exist
- `--participant-id=2` - Only generate for specific participant(s)

### Step 3: Verify

After generating embeddings, try searching again for "computer vision".

## Troubleshooting

### Error: "No embeddings available"
→ You need to run Step 2 (generate embeddings)

### Error: "No participants matched your query"
Possible causes:
1. **Embeddings not generated** - Run Step 2
2. **Threshold too high** - The default threshold is 0.5. You can lower it in the search options
3. **Query too specific** - Try broader queries like "vision" or "machine learning"

### Check if embeddings exist

You can verify in Supabase:
1. Go to Table Editor → `participants`
2. Check if the `embedding` column has data (it will show `[vector]` if populated)

### Lower the threshold

If results are too strict, you can modify the search threshold. The default is `0.5` (50% similarity). Lower values (like `0.3`) will return more results.

## Environment Variables Needed

Make sure your `.env.local` has:
```bash
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key  # Needed for seeding/generating embeddings
OPENAI_API_KEY=your_openai_key                   # Needed for generating embeddings
```

## Cost Note

Generating embeddings uses OpenAI API. With ~30-50 participants:
- Cost: ~$0.01-0.02 total
- Time: ~1-2 minutes
- Model used: `text-embedding-3-small` (cheapest option)

