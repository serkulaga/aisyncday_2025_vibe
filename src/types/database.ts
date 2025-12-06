/**
 * Database types matching the Supabase schema exactly (snake_case)
 * These types represent the raw database structure
 */

export type StatusType = "green" | "yellow" | "red";

/**
 * Raw database participant record (snake_case)
 * Matches the participants table structure exactly
 */
export interface DatabaseParticipant {
  id: number;
  name: string;
  email: string;
  telegram: string;
  linkedin: string;
  photo: string;
  bio: string;
  skills: string[];
  has_startup: boolean;
  startup_stage: string;
  startup_description: string;
  startup_name: string;
  looking_for: string[];
  can_help: string;
  needs_help: string;
  ai_usage: string;
  custom_1: string;
  custom_2: string;
  custom_3: string;
  custom_4: string;
  custom_5: string; // Status (green/yellow/red)
  custom_6: string; // Availability text
  custom_7: string;
  custom_array_1: string[];
  custom_array_2: string[];
  custom_array_3: string[];
  custom_array_4: string[];
  custom_array_5: string[];
  custom_array_6: string[];
  custom_array_7: string[];
  _note: string;
  created_at: string;
  updated_at: string;
  embedding: number[] | null; // Vector as array of numbers
}

/**
 * Update payload for traffic light status fields
 */
export interface TrafficLightUpdate {
  custom_5: StatusType;
  custom_6?: string;
}

/**
 * Pagination parameters
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
}

/**
 * Paginated response
 */
export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/**
 * Vector similarity search parameters
 */
export interface SimilaritySearchParams {
  embedding: number[];
  limit?: number;
  threshold?: number; // Optional cosine similarity threshold
}

/**
 * Result from similarity search RPC function
 * Includes similarity score
 */
export interface SimilaritySearchResult extends DatabaseParticipant {
  similarity: number;
}

