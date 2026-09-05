import type { MagazineLane, MagazineStoryMode } from "@/content/magazineOperating";

export type MagazineFranchiseId =
  | "FROM_THE_FIELD"
  | "THE_LIVING_WORLD"
  | "PLANET_EXPLAINED"
  | "WHAT_WORKS"
  | "CHOICE"
  | "VISUAL_SIGNAL";

export interface MagazineArticleTemplate {
  id: MagazineFranchiseId;
  label: string;
  laneBias: MagazineLane[];
  modes: MagazineStoryMode[];
  readerJob: string;
  requiredBeats: string[];
  visualRule: string;
  trustRule: string;
  secondObjectRule: string;
}

/** Strict reusable article grammars. These are editorial production contracts, not page skins. */
export const MAGAZINE_ARTICLE_TEMPLATES: MagazineArticleTemplate[] = [
  {
    id: "FROM_THE_FIELD",
    label: "FROM THE FIELD",
    laneBias: ["PEOPLE", "PLANET", "LIFE"],
    modes: ["DEEP", "VISUAL"],
    readerJob: "Meet a real person doing real work in a real place and understand what their work reveals about the wider system.",
    requiredBeats: ["human opening", "place", "work in progress", "evidence or observation", "constraint / uncertainty", "wider system", "useful next object"],
    visualRule: "Documentary images lead. People are shown doing the work rather than posing as campaign symbols.",
    trustRule: "Partner-submitted material is labelled and independently edited; quotes and material claims require traceable source/reporting records.",
    secondObjectRule: "Prefer the relevant Actor, place/ecosystem, Species, Mission or monitored project — never a generic donate CTA.",
  },
  {
    id: "THE_LIVING_WORLD",
    label: "THE LIVING WORLD",
    laneBias: ["LIFE", "PLANET"],
    modes: ["DEEP", "EVERGREEN", "VISUAL"],
    readerJob: "Enter one species or ecosystem through awe, then leave understanding at least one relationship that keeps it alive.",
    requiredBeats: ["visual encounter", "what it is", "where it lives", "relationship", "pressure", "what is known / unknown", "useful next object"],
    visualRule: "One extraordinary real image earns the opening; maps/data appear only where they add information.",
    trustRule: "Observation, range, model, interpretation and ecological outcome remain distinct.",
    secondObjectRule: "Prefer SPECIES, Ecosystem or ATLAS context that deepens the same subject.",
  },
  {
    id: "PLANET_EXPLAINED",
    label: "PLANET EXPLAINED",
    laneBias: ["PLANET", "HUMAN", "SOLUTIONS"],
    modes: ["FAST", "EVERGREEN"],
    readerJob: "Make a complex environmental system legible without flattening uncertainty or causal chains.",
    requiredBeats: ["question", "short answer", "system map", "what drives it", "what evidence says", "what evidence cannot say", "useful next object"],
    visualRule: "Use one diagram/map/chart only when it reduces explanation rather than decorating it.",
    trustRule: "A visible How We Know section names source types, uncertainty and model/interpretation boundaries.",
    secondObjectRule: "Prefer ATLAS, Living Systems, S4PIENS or a source-aware related explainer.",
  },
  {
    id: "WHAT_WORKS",
    label: "WHAT WORKS",
    laneBias: ["SOLUTIONS", "PEOPLE", "HUMAN"],
    modes: ["DEEP", "EVERGREEN"],
    readerJob: "Understand a proposed solution, the evidence behind it, where it applies and what remains unproven.",
    requiredBeats: ["problem", "intervention", "mechanism", "evidence", "limits", "where it may fit", "who is doing the work", "useful next object"],
    visualRule: "Show the intervention in context, not as clean-tech product glamour detached from place.",
    trustRule: "Delivery, output, outcome and attribution are separate evidence levels.",
    secondObjectRule: "Prefer Actor/Solution/Impact proof when real; otherwise a deeper evidence explainer.",
  },
  {
    id: "CHOICE",
    label: "CHOICE",
    laneBias: ["HUMAN", "SOLUTIONS"],
    modes: ["FAST", "EVERGREEN"],
    readerJob: "Help someone make a practical everyday decision quickly without hiding trade-offs.",
    requiredBeats: ["decision", "few-tap answer", "health", "wallet", "planet", "trade-off", "source basis", "next decision / saved choice"],
    visualRule: "Utility first: scannable comparison, minimal prose, no pseudo-scientific single score.",
    trustRule: "Health, price and ecological impact stay separate; confidence follows evidence, not branding.",
    secondObjectRule: "Prefer a saved/watch/compare action or deeper S4PIENS explanation.",
  },
  {
    id: "VISUAL_SIGNAL",
    label: "IMAGE / MAP OF THE DAY",
    laneBias: ["PLANET", "LIFE", "CULTURE"],
    modes: ["VISUAL", "FAST"],
    readerJob: "Give the reader one low-friction reason to return through a genuinely informative image, map or data signal.",
    requiredBeats: ["visual", "what you are seeing", "where / when", "why it matters", "source / rights", "one deeper path"],
    visualRule: "The visual must carry information; never use stock-nature wallpaper as a recurring habit product.",
    trustRule: "Time, location, creator/source and representation limits stay visible.",
    secondObjectRule: "Prefer the exact ATLAS, Species, Ecosystem or related story object represented by the visual.",
  },
];

export const MAGAZINE_ARTICLE_GOLD_GRAMMAR = [
  "QUIET IDENTITY / FRANCHISE / READING TIME",
  "HEADLINE + DEK",
  "AUTHORSHIP / RESPONSIBILITY / PUBLICATION STATE",
  "FULL-BLEED DOCUMENTARY HERO",
  "HIGH-READABILITY NARRATIVE COLUMN",
  "DELIBERATE VISUAL / DATA / INTERVIEW BEATS",
  "HOW WE KNOW / SOURCES / UNCERTAINTY",
  "ONE RELEVANT SECOND OBJECT",
  "RELATED BY SUBJECT",
  "SHARE + NEXT STORY / RETURN RAIL",
] as const;

export const MAGAZINE_EDITORIAL_GOLD_DIMENSIONS = [
  "ORIGINALITY — gives the reader something materially more useful than a generic summary",
  "TRUTH — material claims are traceable and uncertainty remains visible",
  "TASTE — image, headline, typography and pacing feel intentionally edited rather than generated",
  "READABILITY — body measure, hierarchy, contrast and mobile rhythm survive long-form reading",
  "AWE — at least one image/idea earns attention without sensationalism",
  "HUMANITY — people appear as real actors, not abstract stakeholder labels",
  "UTILITY — the reader leaves knowing or being able to do something more clearly",
  "RECIRCULATION — one relevant second object is obvious without CTA clutter",
  "INDEPENDENCE — editorial judgement stays separate from partner/commercial pressure",
  "RIGHTS — imagery/quotes/assets have an attributable, releasable source state",
] as const;

export type EditorialJudgeState = "OPEN" | "PASS" | "REWORK" | "REJECT";
export interface MagazineEditorialJudgement {
  storyId: string;
  state: EditorialJudgeState;
  judgedBy?: string;
  notes?: string;
  dimensions: Partial<Record<"originality" | "truth" | "taste" | "readability" | "awe" | "humanity" | "utility" | "recirculation" | "independence" | "rights", "PASS" | "REWORK">>;
}

/** Human taste is a release gate, not an AI score. Keep empty/open until a real editor judges the rendered object. */
export const MAGAZINE_EDITORIAL_JUDGEMENTS: MagazineEditorialJudgement[] = [];

export const MAGAZINE_LAUNCH_STORY_QUEUE = [
  {
    id: "bay-of-biscay-orca",
    workingTitle: "The living highway through the Bay of Biscay",
    franchise: "FROM_THE_FIELD" as const,
    lane: "PEOPLE" as const,
    templatePurpose: "Stress-test field reporting, Actor/Ecosystem/Species bridges and partner sharing without implying endorsement.",
    requiredEvidence: ["ORCA reporting context", "Bay of Biscay geography/source pack", "survey-effort method", "image/video rights", "quote permissions where used"],
    intendedSecondObject: "Bay of Biscay Ecosystem / ORCA Actor / WH4LES — choose one primary after story edit",
    publicationState: "PRE_PUBLICATION" as const,
  },
  {
    id: "jaguar-amazonia",
    workingTitle: "One animal as a doorway into the Amazon",
    franchise: "THE_LIVING_WORLD" as const,
    lane: "LIFE" as const,
    templatePurpose: "Stress-test documentary awe, Species→Ecosystem→ATLAS depth and visual pacing.",
    requiredEvidence: ["accepted Jaguar species sources", "Amazon ecosystem sources", "rights-safe documentary imagery", "range/observation/model distinctions"],
    intendedSecondObject: "Jaguar SPECIES",
    publicationState: "PRE_PUBLICATION" as const,
  },
  {
    id: "food-choice",
    workingTitle: "What should we actually buy for dinner?",
    franchise: "CHOICE" as const,
    lane: "HUMAN" as const,
    templatePurpose: "Stress-test high-frequency utility, scannability and health/wallet/planet separation.",
    requiredEvidence: ["bounded grocery/store context", "product or category data", "health basis", "price basis", "ecological basis", "trade-off disclosure"],
    intendedSecondObject: "S4PIENS FOOD / CHOICE",
    publicationState: "PRE_PUBLICATION" as const,
  },
  {
    id: "oslo-mussels",
    workingTitle: "Can mussels clean the water beneath Oslo?",
    franchise: "WHAT_WORKS" as const,
    lane: "SOLUTIONS" as const,
    templatePurpose: "Stress-test local solution reporting and delivery→output→outcome→attribution evidence separation.",
    requiredEvidence: ["exact installed mussel-sock delivery evidence", "method/source for filtration claims", "Oslofjord context", "photo rights", "explicit attribution limits"],
    intendedSecondObject: "Oslofjord / marine restoration context",
    publicationState: "PRE_PUBLICATION" as const,
  },
  {
    id: "plastic-money-proof",
    workingTitle: "Where does your money actually go when you pay to remove plastic?",
    franchise: "PLANET_EXPLAINED" as const,
    lane: "SOLUTIONS" as const,
    templatePurpose: "Stress-test finance→field delivery→proof transparency and actor/action handoff.",
    requiredEvidence: ["specific partner/delivery model", "unit economics", "measurement method", "proof chain", "limits on ecological-outcome claims"],
    intendedSecondObject: "CLE4N / PL4STIC Impact pathway when real",
    publicationState: "PRE_PUBLICATION" as const,
  },
] as const;

export type FieldDispatchStatus = "INTAKE" | "SOURCE_QA" | "EDITORIAL_REVIEW" | "PUBLIC" | "REJECTED";
export interface FieldPartnerDispatch {
  id: string;
  actorId: string;
  actorName: string;
  status: FieldDispatchStatus;
  title: string;
  observedAt?: string;
  placeLabel?: string;
  summary: string;
  sourcePackId: string;
  imageKeys: string[];
  partnerShareUrl?: string;
  editorialDisclosure: "PARTNER_SUBMITTED" | "4PLANET_REPORTED" | "JOINTLY_REPORTED";
}

/** Empty until real field material passes source + rights + editorial gates. */
export const FIELD_PARTNER_DISPATCHES: FieldPartnerDispatch[] = [];

export const FIELD_PARTNER_INTAKE_CONTRACT = [
  "WHO / ACTOR IDENTITY",
  "WHAT HAPPENED / OBSERVATION",
  "WHERE + WHEN",
  "WHY IT MATTERS / CLAIM BOUNDARY",
  "SOURCE / DATA / REPORT",
  "IMAGES / VIDEO + RIGHTS",
  "QUOTES + ATTRIBUTION",
  "WHAT IS PARTNER-SUPPLIED VS 4PLANET-REPORTED",
  "EDITORIAL CONFLICT / FUNDING DISCLOSURE",
  "PREFERRED ACTOR / SPECIES / PLACE / MISSION LINKS",
] as const;

export const MAGAZINE_LEARNING_CONTRACT = {
  primary: ["ARTICLE ENTRY SOURCE", "ENGAGED READ", "READ DEPTH", "RELEVANT SECOND OBJECT", "RETURN VISIT", "SHARE / REFERRAL"],
  partnerLoop: ["PARTNER SUBMISSION", "PUBLICATION ACCEPTANCE RATE", "PARTNER SHARE", "PARTNER-REFERRED READERS", "PARTNER-REFERRED SECOND OBJECT", "QUALIFIED INBOUND / ACTION"],
  learningRule: "Optimise templates and distribution against downstream reader behaviour and editorial quality together. Never optimise for clicks by weakening truth, taste, independence or rights controls.",
} as const;

export function buildPartnerSharePath(path: string, actorId: string, dispatchId?: string): string {
  const params = new URLSearchParams({
    utm_source: `actor_${actorId}`,
    utm_medium: "partner_share",
    utm_campaign: "4planet_magazine_field",
  });
  if (dispatchId) params.set("utm_content", dispatchId);
  return `${path}${path.includes("?") ? "&" : "?"}${params.toString()}`;
}
