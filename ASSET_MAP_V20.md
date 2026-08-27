# ASSET_MAP_V20 — image governance

Version: 20.0.0
Rule: images are mapped from **visible pixel content**, never from filenames.
Colour law + FRAME LAW hold. No fake field authority. No image captions (§09).

## Changes this pass
| Slot | v19.1 | v20 | Why |
|------|-------|-----|-----|
| Home · "under pressure" | `frontHero` (storm-from-space / typhoon satellite — reads like a weather map w/ land labels) | `pressureDoc` (documentary **B&W**, no labels) | FIX #1 — remove the chart-looking satellite frame |
| Home · culture anchor | `cultureEditorialPrimary` = neon-city hero, **wrong alt** ("silver fabric") | `cultureAnchor` (human editorial portrait, full colour) | restore a human/culture anchor; fix mislabelled alt |
| neon-city image | primary culture image | demoted to **secondary** 4CULTURE atmosphere | one image must not represent all of culture |

## Interim placeholders (BUILD, but not final — see ASSET_GAPS_V20)
- **`pressure-doc.jpg`** — interim = verified aerial farmland (food hero) desaturated to a true documentary B&W. A real, on-message "human systems pressing on living land" frame with no graphic labels. Swap for a chosen B&W documentary photo when ready (overwrite `/public/assets/brand/pressure-doc.jpg` + `-mobile`).
- **`culture-anchor.jpg`** — interim = verified editorial portrait (f4shion). FINAL intended = the **sunglasses portrait**. Deliberately did NOT reuse `4play/hero.jpg` (that is the diver portrait of Odin, which must stay unused). Swap by overwriting `/public/assets/brand/culture-anchor.jpg`.

## Verified library heroes (unchanged, correct-world)
OCE4N→whale · E4RTH→forest valley · S4PIENS→container port dusk · 4CULTURE→neon city (atmosphere).
Mission heroes verified in v19.1 asset-truth pass; not re-touched here.

## Drive (new library, 2026-07-01) — NOT yet ingested
~70 new frames in the shared Drive folder (Unsplash nature, OceanImageBank, NASA Artemis/Orion, film scans, own DSCF/R1 photos). Not pulled into this build: fetching full-res via the connector would flood context, and semantic (pixel) verification of each is required before mapping. Ingest is a dedicated pass — see ASSET_GAPS_V20.
