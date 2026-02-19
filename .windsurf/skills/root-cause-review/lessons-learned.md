# Lessons Learned — Root Cause Log

This file is a running log of retrospectives performed by the Senior Product Owner after bug fixes, rework, or tasks that revealed process gaps. Each entry follows the format defined in `SKILL.md`.

<!-- New entries are added at the top. Oldest entries at the bottom. -->

## 2025-06-01 | Framing | Webhook 500 on plan-level notifications

**Symptom**: MercadoPago webhook returning 500 errors repeatedly, causing MP to retry and flood the server.

**Root Cause (5-why)**:
1. Webhook called `PreApproval.get({ id })` on every notification → 2. `subscription_preapproval_plan` notifications carry a plan ID, not preapproval ID → 3. `PreApproval.get()` with a plan ID returns 404 → 4. 404 not caught → 500 → MP retries → 5. No notification type filtering before processing

**Fix Applied**: Added type check: only process `subscription_preapproval`, ACK `subscription_preapproval_plan` with 200.

**Systemic Fix**: Added anti-pattern to `backend-architecture/anti-patterns.md`. Added framing check for webhook notification types.

---

## 2025-05-15 | Code-specific | Supabase calls from QThread crashing desktop

**Symptom**: Desktop app intermittently crashes with "RuntimeError: no running event loop" when audio monitor thread tries to sync strike data.

**Root Cause (5-why)**:
1. Strike was detected in audio monitor QThread → 2. QThread handler tried to call Supabase directly → 3. Python supabase client uses httpx which requires event loop → 4. QThread doesn't have a running event loop → 5. No guideline prohibiting Supabase calls from threads

**Fix Applied**: Changed to emit signal from QThread, handle Supabase call in main thread via connected slot.

**Systemic Fix**: Added anti-pattern to `backend-architecture/anti-patterns.md`: "Supabase calls from QThread". Added to threading model documentation in `python-desktop.md`.

---

## 2025-05-01 | Context Gap | Self-subscription test failing silently

**Symptom**: Developer couldn't complete subscription flow — "Confirmar" button on MercadoPago checkout was grayed out with no error message.

**Root Cause (5-why)**:
1. Developer used their own MP account to test → 2. MP blocks sellers from subscribing to their own plans → 3. This restriction isn't shown clearly on the checkout page → 4. No testing documentation mentioned this → 5. MP's documentation buries this limitation

**Fix Applied**: Created dedicated MP test buyer account.

**Systemic Fix**: Added common misframe to `prompt-clarity/common-misframes.md`. Added note to MercadoPago integration docs.

---

## 2025-04-20 | Framing | Desktop feature built without Android consideration

**Symptom**: App blocking worked on Windows but Android devices had no blocking capability despite sharing the same `blocked_apps` table.

**Root Cause (5-why)**:
1. Feature was framed as "add app blocking" → 2. Implementation focused on psutil (Windows-only) → 3. Android uses AccessibilityService for blocking → 4. No framing check asked "does this affect both platforms?" → 5. Cross-platform sync wasn't considered

**Fix Applied**: Built Android AccessibilityService-based app blocker.

**Systemic Fix**: Added framing check: "Is this Windows-specific? Check if Android equivalent is needed." Added common misframe entry.
