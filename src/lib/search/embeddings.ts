/**
 * Query Embedding Generation
 * 
 * Generates embeddings for user queries using OpenAI API
 * Uses the same model as participant embeddings for consistency
 */

import OpenAI from "openai";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Default embedding model (should match the one used for participants)
 */
const DEFAULT_EMBEDDING_MODEL =
  process.env.OPENAI_EMBEDDING_MODEL || "text-embedding-3-small";

/**
 * Generate embedding for a query string
 * 
 * @param query - Natural language query
 * @returns Embedding vector and metadata
 */
export async function generateQueryEmbedding(query: string): Promise<{
  embedding: number[];
  model: string;
  timeMs: number;
}> {
  const startTime = Date.now();

  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY environment variable is not set");
  }

  if (!query || query.trim().length === 0) {
    throw new Error("Query cannot be empty");
  }

  try {
    const response = await openai.embeddings.create({
      model: DEFAULT_EMBEDDING_MODEL,
      input: query.trim(),
    });

    const embedding = response.data[0]?.embedding;

    if (!embedding || embedding.length === 0) {
      throw new Error("Received empty embedding from OpenAI");
    }

    const timeMs = Date.now() - startTime;

    return {
      embedding,
      model: DEFAULT_EMBEDDING_MODEL,
      timeMs,
    };
  } catch (error) {
    if (error instanceof OpenAI.APIError) {
      throw new Error(
        `OpenAI API error: ${error.message} (status: ${error.status})`
      );
    }
    throw error;
  }
}

/**
 * Get the expected embedding dimensionality
 * This should match the dimension of participant embeddings
 */
export function getEmbeddingDimension(): number {
  // text-embedding-3-small has 1536 dimensions by default
  // text-embedding-ada-002 has 1536 dimensions
  // Adjust based on your model
  return 1536;
}

