/**
 * Field Mappings Configuration
 * 
 * Central definition of how custom fields are used in Community OS
 * Based on CUSTOM_FIELDS_GUIDE.md recommendations and implementation
 * 
 * This module provides type-safe access to custom fields, avoiding magic strings
 * throughout the codebase.
 */

import type { Participant } from "@/types";

/**
 * ============================================================================
 * CUSTOM STRING FIELDS (custom_1 through custom_7)
 * ============================================================================
 */

/**
 * custom_1: Enhanced/Parsed Bio
 * 
 * Purpose: Contains enriched or parsed biography information
 * Used in: Agentic Search (for embeddings and search)
 * Source: Can be populated by parsers (Telegram, LinkedIn) or manual enhancement
 */
export const FIELD_ENHANCED_BIO = "custom_1" as const;

/**
 * custom_2: Location
 * 
 * Purpose: Geographic location of the participant
 * Used in: Optional location-based features
 * Source: Typically parsed from LinkedIn or Telegram profiles
 */
export const FIELD_LOCATION = "custom_2" as const;

/**
 * custom_3: Timezone
 * 
 * Purpose: Participant's timezone (e.g., "UTC+3", "America/New_York")
 * Used in: Time-sensitive features, scheduling
 * Source: Derived from location or manually set
 */
export const FIELD_TIMEZONE = "custom_3" as const;

/**
 * custom_4: Last Updated Timestamp
 * 
 * Purpose: ISO timestamp of when participant data was last updated/parsed
 * Format: ISO 8601 string (e.g., "2024-12-07T12:30:45.123Z")
 * Used in: Data freshness tracking
 * Source: Automatically set during parsing/updates
 */
export const FIELD_LAST_UPDATED = "custom_4" as const;

/**
 * custom_5: Traffic Light Status
 * 
 * Purpose: Social Anxiety Traffic Light status indicator
 * Values: "green" | "yellow" | "red"
 * Used in: Status page, participant cards, filtering
 */
export const TRAFFIC_LIGHT_STATUS_FIELD = "custom_5" as const;
export type TrafficLightStatus = "green" | "yellow" | "red";
export const TRAFFIC_LIGHT_STATUSES: TrafficLightStatus[] = ["green", "yellow", "red"];
export const TRAFFIC_LIGHT_LABELS: Record<TrafficLightStatus, string> = {
  green: "Available",
  yellow: "Maybe",
  red: "Deep Work",
};
export const TRAFFIC_LIGHT_DESCRIPTIONS: Record<TrafficLightStatus, string> = {
  green: "Open to pitches, conversations, and connections",
  yellow: "Selectively available, use discretion",
  red: "Not available, in focus mode",
};

/**
 * custom_6: Availability Text
 * 
 * Purpose: Free-form availability message for Traffic Light
 * Used in: Status page, participant detail view
 * Examples: "Available for networking", "Deep work mode", "Busy until 3pm"
 */
export const TRAFFIC_LIGHT_AVAILABILITY_FIELD = "custom_6" as const;
export const DEFAULT_AVAILABILITY_OPTIONS: Record<TrafficLightStatus, string[]> = {
  green: ["Available for networking", "Open to chat", "Looking to connect"],
  yellow: ["Maybe available", "Use discretion", "Selectively available"],
  red: ["Deep work mode", "Not available", "Focusing on work"],
};

/**
 * custom_7: Experience/Additional Info
 * 
 * Purpose: Additional professional experience or context
 * Used in: Optional profile enhancement
 * Source: Can be populated from LinkedIn parsing or manual entry
 */
export const FIELD_EXPERIENCE = "custom_7" as const;

/**
 * ============================================================================
 * CUSTOM ARRAY FIELDS (custom_array_1 through custom_array_7)
 * ============================================================================
 */

/**
 * custom_array_1: Parsed/Extracted Skills
 * 
 * Purpose: Additional skills extracted from bios, profiles, or parsing
 * Used in: Agentic Search, Coffee Break Roulette matching
 * Source: Parsed from Telegram/LinkedIn or manually added
 * Note: Complements the main `skills` array
 */
export const FIELD_PARSED_SKILLS = "custom_array_1" as const;

/**
 * custom_array_2: Interests/Hobbies
 * 
 * Purpose: Participant interests and hobbies for matching
 * Used in: Coffee Break Roulette, Agentic Search
 * Source: Parsed from profiles or manually added
 */
export const FIELD_INTERESTS = "custom_array_2" as const;

/**
 * custom_array_3: Data Sources
 * 
 * Purpose: Track where participant data came from
 * Used in: Data provenance tracking
 * Examples: ["telegram"], ["linkedin"], ["telegram", "linkedin"], ["manual"]
 */
export const FIELD_DATA_SOURCES = "custom_array_3" as const;

/**
 * custom_array_4: Common Interests (After Matching)
 * 
 * Purpose: Store common interests discovered during matching
 * Used in: Coffee Break Roulette (stores matched interests)
 * Note: Populated dynamically during matching, not from initial data
 */
export const FIELD_COMMON_INTERESTS = "custom_array_4" as const;

/**
 * custom_array_5: Custom Tags
 * 
 * Purpose: Additional tags for categorization and search
 * Used in: Agentic Search (for embeddings)
 * Source: Can be auto-generated or manually added
 */
export const FIELD_CUSTOM_TAGS = "custom_array_5" as const;

/**
 * custom_array_6: Reserved/Unused
 * 
 * Purpose: Available for future use
 */
export const FIELD_RESERVED_6 = "custom_array_6" as const;

/**
 * custom_array_7: Reserved/Unused
 * 
 * Purpose: Available for future use
 */
export const FIELD_RESERVED_7 = "custom_array_7" as const;

/**
 * ============================================================================
 * FEATURE-SPECIFIC FIELD GROUPINGS
 * ============================================================================
 */

/**
 * Agentic Search Field Mappings
 * Fields used for building searchable text and embeddings
 */
export const SEARCH_FIELDS = {
  ENHANCED_BIO: FIELD_ENHANCED_BIO,
  PARSED_SKILLS: FIELD_PARSED_SKILLS,
  INTERESTS: FIELD_INTERESTS,
  CUSTOM_TAGS: FIELD_CUSTOM_TAGS,
} as const;

/**
 * Coffee Break Roulette Field Mappings
 */
export const ROULETTE_FIELDS = {
  INTERESTS: FIELD_INTERESTS,
  COMMON_INTERESTS: FIELD_COMMON_INTERESTS,
  PARSED_SKILLS: FIELD_PARSED_SKILLS,
} as const;

/**
 * ============================================================================
 * TYPE-SAFE HELPER FUNCTIONS
 * ============================================================================
 */

/**
 * Get all skills (original + parsed)
 */
export function getAllSkills(participant: Participant): string[] {
  const original = participant.skills || [];
  const parsed = participant[FIELD_PARSED_SKILLS] || [];
  return [...new Set([...original, ...parsed])];
}

/**
 * Get enhanced bio or fallback to regular bio
 */
export function getEnhancedBio(participant: Participant): string {
  return participant[FIELD_ENHANCED_BIO] || participant.bio || "";
}

/**
 * Get traffic light status
 */
export function getTrafficLightStatus(
  participant: Participant
): TrafficLightStatus | null {
  const value = participant[TRAFFIC_LIGHT_STATUS_FIELD]?.toLowerCase().trim();
  if (value && TRAFFIC_LIGHT_STATUSES.includes(value as TrafficLightStatus)) {
    return value as TrafficLightStatus;
  }
  return null;
}

/**
 * Get availability text
 */
export function getAvailabilityText(participant: Participant): string {
  return participant[TRAFFIC_LIGHT_AVAILABILITY_FIELD] || "";
}

/**
 * Get interests array
 */
export function getInterests(participant: Participant): string[] {
  return participant[FIELD_INTERESTS] || [];
}

/**
 * Get parsed skills array
 */
export function getParsedSkills(participant: Participant): string[] {
  return participant[FIELD_PARSED_SKILLS] || [];
}

/**
 * Get data sources array
 */
export function getDataSources(participant: Participant): string[] {
  return participant[FIELD_DATA_SOURCES] || [];
}

/**
 * Get custom tags array
 */
export function getCustomTags(participant: Participant): string[] {
  return participant[FIELD_CUSTOM_TAGS] || [];
}

/**
 * Get location
 */
export function getLocation(participant: Participant): string {
  return participant[FIELD_LOCATION] || "";
}

/**
 * Get timezone
 */
export function getTimezone(participant: Participant): string {
  return participant[FIELD_TIMEZONE] || "";
}

/**
 * Get last updated timestamp
 */
export function getLastUpdated(participant: Participant): string {
  return participant[FIELD_LAST_UPDATED] || "";
}

/**
 * Get experience/additional info
 */
export function getExperience(participant: Participant): string {
  return participant[FIELD_EXPERIENCE] || "";
}

/**
 * Set traffic light status (returns updated participant)
 */
export function setTrafficLightStatus(
  participant: Participant,
  status: TrafficLightStatus
): Participant {
  return {
    ...participant,
    [TRAFFIC_LIGHT_STATUS_FIELD]: status,
  };
}

/**
 * Set availability text (returns updated participant)
 */
export function setAvailabilityText(
  participant: Participant,
  text: string
): Participant {
  return {
    ...participant,
    [TRAFFIC_LIGHT_AVAILABILITY_FIELD]: text,
  };
}

/**
 * Set enhanced bio (returns updated participant)
 */
export function setEnhancedBio(
  participant: Participant,
  bio: string
): Participant {
  return {
    ...participant,
    [FIELD_ENHANCED_BIO]: bio,
  };
}

/**
 * Set interests (returns updated participant)
 */
export function setInterests(
  participant: Participant,
  interests: string[]
): Participant {
  return {
    ...participant,
    [FIELD_INTERESTS]: interests,
  };
}

/**
 * Set parsed skills (returns updated participant)
 */
export function setParsedSkills(
  participant: Participant,
  skills: string[]
): Participant {
  return {
    ...participant,
    [FIELD_PARSED_SKILLS]: skills,
  };
}

/**
 * Add data source (returns updated participant)
 */
export function addDataSource(
  participant: Participant,
  source: string
): Participant {
  const current = getDataSources(participant);
  if (!current.includes(source)) {
    return {
      ...participant,
      [FIELD_DATA_SOURCES]: [...current, source],
    };
  }
  return participant;
}

/**
 * Set last updated timestamp to now (returns updated participant)
 */
export function setLastUpdatedNow(participant: Participant): Participant {
  return {
    ...participant,
    [FIELD_LAST_UPDATED]: new Date().toISOString(),
  };
}

/**
 * Set location (returns updated participant)
 */
export function setLocation(
  participant: Participant,
  location: string
): Participant {
  return {
    ...participant,
    [FIELD_LOCATION]: location,
  };
}

/**
 * Set timezone (returns updated participant)
 */
export function setTimezone(
  participant: Participant,
  timezone: string
): Participant {
  return {
    ...participant,
    [FIELD_TIMEZONE]: timezone,
  };
}

/**
 * Validate traffic light status value
 */
export function isValidTrafficLightStatus(
  value: string
): value is TrafficLightStatus {
  return TRAFFIC_LIGHT_STATUSES.includes(value as TrafficLightStatus);
}

/**
 * ============================================================================
 * FIELD MAPPING SUMMARY (for documentation)
 * ============================================================================
 */

/**
 * Complete field mapping reference
 */
export const FIELD_MAPPING = {
  // String fields
  custom_1: {
    name: "Enhanced/Parsed Bio",
    constant: FIELD_ENHANCED_BIO,
    purpose: "Enriched biography information for search",
    usedIn: ["Agentic Search"],
  },
  custom_2: {
    name: "Location",
    constant: FIELD_LOCATION,
    purpose: "Geographic location",
    usedIn: ["Optional features"],
  },
  custom_3: {
    name: "Timezone",
    constant: FIELD_TIMEZONE,
    purpose: "Participant timezone",
    usedIn: ["Scheduling"],
  },
  custom_4: {
    name: "Last Updated",
    constant: FIELD_LAST_UPDATED,
    purpose: "ISO timestamp of last data update",
    usedIn: ["Data tracking"],
  },
  custom_5: {
    name: "Traffic Light Status",
    constant: TRAFFIC_LIGHT_STATUS_FIELD,
    purpose: "Availability status (green/yellow/red)",
    usedIn: ["Social Anxiety Traffic Light"],
  },
  custom_6: {
    name: "Availability Text",
    constant: TRAFFIC_LIGHT_AVAILABILITY_FIELD,
    purpose: "Free-form availability message",
    usedIn: ["Social Anxiety Traffic Light"],
  },
  custom_7: {
    name: "Experience",
    constant: FIELD_EXPERIENCE,
    purpose: "Additional professional experience",
    usedIn: ["Profile enhancement"],
  },
  // Array fields
  custom_array_1: {
    name: "Parsed Skills",
    constant: FIELD_PARSED_SKILLS,
    purpose: "Additional skills from parsing",
    usedIn: ["Agentic Search", "Coffee Break Roulette"],
  },
  custom_array_2: {
    name: "Interests",
    constant: FIELD_INTERESTS,
    purpose: "Participant interests and hobbies",
    usedIn: ["Coffee Break Roulette", "Agentic Search"],
  },
  custom_array_3: {
    name: "Data Sources",
    constant: FIELD_DATA_SOURCES,
    purpose: "Track data provenance",
    usedIn: ["Data tracking"],
  },
  custom_array_4: {
    name: "Common Interests",
    constant: FIELD_COMMON_INTERESTS,
    purpose: "Shared interests from matching",
    usedIn: ["Coffee Break Roulette"],
  },
  custom_array_5: {
    name: "Custom Tags",
    constant: FIELD_CUSTOM_TAGS,
    purpose: "Categorization tags",
    usedIn: ["Agentic Search"],
  },
  custom_array_6: {
    name: "Reserved",
    constant: FIELD_RESERVED_6,
    purpose: "Available for future use",
    usedIn: [],
  },
  custom_array_7: {
    name: "Reserved",
    constant: FIELD_RESERVED_7,
    purpose: "Available for future use",
    usedIn: [],
  },
} as const;
