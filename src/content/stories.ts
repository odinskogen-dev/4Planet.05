import type { Block } from "@/content/narratives";
import type { ImageKey } from "@/content/imageRegistry";
import type { MagazineLane, MagazineStoryMode } from "@/content/magazineOperating";
import type { MagazineFranchiseId } from "@/content/magazineEngine";

export type StoryCategory = "Perspectives" | "Mission Stories" | "Solutions";
export type StoryEditorialType = "ORGANISATIONAL_EXPLAINER" | "INDEPENDENT_EDITORIAL" | "PARTNER_SUBMITTED";

export interface StoryPathway {
  label: string;
  to: string;
  kind: "atlas" | "species" | "mission" | "living_systems" | "impact" | "domain" | "magazine" | "actor";
}

export interface StorySource {
  label: string;
  publisher: string;
  url: string;
  publishedAt?: string;
  checkedAt: string;
  supports: string;
  limitation?: string;
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
  readMins: number;
  tags: string[];
  pathway?: StoryPathway;
  sources?: StorySource[];
  gold?: boolean;
  blocks: Block[];
}

const L = (t: string): Block => ({ k: "lead", t });
const P = (t: string): Block => ({ k: "para", t });
const Q = (t: string): Block => ({ k: "quote", t });
const S = (t: string): Block => ({ k: "sub", t });

export const STORIES: Story[] = [
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
    readMins: 4,
    tags: ["4planet", "participation", "trust", "living systems"],
    pathway: { label: "Explore Living Systems", to: "/living-systems", kind: "living_systems" },
    blocks: [
      L("Everything we depend on is alive. Clean air, fresh water, food, stable weather and the materials we build with all rest on living systems — and those systems are under pressure."),
      P("Most people already understand this. What they struggle to find is a way in: a route from concern to action that is specific, honest and easy to follow. Environmental information tends to arrive as either abstract crisis or vague reassurance, and neither turns into participation."),
      S("The gap"),
      P("Between the science and the public sits an intermediary problem. Credible work exists — in research, conservation and restoration — but it is hard to see, hard to trust from the outside, and hard to join without specialist knowledge. 4Planet is built to close that gap."),
      Q("Make the living systems under pressure easier to understand, credible action easier to join, and real progress easier to follow."),
      P("It does this by organising the living world into connected Domains, developing Missions around specific challenges inside them, and bringing together people, field organisations, scientists, brands and funders around that work."),
      P("The discipline is truthfulness. Nothing is presented as delivered, verified or approved until it is. Where a pathway is still in development, the site says so. Trust is the product."),
    ],
  },
  {
    slug: "the-four-domains",
    title: "The four Domains",
    dek: "One living planet, read through four connected worlds — ocean, land, human systems and culture.",
    category: "Perspectives",
    lane: "PLANET",
    mode: "EVERGREEN",
    franchise: "PLANET_EXPLAINED",
    editorialType: "ORGANISATIONAL_EXPLAINER",
    byline: "4PLANET Editorial Desk",
    image: "e4rthDomainHero",
    readMins: 4,
    tags: ["ocean", "land", "human systems", "culture", "4planet"],
    pathway: { label: "Explore the four Domains", to: "/domains", kind: "domain" },
    blocks: [
      L("A planet is too large to act on directly. 4Planet divides it into four Domains — each a distinct part of the living system, each with its own Missions."),
      S("OCE4N"),
      P("The living ocean: migration, currents, reefs, coasts and polar water. Systems defined by depth, movement and distance, and by how much of the planet's life they quietly support."),
      S("E4RTH"),
      P("The living land: forests, soil, species and the slow work of recovery. Texture, roots, rain and regrowth — landscapes that hold water, carbon and biodiversity together."),
      S("S4PIENS"),
      P("The systems we build: food, energy, cities and materials. Human infrastructure and the choices inside it — where most pressure is produced, and where redesign can do the most."),
      S("4CULTURE"),
      P("Culture for action: film, music, print, art, design and public gatherings. The world that turns understanding into participation — the deliberate odd-one-out of the four."),
      P("The Domains are not silos. Whales connect to climate, forests to food, culture to everything. Reading them separately is only a way in; the point is that they are one connected system."),
    ],
  },
  {
    slug: "wh4les-migratory-intelligence",
    title: "What a ferry can tell us about whales",
    dek: "In the Bay of Biscay, repeated crossings turn an ordinary transport route into a long-running window on marine life — if observation effort is kept separate from the animals themselves.",
    category: "Mission Stories",
    lane: "LIFE",
    mode: "EVERGREEN",
    franchise: "THE_LIVING_WORLD",
    editorialType: "ORGANISATIONAL_EXPLAINER",
    byline: "4PLANET Editorial Desk",
    image: "wh4lesHero",
    readMins: 6,
    tags: ["whales", "Bay of Biscay", "ORCA", "monitoring", "citizen science", "survey effort"],
    pathway: { label: "Enter the ORCA Living System", to: "/living-systems/orca", kind: "living_systems" },
    gold: true,
    sources: [
      {
        label: "Beaked whales in the Bay of Biscay",
        publisher: "ORCA",
        url: "https://orca.org.uk/news-blog/beaked-whales-in-the-bay-of-biscay",
        publishedAt: "2022-03-16",
        checkedAt: "2026-09-01",
        supports: "Long-term ferry survey effort, beaked-whale encounters and the distinction between observations, effort and inferred distribution.",
        limitation: "ORCA summary of a published analysis; this story does not turn encounter records into population estimates.",
      },
      {
        label: "Brittany Ferries End of Season Roundup 2025",
        publisher: "ORCA",
        url: "https://orca.org.uk/news-blog/brittany-ferries-end-of-season-roundup-2025",
        publishedAt: "2025",
        checkedAt: "2026-09-01",
        supports: "2025 survey programme scale, repeated ferry-route monitoring and ORCA's report that the Bay appeared unusually quiet that season.",
        limitation: "A quiet survey season is an observation requiring follow-up, not proof of a population decline or identified cause.",
      },
      {
        label: "Survey Highlights — Portsmouth–Santander 22/06/2026",
        publisher: "ORCA",
        url: "https://orca.org.uk/news-blog/survey-highlights-portsmouth-santander-22-06-2026",
        publishedAt: "2026-07-13",
        checkedAt: "2026-09-01",
        supports: "A recent 2026 example of trained surveyors repeatedly observing cetaceans while crossing the Bay of Biscay.",
        limitation: "One survey account is a snapshot, not a trend or abundance estimate.",
      },
    ],
    blocks: [
      L("A ferry is designed to move people across water. Run the same route again and again with trained observers on the bridge, and it can become something else as well: a repeatable line through a living sea."),
      P("That is the useful idea behind ORCA's ferry surveys. Surveyors record what they see, but the sightings are only half the evidence. The other half is effort: where the ship travelled, how much water was surveyed, when observations were possible and under what conditions."),
      S("The map is not the animals"),
      P("ORCA has described a long Bay of Biscay dataset in which 244,400 kilometres of surveyed water and 419 beaked-whale encounters from 2006 to 2018 were analysed to investigate how encounter rates varied across space and time. The result can inform questions about distribution and seasonality. It does not mean 419 whales lived there, and the route is not a migration track."),
      Q("A point on a map is an observation. A kilometre surveyed is effort. A population trend is a different claim."),
      P("That distinction sounds technical until it changes the story. More sightings can mean more animals, more observation effort, different routes, better conditions or some combination. Less can mean the reverse. Long-running monitoring becomes valuable because it gives analysts a better chance of separating those possibilities instead of treating every dot as equal."),
      S("A year that looked different"),
      P("ORCA reported 42 surveys across its Brittany Ferries programme between March and November 2025. Common dolphins were the most frequently recorded species. The organisation also described the Bay of Biscay as noticeably quiet for marine wildlife that season and explicitly framed the question as something long-term monitoring could investigate further — an anomaly to examine, not a cause already known."),
      P("The surveys continued in 2026. On a June Portsmouth–Santander crossing, ORCA surveyors again recorded common dolphins and later Cuvier's beaked whales among the observations described from the route. One crossing is not a trend. It is another piece of the time series."),
      S("What 4PLANET should do with this"),
      P("The useful public product is not a dramatic map covered in whale icons. It is a way to move from a species to a place, then into source records, survey effort, limitations and the people doing the monitoring — without silently changing what any of those things mean."),
      P("That is why the ORCA journey is a strong 4PLANET proof case. SPECIES can hold identity. ATLAS can hold spatial records and effort context. Living Systems can explain relationships. The Actor profile can show who does the work. Each surface can reuse the same evidence while keeping uncertainty visible."),
      Q("The goal is not to make the ocean look knowable. It is to make what we actually know easier to use."),
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
    readMins: 5,
    tags: ["restoration", "trees", "climate", "evidence", "impact"],
    pathway: { label: "Explore CLIM4TE", to: "/missions/clim4te", kind: "mission" },
    blocks: [
      L("Climate is the largest story we have and the hardest to feel. It arrives as targets and curves. What people struggle to see is where meaningful action can actually begin."),
      P("A forest is never just trees. It is climate, water, soil, fungi, birds and thousands of relationships growing together. Restoration that lasts is planting where planting is ecologically justified, protecting what is already intact, and improving the soils and wetlands that hold everything else together."),
      S("The first proof path"),
      P("Inside CLIM4TE sits Tree Unit — designed to support one tree through a verified delivery pathway. One tree, done credibly, tracked openly. It is the first operational proof path in the entire 4Planet system."),
      Q("When a pathway opens, it should open as proof — not as a promise."),
      P("It is deliberately not open yet. Species, location, cost, capacity, evidence requirements and reporting all have to be confirmed first. Until then the honest status is exactly what the site shows: partner validation pending, public support closed."),
      P("That restraint is the point. A credible tree pathway is defined less by how many trees it claims and more by what it refuses to claim before it can prove it."),
    ],
  },
  {
    slug: "amazonia-more-than-a-forest",
    title: "AM4ZONIA: more than a forest",
    dek: "The Amazon is closer to planetary infrastructure than to scenery.",
    category: "Mission Stories",
    lane: "PLANET",
    mode: "EVERGREEN",
    franchise: "THE_LIVING_WORLD",
    editorialType: "ORGANISATIONAL_EXPLAINER",
    byline: "4PLANET Editorial Desk",
    image: "amazoniaHero",
    readMins: 4,
    tags: ["amazon", "rainforest", "climate", "biodiversity", "am4zonia"],
    pathway: { label: "Enter AM4ZONIA", to: "/missions/am4zonia", kind: "mission" },
    blocks: [
      L("The Amazon is not simply a forest. It is a living climate system, a biodiversity system and a foundation for people far beyond its borders."),
      P("It moves water through the sky, stores carbon and holds an extraordinary density of life. Canopy, rivers, rainfall, soil, pollinators, seed dispersers and the Indigenous and local communities who steward it are one interdependent system — and the system is what does the work."),
      S("The pressure"),
      P("Deforestation, fires, extraction and fragmentation weaken the relationships that let rainforest stay rainforest. Past a certain point, damage changes rainfall, biodiversity and regional climate far beyond the forest edge."),
      Q("Protecting rainforest means protecting one of the living systems humanity depends on."),
      P("What helps is stronger protection of intact forest, support for Indigenous and local stewardship, credible conservation finance and a public that understands why an intact forest is worth far more standing than cleared."),
      P("AM4ZONIA is being developed to make that protection easier to understand, support and follow — with any unit model, cost and evidence standard described honestly as in development until it can be delivered and proven."),
    ],
  },
  {
    slug: "making-impact-easy",
    title: "Making impact easy — without making it fake",
    dek: "The hard part is not generosity. It is trust. 4Planet is built around that problem.",
    category: "Solutions",
    lane: "SOLUTIONS",
    mode: "EVERGREEN",
    franchise: "WHAT_WORKS",
    editorialType: "ORGANISATIONAL_EXPLAINER",
    byline: "4PLANET Editorial Desk",
    image: "footerPlanet",
    readMins: 4,
    tags: ["impact", "evidence", "trust", "delivery", "verification"],
    pathway: { label: "See Impact", to: "/impact", kind: "impact" },
    blocks: [
      L("Most people are willing to support real environmental work. What stops them is not generosity — it is not knowing what is real."),
      P("The internet is full of impact claims that cannot be checked: trees that may not exist, offsets that may not hold, totals that no one can verify. Every unverifiable claim makes the next credible one harder to believe."),
      S("A different default"),
      P("4Planet's Impact Pathways invert the usual order. A pathway does not open for public support the moment it is announced. It opens only when its delivery model, evidence requirements and reporting are in place."),
      Q("No pathway is open for public support yet. Each opens only when it can be delivered and proven."),
      P("That means saying 'not yet' often, and in public. It is slower, and it is the entire point: the easy, trustworthy version of impact can only exist on top of work that refused to fake it first."),
      P("When the first pathway opens, it will arrive with a delivery partner, a measurement method, an evidence standard and a reporting model — so that supporting it is both easy and true."),
    ],
  },
];

export const storyBySlug = (slug: string): Story | undefined => STORIES.find((s) => s.slug === slug);

export function relatedStories(story: Story, limit = 3): Story[] {
  const candidates = STORIES.filter((candidate) => candidate.slug !== story.slug).map((candidate) => {
    const sharedTags = candidate.tags.filter((tag) => story.tags.includes(tag)).length;
    const laneMatch = candidate.lane === story.lane ? 2 : 0;
    const franchiseMatch = candidate.franchise === story.franchise ? 2 : 0;
    const categoryMatch = candidate.category === story.category ? 1 : 0;
    return { candidate, score: sharedTags * 3 + laneMatch + franchiseMatch + categoryMatch };
  });

  return candidates
    .sort((a, b) => b.score - a.score || a.candidate.title.localeCompare(b.candidate.title))
    .slice(0, limit)
    .map(({ candidate }) => candidate);
}
