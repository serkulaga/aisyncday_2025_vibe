/**
 * Client-side data access layer for participants
 * Safe to import in client components
 */

import { createClient } from "./client-browser";
import { dbParticipantToApp } from "./transform";
import type { Participant, PaginationParams, PaginatedResponse, TrafficLightStatusUpdate } from "@/types";
import type { DatabaseParticipant, TrafficLightUpdate } from "@/types/database";

/**
 * Fetch all participants (client-side version)
 * Use this in client components
 * 
 * @param params - Pagination parameters
 * @returns Paginated list of participants
 */
export async function getAllParticipantsClient(
  params: PaginationParams = {}
): Promise<PaginatedResponse<Participant>> {
  const supabase = createClient();
  const page = params.page ?? 1;
  const limit = params.limit ?? 20;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data, error, count } = await supabase
    .from("participants")
    .select("*", { count: "exact" })
    .order("id", { ascending: true })
    .range(from, to);

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

/**
 * Fetch a single participant by ID (client-side version)
 * 
 * @param id - Participant ID
 * @returns Participant or null if not found
 */
export async function getParticipantByIdClient(
  id: number
): Promise<Participant | null> {
  const supabase = createClient();

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
 * Update traffic light status fields (client-side version)
 * 
 * @param id - Participant ID
 * @param update - Status and availability text
 * @returns Updated participant
 */
export async function updateTrafficLightStatusClient(
  id: number,
  update: TrafficLightStatusUpdate
): Promise<Participant> {
  const supabase = createClient();

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

