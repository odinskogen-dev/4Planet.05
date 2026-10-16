import type {
  PriorityClass,
  ProductionLineId,
  ProductionLineRole,
  ProjectProjection,
  Section,
  WorkPackage,
} from "./contracts";

export type OperationalProductionLineId = "SPECIES_JOURNEY" | "ECOSYSTEM_PLACE" | "STORY";

export interface ProductionDNA {
  alwaysShared: string[];
  dataDriven: string[];
  variable: string[];
  creative: string[];
  expertGated: string[];
  founderGated: string[];
  automatableNow: string[];
  automatableNext: string[];
}

interface StageTemplate {
  id: string;
  title: string;
  section: Section;
  dependsOn: string[];
  gapClosed: string;
  deliverables: string[];
  definitionOfDone: string[];
  requiredEvidence: string[];
  learningQuestion: string;
  scores: Pick<
    WorkPackage,
    | "estimatedValue"
    | "criticalPath"
    | "dependencyUnlock"
    | "proofValue"
    | "cashValue"
    | "learningValue"
    | "risk"
    | "founderBurden"
    | "concurrencyCost"
  >;
}

export interface ProductionLineTemplate {
  id: OperationalProductionLineId;
  version: string;
  purpose: string;
  benchmarkPrinciples: string[];
  referenceSet: Array<{ role: Exclude<ProductionLineRole, "BATCH">; instanceId: string; label: string }>;
  requiredInputs: string[];
  dna: ProductionDNA;
  stages: StageTemplate[];
}

export interface ProductionLineRule {
  id: string;
  lineId: OperationalProductionLineId;
  stageId: string;
  confidence: "MEDIUM" | "HIGH";
  evidenceInstanceIds: string[];
  authorityRef: string;
  appendDefinitionOfDone: string[];
  appendRequiredEvidence: string[];
}

export interface ProductionLineIntake {
  lineId: OperationalProductionLineId;
  instanceId: string;
  role: ProductionLineRole;
  availableInputs: string[];
  sourceRefs: string[];
  writeScopesBySection: Partial<Record<Section, string[]>>;
  validatedRules?: ProductionLineRule[];
}

export interface ProductionLineCompilation {
  template: ProductionLineTemplate;
  packages: WorkPackage[];
  missingInputs: string[];
  appliedRuleIds: string[];
}

export interface ProductionLineMetric {
  lineId: OperationalProductionLineId;
  instanceId: string;
  role: ProductionLineRole;
  totalMinutes: number;
  aiMinutes: number;
  founderMinutes: number;
  correctionCount: number;
  manualInterventions: number;
  reusedComponents: number;
  totalComponents: number;
  evidenceCompleteness: number;
  productQuality: number;
  mobileQuality: number;
  userComprehension: number;
  accepted: boolean;
  evidenceRefs: string[];
}

export interface CompoundingEvaluation {
  referenceInstanceId: string;
  transferInstanceId: string;
  timeRatio: number;
  founderTimeRatio: number;
  reuseRate: number;
  qualityDelta: number;
  evidenceDelta: number;
  cheaper: boolean;
  fasterForFounder: boolean;
  atLeastAsGood: boolean;
  pass: boolean;
}

const SCORE_DEFAULT = {
  estimatedValue: 8,
  criticalPath: 7,
  dependencyUnlock: 7,
  proofValue: 8,
  cashValue: 2,
  learningValue: 9,
  risk: 3,
  founderBurden: 1,
  concurrencyCost: 2,
} as const;

const sourceStage = (title: string, gapClosed: string): StageTemplate => ({
  id: "SOURCE_VERIFY",
  title,
  section: "RESEARCH_DATA",
  dependsOn: [],
  gapClosed,
  deliverables: ["Source/provenance pack", "Input completeness verdict", "Explicit UNKNOWN/rights/limitations"],
  definitionOfDone: [
    "Identity, observation/measurement and interpretation are not conflated",
    "Every material input has source/provenance or is explicitly UNKNOWN",
    "Rights/licence and update semantics are recorded where relevant",
    "Retrieval method matches source scale; bulk work does not abuse search endpoints",
  ],
  requiredEvidence: ["Primary-source references", "Retrieval/check date", "Input completeness result", "Limitations/rights result"],
  learningQuestion: "Which source path produced the strongest evidence with the least rework and ambiguity?",
  scores: { ...SCORE_DEFAULT, criticalPath: 9, dependencyUnlock: 9 },
});

const templates: Record<OperationalProductionLineId, ProductionLineTemplate> = {
  SPECIES_JOURNEY: {
    id: "SPECIES_JOURNEY",
    version: "01",
    purpose: "Produce a distinctive, truthful species intelligence experience without cloning the reference organism.",
    benchmarkPrinciples: [
      "GBIF: taxonomic identity and occurrence records are different objects; preserve upstream identity and provenance.",
      "OBIS: use access methods appropriate to subset size and preserve Darwin Core/source fields.",
      "IUCN: conservation assessment data has explicit terms, versions and commercial-use limits; rights are a gate, not metadata decoration.",
      "ArcGIS StoryMaps: choose map/narrative behaviour for audience, purpose, performance and mobile comprehension.",
      "National Geographic/Reuters: visual evidence must be provenance-checked; realism is not verification.",
    ],
    referenceSet: [
      { role: "REFERENCE", instanceId: "jaguar", label: "Jaguar — Reference Gold" },
      { role: "TRANSFER_01", instanceId: "orca", label: "Orca — marine transfer" },
      { role: "TRANSFER_02", instanceId: "acropora", label: "Acropora — sessile colonial organism stress test" },
    ],
    requiredInputs: [
      "identity",
      "taxonomy",
      "geography",
      "habitat",
      "observations",
      "ecological_role",
      "relationships",
      "pressures",
      "conservation_state",
      "credible_research",
      "media_rights",
      "uncertainty",
      "provenance",
    ],
    dna: {
      alwaysShared: ["Source/provenance grammar", "Truth states", "Species identity", "Relationship grammar", "Evidence disclosure", "Mobile/accessibility QA", "Learning loop"],
      dataDriven: ["Taxonomy", "Occurrences/observations", "Geography", "Source metadata", "Assessment metadata where rights permit"],
      variable: ["Biome", "Ecological role", "Relationship set", "Pressures", "Map mode", "Journey depth", "LUME suitability"],
      creative: ["Opening encounter", "Story hierarchy", "Visual rhythm", "Motion/interaction", "Memorable payoff"],
      expertGated: ["Causal ecological claims", "Conservation interpretation", "Sensitive-location handling", "Disputed taxonomy/assessment"],
      founderGated: ["Founder Gold judgement", "Public release", "Material new claim/partnership framing"],
      automatableNow: ["Source retrieval/checks", "Input completeness", "Package compilation", "Read-only browser QA", "Regression checks", "Learning candidates"],
      automatableNext: ["Bounded TEST code writes", "Before/after visual evaluation", "Governed BRAIN writeback", "Batch species production"],
    },
    stages: [
      sourceStage("Verify species inputs", "Turn a species request into a provenance-safe build input."),
      {
        id: "RELATIONSHIPS",
        title: "Build species relationships and Living Systems context",
        section: "RESEARCH_DATA",
        dependsOn: ["SOURCE_VERIFY"],
        gapClosed: "Move from flat species facts to evidence-bearing relationships and ecological context.",
        deliverables: ["Relationship set", "Evidence/uncertainty per relationship", "Place/ecosystem joins"],
        definitionOfDone: ["Relationships are separate evidence-bearing objects", "Seeded/inferred relationships are not presented as verified science", "UNKNOWN remains explicit"],
        requiredEvidence: ["Relationship source refs", "Scope/uncertainty notes", "At least one decision/explanation value statement"],
        learningQuestion: "Which relationship primitives transfer without erasing organism-specific biology?",
        scores: { ...SCORE_DEFAULT, learningValue: 10 },
      },
      {
        id: "EXPERIENCE",
        title: "Build Species Card, Page and Journey experience",
        section: "PRODUCT_DESIGN",
        dependsOn: ["RELATIONSHIPS"],
        gapClosed: "Turn verified intelligence into a human-first, organism-specific experience.",
        deliverables: ["Species Card/Page", "Journey", "Map handoff", "Evidence disclosure", "LUME only where appropriate"],
        definitionOfDone: ["Organism is the dominant encounter", "First read is understandable without internal jargon", "Experience is recognisably organism-specific, not a Jaguar clone", "Source depth is progressive rather than visually dominant"],
        requiredEvidence: ["Before/after rendered proof", "Desktop + 390/430 proof", "Direct route", "Truth/rights review"],
        learningQuestion: "Which experience primitives are reusable and which must remain biologically specific?",
        scores: { ...SCORE_DEFAULT, estimatedValue: 10, proofValue: 10 },
      },
      {
        id: "QA",
        title: "Prove Species/Journey Gold quality",
        section: "CODE_QA",
        dependsOn: ["EXPERIENCE"],
        gapClosed: "Reject technically-working but humanly weak or misleading Species output.",
        deliverables: ["Exact-head browser QA", "Mobile/accessibility/performance result", "Truth/rights result", "Accept/correct/reject verdict"],
        definitionOfDone: ["Core journey works on desktop and mobile", "No visual regression or horizontal overflow", "No source failure becomes zero/absence", "No unsupported science or media provenance claim"],
        requiredEvidence: ["Exact SHA", "Browser proof", "Regression results", "Known limitations"],
        learningQuestion: "What failed or required correction that should become a permanent Species gate?",
        scores: { ...SCORE_DEFAULT, criticalPath: 9, proofValue: 10 },
      },
      {
        id: "STORY_HANDOFF",
        title: "Create story/distribution handoff from Species intelligence",
        section: "USER_DISTRIBUTION",
        dependsOn: ["QA"],
        gapClosed: "Make accepted Species intelligence reusable as a truthful public story/discovery entry point.",
        deliverables: ["Story seed", "Audience/job", "Source/claims refs", "Meaningful-use events"],
        definitionOfDone: ["Story seed is grounded in accepted evidence", "No fake reporting/interview", "Meaningful-use measurement is defined beyond pageview"],
        requiredEvidence: ["Source/claim IDs", "Story handoff", "Event/measurement contract"],
        learningQuestion: "Which Species intelligence creates real curiosity and deeper use without sacrificing truth?",
        scores: { ...SCORE_DEFAULT, proofValue: 7, learningValue: 8 },
      },
      {
        id: "LEARN",
        title: "Compile Species transfer learning into the next instance",
        section: "LEARNING",
        dependsOn: ["QA", "STORY_HANDOFF"],
        gapClosed: "Make the next species cheaper/faster/better rather than repeating bespoke work.",
        deliverables: ["Transfer metric", "Scoped learning", "Rule/test candidate", "Next-instance change"],
        definitionOfDone: ["Learning cites material evidence", "Scope is bounded", "Any rule change only strengthens future gates unless separately authorised"],
        requiredEvidence: ["Reference vs transfer metrics", "Evidence refs", "Next comparable test"],
        learningQuestion: "Did this instance make the next valid Species instance cheaper/faster and at least as good?",
        scores: { ...SCORE_DEFAULT, learningValue: 10, founderBurden: 0 },
      },
    ],
  },
  ECOSYSTEM_PLACE: {
    id: "ECOSYSTEM_PLACE",
    version: "01",
    purpose: "Produce a place/ecosystem intelligence object that connects geography, life, change, pressures, evidence and action without becoming a generic map dashboard.",
    benchmarkPrinciples: [
      "Earth Engine: keep source datasets/catalogue identity separate from derived views and compute.",
      "Global Forest Watch: expose dataset source, version, function and cautions alongside alerts/derived intelligence.",
      "ArcGIS StoryMaps: choreograph map views to build understanding step-by-step rather than showing all layers at once.",
      "Conservation Evidence: intervention claims require effect evidence; monitoring or correlation alone is not causal proof.",
    ],
    referenceSet: [
      { role: "REFERENCE", instanceId: "bay-of-biscay", label: "Bay of Biscay — Reference Gold" },
      { role: "TRANSFER_01", instanceId: "amazonia", label: "Amazonia — forest complexity transfer" },
      { role: "TRANSFER_02", instanceId: "oslofjord", label: "Oslofjord — bounded local coastal transfer" },
    ],
    requiredInputs: ["geography", "boundaries", "habitats", "species", "relationships", "environmental_state", "pressures", "monitoring", "observations", "people", "actors", "solutions", "uncertainty", "provenance"],
    dna: {
      alwaysShared: ["Place identity", "Spatial/source distinction", "Evidence grammar", "Relationship grammar", "Pressure/state distinction", "Map/story progression", "QA/learning"],
      dataDriven: ["Geometry", "Observations", "Environmental datasets", "Monitoring records", "Source/version metadata"],
      variable: ["Scale", "Boundary semantics", "Biome", "Species/community mix", "Pressures", "Monitoring density", "Actors/solutions"],
      creative: ["Place opening", "Map choreography", "Narrative path", "Visual hierarchy", "What changes over time"],
      expertGated: ["Ecosystem state interpretation", "Causality", "Intervention effectiveness", "Community/Indigenous authority"],
      founderGated: ["Founder Gold judgement", "Public release", "Partner/action framing"],
      automatableNow: ["Source checks", "Dataset metadata", "Input completeness", "Production package compilation", "Read-only map/browser QA"],
      automatableNext: ["Bounded TEST writes", "Automated spatial joins with validated semantics", "Cross-line actor/solution joins", "Batch Place production"],
    },
    stages: [
      sourceStage("Verify place/ecosystem inputs", "Turn a place request into a source- and boundary-safe build input."),
      {
        id: "SYSTEM_MODEL",
        title: "Build ecosystem relationships, pressures and change model",
        section: "RESEARCH_DATA",
        dependsOn: ["SOURCE_VERIFY"],
        gapClosed: "Connect place, life, pressures and monitoring without conflating route/area/observation with ecological state.",
        deliverables: ["Place/geometry contract", "Relationship/pressure set", "Monitoring/change sources", "Actor/solution joins where evidenced"],
        definitionOfDone: ["Place boundary semantics are explicit", "Observation/alert ≠ ecosystem state", "Route/corridor ≠ migration unless separately evidenced", "Cautions/limitations remain visible"],
        requiredEvidence: ["Geometry/source refs", "Dataset versions", "Pressure/monitoring evidence", "Limitations"],
        learningQuestion: "Which place-system primitives transfer from ocean to forest to local coastal ecosystem?",
        scores: { ...SCORE_DEFAULT, learningValue: 10 },
      },
      {
        id: "EXPERIENCE",
        title: "Build Ecosystem/Place intelligence experience",
        section: "PRODUCT_DESIGN",
        dependsOn: ["SYSTEM_MODEL"],
        gapClosed: "Make the place understandable in seconds while allowing controlled depth.",
        deliverables: ["Standalone place/ecosystem surface", "Map choreography", "Evidence/state/pressure layers", "Species/actor/solution handoffs"],
        definitionOfDone: ["Place reads as its own intelligence object", "Map directs attention instead of dumping layers", "Human can distinguish place, monitoring, pressure and action", "Mobile remains legible"],
        requiredEvidence: ["Before/after route proof", "Desktop + mobile", "Map interaction proof", "Truth/rights review"],
        learningQuestion: "What presentation structure makes a complex place instantly legible without flattening it?",
        scores: { ...SCORE_DEFAULT, estimatedValue: 10, proofValue: 10 },
      },
      {
        id: "QA",
        title: "Prove Ecosystem/Place Gold quality",
        section: "CODE_QA",
        dependsOn: ["EXPERIENCE"],
        gapClosed: "Reject generic dashboards, misleading spatial semantics and weak mobile place experiences.",
        deliverables: ["Exact-head browser QA", "Spatial/truth regression", "Mobile/accessibility/performance result", "Verdict"],
        definitionOfDone: ["Place identity survives navigation", "Map remains usable", "Spatial semantics do not overclaim", "Evidence/source states are inspectable"],
        requiredEvidence: ["Exact SHA", "Browser proof", "Spatial regression", "Known limitations"],
        learningQuestion: "Which failure should become a permanent Place production gate?",
        scores: { ...SCORE_DEFAULT, criticalPath: 9, proofValue: 10 },
      },
      {
        id: "STORY_HANDOFF",
        title: "Create ecosystem story/action handoff",
        section: "USER_DISTRIBUTION",
        dependsOn: ["QA"],
        gapClosed: "Turn accepted place intelligence into story/discovery/action context without inventing outcomes.",
        deliverables: ["Story seeds", "Species/actor/solution handoffs", "Meaningful-use measurement"],
        definitionOfDone: ["Story/action handoff cites accepted evidence", "Actor/solution claims retain source/state", "No action is presented as delivered impact"],
        requiredEvidence: ["Source/claim refs", "Handoff links", "Measurement contract"],
        learningQuestion: "Which place intelligence causes deeper exploration or credible action interest?",
        scores: { ...SCORE_DEFAULT, proofValue: 7, learningValue: 8 },
      },
      {
        id: "LEARN",
        title: "Compile ecosystem transfer learning into the next place",
        section: "LEARNING",
        dependsOn: ["QA", "STORY_HANDOFF"],
        gapClosed: "Make the next Place instance cheaper/faster/better.",
        deliverables: ["Transfer metric", "Scoped rule/test candidate", "Next-instance improvement"],
        definitionOfDone: ["Reference/transfer metrics exist", "Learning is scoped", "Future gate additions are evidence-backed"],
        requiredEvidence: ["Metrics", "Evidence refs", "Next test"],
        learningQuestion: "Did the place method compound across ocean, forest and local coastal contexts?",
        scores: { ...SCORE_DEFAULT, learningValue: 10, founderBurden: 0 },
      },
    ],
  },
  STORY: {
    id: "STORY",
    version: "01",
    purpose: "Turn accepted 4PLANET intelligence into truthful, memorable, native story packages through the existing Story Engine.",
    benchmarkPrinciples: [
      "Existing 4PLANET Story Engine remains authority: source pack → claims map → brief → draft → audit → derivatives → publication record → learning.",
      "ArcGIS StoryMaps: audience/purpose determine structure and map medium; simplicity and progressive narrative beat feature density.",
      "Reuters: verify public visual material using creator/source context, metadata and corroborating evidence; AI detection alone is insufficient.",
      "National Geographic: image truth matters as much as word truth; do not covertly manipulate documentary evidence.",
    ],
    referenceSet: [
      { role: "REFERENCE", instanceId: "living-ocean-gold", label: "Living Ocean — first Gold Story family" },
      { role: "TRANSFER_01", instanceId: "species-story", label: "Species intelligence transfer" },
      { role: "TRANSFER_02", instanceId: "place-story", label: "Ecosystem/place intelligence transfer" },
    ],
    requiredInputs: ["story_question", "audience", "entities", "source_refs", "claim_refs", "limitations", "rights_assets", "intelligence_origin"],
    dna: {
      alwaysShared: ["Source pack", "Claims map", "Audience/job", "Truth/limitations", "Audit", "Derivative lineage", "Measurement", "Learning"],
      dataDriven: ["Entity/source/claim context", "Dates", "Geography", "Verified visuals/metadata", "Observed product/user signals"],
      variable: ["Story question", "Channel", "Length", "Protagonist", "Visual medium", "CTA/no-CTA"],
      creative: ["Hook", "Tension", "Narrative structure", "Visual grammar", "Pacing", "Payoff", "Memorability"],
      expertGated: ["Scientific interpretation", "Contested causal claims", "Sensitive reporting/rights"],
      founderGated: ["Final public voice/judgement", "Publication/release", "External representation"],
      automatableNow: ["Research/source verification", "Claims map", "Story options", "Draft/derivatives", "Audit prep", "Measurement design"],
      automatableNext: ["Governed Story Engine runtime compilation", "Automated multi-format production", "Performance-based method updates"],
    },
    stages: [
      sourceStage("Verify story source/claims pack", "Turn planetary intelligence into a verified story input rather than an AI-generated premise."),
      {
        id: "STORY_BUILD",
        title: "Build Gold story through existing Story Engine",
        section: "USER_DISTRIBUTION",
        dependsOn: ["SOURCE_VERIFY"],
        gapClosed: "Convert verified intelligence into a human story with a clear audience, question, narrative and payoff.",
        deliverables: ["Story brief", "Long-form draft", "Visual grammar", "Short-form derivatives", "Source/limitations access"],
        definitionOfDone: ["Core story is understandable early", "Every material claim maps to source/claim record", "No fake quote/reporting/interview", "Derivative formats preserve source meaning rather than compressing away qualifiers"],
        requiredEvidence: ["Story record", "Claims map", "Rights/visual record", "Derivative lineage"],
        learningQuestion: "Which narrative structure best converted accepted intelligence into understanding and tellability?",
        scores: { ...SCORE_DEFAULT, estimatedValue: 9, proofValue: 8, learningValue: 9 },
      },
      {
        id: "QA",
        title: "Audit Story Gold quality and truth",
        section: "CODE_QA",
        dependsOn: ["STORY_BUILD"],
        gapClosed: "Reject polished but weak, misleading or derivative AI storytelling.",
        deliverables: ["Truth/source audit", "Human clarity/tellability verdict", "Rights/visual verification", "Accept/correct/reject"],
        definitionOfDone: ["Claims remain qualified", "Visual provenance is verified", "Story does not read like internal/system language", "Channel format is native and accessible"],
        requiredEvidence: ["Audit result", "Source/claims readback", "Rights evidence", "Correction record if applicable"],
        learningQuestion: "What story failure should become a permanent Story Engine gate?",
        scores: { ...SCORE_DEFAULT, proofValue: 10, criticalPath: 8 },
      },
      {
        id: "MEASURE",
        title: "Define meaningful story response measurement",
        section: "USER_DISTRIBUTION",
        dependsOn: ["QA"],
        gapClosed: "Measure useful response rather than output volume or vanity reach.",
        deliverables: ["Meaningful-use events", "Completion/deeper-exploration/share/return measures", "Hypothesis for next story"],
        definitionOfDone: ["Pageview alone is insufficient", "Measurement excludes test pollution", "No PII/free-text is required"],
        requiredEvidence: ["Event contract", "Host/environment boundary", "Learning hypothesis"],
        learningQuestion: "What audience behaviour would actually show the story created understanding or deeper exploration?",
        scores: { ...SCORE_DEFAULT, proofValue: 8, learningValue: 9 },
      },
      {
        id: "LEARN",
        title: "Improve Story method from evidence",
        section: "LEARNING",
        dependsOn: ["QA", "MEASURE"],
        gapClosed: "Make the next story faster/better without lowering editorial truth.",
        deliverables: ["Story transfer metric", "Scoped method change", "Next test"],
        definitionOfDone: ["Learning is evidence-backed", "Rule change is scoped", "Truth/rights gates can only be strengthened automatically"],
        requiredEvidence: ["Reference vs transfer metrics", "Evidence refs", "Next comparable story test"],
        learningQuestion: "Did the next story reuse the method while remaining original, truthful and more efficient?",
        scores: { ...SCORE_DEFAULT, learningValue: 10, founderBurden: 0 },
      },
    ],
  },
};

function text(value: string, field: string): string {
  if (!value.trim()) throw new Error(`Production line missing ${field}`);
  return value.trim();
}

function slug(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 52);
}

function validateRule(rule: ProductionLineRule, lineId: OperationalProductionLineId, stageIds: Set<string>): void {
  if (rule.lineId !== lineId) throw new Error(`Production-line rule ${rule.id} targets another line`);
  if (!stageIds.has(rule.stageId)) throw new Error(`Production-line rule ${rule.id} targets unknown stage ${rule.stageId}`);
  const evidenceInstances = new Set(rule.evidenceInstanceIds.filter(Boolean));
  if (evidenceInstances.size < 2) throw new Error(`Production-line rule ${rule.id} requires evidence from at least two distinct instances`);
  if (!rule.authorityRef.trim()) throw new Error(`Production-line rule ${rule.id} requires governed authorityRef`);
  if (rule.appendDefinitionOfDone.length + rule.appendRequiredEvidence.length === 0) {
    throw new Error(`Production-line rule ${rule.id} must strengthen at least one gate`);
  }
}

export function getProductionLineTemplate(lineId: ProductionLineId): ProductionLineTemplate {
  if (lineId === "ACTOR" || lineId === "SOLUTION" || lineId === "CHOICE" || lineId === "CAPITAL") {
    throw new Error(`${lineId} is a linked NEXT production contract, not an operative First-Plank line yet`);
  }
  return templates[lineId];
}

export function compileProductionLinePackages(
  project: ProjectProjection,
  priority: Exclude<PriorityClass, "INCUBATING" | "PARKED">,
  approvedAt: string,
  intake: ProductionLineIntake,
): ProductionLineCompilation {
  const template = getProductionLineTemplate(intake.lineId);
  const instanceId = text(intake.instanceId, "instanceId");
  if (!Number.isFinite(Date.parse(approvedAt))) throw new Error("Production-line approvedAt must be ISO-compatible");
  if (intake.sourceRefs.length === 0) throw new Error("Production line requires at least one authority/source reference");

  const available = new Set(intake.availableInputs.map((value) => value.trim()).filter(Boolean));
  const missingInputs = template.requiredInputs.filter((field) => !available.has(field));
  const rules = intake.validatedRules ?? [];
  const stageIds = new Set(template.stages.map((stage) => stage.id));
  for (const rule of rules) validateRule(rule, intake.lineId, stageIds);

  const packageIdByStage = new Map(
    template.stages.map((stage, index) => [stage.id, `${slug(project.id)}-${slug(intake.lineId)}-${String(index + 1).padStart(2, "0")}`]),
  );

  const packages = template.stages.map((stage, index): WorkPackage => {
    const id = packageIdByStage.get(stage.id);
    if (!id) throw new Error(`Missing package id for stage ${stage.id}`);
    const dependencies = stage.dependsOn.map((stageId) => {
      const dependency = packageIdByStage.get(stageId);
      if (!dependency) throw new Error(`Unknown stage dependency ${stageId}`);
      return dependency;
    });
    const matchingRules = rules.filter((rule) => rule.stageId === stage.id);
    const writeScopes = intake.writeScopesBySection[stage.section] ?? [];
    const blockedForMissingInputs = index === 0 && missingInputs.length > 0;

    return {
      id,
      projectId: project.id,
      title: stage.title,
      section: stage.section,
      priority,
      goalLink: project.goal,
      gapClosed: stage.gapClosed,
      deliverables: [...stage.deliverables],
      dependencies,
      writeScopes: [...writeScopes],
      definitionOfDone: [...stage.definitionOfDone, ...matchingRules.flatMap((rule) => rule.appendDefinitionOfDone)],
      requiredEvidence: [
        ...stage.requiredEvidence,
        ...matchingRules.flatMap((rule) => rule.appendRequiredEvidence),
        ...intake.sourceRefs.map((ref) => `production-line source/authority: ${ref}`),
      ],
      productionLine: {
        lineId: intake.lineId,
        instanceId,
        templateVersion: template.version,
        stage: stage.id,
        role: intake.role,
      },
      learningQuestion: stage.learningQuestion,
      founderGate: project.founderGate,
      createdAt: approvedAt,
      ...stage.scores,
      status: blockedForMissingInputs || dependencies.length > 0 ? "BLOCKED" : "READY",
    };
  });

  return Object.freeze({
    template,
    packages: Object.freeze(packages) as unknown as WorkPackage[],
    missingInputs: Object.freeze(missingInputs) as unknown as string[],
    appliedRuleIds: Object.freeze(rules.map((rule) => rule.id)) as unknown as string[],
  });
}

function boundedMetric(value: number, field: string, max = Number.POSITIVE_INFINITY): number {
  if (!Number.isFinite(value) || value < 0 || value > max) throw new Error(`Invalid production-line metric ${field}`);
  return value;
}

export function evaluateCompounding(reference: ProductionLineMetric, transfer: ProductionLineMetric): CompoundingEvaluation {
  if (reference.lineId !== transfer.lineId) throw new Error("Compounding comparison requires the same production line");
  if (!reference.accepted || !transfer.accepted) throw new Error("Compounding comparison requires accepted instances");
  if (reference.evidenceRefs.length === 0 || transfer.evidenceRefs.length === 0) throw new Error("Compounding metrics require evidence refs");

  boundedMetric(reference.totalMinutes, "reference.totalMinutes");
  boundedMetric(transfer.totalMinutes, "transfer.totalMinutes");
  boundedMetric(reference.founderMinutes, "reference.founderMinutes");
  boundedMetric(transfer.founderMinutes, "transfer.founderMinutes");
  boundedMetric(transfer.reusedComponents, "transfer.reusedComponents");
  boundedMetric(transfer.totalComponents, "transfer.totalComponents");
  boundedMetric(reference.evidenceCompleteness, "reference.evidenceCompleteness", 1);
  boundedMetric(transfer.evidenceCompleteness, "transfer.evidenceCompleteness", 1);
  boundedMetric(reference.productQuality, "reference.productQuality", 10);
  boundedMetric(transfer.productQuality, "transfer.productQuality", 10);
  boundedMetric(reference.mobileQuality, "reference.mobileQuality", 10);
  boundedMetric(transfer.mobileQuality, "transfer.mobileQuality", 10);
  boundedMetric(reference.userComprehension, "reference.userComprehension", 10);
  boundedMetric(transfer.userComprehension, "transfer.userComprehension", 10);

  const timeRatio = reference.totalMinutes === 0 ? 1 : transfer.totalMinutes / reference.totalMinutes;
  const founderTimeRatio = reference.founderMinutes === 0 ? (transfer.founderMinutes === 0 ? 1 : Number.POSITIVE_INFINITY) : transfer.founderMinutes / reference.founderMinutes;
  const reuseRate = transfer.totalComponents === 0 ? 0 : transfer.reusedComponents / transfer.totalComponents;
  const referenceQuality = (reference.productQuality + reference.mobileQuality + reference.userComprehension) / 3;
  const transferQuality = (transfer.productQuality + transfer.mobileQuality + transfer.userComprehension) / 3;
  const qualityDelta = transferQuality - referenceQuality;
  const evidenceDelta = transfer.evidenceCompleteness - reference.evidenceCompleteness;
  const cheaper = timeRatio < 1;
  const fasterForFounder = founderTimeRatio <= 1;
  const atLeastAsGood = qualityDelta >= 0 && evidenceDelta >= 0;

  return {
    referenceInstanceId: reference.instanceId,
    transferInstanceId: transfer.instanceId,
    timeRatio,
    founderTimeRatio,
    reuseRate,
    qualityDelta,
    evidenceDelta,
    cheaper,
    fasterForFounder,
    atLeastAsGood,
    pass: cheaper && fasterForFounder && atLeastAsGood,
  };
}
