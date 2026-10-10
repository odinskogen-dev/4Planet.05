import type { Block } from "@/content/narratives";
import type { ImageKey } from "@/content/imageRegistry";
import type { MagazineLane, MagazineStoryMode } from "@/content/magazineOperating";
import type { MagazineFranchiseId } from "@/content/magazineEngine";

export type StoryCategory = "Perspectives" | "Mission Stories" | "Solutions";
export type StoryEditorialType = "ORGANISATIONAL_EXPLAINER" | "INDEPENDENT_EDITORIAL" | "PARTNER_SUBMITTED";

export interface StoryPathway {
  label: string;
  to: string;
  kind: "atlas" | "species" | "mission" | "living_systems" | "impact" | "domain" | "magazine" | "participation";
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
  blocks: Block[];
  visuals?: ImageKey[];
}

const L = (t: string): Block => ({ k: "lead", t });
const P = (t: string): Block => ({ k: "para", t });
const Q = (t: string): Block => ({ k: "quote", t });
const S = (t: string): Block => ({ k: "sub", t });

export const STORIES: Story[] = [
  {
    slug: "why-4planet-exists",
    title: "For a Living Planet",
    dek: "The story of why 4PLANET exists — and why there is a place for everyone who wants to help.",
    category: "Perspectives",
    lane: "HUMAN",
    mode: "EVERGREEN",
    franchise: "PLANET_EXPLAINED",
    editorialType: "ORGANISATIONAL_EXPLAINER",
    byline: "4PLANET Editorial Desk",
    image: "earthrise",
    visuals: ["oce4nDomainHero", "whyImage", "participationField2"],
    readMins: 4,
    tags: ["4planet", "living planet", "participation", "truth", "purpose", "nature"],
    pathway: { label: "Find your part", to: "/join", kind: "participation" },
    blocks: [
      L("There is a moment many of us have felt. Standing beside an ocean. Walking through a forest. Watching an animal look back at us. Holding the hand of someone we love."),
      P("For a moment, the world does not feel like resources, markets, borders or data. It feels alive. And somehow, we know that we belong to it."),
      P("We are one human species, sharing one living planet with countless other forms of life. We breathe the same atmosphere. We depend on water, soil, oceans and living systems beneath almost everything we have built."),
      S("The strange thing about our moment"),
      P("Humanity has extraordinary power. We can see Earth from space. Understand life at remarkable depth. Connect people across continents in seconds. Build technologies our ancestors could barely have imagined."),
      P("And yet some of the most important problems on Earth remain painfully difficult to solve. Not because nobody cares."),
      P("People care. Scientists care. Communities care. Builders, teachers, entrepreneurs, artists, organisations and ordinary people care. Knowledge exists. Solutions exist. Resources exist. People willing to help exist. But too often, they remain disconnected."),
      P("Knowledge does not reach the decision. The right people never find each other. A solution cannot find support. Someone who wants to help does not know where to begin. An action happens, but nobody really knows what changed."),
      Q("The problem is not that nobody cares. The problem is that caring has never been connected to capability well enough."),
      S("Why 4PLANET exists"),
      P("4PLANET exists to help close that gap. To connect what we know with what we can do."),
      P("To understand the living planet more clearly. To help people make better decisions. To connect problems with solutions, people with people, and good intentions with useful action."),
      Q("Did it actually help?"),
      P("That is the question that keeps all of it honest. Caring without truth can become wishful thinking. Knowledge without action changes little. And power without responsibility can become part of the problem."),
      P("We believe intelligence, technology, creativity, business and capital can become powerful forces for good when they are pointed in the right direction — and held accountable to reality."),
      P("Our North Star is simple: help bring nature back into balance so people and the rest of nature can thrive together."),
      P("That means building useful things. Making them real. Learning from what works. Letting that learning compound. Becoming more capable — and using that growing capability to help more."),
      S("No one does this alone"),
      P("4PLANET cannot fix the planet. No company can. No government, scientist, activist, community or technology can solve problems this big alone. Together, we can do far more."),
      P("You do not need to be a scientist. You do not need to call yourself an activist. You do not need to know everything or dedicate your life to this work."),
      P("Maybe you can build. Discover. Teach. Fund. Create. Connect. Protect. Or simply notice something the rest of us have missed."),
      Q("There is a place for everyone who wants to help. Including you."),
      S("The future is not finished"),
      P("The problems are real. But the future is not finished. There are still forests to protect. Oceans to restore. Species to understand. Better technologies to invent. Better decisions to make. Better ways of living together to discover."),
      P("We inherited something extraordinary. What happens next is not already written."),
      P("So let us look closer. Stay curious. Love life. Tell the truth. Care deeply. Build useful things. Make them real. Use power for good. And leave this extraordinary place better than we found it."),
      Q("The future can be better. But it will not build itself."),
      P("4PLANET_ For a Living Planet."),
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
    title: "WH4LES: the intelligence that travels through whole oceans",
    dek: "A whale is not a single animal in empty water. It is part of the ocean's living infrastructure.",
    category: "Mission Stories",
    lane: "LIFE",
    mode: "EVERGREEN",
    franchise: "THE_LIVING_WORLD",
    editorialType: "ORGANISATIONAL_EXPLAINER",
    byline: "4PLANET Editorial Desk",
    image: "wh4lesHero",
    readMins: 5,
    tags: ["whales", "ocean", "migration", "monitoring", "wh4les"],
    pathway: { label: "Enter WH4LES", to: "/missions/wh4les", kind: "mission" },
    blocks: [
      L("Follow one whale for a year and you begin to see the ocean the way it actually works — not a flat blue surface, but a set of connected systems held together by movement."),
      P("Whales carry nutrients between feeding and breeding grounds across some of the longest migrations on Earth. Their presence supports the plankton productivity that feeds much of the sea and helps produce the oxygen we breathe."),
      S("The pressure"),
      P("Those corridors now cross shipping lanes, industrial noise, fishing gear and waters reshaped by a changing climate. Much of the pressure is hard to monitor, because the routes stretch across enormous distances and many jurisdictions at once."),
      Q("Whale protection is no longer only about whales. It is about protecting the systems they help keep alive."),
      P("Better monitoring across borders, quieter and safer shipping, protected routes and reduced entanglement all help — and underneath them, a public that understands why any of it matters."),
      P("WH4LES is being developed as a public Mission world for exactly that: whale intelligence, documentation and credible future partner pathways, connecting understanding, evidence and cultural reach into something people can follow."),
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
