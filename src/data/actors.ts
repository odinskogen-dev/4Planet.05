export type ActorType =
  | "OPERATIONAL_CONSERVATION"
  | "DATA_INFRASTRUCTURE"
  | "RIGHTS_BASED_NGO";

export type ActorProfileStatus = "INDEXED" | "PROFILE_CLAIMED" | "INFORMATION_VERIFIED";
export type ActorClaimState = "SOURCE_STATEMENT" | "PRODUCT_CONTEXT" | "4PLANET_ASSESSMENT";
export type ActorEvidenceState = "STRONG" | "MODERATE" | "LIMITED";
export type ActorRightsStatus = "ACCEPTABLE" | "CONDITIONAL" | "BLOCKED";
export type ActorGeographyRole = "HEADQUARTERS_REFERENCE" | "OPERATING_GEOGRAPHY" | "PROGRAMME_GEOGRAPHY";
export type ActorActionType = "DONATE" | "EXPLORE_DATA" | "FOLLOW" | "LEARN" | "CONTACT" | "PARTNER_OFFICIALLY";

export type ActorSource = {
  id: string;
  label: string;
  url: string;
  sourceClass: string;
  retrievedAt: string;
  rightsStatus: ActorRightsStatus;
  visibility: "PUBLIC" | "INTERNAL";
};

export type ActorClaim = {
  id: string;
  section: string;
  text: string;
  claimState: ActorClaimState;
  evidenceState: ActorEvidenceState;
  sourceIds: string[];
  limitation?: string;
};

export type ActorGeography = {
  id: string;
  label: string;
  role: ActorGeographyRole;
  description: string;
  longitude: number;
  latitude: number;
  zoom: number;
  precision: "CITY_REFERENCE" | "COUNTRY" | "REGION";
  sensitivity: "NONE" | "GENERALISED";
  sourceIds: string[];
};

export type ActorAction = {
  id: string;
  type: ActorActionType;
  label: string;
  url: string;
  description: string;
};

export type ActorProgramme = {
  id: string;
  name: string;
  summary: string;
  sourceIds: string[];
};

export type ActorProfile = {
  id: string;
  slug: string;
  name: string;
  legalName?: string;
  actorType: ActorType;
  actorTypeLabel: string;
  status: ActorProfileStatus;
  profileDecision: "PRIVATE_BETA";
  founded?: string;
  primaryGeography: string;
  missionIds: string[];
  methods: string[];
  ecosystems: string[];
  species: string[];
  issues: string[];
  solutions: string[];
  introduction: string;
  whyItMatters: string;
  whatItWorksOn: string[];
  howItWorks: string[];
  limitations: string[];
  programmes: ActorProgramme[];
  geographies: ActorGeography[];
  claims: ActorClaim[];
  sources: ActorSource[];
  actions: ActorAction[];
  relatedActorIds: string[];
  officialUrl: string;
  lastReviewed: string;
  seo: {
    title: string;
    description: string;
    canonicalPath: string;
    sameAs: string[];
    areaServed: string[];
    knowsAbout: string[];
  };
};

const source = (
  id: string,
  label: string,
  url: string,
  sourceClass: string,
  rightsStatus: ActorRightsStatus = "ACCEPTABLE",
): ActorSource => ({
  id,
  label,
  url,
  sourceClass,
  retrievedAt: "2026-08-05",
  rightsStatus,
  visibility: "PUBLIC",
});

export const ACTORS: ActorProfile[] = [
  {
    id: "actor:p17:P17-A015",
    slug: "world-land-trust",
    name: "World Land Trust",
    actorType: "OPERATIONAL_CONSERVATION",
    actorTypeLabel: "Operational conservation actor",
    status: "INDEXED",
    profileDecision: "PRIVATE_BETA",
    primaryGeography: "Global partner network · UK base",
    missionIds: ["RE:WILD LAND", "AM4ZONIA", "SPECIES", "CLIM4TE"],
    methods: ["Partner-led land protection", "Land acquisition", "Reserve management", "Restoration"],
    ecosystems: ["Tropical forest", "Dry forest", "Wetlands", "Threatened terrestrial habitats"],
    species: ["Habitat-dependent threatened species"],
    issues: ["Habitat loss", "Deforestation", "Fragmentation", "Underfunded local conservation"],
    solutions: ["Permanent habitat protection", "Local partner finance", "Restoration", "Long-term stewardship"],
    introduction:
      "World Land Trust is a UK conservation charity that supports local partners to protect threatened habitats. Its public model centres partner-led land acquisition, management and restoration rather than presenting conservation as work owned by the funder alone.",
    whyItMatters:
      "Land protection becomes more credible when legal ownership, local stewardship, project economics and long-term management are kept visible. World Land Trust is useful to 4PLANET as an example of how global funding can connect to locally executed habitat protection without collapsing the roles of donor, intermediary, landholder and field partner.",
    whatItWorksOn: [
      "Threatened habitats facing conversion or fragmentation",
      "Funding gaps for local conservation organisations",
      "Long-term protection and restoration of ecologically important land",
    ],
    howItWorks: [
      "Raises funding through official appeals and programmes",
      "Works through local conservation partners",
      "Supports land acquisition, reserve creation, management and restoration",
      "Publishes annual reporting and programme information",
    ],
    limitations: [
      "A donation is not automatically a transferable 4PLANET land unit.",
      "Land title, ownership, management responsibility and ecological outcomes must be assessed project by project.",
      "A headquarters reference is not an operating area or project location.",
      "No partnership with 4PLANET is implied by this independent profile.",
    ],
    programmes: [
      {
        id: "programme:wlt:buy-an-acre",
        name: "Buy an Acre",
        summary: "An official fundraising route supporting land protection through eligible partner projects. Project terms and area economics vary.",
        sourceIds: ["wlt-action", "wlt-faq"],
      },
      {
        id: "programme:wlt:action-fund",
        name: "Action Fund",
        summary: "A flexible official funding route for urgent conservation needs identified through World Land Trust and its partners.",
        sourceIds: ["wlt-action", "wlt-method"],
      },
    ],
    geographies: [
      {
        id: "geo:wlt:hq",
        label: "Halesworth, United Kingdom",
        role: "HEADQUARTERS_REFERENCE",
        description: "Administrative reference only. This point does not represent World Land Trust's global operating footprint.",
        longitude: 1.5,
        latitude: 52.34,
        zoom: 5.4,
        precision: "CITY_REFERENCE",
        sensitivity: "GENERALISED",
        sourceIds: ["wlt-about"],
      },
      {
        id: "geo:wlt:global-partners",
        label: "Global partner-led conservation portfolio",
        role: "OPERATING_GEOGRAPHY",
        description: "Broad editorial extent. Exact project sites must be sourced and modelled separately before public mapping.",
        longitude: -60,
        latitude: 0,
        zoom: 1.6,
        precision: "REGION",
        sensitivity: "GENERALISED",
        sourceIds: ["wlt-partners"],
      },
    ],
    claims: [
      {
        id: "CLM-036",
        section: "Identity",
        text: "World Land Trust is a UK conservation charity supporting local partners to protect threatened habitats.",
        claimState: "SOURCE_STATEMENT",
        evidenceState: "STRONG",
        sourceIds: ["wlt-about", "wlt-registry"],
        limitation: "Exact charity registration fields remain a publication-gate check for structured data.",
      },
      {
        id: "CLM-037",
        section: "Reporting",
        text: "World Land Trust publishes annual reviews and full accounts, with a 2024 annual report listed during the review.",
        claimState: "SOURCE_STATEMENT",
        evidenceState: "STRONG",
        sourceIds: ["wlt-report", "wlt-registry"],
        limitation: "Reporting-period language must remain exact and should not be silently advanced to a later year.",
      },
      {
        id: "CLM-038",
        section: "Method",
        text: "World Land Trust channels funding to partner-led land acquisition, management and restoration.",
        claimState: "SOURCE_STATEMENT",
        evidenceState: "STRONG",
        sourceIds: ["wlt-method", "wlt-partners"],
        limitation: "Title, ownership and management must be attributed to the relevant local entity.",
      },
      {
        id: "CLM-039",
        section: "Action",
        text: "People can support official appeals, Buy an Acre, Action Fund and other programmes through World Land Trust's official channels.",
        claimState: "PRODUCT_CONTEXT",
        evidenceState: "STRONG",
        sourceIds: ["wlt-action", "wlt-faq"],
        limitation: "No universal fixed price or area conversion is inferred across projects.",
      },
      {
        id: "CLM-040",
        section: "Impact boundary",
        text: "A donation is not automatically a transferable 4PLANET land unit; project-specific legal, financial and evidence diligence is required.",
        claimState: "4PLANET_ASSESSMENT",
        evidenceState: "STRONG",
        sourceIds: ["wlt-faq"],
      },
    ],
    sources: [
      source("wlt-about", "About World Land Trust", "https://www.worldlandtrust.org/about-us/", "Official identity"),
      source("wlt-registry", "UK Charity Commission register", "https://register-of-charities.charitycommission.gov.uk/", "Public registry"),
      source("wlt-report", "Annual report and accounts", "https://www.worldlandtrust.org/annual-report-accounts/", "Official reporting"),
      source("wlt-method", "What we do", "https://www.worldlandtrust.org/what-we-do/", "Official programme"),
      source("wlt-partners", "Conservation partners", "https://www.worldlandtrust.org/who-we-are-2/partners/", "Official partner directory"),
      source("wlt-action", "Official donation routes", "https://www.worldlandtrust.org/donate/", "Official action"),
      source("wlt-faq", "World Land Trust FAQs", "https://www.worldlandtrust.org/faqs/", "Official boundary information"),
    ],
    actions: [
      { id: "action:wlt:donate", type: "DONATE", label: "Support through World Land Trust", url: "https://www.worldlandtrust.org/donate/", description: "External action on the organisation's official website." },
      { id: "action:wlt:learn", type: "LEARN", label: "Explore how land protection works", url: "https://www.worldlandtrust.org/what-we-do/", description: "Review the organisation's own programme descriptions and boundaries." },
      { id: "action:wlt:partners", type: "PARTNER_OFFICIALLY", label: "Explore official partnership routes", url: "https://www.worldlandtrust.org/who-we-are-2/partners/", description: "Official information only; no 4PLANET partnership is implied." },
    ],
    relatedActorIds: ["actor:p17:P17-A016"],
    officialUrl: "https://www.worldlandtrust.org/",
    lastReviewed: "2026-08-05",
    seo: {
      title: "World Land Trust — Organisation Profile | 4PLANET",
      description: "Explore World Land Trust, its partner-led land protection model, evidence, limitations, official support routes and related 4PLANET missions.",
      canonicalPath: "/actors/world-land-trust",
      sameAs: ["https://www.worldlandtrust.org/"],
      areaServed: ["Global partner network"],
      knowsAbout: ["Habitat protection", "Land acquisition", "Restoration", "Local conservation partnerships"],
    },
  },
  {
    id: "actor:p17:P17-A003",
    slug: "global-biodiversity-information-facility",
    name: "Global Biodiversity Information Facility",
    actorType: "DATA_INFRASTRUCTURE",
    actorTypeLabel: "Biodiversity data infrastructure",
    status: "INDEXED",
    profileDecision: "PRIVATE_BETA",
    primaryGeography: "Global network · Secretariat in Denmark",
    missionIds: ["SPECIES", "RE:WILD LAND", "RE:WILD MARINE", "CLIM4TE"],
    methods: ["Open data infrastructure", "Data standards", "APIs", "Participant nodes"],
    ecosystems: ["All ecosystems represented by contributing datasets"],
    species: ["Biodiversity occurrence records across taxa"],
    issues: ["Fragmented biodiversity data", "Low interoperability", "Uneven observation coverage"],
    solutions: ["Open data publishing", "Shared standards", "National nodes", "Reusable APIs"],
    introduction:
      "The Global Biodiversity Information Facility, commonly known as GBIF, is an international open-data infrastructure supported through participating countries and organisations. It provides access to biodiversity occurrence records while preserving dataset-level provenance, licensing and attribution.",
    whyItMatters:
      "GBIF makes dispersed biodiversity records discoverable through a shared technical infrastructure. For 4PLANET, it is both a major data source and a model for how canonical identity, source attribution and licence boundaries can travel with reused records.",
    whatItWorksOn: [
      "Access to biodiversity occurrence data",
      "Interoperability between institutions, collections and observation networks",
      "Data publishing through participant nodes and shared standards",
    ],
    howItWorks: [
      "Operates a global data portal and API",
      "Supports publishing institutions and national participant nodes",
      "Maintains technical standards and governance structures",
      "Retains dataset-level licences and attribution requirements",
    ],
    limitations: [
      "Occurrence records do not establish complete range, abundance, population trend or live tracking.",
      "Every reused record must retain dataset-level licence and attribution.",
      "The Secretariat location is not GBIF's global operating geography.",
      "No partnership with 4PLANET is implied by data use or independent indexing.",
    ],
    programmes: [
      {
        id: "programme:gbif:portal",
        name: "GBIF.org occurrence infrastructure",
        summary: "A global discovery and access layer for biodiversity occurrence records contributed by publishing institutions and networks.",
        sourceIds: ["gbif-occurrence", "gbif-api"],
      },
      {
        id: "programme:gbif:network",
        name: "Participant and node network",
        summary: "A governance and participation structure connecting countries, organisations, nodes and the Secretariat.",
        sourceIds: ["gbif-governance", "gbif-network"],
      },
    ],
    geographies: [
      {
        id: "geo:gbif:secretariat",
        label: "Copenhagen, Denmark",
        role: "HEADQUARTERS_REFERENCE",
        description: "Secretariat reference only. GBIF is a distributed international participant network.",
        longitude: 12.57,
        latitude: 55.68,
        zoom: 5.2,
        precision: "CITY_REFERENCE",
        sensitivity: "GENERALISED",
        sourceIds: ["gbif-governance"],
      },
      {
        id: "geo:gbif:network",
        label: "International participant network",
        role: "OPERATING_GEOGRAPHY",
        description: "Global network extent. Record coverage is uneven and should not be read as complete biodiversity coverage.",
        longitude: 10,
        latitude: 20,
        zoom: 1.4,
        precision: "REGION",
        sensitivity: "NONE",
        sourceIds: ["gbif-network"],
      },
    ],
    claims: [
      {
        id: "CLM-006",
        section: "Identity",
        text: "GBIF is an international open-data infrastructure supported through participating countries and organisations.",
        claimState: "SOURCE_STATEMENT",
        evidenceState: "STRONG",
        sourceIds: ["gbif-about", "gbif-governance"],
      },
      {
        id: "CLM-007",
        section: "Data",
        text: "GBIF provides access to biodiversity occurrence records through its portal and API.",
        claimState: "SOURCE_STATEMENT",
        evidenceState: "STRONG",
        sourceIds: ["gbif-api", "gbif-occurrence"],
        limitation: "Every record retains dataset-level licence and attribution requirements.",
      },
      {
        id: "CLM-008",
        section: "Governance",
        text: "GBIF has a Governing Board, Secretariat and participant network.",
        claimState: "SOURCE_STATEMENT",
        evidenceState: "STRONG",
        sourceIds: ["gbif-governance", "gbif-network"],
        limitation: "The Secretariat location must not be represented as the organisation's operating footprint.",
      },
      {
        id: "CLM-009",
        section: "Limitations",
        text: "Occurrence records show reported observations or specimens, not complete range, abundance or live tracking.",
        claimState: "4PLANET_ASSESSMENT",
        evidenceState: "STRONG",
        sourceIds: ["gbif-occurrence", "gbif-about"],
      },
      {
        id: "CLM-010",
        section: "Action",
        text: "Users can search, download and publish data under source-specific licences and participation rules.",
        claimState: "PRODUCT_CONTEXT",
        evidenceState: "STRONG",
        sourceIds: ["gbif-publish", "gbif-terms"],
        limitation: "4PLANET does not describe all GBIF-mediated data as CC0.",
      },
    ],
    sources: [
      source("gbif-about", "What is GBIF?", "https://www.gbif.org/what-is-gbif", "Official identity"),
      source("gbif-governance", "GBIF governance", "https://www.gbif.org/governance", "Official governance"),
      source("gbif-network", "The GBIF network", "https://www.gbif.org/the-gbif-network", "Official network"),
      source("gbif-api", "GBIF developer documentation", "https://www.gbif.org/developer/summary", "Official technical documentation", "CONDITIONAL"),
      source("gbif-occurrence", "GBIF occurrence search", "https://www.gbif.org/occurrence/search", "Official data portal", "CONDITIONAL"),
      source("gbif-publish", "How to publish datasets", "https://www.gbif.org/how-to-publish-datasets", "Official participation"),
      source("gbif-terms", "GBIF terms", "https://www.gbif.org/terms", "Official terms", "CONDITIONAL"),
    ],
    actions: [
      { id: "action:gbif:explore", type: "EXPLORE_DATA", label: "Explore biodiversity records", url: "https://www.gbif.org/occurrence/search", description: "External data exploration on GBIF.org; dataset-level terms apply." },
      { id: "action:gbif:publish", type: "LEARN", label: "Learn how to publish data", url: "https://www.gbif.org/how-to-publish-datasets", description: "Official guidance for eligible publishing institutions and networks." },
      { id: "action:gbif:api", type: "EXPLORE_DATA", label: "Open the GBIF API documentation", url: "https://www.gbif.org/developer/summary", description: "Official technical documentation; licence and attribution remain source-specific." },
    ],
    relatedActorIds: [],
    officialUrl: "https://www.gbif.org/",
    lastReviewed: "2026-08-05",
    seo: {
      title: "GBIF — Biodiversity Data Infrastructure Profile | 4PLANET",
      description: "Explore GBIF, its open biodiversity data infrastructure, governance, APIs, source boundaries and related 4PLANET missions.",
      canonicalPath: "/actors/global-biodiversity-information-facility",
      sameAs: ["https://www.gbif.org/"],
      areaServed: ["Global participant network"],
      knowsAbout: ["Biodiversity occurrence data", "Data standards", "Open data publishing", "Species observations"],
    },
  },
  {
    id: "actor:p17:P17-A016",
    slug: "rainforest-foundation-norway",
    name: "Rainforest Foundation Norway",
    legalName: "Regnskogfondet",
    actorType: "RIGHTS_BASED_NGO",
    actorTypeLabel: "Rights-based and locally partnered organisation",
    status: "INDEXED",
    profileDecision: "PRIVATE_BETA",
    primaryGeography: "Tropical forest regions · Norway base",
    missionIds: ["AM4ZONIA", "RE:WILD LAND", "SPECIES", "CLIM4TE"],
    methods: ["Long-term local partnerships", "Indigenous rights", "Policy", "Corporate accountability"],
    ecosystems: ["Amazon rainforest", "Congo Basin forests", "Southeast Asian rainforests", "Tropical forest landscapes"],
    species: ["Forest-dependent species"],
    issues: ["Deforestation", "Extractive pressure", "Weak land rights", "Harmful finance and supply chains"],
    solutions: ["Rights-based forest protection", "Partner support", "Territorial governance", "Policy change"],
    introduction:
      "Rainforest Foundation Norway is a Norwegian organisation working through long-term partnerships to protect tropical forests and strengthen the rights of Indigenous peoples and local communities. Its public profile must preserve the agency and authorship of partner-led and Indigenous-led work.",
    whyItMatters:
      "Forest protection is not only a question of hectares or carbon. Rights, governance, local legitimacy and long-term partner capacity shape whether protection is durable. Rainforest Foundation Norway is therefore a useful rights-based actor in 4PLANET's first profile set, provided the interface does not portray local work as owned or executed solely by the Norwegian organisation.",
    whatItWorksOn: [
      "Deforestation and extractive pressure in tropical forest regions",
      "Indigenous and community land rights",
      "Policy, finance and supply-chain drivers of forest loss",
    ],
    howItWorks: [
      "Supports local and Indigenous partner organisations",
      "Works on land rights and territorial governance",
      "Uses policy, advocacy and corporate accountability",
      "Publishes governance, reporting and programme information",
    ],
    limitations: [
      "Partner-led or Indigenous-led work must not be presented as work owned or executed solely by Rainforest Foundation Norway.",
      "Programme outcomes need region- and partner-specific evidence.",
      "A donation does not imply protection of a fixed area without project-specific terms.",
      "No partnership with 4PLANET is implied by this independent profile.",
    ],
    programmes: [
      {
        id: "programme:rfn:partner-model",
        name: "Long-term partner support",
        summary: "Support for local and Indigenous organisations working on forest protection, rights and governance. Individual partners retain their own identity and agency.",
        sourceIds: ["rfn-method", "rfn-work"],
      },
      {
        id: "programme:rfn:policy",
        name: "Policy and corporate accountability",
        summary: "Work addressing policy, finance and supply-chain drivers connected to tropical forest loss.",
        sourceIds: ["rfn-method", "rfn-work"],
      },
    ],
    geographies: [
      {
        id: "geo:rfn:hq",
        label: "Oslo, Norway",
        role: "HEADQUARTERS_REFERENCE",
        description: "Administrative reference only. This point is not a proxy for programme ownership or tropical field activity.",
        longitude: 10.75,
        latitude: 59.91,
        zoom: 5.3,
        precision: "CITY_REFERENCE",
        sensitivity: "GENERALISED",
        sourceIds: ["rfn-about"],
      },
      {
        id: "geo:rfn:tropics",
        label: "Tropical forest partner regions",
        role: "OPERATING_GEOGRAPHY",
        description: "Broad editorial geography covering partner relationships. Exact partner and programme locations require consent-aware, source-specific modelling.",
        longitude: -55,
        latitude: -4,
        zoom: 1.7,
        precision: "REGION",
        sensitivity: "GENERALISED",
        sourceIds: ["rfn-method", "rfn-work"],
      },
    ],
    claims: [
      {
        id: "CLM-041",
        section: "Identity",
        text: "Rainforest Foundation Norway is a Norwegian organisation working through long-term partnerships to protect tropical forests and Indigenous rights.",
        claimState: "SOURCE_STATEMENT",
        evidenceState: "STRONG",
        sourceIds: ["rfn-about", "rfn-reports"],
        limitation: "Norwegian legal registration fields remain a final structured-data publication gate.",
      },
      {
        id: "CLM-042",
        section: "Reporting",
        text: "Rainforest Foundation Norway publishes governance documents, audited financial information and a signed 2025 board report.",
        claimState: "SOURCE_STATEMENT",
        evidenceState: "STRONG",
        sourceIds: ["rfn-reports", "rfn-governance"],
        limitation: "Programme outcomes require region- and partner-specific evidence.",
      },
      {
        id: "CLM-043",
        section: "Method",
        text: "The organisation supports local and Indigenous partners, land rights, policy change and corporate accountability.",
        claimState: "SOURCE_STATEMENT",
        evidenceState: "STRONG",
        sourceIds: ["rfn-method", "rfn-work"],
        limitation: "Local partner agency and attribution must remain visible.",
      },
      {
        id: "CLM-044",
        section: "Action",
        text: "People can donate, follow campaigns and access reports through the organisation's official channels.",
        claimState: "PRODUCT_CONTEXT",
        evidenceState: "STRONG",
        sourceIds: ["rfn-support", "rfn-publications"],
        limitation: "No fixed-area impact conversion is inferred.",
      },
      {
        id: "CLM-045",
        section: "Representation",
        text: "4PLANET must not portray partner-led or Indigenous-led work as work owned or executed solely by Rainforest Foundation Norway.",
        claimState: "4PLANET_ASSESSMENT",
        evidenceState: "STRONG",
        sourceIds: ["rfn-method"],
      },
    ],
    sources: [
      source("rfn-about", "About Rainforest Foundation Norway", "https://www.regnskog.no/en/about-rainforest-foundation-norway", "Official identity"),
      source("rfn-reports", "Annual reports", "https://www.regnskog.no/en/about-rainforest-foundation-norway/annual-reports", "Official reporting"),
      source("rfn-governance", "Governing documents", "https://www.regnskog.no/en/about-rainforest-foundation-norway/governing-documents", "Official governance"),
      source("rfn-method", "What we do", "https://www.regnskog.no/en/what-we-do", "Official programme"),
      source("rfn-work", "Our work", "https://www.regnskog.no/en/our-work", "Official programme"),
      source("rfn-support", "Support us", "https://www.regnskog.no/en/support-us", "Official action"),
      source("rfn-publications", "Publications", "https://www.regnskog.no/en/publications", "Official research and reporting"),
    ],
    actions: [
      { id: "action:rfn:donate", type: "DONATE", label: "Support through Rainforest Foundation Norway", url: "https://www.regnskog.no/en/support-us", description: "External action on the organisation's official website." },
      { id: "action:rfn:learn", type: "LEARN", label: "Understand the partner-led model", url: "https://www.regnskog.no/en/what-we-do", description: "Review how the organisation describes its rights-based and partner-led work." },
      { id: "action:rfn:reports", type: "FOLLOW", label: "Read reports and publications", url: "https://www.regnskog.no/en/publications", description: "Open official research, reports and campaign material." },
    ],
    relatedActorIds: ["actor:p17:P17-A015"],
    officialUrl: "https://www.regnskog.no/en",
    lastReviewed: "2026-08-05",
    seo: {
      title: "Rainforest Foundation Norway — Organisation Profile | 4PLANET",
      description: "Explore Rainforest Foundation Norway, its rights-based partner model, evidence, limitations, official support routes and related missions.",
      canonicalPath: "/actors/rainforest-foundation-norway",
      sameAs: ["https://www.regnskog.no/en"],
      areaServed: ["Tropical forest partner regions"],
      knowsAbout: ["Tropical forests", "Indigenous rights", "Land rights", "Corporate accountability"],
    },
  },
];

export const actorBySlug = (slug?: string) => ACTORS.find((actor) => actor.slug === slug);
export const actorById = (id?: string | null) => ACTORS.find((actor) => actor.id === id);
export const actorSource = (actor: ActorProfile, sourceId: string) => actor.sources.find((item) => item.id === sourceId);

export const ACTOR_TYPE_LABELS: Record<ActorType, string> = {
  OPERATIONAL_CONSERVATION: "Operational conservation",
  DATA_INFRASTRUCTURE: "Data infrastructure",
  RIGHTS_BASED_NGO: "Rights-based organisation",
};

export const ACTOR_ACTION_LABELS: Record<ActorActionType, string> = {
  DONATE: "Donate",
  EXPLORE_DATA: "Explore data",
  FOLLOW: "Follow",
  LEARN: "Learn",
  CONTACT: "Contact",
  PARTNER_OFFICIALLY: "Official partnership route",
};
