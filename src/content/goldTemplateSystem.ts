export const GOLD_OBJECT_KINDS = [
  "SPECIES",
  "PLACE",
  "LIVING_SYSTEM",
  "ACTOR",
  "SOLUTION",
  "SIGNAL",
  "PROOF",
] as const;

export type GoldObjectKind = (typeof GOLD_OBJECT_KINDS)[number];
export type GoldEvidenceState = "KNOWN" | "INTERPRETED" | "UNKNOWN";

export interface GoldSource {
  label: string;
  publisher: string;
  url: string;
  checkedAt: string;
  note: string;
}

export interface GoldFact {
  label: string;
  value: string;
  note?: string;
  state?: GoldEvidenceState;
}

export interface GoldRelationship {
  kind: GoldObjectKind | "DATA" | "PRESSURE" | "DECISION";
  label: string;
  relation: string;
  state: GoldEvidenceState;
  href?: string;
  boundary?: string;
}

export interface GoldSection {
  index: string;
  eyebrow: string;
  title: string;
  body: string[];
  callout?: string;
}

export interface GoldSolutionIntelligence {
  problem: string;
  causalMechanism: string;
  humanSystemPosition: string[];
  applicability: string[];
  maturity: string;
  evidenceLevel: string;
  demonstratedOutcomes: GoldFact[];
  economics: GoldFact[];
  limitations: string[];
  actors: Array<{ actorId: string; name: string; role: string; state: GoldEvidenceState; href?: string }>;
  implementationRequirements: string[];
  capital: { state: GoldEvidenceState; note: string };
  currentActions: Array<{ label: string; provider: string; href: string; checkedAt: string; state: "OPEN" | "WATCH" }>;
  unknowns: string[];
}

export interface GoldObjectProof {
  slug: string;
  kind: GoldObjectKind;
  title: string;
  scientificName?: string;
  eyebrow: string;
  standfirst: string;
  status: string;
  accent: string;
  visual: "OCEAN" | "FJORD" | "MEADOW";
  facts: GoldFact[];
  sections: GoldSection[];
  relationships: GoldRelationship[];
  solutionIntelligence?: GoldSolutionIntelligence;
  sources: GoldSource[];
  truthBoundary: string;
  donorNote: string;
  nextObjects: Array<{ label: string; href: string; kind: string }>;
}

export const GOLD_OBJECT_PROOFS: GoldObjectProof[] = [
  {
    slug: "blue-whale",
    kind: "SPECIES",
    title: "Blue whale",
    scientificName: "Balaenoptera musculus",
    eyebrow: "SPECIES GOLD · LIFE AT OCEAN SCALE",
    standfirst: "The largest animal known to have lived on Earth depends on a food web built around organisms measured in centimetres. The useful story is not its size alone, but the living system required to sustain it.",
    status: "TEST PROOF · SOURCE-BOUNDED",
    accent: "#2f55ff",
    visual: "OCEAN",
    facts: [
      { label: "MAX LENGTH", value: "Up to 110 ft", note: "NOAA Fisheries", state: "KNOWN" },
      { label: "MAX WEIGHT", value: "Up to 330,000 lb", note: "NOAA Fisheries", state: "KNOWN" },
      { label: "FOOD", value: "Almost exclusively krill", note: "NOAA Fisheries", state: "KNOWN" },
      { label: "RANGE", value: "All oceans except the Arctic", note: "NOAA Fisheries", state: "KNOWN" },
      { label: "US ESA STATUS", value: "Endangered", note: "Throughout its range", state: "KNOWN" },
      { label: "CURRENT PRESSURES", value: "Vessel strikes · entanglement · ocean noise", note: "NOAA Fisheries", state: "KNOWN" },
    ],
    sections: [
      {
        index: "01",
        eyebrow: "MEET THE ANIMAL",
        title: "A giant built from a small-food world.",
        body: [
          "Blue whales are baleen whales and the largest animals known to have lived on Earth. Their scale is spectacular, but the more consequential fact is ecological: they feed almost exclusively on krill.",
          "That makes the animal legible as a relationship, not a trophy fact. Productive ocean conditions, prey availability, movement corridors and human pressures all sit inside the same story.",
        ],
      },
      {
        index: "02",
        eyebrow: "WHERE",
        title: "An ocean-basin life, not a pin on a map.",
        body: [
          "NOAA describes blue whales as occurring in all oceans except the Arctic. A useful map therefore needs to distinguish broad range, seasonal movement, observations and uncertainty instead of collapsing them into one coloured area.",
          "The Gold template treats geography as evidence-bearing context: what was observed, when, by whom and at what spatial precision.",
        ],
        callout: "ATLAS HANDOFF RULE · RANGE ≠ PRESENCE NOW · OBSERVATION ≠ ABUNDANCE",
      },
      {
        index: "03",
        eyebrow: "WHAT IS CHANGING",
        title: "The pressure is not one thing.",
        body: [
          "NOAA lists vessel strikes, entanglement in fishing gear and ocean noise among current threats. Those pressures operate differently, at different places and times, and need separate evidence paths.",
          "A premium Species object should therefore show the pressure graph without turning correlation, exposure or a single observation into an outcome claim.",
        ],
      },
    ],
    relationships: [
      { kind: "LIVING_SYSTEM", label: "Krill food web", relation: "Primary prey relationship; the blue whale's feeding ecology is inseparable from krill availability.", state: "KNOWN" },
      { kind: "PLACE", label: "Ocean basins", relation: "Range context spans all oceans except the Arctic; exact presence is time- and source-dependent.", state: "KNOWN", boundary: "Broad range is not live presence." },
      { kind: "PRESSURE", label: "Vessel traffic", relation: "Vessel strikes are a recognised threat.", state: "KNOWN" },
      { kind: "PRESSURE", label: "Fishing gear", relation: "Entanglement is a recognised threat.", state: "KNOWN" },
      { kind: "SIGNAL", label: "Ocean noise", relation: "NOAA lists ocean noise among current threats; local exposure requires separate evidence.", state: "KNOWN", boundary: "Threat class ≠ site-specific impact." },
    ],
    sources: [
      {
        label: "Blue Whale",
        publisher: "NOAA Fisheries",
        url: "https://www.fisheries.noaa.gov/species/blue-whale",
        checkedAt: "2026-09-15",
        note: "Primary public species authority for size, feeding ecology, range, protected status and listed threats used in this proof.",
      },
    ],
    truthBoundary: "This TEST object does not claim live population size, local presence, migration timing or recovery outcome. Those require additional source objects and time-bounded evidence.",
    donorNote: "ORCA is used only as a capability donor for hierarchy, source treatment, progressive disclosure, living-system handoff and Human Gold learnings. No Orca copy or species-specific claims are reused.",
    nextObjects: [
      { label: "Explore ATLAS", href: "/atlas", kind: "ATLAS" },
      { label: "Open Living Systems", href: "/living-systems", kind: "LIVING SYSTEMS" },
      { label: "Read the Feature proof", href: "/labs/gold/story/feature-blue-whale", kind: "MAGAZINE" },
    ],
  },
  {
    slug: "oslofjord",
    kind: "PLACE",
    title: "Oslofjord",
    eyebrow: "PLACE GOLD · ONE FJORD, MANY PRESSURES",
    standfirst: "More than half of Norway's population lives in the catchment that affects this fjord. The useful object is not a scenic profile; it is a source-backed view of place, pressures, decisions, living systems and response.",
    status: "TEST PROOF · CURRENT DECISION CONTEXT",
    accent: "#1d6dff",
    visual: "FJORD",
    facts: [
      { label: "ENVIRONMENTAL STATE", value: "Very serious", note: "Norwegian Government, 2026", state: "KNOWN" },
      { label: "MAJOR PRESSURES", value: "Wastewater · agriculture runoff · fisheries", note: "Norwegian Government", state: "KNOWN" },
      { label: "CATCHMENT", value: "> 50% of Norway's population", note: "Lives in the area influencing the fjord", state: "KNOWN" },
      { label: "2026 PLAN", value: "2026–2030 proposal under consultation", note: "National decision context", state: "KNOWN" },
      { label: "RESTORATION", value: "Local marine restoration guidance exists", note: "Miljødirektoratet / NIVA", state: "KNOWN" },
      { label: "RECOVERY TIMING", value: "Not immediate", note: "Effects of measures can take years", state: "KNOWN" },
    ],
    sections: [
      {
        index: "01",
        eyebrow: "WHAT IS HAPPENING HERE",
        title: "A rich fjord under accumulated pressure.",
        body: [
          "Norwegian authorities describe the condition of life in Oslofjord as very serious. Long-running human pressures include wastewater discharges, agricultural runoff and fisheries impacts.",
          "The Place object keeps those drivers separate from symptoms and from proposed responses. It should help a person move from 'the fjord is in trouble' to the exact evidence, actor, decision and system involved.",
        ],
      },
      {
        index: "02",
        eyebrow: "DECISION CONTEXT",
        title: "The place is inside a live public decision cycle.",
        body: [
          "A proposed national action plan for 2026–2030 was sent to consultation in June 2026. That makes the fjord a useful proof of why Place objects must carry time: current decisions, past plans and observed ecological state cannot be collapsed into one timeless page.",
          "The Gold model exposes the date and authority of each decision object rather than presenting policy as settled ecological outcome.",
        ],
        callout: "DECISION ≠ DELIVERY ≠ ECOLOGICAL OUTCOME",
      },
      {
        index: "03",
        eyebrow: "WHAT CAN CHANGE",
        title: "Local restoration matters — but it cannot carry the whole fjord.",
        body: [
          "Miljødirektoratet's 2026 restoration guidance identifies eelgrass meadows, shallow soft-bottom habitats, macroalgal communities and kelp forests among relevant local restoration targets.",
          "The same guidance is explicit that pressure reduction remains central. A Place object should show restoration beside wastewater, nutrient and fisheries measures, not as a replacement for them.",
        ],
      },
    ],
    relationships: [
      { kind: "LIVING_SYSTEM", label: "Coastal marine ecosystem", relation: "The fjord is a connected ecological system rather than a collection of isolated sites.", state: "KNOWN" },
      { kind: "PRESSURE", label: "Nutrient and particle loading", relation: "Wastewater and agricultural runoff are among the major pressures identified by authorities.", state: "KNOWN" },
      { kind: "PRESSURE", label: "Fisheries", relation: "Fishing pressure is identified as a major influence on the ecosystem.", state: "KNOWN" },
      { kind: "SOLUTION", label: "Eelgrass restoration", relation: "A local restoration pathway with practical guidance, but only where site suitability and pressure reduction support it.", state: "KNOWN", href: "/labs/gold/object/eelgrass-restoration" },
      { kind: "DECISION", label: "Oslofjord plan 2026–2030", relation: "Current national proposal and consultation context.", state: "KNOWN", boundary: "Proposal/consultation state is not final implementation." },
    ],
    sources: [
      {
        label: "Oslofjorden",
        publisher: "Klima- og miljødepartementet",
        url: "https://www.regjeringen.no/no/tema/klima-og-miljo/naturmangfold/innsiktsartikler-naturmangfold/oslofjorden/id3139220/",
        checkedAt: "2026-09-15",
        note: "Current government overview of ecological condition, pressures and knowledge base.",
      },
      {
        label: "Forslag til ny Oslofjordplan",
        publisher: "Klima- og miljødepartementet",
        url: "https://www.regjeringen.no/no/dokumenter/horing-av-regjeringens-forslag-til-ny-oslofjordplan/id3166019/",
        checkedAt: "2026-09-15",
        note: "Current 2026–2030 consultation state and dates.",
      },
      {
        label: "Naturrestaurering i Oslofjorden",
        publisher: "Miljødirektoratet",
        url: "https://www.miljodirektoratet.no/ansvarsomrader/vann-hav-og-kyst/naturrestaurering-i-oslofjorden/",
        checkedAt: "2026-09-15",
        note: "Current practical guidance and explicit uncertainty/priority boundaries for marine restoration.",
      },
    ],
    truthBoundary: "This TEST object separates environmental state, pressure, proposal, implementation and outcome. It does not infer causality at a specific site or claim that any proposed measure has already improved the fjord.",
    donorNote: "Existing Oslofjord Living Systems / Planet Proof work is the donor for evidence state, relationship logic and source boundaries. This page tests the reusable PLACE reading hierarchy.",
    nextObjects: [
      { label: "Open eelgrass restoration", href: "/labs/gold/object/eelgrass-restoration", kind: "SOLUTION" },
      { label: "Open existing Oslofjord proof", href: "/living-systems/oslofjord", kind: "LIVING SYSTEM" },
      { label: "Explore ATLAS", href: "/atlas", kind: "ATLAS" },
    ],
  },
  {
    slug: "eelgrass-restoration",
    kind: "SOLUTION",
    title: "Eelgrass restoration",
    eyebrow: "SOLUTION GOLD · METHOD BEFORE MARKETING",
    standfirst: "Restoring an underwater meadow can be a real local intervention. It is not a universal fix. The Gold object starts with mechanism, site conditions, evidence and failure boundaries before it talks about scale.",
    status: "TEST PROOF · EVIDENCE-BOUNDED METHOD",
    accent: "#47ff9a",
    visual: "MEADOW",
    facts: [
      { label: "TARGET", value: "Eelgrass and underwater meadows", note: "Oslofjord guidance", state: "KNOWN" },
      { label: "METHODS", value: "Shoot transplantation · seed sowing", note: "Miljødirektoratet", state: "KNOWN" },
      { label: "PRECONDITION", value: "Reduce negative pressure", note: "Active re-establishment should be combined with pressure reduction", state: "KNOWN" },
      { label: "DELIVERY", value: "Site selection → planting → monitoring", note: "NIVA practical guide", state: "KNOWN" },
      { label: "UNIVERSAL SUCCESS RATE", value: "UNKNOWN", note: "No universal outcome is claimed", state: "UNKNOWN" },
      { label: "PRIORITY", value: "Protect intact nature first", note: "Miljødirektoratet", state: "KNOWN" },
    ],
    sections: [
      {
        index: "01",
        eyebrow: "WHAT IT DOES",
        title: "Re-establish habitat where the system can support it.",
        body: [
          "Eelgrass meadows are habitat-forming coastal systems. Norwegian guidance describes active re-establishment methods including transplantation of shoots and seed sowing, alongside work to remove or reduce local pressures.",
          "The solution object therefore treats restoration as a method with prerequisites, not a product claim with an assumed outcome.",
        ],
      },
      {
        index: "02",
        eyebrow: "HOW IT IS TESTED",
        title: "Choose the place before choosing the intervention.",
        body: [
          "NIVA's practical guide for Oslo municipality structures the work around site selection, planting and monitoring. The 2026 national guidance likewise frames marine restoration as a toolbox rather than a linear recipe.",
          "That means a credible Solution page needs a suitability gate, a monitoring plan and an explicit stop condition when the underlying pressure remains unresolved.",
        ],
        callout: "SITE SUITABILITY + PRESSURE REDUCTION + MONITORING → ONLY THEN OUTCOME EVIDENCE",
      },
      {
        index: "03",
        eyebrow: "WHAT IT CANNOT CLAIM",
        title: "A planted meadow is not yet a restored ecosystem.",
        body: [
          "Miljødirektoratet explicitly warns that marine nature restoration is complex and still relatively little tested. Protecting intact nature is described as the safest and most cost-effective first priority.",
          "The Gold template keeps delivery, survival, ecological function and long-term outcome as separate proof levels. UNKNOWN remains visible rather than being filled with optimistic language.",
        ],
      },
    ],
    relationships: [
      { kind: "PLACE", label: "Oslofjord", relation: "A real Norwegian use context with current restoration guidance.", state: "KNOWN", href: "/labs/gold/object/oslofjord" },
      { kind: "LIVING_SYSTEM", label: "Shallow coastal habitat", relation: "Eelgrass is habitat-forming and supports biodiversity and ecosystem services.", state: "KNOWN" },
      { kind: "PRESSURE", label: "Physical disturbance", relation: "Anchoring, boating and other disturbances can be relevant local pressures.", state: "KNOWN" },
      { kind: "PRESSURE", label: "Nutrient / particle inputs", relation: "Regional pressure reduction remains central to Oslofjord recovery.", state: "KNOWN" },
      { kind: "PROOF", label: "Long-term ecological outcome", relation: "Must be measured after intervention; not assumed from planting activity.", state: "UNKNOWN", boundary: "Delivery ≠ survival ≠ function ≠ ecosystem recovery." },
    ],
    solutionIntelligence: {
      problem: "Loss or degradation of eelgrass habitat in shallow coastal systems, where local physical disturbance and wider water-quality pressures can prevent recovery.",
      causalMechanism: "Re-establish eelgrass through shoot transplantation or seed sowing only after site suitability is assessed, while reducing the pressures that would otherwise undermine establishment.",
      humanSystemPosition: ["Coastal restoration", "Municipal / marine management", "Field monitoring"],
      applicability: ["Site-specific shallow coastal habitats", "Oslofjord as a documented Norwegian use context", "Only where suitability and pressure-reduction conditions are met"],
      maturity: "Practical guidance exists; Norwegian authorities still describe marine restoration as complex and relatively little tested.",
      evidenceLevel: "METHOD DOCUMENTED / OUTCOME SITE-SPECIFIC",
      demonstratedOutcomes: [
        { label: "METHOD DELIVERY", value: "Documented", note: "Site selection, planting and monitoring are described in practical guidance.", state: "KNOWN" },
        { label: "UNIVERSAL SUCCESS", value: "UNKNOWN", note: "No transferable universal survival or ecosystem-recovery rate is claimed.", state: "UNKNOWN" },
      ],
      economics: [
        { label: "STANDARD COST", value: "UNKNOWN", note: "The checked sources do not establish a universal cost per restored area.", state: "UNKNOWN" },
        { label: "VALUE PATH", value: "Habitat recovery only if ecological function persists", note: "Planting activity alone is not economic or ecological outcome proof.", state: "INTERPRETED" },
      ],
      limitations: [
        "Restoration cannot substitute for reducing nutrient, particle and physical pressures.",
        "A planted site is not evidence of long-term survival, ecological function or ecosystem recovery.",
        "Site suitability and monitoring design must be resolved before an intervention is treated as applicable.",
      ],
      actors: [],
      implementationRequirements: [
        "Site-suitability assessment",
        "Pressure-reduction plan",
        "Appropriate transplantation or seed method",
        "Monitoring plan with explicit outcome measures",
      ],
      capital: {
        state: "UNKNOWN",
        note: "No generic funding requirement or standard project budget is established by the checked sources; capital must be attached to a real site and delivery plan.",
      },
      currentActions: [],
      unknowns: [
        "Site-specific survival probability",
        "Long-term ecological-function outcome",
        "Standardised cost and funding requirement",
      ],
    },
    sources: [
      {
        label: "Restaurering av ålegrasenger — praktisk veileder",
        publisher: "NIVA",
        url: "https://www.niva.no/publikasjoner/publikasjon?id=0198cc3eb83f-95907859-63d4-4fc0-b8be-dc4b471a3c85",
        checkedAt: "2026-09-15",
        note: "Research-based practical guidance covering site selection, planting and monitoring.",
      },
      {
        label: "Naturrestaurering i Oslofjorden",
        publisher: "Miljødirektoratet",
        url: "https://www.miljodirektoratet.no/ansvarsomrader/vann-hav-og-kyst/naturrestaurering-i-oslofjorden/",
        checkedAt: "2026-09-15",
        note: "Current national guidance, including the explicit boundary that restoration is complex and intact nature protection comes first.",
      },
      {
        label: "Sett mål og velg tiltak",
        publisher: "Miljødirektoratet",
        url: "https://www.miljodirektoratet.no/ansvarsomrader/vann-hav-og-kyst/naturrestaurering-i-oslofjorden/sett-mal-og-velg-tiltak/",
        checkedAt: "2026-09-15",
        note: "Current method options and the requirement to combine active re-establishment with pressure reduction.",
      },
    ],
    truthBoundary: "This TEST Solution object presents a documented method and decision logic. It does not claim that 4PLANET delivers eelgrass restoration, that a specific site is suitable, or that restoration has produced a verified ecological outcome.",
    donorNote: "Existing Proof Passport / Action Contract logic is the donor for separating intervention, evidence and outcome. No delivery partnership is implied.",
    nextObjects: [
      { label: "Open Oslofjord", href: "/labs/gold/object/oslofjord", kind: "PLACE" },
      { label: "Open existing Impact", href: "/impact", kind: "PROOF / ACTION" },
      { label: "Read the Explainer proof", href: "/labs/gold/story/explainer-1-5c", kind: "MAGAZINE" },
    ],
  },
  {
    slug: "coral-restoration",
    kind: "SOLUTION",
    title: "Coral restoration",
    eyebrow: "SOLUTION GOLD · RESTORE, MONITOR, ADAPT",
    standfirst: "Growing corals in nurseries and returning them to degraded reefs is an established restoration practice. Its value depends on site conditions, genetic diversity, heat stress, monitoring and whether restored corals persist as part of a functioning reef.",
    status: "TEST PROOF · ACTIVE PRACTICE + OPEN UNCERTAINTY",
    accent: "#ff785a",
    visual: "OCEAN",
    facts: [
      { label: "CORE METHOD", value: "Nursery → outplant → monitor", note: "NOAA + CRF", state: "KNOWN" },
      { label: "FLORIDA PRACTICE", value: "Tens of thousands of acroporid colonies outplanted annually", note: "NOAA AOML", state: "KNOWN" },
      { label: "ONE-YEAR SURVIVORSHIP", value: ">70% reported in Florida programme context", note: "NOAA AOML; not a universal rate", state: "KNOWN" },
      { label: "ECOSYSTEM-SCALE BENEFIT", value: "Context-dependent", note: "NOAA science-needs assessment retains major evidence gaps", state: "UNKNOWN" },
      { label: "STANDARD COST", value: "UNKNOWN", note: "No universal cost per restored reef area is claimed", state: "UNKNOWN" },
      { label: "CURRENT PARTICIPATION", value: "Spring 2027 CRF internship open", note: "Applications listed through 30 October 2026", state: "KNOWN" },
    ],
    sections: [
      {
        index: "01",
        eyebrow: "WHAT IT DOES",
        title: "Increase living coral where natural recovery is not enough.",
        body: [
          "NOAA describes coral restoration as a family of interventions that includes growing corals in protected nursery conditions, planting nursery-grown corals onto reefs and building resilience to environmental stress.",
          "Coral Restoration Foundation documents an operational version of that loop: in-situ nurseries, multi-species outplanting and photomosaic monitoring. The method is real; the outcome is not automatic.",
        ],
      },
      {
        index: "02",
        eyebrow: "WHAT THE EVIDENCE SAYS",
        title: "Survival can be measured. Ecosystem recovery is a higher bar.",
        body: [
          "NOAA AOML reports that tens of thousands of acroporid colonies are raised and outplanted on Florida's coral reef each year, with more than 70 percent one-year survivorship in that programme context.",
          "NOAA's Florida Keys science-needs assessment also notes that historical outplanting has often involved limited species, relatively low scale and minimal overall ecosystem benefits. The Gold object therefore separates colony survival from reef recovery.",
        ],
        callout: "OUTPLANTING ≠ SURVIVAL ≠ REPRODUCTION ≠ ECOSYSTEM RECOVERY",
      },
      {
        index: "03",
        eyebrow: "WHERE IT BREAKS",
        title: "A restoration method cannot outrun the conditions around it.",
        body: [
          "Marine heat, disease, water quality, predation, competition and site choice can materially change restoration performance. NOAA programmes continue to test resilient genotypes, site selection and adaptive management because the operating environment is not stable.",
          "A credible solution record therefore carries failure conditions, monitoring requirements and current uncertainty beside the intervention itself.",
        ],
      },
    ],
    relationships: [
      { kind: "PRESSURE", label: "Marine heat stress", relation: "Heat stress can drive bleaching and mortality and can change when and where outplanting is viable.", state: "KNOWN" },
      { kind: "PLACE", label: "Florida Keys", relation: "A major current operating and research context for nursery propagation and outplanting.", state: "KNOWN" },
      { kind: "ACTOR", label: "Coral Restoration Foundation", relation: "A restoration nonprofit operating nurseries, outplanting, monitoring and research programmes.", state: "KNOWN", href: "/actors/coral-restoration-foundation" },
      { kind: "PROOF", label: "Long-term reef recovery", relation: "Requires evidence beyond coral placement or short-term colony survival.", state: "UNKNOWN", boundary: "Project activity and colony survival do not prove ecosystem-scale recovery." },
    ],
    solutionIntelligence: {
      problem: "Degraded coral reefs facing interacting pressures including ocean warming, disease, pollution, physical damage and loss of reef-building coral.",
      causalMechanism: "Propagate genetically diverse corals in nurseries, outplant them to suitable degraded reef sites, then monitor survival, growth, reproduction and wider reef response while adapting methods to environmental conditions.",
      humanSystemPosition: ["Marine restoration operations", "Conservation science", "Field monitoring", "Restoration training and practitioner infrastructure"],
      applicability: ["Degraded reef sites with appropriate permits and site assessment", "Florida and Caribbean practice contexts documented by the checked sources", "Not a substitute for reducing climate and local water-quality pressures"],
      maturity: "Operational restoration practice with active research and method refinement.",
      evidenceLevel: "METHOD DEMONSTRATED / OUTCOMES CONTEXT-SPECIFIC",
      demonstratedOutcomes: [
        { label: "ONE-YEAR COLONY SURVIVAL", value: ">70% in reported Florida acroporid programme context", note: "NOAA AOML; not a universal success rate.", state: "KNOWN" },
        { label: "DRY TORTUGAS CASE", value: ">90% after eight months in one reported 2025 outplant cohort", note: "CRF preliminary project report; project-specific and provider-reported.", state: "KNOWN" },
        { label: "ECOSYSTEM RECOVERY", value: "UNKNOWN / site-specific", note: "NOAA identifies continuing questions about scaling restoration into ecosystem processes and benefits.", state: "UNKNOWN" },
      ],
      economics: [
        { label: "STANDARD UNIT COST", value: "UNKNOWN", note: "No universal cost-per-colony or cost-per-hectare is inferred from these sources.", state: "UNKNOWN" },
        { label: "CAPITAL INTENSITY", value: "Context-specific", note: "Nursery, vessel, diving, monitoring, permitting and labour needs vary by site and programme.", state: "INTERPRETED" },
      ],
      limitations: [
        "Heat stress, disease and poor site conditions can overwhelm an otherwise sound restoration method.",
        "Short-term survivorship is not equivalent to reproduction, reef function or ecosystem recovery.",
        "Restoration does not remove the need to reduce climate and local pollution pressures.",
      ],
      actors: [
        { actorId: "P17-A011", name: "Coral Restoration Foundation", role: "Restoration operator, research collaborator and training/participation provider", state: "KNOWN", href: "/actors/coral-restoration-foundation" },
      ],
      implementationRequirements: [
        "Permitted and ecologically suitable restoration site",
        "Diverse and appropriate coral stock / nursery capacity",
        "Trained field team and safe diving/boat operations where required",
        "Outplanting protocol matched to species and site",
        "Monitoring and adaptive-management plan",
      ],
      capital: {
        state: "UNKNOWN",
        note: "The method clearly consumes labour, nursery, field and monitoring resources, but no generic project capital requirement should be invented without a specific site, scope and delivery plan.",
      },
      currentActions: [
        {
          label: "Spring 2027 Coral Conservation & Reef Restoration Internship",
          provider: "Coral Restoration Foundation",
          href: "https://coralrestoration.org/internships/",
          checkedAt: "2026-10-06",
          state: "OPEN",
        },
      ],
      unknowns: [
        "Transferable long-term ecosystem recovery rate",
        "Standardised economics across sites",
        "Best intervention under future heat regimes",
      ],
    },
    sources: [
      {
        label: "Restoring Coral Reefs",
        publisher: "NOAA Fisheries",
        url: "https://www.fisheries.noaa.gov/national/habitat-conservation/restoring-coral-reefs",
        checkedAt: "2026-10-06",
        note: "Public authority for restoration approaches, reef pressures and current NOAA restoration context.",
      },
      {
        label: "Coral Reef Restoration — Science Needs Assessment",
        publisher: "NOAA Office of National Marine Sanctuaries",
        url: "https://sanctuaries.noaa.gov/science/assessment/florida-keys/coral-restoration.html",
        checkedAt: "2026-10-06",
        note: "Independent boundary source on historical scale, species limitations and the need to connect outplanting to ecosystem processes.",
      },
      {
        label: "Coral Restoration and Resilience",
        publisher: "NOAA AOML",
        url: "https://www.aoml.noaa.gov/projects/coral-restoration-and-resilience/",
        checkedAt: "2026-10-06",
        note: "Source for current Florida programme scale and reported one-year acroporid survivorship context.",
      },
      {
        label: "Restoration",
        publisher: "Coral Restoration Foundation",
        url: "https://coralrestoration.org/restoration/",
        checkedAt: "2026-10-06",
        note: "Operator source for nursery, outplanting and photomosaic-monitoring methods.",
      },
      {
        label: "Spring 2027 internship",
        publisher: "Coral Restoration Foundation",
        url: "https://coralrestoration.org/internships/",
        checkedAt: "2026-10-06",
        note: "Current action source: application window, eligibility, schedule, stipend statement and participant-cost requirements.",
      },
    ],
    truthBoundary: "This TEST Solution object does not claim that coral restoration reverses reef decline by itself, that a short-term survival percentage transfers across sites, or that 4PLANET partners with or delivers work for Coral Restoration Foundation.",
    donorNote: "The existing Solution Gold grammar, Actor identity spine and Get Involved opportunity contract are reused. No separate solution, actor or participation database is introduced.",
    nextObjects: [
      { label: "Open Coral Restoration Foundation", href: "/actors/coral-restoration-foundation", kind: "ACTOR" },
      { label: "Find a way to help", href: "/get-involved", kind: "ACTION" },
      { label: "Explore ATLAS", href: "/atlas", kind: "ATLAS" },
    ],
  },
];

export const GOLD_STORY_FORMATS = [
  "NEWS",
  "EXPLAINER",
  "FEATURE",
  "PROFILE",
  "VISUAL_STORY",
  "FIELD",
  "SOLUTIONS",
  "BIG_QUESTION",
  "GUIDE",
] as const;

export type GoldStoryFormat = (typeof GOLD_STORY_FORMATS)[number];

export const GOLD_STORY_GRAMMAR: Record<GoldStoryFormat, { job: string; spine: string }> = {
  NEWS: { job: "Tell a reader what changed, what is verified and what happens next.", spine: "WHAT HAPPENED → WHY IT MATTERS → WHAT WE KNOW → WHAT NEXT" },
  EXPLAINER: { job: "Answer one consequential question with clarity and boundaries.", spine: "QUESTION → SHORT ANSWER → HOW IT WORKS → WHY NOW → UNCERTAINTY" },
  FEATURE: { job: "Build deep understanding through narrative, place, people or a living protagonist.", spine: "SCENE → CHARACTER / PLACE → CONFLICT → CONTEXT → EVIDENCE → CONSEQUENCE" },
  PROFILE: { job: "Reveal a person or actor through work, choices, evidence and contradiction.", spine: "WHO → WHAT THEY DO → WHY → EVIDENCE → TENSION → WHAT NEXT" },
  VISUAL_STORY: { job: "Let photography, maps, diagrams or data carry information, not decoration.", spine: "IMAGE / SIGNAL → SCALE → PATTERN → CONTEXT → SOURCE" },
  FIELD: { job: "Take the reader into a real place without pretending observation is universal truth.", spine: "PLACE → OBSERVATION → VOICE → CONTEXT → LIMITATION → RETURN" },
  SOLUTIONS: { job: "Interrogate something that may work without turning possibility into promotion.", spine: "PROBLEM → INTERVENTION → EVIDENCE → RESULT → LIMITS → TRANSFER" },
  BIG_QUESTION: { job: "Test a provocative question against evidence and competing explanations.", spine: "QUESTION → BEST CASE → COUNTERCASE → EVIDENCE → VERDICT / UNKNOWN" },
  GUIDE: { job: "Give a reader a durable mental model and a useful way to navigate a field.", spine: "ORIENT → TERMS → HOW TO READ IT → WHAT MATTERS → SOURCES → NEXT" },
};

export interface GoldStorySource extends GoldSource {}

export interface GoldStorySection {
  kicker?: string;
  title?: string;
  paragraphs: string[];
}

export interface GoldStoryProof {
  slug: string;
  format: GoldStoryFormat;
  lane: "LIFE" | "PLANET" | "SOLUTIONS" | "PEOPLE" | "CULTURE" | "HUMAN";
  headline: string;
  standfirst: string;
  byline: string;
  publishedLabel: string;
  readMins: number;
  accent: string;
  visual: "THERMAL" | "WHALE" | "NUMBERS" | "THRESHOLD";
  sections: GoldStorySection[];
  numbers?: Array<{ value: string; label: string; note: string }>;
  sources: GoldStorySource[];
  relatedObjects: Array<{ label: string; href: string; kind: string }>;
  editorialBoundary: string;
}

export const GOLD_STORY_PROOFS: GoldStoryProof[] = [
  {
    slug: "news-august-2026",
    format: "NEWS",
    lane: "PLANET",
    headline: "August just became the hottest August ever recorded",
    standfirst: "Copernicus data put the global average surface temperature at 16.96°C — and the extra-polar ocean also reached a record August average. Here is what changed, what the numbers mean and what they do not mean.",
    byline: "4PLANET Magazine Desk",
    publishedLabel: "TEST EDITION · 15 SEP 2026",
    readMins: 4,
    accent: "#ff5a36",
    visual: "THERMAL",
    numbers: [
      { value: "16.96°C", label: "GLOBAL AUGUST AVERAGE", note: "ERA5 / Copernicus" },
      { value: "+0.85°C", label: "VS 1991–2020 AUGUST", note: "Copernicus" },
      { value: "+1.65°C", label: "VS 1850–1900 ESTIMATE", note: "Monthly value; not the Paris long-term metric" },
      { value: "21.07°C", label: "EXTRA-POLAR OCEAN SST", note: "Highest August value in ERA5" },
    ],
    sections: [
      {
        kicker: "WHAT HAPPENED",
        paragraphs: [
          "August 2026 was the warmest August in the ERA5 record, according to the Copernicus Climate Change Service. The global average surface air temperature reached 16.96°C, 0.85°C above the 1991–2020 average for August.",
          "Copernicus also reports that August was effectively tied with July 2023 as the warmest month in the dataset across all calendar months. The extra-polar ocean reached an August record average sea-surface temperature of 21.07°C.",
        ],
      },
      {
        kicker: "WHY IT MATTERS",
        title: "A record month is a signal inside a longer trend.",
        paragraphs: [
          "The record reflects both the long-term warming driven by greenhouse gases and short-term variability, including rapidly developing El Niño conditions in the Pacific. Those drivers should not be collapsed into a single cause for every regional event.",
          "Western Europe also recorded its warmest summer in the ERA5 record, while some regions were cooler than average. Global records and local experience can coexist without contradiction.",
        ],
      },
      {
        kicker: "WHAT NEXT",
        paragraphs: [
          "The immediate editorial job is not to turn one record into apocalypse or reassurance. It is to keep the monthly signal connected to the longer climate record, the ocean signal and the sources that will update next.",
        ],
      },
    ],
    sources: [
      {
        label: "Surface air temperature for August 2026",
        publisher: "Copernicus Climate Change Service / ECMWF",
        url: "https://climate.copernicus.eu/surface-air-temperature-august-2026",
        checkedAt: "2026-09-15",
        note: "Primary data summary used for global and European temperature and sea-surface-temperature figures.",
      },
    ],
    relatedObjects: [
      { label: "Explore ATLAS", href: "/atlas", kind: "ATLAS" },
      { label: "Read the 1.5°C explainer", href: "/labs/gold/story/explainer-1-5c", kind: "EXPLAINER" },
    ],
    editorialBoundary: "This NEWS proof reports the Copernicus dataset and its stated interpretation. It does not attribute any single disaster, death or local ecological outcome to the monthly global anomaly.",
  },
  {
    slug: "explainer-1-5c",
    format: "EXPLAINER",
    lane: "PLANET",
    headline: "The planet crossed 1.5°C again. That is not the same as crossing the Paris limit.",
    standfirst: "August 2026 was estimated at 1.65°C above the 1850–1900 baseline. The number is serious. The timescale is the part most headlines leave out.",
    byline: "4PLANET Magazine Desk",
    publishedLabel: "TEST EXPLAINER · 15 SEP 2026",
    readMins: 5,
    accent: "#ffd42a",
    visual: "THRESHOLD",
    numbers: [
      { value: "1 month", label: "AUGUST 2026", note: "1.65°C above estimated pre-industrial monthly average" },
      { value: "~20 years", label: "PARIS-LEVEL TIMESCALE", note: "WMO describes the long-term level as typically assessed over decades" },
    ],
    sections: [
      {
        kicker: "SHORT ANSWER",
        paragraphs: [
          "A month above 1.5°C is not the same metric as the Paris Agreement's long-term temperature goal. The monthly record tells us how hot the planet was over a short interval; the Paris threshold concerns sustained long-term warming.",
        ],
      },
      {
        kicker: "WHY THE DISTINCTION MATTERS",
        title: "Climate has weather inside it.",
        paragraphs: [
          "Monthly and annual temperatures move around the underlying warming trend because of natural variability, including El Niño and La Niña, volcanic activity and ocean circulation. That variability can push short periods above or below the longer-term level.",
          "WMO says the Paris 1.5°C level refers to long-term warming, typically assessed over roughly two decades. Temporary exceedances are expected to become more frequent as the underlying climate warms.",
        ],
      },
      {
        kicker: "THE WRONG CONCLUSION",
        paragraphs: [
          "It would be wrong to say that a single month means the Paris goal has been permanently breached. It would also be wrong to use that technical distinction to dismiss the record. Repeated temporary exceedances are warning signals that the long-term level is getting closer.",
        ],
      },
    ],
    sources: [
      {
        label: "Surface air temperature for August 2026",
        publisher: "Copernicus Climate Change Service / ECMWF",
        url: "https://climate.copernicus.eu/surface-air-temperature-august-2026",
        checkedAt: "2026-09-15",
        note: "Primary August 2026 anomaly and temperature figures.",
      },
      {
        label: "Global Annual to Decadal Climate Update",
        publisher: "World Meteorological Organization",
        url: "https://wmo.int/media/news/new-report-suggests-more-global-temperature-records-ahead",
        checkedAt: "2026-09-15",
        note: "Authority for the distinction between temporary exceedance and the Paris Agreement's sustained long-term warming level.",
      },
    ],
    relatedObjects: [
      { label: "Read the August record news", href: "/labs/gold/story/news-august-2026", kind: "NEWS" },
      { label: "Explore ATLAS", href: "/atlas", kind: "ATLAS" },
    ],
    editorialBoundary: "The explainer separates a short-term temperature observation from the long-term policy/science metric. It does not imply that the Paris goal is safe or achieved.",
  },
  {
    slug: "feature-blue-whale",
    format: "FEATURE",
    lane: "LIFE",
    headline: "The largest animal ever known is built on a world of krill",
    standfirst: "Blue whales can reach 110 feet and 330,000 pounds. Their scale makes headlines. Their dependence on tiny prey is the more revealing way into the ocean system around them.",
    byline: "4PLANET Magazine Desk",
    publishedLabel: "TEST FEATURE · 15 SEP 2026",
    readMins: 7,
    accent: "#78d7ff",
    visual: "WHALE",
    sections: [
      {
        kicker: "THE ANIMAL",
        paragraphs: [
          "The numbers are difficult to hold in the mind: a body up to 110 feet long, a weight up to 330,000 pounds, and a feeding ecology centred almost entirely on krill. Blue whales are the largest animals known to have lived on Earth, yet their everyday survival depends on finding dense patches of small crustaceans in a vast ocean.",
          "That mismatch in scale is more than trivia. It turns a charismatic species into a map of relationships: productive water, prey, movement, sound, shipping and fishing gear.",
        ],
      },
      {
        kicker: "THE SYSTEM",
        title: "A whale is an argument against looking at species alone.",
        paragraphs: [
          "NOAA describes blue whales as occurring in every ocean except the Arctic. That range makes a single place-based conservation story insufficient. Different populations encounter different waters, prey conditions and human pressures.",
          "The same source lists vessel strikes, fishing-gear entanglement and ocean noise among current threats. Each pressure has its own evidence path; none should be inferred from a beautiful photograph or a dot on a map.",
        ],
      },
      {
        kicker: "THE QUESTION",
        title: "Can we make an ocean-scale life legible without pretending it is simple?",
        paragraphs: [
          "The editorial challenge is to keep the animal at the centre while letting the system appear around it. Range is not presence now. An observation is not abundance. A known threat is not proof of impact in a particular place.",
          "A useful species story therefore ends with more context than it started with — and with fewer unsupported conclusions.",
        ],
      },
    ],
    sources: [
      {
        label: "Blue Whale",
        publisher: "NOAA Fisheries",
        url: "https://www.fisheries.noaa.gov/species/blue-whale",
        checkedAt: "2026-09-15",
        note: "Primary public source for size, feeding ecology, range and listed threats used in this feature proof.",
      },
    ],
    relatedObjects: [
      { label: "Open Blue Whale Species Gold", href: "/labs/gold/object/blue-whale", kind: "SPECIES" },
      { label: "Explore Living Systems", href: "/living-systems", kind: "LIVING SYSTEMS" },
      { label: "See the visual story", href: "/labs/gold/story/visual-blue-whale", kind: "VISUAL STORY" },
    ],
    editorialBoundary: "This FEATURE proof uses source-backed biological facts and editorial synthesis. It does not invent a field scene, individual whale, interview or local population trend.",
  },
  {
    slug: "visual-blue-whale",
    format: "VISUAL_STORY",
    lane: "LIFE",
    headline: "A blue whale, in six numbers",
    standfirst: "The world's largest animal is easier to understand when the scale is attached to ecology — not just spectacle.",
    byline: "4PLANET Visual Desk",
    publishedLabel: "TEST VISUAL STORY · 15 SEP 2026",
    readMins: 3,
    accent: "#5de1ff",
    visual: "NUMBERS",
    numbers: [
      { value: "110 ft", label: "LENGTH", note: "Maximum reported by NOAA Fisheries" },
      { value: "330,000 lb", label: "WEIGHT", note: "Maximum reported by NOAA Fisheries" },
      { value: "6 tons", label: "KRILL / DAY", note: "Some of the biggest individuals may eat up to this amount" },
      { value: "80–90 yrs", label: "ESTIMATED LIFESPAN", note: "NOAA Fisheries" },
      { value: "5", label: "RECOGNISED SUBSPECIES", note: "NOAA Fisheries" },
      { value: "0", label: "ARCTIC RANGE", note: "NOAA says blue whales occur in all oceans except the Arctic" },
    ],
    sections: [
      {
        kicker: "READ THE NUMBERS AS RELATIONSHIPS",
        paragraphs: [
          "Length and weight describe the animal. Krill intake describes the system it needs. Range describes the scale of the mapping problem. Threats describe where human systems intersect the story.",
          "A visual story should make those relationships visible without turning estimates into false precision. Every number on this page points back to the same source authority and keeps its wording intact.",
        ],
      },
    ],
    sources: [
      {
        label: "Blue Whale",
        publisher: "NOAA Fisheries",
        url: "https://www.fisheries.noaa.gov/species/blue-whale",
        checkedAt: "2026-09-15",
        note: "Source for all six figures in this visual proof.",
      },
    ],
    relatedObjects: [
      { label: "Open Blue Whale Species Gold", href: "/labs/gold/object/blue-whale", kind: "SPECIES" },
      { label: "Read the Feature", href: "/labs/gold/story/feature-blue-whale", kind: "FEATURE" },
    ],
    editorialBoundary: "Figures are source-bound and presented at the precision used by NOAA. The visual does not imply that every individual reaches the maximum values.",
  },
];

export function goldObjectBySlug(slug?: string) {
  return GOLD_OBJECT_PROOFS.find((item) => item.slug === slug);
}

export function goldStoryBySlug(slug?: string) {
  return GOLD_STORY_PROOFS.find((item) => item.slug === slug);
}
