# Setup Checklist - Community OS

Use this checklist to track your setup progress.

---

## ✅ Phase 1: Commands to Run

Run these in your terminal:

- [ ] **Step 1:** Initialize Next.js
  ```bash
  npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --yes
  ```

- [ ] **Step 2:** Install dependencies
  ```bash
  npm install @supabase/supabase-js @supabase/ssr openai
  npm install -D @types/node
  npm install lucide-react class-variance-authority clsx tailwind-merge tailwindcss-animate
  ```

- [ ] **Step 3:** Initialize shadcn/ui
  ```bash
  npx shadcn@latest init
  ```
  *Answer: Default, Slate, Yes, src/components/ui*

- [ ] **Step 4:** Install shadcn/ui components
  ```bash
  npx shadcn@latest add button card input badge avatar separator
  npx shadcn@latest add select radio-group label textarea
  npx shadcn@latest add toast dialog skeleton
  ```

- [ ] **Step 5:** Create `.env.local.example` file (see CONFIG_FILES.md)
- [ ] **Step 6:** Copy to `.env.local` and fill in your API keys
- [ ] **Step 7:** Test: `npm run dev` - should show Next.js page at localhost:3000

---

## ✅ Phase 2: Configuration Files to Update

After running the commands, update these files:

### File: `tailwind.config.ts` (Root directory)

**Status:** [ ] Updated  
**Action:** Replace entire file with contents from `CONFIG_FILES.md` → "File: `tailwind.config.ts`"  
**What it does:** Adds shadcn/ui theme colors and CSS variable support

---

### File: `src/app/globals.css` (src/app/globals.css)

**Status:** [ ] Updated  
**Action:** Replace entire file with contents from `CONFIG_FILES.md` → "File: `src/app/globals.css`"  
**What it does:** Adds Tailwind directives and shadcn/ui CSS variables (light/dark themes)

---

### File: `next.config.mjs` (Root directory)

**Status:** [ ] Updated  
**Action:** Replace with contents from `CONFIG_FILES.md` → "File: `next.config.mjs`"  
**What it does:** Adds image domain for Supabase (for profile photos)

---

### File: `tsconfig.json` (Root directory)

**Status:** [ ] Verified  
**Action:** Verify it has `paths: { "@/*": ["./src/*"] }` in compilerOptions  
**What it does:** Enables `@/components` import alias

**Should look like:**
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

---

### File: `components.json` (Root directory)

**Status:** [ ] Verified  
**Action:** Created by `shadcn init` - verify it exists and has correct paths  
**What it does:** shadcn/ui configuration

**Should have:**
```json
{
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui"
  }
}
```

---

### File: `.env.local` (Root directory)

**Status:** [ ] Created & Filled  
**Action:** Copy from `.env.local.example`, add your actual API keys  
**What it does:** Stores environment variables (gitignored)

**Required variables:**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `OPENAI_API_KEY`

---

### File: `.gitignore` (Root directory)

**Status:** [ ] Verified  
**Action:** Ensure `.env.local` and `.env*.local` are in the ignore list  
**What it does:** Prevents committing sensitive keys

**Should include:**
```
.env*.local
.env
```

---

## ✅ Phase 3: Verification

- [ ] Run `npm run dev` - server starts without errors
- [ ] Visit `http://localhost:3000` - Next.js welcome page appears
- [ ] Check `src/components/ui` - has installed components (button.tsx, card.tsx, etc.)
- [ ] Check `src/lib/utils.ts` - exists with `cn()` function
- [ ] Check TypeScript compilation - no errors in terminal
- [ ] Test import alias - create a test file importing `@/components/...`

---

## 📁 Expected Directory Structure

After setup, you should have:

```
aisyncday_2025_vibe/
├── src/
│   ├── app/
│   │   ├── globals.css        ← Updated
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   └── ui/                ← shadcn/ui components
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       └── ... (other components)
│   └── lib/
│       └── utils.ts           ← shadcn/ui utility
├── docs/
├── init-docs/
├── .env.local                 ← Your API keys (gitignored)
├── .env.local.example         ← Template
├── .gitignore
├── components.json            ← shadcn/ui config
├── next.config.mjs            ← Updated
├── package.json
├── postcss.config.mjs
├── tailwind.config.ts         ← Updated
└── tsconfig.json              ← Verified
```

---

## 🐛 Troubleshooting

### Issue: "Cannot find module '@/components/...'"

**Fix:** Check `tsconfig.json` has the paths alias. Restart your IDE/editor.

### Issue: Tailwind styles not working

**Fix:** 
1. Verify `tailwind.config.ts` content paths include `./src/app/**/*`
2. Check `globals.css` has `@tailwind` directives
3. Restart dev server

### Issue: shadcn/ui components have TypeScript errors

**Fix:** Make sure all dependencies are installed: `npm install`

### Issue: Environment variables not loading

**Fix:**
1. Ensure `.env.local` is in root directory (not in `src/`)
2. Variable names must start with `NEXT_PUBLIC_` for client-side access
3. Restart dev server after changing `.env.local`

---

## 🎯 Next Steps

Once all checkboxes are complete:

1. ✅ All config files updated
2. ✅ Dev server running
3. ✅ No TypeScript errors
4. ✅ Ready for Phase 2: Database Schema Setup

**See `docs/VIBE_LOG.md` for the full project plan.**

---

## 📚 Reference Documents

- **Quick commands:** `QUICK_START.md`
- **Detailed guide:** `SETUP_GUIDE.md`
- **Config file contents:** `CONFIG_FILES.md`
- **Project plan:** `docs/VIBE_LOG.md`

