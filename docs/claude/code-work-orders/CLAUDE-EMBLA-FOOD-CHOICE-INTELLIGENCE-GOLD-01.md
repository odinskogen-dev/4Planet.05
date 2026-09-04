# CLAUDE BOUNDED PRODUCT BUILD — EMBLA × FOOD CHOICE INTELLIGENCE GOLD 01

id: CLAUDE-EMBLA-FOOD-CHOICE-INTELLIGENCE-GOLD-01
base_sha: 404fad51436d273fceb77af33beef17b3a16ea27
test_profile: PRODUCT_UI
model: claude-opus-5
dispatch_attempt: 1
write_scope: src/pages/sapien
write_scope: src/choice
write_scope: src/food
write_scope: tests/e2e/4sapien.spec.ts
write_scope: tests/e2e/4sapien-embla.spec.ts

status: BOUNDED_FACTORY_CANDIDATE_ONLY
parent_product_authority: king/test @ 404fad51436d273fceb77af33beef17b3a16ea27
owner: AXE / 4PLANET Production Factory
founder_direction: Current Embla contains useful theory but is not yet premium end-to-end and is not functionally strong enough. Claude is asked to take specialist Product / UX / Interface ownership of a coherent FOOD-first Choice Intelligence sprint and build the strongest truthful isolated candidate.

## PRIMARY MISSION

Turn the current 4SAPIEN / Embla surface from a promising conceptual proof into the strongest possible **premium, useful, end-to-end functional FOOD-first Choice Intelligence candidate** inside the existing 4PLANET architecture.

Do not build a new app, new architecture, new BRAIN, new recommendation system universe or disconnected FOOD demo.

Start from exact current TEST KING. Recover and reuse the best existing Embla, FOOD, PICK and user-test value already present. Simplify or redesign weak implementation aggressively where warranted, but do not throw away useful truth logic merely because the current interface is weak.

This is a coherent product sprint, not a cosmetic pass.

The outcome should make a first-time person understand, within seconds, what Embla does for them and then actually complete one useful decision with it.

## WHY THIS MATTERS IN THE WHOLE 4PLANET SYSTEM

4PLANET is building **LIVING PLANET INTELLIGENCE**: a connected system that helps humans and institutions understand the living world, make better decisions, act, prove what happened and learn.

North Star:

**Help bring the living planet back toward balance so humans and the rest of life can thrive together.**

Canonical value loop:

`UNDERSTANDING → DECISION → INCENTIVE → ACTION → PROOF → LEARNING → BETTER UNDERSTANDING`

Architecture law:

`ONE PLANET. ONE BRAIN. ONE TRUTH SPINE. ONE FACTORY. ONE TEST KING. MANY WORLDS.`

Standing product principle:

**Separate worlds. Shared infrastructure. Controlled depth.**

Relevant public worlds:
- ATLAS = spatial living-planet intelligence;
- SPECIES = trusted human-first living-organism intelligence;
- LIVING SYSTEMS = relationship intelligence;
- IMPACT = action / allocation / proof;
- 4SAPIEN / EMBLA = human choice and ordinary-life utility layer;
- S4PIENS = human-systems intelligence, with FOOD as the first deep proof.

Embla matters because planetary intelligence only compounds if it can improve real human choices. This sprint is the HUMAN proof wedge: can 4PLANET turn trusted evidence into a decision that is genuinely useful to an ordinary person?

FOOD is the right first wedge because it is frequent, concrete, measurable and connects personal value to larger living systems. But FOOD must be treated as the first implementation of a reusable Choice Intelligence pattern, not the permanent boundary of Embla.

## THE END-STATE IDEA — CHOICE INTELLIGENCE

Embla should ultimately become a trusted personal **Choice Intelligence** layer: a human interface that understands what someone is trying to decide, understands relevant personal constraints/preferences, assembles trustworthy options and evidence, makes trade-offs legible, helps the person choose and act, then learns from the result where permission and evidence allow.

The reusable conceptual loop is:

`INTENT → CONTEXT → OPTIONS → EVIDENCE → TRADE-OFFS → CHOICE → ACTION → RESULT → LEARNING`

This is not a generic chatbot.

This is not a universal score machine.

This is not a moralising sustainability assistant.

This is not an AI that pretends certainty.

The long-term ambition is that a person can ask Embla questions such as:
- Which of these products is actually the better choice for me?
- What should I buy instead?
- Can I improve this shopping list without spending more?
- Which car fits my real life over five years?
- Can I afford this home without making the rest of my life worse?
- Which option is best when price, health, usefulness and planetary consequences conflict?

The system should answer by connecting the person's actual decision to evidence and explicit trade-offs — not by guessing.

FOOD is the first bounded proof of that end state.

## IMPORTANT SEPARATION — EMBLA vs FOOD

Protect this distinction:

**Embla / 4SAPIEN** is the human decision interface and choice layer.

**FOOD / S4PIENS** is the deeper food/product/system intelligence and evidence domain that Embla can use.

Embla should not become a FOOD database UI. FOOD should not become a second Embla.

For this sprint, the person should feel they are using Embla to make a choice; FOOD intelligence should appear as the trusted depth powering that choice when needed.

## FOUNDER JUDGEMENT OF CURRENT STATE

Treat this as fresh Founder product judgement:

> The current Embla contains several theoretically useful ideas, but it does not yet have a premium end-to-end feel and is not functionally good enough.

Do not defend the current interface because it already has modules or because tests pass.

Technical correctness is not Human Gold.

Your job is to make a materially better product.

## CURRENT REPOSITORY VALUE — MUST INSPECT BEFORE DESIGNING

Current TEST KING already contains important donor value. Inspect it before changing anything.

Key current seams include:
- `src/pages/sapien/FourSapien.tsx`
- `src/pages/sapien/embla-02.css`
- `src/choice/embla.ts`
- `src/food/FoodIntelligence.tsx`
- `src/food/FoodUserTest.tsx`
- `src/food/PickPrototype.tsx`
- `src/food/PickScanner.tsx`
- `src/food/PickAlternatives.tsx`
- `src/food/PickHouseholdPanel.tsx`
- `src/food/core.js` / `core.d.ts`
- `src/food/category-control.js` / `.d.ts`
- current FOOD fixtures and source adapter logic
- `tests/e2e/4sapien.spec.ts`
- `tests/e2e/4sapien-embla.spec.ts`

Current Embla already exposes concepts such as Shopping list, Find best, Scan and Ask Embla. Do not assume those four buttons are the right final information architecture. Preserve their useful jobs, not necessarily their current presentation.

Current FOOD code already contains meaningful truth-aware behaviour including product identification, source-normalised records, category control, preferences, alternatives, confidence/data-quality handling, UNKNOWN states and local evidence persistence. Reuse and strengthen that value rather than replacing it with invented data or fake AI.

## PRODUCT QUESTION

Solve this question:

**What is the smallest FOOD-first Embla experience that feels like a premium new category of product and proves that trusted Choice Intelligence can materially improve a real everyday decision?**

You have freedom to challenge AXE's interface hypothesis below. The outcome and truth boundaries are binding; the exact UI is yours to judge.

## TARGET HERO JOURNEY

A strong target journey is approximately:

`I need to choose something`
→ `Embla understands my intent`
→ `Embla gets the product / list / options`
→ `Embla uses truthful FOOD evidence + my explicit priorities`
→ `Embla shows the best supported choice or honestly says evidence is insufficient`
→ `I understand WHY, the important trade-offs and uncertainty`
→ `I choose / replace / add / keep`
→ `the decision is retained locally where appropriate`
→ `I can give a lightweight result/feedback receipt`
→ `the system can learn from real use without pretending purchase or outcome proof`

Possible entry modes can include:
- ask in plain language;
- scan a barcode;
- search / identify a product;
- compare products;
- paste or build a shopping list.

But these should converge into one coherent decision experience rather than four disconnected mini-tools.

## ONE FUNCTIONAL GOLD USE CASE — REQUIRED

At least one bounded FOOD journey must work end-to-end with current truthful capabilities.

The strongest candidate should preferably allow a person to do something like:

**“Help me choose a better product / improve one item on my shopping list.”**

A valid functional flow should, where current source data supports it:
1. accept a real human need or product/list input;
2. identify or retrieve a product record;
3. show a clear human summary rather than dumping database fields;
4. let the user set a small number of explicit priorities/preferences;
5. compare relevant alternatives when evidence exists;
6. produce an explainable recommendation or explicit NO RECOMMENDATION / INSUFFICIENT EVIDENCE state;
7. make the important trade-offs visible;
8. allow one concrete choice action such as keep, replace, add to list or save choice;
9. persist the decision locally if that is the strongest current safe state mechanism;
10. make evidence/source/uncertainty inspectable progressively rather than overwhelming the primary view.

Do not claim that a product was purchased, healthier, greener, cheaper, available in a store, or better overall unless the evidence and comparison contract support that exact claim.

## PRODUCT EXPERIENCE BAR

The candidate should feel like a serious globally premium consumer product, not an internal prototype with a polished stylesheet.

Aim for:
- immediate clarity;
- calm confidence;
- strong editorial hierarchy;
- large purposeful type and space where appropriate;
- very few but very strong primary controls;
- premium motion only where it improves orientation/continuity;
- no generic SaaS dashboard/card-grid feel;
- no evidence-wall as the first screen;
- no dense form-first experience unless a form is genuinely the shortest useful path;
- no stack of internal system labels;
- no “AI magic” visual language;
- no decorative eco aesthetic;
- no sustainability guilt messaging;
- no dead controls, fake affordances or decorative buttons;
- no placeholder routes presented as functionality.

Use `Apple × Living Organisms` as system/interaction quality: responsive, adaptive, layered, economical and coherent — not decorative biomorphism.

Public copy is English, British conventions, direct and human.

## 5 SECOND / 30 SECOND / 3 MINUTE TEST

### 5 seconds
A new person should understand:
**Embla helps me make better choices.**

Not:
“4SAPIEN is a system with several modules.”

### 30 seconds
The person should have begun a real FOOD decision with one obvious first act.

### 3 minutes
The person should have completed a useful decision loop, understood the recommendation/trade-offs/limitations and be able to inspect deeper evidence if desired.

## HUMAN GOLD TEST

Optimise toward a product that can later be tested with real users on:
- time to understand what Embla does;
- time to first useful decision;
- perceived usefulness;
- trust;
- whether the explanation was understandable;
- whether the user changed or confirmed a choice;
- whether alternatives were genuinely relevant;
- repeat-use intent;
- install/save intent;
- willingness to pay where later appropriate;
- failure severity and confusion points.

Do not claim HUMAN GOLD from CI or from Claude judgement. Real user evidence remains required.

## CHOICE INTELLIGENCE CONTRACT — DESIGN FOR REUSE

The implementation may remain FOOD-specific where that is truthful, but avoid hard-coding the entire interface around one category in a way that prevents the underlying Embla pattern from later supporting HOME, CAR, FINANCE and other decision domains.

Where useful, make the reusable distinction explicit in code between:
- decision intent;
- personal context / preferences;
- candidate options;
- source evidence;
- comparison dimensions;
- trade-off explanations;
- recommendation eligibility;
- chosen action;
- learning receipt.

Do not over-architect abstractions that FOOD does not yet need. Build reusable seams only where the current product benefits from them.

## TRUTH / SAFETY LAW

Truth is a product feature, not compliance decoration.

Binding rules:
- UNKNOWN stays UNKNOWN.
- Source failure is not zero and not “bad”.
- Missing evidence must not be converted into a negative score.
- No live availability claim without live store evidence.
- No universal “best” when the answer depends on priorities or evidence is incomplete.
- No invented price, product, nutrition, sourcing, ecological footprint, certification, partner or outcome.
- Current fixtures must remain clearly identifiable as fixtures/test data wherever surfaced.
- Preserve source provenance and data-quality/confidence distinctions.
- Evidence depth should be inspectable but progressively disclosed.
- Do not turn correlations/heuristics into medical or ecological certainty.

### Health / personal data boundary

This is ordinary consumer choice support, not medical advice.

Do not infer disease, diagnosis, medication, protected health status or medical needs.

Explicit user-entered dietary preferences/allergens may be used only within the current bounded product logic and should remain local/private unless an authorised backend contract already exists.

Do not add sensitive personal-data collection to make the demo feel more intelligent.

## PREMIUM MOBILE REQUIREMENT

Mobile is first-class, especially 390px and 430px widths.

The primary FOOD decision must work naturally one-handed and must not feel like a desktop evidence panel squeezed into a phone.

Protect:
- touch target quality;
- keyboard behaviour;
- safe areas;
- scroll position and continuity;
- readable comparison hierarchy;
- visible selected state;
- focus/semantics;
- reduced-motion support;
- performance.

## MUST-NOT-LOSE

Preserve or improve:
- current truth-first product logic;
- existing real FOOD source/evidence path;
- controlled categories and honest comparison eligibility;
- source-normalisation and raw-evidence integrity;
- explicit UNKNOWN/missing-data behaviour;
- existing relevant preferences and alternative-ranking logic where valid;
- current routes `/4sapien`, `/4sapien/food`, `/labs/food-user-test` unless code truth proves a safe in-scope reason otherwise;
- local-only safe persistence already used for bounded Embla/FOOD state;
- testability of real user proof;
- British English public copy;
- one 4PLANET universe rather than a visually unrelated standalone app.

## CONCURRENCY / PROTECTED SEAMS

ATLAS is actively owned by another workstream.

**DO NOT TOUCH ATLAS.**

Do not mutate:
- `src/earth/**`;
- ATLAS tests;
- global shell/navigation files;
- `src/App.tsx` / route authority;
- package manifests or lockfiles;
- `.github/**`;
- Factory runtime;
- Canon / programme-control docs;
- LIVE/deploy configuration;
- any external system.

The declared write scopes are the complete mutation envelope for this candidate.

You may READ any repository file needed for strong product judgement.

If the best final product needs an out-of-scope seam, state the complete preferred solution and exact convergence requirement in the handoff. Do not silently expand scope and do not weaken the product idea merely to avoid mentioning the seam.

## REDUCE BEFORE GENERATE

Before adding UI, inspect what should be deleted, consolidated or demoted.

Use:

`DELETE → PRIORITISE → CONSOLIDATE → HUMANISE → TEST → REFINE`

The current theoretical modules are donor value, not sacred navigation.

If “Shopping list / Find best / Scan / Ask Embla” is stronger as one fluid Embla interaction with contextual entry points, build that. If another hierarchy is better, use your judgement.

## IMPLEMENTATION EXPECTATION

You are not doing a review-only sprint.

Implement the strongest coherent bounded candidate you can inside the write scope.

You may refactor/rewrite the current Embla page and relevant FOOD UI/choice logic materially if that produces a clearly stronger product while preserving truth contracts and current useful capabilities.

Prefer completing one exceptional end-to-end decision journey over making five partially improved screens.

Use current repository assets and data. Do not add dependencies.

## ACCEPTANCE — PRODUCT

A candidate is eligible for AXE/Founder review only if:
- the first screen clearly communicates Embla's human job;
- one primary FOOD decision journey is fully operable end-to-end;
- the important existing modes are either functionally integrated or deliberately subordinated without losing useful value;
- the result includes a real supported recommendation/alternative path OR an honest insufficient-evidence state;
- rationale/trade-offs are human-readable;
- evidence/limitations are inspectable;
- at least one concrete choice action persists safely;
- no major primary CTA is dead;
- mobile and desktop both feel intentional;
- no generic SaaS/dashboard regression;
- no truth/claim regression;
- current relevant tests remain green and are strengthened where the new interaction needs proof.

## ACCEPTANCE — FACTORY

The control plane independently runs:
- exact write-scope firewall;
- typecheck;
- production build;
- smoke tests.

Strengthen the in-scope 4SAPIEN/Embla E2E tests so the new core user journey is machine-checkable where practical.

Technical PASS does not equal product acceptance. Claude is MAKER. AXE/Factory Gold QA and Founder remain JUDGE.

## SUCCESS DEFINITION

The success question is not “did we improve Embla 02?”

It is:

**Can Odin open the candidate and immediately feel that Embla could become a genuinely useful premium Choice Intelligence product — and can he complete at least one truthful FOOD choice instead of only reading about future functionality?**

If the answer is no, continue simplifying and improving within scope before returning.

## RETURN

Return compactly but decision-completely:
- OBSERVED — the highest-value failures you found in current Embla/FOOD;
- PRODUCT DECISION — what you chose to make Embla become in this candidate and why;
- CHANGED — exact experience and files changed;
- PRIMARY USER FLOW — step-by-step from first intent to persisted choice;
- FUNCTIONALITY — what is genuinely working vs fixture/bounded/demo-only;
- TRUTH — key source/uncertainty/claim decisions;
- PREMIUM — visual/interaction hierarchy decisions and what you removed;
- MOBILE / ACCESSIBILITY / PERFORMANCE — key decisions;
- TESTS — what the Factory can independently verify;
- UNCHANGED / MUST-NOT-LOSE — important value preserved;
- UNKNOWN / BLOCKED — anything that cannot truthfully be solved in this scope;
- NEXT CONVERGENCE — only the smallest material out-of-scope integration needed, if any;
- CHOICE INTELLIGENCE LEARNING — what this FOOD proof teaches us about the reusable Embla contract;
- BRAND LEARNING CANDIDATES — only genuinely durable candidates, labelled CONFIRMS / REFINES / CHALLENGES.

Do not produce a long strategic essay instead of the product. Build first. Return the evidence and decisions.