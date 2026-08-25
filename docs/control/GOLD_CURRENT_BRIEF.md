# CURRENT GOLD BRIEF

This file is the machine-readable human contract for the **current bounded TEST KING change**. Historical briefs belong in issue/PR evidence; this file always reflects the current mutation.

**CHANGE ID:** TEST-KING-VITE-REACT-DEPENDENCY-CORRECTION-76  
**STATUS:** TEST / CORRECT + EXACT-HEAD QA  
**BASE AUTHORITY:** `king/test` / PR #131 / issue #133 / ORCA + JAGUAR GOLD CONTINUOUS CONVERGENCE ORDER  
**ACCEPTED ROLLBACK BASE:** `b3541634fbc8dcd366b86691a0eb5cba6effc251` / immutable TEST KING review preserved in Prototype SAFE  
**FOUNDER DIRECTION:** preserve the accepted ORCA/Jaguar baseline and correct every exact-head regression before continuing visual Gold work. LIVE KING/production remains untouched.  
**SINGLE-SEAM RULE:** `king/test` is the only moving integration line. Historical Jaguar/Orca branches are donors only.

## USER ARRIVES BECAUSE
They need the current ORCA/Jaguar TEST KING candidate to build and reach browser acceptance without unrelated package-manifest drift blocking the product proof.

## ONE THING TO UNDERSTAND
The current exact head imports `@vitejs/plugin-react` from `vite.config.ts`, and the lockfile already records the package, but `package.json` no longer declares it. `npm ci` therefore does not install the plugin and `vite build` fails before any ORCA/Jaguar browser QA can run.

## PRIMARY ACTION
Restore the missing declared devDependency so the existing Vite React configuration can build from a clean exact-head install.

## SECONDARY DEPTH
Preserve the accepted ORCA/Jaguar runtime, Bay of Biscay, LUME, participation work, lockfile integrity and all existing QA thresholds.

## P1 DOMINANT
`npm ci` followed by `npm run build` succeeds from the exact TEST KING head with the existing Vite React configuration.

## P2 ORIENTATION
This is dependency-manifest repair only; no Founder-visible product behaviour is changed.

## P3 ACTION / NEXT
Once build is green, continue the full exact-head ORCA/Jaguar Chromium + WebKit acceptance matrix without weakening tests.

## P4 DEPTH
Existing rights, truth, security, performance, donor lineage and Prototype SAFE boundaries remain unchanged.

## CURRENT DEFECT
Exact head `874d681b9df1fb59e4c5bea131595d4585c51973` passes GOLD policy and typecheck but Convergence #2061 fails at production build with `ERR_MODULE_NOT_FOUND: Cannot find package '@vitejs/plugin-react' imported from vite.config.ts`. `vite.config.ts` still imports and calls the plugin. `package-lock.json` already contains `@vitejs/plugin-react` `^6.0.4` in root devDependencies, while `package.json` omits it. This is manifest drift, not an ORCA/Jaguar runtime defect.

## BOUNDED CORRECTION
Add `@vitejs/plugin-react: ^6.0.4` back to `package.json` devDependencies to match the existing lockfile and Vite config. Do not regenerate or broaden dependencies, alter runtime code, change QA timeouts, or touch LIVE.

## WHAT CAN BE REMOVED
The inconsistent state where Vite config and lockfile require the React plugin but the package manifest does not declare it.

## WHAT MUST BE REUSED
`king/test`, PR131, accepted rollback, current `vite.config.ts`, existing `package-lock.json`, ORCA Journey/LUME/Bay of Biscay, Jaguar V52/Jungle/LUME, current QA workflows and thresholds.

## TRUTH BOUNDARY
Build/dependency correction only. No ecological, partner, live-data, rights or product-maturity claim changes.

## PERFORMANCE
No runtime payload or rendering change intended; restore only the build-time React plugin already represented in the lockfile.

## MOBILE-FIRST RISK
None introduced by this bounded dependency repair. Existing 390/430 browser gates remain mandatory after build recovery.

## HUMAN SUCCESS
The exact TEST KING candidate installs cleanly, builds, and reaches the actual ORCA/Jaguar browser proof instead of stopping on missing build tooling.

## ACCEPTANCE
1) Clean `npm ci` + typecheck + production build green. 2) Smoke/contracts/assets/security/truth/tree gates green. 3) ORCA LUME ordinary-click proof passes desktop/390/430. 4) Shared Chromium including ATLAS return remains green. 5) Jaguar V52 Chromium + WebKit desktop/390/430 remains green. 6) Shared WebKit + ORCA WebKit pass. 7) Exact SHA deployment verified before any new ACCEPTED/SAFE version. 8) LIVE KING unchanged.
