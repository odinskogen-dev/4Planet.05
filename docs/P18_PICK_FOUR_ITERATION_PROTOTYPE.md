# P18 PICK_ — four-iteration private prototype checkpoint

Status: FOUNDER-AUTHORISED / PRIVATE REVIEW CANDIDATE / NO PUBLIC RELEASE

Base lineage: `agent/p18-food-03-private-user-validation`
Build branch: `agent/p18-pick-v1`
Primary route: `/labs/food-intelligence/pick`

## Iteration 01 — decision surface
- 4PLANET-branded mobile-first PICK_ surface.
- Reuses existing `/api/food` and canonical FOOD model.
- HEALTH / WALLET / PLANET are separate.
- Missing Wallet and Planet evidence renders UNKNOWN.
- Product composition never becomes an automatic health verdict.

## Iteration 02 — truth spine
- Visible SOURCE → RECORD → FACT → INTERPRETATION chain.
- Source class, directness, freshness, completeness and conflict state.
- Field-level KNOWN / UNKNOWN evidence inspection.
- WHY / BASED ON WHAT is a first-class product surface.

## Iteration 03 — basket
- Local-only household basket.
- Separate data-coverage measures for Health, Wallet and Planet.
- Unknown data is never favourable and cannot improve basket ranking.
- No account or cloud profile.

## Iteration 04 — household action
- Manual household shop-mode checklist.
- Basic need coverage and next-best-action logic.
- Conservative meal patterns based only on marked household basics.
- Local correction notes; no automatic transmission.
- Final responsive/accessibility/brand styling layer.
- Dedicated PICK contract and exact-head QA workflow.

## Truth boundaries
- No universal product score.
- No medical diagnosis or personalised treatment advice.
- No product-specific price claim without a price source.
- No SKU environmental claim without product-appropriate evidence.
- No missing-data advantage.
- Verify allergens against the physical label.

## Next data work
1. Health evidence ontology + category-specific rules.
2. Norwegian price adapter and freshness semantics.
3. Planet proxy/evidence adapter with exact directness labels.
4. Real Kiwi household field test.
