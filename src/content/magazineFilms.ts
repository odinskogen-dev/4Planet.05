export type FilmAccess = "FULL_FREE" | "STREAM" | "TRAILER" | "SOURCE";
export type FilmStatus = "PUBLISHED" | "RESEARCH";
export type FilmAccent = "blue" | "green" | "yellow" | "orange" | "pink" | "violet" | "cyan" | "ink";
export type FilmTopic = "OCEAN" | "LAND_WILDLIFE" | "FOOD" | "CLIMATE" | "ENERGY" | "SOLUTIONS" | "PEOPLE";

export type FilmRecord = {
  slug: string;
  title: string;
  year: number;
  focus: string;
  topics: FilmTopic[];
  status: FilmStatus;
  accent: FilmAccent;
  director: string;
  runtime: string;
  access: FilmAccess;
  platform: string;
  description: string;
  credit: string;
  watchUrl: string;
  trailerId?: string;
  imageUrl: string;
  fallbackImageUrl: string;
  imageAlt: string;
  imageCredit: string;
  imageRights: string;
  imageSourceUrl: string;
  sourceUrl: string;
  sourceLabel: string;
  sourceDescriptionUrl: string;
  selectionNote: string;
  availabilityNote: string;
};

type PublishedSeed = Omit<FilmRecord, "status" | "imageUrl" | "fallbackImageUrl" | "imageAlt" | "imageCredit" | "imageRights" | "imageSourceUrl" | "sourceDescriptionUrl"> & {
  imageVideoId?: string;
  imageUrlOverride?: string;
  imageFallbackOverride?: string;
  sourceDescriptionUrl?: string;
};

const FILM_ART_RIGHTS = "Official film/trailer promotional material used for editorial identification. Rights remain with the film and its rights holder.";
const youtubeThumb = (id: string, quality: "maxresdefault" | "hqdefault" = "maxresdefault") => `https://i.ytimg.com/vi/${id}/${quality}.jpg`;

function publishedFilm(seed: PublishedSeed): FilmRecord {
  const imageId = seed.imageVideoId ?? seed.trailerId;
  const imageUrl = seed.imageUrlOverride ?? (imageId ? youtubeThumb(imageId) : "");
  const fallbackImageUrl = seed.imageFallbackOverride ?? (imageId ? youtubeThumb(imageId, "hqdefault") : imageUrl);
  return {
    ...seed,
    status: "PUBLISHED",
    imageUrl,
    fallbackImageUrl,
    imageAlt: `${seed.title} — official film material`,
    imageCredit: `${seed.title} — official film/trailer material`,
    imageRights: FILM_ART_RIGHTS,
    imageSourceUrl: seed.sourceUrl,
    sourceDescriptionUrl: seed.sourceDescriptionUrl ?? seed.sourceUrl,
  };
}

function researchFilm(input: { slug: string; title: string; year: number; focus: string; topics: FilmTopic[]; sourceUrl: string; accent: FilmAccent }): FilmRecord {
  return {
    ...input,
    status: "RESEARCH",
    director: "EDITORIAL VERIFICATION PENDING",
    runtime: "TBC",
    access: "SOURCE",
    platform: "OFFICIAL / DISTRIBUTOR SOURCE",
    description: "Editorial research candidate. Publication remains gated on source, availability, credits and film-specific imagery.",
    credit: "Not published.",
    watchUrl: input.sourceUrl,
    imageUrl: "",
    fallbackImageUrl: "",
    imageAlt: "",
    imageCredit: "",
    imageRights: "UNPUBLISHED / NOT CLEARED FOR PUBLIC DISPLAY",
    imageSourceUrl: input.sourceUrl,
    sourceLabel: "EDITORIAL RESEARCH SOURCE",
    sourceDescriptionUrl: input.sourceUrl,
    selectionNote: "Research candidate.",
    availabilityNote: "Not published.",
  };
}

const published: FilmRecord[] = [
  publishedFilm({
    slug: "yanuni", title: "YANUNI", year: 2025, focus: "AMAZONIA / INDIGENOUS STEWARDSHIP", topics: ["LAND_WILDLIFE", "CLIMATE", "PEOPLE"], accent: "green", director: "Richard Ladkani", runtime: "112 MIN", access: "FULL_FREE", platform: "YOUTUBE / LEONARDO DICAPRIO",
    description: "Indigenous leader Juma Xipaia defends Xipaya territory in the Brazilian Amazon as illegal mining, politics and climate justice collide.", credit: "Directed by Richard Ladkani. Produced by Juma Xipaia, Leonardo DiCaprio, Anita Ladkani, Richard Ladkani, Jennifer Davisson and Phillip Watson.",
    watchUrl: "https://www.youtube.com/watch?v=RhDdAONYZeQ", trailerId: "80WKaCyAjUY", imageVideoId: "RhDdAONYZeQ", sourceUrl: "https://malaikapictures.com/portfolio/yanuni", sourceLabel: "MALAIKA PICTURES / OFFICIAL FILM PAGE", selectionNote: "Indigenous sovereignty, the Amazon and the human cost of defending a living system.", availabilityNote: "Released free globally on Leonardo DiCaprio’s official YouTube channel on 5 September 2026."
  }),
  publishedFilm({
    slug: "the-territory", title: "The Territory", year: 2022, focus: "AMAZONIA / INDIGENOUS STEWARDSHIP", topics: ["LAND_WILDLIFE", "CLIMATE", "PEOPLE"], accent: "orange", director: "Alex Pritz", runtime: "83 MIN", access: "TRAILER", platform: "NATIONAL GEOGRAPHIC",
    description: "The Uru-eu-wau-wau people confront deforestation and encroachment in the Brazilian Amazon while taking control of how their story is recorded.", credit: "Directed by Alex Pritz. Official trailer published by National Geographic Documentary Films.",
    watchUrl: "https://www.youtube.com/watch?v=wL9wvdbk7A4", trailerId: "wL9wvdbk7A4", sourceUrl: "https://www.youtube.com/watch?v=wL9wvdbk7A4", sourceLabel: "NATIONAL GEOGRAPHIC / OFFICIAL TRAILER", selectionNote: "Territory, forest loss, Indigenous agency and control of the narrative.", availabilityNote: "Official trailer route verified. Full streaming availability varies by market."
  }),
  publishedFilm({
    slug: "seaspiracy", title: "Seaspiracy", year: 2021, focus: "OCEAN / FISHING", topics: ["OCEAN", "FOOD", "CLIMATE"], accent: "cyan", director: "Ali Tabrizi", runtime: "89 MIN", access: "STREAM", platform: "NETFLIX",
    description: "A filmmaker investigates human pressures on marine life and the global fishing industry, following the trail from ocean damage to the systems behind it.", credit: "Directed by Ali Tabrizi. Official film information via Netflix.",
    watchUrl: "https://www.netflix.com/title/81014008", trailerId: "1Q5CXN7soQg", sourceUrl: "https://www.netflix.com/title/81014008", sourceLabel: "NETFLIX / OFFICIAL", selectionNote: "Fishing, marine biodiversity, seafood systems and contested sustainability claims.", availabilityNote: "Netflix availability can vary by country and subscription."
  }),
  publishedFilm({
    slug: "chasing-coral", title: "Chasing Coral", year: 2017, focus: "OCEAN / CLIMATE", topics: ["OCEAN", "CLIMATE"], accent: "pink", director: "Jeff Orlowski", runtime: "93 MIN", access: "STREAM", platform: "NETFLIX",
    description: "Divers, scientists and photographers build a visual record of coral bleaching and rapid change across reef systems around the world.", credit: "Directed by Jeff Orlowski. A production of Exposure Labs.",
    watchUrl: "https://www.netflix.com/title/80168188", trailerId: "b6fHA9R2cKI", sourceUrl: "https://chasingcoral.com/the-film/", sourceLabel: "CHASING CORAL / OFFICIAL", selectionNote: "Coral heat stress, visual evidence and climate-driven ecosystem change.", availabilityNote: "Netflix availability can vary by country and subscription."
  }),
  publishedFilm({
    slug: "cowspiracy", title: "Cowspiracy: The Sustainability Secret", year: 2014, focus: "FOOD / LAND / CLIMATE", topics: ["FOOD", "CLIMATE", "SOLUTIONS"], accent: "yellow", director: "Kip Andersen & Keegan Kuhn", runtime: "90 MIN", access: "SOURCE", platform: "OFFICIAL FILM",
    description: "An investigation into the environmental footprint of animal agriculture and why food-system impacts have often sat outside mainstream environmental campaigning.", credit: "Directed by Kip Andersen and Keegan Kuhn.",
    watchUrl: "https://www.cowspiracy.com/", trailerId: "nV04zyfLyN4", sourceUrl: "https://www.cowspiracy.com/", sourceLabel: "COWSPIRACY / OFFICIAL", selectionNote: "Food, land, water, emissions and the consequences of consumption.", availabilityNote: "Use the official film site for current viewing options; availability can change by market."
  }),
  publishedFilm({
    slug: "kiss-the-ground", title: "Kiss the Ground", year: 2020, focus: "FOOD / SOIL / REGENERATION", topics: ["FOOD", "CLIMATE", "SOLUTIONS"], accent: "green", director: "Joshua Tickell & Rebecca Harrell Tickell", runtime: "84 MIN", access: "TRAILER", platform: "OFFICIAL FILM",
    description: "Scientists, farmers and advocates explore regenerative agriculture and soil restoration as tools for rebuilding ecosystems, food systems and climate resilience.", credit: "Directed by Joshua Tickell and Rebecca Harrell Tickell.",
    watchUrl: "https://www.youtube.com/watch?v=3iknWWKZOUs", trailerId: "3iknWWKZOUs", sourceUrl: "https://www.youtube.com/watch?v=3iknWWKZOUs", sourceLabel: "OFFICIAL TRAILER", selectionNote: "A solutions-led film connecting soil, farming, ecosystems and regeneration.", availabilityNote: "Official trailer route verified. Full-film streaming availability varies by market."
  }),
  publishedFilm({
    slug: "my-octopus-teacher", title: "My Octopus Teacher", year: 2020, focus: "OCEAN / SPECIES / KELP", topics: ["OCEAN", "LAND_WILDLIFE", "PEOPLE"], accent: "violet", director: "Pippa Ehrlich & James Reed", runtime: "85 MIN", access: "STREAM", platform: "NETFLIX",
    description: "A filmmaker’s relationship with a wild octopus becomes an intimate route into the complexity of a South African kelp forest and the life within it.", credit: "Directed by Pippa Ehrlich and James Reed.",
    watchUrl: "https://www.netflix.com/title/81045007", trailerId: "3s0LTDhqe5A", sourceUrl: "https://www.netflix.com/title/81045007", sourceLabel: "NETFLIX / OFFICIAL", selectionNote: "Species behaviour, kelp forests and the emotional power of seeing an ecosystem through one animal.", availabilityNote: "Netflix availability can vary by country and subscription."
  }),
  publishedFilm({
    slug: "a-plastic-ocean", title: "A Plastic Ocean", year: 2016, focus: "OCEAN / PLASTIC", topics: ["OCEAN", "SOLUTIONS"], accent: "blue", director: "Craig Leeson", runtime: "102 MIN", access: "SOURCE", platform: "OFFICIAL FILM",
    description: "A global expedition traces plastic pollution through marine environments, wildlife and food chains while examining technologies and practical responses.", credit: "Directed by Craig Leeson.",
    watchUrl: "https://aplasticocean.movie/", trailerId: "gd9ZFVgoQ68", imageVideoId: "gd9ZFVgoQ68", sourceUrl: "https://aplasticocean.movie/", sourceLabel: "A PLASTIC OCEAN / OFFICIAL", selectionNote: "Ocean plastic pressure, marine life, food chains and solution pathways.", availabilityNote: "Use the official film route for current viewing options."
  }),
  publishedFilm({
    slug: "common-ground", title: "Common Ground", year: 2023, focus: "FOOD / SOIL / SYSTEMS", topics: ["FOOD", "CLIMATE", "SOLUTIONS"], accent: "orange", director: "Josh Tickell & Rebecca Tickell", runtime: "105 MIN", access: "SOURCE", platform: "OFFICIAL FILM",
    description: "Farmers, scientists and advocates examine the systems shaping American agriculture and the potential for regenerative farming and soil health to change them.", credit: "Directed by Josh Tickell and Rebecca Tickell.",
    watchUrl: "https://commongroundfilm.org/", trailerId: "6-M4Hq0MKFA", sourceUrl: "https://commongroundfilm.org/", sourceLabel: "COMMON GROUND / OFFICIAL", selectionNote: "Policy, farming, health, soil and regeneration in one food-systems story.", availabilityNote: "Use the official film site for current viewing options; availability varies by market."
  }),
  publishedFilm({
    slug: "sea-of-shadows", title: "Sea of Shadows", year: 2019, focus: "OCEAN / SPECIES / WILDLIFE CRIME", topics: ["OCEAN", "LAND_WILDLIFE", "PEOPLE"], accent: "ink", director: "Richard Ladkani", runtime: "104 MIN", access: "SOURCE", platform: "NATIONAL GEOGRAPHIC",
    description: "Scientists, investigators, journalists and activists confront an illegal wildlife-trafficking network whose fishing methods are pushing the vaquita toward extinction.", credit: "Directed by Richard Ladkani.",
    watchUrl: "https://www.youtube.com/watch?v=QiFjJCUd9ro", trailerId: "QiFjJCUd9ro", sourceUrl: "https://www.youtube.com/watch?v=QiFjJCUd9ro", sourceLabel: "NATIONAL GEOGRAPHIC / OFFICIAL", selectionNote: "A species-level crisis connected to fishing, organised crime and conservation action.", availabilityNote: "Official route verified. Full viewing availability varies by market."
  }),
  publishedFilm({
    slug: "artifishal", title: "Artifishal", year: 2019, focus: "RIVERS / SALMON / AQUACULTURE", topics: ["OCEAN", "FOOD", "SOLUTIONS"], accent: "pink", director: "Josh “Bones” Murphy", runtime: "79 MIN", access: "FULL_FREE", platform: "PATAGONIA FILMS",
    description: "A film about wild salmon, hatcheries and fish farms — and the human decisions shaping rivers, fisheries and the future of wild fish.", credit: "Directed and produced by Josh “Bones” Murphy; a film by Liars & Thieves!; executive produced by Yvon Chouinard.",
    watchUrl: "https://www.youtube.com/watch?v=XdNJ0JAwT7I", trailerId: "XdNJ0JAwT7I", sourceUrl: "https://www.youtube.com/watch?v=XdNJ0JAwT7I", sourceLabel: "PATAGONIA / OFFICIAL FULL FILM", selectionNote: "Wild salmon, aquaculture, river systems and the difference between managing nature and keeping it alive.", availabilityNote: "Full film is available free through Patagonia’s official release."
  }),
  publishedFilm({
    slug: "damnation", title: "DamNation", year: 2014, focus: "RIVERS / RESTORATION / INFRASTRUCTURE", topics: ["LAND_WILDLIFE", "ENERGY", "SOLUTIONS"], accent: "cyan", director: "Ben Knight & Travis Rummel", runtime: "88 MIN", access: "FULL_FREE", platform: "PATAGONIA FILMS",
    description: "A documentary about America’s changing relationship with dams, from infrastructure once celebrated as progress to river restoration and dam removal.", credit: "Directed by Ben Knight and Travis Rummel.",
    watchUrl: "https://www.youtube.com/watch?v=laTIbNVDQN8", trailerId: "laTIbNVDQN8", sourceUrl: "https://www.youtube.com/watch?v=laTIbNVDQN8", sourceLabel: "PATAGONIA / OFFICIAL FULL FILM", selectionNote: "Energy infrastructure, rivers, restoration and what happens when yesterday’s solution becomes today’s constraint.", availabilityNote: "Full film is available free through Patagonia’s official release."
  }),
  publishedFilm({
    slug: "public-trust", title: "Public Trust", year: 2020, focus: "PUBLIC LANDS / BIODIVERSITY / GOVERNANCE", topics: ["LAND_WILDLIFE", "CLIMATE", "PEOPLE"], accent: "green", director: "David Garrett Byars", runtime: "96 MIN", access: "FULL_FREE", platform: "PATAGONIA / YOUTUBE",
    description: "A film about the fight over America’s public lands and the people defending shared landscapes from extraction, privatisation and political pressure.", credit: "Directed by David Garrett Byars.",
    watchUrl: "https://www.youtube.com/watch?v=OGjnIG7puzY", trailerId: "OGjnIG7puzY", sourceUrl: "https://www.youtube.com/watch?v=OGjnIG7puzY", sourceLabel: "PATAGONIA / OFFICIAL FULL FILM", selectionNote: "Biodiversity is also governance: who decides what land is for, who benefits and what remains protected.", availabilityNote: "Full film is available free on Patagonia’s official YouTube channel."
  }),
  publishedFilm({
    slug: "we-the-power", title: "We the Power", year: 2021, focus: "RENEWABLE ENERGY / COMMUNITY", topics: ["ENERGY", "SOLUTIONS", "PEOPLE", "CLIMATE"], accent: "yellow", director: "David Garrett Byars", runtime: "39 MIN", access: "FULL_FREE", platform: "PATAGONIA / YOUTUBE",
    description: "A look at citizen-led renewable-energy cooperatives and the people trying to move energy ownership back into local communities.", credit: "Directed by David Garrett Byars.",
    watchUrl: "https://www.youtube.com/watch?v=75A9WGxoUn8", trailerId: "75A9WGxoUn8", sourceUrl: "https://www.youtube.com/watch?v=75A9WGxoUn8", sourceLabel: "PATAGONIA / OFFICIAL FULL FILM", selectionNote: "Energy transition through ownership, local incentives and renewable infrastructure rather than technology alone.", availabilityNote: "Full film is available free on Patagonia’s official YouTube channel."
  }),
  publishedFilm({
    slug: "blue-heart", title: "Blue Heart", year: 2019, focus: "RIVERS / HYDROPOWER / EUROPE", topics: ["LAND_WILDLIFE", "ENERGY", "SOLUTIONS", "PEOPLE"], accent: "blue", director: "Britton Caillouette", runtime: "43 MIN", access: "FULL_FREE", platform: "PATAGONIA / YOUTUBE",
    description: "A journey through some of Europe’s last wild rivers as communities and conservationists confront a wave of planned hydropower development.", credit: "Directed by Britton Caillouette.",
    watchUrl: "https://www.youtube.com/watch?v=OhmHByZ0Xd8", trailerId: "OhmHByZ0Xd8", sourceUrl: "https://www.youtube.com/watch?v=OhmHByZ0Xd8", sourceLabel: "PATAGONIA / OFFICIAL FULL FILM", selectionNote: "A useful tension inside the energy transition: renewable power can still carry ecological costs.", availabilityNote: "Full film is available free on Patagonia’s official YouTube channel."
  }),
  publishedFilm({
    slug: "the-custodians", title: "The Custodians", year: 2023, focus: "OCEAN / SEAGRASS / RESTORATION", topics: ["OCEAN", "CLIMATE", "SOLUTIONS", "PEOPLE"], accent: "cyan", director: "Arthur Neumeier", runtime: "17 MIN", access: "FULL_FREE", platform: "PATAGONIA / YOUTUBE",
    description: "People on Scotland’s west coast work to restore seagrass and rebuild the relationship between coastal communities and the habitats around them.", credit: "Directed by Arthur Neumeier. Project lead and producer Patricia Simon.",
    watchUrl: "https://www.youtube.com/watch?v=y8a8vuFx4N8", trailerId: "y8a8vuFx4N8", sourceUrl: "https://www.youtube.com/watch?v=y8a8vuFx4N8", sourceLabel: "PATAGONIA / OFFICIAL FULL FILM", selectionNote: "Restoration, local knowledge and coastal stewardship in seventeen minutes.", availabilityNote: "Full film is available free on Patagonia’s official YouTube channel."
  }),
  publishedFilm({
    slug: "mission-blue", title: "Mission Blue", year: 2014, focus: "OCEAN / CONSERVATION / EXPLORATION", topics: ["OCEAN", "CLIMATE", "PEOPLE", "SOLUTIONS"], accent: "violet", director: "Robert Nixon & Fisher Stevens", runtime: "95 MIN", access: "STREAM", platform: "NETFLIX",
    description: "A portrait of oceanographer Sylvia Earle and her campaign to build public support for protecting critical places in the ocean.", credit: "Directed by Robert Nixon and Fisher Stevens.",
    watchUrl: "https://www.netflix.com/title/70308278", trailerId: "B1wp2MQCsfQ", sourceUrl: "https://www.netflix.com/title/70308278", sourceLabel: "NETFLIX / OFFICIAL", selectionNote: "One person’s lifetime of ocean observation connected to protecting places at planetary scale.", availabilityNote: "Netflix availability can vary by country and subscription."
  }),
  publishedFilm({
    slug: "breaking-boundaries", title: "Breaking Boundaries: The Science of Our Planet", year: 2021, focus: "PLANETARY BOUNDARIES / BIODIVERSITY / CLIMATE", topics: ["CLIMATE", "LAND_WILDLIFE", "OCEAN", "SOLUTIONS"], accent: "pink", director: "Jon Clay", runtime: "75 MIN", access: "STREAM", platform: "NETFLIX",
    description: "Johan Rockström and David Attenborough explain the planetary-boundaries framework, the risks of destabilising Earth systems and the space in which humanity can still act.", credit: "Directed by Jon Clay. Featuring Johan Rockström and Sir David Attenborough.",
    watchUrl: "https://www.netflix.com/title/81336476", trailerId: "Gb6wQtNjblk", sourceUrl: "https://www.netflix.com/title/81336476", sourceLabel: "NETFLIX / OFFICIAL", selectionNote: "A clear systems-level explanation of planetary stability and the problem 4PLANET is trying to make navigable.", availabilityNote: "Netflix availability can vary by country and subscription."
  }),
  publishedFilm({
    slug: "the-ivory-game", title: "The Ivory Game", year: 2016, focus: "ELEPHANTS / WILDLIFE TRADE / CRIME", topics: ["LAND_WILDLIFE", "PEOPLE"], accent: "ink", director: "Kief Davidson & Richard Ladkani", runtime: "112 MIN", access: "STREAM", platform: "NETFLIX",
    description: "An investigation into the illegal ivory trade, following activists and investigators across networks connecting elephant poaching to international trafficking.", credit: "Directed by Kief Davidson and Richard Ladkani.",
    watchUrl: "https://www.netflix.com/title/80117533", trailerId: "3GPEKKaSmZY", sourceUrl: "https://www.netflix.com/title/80117533", sourceLabel: "NETFLIX / OFFICIAL", selectionNote: "Species loss as a network problem involving crime, demand, money, enforcement and local risk.", availabilityNote: "Netflix availability can vary by country and subscription."
  }),
  publishedFilm({
    slug: "the-biggest-little-farm", title: "The Biggest Little Farm", year: 2018, focus: "FOOD / BIODIVERSITY / REGENERATIVE FARMING", topics: ["FOOD", "LAND_WILDLIFE", "SOLUTIONS", "PEOPLE"], accent: "orange", director: "John Chester", runtime: "91 MIN", access: "STREAM", platform: "NEON / RENT OR BUY",
    description: "John and Molly Chester try to build a diverse farm by working with ecological relationships rather than against them, learning through pests, predators, soil and seasons.", credit: "Directed by John Chester.",
    watchUrl: "https://www.neonrated.com/film/the-biggest-little-farm", trailerId: "UfDTM4JxHl8", sourceUrl: "https://www.neonrated.com/film/the-biggest-little-farm", sourceLabel: "NEON / OFFICIAL FILM PAGE", selectionNote: "Food production as ecology: relationships, feedback loops, diversity and adaptation.", availabilityNote: "Official NEON page provides current rent/buy routes; price and availability vary by market."
  }),
  publishedFilm({
    slug: "newtok", title: "Newtok: The Water Is Rising", year: 2022, focus: "CLIMATE / COMMUNITY / RELOCATION", topics: ["CLIMATE", "PEOPLE"], accent: "cyan", director: "Michael Kirby Smith & Andrew Burton", runtime: "97 MIN", access: "FULL_FREE", platform: "PATAGONIA FILMS",
    description: "An Indigenous Yup’ik community in Alaska confronts erosion, thawing permafrost and flooding as the village works toward relocation.", credit: "Directed by Michael Kirby Smith and Andrew Burton.",
    watchUrl: "https://www.youtube.com/watch?v=_QNYQfdVEOk", trailerId: "_QNYQfdVEOk", sourceUrl: "https://www.youtube.com/watch?v=_QNYQfdVEOk", sourceLabel: "PATAGONIA / OFFICIAL FULL FILM", selectionNote: "Climate change experienced as place, home, infrastructure and community rather than an abstract graph.", availabilityNote: "Official Patagonia film route; current availability is linked."
  }),
  publishedFilm({
    slug: "the-scale-of-hope", title: "The Scale of Hope", year: 2022, focus: "CLIMATE / COMMUNICATION / ACTION", topics: ["CLIMATE", "SOLUTIONS", "PEOPLE"], accent: "yellow", director: "Josh “Bones” Murphy", runtime: "67 MIN", access: "FULL_FREE", platform: "PATAGONIA FILMS",
    description: "Former White House climate adviser Molly Kawahata examines how hope, communication and systemic change can shape a more effective response to the climate crisis.", credit: "Directed by Josh “Bones” Murphy.",
    watchUrl: "https://www.youtube.com/watch?v=BrmKoU2Oe5I", trailerId: "BrmKoU2Oe5I", sourceUrl: "https://www.youtube.com/watch?v=BrmKoU2Oe5I", sourceLabel: "PATAGONIA / OFFICIAL FULL FILM", selectionNote: "The psychology and communication infrastructure behind collective climate action.", availabilityNote: "Official Patagonia film route; current availability is linked."
  }),
  publishedFilm({
    slug: "takayna", title: "Takayna", year: 2018, focus: "FOREST / CONSERVATION / TASMANIA", topics: ["LAND_WILDLIFE", "CLIMATE", "PEOPLE"], accent: "green", director: "Alex Lowther", runtime: "37 MIN", access: "FULL_FREE", platform: "PATAGONIA FILMS",
    description: "A journey into Tasmania’s takayna / Tarkine, where rainforest, Aboriginal heritage, mining and logging pressures meet a campaign for permanent protection.", credit: "Directed by Alex Lowther.",
    watchUrl: "https://www.youtube.com/watch?v=MHdE2YCRjck", trailerId: "MHdE2YCRjck", sourceUrl: "https://www.youtube.com/watch?v=MHdE2YCRjck", sourceLabel: "PATAGONIA / OFFICIAL FULL FILM", selectionNote: "Ancient forest, cultural heritage and conservation conflict concentrated in one place.", availabilityNote: "Official Patagonia film route; current availability is linked."
  }),
  publishedFilm({
    slug: "treeline", title: "Treeline", year: 2019, focus: "FORESTS / CLIMATE / CULTURE", topics: ["LAND_WILDLIFE", "CLIMATE", "PEOPLE"], accent: "violet", director: "Jordan Manley", runtime: "40 MIN", access: "FULL_FREE", platform: "PATAGONIA FILMS",
    description: "Skiers, snowboarders, scientists and cultural practitioners travel through ancient forests in Japan, British Columbia and Nevada to understand the lives of trees.", credit: "Directed by Jordan Manley. Produced by Laura Yale and Monika McClure for Patagonia Films.",
    watchUrl: "https://www.youtube.com/watch?v=YCEaYInJbos", trailerId: "YCEaYInJbos", sourceUrl: "https://www.youtube.com/watch?v=YCEaYInJbos", sourceLabel: "PATAGONIA / OFFICIAL FULL FILM", selectionNote: "A patient, cinematic route into forests as living systems rather than scenery.", availabilityNote: "Official Patagonia film route; current availability is linked."
  }),
  publishedFilm({
    slug: "jalpi", title: "Jalpi", year: 2023, focus: "OCEAN / SEAGRASS / RESTORATION", topics: ["OCEAN", "SOLUTIONS", "PEOPLE"], accent: "cyan", director: "Nicole Gormley", runtime: "7 MIN", access: "FULL_FREE", platform: "PATAGONIA FILMS",
    description: "Ji Wook-cheol works to protect and regenerate underwater forests around Tongyeong, South Korea, and build support for marine protection.", credit: "Directed by Nicole Gormley.",
    watchUrl: "https://www.youtube.com/watch?v=dUfcDGZIruI", trailerId: "dUfcDGZIruI", sourceUrl: "https://www.youtube.com/watch?v=dUfcDGZIruI", sourceLabel: "PATAGONIA / OFFICIAL FULL FILM", selectionNote: "A seven-minute restoration story where place, marine habitat and local stewardship meet.", availabilityNote: "Full film is linked from Patagonia’s official film page."
  }),
  publishedFilm({
    slug: "corazon-salado", title: "Corazón Salado", year: 2023, focus: "OCEAN / INDIGENOUS STEWARDSHIP / PATAGONIA", topics: ["OCEAN", "PEOPLE", "SOLUTIONS"], accent: "pink", director: "Dani Casado", runtime: "27 MIN", access: "FULL_FREE", platform: "PATAGONIA FILMS",
    description: "Ramón Navarro joins members of the Kawésqar community working to protect ancestral waters in Chilean Patagonia from industrial pressure.", credit: "Directed by Dani Casado.",
    watchUrl: "https://www.youtube.com/watch?v=R48JeOPv1R4", trailerId: "R48JeOPv1R4", sourceUrl: "https://www.youtube.com/watch?v=R48JeOPv1R4", sourceLabel: "PATAGONIA / OFFICIAL FULL FILM", selectionNote: "Ocean conservation seen through Indigenous stewardship, place and industrial pressure.", availabilityNote: "Official Patagonia film route; current availability is linked."
  }),
  publishedFilm({
    slug: "undammed", title: "Undammed", year: 2024, focus: "RIVERS / INDIGENOUS STEWARDSHIP / RESTORATION", topics: ["LAND_WILDLIFE", "PEOPLE", "SOLUTIONS"], accent: "blue", director: "Shane Anderson", runtime: "17 MIN", access: "FULL_FREE", platform: "PATAGONIA FILMS",
    description: "A Yurok-led story of Klamath River dam removal, river restoration and the long campaign to bring salmon back to a living watershed.", credit: "Directed and produced by Shane Anderson. Patagonia Films / Swiftwater Films.",
    watchUrl: "https://www.youtube.com/watch?v=PoZKMtqK8u4", trailerId: "PoZKMtqK8u4", sourceUrl: "https://www.youtube.com/watch?v=PoZKMtqK8u4", sourceLabel: "PATAGONIA / OFFICIAL FULL FILM", selectionNote: "Infrastructure decisions connected directly to culture, fish and an entire river system.", availabilityNote: "Official Patagonia film route; current availability is linked."
  }),
  publishedFilm({
    slug: "laxathjod", title: "Laxaþjóð | A Salmon Nation", year: 2024, focus: "SALMON / AQUACULTURE / ICELAND", topics: ["OCEAN", "FOOD", "PEOPLE"], accent: "cyan", director: "Arthur Neumeier", runtime: "27 MIN", access: "FULL_FREE", platform: "PATAGONIA FILMS",
    description: "Communities in Iceland confront the expansion of open-net salmon farming and ask what kind of future remains for wild salmon and the fjords they inhabit.", credit: "Directed by Arthur Neumeier.",
    watchUrl: "https://www.youtube.com/watch?v=rfLBmMK1SAg", trailerId: "rfLBmMK1SAg", sourceUrl: "https://www.youtube.com/watch?v=rfLBmMK1SAg", sourceLabel: "PATAGONIA / OFFICIAL FULL FILM", selectionNote: "Aquaculture, wild salmon and community agency where food production meets ecosystem risk.", availabilityNote: "Full film is available through Patagonia’s official release."
  }),
  publishedFilm({
    slug: "range-rider", title: "Range Rider", year: 2023, focus: "WOLVES / RANCHING / COEXISTENCE", topics: ["LAND_WILDLIFE", "PEOPLE", "SOLUTIONS"], accent: "violet", director: "Colin Arisman", runtime: "29 MIN", access: "FULL_FREE", platform: "PATAGONIA FILMS",
    description: "A range rider in northeast Washington uses non-lethal methods to reduce conflict between wolves, livestock and ranching communities.", credit: "Directed by Colin Arisman. Produced by Wild Confluence Media. Presented by Peak Design in association with Patagonia Films.",
    watchUrl: "https://www.youtube.com/watch?v=KzG6kiMXO98", trailerId: "KzG6kiMXO98", sourceUrl: "https://www.youtube.com/watch?v=KzG6kiMXO98", sourceLabel: "PATAGONIA / OFFICIAL FULL FILM", selectionNote: "Coexistence designed in the field: predators, livelihoods, incentives and practical adaptation.", availabilityNote: "Official Patagonia film route; current availability is linked."
  }),
  publishedFilm({
    slug: "the-shitthropocene", title: "The Shitthropocene", year: 2024, focus: "CONSUMPTION / MATERIALS / CULTURE", topics: ["CLIMATE", "SOLUTIONS", "PEOPLE"], accent: "pink", director: "David Garrett Byars", runtime: "46 MIN", access: "FULL_FREE", platform: "PATAGONIA FILMS",
    description: "A provocative look at overproduction, consumption and the systems that keep filling everyday life with more cheap products than people or the planet need.", credit: "Directed by David Garrett Byars. Produced by Emily Perry. A Patagonia Films production.",
    watchUrl: "https://www.youtube.com/watch?v=4TsndZxysts", trailerId: "4TsndZxysts", sourceUrl: "https://www.youtube.com/watch?v=4TsndZxysts", sourceLabel: "PATAGONIA / OFFICIAL FULL FILM", selectionNote: "Culture, materials and consumption as environmental systems rather than lifestyle trivia.", availabilityNote: "Official Patagonia film route; current availability is linked."
  }),
  publishedFilm({
    slug: "a-net-plus", title: "A Net Plus", year: 2020, focus: "OCEAN / CIRCULARITY / FISHING NETS", topics: ["OCEAN", "SOLUTIONS"], accent: "blue", director: "Campbell Brewer", runtime: "8 MIN", access: "FULL_FREE", platform: "PATAGONIA FILMS",
    description: "Bureo and Patagonia trace discarded fishing nets from coastal collection to recycled material, showing a practical circular-design pathway.", credit: "Directed by Campbell Brewer.",
    watchUrl: "https://www.youtube.com/watch?v=4LHMZmtpZdg", trailerId: "4LHMZmtpZdg", sourceUrl: "https://www.youtube.com/watch?v=4LHMZmtpZdg", sourceLabel: "PATAGONIA / OFFICIAL FULL FILM", selectionNote: "A short, concrete example of waste, materials, traceability and circular design.", availabilityNote: "Official Patagonia film route; current availability is linked."
  }),
  publishedFilm({
    slug: "sea-country-malu-lag", title: "Sea Country / Malu Lag", year: 2025, focus: "ISLANDS / CLIMATE / CULTURE", topics: ["OCEAN", "CLIMATE", "PEOPLE"], accent: "violet", director: "Nicole Gormley", runtime: "14 MIN", access: "FULL_FREE", platform: "PATAGONIA FILMS",
    description: "A remote island community off northern Australia carries its relationship with Sea Country and its climate concerns into wider political arenas.", credit: "Directed by Nicole Gormley. Released by Patagonia Films.",
    watchUrl: "https://www.youtube.com/watch?v=1S8hXIht4PU", trailerId: "1S8hXIht4PU", sourceUrl: "https://www.youtube.com/watch?v=1S8hXIht4PU", sourceLabel: "PATAGONIA / OFFICIAL FULL FILM", selectionNote: "Climate change as culture, place and sovereignty — not merely temperature.", availabilityNote: "Official Patagonia film route; current availability is linked."
  }),
  publishedFilm({
    slug: "home-grown", title: "Home, Grown", year: 2023, focus: "BUILDINGS / LOW-CARBON MATERIALS", topics: ["CLIMATE", "SOLUTIONS", "PEOPLE"], accent: "green", director: "Forest Woodward", runtime: "12 MIN", access: "FULL_FREE", platform: "PATAGONIA FILMS",
    description: "Builders explore straw-bale construction and natural materials as a route toward lower-carbon buildings rooted in local resources.", credit: "Directed by Forest Woodward. Produced by Forest Woodward and Laura Yale for Patagonia.",
    watchUrl: "https://www.youtube.com/watch?v=lHx9nDOaXIQ", trailerId: "lHx9nDOaXIQ", sourceUrl: "https://www.youtube.com/watch?v=lHx9nDOaXIQ", sourceLabel: "PATAGONIA / OFFICIAL FULL FILM", selectionNote: "A compact materials-and-buildings solution with carbon, craft and place in the same frame.", availabilityNote: "Official Patagonia film route; current availability is linked."
  }),
  publishedFilm({
    slug: "fire-lines", title: "Fire Lines", year: 2024, focus: "FIRE / FORESTS / INDIGENOUS KNOWLEDGE", topics: ["LAND_WILDLIFE", "CLIMATE", "PEOPLE", "SOLUTIONS"], accent: "orange", director: "Ken Etzel & Gordon Klco", runtime: "44 MIN", access: "FULL_FREE", platform: "PATAGONIA FILMS",
    description: "A Northern California story about wildfire, forest management and the return of Indigenous fire knowledge to landscapes shaped by suppression.", credit: "A film by Ken Etzel and Gordon Klco.",
    watchUrl: "https://www.youtube.com/watch?v=z5-NvY3Hj0k", trailerId: "z5-NvY3Hj0k", sourceUrl: "https://www.youtube.com/watch?v=z5-NvY3Hj0k", sourceLabel: "PATAGONIA / OFFICIAL FULL FILM", selectionNote: "Fire as a living-system management problem where ecology, culture and policy meet.", availabilityNote: "Official Patagonia film route; current availability is linked."
  }),
  publishedFilm({
    slug: "this-is-not-a-drill", title: "This Is Not a Drill", year: 2026, focus: "FOSSIL FUELS / POLLUTION / ACTIVISM", topics: ["CLIMATE", "ENERGY", "PEOPLE"], accent: "orange", director: "Oren Jacoby", runtime: "80 MIN", access: "FULL_FREE", platform: "PATAGONIA FILMS",
    description: "Three grassroots activists confront oil and gas pollution and the political power surrounding fossil-fuel extraction in their communities.", credit: "Directed by Oren Jacoby. Written and produced by Betsy West.",
    watchUrl: "https://www.youtube.com/watch?v=kjcR-pAjBiw", trailerId: "kjcR-pAjBiw", sourceUrl: "https://www.youtube.com/watch?v=kjcR-pAjBiw", sourceLabel: "PATAGONIA / OFFICIAL FULL FILM", selectionNote: "The energy system viewed from the communities carrying its direct costs.", availabilityNote: "Official Patagonia full-film route; current availability is linked."
  }),
  publishedFilm({
    slug: "the-last-observers", title: "The Last Observers", year: 2024, focus: "CLIMATE / WEATHER / OBSERVATION", topics: ["CLIMATE", "PEOPLE"], accent: "violet", director: "Maja K. Mikkelsen", runtime: "24 MIN", access: "FULL_FREE", platform: "PATAGONIA FILMS",
    description: "Long-term weather observers Karin and Lennart document changing conditions while holding onto a patient practice of looking closely at nature.", credit: "Directed by Maja K. Mikkelsen. Produced by Adam Mikkelsen. Released by Patagonia.",
    watchUrl: "https://www.youtube.com/watch?v=nWbESISCdgA", trailerId: "nWbESISCdgA", sourceUrl: "https://www.youtube.com/watch?v=nWbESISCdgA", sourceLabel: "PATAGONIA / OFFICIAL FULL FILM", selectionNote: "Observation itself is infrastructure: years of careful measurement turn change into evidence.", availabilityNote: "Official Patagonia film route; current availability is linked."
  }),
  publishedFilm({
    slug: "we-can-get-there-from-here", title: "We Can Get There from Here", year: 2024, focus: "OCEAN / WORKING WATERFRONTS / AQUACULTURE", topics: ["OCEAN", "FOOD", "PEOPLE", "SOLUTIONS"], accent: "cyan", director: "Alex Lowther", runtime: "28 MIN", access: "FULL_FREE", platform: "PATAGONIA FILMS",
    description: "A Maine working-waterfront story follows oyster growers trying to build a lower-impact livelihood while reducing plastic in mariculture.", credit: "Directed by Alex Lowther.",
    watchUrl: "https://www.youtube.com/watch?v=ORse4_PburA", trailerId: "ORse4_PburA", sourceUrl: "https://www.youtube.com/watch?v=ORse4_PburA", sourceLabel: "PATAGONIA / OFFICIAL FULL FILM", selectionNote: "Food, materials, livelihoods and ocean health are inseparable on a working waterfront.", availabilityNote: "Official Patagonia film route; current availability is linked."
  }),
  publishedFilm({
    slug: "before-the-flood", title: "Before the Flood", year: 2016, focus: "CLIMATE / SYSTEMS / POLITICS", topics: ["CLIMATE", "PEOPLE", "SOLUTIONS"], accent: "blue", director: "Fisher Stevens", runtime: "96 MIN", access: "TRAILER", platform: "NATIONAL GEOGRAPHIC",
    description: "Leonardo DiCaprio travels across the world to understand climate disruption, its political economy and the responses available to societies now.", credit: "Directed by Fisher Stevens.",
    watchUrl: "https://www.beforetheflood.com/", trailerId: "f0z7Sf_S4tY", sourceUrl: "https://www.beforetheflood.com/", sourceLabel: "BEFORE THE FLOOD / OFFICIAL", selectionNote: "A broad entry point into climate science, politics, consumption and system-level response.", availabilityNote: "Official film site and trailer route linked; full viewing availability varies by market."
  }),
  publishedFilm({
    slug: "2040", title: "2040", year: 2019, focus: "SOLUTIONS / ENERGY / FOOD / SYSTEMS", topics: ["SOLUTIONS", "ENERGY", "FOOD", "CLIMATE"], accent: "yellow", director: "Damon Gameau", runtime: "92 MIN", access: "STREAM", platform: "MODERN FILMS / RENT OR BUY",
    description: "Damon Gameau travels to meet innovators and changemakers, asking what the world could look like by 2040 if existing climate and social solutions were rapidly scaled.", credit: "Directed by Damon Gameau.",
    watchUrl: "https://www.modernfilms.com/2040", sourceUrl: "https://www.modernfilms.com/2040", sourceLabel: "MODERN FILMS / OFFICIAL", selectionNote: "A rare environmental documentary built around concrete possibilities rather than collapse alone.", availabilityNote: "Modern Films lists current rent/buy routes; availability varies by market.",
    imageUrlOverride: "https://images.squarespace-cdn.com/content/v1/5ffde3b67374686520d5765f/1611080610078-KJ12P1CK3Z8LIZRL1TOR/2040-film.jpg", imageFallbackOverride: "https://images.squarespace-cdn.com/content/v1/5ffde3b67374686520d5765f/1611080610078-KJ12P1CK3Z8LIZRL1TOR/2040-1200-1200-675-675-crop-000000.jpg"
  }),
  publishedFilm({
    slug: "reinventing-power", title: "Reinventing Power: America’s Renewable Energy Boom", year: 2018, focus: "RENEWABLE ENERGY / JOBS / COMMUNITIES", topics: ["ENERGY", "SOLUTIONS", "PEOPLE", "CLIMATE"], accent: "green", director: "Tony Valentino", runtime: "50 MIN", access: "FULL_FREE", platform: "SIERRA CLUB / VIMEO",
    description: "A renewable-energy documentary told through workers and communities, connecting clean power to jobs, equity, innovation and local economic change.", credit: "Directed by Tony Valentino. Produced for the Sierra Club.",
    watchUrl: "https://vimeo.com/268692241", trailerId: "xx4P2yOXDDs", sourceUrl: "https://www.sierraclub.org/reinventing-power", sourceLabel: "SIERRA CLUB / OFFICIAL", selectionNote: "Energy transition as an employment, community and infrastructure story — not only a technology story.", availabilityNote: "The Sierra Club provides the film and current viewing routes."
  }),
];

const research: FilmRecord[] = [
  researchFilm({ slug: "district-15", title: "District 15", year: 2020, focus: "JUSTICE / POLLUTION", topics: ["PEOPLE", "CLIMATE", "SOLUTIONS"], sourceUrl: "https://www.patagonia.com/films/all/", accent: "orange" }),
  researchFilm({ slug: "why-recycled", title: "Why Recycled?", year: 2020, focus: "FASHION / CIRCULARITY", topics: ["SOLUTIONS", "CLIMATE"], sourceUrl: "https://www.patagonia.com/why-recycled/", accent: "yellow" }),
  researchFilm({ slug: "estado-salmonero", title: "Estado Salmonero", year: 2019, focus: "OCEAN / AQUACULTURE", topics: ["OCEAN", "FOOD", "PEOPLE"], sourceUrl: "https://www.patagonia.com/films/all/", accent: "cyan" }),
  researchFilm({ slug: "running-up-for-air", title: "Running Up For Air", year: 2023, focus: "AIR / HEALTH / COMMUNITY", topics: ["CLIMATE", "PEOPLE"], sourceUrl: "https://www.patagonia.com/films/all/", accent: "yellow" }),
  researchFilm({ slug: "bring-hemp-home-colorado", title: "Bring Hemp Home: Colorado", year: 2021, focus: "AGRICULTURE / HEMP / SOIL", topics: ["FOOD", "CLIMATE", "SOLUTIONS"], sourceUrl: "https://eu.patagonia.com/nl/en/stories/culture/workwear/bring-hemp-home-colorado/video-96711.html", accent: "green" }),
  researchFilm({ slug: "run-to-save-a-watershed", title: "Run to Save a Watershed", year: 2021, focus: "WATER / HYDROPOWER / COMMUNITY", topics: ["ENERGY", "LAND_WILDLIFE", "PEOPLE"], sourceUrl: "https://www.patagonia.com/films/all/", accent: "blue" }),
  researchFilm({ slug: "cochamo-por-siempre", title: "Cochamó Por Siempre", year: 2026, focus: "CONSERVATION / COMMUNITY", topics: ["LAND_WILDLIFE", "PEOPLE"], sourceUrl: "https://www.patagonia.com/films/all/", accent: "green" }),
  researchFilm({ slug: "the-green-buffalo", title: "The Green Buffalo", year: 2024, focus: "BUILDINGS / HEMP / INDIGENOUS", topics: ["SOLUTIONS", "PEOPLE", "CLIMATE"], sourceUrl: "https://www.patagonia.com/stories/culture/workwear/the-green-buffalo/video-154708.html", accent: "green" }),
  researchFilm({ slug: "totoganashi", title: "Totoganashi", year: 2024, focus: "OCEAN / COMMUNITY", topics: ["OCEAN", "PEOPLE"], sourceUrl: "https://www.patagonia.com/films/all/", accent: "blue" }),
  researchFilm({ slug: "hot-pink-dolphins", title: "Hot Pink Dolphins", year: 2024, focus: "DOLPHINS / OCEAN", topics: ["OCEAN", "LAND_WILDLIFE"], sourceUrl: "https://www.patagonia.com/films/all/", accent: "pink" }),
];

export const FILMS: FilmRecord[] = [...published, ...research];
export const PUBLISHED_FILMS = published;
export const RESEARCH_FILMS = research;

export function filmBySlug(slug?: string) {
  return PUBLISHED_FILMS.find((film) => film.slug === slug);
}

export function relatedFilms(slug: string, limit = 3) {
  const source = filmBySlug(slug);
  if (!source) return [];
  return PUBLISHED_FILMS
    .filter((film) => film.slug !== slug)
    .map((film) => ({ film, score: film.topics.filter((topic) => source.topics.includes(topic)).length }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || PUBLISHED_FILMS.indexOf(a.film) - PUBLISHED_FILMS.indexOf(b.film))
    .slice(0, limit)
    .map(({ film }) => film);
}
