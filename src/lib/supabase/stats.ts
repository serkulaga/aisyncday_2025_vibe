/**
 * Statistics and analytics functions for dashboard
 */

import { createServerSupabaseClient } from "./client-server";
import type { DatabaseParticipant } from "@/types/database";

export interface DashboardStats {
  totalParticipants: number;
  statusCounts: {
    green: number;
    yellow: number;
    red: number;
    unknown: number;
  };
  topSkills: Array<{ skill: string; count: number }>;
}

/**
 * Get dashboard statistics
 */
export async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = createServerSupabaseClient();

  // Fetch all participants
  const { data, error } = await supabase
    .from("participants")
    .select("skills, custom_5");

  if (error) {
    throw new Error(`Failed to fetch participants for stats: ${error.message}`);
  }

  const participants = (data as Pick<DatabaseParticipant, "skills" | "custom_5">[]) || [];

  // Count total participants
  const totalParticipants = participants.length;

  // Count statuses
  const statusCounts = {
    green: 0,
    yellow: 0,
    red: 0,
    unknown: 0,
  };

  participants.forEach((p) => {
    const status = p.custom_5?.toLowerCase().trim();
    if (status === "green") {
      statusCounts.green++;
    } else if (status === "yellow") {
      statusCounts.yellow++;
    } else if (status === "red") {
      statusCounts.red++;
    } else {
      statusCounts.unknown++;
    }
  });

  // Calculate top skills
  const skillCounts = new Map<string, number>();
  participants.forEach((p) => {
    if (p.skills && Array.isArray(p.skills)) {
      p.skills.forEach((skill) => {
        if (skill && typeof skill === "string") {
          const normalized = skill.trim();
          if (normalized) {
            skillCounts.set(normalized, (skillCounts.get(normalized) || 0) + 1);
          }
        }
      });
    }
  });

  // Convert to array and sort by count
  const topSkills = Array.from(skillCounts.entries())
    .map(([skill, count]) => ({ skill, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10); // Top 10

  return {
    totalParticipants,
    statusCounts,
    topSkills,
  };
}

