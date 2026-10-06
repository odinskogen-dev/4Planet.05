// ============================================================================
// 4PLANET BRAIN — LIVING SYSTEMS INTELLIGENCE
// Core type system.
//
// ARCHITECTURE NOTE
// This system is graph-native by design, NOT page-native.
// Functions, Services, Recipients, Threats, Drivers, Solutions, Ecosystems and
// Missions are FIRST-CLASS NODES with stable unique IDs. Species do not embed
// these as free text — they reference shared nodes by ID.
//
// This preserves a clean migration path to a real graph database / knowledge
// graph later, while keeping the current implementation a plain set of typed
// TypeScript objects with no backend.
//
// The dominant relationship chain the platform exists to express is:
//   Species → Function → Ecosystem Service → Service Recipient
// Edges live ON the nodes (a Function lists the Services it supports; a Service
// lists the Recipients it benefits), so multiple species converge on the same
// shared chain rather than each restating it.
// ============================================================================

// --- Branded ID types -------------------------------------------------------
// Lightweight nominal typing: prevents accidentally passing a ThreatId where a
// FunctionId is expected, without any runtime cost.

export type SpeciesId = string & { readonly __brand: "Species" };
export type FunctionId = string & { readonly __brand: "Function" };
export type ServiceId = string & { readonly __brand: "Service" };
export type RecipientId = string & { readonly __brand: "Recipient" };
export type ThreatId = string & { readonly __brand: "Threat" };
export type DriverId = string & { readonly __brand: "Driver" };
export type SolutionId = string & { readonly __brand: "Solution" };
export type EcosystemId = string & { readonly __brand: "Ecosystem" };
export type MissionId = string & { readonly __brand: "Mission" };

// Helpers to mint IDs without fighting the type system in data files.
export const sid = (s: string) => s as SpeciesId;
export const fid = (s: string) => s as FunctionId;
export const svid = (s: string) => s as ServiceId;
export const rid = (s: string) => s as RecipientId;
export const tid = (s: string) => s as ThreatId;
export const did = (s: string) => s as DriverId;
export const solid = (s: string) => s as SolutionId;
export const eid = (s: string) => s as EcosystemId;
export const mid = (s: string) => s as MissionId;

// --- Shared scales ----------------------------------------------------------

export type ConservationStatus =
  | "Least Concern"
  | "Near Threatened"
  | "Vulnerable"
  | "Endangered"
  | "Critically Endangered"
  | "Extinct in the Wild"
  | "Extinct"
  | "Data Deficient";

export type SeverityScore = 1 | 2 | 3 | 4 | 5;

export type DependencyLevel = "Critical" | "High" | "Moderate" | "Low";

/** How well-supported a contextual claim is. Surfaced to keep the system honest. */
export type Confidence = "High" | "Medium" | "Low" | "Uncertain";

/** Review state of a traceable claim or contextual link. */
export type ReviewStatus =
  | "Verified"
  | "Reviewed"
  | "Draft"
  | "NeedsSource"
  | "NeedsUpdate"
  | "Deprecated";

// --- Source architecture ----------------------------------------------------

export type TrustLevel = "High" | "Moderate" | "Low" | "Unknown";

export type SourceType =
  | "PeerReviewedLiterature"
  | "ScientificAssessment"
  | "ConservationAuthority"
  | "GovernmentAgency"
  | "ResearchInstitution"
  | "Dataset"
  | "ConservationOrganization"
  | "News"
  | "InternalAnalysis";

/** A first-class source node. Everything traceable points here by ID. */
export interface SourceNode {
  id: string;
  title: string;
  organization: string;
  author?: string;
  year?: number;
  sourceType: SourceType;
  publicationDate?: string;
  lastReviewed?: string;
  url?: string;
  trustLevel: TrustLevel; // reliability
  summary: string;
  usedFor?: string[];
  needsVerification?: boolean;
  notes?: string;
  // v1.3 source verification + quality (all optional, non-breaking)
  evidenceTier?: EvidenceTier;
  sourceQuality?: SourceQuality;
  verificationStatus?: VerificationStatus;
  citationNote?: string;
  accessDate?: string;
}

// --- Claim architecture -----------------------------------------------------

/** A traceable statement, linked to the sources that support it. */
export interface ClaimNode {
  id: string;
  statement: string;
  sourceIds: string[];
  confidence: Confidence;
  reviewStatus: ReviewStatus;
  lastReviewed?: string;
  nodeId?: string; // node this claim is about
  relationshipId?: string; // dependency edge id this claim supports
  explanation?: string;
  dataGaps?: string[];
}

// --- Impact architecture ----------------------------------------------------

/** A specific intervention that can receive capital and produce outcomes. */
export interface ImpactOpportunity {
  id: string;
  title: string;
  description: string;
  ecosystemIds: EcosystemId[];
  speciesIds: SpeciesId[];
  threatIds: ThreatId[];
  solutionIds: SolutionId[];
  expectedOutcomes: string[];
  measurementMethod: string;
  costModel: string;
  confidence: Confidence;
}

export type ThreatCategory =
  | "Climate"
  | "Habitat"
  | "Pollution"
  | "Exploitation"
  | "Disturbance"
  | "Disease";

// Every node carries a plain-language gloss. The Human Translation rule is
// enforced at the type level: humanTranslation is required on every node.
interface NodeBase {
  name: string;
  humanTranslation: string;
}

// --- Node definitions -------------------------------------------------------

/** An ecological role a species performs (e.g. Predation, Pollination). */
export interface FunctionNode extends NodeBase {
  id: FunctionId;
  /** Downstream ecosystem services this function supports. */
  supportsServices: ServiceId[];
}

/** A benefit that flowing ecological function provides to nature or society. */
export interface ServiceNode extends NodeBase {
  id: ServiceId;
  /** Who or what receives this service. */
  benefitsRecipients: RecipientId[];
}

/** A beneficiary of an ecosystem service (e.g. Biodiversity, Humans, Farms). */
export interface RecipientNode extends NodeBase {
  id: RecipientId;
}

/** Underlying force causing a threat (e.g. Global Warming, Agriculture). */
export interface DriverNode extends NodeBase {
  id: DriverId;
}

/**
 * A pressure on living systems. Intrinsic, species-independent facts live here
 * (category + driver). How hard it bites a given species lives on the species
 * (see SpeciesThreatLink) — sea-ice loss is catastrophic for a polar bear and
 * marginal for a jaguar, but it is the same threat node.
 */
export interface ThreatNode extends NodeBase {
  id: ThreatId;
  category: ThreatCategory;
  driver: DriverId;
}

/** A pathway for restoration or resilience. */
export interface SolutionNode extends NodeBase {
  id: SolutionId;
  /** Threats this solution helps address (solution → threat edge). */
  addressesThreats: ThreatId[];
  // --- Solution-intelligence architecture (structure now; ranking later) ---
  evidenceLevel?: Confidence;
  scalability?: "Local" | "Regional" | "Global";
  timeHorizon?: "Immediate" | "Short-term" | "Long-term";
  implementationDifficulty?: "Low" | "Moderate" | "High";
  costProfile?: "Low" | "Medium" | "High" | "Variable" | "Unknown";
  coBenefits?: string[];
  risks?: string[];
  strengthensServices?: ServiceId[];
  supportsHumanSystems?: string[];
  decisionNotes?: string;
}

/** A habitat / biome — a living system. Can provide services and carry threats
 *  and solutions at the ecosystem level (independent of its species). */
export interface EcosystemNode extends NodeBase {
  id: EcosystemId;
  shortDefinition?: string;
  systemRole?: string;
  flagship?: boolean;
  /** Services this ecosystem provides directly (e.g. rainfall regulation). */
  providesServices?: ServiceId[];
  /** Functions performed at the ecosystem level (e.g. water cycling). */
  providesFunctions?: FunctionId[];
  /** Threats acting on the ecosystem as a whole. */
  threats?: ThreatId[];
  /** Solutions that protect or restore the ecosystem. */
  solutions?: SolutionId[];
}

/** A 4PLANET mission a species connects to. The bridge to 4PLANET OS. */
export interface MissionNode extends NodeBase {
  id: MissionId;
  code: string; // e.g. AM4ZONIA
}

// --- Per-species contextual edges -------------------------------------------
// Severity / importance / explanation are contextual to the species, so they
// live on the link, not on the shared node.

export interface SpeciesThreatLink {
  threat: ThreatId;
  severity: SeverityScore;
  explanation: string;
  confidence?: Confidence;
  sourceIds?: string[];
  reviewStatus?: ReviewStatus;
}

export interface SpeciesSolutionLink {
  solution: SolutionId;
  importance: SeverityScore;
  explanation: string;
  confidence?: Confidence;
  sourceIds?: string[];
  reviewStatus?: ReviewStatus;
}

export interface SpeciesEcosystemLink {
  ecosystem: EcosystemId;
  dependency: DependencyLevel;
  explanation?: string;
  confidence?: Confidence;
  sourceIds?: string[];
  reviewStatus?: ReviewStatus;
}

// --- Species ----------------------------------------------------------------

/** Internal data key. Rendered on the frontend as "Importance Assessment". */
export interface FourPlanetIntelligence {
  ecologicalImportance: SeverityScore;
  extinctionRisk: SeverityScore;
  culturalImportance: SeverityScore;
  publicRecognition: SeverityScore;
  dataAvailability: SeverityScore;
  missionRelevance: SeverityScore;
}

export interface SpeciesProfile {
  id: SpeciesId;
  referenceCode: string; // e.g. REFERENCE_001
  slug: string;
  status: "active" | "partial" | "coming-soon";

  commonName: string;
  alternativeNames: string[];
  scientificName: string;
  /** Short biological-type label for cards, e.g. "Apex predator". */
  roleLabel: string;
  /** Systemic significance — why it matters to living systems, cautiously phrased. */
  whyItMatters?: string;
  /** Decision Intelligence V1 — explicit, reviewable signals (optional). */
  signals?: DecisionSignals;
  /** Learning Intelligence V1 — what is known/unknown and how well (optional). */
  knowledge?: KnowledgeProfile;
  summary: string;

  identity: {
    className: string;
    order: string;
    family: string;
    genus: string;
    species: string;
    humanTranslation: string;
  };

  conservation: {
    iucnStatus: ConservationStatus;
    populationTrend: string;
    estimatedWildPopulation: string;
    mainConservationIssue: string;
    citesStatus?: string;
    cmsStatus?: string;
    humanTranslation: string;
  };

  distribution: {
    nativeRange: string;
    currentRange: string;
    ecosystems: SpeciesEcosystemLink[]; // references EcosystemNode by ID
    humanTranslation: string;
  };

  biology: {
    length: string;
    weight: string;
    lifespan: string;
    diet: string;
    keyFoodSources: string[];
    reproduction: string;
    behaviour: string[];
    humanTranslation: string;
  };

  ecologicalIntelligence: {
    ecologicalRole: string;
    keystoneSpecies: string;
    trophicLevel: string;
    humanTranslation: string;
  };

  // The graph-native core: a species points at shared Function nodes.
  // The downstream chain (Service → Recipient) is resolved through the registry.
  functions: FunctionId[];

  threats: SpeciesThreatLink[];
  solutions: SpeciesSolutionLink[];

  fourPlanetIntelligence: FourPlanetIntelligence;

  connections: {
    species: SpeciesId[];
    missions: MissionId[];
  };

  highlights: string[];
  sourceIds: string[];
  lastUpdated: string;
}

// --- Resolved (denormalised) shapes the UI consumes -------------------------
// The registry turns ID references into hydrated objects so components never
// touch raw IDs.

export interface ResolvedServiceChain {
  service: ServiceNode;
  recipients: RecipientNode[];
}

export interface ResolvedFunctionChain {
  function: FunctionNode;
  services: ResolvedServiceChain[];
}

// ============================================================================
// LIVING SYSTEMS INTELLIGENCE LAYER (v0.5)
// New first-class node systems. Architecture-first: types + registries +
// resolvers, connected into the existing graph where obvious. UI is minimal by
// design — several of these are foundations to be populated later.
// ============================================================================

// --- Human Systems (how civilization depends on living systems) -------------
export type HumanSystemId = string & { readonly __brand: "HumanSystem" };
export interface HumanSystemNode extends NodeBase {
  id: HumanSystemId;
}

// --- Dependency edges (what depends on what; what breaks if it disappears) ---
export type DependencyRelationship =
  | "REQUIRED_FOR"
  | "SUPPORTED_BY"
  | "ENHANCED_BY"
  | "CONSTRAINED_BY"
  | "VULNERABLE_TO";
export type DependencyStrength = "Critical" | "High" | "Moderate" | "Low";
export interface DependencyEdge {
  id: string;
  sourceNodeId: string; // any node id
  targetNodeId: string; // any node id
  relationshipType: DependencyRelationship;
  strength: DependencyStrength;
  confidence?: Confidence;
  explanation: string;
  sourceIds?: string[];
}

// --- Spatial intelligence ---------------------------------------------------
export type LocationType =
  | "Planet"
  | "Continent"
  | "Country"
  | "Region"
  | "Biome"
  | "Watershed"
  | "Protected Area"
  | "Indigenous Territory"
  | "Marine Area"
  | "Site";
export interface LocationNode extends NodeBase {
  id: string;
  locationType: LocationType;
  parentId?: string;
  ecosystemIds?: EcosystemId[];
}

// --- Actor intelligence -----------------------------------------------------
export type ActorType =
  | "NGO"
  | "Company"
  | "Government"
  | "Indigenous Group"
  | "University"
  | "Foundation"
  | "Research Institution"
  | "Investor"
  | "Mission Operator";
export interface ActorNode extends NodeBase {
  id: string;
  actorType: ActorType;
  draft?: boolean;
  solutionIds?: SolutionId[];
  ecosystemIds?: EcosystemId[];
  missionIds?: MissionId[];
  impactIds?: string[];
}

// --- Temporal intelligence (architecture only) ------------------------------
export type TemporalType =
  | "Baseline"
  | "Trend"
  | "Forecast"
  | "Target"
  | "Scenario"
  | "TimeSeries";
export interface TemporalObject {
  id: string;
  temporalType: TemporalType;
  title: string;
  subjectNodeId?: string;
  metric?: string;
  notes?: string;
  confidence?: Confidence;
  draft?: boolean;
}

// --- Capital intelligence (foundation only) ---------------------------------
export type CapitalType =
  | "Capital Source"
  | "Capital Vehicle"
  | "Capital Allocation"
  | "Capital Recipient"
  | "Capital Flow";
export interface CapitalObject {
  id: string;
  capitalType: CapitalType;
  title: string;
  notes?: string;
  draft?: boolean;
  impactId?: string; // capital → impact opportunity
  vehicleId?: string; // allocation → vehicle
}

// --- Decision intelligence (foundation only) --------------------------------
export type DecisionType =
  | "Decision"
  | "Priority"
  | "Tradeoff"
  | "Scenario"
  | "Recommendation";
export interface DecisionObject {
  id: string;
  decisionType: DecisionType;
  title: string;
  notes?: string;
  draft?: boolean;
  // architecture-only connection points
  claimIds?: string[];
  threatIds?: ThreatId[];
  solutionIds?: SolutionId[];
  impactIds?: string[];
  capitalIds?: string[];
}

// --- Learning intelligence (foundation only) --------------------------------
export type LearningType =
  | "Learning Record"
  | "Expected Outcome"
  | "Observed Outcome"
  | "Lesson"
  | "Recommendation";
export interface LearningFoundationRecord {
  id: string;
  learningType: LearningType;
  title: string;
  notes?: string;
  draft?: boolean;
  // architecture-only connection points (decision → outcome → learning loop)
  decisionId?: string;
  impactId?: string;
  expectedOutcome?: string;
  observedOutcome?: string;
  lesson?: string;
}

// ============================================================================
// DECISION + LEARNING INTELLIGENCE V1 (v0.7)
// Per-node assessment structures. Any node may eventually carry these; UI is
// intentionally lightweight. No scoring magic — explicit, reviewable signals.
// ============================================================================

export type SignalLevel = "Low" | "Moderate" | "High" | "Critical";
export type Reversibility = "Reversible" | "Partly reversible" | "Irreversible";

export interface DecisionSignals {
  urgency?: SignalLevel;
  leverage?: SignalLevel;
  confidence?: Confidence;
  scale?: SignalLevel;
  reversibility?: Reversibility;
  knowledgeQuality?: Confidence;
  decisionRelevance?: SignalLevel;
}

export type KnowledgeStatus =
  | "Data Deficient"
  | "Emerging"
  | "Well Established"
  | "Contested";

export interface KnowledgeProfile {
  status?: KnowledgeStatus;
  evidenceQuality?: Confidence;
  lastReviewDate?: string; // ISO date
  known?: string;
  unknown?: string;
  researchGaps?: string[];
}

// ============================================================================
// SOLUTION + DECISION INTELLIGENCE (v1.1)
// Structured reasoning — not automated recommendation. Cautious language only.
// ============================================================================

export type SignalScale = "High" | "Medium" | "Low" | "Unknown";
export type DifficultyScale = "Low" | "Moderate" | "High" | "Unknown";
export type HorizonScale = "Immediate" | "Short-term" | "Long-term" | "Unknown";

/** Threat → Solution → Services strengthened → Human systems supported. */
export interface SolutionPathway {
  id: string;
  threatId: string;
  solutionId: string;
  strengthenedServiceIds: string[];
  supportedHumanSystemIds: string[];
  ecosystemIds?: string[];
  claimIds?: string[];
  confidence: Confidence;
  reviewStatus: ReviewStatus;
  dataGaps?: string[];
}

/** Structured reasoning about why a solution may deserve attention. */
export interface DecisionSignal {
  id: string;
  title: string;
  solutionId: string;
  threatIds: string[];
  ecosystemIds?: string[];
  serviceIds?: string[];
  humanSystemIds?: string[];
  leverage: SignalScale;
  urgency: SignalScale;
  confidence: Confidence;
  implementationDifficulty: DifficultyScale;
  reversibility?: SignalScale;
  timeHorizon?: HorizonScale;
  reasoning: string;
  dataGaps?: string[];
  sourceIds?: string[];
  reviewStatus: ReviewStatus;
}

// ============================================================================
// LEARNING + OUTCOME INTELLIGENCE (v1.2)
// The adaptive loop: Decision → Expected → Assumption → Observed → Learning →
// Confidence update. Structured learning examples, NOT live impact reports.
// Failure and uncertainty are treated as intelligence, not embarrassment.
// ============================================================================

export type ExpectedDirection =
  | "Increase" | "Decrease" | "Stabilise" | "Restore" | "Protect" | "Improve" | "Unknown";
export type ObservedDirection = "Improved" | "Declined" | "Stable" | "Mixed" | "Unknown";
export type AssumptionStatus =
  | "Supported" | "PartlySupported" | "NotSupported" | "Inconclusive" | "NotYetObserved";
export type ConfidenceChange = "Increased" | "Decreased" | "Unchanged" | "Unknown";
export type LearningHorizon =
  | "Immediate" | "Short-term" | "Medium-term" | "Long-term" | "Unknown";

export interface ExpectedOutcome {
  id: string;
  title: string;
  description: string;
  decisionSignalId?: string;
  solutionPathwayId?: string;
  ecosystemIds?: string[];
  speciesIds?: string[];
  threatIds?: string[];
  solutionIds?: string[];
  serviceIds?: string[];
  humanSystemIds?: string[];
  expectedDirection: ExpectedDirection;
  metric?: string;
  timeHorizon?: LearningHorizon;
  confidence: Confidence;
  assumptions: string[];
  sourceIds?: string[];
  claimIds?: string[];
  reviewStatus: ReviewStatus;
  dataGaps?: string[];
}

export interface ObservedOutcome {
  id: string;
  expectedOutcomeId: string;
  title: string;
  description: string;
  observedDirection: ObservedDirection;
  evidenceSummary: string;
  metricValue?: string;
  observationDate?: string;
  sourceIds?: string[];
  confidence: Confidence;
  reviewStatus: ReviewStatus;
  dataGaps?: string[];
}

export interface LearningRecord {
  id: string;
  title: string;
  expectedOutcomeId: string;
  observedOutcomeIds: string[];
  decisionSignalIds?: string[];
  solutionPathwayIds?: string[];
  ecosystemIds?: string[];
  speciesIds?: string[];
  whatWasExpected: string;
  whatWasObserved: string;
  whatWeLearned: string;
  assumptionStatus: AssumptionStatus;
  confidenceBefore: Confidence;
  confidenceAfter: Confidence;
  confidenceChange: ConfidenceChange;
  decisionImplication: string;
  dataGaps?: string[];
  sourceIds?: string[];
  reviewStatus: ReviewStatus;
  lastReviewed?: string;
}

export interface ConfidenceUpdate {
  id: string;
  targetType: "Claim" | "DecisionSignal" | "SolutionPathway" | "ExpectedOutcome" | "LearningRecord";
  targetId: string;
  previousConfidence: Confidence;
  updatedConfidence: Confidence;
  reason: string;
  sourceIds?: string[];
  reviewStatus: ReviewStatus;
}

// ============================================================================
// SOURCE VERIFICATION + DATA QUALITY (v1.3)
// A visible integrity layer: what is verified, what needs review, where
// evidence is weak. Honesty over false precision.
// ============================================================================

export type SourceQuality =
  | "Primary" | "High" | "Moderate" | "Contextual" | "NeedsReview";

export type EvidenceTier =
  | "ScientificAssessment"
  | "PeerReviewed"
  | "InstitutionalDataset"
  | "GovernmentMonitoring"
  | "ConservationAuthority"
  | "ResearchInstitution"
  | "ExpertSynthesis"
  | "ContextualReference"
  | "Unverified";

export type VerificationStatus =
  | "Verified" | "NeedsURL" | "NeedsMetadata" | "NeedsReview" | "Deprecated";

export type DataQualityStatus =
  | "Strong" | "Moderate" | "Limited" | "NeedsSource" | "NeedsReview" | "Unverified";

export interface DataQualityIssue {
  id: string;
  targetType:
    | "Source" | "Claim" | "Relationship" | "SolutionPathway"
    | "DecisionSignal" | "LearningRecord" | "Node";
  targetId: string;
  issueType:
    | "MissingSource" | "MissingURL" | "WeakSource" | "IncompleteMetadata"
    | "OverclaimingRisk" | "OutdatedSource" | "UnclearRelationship"
    | "NeedsQuantification" | "RegionalVariation" | "ContextDependency";
  severity: "High" | "Medium" | "Low";
  note: string;
  suggestedFix?: string;
}
