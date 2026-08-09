import type {
  DecisionOption,
  DimensionRating,
  LensComparison,
  LensDefinition,
  LensId,
  LensSensitivityView,
  OptionDimensionKey,
} from "./contracts.js";

export const LENS_SENSITIVITY_V1: Record<LensId, LensDefinition> = {
  LIVING_PLANET: {
    id: "LIVING_PLANET",
    title: "Living Planet",
    purpose: "Emphasise ecological benefit, ecological risk and uncertainty without collapsing them into one score.",
    priorityDimensions: ["ECOLOGICAL_CO_BENEFIT", "TRADE_OFF_RISK", "EFFECTIVENESS_EVIDENCE", "UNCERTAINTY"],
    minimumKnownDimensions: 2,
  },
  HUMAN_WELLBEING: {
    id: "HUMAN_WELLBEING",
    title: "Human Wellbeing",
    purpose: "Emphasise human co-benefits, time-to-benefit, trade-offs and evidence strength.",
    priorityDimensions: ["HUMAN_CO_BENEFIT", "TIME_TO_BENEFIT", "TRADE_OFF_RISK", "EFFECTIVENESS_EVIDENCE"],
    minimumKnownDimensions: 2,
  },
  SYSTEMIC_RISK: {
    id: "SYSTEMIC_RISK",
    title: "Systemic Risk",
    purpose: "Emphasise problem relevance, transfer uncertainty and downside risk under system coupling.",
    priorityDimensions: ["PROBLEM_RELEVANCE", "TRADE_OFF_RISK", "TRANSFERABILITY", "UNCERTAINTY"],
    minimumKnownDimensions: 2,
  },
  IRREVERSIBILITY: {
    id: "IRREVERSIBILITY",
    title: "Irreversibility",
    purpose: "Emphasise ecological co-benefit, time-to-benefit and uncertainty where delay may matter.",
    priorityDimensions: ["ECOLOGICAL_CO_BENEFIT", "TIME_TO_BENEFIT", "EFFECTIVENESS_EVIDENCE", "UNCERTAINTY"],
    minimumKnownDimensions: 2,
  },
  IMPLEMENTATION_FEASIBILITY: {
    id: "IMPLEMENTATION_FEASIBILITY",
    title: "Implementation Feasibility",
    purpose: "Emphasise maturity, maintenance, measurability and transfer conditions.",
    priorityDimensions: ["IMPLEMENTATION_MATURITY", "MAINTENANCE_BURDEN", "MEASUREMENT_FEASIBILITY", "TRANSFERABILITY"],
    minimumKnownDimensions: 2,
  },
  CAPITAL_EFFICIENCY: {
    id: "CAPITAL_EFFICIENCY",
    title: "Capital Efficiency",
    purpose: "Emphasise quality of cost evidence, implementation maturity, time-to-benefit and human/ecological co-benefits. This is not ROI scoring.",
    priorityDimensions: ["COST_EVIDENCE", "IMPLEMENTATION_MATURITY", "TIME_TO_BENEFIT", "ECOLOGICAL_CO_BENEFIT", "HUMAN_CO_BENEFIT"],
    minimumKnownDimensions: 3,
  },
  EVIDENCE_CONFIDENCE: {
    id: "EVIDENCE_CONFIDENCE",
    title: "Evidence Confidence",
    purpose: "Emphasise direct effectiveness evidence, measurement feasibility, uncertainty and transferability.",
    priorityDimensions: ["EFFECTIVENESS_EVIDENCE", "MEASUREMENT_FEASIBILITY", "UNCERTAINTY", "TRANSFERABILITY"],
    minimumKnownDimensions: 3,
  },
  "4PLANET_STRATEGIC_ROLE": {
    id: "4PLANET_STRATEGIC_ROLE",
    title: "4PLANET Strategic Role",
    purpose: "Emphasise where intelligence, measurement and coordination may add value without pretending 4PLANET is the field implementer.",
    priorityDimensions: ["MEASUREMENT_FEASIBILITY", "EFFECTIVENESS_EVIDENCE", "TRANSFERABILITY", "IMPLEMENTATION_MATURITY"],
    minimumKnownDimensions: 2,
  },
};

const ratingValue = (rating: DimensionRating): number | null => {
  if (rating === "FAVOURABLE") return 3;
  if (rating === "MIXED") return 2;
  if (rating === "UNFAVOURABLE") return 1;
  return null;
};

const assessmentMap = (option: DecisionOption) => new Map(option.dimensions.map((d) => [d.dimension, d]));

export function comparePair(optionA: DecisionOption, optionB: DecisionOption, lens: LensDefinition): LensComparison {
  const a = assessmentMap(optionA);
  const b = assessmentMap(optionB);
  const betterOn: OptionDimensionKey[] = [];
  const worseOn: OptionDimensionKey[] = [];
  const equalOn: OptionDimensionKey[] = [];
  const unknownOn: OptionDimensionKey[] = [];

  for (const dimension of lens.priorityDimensions) {
    const av = ratingValue(a.get(dimension)?.rating ?? "UNKNOWN");
    const bv = ratingValue(b.get(dimension)?.rating ?? "UNKNOWN");
    if (av === null || bv === null) unknownOn.push(dimension);
    else if (av > bv) betterOn.push(dimension);
    else if (av < bv) worseOn.push(dimension);
    else equalOn.push(dimension);
  }

  const known = lens.priorityDimensions.length - unknownOn.length;
  let relation: LensComparison["relation"];
  if (known < lens.minimumKnownDimensions) relation = "INSUFFICIENT_EVIDENCE";
  else if (betterOn.length > 0 && worseOn.length === 0) relation = "DOMINATES";
  else if (worseOn.length > 0 && betterOn.length === 0) relation = "DOMINATED";
  else if (betterOn.length > 0 && worseOn.length > 0) relation = "TRADE_OFF";
  else relation = "TIE_OR_INDETERMINATE";

  return {
    lensId: lens.id,
    optionA: optionA.optionId,
    optionB: optionB.optionId,
    relation,
    betterOn,
    worseOn,
    equalOn,
    unknownOn,
    explanation:
      relation === "INSUFFICIENT_EVIDENCE"
        ? `Only ${known}/${lens.priorityDimensions.length} priority dimensions are jointly known; no ranking is defensible.`
        : relation === "TRADE_OFF"
          ? "The options exchange advantages across explicit priority dimensions; the lens does not collapse those trade-offs into one score."
          : "Pairwise relation is derived only from explicit categorical dimension ratings; no aggregate or hidden weight is used.",
  };
}

export function buildLensSensitivityView(options: DecisionOption[], lensId: LensId): LensSensitivityView {
  const lens = LENS_SENSITIVITY_V1[lensId];
  const comparisons: LensComparison[] = [];
  for (let i = 0; i < options.length; i += 1) {
    for (let j = i + 1; j < options.length; j += 1) comparisons.push(comparePair(options[i], options[j], lens));
  }
  return {
    methodologyVersion: "LENS_SENSITIVITY_V1",
    lens,
    comparisons,
    disclosure:
      "LENS_SENSITIVITY_V1 exposes how option relationships change when explicit decision dimensions are prioritised. It does not calculate a universal score, objective best option or recommendation.",
  };
}
