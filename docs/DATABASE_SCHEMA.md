# Database Schema Documentation

## Overview

The `participants` table stores all participant data for the Community OS application. It includes all 31 fields from the JSON schema plus vector embeddings for semantic search and timestamp fields.

## Table Structure

### Table Name: `participants`

## Column Mappings

### Primary Key
- **`id`** (INTEGER, PRIMARY KEY)
  - Maps to: JSON `id`
  - Purpose: Unique identifier for each participant
  - Type: Integer matching JSON structure

### Basic Info (6 fields)
- **`name`** (TEXT, NOT NULL)
  - Maps to: JSON `name`
  - Purpose: Participant's full name
  - Constraints: Required field

- **`email`** (TEXT, DEFAULT '')
  - Maps to: JSON `email`
  - Purpose: Email address (empty in mocked data)

- **`telegram`** (TEXT, DEFAULT '')
  - Maps to: JSON `telegram`
  - Purpose: Telegram username/contact

- **`linkedin`** (TEXT, DEFAULT '')
  - Maps to: JSON `linkedin`
  - Purpose: LinkedIn profile URL

- **`photo`** (TEXT, DEFAULT '')
  - Maps to: JSON `photo`
  - Purpose: Profile photo URL

### Professional Info (6 fields)
- **`bio`** (TEXT, DEFAULT '')
  - Maps to: JSON `bio`
  - Purpose: Professional biography
  - Used in: Agentic Search (combined with other fields for embeddings)

- **`skills`** (TEXT[], DEFAULT '{}')
  - Maps to: JSON `skills`
  - Purpose: Array of skills/expertise
  - Used in: Agentic Search, Coffee Break Roulette (skill matching)
  - Indexed: GIN index for fast array searches

- **`has_startup`** (BOOLEAN, DEFAULT FALSE)
  - Maps to: JSON `hasStartup`
  - Purpose: Whether participant has a startup

- **`startup_stage`** (TEXT, DEFAULT '')
  - Maps to: JSON `startupStage`
  - Purpose: Stage of startup (e.g., "MVP / прототип", "Растущий бизнес")
  - Used in: Coffee Break Roulette (non-obvious connections)

- **`startup_description`** (TEXT, DEFAULT '')
  - Maps to: JSON `startupDescription`
  - Purpose: Description of the startup

- **`startup_name`** (TEXT, DEFAULT '')
  - Maps to: JSON `startupName`
  - Purpose: Name of the startup

### Community Info (4 fields)
- **`looking_for`** (TEXT[], DEFAULT '{}')
  - Maps to: JSON `lookingFor`
  - Purpose: Array of what participant is looking for (e.g., "Инвестора", "Единомышленников")
  - Used in: Agentic Search, Coffee Break Roulette
  - Indexed: GIN index for fast array searches

- **`can_help`** (TEXT, DEFAULT '')
  - Maps to: JSON `canHelp`
  - Purpose: What participant can help with
  - Used in: Agentic Search (combined for embeddings), Skill Exchange Board

- **`needs_help`** (TEXT, DEFAULT '')
  - Maps to: JSON `needsHelp`
  - Purpose: What participant needs help with
  - Used in: Agentic Search (combined for embeddings), Skill Exchange Board, Coffee Break Roulette (complementary matching)

- **`ai_usage`** (TEXT, DEFAULT '')
  - Maps to: JSON `aiUsage`
  - Purpose: Description of AI usage
  - Used in: Agentic Search (combined for embeddings)

### Custom String Fields (7 fields)
- **`custom_1`** (TEXT, DEFAULT '')
  - Maps to: JSON `custom_1`
  - Purpose: Enhanced/parsed bio (from Telegram/LinkedIn parsing)
  - Used in: Agentic Search

- **`custom_2`** (TEXT, DEFAULT '')
  - Maps to: JSON `custom_2`
  - Purpose: Location (if extracted from profiles)

- **`custom_3`** (TEXT, DEFAULT '')
  - Maps to: JSON `custom_3`
  - Purpose: Timezone (if extracted)

- **`custom_4`** (TEXT, DEFAULT '')
  - Maps to: JSON `custom_4`
  - Purpose: Last updated timestamp (ISO string)

- **`custom_5`** (TEXT, DEFAULT '')
  - Maps to: JSON `custom_5`
  - Purpose: **Status for Social Anxiety Traffic Light** (`green`, `yellow`, `red`)
  - Used in: Traffic Light feature, Coffee Break Roulette (filtering)
  - Indexed: Partial index for status filtering

- **`custom_6`** (TEXT, DEFAULT '')
  - Maps to: JSON `custom_6`
  - Purpose: **Availability text for Traffic Light** (e.g., "available", "busy", "deep-work")
  - Used in: Traffic Light feature

- **`custom_7`** (TEXT, DEFAULT '')
  - Maps to: JSON `custom_7`
  - Purpose: Work experience (if extracted from LinkedIn)

### Custom Array Fields (7 fields)
- **`custom_array_1`** (TEXT[], DEFAULT '{}')
  - Maps to: JSON `custom_array_1`
  - Purpose: Parsed/extracted skills (from profile parsing)

- **`custom_array_2`** (TEXT[], DEFAULT '{}')
  - Maps to: JSON `custom_array_2`
  - Purpose: **Interests/hobbies for Coffee Break Roulette**
  - Used in: Coffee Break Roulette (interest matching)
  - Indexed: GIN index for fast array searches

- **`custom_array_3`** (TEXT[], DEFAULT '{}')
  - Maps to: JSON `custom_array_3`
  - Purpose: Data sources used (e.g., `['telegram', 'linkedin']`)

- **`custom_array_4`** (TEXT[], DEFAULT '{}')
  - Maps to: JSON `custom_array_4`
  - Purpose: **Common interests calculated during matching** (populated after Coffee Break Roulette matching)
  - Used in: Coffee Break Roulette (displaying match results)

- **`custom_array_5`** (TEXT[], DEFAULT '{}')
  - Maps to: JSON `custom_array_5`
  - Purpose: **Custom tags for enhanced Agentic Search**
  - Used in: Agentic Search (additional searchable content)

- **`custom_array_6`** (TEXT[], DEFAULT '{}')
  - Maps to: JSON `custom_array_6`
  - Purpose: Reserved for future use

- **`custom_array_7`** (TEXT[], DEFAULT '{}')
  - Maps to: JSON `custom_array_7`
  - Purpose: Reserved for future use

### Metadata
- **`_note`** (TEXT, DEFAULT '')
  - Maps to: JSON `_note`
  - Purpose: Documentation note (e.g., privacy notice)

### System Fields
- **`created_at`** (TIMESTAMPTZ, DEFAULT NOW())
  - Purpose: Record creation timestamp
  - Auto-managed

- **`updated_at`** (TIMESTAMPTZ, DEFAULT NOW())
  - Purpose: Last update timestamp
  - Auto-updated via trigger

### Vector Embedding
- **`embedding`** (vector(1536))
  - Purpose: **Vector embedding for semantic search** (Agentic Search feature)
  - Dimensions: 1536 (compatible with OpenAI `text-embedding-3-small` and `text-embedding-ada-002`)
  - Indexed: HNSW index for fast cosine similarity search
  - Used in: Agentic Search (vector similarity search + RAG)

## Indexes

### Performance Indexes
1. **GIN indexes** for array columns:
   - `idx_participants_skills` - Fast skill filtering/search
   - `idx_participants_looking_for` - Fast "looking for" searches
   - `idx_participants_custom_array_2` - Fast interest matching

2. **Partial index** for status:
   - `idx_participants_status` - Fast filtering by traffic light status (green/yellow/red)

3. **Vector similarity index**:
   - `idx_participants_embedding` - HNSW index for fast cosine similarity search on embeddings

4. **Startup-related indexes**:
   - `idx_participants_has_startup` - Filter by startup presence
   - `idx_participants_startup_stage` - Filter by startup stage

## Row Level Security (RLS) Policies

### 1. Public Read Access
- **Policy:** `Allow public read access`
- **Action:** SELECT
- **Access:** Public (anonymous)
- **Purpose:** Allow anyone to view participant data (suitable for hackathon demo)

### 2. Status Updates
- **Policy:** `Allow status updates by participant id`
- **Action:** UPDATE
- **Access:** Public (for demo purposes)
- **Purpose:** Allow participants to update their status (`custom_5`) and availability (`custom_6`)
- **Note:** For production, should be restricted to authenticated users updating only their own record

### 3. Insert Policy (for seeding)
- **Policy:** `Allow inserts for seeding`
- **Action:** INSERT
- **Access:** Public
- **Purpose:** Allow initial data seeding
- **Note:** Can be removed/restricted for production

## Feature Mapping

### Agentic Search
**Fields used for embedding generation:**
- `bio`, `skills`, `can_help`, `needs_help`, `ai_usage`
- `custom_1` (enhanced bio)
- `custom_array_1` (parsed skills)
- `custom_array_2` (interests)
- `custom_array_5` (custom tags)

**Search method:** Vector similarity search using `embedding` column

### Social Anxiety Traffic Light
**Fields used:**
- `custom_5` - Status: `green` | `yellow` | `red`
- `custom_6` - Availability text

**Updates:** Real-time updates via Supabase Realtime subscriptions

### Coffee Break Roulette
**Fields used for matching:**
- `skills` + `custom_array_1` - Skill overlap (weight: 0.4)
- `custom_array_2` - Interest overlap (weight: 0.3)
- `can_help` + `needs_help` - Complementary needs (weight: 0.2)
- `startup_stage`, `custom_2` - Non-obvious connections (weight: 0.1)

**Filtering:** Only match participants with `custom_5 IN ('green', 'yellow')`

**Result storage:** `custom_array_4` stores common interests after matching

### Skill Exchange Board
**Fields used:**
- `can_help` - What participants can help with
- `needs_help` - What participants need help with
- `skills` - Skills display

## Migration Instructions

### Option 1: Supabase Dashboard
1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Paste the contents of `supabase/migrations/001_create_participants_table.sql`
4. Run the migration

### Option 2: Supabase CLI
```bash
# If using Supabase CLI
supabase db push
```

### Option 3: Manual Execution
1. Connect to your Supabase database
2. Run each section of the migration in order
3. Verify indexes were created:
   ```sql
   SELECT indexname FROM pg_indexes WHERE tablename = 'participants';
   ```

## Verification Queries

### Check table exists
```sql
SELECT * FROM information_schema.tables WHERE table_name = 'participants';
```

### Check columns
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'participants' 
ORDER BY ordinal_position;
```

### Check indexes
```sql
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'participants';
```

### Check RLS policies
```sql
SELECT policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'participants';
```

### Verify pgvector extension
```sql
SELECT * FROM pg_extension WHERE extname = 'vector';
```

## Notes

- The schema uses snake_case for column names (PostgreSQL convention) while the JSON uses camelCase. This is handled in application code.
- Vector embedding dimension (1536) matches OpenAI's `text-embedding-3-small` and `text-embedding-ada-002` models.
- HNSW index is preferred over IVFFlat for better search quality, but requires pgvector 0.5+. Fallback SQL is provided in comments.
- RLS policies are permissive for hackathon demo. For production, implement proper authentication checks.

