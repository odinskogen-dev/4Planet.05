Warning: truncated output (original token count: 74001)
Total output lines: 3372

Warning: truncated output (original token count: 72636)
Total output lines: 3245

# HOMEPAGE — MOBILE SCALED-HERO OVERFLOW CONTAINMENT — 29 OCTOBER 2026

**STATUS:** GOLD-RETURNED MOBILE CORRECTION / CODE CANDIDATE ONLY / NO RELEASE.

## USER ARRIVES BECAUSE

A mobile visitor opens the public front door and needs a stable page that does not pan sideways while the hero image breathes.

## ONE THING TO UNDERSTAND

The living-Earth image may animate inside its hero, but it must not enlarge the document canvas.

## PRIMARY ACTION

Contain the intentionally scaled hero image at the hero boundary on 390px and 430px viewports.

## SECONDARY DEPTH

Preserve the full-height mobile invitation, hero copy, actions, desktop crop and reduced-motion behaviour.

## P1 DOMINANT

The Earth image and “Everything you love is connected” invitation remain dominant.

## P2 ORIENTATION

The 4Planet kicker and supporting sentence remain unchanged.

## P3 ACTION / NEXT

The existing Explore the planet and Join us actions remain unchanged.

## P4 DEPTH

The rest of the homepage and embedded ATLAS remain outside this bounded correction.

## WHAT CAN BE REMOVED

Remove only the mobile hero's visible overflow path into the document canvas.

## WHAT MUST BE REUSED

Reuse the existing `.planet-hero`, animated `.earth-breathe` image, sole `king/test` HEIR, issue #145, Atomic `P51-SHIP-01` and Human Craft exact-viewport workflow.

## TRUTH BOUNDARY

The causal regression proves the scaled image recreates at least 4px of document overflow when containment is temporarily disabled and that the permanent scoped state removes it. It does not prove Gold acceptance, deployment, LIVE behaviour or user use.

## MOBILE-FIRST RISK

Changing global overflow could hide unrelated defects; containment must remain scoped to the owning hero and preserve its auto-height mobile layout.

## HUMAN SUCCESS

At 390px and 430px the animated image remains wider than its hero, a temporary `overflow: visible` override recreates the defect, and the permanent hero-scoped clip keeps document overflow at one pixel or less without changing desktop behaviour.

**ROOT CAUSE / FAILED TEST / IMMUNITY:** the mobile media query overrode the desktop hero's containment with `overflow: visible`; the full-width image animates at `scale(1.025+)`, matching the native 5px overflow at both failing viewports. The owning Human Craft regression now records hero/image rectangles, proves the failure under a temporary visible-overflow override and requires the scoped clip plus clean document width.

**DOOR / ROLLBACK / JUDGE:** Reversible HEIR-only CSS/test correction. Base and rollback are `king/test@0eee4dfdfdb3e8f9818617f0d375684bf1cc11c4`. Factory returns CODE FIXED evidence only; independent Gold judges the exact SHA and Founder retains deploy/LIVE authority.

---

# SHARED PUBLIC NAVIGATION — DESKTOP ESCAPE DISMISSAL — 29 OCTOBER 2026

**STATUS:** GOLD-RETURNED ACCESSIBILITY CORRECTION / CODE CANDIDATE ONLY / NO RELEASE.

## USER ARRIVES BECAUSE

A keyboard or pointer user opens the shared EXPLORE navigation and needs Escape to close it predictably.

## ONE THING TO UNDERSTAND

Escape is an explicit dismissal: the panel stays closed while the pointer is stationary and opens again only after a deliberate pointer re-entry or focus action.

## PRIMARY ACTION

Close the active desktop navigation panel on Escape and suppress the current hover entry until the pointer leaves its trigger.

## SECONDARY DEPTH

Preserve outside-click, delayed hover, intentional click/focus opening, mobile Escape/focus return and all existing navigation links.

## P1 DOMINANT

The shared header remains the sole orientation and navigation surface.

## P2 ORIENTATION

The selected navigation family and its panel remain exposed only while requested.

## P3 ACTION / NEXT

Escape returns the visitor to the page; deliberate re-entry or focus reopens the same navigation family.

## P4 DEPTH

Existing product, domain, mission, culture, about and take-part links remain unchanged.

## WHAT CAN BE REMOVED

Remove the desktop state in which an open panel ignores Escape.

## WHAT MUST BE REUSED

Reuse `PublicShell`, its existing close primitive, sole `king/test` HEIR, issue #145, Atomic `P51-SHIP-01` and the Human Craft exact-viewport regression.

## TRUTH BOUNDARY

This correction proves source and browser behaviour only after independent exact-SHA CI. It does not prove mobile overflow closure, Gold acceptance, deployment, LIVE behaviour or user use.

## MOBILE-FIRST RISK

The desktop listener must not intercept the mobile dialog's existing Escape close and focus-return contract.

## HUMAN SUCCESS

At 1440px EXPLORE closes on Escape, remains hidden while the pointer is stationary, and reopens on deliberate pointer re-entry and keyboard focus; mobile Escape remains owned by the dialog.

**ROOT CAUSE / FAILED TEST / IMMUNITY:** the only document Escape listener was conditional on `mobileOpen`, leaving desktop `panel` state without a keyboard close path. The owning Human Craft test now asserts persistent dismissal plus deliberate pointer and focus re-entry without weakening the existing hidden assertion.

**DOOR / ROLLBACK / JUDGE:** Reversible HEIR-only correction. Base and rollback are `king/test@80085677ee438dd3ab2dff3be3d04c6bf4c5485b`. Factory returns CODE FIXED evidence only; independent Gold judges the exact SHA and Founder retains deploy/LIVE authority.

---

# SPECIES — BLOCKED ORCA BINARY OUT OF PUBLIC ARTIFACT — 28 OCTOBER 2026

**STATUS:** GOLD-RETURNED P0 STATIC-ASSET CORRECTION / CODE CANDIDATE ONLY / NO RELEASE.

## USER ARRIVES BECAUSE

A visitor, crawler or social preview must not be able to retrieve a photograph whose exact source and public rights remain unresolved.

## ONE THING TO UNDERSTAND

Failing closed in React is insufficient when the same blocked file is still copied into the public deployment artifact.

## PRIMARY ACTION

Remove the `CUR-ORCA-01` photo and its mobile derivative from the public deploy root while preserving their immutable Git blob identities and canonical rights-bank BLOCK record.

## SECONDARY DEPTH

Use the existing 4PLANET-owned Orca illustration for discovery/social metadata and preserve the factual profile, ATLAS handoff and verified media for other species.

## P1 DOMINANT

The factual Orca identity remains available without exposing the blocked photograph.

## P2 ORIENTATION

The existing no-photo state explains that a rights-cleared photograph is unavailable.

## P3 ACTION / NEXT

Visitors can continue through the factual profile and ATLAS; independent Gold judges the exact returned SHA and direct preview responses.

## P4 DEPTH

The canonical bank and immutable Git history preserve the blocked asset identity for later licence recovery without making the bytes public.

## WHAT CAN BE REMOVED

Remove the blocked desktop/mobile photo bytes, stale public-manifest production classification and stale social-image reference.

## WHAT MUST BE REUSED

Reuse issue #145, Atomic `SPEC-GS-09`, sole `king/test` HEIR, canonical `CUR-ORCA-01`, the existing no-photo presentation, owned illustration, build pipeline and owning source/browser contracts.

## TRUTH BOUNDARY

This correction can prove that the blocked paths are absent from source and built public artifacts and return no preview asset. It does not establish the missing licence, Gold acceptance, deployment, LIVE behaviour or user use.

## MOBILE-FIRST RISK

The mobile derivative is the same rights family and must not remain addressable after the desktop photo is withheld.

## HUMAN SUCCESS

Desktop and mobile preview requests for both blocked paths return 404, the owned illustration remains available for discovery metadata, and Orca’s factual profile plus Jaguar’s verified media remain intact.

**ROOT CAUSE / FAILED TEST / IMMUNITY:** the H22 correction gated DOM rendering but retained `hero.jpg` and its derivative under Vite’s copied `public/` root; discovery metadata also still named the blocked photo. The new source regression fails while either binary or stale reference exists, the post-build regression rejects copied blocked bytes, and the browser contract requires direct preview 404s plus an owned-illustration positive control.

**DOOR / ROLLBACK / JUDGE:** Reversible HEIR-only correction. Base and rollback are `king/test@961c2154cd0e58411c260c6d0eb8d97dbc4a0e69`; immutable blob evidence remains `595c1b9cf1917faf3b4cfbd55d754df41b6cfb25` and `98b7cc9dccd527a1e1c43f00cf78c3ff63ffacf0`. Factory returns CODE FIXED evidence only; independent Gold judges the exact SHA and Founder retains deploy/LIVE authority.

---

# SPECIES — CANONICAL ORCA RIGHTS FAIL-CLOSED — 28 OCTOBER 2026

**STATUS:** GOLD-RETURNED P0 RIGHTS CORRECTION / CODE CANDIDATE ONLY / NO RELEASE.

## USER ARRIVES BECAUSE

A visitor opening the Orca profile must not be shown a photograph whose exact source and public/commercial rights remain unresolved.

## ONE THING TO UNDERSTAND

The factual species profile remains available while the blocked photograph remains unavailable.

## PRIMARY ACTION

Bind the Orca hero record to canonical asset `CUR-ORCA-01`, mark it `PENDING`, and fail closed to the existing no-photo state.

## SECONDARY DEPTH

Preserve the taxon, evidence, ATLAS handoff and existing verified-media behaviour for other species.

## P1 DOMINANT

The species identity remains dominant; no blocked photo or misleading photo credit is rendered.

## P2 ORIENTATION

The existing honest message states that a rights-cleared photograph is not available.

## P3 ACTION / NEXT

Visitors can continue into the factual profile and ATLAS; independent Gold judges the exact returned SHA.

## P4 DEPTH

The canonical rights bank remains authoritative for the asset block and any future licence recovery.

## WHAT CAN BE REMOVED

Remove only the blocked Orca photograph and its presentation credit from the rendered profile.

## WHAT MUST BE REUSED

Reuse issue #145, Atomic `SPEC-GS-09`, sole `king/test` HEIR, `speciesMedia`, the existing no-photo state, and the owning source/browser regressions.

## TRUTH BOUNDARY

This correction proves only that canonical `CUR-ORCA-01` BLOCK state prevents the photo from rendering. It does not establish the missing source/licence, Gold acceptance, deployment, LIVE visibility or user use.

## MOBILE-FIRST RISK

The compact profile previously made the blocked photograph and its unsupported founder-supplied rights statement especially prominent.

## HUMAN SUCCESS

At compact and desktop widths Orca renders no blocked hero image or image-credit strip, keeps the factual profile usable, and Jaguar retains its verified Commons image and source.

**ROOT CAUSE / FAILED TEST / IMMUNITY:** the repository-local media record asserted `LICENCE_VERIFIED`, public and commercial permission without reconciling canonical asset `CUR-ORCA-01`, whose source and licence are unresolved and explicitly BLOCK. The new canonical-ID negative regression fails first, then requires `PENDING` plus false public/commercial flags and route-level no-photo/no-credit browser proof while preserving Jaguar's positive verified path.

**DOOR / ROLLBACK / JUDGE:** Reversible HEIR-only correction. Base and rollback are `king/test@3608b2dc56cde8bf1bd0c65f0d3d594cd2c05b78`. Factory returns CODE FIXED evidence only; independent Gold judges the exact SHA and Founder retains merge/deploy/LIVE authority.

---

# SPECIES — MEDIA SOURCE SEMANTICS — 28 OCTOBER 2026

**STATUS:** GOLD-RETURNED PROVENANCE CORRECTION / CODE CANDIDATE ONLY / NO RELEASE.

## USER ARRIVES BECAUSE

A visitor opening a licensed SPECIES image needs source labels that describe the linked evidence truthfully.

## ONE THING TO UNDERSTAND

A taxon reference identifies the species; it does not identify who created the photograph or where that image came from.

## PRIMARY ACTION

Label the Orca GBIF species page as `TAXON SOURCE` and reserve `IMAGE SOURCE` for manifest records with an exact provider file page.

## SECONDARY DEPTH

Keep the existing attribution and licence record, without inventing an Orca creator, ownership claim or photo-source URL.

## P1 DOMINANT

The animal and species identity remain visually dominant.

## P2 ORIENTATION

The compact credit distinguishes the available reference by evidence type.

## P3 ACTION / NEXT

Visitors can open the taxon reference or a verified image file page under the correct label; independent Gold judges the exact returned SHA.

## P4 DEPTH

The existing rights and evidence records remain the source of licence detail and limitations.

## WHAT CAN BE REMOVED

Remove only the inaccurate `IMAGE SOURCE` label from the Orca GBIF taxon link.

## WHAT MUST BE REUSED

Reuse issue #145, Atomic `SPEC-GS-09`, sole `king/test` HEIR, `speciesMedia`, the compact credit component and its owning source/browser regressions.

## TRUTH BOUNDARY

This correction proves only that the UI distinguishes a taxon reference from a manifest-backed image source. It does not establish the missing Orca photo origin, Gold acceptance, deployment, LIVE visibility or user use.

## MOBILE-FIRST RISK

The compact credit is the only visible source surface below 620 pixels, so a false label there directly misstates provenance.

## HUMAN SUCCESS

At 390 and 430 pixels Orca exposes `TAXON SOURCE` with no `IMAGE SOURCE`; Jaguar retains its exact Commons file-page `IMAGE SOURCE`; desktop keeps the existing subtle overlay and no duplicate.

**ROOT CAUSE / FAILED TEST / IMMUNITY:** a generic `sourcePage` field was rendered unconditionally as `IMAGE SOURCE`, although Orca stored a GBIF species page while manifest-backed records stored actual image file pages. The new negative Orca and positive Jaguar source/browser regressions fail first, then require explicit source semantics at the owning media record and route.

**DOOR / ROLLBACK / JUDGE:** Reversible HEIR-only correction. Base and rollback are `king/test@486d4b5dc162aebfccd587d4619319b22127e125`. Factory returns CODE FIXED evidence only; independent Gold judges the exact SHA and Founder retains merge/deploy/LIVE authority.

---

# SPECIES — COMPACT MEDIA CREDIT OUTSIDE HERO — 28 OCTOBER 2026

**STATUS:** GOLD-RETURNED SOURCE CORRECTION / CODE CANDIDATE ONLY / NO RELEASE.

## USER ARRIVES BECAUSE

A visitor opens a licensed SPECIES photograph on a compact screen and needs to identify its creator, source and licence without obscuring the animal.

## ONE THING TO UNDERSTAND

The animal remains the first read; its media credit remains visibly and accessibly attached immediately below the hero.

## PRIMARY ACTION

Keep the compact hero clear and expose the exact recorded attribution plus source and licence links outside it.

## SECONDARY DEPTH

Keep the existing desktop overlay and full evidence/source records; do not create another rights store or infer a missing licence URL.

## P1 DOMINANT

The animal and species identity remain visually dominant.

## P2 ORIENTATION

A compact attribution strip immediately below the hero identifies the image record.

## P3 ACTION / NEXT

The visitor can open the recorded image source or licence; independent Gold must judge the exact returned SHA.

## P4 DEPTH

The existing evidence records remain the source of rights detail and limitations.

## WHAT CAN BE REMOVED

Nothing from the rights record. Only the inaccessible compact presentation state is replaced.

## WHAT MUST BE REUSED

Reuse issue #145, Atomic `SPEC-GS-09`, sole `king/test` HEIR, `speciesMedia`, the existing compact first-read stylesheet and owning source/browser regressions.

## TRUTH BOUNDARY

This correction can prove that compact source code and exact-SHA browser checks expose recorded attribution and links. It does not prove licence ownership beyond the existing record, Gold acceptance, deployment, LIVE visibility or user use.

## MOBILE-FIRST RISK

A hidden hero overlay without an outside replacement erases required attribution at 390/430 widths. The returned regression must cover that exact state and preserve no horizontal overflow.

## HUMAN SUCCESS

At 390 and 430 pixels a visitor can read the credit and keyboard-open the recorded image source or licence; at 1440 the existing subtle hero credit remains and no duplicate appears.

**ROOT CAUSE / FAILED TEST / IMMUNITY:** the prior contract proved only that the credit string remained in JSX while compact CSS hid its sole rendered location. The new source regression failed first at 10/11, then requires the semantic outside-hero block, exact media source/licence bindings and inverse compact/desktop visibility. The browser regression verifies visibility, link target and no horizontal overflow.

**DOOR / ROLLBACK / JUDGE:** Reversible HEIR-only correction. Base and rollback are `king/test@ddcbb0836d04d5bee65021fcd29492b83da4c9f3`. Factory returns CODE FIXED evidence only; independent Gold judges the exact SHA and Founder retains merge/deploy/LIVE authority.

---

# ABOUT STORY — EDGE-TO-HYDRATION SCHEMA OWNERSHIP — 27 OCTOBER 2026

**STATUS:** CODE FIXED ON HEIR / QA_READY / INDEPENDENT GOLD, EXACT-SHA BROWSER AND RELEASE HOLD.

## USER ARRIVES BECAUSE

A visitor or crawler opening `/about/story` should receive one stable `AboutPage` identity in raw HTML and still have exactly one after the React page hydrates or the visitor navigates away and back.

## ONE THING TO UNDERSTAND

The edge graph and client graph describe the same page; they must use the existing ownership lifecycle rather than accumulate as competing structured identities.

## PRIMARY ACTION

Mark only the canonical edge-appended JSON-LD as `data-4planet-prerender="true"` so the existing client cleanup removes it before installing the hydrated page graph.

## SECONDARY DEPTH

Keep the valid raw-response deduplication, canonical Story copy, private-preview noindex policy and all unmarked third-party JSON-LD unchanged.

## P1 DOMINANT / P2 ORIENTATION / P3 ACTION / P4 DEPTH

One raw `AboutPage` graph / existing ownership marker / client replaces rather than duplicates / independent production-host and mobile browser verification remains the release proof.

## WHAT CAN BE REMOVED

Remove only the unowned state of the newly appended edge graph; do not remove third-party graphs or add another renderer or cleanup system.

## WHAT MUST BE REUSED

Reuse issue #483, draft PR #131, sole `king/test` HEIR, `structuredData`, `removeOwnedJsonLd`, the owning host-indexing and schema-ownership contracts, and the exact rollback `a7962c7a060ef7999b530eb1225945a7853e5fe7`.

## TRUTH BOUNDARY

The bounded production-host replay now proves raw→hydrated→repeat-navigation graph ownership in the repository model: host boundary 28/28, shared ownership 4/4 and discovery 31/31 pass, alongside typecheck, lint, build, doctrine, authority, Gold policy and zero-vulnerability audit. It cannot prove a deployed Cloudflare runtime, immutable preview behaviour, indexing, traffic or user use.

## MOBILE-FIRST RISK

No visible layout changes. Chromium desktop/390 and WebKit 390 remain required to verify hydration without metadata or visible-page regression.

## HUMAN SUCCESS

The Story stays readable before JavaScript and retains one consistent machine-readable page identity after hydration and repeat navigation, without deleting third-party structured data.

**ROOT CAUSE / FAILED TEST / IMMUNITY:** The prior repair removed the built prerender graph but appended a new unmarked edge graph. The client removes only marked/ID-owned graphs, so hydration could add a second `AboutPage`. The built-page-shaped edge→client lifecycle regression failed first at 27/28, then passed 28/28 after the one-attribute correction; it locks raw count 1, hydrated count 1, repeat-navigation count 1 and third-party preservation.

**DOOR / ROLLBACK / JUDGE:** Reversible HEIR-only correction. Roll back to `king/test@a7962c7a060ef7999b530eb1225945a7853e5fe7` if independent Gold finds schema, canonical, third-party or route regression. Maker returns CODE FIXED evidence only; independent Gold judges exact SHA and Founder retains merge/deploy/LIVE authority.

# ABOUT STORY — OWNED SCHEMA DEDUPLICATION — 27 OCTOBER 2026

**STATUS:** CODE FIXED ON HEIR / INDEPENDENT GOLD AND EXACT-SHA RUNTIME HOLD / NO MERGE OR LIVE RELEASE.

**USER ARRIVES BECAUSE:** a visitor or crawler opens the accepted public `/about/story` route and should receive one clear page identity rather than two competing owned `AboutPage` graphs.

**ROOT CAUSE / FAILED TEST:** the built page already contains the marked prerender `AboutPage` graph, while production-host middleware appended the canonical edge graph without removing the prerender owner. The old empty-shell fixture could not reproduce that overlap. The new built-page-shaped fixture failed 27/28 with two owned `AboutPage` graphs.

**BOUNDED CORRECTION:** before appending the canonical edge graph, remove only `script[type="application/ld+json"][data-4planet-prerender="true"]`. Unmarked and third-party JSON-LD remains untouched; layout, homepage, `/about` and `/now` are unchanged.

**TRUTH BOUNDARY:** the owning host-indexing contract passes 28/28, schema ownership 4/4, discovery 31/31, typecheck, lint, build and zero-vulnerability audit locally. Exact-base HEIR proved the visible desktop journey, but the preview proxy does not execute the `4planet.org` production-host branch. Exact-candidate native preview, production-host replay and 390px Chromium/WebKit evidence remain required.

**DOOR CLASS / ROLLBACK:** reversible HEIR-only correction. Base and rollback are `king/test@2f8fa03117c25898085411d760624e0548bfa32e`; revert this middleware/test/brief sequence if independent Gold finds schema loss or third-party graph damage.

**MAKER ≠ JUDGE:** Factory provides CODE FIXED evidence only. Independent Gold must judge the exact returned SHA; Founder retains merge, deployment and LIVE authority.

# ABOUT STORY — EDGE SERVER-READABLE ENTRY — 27 OCTOBER 2026

**STATUS:** CODE FIXED / ISSUE #483 / DRAFT PR #131 / SOLE HEIR `king/test` / EXACT BASE `dff4c514554f9498408e823d5617b4ca898b9b9a` / INDEPENDENT GOLD REQUIRED / NO MERGE, DEPLOYMENT OR LIVE RELEASE.

## USER ARRIVES BECAUSE

A search result or shared link can land directly on `/about/story`; the first HTTP response must explain why 4PLANET exists before JavaScript runs.

## ONE THING TO UNDERSTAND

The living planet is the system beneath human life, and the existing Story explains why 4PLANET is being built to make that system easier to see, understand and help.

## PRIMARY ACTION

Add only `/about/story` to the existing `FOURPLANET_ROUTES` edge registry so the shared `discoveryFallback` emits the already-approved Story title, description, H1, body and internal continuations.

## SECONDARY DEPTH

Retain the existing self-canonical metadata, `AboutPage` structured data, preview-host noindex policy and hydrated React Story without adding a renderer, page, content store or new copy.

## P1 DOMINANT

The raw production-host response contains one substantive Story H1 and body instead of an empty app shell.

## P2 ORIENTATION

The response keeps the exact existing Story title and description and links to the existing System, beliefs and Join routes.

## P3 ACTION / NEXT

Independent Gold must judge the exact returned SHA and verify raw HTTP plus hydrated desktop, Chromium 390 and WebKit 390 evidence on an immutable preview.

## P4 DEPTH

After independent acceptance and a separately authorised release, the existing SEO owner may verify indexing and matched-period entry behaviour; source success does not imply traffic or user use.

## WHAT CAN BE REMOVED

Remove only the unknown-route fall-through that leaves this approved Story as the generic app shell at the edge.

## WHAT MUST BE REUSED

Reuse issue #483, draft PR #131, sole HEIR `king/test`, existing Story wording, `discoveryFallback`, `structuredData`, preview-host protections, prerender output and owning middleware contract.

## TRUTH BOUNDARY

This repair makes an existing organisational Story readable in raw HTML. It claims no ecological outcome, partner relationship, deployment, indexation, traffic, Gold acceptance or user use.

## MOBILE-FIRST RISK

No visual component or layout changes. Browser/mobile checks remain required to prove the existing hydrated Story has no duplicate H1 or metadata drift.

## HUMAN SUCCESS

Without JavaScript, a visitor or crawler can understand why 4PLANET exists and continue through valid About links; with JavaScript, the current visual Story remains unchanged.

**ROOT CAUSE / FAILED TEST / REGRESSION:** The shared middleware had no `/about/story` entry, so it deliberately returned the upstream shell unchanged. The new owning-path HTTP test failed first with 26/27 passing, then passed 27/27 after the single route configuration was added. It locks exact title, description, self-canonical, one H1, substantive existing body, three internal links and `AboutPage` schema.

**ROLLBACK / GOLD HOLD:** Roll back to `king/test@dff4c514554f9498408e823d5617b4ca898b9b9a` if independent Gold finds metadata, body, link, layout or publication-policy regression. `/about`, `/now`, the homepage, merge, deployment, LIVE verification and USER USED remain unchanged or HOLD.

---

# EARTH NOW + ABOUT — CANONICAL ACCEPTANCE CONTRACT — 27 OCTOBER 2026

**STATUS:** CONTROL BRIEF REPAIRED / ISSUE #483 / DRAFT PR #131 / SOLE HEIR `king/test` / EXACT PARENT `10e0d881278e397d68d32258768918cf5f682d11` / INDEPENDENT RE-GOLD REQUIRED / NO MERGE, DEPLOYMENT OR LIVE RELEASE.

## USER ARRIVES BECAUSE

A visitor or crawler must reach one stable public identity for Earth Now and About without a redirect loop, duplicate canonical, conflicting hydrated metadata or accidental publication of an unreleased route.

## ONE THING TO UNDERSTAND

Earth Now canonically ends at `/now/`; About canonically ends at `/about`. Source agreement is necessary but not release proof: the actual host must return the intended one-hop redirects and raw HTML must remain identical in meaning after hydration.

## PRIMARY ACTION

Keep the existing canonical consolidation on issue #483 and draft PR #131, then extend the owning `tests/e2e/seo-jsonld-runtime.spec.ts` acceptance path to verify real alias HTTP status and `Location`, one hop, and raw-to-hydrated SEO parity. The separate implementation/string contracts remain supporting guards.

## SECONDARY DEPTH

For each canonical page compare title, description, robots, canonical URL and exactly one owned JSON-LD graph before and after hydration. Retain unreleased Kenya and unknown/private noindex controls so a public canonical repair cannot broaden publication.

## P1 DOMINANT

No visitor, crawler or share target is trapped in a slash redirect loop or given competing Earth Now/About identities.

## P2 ORIENTATION

Navigation, router aliases, sitemap, prerender output and hydrated `Seo` all point to `/now/` and `/about` respectively, while legacy entry URLs resolve in one deliberate hop.

## P3 ACTION / NEXT

Independent Gold must run the exact candidate on an immutable preview and return native Chromium desktop, Chromium 390 and WebKit 390 evidence, including raw HTTP/HTML receipts. Any mismatch returns QA_CORRECT to this same issue and receiver.

## P4 DEPTH

After Gold and a separate Founder-authorised LIVE release, the existing SEO owner may refresh matched-period GSC Pages, PageQueries and URL inspections. Traffic, indexing and user-use outcomes are not inferred from source or preview success.

## WHAT CAN BE REMOVED

Remove only the accidental one-line/binary replacement of this control brief. Do not remove historical Gold evidence, existing redirects, negative publication controls, source/rights disclosures or prior lessons.

## WHAT MUST BE REUSED

Reuse issue #483, draft PR #131, `king/test`, the discovery canonical registry, existing prerender/sitemap/router/`Seo` owners, `scripts/gold-policy-check.mjs`, the owning SEO browser test and the historical control brief restored from exact parent `14c46ab9115da3fd58be3b2881e25cfde54cc157`.

## TRUTH BOUNDARY

Exact candidate `10e0d881278e397d68d32258768918cf5f682d11` established source/build alignment but independent Gold returned QA_CORRECT: five physical guards were absent—`GET /now` 301 plus exact `Location`, `GET /about/` 301 plus exact `Location`, and raw-versus-hydrated title, description and robots parity. The same SHA then failed native Gold because this file had collapsed from 2,809 lines to one non-substantive line. Restoring this brief repairs the authority gate only; it does not accept the SEO candidate or prove preview, indexing, traffic, usability or user use.

## MOBILE-FIRST RISK

Canonical metadata can diverge by browser hydration even when static output is correct. Chromium 390 and WebKit 390 remain mandatory alongside desktop Chromium; no mobile layout change is authorised by this brief repair.

## HUMAN SUCCESS

A person can enter either accepted URL form, land once on the correct canonical page, read the intended content without clutter or navigation breakage, and share a stable address. A crawler receives the same title, description, robots, canonical and owned structured-data meaning that the hydrated browser exposes.

**ROOT CAUSE / FAILED TEST / REGRESSION:** The prior change overwrote the cumulative control brief instead of appending a bounded current section, so `gold-policy-check.mjs --mode=king-push` failed all 13 required headings. The repaired file preserves the full 2,809-line history and adds this current 13-heading contract at the owning path. The five SEO acceptance gaps remain intentionally open for the next bounded code correction; policy code is unchanged.

**ROLLBACK / FOUNDER HOLD:** Roll back only this brief repair to `10e0d881278e397d68d32258768918cf5f682d11` if independent Gold finds lost or false control history. Product Gold, merge, deployment, LIVE verification and user-use claims remain HOLD. Founder retains release authority.

---

# OSLOFJORD — MAP-OWNED STATUS ORACLE — 26 OCTOBER 2026

**STATUS:** CODE FIXED / ISSUE #157 / SOLE HEIR `king/test` / SELECTOR-ONLY GOLD BRIEF CORRECTION / INDEPENDENT FULL PRODUCT GOLD REQUIRED / NO MERGE, DEPLOYMENT OR LIVE RELEASE.

**USER ARRIVES BECAUSE / ONE THING TO UNDERSTAND:** A visitor opening the Oslofjord Living System must receive the sourced reading even when WebGL2 is unavailable. The product proof must judge the map-owned status, not fail on the shared empty global live region.

**PRIMARY ACTION / SECONDARY DEPTH:** Scope the existing Playwright status locator to the map's `MAP ·` text contract and require exactly one matching node; retain the existing desktop/mobile, canonical-alias, evidence, controls, sources and no-WebGL2 assertions without weakening them.

**P1 / P2 / P3 / P4:** P1 readable Oslofjord content and accessible fallback; P2 map status and disabled-control orientation; P3 source disclosure and continuation; P4 map evidence depth when WebGL2 is available.

**REMOVE / REUSE:** Remove no product surface, source, assertion or workflow. Reuse issue #157, draft PR #131, sole HEIR `king/test`, the existing `PlanetProof` status contract, shared live region, Oslofjord browser journey and Browser Product Proof workflow.

**TRUTH BOUNDARY:** Exact candidate `2b71a67088461fb8cee31e5c61d7ba03c130bf4a` changes only `tests/e2e/oslofjord-planet-proof.spec.ts`; product source is unchanged. Native Browser Product Proof run 40387676345, job 121800185586, step 10 passed all 8/8 actual Oslofjord Playwright cases across desktop-1440 and mobile-390, including canonical alias and no-WebGL2 fallback. The overall workflow still fails later on the separately owned structured-data runtime step and is not globally green.

**MOBILE-FIRST RISK / HUMAN SUCCESS:** Mobile-390 is covered by the exact-head 8/8 browser receipt; WebKit 390/430 and immutable-preview deployment binding remain open. Human success is a readable sourced Oslofjord journey with one map-owned status and no uncaught WebGL2 failure. The moving branch preview demonstrated that fallback; production still rendered an empty root and `GPUInitializationError` in the observed no-WebGL2 Chromium browser.

**DONOR / ROLLBACK:** No donor adopted. Exact parent and rollback is `e247f921e3ee72272750335637cb59aa174decdf`; revert the selector/brief commits if independent Gold finds a product-proof or policy regression.

**GOLD / FOUNDER HOLD:** Independent Gold accepted only the bounded selector correction. Full product Gold, immutable preview binding, WebKit/mobile completion, merge, deployment and LIVE repair remain HOLD. Founder retains release authority. The separate structured-data runtime failure stays with its existing owner and must not be concealed or bypassed.

---

# MAX EXPOSURE — UPSTREAM NOINDEX PUBLICATION BOUNDARY — 26 OCTOBER 2026

**STATUS:** CODE CORRECTION IN PROGRESS / ISSUE #483 / SOLE HEIR `king/test` / INDEPENDENT RE-GOLD REQUIRED / NO MERGE, DEPLOYMENT OR LIVE RELEASE.

**USER ARRIVES BECAUSE / ONE THING TO UNDERSTAND:** Public search results should expose only approved 4PLANET routes. An unreleased or unknown route carrying upstream `noindex` must remain excluded even when served on a public hostname.

**PRIMARY ACTION / SECONDARY DEPTH:** Preserve explicit upstream crawler policy and pass unknown standalone-product paths through unchanged; continue the existing SEO enrichment only for the already approved public-route allowlists.

**P1 / P2 / P3 / P4:** P1 publication safety; P2 approved-route identity; P3 source-grounded discovery on released routes; P4 existing metadata and structured-data enrichment.

**REMOVE / REUSE:** Remove no routes and create no new registry. Reuse `PUBLIC_HOSTS`, each product's existing sitemap allowlist, the sole middleware and the owning host-indexing contract.

**TRUTH BOUNDARY / MOBILE RISK / HUMAN SUCCESS:** Source fixtures prove only that explicit noindex, upstream HTML and 404 status survive the exact middleware path while approved roots remain indexable. They do not prove crawler exposure, indexation, traffic, deployment or use. The correction is server metadata only, so mobile layout is unchanged. Success is independent Gold replay plus immutable native-preview header and rendered-HTML evidence.

**DONOR / ROLLBACK:** No donor adopted. Exact parent `3e2419834a838a321817b5fca32058c3f4a4b77f`; revert the bounded middleware/test/brief commit if an approved route loses its intended metadata.

**GOLD RETURN CORRECTION — 26 OCTOBER 2026:** Independent Gold replayed `king/test@a78e27eea6cc260cc3b64e34690299354ad15a05` and found three approved routes whose upstream HTML-only `noindex` was still overwritten. The header guard did not inspect the robots element, and the owning `PassthroughHTMLRewriter` never executed its callback. The corrected contract uses a callback-executing double and fails first on 4PLANET home, S4PIENS Food and 4BRANDS home (10/13 pass, 3/13 fail). The existing element handler now leaves a case-insensitive, comma/whitespace-delimited `noindex` token unchanged and normalises only index-eligible metadata. Normal approved routes plus all prior header, unknown-route, private-host and 404 controls remain protected. Exact parent/rollback is `a78e27eea6cc260cc3b64e34690299354ad15a05`; independent re-Gold and immutable native-preview HTTP/rendered evidence remain required.

**SECOND GOLD RETURN CORRECTION — 26 OCTOBER 2026:** Independent Gold replayed `king/test@2a643507a2507f5b442180ce526c0ab5e406d360`; the prior three meta-only `noindex` failures are repaired, but eight semantic/upstream restriction cases fail. HTML robots `none` is equivalent to `noindex,nofollow` and must survive on approved routes. Existing `X-Robots-Tag` directives (`none`, `nosnippet`, `noimageindex`, snippet limits and other upstream restrictions) must never be deleted by public SEO enrichment. The same callback-executing owner contract adds all eight failing-first cases plus normal indexable controls and asserts final HTML, header and status. Exact parent/rollback is `2a643507a2507f5b442180ce526c0ab5e406d360`; no route, layout, sitemap or production state changes, and independent re-Gold plus immutable native-preview evidence remain required.

---

# ONE-LEAN COLD START — TASK-CLASS READ BOUNDARY — 25 OCTOBER 2026

**STATUS:** CODE FIXED / ENTRYPOINT CONTROL HEIR CORRECTION / INDEPENDENT RE-GOLD AND REAL FRESH-AGENT TRACE REQUIRED / NO PRODUCT, MERGE, DEPLOYMENT OR LIVE RELEASE.

**USER VALUE:** a memoryless 4PLANET agent should load the minimum current authority required for its task. Test/control work must not consume unrelated product, Brand, lineage and Gold context, while a material public-product change must still receive every applicable product, rights, Brand, lineage, Gold and release gate.

**ROOT CAUSE:** the two repository entrypoints expressed product-grade supplemental reads as universal pre-code prerequisites. The deterministic guard also treated `instead` after a prohibited first clause as part of that prohibited clause, allowing an unsafe later 02-before-00 mandate to escape.

**FAILING-FIRST:** on exact base `6b21865a89de848c1731f523df0382576fe210c5`, the owning suite passed 6/8. Gold's exact `Do not load 01 Project Lead; instead, read 02 Active Tasks before 00.` mutation was falsely accepted, and the new source contract confirmed both entrypoints lacked explicit task-class read boundaries.

**CORRECTION:** the existing AGENTS and Copilot entrypoints now share two explicit paths. Non-user-facing test/control work uses 00 → targeted owner/original → exact source and necessary gate without an automatic product bundle. Material public-product work retains the existing four-state, Brand, rights, lineage, Gold, Founder-release and rollback requirements before its affected mutation. The same owning guard recognises `instead` as an instruction boundary.

**PERMANENT REGRESSION:** retain the finite unsafe/benign matrix, Gold's exact new ordering mutation, and source assertions that both entrypoints explicitly distinguish non-user-facing control work from material public-product work.

**TRUTH BOUNDARY:** passing proves the repository instructions and deterministic evaluator encode task-class conditional reads. It does not prove actual memoryless-agent retrieval behaviour, GraphRAG/zero-loss health, runtime context cost, user value, merge, deployment or LIVE operation.

**BASE / ROLLBACK:** `king/test@6b21865a89de848c1731f523df0382576fe210c5`; revert the bounded four-file commit if independent Gold finds a source-isolation or protected public-product gate regression.

**MAKER ≠ JUDGE:** Factory returns source and evidence. Independent Gold must replay the finite matrix and execute real fresh-agent task-class traces before QA_ACCEPT. Founder release remains separate.

---

# ANALYTICS PRIVACY — UNICODE NORMALISATION GUARD — 25 OCTOBER 2026

**STATUS:** CODE FIXED / P0 BOUNDED HEIR CORRECTION / INDEPENDENT RE-GOLD REQUIRED / NO MERGE, DEPLOYMENT, TELEMETRY OR LIVE RELEASE.

**USER RISK:** a consented visit to a path containing an email-like identity written with decomposed Unicode combining marks could bypass the shared privacy boundary and reach GA4 `page_location` and PostHog.

**ROOT CAUSE:** bounded percent-decoding returned an unnormalised Unicode string, while the email detector admitted letters and numbers but omitted combining marks. Canonically equivalent composed and decomposed identity forms therefore received different privacy treatment.

**FAILING-FIRST:** the owning contract added Gold's six exact decomposed paths across all three path fields and current navigation. On exact base `ff0eb3439a048b883306ea0aab4f562f4b4207bf`, 20/22 tests passed; both new negative contracts failed first on `/profile/person%CC%81@example.org`, while all twenty prior cases remained green.

**CORRECTION:** the existing bounded decoder normalises inspected text to NFC, and the existing email detector recognises Unicode marks in local, domain and top-level-domain components. No second decoder, guard, sink policy or helper was added.

**PERMANENT REGRESSION:** all six decomposed paths must be removed from `page_path`, `entry_path` and `landing_path`; current navigation must stop both mocked sinks before `page_location` is emitted. The prior twelve Unicode negatives, seven multilingual public routes, consent/host gates and bounded numeric/public identifiers remain protected.

**WHAT MUST BE REUSED:** PR #476 as the QA/evidence thread, TEST KING `king/test` / PR #131 as physical receiver, the shared bounded decoder and sensitive-material predicate, existing consent/host controls, GA4/PostHog adapters and the owning privacy contract.

**TRUTH BOUNDARY:** passing proves rejection of the exact synthetic decomposed-Unicode matrix at the source and mocked sinks. It does not prove actual leakage, production deployment, historical-data deletion, live telemetry safety or user use.

**BASE / ROLLBACK:** `king/test@ff0eb3439a048b883306ea0aab4f562f4b4207bf`; revert the bounded three-file commit if independent Gold finds a multilingual route, encoding, consent, host, identifier or sink regression.

**MAKER ≠ JUDGE:** Factory returns code and evidence. Independent Gold must replay the six decomposed negatives, all prior Unicode controls, multilingual positives and both sinks on the returned SHA before QA_ACCEPT. Founder release remains separate.

---

# EARTH NOW — EMBEDDED ANALYTICS CONSENT CLUTTER — 25 OCTOBER 2026

**GOLD RETURN / ROUTE TELEMETRY CORRECTION:** Independent Gold found that component-level suppression left `ProductRouteAnalytics` able to reach the shared `trackEvent` under stored granted consent. The smallest correction adds the same canonical valid-embed predicate to `trackEvent` itself, before either sink. The owning source-to-sink regression must prove zero `product_entry`, `return_visit` and `meaningful_use` events on both valid Atlas embeds while standalone, invalid-kind and spoofed-route controls remain permitted. Denied/no-consent, internal, disallowed-host and sensitive-navigation controls remain blocked. This is a bounded correction on exact parent `15363697f11a96feba55e1da41caae0c5a7fac7f`; independent Gold must replay both sinks and physical browser/mobile paths. No merge, deployment, LIVE release or user-use claim.

**TRAILING-SLASH ROUTE CORRECTION:** Source-derived reproduction on exact parent `7afa18763720dd6865845667722e5142369cd481` confirmed that React Router serves `/atlas/` and `/embed/atlas/`, while the shared embed predicate accepted only the non-trailing forms. The existing predicate now normalises trailing slashes before applying the same two-path allowlist. The owning source-to-both-sinks regression covers both path forms with `product_entry`, `return_visit` and `meaningful_use`; independent Gold must replay the trailing-slash routes in browser/mobile before QA acceptance. No merge, deployment, LIVE release or user-use claim.

**CASE-INSENSITIVE ROUTE CORRECTION:** Independent Gold replay on exact parent `d373066da7f7839f273ece17dc94c38f2cf65df5` confirmed that React Router serves mixed-case Atlas embed paths while the shared privacy predicate compared them case-sensitively. The existing predicate now ASCII case-folds the normalised pathname before applying the same two-path allowlist. The owning source-to-both-sinks regression covers `/ATLAS`, `/ATLAS/`, `/EMBED/ATLAS` and `/embed/ATLAS/` with `product_entry`, `return_visit` and `meaningful_use`; independent Gold must replay those routes in browser/mobile before QA acceptance. No merge, deployment, LIVE release or user-use claim.

**ENCODED-SEGMENT ROUTE CORRECTION:** Independent Gold replay on exact parent `c5d9fe7fda20df875993f24307c00bdc7201c333` confirmed that React Router decodes percent-encoded static path segments before matching while the shared privacy predicate compared the encoded pathname. The existing predicate now mirrors React Router's safe per-segment decode, preserves decoded slashes as `%2F`, fails closed on malformed encoding, then applies the existing slash/case normalisation and two-route allowlist. The owning source-to-both-sinks regression covers four exact encoded Atlas paths with all three governed events, plus encoded-slash and malformed controls; independent Gold must replay them in browser/mobile before QA acceptance. No merge, deployment, LIVE release or user-use claim.

**IMMUTABLE-PREVIEW REDIRECT CORRECTION:** Physical Chromium and raw HTTP checks on exact preview `b9421294.4planet-05.pages.dev` reproduced a two-response loop: Pages redirected the prerender directory `/now` to `/now/`, while `_redirects` sent `/now/` back to `/now`. The inverse rule is removed and Earth Now's server sitemap/prerender plus hydrated `Seo` canonical now agree on `/now/`. The owning regression rejects either explicit inverse rule and requires both canonical layers. Exact preview/browser recheck and independent Gold remain required; no merge, LIVE release or user-use claim.

**STATUS:** CODE FIXED / BOUNDED ISSUE #503 HEIR CANDIDATE / INDEPENDENT GOLD REQUIRED / NO MERGE, DEPLOYMENT OR LIVE RELEASE.

**USER DEFECT:** production Earth Now renders a second analytics-preferences bar inside its Atlas iframe, covering the bottom of the map fallback even though the parent page owns the visitor journey.

**ROOT CAUSE:** the shared `Analytics` component is mounted by `StandardApp` on `/embed/atlas`, so a valid first-party Atlas embed independently prompts and can independently install analytics when stored consent is granted.

**CORRECTION:** recognise only the two existing Atlas embed paths with a valid canonical embed kind, then suppress both consent UI and analytics installation in that child document. The parent document remains the sole consent and measurement surface; standalone routes retain the existing prompt and default-denied policy.

**FAILING-FIRST / REGRESSION:** the owning analytics contract failed 22/23 on base `66760fb050cc531fdd9b2abb0cf31f951d4daa78` because the embed predicate did not exist. It must prove suppression for `/embed/atlas?embed=news&surface=discovery` and `/atlas?embed=species`, while rejecting unknown embed kinds and query spoofing on `/now/`.

**TRUTH BOUNDARY:** passing proves the bounded source contract and no child-document analytics work on the candidate. Production was reproduced before the fix; no candidate deployment or post-fix LIVE verification is claimed.

**ROLLBACK:** revert only this three-file candidate if Gold finds loss of standalone consent, parent analytics, Atlas navigation or privacy-default behaviour.

**MAKER ≠ JUDGE:** Factory returns exact code and evidence. Independent Gold must replay desktop and mobile Earth Now, standalone consent, stored granted/denied states and both valid/invalid embed routes before QA_ACCEPT. Founder release remains separate.

---

# ANALYTICS PRIVACY — UNICODE PATH IDENTITY GUARD — 25 OCTOBER 2026

**STATUS:** CODE FIXED / P0 BOUNDED HEIR CORRECTION / INDEPENDENT RE-GOLD REQUIRED / NO MERGE, DEPLOYMENT, TELEMETRY OR LIVE RELEASE.

**USER RISK:** a consented visit to a path containing a non-ASCII decimal identity sequence or internationalised email-like value could reach GA4 `page_location` and PostHog, including when no path property was supplied by the event caller.

**ROOT CAUSE:** the shared sensitive-material predicate recognised only ASCII `\d` sequences and ASCII email top-level domains. Bounded decoding worked, but the decoded Unicode values fell outside both detectors and were admitted by the percent-encoded path grammar.

**FAILING-FIRST:** the owning contract added the twelve Gold-returned classes: six decimal-digit scripts, two punctuation-separated Unicode digit sequences, one mixed ASCII/Arabic-digit sequence and three internationalised email forms. On exact base `01dba3244d5c3fbc06fa1758e5613d24b4c2f687`, 18/20 tests passed; both new negative cases failed first on the Arabic-Indic path while the existing 18 cases remained green.

**CORRECTION:** the one shared decoded predicate now recognises Unicode decimal digits with Unicode property escapes and internationalised letter/number email components. Public identifier, generic value and navigation admission all reuse that predicate; no parallel analytics policy or sink path was added.

**PERMANENT REGRESSION:** all twelve paths must be removed from `page_path`, `entry_path` and `landing_path`, and current navigation must stop both mocked GA4 and PostHog before `page_location` is emitted. Existing public routes plus encoded French and Chinese routes must still reach both sinks.

**WHAT MUST BE REUSED:** PR #476 as the QA/evidence thread, TEST KING `king/test` / PR #131 as the physical receiver, existing bounded decoder, shared sanitizer/navigation guard, consent and host controls, both analytics adapters and the owning privacy contract.

**TRUTH BOUNDARY:** passing proves rejection of the exact synthetic Unicode matrix at the source and mocked sinks. It does not prove a real leak, production deployment, historical-data deletion, live telemetry safety or user use.

**BASE / ROLLBACK:** `king/test@01dba3244d5c3fbc06fa1758e5613d24b4c2f687`; revert the bounded three-file commit if independent Gold finds a multilingual public-route, consent, host, identifier or sink regression.

**MAKER ≠ JUDGE:** Factory returns code and evidence. Independent Gold must replay all twelve negative cases, multilingual positives and both sinks on the returned SHA before QA_ACCEPT. Founder release remains separate.

---

# ANALYTICS PRIVACY — COMPLETE URL-GRAMMAR IDENTITY GUARD — 25 OCTOBER 2026

**STATUS:** INDEPENDENT GOLD QA_CORRECT / P0 BOUNDED HEIR CORRECTION / RE-GOLD REQUIRED / NO MERGE, DEPLOYMENT, TELEMETRY OR LIVE RELEASE.

**USER RISK:** a consented visit to a path containing a synthetic identity-, phone- or payment-shaped digit sequence separated by any admitted URL punctuation could reach GA4 `page_location` and PostHog.

**ROOT CAUSE:** the shared sensitive-material predicate enumerated known separators, while the path grammar admits a broader set of non-alphanumeric URL punctuation. Each list expansion left a new false-accept class possible.

**FAILING-FIRST:** the owning contract added the seven remaining admitted punctuation classes (`!`, `$`, `'`, `(`, `)`, `*`, `=`), each in raw, percent-encoded and double-percent-encoded form, across all three path fields and current-navigation delivery. On exact base `d27a084686d600702b447ed1b05b252aa901961d`, 16/18 test cases passed; both expanded negative cases failed first on the raw exclamation path.

**CORRECTION:** replace the enumerated separator list in the one existing decoded predicate with a single rule that permits only non-alphanumeric material between digits in an identity-shaped sequence. Do not add a second policy helper or change analytics consent, host, public-route or numeric-counter behaviour.

**PERMANENT REGRESSION:** all previously returned separators plus raw/percent/double-percent forms of the seven remaining punctuation classes must be rejected from `page_path`, `entry_path`, `landing_path`, current navigation, GA4 `page_location` and both sinks. Five legitimate public routes must still reach both mocked sinks; consent, host, bounded counters and public actor IDs remain protected positives.

**WHAT MUST BE REUSED:** PR #476, lawful `king/test` HEIR, the shared sanitizer/navigation predicate, existing consent and host controls, GA4/PostHog adapters and the owning analytics privacy contract.

**TRUTH BOUNDARY:** passing proves synthetic exact-source and mocked-sink rejection only. It does not prove a real leak, production deployment, historical-data deletion, live telemetry safety or user use.

**BASE / ROLLBACK:** `king/test@d27a084686d600702b447ed1b05b252aa901961d`; revert the bounded three-file commit if independent Gold finds a legitimate-route, consent, host, counter or sink regression.

**MAKER ≠ JUDGE:** Factory returns code and evidence. Independent Gold must replay the complete prior matrix and all raw/encoded/double-encoded punctuation cases on the returned SHA before QA_ACCEPT. Founder release remains separate.

---

# ONE-LEAN COLD START — MIXED-CLAUSE REGRESSION IMMUNITY RETURN 04 — 25 OCTOBER 2026

**STATUS:** INDEPENDENT GOLD QA_CORRECT / TEST-ONLY HEIR REPAIR / RE-GOLD REQUIRED / NO INSTRUCTION, PRODUCT, RUNTIME OR RELEASE CHANGE.

**USER VALUE:** memoryless 4PLANET agents must begin with the sole short derived 00 router, then retrieve only one task's exact original authority. The guard must prevent bulk historical or private ODIN context from silently returning as mandatory startup.

**ROOT CAUSE:** the clause-scoped guard split only at semicolons. A safe `do not` or `never` clause still suppressed a later unsafe mandate joined by a comma, contrastive conjunction or sentence boundary. Conditional targeted source lookups, `historical example` labels and `overrides nothing` were also misclassified. Independent Gold therefore found seven new false accepts and four false rejects.

**FAILING-FIRST:** Gold's exact seven unsafe mixed-clause directives and four benign controls were added before changing the guard. The owning suite passed 5/7 test cases: the new unsafe case failed first on `Do not load 01 Project Lead, but MUST read 02 Active Tasks before each task.`, and the safe-reference case falsely rejected `Read 01 Project Lead only when the assigned task requires that original source.`

**CORRECTION:** the same deterministic guard now uses a finite instruction boundary at semicolons, sentence endings and the contrastive `but`, `yet` and `and then` conjunctions. Optionality, conditional targeted lookup, explicit prohibition and authority negation apply only to their clause. Labelled historical examples are removed without hiding a later real directive. Current corrected instructions remain byte-for-byte unchanged.

**PERMANENT REGRESSION:** retain all thirty finite unsafe fixtures and nine benign controls, including mixed comma/period directives, conditional targeted original lookups, historical examples and `overrides nothing`. The matrix is a bounded risk-based evaluator, not proof that arbitrary English or a real agent cold start is safe.

**WHAT MUST BE REUSED:** PR #511, the sole derived router, original Founder/Project Home/OKF/WBS/Atomic authority, current corrected `AGENTS.md` and Copilot instructions, the existing convergence workflow and the same owning contract.

**TRUTH BOUNDARY:** passing proves deterministic source-guard coverage for the exact fixtures. It does not prove native GraphRAG retrieval, blind agent behaviour, full BRAIN health, LIVE operation or user use.

**BASE / ROLLBACK:** `king/test@ee8f5b99036f47a76e436b04f42fd70c3d409808`; revert the bounded test/brief commit if independent Gold finds a legitimate conditional lookup, prohibition, negated-authority or historical-example false positive.

**MAKER ≠ JUDGE:** Factory returns code and evidence. Independent Gold must replay the finite thirty-negative/nine-benign matrix on the exact SHA. A separate real fresh-agent cold start remains required before broader BRAIN or runtime Gold.

---

# ANALYTICS PRIVACY — ENCODED NAVIGATION IDENTITY GUARD — 25 OCTOBER 2026

**STATUS:** RETURNED INDEPENDENT QA_CORRECT / P0 BOUNDED HEIR CORRECTION / RE-GOLD REQUIRED / NO MERGE, DEPLOYMENT, TELEMETRY OR LIVE RELEASE.

**USER RISK:** a consented visit to a path containing a percent-encoded identity-, phone- or payment-shaped digit sequence could reach GA4 `page_location` and PostHog even when the event caller supplied no path property.

**ROOT CAUSE:** string-value identity controls inspected raw generic values, while path admission and navigation dispatch did not apply the same digit-shape rule to the decoded pathname. Percent encoding therefore bypassed the shared telemetry boundary.

**CORRECTION:** reuse one identity-shaped digit policy after bounded decoding in both current-navigation suppression and `page_path` / `entry_path` / `landing_path` admission. Unsupported nested or malformed encoding remains fail-closed. Unsafe current navigation suppresses both sinks before inferred GA4 location is built.

**FAILING-FIRST / REGRESSION:** the owning contract moved from 15/17 to 17/17. It covers raw, single-encoded, double-encoded and punctuation-separated long digits in all three path fields; direct current-path delivery to mocked GA4 and PostHog with no caller path property; and legitimate Species, Atlas and Living Systems paths.

**WHAT MUST BE REUSED:** PR #476, lawful `king/test` HEIR, existing analytics sanitizer, consent/host/navigation controls, GA4 and PostHog adapters, and the owning privacy contract.

**TRUTH BOUNDARY:** passing proves synthetic source-and-sink rejection on the exact candidate only. It does not prove deployment, historical-data deletion, live telemetry safety or user use.

**BASE / ROLLBACK:** `king/test@7559355cbbe07e7ddab9b63937432db17e679dff`; revert the bounded three-file commit if independent Gold finds a legitimate-route, consent, host or sink regression.

**MAKER ≠ JUDGE:** Factory returns code and evidence. Independent Gold must replay the exact encoded paths and both sinks on the returned SHA. Founder release remains separate.

---

# ANALYTICS PRIVACY — BOUNDED NUMERIC COUNTER ADMISSION — 25 OCTOBER 2026

**STATUS:** RETURNED INDEPENDENT QA_CORRECT / P0 BOUNDED HEIR CORRECTION / RE-GOLD REQUIRED / NO MERGE, DEPLOYMENT, TELEMETRY OR LIVE RELEASE.

**USER ARRIVES BECAUSE:** consented public analytics must retain useful anonymous aggregate counts without forwarding phone-, identity- or payment-shaped numbers to GA4 or PostHog.

**ROOT CAUSE:** the shared sanitizer admitted every finite number up to one billion on any allowlisted key. Gold reproduced three synthetic 9-digit values in documented counter fields and propagation to both sinks. A generic key allowlist did not establish numeric semantics or a safe range.

**CORRECTION:** admit numbers only for the nine counter fields evidenced by current array/object-length producers and existing retry contracts: `attempts`, `decision_states`, `evidence_ready_items`, `item_count`, `opportunity_count`, `option_count`, `result_count`, `source_count`, and `unsupported_items`. Require non-negative safe integers no greater than 100,000. Drop numbers on all other keys; never stringify unsafe values.

**REGRESSION EVIDENCE:** the owning contract first fails on the exact Gold trio, a numeric non-counter, negative, fraction and upper-bound violation, including both mocked sinks. It protects zero and small counters for every documented field plus the complete existing string/public-ID/privacy matrix.

**WHAT MUST BE REUSED:** PR #476, lawful `king/test` HEIR, existing analytics privacy contract, shared sanitizer, consent/host/navigation controls and both analytics sinks.

**TRUTH BOUNDARY:** passing proves only the bounded synthetic source-and-sink contract on the exact candidate. It does not prove a real data leak, production deployment, live telemetry safety, user use or impact.

**BASE / ROLLBACK:** `king/test@818a1c06b4b4852189d3dc9a471eb0450af86b38`; revert this three-file correction if independent Gold finds a legitimate counter, consent, dispatch or sink regression.

**MAKER ≠ JUDGE:** Factory supplies failing-first and corrected evidence. Independent Gold must replay the numeric source and both-sink controls on the returned SHA before QA_ACCEPT. Founder release remains separate.

---

# MAX EXPOSURE CI — UNUSED ESLINT DIRECTIVE IMMUNITY — 25 OCTOBER 2026

**STATUS:** BOUNDED BUILD-PIPELINE REMEDIATION / NO PUBLIC FEATURE OR LIVE RELEASE.
**ROOT CAUSE (REAL CI LOG):** Same-SHA 25 October GitHub workflow runs report 527/527 Node smoke tests and 0 TypeScript errors but five ESLint `unused eslint-disable` warnings in `src/earth/Boundary.tsx` (one) and `src/earth/World.tsx` (four), making shared lint/QA fail despite mission tests passing.
**SMALLEST DELTA:** Delete exactly the five unused ESLint suppression directives that ESLint itself reports as ineffective. No executable JSX/React/MapLibre logic, browser styling, source claims, routes or analytics changed.
**MUST PRESERVE:** Existing MapLibre map, mobile Safari resize, source states, error boundary console logging and every other protected Atlas behaviour. No global eslint configuration change or disabling the lint gate.
**VERIFY:** lint warning count on same current HEIR SHA should drop from 5 to 0 with no new lint errors; typecheck, smoke, ATLAS contracts, production build, browser QA, independent Gold. This does not solve previously detected unrelated Oslofjord browser assertions.
**ROLLBACK:** exact previous blobs/commits; if removal exposes a legitimate unhandled lint rule restore the specific necessary suppression with recorded justification, not blanket disable.
**AUTHORITY:** Bounded sole HEIR king/test / existing MAX EXPOSURE #483, no live deployment.

---

# MISSION SCIENTIFIC SOURCE COVERAGE 12/12 — 25 OCTOBER 2026

**STATUS:** ADDITIVE SOURCE-LINK STAGING, NOT PUBLISHED, NOT INDEPENDENT GOLD.
**NEED:** Give every one of the 12 science/environment/human-system missions a legitimate authoritative context source in its canonical mission record, leaving the four 4CULTURE projects without invented ecological evidence.
**NEW VERIFIED SOURCES:** UNEP Out of the Blue / marine rewilding; IEA World Energy Outlook 2025 / energy; UNEP Circular Economy in Cities 2024 / circular-city; UNEP Sustainable and Circular Textiles / fashion.
**TRUTH:** These works substantiate broad environmental context, not each unique 4PLANET assertion, partnership, delivery, commercial readiness or verified impact. A single source pointer is a starting reference only, NOT comprehensive sourcing or Gold article quality.
**IMPLEMENTATION:** Only existing mission-source records and owning source regression; the existing shared AST projection and client automatically display verified references.
**PROOF:** Own test updated 8→12, exact source readback, full production build and independently reviewed output. No LIVE release; preserve Founder gates.
**ROLLBACK:** revert only this bounded three-file code/docs update by exact commit if source-to-claim matching or release fails.

---

# MISSION SOURCE REFERENCES — CANONICAL VERIFIED BACKGROUND — 25 OCTOBER 2026

**STATUS:** 8 SOURCE-BACKGROUND POINTERS / BOUNDED HEIR CODE CANDIDATE / INDEPENDENT GOLD REQUIRED / NO PUBLIC RELEASE.
**USER PROBLEM:** Local Mission pages had 0 scientific source links across 16 canonical records; a visitor cannot inspect material basis for core background context.
**EXECUTION:** Add eight carefully matched primary authoritative-source references to existing canonical mission objects: UNEP/CLE4N, NOAA/WH4LES, NOAA/COR4L, IPCC/CLIM4TE, NASA/AM4ZONIA, IPBES/SPECIES, IUCN/RE:WILD land, FAO/FOOD. Other 8 missions stay unverified, do not fake sources.
**ONE SOURCE:** Canonical mission content remains the only source record. The existing build-time TypeScript AST reader projects citation title/URL/trust state into existing static HTML; the hydrated MissionDetail already uses m.sources.
**BOUNDARY:** These are background/topic assessments, NOT evidence of specific proposed 4PLANET project delivery, partner clearance, proof or impact. Citation confidence relates to source trust, not full fact-by-fact Gold approval.
**HTML:** Accessible background sources list using actual HTTPS anchors, safe escaping, and factual source titles; honest fallback for source-free missions. Match article structured data with actual citations only.
**MUST PRESERVE:** 16/14 mission policy, same-domain sibling links, no external culture duplicates, existing visual design, previews noindex, brand, security and editorial gates.
**QA:** Full build + source/extractor tests + mission schema + actual HTML + client hydration + optional preview & mobile; independently adjudicated Gold before any Founder review, exact-artifact release separately.
**ROLLBACK:** Revert only bounded Gold/missions/extractor/prerender/discovery-contract changes from the exact resulting commit.

---

# MISSION DISCOVERY — HYDRATED USER CONTINUATION — 25 OCTOBER 2026

**STATUS:** BOUNDED HEIR SOURCE CANDIDATE / INDEPENDENT GOLD REQUIRED / NO LIVE.
**ROOT CAUSE:** Server-only mission sibling anchors disappear when React hydrates the page, so the Google-readable navigation could diverge from what a person sees. The first bounded mission prerender change was real but insufficient for the human outcome.
**FIX:** Mirror the same canonical same-domain mission relationships in the existing MissionDetail using content.getMissionsByDomain, excluding the two external cultural hand-offs. Reuse existing typography, accent and link primitives, no new style system.
**PRIMARY ACTION:** Click one relevant sibling mission after reading the present mission.
**MUST PRESERVE:** Existing mission hero, CTA, mobile navigation, source-state warning, URL ownership, page metadata, and anti-index preview policy.
**PROOF:** Existing discovery source contract must assert HTML and hydrated runtime route parity. Typecheck, Node test, full build, preview desktop/mobile and independent Gold required. This is not a measured SEO or LIVE result.
**ROLLBACK:** Revert this bounded Gold/client/test change if rendered, navigational or canonical QA fails. Founder external release remains blocked.

---

# MAX EXPOSURE — MISSION DISCOVERY INTERNAL LINKS — 25 OCTOBER 2026

**STATE:** BOUNDED HEIR CANDIDATE / INDEPENDENT GOLD REQUIRED / NO LIVE OR INDEXATION CLAIM.
**RECEIVER:** Existing MAX EXPOSURE issue #483, integration PR #131, sole HEIR king/test.
**USER NEED:** People who discover any local mission should navigate meaningfully to related same-domain missions and the domain overview; text-only crawlers must find the same real HTML anchors.
**SMALLEST WORK:** Enhance only existing mission server-prerender HTML, reuse 14 local canonical mission records; add one regression to the existing discovery contract. Do not edit UI styles, routes, auth, analytics or public release.
**TRUTH:** Source relationships are determined solely by the canonical mission domain; the cultural external hand-offs m4gazine and 4film remain excluded. The 16 mission source lists are empty; do not fabricate citations, claimed achievements or impact.
**PROOF:** Validate same-domain relations, escaping, server HTML, link integrity, existing sitemap and production build, independent Gold and preview proof. Source changes are not live SEO outcomes.
**ROLLBACK:** Restore exact previous file blobs / revert this bounded patch by verified GitHub commit. Founder promotion remains separate.
---

# ANALYTICS PRIVACY — COMPLETE STRING VALUE-SHAPE GUARD — 25 OCTOBER 2026

**STATUS:** RETURNED INDEPENDENT QA_CORRECT / P0 BOUNDED HEIR CORRECTION / RE-GOLD REQUIRED / NO MERGE, DEPLOYMENT, TELEMETRY OR LIVE RELEASE.

**USER ARRIVES BECAUSE:** consented public analytics must retain useful anonymous events without forwarding values shaped like personal identity, telephone or payment-card numbers to GA4 or PostHog.

**ROOT CAUSE:** the shared sanitizer governed keys and selected public identifiers, but generic allowlisted strings still fell through to `tokenValue`; namespaced IDs also accepted long digit sequences when punctuation split the digits. Gold reproduced 11 synthetic false accepts and both-sink propagation.

**CORRECTION:** reject any allowlisted string containing seven or more digits in one punctuation-separated sequence before identifier, path, host or generic-token admission. Preserve the existing explicit key allowlist, field-specific public-ID patterns, legitimate public enums/IDs/slugs, numeric aggregates, booleans, consent, host and sensitive-navigation gates, and the single sanitized payload shared by both sinks.

**REGRESSION EVIDENCE:** the owning contract first fails on all 11 exact Gold-returned values and both sink assertions. It protects real public IMPACT IDs and ordinary anonymous values, then proves the corrected shared sanitizer strips all 11 values before mocked GA4 and PostHog.

**WHAT MUST BE REUSED:** PR #476, lawful `king/test` HEIR, existing analytics privacy contract, explicit field allowlist, shared sanitizer, consent/host/navigation controls and both analytics sinks.

**TRUTH BOUNDARY:** passing proves only the bounded synthetic confidentiality contract on the exact candidate source. It does not prove a real personal-data leak, production deployment, live telemetry safety, user use or impact.

**BASE / ROLLBACK:** `king/test@c3f51ef65cbe37eb9e0ca0111ea62b4f0fdf5a48`; revert this three-file correction if independent Gold finds a legitimate public telemetry, consent, dispatch or sink regression.

**MAKER ≠ JUDGE:** Factory supplies failing-first and corrected evidence. Independent Gold must replay the seven generic, four punctuation-formatted and both-sink cases on the exact returned SHA before QA_ACCEPT. Founder release remains separate.

---

# 4SPECIES — NEW-PROFILE PHOTO ATTESTATION — 25 OCTOBER 2026

**STATUS:** RETURNED INDEPENDENT QA_CORRECT / BOUNDED HEIR CORRECTION / RE-GOLD REQUIRED / NO NEW PROFILE, MERGE, DEPLOYMENT OR LIVE RELEASE.

**USER ARRIVES BECAUSE:** a future Founder-authorised species profile must not display a photograph unless the exact admitted bytes have independently recorded reuse rights and provenance.

**ROOT CAUSE:** the new-profile predicate trusted mutable page JSON to declare its own Gold review state, licence and 64-character provenance value. It neither rejected `All rights reserved` nor bound the claimed digest to fetched image bytes, so forged Gold labels and competing digests could satisfy the source-function gate.

**CORRECTION:** require an external, in-code approved-photo record keyed by slug, with exact image URL, source URL, creator, reuse-grant licence, review-evidence URL and SHA-256. Fetch the admitted image, require an image response within the bounded size, hash the actual bytes, and compare that digest with the trusted record. Page-level Gold labels and page-declared digests confer no authority. The Founder-authorised new-profile batch remains empty and the existing 39 reviewed plus 18 draft profiles remain unchanged.

**REGRESSION EVIDENCE:** the owning test first failed because page-declared Gold still returned true. It now rejects self-declared Gold, `All rights reserved`, a competing page digest, a trusted record with incompatible rights, and fetched bytes whose digest differs; matching externally approved metadata and actual bytes pass. Existing route, review-state and sitemap cases remain in the same owning suite.

**WHAT MUST BE REUSED:** issue #145, SPEC-GS-11, the existing `profileReviewState` publication gate, canonical species JSON source path, PR #131 and sole `king/test` HEIR.

**TRUTH BOUNDARY:** passing proves the fail-closed admission contract on the exact candidate code only. The trusted approval map is intentionally empty. It does not approve a photograph, populate the Founder batch, publish a new profile, prove production deployment, user use or ecological impact.

**BASE / ROLLBACK:** `king/test@b48bafa18bd219efc3cac0ad1b29dd7eac7a6f23`; revert this bounded router, owning-test and Gold-brief correction if independent Gold finds a rights, source, byte-integrity, route or existing-profile regression.

**MAKER ≠ JUDGE:** Factory returns failing-first and corrected evidence. Independent Gold must rerun the exact self-certification, all-rights-reserved, competing-digest and byte-mismatch negatives on the returned SHA before QA_ACCEPT. Founder release remains a separate gate.

---

# SOURCE MEDIA RIGHTS — LINT / INITIALISATION CORRECTION — 24 OCTOBER 2026

**STATUS:** BOUNDED HEIR DEFECT REPAIR / GOLD REQUESTED / NO LIVE OR PUBLIC CONTENT RELEASE.

**REASON:** GitHub CI for the existing MAX EXPOSURE issue #483 failed on ESLint no-useless-assignment in the existing iNaturalist media rights guard. This is a release-tooling blocker, not a search-ranking or SEO failure.

**CHANGE:** Remove only the redundant initial false assignment to hasBoundedMediaIdentity. Both try and catch paths already explicitly assign the boolean before the fail-closed display guard reads it. Do not broaden image hosts, rights, attribution or identity trust. No runtime semantic change intended.

**VERIFICATION:** Typecheck, lint, existing species-media rights contract, Atlas and Species source restrictions, and full governance gates on the exact SHA; independent Gold for any public release. Preserve rollback and readback. No public deployment.

---

# 4PLANET MISSIONS — CANONICAL DISCOVERABILITY / HUMAN FIRST — 24 OCTOBER 2026

**STATUS:** BOUNDED HEIR SOURCE DELIVERY / INDEPENDENT GOLD REQUESTED / NO LIVE OR INDEXATION CLAIM / NO FOUNDER RELEASE.

**HUMAN VALUE:** People discovering an ocean, land, human-system or cultural mission through search should find a real, readable explanation of the mission's issue, ecological relevance, potential responses, 4PLANET's stated role and present development status, with access to the other missions. Search should not send them to an empty JavaScript shell or imply an unverified ecological outcome.

**WHAT IS BUILT:** The existing canonical mission register supplies 16 slugs. The public sitemap lists only 14 locally owned mission URLs, excluding 4film and m4gazine whose live routes hand off to Magazine. The main build now pre-renders an HTML index and 14 textual mission pages using the original canonical mission content and explicit development-status text. Client MissionDetail owns its own title, self-canonical, meta-description and matching WebPage JSON-LD; original visual composition, content, links and mission behaviour remain unchanged.

**TRUTH / SECURITY:** All 16 canonical mission source lists are currently empty. No new external claims, dates, partners, quantitative results or citations were invented. Indexability is not Google indexation. External culture destinations must not be duplicated as local mission URLs. Previews remain protected by existing noindex policy. No paid tool or live deployment.

**TESTS / PROOF:** Run production build + mission source contract + sitemap generator + user-entry audit + product-authority gate + existing smoke. Verify generated dist/missions/index.html and all 14 dist/missions/<slug>/index.html have readable text, unique title, H1, self-canonical, correct robots and genuine links; verify SPA hydration leaves metadata congruent. Run mobile and desktop once immutable HEIR preview is available; independent Gold is required. QA does not substitute for Google/Bing URL Inspection.

**AUTHORITY / ROLLBACK:** Existing issue #483, sole PR #131 and HEIR king/test only. No new sandbox, parallel content register or deployment. Revert the bounded Mission prerender/helper/client/contract changes if sources, production safety, product experience or hydrated metadata regress. The earlier sitemap-only commits remain identified separately for regression archaeology.

**REQUEST FOR INDEPENDENT GOLD:** Review exact HEIR source and generated artifacts, ensure 14/16 canonical ownership, validate HTML/server/hydrated parity and confirm no draft/private or unsupported-claim leakage. Mark QA_ACCEPT only from independent evidence; release remains separate Founder gate.

---

# ATLAS DISCOVERY OBJECTS — EMBEDDED MAP JOURNEY — 24 OCTOBER 2026

**STATUS:** RETURNED INDEPENDENT QA_CORRECT / BOUNDED HEIR CORRECTION / RE-GOLD REQUIRED / NO MERGE, DEPLOYMENT OR LIVE RELEASE.

**USER ARRIVES BECAUSE:** Earth, Fires and Whales discovery pages should let a visitor explore the relevant governed ATLAS view without losing the source explanation, limitations or a working continuation when the embedded map is unavailable.

**ROOT CAUSE:** the lawful HEIR retained the three human-readable object pages and full-ATLAS link, but the integrated object component had diverged from the accepted donor's embedded-map journey. The first correction then used the unregistered `/embed/atlas` path: the four-state review worker only proxies the registered `/atlas` path, so the iframe fell through to the Product Control dashboard. The owning regression asserted only the iframe path instead of the routed embedded content.

**CORRECTION:** derive the registered first-party `/atlas?embed=news&surface=atlas-discovery` URL from each existing `atlasHref`, render the governed view between the object introduction and explanation, retain a visible same-view fallback to full ATLAS, and replace the visible `Read this correctly` label with `A note on the data`.

**REGRESSION EVIDENCE:** physical runtime inspection on the baseline shows Product Control inside the Earth iframe. The new semantic contract fails on that baseline, requires the registered `/atlas` embed route and forbids `/embed/atlas` in this journey, while retaining the iframe, accessible fallback, same-view continuation and human note. Existing Earth Now, discovery, source, route, sitemap and prerender contracts remain green.

**WHAT MUST BE REUSED:** PR #384, issue #503 context, the existing ATLAS object inventory, registered `/atlas` embedded renderer, PublicShell, human-first public styles, source links, limitations and sole `king/test` HEIR. The homepage and current Earth Now component remain untouched.

**TRUTH BOUNDARY:** passing proves the bounded candidate code, build and semantic journey only. It does not certify WebGL rendering, mobile browser behaviour, production deployment, Google indexing, user use or ecological impact.

**BASE / ROLLBACK:** `king/test@80706e57c84fe499f3caeec0bab9b8639417fbf5`; revert this three-file correction if independent Gold finds a map, route, source, layout, accessibility or fallback regression.

**MAKER ≠ JUDGE:** Factory supplies failing-first and corrected evidence. Independent Gold must test Earth, Fires and Whales on the exact returned SHA at 390, 430 and desktop widths with WebGL available and unavailable, then return QA_ACCEPT or the smallest failing selector/screenshot.

---

# ANALYTICS PRIVACY — PUBLIC ID VALUE SEMANTICS — 24 OCTOBER 2026

**STATUS:** RETURNED INDEPENDENT QA_CORRECT / P0 BOUNDED HEIR CORRECTION / RE-GOLD REQUIRED / NO MERGE, DEPLOYMENT OR LIVE RELEASE.

**USER ARRIVES BECAUSE:** consented analytics must preserve useful anonymous public-product events without sending values shaped like personal identity, telephone or payment-card data to GA4 or PostHog.

**ROOT CAUSE:** the key allowlist restricted telemetry property names, but identifier values were not governed uniformly. The first bounded correction covered `legal_identity`, `source_id`, `object_id` and `product_key`; independent Gold then proved that long identity/card-shaped digit sequences still survived in `actor_id`, `project_id`, `action_id`, `campaign_id`, `object_slug` and `event_id` and reached both sinks.

**CORRECTION:** apply field-specific public semantics before the generic token path for every allowlisted public identifier/slug field, including the six returned fields. Legitimate public namespaced IDs and slugs remain accepted; raw or embedded runs of seven or more digits are rejected uniformly. Existing consent, host, sensitive-navigation and shared-sink controls remain unchanged.

**REGRESSION EVIDENCE:** the six exact returned Gold values fail on the immutable baseline and are removed after correction. The executable harness runs the real `trackEvent` and `dispatchAnalyticsEvent` bodies with consent granted on an allowed host and proves both mocked GA4 and PostHog receive only `product_area` plus the canonical site/path fields. Positive cases protect the current IMPACT action/project/actor IDs, BRREG…34001 tokens truncated… preservation; ATLAS source contract consumes the added fields.
**TRUTH BOUNDARY:** deterministic adapter/UI contracts do not prove every upstream dataset has complete metadata, independent Gold, deployment, LIVE state or observed user value.
**BASE / ROLLBACK:** `king/test@b1c3ad65a116fa280e3c6a4fdb44397f4287f122`; revert the bounded correction commit if independent Gold rejects the contract.
**MAKER ≠ JUDGE:** Factory implements; independent Gold decides. No release or production mutation is authorised.

# MAGAZINE RAW-HTML READER VALUE — 10 OCT 2026

**STATUS:** HEIR DISCOVERY IMPROVEMENT / SAME MAGAZINE CONTENT SOURCE / NO LIVE RELEASE.

**USER PROBLEM:** Search Console already shows and indexes Magazine stories, but public raw-HTML audits expose only single-digit body word counts even though complete approved story blocks already exist in the canonical story source.

**P1 DOMINANT:** the actual story, not metadata alone.
**P2 ORIENTATION:** headline, dek, byline, lane and reading context.
**P3 ACTION / NEXT:** one relevant 4PLANET pathway plus contextual related stories.
**P4 DEPTH:** the existing full story blocks, with the React Magazine experience replacing the raw fallback when JavaScript starts.

**REDUCE BEFORE GENERATE:** no duplicate editorial store, no SEO-only copy, no hidden keyword text, no fabricated dates or sources. The prerender reads the same `STORIES` objects the product reads.

**SEARCH / AI CONTRACT:** raw route HTML must contain substantive visible story text and crawlable internal links before JavaScript execution. `createRoot` replaces the fallback for the interactive experience, so humans and crawlers receive one semantic content source rather than contradictory variants.

**MEASUREMENT:** impressions → organic click → engaged read → relevant second object / share → return.
**ROLLBACK:** 658c69936aa2e3ab2adb7ec932749da2c848289b.
**MAKER ≠ JUDGE:** exact build and Magazine SEO contract must pass; LIVE remains Founder-gated.

# ATLAS PLACE SEARCH ENTRY — EXECUTABLE CONTRACT — 10 OCT 2026

**STATUS:** HEIR QA HARDENING / SAME PRODUCT CORRECTION / NO LIVE RELEASE.
**ACCEPTANCE:** the ordinary smoke suite must execute the real middleware Place runtime contract. Berlin must resolve as a unique self-canonical Place object, expose the organic-entry marker, present the map as a dominant same-place ATLAS link, expose the primary ATLAS continuation, retain World Place Index / SPECIES / Living Systems graph links, and never fall back to the generic ATLAS-root document title.
**ROLLBACK:** 62a6c042413cfaecd0d1fa3e8eada15ef94e7c15.
**MAKER ≠ JUDGE:** contract inclusion proves regression coverage only; independent Gold + exact preview remain required.

# PUBLIC SEARCH CANONICAL TRANSPORT — 10 OCT 2026

**STATUS:** BOUNDED TECHNICAL SEARCH CORRECTION / HEIR ONLY / LIVE RELEASE NOT IMPLIED.

**USER PROBLEM:** Google already surfaced an HTTP 4NATION URL. Search authority must converge on one secure canonical protocol instead of allowing HTTP and HTTPS variants to compete.

**P1 DOMINANT:** every active public 4PLANET hostname resolves HTTP requests permanently to the same HTTPS host/path/query.
**P2 ORIENTATION:** preserve existing host canonicalisation and path ownership; do not redirect private/test hosts into public surfaces.
**P3 ACTION / NEXT:** one 308 hop from HTTP to HTTPS.
**P4 DEPTH:** Search Console should eventually stop accruing impressions to HTTP variants after recrawl.

**WHAT CAN BE REMOVED:** duplicate protocol variants in the search graph.
**WHAT MUST BE REUSED:** existing public host ownership, existing canonicals and Cloudflare middleware; no parallel redirect system.
**MOBILE-FIRST RISK:** none beyond preserving path/query exactly.
**HUMAN SUCCESS:** an HTTP link lands on the identical HTTPS resource without content loss or redirect chain.
**ROLLBACK:** c226ee5f1511dc0bdcb994c2f8cde2aa23aa12e7.
**MAKER ≠ JUDGE:** deterministic/browser proof required before any LIVE promotion.

# ATLAS PLACE → LIVING PLANET ENTRY — SEARCH VALUE / EXPOSURE — 10 OCT 2026

**STATUS:** FOUNDER-DIRECTED HEIR PRODUCT CORRECTION / MAKER IMPLEMENTATION / INDEPENDENT GOLD REQUIRED / NO LIVE RELEASE.

**USER ARRIVES BECAUSE:** a person searched for a real place and landed on 4PLANET from Google or another discovery surface.

**ONE THING TO UNDERSTAND:** this place is not a text record or isolated map pin; it is an entry point into the living planet, and the same canonical place can be explored immediately in ATLAS.

**PRIMARY ACTION:** open this exact place/node in the interactive ATLAS with the canonical place identity and reference map context preserved.

**SECONDARY DEPTH:** understand source-grounded geography first, then explore only verified connections to nearby places, species, living systems, pressures, missions and evidence. Missing ecological relationships remain unknown.

**P1 DOMINANT:** premium visual place identity + map/node orientation.
**P2 ORIENTATION:** place type, geographic context and concise reason to explore.
**P3 ACTION / NEXT:** one dominant “EXPLORE IN ATLAS” action carrying the same place slug and reference coordinate.
**P4 DEPTH:** Living Planet Intelligence, related places, sources, provenance and truth boundaries.

**WHAT CAN BE REMOVED:** text-first SEO landing hierarchy; technical identifiers above the fold; duplicate primary CTAs; generic environmental filler; engineering/status language; any visual treatment that makes a real search visitor feel they landed on an internal record.

**WHAT MUST BE REUSED:** one existing ATLAS engine; current canonical Place objects; World Place Index; existing map-state handoff; existing source/provenance and truth model; existing related-place graph; existing static map/share-image primitive; current SPECIES life-first premium hierarchy as a quality benchmark, not as a copied layout.

**SEARCH / AI DISCOVERY CONTRACT:** server-readable HTML, unique title/description, self-canonical, crawlable internal links, truthful schema and useful visible text remain first-class. The interactive map enhances the human experience; it does not replace crawlable content.

**MOBILE-FIRST RISK:** the visual map entrance must remain legible and tappable on narrow screens without trapping scroll, obscuring the place name or requiring WebGL before first value. Static/crawlable fallback remains useful when interactive ATLAS is unavailable.

**HUMAN SUCCESS:** within one screen a new visitor knows where they are, sees the place as a map node and can enter the same place in ATLAS with one action. If they stay, the page itself gives useful, source-grounded context and routes them deeper into 4PLANET.

**MEASUREMENT:** organic landing → Place viewed → ATLAS continuation → meaningful use / second object → return. URL publication or sitemap submission alone is not success.

**SCALE LAW:** hold the current 250 Place cohort while production runtime consistency and landing usefulness are proven. Do not use this work as authority for 250→500+.

**TRUTH BOUNDARY:** a reference coordinate is navigation context, not an administrative/ecological boundary; geographic identity does not establish species presence, ecosystem condition, pressure, causality or ecological outcome.

**BASE / ROLLBACK:** king/test@9f4dc1faed4efc1e6e615aeba4480fe28dff2281 before this bounded product correction.

**MAKER ≠ JUDGE:** implementation and deterministic/browser proof may establish candidate quality; independent Gold judges exact SHA. LIVE remains Founder-gated.

**CANDIDATE DELTA:** the HEIR Place surface now exposes an explicit organic-acquisition entry marker alongside the map-first human hierarchy so the product byte and this brief are proven in one bounded commit.

# NATUREBRAIN / ATLAS — OBIS DEFAULT-COUNT TRUTH — 10 OCT 2026

**STATUS:** RETURNED QA_CORRECT CONSUMED ON HEIR / NO GOLD / NO DEPLOYMENT / NO LIVE RELEASE.

**USER ARRIVES BECAUSE:** A person requests marine occurrence evidence without a count override and needs a truthful bounded default and truthful upstream total state.

**ONE THING TO UNDERSTAND:** A missing query parameter and a numeric zero are different inputs; an unknown upstream total and a measured zero are different evidence states.

**PRIMARY ACTION:** Preserve the declared default `size=50` when `size` is absent or blank, and preserve `total:null` as unknown.

**P1 DOMINANT:** Missing/blank size reaches OBIS as 50, not 1.

**P2 ORIENTATION:** Explicit numeric zero remains bounded by the endpoint minimum; it is not treated as a missing parameter.

**P3 ACTION:** Upstream `total:null` is returned as null, never coerced to zero.

**P4 DEPTH:** Targeted regression does not prove upstream availability, independent re-Gold, deployment or LIVE behaviour.

**WHAT MUST BE REUSED:** Existing `/api/obis` bridge, issue #244, returned Gold row 482, source-bridge regression suite and sole `king/test` HEIR.

**TRUTH BOUNDARY:** Unknown is not zero. Default count is request control, not evidence of source completeness.

**BASE / ROLLBACK:** `king/test@c3baa5cd866ca998c8d4699be9f7408e7719b4ed`; revert this bounded return correction if independent re-Gold finds a valid request-contract regression.

**MAKER ≠ JUDGE:** Factory consumes the returned correction; independent Gold rejudges the exact HEIR SHA. No product Gold, deployment or production release is authorised.

# ATLAS — WH4LES ITEM TRUTH + OPEN-RIGHTS GATE — 10 OCT 2026

**STATUS:** BOUNDED HEIR INTEGRATION CORRECTION / NO GOLD / NO DEPLOYMENT / NO LIVE RELEASE.

**USER ARRIVES BECAUSE:** A person opens one WH4LES point and needs to know when and how precisely the occurrence was recorded, which dataset supplied it, and under what licence it may be reused.

**ONE THING TO UNDERSTAND:** An OBIS occurrence point is admissible only through the governed adapter and only when its per-record rights are explicitly open.

**PRIMARY ACTION:** Replace the direct browser-to-OBIS query with the existing `/api/obis` bridge and render event date, coordinate uncertainty, dataset, licence, occurrence identifier and OBIS source per point.

**SECONDARY DEPTH:** Preserve valid equator/prime-meridian coordinates by testing finiteness instead of truthiness; fail closed on unknown, non-commercial or no-derivatives rights.

**P1 DOMINANT:** WH4LES accepts only `OPEN_CC0` or `OPEN_ATTRIBUTION` records from the governed bridge.

**P2 ORIENTATION:** Latitude or longitude `0` remains a valid occurrence coordinate.

**P3 ACTION:** Every admitted point exposes date, uncertainty, dataset, licence, record identifier when supplied, and provider source.

**P4 DEPTH:** This bounded correction does not prove upstream availability, completeness, taxonomic correctness, independent Gold, deployment or LIVE behaviour.

**WHAT CAN BE REMOVED:** Direct public OBIS fetches, truthy coordinate filters and rights-blind point popups.

**WHAT MUST BE REUSED:** Existing `/api/obis` adapter, issue #244 receiver, ATLAS point renderer, source-bridge regression suite and sole `king/test` HEIR.

**TRUTH BOUNDARY:** Records remain occurrence evidence, not abundance, range, population trend or live position. Missing point fields are displayed as missing and are never invented.

**MOBILE-FIRST RISK:** Popup detail grows; exact-head mobile/WebKit Gold must confirm it remains readable and dismissible.

**HUMAN SUCCESS:** A WH4LES point can no longer hide its temporal, spatial, dataset or rights context, and valid zero coordinates are not discarded.

**BASE / ROLLBACK:** `king/test@7ac8d12cf6073ff2f62578fff6c94e9f972f5d55`; revert this bounded correction if independent Gold finds a valid occurrence or mobile interaction regression.

**MAKER ≠ JUDGE:** Factory implements F14; independent Gold judges the exact HEIR SHA. No product Gold, deployment or production release is authorised.

# CROSS-PRODUCT STRUCTURED-DATA OWNERSHIP — 10 OCT 2026

**STATUS:** BOUNDED HEIR SEO LIFECYCLE CORRECTION / NO GOLD / NO DEPLOYMENT / NO LIVE RELEASE.

**USER ARRIVES BECAUSE:** A person or search system opens a 4PLANET route and needs the page identity, canonical URL and principal subject to describe that route only.

**ONE THING TO UNDERSTAND:** Crawlable prerender schema and the active client-route schema are two lifecycle stages of one 4PLANET-owned graph, not independent graphs that may accumulate.

**PRIMARY ACTION:** Mark every 4PLANET prerender JSON-LD script as owned and remove all owned prerender/current-route variants before installing the active route graph.

**SECONDARY DEPTH:** Preserve one crawlable raw-HTML graph before JavaScript and preserve unrelated third-party JSON-LD during mount, navigation, cleanup and StrictMode replay.

**P1 DOMINANT:** Raw prerender HTML contains exactly one owned, crawlable graph for its route.

**P2 ORIENTATION:** Client mount and A→B→A navigation leave exactly one current 4PLANET route graph.

**P3 ACTION:** Cleanup removes only 4PLANET-owned schema nodes; third-party JSON-LD remains untouched.

**P4 DEPTH:** Deterministic lifecycle tests and a production build do not prove search indexing, ranking, traffic, independent Gold, deployment or LIVE behaviour.

**WHAT CAN BE REMOVED:** Unmarked discovery schema and separate Atlas-only ownership semantics.

**WHAT MUST BE REUSED:** Existing `Seo` manager, discovery/Atlas/Magazine prerenderers, issue #132 receiver, canonical routes and sole `king/test` HEIR.

**TRUTH BOUNDARY:** This prevents duplicate or stale 4PLANET-owned structured data. It does not upgrade any source, claim, publication state or search-engine interpretation.

**MOBILE-FIRST RISK:** None; no layout, route or interaction geometry changes.

**HUMAN SUCCESS:** A route transition cannot leave a ghost schema graph that names the previous page or conflicts with the visible destination.

**BASE / ROLLBACK:** `king/test@ce72270bb88bc9b3140acbd40e799c45cdd3befc`; revert this bounded correction if independent Gold finds a legitimate structured-data interoperability regression.

**MAKER != JUDGE:** Factory implements; independent Gold judges the exact HEIR SHA. No publication, deployment or production release is authorised.

# NATUREBRAIN / ATLAS — OBIS DATE-BOUNDARY INTEGRITY — 10 OCT 2026

**STATUS:** BOUNDED HEIR SOURCE-ADAPTER CORRECTION / NO GOLD / NO INGEST / NO LIVE RELEASE.

**USER ARRIVES BECAUSE:** A person narrows marine observations to an explicit period and needs the returned evidence to remain inside that period.

**ONE THING TO UNDERSTAND:** A supplied invalid date is not an absent filter. The adapter must reject it instead of silently widening the OBIS request.

**PRIMARY ACTION:** Validate real `YYYY-MM-DD` calendar dates and reject inverted date ranges before any upstream fetch.

**SECONDARY DEPTH:** Preserve the existing bounded query, occurrence semantics, per-record provenance/rights, upstream failure state and no-absence/no-live-position truth limits.

**P1 DOMINANT:** Invalid or impossible supplied dates fail with `INVALID_DATE` and never call OBIS.

**P2 ORIENTATION:** A start date after the end date fails with `INVALID_DATE_RANGE`.

**P3 ACTION:** Valid dates, including a real leap day, continue to the existing bounded OBIS occurrence request.

**P4 DEPTH:** This source-adapter correction does not prove ATLAS point-detail date/uncertainty presentation, provider availability, dataset rights, independent Gold, deployment or LIVE behaviour.

**WHAT CAN BE REMOVED:** Shape-only date validation and fail-open omission of an invalid supplied filter.

**WHAT MUST BE REUSED:** Existing `/api/obis` bridge, issue #244 receiver, PKD-158 source contract, ATLAS source-bridge regression suite and sole `king/test` HEIR.

**TRUTH BOUNDARY:** OBIS records remain occurrence evidence, not abundance, range, trend or live position. `eventDate` remains distinct from retrieval time. F14 ATLAS point-detail provenance is deferred to the existing #244 product scope.

**MOBILE-FIRST RISK:** None; no UI, route, layout or interaction change.

**HUMAN SUCCESS:** An explicit invalid or inverted date boundary can no longer produce a successful unbounded observation response.

**BASE / ROLLBACK:** `king/test@7705f680c253dc1c9bb1261111c3302cf65e6247`; revert this bounded correction if independent Gold finds a valid OBIS calendar regression.

**MAKER ≠ JUDGE:** Factory implements F11–F13; independent Gold judges the exact HEIR SHA. No ingest, product Gold, deployment or production release is authorised.

# UNIVERSAL IMPACT — PROVIDER-BOUND ACTION QUANTITY — 10 OCT 2026

**USER ARRIVES BECAUSE:** A person following a real IMPACT action needs the released provider, delivery unit and funded quantity to describe the same transaction.

**ONE THING TO UNDERSTAND:** Positive amount and quantity fields are insufficient unless the selected provider is an admitted candidate and the quantity satisfies that provider's exact unit and minimum.

**PRIMARY ACTION:** Keep resource flow closed until the caller supplies the selected provider's current diligence binding and it matches the Action Contract provider, quantity unit and minimum.

**SECONDARY DEPTH:** Preserve diligence, Founder release, blocker, payment/delivery/evidence/outcome/impact and remedy boundaries.

**P1 DOMINANT:** No provider binding, no resource flow.

**P2 ORIENTATION:** The selected provider must be one of the contract's existing candidates.

**P3 ACTION:** The known quantity must use that same provider's unit and meet its current minimum.

**P4 DEPTH:** A passing deterministic gate does not prove checkout terms, payment, delivery, evidence, outcome, impact, partnership or LIVE runtime.

**WHAT CAN BE REMOVED:** No new UI, provider store, payment path, database or public claim.

**WHAT MUST BE REUSED:** Existing Universal Action Contract, existing provider diligence pattern, issue #320/#151 receiver, sole HEIR and IMPACT contract suite.

**TRUTH BOUNDARY:** The caller must supply the current provider pattern; a provider ID or positive number alone cannot self-authorise resource flow. Exact checkout and Founder release remain external gates.

**MOBILE-FIRST RISK:** None; deterministic contract correction only.

**HUMAN SUCCESS:** A quantity for a different provider, unit or minimum cannot silently open a real IMPACT resource flow.

**DONOR DECISION:** No donor; correct the existing HEIR primitive in place.

# IMPACT — EVIDENCE TIMESTAMP INTEGRITY WITHOUT AGE POLICY — 09 OCT 2026

**STATUS:** BOUNDED HEIR TRUTH
# ATLAS-09 — ACCOUNT-ISOLATED MY ATLAS STATE — 13 OCT 2026

**STATUS:** RETURNED QA_CORRECT CONSUMED ON SOLE HEIR / INDEPENDENT GOLD PENDING / NO DEPLOYMENT / NO LIVE RELEASE.

**USER ARRIVES BECAUSE:** A person saves ATLAS views or follows on a shared browser and must not expose or upload those choices to another signed-in account.

**ONE THING TO UNDERSTAND:** Guest device state and each authenticated account are separate namespaces; sign-in is not consent to import guest state.

**PRIMARY ACTION:** Switch saved-view and Follow storage to the active account namespace before hydration, then merge only that account's local cache with its RLS-bound remote state.

**P1 DOMINANT:** Guest data is never automatically merged into a newly authenticated account.

**P2 ORIENTATION:** Account A and account B use disjoint local keys; sign-out restores the guest namespace.

**P3 ACTION:** Late hydration or debounced sync from an inactive account cannot update the current account's UI or sync state.

**P4 DEPTH:** Deterministic contracts and build/type checks do not prove independent Gold, RLS configuration, deployment or LIVE behaviour.

**WHAT MUST BE REUSED:** Existing My Atlas controls, existing Follow primitive, existing `four_planet_atlas_state` account endpoint, issue #244 and sole `king/test` HEIR.

**TRUTH BOUNDARY:** This correction isolates application-visible browser state. It does not add explicit guest import, change server schema/RLS or claim that browser storage is a secure vault.

**BASE / ROLLBACK:** `king/test@d63bd4106651c1f037df6afa21d72a1e56d706a7`; revert this bounded correction if independent Gold finds a valid account persistence regression.

**MAKER ≠ JUDGE:** Factory consumes the returned correction; independent Gold judges the exact HEIR SHA. No product Gold, deployment or production release is authorised.
# ACTOR GOLD / 4NGO — SHARED VALUE-PROOF CONTRACT — 14 OCT 2026

**STATUS:** EXISTING HEIR BUILD/FIX / INDEPENDENT GOLD PENDING / NO PUBLIC OR LIVE CHANGE.
**USER ARRIVES BECAUSE:** a person needs to understand what an organisation needs, can do, still requires, has delivered and has actually caused without partnership or impact inflation.
**ONE THING TO UNDERSTAND:** need, capability, partner/capital requirement, delivery evidence, outcome evidence and independently supported impact are separate states.
**PRIMARY ACTION:** connect a source-grounded Actor profile to the existing Universal IMPACT Action Contract while all unsupported delivery, outcome and impact claims fail closed.
**WHAT CAN BE REMOVED:** parallel NGO actor/action/proof models and string-only impact assertions.
**WHAT MUST BE REUSED:** the canonical Actor Gold projection, `ActionContract["id"]`, ACTOR-FP-01, issue #152, sole `king/test` HEIR and accepted PR #371 contract.
**TRUTH BOUNDARY:** typed fields and deterministic contract tests do not prove a named partnership, funding, delivery, outcome, impact, independent Gold, deployment or LIVE behaviour.
**HUMAN SUCCESS:** downstream 4NGO presentation can distinguish unknown requirements from proven capability and can publish delivery/outcome/impact only from reviewed source-and-evidence records.
**BASE / ROLLBACK:** `king/test@341925aad5e6ed17b08be3195ea5ae9e5752c4c2`; revert this bounded Actor contract correction if independent Gold finds a valid regression.
**MAKER != JUDGE:** Factory implements on the sole HEIR; independent Gold judges the exact resulting SHA. Founder release remains separate.


# RESOURCE COMPOUNDING — GEM ATLAS + ORCA ASSET PROOF — 14 OCT 2026

**STATUS:** FOUNDER-DIRECTED HEIR PRODUCT CANDIDATE / SOURCE-BOUNDED / INDEPENDENT GOLD REQUIRED / NO LIVE RELEASE.

**USER ARRIVES BECAUSE:** a person exploring a real place in ATLAS needs to understand nearby energy/industrial infrastructure and its sourced ownership context without turning source records into emissions, responsibility or impact claims.

**ONE THING TO UNDERSTAND:** PLACE intelligence can connect physical infrastructure, company/ownership context, emissions and living systems only when each edge preserves its own source, date, rights and confidence.

**PRIMARY ACTION:** add a bounded Norway Global Energy Monitor layer to the existing ATLAS layer registry and expose source-bound ownership traversal through the same product authority.

**P1 DOMINANT:** energy/industrial assets become visible as real place context, not a parallel map or new truth store.

**P2 ORIENTATION:** asset type, status, capacity and direct owner appear only when supplied by GEM; missing means missing.

**P3 ACTION / NEXT:** GEM ownership graph is available as a separate source-preserving drill-down; verified legal-company crosswalks must use identifiers such as LEI/PermID or independent evidence.

**P4 DEPTH:** later PLACE CELL work may combine population, buildings, AlphaEarth/change, Climate TRACE, nature, public investment and procurement through the same canonical Place object.

**ORCA ASSET PROOF:** register an Orca asset manifest in the existing physical asset path. Separate production media, real reference media, museum specimen metadata and future reconstruction needs. A procedural/reference-grounded Orca is never labelled a measured or Smithsonian-scanned 3D animal.

**WHAT MUST BE REUSED:** existing ATLAS LAYERS/World authority, existing Climate TRACE integration, existing canonical Orca identity/assets, existing source/evidence boundaries and sole `king/test` HEIR.

**WHAT MAY NOT BE CREATED:** second ATLAS engine, parallel BRAIN, parallel asset truth store, automatic owner→responsibility inference, fake measured 3D provenance.

**S4PIENS / 4SAPIEN BOUNDARY:** public human-system PLACE context belongs to S4PIENS; 4SAPIEN remains the personal life-helper application and may only consume private/user-relevant projections within tenant boundaries.

**MOBILE-FIRST RISK:** new point density and popup information must remain bounded; first slice is Norway-only and limited to 250 source records.

**HUMAN SUCCESS:** a person can switch on GEM in ATLAS, see real infrastructure context, understand what the source does and does not establish, and have a controlled path toward ownership intelligence.

**TRUTH BOUNDARY:** GEM asset ≠ emissions; owner ≠ responsibility; tracked status ≠ independently observed operation; source absence ≠ real-world absence. Orca reconstruction ≠ measured anatomy.

**ROLLBACK:** parent HEIR `b2dd0e09b13bb95b6fcafa55bd85921dfe6f0f7c`.

**MAKER ≠ JUDGE:** deterministic contracts and candidate build run on the HEIR; independent Gold judges the resulting exact SHA. LIVE remains Founder-gated.
# SPECIES — PROFILE REVIEW STATE FAIL-CLOSED — 16 OCT 2026

**STATUS:** RETURNED QA_CORRECT CONSUMED ON SOLE HEIR / INDEPENDENT GOLD PENDING / NO DEPLOYMENT / NO LIVE RELEASE.

**USER ARRIVES BECAUSE:** a person or search crawler opens a SPECIES profile and must not receive an indexable claim surface when the canonical human-review record is missing or unavailable.

**ONE THING TO UNDERSTAND:** only an explicit canonical `provenance.review === "REVIEWED"` permits a profile to be indexed; absence, error and ambiguity are not approval.

**PRIMARY ACTION:** fail closed to noindex and sitemap exclusion for missing, non-OK, malformed, incomplete or timed-out profile-review evidence.

**P1 DOMINANT / P2 ORIENTATION / P3 ACTION / P4 DEPTH:** keep the profile experience unchanged when reviewed; preserve enumerated public universe routes; apply one shared indexing predicate to HTML and sitemap; independently verify exact-SHA browser and deployed header/meta/sitemap behaviour before release.

**WHAT CAN BE REMOVED:** the `null`/unknown state that previously bypassed both the HTML robot gate and sitemap filter.

**WHAT MUST BE REUSED:** existing v53 router, canonical `/species-data/v1/{slug}.json` provenance, issue #145, PR #131 and sole `king/test` HEIR.

**TRUTH BOUNDARY:** deterministic source tests prove the HEIR gate semantics, not independent Gold, deployment, public runtime state or human review of any individual profile.

**MOBILE-FIRST RISK:** none introduced in presentation; required 390/430/1440 Chromium/WebKit verification remains an independent acceptance gate.

**HUMAN SUCCESS:** unreviewed or unverifiable profiles cannot silently become search-discoverable while reviewed profiles and explicit public universe routes remain reachable.

**DONOR DECISION:** no donor; correct the existing returned HEIR path in place.

**BASE / ROLLBACK:** `king/test@c9477d090e11cf4e3d440b59f1ec750f62c91139`; revert this bounded correction commit if independent Gold finds a valid regression.

**MAKER ≠ JUDGE:** Factory implements the returned correction; independent Gold judges the exact resulting HEIR SHA. Founder release remains separate.

## 16 OCTOBER 2026 — 4SPECIES SAFE PUBLIC DISCOVERY HOTFIX

**Founder instruction:** Fix the broken public SPECIES sitemap and improve real search discoverability, without publishing draft species or changing released species visuals or game assets.

**Source of authority:** Existing king/test sole HEIR and Worker ops/discovery/4species-router.js. No new project, competing BRAIN, feature changes, alternate production ownership, or bypass of release authority.

**Verified failure:** Direct public HTTP audit found https://4species.com/sitemap.xml returned HTTP 404 and https://4species.com/robots.txt did not advertise a sitemap. These behaviors match the active Worker route before the patch.

**Bounded implementation:** Route canonical /sitemap.xml to the existing review-gated sitemap proxy; retain fail-closed profile review; normalize legacy /species/ aliases and preview-domain entries to https://4species.com/{slug}; advertise sitemap in robots.txt. DRAFT and unavailable profiles are still excluded.

**Rollout and rollback:** The exact source must be rebased onto king/test, pass unit, browser, upstream and all product authority checks, then pass the existing immutable Cloudflare Pages preview / Worker-version rollback contract. Do not silently change or bypass manual-only deployment enforcement.

**Evidence needed:** HTTP 200 application/xml for /sitemap.xml on 4species.com, canonical URL list, no DRAFT species, and valid original product UX. An indexed status or live deployment is UNKNOWN until independently verified.

## USER ARRIVES BECAUSE
A person searches for a living species, receives a reliable species page and can interact with the existing product.

## ONE THING TO UNDERSTAND
Only approved source-backed species pages belong in public search and sitemap.

## PRIMARY ACTION
Open a factually reviewed 4SPECIES profile.

## SECONDARY DEPTH
Explore scientific sources and connected ATLAS mapping, without losing species context.

## P1 DOMINANT
Verified species content; no misleading index entries.

## P2 ORIENTATION
One canonical species URL per reviewed profile.

## P3 ACTION / NEXT
Continue to species knowledge, ATLAS, related species and real ecological context.

## P4 DEPTH
Sources, provenance and date limitations.

## WHAT CAN BE REMOVED
Dead 404 sitemap branch, preview URLs in sitemap.

## WHAT MUST BE REUSED
Current v53 species Worker, existing profileReviewState and permitsSpeciesIndexing, existing registry.

## TRUTH BOUNDARY
Search-engine crawlability does not prove actual Google indexation, traffic or human users.

## MOBILE-FIRST RISK
Preserve the existing responsive v53 UI and all media.

## HUMAN SUCCESS
Verified live public sitemap, preserved working animal cards, and discoverable reviewed species.

## 16 OCTOBER 2026 — P0 OAUTH / GA4 / POSTHOG USER PRIVACY, CANONICAL HEIR

**Founder direction:** Security first. Strip OAuth credentials and private values before analytics or identity cross-domain navigation. Any public release must preserve current UX, track legitimate anonymous value, and pass actual live verification.

**Source:** Existing sole `king/test` HEIR; no parallel production tree or replacement BRAIN.

**Bounded changes:** Sanitize `return_to` while preserving harmless ATLAS URL query state; reject URL fragments and sensitive callback paths; retain existing GA4 token-free `page_location` and internal traffic exclusion; filter credential / personal fields from `trackEvent` before GA4 and PostHog sinks. No account details or secret values printed by tests.

**Evidence:** The previous standalone source candidate passed security and typecheck tests. This canonical HEIR update includes dedicated regression tests and CI; verify new exact commit, build, browser login and Analytics network traffic. Historic GA4 sensitive data deletion and session revocation remain separate, unverifiable until a privileged admin data-deletion tool is connected.

**Rollback:** Save exact currently deployed Cloudflare production artifact before main promotion; no bypass of FOUNDER_GATED promotion or SOURCE_BRANCH=king/test. On regression, restore previous verified Worker/Pages version immediately.

**Truth state:** SOURCE CODE COMPLETE; PUBLIC LIVE REMEDIATION NOT VERIFIED BY THIS COMMIT.
## IMPACT proof-passport canonical-binding correction — 16 Oct 2026

- **USER ARRIVES BECAUSE:** they need to distinguish a contribution from delivery, outcome, and independently verified impact.
- **ONE THING TO UNDERSTAND:** an impact claim is eligible only when the displayed claim, quantity, evidence identity, and canonical proof records agree.
- **PRIMARY ACTION:** inspect the bounded proof chain and its source-linked verification.
- **SECONDARY DEPTH:** inspect limitations, double-count control, provider identity, and chronology.
- **P1 / P2 / P3 / P4:** verified state / proof-chain orientation / source inspection / limitations and method.
- **WHAT CAN BE REMOVED:** caller-supplied claim text, quantity, or context-only evidence as substitutes for canonical proof.
- **WHAT MUST BE REUSED:** existing `ProofPassport`, truth-spine records, claim-distance law, and independent-verifier gate.
- **TRUTH BOUNDARY:** CONTEXT_ONLY evidence cannot advance depth; blank verifier sources fail closed; an impact claim is emitted only for VERIFIED depth and remains ineligible if its text or quantity diverges from canonical records.
- **MOBILE-FIRST RISK:** none added; this correction changes the shared proof contract, not layout.
- **HUMAN SUCCESS:** a forged or stale projection cannot retain impact eligibility after its claim, quantity, source reference, or evidence relationship is altered.
- **DONOR DECISION:** no donor; correct the existing HEIR contract in place.
- **ROLLBACK:** parent HEIR `516c65ca5855164c985ec169223d71b3b6d537fb`.
# NATUREBRAIN / SPEC-GS-11 — REVIEWED-EDGE PRODUCT ADMISSION — 16 OCTOBER 2026

**STATUS:** HEIR SHARED-INFRASTRUCTURE CORRECTION / INDEPENDENT SCIENCE + PRODUCT GOLD REQUIRED / NO DB OR LIVE CHANGE.
**USER ARRIVES BECAUSE:** a person wants to understand a species or living system through ecological relationships without a bounded interpretation being presented as an approved fact.
**ONE THING TO UNDERSTAND:** reviewed evidence for a claim does not independently approve the relationship inferred from that evidence.
**PRIMARY ACTION:** consume only relationship records whose edge, referenced claim, reviewed source evidence and evidence-rights boundary all pass together.
**SECONDARY DEPTH:** preserve held and unreviewed relationships for scientific review without projecting them into SPECIES, ATLAS or LSI product links.
**P1 DOMINANT:** approved ecological relationship.
**P2 ORIENTATION:** relationship predicate and direction.
**P3 ACTION:** continue to the related entity only after full admission.
**P4 DEPTH:** claim, evidence, source record, review and rights context.
**WHAT CAN BE REMOVED:** product projection based only on entity presence or reviewed claim/evidence.
**WHAT MUST BE REUSED:** the canonical `NatureBrainEntityContext`, existing relationship IDs, claims/evidence, SPEC-GS-11, issue #145, ATLAS #244 and sole `king/test` HEIR.
**TRUTH BOUNDARY:** hiding a held edge does not disprove the relationship; source citation or reviewed claim does not approve a relationship; product admission does not prove deployment, scientific Gold or LIVE behaviour.
**MOBILE-FIRST RISK:** none introduced; this correction changes shared admission data before rendering and adds no layout.
**HUMAN SUCCESS:** a held synthesis cannot appear as an approved SPECIES/ATLAS/LSI relationship, while a fully reviewed and rights-bounded edge still transfers through the same shared adapter.
**BASE / ROLLBACK:** `king/test@ad7ab7bc49e7c050a4d158affe9efd02de65a90e`; revert the bounded adapter/test/brief commit if independent Gold finds a legitimate reviewed edge is wrongly suppressed.
**MAKER ≠ JUDGE:** Factory implements the returned gate; independent science/product Gold judges the exact SHA. Founder release remains separate.

## 16 OCTOBER 2026 — 4NGO ACTOR PUBLICATION AUTHORITY CORRECTION

**STATUS:** RETURNED QA_CORRECT IMPLEMENTED ON THE SOLE ACTOR HEIR / INDEPENDENT GOLD REQUIRED / RELEASE HOLD / NOT LIVE.

**USER ARRIVES BECAUSE:** a person needs to distinguish a source-backed Actor statement from a locally asserted delivery, outcome or impact claim.

**ONE THING TO UNDERSTAND:** profile-local source ids, authority labels and review dates do not create publication authority.

**PRIMARY ACTION:** show a material claim only after its projected source and evidence records match the closed canonical publication-authority register exactly.

**SECONDARY DEPTH:** inspect claim distance, source authority, evidence linkage, review chronology and limitations.

**P1 / P2 / P3 / P4:** admitted claim / distance and authority / source inspection / limitations and correction path.

**WHAT CAN BE REMOVED:** caller-local records as a substitute for canonical source/evidence approval, malformed review dates, future review dates and duplicate reference ids.

**WHAT MUST BE REUSED:** existing `ActorGoldProfile`, `actorClaimCanPublish`, Actor Master projection, ACTOR-FP-01, issue #152 and sole PR #131 `king/test` HEIR.

**TRUTH BOUNDARY:** the current ORCA development profile has no cleared public delivery, outcome or impact claims; the closed register therefore remains empty. This correction proves fail-closed source behavior, not Actor Gold, deployment, partnership, delivery, outcome or ecological impact.

**MOBILE-FIRST RISK:** none introduced; the correction changes claim admission before the existing responsive renderer.

**HUMAN SUCCESS:** forged local records and invalid dates cannot make a claim visible, while future canonically approved records have an explicit exact-match path.

**DONOR DECISION:** no donor or new actor store; correct the existing shared gate in place.

**BASE / ROLLBACK:** `king/test@69f333af1632be06296a7dfbd1ce588c90e52f15`; revert the bounded source/test/brief commit if independent Gold finds a legitimate canonical claim is wrongly suppressed.

**MAKER ≠ JUDGE:** Factory returns the exact SHA to independent Gold. Founder-authorised release remains separate.

## 17 OCTOBER 2026 — 4NGO ACTOR CLAIM CONTENT AUTHORITY CORRECTION

**STATUS:** RETURNED QA_CORRECT IMPLEMENTED ON THE SOLE ACTOR HEIR / INDEPENDENT GOLD REQUIRED / RELEASE HOLD / NOT LIVE.

**USER ARRIVES BECAUSE:** a person must see only the exact Actor statement that was reviewed, not new wording or a stronger claim distance attached to previously approved evidence.

**ONE THING TO UNDERSTAND:** approved sources and evidence do not approve every assertion that can be made from them.

**PRIMARY ACTION:** admit a claim only when its claim id, Actor id, revision, exact content and distance match the closed canonical claim-authority record as well as the approved source and evidence records.

**WHAT CAN BE REMOVED:** caller-controlled claim wording, Actor identity, distance or revision as a substitute for claim-level approval.

**WHAT MUST BE REUSED:** existing `ActorGoldProfile`, `ActorClaimBoundary`, `actorClaimCanPublish`, ACTOR-FP-01, issue #152 and sole PR #131 `king/test` HEIR.

**TRUTH BOUNDARY:** the current ORCA register remains empty. This correction adds no public claim and proves only that claim meaning cannot drift after approval.

**BASE / ROLLBACK:** `king/test@fe17879630c7fde69be3b871afa353722d01cec5`; revert the bounded source/test/brief commit if independent Gold finds a legitimate approved claim is wrongly suppressed.

**MAKER ≠ JUDGE:** Factory implements the returned boundary; independent Gold judges the exact resulting SHA. Founder release remains separate.

---


# PLACE CELL 01 — OSLOFJORD LIVE SOURCE COMPOSITION — 17 OCT 2026

**STATUS:** FOUNDER-DIRECTED HEIR PRODUCT CANDIDATE / FIRST PLACE CELL / INDEPENDENT GOLD REQUIRED / NO LIVE RELEASE IMPLIED.

**USER ARRIVES BECAUSE:** a person exploring Oslofjord needs more than a map or ecological summary; they need source-grounded context about the human and physical systems acting in the same place.

**ONE THING TO UNDERSTAND:** PLACE is one canonical object. Energy infrastructure, emissions, population, buildings, Earth change, nature, species, procurement and solutions attach to the same place with separate source/rights/truth boundaries.

**PRIMARY ACTION:** compose the existing GEM and Climate TRACE adapters into the existing public `/place/oslofjord` route and provide one clear continuation into the same ATLAS object.

**P1 DOMINANT:** the public PLACE page gains live infrastructure/emissions context without creating a new map, database or duplicated place identity.

**P2 ORIENTATION:** current proof is deliberately partial. WorldPop, building footprints and AlphaEarth are registered but remain `REGISTERED_NOT_ACTIVE` until their bounded adapters are proven.

**P3 ACTION / NEXT:** open the Oslofjord extent in ATLAS with GEM infrastructure enabled; then add population/buildings/Earth-change to the same PLACE contract.

**P4 DEPTH:** ecological condition, infrastructure, emissions, demographics and model signals remain different evidence classes. Missing source records never mean real-world absence.

**WHAT MUST BE REUSED:** existing `/place/oslofjord`, existing AtlasEmbed, existing GEM adapter, existing Climate TRACE v7 adapter, existing canonical `place:4p:oslofjord`, sole HEIR `king/test`.

**S4PIENS / 4SAPIEN BOUNDARY:** PLACE public human-system context belongs to S4PIENS. 4SAPIEN remains the private personal life-helper application.

**MOBILE-FIRST RISK:** live records must remain concise and responsive; the first proof caps displayed records and never blocks the static PLACE page if a live source fails.

**HUMAN SUCCESS:** a visitor can understand that Oslofjord is simultaneously a living system and a human/industrial place, inspect current source records, see uncertainty/coverage limits and continue into ATLAS.

**TRUTH BOUNDARY:** bbox = navigation geometry; GEM asset ≠ emissions or responsibility; Climate TRACE source record ≠ complete emissions inventory or causal attribution; registered source ≠ active product layer.

**ROLLBACK:** parent HEIR `c73fb2487f659cdc2c026b38a46978d746967b80`.

**MAKER ≠ JUDGE:** deterministic contracts/build/preview establish candidate quality only. LIVE remains Founder-gated.


# NATURE SENSOR 01 — SENSOR-AGNOSTIC NATUREBRAIN INGRESS — 17 OCT 2026

**STATUS:** SOURCE-GROUNDED DATA CAPABILITY / SOFTWARE-ONLY PROOF PASSED / NO HARDWARE OR LICENCE COMMITMENT.

**USER VALUE:** future environmental sensors can enter one governed NATUREBRAIN evidence path rather than creating device-specific silos.

**CONTRACT:** provider/device event → source record → sensor entity → unreviewed observation → numeric measurement → evidence. Product publication remains false until review/rights/evidence gates are satisfied.

**PROOF:** synthetic TEST_RECORD `TEST-20261017-OSLOFJORD-TOC-01` staged end-to-end, read back at POINT(10.55 59.45), preserved RESTRICTED_INTERNAL rights, UNKNOWN calibration, TEST_ONLY quality and `measurement_only` interpretation, then was deleted. No synthetic Oslofjord environmental measurement remains.

**NASA ROUTE:** MiniTOCA/STELLA/other sensor technologies may later feed this same protocol. Hardware selection, licence, freedom-to-operate and procurement fit remain separate decisions.

**TRUTH BOUNDARY:** measurement ≠ ecological condition; point ≠ area; missing observation ≠ absence; sensor identity ≠ ownership/manufacturer identity; unreviewed ≠ publication-ready.

**MAKER ≠ JUDGE:** database readback proves protocol behaviour only. It does not prove hardware performance, environmental validity, user demand or LIVE product presentation.


# ORCA COMPOUND ASSET — THREE-SURFACE CANONICAL BINDING — 17 OCT 2026

**STATUS:** HEIR ASSET-FAMILY CONVERGENCE / SPECIES + ATLAS BOUND / WILD SOURCE PANEL UPDATE REQUIRED FOR CLOSURE / NO LIVE RELEASE IMPLIED.

**OBJECTIVE:** prove that one canonical Orca asset family can serve multiple products without collapsing evidence classes.

**CANONICAL ASSET FAMILY:** `4p:species:orca:asset-pack:v1` → `/assets/species/orca/ASSET-MANIFEST.json`.

**SPECIES:** the Orca profile exposes the canonical asset-family ID and manifest while preserving photograph/illustration rights and representation boundaries.

**ATLAS:** only `Orcinus orca` WH4LES occurrence popups expose the asset-family link. The link is labelled representation context and never becomes occurrence evidence.

**WILD:** Prototype 04 already maintains a controlled asset-source panel and live/reference/candidate classes. Closure requires binding that panel to the same canonical ID/manifest without changing gameplay.

**TRUTH BOUNDARY:** shared asset identity ≠ identical geometry; game mesh ≠ measured anatomy; museum specimen reference ≠ 3D whale; occurrence record ≠ asset proof; photo ≠ live position.

**HUMAN SUCCESS:** a person can move from Orca in SPECIES or ATLAS to one transparent asset/provenance family, while WILD can use optimised game assets under the same family without pretending scientific equivalence.

**ROLLBACK:** parent HEIR `fb2f672d1ba1c6e801e73fa11b09824a73e9e990`.

**MAKER ≠ JUDGE:** contract/build/preview evidence required. LIVE and external asset redistribution remain separately gated.


# EXPO-03 — PLACE PUBLICATION + CANONICAL OWNERSHIP GATE — 17 OCT 2026

**STATUS:** RETURNED RELEASE DEBT / HEIR CORRECTION / INDEPENDENT GOLD REQUIRED / NO LIVE RELEASE IMPLIED.

**USER ARRIVES BECAUSE:** a person searching for a real place should reach only a source-grounded PLACE object whose public publication and canonical owner are explicitly authorised.

**ONE THING TO UNDERSTAND:** source/usefulness curation is not publication authority. `indexable=true` alone cannot publish a PLACE candidate.

**PRIMARY ACTION:** fail closed across sitemap, prerender, Places UI and species-to-place discovery until one inventory object simultaneously has `indexable=true`, `publicationState=READY_FOR_FOUNDER_RELEASE`, and `canonicalOrigin` equal to the configured public origin.

**P1 DOMINANT:** no `HEIR_CANDIDATE` PLACE appears in public discovery surfaces.

**P2 ORIENTATION:** direct candidate routes remain available on the HEIR for review, but carry `noindex,follow` and omit canonical/JSON-LD ownership claims.

**P3 ACTION / NEXT:** Founder/canonical authority may explicitly assign `canonicalOrigin` to an already reviewed `READY_FOR_FOUNDER_RELEASE` object; independent Gold then verifies the exact resulting artifact before any release.

**P4 DEPTH:** species and other discovery inventories retain their existing bounded rules; this correction applies only to PLACE publication debt.

**WHAT CAN BE REMOVED:** the false assumption that source curation, public release and canonical ownership are one boolean.

**WHAT MUST BE REUSED:** existing `discoveryInventory.json`, sitemap/prerender pipelines, `/places`, `/place/:slug`, SPECIES related-place projection and sole HEIR `king/test`.

**TRUTH BOUNDARY:** this correction assigns no canonical domain, promotes no publication state and submits no URL. Current inventory intentionally has zero publicly discoverable PLACE objects because canonical ownership remains unresolved.

**MOBILE-FIRST RISK:** no new layout or interaction is introduced; fail-closed empty discovery must remain truthful rather than backfilling candidates.

**HUMAN SUCCESS:** an unreleased PLACE cannot be inferred as public from sitemap, prerender, UI, related links, canonical metadata or JSON-LD.

**BASE / ROLLBACK:** `king/test@ca42d70c55a7cee1a1129b8a1518e7f9a288b8ed`; revert the bounded source/test/brief commit if independent Gold finds an authorised PLACE suppressed by a conflicting current authority.

**MAKER ≠ JUDGE:** Factory closes the code-path conflation only. Independent Gold judges the exact SHA; Founder retains canonical assignment and release authority.
# SPECIES — EXACT PATH CANONICALITY GATE — 17 OCTOBER 2026

**STATUS:** RETURNED `QA_CORRECT` IMPLEMENTED ON THE SOLE HEIR / INDEPENDENT GOLD REQUIRED / RELEASE HOLD / NOT LIVE.

**USER ARRIVES BECAUSE:** a person or crawler should reach only an intentional public SPECIES route, never a malformed alternate path that silently inherits another route's publication authority.

**ONE THING TO UNDERSTAND:** path normalisation is navigation convenience, not review or indexing authority.

**PRIMARY ACTION:** decide profile and public-route eligibility from the exact raw pathname and fail closed on every non-canonical variant.

**SECONDARY DEPTH:** preserve the existing source-bearing profile review lookup only after the exact one-segment lowercase slug contract passes.

**P1 / P2 / P3 / P4:** canonical route / explicit review state / public profile or discovery action / source and limitation detail.

**WHAT CAN BE REMOVED:** pre-authority slash collapsing, dot-segment removal, query/fragment stripping and encoded-path equivalence.

**WHAT MUST BE REUSED:** existing `profileReviewState`, `permitsSpeciesIndexing`, public-route allowlist, issue #145 and sole PR #131 `king/test` HEIR.

**TRUTH BOUNDARY:** this correction proves deterministic source behaviour only. It does not prove hosted HTTP/CDN behaviour, search-engine removal, browser rendering, independent Gold, deployment or LIVE state.

**MOBILE-FIRST RISK:** none introduced; no layout or interaction changes.

**HUMAN SUCCESS:** exact canonical routes retain their current behavior, while redundant/trailing slash, dot-segment, encoded, case-variant and helper-input query/fragment forms cannot inherit indexing permission.

**DONOR DECISION:** no donor or new route system; correct the current HEIR gate in place.

**BASE / ROLLBACK:** `king/test@c05da699dacd39009d32a38932f88a6e84d3f0d6`; revert this bounded router/test/brief commit if independent Gold identifies a legitimate canonical path that is suppressed.

**MAKER ≠ JUDGE:** Factory consumes the returned QA correction; independent Gold judges the exact resulting SHA. Founder/release authority remains separate.


---

# S4PIENS / COMPANY-GOLD-01 — CLIMATE TRACE PAGE-COVERAGE DISCLOSURE — 19 OCT 2026

**STATUS:** SOURCE-GRAIN INTEGRATION DEBT CORRECTED ON SOLE HEIR / INDEPENDENT GOLD REQUIRED / NO DEPLOYMENT OR LIVE RELEASE.
**USER ARRIVES BECAUSE:** a person comparing physical emitting sources in a human system needs to know what the ranked list covers and what was excluded.
**ONE THING TO UNDERSTAND:** the visible eight are ranked only from one bounded Climate TRACE response page, not from the full dataset.
**PRIMARY ACTION:** inspect the page-scoped source ranking with its year, gas, upstream, mappable and excluded counts.
**SECONDARY DEPTH:** open the existing Climate TRACE source drawer for source identity, rights and limitations.
**P1 DOMINANT:** the existing country-and-system source ranking.
**P2 ORIENTATION:** page scope, query year/gas, page limit/offset and exact upstream/mapped/dropped counts.
**P3 ACTION:** continue through the existing country and source paths without treating the sample as a dataset total.
**P4 DEPTH:** independent exact-head contract and browser verification before release.
**WHAT CAN BE REMOVED:** the ambiguous “up to eight sources shown” disclosure that hid response-page grain and coordinate exclusions.
**WHAT MUST BE REUSED:** COMPANY-GOLD-01, issue #148, the shared Climate TRACE proxy, S4PIENS SystemPage, PR #131 and sole `king/test` HEIR.
**TRUTH BOUNDARY:** counts describe this proxy response page only. They do not prove full Climate TRACE dataset coverage, legal-company ownership, responsibility, live emissions or national totals.
**MOBILE-FIRST RISK:** the added disclosure must remain readable without horizontal overflow; independent 390/430 browser evidence remains a release gate.
**HUMAN SUCCESS:** every ready ranking visibly names its year, gas, page limit/offset, mapped/upstream/excluded counts and non-dataset-total boundary; missing or inconsistent coverage metadata fails closed as unavailable.
**BASE / ROLLBACK:** `king/test@6729cf24a11719c59dea92bb5eaf7cf40ae688ff`; revert this bounded proxy/UI/contract/brief correction if independent Gold finds source-grain, layout or availability regression.
**MAKER ≠ JUDGE:** Factory corrects the integration debt; independent Gold judges the exact resulting SHA. Founder release and runtime verification remain separate.


---

# S4PIENS / COMPANY-GOLD-01 — COUNTRY-RANKING HEADER SCOPE — 19 OCT 2026

**STATUS:** RETURNED GOLD QA_CORRECT CLOSED BY MAKER ON SOLE HEIR / INDEPENDENT REGOLD REQUIRED / NO DEPLOYMENT OR LIVE RELEASE.
**USER ARRIVES BECAUSE:** a person choosing a country needs the section introduction itself to state what the ranking covers before interpreting the list.
**ONE THING TO UNDERSTAND:** this is a top-eight ranking from one bounded Climate TRACE response page, not the largest sources across a country or the full dataset.
**PRIMARY ACTION:** choose a country and inspect the page-scoped ranking with its exact coverage disclosure.
**WHAT CAN BE REMOVED:** “biggest physical sources” and “largest ... for one country” language that outruns the bounded query.
**WHAT MUST BE REUSED:** the existing Climate TRACE proxy coverage envelope, S4PIENS country journey, source drawer, COMPANY-GOLD-01, issue #148 and sole PR #131 HEIR.
**TRUTH BOUNDARY:** the header and detailed disclosure describe one fetched response page. They do not establish national completeness, company responsibility, live emissions or dataset-wide ranking.
**HUMAN SUCCESS:** before reading a result, a user sees that the view ranks no more than eight mappable sources from one response page and is not the full dataset.
**BASE / ROLLBACK:** `king/test@7dcd77c300c45922dc4060c66f3077c81126f2cf`; revert this three-file copy/contract/brief correction if independent Gold finds comprehension or layout regression.
**MAKER ≠ JUDGE:** Factory closes the returned wording defect; independent Gold judges the exact resulting SHA. Release and runtime verification remain separate.


# SPECIES — CANONICAL HOST REINFORCEMENT — 21 OCTOBER 2026

**STATUS:** AXE SEARCH QA RETURN CONSUMED ON SOLE HEIR / INDEPENDENT GOLD REQUIRED / NO DEPLOYMENT OR LIVE RELEASE.

**USER ARRIVES BECAUSE:** a person searching for a species should reach one stable public SPECIES page instead of competing legacy and product-domain URLs.

**ONE THING TO UNDERSTAND:** the clean `https://4species.com/{slug}` URL is the SPECIES profile; Living Systems interpretations remain distinct ecological routes.

**PRIMARY ACTION:** open the source-bearing species profile on 4species.com.

**SECONDARY DEPTH:** follow source, provenance and related 4PLANET routes without changing canonical ownership.

**P1 DOMINANT / P2 ORIENTATION / P3 ACTION / P4 DEPTH:** species identity / provenance state / source follow-through / independent search and release verification.

**WHAT CAN BE REMOVED:** trailing-slash duplicates and inherited upstream canonical metadata.

**WHAT MUST BE REUSED:** issue #145, AXE comment #6298950923, the existing 4SPECIES Worker, reviewed/source-bearing publication gate, sitemap, legacy `/species/{slug}` redirect, PR #131 and sole `king/test` HEIR.

**TRUTH BOUNDARY:** an HTML canonical plus HTTP Link signal and clean redirect reduce ambiguity; they do not prove Google re-selection, indexing, ranking, clicks, deployment, Gold or Founder acceptance.

**MOBILE-FIRST RISK:** none introduced; no visual layout or interaction changes. Browser and crawler readback remain required on the exact released artifact.

**HUMAN SUCCESS:** a valid source-bearing profile emits exactly one self-canonical clean 4species.com URL for GET and HEAD; trailing-slash and legacy aliases converge without collapsing Living Systems routes.

**BASE / ROLLBACK:** `king/test@83b71dc8ccefb550ce6e7c196ccf1c30271225ea`; revert the bounded Worker/test/brief commit if independent Gold finds a routing, metadata or public-profile regression.

**MAKER ≠ JUDGE:** Factory implements the bounded correction. Independent Gold must judge the exact resulting SHA, then authorised release control must bind any deployment to that SHA before Search Console follow-up.

# IMPACT — INFORMATION ROUTE TRUTH CLASSIFICATION — 21 OCTOBER 2026

STATUS: SOURCE QA DEFECT CORRECTED IN THE EXISTING IMPACT HEIR; INDEPENDENT GOLD AND AUTHORISED RUNTIME VERIFICATION REMAIN OPEN.

- USER ARRIVES BECAUSE: they need to distinguish ways to support ecological work from official source context.
- ONE THING TO UNDERSTAND: not every outbound project link is an action.
- PRIMARY ACTION: external_support remains labelled ACTION_ and uses the established action telemetry.
- SECONDARY DEPTH: external_information is labelled SOURCE / LEARN_ and uses distinct information telemetry.
- P1: keep organisation-owned support routes useful without claiming delivery, outcome or impact.
- P2: keep official information routes visibly informational.
- P3: unknown future action types fail closed as information.
- P4: preserve NATUREBRAIN identifiers, citations and review-state boundaries.
- WHAT CAN BE REMOVED: the blanket assumption that every non-empty action URL is an action route.
- WHAT MUST BE REUSED: the existing IMPACT HEIR, NATUREBRAIN projection, action IDs, route structure and analytics adapter.
- TRUTH BOUNDARY: external_support is an organisation-owned support route, not proof; external_information and unknown types fail closed as information and never emit action telemetry.
- MOBILE-FIRST RISK: the longer information label must remain legible without obscuring the outbound link.
- HUMAN SUCCESS: a visitor can tell whether a link supports work or only opens official context before leaving 4PLANET.
- BASE / ROLLBACK: king/test@70ae08b5b5594c3f967f77b35cead9a3bb2871f4.
- MAKER ≠ JUDGE: this correction does not supply Gold, merge, release or LIVE authority.

# 4PLANET STORY — SERVER-READABLE ORGANIC ENTRY — 22 OCTOBER 2026

**STATUS:** CONFIRMED MAX EXPOSURE DEFECT / BOUNDED HEIR CORRECTION / INDEPENDENT GOLD AND AUTHORISED RUNTIME VERIFICATION REQUIRED / NO LIVE RELEASE.

**USER ARRIVES BECAUSE:** an existing organic result can land directly on `/about/story`; the first response must explain why 4PLANET exists even before JavaScript runs.

**ONE THING TO UNDERSTAND:** the living planet is the system beneath human life, and 4PLANET exists to make that system easier to see, understand and help.

**PRIMARY ACTION:** read the existing 4PLANET Story, then continue to the existing System, beliefs or Join routes.

**SECONDARY DEPTH:** the client-rendered visual Story remains unchanged and continues to carry the fuller editorial experience.

**P1 DOMINANT / P2 ORIENTATION / P3 ACTION / P4 DEPTH:** existing Story headline / existing premise and truth boundary / existing About and Join links / the existing React Story after hydration.

**WHAT CAN BE REMOVED:** the empty generic app shell as the only server response for an already public, measured organic landing.

**WHAT MUST BE REUSED:** `AboutStory` wording and route, the existing discovery prerender helper, sitemap generator, PublicShell, Brand OS and sole `king/test` HEIR.

**TRUTH BOUNDARY:** this is an organisational purpose/story page. It claims no ecological outcome, partner relationship, delivered impact, live data or independent verification.

**MOBILE-FIRST RISK:** no visual layout or client interaction changes; the bounded risk is crawler/server parity. Exact-head build and runtime HTML readback remain required.

**HUMAN SUCCESS:** without JavaScript, the response contains one H1, substantive existing Story text, self-canonical metadata and working continuations; with JavaScript, the current visual Story remains unchanged.

**QUESTION / DELETE / SIMPLIFY / REUSE:** no new story or page. Delete the empty-server-response failure, reuse approved wording, and extend the existing prerender route set only.

**SIMPLEST CAPABLE EXECUTION:** deterministic build-time HTML projection plus exact source contract; no new service, content store, component or agent layer.

**DOOR CLASS / ROLLBACK:** reversible HEIR-only code change. Base and rollback are `king/test@62927cf68ef2a8b2b00293d603cf2e30571efa34`.

**MAKER ≠ JUDGE:** Factory may correct and verify the candidate. Independent Gold judges the exact SHA; deployment, search submission and LIVE release remain separately authorised.

**RETURN CORRECTION — 24 OCTOBER 2026:** Independent Gold found that the new client SEO owner used a different title and description from the existing server projection. The bounded correction keeps the server-approved Story metadata unchanged through hydration and adds source plus desktop/mobile browser parity coverage for raw response, hydration and SPA away/back. Visible Story copy and layout remain unchanged. Base/rollback is `king/test@f865ba226341f3af00452a7823b3474c90cfaf93`; independent re-Gold remains required.

**SECOND RETURN CORRECTION — 24 OCTOBER 2026:** Independent Gold correctly rejected unconditional raw/client robots equality on preview hosts. The existing Cloudflare middleware already applies `X-Robots-Tag: noindex, nofollow, noarchive` and `Cache-Control: no-store` to `test.4planet.org`, `*.pages.dev` and localhost responses while leaving `4planet.org` indexable. This correction adds an exact `/about/story/` raw-response regression on that owning middleware path and makes the browser proof environment-aware: the prerendered production artifact remains indexable, preview hydration must be noindex, and title, description, canonical path and owned graph remain stable through SPA return. No global `_headers` noindex is added. Base/rollback is `king/test@5bf9e998b4187256444c7016053e50d70d1a0368`; independent re-Gold remains required.

# FLAGSHIP JOURNEYS — SOURCE HTML SEARCH + SHARE METADATA — 23 OCTOBER 2026

**STATUS:** CONFIRMED MAX EXPOSURE DEFECT / BOUNDED HEIR CORRECTION / INDEPENDENT GOLD REQUIRED / NO LIVE RELEASE.

**USER ARRIVES BECAUSE:** a search result or shared link leads directly to the existing Jaguar or Orca journey.

**ONE THING TO UNDERSTAND:** each page is a distinct, source-linked journey from one animal into its surrounding living system.

**PRIMARY ACTION:** enter the existing Jaguar rainforest journey or Orca ocean journey.

**SECONDARY DEPTH:** follow the existing evidence, ecosystem, place and action seams already inside each journey.

**P1 DOMINANT / P2 ORIENTATION / P3 ACTION / P4 DEPTH:** existing animal journey / unique species-and-system description / enter journey / existing evidence and ecosystem layers.

**WHAT CAN BE REMOVED:** the generic or missing search/share summary that makes two materially different journeys indistinguishable outside the rendered page.

**WHAT MUST BE REUSED:** the existing static journey documents, exact canonical routes, page titles, user-entry audit, issue #483 and sole `king/test` HEIR.

**TRUTH BOUNDARY:** metadata describes the existing source-linked journeys only. It does not claim live tracking, measured ecological outcome, independent impact or editorial Gold.

**MOBILE-FIRST RISK:** no rendered layout, interaction or asset changes; risk is confined to document-head metadata and must be checked in built HTML.

**HUMAN SUCCESS:** search and share surfaces can distinguish Jaguar from Orca before entry, while the current journeys render and behave unchanged.

**QUESTION / DELETE / SIMPLIFY / REUSE:** no new page, story or component. Add the missing document metadata at the owning static paths and lock exact canonical/Open Graph parity in the existing discovery contract.

**SIMPLEST CAPABLE EXECUTION:** deterministic HTML head tags plus one same-path regression; no new service, schema store, route or agent layer.

**DOOR CLASS / ROLLBACK:** reversible HEIR-only source change. Base and rollback are `king/test@14b763166af1cd760df1cb4c537445ba5f2d3389`.

**MAKER ≠ JUDGE:** Factory may correct and verify the candidate. Independent Gold judges the exact SHA; merge, deployment, indexing and LIVE release remain separately authorised.

# LIVING SYSTEMS — GENERATED-ROUTE AUDIT IMMUNITY — 23 OCTOBER 2026

**STATUS:** INDEPENDENT GOLD QA_CORRECT / BOUNDED EVALUATOR REPAIR / RELEASE HOLD.

**USER ARRIVES BECAUSE:** a visitor or crawler follows the existing public Living Systems entry.

**ONE THING TO UNDERSTAND:** the audit must prove the canonical route is active in the sitemap route set, not merely present as inert source text.

**PRIMARY ACTION:** retain the existing `/livingsystems/` public entry and its current journey.

**SECONDARY DEPTH:** preserve the existing redirect alias, analytics classifiers, sitemap output and public experience unchanged.

**P1 DOMINANT / P2 ORIENTATION / P3 ACTION / P4 DEPTH:** existing Living Systems entry / canonical route truth / enter the product / existing systems content.

**WHAT CAN BE REMOVED:** the false-positive source-substring evaluator that accepts a commented-out route.

**WHAT MUST BE REUSED:** issue #483, PR #131, the current sitemap generator, user-entry audit, analytics contract and sole `king/test` HEIR.

**TRUTH BOUNDARY:** a passing active-route audit proves only that the canonical is present in the generator's active static route array. It does not prove deployment, HTTP redirect behaviour, indexation, traffic, user use or Gold acceptance.

**MOBILE-FIRST RISK:** none; no rendered markup, styling, interaction or route output changes.

**HUMAN SUCCESS:** a future accidental comment/removal of the canonical route fails the audit before release while the existing public product remains unchanged.

**QUESTION / DELETE / SIMPLIFY / REUSE:** replace raw substring presence with deterministic syntax-tree extraction of the active array and lock the escaped failure with one isolated negative mutation.

**SIMPLEST CAPABLE EXECUTION:** one audit correction plus one same-path failing-first regression; no new service, store, route, page or product branch.

**DOOR CLASS / ROLLBACK:** reversible HEIR-only evaluator change. Base and rollback are `king/test@def5bef1c70b8fdb06112149fecfe8b1eb784d40`.

**MAKER ≠ JUDGE:** Factory repairs and verifies the evaluator. Independent Gold must re-run the exact negative mutation against the returned SHA; merge, deployment and LIVE release remain separately authorised.

# DISCOVERY SITEMAP — STANDARDS-VALID XML EVALUATION — 23 OCTOBER 2026

**STATUS:** INDEPENDENT GOLD QA_CORRECT / BOUNDED EVALUATOR CORRECTION / RELEASE HOLD.

**USER ARRIVES BECAUSE:** visitors and crawlers depend on the existing sitemap to expose the public 4PLANET routes without accepting malformed XML as evidence.

**ONE THING TO UNDERSTAND:** route coverage is evidence only when the emitted sitemap is a standards-valid, namespace-correct XML document.

**PRIMARY ACTION:** retain the current public discovery routes and their exact canonical URL identities.

**SECONDARY DEPTH:** preserve the existing comment, CDATA, namespace, origin, query, fragment and raw-path regression matrix.

**WHAT CAN BE REMOVED:** the bespoke lexical XML approximation that accepted duplicate expanded-name attributes, reserved namespace rebinding and raw XML 1.0 control characters.

**WHAT MUST BE REUSED:** issue #483, PR #131, the current sitemap generator, user-entry audit, full analytics/discovery contract and sole `king/test` HEIR.

**TRUTH BOUNDARY:** a passing evaluator proves standards-valid emitted XML and required canonical entries at build time. It does not prove deployment, indexing, traffic, user use, Gold acceptance or ecological outcome.

**MOBILE-FIRST RISK:** none; the correction changes only build-time audit parsing and regression fixtures, not public markup, layout, interaction or navigation.

**HUMAN SUCCESS:** malformed sitemap evidence fails before release while the valid current sitemap and existing public routes remain unchanged.

**ROOT CAUSE / FAILED TEST:** the hand-built tokenizer compared raw attribute names and omitted reserved namespace and raw-character constraints. Gold reproduced five false accepts against `a6fcf5e7188a09d3c28112d7ed5bc38ebccef1fc`; permanent failing-first fixtures now cover all five cases.

**SIMPLEST CAPABLE EXECUTION:** replace only the bespoke tokenizer with the small namespace-aware `saxes` XML 1.0 parser, retain the existing semantic sitemap checks and add the five owning-path regressions.

**DOOR CLASS / ROLLBACK:** reversible HEIR-only evaluator change. Base and rollback are `king/test@a6fcf5e7188a09d3c28112d7ed5bc38ebccef1fc`; revert the bounded parser/dependency/test/brief commit if independent Gold finds regression.

**MAKER ≠ JUDGE:** Factory corrects and verifies the candidate. Independent Gold must judge the exact returned SHA; merge, deployment, indexing and LIVE release remain separately authorised.

# FACTORY RETURN — ABOUT STORY HYDRATION CANONICAL (ISSUE #483)

**USER PROBLEM:** `/about/story` is server-readable and carries a self-canonical in prerendered HTML, but React hydration removes that canonical because the routed Story component does not own page metadata through the shared `Seo` manager.

**BOUNDED CORRECTION:** reuse the existing `Seo` manager on `AboutStory`, keep the existing Story design and text unchanged, and add source plus browser regression coverage proving the hydrated route retains `/about/story`, one owned AboutPage graph and the existing H1.

**TRUTH / RELEASE BOUNDARY:** this is a HEIR candidate on issue #483 and PR #131. It does not assert Gold, merge, deployment, indexation or user use. Independent Gold must judge the exact candidate SHA; Founder authority remains required for release.

**ROLLBACK:** revert the bounded Story metadata/test/brief commit if independent Gold finds an ownership, canonical or structured-data regression.

# HUMAN FIRST / ATLAS — REAL EDGE-DISPATCH REGRESSION — 24 OCTOBER 2026

**STATUS:** INDEPENDENT GOLD QA_CORRECT / REGRESSION-GUARD REPAIR ON SOLE HEIR / RELEASE HOLD.

**USER ARRIVES BECAUSE:** Earth, Fires and Whales must open the governed ATLAS renderer or its honest capability fallback, never the internal Product Control dashboard.

**ONE THING TO UNDERSTAND:** a component URL string is not route proof; the same URL must execute through the generated four-state worker and the current `PRODUCT_SURFACE_REGISTRY`.

**PRIMARY ACTION:** preserve the existing Earth, Fires and Whales journeys and their registered `/atlas?...embed=news&surface=atlas-discovery` destinations.

**SECONDARY DEPTH:** keep the human data note, sources, full-view continuation and current review-runtime SHA visible and independently checkable.

**WHAT CAN BE REMOVED:** confidence based only on source regex matching `/atlas?`.

**WHAT MUST BE REUSED:** PR #384, the existing `atlasDiscovery.json` records, `build-four-state-review-worker.mjs`, `PRODUCT_SURFACE_REGISTRY.json`, the owning discovery contract and sole `king/test` HEIR.

**TRUTH BOUNDARY:** this regression proves real generated-worker dispatch against deterministic upstream fixtures. It does not prove WebGL rendering, mobile layout, production LIVE, real visitor use or independent Gold acceptance.

**ROOT CAUSE / FAILED TEST:** the prior owning contract inspected the component source only. Gold removed/mismatched the ATLAS registry path and showed all three iframe URLs fell to Product Control while 24/24 source tests still passed.

**SIMPLEST CAPABLE EXECUTION:** one same-path test builds and executes the real worker with the actual registry for all three routes, repeats against a mismatched ATLAS registration, and verifies the response SHA guard exposes stale runtime identity. No product code, route, registry or architecture change.

**DOOR CLASS / ROLLBACK:** reversible HEIR-only test/brief correction. Base and rollback are `king/test@94d2e02aba07e5f67ed948a69abf2ce0dca39165`.

**MAKER ≠ JUDGE:** Factory repairs and verifies the guard. Independent Gold judges the exact returned SHA; merge, deployment and LIVE release remain separately authorised.

# ONE LEAN CONTEXT — TASK-CLASS SUPPLEMENTAL-READ GUARD — 25 OCTOBER 2026

**STATUS:** INDEPENDENT GOLD QA_CORRECT / BOUNDED REGRESSION-GUARD REPAIR / RELEASE HOLD.

**USER PROBLEM:** non-user-facing test and control work must stay lean; a future entrypoint must not silently restore mandatory four-state, Gold, Brand OS or lineage bundle loading for every edit.

**ROOT CAUSE / FAILED TEST:** the semantic startup guard covered historical 01/02 archives, private ODIN boot and derived-authority promotion, but did not model task class plus broad supplemental product authority. Gold demonstrated five false accepts at `king/test@5560e1c6c11ecaae7f40dc943face90416bb1972`; the new owning-path test failed 8/9 before the predicate correction.

**BOUNDED CORRECTION:** at the existing per-clause boundary, reject only a sentence that combines global non-user-facing/control scope, an affirmative mandate, and a named broad four-state/Gold/Brand/lineage bundle without an explicit prohibition. The exact five returned sentences and five legitimate task-conditional/prohibitive controls are permanent fixtures.

**RETURN CORRECTION — 25 OCTOBER 2026:** Independent Gold replayed the exact returned SHA and found one remaining false allow: `For a control-only task, always preload the complete product lineage archive before editing.` The owning-path test failed 9/10 before correction. The same finite predicate now recognises only the missing `always` read/load/fetch/preload mandate form and `product lineage archive` bundle phrase; all earlier unsafe and legitimate controls remain the regression boundary. Base and rollback are `king/test@b9064c573bb46c9a68ae9be52f2527af3b909e4e`; independent re-Gold remains required.

**TRUTH BOUNDARY:** this proves the repository entrypoint contract rejects the returned instruction class. It does not prove a fresh agent followed the entrypoint, Gold acceptance, merge, deployment or user use.

**ROLLBACK:** revert the bounded test/brief commit to `king/test@5560e1c6c11ecaae7f40dc943face90416bb1972` if independent Gold finds a false reject or another escaped form.

**MAKER ≠ JUDGE:** Factory repairs and verifies the guard. Independent Gold must judge the exact returned SHA; merge, deployment and LIVE release remain separately authorised.

# MAX EXPOSURE — RESTRICTIVE ROBOTS METADATA PRESERVATION — 26 OCTOBER 2026

**STATUS:** INDEPENDENT GOLD `QA_ACCEPT` FOR THE SOURCE CALLBACK ONLY / EXACT-SHA CI AND NATIVE PREVIEW HOLD / NO LIVE RELEASE.

**USER ARRIVES BECAUSE:** a visitor or crawler follows an existing approved public 4PLANET, S4PIENS or 4BRANDS route whose upstream page may deliberately restrict search presentation or availability.

**ONE THING TO UNDERSTAND:** shared SEO defaults must improve explicitly indexable pages without weakening any upstream publication restriction.

**PRIMARY ACTION:** preserve the existing public route and its upstream robots policy exactly when that policy contains any directive beyond the benign `index` / `follow` baseline.

**SECONDARY DEPTH:** continue applying the existing `index,follow,max-image-preview:large` default only when robots metadata is empty or consists solely of `index` and `follow`.

**P1 DOMINANT / P2 ORIENTATION / P3 ACTION / P4 DEPTH:** upstream publication control / existing route identity / retain the page's intended crawler policy / existing search metadata normalisation.

**WHAT CAN BE REMOVED:** lossy enumeration of only known `noindex` aliases as the boundary for preserving upstream HTML robots metadata.

**WHAT MUST BE REUSED:** issue #483, draft PR #131, the shared middleware callback, the owning host-indexing contract and sole `king/test` HEIR.

**TRUTH BOUNDARY:** the callback and owning contract preserve `nosnippet`, `noimageindex`, `max-snippet:0`, `max-image-preview:none` and `unavailable_after` at source. Independent Gold accepted the exact callback behaviour at `98a96184185717519781a0395eeab2240c3b3cff` with 20/20 cases. This does not prove native Cloudflare HTMLRewriter behaviour, an immutable preview, production deployment, indexation, traffic or user use.

**MOBILE-FIRST RISK:** no rendered layout, navigation or interaction changed. Mobile and desktop browser evidence remains required only to prove final metadata and route behaviour on an exact-SHA preview.

**HUMAN SUCCESS:** approved public pages retain deliberate search restrictions while ordinary indexable pages keep the existing useful SEO default, with no visible journey change.

**QUESTION / DELETE / SIMPLIFY / REUSE:** do not add routes, pages or another policy layer. Replace directive-by-directive exceptions with one conservative rule: only an explicit benign baseline may be normalised.

**SIMPLEST CAPABLE EXECUTION:** one shared callback predicate plus five permanent callback-executing negative fixtures in the existing owning contract.

**DOOR CLASS / ROLLBACK:** reversible HEIR-only correction. Base and rollback are `king/test@56ebef86243d89760fb4ce504ceff6faee3bd9aa`; source callback candidate is `98a96184185717519781a0395eeab2240c3b3cff`. Revert the bounded callback/test/brief sequence if independent exact-SHA runtime evidence finds a publication-policy regression.

**MAKER ≠ JUDGE:** Factory may repair the missing brief and rerun exact-SHA gates. Independent Gold judges runtime release readiness; Founder retains merge/deployment/LIVE authority. The separate transitive `zod <4.6.6` audit finding remains with the existing dependency/security owner and is not bypassed here.

# MAX EXPOSURE — TRANSITIVE ZOD SECURITY GATE — 26 OCTOBER 2026

**STATUS:** CODE FIXED ON HEIR / EXACT-SHA CI RECHECK REQUIRED / NATIVE PREVIEW AND LIVE HOLD.

**USER ARRIVES BECAUSE:** public 4PLANET routes must pass the existing high-severity dependency gate before any release-readiness claim.

**ONE THING TO UNDERSTAND:** the accepted robots-policy source repair is not release-ready while the repository lockfile resolves a dependency version covered by a current high-severity advisory.

**PRIMARY ACTION:** preserve the accepted robots callback and move only the transitive development dependency from Zod `4.4.3` to a registry-resolved patched 4.x version accepted by its existing consumers.

**SECONDARY DEPTH:** retain the exact lockfile provenance, clean-install determinism, high-severity audit, 26-case robots contract, typecheck and full build as the security-correction proof set.

**P1 DOMINANT / P2 ORIENTATION / P3 ACTION / P4 DEPTH:** release safety / exact dependency provenance / keep the candidate on HOLD until gates pass / immutable preview and browser evidence remain separate.

**WHAT CAN BE REMOVED:** no package, product code, route, layout or root dependency declaration; only the vulnerable transitive lock resolution is replaced.

**WHAT MUST BE REUSED:** issue #483, draft PR #131, sole `king/test` HEIR, existing package manifests, mandatory `npm audit --audit-level=high`, host-indexing contract and prior Gold source acceptance.

**TRUTH BOUNDARY:** the resolver-generated lockfile now selects Zod `4.6.7`; clean install and local high-severity audit report zero vulnerabilities, and the 26 robots fixtures remain green. This proves the bounded repository dependency gate locally. It does not prove exact-SHA CI, native preview, production exploitability or absence of every security defect.

**MOBILE-FIRST RISK:** none from this lockfile-only development-dependency correction; rendered mobile and desktop proof is still required for the unchanged public candidate.

**HUMAN SUCCESS:** the accepted robots-policy repair can proceed to independent release-readiness review without bypassing the repository's high-severity audit gate.

**SIMPLEST CAPABLE EXECUTION:** resolver-generated three-line lock entry update plus this existing Gold brief; no direct Zod declaration, integrity hand-edit, audit disablement or unrelated upgrade.

**DOOR CLASS / ROLLBACK:** reversible HEIR-only correction. Base and rollback are `king/test@9d1bb9c5018a1eb2811f2c281f64f6b4cd267b0d`; revert the bounded lockfile/brief sequence if independent Gold or exact-SHA CI finds incompatibility.

**MAKER ≠ JUDGE:** Factory verifies the bounded correction and returns exact evidence. Independent Gold judges security and runtime release readiness; Founder retains merge, deployment and LIVE authority.
