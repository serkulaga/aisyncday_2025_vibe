# Data Swapping Guide

This guide explains how to switch between mocked and real participant data files.

## Overview

The Community OS project supports two data files with identical structure:

- **`participants_mocked.json`** - Public template with mock data (safe for GitHub)
- **`participants.json`** - Real participant data (private, git-ignored)

Both files have the exact same 31-field structure, making them seamlessly swappable.

## Quick Start

### Using Environment Variable

The simplest way to switch between data sources is using the `USE_REAL_DATA` environment variable:

```bash
# Use real data
export USE_REAL_DATA=true
npx tsx scripts/seed-participants.ts

# Use mocked data (default)
export USE_REAL_DATA=false
# or simply don't set it
npx tsx scripts/seed-participants.ts
```

### Using the Swap Script

For more control, use the swap utility:

```bash
# Validate both files (no changes)
npx tsx scripts/swap-data.ts --validate

# Switch to real data with backup
npx tsx scripts/swap-data.ts --to-real --backup

# Switch to mocked data
npx tsx scripts/swap-data.ts --to-mocked
```

## File Locations

The system checks for files in these locations (in order):

1. **Root directory:**
   - `participants_mocked.json`
   - `participants.json`

2. **Alternative location:**
   - `src/data/participants_mocked.json`
   - `src/data/participants.json`

## Configuration

### Environment Variable

Set `USE_REAL_DATA` to switch modes:

- `USE_REAL_DATA=true` or `USE_REAL_DATA=1` → Use real data
- `USE_REAL_DATA=false` or unset → Use mocked data (default)

**Note:** For safety, the system defaults to mocked data if the real file doesn't exist.

### Programmatic Usage

In your code, use the configuration utility:

```typescript
import { getActiveDataSource, getDataFilePath } from "@/lib/data/config";

// Get current mode and file path
const { mode, path } = getActiveDataSource();
console.log(`Using ${mode} data from ${path}`);

// Get just the file path
const filePath = getDataFilePath();
```

## Validation

Before swapping data, always validate both files:

```bash
npx tsx scripts/swap-data.ts --validate
```

This checks:
- Both files exist
- Both have valid JSON structure
- Both contain arrays of participants
- All participants have required fields (31 fields)
- Type validation (id is number, skills is array, etc.)

## Backup

Always create backups before swapping:

```bash
npx tsx scripts/swap-data.ts --to-real --backup
```

Backups are saved to `.backups/` directory with timestamps:
```
.backups/participants_mocked.json.2024-12-07T12-30-45-123Z.backup
```

## Security

### Git Ignore

The real data file (`participants.json`) is automatically git-ignored to prevent accidental commits:

```gitignore
# Real participant data (contains personal information)
participants.json
src/data/participants.json
```

### Checklist Before Using Real Data

- [ ] Verify `participants.json` is in `.gitignore`
- [ ] Verify real data file is NOT tracked by git
- [ ] Ensure all participants have given consent
- [ ] Back up mocked data if needed
- [ ] Set `USE_REAL_DATA=true` only when necessary
- [ ] Use mocked data for development and testing

### Verifying Git Ignore

Check that real data is not tracked:

```bash
git check-ignore participants.json
# Should output: participants.json

git status
# Should NOT show participants.json
```

## Workflow Examples

### Development Phase (Mocked Data)

```bash
# 1. Ensure mocked data is being used (default)
unset USE_REAL_DATA

# 2. Seed database with mocked data
npx tsx scripts/seed-participants.ts

# 3. Generate embeddings
npx tsx scripts/generate-embeddings.ts
```

### Event Day (Real Data)

```bash
# 1. Place real data file (ensure it's git-ignored)
# File: participants.json

# 2. Validate structure
npx tsx scripts/swap-data.ts --validate

# 3. Switch to real data
export USE_REAL_DATA=true

# 4. Backup and seed
npx tsx scripts/swap-data.ts --to-real --backup
npx tsx scripts/seed-participants.ts

# 5. Generate embeddings for real data
npx tsx scripts/generate-embeddings.ts
```

### Switching Back to Mocked

```bash
# 1. Switch back to mocked
export USE_REAL_DATA=false
# or
unset USE_REAL_DATA

# 2. Seed with mocked data
npx tsx scripts/seed-participants.ts
```

## Troubleshooting

### Error: "Real data file not found"

**Cause:** `USE_REAL_DATA=true` but `participants.json` doesn't exist.

**Solution:**
- Verify file exists: `ls participants.json`
- Or switch to mocked mode: `unset USE_REAL_DATA`

### Error: "File structure incompatible"

**Cause:** Files have different structures or missing fields.

**Solution:**
- Run validation: `npx tsx scripts/swap-data.ts --validate`
- Check error messages for specific issues
- Ensure both files follow the 31-field structure

### Warning: "Real data file not found. Falling back to mocked"

**Cause:** System tried to use real data but file doesn't exist.

**Solution:**
- This is a safety feature - system automatically uses mocked data
- To use real data, ensure `participants.json` exists
- Check file path in error message

## Data Structure

Both files must have this exact structure (31 fields):

### Original Fields (16)
- `id`, `name`, `email`, `telegram`, `linkedin`, `photo`
- `bio`, `skills`, `hasStartup`, `startupStage`, `startupDescription`, `startupName`
- `lookingFor`, `canHelp`, `needsHelp`, `aiUsage`

### Custom Fields (14)
- String fields: `custom_1` through `custom_7`
- Array fields: `custom_array_1` through `custom_array_7`

### Metadata (1)
- `_note` (optional)

See [DATA_WORKFLOW.md](../init-docs/DATA_WORKFLOW.md) for detailed structure documentation.

## Related Documentation

- [DATA_WORKFLOW.md](../init-docs/DATA_WORKFLOW.md) - Full data structure and workflow
- [CUSTOM_FIELDS_GUIDE.md](../init-docs/CUSTOM_FIELDS_GUIDE.md) - Using custom fields
- [scripts/README.md](../scripts/README.md) - Script documentation

