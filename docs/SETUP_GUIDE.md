# Complete Setup Guide - Community OS

Follow these steps in order to set up your Next.js 14 project.

---

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Git (if using version control)

---

## Step 1: Initialize Next.js 14 Project

Run this command in the root directory:

```bash
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --yes
```

**What this does:**
- Creates Next.js 14 with App Router
- Sets up TypeScript
- Configures Tailwind CSS
- Sets up ESLint
- Uses `src/` directory structure
- Configures import alias `@/*` (so you can import with `@/components/...`)

**Note:** Answer "No" to optional features (Turbopack, etc.) - we'll configure manually.

---

## Step 2: Install Core Dependencies

```bash
npm install @supabase/supabase-js @supabase/ssr openai
```

**What this installs:**
- `@supabase/supabase-js` - Supabase JavaScript client
- `@supabase/ssr` - Supabase helpers for Next.js Server-Side Rendering
- `openai` - OpenAI API client for embeddings and chat completions

---

## Step 3: Install Development Dependencies

```bash
npm install -D @types/node
```

---

## Step 4: Install UI Dependencies

```bash
npm install lucide-react class-variance-authority clsx tailwind-merge
npm install tailwindcss-animate
```

**What this installs:**
- `lucide-react` - Icon library
- `class-variance-authority` - For component variants
- `clsx` & `tailwind-merge` - Utility functions for className management
- `tailwindcss-animate` - Tailwind animation plugin

---

## Step 5: Set Up shadcn/ui

Initialize shadcn/ui:

```bash
npx shadcn@latest init
```

**When prompted, choose:**
- **Style:** Default
- **Base color:** Slate
- **CSS variables:** Yes
- **Component directory:** `src/components/ui`

Install required components:

```bash
npx shadcn@latest add button card input badge avatar separator
npx shadcn@latest add select radio-group label textarea
npx shadcn@latest add toast dialog skeleton
```

---

## Step 6: Update Configuration Files

### 6.1: Update `tailwind.config.ts`

Replace the contents with the config from `CONFIG_FILES.md` (see section "File: `tailwind.config.ts`").

### 6.2: Update `src/app/globals.css`

Replace the contents with the styles from `CONFIG_FILES.md` (see section "File: `src/app/globals.css`").

### 6.3: Update `next.config.mjs`

Replace the contents with the config from `CONFIG_FILES.md` (see section "File: `next.config.mjs`").

### 6.4: Verify `tsconfig.json`

Ensure it has the paths configuration for `@/*` alias. See `CONFIG_FILES.md` for reference.

### 6.5: Verify `components.json`

This should have been created by `shadcn init`. Verify it matches the structure in `CONFIG_FILES.md`.

---

## Step 7: Create Environment Variables File

Create `.env.local.example`:

```bash
# On Windows (PowerShell)
New-Item -Path ".env.local.example" -ItemType File

# On Mac/Linux
touch .env.local.example
```

Then copy the contents from `CONFIG_FILES.md` (see section "File: `.env.local.example`").

Create your actual `.env.local` file:

```bash
# Windows (PowerShell)
Copy-Item ".env.local.example" ".env.local"

# Mac/Linux
cp .env.local.example .env.local
```

**Important:** Edit `.env.local` and add your actual API keys:
- Get Supabase URL and keys from https://supabase.com/dashboard
- Get OpenAI API key from https://platform.openai.com/api-keys

---

## Step 8: Verify Setup

Start the development server:

```bash
npm run dev
```

Visit `http://localhost:3000` - you should see the default Next.js page.

---

## Step 9: Verify Directory Structure

Your project should now have this structure:

```
aisyncday_2025_vibe/
├── src/
│   ├── app/
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   └── ui/          (shadcn/ui components)
│   └── lib/
│       └── utils.ts
├── docs/
├── init-docs/
├── .env.local.example
├── .env.local          (your actual keys - gitignored)
├── .gitignore
├── components.json
├── next.config.mjs
├── package.json
├── postcss.config.mjs
├── tailwind.config.ts
└── tsconfig.json
```

---

## Troubleshooting

### Issue: `create-next-app` fails because directory is not empty

**Solution:** The command might complain. If so, you can:
1. Temporarily move `docs/` and `init-docs/` to a parent directory
2. Run `create-next-app`
3. Move them back

Or manually create the Next.js structure.

### Issue: shadcn/ui components not found

**Solution:** Make sure you ran `npx shadcn@latest init` first, and verify `components.json` exists.

### Issue: Tailwind styles not applying

**Solution:** 
1. Check that `tailwind.config.ts` content paths are correct
2. Verify `globals.css` includes the Tailwind directives
3. Restart the dev server

### Issue: Import alias `@/*` not working

**Solution:** Check `tsconfig.json` has the paths configuration. You might need to restart your IDE/editor.

---

## Next Steps

Once setup is complete:

1. ✅ Verify all config files are correct
2. ✅ Test that the dev server runs
3. ✅ Proceed to **Phase 2: Database Schema & Supabase Setup**

---

## Quick Command Reference

```bash
# 1. Initialize Next.js
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --yes

# 2. Install dependencies
npm install @supabase/supabase-js @supabase/ssr openai
npm install -D @types/node
npm install lucide-react class-variance-authority clsx tailwind-merge tailwindcss-animate

# 3. Set up shadcn/ui
npx shadcn@latest init
npx shadcn@latest add button card input badge avatar separator select radio-group label textarea toast dialog skeleton

# 4. Create env file
cp .env.local.example .env.local  # Then edit with your keys

# 5. Test
npm run dev
```

---

**See `CONFIG_FILES.md` for all configuration file contents.**

