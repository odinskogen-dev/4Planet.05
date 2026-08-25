export type ParticipationOpportunityType =
  | "VOLUNTEER"
  | "SKILLS"
  | "FIELD"
  | "CITIZEN_SCIENCE"
  | "INTERNSHIP"
  | "PAID"
  | "WORK_EXCHANGE"
  | "REMOTE";

export type ParticipationSourceState = "SOURCE_BACKED" | "EXTERNAL_PUBLIC" | "SOURCE_UNAVAILABLE";
export type ParticipationAvailability = "ONGOING" | "TRAINING_OPEN" | "OPEN" | "UNKNOWN" | "CLOSED";
export type ParticipationConfidence = "HIGH" | "MEDIUM" | "LOW" | "INSUFFICIENT";
export type ParticipationMode = "REMOTE" | "FIELD" | "HYBRID" | "ANYWHERE_WITH_SEA_VIEW";

export interface ParticipationSource {
  id: string;
  label: string;
  url: string;
  state: ParticipationSourceState;
  checkedAt: string;
  assertion: "ACTOR_OFFICIAL" | "EXTERNAL_LISTING";
}

export interface ParticipationFinancials {
  paid: boolean;
  programmeFee?: string;
  trainingCost?: string;
  membershipCost?: string;
  travel?: string;
  accommodation?: string;
  food?: string;
  insurance?: string;
  note: string;
}

export interface ParticipationOpportunity {
  id: string;
  actorId?: string;
  actorName: string;
  title: string;
  types: ParticipationOpportunityType[];
  summary: string;
  ecologicalPurpose?: string;
  projectOrSite?: string;
  place: string;
  speciesOrEcosystems: string[];
  skills: string[];
  dates: string;
  duration: string;
  mode: ParticipationMode;
  eligibility: string[];
  training: string[];
  financials: ParticipationFinancials;
  applicationUrl: string;
  availability: ParticipationAvailability;
  source: ParticipationSource;
  confidence: ParticipationConfidence;
  external?: boolean;
}

const CHECKED_AT = "2026-08-26";

export const PARTICIPATION_OPPORTUNITIES: ParticipationOpportunity[] = [
  {
    id: "participation:orca:oceanwatchers",
    actorId: "P17-A036",
    actorName: "ORCA",
    title: "Become an OceanWatcher",
    types: ["CITIZEN_SCIENCE", "VOLUNTEER"],
    summary:
      "Learn ORCA’s effort-based survey method, use the OceanWatchers app and collect whale, dolphin and porpoise observations wherever you can see the sea.",
    ecologicalPurpose:
      "Adds structured citizen-science observations to ORCA’s monitoring work and helps expand evidence about cetaceans and important habitats.",
    projectOrSite: "ORCA OceanWatchers",
    place: "Anywhere you can see the sea",
    speciesOrEcosystems: ["Whales", "Dolphins", "Porpoises", "Marine ecosystems"],
    skills: ["Observation", "Species identification", "Citizen science", "Mobile data collection"],
    dates: "Ongoing pathway",
    duration: "OceanWatchers training is about 4 hours; surveying is flexible afterwards",
    mode: "ANYWHERE_WITH_SEA_VIEW",
    eligibility: ["Passion for whales and dolphins", "Complete prerequisite identification course", "Complete OceanWatchers training"],
    training: [
      "Introduction to Whale and Dolphin Identification — prerequisite",
      "OceanWatchers online self-led course — about 4 hours",
      "OceanWatchers app for field data collection",
    ],
    financials: {
      paid: false,
      trainingCost: "£15 identification course + £20 OceanWatchers course, or £35 current course bundle",
      membershipCost: "Active ORCA membership is required for full app access; membership pricing is handled by ORCA",
      travel: "No programme travel is required; you choose where to survey",
      accommodation: "Not provided or required by the programme",
      food: "Not provided or required by the programme",
      note: "4PLANET shows the participation costs stated by ORCA; payment and enrolment remain with ORCA.",
    },
    applicationUrl: "https://orca.org.uk/training/oceanwatchers",
    availability: "ONGOING",
    source: {
      id: "source:orca:oceanwatchers",
      label: "ORCA — OceanWatchers",
      url: "https://orca.org.uk/training/oceanwatchers",
      state: "SOURCE_BACKED",
      checkedAt: CHECKED_AT,
      assertion: "ACTOR_OFFICIAL",
    },
    confidence: "HIGH",
  },
  {
    id: "participation:orca:marine-mammal-surveyor",
    actorId: "P17-A036",
    actorName: "ORCA",
    title: "Train as a Marine Mammal Surveyor",
    types: ["VOLUNTEER", "FIELD", "CITIZEN_SCIENCE"],
    summary:
      "Complete ORCA’s training, become an active member and become eligible to apply for volunteer scientific surveys from ferries and other vessels.",
    ecologicalPurpose:
      "Collects structured distance-sampling and survey-effort data used by ORCA to study whales, dolphins and porpoises across UK and European waters.",
    projectOrSite: "ORCA Marine Mammal Surveyor network",
    place: "UK and European ferry routes, including Bay of Biscay routes",
    speciesOrEcosystems: ["Cetaceans", "Bay of Biscay", "North-East Atlantic"],
    skills: ["Distance sampling", "Species identification", "Survey protocol", "Team fieldwork"],
    dates: "Next listed 2026 course: 7 November 2026",
    duration: "One-day live online surveyor course plus prerequisite self-study; field surveys vary by route",
    mode: "FIELD",
    eligibility: [
      "Complete prerequisite identification course",
      "Complete Marine Mammal Surveyor course",
      "Become an ORCA member",
      "18+ for ferry surveys",
      "21+ for cruise surveys",
      "Reasonable level of fitness",
    ],
    training: [
      "Introduction to Whale and Dolphin Identification — prerequisite",
      "Marine Mammal Surveyor live online course",
      "Distance-sampling and effort-based survey protocol",
    ],
    financials: {
      paid: false,
      trainingCost: "£120 surveyor course + £15 prerequisite, or £135 current bundle",
      membershipCost: "ORCA states membership starts at £5/month or £60/year",
      travel: "Survey-route ticket is provided; volunteer pays travel to and from the port",
      accommodation: "Cabin is provided where an overnight survey-route sailing requires one",
      food: "Volunteer pays for food on board",
      insurance: "Volunteer is responsible for their own travel insurance",
      note: "Training does not guarantee a survey place. ORCA states trained active members can apply for offshore surveys.",
    },
    applicationUrl: "https://orca.org.uk/training/marine-mammal-surveyor",
    availability: "TRAINING_OPEN",
    source: {
      id: "source:orca:marine-mammal-surveyor",
      label: "ORCA — Marine Mammal Surveyor",
      url: "https://orca.org.uk/training/marine-mammal-surveyor",
      state: "SOURCE_BACKED",
      checkedAt: CHECKED_AT,
      assertion: "ACTOR_OFFICIAL",
    },
    confidence: "HIGH",
  },
];

export interface ExternalParticipationRecord {
  id: string;
  actorName: string;
  title: string;
  summary: string;
  remote: boolean;
  activities: string[];
  dates: string;
  duration: string;
  place: string;
  sourceUrl: string;
  checkedAt: string;
}

export function externalRecordToOpportunity(record: ExternalParticipationRecord): ParticipationOpportunity {
  return {
    id: record.id,
    actorName: record.actorName,
    title: record.title,
    types: record.remote ? ["VOLUNTEER", "REMOTE"] : ["VOLUNTEER"],
    summary: record.summary,
    place: record.place,
    speciesOrEcosystems: [],
    skills: record.activities,
    dates: record.dates || "See source",
    duration: record.duration || "See source",
    mode: record.remote ? "REMOTE" : "FIELD",
    eligibility: ["Eligibility is controlled by the source organisation; review the original listing before applying"],
    training: [],
    financials: {
      paid: false,
      note: "Cost, travel, accommodation and other terms are unknown unless the original listing states them. 4PLANET does not infer missing terms.",
    },
    applicationUrl: record.sourceUrl,
    availability: "UNKNOWN",
    source: {
      id: `source:${record.id}`,
      label: "VolunteerConnector public listing",
      url: record.sourceUrl,
      state: "EXTERNAL_PUBLIC",
      checkedAt: record.checkedAt,
      assertion: "EXTERNAL_LISTING",
    },
    confidence: "MEDIUM",
    external: true,
  };
}

export function opportunitiesForActor(actorId: string) {
  return PARTICIPATION_OPPORTUNITIES.filter((opportunity) => opportunity.actorId === actorId);
}

export type ParticipationPreference = {
  care: string;
  skill: string;
  time: "HOURS" | "DAYS" | "WEEKS" | "MONTHS" | "ANY";
  place: "REMOTE" | "TRAVEL" | "LOCAL" | "ANY";
  cost: "PAID_ONLY" | "LOW_COST" | "COSTS_COVERED" | "ANY";
};

export type ParticipationMatch = {
  opportunity: ParticipationOpportunity;
  eligibleForReview: boolean;
  hardGates: Array<{ label: string; state: "PASS" | "UNKNOWN" | "FAIL"; reason: string }>;
  reasons: string[];
};

function textHaystack(opportunity: ParticipationOpportunity) {
  return [
    opportunity.title,
    opportunity.summary,
    opportunity.ecologicalPurpose,
    opportunity.place,
    ...opportunity.speciesOrEcosystems,
    ...opportunity.skills,
  ].filter(Boolean).join(" ").toLowerCase();
}

export function explainParticipationMatch(
  opportunity: ParticipationOpportunity,
  preference: ParticipationPreference,
): ParticipationMatch {
  const haystack = textHaystack(opportunity);
  const care = preference.care.trim().toLowerCase();
  const skill = preference.skill.trim().toLowerCase();

  const sourceState: "PASS" | "FAIL" = opportunity.source.state === "SOURCE_UNAVAILABLE" ? "FAIL" : "PASS";
  const availabilityState: "PASS" | "UNKNOWN" | "FAIL" = opportunity.availability === "CLOSED"
    ? "FAIL"
    : opportunity.availability === "UNKNOWN"
      ? "UNKNOWN"
      : "PASS";

  let payState: "PASS" | "UNKNOWN" | "FAIL" = "PASS";
  let payReason = "No pay constraint selected.";
  if (preference.cost === "PAID_ONLY") {
    payState = opportunity.financials.paid ? "PASS" : "FAIL";
    payReason = opportunity.financials.paid ? "The opportunity is marked paid." : "This opportunity is unpaid.";
  } else if (preference.cost === "LOW_COST") {
    const termsKnown = Boolean(opportunity.financials.trainingCost || opportunity.financials.programmeFee || opportunity.financials.membershipCost || opportunity.source.assertion === "ACTOR_OFFICIAL");
    if (!termsKnown) {
      payState = "UNKNOWN";
      payReason = "The public listing does not provide enough cost detail to call this low-cost.";
    } else {
      const hasMaterialFee = Boolean(opportunity.financials.programmeFee || opportunity.financials.trainingCost || opportunity.financials.membershipCost);
      payState = hasMaterialFee ? "FAIL" : "PASS";
      payReason = hasMaterialFee ? "Known training, membership or programme costs make this fail the strict low-cost filter." : "No material participation fee is stated in the checked source.";
    }
  } else if (preference.cost === "COSTS_COVERED") {
    const travel = opportunity.financials.travel?.toLowerCase() ?? "";
    const food = opportunity.financials.food?.toLowerCase() ?? "";
    const accommodation = opportunity.financials.accommodation?.toLowerCase() ?? "";
    if (!travel && !food && !accommodation) {
      payState = "UNKNOWN";
      payReason = "The source does not state enough cost coverage to confirm this constraint.";
    } else {
      const volunteerPaysCoreCost = /pay|not provided/.test(`${travel} ${food} ${accommodation}`);
      payState = volunteerPaysCoreCost ? "FAIL" : "PASS";
      payReason = volunteerPaysCoreCost ? "At least one core travel, food or accommodation cost remains with the participant." : "Checked terms indicate core travel/accommodation costs are covered.";
    }
  }

  let locationState: "PASS" | "UNKNOWN" | "FAIL" = "PASS";
  let locationReason = "No location constraint selected.";
  if (preference.place === "REMOTE") {
    locationState = opportunity.mode === "REMOTE" ? "PASS" : "FAIL";
    locationReason = opportunity.mode === "REMOTE" ? "Remote participation is explicitly supported." : "This opportunity is not remote.";
  } else if (preference.place === "TRAVEL") {
    locationState = opportunity.mode === "FIELD" || opportunity.mode === "HYBRID" ? "PASS" : "FAIL";
    locationReason = locationState === "PASS" ? "This is a field/travel pathway." : "This pathway is not travel-based field work.";
  } else if (preference.place === "LOCAL") {
    locationState = "UNKNOWN";
    locationReason = "A local match requires the user's location; 4PLANET will not infer it from the listing.";
  }

  let timeState: "PASS" | "UNKNOWN" | "FAIL" = "PASS";
  let timeReason = "No time constraint selected.";
  if (preference.time !== "ANY") {
    const duration = opportunity.duration.toLowerCase();
    const signals: Record<Exclude<ParticipationPreference["time"], "ANY">, RegExp> = {
      HOURS: /hour|flexible|self-led|any time/,
      DAYS: /day|weekend|one-day|1 day|2 day|3 day|4 day|5 day|6 day/,
      WEEKS: /week|fortnight/,
      MONTHS: /month|long-term|ongoing/,
    };
    if (/see source|unknown|varies/.test(duration)) {
      timeState = "UNKNOWN";
      timeReason = "The source does not state a precise enough duration for this time filter.";
    } else if (signals[preference.time].test(duration)) {
      timeState = "PASS";
      timeReason = `The stated duration is compatible with ${preference.time.toLowerCase()}.`;
    } else {
      timeState = "FAIL";
      timeReason = `The stated duration does not clearly fit ${preference.time.toLowerCase()}.`;
    }
  }

  const hardGates: ParticipationMatch["hardGates"] = [
    { label: "SOURCE", state: sourceState, reason: sourceState === "PASS" ? "A traceable source is attached." : "The source is unavailable." },
    { label: "AVAILABILITY", state: availabilityState, reason: availabilityState === "PASS" ? `Current state: ${opportunity.availability}.` : availabilityState === "FAIL" ? "The opportunity is closed." : "The source record is live, but current opportunity availability is not confirmed by 4PLANET." },
    { label: "TIME", state: timeState, reason: timeReason },
    { label: "COST", state: payState, reason: payReason },
    { label: "LOCATION", state: locationState, reason: locationReason },
  ];

  const reasons: string[] = [];
  if (care && haystack.includes(care)) reasons.push(`Cause fit: ${preference.care}.`);
  if (skill && haystack.includes(skill)) reasons.push(`Skill fit: ${preference.skill}.`);
  if (preference.place === "TRAVEL" && (opportunity.mode === "FIELD" || opportunity.mode === "HYBRID")) reasons.push("Field/travel fit.");
  if (preference.place === "REMOTE" && opportunity.mode === "REMOTE") reasons.push("Remote fit.");
  if (preference.time !== "ANY" && timeState === "PASS") reasons.push(`Time fit: ${preference.time.toLowerCase()}.`);
  if (opportunity.actorId === "P17-A036") reasons.push("Source-checked first-party ORCA pathway.");
  if (!reasons.length) reasons.push("Potential relevance; hard gates decide whether it can be recommended yet.");

  return {
    opportunity,
    eligibleForReview: hardGates.every((gate) => gate.state === "PASS"),
    hardGates,
    reasons,
  };
}

export const ACTOR_TEMPLATE_TRANSFER_CASES = [
  {
    actorId: "P17-A036",
    actorName: "ORCA",
    archetype: "SCIENCE / MONITORING",
    source: "https://orca.org.uk/",
    getInvolvedState: "SOURCE_BACKED",
    note: "Two source-backed participation pathways prove the full Get Involved module without changing the shared Actor template.",
  },
  {
    actorId: "P17-A307",
    actorName: "veritree",
    archetype: "RESTORATION / IMPLEMENTATION",
    source: "https://www.veritree.com/explore-projects/our-projects",
    getInvolvedState: "NO_PUBLISHED_4PLANET_PATHWAY",
    note: "The same profile grammar can carry restoration projects, evidence, geography and needs while Get Involved correctly remains empty until a sourced pathway exists.",
  },
  {
    actorId: "P17-A003",
    actorName: "GBIF",
    archetype: "KNOWLEDGE / DATA INFRASTRUCTURE",
    source: "https://www.gbif.org/what-is-gbif",
    getInvolvedState: "NO_PUBLISHED_4PLANET_PATHWAY",
    note: "The same identity/evidence/relationship/action grammar supports a data infrastructure actor without pretending it is a field NGO.",
  },
] as const;

export const PARTICIPATION_CONTRACT_RULES = [
  "Participation Opportunity is a first-class Actor Graph object, not a second Actor identity or a separate Get Involved database.",
  "Opportunity existence does not imply 4PLANET partnership, verification, endorsement or availability beyond the cited source state.",
  "Unknown cost, eligibility, availability or safeguarding information remains unknown; it is never silently converted to a positive claim.",
  "4PLANET discovery routes users to the authoritative application source; the first release does not process volunteer applications.",
  "Wildlife participation requires an ethical and safeguarding review before 4PLANET may recommend it as a curated opportunity.",
  "Matching uses explicit hard gates and human-readable reasons. There is no opaque composite score.",
] as const;

export const ACTOR_ENGINE_01_FOUNDATION = [
  "DISCOVER ACTOR",
  "RESOLVE IDENTITY",
  "GATHER SOURCES",
  "MAP RELATIONSHIPS",
  "FIND PROJECTS / NEEDS / OPPORTUNITIES",
  "CHECK PROVENANCE / FRESHNESS",
  "GENERATE PROFILE CANDIDATE",
  "HUMAN / TRUTH REVIEW",
  "PROJECT TO PUBLIC SURFACES",
  "MONITOR UPDATES",
] as const;
