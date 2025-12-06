---
tags:
  - documentation
  - hackathon
---
# Data Workflow for AI SYNC DAY Hackathon

## Overview

The participants data comes in **two versions** with **identical structure** but different privacy levels:

1. **`participants_mocked.json`** - Public template (safe for GitHub, starter kits)
2. **`participants.json`** - Real data (private, use during actual event with consent)

## Structure Compatibility

Both JSON files have the **exact same structure** (31 fields), making them seamlessly swappable:

### Original Fields (16)
- Basic info: `id`, `name`, `email`, `telegram`, `linkedin`, `photo`
- Professional: `bio`, `skills`, `hasStartup`, `startupStage`, `startupDescription`, `startupName`
- Community: `lookingFor`, `canHelp`, `needsHelp`, `aiUsage`

### Custom Fields (14) - Empty, Ready for Your Implementation
- **String fields**: `custom_1` through `custom_7` (7 fields for text data)
- **Array fields**: `custom_array_1` through `custom_array_7` (7 fields for lists/collections)

**Why generic names?** To avoid conflicts between teams. Each team can use these fields for their own purposes (parsing, features, metadata, etc.). Document your field mapping in your code.

**Example mappings:**
- `custom_1` = enhanced bio, `custom_array_1` = parsed skills
- `custom_5` = status (traffic light), `custom_array_2` = interests
- `custom_4` = last updated, `custom_array_3` = data sources

### Metadata (1)
- `_note` - Documentation note

**See [CUSTOM_FIELDS_GUIDE.md](./CUSTOM_FIELDS_GUIDE.md) for detailed usage examples.**

```json
{
  "id": 1,
  "name": "...",
  "email": "...",           // Empty in mocked, real in actual
  "telegram": "...",        // Mocked in template, real in actual
  "linkedin": "...",        // Mocked in template, real in actual
  "photo": "...",           // Empty in mocked, real in actual
  "bio": "...",
  "skills": [...],
  "hasStartup": boolean,
  "startupStage": "...",
  "startupDescription": "...",
  "startupName": "...",
  "lookingFor": [...],
  "canHelp": "...",
  "needsHelp": "...",
  "aiUsage": "...",
  // Custom fields (all start empty - use for your implementation):
  "custom_1": "",
  "custom_2": "",
  "custom_3": "",
  "custom_4": "",
  "custom_5": "",
  "custom_6": "",
  "custom_7": "",
  "custom_array_1": [],
  "custom_array_2": [],
  "custom_array_3": [],
  "custom_array_4": [],
  "custom_array_5": [],
  "custom_array_6": [],
  "custom_array_7": []
}
```

## Development Workflow

### Phase 1: Development (Public Repository)
- Use `participants_mocked.json` in your starter kit
- Build parsers that work with this structure
- Test RAG/search features with mocked data
- All code works with the template structure

### Phase 2: Event Day (With Consent)
- Participants build parsers to scan their **own** Telegram/LinkedIn profiles
- They consent to having their data parsed and used
- Swap `participants_mocked.json` → `participants.json` (same structure!)
- All existing code continues to work without changes

## Parser Development

Participants can build parsers that:

1. **Parse Telegram profiles** (using Telegram API or web scraping)
   - Extract: username, bio, profile info, interests
   - Populate custom fields (your choice):
     - Example: `custom_1` = enhanced bio, `custom_array_1` = parsed skills, `custom_array_2` = interests
   - Track data source: `custom_array_3 = ['telegram']`, `custom_4 = new Date().toISOString()`

2. **Parse LinkedIn profiles** (using LinkedIn API or web scraping)
   - Extract: profile URL, bio, skills, experience, location
   - Populate custom fields (your choice):
     - Example: `custom_1` = bio, `custom_7` = experience, `custom_2` = location, `custom_3` = timezone
   - Track data source: `custom_array_3 = ['linkedin']`, `custom_4 = new Date().toISOString()`

3. **Use generic custom fields flexibly**
   - 7 string fields (`custom_1` to `custom_7`) for text data
   - 7 array fields (`custom_array_1` to `custom_array_7`) for lists
   - Document your field mapping in your code
   - Each team can use fields differently without conflicts

4. **Build Community OS Features**
   - **Social Anxiety Traffic Light**: Example mapping: `custom_5` = status (green/yellow/red), `custom_6` = availability
   - **Coffee Break Roulette**: Example mapping: `custom_array_2` = interests, `custom_array_4` = common interests after matching (calculate score dynamically)
   - **Agentic Search**: Combine original fields with your custom fields for comprehensive RAG

## Data Swapping

### Option 1: Manual Swap
Simply replace the file:
```bash
cp participants.json src/data/participants.json
```

### Option 2: Environment-Based
Use environment variable to switch:
```javascript
const dataFile = process.env.USE_REAL_DATA 
  ? 'participants.json' 
  : 'participants_mocked.json';
```

### Option 3: Build Script
Create a swap script that:
- Validates structure compatibility
- Backs up mocked version
- Swaps in real data for event

## Privacy & Consent

- **Mocked version**: Safe for public repos, no real personal data
- **Real version**: Only used during event with explicit participant consent
- **Parsers**: Participants build their own, using their own profiles
- **Structure**: Identical structure ensures no code changes needed
- **Per-participant copies**: During the event, each participant can receive their own copy of the real data with their custom field mappings

## Benefits

✅ **Development**: Work with realistic structure without exposing real data  
✅ **Testing**: Build and test parsers with mocked data  
✅ **Event**: Seamlessly swap to real data during hackathon  
✅ **Privacy**: Real data only used with consent during event  
✅ **Flexibility**: Same codebase works with both versions  
✅ **Extensibility**: 14 generic custom fields (7 strings + 7 arrays) for flexible implementation  
✅ **No Conflicts**: Generic names mean each team can use fields for their own purposes  
✅ **Feature Support**: Built-in fields for all Community OS features (Traffic Light, Roulette, RAG)

## Related Documentation

- **[CUSTOM_FIELDS_GUIDE.md](./CUSTOM_FIELDS_GUIDE.md)** - Detailed guide on using custom fields with code examples

