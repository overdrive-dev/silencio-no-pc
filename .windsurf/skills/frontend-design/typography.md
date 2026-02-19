# Typography

## Fonts

- **Body**: Plus Jakarta Sans (`--font-body` / `--font-sans`). Default sans-serif for all UI text.
- **Display/Headings**: DM Serif Display (`--font-display`). Used for page titles, hero headings, and branding.
- **NUNCA** use Inter, Roboto, Arial, Nunito, or other fonts.
- Apply display font with `font-display` class or `className="font-display"`.

## Scale

- **Hero headings**: `text-3xl sm:text-4xl lg:text-5xl font-display` (landing page only)
- **Page headings**: `text-2xl font-bold text-foreground` (dashboard pages)
- **Section headings**: `text-xl font-semibold text-foreground`
- **Card headings**: `text-lg font-semibold text-foreground`
- **Body**: `text-sm` ou `text-base`. NUNCA `text-lg` para body copy em dashboard.
- **Labels**: `text-sm font-medium text-muted`
- **Muted text**: `text-sm text-muted-foreground` ou `text-gray-500`
- **Links**: `text-sm font-medium text-accent hover:text-accent-hover transition`

## Logo

```tsx
<span className="text-lg font-display tracking-tight text-foreground">KidsPC</span>
```
