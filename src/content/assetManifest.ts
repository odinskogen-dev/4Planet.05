import type { AssetSet, DomainKey } from "@/types/content";
import { missionHero, domainHero } from "@/content/imageRegistry";
const dslug = (k: DomainKey) => k.replace("_", "").toLowerCase();

// Convention-based paths, hero sourced from the central image registry when present.
// Real files used automatically if present (img onError → technical grid fallback).
export function missionAssets(slug: string): AssetSet {
  const b = `/assets/missions/${slug}`;
  return { hero: missionHero(slug)?.src ?? `${b}/hero.jpg`, heroMobile: `${b}/hero-mobile.jpg`, detail1: `${b}/detail-01.jpg`, detail2: `${b}/detail-02.jpg` };
}
export function domainAssets(key: DomainKey): AssetSet {
  const b = `/assets/domains/${dslug(key)}`;
  return { hero: domainHero(key)?.src ?? `${b}/hero.jpg`, heroMobile: `${b}/hero-mobile.jpg`, detail1: `${b}/detail-01.jpg`, detail2: `${b}/detail-02.jpg` };
}
