# Quick Start - Setup Commands

**Run these commands in order. Copy and paste each section.**

---

## 1. Initialize Next.js 14

```bash
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --yes
```

**When prompted about optional features, say "No" to Turbopack and other extras.**

---

## 2. Install Core Dependencies

```bash
npm install @supabase/supabase-js @supabase/ssr openai
npm install -D @types/node
```

---

## 3. Install UI Dependencies

```bash
npm install lucide-react class-variance-authority clsx tailwind-merge tailwindcss-animate
```

---

## 4. Initialize shadcn/ui

```bash
npx shadcn@latest init
```

**Answer prompts:**
- Style: **Default**
- Base color: **Slate**
- CSS variables: **Yes**
- Component directory: **src/components/ui**

---

## 5. Install shadcn/ui Components

```bash
npx shadcn@latest add button card input badge avatar separator
npx shadcn@latest add select radio-group label textarea
npx shadcn@latest add toast dialog skeleton
```

---

## 6. Create Environment Variables File

**Windows (PowerShell):**
```powershell
@"
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key

# Optional: Supabase Service Role Key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
"@ | Out-File -FilePath ".env.local.example" -Encoding utf8
```

**Mac/Linux:**
```bash
cat > .env.local.example << 'EOF'
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key

# Optional: Supabase Service Role Key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
EOF
```

Then create your actual `.env.local`:
```bash
# Windows
Copy-Item ".env.local.example" ".env.local"

# Mac/Linux
cp .env.local.example .env.local
```

**⚠️ Edit `.env.local` and add your actual API keys before proceeding!**

---

## 7. Test Installation

```bash
npm run dev
```

Visit `http://localhost:3000` - you should see the Next.js welcome page.

---

## 📝 Next: Update Config Files

After running the commands above, you need to update these configuration files. See `CONFIG_FILES.md` for the complete contents:

1. **`tailwind.config.ts`** - Replace with Tailwind config (includes shadcn/ui theming)
2. **`src/app/globals.css`** - Replace with global styles (includes CSS variables)
3. **`next.config.mjs`** - Update with image domain for Supabase
4. **Verify `tsconfig.json`** - Ensure paths alias is configured

---

## ✅ Verification Checklist

- [ ] Next.js dev server runs (`npm run dev`)
- [ ] Can visit `http://localhost:3000`
- [ ] `.env.local` file exists with your API keys
- [ ] `tailwind.config.ts` has shadcn/ui theme colors
- [ ] `src/app/globals.css` has CSS variables
- [ ] `src/components/ui` directory exists with components
- [ ] `src/lib/utils.ts` exists with `cn()` function

---

## 🚀 Next Steps

Once verified:
1. Review `CONFIG_FILES.md` to update remaining config files
2. Proceed to **Phase 2: Database Schema Setup**
3. See `docs/VIBE_LOG.md` for full project plan

