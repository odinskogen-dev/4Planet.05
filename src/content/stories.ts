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
    dek: "People care about the living world, but the route from concern to useful, credible action is still fragmented and surprisingly difficult to follow.",
    category: "Perspectives",
    lane: "HUMAN",
    mode: "EVERGREEN",
    franchise: "PLANET_EXPLAINED",
    editorialType: "ORGANISATIONAL_EXPLAINER",
    byline: "4PLANET Editorial Desk",
    image: "footerPlanet",
    imageRole: "CONTEXT",
    imageContextNote: "4PLANET planetary context image for this organisational explainer; it is not evidence of a specific project or outcome.",
    readMins: 5,
    tags: ["4planet", "participation", "trust", "living systems"],
    topics: ["PEOPLE", "SOLUTIONS", "NATURE"],
    pathway: { label: "Explore Living Systems", to: "/living-systems", kind: "living_systems" },
    blocks: [
      L("Everything we depend on is alive. Clean air, fresh water, food, stable weather and the materials we build with all rest on living systems — and those systems are under pressure."),
      P("Most people already understand the broad problem. What is harder is finding a useful way into it. Environmental information often arrives as either abstract crisis or vague reassurance: one asks for attention without agency, the other offers action without enough proof. Neither is a satisfying interface for somebody who wants to understand what is happening and do something proportionate."),
      S("The missing middle"),
      P("Between research and public action sits a translation and coordination problem. Credible work exists in field science, conservation, engineering, restoration, policy and culture, but it is scattered across institutions, datasets, reports and organisations. The people doing the work are often easier to find than the relationships between their work, the places it affects and the evidence that would let an outsider judge it."),
      Q("Make the living systems under pressure easier to understand, credible action easier to join, and real progress easier to follow."),
      P("4PLANET is an attempt to build that missing middle as shared infrastructure. A species can connect to its ecosystem; an ecosystem to pressures; pressures to solutions; solutions to actors; actors to projects and evidence; and, when authority and delivery are real, those objects can connect to action. The public interface should feel simple even when the underlying truth is not."),
      S("Trust is not a badge"),
      P("The discipline is to keep different kinds of truth separate. A listed organisation is not automatically a partner. A payment is not an ecological outcome. An occurrence record is not abundance. A beautiful visual is not field evidence. Where a pathway is still in development, the product should say so. That may make 4PLANET slower to make claims, but it makes the claims that survive much more useful."),
    ],
  },
  {
    slug: "the-four-domains",
    title: "Four ways into one living planet",
    dek: "Ocean, land, human systems and culture are different entrances into the same connected world — a way to make planetary complexity navigable without pretending it is separate.",
    category: "Perspectives",
    lane: "PLANET",
    mode: "EVERGREEN",
    franchise: "PLANET_EXPLAINED",
    editorialType: "ORGANISATIONAL_EXPLAINER",
    byline: "4PLANET Editorial Desk",
    image: "e4rthDomainHero",
    imageRole: "CONTEXT",
    imageContextNote: "4PLANET land context image for the Domain explainer; it does not represent every Domain or a specific monitored site.",
    readMins: 5,
    tags: ["ocean", "land", "human systems", "culture", "4planet"],
    topics: ["NATURE", "OCEAN", "CULTURE", "CITIES"],
    pathway: { label: "Explore the four Domains", to: "/domains", kind: "domain" },
    blocks: [
      L("A planet is too large to hold in your head at once. The problem with simplifying it is that the useful relationships are often the first things to disappear."),
      P("4PLANET uses four Domains as different entrances into the same connected system. They are not scientific partitions and they are not four separate planets. They are editorial and product lenses: broad enough to orient a reader, but porous enough that a whale can still lead into climate, a city into food, and a photograph into a restoration project."),
      S("Ocean"),
      P("OCE4N is the moving world: currents, reefs, coasts, polar water and animals whose lives routinely cross jurisdictions. It is where distance, depth, sound and movement make static maps especially easy to misunderstand."),
      S("Land"),
      P("E4RTH is forests, soil, freshwater, species and the slow architecture of recovery. Roots, rainfall, fungi, pollinators, fire and land use matter because terrestrial systems are built from relationships rather than isolated components."),
      S("Human systems"),
      P("S4PIENS follows the systems people design: food, energy, cities, materials and mobility. These are where ecological pressures are produced at scale, but also where engineering and behaviour can change the conditions that create them."),
      S("Culture"),
      P("4CULTURE treats film, photography, art, design, music and stories as real infrastructure for attention. Culture does not substitute for evidence or action; it changes what societies notice, what feels imaginable and which ideas travel."),
      Q("Separate entrances. Shared infrastructure. Controlled depth."),
      P("The point is not to keep these worlds apart. It is to make it possible to enter through one without flattening the others. A reader should be able to start with a jaguar, a ferry survey, a meal or a building and still discover the living system underneath."),
    ],
  },
  {
    slug: "wh4les-migratory-intelligence",
    title: "The intelligence that travels through whole oceans",
    dek: "A whale is not a single animal in empty water. It is part of a moving ocean system whose routes cross noise, shipping, fisheries, climate and borders.",
    category: "Mission Stories",
    lane: "LIFE",
    mode: "EVERGREEN",
    franchise: "THE_LIVING_WORLD",
    editorialType: "ORGANISATIONAL_EXPLAINER",
    byline: "4PLANET Editorial Desk",
    image: "wh4lesHero",
    imageRole: "CONTEXT",
    imageContextNote: "4PLANET whale context image; it is not a live location, migration record or evidence for a specific population claim in this explainer.",
    readMins: 5,
    tags: ["whales", "ocean", "migration", "monitoring", "wh4les"],
    topics: ["NATURE", "OCEAN", "SCIENCE"],
    pathway: { label: "Enter WH4LES", to: "/missions/wh4les", kind: "mission" },
    blocks: [
      L("Follow one whale for long enough and the ocean stops looking like a flat blue surface. It becomes a moving system of feeding grounds, deep water, coastlines, shipping routes, sound fields and seasonal change."),
      P("That shift in perspective matters because large cetaceans routinely cross boundaries that human institutions treat as separate. One animal can move between national waters, protected areas, busy transport corridors and regions with very different monitoring coverage. The ecological story travels farther than the administrative one."),
      S("Movement changes the conservation problem"),
      P("Shipping noise, vessel strike risk, fishing gear and prey change do not sit neatly in one place. Their relevance depends on species, population, season and geography. A map that makes those pressures look universal can be as misleading as a map that shows only a single observation point."),
      Q("A moving animal forces the interface to admit that context changes with place and time."),
      P("This is why monitoring effort belongs beside sightings. If people observed a route for many hours, that effort is part of the evidence. If a database contains an occurrence, it remains an occurrence rather than becoming a live position or a population estimate. The more compelling the visual story becomes, the more important those semantic boundaries are."),
      S("From species to system"),
      P("WH4LES is being developed as a way to connect species intelligence with ocean geography, actors, monitoring, pressures and possible responses. The ambition is not to turn every uncertainty into a dashboard. It is to let a reader move from one animal to the wider system without losing track of what is known, what is interpreted and what is still unresolved."),
    ],
  },
  {
    slug: "credible-tree-pathway",
    title: "What a credible tree pathway actually looks like",
    dek: "Planting the wrong thing in the wrong place can look like climate action while doing very little. A useful pathway starts with ecology, delivery and proof before it starts with the checkout button.",
    category: "Solutions",
    lane: "SOLUTIONS",
    mode: "EVERGREEN",
    franchise: "WHAT_WORKS",
    editorialType: "ORGANISATIONAL_EXPLAINER",
    byline: "4PLANET Editorial Desk",
    image: "clim4teHero",
    imageRole: "CONTEXT",
    imageContextNote: "4PLANET forest context image; it is not evidence of a delivered Tree Unit, partner site or restoration outcome.",
    readMins: 5,
    tags: ["restoration", "trees", "climate", "evidence", "impact"],
    topics: ["SOLUTIONS", "CLIMATE", "NATURE"],
    pathway: { label: "Explore CLIM4TE", to: "/missions/clim4te", kind: "mission" },
    blocks: [
      L("A forest is never just trees. It is climate, water, soil, fungi, insects, birds, mammals and thousands of relationships growing together over time."),
      P("That is why tree planting can be both useful and dangerously easy to oversimplify. A visible seedling makes a satisfying unit, but the ecological value depends on what is planted, where, why, under whose authority, what was there before, how the site is protected and what happens years after the photograph is taken."),
      S("Start with the place"),
      P("A credible pathway should begin with the ecological and social context rather than a target number. In some landscapes the right intervention may be assisted natural regeneration, protection of existing forest, wetland recovery or removing a pressure that prevents regrowth. Planting is a tool, not the definition of restoration."),
      Q("When a pathway opens, it should open as proof — not as a promise."),
      P("Inside CLIM4TE, Tree Unit is designed as a future interface for supporting a bounded piece of verified work. It remains closed while partner authority, location, cost, species, capacity, evidence requirements and reporting are unresolved. That status is intentional rather than a missing sales feature."),
      S("Separate payment from outcome"),
      P("Even after a transaction becomes possible, the chain still matters. Payment can prove that money moved. Delivery evidence can show that agreed work occurred. Later monitoring can indicate survival or ecological change. None of those automatically proves long-term climate benefit or restoration success. Keeping those levels separate is what makes a simple public action credible enough to deserve simplicity."),
    ],
  },
  {
    slug: "amazonia-more-than-a-forest",
    title: "The Amazon is more than a forest",
    dek: "It is a water system, a climate system and a living network whose effects reach far beyond the tree line — which is why a single deforestation number can never tell the whole story.",
    category: "Mission Stories",
    lane: "PLANET",
    mode: "EVERGREEN",
    franchise: "THE_LIVING_WORLD",
    editorialType: "ORGANISATIONAL_EXPLAINER",
    byline: "4PLANET Editorial Desk",
    image: "amazoniaHero",
    imageRole: "CONTEXT",
    imageContextNote: "4PLANET rainforest context image; it is not evidence of a named project, current fire event or specific conservation outcome.",
    readMins: 5,
    tags: ["amazon", "rainforest", "climate", "biodiversity", "am4zonia"],
    topics: ["NATURE", "CLIMATE", "SCIENCE"],
    pathway: { label: "Enter AM4ZONIA", to: "/missions/am4zonia", kind: "mission" },
    blocks: [
      L("The Amazon is not simply a forest. It is a living climate system, a water system, a biodiversity system and home to people whose knowledge and stewardship are part of the landscape’s future."),
      P("From above, canopy can make the region look like one continuous green surface. Underneath it is a much more complicated machine: rivers, rainfall, soils, trees, fungi, pollinators, seed dispersers, predators, prey and human communities operating across enormous gradients of water and land use."),
      S("Water travels through the forest"),
      P("Trees move water from soil to atmosphere, while large-scale circulation moves moisture across the continent. That means local forest loss can matter beyond the cleared patch. The useful question is not only how many hectares remain, but how fragmentation, fire, drought and land use alter the relationships that allow rainforest to keep functioning as rainforest."),
      Q("Protecting rainforest means protecting a system, not collecting scenic hectares."),
      P("Biodiversity adds another layer of dependence. Fruit-eating animals move seeds. Predators alter behaviour. Insects pollinate plants. Rivers connect terrestrial and aquatic food webs. Remove enough relationships and the landscape can change even where a satellite still sees green."),
      S("Make the system legible"),
      P("AM4ZONIA is being developed to connect species, ecosystem context, spatial data, actors, pressures and solutions without pretending one map layer explains the forest. The Gold test is whether a person can enter through one vivid object — a jaguar, a river, a fire signal, a community or a restoration project — and leave understanding more of the living network underneath."),
    ],
  },
  {
    slug: "making-impact-easy",
    title: "Making impact easy — without making it fake",
    dek: "The hard part is not generosity. It is trust: building an action that can feel effortless to a person while preserving enough evidence underneath to show what their money actually did.",
    category: "Solutions",
    lane: "SOLUTIONS",
    mode: "EVERGREEN",
    franchise: "WHAT_WORKS",
    editorialType: "ORGANISATIONAL_EXPLAINER",
    byline: "4PLANET Editorial Desk",
    image: "footerPlanet",
    imageRole: "CONTEXT",
    imageContextNote: "4PLANET planetary context image; it is not evidence that any Impact pathway has delivered ecological work or outcome.",
    readMins: 5,
    tags: ["impact", "evidence", "trust", "delivery", "verification"],
    topics: ["SOLUTIONS", "PEOPLE", "DESIGN"],
    pathway: { label: "See Impact", to: "/impact", kind: "impact" },
    blocks: [
      L("Most people are willing to support real environmental work. What stops many of them is not generosity. It is the suspicion that the simple button on the screen hides a chain they cannot see."),
      P("That suspicion is reasonable. Environmental claims can collapse different events into one reassuring number: money paid, units purchased, work delivered and ecological outcome are treated as if they happened at the same moment. They do not. A trustworthy interface has to make the action easy without making the evidence vague."),
      S("A different order"),
      P("4PLANET’s intended Impact model reverses the usual sales sequence. A pathway should not become publicly purchasable merely because the story is persuasive. Delivery authority, costs, capacity, evidence requirements, reporting and the meaning of the unit need to be defined first. If those pieces are not ready, the correct public state is closed."),
      Q("No pathway should become easy to buy before it is possible to prove."),
      P("When a pathway does open, the interface can become radically simple because the complexity has already been handled underneath. One tap can be honest only when the system knows what the tap means, who is responsible for delivery, what evidence should appear later and which claims remain outside the evidence."),
      S("Proof has layers"),
      P("A receipt can prove payment. A geotagged or partner-verified record can support delivery. Monitoring can show an observed change. Attribution asks whether that change resulted from the intervention, and long-term ecological outcome asks whether it persisted and mattered at system level. These are related objects, not synonyms."),
      P("The product ambition is therefore not friction for its own sake. It is to move rigor behind the interface so a person can act quickly, understand what happened and return later to see evidence that is specific enough to deserve their trust."),
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
