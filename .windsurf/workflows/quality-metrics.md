# Quality Metrics Log

Per-task tracking to measure if the team is improving over time. Appended at Step 11 (Deliver) of the `/software-house` workflow.

## How to Use

After each task, add a row to the table below with:
- **Date** — When the task was completed
- **Task** — Short description (e.g., "Add device upgrade flow")
- **Size** — XS / S / M / L (from Step 1b)
- **Rework?** — Did the plan change or implementation require re-doing? (yes/no)
- **FE Issues** — Frontend design system issues found during review (0 = clean)
- **BE Issues** — Backend architecture issues found during review (0 = clean)
- **Verified** — Number of QA scenarios verified
- **Retro category** — Root cause category if issue found, or "none"

## Metrics Table

| Date | Task | Size | Rework? | FE Issues | BE Issues | Verified | Retro |
|---|---|---|---|---|---|---|---|

<!-- New entries are added at the top. -->

## Trends to Watch

- **Rework rate**: If > 30% of tasks require rework → invest in `@prompt-clarity` framing checks
- **Issue counts**: If review issues stay constant → rules are being ignored, update skill docs
- **Retro categories**: If "framing" dominates → prompt clarity skill needs strengthening. If "context gap" dominates → architecture docs are stale.
- **Verification count**: If consistently 0 → QA steps are being skipped, re-evaluate Step 5/9 thresholds
