---
name: code-review
description: KidsPC-specific code review checklist covering frontend design system compliance, backend architecture patterns, security, and performance. Use when reviewing code changes.
---

# Code Review Skill — KidsPC

Perform thorough code reviews with KidsPC-specific patterns in mind. This skill supplements general review practices with project-specific checks.

## Review Process

1. **Understand scope** — What files changed? Which domains (Python desktop, Next.js web, Android, Supabase)?
2. **Run domain checks** — Apply the relevant checklist from supporting files
3. **Assess severity** — 🔴 Critical, 🟡 Warning, 🔵 Suggestion
4. **Report** — Summarize findings with file:line references and suggested fixes
5. **Verify** — After fixes, confirm the build passes

## Output Format

```
## Code Review — [Feature/Change Name]

### 🔴 Critical
- **[file:line]**: [Description] → [Suggested fix]

### 🟡 Warning
- **[file:line]**: [Description] → [Suggested fix]

### 🔵 Suggestions
- **[file:line]**: [Description] → [Suggested fix]

### ✅ Looks Good
- [Positive observations about the code]
```

## Supporting Resources

- `frontend-checklist.md` — Design system compliance, React/Next.js patterns, responsive/UX
- `backend-checklist.md` — Python desktop, Next.js API, Supabase, sync protocol
- `security-checklist.md` — Auth, RLS, secrets, input validation
