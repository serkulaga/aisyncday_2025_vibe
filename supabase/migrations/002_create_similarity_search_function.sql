-- Create a function for vector similarity search
-- This function performs cosine similarity search using pgvector
-- More efficient than doing similarity calculation in application code

CREATE OR REPLACE FUNCTION match_participants(
  query_embedding vector(1536),
  match_limit int DEFAULT 10,
  match_threshold float DEFAULT 0.5
)
RETURNS TABLE (
  id integer,
  name text,
  email text,
  telegram text,
  linkedin text,
  photo text,
  bio text,
  skills text[],
  has_startup boolean,
  startup_stage text,
  startup_description text,
  startup_name text,
  looking_for text[],
  can_help text,
  needs_help text,
  ai_usage text,
  custom_1 text,
  custom_2 text,
  custom_3 text,
  custom_4 text,
  custom_5 text,
  custom_6 text,
  custom_7 text,
  custom_array_1 text[],
  custom_array_2 text[],
  custom_array_3 text[],
  custom_array_4 text[],
  custom_array_5 text[],
  custom_array_6 text[],
  custom_array_7 text[],
  _note text,
  created_at timestamptz,
  updated_at timestamptz,
  embedding vector(1536),
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.name,
    p.email,
    p.telegram,
    p.linkedin,
    p.photo,
    p.bio,
    p.skills,
    p.has_startup,
    p.startup_stage,
    p.startup_description,
    p.startup_name,
    p.looking_for,
    p.can_help,
    p.needs_help,
    p.ai_usage,
    p.custom_1,
    p.custom_2,
    p.custom_3,
    p.custom_4,
    p.custom_5,
    p.custom_6,
    p.custom_7,
    p.custom_array_1,
    p.custom_array_2,
    p.custom_array_3,
    p.custom_array_4,
    p.custom_array_5,
    p.custom_array_6,
    p.custom_array_7,
    p._note,
    p.created_at,
    p.updated_at,
    p.embedding,
    -- Calculate cosine similarity (1 - cosine_distance)
    -- pgvector's cosine_distance returns 0 for identical, 2 for opposite
    -- similarity should be 1 for identical, 0 for opposite
    (1 - (p.embedding <=> query_embedding))::float AS similarity
  FROM participants p
  WHERE p.embedding IS NOT NULL
    AND (1 - (p.embedding <=> query_embedding)) >= match_threshold
  ORDER BY p.embedding <=> query_embedding
  LIMIT match_limit;
END;
$$;

COMMENT ON FUNCTION match_participants IS 'Performs cosine similarity search on participant embeddings. Returns participants ordered by similarity (highest first).';

