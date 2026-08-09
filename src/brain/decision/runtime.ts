import type {
  DecisionActorType,
  DecisionEvaluationCase,
  DecisionIntelligenceService,
  DecisionOption,
  DecisionPack,
  DecisionRuntimeResult,
  LensId,
  LensSensitivityView,
  OptionDimensionKey,
} from "./contracts.js";
import { buildLensSensitivityView } from "./lensSensitivity.js";
import { POLLINATION_DECISION_PACKS } from "./pollinationDecisionPacks.js";

const PACKS: Record<string, DecisionPack> = Object.fromEntries(
  Object.values(POLLINATION_DECISION_PACKS).map((pack) => [pack.id, pack]),
);

const ALL_DIMENSIONS: OptionDimensionKey[] = [
  "PROBLEM_RELEVANCE",
  "EFFECTIVENESS_EVIDENCE",
  "IMPLEMENTATION_MATURITY",
  "TIME_TO_BENEFIT",
  "COST_EVIDENCE",
  "MAINTENANCE_BURDEN",
  "ECOLOGICAL_CO_BENEFIT",
  "HUMAN_CO_BENEFIT",
  "TRADE_OFF_RISK",
  "TRANSFERABILITY",
  "MEASUREMENT_FEASIBILITY",
  "UNCERTAINTY",
];

export interface DecisionPackValidation {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export function validateDecisionOption(option: DecisionOption): DecisionPackValidation {
  const errors: string[] = [];
  const warnings: string[] = [];
  const dims = new Map(option.dimensions.map((d) => [d.dimension, d]));
  for (const required of ALL_DIMENSIONS) if (!dims.has(required)) errors.push(`${option.optionId}: missing dimension ${required}`);
  if (dims.size !== option.dimensions.length) errors.push(`${option.optionId}: duplicate option dimension`);

  for (const outcome of option.observedOutcomes) {
    if (outcome.sources.length === 0) errors.push(`${option.optionId}: observed outcome has no provenance pointer`);
    if (outcome.truthClass === "INFERENCE" || outcome.truthClass === "UNKNOWN") {
      errors.push(`${option.optionId}: inferred/unknown statement cannot be encoded as observed outcome`);
    }
  }
  for (const economic of option.economics) {
    if (economic.truthClass === "SOURCE_REPORTED_CLAIM" && economic.sources.length === 0) {
      errors.push(`${option.optionId}: source-reported economics lacks provenance`);
    }
  }
  if (option.offeringRefs.length > 0 && option.implementationRefs.length === 0) {
    warnings.push(`${option.optionId}: offering exists without represented implementation; do not imply deployment.`);
  }
  return { valid: errors.length === 0, errors, warnings };
}

export function validateDecisionPack(pack: DecisionPack): DecisionPackValidation {
  const errors: string[] = [];
  const warnings: string[] = [];
  if (pack.truthBoundary.universalBestOption !== false) errors.push(`${pack.id}: universal-best boundary must be false`);
  if (pack.truthBoundary.decisionSupportIsAutomatedDecision !== false) errors.push(`${pack.id}: automated-decision boundary must be false`);
  if (pack.truthBoundary.relevanceIsEffectiveness !== false) errors.push(`${pack.id}: relevance/effectiveness boundary violated`);
  if (pack.context.place.evidenceScope === "LOCAL" && pack.context.place.sources.length === 0) {
    errors.push(`${pack.id}: local Place evidence requires provenance`);
  }
  for (const action of pack.possibleNextActions) {
    if (action.truthClass === "FACT" || action.truthClass === "SOURCE_REPORTED_CLAIM") {
      errors.push(`${pack.id}: possible next action cannot be presented as fact/source claim`);
    }
  }
  for (const option of pack.options) {
    const result = validateDecisionOption(option);
    errors.push(...result.errors);
    warnings.push(...result.warnings);
  }
  const sourceRegistryOnly = pack.evidence.flatMap((e) => e.claim.sources).filter((s) => s.provenanceStatus === "SOURCE_REGISTRY_ONLY").length;
  if (sourceRegistryOnly > 0) warnings.push(`${pack.id}: ${sourceRegistryOnly} evidence pointers are registry-only until immutable Source Records are captured.`);
  return { valid: errors.length === 0, errors, warnings };
}

const looksLikeUniversalBest = (question: string): boolean =>
  /\b(best|single best|always best|universally best|most effective overall)\b/i.test(question);

const isPollinationQuestion = (question: string): boolean => /pollinat|bee|flower[- ]rich|wild bee/i.test(question);

const packForActor = (actorType: DecisionActorType): DecisionPack => {
  if (actorType === "MUNICIPALITY" || actorType === "PUBLIC_INSTITUTION") return POLLINATION_DECISION_PACKS.MUNICIPALITY;
  if (actorType === "FUNDER") return POLLINATION_DECISION_PACKS.FUNDER;
  if (actorType === "4PLANET_INTERNAL") return POLLINATION_DECISION_PACKS["4PLANET"];
  return POLLINATION_DECISION_PACKS.FARM;
};

export class BoundedDecisionIntelligenceService implements DecisionIntelligenceService {
  async resolveQuestion(question: string, actorType: DecisionActorType): Promise<DecisionRuntimeResult> {
    if (!isPollinationQuestion(question)) {
      return { status: "NOT_FOUND", refusalReason: "The v1 demonstrator is bounded to Pollination→Food; no broader decision answer is fabricated." };
    }
    if (looksLikeUniversalBest(question)) {
      return { status: "INSUFFICIENT_EVIDENCE", refusalReason: "A universal best intervention is not supported. Supply actor, Place, objective and explicit decision lens for transparent comparison." };
    }
    return { status: "OK", pack: packForActor(actorType) };
  }

  async getDecisionPack(packId: string): Promise<DecisionRuntimeResult> {
    const pack = PACKS[packId];
    return pack ? { status: "OK", pack } : { status: "NOT_FOUND", refusalReason: `Unknown Decision Pack ${packId}` };
  }

  async compareOptions(packId: string, lensId: LensId): Promise<LensSensitivityView | null> {
    const pack = PACKS[packId];
    return pack ? buildLensSensitivityView(pack.options, lensId) : null;
  }

  async getEvidence(packId: string) {
    return PACKS[packId]?.evidence ?? [];
  }

  async getPlaceContext(packId: string) {
    return PACKS[packId]?.context.place ?? null;
  }

  async getGaps(packId: string) {
    return PACKS[packId]?.gaps ?? [];
  }
}

export interface PublicDecisionSection {
  id: string;
  title: string;
  summary: string;
  disclosure?: string;
}

/** Minimal progressive-disclosure seam for Living Systems. No raw database exposure. */
export function projectDecisionPackForLivingSystems(pack: DecisionPack): {
  headline: string;
  status: DecisionPack["status"];
  sections: PublicDecisionSection[];
  deepMode: {
    evidenceCount: number;
    sourceRegistryOnlyCount: number;
    gaps: string[];
    methodology: string[];
  };
} {
  const sourceRegistryOnlyCount = pack.evidence
    .flatMap((e) => e.claim.sources)
    .filter((s) => s.provenanceStatus === "SOURCE_REGISTRY_ONLY").length;
  return {
    headline: pack.question.text,
    status: pack.status,
    sections: [
      { id: "why", title: "WHY IT MATTERS", summary: pack.whyItMatters.map((x) => x.value).join(" ") },
      { id: "drivers", title: "WHAT THREATENS IT", summary: pack.drivers.map((x) => x.value).join(" ") },
      { id: "options", title: "WHAT MAY HELP", summary: `${pack.options.length} context-dependent options are represented; no universal best option is declared.`, disclosure: "Option relevance is not proof of effectiveness." },
      { id: "evidence", title: "HOW STRONG IS THE EVIDENCE?", summary: `${pack.evidence.length} bounded evidence/qualification items are attached to this Decision Pack.`, disclosure: "SUPPORTS, QUALIFIES and CHALLENGES remain separate." },
      { id: "where", title: "WHERE IS THIS RELEVANT?", summary: `${pack.context.place.label}: ${pack.context.place.evidenceScope}.`, disclosure: pack.context.place.transferBoundary },
      { id: "gaps", title: "WHAT IS UNKNOWN?", summary: `${pack.gaps.length} material gaps are explicitly represented.` },
      { id: "next", title: "POSSIBLE NEXT ACTION", summary: pack.possibleNextActions.map((x) => x.value).join(" "), disclosure: "Decision support, not automated decision-making." },
    ],
    deepMode: {
      evidenceCount: pack.evidence.length,
      sourceRegistryOnlyCount,
      gaps: pack.gaps.map((gap) => gap.statement.value),
      methodology: [
        "Every field carries a truth class.",
        "Global evidence is not silently treated as local evidence.",
        "Observed outcomes require provenance.",
        "Option comparisons expose dimensions and unknowns without aggregate scoring.",
      ],
    },
  };
}

export function evaluateCaseBehaviour(
  serviceResult: DecisionRuntimeResult,
  testCase: DecisionEvaluationCase,
): "PASS" | "PARTIAL" | "FAIL" {
  if (testCase.expectedBehaviour === "REFUSE") return serviceResult.status === "INSUFFICIENT_EVIDENCE" ? "PASS" : "FAIL";
  if (testCase.expectedBehaviour === "UNKNOWN") return serviceResult.status === "NOT_FOUND" ? "PASS" : "FAIL";
  if (!serviceResult.pack) return "FAIL";
  const validation = validateDecisionPack(serviceResult.pack);
  if (!validation.valid) return "FAIL";
  if (testCase.expectedBehaviour === "QUALIFY" && serviceResult.pack.truthBoundary.universalBestOption === false) return "PASS";
  return serviceResult.status === "OK" ? "PASS" : "PARTIAL";
}
