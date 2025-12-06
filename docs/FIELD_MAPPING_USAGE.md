# Custom Fields Mapping - Usage Guide

## Overview

All custom fields are accessed via type-safe helper functions from `src/lib/constants/field-mappings.ts`. This avoids magic strings and ensures consistency throughout the codebase.

## Quick Reference

### String Fields

| Field | Constant | Helper Functions | Purpose |
|-------|----------|------------------|---------|
| `custom_1` | `FIELD_ENHANCED_BIO` | `getEnhancedBio()`, `setEnhancedBio()` | Enhanced/parsed biography |
| `custom_2` | `FIELD_LOCATION` | `getLocation()`, `setLocation()` | Geographic location |
| `custom_3` | `FIELD_TIMEZONE` | `getTimezone()`, `setTimezone()` | Participant timezone |
| `custom_4` | `FIELD_LAST_UPDATED` | `getLastUpdated()`, `setLastUpdatedNow()` | Last update timestamp |
| `custom_5` | `TRAFFIC_LIGHT_STATUS_FIELD` | `getTrafficLightStatus()`, `setTrafficLightStatus()` | Traffic light status |
| `custom_6` | `TRAFFIC_LIGHT_AVAILABILITY_FIELD` | `getAvailabilityText()`, `setAvailabilityText()` | Availability message |
| `custom_7` | `FIELD_EXPERIENCE` | `getExperience()` | Professional experience |

### Array Fields

| Field | Constant | Helper Functions | Purpose |
|-------|----------|------------------|---------|
| `custom_array_1` | `FIELD_PARSED_SKILLS` | `getParsedSkills()`, `setParsedSkills()` | Parsed/extracted skills |
| `custom_array_2` | `FIELD_INTERESTS` | `getInterests()`, `setInterests()` | Interests/hobbies |
| `custom_array_3` | `FIELD_DATA_SOURCES` | `getDataSources()`, `addDataSource()` | Data sources tracking |
| `custom_array_4` | `FIELD_COMMON_INTERESTS` | Access via `participant[FIELD_COMMON_INTERESTS]` | Common interests from matching |
| `custom_array_5` | `FIELD_CUSTOM_TAGS` | `getCustomTags()` | Custom tags |
| `custom_array_6` | `FIELD_RESERVED_6` | Reserved for future use |
| `custom_array_7` | `FIELD_RESERVED_7` | Reserved for future use |

## Usage Examples

### Reading Custom Fields

```typescript
import {
  getAllSkills,
  getEnhancedBio,
  getTrafficLightStatus,
  getInterests,
  getParsedSkills,
} from "@/lib/constants/field-mappings";

// Get all skills (original + parsed)
const allSkills = getAllSkills(participant);

// Get enhanced bio or fallback to regular bio
const bio = getEnhancedBio(participant);

// Get traffic light status (returns "green" | "yellow" | "red" | null)
const status = getTrafficLightStatus(participant);

// Get interests
const interests = getInterests(participant);

// Get parsed skills
const parsedSkills = getParsedSkills(participant);
```

### Writing Custom Fields

```typescript
import {
  setTrafficLightStatus,
  setAvailabilityText,
  setInterests,
  addDataSource,
  setLastUpdatedNow,
} from "@/lib/constants/field-mappings";

// Update traffic light status (returns new participant object)
const updated = setTrafficLightStatus(participant, "green");

// Set availability text
const withAvailability = setAvailabilityText(updated, "Available for networking");

// Set interests
const withInterests = setInterests(participant, ["hiking", "reading", "AI"]);

// Add a data source
const withSource = addDataSource(participant, "telegram");

// Update last updated timestamp
const refreshed = setLastUpdatedNow(participant);
```

### Feature-Specific Usage

#### Traffic Light Status

```typescript
import {
  getTrafficLightStatus,
  getAvailabilityText,
  setTrafficLightStatus,
  setAvailabilityText,
  TRAFFIC_LIGHT_LABELS,
  TRAFFIC_LIGHT_STATUSES,
} from "@/lib/constants/field-mappings";

// Check status
const status = getTrafficLightStatus(participant);
if (status === "green") {
  console.log("Available for networking");
}

// Display status
const label = status ? TRAFFIC_LIGHT_LABELS[status] : "Unknown";

// Update status
const updated = setTrafficLightStatus(participant, "yellow");
```

#### Agentic Search

```typescript
import {
  getAllSkills,
  getEnhancedBio,
  getInterests,
  getCustomTags,
  SEARCH_FIELDS,
} from "@/lib/constants/field-mappings";

// Build searchable text for embeddings
const searchableText = [
  participant.bio,
  getEnhancedBio(participant),
  getAllSkills(participant).join(", "),
  getInterests(participant).join(", "),
  getCustomTags(participant).join(", "),
  participant.aiUsage,
].filter(Boolean).join(" ");
```

#### Coffee Break Roulette

```typescript
import {
  getAllSkills,
  getInterests,
  FIELD_COMMON_INTERESTS,
} from "@/lib/constants/field-mappings";

// Get all skills for matching
const skills1 = getAllSkills(participant1);
const skills2 = getAllSkills(participant2);

// Get interests for matching
const interests1 = getInterests(participant1);
const interests2 = getInterests(participant2);

// Store common interests after matching
const commonInterests = intersection(interests1, interests2);
const withCommon = {
  ...participant1,
  [FIELD_COMMON_INTERESTS]: commonInterests,
};
```

### Direct Access (When Needed)

If you need direct access, use the constants:

```typescript
import { FIELD_INTERESTS, TRAFFIC_LIGHT_STATUS_FIELD } from "@/lib/constants/field-mappings";

// Direct access (prefer helper functions when available)
const interests = participant[FIELD_INTERESTS] || [];
const status = participant[TRAFFIC_LIGHT_STATUS_FIELD];
```

## Best Practices

1. **Always use helper functions** - They provide type safety and consistent defaults
2. **Use constants, not magic strings** - Prefer `FIELD_INTERESTS` over `"custom_array_2"`
3. **Immutable updates** - Helper functions return new objects, don't mutate originals
4. **Check documentation** - See `FIELD_MAPPING` object for complete reference

## Migration Guide

If you have existing code using magic strings:

```typescript
// ❌ Bad: Magic string
const status = participant.custom_5;

// ✅ Good: Type-safe helper
import { getTrafficLightStatus } from "@/lib/constants/field-mappings";
const status = getTrafficLightStatus(participant);

// ❌ Bad: Magic string
participant.custom_array_2 = ["hiking"];

// ✅ Good: Type-safe helper
import { setInterests } from "@/lib/constants/field-mappings";
const updated = setInterests(participant, ["hiking"]);
```

