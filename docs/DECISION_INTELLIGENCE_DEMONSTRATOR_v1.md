# 4PLANET_ DECISION INTELLIGENCE FOR A LIVING PLANET — 2–3 MINUTE DEMONSTRATOR v1

**Status:** Internal demonstrator specification grounded in implemented branch functionality. No public release implied.

## The question

> What should a municipality consider if it wants to improve conditions for wild pollinators?

## 00:00–00:25 — Start with the living system

Show Pollination → Food as a dependency, not a generic “bee problem”.

- wild pollinator communities;
- animal-mediated pollination;
- crop pollination / wild-plant reproduction;
- food-system dependency;
- explicit warning that Western Honey Bee is one taxon and not a proxy for all pollinators.

## 00:25–00:50 — What threatens it?

Show habitat simplification and pesticide exposure as evidence-backed pressure families while stating that local attribution is multi-causal and requires local evidence.

The interface should visibly distinguish `SOURCE_REPORTED_CLAIM`, `4PLANET_ASSESSMENT` and `UNKNOWN`.

## 00:50–01:25 — What may help?

Display municipality options without ranking:

- flower-rich public greenspace / roadside habitat;
- delayed/phased mowing with refuges;
- baseline + repeat pollinator/habitat monitoring.

For each option expose at least:

- problem relevance;
- effectiveness-evidence state;
- implementation maturity;
- transferability;
- uncertainty;
- trade-offs.

No aggregate score.

## 01:25–01:50 — Evidence and conflict

Show `SUPPORTS`, `QUALIFIES` and `CHALLENGES` as separate evidence directions.

Demonstrate that a study from German cities is transferred evidence for a Norwegian municipality, not local measured evidence.

Demonstrate that monitoring is evidence infrastructure and not an ecological outcome.

## 01:50–02:10 — Where?

Show Place/evidence scope:

`Norway / municipality to be specified · ADMINISTRATIVE_CONTEXT · TRANSFERRED`

Explain:

- Norway's national action plan establishes policy context;
- policy context does not prove ecological improvement;
- no exact municipality outcome is inferred;
- a real local Decision Pack would require the municipality and baseline evidence.

## 02:10–02:30 — What is unknown?

Surface missing local baseline, intervention economics and long-term outcomes instead of hiding them.

## 02:30–02:50 — Possible next action

Output a bounded consideration, not a prescription:

> Consider a locally reviewed portfolio of habitat, mowing/pesticide-risk and monitoring actions with explicit baseline and follow-up measurement.

Then disclose:

`DECISION SUPPORT · NOT AUTOMATED DECISION · NOT EXPERT VALIDATED · NOT LOCAL OUTCOME PREDICTION`

## Why this is materially different

### Versus a search engine
A search engine returns documents. The Decision Pack resolves the decision context and structures options, evidence, conflict, Place, uncertainty and gaps.

### Versus a generic chatbot
A chatbot can synthesise prose. The 4PLANET capability is designed to bind explanation to explicit object identity, provenance state, evidence direction, truth class and decision boundary.

### Versus a static solutions database
A solutions database can say what exists. Decision Intelligence asks what may be relevant **for this actor, objective, Place and constraint**, and shows where evidence does not transfer.

### Versus an opaque recommendation engine
4PLANET does not hide values in one score. `LENS_SENSITIVITY_V1` exposes which dimensions are being prioritised and retains trade-offs/insufficient-evidence states.

## Current implemented product path

`Living Systems → /living-systems/decision/pollination`

The route includes four actor scenarios: Land Manager, Municipality, Funder and 4PLANET.

## Public-release gate

Do not present this demonstrator as production-ready until:

- branch CI is green;
- full private-corpus staged Context Pack execution is completed;
- Source Registry pointers needed for claims are upgraded to legitimate immutable Source Records;
- at least one independent ecological/domain expert has evaluated the substantive decision output;
- founder explicitly releases the product proof.
