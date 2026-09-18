export const HUMAN_GOLD_DIMENSIONS = [
  "UNDERSTANDING",
  "EXPERIENCE",
  "FLOW",
  "VALUE",
  "TRUST",
  "CRAFT",
  "DISTINCTIVENESS",
  "MEMORY",
] as const;

export type HumanGoldDimension = (typeof HUMAN_GOLD_DIMENSIONS)[number];
export type HumanGoldVerdict = "PASS" | "FAIL" | "UNKNOWN";
export type HumanGoldStatus = "HUMAN_QUALITY_FAIL" | "HUMAN_GOLD_CANDIDATE" | "FOUNDER_GOLD" | "EXTERNAL_HUMAN_GOLD";

export type HumanGoldReviewer =
  | "BUILDER"
  | "VISUAL_CRITIC"
  | "UX_CRITIC"
  | "EDITOR"
  | "TRUTH_QA"
  | "DEVICE_QA"
  | "AXE_PRODUCT_LEAD"
  | "FOUNDER"
  | "EXTERNAL_USER";

export interface HumanGoldDimensionEvidence {
  dimension: HumanGoldDimension;
  verdict: HumanGoldVerdict;
  reviewer: HumanGoldReviewer;
  ref: string;
}

export interface HumanGoldEvaluation {
  status: HumanGoldStatus;
  candidatePassed: boolean;
  founderPassed: boolean;
  externalPassed: boolean;
  missingDimensions: HumanGoldDimension[];
  failedDimensions: HumanGoldDimension[];
  invalidEvidence: string[];
  acceptedProductionUnit: boolean;
  scalableProductionUnit: boolean;
}

const DIMENSION_LINE = /^HUMAN-GOLD\s+(UNDERSTANDING|EXPERIENCE|FLOW|VALUE|TRUST|CRAFT|DISTINCTIVENESS|MEMORY)\s*=\s*(PASS|FAIL|UNKNOWN)\s+REVIEWER\s*=\s*(BUILDER|VISUAL_CRITIC|UX_CRITIC|EDITOR|TRUTH_QA|DEVICE_QA|AXE_PRODUCT_LEAD|FOUNDER|EXTERNAL_USER)\s+REF\s*=\s*(\S+)$/i;
const FOUNDER_LINE = /^HUMAN-GOLD\s+FOUNDER\s*=\s*(PASS|FAIL)\s+REF\s*=\s*(\S+)$/i;
const EXTERNAL_LINE = /^HUMAN-GOLD\s+EXTERNAL\s*=\s*(PASS|FAIL)\s+REF\s*=\s*(\S+)$/i;

function upper<T extends string>(value: string): T {
  return value.toUpperCase() as T;
}

export function evaluateHumanGoldEvidence(evidence: string[]): HumanGoldEvaluation {
  const byDimension = new Map<HumanGoldDimension, HumanGoldDimensionEvidence[]>();
  const invalidEvidence: string[] = [];
  let founderVerdict: "PASS" | "FAIL" | "UNKNOWN" = "UNKNOWN";
  let externalVerdict: "PASS" | "FAIL" | "UNKNOWN" = "UNKNOWN";

  for (const raw of evidence) {
    const line = raw.trim();
    if (!/^HUMAN-GOLD\b/i.test(line)) continue;

    const dimensionMatch = DIMENSION_LINE.exec(line);
    if (dimensionMatch) {
      const dimension = upper<HumanGoldDimension>(dimensionMatch[1]);
      const verdict = upper<HumanGoldVerdict>(dimensionMatch[2]);
      const reviewer = upper<HumanGoldReviewer>(dimensionMatch[3]);
      const ref = dimensionMatch[4];
      if (reviewer === "BUILDER") {
        invalidEvidence.push(`${dimension}: BUILDER cannot judge its own Human Gold output`);
        continue;
      }
      if (!ref || ref === "UNKNOWN") {
        invalidEvidence.push(`${dimension}: review evidence requires an inspectable ref`);
        continue;
      }
      const current = byDimension.get(dimension) ?? [];
      current.push({ dimension, verdict, reviewer, ref });
      byDimension.set(dimension, current);
      continue;
    }

    const founderMatch = FOUNDER_LINE.exec(line);
    if (founderMatch) {
      founderVerdict = upper<"PASS" | "FAIL">(founderMatch[1]);
      continue;
    }
    const externalMatch = EXTERNAL_LINE.exec(line);
    if (externalMatch) {
      externalVerdict = upper<"PASS" | "FAIL">(externalMatch[1]);
      continue;
    }
    invalidEvidence.push(`Malformed Human Gold evidence: ${line}`);
  }

  const failedDimensions = HUMAN_GOLD_DIMENSIONS.filter((dimension) =>
    (byDimension.get(dimension) ?? []).some((item) => item.verdict === "FAIL"),
  );
  const missingDimensions = HUMAN_GOLD_DIMENSIONS.filter((dimension) =>
    !(byDimension.get(dimension) ?? []).some((item) => item.verdict === "PASS"),
  );

  const candidatePassed = failedDimensions.length === 0 && missingDimensions.length === 0 && invalidEvidence.length === 0;
  const founderPassed = candidatePassed && founderVerdict === "PASS";
  const externalPassed = founderPassed && externalVerdict === "PASS";

  let status: HumanGoldStatus = "HUMAN_QUALITY_FAIL";
  if (candidatePassed) status = "HUMAN_GOLD_CANDIDATE";
  if (founderPassed) status = "FOUNDER_GOLD";
  if (externalPassed) status = "EXTERNAL_HUMAN_GOLD";

  return {
    status,
    candidatePassed,
    founderPassed,
    externalPassed,
    missingDimensions: [...missingDimensions],
    failedDimensions: [...failedDimensions],
    invalidEvidence,
    acceptedProductionUnit: candidatePassed,
    scalableProductionUnit: founderPassed,
  };
}

export function qualityAdjustedThroughput(units: HumanGoldEvaluation[]): {
  produced: number;
  accepted: number;
  scalable: number;
  rejectedOrRework: number;
} {
  const accepted = units.filter((unit) => unit.acceptedProductionUnit).length;
  const scalable = units.filter((unit) => unit.scalableProductionUnit).length;
  return {
    produced: units.length,
    accepted,
    scalable,
    rejectedOrRework: units.length - accepted,
  };
}