# Deploying to Vercel

This guide will help you deploy your Community OS project to Vercel using the deploy link.

## Quick Deploy

### Step 1: Prepare Your Repository

1. Create a GitHub repository for your project
2. Push your code to the repository
3. Make sure it's **public** (or you're logged into GitHub)
4. Copy your repository URL (e.g., `https://github.com/yourusername/your-repo-name`)

### Step 2: URL-Encode Your Repository URL

The Vercel deploy link needs your repository URL to be URL-encoded.

**Option A: Use an Online Tool (Easiest)**
1. Go to https://www.urlencoder.org/
2. Paste your GitHub repository URL
3. Click "Encode"
4. Copy the encoded result

**Option B: Use Command Line**

```bash
# Using Python
python3 -c "import urllib.parse; print(urllib.parse.quote('https://github.com/yourusername/your-repo-name', safe=''))"

# Using Node.js
node -e "console.log(encodeURIComponent('https://github.com/yourusername/your-repo-name'))"
```

**Option C: Manual Encoding**
Replace these characters:
- `:` → `%3A`
- `/` → `%2F`
- `#` → `%23`
- `?` → `%3F`
- `&` → `%26`

**Example:**
- Original: `https://github.com/username/repo-name`
- Encoded: `https%3A%2F%2Fgithub.com%2Fusername%2Frepo-name`

### Step 3: Create Your Deploy Link

Use this template and replace `YOUR_ENCODED_REPO_URL` with your URL-encoded repository URL:

```
https://vercel.com/new/clone?repository-url=YOUR_ENCODED_REPO_URL&env=NEXT_PUBLIC_SUPABASE_URL,NEXT_PUBLIC_SUPABASE_ANON_KEY
```

**Complete Example:**

If your repository is:
```
https://github.com/johndoe/ai-sync-community-os
```

1. URL-encode it:
```
https%3A%2F%2Fgithub.com%2Fjohndoe%2Fai-sync-community-os
```

2. Create your deploy link:
```
https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fjohndoe%2Fai-sync-community-os&env=NEXT_PUBLIC_SUPABASE_URL,NEXT_PUBLIC_SUPABASE_ANON_KEY
```

### Step 4: Deploy to Vercel

1. **Open the deploy link** in your browser (paste it in the address bar)
2. You'll be redirected to Vercel
3. **Sign in** to Vercel (or create an account if needed)
4. **Connect your GitHub account** if prompted
5. Vercel will:
   - Show your repository in the import dialog
   - Ask you to set up environment variables:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
6. **Create a Supabase project** (if you haven't already):
   - Go to https://supabase.com
   - Create a new project
   - Copy the project URL and anon key from Settings → API
7. **Paste the environment variables** into Vercel
8. Click **Deploy**

### Step 5: Wait for Deployment

Vercel will:
- Clone your repository
- Install dependencies
- Build your project
- Deploy it to a live URL

You'll see a progress indicator and can view build logs in real-time.

## Alternative: Deploy from Vercel Dashboard

If you prefer using the Vercel dashboard:

1. Go to https://vercel.com
2. Sign in and click **"Add New Project"**
3. Import your GitHub repository
4. Configure environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Click **Deploy**

## Setting Up Supabase

Before deploying, you'll need Supabase credentials:

### 1. Create a Supabase Project

1. Go to https://supabase.com
2. Sign in (or create an account)
3. Click **"New Project"**
4. Fill in:
   - Project name (e.g., "ai-sync-community-os")
   - Database password (save this!)
   - Region (choose closest to you)
5. Click **"Create new project"**
6. Wait for the project to be ready (2-3 minutes)

### 2. Get Your API Keys

1. In your Supabase project, go to **Settings** → **API**
2. Copy these values:
   - **Project URL** → This is your `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public key** → This is your `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 3. Enable pgvector (for RAG)

If you're using RAG features, enable the pgvector extension:

1. Go to **Database** → **Extensions**
2. Search for `pgvector`
3. Click **Enable**

## Environment Variables

Your project needs these environment variables in Vercel:

| Variable | Description | Where to Get It |
|----------|-------------|-----------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | Supabase Dashboard → Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon/public key | Supabase Dashboard → Settings → API → anon/public key |

### Setting Environment Variables in Vercel

**During deployment:**
- Vercel will prompt you to enter these when you use the deploy link

**After deployment:**
1. Go to your project in Vercel dashboard
2. Click **Settings** → **Environment Variables**
3. Add each variable:
   - Name: `NEXT_PUBLIC_SUPABASE_URL`
   - Value: Your Supabase URL
   - Click **Save**
   - Repeat for `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. **Redeploy** your project for changes to take effect

## Troubleshooting

### Deployment Fails

**Build errors:**
- Check the build logs in Vercel dashboard
- Ensure `package.json` exists with proper scripts
- Verify all dependencies are listed in `package.json`

**Missing environment variables:**
- Make sure both Supabase variables are set
- Check for typos in variable names
- Redeploy after adding variables

**Repository not found:**
- Verify the repository exists and is accessible
- Check that the URL is correctly encoded
- Ensure the repository is public (or you're logged into GitHub)

### Environment Variables Not Working

- Variables starting with `NEXT_PUBLIC_` are exposed to the browser
- After adding/changing variables, you need to **redeploy**
- Check that variable names match exactly (case-sensitive)

### Supabase Connection Issues

- Verify your Supabase project is active
- Check that the URL and key are correct
- Ensure your Supabase project isn't paused (free tier pauses after inactivity)

### Build Takes Too Long

- Check build logs for specific errors
- Ensure your repository isn't too large
- Verify all dependencies can be installed

## Quick Reference

**Deploy Link Template:**
```
https://vercel.com/new/clone?repository-url=YOUR_ENCODED_REPO_URL&env=NEXT_PUBLIC_SUPABASE_URL,NEXT_PUBLIC_SUPABASE_ANON_KEY
```

**URL Encoder:**
- Online: https://www.urlencoder.org/
- Python: `python3 -c "import urllib.parse; print(urllib.parse.quote('YOUR_URL', safe=''))"`
- Node: `node -e "console.log(encodeURIComponent('YOUR_URL'))"`

**Useful Links:**
- Vercel Dashboard: https://vercel.com/dashboard
- Supabase Dashboard: https://supabase.com/dashboard
- Vercel Docs: https://vercel.com/docs
- Supabase Docs: https://supabase.com/docs

## Next Steps After Deployment

1. **Test your deployment** - Visit the URL Vercel provides
2. **Set up your database** - Seed Supabase with participant data
3. **Configure domain** (optional) - Add a custom domain in Vercel settings
4. **Set up monitoring** - Check Vercel analytics for performance

## Need Help?

- Check the main [README.md](./README.md) for project overview
- Review [DATA_WORKFLOW.md](./DATA_WORKFLOW.md) for data handling
- Vercel Support: https://vercel.com/support
- Supabase Support: https://supabase.com/support

---

**Pro Tip:** Bookmark your deploy link so you can quickly redeploy or share it with team members!
