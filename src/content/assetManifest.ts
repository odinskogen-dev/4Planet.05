import type { AssetSet, DomainKey } from "@/types/content";
import { missionHero, domainHero } from "@/content/imageRegistry";
const dslug = (k: DomainKey) => k.replace("_", "").toLowerCase();

// Convention-based paths, hero sourced from the central image registry when present.
// Real files used automatically if present (img onError → technical grid fallback).
export function missionAssets(slug: string): AssetSet {
  const b = `/assets/missions/${slug}`;
  // COR4L_ ships founder-supplied, rights-cleared, content-verified reef photos.
  if (slug === "cor4l") {
    return {
      hero: missionHero(slug)?.src ?? `${b}/hero-real.jpg`,
      heroMobile: `${b}/hero-real-mobile.jpg`,
      detail1: `${b}/detail-coral-02.jpg`,
      detail2: `${b}/detail-coral-03.jpg`,
    };
  }
  // WH4LES_ ships founder-supplied, rights-cleared, content-verified orca photos.
  if (slug === "wh4les") {
    return {
      hero: missionHero(slug)?.src ?? `${b}/hero-real.jpg`,
      heroMobile: `${b}/hero-real-mobile.jpg`,
      detail1: "/assets/species/orca/detail-pod.jpg",
      detail2: "/assets/species/orca/detail-spyhop.jpg",
    };
  }
  return { hero: missionHero(slug)?.src ?? `${b}/hero.jpg`, heroMobile: `${b}/hero-mobile.jpg`, detail1: `${b}/detail-01.jpg`, detail2: `${b}/detail-02.jpg` };
}
export function domainAssets(key: DomainKey): AssetSet {
  const b = `/assets/domains/${dslug(key)}`;
  return { hero: domainHero(key)?.src ?? `${b}/hero.jpg`, heroMobile: `${b}/hero-mobile.jpg`, detail1: `${b}/detail-01.jpg`, detail2: `${b}/detail-02.jpg` };
}
