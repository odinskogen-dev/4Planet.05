// ============================================================================
// DATA QUALITY ISSUES (v1.3)
// A small, honest register of known evidence limitations. These are integrity
// signals — not failures. Each points at a real node/source/claim/pathway.
// ============================================================================

import type { DataQualityIssue } from "@/types";

export const DATA_QUALITY_ISSUES: DataQualityIssue[] = [
  {
    id: "DQ_AMAZON_RAINFALL_QUANT",
    targetType: "Node",
    targetId: "EC_AMAZON_RAINFOREST",
    issueType: "NeedsQuantification",
    severity: "Medium",
    note: "Amazon rainfall and moisture-recycling roles are well-supported qualitatively, but the magnitude varies by region and method.",
    suggestedFix: "Add region-specific quantitative ranges with peer-reviewed sources where available.",
  },
  {
    id: "DQ_POLLINATION_VARIATION",
    targetType: "Node",
    targetId: "FN_POLLINATION",
    issueType: "RegionalVariation",
    severity: "Medium",
    note: "Pollination dependency is strong overall but varies by crop, geography and pollinator group; it is not uniform.",
    suggestedFix: "Differentiate crop- and region-level dependence rather than a single global figure.",
  },
  {
    id: "DQ_AMAZON_DATASET_URLS",
    targetType: "Source",
    targetId: "MAPBIOMAS",
    issueType: "MissingURL",
    severity: "Low",
    note: "Amazon monitoring datasets are referenced at organisation level; specific dataset URLs and access dates still require verification.",
    suggestedFix: "Add verified dataset URLs and access dates without fabricating precise report identifiers.",
  },
  {
    id: "DQ_INPE_URL",
    targetType: "Source",
    targetId: "INPE",
    issueType: "MissingURL",
    severity: "Low",
    note: "INPE deforestation monitoring is credible at institution level; the precise dataset URL needs verification.",
    suggestedFix: "Confirm and add the specific monitoring-programme URL.",
  },
  {
    id: "DQ_AMAZON_INSTITUTIONAL",
    targetType: "Source",
    targetId: "AMAZON_INSTITUTIONAL",
    issueType: "IncompleteMetadata",
    severity: "Medium",
    note: "A contextual institutional reference without a confirmed URL or precise publication metadata.",
    suggestedFix: "Replace with a specific, verifiable report once identified; keep marked until then.",
  },
  {
    id: "DQ_RESTORATION_CONTEXT",
    targetType: "SolutionPathway",
    targetId: "PW_DEGRAD_RESTORATION",
    issueType: "ContextDependency",
    severity: "Medium",
    note: "Restoration outcomes depend on method, land-use history and protection from future disturbance; evidence is context-dependent.",
    suggestedFix: "Keep cautious framing; avoid presenting restoration as an immediate substitute for protection.",
  },
  {
    id: "DQ_LEARNING_EXAMPLES",
    targetType: "LearningRecord",
    targetId: "LR_RESTORATION",
    issueType: "WeakSource",
    severity: "Low",
    note: "A structured learning example derived from existing evidence — not live field data or a 4PLANET implementation record.",
    suggestedFix: "Connect to live observed data only if and when it exists.",
  },
  {
    id: "DQ_DECISION_QUALITATIVE",
    targetType: "DecisionSignal",
    targetId: "DS_PROTECTED_AREAS",
    issueType: "ContextDependency",
    severity: "Low",
    note: "Leverage and urgency are qualitative signals to support reasoning, not a final ranking or automated recommendation.",
    suggestedFix: "Preserve qualitative framing; do not present as a definitive priority order.",
  },
  {
    id: "DQ_INTERNAL_SOURCE",
    targetType: "Source",
    targetId: "INTERNAL",
    issueType: "WeakSource",
    severity: "Low",
    note: "Internal analysis used for structure and synthesis; not an external authority and should not be cited as primary evidence.",
    suggestedFix: "Back internal synthesis with external sources wherever a claim depends on it.",
  },
];
