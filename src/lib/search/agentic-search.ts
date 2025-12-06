/**
 * Agentic Search - Main Orchestration
 * 
 * Coordinates the full search pipeline:
 * 1. Query → Embedding
 * 2. Vector Similarity Search
 * 3. Re-ranking
 * 4. LLM Explanation Generation
 */

import { generateQueryEmbedding } from "./embeddings";
import { rerankParticipants } from "./rerank";
import { generateExplanation } from "./explain";
import type {
  SearchOptions,
  SearchResponse,
  SearchError,
  SearchResult,
  ParticipantMatch,
} from "./types";
import type { Participant } from "@/types";
import { createServerSupabaseClient } from "@/lib/supabase/client-server";
import { dbParticipantToApp } from "@/lib/supabase/transform";
import type { DatabaseParticipant } from "@/types/database";

/**
 * Default search options
 */
const DEFAULT_OPTIONS: Required<SearchOptions> = {
  limit: 10,
  excludeRedStatus: false,
  matchThreshold: 0.3, // Lowered from 0.5 to 0.3 for better recall
  includeDebug: false,
};

/**
 * Check if embeddings are available in the database
 * 
 * @returns true if at least one participant has an embedding
 */
async function checkEmbeddingsAvailable(): Promise<boolean> {
  const supabase = createServerSupabaseClient();

  const { data, error } = await supabase
    .from("participants")
    .select("id")
    .not("embedding", "is", null)
    .limit(1)
    .single();

  // If we get any data, embeddings exist
  return !error && data !== null;
}

/**
 * Perform agentic search
 * 
 * @param query - Natural language query
 * @param options - Search options
 * @returns Search results or error
 */
export async function performAgenticSearch(
  query: string,
  options: SearchOptions = {}
): Promise<SearchResult> {
  const startTime = Date.now();
  const opts = { ...DEFAULT_OPTIONS, ...options };

  // Validate query
  if (!query || query.trim().length === 0) {
    return {
      error: "Query cannot be empty",
      code: "INVALID_QUERY",
      details: "Please provide a search query",
    };
  }

  // Limit validation
  if (opts.limit > 20) {
    opts.limit = 20; // Cap at 20
  }

  const debug: any = {};

  try {
    // Check if embeddings are available
    const embeddingsAvailable = await checkEmbeddingsAvailable();
    if (!embeddingsAvailable) {
      return {
        error:
          "No embeddings available. Please run the embedding generation script first.",
        code: "NO_EMBEDDINGS_AVAILABLE",
        details:
          "Run: npx tsx scripts/generate-embeddings.ts to generate participant embeddings",
      };
    }

    // Step 1: Generate query embedding
    let embeddingResult;
    try {
      embeddingResult = await generateQueryEmbedding(query);
      if (opts.includeDebug) {
        debug.embeddingModel = embeddingResult.model;
        debug.embeddingGenerationTimeMs = embeddingResult.timeMs;
      }
    } catch (error) {
      return {
        error: "Failed to generate query embedding",
        code: "EMBEDDING_FAILED",
        details:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }

    // Step 2: Vector similarity search
    let searchResultsWithScores: Array<{
      participant: Participant;
      similarityScore: number;
    }>;
    let vectorSearchTimeMs = 0;
    try {
      const searchStartTime = Date.now();
      const supabase = createServerSupabaseClient();

      // Use RPC function which returns similarity scores
      // Get more candidates for re-ranking (5x limit to ensure we catch skill matches)
      // Use lower threshold to cast wider net, reranking will boost exact matches
      const rpcResult = await supabase.rpc("match_participants", {
        query_embedding: embeddingResult.embedding,
        match_limit: opts.limit * 5, // Get more candidates (was * 2)
        match_threshold: Math.max(0.1, opts.matchThreshold - 0.1), // Lower threshold for initial search
      } as any) as { data: any[] | null; error: any };
      const { data, error } = rpcResult;

      if (error) {
        throw new Error(`Similarity search failed: ${error.message}`);
      }

      if (!data || data.length === 0) {
        searchResultsWithScores = [];
      } else {
        // Transform database participants and extract similarity scores
        searchResultsWithScores = data.map((row: any) => {
          // Extract similarity score (RPC function returns it)
          const similarity = row.similarity ?? 0.5;
          
          // Remove similarity from row before transforming
          const { similarity: _, ...participantData } = row;
          
          return {
            participant: dbParticipantToApp(participantData as DatabaseParticipant),
            similarityScore: similarity,
          };
        });
      }

      vectorSearchTimeMs = Date.now() - searchStartTime;

      if (opts.includeDebug) {
        debug.vectorSearchTimeMs = vectorSearchTimeMs;
        debug.similarityScores = searchResultsWithScores.map((s) => s.similarityScore);
      }
    } catch (error) {
      return {
        error: "Failed to perform similarity search",
        code: "SEARCH_FAILED",
        details:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }

    // Filter out red status if requested
    if (opts.excludeRedStatus) {
      searchResultsWithScores = searchResultsWithScores.filter(
        (item) => item.participant.custom_5?.toLowerCase().trim() !== "red"
      );
    }

    if (searchResultsWithScores.length === 0) {
      return {
        explanation:
          "No participants matched your query. Try different keywords or broaden your search.",
        participants: [],
        metadata: {
          totalMatches: 0,
          returnedCount: 0,
          searchTimeMs: Date.now() - startTime,
          query: query.trim(),
        },
        ...(opts.includeDebug ? { debug } : {}),
      };
    }

    // Step 3: Re-rank based on keyword matching
    const reranked = rerankParticipants(searchResultsWithScores, query);

    if (opts.includeDebug && !debug.rerankScores) {
      debug.rerankScores = reranked.map((p) => p.relevanceScore);
    }

    // Apply limit
    const finalParticipants = reranked.slice(0, opts.limit);

    // Step 4: Generate LLM explanation
    let explanationResult;
    try {
      explanationResult = await generateExplanation(query, finalParticipants);
      if (opts.includeDebug) {
        debug.llmModel = explanationResult.model;
        debug.llmTokensUsed = explanationResult.tokensUsed;
        debug.llmGenerationTimeMs = explanationResult.timeMs;
      }
    } catch (error) {
      // If LLM fails, still return results with a simple explanation
      console.error("LLM explanation generation failed:", error);
      explanationResult = {
        explanation: `Found ${finalParticipants.length} participant${finalParticipants.length !== 1 ? "s" : ""} matching your query.`,
        model: "none",
        timeMs: 0,
      };
    }

    const searchTimeMs = Date.now() - startTime;

    const response: SearchResponse = {
      explanation: explanationResult.explanation,
      participants: finalParticipants,
      metadata: {
        totalMatches: searchResultsWithScores.length,
        returnedCount: finalParticipants.length,
        searchTimeMs,
        query: query.trim(),
      },
    };

    if (opts.includeDebug) {
      response.debug = debug;
    }

    return response;
  } catch (error) {
    // Catch-all for unexpected errors
    return {
      error: "An unexpected error occurred during search",
      code: "SEARCH_FAILED",
      details:
        error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

