# CURRENT GOLD BRIEF

This file is the machine-readable human contract for the **current bounded TEST KING change**. Historical briefs belong in issue/PR evidence; this file always reflects the current mutation.

**CHANGE ID:** ATLAS-MOBILE-RETURN-CAMERA-AUTHORITY-69  
**STATUS:** TEST / CORRECT + EXACT-HEAD QA  
**BASE AUTHORITY:** `king/test` / PR #131 / issue #133 / ORCA + JAGUAR GOLD CONTINUOUS CONVERGENCE ORDER  
**ACCEPTED ROLLBACK BASE:** `b3541634fbc8dcd366b86691a0eb5cba6effc251` / immutable TEST KING review preserved in Prototype SAFE  
**FOUNDER DIRECTION:** preserve the accepted ORCA/Jaguar baseline and correct every exact-head regression before continuing visual Gold work. LIVE KING/production remains untouched.  
**SINGLE-SEAM RULE:** `king/test` is the only moving integration line. Historical Jaguar/Orca branches are donors only.

## USER ARRIVES BECAUSE
They move from ATLAS through SPECIES, Living Systems, WH4LES and Join, then use the visible return control expecting to come back to the exact map camera they created before leaving.

## ONE THING TO UNDERSTAND
An explicit ATLAS return camera in `z + c` is authoritative during reconstruction. MapLibre globe/style/layout initialisation may not silently change that camera before the user takes control again.

## PRIMARY ACTION
Complete the visible ATLAS → SPECIES → Living Systems → WH4LES → Join → ATLAS journey and return to the post-interaction camera on desktop and mobile.

## SECONDARY DEPTH
Preserve the observation record, mode/layers/lens/time/projection state, browser back/forward/reload behaviour and safe return-token handling.

## P1 DOMINANT
The returned live map matches the camera the user actually left, not merely the camera encoded in the URL.

## P2 ORIENTATION
The bundled Orca observation and its truthful source state reopen without a second cinematic refocus.

## P3 ACTION / NEXT
The user can immediately continue panning/zooming after reconstruction; the return-camera authority releases as soon as a genuine user camera gesture begins.

## P4 DEPTH
All cross-product context, source/truth state and route safety remain unchanged.

## CURRENT DEFECT
Exact head `58a387bff0167baa3c83e6ca04affccf118cc9df` passes Browser Product Proof #959, GOLD #772, Public Preview #1007, Human Craft #756, Analytics #345, typecheck, production build, 91/91 contracts, lint, assets and dependency gates. Convergence #1967 isolates the remaining failure in the shared Gate 1 return path: desktop 1440/1280 passes, but Chromium 390 returns with live map zoom 0.48 away from the saved post-interaction zoom and Chromium 430 returns 1.33 away. The URL `z + c` state itself remains correct. The current V68 seam reasserts the camera only at the first `idle`; later globe/style/layout initialisation can still move the live mobile camera before the test/user reads it.

## BOUNDED CORRECTION
Keep ProductContext encoding/decoding, record/entity semantics, map content, ORCA/Jaguar Journeys and all route contracts unchanged. Upgrade the existing ATLAS return-camera seam so explicit `z + c` remains reconstruction authority through MapLibre initialisation events (`style.load`, `load`, `resize`, `idle`) and only writes when live center/zoom has materially drifted. Release the lock permanently on the first genuine user-originated camera movement. Guard programmatic `jumpTo` writes against recursion. No polling and no tolerance relaxation.

## WHAT CAN BE REMOVED
The assumption that one first-idle write is sufficient to protect a mobile globe camera during reconstruction.

## WHAT MUST BE REUSED
`king/test`, PR131, accepted ORCA/Jaguar rollback, current ProductContext contract, `public/atlas-return-camera-lock-v68.js` seam, MapLibre world, bundled Orca record flow, all Journey links and all current truth/source boundaries.

## TRUTH BOUNDARY
Navigation/camera reconstruction only. No ecological, species, occurrence, partner, migration, acoustic or live-data claim changes.

## PERFORMANCE
Event-driven only. No interval/polling loop. Camera is written only when drift exceeds a small numerical epsilon and the reconstruction lock is still active. Once the user touches the camera, all authority writes stop.

## MOBILE-FIRST RISK
390 and 430 must reconstruct the saved zoom and centre after globe/style/layout settling without creating a camera jump loop or preventing immediate user control. Desktop behaviour must remain unchanged.

## HUMAN SUCCESS
A user leaves ATLAS after moving/zooming the map, follows the visible cross-product journey, returns, sees the same place and zoom, and can move the map normally from that exact state.

## ACCEPTANCE
1) Typecheck + production build + smoke/contracts green. 2) Gate 1 Chromium desktop 1440/1280 + 390/430 restores the live camera within existing tolerance without changing the test. 3) WebKit desktop + 390/430 passes the same shared journey. 4) ORCA LUME and Jaguar V52/Jungle regression remain green. 5) Security/truth/assets/tree gates remain green. 6) Exact SHA deployment verified before any new ACCEPTED/SAFE version. 7) LIVE KING unchanged.
