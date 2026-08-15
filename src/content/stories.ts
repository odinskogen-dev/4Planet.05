import type { Block } from "@/content/narratives";
import type { ImageKey } from "@/content/imageRegistry";

export type StoryCategory = "Perspectives" | "Mission Stories" | "Solutions";

export interface Story {
  slug: string;
  title: string;
  dek: string;
  category: StoryCategory;
  image: ImageKey;
  readMins: number;
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
    image: "footerPlanet",
    readMins: 4,
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
    image: "e4rthDomainHero",
    readMins: 4,
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
    image: "wh4lesHero",
    readMins: 5,
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
    image: "clim4teHero",
    readMins: 5,
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
    image: "amazoniaHero",
    readMins: 4,
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
    image: "footerPlanet",
    readMins: 4,
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
