# 4PLANET PUBLIC CORE 01 — LIVE MATRIX

Status: RELEASE CANDIDATE CONTROL / NOT AUTHORISED FOR PRODUCTION
Date: 2026-09-02

## Authority

- Canonical integration source: `king/test`
- Source TEST KING SHA at release cut: `ead7715a5d426058ea9107dbbe3d3ab3ce55528c`
- Current production-base `main` SHA before cutover: `3ff36765d6ae0cabdb83ff47e4a747cca4bdb282`
- Fresh rollback ref: `rollback/live-before-public-core-01-20260902`
- Existing release receiver: `release/live-king-20260901`
- Bounded release candidate: `release/public-core-01-candidate`
- Production promotion remains Founder-release only.

PUBLIC CORE 01 deliberately separates public readiness from portfolio completeness. Held work stays in the repository and remains available to TEST KING / bounded product workstreams; it is not deleted or reclassified as failed simply because it is excluded from this release.

## Release classes

### LIVE

Public routes that should be discoverable and usable as the core 4PLANET experience once the final release gate passes:

- `/`
- `/domains` and all four Domain routes
- `/missions` and the current sixteen Mission identities, with `M4GAZINE_` represented by the canonical Magazine destination rather than a duplicate indexed redirect
- `/atlas`
- `/species` and source-safe curated Species profiles
- `/about`, `/about/story`, `/about/system`, `/about/founder`
- `/join`
- `/people`
- `/brands`
- `/partners`
- `/funders`
- `/privacy`
- `/reports` where current content remains truthful and useful
- public 4CULTURE destinations already represented by current Mission / Magazine routes
- Jaguar journey only if exact-candidate browser + Human Quality gates remain green

### LIVE WITH DEVELOPMENT BOUNDARY

Public, useful now, but must explicitly retain current limits rather than imply a finished service:

- `/living-systems` and current source-backed guided system views
- `/impact` and public Impact stories: explanation / pathway / future-delivery model only; no public payment, delivery or ecological-outcome claim
- `/magazine` plus public explainers / source / corrections surfaces: Founding Edition and publication state must remain truthfully labelled
- public participation / partner / funder entry pages: interest and collaboration pathways only; no account, membership, active partnership or funding implication

### PRIVATE / NOINDEX

- Universal Proof / Pitch Hub (`/present`) whenever present in a candidate: private demonstration surface, never public discovery
- any bounded private validation proof that is explicitly marked private/noindex by its owning workstream

### HOLD

Excluded from PUBLIC CORE 01 because current Human Gold / runtime / relationship gates are not yet closed:

- ORCA Journey / Human Gold experience (`/journey/orca*`)
- ORCA LUME journey handoff (`/species/orca/lume`)
- 4SAPIEN / Embla / FOOD decision product routes (`/4sapien*`, `/food/*`, `/s4piens/food/*`)
- Actor Gold / Actor discovery (`/actors*`, `/get-involved`)
- new ecosystem-transfer surfaces that have not independently passed Human Gold
- experimental Species Engine lab (`/species/lab`)
- Lens capture proof (`/lens`)

PUBLIC CORE release edge behaviour sends these routes to the nearest truthful public surface and marks held route families noindex/nofollow. This is release scoping, not deletion.

### INTERNAL ONLY

- Capital conversion / proof packs
- Production Factory / Symphony Conductor
- SUPERBRAIN / CNS
- IMPACT lab/test/record routes
- Stripe / checkout lab and return paths until separate production commerce release
- internal QA, control, evidence and Factory surfaces

## Zero Loss disposition

- Held product code: `DEFER_WITH_REASON` — preserved, active in its correct bounded workstream, not public-release ready.
- ORCA Human Gold: `DEFER_WITH_REASON` — current candidate remains under product/runtime correction; public Species Orca may remain available as a separate truthful profile.
- Embla / FOOD: `DEFER_WITH_REASON` — technically controlled but not yet approved as Human Gold public utility.
- Actor Gold: `DEFER_WITH_REASON` — Actor existence / source / relationship semantics remain protected; public partner intake is not equivalent to Actor Gold publication.
- Proof Hub: `DEFER_WITH_REASON` for public discovery; intended private/noindex function preserved.
- IMPACT commerce / delivery: `BLOCKED_TRUTH_RIGHTS` at production-action level until explicit delivery/payment/release gates close; explanatory public Impact remains allowed.
- Capital / Factory / CNS: `ALREADY_PRESENT` as internal programme capability, not public product surface.

## PUBLIC CORE hard release law

A production promotion may happen only when ALL are true on one exact candidate:

1. build / type / lint / asset / high-severity dependency gates pass;
2. Chromium + WebKit pass on desktop, 390 and 430 for the public core;
3. ATLAS and product-switching critical journeys pass;
4. public navigation has no dead ends into held/internal routes;
5. held routes are absent from sitemap/discovery and fail closed at the release edge;
6. public copy, claims, sources, media rights and uncertainty remain truthful;
7. security / CSP / privacy / analytics controls pass;
8. the exact candidate has a production-equivalent immutable preview;
9. visual Human Quality review finds no material premium-quality blocker;
10. rollback ref is readable and points to the pre-cutover production base;
11. Founder JUDGE returns GO;
12. Founder explicitly releases production with `ENIG GÅ LIVE` or equivalent action-specific authority.

Technical PASS alone is never Founder JUDGE and never LIVE authority.
