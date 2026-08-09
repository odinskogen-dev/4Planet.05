# 4PLANET_ OSLOFJORDEN — Spatial Truth, Broad Local LIFE, Watch & Human Release Evidence

Status: INTERNAL CANDIDATE / NO PUBLIC RELEASE / NO MAIN MERGE
Date: 2026-08-09
Authority: Project Lead × Product × BRAIN × Data × UX × Validation

This document records what the sprint actually implemented, what automated/browser QA can prove, what it cannot prove, and what remains blocked by external evidence or release authority.

## 1. Spatial truth

The candidate now separates these product roles:

- SEMANTIC_IDENTITY
- DISPLAY
- BIODIVERSITY_QUERY
- SCIENTIFIC_AREA
- WATERBODY_STATUS
- REGULATORY
- ADMINISTRATIVE

MRGID 3379 remains the persistent semantic identity for Oslofjorden. It is not promoted to a universal polygon.

The first admitted source-specific spatial jobs are:

- Vann-Nett WaterBodyID `0101020601-C` as a runtime WATERBODY_STATUS area.
- Vannmiljø `WaterBodyIDFilter` for `0101020601-C` as a runtime BIODIVERSITY_QUERY contract.
- The Inner Oslofjorden Phytoplankton Database published extent as SCIENTIFIC_AREA only.
- Fisheries-regulation geography as REGULATORY source-available/not-ingested.
- DISPLAY and ADMINISTRATIVE remain deliberately not selected.

Each new canonical geometry entry records source/source record, availability, intended use, rights state, precision/resolution where known, limitation and supersession state. A geometry admitted for one job never silently becomes another role.

## 2. Broader local LIFE

The existing bounded fish/eelgrass evidence and historical GBIF dataset records remain in place.

A new Vannmiljø runtime adapter uses the official public API's own WaterBodyID relationship rather than a 4PLANET point-in-polygon inference. It preserves, where returned:

- source registration ID and location ID;
- scientific name;
- parameter/medium/activity/method context;
- sample date, registration date and last-edit date;
- source-linked location and WGS84 coordinates;
- measurement/depth fields;
- source ID;
- rights-review state;
- explicit normalisation/quality issue flags.

Truth boundaries remain explicit:

`REGISTRATION / OBSERVATION ≠ CURRENT POSITION`

`RETURNED COUNT ≠ ABUNDANCE`

`OCCURRENCE ≠ TREND`

`SOURCE UNAVAILABLE ≠ NO LOCAL LIFE`

The browser UI exposes source failure as a source state rather than converting it to zero records.

## 3. ATLAS + SPECIES reuse

The same source-aware Oslofjorden context is now bridged into existing ATLAS and SPECIES routes without rewriting either engine.

ATLAS can expose the waterbody-status role while retaining the Marine Regions representative point/camera context. SPECIES can expose the Vannmiljø source query context. Both point back to the same semantic Place identity and make the source-specific role visible.

This is an integration proof, not a claim that every global ATLAS/SPECIES path has already migrated to the new Place model.

## 4. Follow → source change → return

Local Follow already persisted on-device. The sprint adds a deterministic local source-snapshot contract:

- first source check = BASELINE_ESTABLISHED;
- same response = NO_CHANGE;
- changed response = SOURCE_CHANGED;
- changed records are classified as ADDED / UPDATED / REMOVED_FROM_SOURCE_RESPONSE;
- local storage failure is explicit.

A first check never manufactures an alert. `REMOVED_FROM_SOURCE_RESPONSE` does not mean the underlying source deleted a record. A changed limited response is not automatically an ecological change.

This proves the product mechanism for source comparison and Return Objects. It does **not** yet prove push/email notification delivery, account sync, or that a genuine later source edit has already occurred during this sprint.

## 5. Media custody

The current Oslofjord hero is a real CC0 photograph by Leonhard Lenz from Wikimedia Commons, photographed 2022-08-17. The source record now stores the Wikimedia source-file SHA-1, source byte size, source dimensions, source page, licence and explicit evidence limitation.

Binary custody is still `REMOTE_SOURCE_RUNTIME`. A repo-controlled derivative is a pre-public-release task because the active tooling did not provide a trustworthy binary-transfer path. The code therefore does not falsely label the image as locally controlled.

No clearly owned, rights-clean Odin/4PLANET Oslofjord documentary hero was confirmed in the media search available to this sprint. Generated imagery remains prohibited as factual documentary evidence.

## 6. Human release evidence

Human validation status: **NOT RUN**.

The existing participant test remains local-only. A new local review route can:

- import real participant JSON exports;
- deduplicate participant IDs;
- preserve raw answers;
- score comprehension, product jobs, source/proof boundary, return value and distinctiveness separately;
- keep reviewer notes;
- export a synthesis JSON.

No participant is fabricated and no automated/browser/founder result is relabelled as human evidence. Actual directional testing still requires an authorised real participant workflow.

## 7. Red-team findings

### Repaired in this sprint

1. **One polygon becoming "Oslofjorden"** — repaired with explicit spatial roles and source-specific use contracts.
2. **Scientific dataset extent being mistaken for place geometry** — scientific extent remains a separate role.
3. **National Vannmiljø availability being presented as local LIFE** — direct official WaterBodyID source query is now distinct from national dataset context.
4. **ATLAS and SPECIES drifting into separate place semantics** — shared Place context bridge added.
5. **Follow without a return mechanism** — deterministic source snapshot/change contract added.
6. **First source check becoming a fake alert** — first check can only establish baseline.
7. **Source failure becoming "no records/no life"** — explicit source-unavailable path preserved.
8. **Human test readiness without synthesis** — local import/scoring/synthesis workflow added.
9. **Remote hero being described as locally controlled** — custody state and checksum now explicit.
10. **Old QA contracts blocking a truthful new spatial state** — stale assertions were replaced by semantic role/truth assertions rather than weakening the truth boundary.

### Still open before any public release

1. **Actual human evidence** — NOT RUN; real participants are required.
2. **Actual later source-change evidence** — Watch/change mechanism exists, but a genuine later Vannmiljø source change has not yet been observed and recorded as sprint evidence.
3. **Notification delivery** — no push/email/account sync is built or claimed.
4. **Display geometry** — deliberately NOT SELECTED. The waterbody-status polygon must not silently fill this role.
5. **Regulatory geometry ingestion/rights** — source available; not ingested or redistribution-cleared.
6. **Media binary custody** — rights/source checksum controlled; local derivative still outstanding.
7. **Source terms** — Vannmiljø/Vann-Nett runtime access is public-service access; caching/redistribution rights are not broadened by 4PLANET and must be reviewed before durable redistribution.
8. **Limited-response Watch stability** — a bounded API response can change because of source ordering/window behaviour. Return Objects must remain labelled source-response changes unless the underlying record change is independently established.
9. **Dependency security audit** — current `npm ci` reports 5 known dependency vulnerabilities (3 moderate, 2 high). The present gate does not classify runtime reachability. Public release must remain closed until the advisories are inspected and safely remediated or explicitly risk-accepted.
10. **Bundle size** — production build reports chunks above 500 kB. This is not a truth failure, but it is a performance/release-readiness item.

## 8. Evidence classes

- STATIC CONTRACT TEST = architecture/truth invariant proof.
- TYPECHECK/BUILD/LINT = implementation integrity proof.
- BROWSER TEST = rendered product-behaviour proof in the tested environment.
- LIVE SOURCE RESPONSE = source-delivery evidence at check time only.
- HUMAN PARTICIPANT FINDING = only a result from a real participant workflow.
- FOUNDER JUDGEMENT = founder decision, not human-study evidence.

No class may be silently promoted to another.

## 9. Release gate

The candidate remains draft/open/unmerged. A green final gate on the exact final branch head is required before calling the implementation candidate QA-proven.

Even with a green automated/browser gate, public release remains closed until at minimum:

- actual human validation is run or explicitly waived by founder under a controlled release rationale;
- dependency advisories are classified;
- media custody/source terms needed for public use are closed;
- any required external-data reliability/rights issues are closed;
- founder gives explicit integration/public-release authority.
