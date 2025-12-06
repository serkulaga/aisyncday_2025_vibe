# Supabase TypeScript Implementation

This document describes the TypeScript implementation for Supabase integration.

## File Structure

```
src/
├── types/
│   ├── index.ts              # Application-facing types (camelCase)
│   └── database.ts           # Database types (snake_case)
├── lib/
│   └── supabase/
│       ├── index.ts          # Barrel export
│       ├── client.ts         # Supabase client helpers
│       ├── transform.ts      # DB <-> App type transformations
│       └── participants.ts   # Data access layer
```

## Type System

### Database Types (`src/types/database.ts`)

Raw database types matching the Supabase schema exactly:
- **`DatabaseParticipant`**: Snake_case fields matching DB columns
- **`StatusType`**: Union type for traffic light status
- **`TrafficLightUpdate`**: Update payload for status fields
- **`SimilaritySearchResult`**: RPC function result with similarity score

### Application Types (`src/types/index.ts`)

Developer-friendly types using camelCase:
- **`Participant`**: CamelCase fields for use in components
- **`TrafficLightStatusUpdate`**: App-facing status update payload
- **`PaginationParams`**: Pagination configuration
- **`PaginatedResponse<T>`**: Paginated results wrapper
- **`SimilaritySearchParams`**: Vector search parameters

### Type Transformations

The `transform.ts` module converts between database and application types:
- `dbParticipantToApp()`: Converts DB participant to app participant
- `appParticipantToDb()`: Converts app participant to DB participant (for updates)

## Supabase Clients

### Browser Client (`createClient()`)

**Location:** `src/lib/supabase/client.ts`

Creates a client for use in:
- Client Components
- Browser code
- Client-side hooks

```typescript
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();
```

**Environment Variables Required:**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Server Client (`createServerSupabaseClient()`)

**Location:** `src/lib/supabase/client.ts`

Creates a client for use in:
- Server Components
- API Routes
- Server Actions

Automatically handles cookies for authentication.

```typescript
import { createServerSupabaseClient } from "@/lib/supabase/client";

const supabase = createServerSupabaseClient();
```

## Data Access Layer

### Functions Available

All functions are available in both server and client versions:

#### 1. `getAllParticipants()` / `getAllParticipantsClient()`

Fetches all participants with pagination.

```typescript
import { getAllParticipants } from "@/lib/supabase/participants";

const result = await getAllParticipants({ page: 1, limit: 20 });
// Returns: { data: Participant[], page: 1, limit: 20, total: 100, totalPages: 5 }
```

#### 2. `getParticipantById()` / `getParticipantByIdClient()`

Fetches a single participant by ID.

```typescript
import { getParticipantById } from "@/lib/supabase/participants";

const participant = await getParticipantById(1);
// Returns: Participant | null
```

#### 3. `updateTrafficLightStatus()` / `updateTrafficLightStatusClient()`

Updates status and availability fields (custom_5 and custom_6).

```typescript
import { updateTrafficLightStatus } from "@/lib/supabase/participants";

const updated = await updateTrafficLightStatus(1, {
  status: "green",
  availabilityText: "Available for networking"
});
// Returns: Participant
```

#### 4. `similaritySearch()` / `similaritySearchClient()`

Performs vector similarity search on embeddings.

```typescript
import { similaritySearch } from "@/lib/supabase/participants";

const results = await similaritySearch({
  embedding: [0.1, 0.2, ...], // 1536 dimensions
  limit: 10,
  threshold: 0.5
});
// Returns: Participant[] (sorted by similarity)
```

**Note:** Requires the `match_participants` RPC function (see migration `002_create_similarity_search_function.sql`).

If the RPC function doesn't exist, it falls back to in-memory similarity calculation (less efficient).

## Usage Examples

### Server Component

```typescript
// app/participants/page.tsx
import { getAllParticipants } from "@/lib/supabase/participants";

export default async function ParticipantsPage() {
  const { data } = await getAllParticipants({ page: 1, limit: 20 });
  
  return (
    <div>
      {data.map(p => <div key={p.id}>{p.name}</div>)}
    </div>
  );
}
```

### Client Component

```typescript
// components/participant-list.tsx
"use client";

import { useEffect, useState } from "react";
import { getAllParticipantsClient } from "@/lib/supabase/participants";
import type { Participant } from "@/types";

export function ParticipantList() {
  const [participants, setParticipants] = useState<Participant[]>([]);
  
  useEffect(() => {
    getAllParticipantsClient().then(result => {
      setParticipants(result.data);
    });
  }, []);
  
  return <div>...</div>;
}
```

### API Route

```typescript
// app/api/participants/route.ts
import { getAllParticipants } from "@/lib/supabase/participants";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  
  const result = await getAllParticipants({ page, limit });
  return NextResponse.json(result);
}
```

### Update Status (Server Action)

```typescript
// app/actions/status.ts
"use server";

import { updateTrafficLightStatus } from "@/lib/supabase/participants";
import type { StatusType } from "@/types";

export async function updateStatus(
  id: number,
  status: StatusType,
  availabilityText?: string
) {
  return await updateTrafficLightStatus(id, { status, availabilityText });
}
```

## Vector Similarity Search

### RPC Function

The similarity search uses a Postgres RPC function for efficiency. Make sure to run migration `002_create_similarity_search_function.sql`:

```sql
-- Run this in Supabase SQL Editor
-- File: supabase/migrations/002_create_similarity_search_function.sql
```

The function:
- Performs cosine similarity using pgvector's `<=>` operator
- Filters by similarity threshold
- Returns results sorted by similarity (highest first)
- Includes similarity score in results

### Fallback Behavior

If the RPC function doesn't exist, the TypeScript code falls back to:
1. Fetching all participants with embeddings
2. Calculating cosine similarity in memory
3. Filtering and sorting results

This is less efficient but works without the database function.

## Type Safety

All functions are fully typed:
- ✅ No `any` types used
- ✅ Proper TypeScript inference
- ✅ Database types match schema exactly
- ✅ Transform functions ensure type safety

## Error Handling

All functions throw errors with descriptive messages:
- Database connection errors
- Query execution errors
- Missing data errors
- Type conversion errors

Wrap in try/catch blocks:

```typescript
try {
  const participant = await getParticipantById(1);
} catch (error) {
  console.error("Failed to fetch participant:", error);
}
```

## Next Steps

1. **Run Migrations:**
   - `001_create_participants_table.sql`
   - `002_create_similarity_search_function.sql`

2. **Seed Data:**
   - Create script to import `participants_mocked.json`
   - Generate embeddings for all participants

3. **Test Functions:**
   - Test all CRUD operations
   - Test vector similarity search
   - Verify type transformations

4. **Integrate with UI:**
   - Replace placeholder data in dashboard
   - Connect search page to similarity search
   - Connect status page to update functions

