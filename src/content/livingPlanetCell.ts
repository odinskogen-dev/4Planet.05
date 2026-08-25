import { assertCoordinationGraph, evaluateExplainableMatch, type CoordinationGraph } from "@/planet/coordinationGraph";

export type SourceRecord = {
  id: string;
  title: string;
  publisher: string;
  url: string;
  sourceType: "OFFICIAL" | "RESEARCH" | "ASSESSMENT" | "CANONICAL_INTERNAL";
  publishedAt?: string;
  checkedAt: string;
  rightsNote: string;
};

export const LIVING_PLANET_SOURCES: SourceRecord[] = [
  {
    id: "SRC-BGO-KPA-2027",
    title: "Kommuneplanens arealdel KPA 2027 — public consultation",
    publisher: "Bergen kommune",
    url: "https://portal-vip.bergen.kommune.no/hvaskjer/kunngjoringer/kommuneplanens-arealdel-kpa-2027",
    sourceType: "OFFICIAL",
    publishedAt: "2026-08-22",
    checkedAt: "2026-08-26",
    rightsNote: "Use facts and links with attribution; do not reproduce plan documents wholesale.",
  },
  {
    id: "SRC-BGO-KPA-PARKING",
    title: "Parkering — en utredning til KPA 2027",
    publisher: "Bergen kommune",
    url: "https://www.bergen.kommune.no/api/rest/filer/V70102900",
    sourceType: "ASSESSMENT",
    checkedAt: "2026-08-26",
    rightsNote: "Municipal assessment used as decision evidence; not represented as independent academic research.",
  },
  {
    id: "SRC-UIB-PROCLIMATE",
    title: "Pro-Climate research project",
    publisher: "University of Bergen",
    url: "https://www4.uib.no/forskning/forskningsprosjekter/pro-climate",
    sourceType: "RESEARCH",
    checkedAt: "2026-08-26",
    rightsNote: "Metadata and short factual summary only; source remains authoritative.",
  },
  {
    id: "SRC-UIB-CESAM",
    title: "Centre for Sustainable Area Management (CeSAM)",
    publisher: "University of Bergen",
    url: "https://www4.uib.no/forskning/forskningssentre/senter-for-barekraftig-arealbruk-cesam",
    sourceType: "RESEARCH",
    checkedAt: "2026-08-26",
    rightsNote: "Organisation metadata and factual role summary with attribution.",
  },
  {
    id: "SRC-ACTOR-MASTER",
    title: "4PLANET Global Actor Master / Identity Crosswalk",
    publisher: "4PLANET BRAIN",
    url: "https://docs.google.com/spreadsheets/d/1RhlIPzdgZtEhg6952dqkCHGDYpMDhbfxOAKvoFQ03t4/edit",
    sourceType: "CANONICAL_INTERNAL",
    checkedAt: "2026-08-26",
    rightsNote: "Internal identity authority. Private relationship/contact data must never project publicly.",
  },
];

export type ResearchObject = {
  id: string;
  type: "RESEARCH_PROJECT" | "ASSESSMENT" | "PAPER";
  title: string;
  status: "ONGOING" | "PUBLISHED" | "CURRENT_ASSESSMENT";
  humanFinding: string;
  whyItMatters: string;
  confidence: string;
  didNotProve: string;
  researchers: Array<{ name: string; actorId?: string; canonicalState: "RESOLVED" | "UNRESOLVED" }>;
  institutions: Array<{ name: string; actorId?: string }>;
  funders: string[];
  placeIds: string[];
  problemIds: string[];
  sourceIds: string[];
};

export const RESEARCH_OBJECTS: ResearchObject[] = [
  {
    id: "RES-BGO-PROCLIMATE-01",
    type: "RESEARCH_PROJECT",
    title: "Pro-Climate — sustainable land management and inclusive climate adaptation",
    status: "ONGOING",
    humanFinding: "This is ongoing research, so 4PLANET does not present final findings. The project is testing how social and political measures can support climate adaptation and behaviour change, with Bergen/Vestland as the Norwegian case.",
    whyItMatters: "It connects research on policy, behaviour and land management directly to choices local institutions and communities may face.",
    confidence: "High confidence in project scope and funding metadata; final scientific conclusions remain open because the project is ongoing.",
    didNotProve: "It does not yet prove that a particular Bergen policy, behaviour intervention or land-use scenario is best.",
    researchers: [{ name: "David Herbert", canonicalState: "UNRESOLVED" }, { name: "Julianna Burrill", canonicalState: "UNRESOLVED" }, { name: "Frida Sundvor", canonicalState: "UNRESOLVED" }],
    institutions: [{ name: "University of Bergen" }, { name: "NORCE" }, { name: "Coventry University" }],
    funders: ["Horizon Europe"],
    placeIds: ["PLACE-BERGEN", "PLACE-VESTLAND"],
    problemIds: ["PROBLEM-BGO-LAND-CLIMATE"],
    sourceIds: ["SRC-UIB-PROCLIMATE"],
  },
  {
    id: "RES-BGO-KPA-PARKING-01",
    type: "ASSESSMENT",
    title: "Parking — assessment for KPA 2027",
    status: "CURRENT_ASSESSMENT",
    humanFinding: "Bergen's KPA assessment treats parking as a planning instrument that affects traffic, urban form, noise and air quality, while also affecting accessibility and development costs.",
    whyItMatters: "Parking rules are not only a convenience question; they can change transport behaviour and the shape of future neighbourhoods.",
    confidence: "High confidence that this is part of the municipality's KPA 2027 knowledge base. It is municipal decision evidence, not independent peer-reviewed research.",
    didNotProve: "It does not establish that one universal parking level is optimal for every neighbourhood, household or accessibility need.",
    researchers: [],
    institutions: [{ name: "Bergen kommune", actorId: "P17-A1798" }],
    funders: ["Municipal planning work; no separate research funder asserted"],
    placeIds: ["PLACE-BERGEN"],
    problemIds: ["PROBLEM-BGO-MOBILITY-CLIMATE"],
    sourceIds: ["SRC-BGO-KPA-PARKING"],
  },
];

export type DecisionObject = {
  id: string;
  title: string;
  actorId: string;
  state: "CONSULTATION_OPEN" | "PROPOSAL" | "DECIDED" | "IMPLEMENTING";
  openedAt?: string;
  closesAt?: string;
  summary: string;
  whatIsActuallyBeingDecided: string;
  evidenceIds: string[];
  sourceIds: string[];
  actions: Array<{ id: string; label: string; type: "FOLLOW" | "PARTICIPATE" | "LEARN"; href: string; truthNote: string }>;
};

export const DECISION_OBJECTS: DecisionObject[] = [
  {
    id: "DEC-BGO-KPA-2027",
    title: "KPA 2027 — public consultation",
    actorId: "P17-A1798",
    state: "CONSULTATION_OPEN",
    openedAt: "2026-08-22",
    closesAt: "2026-10-06",
    summary: "Bergen has placed the proposed KPA 2027 land-use provisions on public consultation. The municipality specifically asks for input on several themes including parking and climate-gas provisions.",
    whatIsActuallyBeingDecided: "This is a consultation stage, not the final plan. The current KPA 2018 remains in force until a new plan is adopted.",
    evidenceIds: ["RES-BGO-KPA-PARKING-01", "RES-BGO-PROCLIMATE-01"],
    sourceIds: ["SRC-BGO-KPA-2027", "SRC-BGO-KPA-PARKING"],
    actions: [
      { id: "ACT-BGO-FOLLOW-KPA", label: "Follow KPA 2027", type: "FOLLOW", href: "/follow/bergen", truthNote: "4PLANET follow prototype; notification delivery is not yet promised." },
      { id: "ACT-BGO-KPA-CONSULT", label: "Participate in the public consultation", type: "PARTICIPATE", href: "https://portal-vip.bergen.kommune.no/hvaskjer/kunngjoringer/kommuneplanens-arealdel-kpa-2027", truthNote: "Official Bergen kommune participation route. Comments may become public records." },
      { id: "ACT-BGO-KPA-LEARN", label: "Understand the evidence first", type: "LEARN", href: "/research/res-bgo-kpa-parking-01", truthNote: "4PLANET explanation; source documents remain authoritative." },
    ],
  },
];

export const BERGEN_GRAPH: CoordinationGraph = assertCoordinationGraph({
  nodes: [
    { id: "PLACE-BERGEN", kind: "PLACE", label: "Bergen", reviewState: "SOURCE_BACKED", visibility: "PUBLIC_SAFE", sourceIds: ["SRC-BGO-KPA-2027"] },
    { id: "PLACE-VESTLAND", kind: "PLACE", label: "Vestland", reviewState: "SOURCE_BACKED", visibility: "PUBLIC_SAFE", sourceIds: ["SRC-UIB-PROCLIMATE"] },
    { id: "PROBLEM-BGO-LAND-CLIMATE", kind: "PROBLEM", label: "Land-use choices under climate and nature pressure", reviewState: "SOURCE_BACKED", visibility: "PUBLIC_SAFE", sourceIds: ["SRC-UIB-PROCLIMATE", "SRC-BGO-KPA-2027"], placeIds: ["PLACE-BERGEN"] },
    { id: "PROBLEM-BGO-MOBILITY-CLIMATE", kind: "PROBLEM", label: "Mobility, parking, air, noise and climate trade-offs", reviewState: "SOURCE_BACKED", visibility: "PUBLIC_SAFE", sourceIds: ["SRC-BGO-KPA-PARKING"], placeIds: ["PLACE-BERGEN"] },
    { id: "RES-BGO-PROCLIMATE-01", kind: "RESEARCH", label: "Pro-Climate", reviewState: "SOURCE_BACKED", visibility: "PUBLIC_SAFE", sourceIds: ["SRC-UIB-PROCLIMATE"], placeIds: ["PLACE-BERGEN", "PLACE-VESTLAND"] },
    { id: "RES-BGO-KPA-PARKING-01", kind: "RESEARCH", label: "Parking assessment for KPA 2027", reviewState: "SOURCE_BACKED", visibility: "PUBLIC_SAFE", sourceIds: ["SRC-BGO-KPA-PARKING"], placeIds: ["PLACE-BERGEN"], limitation: "Municipal assessment, not independent peer-reviewed research." },
    { id: "P17-A1798", kind: "ACTOR", label: "Bergen kommune", reviewState: "SOURCE_BACKED", visibility: "PUBLIC_SAFE", sourceIds: ["SRC-ACTOR-MASTER", "SRC-BGO-KPA-2027"] },
    { id: "DEC-BGO-KPA-2027", kind: "DECISION", label: "KPA 2027 public consultation", reviewState: "SOURCE_BACKED", visibility: "PUBLIC_SAFE", sourceIds: ["SRC-BGO-KPA-2027"], validFrom: "2026-08-22", validTo: "2026-10-06" },
    { id: "GAP-BGO-KPA-UNDERSTANDING", kind: "ACTIONABLE_GAP", label: "Make the evidence and choices understandable before participation", reviewState: "DRAFT", visibility: "INTERNAL", sourceIds: [] },
    { id: "SOLUTION-BGO-HUMAN-EXPLANATION", kind: "SOLUTION", label: "Source-aware human explanation + decision context", reviewState: "DRAFT", visibility: "INTERNAL", sourceIds: [] },
    { id: "ACTION-BGO-CONSULTATION", kind: "ACTION", label: "Public consultation participation", reviewState: "SOURCE_BACKED", visibility: "PUBLIC_SAFE", sourceIds: ["SRC-BGO-KPA-2027"] },
  ],
  edges: [
    { id: "E-BGO-PROBLEM-PLACE", fromId: "PROBLEM-BGO-LAND-CLIMATE", toId: "PLACE-BERGEN", relation: "LOCATED_IN", sourceIds: ["SRC-UIB-PROCLIMATE"], reviewState: "SOURCE_BACKED", visibility: "PUBLIC_SAFE", confidence: "HIGH" },
    { id: "E-BGO-RESEARCH-STUDIES", fromId: "RES-BGO-PROCLIMATE-01", toId: "PROBLEM-BGO-LAND-CLIMATE", relation: "STUDIES", sourceIds: ["SRC-UIB-PROCLIMATE"], reviewState: "SOURCE_BACKED", visibility: "PUBLIC_SAFE", confidence: "HIGH" },
    { id: "E-BGO-PARKING-STUDIES", fromId: "RES-BGO-KPA-PARKING-01", toId: "PROBLEM-BGO-MOBILITY-CLIMATE", relation: "STUDIES", sourceIds: ["SRC-BGO-KPA-PARKING"], reviewState: "SOURCE_BACKED", visibility: "PUBLIC_SAFE", confidence: "HIGH" },
    { id: "E-BGO-RESEARCH-DECISION", fromId: "RES-BGO-KPA-PARKING-01", toId: "DEC-BGO-KPA-2027", relation: "INFORMS_DECISION", sourceIds: ["SRC-BGO-KPA-2027", "SRC-BGO-KPA-PARKING"], reviewState: "SOURCE_BACKED", visibility: "PUBLIC_SAFE", confidence: "HIGH" },
    { id: "E-BGO-DECISION-ACTOR", fromId: "DEC-BGO-KPA-2027", toId: "P17-A1798", relation: "DECIDED_BY", sourceIds: ["SRC-BGO-KPA-2027"], reviewState: "SOURCE_BACKED", visibility: "PUBLIC_SAFE", confidence: "HIGH", limitation: "Bergen kommune is the responsible public actor; this does not attribute one political position to the entire institution." },
    { id: "E-BGO-GAP", fromId: "PROBLEM-BGO-LAND-CLIMATE", toId: "GAP-BGO-KPA-UNDERSTANDING", relation: "DERIVES_GAP", sourceIds: [], reviewState: "DRAFT", visibility: "INTERNAL", confidence: "UNRESOLVED" },
    { id: "E-BGO-SOLUTION", fromId: "GAP-BGO-KPA-UNDERSTANDING", toId: "SOLUTION-BGO-HUMAN-EXPLANATION", relation: "ADDRESSED_BY", sourceIds: [], reviewState: "DRAFT", visibility: "INTERNAL", confidence: "UNRESOLVED" },
    { id: "E-BGO-ACTION-DECISION", fromId: "ACTION-BGO-CONSULTATION", toId: "DEC-BGO-KPA-2027", relation: "CONSULTATION_FOR", sourceIds: ["SRC-BGO-KPA-2027"], reviewState: "SOURCE_BACKED", visibility: "PUBLIC_SAFE", confidence: "HIGH" },
  ],
});

export type FeedItem = { id: string; kind: "RESEARCH" | "ENVIRONMENT" | "ACTOR" | "DECISION" | "EXPLAINER" | "ACTION"; date: string; title: string; summary: string; href: string; sourceIds: string[]; confidence: "HIGH" | "MEDIUM" | "OPEN" };

export const FOLLOW_BERGEN_ITEMS: FeedItem[] = [
  { id: "FEED-BGO-DEC-01", kind: "DECISION", date: "2026-08-22", title: "KPA 2027 is now open for public consultation", summary: "The proposed land-use provisions are open for comments until 6 October 2026. This is a consultation, not the final plan.", href: "/places/bergen#decision", sourceIds: ["SRC-BGO-KPA-2027"], confidence: "HIGH" },
  { id: "FEED-BGO-RES-01", kind: "RESEARCH", date: "2026-08-26", title: "What research can — and cannot yet — tell us about Bergen's future land choices", summary: "Pro-Climate is studying policy, behaviour and climate adaptation in Bergen/Vestland. The project is ongoing, so final findings are not claimed.", href: "/research/res-bgo-proclimate-01", sourceIds: ["SRC-UIB-PROCLIMATE"], confidence: "HIGH" },
  { id: "FEED-BGO-EXP-01", kind: "EXPLAINER", date: "2026-08-26", title: "Why parking rules are part of a living-planet decision", summary: "Bergen's own KPA assessment connects parking to traffic, urban form, noise, air quality, accessibility and development costs.", href: "/research/res-bgo-kpa-parking-01", sourceIds: ["SRC-BGO-KPA-PARKING"], confidence: "HIGH" },
  { id: "FEED-BGO-ACT-01", kind: "ACTION", date: "2026-08-26", title: "You can participate in the KPA 2027 consultation", summary: "Read the evidence first, then use Bergen kommune's official route if you have a view to contribute.", href: "/get-involved?place=bergen", sourceIds: ["SRC-BGO-KPA-2027"], confidence: "HIGH" },
];

export type BetterChoiceOption = { id: string; label: string; bestWhen: string; tradeOff: string; planetNote: string; evidenceState: "BOUNDED" | "NEEDS_ROUTE_DATA" };
export const BERGEN_MOBILITY_CHOICE = {
  id: "CHOICE-BGO-SHORT-TRIP-01",
  title: "A short trip in Bergen",
  question: "Which option best fits this trip — for you and the city around you?",
  context: "This first Choice proof does not pretend to know your exact route, mobility needs, weather, fare or travel time. It makes the missing evidence visible before recommending.",
  options: [
    { id: "walk", label: "Walk", bestWhen: "The trip is realistically walkable for you and time is not the dominant constraint.", tradeOff: "Not suitable for every distance, schedule or mobility need.", planetNote: "No direct vehicle tailpipe emissions; route-specific total impact is not calculated here.", evidenceState: "NEEDS_ROUTE_DATA" },
    { id: "bike", label: "Bike", bestWhen: "The route is safe and practical and you have access to a suitable bicycle.", tradeOff: "Weather, topography, safety and accessibility can dominate the decision.", planetNote: "No direct vehicle tailpipe emissions; lifecycle impacts are not calculated here.", evidenceState: "NEEDS_ROUTE_DATA" },
    { id: "transit", label: "Public transport", bestWhen: "A useful service exists for the route and walking/cycling are not the best fit.", tradeOff: "Waiting, transfers, fare and accessibility vary by trip.", planetNote: "Shared transport can reduce car dependence; exact trip impact requires route and occupancy data.", evidenceState: "NEEDS_ROUTE_DATA" },
    { id: "car", label: "Car", bestWhen: "Accessibility, load, route, timing or another real constraint makes it the practical option.", tradeOff: "Parking, cost, traffic and local externalities can matter; vehicle type changes the impact profile.", planetNote: "Do not shame a necessary car trip. The engine should help reduce avoidable cost/impact when a credible alternative exists.", evidenceState: "NEEDS_ROUTE_DATA" },
  ] as BetterChoiceOption[],
};

export type GetInvolvedAction = { id: string; label: string; verb: "FOLLOW" | "LEARN" | "CHOOSE" | "CONTRIBUTE" | "JOIN" | "VOLUNTEER" | "PARTICIPATE" | "SUPPORT" | "FUND" | "WORK" | "RESEARCH" | "PARTNER" | "BUILD"; context: string; href: string; state: "OPEN" | "LOCKED"; truthNote: string; sourceIds: string[] };
export const GET_INVOLVED_ACTIONS: GetInvolvedAction[] = [
  { id: "GI-BGO-FOLLOW", label: "Follow Bergen", verb: "FOLLOW", context: "BERGEN", href: "/follow/bergen", state: "OPEN", truthNote: "Prototype feed now; notification subscription is not yet live.", sourceIds: [] },
  { id: "GI-BGO-LEARN", label: "Understand KPA 2027", verb: "LEARN", context: "BERGEN", href: "/places/bergen#decision", state: "OPEN", truthNote: "4PLANET explanation links back to official sources.", sourceIds: ["SRC-BGO-KPA-2027"] },
  { id: "GI-BGO-CHOOSE", label: "Make a better local choice", verb: "CHOOSE", context: "BERGEN", href: "/choices/bergen-mobility", state: "OPEN", truthNote: "Bounded prototype; exact route recommendation requires live route/context data.", sourceIds: ["SRC-BGO-KPA-PARKING"] },
  { id: "GI-BGO-CONSULT", label: "Participate in KPA 2027", verb: "PARTICIPATE", context: "BERGEN", href: "https://portal-vip.bergen.kommune.no/hvaskjer/kunngjoringer/kommuneplanens-arealdel-kpa-2027", state: "OPEN", truthNote: "Official consultation route, open through 6 October 2026 according to Bergen kommune.", sourceIds: ["SRC-BGO-KPA-2027"] },
  { id: "GI-ORCA-LEARN", label: "Explore ORCA's monitoring context", verb: "LEARN", context: "ORCA", href: "/actors/orca", state: "OPEN", truthNote: "Actor profile does not imply partnership or funding commitment.", sourceIds: ["SRC-ACTOR-MASTER"] },
  { id: "GI-ORCA-FUND", label: "Fund a survey", verb: "FUND", context: "ORCA", href: "/actors/orca", state: "LOCKED", truthNote: "Locked until offer, authority, delivery, price and proof model are verified.", sourceIds: [] },
  { id: "GI-RESEARCH", label: "Follow the evidence", verb: "RESEARCH", context: "GLOBAL", href: "/research", state: "OPEN", truthNote: "Research Intelligence is a source-aware explanation layer, not a substitute for the source.", sourceIds: ["SRC-UIB-PROCLIMATE"] },
  { id: "GI-BUILD", label: "Build a solution", verb: "BUILD", context: "GLOBAL", href: "/get-involved#build", state: "LOCKED", truthNote: "Open-call workflow is not yet live; do not imply applications are being accepted.", sourceIds: [] },
];

export type CanonicalUpdate = { id: string; revision: number; happenedAt: string; sourceIds: string[]; title: string; fact: string; visibility: "PUBLIC_SAFE"; projectsTo: Array<"BRAIN" | "ACTOR" | "PLACE" | "RESEARCH" | "MAGAZINE" | "FEED" | "GET_INVOLVED" | "IMPACT">; correctionOf?: string };
export const CANONICAL_UPDATE_KPA_OPEN: CanonicalUpdate = {
  id: "UPDATE-BGO-KPA-OPEN-01",
  revision: 2,
  happenedAt: "2026-08-22",
  sourceIds: ["SRC-BGO-KPA-2027"],
  title: "KPA 2027 consultation opened",
  fact: "Bergen kommune lists KPA 2027 as open for public consultation from 22 August 2026 with a comment deadline of 6 October 2026.",
  visibility: "PUBLIC_SAFE",
  projectsTo: ["BRAIN", "ACTOR", "PLACE", "RESEARCH", "MAGAZINE", "FEED", "GET_INVOLVED", "IMPACT"],
};

export const CANONICAL_CORRECTION_EXAMPLE: CanonicalUpdate = {
  id: "UPDATE-BGO-KPA-OPEN-01-R2",
  revision: 2,
  happenedAt: "2026-08-26",
  sourceIds: ["SRC-BGO-KPA-2027"],
  title: "Correction contract example",
  fact: "The authoritative deadline is 6 October 2026. Any downstream surface carrying a different deadline must update from this canonical record rather than keep a local copy.",
  visibility: "PUBLIC_SAFE",
  projectsTo: ["BRAIN", "ACTOR", "PLACE", "RESEARCH", "MAGAZINE", "FEED", "GET_INVOLVED", "IMPACT"],
  correctionOf: "UPDATE-BGO-KPA-OPEN-01",
};

export const CAPITAL_DOGFOOD = {
  eligible: evaluateExplainableMatch({
    id: "MATCH-PCI-HMF-PLASTIC",
    leftId: "PCI-NEED-PLASTIC-BEHAVIOUR-01",
    rightId: "P17-A1787:APP-025",
    hardGates: [
      { id: "ELIGIBILITY", state: "PASS", reason: "Current Capital authority carries this as a source-backed conditional route; live call must still be reverified before action.", evidenceIds: ["SRC-ACTOR-MASTER"] },
      { id: "DELIVERY_TRUTH", state: "PASS", reason: "4PLANET already has a bounded Plastic Behaviour & Reuse project object; no unsupported field result is claimed.", evidenceIds: ["SRC-ACTOR-MASTER"] },
      { id: "RIGHTS", state: "PASS", reason: "No third-party content right is required to evaluate route fit.", evidenceIds: [] },
      { id: "FRESHNESS", state: "PASS", reason: "Route is treated as reverify-before-action, not as a timeless open call.", evidenceIds: ["SRC-ACTOR-MASTER"] },
      { id: "AUTHORITY", state: "PASS", reason: "Current x100/Application owner remains execution authority; PCI is only explainability projection.", evidenceIds: [] },
    ],
    dimensions: [
      { id: "PROBLEM_RELEVANCE", value: 4, reason: "Plastic behaviour/reuse aligns directly with the tracked capital route theme.", evidenceIds: [] },
      { id: "GEOGRAPHY", value: 4, reason: "Norwegian route and Norwegian project context.", evidenceIds: [] },
      { id: "STAGE", value: 3, reason: "Project object exists; final live-call fit still needs revalidation.", evidenceIds: [] },
      { id: "CAPITAL_SIZE", value: 3, reason: "Planning corridor exists; exact ask remains route-specific.", evidenceIds: [] },
      { id: "EVIDENCE_FIT", value: 3, reason: "Evidence design exists but no delivery outcome is claimed in advance.", evidenceIds: [] },
      { id: "TIMING", value: 2, reason: "Call timing changes; verify before execution.", evidenceIds: [] },
      { id: "FOUNDER_BURDEN", value: 3, reason: "Internal qualification is async-first; external release stays gated.", evidenceIds: [] },
      { id: "RELATIONSHIP", value: 2, reason: "Prepared route is tracked; relationship depth is not treated as award probability.", evidenceIds: [] },
      { id: "RESTRICTIONS", value: 3, reason: "Eligibility and exact route rules must be checked at release.", evidenceIds: [] },
    ],
  }),
  blocked: evaluateExplainableMatch({
    id: "MATCH-PCI-INNOVASJON-NO-OLD-ENTITY",
    leftId: "PCI-NEED-STARTUP-01",
    rightId: "P17-A1788:SC-N03",
    hardGates: [
      { id: "ELIGIBILITY", state: "FAIL", reason: "Current Capital authority says SKOG Communications AS is not treated as eligible under the standard startup-age route without an explicit exception or future eligible entity.", evidenceIds: ["SRC-ACTOR-MASTER"] },
      { id: "DELIVERY_TRUTH", state: "PASS", reason: "The blocker is applicant structure, not a need to invent capability.", evidenceIds: [] },
      { id: "RIGHTS", state: "PASS", reason: "No content-right blocker for internal route evaluation.", evidenceIds: [] },
      { id: "FRESHNESS", state: "UNKNOWN", reason: "Live rules require revalidation before any action.", evidenceIds: [] },
      { id: "AUTHORITY", state: "PASS", reason: "Applications owner remains authority.", evidenceIds: [] },
    ],
    dimensions: [
      { id: "PROBLEM_RELEVANCE", value: 3, reason: "Could fit a startup route in principle, but hard eligibility dominates.", evidenceIds: [] },
      { id: "GEOGRAPHY", value: 4, reason: "Norway.", evidenceIds: [] },
      { id: "STAGE", value: 0, reason: "Applicant structure gate prevents progression.", evidenceIds: [] },
      { id: "CAPITAL_SIZE", value: 2, reason: "Amount is irrelevant while blocked.", evidenceIds: [] },
      { id: "EVIDENCE_FIT", value: 2, reason: "No need to over-produce evidence before eligibility is solved.", evidenceIds: [] },
      { id: "TIMING", value: 2, reason: "Rolling route, but rules require revalidation.", evidenceIds: [] },
      { id: "FOUNDER_BURDEN", value: 1, reason: "Do not consume founder time on a structurally blocked route.", evidenceIds: [] },
      { id: "RELATIONSHIP", value: 1, reason: "No relationship evidence changes the eligibility gate.", evidenceIds: [] },
      { id: "RESTRICTIONS", value: 0, reason: "Entity age/startup eligibility is a hard restriction.", evidenceIds: [] },
    ],
  }),
};

export function researchById(id?: string) { return RESEARCH_OBJECTS.find((item) => item.id.toLowerCase() === id?.toLowerCase()); }
export function decisionById(id?: string) { return DECISION_OBJECTS.find((item) => item.id.toLowerCase() === id?.toLowerCase()); }
