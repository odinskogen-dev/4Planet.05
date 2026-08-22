# ONE INTERFACE DONOR SWEEP 01

Date: 2026-08-22
Status: CONTROLLED ANALYSIS · NO RUNTIME MERGE YET
Current lead: `release/one-interface-premium-current` @ `010fd3a765f636007beba75e51d121e6d6bf856d`
Primary fixed-review donor: PR #92 / `fix/one-interface-brand-hierarchy-20260820` @ `9884c7333f25a488bd8a4d210032e668a5f6f562`
Secondary donor: `release/one-interface-s05-axe-reconciled`

## Executive finding
The current lead is NOT a superset of the best prior ONE INTERFACE work. The lineages diverged. Final Gold must selectively recover strong product/design/text capabilities before release.

Verified compare:
- current vs PR #92: PR #92 side has 222 commits not on current; current has 58 unique commits;
- current vs S05 reconciled: S05 side has 117 commits not on current; current has 58 unique commits;
- `claude/one-interface-premium-completion` contains no unique commits beyond current lead and is not a required donor.

## First-pass donor matrix

| Capability | Donor evidence | Decision | Integration rule |
|---|---|---|---|
| Homepage WHY / brand premise | PR #92 homepage has dedicated blue `WHY 4PLANET_` thesis with human-dependency framing before product machinery | ADOPT | Preserve current hero, reintroduce the stronger WHY beat with current Brand OS/copy review. |
| Live/shared ATLAS front-door showcase | PR #92 uses `HomeAtlasShowcase`; current homepage does not | ADOPT CONCEPT / REBASE IMPLEMENTATION | Build against current ATLAS semantics/runtime; do not transplant stale map internals. |
| Featured Jaguar / Orca / Homo sapiens entry journeys | PR #92 homepage includes three flagship entries | ADOPT IA | Route to latest authoritative Jaguar/Orca/S4PIENS surfaces, not old embedded implementations. |
| Dedicated About Story / System / Founder | PR #92 routes `/about/story`, `/about/system`, `/about/founder`; current lead lacks them | ADOPT | Recover content/design, review against current Founder/brand truth before release. |
| M4GAZINE front + article routes | PR #92 has `/magazine` + `/magazine/:slug`; current lead redirects `/magazine` to home | ADOPT | Restore as premium 4CULTURE destination if current content/rights still pass. |
| Premium navigation shell | PR #92 contains a larger navigation-shell lineage; current has a strong but different shell | REVIEW / CHERRY-PICK | Compare human UX, keyboard/mobile, hierarchy. Do not replace current shell wholesale. |
| Species Atlas Window | PR #92 contains reusable `SpeciesAtlasWindow` | ADOPT IF CURRENT-SEMANTICS GREEN | Port only after occurrence/range/source semantics regression against current ATLAS. |
| Species Evidence / Node / Pressure primitives | PR #92 contains `SpeciesEvidence`, `SpeciesNodeCard`, `SpeciesPressurePath` | ADOPT SELECTIVELY | Use as shared SPECIES primitives where compatible with current species truth. |
| Mission Atlas Window | PR #92 contains `MissionAtlasWindow` | ADOPT CONCEPT / VERIFY | Must bind current ATLAS/context model and mobile behaviour. |
| Homo sapiens integrated world | PR #92 has `HomoSapiensWorld` | SUPERSEDED AS IMPLEMENTATION / ADOPT ENTRY LOGIC | Current S4PIENS biomimetic line is authoritative design continuation; use old route/content only as donor. |
| Jaguar integrated world | PR #92 has `JaguarWorld` | SUPERSEDED AS IMPLEMENTATION / ADOPT ENTRY LOGIC | Current Jaguar Master PR #79 owns Jaguar Journey. Do not revive older Jaguar engine. |
| Amazon Rainforest integrated world | PR #92 has `AmazonRainforest` | REVIEW AGAINST ECOSYSTEMS GOLD | Current Ecosystems Gold PR #117 is newer authority; use older page only for missing copy/design primitives. |
| Analytics baseline | PR #92 lineage includes privacy-first analytics files; current lead comparison does not | ADOPT | Reintegrate only consent-gated/privacy-first baseline and run current production privacy tests. |
| One Interface universe visual CSS | PR #92 contains `one-interface-universe.css` | REVIEW / EXTRACT TOKENS-PATTERNS | Harvest strong layout/typography/motion patterns, not stale page assumptions. |
| Founder portrait / provenance | PR #92 contains controlled founder asset + About integration | REVIEW RIGHTS / ADOPT IF VALID | Keep only if source/rights/Founder judgement remain valid. |
| S05 ProductSwitcher + Product Context | S05 contains richer ProductSwitcher/Product Context iteration | REVIEW | Current shell already has ProductSwitcher; diff behaviour and recover only superior context-preservation UX. |
| S05 motion/media primitives | S05 contains `MotionMedia` and Earth motion work | ADOPT SELECTIVELY | Only motion that clarifies state/story; reduced-motion mandatory. |
| S05 Species launch media / registries | S05 contains broad species assets and media/source registries | REVIEW RIGHTS / ADOPT DATA-QUALITY PASS | Never reintroduce unresolved Orca rights assets; preserve verified media only. |

## Current lead MUST PRESERVE
Do not destroy current unique 58-commit value while harvesting donors. Preserve unless explicitly superseded by verified better implementation:
- current premium lead branch and rollback;
- current mission-bank imagery / visual assets;
- current PublicShell behaviour that already passes current acceptance;
- current source/truth terminology and routes;
- current Atlas/Product Context semantics;
- current security/accessibility/reduced-motion controls;
- current working Mission/Impact/SPECIES/Living Systems functionality.

## Hard rejects
- no wholesale merge of PR #92 or S05 into current lead;
- no resurrection of old standalone Jaguar/Orca/S4PIENS engines over newer authoritative lines;
- no unresolved-rights Orca photography;
- no feature accepted merely because the older screen looked better;
- no production promotion before exact-head mobile + desktop + WebKit/Chromium + truth + performance gate.

## Next Gold convergence order
1. Freeze `010fd3a...` as ONE INTERFACE 09 pre-harvest recovery point.
2. Create/use exactly one child continuation only after lineage registration.
3. Recover homepage WHY + live/shared ATLAS showcase + flagship journey IA first.
4. Recover About + M4GAZINE public-universe depth.
5. Recover reusable Species/Mission primitives where current semantics pass.
6. Wire latest Jaguar Master, Orca/Ecosystems and S4PIENS rather than old local copies.
7. Run visual/text/function donor review at 390×844, 430×932 and 1440×900.
8. Full Gold acceptance; only then mint ONE INTERFACE 10 fixed review candidate.
