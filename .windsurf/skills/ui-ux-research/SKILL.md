---
name: ui-ux-research
description: Research UI/UX references on Dribbble and other sources before designing new components or pages. Use when building new features, redesigning existing UI, or seeking fresh design ideas.
---

# UI/UX Research Skill

Research visual references and interaction patterns from Dribbble and the web before designing. This ensures KidsPC's UI stays fresh, intentional, and informed by real-world best practices — not generic AI output.

## When to Use

- Building a **new page or component** that doesn't have an existing pattern in the design system
- **Redesigning** an existing component (user says "melhorar", "redesenhar", "ficou feio", etc.)
- User explicitly asks for **new ideas** or **references**
- The task involves a UI pattern the team hasn't implemented before (e.g., kanban board, timeline, pricing table)

## Research Process

### Step 1: Identify the Pattern

Before searching, name the UI pattern you need. Be specific:

| Vague ❌ | Specific ✅ |
|---|---|
| "tag component" | "tag management modal with search and inline create" |
| "member list" | "data table with avatar, role badges, and inline actions" |
| "dashboard" | "admin dashboard with stat cards, charts, and quick actions" |
| "form" | "multi-step form wizard with progress indicator" |

### Step 2: Search Dribbble

Use the `search_web` tool with targeted queries. Always include `dribbble.com` as the domain filter.

**Query formula**: `[specific pattern] UI UX design dribbble [optional qualifier]`

**Good queries:**
```
"tag management modal UI design dribbble searchable checklist"
"admin dashboard stat cards dribbble warm design"
"multi-select dropdown with search dribbble SaaS"
"member profile page dribbble LMS education"
"data table with filters and pagination dribbble clean"
```

**Qualifiers to add based on KidsPC's aesthetic:**
- `warm` / `friendly` / `clean` / `flat` — matches our cream+blue warm tone
- `SaaS` / `parental control` / `dashboard` — matches our product type
- `family` / `kids` / `child safety` — domain-specific results
- `minimal` / `modern` / `illustration` — avoids cluttered results

### Step 3: Browse Results

Use `read_url_content` on the most promising Dribbble search result pages. Look for:

1. **Layout patterns** — How elements are arranged spatially
2. **Interaction patterns** — How selection, filtering, creation flows work
3. **Visual hierarchy** — What gets emphasis vs. what recedes
4. **Micro-interactions** — Hover states, transitions, loading states
5. **Empty states** — How absence of data is handled

### Step 4: Extract Principles (not pixels)

Do NOT copy designs literally. Extract the **underlying UX principles** and adapt them to KidsPC's design system:

| From Dribbble | Adapt to KidsPC |
|---|---|
| Blue accent color | Use `bg-accent` (#4A7AFF soft blue) |
| Inter font | Use Plus Jakarta Sans (body) + DM Serif Display (headings) |
| Rounded-lg cards | Use `card-flat` (rounded-xl, warm border) |
| Gray backgrounds | Use warm `bg-background` (#FAF7F2 cream) |
| Various icons | Use Lucide React + @heroicons/react |
| Shadow-sm | Use `card-flat` built-in shadow |

### Step 5: Summarize Findings

Before implementing, write a brief summary:

```
## Design Research Summary
**Pattern**: [what you searched for]
**Inspired by**: [Notion's tag picker, Linear's label selector, etc.]
**Key takeaways**:
- [principle 1]
- [principle 2]
- [principle 3]
**Adapted for KidsPC**: [how you'll translate this to our design system]
```

## Search Strategies by Component Type

### Modals & Dialogs
```
"[purpose] modal UI dribbble clean"
"[purpose] dialog popup dribbble SaaS"
```
Look for: header structure, body scrolling, footer actions, close patterns

### Data Tables
```
"data table [feature] dribbble admin"
"table with [filters/sorting/pagination] dribbble dashboard"
```
Look for: column density, row hover states, action placement, empty states

### Forms
```
"[type] form UI dribbble modern"
"form wizard steps dribbble SaaS"
```
Look for: label placement, validation UX, field grouping, submit flow

### Dashboards
```
"admin dashboard [metric type] dribbble education"
"analytics dashboard stat cards dribbble warm"
```
Look for: card grid layouts, chart placement, KPI hierarchy, quick actions

### Navigation
```
"sidebar navigation dribbble admin panel"
"breadcrumb navigation dribbble SaaS"
```
Look for: icon alignment, active states, collapsible sections, badge placement

## Quality Checklist

After researching, verify your design decision against:

- [ ] Does it solve the user's actual problem (not just look pretty)?
- [ ] Is it achievable with our stack (React 19, Next.js 16, Tailwind CSS v4, HeadlessUI React, Lucide)?
- [ ] Does it fit KidsPC's warm friendly flat illustration aesthetic?
- [ ] Is it simpler than what we had before (or justified complexity)?
- [ ] Will it work on mobile/tablet viewports?
- [ ] Does it follow established KidsPC patterns where applicable?

## Anti-Patterns

- **Copying a Dribbble shot pixel-for-pixel** — Extract principles, adapt to our system
- **Searching for generic terms** ("UI design") — Always be specific about the pattern
- **Ignoring KidsPC constraints** — A gorgeous dark-mode glassmorphism card is useless here
- **Over-researching** — 2-3 searches max. If nothing great comes up, rely on design system + common sense
- **Skipping research for novel patterns** — If we haven't built it before, always look first
