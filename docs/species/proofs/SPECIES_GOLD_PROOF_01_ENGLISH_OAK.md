# SPECIES GOLD proof 01 — English oak (*Quercus robur*)

Date: 2026-10-10
Schema: `4PLANET_SPECIES_PAGE_01`
Template target: SPECIES v52 (single universal template; plant profile).

## What was actually produced

- `english-oak.json` is a new, separately sourced species file, not a copy of Orca.
- All facts, hooks, story chapters, glance items, highlights and measurements carry evidence states and source links.
- `pageModel.ts` v51 validation run against this file: **PASS / zero issues**. The schema is unchanged in v52.
- `provenance.review` remains **DRAFT**. Schema validity is not human-reviewed scientific accuracy.
- There are three photograph references. The file-level licences were checked on Wikimedia Commons: AnRo0002 (CC0), MPF (CC BY-SA 3.0) and 4nuc (CC BY-SA 3.0).

## Editorial authorities used

1. Kew POWO: https://powo.science.kew.org/taxon/304293-2
2. Kew common oak: https://www.kew.org/plants/oak-tree
3. Woodland Trust species account: https://www.woodlandtrust.org.uk/trees-woods-and-wildlife/british-trees/a-z-of-british-trees/english-oak
4. Woodland Trust oak ecology: https://www.woodlandtrust.org.uk/trees-woods-and-wildlife/british-trees/oak-tree-wildlife/

## Image licence pages

- https://commons.wikimedia.org/wiki/File:20140410Quercus_robur.jpg
- https://commons.wikimedia.org/wiki/File:Quercus_robur.jpg
- https://commons.wikimedia.org/wiki/File:Quercus_robur_-_leaves.jpg

## Scope and caveats

- This evidence does not prove production browser rendering, image HTTP availability, or 4PLANET ID callbacks on a new public route.
- AppDeploy blocked new deployments until 2026-10-11 00:00Z due to its account credits. Orca live was not modified.
- The last published standalone v52 runtime still has an Orca-specific preview-media adapter. That adapter must become species-aware before English oak is exposed there, to prevent Orca photos appearing on an oak page.
- The plant profile must be verified on desktop and mobile, and the actual relative species and GBIF map results should be checked before public promotion.
- The new species goes into the **existing SPECIES data contract**, not a new database or template fork.

## Next release step

Merge `public/species-data/v1/english-oak.json` into the canonical v52 runtime after replacing the Orca-only media adapter with proper species-aware open media resolution; QA /oak and retain /orca unchanged. Keep noindex until sources/photos are reviewed.