# CUB Shared Toolchain 02 — Source verification and acceptance

Date: 22 October 2026. Parent project: PRJ-ODIN-003 GAME LAB (ODIN private). No new paid services or public release.

## Current installed game versions checked

| Project title | Verifiable source/source origin | Snapshot or reference | Source handled this sprint |
|---|---|---|---|
| ROMA campaign | AppDeploy staging `roma-the-republic-campaign-01-b2li4t` | `1792681669246` | Inspected and preserved, not altered. Local preview is previous original Challenger source provided in MEDIEVAL archive. |
| MEDIEVAL original Hattin/Belvoir | founder-supplied `MEDIEVAL_KINGDOMS_PREMIUM_BUILD_03(1).zip` | `ROMA_ORIGINAL_READ_ONLY.html` + BUILD03 patches | Both immutable source and generated Build03 HTML taken from original ZIP and verified exactly recoverable. |
| MEDIEVAL MMO alpha | AppDeploy `medieval-kingdoms-mmo-alpha-01-1fx5c6` | `1792681807717` | Source paths surveyed only, not edited. |
| ITALY 1796 | AppDeploy `italy-1796-history-engine-01-yov3nn` | `1791971249851` | Source paths surveyed only, not edited. |
| VILLAINS 02 | AppDeploy `villains-prototype-02-760qkf` | `1792109139205` | Source paths surveyed only, not edited. |
| WILD ORCA | AppDeploy `wild-orca-4planet-k97053` | `1792025560561` | Source paths surveyed only, not edited; separate IP/rights boundary from 4PLANET. |

## Local outcomes

- Node: 21/21 tests PASSED, including 2 real skinned GLB animation geometry/schema tests.
- Asset CLI: 29/29 original/third-party GLB files hash + binary header + licensing data PASSED; all remain NOT PRODUCTION APPROVED.
- Asset outputs: 5 separate AABB 12-triangle collision-only GLB proxies; provenance of derived source retained; no visual simplification implied.
- Scenario factory: 3/3 valid historical envelope / source-labelled reconstructions.
- Browser diagnostic on two untouched-source derived HTML candidates: 2/2 CUB route/terrain/battle contract/save checks and overlay control PASS. **Both underlying native 3D game builds raise headless `Error creating WebGL context` in the constrained Chromium.** Do not conflate this with full game regression testing or validated playable end-to-end battle.
- Source preservation: both previews reversibly differ from their exact source by two append-only diagnostic changes (HTML game data attribute + external-module include); original hashes are recorded in `integrations/proof/SOURCE_PRESERVATION.json`.
- External discovery: 16 candidate providers in original shortlist, no physical new external art downloads. Separate 29 physically checked from research candidates.

## Blocked / not delivered

- True animated unit implementation integrated into ROMA/MEDIEVAL Three.js and GPU instancing.
- Real DEM-based terrain, navmesh and siege integration. `src/siege.js` is 2D path planning only.
- Actual browser GPU performance measurement, real visual LOD, historical map at local resolution, distributed multiplayer.
- Live game package deployment or Claude code merge.

## External tools for *future* integration (not shipped)

- glTF Transform — https://gltf-transform.dev/cli — geometry inspection, simplification and compression; optimise may be destructive on rigged meshes. Version/licence review before use.
- Recast Navigation — https://www.npmjs.com/package/recast-navigation — WebAssembly navmesh for Three.js/PlayCanvas, MIT according to package current listing; not the same as our grid planner.
- Kenney Nature Kit CC0 — https://kenney.nl/assets/nature-kit ; archive contains only 2 existing nature models, not the whole catalogue.