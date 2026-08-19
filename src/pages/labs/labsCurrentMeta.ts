import { withProjectMeta } from "./labsProjectMeta";
import type { LabProject } from "./labsFreshProjection";

type GoalContract = {
  id: string;
  status: "BASELINE COMPLETE" | "INHERITED / CURRENT AUTHORITY";
  goal: string;
  success: string;
  source: string;
};

type LeadingLink = { label: string; href: string; kind: "WEB" | "PREVIEW" };

const contracts: Record<string, GoalContract> = {
  "4planet/product": {
    id: "SYS-P00-PRODUCT-G01",
    status: "BASELINE COMPLETE",
    goal: "Ship the strongest coherent ATLAS / SPECIES / LIVING SYSTEMS / IMPACT candidate without false maturity.",
    success: "Founder-accepted controlled external release with exact source, rights, mobile and runtime evidence.",
    source: "Founder Control Register · Project Pack v2.0 · Strategy & Goal Cascade v4.0",
  },
  "4planet/product/one-interface": {
    id: "SYS-P00-PRODUCT-G01",
    status: "BASELINE COMPLETE",
    goal: "Ship the strongest coherent ATLAS / SPECIES / LIVING SYSTEMS / IMPACT candidate without false maturity.",
    success: "Founder-accepted controlled external release with exact source, rights, mobile and runtime evidence.",
    source: "Founder Control Register · Project Pack v2.0 · Strategy & Goal Cascade v4.0",
  },
  "4planet/product/atlas": {
    id: "SYS-P00-PRODUCT-G01 / ATLAS",
    status: "INHERITED / CURRENT AUTHORITY",
    goal: "Make ATLAS the reliable source-aware spatial workbench inside the shared product family: useful at planetary, regional, local and street scales without losing source, time, identity or uncertainty semantics.",
    success: "ATLAS remains independently useful while sharing the same Planet Model, product context, source contracts and release evidence as ONE INTERFACE.",
    source: "Product Goal Contract + current ATLAS authority",
  },
  "4planet/product/living-systems": {
    id: "SYS-P00-PRODUCT-G01 / LIVING SYSTEMS",
    status: "INHERITED / CURRENT AUTHORITY",
    goal: "Turn isolated facts into source-aware relationship intelligence while preserving dependency, pressure, response, uncertainty and provenance.",
    success: "Reusable relationship truth powers Gold journeys and transfers correctly across ATLAS, SPECIES, Missions and decision surfaces.",
    source: "Product Goal Contract + ONE CORE / Living Systems authority",
  },
  "4planet/product/impact": {
    id: "Q90-4 / IMPACT",
    status: "INHERITED / CURRENT AUTHORITY",
    goal: "Make credible action easy while keeping contribution, delivery, evidence, outcome and system impact explicitly separate.",
    success: "At least one qualified operator and financed/paid pilot path has auditable delivery and proof states without impact inflation.",
    source: "Strategy & Goal Cascade v4.0 · IMPACT authority",
  },
  "4planet/oce4n/wh4les": {
    id: "OCE-WH4LES-01-G01", status: "BASELINE COMPLETE",
    goal: "Use whales and Orca as a life-first, source-aware reference case connecting living-system intelligence to credible protection/action pathways.",
    success: "One source/rights-safe whale reference implementation is externally usable, scientifically challenged and connected to a credible protection/operator route.",
    source: "Founder Control Register · Project Pack v2.0",
  },
  "4planet/oce4n/cor4l": {
    id: "OCE-COR4L-01-G01", status: "BASELINE COMPLETE",
    goal: "Connect authoritative reef heat-stress intelligence to a credible partner-led resilience/restoration route.",
    success: "One geography + trusted data + qualified operator + bounded restoration/resilience proof path.",
    source: "Founder Control Register · Project Pack v2.0",
  },
  "4planet/oce4n/plastic-clean": {
    id: "OCE-PL4STIC-01-G01", status: "BASELINE COMPLETE",
    goal: "Separate prevention from removal and create a traceable partner-executed plastic action route.",
    success: "Qualified operator + clear unit/economics/reporting chain + funded bounded delivery + no double counting.",
    source: "Founder Control Register · Project Pack v2.0",
  },
  "4planet/oce4n/rewild-marine": {
    id: "OCE-REWILD-M-01-G01", status: "BASELINE COMPLETE",
    goal: "Create a source-aware, partner-led coastal habitat recovery pathway.",
    success: "One geography/operator/permit/economics/reporting chain supports a real funded habitat pilot.",
    source: "Founder Control Register · Project Pack v2.0",
  },
  "4planet/e4rth/clim4te": {
    id: "EAR-CLIM4TE-01-G01", status: "BASELINE COMPLETE",
    goal: "Prove a bounded signal-to-decision use case for a real institutional or corporate decision owner.",
    success: "Named decision class/user + current data/evidence + observed decision value without impact inflation.",
    source: "Founder Control Register · Project Pack v2.0",
  },
  "4planet/e4rth/am4zonia": {
    id: "EAR-AM4ZONIA-01-G01", status: "BASELINE COMPLETE",
    goal: "Create an Indigenous-first, consent-based intelligence/protection pathway without extractive representation.",
    success: "Authorised local representation/partner + protocol/consent/rights + bounded fundable pilot before public action.",
    source: "Founder Control Register · Project Pack v2.0",
  },
  "4planet/e4rth/species": {
    id: "EAR-SPECIES-01-G01", status: "BASELINE COMPLETE",
    goal: "Make each species a human-first, immersive and source-aware entry into the living planet: identity → habitat/place → ATLAS → ecosystem → food web/dependencies → functions → pressures → causes/human systems → solutions → action.",
    success: "Jaguar Gold Reference proves a reusable Species World grammar with immersive media, structured Species Card, lightweight embedded ATLAS, traversable living-web nodes and a first Amazon Ecosystem bridge; Orca remains the truth/dependency flagship.",
    source: "Founder Control Register · Project Pack v2.0",
  },
  "4planet/e4rth/rewild-land": {
    id: "EAR-REWILD-L-01-G01", status: "BASELINE COMPLETE",
    goal: "Build a realistic restoration intelligence pathway and partner-defined unit/pilot.",
    success: "One geography/operator/tenure/standard/cost/monitoring route supports a credible funded restoration delivery.",
    source: "Founder Control Register · Project Pack v2.0",
  },
  "4planet/s4piens/food": {
    id: "SAP-FOOD-01-G01", status: "BASELINE COMPLETE",
    goal: "Prove the smallest complete 4PLANET loop on one familiar Norwegian food decision: trustworthy ecological, health, price and choice intelligence useful to a real person, then learning connected to solutions, actors, resources and transfer.",
    success: "PERSON × FOOD × NORWAY v1 — Everyday Protein Choice; 4–6 audited alternatives, separate dimensions/no synthetic green score, 6–10 observed users, 2–3 expert challenges, correction, one bounded action/resource route and a transfer adapter.",
    source: "Founder Control Register · Project Pack v2.0 · reviewed 20 Aug current state",
  },
  "4planet/s4piens/energy": {
    id: "SAP-EN3RGY-01-G01", status: "BASELINE COMPLETE",
    goal: "Create decision-aware local energy-transition intelligence for a bounded real owner.",
    success: "One real decision owner uses a source-aware energy decision view and generates observed learning.",
    source: "Founder Control Register · Project Pack v2.0",
  },
  "4planet/s4piens/circular-city": {
    id: "SAP-CIRCULAR-01-G01", status: "BASELINE COMPLETE",
    goal: "Map one city material flow from problem to actors/solutions/capital and coordinate a bounded action pilot.",
    success: "One flow + legitimate participants/data + defined intervention + measured result creates a reusable city-system module.",
    source: "Founder Control Register · Project Pack v2.0",
  },
  "4planet/s4piens/f4shion": {
    id: "SAP-F4SHION-01-G01", status: "BASELINE COMPLETE",
    goal: "Map one fashion category/material and test traceable decision intelligence without equating traceability with lower impact.",
    success: "Partner/data access + traceability evidence + user/decision learning + controlled environmental/health/value claims.",
    source: "Founder Control Register · Project Pack v2.0",
  },
  "4planet/4culture/m4gazine": {
    id: "CUL-M4GAZINE-01-G01", status: "BASELINE COMPLETE",
    goal: "Translate real intelligence/proof into high-quality editorial understanding, trust and cultural relevance.",
    success: "A low-frequency source-grounded programme produces meaningful audience/media response and reusable story assets tied to real proof.",
    source: "Founder Control Register · Project Pack v2.0",
  },
  "4planet/4culture/4film": {
    id: "CUL-4FILM-01-G01", status: "BASELINE COMPLETE",
    goal: "Translate living-system truth and action into emotionally powerful documentary storytelling.",
    success: "One rights/producer/access-safe flagship film gains distribution/audience evidence and strengthens verified mission/story.",
    source: "Founder Control Register · Project Pack v2.0",
  },
  "4planet/4culture/4rt": {
    id: "CUL-4RT-01-G01", status: "BASELINE COMPLETE",
    goal: "Test whether cultural value can transparently finance verified living-planet action.",
    success: "One artist-edition model has clear rights/economics and only funds a valid underlying Impact route.",
    source: "Founder Control Register · Project Pack v2.0",
  },
  "4planet/4culture/4play": {
    id: "CUL-4PLAY-01-G01", status: "BASELINE COMPLETE",
    goal: "Test music/live culture as a participation and attention multiplier for a living planet.",
    success: "One bounded artist/release/live activation produces observed participation/partner learning without mission dilution.",
    source: "Founder Control Register · Project Pack v2.0",
  },
  "4planet/s4piens/food-gold-lab": {
    id: "SAP-SAPIENS-01-G01", status: "BASELINE COMPLETE",
    goal: "Build one genuinely impressive ATLAS-first Homo sapiens × FOOD experience using the shared Planet Model, ATLAS, SPECIES and Living Systems infrastructure.",
    success: "Founder-visible HUMAN → FOOD SYSTEM → PLACE/DATA → LIVING SYSTEM/SPECIES → SOLUTION/MISSION with provenance, mobile/desktop QA, no fifth product, no parallel map/truth system and no false Impact claim.",
    source: "Founder Control Register · SAP-SAPIENS-01 Project Goal Contract",
  },
  "4planet/naturebrain/planetary-map": {
    id: "SYS-P00-PMAP-G01", status: "BASELINE COMPLETE",
    goal: "Materialise the minimum useful Planetary Map as the permanent world-description layer beneath Missions without building a competing ontology or map engine.",
    success: "Canonical place/life/pressure/source semantics support shared products and Missions, while the bounded PMAP build can close cleanly and the permanent layer remains.",
    source: "Founder Control Register · Planetary Architecture / PMAP",
  },
};

const missionUrls: Record<string, string> = {
  "4planet/oce4n/wh4les": "https://4planet.org/missions/wh4les",
  "4planet/oce4n/cor4l": "https://4planet.org/missions/cor4l",
  "4planet/oce4n/plastic-clean": "https://4planet.org/missions/cle4n",
  "4planet/oce4n/rewild-marine": "https://4planet.org/missions/rewild-marine",
  "4planet/e4rth/clim4te": "https://4planet.org/missions/clim4te",
  "4planet/e4rth/am4zonia": "https://4planet.org/missions/am4zonia",
  "4planet/e4rth/species": "https://4planet.org/missions/species",
  "4planet/e4rth/rewild-land": "https://4planet.org/missions/rewild-land",
  "4planet/s4piens/food": "https://4planet.org/missions/food",
  "4planet/s4piens/energy": "https://4planet.org/missions/en4rgy",
  "4planet/s4piens/circular-city": "https://4planet.org/missions/circular-city",
  "4planet/s4piens/f4shion": "https://4planet.org/missions/f4shion",
  "4planet/4culture/m4gazine": "https://4planet.org/missions/m4gazine",
  "4planet/4culture/4film": "https://4planet.org/missions/4film",
  "4planet/4culture/4rt": "https://4planet.org/missions/4rt",
  "4planet/4culture/4play": "https://4planet.org/missions/4play",
};

const leadingLinks: Record<string, LeadingLink> = {
  "4planet": { label: "4PLANET", href: "https://4planet.org", kind: "WEB" },
  "4planet/product": { label: "ONE INTERFACE candidate", href: "https://release-one-interface-univer.4planet-05.pages.dev", kind: "PREVIEW" },
  "4planet/product/one-interface": { label: "ONE INTERFACE candidate", href: "https://release-one-interface-univer.4planet-05.pages.dev", kind: "PREVIEW" },
  "4planet/product/atlas": { label: "ATLAS", href: "https://4planet.org/atlas", kind: "WEB" },
  "4planet/product/living-systems": { label: "LIVING SYSTEMS", href: "https://4planet.org/living-systems", kind: "WEB" },
  "4planet/product/impact": { label: "IMPACT", href: "https://4planet.org/impact", kind: "WEB" },
  "4planet/e4rth/species": { label: "SPECIES", href: "https://4planet.org/species", kind: "WEB" },
  "4planet/oce4n": { label: "OCE4N domain", href: "https://4planet.org/domains/oce4n", kind: "WEB" },
  "4planet/e4rth": { label: "E4RTH domain", href: "https://4planet.org/domains/e4rth", kind: "WEB" },
  "4planet/s4piens": { label: "S4PIENS domain", href: "https://4planet.org/domains/s4piens", kind: "WEB" },
  "4planet/4culture": { label: "4CULTURE domain", href: "https://4planet.org/domains/4culture", kind: "WEB" },
  "4planet/product/nature-xr": { label: "Jaguar XR exact candidate", href: "https://86609c96.4planet-05.pages.dev/xr/jaguar/", kind: "PREVIEW" },
  "4planet/product/jaguar-journey": { label: "Jaguar Journey PR #79", href: "https://github.com/odinskogen-dev/4Planet.05/pull/79", kind: "PREVIEW" },
  "4planet/product/atlas-data-lab": { label: "ATLAS Data Lab PR #72", href: "https://github.com/odinskogen-dev/4Planet.05/pull/72", kind: "PREVIEW" },
  "4planet/s4piens/food-gold-lab": { label: "S4PIENS FOOD Gold PR #81", href: "https://github.com/odinskogen-dev/4Planet.05/pull/81", kind: "PREVIEW" },
  "4planet/s4piens/food/pick": { label: "PICK v0.8 PR #85", href: "https://github.com/odinskogen-dev/4Planet.05/pull/85", kind: "PREVIEW" },
  "4planet/tree-of-life": { label: "TREE OF LIFE PR #80", href: "https://github.com/odinskogen-dev/4Planet.05/pull/80", kind: "PREVIEW" },
  "4planet/choice-lab": { label: "CHOICE PR #82", href: "https://github.com/odinskogen-dev/4Planet.05/pull/82", kind: "PREVIEW" },
};

function dedupeAssets(assets: NonNullable<LabProject["assets"]>) {
  return assets.filter((asset, index) => assets.findIndex((candidate) => candidate.href === asset.href) === index);
}

export function withCurrentProjectMeta(project: LabProject): LabProject {
  const enriched = withProjectMeta(project);
  const contract = contracts[project.slug];
  const leading = leadingLinks[project.slug];
  const missionUrl = missionUrls[project.slug];
  const existing = enriched.assets ?? [];
  const firstExisting = existing[0];
  const leadingAsset = leading
    ? { label: `LEADING ONE · ${leading.label}`, href: leading.href, kind: leading.kind }
    : firstExisting
      ? { ...firstExisting, label: `LEADING ONE · ${firstExisting.label.replace(/^LATEST · /, "")}` }
      : undefined;
  const missionAsset = missionUrl
    ? { label: `MISSION PAGE · ${project.title}`, href: missionUrl, kind: "WEB" as const }
    : undefined;
  const assets = dedupeAssets([leadingAsset, missionAsset, ...existing].filter((asset): asset is NonNullable<LabProject["assets"]>[number] => Boolean(asset)));

  return {
    ...enriched,
    next: contract?.goal ?? enriched.next,
    evidence: contract
      ? `${enriched.evidence} · GOAL CONTRACT ${contract.id} · ${contract.status} · SUCCESS / DoD: ${contract.success} · SOURCE: ${contract.source}`
      : enriched.evidence,
    assets,
  };
}

export const goalContractRegistry = contracts;
export const leadingOneRegistry = leadingLinks;
