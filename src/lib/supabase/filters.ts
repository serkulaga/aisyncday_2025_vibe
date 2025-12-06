/**
 * Filter and search functions for participants
 */

import { createServerSupabaseClient } from "./client-server";
import { dbParticipantToApp } from "./transform";
import type { Participant } from "@/types";
import type { DatabaseParticipant } from "@/types/database";

export interface ParticipantFilters {
  search?: string;
  skill?: string;
}

/**
 * Fetch participants with filters
 */
export async function getParticipantsWithFilters(
  filters: ParticipantFilters = {},
  limit: number = 50
): Promise<Participant[]> {
  const supabase = createServerSupabaseClient();

  let query = supabase.from("participants").select("*");

  // Filter by skill (array contains)
  if (filters.skill) {
    query = query.contains("skills", [filters.skill]);
  }

  // Search by name (case-insensitive)
  if (filters.search) {
    query = query.ilike("name", `%${filters.search}%`);
  }

  // Apply limit and ordering
  query = query.order("created_at", { ascending: false }).limit(limit);

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch participants: ${error.message}`);
  }

  return (data as DatabaseParticipant[]).map(dbParticipantToApp);
}

/**
 * Get all unique skills from participants (server-side)
 */
export async function getAllSkillsServer(): Promise<string[]> {
  const supabase = createServerSupabaseClient();

  const { data, error } = await supabase
    .from("participants")
    .select("skills");

  if (error) {
    throw new Error(`Failed to fetch skills: ${error.message}`);
  }

  const skillSet = new Set<string>();
  (data as Pick<DatabaseParticipant, "skills">[]).forEach((p) => {
    if (p.skills && Array.isArray(p.skills)) {
      p.skills.forEach((skill) => {
        if (skill && typeof skill === "string") {
          const normalized = skill.trim();
          if (normalized) {
            skillSet.add(normalized);
          }
        }
      });
    }
  });

  return Array.from(skillSet).sort();
}

