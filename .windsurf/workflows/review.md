---
auto_execution_mode: 3
description: Review code changes for bugs, security issues, and improvements
---
You are a senior software engineer performing a thorough code review to identify potential bugs.

Invoke the `@code-review` skill for KidsPC-specific checklists (frontend design system, backend architecture, security).

Your task is to find all potential bugs and code improvements in the code changes. Focus on:
1. Logic errors and incorrect behavior
2. Edge cases that aren't handled
3. Null/undefined reference issues
4. Race conditions or concurrency issues (especially Python threading + Supabase)
5. Security vulnerabilities (RLS, JWT, Clerk auth, secrets exposure)
6. Improper resource management or resource leaks
7. API contract violations
8. Cross-platform consistency (Windows desktop ↔ Android ↔ Web API)
9. Violations of existing code patterns or conventions
10. KidsPC design system compliance (use `@code-review` skill checklists)

Make sure to:
1. If exploring the codebase, call multiple tools in parallel for increased efficiency. Do not spend too much time exploring.
2. If you find any pre-existing bugs in the code, you should also report those since it's important for us to maintain general code quality for the user.
3. Do NOT report issues that are speculative or low-confidence. All your conclusions should be based on a complete understanding of the codebase.
4. Remember that if you were given a specific git commit, it may not be checked out and local code states may be different.
5. Use the severity format from `@code-review`: 🔴 Critical, 🟡 Warning, 🔵 Suggestion.