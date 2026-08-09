# 4PLANET_ DECISION INTELLIGENCE FOR A LIVING PLANET — RUNTIME PROOF v1.0

**Status:** Internal execution candidate. No merge, production deployment, public release or automated-decision authority.

## Implemented runtime surface

Decision Intelligence is implemented as a derived TypeScript capability over the founder-approved BRAIN/PSI contracts. It does not add a parallel database or durable Decision object.

Implemented read/runtime surfaces:

- `resolveQuestion(question, actorType)`
- `getDecisionPack(packId)`
- `compareOptions(packId, lensId)`
- `getEvidence(packId)`
- `getPlaceContext(packId)`
- `getGaps(packId)`
- Living Systems progressive-disclosure projection

The v1 resolver is intentionally bounded to Pollination→Food. A non-pollination question returns `NOT_FOUND`; a request for a universal single best option returns `INSUFFICIENT_EVIDENCE`.

## Four implemented Pollination scenarios

1. **Land manager / farm** — compare habitat, threshold IPM and pesticide-risk options without assuming yield gains.
2. **Municipality / Place** — consider flower-rich habitat, mowing changes and monitoring while keeping national policy and transferred studies separate from local ecological outcomes.
3. **Funder / foundation** — identify evidence-generation gaps without converting them into investment/grant recommendations.
4. **4PLANET internal** — identify legitimate intelligence/provenance/Place/measurement capability work without claiming field implementation or partnership.

## Evaluation

The deterministic Decision Intelligence evaluation suite contains **28 questions** across researcher, land manager, municipality, funder, company, citizen, public institution and 4PLANET-internal users.

Expected behaviours include `ANSWER`, `QUALIFY`, `REFUSE` and `UNKNOWN`.

Local deterministic result before repository CI: **28/28 PASS**.

Critical refusal/qualification cases include:

- universal “best intervention”;
- “best project to fund globally”;
- policy existence interpreted as ecological outcome;
- implementation interpreted as outcome;
- transferred European evidence presented as measured Oslo evidence;
- non-pollination query on a bounded Pollination v1 runtime.

Repository CI independently compiles and executes the suite and also re-runs inherited Phase05 PostgreSQL/PostGIS BRAIN and Context Pack truth gates.

## LENS_SENSITIVITY_V1

Eight declared lenses are implemented:

- Living Planet
- Human Wellbeing
- Systemic Risk
- Irreversibility
- Implementation Feasibility
- Capital Efficiency
- Evidence Confidence
- 4PLANET Strategic Role

There is **no aggregate score** and no hidden weight vector. Comparison is pairwise across declared priority dimensions and returns only:

`DOMINATES · DOMINATED · TRADE_OFF · TIE_OR_INDETERMINATE · INSUFFICIENT_EVIDENCE`

“Dominates” means no worse on the jointly known priority dimensions represented under that lens. It is not a recommendation.

## Living Systems proof

A bounded route is implemented under the existing Living Systems surface:

`/living-systems/decision/pollination`

The Living Systems entry page links to the internal proof. The proof provides:

`QUESTION → WHY IT MATTERS → DRIVERS → OPTIONS → EXPLICIT DIMENSIONS → EVIDENCE/CONFLICT → PLACE/EVIDENCE SCOPE → GAPS → POSSIBLE NEXT ACTION`

It displays four actor scenarios and explicitly states:

- contextual Decision Pack v1;
- not independently expert validated;
- Source Registry pointer ≠ immutable Source Record;
- no universal ranking;
- no automated decision;
- no agronomic/funding recommendation;
- no production/public-release implication.

## Source Record recovery

The existing Phase05 queue contains **312 Claim→Source Registry links across 35 source identities**.

All 35 source identities have been recovered, including legacy source IDs `SRC-0009`, `SRC-0012`, `SRC-0013` and `SRC-0027` from the earlier PSI Source Registry.

Current classification:

- `312 SOURCE_AVAILABLE_RECORD_NOT_CAPTURED`
- `0 RESOLVED immutable Source Records in this sprint environment`

This is a precise provenance classification, not claim-evidence completion.

Required resolution sequence:

1. capture immutable Source Record with retrieval timestamp and rights metadata;
2. resolve claim-specific evidence location/section where feasible;
3. adjudicate `SUPPORTS / QUALIFIES / CHALLENGES` at claim level;
4. only then create `claim_evidence`.

## Full private-corpus physical ingest boundary

The 8,952-record private Phase05 package is deliberately absent from the public product repository and GitHub Actions environment.

Therefore the following are **not claimed** in this sprint:

- full private-corpus PostgreSQL staging write;
- full-corpus physical rerun/idempotency counts;
- all 50 legacy PSI benchmark cases executed against a physically staged private corpus.

The staging loader and manifest are already prepared. The remaining external requirement is a secure private package mount plus isolated staging Postgres/Supabase credentials. The loader must never auto-promote.

## Human↔Nature reuse

The same Decision Pack contract maps structurally to the existing seven proof chains:

- Pollination → Food — Decision Pack implemented;
- Soil → Food — structural reuse ready, decision-depth open;
- Freshwater → Human wellbeing — structural reuse ready, decision-depth open;
- Forests → Climate / water / livelihoods — structural reuse ready, decision-depth open;
- Wetlands → flood/coastal protection — structural reuse ready, decision-depth open;
- Coral → fisheries/coastal systems — structural reuse ready, decision-depth open;
- Air pollution → human health — structural reuse ready, decision-depth open.

This proves architectural reuse, not seven decision-grade evidence verticals.

## Positioning recommendation

For now, **Decision Intelligence for a Living Planet** should be used as:

1. strategic north-star capability language;
2. internal product/architecture language;
3. selective institutional/funder explanation of where 4PLANET is heading.

It should **not yet** become:

- a fifth core product;
- a replacement for Living Systems or IMPACT;
- a silent change to the public 4PLANET category/brand canon.

Reassess after full-corpus runtime proof, live product proof and independent human/expert evaluation.
