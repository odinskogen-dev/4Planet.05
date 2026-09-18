export type OrcaCellSourceState = "PUBLIC_AUTHORITATIVE" | "PARTNER_CORRESPONDENCE";

export interface OrcaCellSource {
  id: string;
  label: string;
  authority: string;
  url: string | null;
  accessed: string;
  state: OrcaCellSourceState;
  supports: string;
  limitations: string[];
}

export interface OrcaPartnerCell {
  id: string;
  actor: {
    name: string;
    role: string;
    relationshipState: "REAL_PARTNER_CONTEXT_TERMS_OPEN";
  };
  place: {
    name: string;
    route: string;
    boundary: string;
  };
  humanGold: {
    primaryUser: string;
    trigger: string;
    job: string;
    barrier: string;
    decision: string;
    desiredOutcome: string;
    fiveSecond: string;
    thirtySecond: string;
    threeMinute: string;
  };
  valueToOrca: string[];
  monitoringSemantics: {
    effort: string[];
    observation: string[];
    rules: string[];
  };
  programme2026: {
    surveysMin: number;
    surveysMax: number;
    surveyDaysMin: number;
    surveyDaysMax: number;
    state: "PARTNER_CONFIRMED_RANGE";
    sourceId: string;
  };
  publicEvidence: Array<{
    headline: string;
    detail: string;
    sourceId: string;
  }>;
  fundingSeam: {
    state: "CLOSED_PENDING_CURRENT_TERMS";
    canOpen: false;
    blockers: string[];
    nextTruthRequired: string[];
  };
  proofLadder: Array<{
    state: string;
    proves: string;
    doesNotProve: string;
  }>;
  sources: OrcaCellSource[];
}

export const ORCA_BAY_PARTNER_CELL: OrcaPartnerCell = {
  id: "cell:partner:orca:bay-of-biscay:v1",
  actor: {
    name: "ORCA",
    role: "Marine-mammal monitoring operator and science/public-engagement partner context",
    relationshipState: "REAL_PARTNER_CONTEXT_TERMS_OPEN",
  },
  place: {
    name: "Bay of Biscay",
    route: "Portsmouth → English Channel → Bay of Biscay → Santander",
    boundary: "This is a ferry survey corridor. It is not an orca migration route, habitat boundary or inferred animal movement path.",
  },
  humanGold: {
    primaryUser: "A non-expert funder, route stakeholder or partner reviewer deciding whether a marine-monitoring programme is credible, understandable and supportable.",
    trigger: "They encounter an ORCA/Bay monitoring opportunity and need to know what actually happens, what is measured and what support could truthfully enable.",
    job: "Turn a complex citizen-science monitoring programme into a decision-ready object without erasing uncertainty or inflating ecological claims.",
    barrier: "Survey effort, sightings, route context, funding terms and ecological outcomes are easily collapsed into one vague impact story.",
    decision: "Is there a bounded, measurable monitoring scope here that is worth supporting once current terms are confirmed?",
    desiredOutcome: "The reviewer can distinguish monitoring delivery from observations and ecological outcomes, inspect sources, understand ORCA's value and know exactly what is still blocked.",
    fiveSecond: "A real ferry route is being used to monitor whales and dolphins across the Bay of Biscay.",
    thirtySecond: "ORCA surveyors record effort and marine-mammal observations. 4PLANET can make the programme, route, evidence and support seam legible, but sightings are not population trends and funding terms are not yet open.",
    threeMinute: "Inspect the route boundary, 2026 programme scale, public ORCA evidence, effort-versus-observation semantics, funding blockers and the proof ladder from support through delivery and outcomes.",
  },
  valueToOrca: [
    "Make field effort and public value understandable to a non-expert without reducing the science to a donation counter.",
    "Preserve attributable route, effort, observation and report evidence so future support can be tied to inspectable delivery.",
    "Create a reusable public-intelligence layer around ORCA's own delivery authority rather than replacing ORCA's methodology or data ownership.",
    "Give funders and route stakeholders a clearer decision object once ORCA confirms current scope and commercial/sponsorship terms.",
  ],
  monitoringSemantics: {
    effort: [
      "route geometry actually surveyed",
      "observation hours",
      "distance surveyed",
      "survey date/window",
      "survey-team / method context where available",
    ],
    observation: [
      "species identification or taxonomic confidence",
      "encounter / sighting record",
      "individual count where the method supports it",
      "time and location of observation",
      "environmental / effort context needed to interpret the record",
    ],
    rules: [
      "OBSERVATION ≠ POPULATION",
      "OBSERVATION ≠ HABITAT",
      "OBSERVATION ≠ MIGRATION ROUTE",
      "SURVEY EFFORT ≠ ECOLOGICAL OUTCOME",
      "PAYMENT ≠ DELIVERY",
      "DELIVERY ≠ OUTCOME",
      "OUTCOME ≠ VERIFIED IMPACT",
    ],
  },
  programme2026: {
    surveysMin: 10,
    surveysMax: 12,
    surveyDaysMin: 40,
    surveyDaysMax: 48,
    state: "PARTNER_CONFIRMED_RANGE",
    sourceId: "orca-steve-2026-09-04",
  },
  publicEvidence: [
    {
      headline: "Portsmouth–Santander is an active 2026 ORCA survey route.",
      detail: "ORCA published a survey highlight for the 22 June 2026 Portsmouth–Santander sailing, describing bridge-based survey activity through the English Channel and Bay of Biscay and observations including common dolphins and Cuvier's beaked whales.",
      sourceId: "orca-portsmouth-santander-2026",
    },
    {
      headline: "Effort is a measurable programme output independent of sightings.",
      detail: "ORCA's 2025 end-of-season summary reports 53,527 km of effort across ferry surveys and Saga cruises, alongside 2,285 encounters and 10,785 individual animals. Keeping these dimensions separate is essential to truthful monitoring semantics.",
      sourceId: "orca-season-2025",
    },
    {
      headline: "The Bay has long-term survey context, not just one showcase crossing.",
      detail: "ORCA describes long-term Bay of Biscay monitoring and has published ferry-survey examples with observation hours and species records. Those observations support distribution/monitoring questions, not a universal population or habitat claim.",
      sourceId: "orca-biscay-2024",
    },
  ],
  fundingSeam: {
    state: "CLOSED_PENDING_CURRENT_TERMS",
    canOpen: false,
    blockers: [
      "Current actual ORCA sponsorship / support terms are not yet confirmed for this bounded action.",
      "The exact quantity and scope to fund have not been agreed.",
      "Delivery geography/window and evidence package must be confirmed for the funded scope.",
      "Double-count treatment and claims boundary must be explicit before any public funding unit opens.",
    ],
    nextTruthRequired: [
      "current actual sponsorship terms",
      "exact funded unit / quantity",
      "delivery period and geography",
      "proof fields: route, dates, observation hours, distance surveyed",
      "double-count treatment",
      "permitted public claims",
    ],
  },
  proofLadder: [
    { state: "DEFINED", proves: "A bounded survey-support scope exists.", doesNotProve: "Funding, delivery or ecological outcome." },
    { state: "COMMITTED", proves: "A real counterparty commitment to a defined scope exists.", doesNotProve: "Payment, allocation or delivery." },
    { state: "PAID / ALLOCATED", proves: "Resources were paid and/or allocated under the defined agreement.", doesNotProve: "The survey work happened." },
    { state: "DELIVERED", proves: "The agreed monitoring effort occurred when supported by route/hours/distance/date evidence.", doesNotProve: "Population recovery or ecological improvement." },
    { state: "OBSERVATIONS / REPORT", proves: "Biological observations and programme outputs were recorded under the survey method.", doesNotProve: "Population abundance, habitat membership or migration route without separate analysis." },
    { state: "OUTCOME / IMPACT", proves: "Only the bounded outcome supported by an explicit method and evidence package.", doesNotProve: "Anything beyond that claim scope; verified impact requires independent verification where claimed." },
  ],
  sources: [
    {
      id: "orca-steve-2026-09-04",
      label: "ORCA programme correspondence — Steve Jones, 4 Sep 2026",
      authority: "ORCA partner correspondence",
      url: null,
      accessed: "2026-09-07",
      state: "PARTNER_CORRESPONDENCE",
      supports: "Current partner-confirmed 2026 Portsmouth–Santander scale: either 10 or 12 surveys; four-day return crossing; approximately 40–48 survey days.",
      limitations: ["Internal partner correspondence, not a public source.", "Current sponsorship price/unit terms remain unresolved.", "Earlier example prices were explicitly placeholders and are not current funding truth."],
    },
    {
      id: "orca-portsmouth-santander-2026",
      label: "Survey Highlights — Portsmouth-Santander 22/06/2026",
      authority: "ORCA",
      url: "https://orca.org.uk/news-blog/survey-highlights-portsmouth-santander-22-06-2026",
      accessed: "2026-09-07",
      state: "PUBLIC_AUTHORITATIVE",
      supports: "Public evidence of an active 2026 Portsmouth–Santander survey and observed marine wildlife during the crossing.",
      limitations: ["A survey highlight is not a full season dataset or population assessment."],
    },
    {
      id: "orca-season-2025",
      label: "ORCA Marine Mammal Surveyor End of Season Spectacular 2025",
      authority: "ORCA",
      url: "https://orca.org.uk/news-blog/orca-marine-mammal-surveyor-end-of-season-spectacular-2025",
      accessed: "2026-09-07",
      state: "PUBLIC_AUTHORITATIVE",
      supports: "Programme-scale effort and observation totals, ferry-route coverage and Portsmouth–Santander trial-to-2026 context.",
      limitations: ["Programme totals aggregate multiple routes and cannot be attributed wholesale to the Bay of Biscay or Portsmouth–Santander."],
    },
    {
      id: "orca-biscay-2024",
      label: "ORCA Survey Blog — first Bay of Biscay ferry survey of 2024",
      authority: "ORCA",
      url: "https://orca.org.uk/news-blog/orca-survey-blog-our-first-bay-of-biscay-ferry-survey-of-2024",
      accessed: "2026-09-07",
      state: "PUBLIC_AUTHORITATIVE",
      supports: "Concrete Bay survey example with bridge survey hours, route context and cetacean observations.",
      limitations: ["Different route/year from the current Portsmouth–Santander 2026 action seam.", "Sightings are observations, not a success metric or population estimate."],
    },
  ],
};

export function publicOrcaCellSources(cell: OrcaPartnerCell = ORCA_BAY_PARTNER_CELL) {
  return cell.sources.filter((source) => source.state === "PUBLIC_AUTHORITATIVE" && source.url);
}
