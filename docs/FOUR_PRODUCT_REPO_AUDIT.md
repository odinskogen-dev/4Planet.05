# 4PLANET FOUR-PRODUCT REPOSITORY AUDIT

Status: VERIFIED PARTIAL AUDIT / ACTIVE BUILD CONTROL
As of: 2026-07-21
Branch: `build/four-product-integrated-prototype`
Founder: Odin Oddekalv
Programme control: GPT

## 1. Verified technical baseline

- Repository: `odinskogen-dev/4Planet.05`
- Default branch: `main`
- Current public build identifies itself as `40.0.0-experiment`.
- Framework: React 18 + TypeScript + Vite.
- Router: React Router 6.
- Map engine: MapLibre GL 5.
- Package manager is not yet formally verified from lockfile, but package scripts are npm-compatible.
- Deployment is a static single-page application with Cloudflare-style redirect rules in `public/_redirects`.

### Verified scripts

- `npm run dev`
- `npm run build` → `tsc -b && vite build`
- `npm run typecheck`
- `npm run assets:verify`
- `npm run lint`
- `npm run test:smoke`
- `npm run test:e2e`

## 2. Verified public route map

### Current top-level routes

- `/` → persistent Earth/World interface (`src/earth/World.tsx`)
- `/story` → editorial 4PLANET home
- `/domains`
- `/domains/:key`
- `/missions`
- `/missions/:slug`
- `/atlas` → dedicated Atlas page
- `/impact`
- `/impact/:slug`
- `/people`
- `/brands`
- `/partners`
- `/funders`
- `/living-systems`
- `/reports`
- `/about`
- `/stories`
- `/stories/:slug`
- `/privacy`
- `/culture/film`
- `/culture/telier`
- `/culture/play`

### Current route assessment

KEEP:
- persistent Earth as `/`
- `/atlas`
- `/impact`
- `/living-systems`
- editorial/domain/mission/story routes
- legacy redirects that prevent broken links

REPAIR:
- add `/species`
- add `/species/:id`
- add explicit `/impact/tree`
- add explicit `/impact/plastic`
- establish one shared product switcher for 4PLANET / ATLAS / SPECIES / IMPACT
- remove conceptual ambiguity between `/`, `/story` and `/atlas` without deleting existing work

DO NOT ADD IN THIS BUILD:
- LENS
- global DECISIONS ingestion
- full authentication
- production payment/impact claims

## 3. World / Atlas implementation

`src/earth/World.tsx` is the current persistent planetary interface.

Verified capabilities:
- MapLibre globe/mercator projection
- OpenFreeMap Liberty vector basemap
- raster/scientific overlay registry
- search across taxa, places and Living Systems
- shared context layer
- local-first follows
- NOW and WATCH lenses
- source failure handling
- canonical entity IDs
- context-aware camera focus and recenter
- explicit interaction settings and resize handling

### P0 map regression

The build initializes MapLibre with the OpenFreeMap Liberty vector style, then switches the projection to `globe`. In the deployed build, place labels appear mirrored or otherwise visible through the rear hemisphere.

Most likely cause:
- vector `symbol` layers are not being acceptably occluded on the globe projection in the current MapLibre/style combination.

Prototype-safe correction order:

1. Keep globe as the default planetary interface.
2. On globe projection, hide basemap symbol layers while preserving physical vector geometry and 4PLANET data overlays.
3. On mercator projection, restore symbol layers.
4. If symbol-layer toggling is not reliable, use the existing raster basemap for globe and OpenFreeMap vector style only for mercator.
5. Add behavioural regression tests for context-open drag/zoom and projection switching.

Tracked in GitHub issue #3.

## 4. Verified typed intelligence core

`src/planet/*` is the strict typed core and must remain the authority for shared contracts.

Verified concepts from current V39/V40 implementation:
- canonical IDs and entity typing
- places and bounding-box truth semantics
- taxa connectors and occurrence provenance
- Living Systems graph
- pressures and solutions
- missions
- signal pool
- observation/signal separation
- local-first follows
- WATCH match explanations
- source-unavailable states

### Truth contracts that must be preserved

- Observation is not Signal.
- Source failure is not zero records.
- A bounding box is not a real place boundary.
- Founder direction is not scientific review.
- Provider/source claims remain attributed to the provider/source.
- Unknown entity types must not silently become coordinates.

## 5. Four-product target architecture

### 4PLANET
Purpose: explain and connect the complete system.

### ATLAS
Purpose: spatial intelligence — where and what is happening.

### SPECIES
Purpose: canonical life profiles connected to place, Living Systems, pressures, solutions and action.

### IMPACT
Purpose: contribution, delivery, proof and Personal Impact Records.

### Shared infrastructure

- canonical IDs
- shared search
- shared context model
- shared source/provenance states
- Living Systems
- provider-agnostic Impact contracts

## 6. Minimum understanding core

Required before prototype acceptance:

- three connected Species profiles
- one marine/orca chain
- one pollination/food or forest/climate chain
- reusable Issue surface
- reusable Solution surface
- WATCH MVP preserving truth semantics
- NEWS MVP that is explicitly curated/prototype-level

Tracked in GitHub issue #6.

## 7. Impact architecture

Locked sequence:

`Impact Unit → Contribution → Provider Adapter → Provider Delivery Record → Normalised Delivery → Proof → Personal Impact Record`

First journeys:

1. CLIM4TE / Tree Unit
2. CLE4N / Plastic Unit

Prototype law:

`TEST RECORD — NO PHYSICAL DELIVERY`

Contribution, Delivery, Outcome and System Impact must remain separate.

Tracked in GitHub issue #5.

## 8. Keep / repair / remove matrix

### KEEP

- V39 truth-hardening contracts
- `src/planet/*` typed core
- Earth/World persistent interface
- Atlas overlay machinery
- canonical search model
- context surface
- WATCH local-first model
- current editorial/domain/mission content
- current asset system

### REPAIR

- globe symbol rendering
- four-product navigation
- explicit Species routes and product surface
- explicit Tree and Plastic prototype journeys
- provider-agnostic Impact record model
- Personal Impact Record and share cards
- mobile/desktop product cohesion
- build/test evidence on the sprint branch

### REMOVE OR DEFER

- competing product shells
- duplicate backend/data contracts
- unsupported production impact claims
- forced Oslofjorden → Tree/Plastic action links
- global completeness
- full auth/payment scope
- LENS and global DECISIONS scope

## 9. Active implementation sequence

1. Fix P0 globe labels and confirm context-open interaction.
2. Establish shared four-product shell and routes.
3. Add Species index/profile surfaces using existing canonical contracts.
4. Complete minimum understanding chains and Issue/Solution links.
5. Implement provider-agnostic Impact contracts.
6. Implement Tree and Plastic fixture/test adapters.
7. Add Personal Impact Record and test share cards.
8. Integrate products and journeys.
9. Run typecheck, build, smoke and E2E tests.
10. Produce deploy candidate.
11. GPT audit.
12. Odin final judgement.

## 10. Risks

- MapLibre globe symbol behaviour may require raster fallback on globe.
- Existing `World.tsx` is large imperative glue and carries `@ts-nocheck`; changes require behavioural tests.
- Git history is shallow and commit names are generic.
- GoodAPI production details/credentials are not yet available; use contract-compatible fixtures first.
- Product breadth can expand beyond prototype scope; acceptance gates must remain strict.

## 11. Current delivery state

VERIFIED DELIVERY:
- authoritative branch exists
- master execution order exists
- route and stack baseline verified
- P0 map defect isolated to a concrete implementation area
- four-product route target locked
- Impact semantics locked
- minimum understanding scope locked
- implementation issues #3–#6 created
- this audit committed to the sprint branch

NOT YET VERIFIED DELIVERY:
- local install/typecheck/build results on sprint branch
- P0 map code fix
- shared shell code
- Species product code
- Impact adapter code
- integrated deploy candidate

## 12. Implementation recovery evidence — 2026-07-22

Status: AGENT-REPORTED LOCAL IMPLEMENTATION CANDIDATE / EXTERNAL RUNTIME GATES OPEN

Implementation commit: `a404b24` (`feat: build integrated four-product prototype`)

Documented delivery:

- one shared product switcher for 4PLANET, ATLAS, SPECIES and IMPACT; canonical `entity`, `journey` and `record` context is retained in product links
- ATLAS and `/` use the same World implementation; globe mode disables duplicated world copies and third-party symbol layers, while flat mode restores their original visibility
- Orca, Humpback Whale and Western Honey Bee use accepted GBIF keys `2440483`, `5220086` and `1341976`; the earlier Humpback/Blue Whale identity collision is corrected
- Source Record, Observation, Signal, Interpretation, Contribution, Delivery, Outcome and Impact remain separate typed and SQL records
- an exact, attributed GBIF Orca occurrence (`5939349319`) is bundled as a fixture; no Signal is created from it
- PostGIS migration, seed and bounded down migration are included; RLS enables public-safe reads and exposes no public write policy for contribution/delivery/outcome/impact records
- local WATCH is connected through canonical taxon IDs; ISSUE, SOLUTION and minimal NEWS are labelled seams with review limits
- Tree and Plastic journeys create only local TEST records with `NOT_DELIVERED` and `NOT_ASSESSED` states; no fetch, payment or provider request exists
- local-storage denial produces an explicit error state instead of a false record

Verification run after a strict clean install:

- `npm ci --cache /tmp/4planet-npm-cache`: PASS, 204 packages
- `npm run typecheck`: PASS
- `npm run build`: PASS, Vite 8.1.5, 75 modules; World chunk-size warning remains
- `npm run test:smoke`: PASS, 18/18
- `npm run lint`: PASS with 0 errors and 6 pre-existing unused-directive warnings
- `npm run assets:verify`: PASS, 0 missing; 7 duplicate references and 10 unassigned files reported
- `npm audit`: PASS, 0 vulnerabilities after the Vite/toolchain update
- secret-pattern scan: no secret value found; only the declared `VITE_SUPABASE_ANON_KEY` type name matched
- local static server: HTTP 200 and app root confirmed for `/`, contextual `/atlas`, `/species/orca` and `/impact/test/tree`

Open gates:

- hosted Supabase/PostGIS migration and RLS execution were not run because no staging secret/runtime was supplied; evidence is migration/seed plus static contract tests only
- Playwright has five relevant tests but Chromium is absent; browser download failed in the execution environment, so desktop/mobile behaviour and screenshots remain blocked
- no Cloudflare/Vercel/Netlify credential or automatic preview URL was present before push
- GBIF occurrence rights are `CONDITIONAL` on retained CC BY 4.0 attribution; no new media assets were introduced

This addendum supersedes only the `NOT YET VERIFIED DELIVERY` implementation statements above. It does not promote the candidate to Founder Accepted, Locked Canon or production Impact.
