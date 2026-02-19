# Component Patterns

## Cards

The primary container is `.card-flat` — defined in `globals.css`:

```tsx
<div className="card-flat p-6">
  {/* content */}
</div>
```

Properties: white bg, `rounded-xl` (1.25rem), warm border `#e8e0d8`, subtle shadow, hover lift + stronger shadow.

### Dashboard device cards

```tsx
<div className="card-flat p-5">
  <div className="flex items-center gap-3">
    <Monitor className="size-5 text-accent" />  {/* or Smartphone for Android */}
    <div>
      <h3 className="font-semibold text-foreground">{device.name}</h3>
      <p className="text-sm text-muted">{device.platform}</p>
    </div>
    <span className="ml-auto size-2.5 rounded-full bg-mint" />  {/* online dot */}
  </div>
</div>
```

## Buttons

### Primary CTA

```tsx
<button className="btn-pill btn-pill-primary">
  Assinar — R$ 19,90/mês
</button>
```

### Outline

```tsx
<button className="btn-pill btn-pill-outline">
  Cancelar
</button>
```

### Danger

```tsx
<button className="btn-pill bg-coral text-white hover:bg-red-400 shadow-md shadow-coral/20">
  Excluir dispositivo
</button>
```

### Small / inline

```tsx
<button className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-accent bg-blue-soft hover:bg-accent hover:text-white transition">
  <Plus className="size-3.5" />
  Adicionar
</button>
```

## Radius Scale

- Cards, modals: `rounded-xl` (1.25rem)
- Buttons: `rounded-full` (pill — SEMPRE)
- Inputs: `rounded-lg`
- Badges, pills: `rounded-full`
- Nav items: `rounded-lg`
- Blobs: organic `border-radius` via CSS classes

## NavBar

Sticky top nav with blur:
- **Landing**: `bg-background/80 backdrop-blur-xl border-b border-border/60`
- **Dashboard**: `bg-white/90 backdrop-blur-xl border-b border-border`
- Logo: blue square icon + "KidsPC" in `font-display`
- Auth: Clerk `<SignInButton>`, `<SignUpButton>`, `<UserButton>` (modal mode)
- Active link: `text-accent bg-blue-soft` pill
- Inactive: `text-gray-500 hover:text-foreground hover:bg-cream-dark`

## Landing Page Hero

Split layout with flat SVG illustration:

```tsx
<section className="bg-background min-h-[90vh] flex items-center">
  <div className="max-w-7xl mx-auto px-4 grid lg:grid-cols-2 gap-12 items-center">
    {/* Left: text */}
    <div>
      <h1 className="text-4xl sm:text-5xl font-display text-foreground">...</h1>
      <p className="mt-4 text-lg text-muted">...</p>
      <div className="mt-8 flex gap-4">
        <button className="btn-pill btn-pill-primary">Começar agora</button>
        <button className="btn-pill btn-pill-outline">Saiba mais</button>
      </div>
    </div>
    {/* Right: illustration */}
    <HeroIllustration />
  </div>
</section>
```

Decorative blobs positioned absolutely for visual warmth.

## Feature Cards (Landing)

```tsx
<div className="card-flat p-6 relative overflow-hidden">
  <div className="blob-blue absolute -top-6 -right-6 w-20 h-20 opacity-20" />
  <div className="relative">
    <div className="size-12 rounded-xl bg-blue-soft flex items-center justify-center">
      <Shield className="size-6 text-accent" />
    </div>
    <h3 className="mt-4 text-lg font-semibold text-foreground">Feature</h3>
    <p className="mt-2 text-sm text-muted">Description.</p>
  </div>
</div>
```

## Status Badges

```tsx
{/* Online */}
<span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 border border-green-200 px-2.5 py-0.5 text-xs font-medium text-green-600">
  <span className="size-1.5 rounded-full bg-green-500" />
  Online
</span>

{/* Danger */}
<span className="inline-flex items-center rounded-full bg-red-50 border border-red-200 px-2.5 py-0.5 text-xs font-medium text-coral">
  Pagamento pendente
</span>

{/* Warning */}
<span className="inline-flex items-center rounded-full bg-amber-50 border border-amber-200 px-2.5 py-0.5 text-xs font-medium text-amber-600">
  3d restantes
</span>
```

## Progress Bars

```tsx
<div className="h-2 rounded-full bg-gray-100 overflow-hidden">
  <div
    className="h-full rounded-full bg-accent transition-all"
    style={{ width: `${percent}%` }}
  />
</div>
```

Color by value: `bg-accent` (normal), `bg-orange` (warning ≤30%), `bg-coral` (danger ≤10%).

## Empty States

```tsx
<div className="text-center py-12">
  <Monitor className="mx-auto size-12 text-muted-foreground/40" />
  <h3 className="mt-4 text-lg font-semibold text-foreground">Nenhum dispositivo</h3>
  <p className="mt-1 text-sm text-muted">Vincule um computador ou celular para começar.</p>
  <button className="btn-pill btn-pill-primary mt-6">
    <Plus className="size-4" />
    Adicionar dispositivo
  </button>
</div>
```

## Modals / Dialogs

Use HeadlessUI `<Dialog>` with Framer Motion:

```tsx
<Dialog open={open} onClose={onClose} className="relative z-50">
  <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
  <div className="fixed inset-0 flex items-center justify-center p-4">
    <DialogPanel className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
      <DialogTitle className="text-lg font-semibold text-foreground">...</DialogTitle>
      {/* content */}
    </DialogPanel>
  </div>
</Dialog>
```

## Animations

- **Entrance**: `animate-fade-in-up` + `delay-{0-5}` classes (staggered)
- **Float**: `animate-float` (6s) / `animate-float-slow` (8s) for decorative elements
- **Framer Motion**: Used for page transitions and modal animations
- **Transitions**: `transition-all` or `transition-colors` on interactive elements

## QR Code (Pairing)

```tsx
import { QRCodeSVG } from "qrcode.react";
<QRCodeSVG value={pairingCode} size={200} bgColor="#FAF7F2" fgColor="#1a1a2e" />
```

## Charts (Recharts)

Used for usage analytics in device dashboard. Follow warm palette:
- Bar fill: `#4A7AFF` (accent)
- Grid: `#e8e0d8` (border)
- Labels: `#6B7280` (muted)
