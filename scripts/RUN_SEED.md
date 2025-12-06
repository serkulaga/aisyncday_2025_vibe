# How to Run the Seeding Script

## Quick Start

1. **Install required dependencies** (if not already installed):
   ```bash
   npm install @supabase/supabase-js
   npm install -D tsx
   ```

2. **Set up environment variables** in `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   ```

   **Where to find these:**
   - `NEXT_PUBLIC_SUPABASE_URL`: Supabase Dashboard → Settings → API → Project URL
   - `SUPABASE_SERVICE_ROLE_KEY`: Supabase Dashboard → Settings → API → `service_role` key (⚠️ Keep this secret!)

3. **Run the script from project root**:
   ```bash
   npx tsx scripts/seed-participants.ts
   ```

## Step-by-Step Setup

### Step 1: Install Dependencies

Make sure you have the required packages installed:

```bash
# Install Supabase client (required)
npm install @supabase/supabase-js

# Install tsx for running TypeScript (if not already installed)
npm install -D tsx
```

### Step 2: Set Up Environment Variables

Create or update `.env.local` in the project root:

```bash
# Create .env.local if it doesn't exist
# Windows PowerShell:
New-Item -Path ".env.local" -ItemType File

# Mac/Linux:
touch .env.local
```

Then add your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

**Finding your keys:**
1. Go to https://supabase.com/dashboard
2. Select your project
3. Go to Settings → API
4. Copy "Project URL" → `NEXT_PUBLIC_SUPABASE_URL`
5. Copy "service_role" key (under "Project API keys") → `SUPABASE_SERVICE_ROLE_KEY`

⚠️ **Important:** The service_role key has admin privileges. Never commit it to git!

### Step 3: Run the Script

From the **project root directory** (not from the `scripts` folder):

```bash
npx tsx scripts/seed-participants.ts
```

## Alternative: Using ts-node

If you prefer `ts-node`:

```bash
npm install -D ts-node @types/node
npx ts-node scripts/seed-participants.ts
```

## Custom JSON Path

Specify a different JSON file:

```bash
npx tsx scripts/seed-participants.ts src/data/participants.json
```

## Default Paths

The script looks for participants data in this order:
1. Command line argument (if provided)
2. `init-docs/participants_mocked.json` (default)

## What It Does

1. ✅ Loads JSON file from specified path
2. ✅ Validates each participant record matches expected shape
3. ✅ Converts camelCase (JSON) to snake_case (database)
4. ✅ Upserts into `participants` table (idempotent - safe to run multiple times)
5. ✅ Logs how many were created vs updated
6. ✅ Handles errors gracefully

## Output

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

## Safety Features

- ✅ **Idempotent**: Safe to run multiple times (uses upsert)
- ✅ **Validated**: Checks data shape before inserting
- ✅ **Batch processing**: Handles large datasets efficiently
- ✅ **Error handling**: Continues on batch failures, reports errors
- ✅ **No secrets in code**: All credentials from environment variables

## Troubleshooting

### Error: Cannot find module '@supabase/supabase-js'
**Solution:**
```bash
npm install @supabase/supabase-js
```

### Error: Missing environment variables
- Make sure `.env.local` exists and contains both required variables
- Check that variable names are exact (case-sensitive)
- Verify the file is in the project root, not in `scripts/`

### Error: Cannot read JSON file
- Verify the file path is correct
- Check file permissions
- Ensure JSON is valid (run through a validator)

### Error: Database connection failed
- Verify Supabase URL is correct
- Check service role key is correct (not the anon key!)
- Ensure Supabase project is active (not paused)

### Warning: Some participants invalid
- Check the validation warnings in the output
- Verify JSON structure matches expected schema

### Path resolution errors
- Make sure you're running from the **project root**, not from `scripts/`
- If you see `scripts/scripts/seed-participants.ts`, you're in the wrong directory

## Next Steps

After seeding:
1. ✅ Verify data in Supabase Dashboard → Table Editor → participants
2. ✅ Generate embeddings for participants (separate script - coming next)
3. ✅ Test queries and search functionality
