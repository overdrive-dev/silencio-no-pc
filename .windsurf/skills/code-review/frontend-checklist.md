# Frontend Review Checklist

## Design System Compliance
- [ ] Colors use token classes (`bg-background`, `text-foreground`, `bg-accent`, etc.) or `card-flat`/`btn-pill` utilities
- [ ] No hardcoded hex in new code — use `globals.css` tokens
- [ ] Fonts: Plus Jakarta Sans (body) + DM Serif Display (headings) only
- [ ] Icons: Lucide React or @heroicons/react — no FontAwesome
- [ ] Cards use `card-flat` class or equivalent warm-border pattern
- [ ] Buttons use `btn-pill` classes (fully rounded) — no `rounded-xl` or `rounded-lg` on buttons
- [ ] No dark mode variants (`.dark`, `dark:`)
- [ ] No pure gray backgrounds (`bg-gray-*`) — use warm cream `bg-background`
- [ ] Borders use warm colors (`border-border` #e8e0d8) not cold gray
- [ ] No gradients on buttons or cards — flat design only

## React / Next.js Patterns
- [ ] Imports at top of file, never mid-file
- [ ] `"use client"` only on components that genuinely need client-side hooks/APIs
- [ ] Server Components used where possible (no unnecessary client components)
- [ ] Clerk auth: `auth()` from `@clerk/nextjs/server`, not deprecated patterns
- [ ] API calls go through `/api/` routes, not direct Supabase from client
- [ ] TypeScript types defined for props and API responses
- [ ] No `any` types without justification

## Responsive & UX
- [ ] Layout works on mobile — test with responsive breakpoints
- [ ] Cards grid degrades: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`
- [ ] Empty states have icon + message + CTA button
- [ ] Interactive elements have `hover:` + `transition` states
- [ ] UI text is in Português (BR) — no English strings visible to users
- [ ] Product name is "KidsPC" — not "Silêncio no PC"

## Branding
- [ ] Logo shows "KidsPC" in `font-display`
- [ ] Clerk theme uses blue primary (#4A7AFF)
- [ ] No references to other product names
