export type ActorAction = {
  label: string;
  state: string;
  detail: string;
};

export type ActorProfile = {
  id: string;
  slug: string;
  gold: string;
  name: string;
  actorType: string;
  oneLine: string;
  relationshipState: string;
  solutionClasses: string[];
  geographies: string[];
  proof: string[];
  live: string[];
  actions: ActorAction[];
  truthBoundary: string;
};

export const ACTOR_PROFILES: ActorProfile[] = [
  {
    id: "P17-A036",
    slug: "orca",
    gold: "GOLD 01 · SCIENCE + MONITORING",
    name: "ORCA",
    actorType: "Marine conservation charity",
    oneLine: "A real-world actor for cetacean monitoring, survey science and public participation.",
    relationshipState: "ACTIVE DIALOGUE · FOUNDER MEETING COMPLETED 21 AUG 2026",
    solutionClasses: [
      "Cetacean monitoring",
      "Survey science",
      "Volunteer observation",
      "Public engagement",
    ],
    geographies: [
      "UK survey network",
      "Route-specific marine monitoring",
      "Exact survey geography remains programme-specific",
    ],
    proof: [
      "Direct founder conversation with Steve Jones, ORCA COO, 21 Aug 2026.",
      "ORCA explained survey effort, transect logic, sightings and monitoring methodology.",
      "ORCA indicated it can provide profile content and images for a 4PLANET trial.",
    ],
    live: [
      "Atlas text / material expected from ORCA after the meeting.",
      "Survey-sponsorship structure and placeholder economics are being considered internally by ORCA.",
      "ORCA explicitly supported using a survey trial to stress-test the 4PLANET platform.",
    ],
    actions: [
      {
        label: "Fund a survey",
        state: "PRELIMINARY · PRICE PENDING",
        detail: "Potential concrete action unit discussed with ORCA. Steve indicated survey funding can be in the low-thousands GBP range, but numbers are not approved or locked.",
      },
      {
        label: "Explore survey evidence",
        state: "BUILDING",
        detail: "Connect route, effort, sightings and methodology into ATLAS without turning occurrence into abundance or live-position claims.",
      },
      {
        label: "Support monitoring",
        state: "MODEL ACTION",
        detail: "Actor-specific action architecture; no public payment or delivery claim is active yet.",
      },
    ],
    truthBoundary: "ORCA is a GOLD design and data reference, not a declared 4PLANET delivery partner. No sponsorship price, contract, funding commitment or outcome claim is locked.",
  },
  {
    id: "P17-A307",
    slug: "veritree",
    gold: "GOLD 02 · RESTORATION + IMPLEMENTATION",
    name: "veritree",
    actorType: "Restoration MRV platform",
    oneLine: "A contrasting actor reference for implementation, restoration projects, monitoring and evidence-backed impact units.",
    relationshipState: "ACTIVE RELATIONSHIP · PILOT PROPOSITION DRAFTED · NOT ACCEPTED",
    solutionClasses: [
      "Restoration implementation infrastructure",
      "Monitoring / reporting / verification",
      "Project evidence",
      "Impact-unit delivery architecture",
    ],
    geographies: [
      "Project-specific",
      "Restoration sites vary by programme",
      "No geography is inferred without project evidence",
    ],
    proof: [
      "Existing direct relationship with Caitlin Griffin.",
      "4PLANET × veritree First Impact Unit Pilot proposition exists in draft state.",
      "Canonical actor identity: P17-A307 in the 4PLANET Actor Master.",
    ],
    live: [
      "Pilot proposition prepared, not sent/accepted in the observed canonical state.",
      "GOLD reference selected to force the Actor Engine beyond NGO/science-only profiles.",
      "Profile must distinguish platform, field project, local implementer and evidence source.",
    ],
    actions: [
      {
        label: "Fund restoration",
        state: "MODEL ACTION",
        detail: "Action must resolve to a specific project, geography, intervention and evidence chain before becoming a live offer.",
      },
      {
        label: "Inspect evidence",
        state: "GOLD REQUIREMENT",
        detail: "Show monitoring, project proof and boundaries alongside any unit or outcome language.",
      },
      {
        label: "Pilot an impact unit",
        state: "DRAFT · NOT ACCEPTED",
        detail: "Existing 4PLANET pilot concept; do not infer agreement, price, contract or delivery.",
      },
    ],
    truthBoundary: "veritree is a GOLD Actor Profile reference. Relationship activity and a draft pilot do not equal acceptance, partnership, contract, price or verified outcome.",
  },
];

export const actorBySlug = (slug?: string) => ACTOR_PROFILES.find((actor) => actor.slug === slug);
