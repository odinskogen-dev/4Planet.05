import {
  projects as baseProjects,
  projectionState,
  verifiedAt,
  type LabProject as BaseLabProject,
} from "./labsData";

export type LabProject = BaseLabProject & {
  labStage?: "EARLY";
};

const overrides: Record<string, Partial<LabProject>> = {
  "4planet": {
    now: "ONE INTERFACE Slice 09 is the current open/draft product candidate with exact-head convergence CI green; production promotion remains separate. Seven bounded early-stage code/system projects are now tracked below. Capital truth is 15 historical submissions / 14 awaiting / 1 rejected / 0 secured or awarded / 0 cash.",
    next: "Protect production while closing public-product QA, first money, first verified delivery and the strongest isolated Gold/sandbox proofs in parallel.",
    freshness: "BRAIN + GitHub current-state reconciliation · 19 Aug 2026",
  },
  "4planet/naturebrain": {
    now: "BRAIN remains authoritative. Planetary Map is now established as a permanent underlying intelligence layer with bounded incubating build project SYS-P00-PMAP; LABS remains a read-only projection, not another truth store.",
    next: "Close shared identity/source/claim seams and mature Planetary Map without creating a competing ontology or map engine.",
    freshness: "Programme Log / Planetary Architecture recovery · 19 Aug 2026",
  },
  "4planet/capital": {
    now: "Canonical capital truth is 15 historical submissions / 14 awaiting / 1 rejected / 0 secured or awarded / 0 cash after the verified iF Social Impact Prize registration receipt. First-money conversion remains a hard operating gate.",
    evidence: "Current Capital authority / Founder Control / Active Engine / receipt-driven reconciliation",
    freshness: "Receipt-reconciled BRAIN projection · 19 Aug 2026",
    milestones: [
      { label: "Capital architecture + target systems built", done: true },
      { label: "15 historical submissions recorded", done: true },
      { label: "First external money", done: false },
    ],
  },
  "4planet/product": {
    now: "ONE INTERFACE PR #74 is open/draft at c3891a125eaafdf3b84ec54c12f52187040945e9 with exact-head Convergence Gate success. Isolated ATLAS, XR, Browser Journey, S4PIENS, Tree of Life and CHOICE branches are active evidence surfaces, not production releases.",
    next: "Keep ONE INTERFACE as the production path while extracting only proven reusable machinery from isolated Gold and sandbox projects after exact-head QA.",
    freshness: "GitHub specialist ingest + Product Gate Watch · 19 Aug 2026",
  },
  "4planet/product/one-interface": {
    now: "PR #74 / Slice 09 is OPEN / DRAFT / UNMERGED at c3891a125eaafdf3b84ec54c12f52187040945e9. Exact-head Convergence Gate succeeded. The last independently verified public production baseline remains 3364df8b5989582fbcbc31d1ff102ca5bb852954; runtime/visual QA and Founder release remain separate gates.",
    next: "Close remaining visual/runtime accessibility evidence and present the exact bounded candidate for Founder JUDGE without conflating CI-green with production.",
    evidence: "GitHub PR #74 / exact-head Convergence Gate / Product & Agent Gate Watch",
    freshness: "GitHub exact-head reconciliation · 19 Aug 2026",
    assets: [
      { label: "4PLANET production", href: "https://4planet.org", kind: "WEB" },
      { label: "ONE INTERFACE PR #74", href: "https://github.com/odinskogen-dev/4Planet.05/pull/74", kind: "REPO" },
    ],
  },
  "4planet/s4piens": {
    now: "S4PIENS now has a real Human Systems Atlas / FOOD Gold sandbox line. PR #81 is the current Gold candidate; Homo sapiens is the human-centred entry, FOOD is the first full chain, and shared ATLAS/GBIF/Climate TRACE infrastructure is reused rather than forked.",
    next: "Finish exact-head QA and use FOOD/Homo sapiens as the transfer proof for the reusable human-systems grammar before expanding breadth.",
    evidence: "SAP-SAPIENS-01 BRAIN backup / S4PIENS project control / GitHub PR #81",
    freshness: "BRAIN + GitHub reconciliation · 19 Aug 2026",
  },
  "4planet/s4piens/food": {
    now: "FOOD is now represented by two connected but distinct proof tracks: the organisational Everyday Protein Choice Gold loop and the cinematic S4PIENS HUMAN SYSTEMS ATLAS — FOOD_ Gold candidate. Neither is silently promoted to production.",
    next: "Close source/data binding and exact-head product QA, then transfer only the proven choice/story machinery into the shared product family.",
    evidence: "D12 FOOD Gold / FOOD-4 controls / GitHub PR #81",
    freshness: "BRAIN + specialist current-head reconciliation · 19 Aug 2026",
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
    summary: "Isolated source-expansion lab that adds real data layers to the canonical ATLAS runtime without creating another map product.",
    why: "Scale ATLAS data breadth safely while keeping source semantics, credentials, rights and production regression gates explicit.",
    now: "PR #72 is OPEN / DRAFT at 45cc2805c54edee9f27824e96c8714fa184a02a2. The branch reuses canonical ATLAS, carries an admitted-source registry, 16/16 bounded source probes and three EMODnet MAP_GREEN products. GFW remains AUTH_REQUIRED.",
    next: "Pass exact-head canonical-ATLAS browser/regression QA and promote only individually qualified layers.",
    aiPlan: "Probe → inspect provider metadata → integrate into existing layer registry → mobile/desktop visual QA → production-shaped regression → promotion decision.",
    evidence: "ATLAS Data Sandbox control record + GitHub PR #72",
    owner: "AXE / ATLAS",
    authority: "ATLAS / BRAIN / SANDBOX CONTROL",
    freshness: "GitHub PR metadata · 19 Aug 2026",
    assets: [{ label: "ATLAS Data Lab PR #72", href: "https://github.com/odinskogen-dev/4Planet.05/pull/72", kind: "REPO" }],
    tasks: [{ text: "Close exact-head canonical ATLAS regression/browser gate", owner: "AI", state: "ACTIVE" }],
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
    now: "PR #73 is OPEN / DRAFT at verified candidate 5d34acc60fad62cdab1da67433fd2421b045017c. Browser/WebXR proof and exact deployment passed; physical headset validation remains unverified.",
    next: "Preserve browser-first quality, close remaining cross-surface deduplication, then test real headset comfort and comprehension separately.",
    aiPlan: "Canonical truth → declarative scene → renderer → browser immersive → optional WebXR; fail closed on unsupported claims and missing device proof.",
    evidence: "Nature XR project control + GitHub PR #73",
    owner: "AXE / PRODUCT",
    authority: "SPECIES / LIVING SYSTEMS / XR LENS",
    freshness: "Verified PR candidate state · 19 Aug 2026",
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
    now: "PR #79 is OPEN / DRAFT at ccae670c2f8126dcea7a85cbf372ce34b778bc84. Gold interaction and progressive 3D study are implemented; exact-head acceptance remains pending.",
    next: "Close exact-head visual/browser acceptance and decide what journey machinery is reusable beyond Jaguar.",
    aiPlan: "Keep media/3D progressive, mobile LITE safe, ecological claims canonical and interaction evidence separate from scientific validation.",
    evidence: "GitHub PR #79 stacked on Nature XR",
    owner: "AXE / PRODUCT",
    authority: "SPECIES / BRAIN / BROWSER JOURNEY",
    freshness: "GitHub current head · 19 Aug 2026",
    assets: [{ label: "Jaguar Journey PR #79", href: "https://github.com/odinskogen-dev/4Planet.05/pull/79", kind: "REPO" }],
    tasks: [{ text: "Run exact-head Gold interaction browser/visual acceptance", owner: "AI", state: "ACTIVE" }],
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
    now: "PR #81 is OPEN / DRAFT at be3c57660e5c7a61ad4c2dd9268ca68ee32be59c. It uses shared ATLAS, Climate TRACE, NASA GIBS and GBIF; production and Gold acceptance are not inferred.",
    next: "Finish exact-head build/browser/truth QA and Founder JUDGE on the single persistent story-room direction.",
    aiPlan: "HUMAN → FOOD → EARTH → PRESSURE → LIFE → RESPONSE → OPEN, with source boundaries and shared product handoffs retained.",
    evidence: "S4PIENS Human Systems Atlas BRAIN records + GitHub PR #81",
    owner: "AXE / S4PIENS",
    authority: "S4PIENS / BRAIN / PRODUCT GATE",
    freshness: "GitHub current candidate · 19 Aug 2026",
    assets: [{ label: "S4PIENS FOOD Gold PR #81", href: "https://github.com/odinskogen-dev/4Planet.05/pull/81", kind: "REPO" }],
    tasks: [{ text: "Close exact-head Gold candidate QA without expanding the story chassis", owner: "AI", state: "ACTIVE" }],
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
    now: "PR #80 is OPEN / DRAFT at 434bcffc12cd0ae2f16482149a2f28abee4ae33e. Planetary Action and S4PIENS modes exist on an isolated noindex route; no new factual delivery or funding claims are introduced.",
    next: "Close exact-head visual/product QA and decide which map interactions deserve transfer into durable LABS/explanation surfaces.",
    aiPlan: "Treat the tree as a rendering of existing shared objects and loops, never as a parallel Actor/Capital/Impact truth system.",
    evidence: "Tree of Life Founder Decision & Build Record + GitHub PR #80",
    owner: "ODIN / AXE",
    authority: "BRAIN / LABS / FOUNDER",
    freshness: "BRAIN + GitHub reconciliation · 19 Aug 2026",
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
    now: "PR #82 is OPEN / DRAFT at 9032700ef9d6c420a364ea5df8a5ea919055b48e. It is stacked on Tree of Life; exact-head compile/build/browser QA is still unverified.",
    next: "Run exact-head QA and keep generic hypotheses fail-closed until named actors/solutions have real source support.",
    aiPlan: "Problem → solution → innovation → actor → capital → impact → proof; no hidden aggregate score and no fabricated funding relationship.",
    evidence: "Tree of Life / Solution / Capital candidate evidence + GitHub PR #82",
    owner: "AXE / CAPITAL / SOLUTIONS",
    authority: "LABS / BRAIN / CAPITAL CONTROL",
    freshness: "Programme Log + GitHub current head · 19 Aug 2026",
    assets: [{ label: "CHOICE PR #82", href: "https://github.com/odinskogen-dev/4Planet.05/pull/82", kind: "REPO" }],
    tasks: [{ text: "Run exact-head compile/build/browser QA", owner: "AI", state: "ACTIVE" }],
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
    now: "Planetary Map is established in current operating architecture; bounded project SYS-P00-PMAP is INCUBATING / INTERNAL P1 with PMAP-1..8 WBS and no competing master system.",
    next: "Materialise the minimum useful v1 layer through existing BRAIN/Living Planet Intelligence contracts and close the bounded build when complete.",
    aiPlan: "Use canonical place/life/pressure/source semantics and Project Factory; preserve permanent layer after the bounded build closes.",
    evidence: "17 Aug Planetary Architecture + Project Factory v2 convergence",
    owner: "AXE / BRAIN",
    authority: "BRAIN / PLANETARY ARCHITECTURE",
    freshness: "Programme Log recovery · 19 Aug 2026",
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

export { projectionState, verifiedAt };

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
  ["AUG19", "LABS reconciled against current BRAIN + active GitHub project heads", "SYNCED"],
  ["Q90-1", "ONE INTERFACE candidate CI green; production promotion remains separate", "ACTIVE"],
  ["EARLY", "ATLAS / XR / Journey / S4PIENS / Tree / CHOICE / Planetary Map surfaced", "7 TRACKS"],
  ["CAPITAL", "15 historical submissions / 14 awaiting / 1 rejected / 0 cash", "CURRENT"],
  ["LABS-7", "Safe automatic BRAIN projection adapter remains unconnected", "NEXT"],
] as const;
