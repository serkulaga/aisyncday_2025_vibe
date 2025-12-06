# Agentic Search Feature - Design Document

## Overview

Agentic Search is a RAG (Retrieval-Augmented Generation) feature that allows users to search for participants using natural language queries. It combines vector similarity search with LLM-powered explanations to provide contextual, accurate results.

## User Experience

### Search Interface (`/search`)

**Layout:**
- Chat-like interface with a text input at the bottom
- Message history showing queries and results
- Results displayed as cards or a list with:
  - Participant name, photo, key info
  - Highlighted matching skills/interests
  - LLM-generated explanation snippet

**Query Examples:**
- "Who here knows Rust and likes hiking?"
- "Show me people who can help with fundraising"
- "Find participants working on AI startups"
- "Who needs help with marketing?"
- "People interested in blockchain"
- "Show me developers looking for co-founders"

**Response Format:**
Each search result contains:
1. **Explanation** (LLM-generated): A natural language paragraph explaining why these participants match the query
2. **Participants List**: Cards showing:
   - Photo/avatar
   - Name
   - Key skills/interests that match the query
   - Match relevance indicator (optional)
   - Link to full profile

**Interaction Flow:**
1. User types query in search box
2. Loading state: "Searching..." with spinner
3. Results appear:
   - Explanation text at the top
   - Participant cards below
4. User can:
   - Click participant to view full profile
   - Refine query and search again
   - Clear history and start new search

### Visual Design Considerations

- **Input**: Large, prominent search box (similar to ChatGPT interface)
- **Messages**: Each query-response pair is a "message" in the conversation
- **Results**: Scrollable list, max 10 participants per result
- **Explanation**: Highlighted box above results with clear styling
- **Empty States**: "No matches found" with suggestion to try different query

## Backend Flow

### Step 1: Query Embedding Generation

**Input:** Natural language query string (e.g., "Who here knows Rust and likes hiking?")

**Process:**
1. Call OpenAI Embeddings API with query text
2. Use same model as participant embeddings (e.g., `text-embedding-3-small` or `text-embedding-ada-002`)
3. Generate embedding vector (same dimensionality as participant embeddings)

**Error Handling:**
- If embedding generation fails, return error message
- Log error for debugging

### Step 2: Vector Similarity Search

**Process:**
1. Use Supabase RPC function `match_participants`:
   ```sql
   SELECT * FROM match_participants(
     query_embedding => <query_vector>,
     match_threshold => 0.5,  -- Configurable threshold
     match_count => 20         -- Retrieve more candidates than needed
   )
   ORDER BY similarity DESC
   ```

**Parameters:**
- `query_embedding`: The query vector from Step 1
- `match_threshold`: Minimum similarity score (0.0 - 1.0), default 0.5
- `match_count`: Number of candidates to retrieve, default 20 (will filter/rank down)

**Output:** Array of participant records with similarity scores

### Step 3: Optional Re-ranking and Filtering

**Purpose:** Refine results based on structured fields and query intent

**Filtering Options:**
- **Traffic Light Status**: Exclude "red" status participants (optional, configurable)
- **Structured Field Matching**: 
  - If query mentions specific skills → boost participants with those skills
  - If query mentions interests → boost participants with matching interests
  - If query mentions "startup" → prioritize participants with `hasStartup = true`
  - If query mentions "fundraising"/"marketing" → prioritize in `needsHelp` or `canHelp`

**Re-ranking Algorithm:**
1. Start with vector similarity score (from Step 2)
2. Apply boosts based on keyword matches:
   - Exact skill match: +0.2
   - Exact interest match: +0.15
   - Keyword in `canHelp` or `needsHelp`: +0.1
   - Startup-related query + has startup: +0.1
3. Normalize scores to 0-1 range
4. Sort by final score descending

**Output:** Top N participants (default 10, configurable) with final relevance scores

### Step 4: LLM Explanation Generation

**Input:**
- Original user query
- Selected participant data (top N from Step 3)
- Schema context (field descriptions)

**LLM Prompt Structure:**

```
System Prompt:
You are a helpful assistant that explains search results for a community networking platform. Your task is to explain why specific participants match a user's search query.

IMPORTANT CONSTRAINTS:
1. ONLY mention participants that are provided in the context below
2. DO NOT invent or hallucinate participant information
3. Base your explanation ONLY on the data provided
4. If a participant isn't in the context, do NOT mention them
5. Be concise and natural - 2-3 sentences maximum

Participant Schema:
- name: Full name
- skills: Array of technical/professional skills
- custom_array_1: Additional parsed skills
- custom_array_2: Interests and hobbies
- bio: Short biography
- canHelp: What they can help others with
- needsHelp: What they need help with
- hasStartup: Whether they have a startup
- startupName: Startup name if applicable

User Query: "{query}"

Participants Found:
{formatted_participant_data}

Generate a concise explanation (2-3 sentences) describing why these participants match the query. Reference specific skills, interests, or attributes mentioned in the query.
```

**Participant Data Format:**
```json
[
  {
    "name": "John Doe",
    "skills": ["Rust", "Backend Development"],
    "interests": ["Hiking", "Camping"],
    "bio": "Senior backend engineer...",
    "canHelp": "Technical architecture",
    "needsHelp": null,
    "hasStartup": false
  },
  ...
]
```

**LLM Configuration:**
- Model: `gpt-4o-mini` (cost-effective, sufficient for explanations)
- Temperature: 0.3 (more deterministic, less creative)
- Max tokens: 200 (keep explanations concise)

**Output:** Natural language explanation text

### Step 5: Response Assembly

Combine:
- Explanation text (from Step 4)
- Participant list (from Step 3)
- Metadata (total matches, search time, etc.)
- Debug info (optional, for development)

## API Contract

### Endpoint: `POST /api/search`

**Request:**

```typescript
interface SearchRequest {
  query: string;                    // Required: natural language query
  options?: {
    limit?: number;                 // Default: 10, max: 20
    excludeRedStatus?: boolean;     // Default: false
    matchThreshold?: number;        // Default: 0.5 (0.0 - 1.0)
    includeDebug?: boolean;         // Default: false (for development)
  };
}
```

**Response:**

```typescript
interface SearchResponse {
  explanation: string;              // LLM-generated explanation
  participants: ParticipantMatch[]; // Matched participants
  metadata: {
    totalMatches: number;           // Total participants found
    returnedCount: number;          // Number returned (after limit)
    searchTimeMs: number;           // Time taken for search
    query: string;                  // Echo of original query
  };
  debug?: {                         // Only if includeDebug: true
    embeddingModel: string;
    similarityScores: number[];
    rerankScores?: number[];
    llmModel: string;
    llmTokensUsed: number;
  };
}

interface ParticipantMatch {
  participant: Participant;         // Full participant object
  relevanceScore: number;           // Final relevance score (0-1)
  matchedFields: {                  // Fields that matched the query
    skills?: string[];
    interests?: string[];
    canHelp?: boolean;
    needsHelp?: boolean;
    bio?: string;
  };
}
```

**Error Response:**

```typescript
interface SearchError {
  error: string;
  code: "EMBEDDING_FAILED" | "SEARCH_FAILED" | "LLM_FAILED" | "INVALID_QUERY";
  details?: string;
}
```

### Alternative: Server Action

Instead of API route, could use Next.js Server Action:

```typescript
"use server";

export async function searchParticipants(
  query: string,
  options?: SearchOptions
): Promise<SearchResponse> {
  // Implementation
}
```

**Pros of Server Action:**
- Type-safe end-to-end
- No manual serialization
- Automatic error handling
- Simpler client-side usage

**Cons:**
- Less flexibility for external API access
- Harder to add rate limiting/auth middleware

**Decision:** Use Server Action for better DX, but structure code so it can be easily extracted to API route if needed.

## Hallucination Prevention Strategy

### 1. System Prompt Constraints

- Explicit instruction to ONLY mention participants in context
- Prohibition against inventing information
- Clear schema description

### 2. Context Provision

- Include full participant data for matched participants only
- Provide structured format (JSON) for clarity
- Include relevant fields only (name, skills, interests, bio, canHelp, needsHelp)

### 3. Output Validation

- Verify participant names in explanation match returned participants
- Check for mentions of non-existent participants
- Log warnings if validation fails (don't block response, but flag for review)

### 4. Temperature Control

- Use low temperature (0.3) for more deterministic outputs
- Reduces creative license that could lead to hallucinations

### 5. Token Limits

- Limit explanation length (max 200 tokens)
- Shorter outputs = less room for hallucination

### 6. Explicit Participant References

- In explanation format, encourage LLM to reference specific participants by name
- Makes it easier to verify grounding

**Example of Good Explanation:**
> "John Doe matches your query because he knows Rust (backend engineer) and enjoys hiking. Sarah Smith also has Rust experience and lists hiking in her interests."

**Example of Bad Explanation (would be flagged):**
> "Several participants match: developers with Rust skills and outdoor interests, including some startup founders." (too vague, no specific names)

## Implementation Components

### 1. Search Page (`src/app/search/page.tsx`)
- Server component wrapper
- Client component for interactive UI

### 2. Search UI (`src/app/search/search-interface.tsx`)
- Chat-like interface
- Message history
- Input handling
- Loading states

### 3. Search Service (`src/lib/search/agentic-search.ts`)
- Main orchestration function
- Coordinates embedding → search → rerank → LLM

### 4. Embedding Service (`src/lib/search/embeddings.ts`)
- Query embedding generation
- Reuses OpenAI client

### 5. Reranking Logic (`src/lib/search/rerank.ts`)
- Keyword-based boosting
- Score normalization

### 6. LLM Service (`src/lib/search/explain.ts`)
- Explanation generation
- Prompt construction
- Response validation

### 7. Server Action (`src/app/search/actions.ts`)
- `searchParticipants(query, options)` action
- Error handling
- Type definitions

## Performance Considerations

### Caching Strategy

1. **Embedding Cache**: Cache query embeddings (same query = same embedding)
   - Key: normalized query text
   - TTL: 24 hours
   - Storage: In-memory or Redis (if available)

2. **LLM Response Cache**: Cache explanations for identical queries
   - Key: query + participant IDs (sorted)
   - TTL: 24 hours
   - Useful for repeated searches

### Rate Limiting

- Limit requests per user/IP
- Prevent abuse of LLM API
- Suggested: 10 requests/minute per user

### Async Processing (Future)

- For complex queries, consider async processing
- Return immediately with "processing" status
- Poll for results or use WebSocket for updates

## Error Handling

### Embedding Generation Failures
- Return user-friendly error: "Search temporarily unavailable"
- Log error with query for debugging
- Retry logic: 1 retry with exponential backoff

### Vector Search Failures
- Fallback to keyword-based search if vector search fails
- Log error but don't expose technical details to user

### LLM Generation Failures
- Return participants without explanation
- Show: "Found X participants (explanation unavailable)"
- Log error for monitoring

### Timeout Handling
- Set timeout: 30 seconds total
- If timeout: return partial results (participants without explanation)
- Show: "Search took longer than expected, showing partial results"

## Testing Strategy

### Unit Tests
- Embedding generation
- Reranking logic
- Score normalization
- Error handling

### Integration Tests
- End-to-end search flow
- LLM response validation
- Participant data integrity

### Manual Testing Scenarios
1. Simple skill query: "Who knows Python?"
2. Multi-criteria: "Rust developers who like hiking"
3. Intent-based: "People who can help with fundraising"
4. Empty results: "Who knows COBOL?"
5. Ambiguous query: "Show me developers"
6. Very long query: Test token limits

## Future Enhancements

1. **Query Suggestions**: Auto-complete based on common queries
2. **Search History**: Save recent searches
3. **Advanced Filters**: UI for structured filters (status, startup, etc.)
4. **Multi-turn Conversation**: Context-aware follow-up questions
5. **Personalization**: Boost matches based on user's own profile
6. **Analytics**: Track popular queries and search patterns
7. **Export Results**: Download matches as CSV/JSON
8. **Share Results**: Generate shareable link to search results

## File Structure

```
src/
├── app/
│   └── search/
│       ├── page.tsx                    # Server component wrapper
│       ├── search-interface.tsx        # Client component (chat UI)
│       └── actions.ts                  # Server action
├── lib/
│   └── search/
│       ├── agentic-search.ts          # Main orchestration
│       ├── embeddings.ts              # Query embedding generation
│       ├── rerank.ts                  # Re-ranking logic
│       ├── explain.ts                 # LLM explanation generation
│       └── types.ts                   # Search-specific types
└── components/
    └── search/
        ├── search-input.tsx           # Search input component
        ├── search-result-card.tsx     # Participant match card
        └── explanation-box.tsx        # LLM explanation display
```

## Dependencies

- OpenAI API: Already installed (`openai` package)
- Supabase: Already configured
- No additional packages needed

## Environment Variables

Already configured:
- `OPENAI_API_KEY`: For embeddings and LLM
- `NEXT_PUBLIC_SUPABASE_URL`: For vector search
- `SUPABASE_SERVICE_ROLE_KEY`: For server-side queries

## Metrics to Track

- Search query frequency
- Average search time
- LLM token usage
- Cache hit rate
- Error rates by type
- User satisfaction (could add thumbs up/down)

---

**Next Steps:**
1. Review and approve this design
2. Implement in order: types → embedding → search → rerank → LLM → UI
3. Test with real queries
4. Iterate based on feedback

