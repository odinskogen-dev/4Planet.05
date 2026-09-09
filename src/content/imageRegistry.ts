import type { DomainKey } from "@/types/content";

// ── Central image asset registry ──────────────────────────────────────────────
// Single source of truth for documentary imagery. No paths scattered in components.
// Only supplied 4Planet library images + verified public-domain government frames are referenced.
export interface ImageMeta {
  src: string;
  srcMobile?: string;
  alt: string;
  credit?: string;
  licenseNote?: string;
  aspectRatio?: string;
  objectPosition?: string;
  domain?: DomainKey;
  mission?: string;
  role: "brand" | "editorial" | "founder" | "domainHero" | "missionHero";
}

const A = "/assets";

export const IMAGES = {
  // ── BRAND / PLANETARY ───────────────────────────────────────────────
  heroEarth: { src: `${A}/brand/earth-iss.jpg`, srcMobile: `${A}/brand/earth-iss-mobile.jpg`, alt: "Earth seen from low orbit beside a docked spacecraft module", licenseNote: "NASA — public domain", aspectRatio: "3/2", objectPosition: "50% 50%", role: "brand" },
  whyImage: { src: `${A}/brand/why-forest.jpg`, srcMobile: `${A}/brand/why-forest-mobile.jpg`, alt: "Forested mountain valley under low cloud", aspectRatio: "3/2", objectPosition: "50% 58%", role: "brand" },
  participationField: { src: `${A}/brand/participation-field.jpg`, srcMobile: `${A}/brand/participation-field-mobile.jpg`, alt: "A lone figure in a vast desert landscape at dusk", aspectRatio: "3/2", objectPosition: "50% 55%", role: "editorial" },
  participationField2: { src: `${A}/brand/participation-field-2.jpg`, alt: "People travelling by small wooden boat through a palm-lined river channel", aspectRatio: "3/2", objectPosition: "50% 50%", role: "editorial" },
  storyHero: { src: `${A}/brand/story-hero.jpg`, srcMobile: `${A}/brand/story-hero-mobile.jpg`, alt: "A single figure walking across vast desert dunes, footprints trailing behind", aspectRatio: "3/2", objectPosition: "50% 50%", role: "founder" },
  e4rthField: { src: `${A}/domains/e4rth/detail-01.jpg`, alt: "A single figure walking across vast desert dunes", aspectRatio: "3/2", objectPosition: "50% 50%", domain: "E4RTH_", role: "editorial" },
  founderFieldImage: { src: `${A}/brand/about-field.jpg`, alt: "Turf-roofed village settlement below a fog-covered hillside", aspectRatio: "3/2", objectPosition: "50% 60%", role: "founder" },
  brandAstronaut: { src: `${A}/brand/astronaut.jpg`, alt: "A lone astronaut drifting in space above the curve of Earth", licenseNote: "NASA — public domain", aspectRatio: "1/1", objectPosition: "50% 50%", role: "brand" },
  footerPlanet: { src: `${A}/brand/footer-planet.jpg`, srcMobile: `${A}/brand/footer-planet-mobile.jpg`, alt: "Earthset — a blue Earth setting behind the cratered lunar surface, seen from Orion (NASA, Artemis II)", credit: "NASA / Artemis II", licenseNote: "NASA — public domain", aspectRatio: "16/9", objectPosition: "50% 40%", role: "brand" },
  frontHero: { src: `${A}/brand/front-hero.jpg`, srcMobile: `${A}/brand/front-hero-mobile.jpg`, alt: "A storm system seen from space", aspectRatio: "3/2", objectPosition: "50% 50%", role: "brand" },
  pressureDoc: { src: `${A}/brand/pressure-doc.jpg`, srcMobile: `${A}/brand/pressure-doc-mobile.jpg`, alt: "A documentary black-and-white frame of the living world under human pressure", aspectRatio: "16/9", objectPosition: "50% 50%", role: "editorial" },
  homepageBonus: { src: `${A}/brand/homepage-bonus.jpg`, srcMobile: `${A}/brand/homepage-bonus-mobile.jpg`, alt: "A wide living landscape — the world 4Planet works for", aspectRatio: "3/2", objectPosition: "50% 50%", role: "editorial" },
  earthrise: { src: `${A}/brand/earthrise.jpg`, srcMobile: `${A}/brand/earthrise-mobile.jpg`, alt: "Earthrise — Earth rising over the lunar horizon, Apollo 8, 1968", credit: "NASA / Apollo 8", licenseNote: "NASA — public domain", aspectRatio: "1/1", objectPosition: "58% 34%", role: "brand" },

  // ── DOMAIN HEROES ───────────────────────────────────────────────────
  oce4nDomainHero: { src: `${A}/domains/oce4n/hero.jpg`, srcMobile: `${A}/domains/oce4n/hero-mobile.jpg`, alt: "A humpback whale seen from behind, tail spread wide, a free-diver small alongside", aspectRatio: "16/9", objectPosition: "50% 45%", domain: "OCE4N_", role: "domainHero" },
  e4rthDomainHero: { src: `${A}/domains/e4rth/hero.jpg`, srcMobile: `${A}/domains/e4rth/hero-mobile.jpg`, alt: "A deep green forested valley from above — the living land", aspectRatio: "16/9", objectPosition: "50% 55%", domain: "E4RTH_", role: "domainHero" },
  s4piensDomainHero: { src: `${A}/domains/s4piens/hero.jpg`, srcMobile: `${A}/domains/s4piens/hero-mobile.jpg`, alt: "Human systems and material flows — the world we build", aspectRatio: "16/9", objectPosition: "50% 50%", domain: "S4PIENS_", role: "domainHero" },
  cultureDomainHero: { src: `${A}/domains/4culture/hero.jpg`, srcMobile: `${A}/domains/4culture/hero-mobile.jpg`, alt: "A cultural frame — culture as a way into environmental action", aspectRatio: "3/4", objectPosition: "50% 45%", domain: "4CULTURE_", role: "domainHero" },

  // ── 4CULTURE EDITORIAL ──────────────────────────────────────────────
  cultureAnchor: { src: `${A}/brand/culture-anchor.jpg`, alt: "An editorial portrait — culture as a way into environmental action", aspectRatio: "4/5", objectPosition: "50% 30%", domain: "4CULTURE_", role: "editorial" },
  cultureEditorialPrimary: { src: `${A}/domains/4culture/hero.jpg`, alt: "A neon-lit city street at night — cultural energy", aspectRatio: "4/5", objectPosition: "50% 45%", domain: "4CULTURE_", role: "editorial" },
  cultureEditorialSupport: { src: `${A}/missions/m4gazine/hero.jpg`, alt: "A printed editorial magazine spread laid out across a table", aspectRatio: "3/2", objectPosition: "50% 50%", domain: "4CULTURE_", role: "editorial" },

  // ── MISSION HEROES ──────────────────────────────────────────────────
  wh4lesHero: { src: `${A}/missions/wh4les/hero-real.jpg`, srcMobile: `${A}/missions/wh4les/hero-real-mobile.jpg`, alt: "A wild orca surfacing off a green Norwegian coast", mission: "wh4les", domain: "OCE4N_", aspectRatio: "3/2", objectPosition: "50% 50%", role: "missionHero" },
  cor4lHero: { src: `${A}/missions/cor4l/hero-real.jpg`, srcMobile: `${A}/missions/cor4l/hero-real-mobile.jpg`, alt: "A living coral reef — vivid soft corals lit by surface light", mission: "cor4l", domain: "OCE4N_", aspectRatio: "3/2", objectPosition: "50% 50%", role: "missionHero" },
  pl4sticHero: { src: `${A}/missions/pl4stic/hero.jpg`, alt: "A plastic bag drifting underwater among small fish", mission: "cle4n", domain: "OCE4N_", aspectRatio: "4/3", objectPosition: "50% 50%", role: "missionHero" },
  rewildMarineHero: { src: "https://oceanexplorer.noaa.gov/wp-content/uploads/2023/11/kelp-point.jpeg", alt: "A real giant kelp forest in sunlit coastal water at Cojo Anchorage, California", credit: "Robert Schwemmer / NOAA", licenseNote: "NOAA-created still image — public domain unless otherwise noted; checked 2026-09-01", mission: "rewild-marine", domain: "OCE4N_", aspectRatio: "3/2", objectPosition: "50% 48%", role: "missionHero" },
  clim4teHero: { src: `${A}/missions/clim4te/hero.jpg`, alt: "A green forest under drifting mist", mission: "clim4te", domain: "E4RTH_", aspectRatio: "3/4", objectPosition: "50% 50%", role: "missionHero" },
  amazoniaHero: { src: `${A}/missions/am4zonia/hero.jpg`, alt: "A rainforest waterfall in dense canopy", mission: "am4zonia", domain: "E4RTH_", aspectRatio: "3/2", objectPosition: "50% 50%", role: "missionHero" },
  speciesHero: { src: `${A}/missions/species/hero.jpg`, alt: "A wild animal watching from low light", mission: "species", domain: "E4RTH_", aspectRatio: "3/4", objectPosition: "50% 30%", role: "missionHero" },
  rewildHero: { src: `${A}/missions/rewild/hero.jpg`, alt: "A green hillside returning to wild land", mission: "rewild-land", domain: "E4RTH_", aspectRatio: "1/1", objectPosition: "50% 55%", role: "missionHero" },
  foodHero: { src: `${A}/missions/food/hero.jpg`, alt: "Aerial of farmland with harvesters at work", mission: "food", domain: "S4PIENS_", aspectRatio: "16/9", objectPosition: "50% 50%", role: "missionHero" },
  en3rgyHero: { src: `${A}/missions/en3rgy/hero.jpg`, alt: "A hydroelectric dam spillway lit at night", mission: "en4rgy", domain: "S4PIENS_", aspectRatio: "2/1", objectPosition: "50% 50%", role: "missionHero" },
  circularCityHero: { src: `${A}/missions/circular-city/hero.jpg`, alt: "A building facade planted with living greenery", mission: "circular-city", domain: "S4PIENS_", aspectRatio: "3/2", objectPosition: "50% 50%", role: "missionHero" },
  f4shionHero: { src: `${A}/missions/f4shion/hero.jpg`, alt: "Editorial fashion portrait in flowing silver fabric", mission: "f4shion", domain: "S4PIENS_", aspectRatio: "3/4", objectPosition: "50% 30%", role: "missionHero" },
  m4gazineHero: { src: `${A}/missions/m4gazine/hero.jpg`, alt: "An open editorial spread — print in detail", mission: "m4gazine", domain: "4CULTURE_", aspectRatio: "3/2", objectPosition: "50% 50%", role: "missionHero" },
  artHero: { src: `${A}/missions/4rt/hero.jpg`, alt: "Three framed ecological art prints on a gallery wall", mission: "4rt", domain: "4CULTURE_", aspectRatio: "3/4", objectPosition: "50% 50%", role: "missionHero" },
  playHero: { src: `${A}/missions/4play/hero.jpg`, alt: "A figure in warm light — culture as a way in", mission: "4play", domain: "4CULTURE_", aspectRatio: "3/4", objectPosition: "50% 30%", role: "missionHero" },
  filmHero: { src: `${A}/missions/4film/hero.jpg`, alt: "A cabin window framing a still lake and mountains", mission: "4film", domain: "4CULTURE_", aspectRatio: "3/4", objectPosition: "50% 55%", role: "missionHero" },
} as const;

export type ImageKey = keyof typeof IMAGES;
export const img = (k: ImageKey): ImageMeta => IMAGES[k] as ImageMeta;

const byMission: Record<string, ImageMeta> = {};
const byDomain: Partial<Record<DomainKey, ImageMeta>> = {};
for (const v of Object.values(IMAGES)) {
  const m = v as ImageMeta;
  if (m.role === "missionHero" && m.mission) byMission[m.mission] = m;
  if (m.role === "domainHero" && m.domain) byDomain[m.domain] = m;
}
export const missionHero = (slug: string): ImageMeta | undefined => byMission[slug];
export const domainHero = (key: DomainKey): ImageMeta | undefined => byDomain[key];

// ── Impact-unit hover imagery (§15) — pathway slug → documentary frame ──
export const IMPACT_IMAGE: Record<string, ImageMeta> = {
  "tree-unit": { src: `${A}/domains/e4rth/hero.jpg`, alt: "Forest canopy regenerating in mist", aspectRatio: "3/2", objectPosition: "50% 50%", role: "editorial" },
  "ocean-waste": { src: `${A}/missions/pl4stic/hero.jpg`, alt: "A plastic bag drifting underwater beside fish", aspectRatio: "3/2", objectPosition: "50% 50%", role: "editorial" },
  "amazon-square": { src: `${A}/missions/am4zonia/hero.jpg`, alt: "A waterfall in dense tropical rainforest", aspectRatio: "3/2", objectPosition: "50% 50%", role: "editorial" },
  "habitat-recovery": { src: `${A}/missions/rewild/hero.jpg`, alt: "A grey wolf in low light, symbol of rewilding", aspectRatio: "3/2", objectPosition: "50% 32%", role: "editorial" },
};
export const impactImage = (slug: string): ImageMeta | undefined => IMPACT_IMAGE[slug];

const A2 = "/assets/missions";
export const MISSION_SECONDARY: Record<string, ImageMeta> = {
  "wh4les": { src: `${A}/species/orca/detail-pod.jpg`, alt: "A pod of orcas surfacing together", aspectRatio: "3/2", role: "editorial" },
  "rewild-marine": { src: `${A2}/rewild-marine/bank-hero.jpg`, srcMobile: `${A2}/rewild-marine/bank-hero-mobile.jpg`, alt: "A living kelp forest in coastal water", aspectRatio: "3/2", role: "editorial" },
  "4rt": { src: `${A2}/4rt/bank-hero.jpg`, srcMobile: `${A2}/4rt/bank-hero-mobile.jpg`, alt: "Screen-printing production in a working studio", aspectRatio: "3/2", role: "editorial" },
  "am4zonia": { src: `${A2}/am4zonia/detail-01.jpg`, alt: "Rainforest river winding through dense canopy", aspectRatio: "3/2", role: "editorial" },
  "clim4te": { src: `${A2}/clim4te/bank-hero.jpg`, srcMobile: `${A2}/clim4te/bank-hero-mobile.jpg`, alt: "A misty forest canopy pierced by light", aspectRatio: "3/2", role: "editorial" },
  "species": { src: `${A2}/species/detail-01.jpg`, alt: "Aerial of wild terrain — habitat seen whole", aspectRatio: "3/2", role: "editorial" },
  "rewild-land": { src: `${A2}/rewild/detail-01.jpg`, alt: "Rugged land meeting water — habitat returning", aspectRatio: "3/2", role: "editorial" },
  "circular-city": { src: `${A2}/circular-city/bank-hero.jpg`, srcMobile: `${A2}/circular-city/bank-hero-mobile.jpg`, alt: "Crushed aluminium cans gathered for recycling", aspectRatio: "3/2", role: "editorial" },
  "cor4l": { src: `${A2}/cor4l/detail-coral-01.jpg`, alt: "A table coral near the surface in clear blue water", aspectRatio: "3/2", role: "editorial" },
  "en4rgy": { src: `${A2}/en3rgy/bank-hero.jpg`, srcMobile: `${A2}/en3rgy/bank-hero-mobile.jpg`, alt: "Wind turbines and solar arrays across working farmland", aspectRatio: "3/2", role: "editorial" },
  "food": { src: `${A2}/food/bank-hero.jpg`, srcMobile: `${A2}/food/bank-hero-mobile.jpg`, alt: "Farmers harvesting crops in the field", aspectRatio: "3/2", role: "editorial" },
  "m4gazine": { src: `${A2}/m4gazine/bank-hero.jpg`, srcMobile: `${A2}/m4gazine/bank-hero-mobile.jpg`, alt: "An open editorial magazine spread", aspectRatio: "3/2", role: "editorial" },
  "cle4n": { src: `${A2}/pl4stic/detail-01.jpg`, alt: "Plastic waste recovered from the water", aspectRatio: "3/2", role: "editorial" },
  "4film": { src: `${A2}/4film/bank-hero.jpg`, srcMobile: `${A2}/4film/bank-hero-mobile.jpg`, alt: "A film camera rig on a working set", aspectRatio: "3/2", role: "editorial" },
  "f4shion": { src: `${A2}/f4shion/bank-hero.jpg`, srcMobile: `${A2}/f4shion/bank-hero-mobile.jpg`, alt: "Knitted textile in warm natural light", aspectRatio: "3/2", role: "editorial" },
};
export const missionSecondary = (slug: string): ImageMeta | undefined => MISSION_SECONDARY[slug];

export const MISSION_MEDIA_RIGHTS: Record<string, {
  file: string; kind: string; owner: string; creator: string; licence: string;
  attribution: string; checkedDate: string; commercialAllowed: boolean; limitations: string;
}> = {
  "rewild-marine": {
    file: "https://oceanexplorer.noaa.gov/wp-content/uploads/2023/11/kelp-point.jpeg",
    kind: "DOCUMENTARY PHOTOGRAPH",
    owner: "U.S. National Oceanic and Atmospheric Administration (NOAA)",
    creator: "Robert Schwemmer / NOAA",
    licence: "Public domain as a NOAA-created still image, unless otherwise noted on source page",
    attribution: "Robert Schwemmer / NOAA",
    checkedDate: "2026-09-01",
    commercialAllowed: true,
    limitations: "Real giant kelp forest at Cojo Anchorage near Point Conception, California. Illustrative of kelp habitat and marine restoration context; not evidence of a 4PLANET restoration site or delivered impact.",
  },
  "4rt": {
    file: "/assets/missions/4rt/hero.jpg",
    kind: "INTERNAL PROTOTYPE ART (procedural, 4PLANET-created)",
    owner: "4PLANET / Skog Communications AS",
    creator: "4PLANET (generated in-house, procedural script)",
    licence: "Owned work — all rights held by 4PLANET",
    attribution: "4PLANET",
    checkedDate: "2026-08-07",
    commercialAllowed: true,
    limitations: "INTERNAL PROTOTYPE ART, not a final Gate 1 asset and not a real artwork for sale. Represents the Prints-for-Planet direction only. Self-asserted ownership.",
  },
};
export const missionMediaRights = (slug: string) => MISSION_MEDIA_RIGHTS[slug];
