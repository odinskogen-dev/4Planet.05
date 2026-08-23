import type { Block } from "@/content/narratives";
import type { ImageKey } from "@/content/imageRegistry";
import type { MagazineLane, MagazineStoryMode, MagazineTopicId } from "@/content/magazineOperating";
import type { MagazineFranchiseId } from "@/content/magazineEngine";

export type StoryCategory = "Perspectives" | "Mission Stories" | "Solutions" | "Field" | "Innovation" | "Science" | "Design";
export type StoryEditorialType = "ORGANISATIONAL_EXPLAINER" | "INDEPENDENT_EDITORIAL" | "SOURCE_REPORTED_EDITORIAL" | "PARTNER_SUBMITTED";
export type StoryImageRole = "DOCUMENTARY" | "CONTEXT" | "DATA";

export interface StoryPathway {
  label: string;
  to: string;
  kind: "atlas" | "species" | "mission" | "living_systems" | "impact" | "domain" | "magazine" | "actor";
}

export interface StorySourceLink {
  label: string;
  publisher: string;
  url: string;
  publishedAt?: string;
}

export interface Story {
  slug: string;
  title: string;
  dek: string;
  category: StoryCategory;
  lane: MagazineLane;
  mode: MagazineStoryMode;
  franchise: MagazineFranchiseId;
  editorialType: StoryEditorialType;
  byline: string;
  image: ImageKey;
  imageRole?: StoryImageRole;
  imageContextNote?: string;
  readMins: number;
  tags: string[];
  topics?: MagazineTopicId[];
  location?: string;
  asOf?: string;
  reportingNote?: string;
  sourceLinks?: StorySourceLink[];
  pathway?: StoryPathway;
  blocks: Block[];
}

const L = (t: string): Block => ({ k: "lead", t });
const P = (t: string): Block => ({ k: "para", t });
const Q = (t: string): Block => ({ k: "quote", t });
const S = (t: string): Block => ({ k: "sub", t });

export const STORIES: Story[] = [
  {
    slug: "ocean-watch-1-8-million-kilometres",
    title: "The ocean watch that grew to 1.8 million kilometres",
    dek: "A ferry route became a long-running citizen-science system. Twenty-five years later, ORCA’s monitoring record shows what consistency at sea can become.",
    category: "Field",
    lane: "PEOPLE",
    mode: "DEEP",
    franchise: "FROM_THE_FIELD",
    editorialType: "SOURCE_REPORTED_EDITORIAL",
    byline: "4PLANET Magazine",
    image: "oce4nDomainHero",
    imageRole: "CONTEXT",
    imageContextNote: "4PLANET ocean context image — not documentation of the surveys described in this story.",
    readMins: 6,
    tags: ["orca", "citizen science", "cetaceans", "monitoring", "survey effort", "ocean"],
    topics: ["FIELD", "PEOPLE", "OCEAN", "SCIENCE", "NATURE"],
    location: "Global oceans / Northeast Atlantic origin",
    asOf: "2026-08-23",
    reportingNote: "Reported from ORCA’s published 2026 State of Cetaceans material. 4PLANET did not independently verify each underlying survey record for this article.",
    sourceLinks: [
      { label: "The State of Cetaceans 2026", publisher: "ORCA", url: "https://orca.org.uk/our-impact/the-state-of-cetaceans", publishedAt: "2026-06" },
    ],
    pathway: { label: "Meet ORCA", to: "/actors/orca", kind: "actor" },
    blocks: [
      L("Conservation can look spectacular from a distance. Up close, it often looks like someone standing on a ship’s bridge for hours, scanning the same strip of sea with the same method, then doing it again tomorrow."),
      P("ORCA says its effort-based monitoring began in 2006 and has grown from survey work on a single ferry route into a global citizen-science programme. Its 2026 State of Cetaceans report records 4,731 dedicated surveys between 2006 and 2025, covering 1,848,758 kilometres and more than 60,000 hours of active searching."),
      S("The useful number is effort"),
      P("The headline is not simply how many whales or dolphins were seen. Survey effort matters because sightings only become interpretable when you know how, where and for how long people were looking. ORCA reports 363,193 individual cetaceans recorded across 54 species, but the monitoring system around those observations is what lets a long time series become useful."),
      Q("A wildlife sighting is a moment. Repeated, standardised observation can become infrastructure."),
      P("That distinction is important for public-facing nature data. An observation is not a population estimate. A route is not a migration track. A blank day is not proof that animals were absent. The value appears when methods, effort and limits remain attached to the record."),
      S("A human-scale science system"),
      P("The programme is also an example of a design problem that conservation repeatedly faces: how to make rigorous work repeatable by many people without pretending that participation alone guarantees scientific meaning. Training, standardisation and persistence are the quiet engineering layers underneath the romance of watching the horizon."),
      P("For 4PLANET, the interesting object is therefore not a whale counter. It is the chain: route → effort → observation → evidence → interpretation → protection decision. ORCA’s long-running survey model gives that chain a real-world shape."),
    ],
  },
  {
    slug: "five-am-bay-of-biscay",
    title: "5 a.m. on the bridge over the Bay of Biscay",
    dek: "A June survey from Portsmouth to Santander turns a famous stretch of ocean into something more specific: a working route, a method, and a morning spent looking carefully.",
    category: "Field",
    lane: "PEOPLE",
    mode: "DEEP",
    franchise: "FROM_THE_FIELD",
    editorialType: "SOURCE_REPORTED_EDITORIAL",
    byline: "4PLANET Magazine",
    image: "participationField2",
    imageRole: "CONTEXT",
    imageContextNote: "4PLANET field context image — not the ORCA survey vessel or survey team.",
    readMins: 5,
    tags: ["bay of biscay", "orca", "field operators", "common dolphins", "survey", "ferry"],
    topics: ["FIELD", "PEOPLE", "OCEAN", "NATURE"],
    location: "Portsmouth → Santander / Bay of Biscay",
    asOf: "2026-08-23",
    reportingNote: "Reconstructed from ORCA’s published survey highlight by an experienced Marine Mammal Surveyor. It is source-reported editorial, not original on-board reporting by 4PLANET.",
    sourceLinks: [
      { label: "Survey Highlights — Portsmouth–Santander 22/06/2026", publisher: "ORCA", url: "https://orca.org.uk/news-blog/survey-highlights-portsmouth-santander-22-06-2026", publishedAt: "2026-07-13" },
    ],
    pathway: { label: "Explore ORCA Actor Gold", to: "/actors/orca", kind: "actor" },
    blocks: [
      L("The alarm goes early at sea. On 22 June, an ORCA survey team aboard Brittany Ferries’ Salamanca was on the bridge at 5 a.m., north of the Channel Islands, beginning a day of structured looking."),
      P("ORCA’s published account describes common dolphins appearing through the day, ocean sunfish, and a late burst of roughly 60 common dolphins approaching from multiple directions as the ship neared the Bay of Biscay’s abyssal plain."),
      S("A route becomes a field site"),
      P("On the return from Santander, the team recorded two Cuvier’s beaked whales shortly after departure, then later common dolphins and the distant blow of a large whale. Another vessel on the wider survey network had recently recorded pilot whales, Cuvier’s beaked whales and northern bottlenose whales on a nearby crossing."),
      Q("The Bay of Biscay is not a blue gap between two countries. For a survey team, it is a sequence of hours, conditions, positions and possible encounters."),
      P("That is why this ferry corridor is useful as a 4PLANET pilot geography. It is legible enough to tell as a journey, but real enough to resist simplification. A line on a map must remain a survey corridor, not become an invented migration path. A dramatic encounter must remain a sighting, not become evidence of abundance."),
      S("The character is the method"),
      P("The people on the bridge matter because the science has a human interface. Someone has to arrive on time, know what counts, record effort, tolerate long quiet stretches and stay attentive when the sea suddenly becomes busy. Good environmental intelligence often begins there: not with a dashboard, but with disciplined attention."),
    ],
  },
  {
    slug: "air-filter-biodiversity-time-machine",
    title: "The air filter that became a biodiversity time machine",
    dek: "Researchers used decades-old aerosol filters from northern Sweden to reconstruct a surprisingly broad record of life — from microbes to mammals.",
    category: "Science",
    lane: "SOLUTIONS",
    mode: "EVERGREEN",
    franchise: "WHAT_WORKS",
    editorialType: "SOURCE_REPORTED_EDITORIAL",
    byline: "4PLANET Magazine",
    image: "whyImage",
    imageRole: "CONTEXT",
    imageContextNote: "4PLANET boreal-forest context image — not the Swedish monitoring station used in the study.",
    readMins: 6,
    tags: ["edna", "biodiversity", "monitoring", "air", "genomics", "sweden"],
    topics: ["INNOVATION", "TECHNOLOGY", "SCIENCE", "NATURE"],
    location: "Northern Sweden",
    asOf: "2026-08-23",
    reportingNote: "Based on a peer-reviewed Nature Communications study. Relative-abundance signals, detection and spatial origin remain method-dependent and are not equivalent to direct population counts.",
    sourceLinks: [
      { label: "Airborne eDNA captures three decades of ecosystem biodiversity", publisher: "Nature Communications", url: "https://www.nature.com/articles/s41467-025-67676-7", publishedAt: "2025-12-18" },
    ],
    pathway: { label: "Explore Living Systems", to: "/living-systems", kind: "living_systems" },
    blocks: [
      L("A machine built to watch for radioactive particles had quietly been collecting something else: traces of life."),
      P("Researchers analysed archived air filters from a radionuclide monitoring station in northern Sweden. The filters had been changed weekly and stored for decades. By sequencing environmental DNA trapped in them, the team reconstructed biodiversity signals spanning 34 years."),
      S("One substrate, thousands of genera"),
      P("The study reports more than 2,700 detected genera across the tree of life and weekly relative-abundance data over the sampled period. For some vertebrates, the abundance indices were congruent with traditional monitoring, while the researchers also found a long-term diversity decline consistent with contemporaneous forest management."),
      Q("The innovation is not only a new sensor. It is the discovery that an old sensor was already collecting a second kind of history."),
      P("That opens an intriguing design space. Air-quality and radionuclide networks already operate at scale. If some archived filters can be reused for biodiversity analysis, infrastructure built for one environmental purpose may carry latent ecological information for another."),
      S("The constraints are part of the invention"),
      P("The paper is explicit about limits: airborne eDNA is dilute, reference databases are incomplete, transport distances can be uncertain and many sequence reads cannot yet be classified. Detection is affected by biology, weather, sampling and the available genetic references."),
      P("That makes the work more interesting, not less. The emerging technology is not a magical census of everything alive. It is a new observational layer — powerful because it can sit beside traditional surveys rather than pretending to replace them."),
    ],
  },
  {
    slug: "mine-that-became-wetland",
    title: "How a dead mine became a wetland",
    dek: "In Portugal’s Greater Côa Valley, pits left by extraction began holding water. Rewilding teams decided not to erase the scars, but to work with what nature was already doing.",
    category: "Solutions",
    lane: "SOLUTIONS",
    mode: "DEEP",
    franchise: "WHAT_WORKS",
    editorialType: "SOURCE_REPORTED_EDITORIAL",
    byline: "4PLANET Magazine",
    image: "e4rthDomainHero",
    imageRole: "CONTEXT",
    imageContextNote: "4PLANET landscape context image — not Paul de Toirões.",
    readMins: 6,
    tags: ["rewilding", "wetland", "portugal", "restoration", "edna", "mine"],
    topics: ["SOLUTIONS", "FIELD", "NATURE", "SCIENCE", "DESIGN"],
    location: "Greater Côa Valley, Portugal",
    asOf: "2026-08-23",
    reportingNote: "Reported from Rewilding Europe’s account of work led by Rewilding Portugal. Claims about site change and survey results are attributed to that source.",
    sourceLinks: [
      { label: "A landscape reborn: rewilding is transforming an old mine in the Greater Côa Valley", publisher: "Rewilding Europe", url: "https://rewildingeurope.com/news/a-landscape-reborn-rewilding-is-transforming-an-old-mine-in-the-greater-coa-valley/", publishedAt: "2026-03-24" },
    ],
    pathway: { label: "Explore land restoration", to: "/missions/rewild-land", kind: "mission" },
    blocks: [
      L("Industrial landscapes are usually designed around removal: take material out, move water away, leave a simplified surface behind. At Paul de Toirões in Portugal, abandonment produced an accidental counter-design."),
      P("The former mine and quarry contains pits, banks and drainage scars from decades of extraction. After mining stopped, water collected in the excavated hollows. Rewilding Portugal began managing the roughly 300-hectare site in late 2022, combining natural regeneration with targeted interventions rather than trying to manufacture a pristine landscape from scratch."),
      S("Work with the geometry that exists"),
      P("Rewilding Europe describes a growing mosaic of lakes, ponds, ditches, wetlands and regenerating native forest. Interventions have included improving wildlife access, retaining water and addressing non-native plantations while allowing natural processes to do much of the ongoing work."),
      Q("Restoration can be an act of design restraint: change the conditions, then allow living systems to answer."),
      P("The site is being monitored rather than simply photographed as a before-and-after. Surveys in 2023 and 2024 recorded 94 aquatic plant species, while eDNA analysis reportedly detected more than 200 species. Rewilding Europe describes those surveys as baselines — a starting point for measuring change, not proof that every future improvement is caused by a single intervention."),
      S("A new kind of infrastructure"),
      P("The old mine is now also part of a wider ecological and economic landscape: a stepping stone for wildlife in the Greater Côa Valley and a destination for guided nature tourism. The most interesting transformation may be conceptual. A scar left by extraction has become physical structure that water, plants, animals and people can reuse."),
    ],
  },
  {
    slug: "ai-coral-photomosaics",
    title: "Can AI make coral restoration less manual?",
    dek: "Reef monitoring can require thousands of underwater images. Coral Restoration Foundation is trying to turn that visual burden into a faster, repeatable measurement workflow.",
    category: "Innovation",
    lane: "SOLUTIONS",
    mode: "EVERGREEN",
    franchise: "WHAT_WORKS",
    editorialType: "SOURCE_REPORTED_EDITORIAL",
    byline: "4PLANET Magazine",
    image: "cor4lHero",
    imageRole: "CONTEXT",
    imageContextNote: "4PLANET coral context image — not a CeruleanAI monitoring frame.",
    readMins: 5,
    tags: ["coral", "ai", "photomosaic", "monitoring", "restoration", "computer vision"],
    topics: ["INNOVATION", "TECHNOLOGY", "OCEAN", "SCIENCE", "SOLUTIONS"],
    location: "Florida’s Coral Reef / digital monitoring workflow",
    asOf: "2026-08-23",
    reportingNote: "Reported from Coral Restoration Foundation’s 2025 annual report. Platform capability and programme use are attributed to CRF; 4PLANET has not independently benchmarked model accuracy.",
    sourceLinks: [
      { label: "Coral Restoration Foundation 2025 Annual Report", publisher: "Coral Restoration Foundation", url: "https://coralrestoration.org/wp-content/uploads/2026/04/CRF-2025-Annual-Report_DIGITAL.pdf", publishedAt: "2026-04" },
    ],
    pathway: { label: "Explore COR4L", to: "/missions/cor4l", kind: "mission" },
    blocks: [
      L("Coral restoration has a scaling problem that is easy to miss in the heroic underwater photographs: somebody still has to measure what happened afterwards."),
      P("Photomosaics can turn thousands of overlapping reef images into spatial records that teams compare over time. Coral Restoration Foundation says its monitoring sequence includes baseline mosaics before restoration, time-zero mosaics after outplanting, then later monitoring at three months, one year and beyond."),
      S("Automating the unglamorous middle"),
      P("CRF developed a software platform called CeruleanAI to automate photomosaic generation and streamline the processing and organisation of large image sets. The organisation says the platform is used across its Florida restoration monitoring and that models are being trained to identify and measure key coral species."),
      Q("The useful role for AI may be less ‘decide what nature needs’ and more ‘remove hours of repetitive work from the evidence pipeline’."),
      P("That distinction matters. A model that speeds image processing does not prove ecological recovery. It can, however, make repeated measurement cheaper and more consistent — potentially freeing expert time for interpretation, field decisions and quality control."),
      S("A better interface between reef and record"),
      P("The strongest version of this idea is not AI as spectacle. It is a tighter loop between diver, image, spatial model, coral measurement and future survey. The technology matters when it improves the reliability or frequency of the observation system around restoration."),
    ],
  },
  {
    slug: "roads-that-warn-cars-about-moose",
    title: "What if the road could warn the car before the moose arrives?",
    dek: "Norwegian researchers are looking beyond fences and crossings toward a more connected warning system built from sensors, wildlife data and vehicles themselves.",
    category: "Design",
    lane: "HUMAN",
    mode: "DEEP",
    franchise: "WHAT_WORKS",
    editorialType: "SOURCE_REPORTED_EDITORIAL",
    byline: "4PLANET Magazine",
    image: "circularCityHero",
    imageRole: "CONTEXT",
    imageContextNote: "4PLANET built-environment context image — not a WILDETECT test site.",
    readMins: 6,
    tags: ["wildlife crossings", "moose", "roads", "sensors", "mobility", "norway", "wildetect"],
    topics: ["DESIGN", "INNOVATION", "TECHNOLOGY", "CITIES", "NATURE", "SCIENCE"],
    location: "Norway",
    asOf: "2026-08-23",
    reportingNote: "Reported from SINTEF’s May 2026 description of the WILDETECT research project. Proposed warning concepts remain research directions, not deployed universal solutions.",
    sourceLinks: [
      { label: "Preventing wildlife collisions in new ways", publisher: "SINTEF", url: "https://www.sintef.no/en/latest-news/2026/preventing-wildlife-collisions-in-new-ways/", publishedAt: "2026-05-19" },
    ],
    pathway: { label: "Explore human systems", to: "/domains/s4piens", kind: "domain" },
    blocks: [
      L("A wildlife crossing is an architectural answer to a biological problem: an animal needs to move through a landscape that a road has cut in two. But concrete bridges and kilometres of fencing are not the only possible interface."),
      P("SINTEF’s WILDETECT project is mapping how Norway currently detects and responds to wildlife collision risk. The research points to a fragmented system: population data, collision records, vehicle information, sensors and user reports exist across different organisations and in different formats."),
      S("From reacting to predicting"),
      P("The project’s researchers describe much of the current system as reactive. They are exploring more flexible approaches built around earlier detection and more precise warning. One possible concept is direct animal warnings to vehicles in a relevant area — something that would require roads, cars and data systems to communicate."),
      Q("The design problem is not simply how to move an animal across a road. It is how to make transport infrastructure perceive the living landscape around it."),
      P("The constraints are physical. A train cannot swerve and needs a long stopping distance. A car has more options, but a warning must arrive at the right time and place. Animals also adapt to sounds and lights, so an intervention that works initially may lose effect."),
      S("Infrastructure as a sensing system"),
      P("SINTEF points to sensors, vehicle data, communication systems and drones as technologies with potential, while stressing data quality, standardisation, traffic safety, ethics and animal welfare. The interesting future is therefore not one gadget. It is an interoperable system that can notice risk early enough for both human and animal behaviour to change."),
    ],
  },
  {
    slug: "sea-pen-instead-of-tank",
    title: "A sea pen instead of a tank",
    dek: "A new dolphin refuge in southern Italy has received its final permits. The engineering challenge is to make lifetime care feel more like the sea without pretending captivity has disappeared.",
    category: "Solutions",
    lane: "LIFE",
    mode: "DEEP",
    franchise: "WHAT_WORKS",
    editorialType: "SOURCE_REPORTED_EDITORIAL",
    byline: "4PLANET Magazine",
    image: "oce4nDomainHero",
    imageRole: "CONTEXT",
    imageContextNote: "4PLANET ocean context image — not the San Paolo Dolphin Refuge or its future residents.",
    readMins: 5,
    tags: ["dolphins", "sanctuary", "animal welfare", "marine design", "italy", "jonian dolphin conservation"],
    topics: ["NATURE", "OCEAN", "SOLUTIONS", "DESIGN", "PEOPLE"],
    location: "Gulf of Taranto, Italy",
    asOf: "2026-08-23",
    reportingNote: "Reported from ORCA’s summary of the San Paolo Dolphin Refuge. The refuge is a developing care facility; this story does not claim release to the wild or ecological restoration.",
    sourceLinks: [
      { label: "Final permits granted for Europe’s first sea-based dolphin sanctuary", publisher: "ORCA", url: "https://orca.org.uk/news-blog/final-permits-granted-for-europes-first-sea-based-dolphin-sanctuary", publishedAt: "2026-08-14" },
    ],
    pathway: { label: "Explore ocean life", to: "/domains/oce4n", kind: "domain" },
    blocks: [
      L("Some captive dolphins cannot simply be released into open water. They may never have learned to forage independently, or may need lifelong veterinary support. That leaves a difficult design question: what does a better form of captivity look like?"),
      P("The San Paolo Dolphin Refuge, developed by Jonian Dolphin Conservation in southern Italy, has received its final permits. ORCA reports that the project occupies a seven-hectare marine area beside San Paolo Island in the Gulf of Taranto, with a 1,600-square-metre sea pen at its centre."),
      S("More sea, still care"),
      P("The enclosure is connected to a smaller care area and veterinary platform. The wider facility includes caregiver accommodation, food preparation and storage, shade, lighting, cameras and marine sensors linked to a control room."),
      Q("A sanctuary is not freedom. Its value has to be judged against the reality of animals that may still need human care for life."),
      P("The refuge is expected to begin with a small number of dolphins and expand gradually. Natural seawater, weather, sound and a larger marine environment can offer more complexity than a conventional tank, while the animals remain monitored and supported."),
      S("Designing the transition"),
      P("This is why the project belongs in both an animal-welfare and an engineering conversation. It is architecture at the edge of biology: enclosure, water quality, veterinary access, surveillance, shelter and behavioural needs all have to coexist. The interesting question is not whether a sea pen solves captivity. It is whether careful design can make an unavoidable care situation materially better."),
    ],
  },
  {
    slug: "why-4planet-exists",
    title: "Why 4Planet exists",
    dek: "People care about the living world. What they rarely have is a clear, credible way to act.",
    category: "Perspectives",
    lane: "HUMAN",
    mode: "EVERGREEN",
    franchise: "PLANET_EXPLAINED",
    editorialType: "ORGANISATIONAL_EXPLAINER",
    byline: "4PLANET Editorial Desk",
    image: "footerPlanet",
    imageRole: "CONTEXT",
    readMins: 4,
    tags: ["4planet", "participation", "trust", "living systems"],
    topics: ["PEOPLE", "SOLUTIONS"],
    pathway: { label: "Explore Living Systems", to: "/living-systems", kind: "living_systems" },
    blocks: [
      L("Everything we depend on is alive. Clean air, fresh water, food, stable weather and the materials we build with all rest on living systems — and those systems are under pressure."),
      P("Most people already understand this. What they struggle to find is a way in: a route from concern to action that is specific, honest and easy to follow."),
      S("The gap"),
      P("Between the science and the public sits an intermediary problem. Credible work exists — in research, conservation and restoration — but it is hard to see, hard to trust from the outside, and hard to join without specialist knowledge. 4Planet is built to close that gap."),
      Q("Make the living systems under pressure easier to understand, credible action easier to join, and real progress easier to follow."),
      P("The discipline is truthfulness. Nothing is presented as delivered, verified or approved until it is. Where a pathway is still in development, the site says so. Trust is the product."),
    ],
  },
  {
    slug: "the-four-domains",
    title: "Four ways into one living planet",
    dek: "Ocean, land, human systems and culture are different entrances into the same connected world.",
    category: "Perspectives",
    lane: "PLANET",
    mode: "EVERGREEN",
    franchise: "PLANET_EXPLAINED",
    editorialType: "ORGANISATIONAL_EXPLAINER",
    byline: "4PLANET Editorial Desk",
    image: "e4rthDomainHero",
    imageRole: "CONTEXT",
    readMins: 4,
    tags: ["ocean", "land", "human systems", "culture", "4planet"],
    topics: ["NATURE", "OCEAN", "CULTURE", "CITIES"],
    pathway: { label: "Explore the four Domains", to: "/domains", kind: "domain" },
    blocks: [
      L("A planet is too large to act on directly. 4Planet uses four Domains as different ways into the same connected system."),
      S("Ocean"), P("Migration, currents, reefs, coasts and polar water — systems defined by movement, depth and distance."),
      S("Land"), P("Forests, soil, freshwater and species — landscapes held together by roots, water, climate and relationships."),
      S("Human systems"), P("Food, energy, cities and materials — where pressures are produced and where redesign can change them."),
      S("Culture"), P("Film, art, design, music and stories — the systems that determine what societies notice, value and choose."),
      P("The Domains are not silos. Whales connect to climate, forests to food, culture to everything. Separate entrances; shared infrastructure underneath."),
    ],
  },
  {
    slug: "wh4les-migratory-intelligence",
    title: "The intelligence that travels through whole oceans",
    dek: "A whale is not a single animal in empty water. It is part of a moving ocean system.",
    category: "Mission Stories",
    lane: "LIFE",
    mode: "EVERGREEN",
    franchise: "THE_LIVING_WORLD",
    editorialType: "ORGANISATIONAL_EXPLAINER",
    byline: "4PLANET Editorial Desk",
    image: "wh4lesHero",
    imageRole: "CONTEXT",
    readMins: 5,
    tags: ["whales", "ocean", "migration", "monitoring", "wh4les"],
    topics: ["NATURE", "OCEAN", "SCIENCE"],
    pathway: { label: "Enter WH4LES", to: "/missions/wh4les", kind: "mission" },
    blocks: [
      L("Follow one whale for a year and you begin to see the ocean the way it actually works — not a flat blue surface, but a set of connected systems held together by movement."),
      P("Whales move between feeding and breeding grounds across enormous distances. Their lives cross shipping, fishing, noise, protected areas and changing ocean conditions."),
      S("The pressure"),
      P("The challenge is partly spatial: pressures and protections are divided by jurisdictions while animals move through them."),
      Q("Whale conservation becomes more useful when the ocean is understood as a connected system rather than a collection of isolated sightings."),
      P("WH4LES is being developed to connect species, places, monitoring, evidence and credible action without turning observations into claims they cannot support."),
    ],
  },
  {
    slug: "credible-tree-pathway",
    title: "What a credible tree pathway actually looks like",
    dek: "Planting the wrong thing in the wrong place can look like climate action while doing very little.",
    category: "Solutions",
    lane: "SOLUTIONS",
    mode: "EVERGREEN",
    franchise: "WHAT_WORKS",
    editorialType: "ORGANISATIONAL_EXPLAINER",
    byline: "4PLANET Editorial Desk",
    image: "clim4teHero",
    imageRole: "CONTEXT",
    readMins: 5,
    tags: ["restoration", "trees", "climate", "evidence", "impact"],
    topics: ["SOLUTIONS", "CLIMATE", "NATURE"],
    pathway: { label: "Explore CLIM4TE", to: "/missions/clim4te", kind: "mission" },
    blocks: [
      L("A forest is never just trees. It is climate, water, soil, fungi, birds and thousands of relationships growing together."),
      P("Restoration that lasts means planting where planting is ecologically justified, protecting what is already intact and measuring what actually happens after money moves."),
      S("Proof before promise"),
      P("Inside CLIM4TE, Tree Unit is a design for a future verified delivery pathway. It remains closed until partner, location, cost, evidence and reporting controls are ready."),
      Q("When a pathway opens, it should open as proof — not as a promise."),
      P("That restraint is part of the product. A credible pathway is defined as much by what it refuses to claim as by what it eventually enables."),
    ],
  },
  {
    slug: "amazonia-more-than-a-forest",
    title: "The Amazon is more than a forest",
    dek: "It is a water system, a climate system and a living network whose effects reach far beyond the tree line.",
    category: "Mission Stories",
    lane: "PLANET",
    mode: "EVERGREEN",
    franchise: "THE_LIVING_WORLD",
    editorialType: "ORGANISATIONAL_EXPLAINER",
    byline: "4PLANET Editorial Desk",
    image: "amazoniaHero",
    imageRole: "CONTEXT",
    readMins: 4,
    tags: ["amazon", "rainforest", "climate", "biodiversity", "am4zonia"],
    topics: ["NATURE", "CLIMATE", "SCIENCE"],
    pathway: { label: "Enter AM4ZONIA", to: "/missions/am4zonia", kind: "mission" },
    blocks: [
      L("The Amazon is not simply a forest. It is a living climate system, a biodiversity system and a foundation for people far beyond its borders."),
      P("Canopy, rivers, rainfall, soil, pollinators, seed dispersers and human communities are interdependent parts of the same landscape."),
      S("The pressure"),
      P("Deforestation, fire, extraction and fragmentation weaken the relationships that let rainforest remain rainforest."),
      Q("Protecting rainforest means protecting a system, not collecting scenic hectares."),
      P("AM4ZONIA is being developed to make those relationships legible while keeping evidence and delivery claims separate from aspiration."),
    ],
  },
  {
    slug: "making-impact-easy",
    title: "Making impact easy — without making it fake",
    dek: "The hard part is not generosity. It is trust.",
    category: "Solutions",
    lane: "SOLUTIONS",
    mode: "EVERGREEN",
    franchise: "WHAT_WORKS",
    editorialType: "ORGANISATIONAL_EXPLAINER",
    byline: "4PLANET Editorial Desk",
    image: "footerPlanet",
    imageRole: "CONTEXT",
    readMins: 4,
    tags: ["impact", "evidence", "trust", "delivery", "verification"],
    topics: ["SOLUTIONS", "PEOPLE"],
    pathway: { label: "See Impact", to: "/impact", kind: "impact" },
    blocks: [
      L("Most people are willing to support real environmental work. What stops them is not generosity — it is not knowing what is real."),
      P("A trustworthy action pathway has to separate payment, delivery evidence and ecological outcome instead of collapsing them into one feel-good number."),
      S("A different default"),
      P("4Planet’s Impact Pathways are designed to remain closed until delivery, evidence and reporting requirements are in place."),
      Q("No pathway should become easy to buy before it is possible to prove."),
      P("The eventual goal is simple: a person should be able to act in seconds while the system underneath remains strict enough to deserve that simplicity."),
    ],
  },
];

export const storyBySlug = (slug: string): Story | undefined => STORIES.find((s) => s.slug === slug);

export function relatedStories(story: Story, limit = 3): Story[] {
  const candidates = STORIES.filter((candidate) => candidate.slug !== story.slug).map((candidate) => {
    const sharedTags = candidate.tags.filter((tag) => story.tags.includes(tag)).length;
    const sharedTopics = (candidate.topics ?? []).filter((topic) => story.topics?.includes(topic)).length;
    const laneMatch = candidate.lane === story.lane ? 2 : 0;
    const franchiseMatch = candidate.franchise === story.franchise ? 2 : 0;
    const categoryMatch = candidate.category === story.category ? 1 : 0;
    return { candidate, score: sharedTags * 3 + sharedTopics * 2 + laneMatch + franchiseMatch + categoryMatch };
  });

  return candidates
    .sort((a, b) => b.score - a.score || a.candidate.title.localeCompare(b.candidate.title))
    .slice(0, limit)
    .map(({ candidate }) => candidate);
}
