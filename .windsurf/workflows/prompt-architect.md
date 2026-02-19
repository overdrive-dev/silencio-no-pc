---
description: Transform vague prompts into structured, expert-level prompts using 7 research-backed frameworks (CO-STAR, RISEN, RISE, TIDD-EC, RTF, CoT, CoD)
auto_execution_mode: 3
---

# Prompt Architect

When the user asks to improve, architect, or refine a prompt, follow this workflow.

## Step 1: Analyze the prompt

Score the user's prompt across 5 dimensions (1-10 each):

- **Clarity**: Is the goal clear and unambiguous?
- **Specificity**: Are requirements detailed enough?
- **Context**: Is background information provided?
- **Completeness**: Are all necessary elements present?
- **Structure**: Is the prompt well-organized?

Calculate an **Overall** score as weighted average. Present the scores in a table.

## Step 2: Recommend a framework

Use the following decision tree to recommend the best framework:

```
Is it content/writing focused?
├─ YES → CO-STAR (if audience/tone matter)
└─ NO
    ↓
Is it a multi-step process?
├─ YES → RISEN (if methodology/constraints important)
└─ NO
    ↓
Is it data transformation?
├─ YES → RISE-IE (input → output)
└─ NO
    ↓
Does it need examples?
├─ YES → RISE-IX (content with samples)
└─ NO
    ↓
Does it need explicit dos/don'ts?
├─ YES → TIDD-EC (high-precision tasks)
└─ NO
    ↓
Is it reasoning/problem-solving?
├─ YES → Chain of Thought
└─ NO → RTF (simple tasks) or Chain of Density (refinement)
```

Present your recommendation with a brief justification. If the user specified a framework, use that instead.

## Step 3: Ask clarifying questions

Ask **3-5 targeted questions** to fill gaps identified in the analysis. Never overwhelm — adapt questions to the selected framework. Wait for the user's answers before proceeding.

## Step 4: Apply the framework

Transform the prompt using the selected framework. The 7 available frameworks are:

### CO-STAR (Context, Objective, Style, Tone, Audience, Response)
Best for: Content creation, writing tasks, communications.
- **Context** — Background information and situation
- **Objective** — Clear goal and purpose
- **Style** — Writing style and formatting approach
- **Tone** — Voice and emotional quality
- **Audience** — Target reader characteristics
- **Response** — Expected format and structure

### RISEN (Role, Instructions, Steps, End goal, Narrowing)
Best for: Multi-step processes, systematic procedures.
- **Role** — Expertise and perspective needed
- **Instructions** — High-level guidance
- **Steps** — Detailed methodology
- **End goal** — Success criteria
- **Narrowing** — Constraints and boundaries

### RISE-IE (Role, Input, Steps, Expectation)
Best for: Data analysis, transformations, processing tasks.
- **Role** — Expertise needed
- **Input** — Data format and characteristics
- **Steps** — Processing methodology
- **Expectation** — Output requirements

### RISE-IX (Role, Instructions, Steps, Examples)
Best for: Content creation with reference examples.
- **Role** — Expertise needed
- **Instructions** — Task guidance
- **Steps** — Workflow process
- **Examples** — Reference samples

### TIDD-EC (Task, Instructions, Do, Don't, Examples, Context)
Best for: High-precision tasks requiring explicit boundaries.
- **Task type** — Nature of the work
- **Instructions** — What to accomplish
- **Do** — Explicit positive guidance
- **Don't** — Explicit negative guidance (what to avoid)
- **Examples** — Reference samples
- **Context** — Background information

### RTF (Role, Task, Format)
Best for: Simple, well-defined tasks.
- **Role** — Expertise required
- **Task** — What needs to be done
- **Format** — Output structure

### Chain of Thought (CoT)
Best for: Complex reasoning and problem-solving.
- Breaks down reasoning into explicit steps
- Shows work and intermediate conclusions
- Verifies logic at each stage
- Builds to final answer

### Chain of Density (CoD)
Best for: Iterative refinement and compression.
- Starts with baseline version
- Progressively refines through iterations
- Increases information density
- Optimizes for specific goals

## Step 5: Present the result

Show the transformed prompt inside a fenced code block. Re-score it using the same 5 dimensions. Show a before/after comparison of scores.

## Step 6: Iterate

Ask the user if they'd like to:
- **Refine** — Further improve the current prompt
- **Switch framework** — Try a different framework
- **Accept** — Use the final prompt as-is

Continue iterating until the user is satisfied.
