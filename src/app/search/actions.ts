"use server";

/**
 * Server Actions for Agentic Search
 * 
 * Provides type-safe server actions for search functionality
 */

import { performAgenticSearch } from "@/lib/search/agentic-search";
import type { SearchOptions, SearchResult } from "@/lib/search/types";

/**
 * Search for participants using natural language query
 * 
 * @param query - Natural language search query
 * @param options - Search options (limit, filters, etc.)
 * @returns Search results with participants and explanation
 */
export async function searchParticipants(
  query: string,
  options?: SearchOptions
): Promise<SearchResult> {
  // Validate input
  if (!query || typeof query !== "string") {
    return {
      error: "Query must be a non-empty string",
      code: "INVALID_QUERY",
      details: "Please provide a valid search query",
    };
  }

  // Sanitize query (basic validation)
  const sanitizedQuery = query.trim();
  if (sanitizedQuery.length === 0) {
    return {
      error: "Query cannot be empty",
      code: "INVALID_QUERY",
      details: "Please provide a search query",
    };
  }

  if (sanitizedQuery.length > 500) {
    return {
      error: "Query is too long",
      code: "INVALID_QUERY",
      details: "Query must be less than 500 characters",
    };
  }

  // Perform search
  try {
    return await performAgenticSearch(sanitizedQuery, options);
  } catch (error) {
    // Unexpected error handling
    console.error("Unexpected error in searchParticipants:", error);
    return {
      error: "An unexpected error occurred",
      code: "SEARCH_FAILED",
      details:
        error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

