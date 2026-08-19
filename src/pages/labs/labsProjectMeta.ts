import type { LabProject } from "./labsProjection";
import type { ProjectAsset } from "./labsData";

export type ProjectGoalMeta = {
  goal: string;
  success?: string;
  source: string;
};

export type PrototypeMeta = {
  label: string;
  href: string;
  state: "LIVE" | "PREVIEW" | "PROTOTYPE" | "REFERENCE";
  source: string;
  verified: string;
};

const goalMeta: Record<string, ProjectGoalMeta> = {
  "4planet": {
    goal: "Complete and finance the shared 4PLANET product, truth, organisation, capital and proof foundation so the organisation can move from build to external proof and money.",
    success: "Accepted integrated public product + current company/trust evidence + fundable transaction surface + first external proof/money path.",
    source: "Project Portfolio / Strategy & Goal Cascade v4",
  },
  "4planet/naturebrain": {
    goal: "Make one durable, source-aware planetary truth layer reusable across every 4PLANET product, Mission and decision surface without parallel truth systems.",
    success: "Canonical identity/source/claim/relation contracts are recoverable, conflict-aware and safely projected into products and LABS.",
    source: "D13 ONE CORE / TRUTH / NATUREBRAIN authority",
  },
  "4planet/brand": {
    goal: "Make every high-value 4PLANET surface feel unmistakably one premium brand while preserving the functional identity of each product and Mission.",
    success: "ONE INTERFACE, LABS and Gold References share approved brand grammar with strong readability, accessibility and no decorative noise penalty.",
    source: "Brand OS / premium brand controls",
  },
  "4planet/content": {
    goal: "Turn verified 4PLANET intelligence and proof into distinctive source-grounded stories, editorial and media assets that increase understanding, trust and participation.",
    success: "Reusable source packs → audited stories/assets → Founder-approved public outputs with meaningful audience/media learning.",
    source: "Human Voice / M4GAZINE / Media authority",
  },
  "4planet/capital": {
    goal: "Secure first external money and build a diversified good-capital runway for the strongest active 4PLANET projects without sacrificing mission, control or IP.",
    success: "Q90 hard gate: first money; target ≥ NOK 1.5m secured/awarded/contracted/received, stretch ≥ NOK 3m, with multiple independent routes.",
    source: "Goal v4 / Capital authority",
  },
  "4planet/product": {
    goal: "Make ONE INTERFACE, ATLAS, SPECIES, LIVING SYSTEMS and IMPACT a coherent world-class product family on one canonical core.",
    success: "Premium public proof + reusable Gold machinery + observed user/expert evidence + no semantic fork between products.",
    source: "D13 Product Gold doctrine / Q90-1",
  },
  "4planet/research": {
    goal: "Make scientific/source challenge a production input so material 4PLANET claims, relations and interventions survive independent scrutiny.",
    success: "≥5 substantive expert/scientific reviews in 90 days plus source-linked corrections propagated into the system.",
    source: "Goal v4 / Research x100 / TRUTH-10",
  },
  "4planet/field-partners": {
    goal: "Close one credible qualified operator → method → economics → proof → delivery chain for a financed or paid 4PLANET pilot.",
    success: "At least one qualified operator and one financed/paid pilot path with auditable delivery/proof states.",
    source: "Goal v4 Q90-4 / IMPACT authority",
  },
  "4planet/4mbassadors": {
    goal: "Convert the strongest ambassador relationships from qualified names into real high-value connection, contribution or collaboration without transactional influencer theatre.",
    success: "FIRST x10 have clear SEND/HOLD/KILL routes, verified contact/warm paths and bespoke asks; only real relationship movement counts.",
    source: "4MBASSADORS x100 / relationship conversion authority",
  },
  "4planet/product/one-interface": {
    goal: "Ship the strongest truthful premium 4PLANET public front door as an exact, auditable Founder-release candidate without ground-up rewrite.",
    success: "Recipient-ready candidate passes runtime/visual/accessibility/truth gates and the accepted artifact can be promoted unchanged.",
    source: "Q90-1 / ONE INTERFACE release authority",
  },
  "4planet/product/atlas": {
    goal: "Make ATLAS a reliable source-aware spatial intelligence canvas that can scale data, time, species, places and journeys without losing provenance or context.",
    success: "Stable admitted layers + truthful failure/zero semantics + reusable entity context/ATLAS Window + desktop/mobile proof.",
    source: "ATLAS current authority / Product Gate Watch",
  },
  "4planet/product/living-systems": {
    goal: "Turn isolated facts into decision-grade relationship intelligence while preserving evidence, uncertainty and provenance.",
    success: "Source-linked dependency/pressure/response relations power at least one complete Gold journey and transfer correctly across consumers.",
    source: "D13 / Living Systems authority",
  },
  "4planet/product/impact": {
    goal: "Make credible action easy while keeping contribution, delivery, outcome and impact explicitly separate.",
    success: "One qualified operator + transparent economics/method/reporting + financed/paid pilot + auditable proof states.",
    source: "Goal v4 Q90-4 / IMPACT authority",
  },
  "4planet/oce4n": {
    goal: "Make the living ocean a coherent operational domain where marine Missions reuse the same truth, product, solution and delivery infrastructure.",
    success: "WH4LES flagship proof advances and at least one marine delivery route is evidence-backed without duplicating system architecture.",
    source: "4PLANET Mission architecture",
  },
  "4planet/e4rth": {
    goal: "Make land, freshwater and terrestrial living systems navigable through shared species/place/pressure/solution intelligence and strong active proofs.",
    success: "SPECIES Gold machinery transfers across terrestrial contexts and active E4RTH journeys remain source-aware and interoperable.",
    source: "4PLANET Mission architecture / SPECIES authority",
  },
  "4planet/s4piens": {
    goal: "Make human needs, dependencies and value chains legible as human-systems intelligence over the same Planet Model, beginning with FOOD.",
    success: "Homo sapiens → FOOD → place/data → living systems/species → response/solution is traversable with provenance and no causal inflation.",
    source: "SAP-SAPIENS-01 / D12 FOOD Gold",
  },
  "4planet/4culture": {
    goal: "Turn living-planet truth into meaning, attention, imagination and participation through culture without weakening evidence standards.",
    success: "Fewer stronger cultural outputs are rights-safe, source-grounded and linked to observed audience/partner learning or real participation.",
    source: "4CULTURE architecture",
  },
  "4planet/oce4n/wh4les": {
    goal: "Create a source-aware North Atlantic whale intelligence and protection pathway that can progress from product proof to a credible partner-led pilot.",
    success: "Orca/whale product proof + scientific review + rights-safe assets + qualified implementation/protection pathway.",
    source: "Project Portfolio OCE-WH4LES-01",
  },
  "4planet/oce4n/cor4l": {
    goal: "Connect authoritative reef heat-stress intelligence to one credible resilience/restoration pathway without overstating restoration impact.",
    success: "Reference region + authoritative data + qualified operator + real delivery/evidence controls.",
    source: "Project Portfolio OCE-COR4L-01",
  },
  "4planet/oce4n/plastic-clean": {
    goal: "Create a traceable plastic prevention/removal pathway with qualified delivery partner, transparent units and no double counting.",
    success: "Verified operator + method/cost/reporting chain + prevention/removal separation + fundable pilot.",
    source: "Project Portfolio OCE-PL4STIC-01",
  },
  "4planet/oce4n/rewild-marine": {
    goal: "Create a source-aware coastal habitat recovery pathway that can support a real partner-led restoration pilot.",
    success: "Science/gap review + selected geography/operator + permits/economics/reporting path.",
    source: "Project Portfolio OCE-REWILD-M-01",
  },
  "4planet/e4rth/clim4te": {
    goal: "Prove a bounded climate-and-nature decision-intelligence use case with a real decision owner and trustworthy evidence.",
    success: "Named decision class/user + live data/evidence + observed decision value without impact inflation.",
    source: "Project Portfolio EAR-CLIM4TE-01",
  },
  "4planet/e4rth/am4zonia": {
    goal: "Build an Indigenous-first Amazonia intelligence/protection pathway that is legitimate, consent-based and non-extractive before any public action unit.",
    success: "Approved protocol + authorised partner/representation + evidence/rights/consent controls + viable bounded pilot.",
    source: "Project Portfolio EAR-AM4ZONIA-01",
  },
  "4planet/e4rth/species": {
    goal: "Create a navigable Living Planet Intelligence species world where each species becomes a human-first entry into place, ecosystems, relationships, pressures, human systems, solutions and action.",
    success: "Jaguar Gold live + Atlas Window + observation/range truth + traversable food web + ecosystem bridge + rights-safe immersive media + user/expert evidence.",
    source: "Project Portfolio EAR-SPECIES-01",
  },
  "4planet/e4rth/rewild-land": {
    goal: "Create a realistic restoration intelligence pathway and one evidence-backed partner-defined restoration unit/pilot.",
    success: "Selected geography/operator + tenure/standard/cost/monitoring evidence + fundable delivery model.",
    source: "Project Portfolio EAR-REWILD-L-01",
  },
  "4planet/s4piens/food": {
    goal: "Complete the first organisational Gold loop: FOOD intelligence → real choice/decision → solution/actors → resources/action → learning → transfer.",
    success: "Source-complete case + scientific challenge + user/decision evidence + bounded action route + second-context transfer.",
    source: "D12 FOOD Gold / Project Portfolio SAP-FOOD-01",
  },
  "4planet/s4piens/energy": {
    goal: "Demonstrate a useful local energy-transition decision-intelligence pilot without overstating decision or climate outcomes.",
    success: "Named decision owner + current data + usable decision view + observed feedback/proof.",
    source: "Project Portfolio SAP-EN3RGY-01",
  },
  "4planet/s4piens/circular-city": {
    goal: "Create one bounded circular-city material-flow pilot that moves from intelligence to a credible collaborative action.",
    success: "Selected flow + legitimate participants/data + defined intervention + measured delivery/result evidence.",
    source: "Project Portfolio SAP-CIRCULAR-01",
  },
  "4planet/s4piens/f4shion": {
    goal: "Prove traceable-material intelligence for one fashion category while explicitly separating traceability from lower-impact claims.",
    success: "Partner/data access + traceability proof + user/decision evidence + controlled environmental claims.",
    source: "Project Portfolio SAP-F4SHION-01",
  },
  "4planet/4culture/m4gazine": {
    goal: "Build a low-frequency, premium, source-grounded editorial programme that increases trust, category depth and cultural relevance for 4PLANET.",
    success: "Approved editorial identity + rights/source-safe stories + consistent publication quality + meaningful audience/media response.",
    source: "Project Portfolio CUL-M4GAZINE-01",
  },
  "4planet/4culture/4film": {
    goal: "Build a flagship documentary/short-film programme that translates Living Planet Intelligence into high-trust cultural storytelling.",
    success: "Rights/producer/access closed + completed flagship film + distribution/press/audience evidence.",
    source: "Project Portfolio CUL-4FILM-01",
  },
  "4planet/4culture/4rt": {
    goal: "Create an artist-edition model where cultural value and transparent economics can fund verified living-planet action without claim inflation.",
    success: "Artist/rights/production model + transparent economics + valid Impact pathway + completed release proof.",
    source: "Project Portfolio CUL-4RT-01",
  },
  "4planet/4culture/4play": {
    goal: "Test music/live cultural activation as a credible way to expand attention and participation around a living planet.",
    success: "One bounded artist/release/live activation + rights/budget/distribution clarity + observed audience/partner learning.",
    source: "Project Portfolio CUL-4PLAY-01",
  },
  "odin": {
    goal: "Build a durable private Founder operating system that protects memory, decisions, creativity, personal continuity and cognition while minimising avoidable founder burden.",
    success: "Fresh-start recovery works, private boundaries hold, recurring work becomes reusable processes, and only irreducible Founder work reaches Odin.",
    source: "ODIN Master Index / Universal Operating Kernel",
  },
  "odin/brain": {
    goal: "Make ODIN BRAIN a durable, reconstructable semantic memory with provenance and strict minimum-derived bridges to other project worlds.",
    success: "Important personal facts/decisions/processes can be recovered without chat memory and sensitive content never crosses boundaries silently.",
    source: "ODIN Semantic Canon / Governance & Bridge Contract",
  },
  "odin/process-library": {
    goal: "Turn demonstrated repeatable Odin + AI workflows into a living Process Library that improves speed and quality without bureaucracy.",
    success: "High-value processes are instantiated from real cases, versioned, reused and retired when evidence says they no longer work.",
    source: "ODIN Universal Operating Kernel",
  },
  "odin/founder-os": {
    goal: "Give Odin one calm private control surface for what matters now, what AI is moving, what changed and where Founder judgement has highest leverage.",
    success: "Top 1–3 real Founder actions, actual movement, learning, blockers and next critical path are visible without task theatre.",
    source: "D15 Founder Control / ODIN OS",
  },
  "odin/idea-vault": {
    goal: "Preserve abundant ideas without letting novelty silently displace the critical path.",
    success: "Ideas are captured, classified, linked to hypotheses/evidence and promoted/held/killed through explicit criteria.",
    source: "D15 Creative Firewall / ODIN BRAIN",
  },
  "p4nther": {
    goal: "Keep P4NTHER a coherent independent strategic-intelligence venture that can compound safely without contaminating 4PLANET or ODIN-private truth.",
    success: "Project identity/recovery remains clear and deeper execution activates only against independent value, capacity and evidence.",
    source: "P4NTHER project authority",
  },
  "p4nther/brain": { goal: "Keep P4NTHER-specific knowledge reconstructable and correctly owned.", success: "No authority leakage or duplicate project-management system.", source: "P4NTHER project authority" },
  "p4nther/ops": { goal: "Materialise only the operational machinery P4NTHER needs when active work justifies it.", success: "Reusable Project Factory controls handle execution without duplicate infrastructure.", source: "P4NTHER project authority" },
  "p4nther/intel": { goal: "Produce bounded source-backed strategic intelligence that changes a real P4NTHER decision.", success: "Question → evidence → synthesis → explicit decision impact.", source: "P4NTHER project authority" },
  "p4nther/strategy": { goal: "Keep P4NTHER direction, hypotheses and route-to-value explicit and evidence-linked.", success: "Reactivation occurs only when independent expected value justifies capacity.", source: "P4NTHER project authority" },
  "sandbox": {
    goal: "Preserve high-upside creative optionality while preventing experimental work from stealing protected execution capacity.",
    success: "Every active experiment has a hypothesis/test and reaches PROMOTE/HOLD/KILL without spawning a parallel truth system.",
    source: "D16 LABS doctrine",
  },
  "sandbox/nature-game": { goal: "Prove the smallest playable ecological-relationship mechanic using verified nature intelligence.", success: "A bounded playable test produces real engagement/learning evidence without presenting simulation as observed truth.", source: "D16 Nature Game hypothesis" },
  "sandbox/4planet-university": { goal: "Prove one source-linked learning journey built from an already mature Gold Reference.", success: "Users understand the target concept measurably better without a parallel knowledge system.", source: "D16 University hypothesis" },
  "sandbox/okobrain": { goal: "Prove ØKOBRAIN solves a unique non-duplicate problem—or merge/kill it before architecture grows.", success: "A distinct use case survives red-team against NATUREBRAIN/BRAIN overlap.", source: "LABS idea intake" },
  "4planet/product/atlas-data-lab": { goal: "Expand real ATLAS data breadth safely through individually qualified source layers on the canonical map runtime.", success: "Source probes, exact layer contracts and deployed desktop/mobile MAP_GREEN evidence pass without false-zero or credential leakage.", source: "ATLAS Data Lab / PR #72" },
  "4planet/product/nature-xr": { goal: "Prove browser-first immersive rendering can improve understanding/felt relevance while remaining a lens over canonical SPECIES/Living Systems truth.", success: "Browser proof is strong, physical headset comfort/comprehension is separately validated, and no second ecological truth system appears.", source: "Nature XR / PR #73" },
  "4planet/product/jaguar-journey": { goal: "Prove a premium multi-scene Jaguar journey from life → relationship → habitat → pressure → response using reusable canonical truth.", success: "Exact-head visual/browser acceptance passes and reusable journey machinery is identified beyond Jaguar.", source: "Jaguar Journey / PR #79" },
  "4planet/s4piens/food-gold-lab": { goal: "Build one genuinely impressive Homo sapiens × FOOD Human Systems Atlas journey using shared ATLAS/SPECIES/Living Systems infrastructure.", success: "Founder can complete HUMAN → FOOD → PLACE/DATA → LIFE → RESPONSE with provenance visible, at least one live source and no causal/impact inflation.", source: "SAP-SAPIENS-01 / PR #81" },
  "4planet/tree-of-life": { goal: "Make the entire 4PLANET machine legible as an interactive system map for Founder thinking, meetings and capital without inventing new architecture.", success: "Users can understand shared roots → products/Missions/actors/solutions/capital/Impact/learning and the map remains only a rendering of canonical objects.", source: "Tree of Life / PR #80" },
  "4planet/choice-lab": { goal: "Test explainable solution/capital decision intelligence without a hidden universal score or fabricated relationship claims.", success: "A named decision can be traced problem → solution → actor → capital → proof with evidence and hypotheses visibly separated.", source: "CHOICE / PR #82" },
  "4planet/naturebrain/planetary-map": { goal: "Materialise the minimum useful Planetary Map as the permanent world-description layer beneath Missions without building a competing ontology or map engine.", success: "Canonical place/life/pressure/source semantics support shared products/Missions and the bounded PMAP build can close cleanly.", source: "Planetary Architecture / PMAP WBS" },
};

const prototypeMeta: Record<string, PrototypeMeta> = {
  "4planet": { label: "4PLANET production", href: "https://4planet.org", state: "LIVE", source: "production", verified: "19 Aug 2026" },
  "4planet/brand": { label: "4PLANET BRAND OS", href: "https://4planet-os.pages.dev/", state: "PROTOTYPE", source: "4P_ Websider", verified: "19 Aug 2026" },
  "4planet/product": { label: "Latest ONE INTERFACE candidate", href: "https://release-one-interface-univer.4planet-05.pages.dev", state: "PREVIEW", source: "Cloudflare PR #74", verified: "19 Aug 2026" },
  "4planet/product/one-interface": { label: "ONE INTERFACE candidate", href: "https://release-one-interface-univer.4planet-05.pages.dev", state: "PREVIEW", source: "Cloudflare PR #74", verified: "19 Aug 2026" },
  "4planet/product/atlas": { label: "ATLAS public surface", href: "https://4planet.org/atlas", state: "LIVE", source: "4PLANET production", verified: "19 Aug 2026" },
  "4planet/product/living-systems": { label: "Living Systems v1.4.1", href: "https://4p-living-systems-v1-4-1.pages.dev/", state: "PROTOTYPE", source: "4P_ Websider", verified: "19 Aug 2026" },
  "4planet/product/impact": { label: "IMPACT / OS v15.1", href: "https://4p-os-v15-1.pages.dev/impact", state: "PROTOTYPE", source: "4P_ Websider", verified: "19 Aug 2026" },
  "4planet/e4rth/species": { label: "SPECIES public surface", href: "https://4planet.org/species", state: "LIVE", source: "4PLANET production", verified: "19 Aug 2026" },
  "4planet/4culture": { label: "4CULTURE prototype", href: "https://4culture.pages.dev/", state: "PROTOTYPE", source: "4P_ Websider", verified: "19 Aug 2026" },
  "4planet/4culture/4rt": { label: "4RT prototype", href: "https://787tgj.csb.app/", state: "PROTOTYPE", source: "4P_ Websider", verified: "19 Aug 2026" },
  "odin": { label: "ODIN public prototype", href: "https://odinoddekalv-site.pages.dev/", state: "PROTOTYPE", source: "4P_ Websider", verified: "19 Aug 2026" },
  "p4nther": { label: "P4NTHER FRONT + OS 2", href: "https://p4nther-os2-cx.pages.dev/", state: "PROTOTYPE", source: "4P_ Websider", verified: "19 Aug 2026" },
  "4planet/product/atlas-data-lab": { label: "ATLAS DATA LAB", href: "https://sandbox-atlas-data-lab-20260.4planet-05.pages.dev", state: "PREVIEW", source: "Cloudflare PR #72", verified: "19 Aug 2026" },
  "4planet/product/nature-xr": { label: "NATURE XR", href: "https://8495b77d.4planet-05.pages.dev/xr/jaguar/", state: "PREVIEW", source: "Cloudflare PR #73", verified: "19 Aug 2026" },
  "4planet/product/jaguar-journey": { label: "JAGUAR JOURNEY", href: "https://agent-jaguar-journey-v11.4planet-05.pages.dev", state: "PREVIEW", source: "Cloudflare PR #79", verified: "19 Aug 2026" },
  "4planet/s4piens": { label: "S4PIENS HUMAN SYSTEMS ATLAS", href: "https://a13531c4.4planet-05.pages.dev/sandbox/s4piens", state: "PREVIEW", source: "Cloudflare PR #81", verified: "19 Aug 2026" },
  "4planet/s4piens/food": { label: "S4PIENS / FOOD GOLD", href: "https://a13531c4.4planet-05.pages.dev/sandbox/s4piens", state: "PREVIEW", source: "Cloudflare PR #81", verified: "19 Aug 2026" },
  "4planet/s4piens/food-gold-lab": { label: "S4PIENS / FOOD GOLD", href: "https://a13531c4.4planet-05.pages.dev/sandbox/s4piens", state: "PREVIEW", source: "Cloudflare PR #81", verified: "19 Aug 2026" },
  "4planet/tree-of-life": { label: "TREE OF LIFE", href: "https://98c37ba8.4planet-05.pages.dev", state: "PREVIEW", source: "Cloudflare PR #80", verified: "19 Aug 2026" },
  "4planet/choice-lab": { label: "CHOICE", href: "https://b85db8c9.4planet-05.pages.dev", state: "PREVIEW", source: "Cloudflare PR #82", verified: "19 Aug 2026" },
};

export function goalMetaFor(project: LabProject): ProjectGoalMeta {
  return goalMeta[project.slug] ?? {
    goal: project.why,
    success: project.next,
    source: `${project.authority} · working projection`,
  };
}

export function latestPrototypeFor(project: LabProject): PrototypeMeta | undefined {
  const explicit = prototypeMeta[project.slug];
  if (explicit) return explicit;
  const asset = project.assets?.find((item) => item.kind === "PREVIEW")
    ?? project.assets?.find((item) => item.kind === "WEB");
  if (asset) return { label: asset.label, href: asset.href, state: asset.kind === "PREVIEW" ? "PREVIEW" : "REFERENCE", source: "project asset", verified: project.freshness };
  if (project.externalUrl) return { label: `${project.title} web`, href: project.externalUrl, state: "REFERENCE", source: "project externalUrl", verified: project.freshness };
  return undefined;
}

export function withProjectMeta(project: LabProject): LabProject {
  const goal = goalMetaFor(project);
  const prototype = latestPrototypeFor(project);
  const prototypeAsset: ProjectAsset | undefined = prototype
    ? { label: `LATEST · ${prototype.label}`, href: prototype.href, kind: prototype.state === "PREVIEW" ? "PREVIEW" : "WEB" }
    : undefined;
  const assets = [prototypeAsset, ...(project.assets ?? [])].filter((item): item is ProjectAsset => Boolean(item));
  const deduped = assets.filter((item, index) => assets.findIndex((candidate) => candidate.href === item.href) === index);
  return {
    ...project,
    next: goal.goal,
    evidence: `${project.evidence} · GOAL SOURCE: ${goal.source}`,
    assets: deduped,
  };
}

export const projectPrototypeRegistry = prototypeMeta;
