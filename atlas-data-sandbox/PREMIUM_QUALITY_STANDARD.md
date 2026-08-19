# 4PLANET ATLAS — PREMIUM QUALITY STANDARD

Status: INTERNAL BUILD STANDARD · SANDBOX FIRST · 19 AUGUST 2026

## Target

**Research-grade truth discipline + consumer-grade interaction + premium visual restraint.**

“More data” is not a quality metric. ATLAS succeeds when a person can move from the whole planet to a specific place, species, living system, pressure or solution without losing orientation, source truth or confidence in what the interface means.

## 1. The world stays primary

Earth is the interface. Controls must not become the product.

- Map remains continuously pannable/zoomable except during deliberate transient states.
- Data overlays sit in a coherent visual stack and do not permanently obscure essential geographic context.
- Labels remain legible where the product needs place context.
- Selected objects/layers receive clear, restrained emphasis.
- Technical detail is progressively disclosed, not permanently exposed.

Reference principle: Apple HIG Maps recommends familiar interaction, avoiding interface obstruction, adapting map detail to zoom, clear selection styling, and search/filter for finding mapped content.

## 2. Progressive disclosure, not GIS overload

Default state must answer “what am I looking at?” before “how is the source configured?”

Hierarchy:

1. WORLD — map + search + current context.
2. LAYERS — useful names, ON/OFF and current status.
3. LAYER DETAIL — legend, time basis, unit, source, coverage/resolution, caveat, opacity.
4. METHODS / SOURCE — methodology, licence, provider link, full provenance.

Advanced controls are hidden until relevant. Essential truth boundaries are never hidden behind an expert-only interaction.

Reference principle: Apple HIG Disclosure Controls recommends keeping likely actions high in the hierarchy while hiding advanced detail until relevant.

## 3. Domain, lens and scene stay separate

- DOMAIN MODE: PLANET / OCE4N / E4RTH / S4PIENS.
- LENS: EARTH / NOW / WATCH.
- SCENE: bounded reusable combination of verified layers for a question/journey.

Do not create a new top-level Mode just because a useful layer combination exists.

## 4. Every layer is a truth object

Every admitted layer must carry:

- canonical layer id;
- source authority + source id;
- product name;
- spatial coverage;
- scale/resolution where known;
- observed/published/retrieved or product-version time semantics as applicable;
- units where applicable;
- licence/attribution state;
- interpretation boundary;
- current source state;
- last checked/retrieved state;
- role: FOUNDATION / HABITAT / CONDITION / LIFE / PRESSURE / HUMAN_SYSTEM;
- domain membership;
- supported journey hooks.

Failures are failures. `SOURCE_UNAVAILABLE` is never rendered as zero, absence or ecological recovery.

## 5. Time is typed, not cosmetic

ATLAS time semantics:

- STATIC — no meaningful time slider.
- SNAPSHOT — dated product/version.
- TIME_SERIES — selectable historic/periodic frames.
- CLIMATOLOGY — long-term seasonal/statistical pattern; never “NOW”.
- NEAR_REAL_TIME — source-supported recent state with retrieval/cadence caveat.

A future generic time controller may only manipulate sources whose declared temporal contract supports it.

## 6. Layer count must scale without cognitive collapse

Before the admitted layer universe grows materially, the layer console must support:

- search-as-you-type;
- domain/role filtering;
- active-only view;
- scene/preset entry points;
- progressive grouping;
- clear active count;
- source state without opening every row.

Do not surface raw OGC inventories as hundreds of user-facing toggles. Provider inventories are discovery input; ATLAS layers are curated products.

## 7. Performance is a product requirement

Large point/vector datasets should use bounded queries, clustering, vector tiling or server tiling rather than shipping huge raw GeoJSON blobs to the client. Detail should increase with zoom, not load globally by default.

Reference: MapLibre GL JS large-data guidance recommends reducing data size/properties, URL-backed or tiled data, clustering, simpler styling, and bounded min/max zoom for large datasets.

Initial release-budget work still required:

- simultaneous raster/vector layer budget;
- tile/request concurrency and failure budget;
- memory budget on 390px mobile class hardware;
- interaction latency budget;
- initial ATLAS load budget;
- scene-switch budget;
- bounded point-count/cluster strategy.

No numerical threshold is locked until measured against the real production-shaped build and representative mobile hardware/browser environments.

## 8. Cross-product journeys are first-class acceptance tests

ATLAS is not complete as a map alone.

Required journeys include:

- ATLAS → observation → SPECIES card → return to same ATLAS context.
- ATLAS → Living System → relationships/pressures → return to world.
- ATLAS → pressure → solution pathway / Mission where canonical evidence exists.
- SPECIES / Living Systems → ATLAS focus with context preserved.

Every transition must preserve canonical ids and `returnTo`/camera context where supported.

## 9. Accessibility is part of premium

- Keyboard-operable controls and rows.
- Visible focus state with sufficient contrast.
- No focus hidden behind overlays.
- Pointer targets at least WCAG 2.2 minimum or equivalently spaced.
- Reduced-motion preference respected.
- Critical data meaning does not rely on colour alone.
- Sliders have non-drag alternatives where functionally necessary.

Reference: WCAG 2.2 includes Focus Not Obscured, Focus Appearance, Dragging Movements and Target Size requirements.

## 10. Promotion gate

A sandbox layer may become a production candidate only after:

1. source/terms/rights checked;
2. adapter contract green;
3. real data returned;
4. desktop + 390px visual proof in canonical ATLAS;
5. ON/OFF + opacity + failure behaviour tested;
6. legend/unit/time/source detail adequate for its semantics;
7. performance acceptable in representative scene stack;
8. relevant cross-product journey regression green;
9. no invented interpretation or claim;
10. explicit founder release authority for production promotion.

No successful HTTP response alone can satisfy this gate.

## External standards used as design inputs

- Apple Human Interface Guidelines — Maps: https://developer.apple.com/design/human-interface-guidelines/maps
- Apple Human Interface Guidelines — Disclosure Controls: https://developer.apple.com/design/human-interface-guidelines/disclosure-controls
- Apple Human Interface Guidelines — Search Fields: https://developer.apple.com/design/human-interface-guidelines/search-fields
- MapLibre GL JS — Optimising Performance for Large GeoJSON Datasets: https://maplibre.org/maplibre-gl-js/docs/guides/large-data/
- W3C — WCAG 2.2: https://www.w3.org/TR/WCAG22/
