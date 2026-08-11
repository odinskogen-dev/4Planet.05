import type { ProductionObject } from "./production-system";
import type { Channel, ReleaseRecord, StoryRecord } from "./types";

export interface FrozenReleaseContent {
  headline: string;
  deck: string;
  caption: string;
  altText: string;
  provenanceLabel: string;
  sourceFooter: string;
  rightsRoute: string;
  limitation: string;
  ownedDestination: string;
  channelJob: string;
  distributionPackSummary: string;
}

export interface FrozenReleaseManifest {
  manifestId: string;
  storyId: string;
  release: ReleaseRecord;
  productionObject: ProductionObject;
  content: FrozenReleaseContent;
  targetChannels: Channel[];
  frozenForFounderReview: true;
}

const release = (
  releaseId: string,
  storyId: string,
  channel: Channel,
  fingerprint: string,
): ReleaseRecord => ({
  releaseId,
  storyId,
  channel,
  version: 1,
  founderDecision: "OPEN",
  contentFingerprint: fingerprint,
});

export const ORCA_RELEASE_MANIFEST: FrozenReleaseManifest = {
  manifestId: "MAN-BOS-ORCA-001",
  storyId: "STORY-BOS-ORCA-001",
  release: release("REL-BOS-ORCA-IG-001", "STORY-BOS-ORCA-001", "instagram", "orca-source-first-v1"),
  productionObject: {
    productionId: "PROD-BOS-ORCA-001",
    storyId: "STORY-BOS-ORCA-001",
    templateId: "TPL-REL-01",
    truthClass: "DESIGN",
    sourceGate: "PASS",
    rightsGate: "PASS",
    syntheticDisclosure: false,
    altText: "A source-first 4PLANET graphic with three bounded panels: one GBIF Orca observation from Norway on 3 January 2026, general Orca social and acoustic context from NOAA Fisheries, and the persisted 4PLANET product context. A visible limit states that one record does not establish range, abundance, trend, current location, place membership or ecosystem condition.",
    provenanceState: "4PLANET_CONTEXT",
    provenanceLabel: "SOURCE + 4PLANET CONTEXT — one attributed GBIF occurrence is kept separate from species context and product interpretation.",
    coverageLimit: "One reported occurrence is not range, abundance, population trend, live location, place membership or ecosystem condition. Coordinates are rounded. Observation ≠ Signal.",
    claimText: "One attributed Orca occurrence can anchor a bounded source-first story about the wider relationships around an animal without turning that single record into a population or ecosystem claim.",
  },
  content: {
    headline: "One record. A wider living system.",
    deck: "An Orca is never only an Orca — but one occurrence is still only one reported occurrence.",
    caption: "One Orca record can tell us something real — if we keep its limits visible. GBIF occurrence 5939349319 reports an Orca observation in Norway on 3 January 2026. Around that record sits a wider species context: Orcas live in socially structured groups and use underwater sound for communication and navigation. 4PLANET keeps those layers separate. The occurrence is an observation, not a Signal, and it does not establish range, abundance, trend, current location, place membership or ecosystem condition.",
    altText: "A three-part source-first graphic about Orcas: one exact GBIF observation, general social and acoustic species context, and a product-context panel stating that the observation has not been promoted to a Signal. A limitation panel lists what the single record cannot establish.",
    provenanceLabel: "SOURCE / GBIF 5939349319 + NOAA Fisheries. 4PLANET CONTEXT is explicitly labelled.",
    sourceFooter: "SOURCES: GBIF occurrence 5939349319 · CC BY 4.0 · NOAA Fisheries / SRC-015. 4PLANET CONTEXT. Coordinates rounded; limits apply.",
    rightsRoute: "AST-0025 / RD-0019 — original 4PLANET source/data/design treatment. GBIF/NOAA source attribution remains visible. Licensed documentary images AST-0023/0024 are optional and are not used in this P0 release.",
    limitation: "Do not infer range, abundance, population trend, current location, place membership or ecosystem condition from one occurrence. Do not turn the occurrence into a Signal.",
    ownedDestination: "/species/orca",
    channelJob: "Instagram primary: make one evidence boundary memorable, then return the user to the source-aware Orca profile.",
    distributionPackSummary: "Source-first species object; exact source link; short context note; no cold outreach; prepare only for verified wildlife/science/editorial targets after founder release.",
  },
  targetChannels: ["web", "instagram", "youtube", "linkedin"],
  frozenForFounderReview: true,
};

export const BEE_RELEASE_MANIFEST: FrozenReleaseManifest = {
  manifestId: "MAN-BOS-BEE-001",
  storyId: "STORY-BOS-BEE-001",
  release: release("REL-BOS-BEE-IG-001", "STORY-BOS-BEE-001", "instagram", "bee-relationship-reveal-v1"),
  productionObject: {
    productionId: "PROD-BOS-BEE-001",
    storyId: "STORY-BOS-BEE-001",
    templateId: "TPL-REL-01",
    truthClass: "DESIGN",
    sourceGate: "PASS",
    rightsGate: "PASS",
    syntheticDisclosure: false,
    altText: "A 4PLANET Relationship Reveal showing four source-scoped steps: bees as one important group of animal pollinators, many crops depending partly on animal pollination, apple as a bounded production example, and food as 4PLANET context. A limit states that bees are not all pollinators and apples are not all food.",
    provenanceState: "4PLANET_CONTEXT",
    provenanceLabel: "SOURCE + 4PLANET CONTEXT — FAO and Garratt et al. support the bounded relationship; the final food framing is labelled editorial synthesis.",
    coverageLimit: "Bees are not all pollinators. Apples are not all food. Results from four UK apple varieties are not universalised beyond the cited source scope.",
    claimText: "Bee → pollination → apple is one concrete way to reveal a food-system dependency without claiming that all food depends on bees.",
  },
  content: {
    headline: "What depends on what?",
    deck: "Bee → pollination → apple → one part of the food system.",
    caption: "A bee is not the whole food system. It is one way into it. Bees are an important group of animal pollinators, but they are not the only pollinators. Many crop plants depend at least partly on animal pollination. Apple gives us one bounded example: different pollinator groups can contribute differently across varieties. That is the relationship this first reveal shows — not a claim that all food depends on bees.",
    altText: "A four-step relationship graphic labelled BEES, POLLINATION, APPLE and FOOD. The first three steps are marked SOURCE and the food framing is marked 4PLANET CONTEXT. A visible limit says bees are not all pollinators and apples are not all food.",
    provenanceLabel: "SOURCE: FAO / SRC-017 + Garratt et al. / SRC-019. FOOD framing: 4PLANET CONTEXT.",
    sourceFooter: "SOURCES: FAO / SRC-017 · Garratt et al. / SRC-019 · CLM-BOS-BEE-001..004. Bounded apple example; limits apply.",
    rightsRoute: "AST-0020 / RD-0014 — original 4PLANET relationship design, cleared for defined 4PLANET editorial/social/web use; no third-party documentary media used.",
    limitation: "Do not say all food depends on bees, collapse bees into all pollinators or generalise the cited apple study into a universal crop claim.",
    ownedDestination: "/living-systems",
    channelJob: "Instagram primary: create a saveable Relationship Reveal that turns one dependency into a reason to explore Living Systems.",
    distributionPackSummary: "Relationship explainer; claim/source sidecar; exact limitation text; no cold outreach; prepare for verified pollination/food/science/editorial targets only after founder release.",
  },
  targetChannels: ["web", "instagram", "youtube", "linkedin"],
  frozenForFounderReview: true,
};

export const OSLO_RELEASE_MANIFEST: FrozenReleaseManifest = {
  manifestId: "MAN-BOS-OSLO-001",
  storyId: "STORY-BOS-OSLO-001",
  release: release("REL-BOS-OSLO-IG-001", "STORY-BOS-OSLO-001", "instagram", "oslofjord-one-place-v1"),
  productionObject: {
    productionId: "PROD-BOS-OSLO-001",
    storyId: "STORY-BOS-OSLO-001",
    templateId: "TPL-PLACE-01",
    truthClass: "DESIGN",
    sourceGate: "PASS",
    rightsGate: "PASS",
    syntheticDisclosure: false,
    altText: "A conceptual 4PLANET ONE PLACE graphic for Oslofjorden containing three clearly separated evidence classes: modelled nitrogen pressure, mapped-known marine nature and environmental monitoring-location coverage. A visible boundary explains that the graphic is an interface focus rather than a scientific boundary map and that co-location is not causality.",
    provenanceState: "4PLANET_CONTEXT",
    provenanceLabel: "SOURCE LAYERS + 4PLANET CONTEXT — modelled pressure, mapped-known nature and monitoring coverage remain different evidence classes.",
    coverageLimit: "Each layer keeps its own geography, period, method and coverage. HB19 is incomplete and partly older mapping. Monitoring points are not condition. Co-location is not causality.",
    claimText: "Oslofjorden is not one condition: a place-first view can connect bounded official evidence layers while preserving their different meanings and limitations.",
  },
  content: {
    headline: "Oslofjorden is not one condition.",
    deck: "One place. Three evidence classes. No single score pretending to be the whole fjord.",
    caption: "To understand Oslofjorden, we have to keep different kinds of evidence different. This first ONE PLACE object combines three bounded official layers: modelled nitrogen pressure and intervention scenarios; mapped-known marine nature, with explicit coverage gaps and older mapping; and locations where Økokyst/Vannmiljø monitoring records exist. None of those layers is the whole fjord. A model is not an observed ecological outcome. A mapped occurrence is not complete current distribution. A monitoring point is not condition or trend. Seeing the layers together can help us ask better questions — without pretending co-location proves cause.",
    altText: "A 4PLANET ONE PLACE graphic for Oslofjorden with three stacked evidence panels: MODELLED PRESSURE, MAPPED MARINE NATURE and MONITORING COVERAGE. A final limitation states that each layer has its own coverage and method and that co-location does not prove causality.",
    provenanceLabel: "SOURCE LAYERS: Miljødirektoratet M-3141 / SRC-021; Naturbase HB19 / SRC-022; Vannmiljø Økokyst monitoring coverage / SRC-023. 4PLANET CONTEXT.",
    sourceFooter: "SOURCES: M-3141 / SRC-021 · Naturbase HB19 / SRC-022 · Vannmiljø Økokyst / SRC-023. Model ≠ observation; mapped-known ≠ complete; monitoring location ≠ condition.",
    rightsRoute: "AST-0022 / RD-0016 — original 4PLANET source/data/design treatment cleared for defined use. No agency map screenshot/tile or documentary people/media is used in this P0 release.",
    limitation: "Do not present model scenarios as observed outcomes, HB19 as complete current coverage, monitoring locations as ecological status or overlapping layers as causal proof.",
    ownedDestination: "/atlas?place=place%3A4p%3Aoslofjord",
    channelJob: "Instagram primary: make ONE PLACE legible and memorable, then return the user to the canonical Oslofjorden ATLAS context.",
    distributionPackSummary: "Place explainer with three source-layer classes and coverage notes; no cold outreach; prepare only for verified Oslofjord/marine/environmental/editorial targets after founder release.",
  },
  targetChannels: ["web", "instagram", "youtube", "linkedin"],
  frozenForFounderReview: true,
};

export const FROZEN_P0_RELEASE_MANIFESTS: FrozenReleaseManifest[] = [
  ORCA_RELEASE_MANIFEST,
  BEE_RELEASE_MANIFEST,
  OSLO_RELEASE_MANIFEST,
];

export function manifestForStory(story: StoryRecord): FrozenReleaseManifest {
  const manifest = FROZEN_P0_RELEASE_MANIFESTS.find((candidate) => candidate.storyId === story.storyId);
  if (!manifest) throw new Error(`No frozen Brand OS release manifest for ${story.storyId}.`);
  return manifest;
}
