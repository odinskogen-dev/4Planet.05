import type { ProductionLineId } from "./contracts";

export type NextProductionLineId = "ACTOR" | "SOLUTION" | "CHOICE" | "CAPITAL";

export interface NextProductionLineContract {
  id: NextProductionLineId;
  authority: string;
  purpose: string;
  consumes: string[];
  produces: string[];
  forbiddenParallelSystem: string;
  activationGate: string[];
}

const CONTRACTS: Record<NextProductionLineId, NextProductionLineContract> = {
  ACTOR: {
    id: "ACTOR",
    authority: "Existing 4PLANET ACTOR GRAPH / Actor Profiles authority",
    purpose: "Turn a verified actor identity into reusable Actor intelligence connected to projects, solutions, places and capital.",
    consumes: ["actor identity", "role/type", "geography", "projects", "solutions", "evidence/source", "relationships"],
    produces: ["Actor Profile", "Actor Graph joins", "Project/Solution/Place links", "evidence state"],
    forbiddenParallelSystem: "No flat second actor directory or duplicate Actor Graph.",
    activationGate: ["Shared Actor object contract is current", "ORCA reference Actor is Gold-reviewable", "At least two unlike actor transfers are selected"],
  },
  SOLUTION: {
    id: "SOLUTION",
    authority: "Existing Actor Graph / Solution Intelligence / Planetary Action Intelligence objects",
    purpose: "Turn an evidenced intervention or innovation into reusable Solution intelligence without confusing provider, solution and project.",
    consumes: ["problem/pressure", "solution identity", "mechanism", "evidence", "readiness", "actors", "projects/sites", "limitations"],
    produces: ["Solution object", "evidence/readiness view", "Actor/Project joins", "Open Gap when evidence is insufficient"],
    forbiddenParallelSystem: "No solution catalogue detached from Actor/Project/Capital truth.",
    activationGate: ["Solution object distinction is enforced", "One evidence-rich reference solution exists", "Effect evidence is not inferred from implementation alone"],
  },
  CHOICE: {
    id: "CHOICE",
    authority: "Existing SAP-FOOD-01 / S4PIENS / EMBLA / Human Systems / Choice authority",
    purpose: "Turn evidence and system relationships into a bounded human choice without pretending one universal answer fits everyone.",
    consumes: ["human job/context", "options", "system impacts", "dependencies", "trade-offs", "evidence", "uncertainty"],
    produces: ["Choice experience", "Explainable comparison", "Evidence path", "Learning signal"],
    forbiddenParallelSystem: "No second Choice engine outside FOOD/EMBLA/Human Systems infrastructure.",
    activationGate: ["FOOD Gold reference is accepted", "Choice outcome remains distinct from shared Human Systems infrastructure", "User comprehension/meaningful-use proof exists"],
  },
  CAPITAL: {
    id: "CAPITAL",
    authority: "Existing 4PLANET Capital Conversion Factory / x500 canonical control tower",
    purpose: "Convert a real Project Need into the best truth-constrained funding route and preparation package.",
    consumes: ["Project ID", "Gold Contract", "Project Need", "delivery capability", "proof", "instrument", "deadline", "eligibility"],
    produces: ["qualified route", "AI-complete preparation", "Founder release last-mile", "response/conversion learning"],
    forbiddenParallelSystem: "No new capital database, x500 duplicate or autonomous outreach system.",
    activationGate: ["Opportunity remains owned by canonical Capital Factory", "Capability-first fit is proven", "Founder release remains mandatory for send/submit/share"],
  },
};

export function getNextProductionLineContract(id: ProductionLineId): NextProductionLineContract {
  if (id === "SPECIES_JOURNEY" || id === "ECOSYSTEM_PLACE" || id === "STORY") {
    throw new Error(`${id} is already an operative First-Plank production line`);
  }
  return CONTRACTS[id];
}
