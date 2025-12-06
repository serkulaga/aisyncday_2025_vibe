# Quick Start - Run Seeding Script

## Important: Run from Project Root

The script should be run from the **project root directory**, not from the `scripts` folder.

## Steps

1. **Navigate to project root:**
   ```bash
   cd D:\work\ai\VibeCode2025\src\aisyncday_2025_vibe
   ```

2. **Ensure `.env.local` exists with:**
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

3. **Run the script:**
   ```bash
   npx tsx scripts/seed-participants.ts
   ```

## If You're Already in the Scripts Directory

If you're in `D:\work\ai\VibeCode2025\src\aisyncday_2025_vibe\scripts`, either:

**Option 1: Go to project root first**
```bash
cd ..
npx tsx scripts/seed-participants.ts
```

**Option 2: Run from current directory**
```bash
npx tsx seed-participants.ts
```

## Common Errors

**Error: `Cannot find module 'scripts/scripts/seed-participants.ts'`**
- ✅ Solution: You're in the scripts directory. Either `cd ..` first, or run `npx tsx seed-participants.ts` (without the `scripts/` prefix)

**Error: `Cannot find module '../src/types/database'`**
- ✅ Solution: Make sure you're in the project root when running the script

