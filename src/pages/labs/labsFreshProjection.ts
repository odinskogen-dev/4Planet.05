import {
  projects as baseProjects,
  earlyStageProjects as baseEarlyStageProjects,
  projectionState,
  recentSystemMoves as baseRecentSystemMoves,
  type LabProject as BaseLabProject,
} from "./labsProjection";

export type LabProject = BaseLabProject & {
  labStage?: "EARLY";
  projectId?: string;
  projectClass?: "PROJECT HOME" | "PRODUCT SURFACE" | "LAB / PROTOTYPE" | "UNIVERSE" | "SHARED SYSTEM";
};

export { projectionState };
export const verifiedAt = "20 AUG 2026";

const currentOverrides: Record<string, Partial<LabProject>> = {
  "4planet": {
    projectId: "SYS-P00-01",
    projectClass: "PROJECT HOME",
    now: "4PLANET is operating from the Founder-approved Strategy & Goal Cascade v4.0. The immediate system bottleneck is accepted public proof and conversion: the current ONE INTERFACE candidate has passed technical and rights QA and is waiting for Founder visual judgement. Capital remains pre-award, pre-contract and pre-cash.",
    next: "Judge the current public candidate, then move the same accepted artifact through controlled release while external proof, first money and first delivery continue in parallel.",
    freshness: "Founder Control + current GitHub reconciliation · 20 Aug 2026",
  },
  "4planet/product": {
    projectId: "SYS-P00-PRODUCT",
    projectClass: "PROJECT HOME",
    now: "The current public-product candidate is ONE INTERFACE PR #90. It has passed exact-head technical, browser, rights and source checks. Production is unchanged and Founder visual judgement is the remaining release gate.",
    next: "Open the current immutable preview, judge the experience, and only promote that same accepted artifact if the Founder gate closes.",
    freshness: "Founder Control + GitHub PR #90 · 20 Aug 2026",
  },
  "4planet/product/one-interface": {
    projectId: "SYS-P00-PRODUCT",
    projectClass: "PRODUCT SURFACE",
    now: "The current ONE INTERFACE release candidate is technically and rights-clean on its exact tested artifact. It combines the public navigation, About/Founder, M4GAZINE, a real shared-engine ATLAS showcase and connected Mission journeys. It is still a draft candidate, not production.",
    next: "Founder visual judgement on the current immutable preview. If accepted, release the same artifact only; if rejected, iterate without weakening truth, rights or accessibility gates.",
    freshness: "GitHub PR #90 + Founder Control · 20 Aug 2026",
    assets: [
      { label: "OPEN CURRENT PREVIEW", href: "https://80023f08.4planet-05.pages.dev", kind: "PREVIEW" },
      { label: "OPEN CURRENT PR #90", href: "https://github.com/odinskogen-dev/4Planet.05/pull/90", kind: "REPO" },
      { label: "4PLANET PRODUCTION", href: "https://4planet.org", kind: "WEB" },
    ],
  },
  "4planet/naturebrain": {
    projectId: "SYS-P00-TRUTH",
    projectClass: "PROJECT HOME",
    now: "NATUREBRAIN remains the shared science, evidence and source-federation layer. Planetary Map is the permanent world-description layer beneath Missions; public products and LABS are projections over the same truth spine, not competing truth stores.",
    next: "Close the highest-value identity, source, claim and projection seams while keeping uncertainty, provenance and correction visible everywhere they matter.",
    freshness: "Founder Control / BRAIN · 20 Aug 2026",
  },
  "4planet/capital": {
    projectId: "SYS-P00-CAPITAL",
    projectClass: "PROJECT HOME",
    now: "Global capital truth remains 15 historical verified submissions: 14 awaiting and 1 rejected. No award, contract or cash has been verified. Conversion, not inventory growth, is the constraint.",
    next: "Advance the strongest existing routes toward real award, contract or cash and keep every active/fundable Project Capital Plan tied to a real need, instrument, proof and ask.",
    freshness: "Founder Control / Capital roll-up · 20 Aug 2026",
  },
  "4planet/brand": {
    projectId: "SYS-P00-BRAND",
    projectClass: "PROJECT HOME",
    now: "Brand is active on the current public-experience line. The strongest current implementation is bundled into ONE INTERFACE PR #90; M4GAZINE, navigation, Founder story and living-world design are now materially stronger but remain Founder-gated before production.",
    next: "Judge and converge the current public candidate, then carry the accepted grammar into product, proof, capital and culture surfaces without creating a detached content machine.",
    freshness: "Founder Control + PR #90 · 20 Aug 2026",
  },
  "4planet/content": {
    projectClass: "SHARED SYSTEM",
    now: "Content remains downstream of verified proof, source packs and product journeys. M4GAZINE now has a substantive premium editorial candidate inside the current public-experience stack, but publication and rights gates remain separate.",
    next: "Turn the strongest verified proof and living-world stories into source-grounded editorial assets that send people back into useful 4PLANET experiences.",
    freshness: "Founder Control + PR #88/#90 · 20 Aug 2026",
  },
  "4planet/e4rth/species": {
    projectId: "EAR-SPECIES-01",
    projectClass: "PROJECT HOME",
    state: "ACTIVE",
    priority: "ACTIVE NOW / GOLD",
    now: "SPECIES is an active Gold project. Jaguar Habitat World is live and Jaguar/Orca remain the flagship reference pair. The current Jaguar Journey branch has materially advanced, but its latest exact-head gate failed in the Nature XR flat-browser runtime; it is therefore not accepted as Gold or release-ready yet.",
    next: "Fix the bounded XR/browser regression, rerun the exact same release chain, then continue Jaguar ↔ Orca shared-contract extraction only after a fully green artifact exists.",
    freshness: "Founder Control + GitHub PR #79 / gate #511 · 20 Aug 2026",
  },
  "4planet/s4piens/food": {
    projectId: "SAP-FOOD-01",
    projectClass: "PROJECT HOME",
    state: "ACTIVE",
    priority: "P0",
    now: "FOOD is the first bounded S4PIENS decision proof. PICK v0.8 has passed its dedicated prototype gate and remains private review. HEALTH, WALLET and PLANET stay separate; missing data cannot improve a recommendation. Real user and expert validation remain open.",
    next: "Run the bounded user/expert loop, correct what fails, and use the resulting evidence to decide what becomes reusable FOOD/S4PIENS product machinery.",
    freshness: "Founder Control + GitHub PR #85 · 20 Aug 2026",
  },
  "4planet/s4piens": {
    projectClass: "SHARED SYSTEM",
    now: "S4PIENS is the human-systems domain over the same Planet Model. FOOD is the first deep proof; the longer-term scope is all major human systems, built holistically at model level and sequentially at proof level. The current dedicated-domain surface still has unresolved host-routing acceptance.",
    next: "Keep FOOD as the Gold transfer case, close the host-routing defect separately, and grow the Human Systems coverage map without creating a second truth or map system.",
    freshness: "Strategy v4 + SAP-SAPIENS-01 + PR #81/#83 · 20 Aug 2026",
  },
  "4planet/oce4n/wh4les": { projectId: "OCE-WH4LES-01", projectClass: "PROJECT HOME", state: "ACTIVE", priority: "ACTIVE NOW" },
  "4planet/oce4n/cor4l": { projectId: "OCE-COR4L-01", projectClass: "PROJECT HOME", state: "QUEUED", priority: "MONITOR" },
  "4planet/oce4n/plastic-clean": { projectId: "OCE-PL4STIC-01", projectClass: "PROJECT HOME", state: "CONFLICT", priority: "FIRST DELIVERY PREP / NAME CONFLICT" },
  "4planet/oce4n/rewild-marine": { projectId: "OCE-REWILD-M-01", projectClass: "PROJECT HOME", state: "QUEUED", priority: "DEVELOP NEXT" },
  "4planet/e4rth/clim4te": { projectId: "EAR-CLIM4TE-01", projectClass: "PROJECT HOME", state: "QUEUED", priority: "DEVELOP NEXT" },
  "4planet/e4rth/am4zonia": { projectId: "EAR-AM4ZONIA-01", projectClass: "PROJECT HOME", state: "HOLD", priority: "HOLD" },
  "4planet/e4rth/rewild-land": { projectId: "EAR-REWILD-L-01", projectClass: "PROJECT HOME", state: "HOLD", priority: "HOLD → DEVELOP NEXT" },
  "4planet/s4piens/energy": { projectId: "SAP-EN3RGY-01", projectClass: "PROJECT HOME", state: "CONFLICT", priority: "MONITOR / NAME CONFLICT" },
  "4planet/s4piens/circular-city": { projectId: "SAP-CIRCULAR-01", projectClass: "PROJECT HOME", state: "QUEUED", priority: "DEVELOP NEXT" },
  "4planet/s4piens/f4shion": { projectId: "SAP-F4SHION-01", projectClass: "PROJECT HOME", state: "QUEUED", priority: "DEVELOP NEXT" },
  "4planet/4culture/m4gazine": { projectId: "CUL-M4GAZINE-01", projectClass: "PROJECT HOME", state: "ACTIVE", priority: "MAINTAIN + FUNDING" },
  "4planet/4culture/4film": { projectId: "CUL-4FILM-01", projectClass: "PROJECT HOME", state: "ACTIVE", priority: "MAINTAIN + FUNDING" },
  "4planet/4culture/4rt": { projectId: "CUL-4RT-01", projectClass: "PROJECT HOME", state: "QUEUED", priority: "MAINTAIN + FUNDING" },
  "4planet/4culture/4play": { projectId: "CUL-4PLAY-01", projectClass: "PROJECT HOME", state: "HOLD", priority: "HOLD" },
};

const extraProjects: LabProject[] = [
  {
    slug: "4planet/strategy", universe: "4PLANET", kind: "SYSTEM", parent: "4planet", projectId: "SYS-P00-STRAT", projectClass: "PROJECT HOME",
    title: "STRATEGY + GOALS", eyebrow: "PROJECT HOME / OPERATING SYSTEM", state: "ACTIVE", priority: "P0", accent: "brand",
    summary: "The locked goal cascade, project operating system and portfolio logic that keeps every material work item tied to a real outcome.",
    why: "Prevent task theatre, drift and disconnected projects by giving the whole organisation one explicit direction and evidence chain.",
    now: "Strategy & Goal Cascade v4.0 is Founder-approved current authority. GIGA, autonomy, portfolio coding, reality-board and plain-language mandates are active operating doctrine.",
    next: "Keep Project Homes, WBS, capital, evidence and current bottleneck aligned to v4 as new evidence changes priorities.",
    aiPlan: "Recover current authority first; re-rank from evidence; never create a parallel roadmap or goal system.", evidence: "Founder Control 00_GOALS + Project Pack", owner: "ODIN / AXE", authority: "FOUNDER LOCKED STRATEGY v4", freshness: "Founder Control · 20 Aug 2026",
  },
  {
    slug: "4planet/proof", universe: "4PLANET", kind: "SYSTEM", parent: "4planet", projectId: "SYS-P00-PROOF", projectClass: "PROJECT HOME",
    title: "EXTERNAL PROOF", eyebrow: "PROJECT HOME / USERS + SCIENCE", state: "ACTIVE", priority: "P0", accent: "research",
    summary: "Real users, expert challenge and correction loops that test whether 4PLANET is genuinely useful and trustworthy outside its own system.",
    why: "Internal quality gates cannot prove human usefulness, scientific credibility or adoption.",
    now: "The first external proof loop is prepared, but current controlled truth remains 0 completed real participants and 0 completed current external reviews. Wave A is bounded to eight user-test seats.",
    next: "After the accepted public proof gate, run the first bounded user and scientific-review cohorts and write corrections back into the same Project/BRAIN chain.",
    aiPlan: "Candidate → bounded cohort → observed evidence → correction → re-test; never count browser QA as human validation.", evidence: "Founder Control SYS-P00-PROOF", owner: "AXE / PROOF / R&I", authority: "FOUNDER CONTROL / PROOF", freshness: "Founder Control · 20 Aug 2026",
  },
  {
    slug: "4planet/company", universe: "4PLANET", kind: "SYSTEM", parent: "4planet", projectId: "SYS-P00-COMPANY", projectClass: "PROJECT HOME",
    title: "COMPANY + TRUST", eyebrow: "PROJECT HOME / LEGAL + IP + FINANCE", state: "ACTIVE", priority: "P0 ENABLER", accent: "capital",
    summary: "The company, legal, IP, finance, privacy and public-trust foundation required before 4PLANET scales money, data or external commitments.",
    why: "Public proof and capital are only useful if the legal/operator and trust foundations can safely carry them.",
    now: "Company + Digital Trust implementation exists in a draft, gated line. Core trust routes and first-party enquiry controls are technically prepared; production processor, environment and professional evidence gates remain separate.",
    next: "Close only the minimum evidence and environment gaps needed for safe public release and first transactions; do not overbuild administration.",
    aiPlan: "Evidence first, professional judgement where required, no silent legal/accounting claims.", evidence: "Founder Control SYS-P00-COMPANY + GitHub PR #38", owner: "AXE / COMPANY", authority: "COMPANY / LEGAL / FOUNDER", freshness: "Founder Control + PR #38 · 20 Aug 2026",
    assets: [{ label: "OPEN COMPANY + TRUST PR #38", href: "https://github.com/odinskogen-dev/4Planet.05/pull/38", kind: "REPO" }],
  },
  {
    slug: "4planet/relations", universe: "4PLANET", kind: "SYSTEM", parent: "4planet", projectId: "SYS-P00-REL", projectClass: "PROJECT HOME",
    title: "RELATIONSHIPS", eyebrow: "PROJECT HOME / CONVERSION", state: "ACTIVE", priority: "P1 → P0 AFTER RELEASE", accent: "field",
    summary: "The relationship and conversion engine linking proof to the right funders, partners, researchers, organisations, media and users.",
    why: "Useful work does not create impact if the right people never discover, trust or act on it.",
    now: "Relationship machinery, actor intelligence and async-first controls are prepared. Broad outbound activation remains gated by the public-proof and current outreach authority rules.",
    next: "Use current proof to run qualified, recipient-specific relationship paths with explicit value and measurable conversion learning.",
    aiPlan: "Right actor → right proof → right ask → async dialogue → measurable response → correction; no generic blast volume.", evidence: "Founder Control SYS-P00-REL + D22/M10", owner: "AXE / RELATIONS", authority: "RELATIONSHIP ENGINE / FOUNDER OUTBOUND RULES", freshness: "Founder Control · 20 Aug 2026",
  },
  {
    slug: "4planet/solutions", universe: "4PLANET", kind: "SYSTEM", parent: "4planet", projectId: "SYS-P00-SOLUTIONS", projectClass: "PROJECT HOME",
    title: "SOLUTIONS", eyebrow: "PROJECT HOME / SOLUTION ENGINE", state: "ACTIVE", priority: "P1", accent: "nature",
    summary: "A shared engine for finding, evaluating, connecting and accelerating strong existing solutions before 4PLANET builds anything itself.",
    why: "The mission is helped faster by strengthening what already works and only building for verified important gaps.",
    now: "The solution identity spine and decision-intelligence foundations exist. Current work is continuous compounding and transfer into active Projects rather than a new public app.",
    next: "Use active Mission/decision cases to improve solution evidence, actor connection, capital fit and transferability without turning relevance into claimed effectiveness.",
    aiPlan: "FIND → BACK / ACCELERATE / CONNECT → BUILD only for a verified gap.", evidence: "Founder Control SYS-P00-SOLUTIONS + Solution Engine authority", owner: "AXE / SOLUTIONS", authority: "BRAIN / SOLUTION INTELLIGENCE", freshness: "Founder Control · 20 Aug 2026",
  },
  {
    slug: "4planet/economy", universe: "4PLANET", kind: "SYSTEM", parent: "4planet", projectId: "SYS-P00-ECONOMY", projectClass: "PROJECT HOME",
    title: "ECONOMY_", eyebrow: "PROJECT HOME / ECONOMIC CONTROL", state: "BUILDING", priority: "P1", accent: "capital",
    summary: "A trustworthy economic nervous system across Projects, products and capital that keeps plan, pipeline, award, contract, accounting states and cash separate.",
    why: "4PLANET needs one clear economic picture before real money volume grows, without replacing the statutory ledger or inventing live finance data.",
    now: "ECONOMY_ v0.1 exists as a draft Founder-control prototype. All displayed prototype values remain DEMO / NOT LIVE; no bank or accounting source is connected yet. The current draft PR is open and unmerged.",
    next: "QA the current prototype, connect one bounded real source period, prove 100% reconciliation, then expose only a read-only Founder projection in LABS.",
    aiPlan: "Source period → map economic events → shared/unallocated pools → valid eliminations → 100% tie-out → freshness/coverage.", evidence: "Founder Control SYS-P00-ECONOMY + GitHub 4PLANET-05 PR #2", owner: "AXE / ECONOMY", authority: "FOUNDER CONTROL / STATUTORY SOURCES REMAIN EXTERNAL", freshness: "Founder Control + GitHub · 20 Aug 2026",
    assets: [{ label: "OPEN ECONOMY_ PR #2", href: "https://github.com/odinskogen-dev/4PLANET-05/pull/2", kind: "REPO" }],
  },
  {
    slug: "4planet/digital-pitch", universe: "4PLANET", kind: "LAB", parent: "4planet", projectId: "SYS-P00-DPITCH", projectClass: "PROJECT HOME",
    title: "DIGITAL PITCH", eyebrow: "PROJECT HOME / RECIPIENT EXPERIENCE", state: "BUILDING", priority: "P1", accent: "brand",
    summary: "Recipient-specific digital pitch experiences that let a funder or partner understand 4PLANET through a controlled, inspectable proof surface.",
    why: "A strong recipient experience can compress explanation and improve conversion without relying on long decks or generic outreach copy.",
    now: "Patagonia Gold v3 exists as a live branch-preview proof. Public or recipient use remains separately gated; the surface is evidence of product/pitch capability, not partnership.",
    next: "Use only on qualified recipient routes after current release/outreach gates and preserve recipient-specific truth and collision control.",
    aiPlan: "Recipient intelligence → bounded narrative → proof links → QA → release authority → response learning.", evidence: "Founder Control SYS-P00-DPITCH", owner: "AXE / CAPITAL / BRAND", authority: "FOUNDER CONTROL / RECIPIENT RELEASE", freshness: "Founder Control · 20 Aug 2026",
    assets: [{ label: "OPEN PATAGONIA GOLD PREVIEW", href: "https://proto-digital-pitch-pack-v1.4planet05.pages.dev/brands/patagonia", kind: "PREVIEW" }],
  },
  {
    slug: "4planet/labs-system", universe: "4PLANET", kind: "SYSTEM", parent: "4planet", projectId: "SYS-P00-LABS", projectClass: "PROJECT HOME",
    title: "LABS", eyebrow: "PROJECT HOME / DEVELOPMENT SURFACE", state: "ACTIVE", priority: "P1 / SURPLUS CAPACITY", accent: "brand",
    summary: "The safe public-development and Founder-control surface where bounded prototypes can compound without destabilising production or becoming a second source of truth.",
    why: "4PLANET needs a persistent place to build, compare and learn from real artifacts while production and BRAIN remain protected.",
    now: "LABS PR #54 is open, draft and unmerged. Its current branch head has already moved beyond the older v4.3 PR-body snapshot; this v5 pass is reconciling the interface again from current Founder Control and current code state.",
    next: "Make the interface genuinely useful: complete project coverage, human-first status, working links, goals/economics and exact mobile/browser QA before any release decision.",
    aiPlan: "BRAIN → read-only projection → browser QA → Founder use → correction; never let LABS become canonical operational truth.", evidence: "Founder Control SYS-P00-LABS + PR #54", owner: "AXE / LABS", authority: "BRAIN READ-ONLY PROJECTION", freshness: "Founder Control + GitHub · 20 Aug 2026",
    assets: [{ label: "OPEN LABS PR #54", href: "https://github.com/odinskogen-dev/4Planet.05/pull/54", kind: "REPO" }],
  },
  {
    slug: "4planet/product/organisations", universe: "4PLANET", kind: "LAB", parent: "4planet/product", projectClass: "LAB / PROTOTYPE", labStage: "EARLY",
    title: "ORGANISATIONS_", eyebrow: "PROTOTYPE TRACK / ACTOR INTELLIGENCE", state: "BUILDING", priority: "PORTFOLIO", accent: "research",
    summary: "Source-aware organisation discovery and Actor Mode over the shared ATLAS and actor intelligence spine.",
    why: "Actors are a critical coordination layer across research, solutions, delivery and capital, but organisation indexing must not imply partnership or endorsement.",
    now: "The current P17 lineage includes a private-beta ORGANISATIONS_ discovery surface and a planetary knowledge-institution/source graph. It remains draft development evidence rather than a production product category.",
    next: "Reuse the actor/source graph where active Projects need it and keep rights, identity and relationship meaning explicit before broader public promotion.",
    aiPlan: "Canonical actor identity → sourced claims → geography roles → ATLAS context → relationship use; no duplicate actor store.", evidence: "GitHub PR #21 + #28 / P17 controls", owner: "AXE / ACTORS", authority: "BRAIN / ACTOR INTELLIGENCE", freshness: "GitHub current open lineage · 20 Aug 2026",
    assets: [{ label: "OPEN ORGANISATIONS_ PR #21", href: "https://github.com/odinskogen-dev/4Planet.05/pull/21", kind: "REPO" }, { label: "OPEN KNOWLEDGE GRAPH PR #28", href: "https://github.com/odinskogen-dev/4Planet.05/pull/28", kind: "REPO" }],
  },
  {
    slug: "4planet/product/oslofjorden", universe: "4PLANET", kind: "LAB", parent: "4planet/product", projectClass: "LAB / PROTOTYPE", labStage: "EARLY",
    title: "OSLOFJORDEN", eyebrow: "REFERENCE BUILD / REAL PLACE", state: "BUILDING", priority: "REFERENCE", accent: "ocean",
    summary: "A source-bounded real-place product proof connecting place identity, life records, ATLAS/SPECIES context, source Watch and human-evidence tooling.",
    why: "A real local place tests whether the shared intelligence stack survives messy geometry, provenance, monitoring and human-use constraints.",
    now: "The current controlled Oslofjorden proof passed its internal product gate, but real human validation remains not run and several release-critical rights/source/security boundaries remain open.",
    next: "Use it as a reusable reference case; do not call it validated or production-ready until real participant and remaining release evidence closes.",
    aiPlan: "Place roles → source-bounded observations → shared product context → human test → correction.", evidence: "GitHub PR #32", owner: "AXE / PRODUCT / TRUTH", authority: "PLACE / BRAIN / PRODUCT PROOF", freshness: "Current PR evidence · 20 Aug 2026",
    assets: [{ label: "OPEN OSLOFJORDEN PR #32", href: "https://github.com/odinskogen-dev/4Planet.05/pull/32", kind: "REPO" }],
  },
  {
    slug: "4planet/naturebrain/decision-intelligence", universe: "4PLANET", kind: "LAB", parent: "4planet/naturebrain", projectClass: "LAB / PROTOTYPE", labStage: "EARLY",
    title: "DECISION INTELLIGENCE", eyebrow: "PROTOTYPE TRACK / DECISIONS", state: "BUILDING", priority: "P1", accent: "research",
    summary: "Evidence-bounded decision support over the shared BRAIN, Living Systems, ATLAS and solution spine, without hidden universal scoring.",
    why: "The value of intelligence increases when a real decision owner can compare options with provenance, uncertainty and context intact.",
    now: "The v3 decision-intelligence lineage has passed technical internal closure, but independent expert/user validation and production promotion remain open.",
    next: "Transfer only into bounded real decision-owner cases and keep evidence, judgement and observed outcomes separate.",
    aiPlan: "Question → options → evidence directions → uncertainty → decision context → observed outcome → learning.", evidence: "GitHub PR #34 + Founder Control", owner: "AXE / TRUTH / PRODUCT", authority: "BRAIN / DECISION INTELLIGENCE", freshness: "Current controlled lineage · 20 Aug 2026",
    assets: [{ label: "OPEN DECISION INTELLIGENCE PR #34", href: "https://github.com/odinskogen-dev/4Planet.05/pull/34", kind: "REPO" }],
  },
];

function mergeProject(project: LabProject): LabProject {
  const override = currentOverrides[project.slug];
  if (!override) return project;
  const merged = { ...project, ...override } as LabProject;
  if (override.assets) merged.assets = override.assets;
  return merged;
}

const existingSlugs = new Set(baseProjects.map((project) => project.slug));
export const projects: LabProject[] = [
  ...baseProjects.map((project) => mergeProject(project as LabProject)),
  ...extraProjects.filter((project) => !existingSlugs.has(project.slug)),
];

export function projectBySlug(slug: string): LabProject | undefined {
  return projects.find((project) => project.slug === slug);
}

export function childrenOf(slug: string): LabProject[] {
  return projects.filter((project) => project.parent === slug);
}

export function descendantsOf(slug: string): LabProject[] {
  const direct = childrenOf(slug);
  return direct.flatMap((project): LabProject[] => [project, ...descendantsOf(project.slug)]);
}

export const universeRoots = projects.filter((project) => project.kind === "ROOT");

const earlySlugs = new Set([
  ...baseEarlyStageProjects.map((project) => project.slug),
  ...extraProjects.filter((project) => project.labStage === "EARLY").map((project) => project.slug),
]);
export const earlyStageProjects = projects.filter((project) => earlySlugs.has(project.slug));

export const projectHomes = projects.filter((project) => project.universe === "4PLANET" && project.projectClass === "PROJECT HOME");
export const productSurfaces = projects.filter((project) => project.universe === "4PLANET" && project.projectClass === "PRODUCT SURFACE");
export const labTracks = projects.filter((project) => project.universe === "4PLANET" && (project.projectClass === "LAB / PROTOTYPE" || project.labStage === "EARLY"));

export const founderQueue = projects.flatMap((project) =>
  (project.founderDecisions ?? []).map((decision) => ({ slug: project.slug, project: project.title, decision })),
);

const activeStates = new Set(["ACTIVE", "BUILDING", "PUBLIC"]);
export const portfolioStats = {
  projectHomes: projectHomes.length,
  activeProjectHomes: projectHomes.filter((project) => activeStates.has(project.state)).length,
  labTracks: labTracks.length,
  founder: founderQueue.filter((item) => item.slug.startsWith("4planet")).length,
  conflicts: projects.filter((project) => project.universe === "4PLANET" && project.state === "CONFLICT").length,
};

export const recentSystemMoves: Array<readonly [string, string, string]> = [
  ["AUG20-PUBLIC", "Current ONE INTERFACE review candidate is PR #90; exact technical/rights gates passed and Founder visual judgement remains the release gate.", "CURRENT"],
  ["AUG20-ECON", "ECONOMY_ is now a canonical P1 shared Project Home with a draft v0.1 control-surface prototype; demo values are not live finance truth.", "CURRENT"],
  ["AUG20-LABS", "LABS is being reconciled from current Founder Control with complete Project Home coverage, human-first status, economics and working-link controls.", "CURRENT"],
  ["AUG20-SPECIES", "Jaguar Journey current exact head is not accepted: core Jaguar browser tests passed, Nature XR flat-browser runtime failed and later gates were skipped.", "GATED"],
  ...baseRecentSystemMoves,
];
