import type { EngineBlueprint, StageRegistry } from "@/labs/engine-foundry/runtime";

export type WorkItem = {
  id: string;
  title: string;
  northStar: number;
  urgency: number;
  evidence: number;
  readiness: number;
  reversibility: number;
  founderBurden: number;
  effort: number;
  risk: number;
  status: "READY" | "BLOCKED";
  recommendedEngine?: string;
  requiresFounderDecision?: boolean;
  externalAction?: boolean;
  canonChange?: boolean;
  productionDeploy?: boolean;
  payment?: boolean;
  destructive?: boolean;
};

export type RankedWorkItem = WorkItem & {
  score: number;
  factors: Record<string, number>;
  requiredGates: string[];
  blockers: string[];
  blocked: boolean;
  rank?: number;
  explanation: string;
  recommendedNext: string;
};

export type PriorityOutput = {
  ranked: RankedWorkItem[];
  blocked: RankedWorkItem[];
  policy: {
    scoringWeights: Record<string, number>;
    note: string;
  };
};

export const PRIORITY_WEIGHTS = Object.freeze({
  northStar: 0.30,
  urgency: 0.15,
  evidence: 0.15,
  readiness: 0.15,
  reversibility: 0.05,
  lowFounderBurden: 0.07,
  lowEffort: 0.05,
  lowRisk: 0.08,
});

const HIGH_CONSEQUENCE_GATES: Array<[keyof WorkItem, string]> = [
  ["externalAction", "FOUNDER_RELEASE"],
  ["canonChange", "FOUNDER_CANON_DECISION"],
  ["productionDeploy", "RELEASE_GATE"],
  ["payment", "PAYMENT_AUTHORITY"],
  ["destructive", "DESTRUCTIVE_ACTION_GATE"],
];

const boundedNumber = (value: number, field: string, itemId: string) => {
  if (typeof value !== "number" || Number.isNaN(value) || value < 0 || value > 100) {
    throw new Error(`${itemId}.${field} must be a number from 0 to 100`);
  }
  return value;
};

const requiredGates = (item: WorkItem) => {
  const gates: string[] = [];
  if (item.requiresFounderDecision) gates.push("FOUNDER_DECISION");
  for (const [field, gate] of HIGH_CONSEQUENCE_GATES) {
    if (item[field]) gates.push(gate);
  }
  return [...new Set(gates)];
};

const factorBreakdown = (item: WorkItem) => {
  const factors = {
    northStar: boundedNumber(item.northStar, "northStar", item.id) * PRIORITY_WEIGHTS.northStar,
    urgency: boundedNumber(item.urgency, "urgency", item.id) * PRIORITY_WEIGHTS.urgency,
    evidence: boundedNumber(item.evidence, "evidence", item.id) * PRIORITY_WEIGHTS.evidence,
    readiness: boundedNumber(item.readiness, "readiness", item.id) * PRIORITY_WEIGHTS.readiness,
    reversibility: boundedNumber(item.reversibility, "reversibility", item.id) * PRIORITY_WEIGHTS.reversibility,
    lowFounderBurden: (100 - boundedNumber(item.founderBurden, "founderBurden", item.id)) * PRIORITY_WEIGHTS.lowFounderBurden,
    lowEffort: (100 - boundedNumber(item.effort, "effort", item.id)) * PRIORITY_WEIGHTS.lowEffort,
    lowRisk: (100 - boundedNumber(item.risk, "risk", item.id)) * PRIORITY_WEIGHTS.lowRisk,
  };
  return {
    score: Number(Object.values(factors).reduce((sum, value) => sum + value, 0).toFixed(2)),
    factors,
  };
};

const explain = (item: WorkItem, factors: Record<string, number>) => {
  const labels: Record<string, string> = {
    northStar: "North Star contribution",
    urgency: "urgency",
    evidence: "evidence",
    readiness: "dependency readiness",
    reversibility: "reversibility",
    lowFounderBurden: "low founder burden",
    lowEffort: "low execution effort",
    lowRisk: "low risk",
  };
  const strongest = Object.entries(factors)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([key]) => labels[key] ?? key);
  return `${item.title} ranks mainly from ${strongest.join(", ")}.`;
};

export const priorityStageRegistry: StageRegistry = {
  validateInput({ input }) {
    const typedInput = input as { items?: WorkItem[] } | null;
    if (!typedInput || !Array.isArray(typedInput.items) || typedInput.items.length === 0) {
      return { ok: false, failure: { code: "INVALID_INPUT", message: "items[] is required" } };
    }

    const ids = new Set<string>();
    for (const item of typedInput.items) {
      if (!item || typeof item !== "object" || !item.id || !item.title) {
        return { ok: false, failure: { code: "INVALID_WORK_ITEM", message: "Each item needs id and title" } };
      }
      if (ids.has(item.id)) {
        return { ok: false, failure: { code: "DUPLICATE_WORK_ITEM", message: item.id } };
      }
      ids.add(item.id);
    }

    return {
      ok: true,
      working: { validatedItems: typedInput.items.map((item) => ({ ...item })) },
      traceDetails: { itemCount: typedInput.items.length },
    };
  },

  scoreItems({ working }) {
    try {
      const items = working.validatedItems as WorkItem[];
      const scored = items.map((item) => {
        const breakdown = factorBreakdown(item);
        return {
          ...item,
          score: breakdown.score,
          factors: breakdown.factors,
          requiredGates: requiredGates(item),
        };
      });
      return {
        ok: true,
        working: { scoredItems: scored },
        traceDetails: { scoredCount: scored.length, weights: PRIORITY_WEIGHTS },
      };
    } catch (error) {
      return {
        ok: false,
        failure: {
          code: "SCORING_INPUT_ERROR",
          message: error instanceof Error ? error.message : String(error),
        },
      };
    }
  },

  classifyBlockers({ working }) {
    const items = working.scoredItems as Array<WorkItem & {
      score: number;
      factors: Record<string, number>;
      requiredGates: string[];
    }>;
    const classified = items.map((item) => {
      const blockers: string[] = [];
      if (item.status === "BLOCKED") blockers.push("STATUS_BLOCKED");
      if (item.readiness < 20) blockers.push("DEPENDENCIES_NOT_READY");
      if (item.risk >= 90) blockers.push("EXTREME_RISK");
      if (item.externalAction) blockers.push("EXTERNAL_ACTION_NOT_AUTHORISED");
      if (item.productionDeploy) blockers.push("PRODUCTION_DEPLOY_NOT_AUTHORISED");
      if (item.payment) blockers.push("PAYMENT_NOT_AUTHORISED");
      if (item.destructive) blockers.push("DESTRUCTIVE_ACTION_NOT_AUTHORISED");
      if (item.canonChange) blockers.push("CANON_CHANGE_REQUIRES_FOUNDER");
      return { ...item, blockers, blocked: blockers.length > 0 };
    });

    return {
      ok: true,
      working: { classifiedItems: classified },
      traceDetails: { blockedCount: classified.filter((item) => item.blocked).length },
    };
  },

  rankItems({ working }) {
    const items = working.classifiedItems as Array<WorkItem & {
      score: number;
      factors: Record<string, number>;
      requiredGates: string[];
      blockers: string[];
      blocked: boolean;
    }>;

    const ranked: RankedWorkItem[] = items
      .filter((item) => !item.blocked)
      .sort((a, b) => b.score - a.score || a.title.localeCompare(b.title))
      .map((item, index) => ({
        ...item,
        rank: index + 1,
        explanation: explain(item, item.factors),
        recommendedNext: item.recommendedEngine ?? (item.requiresFounderDecision ? "FOUNDER" : "PROGRAMME_ENGINE"),
      }));

    const blocked: RankedWorkItem[] = items
      .filter((item) => item.blocked)
      .sort((a, b) => b.score - a.score || a.title.localeCompare(b.title))
      .map((item) => ({
        ...item,
        explanation: `Blocked: ${item.blockers.join(", ")}.`,
        recommendedNext: item.requiresFounderDecision || item.requiredGates.includes("FOUNDER_RELEASE")
          ? "FOUNDER"
          : "PROGRAMME_CONTROL",
      }));

    const output: PriorityOutput = {
      ranked,
      blocked,
      policy: {
        scoringWeights: { ...PRIORITY_WEIGHTS },
        note: "Advisory only. Ranking does not execute work or approve gates.",
      },
    };

    return {
      ok: true,
      output,
      traceDetails: { rankedCount: ranked.length, blockedCount: blocked.length },
    };
  },
};

export const priorityEngineBlueprint: EngineBlueprint = {
  id: "priority-engine",
  version: "0.2.0",
  purpose: "Rank candidate work against explicit North Star, evidence, readiness, risk and founder-burden rules.",
  userJob: "Decide what should happen next without hiding trade-offs or authority gates.",
  authority: {
    allowedActions: [],
    explicitHighConsequenceApproval: false,
  },
  stages: [
    { id: "validate", primitive: "VERIFY", handler: "validateInput", requiresActions: [] },
    { id: "score", primitive: "REASON", handler: "scoreItems", requiresActions: [] },
    { id: "block", primitive: "VERIFY", handler: "classifyBlockers", requiresActions: [] },
    { id: "rank", primitive: "REASON", handler: "rankItems", requiresActions: [] },
  ],
  output: "ranked_work_queue",
  learningPolicy: "No automatic learning in v0.2. Human-reviewed runs may later create Learning Records.",
};

export const demoWorkItems: WorkItem[] = [
  {
    id: "one-interface-reliability",
    title: "Close ONE INTERFACE core reliability gate",
    northStar: 92,
    urgency: 95,
    evidence: 90,
    readiness: 82,
    reversibility: 80,
    founderBurden: 18,
    effort: 55,
    risk: 35,
    status: "READY",
    recommendedEngine: "PROGRAMME_ENGINE",
  },
  {
    id: "food-choice-validation",
    title: "Run FOOD / Choice real-user validation",
    northStar: 88,
    urgency: 78,
    evidence: 72,
    readiness: 86,
    reversibility: 92,
    founderBurden: 28,
    effort: 38,
    risk: 20,
    status: "READY",
    recommendedEngine: "CHOICE_ENGINE",
  },
  {
    id: "engine-foundry-transfer",
    title: "Build ENGINE FOUNDRY transfer proof",
    northStar: 89,
    urgency: 74,
    evidence: 68,
    readiness: 84,
    reversibility: 96,
    founderBurden: 10,
    effort: 48,
    risk: 24,
    status: "READY",
    recommendedEngine: "ENGINE_FOUNDRY",
  },
];
