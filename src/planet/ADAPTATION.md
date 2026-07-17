# 4PLANET_ v1 — ADAPTATION LAYER

**Status: ADAPTATION. NOT CANON.**

This document exists because of Brief §80 and the Mandate's *PRODUCT AND TECHNICAL
BOUNDARY*: this build may not lock the Ontology, the Source Contract, the Source
Record Contract or the Signal Contract. Those are locked in BUILD 02 under founder
authority.

But v1 could not be built without *some* shared model. V36 had none — a GBIF hit in
the search box and a GBIF hit in the SPECIES layer were unrelated objects that
happened to share a Latin name. Four APIs, four private worlds.

So `src/planet/` is the **minimum shared model** needed to make one world, built as
an explicit, isolated, replaceable seam. Everything in it is documented below,
including the places where it is weaker than the Brief.

**Nothing in `src/planet/` should be promoted to canon by the fact that it shipped.**

---

## 1. THE SEAM

```
src/planet/          ← ADAPTATION. Replace freely. Strictly typed.
  types.ts             The shared shapes
  ids.ts               Canonical-shaped identity
  sources.ts           Source registry: licence, coverage, rights, cost risk
  connectors.ts        GBIF / OBIS / EONET / USGS / iNat → 4PLANET shapes
  signals.ts           ONE signal pool
  places.ts            Seeded place registry (14 places)
  livingSystems.ts     Seeded relationship graph
  follow.ts            Local-first attention
  watch.ts             Match logic with mandatory "why"

src/earth/           ← THE INTERFACE. Reads only from src/planet/.
  World.tsx            Earth-first world + lenses
  Context.tsx          The shared context layer
  layers.ts            V36's 16-layer model, extracted verbatim
  world.css
```

The **new v1 product flows** (search, Place, Context, NOW, WATCH) touch external APIs
only through `src/planet/`. They never see a `speciesKey`, an `aphiaID` or a GeoJSON
`properties` blob.

**But this is NOT true of the whole of Earth, and it would be dishonest to claim it is.**
The interface is a HONEST TRANSITIONAL ARCHITECTURE (V38R): the preserved V36 layer
system — WHALES (OBIS), SPECIES (GBIF), EVENTS (EONET), QUAKES (USGS), ISS, plus a WoRMS
vernacular fetch inside the legacy popup — still performs direct, source-specific access
from `src/earth/layers.ts` and the legacy popup path in `World.tsx`. Preserving V36 was
the right call (the mandate forbids regressing it), but it means two data paths currently
enter the same Earth:

```
NEW v1 FLOWS   → src/planet/ adaptation layer → normalised, provenance-bearing
LEGACY V36     → direct source-specific fetches → raw popup cards
```

When BRAIN exists, `src/planet/` becomes a client for it and the new flows should not
change. The legacy paths are migration debt, visible and documented, not hidden. See
the "TWO DATA PATHS" and "TWO CONTEXT SYSTEMS" sections below.

---

## 2. WHAT IS REAL AND WHAT IS SEEDED

| Layer | Status | Source |
|---|---|---|
| Species search + occurrences | **LIVE** | GBIF |
| Life recorded in a place | **LIVE** | GBIF (WKT polygon) |
| Cetacean occurrences | **LIVE** | OBIS |
| Natural events / fire | **LIVE** | NASA EONET |
| Earthquakes | **LIVE** | USGS |
| Satellite & raster layers (16) | **LIVE** | NASA GIBS, GFW, NOAA CRW |
| Taxon photographs | **LIVE** | iNaturalist |
| ISS position | **LIVE** | Open Notify |
| Day/night terminator | **COMPUTED** | Solar position, in-browser |
| **Place registry (14)** | **SEEDED** | 4PLANET |
| **Living systems (4)** | **SEEDED** | 4PLANET |
| **Relationships (13)** | **SEEDED** | 4PLANET |
| **Pressures (5)** | **SEEDED** | 4PLANET |
| **Solutions (3)** | **SEEDED** | 4PLANET |
| **Mission connections (4)** | **SEEDED** | 4PLANET |
| Protected areas | **NOT CHECKED** | WDPA — no API token registered |
| Public decisions | **NO COVERAGE** | No connector exists |
| Forest disturbance events | **NO COVERAGE** | See §4 |

Every seeded item renders with an amber `SEEDED` token and the sentence:
*"4PLANET prototype content. This is our reasoning, not a source record, and it has not
been reviewed by a domain expert."*

There is **no unmarked content** in the context layer. That is enforced structurally —
the `Section` component cannot render without a `DataStatus`.

---

## 3. IDENTITY

Format: `<type>:<authority>:<authority's own id>`

```
taxon:gbif:2440735          place:4p:bergen
living-system:4p:pollination   signal:eonet:EONET_6234
```

Brief §24: *"Source IDs are preserved. Source IDs do not replace canonical identity."*
The authority segment preserves the external id so the source can always be re-queried.
When BRAIN issues real 4PLANET ids, `ids.ts` becomes a **resolver** rather than a
formatter, and the UI does not change.

**The rule that makes this one world:** the same entity has the same id in every lens.
The humpback whale you search for, the humpback whale in the seeded coastal-sea graph,
the humpback whale you follow, and the humpback whale in your WATCH feed are all
`taxon:gbif:2440735`. That is the single most important line in this build.

---

## 4. KNOWN GAP: FOREST DISTURBANCE (Brief §95)

The Brief names three required signal classes for FIRST INTEGRATED PROOF:
FIRE ACTIVITY, **FOREST OR VEGETATION DISTURBANCE**, SPECIES OBSERVATION.

We deliver fire and species observation live. **We do not deliver forest disturbance as
a signal, and this is a real gap.**

Global Forest Watch — the forest source V36 already had — ships an **annual raster of
tree-cover loss**. It has no per-event feed. There is no honest way to turn a tile into
a dated event with a location and a provenance record. Faking one would have been easy
and would have been a lie.

So GFW remains a **map layer** (with its correct note: *"Loss is not deforestation"*),
`signals.ts` returns `NO_COVERAGE` for forest events, and the status strip says
`FOREST EVENTS · NO COVERAGE` on every screen.

**To close this gap:** wire **NASA FIRMS** (VIIRS/MODIS active fire, near-real-time,
per-detection) and/or **GLAD / RADD forest disturbance alerts** (per-alert, dated,
located). Both are real per-event feeds. Both need a source assessment first (§35).

---

## 5. SIGNAL CLASSES — A DELIBERATE DEPARTURE

The Brief's §95 list is three classes. The pool ships **four**:

- `FIRE_ACTIVITY` — EONET (required)
- `SPECIES_OBSERVATION` — GBIF (required, but see below)
- `NATURAL_EVENT` — EONET storms, volcanoes, sea ice (**added**)
- `SEISMIC` — USGS (**added**)

**Why:** V36 already displayed EONET's full event feed and USGS quakes. Suppressing real
records that the product already had, in order to match a list, would make the product
*less* truthful, not more. They are shown, classed honestly, and each carries a caveat
stating what it does and does not mean. The seismic caveat says outright: *"4PLANET draws
no ecological conclusion from it."*

**Species observations do not enter NOW.** They are a required signal class and they are
supported — but a GBIF occurrence means *somebody looked*, not *something changed*.
Firing 100,000 occurrence records into a "what is happening on Earth" feed is precisely
the *AUTOMATED DRAMA* §50 forbids. So observations enter the signal pool **only through
WATCH**, scoped to an entity a human explicitly chose to follow, and labelled
`OBSERVATION RECORD` rather than event.

**Nothing is promoted to ALERT.** Brief §39 requires a defined methodology for promotion.
We have none. `significance` is `UNCLASSIFIED` on every record, and the signal panel says
so out loud: *"4PLANET has not promoted this signal to an alert. It has no methodology
for doing so, and will not manufacture one."*

---

## 6. THE SEEDED GRAPH — WHAT IT IS AND IS NOT

Brief §25: *"The graph must not present SPECIES PERFORMS FUNCTION as unquestionable truth
merely because an engineer created the edge."*

Every one of the 13 relations carries, without exception:

```ts
interpretation: "SEEDED_PROTOTYPE"
confidence:     "HIGH" | "MEDIUM" | "LOW"
evidence:       <citation string>
origin:         "FOUNDER_DIRECTED" | "AI_SEEDED"   // why the edge exists
reviewStatus:   "UNREVIEWED"                        // evidence review — always this in v1
```

…and the UI **renders that envelope** under every claim. Verified: 0 unmarked relations.

**P0 (V38R) — origin ≠ review.** An earlier build used a single `reviewStatus` of
`FOUNDER_SEEDED`, which quietly implied the founder had reviewed the science. He had not.
Odin *directing* a proof is a product decision; it is not evidence review. These are now
two separate fields: `origin` records who constructed the edge (founder-directed vs
AI-seeded during the build), and `reviewStatus` records the evidence state — which is
`UNREVIEWED` for every prototype relation, because that is the truth. Founder authority
is deliberately not a value `reviewStatus` can take.

The required §95 chain traverses end to end:

```
Western Honey Bee
  → [PERFORMS] Pollination           (HIGH,   FOUNDER_DIRECTED · UNREVIEWED)
  → [SUPPORTS] Plant Reproduction    (HIGH,   FOUNDER_DIRECTED · UNREVIEWED)
  → [SUPPORTS] Food Production       (MEDIUM, FOUNDER_DIRECTED · UNREVIEWED)
  → [SUPPORTS] The Food System       (MEDIUM, FOUNDER_DIRECTED · UNREVIEWED)
```

**What it is not:** the citation strings are real, checkable literature pointers (Klein
et al. 2007, IPBES 2016, Roman & McCarthy 2010, the Grand Banks collapse) — but **a
citation string is not an Evidence entity**. There is no resolved Evidence object, no
contradiction handling, no expert review (§34). This graph is a **structural proof that
relationship traversal works end to end**. It is not a scientific claim.

Where the science is genuinely contested, the seeded content says so rather than
smoothing it over. The whale-pump edge is marked `UNREVIEWED` / `MEDIUM` and its evidence
note reads: *"The mechanism is credible; its magnitude at present-day whale populations is
actively debated."* The pollination→food edge carries the qualification that staple
cereals are wind-pollinated — *"which is why 'bees feed the world' is an overstatement."*

That is the tone the Brief asks for, and it is more persuasive than the overstatement.

---

## 7. PLACE: SEEDED REGISTRY, NOT A GEOCODER

14 places. Bergen is the deepest (§52). **There is no Norway branch anywhere in the code**
(§28 — global by architecture, local by context).

A geocoder (Nominatim, Mapbox, Google) would give thousands of places for free. It would
also give thousands of places with **no ecological identity, no living-system link, no
coverage story**, and — in Nominatim's case — a usage policy we have not assessed (§35: an
API existing is not permission). A place with no system context is a pin, and a pin is not
intelligence.

**To scale:** a geocoder + an entity-resolution layer that attaches system context, once
Codex owns the Place contract. The seeded registry is the proof, not the plan.

---

## 8. FOLLOW / WATCH — PRIVACY POSTURE

Brief §37: *"DO NOT COLLECT PERSONAL DATA BECAUSE IT MAY BE USEFUL LATER."*

Follow stores **one thing**, in `localStorage`, on the user's own device: a list of
canonical entity ids. **No account. No identifier. No telemetry. Nothing is sent anywhere.**
NEAR ME reads browser geolocation, uses it for one query, and forgets it — it is never
written to disk.

There are **no Follow-specific ids** (§85, and the Mandate repeats it). Follows are
canonical ids, so a followed entity is the same object everywhere.

WATCH match kinds supported by real data today:

- **PLACE** — a pool signal inside a followed place's radius
- **LIVING_SYSTEM** — a signal near a place a followed system is represented in
  (*indirect, and the `why` string says so*)
- **DIRECT** — GBIF occurrence records of a followed taxon in a 90-day window
  (*labelled `OBSERVATION RECORD`, and the `why` says "somebody looked, not that anything
  changed"*)

`WatchMatch` **cannot be constructed without a `why` string.** There is no code path that
produces an unexplained item. That is §40, enforced by the type system rather than by
discipline.

**Deliberately absent:** RELATIONSHIP MATCH (needs a resolved graph in BRAIN) and
PUBLIC DECISION MATCH (needs the DECISIONS connector — not built).

---

## 9. §COST — RATE LIMITS AND SCALE RISK

Flagged, not solved. The current posture is **live browser reads only** — no ingestion, no
caching, no redistribution. That is the lowest-rights posture available and the correct one
until the SOURCE INTELLIGENCE MAP lands and Codex builds server-side connectors.

- **NASA GIBS** is the single largest external request volume in the product. Tile requests
  scale with users × zoom. **Needs a tile-caching decision before any public launch.**
- **GBIF** has no documented rate limit and no key. Fine at current scale; server-side
  ingestion needs an agreement.
- **iNaturalist** photo licences are **per-photo and heterogeneous**. We render the
  attribution string the API returns and never re-host. A real assessment is still owed
  before any caching. Marked `NEEDS_ASSESSMENT` in `sources.ts`.
- **WDPA** requires a free UNEP-WCMC token that 4PLANET has not registered, and its licence
  **restricts commercial use** — which matters directly for §65 economic pathways.

---

## 10. WHAT MUST NOT BE COPIED FORWARD

1. `Relation.evidence` as a **string**. It must become an Evidence entity with
   contradiction handling (§34).
2. `Signal` without a proper temporal model. `occurredAt` / `sourcePublishedAt` /
   `checkedAt` are distinguished (§27) but there is no versioning of a changing record.
3. The **seeded graph content itself**. It is architecture, not knowledge. It needs domain
   review before it can carry authority.
4. `@ts-nocheck` in `src/earth/World.tsx` and `layers.ts`. Inherited from V36's Atlas for
   the same reason (imperative MapLibre glue fights React's types). The typed core in
   `src/planet/` is strict and passes `tsc --noEmit` clean. That boundary was deliberate,
   but it is a debt.
