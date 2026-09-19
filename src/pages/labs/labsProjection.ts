import {
  projects as baseProjects,
  projectionState,
  type LabProject as BaseLabProject,
} from "./labsData";

export type LabProject = BaseLabProject & {
  labStage?: "EARLY";
};

const overrides: Record<string, Partial<LabProject>> = {
  "4planet": {
    now: "Strategy & Goal Cascade v4.0 remains current authority. ONE INTERFACE Slice 09 is the current open/draft public-product line at exact head ad7f14e09d0f565a5d534605f76996d1eca2e3c3 with Convergence Gate #410 SUCCESS; production promotion remains separate. Eight bounded early-stage code/system tracks are projected below. Capital truth remains 15 historical submissions / 14 awaiting / 1 rejected / 0 secured or awarded / 0 cash.",
    next: "Protect production while closing public-product release evidence, first money, first verified delivery and the strongest isolated Gold/choice/data proofs in parallel.",
    freshness: "Current BRAIN + exact-head GitHub reconciliation · 20 Aug 2026",
  },
  "4planet/naturebrain": {
    now: "BRAIN remains authoritative. Planetary Map is established as a permanent underlying intelligence layer with bounded incubating build project SYS-P00-PMAP; LABS remains a read-only projection, not another truth store.",
    next: "Close shared identity/source/claim seams and mature Planetary Map without creating a competing ontology or map engine.",
    freshness: "Knowledge OS / Planetary Architecture recovery · reconciled 20 Aug 2026",
  },
  "4planet/capital": {
    now: "Canonical capital truth remains 15 historical submissions / 14 awaiting / 1 rejected / 0 secured or awarded / 0 cash after the verified iF Social Impact Prize registration receipt. First-money conversion remains a hard operating gate.",
    evidence: "Current Capital authority / Founder Control / receipt-driven reconciliation",
    freshness: "Current BRAIN readback · 20 Aug 2026",
    milestones: [
      { label: "Capital architecture + target systems built", done: true },
      { label: "15 historical submissions recorded", done: true },
      { label: "First external money", done: false },
    ],
  },
  "4planet/product": {
    now: "ONE INTERFACE PR #74 is OPEN / DRAFT / UNMERGED at ad7f14e09d0f565a5d534605f76996d1eca2e3c3 with exact-head Convergence Gate #410 SUCCESS. The previously recorded focus-visible defect is fixed in current-head source. ATLAS, XR, Browser Journey, S4PIENS, Tree of Life, CHOICE and PICK remain bounded development evidence surfaces, not production releases.",
    next: "Keep ONE INTERFACE as the controlled public-product path while extracting only proven reusable machinery from isolated Gold and sandbox projects after exact-head QA.",
    freshness: "BRAIN + exact-head GitHub readback · 20 Aug 2026",
  },
  "4planet/product/one-interface": {
    now: "PR #74 / Slice 09 is OPEN / DRAFT / UNMERGED at ad7f14e09d0f565a5d534605f76996d1eca2e3c3. Exact-head Convergence Gate #410 succeeded. Current-head source restores visible focus indicators on Mission World Bridge and Human Dependency links. CI/source acceptance does not by itself prove public production promotion.",
    next: "Keep the exact candidate bounded until release/runtime evidence and Founder JUDGE/RELEASE close; do not infer production from green CI.",
    evidence: "GitHub PR #74 / Convergence Gate #410 / exact-head source readback / Product Gate Watch",
    freshness: "Exact-head GitHub reconciliation · 20 Aug 2026",
    assets: [
      { label: "4PLANET production", href: "https://4planet.org", kind: "WEB" },
      { label: "ONE INTERFACE PR #74", href: "https://github.com/odinskogen-dev/4Planet.05/pull/74", kind: "REPO" },
    ],
  },
  "4planet/s4piens": {
    now: "S4PIENS uses the same repository, Planet Model, ATLAS engine, entity IDs and truth spine. PR #81 remains the FOOD Gold candidate. PR #83 adds a host-aware S4PIENS presentation surface at exact head 0dcc5268e0405ae78a4d27a41c155ef465be56d2, but its exact-head gate failed 42/44 smoke contracts on hostname-aware routing; no domain attachment, Gold promotion or production inference is allowed.",
    next: "Resolve the host-specific acceptance contract while proving 4planet.org invariance and S4PIENS-host behaviour; then rerun full exact-head browser/mobile/accessibility QA.",
    evidence: "SAP-SAPIENS-01 BRAIN control / GitHub PR #81 + PR #83 / Convergence Gate 32291738621",
    freshness: "BRAIN + exact-head GitHub reconciliation · 20 Aug 2026",
  },
  "4planet/s4piens/food": {
    now: "FOOD contains connected but distinct proof surfaces: the organisational Choice Intelligence loop, the S4PIENS Human Systems Atlas FOOD Gold candidate, and PICK v0.8 as a child implementation/economic object under existing SAP-FOOD-01 / CHOICE-V1. PICK is not a new Project Home. PR #85 exact head 7abd18e0a66992c339b1654d9f01dd540d3441ae passed P18 PICK Prototype Gate run 32310081759 and remains PRIVATE REVIEW / DRAFT / UNMERGED.",
    next: "Use PICK for bounded private user/decision proof while preserving HEALTH / WALLET / PLANET as separate evidence dimensions; do not promote missing price, product-level planet data or health uncertainty into a universal score.",
    evidence: "P18 FOOD project charter / Founder Control / SAP-FOOD-01 / GitHub PR #85",
    freshness: "Current BRAIN + exact-head GitHub readback · 20 Aug 2026",
  },
  "odin": {
    now: "ODIN uses an owner-only Life Control System with canonical recovery router, Master Control Register, Semantic Canon, Governance/Bridge Contract and Universal Operating Kernel / Project Factory. LABS exposes only public-safe structural state; private operational truth stays in ODIN OS.",
    next: "Use the established authority chain in real work, keep public/private bridges minimal, and improve the Founder control interface without copying private control-state into LABS.",
    evidence: "ODIN Life Control System Master Index v2.0 / Master Control Register / Universal Operating Kernel",
    freshness: "Public-safe ODIN reconciliation · 20 Aug 2026",
    milestones: [
      { label: "Owner-only canonical authority spine established", done: true },
      { label: "Universal Operating Kernel / Project Factory established", done: true },
      { label: "Private Founder interface matured", done: false },
    ],
  },
  "odin/brain": {
    now: "ODIN BRAIN is the durable semantic layer inside the owner-only system. 4PLANET BRAIN remains separate; only minimum-derived bridge classes are allowed.",
    next: "Strengthen bounded recovery and privacy while preserving one canonical owner for each important object and no silent bridge of sensitive content.",
    evidence: "ODIN Master Index v2.0 / Semantic Canon / Governance & Bridge Contract",
    freshness: "Public-safe ODIN reconciliation · 20 Aug 2026",
  },
  "odin/process-library": {
    state: "ACTIVE",
    now: "Process Library is a canonical live registry in the ODIN Master Control Register, paired with CASES and WBS under the Universal Operating Kernel; it is not a second task truth system.",
    next: "Populate it case-by-case from demonstrated repeatable processes; do not mass-migrate legacy material or duplicate task truth.",
    evidence: "ODIN Master Index v2.0 / Universal Operating Kernel / MCR live control surfaces",
    freshness: "Public-safe ODIN reconciliation · 20 Aug 2026",
    milestones: [
      { label: "Canonical Process Library surface exists", done: true },
      { label: "CASES + WBS live control surfaces exist", done: true },
      { label: "High-value repeatable processes progressively instantiated", done: false },
    ],
  },
  "odin/founder-os": {
    now: "Founder OS sits on top of the owner-only control spine. LABS is only a public development analogue; private Control Tower and current-state data are not projected here.",
    next: "Build a smaller private Founder interface over canonical current state with minimum founder burden and no duplicate operational register.",
    evidence: "ODIN Master Index v2.0 / Master Control Register / Founder Control doctrine",
    freshness: "Public-safe ODIN reconciliation · 20 Aug 2026",
  },
};

const freshProjects: LabProject[] = [
  {
    slug: "4planet/product/atlas-data-lab",
    universe: "4PLANET",
    kind: "LAB",
    parent: "4planet/product",
    labStage: "EARLY",
    title: "ATLAS DATA LAB",
    eyebrow: "EARLY STAGE / DATA SANDBOX",
    state: "BUILDING",
    priority: "SANDBOX",
    accent: "ocean",
    summary: "Isolated source-expansion lab that adds real data layers and multiscale cartography to canonical ATLAS without creating another map product.",
    why: "Scale ATLAS data breadth safely while keeping source semantics, credentials, rights and production regression gates explicit.",
    now: "PR #72 is OPEN / DRAFT at current head cd208fbee92598c90f5dbd3ab7677ea076d49b78. The branch still reuses canonical ATLAS; exact-head ONE INTERFACE and ATLAS Data Sandbox workflow runs on this head were CANCELLED, so current-head acceptance remains unresolved rather than inherited from older green heads.",
    next: "Rerun exact-head source/product/browser/mobile regression and promote only individually qualified layers or cartography changes.",
    aiPlan: "Probe → inspect provider metadata → integrate into existing layer registry → mobile/desktop visual QA → production-shaped regression → promotion decision.",
    evidence: "ATLAS Data Sandbox control + GitHub PR #72 / current-head workflow readback",
    owner: "AXE / ATLAS",
    authority: "ATLAS / BRAIN / SANDBOX CONTROL",
    freshness: "Exact-head GitHub reconciliation · 20 Aug 2026",
    assets: [{ label: "ATLAS Data Lab PR #72", href: "https://github.com/odinskogen-dev/4Planet.05/pull/72", kind: "REPO" }],
    tasks: [{ text: "Rerun exact-head ATLAS source + browser regression gate", owner: "AI", state: "ACTIVE" }],
  },
  {
    slug: "4planet/product/nature-xr",
    universe: "4PLANET",
    kind: "LAB",
    parent: "4planet/product",
    labStage: "EARLY",
    title: "NATURE XR",
    eyebrow: "EARLY STAGE / IMMERSIVE LENS",
    state: "BUILDING",
    priority: "GOLD LAB",
    accent: "nature",
    summary: "Browser-first immersive rendering lens over canonical SPECIES and Living Systems truth, with WebXR as progressive enhancement.",
    why: "Test whether spatial, cinematic interaction can improve understanding and felt relevance without creating a second ecological truth system.",
    now: "PR #73 remains OPEN / DRAFT at verified candidate 5d34acc60fad62cdab1da67433fd2421b045017c. Browser/WebXR development proof and exact deployment passed for that candidate; physical headset validation remains unverified.",
    next: "Preserve browser-first quality, close remaining cross-surface deduplication, then test real headset comfort and comprehension separately.",
    aiPlan: "Canonical truth → declarative scene → renderer → browser immersive → optional WebXR; fail closed on unsupported claims and missing device proof.",
    evidence: "Nature XR project control + GitHub PR #73",
    owner: "AXE / PRODUCT",
    authority: "SPECIES / LIVING SYSTEMS / XR LENS",
    freshness: "Current PR readback · 20 Aug 2026",
    assets: [
      { label: "Nature XR PR #73", href: "https://github.com/odinskogen-dev/4Planet.05/pull/73", kind: "REPO" },
      { label: "Jaguar XR development preview", href: "https://86609c96.4planet-05.pages.dev/xr/jaguar/", kind: "PREVIEW" },
    ],
    tasks: [{ text: "Validate physical headset path without treating browser QA as headset proof", owner: "MIXED", state: "NEXT" }],
  },
  {
    slug: "4planet/product/jaguar-journey",
    universe: "4PLANET",
    kind: "LAB",
    parent: "4planet/product",
    labStage: "EARLY",
    title: "JAGUAR JOURNEY",
    eyebrow: "EARLY STAGE / BROWSER JOURNEY",
    state: "BUILDING",
    priority: "GOLD LAB",
    accent: "nature",
    summary: "Multi-scene browser journey that turns Jaguar truth and relationships into an authored cinematic interaction path.",
    why: "Prove a richer journey surface that can travel from life → relationship → habitat → pressure → response while reusing canonical truth.",
    now: "PR #79 is OPEN / DRAFT at current head f1149bc5c305ebbc4d6605e86debaf6637950c2b. The Gold interaction and progressive 3D study advanced materially, but the current-head Convergence Gate run was CANCELLED; exact-head acceptance therefore remains unresolved.",
    next: "Rerun exact-head visual/browser acceptance before any reusable journey machinery or Gold status is promoted beyond the sandbox.",
    aiPlan: "Keep media/3D progressive, mobile LITE safe, ecological claims canonical and interaction evidence separate from scientific validation.",
    evidence: "GitHub PR #79 / current-head workflow readback",
    owner: "AXE / PRODUCT",
    authority: "SPECIES / BRAIN / BROWSER JOURNEY",
    freshness: "Exact-head GitHub reconciliation · 20 Aug 2026",
    assets: [{ label: "Jaguar Journey PR #79", href: "https://github.com/odinskogen-dev/4Planet.05/pull/79", kind: "REPO" }],
    tasks: [{ text: "Rerun exact-head Gold interaction browser/visual acceptance", owner: "AI", state: "ACTIVE" }],
  },
  {
    slug: "4planet/s4piens/food-gold-lab",
    universe: "4PLANET",
    kind: "LAB",
    parent: "4planet/s4piens",
    labStage: "EARLY",
    title: "S4PIENS / FOOD GOLD",
    eyebrow: "EARLY STAGE / HUMAN SYSTEMS ATLAS",
    state: "BUILDING",
    priority: "GOLD LAB",
    accent: "sapiens",
    summary: "Homo sapiens-centred Human Systems Atlas where FOOD is the first cinematic Gold chain into Earth, pressure, life and response.",
    why: "Make human dependence and human pressure understandable through one high-quality reusable story grammar instead of another disconnected dashboard.",
    now: "PR #81 remains OPEN / DRAFT / UNMERGED at be3c57660e5c7a61ad4c2dd9268ca68ee32be59c. It reuses shared ATLAS, Climate TRACE, NASA GIBS and GBIF. PR #83 is a separate host-aware presentation layer and currently fails its route-contract gate; neither state is a production or Gold acceptance claim.",
    next: "Keep the Gold story chassis bounded, close exact-head truth/browser QA, then resolve host-aware deployment contracts separately.",
    aiPlan: "HUMAN → FOOD → EARTH → PRESSURE → LIFE → RESPONSE → OPEN, with source boundaries and shared product handoffs retained.",
    evidence: "S4PIENS Human Systems Atlas BRAIN records + GitHub PR #81 / PR #83",
    owner: "AXE / S4PIENS",
    authority: "S4PIENS / BRAIN / PRODUCT GATE",
    freshness: "BRAIN + GitHub reconciliation · 20 Aug 2026",
    assets: [
      { label: "S4PIENS FOOD Gold PR #81", href: "https://github.com/odinskogen-dev/4Planet.05/pull/81", kind: "REPO" },
      { label: "S4PIENS domain surface PR #83", href: "https://github.com/odinskogen-dev/4Planet.05/pull/83", kind: "REPO" },
    ],
    tasks: [{ text: "Close Gold candidate QA and keep domain-surface routing as a separate gate", owner: "AI", state: "ACTIVE" }],
  },
  {
    slug: "4planet/s4piens/food/pick",
    universe: "4PLANET",
    kind: "LAB",
    parent: "4planet/s4piens/food",
    labStage: "EARLY",
    title: "PICK_",
    eyebrow: "EARLY STAGE / FOOD CHOICE CHILD PROTOTYPE",
    state: "BUILDING",
    priority: "PRIVATE PROTOTYPE",
    accent: "sapiens",
    summary: "Mobile-first FOOD choice prototype that keeps HEALTH, WALLET and PLANET as separate evidence engines over the existing FOOD project.",
    why: "Prove that everyday product choice can become more useful without inventing a universal score or turning missing price, health or environmental evidence into false certainty.",
    now: "PICK v0.8 is PR #85, OPEN / DRAFT / UNMERGED / MERGEABLE at exact head 7abd18e0a66992c339b1654d9f01dd540d3441ae. Dedicated P18 PICK Prototype Gate run 32310081759 completed SUCCESS. Founder Control classifies PICK as an implementation/economic child under SAP-FOOD-01 / CHOICE-V1, not a new Project Home. It remains PRIVATE REVIEW only.",
    next: "Run bounded private user/decision proof and improve real-shop evidence coverage while preserving missing/stale-data penalties and physical-label authority for allergen safety.",
    aiPlan: "Product facts → evidence ledger → separate HEALTH / WALLET / PLANET interpretation → fair alternatives → basket/household action; no universal score and no missing-data advantage.",
    evidence: "P18 FOOD project charter / Founder Control / GitHub PR #85 / P18 PICK Prototype Gate",
    owner: "AXE / S4PIENS / FOOD",
    authority: "SAP-FOOD-01 / CHOICE-V1 / P18 CONTROL",
    freshness: "BRAIN + exact-head GitHub readback · 20 Aug 2026",
    assets: [{ label: "PICK v0.8 PR #85", href: "https://github.com/odinskogen-dev/4Planet.05/pull/85", kind: "REPO" }],
    tasks: [{ text: "Run bounded private user/decision proof without collapsing the three evidence axes", owner: "AI", state: "NEXT" }],
  },
  {
    slug: "4planet/tree-of-life",
    universe: "4PLANET",
    kind: "LAB",
    parent: "4planet",
    labStage: "EARLY",
    title: "TREE OF LIFE",
    eyebrow: "EARLY STAGE / SYSTEM MAP",
    state: "BUILDING",
    priority: "FOUNDER LAB",
    accent: "brand",
    summary: "Interactive Yggdrasil-inspired system map for explaining how 4PLANET truth, living systems, solutions, actors, capital, impact and learning connect.",
    why: "Make the whole 4PLANET machine legible for Founder thinking, meetings and capital without turning the metaphor into a new product architecture.",
    now: "PR #80 remains OPEN / DRAFT at 434bcffc12cd0ae2f16482149a2f28abee4ae33e. Planetary Action and S4PIENS modes exist on an isolated noindex route; no new factual delivery or funding claims are introduced.",
    next: "Close exact-head visual/product QA and decide which map interactions deserve transfer into durable LABS/explanation surfaces.",
    aiPlan: "Treat the tree as a rendering of existing shared objects and loops, never as a parallel Actor/Capital/Impact truth system.",
    evidence: "Tree of Life Founder Decision & Build Record + GitHub PR #80",
    owner: "ODIN / AXE",
    authority: "BRAIN / LABS / FOUNDER",
    freshness: "Current PR readback · 20 Aug 2026",
    assets: [{ label: "Tree of Life PR #80", href: "https://github.com/odinskogen-dev/4Planet.05/pull/80", kind: "REPO" }],
    tasks: [{ text: "Audit system-map clarity and architecture boundaries", owner: "AI", state: "ACTIVE" }],
  },
  {
    slug: "4planet/choice-lab",
    universe: "4PLANET",
    kind: "LAB",
    parent: "4planet",
    labStage: "EARLY",
    title: "CHOICE",
    eyebrow: "EARLY STAGE / INNOVATION × CAPITAL",
    state: "EXPERIMENT",
    priority: "SANDBOX",
    accent: "capital",
    summary: "Decision-intelligence sandbox linking problem, solution, innovation, actors, capital, impact and proof without an opaque universal score.",
    why: "Test whether 4PLANET can make solution/capital choices more explainable while keeping hypotheses and evidence visibly separate.",
    now: "PR #82 has moved to current head 946041d04beaf5db86ad317f854b7986d731b694 and remains OPEN / DRAFT / UNMERGED / MERGEABLE. No workflow run was found for this exact head. The latest BRAIN truth audit on the preceding audited head found unsupported real-world maturity labels; the current head is therefore NOT presumed fixed or QA-passed without new evidence.",
    next: "Prove readiness/maturity semantics are evidence-bound or explicitly DEMO / HYPOTHESIS / UNKNOWN, then run exact-head compile/build/browser QA.",
    aiPlan: "Problem → solution → innovation → actor → capital → impact → proof; no hidden aggregate score, fabricated funding relationship or unsupported maturity label.",
    evidence: "BRAIN maturity-label audit + GitHub PR #82 current-head readback",
    owner: "AXE / CAPITAL / SOLUTIONS",
    authority: "LABS / BRAIN / CAPITAL CONTROL",
    freshness: "BRAIN + exact-head GitHub reconciliation · 20 Aug 2026",
    assets: [{ label: "CHOICE PR #82", href: "https://github.com/odinskogen-dev/4Planet.05/pull/82", kind: "REPO" }],
    tasks: [{ text: "Close maturity-label truth defect and exact-head QA", owner: "AI", state: "ACTIVE" }],
  },
  {
    slug: "4planet/naturebrain/planetary-map",
    universe: "4PLANET",
    kind: "LAB",
    parent: "4planet/naturebrain",
    labStage: "EARLY",
    title: "PLANETARY MAP",
    eyebrow: "EARLY STAGE / PERMANENT INTELLIGENCE LAYER",
    state: "EXPERIMENT",
    priority: "INTERNAL P1",
    accent: "nature",
    summary: "Permanent scientific/world-description layer beneath Missions, with a bounded build project rather than a new public product.",
    why: "Separate describing the world from choosing where 4PLANET acts, so Missions never become the planet's scientific taxonomy.",
    now: "Planetary Map remains established in current operating architecture; bounded project SYS-P00-PMAP is INCUBATING / INTERNAL P1 with PMAP-1..8 WBS and no competing master system.",
    next: "Materialise the minimum useful v1 layer through existing BRAIN/Living Planet Intelligence contracts and close the bounded build when complete.",
    aiPlan: "Use canonical place/life/pressure/source semantics and Project Factory; preserve permanent layer after the bounded build closes.",
    evidence: "Planetary Architecture + Project Factory v2 convergence",
    owner: "AXE / BRAIN",
    authority: "BRAIN / PLANETARY ARCHITECTURE",
    freshness: "Current Knowledge OS reconciliation · 20 Aug 2026",
    tasks: [{ text: "Advance PMAP bounded WBS without parallel ontology", owner: "AI", state: "NEXT" }],
  },
];

function applyOverride(project: BaseLabProject): LabProject {
  return { ...project, ...(overrides[project.slug] ?? {}) } as LabProject;
}

export const projects: LabProject[] = [
  ...baseProjects.map(applyOverride),
  ...freshProjects,
];

export { projectionState };
export const verifiedAt = "20 AUG 2026";

export const projectBySlug = (slug: string) => projects.find((project) => project.slug === slug);
export const childrenOf = (slug: string) => projects.filter((project) => project.parent === slug);
export const descendantsOf = (slug: string) => projects.filter((project) => project.slug.startsWith(`${slug}/`));

export const universeRoots = ["4planet", "odin", "p4nther", "sandbox"]
  .map((slug) => projectBySlug(slug))
  .filter((project): project is LabProject => Boolean(project));

export const founderQueue = projects.flatMap((project) =>
  (project.founderDecisions ?? []).map((decision) => ({ slug: project.slug, project: project.title, decision })),
);

export const portfolioStats = {
  active: projects.filter((project) => ["ACTIVE", "BUILDING", "PUBLIC"].includes(project.state)).length,
  founder: founderQueue.length,
  aiActive: projects.flatMap((project) => project.tasks ?? []).filter((task) => task.owner !== "FOUNDER" && ["ACTIVE", "NEXT"].includes(task.state)).length,
  queued: projects.filter((project) => ["QUEUED", "EXPERIMENT", "HOLD"].includes(project.state)).length,
  conflicts: projects.filter((project) => project.state === "CONFLICT").length,
};

export const earlyStageProjects = projects.filter((project) => project.labStage === "EARLY");

export const recentSystemMoves = [
  ["AUG20", "LABS reconciled against current BRAIN + exact-head GitHub project state", "SYNCED"],
  ["Q90-1", "ONE INTERFACE current head exact-gate green; production promotion remains separate", "ACTIVE"],
  ["PICK", "PICK v0.8 exact-head prototype gate green; FOOD child object, not new Project Home", "PRIVATE"],
  ["S4PIENS", "Host-aware domain surface exact-head contract gate failed; no promotion", "GATED"],
  ["EARLY", "ATLAS / XR / Journey / S4PIENS / PICK / Tree / CHOICE / Planetary Map surfaced", "8 TRACKS"],
  ["CAPITAL", "15 historical submissions / 14 awaiting / 1 rejected / 0 cash", "CURRENT"],
  ["LABS-7", "Safe automatic BRAIN projection adapter remains unconnected", "NEXT"],
] as const;
