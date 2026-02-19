---
name: frontend-design
description: Guidelines de design frontend KidsPC para criar interfaces distintas e polidas, evitando estética genérica de IA. Usar sempre que construir ou modificar componentes web.
---

# Frontend Design Skill — KidsPC

Crie interfaces frontend distintas, production-grade, com alta qualidade visual. Evite a estética genérica de "AI slop". Foque em código funcional com atenção excepcional a detalhes estéticos e consistência com o design system "Flat Illustration" do KidsPC.

## Design Thinking

Antes de codar, entenda o contexto e comprometa-se com a direção estética KidsPC:

- **Propósito**: KidsPC é um controle parental. A interface serve pais que gerenciam dispositivos dos filhos.
- **Tom**: Warm, clean, friendly — inspirado em ilustrações flat com decorative blobs. Espaçamento generoso, pill buttons, superfícies creme suaves com bordas quentes e tipografia confiante com serif display.
- **Constraints**: Next.js 16 + React 19, Tailwind CSS v4 com @theme inline tokens, Lucide React + Heroicons, HeadlessUI React, Framer Motion.
- **Diferenciação**: Cream #FAF7F2 + soft blue #4A7AFF. Blobs decorativos orgânicos. Cards flat com bordas quentes. Sem dark mode. Sem frieza.

**CRÍTICO**: A direção é "warm friendly" — ilustrações flat com formas orgânicas. Azul = CTA/primary. Coral = danger. Mint = success. Orange = warning. Bordas quentes (#e8e0d8), NÃO cinza.

## Quick Reference

- **Fonte body**: Plus Jakarta Sans (definida em `--font-body` / `--font-sans`)
- **Fonte headings/logo**: DM Serif Display (`--font-display`, serif, weight 400)
- **Cards**: `card-flat` (white rounded-xl, warm border #e8e0d8, subtle shadow, hover lift)
- **Buttons**: `btn-pill btn-pill-primary` (fully rounded, blue #4A7AFF, shadow)
- **Outline buttons**: `btn-pill btn-pill-outline` (transparent, warm border)
- **Focus**: `focus:ring-2 focus:ring-accent/20`
- **Icons**: Lucide React (primary) + @heroicons/react (nav/UI) — NO FontAwesome
- **Shadows**: `card-flat` hover shadow, `btn-pill-primary` blue glow shadow
- **Hover**: `hover:bg-accent-hover` (#3A6AEF) for primary, `hover:bg-surface-hover` for neutral
- **Blobs**: `.blob-blue`, `.blob-coral`, `.blob-yellow`, `.blob-mint` organic shapes
- **Idioma UI**: Português (BR)

## Supporting Resources

Detailed documentation is split into focused files in this folder:

- `color-tokens.md` — Complete token table, tinted backgrounds, hover rules
- `typography.md` — Font scales, heading/body/label/link patterns
- `icons.md` — Lucide React + Heroicons usage rules, where to use
- `component-patterns.md` — Cards, buttons, inputs, nav, modals, empty states, landing patterns
- `component-registry.md` — Catalog of shared React components (path, props, usage). Check here BEFORE creating a new component.
- `spacing.md` — Spacing scale for inputs, cards, sections, nav
- `anti-patterns.md` — What to NEVER do in the KidsPC frontend
