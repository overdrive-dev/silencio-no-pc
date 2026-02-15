---
description: Guidelines de design frontend "Playground" para criar interfaces coloridas e divertidas. Usar sempre que construir ou modificar componentes web.
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

## Contexto do Projeto KidsPC — Design System "Playground"

- **Stack**: Next.js 16 App Router, Tailwind CSS 4, @heroicons/react, @headlessui/react, recharts, lucide-react, three.js (@react-three/fiber, @react-three/drei), framer-motion
- **Fonts**: Outfit (`--font-display`, headings) + Plus Jakarta Sans (`--font-body`, body text) via Google Fonts
- **Design philosophy**: Bright, colorful, fun. Light backgrounds everywhere. Inspired by Notion, Linear (light mode), Stripe.
- **Color palette** (unified light):
  - Background: `#fafafa` (bg-background), `#f8fafc` (bg-slate-50 dashboard)
  - Primary: violet-600 (`#8b5cf6`) → pink-500 (`#ec4899`) gradient for CTAs
  - Accents: violet, pink, orange, cyan, emerald, amber — each feature has its own color
  - Text: slate-900 headings, slate-500 body, slate-400 muted
  - Cards: `rounded-2xl border-slate-200 bg-white shadow-sm`
  - Hover: `hover:border-violet-300 hover:shadow-lg hover:-translate-y-1`
- **CTA buttons**: `bg-gradient-to-r from-violet-600 to-pink-500` with `shadow-violet-500/25`
- **Gradient text**: `.text-gradient` = violet→pink→orange, `.text-gradient-cool` = violet→cyan
- **Visual patterns**: `bg-grain` texture, `.gradient-hero` warm radial gradients, `.gradient-mesh` multi-color mesh, `dot-grid` violet dots, `animate-fade-in-up` with staggered delays, `animate-float` for decorative elements
- **Special card**: `.card-gradient-border` — white card with animated rainbow gradient border on hover
- **Three.js hero**: Floating distorted icosahedron with orbital rings and particles in warm purple/pink tones (hero-scene.tsx)
- **NavBar**: Light glassmorphism (`bg-white/70 backdrop-blur-xl`), gradient logo icon, violet active states
- **Modals**: `rounded-2xl border-slate-200 bg-white shadow-2xl` with icon headers
- **Clerk theme**: light theme with violet primary
- **Idioma**: Português (BR) — all user-facing text
- **Público**: Pais brasileiros com filhos em idade escolar
- **Tom**: Fun, colorful, approachable — divertido mas confiável
- Ao modificar UI existente, manter coerência com Playground system (light bg, slate text, colorful accents, gradient CTAs)
- Ao criar novos componentes, usar `font-display` para headings, `rounded-2xl` para cards, gradient buttons para CTAs primárias
- Feature icons: each in its own color (violet, pink, cyan, amber, emerald, rose) with `bg-{color}-100 text-{color}-600`
- Reference: `.windsurf/skills/nextjs-web.md` for full route map and component conventions
