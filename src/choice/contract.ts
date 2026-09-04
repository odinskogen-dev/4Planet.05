/**
 * EMBLA — CHOICE INTELLIGENCE CONTRACT
 *
 * Domain-neutral seams for one human decision:
 *
 *   INTENT → CONTEXT → OPTIONS → EVIDENCE → TRADE-OFFS → CHOICE → RECEIPT
 *
 * Nothing in this file knows about food, nutrition, barcodes or any single
 * source. FOOD is the first implementation (`food-choice.ts`); HOME, CAR and
 * FINANCE can reuse the same seams once their evidence adapters exist.
 *
 * Truth rules encoded here rather than left to the interface:
 * - a missing value is UNKNOWN, never a negative score;
 * - no priority selected means no "better" claim is produced;
 * - eligibility is decided by the domain adapter, not by ranking order;
 * - every recommendation carries its own reasons, costs and limits.
 */

export type ChoiceDomain = "FOOD" | "HOME" | "CAR" | "FINANCE" | "GENERAL";

export interface ChoicePriority {
  id: string;
  /** Human control label, e.g. "Lower sugar". */
  label: string;
  /** Used inside sentences, e.g. "sugar". */
  shortLabel: string;
  direction: "lower" | "higher";
}

export type DimensionState = "BETTER" | "WORSE" | "SAME" | "DIFFERENT" | "UNKNOWN";

export interface ChoiceDimension {
  id: string;
  label: string;
  unit: string;
  /** True when the person explicitly selected this dimension as a priority. */
  priority: boolean;
  state: DimensionState;
  baseline: number | null;
  candidate: number | null;
  delta: number | null;
  /** Signed, normalised movement on a selected priority. 0 when unknown or not a priority. */
  improvement: number;
  text: string;
}

export interface ChoiceOption {
  id: string;
  title: string;
  subtitle: string;
  relationKind: "direct" | "adjacent" | "unsuitable" | "unknown";
  relationLabel: string;
  relationReason: string;
  eligible: boolean;
  exclusions: string[];
  confidence: string;
  completeness: number;
  missing: string[];
  /** True when the underlying record is test data rather than a live source read. */
  isFixture: boolean;
  dimensions: ChoiceDimension[];
  notes: string[];
  score: number;
}

export type ChoiceVerdict =
  | "SWITCH"
  | "KEEP"
  | "NO_PRIORITIES"
  | "NO_ELIGIBLE_OPTIONS"
  | "CANNOT_COMPARE";

export interface ChoiceDecision {
  verdict: ChoiceVerdict;
  headline: string;
  explanation: string;
  option: ChoiceOption | null;
  /** Eligible options that were compared but not recommended. */
  runnersUp: ChoiceOption[];
  /** Why the recommended option moves in the person's favour. */
  reasons: string[];
  /** What else changes — surfaced whether or not it suits the person. */
  tradeOffs: string[];
  /** Compared dimensions where one record has no value. */
  unknowns: string[];
  /** Structural reasons the comparison is bounded. */
  limitations: string[];
  counts: { eligible: number; adjacent: number; unsuitable: number };
}

const round = (value: number): string => {
  const fixed = Math.abs(value) >= 10 ? value.toFixed(0) : value.toFixed(1);
  return fixed.replace(/\.0$/, "");
};

export function buildDimension(spec: {
  id: string;
  label: string;
  unit: string;
  direction: "lower" | "higher" | "none";
  priority: boolean;
  baseline: number | null;
  candidate: number | null;
  scope?: string;
}): ChoiceDimension {
  const { id, label, unit, direction, priority, baseline, candidate } = spec;
  const scope = spec.scope ? ` ${spec.scope}` : "";
  if (baseline === null || candidate === null) {
    const both = baseline === null && candidate === null;
    return {
      id,
      label,
      unit,
      priority,
      state: "UNKNOWN",
      baseline,
      candidate,
      delta: null,
      improvement: 0,
      text: both
        ? `${label}: not stated in either record`
        : `${label}: not comparable — ${baseline === null ? "your product" : "the alternative"} has no value in the source`,
    };
  }

  const delta = Number((candidate - baseline).toFixed(4));
  if (Math.abs(delta) < 0.005) {
    return {
      id,
      label,
      unit,
      priority,
      state: "SAME",
      baseline,
      candidate,
      delta: 0,
      improvement: 0,
      text: `${label}: the same`,
    };
  }

  const movement = `${round(Math.abs(delta))} ${unit} ${delta < 0 ? "lower" : "higher"}${scope}`;
  const favourable = direction === "lower" ? delta < 0 : direction === "higher" ? delta > 0 : false;
  const denominator = Math.max(Math.abs(baseline), Math.abs(candidate), 0.0001);
  const magnitude = Math.abs(delta) / denominator;

  return {
    id,
    label,
    unit,
    priority,
    state: !priority || direction === "none" ? "DIFFERENT" : favourable ? "BETTER" : "WORSE",
    baseline,
    candidate,
    delta,
    improvement: priority && direction !== "none" ? (favourable ? magnitude : -magnitude) : 0,
    text: `${label}: ${movement}`,
  };
}

export function scoreOption(option: ChoiceOption): number {
  return option.dimensions.reduce((total, dimension) => total + dimension.improvement, 0);
}

function priorityNames(priorities: ChoicePriority[]): string {
  const names = priorities.map((priority) => priority.shortLabel);
  if (names.length <= 1) return names[0] ?? "";
  return `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
}

/**
 * Turn compared options into one honest decision.
 *
 * The adapter decides which options are eligible at all. This function only
 * decides whether a recommendation is earned, and never invents a winner when
 * the person has not said what matters or when no measured movement exists.
 */
export function decideChoice(input: {
  baselineTitle: string;
  options: ChoiceOption[];
  priorities: ChoicePriority[];
  comparable: boolean;
  limitations: string[];
  counts: { eligible: number; adjacent: number; unsuitable: number };
}): ChoiceDecision {
  const { baselineTitle, priorities, comparable, limitations, counts } = input;
  const eligible = input.options.filter((option) => option.eligible);
  const base: Omit<ChoiceDecision, "verdict" | "headline" | "explanation"> = {
    option: null,
    runnersUp: [],
    reasons: [],
    tradeOffs: [],
    unknowns: [],
    limitations,
    counts,
  };

  if (!comparable) {
    return {
      ...base,
      verdict: "CANNOT_COMPARE",
      headline: "Embla will not compare this.",
      explanation:
        "This product has no controlled group of direct substitutes, so ranking alternatives against it would be a guess dressed up as an answer.",
    };
  }

  if (eligible.length === 0) {
    return {
      ...base,
      verdict: "NO_ELIGIBLE_OPTIONS",
      headline: "No comparable alternative to recommend.",
      explanation:
        counts.adjacent + counts.unsuitable > 0
          ? `${counts.adjacent + counts.unsuitable} candidate${counts.adjacent + counts.unsuitable === 1 ? "" : "s"} were found but none passed the direct-substitute, record-quality and personal-constraint checks. That is a limit of the available evidence, not proof that nothing better exists.`
          : "The source returned no candidates in the same controlled group. That is a source result, not proof that no alternative exists.",
    };
  }

  const ranked = [...eligible].sort((left, right) => right.score - left.score);
  const best = ranked[0];

  if (priorities.length === 0) {
    return {
      ...base,
      verdict: "NO_PRIORITIES",
      headline: "Tell Embla what matters.",
      explanation: `${eligible.length} direct substitute${eligible.length === 1 ? "" : "s"} passed the checks. Embla will not call one of them better until you say what you are optimising for.`,
      runnersUp: ranked,
    };
  }

  const reasons = best.dimensions.filter((dimension) => dimension.state === "BETTER").map((dimension) => dimension.text);
  const tradeOffs = best.dimensions
    .filter((dimension) => dimension.state === "WORSE" || dimension.state === "DIFFERENT")
    .map((dimension) => dimension.text);
  const unknowns = best.dimensions.filter((dimension) => dimension.state === "UNKNOWN").map((dimension) => dimension.text);

  if (best.score <= 0 || reasons.length === 0) {
    return {
      ...base,
      verdict: "KEEP",
      headline: `Keep ${baselineTitle}.`,
      explanation: `No direct substitute improves on ${priorityNames(priorities)} where both records hold a value. Embla is not going to move you for the sake of movement.`,
      runnersUp: ranked,
      unknowns,
    };
  }

  return {
    ...base,
    verdict: "SWITCH",
    headline: `Switch to ${best.title}.`,
    explanation: `Compared with ${baselineTitle} on ${priorityNames(priorities)}, using the values both records actually hold.`,
    option: best,
    runnersUp: ranked.slice(1),
    reasons: [...reasons, ...best.notes],
    tradeOffs,
    unknowns,
  };
}
