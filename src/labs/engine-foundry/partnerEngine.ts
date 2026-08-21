import type { EngineBlueprint, StageRegistry } from "@/labs/engine-foundry/runtime";

export type PartnerEligibility = "ELIGIBLE" | "UNKNOWN" | "INELIGIBLE";

export type PartnerNeed = {
  id: string;
  title: string;
  mission: string;
  geography?: string;
  capabilityNeed: string;
};

export type PartnerCandidate = {
  id: string;
  name: string;
  country: string;
  eligibility: PartnerEligibility;
  missionFit: number;
  capabilityFit: number;
  deliveryEvidence: number;
  evidenceStrength: number;
  capacity: number;
  accessRoute: number;
  relationship: number;
  risk: number;
  asyncRoute: boolean;
  meetingRequired: boolean;
  evidenceRefs: string[];
};

export type RankedPartner = PartnerCandidate & {
  score: number;
  rank?: number;
  factors: Record<string, number>;
  diligenceGaps: string[];
  requiredGates: string[];
  blocked: boolean;
  blockers: string[];
  explanation: string;
  recommendedNext: string;
};

export type PartnerOutput = {
  need: PartnerNeed;
  ranked: RankedPartner[];
  blocked: RankedPartner[];
  policy: {
    note: string;
    scoringWeights: Record<string, number>;
    authority: string;
  };
};

export const PARTNER_WEIGHTS = Object.freeze({
  missionFit: 0.25,
  capabilityFit: 0.20,
  deliveryEvidence: 0.15,
  evidenceStrength: 0.15,
  capacity: 0.10,
  accessRoute: 0.05,
  relationship: 0.05,
  lowRisk: 0.05,
});

const bounded = (value: number, field: string, candidateId: string) => {
  if (typeof value !== "number" || Number.isNaN(value) || value < 0 || value > 100) {
    throw new Error(`${candidateId}.${field} must be a number from 0 to 100`);
  }
  return value;
};

const scoreCandidate = (candidate: PartnerCandidate) => {
  const factors = {
    missionFit: bounded(candidate.missionFit, "missionFit", candidate.id) * PARTNER_WEIGHTS.missionFit,
    capabilityFit: bounded(candidate.capabilityFit, "capabilityFit", candidate.id) * PARTNER_WEIGHTS.capabilityFit,
    deliveryEvidence: bounded(candidate.deliveryEvidence, "deliveryEvidence", candidate.id) * PARTNER_WEIGHTS.deliveryEvidence,
    evidenceStrength: bounded(candidate.evidenceStrength, "evidenceStrength", candidate.id) * PARTNER_WEIGHTS.evidenceStrength,
    capacity: bounded(candidate.capacity, "capacity", candidate.id) * PARTNER_WEIGHTS.capacity,
    accessRoute: bounded(candidate.accessRoute, "accessRoute", candidate.id) * PARTNER_WEIGHTS.accessRoute,
    relationship: bounded(candidate.relationship, "relationship", candidate.id) * PARTNER_WEIGHTS.relationship,
    lowRisk: (100 - bounded(candidate.risk, "risk", candidate.id)) * PARTNER_WEIGHTS.lowRisk,
  };

  const raw = Object.values(factors).reduce((sum, value) => sum + value, 0);
  const eligibilityPenalty = candidate.eligibility === "UNKNOWN" ? 8 : 0;
  return {
    factors,
    score: Number(Math.max(0, raw - eligibilityPenalty).toFixed(2)),
  };
};

const diligenceFor = (candidate: PartnerCandidate) => {
  const gaps: string[] = [];
  if (candidate.eligibility === "UNKNOWN") gaps.push("VERIFY_ELIGIBILITY");
  if (candidate.evidenceStrength < 60) gaps.push("STRENGTHEN_EVIDENCE");
  if (candidate.deliveryEvidence < 60) gaps.push("VERIFY_DELIVERY_PROOF");
  if (candidate.capacity < 50) gaps.push("VERIFY_CURRENT_CAPACITY");
  if (candidate.accessRoute < 50) gaps.push("VERIFY_ACCESS_ROUTE");
  if (candidate.evidenceRefs.length === 0) gaps.push("ADD_EVIDENCE_REFERENCE");
  return gaps;
};

const gatesFor = (candidate: PartnerCandidate) => {
  const gates = ["EXTERNAL_ACTION_AUTHORITY"];
  const isNorway = candidate.country.trim().toLowerCase() === "norway" || candidate.country.trim().toLowerCase() === "norge";
  if (isNorway) gates.push("FOUNDER_NORWAY_OUTBOUND_APPROVAL");
  if (candidate.meetingRequired || !candidate.asyncRoute) gates.push("FOUNDER_MEETING_CALL_APPROVAL");
  if (candidate.risk >= 50) gates.push("FOUNDER_RISK_APPROVAL");
  return [...new Set(gates)];
};

const strongestFactors = (factors: Record<string, number>) => Object.entries(factors)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 3)
  .map(([key]) => ({
    missionFit: "mission fit",
    capabilityFit: "capability fit",
    deliveryEvidence: "delivery evidence",
    evidenceStrength: "evidence strength",
    capacity: "capacity",
    accessRoute: "access route",
    relationship: "relationship",
    lowRisk: "low risk",
  }[key] ?? key));

export const partnerStageRegistry: StageRegistry = {
  validatePartnerInput({ input }) {
    const typed = input as { need?: PartnerNeed; candidates?: PartnerCandidate[] } | null;
    if (!typed?.need?.id || !typed.need.title || !typed.need.capabilityNeed) {
      return { ok: false, failure: { code: "INVALID_PARTNER_NEED", message: "need.id, need.title and need.capabilityNeed are required" } };
    }
    if (!Array.isArray(typed.candidates) || typed.candidates.length === 0) {
      return { ok: false, failure: { code: "INVALID_PARTNER_CANDIDATES", message: "At least one candidate is required" } };
    }
    const ids = new Set<string>();
    for (const candidate of typed.candidates) {
      if (!candidate?.id || !candidate.name) {
        return { ok: false, failure: { code: "INVALID_PARTNER_CANDIDATE", message: "Each candidate needs id and name" } };
      }
      if (ids.has(candidate.id)) {
        return { ok: false, failure: { code: "DUPLICATE_PARTNER_CANDIDATE", message: candidate.id } };
      }
      ids.add(candidate.id);
    }
    return {
      ok: true,
      working: {
        partnerNeed: { ...typed.need },
        partnerCandidates: typed.candidates.map((candidate) => ({ ...candidate, evidenceRefs: [...candidate.evidenceRefs] })),
      },
      traceDetails: { candidateCount: typed.candidates.length },
    };
  },

  evaluatePartnerFit({ working }) {
    try {
      const candidates = working.partnerCandidates as PartnerCandidate[];
      const evaluated = candidates.map((candidate) => {
        const score = scoreCandidate(candidate);
        return { ...candidate, ...score };
      });
      return {
        ok: true,
        working: { evaluatedPartners: evaluated },
        traceDetails: { evaluatedCount: evaluated.length, weights: PARTNER_WEIGHTS },
      };
    } catch (error) {
      return {
        ok: false,
        failure: {
          code: "PARTNER_SCORING_INPUT_ERROR",
          message: error instanceof Error ? error.message : String(error),
        },
      };
    }
  },

  inspectPartnerDiligence({ working }) {
    const candidates = working.evaluatedPartners as Array<PartnerCandidate & { score: number; factors: Record<string, number> }>;
    const inspected = candidates.map((candidate) => ({
      ...candidate,
      diligenceGaps: diligenceFor(candidate),
      requiredGates: gatesFor(candidate),
    }));
    return {
      ok: true,
      working: { inspectedPartners: inspected },
      traceDetails: { totalDiligenceGaps: inspected.reduce((sum, candidate) => sum + candidate.diligenceGaps.length, 0) },
    };
  },

  classifyPartnerBlockers({ working }) {
    const candidates = working.inspectedPartners as Array<PartnerCandidate & {
      score: number;
      factors: Record<string, number>;
      diligenceGaps: string[];
      requiredGates: string[];
    }>;
    const classified = candidates.map((candidate) => {
      const blockers: string[] = [];
      if (candidate.eligibility === "INELIGIBLE") blockers.push("INELIGIBLE");
      if (candidate.risk >= 85) blockers.push("EXTREME_RISK");
      return { ...candidate, blockers, blocked: blockers.length > 0 };
    });
    return {
      ok: true,
      working: { classifiedPartners: classified },
      traceDetails: { blockedCount: classified.filter((candidate) => candidate.blocked).length },
    };
  },

  rankPartnerCandidates({ working }) {
    const need = working.partnerNeed as PartnerNeed;
    const candidates = working.classifiedPartners as Array<PartnerCandidate & {
      score: number;
      factors: Record<string, number>;
      diligenceGaps: string[];
      requiredGates: string[];
      blockers: string[];
      blocked: boolean;
    }>;

    const toRanked = (candidate: (typeof candidates)[number], rank?: number): RankedPartner => {
      const strongest = strongestFactors(candidate.factors);
      const recommendedNext = candidate.blocked
        ? "HOLD / REJECT"
        : candidate.diligenceGaps.length > 0
          ? "INTERNAL DILIGENCE"
          : "GATED PARTNER REVIEW";
      return {
        ...candidate,
        rank,
        explanation: candidate.blocked
          ? `${candidate.name} is blocked: ${candidate.blockers.join(", ")}.`
          : `${candidate.name} scores mainly on ${strongest.join(", ")}. ${candidate.diligenceGaps.length ? `${candidate.diligenceGaps.length} diligence gap(s) remain.` : "No configured diligence gaps remain."}`,
        recommendedNext,
      };
    };

    const ranked = candidates
      .filter((candidate) => !candidate.blocked)
      .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name))
      .map((candidate, index) => toRanked(candidate, index + 1));

    const blocked = candidates
      .filter((candidate) => candidate.blocked)
      .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name))
      .map((candidate) => toRanked(candidate));

    const output: PartnerOutput = {
      need,
      ranked,
      blocked,
      policy: {
        scoringWeights: { ...PARTNER_WEIGHTS },
        note: "Fit score is an explainable prioritisation aid, not a confidence score or proof of partner quality.",
        authority: "This engine does not contact partners. All external action remains separately gated.",
      },
    };

    return {
      ok: true,
      output,
      traceDetails: { rankedCount: ranked.length, blockedCount: blocked.length },
    };
  },
};

export const partnerEngineBlueprint: EngineBlueprint = {
  id: "partner-engine",
  version: "0.1.0",
  purpose: "Rank potential partners for a defined Mission or system need while preserving evidence gaps, risk and authority boundaries.",
  userJob: "Given a need and candidate organisations, understand who deserves deeper diligence and what must be verified before any approach.",
  authority: {
    allowedActions: [],
    explicitHighConsequenceApproval: false,
  },
  stages: [
    { id: "validate", primitive: "VERIFY", handler: "validatePartnerInput", requiresActions: [] },
    { id: "fit", primitive: "REASON", handler: "evaluatePartnerFit", requiresActions: [] },
    { id: "diligence", primitive: "VERIFY", handler: "inspectPartnerDiligence", requiresActions: [] },
    { id: "block", primitive: "VERIFY", handler: "classifyPartnerBlockers", requiresActions: [] },
    { id: "rank", primitive: "REASON", handler: "rankPartnerCandidates", requiresActions: [] },
  ],
  output: "ranked_partner_candidates",
  learningPolicy: "No automatic learning. Real outcomes may later create reviewed Learning Records and versioned scoring changes.",
};

export const demoPartnerNeed: PartnerNeed = {
  id: "demo-ocean-delivery",
  title: "Find a capable delivery partner for an ocean restoration proof",
  mission: "OCE4N_ / DEMO NEED",
  geography: "Norway / international comparison",
  capabilityNeed: "Field delivery, ecological evidence and transparent reporting",
};

export const demoPartnerCandidates: PartnerCandidate[] = [
  {
    id: "candidate-a",
    name: "Candidate A · field operator",
    country: "Norway",
    eligibility: "UNKNOWN",
    missionFit: 91,
    capabilityFit: 88,
    deliveryEvidence: 76,
    evidenceStrength: 68,
    capacity: 70,
    accessRoute: 65,
    relationship: 35,
    risk: 28,
    asyncRoute: true,
    meetingRequired: false,
    evidenceRefs: ["DEMO SOURCE A"],
  },
  {
    id: "candidate-b",
    name: "Candidate B · research consortium",
    country: "Denmark",
    eligibility: "ELIGIBLE",
    missionFit: 82,
    capabilityFit: 92,
    deliveryEvidence: 64,
    evidenceStrength: 84,
    capacity: 58,
    accessRoute: 48,
    relationship: 12,
    risk: 22,
    asyncRoute: true,
    meetingRequired: false,
    evidenceRefs: ["DEMO SOURCE B", "DEMO SOURCE C"],
  },
  {
    id: "candidate-c",
    name: "Candidate C · unverified implementer",
    country: "United Kingdom",
    eligibility: "INELIGIBLE",
    missionFit: 74,
    capabilityFit: 66,
    deliveryEvidence: 30,
    evidenceStrength: 25,
    capacity: 55,
    accessRoute: 72,
    relationship: 20,
    risk: 58,
    asyncRoute: false,
    meetingRequired: true,
    evidenceRefs: [],
  },
];
