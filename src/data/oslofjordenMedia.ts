export interface PlaceMediaRecord {
  id: string;
  kind: "PHOTO" | "FILM";
  rightsClass: "OWNED" | "LICENSED" | "OPEN_LICENSE" | "SOURCE_IMAGE" | "GENERATED" | "PLACEHOLDER";
  title: string;
  description: string;
  capturedAt?: string;
  creator: string;
  sourcePage: string;
  assetUrl: string;
  mobileAssetUrl?: string;
  license: string;
  licenseUrl: string;
  locationClaim: string;
  limitation: string;
  alt: string;
}

/**
 * Real Oslofjord documentary context for the internal product candidate.
 * Source page checked 2026-08-09. The author dedicated the photograph CC0.
 *
 * IMPORTANT:
 * - This is a real photograph of Oslofjord, not generated imagery.
 * - It is not an ecological observation, species record, monitoring result or
 *   evidence of current condition.
 * - Remote Wikimedia renditions are used in the controlled candidate because
 *   this connector cannot commit binary media. Before public release, prefer a
 *   locally controlled derivative plus stored checksum and source metadata.
 */
export const OSLOFJORD_HERO_MEDIA: PlaceMediaRecord = {
  id: "media:commons:oslofjorden-2022-08-17-15",
  kind: "PHOTO",
  rightsClass: "OPEN_LICENSE",
  title: "Oslofjorden 2022-08-17 15",
  description: "Oslofjord seen from a ferry.",
  capturedAt: "2022-08-17T08:26:24",
  creator: "Leonhard Lenz",
  sourcePage: "https://commons.wikimedia.org/wiki/File:Oslofjorden_2022-08-17_15.jpg",
  assetUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d8/Oslofjorden_2022-08-17_15.jpg/2560px-Oslofjorden_2022-08-17_15.jpg",
  mobileAssetUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d8/Oslofjorden_2022-08-17_15.jpg/1280px-Oslofjorden_2022-08-17_15.jpg",
  license: "CC0 1.0 Universal Public Domain Dedication",
  licenseUrl: "https://creativecommons.org/publicdomain/zero/1.0/",
  locationClaim: "Wikimedia Commons source description: Oslofjord seen from a ferry.",
  limitation: "A place photograph proves the documented photographic context only. It does not show current ecological condition, a species occurrence, a survey result or the condition of the whole fjord.",
  alt: "Oslofjord seen from a ferry in August 2022",
};
