---
description: Guidelines de design frontend para criar interfaces distintas e polidas, evitando estética genérica de IA. Usar sempre que construir ou modificar componentes web.
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

## Contexto do Projeto KidsPC

- **Stack**: Next.js App Router, Tailwind CSS, Heroicons, @headlessui/react
- **Tema atual**: Light mode, paleta indigo-600 + gray-50/white
- **Idioma**: Português (BR)
- **Público**: Pais brasileiros com filhos em idade escolar
- **Tom**: Profissional mas acessível, confiável, moderno
- Ao modificar UI existente, manter coerência com o design system atual
- Ao criar novos componentes, elevar a qualidade sem quebrar a consistência
