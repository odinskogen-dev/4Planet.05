# 4PLANET GOLD / WORLD CLASS QUALITY GATE

Standing cross-project quality rule for all user-facing 4PLANET code.

This is a quality overlay, not a new product architecture. ONE INTERFACE / Shared Shell is the reference grammar. New product surfaces reuse proven GOLD primitives unless a real user or domain requirement justifies an exception.

## Core rules

1. Every screen has one dominant idea, one dominant visual anchor and one obvious next action.
2. Reveal complexity; do not display all complexity at once.
3. Nothing may look designed merely because it has been styled.
4. Every visible element must improve understanding, orientation, action, life/emotion, trust, evidence or accessibility. Otherwise remove or subordinate it.
5. Premium visual quality never waives usability, truth, accessibility or performance defects.
6. Recurrence of an already learned quality defect is a programme-control failure.

## Mandatory pre-code questions

Before implementation begins, record:

- **USER ARRIVES BECAUSE** — why is the person here?
- **ONE THING TO UNDERSTAND** — what must they understand?
- **PRIMARY ACTION** — what should they naturally do next?
- **SECONDARY DEPTH** — what appears only when requested?
- **P1 / P2 / P3 / P4** — intended visual order.
- **WHAT CAN BE REMOVED** — non-essential content or chrome.
- **WHAT MUST BE REUSED** — existing GOLD primitives that already solve the job.
- **TRUTH BOUNDARY** — source fact, interpretation, planned, unavailable or test-only.
- **MOBILE-FIRST RISK** — what can fail at 390/430 px or touch.
- **HUMAN SUCCESS** — observable behaviour that proves the experience works.

A user-facing build is not GOLD-ready with unanswered fields.

## Visual hierarchy model

- **P1 — DOMINANT:** first thing the eye should notice.
- **P2 — ORIENTATION:** where the person is and why it matters.
- **P3 — ACTION / NEXT:** natural continuation.
- **P4 — DEPTH:** evidence, metadata, secondary controls, sources and advanced detail.

Anything that cannot be classified is removed, merged, deferred or explicitly justified.

## HUMAN CRAFT / AI-WASH

Inspect rendered UI and source code for generative fingerprints:

- card-grid-by-default or arbitrary 2×2 / 3×3 symmetry;
- equal visual weight across unrelated information;
- generic hero → cards → features → CTA → footer composition;
- excessive labels, mono text, boxes, pills, rounding, gradients, glow, shadows or icon noise;
- repetitive section spacing and identical rhythm;
- decorative arrows, hover lift/shadow or motion without informational purpose;
- generic copy when precise language exists;
- repetition or explanatory text the interface should make obvious;
- features added because they were easy to generate rather than useful;
- hard-coded local styles, duplicated tokens, parallel components or obsolete canon;
- fake/demo states that resemble production truth;
- dead CTAs, dead ends and hover-only critical functionality;
- different patterns for the same action;
- metadata or interface chrome competing with life, place, story or the primary action.

Every finding receives one structural action: **DELETE / MERGE / REUSE / SUBORDINATE / JUSTIFY**. Restyling alone does not close an AI-Wash finding.

## Human-facing release gate

Every bounded candidate must pass:

1. **Five-second test** — an ordinary person can state what this is.
2. **Squint test** — dominant hierarchy remains obvious when detail is blurred.
3. **Scan test** — image + headings + key labels communicate the page.
4. **Next-action test** — natural continuation is obvious.
5. **Dead-end test** — user can continue, return or understand why they cannot.
6. **Context test** — relevant Species / Place / Mission / source context survives supported cross-product movement.
7. **Mobile test** — 390×844 and 430×932; touch-first; no hover dependence; no horizontal overflow.
8. **Accessibility test** — WCAG 2.2 AA target, keyboard, visible focus, reflow/200% text, contrast, reduced motion and semantic landmarks.
9. **Performance test** — no unnecessary media/data load, material layout shift or interaction lag.
10. **Truth test** — no source, maturity, LIVE-data, impact, partner or delivery inflation.

Browser/build success is not human validation.

## Evidence required on every user-facing return

- exact code lineage / SHA;
- desktop and 390/430 mobile rendered evidence;
- user job + P1–P4 hierarchy rationale;
- removed / merged / reused inventory;
- AI-Wash findings and structural corrections;
- dead-end and context-continuity result;
- accessibility / reduced-motion state;
- performance and truth limitations;
- open material defects;
- human-test status and trigger.

An agent may not self-promote a candidate to GOLD because tests and build pass.

## Learning loop

Every material defect or proven reusable pattern follows:

**OBSERVATION → ROOT CAUSE → GENERALISABLE RULE → AFFECTED PRODUCTS / COMPONENTS → CORRECTION → RE-TEST → BRAIN WRITEBACK**

The learning record states what failed, why, what rule changed, where else it may exist and how recurrence will be detected.

## Permanent coding sequence

**BRIEF → PRE-CODE QUESTIONS → REUSE CHECK → BUILD → SELF-AUDIT → RENDERED DESKTOP/MOBILE REVIEW → HIERARCHY TEST → AI-WASH → ACCESSIBILITY/PERFORMANCE/TRUTH QA → EXACT-SHA EVIDENCE → HUMAN TEST WHEN REQUIRED → LEARNING WRITEBACK**

## LIVE KING + TEST KING control

- **TEST KING** is the only active convergence/integration tree for assembling materially better product slices.
- **LIVE KING** is production and receives only verified, Founder-accepted slices from TEST KING.
- Historical branches remain donor/recovery evidence, not competing active candidates.
- Every donor delta is classified **ADOPT / ALREADY PRESENT / REJECT WITH REASON / DEFER WITH REASON**.
- Never newest-branch-wins and never wholesale-merge divergent candidates.
- Promotion is feature-by-feature and must preserve a rollback anchor to the exact prior LIVE SHA.

For the current repository, `release/one-interface-premium-current` / PR #121 is TEST KING until a later explicit Founder decision changes the active line.

Canonical programme reference: `4PLANET_ GOLD / WORLD CLASS PRODUCT QUALITY SYSTEM v1.0 — HUMAN CRAFT, HIERARCHY & AI-WASH` in 4PLANET Knowledge OS.
