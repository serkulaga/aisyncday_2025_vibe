/**
 * Agentic Search Types
 * 
 * Type definitions for the Agentic Search feature
 */

import type { Participant } from "@/types";

/**
 * Search request options
 */
export interface SearchOptions {
  limit?: number;                 // Default: 10, max: 20
  excludeRedStatus?: boolean;     // Default: false
  matchThreshold?: number;        // Default: 0.5 (0.0 - 1.0)
  includeDebug?: boolean;         // Default: false (for development)
}

/**
 * Matched field information for a participant
 */
export interface MatchedFields {
  skills?: string[];
  interests?: string[];
  canHelp?: boolean;
  needsHelp?: boolean;
  bio?: string;
}

/**
 * A participant with match information
 */
export interface ParticipantMatch {
  participant: Participant;
  relevanceScore: number;         // Final relevance score (0-1)
  matchedFields: MatchedFields;   // Fields that matched the query
  similarityScore?: number;        // Raw vector similarity score (if available)
}

/**
 * Search metadata
 */
export interface SearchMetadata {
  totalMatches: number;           // Total participants found
  returnedCount: number;          // Number returned (after limit)
  searchTimeMs: number;           // Time taken for search
  query: string;                  // Echo of original query
}

/**
 * Debug information (optional)
 */
export interface SearchDebugInfo {
  embeddingModel: string;
  similarityScores: number[];
  rerankScores?: number[];
  llmModel: string;
  llmTokensUsed?: number;
  embeddingGenerationTimeMs?: number;
  vectorSearchTimeMs?: number;
  llmGenerationTimeMs?: number;
}

/**
 * Search response
 */
export interface SearchResponse {
  explanation: string;            // LLM-generated explanation
  participants: ParticipantMatch[]; // Matched participants
  metadata: SearchMetadata;
  debug?: SearchDebugInfo;        // Only if includeDebug: true
}

/**
 * Search error codes
 */
export type SearchErrorCode =
  | "EMBEDDING_FAILED"
  | "SEARCH_FAILED"
  | "LLM_FAILED"
  | "INVALID_QUERY"
  | "NO_EMBEDDINGS_AVAILABLE";

/**
 * Search error response
 */
export interface SearchError {
  error: string;
  code: SearchErrorCode;
  details?: string;
}

/**
 * Result type that can be either success or error
 */
export type SearchResult = SearchResponse | SearchError;

/**
 * Check if a result is an error
 */
export function isSearchError(result: SearchResult): result is SearchError {
  return "code" in result && "error" in result;
}

