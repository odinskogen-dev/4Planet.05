/**
 * WS-E — SPECIES media registry.
 *
 * Rights are never inferred or fabricated. Three states:
 *  - "FOUNDER_CLEARED": the founder has supplied/authorised the image. It is
 *    treated as cleared for the prototype and is NOT dropped for a missing
 *    attribution string, but the record still names owner + source where known.
 *  - "CLEARED": an agent-verified public-domain / open-licence image with a full
 *    rights record (owner, licence, licence URL, attribution, checked date).
 *  - "PENDING": no verified licence yet → render the designed no-image state,
 *    never an unverified photograph.
 */
export type RightsStatus = "FOUNDER_CLEARED" | "CLEARED" | "PENDING";

export interface MediaRecord {
  localPath: string;
  sourcePage: string;
  fileUrl?: string;
  photographer: string;
  owner: string;
  licence: string;
  licenceUrl: string;
  attribution: string;
  checkedDate: string;
  cropAllowed: boolean;
  modificationAllowed: boolean;
  publicWebAllowed: boolean;
  commercialAllowed: boolean;
  supportedUse: string;
  limitations: string;
  rightsStatus: RightsStatus;
  /**
   * Blocker 8: exact, actionable per-profile asset blocker while rightsStatus is
   * PENDING. States a concrete candidate source + the specific licence/record
   * step needed before the image can be shown. Not a generic "pending".
   */
  assetBlocker?: string;
  /**
   * A self-owned illustration (NOT a photograph). Always cleared because 4PLANET
   * created it. Used for a life-first visual while the real photo stays PENDING.
   * Must be labelled clearly as an illustration wherever shown.
   */
  illustration?: {
    localPath: string; kind: string; owner: string; creator: string;
    licence: string; attribution: string; checkedDate: string; checksum: string;
  };
}

/** A precise candidate asset + the exact rights step still required per profile. */
const BLOCKERS: Record<string, string> = {
  orca: "Candidate: NOAA Fisheries killer-whale media (U.S. Gov public domain). BLOCKER: confirm the specific file's public-domain status + capture creator/date into a full rights record, or use a founder-supplied FOUNDER_CLEARED image.",
  "humpback-whale": "Candidate: NOAA Fisheries humpback media (public domain). BLOCKER: verify the exact file URL + record creator/licence/checked-date before bundling.",
  "sperm-whale": "Candidate: NOAA Fisheries sperm-whale media (public domain). BLOCKER: confirm the specific asset is Gov-work public domain and capture attribution.",
  "harbour-porpoise": "Candidate: GBIF media with a CC-BY/CC0 licence field on a Norwegian occurrence. BLOCKER: select one record whose media carries an explicit licence + attribution.",
  "bottlenose-dolphin": "Candidate: NOAA Fisheries bottlenose media (public domain). BLOCKER: verify the exact file + record the rights fields.",
  "atlantic-cod": "Candidate: GBIF/Artsdatabanken occurrence media with CC licence. BLOCKER: confirm a record whose image licence permits public web use.",
  "blue-mussel": "Candidate: GBIF occurrence media (CC0/CC-BY). BLOCKER: select a licensed image and record attribution.",
  jaguar: "Candidate: GBIF/iNaturalist research-grade media under CC-BY/CC0. BLOCKER: pick one record with a compatible licence + attribution.",
  "hyacinth-macaw": "Candidate: GBIF/iNaturalist media under CC-BY/CC0. BLOCKER: confirm a licensed record + attribution.",
  "western-honey-bee": "Candidate: GBIF/iNaturalist media under CC0. BLOCKER: select a CC0 record and capture the rights fields.",
};

function pending(slug: string, sourcePage: string): MediaRecord {
  return {
    localPath: "", sourcePage, photographer: "", owner: "", licence: "", licenceUrl: "",
    attribution: "", checkedDate: "2026-08-06", cropAllowed: false, modificationAllowed: false,
    publicWebAllowed: false, commercialAllowed: false, supportedUse: "",
    limitations: "No verified image licence yet — render the no-image state.", rightsStatus: "PENDING",
    assetBlocker: BLOCKERS[slug],
  };
}

/**
 * Keyed by species slug. All entries are PENDING with an EXACT per-profile asset
 * blocker (Blocker 8): the honest no-image state is correct, a fabricated licence
 * is not. FOUNDER_CLEARED entries are added the moment the founder supplies images.
 */
export const SPECIES_MEDIA: Record<string, MediaRecord> = {
  orca: pending("orca", "https://www.gbif.org/species/2440483"),
  "humpback-whale": pending("humpback-whale", "https://www.gbif.org/species/5220086"),
  "sperm-whale": pending("sperm-whale", "https://www.gbif.org/species/2440617"),
  "harbour-porpoise": pending("harbour-porpoise", "https://www.gbif.org/species/2440739"),
  "bottlenose-dolphin": pending("bottlenose-dolphin", "https://www.gbif.org/species/2440601"),
  "atlantic-cod": pending("atlantic-cod", "https://www.gbif.org/species/2378026"),
  "blue-mussel": pending("blue-mussel", "https://www.gbif.org/species/2286380"),
  jaguar: pending("jaguar", "https://www.gbif.org/species/5219426"),
  "hyacinth-macaw": pending("hyacinth-macaw", "https://www.gbif.org/species/2474514"),
  "western-honey-bee": pending("western-honey-bee", "https://www.gbif.org/species/1341976"),
};


/** Self-owned illustrations (not photographs) attached to the five cetaceans. */
const ILLUSTRATIONS: Record<string, NonNullable<MediaRecord["illustration"]>> = {
  "orca": { localPath: "/assets/species/orca/illustration.jpg", kind: "INTERNAL PROTOTYPE ART (procedural, 4PLANET-created illustration — NOT a photograph)", owner: "4PLANET / Skog Communications AS", creator: "4PLANET (generated in-house)", licence: "Owned work — all rights held by 4PLANET", attribution: "4PLANET illustration", checkedDate: "2026-08-07", checksum: "sha256:851a02585309c49d2b1d0e218ca3150b97484afb423813e463d5b7b3a905de5b" },
  "humpback-whale": { localPath: "/assets/species/humpback-whale/illustration.jpg", kind: "INTERNAL PROTOTYPE ART (procedural, 4PLANET-created illustration — NOT a photograph)", owner: "4PLANET / Skog Communications AS", creator: "4PLANET (generated in-house)", licence: "Owned work — all rights held by 4PLANET", attribution: "4PLANET illustration", checkedDate: "2026-08-07", checksum: "sha256:73ae654f1c4430712d01f365b50e0bb642d2ee1b3231ecc009f341dad6bc89c1" },
  "sperm-whale": { localPath: "/assets/species/sperm-whale/illustration.jpg", kind: "INTERNAL PROTOTYPE ART (procedural, 4PLANET-created illustration — NOT a photograph)", owner: "4PLANET / Skog Communications AS", creator: "4PLANET (generated in-house)", licence: "Owned work — all rights held by 4PLANET", attribution: "4PLANET illustration", checkedDate: "2026-08-07", checksum: "sha256:ab1db11d25db77dcde8a28a1da9f480c51f237d8fcc5b2a9a0770752d2aee7c7" },
  "harbour-porpoise": { localPath: "/assets/species/harbour-porpoise/illustration.jpg", kind: "INTERNAL PROTOTYPE ART (procedural, 4PLANET-created illustration — NOT a photograph)", owner: "4PLANET / Skog Communications AS", creator: "4PLANET (generated in-house)", licence: "Owned work — all rights held by 4PLANET", attribution: "4PLANET illustration", checkedDate: "2026-08-07", checksum: "sha256:153fc33c2e4c0b5d021d914fb257b63300125d1fcf9e97e739d20d13f7aa3a28" },
  "bottlenose-dolphin": { localPath: "/assets/species/bottlenose-dolphin/illustration.jpg", kind: "INTERNAL PROTOTYPE ART (procedural, 4PLANET-created illustration — NOT a photograph)", owner: "4PLANET / Skog Communications AS", creator: "4PLANET (generated in-house)", licence: "Owned work — all rights held by 4PLANET", attribution: "4PLANET illustration", checkedDate: "2026-08-07", checksum: "sha256:d1c7246db0f5558cb335ce66cbf52f6d5d1b84689776656e225571c2303aae6b" },
};
Object.entries(ILLUSTRATIONS).forEach(([slug, ill]) => { if (SPECIES_MEDIA[slug]) SPECIES_MEDIA[slug].illustration = ill; });

export const speciesMedia = (slug: string): MediaRecord | undefined => SPECIES_MEDIA[slug];
export const hasShowableImage = (slug: string): boolean => {
  const m = SPECIES_MEDIA[slug];
  return !!m && (m.rightsStatus === "CLEARED" || m.rightsStatus === "FOUNDER_CLEARED") && !!m.localPath;
};
