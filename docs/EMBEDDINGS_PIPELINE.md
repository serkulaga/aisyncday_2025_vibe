# Embedding Pipeline Documentation

## Overview

The embedding pipeline generates vector representations of participant profiles that enable semantic search functionality. This document explains how the pipeline works and how it integrates with the similarity search feature.

## Architecture

```
┌─────────────────┐
│  Participants   │
│   (Supabase)    │
└────────┬────────┘
         │
         │ Fetch participants
         ▼
┌─────────────────────────┐
│  Build Searchable Text  │
│  - bio, skills, etc.    │
│  - custom fields        │
└────────┬────────────────┘
         │
         │ Combined text
         ▼
┌─────────────────────────┐
│   OpenAI Embedding API  │
│  text-embedding-3-small │
└────────┬────────────────┘
         │
         │ 1536-dim vector
         ▼
┌─────────────────────────┐
│  Store in Supabase      │
│  participants.embedding │
└─────────────────────────┘
```

## How It Works

### Step 1: Text Building

For each participant, the script combines relevant fields into a single searchable text string:

**Fields Combined:**
- `bio` - Professional biography
- `skills[]` - Array of skills (joined with commas)
- `can_help` - What they can help with
- `needs_help` - What they need help with
- `ai_usage` - AI usage description
- `looking_for[]` - What they're looking for
- `startup_description` - Startup description

**Custom Fields (from CUSTOM_FIELDS_GUIDE.md):**
- `custom_1` - Enhanced/parsed bio
- `custom_array_1` - Parsed/extracted skills
- `custom_array_2` - Interests/hobbies
- `custom_array_5` - Custom tags

**Example Searchable Text:**
```
QA Lead with department management experience, transformation coaching

Skills: коучинг, Soft Skills менторинг, QA менторинг, тестирование

Can help with: выявление и умение справляться с ограничениями, установками...

Needs help with: Сейчас в поиске проектов для себя как QA Lead + AI...

Looking for: Единомышленников

Interests: hiking, reading, coffee

Tags: mentor, qa-expert
```

### Step 2: Embedding Generation

The script calls OpenAI's embedding API:
- **Model**: `text-embedding-3-small` (or configurable via env var)
- **Dimensions**: 1536 (matches database schema)
- **Output**: Array of 1536 floating-point numbers

### Step 3: Storage

The embedding vector is stored in the `embedding` column of the `participants` table as a `vector(1536)` type.

## Integration with Similarity Search

### The Flow

```
User Query: "Who knows Rust and likes hiking?"
         │
         ▼
┌──────────────────────────┐
│  Generate Query Embedding│
│  (OpenAI API)            │
└────────┬─────────────────┘
         │
         │ 1536-dim vector
         ▼
┌──────────────────────────┐
│  similaritySearch()      │
│  (participants.ts)       │
└────────┬─────────────────┘
         │
         │ Call RPC function
         ▼
┌──────────────────────────┐
│  match_participants()    │
│  (Postgres RPC)          │
│  - Cosine similarity     │
│  - Filter by threshold   │
│  - Sort by similarity    │
└────────┬─────────────────┘
         │
         │ Matching participants
         ▼
┌──────────────────────────┐
│  Return Results          │
│  (sorted by relevance)   │
└──────────────────────────┘
```

### Code Example

```typescript
// 1. Generate embedding for user query
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const queryText = "Who knows Rust and likes hiking?";

const embeddingResponse = await openai.embeddings.create({
  model: "text-embedding-3-small",
  input: queryText,
  dimensions: 1536,
});

const queryEmbedding = embeddingResponse.data[0].embedding;

// 2. Search for similar participants
import { similaritySearch } from "@/lib/supabase/participants";

const results = await similaritySearch({
  embedding: queryEmbedding,
  limit: 10,
  threshold: 0.5, // Minimum similarity score (0-1)
});

// 3. Results are sorted by similarity (highest first)
results.forEach((participant, index) => {
  console.log(`${index + 1}. ${participant.name} (similarity: ${similarity})`);
});
```

### How Similarity Works

The `match_participants` RPC function (from migration `002_create_similarity_search_function.sql`) uses **cosine similarity**:

1. Takes the query embedding vector
2. Compares it with all participant embeddings using cosine similarity
3. Filters results where similarity >= threshold (default 0.5)
4. Sorts by similarity (highest first)
5. Returns top N results

**Cosine Similarity Formula:**
```
similarity = dot(A, B) / (||A|| * ||B||)
```

- **1.0** = Identical vectors (perfect match)
- **0.0** = Orthogonal vectors (no similarity)
- **-1.0** = Opposite vectors (unlikely in embeddings)

## Running the Pipeline

### Generate Embeddings for All Participants

```bash
npx tsx scripts/generate-embeddings.ts
```

This will:
- Skip participants that already have embeddings
- Process participants in batches of 10
- Handle errors gracefully
- Show progress and summary

### Regenerate All Embeddings

```bash
npx tsx scripts/generate-embeddings.ts --all
```

Useful when:
- You've updated the text building logic
- Participant data has changed significantly
- You want to use a different embedding model

### Generate for Specific Participants

```bash
npx tsx scripts/generate-embeddings.ts --participant-id=1,2,3
```

Useful for:
- Testing the pipeline
- Regenerating embeddings after updating specific participants
- Fixing failed embeddings

## Best Practices

### When to Regenerate Embeddings

✅ **Regenerate when:**
- Participant data is updated (bio, skills, etc.)
- Custom fields are populated/updated
- You change the text building logic
- You switch embedding models

❌ **Don't regenerate:**
- On every status update (traffic light)
- For minor metadata changes
- If embeddings are recent (< 1 week old)

### Performance Considerations

- **Batch Processing**: Script processes 10 participants at a time
- **Rate Limiting**: 1 second delay between batches
- **Error Handling**: Individual failures don't stop the entire run
- **Cost**: Very cheap (~$0.0003 per 31 participants)

### Monitoring

Check embedding coverage:
```sql
-- Count participants with embeddings
SELECT 
  COUNT(*) FILTER (WHERE embedding IS NOT NULL) as with_embeddings,
  COUNT(*) FILTER (WHERE embedding IS NULL) as without_embeddings,
  COUNT(*) as total
FROM participants;
```

## Troubleshooting

### No Results from Similarity Search

**Possible causes:**
1. Embeddings not generated - Run the embedding script
2. Threshold too high - Lower the threshold (try 0.3)
3. Query embedding mismatch - Ensure query uses same model/dimensions

### Low Quality Results

**Solutions:**
1. Improve text building - Include more relevant fields
2. Lower threshold - Allows more results
3. Regenerate embeddings - May improve quality if data changed

### API Rate Limits

**Solutions:**
1. Increase batch delay (in script)
2. Process in smaller batches
3. Use OpenAI's batch API for large datasets

## Future Enhancements

Potential improvements:
- **Scheduled regeneration**: Auto-update embeddings weekly
- **Incremental updates**: Only regenerate when data changes
- **Batch API**: Use OpenAI's batch endpoint for better rate limits
- **Multiple models**: Compare different embedding models
- **Hybrid search**: Combine vector search with keyword search

## Related Files

- `scripts/generate-embeddings.ts` - Main embedding generation script
- `src/lib/supabase/participants.ts` - Similarity search functions
- `supabase/migrations/002_create_similarity_search_function.sql` - RPC function
- `init-docs/CUSTOM_FIELDS_GUIDE.md` - Field mapping guide

