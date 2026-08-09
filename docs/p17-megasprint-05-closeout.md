# P17 Megasprint 05 — Planetary Knowledge Institutions, Data Infrastructure & Source Graph

## Controlled status

**PRIVATE FOUNDER-REVIEW CANDIDATE / STACKED BRANCH / NO MERGE / NO PUBLIC RELEASE**

This closeout records the verified implementation boundary for P17 Megasprint 05. It does not authorise merge, production deployment, search indexing, institution contact, data partnership requests, fact-check distribution, production ingestion, scheduled collection, payment, partner activation or Impact Unit creation.

## Repository control

- Repository: `odinskogen-dev/4Planet.05`
- Base branch: `build/p17-organisations-discovery-scale-gate-final`
- Base SHA: `ed04832e8520bc45b0dd65a84d0ea05b30387664`
- Working branch: `build/p17-knowledge-institutions-source-graph`
- Previous controlled P17 product state: Megasprint 04 frozen review candidate.
- Final candidate SHA: the branch head containing this closeout file, subject to the exact-SHA MS05 GitHub Actions gate.
- Protected: `main`, PR #9, PR #20 and PR #21 remain outside the MS05 merge boundary.

An accidental one-line placeholder file was created during interrupted recovery and immediately deleted before implementation. The create/delete history is retained in Git rather than hidden. No placeholder content remains in the product.

## Truth correction

The Drive control record contained a premature 7 August closeout that claimed finished code and green exact-SHA evidence before the repository supported those claims. On 9 August this was explicitly superseded in the control record. The historical discrepancy is retained as an audit trail; it was not silently rewritten.

## Completion dashboard

Canonical Drive register: `P17_ MEGASPRINT 05 — PLANETARY KNOWLEDGE, DATASET & SOURCE GRAPH REGISTER v1.0`.

Verified register coverage:

- 151 unique knowledge institutions — target >=120: PASS
- 260 datasets, programmes or public data services — target >=180: PASS
- Priority 40 — exact count: PASS
- Deep 20 dossiers — exact count: PASS
- First 12 knowledge profiles — exact count: PASS
- 454 Source Graph nodes in canonical research register
- 823 source-bearing Source Graph relationships in canonical research register
- 15-source integration queue — exact count: PASS
- 256 unique source URLs registered
- Two bounded source/connector proofs — OBIS occurrence and WoRMS taxon matching

The counts establish research coverage, not universal production-integration readiness. Dataset-level licence, access, freshness, sensitivity and methodological conditions remain explicit and can be `UNRESOLVED`, `REQUIRES_LEGAL_REVIEW` or `REQUIRES_TECHNICAL_TEST` without being treated as confirmed.

## Canonical identity result

P17 keeps organisation/institution identity separate from programmes, platforms, datasets, APIs, source records, observations, model outputs and assessments.

The first twelve knowledge profiles are:

1. Global Biodiversity Information Facility
2. International Union for Conservation of Nature
3. Ocean Biodiversity Information System
4. Catalogue of Life
5. World Register of Marine Species
6. NASA Earth Science Data Systems
7. Copernicus Data Space Ecosystem
8. NOAA National Centers for Environmental Information
9. Intergovernmental Science-Policy Platform on Biodiversity and Ecosystem Services
10. Global Forest Watch
11. MapBiomas
12. Artsdatabanken

GBIF and IUCN are enrichments of existing canonical P17 actor identities, not duplicate actors:

- GBIF research alias `PKI-001` -> `actor:p17:P17-A003`
- IUCN research alias `PKI-002` -> `actor:p17:P17-A001`

The pre-production truncated IPBES route is redirected to canonical `/actors/ipbes`.

## Planetary Source Graph

Implemented typed graph entities:

- Actor
- Institution
- Network
- Programme
- Platform
- Dataset
- Data Product
- API
- Source
- Source Record
- Observation
- Model Output
- Assessment
- Claim
- Evidence
- Method
- Geography
- Taxon
- Ecosystem
- Issue
- Solution
- Mission
- Product Surface

Implemented relationship vocabulary includes `OPERATES`, `MAINTAINS`, `PUBLISHES`, `FUNDS`, `HOSTS`, `PRODUCES`, `DISTRIBUTED_THROUGH`, `DERIVED_FROM`, `CONTAINS`, `SUPPORTS`, `REPRESENTS`, `INTERPRETS`, `COVERS_GEOGRAPHY`, `COVERS_TIME`, `CONCERNS`, `HAS_LICENCE`, `HAS_SENSITIVITY_RULE`, `HAS_FRESHNESS_STATE`, `USES_METHOD`, `USED_BY_4PLANET`, `SUPERSEDES`, `DEPRECATED_BY`, `MEMBER_OF` and `PART_OF`.

Graph edges can carry source, evidence state, validity interval, last-checked date, confidence, limitation, rights state, precision, review state and timestamps.

Runtime validators reject invalid typed relationships and missing provenance rather than treating entity names as interchangeable.

## Semantic hard stops

The implementation and contract tests preserve these boundaries:

- institution != dataset
- dataset != API
- API != original source
- source != source record
- observation != signal
- observation != model output
- model output != direct observation
- assessment != raw data
- claim != evidence
- headquarters != dataset coverage
- dataset coverage != actor operating geography
- record presence != abundance
- no record != confirmed absence
- near-real-time != live
- historic != current
- open access != unrestricted commercial use
- attribution != partnership
- dataset use != institutional endorsement
- institutional authority != claim-level evidence
- modelled coverage != measured coverage
- public data != proof of 4PLANET impact

## ORGANISATIONS_ product delivery

P17 remains inside the existing `ORGANISATIONS_` public information architecture.

Implemented:

- expanded `/actors` discovery with field organisations and knowledge institutions in one system;
- twenty unique private-beta public profile entries after alias deduplication: ten pre-existing flagship actors plus ten additional knowledge institutions, while GBIF and IUCN are enriched rather than duplicated;
- data-driven knowledge collections for planetary data/research, biodiversity knowledge, ocean data, Earth observation, taxonomy and public data infrastructure;
- URL-persistent filters for actor type, mission, knowledge domain, geography, method, ecosystem, issue, solution, API state, licence state and freshness state;
- no universal ranking or public score;
- one canonical `/actors/:slug` route;
- shared Knowledge Profile Template v2.1;
- fallback to the existing Megasprint 04 profile template for profiles not in the first twelve knowledge set;
- no new public product, app, globe, frontend shell or truth system.

## Knowledge Profile Template v2.1

The shared knowledge profile surface can present:

- identity and why the infrastructure matters;
- programmes and systems;
- datasets and products;
- methods;
- geographic/temporal coverage;
- access and machine-access state;
- licence and permitted-use boundary;
- freshness;
- limitations;
- sensitive-data handling;
- use across 4PLANET;
- relevant missions;
- source register and last review;
- institution/programme/dataset/access/product relationship visualisation;
- independent-profile/no-partnership explanation;
- existing fail-closed claim/correction contract;
- relevant Atlas context.

Private-beta metadata remains `noindex,nofollow`.

## Connector proofs

Two fixture-first/on-demand-only proofs are implemented through typed response boundaries:

### OBIS occurrence proof

- treats returned rows as occurrence/source records, never abundance, complete range, confirmed absence or live tracking;
- carries institution/dataset/documentation, licence and attribution boundaries;
- validates response shape;
- handles unavailable, invalid and rate-limited states;
- returns no fabricated fallback data;
- has no scheduler or production ingestion.

### WoRMS taxon-match proof

- treats matches as taxonomic identity, not occurrences, distribution, abundance or conservation status;
- carries institution/dataset/documentation, terms and citation boundaries;
- validates response shape;
- handles unavailable, invalid and rate-limited states;
- returns no fabricated fallback data;
- has no scheduler or production ingestion.

No live credentialed production connector, ingestion job or scheduled collection was activated.

## Claim/correction security boundary

The existing actor review contract remains fail-closed when no authorised endpoint is configured. MS05 corrected its TypeScript input type so UI booleans can be validated at runtime; both consent and privacy acknowledgement are still mandatory before submission.

The knowledge-profile surface cannot:

- mutate a profile automatically;
- approve a claim;
- create verification;
- create partnership;
- expose a public review queue;
- persist sensitive request data in browser storage when the endpoint is closed.

## Testing and CI

MS05 adds `scripts/p17-ms05-contracts.test.mjs`, all-twelve-route browser coverage and a dedicated workflow `.github/workflows/p17-ms05-knowledge-gate.yml`.

The gate runs:

- `npm ci`
- TypeScript typecheck
- production build
- MS05 graph/connector contracts
- full existing contract + smoke regression
- lint
- asset verification
- dependency audit with critical-vulnerability gate
- Chromium installation
- private preview runtime
- Organisations/knowledge Playwright journeys
- stable desktop/mobile visual evidence
- exact candidate SHA capture
- changed-file evidence artifact

Initial CI run `31285585916` failed typecheck because the new UI supplied runtime booleans to a literal-`true` review input type. The cause was fixed without weakening the runtime consent gate. The later full pre-closeout candidate run `31285695577` passed every step on SHA `6376fb02d6a0b2240e16e7b9f7b06b5b7f78fa36`.

The final closeout candidate must also pass the same workflow after this file is committed; that later exact-SHA run is the authoritative final CI evidence.

## Audit result

### Identity and architecture — PASS for private founder review

- GBIF and IUCN are aliases/enrichments, not duplicated actor identities.
- Institution/programme/platform/dataset/API distinctions are typed and tested.
- One ORGANISATIONS_ system and one canonical route remain.
- Existing Atlas Actor Mode remains the spatial system; no new map or globe was created.
- No database migration is required for this bounded MS05 source-graph proof.

### Truth and semantics — PASS for private founder review

- semantic hard stops are executable contracts, not disclaimer-only prose;
- material first-twelve profile descriptions expose official source URLs and explicit limitations;
- dataset use never becomes partnership, verification or Impact proof;
- unresolved production-integration details remain unresolved rather than inferred.

### Rights and licence — PASS for private founder review / BLOCKED for production integration where unresolved

- no institution logos, screenshots or third-party photography were added;
- licence/access states remain explicit;
- first-fifteen item-level legal review remains a production-connector gate and is not falsely marked complete.

### Freshness and availability — PASS for private founder review / monitoring required

- knowledge profiles expose reviewed/freshness state;
- changing API availability remains a monitored integration concern;
- fixture-first proofs do not claim live production reliability.

### Security — PASS for private founder review

- connector proofs are on-demand only with no scheduled production ingestion;
- connector errors fail closed;
- claim/correction remains fail-closed without an authorised secure endpoint;
- no credentials or secrets were added.

### Representation — OBSERVATION OPEN, not hidden

- the longlist is global, but Western and English-language data infrastructures remain overrepresented in the first implementation;
- Indigenous/local knowledge is not activated as a generic ingestible data category;
- external activation of Indigenous/local knowledge remains blocked pending authority, consent, representation and CARE-aware design;
- future regional deepening should strengthen Africa, Asia, Latin America/Caribbean, Oceania and Indigenous/local knowledge without treating representation as a quota substitute for source authority.

### Accessibility, mobile and regression — subject to final exact-SHA browser gate

The pre-closeout candidate passed browser journeys covering homepage discovery, filters, legacy actor profiles, twelve knowledge profiles, canonical metadata, noindex, claim/correction, mobile evidence and existing Atlas Actor Mode. The final exact-SHA run remains authoritative after this closeout commit.

## Open gates after private review

These do not invalidate the private founder-review candidate, but they block broader activation where applicable:

1. Founder editorial/visual acceptance of Profile Template v2.1 and knowledge collections.
2. Item-level licence and permitted-use review for production integrations, especially the first-fifteen queue.
3. Live endpoint/rate-limit validation before any production connector is enabled.
4. Consent-, authority- and CARE-aware architecture before any Indigenous/local knowledge external activation.
5. Institution fact-check/outreach requires separate founder authority.
6. Merge, public deployment and indexing require separate founder release.

## Rollback

MS05 is isolated on `build/p17-knowledge-institutions-source-graph`, stacked on the frozen Megasprint 04 review candidate. Rollback is closing or abandoning the MS05 draft PR; no merge is required to preserve the previous candidate.

## Release confirmation

No merge occurred.
No public deployment occurred.
No indexing was activated.
No institution was contacted.
No API partnership request was sent.
No data agreement was entered.
No fact-check preview was distributed.
No production ingestion or scheduled collection was activated.
No partner status was activated.
No payment was accepted.
No Impact Unit was created.

## Classification rule

The branch may be classified **READY FOR FOUNDER PRIVATE REVIEW** only if the exact branch head containing this closeout passes the complete MS05 CI/browser gate and canonical Drive/Wiki readback records the same final SHA, PR and evidence state. Until then, this document is a closeout candidate rather than release authority.
