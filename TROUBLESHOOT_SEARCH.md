# Troubleshooting: Search Not Finding Results

## Current Issue
Embeddings exist (31 skipped) but search returns no results for "computer vision".

## Solutions

### Solution 1: Force Regenerate Embeddings (Recommended)

The embeddings might be old or incorrectly generated. Force regenerate them:

```bash
npx tsx scripts/generate-embeddings.ts --all
```

This will:
- Regenerate ALL embeddings from scratch
- Ensure embeddings are correctly generated
- Takes ~1-2 minutes

### Solution 2: Lower Threshold (Already Applied)

I've lowered the default threshold from `0.5` to `0.3` in the code. This means:
- **0.5 threshold**: Requires 50% similarity (very strict)
- **0.3 threshold**: Requires 30% similarity (more lenient, better recall)

The code change is already applied. **Restart your dev server** for it to take effect:
```bash
# Press Ctrl+C to stop
npm run dev
```

### Solution 3: Verify Participant Data

Check if participant ID 2 actually has "computer vision" in their skills:

1. Go to Supabase Dashboard
2. Open Table Editor → `participants`
3. Find participant with `id = 2`
4. Check the `skills` column
5. Verify "computer vision" is in the array

### Solution 4: Check Embedding Text Generation

Embeddings are generated from combined text fields. Verify what's being embedded by checking:
- `bio`
- `skills` array
- `ai_usage`
- `can_help`
- `needs_help`
- `custom_array_1` (extra skills)
- `custom_array_2` (interests)

### Solution 5: Test with Broader Query

Try searching for:
- "vision" (shorter, might match better)
- "machine learning" (broader term)
- "AI" (even broader)

If broader queries work, the threshold might still be too high for specific terms.

## Debug Mode

Enable debug mode to see what's happening:

```typescript
// In src/app/search/search-interface.tsx, change:
includeDebug: true,
```

This will show:
- Similarity scores
- Embedding generation time
- Vector search time
- Number of matches found

## Next Steps

1. **Regenerate embeddings** with `--all` flag
2. **Restart dev server** (to pick up threshold change)
3. **Try searching again** for "computer vision"
4. If still not working, try broader queries like "vision" or "AI"

## Common Issues

### Issue: RPC function not found
**Error:** `function match_participants does not exist`

**Fix:** Run the migration:
```sql
-- Run supabase/migrations/002_create_similarity_search_function.sql
-- In Supabase Dashboard → SQL Editor
```

### Issue: Embeddings are null
**Check:** In Supabase, verify `embedding` column is not null:
```sql
SELECT id, name, embedding IS NULL as has_no_embedding 
FROM participants 
WHERE embedding IS NULL;
```

**Fix:** Regenerate embeddings for those participants.

