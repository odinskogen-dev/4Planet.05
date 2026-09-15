# ORCA — BAY OF BISCAY GOLD WBS

Status: FOUNDER-DIRECTED / ACTIVE BUILD LANE
Date: 2026-08-21
Parent: ORCA LUME 19 / shared Journey Engine
Branch: `agent/orca-bay-biscay-gold-20`

## Mission

Use the ORCA partner-proposed England → Bay of Biscay → Spain survey geography as the first marine ECOSYSTEM_ GOLD case inside the existing Orca Journey. Build it as shared ecosystem infrastructure that can transfer to AMAZONIA and future ecosystem journeys.

This is not a new product or microsite.

## Meeting-derived context

Preserve these meeting facts:

- ORCA survey work can run along a point-A-to-point-B transect, recording everything seen along the survey line and retaining effort/context so repeated data can support later ecological analysis.
- The proposed survey/pilot should be used to stress-test the 4PLANET platform.
- ORCA surveys are volunteer-based; a full-year survey was described as likely low-thousands GBP rather than tens or hundreds of thousands, pending ORCA internal costing.
- No pilot is approved yet. ORCA internal SLT discussion is pencilled for 18 September 2026, with follow-up expected after that.
- Founder direction: the partner-proposed route is England → Spain through the Bay of Biscay.

Truth boundary: exact survey ports, line geometry and dates are not yet source-verified in the recovered transcript. Do not invent them. UI may show a clearly labelled schematic pilot corridor only.

## Gold product model

Reusable ecosystem grammar:

`ECOSYSTEM → MAP / PLACE → HABITATS → SPECIES → RELATIONSHIPS → OBSERVATIONS / SURVEY EFFORT → PRESSURES → SOLUTIONS / ACTORS → ACTION → SOURCES / LIMITATIONS`

For Orca:

`ORCA → BAY OF BISCAY → selected cetaceans + habitat → survey / source records → pressures → WH4LES_ → pilot / follow / participate`

For Amazonia transfer:

`JAGUAR / FOREST LIFE → AMAZONIA → habitats + species → forest-water-climate relationships → pressure records → solutions / actors → AM4ZONIA_`

The marine and land cases must share contracts and interaction primitives, not copy visual pages.

## WBS

### BB-01 — Ecosystem canonical object — ACTIVE

- ID: `ecosystem:bay-of-biscay`
- Name: Bay of Biscay
- Working geography: partner-proposed England → Bay of Biscay → Spain pilot corridor
- Boundary status: route geometry unverified; schematic only until exact source is recovered
- Region context: OSPAR Region IV / Bay of Biscay and Iberian Coast where applicable
- No implication that the corridor is an Orca migration route

Acceptance:
- no local duplicate Orca identity;
- no invented official boundary;
- corridor label visibly distinguishes pilot route from animal movement.

### BB-02 — Ecosystem Card v01 — CODED NOW

- injected into existing Orca Journey;
- appears on MOVEMENT / PLACE scene;
- expandable without leaving journey;
- schematic England → Bay of Biscay → Spain context map;
- habitat chips: continental shelf / shelf edge-slope / deep ocean;
- first selected species set;
- source links + limitations;
- mobile + reduced-motion treatment.

Acceptance:
- same shared Journey runtime;
- card does not block navigation;
- truth boundary always visible;
- works without adding another map engine.

### BB-03 — Bay of Biscay map upgrade — NEXT

Replace schematic context with shared ATLAS map state once exact corridor and map contract are verified.

Layers / context:
- route / survey effort line only when partner-provided or authoritative;
- bathymetry / shelf edge;
- GBIF / OBIS / iNaturalist observations where rights and semantics pass;
- ICES JCDP survey context where usable;
- no record count → abundance inference;
- no observation point → migration line inference.

### BB-04 — Species Card set — NEXT

First marine ecosystem card set:
- Orca — `Orcinus orca`
- Short-beaked common dolphin — `Delphinus delphis`
- Long-finned pilot whale — `Globicephala melas`
- Fin whale — `Balaenoptera physalus`
- Cuvier's beaked whale — `Ziphius cavirostris`

Each Species Card must reuse SPECIES canonical identities and link to ATLAS/source records. Add or remove species only after source-grounded review.

### BB-05 — Habitat grammar — NEXT

Represent:
- continental shelf;
- shelf edge / continental slope;
- deep ocean;
- relevant coastal / estuarine context only where evidence supports it.

Use habitat as a relationship layer, not decorative background.

### BB-06 — Survey / monitoring layer — READY AFTER ROUTE VERIFICATION

Model ORCA survey output separately from third-party occurrence sources:
- survey identity;
- transect / route;
- platform;
- effort distance / hours;
- observer effort;
- sighting / species;
- time;
- sea state / observation conditions when supplied;
- source / rights;
- methodology;
- limitations.

Do not merge ORCA field data silently into GBIF / OBIS records.

### BB-07 — Living Systems relationships — SOURCE REVIEW

Candidate relationship chapters:
- Orca → prey → ocean conditions;
- cetaceans → shelf/slope/deep-water habitat use;
- sound → navigation / communication / foraging context;
- vessel activity / underwater noise / fishing interactions as pressure categories.

No relationship becomes established public truth until source/claim review passes.

### BB-08 — Pilot experience — PREP ONLY

Use the Bay of Biscay survey as a bounded 4PLANET product stress test:
- ingest partner survey data;
- preserve survey effort + sighting records;
- map records and habitat context;
- generate source-aware Species / Ecosystem Cards;
- compare partner field observations with independent context without calling it causal proof;
- expose limitations;
- create reporting / learning loop.

Do not describe pilot as approved until ORCA confirms it.

### BB-09 — Amazonia cross-learning contract — ACTIVE DESIGN RULE

Every Bay of Biscay primitive must be assessed for transfer to Amazonia:
- ecosystem card;
- spatial context;
- habitat grammar;
- species card cluster;
- relationship layer;
- pressure/source layer;
- actor/solution/action seam;
- proof/source disclosure.

Every Amazonia improvement must be evaluated for transfer back to Bay of Biscay. The two Gold ecosystems are paired reference cases: one ocean, one land.

### BB-10 — QA / Gate

Required before Founder JUDGE:
- typecheck;
- build;
- smoke contract;
- desktop Journey review;
- iPhone-scale review;
- reduced motion;
- Orca identity / migration truth guard;
- exact SHA;
- inspectable preview URL;
- changed-file list;
- explicit open route/data/rights gaps.

## Current source baseline

- OSPAR Region IV describes Bay of Biscay and Iberian Coast as highly diverse and reports a large variety of marine mammals/cetaceans.
- ICES JCDP provides a cetacean data inventory / download context and must be interpreted under its stated conditions.
- Existing 4PLANET canonical Orca identity remains GBIF `2440483`.

## Immediate execution order

1. Ecosystem Card v01 in Orca Journey — CODED.
2. Contract test + CI.
3. Recover / verify exact ORCA survey route and partner methodology fields.
4. Shared ATLAS Bay of Biscay context.
5. Five source-grounded Species Cards.
6. Habitat and survey-effort grammar.
7. Living Systems relationships / pressures with source review.
8. Cross-transfer into Amazonia ecosystem implementation.
9. Founder inspectable Gold review.
