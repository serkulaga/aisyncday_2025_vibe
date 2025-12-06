# Project Structure

This document describes the file structure of the Community OS application.

## Directory Structure

```
src/
├── app/                          # Next.js App Router pages
│   ├── layout.tsx               # Root layout with navigation
│   ├── page.tsx                 # Dashboard/home page
│   ├── participants/
│   │   └── page.tsx            # Participants list page
│   ├── search/
│   │   └── page.tsx            # Agentic search page
│   ├── status/
│   │   └── page.tsx            # Traffic light status page
│   ├── roulette/
│   │   └── page.tsx            # Coffee break roulette page
│   ├── exchange/
│   │   └── page.tsx            # Skill exchange board page
│   └── globals.css              # Global styles and Tailwind
│
├── components/
│   ├── layout/
│   │   └── navbar.tsx          # Navigation bar component
│   ├── dashboard/
│   │   └── stats-card.tsx      # Dashboard statistics card
│   └── ui/                      # shadcn/ui components
│       ├── button.tsx
│       ├── card.tsx
│       └── ... (other shadcn components)
│
├── lib/
│   └── utils.ts                 # Utility functions (cn helper)
│
└── types/
    └── index.ts                 # TypeScript type definitions

```

## Key Files

### Layout and Navigation

- **`src/app/layout.tsx`**: Root layout wrapping all pages. Includes Navbar and main container.
- **`src/components/layout/navbar.tsx`**: Navigation bar with links to all main pages. Shows active route.

### Pages

- **`src/app/page.tsx`**: Dashboard with overview stats and event description.
- **`src/app/participants/page.tsx`**: Placeholder for participants list.
- **`src/app/search/page.tsx`**: Placeholder for agentic search interface.
- **`src/app/status/page.tsx`**: Placeholder for traffic light status view.
- **`src/app/roulette/page.tsx`**: Placeholder for coffee break roulette.
- **`src/app/exchange/page.tsx`**: Placeholder for skill exchange board.

### Components

- **`src/components/dashboard/stats-card.tsx`**: Reusable statistics card with icon and variant support.

### Types

- **`src/types/index.ts`**: TypeScript definitions for Participant and related types. Ready for Supabase integration.

## Design Patterns

### Typography and Spacing

- Uses Tailwind's spacing scale (`space-y-6`, `gap-4`, etc.)
- Consistent heading hierarchy (`text-4xl`, `text-3xl`, `text-xl`)
- Muted text for descriptions using `text-muted-foreground`

### Component Organization

- Layout components in `components/layout/`
- Feature-specific components in feature folders (e.g., `components/dashboard/`)
- Reusable UI primitives from shadcn/ui in `components/ui/`

### Data Placeholders

- Dashboard stats are hardcoded placeholders
- Ready to be replaced with Supabase queries
- Type definitions already match the expected data structure

## Next Steps

When connecting to Supabase:
1. Create `src/lib/supabase/` for client utilities
2. Create `src/lib/api/` for data fetching functions
3. Replace placeholder data in pages with real queries
4. Add loading and error states
5. Implement real-time subscriptions for status updates

