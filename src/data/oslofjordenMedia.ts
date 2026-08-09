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
  sourceChecksum?: { algorithm: "SHA-1" | "SHA-256"; value: string };
  sourceFileBytes?: number;
  sourceDimensions?: { width: number; height: number };
  custodyState?: "REMOTE_SOURCE_RUNTIME" | "REPO_CONTROLLED_DERIVATIVE" | "OWNED_MASTER";
  derivativeNote?: string;
}

/**
 * Real Oslofjord documentary context for the internal product candidate.
 * Source page and structured data checked 2026-08-09. The author dedicated
 * the photograph CC0. Wikimedia reports the original source-file SHA-1 below.
 *
 * IMPORTANT:
 * - This is a real photograph of Oslofjord, not generated imagery.
 * - It is not an ecological observation, species record, monitoring result or
 *   evidence of current condition.
 * - The current runtime still uses a Wikimedia derivative because the active
 *   connector cannot transfer the binary into the repository. Source custody
 *   is therefore explicit rather than falsely described as localised.
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
  assetUrl: "https://commons.wikimedia.org/wiki/Special:Redirect/file/Oslofjorden_2022-08-17_15.jpg?width=1920",
  mobileAssetUrl: "https://commons.wikimedia.org/wiki/Special:Redirect/file/Oslofjorden_2022-08-17_15.jpg?width=960",
  license: "CC0 1.0 Universal Public Domain Dedication",
  licenseUrl: "https://creativecommons.org/publicdomain/zero/1.0/",
  locationClaim: "Wikimedia Commons source description: Oslofjord seen from a ferry.",
  limitation: "A place photograph proves the documented photographic context only. It does not show current ecological condition, a species occurrence, a survey result or the condition of the whole fjord.",
  alt: "Oslofjord seen from a ferry in August 2022",
  sourceChecksum: { algorithm: "SHA-1", value: "7b7d2c709a5009b984df764624c7668e671ee1f3" },
  sourceFileBytes: 30_023_899,
  sourceDimensions: { width: 8_384, height: 5_612 },
  custodyState: "REMOTE_SOURCE_RUNTIME",
  derivativeNote: "Repo-controlled derivative remains an explicit pre-public-release media-custody task. The source master is checksum-addressed and rights-clean; runtime does not claim local binary custody.",
};
