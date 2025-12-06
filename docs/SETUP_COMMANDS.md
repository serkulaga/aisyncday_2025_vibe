# Setup Commands for Community OS

Run these commands in order to set up the Next.js 14 project.

---

## Step 1: Initialize Next.js 14 with TypeScript

```bash
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --yes
```

This will:
- Create Next.js 14 with App Router
- Set up TypeScript
- Configure Tailwind CSS
- Set up ESLint
- Use `src/` directory structure
- Configure import alias `@/*`

**Note:** When prompted, say "No" to any optional features we'll add manually (like Turbopack).

---

## Step 2: Install Additional Dependencies

```bash
npm install @supabase/supabase-js @supabase/ssr openai
npm install -D @types/node
```

---

## Step 3: Install shadcn/ui

First, initialize shadcn/ui:

```bash
npx shadcn@latest init
```

When prompted:
- **Style:** Default
- **Base color:** Slate
- **CSS variables:** Yes
- **Component directory:** src/components/ui

Then install the components we'll need:

```bash
npx shadcn@latest add button card input badge avatar separator
npx shadcn@latest add select radio-group label textarea
npx shadcn@latest add toast dialog skeleton
```

---

## Step 4: Install Additional UI Dependencies

```bash
npm install lucide-react class-variance-authority clsx tailwind-merge
```

---

## Step 5: Create Environment Variables Template

Create `.env.local.example` file (see contents below).

---

## Step 6: Verify Installation

```bash
npm run dev
```

Visit `http://localhost:3000` to verify Next.js is running.

---

**Next:** Review the configuration files below and ensure they match your setup.

