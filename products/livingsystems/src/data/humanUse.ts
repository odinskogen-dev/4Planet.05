// ============================================================================
// HUMAN USE TRANSLATION DATA (v1.4)
// Turns the existing intelligence into clear human entry points. No backend,
// no user state, no role dashboards — just structured guidance over real routes.
// ============================================================================

export interface HumanUseQuestion {
  id: string;
  label: string;
  question: string;
  description: string;
  route: string;
  bestExampleLabel: string;
  bestExampleRoute: string;
  pathway: string[];
  practicalInterpretation: string;
}

export const HUMAN_USE_QUESTIONS: HumanUseQuestion[] = [
  {
    id: "HU_SPECIES",
    label: "Understand a species",
    question: "I want to understand a species.",
    description:
      "Follow a single living thing from what it does ecologically to the human systems it touches.",
    route: "/species",
    bestExampleLabel: "Western honey bee",
    bestExampleRoute: "/species/western-honey-bee",
    pathway: ["Species", "Ecological function", "Service", "Human system"],
    practicalInterpretation:
      "A species matters not in isolation but through what it supports — and that dependency is often stronger than it first appears.",
  },
  {
    id: "HU_ECOSYSTEM",
    label: "Understand an ecosystem",
    question: "I want to understand an ecosystem.",
    description:
      "See how a living system provides services that reach far beyond its own boundary.",
    route: "/ecosystems",
    bestExampleLabel: "Amazon rainforest",
    bestExampleRoute: "/ecosystems/EC_AMAZON_RAINFOREST",
    pathway: ["Ecosystem", "Service", "Human system", "Climate"],
    practicalInterpretation:
      "An ecosystem is infrastructure: when it changes, the effects travel through water, food, climate and human systems.",
  },
  {
    id: "HU_THREAT",
    label: "Understand what threatens it",
    question: "I want to understand what threatens it.",
    description:
      "Trace the pressures acting on a species or ecosystem, and how they cascade.",
    route: "/threats",
    bestExampleLabel: "Deforestation",
    bestExampleRoute: "/threats",
    pathway: ["Threat", "Affected node", "Failure cascade"],
    practicalInterpretation:
      "Threats rarely stay local — a single pressure can ripple through the systems that depend on what it damages.",
  },
  {
    id: "HU_SOLUTION",
    label: "Understand what can help",
    question: "I want to understand what can help.",
    description:
      "See which solution pathways may strengthen a service or reduce a threat — and under what conditions.",
    route: "/solutions",
    bestExampleLabel: "Solution pathways",
    bestExampleRoute: "/solutions",
    pathway: ["Threat", "Solution", "Strengthened service", "Human system"],
    practicalInterpretation:
      "What can help is usually context-dependent. A solution is a pathway with conditions, not a guarantee.",
  },
  {
    id: "HU_EVIDENCE",
    label: "Understand the evidence",
    question: "I want to understand what evidence supports this.",
    description:
      "Inspect the sources, confidence, verification status and data gaps behind the claims.",
    route: "/trust",
    bestExampleLabel: "Trust & integrity",
    bestExampleRoute: "/trust",
    pathway: ["Claim", "Source", "Confidence", "Data quality"],
    practicalInterpretation:
      "Confidence is part of the intelligence. A weak source does not break the system — it shows where better evidence is needed.",
  },
  {
    id: "HU_LEARNING",
    label: "Understand what was learned",
    question: "I want to understand what we learned.",
    description:
      "See where expectations met observations, and whether confidence should change.",
    route: "/learning",
    bestExampleLabel: "Learning records",
    bestExampleRoute: "/learning",
    pathway: ["Expected", "Observed", "Learning", "Confidence update"],
    practicalInterpretation:
      "Learning lets the system refine what it believes rather than stay static — including admitting what remains uncertain.",
  },
  {
    id: "HU_DECISION",
    label: "Use this for a decision",
    question: "I want to use this for a decision.",
    description:
      "Read a structured decision signal: leverage, urgency, evidence, uncertainty and difficulty.",
    route: "/decisions",
    bestExampleLabel: "Decision signals",
    bestExampleRoute: "/decisions",
    pathway: ["Risk", "Solution", "Evidence", "Learning", "What to weigh"],
    practicalInterpretation:
      "A decision signal is not an automatic recommendation. It structures what should be considered before choosing action.",
  },
];

// ----------------------------------------------------------------------------
// Guided proof pathways (hand-built for the two deep cases — not auto-inferred)
// ----------------------------------------------------------------------------

export interface PathwayStep {
  label: string;
  href?: string;
  kind: string;
}

export interface GuidedJourney {
  id: string;
  title: string;
  intro: string;
  steps: PathwayStep[];
  interpretation: string;
}

export const GUIDED_JOURNEYS: Record<string, GuidedJourney> = {
  AMAZON: {
    id: "GJ_AMAZON",
    title: "Amazon — a guided pathway",
    intro: "One human-readable route from a living system to a decision context.",
    steps: [
      { label: "Amazon rainforest", href: "/ecosystems/EC_AMAZON_RAINFOREST", kind: "Ecosystem" },
      { label: "Rainfall regulation", href: "/services/SV_RAINFALL_REGULATION", kind: "Service" },
      { label: "Agriculture & water systems", href: "/human-systems/HS_AGRICULTURE", kind: "Human system" },
      { label: "Deforestation & degradation", href: "/threats/TH_DEFORESTATION", kind: "Threat" },
      { label: "Protected areas · Indigenous stewardship · monitoring", href: "/solutions", kind: "Solutions" },
      { label: "Decision signal", href: "/decisions", kind: "Decision" },
      { label: "Evidence & data quality", href: "/trust", kind: "Evidence" },
      { label: "Learning record", href: "/learning", kind: "Learning" },
    ],
    interpretation:
      "The Amazon case shows that forest protection is not only about biodiversity. It is also connected to rainfall, water, agriculture, climate stability and human systems.",
  },
  POLLINATION: {
    id: "GJ_POLLINATION",
    title: "Pollination — a guided pathway",
    intro: "How a small species connects to the food system, with its real limits.",
    steps: [
      { label: "Western honey bee", href: "/species/western-honey-bee", kind: "Species" },
      { label: "Pollination", href: "/functions/FN_POLLINATION", kind: "Function" },
      { label: "Food production", href: "/services/SV_FOOD_PRODUCTION", kind: "Service" },
      { label: "Pesticide pressure & habitat quality", href: "/threats/TH_PESTICIDES", kind: "Threat" },
      { label: "Pesticide reduction · pollinator habitat", href: "/solutions", kind: "Solutions" },
      { label: "Decision signal", href: "/decisions", kind: "Decision" },
      { label: "Evidence & data quality", href: "/trust", kind: "Evidence" },
      { label: "Learning record", href: "/learning", kind: "Learning" },
    ],
    interpretation:
      "The pollination case shows how a small species can connect to food systems — but also why dependency varies by crop, region and pollinator group. Honey bees are one important pollinator among many.",
  },
};

// ----------------------------------------------------------------------------
// Light role-based use cases (no accounts, no dashboards)
// ----------------------------------------------------------------------------

export interface RoleUseCase {
  role: string;
  useCase: string;
  startLabel: string;
  startRoute: string;
}

export const ROLE_USE_CASES: RoleUseCase[] = [
  { role: "Student", useCase: "Understand why a species matters by following it from ecological function to human system.", startLabel: "Start with the honey bee", startRoute: "/species/western-honey-bee" },
  { role: "Educator", useCase: "Explain ecological dependency clearly using a single traceable pathway.", startLabel: "Open dependencies", startRoute: "/dependencies" },
  { role: "Journalist", useCase: "Find evidence-aware context — with sources and confidence — before writing about an issue.", startLabel: "Open Trust", startRoute: "/trust" },
  { role: "Policymaker", useCase: "See which human systems are affected by ecosystem change, and what should be considered.", startLabel: "Open the Amazon case", startRoute: "/ecosystems/EC_AMAZON_RAINFOREST" },
  { role: "Foundation", useCase: "Use solution pathways, decision signals and data quality to see where support may matter and where evidence gaps remain.", startLabel: "Open decisions", startRoute: "/decisions" },
  { role: "Company", useCase: "Understand nature dependencies, risks and credible solution pathways.", startLabel: "Open solutions", startRoute: "/solutions" },
  { role: "Citizen", useCase: "Understand why a species, forest, river or function matters for life and people.", startLabel: "Start here", startRoute: "/start" },
  { role: "4PLANET", useCase: "Prioritise missions, partners, impact opportunities and communication based on the intelligence.", startLabel: "Open learning", startRoute: "/learning" },
];
