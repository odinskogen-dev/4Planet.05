# 4PLANET ATLAS — CLAUDE FULL CONTEXT + MASTER EXECUTION PACK
## APPLE-LEVEL HUMAN AWE / PUBLIC READINESS / PRODUCT CLOSURE 01

**Date:** 2026-10-07  
**Founder:** Odin Oddekalv  
**Repository:** `odinskogen-dev/4Planet.05`  
**Current implementation authority:** `king/test`  
**Current king/test head when this pack was written:** `5dc63fe8ddd1daea32d62d102066705d3c7efbfe`  
**Public product:** `https://4planetatlas.com`  
**Cloudflare Pages project:** `4planet-atlas`  
**Scope:** ATLAS only

This document is intended to be sufficient for Claude to understand the product, the founder intent, the architecture, the current state, the quality target, the known problems, the non-negotiable invariants, the work order and the definition of done without requiring the Founder or AXE to drip-feed additional context.

Do not treat this as a brainstorming brief. Treat it as an execution contract.

---

# 00. AUTHORITY / HOW TO USE THIS PACK

Use this precedence when facts conflict:

1. **Founder intent in this document**
2. **Actual current LIVE behaviour at 4planetatlas.com**
3. **Current `king/test` implementation**
4. **Current ATLAS tests/contracts**
5. **Current Gold / programme control files**
6. **Relevant historical 4PLANET PRDs and build orders**
7. Older branches, screenshots, prototypes and superseded docs

Historical documents contain valuable product principles but may contain old implementation assumptions. Do not revive an older architecture merely because an old PRD describes it.

Where this pack explicitly changes or clarifies an older requirement, this pack wins for this ATLAS closure.

Before editing:
- fetch current `king/test`;
- record exact SHA;
- inspect LIVE;
- inspect current ATLAS source;
- inspect the named ATLAS tests;
- return the requested evidence table;
- then implement.

Do not spend the first half of the job writing another strategy document.

---

# 01. THE FOUNDER INTENT

The objective is not merely to make ATLAS technically correct.

The objective is to make it a product people can discover, understand, enjoy, trust and want to keep exploring.

ATLAS should feel like:

**the living planet made explorable**

The Founder’s current product direction is:

**EARTH FIRST  
HUMAN AWE FIRST  
TRUTH ALWAYS  
DEPTH ON DEMAND  
FAST ENOUGH THAT PEOPLE WANT TO KEEP EXPLORING**

A first-time visitor arriving from Google should be able to understand the experience within seconds without knowing 4PLANET terminology.

The product should make the user feel:
- curiosity;
- orientation;
- awe;
- connection to the real planet;
- confidence that the information is grounded;
- desire to explore further.

It should not make the user feel:
- that they opened a GIS console;
- that they opened an internal scientific database inspector;
- that they need to learn 4PLANET vocabulary;
- that they are operating an admin dashboard;
- that every click produces a giant black technical box;
- that the interface is fighting the map.

---

# 02. 4PLANET CONTEXT CLAUDE MUST UNDERSTAND

4PLANET mission:

**LIVING PLANET INTELLIGENCE**

Tagline:

**4PLANET_ For a Living Planet.**

Secondary framing:

**A System for Ecological Action.**

Cross-portfolio Founder Thesis:

**BETTER. FOR EVERYONE.**

ATLAS is one public product in a larger system, but it must be independently valuable.

Current public architecture:

- **4PLANET** — the wider public universe, missions, story and entry point.
- **ATLAS** — the standalone spatial interface / planetary explorer.
- **SPECIES** — life-first species intelligence.
- **IMPACT** — action / delivery / proof.
- **LIVING SYSTEMS** — a shared intelligence/guided mode, not a competing fifth standalone application.

Architecture maxim:

**Separate worlds. Shared infrastructure. Controlled depth.**

This means:
- ATLAS should feel like a coherent product in its own right;
- it should share identity, source truth, places, species, evidence and product context with the rest of 4PLANET;
- it should not become visually or conceptually overloaded by the entire 4PLANET universe.

The canonical ATLAS product interaction logic is:

**SEE → FIND → EXPLORE → FILTER → INSPECT → COMPARE → FOLLOW**

The canonical LIVING SYSTEMS logic is:

**DISCOVER → UNDERSTAND → CONNECT → LEARN → RESPOND**

Do not collapse them into the same experience.

ATLAS must remain directly useful without requiring a guided journey.

---

# 03. PRODUCT QUALITY STANDARD

Historical 4PLANET product canon describes the desired character as:

**NASA × National Geographic × Apple × Patagonia × Vogue × Snøhetta × Arc’teryx × SpaceX**

This is NOT an instruction to visually imitate those brands.

Translate it into behaviour:

- scientific clarity without institutional coldness;
- editorial confidence without magazine clutter;
- cinematic imagery / planet presence without decorative excess;
- technical depth without dashboard overload;
- human language before internal terminology;
- premium restraint before feature density;
- visible truth boundaries without turning every first screen into compliance documentation;
- one primary decision per view;
- progressive disclosure instead of simultaneous complexity;
- meaningful motion, not animation for animation’s sake;
- excellent mobile behaviour, not desktop squeezed into a phone.

The Founder now wants an **Apple-level feel**.

Interpret that as:
- calm;
- obvious;
- fast;
- coherent;
- tactile;
- spatially consistent;
- minimal chrome;
- excellent typography;
- excellent touch targets;
- excellent state transitions;
- no duplicate controls;
- no arbitrary UI;
- no unexplained technical language;
- no rough edges.

Do NOT interpret Apple-level as:
- fake iOS controls;
- glassmorphism everywhere;
- generic frosted cards;
- decorative blur;
- copying Apple branding.

ATLAS must still look and feel like 4PLANET.

---

# 04. PUBLIC LANGUAGE / BRAND BEHAVIOUR

Public English:
- British English;
- human;
- concise;
- specific;
- non-sentimental;
- scientifically careful;
- emotionally resonant only where earned.

Avoid:
- startup jargon;
- AI jargon;
- NGO campaign language;
- internal programme terms;
- repeated abstract “system” language;
- unexplained source acronyms in the first read;
- technical labels ordinary people do not need immediately.

Every important public surface should help answer:

1. What am I looking at?
2. Why is it interesting / relevant?
3. What can I do here?
4. Where did this information come from?
5. What is unknown / unavailable / limited?
6. What should I explore next?

Technical source detail belongs at evidence depth.

---

# 05. CURRENT LIVE / REPO / HOSTING TRUTH

ATLAS code remains in the same canonical repository:

`odinskogen-dev/4Planet.05`

There is NOT a separate ATLAS repo.

ATLAS now has a dedicated Cloudflare Pages **deployment target**:
`4planet-atlas`

Public domain:
`4planetatlas.com`

Reason:
ATLAS previously shared the `4planet-05` Pages project with multiple other product domains. That made isolated ATLAS releases unsafe because one Pages production build could affect unrelated domains.

The hosting split is deployment isolation only.

Do not:
- create a new repo;
- fork the codebase;
- duplicate ATLAS source;
- move the domain back to shared `4planet-05` unless Founder explicitly orders it.

---

# 06. WHAT IS ALREADY BUILT / MUST NOT BE DESIGNED AWAY

ATLAS already has substantial real functionality.

Preserve and improve rather than restart.

Existing capability includes, among other things:

## Map / spatial engine
- MapLibre;
- globe / mercator behaviour;
- pan / zoom / rotation;
- close zoom;
- light / dark;
- map state in URL;
- camera/context continuity;
- first-party embeds;
- context reopen / deep links;
- selected-object focus;
- recenter.

## Search / discovery
- places;
- taxa/species;
- source/data-layer intent;
- current integrated React search path;
- taxon de-duplication work;
- direct ATLAS search/discovery entry.

## Layer/source families already represented in ATLAS work
Examples include:
- NASA GIBS;
- GHRSST;
- Black Marble;
- active fire / thermal anomaly layers;
- NDVI;
- sea ice;
- aerosols;
- IMERG precipitation;
- Global Forest Watch;
- GBIF;
- OBIS;
- EONET;
- USGS earthquakes;
- Climate TRACE;
- ISS;
- EMODnet;
- EUSeaMap;
- marine / oxygen / fishing-related layers where implemented.

Do not assume every historical source is currently fully active.
Verify actual runtime and source state before claiming activity.

## Context / entity system
ATLAS can open:
- PLACE;
- TAXON;
- OBSERVATION;
- SIGNAL;
- LIVING SYSTEM;
- PRESSURE;
- SOLUTION;
- MISSION;
- legacy point/context envelopes.

## Personal state
- follows;
- saved views;
- local-first anonymous state;
- My Atlas;
- signed-in sync through existing 4PLANET ID-backed state.

## Product relationships
- ATLAS ↔ SPECIES identity/context;
- embeds into other 4PLANET surfaces;
- shared entity IDs and product context;
- shared truth/source semantics.

A prettier interface is NOT success if it deletes these capabilities.

---

# 07. WORK ALREADY COMPLETED IN THE LATEST ATLAS CLOSURE

Recent ATLAS work already addressed several important issues.

Preserve these gains.

## Mobile surface authority
Search, Context, Layers, NOW/WATCH and My Atlas are intended to behave as mutually exclusive primary mobile work surfaces.

External surfaces such as TIME / My Atlas were tightened so they do not compete.

## Mobile viewport / map clipping
The ATLAS root now uses dynamic viewport behaviour with fallback.

MapLibre resize reconciliation was added around:
- window resize;
- orientation;
- VisualViewport changes;
- ATLAS surface transitions.

This was specifically intended to address Safari/mobile stale canvas sizing and “cut map” behaviour.

## Search cleanup
A whole-body MutationObserver search sidecar was removed from the mounted runtime.

Search intent moved into the actual React/product path.

Taxon results were de-duplicated by scientific identity.

## Performance
Recent work reduced obvious waste:
- removed one-second whole-ATLAS clock rerender;
- TIME is more event-driven;
- removed tile-level `sourcedata` churn from TIME;
- reduced frequent evidence fallback polling;
- reduced Zoom Stack reaction to source churn;
- reduced mobile MapLibre cache/fade work;
- EONET/USGS signal pool became more demand-driven.

Core law introduced:

**NO INVISIBLE WORK**

If the user cannot see and has not requested a panel/layer/feed, ATLAS generally should not spend recurring CPU/network/render work on it.

## Truth semantics
Work began moving away from misleading generic `LIVE` labels.

Distinguish:
- record exists;
- record is recent;
- source checked recently;
- analysis;
- forecast;
- historical data;
- climatology.

## WebGL
Capability detection no longer treats a browser reporting a performance caveat as equivalent to no WebGL.

---

# 08. THE BIGGEST REMAINING PRODUCT PROBLEM

The interface is still too technical, especially Context / Place.

Founder description:

> all the black place boxes that appear when you move into the globe with lots of useless information

This is a correct criticism.

Current Place Context exposes concepts such as:
- PLACE / SEEDED;
- exact coordinates;
- RECORDS IN THIS MAP AREA;
- returned record count;
- BOUNDING BOX;
- distinct names in sample;
- long bounding-box caveat text;
- source/status labels;
- RECENT SIGNALS;
- technical tier controls.

These may be important for evidence.

They are wrong as the first read.

The product currently reveals **implementation truth before human meaning**.

Fix that.

---

# 09. NEW PRIMARY DESIGN LAW: HUMAN AWE FIRST

When a user taps Earth / a place / a coordinate / a species, the first response should help them feel that they are exploring the real planet.

The hierarchy should be:

**ORIENT → FEEL → UNDERSTAND → EXPLORE → VERIFY**

Not:

**QUERY DETAILS → SOURCE STATUS → DATABASE METADATA → MAYBE MEANING**

Awe must come from:
- Earth;
- place;
- life;
- weather;
- time;
- real observations;
- real change;
- elegant spatial motion;
- beautiful restraint.

Not from:
- sci-fi overlays;
- glowing grids;
- fake particles;
- excessive animation;
- decorative “AI” effects.

---

# 10. PLACE PORTRAIT — P0 REBUILD INSIDE EXISTING CONTEXT

Build/reconcile ONE reusable **Place Portrait** inside the existing Context architecture.

Do NOT create a parallel context engine.

## First read: 3–5 seconds

Show:
- place name;
- human place type;
- country / region where known;
- one strong human contextual sentence;
- current local time;
- current weather / conditions where source-valid;
- a compact life / activity preview;
- save / follow;
- one obvious deeper action.

Illustrative structure only:

OSLOFJORD  
A living fjord system between Oslo and the Skagerrak.  
9°C · Light rain  
14:24 local time  
Harbour porpoise and orca recorded in the wider region  
2 recent natural signals  
[Explore this place]

Never fabricate data to fill this structure.

## Second read

Progressively reveal relevant modules:
- Life;
- Weather;
- Ocean / Water;
- Land;
- Atmosphere;
- Human activity;
- Recent events;
- Change;
- Living Systems;
- Watch.

Not every place needs every module.

## Evidence depth

Only here expose:
- exact source;
- query geometry;
- bounding-box caveats;
- polygon absence;
- record count;
- retrieval/check time;
- licence / rights;
- source state;
- precision;
- coverage limitations;
- confidence / unknowns.

Truth must remain strict.

**Hide complexity, never hide uncertainty.**

---

# 11. RANDOM MAP TAP / “HERE” EXPERIENCE

A user tapping a random point on Earth should not receive an internal technical box.

Design a human “Here” experience.

First read should answer:
- where is this?
- local time;
- current weather if available;
- land/ocean context;
- nearby meaningful life;
- recent relevant signals;
- what can I explore next?

If exact place identity is unknown, say so naturally.

Do not invent a named place.

Do not imply exact semantic place membership from a rectangular query.

The source model explicitly distinguishes:

**QUERY AREA IS NOT PLACE MEMBERSHIP**

Preserve that rule.

---

# 12. SEARCH — P0 PUBLIC PRODUCT QUALITY

Search is likely one of the first interactions for a Google-origin visitor.

It must feel immediate and trustworthy.

Required:
- one dominant field;
- great iPhone keyboard behaviour;
- no horizontal clipping;
- no overlay collisions;
- no unrelated floating controls over results;
- rapid initial response;
- stale-request cancellation;
- de-duplication;
- sensible grouping/ranking;
- clear source unavailable state;
- no fake “no results” when provider failed;
- no implication that a small seeded registry equals global coverage.

Test at minimum:
- Oslo
- Oslofjord
- Orca
- Orcinus orca
- Kenya
- Berlin
- Manila
- forest loss
- fires
- earthquakes
- sea ice
- ocean temperature
- precipitation
- night lights

Search results should distinguish:
- Place
- Life
- Data / layer / phenomenon

without becoming a category wall.

---

# 13. LAYERS

ATLAS is a serious planetary explorer.

Do not remove data depth.

But Layers should feel like a premium exploration tool, not a dense toggle catalogue.

Canonical top-level source/layer concepts from earlier product canon include:
- PLANET;
- OCEAN;
- LAND;
- LIFE;
- CLIMATE & ATMOSPHERE;
- HUMAN SYSTEMS;
- EVENTS & SIGNALS;
- PROTECTION / RESTORATION CONTEXT.

Each active layer should eventually communicate:
- plain-language name;
- what the user is seeing;
- source authority;
- date/freshness;
- legend;
- coverage;
- limitation;
- loading/unavailable/partial/source-down states.

On mobile:
- sheet;
- one clear selection journey;
- close cleanly;
- map regains focus immediately.

No permanent giant floating catalogue.

---

# 14. WEATHER — HIGH PRIORITY

Weather is now part of the desired ATLAS Place experience.

Goal:
make a selected place feel alive and current.

Minimum useful first implementation:
- current conditions at selected place/coordinate;
- temperature;
- precipitation / condition;
- wind where useful;
- short forecast;
- source timestamp;
- truthful classification.

Preferred source direction:
- MET Norway Locationforecast;
- ECMWF Open Data where appropriate.

Requirements:
- source-grounded;
- lazy / point-based;
- cached;
- no global weather workload at boot;
- no hidden background hammering;
- graceful failure;
- forecast ≠ observed;
- do not label forecast LIVE.

Build the smallest correct version first.

Do not build a meteorological platform.

---

# 15. TIME — MAKE IT HUMAN

Time is essential to planetary intelligence, but it cannot feel like an engineering control panel.

Canonical time classes for ATLAS:

- **OBSERVED**
- **ANALYSIS**
- **FORECAST**
- **HISTORICAL**
- **CLIMATOLOGY**

Use **LIVE** only when the source is genuinely live / near-real-time.

The user should be able to understand:
- now;
- before;
- forecast;
- baseline / climatology.

Possible human interaction framing:

**HISTORY ← TODAY / NOW → FORECAST**

depending on source/context.

Do not force every source into one universal timeline if its temporal model does not support that.

Time controls should be contextual to what is visible.

---

# 16. COMPARE — IMPORTANT NEXT CAPABILITY

After TIME is coherent, build a simple direct Compare experience.

Examples:
- today vs previous period;
- 2026 vs 2016;
- before vs after;
- water extent then vs now;
- sea temperature vs normal;
- seasonal sea ice vs baseline.

Compare should feel like direct manipulation:
- swipe;
- split;
- toggle;
- A/B.

Avoid GIS-console complexity.

Never infer causality from visual difference alone.

Never compare incompatible datasets as if they were directly equivalent.

---

# 17. NOW

NOW should answer:

**What is happening on the planet / in the place I am looking at?**

It should not be:
- a raw EONET dump;
- a raw earthquake feed;
- hundreds of equally weighted records.

Improve:
- geographic relevance;
- temporal relevance;
- grouping;
- hierarchy;
- natural-language labels;
- significance without sensationalism;
- timestamps;
- exact source depth when expanded.

Do not convert every source record into an “alert”.

ATLAS does not have authority to invent urgency.

---

# 18. WATCH

WATCH should answer:

**What changed in things I care about?**

Inputs can include:
- followed places;
- followed species;
- saved views;
- explicitly watched phenomena.

Over time, Watch should become a key return-use engine.

But:
- no fake notifications;
- no alert language without methodology;
- no automatic ecological conclusions;
- no generic news feed.

The immediate goal is a clean, credible watched-state experience.

---

# 19. MY ATLAS

My Atlas should feel like the user’s personal doorway back into the planet.

Current capabilities:
- saved views;
- follows;
- local-first state;
- optional sign-in;
- account sync when a valid ATLAS-origin session exists.

Improve its first read:
- Saved places
- Saved views
- Following
- Recent exploration where appropriate
- Watch

Avoid exposing sync mechanics as the dominant experience.

“SYNCED”, email, storage language and implementation details should be secondary.

Anonymous must remain useful.

---

# 20. 4PLANET ID — CURRENT REAL STATUS

Do NOT rebuild auth.

Canonical files:
- `src/identity/identityClient.ts`
- `src/pages/identity/IdentityApp.tsx`

Current identity foundation:
- Supabase Auth;
- persistent session;
- password login;
- signup;
- reset;
- account;
- Google OAuth;
- profile;
- trusted hosts;
- secure cross-domain bridge.

`4planetatlas.com` is in trusted hosts.

Secure bridge:
`bridgeSessionTo(targetUrl, session)`
→ Supabase Edge Function `four-planet-id-bridge`
→ target `/auth/4planet/callback`
→ `consumeBridgeFromLocation()`
→ OTP verification
→ return to target.

App routing already treats `/auth/4planet/callback` as IdentityApp on first-party hosts.

ATLAS personal state files:
- `src/earth/AtlasSavedViews.tsx`
- `src/earth/atlasAccountState.ts`

Current state model:
- anonymous user can use ATLAS locally;
- signed-in session can hydrate remote follows/saved views;
- local + remote are merged;
- server state is written to `public.four_planet_atlas_state`;
- RLS is intended to be user-owned;
- My Atlas exposes 4PLANET ID sign-in/account action.

## Important gap

Do NOT claim universal silent SSO is finished.

A user manually opening `4planetatlas.com` cannot magically read another origin’s local Supabase session.

Desired experience:
- user logged into 4planet.org;
- user navigates to ATLAS through a first-party link;
- existing secure bridge hands session to ATLAS;
- user experiences one 4PLANET account;
- ATLAS state is ready;
- no extra unnecessary login prompt.

Also:
- direct anonymous visit stays anonymous;
- sign-in from My Atlas returns to exact same map/context;
- merge is idempotent;
- global sign-out behaves correctly;
- second device sees account-backed follows/saved views.

Test end-to-end:
1. anonymous Atlas exploration;
2. sign in from Atlas;
3. return to exact same view;
4. signed-in 4planet.org → Atlas;
5. save/follow → leave → return;
6. second device/session;
7. global sign out.

No:
- shared-cookie hacks;
- hidden iframe hacks;
- second auth system;
- duplicated account store.

---

# 21. PERFORMANCE — NON-NEGOTIABLE

The Founder experienced severe lag.

Recent work improved it.

Do not regress.

Profile the actual product before making broad claims.

Measure:
- boot request count;
- time to first usable map;
- long tasks;
- React rerender frequency;
- MapLibre event frequency;
- `setData` frequency;
- layer/style recreation;
- duplicate provider requests;
- hidden-surface work;
- search latency;
- memory over 5–10 min;
- repeated open/close state cost;
- pan/zoom smoothness;
- mobile thermal / workload characteristics where measurable.

Hard law:

**NO INVISIBLE WORK**

Expected implementation patterns:
- AbortController for stale calls;
- debounce search;
- request de-duplication;
- source-specific TTL cache;
- viewport-bound data queries where supported;
- update on moveend rather than every map movement;
- clustering;
- virtualised long feeds;
- do not create thousands of DOM markers;
- avoid unnecessary style/layer recreation;
- unmount hidden expensive surfaces;
- no body-wide MutationObservers for app state;
- no fast polling when events can drive updates.

Performance improvements must not be achieved by silently deleting product capability.

---

# 22. DATA / TRUTH MODEL

ATLAS is not just a visual product.

Truth architecture matters.

Important principles:

## Query area ≠ place membership
A source record returned from a bounding box is a record inside a query area.

That does not prove it semantically belongs to the named place.

## Source failure ≠ zero
Never render provider failure as “0”.

Use explicit states such as:
- unavailable;
- request failed;
- stale;
- rights blocked;
- key required;
- empty result;
- partial coverage.

## Observation ≠ signal
An observation is not automatically a “signal”.

Do not invent transformations without a methodology.

## Identity
Preserve upstream identity where authoritative.

Example:
Orca/GBIF identity must remain stable across ATLAS and SPECIES.

## Public source depth
At evidence depth, retain:
- source;
- record ID;
- observed/published time;
- retrieval/check time;
- precision;
- rights/licence;
- limitations;
- source link;
- interpretation status.

Do not sacrifice truth to achieve visual minimalism.

---

# 23. SOURCE / RIGHTS CAUTION

Do not activate sources just because an adapter or old PRD mentions them.

For every public source:
- verify current implementation;
- verify credentials;
- verify rights/licence;
- verify source health;
- verify current public use.

Specific historical constraints include:
- Protected Planet public API commercial-use restrictions;
- credentialled sources must not expose secrets client-side;
- FIRMS key must remain server-side;
- source failure must remain explicit.

No source-count theatre.

Every source should create real ATLAS utility.

---

# 24. MAP / CAMERA / EMBED INVARIANTS

Do not break:
- MapLibre;
- globe;
- mercator;
- mobile orientation recovery;
- close zoom;
- URL state;
- current object/entity focus;
- back/forward context;
- first-party embeds;
- ATLAS → SPECIES;
- SPECIES → ATLAS;
- 4NATION / other embed consumers where already existing.

Camera law:
- an explicit user selection may intentionally focus;
- once the user pans/zooms, the user owns the camera;
- asynchronous data finishing later must not steal it back;
- Recenter can intentionally restore focus.

Avoid multiple independent camera authorities.

---

# 25. VISUAL INTERFACE CRAFT

Target:
**premium restraint + planetary awe + effortless control**

Use:
- map/planet as dominant visual;
- compact controls;
- smaller rounded buttons;
- consistent radii;
- clean sheets;
- generous spacing;
- strong typography;
- restrained colour;
- subtle material separation;
- excellent loading states;
- obvious selected state;
- predictable close/back behaviour;
- excellent touch targets.

Avoid:
- giant black context slabs;
- long monochrome technical walls;
- repeated borders;
- floating controls everywhere;
- all-caps as the main language;
- internal status badges dominating first read;
- persistent footer crowding on mobile;
- multiple simultaneous panels;
- UI covering the object being explored.

A first-time visitor should see Earth, not interface chrome.

---

# 26. MOTION

Motion should explain:
- spatial movement;
- focus;
- hierarchy;
- sheet state;
- time change;
- compare.

Good:
- calm globe → place landing;
- subtle focus pulse;
- smooth sheet transitions;
- time transition that visibly changes data;
- compare interaction.

Bad:
- continuous decoration;
- auto-camera after user takes control;
- dramatic swoops every click;
- fake particles;
- performance-heavy effects.

Respect reduced motion.

---

# 27. PUBLIC / GOOGLE READINESS

The Founder expects ATLAS may soon be discovered through Google.

Treat every unknown visitor as real.

Verify:
- page title;
- meta description;
- canonical;
- structured data;
- crawlability;
- share preview;
- root route;
- deep links;
- meaningful first paint;
- WebGL fallback;
- mobile Safari;
- desktop Safari;
- Chrome;
- Firefox;
- console errors;
- dead links;
- unsupported source states;
- accessibility basics;
- focus states;
- reduced motion;
- useful empty/error states.

Do not expose internal prototype language in the first read.

The user should understand:
**This is an interactive view of the living planet.**

---

# 28. MOBILE IS NOT A SMALL DESKTOP

Mandatory mobile viewports:
- 390×844
- 430×932

Also test realistic Safari/browser chrome behaviour.

One major surface at a time.

When Search keyboard is open:
- Search owns the viewport;
- other floating controls get out of the way;
- results remain readable;
- no horizontal clipping.

When a sheet closes:
- map returns to full usable state;
- MapLibre canvas resizes correctly;
- pan/zoom works immediately.

Test repeated cycles:
Search → close → Layers → close → Place → close → My Atlas → close → NOW → close.

No degradation.

---

# 29. DESKTOP

Desktop can reveal more simultaneous context than mobile, but still obey restraint.

The map remains primary.

Do not fill both sides with dense panels by default.

Context width should be readable, not dominate.

Mouse/trackpad interactions should feel precise.

Hover affordances must not replace touch semantics.

---

# 30. ACCESSIBILITY

Minimum:
- semantic buttons;
- labels;
- keyboard focus;
- escape/close where appropriate;
- screen reader labels for icon-only controls;
- contrast;
- no interaction only discoverable through colour;
- reduced motion;
- predictable focus when sheets open/close.

Do not make accessibility an afterthought after visual polish.

---

# 31. CORE LIVE JOURNEYS CLAUDE MUST RED-TEAM

## A. First open
`4planetatlas.com`
→ Earth loads
→ product immediately understandable
→ no giant UI
→ pan/zoom works
→ first useful interaction obvious

## B. Place search
Search Oslo
→ open Oslo
→ Place Portrait
→ current time/weather
→ life/context
→ deeper evidence optional

## C. Oslofjord
Search Oslofjord
→ human fjord portrait
→ water/marine relevance
→ no land-species confusion presented as marine truth
→ evidence explains query geometry only when opened

## D. Orca
Search Orca
→ one canonical meaningful result
→ identity image clearly separated from occurrence evidence
→ real records
→ unavailable source ≠ no orca
→ open SPECIES
→ return to same ATLAS context

## E. Random Earth tap
→ useful Here experience
→ not a database dump
→ weather/time/life/signals if source-valid

## F. Layers
→ clean sheet
→ activate one layer
→ sheet closes
→ map responds
→ legend/source accessible
→ other layers do not do hidden recurring work

## G. NOW
→ understandable relevant events
→ no misleading live labels
→ no dump

## H. Watch / My Atlas
→ follow/save
→ anonymous works
→ sign-in optional
→ signed-in state persists
→ second visit better than first

## I. Time
→ correct temporal class
→ source cadence understandable
→ no fake universal time

## J. Compare
→ honest A/B
→ simple
→ source/method available

---

# 32. SOURCE FILE MAP — START HERE

Claude should inspect at minimum:

### Core ATLAS
- `src/earth/World.tsx`
- `src/earth/PublicWorld.tsx`
- `src/earth/Context.tsx`
- `src/earth/world.css`
- `src/earth/atlas-leading.css`
- `src/earth/layers.ts`
- `src/earth/atlasLeadingExtensions.ts`
- `src/earth/AtlasSavedViews.tsx`
- `src/earth/AtlasTimeControls.tsx`
- `src/earth/AtlasZoomStack.tsx`
- `src/earth/atlasViewContract.ts`
- `src/earth/AtlasReturnCameraAuthority.tsx`
- `src/earth/AtlasEmbedRuntime.tsx`

### Identity
- `src/identity/identityClient.ts`
- `src/pages/identity/IdentityApp.tsx`
- `src/earth/atlasAccountState.ts`

### Personal / planet state
- `src/planet/follow.ts`
- `src/planet/atlasViews.ts`
- relevant planet types/entity registry/source registry

### App routing
- `src/App.tsx`
- `src/routes/router.tsx`

### Release / control
- `docs/control/GOLD_CURRENT_BRIEF.md`
- current ATLAS Cloudflare/release workflows

---

# 33. EXISTING ATLAS TESTS / CONTRACTS

At pack creation, the repo contains:

- `scripts/atlas-embed-contract.test.mjs`
- `scripts/atlas-mobile-context-control-contract.test.mjs`
- `scripts/atlas-mobile-human-performance-contract.test.mjs`
- `scripts/atlas-recovery-contract.test.mjs`
- `scripts/atlas-search-discovery-contract.test.mjs`
- `scripts/atlas-source-bridge-contract.test.mjs`
- `src/earth/__tests__/atlasTypedSearch.proof01b.test.ts`
- `tests/e2e/atlas-core-parent-release.spec.ts`
- `tests/e2e/atlas-founder-proof.spec.ts`
- `tests/e2e/atlas-leading-recovery.spec.ts`
- `tests/e2e/atlas-omega-gold.spec.ts`

Do not mechanically preserve stale assertions if the intended product legitimately changed.

But if a test protects a real capability, preserve the capability.

When changing a contract:
- explain why;
- show the new invariant;
- do not weaken proof merely to make CI green.

---

# 34. RELEVANT HISTORICAL CANON TO PRESERVE

Earlier 4PLANET build orders established several durable ATLAS requirements:

- ATLAS is a standalone high-end global planetary data explorer.
- It must remain directly useful without a guided journey.
- World-leading does not mean the most toggles.
- Planetary data should be coherent, beautiful, source-aware and fast enough to use.
- Search / filter / inspect / compare / follow are core.
- Global place/taxon/source search where supported.
- Source-specific error / unavailable / partial coverage states.
- Time/date controls where supported by source.
- Legends and source freshness.
- Progressive loading and clustering rather than arbitrary low caps.
- Stable 2D/3D / light/dark.
- Smooth mobile sheets.
- Pan/zoom must remain uninterrupted after context open/close.
- No raw technical-console feeling for ordinary users.
- MapLibre should be preserved rather than replaced.
- Query area must not be presented as semantic place membership.
- Source failure must not become zero.
- Exact source / rights / limitations remain available.

This closure advances those principles toward a genuinely public product.

---

# 35. IMPLEMENTATION ORDER

Do not work on everything at once.

Use vertical closure.

## P0 — MAKE CURRENT LIVE PRODUCT LOVEABLE

1. Test actual LIVE desktop + mobile.
2. Produce evidence table.
3. Fix any remaining viewport/camera/panel/touch regressions.
4. Replace Place/Here first read with Human Awe Place Portrait.
5. Make Search genuinely premium on mobile.
6. Simplify visual chrome and black technical context.
7. Complete/test 4PLANET ID journey.
8. Profile and fix proven performance bottlenecks.
9. Correct remaining misleading temporal/source semantics.
10. Verify LIVE.

## P1 — MAKE THE PLANET FEEL CURRENT

11. Weather at selected place/coordinate.
12. Local time/day-night context.
13. Improve NOW relevance.
14. Improve My Atlas first read.
15. Verify LIVE.

## P1/P2 — MAKE CHANGE EXPLORABLE

16. Human TIME model.
17. First honest COMPARE.
18. Richer Place modules.
19. Watch meaningful change.
20. Verify LIVE.

Do not add a major new feature while a P0 interaction is visibly broken.

---

# 36. ACCEPTANCE / DEFINITION OF DONE

This job is not DONE because:
- code compiles;
- screenshots look good;
- a branch preview exists;
- a strategy was written.

DONE means:

## First impression
- Earth is visually dominant.
- The product is understandable within ~5 seconds.
- First-time visitor knows how to begin.
- It feels premium and calm.

## Place
- place selection gives a human first read;
- weather/local time are useful where available;
- Life/context are comprehensible;
- technical query metadata is progressive evidence depth.

## Search
- fast;
- clear;
- keyboard-safe;
- no duplicates / collisions;
- error states honest.

## Map
- no clipping;
- no camera stealing;
- smooth pan/zoom;
- mobile recovers after repeated sheets.

## Personal
- anonymous works;
- sign-in works;
- return-to-view works;
- follows/saved views persist;
- cross-domain 4PLANET ID journey proven.

## Performance
- no major invisible recurring work;
- no obvious runaway requests;
- no repeated expensive hidden polling;
- real mobile feels materially smoother.

## Truth
- no false LIVE;
- source failure ≠ zero;
- query area ≠ place membership;
- evidence remains accessible.

## Time
- classes consistent;
- forecast / historical / climatology clear.

## Weather
- source-valid;
- timestamped;
- graceful failure.

## Compare
- honest compatible comparison;
- no implied causality.

## Public readiness
- SEO metadata;
- crawlability;
- canonical;
- share;
- mobile Safari;
- desktop major browsers;
- no dead CTAs;
- no obvious console-breaking errors;
- accessibility basics.

## Release
- exact candidate built;
- exact candidate tested;
- exact candidate deployed;
- `4planetatlas.com` verified after deployment;
- rollback path known.

---

# 37. DO-NOT-LOSE CHECKLIST

Before every release confirm:

- MapLibre preserved.
- Globe preserved.
- Mercator preserved.
- Global fires preserved.
- Existing serious data layers preserved.
- Search preserved.
- Place search preserved.
- Taxon search preserved.
- Orca identity preserved.
- ATLAS ↔ SPECIES preserved.
- URL/deep-link context preserved.
- camera authority preserved.
- embeds preserved.
- source states preserved.
- source/rights detail preserved.
- anonymous follows/saved views preserved.
- signed-in state preserved.
- My Atlas preserved.
- WebGL fallback preserved.
- mobile viewport repair preserved.
- no duplicate controls.
- no return of body-wide MutationObserver sidecar.
- no return of high-frequency hidden polling.

---

# 38. WHAT CLAUDE MUST NOT DO

Do not:
- rebuild ATLAS from scratch;
- create a second ATLAS implementation;
- create a new repo;
- create a new map engine;
- create a parallel Context system;
- create a parallel source database;
- create a second Brain;
- create a second identity system;
- create a second account store;
- add new data sources just to increase count;
- remove provenance;
- hide uncertainty;
- call stale/forecast/historical data LIVE;
- force login;
- create generic social features;
- redesign unrelated products;
- touch FOOD;
- touch 4NATION;
- touch 4BRANDS;
- move unrelated domains;
- deploy unrelated product changes from ATLAS work;
- claim production success before public verification.

---

# 39. FOUNDER DECISIONS THAT ARE NOT OPEN FOR RE-DEBATE

Do not spend cycles asking whether:

- ATLAS should exist as a standalone product — yes.
- MapLibre should be replaced — no.
- 4PLANET ID should be replaced — no.
- anonymous exploration should remain — yes.
- evidence/source depth should remain — yes.
- technical metadata should dominate first read — no.
- Human Awe First is the direction — yes.
- Apple-level craft is the quality target — yes.
- weather is worth integrating — yes.
- time must be semantically honest — yes.
- compare is desired after time is coherent — yes.
- performance must remain a first-class product requirement — yes.
- the user should own the camera after interaction — yes.
- ATLAS should be independent from a guided journey — yes.
- ATLAS hosting should remain isolated from unrelated products — yes for the current deployment architecture.

---

# 40. FIRST REQUIRED CLAUDE OUTPUT

Before changing code, return:

| ISSUE | LIVE EVIDENCE | ROOT CAUSE | PROPOSED FIX | USER EFFECT | PERF EFFECT | REGRESSION RISK |
|---|---|---|---|---|---|---|

Keep it concise.

Then execute.

Do not wait for another Founder message unless:
- a real product decision conflicts with this pack;
- a source/licence decision requires Founder authority;
- a change would delete major existing functionality;
- a release would affect unrelated products;
- a genuinely irreversible operation is required.

Otherwise continue through:
**audit → fix → test → build → deploy → live verification → report**

---

# 41. FINAL PRODUCT TEST

Ask this at the end:

Can a person who has never heard of 4PLANET open ATLAS on their phone and:

- understand that they are exploring the living planet;
- move around immediately;
- search for a place or species;
- tap somewhere and receive meaningful human context;
- see what it is like there now;
- discover what lives there;
- understand what is changing;
- go deeper only when they choose;
- trust where the information came from;
- save/follow something;
- come back later and get more value;
- do all of that without the interface feeling like a database or GIS console?

If not, the job is not done.

---

# 42. NORTH STAR — LAST WORD

**THE EARTH IS THE HERO.**

The interface exists to make the real planet:
- easier to see;
- easier to understand;
- easier to explore;
- easier to follow over time.

Every control, panel, source, animation and feature must earn its place against that standard.

**EARTH FIRST.  
HUMAN AWE FIRST.  
TRUTH ALWAYS.  
DEPTH ON DEMAND.  
NO INVISIBLE WORK.  
ONE ACCOUNT.  
ONE PLANET.  
ONE COHERENT ATLAS.**
