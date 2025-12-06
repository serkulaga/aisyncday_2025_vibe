# Supabase Database Setup

## Quick Start

### 1. Enable pgvector Extension

In Supabase Dashboard → Database → Extensions:
- Search for "vector"
- Click "Enable"

Or run in SQL Editor:
```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

### 2. Run Migration

**Option A: Supabase Dashboard (Easiest)**
1. Go to SQL Editor
2. Copy contents of `migrations/001_create_participants_table.sql`
3. Paste and click "Run"

**Option B: Supabase CLI**
```bash
supabase db push
```

### 3. Verify

Run in SQL Editor:
```sql
-- Check table exists
SELECT COUNT(*) FROM participants;

-- Check columns
\d participants

-- Check indexes
SELECT indexname FROM pg_indexes WHERE tablename = 'participants';

-- Check RLS is enabled
SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'participants';
```

## Column Name Mapping

The database uses **snake_case** while JSON uses **camelCase**:

| JSON Field | Database Column | Type |
|------------|----------------|------|
| `id` | `id` | INTEGER |
| `name` | `name` | TEXT |
| `email` | `email` | TEXT |
| `hasStartup` | `has_startup` | BOOLEAN |
| `startupStage` | `startup_stage` | TEXT |
| `startupDescription` | `startup_description` | TEXT |
| `startupName` | `startup_name` | TEXT |
| `lookingFor` | `looking_for` | TEXT[] |
| `canHelp` | `can_help` | TEXT |
| `needsHelp` | `needs_help` | TEXT |
| `aiUsage` | `ai_usage` | TEXT |
| `custom_1` through `custom_7` | `custom_1` through `custom_7` | TEXT |
| `custom_array_1` through `custom_array_7` | `custom_array_1` through `custom_array_7` | TEXT[] |
| `_note` | `_note` | TEXT |

## Next Steps

After running the migration:
1. Seed the database with `participants_mocked.json` data
2. Generate embeddings for all participants
3. Test queries and RLS policies

See `docs/DATABASE_SCHEMA.md` for complete documentation.

