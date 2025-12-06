/**
 * Data access layer for participants (Server-side)
 * Handles all database operations with proper type safety
 * 
 * NOTE: For client components, use functions from ./participants-client.ts
 */

import { dbParticipantToApp } from "./transform";
import type { Participant, PaginationParams, PaginatedResponse, TrafficLightStatusUpdate, SimilaritySearchParams } from "@/types";
import type { DatabaseParticipant, TrafficLightUpdate, SimilaritySearchResult } from "@/types/database";

/**
 * Fetch all participants with optional pagination
 * Server-side function
 * 
 * @param params - Pagination parameters
 * @returns Paginated list of participants
 */
export async function getAllParticipants(
  params: PaginationParams = {}
): Promise<PaginatedResponse<Participant>> {
  // Dynamic import to avoid loading server code in client components
  const { createServerSupabaseClient } = await import("./client-server");
  const supabase = createServerSupabaseClient();
  const page = params.page ?? 1;
  const limit = params.limit ?? 50;
  const offset = (page - 1) * limit;

  // Get total count
  const { count, error: countError } = await supabase
    .from("participants")
    .select("*", { count: "exact", head: true });

  if (countError) {
    throw new Error(`Failed to count participants: ${countError.message}`);
  }

  // Get paginated data
  const { data, error } = await supabase
    .from("participants")
    .select("*")
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    throw new Error(`Failed to fetch participants: ${error.message}`);
  }

  const total = count ?? 0;
  const totalPages = Math.ceil(total / limit);

  return {
    data: (data as DatabaseParticipant[]).map(dbParticipantToApp),
    page,
    limit,
    total,
    totalPages,
  };
}

// Re-export client-side functions from participants-client.ts
export {
  getAllParticipantsClient,
  getParticipantByIdClient,
  updateTrafficLightStatusClient,
} from "./participants-client";

/**
 * Fetch a single participant by ID
 * Server-side function
 * 
 * @param id - Participant ID
 * @returns Participant or null if not found
 */
export async function getParticipantById(
  id: number
): Promise<Participant | null> {
  // Dynamic import to avoid loading server code in client components
  const { createServerSupabaseClient } = await import("./client-server");
  const supabase = createServerSupabaseClient();

  const { data, error } = await supabase
    .from("participants")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      // Not found
      return null;
    }
    throw new Error(`Failed to fetch participant: ${error.message}`);
  }

  return dbParticipantToApp(data as DatabaseParticipant);
}

/**
 * Update traffic light status fields (custom_5 and custom_6)
 * Server-side function
 * 
 * @param id - Participant ID
 * @param update - Status and availability text
 * @returns Updated participant
 */
export async function updateTrafficLightStatus(
  id: number,
  update: TrafficLightStatusUpdate
): Promise<Participant> {
  // Dynamic import to avoid loading server code in client components
  const { createServerSupabaseClient } = await import("./client-server");
  const supabase = createServerSupabaseClient();

  const dbUpdate: TrafficLightUpdate = {
    custom_5: update.status,
    custom_6: update.availabilityText ?? "",
  };

  const { data, error } = await (supabase as any)
    .from("participants")
    .update(dbUpdate)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update traffic light status: ${error.message}`);
  }

  return dbParticipantToApp(data as DatabaseParticipant);
}

/**
 * Perform vector similarity search on embeddings
 * Uses cosine similarity via pgvector
 * Server-side function
 * 
 * @param params - Search parameters (embedding vector, limit, optional threshold)
 * @returns Array of participants sorted by similarity
 */
export async function similaritySearch(
  params: SimilaritySearchParams
): Promise<Participant[]> {
  // Dynamic import to avoid loading server code in client components
  const { createServerSupabaseClient } = await import("./client-server");
  const supabase = createServerSupabaseClient();
  const limit = params.limit ?? 10;

  // Use RPC function for efficient vector similarity search
  // The embedding is passed as an array, Supabase will convert it to vector type
  const rpcResult = await (supabase as any).rpc("match_participants", {
    query_embedding: params.embedding,
    match_limit: limit,
    match_threshold: params.threshold ?? 0.5,
  }) as { data: any[] | null; error: any };
  const { data, error } = rpcResult;

  // If RPC function doesn't exist, fall back to a query-based approach
  if (error && error.code === "42883") {
    // Function doesn't exist, use a workaround with ordering
    // This is less efficient but works without custom functions
    const { data: allData, error: queryError } = await supabase
      .from("participants")
      .select("*")
      .not("embedding", "is", null)
      .limit(limit * 3); // Get more to filter

    if (queryError) {
      throw new Error(`Failed to perform similarity search: ${queryError.message}`);
    }

    // Calculate cosine similarity in memory (fallback)
    // In production, use the RPC function or a Postgres function
    const participantsWithSimilarity = (allData as DatabaseParticipant[])
      .map((p) => {
        if (!p.embedding || p.embedding.length !== params.embedding.length) {
          return { participant: p, similarity: -1 };
        }

        // Cosine similarity calculation
        let dotProduct = 0;
        let normA = 0;
        let normB = 0;

        for (let i = 0; i < params.embedding.length; i++) {
          dotProduct += params.embedding[i] * p.embedding[i];
          normA += params.embedding[i] * params.embedding[i];
          normB += p.embedding[i] * p.embedding[i];
        }

        const similarity = dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));

        return { participant: p, similarity };
      })
      .filter((item) => item.similarity >= (params.threshold ?? 0.5))
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit)
      .map((item) => item.participant);

    return participantsWithSimilarity.map(dbParticipantToApp);
  }

  if (error) {
    throw new Error(`Failed to perform similarity search: ${error.message}`);
  }

  // RPC returns similarity field, but we only need the participant data
  return (data as SimilaritySearchResult[]).map((result) => {
    const { similarity, ...participant } = result;
    return dbParticipantToApp(participant as DatabaseParticipant);
  });
}

