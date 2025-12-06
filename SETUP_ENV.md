# Setting Up Environment Variables

## Quick Setup

1. **Copy the example file:**
   ```bash
   # Windows PowerShell
   Copy-Item ".env.local.example" ".env.local"
   
   # Mac/Linux
   cp .env.local.example .env.local
   ```

2. **Edit `.env.local` and add your Supabase credentials**

3. **Run the seeding script again**

## Getting Your Supabase Credentials

### Step 1: Go to Supabase Dashboard

1. Visit https://supabase.com/dashboard
2. Sign in to your account
3. Select your project (or create a new one)

### Step 2: Get Project URL

1. In your Supabase project, go to **Settings** (gear icon in sidebar)
2. Click **API**
3. Under **Project URL**, copy the URL
   - Example: `https://abcdefghijklmnop.supabase.co`

### Step 3: Get Service Role Key

1. Still in **Settings → API**
2. Under **Project API keys**, find the **`service_role`** key
3. Click the **eye icon** to reveal it (if hidden)
4. Copy the key
   - ⚠️ **IMPORTANT:** This is the `service_role` key, NOT the `anon` key!
   - The `service_role` key has admin privileges

### Step 4: Create `.env.local`

Create a file named `.env.local` in the project root with:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Replace the values with your actual credentials!**

## Security Notes

- ✅ `.env.local` is already in `.gitignore` - your secrets are safe
- ⚠️ Never commit `.env.local` to git
- ⚠️ The `service_role` key has full database access - keep it secret
- ✅ Only use `service_role` key for admin scripts like seeding
- ✅ Use `anon` key in your application code (client-side)

## Verifying Setup

After creating `.env.local`, verify it works:

```bash
# Windows PowerShell
Get-Content .env.local

# Mac/Linux
cat .env.local
```

You should see your credentials (don't share them publicly!).

## Troubleshooting

**File not found when running script:**
- Make sure `.env.local` is in the **project root**, not in `scripts/`
- Verify the filename is exactly `.env.local` (not `.env.local.txt`)

**Still getting "Missing environment variables":**
- Check for typos in variable names (case-sensitive!)
- Make sure there are no spaces around the `=` sign
- Restart your terminal after creating the file
- Verify the file is saved (check file size > 0)

**Wrong key type:**
- Make sure you're using the **`service_role`** key, not `anon`
- The `anon` key won't work for seeding (doesn't have admin privileges)

## Next Steps

Once `.env.local` is set up:

```bash
npx tsx scripts/seed-participants.ts
```

The script should now find your credentials and connect to Supabase!

