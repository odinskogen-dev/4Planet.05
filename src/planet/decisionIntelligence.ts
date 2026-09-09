/* ═══════════════════════════════════════════════════════════════════════════
   4PLANET_ — LIVING SYSTEMS DECISION INTELLIGENCE — RECOVERY ADAPTER

   Recovered selectively from 4Planet_LivingSystems1.4.2. This is NOT a second
   graph and NOT automated advice. It augments the current shared Planet graph
   with the high-value reasoning layers that existed in LSI 1.4.2:

     Dependency → Solution pathway → Decision signal → Expected outcome
     → Observed outcome → Learning → confidence / data gaps.

   IMPORTANT TRUTH BOUNDARY
   The donor records below preserve their donor source IDs and donor review
   states. They have NOT been re-verified against the current 4PLANET Source
   Contract. The UI must therefore say RECOVERED / SOURCE RE-REVIEW REQUIRED.
   No donor learning record means 4PLANET implemented the intervention.
   ═══════════════════════════════════════════════════════════════════════════ */

import {
  RELATIONS,
  nodeById,
  pressureById,
  solutionById,
  systemById,
} from "./livingSystems";
import {
  functionId,
  humanSystemId,
  pressureId,
  solutionId,
  systemId,
} from "./ids";

export const LSI_DONOR = {
  repository: "odinskogen-dev/4Planet_LivingSystems1.4.2",
  branch: "main",
  product: "Living Systems Intelligence 1.4.2",
  donorStatus: "RECOVERED_NOT_REVERIFIED" as const,
};

export type LegacyReviewStatus = "VERIFIED" | "NEEDS_REVIEW" | "NEEDS_URL" | "DRAFT";
export type DecisionLevel = "Low" | "Medium" | "High";
export type TimeHorizon = "Immediate" | "Short-term" | "Long-term";

export interface RecoveredSourceRef {
  id: string;
  label: string;
  authority: string;
  donorReview: LegacyReviewStatus;
  url?: string;
  note: string;
}

export const RECOVERED_SOURCE_REFS: Record<string, RecoveredSourceRef> = {
  IPBES: {
    id: "IPBES",
    label: "IPBES Assessment on Pollinators, Pollination and Food Production",
    authority: "Intergovernmental Science-Policy Platform on Biodiversity and Ecosystem Services",
    donorReview: "NEEDS_REVIEW",
    url: "https://www.ipbes.net",
    note: "Donor source node. Current 4PLANET Source Contract re-review still required.",
  },
  INPE: {
    id: "INPE",
    label: "INPE — Amazon deforestation monitoring (PRODES / DETER)",
    authority: "Brazilian National Institute for Space Research",
    donorReview: "NEEDS_URL",
    note: "Donor referenced programme-level monitoring; exact dataset URL remained to be verified.",
  },
  MAPBIOMAS: {
    id: "MAPBIOMAS",
    label: "MapBiomas — land cover and land-use change",
    authority: "MapBiomas initiative",
    donorReview: "NEEDS_URL",
    note: "Donor referenced the initiative; exact dataset URL/access date remained to be verified.",
  },
  RAISG: {
    id: "RAISG",
    label: "RAISG — Amazonian socio-environmental data",
    authority: "Amazon Network of Georeferenced Socio-Environmental Information",
    donorReview: "NEEDS_URL",
    note: "Donor referenced organisation-level geodata; exact dataset URL remained to be verified.",
  },
  WWF_AMAZON: {
    id: "WWF_AMAZON",
    label: "WWF — Amazon programme material",
    authority: "World Wide Fund for Nature",
    donorReview: "NEEDS_URL",
    note: "Contextual donor reference; specific report metadata remained to be confirmed.",
  },
  AMAZON_INSTITUTIONAL: {
    id: "AMAZON_INSTITUTIONAL",
    label: "Amazon rainforest scientific & institutional literature",
    authority: "Multiple institutions — donor placeholder",
    donorReview: "NEEDS_URL",
    note: "Explicit donor placeholder. It must not be upgraded to a verified current source.",
  },
};

export interface SolutionPathway {
  id: string;
  context: "amazonia" | "pollination";
  threatId: string;
  threatLabel: string;
  solutionId: string;
  solutionLabel: string;
  strengthened: string[];
  supportedHumanSystems: string[];
  sourceIds: string[];
  confidence: DecisionLevel;
  donorReview: "Reviewed" | "Draft";
  dataGaps: string[];
}

export const SOLUTION_PATHWAYS: SolutionPathway[] = [
  {
    id: "PW_DEFOR_PROTECTED",
    context: "amazonia",
    threatId: pressureId("deforestation"),
    threatLabel: "Deforestation",
    solutionId: solutionId("protected-areas"),
    solutionLabel: "Protected areas",
    strengthened: ["Carbon storage", "Biodiversity habitat", "Rainfall regulation"],
    supportedHumanSystems: ["Climate", "Water", "Agriculture"],
    sourceIds: ["WWF_AMAZON", "RAISG"],
    confidence: "Medium",
    donorReview: "Reviewed",
    dataGaps: ["Outcomes depend on governance and enforcement."],
  },
  {
    id: "PW_DEGRAD_RESTORATION",
    context: "amazonia",
    threatId: pressureId("forest-degradation"),
    threatLabel: "Forest degradation",
    solutionId: solutionId("forest-restoration"),
    solutionLabel: "Forest restoration",
    strengthened: ["Carbon storage", "Biodiversity habitat", "Water cycling"],
    supportedHumanSystems: ["Climate", "Agriculture", "Water"],
    sourceIds: ["AMAZON_INSTITUTIONAL"],
    confidence: "Medium",
    donorReview: "Draft",
    dataGaps: ["Outcomes depend on method, scale and time."],
  },
  {
    id: "PW_FIRE_MONITORING",
    context: "amazonia",
    threatId: pressureId("fire"),
    threatLabel: "Fire / thermal disturbance",
    solutionId: solutionId("monitoring-systems"),
    solutionLabel: "Monitoring systems",
    strengthened: ["Carbon storage", "Biodiversity habitat", "Rainfall regulation"],
    supportedHumanSystems: ["Climate", "Agriculture"],
    sourceIds: ["INPE", "MAPBIOMAS"],
    confidence: "Medium",
    donorReview: "Reviewed",
    dataGaps: ["Monitoring enables response but does not by itself stop fire."],
  },
  {
    id: "PW_MINING_LEGAL",
    context: "amazonia",
    threatId: pressureId("illegal-mining"),
    threatLabel: "Illegal mining",
    solutionId: solutionId("legal-protection"),
    solutionLabel: "Legal protection + enforcement",
    strengthened: ["Biodiversity habitat"],
    supportedHumanSystems: ["Water", "Indigenous livelihoods"],
    sourceIds: ["RAISG"],
    confidence: "Medium",
    donorReview: "Reviewed",
    dataGaps: ["Water-quality state is not yet resolved in the current shared graph; enforcement varies."],
  },
  {
    id: "PW_SUPPLY_REFORM",
    context: "amazonia",
    threatId: pressureId("supply-chain-pressure"),
    threatLabel: "Supply-chain pressure",
    solutionId: solutionId("supply-chain-reform"),
    solutionLabel: "Supply-chain reform",
    strengthened: ["Carbon storage", "Biodiversity habitat"],
    supportedHumanSystems: ["Climate", "Food"],
    sourceIds: ["WWF_AMAZON"],
    confidence: "Medium",
    donorReview: "Reviewed",
    dataGaps: ["Attribution by commodity is partial."],
  },
  {
    id: "PW_LANDUSE_INDIGENOUS",
    context: "amazonia",
    threatId: pressureId("land-use-change"),
    threatLabel: "Land-use change",
    solutionId: solutionId("indigenous-stewardship"),
    solutionLabel: "Indigenous stewardship",
    strengthened: ["Biodiversity habitat", "Rainfall regulation"],
    supportedHumanSystems: ["Indigenous livelihoods", "Climate", "Water"],
    sourceIds: ["RAISG", "WWF_AMAZON"],
    confidence: "Medium",
    donorReview: "Reviewed",
    dataGaps: ["Outcomes vary by territory, rights and governance context."],
  },
  {
    id: "PW_PESTICIDES_REDUCTION",
    context: "pollination",
    threatId: pressureId("pesticide-pressure"),
    threatLabel: "Pesticide pressure",
    solutionId: solutionId("pesticide-reduction"),
    solutionLabel: "Pesticide reduction",
    strengthened: ["Pollination", "Food production"],
    supportedHumanSystems: ["Food", "Agriculture"],
    sourceIds: ["IPBES"],
    confidence: "Medium",
    donorReview: "Reviewed",
    dataGaps: ["Field effect sizes vary by context and practice."],
  },
  {
    id: "PW_HABITAT_POLLINATOR",
    context: "pollination",
    threatId: pressureId("habitat-loss"),
    threatLabel: "Habitat loss",
    solutionId: solutionId("pollinator-habitat"),
    solutionLabel: "Pollinator habitat",
    strengthened: ["Pollination", "Biodiversity habitat"],
    supportedHumanSystems: ["Food"],
    sourceIds: ["IPBES"],
    confidence: "Medium",
    donorReview: "Reviewed",
    dataGaps: ["Habitat outcomes depend on placement and management."],
  },
];

export interface DecisionSignal {
  id: string;
  context: "amazonia" | "pollination";
  title: string;
  solutionId: string;
  threatIds: string[];
  leverage: DecisionLevel;
  urgency: DecisionLevel;
  confidence: DecisionLevel;
  implementationDifficulty: DecisionLevel;
  timeHorizon: TimeHorizon;
  reasoning: string;
  dataGaps: string[];
  sourceIds: string[];
  donorReview: "Reviewed" | "Draft";
}

export const DECISION_SIGNALS: DecisionSignal[] = [
  {
    id: "DS_PROTECTED_AREAS",
    context: "amazonia",
    title: "Protected areas as a high-leverage forest-protection pathway",
    solutionId: solutionId("protected-areas"),
    threatIds: [pressureId("deforestation"), pressureId("land-use-change")],
    leverage: "High",
    urgency: "High",
    confidence: "Medium",
    implementationDifficulty: "Medium",
    timeHorizon: "Long-term",
    reasoning: "Where effectively governed, protected areas may reduce forest conversion, which could help sustain carbon storage, habitat and rainfall regulation that several human systems depend on.",
    dataGaps: ["Effectiveness depends heavily on governance and enforcement."],
    sourceIds: ["WWF_AMAZON", "RAISG"],
    donorReview: "Reviewed",
  },
  {
    id: "DS_INDIGENOUS",
    context: "amazonia",
    title: "Indigenous stewardship as a high-leverage governance pathway",
    solutionId: solutionId("indigenous-stewardship"),
    threatIds: [pressureId("land-use-change"), pressureId("deforestation")],
    leverage: "High",
    urgency: "Medium",
    confidence: "Medium",
    implementationDifficulty: "Medium",
    timeHorizon: "Long-term",
    reasoning: "Indigenous stewardship is associated with forest-protection outcomes in many contexts, which could help sustain habitat and ecosystem integrity. Outcomes are context-dependent, not guaranteed.",
    dataGaps: ["Outcomes vary by territory, rights and governance context."],
    sourceIds: ["RAISG", "WWF_AMAZON"],
    donorReview: "Reviewed",
  },
  {
    id: "DS_MONITORING",
    context: "amazonia",
    title: "Monitoring systems as a high-urgency detection pathway",
    solutionId: solutionId("monitoring-systems"),
    threatIds: [pressureId("deforestation"), pressureId("fire"), pressureId("illegal-mining")],
    leverage: "Medium",
    urgency: "High",
    confidence: "Medium",
    implementationDifficulty: "Medium",
    timeHorizon: "Immediate",
    reasoning: "Satellite and field monitoring can enable faster response to deforestation, fire and illegal mining. Detection supports action but does not by itself prevent loss.",
    dataGaps: ["Detection must be paired with response/enforcement capacity to have effect."],
    sourceIds: ["INPE", "MAPBIOMAS"],
    donorReview: "Reviewed",
  },
  {
    id: "DS_RESTORATION",
    context: "amazonia",
    title: "Forest restoration as a long-term resilience pathway",
    solutionId: solutionId("forest-restoration"),
    threatIds: [pressureId("forest-degradation")],
    leverage: "Medium",
    urgency: "Medium",
    confidence: "Medium",
    implementationDifficulty: "High",
    timeHorizon: "Long-term",
    reasoning: "Restoration can support carbon storage and habitat over time, but outcomes depend on method, scale and time, and it does not replace avoiding loss in the first place.",
    dataGaps: ["Outcomes depend on method, scale and time."],
    sourceIds: ["AMAZON_INSTITUTIONAL"],
    donorReview: "Draft",
  },
  {
    id: "DS_PESTICIDE_REDUCTION",
    context: "pollination",
    title: "Pesticide reduction as a high-urgency pollinator-protection pathway",
    solutionId: solutionId("pesticide-reduction"),
    threatIds: [pressureId("pesticide-pressure")],
    leverage: "High",
    urgency: "High",
    confidence: "Medium",
    implementationDifficulty: "Medium",
    timeHorizon: "Short-term",
    reasoning: "Reducing pesticide pressure can help pollinator health and the pollination that crop production relies on. Effect sizes vary by practice and context.",
    dataGaps: ["Field and laboratory effect sizes differ."],
    sourceIds: ["IPBES"],
    donorReview: "Reviewed",
  },
  {
    id: "DS_POLLINATOR_HABITAT",
    context: "pollination",
    title: "Pollinator habitat as a resilience pathway",
    solutionId: solutionId("pollinator-habitat"),
    threatIds: [pressureId("habitat-loss")],
    leverage: "Medium",
    urgency: "Medium",
    confidence: "Medium",
    implementationDifficulty: "Low",
    timeHorizon: "Short-term",
    reasoning: "Providing forage and habitat can support pollinator populations and the resilience of pollination. Outcomes depend on placement and management.",
    dataGaps: ["Wild vs managed pollinator dynamics are not fully mapped in this recovered model."],
    sourceIds: ["IPBES"],
    donorReview: "Reviewed",
  },
];

export interface LearningRecord {
  id: string;
  context: "amazonia" | "pollination";
  title: string;
  decisionSignalIds: string[];
  whatWasExpected: string;
  whatWasObserved: string;
  whatWeLearned: string;
  decisionImplication: string;
  confidenceBefore: DecisionLevel;
  confidenceAfter: DecisionLevel;
  sourceIds: string[];
  donorReview: "Reviewed" | "Draft";
  dataGaps?: string[];
}

export const LEARNING_RECORDS: LearningRecord[] = [
  {
    id: "LR_PROTECTED_AREAS",
    context: "amazonia",
    title: "Protection status alone is not enough",
    decisionSignalIds: ["DS_PROTECTED_AREAS"],
    whatWasExpected: "Protected areas may reduce conversion and support carbon and habitat.",
    whatWasObserved: "Outcomes are context-dependent; governance and enforcement appear decisive.",
    whatWeLearned: "Protection status alone is not enough — governance, enforcement and local context shape outcomes.",
    decisionImplication: "Treat protected areas as necessary but not sufficient; weight governance alongside designation.",
    confidenceBefore: "Medium",
    confidenceAfter: "Medium",
    sourceIds: ["WWF_AMAZON", "RAISG"],
    donorReview: "Reviewed",
  },
  {
    id: "LR_INDIGENOUS",
    context: "amazonia",
    title: "Rights and governance are key conditions",
    decisionSignalIds: ["DS_INDIGENOUS"],
    whatWasExpected: "Indigenous stewardship may support forest protection and integrity.",
    whatWasObserved: "Strong association in many regions, varying with recognition and pressure.",
    whatWeLearned: "Legal recognition, rights and territorial protection are important contextual conditions for outcomes.",
    decisionImplication: "Support rights recognition and governance as part of the pathway, not just designation.",
    confidenceBefore: "Medium",
    confidenceAfter: "Medium",
    sourceIds: ["RAISG", "WWF_AMAZON"],
    donorReview: "Reviewed",
  },
  {
    id: "LR_MONITORING",
    context: "amazonia",
    title: "Monitoring needs a response attached",
    decisionSignalIds: ["DS_MONITORING"],
    whatWasExpected: "Monitoring may improve early detection of loss.",
    whatWasObserved: "Detection can be strong, but does not by itself create enforcement or restoration.",
    whatWeLearned: "Monitoring is most useful when connected to response capacity and governance.",
    decisionImplication: "Pair monitoring investment with response capacity to realise value.",
    confidenceBefore: "Medium",
    confidenceAfter: "Medium",
    sourceIds: ["INPE", "MAPBIOMAS"],
    donorReview: "Reviewed",
    dataGaps: ["Response capacity is not yet modelled as a first-class current object."],
  },
  {
    id: "LR_RESTORATION",
    context: "amazonia",
    title: "Restoration is long-term, not a substitute for protection",
    decisionSignalIds: ["DS_RESTORATION"],
    whatWasExpected: "Restoration may rebuild carbon and habitat over time.",
    whatWasObserved: "Recovery is slow and depends on method, history and future protection; no current 4PLANET time-series proves an outcome here.",
    whatWeLearned: "Restoration is a long-term resilience pathway, not an immediate substitute for protecting intact ecosystems.",
    decisionImplication: "Prioritise protecting intact forest first; treat restoration as a slower complementary pathway.",
    confidenceBefore: "Medium",
    confidenceAfter: "Low",
    sourceIds: ["AMAZON_INSTITUTIONAL"],
    donorReview: "Draft",
    dataGaps: ["No observed 4PLANET time-series in the recovered donor model."],
  },
  {
    id: "LR_PESTICIDE_REDUCTION",
    context: "pollination",
    title: "Pesticide reduction works best with habitat",
    decisionSignalIds: ["DS_PESTICIDE_REDUCTION"],
    whatWasExpected: "Reducing pesticide pressure may support pollinator health and pollination.",
    whatWasObserved: "Beneficial direction, conditioned by pesticide type, exposure, habitat and management.",
    whatWeLearned: "Pesticide reduction is stronger when combined with habitat and landscape-level measures.",
    decisionImplication: "Combine pesticide reduction with habitat measures rather than treating it as a standalone fix.",
    confidenceBefore: "Medium",
    confidenceAfter: "Medium",
    sourceIds: ["IPBES"],
    donorReview: "Reviewed",
  },
  {
    id: "LR_POLLINATOR_HABITAT",
    context: "pollination",
    title: "Habitat quality matters more than area alone",
    decisionSignalIds: ["DS_POLLINATOR_HABITAT"],
    whatWasExpected: "Pollinator habitat may support pollinator populations and pollination.",
    whatWasObserved: "Outcomes appear driven by habitat quality, connectivity and plant diversity.",
    whatWeLearned: "Habitat interventions should focus on quality and connectivity rather than area alone.",
    decisionImplication: "Do not use hectares alone as a proxy for ecological value.",
    confidenceBefore: "Medium",
    confidenceAfter: "Medium",
    sourceIds: ["IPBES"],
    donorReview: "Reviewed",
  },
];

type SupportsEdge = { from: string; to: string; label: string; sourceIds: string[] };
const serviceId = (slug: string) => `service:4p:${slug}`;

export const RECOVERED_SUPPORT_EDGES: SupportsEdge[] = [
  { from: systemId("amazonia"), to: serviceId("carbon-storage"), label: "supports carbon storage", sourceIds: ["AMAZON_INSTITUTIONAL"] },
  { from: systemId("amazonia"), to: serviceId("biodiversity-habitat"), label: "supports biodiversity habitat", sourceIds: ["WWF_AMAZON"] },
  { from: systemId("amazonia"), to: serviceId("rainfall-regulation"), label: "supports rainfall regulation", sourceIds: ["AMAZON_INSTITUTIONAL"] },
  { from: systemId("amazonia"), to: serviceId("water-cycling"), label: "supports water cycling", sourceIds: ["AMAZON_INSTITUTIONAL"] },
  { from: serviceId("carbon-storage"), to: humanSystemId("climate"), label: "supports climate regulation", sourceIds: ["AMAZON_INSTITUTIONAL"] },
  { from: serviceId("rainfall-regulation"), to: humanSystemId("water"), label: "supports water systems", sourceIds: ["AMAZON_INSTITUTIONAL"] },
  { from: serviceId("rainfall-regulation"), to: humanSystemId("agriculture"), label: "supports agriculture", sourceIds: ["AMAZON_INSTITUTIONAL"] },
  { from: serviceId("biodiversity-habitat"), to: humanSystemId("food-system"), label: "supports food-system resilience", sourceIds: ["WWF_AMAZON"] },
  { from: functionId("pollination"), to: serviceId("food-production"), label: "supports food production", sourceIds: ["IPBES"] },
  { from: serviceId("food-production"), to: humanSystemId("food-system"), label: "supports the food system", sourceIds: ["IPBES"] },
];

export interface CascadeNode {
  id: string;
  label: string;
  depth: number;
  provenance: "CURRENT_GRAPH" | "RECOVERED_LSI_1_4_2";
}

function recoveredLabel(id: string): string | undefined {
  const labels: Record<string, string> = {
    [systemId("amazonia")]: "Amazonia",
    [serviceId("carbon-storage")]: "Carbon storage",
    [serviceId("biodiversity-habitat")]: "Biodiversity habitat",
    [serviceId("rainfall-regulation")]: "Rainfall regulation",
    [serviceId("water-cycling")]: "Water cycling",
    [serviceId("food-production")]: "Food production",
    [humanSystemId("climate")]: "Climate",
    [humanSystemId("water")]: "Water",
    [humanSystemId("agriculture")]: "Agriculture",
    [humanSystemId("food-system")]: "Food system",
  };
  return labels[id];
}

export function entityLabel(id: string): string {
  return nodeById(id)?.label
    ?? systemById(id)?.name
    ?? pressureById(id)?.name
    ?? solutionById(id)?.name
    ?? recoveredLabel(id)
    ?? id;
}

/** Restored Dependency Intelligence primitive: layered downstream traversal. */
export function failureCascade(startId: string, maxDepth = 6): CascadeNode[][] {
  const currentEdges: SupportsEdge[] = RELATIONS
    .filter((r) => r.type === "SUPPORTS" || r.type === "PERFORMS")
    .map((r) => ({ from: r.from, to: r.to, label: r.type, sourceIds: [] }));
  const edges = [...currentEdges, ...RECOVERED_SUPPORT_EDGES];
  const layers: CascadeNode[][] = [[{ id: startId, label: entityLabel(startId), depth: 0, provenance: recoveredLabel(startId) ? "RECOVERED_LSI_1_4_2" : "CURRENT_GRAPH" }]];
  const seen = new Set<string>([startId]);
  let frontier = [startId];
  for (let depth = 1; depth <= maxDepth && frontier.length; depth += 1) {
    const next: CascadeNode[] = [];
    for (const from of frontier) {
      for (const edge of edges.filter((e) => e.from === from)) {
        if (seen.has(edge.to)) continue;
        seen.add(edge.to);
        next.push({
          id: edge.to,
          label: entityLabel(edge.to),
          depth,
          provenance: RECOVERED_SUPPORT_EDGES.some((e) => e.from === edge.from && e.to === edge.to)
            ? "RECOVERED_LSI_1_4_2"
            : "CURRENT_GRAPH",
        });
      }
    }
    if (!next.length) break;
    layers.push(next);
    frontier = next.map((n) => n.id);
  }
  return layers;
}

export interface DecisionContext {
  anchorSlug: "amazonia" | "pollination";
  scopeLabel: string;
  startNodeId: string;
  pathways: SolutionPathway[];
  signals: DecisionSignal[];
  learning: LearningRecord[];
  sourceRefs: RecoveredSourceRef[];
  cascade: CascadeNode[][];
  truthBoundary: string;
}

export function decisionContextForAnchor(anchorSlug: string): DecisionContext | null {
  if (anchorSlug !== "amazonia" && anchorSlug !== "pollination") return null;
  const context = anchorSlug;
  const pathways = SOLUTION_PATHWAYS.filter((p) => p.context === context);
  const signals = DECISION_SIGNALS.filter((s) => s.context === context);
  const learning = LEARNING_RECORDS.filter((l) => l.context === context);
  const sourceIds = new Set([...pathways, ...signals, ...learning].flatMap((x) => x.sourceIds));
  const sourceRefs = Array.from(sourceIds)
    .map((id) => RECOVERED_SOURCE_REFS[id])
    .filter((s): s is RecoveredSourceRef => Boolean(s));
  const startNodeId = context === "amazonia" ? systemId("amazonia") : functionId("pollination");
  return {
    anchorSlug: context,
    scopeLabel: context === "amazonia" ? "AMAZONIA · GEO-BOUNDED DECISION CONTEXT" : "POLLINATION → FOOD · SYSTEM DECISION CONTEXT",
    startNodeId,
    pathways,
    signals,
    learning,
    sourceRefs,
    cascade: failureCascade(startNodeId),
    truthBoundary: "Recovered LSI 1.4.2 reasoning. Structured decision intelligence, not automated advice. Donor source/review states are preserved and require current Source Contract re-review before any stronger claim.",
  };
}

export function recoveredIntelligenceIntegrity() {
  const orphanSignalIds = LEARNING_RECORDS.flatMap((l) => l.decisionSignalIds).filter((id) => !DECISION_SIGNALS.some((d) => d.id === id));
  const missingSources = new Set([...SOLUTION_PATHWAYS, ...DECISION_SIGNALS, ...LEARNING_RECORDS]
    .flatMap((x) => x.sourceIds)
    .filter((id) => !RECOVERED_SOURCE_REFS[id]));
  return {
    pathways: SOLUTION_PATHWAYS.length,
    signals: DECISION_SIGNALS.length,
    learningRecords: LEARNING_RECORDS.length,
    sourceRefs: Object.keys(RECOVERED_SOURCE_REFS).length,
    orphanSignalIds,
    missingSources: Array.from(missingSources),
  };
}
