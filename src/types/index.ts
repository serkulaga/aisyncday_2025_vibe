/**
 * Application-facing types (camelCase for better DX)
 * These are the types used throughout the application
 */

import type { StatusType } from "./database";

/**
 * Application-facing participant type (camelCase)
 * Converted from database type for better developer experience
 */
export interface Participant {
  id: number;
  name: string;
  email: string;
  telegram: string;
  linkedin: string;
  photo: string;
  bio: string;
  skills: string[];
  hasStartup: boolean;
  startupStage: string;
  startupDescription: string;
  startupName: string;
  lookingFor: string[];
  canHelp: string;
  needsHelp: string;
  aiUsage: string;
  // Custom fields
  custom_1: string;
  custom_2: string;
  custom_3: string;
  custom_4: string;
  custom_5: string; // Status (green/yellow/red)
  custom_6: string; // Availability text
  custom_7: string;
  custom_array_1: string[];
  custom_array_2: string[]; // Interests
  custom_array_3: string[];
  custom_array_4: string[];
  custom_array_5: string[];
  custom_array_6: string[];
  custom_array_7: string[];
  _note?: string;
  createdAt: string;
  updatedAt: string;
  embedding: number[] | null;
}

/**
 * Status type for traffic light
 */
export type { StatusType } from "./database";

/**
 * Update payload for traffic light status
 */
export interface TrafficLightStatusUpdate {
  status: StatusType;
  availabilityText?: string;
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
  threshold?: number;
}
