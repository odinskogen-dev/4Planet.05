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
}

function pending(sourcePage: string): MediaRecord {
  return {
    localPath: "", sourcePage, photographer: "", owner: "", licence: "", licenceUrl: "",
    attribution: "", checkedDate: "2026-08-05", cropAllowed: false, modificationAllowed: false,
    publicWebAllowed: false, commercialAllowed: false, supportedUse: "",
    limitations: "No verified image licence yet — render the no-image state.", rightsStatus: "PENDING",
  };
}

/**
 * Keyed by species slug. All entries are PENDING until real assets + rights are
 * bundled: the honest no-image state is correct, and a fabricated licence is not.
 * FOUNDER_CLEARED entries are added here the moment the founder supplies images.
 */
export const SPECIES_MEDIA: Record<string, MediaRecord> = {
  orca: pending("https://www.gbif.org/species/2440483"),
  "humpback-whale": pending("https://www.gbif.org/species/5220086"),
  "sperm-whale": pending("https://www.gbif.org/species/2440617"),
  "harbour-porpoise": pending("https://www.gbif.org/species/2440739"),
  "bottlenose-dolphin": pending("https://www.gbif.org/species/2440601"),
  "atlantic-cod": pending("https://www.gbif.org/species/2378026"),
  "blue-mussel": pending("https://www.gbif.org/species/2286380"),
  jaguar: pending("https://www.gbif.org/species/5219426"),
  "hyacinth-macaw": pending("https://www.gbif.org/species/2474514"),
  "western-honey-bee": pending("https://www.gbif.org/species/1341976"),
};

export const speciesMedia = (slug: string): MediaRecord | undefined => SPECIES_MEDIA[slug];
export const hasShowableImage = (slug: string): boolean => {
  const m = SPECIES_MEDIA[slug];
  return !!m && (m.rightsStatus === "CLEARED" || m.rightsStatus === "FOUNDER_CLEARED") && !!m.localPath;
};
