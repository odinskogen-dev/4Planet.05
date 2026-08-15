# 4PLANET_ V39 — BUILD REPORT

**The V38R truth-hardening & integration correction pass.**
Delivered as **v39** (ascending, never-reused version numbering).

`tsc --noEmit` clean · production build passing · `assets:verify` PASS.

---

## WHAT THIS PASS WAS

Not a redesign. Not a rewrite. The V38 review was explicit: the Earth-first product
thesis is working and must be preserved; the transitional seams beneath it needed a
truth and integration correction before this mainline feeds the shared-core synthesis.

So V39 does exactly that — plus one blocking quickfix Odin hit in use.

Nothing was faked. No contracts were locked. No prototype status was hidden to look
finished. The globe, the Atlas, the V36 layer console and the product thesis are all
preserved.

---

## 0 · QUICKFIX (blocking) — YOU COULD NOT LEAVE EARTH

**Confirmed and fixed.** When `/` became Earth, the only link back to the rest of the
site pointed at `/` — a circle back to the globe. The editorial site was unreachable,
and the editorial shell's logo *also* pointed at `/`, compounding it.

Fixed three ways so navigation loops in both directions:
- A visible **`4PLANET_` menu button** on the search line opens a proper site menu
  (Home, Domains, Missions, Impact, Living Systems, About, Atlas).
- The status-strip link now goes to `/story` (editorial home), not back to the globe.
- The editorial shell logo now returns to `/story`; the shell menu gained an
  **"Open Earth →"** link so you can cross back to the globe from anywhere on the site.

---

## CONFIRMED FINDINGS — CORRECTED

### P0 · Place query coverage was presented as semantic membership
**Confirmed. This was the most serious truth bug.** `LIFE RECORDED HERE` ran a
bounding-box query and presented the result as records belonging to the place. Norwegian
Sea returned ~44.5M records including `Picea abies` and `Pinus sylvestris` — spruce and
pine, real *inside the rectangle* (which spans Norwegian coastline), absurd *as marine
life*.

Fixed:
- `Place` now carries an explicit `geometryKind: "BOUNDING_BOX"`. v1 has only boxes,
  and the type says so.
- The section is renamed **"RECORDS IN THIS MAP AREA"**. The note states plainly that a
  bounding box is a box on a map, not the boundary of the place, that 4PLANET holds no
  real polygon for it, and — for marine areas specifically — that the box "unavoidably
  includes nearby coastline, so land-dwelling species can appear here. They are inside
  the query area; they are not marine life."
- The count label reads **"Records returned for the area"** and shows **Query geometry:
  BOUNDING BOX**.
- No false marine polygon was invented to make the label look better.

### P0 · `FOUNDER_SEEDED` conflated founder direction with evidence review
**Confirmed.** A single `reviewStatus: "FOUNDER_SEEDED"` implied Odin had reviewed the
science. He had directed which proofs to build — a product decision, not evidence review.

Fixed: `Relation` now has **two** fields. `origin` (`FOUNDER_DIRECTED` | `AI_SEEDED`)
records who constructed the edge; `reviewStatus` (`UNREVIEWED` | `LITERATURE_CHECKED` |
`EXPERT_REVIEWED`) records the evidence state — and is **`UNREVIEWED` for all 13
relations**, because that is true. Founder authority is no longer a value `reviewStatus`
can hold. The UI renders both as separate facts: `ORIGIN FOUNDER DIRECTED` and
`UNREVIEWED`, side by side.

### P0 · Observation was structurally converted into Signal in WATCH
**Confirmed.** `matchTaxa` minted a `Signal` with class `SPECIES_OBSERVATION` from a GBIF
occurrence — a semantic collapse of OBSERVATION into SIGNAL.

Fixed:
- `SPECIES_OBSERVATION` is **removed from `SignalClass`.** A signal enum no longer
  contains an observation.
- `WatchMatch` now carries `itemClass: "SIGNAL" | "OBSERVATION"` and either a `signal`
  or an `ObservationItem` — never one dressed as the other. An occurrence stays an
  `Occurrence`, with its own provenance.
- WATCH shows both classes in one list, labelled distinctly, and the copy says an
  observation "means somebody looked, not that anything changed. It is not a signal."
- A future *aggregation* of observations may become a candidate signal; a single
  occurrence never does. Documented, not built.

### P0 · Source failure collapsed into empty results
**Confirmed** in Search and WATCH.

Fixed:
- `matchTaxa` returns `{ matches, status, failedTaxa }`. A failed GBIF call becomes
  `SOURCE_UNAVAILABLE` and names the failed taxa; WATCH shows **SOURCE DOWN** and "That
  is a source failure, not an absence of records," never "NO RECORDS".
- Search tracks GBIF failure distinctly. On failure the results panel shows **"GBIF DID
  NOT ANSWER … a source failure, not an empty result — there may well be matches,"** and
  places/systems remain searchable.

### P0 · OBIS source-record origin misrepresented
**Confirmed.** The cetacean connector used an AphiaID (a WoRMS *taxon* id) as the OBIS
occurrence `sourceRecordId`, and linked the record to a WoRMS taxon page.

Fixed: the connector now uses OBIS's own occurrence `id` as `sourceRecordId` and links to
the OBIS occurrence record. Where OBIS gives no record id, both are left undefined rather
than substituting a taxon identity for a record identity. SOURCE ≠ SOURCE RECORD.

*(Note: the legacy V36 popup still shows its original WoRMS vernacular lookup for whale
cards. That path is preserved V36 and is documented as migration debt below — the new
adaptation connector is corrected.)*

### P0/P1 · Unknown entity types defaulted to COORDINATE
**Confirmed.** `typeOf()` fell through to `COORDINATE` for any unrecognised prefix,
silently making `FUNCTION` / `HUMAN_SYSTEM` and anything unknown into a spatial point.

Fixed: `typeOf()` now returns an explicit **`UNKNOWN`**, and recognises `observation` and
`coordinate` prefixes. `openEntity` handles UNKNOWN and graph-only nodes by doing nothing
(they live in the relationship chain, not as standalone spatial objects) rather than
inventing a coordinate.

### Integration · "The interface never touches an external API directly" was false
**Confirmed** — I wrote that in the V37 ADAPTATION.md and it was wrong while legacy V36
paths exist. Corrected: ADAPTATION.md now states the truth — new v1 flows go through the
adaptation layer; preserved V36 layers (WHALES/SPECIES/EVENTS/QUAKES/ISS + a WoRMS fetch)
still do direct source access. This is honest transitional architecture, and the two data
paths are documented, not hidden.

### Integration · Observation missing as a first-class Context object
**Confirmed and addressed.** `OBSERVATION` is now a first-class Context kind. Opening one
shows what was recorded, the taxon as recorded, when, where, the source, a link to the
GBIF record, and a route **observation → taxon → relationship context**. It explicitly
marks COORDINATE UNCERTAINTY and SENSITIVITY/OBFUSCATION as **NOT CHECKED** — it does not
invent fields the source didn't give.

### Integration · Taxon identity claimed multiple authorities; resolver assumed one
**Confirmed.** `openEntity` routed every taxon through GBIF resolution. Now it reads the
authority segment: a non-GBIF taxon id opens with occurrences `NOT_CHECKED` and the note
that "4PLANET's occurrence resolver is GBIF-only in v1, so it has not queried records for
this id rather than pretend a [AUTHORITY] id is a GBIF key." No silent authority collapse.

### Integration · Source implementation status ≠ rights status
**Confirmed.** `OK_FOR_LIVE_READ` read like a completed rights judgement. Split into
`implStatus` (`LIVE_READ_IN_PROTOTYPE` | `NEEDS_KEY` — what we do) and `rightsReview`
(`PENDING` for every source — what has been assessed, which is nothing; Perplexity owns
that work). No value now implies legal approval.

### Implementation · MapLibre / React stale callbacks
**Confirmed.** The blank-earth click handler, registered once, captured the first
`askHere` closure and therefore the empty signal pool; `moveend` captured the first
`writeUrl`; point-layer clicks captured the first `openEntity`. After the pool loaded,
the "what is happening here" probe used stale state.

Fixed with live refs (`askHereRef`, `writeUrlRef`, `openEntityRef`) updated every render;
the once-registered handlers call through them, so they always use current state.

---

## FINDING REINTERPRETED, NOT REJECTED

### NOW and earthquakes
The review asked me to question whether raw seismicity belongs in core NOW, using
judgement. I did **not** remove earthquakes (dropping real USGS records would be its own
dishonesty), and I did **not** leave them mixed in by volume (which risks "World
Monitor"). Instead NOW is now **two bands**: **LIVING PLANET** leads (fire + natural
events, plausible ecological bearing, NASA EONET), and **PLANETARY CONTEXT** follows,
clearly demoted, holding seismic with the note that it is "planetary context, not
living-planet change." This keeps every real record visible and honest while stopping
seismic volume from dominating the living-planet question. If you'd rather seismic leave
core NOW entirely for Atlas, that's a one-line change — say the word.

---

## FINDINGS ACKNOWLEDGED, DELIBERATELY NOT ACTIONED THIS PASS

Per the review's own boundaries (this is truth-hardening, not the simplicity redesign):

- **Two context systems** (legacy popups vs Shared Context). New objects and the new
  whale/species/signal points that carry a canonical `eid` resolve into Shared Context;
  legacy V36 points still open popups. Documented as migration debt. Not force-migrated,
  because the review said preserve V36 value and don't normalise every legacy flow.
- **Left panel reads as an intelligence console; search hierarchy; metadata weight.**
  Recorded as product-hierarchy findings for the later simplicity pass. No visual
  redesign performed. Correcting false status semantics came first, and did.
- **Occurrence model stays adaptational** — unchanged, still clearly not the BRAIN
  Observation contract. Observation Context preserves that boundary.

## STILL OPEN (unchanged, honest gaps)

- **Forest / vegetation disturbance** — still no per-event source. GFW is raster-only.
  NOW says `NO COVERAGE`. Not faked, per instruction; awaiting Perplexity's source work
  (NASA FIRMS / GLAD).
- **WDPA / protected areas** — still `NOT CHECKED`, no token registered.
- **Public decisions** — still `NO COVERAGE`, no connector.
- **Connectors not runtime-tested here** — sandbox egress blocks the live APIs. Query
  shapes are preserved from V36's production code; the error boundary added in v38 means
  a runtime failure degrades to an honest message, not a white screen.

---

## ACCESSIBILITY — PRACTICAL MINIMUM (as requested)

Not a full WCAG pass; the visual character is preserved. Applied to the core surfaces:
- Search input has an `aria-label`; results are a keyboard-operable `listbox`/`option`
  set (Tab to reach, Enter/Space to open).
- Shared-Context list rows (`Li`) are `role="button"`, focusable, Enter/Space-operable.
- Global **`:focus-visible`** outlines on every interactive element.
- **`prefers-reduced-motion`** drops the panel/sheet entrance animations and transitions.
- The site-menu button carries `aria-expanded`; the menu is a labelled `nav`.

Deeper coverage (full map keyboard control, ARIA live regions for status changes) remains
for a dedicated pass.

---

## PRESERVED FROM V36 (unchanged)

The globe, MapLibre projection, all 16 layers with their provenance notes and legend
ramps, MODES, ISOLATE, DOMAINS grouping, URL state, share links, NEAR ME, day/night
terminator, the "what is happening here" probe, honest raster degradation, the GBIF
search ranking fix, the iNaturalist exact-match guard. `/atlas` remains byte-identical.

## ACTIVE REAL INTEGRATIONS

GBIF (search, occurrences, area queries) · OBIS (cetaceans) · NASA EONET · USGS · NASA
GIBS · Global Forest Watch (raster) · NOAA Coral Reef Watch · iNaturalist · ISS. All live
browser reads; none ingested or cached; `rightsReview: PENDING` on all.

## SEEDED / ADAPTATIONAL

14-place registry (bounding boxes only), 4 living systems, 13 relations (all UNREVIEWED),
5 pressures, 3 solutions, 4 mission connections. All labelled, all rendered with truth
status. The `src/planet/` adaptation layer remains strictly typed and passes `tsc` clean;
it is not canon and ADAPTATION.md says so on every page.

---

## VERIFICATION

```
tsc --noEmit         clean
vite build           passing (World code-split, 94.9 kB / 31.1 kB gzip)
assets:verify        PASS — no missing asset references
§95 chain            traverses end to end, FOUNDER_DIRECTED · UNREVIEWED
origin/review split  0 relations with review=FOUNDER_SEEDED; all UNREVIEWED
typeOf               function → UNKNOWN, observation → OBSERVATION, garbage → UNKNOWN
```

---

## RECOMMENDED NEXT STEPS

1. **Give the seeded graph to a marine biologist and a pollination ecologist.** The
   origin/review split now makes the ask honest: these are `UNREVIEWED`, and moving any
   to `LITERATURE_CHECKED` / `EXPERT_REVIEWED` is real work with a real reviewer.
2. **Perplexity's source work → real Place polygons and the forest-disturbance source.**
   Both are the largest remaining truth gaps and both are blocked on that synthesis.
3. **One migration step on the two-context problem:** give the highest-value legacy
   points a canonical `eid` so they resolve into Shared Context, without locking contracts.
4. **Then** feed this mainline into the shared-core architecture synthesis — it is now a
   truthful transitional input, not a set of hidden false claims.

Odin has final authority. Where I reinterpreted rather than executed (NOW bands), it's
flagged above and reversible in one line.
