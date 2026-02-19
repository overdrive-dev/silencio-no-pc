# Color & Theme Tokens

Todas as cores são `@theme inline` tokens em `web/src/app/globals.css`. SEMPRE use classes de token, nunca hex hardcoded em novo código.

## Design Philosophy — "Flat Illustration"

- **Warm cream** (#FAF7F2) = fundo principal, superfícies
- **White** (#ffffff) = cards, surfaces elevadas
- **Soft blue** (#4A7AFF) = CTA primário, links, estados ativos
- **Coral** (#FF6B6B) = danger, erros, alertas
- **Orange** (#FFA94D) = warning, "em andamento"
- **Mint** (#51CF66) = success, online, ativo
- **Purple** (#9775FA) = decorativo, badges especiais
- **Navy** (#1a1a2e) = texto primário, headings

## Fontes

- **Body**: Plus Jakarta Sans (`--font-body` / `--font-sans`)
- **Headings/Logo**: DM Serif Display (`--font-display`, serif, weight 400)
- Use `.font-display` para headings com serif
- Fontes carregadas via `next/font/google` em `layout.tsx`

## Tokens Semânticos (globals.css @theme inline)

| Token | Hex | Uso |
|---|---|---|
| `bg-background` | #FAF7F2 | Background principal, cream |
| `text-foreground` | #1a1a2e | Texto principal, navy headings |
| `bg-surface` | #ffffff | Cards, painéis elevados |
| `bg-surface-hover` | #f5f0eb | Hover em superfícies |
| `border-border` | #e8e0d8 | Bordas quentes de cards/containers |
| `border-border-subtle` | #f0ebe5 | Bordas sutis, dividers |
| `bg-accent` / `text-accent` | #4A7AFF | CTA primário, links, destaques |
| `bg-accent-hover` | #3A6AEF | Hover de CTA |
| `bg-coral` | #FF6B6B | Danger, erros |
| `bg-orange` | #FFA94D | Warning |
| `bg-mint` | #51CF66 | Success, online |
| `bg-purple` | #9775FA | Decorativo |
| `text-muted` | #6B7280 | Texto secundário (gray-500) |
| `text-muted-foreground` | #9CA3AF | Texto auxiliar (gray-400) |

## Dashboard-specific Tokens

| Token | Hex | Uso |
|---|---|---|
| `bg-dash-bg` | #FAF7F2 | Dashboard background |
| `bg-dash-surface` | #ffffff | Dashboard cards |
| `border-dash-border` | #e8e0d8 | Dashboard card borders |
| `text-dash-text` | #1a1a2e | Dashboard text |
| `text-dash-muted` | #6B7280 | Dashboard muted text |

## Soft Tinted Backgrounds

| Classe | Hex | Uso |
|---|---|---|
| `.bg-blue-soft` | #EDF2FF | Active nav item, info bg |
| `.bg-cream` | #FAF7F2 | Section bg |
| `.bg-cream-dark` | #F0EBE5 | Hover bg, alternate sections |

## Utility Classes (globals.css)

| Classe | O que faz |
|---|---|
| `.card-flat` | White rounded-xl, warm border, subtle shadow, hover lift |
| `.btn-pill` | Inline-flex pill base (rounded-full, gap, padding, font-semibold) |
| `.btn-pill-primary` | Blue bg, white text, blue glow shadow, hover lift |
| `.btn-pill-outline` | Transparent bg, warm border, hover blue |
| `.font-display` | DM Serif Display font family |
| `.animate-fade-in-up` | Entrance animation with translateY |
| `.animate-float` | Infinite float animation (6s) |
| `.blob-blue` / `.blob-coral` / `.blob-yellow` / `.blob-mint` | Organic decorative shapes |

## Decorative Blob Shapes

Used on landing page and feature sections for visual warmth:
```html
<div className="blob-blue absolute -top-8 -left-8 w-24 h-24 opacity-30" />
<div className="blob-coral absolute -bottom-4 -right-6 w-20 h-20 opacity-25" />
```
