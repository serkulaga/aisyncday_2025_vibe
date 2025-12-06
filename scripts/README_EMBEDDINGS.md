# Embedding Generation Script

This script generates vector embeddings for participants using OpenAI's embedding models and stores them in Supabase for use with semantic search.

## Overview

The embedding pipeline:
1. **Fetches participants** from Supabase
2. **Builds searchable text** by combining relevant fields (bio, skills, interests, etc.)
3. **Generates embeddings** using OpenAI's embedding API
4. **Stores embeddings** in the `embedding` column for similarity search

## Prerequisites

1. **Environment variables** in `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   OPENAI_API_KEY=your_openai_api_key
   OPENAI_EMBEDDING_MODEL=text-embedding-3-small  # Optional, defaults to text-embedding-3-small
   ```

2. **Install dependencies** (if not already installed):
   ```bash
   npm install openai
   # dotenv should already be installed from seeding script setup
   ```

## Usage

### Generate embeddings for all participants (skip existing)

```bash
npx tsx scripts/generate-embeddings.ts
```

### Regenerate embeddings for all participants (force)

```bash
npx tsx scripts/generate-embeddings.ts --all
```

### Generate embeddings for specific participants

```bash
npx tsx scripts/generate-embeddings.ts --participant-id=1,2,3
```

## What Text Gets Embedded?

The script combines the following fields into searchable text (based on CUSTOM_FIELDS_GUIDE.md):

### Original Fields
- `bio` - Professional biography
- `skills` - Array of skills (joined with commas)
- `can_help` - What participant can help with
- `needs_help` - What participant needs help with
- `ai_usage` - AI usage description
- `looking_for` - Array of what they're looking for
- `startup_description` - Startup description (if applicable)

### Custom Fields (Enhanced Search)
- `custom_1` - Enhanced/parsed bio
- `custom_array_1` - Parsed/extracted skills
- `custom_array_2` - Interests/hobbies
- `custom_array_5` - Custom tags

All fields are combined with newlines for better separation and context.

## How It Works

1. **Text Building**: For each participant, the script combines relevant fields into a single searchable text string
2. **Embedding Generation**: Calls OpenAI's embedding API to generate a 1536-dimensional vector
3. **Storage**: Updates the `embedding` column in the database with the vector
4. **Error Handling**: Continues processing even if individual participants fail

## Integration with Similarity Search

Once embeddings are generated, they're used by the `similaritySearch()` function in `src/lib/supabase/participants.ts`:

```typescript
import { similaritySearch } from "@/lib/supabase/participants";

// When a user searches, we:
// 1. Generate embedding for the search query (using OpenAI)
// 2. Use similaritySearch() to find similar participants
const results = await similaritySearch({
  embedding: queryEmbedding, // 1536-dimensional vector
  limit: 10,
  threshold: 0.5 // Minimum similarity score
});
```

The similarity search uses the `match_participants` RPC function (from migration `002_create_similarity_search_function.sql`) which:
- Performs cosine similarity between query embedding and stored embeddings
- Returns participants ordered by similarity
- Filters by similarity threshold

## Output

The script provides detailed logging:
- Progress for each batch
- Success/failure for each participant
- Summary statistics at the end

Example output:
```
🚀 Starting embedding generation...

✅ Using embedding model: text-embedding-3-small
✅ Force regenerate all: No (skip existing)
✅ Processing all participants

📝 Found 31 participant(s) to process

📦 Processing batch 1/4 (10 participants)...
   ✅ Participant 1: Embedding generated
   ✅ Participant 2: Embedding generated
   ...

==================================================
📊 Embedding Generation Summary
==================================================
✅ Generated: 31
⏭️  Skipped: 0
📝 Total processed: 31
==================================================

🎉 All embeddings generated successfully!
```

## Troubleshooting

### Error: Missing OPENAI_API_KEY
- Add `OPENAI_API_KEY` to your `.env.local` file
- Get your key from: https://platform.openai.com/api-keys

### Error: Rate limit exceeded
- The script includes delays between batches
- If you still hit rate limits, increase the delay in the script (currently 1000ms)

### Error: Invalid API key
- Verify your OpenAI API key is correct
- Make sure you have credits in your OpenAI account

### Some participants failed
- Check the error messages in the output
- Common issues:
  - Empty searchable text (participant has no content to embed)
  - Network errors (retry those participants)
  - API errors (check OpenAI status)

## Cost Estimate

- **Model**: `text-embedding-3-small`
- **Cost**: ~$0.02 per 1M tokens
- **Per participant**: ~500-1000 tokens (rough estimate)
- **31 participants**: ~$0.0003 - $0.0006 (very cheap!)

## Next Steps

After generating embeddings:
1. ✅ Test similarity search in your application
2. ✅ Verify search results are relevant
3. ✅ Regenerate embeddings when participant data is updated
4. ✅ Consider a scheduled job to update embeddings periodically

