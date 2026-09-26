/* ═══════════════════════════════════════════════════════════════════════════
   4PLANET_ — RECOVERED TRUST / CLAIM / DATA-QUALITY INTELLIGENCE

   Selective adapter from Living Systems Intelligence 1.4.2. The current
   `src/planet` model remains the receiver and single runtime truth boundary.
   Nothing in this file upgrades donor review status into current verification.
   ═══════════════════════════════════════════════════════════════════════════ */

import { functionId, humanSystemId, pressureId, systemId, taxonId } from "./ids";
import { RECOVERED_SOURCE_REFS, type RecoveredSourceRef } from "./decisionIntelligence";

export type DonorClaimReview = "Verified" | "Reviewed" | "NeedsSource" | "NeedsUpdate" | "Draft";
export type DonorConfidence = "High" | "Medium" | "Low";

export interface RecoveredTrustSource extends RecoveredSourceRef {
  trustLevel?: "High" | "Moderate" | "Unknown";
  donorQuality?: string;
}

const EXTRA_SOURCES: Record<string, RecoveredTrustSource> = {
  IUCN_RED_LIST: {
    id: "IUCN_RED_LIST",
    label: "IUCN Red List of Threatened Species",
    authority: "International Union for Conservation of Nature",
    donorReview: "VERIFIED",
    url: "https://www.iucnredlist.org",
    trustLevel: "High",
    donorQuality: "ScientificAssessment · Primary",
    note: "Verified in the donor registry on 2026-06-07; current 4PLANET Source Contract review is still separate.",
  },
  PANTHERA: {
    id: "PANTHERA",
    label: "Panthera",
    authority: "Panthera",
    donorReview: "VERIFIED",
    url: "https://panthera.org",
    trustLevel: "Moderate",
    donorQuality: "Conservation organisation / research institution",
    note: "Verified in the donor registry; current rights/source-contract state is not inferred from that donor status.",
  },
  FAO: {
    id: "FAO",
    label: "FAO — Pollinators & Food Systems",
    authority: "UN Food and Agriculture Organization",
    donorReview: "NEEDS_REVIEW",
    url: "https://www.fao.org",
    trustLevel: "High",
    donorQuality: "Institutional dataset",
    note: "Donor marked NeedsReview. Used for pollination-food links and food-system dependencies.",
  },
  IPCC: {
    id: "IPCC",
    label: "IPCC Assessment Reports",
    authority: "Intergovernmental Panel on Climate Change",
    donorReview: "NEEDS_REVIEW",
    url: "https://www.ipcc.ch",
    trustLevel: "High",
    donorQuality: "Scientific assessment · Primary",
    note: "Donor marked NeedsReview; current claim-level citation still needs precise report/chapter resolution.",
  },
  NASA: {
    id: "NASA",
    label: "NASA Earth Observation",
    authority: "U.S. National Aeronautics and Space Administration",
    donorReview: "NEEDS_REVIEW",
    url: "https://www.nasa.gov",
    trustLevel: "High",
    donorQuality: "Government monitoring",
    note: "Donor marked NeedsReview; specific dataset/product must remain explicit at claim level.",
  },
  NOAA: {
    id: "NOAA",
    label: "NOAA Fisheries",
    authority: "U.S. National Oceanic and Atmospheric Administration",
    donorReview: "VERIFIED",
    url: "https://www.fisheries.noaa.gov",
    trustLevel: "High",
    donorQuality: "Government monitoring",
    note: "Donor verified source node. Current 4PLANET claim checks remain date/scope specific.",
  },
  IWC: {
    id: "IWC",
    label: "International Whaling Commission",
    authority: "International Whaling Commission",
    donorReview: "VERIFIED",
    url: "https://iwc.int",
    trustLevel: "High",
    donorQuality: "Conservation authority",
    note: "Donor verified source node; current use must preserve population/ecotype boundaries.",
  },
  INTERNAL: {
    id: "INTERNAL",
    label: "4PLANET Internal Analysis",
    authority: "4PLANET",
    donorReview: "NEEDS_REVIEW",
    trustLevel: "Unknown",
    donorQuality: "Internal synthesis",
    note: "Structure/synthesis only. Never a primary external evidence source.",
  },
};

export const recoveredSource = (id: string): RecoveredTrustSource | undefined =>
  (RECOVERED_SOURCE_REFS[id] as RecoveredTrustSource | undefined) ?? EXTRA_SOURCES[id];

export const ALL_RECOVERED_TRUST_SOURCES: Record<string, RecoveredTrustSource> = {
  ...RECOVERED_SOURCE_REFS,
  ...EXTRA_SOURCES,
};

export interface RecoveredClaim {
  id: string;
  context: "amazonia" | "pollination" | "orca" | "jaguar" | "other";
  donorTargetId: string;
  currentTargetId?: string;
  statement: string;
  sourceIds: string[];
  confidence: DonorConfidence;
  donorReview: DonorClaimReview;
  lastReviewed?: string;
  dataGaps?: string[];
  explanation?: string;
}

/**
 * High-value claim registry preserved from LSI 1.4.2. IDs/statements/source IDs
 * are donor lineage. `currentTargetId` is only supplied where the current Planet
 * Model has a safe canonical mapping. No mapping means no silent guess.
 */
export const RECOVERED_CLAIMS: RecoveredClaim[] = [
  {
    id: "CLAIM_ORCA_POPULATION", context: "orca", donorTargetId: "SP_ORCA", currentTargetId: taxonId(2440483),
    statement: "The global orca population is estimated at at least ~50,000 individuals.",
    sourceIds: ["IUCN_RED_LIST"], confidence: "Medium", donorReview: "Verified", lastReviewed: "2026-06-07",
    dataGaps: ["Estimates vary widely between regions and surveys."],
  },
  {
    id: "CLAIM_JAGUAR_RANGE_LOSS", context: "jaguar", donorTargetId: "SP_JAGUAR",
    statement: "Jaguars have reportedly lost around 50% of their historic range.",
    sourceIds: ["IUCN_RED_LIST", "PANTHERA"], confidence: "Medium", donorReview: "Reviewed", lastReviewed: "2026-06-07",
  },
  {
    id: "CLAIM_BEE_POLLINATION", context: "pollination", donorTargetId: "SP_HONEY_BEE", currentTargetId: taxonId(1341976),
    statement: "The western honey bee performs pollination, transferring pollen that fertilises many flowering plants.",
    sourceIds: ["IPBES", "FAO"], confidence: "High", donorReview: "Reviewed", lastReviewed: "2026-06-08",
    dataGaps: ["Relative contribution varies by crop and region."],
  },
  {
    id: "CLAIM_BEE_HABITAT", context: "pollination", donorTargetId: "SP_HONEY_BEE", currentTargetId: taxonId(1341976),
    statement: "Honey bee colonies depend on diverse floral resources and habitat for forage.",
    sourceIds: ["IPBES"], confidence: "Medium", donorReview: "Reviewed",
    dataGaps: ["Forage availability not yet mapped by region."],
  },
  {
    id: "CLAIM_BEE_THREATS", context: "pollination", donorTargetId: "SP_HONEY_BEE", currentTargetId: taxonId(1341976),
    statement: "Honey bee health can be weakened by pesticide exposure, disease and habitat loss.",
    sourceIds: ["IPBES", "FAO"], confidence: "Medium", donorReview: "Reviewed",
    dataGaps: ["Relative weight of each driver remains uncertain."],
  },
  {
    id: "CLAIM_POLLINATION_REPRO", context: "pollination", donorTargetId: "FN_POLLINATION", currentTargetId: functionId("pollination"),
    statement: "Pollination supports the reproduction of many wild flowering plants.",
    sourceIds: ["IPBES"], confidence: "High", donorReview: "Verified",
  },
  {
    id: "CLAIM_POLLINATION_CROPS", context: "pollination", donorTargetId: "FN_POLLINATION", currentTargetId: functionId("pollination"),
    statement: "Pollination supports crop production for a substantial share of food crops.",
    sourceIds: ["IPBES", "FAO"], confidence: "High", donorReview: "Reviewed",
    dataGaps: ["Exact share depends on crop mix and measurement method."],
  },
  {
    id: "CLAIM_POLLINATION_DEPENDS_POLLINATORS", context: "pollination", donorTargetId: "FN_POLLINATION", currentTargetId: functionId("pollination"),
    statement: "Pollination depends on pollinators such as bees and other insects.",
    sourceIds: ["IPBES"], confidence: "High", donorReview: "Verified",
  },
  {
    id: "CLAIM_FOOD_DEP_POLLINATION", context: "pollination", donorTargetId: "HS_FOOD", currentTargetId: humanSystemId("food-system"),
    statement: "The food system depends in part on pollination through crop production.",
    sourceIds: ["IPBES", "FAO"], confidence: "Medium", donorReview: "Reviewed",
    dataGaps: ["Quantitative dependency strength not yet modelled."],
  },
  {
    id: "CLAIM_PESTICIDES_POLLINATOR", context: "pollination", donorTargetId: "TH_PESTICIDES", currentTargetId: pressureId("pesticide-pressure"),
    statement: "Pesticide use can reduce pollinator health and abundance.",
    sourceIds: ["IPBES"], confidence: "Medium", donorReview: "Reviewed",
    dataGaps: ["Field and laboratory effect sizes differ."],
  },
  {
    id: "CLAIM_POLLINATOR_DECLINE_SERVICE", context: "pollination", donorTargetId: "FN_POLLINATION", currentTargetId: functionId("pollination"),
    statement: "Pollinator decline can weaken the pollination that crops rely on.",
    sourceIds: ["IPBES"], confidence: "Medium", donorReview: "Reviewed",
  },
  {
    id: "CLAIM_AMAZON_CARBON", context: "amazonia", donorTargetId: "EC_AMAZON_RAINFOREST", currentTargetId: systemId("amazonia"),
    statement: "The Amazon rainforest stores large amounts of carbon, supporting climate regulation.",
    sourceIds: ["IPCC", "NASA", "AMAZON_INSTITUTIONAL"], confidence: "Medium", donorReview: "NeedsSource",
    dataGaps: ["Specific carbon-stock sources still to be itemised."],
  },
  {
    id: "CLAIM_AMAZON_BIODIVERSITY", context: "amazonia", donorTargetId: "EC_AMAZON_RAINFOREST", currentTargetId: systemId("amazonia"),
    statement: "The Amazon rainforest provides habitat for a very large share of terrestrial biodiversity.",
    sourceIds: ["AMAZON_INSTITUTIONAL"], confidence: "Medium", donorReview: "NeedsSource",
  },
  {
    id: "CLAIM_AMAZON_RAINFALL", context: "amazonia", donorTargetId: "EC_AMAZON_RAINFOREST", currentTargetId: systemId("amazonia"),
    statement: "The Amazon is associated with regional rainfall generation ('flying rivers') that can influence agriculture.",
    sourceIds: ["AMAZON_INSTITUTIONAL"], confidence: "Medium", donorReview: "Reviewed",
    dataGaps: ["Strength of the effect varies regionally."],
  },
  {
    id: "CLAIM_AMAZON_EVAPOTRANSPIRATION", context: "amazonia", donorTargetId: "SV_WATER_CYCLING",
    statement: "Amazon forest cover contributes to water cycling through evapotranspiration.",
    sourceIds: ["AMAZON_INSTITUTIONAL", "NASA"], confidence: "Medium", donorReview: "Reviewed",
  },
  {
    id: "CLAIM_RAINFALL_AGRICULTURE", context: "amazonia", donorTargetId: "SV_RAINFALL_REGULATION", currentTargetId: humanSystemId("agriculture"),
    statement: "Rainfall regulation supports regional agriculture and water availability.",
    sourceIds: ["AMAZON_INSTITUTIONAL", "FAO"], confidence: "Medium", donorReview: "Reviewed",
    dataGaps: ["Quantitative dependency strength not yet modelled."],
  },
  {
    id: "CLAIM_DEFOR_CARBON", context: "amazonia", donorTargetId: "TH_DEFORESTATION", currentTargetId: pressureId("deforestation"),
    statement: "Deforestation and forest degradation can weaken carbon storage.",
    sourceIds: ["IPCC", "INPE"], confidence: "Medium", donorReview: "Reviewed",
  },
  {
    id: "CLAIM_AMAZON_BIODIV_HABITAT", context: "amazonia", donorTargetId: "SV_BIODIVERSITY_HABITAT",
    statement: "The Amazon provides habitat for high levels of biodiversity.",
    sourceIds: ["AMAZON_INSTITUTIONAL", "WWF_AMAZON"], confidence: "Medium", donorReview: "Reviewed",
  },
  {
    id: "CLAIM_AMAZON_FIRE", context: "amazonia", donorTargetId: "TH_FIRE", currentTargetId: pressureId("fire"),
    statement: "Fire and forest degradation threaten Amazon ecosystem integrity.",
    sourceIds: ["INPE", "WWF_AMAZON"], confidence: "Medium", donorReview: "Reviewed",
    dataGaps: ["Fire, climate and deforestation interactions are complex."],
  },
  {
    id: "CLAIM_INDIGENOUS_PROTECTION", context: "amazonia", donorTargetId: "SO_INDIGENOUS_STEWARDSHIP",
    statement: "Indigenous territories and stewardship are associated with significant forest protection outcomes in many contexts.",
    sourceIds: ["RAISG", "WWF_AMAZON"], confidence: "Medium", donorReview: "Reviewed",
    explanation: "Association observed in many studies; outcomes are context-dependent, not guaranteed.",
    dataGaps: ["Outcomes vary by territory and governance context."],
  },
  {
    id: "CLAIM_ILLEGAL_MINING_WATER", context: "amazonia", donorTargetId: "TH_ILLEGAL_MINING", currentTargetId: pressureId("illegal-mining"),
    statement: "Illegal mining can threaten water quality, ecosystems and Indigenous communities.",
    sourceIds: ["RAISG"], confidence: "Medium", donorReview: "Reviewed",
    dataGaps: ["Extent and mercury impacts not fully mapped."],
  },
  {
    id: "CLAIM_FOREST_RESTORATION", context: "amazonia", donorTargetId: "SO_FOREST_RESTORATION",
    statement: "Forest restoration can support biodiversity habitat and carbon storage.",
    sourceIds: ["AMAZON_INSTITUTIONAL"], confidence: "Medium", donorReview: "Reviewed",
    dataGaps: ["Outcomes depend on method, scale and time."],
  },
  {
    id: "CLAIM_PROTECTED_AREAS", context: "amazonia", donorTargetId: "SO_PROTECTED_AREAS",
    statement: "Protected areas can help reduce ecosystem conversion and habitat loss.",
    sourceIds: ["WWF_AMAZON", "RAISG"], confidence: "Medium", donorReview: "Reviewed",
  },
  {
    id: "CLAIM_SUPPLY_CHAIN", context: "amazonia", donorTargetId: "TH_SUPPLY_CHAIN_PRESSURE", currentTargetId: pressureId("supply-chain-pressure"),
    statement: "Supply chain pressure is a driver of deforestation risk in parts of the Amazon.",
    sourceIds: ["WWF_AMAZON"], confidence: "Medium", donorReview: "Reviewed",
    dataGaps: ["Attribution by commodity is partial."],
  },
  {
    id: "CLAIM_CLIMATE_INTERACTION", context: "amazonia", donorTargetId: "TH_CLIMATE_CHANGE",
    statement: "Climate stress can interact with deforestation and fire risk.",
    sourceIds: ["IPCC"], confidence: "Medium", donorReview: "Reviewed",
  },
  {
    id: "CLAIM_RAINFALL_RISK", context: "amazonia", donorTargetId: "SV_RAINFALL_REGULATION",
    statement: "Weakening rainfall regulation may create risks for agriculture and water systems.",
    sourceIds: ["AMAZON_INSTITUTIONAL"], confidence: "Low", donorReview: "NeedsSource",
    dataGaps: ["Thresholds and regional variation not yet quantified."],
  },
  {
    id: "CLAIM_AMAZON_CASCADE", context: "amazonia", donorTargetId: "EC_AMAZON_RAINFOREST", currentTargetId: systemId("amazonia"),
    statement: "Amazon ecosystem degradation can create cascading risks across ecological and human systems.",
    sourceIds: ["AMAZON_INSTITUTIONAL", "IPCC"], confidence: "Low", donorReview: "Draft",
    dataGaps: ["Cascade magnitudes are illustrative, not yet quantified."],
  },
  {
    id: "CLAIM_PESTICIDES_REDUCTION", context: "pollination", donorTargetId: "SO_PESTICIDE_REDUCTION",
    statement: "Pesticide reduction can reduce pressure on pollinators and support pollination services.",
    sourceIds: ["IPBES"], confidence: "Medium", donorReview: "Reviewed",
    dataGaps: ["Outcomes depend on practice and context."],
  },
  {
    id: "CLAIM_POLLINATOR_HABITAT", context: "pollination", donorTargetId: "SO_POLLINATOR_HABITAT",
    statement: "Pollinator habitat can support pollinator populations and pollination resilience.",
    sourceIds: ["IPBES"], confidence: "Medium", donorReview: "Reviewed",
  },
];

export type DataQualityIssueType = "NeedsQuantification" | "RegionalVariation" | "MissingURL" | "IncompleteMetadata" | "ContextDependency" | "WeakSource";
export interface RecoveredDataQualityIssue {
  id: string;
  context: "amazonia" | "pollination" | "global";
  targetType: string;
  targetId: string;
  issueType: DataQualityIssueType;
  severity: "High" | "Medium" | "Low";
  note: string;
  suggestedFix: string;
}

export const RECOVERED_DATA_QUALITY: RecoveredDataQualityIssue[] = [
  { id: "DQ_AMAZON_RAINFALL_QUANT", context: "amazonia", targetType: "Node", targetId: "EC_AMAZON_RAINFOREST", issueType: "NeedsQuantification", severity: "Medium", note: "Amazon rainfall and moisture-recycling roles are well-supported qualitatively, but the magnitude varies by region and method.", suggestedFix: "Add region-specific quantitative ranges with peer-reviewed sources where available." },
  { id: "DQ_POLLINATION_VARIATION", context: "pollination", targetType: "Node", targetId: "FN_POLLINATION", issueType: "RegionalVariation", severity: "Medium", note: "Pollination dependency is strong overall but varies by crop, geography and pollinator group; it is not uniform.", suggestedFix: "Differentiate crop- and region-level dependence rather than a single global figure." },
  { id: "DQ_AMAZON_DATASET_URLS", context: "amazonia", targetType: "Source", targetId: "MAPBIOMAS", issueType: "MissingURL", severity: "Low", note: "Amazon monitoring datasets are referenced at organisation level; specific dataset URLs and access dates still require verification.", suggestedFix: "Add verified dataset URLs and access dates without fabricating precise report identifiers." },
  { id: "DQ_INPE_URL", context: "amazonia", targetType: "Source", targetId: "INPE", issueType: "MissingURL", severity: "Low", note: "INPE deforestation monitoring is credible at institution level; the precise dataset URL needs verification.", suggestedFix: "Confirm and add the specific monitoring-programme URL." },
  { id: "DQ_AMAZON_INSTITUTIONAL", context: "amazonia", targetType: "Source", targetId: "AMAZON_INSTITUTIONAL", issueType: "IncompleteMetadata", severity: "Medium", note: "A contextual institutional reference without a confirmed URL or precise publication metadata.", suggestedFix: "Replace with a specific, verifiable report once identified; keep marked until then." },
  { id: "DQ_RESTORATION_CONTEXT", context: "amazonia", targetType: "SolutionPathway", targetId: "PW_DEGRAD_RESTORATION", issueType: "ContextDependency", severity: "Medium", note: "Restoration outcomes depend on method, land-use history and protection from future disturbance; evidence is context-dependent.", suggestedFix: "Keep cautious framing; avoid presenting restoration as an immediate substitute for protection." },
  { id: "DQ_LEARNING_EXAMPLES", context: "amazonia", targetType: "LearningRecord", targetId: "LR_RESTORATION", issueType: "WeakSource", severity: "Low", note: "A structured learning example derived from existing evidence — not live field data or a 4PLANET implementation record.", suggestedFix: "Connect to live observed data only if and when it exists." },
  { id: "DQ_DECISION_QUALITATIVE", context: "amazonia", targetType: "DecisionSignal", targetId: "DS_PROTECTED_AREAS", issueType: "ContextDependency", severity: "Low", note: "Leverage and urgency are qualitative signals to support reasoning, not a final ranking or automated recommendation.", suggestedFix: "Preserve qualitative framing; do not present as a definitive priority order." },
  { id: "DQ_INTERNAL_SOURCE", context: "global", targetType: "Source", targetId: "INTERNAL", issueType: "WeakSource", severity: "Low", note: "Internal analysis used for structure and synthesis; not an external authority and should not be cited as primary evidence.", suggestedFix: "Back internal synthesis with external sources wherever a claim depends on it." },
];

const confidenceRank: Record<DonorConfidence, number> = { High: 3, Medium: 2, Low: 1 };
const reviewNeedsWork = (s: DonorClaimReview) => s === "NeedsSource" || s === "NeedsUpdate" || s === "Draft";

export const claimsForContext = (context: RecoveredClaim["context"]) => RECOVERED_CLAIMS.filter((c) => c.context === context);
export const claimsForCurrentEntity = (id: string) => RECOVERED_CLAIMS.filter((c) => c.currentTargetId === id);
export const dataQualityForContext = (context: "amazonia" | "pollination") => RECOVERED_DATA_QUALITY.filter((i) => i.context === context || i.context === "global");

export function trustSummaryForContext(context: "amazonia" | "pollination") {
  const claims = claimsForContext(context);
  const sourceIds = Array.from(new Set(claims.flatMap((c) => c.sourceIds)));
  const weakest = claims.reduce<DonorConfidence>((a, b) => confidenceRank[b.confidence] < confidenceRank[a] ? b.confidence : a, "High");
  const needsReview = claims.filter((c) => reviewNeedsWork(c.donorReview));
  const unresolvedSources = sourceIds.filter((id) => {
    const s = recoveredSource(id);
    return !s || s.donorReview !== "VERIFIED";
  });
  return {
    context,
    claimCount: claims.length,
    sourceCount: sourceIds.length,
    weakestConfidence: weakest,
    claimsNeedingReview: needsReview.length,
    unresolvedSourceIds: unresolvedSources,
    dataGaps: Array.from(new Set(claims.flatMap((c) => c.dataGaps ?? []))),
    truthBoundary: "Donor trust metadata is preserved for recovery. It is not a current 4PLANET verification stamp; claim/source review must be rerun under the current Source Contract before stronger public use.",
  };
}

export function recoveredTrustIntegrity() {
  const missingSources = Array.from(new Set(RECOVERED_CLAIMS.flatMap((c) => c.sourceIds).filter((id) => !recoveredSource(id))));
  const duplicateClaims = RECOVERED_CLAIMS.map((c) => c.id).filter((id, i, all) => all.indexOf(id) !== i);
  return { claims: RECOVERED_CLAIMS.length, sources: Object.keys(ALL_RECOVERED_TRUST_SOURCES).length, qualityIssues: RECOVERED_DATA_QUALITY.length, missingSources, duplicateClaims };
}
