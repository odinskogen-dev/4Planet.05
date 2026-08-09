import type { PlaceIdentity, PlaceSourceRef } from "@/planet/placeModel";

export type EvidenceGrade = "SOURCE_REPORTED" | "MODELLED" | "4PLANET_CONTEXT" | "UNKNOWN";

export interface OslofjordSource extends PlaceSourceRef {
  kind: "GAZETTEER" | "SURVEY" | "MONITORING" | "POLICY" | "REGULATION" | "GUIDANCE" | "MODELLING";
  scope: string;
}

export interface Metric {
  label: string;
  value: string;
  interval?: string;
}

export interface LifeEvidenceRecord {
  id: string;
  commonName: string;
  scientificName?: string;
  kind: "SURVEY_ESTIMATE" | "SURVEY_OBSERVATION" | "HABITAT_CONTEXT";
  period: string;
  scope: string;
  headline: string;
  metrics: Metric[];
  sourceIds: string[];
  grade: EvidenceGrade;
  limitation: string;
}

export interface PressureEvidenceRecord {
  id: string;
  label: string;
  headline: string;
  evidence: string;
  sourceIds: string[];
  grade: EvidenceGrade;
  scope: string;
  limitation: string;
}

export interface OslofjordSignal {
  id: string;
  type: "POLICY" | "REGULATION" | "RESEARCH" | "MONITORING" | "FUNDING";
  date: string;
  headline: string;
  whyItMatters: string;
  sourceIds: string[];
  confidence: "HIGH" | "MEDIUM";
  followNext: string;
  limitation: string;
}

export interface ActorRecord {
  id: string;
  name: string;
  role: string;
  sourceIds: string[];
  relationship: "ACTOR_ONLY";
  limitation: string;
}

export interface SolutionRecord {
  id: string;
  label: string;
  evidenceKind: "MODELLED_MEASURE" | "REGULATORY_MEASURE" | "GUIDANCE" | "FUNDED_PROGRAMME";
  status: "ACTIVE" | "GUIDANCE_AVAILABLE" | "MODELLED";
  evidence: string;
  sourceIds: string[];
  limitation: string;
}

export interface PublicActionPathway {
  id: string;
  label: string;
  actor: string;
  status: "OPEN_NOW" | "ONGOING";
  deadline?: string;
  url: string;
  whatYouCanDo: string;
  whyRelevant: string;
  proofBoundary: string;
  sourceIds: string[];
}

export interface RelationshipEvidenceStep {
  id: string;
  label: string;
  kind: "LIFE" | "FUNCTION" | "HABITAT" | "HUMAN_DEPENDENCE" | "PRESSURE" | "RESPONSE";
  grade: "DOCUMENTED" | "4PLANET_CONTEXT" | "UNKNOWN";
  sourceIds: string[];
  limitation?: string;
}

export const OSLOFJORD_SOURCES: OslofjordSource[] = [
  {
    id: "marine-regions-3379",
    label: "Marine Regions — Oslofjorden (MRGID 3379)",
    publisher: "Flanders Marine Institute / Marine Regions",
    url: "https://www.marineregions.org/gazetteer.php?id=3379&p=details",
    checkedAt: "2026-08-09",
    kind: "GAZETTEER",
    scope: "Semantic marine-place identity and representative location metadata.",
  },
  {
    id: "hi-sprat-survey-2025",
    label: "Brislingtokt Oslofjorden 2025 — Toktrapport 2026-7",
    publisher: "Havforskningsinstituttet",
    url: "https://www.hi.no/hi/nettrapporter/toktrapport-2026-7",
    publishedAt: "2026-03-04",
    checkedAt: "2026-08-09",
    kind: "SURVEY",
    scope: "Acoustic and biological survey of pelagic species in inner and outer Oslofjord and side fjords, 2–11 Dec 2025.",
  },
  {
    id: "hi-shrimp-survey-2026",
    label: "Toktrapport fra reketoktet i Skagerrak og Norskerenna 2026",
    publisher: "Havforskningsinstituttet",
    url: "https://www.hi.no/hi/nettrapporter/toktrapport-2026-16",
    publishedAt: "2026-07-01",
    checkedAt: "2026-08-09",
    kind: "SURVEY",
    scope: "Research trawl survey including four Oslofjord stations in 2026 and a 2022–2026 station series.",
  },
  {
    id: "miljodir-nitrogen-model-2026",
    label: "Oslofjorden må få flere miljøtiltak",
    publisher: "Miljødirektoratet",
    url: "https://www.miljodirektoratet.no/aktuelt/nyheter/2026/april-2026/oslofjorden-ma-fa-flere-miljotiltak/",
    publishedAt: "2026-04-17",
    checkedAt: "2026-08-09",
    kind: "MODELLING",
    scope: "NIVA/NIBIO/MET modelling commissioned to support revision of the Oslofjord plan.",
  },
  {
    id: "niva-outer-oslofjord-2019-2024",
    label: "Eutrofiovervåkning i Ytre Oslofjord — samlerapport 2019–2024",
    publisher: "NIVA",
    url: "https://www.niva.no/publikasjoner/publikasjon?cristinid=10252637",
    publishedAt: "2025",
    checkedAt: "2026-08-09",
    kind: "MONITORING",
    scope: "Six-year synthesis for the Outer Oslofjord monitoring programme; not a single status value for the whole Oslofjord.",
  },
  {
    id: "niva-water-column-mossesundet-2025",
    label: "Miljødata fra Oslofjorden — vannmasser",
    publisher: "NIVA",
    url: "https://www.niva.no/prosjekter/overvakning-av-miljotilstanden-i-ytre-oslofjord/Milj%C3%B8data-fra-Oslofjorden/vannmasser",
    checkedAt: "2026-08-09",
    kind: "MONITORING",
    scope: "Illustrative CTD profile from Mossesundet, June 2025, plus monitoring context.",
  },
  {
    id: "miljodir-restoration-2026",
    label: "Restaurering av marin natur kan bidra til å hjelpe Oslofjorden",
    publisher: "Miljødirektoratet",
    url: "https://www.miljodirektoratet.no/aktuelt/nyheter/2026/juni-2026/restaurering-av-marin-natur-kan-bidra-til-a-hjelpe-oslofjorden/",
    publishedAt: "2026-06-15",
    checkedAt: "2026-08-09",
    kind: "GUIDANCE",
    scope: "Restoration knowledge and guidance for local marine habitats in Oslofjord.",
  },
  {
    id: "miljodir-restorable-nature-2026",
    label: "Hvilken natur kan restaureres i Oslofjorden?",
    publisher: "Miljødirektoratet",
    url: "https://www.miljodirektoratet.no/ansvarsomrader/vann-hav-og-kyst/naturrestaurering-i-oslofjorden/hvilken-natur-kan-restaureres-i-kystomrader/",
    checkedAt: "2026-08-09",
    kind: "GUIDANCE",
    scope: "Locally relevant marine habitat types, habitat-forming species and restoration limits.",
  },
  {
    id: "government-plan-hearing-2026",
    label: "Høring av regjeringens forslag til ny Oslofjordplan",
    publisher: "Klima- og miljødepartementet",
    url: "https://www.regjeringen.no/no/dokumenter/horing-av-regjeringens-forslag-til-ny-oslofjordplan/id3166019/",
    publishedAt: "2026-06-19",
    checkedAt: "2026-08-09",
    kind: "POLICY",
    scope: "Government proposal for Oslofjord plan 2026–2030; consultation remains open through 15 Sep 2026.",
  },
  {
    id: "oslofjord-fisheries-regulation-2026",
    label: "Forskrift om regulering av fiske i Oslofjorden",
    publisher: "Lovdata / Nærings- og fiskeridepartementet",
    url: "https://lovdata.no/dokument/SF/forskrift/2025-12-19-2889",
    publishedAt: "2025-12-29",
    checkedAt: "2026-08-09",
    kind: "REGULATION",
    scope: "Current fisheries regulation in force 1 Jan 2026–31 Dec 2035, including geographic scope, cod restrictions and no-fishing areas.",
  },
  {
    id: "miljodir-nitrogen-grants-2026",
    label: "Søk tilskudd til nitrogenfjerning fra avløpsrenseanlegg",
    publisher: "Miljødirektoratet",
    url: "https://www.miljodirektoratet.no/aktuelt/fagmeldinger/2026/juni-2026/sok-tilskudd-til-nitrogenfjerning-fra-avlopsrenseanlegg/",
    publishedAt: "2026-06-12",
    checkedAt: "2026-08-09",
    kind: "POLICY",
    scope: "Funding programme for municipal wastewater nitrogen-removal work in the Oslofjord catchment.",
  },
];

const source = (id: string) => {
  const hit = OSLOFJORD_SOURCES.find((item) => item.id === id);
  if (!hit) throw new Error(`Missing Oslofjord source: ${id}`);
  return hit;
};

export const OSLOFJORD_PLACE: PlaceIdentity = {
  id: "place:marine-regions:3379",
  name: "Oslofjorden",
  kind: "FJORD",
  source: source("marine-regions-3379"),
  sourceRecordId: "MRGID 3379",
  representativePoint: { lat: 59.66666667, lng: 10.61666667, precisionMetres: 56000, crs: "WGS 84" },
  altNames: ["Oslofjord"],
  identityLimitation: "A semantic fjord identity is not proof that a coordinate, observation or polygon belongs to every ecological, legal or management definition of Oslofjorden.",
  geometries: [
    {
      id: "oslofjord-display",
      use: "DISPLAY",
      label: "Public display geometry",
      availability: "NOT_SELECTED",
      limitation: "No single display polygon has been selected yet. Do not invent one from the representative point.",
    },
    {
      id: "oslofjord-query",
      use: "QUERY",
      label: "External biodiversity query geometry",
      availability: "NOT_SELECTED",
      limitation: "GBIF/OBIS place queries remain disabled until a defensible query area is selected and labelled as a query area rather than semantic membership.",
    },
    {
      id: "oslofjord-regulatory-fisheries",
      use: "REGULATORY",
      label: "Fisheries regulation area",
      availability: "SOURCE_AVAILABLE_NOT_INGESTED",
      source: source("oslofjord-fisheries-regulation-2026"),
      sourceRecordId: "FOR-2025-12-19-2889 §2 / Vedlegg 1",
      geometryType: "POLYGON",
      limitation: "This boundary defines the scope of a fisheries regulation. It is not the canonical ecological or display boundary of the fjord.",
    },
    {
      id: "oslofjord-waterbodies",
      use: "WATERBODY",
      label: "Official waterbody set",
      availability: "NOT_SELECTED",
      geometryType: "WATERBODY_SET",
      limitation: "Waterbody records can support bounded status claims, but a selected set has not yet been integrated into this candidate.",
    },
  ],
};

export const OSLOFJORD_LIFE: LifeEvidenceRecord[] = [
  {
    id: "life-sprat-2025",
    commonName: "European sprat",
    scientificName: "Sprattus sprattus",
    kind: "SURVEY_ESTIMATE",
    period: "2–11 Dec 2025",
    scope: "HI pelagic survey area covering inner and outer Oslofjord and side fjords",
    headline: "The 2025 survey estimated about 261 million sprat in the survey area.",
    metrics: [
      { label: "Estimated individuals", value: "261 million", interval: "90% CI 190–334 million" },
      { label: "Estimated biomass", value: "2,971 tonnes", interval: "90% CI 2,189–3,818 t" },
    ],
    sourceIds: ["hi-sprat-survey-2025"],
    grade: "SOURCE_REPORTED",
    limitation: "Survey estimate for the defined 2025 survey design and period. It is not a live count, occurrence map or guarantee of current abundance.",
  },
  {
    id: "life-herring-2025",
    commonName: "Atlantic herring",
    scientificName: "Clupea harengus",
    kind: "SURVEY_ESTIMATE",
    period: "2–11 Dec 2025",
    scope: "HI pelagic survey area covering inner and outer Oslofjord and side fjords",
    headline: "The same survey estimated about 75 million herring.",
    metrics: [
      { label: "Estimated individuals", value: "75 million", interval: "90% CI 49–104 million" },
      { label: "Estimated biomass", value: "2,718 tonnes", interval: "90% CI 1,616–3,938 t" },
    ],
    sourceIds: ["hi-sprat-survey-2025"],
    grade: "SOURCE_REPORTED",
    limitation: "Survey estimate, not a current position, complete population census or long-term trend by itself.",
  },
  {
    id: "life-anchovy-2025",
    commonName: "European anchovy",
    scientificName: "Engraulis encrasicolus",
    kind: "SURVEY_ESTIMATE",
    period: "2–11 Dec 2025",
    scope: "HI pelagic survey; anchovy mainly observed in inner areas",
    headline: "Anchovy was mainly observed in inner areas; the survey estimated about 50 million individuals.",
    metrics: [
      { label: "Estimated individuals", value: "50 million", interval: "90% CI 29–75 million" },
      { label: "Estimated biomass", value: "196 tonnes", interval: "90% CI 109–296 t" },
    ],
    sourceIds: ["hi-sprat-survey-2025"],
    grade: "SOURCE_REPORTED",
    limitation: "Survey estimate with relatively low precision for several age groups. Do not interpret as a live distribution layer.",
  },
  {
    id: "life-cod-shrimp-2022-2026",
    commonName: "Cod + deep-water shrimp survey series",
    kind: "SURVEY_OBSERVATION",
    period: "2022–2026",
    scope: "A small set of trawlable research stations in Oslofjord, plus Hvalerdypet stations",
    headline: "Research-trawl catches show a mixed picture: cod catches were lower in 2025–2026, while some Hvalerdypet shrimp hauls were large.",
    metrics: [
      { label: "Cod >60 cm", value: "2 fish", interval: "captured across five survey years at the sampled stations" },
      { label: "Hvalerdypet shrimp hauls 2026", value: "109 / 49 / 48 kg per nautical mile" },
    ],
    sourceIds: ["hi-shrimp-survey-2026"],
    grade: "SOURCE_REPORTED",
    limitation: "Only a few positions in Oslofjord are trawlable with the survey gear. Station catches must not be presented as a whole-fjord population estimate.",
  },
  {
    id: "life-eelgrass-context",
    commonName: "Eelgrass",
    scientificName: "Zostera marina",
    kind: "HABITAT_CONTEXT",
    period: "Current restoration guidance",
    scope: "Naturally occurring coastal habitats in Oslofjord",
    headline: "Eelgrass meadows are among the habitat types identified as relevant for local restoration in Oslofjord.",
    metrics: [{ label: "Role", value: "Habitat-forming species / marine habitat" }],
    sourceIds: ["miljodir-restoration-2026", "miljodir-restorable-nature-2026"],
    grade: "SOURCE_REPORTED",
    limitation: "This establishes ecological/restoration relevance, not the condition, area or trend of every eelgrass meadow in the fjord.",
  },
];

export const OSLOFJORD_PRESSURES: PressureEvidenceRecord[] = [
  {
    id: "pressure-nitrogen",
    label: "Nutrient loading / nitrogen",
    headline: "Modelling indicates nitrate inputs need substantial reduction.",
    evidence: "NIVA, NIBIO and MET modelling commissioned by Miljødirektoratet indicates nitrate inputs need to fall about 30–40% relative to 2017–2019 to improve nitrogen indicators across much of Oslofjord.",
    sourceIds: ["miljodir-nitrogen-model-2026"],
    grade: "MODELLED",
    scope: "Modelled Oslofjord scenarios",
    limitation: "A modelled reduction need is not a measured outcome and does not mean every sub-area has the same condition or source mix.",
  },
  {
    id: "pressure-agriculture-wastewater",
    label: "Agriculture + wastewater",
    headline: "Land-based nutrient inputs have multiple major sources.",
    evidence: "Official modelling and monitoring identify agriculture and municipal wastewater as major land-based nutrient sources, with source shares varying by analysis and geography.",
    sourceIds: ["miljodir-nitrogen-model-2026", "niva-outer-oslofjord-2019-2024"],
    grade: "SOURCE_REPORTED",
    scope: "Oslofjord modelling plus Outer Oslofjord monitoring synthesis",
    limitation: "Do not transfer source percentages from the Outer Oslofjord monitoring synthesis to the entire fjord or an individual waterbody.",
  },
  {
    id: "pressure-oxygen",
    label: "Low bottom-water oxygen",
    headline: "Monitoring shows oxygen stress in several areas, including relatively open waters.",
    evidence: "NIVA's multi-year monitoring synthesis highlights concerning bottom-water oxygen development in Mossesundet, around Bolærne and Sandefjordsfjorden. A June 2025 Mossesundet profile fell from about 110% oxygen saturation near the surface to about 40% near the bottom.",
    sourceIds: ["niva-outer-oslofjord-2019-2024", "niva-water-column-mossesundet-2025"],
    grade: "SOURCE_REPORTED",
    scope: "Named monitoring areas/stations; one CTD profile used as an example",
    limitation: "The 40% value is one profile at one place/time. It is not a whole-fjord oxygen statistic.",
  },
  {
    id: "pressure-fisheries",
    label: "Fishing pressure",
    headline: "Current regulation is explicitly designed to help rebuild the Oslofjord ecosystem.",
    evidence: "The fisheries regulation in force from 1 Jan 2026 includes a cod-fishing ban, seasonal closures in cod spawning areas, gear restrictions and no-fishing areas.",
    sourceIds: ["oslofjord-fisheries-regulation-2026"],
    grade: "SOURCE_REPORTED",
    scope: "The legal fisheries-regulation area defined by the regulation",
    limitation: "The existence of a regulation does not by itself demonstrate ecological recovery or quantify the historical contribution of fishing to every ecological change.",
  },
  {
    id: "pressure-habitat",
    label: "Habitat degradation + physical disturbance",
    headline: "Restoration guidance treats pressure reduction as a prerequisite, not an optional extra.",
    evidence: "Miljødirektoratet's 2026 guidance says restoration often requires reducing the disturbances that caused degradation; local planting alone may not be sufficient.",
    sourceIds: ["miljodir-restoration-2026", "miljodir-restorable-nature-2026"],
    grade: "SOURCE_REPORTED",
    scope: "Local coastal marine restoration guidance",
    limitation: "The appropriate response depends on habitat, local cause, permits and monitoring. No universal restoration recipe is implied.",
  },
];

export const OSLOFJORD_RELATIONSHIP: RelationshipEvidenceStep[] = [
  {
    id: "rel-eelgrass-life",
    label: "Eelgrass",
    kind: "LIFE",
    grade: "DOCUMENTED",
    sourceIds: ["miljodir-restorable-nature-2026"],
  },
  {
    id: "rel-habitat-former",
    label: "Builds eelgrass-meadow habitat",
    kind: "FUNCTION",
    grade: "DOCUMENTED",
    sourceIds: ["miljodir-restorable-nature-2026"],
  },
  {
    id: "rel-habitat",
    label: "Habitat for marine life and future fish stocks",
    kind: "HABITAT",
    grade: "DOCUMENTED",
    sourceIds: ["miljodir-restoration-2026"],
  },
  {
    id: "rel-human",
    label: "Fish, recreation and food-system value",
    kind: "HUMAN_DEPENDENCE",
    grade: "4PLANET_CONTEXT",
    sourceIds: [],
    limitation: "Plain-language human-system bridge. Needs a dedicated Oslofjord source before promotion to a source-reported relationship.",
  },
  {
    id: "rel-pressure",
    label: "Water quality + physical disturbance can constrain recovery",
    kind: "PRESSURE",
    grade: "DOCUMENTED",
    sourceIds: ["miljodir-restoration-2026"],
  },
  {
    id: "rel-response",
    label: "Reduce pressure first; use local restoration where evidence and conditions support it",
    kind: "RESPONSE",
    grade: "DOCUMENTED",
    sourceIds: ["miljodir-restoration-2026", "miljodir-restorable-nature-2026"],
    limitation: "Guidance and pilot experience do not equal a verified outcome for a specific restoration project.",
  },
];

export const OSLOFJORD_SIGNALS: OslofjordSignal[] = [
  {
    id: "signal-plan-hearing-2026",
    type: "POLICY",
    date: "2026-06-19",
    headline: "A proposed Oslofjord plan for 2026–2030 is open for consultation.",
    whyItMatters: "The proposal sets the next policy frame for measures, restoration and monitoring; the consultation is still open as of this candidate.",
    sourceIds: ["government-plan-hearing-2026"],
    confidence: "HIGH",
    followNext: "Consultation closes 15 Sep 2026 → final plan → implementation → monitoring.",
    limitation: "The proposal is not yet a final adopted plan, and a policy decision is not an ecological outcome.",
  },
  {
    id: "signal-fisheries-2026",
    type: "REGULATION",
    date: "2026-01-01",
    headline: "New Oslofjord fishing restrictions entered into force.",
    whyItMatters: "The regulation introduces long-duration management measures, including no-fishing areas, intended to contribute to ecosystem rebuilding.",
    sourceIds: ["oslofjord-fisheries-regulation-2026"],
    confidence: "HIGH",
    followNext: "Compliance → monitoring → fish/community indicators → regulatory evaluation.",
    limitation: "Regulation in force does not prove recovery; outcomes require monitoring over time.",
  },
  {
    id: "signal-pelagic-survey-2026",
    type: "RESEARCH",
    date: "2026-03-04",
    headline: "HI published new 2025 estimates for sprat, herring and anchovy.",
    whyItMatters: "It gives a real, dated picture of pelagic fish in a defined survey design and creates something 4PLANET can return to when later surveys are published.",
    sourceIds: ["hi-sprat-survey-2025"],
    confidence: "HIGH",
    followNext: "Next comparable survey → method consistency → abundance/biomass changes with uncertainty.",
    limitation: "One survey year is not a long-term trend by itself.",
  },
  {
    id: "signal-nitrogen-model-2026",
    type: "RESEARCH",
    date: "2026-04-17",
    headline: "New modelling quantified the scale of nitrate reduction needed.",
    whyItMatters: "The model moves the nitrogen discussion from a generic pressure to a testable scale of intervention and later monitoring.",
    sourceIds: ["miljodir-nitrogen-model-2026"],
    confidence: "HIGH",
    followNext: "Implemented wastewater/agriculture measures → measured loads → water-quality indicators.",
    limitation: "Modelled need and scenario effects are not measured ecological outcomes.",
  },
];

export const OSLOFJORD_ACTORS: ActorRecord[] = [
  { id: "actor-kld", name: "Klima- og miljødepartementet", role: "Policy owner / consultation process", sourceIds: ["government-plan-hearing-2026"], relationship: "ACTOR_ONLY", limitation: "Listed as an actor. No 4PLANET partnership is implied." },
  { id: "actor-miljodir", name: "Miljødirektoratet", role: "Environmental authority, guidance, grants and commissioned knowledge", sourceIds: ["miljodir-nitrogen-model-2026", "miljodir-restoration-2026", "miljodir-nitrogen-grants-2026"], relationship: "ACTOR_ONLY", limitation: "Listed from public source roles. No 4PLANET partnership is implied." },
  { id: "actor-hi", name: "Havforskningsinstituttet", role: "Marine research and survey actor", sourceIds: ["hi-sprat-survey-2025", "hi-shrimp-survey-2026"], relationship: "ACTOR_ONLY", limitation: "Research actor only. No collaboration with 4PLANET is claimed." },
  { id: "actor-niva", name: "NIVA", role: "Water research, monitoring, modelling and restoration knowledge", sourceIds: ["niva-outer-oslofjord-2019-2024", "niva-water-column-mossesundet-2025", "miljodir-restoration-2026"], relationship: "ACTOR_ONLY", limitation: "Research actor only. No collaboration with 4PLANET is claimed." },
  { id: "actor-nibio", name: "NIBIO", role: "Agricultural modelling / land-based measure knowledge", sourceIds: ["miljodir-nitrogen-model-2026"], relationship: "ACTOR_ONLY", limitation: "Actor role derived from commissioned modelling. No partnership implied." },
  { id: "actor-met", name: "Meteorologisk institutt", role: "Environmental modelling contributor", sourceIds: ["miljodir-nitrogen-model-2026"], relationship: "ACTOR_ONLY", limitation: "Actor role derived from commissioned modelling. No partnership implied." },
  { id: "actor-municipalities", name: "Municipalities + municipal wastewater companies", role: "Wastewater/nitrogen-removal implementation actors", sourceIds: ["miljodir-nitrogen-grants-2026"], relationship: "ACTOR_ONLY", limitation: "Generic actor class from the funding programme; not every municipality has the same project or status." },
];

export const OSLOFJORD_SOLUTIONS: SolutionRecord[] = [
  {
    id: "solution-wastewater-nitrogen",
    label: "Wastewater nitrogen removal",
    evidenceKind: "MODELLED_MEASURE",
    status: "ACTIVE",
    evidence: "Modelled as a major nitrogen-reduction pathway and supported through a public grant programme for municipal wastewater facilities.",
    sourceIds: ["miljodir-nitrogen-model-2026", "miljodir-nitrogen-grants-2026"],
    limitation: "Funding and modelled potential are not verified ecological outcomes. Plant-level delivery and downstream response require separate evidence.",
  },
  {
    id: "solution-agriculture",
    label: "Agricultural nutrient + particle measures",
    evidenceKind: "MODELLED_MEASURE",
    status: "MODELLED",
    evidence: "Scenario modelling includes expanded environmental requirements, catch crops and reduced nitrogen surplus as possible load-reduction measures.",
    sourceIds: ["miljodir-nitrogen-model-2026"],
    limitation: "Modelled scenario. Actual implementation, load reductions and ecological effect must be measured separately.",
  },
  {
    id: "solution-fisheries",
    label: "Fishing restrictions + no-fishing areas",
    evidenceKind: "REGULATORY_MEASURE",
    status: "ACTIVE",
    evidence: "A current regulation establishes cod restrictions, gear restrictions, spawning closures and no-fishing areas through 2035.",
    sourceIds: ["oslofjord-fisheries-regulation-2026"],
    limitation: "Active regulation is an intervention state, not evidence of ecological recovery.",
  },
  {
    id: "solution-habitat-restoration",
    label: "Local marine habitat restoration",
    evidenceKind: "GUIDANCE",
    status: "GUIDANCE_AVAILABLE",
    evidence: "2026 guidance covers eelgrass, kelp/tang, shellfish beds and other habitats, with pressure reduction, planning, permits, pilots and follow-up as central conditions.",
    sourceIds: ["miljodir-restoration-2026", "miljodir-restorable-nature-2026"],
    limitation: "Guidance explicitly notes variable success and knowledge gaps. A restoration technique is not universally effective because it exists.",
  },
];

export const OSLOFJORD_ACTIONS: PublicActionPathway[] = [
  {
    id: "action-plan-consultation-2026",
    label: "Comment on the proposed Oslofjord plan",
    actor: "Klima- og miljødepartementet",
    status: "OPEN_NOW",
    deadline: "2026-09-15",
    url: "https://www.regjeringen.no/no/dokumenter/horing-av-regjeringens-forslag-til-ny-oslofjordplan/id3166019/",
    whatYouCanDo: "Read the proposal and submit a public consultation response. The government states that anyone may comment, including people and organisations not listed as formal consultees.",
    whyRelevant: "This is a real, time-bounded way to participate in a live public decision process that will shape the next Oslofjord plan.",
    proofBoundary: "Submitting a consultation response is civic participation. 4PLANET does not claim that one response will change policy or improve ecological condition.",
    sourceIds: ["government-plan-hearing-2026"],
  },
];

export const oslofjordSourceById = (id: string) => source(id);
