export type FilmResearchCandidate = {
  slug: string;
  title: string;
  year: number;
  focus: string;
  sourceUrl: string;
};

const PATAGONIA_CATALOGUE = "https://www.patagonia.com/films/all/";

/**
 * Research pool for 4PLANET FILMS.
 *
 * Admission rule: every title must have a current official or distributor route where a
 * reader can watch, rent, stream, view a trailer, or reach the film catalogue. This pool
 * is editorial research, not a claim that 4PLANET owns or licenses the underlying film.
 */
export const FILM_RESEARCH_CANDIDATES: FilmResearchCandidate[] = [
  { slug: "yanuni", title: "YANUNI", year: 2025, focus: "AMAZONIA / INDIGENOUS STEWARDSHIP", sourceUrl: "https://malaikapictures.com/portfolio/yanuni" },
  { slug: "the-territory", title: "The Territory", year: 2022, focus: "AMAZONIA / INDIGENOUS STEWARDSHIP", sourceUrl: "https://www.youtube.com/watch?v=wL9wvdbk7A4" },
  { slug: "seaspiracy", title: "Seaspiracy", year: 2021, focus: "OCEAN / FISHING", sourceUrl: "https://www.netflix.com/title/81014008" },
  { slug: "chasing-coral", title: "Chasing Coral", year: 2017, focus: "OCEAN / CLIMATE", sourceUrl: "https://chasingcoral.com/the-film/" },
  { slug: "cowspiracy", title: "Cowspiracy: The Sustainability Secret", year: 2014, focus: "FOOD / LAND / CLIMATE", sourceUrl: "https://www.cowspiracy.com/" },
  { slug: "kiss-the-ground", title: "Kiss the Ground", year: 2020, focus: "FOOD / SOIL / REGENERATION", sourceUrl: "https://www.youtube.com/watch?v=3iknWWKZOUs" },
  { slug: "my-octopus-teacher", title: "My Octopus Teacher", year: 2020, focus: "OCEAN / SPECIES / KELP", sourceUrl: "https://www.netflix.com/title/81045007" },
  { slug: "a-plastic-ocean", title: "A Plastic Ocean", year: 2016, focus: "OCEAN / PLASTIC", sourceUrl: "https://aplasticocean.movie/" },
  { slug: "common-ground", title: "Common Ground", year: 2023, focus: "FOOD / SOIL / SYSTEMS", sourceUrl: "https://commongroundfilm.org/" },
  { slug: "sea-of-shadows", title: "Sea of Shadows", year: 2019, focus: "OCEAN / SPECIES / WILDLIFE CRIME", sourceUrl: "https://www.youtube.com/watch?v=QiFjJCUd9ro" },
  { slug: "artifishal", title: "Artifishal", year: 2019, focus: "RIVERS / SALMON / RESTORATION", sourceUrl: PATAGONIA_CATALOGUE },
  { slug: "damnation", title: "DamNation", year: 2014, focus: "RIVERS / RESTORATION", sourceUrl: PATAGONIA_CATALOGUE },
  { slug: "public-trust", title: "Public Trust", year: 2020, focus: "PUBLIC LANDS / BIODIVERSITY", sourceUrl: "https://www.patagonia.com/films/public-trust/" },
  { slug: "we-the-power", title: "We the Power", year: 2021, focus: "RENEWABLE ENERGY / COMMUNITY", sourceUrl: "https://www.patagonia.com/stories/we-the-power/video-97465.html" },
  { slug: "blue-heart", title: "Blue Heart", year: 2018, focus: "RIVERS / HYDROPOWER", sourceUrl: PATAGONIA_CATALOGUE },
  { slug: "newtok", title: "Newtok", year: 2021, focus: "CLIMATE / COMMUNITY", sourceUrl: PATAGONIA_CATALOGUE },
  { slug: "the-scale-of-hope", title: "The Scale of Hope", year: 2022, focus: "CLIMATE / ACTION", sourceUrl: PATAGONIA_CATALOGUE },
  { slug: "takayna", title: "Takayna", year: 2018, focus: "FOREST / CONSERVATION", sourceUrl: PATAGONIA_CATALOGUE },
  { slug: "treeline", title: "Treeline", year: 2019, focus: "FOREST / CLIMATE", sourceUrl: PATAGONIA_CATALOGUE },
  { slug: "the-custodians", title: "The Custodians", year: 2024, focus: "OCEAN / SEAGRASS / RESTORATION", sourceUrl: PATAGONIA_CATALOGUE },
  { slug: "jalpi", title: "Jalpi", year: 2023, focus: "OCEAN / RESTORATION", sourceUrl: "https://www.patagonia.com/films/jalpi/" },
  { slug: "corazon-salado", title: "Corazón Salado", year: 2024, focus: "OCEAN / INDIGENOUS STEWARDSHIP", sourceUrl: PATAGONIA_CATALOGUE },
  { slug: "undammed", title: "Undammed", year: 2024, focus: "RIVERS / INDIGENOUS STEWARDSHIP", sourceUrl: PATAGONIA_CATALOGUE },
  { slug: "laxathjod", title: "Laxaþjóð | A Salmon Nation", year: 2024, focus: "SALMON / AQUACULTURE", sourceUrl: PATAGONIA_CATALOGUE },
  { slug: "range-rider", title: "Range Rider", year: 2023, focus: "WOLVES / COEXISTENCE", sourceUrl: PATAGONIA_CATALOGUE },
  { slug: "the-shitthropocene", title: "The Shitthropocene", year: 2024, focus: "CONSUMPTION / CIRCULARITY", sourceUrl: PATAGONIA_CATALOGUE },
  { slug: "district-15", title: "District 15", year: 2020, focus: "JUSTICE / POLLUTION", sourceUrl: PATAGONIA_CATALOGUE },
  { slug: "a-net-plus", title: "A Net Plus", year: 2018, focus: "OCEAN / CIRCULARITY", sourceUrl: PATAGONIA_CATALOGUE },
  { slug: "why-recycled", title: "Why Recycled?", year: 2020, focus: "FASHION / CIRCULARITY", sourceUrl: "https://www.patagonia.com/why-recycled/" },
  { slug: "estado-salmonero", title: "Estado Salmonero", year: 2019, focus: "OCEAN / AQUACULTURE", sourceUrl: PATAGONIA_CATALOGUE },
  { slug: "sea-country-malu-lag", title: "Sea Country / Malu Lag", year: 2025, focus: "ISLANDS / CLIMATE / CULTURE", sourceUrl: PATAGONIA_CATALOGUE },
  { slug: "running-up-for-air", title: "Running Up For Air", year: 2023, focus: "AIR / HEALTH / COMMUNITY", sourceUrl: PATAGONIA_CATALOGUE },
  { slug: "home-grown", title: "Home, Grown", year: 2023, focus: "BUILDINGS / LOW-CARBON MATERIALS", sourceUrl: "https://www.patagonia.com/stories/culture/workwear/home-grown/video-141549.html" },
  { slug: "bring-hemp-home-colorado", title: "Bring Hemp Home: Colorado", year: 2021, focus: "AGRICULTURE / HEMP / SOIL", sourceUrl: "https://eu.patagonia.com/nl/en/stories/culture/workwear/bring-hemp-home-colorado/video-96711.html" },
  { slug: "run-to-save-a-watershed", title: "Corriendo para salvar una Cuenca (Run to Save a Watershed)", year: 2021, focus: "WATER / HYDROPOWER / COMMUNITY", sourceUrl: "https://eu.patagonia.com/dk/en/stories/sports/trail-running/corriendo-para-salvar-una-cuenca-run-to-save-a-watershed/video-101876.html" },
  { slug: "cochamo-por-siempre", title: "Cochamó Por Siempre", year: 2026, focus: "CONSERVATION / COMMUNITY", sourceUrl: PATAGONIA_CATALOGUE },
  { slug: "we-can-get-there-from-here", title: "We Can Get There from Here", year: 2024, focus: "OCEAN / WORKING WATERFRONTS", sourceUrl: PATAGONIA_CATALOGUE },
  { slug: "the-green-buffalo", title: "The Green Buffalo", year: 2024, focus: "BUILDINGS / HEMP / INDIGENOUS", sourceUrl: "https://www.patagonia.com/stories/culture/workwear/the-green-buffalo/video-154708.html" },
  { slug: "fire-lines", title: "Fire Lines", year: 2024, focus: "FIRE / FOREST MANAGEMENT / INDIGENOUS KNOWLEDGE", sourceUrl: "https://eu.patagonia.com/ee/en/films/fire-lines/" },
  { slug: "totoganashi", title: "Totoganashi", year: 2024, focus: "OCEAN / COMMUNITY", sourceUrl: PATAGONIA_CATALOGUE },
  { slug: "this-is-not-a-drill", title: "This Is Not a Drill", year: 2026, focus: "FOSSIL FUELS / CLIMATE / ACTIVISM", sourceUrl: "https://www.patagonia.com/stories/planet/activism/this-is-not-a-drill/video-174878.html" },
  { slug: "hot-pink-dolphins", title: "Hot Pink Dolphins", year: 2024, focus: "DOLPHINS / OCEAN", sourceUrl: PATAGONIA_CATALOGUE },
  { slug: "tom", title: "Tom", year: 2024, focus: "FISH / OCEAN", sourceUrl: PATAGONIA_CATALOGUE },
  { slug: "the-last-observers", title: "The Last Observers", year: 2024, focus: "CLIMATE / OBSERVATION", sourceUrl: PATAGONIA_CATALOGUE },
  { slug: "the-ivory-game", title: "The Ivory Game", year: 2016, focus: "ELEPHANTS / WILDLIFE TRADE", sourceUrl: "https://www.netflix.com/title/80117533" },
  { slug: "mission-blue", title: "Mission Blue", year: 2014, focus: "OCEAN / CONSERVATION", sourceUrl: "https://www.netflix.com/title/70308278" },
  { slug: "breaking-boundaries", title: "Breaking Boundaries: The Science of Our Planet", year: 2021, focus: "PLANETARY BOUNDARIES / BIODIVERSITY", sourceUrl: "https://www.netflix.com/title/81336476" },
  { slug: "before-the-flood", title: "Before the Flood", year: 2016, focus: "CLIMATE / SYSTEMS", sourceUrl: "https://www.beforetheflood.com/" },
  { slug: "2040", title: "2040", year: 2019, focus: "SOLUTIONS / ENERGY / FOOD", sourceUrl: "https://www.modernfilms.com/2040" },
  { slug: "reinventing-power", title: "Reinventing Power: America’s Renewable Energy Boom", year: 2018, focus: "RENEWABLE ENERGY / JOBS", sourceUrl: "https://www.sierraclub.org/reinventing-power" },
];
