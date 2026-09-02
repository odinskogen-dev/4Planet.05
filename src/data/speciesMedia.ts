import { MEDIA_MANIFEST } from "@/content/mediaManifest";
/**
 * WS-E — SPECIES media registry.
 *
 * Founder decision 2026-09-02:
 * - ORCA hero/photo is an Unsplash-sourced photograph and is explicitly approved
 *   for PUBLIC CORE use. Do not replace it with generated/illustrated media.
 * - PUBLIC CORE uses photographs or a designed no-image state. Illustration
 *   fallbacks are not part of the 4PLANET public product grammar.
 *
 * Rights are never inferred from merely being present in the repository. Three
 * states remain licence-based:
 *  - "LICENCE_VERIFIED": explicit recorded licence/source basis.
 *  - "CLEARED": alias of LICENCE_VERIFIED for older records.
 *  - "PENDING": no verified licence yet → render the designed no-image state.
 */
export type RightsStatus = "LICENCE_VERIFIED" | "CLEARED" | "PENDING";

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
  assetBlocker?: string;
}

/** A precise candidate asset + the exact rights step still required per profile. */
const BLOCKERS: Record<string, string> = {
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
    attribution: "", checkedDate: "2026-09-02", cropAllowed: false, modificationAllowed: false,
    publicWebAllowed: false, commercialAllowed: false, supportedUse: "",
    limitations: "No verified image licence yet — render the designed no-image state.", rightsStatus: "PENDING",
    assetBlocker: BLOCKERS[slug],
  };
}

/** Build a licence-verified MediaRecord from the authoritative media manifest. */
function fromManifest(assetId: string): MediaRecord {
  const a = MEDIA_MANIFEST[assetId];
  if (!a || !a.localPath) return pending(assetId, a?.sourcePage ?? "");
  return {
    localPath: a.localPath, sourcePage: a.sourcePage,
    photographer: a.creator, owner: "Not asserted — see licence", licence: `${a.licence} (${a.assetId})`,
    licenceUrl: a.licenceUrl, attribution: a.attribution, checkedDate: a.checked,
    cropAllowed: a.cropModifyAllowed, modificationAllowed: a.cropModifyAllowed,
    publicWebAllowed: true, commercialAllowed: a.commercialWebAllowed,
    supportedUse: a.use,
    limitations: a.contextLimitation ?? "Illustrative species media; preserve attribution and licence.",
    rightsStatus: "LICENCE_VERIFIED", assetBlocker: "",
  };
}

export const SPECIES_MEDIA: Record<string, MediaRecord> = {
  orca: {
    localPath: "/assets/species/orca/hero.jpg",
    sourcePage: "https://unsplash.com/",
    photographer: "Not recorded in current asset metadata",
    owner: "Unsplash contributor — exact contributor metadata to be backfilled when recovered",
    licence: "Unsplash License — source confirmed by Founder 2026-09-02",
    licenceUrl: "https://unsplash.com/license",
    attribution: "Source: Unsplash",
    checkedDate: "2026-09-02",
    cropAllowed: true,
    modificationAllowed: true,
    publicWebAllowed: true,
    commercialAllowed: true,
    supportedUse: "4PLANET public web product imagery, including hero/detail crop and resize.",
    limitations: "Unsplash-sourced photograph. Exact photographer/photo URL is not present in current metadata and must not be invented. Founder-approved public use; do not replace with an illustration.",
    rightsStatus: "LICENCE_VERIFIED",
    assetBlocker: "",
  },
  "humpback-whale": fromManifest("SP-001"),
  "sperm-whale": fromManifest("SP-002"),
  "harbour-porpoise": fromManifest("SP-003"),
  "bottlenose-dolphin": fromManifest("SP-004"),
  "atlantic-cod": fromManifest("SP-009"),
  "blue-mussel": fromManifest("SP-010"),
  jaguar: fromManifest("SP-005"),
  "hyacinth-macaw": fromManifest("SP-006"),
  "western-honey-bee": fromManifest("SP-008"),
  "giant-otter": fromManifest("SP-007"),
};

export const speciesMedia = (slug: string): MediaRecord | undefined => SPECIES_MEDIA[slug];
export const hasShowableImage = (slug: string): boolean => {
  const m = SPECIES_MEDIA[slug];
  return !!m && (m.rightsStatus === "CLEARED" || m.rightsStatus === "LICENCE_VERIFIED") && m.publicWebAllowed && m.commercialAllowed && !!m.localPath;
};
