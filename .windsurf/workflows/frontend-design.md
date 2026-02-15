---
description: Guidelines de design frontend "Obsidian" para criar interfaces distintas e polidas. Usar sempre que construir ou modificar componentes web.
---

# Frontend Design Skill

Crie interfaces frontend distintas, production-grade, com alta qualidade visual. Evite a estética genérica de "AI slop". Foque em código funcional com atenção excepcional a detalhes estéticos e escolhas criativas.

## Design Thinking

Antes de codar, entenda o contexto e comprometa-se com uma direção estética clara:

- **Propósito**: Que problema esta interface resolve? Quem usa?
- **Tom**: Escolha uma direção: minimal refinado, editorial/magazine, soft/pastel, luxury/refined, playful, brutalist, art deco, industrial, etc. Use como inspiração mas crie algo fiel à direção escolhida.
- **Constraints**: Requisitos técnicos (framework, performance, acessibilidade).
- **Diferenciação**: O que torna isto MEMORÁVEL? O que alguém vai lembrar?

**CRÍTICO**: Escolha uma direção conceitual clara e execute com precisão. Maximalismo ousado e minimalismo refinado ambos funcionam — a chave é intencionalidade, não intensidade.

## Typography

- Escolha fontes bonitas, únicas e interessantes
- **NUNCA** use fontes genéricas: Arial, Inter, Roboto, system fonts
- **NUNCA** convirja para escolhas comuns entre gerações (ex: Space Grotesk)
- Combine uma fonte display distintiva com uma fonte body refinada
- Use Google Fonts ou fontes variáveis para máxima qualidade

## Color & Theme

- Comprometa-se com uma estética coesa
- Use CSS variables (ou Tailwind config) para consistência
- Cores dominantes com acentos marcantes > paletas tímidas e distribuídas igualmente
- Inspire-se em temas de IDE e estéticas culturais
- **EVITE**: esquemas de cores clichê (especialmente gradientes roxos em fundos brancos)

## Motion & Animations

- Use animações para efeitos e micro-interações
- Priorize soluções CSS-only para HTML
- Use Framer Motion / Motion library para React quando disponível
- Foque em momentos de alto impacto: um page load bem orquestrado com staggered reveals (animation-delay) cria mais encanto que micro-interações dispersas
- Use scroll-triggering e hover states que surpreendem

## Spatial Composition

- Layouts não-genéricos e inesperados
- Assimetria, overlap, fluxo diagonal, elementos que quebram o grid
- Espaço negativo generoso OU densidade controlada
- **EVITE**: layouts previsíveis e patterns de componentes cookie-cutter

## Backgrounds & Visual Details

- Crie atmosfera e profundidade em vez de defaultar para cores sólidas
- Layer CSS gradients, use padrões geométricos, ou adicione efeitos contextuais
- Formas criativas: gradient meshes, noise textures, transparências em camadas, sombras dramáticas, bordas decorativas, grain overlays

## Anti-patterns (NUNCA fazer)

- Famílias de fontes overused (Inter, Roboto, Arial, system fonts)
- Esquemas de cores clichê (gradientes roxos em fundos brancos)
- Layouts previsíveis e patterns de componentes genéricos
- Design cookie-cutter sem caráter específico ao contexto
- Convergir para as mesmas escolhas em cada geração

## Contexto do Projeto KidsPC — Design System "Obsidian"

- **Stack**: Next.js 16 App Router, Tailwind CSS 4, @heroicons/react, @headlessui/react, recharts, lucide-react, three.js (@react-three/fiber, @react-three/drei), framer-motion
- **Fonts**: Outfit (`--font-display`, headings) + Plus Jakarta Sans (`--font-body`, body text) via Google Fonts
- **Design philosophy**: Dark-first landing, light dashboard content area. Inspired by Linear, Raycast, Vercel, Arc Browser.
- **Landing/public pages palette** (dark):
  - Background: `#09090b` (zinc-950) → `#18181b` (zinc-900)
  - Accent: violet-600 (`#8b5cf6`) primary, cyan-400 (`#06b6d4`) secondary
  - Text: white headings, zinc-400 body, zinc-500 muted
  - Cards: `bg-white/[0.03]` + `border-white/[0.06]` glassmorphism
  - Hover: `border-violet-500/20` + subtle gradient reveal
  - Glow: `glow-violet` / `glow-cyan` box-shadow utilities
- **Dashboard palette** (light content):
  - Background: `#fafafa` (dash-bg), white cards
  - Accent: violet-600 buttons/tabs, emerald for status, amber for warnings, red for danger
  - Cards: `rounded-2xl border-zinc-200 bg-white shadow-sm`
  - Hover: `hover:border-violet-200 hover:-translate-y-0.5`
- **Visual patterns**: `bg-grain` texture, `gradient-mesh` radial gradients, `dot-grid` pattern, `text-gradient` violet→cyan, `animate-fade-in-up` with staggered delays
- **Three.js hero**: Floating distorted icosahedron with orbital rings and particles (hero-scene.tsx)
- **NavBar**: Glassmorphism on landing (`bg-background/60 backdrop-blur-xl`), white on dashboard
- **Modals**: `rounded-2xl border-zinc-200 bg-white shadow-2xl` with icon headers
- **Clerk theme**: dark base theme with violet primary
- **Idioma**: Português (BR) — all user-facing text
- **Público**: Pais brasileiros com filhos em idade escolar
- **Tom**: Bold, premium, tech-forward — inspirado em startups gringas
- Ao modificar UI existente, manter coerência com Obsidian system (landing = dark/violet/cyan, dashboard = light/violet/zinc)
- Ao criar novos componentes, usar `font-display` para headings, `rounded-2xl` para cards, violet-600 para CTAs
- Reference: `.windsurf/skills/nextjs-web.md` for full route map and component conventions
