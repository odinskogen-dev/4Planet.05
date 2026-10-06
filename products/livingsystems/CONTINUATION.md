# 4PLANET LIVING SYSTEMS INTELLIGENCE
# CONTINUATION / SELF-HANDOFF

> Written to the next Claude instance so work resumes PRECISELY with zero memory
> of the conversation. Read top-to-bottom, follow BOOT, then continue. Keep
> updated every session. The asset is not the website — it is the connected
> intelligence graph (living systems, human systems, threats, solutions,
> evidence, decisions).

CURRENT VERSION: 4planet-bio-v1.4.2
BUILD STATUS: green (confirmed each sprint by `npm run build`; see section 3).

================================================================================
## CANONICAL NAMING (authoritative — do not contradict)
================================================================================
- 4PLANET                = parent mission system / organisation.
- 4PLANET BRAIN          = INTERNAL intelligence architecture / operating brain
                           (ontology, graph logic, sources, claims, decision +
                           learning logic). NOT exposed heavily in public UI.
- Living Systems Intelligence = the PUBLIC product / interface. Primary public name.
- Biological Intelligence = a SUB-LAYER (species, ecological functions, services,
                           living-system relationships). NOT the main public name.
- Dependency Engine      = what depends on what.
- Trust Layer            = sources / claims / confidence / review status / data gaps.
- Source Verification    = whether evidence metadata is complete enough to trust (v1.3).
- Data Quality           = visible integrity layer: gaps / weaknesses / uncertainty (v1.3).
- Solution Intelligence  = what can help.
- Decision Intelligence  = structured reasoning for what to consider first. FOUNDATION
                           ONLY — a full automated Decision Engine is NOT built. Decision
                           signals are structured reasoning, not automated advice.
- Learning Intelligence  = what did we learn? FOUNDATION BUILT in v1.2 (structured
                           learning examples; not live impact reporting).
- Human Use Translation  = BUILT in v1.4: /start question-based entry, guided proof
                           pathways, practical interpretation, light role use cases.
- Impact Intelligence    = future action layer. Not built yet.
- 4PLANET LENS           = future field/camera interface. Not built yet.

NEVER tell a future instance "there is no BRAIN" or "display Biological
Intelligence ONLY". Public UI = Living Systems Intelligence; internal docs may
use 4PLANET BRAIN; Biological Intelligence only as a clearly-framed sub-layer.

================================================================================
## 0. BOOT — do this before changing anything
================================================================================
1. Read this whole file.
2. Confirm the tree exists: `ls /home/claude/4planet-bio/src`. If MISSING
   (sandbox reset), the canonical source is the latest zip the USER holds
   (`4planet-bio-vX.Y.zip`). Ask them to upload it, unzip to /home/claude/,
   then `npm install` (or `npm ci`). Do NOT rebuild from memory.
3. Green baseline BEFORE editing: `cd 4planet-bio && npx tsc --noEmit && npm run build` -> emits out/.
4. Read `docs/BIOLOGICAL_INTELLIGENCE_ONTOLOGY_v1.md` (the Biological Intelligence
   SUB-LAYER spec — not the full product architecture).
5. Preserve every existing intelligence layer (Dependency/Trust/Solution/Decision).
6. Then start the NEXT TASK at the bottom of this file (next phase: v1.5 —
   Second Deep Case: Pollination / Food System).

ARCHITECTURE SUMMARY: graph-native, node-native, relationship-first; cautious
scientific language; no fabricated sources or URLs; static Next export
(Cloudflare-compatible); no donation/marketplace/payment/account layer.

================================================================================
## 1. NORTH STAR
================================================================================
A graph-native intelligence system explaining HOW LIFE WORKS. Species are entry
points; relationships are the asset. Canonical chains:
  Species -PERFORMS-> Function -SUPPORTS-> Service -BENEFITS-> Recipient
  Driver  -CAUSED_BY- Threat   -ADDRESSED_BY-> Solution
Order of work: ARCHITECTURE first, INTELLIGENCE second, CONTENT third. Never
reverse. Long-term it must support Species/Ecosystem/Threat/Solution/Impact/
Mission/Capital/Planetary Intelligence off one knowledge graph.

================================================================================
## 2. INVARIANTS (never break)
================================================================================
- Graph-native, not page-native. All concept types are first-class nodes with
  stable IDs in src/data/. Species reference by ID only; never free text.
- Node types: Ecosystem, Species, EcologicalFunction, EcosystemService,
  Recipient, Threat, ThreatDriver, Solution, Mission, Source, Claim,
  ImpactOpportunity. (Population not yet modelled.)
- Edges on nodes: Function->Service, Service->Recipient, Threat->Driver,
  Solution->Threat. Contextual fields (severity, importance, dependency,
  explanation, confidence, sourceIds, reviewStatus) live on the SPECIES LINK.
- Relationship vocabulary is explicit in src/data/relationships.ts (REL).
- Shared nodes mandatory — check registry before minting. Never duplicate.
- Cautious language only: supports/contributes to/associated with/linked to.
  No absolute causal claims. No fabricated citations.
- Sources are nodes (src/data/sources.ts); claims trace to sources
  (src/data/claims.ts); confidence + reviewStatus express trust.
- fourPlanetIntelligence stays as the data key; renders as "Importance Assessment".
- Registry resolver THROWS on a missing node ID -> a clean build = every edge
  resolves. Trust the build as the integrity check.
DESIGN: white bg, ink #0A0A0A, brand #2E2EFF, DM Sans, thin borders #E6E6E6,
uppercase micro-labels (0.14em), high whitespace, no shadows. NASA x Nat Geo x
Bloomberg x Apple for nature intelligence. No NGO / startup-dashboard styling.

================================================================================
## 3. CURRENT STATE
================================================================================
VERSION v1.4.2 · BUILD green (173 pages) · npx tsc --noEmit clean · static export confirmed (Cloudflare-compatible) · Next 14 App Router + TS + Tailwind,
output:"export" -> out/.

5 REFERENCE SPECIES — ALL ACTIVE: jaguar, orca, african-savanna-elephant,
polar-bear, western-honey-bee. placeholders array empty. DO NOT add species
unless asked — objective is intelligence depth, not species count.

INTELLIGENCE LAYER (v0.4) — every node type is now a navigable intelligence
object with reverse edges:
- lib/intelligence.ts: reverse-edge resolvers (speciesByEcosystem/Threat/
  Solution/Function/Mission/Service, functionsSupportingService,
  solutionsForThreat) + getNodeIntel(kind,id) builder + idsFor(kind).
- components/NodeIntelligence.tsx: one generic detail layout for all node types.
- components/RegistryIndex.tsx: registry-driven index grid (links into detail).
- Dynamic routes (generateStaticParams over registries):
  /ecosystems/[id] /threats/[id] /solutions/[id] /functions/[id]
  /services/[id] /missions/[id]; matching index pages all registry-driven.
- AMAZON = /ecosystems/EC_AMAZON_RAINFOREST is the flagship Living System page
  (flagship flag -> "Living System · Proof of Concept"): species -> functions ->
  services -> recipients -> threats -> drivers -> solutions -> missions ->
  impact opportunities -> sources, all aggregated from the graph.
- RelationshipChain REBUILT: one complete path per row (Species -> Function ->
  Service -> Recipient); Function/Service cells link to their intelligence pages.
- Recipients expanded (Future Generations, Food Systems, Freshwater Systems,
  Coastal Communities) and wired into services.
- SolutionNode gained optional intelligence fields (evidenceLevel, scalability,
  timeHorizon, implementationDifficulty) — STRUCTURE ONLY, not populated/rendered.
- Species comparison is effectively delivered: a Function page lists every
  species performing it; a Service page lists every supporting species.
- Nav now: Species, Ecosystems, Functions, Threats, Solutions, Missions.

SOLUTION + DECISION INTELLIGENCE (v1.1) — from "what depends on what" to "what
can help / what to weigh first":
- types: SolutionNode expanded (costProfile/coBenefits/risks/strengthensServices/
  supportsHumanSystems/decisionNotes). New types SolutionPathway + DecisionSignal
  (SignalScale/DifficultyScale/HorizonScale).
- data/solutionIntel.ts: 8 SOLUTION_PATHWAYS (6 Amazon + 2 pollination) =
  Threat -> Solution -> strengthened services -> supported human systems; 6
  DECISION_SIGNALS (4 Amazon + 2 pollination) with leverage/urgency/confidence/
  difficulty/reversibility/horizon/reasoning/dataGaps/sources/reviewStatus.
  Cautious language only ("may support / can help / should be considered").
- lib/solutions.ts: pathwaysForNode/Threat/Solution/Ecosystem,
  decisionSignalsForNode/Solution/Ecosystem, solutionIntelligenceIntegrity().
- components/SolutionIntelligence.tsx: SolutionPathwayCard, DecisionSignalCard,
  SolutionIntelligencePanel (renders nothing when a node has no data). Wired into
  NodeIntelligence (so functions/services/threats/solutions/human-systems show it
  where relevant), the Amazon page, and the Honey Bee page (keyed to FN_POLLINATION).
- /decisions route: intro (structured reasoning, not advice) + Amazon section +
  Pollination/Food section of DecisionSignalCards.
- 2 new claims (pesticide reduction, pollinator habitat). /trust gained a Solution
  & Decision integrity block (pathways/signals counts + items needing sources/
  evidence). Homepage gained a "From understanding to better decisions" block +
  /decisions in nav + explore. /about gained a Solution + Decision Intelligence
  section. Nav: Ecosystems/Species/Dependencies/Solutions/Decisions/Trust/About
  (Sources -> footer). README rewritten to current architecture. Pages: 171.
  tsc clean, zero broken links.

PUBLIC PROOF PROTOTYPE (v1.0) — clarity + credibility for first-time visitors:
- Homepage rebuilt for the 10-second test: hero ("A system for understanding how
  nature, human systems, threats and solutions are connected"), one-sentence
  explanation, three core blocks (See what exists / Understand what depends on
  what / Know why it matters), HowItWorks model chain, TWO proof cases (Honey Bee
  → Pollination → Food System at species scale; Amazon → Rainfall Regulation →
  Agriculture → Water System at ecosystem scale), trust section, WhyThisMatters,
  explore grid.
- /about page added (what it is, why relationships matter, how it works, what
  makes it different, proof cases, what this is NOT, future direction).
- components/Explain.tsx: HowItWorks, WhyThisMatters, ProofCase (reused on home +
  about).
- Navigation streamlined to: Ecosystems · Species · Dependencies · Sources ·
  Trust · About. Secondary routes (Human Systems/Functions/Services/Threats/
  Solutions/Missions/Impact/Actors/Locations) moved to footer — still reachable,
  no clutter, no dead links.
- Naming: public = "Living Systems Intelligence" everywhere; "4PLANET BRAIN" kept
  as INTERNAL architecture (not exposed publicly); "Biological Intelligence" only
  an internal sub-layer. All public titles corrected (no "Biological Intelligence"
  in output). Route + link audit: ZERO broken internal links. tsc --noEmit clean.
  Pages: 170.

AMAZON DEEP CASE (v0.9) — first flagship Living System:
- DATA-MODEL EXTENSION (the one flagged since v0.7): EcosystemNode now carries
  shortDefinition/systemRole/flagship + providesServices/providesFunctions/
  threats/solutions. Ecosystems can provide services DIRECTLY (not only via
  species). graph.ts: ecosystem->service/function edges added to SUPPORTS;
  failureCascade(threat) now also seeds from affected ECOSYSTEMS.
- New nodes: services SV_RAINFALL_REGULATION/SV_WATER_CYCLING/SV_CLIMATE_
  REGULATION/SV_BIODIVERSITY_HABITAT (Carbon Storage reused); threats TH_
  DEFORESTATION/FOREST_DEGRADATION/FIRE/ILLEGAL_MINING/LAND_USE_CHANGE/SUPPLY_
  CHAIN_PRESSURE (+drivers DR_LAND_CLEARING/MINING/COMMODITY_DEMAND); solutions
  SO_PROTECTED_AREAS/FOREST_RESTORATION/SUPPLY_CHAIN_REFORM/LEGAL_PROTECTION/
  MONITORING_SYSTEMS (Indigenous Stewardship reused); human systems HS_
  AGRICULTURE/INDIGENOUS_LIVELIHOODS/CLIMATE. Dependency edges wire Amazon
  services -> human systems and human-system -> human-system (rainfall ->
  agriculture -> food; carbon -> climate -> food; habitat -> indigenous).
- graph helpers: servicesSupportedBy, humanSystemsDownstream, ecosystemPathways.
- DEDICATED Amazon page /ecosystems/EC_AMAZON_RAINFOREST (literal route; excluded
  from the generic [id] generateStaticParams to avoid conflict). BUILD 11 layout:
  identity, why-it-matters, core system pathways, human systems connected,
  reverse dependencies, 3 themed failure cascades (rainfall/agri, carbon/climate,
  biodiversity/resilience), threats, solution map, evidence, explore related.
  Reuses NodeTrustSummary/ReverseDependency/FailureCascade(title prop)/NodeEvidence.
- 15 Amazon claims + 5 new Amazon sources (INPE/MAPBIOMAS/RAISG/WWF_AMAZON +
  existing AMAZON_INSTITUTIONAL/IPCC/NASA), honestly under-sourced where due
  (NeedsSource/Draft). /trust gained an Amazon coverage section. /ecosystems
  index flags Amazon "Flagship Living System Case" and sorts it first. NAMING
  cleanup (no public "Biological Intelligence"). Pages: 169. Zero broken links.
NOTE: generic ecosystemIntel was NOT merged with node-level provision (Amazon
uses its dedicated page; no other ecosystem has provision yet). If provision is
added to another ecosystem, merge providesServices/threats/solutions into
ecosystemIntel or give it a dedicated page too.

TRUST + CLAIM LAYER (v0.8) — credibility infrastructure:
- types: SourceNode extended (author/year/usedFor/needsVerification); ClaimNode
  extended (nodeId/relationshipId/explanation/dataGaps); ReviewStatus +=
  NeedsSource/NeedsUpdate.
- data/sources.ts: 13 sources (added IPBES, IPCC, NASA, AMAZON_INSTITUTIONAL).
  Real top-level URLs only; deeper citations + Amazon source flagged
  needsVerification (NO fabricated URLs).
- data/claims.ts: 16 claims, each attached to a nodeId and (where relevant) a
  relationshipId, with confidence + reviewStatus + dataGaps. Honey Bee /
  Pollination / Food System / Pesticides well-covered; Amazon claims honestly
  marked NeedsSource.
- lib/trust.ts: getClaimsForNode / getClaimsForRelationship / getSourcesForClaim
  / getClaimsForSource / getTrustSummaryForNode / getClaimsByConfidence /
  getClaimsByReviewStatus / getUnderSourcedNodes / getUnderSourcedRelationships
  / getSourcesNeedingVerification / allDataGaps. Conservative summaries (lowest
  confidence, weakest review).
- components/EvidencePanel.tsx: EvidencePanel + NodeEvidence + NodeTrustSummary
  (+ reviewLabel). NodeIntelligence renders TrustSummary (after header) +
  NodeEvidence (after cascade) automatically for every node kind; species pages
  render them too. Minimal colour — only attention states tint brand.
- routes: /sources (index), /sources/[id] (metadata + summary + claims supported
  + related nodes + related relationships + verification warning = source
  reverse-view), /trust (integrity: totals, by-confidence, by-review-status,
  nodes needing sourcing, relationships needing evidence, data gaps). Footer now
  links Sources + Trust. Pages: 147. Zero broken links.

DEPENDENCY ENGINE V1 (v0.7) — failure cascades + recursive traversal + reverse:
- lib/graph.ts: unified SUPPORTS adjacency built from existing edges (ecosystem->
  species->function->service->recipient, plus service/function->human-system via
  DEPENDENCIES). NO new node type for "dependencies" (would duplicate Functions/
  Services) — decision flagged to user. Exposes: failureCascade(id) [threats seed
  from affected species], directDependents/dependsUpon (reverse intelligence),
  primaryChain + whyItMattersGenerated.
- components/FailureCascade.tsx: <FailureCascade> (layered downstream cascade) +
  <ReverseDependency> (what depends on this / what this depends on). Rendered on
  ecosystem/threat/function/service/human-system pages via NodeIntel.showCascade,
  and on species pages directly. SUCCESS CRITERION verified: Honey Bee ->
  Pollination -> Food Production -> Food System; Pesticides -> Honey Bee ->
  Pollination (threat cascade); reverse intelligence on services.
- species.whyItMatters (systemic, cautious) on all 5 species, rendered prominent.
- Decision Intelligence V1 + Learning Intelligence V1: types DecisionSignals +
  KnowledgeProfile (SignalLevel/Reversibility/KnowledgeStatus) on SpeciesProfile
  (optional). Seeded on jaguar + honey bee; SpeciesSignals.tsx renders compact
  block in Importance Assessment. Architecture-first, lightweight UI.
- /dependencies index: existing Functions + Services unified as the ecological-
  dependency layer; nav now shows Dependencies (replaced narrower Functions entry;
  Functions index still exists + linked everywhere). Pages: 133. Zero broken links.

DEPENDENCY ENGINE (v0.6) — "what depends on what" is now central:
- dependencies.ts expanded (Food System is the full test case: SUPPORTED_BY
  Pollination/Food Production/Water Security/Nutrient Cycling; VULNERABLE_TO
  Pesticides/Forage Loss/Drought).
- intelligence.ts: humanSystemGraph() traversal; humanSystemIntel now derives
  functions/services/species/threats/solutions/impact/missions supporting each
  system; functionIntel + serviceIntel show reverse edges (human systems,
  threats, solutions, impact) — every node shows forward AND reverse edges.
- buildPathways() + components/DependencyPathway.tsx: one complete dependency
  chain per row (System -> Service/Function -> Species -> Threat -> Solution),
  shown atop each /human-systems/[id] page (NodeIntelligence now takes children).
- Actor + Location detail pages added (actorIntel/locationIntel + /actors/[id],
  /locations/[id]); indexes clickable. SpeciesConnections chips now link to
  detail pages. AUDIT: zero broken internal links.
- Capital linked to Impact (CapitalObject.impactId; shown on /impact/[id]).
  Decision/Learning types gained connection fields (architecture only).
- Homepage gained supporting line. Pages: 132.

LIVING SYSTEMS LAYER (v0.5) — new first-class node systems (architecture-first):
- humanSystems.ts (10 HumanSystem nodes) + /human-systems index & detail.
- dependencies.ts (DependencyEdge registry + dependenciesFrom/To) wiring Human
  Systems -> services/functions and VULNERABLE_TO threats. Surfaced on service,
  threat and ecosystem (Amazon) pages: "what depends on this / what breaks".
- locations.ts (spatial foundation) + /locations index.
- actors.ts (actor foundation, draft archetypes) + /actors index.
- foundations.ts: TEMPORAL/CAPITAL/DECISIONS/LEARNING registries — ARCHITECTURE
  ONLY, draft entries, NO pages yet.
- impact.ts surfaced: /impact index & detail (ImpactOpportunity as full node).
- intelligence.ts: getNodeIntel kinds added "human-systems" + "impact";
  resolveNodeRef() resolves any node id across registries.
Pages now: 121. Nav adds Human Systems; footer links Services/Impact/Actors/Locations.

ARCHITECTURE DATA (data/): nodes.ts (functions, services, recipients, threats,
drivers, solutions, ecosystems, MISSIONS=16, no BRAIN), species.ts (5 species),
sources.ts (Source nodes + trust), claims.ts (Claim nodes), impact.ts
(ImpactOpportunity), relationships.ts (15 REL types).

NAMING (CORRECTED v0.9):
- "4PLANET BRAIN" = INTERNAL intelligence architecture / operating brain. It is
  NOT removed — it is simply the internal name and is NOT exposed in public UI.
- "Living Systems Intelligence" = the PUBLIC product / interface (header wordmark,
  page titles, public language).
- "4PLANET" = the parent brand (homepage eyebrow, footer "Part of 4PLANET").
- "Biological Intelligence" is at most an internal sub-layer; it is NOT the public
  product identity. All public metadata titles now read "LIVING SYSTEMS
  INTELLIGENCE" (fixed remaining ecosystem/species/etc. titles in v0.9).
Earlier changelog lines that say "BRAIN removed/dead" describe removing BRAIN from
the PUBLIC UI, not deleting the internal architecture concept.

================================================================================
## 4. NEXT — INTELLIGENCE LAYER PHASE 2 + (then) CONTENT
================================================================================
Architecture + node-intelligence pages exist. Remaining intelligence work:
A. SOURCE pages — /sources index + /sources/[id] detail (SourceNode is built;
   add reverse "what cites this source"). Add source references on species/node
   pages linking to source pages.
B. CLAIM surfacing — claims.ts exists but is not shown. Render Claims (statement
   + sources + confidence + reviewStatus) on species + ecosystem pages.
C. IMPACT pages — /impact index + /impact/[id]; currently Amazon shows only
   opportunity titles. Make ImpactOpportunity a full node page wired to its
   ecosystem/species/threats/solutions.
D. SOLUTION INTELLIGENCE — populate + render the optional SolutionNode fields
   (evidence/scalability/time horizon/difficulty). No rankings yet.
E. (optional) dedicated lightweight GRAPH EXPLORER page; node pages already
   provide most of it.
Only after this layer: CONTENT (more species/ecosystems). Never reverse the
architecture -> intelligence -> content order.
F. Surface Claims in the UI (claims.ts still not shown) + source detail pages.
G. Add genuinely-NEW ecosystem-service dependency nodes that the prompt named but
   we do not yet have (Soil Formation, Water Purification, Coastal Protection,
   Rainfall Regulation) — as Services wired to existing functions. NB: Amazon
   "rainfall -> agriculture" needs ecosystem-LEVEL services (services are
   currently derived only from species) — small data-model extension.
H. Roll DecisionSignals/KnowledgeProfile out to more nodes + add a cross-node
   "decision view"; populate Capital/Decision/Learning registries + pages.
I. Deepen dependency coverage for non-Food human systems; render confidence/
   strength on dependency edges + cascade chips.
NAMING is now settled (see section 3) — no longer pending.

================================================================================
## 5. RECIPE — add ANY species (when resumed later)
================================================================================
1. nodes.ts: add ONLY genuinely new nodes + wire edges. Reuse everything else.
2. species.ts: write SpeciesProfile referencing IDs; humanTranslation per
   section; cautious language; confidence/sourceIds/reviewStatus on links.
3. Meaningful cross-links both directions (connections.species).
4. Move from placeholders into speciesList; status "active".
5. `npm run build` green (resolver proves edges). Spot-check the new page.
6. Update sections 3 + 7 of this file.

================================================================================
## 6. ENVIRONMENT GOTCHAS
================================================================================
- Sandbox FS can reset between sessions; canonical source = latest user zip.
- Build `npm run build`; Cloudflare Pages: build `npx next build`, output `out`.
- Fonts via runtime <link> in layout.tsx (Google Fonts host blocked in sandbox;
  "Host not in allowlist" build line is harmless). Do NOT use next/font/google.
- Ship source WITHOUT node_modules/.next/out; zip with
  `-x "node_modules/*" ".next/*" "out/*"`. cp works; rsync absent; outputs dir
  has had intermittent EIO.

================================================================================
## 7. CHANGELOG
================================================================================
- v0.1 graph-native foundation: types, node registry, resolver, Jaguar slice,
  RelationshipChain, Importance Assessment, homepage/index/detail/placeholders.
- v0.2 ontology doc + relationships.ts; confidence; Orca + Elephant active;
  cross-links; placeholder views show species counts; roleLabel.
- v0.3 (architecture milestone) ALL 5 species active (added Polar Bear +
  Honey Bee). New node types + registries: Source, Claim, ImpactOpportunity.
  Contextual links gained sourceIds + reviewStatus (renamed from sourceKeys).
  Relationship registry completed (added PROTECTS, LIVES_IN, THREATENS,
  FOCUSES_ON). Full 16-mission set; BRAIN removed everywhere; in-app name set to
  "BIOLOGICAL INTELLIGENCE" only; footer "Part of 4PLANET". Sources UI resolves
  Source nodes (org + trust). Build green (13 pages).
- v0.4 (intelligence layer phase 1) reverse-edge resolvers + getNodeIntel
  builder; generic NodeIntelligence + RegistryIndex; dynamic intelligence pages
  for ecosystems/threats/solutions/functions/services/missions (105 pages);
  Amazon flagship Living System page; RelationshipChain rebuilt to one-path-per-
  row with linked nodes; recipient library expanded; SolutionNode intelligence
  fields (structure only). Build green. Naming unchanged pending user decision.
- v0.5 (Living Systems layer) repositioned in-app to LIVING SYSTEMS INTELLIGENCE
  (brand 4PLANET, no BRAIN). Added HumanSystem + Dependency + Location + Actor
  node systems, and Temporal/Capital/Decision/Learning foundations (architecture
  only). Human systems wired into the graph via dependency edges and surfaced on
  service/threat/ecosystem pages; Amazon shows human systems depending on it.
  Impact opportunities now full node pages. Relationship chain unchanged (already
  one-path-per-row from v0.4). Build green (121 pages). v0.4 preserved.
- v0.6 (Living Systems Engine) Dependency Intelligence made central: expanded
  dependency graph; Human System pages derive deep forward connections + lead
  with DependencyPathway (one chain per row); functions/services show reverse
  edges; actor/location detail pages; all graph chips clickable (zero broken
  links); capital->impact link; Decision/Learning connection fields. Homepage
  supporting line. Build green (132 pages). v0.5 fully preserved.
- v0.7 (Dependency Engine V1) built the cascade engine (lib/graph.ts): unified
  SUPPORTS graph, failureCascade(), reverse intelligence (directDependents/
  dependsUpon), recursive layered traversal. FailureCascade + ReverseDependency
  on all major node pages + species. whyItMatters on 5 species. Decision +
  Learning Intelligence V1 typed structures (DecisionSignals/KnowledgeProfile),
  seeded on 2 species, compact UI. /dependencies unified index + nav. Success
  criterion (Bee cascade + Pesticides decline cascade) verified. Build green
  (133 pages). v0.6 fully preserved. Dependency-node-type duplication avoided
  (represented as Functions+Services) — confirm with user if a separate type is
  ever wanted.
- v0.8 (Trust + Claim layer) added Source + Claim models (extended existing),
  13 sources / 16 node-linked claims, lib/trust.ts helpers, EvidencePanel +
  NodeTrustSummary (auto-rendered on all node pages), /sources, /sources/[id]
  (source reverse-view), /trust integrity page. Confidence + review status +
  data gaps visible everywhere; Amazon honestly marked NeedsSource; no fabricated
  URLs. Build green (147 pages). v0.7 engine fully preserved.
  KNOWN LIMITATIONS: source + claim coverage still partial; several sources need
  URL/citation verification; quantitative dependency strength not yet modelled;
  relationship-level trust metadata is carried via claims (relationshipId), not
  yet on the DependencyEdge objects themselves.
  NEXT (recommended): v0.9 AMAZON LIVING SYSTEM DEEP CASE — Amazon -> Rainfall
  Regulation -> Regional Agriculture -> Food System; Amazon -> Carbon Storage ->
  Climate Regulation -> Human Systems; Amazon -> Biodiversity Habitat -> species/
  functions/services; Amazon threats (deforestation/fire/mining/climate);
  solutions (Indigenous stewardship/protected areas/restoration/supply-chain);
  deepen Amazon source + claim coverage. NB needs ecosystem-LEVEL services
  (rainfall) — services are currently derived only from species (data-model
  extension, noted since v0.7).
- v0.9 (Amazon Deep Case) extended EcosystemNode for ecosystem-level provision;
  built Amazon as the first flagship Living System with a dedicated page (core
  pathways, human systems, reverse deps, 3 failure cascades, threats, solution
  map, evidence, trust summary). Added Amazon services/threats/solutions/human-
  systems + dependency edges; 15 Amazon claims + 5 Amazon sources; /trust Amazon
  coverage; ecosystems-index flagship; naming cleanup (Living Systems Intelligence
  public; 4PLANET BRAIN internal). Build green (169 pages). v0.7 engine + v0.8
  trust layer fully preserved.
  KNOWN LIMITATIONS: Amazon source coverage still partial; several sources need
  URL/citation verification; quantitative dependency strength not modelled;
  temporal trends not modelled; spatial/actor intelligence still basic.
  NEXT (recommended): v1.0 PUBLIC PROOF PROTOTYPE — refine public landing so
  Living Systems Intelligence is graspable in ~10 seconds; polish Amazon as the
  flagship demo; improve navigation between the Bee/Pollination/Food story and
  Amazon; strengthen trust display; ensure build stability; prepare for public
  sharing. Keep 4PLANET BRAIN internal; Living Systems Intelligence public;
  Biological Intelligence only a sub-layer if at all.
- v1.0 (Public Proof Prototype) rebuilt the homepage for instant clarity, added
  /about, added Explain.tsx (HowItWorks/WhyThisMatters/ProofCase), streamlined
  nav (Ecosystems/Species/Dependencies/Sources/Trust/About; rest in footer),
  cross-linked the two proof cases (Bee species-scale + Amazon ecosystem-scale),
  finalised public/internal naming (Living Systems Intelligence public; 4PLANET
  BRAIN internal; Biological Intelligence sub-layer). tsc clean, build green
  (170 pages), zero broken links. v0.7 engine + v0.8 trust + v0.9 Amazon fully
  preserved.
  ARCHITECTURE LANGUAGE (canonical): 4PLANET BRAIN = internal intelligence
  architecture; Living Systems Intelligence = public product; Biological
  Intelligence = sub-layer; Dependency Engine = "what depends on what" engine;
  Trust Layer = source/claim/confidence/data-gap layer; Amazon = first deep
  Living System case; Honey Bee/Pollination/Food = first species-to-human-system
  proof flow.
  KNOWN LIMITATIONS: still a proof prototype, not a complete platform; source
  coverage partial; some URLs need verification; quantitative dependency strength,
  temporal trends, spatial + actor + solution intelligence all still early.
  NEXT (recommended): v1.1 SOLUTION / DECISION INTELLIGENCE FOUNDATION — structure
  solution intelligence, connect threats→solutions more systematically, add
  leverage/urgency/confidence indicators, begin decision intelligence lightly.
  Keep impact/donation infrastructure OUT until the intelligence layer is stronger.
- v1.1 (Solution + Decision Intelligence Foundation) added SolutionPathway +
  DecisionSignal models, 8 solution pathways + 6 decision signals (Amazon +
  pollination), SolutionPathwayCard/DecisionSignalCard/SolutionIntelligencePanel,
  /decisions route, Amazon + Bee/Pollination + threat/solution page integration,
  /trust solution-integrity block, homepage + about + nav + README updates.
  Cautious language throughout; NO donation/marketplace/payment layer. tsc clean,
  build green (171 pages), zero broken links. v0.7–v1.0 fully preserved.
  ARCHITECTURE LANGUAGE: 4PLANET BRAIN = internal architecture; Living Systems
  Intelligence = public product; Biological Intelligence = sub-layer; Dependency
  Engine = what depends on what; Trust Layer = claims/sources/confidence/gaps;
  Solution Intelligence = what can help; Decision Intelligence = what to weigh
  first (structured reasoning); Impact Intelligence + 4PLANET LENS = future, not
  built.
  KNOWN LIMITATIONS: solution intelligence early; decision intelligence is
  structured reasoning, not AI recommendation; source coverage partial;
  quantitative dependency strength, temporal trends, spatial + actor intelligence
  still basic; impact/donation infrastructure intentionally not built.
  NEXT (recommended): v1.2 LEARNING + OUTCOME INTELLIGENCE FOUNDATION — expected
  outcomes, observed outcomes, learning records, confidence updates, assumption
  tracking ("what did we learn?"). Keep impact/payment infrastructure out until
  the intelligence layer is stronger.

================================================================================
## CHANGELOG — v1.1.1 (canon / build / documentation lock)
================================================================================
- Rewrote the unsafe top of this file: removed "BIOLOGICAL INTELLIGENCE 4PLANET"
  title, "in-app display = BIOLOGICAL INTELLIGENCE ONLY" and "There is no BRAIN".
  Added the authoritative CANONICAL NAMING block (4PLANET / 4PLANET BRAIN internal
  / Living Systems Intelligence public / Biological Intelligence sub-layer / engine
  + layer definitions). BOOT now runs `npx tsc --noEmit && npm run build`.
- README already current; docs/BIOLOGICAL_INTELLIGENCE_ONTOLOGY_v1.md got a scope
  note marking it the Biological Intelligence SUB-LAYER spec (not full product).
- Public naming audit: no public "Biological Intelligence", no public version
  strings; only mention of "4PLANET BRAIN" is in /about, correctly framed as the
  internal architecture. Footer label fixed: "Living Systems Intelligence · 4PLANET"
  (was "Beta v0.5").
- Integrity check on src/data/solutionIntel.ts: 8 pathways + 6 signals, all ids
  unique, ALL referenced threat/solution/service/function/human-system/ecosystem/
  claim/source ids resolve. Zero broken references.
- tsc --noEmit clean; build green (171 pages); zero broken internal links. No new
  features. All v0.7–v1.1 intelligence layers preserved.

================================================================================
## NEXT RECOMMENDED PHASE — v1.2 LEARNING + OUTCOME INTELLIGENCE FOUNDATION
================================================================================
Purpose: move from structured understanding + decision reasoning toward ADAPTIVE
intelligence. Core question: "What did we learn?"

Build later (NOT in v1.1.1):
- ExpectedOutcome model      (what a solution/decision is expected to achieve)
- ObservedOutcome model      (what was actually observed)
- LearningRecord model       (expected vs observed → lesson)
- Assumption model           (assumptions a decision rests on)
- ConfidenceUpdate model     (how confidence changed as evidence arrived)
- OutcomeEvidence model      (evidence linking outcomes to sources/claims)
- LearningPanel component
- /learning route
- Seed learning records for the Amazon + Pollination proof cases.

Notes for v1.2:
- Reuse existing patterns: types in src/types, data in src/data, helpers in
  src/lib, cards/panels in src/components, a single route under src/app.
- Keep cautious language; tie outcomes to sources/claims; mark unknowns honestly
  (NeedsSource / dataGaps). NO automated "AI recommendation" framing.
- Keep impact/donation/payment infrastructure OUT until the intelligence layer is
  stronger. Learning Intelligence is what moves the system toward adaptive
  planetary intelligence — explaining relationships AND learning from outcomes.
- Strategic path: v1.0 public proof → v1.1 solution+decision → v1.1.1 canon/build
  lock → v1.2 learning+outcome.

================================================================================
## CHANGELOG — v1.2 (Learning + Outcome Intelligence Foundation)
================================================================================
The fifth intelligence layer. Adaptive loop:
  Decision → Expected Outcome → Assumption → Observed Outcome → Learning Record
  → Confidence Update → (improved decision). Structured learning EXAMPLES for the
  proof cases — NOT live impact reports, and not a claim that 4PLANET ran fieldwork.

- types/index.ts: renamed legacy v0.5 `LearningRecord` → `LearningFoundationRecord`
  (foundations.ts updated) to free the name. Added ExpectedOutcome, ObservedOutcome,
  LearningRecord, ConfidenceUpdate + enums (ExpectedDirection/ObservedDirection/
  AssumptionStatus/ConfidenceChange/LearningHorizon). Reused Confidence/ReviewStatus.
- src/data/learning.ts: 6 EXPECTED_OUTCOMES, 6 OBSERVED_OUTCOMES, 6 LEARNING_RECORDS
  (Amazon: protected areas, indigenous stewardship, monitoring, restoration;
  Pollination: pesticide reduction, pollinator habitat), 2 CONFIDENCE_UPDATES.
  All reference existing IDs; cautious language; honest uncertainty.
- src/lib/learning.ts: getExpectedOutcomesForDecision/SolutionPathway, getExpectedOutcome,
  getObservedOutcomesForExpectedOutcome, getLearningRecordsForDecision/SolutionPathway/
  Ecosystem/Species, getLearningSummaryForDecision, getConfidenceUpdatesForTarget,
  getLearningRecordsByAssumptionStatus/ConfidenceChange, getLearningDataGaps,
  learningIntegrity().
- src/components/LearningIntelligence.tsx: ExpectedOutcomeCard, ObservedOutcomeCard,
  LearningRecordCard, LearningIntelligencePanel (calm/structured; uncertainty as
  intelligence, no red/green success framing).
- /learning route: what it is, loop diagram, Amazon + Pollination examples,
  confidence updates, data gaps; states clearly it is not a live impact report.
- Integrations: /decisions (per-signal "Learning linked to this decision"),
  Amazon page (LearningIntelligencePanel + confidence updates), Honey Bee page
  (species learning records), /trust (Learning Intelligence integrity counts),
  homepage (Learning-from-outcomes block + Explore entry), /about (Learning
  Intelligence block), nav (Learning added between Decisions and Trust).
- Integrity: all learning refs resolve (decision/pathway/ecosystem/species/threat/
  solution/service/human-system/source/claim/expected/observed/confidence-target).
  tsc clean; build green (172 pages); zero broken links. All v0.7–v1.1.1 layers
  preserved. No donation/marketplace/CRM/account/mobile/LENS added.

NEXT RECOMMENDED PHASE: v1.3 — Source Verification + Data Quality Deepening.
Focus: verify sources, improve source URLs/metadata, strengthen claims, evidence
hierarchy, data-quality scoring, audit source coverage, reduce NeedsSource /
NeedsVerification, prepare a public credibility layer. Do NOT build payments or
marketplace.

================================================================================
## CHANGELOG — v1.2.1 (version / continuation / build lock + Human Use prep)
================================================================================
Not a feature sprint. Locked v1.2 and prepared the next strategic layer.
- CONTINUATION top: CURRENT VERSION → v1.2.1; Learning Intelligence reclassified
  from "future / not built yet" to "FOUNDATION BUILT in v1.2"; added Human Use
  Translation to the canonical naming block; removed the "v1.2 prep" boot pointer.
- README: version status → v1.2.1 (Learning Intelligence foundation built);
  added Human Use Translation future-direction note + v1.3/v1.4 roadmap.
- Audited: no doc/UI still calls Learning "future/not built"; no implied fieldwork
  ("we restored/protected", "our impact", "proven/guaranteed") in public UI.
- All learning references re-validated; routes/links audited; footer remains
  "Living Systems Intelligence · 4PLANET". tsc clean; build green; static export
  confirmed. All v0.7–v1.2 layers preserved. No new product surface added.

================================================================================
## HUMAN USE TRANSLATION (future product direction — documentation only)
================================================================================
Answers: How can a person or institution use this intelligence in practice?

Future product logic (NOT built yet — do not build full UI before v1.4):
  Question → Node → Dependency pathway → Threat → Solution → Decision signal
  → Learning record → Practical next step.

Example user journeys (document only):
- Student      — understand why a species matters.
- Educator     — explain ecological dependency clearly.
- Journalist   — a clear, sourced explanation of an ecological issue + context.
- Policymaker  — which human systems are affected by ecosystem degradation.
- Foundation   — which solution pathways may have leverage; what evidence gaps remain.
- Company      — nature dependencies, risks and credible solution pathways.
- Citizen      — what a species, forest, river or function does for life and humans.
- 4PLANET      — prioritise missions, partners, impact opportunities, communication.

Do NOT build role systems, per-group dashboards, impact flows, memberships or
payment/action infrastructure now. This is roadmap canon for v1.4.

================================================================================
## ROADMAP (after v1.2.1)
================================================================================
- v1.3 — Source Verification + Data Quality Deepening: verify sources, improve
  source URLs/metadata, strengthen claims, evidence hierarchy, data-quality
  scoring, audit source coverage, reduce NeedsSource/NeedsVerification, prepare a
  public credibility layer. No payments or marketplace.
- v1.4 — Public UX / Simplicity Layer + Human Use Translation: make the system
  easier for humans to use; simplify journeys; "Start Here"; light role-based use
  cases; better mobile node cards; carefully licensed photography. No 4PLANET LENS yet.

================================================================================
## CHANGELOG — v1.3 (Source Verification + Data Quality Deepening)
================================================================================
Credibility sprint. Strengthened evidence discipline before v1.4 simplifies UX.
No new product surface; no new routes (still 172 pages).

- types/index.ts: SourceNode extended (optional, non-breaking) with evidenceTier,
  sourceQuality, verificationStatus, citationNote, accessDate. Added EvidenceTier,
  SourceQuality, VerificationStatus, DataQualityStatus, DataQualityIssue types.
- src/data/sources.ts: all 16 sources annotated with evidenceTier / sourceQuality /
  verificationStatus (honest: IUCN/CITES/NOAA/IWC/SMITHSONIAN/PANTHERA = Verified;
  FAO/IPBES/IPCC/NASA = NeedsReview; Amazon datasets INPE/MAPBIOMAS/RAISG/WWF_AMAZON/
  AMAZON_INSTITUTIONAL = NeedsURL; INTERNAL = NeedsReview). citationNote added to the
  6 unverified/contextual sources. NO fabricated URLs, DOIs or report titles.
- Claims audited — already cautious (no proves/guarantees/solves/always language).
- src/data/dataQuality.ts: 9 honest DATA_QUALITY_ISSUES (Amazon rainfall needs
  quantification; pollination regional variation; dataset URLs; restoration context;
  learning examples not live data; decision signals qualitative; internal source weak).
- src/lib/dataQuality.ts: getDataQualityIssuesForTarget, getDataQualitySummary,
  getIssuesBySeverity/ByType, getUnverifiedSources, getSourcesNeedingURL/Metadata,
  getClaimsNeedingSource/Review, getRelationshipsNeedingEvidence,
  getEvidenceCoverageSummary (per-case Strong/Moderate/Limited status).
- src/components/DataQuality.tsx: DataQualityBadge, DataQualityIssueList,
  DataQualityPanel, EvidenceCoverageSummary (calm; integrity not failure).
- /trust: added Evidence coverage (Amazon + Pollination cases) + Data quality
  register (severity counts, unverified sources, issues list).
- /sources: meta line now shows evidence tier + verification status.
- /sources/[id]: meta grid shows evidence tier / source quality / verification;
  verification badge by title; citation note; per-source data quality panel.
- Amazon page: per-node data quality panel after evidence.
- /about: added "Sources & data quality" block. Homepage trust block already covers
  sources/confidence/review/data-gaps.
- Integrity: all data-quality issue refs resolve; learning refs still resolve;
  tsc clean; build green (172 pages); zero broken links. All v0.7–v1.2.1 layers
  preserved. No payments/marketplace/accounts/LENS/Human-Use-UI added.

Canon additions: Source Verification = whether evidence metadata is complete enough
to trust; Data Quality = visible integrity layer showing gaps/weaknesses/uncertainty.

NEXT: v1.4 — Public UX / Simplicity Layer + Human Use Translation (Start Here, light
role-based use cases, better mobile node cards, carefully licensed photography; no
LENS, no payments/marketplace). Then v1.5 — second deep case: Pollination / Food System.

================================================================================
## CHANGELOG — v1.3.1 (documentation / version / build lock + v1.4 prep)
================================================================================
Not a feature sprint. Locked v1.3 and prepared v1.4.
- CONTINUATION top: CURRENT VERSION → v1.3.1. Canon: added Source Verification +
  Data Quality definitions; Decision Intelligence marked FOUNDATION ONLY (no full
  automated Decision Engine); Human Use Translation marked NEXT (v1.4).
- README: version status → v1.3.1 (lists all built layers incl. Source Verification,
  Data Quality, Decision Intelligence Foundation, Learning Intelligence Foundation);
  added Decision Engine status note; extended roadmap to v2.0.
- Audited: public UI uses Living Systems Intelligence; no "full Decision Engine",
  no automated-advice / guaranteed-solution / live-impact-reporting language; v1.3
  Source Verification + Data Quality render intact; /decisions + /learning language
  cautious; footer "Living Systems Intelligence · 4PLANET".
- tsc clean; build green; static export confirmed. All v0.7–v1.3 layers preserved.
  No new product surface; no Human Use Translation UI built.

================================================================================
## DECISION ENGINE STATUS (authoritative)
================================================================================
Current: a Decision Intelligence FOUNDATION. It shows structured decision signals
connected to ecosystem, threat, solution, strengthened service, supported human
system, confidence, urgency, leverage, implementation difficulty, learning records
and data quality. This is NOT a full automated Decision Engine.
A full Decision Engine would require: stronger data quality, verified evidence,
more complete source coverage, quantitative + qualitative scoring rules, place/
spatial context, actor context, tradeoff logic, scenario logic, learning feedback,
and human-readable decision outputs. Do NOT build the full engine yet; do NOT claim
it exists.

================================================================================
## v1.4 SPEC — PUBLIC UX / SIMPLICITY LAYER + HUMAN USE TRANSLATION (NEXT)
================================================================================
Purpose: make the existing intelligence easier for humans to use WITHOUT making it
shallower. The system is intelligent but still too internal/dense for a normal
person. v1.4 must answer: "How does a human use this?"

Recommended concept — START HERE → "What do you want to understand?"
Question-based entry points:
  1. Understand a species.
  2. Understand an ecosystem.
  3. Understand what threatens it.
  4. Understand what can help.
  5. Understand what evidence supports this.
  6. Understand what we learned.
  7. Use this for a decision.

Human-readable flow (translate, do not rebuild the graph):
  Question → Node → Dependency Pathway → Threat → Solution → Decision Signal
  → Learning Record → Practical Interpretation.

Role-based examples (document; build lightly in v1.4):
  Student — why a species matters. Educator — explain dependency clearly.
  Journalist — a sourced explanation. Policymaker — affected human systems + decisions.
  Foundation — evaluate solution pathways + evidence gaps. Company — nature
  dependencies + credible pathways. Citizen — why a species/forest/function matters.
  4PLANET — prioritise missions, partners, impact opportunities, communication.

v1.4 focus: Start Here; Explore by Question; simple user journeys; practical
interpretation of existing intelligence; better mobile node cards; cleaner homepage
hierarchy; simplified Amazon + Pollination proof flows; carefully licensed
photography. Do NOT build 4PLANET LENS or any payment/donation/marketplace.

================================================================================
## ROADMAP (after v1.3.1)
================================================================================
- v1.4 — Public UX / Simplicity Layer + Human Use Translation (NEXT)
- v1.5 — Second Deep Case: Pollination / Food System
- v1.6 — Mobile Node Cards
- v1.7 — Place / Spatial Intelligence
- v1.8 — Actor / Solution Network
- v2.0 — Operational Living Systems Intelligence Beta

================================================================================
## CHANGELOG — v1.4 (Public UX / Simplicity Layer + Human Use Translation)
================================================================================
Built the HUMAN layer over the intelligence — no new intelligence architecture.
- Fixed active BOOT pointer (was "next phase: v1.3" → now v1.4).
- src/data/humanUse.ts: 7 HumanUseQuestion entry points, 2 GuidedJourney proof
  pathways (AMAZON, POLLINATION — hand-built, real node hrefs), 8 RoleUseCase.
- src/components/HumanUse.tsx: PracticalInterpretation, HumanUseQuestionCard,
  StartHerePanel, HumanPathway, DecisionJourneyCard, RoleUseCard.
- /start route: "What do you want to understand?" — 7 questions, 2 guided
  pathways, role use cases, practical interpretation. No account/state.
- Homepage: "New here?" Start Here block after hero. Nav: Start added first.
- Guided Decision Pathways added to /start, /decisions, Amazon page ("How to read
  this case"), Honey Bee page. Called "guided proof pathway" — explicitly NOT an
  automated decision engine.
- /decisions: "a useful decision signal connects…" block + closing practical
  interpretation. /trust: "trust is not a score of perfection" block. /sources:
  contextual-support note. /learning: "why learning matters" + practical use.
- Language audit: no "full/automated Decision Engine", "guaranteed", "best
  solution", "our impact", "we restored/protected" as live claims (only correct
  negations). No photography added (visual system stays typographic; media model
  deferred). No payments/marketplace/accounts/LENS.
- tsc clean; build green (173 pages, +1 /start); zero broken links. All v0.7–v1.3.1
  layers preserved.

NEXT: v1.5 — Second Deep Case: Pollination / Food System. Make pollination the
clearest educational proof case: connect pollinators, crops, food systems,
pesticide pressure, habitat, solutions, evidence, data quality, decision signals
and learning. No payments or marketplace.
Later: v1.6 Mobile Node Cards · v1.7 Place/Spatial · v1.8 Actor/Solution Network ·
v2.0 Operational Beta.

================================================================================
## CHANGELOG — v1.4.1 (route / link / build lock)
================================================================================
No new features. Verified and locked the v1.4 Human Use Translation layer.
- Investigated reported live 404 on /functions and /functions/FN_POLLINATION.
  Both routes already EXIST and build correctly: /functions is an Ecological
  Functions index (RegistryIndex over FUNCTIONS, mirroring /services), and
  /functions/[id] renders NodeIntelligence for all 7 function nodes incl.
  FN_POLLINATION. With trailingSlash:true they emit out/functions/ and
  out/functions/FN_POLLINATION/. Conclusion: the live 404 was a STALE DEPLOY of
  an earlier build, not a code defect. Re-verified and rebuilt clean.
- Full link audit (footer, /start + humanUse data, /decisions + Amazon + Honey
  Bee guided pathways, all nav/footer entity routes) against the built output:
  ZERO broken links. All entity routes resolve: functions, services, threats,
  solutions, human-systems, missions, impact, actors, locations, sources.
- README + CONTINUATION current version → v1.4.1. Decision Intelligence still
  described as structured reasoning, not automated advice; no full Decision Engine.
- tsc clean; build green (173 pages); static export intact (output:"export",
  images unoptimized, out/, trailingSlash:true). Cloudflare-compatible.

DEPLOY NOTE: redeploy this build so the live site includes /functions/. With
trailingSlash:true, canonical URLs end in "/"; Cloudflare Pages auto-redirects
the non-slash form.

NEXT: v1.5 — Second Deep Case: Pollination / Food System.

================================================================================
## CHANGELOG — v1.4.2 (functions route / link / build lock)
================================================================================
No new features. Fixed the persistent live 404 on /functions/* and route-locked.
- ROOT CAUSE: `functions` is a RESERVED directory name on Cloudflare Pages (its
  serverless Functions directory). The static export emits out/functions/, which
  Cloudflare intercepted — so /functions/ and /functions/FN_POLLINATION/ returned
  404 on the deployed site even though they build correctly. Other entity routes
  (/services, /threats, …) were unaffected because their names are not reserved.
- FIX: added public/_routes.json → copied to out/_routes.json on export:
  {"version":1,"include":["/*"],"exclude":["/*"]}. exclude takes precedence, so
  EVERY path (incl. /functions/*) is served as a static asset and no Cloudflare
  Pages Function is invoked. Pure static export; harmless if Functions weren't the
  cause. No URL/route renames — /functions stays the canonical Functions index.
- The /functions index (Ecological Functions, RegistryIndex, mirrors /services)
  and /functions/[id] (NodeIntelligence; FN_POLLINATION shows Food Production,
  Food System, Honey Bee, Pesticide pressure, Evidence) already existed and were
  preserved unchanged.
- Full link audit (homepage, /start, /decisions, Amazon, Honey Bee, footer, nav)
  against built output: ZERO broken links. All footer routes build (functions,
  services, threats, solutions, human-systems, missions, impact, actors,
  locations, sources).
- tsc clean; build green (173 pages); static export intact (output:"export",
  images unoptimized, out/, trailingSlash:true, _routes.json). All v1.4 Human Use
  Translation + all intelligence layers preserved. No Decision Engine claim added.

DEPLOY: redeploy this build. After deploy, /functions/ and /functions/FN_POLLINATION/
serve statically (the _routes.json stops the Cloudflare Functions interception).

NEXT: v1.5 — Second Deep Case: Pollination / Food System.
