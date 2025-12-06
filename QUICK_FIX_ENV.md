# Quick Fix: Environment Variables Not Loading

If `.env.local` exists but the script can't read it, try this:

## Option 1: Install dotenv (Recommended)

```bash
npm install dotenv
```

Then run the script again:
```bash
npx tsx scripts/seed-participants.ts
```

## Option 2: Check Your .env.local File

Make sure your `.env.local` file has:
- **No quotes** around values (unless the value itself contains spaces)
- **No spaces** around the `=` sign
- **Exact variable names** (case-sensitive)

**Correct format:**
```env
NEXT_PUBLIC_SUPABASE_URL=https://abc123.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Wrong formats:**
```env
# ❌ Don't use quotes
NEXT_PUBLIC_SUPABASE_URL="https://abc123.supabase.co"

# ❌ Don't add spaces around =
NEXT_PUBLIC_SUPABASE_URL = https://abc123.supabase.co

# ❌ Don't use wrong case
next_public_supabase_url=https://abc123.supabase.co
```

## Option 3: Use System Environment Variables (Temporary)

**Windows PowerShell:**
```powershell
$env:NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
$env:SUPABASE_SERVICE_ROLE_KEY="your_key_here"
npx tsx scripts/seed-participants.ts
```

**Mac/Linux:**
```bash
export NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
export SUPABASE_SERVICE_ROLE_KEY="your_key_here"
npx tsx scripts/seed-participants.ts
```

## Verify Your .env.local

Check the file contents:
```bash
# Windows PowerShell
Get-Content .env.local

# Mac/Linux
cat .env.local
```

Make sure you see both variables with their values!

