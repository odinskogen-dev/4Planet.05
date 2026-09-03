# CLAUDE BOUNDED CODE RESULT

work_order_id: CLAUDE-TEST-KING-FRONT-DOOR-WORLD-FIRST-01
status: COMPLETED
dispatch_attempt: 3
authority: BOUNDED_CODE_CANDIDATE_ONLY
base_sha: 90db512b821371d96cc38fcf05242eff86b76f8c
candidate_branch: factory/claude-code/CLAUDE-TEST-KING-FRONT-DOOR-WORLD-FIRST-01
model: claude-opus-5
test_profile: PRODUCT_UI
completed_at: 2026-09-03T19:43:52Z
validation: PRODUCT_UI_TYPECHECK_BUILD_SMOKE_PASS
head_sha: RESOLVE_FROM_CANDIDATE_BRANCH_REF

## Changed files
- src/components/home/

## Claude report
Both candidate files are written. Nothing outside `src/components/home/` was touched.

## RETURN — CLAUDE-TEST-KING-FRONT-DOOR-WORLD-FIRST-01

**Base:** `90db512b` · **Branch:** `factory/claude-code/CLAUDE-TEST-KING-FRONT-DOOR-WORLD-FIRST-01` · **Status:** IMPLEMENTED (bounded candidate, UNMOUNTED)

### CHANGED — exact files
- `src/components/home/WorldFirstAct.tsx` (new)
- `src/components/home/world-first-act.css` (new)

No other file created or edited. No dependency, route, data, manifest or control change.

### Product concept — the encounter, not the explanation
Retained from attempt 2 and sharpened against current code. The screen after the hero is **one life, at scale, with one act**. Pure black, one photograph holding the full right column edge-to-edge, the animal's name in Instrument Sans at display scale, a short plain description, and one dominant control: `MEET THE JAGUAR →`. Beneath it a quiet typographic index of four other lives — numbers, common names, scientific names on hairlines — which swaps the protagonist in place. No product grid, no domain grid, no manifesto, no cards. The cut from planet-scale hero to a single animal is the whole idea: you meet the living world before anyone explains the organisation.

Answers without stating the questions: *what am I looking at* (name, group, scientific name, GBIF key) · *why care* (the intro sentence, in the world's terms, not 4PLANET's) · *what can I do now* (the single CTA) · *where deeper* (connected mission link, subordinate; the index; `ALL 10 SPECIES →`).

### Concrete user act
`/species/{slug}` — a real, live route with a real profile behind it. Secondary: `/missions/{missionSlug}` (AM4ZONIA_, WH4LES_, FOOD_), rendered only when `findMission()` resolves. Tertiary: `/species`.

### OBSERVED — objects/routes/media reused (nothing invented)
- `SPECIES_PROFILES`, `speciesBySlug` — `commonName`, `scientificName`, `gbifKey`, `group`, `intro`, `habitat`, `descriptorSource`, `missionSlug`.
- `speciesMedia` / `hasShowableImage` — the existing SPECIES rights gate decides whether a life may appear at all.
- `MEDIA_MANIFEST` — mobile variants derived by **exact `localPath` match**, never a guessed filename.
- `findMission` / `MISSION_CONTENT` — mission name + slug.
- `T` from `@/styles/tokens`, injected as CSS custom properties so the CSS file never becomes a second brand source.
- Roster: `jaguar` (SP-005), `orca` (founder-supplied record), `humpback-whale` (SP-001), `hyacinth-macaw` (SP-006), `western-honey-bee` (SP-008) — all `LICENCE_VERIFIED` with files on disk.

### Truth / rights decisions
- Attribution + licence + `contextLimitation` ride with every photograph in a figcaption, always visible — e.g. the jaguar shows *"Wild Pantanal jaguar; Pantanal is a distinct biome adjacent to Amazonia"* directly beside the AM4ZONIA_ link. The limitation was not hidden for beauty.
- Licence is appended only when the credit line doesn't already carry it (no "CC BY 2.0 · CC BY 2.0" noise); asset IDs stay internal.
- `descriptorSource` is surfaced as `DESCRIPTION · {source} · CHECKED {date}` so the prose is visibly bounded as description, not measurement.
- No live event, position, range, abundance, trend, partner, funding, delivery or user state is asserted anywhere.
- If a life loses cleared media it is dropped from the roster, not rendered as a gap; an empty roster renders nothing. Honest absence over fabricated completeness.
- **Chose jaguar to open** over orca: named creator, explicit CC licence, wild documentary frame. Orca's record is licence-verified but "founder-supplied (provenance only)" — kept in the roster, not the opening frame.

### Mobile / accessibility / performance
- Single column under 1000px, photograph first via CSS `order`, 4:3 then 4:5 under 620px, capped at 62svh; scientific names drop from the index at narrow widths.
- `<picture>` serves the manifest mobile variant under 1000px; images `loading="lazy"` + `decoding="async"`; next photograph warmed on hover/focus **at the size that viewport will actually use**.
- Full `tablist`/`tab`/`tabpanel` semantics, roving `tabIndex`, Arrow/Home/End with wrap, focus follows selection, blue `:focus-visible` rings.
- All text on black at ≥ ~5:1 contrast; the 9.5px rights type sits on a gradient scrim.
- `prefers-reduced-motion` kills both keyframes and every transition/transform.

### UNCHANGED / deliberately UNMOUNTED
`Home.tsx`, `AtlasHero.tsx` (Founder LOST GOLD donor, untouched), `PublicShell.tsx`, `ProductSwitcher.tsx`, `App.tsx`, `Species.tsx`, `src/earth/**`, routes and data. The component is imported by nothing, so it will tree-shake out of `dist` — expect no change in the smoke-test bundle assertions.

### PROPOSED — full integration once ownership is clear
1. `src/pages/v5/Home.tsx`: render `<WorldFirstAct />` immediately after `<AtlasHero />`, **above** the blue `#why-4planet` premise block. Convergence seam: Home only.
2. `AtlasHero.tsx`: retarget the primary hero control from `WHY 4PLANET ↓` to the encounter (`MEET LIFE ↓`, anchor into this section) and demote the manifesto to a text link. This is the actual change that converts the first 30 seconds; it needs the hero's owner.
3. Then delete or fold the `ONE PLANET · FOUR PUBLIC LENSES` four-card block — with the encounter present it is the competing-four-taxonomy problem restated. REDUCE BEFORE GENERATE; this is a deletion, not another layer.
4. Optional, later: promote the encounter's index pattern into the SPECIES index (`Species.tsx`, PR #79 seam) so the front door and SPECIES share one interaction grammar.

I'd flag that items 1–3 are one product decision, not three. Mounting the module without item 2 leaves two competing first acts on the page.

### BRAND LEARNING CANDIDATES
1. **Multi-object modules in default 4PLANET context stay brand-blue.** *REFINES* §4 single-accent law. Evidence: this module rotates across OCE4N_, E4RTH_ and S4PIENS_ species; accenting by the active species' domain would flicker three interface colours on one screen. Rule: when a surface's protagonist changes across domains, the accent belongs to the *surface's* context (brand blue), not the object's domain. Applies to front door, indexes, cross-domain modules; does **not** apply inside a Domain or Mission page, where the domain colour is correct.
2. **Rights metadata is composed, not concatenated.** *REFINES* §5. Evidence: `attribution` already ends with the licence for manifest-backed assets, so a naïve `attribution · licence` line reads "CC BY 2.0 · CC BY 2.0 (SP-005)". Rule: render the rights line as filtered parts and suppress a licence the credit already states — full honesty, no duplicated tokens. Applies wherever `MEDIA_MANIFEST`-backed media is credited.
3. **A typographic index outperforms a card grid for "more of the same kind of thing."** *CONFIRMS* §7 REDUCE BEFORE GENERATE and the anti-card-catalogue control, with a reusable mechanism: number + name + scientific name on hairlines, as a real tablist, changes one dominant object in place instead of showing five weak ones at once.

**Next gate:** Factory scope firewall + `typecheck` / `build` / `test:smoke`, then AXE/Founder inspection of the rendered candidate. Technical PASS ≠ product acceptance; this has had no rendered-browser verification from me — I have no shell authority in this run.
