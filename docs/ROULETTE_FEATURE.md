# Coffee Break Roulette Feature

## Overview

The Coffee Break Roulette feature finds serendipitous connections between participants based on skills, interests, and complementary needs. It helps people discover interesting conversation partners during coffee breaks at events.

## Matching Algorithm

Located in `src/lib/matching/roulette.ts`, the algorithm uses a weighted scoring system:

### Scoring Components

1. **Skill Overlap (40% weight)**
   - Combines `skills` array and `custom_array_1` (parsed skills)
   - Uses Jaccard similarity: `shared_skills / total_unique_skills`
   - Normalized score: `similarity * 0.4`

2. **Interest Overlap (30% weight)**
   - Uses `custom_array_2` (interests)
   - Normalized by max array length: `shared_interests / max(interests1.length, interests2.length)`
   - Normalized score: `similarity * 0.3`

3. **Complementary Needs (20% weight)**
   - Checks if one person's `canHelp` matches the other's `needsHelp`
   - Keyword-based matching (30% threshold for overlap)
   - Score: `0.1` per direction (bidirectional), max `0.2` total

4. **Non-Obvious Connections (10% weight)**
   - Same startup stage: `+0.05`
   - Same startup presence: `+0.02`
   - Shared "looking for": `+0.03`
   - Max score: `0.1`

### Total Score

Final score = sum of all components (0.0 - 1.0)

Only matches with score > 0.1 are returned.

## Exclusion Rules

By default, the algorithm excludes:
- **Self**: Current participant is never matched with themselves
- **Red Status**: Participants with `custom_5 === "red"` (deep work mode)
- **Previous Matches**: When using "Spin Again", previous matches are excluded

## Matching Function

```typescript
import { findMatches } from "@/lib/matching/roulette";

const matches = await findMatches(
  currentParticipant,
  allParticipants,
  {
    excludeParticipantIds: [1, 2, 3], // Optional: exclude specific IDs
    excludeRedStatus: true,             // Default: true
    maxResults: 3,                      // Default: 3
  }
);
```

Returns `MatchResult[]` with:
- `participant`: The matched participant
- `score`: Match score (0-1)
- `sharedSkills`: Array of shared skills
- `sharedInterests`: Array of shared interests
- `explanation`: Human-readable explanation

## Explanation Generation

The algorithm generates explanations like:
- "Both know Rust. Share interests: hiking, reading."
- "Share 5 skills including AI, Python. Both interested in startups."
- "Potential interesting connection based on profiles"

Based on:
- Shared skills count and examples
- Shared interests
- Complementary needs mention

## User Interface

### Participant Selection

- Same pattern as Status page
- Dropdown to select current participant
- Selection saved to localStorage
- Persists across sessions

### Spin Button

- Large, prominent button
- Shows loading state during matching
- Triggers match computation
- Can spin again to get different matches

### Match Display

Each match shows:
- **Match Card** with:
  - Photo/avatar
  - Name
  - Match percentage score
  - Explanation ("Why you two?")
  - Shared skills (badges)
  - Shared interests (badges)
  - Key skills overview
  - Actions: "View Profile" and "Contact" (Telegram)

### Empty States

- No matches found: Helpful message suggesting to update profile
- No participant selected: Prompt to select participant

## Performance

For a table with ~30-100 participants:
- Matching computation: < 100ms
- All calculations done in-memory
- No database queries during matching (participants pre-fetched)
- Scales linearly with participant count

Optimizations:
- Early exit for low scores
- Efficient array operations (Sets for lookups)
- Single pass through participants

## Usage Example

```typescript
// In a component
import { findMatches } from "@/lib/matching/roulette";

const currentParticipant = await getParticipantById(1);
const allParticipants = await getAllParticipants();

const matches = await findMatches(currentParticipant, allParticipants, {
  excludeRedStatus: true,
  maxResults: 5,
});

matches.forEach((match) => {
  console.log(`${match.participant.name}: ${match.score}`);
  console.log(`Shared: ${match.sharedSkills.join(", ")}`);
  console.log(`Why: ${match.explanation}`);
});
```

## Customization

### Adjusting Weights

Edit `src/lib/matching/roulette.ts`:

```typescript
// Current weights
skillOverlap.score * 0.4      // 40%
interestOverlap.score * 0.3   // 30%
complementaryScore * 0.2      // 20%
nonObviousScore * 0.1         // 10%

// Change to emphasize interests more:
skillOverlap.score * 0.3      // 30%
interestOverlap.score * 0.4   // 40%
```

### Changing Minimum Score

```typescript
// In findMatches function
if (totalScore > 0.1) {  // Change threshold
  matches.push(...)
}
```

### Adding New Signals

Add new scoring functions and include in total:

```typescript
function calculateCustomSignal(p1, p2): number {
  // Your logic
  return score;
}

const customScore = calculateCustomSignal(participant1, participant2);
const totalScore = ... + customScore * 0.05; // Add to total
```

## Future Enhancements

- **LLM-powered explanations**: Use GPT to generate more natural explanations
- **Match history**: Track and display previous matches
- **Mutual matching**: Show matches where both parties matched each other
- **Filters**: Allow filtering matches by skills, interests, etc.
- **Scheduling**: Suggest coffee break times
- **Real-time updates**: Recompute matches when participant data changes

## Related Files

- `src/lib/matching/roulette.ts` - Matching algorithm
- `src/app/roulette/page.tsx` - Roulette page (server component)
- `src/app/roulette/roulette-manager.tsx` - Roulette UI (client component)
- `src/lib/constants/field-mappings.ts` - Field mappings documentation

