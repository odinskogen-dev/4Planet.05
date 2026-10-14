# 4PLANET IMPACT — LIVING ACTION NETWORK
## MASTER BUILD BRIEF FOR CLAUDE / PRODUCT ENGINEERING
### 14 OCTOBER 2026

STATUS: FOUNDER-APPROVED STRATEGIC DIRECTION / CANONICAL TEST CANDIDATE EXISTS / EXACT TEST-DOMAIN IMPACT PROOF PASSED ON king/test@fd74b6e57711836d5084fc5dcb5800a890ba2887 / NO PRODUCTION RELEASE IMPLIED BY THIS DOCUMENT.

AUTHORITY:
- ODIN ODDEKALV — Founder intent, brand judgement and reserved release decisions.
- GPT / AXE — programme control, architecture, NATUREBRAIN/data truth, source/rights boundaries, research/ingest, Gold population and audit.
- CLAUDE — Product Engineering Lead for the premium IMPACT web platform and reusable page/template system.
- Independent Gold/Judge — must remain separate from Maker.

This brief is intended to let Claude build without losing the reasoning behind the product.

---

# 1. THE FOUNDER EUREKA

4PLANET IMPACT should not begin as a small donation catalogue, a handful of commercial impact units or a partner-by-partner sales surface.

The strategic opportunity is much larger:

Build a global living action network that helps people discover the real ecological problems that need solving, the strongest projects and actors working on them, the solutions being used or developed, the places where action happens, the evidence behind claims, ways to participate, and eventually the capital required to scale what works.

The product should behave, in one narrow sense, like a high-end editorial authority: not by changing 4PLANET into “Vogue for nature”, but by earning enough trust, taste and evidence discipline that being included, reviewed or featured by 4PLANET is valuable.

Core idea:
- many legitimate actors/projects may have public profiles;
- stronger projects can progress through explicit review states;
- selected work may receive a premium editorial Magazine treatment;
- inclusion is not purchased endorsement;
- evidence and relationship states remain explicit;
- the system becomes useful both to the public and to projects, NGOs, innovators, researchers, funders, partners and institutions.

The first global scale objective is to build a trusted, premium discovery layer for the best-supported ecological action in the world, beginning with a controlled Gold set and then scaling systematically.

“Best” must never mean an unsupported subjective ranking. It means projects that survive a published, source-aware selection/review method and are strong candidates for discovery based on relevance, evidence, delivery maturity, authority and transparency.

---

# 2. WHY THIS CAN BECOME A LARGE 4PLANET ASSET

This direction compounds several kinds of value at once.

## Public value
A person can move from:
WHAT IS WRONG?
→ WHERE?
→ WHO IS DOING SOMETHING?
→ WHAT ARE THEY DOING?
→ WHAT EVIDENCE EXISTS?
→ HOW CAN I HELP?

The product becomes useful even to someone who has never heard of 4PLANET.

## Ecological leverage
4PLANET does not need to physically execute every intervention to have ecological effect.

If the platform becomes excellent at:
- finding credible action;
- making it understandable;
- routing attention;
- connecting relevant people;
- exposing evidence;
- surfacing promising solutions;
- routing capital and resources;

then 4PLANET can increase the probability that capable actors, projects and solutions receive support.

That effect must remain separate from claims that 4PLANET itself caused or verified an ecological outcome.

## Distribution
Every high-quality Issue, Project, Actor, Place and Solution profile can become a useful search and AI-discovery object.

Instead of one homepage trying to rank for everything, 4PLANET can own thousands of high-intent, source-rich knowledge/action pages that answer real questions.

Examples of user intent:
- coral restoration projects Florida
- organisations restoring mangroves Madagascar
- rewilding projects Europe
- ocean plastic cleanup projects
- wetland restoration organisations
- agroforestry restoration Africa
- best documented coral restoration projects
- organisations working on [ecological issue]
- solutions for [problem]
- projects in [place]

Search traffic is not ecological impact and must not be reported as such. But discovery can create users, relationships, action and capital.

## Brand authority
If 4PLANET combines:
- scientific/source discipline;
- strong editorial judgement;
- premium design;
- excellent profiles;
- transparency about unknowns;
- no pay-to-rank;

then the inclusion/review layer can become a meaningful reputational asset.

## Data / graph moat
Every researched project strengthens a shared graph:
Issue ↔ Place ↔ Actor ↔ Project ↔ Solution ↔ Evidence ↔ Action ↔ Capital.

The same work can later feed:
IMPACT, ATLAS, Magazine, SOLUTIONS, ACTORS, CAPITAL, missions, partner/funder intelligence and other 4PLANET products.

Do the research once. Reuse it across controlled surfaces.

## Economic value
Potential future value channels include:
- sponsorship/founding support for the public-good infrastructure;
- premium institutional intelligence;
- project/funder matching;
- verified partner/funder enquiries;
- capital routing infrastructure;
- data/API/licensing where legally and strategically appropriate;
- later carefully controlled transactions/action pathways;
- mission-specific funding;
- distribution partnerships;
- editorial and research products.

No commercial relationship may purchase evidence status, editorial conclusions, rankings or ecological claims.

---

# 3. THE CORE PRODUCT MODEL

The canonical graph direction is:

ISSUE
→ PLACE
→ ACTOR
→ PROJECT
→ SOLUTION
→ EVIDENCE
→ ACTION
→ CAPITAL
→ DELIVERY
→ OUTCOME
→ LEARNING

This is a graph, not a linear database schema and not a set of separate microsites.

The public interface may expose only the relevant parts of the graph at each stage.

Important relationships may include:
- project ADDRESSES issue;
- project OCCURS_IN place;
- actor LEADS / DELIVERS / SUPPORTS project;
- project USES solution;
- claim SUPPORTED_BY evidence/source;
- project OFFERS external action;
- project NEEDS capital;
- funder CAN_FUND / HAS_FUNDED / FITS project, with explicit relationship status;
- contribution RELATES_TO project;
- delivery RELATES_TO project;
- outcome RELATES_TO delivery/project;
- learning UPDATES solution/project/evidence state.

Do not imply causation merely because two objects are connected.

---

# 4. ONE SHARED GRAPH / NO NEW BRAIN

Do not create:
- a new IMPACT database;
- Neo4j merely because this is a graph;
- a new Actor database;
- a separate Project truth store;
- a second Atlas/map;
- a CMS that becomes canonical truth;
- a parallel “Claude Impact API”.

Reuse the existing NATUREBRAIN / PLANETBRAIN technical model and current 4PLANET repository.

Existing relevant NATUREBRAIN primitives already include:
- entities;
- relationships;
- sources;
- datasets;
- source_records;
- claims;
- evidence;
- claim_evidence;
- actors;
- solutions;
- PostGIS/spatial infrastructure;
- controlled public read projections.

Current first IMPACT projection:
public.impact_lan_gold_v01()

Current runtime client:
src/impact/livingActionNetworkClient.ts

Current product surface:
src/pages/integrated/ImpactLivingActionNetwork.tsx

Current styling:
src/styles/impact-living-action-network.css

Current reproducible migration:
supabase/migrations/20261013205121_impact_living_action_network_gold_v01.sql

Current Gold browser proof:
tests/e2e/impact-lan-gold.spec.ts

The first graph-backed objects already prove:
PROJECT → ISSUE
PROJECT → PLACE
PROJECT → ACTOR
PROJECT → SOLUTION
PROJECT → ACTION
PROJECT → CLAIM → EVIDENCE → SOURCE.

Do not rebuild them as static cards.

---

# 5. EXISTING GOLD SLICE — PRESERVE, IMPROVE, DO NOT RESTART

The existing first source-grounded project objects are:

1. Restoring the Northern Mozambique Channel
External review context: UN World Restoration Flagship.

2. African Farmers Transforming Food Systems
Lead actor: Trees for the Future.
External review context: UN World Restoration Flagship.

3. Florida Keys Coral Restoration
Actor: Coral Restoration Foundation.
State: source-checked public project record.

4. Great Pacific Garbage Patch Cleanup
Actor: The Ocean Cleanup.
State: source-checked public operations record.

These objects are seed data and architecture proof, not the final editorial selection or global corpus.

The first platform has already demonstrated:
- NATUREBRAIN-backed read;
- public collection;
- issue filtering;
- search;
- Project Profile;
- Actor Profile;
- source/evidence display;
- external action route;
- Atlas context;
- SEO/structured-data routes;
- canonical project/actor URLs;
- mobile two-column browse;
- exact test-domain browser proof.

Do not restart this work because the design will be substantially refined.

---

# 6. STRATEGIC CONTENT SCALE — GOLD 20 → GLOBAL NETWORK

Do not publish thousands of thin pages first.

Scale in this order:

## Gold 20
Build approximately twenty exceptional, source-rich project records across different ecological domains, geographies, project types and evidence structures.

Purpose:
- stress-test the schema;
- stress-test the templates;
- establish quality standard;
- expose missing fields;
- prove search/indexing;
- prove mobile;
- learn what users click;
- learn what actors value;
- establish review methodology.

Gold 20 should deliberately include variation:
- forest restoration;
- coral/ocean restoration;
- wetlands/freshwater;
- species/habitat recovery;
- regenerative agriculture;
- pollution/plastic;
- ecosystem protection;
- restoration science;
- community-led projects;
- technology-enabled ecological work.

## Issue expansion
Use the existing canonical 4PLANET global environmental problem map — approximately 63 linked challenge/problem areas — as a major seed for Issue coverage.

Do not reconstruct this map from memory inside Claude code. Reuse the existing BRAIN/NATUREBRAIN issue/problem canon and stable IDs.

For every major ecological Issue:
- identify authoritative sources;
- identify multiple high-quality project candidates;
- identify capable Actors;
- connect relevant Places;
- connect Solutions;
- identify evidence gaps;
- publish only when the public record satisfies the admission gate.

Aim eventually for multiple high-quality projects per problem, not one “winner”.

## Global scale
Once Gold templates and ingest are proven, scale from 20 → 100 → 500 → 1,000+ useful entity pages.

Scale comes from repeatable research + graph ingest + templates, not manually designed microsites.

---

# 7. NEXT UNIVERSE AFTER PROJECTS: SOLUTIONS

If Project/Actor discovery works, expand the same graph to SOLUTIONS.

This is especially important because many ecological problems originate in human value chains.

Connect:
S4PIENS / human system or value-chain pressure
→ ecological Issue
→ Solution / innovation
→ Actor / startup / institution
→ Project / deployment
→ evidence
→ place applicability
→ economics / market context
→ capital need
→ measured outcomes where available.

Examples of Solution classes may include:
- restoration methods;
- material substitution;
- circularity;
- pollution prevention;
- agricultural practices;
- energy/system technologies;
- monitoring/MRV;
- biodiversity technology;
- water systems;
- logistics/value-chain innovations.

Do not turn SOLUTIONS into a hype/startup database.

A solution listing, provider claim, 4PLANET assessment, maturity state and verified outcome are different things.

---

# 8. CAPITAL LAYER — LATER, BUT DESIGN THE INFORMATION ARCHITECTURE NOW

The product should be structurally ready for:

PROJECT / SOLUTION
→ CAPITAL NEED
→ CAPITAL TYPE
→ FUNDER / INVESTOR / FOUNDATION / COMPANY / PUBLIC PROGRAMME
→ FIT
→ STATUS
→ RESOURCE ROUTE
→ AGREEMENT
→ DELIVERY
→ PROOF.

Capital types may include:
- grants;
- philanthropy;
- sponsorship;
- public funding;
- customer/contract revenue;
- strategic partnerships;
- project/action capital;
- in-kind resources;
- selectively equity/venture capital where appropriate.

Critical truth boundaries:
- a funder profile does not mean they fund a project;
- “fit” is not a commitment;
- application is not money;
- awarded capital is not ecological outcome;
- restricted pass-through/project capital is not automatically 4PLANET revenue.

The public version of CAPITAL may begin as discovery/matching intelligence, not transactions.

---

# 9. THE REVIEW / TRUST MODEL IS A CORE MOAT

Never use one generic green “verified” badge.

Keep separate states.

Recommended public semantics:

DISCOVERED
A credible public record establishes that the entity/project exists.

SOURCE-CHECKED
Identity, activity, geography and selected claims have been checked against named sources.

EXTERNALLY VETTED
A named external institution has applied a defined review/selection process.

4PLANET REVIEWED
Reserved until 4PLANET publishes and actually applies a defined review method.

PARTNER
Only when a real current agreement exists.

CONTRIBUTION RECORDED
A real contribution exists in the system.

DELIVERY REPORTED
A provider/actor reports delivery.

EVIDENCE RECEIVED
Evidence exists for the delivery/claim.

OUTCOME REPORTED
A result is reported.

OUTCOME EVIDENCED / VERIFIED
Only when the exact ecological outcome has defensible evidence and the verification level is explicit.

Always preserve:
LISTING ≠ ENDORSEMENT.
ACTOR EXISTENCE ≠ PARTNERSHIP.
PAYMENT ≠ DELIVERY.
DELIVERY ≠ OUTCOME.
OUTCOME ≠ SYSTEM-LEVEL IMPACT.
SOURCE-REPORTED ≠ INDEPENDENTLY VERIFIED.
EXTERNAL AWARD / FLAGSHIP ≠ 4PLANET VERIFICATION.

This trust architecture should be understandable without turning the interface into compliance software.

---

# 10. SOURCE + RIGHTS FACTORY

Every published entity must know:
- source authority;
- canonical source URL;
- source record ID where available;
- retrieved date;
- relevant event/publication date;
- rights/licence posture;
- attribution requirement;
- source-reported vs 4PLANET interpretation;
- limitations;
- confidence/review state;
- media rights.

Never assume the right to republish:
- photos;
- logos;
- editorial copy;
- reports;
- maps;
- video.

Use original 4PLANET synthesis.

Third-party media enters only where rights/permission are recorded.

If no project-specific licensed media exists, use a clearly labelled 4PLANET issue/place visual rather than pretending it is project evidence.

---

# 11. WEB UNIVERSE CLAUDE SHOULD BUILD

Claude’s immediate job is the reusable premium platform, not mass research.

Build the system so AXE can populate hundreds/thousands of entities without redesign.

## A. /impact — global discovery home
Must communicate quickly:
- what IMPACT is;
- what the user can discover;
- that projects/actors/solutions are source-aware;
- where evidence lives;
- how to explore.

Primary behaviour:
browse first, not dashboard first.

Support:
- issue families;
- project discovery;
- search;
- place/geography;
- actor discovery;
- later Solution and Capital lenses;
- Atlas entry;
- editorial/featured collections;
- clear current review methodology.

High information density is desired, especially on mobile, without becoming a database table.

## B. Issue template
Canonical route pattern should be stable and SEO-friendly.

An Issue page should answer:
- What is the problem?
- Why does it matter?
- Where is it material?
- What authoritative evidence establishes it?
- Which projects are working on it?
- Which actors are active?
- Which solutions exist?
- What is known vs uncertain?
- What places are relevant?
- What can a person do next?
- What related Magazine stories exist?

Issue page must be useful without a 4PLANET sales pitch.

## C. Project template — flagship object
This should be one of the finest project-profile templates on the web.

A Project Profile should support progressive sections such as:

1. Hero / identity
- Project name
- one-sentence explanation
- project-specific media only if rights are clear
- place
- current state
- actor(s)
- review state

2. At a glance
- problem addressed
- place/geography
- lead actor
- project type
- operating period/current status
- solution/method
- action route

3. Why this exists
- issue context
- ecological/human context

4. What the project does
- intervention/method
- delivery model
- scale reported by source
- target/ambition clearly separated from actual delivery

5. Evidence
- claims
- evidence strength
- sources
- limitations
- what is source-reported
- what has external review
- what is not established

6. Place
- Atlas embed
- map context
- geography limitations
- related living systems/species where supported

7. Actor(s)
- lead organisation(s)
- role
- link to Actor Profile

8. Solution
- method/technology/practice
- link to reusable Solution object

9. Outcomes
- only where sourced
- delivery/outcome/verification separated

10. Action
- external official route;
- follow/save/interest where existing 4PLANET infrastructure truthfully supports it;
- no fake 4PLANET transaction.

11. Sources / update log
- originals;
- retrieved/updated date;
- corrections/history if needed.

12. Related
- related projects;
- same Issue;
- same Place;
- same Solution;
- Magazine;
- ATLAS.

## D. Actor template
Actor profiles should be first-class entities, not an appendix to projects.

Show:
WHO
WHAT
WHERE
PROJECTS
SOLUTIONS / CAPABILITIES
EVIDENCE / SOURCES
RELATIONSHIP STATE
CURRENT / LAST UPDATED
ACT / OFFICIAL ROUTE.

Actor types include:
- NGO;
- research institution;
- company;
- public institution;
- foundation;
- funder;
- startup;
- project network;
- community organisation;
- standard/assurance actor.

Do not infer 4PLANET partnership from inclusion.

Actor profile should be valuable enough that organisations want to correct/complete their public record.

Future controlled capability:
“Claim / update this profile” or contact route — only after identity/permission workflow exists.

## E. Solution template — prepare component model now
Do not fully launch until Project/Actor base is strong, but build reusable component grammar for:
- problem addressed;
- mechanism;
- maturity;
- evidence;
- deployments/projects;
- actors/providers;
- applicability;
- risks/limitations;
- economics where sourced;
- capital;
- places;
- source records.

## F. Capital view — design system-ready, not necessarily public launch
A later Capital view should reuse the same Project/Solution/Actor objects instead of introducing a second taxonomy.

## G. Magazine relationship
Every sufficiently rich source pack can support:
Project record
→ premium editorial story
→ social/distribution cuts
→ Issue context
→ search/AI discovery
→ project/actor routes.

Magazine is not a duplicate content farm.

Editorial pieces must add narrative synthesis and human understanding, not repeat profile copy.

---

# 12. DESIGN DIRECTION — HARD LOCK

The current Founder correction is explicit:
Do not drift toward generic SaaS.

Do not model IMPACT after current 4MARKET, 4NATION or 4BRANDS visual language where those products are currently visually off-target.

Primary reference is:
- current accepted 4planet.org visual direction;
- strongest accepted 4SAPIEN work secondarily;
- Founder-provided compact two-column visual browse reference for mobile density.

Target character:
SNØHETTA × APPLE × NASA × NATIONAL GEOGRAPHIC
with a touch of TESLA,
inside the established 4PLANET system.

Existing product canon also describes the desired character as:
NASA × National Geographic × Apple × Patagonia × Vogue × Snøhetta × Arc’teryx × SpaceX.

Translate this into behaviour, not visual imitation.

The interface should feel:
- high-end;
- editorial;
- calm;
- intelligent;
- scientific;
- human;
- cinematic;
- alive;
- precise;
- credible;
- modern;
- distinctive.

Avoid:
- generic SaaS dashboard;
- dark admin UI;
- endless rounded cards;
- badge soup;
- KPI dashboard home;
- glassmorphism;
- gradients used as generic tech styling;
- massive one-project-per-screen browsing;
- low information density;
- generic NGO donation page;
- corporate ESG dashboard;
- startup directory look;
- “marketplace of good deeds” look;
- social feed.

Canonical type:
- Instrument Sans — display;
- DM Sans — body/UI;
- Fragment Mono — evidence/technical metadata.

Canonical default colours:
- 4PLANET blue #2E2EFF
- red #FF4D22
- Earth green #3AE86F
- white #FFFFFF
- ink #0A0A0A

Use white and black as major surfaces.
Use accents with restraint.

Photography/nature imagery should do real navigational/editorial work.

Mobile:
- preserve information density;
- two-column project browse is explicitly desirable where legible;
- avoid forcing one giant project per viewport;
- titles must remain readable;
- touch targets remain accessible;
- source/evidence details move into progressive depth.

Menu / shell:
Reuse the existing PublicShell, global menu and 4PLANET ID sign-in.
Do not build a second IMPACT header/login system.

---

# 13. SEARCH + AI DISCOVERY IS A FIRST-CLASS PRODUCT JOB

The goal is not “SEO pages”.
The goal is excellent entity pages that are intrinsically useful and therefore discoverable.

Every published Project / Actor / Issue / Solution route should have:
- one stable canonical URL;
- unique human title;
- unique meta description;
- unique original summary;
- source citations;
- last-reviewed/updated signal;
- structured data appropriate to the entity;
- semantic headings;
- accessible image alt text;
- internal graph links;
- sitemap inclusion;
- crawlable server/prerender representation;
- no auth wall for public knowledge;
- no duplicate query-index pages;
- clean canonicalisation.

Project structured data:
- Project/WebPage where supported;
- citations;
- spatialCoverage;
- organisation/actor relationships.

Actor:
- Organization;
- citations;
- project links.

Issue:
- DefinedTerm/Thing/WebPage/CollectionPage as appropriate; do not fabricate unsupported schema types.

Do not create SEO doorway pages or programmatic thin content.

Search scale should come from:
real objects
+ real evidence
+ real relationships
+ original synthesis
+ excellent internal links.

AI discovery:
Make source and entity relationships machine-readable and explicit.
The pages should be easy for retrieval systems to understand:
WHAT ENTITY?
WHAT CLAIMS?
WHAT SOURCES?
WHAT PLACE?
WHAT ACTOR?
WHAT RELATED OBJECTS?
WHAT IS UNKNOWN?

Do not hide all useful content behind client-only rendering.

---

# 14. INFORMATION DENSITY / DISCOVERY LOGIC

The Founder explicitly rejected a low-density “one giant project at a time” approach.

On collection/discovery surfaces:
- show enough projects simultaneously to scan and compare;
- use image + project title + actor + place + review state;
- keep metadata compact;
- allow search/filter without turning the page into a filter dashboard;
- browse visually first;
- use progressive detail.

Desktop may use 3–5 columns depending on content/viewport.

Mobile should preferentially retain two columns for project discovery when titles remain readable.

Dense does NOT mean cluttered.

Think:
editorial index / visual atlas / premium field guide,
not:
SaaS admin or e-commerce catalogue.

---

# 15. NAVIGATION AND IDENTITY

IMPACT belongs inside one 4PLANET universe.

Must reuse:
- current PublicShell;
- 4PLANET global menu;
- 4PLANET ID/sign-in;
- ATLAS;
- canonical entity IDs;
- product context contracts;
- analytics;
- SEO system.

Key top-level movement:
IMPACT
↔ ISSUE
↔ PROJECT
↔ ACTOR
↔ PLACE / ATLAS
↔ SOLUTION
↔ MAGAZINE
↔ GET INVOLVED / ACTION.

Preserve context where useful.

No dead-end profiles.

---

# 16. ATLAS

Every project happens somewhere.

Project and Actor pages should use existing ATLAS as the spatial view.

Do not create a second map.

Important:
- Atlas context is navigation/intelligence context;
- a point/bounding box is not automatically a project boundary;
- do not invent geometry;
- a project may span multiple places;
- geographic precision must reflect source precision.

Project → Open in ATLAS should retain the appropriate entity/place context where the existing contracts permit it.

---

# 17. ANALYTICS

Instrument product learning, not vanity.

Minimum useful events:
- impact_discovery_view;
- impact_issue_filter;
- impact_search;
- impact_project_open;
- impact_project_view;
- impact_actor_open;
- impact_actor_view;
- impact_solution_open later;
- impact_source_open;
- impact_atlas_open;
- impact_external_action;
- related_project_open;
- magazine_open;
- follow/save/interest later when genuine.

Measure:
- external landing page;
- search/AI/referral source where reliably available;
- entity views;
- depth;
- source opens;
- project→actor movement;
- project→Atlas movement;
- external action;
- return visits.

Do not call sessions impact.

---

# 18. EDITORIAL / COMMERCIAL INDEPENDENCE

This can become a major 4PLANET position only if trust is protected.

Rules:
- no pay-to-rank;
- no pay-to-verify;
- no sponsor control over evidence;
- paid relationship labelled separately;
- partnership does not alter scientific/evidence state;
- editorial selection independent from commercial relationship;
- sponsored or funded content clearly labelled if it ever exists;
- profile existence is not endorsement.

Commercial products may sit around the network, but cannot corrupt the network’s truth state.

---

# 19. CLAUDE’S IMMEDIATE BUILD SCOPE

Claude should now build the premium, reusable platform layer from fresh king/test.

DO NOT restart architecture.
DO NOT replace NATUREBRAIN.
DO NOT mass-enter projects manually in source code.
DO NOT build a new admin dashboard.
DO NOT merge unrelated product work.
DO NOT promote to production without current release authority.

Immediate deliverables:

1. IMPACT HOME V2
A materially more premium discovery-first home aligned to current 4planet.org.

2. ISSUE TEMPLATE V1
A scalable route/template using shared data contracts.

3. PROJECT TEMPLATE V2
World-class Project Profile with progressive evidence, place, actor, solution, action and sources.

4. ACTOR TEMPLATE V2
A premium organisation/institution profile that can scale to thousands of actors.

5. SOLUTION TEMPLATE SKELETON
Reusable component/data grammar, hidden or limited until data is ready.

6. DISCOVERY SYSTEM
Search + issue/place/actor/solution relationships without dashboard UI.

7. ATLAS INTEGRATION
Reuse current AtlasEmbed/context.

8. SHARED SHELL
Menu, 4PLANET ID sign-in, footer and cross-product navigation from existing shared components.

9. SEO / AI DISCOVERY
Canonical routes, structured data, sitemap/prerender integration and public crawlable content.

10. RESPONSIVE GOLD
390, 430, 768, 1024, 1440 and 1920 where relevant.

11. ACCESSIBILITY
Keyboard, focus, headings, labels, contrast, alt text, motion preferences.

12. PERFORMANCE
Avoid huge client bundles and image waste; responsive images/lazy loading where appropriate; profile first content should remain stable.

13. CURRENT GOLD OBJECT COMPATIBILITY
The existing four NATUREBRAIN project objects must continue to render.

14. EMPTY / FAILURE STATES
Source unavailable ≠ zero.
No match ≠ no project exists.
Missing media ≠ blank broken tile.
Unknown ≠ false.

15. EXACT TEST URL
Return an inspectable TEST/SANDBOX URL and exact SHA for Founder review.

---

# 20. WHAT AXE DOES AFTER CLAUDE BUILDS THE PLATFORM

AXE owns the data/research scale lane.

After template acceptance:

A. Build Gold 20 project queue.
B. Source/rights audit every candidate.
C. Resolve canonical Actor/Project/Place/Solution identities.
D. Ingest Source Records.
E. Write Claims/Evidence relationships.
F. Assign honest review states.
G. Publish Gold objects through NATUREBRAIN.
H. Generate original profile synthesis.
I. Link ATLAS context.
J. Generate/search-check metadata.
K. QA page.
L. Add selected Magazine story candidates.
M. Measure discovery and behaviour.
N. Scale by Issue.

Claude should not become the permanent data-entry bottleneck.
AXE should not redesign the UI for every new project.

The platform and graph must separate these jobs cleanly.

---

# 21. GOLD 20 ADMISSION CONTRACT

A project does not become public Gold merely because it is famous or visually compelling.

Required minimum:
SOURCE RECORD
→ ENTITY IDENTITY
→ ISSUE
→ PLACE
→ ACTOR
→ PROJECT
→ SOLUTION/METHOD where applicable
→ CLAIM(S)
→ EVIDENCE
→ RIGHTS CHECK
→ REVIEW STATE
→ ACTION ROUTE where valid
→ SEO METADATA
→ BROWSER QA
→ PUBLICATION.

At least one original authoritative source is preferred.
Secondary sources may add context but should not replace the primary record where a primary source exists.

External “award” or certification must name the reviewing institution and what it actually reviewed.

---

# 22. FOUNDER EXPERIENCE / SUCCESS TEST

The Founder should be able to open the product on mobile and immediately feel:

“This belongs to 4PLANET.”

Not:
“Claude made another SaaS dashboard.”

A normal user should be able to:
- see multiple real projects immediately;
- understand what they are;
- see who is doing the work;
- open one;
- understand the method;
- inspect evidence;
- see the place;
- continue to the actor;
- open the official source/action;
- understand exactly what 4PLANET has and has not verified.

An organisation should be able to open its profile and think:
“This is a high-quality, fair, credible representation of our work.”

A funder should be able to think:
“I can understand the project and its evidence quickly.”

A search visitor should be able to land directly on a Project/Actor/Issue page and get value without first learning 4PLANET’s internal architecture.

---

# 23. RELEASE / SAFETY RULES

Before implementation:
- fetch current king/test;
- confirm exact SHA;
- inspect current IMPACT files and current tests;
- inspect current PublicShell/brand tokens;
- do not overwrite concurrent accepted work.

For user-facing product work:
- use the existing four-state product authority rules;
- register a sandbox if current policy requires it;
- preserve rollback;
- Maker ≠ Judge;
- do not self-declare Gold.

Production/LIVE:
- no irreversible production promotion unless current Founder release authority is explicit and the exact artifact is verified.

Do not claim:
- partner;
- funded;
- verified outcome;
- active delivery;
- endorsement;
- independent verification;
unless supported by current evidence.

---

# 24. CURRENT VERIFIED IMPLEMENTATION STATUS — 14 OCT 2026

At the time this brief was written:

Current controlled branch:
king/test

Verified exact TEST candidate:
fd74b6e57711836d5084fc5dcb5800a890ba2887

IMPACT exact canonical TEST-domain proof:
PASS.

Dedicated test:
tests/e2e/impact-lan-gold.spec.ts

Result on exact TEST domain:
4/4 PASS across desktop-1440 and mobile-390 test projects.

The proof covers:
- discovery;
- issue filtering;
- Project Profile;
- Actor Profile;
- evidence/truth boundaries;
- mobile two-column project browse.

Public Preview Gate:
PASS on the same SHA.

GOLD / WORLD CLASS Enforcement:
PASS on the same SHA.

The repository-wide Browser Product Proof remains red due to an unrelated DATA VALUE convergence step. Its dedicated IMPACT step passed before that failure.

Do not interpret unrelated cross-product failure as IMPACT failure.

The current product remains a first Gold slice, not the finished IMPACT universe.

Known visual/product work still required:
- much stronger Project Profile storytelling and hierarchy;
- richer Actor Profile;
- issue pages;
- better media handling/fallbacks;
- more refined browse/collection design;
- stronger project-specific imagery where rights allow;
- full Gold 20;
- broader search/AI discovery;
- solution layer;
- capital layer;
- larger global corpus.

---

# 25. EXECUTION SEQUENCE

PHASE 0 — PREFLIGHT
Fresh king/test, exact SHA, read this brief, inspect current render, preserve accepted work.

PHASE 1 — DESIGN SYSTEM / INFORMATION ARCHITECTURE
Lock IMPACT visual grammar against current 4planet.org and the Founder’s compact browse direction.
Return a visible design lift quickly.

PHASE 2 — TEMPLATE GOLD
Build:
Issue
Project
Actor
and Solution skeleton.

PHASE 3 — CURRENT DATA INTEGRATION
Render existing four Gold project objects through new templates.
No static duplicate truth.

PHASE 4 — DISCOVERY + SEARCH
Browse/filter/search, internal graph links, SEO/AI metadata, sitemap/prerender.

PHASE 5 — ATLAS + CROSS-PRODUCT
Place context, actor/project relationships, Magazine path, Get Involved/action.

PHASE 6 — MOBILE + ACCESSIBILITY + PERFORMANCE
390/430 first-class, not compressed desktop.

PHASE 7 — INDEPENDENT GOLD
Browser evidence + source/truth + visual Founder review.

PHASE 8 — AXE GOLD 20 POPULATION
AXE ingests/researches projects once template is accepted.

PHASE 9 — GLOBAL SCALE
Expand by canonical Issue map, then Solutions and Capital.

---

# 26. THE NORTH STAR

4PLANET IMPACT should become:

THE WORLD’S MOST USEFUL, BEAUTIFUL AND TRUSTWORTHY INTERFACE FOR DISCOVERING WHO IS WORKING ON THE PLANET’S MOST IMPORTANT ECOLOGICAL PROBLEMS, WHAT THEY ARE DOING, WHERE, WITH WHAT EVIDENCE, AND HOW PEOPLE AND CAPITAL CAN HELP.

Not a donation marketplace.
Not a green directory.
Not a generic NGO platform.
Not a startup database.
Not a ranking site.
Not a dashboard.

A living action network built on source-grounded intelligence.

ISSUE
→ PLACE
→ ACTOR
→ PROJECT
→ SOLUTION
→ EVIDENCE
→ ACTION
→ CAPITAL
→ DELIVERY
→ OUTCOME
→ LEARNING.

Build less one-off UI.
Build the reusable premium system.
Then let the graph, research and distribution compound.
