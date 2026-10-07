# ATLAS → CLAUDE HANDOFF — LIVE RED TEAM + NEXT QUALITY PASS
Date: 2026-10-07
Scope: ATLAS only
Founder intent: continue from the actual LIVE product. Do not restart, fork the product architecture, or rebuild from concept.

## LIVE FACTS

Public domain: https://4planetatlas.com
Cloudflare Pages project: `4planet-atlas`
DNS: `4planetatlas.com CNAME 4planet-atlas.pages.dev` (proxied)
Domain state at release verification: `active`
Dedicated production deployment verified before domain transfer: `https://d0474041.4planet-atlas.pages.dev`
Deployment commit metadata: `f4914a469ccc032b5d7b0063817a83aa7b4fa48e`

The standalone ATLAS domain was deliberately removed from the shared `4planet-05` Pages project. Do not move it back or deploy unrelated 4PLANET surfaces through the ATLAS project.

## WHAT AXE CHANGED

1. MOBILE SURFACE AUTHORITY
- Search, Context, Layers, NOW/WATCH and My Atlas are treated as mutually exclusive primary mobile work surfaces.
- Competing controls are suppressed while one surface owns the viewport.
- My Atlas and TIME explicitly close each other.
- Mobile sheets use rounded, compact controls rather than large rectangular chrome.

2. MOBILE VIEWPORT
- `.world` uses dynamic viewport units with fallback.
- MapLibre receives resize reconciliation on window/orientation/VisualViewport changes and after ATLAS surface transitions.
- This was added specifically to address Safari/mobile map clipping after browser chrome, keyboard or sheet changes.

3. SEARCH
- Removed the body-wide MutationObserver search sidecar from the mounted ATLAS runtime.
- Data-layer intent is integrated directly into the existing React search path.
- Taxon results are de-duplicated by scientific identity.
- Search owns the mobile viewport while active.
- Existing seeded-place/source truth boundaries remain.

4. PERFORMANCE
- Removed the one-second whole-ATLAS clock rerender.
- TIME moved from sub-second polling to MapLibre events and no longer listens to tile-level `sourcedata` churn.
- Live-evidence fallback polling reduced from 900 ms to 15 s.
- Zoom Stack no longer does work on source/tile churn.
- Mobile MapLibre tile cache/fade cost reduced.
- EONET/USGS shared signal pool now loads on demand: NOW/WATCH or an explicit place/coordinate question earns the work.
- Principle: NO INVISIBLE WORK.

5. TRUTH / SEMANTICS
- Query-derived source results no longer present generic `LIVE` as if the world state itself were live.
- UI distinguishes RECORDS / RECENT RECORDS / SOURCE RECORD where implemented.
- Nearby coordinate signal radius is zoom-sensitive rather than presented as a fixed 400 km truth.
- Source unavailable remains distinct from zero records.

6. MY ATLAS / 4PLANET ID
- Anonymous ATLAS remains local-first.
- Signed-in users can sync follows and saved views through existing 4PLANET ID / Supabase authority.
- User-owned table: `public.four_planet_atlas_state`.
- RLS restricts rows to `auth.uid()`; anonymous DB access is revoked.
- Existing local follows/saved views merge into account state.
- Do not build a second identity system or second personal data store.

7. WEBGL SUPPORT
- Capability preflight now asks only whether a standard WebGL context can be created. It no longer treats a reported major-performance caveat as equivalent to no WebGL.
- Runtime performance is controlled separately.

## IMPORTANT: WHAT IS NOT YET PROVEN / COMPLETE

1. REAL IPHONE SAFARI HUMAN QA
The synthetic mobile checks passed before release, but Founder should re-test the actual live product on iPhone. Specifically verify:
- no map clipping
- keyboard/search layout
- closing Search returns a fully interactive full-height map
- Layers opens/closes without stealing map height
- My Atlas sheet
- NOW/WATCH ownership
- pan/zoom smoothness after repeated open/close cycles

If real-device evidence contradicts automation, the real device wins.

2. SEAMLESS CROSS-DOMAIN SSO
The shared 4PLANET ID bridge exists and `4planetatlas.com` is a trusted host. ATLAS now syncs My Atlas when a session exists on the ATLAS origin and exposes 4PLANET ID sign-in/account actions.
Do NOT claim that manually visiting `4planetatlas.com` is already guaranteed to silently inherit a session held only in `4planet.org` origin storage. Audit the actual bridge/navigation flow before improving it. No cookie/iframe hacks.

3. WEATHER / UNIVERSAL TIME / COMPARE
Not part of this closure. Do not add them before the current live mobile experience is red-teamed and stable.

4. PERFORMANCE
Current work removes obvious recurring waste; it is not proof that every source/layer is optimally viewport-bounded, cached or cancelled. Profile first. Do not make speculative rewrites.

## CLAUDE MISSION

RED TEAM THE ACTUAL LIVE ATLAS, THEN IMPROVE IT IN PLACE.

Required sequence:
1. Read current `king/test` and this handoff.
2. Inspect actual live `4planetatlas.com`.
3. Reproduce the core mobile journeys at 390×844 and 430×932.
4. Audit runtime work: requests, main-thread churn, MapLibre events, hidden surfaces, duplicate fetches, stale async results.
5. Audit human UX: map-first hierarchy, one-surface authority, rounded controls, search keyboard state, context readability, NOW/WATCH/My Atlas.
6. Audit truth semantics and source states.
7. Audit cross-domain 4PLANET ID handoff without inventing new auth.
8. Fix only problems you can prove.
9. Preserve existing ATLAS data/source capability and camera/embed journeys.
10. Build, test, and provide exact evidence. Do not call LIVE unless the canonical release path has actually published it.

## NORTH STAR

Earth first.
Search should feel immediate.
One mobile task at a time.
No invisible work.
No false live-ness.
Depth only when requested.
A user should be able to open ATLAS, explore, search, inspect, follow/save and return without fighting the interface.

## DO NOT

- do not create a second map engine
- do not create a second auth system
- do not create a second Brain/truth store
- do not restart ATLAS from a new design concept
- do not add data sources merely to increase source count
- do not remove working data capability to make QA easier
- do not touch FOOD, 4NATION or unrelated products
- do not move `4planetatlas.com` back to the shared `4planet-05` project
- do not deploy unrelated product surfaces through `4planet-atlas`

## FIRST DELIVERABLE

Return a short evidence-led table:
`ISSUE | LIVE EVIDENCE | ROOT CAUSE | FIX | PERFORMANCE/UX EFFECT | REGRESSION RISK`

Then execute the highest-value safe fixes in place.
