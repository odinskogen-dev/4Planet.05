# EXPO-14 — DISTRIBUTION MEASUREMENT INTEGRITY — 14 OCTOBER 2026

**STATUS:** FOUNDER-DIRECTED P0/P1 MEASUREMENT CORRECTION ON TEST KING / NO PRODUCTION CLAIM.
## USER ARRIVES BECAUSE
4PLANET needs trustworthy ecosystem-level traffic and distribution reporting before early signals are used for decisions.
## ONE THING TO UNDERSTAND
External discovery, internal cross-domain navigation, auth infrastructure and founder testing must not be counted as the same thing.
## PRIMARY ACTION
Keep credential-bearing navigation out of analytics, isolate internal browsers, suppress owned/auth/deployment referral pollution, classify Google/Bing/Ecosia/DuckDuckGo and major AI referrers, and submit only canonical sitemap URLs through IndexNow.
## SECONDARY DEPTH
GA4 remains the behaviour/acquisition layer; native Search Console and Bing Webmaster Tools remain the search-impression/ranking layer.
## P1 DOMINANT
Clean measurement truth.
## P2 ORIENTATION
Discovery channel and landing product/path.
## P3 ACTION / NEXT
Verify deterministic contracts and exact TEST KING behaviour before any production promotion.
## P4 DEPTH
Search visibility, query, page, CTR and index-state reporting remain separate from on-site behaviour.
## WHAT CAN BE REMOVED
Self-referrals, auth/deployment referrals, founder/internal browser traffic and legacy redirect-route IndexNow submissions.
## WHAT MUST BE REUSED
Existing GA4 property, consent gate, sensitive-navigation block, shared ProductAnalytics spine, canonical sitemap generator and Founder release law.
## TRUTH BOUNDARY
A session is not a unique person; a search click is not an impression; an IndexNow submission is not indexing; an AI citation is not a click; internal product movement is not external acquisition.
## MOBILE-FIRST RISK
None introduced by this measurement-only runtime change; the control query is removed from the visible URL immediately after use.
## HUMAN SUCCESS
Founder reporting can distinguish real external discovery from internal testing and can identify which product/search landing surface earned the visit.

**MAKER ≠ JUDGE:** AXE implemented the bounded measurement correction. Existing independent Gold/TEST KING gates judge the resulting SHA. No production release is claimed by this brief.

---

# EXPO-13 — GA4 Admin automatic-write prevention / 14 October 2026

**STATUS:** HEIR security fix / independent CI, QA and readback pending. **HUMAN VALUE:** Analysis remains trustworthy without accidental third-party account mutation on routine code push. **PRIMARY ACTION:** GA4 Admin push is strictly audit/read-only; a manual APPLY requires exact 'enig send' Founder release input and explicit choice. **REUSE:** existing GA4 property, scripts, GitHub workflow and issue #173. **TRUTH:** No GA4 configuration was changed by this source patch and LIVE/GA4 provider state remains unverified. **BASE / ROLLBACK:** king/test@7aff9971073234b82f653c41e358ae43a5bcaf3d.

---

# EXPO-13 — OAuth-safe analytics P0 / 14 October 2026

**STATUS:** HEIR CODE ONLY, independent security Gold and LIVE verification required.
**HUMAN NEED:** Privacy-preserving access to public tools and reliable account login.
**PRIMARY ACTION:** Prevent analytics SDK installation, automatic initial measurements and custom events while sensitive auth values remain in the browser URL.
**REUSE:** Existing analytics consent, 4PLANET ID SDK, GA4 and PostHog event spine, issue #173.
**TRUTH BOUNDARY:** No historical GA4 deletion, token revocation, external collector/legacy live proof or product outcome is claimed. The identity SDK continues to consume OAuth callbacks; this gate deliberately skips analytics on callbacks until navigation is safe.
**MOBILE:** Test iOS Safari callback and cross-domain bridge with Chrome; browser-network capture and 0 secrets in measured URLs required.
**VALUE:** Clean public pages can still be measured after consent, without capturing confidential redirects.
**OWNER / GATES:** EXPO-13 Maker, separate Gold security judge, action-specific Founder release for LIVE.
**PARENT / ROLLBACK:** king/test@64ee6b31158a1b1102f28f268e9ee0ef828603a5.

---

# EXPO-03 — OSLOFJORD PUBLIC CRAWLER SCOPE / 14 OCT 2026

**STATUS:** BOUNDED INFRASTRUCTURE DRAFT / INDEPENDENT GOLD PENDING / NO LIVE RELEASE.
**USER ARRIVES BECAUSE:** a person searching for Oslofjord nature and restoration should reach public evidence, not a blocked prefix.
**ONE THING TO UNDERSTAND:** /os is a private operations path; /oslofjord is a public ecological place.
**PRIMARY ACTION:** make /os inaccessible to crawlers without excluding /oslofjord.
**SECONDARY DEPTH:** Googlebot, Bingbot, OAI-SearchBot and wildcard all inherit identical restrictions; generator matches static file.
**P1 / P2 / P3 / P4:** public discovery / reliable URL scope / access to evidence / deeper source links.
**REMOVE:** overbroad Disallow: /os and exceptional unrestricted crawler groups.
**REUSE:** existing robots file, sitemap generator, discovery SEO test, BRAND-6 / EXPO-03 and 4PLANET HEIR.
**TRUTH BOUNDARY:** crawler policy is not server access control; draft PR and CI are not production indexing or acquired real users.
**MOBILE RISK:** no visual change; deployed mobile/browser crawl checks still required.
**HUMAN SUCCESS:** /os remains excluded for all listed crawlers, /oslofjord remains eligible for search discovery.
**DONOR DECISION:** no historical donor, bounded correction of existing infrastructure only.
**BASE / ROLLBACK:** king/test@74a6b7987d0675cc21c3ae504cb65789f78901a0; this OPS-only support branch is non-authoritative and never automatically releases.
**MAKER / JUDGE:** independent exact-SHA review and production release authority remain mandatory.

---

# 4SAPIEN AUTHENTICATED EVENT DELIVERY RECEIPTS — 14 OCT 2026

**STATUS:** RETURNED LIFE-OS-01 QA_CORRECT CONSUMED / SOLE HEIR MAKER CORRECTION / INDEPENDENT GOLD PENDING / NO LIVE RELEASE.
**USER ARRIVES BECAUSE:** a person returns to their private 4SAPIEN world and the product must measure that return without mixing them with another signed-in person who used the same tab.
**ONE THING TO UNDERSTAND:** a per-session product-event receipt belongs to one authenticated identity and exists only after the server acknowledges delivery.
**PRIMARY ACTION:** isolate each deduplication key by authenticated user identity, keep concurrent duplicate attempts coalesced, and record `delivered` only after a successful event response.
**SECONDARY DEPTH:** a failed delivery remains retryable; an A→B→A account switch preserves each identity's own acknowledged receipt.
**P1 DOMINANT / P2 ORIENTATION / P3 ACTION / P4 DEPTH:** truthful return measurement / private identity boundary / acknowledged delivery / deterministic negative regression coverage.
**WHAT CAN BE REMOVED:** pre-delivery receipt writes and cross-account event suppression.
**WHAT MUST BE REUSED:** the existing 4SAPIEN event endpoint, authenticated `user()` boundary, session storage lifetime, issue #317 and sole `king/test` HEIR.
**TRUTH BOUNDARY:** an acknowledged event is delivery evidence, not proof of human value, retention, independent Gold, deployment or LIVE behaviour.
**MOBILE-FIRST RISK:** none to layout; exact-head browser/auth proof remains required because this is a signed-in runtime path.
**HUMAN SUCCESS:** two people using one browser tab are counted independently, while a transient delivery failure cannot silently suppress the next valid attempt.
**BASE / ROLLBACK:** `king/test@6e0d3543bc1f2ec6d5f2d5459393a324225cb301`; revert only the bounded event-receipt correction if independent Gold rejects it.
**MAKER ≠ JUDGE:** Factory implements and runs deterministic contracts; independent Gold judges the exact HEIR SHA. No production release is authorised.

# IMP-06 — MOBILE PROOF-LADDER READING ORDER — 14 OCT 2026

**STATUS:** RETURNED QA_CORRECT CONSUMPTION ON SOLE HEIR / MAKER CORRECTION / INDEPENDENT GOLD REQUIRED / NO LIVE RELEASE.

## USER ARRIVES BECAUSE
A person opens the documented Bay action on a phone to understand which claims each proof state can and cannot support.

## ONE THING TO UNDERSTAND
Every stronger claim requires a stronger state, and each `DOES NOT PROVE` boundary must remain visible beside the state it limits.

## PRIMARY ACTION
Read the Proof Ladder from state to evidence meaning to limitation without horizontal scrolling at 390px or 430px.

## SECONDARY DEPTH
Desktop retains the existing three-column comparison while mobile uses the same content and DOM reading order in one column.

## P1 DOMINANT / P2 ORIENTATION / P3 ACTION / P4 DEPTH
The proof state is dominant; the numbered step orients; the evidence meaning explains; `DOES NOT PROVE` preserves the action/claim boundary.

## WHAT CAN BE REMOVED
The fixed 482px minimum grid width that cannot fit the required mobile viewports.

## WHAT MUST BE REUSED
The existing Bay action route, `cell.proofLadder` data, state/proves/doesNotProve copy, PublicShell/Section hierarchy, IMP-06/#151 receiver and sole `king/test` HEIR.

## TRUTH BOUNDARY
Responsive layout does not promote contribution, delivery, evidence, outcome or impact state. No proof copy or operational state changes.

## MOBILE-FIRST RISK
The single-column layout must preserve DOM reading order, visible limitation labels and a no-horizontal-overflow contract at both 390px and 430px; desktop must remain three columns.

## HUMAN SUCCESS
A phone reader can read every proof state and its limitation without horizontal scrolling or losing the relationship between them.

**DONOR DECISION:** no donor; correct the current HEIR component in place.
**BASE / ROLLBACK:** `king/test@57471cc8e1e7cf8f515d99bc802d94ad5d1d3a67`; revert only this bounded correction if independent Gold finds a valid layout, accessibility or truth regression.
**MAKER ≠ JUDGE:** Factory implements and returns an exact SHA. Independent Gold must run Chromium and WebKit at 390/430 plus desktop. No merge, deployment, release or LIVE claim is authorised.

---

# IMPACT-LAN-GOLD-01 / GOLD-TEMPLATE-REFINEMENT-02 — 4PLANET IMPACT LIVING ACTION NETWORK — 13 OCT 2026

**STATUS:** TEST KING GOLD CANDIDATE / NO PRODUCTION LIVE RELEASE / FOUNDER RELEASE STILL REQUIRED / ENIG LIVE NOT GIVEN FOR PRODUCTION.

## USER ARRIVES BECAUSE
A person wants to quickly discover credible ecological action by problem, place, actor and solution, see enough options on one screen to compare and explore, then open evidence and a real action route without being misled about partnership or outcomes.

## ONE THING TO UNDERSTAND
4PLANET IMPACT is a living action network, not a catalogue of green badges: ISSUE → PLACE → ACTOR → PROJECT → SOLUTION → EVIDENCE → ACTION are connected objects in the existing NATUREBRAIN.

## PRIMARY ACTION
Browse a dense, image-led issue/project collection, open one project or actor profile, inspect original evidence and continue to the external action route or the existing first-party ATLAS.

## SECONDARY DEPTH
Project profiles expose actor, place, solution, source-backed claims, limitations, rights posture and ATLAS context. Actor profiles expose known projects and a public-record trust boundary. NATUREBRAIN remains the truth source; the static discovery manifest is SEO/prerender projection only.

## P1 DOMINANT
Human-first visual discovery using 4PLANET’s canonical premium language: strong living-world imagery, white/black/BRANDBLÅ system, Instrument Sans display, DM Sans reading/UI and Fragment Mono evidence/meta; these type roles are wired explicitly in the IMPACT stylesheet rather than relying on undefined local variables; high information density without generic SaaS cards, dashboards or oversized one-project-per-screen layouts.

## P2 ORIENTATION
Issue families and project metadata provide fast orientation. URL filters normalise to the canonical underscore IDs (for example ?issue=coral → CORAL_) and are exercised in the dedicated browser proof. Mobile keeps a two-column browse grid where possible, following the Founder’s preferred compact visual family pattern while remaining part of 4planet.org rather than a separate brand.

## P3 ACTION / NEXT
Open Project Profile → Actor Profile / ATLAS / original source / external support route. External support remains on the third party’s own site and does not create a 4PLANET contribution or delivery record.

## P4 DEPTH
Evidence rows preserve source-reported versus externally reviewed status, interpretation state, original source, rights posture and limitations. Graph relationships provide reusable context for later SOLUTIONS, CAPITAL, Magazine and other lenses without duplicating truth.

## WHAT CAN BE REMOVED
The prior generic-SaaS prototype grammar: giant dark dashboard hero, oversized project panels, decorative status-card chrome, graph-as-front-door and low-density single-object browsing. Legacy four-unit IMPACT remains only where required for compatibility; it is not the new discovery front door.

## WHAT MUST BE REUSED
Existing NATUREBRAIN planetbrain entity/relationship/claim/evidence/source model; public.impact_lan_gold_v01() controlled projection; existing 4PLANET ID / PublicShell; existing first-party ATLAS and AtlasEmbed; canonical 4PLANET analytics/SEO infrastructure; current rights-cleared 4PLANET media. No new Brain, database, map engine or parallel truth store.

## TRUTH BOUNDARY
Listing ≠ partnership or endorsement. External action ≠ 4PLANET contribution. Contribution ≠ delivery. Delivery ≠ ecological outcome. Outcome ≠ independent verification. External recognition is named as external recognition. Source-reported metrics remain source-reported. Issue-family imagery is not project evidence. Place boxes are navigation context, not automatically project, legal or ecological boundaries.

## MOBILE-FIRST RISK
The two-column mobile browse must remain legible at 390/430px: project names, actor names and review state cannot collapse into unreadable metadata; profile evidence and ATLAS must move to progressive depth rather than forcing horizontal dashboard layouts.

## HUMAN SUCCESS
A first-time visitor can see several meaningful options immediately, understand what each project is and who is doing it, distinguish source-checking from partnership/outcome verification, reach original evidence in one profile, and feel that IMPACT belongs to the same high-end 4PLANET brand as the main public world.

**BASE / ROLLBACK:** Gold candidate introduced at TEST KING abe4c2f5390d9bb5aae818250473d8b453a6cbd4; revert that bounded integration and this brief if independent Gold finds a valid regression.
**MAKER ≠ JUDGE:** AXE built the candidate. Independent Gold and TEST-domain browser evidence judge it. The applied NATUREBRAIN migration is persisted under supabase/migrations, a dedicated desktop-1440/mobile-390 IMPACT browser proof runs before unrelated shared product suites so its evidence cannot be suppressed by legacy failures, and an IMPACT-only exact-SHA workflow separately proves https://test.4planet.org/impact before any production authority is considered. No production promotion is authorised without the existing Founder release gate.

---

# GREEN DATA → COMPOUNDING PRODUCT VALUE 02 — SHARED DATA + NATUREBRAIN + ATLAS — 13 OCT 2026

**STATUS:** FOUNDER-DIRECTED MAKER CANDIDATE ON SOLE HEIR / INDEPENDENT GOLD PENDING / NO DEPLOYMENT / NO LIVE RELEASE.
**USER ARRIVES BECAUSE:** a person explores a place, country or human system and needs authoritative data to become understandable, spatial and reusable without losing source, time, rights or limitations.
**ONE THING TO UNDERSTAND:** one qualified source integration should improve multiple 4PLANET lenses without creating multiple versions of reality.
**PRIMARY ACTION:** register the qualified UNESCO source family in the existing NATUREBRAIN source federation, expose bounded shared country/source contracts, and add four curated spatial layers through the existing ATLAS engine.
**P1 ATLAS:** Biosphere Reserves, World Heritage, Global Geoparks and OBIS ocean-area biodiversity summaries are optional curated layers; inactive layers make no product fetch.
**P2 COUNTRY / S4PIENS:** UNESCO Member States supplies bounded country identity/context; WDI supplies country-scoped metric/series read paths with individual years preserved for Claude's 4NATION/S4PIENS product work.
**P3 NATUREBRAIN:** source/dataset/feed metadata uses the existing planetbrain schema; all six candidate feeds remain disabled and no source records, claims, relationships or measurements are bulk-created by this slice.
**P4 RIGHTS:** implemented UNESCO DataHub datasets are recorded as CC BY-SA 4.0 with attribution + ShareAlike; raw OBIS occurrence licences remain a separate record-level/dataset-level contract.
**ACCEPTANCE:** current upstream endpoint/schema probes; bounded Norway WDI probe; shared contract tests; TypeScript; production build; Chromium + WebKit ATLAS layer/failure-state browser proof; independent Gold on the exact HEIR SHA.
**TRUTH BOUNDARY:** designation ≠ ecosystem health; representative point ≠ boundary; occurrence/record count ≠ abundance or complete richness; national average ≠ local condition; mixed vintages remain visible; missing/source failure ≠ zero; UNESCO membership context ≠ sovereignty adjudication.
**CLAUDE BOUNDARY:** Claude owns the 4NATION Country Object and S4PIENS Human Systems product experiences. This slice supplies shared data/contracts and ATLAS capability only; no second map engine or truth store is authorised.
**BASE / ROLLBACK:** `king/test@0997cc6157894f7ea943ae1242a56ebcbff1117c`; revert this single bounded integration commit if Gold finds a valid regression.
**MAKER ≠ JUDGE:** AXE supplies the bounded HEIR candidate; independent Gold judges exact evidence. No production promotion is authorised by this brief.

# 4PLANET GET INVOLVED — TIME + CORE-COST FAIL-CLOSED CORRECTION — 13 OCT 2026

**STATUS:** RETURNED QA_CORRECT CONSUMED ON EXISTING HEIR / INDEPENDENT GOLD PENDING / NO LIVE RELEASE.
**USER ARRIVES BECAUSE:** a person filters public participation options by available time and whether essential participation costs are covered.
**ONE THING TO UNDERSTAND:** a weekend is not a week, and one covered category is not evidence that all core costs are covered.
**PRIMARY ACTION:** match week-scale duration only on explicit week or fortnight tokens; pass `COSTS_COVERED` only when travel, accommodation and food are each explicitly covered, provided, included, funded or not required.
**ACCEPTANCE:** deterministic controls reject `one weekend` for WEEKS, accept explicit week/fortnight duration, keep unknown duration UNKNOWN, keep partial/ambiguous core-cost evidence UNKNOWN, fail participant-paid core costs, and pass only complete coverage/not-required evidence.
**TRUTH BOUNDARY:** synthetic deterministic fixtures prove gate semantics only. They do not prove current opportunity terms, consented analytics, recommendation quality, independent Gold, deployment or LIVE behaviour.
**BASE / ROLLBACK:** `king/test@dffba7b342bece03f5b33415637809b899273738`; revert this bounded correction if independent Gold finds a valid participation-filter regression.
**MAKER ≠ JUDGE:** Factory corrects the existing receiver; independent Gold judges the exact resulting SHA. No publish, merge, deployment or production mutation is authorised.

# ATLAS — GBIF LICENCE FAIL-CLOSED CORRECTION — 13 OCT 2026

**STATUS:** RETURNED QA_CORRECT CONSUMED ON EXISTING HEIR / INDEPENDENT GOLD PENDING / NO LIVE RELEASE.
**USER ARRIVES BECAUSE:** a person opens a GBIF occurrence and needs rights metadata to govern reuse truthfully.
**ONE THING TO UNDERSTAND:** a string that merely contains open-licence words or a Creative Commons-looking path is not proof of an open licence.
**PRIMARY ACTION:** classify only explicit vetted CC0/Public Domain/CC BY tokens or anchored official Creative Commons URLs as open.
**ACCEPTANCE:** negated, ambiguous, spoofed-host, restricted and unknown strings remain `REVIEW_REQUIRED`; point admission rejects them; positive CC0 and CC BY controls remain admitted.
**TRUTH BOUNDARY:** deterministic source contracts do not prove upstream metadata completeness, independent Gold, deployment or LIVE behaviour.
**BASE / ROLLBACK:** `king/test@9cac62ba447bcc567317416594809901a4c4463d`; revert the bounded correction commits if independent Gold finds a valid licence regression.
**MAKER ≠ JUDGE:** Factory implements F42–F44; independent Gold judges exact SHA. No release or production mutation is authorised.

# NAT-PROT-01 — SSB UNIT + STATUS SOURCE TRUTH — 12 OCT 2026

**STATUS:** RETURNED QA_CORRECT CONSUMED ON SOLE HEIR / INDEPENDENT GOLD PENDING / NO LIVE RELEASE.
**USER ARRIVES BECAUSE:** a person opens an official SSB extract to understand a public decision and must know what each number measures.
**ONE THING TO UNDERSTAND:** an SSB value is not decision-grade without its per-ContentsCode unit, precision, reference period and missing/confidential status.
**PRIMARY ACTION:** preserve source metadata through the adapter and display each cell as value plus unit, status and reference period; use explicit UNKNOWN when SSB supplies no unit or reference period.
**ACCEPTANCE:** deterministic mixed-unit fixtures cover decimals, reference periods, dataset and metric footnotes, null/suppressed status, and the bounded 24-cell preview disclosure; the surface never renders a bare value.
**TRUTH BOUNDARY:** this remains SSB's default extract and a maximum 24-cell preview, not a complete table, selected causal model or policy recommendation.
**MOBILE-FIRST RISK:** longer unit, status and reference-period labels must remain readable and announced at 390/430px; rendered browser proof remains an independent Gold gate.
**WHAT MUST BE REUSED:** existing `/api/statbank-context`, `StatbankContextFinder`, PR #131, NAT-PROT-01 and sole `king/test` HEIR.
**BASE / ROLLBACK:** `king/test@8642134e1e4f875fc022cc0782ef3e190bcfea29`; revert this bounded correction if independent Gold rejects it.
**MAKER != JUDGE:** Factory implements and returns an exact SHA; independent Gold judges it. No deployment or LIVE claim is authorised.

# IMPACT — UNAPPOINTED FIELD-PARTNER TRUTH — 12 OCT 2026

**STATUS:** RETURNED QA_CORRECT CONSUMED ON THE SOLE HEIR / INDEPENDENT GOLD OPEN / NO DEPLOYMENT / NO LIVE RELEASE.

## USER ARRIVES BECAUSE
A person wants to understand how the four IMPACT pathways could become real without being misled about present delivery capacity.

## ONE THING TO UNDERSTAND
The pathways are designed for field-partner delivery, but no field partner has yet been selected and verified for any of the four units.

## PRIMARY ACTION
Explore the four existing pathways and the separately documented Bay action while the funding and partner gates remain visibly closed.

## SECONDARY DEPTH
Each unit retains its explicit partner status, planned proof model, source-backed ecology and honest `TO BE SELECTED` field.

## P1 DOMINANT
IMPACT is a credible action design, not a claim of completed field delivery.

## P2 ORIENTATION
Partner selection and verification are required before delivery language can become present-tense.

## P3 ACTION / NEXT
The existing Bay proof link remains available and explicitly not open for funding.

## P4 DEPTH
Unit pages continue to expose source, partner, place and proof boundaries without inventing provider, payment, delivery, outcome or impact.

## WHAT CAN BE REMOVED
The unsupported hero phrase `delivered by a chosen field partner`.

## WHAT MUST BE REUSED
Existing four-unit structure, `impactUnits.ts` operational states, Bay action link, context retention, IMP-06/#151 receiver and sole `king/test` HEIR.

## TRUTH BOUNDARY
Designed for delivery is not selected, contracted, funded, delivered, evidenced, an outcome or verified impact.

## MOBILE-FIRST RISK
The replacement sentence must retain the existing hero hierarchy and wrapping at 390/430 widths; browser rendering remains an independent Gold gate.

## HUMAN SUCCESS
A first-time visitor cannot reasonably infer that 4PLANET has already appointed partners or completed field delivery.

**BASE / ROLLBACK:** `king/test@1b4a4737fb2e3edac4bfc857ea9bf8433a63ff09`; revert this bounded correction if independent Gold finds a valid truth or product regression.

**MAKER ≠ JUDGE:** Factory corrects the claim on the existing receiver; independent Gold judges the exact returned SHA. No release or production authority is created.

# SPEC-GS-11 — GBIF OCCURRENCE TRUTH + RIGHTS BOUNDARY — 12 OCT 2026

**STATUS:** RETURNED QA_CORRECT CONSUMED ON SOLE HEIR / INDEPENDENT GOLD PENDING / NO LIVE RELEASE.
**USER ARRIVES BECAUSE:** a person opens a SPECIES occurrence view and expects every coordinate to be an explicit source-reported presence with visible provenance and lawful reuse state.
**ONE THING TO UNDERSTAND:** GBIF occurrence totals are filtered source-record counts—not range, abundance, trend or live position—and a record licence never transfers to independent media.
**PRIMARY ACTION:** require explicit PRESENT status, no geospatial issue and two finite in-range coordinates; preserve genuine zero coordinates, full event time, retrieval time, dataset/publisher/citation/DOI and raw record licence.
**RIGHTS BOUNDARY:** CC0/public domain and plain CC BY are public-use-ready. Missing, NC, ND and SA terms remain review-required. Universal profiles preserve review-required records for downstream enforcement; public curated rows fail closed and withhold them.
**COUNT SEMANTICS:** `total` is the GBIF server count for the explicit PRESENT/no-geospatial-issue query; returned-page, public-use and rights-review counts are separate.
**ACCEPTANCE:** fixtures cover CC0, plain BY, BY-NC, BY-SA, missing licence, absent/unknown status, geospatial issue, null/out-of-range coordinates, genuine zeros and independent media rights on both GBIF read paths.
**BASE / ROLLBACK:** `king/test@303d7c1dde2e264b43b7e2fe220a3014483950ce`; revert the bounded correction commit if independent Gold rejects it.
**MAKER ≠ JUDGE:** Factory implements; independent Gold judges the exact SHA. No deploy, Gold or LIVE claim is authorised.

# ATLAS-08 — OBIS PRESENCE + COORDINATE TRUTH CORRECTION — 12 OCT 2026

**STATUS:** RETURNED QA_CORRECT CONSUMED ON SOLE HEIR / INDEPENDENT GOLD PENDING / NO LIVE RELEASE.
**USER ARRIVES BECAUSE:** a person opens the WH4LES layer and expects every plotted point to be an explicit source-reported presence at a real supplied coordinate.
**ONE THING TO UNDERSTAND:** missing coordinates are unknown, not (0,0), and missing/unknown occurrence status is not evidence of presence.
**PRIMARY ACTION:** admit only explicit PRESENT records through the OBIS bridge and route only those records with two supplied finite in-range coordinates to the map.
**SECONDARY DEPTH:** retain genuine equator and prime-meridian coordinates, raw presence status, rights, provenance, uncertainty and sensitive-location gates.
**P1 DOMINANT:** null, undefined and blank coordinates remain null and never plot.
**P2 ORIENTATION:** genuine numeric latitude or longitude zero remains valid.
**P3 ACTION:** ABSENT, UNKNOWN and missing status cannot become visible presence points.
**P4 DEPTH:** deterministic bridge-to-routed-WH4LES fixtures do not prove upstream completeness, browser presentation, independent Gold, deployment or LIVE behaviour.
**WHAT CAN BE REMOVED:** fail-open status defaults and JavaScript numeric coercion of missing coordinates.
**WHAT MUST BE REUSED:** the existing /api/obis bridge, routed WH4LES layer, rights/provenance envelope, source-bridge contract, issue #244 and sole king/test HEIR.
**TRUTH BOUNDARY:** admitted points remain occurrence evidence only—not abundance, range, trend, causality or live position.
**MOBILE-FIRST RISK:** no layout change; rendered desktop/mobile/WebKit acceptance remains an independent Gold gate.
**HUMAN SUCCESS:** no unknown-status or false null-coordinate point can appear, while legitimate zero-coordinate evidence remains available.
**DONOR DECISION:** no donor; correct the existing HEIR path in place.
**BASE / ROLLBACK:** king/test@f70fa2ec24453003947017bdbeec54d408a9bbb7; revert the bounded correction commit if independent Gold finds a valid occurrence regression.
**MAKER ≠ JUDGE:** Factory implements; independent Gold judges exact SHA. No deployment or production release is authorised.

# NAT-PROT-01 — 4NATION PLACE/CASE CONTINUITY CORRECTION — 12 OCT 2026

**STATUS:** HEIR INTEGRATE/CORRECT / RETURNED SOURCE QA / NO GOLD OR LIVE RELEASE.
**BASE AUTHORITY:** `king/test@841e95cabb9d5681347eb5f663bfa1184ccdf952`, PR #131, Atomic `NAT-PROT-01`. Roll back by reverting this bounded correction commit.

- **USER ARRIVES BECAUSE:** they want to open a sourced Norwegian public decision through its real place and keep that same context when sharing or returning.
- **ONE THING TO UNDERSTAND:** the place explorer can show several source-bound cases, while the deeper lenses below are still the single Oslofjord featured case.
- **PRIMARY ACTION:** choose a place and public decision, then open the original record.
- **SECONDARY DEPTH:** the shared ATLAS context, journey, related policy and source federation.
- **P1 DOMINANT:** selected public decision. **P2 ORIENTATION:** validated place/case plus source state. **P3 ACTION:** official case/source. **P4 DEPTH:** map, chronology and source backbone.
- **WHAT CAN BE REMOVED:** accidental blank-query selection and implied scope transfer from the selected municipal case into the Oslofjord-only workbench.
- **WHAT MUST BE REUSED:** existing Nation place/case registry, URL state, browser history, source-bound decision cards and existing hierarchy/styles; no new router or state store.
- **TRUTH BOUNDARY:** URL values are accepted only when the place and decision are registered and internally consistent. Downstream lenses remain explicitly Oslofjord-only; no Bergen/Oslo data is implied there.
- **MOBILE-FIRST RISK:** long query values or scope copy must not displace the existing primary source/action hierarchy at 390/430px.
- **HUMAN SUCCESS:** blank search selects nothing; a valid selected place/case survives copy, reload and back; unsupported or mismatched URL state resolves to one valid registered pair; users are not led to read Oslofjord evidence as municipal-case evidence.

**MAKER ≠ JUDGE:** deterministic tests, typecheck/build and exact-SHA readback prove implementation only. Independent Gold must run Bergen/Oslo/Norway, blank/unknown, source-identity, copy/reload/back and 390/430/1440 browser checks. No deploy, Gold or LIVE claim is authorised.

# ATLAS CANONICAL TAXON SEARCH IDENTITY — 11 OCT 2026

**STATUS:** RETURNED ATLAS-04 QA_CONTRACT CONSUMED / SOLE HEIR MAKER CORRECTION / INDEPENDENT GOLD PENDING / NO LIVE RELEASE.
**USER ARRIVES BECAUSE:** a person searching the living planet must not lose a legitimate taxon merely because another accepted GBIF taxon shares the same scientific-name label.
**ONE THING TO UNDERSTAND:** scientific names are display labels; accepted GBIF identity is canonical `taxon:gbif:<key>`.
**PRIMARY ACTION:** deduplicate repeated provider rows only when their canonical accepted GBIF ID matches; retain distinct IDs with identical names and show rank, kingdom and GBIF key for honest disambiguation.
**ACCEPTANCE:** executable fixtures prove same ID 2→1, different IDs/same name 2→2 and missing canonical identity fail-closed; the actual routed World search uses the shared canonical helper.
**NON-GOALS:** no camera, layers, NOW/WATCH, ingest, deployment, LIVE, release or self-Gold.
**ROLLBACK:** revert the exact candidate commit returned for this bounded correction.

# ATLAS ROUTED OBIS COMPOSITE RIGHTS + PROVENANCE — 11 OCT 2026

**STATUS:** CURRENT NATUREBRAIN RIGHTS HANDOFF CONSUMED / SOLE HEIR MAKER CORRECTION / INDEPENDENT GOLD PENDING / NO LIVE RELEASE.
**USER ARRIVES BECAUSE:** a person opens the routed ATLAS WH4LES layer and needs to know whose occurrence record this is, what original rights apply and whether the plotted location is safe to expose.
**ONE THING TO UNDERSTAND:** OBIS indexes original occurrence datasets; OBIS-derived products may be CC0, but that does not replace original dataset licences.
**PRIMARY ACTION:** route WH4LES through the governed bridge, preserve every composite NC/ND/SA restriction, fail closed on missing rights or withheld/generalised locations, and expose provider/citation/DOI/URL/raw licence/retrieval evidence.
**ACCEPTANCE:** executable fixtures cover CC0, BY, BY-NC, BY-NC-ND, BY-SA, missing rights and sensitive/generalised locations; the routed `src/earth/layers.ts` loader admits only clean CC0/plain-BY records and never calls OBIS directly.
**NON-GOALS:** no protected camera/search/NOW/WATCH/mobile redesign, no ingest, deployment, release or self-Gold.
**ROLLBACK:** revert the exact candidate commit returned for this bounded correction.

# ATLAS ROUTED GBIF POINT TRUTH — 11 OCT 2026

**STATUS:** RETURNED SOURCE QA_CONTRACT CONSUMED / SOLE HEIR MAKER CORRECTION / INDEPENDENT GOLD PENDING / NO LIVE RELEASE.
**USER ARRIVES BECAUSE:** a person opens the routed ATLAS SPECIES layer and needs an honest occurrence record, not an invented current position, an incorrect vertebrate label or a silent source failure.
**ONE THING TO UNDERSTAND:** this layer is a bounded Chordata occurrence view. Only records explicitly reported PRESENT with finite in-range coordinates and accepted display rights become points.
**PRIMARY ACTION:** preserve zero coordinates, reject ABSENT/UNKNOWN presence and geospatially invalid records, expose event date/coordinate uncertainty/dataset/DOI/licence/retrieval evidence, and keep upstream/contract errors OFFLINE rather than zero.
**ACCEPTANCE:** executable positive/negative fixtures cover presence, zero/null/out-of-range coordinates, geospatial issues, CC0/CC BY versus review-required rights, and evidence fields; the routed `src/earth/layers.ts` loader uses the guarded path.
**NON-GOALS:** no protected ATLAS camera/search/layer/NOW/WATCH/mobile mutation; no data ingest, deployment, LIVE claim or release.
**BASE / ROLLBACK:** `king/test@fa25d73b7e0587e84f9b069e8bf235a40caccee1`; revert only this bounded commit if independent Gold rejects it.
**MAKER ≠ JUDGE:** Factory implements; independent Gold runs exact-head contract/browser proof against the protected LIVE baseline. Founder release remains required.

# SEARCH DISCOVERY — EMPTY NEWS SITEMAP FAIL-CLOSED — 10 OCT 2026

**STATUS:** HEIR TECHNICAL DISCOVERY CORRECTION / NO LIVE RELEASE.
**PROBLEM:** Search Console reports errors for submitted news sitemaps while the current canonical Magazine story source contains no genuinely published story inside the Google News 48-hour window. Emitting and advertising an empty News sitemap creates crawl debt without user value.
**RULE:** a News sitemap exists and is advertised in robots.txt only when at least one real story has a valid publication timestamp inside the bounded news window. No invented publication dates.
**ACCEPTANCE:** generator removes stale `news-sitemap.xml` when the eligible set is empty; robots omits the News sitemap declaration in that state; ordinary Magazine SEO contract locks the behaviour.
**TRUTH BOUNDARY:** this does not remove or noindex evergreen Magazine stories; it only removes an empty Google News-specific discovery surface.
**ROLLBACK:** parent `0cc2cf35a54472f200adf19c8988a83378f7a7da`.
**MAKER ≠ JUDGE:** exact build/contracts required; LIVE remains Founder-gated.

# 4PLANET STORY — FOR A LIVING PLANET — MAGAZINE GOLD 01 — 10 OCT 2026

**STATUS:** FOUNDER_ACCEPTED PUBLIC MAGAZINE STORY / HEIR CANDIDATE / LIVE PUBLICATION REQUESTED / INDEPENDENT GOLD REQUIRED.
**FOUNDER DECISION:** “bruk sterke visueller … bygge en premium artikkel av dette og publisere på 4Planet Magazine” + request to test it as a Magazine About story and recheck against BRAIN.
**CANON AUTHORITY:** ODDEKALV_ FOUNDER THESIS — WHAT WE BELIEVE — LOCKED CANON 2.0 + current 4PLANET Playbook / ecological North Star. No new values, mission or parallel brand truth is created.

**USER ARRIVES BECAUSE:** a person encounters 4PLANET for the first time and wants to understand, emotionally and concretely, why it exists and whether there is a meaningful place for them in the mission.
**ONE THING TO UNDERSTAND:** 4PLANET exists to connect care, knowledge and capability so understanding can become useful, truthful action for a living planet.
**PRIMARY ACTION:** read the story; if it resonates, continue to FIND YOUR PART.
**SECONDARY DEPTH:** What We Believe, Living Systems and the wider product ecosystem explain the philosophy and system in more detail.

**P1 DOMINANT:** human emotional opening — ocean, forest, animal, holding the hand of someone we love.
**P2 ORIENTATION:** humanity has extraordinary capability, yet care, knowledge, solutions, people and resources remain fragmented.
**P3 ACTION / NEXT:** “There is a place for everyone who wants to help. Including you.” → /join.
**P4 DEPTH:** Truth First, useful action, responsible power, learning/compounding and the ecological North Star.

**EDITORIAL TYPE:** ORGANISATIONAL_EXPLAINER. It must remain visibly labelled as 4PLANET-owned organisational content, not independent Magazine reporting.
**STORY LENGTH:** deliberately concise (~600 words); emotional narrative outranks exhaustive product explanation.
**VISUAL CONTRACT:** Earthrise leads; a cinematic sequence moves through ocean life → living land → people. Reuse only the controlled image registry. Earthrise is registered NASA public-domain imagery; remaining frames reuse the existing 4PLANET-controlled library.
**MAGAZINE ABOUT:** /magazine/about may route readers to this story as the wider “why 4PLANET exists” narrative without turning Magazine About into a second canon.
**4PLANET.ORG:** this release does not rewrite /about/story. The same narrative core may later be expressed there at shorter institutional depth; one story, two depths, never two competing truths.

**TRUTH BOUNDARY:** this is a purpose/story essay, not evidence that 4PLANET has already achieved ecological outcomes. “Did it actually help?” remains the proof question. Organisational aspiration must never be presented as verified impact.
**HUMAN SUCCESS:** a first-time reader can feel why the mission matters, explain the core gap in one sentence, understand 4PLANET’s role without product jargon, and see a credible place for themselves.
**MAKER ≠ JUDGE:** Factory produces the candidate; independent Gold/browser proof judges the exact HEIR. Founder has authorised Magazine publication, but release occurs only after the bounded candidate passes required gates.
**ROLLBACK:** revert the bounded Magazine story/visual/About delta if exact-head Gold or browser proof finds a material regression.

# ATLAS OBIS SHAREALIKE + DATASET CITATION CORRECTION — 10 OCT 2026

**STATUS:** RETURNED QA_CORRECT CONSUMED / EXISTING HEIR MAKER CORRECTION / INDEPENDENT GOLD PENDING / NO LIVE RELEASE.
**USER ARRIVES BECAUSE:** a person opens an OBIS-backed WH4LES point and needs lawful reuse status plus the original dataset citation, not only the aggregator name.
**ONE THING TO UNDERSTAND:** CC BY-SA carries an additional ShareAlike obligation and must not collapse into the same public-display class as plain CC BY.
**PRIMARY ACTION:** classify ShareAlike as review-required for this public surface, preserve supplied dataset citation/DOI/landing URL, and render that evidence on the point.
**SECONDARY DEPTH:** keep CC0 and plain CC BY available; keep NC and ND blocked; keep record-level OBIS provenance and truth limits.
**ACCEPTANCE:** executable fixtures cover CC0, CC BY, CC BY-SA and CC BY-NC-SA plus citation/DOI/URL preservation; ATLAS source contract consumes the added fields.
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
