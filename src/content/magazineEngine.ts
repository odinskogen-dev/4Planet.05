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

/**
 * Strict reusable article grammars. These are editorial production contracts,
 * not page skins. A writer may break the rhythm only when the story earns it.
 */
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

/**
 * Empty until real field material passes source + rights + editorial gates.
 * Never seed this list with invented partner dispatches for layout convenience.
 */
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
  primary: [
    "ARTICLE ENTRY SOURCE",
    "ENGAGED READ",
    "READ DEPTH",
    "RELEVANT SECOND OBJECT",
    "RETURN VISIT",
    "SHARE / REFERRAL",
  ],
  partnerLoop: [
    "PARTNER SUBMISSION",
    "PUBLICATION ACCEPTANCE RATE",
    "PARTNER SHARE",
    "PARTNER-REFERRED READERS",
    "PARTNER-REFERRED SECOND OBJECT",
    "QUALIFIED INBOUND / ACTION",
  ],
  learningRule:
    "Optimise templates and distribution against downstream reader behaviour and editorial quality together. Never optimise for clicks by weakening truth, taste, independence or rights controls.",
} as const;
