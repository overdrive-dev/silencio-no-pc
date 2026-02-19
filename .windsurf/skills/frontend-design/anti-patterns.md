# Anti-patterns (NUNCA fazer)

## Design System

- Fontes que não sejam Plus Jakarta Sans (body) ou DM Serif Display (headings)
- Backgrounds cinza puro (`bg-gray-*`) — sempre use warm cream `bg-background` (#FAF7F2)
- Dark mode ou variantes `.dark` — projeto é light-only
- Gradientes em botões ou cards — design é flat, sem gradients
- Hex hardcoded em novo código — use tokens do `globals.css` (`bg-accent`, `text-foreground`, etc.)
- FontAwesome icons — usar Lucide React ou @heroicons/react
- `rounded-xl` em botões — usar `rounded-full` (pill shape é obrigatório)
- `rounded-md` ou `rounded-sm` em cards — usar `rounded-xl` via `card-flat`
- `shadow-sm` em cards — usar `card-flat` que já tem shadow correto
- Estética genérica "AI slop" — layouts tímidos, cookie-cutter, sem personalidade

## React / Next.js

- `"use client"` desnecessário — só adicionar em componentes que usam hooks ou browser APIs
- `useEffect` para fetch de dados — preferir Server Components ou route handlers
- `useState` + `fetch` para dados do servidor — usar Server Components quando possível
- `authMiddleware()` (deprecated) — usar `clerkMiddleware()` em `proxy.ts`
- `withAuth` ou pages router patterns — usar App Router + `auth()` from `@clerk/nextjs/server`
- `getServerSideProps` ou `getStaticProps` — usar Server Components (App Router)
- Importar `@supabase/supabase-js` em client components — Supabase access é server-only via API routes

## Styling

- Bordas cinza frias (`border-gray-*`) em cards — usar `border-border` (#e8e0d8) warm
- `bg-white` sem bordas em cards — sempre usar `card-flat` ou border explícito
- Espaçamento apertado em botões — btn-pill tem padding generoso (`py-3 px-8`)
- Inputs sem rounded — usar `rounded-lg` mínimo
- Elementos interativos SEM hover states — todo botão, link, tab DEVE ter `hover:` + `transition`
- `text-black` para texto — usar `text-foreground` (#1a1a2e navy)
- `text-gray-400` para muted — usar `text-muted` (#6B7280) ou `text-muted-foreground`

## Content

- UI text em inglês — SEMPRE Português (BR)
- Branding "Silêncio no PC" na UI — usar "KidsPC" como nome do produto
- Conteúdo sem padding — mínimo `px-4` em containers
- Página sem heading h1 — toda página dashboard deve ter heading visível
