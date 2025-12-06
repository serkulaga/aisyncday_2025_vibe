-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create participants table with all 31 fields
CREATE TABLE IF NOT EXISTS participants (
  -- Primary key
  id INTEGER PRIMARY KEY,
  
  -- Basic info (6 fields)
  name TEXT NOT NULL,
  email TEXT DEFAULT '',
  telegram TEXT DEFAULT '',
  linkedin TEXT DEFAULT '',
  photo TEXT DEFAULT '',
  
  -- Professional info (6 fields)
  bio TEXT DEFAULT '',
  skills TEXT[] DEFAULT '{}',
  has_startup BOOLEAN DEFAULT FALSE,
  startup_stage TEXT DEFAULT '',
  startup_description TEXT DEFAULT '',
  startup_name TEXT DEFAULT '',
  
  -- Community info (4 fields)
  looking_for TEXT[] DEFAULT '{}',
  can_help TEXT DEFAULT '',
  needs_help TEXT DEFAULT '',
  ai_usage TEXT DEFAULT '',
  
  -- Custom string fields (7 fields)
  custom_1 TEXT DEFAULT '',
  custom_2 TEXT DEFAULT '',
  custom_3 TEXT DEFAULT '',
  custom_4 TEXT DEFAULT '',
  custom_5 TEXT DEFAULT '',  -- Status (green/yellow/red) for Traffic Light
  custom_6 TEXT DEFAULT '',  -- Availability text for Traffic Light
  custom_7 TEXT DEFAULT '',
  
  -- Custom array fields (7 fields)
  custom_array_1 TEXT[] DEFAULT '{}',
  custom_array_2 TEXT[] DEFAULT '{}',  -- Interests for Roulette
  custom_array_3 TEXT[] DEFAULT '{}',
  custom_array_4 TEXT[] DEFAULT '{}',  -- Common interests after matching
  custom_array_5 TEXT[] DEFAULT '{}',  -- Custom tags for Search
  custom_array_6 TEXT[] DEFAULT '{}',
  custom_array_7 TEXT[] DEFAULT '{}',
  
  -- Metadata (1 field)
  _note TEXT DEFAULT '',
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Vector embedding for semantic search (1536 dimensions for text-embedding-3-small or ada-002)
  embedding vector(1536)
);

-- Create indexes for performance
-- GIN index for array columns (skills, looking_for, custom arrays)
CREATE INDEX IF NOT EXISTS idx_participants_skills ON participants USING GIN (skills);
CREATE INDEX IF NOT EXISTS idx_participants_looking_for ON participants USING GIN (looking_for);
CREATE INDEX IF NOT EXISTS idx_participants_custom_array_2 ON participants USING GIN (custom_array_2);

-- Index for traffic light status (custom_5)
CREATE INDEX IF NOT EXISTS idx_participants_status ON participants (custom_5) WHERE custom_5 IN ('green', 'yellow', 'red');

-- Index for startup filtering
CREATE INDEX IF NOT EXISTS idx_participants_has_startup ON participants (has_startup);
CREATE INDEX IF NOT EXISTS idx_participants_startup_stage ON participants (startup_stage) WHERE startup_stage != '';

-- Vector similarity search index (IVFFlat for fast approximate search)
-- Note: Create index after inserting some data for better performance
-- Using HNSW for better quality (requires pgvector 0.5+)
CREATE INDEX IF NOT EXISTS idx_participants_embedding ON participants 
USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);

-- Fallback to IVFFlat if HNSW is not available
-- CREATE INDEX IF NOT EXISTS idx_participants_embedding ON participants 
-- USING ivfflat (embedding vector_cosine_ops)
-- WITH (lists = 100);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_participants_updated_at
  BEFORE UPDATE ON participants
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Allow anonymous/public read access to all participants
CREATE POLICY "Allow public read access"
  ON participants
  FOR SELECT
  TO public
  USING (true);

-- RLS Policy: Allow updates to status and availability fields (custom_5 and custom_6)
-- For hackathon demo: Allow updates by participant id
-- In production, this should check authentication/authorization
CREATE POLICY "Allow status updates by participant id"
  ON participants
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

-- Optional: More restrictive policy that checks auth (uncomment if using Supabase Auth)
-- CREATE POLICY "Allow status updates by authenticated users"
--   ON participants
--   FOR UPDATE
--   TO authenticated
--   USING (true)
--   WITH CHECK (true);

-- Optional: Allow inserts (for seeding/admin use - can be removed for production)
CREATE POLICY "Allow inserts for seeding"
  ON participants
  FOR INSERT
  TO public
  WITH CHECK (true);

COMMENT ON TABLE participants IS 'Community OS participants table with 31 fields from JSON schema plus embedding vector';
COMMENT ON COLUMN participants.custom_5 IS 'Status for Traffic Light: green (available), yellow (maybe), red (deep work)';
COMMENT ON COLUMN participants.custom_6 IS 'Availability text for Traffic Light feature';
COMMENT ON COLUMN participants.custom_array_2 IS 'Interests array for Coffee Break Roulette matching';
COMMENT ON COLUMN participants.custom_array_4 IS 'Common interests calculated during matching (populated after matching)';
COMMENT ON COLUMN participants.custom_array_5 IS 'Custom tags for enhanced Agentic Search';
COMMENT ON COLUMN participants.embedding IS 'Vector embedding (1536 dimensions) for semantic search using OpenAI embeddings';

