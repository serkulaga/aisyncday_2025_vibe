# Seeding Scripts

## Seed Participants

Seeds the `participants` table with data from a JSON file.

### Prerequisites

1. **Environment Variables** - Create or update `.env.local` with:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   ```

   **Where to find these:**
   - `NEXT_PUBLIC_SUPABASE_URL`: Supabase Dashboard → Settings → API → Project URL
   - `SUPABASE_SERVICE_ROLE_KEY`: Supabase Dashboard → Settings → API → `service_role` key (⚠️ Keep this secret!)

2. **Install dependencies:**
   ```bash
   npm install tsx
   ```

   Or use the existing TypeScript setup if you have `ts-node` or similar.

### Usage

**⚠️ Important:** Run the script from the **project root directory**, not from the `scripts` folder.

**Option 1: Using tsx (Recommended)**

From project root:
```bash
npx tsx scripts/seed-participants.ts
```

If you're in the scripts directory:
```bash
npx tsx seed-participants.ts
```

**Option 2: Using ts-node**

```bash
npx ts-node scripts/seed-participants.ts
```

**Option 3: Custom JSON path**

```bash
npx tsx scripts/seed-participants.ts src/data/participants.json
```

### Default Paths

The script looks for participants data in this order:
1. Command line argument (if provided)
2. `init-docs/participants_mocked.json` (default)

### What It Does

1. ✅ Loads JSON file from specified path
2. ✅ Validates each participant record matches expected shape
3. ✅ Converts camelCase (JSON) to snake_case (database)
4. ✅ Upserts into `participants` table (idempotent - safe to run multiple times)
5. ✅ Logs how many were created vs updated
6. ✅ Handles errors gracefully

### Output

The script provides detailed logging:
- Validation results
- Batch processing progress
- Created vs updated counts
- Error reporting

Example output:
```
🚀 Starting participant seeding...

📖 Loading participants from: init-docs/participants_mocked.json
✅ Loaded 31 participant records

🔍 Validating participants...
✅ Valid: 31

🔍 Checking existing participants...
   Found 0 existing participants

📝 Upserting 31 participants (batch size: 100)...

   Processing batch 1/1 (31 participants)...
   ✅ Batch 1 complete

==================================================
📊 Seeding Summary
==================================================
✅ Created: 31
🔄 Updated: 0
📝 Total processed: 31
==================================================

🎉 Seeding completed successfully!
```

### Safety Features

- ✅ **Idempotent**: Safe to run multiple times (uses upsert)
- ✅ **Validated**: Checks data shape before inserting
- ✅ **Batch processing**: Handles large datasets efficiently
- ✅ **Error handling**: Continues on batch failures, reports errors
- ✅ **No secrets in code**: All credentials from environment variables

### Troubleshooting

**Error: Missing environment variables**
- Make sure `.env.local` exists and contains both required variables
- Check that variable names are exact (case-sensitive)

**Error: Cannot read JSON file**
- Verify the file path is correct
- Check file permissions
- Ensure JSON is valid (run through a validator)

**Error: Database connection failed**
- Verify Supabase URL is correct
- Check service role key is correct
- Ensure Supabase project is active (not paused)

**Warning: Some participants invalid**
- Check the validation warnings in the output
- Verify JSON structure matches expected schema

### Next Steps

After seeding:
1. ✅ Verify data in Supabase Dashboard
2. ✅ Generate embeddings for participants (separate script)
3. ✅ Test queries and search functionality

