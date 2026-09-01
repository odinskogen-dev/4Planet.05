import type { Outcome, Section, WorkPackage } from "./contracts";

export type MaterialProgressDecision = "ACCEPT" | "CORRECT" | "REJECT";

export interface MaterialProgressEvaluation {
  decision: MaterialProgressDecision;
  material: boolean;
  score: number;
  reasons: string[];
  missingEvidence: string[];
}

const concreteEvidencePatterns: RegExp[] = [
  /https?:\/\//i,
  /\b[0-9a-f]{40}\b/i,
  /\bPASS\b/i,
  /\bFAIL\b/i,
  /screenshot|trace|runtime|browser|deploy|reply|user|contract|cash|award|source|provenance/i,
];

const sectionEvidenceHints: Record<Section, RegExp[]> = {
  PRODUCT_DESIGN: [/before|after|runtime|screenshot|desktop|mobile|interaction|visible/i],
  CODE_QA: [/sha|pass|fail|typecheck|build|browser|webkit|chromium|test|trace/i],
  RESEARCH_DATA: [/source|provenance|dataset|primary|doi|url|claim|unknown/i],
  USER_DISTRIBUTION: [/entry|advance|completion|meaningful|event|user|reply|conversion/i],
  CAPITAL: [/submission|reply|award|contract|cash|deadline|eligibility|routing/i],
  LEARNING: [/expected|actual|cause|lesson|confidence|regression|next test|production-minutes|founder-minutes|reuse-rate/i],
  BRAIN_CONTROL: [/authority|readback|source ref|exact|conflict|lock|decision/i],
};

const COMPOUNDING_EVIDENCE: Array<[RegExp, string]> = [
  [/production-minutes\s*[:=]\s*\d+/i, "Measured production-minutes"],
  [/founder-minutes\s*[:=]\s*\d+/i, "Measured founder-minutes"],
  [/reuse-rate\s*[:=]\s*(?:0(?:\.\d+)?|1(?:\.0+)?|\d{1,3}%)/i, "Measured reuse-rate"],
  [/evidence-completeness\s*[:=]\s*(?:0(?:\.\d+)?|1(?:\.0+)?|\d{1,3}%)/i, "Measured evidence-completeness"],
  [/product-quality\s*[:=]\s*(?:10(?:\.0+)?|[0-9](?:\.\d+)?)/i, "Measured product-quality"],
  [/mobile-quality\s*[:=]\s*(?:10(?:\.0+)?|[0-9](?:\.\d+)?)/i, "Measured mobile-quality"],
  [/user-comprehension\s*[:=]\s*(?:10(?:\.0+)?|[0-9](?:\.\d+)?)/i, "Measured user-comprehension"],
];

function hasConcreteEvidence(evidence: string[]): boolean {
  return evidence.some((item) => concreteEvidencePatterns.some((pattern) => pattern.test(item)));
}

function hasSectionEvidence(section: Section, evidence: string[]): boolean {
  const joined = evidence.join("\n");
  return sectionEvidenceHints[section].some((pattern) => pattern.test(joined));
}

function deltaLooksMaterial(delta: string): boolean {
  const text = delta.trim();
  if (text.length < 24) return false;
  if (/status|plan|todo|queued|in progress|commit only|document only/i.test(text) &&
      !/working|fixed|visible|deployed|passed|received|verified|measured|implemented/i.test(text)) {
    return false;
  }
  return /working|fixed|visible|deployed|passed|received|verified|measured|implemented|reduced|increased|removed|restored|unblocked|accepted/i.test(text);
}

function productionLineLearningEvidence(pkg: WorkPackage, outcome: Outcome): string[] {
  if (pkg.productionLine?.stage !== "LEARN") return [];
  const haystack = `${outcome.materialDelta}\n${outcome.evidence.join("\n")}`;
  const missing = COMPOUNDING_EVIDENCE.filter(([pattern]) => !pattern.test(haystack)).map(([, label]) => label);
  if (pkg.productionLine.role !== "REFERENCE" && !/compounding\s*[:=]\s*(?:PASS|FAIL)/i.test(haystack)) {
    missing.push("Explicit compounding PASS/FAIL verdict");
  }
  return missing;
}

export function evaluateMaterialProgress(pkg: WorkPackage, outcome: Outcome): MaterialProgressEvaluation {
  const reasons: string[] = [];
  const missingEvidence: string[] = [];
  let score = 0;

  if (outcome.status === "BLOCKED") {
    return { decision: "CORRECT", material: false, score: 0, reasons: ["Outcome is blocked"], missingEvidence: [] };
  }
  if (outcome.status === "REJECTED") {
    return { decision: "REJECT", material: false, score: 0, reasons: ["Worker rejected its own outcome"], missingEvidence: [] };
  }

  const compoundingMissing = productionLineLearningEvidence(pkg, outcome);
  if (compoundingMissing.length > 0) {
    return {
      decision: "CORRECT",
      material: false,
      score: 0,
      reasons: ["Production-line learning cannot close without measured compounding evidence"],
      missingEvidence: compoundingMissing,
    };
  }
  if (pkg.productionLine?.stage === "LEARN") {
    reasons.push("Production-line compounding evidence is explicitly measured");
  }

  if (deltaLooksMaterial(outcome.materialDelta)) {
    score += 3;
    reasons.push("Material delta describes a changed capability/result, not activity alone");
  } else {
    missingEvidence.push("Material delta must describe a concrete changed result");
  }

  if (outcome.evidence.length > 0 && hasConcreteEvidence(outcome.evidence)) {
    score += 3;
    reasons.push("Concrete artifact/runtime/source evidence present");
  } else {
    missingEvidence.push("Concrete artifact/runtime/source evidence");
  }

  if (hasSectionEvidence(pkg.section, outcome.evidence)) {
    score += 2;
    reasons.push(`Evidence matches ${pkg.section} material-progress semantics`);
  } else {
    missingEvidence.push(`Section-specific ${pkg.section} evidence`);
  }

  const requiredEvidenceCovered = pkg.requiredEvidence.length === 0 || pkg.requiredEvidence.every((required) => {
    const terms = required.toLowerCase().split(/\W+/).filter((term) => term.length > 4);
    if (terms.length === 0) return true;
    const haystack = `${outcome.materialDelta}\n${outcome.evidence.join("\n")}`.toLowerCase();
    return terms.some((term) => haystack.includes(term));
  });
  if (requiredEvidenceCovered) {
    score += 1;
    reasons.push("Declared required-evidence contract is represented");
  } else {
    missingEvidence.push("One or more declared required-evidence requirements are not represented");
  }

  const expectedActualUseful = outcome.expected.trim().length >= 8 && outcome.actual.trim().length >= 8 && outcome.expected.trim() !== outcome.actual.trim();
  if (expectedActualUseful) {
    score += 1;
    reasons.push("Expected-vs-actual comparison is non-trivial");
  } else {
    missingEvidence.push("Non-trivial expected-vs-actual comparison");
  }

  const material = score >= 7 && missingEvidence.length <= 1;
  if (outcome.status === "ACCEPTED" && material) {
    return { decision: "ACCEPT", material: true, score, reasons, missingEvidence };
  }

  return {
    decision: "CORRECT",
    material: false,
    score,
    reasons,
    missingEvidence,
  };
}
