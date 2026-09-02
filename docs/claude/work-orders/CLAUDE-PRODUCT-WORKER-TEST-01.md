# CLAUDE PRODUCT WORKER TEST 01

mode: REVIEW_ONLY
product: ATLAS
integration_target: king/test
authority: no code mutation; no branch mutation beyond reading; no merge; no LIVE; no Canon; no outreach

## Objective

Independently inspect the **current actual ATLAS search → useful discovery journey** and identify the single highest-value human/product failure that should be solved next.

This is a test of product judgement and context quality, not a request to validate AXE's opinion.

## Why this test

ATLAS has high real-world and distribution potential, but active ATLAS polish already exists. We need to know whether a Claude Product Worker can:
- understand current 4PLANET direction;
- inspect actual product/code rather than rely on a prompt summary;
- detect overlapping active work;
- make an independent world-class product judgement;
- avoid unnecessary redesign;
- return a bounded next implementation hypothesis without touching code.

## Required context bootstrap

Read:
1. `CLAUDE.md` / `AGENTS.md`;
2. `docs/claude/CONTEXT_PROTOCOL.md`;
3. `docs/claude/CURRENT_4PLANET_CONTEXT.md`;
4. current Code Lineage and Gold product-control files required by `AGENTS.md`;
5. current ATLAS implementation, relevant tests and recent git history;
6. available evidence of active ATLAS work / current candidate line.

If current active-work evidence cannot be established, state that limitation. Do not guess.

## Product question

If a globally oriented non-expert enters ATLAS with an ordinary intent such as:
- orca;
- Bay of Biscay;
- Amazonia;
- Oslofjord;
- wildfires;
- forest loss;
- coral heat stress;
- species observations;

what currently prevents ATLAS from becoming an immediately useful, understandable and repeatable planetary discovery tool?

Do **not** assume that the answer is "improve search" simply because the work order is about the search journey.

## Independent judgement requirement

Before selecting the main failure:
- identify the strongest case **for** the current experience;
- identify at least two plausible competing explanations for weak user value;
- inspect whether the active ATLAS sidecar already addresses any of them;
- choose the highest-value unresolved failure based on evidence.

You may conclude that a non-search issue is the dominant problem.

## MUST NOT DO

- Do not edit product code.
- Do not create a replacement ATLAS architecture.
- Do not recommend duplicating a change already owned by the active ATLAS line.
- Do not reduce source/truth/accessibility integrity to simplify the interface.
- Do not treat more layers/features as progress by default.

## Return

Return one compact Markdown report with:

### VERDICT
One sentence: highest-value unresolved human/product failure.

### OBSERVED
Direct product/code evidence only.

### ACTIVE OVERLAP
What current ATLAS work already owns or may already solve.

### ALTERNATIVES CONSIDERED
At least two credible competing hypotheses and why they rank lower/higher.

### PRODUCT HYPOTHESIS
What outcome should be tested next, without prescribing code unless necessary.

### BOUNDED NEXT WORK PACKAGE
If a safe non-overlapping implementation seam exists, define:
- goal;
- user success;
- allowed scope;
- MUST-NOT-LOSE;
- evidence required.

If no safe seam exists, say `NO WRITE PACKAGE — ACTIVE OVERLAP` and recommend the next review/evaluation gate instead.

### UNKNOWN / LIMITATIONS
Anything material not proven.

### CONTEXT QUALITY
State which supplied context was useful, what was missing, and what deeper Drive retrieval would have been necessary. This is part of the integration test.

## Acceptance

PASS if the return is independently reasoned, evidence-grounded, context-aware, overlap-aware and materially useful to Factory without requiring Odin to reconstruct the task.
