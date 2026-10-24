# ROMA ITERATION 37 — GATED DEPLOYMENT, NOT LIVE

24 October 2026 — founder expressly requested LIVE. This branch is approved ONLY for publication of the existing verified Challenger 12 as a transparent temporary /rome/ fallback, while retaining all original builds. This branch contains **no Iteration 37 game assets** and must not be described as having published them. The exact Iteration 37 binary remains blocked pending the 240 required tiles.

## Source evidence
- Founder-provided `HANDOFF TO GPT AXE 6.md` states Iteration 37 exists in Claude's workspace, but does **not** include its `publish/web/index.html` nor the directory `public/tiles`.
- Founder-provided `ROMA_AXE_NEW_CC0_ASSET_DISCOVERY_2026-10-24(1).zip` is an asset research package only: 25 source candidates, no external GLB originals and no playable HTML.
- The branch's fallback `site/rome/index.html` simply redirects to independently preserved, previously available Challenger 12. The homepage's primary "Featured build" now uses `/rome/` as a stable entry without claiming V37 is live.
- Legacy playable routes **must remain**: `/roma/` (original Cannae), `/roma/challenger-08/`, `/roma/challenger-12/`, plus all other games.

## Mandatory exact release artifact
1. Claude's actual `ROMA_CHALLENGER_01 [Iteration 37].zip` with `publish/web/index.html`, all `public/tiles` images and preferably `src/`, `tests/`, `package.json`, `QA_EVIDENCE.md`, `LICENSES`.
2. Verify ZIP file list, unique path safety, every file SHA-256, required assets, no broken or forbidden external dependencies.
3. Enumerate 12×20 (240) exact images and their location convention `rRcC.jpg`. Iter37 claims native 1320×1220 JPG tiles, ~40 MB. DO NOT substitute the earlier 1024×946 25.6 MB tiles. Verify all image dimensions, dates and image hashes.
4. Discover actual runtime URL paths for fetches (root `/tiles/`, relative `tiles/` etc) and publish at the same correctly rooted URLs under `/rome/`, preserving normal URL operation. No `file://` testing for CORS-restricted images; use HTTPS origin.
5. Verify license chain for every binary (including Quaternius UAL/UBC, NASA public imagery, fonts, sounds), no asset claims from candidate pages alone.
6. Test same-origin load, 404 count zero, title screen, campaign 240 tile fetch/hydration, zoom>0.85, army drag-march, city entry, camp battle, 150s camp timer, victory -> return -> save/reload and two versions side-by-side with no storage collision.
7. Real iPhone Safari cold cache at multiple quality presets: FPS 30 target; track shader compile, 40 MB tile transfer, memory growth, pixel black/NaN and controller hit size. A Google Chrome headless test DOES NOT replace device signoff.
8. Check source metadata and activate home + product page primary links to actual V37 only **after** successful preview validation. Keep rollback exact reference `cub-roma-republic-v12-release-20261023`.
9. Confirm worker/dns owner and routes for BOTH singular `lab.p4nther.com` and plural `labs.p4nther.com`. The Cloudflare pipeline explicitly historically attached singular `lab.`; plural hostname was checked conditionally, but cannot be assumed live. Do not override existing DNS/Worker or other public 4PLANET domains.
10. The older Cloudflare workflow `.github/workflows/cub-roma-republic-v12-release.yml` checks exact original Cannae hash and rebuilds multiple MEDIEVAL game outputs. Do not bypass hashes or remove unrelated build steps to force a new ROMA deploy. Use targeted isolated release with tested checks, promotion and rollback.
11. Preserve original Cannae and all previously public CUB products; no production deployment from this staging branch until validation.

## Red-team P0
- Missing final executable and images = hard release blocker.
- Old URL `lab.p4nther.com` and user's requested plural `labs.p4nther.com` must be distinguished.
- Release file size jumps from v12 ~5.8 MB to v37 ~40 MB additional tiles; monitor cellular and weak devices.
- Handoff reports 8/8 node unit tests, e2e campaign_ui/return_shot and HTTP tile checks, **not** real physical device FPS acceptance for v37.
- Asset discovery ZIP adds ZERO license-audited imported GLBs; do not incorporate its candidates as shipped improvements.

## Build analysis
The overlevering describes product advances (province/empire, real geography, permanent settlements, diplomacy, tactics, iPhone improvements), but does not permit code-level source audit of iteration37 itself. Remaining target order: test real iPhone performance and tile memory; player onboarding and objective comprehension; strategic AI and snowball economy; save fidelity between campaign and city; historically credible army/character readability; city atmosphere; conversion readiness and version telemetry. All require the actual source and browser/device verification to graduate from risks to confirmed defects.

Zero new spend. Founder permitted scoped production once exact game source validated; no other domain, product, or game changed.