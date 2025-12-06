# Environment Variables Setup Guide

## Required Variables for Development

Your `.env.local` file must contain these variables:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key  # ⚠️ MISSING - You need to add this!

# Optional: For admin scripts
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key
OPENAI_EMBEDDING_MODEL=text-embedding-3-small  # Optional
OPENAI_LLM_MODEL=gpt-4o-mini  # Optional
```

## Where to Get Each Key

### Supabase Keys

1. Go to your Supabase project: https://app.supabase.com/project/sqemfehlnehrxdcuxsuw
2. Click **Settings** → **API**
3. You'll see two keys:

   - **`anon` `public`** key → Use for `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - This is safe to expose in the browser
     - Used by the app for client-side operations
   
   - **`service_role`** key → Use for `SUPABASE_SERVICE_ROLE_KEY`
     - ⚠️ KEEP SECRET - Never commit this to git
     - Only used for server-side admin scripts (seeding, embeddings)

### OpenAI Key

1. Go to https://platform.openai.com/api-keys
2. Create a new API key or use an existing one
3. Copy and paste into `OPENAI_API_KEY`

## File Format

Your `.env.local` file should look like:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://sqemfehlnehrxdcuxsuw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNxZW1mZWhsbmVocnhkY3V4c3V3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUwMzQ0MTYsImV4cCI6MjA4MDYxMDQxNn0.yMRbq52aj1votnETCb-JlrGa9scH2pGHn-otYcG1cRs
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
OPENAI_API_KEY=sk-proj-...
OPENAI_EMBEDDING_MODEL=text-embedding-3-small
```

## Important Notes

- ⚠️ **Never commit `.env.local` to git** - It's already in `.gitignore`
- ✅ **Restart dev server** after changing `.env.local`: Press `Ctrl+C` then run `npm run dev` again
- ✅ Variables starting with `NEXT_PUBLIC_` are exposed to the browser
- ✅ Other variables are server-side only

## Current Status

Based on your current `.env.local`:
- ✅ `NEXT_PUBLIC_SUPABASE_URL` - Found
- ❌ `NEXT_PUBLIC_SUPABASE_ANON_KEY` - **MISSING** (This is causing the error!)
- ✅ `SUPABASE_SERVICE_ROLE_KEY` - Found
- ✅ `OPENAI_API_KEY` - Found

## Fix the Error

1. Open `.env.local` in your editor
2. Add this line (get the value from Supabase Dashboard → Settings → API → anon/public key):
   ```
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```
3. Save the file
4. Restart your dev server (`Ctrl+C` then `npm run dev`)

