import type { ImageKey } from "@/content/imageRegistry";

const SIGNAL_IMAGE_BY_SLUG: Record<string, ImageKey> = {
  "cities-climate-biodiversity-health-blind-spots": "foodHero",
  "urban-forests-measure-biodiversity": "en3rgyHero",
  "bluenature-ocean-space-cumulative-pressure": "f4shionHero",
  "automated-edna-erna-water-monitoring": "artHero",
  "urban-rewilding-design-method": "playHero",
  "nature-water-design-cities": "filmHero",
  "oecd-nature-positive-cities": "m4gazineHero",
  "agriculture-needs-system-not-gadgets": "cultureAnchor",
  "food-waste-biopolymers-loop": "storyHero",
  "fooddiverse-diversity-at-every-level": "brandAstronaut",
  "seaweed-preservation-bluegreenfood": "e4rthField",
  "carbon-farming-biodiversity-context": "footerPlanet",
};

export function signalImageKey(slug: string): ImageKey {
  return SIGNAL_IMAGE_BY_SLUG[slug] ?? "cultureAnchor";
}
