---
description: Guidelines de design frontend "Flat Illustration" para criar interfaces limpas e acolhedoras. Usar sempre que construir ou modificar componentes web.
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

## Contexto do Projeto KidsPC — Design System "Flat Illustration"

- **Stack**: Next.js 16 App Router, Tailwind CSS 4, @heroicons/react, @headlessui/react, recharts, lucide-react
- **Fonts**: DM Serif Display (`--font-display`, headings — serif) + Plus Jakarta Sans (`--font-body`, body text) via Google Fonts
- **Design philosophy**: Warm, clean, flat. Cream backgrounds, soft blue accent, no gradients. Inspired by Dribbble corporate flat illustration style.
- **Color palette**:
  - Background: `#FAF7F2` (cream), `#F0EBE5` (cream-dark)
  - Primary accent: `#4A7AFF` (soft blue), hover `#3A6AEF`
  - Coral: `#FF6B6B`, Orange: `#FFA94D`, Mint: `#51CF66`, Purple: `#9775FA`
  - Text: `#1a1a2e` (navy headings), `gray-500` body, `gray-400` muted
  - Borders: `#e8e0d8` (warm), `#F0EBE5` (subtle)
  - Cards: `.card-flat` — white `rounded-xl` with warm border, subtle shadow, hover lift
  - Soft tinted backgrounds: `#EDF2FF` (blue-soft), `#FFE0E0` (coral), `#D6F5E0` (mint), `#FFF3D6` (yellow), `#F3E8FF` (purple)
- **CTA buttons**: `.btn-pill .btn-pill-primary` — fully rounded, solid `#4A7AFF`, blue shadow
- **Secondary buttons**: `.btn-pill .btn-pill-outline` — transparent with warm border, hover blue
- **Visual patterns**: Decorative `.blob-blue`, `.blob-coral`, `.blob-yellow`, `.blob-mint` organic shapes, `animate-float` for movement, `animate-fade-in-up` with staggered delays
- **Illustrations**: Flat SVG illustrations (hero-scene replaced with `illustrations.tsx` — HeroIllustration, ParentPhoneIllustration, FamilyIllustration)
- **NavBar**: Cream bg (`bg-background/80 backdrop-blur-xl`), solid blue logo, pill CTA
- **Modals**: `card-flat` with icon headers
- **Clerk theme**: light theme with `#4A7AFF` blue primary
- **Idioma**: Português (BR) — all user-facing text
- **Público**: Pais brasileiros com filhos em idade escolar
- **Tom**: Warm, empathetic, approachable — acolhedor e confiável
- Ao modificar UI existente, manter coerência com Flat system (cream bg, navy text, flat blue accent, no gradients)
- Ao criar novos componentes, usar `font-display` (serif) para headings, `.card-flat` para cards, `.btn-pill` para CTAs
- Feature icons: each in its own soft tinted bg (blue, coral, mint, yellow, purple) with matching text color
- Reference: `.windsurf/skills/nextjs-web.md` for full route map and component conventions
