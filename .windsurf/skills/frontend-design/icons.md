# Icons (Lucide React + Heroicons)

Lucide React é a biblioteca primária. @heroicons/react é usada para ícones de navegação e UI complementar.

## Onde usar ícones

- Botões primários (prefixo ou sufixo)
- Itens de navegação no NavBar
- Indicadores de status (online/offline, strikes)
- Feature cards na landing page
- Empty states e ações em cards
- Device/platform indicators (Monitor, Smartphone)

## Sintaxe

```tsx
// Lucide React (primária)
import { Monitor, Smartphone, Shield, Clock, Volume2 } from "lucide-react";
<Monitor className="size-5 text-accent" />

// Heroicons (nav/UI)
import { Bars3Icon, XMarkIcon, Cog6ToothIcon } from "@heroicons/react/24/outline";
<Cog6ToothIcon className="size-5" />
```

## Regras

- Prefira Lucide React para ícones de conteúdo (features, devices, status)
- Prefira Heroicons outline para ícones de navegação (menu, close, settings)
- Tamanho padrão: `size-5` (20px) para UI, `size-4` (16px) para inline
- Feature icons em landing: `size-6` (24px) com cor de destaque
- Gap consistente: `gap-2` para botões, `gap-1.5` para badges
- **NÃO** use FontAwesome para novos componentes
- **NÃO** use Heroicons solid — prefer outline variant
