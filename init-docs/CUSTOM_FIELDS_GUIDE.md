---
tags:
  - documentation
  - hackathon
---
# Custom Fields Guide

The participants JSON includes **14 empty custom fields** that you can populate during development and parsing. These fields use **generic names** to avoid naming conflicts between teams and allow flexible usage.

## Available Custom Fields

### String Fields (7)
- `custom_1` - Empty string, use for any text data
- `custom_2` - Empty string, use for any text data
- `custom_3` - Empty string, use for any text data
- `custom_4` - Empty string, use for any text data
- `custom_5` - Empty string, use for any text data
- `custom_6` - Empty string, use for any text data
- `custom_7` - Empty string, use for any text data

### Array Fields (7)
- `custom_array_1` - Empty array, use for lists/collections
- `custom_array_2` - Empty array, use for lists/collections
- `custom_array_3` - Empty array, use for lists/collections
- `custom_array_4` - Empty array, use for lists/collections
- `custom_array_5` - Empty array, use for lists/collections
- `custom_array_6` - Empty array, use for lists/collections
- `custom_array_7` - Empty array, use for lists/collections

## Why Generic Names?

1. **No Conflicts**: Multiple teams can use the same fields for different purposes
2. **Flexibility**: You decide what each field means for your implementation
3. **Privacy**: When swapping to real data, each participant can have their own copy with their custom field mappings
4. **Simplicity**: No assumptions about what you want to build

## Suggested Usage Patterns

### Pattern 1: Social Anxiety Traffic Light
```javascript
// Use custom_1 for status, custom_2 for availability
participant.custom_1 = 'green'; // or 'yellow', 'red'
participant.custom_2 = 'available'; // or 'busy', 'deep-work'
```

### Pattern 2: Telegram/LinkedIn Parsing
```javascript
// After parsing Telegram
participant.custom_1 = telegramProfile.enhancedBio;
participant.custom_array_1 = extractedSkills;
participant.custom_array_2 = extractedInterests;
participant.custom_2 = telegramProfile.location;
participant.custom_3 = new Date().toISOString(); // lastUpdated
participant.custom_array_3 = ['telegram']; // dataSources
```

### Pattern 3: Coffee Break Roulette
```javascript
// Calculate match dynamically (don't store matchingScore)
function calculateMatch(person1, person2) {
  const commonSkills = intersection(
    [...person1.skills, ...person1.custom_array_1],
    [...person2.skills, ...person2.custom_array_1]
  );
  const commonInterests = intersection(
    person1.custom_array_2 || [],
    person2.custom_array_2 || []
  );
  
  // Store common interests in custom_array_4 after matching
  person1.custom_array_4 = commonInterests;
  person2.custom_array_4 = commonInterests;
  
  return {
    score: (commonSkills.length * 0.6 + commonInterests.length * 0.4) / 10,
    commonSkills,
    commonInterests
  };
}
```

### Pattern 4: RAG Search Enhancement
```javascript
// Combine original and parsed data for better search
const searchableText = [
  participant.bio,
  participant.custom_1, // parsed bio
  participant.skills.join(', '),
  participant.custom_array_1.join(', '), // parsed skills
  participant.custom_array_2.join(', '), // interests
  participant.aiUsage
].filter(Boolean).join(' ');

// Use in vector embedding
const embedding = await generateEmbedding(searchableText);
```

### Pattern 5: Experience & Location Data
```javascript
// After parsing LinkedIn
participant.custom_1 = linkedinProfile.experience;
participant.custom_2 = linkedinProfile.location;
participant.custom_3 = getTimezone(linkedinProfile.location);
participant.custom_array_1.push(...linkedinProfile.skills);
participant.custom_array_3 = ['linkedin']; // data sources
participant.custom_4 = new Date().toISOString(); // lastUpdated
```

## Document Your Field Mapping

**Important**: Create a README or comment in your code documenting your field mapping:

```javascript
/**
 * Custom Field Mapping for Our Team:
 * 
 * String fields:
 * - custom_1: Enhanced bio from parsing
 * - custom_2: Location
 * - custom_3: Timezone
 * - custom_4: Last updated timestamp
 * - custom_5: Status (traffic light: green/yellow/red)
 * - custom_6: Availability
 * - custom_7: Work experience
 * 
 * Array fields:
 * - custom_array_1: Parsed skills
 * - custom_array_2: Interests/hobbies
 * - custom_array_3: Data sources used
 * - custom_array_4: Common interests with matched person
 * - custom_array_5: Custom tags
 * - custom_array_6: [unused]
 * - custom_array_7: [unused]
 */
```

## Per-Participant Data Copies

During the event, each participant can receive their own copy of the real data JSON with their custom field mappings. This means:

1. **Team A** might use `custom_1` for "status"
2. **Team B** might use `custom_1` for "parsed bio"
3. **No conflicts** - each team works with their own copy

When presenting, simply document what each field means in your implementation.

## Best Practices

1. **Document your mapping** - Keep a reference of what each field means
2. **Be consistent** - Use the same fields for the same purpose across your codebase
3. **Validate types** - Ensure strings remain strings, arrays remain arrays
4. **Leave unused fields empty** - Don't populate fields you don't need
5. **Calculate scores dynamically** - For matching/compatibility scores, calculate on-demand rather than storing

## Field Combinations for Features

### Agentic Search
Suggested mapping:
- `custom_1`: Enhanced/parsed bio
- `custom_array_1`: Parsed skills
- `custom_array_2`: Interests
- `custom_array_5`: Custom tags

Combine these with original `bio`, `skills`, `aiUsage` for comprehensive RAG embedding.

### Social Anxiety Traffic Light
Suggested mapping:
- `custom_5`: Status (green/yellow/red)
- `custom_6`: Availability (available/busy/deep-work)

Update in real-time based on user input.

### Coffee Break Roulette
Suggested mapping:
- `custom_array_2`: Interests
- `custom_array_4`: Common interests after matching

Calculate matching score dynamically when comparing participants.

## Example: Complete Implementation

```javascript
// Define your field mapping
const FIELDS = {
  PARSED_BIO: 'custom_1',
  LOCATION: 'custom_2',
  TIMEZONE: 'custom_3',
  LAST_UPDATED: 'custom_4',
  STATUS: 'custom_5',
  PARSED_SKILLS: 'custom_array_1',
  INTERESTS: 'custom_array_2',
  DATA_SOURCES: 'custom_array_3',
  COMMON_INTERESTS: 'custom_array_4',
  TAGS: 'custom_array_5'
};

// Parse Telegram
function parseTelegram(participant, telegramData) {
  participant[FIELDS.PARSED_BIO] = telegramData.bio;
  participant[FIELDS.PARSED_SKILLS] = extractSkills(telegramData.bio);
  participant[FIELDS.INTERESTS] = extractInterests(telegramData.bio);
  participant[FIELDS.DATA_SOURCES] = ['telegram'];
  participant[FIELDS.LAST_UPDATED] = new Date().toISOString();
}

// Set status
function setStatus(participant, status) {
  participant[FIELDS.STATUS] = status;
}

// Calculate match
function findBestMatch(currentParticipant, allParticipants) {
  return allParticipants
    .filter(p => p.id !== currentParticipant.id)
    .map(p => ({
      participant: p,
      score: calculateMatchScore(currentParticipant, p)
    }))
    .sort((a, b) => b.score - a.score)[0];
}
```

## Notes

- All custom fields start **empty** (strings = `""`, arrays = `[]`)
- Field names are generic to avoid conflicts between teams
- Each participant can have their own data copy with different field mappings
- Remember to document your field mapping in your code
- Be creative - use fields however best suits your Community OS implementation!
