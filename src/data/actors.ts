export type ActorType =
  | "MEMBERSHIP_UNION"
  | "DATA_INFRASTRUCTURE"
  | "FIELD_CONSERVATION"
  | "SPECIALIST_CONSERVATION"
  | "RESTORATION_OPERATOR"
  | "DATA_ACCOUNTABILITY"
  | "RIGHTS_BASED_NGO"
  | "COALITION";

export type ActorProfileStatus = "INDEXED" | "PROFILE_CLAIMED" | "INFORMATION_VERIFIED";
export type ActorClaimState = "SOURCE_STATEMENT" | "PRODUCT_CONTEXT" | "4PLANET_ASSESSMENT";
export type ActorEvidenceState = "STRONG" | "MODERATE" | "LIMITED";
export type ActorRightsStatus = "ACCEPTABLE" | "CONDITIONAL" | "BLOCKED";
export type ActorGeographyRole =
  | "HEADQUARTERS_REFERENCE"
  | "OPERATING_GEOGRAPHY"
  | "PROGRAMME_GEOGRAPHY"
  | "DOCUMENTED_PROJECT_SITE"
  | "PARTNER_GEOGRAPHY";
export type ActorActionType =
  | "DONATE"
  | "EXPLORE_DATA"
  | "FOLLOW"
  | "LEARN"
  | "CONTACT"
  | "PARTNER_OFFICIALLY";
export type ActorCollection =
  | "FEATURED"
  | "FORESTS_AND_HABITATS"
  | "OCEANS"
  | "SPECIES_AND_ECOSYSTEMS"
  | "INDIGENOUS_AND_LOCAL_LEADERSHIP"
  | "PLANETARY_DATA_AND_RESEARCH"
  | "CLIMATE_AND_ENERGY"
  | "OFFICIAL_SUPPORT_AVAILABLE";

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
  precision: "CITY_REFERENCE" | "COUNTRY" | "REGION" | "SITE_REFERENCE";
  sensitivity: "NONE" | "GENERALISED" | "RESTRICTED";
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

export type ActorRelationship = {
  id: string;
  kind: "MISSION" | "SPECIES" | "PLACE" | "ISSUE" | "SOLUTION" | "ACTOR";
  label: string;
  href?: string;
  evidenceState: ActorEvidenceState;
  sourceIds: string[];
};

export type ActorVisualisation = {
  kind: "GEOGRAPHY" | "NETWORK" | "DATA_FLOW" | "SPECIES_SYSTEM" | "EMISSIONS";
  title: string;
  caption: string;
  nodes: string[];
};

export type ActorProfile = {
  id: string;
  slug: string;
  name: string;
  legalName?: string;
  alternateName?: string;
  actorType: ActorType;
  actorTypeLabel: string;
  status: ActorProfileStatus;
  profileDecision: "PRIVATE_BETA";
  founded?: string;
  tagline: string;
  primaryGeography: string;
  missionIds: string[];
  methods: string[];
  ecosystems: string[];
  species: string[];
  issues: string[];
  solutions: string[];
  collections: ActorCollection[];
  introduction: string;
  whyItMatters: string;
  whatItMakesPossible: string;
  whatItWorksOn: string[];
  howItWorks: string[];
  limitations: string[];
  programmes: ActorProgramme[];
  geographies: ActorGeography[];
  relationships: ActorRelationship[];
  visualisation: ActorVisualisation;
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
    ogImage: string;
  };
};

type SourceInput = [id: string, label: string, url: string, sourceClass: string, rightsStatus?: ActorRightsStatus];
type ProfileInput = Omit<ActorProfile, "claims" | "sources" | "profileDecision" | "status"> & {
  claimStart: number;
  identityClaim: string;
  methodClaim: string;
  actionClaim: string;
  boundaryClaim: string;
  sources: SourceInput[];
};

const source = ([id, label, url, sourceClass, rightsStatus = "ACCEPTABLE"]: SourceInput): ActorSource => ({
  id,
  label,
  url,
  sourceClass,
  retrievedAt: "2026-08-05",
  rightsStatus,
  visibility: "PUBLIC",
});

const claimId = (value: number) => `CLM-${String(value).padStart(3, "0")}`;

const buildProfile = (input: ProfileInput): ActorProfile => {
  const sources = input.sources.map(source);
  const sourceIds = sources.map((item) => item.id);
  const [s1, s2 = s1, s3 = s1, s4 = s2] = sourceIds;
  const claims: ActorClaim[] = [
    {
      id: claimId(input.claimStart),
      section: "Identity",
      text: input.identityClaim,
      claimState: "SOURCE_STATEMENT",
      evidenceState: "STRONG",
      sourceIds: [s1, s2],
    },
    {
      id: claimId(input.claimStart + 1),
      section: "Work",
      text: input.introduction,
      claimState: "SOURCE_STATEMENT",
      evidenceState: "STRONG",
      sourceIds: [s1, s3],
      limitation: input.limitations[0],
    },
    {
      id: claimId(input.claimStart + 2),
      section: "Method",
      text: input.methodClaim,
      claimState: "SOURCE_STATEMENT",
      evidenceState: "STRONG",
      sourceIds: [s1, s3],
      limitation: input.limitations[1],
    },
    {
      id: claimId(input.claimStart + 3),
      section: "Action",
      text: input.actionClaim,
      claimState: "PRODUCT_CONTEXT",
      evidenceState: "STRONG",
      sourceIds: [s3, s4],
      limitation: "All actions leave 4PLANET and continue through the organisation's official channels.",
    },
    {
      id: claimId(input.claimStart + 4),
      section: "Boundary",
      text: input.boundaryClaim,
      claimState: "4PLANET_ASSESSMENT",
      evidenceState: "STRONG",
      sourceIds: [s1, s3],
    },
  ];

  const { claimStart: _claimStart, identityClaim: _identity, methodClaim: _method, actionClaim: _action, boundaryClaim: _boundary, sources: _sources, ...profile } = input;
  return { ...profile, status: "INDEXED", profileDecision: "PRIVATE_BETA", sources, claims };
};

const geo = (
  id: string,
  label: string,
  role: ActorGeographyRole,
  description: string,
  longitude: number,
  latitude: number,
  zoom: number,
  precision: ActorGeography["precision"],
  sourceIds: string[],
  sensitivity: ActorGeography["sensitivity"] = "GENERALISED",
): ActorGeography => ({ id, label, role, description, longitude, latitude, zoom, precision, sensitivity, sourceIds });

const action = (id: string, type: ActorActionType, label: string, url: string, description: string): ActorAction => ({
  id, type, label, url, description,
});

const programme = (id: string, name: string, summary: string, sourceIds: string[]): ActorProgramme => ({
  id, name, summary, sourceIds,
});

const relation = (
  id: string,
  kind: ActorRelationship["kind"],
  label: string,
  sourceIds: string[],
  href?: string,
  evidenceState: ActorEvidenceState = "STRONG",
): ActorRelationship => ({ id, kind, label, sourceIds, href, evidenceState });

const og = (slug: string) => `/p17/share/${slug}.svg`;

export const ACTORS: ActorProfile[] = [
  buildProfile({
    id: "actor:p17:P17-A001",
    slug: "iucn",
    name: "IUCN",
    legalName: "International Union for Conservation of Nature and Natural Resources",
    actorType: "MEMBERSHIP_UNION",
    actorTypeLabel: "Global conservation membership union",
    tagline: "Connecting recognised conservation knowledge, standards and expert networks.",
    primaryGeography: "Global membership union · Switzerland base",
    missionIds: ["SPECIES", "RE:WILD LAND", "RE:WILD MARINE"],
    methods: ["Scientific assessment", "Standards", "Expert commissions", "Convening", "Policy support"],
    ecosystems: ["Terrestrial", "Freshwater", "Marine", "Protected and conserved areas"],
    species: ["Threatened species represented through sourced assessments"],
    issues: ["Species decline", "Habitat loss", "Protected-area quality", "Environmental governance"],
    solutions: ["Assessment", "Conservation standards", "Expert networks", "Policy support"],
    collections: ["FEATURED", "SPECIES_AND_ECOSYSTEMS", "PLANETARY_DATA_AND_RESEARCH"],
    introduction: "IUCN connects governments, civil-society organisations and expert networks through a global conservation membership union, expert commissions, assessments, standards and programme work.",
    whyItMatters: "IUCN helps shape how species risk, protected places and conservation priorities are understood. Its value is connective: recognised assessments, standards and expert structures can be traced into the wider living system.",
    whatItMakesPossible: "A shared reference layer for species status, protected-area practice, expert knowledge and international conservation coordination.",
    whatItWorksOn: ["Species conservation", "Protected and conserved areas", "Ecosystem management", "Nature policy and environmental law"],
    howItWorks: ["Member-led governance", "Expert commissions", "Scientific assessment", "Standards, convening and programme delivery"],
    limitations: ["IUCN's global remit does not prove active programme work on every species or place.", "Headquarters must not be represented as the geography of IUCN's conservation work.", "Formal IUCN assessments, IUCN statements and 4PLANET interpretation must remain separate."],
    programmes: [
      programme("programme:iucn:red-list", "IUCN Red List of Threatened Species", "A recognised assessment system for species extinction risk. Individual assessment records remain the authoritative source.", ["iucn-about", "iucn-reports"]),
      programme("programme:iucn:commissions", "Expert commissions", "Networks including the Species Survival Commission and World Commission on Protected Areas.", ["iucn-governance", "iucn-members"]),
    ],
    geographies: [
      geo("geo:iucn:hq", "Gland, Switzerland", "HEADQUARTERS_REFERENCE", "Administrative headquarters reference only.", 6.15, 46.51, 5.2, "CITY_REFERENCE", ["iucn-about"]),
      geo("geo:iucn:global", "Global membership and programme reach", "OPERATING_GEOGRAPHY", "Generalised global relationship extent; not an invented programme polygon.", 10, 20, 1.4, "REGION", ["iucn-members"]),
    ],
    relationships: [
      relation("rel:iucn:species", "MISSION", "SPECIES_", ["iucn-about"], "/missions/species"),
      relation("rel:iucn:protected", "SOLUTION", "Protected and conserved areas", ["iucn-about"]),
    ],
    visualisation: { kind: "NETWORK", title: "A conservation union, not a single field programme.", caption: "Members, expert commissions, assessments and standards connect through distinct roles.", nodes: ["Members", "Expert commissions", "Assessments", "Standards", "Programmes"] },
    relatedActorIds: ["actor:p17:P17-A003", "actor:p17:P17-A006"],
    officialUrl: "https://iucn.org/",
    lastReviewed: "2026-08-05",
    founded: "1948",
    seo: {
      title: "IUCN — Conservation Union and Global Nature Authority | 4PLANET",
      description: "Explore IUCN's role in conservation standards, species assessment, protected areas, expert networks and official participation.",
      canonicalPath: "/actors/iucn",
      sameAs: ["https://iucn.org/"],
      areaServed: ["Global"],
      knowsAbout: ["Species assessment", "Protected areas", "Conservation standards", "Environmental law"],
      ogImage: og("iucn"),
    },
    claimStart: 1,
    identityClaim: "IUCN is a global membership union headquartered in Gland, Switzerland.",
    methodClaim: "IUCN combines member-led governance, expert commissions, assessment, standards, convening and programme work.",
    actionClaim: "People and institutions can use IUCN resources and explore eligible participation through official IUCN channels.",
    boundaryClaim: "A global remit or headquarters point must not be represented as proof of programme activity at every place.",
    sources: [
      ["iucn-about", "About IUCN", "https://iucn.org/about-iucn", "Official identity"],
      ["iucn-governance", "IUCN governance", "https://iucn.org/our-union/governance", "Official governance"],
      ["iucn-reports", "Corporate reports", "https://iucn.org/resources/corporate-reports", "Official reporting"],
      ["iucn-members", "IUCN members", "https://iucn.org/our-union/members", "Official network"],
    ],
    actions: [
      action("action:iucn:resources", "LEARN", "Explore IUCN knowledge and resources", "https://iucn.org/resources", "Official IUCN resources and assessments."),
      action("action:iucn:members", "PARTNER_OFFICIALLY", "Explore membership and participation", "https://iucn.org/our-union/members", "Official participation route; no 4PLANET relationship is implied."),
    ],
  }),
  buildProfile({
    id: "actor:p17:P17-A003",
    slug: "global-biodiversity-information-facility",
    name: "Global Biodiversity Information Facility",
    alternateName: "GBIF",
    actorType: "DATA_INFRASTRUCTURE",
    actorTypeLabel: "Biodiversity data infrastructure",
    tagline: "Making biodiversity records discoverable across institutions and borders.",
    primaryGeography: "Global participant network · Secretariat in Denmark",
    missionIds: ["SPECIES", "RE:WILD LAND", "RE:WILD MARINE", "CLIM4TE"],
    methods: ["Open data infrastructure", "Data standards", "APIs", "Participant nodes"],
    ecosystems: ["All ecosystems represented by contributing datasets"],
    species: ["Biodiversity occurrence records across taxa"],
    issues: ["Fragmented biodiversity data", "Low interoperability", "Uneven observation coverage"],
    solutions: ["Open data publishing", "Shared standards", "Participant nodes", "Reusable APIs"],
    collections: ["FEATURED", "SPECIES_AND_ECOSYSTEMS", "PLANETARY_DATA_AND_RESEARCH"],
    introduction: "GBIF is an international open-data infrastructure supported through participating countries and organisations. It provides access to biodiversity occurrence records while preserving dataset-level provenance, licensing and attribution.",
    whyItMatters: "GBIF makes dispersed biodiversity records discoverable through shared infrastructure. It is central to 4PLANET's species and Atlas architecture because a source record can travel without being mistaken for an ecological conclusion.",
    whatItMakesPossible: "Global discovery and responsible reuse of biodiversity records with dataset-level source, licence and attribution.",
    whatItWorksOn: ["Access to biodiversity occurrence data", "Interoperability between institutions and networks", "Data mobilisation through participant nodes"],
    howItWorks: ["Global data portal and API", "Publishing institutions and national nodes", "Shared technical standards", "Dataset-level licences and attribution"],
    limitations: ["Occurrence records do not establish complete range, abundance, population trend or live tracking.", "Every reused record must retain dataset-level licence and attribution.", "The Secretariat location is not GBIF's global operating geography."],
    programmes: [
      programme("programme:gbif:portal", "GBIF.org occurrence infrastructure", "Global discovery and access for occurrence records contributed by publishing institutions.", ["gbif-occurrence", "gbif-api"]),
      programme("programme:gbif:network", "Participant and node network", "A distributed governance and participation structure connecting countries, organisations, nodes and the Secretariat.", ["gbif-governance", "gbif-network"]),
    ],
    geographies: [
      geo("geo:gbif:secretariat", "Copenhagen, Denmark", "HEADQUARTERS_REFERENCE", "Secretariat reference only; GBIF is a distributed participant network.", 12.57, 55.68, 5.2, "CITY_REFERENCE", ["gbif-governance"]),
      geo("geo:gbif:network", "International participant network", "OPERATING_GEOGRAPHY", "Global network extent; record coverage remains uneven.", 10, 20, 1.4, "REGION", ["gbif-network"], "NONE"),
    ],
    relationships: [
      relation("rel:gbif:species", "MISSION", "SPECIES_", ["gbif-about"], "/missions/species"),
      relation("rel:gbif:atlas", "SOLUTION", "Source-aware biodiversity discovery", ["gbif-api"]),
    ],
    visualisation: { kind: "DATA_FLOW", title: "Records move. Provenance stays.", caption: "Publishing institutions connect through nodes, standards, datasets and APIs.", nodes: ["Publishers", "Participant nodes", "Datasets", "GBIF services", "Responsible reuse"] },
    relatedActorIds: ["actor:p17:P17-A001", "actor:p17:P17-A019"],
    officialUrl: "https://www.gbif.org/",
    lastReviewed: "2026-08-05",
    seo: {
      title: "GBIF — Global Biodiversity Data Infrastructure | 4PLANET",
      description: "Understand GBIF, its biodiversity data network, APIs, governance, occurrence records and responsible-use boundaries.",
      canonicalPath: "/actors/global-biodiversity-information-facility",
      sameAs: ["https://www.gbif.org/"],
      areaServed: ["Global participant network"],
      knowsAbout: ["Biodiversity occurrence data", "Data standards", "Open data publishing", "Species observations"],
      ogImage: og("global-biodiversity-information-facility"),
    },
    claimStart: 6,
    identityClaim: "GBIF is an international biodiversity data infrastructure with a Secretariat in Copenhagen, Denmark.",
    methodClaim: "GBIF connects publishers and participant nodes through shared standards, datasets, portals and APIs.",
    actionClaim: "Users can search, download and publish data under source-specific licences and participation rules.",
    boundaryClaim: "A GBIF occurrence record is not complete range, abundance, population trend or live tracking.",
    sources: [
      ["gbif-about", "What is GBIF?", "https://www.gbif.org/what-is-gbif", "Official identity"],
      ["gbif-governance", "GBIF governance", "https://www.gbif.org/governance", "Official governance"],
      ["gbif-network", "The GBIF network", "https://www.gbif.org/the-gbif-network", "Official network"],
      ["gbif-api", "GBIF developer documentation", "https://www.gbif.org/developer/summary", "Official technical documentation", "CONDITIONAL"],
      ["gbif-occurrence", "GBIF occurrence search", "https://www.gbif.org/occurrence/search", "Official data portal", "CONDITIONAL"],
      ["gbif-publish", "How to publish datasets", "https://www.gbif.org/how-to-publish-datasets", "Official participation"],
      ["gbif-terms", "GBIF terms", "https://www.gbif.org/terms", "Official terms", "CONDITIONAL"],
    ],
    actions: [
      action("action:gbif:explore", "EXPLORE_DATA", "Explore biodiversity records", "https://www.gbif.org/occurrence/search", "External exploration on GBIF.org; dataset-level terms apply."),
      action("action:gbif:publish", "LEARN", "Learn how to publish data", "https://www.gbif.org/how-to-publish-datasets", "Official guidance for eligible publishers."),
      action("action:gbif:api", "EXPLORE_DATA", "Open the GBIF API", "https://www.gbif.org/developer/summary", "Official technical documentation."),
    ],
  }),
  buildProfile({
    id: "actor:p17:P17-A006",
    slug: "wildlife-conservation-society",
    name: "Wildlife Conservation Society",
    alternateName: "WCS",
    actorType: "FIELD_CONSERVATION",
    actorTypeLabel: "Field conservation and science organisation",
    tagline: "Connecting long-term field conservation, science and public institutions.",
    primaryGeography: "Global programmes · New York base",
    missionIds: ["SPECIES", "RE:WILD LAND", "RE:WILD MARINE"],
    methods: ["Long-term field programmes", "Applied science", "Policy support", "Protected-area collaboration", "Education"],
    ecosystems: ["Terrestrial landscapes", "Freshwater systems", "Marine seascapes"],
    species: ["Wildlife linked to sourced WCS programmes"],
    issues: ["Species decline", "Habitat loss", "Wildlife trade", "Climate pressure"],
    solutions: ["Field science", "Protected-area support", "Training", "Policy", "Public education"],
    collections: ["FEATURED", "SPECIES_AND_ECOSYSTEMS", "FORESTS_AND_HABITATS", "OCEANS", "OFFICIAL_SUPPORT_AVAILABLE"],
    introduction: "WCS combines global field conservation and scientific research with a network of zoological institutions in New York, connecting wildlife-rich landscapes and seascapes with research, policy and public engagement.",
    whyItMatters: "WCS operates at several levels at once: species, landscapes, protected areas, science, governments and public institutions. Its profile demonstrates how one legal organisation can remain distinct from country programmes, facilities and local partners.",
    whatItMakesPossible: "Long-term conservation programmes that connect place-based field capacity with science, institutions and policy.",
    whatItWorksOn: ["Wildlife and habitat conservation", "Protected-area support", "Wildlife trade", "Climate adaptation and applied science"],
    howItWorks: ["Long-term country and regional programmes", "Research and monitoring", "Government and protected-area collaboration", "Training and public education"],
    limitations: ["A global programme portfolio does not prove active work at every place or on every species.", "Country programmes, zoological institutions and local partners must retain distinct identities.", "Organisation-reported outcomes remain labelled as such unless independently corroborated."],
    programmes: [
      programme("programme:wcs:field", "Global conservation programmes", "Long-term work in selected landscapes and seascapes. Individual programme relations require programme-level sources.", ["wcs-about", "wcs-impact"]),
      programme("programme:wcs:science", "Science and public institutions", "Research, publications and New York zoological institutions as distinct organisational facilities.", ["wcs-about", "wcs-financials"]),
    ],
    geographies: [
      geo("geo:wcs:hq", "Bronx, New York, United States", "HEADQUARTERS_REFERENCE", "Headquarters and institutional reference only.", -73.88, 40.85, 5.2, "CITY_REFERENCE", ["wcs-about"]),
      geo("geo:wcs:global", "Global programme portfolio", "OPERATING_GEOGRAPHY", "Generalised programme extent; country programmes and sites require separate source records.", 10, 10, 1.4, "REGION", ["wcs-impact"]),
    ],
    relationships: [
      relation("rel:wcs:species", "MISSION", "SPECIES_", ["wcs-about"], "/missions/species"),
      relation("rel:wcs:field-science", "SOLUTION", "Long-term field science", ["wcs-impact"]),
    ],
    visualisation: { kind: "GEOGRAPHY", title: "One organisation, many distinct programme relationships.", caption: "Headquarters, facilities, country programmes, partners and field sites are not interchangeable.", nodes: ["Organisation", "Facilities", "Country programmes", "Local partners", "Field sites"] },
    relatedActorIds: ["actor:p17:P17-A001", "actor:p17:P17-A013"],
    officialUrl: "https://www.wcs.org/",
    lastReviewed: "2026-08-05",
    founded: "1895",
    seo: {
      title: "Wildlife Conservation Society — Field Conservation and Science | 4PLANET",
      description: "Explore WCS, its global field programmes, science, protected-area support, reports and official support routes.",
      canonicalPath: "/actors/wildlife-conservation-society",
      sameAs: ["https://www.wcs.org/"],
      areaServed: ["Global programme portfolio"],
      knowsAbout: ["Wildlife conservation", "Protected areas", "Field science", "Wildlife trade"],
      ogImage: og("wildlife-conservation-society"),
    },
    claimStart: 11,
    identityClaim: "Wildlife Conservation Society is a United States nonprofit headquartered in the Bronx, New York.",
    methodClaim: "WCS combines long-term field programmes, science, policy support, protected-area collaboration and public education.",
    actionClaim: "People can donate, follow programmes and access research through official WCS channels.",
    boundaryClaim: "Organisation-wide remit must not be represented as a sourced project relationship for every species or place.",
    sources: [
      ["wcs-about", "About WCS", "https://www.wcs.org/about-us", "Official identity"],
      ["wcs-financials", "WCS financials", "https://www.wcs.org/about-us/financials", "Official reporting"],
      ["wcs-impact", "WCS impact report", "https://www.wcs.org/about-us/impact-report", "Official reporting"],
      ["wcs-legal", "Charitable solicitation statement", "https://www.wcs.org/legal/charitable-solicitation-statement", "Official legal information"],
    ],
    actions: [
      action("action:wcs:donate", "DONATE", "Support WCS through its official website", "https://www.wcs.org/support-wcs", "External official support route."),
      action("action:wcs:learn", "LEARN", "Explore WCS conservation work", "https://www.wcs.org/our-work", "Official overview of programmes and themes."),
      action("action:wcs:research", "FOLLOW", "Read reports and research", "https://www.wcs.org/about-us/impact-report", "Official reporting."),
    ],
  }),
  buildProfile({
    id: "actor:p17:P17-A009",
    slug: "whale-and-dolphin-conservation",
    name: "Whale and Dolphin Conservation",
    alternateName: "WDC",
    actorType: "SPECIALIST_CONSERVATION",
    actorTypeLabel: "Specialist cetacean conservation organisation",
    tagline: "Working for whales, dolphins and porpoises through research, policy and public action.",
    primaryGeography: "International work · UK parent charity",
    missionIds: ["WH4LES", "SPECIES", "RE:WILD MARINE"],
    methods: ["Research", "Advocacy", "Policy", "Campaigns", "Field projects", "Education"],
    ecosystems: ["Marine and coastal ecosystems"],
    species: ["Whales", "Dolphins", "Porpoises"],
    issues: ["Bycatch", "Commercial hunting", "Captivity", "Ship strikes", "Underwater noise", "Habitat degradation"],
    solutions: ["Research", "Policy change", "Protected habitat", "Campaigns", "Rescue and education"],
    collections: ["FEATURED", "OCEANS", "SPECIES_AND_ECOSYSTEMS", "OFFICIAL_SUPPORT_AVAILABLE"],
    introduction: "WDC is a specialist organisation focused on whales, dolphins and porpoises, working across research, policy, campaigns, field projects and public education.",
    whyItMatters: "A specialist profile can connect specific cetacean pressures to relevant work without flattening them into a generic ocean category. Regional entities and programmes must remain legally and geographically distinct.",
    whatItMakesPossible: "Focused public understanding and action around the pressures affecting whales, dolphins and porpoises.",
    whatItWorksOn: ["Cetacean protection", "Bycatch reduction", "Ending commercial hunting and captivity", "Protected habitat and policy"],
    howItWorks: ["Research and field projects", "Advocacy and policy", "Campaigns and partnerships", "Education and public engagement"],
    limitations: ["The organisation's general remit does not prove active work on every cetacean population.", "The UK parent and related regional entities must not be presented as one undifferentiated legal entity.", "Symbolic adoption is support, not ownership or proof of protection of an individual animal."],
    programmes: [
      programme("programme:wdc:bycatch", "Bycatch reduction", "Research, policy and collaboration addressing accidental capture. Jurisdiction-specific claims require sources.", ["wdc-goals", "wdc-reviews"]),
      programme("programme:wdc:protection", "Whale and dolphin protection", "Campaign and policy themes across hunting, captivity, habitat and ocean pressures.", ["wdc-goals", "wdc-support"]),
    ],
    geographies: [
      geo("geo:wdc:uk", "United Kingdom parent charity", "HEADQUARTERS_REFERENCE", "Generalised parent-entity reference; regional organisations are separate relationships.", -1.5, 52.3, 4.5, "COUNTRY", ["wdc-registry"]),
      geo("geo:wdc:international", "International programme and campaign reach", "OPERATING_GEOGRAPHY", "Broad remit only; programme and policy geographies require separate sources.", -20, 25, 1.5, "REGION", ["wdc-goals"]),
    ],
    relationships: [
      relation("rel:wdc:whales", "MISSION", "WH4LES_", ["wdc-goals"], "/missions/wh4les"),
      relation("rel:wdc:bycatch", "ISSUE", "Bycatch", ["wdc-goals"]),
    ],
    visualisation: { kind: "SPECIES_SYSTEM", title: "Specialist attention across connected pressures.", caption: "Species, populations, jurisdictions and threats require specific programme evidence.", nodes: ["Cetaceans", "Bycatch", "Hunting", "Noise", "Protected habitat"] },
    relatedActorIds: ["actor:p17:P17-A001", "actor:p17:P17-A012"],
    officialUrl: "https://whales.org/",
    lastReviewed: "2026-08-05",
    seo: {
      title: "Whale and Dolphin Conservation — Cetacean Protection | 4PLANET",
      description: "Explore WDC's work on whales, dolphins and porpoises, including research, bycatch, policy, campaigns and support.",
      canonicalPath: "/actors/whale-and-dolphin-conservation",
      sameAs: ["https://whales.org/"],
      areaServed: ["International"],
      knowsAbout: ["Cetaceans", "Bycatch", "Whaling", "Marine protected areas"],
      ogImage: og("whale-and-dolphin-conservation"),
    },
    claimStart: 16,
    identityClaim: "Whale and Dolphin Conservation is a UK registered charity and company with related international entities.",
    methodClaim: "WDC works through research, advocacy, policy, campaigns, field projects, partnerships and education.",
    actionClaim: "People can donate, participate in campaigns and follow regional work through official WDC channels.",
    boundaryClaim: "A broad cetacean remit does not prove programme activity for every species, population or geography.",
    sources: [
      ["wdc-reviews", "WDC annual reviews", "https://whales.org/who-we-are/annual-reviews/", "Official reporting"],
      ["wdc-registry", "UK Charity Commission record", "https://register-of-charities.charitycommission.gov.uk/charity-search/-/charity-details/1014705", "Public registry"],
      ["wdc-goals", "WDC goals", "https://whales.org/our-goals/", "Official programme"],
      ["wdc-support", "Support WDC", "https://whales.org/support/", "Official action"],
    ],
    actions: [
      action("action:wdc:support", "DONATE", "Support WDC through official channels", "https://whales.org/support/", "External official support route."),
      action("action:wdc:goals", "LEARN", "Explore WDC's goals", "https://whales.org/our-goals/", "Official programme overview."),
      action("action:wdc:follow", "FOLLOW", "Read annual reviews", "https://whales.org/who-we-are/annual-reviews/", "Official reporting."),
    ],
  }),
  buildProfile({
    id: "actor:p17:P17-A011",
    slug: "coral-restoration-foundation",
    name: "Coral Restoration Foundation",
    legalName: "The Coral Restoration Foundation, Inc.",
    actorType: "RESTORATION_OPERATOR",
    actorTypeLabel: "Coral restoration field organisation",
    tagline: "Growing, outplanting and monitoring corals while keeping activity and outcome distinct.",
    primaryGeography: "Florida Keys and US Virgin Islands",
    missionIds: ["COR4L", "SPECIES", "RE:WILD MARINE"],
    methods: ["Coral nurseries", "Propagation", "Outplanting", "Monitoring", "Research", "Training"],
    ecosystems: ["Coral reefs", "Coastal marine ecosystems"],
    species: ["Reef-building corals linked to sourced programmes"],
    issues: ["Coral decline", "Ocean heat stress", "Water quality", "Habitat degradation"],
    solutions: ["Coral propagation", "Outplanting", "Monitoring", "Restoration science", "Education"],
    collections: ["FEATURED", "OCEANS", "SPECIES_AND_ECOSYSTEMS", "OFFICIAL_SUPPORT_AVAILABLE"],
    introduction: "Coral Restoration Foundation specialises in coral propagation, outplanting, monitoring, research, education and volunteer engagement.",
    whyItMatters: "CRF is a strong field example for COR4L_ and an important truth test. Corals grown or outplanted are documented activities; they are not automatically proof of recovered reef ecosystems or long-term ecological outcome.",
    whatItMakesPossible: "A visible chain from restoration activity through monitoring toward later ecological evidence.",
    whatItWorksOn: ["Coral nurseries", "Restoration and monitoring", "Restoration science", "Education and public participation"],
    howItWorks: ["Land- and ocean-based nursery systems", "Propagation and outplanting", "Monitoring and research", "Training and volunteer programmes"],
    limitations: ["Outplanting is an activity, not automatic proof of reef recovery or long-term survival.", "Headquarters, exploration centres, nurseries and restoration sites are distinct geographic roles.", "Activity figures require report period, method and limitations."],
    programmes: [
      programme("programme:crf:florida", "Florida Keys restoration", "Nursery, outplanting and monitoring work in the Florida Keys. Site-level claims require programme sources.", ["crf-where", "crf-reports"]),
      programme("programme:crf:participation", "Training and public participation", "Official education, dive and volunteer routes subject to eligibility and safety requirements.", ["crf-involved", "crf-where"]),
    ],
    geographies: [
      geo("geo:crf:hq", "Tavernier, Florida, United States", "HEADQUARTERS_REFERENCE", "Organisational and facility reference only.", -80.52, 25.01, 7, "CITY_REFERENCE", ["crf-disclosure"]),
      geo("geo:crf:florida-keys", "Florida Keys programme region", "PROGRAMME_GEOGRAPHY", "Generalised programme geography; exact restoration sites remain separately sourced.", -81.2, 24.7, 6.2, "REGION", ["crf-where"], "GENERALISED"),
      geo("geo:crf:usvi", "US Virgin Islands programme region", "PROGRAMME_GEOGRAPHY", "Generalised region-level reference.", -64.8, 17.75, 7, "REGION", ["crf-where"], "GENERALISED"),
    ],
    relationships: [
      relation("rel:crf:coral", "MISSION", "COR4L_", ["crf-where"], "/missions/cor4l"),
      relation("rel:crf:restoration", "SOLUTION", "Coral restoration and monitoring", ["crf-where"]),
    ],
    visualisation: { kind: "DATA_FLOW", title: "Activity → monitoring → later ecological evidence.", caption: "The interface never collapses outplanting, survival, reef condition and system impact.", nodes: ["Nursery", "Outplanting", "Monitoring", "Survival evidence", "Ecosystem learning"] },
    relatedActorIds: ["actor:p17:P17-A001", "actor:p17:P17-A006"],
    officialUrl: "https://coralrestoration.org/",
    lastReviewed: "2026-08-05",
    seo: {
      title: "Coral Restoration Foundation — Coral Restoration and Monitoring | 4PLANET",
      description: "Explore Coral Restoration Foundation's nurseries, outplanting, monitoring, reports, locations and support routes.",
      canonicalPath: "/actors/coral-restoration-foundation",
      sameAs: ["https://coralrestoration.org/"],
      areaServed: ["Florida Keys", "US Virgin Islands"],
      knowsAbout: ["Coral restoration", "Coral nurseries", "Outplanting", "Monitoring"],
      ogImage: og("coral-restoration-foundation"),
    },
    claimStart: 21,
    identityClaim: "The Coral Restoration Foundation, Inc. is a US 501(c)(3) headquartered in Tavernier, Florida.",
    methodClaim: "CRF uses nursery systems, coral propagation, outplanting, monitoring, research, training and participation.",
    actionClaim: "People can donate and access official participation routes subject to programme, eligibility and safety requirements.",
    boundaryClaim: "Coral propagation or outplanting must not be presented as automatic proof of long-term reef recovery.",
    sources: [
      ["crf-reports", "Annual reports and financials", "https://coralrestoration.org/annual-reports-financials/", "Official reporting"],
      ["crf-disclosure", "Charitable solicitations disclosure", "https://coralrestoration.org/charitable-solicitations-disclosure/", "Official legal information"],
      ["crf-where", "Where we work", "https://coralrestoration.org/where-we-work/", "Official programme"],
      ["crf-involved", "Get involved", "https://coralrestoration.org/get-involved/", "Official action"],
    ],
    actions: [
      action("action:crf:donate", "DONATE", "Support coral restoration through CRF", "https://coralrestoration.org/donate/", "External official support route."),
      action("action:crf:participate", "LEARN", "Explore participation routes", "https://coralrestoration.org/get-involved/", "Official eligibility and participation information."),
      action("action:crf:reports", "FOLLOW", "Read reports and financials", "https://coralrestoration.org/annual-reports-financials/", "Official reporting."),
    ],
  }),
  buildProfile({
    id: "actor:p17:P17-A012",
    slug: "global-fishing-watch",
    name: "Global Fishing Watch",
    legalName: "Global Fishing Watch, Inc.",
    actorType: "DATA_ACCOUNTABILITY",
    actorTypeLabel: "Ocean data and transparency nonprofit",
    tagline: "Making human activity at sea more visible through open data and machine learning.",
    primaryGeography: "Global data coverage and partnerships",
    missionIds: ["RE:WILD MARINE", "WH4LES", "SPECIES"],
    methods: ["Satellite data", "Vessel data", "Machine learning", "Open datasets", "APIs", "Research"],
    ecosystems: ["Marine and coastal systems"],
    species: ["Indirect links through sourced fisheries, place and pressure relationships"],
    issues: ["Overfishing", "Low vessel transparency", "Marine protected-area pressure", "Data ethics"],
    solutions: ["Open ocean data", "Vessel activity analysis", "Research", "Government and NGO collaboration"],
    collections: ["FEATURED", "OCEANS", "PLANETARY_DATA_AND_RESEARCH"],
    introduction: "Global Fishing Watch uses satellite data, vessel information, machine learning and open tools to make human activity at sea more visible. Its map, datasets and research support ocean governance, science and accountability.",
    whyItMatters: "Global Fishing Watch is both a high-value actor profile and a potential data relationship for 4PLANET. Its methods can make patterns visible, but apparent fishing effort or a modelled detection is not automatically evidence of illegality, ownership or intent.",
    whatItMakesPossible: "Open exploration of maritime activity with explicit methods, versions and limitations.",
    whatItWorksOn: ["Vessel activity and fisheries transparency", "Marine protected-area support", "Research and maritime intelligence", "Data ethics and policy capacity"],
    howItWorks: ["Satellite imagery and AIS or other vessel data", "Machine-learning models", "Open datasets and APIs", "Research and collaboration"],
    limitations: ["Apparent fishing effort or a modelled vessel detection is not automatic evidence of illegal fishing.", "Organisational location, partner countries, training programmes and detected vessels are different geographic concepts.", "Dataset methods, versions and limitations must accompany every 4PLANET use."],
    programmes: [
      programme("programme:gfw:platform", "Global Fishing Watch platform", "Open map and data tools for exploring maritime activity. Data products remain separate source-aware layers.", ["gfw-data", "gfw-report"]),
      programme("programme:gfw:research", "Research and policy programmes", "Research, transparency and capacity work connected to fisheries and ocean governance.", ["gfw-report", "gfw-financials"]),
    ],
    geographies: [
      geo("geo:gfw:us", "United States organisational reference", "HEADQUARTERS_REFERENCE", "Country-level legal-entity reference; not the geography of data coverage.", -98, 39, 3, "COUNTRY", ["gfw-registry"]),
      geo("geo:gfw:global", "Global data coverage", "OPERATING_GEOGRAPHY", "Global data extent. Detected vessels are observations, not Global Fishing Watch operating sites.", 0, 10, 1.3, "REGION", ["gfw-data"], "NONE"),
    ],
    relationships: [
      relation("rel:gfw:marine", "MISSION", "RE:WILD MARINE_", ["gfw-data"], "/missions/4ntarctica"),
      relation("rel:gfw:transparency", "SOLUTION", "Ocean transparency", ["gfw-data"]),
    ],
    visualisation: { kind: "DATA_FLOW", title: "From signals at sea to inspectable public intelligence.", caption: "Data sources, models, activity estimates and interpretation remain separate.", nodes: ["Satellite and vessel data", "Models", "Versioned datasets", "Open tools", "Human interpretation"] },
    relatedActorIds: ["actor:p17:P17-A009", "actor:p17:P17-A019"],
    officialUrl: "https://globalfishingwatch.org/",
    lastReviewed: "2026-08-05",
    seo: {
      title: "Global Fishing Watch — Open Ocean Activity Intelligence | 4PLANET",
      description: "Explore Global Fishing Watch, its ocean transparency tools, vessel data, reporting and apparent-activity limitations.",
      canonicalPath: "/actors/global-fishing-watch",
      sameAs: ["https://globalfishingwatch.org/"],
      areaServed: ["Global data coverage"],
      knowsAbout: ["Vessel activity", "Fisheries transparency", "Satellite data", "Marine governance"],
      ogImage: og("global-fishing-watch"),
    },
    claimStart: 26,
    identityClaim: "Global Fishing Watch, Inc. is a United States 501(c)(3) nonprofit.",
    methodClaim: "Global Fishing Watch combines satellite and vessel data, machine learning, open tools, research and collaboration.",
    actionClaim: "People can explore official data products, methods, research and support routes through Global Fishing Watch.",
    boundaryClaim: "Modelled vessel activity or apparent fishing effort is not automatic evidence of illegal fishing, ownership or intent.",
    sources: [
      ["gfw-report", "2025 annual report", "https://globalfishingwatch.org/annual-report-2025/", "Official reporting"],
      ["gfw-financials", "Financials", "https://globalfishingwatch.org/financials/", "Official reporting"],
      ["gfw-data", "Datasets and code", "https://globalfishingwatch.org/datasets-and-code/", "Official technical information", "CONDITIONAL"],
      ["gfw-registry", "ProPublica nonprofit record", "https://projects.propublica.org/nonprofits/organizations/815461345", "Public registry"],
    ],
    actions: [
      action("action:gfw:data", "EXPLORE_DATA", "Explore datasets and code", "https://globalfishingwatch.org/datasets-and-code/", "Official data and technical information."),
      action("action:gfw:reports", "FOLLOW", "Read the annual report", "https://globalfishingwatch.org/annual-report-2025/", "Official reporting."),
      action("action:gfw:contact", "CONTACT", "Contact Global Fishing Watch", "https://globalfishingwatch.org/contact-us/", "Official contact route."),
    ],
  }),
  buildProfile({
    id: "actor:p17:P17-A013",
    slug: "panthera",
    name: "Panthera",
    actorType: "SPECIALIST_CONSERVATION",
    actorTypeLabel: "Wild-cat conservation organisation",
    tagline: "Protecting wild cats by connecting species science, landscapes and local action.",
    primaryGeography: "Wild-cat range programmes · United States base",
    missionIds: ["SPECIES", "RE:WILD LAND"],
    methods: ["Species science", "Landscape programmes", "Monitoring", "Local partnerships", "Conflict mitigation", "Policy"],
    ecosystems: ["Wild-cat landscapes and connected habitats"],
    species: ["Wild cat species linked to sourced programmes"],
    issues: ["Habitat loss", "Fragmentation", "Human–wildlife conflict", "Wildlife crime", "Prey decline"],
    solutions: ["Monitoring", "Corridor protection", "Conflict mitigation", "Anti-poaching", "Policy", "Local partnerships"],
    collections: ["FEATURED", "SPECIES_AND_ECOSYSTEMS", "FORESTS_AND_HABITATS", "OFFICIAL_SUPPORT_AVAILABLE"],
    introduction: "Panthera focuses on the world's wild cat species and the ecosystems that support them, combining species science with landscape programmes, local partnerships, conflict mitigation, anti-poaching and policy.",
    whyItMatters: "Panthera demonstrates how one specialist organisation can connect across multiple species, places, threats and solutions without flattening the work into one universal intervention.",
    whatItMakesPossible: "A route from individual species understanding to the landscapes, communities and pressures shaping their survival.",
    whatItWorksOn: ["Wild-cat conservation", "Habitat connectivity and prey systems", "Human–wildlife conflict", "Wildlife crime and policy"],
    howItWorks: ["Species and landscape science", "Monitoring and corridor protection", "Local partnerships and conflict mitigation", "Anti-poaching and policy engagement"],
    limitations: ["A general mission statement does not prove active work on every wild-cat population.", "Each programme geography and field site must be separately sourced.", "Sensitive species locations must be generalised or withheld."],
    programmes: [
      programme("programme:panthera:cats", "Wild-cat programmes", "Species and landscape programmes presented only when current programme sources support the relationship.", ["panthera-programmes", "panthera-science"]),
      programme("programme:panthera:science", "Conservation science", "Research and monitoring supporting species and landscape decisions.", ["panthera-science", "panthera-reports"]),
    ],
    geographies: [
      geo("geo:panthera:us", "United States organisational reference", "HEADQUARTERS_REFERENCE", "Country-level organisational reference only.", -98, 39, 3, "COUNTRY", ["panthera-mission"]),
      geo("geo:panthera:ranges", "Wild-cat programme ranges", "OPERATING_GEOGRAPHY", "Generalised global range-programme context; no exact sensitive sites.", 25, 10, 1.5, "REGION", ["panthera-programmes"], "RESTRICTED"),
    ],
    relationships: [
      relation("rel:panthera:species", "MISSION", "SPECIES_", ["panthera-programmes"], "/missions/species"),
      relation("rel:panthera:corridors", "SOLUTION", "Landscape connectivity", ["panthera-science"]),
    ],
    visualisation: { kind: "SPECIES_SYSTEM", title: "Species connect to landscapes, pressures and people.", caption: "Each programme relationship remains source-specific and sensitive locations remain protected.", nodes: ["Wild cats", "Prey and habitat", "Corridors", "Communities", "Policy and protection"] },
    relatedActorIds: ["actor:p17:P17-A006", "actor:p17:P17-A001"],
    officialUrl: "https://panthera.org/",
    lastReviewed: "2026-08-05",
    seo: {
      title: "Panthera — Wild Cat Conservation and Science | 4PLANET",
      description: "Explore Panthera's wild-cat programmes, science, landscapes, official reports and support routes.",
      canonicalPath: "/actors/panthera",
      sameAs: ["https://panthera.org/"],
      areaServed: ["Wild-cat range programmes"],
      knowsAbout: ["Wild cats", "Landscape connectivity", "Human–wildlife conflict", "Conservation science"],
      ogImage: og("panthera"),
    },
    claimStart: 31,
    identityClaim: "Panthera is a United States nonprofit conservation organisation specialising in wild cats.",
    methodClaim: "Panthera combines species and landscape science, monitoring, partnerships, conflict mitigation, anti-poaching and policy.",
    actionClaim: "People can donate and follow official wild-cat programmes through Panthera's own channels.",
    boundaryClaim: "A global wild-cat mission does not prove active work on every species, population or exact location.",
    sources: [
      ["panthera-mission", "Panthera mission", "https://panthera.org/our-mission", "Official identity"],
      ["panthera-reports", "Reports and financials", "https://www.panthera.org/reports-and-financials", "Official reporting"],
      ["panthera-programmes", "Cat programmes", "https://panthera.org/cat-programs", "Official programme"],
      ["panthera-science", "Conservation science", "https://panthera.org/conservation-science", "Official research"],
    ],
    actions: [
      action("action:panthera:donate", "DONATE", "Support Panthera through its official website", "https://panthera.org/donate", "External official support route."),
      action("action:panthera:programmes", "LEARN", "Explore wild-cat programmes", "https://panthera.org/cat-programs", "Official programme information."),
      action("action:panthera:reports", "FOLLOW", "Read reports and financials", "https://www.panthera.org/reports-and-financials", "Official reporting."),
    ],
  }),
  buildProfile({
    id: "actor:p17:P17-A015",
    slug: "world-land-trust",
    name: "World Land Trust",
    actorType: "FIELD_CONSERVATION",
    actorTypeLabel: "Partner-led land conservation charity",
    tagline: "Helping local conservation partners protect threatened habitats.",
    primaryGeography: "Global partner network · UK base",
    missionIds: ["RE:WILD LAND", "AM4ZONIA", "SPECIES", "CLIM4TE"],
    methods: ["Partner-led land protection", "Land acquisition", "Reserve management", "Restoration"],
    ecosystems: ["Tropical forest", "Dry forest", "Wetlands", "Threatened terrestrial habitats"],
    species: ["Habitat-dependent threatened species"],
    issues: ["Habitat loss", "Deforestation", "Fragmentation", "Underfunded local conservation"],
    solutions: ["Permanent habitat protection", "Local partner finance", "Restoration", "Long-term stewardship"],
    collections: ["FEATURED", "FORESTS_AND_HABITATS", "SPECIES_AND_ECOSYSTEMS", "OFFICIAL_SUPPORT_AVAILABLE"],
    introduction: "World Land Trust raises funds to help local conservation partners secure and manage threatened habitats, centring partner-led land protection rather than presenting conservation as work owned by the funder.",
    whyItMatters: "The idea of funding land protection is simple and powerful. The profile keeps the partner, place, legal mechanism, project economics and long-term stewardship visible so that simplicity does not become a misleading universal area claim.",
    whatItMakesPossible: "Global funding can strengthen locally executed habitat protection while local organisations retain identity, ownership and operational agency.",
    whatItWorksOn: ["Threatened habitats facing conversion or fragmentation", "Funding gaps for local conservation organisations", "Long-term protection and restoration"],
    howItWorks: ["Official fundraising programmes", "Local conservation partners", "Land acquisition and reserve creation", "Management, restoration and reporting"],
    limitations: ["A donation is not automatically a transferable 4PLANET land unit.", "Land title, ownership, management responsibility and ecological outcomes must be assessed project by project.", "The UK office is not the location of protected land."],
    programmes: [
      programme("programme:wlt:buy-an-acre", "Buy an Acre", "An official fundraising route supporting eligible partner projects. Project terms and area economics vary.", ["wlt-action", "wlt-faq"]),
      programme("programme:wlt:action-fund", "Action Fund", "Flexible official funding for conservation needs identified through World Land Trust and its partners.", ["wlt-action", "wlt-method"]),
    ],
    geographies: [
      geo("geo:wlt:hq", "Halesworth, United Kingdom", "HEADQUARTERS_REFERENCE", "Administrative reference only.", 1.5, 52.34, 5.4, "CITY_REFERENCE", ["wlt-about"]),
      geo("geo:wlt:global-partners", "Global partner-led conservation portfolio", "OPERATING_GEOGRAPHY", "Broad partner geography; exact project sites require separate records.", -20, 0, 1.5, "REGION", ["wlt-partners"]),
    ],
    relationships: [
      relation("rel:wlt:rewild", "MISSION", "RE:WILD LAND_", ["wlt-method"], "/missions/rewild"),
      relation("rel:wlt:habitat", "SOLUTION", "Partner-led habitat protection", ["wlt-partners"]),
    ],
    visualisation: { kind: "GEOGRAPHY", title: "Funding, legal protection and local stewardship remain distinct.", caption: "The model highlights partner organisations and project-specific land relationships.", nodes: ["Supporters", "World Land Trust", "Local partner", "Protected place", "Long-term stewardship"] },
    relatedActorIds: ["actor:p17:P17-A016", "actor:p17:P17-A001"],
    officialUrl: "https://www.worldlandtrust.org/",
    lastReviewed: "2026-08-05",
    seo: {
      title: "World Land Trust — Partner-Led Land Protection | 4PLANET",
      description: "Explore World Land Trust's partner-led land protection model, reports, official appeals and area-claim boundaries.",
      canonicalPath: "/actors/world-land-trust",
      sameAs: ["https://www.worldlandtrust.org/"],
      areaServed: ["Global partner network"],
      knowsAbout: ["Habitat protection", "Land acquisition", "Restoration", "Local conservation partnerships"],
      ogImage: og("world-land-trust"),
    },
    claimStart: 36,
    identityClaim: "World Land Trust is a United Kingdom registered conservation charity.",
    methodClaim: "World Land Trust raises funds and supports local partners with acquisition, protection, restoration and management.",
    actionClaim: "People can donate to official appeals and programmes through World Land Trust's own channels.",
    boundaryClaim: "Prices, area, legal title, permanence and governance must not be generalised across land-protection projects.",
    sources: [
      ["wlt-about", "About World Land Trust", "https://www.worldlandtrust.org/about-us/", "Official identity"],
      ["wlt-report", "Annual report and accounts", "https://www.worldlandtrust.org/annual-report-accounts/", "Official reporting"],
      ["wlt-method", "What we do", "https://www.worldlandtrust.org/what-we-do/", "Official programme"],
      ["wlt-partners", "Conservation partners", "https://www.worldlandtrust.org/who-we-are-2/partners/", "Official partner directory"],
      ["wlt-action", "Official donation routes", "https://www.worldlandtrust.org/donate/", "Official action"],
      ["wlt-faq", "World Land Trust FAQs", "https://www.worldlandtrust.org/faqs/", "Official boundary information"],
    ],
    actions: [
      action("action:wlt:donate", "DONATE", "Support through World Land Trust", "https://www.worldlandtrust.org/donate/", "External action on the organisation's official website."),
      action("action:wlt:learn", "LEARN", "Explore how land protection works", "https://www.worldlandtrust.org/what-we-do/", "Official programme information."),
      action("action:wlt:partners", "PARTNER_OFFICIALLY", "Explore conservation partners", "https://www.worldlandtrust.org/who-we-are-2/partners/", "Official partner directory; no 4PLANET relationship is implied."),
    ],
  }),
  buildProfile({
    id: "actor:p17:P17-A016",
    slug: "rainforest-foundation-norway",
    name: "Rainforest Foundation Norway",
    legalName: "Regnskogfondet",
    actorType: "RIGHTS_BASED_NGO",
    actorTypeLabel: "Rights-based and locally partnered organisation",
    tagline: "Supporting locally led protection of tropical forests and Indigenous rights.",
    primaryGeography: "Tropical forest partner regions · Norway base",
    missionIds: ["AM4ZONIA", "RE:WILD LAND", "SPECIES", "CLIM4TE"],
    methods: ["Long-term local partnerships", "Indigenous rights", "Policy", "Corporate accountability"],
    ecosystems: ["Amazon rainforest", "Congo Basin forests", "Southeast Asian rainforests", "Tropical forest landscapes"],
    species: ["Forest-dependent species linked through sourced places and programmes"],
    issues: ["Deforestation", "Extractive pressure", "Weak land rights", "Harmful finance and supply chains"],
    solutions: ["Rights-based forest protection", "Partner support", "Territorial governance", "Policy change"],
    collections: ["FEATURED", "FORESTS_AND_HABITATS", "INDIGENOUS_AND_LOCAL_LEADERSHIP", "OFFICIAL_SUPPORT_AVAILABLE"],
    introduction: "Rainforest Foundation Norway works to protect tropical forests and strengthen the rights of Indigenous peoples and forest communities through long-term partnerships, territorial rights, policy, finance and supply-chain accountability.",
    whyItMatters: "Forest protection is not simply a tree or hectare count. Rights, governance, local legitimacy and partner capacity shape whether protection can endure, and local and Indigenous organisations must remain visible as decision-makers and implementers.",
    whatItMakesPossible: "Long-term support for locally led forest protection, rights and governance without absorbing partner agency into the identity of a Northern organisation.",
    whatItWorksOn: ["Tropical forest protection", "Indigenous and community rights", "Land tenure", "Policy, finance and corporate accountability"],
    howItWorks: ["Long-term partner support", "Rights-based protection and territorial governance", "Policy, monitoring and research", "Corporate and financial accountability"],
    limitations: ["Partner-led or Indigenous-led work must not be presented as owned or executed solely by Rainforest Foundation Norway.", "Programme outcomes need region- and partner-specific evidence.", "A donation does not imply protection of a fixed area without programme-specific terms."],
    programmes: [
      programme("programme:rfn:partner-model", "Long-term partner support", "Support for local and Indigenous organisations working on forest protection, rights and governance.", ["rfn-method", "rfn-work"]),
      programme("programme:rfn:policy", "Policy and accountability", "Work addressing policy, finance and supply-chain drivers connected to tropical forest loss.", ["rfn-method", "rfn-publications"]),
    ],
    geographies: [
      geo("geo:rfn:hq", "Oslo, Norway", "HEADQUARTERS_REFERENCE", "Administrative reference only; not a proxy for tropical field activity.", 10.75, 59.91, 5.3, "CITY_REFERENCE", ["rfn-about"]),
      geo("geo:rfn:tropics", "Tropical forest partner regions", "PARTNER_GEOGRAPHY", "Broad consent-aware partner geography; exact territories and organisations require specific records.", -55, -4, 1.7, "REGION", ["rfn-work"], "RESTRICTED"),
    ],
    relationships: [
      relation("rel:rfn:amazonia", "MISSION", "AM4ZONIA_", ["rfn-work"], "/missions/am4zonia"),
      relation("rel:rfn:rights", "SOLUTION", "Rights-based forest protection", ["rfn-method"]),
    ],
    visualisation: { kind: "NETWORK", title: "Protection follows rights, relationships and local authority.", caption: "Partners remain visible as decision-makers and implementers.", nodes: ["Indigenous and local partners", "Territorial rights", "Forest governance", "Policy and accountability", "Long-term support"] },
    relatedActorIds: ["actor:p17:P17-A015", "actor:p17:P17-A001"],
    officialUrl: "https://www.regnskog.no/en",
    lastReviewed: "2026-08-05",
    seo: {
      title: "Rainforest Foundation Norway — Forest Protection and Indigenous Rights | 4PLANET",
      description: "Explore Rainforest Foundation Norway's rights-based forest work, local partnerships, governance and official support.",
      canonicalPath: "/actors/rainforest-foundation-norway",
      sameAs: ["https://www.regnskog.no/en"],
      areaServed: ["Tropical forest partner regions"],
      knowsAbout: ["Tropical forests", "Indigenous rights", "Land rights", "Corporate accountability"],
      ogImage: og("rainforest-foundation-norway"),
    },
    claimStart: 41,
    identityClaim: "Rainforest Foundation Norway is a Norwegian organisation working internationally through long-term partner relationships.",
    methodClaim: "The organisation combines partner support, rights-based protection, policy, monitoring, research and accountability.",
    actionClaim: "People can donate, follow campaigns and access reports through official Rainforest Foundation Norway channels.",
    boundaryClaim: "Local and Indigenous work must remain attributed to the organisations and rights-holders leading and executing it.",
    sources: [
      ["rfn-about", "About Rainforest Foundation Norway", "https://www.regnskog.no/en/about-rainforest-foundation-norway", "Official identity"],
      ["rfn-reports", "Annual reports", "https://www.regnskog.no/en/about-rainforest-foundation-norway/annual-reports", "Official reporting"],
      ["rfn-method", "What we do", "https://www.regnskog.no/en/what-we-do", "Official programme"],
      ["rfn-work", "Our work", "https://www.regnskog.no/en/our-work", "Official programme"],
      ["rfn-support", "Support us", "https://www.regnskog.no/en/support-us", "Official action"],
      ["rfn-publications", "Publications", "https://www.regnskog.no/en/publications", "Official research and reporting"],
    ],
    actions: [
      action("action:rfn:donate", "DONATE", "Support through Rainforest Foundation Norway", "https://www.regnskog.no/en/support-us", "External official support route."),
      action("action:rfn:learn", "LEARN", "Understand the partner-led model", "https://www.regnskog.no/en/what-we-do", "Official description of its rights-based approach."),
      action("action:rfn:reports", "FOLLOW", "Read reports and publications", "https://www.regnskog.no/en/publications", "Official research and reporting."),
    ],
  }),
  buildProfile({
    id: "actor:p17:P17-A019",
    slug: "climate-trace",
    name: "Climate TRACE",
    actorType: "COALITION",
    actorTypeLabel: "Open emissions data coalition",
    tagline: "Building open, frequently updated intelligence about global emissions.",
    primaryGeography: "Global data coverage · distributed coalition",
    missionIds: ["CLIM4TE", "EN4RGY"],
    methods: ["Satellite observations", "Sensors", "Public and commercial data", "Modelling", "Machine learning"],
    ecosystems: ["Indirect connections through climate and air-pollution pressures"],
    species: ["No direct field-species remit"],
    issues: ["Greenhouse-gas emissions", "Air pollution", "Low asset-level transparency", "Data uncertainty"],
    solutions: ["Open inventories", "Facility estimates", "Sector methods", "Data access", "Reduction-opportunity analysis"],
    collections: ["FEATURED", "PLANETARY_DATA_AND_RESEARCH", "CLIMATE_AND_ENERGY"],
    introduction: "Climate TRACE builds an open, frequently updated inventory of greenhouse-gas and other air emissions using satellite observations, sensors, public and commercial data, modelling and machine learning.",
    whyItMatters: "Climate TRACE can help users move from a global emissions problem to sectors, countries and individual sources. Its estimates must remain versioned and uncertainty-aware rather than being presented as direct regulatory findings.",
    whatItMakesPossible: "A more visible and inspectable view of emissions sources, sectors and change over time.",
    whatItWorksOn: ["Greenhouse-gas inventory", "Facility and asset estimates", "Air-pollution data", "Sector methods and data access"],
    howItWorks: ["Distributed contributing organisations", "Satellite, sensor and other data", "Sector-specific methods", "Versioned releases, downloads and API"],
    limitations: ["Climate TRACE is a coalition, not one conventional legal entity.", "Values can be revised when methods and inputs improve.", "Coalition-member locations are not the geography of emissions sources."],
    programmes: [
      programme("programme:trace:inventory", "Global emissions inventory", "Versioned global, country, sector and asset-level estimates with public methods and releases.", ["trace-data", "trace-about"]),
      programme("programme:trace:methods", "Sector methods and releases", "Contributors develop and improve methods; version and retrieval time must travel with reused values.", ["trace-team", "trace-updates"]),
    ],
    geographies: [
      geo("geo:trace:global", "Global emissions data coverage", "OPERATING_GEOGRAPHY", "Data coverage, not coalition office geography or regulatory jurisdiction.", 0, 20, 1.3, "REGION", ["trace-data"], "NONE"),
    ],
    relationships: [
      relation("rel:trace:climate", "MISSION", "CLIM4TE_", ["trace-about"], "/missions/clim4te"),
      relation("rel:trace:energy", "MISSION", "EN4RGY_", ["trace-data"], "/missions/en3rgy"),
    ],
    visualisation: { kind: "EMISSIONS", title: "Sources, models and estimates remain versioned.", caption: "Asset estimates connect to sectors and places without becoming regulatory findings.", nodes: ["Observations and data", "Sector methods", "Versioned estimates", "Assets and places", "Reduction questions"] },
    relatedActorIds: ["actor:p17:P17-A012", "actor:p17:P17-A003"],
    officialUrl: "https://climatetrace.org/",
    lastReviewed: "2026-08-05",
    seo: {
      title: "Climate TRACE — Open Global Emissions Intelligence | 4PLANET",
      description: "Explore Climate TRACE's coalition, emissions inventory, methods, releases, data access and uncertainty rules.",
      canonicalPath: "/actors/climate-trace",
      sameAs: ["https://climatetrace.org/"],
      areaServed: ["Global data coverage"],
      knowsAbout: ["Greenhouse-gas emissions", "Asset-level estimates", "Satellite data", "Emissions inventories"],
      ogImage: og("climate-trace"),
    },
    claimStart: 46,
    identityClaim: "Climate TRACE is a nonprofit coalition of organisations and researchers rather than one conventional legal entity.",
    methodClaim: "Contributors combine satellite, sensor and other data through sector methods, models and versioned releases.",
    actionClaim: "People and institutions can use the data under stated terms and follow official releases and collaboration routes.",
    boundaryClaim: "Climate TRACE estimates are versioned model outputs and must not be presented as direct regulatory findings.",
    sources: [
      ["trace-about", "About Climate TRACE", "https://www.climatetrace.org/about", "Official identity"],
      ["trace-team", "Climate TRACE coalition", "https://climatetrace.org/team", "Official network"],
      ["trace-data", "Climate TRACE data", "https://climatetrace.org/data", "Official data", "CONDITIONAL"],
      ["trace-updates", "Monthly data updates", "https://www.climatetrace.org/news/what-to-know-about-climate-traces-monthly-data-updates", "Official methodology and release context"],
    ],
    actions: [
      action("action:trace:data", "EXPLORE_DATA", "Explore Climate TRACE data", "https://climatetrace.org/data", "Official data experience; version and terms apply."),
      action("action:trace:learn", "LEARN", "Understand the coalition and methods", "https://www.climatetrace.org/about", "Official background and methodology context."),
      action("action:trace:follow", "FOLLOW", "Follow data updates", "https://www.climatetrace.org/news/what-to-know-about-climate-traces-monthly-data-updates", "Official release information."),
    ],
  }),
];

export const actorBySlug = (slug?: string) => ACTORS.find((actor) => actor.slug === slug);
export const actorById = (id?: string | null) => ACTORS.find((actor) => actor.id === id);
export const actorSource = (actor: ActorProfile, sourceId: string) => actor.sources.find((item) => item.id === sourceId);
export const actorsInCollection = (collection: ActorCollection) => ACTORS.filter((actor) => actor.collections.includes(collection));

export const ACTOR_TYPE_LABELS: Record<ActorType, string> = {
  MEMBERSHIP_UNION: "Membership union",
  DATA_INFRASTRUCTURE: "Data infrastructure",
  FIELD_CONSERVATION: "Field conservation",
  SPECIALIST_CONSERVATION: "Specialist conservation",
  RESTORATION_OPERATOR: "Restoration operator",
  DATA_ACCOUNTABILITY: "Data and accountability",
  RIGHTS_BASED_NGO: "Rights-based organisation",
  COALITION: "Coalition",
};

export const ACTOR_ACTION_LABELS: Record<ActorActionType, string> = {
  DONATE: "Donate",
  EXPLORE_DATA: "Explore data",
  FOLLOW: "Follow",
  LEARN: "Learn",
  CONTACT: "Contact",
  PARTNER_OFFICIALLY: "Official partnership route",
};

export const ACTOR_COLLECTIONS: { id: ActorCollection; title: string; description: string }[] = [
  { id: "FEATURED", title: "Featured organisations", description: "Different forms of capability across fieldwork, rights, science and open infrastructure." },
  { id: "FORESTS_AND_HABITATS", title: "Protecting forests and habitats", description: "Organisations connected to habitat protection, restoration, stewardship and rights." },
  { id: "OCEANS", title: "Working for oceans", description: "Specialist conservation, restoration and transparency work connected to marine systems." },
  { id: "SPECIES_AND_ECOSYSTEMS", title: "Species and ecosystem protection", description: "Actors linking species knowledge to habitats, landscapes and long-term conservation." },
  { id: "INDIGENOUS_AND_LOCAL_LEADERSHIP", title: "Indigenous rights and local leadership", description: "Work where rights, local authority and partner agency must remain visible." },
  { id: "PLANETARY_DATA_AND_RESEARCH", title: "Planetary data and research", description: "Shared infrastructures making biodiversity, ocean and climate information more accessible." },
  { id: "CLIMATE_AND_ENERGY", title: "Climate and energy intelligence", description: "Open data and methods for understanding emissions, sectors and sources." },
  { id: "OFFICIAL_SUPPORT_AVAILABLE", title: "Organisations you can support", description: "Official external routes for learning, following, donating or participating." },
];

export const ACTOR_CLAIM_COUNT = ACTORS.reduce((total, actor) => total + actor.claims.length, 0);
