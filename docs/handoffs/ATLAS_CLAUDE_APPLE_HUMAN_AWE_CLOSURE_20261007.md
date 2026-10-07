# AXE → CLAUDE
# ATLAS APPLE-LEVEL HUMAN AWE + PUBLIC READINESS CLOSURE 01

Date: 2026-10-07
Scope: ATLAS only
Repository: odinskogen-dev/4Planet.05
Canonical development authority: current king/test
Public product: https://4planetatlas.com
Dedicated Cloudflare Pages project: 4planet-atlas

This is a production improvement order, not a concept exercise and not permission to rebuild ATLAS from scratch.

---

## 0. FOUNDER INTENT

4PLANET ATLAS should become a product people can discover from Google, open with no prior knowledge, immediately understand, enjoy, explore and want to return to.

The desired feeling is:

EARTH FIRST
→ HUMAN CURIOSITY
→ AWE
→ SIMPLE DISCOVERY
→ USEFUL CONTEXT
→ OPTIONAL DEPTH
→ SAVE / FOLLOW / RETURN

The Founder wants an "Apple-level" product feel.

Interpret that as:
- calm
- legible
- obvious
- polished
- direct
- spatially coherent
- minimal chrome
- excellent motion
- strong hierarchy
- immediate response
- progressive disclosure
- detail only when useful
- visually delightful without decoration for decoration's sake

Do NOT interpret "Apple feel" as generic glassmorphism, fake iOS controls, rounded-everything without purpose, or copying Apple branding.

ATLAS must still feel like 4PLANET:
"A living planet intelligence object."

Primary public promise:
THE LIVING PLANET, EXPLORABLE.

Positioning:
ATLAS is the interface to the living planet.

---

## 1. CURRENT LIVE STATE

ATLAS is now live at:
https://4planetatlas.com

Hosting:
- same canonical 4Planet.05 codebase
- NOT a separate repo
- dedicated Cloudflare Pages deployment target only: 4planet-atlas
- 4planetatlas.com was removed from the shared 4planet-05 Pages project so ATLAS can ship independently without moving 4PLANET, 4BRANDS, 4SAPIEN etc.

Do not move ATLAS back to the shared Pages project.
Do not create a second repo.

Existing live closure already added:
- one primary mobile work surface at a time
- mobile viewport / Safari dynamic viewport repair
- smaller and rounder controls
- mobile Search ownership
- My Atlas bottom-sheet behaviour
- reduced polling and hidden work
- event-driven TIME controls
- reduced MapLibre source churn
- on-demand EONET/USGS signal loading
- taxon search de-duplication
- improved source/time semantics
- 4PLANET ID-backed My Atlas persistence
- more tolerant WebGL capability probe

The live product is improved but is NOT yet the final quality target.

Real human mobile evidence always outranks automation.

---

## 2. PRODUCT CANON — DO NOT BREAK

4PLANET mission:
LIVING PLANET INTELLIGENCE

Public architecture:
- ATLAS = standalone planetary explorer / spatial interface
- SPECIES = life-first library
- LIVING SYSTEMS = guided understanding
- IMPACT = action/proof
- 4PLANET = wider universe

Architecture law:
Separate worlds. Shared infrastructure. Controlled depth.

ATLAS interaction model:
SEE
→ FIND
→ EXPLORE
→ FILTER
→ INSPECT
→ COMPARE
→ FOLLOW

Human journey:
WHERE
→ WHAT IS HERE
→ WHAT IS HAPPENING
→ HOW IS IT CHANGING
→ WHAT LIVES HERE
→ WHAT SHOULD I WATCH
→ EVIDENCE

Do not turn ATLAS into a dashboard.
Do not turn it into a scientific control room.
Do not expose internal taxonomy or source mechanics as the first read.

---

## 3. CRITICAL UX PROBLEM TO SOLVE NOW

The existing context system is still information-first rather than human-first.

Example: selecting a place can immediately produce large black panels containing:
- PLACE / SEEDED
- coordinates
- RECORDS IN THIS MAP AREA
- record counts
- BOUNDING BOX
- DISTINCT NAMES IN SAMPLE
- caveat paragraphs
- RECENT SIGNALS
- source status
- tier controls
- technical labels

This information may be truthful and useful at depth.

It is NOT the correct first experience.

Founder description:
"Alle de sorte place boksene som kommer når man kommer ani kloden med masse unyttig info."

Take this seriously.

Current PLACE code in Context.tsx exposes database/query implementation concepts too early:
- bounding box
- returned record count
- query geometry
- sample distinct names
- source-state jargon

These belong in evidence / source details / deeper inspection, not the first place card.

---

## 4. REQUIRED NEW DESIGN PRINCIPLE: HUMAN AWE FIRST

When someone taps Earth, a place, ocean, country, ecosystem or city, the first response should feel like:
"I am exploring the real planet."

Not:
"I opened a database inspector."

New hierarchy:

### FIRST READ — ~3–5 seconds
Show only what helps a person orient:
- place name
- human place type
- one beautiful contextual line
- current local time
- current weather / conditions when available and source-valid
- a small "what's here / what's happening" preview
- Follow / Save
- one obvious action to explore deeper

Potential example:
OSLOFJORD
A living fjord system between Oslo and the Skagerrak.
9°C · light rain
14:24 local time
Orca and harbour porpoise recorded in the wider region
2 recent signals
[Explore this place]

Do not fabricate exact examples unless source data supports them.

### SECOND READ
Progressively disclose:
- Life
- Weather
- Ocean / Water
- Land
- Atmosphere
- Human activity
- Recent events
- Change over time
- Living Systems
- Watch

### EVIDENCE / SOURCE DEPTH
Only here expose:
- bounding-box caveats
- record count details
- query geometry
- source checked time
- exact provider
- confidence/unknowns
- methodology
- coverage limitations

Truth must remain strict. Hide complexity, never hide uncertainty.

---

## 5. PLACE PORTRAIT — BUILD THE REUSABLE UNIT

Create/reconcile ONE reusable Place Portrait inside the existing Context architecture.

Do not create another parallel context engine.

Recommended Place Portrait model:

1. HERO / ORIENTATION
- Name
- human type
- region / country where known
- subtle coordinates only if useful
- current local time
- weather summary if available
- optional imagery only if rights/source is appropriate
- Save / Follow

2. RIGHT NOW
- weather
- day/night
- recent natural signals
- relevant live/near-live conditions
- explicit timestamp / source freshness

3. LIFE HERE
- human-readable life preview
- meaningful taxa
- observation data
- avoid giant raw record totals as the headline

4. WATER / LAND / ATMOSPHERE
Only relevant modules for the place.

5. CHANGE
- selectable time dimension
- "now vs then" only when source/time semantics are valid

6. WATCH
- what the user can follow
- meaningful future changes

7. SOURCES & EVIDENCE
- exact provider
- query scope
- polygon/bbox caveats
- checked time
- unknowns

Progressive disclosure is mandatory.

---

## 6. WEATHER — NOW HIGH PRIORITY

Weather is now approved as a high-priority ATLAS utility, after stabilising current interaction.

Goal:
A place should immediately feel alive and current.

Requirements:
- point weather for a selected place / coordinate
- source-grounded
- current conditions + useful short forecast
- never call forecast/live interchangeably
- source timestamp visible at evidence depth
- do not make weather load globally when the user has not asked a location question
- lazy / point-based / cached
- fail gracefully
- no hidden background hammering

Preferred source direction already identified:
- MET Norway Locationforecast
- ECMWF Open Data where appropriate

First implementation should be small and correct.
Do not build an entire meteorological platform.

---

## 7. TIME — MAKE IT HUMAN, NOT A CONTROL PANEL

ATLAS needs one contextual time concept.

Goal:
The user should understand:
- what is happening now
- what happened before
- what is forecast
- what is climatology

Canonical time classes:
- OBSERVED
- ANALYSIS
- FORECAST
- HISTORICAL
- CLIMATOLOGY

Reserve LIVE only for genuinely live / near-real-time semantics.

TIME should become:
NOW ← HISTORY | TODAY | FORECAST →

depending on the active source/context.

Do not force every layer into one fake universal date slider if the source does not support it.

The time UI should be calm and contextual.
A user should not need to understand source cadence before using it.

---

## 8. COMPARE — NEXT HIGH-VALUE CAPABILITY

Once TIME is coherent, add a simple first-class compare interaction.

Useful examples:
- today vs previous period
- 2026 vs 2016
- before / after
- water extent then vs now
- ocean condition vs normal
- seasonal ice this year vs baseline

Do not infer causality from visual difference.
Do not pretend incomparable datasets are equivalent.

Compare should feel like direct manipulation, not GIS software.

---

## 9. SEARCH — PUBLIC DISCOVERY QUALITY

Search is one of the first things Google-origin users will try.

Must feel immediate.

Requirements:
- clear single dominant field
- strong keyboard behaviour on iPhone
- no horizontal clipping
- no floating controls over results
- fast feedback
- cancel stale provider queries
- dedupe aliases/synonyms
- rank human places and canonical entities sensibly
- search data layers when relevant
- explicit source failure state
- no fake "no results" when provider unavailable
- seeded place registry must not appear global if it is not global

Test:
Oslo
Oslofjord
Orca
Kenya
Berlin
Manila
forest loss
fires
earthquakes
sea ice
ocean temperature
precipitation
night lights

---

## 10. NOW + WATCH

NOW must answer:
"What is happening on the planet or where I am looking?"

Not:
"Here is a giant unranked feed."

Improve:
- relevance
- geography
- hierarchy
- event type grouping
- human wording
- calm first read
- timestamps
- source truth

WATCH must answer:
"What changed in things I care about?"

It should eventually combine:
- followed places
- followed species
- saved views
- meaningful source-grounded changes

Do not turn WATCH into an alert system unless methodology supports alerting.

---

## 11. 4PLANET ID — CURRENT STATUS AND REQUIRED CLOSURE

Important: do not rebuild auth.

Existing canonical identity:
src/identity/identityClient.ts
src/pages/identity/IdentityApp.tsx

Existing secure cross-domain bridge:
bridgeSessionTo(targetUrl, session)
→ Supabase Edge Function four-planet-id-bridge
→ target /auth/4planet/callback
→ consumeBridgeFromLocation()
→ verifyOtp()

4planetatlas.com is already a trusted host.

App.tsx already treats /auth/4planet/callback as IdentityApp on any host.

ATLAS current personal state:
src/earth/AtlasSavedViews.tsx
src/earth/atlasAccountState.ts

Existing behaviour:
- anonymous local-first follows / saved views
- signed-in Atlas-origin session loads server state
- local + remote state merges
- server state persists in public.four_planet_atlas_state
- RLS is user-owned auth.uid()
- My Atlas exposes sign-in / account CTA

What is NOT yet proven:
If a person is logged into 4planet.org, then manually types 4planetatlas.com, Atlas does not automatically have access to 4planet.org origin storage.

Therefore:
DO NOT claim silent SSO is complete.

Claude task:
Audit and complete the intended user experience using the EXISTING bridge.

Desired outcome:
- if navigation starts from an authenticated 4PLANET surface, hand the session into ATLAS securely and invisibly enough that the user experiences one account
- if user opens Atlas directly and no Atlas-origin session exists, My Atlas can invoke the existing ID flow
- return to exactly the same Atlas view after authentication
- merge local follows/saved views idempotently
- never force anonymous explorers through login
- no cookie hacks
- no iframe hacks
- no second auth system
- no duplicated profile store

Test:
1. logged out → Atlas → use anonymously
2. Atlas → Sign in → ID → return to same Atlas state
3. signed in 4planet.org → navigate to Atlas → remains/gets signed in through secure bridge
4. saved view → leave → return
5. follow place/species → second device/session → state present
6. sign out global → Atlas state becomes local/anonymous appropriately

---

## 12. PERFORMANCE — KEEP THE GAINS, GO FURTHER WITH EVIDENCE

Already improved:
- removed body-wide search MutationObserver from mounted runtime
- removed 1-second whole-tree clock rerender
- Time event-driven
- less tile/source listener churn
- slower evidence fallback polling
- reduced mobile tile cache
- signals on demand

Now profile actual live ATLAS.

Measure:
- boot network requests
- time to first usable map
- JS long tasks
- React rerenders
- MapLibre event frequency
- source setData frequency
- layer recreation
- duplicate provider calls
- hidden-surface work
- search latency
- memory after 5–10 minutes
- pan/zoom frame behaviour on mobile

Hard law:
NO INVISIBLE WORK.

If a user cannot see or has not requested a layer, panel or feed, it should generally not consume recurring CPU/network/rendering.

Further target patterns:
- AbortController for stale search/data requests
- viewport-bound queries where source supports it
- source-specific TTL caching
- request de-duplication
- cluster large point sets
- virtualise long lists
- do not render thousands of DOM markers
- setData only if actual dataset changed
- do not rebuild MapLibre style/layers unnecessarily
- unmount expensive hidden surfaces
- prefer direct React state over DOM observers

Do not optimise by deleting useful functionality.

---

## 13. VISUAL / INTERACTION CRAFT STANDARD

Target quality:
Apple product clarity + premium scientific editorial restraint + 4PLANET identity.

Use:
- fewer controls
- smaller controls
- generous spatial rhythm
- excellent typography
- obvious primary action
- smooth sheets
- lightweight rounded controls
- consistent corner radii
- subtle material separation
- disciplined colour
- map remains visible whenever useful
- motion that explains spatial/state transitions

Avoid:
- giant black boxes
- walls of monospace metadata
- source labels as dominant UI
- permanent footer chrome on phone
- multiple close conventions
- simultaneous panels
- excessive borders
- "terminal" aesthetic as the default interaction language
- unnecessary all-caps
- huge technical status badges
- controls covering the thing they control

Keep technical/provenance language accessible at deeper levels.

Buttons:
Founder preference is smaller, rounded controls rather than rectangular blocks.
Maintain touch usability.

---

## 14. MOTION / AWE

Awe must come from the real planet and interaction, not decorative animation.

Good awe:
- beautiful Earth at rest
- seamless globe → regional → local transition
- day/night
- weather appearing naturally in context
- species observations revealing themselves spatially
- time change that visibly changes real data
- before/after compare
- subtle focus transitions
- calm, high-quality loading states

Bad awe:
- fake particles
- tech-grid overlays
- glowing sci-fi UI
- excessive auto-camera movement
- constant animation
- effects that reduce performance

User owns the camera after intentional focus.

---

## 15. GOOGLE / FIRST-PUBLIC-VISIT READINESS

ATLAS may soon be discovered by users who know nothing about 4PLANET.

Audit:
- title
- meta description
- canonical
- structured data
- crawlability
- route behaviour on 4planetatlas.com
- share previews
- meaningful first paint
- unsupported-WebGL fallback
- mobile Safari
- desktop Chrome/Safari/Firefox
- no internal prototype labels in first read
- no broken source states
- no dead CTAs
- no console-breaking errors
- accessibility basics
- keyboard / focus
- reduced motion
- useful empty states

The first visitor should not need a tutorial to understand:
"This is an interactive view of the living planet."

---

## 16. KNOWN LIVE JOURNEYS TO RED TEAM

Desktop + mobile:

A. OPEN
4planetatlas.com
→ Earth immediately useful
→ no clipping
→ no giant chrome
→ pan / zoom immediately responsive

B. SEARCH PLACE
Search Oslo
→ open Oslo
→ place portrait is human first
→ weather/time
→ life preview
→ optional evidence

C. SEARCH LIFE
Search Orca
→ one meaningful taxon result
→ identity/reference photo clearly separated from occurrence evidence
→ occurrence source unavailable != no orca

D. TAP EARTH
Tap a random coordinate
→ no giant technical black box
→ meaningful "here" portrait
→ local time/weather/life/signals only as source-valid
→ evidence deeper

E. LAYERS
Open Layers
→ clean bottom sheet
→ choose one layer
→ sheet closes / map responds
→ no hidden heavy work from all other layers

F. NOW
Open NOW
→ relevant understandable events
→ not a dump
→ no misleading LIVE

G. WATCH / MY ATLAS
Follow/save
→ persistent
→ sign-in optional
→ signed-in sync works
→ second visit is more useful

H. TIME
Layer with time support
→ simple contextual timeline
→ semantics correct

I. COMPARE
Comparable layer
→ direct visual difference
→ methodology/source visible at depth

---

## 17. IMPLEMENTATION PRIORITY

P0 — PUBLIC EXPERIENCE
1. Red-team live mobile/desktop.
2. Replace current PLACE / coordinate black-box first read with Human Awe Place Portrait.
3. Fix any remaining panel overlap / viewport clipping / touch failures.
4. Fix search keyboard/result usability.
5. Fix 4PLANET ID journey end-to-end.
6. Profile and fix proven performance bottlenecks.
7. Remove remaining misleading source/time labels.

P1 — DAILY VALUE
8. Weather for selected place/coordinate.
9. Human local time/day-night context.
10. NOW relevance/presentation.

P1/P2 — DEPTH
11. Coherent TIME.
12. First COMPARE.
13. richer Place modules.
14. Watch changes for followed objects.

Do not start all of these simultaneously.
Finish vertical slices.

---

## 18. DEFINITION OF DONE

This closure is DONE only when:

- actual live ATLAS is noticeably calmer and more premium
- Earth is visually dominant
- place selection gives an immediate human first read
- technical source/query details are moved to progressive evidence depth
- mobile has one owning surface at a time
- iPhone search works with keyboard
- no obvious map clipping
- pan/zoom feels smooth on a normal phone
- no major invisible recurring work
- 4PLANET ID journey is tested end-to-end
- My Atlas persists correctly
- weather is useful and truthfully timestamped
- Time semantics are consistent
- current features are not silently lost
- source failure remains distinguishable from no records
- exact build/deploy/live evidence exists
- 4planetatlas.com is verified after deployment

---

## 19. NON-NEGOTIABLE GUARDRAILS

DO NOT:
- create a new ATLAS repo
- create a new map engine
- create a parallel Context engine
- create a new design system just for ATLAS
- create a second auth system
- create a second account store
- create a new Brain
- invent ecological conclusions
- call stale/historical/forecast data LIVE
- force login
- remove evidence/provenance to make UI prettier
- remove useful layers to improve benchmark numbers
- touch FOOD, 4NATION or unrelated products
- move 4planetatlas.com back to shared 4planet-05 hosting
- claim LIVE until exact public verification passes

Preserve:
truth
sources
camera authority
embeds
cross-product entity journeys
working layers
saved/follow state
existing 4PLANET identity authority

---

## 20. FIRST CLAUDE RESPONSE

Before editing, return a short evidence table:

ISSUE | LIVE EVIDENCE | ROOT CAUSE | PROPOSED FIX | USER EFFECT | PERF EFFECT | REGRESSION RISK

Then execute.

Do not write another strategy document as the deliverable.
Do not stop after analysis.
Build safe fixes, test, deploy through the established ATLAS release path, verify live, and report exact evidence.

Founder north star:

EARTH FIRST.
HUMAN AWE FIRST.
TRUTH ALWAYS.
DEPTH ON DEMAND.
FAST ENOUGH THAT PEOPLE WANT TO KEEP EXPLORING.
