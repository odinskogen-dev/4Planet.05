export type LabState = "ACTIVE" | "BUILDING" | "QUEUED" | "HOLD" | "EXPERIMENT" | "PUBLIC";

export type LabProject = {
  slug: string;
  eyebrow: string;
  title: string;
  state: LabState;
  priority: string;
  summary: string;
  why: string;
  now: string;
  next: string;
  evidence: string;
  owner: string;
  authority: string;
  externalUrl?: string;
  parent?: string;
};

export const verifiedAt = "18 AUG 2026";
export const projectionState = "MANUAL BRAIN PROJECTION · READ ONLY";

export const projects: LabProject[] = [
  {
    slug: "4planet",
    eyebrow: "CORE PROJECT / ORGANISATION",
    title: "4PLANET",
    state: "ACTIVE",
    priority: "P0",
    summary: "Living Planet Intelligence — the integrated system connecting truth, understanding, action and proof.",
    why: "Build the world's most useful integrated intelligence, coordination and action infrastructure for a living planet.",
    now: "Public product proof, canonical truth convergence, Gold References, users/science and first money move in parallel.",
    next: "Strengthen the public proof while the shared semantic core, release system and capital conversion mature underneath it.",
    evidence: "Strategy & Goal Cascade v4.0 · D13–D17 · current Founder Control / WBS",
    owner: "ODIN / AXE",
    authority: "BRAIN / FOUNDER CONTROL",
    externalUrl: "https://4planet.org",
  },
  {
    slug: "founder-control",
    eyebrow: "HUMAN CONTROL INTERFACE",
    title: "FOUNDER CONTROL",
    state: "BUILDING",
    priority: "P1 LAB",
    summary: "A human-readable control surface for goals, projects, proof, money, learning and the smallest set of Founder-only actions.",
    why: "Make the organisation inspectable without turning chats into the operating system.",
    now: "Information architecture and safe public/private projection boundary are being defined through the LABS shell.",
    next: "Connect a read-only BRAIN projection after field allowlists, freshness semantics and access control are proven.",
    evidence: "D17 · LABS-5 · LABS-7 · BRAIN-13",
    owner: "AXE / BRAIN",
    authority: "FOUNDER CONTROL / BRAIN",
  },
  {
    slug: "4planet-university",
    eyebrow: "LEARNING EXPERIMENT",
    title: "4PLANET UNIVERSITY",
    state: "QUEUED",
    priority: "LAB QUEUE",
    summary: "Source-linked learning paths for understanding life, living systems and planetary action.",
    why: "Test whether the same truth core can become a compelling learning product without creating a parallel knowledge system.",
    now: "Concept retained. No active build is displacing current product, proof or capital work.",
    next: "Define one tiny learning journey against an already mature Gold Reference before expanding scope.",
    evidence: "D16 idea intake · LABS-2/3",
    owner: "AXE / PRODUCT",
    authority: "LABS / PROJECT FACTORY",
  },
  {
    slug: "food-app",
    eyebrow: "DECISION INTERFACE EXPERIMENT",
    title: "FOOD APP",
    state: "QUEUED",
    priority: "AFTER FOOD GOLD",
    summary: "A bounded interactive expression of the Everyday Protein Choice reference — no fake green score and no medical advice.",
    why: "Test whether decision-grade FOOD intelligence can become an actually useful everyday interface.",
    now: "Waiting for the underlying FOOD Gold loop to become strong enough to deserve a product expression.",
    next: "Prototype only after evidence, choice framing and limitations are stable enough to survive user/expert challenge.",
    evidence: "D12 FOOD Gold Reference · D16 LABS",
    owner: "AXE / FOOD",
    authority: "FOOD PROJECT / BRAIN",
  },
  {
    slug: "nature-game",
    eyebrow: "WILD LAB",
    title: "NATURE GAME",
    state: "EXPERIMENT",
    priority: "SURPLUS CAPACITY",
    summary: "A deliberately playful prototype where ecological relationships can be explored without confusing simulation with observed truth.",
    why: "Keep room for strange ideas with asymmetric learning or cultural upside.",
    now: "Idea retained, not active P0 work.",
    next: "Build the smallest playable ecological relationship mechanic when surplus capacity is real.",
    evidence: "D16 idea intake · LABS-3",
    owner: "AXE / 4CULTURE",
    authority: "LABS / PROJECT FACTORY",
  },
  {
    slug: "4planet/one-interface",
    parent: "4planet",
    eyebrow: "PUBLIC INTEGRATION",
    title: "ONE INTERFACE",
    state: "PUBLIC",
    priority: "P0",
    summary: "The coherent public 4PLANET experience that brings the product family together.",
    why: "Give a real visitor one credible front door instead of a collection of disconnected prototypes.",
    now: "Current accepted public baseline remains protected while LABS evolves separately.",
    next: "Keep improving through bounded exact-SHA candidates; no ground-up rewrite.",
    evidence: "Current production lineage / release controls",
    owner: "AXE / PRODUCT",
    authority: "PRODUCT CANON / RELEASE",
    externalUrl: "https://4planet.org",
  },
  {
    slug: "4planet/atlas",
    parent: "4planet",
    eyebrow: "PUBLIC PRODUCT",
    title: "ATLAS",
    state: "ACTIVE",
    priority: "P0",
    summary: "Spatial interface for records, observations, signals, places, species and living-system context.",
    why: "Let people see where living-planet intelligence exists without collapsing source, place or time semantics.",
    now: "Shared identity, context preservation and Gold Reference integration remain the high-value seam.",
    next: "Deepen Jaguar/Orca and reusable ATLAS Window integration on the shared core.",
    evidence: "D13 Gold doctrine · current ATLAS product authority",
    owner: "AXE / CODEX",
    authority: "ATLAS / BRAIN",
    externalUrl: "https://4planet.org/atlas",
  },
  {
    slug: "4planet/species",
    parent: "4planet",
    eyebrow: "PUBLIC PRODUCT",
    title: "SPECIES",
    state: "ACTIVE",
    priority: "P0",
    summary: "Discover, understand and care about life on Earth — with evidence always available.",
    why: "Create the most compelling public doorway into species, relationships, places and living systems without becoming an AI-guess encyclopedia.",
    now: "Jaguar and Orca are Product Gold References; transferability and shared machinery matter more than feature count.",
    next: "Close shared Gold contracts, then prove an unlike-species transfer test.",
    evidence: "SPECIES Canon · D13 · SPEC-11/12",
    owner: "AXE / PRODUCT",
    authority: "SPECIES / BRAIN",
    externalUrl: "https://4planet.org/species",
  },
  {
    slug: "4planet/living-systems",
    parent: "4planet",
    eyebrow: "SHARED INTELLIGENCE ENGINE",
    title: "LIVING SYSTEMS",
    state: "ACTIVE",
    priority: "P0/P1",
    summary: "Relationship and dependency intelligence: what depends on what, what functions matter and where evidence is incomplete.",
    why: "Turn isolated records into system understanding while preserving uncertainty and provenance.",
    now: "The shared engine is being converged with the same canonical identity/claim/source contracts as ATLAS and SPECIES.",
    next: "Strengthen source-linked decision-grade relationships and product projections rather than create a separate app stack.",
    evidence: "D13 ONE CORE doctrine · current Living Systems authority",
    owner: "AXE / TRUTH",
    authority: "BRAIN / LIVING SYSTEMS",
    externalUrl: "https://4planet.org/living-systems",
  },
  {
    slug: "4planet/impact",
    parent: "4planet",
    eyebrow: "PUBLIC ACTION PRODUCT",
    title: "IMPACT",
    state: "ACTIVE",
    priority: "P0/P1",
    summary: "Action and proof layer that keeps contribution, delivery, outcome and impact explicitly separate.",
    why: "Make credible action easier without pretending payment or participation automatically equals ecological impact.",
    now: "First operator/method/economics/proof/delivery pathway is being matured in parallel with the public system.",
    next: "Close one qualified operator and one financed/paid pilot path with auditable proof states.",
    evidence: "Goal v4 · D13 · current IMPACT/business-model authority",
    owner: "AXE / IMPACT",
    authority: "IMPACT / BRAIN",
    externalUrl: "https://4planet.org/impact",
  },
];

export const fourPlanetChildren = projects.filter((project) => project.parent === "4planet");

export const recentSystemMoves = [
  ["D17", "LABS + Project Overview separated but connected", "LOCKED"],
  ["BRAIN-13", "AXE fresh-context recovery guard", "ACTIVE"],
  ["LABS-5", "Human Project OS / 4PLANET Overview", "BUILDING"],
  ["LABS-7", "Safe BRAIN projection adapter", "NEXT"],
  ["TRUTH-10", "Source authority + corroboration policy", "ACTIVE"],
] as const;

export const roadmap = [
  {
    label: "NOW",
    title: "BUILD + PROVE + FUND",
    text: "Public proof, semantic core, Gold References, users/science and first money move together.",
  },
  {
    label: "NEXT",
    title: "CONNECT THE MACHINE",
    text: "One trustworthy chain from intelligence → useful decision → expert correction → solution/actor → capital → delivery.",
  },
  {
    label: "LATER",
    title: "TRANSFER + SCALE",
    text: "Repeat the proven shared machinery across species, missions, places and new interfaces without multiplying truth systems.",
  },
] as const;
