# CLAUDE BOUNDED PRODUCT BUILD — TEST KING FRONT DOOR WORLD-FIRST 01

id: CLAUDE-TEST-KING-FRONT-DOOR-WORLD-FIRST-01
base_sha: ac2538f78bbfdb0e922f7f8f64cf808013fe1e34
test_profile: PRODUCT_UI
model: claude-opus-5
dispatch_attempt: 1
write_scope: src/components/home/WorldFirstAct.tsx
write_scope: src/components/home/world-first-act.css

status: BOUNDED_FACTORY_CANDIDATE_ONLY
parent_product_authority: king/test @ ac2538f78bbfdb0e922f7f8f64cf808013fe1e34
source_review: CLAUDE-TEST-KING-PRODUCT-LEAD-SPRINT-01
owner: AXE / 4PLANET Production Factory

## Mission — continuation of your Product Lead sprint

Continue the Product Lead sprint you just completed on exact TEST KING.

Your review identified the P0 product direction as **one orientation, one first act**, and specifically found that the current front door spends its first meaningful post-hero screen explaining 4PLANET rather than letting a person meet or explore the living world.

Build the strongest isolated **world-first second-screen candidate** you can from the exact current TEST KING product and truth assets.

This is not a request to execute AXE's preferred UI. Think as the Product / UX / Interface Lead. The user outcome, truth boundaries, brand foundation and concurrency limits are binding; the visual/product solution is yours.

Work token-efficiently. Do not spend turns restating the review. Inspect the exact existing Home, AtlasHero, available product data, image registry, shared primitives and routes you need, then build.

## Why the implementation is isolated

AXE rechecked live ownership after your review:

- active PUBLIC CORE PR #243 writes `src/components/layout/PublicShell.tsx` → shell/orientation implementation is currently blocked for Claude;
- active Jaguar Master PR #79 writes `src/pages/integrated/Species.tsx` → median SPECIES integration is currently blocked for Claude;
- active ATLAS PR #246 owns current ATLAS product-polish work.

We will not create competing work.

Therefore this phase deliberately creates a new self-contained front-door component only. It MUST NOT mount itself into Home and MUST NOT mutate existing product routes. This lets your product thinking become executable now without colliding with another active lane.

## Exact code identity

Repository: `odinskogen-dev/4Planet.05`

Pinned base: `king/test@ac2538f78bbfdb0e922f7f8f64cf808013fe1e34`

PR #131 is the canonical TEST KING control line.

PR #210 is a CLOSED `[FROZEN REFERENCE DONOR]`, never authority.

This candidate branch is only a donor candidate created from the pinned TEST KING SHA. It has no merge, TEST KING, LIVE, Canon or release authority.

## Human outcome

Design a second screen that could eventually sit immediately after the existing front-door hero and change the first 30 seconds from:

`hero → WHY 4PLANET manifesto → product explanation`

into something closer to:

`hero → encounter the living world → one meaningful act → optional depth`

A first-time globally oriented non-expert should feel that 4PLANET is useful and alive before being asked to understand the organisation.

The component should help answer:
- What am I looking at?
- Why should I care?
- What can I do now?
- Where can I go deeper?

Do not force all four questions into visible copy if the design can answer them more elegantly.

## Product freedom

You may choose the strongest world-first concept supported by current truthful TEST KING assets. Examples might include a species, place, current planetary observation, documentary world, or another concrete living-planet entry — but these are hypotheses, not requirements.

You may:
- reject the obvious solution if a stronger one exists;
- use one existing real product object as the protagonist;
- design the hierarchy, copy, interaction and progressive disclosure yourself;
- reuse existing image registry assets, product routes, types, tokens and read-only data;
- make the module visually ambitious within the two-file scope;
- use CSS in the allowed new stylesheet;
- make the component responsive and reduced-motion aware;
- expose a small typed prop surface if that materially improves future reuse.

You may read any repository file needed to make a high-quality choice.

## Hard write boundary

The only writable paths are:

- `src/components/home/WorldFirstAct.tsx`
- `src/components/home/world-first-act.css`

DO NOT edit:
- `src/pages/v5/Home.tsx`;
- `src/pages/v5/AtlasHero.tsx`;
- `src/components/layout/PublicShell.tsx`;
- `src/product/ProductSwitcher.tsx`;
- `src/App.tsx`;
- `src/pages/integrated/Species.tsx`;
- `src/earth/**`;
- `public/journey/**`;
- `public/xr/**`;
- routes, data stores, source files, manifests, workflows or control docs.

If your ideal integrated solution needs one of these, build the strongest honest isolated candidate possible and state the exact future integration seam in your handoff. Do not expand authority.

## Brand foundation

Read the complete Product + Brand Core supplied by the worker before implementation.

Particularly protect:
- premium, calm, intelligent, intentional, human-first;
- scientific without academic-software feel;
- cultural/editorial rather than corporate-SaaS;
- `Apple × Living Organisms` as interaction/system behaviour, not eco decoration;
- pure white / pure black master surfaces and one intentional brand-blue interface accent in default 4PLANET context;
- Instrument Sans / DM Sans / Fragment Mono roles already expressed through current tokens/primitives;
- documentary/source-relevant imagery above generic decoration;
- life and place before internal systems;
- British English, clear and exact, confident without hype;
- curious about the world rather than self-obsessed;
- no generic sustainability copy, guilt-first messaging or unsupported superlatives;
- REDUCE BEFORE GENERATE;
- mobile, accessibility and performance are premium product quality;
- honest absence is preferable to fabricated completeness.

Do not build another four-card product catalogue or another four-domain grid. Your own review identified the competing-four-taxonomy problem. The purpose here is to demonstrate the alternative through product design.

## Truth / evidence law

Use only claims, routes, media and object identity supported by exact TEST KING.

Do not invent:
- a live ecological event;
- real-time status;
- range, abundance or population trend;
- partner or funding status;
- Impact delivery or outcome;
- media rights;
- source certainty;
- user state that does not exist.

If a chosen image/object has a rights or truth limitation in current data, retain the limitation or choose another object rather than hiding it for beauty.

A source failure is not zero. UNKNOWN stays UNKNOWN.

## MUST-NOT-LOSE

- Existing hero is Founder-selected LOST GOLD donor value and remains untouched in this candidate.
- Current truth grammar and honest absence.
- Existing routes and canonical identities.
- Cross-product continuity rather than a new disconnected mini-product.
- One clear dominant human purpose.
- Premium mobile behaviour.
- Reduced-motion support if the component introduces motion.
- No dependency, route, source or architecture expansion.
- No competing public shell or navigation model inside this component.

## Product quality test

Before finishing, judge your own candidate at:

**5 seconds:** Does a person meet something real in the living world rather than another explanation of 4PLANET?

**30 seconds:** Is there one obvious meaningful act, with secondary depth subordinate to it?

**3 minutes:** Does the chosen path connect naturally into an existing useful 4PLANET world?

**Brand:** Could this plausibly belong to a globally premium science × culture × technology organisation rather than an NGO landing page or SaaS dashboard?

**Truth:** Is every visible assertion supportable from current repository evidence?

## Factory validation

The control plane will independently enforce:
- exact write-scope firewall;
- protected-path firewall;
- `npm run typecheck`;
- `npm run build`;
- `npm run test:smoke`.

No technical PASS means the design is automatically accepted. AXE will inspect the actual candidate diff and product quality independently.

## ACCEPT as isolated product candidate only if

- the component represents a materially stronger world-first second screen than the current manifesto-first pattern;
- it has one dominant human act;
- it does not recreate the two competing four-item taxonomies;
- it feels premium/editorial/living rather than card-dashboard/SaaS;
- it is responsive and accessible;
- it uses current truthful assets and routes without overclaiming;
- it is integration-ready without needing a new architecture;
- the two-file scope and PRODUCT_UI validation pass.

## REJECT even if CI passes if

- it is mainly another explanation of 4PLANET;
- it is a generic card grid or app launcher;
- it hides truth/media limitations to look premium;
- it invents live/realtime/impact/partner state;
- it creates new navigation authority;
- it depends on an unapproved new data path;
- it edits outside the two allowed new files;
- it is polished but does not materially improve the first 30 seconds.

## Return

Report compactly:
- the product concept you chose and why;
- what you implemented;
- the concrete user act;
- exact existing objects/routes/media reused;
- truth/rights decisions;
- mobile/accessibility/performance decisions;
- exact changed files;
- what deliberately remains UNMOUNTED;
- the exact future integration seam you recommend once ownership is clear;
- any reusable BRAND LEARNING CANDIDATE discovered while building.