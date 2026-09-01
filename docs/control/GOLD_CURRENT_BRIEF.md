# CURRENT GOLD BRIEF

This file is the machine-readable human contract for the **current bounded TEST KING change**. Historical briefs belong in issue/PR evidence; this file always reflects the current mutation.

**CHANGE ID:** TEST-KING-ATLAS-RETURN-CAMERA-STALE-MAP-01
**STATUS:** TEST / IMPLEMENTED + BROWSER-ACCEPTED / FOUNDER RELEASE NOT IMPLIED
**BASE AUTHORITY:** `king/test` / exact parent `974e422320d6b8ce5629ddc4d0d98ecd5163d90d`
**ROLLBACK BASE:** `974e422320d6b8ce5629ddc4d0d98ecd5163d90d`
**IMPLEMENTED CANDIDATE:** `5d40e8c93476c6addfa349363957384e4de3d254` — `fix(atlas): ignore stale map during return camera restore`
**PRODUCT PROOF:** Browser Product Proof #1273 PASS; ONE INTERFACE Convergence Gate #2395 PASS on the implemented candidate.
**CONTROL DEFECT BEING CLOSED:** GOLD policy run 33422638609 correctly failed because the user-facing ATLAS mutation did not update this brief in the same bounded change. This brief repairs that control evidence only; it does not alter product behaviour or imply LIVE release.

## USER ARRIVES BECAUSE
They move between 4PLANET product surfaces and return to ATLAS expecting the globe/map camera to restore reliably rather than bind to an already-unmounted previous map instance.

## ONE THING TO UNDERSTAND
ATLAS return-camera authority must attach only to the currently mounted map/canvas. A stale global map reference from a previous ATLAS instance is not valid authority.

## PRIMARY ACTION
Navigate into another product surface and return to ATLAS; the current ATLAS map should mount and restore its bounded return camera normally.

## SECONDARY DEPTH
The fix hardens cross-product map lifecycle authority only. It does not broaden ATLAS scope, add new data, change ecological claims or redefine navigation.

## P1 DOMINANT
The current ATLAS map remains the visible, interactive spatial surface.

## P2 ORIENTATION
Cross-product navigation may temporarily leave `window.__4planet_map` pointing at the previous unmounted map until the new World publishes the current instance.

## P3 ACTION / NEXT
Return-camera authority waits for the current connected canvas, attaches event listeners there, restores the camera, and releases authority when the user intentionally interacts.

## P4 DEPTH
This is lifecycle/authority hardening. It does not change ecological claims, source semantics, map data, routes, visual hierarchy or LIVE state.

## WHAT CAN BE REMOVED
No product capability needs removal. Detached previous canvases and stale global map references must simply be rejected as current authority; no second authority or fallback renderer is introduced.

## WHAT MUST BE REUSED
The existing `AtlasReturnCameraAuthority`, existing `window.__4planet_map` publication path, existing World/ATLAS renderer, existing camera restore/release behaviour and existing ONE INTERFACE route structure.

## CLEAN-ROOM / DONOR DECISION
- **ADOPT:** the accepted `5d40e8c` connected-canvas guard and one-frame retry while a stale/detached map reference exists.
- **REUSE:** existing map authority, restore events, responsive settling and user-interaction release semantics.
- **REJECT:** binding listeners to a detached canvas, adding a second map authority, changing renderer/runtime dependencies, creating a new route or introducing parallel ATLAS state.
- **DEFER:** broader ATLAS lifecycle refactors unless a separately reproduced defect proves they are necessary.

## TRUTH BOUNDARY
A global map reference is only accepted when its canvas is connected to the current document. A detached previous canvas is treated as stale and ignored until the current ATLAS map is available. This behavioural guard is not evidence of broader map correctness, ecological truth, production deployment or LIVE release.

## PERFORMANCE
No new dependency or renderer. The guard adds only a bounded `getCanvas()` connectivity check and `requestAnimationFrame` retry while the current map has not yet been published.

## MOBILE-FIRST RISK
The same lifecycle race can occur across viewport sizes because it is caused by mount/unmount timing, not desktop-only layout. The fix must preserve touch/pointer/wheel release listeners on the current canvas and must not create a mobile-specific map authority.

## HUMAN SUCCESS
A user can leave ATLAS, use another 4PLANET surface and return without the return-camera controller attaching to the previously unmounted ATLAS canvas or preventing the current map from restoring correctly.

## ACCEPTANCE
1. `king/test` lineage remains single-authority and LIVE remains untouched. 2. Return-camera authority does not bind to a candidate map whose canvas is detached. 3. It retries until the current map is published rather than creating parallel state. 4. Current canvas is captured once accepted and receives the existing pointer/touch/wheel release listeners. 5. Existing restore events remain intact. 6. Browser Product Proof remains PASS. 7. ONE INTERFACE Convergence remains PASS. 8. GOLD policy accepts the bounded mutation + current brief pair. 9. No new dependency, route, map renderer or ecological claim is introduced. 10. Founder JUDGE/RELEASE and LIVE remain separate gates.
