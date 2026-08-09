import type { GateState, StoryRecord } from "./types";

export type AssetMaturity = "CANON" | "PROVISIONAL_UNTIL_RECOGNITION_TEST" | "EXPERIMENTAL";
export type MediaTruthClass = "DOCUMENTARY_REALITY" | "INTERFACE_DATA" | "DESIGN" | "ART" | "SYNTHETIC";

export interface DistinctiveAssetDefinition {
  id: string;
  name: string;
  role: string;
  maturity: AssetMaturity;
  rules: string[];
}

export interface ProductionTemplate {
  id: string;
  name: string;
  contentJob: "WONDER" | "EXPLAIN" | "SIGNAL" | "PROOF" | "PLACE" | "HUMAN" | "SHARE";
  requiredElements: string[];
  allowedTruthClasses: MediaTruthClass[];
  defaultChannels: string[];
}

export interface ProductionObject {
  productionId: string;
  storyId: string;
  templateId: string;
  truthClass: MediaTruthClass;
  sourceGate: GateState;
  rightsGate: GateState;
  syntheticDisclosure: boolean;
  altText: string;
  provenanceState: "SOURCE" | "4PLANET_CONTEXT" | "PARTNER_REPORT" | "ASSESSED_OUTCOME" | "VERIFIED_OUTCOME";
  provenanceLabel: string;
  coverageLimit: string;
  claimText: string;
}

export interface ProductionQAResult {
  status: "PASS" | "BLOCKED";
  reasons: string[];
}

export const distinctiveAssets: DistinctiveAssetDefinition[] = [
  {
    id: "DA-001",
    name: "4PLANET_ masterbrand lockup",
    role: "Primary memory accumulator; territories and missions remain endorsed worlds beneath the masterbrand.",
    maturity: "CANON",
    rules: ["Masterbrand dominates public memory.", "4-code is a family signature, not decorative spelling."],
  },
  {
    id: "DA-002",
    name: "White / ink / Brand Blue interface grammar",
    role: "Editorial and product intervention around documentary life.",
    maturity: "CANON",
    rules: ["Paper #FFFFFF.", "Ink #0A0A0A.", "Brand Blue #2E2EFF.", "Nature keeps its real colours; blue behaves as interface/editorial signal."],
  },
  {
    id: "DA-003",
    name: "Instrument Sans / DM Sans / Fragment Mono typography",
    role: "Display, body/UI and evidence/data distinction.",
    maturity: "CANON",
    rules: ["Instrument Sans for display.", "DM Sans for body/UI.", "Fragment Mono for IDs, evidence, states and technical metadata."],
  },
  {
    id: "DA-004",
    name: "Relationship Reveal",
    role: "Signature behaviour for making living relationships visible.",
    maturity: "PROVISIONAL_UNTIL_RECOGNITION_TEST",
    rules: ["THREAD is default.", "ORBIT is hero treatment.", "CONSTELLATION is deep/system treatment.", "Never imply causality or dependency beyond the source scope."],
  },
  {
    id: "DA-005",
    name: "Proof / Provenance Bar",
    role: "Visible boundary between source, 4PLANET context, partner report, assessed outcome and verified outcome.",
    maturity: "PROVISIONAL_UNTIL_RECOGNITION_TEST",
    rules: ["State must be explicit.", "Actor, time, source/method and limitation must remain available.", "Never escalate status through copy styling."],
  },
  {
    id: "DA-006",
    name: "ONE PLACE map grammar",
    role: "Place-first view joining bounded living-system layers without flattening uncertainty.",
    maturity: "PROVISIONAL_UNTIL_RECOGNITION_TEST",
    rules: ["Coverage remains visible.", "Time remains visible.", "Co-location is not causality.", "Missing data is not absence."],
  },
];

export const productionTemplates: ProductionTemplate[] = [
  {
    id: "TPL-DOC-01",
    name: "Documentary single frame",
    contentJob: "WONDER",
    requiredElements: ["documentary asset", "subject/place context", "source/rights footer", "accessible alt text"],
    allowedTruthClasses: ["DOCUMENTARY_REALITY"],
    defaultChannels: ["instagram", "web", "linkedin"],
  },
  {
    id: "TPL-REL-01",
    name: "Relationship Reveal — 2–4 frame",
    contentJob: "EXPLAIN",
    requiredElements: ["bounded nodes", "source sidecar", "relationship scope", "coverage/limit", "accessible alt text"],
    allowedTruthClasses: ["INTERFACE_DATA", "DESIGN"],
    defaultChannels: ["instagram", "web", "youtube"],
  },
  {
    id: "TPL-PLACE-01",
    name: "ONE PLACE",
    contentJob: "PLACE",
    requiredElements: ["place", "source layers", "time", "coverage", "uncertainty", "accessible alt text"],
    allowedTruthClasses: ["DOCUMENTARY_REALITY", "INTERFACE_DATA", "DESIGN"],
    defaultChannels: ["web", "instagram", "youtube", "linkedin"],
  },
  {
    id: "TPL-SIGNAL-01",
    name: "4PLANET SIGNAL_",
    contentJob: "SIGNAL",
    requiredElements: ["what changed", "where/when", "source", "what it does not establish", "accessible alt text"],
    allowedTruthClasses: ["DOCUMENTARY_REALITY", "INTERFACE_DATA", "DESIGN"],
    defaultChannels: ["web", "instagram", "linkedin"],
  },
  {
    id: "TPL-PROOF-01",
    name: "PROOF, NOT PROMISES_",
    contentJob: "PROOF",
    requiredElements: ["provenance state", "actor", "time", "source/method", "limitation", "accessible alt text"],
    allowedTruthClasses: ["DOCUMENTARY_REALITY", "INTERFACE_DATA", "DESIGN"],
    defaultChannels: ["web", "instagram", "linkedin"],
  },
  {
    id: "TPL-MOTION-01",
    name: "Editorial motion short",
    contentJob: "SHARE",
    requiredElements: ["source truth object", "motion-safe typography", "captions", "source/rights footer", "accessible transcript"],
    allowedTruthClasses: ["DOCUMENTARY_REALITY", "INTERFACE_DATA", "DESIGN", "ART", "SYNTHETIC"],
    defaultChannels: ["instagram", "youtube", "tiktok"],
  },
];

const gatePasses = (gate: GateState) => gate === "PASS" || gate === "NOT_APPLICABLE";

export function evaluateProductionObject(
  story: StoryRecord,
  object: ProductionObject,
  template = productionTemplates.find((candidate) => candidate.id === object.templateId),
): ProductionQAResult {
  const reasons: string[] = [];

  if (!template) reasons.push(`Unknown production template ${object.templateId}.`);
  if (object.storyId !== story.storyId) reasons.push("Production object is attached to the wrong story authority.");
  if (!gatePasses(object.sourceGate)) reasons.push(`Production source gate is ${object.sourceGate}.`);
  if (!gatePasses(object.rightsGate)) reasons.push(`Production rights gate is ${object.rightsGate}.`);
  if (!object.altText.trim()) reasons.push("Accessible alt text is required.");
  if (!object.provenanceLabel.trim()) reasons.push("A human-readable provenance label is required.");
  if (!object.coverageLimit.trim()) reasons.push("A visible coverage or limitation statement is required.");
  if (!object.claimText.trim()) reasons.push("A bounded claim or contextual statement is required.");
  if (template && !template.allowedTruthClasses.includes(object.truthClass)) {
    reasons.push(`${object.truthClass} is not allowed by template ${template.id}.`);
  }
  if (object.truthClass === "SYNTHETIC" && !object.syntheticDisclosure) {
    reasons.push("Synthetic media requires explicit disclosure.");
  }
  if (object.truthClass === "SYNTHETIC" && object.provenanceState === "VERIFIED_OUTCOME") {
    reasons.push("Synthetic media cannot serve as verified-outcome evidence.");
  }

  return { status: reasons.length === 0 ? "PASS" : "BLOCKED", reasons };
}
