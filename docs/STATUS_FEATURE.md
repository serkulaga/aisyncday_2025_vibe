# Traffic Light Status Feature

## Overview

The Social Anxiety Traffic Light feature allows participants to update their availability status in real-time, visible to all community members.

## Field Mappings

Defined in `src/lib/constants/field-mappings.ts`:

- **`custom_5`**: Status indicator (`"green"` | `"yellow"` | `"red"`)
- **`custom_6`**: Availability text (free-form message)

### Status Values

- **Green**: Available - Open to pitches, conversations, and connections
- **Yellow**: Maybe - Selectively available, use discretion
- **Red**: Deep Work - Not available, in focus mode

## Implementation

### Constants File

**`src/lib/constants/field-mappings.ts`**
- Central definition of all field mappings
- Type-safe status values
- Labels and descriptions
- Validation helpers

### Storage Utilities

**`src/lib/utils/storage.ts`**
- `getCurrentParticipantId()` - Get saved participant ID from localStorage
- `setCurrentParticipantId(id)` - Save participant ID to localStorage
- `clearCurrentParticipantId()` - Clear saved selection

### Status Page

**`src/app/status/page.tsx`** (Server Component)
- Fetches all participants for dropdown
- Renders StatusManager client component

**`src/app/status/status-manager.tsx`** (Client Component)
- Participant selection dropdown
- Current status display
- Status update controls (buttons)
- Availability text input
- Quick suggestion badges
- Save functionality with error handling
- Real-time status overview cards

## Features

### Participant Selection

- Dropdown to select current participant
- Selection saved in localStorage
- Persists across page refreshes
- Defaults to first participant if none selected

### Status Update

- Visual status buttons (3 options: Green/Yellow/Red)
- Each button shows status label and description
- Active status highlighted
- Click to change status

### Availability Text

- Optional free-form text input
- Quick suggestion badges for each status
- Click badge to populate input
- Custom messages supported

### Visual Feedback

- Current status displayed with color-coded badge
- Loading states during save
- Success toast notification
- Error handling with user-friendly messages
- Status overview cards showing community counts

### Real-time Updates

After updating status:
- Data saved to Supabase
- Page refreshed (via `router.refresh()`)
- Status immediately visible in:
  - Participant cards on `/participants`
  - Dashboard statistics on `/`
  - Status overview cards

## User Flow

1. User visits `/status`
2. Selects their participant from dropdown (or uses saved selection)
3. Sees current status and availability text
4. Clicks status button to change status
5. Optionally adds/changes availability message
6. Clicks "Update Status"
7. Status saved to Supabase
8. Success notification shown
9. UI refreshes to show new status everywhere

## Integration Points

### Dashboard (`/`)
- Status counts fetched via `getDashboardStats()`
- Real-time counts of green/yellow/red participants
- Updates when status page saves changes

### Participants List (`/participants`)
- Participant cards show status badge
- Uses constants for consistent labeling
- Updates via server-side refresh

### Participant Detail (`/participants/[id]`)
- Status badge in header
- Uses constants for display
- Shows full status and availability

## Error Handling

- Network errors: Toast notification with error message
- Invalid participant: Graceful fallback
- Save failures: Error toast, retry possible
- Missing data: Default to "green" status

## Future Enhancements

- Real-time subscriptions via Supabase Realtime
- WebSocket updates for instant status changes
- Multiple device sync
- Status change history
- Scheduled status changes

## Usage Example

```typescript
// Update status programmatically
import { updateTrafficLightStatusClient } from "@/lib/supabase/participants";

await updateTrafficLightStatusClient(participantId, {
  status: "green",
  availabilityText: "Available for coffee chats"
});
```

