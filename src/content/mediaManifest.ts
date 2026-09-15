/**
 * 4PLANET RUNTIME MEDIA MANIFEST — keyed by authoritative Asset ID.
 *
 * This is the single runtime source of truth linking every public media asset to
 * its intended use, provider/creator, licence, attribution and context limitation,
 * transcribed from the 4PLANET MEDIA RIGHTS & CONTENT BANK REGISTER v1.0.
 *
 * TRUTH RULES (enforced by types + helpers):
 *   • "Founder-supplied" is PROVENANCE ONLY. It never implies 4PLANET/Skog owns
 *     the copyright, holds commercial rights, or has granted a licence. Ownership,
 *     licence and commercial permission come only from an explicit licence record.
 *   • An asset is publicly showable only when it has a real `licence` AND the
 *     required `attribution` (when the licence requires it).
 *   • `contextLimitation` is preserved and surfaced wherever the asset appears —
 *     e.g. captive vs wild, species-portrait vs local record, habitat illustration
 *     vs current-condition evidence.
 */

export type LicenceKind =
  | "CC BY 2.0" | "CC BY 4.0" | "CC BY-SA 2.0" | "CC BY-SA 3.0" | "CC BY-SA 4.0"
  | "CC0 1.0" | "Public domain" | "Pexels License" | "Unsplash License";

export interface MediaAsset {
  assetId: string;                 // authoritative ID, e.g. "SP-001"
  use: string;                     // intended product/surface use
  provider: string;                // e.g. "Wikimedia Commons", "Pexels"
  creator: string;                 // photographer / creator (attribution subject)
  sourcePage: string;
  licence: LicenceKind;
  licenceUrl: string;
  attribution: string;             // the exact credit line to display
  attributionRequired: boolean;
  commercialWebAllowed: boolean;
  cropModifyAllowed: boolean;
  /** honest limit on how this image may be read — always surfaced */
  contextLimitation?: string;
  /** local file once downloaded into the repo (empty ⇒ not yet placed) */
  localPath?: string;
  localPathMobile?: string;
  checked: string;
}

const L: Record<string, string> = {
  "CC BY 2.0": "https://creativecommons.org/licenses/by/2.0/",
  "CC BY 4.0": "https://creativecommons.org/licenses/by/4.0/",
  "CC BY-SA 2.0": "https://creativecommons.org/licenses/by-sa/2.0/",
  "CC BY-SA 3.0": "https://creativecommons.org/licenses/by-sa/3.0/",
  "CC BY-SA 4.0": "https://creativecommons.org/licenses/by-sa/4.0/",
  "CC0 1.0": "https://creativecommons.org/publicdomain/zero/1.0/",
  "Public domain": "https://creativecommons.org/publicdomain/mark/1.0/",
  "Pexels License": "https://www.pexels.com/license/",
  "Unsplash License": "https://unsplash.com/license",
};

export const MEDIA_MANIFEST: Record<string, MediaAsset> = {
  "SP-001": {
    assetId: "SP-001", use: "SPECIES / WH4LES_ — Humpback Whale hero/profile",
    provider: "Wikimedia Commons", creator: "National Marine Sanctuaries / NOAA",
    sourcePage: "https://commons.wikimedia.org/wiki/File:HIHWNMS_Humpback_Whale_Underwater_(49530678743).jpg",
    licence: "CC BY 2.0", licenceUrl: L["CC BY 2.0"], attribution: "National Marine Sanctuaries / NOAA — CC BY 2.0",
    attributionRequired: true, commercialWebAllowed: true, cropModifyAllowed: true,
    localPath: "/assets/species/humpback-whale/SP-001.jpg", localPathMobile: "/assets/species/humpback-whale/SP-001-mobile.jpg", checked: "2026-08-12",
  },
  "SP-002": {
    assetId: "SP-002", use: "SPECIES — Sperm Whale profile/detail",
    provider: "Wikimedia Commons", creator: "Francesca Grossi",
    sourcePage: "https://commons.wikimedia.org/wiki/File:The_breathtaking_dive_of_the_spermwhale.jpg",
    licence: "CC BY 4.0", licenceUrl: L["CC BY 4.0"], attribution: "Francesca Grossi — CC BY 4.0",
    attributionRequired: true, commercialWebAllowed: true, cropModifyAllowed: true,
    localPath: "/assets/species/sperm-whale/SP-002.jpg", localPathMobile: "/assets/species/sperm-whale/SP-002-mobile.jpg", checked: "2026-08-12",
  },
  "SP-003": {
    assetId: "SP-003", use: "SPECIES / Oslofjord — Harbour Porpoise profile",
    provider: "Wikimedia Commons", creator: "Rene (Fjord & Belt)",
    sourcePage: "https://commons.wikimedia.org/wiki/File:Harbor_Porpoise_Fjord_Baelt_Denmark.JPG",
    licence: "Public domain", licenceUrl: L["Public domain"], attribution: "Rene — public domain",
    attributionRequired: false, commercialWebAllowed: true, cropModifyAllowed: true,
    contextLimitation: "Captive (Fjord & Belt) context — do not imply a wild observation.",
    localPath: "/assets/species/harbour-porpoise/SP-003.jpg", localPathMobile: "/assets/species/harbour-porpoise/SP-003-mobile.jpg", checked: "2026-08-12",
  },
  "SP-004": {
    assetId: "SP-004", use: "SPECIES — Bottlenose Dolphin profile",
    provider: "Wikimedia Commons / Auckland Museum", creator: "Auckland Museum collection",
    sourcePage: "https://commons.wikimedia.org/wiki/File:Tursiops_truncatus_(Bottlenose_dolphin;_Terehu)_(48741044598).jpg",
    licence: "CC BY 4.0", licenceUrl: L["CC BY 4.0"], attribution: "Auckland Museum — CC BY 4.0",
    attributionRequired: true, commercialWebAllowed: true, cropModifyAllowed: true,
    contextLimitation: "Museum collection image — use as species portrait, not a wild-observation record.",
    localPath: "/assets/species/bottlenose-dolphin/SP-004.jpg", localPathMobile: "/assets/species/bottlenose-dolphin/SP-004-mobile.jpg", checked: "2026-08-12",
  },
  "SP-005": {
    assetId: "SP-005", use: "SPECIES / Amazonia — Jaguar flagship profile",
    provider: "Wikimedia Commons", creator: "Reviewed on Commons (Flickr source)",
    sourcePage: "https://commons.wikimedia.org/wiki/File:Jaguar_Pantanal.jpg",
    licence: "CC BY 2.0", licenceUrl: L["CC BY 2.0"], attribution: "Flickr / Wikimedia Commons — CC BY 2.0",
    attributionRequired: true, commercialWebAllowed: true, cropModifyAllowed: true,
    contextLimitation: "Wild Pantanal jaguar; Pantanal is a distinct biome adjacent to Amazonia.",
    localPath: "/assets/species/jaguar/SP-005.jpg", localPathMobile: "/assets/species/jaguar/SP-005-mobile.jpg", checked: "2026-08-12",
  },
  "SP-006": {
    assetId: "SP-006", use: "SPECIES / Amazonia — Hyacinth Macaw flagship profile",
    provider: "Wikimedia Commons", creator: "Bernard DUPONT",
    sourcePage: "https://commons.wikimedia.org/wiki/File:Hyacinth_Macaw_(Anodorhynchus_hyacinthinus).jpg",
    licence: "CC BY-SA 2.0", licenceUrl: L["CC BY-SA 2.0"], attribution: "Bernard DUPONT — CC BY-SA 2.0",
    attributionRequired: true, commercialWebAllowed: true, cropModifyAllowed: true,
    contextLimitation: "Share-alike applies to derivative imagery.",
    localPath: "/assets/species/hyacinth-macaw/SP-006.jpg", localPathMobile: "/assets/species/hyacinth-macaw/SP-006-mobile.jpg", checked: "2026-08-12",
  },
  "SP-007": {
    assetId: "SP-007", use: "SPECIES / Living Systems Amazonia — Giant Otter",
    provider: "Wikimedia Commons", creator: "Charles J. Sharp",
    sourcePage: "https://commons.wikimedia.org/wiki/File:Giant_otters_(Pteronura_brasiliensis).jpg",
    licence: "CC BY-SA 4.0", licenceUrl: L["CC BY-SA 4.0"], attribution: "Charles J. Sharp — CC BY-SA 4.0",
    attributionRequired: true, commercialWebAllowed: true, cropModifyAllowed: true,
    contextLimitation: "Share-alike applies to derivative imagery.",
    localPath: "/assets/species/giant-otter/SP-007.jpg", localPathMobile: "/assets/species/giant-otter/SP-007-mobile.jpg", checked: "2026-08-12",
  },
  "SP-008": {
    assetId: "SP-008", use: "SPECIES / Living Systems — Western Honey Bee (pollination/food)",
    provider: "Wikimedia Commons", creator: "Ryan Hodnett",
    sourcePage: "https://commons.wikimedia.org/wiki/File:Western_Honey_Bee_(Apis_mellifera)_on_Common_Heather_(Calluna_vulgaris)_-_Sandnes,_Norway_2021-08-02.jpg",
    licence: "CC BY-SA 4.0", licenceUrl: L["CC BY-SA 4.0"], attribution: "Ryan Hodnett — CC BY-SA 4.0",
    attributionRequired: true, commercialWebAllowed: true, cropModifyAllowed: true,
    contextLimitation: "Share-alike applies. Norwegian image; illustrative of the species.",
    localPath: "/assets/species/honey-bee/SP-008.jpg", localPathMobile: "/assets/species/honey-bee/SP-008-mobile.jpg", checked: "2026-08-12",
  },
  "SP-009": {
    assetId: "SP-009", use: "SPECIES / Oslofjord — Atlantic Cod profile",
    provider: "Wikimedia Commons", creator: "Hans Hillewaert",
    sourcePage: "https://commons.wikimedia.org/wiki/File:Gadus_morhua.jpg",
    licence: "CC BY-SA 4.0", licenceUrl: L["CC BY-SA 4.0"], attribution: "Hans Hillewaert — CC BY-SA 4.0",
    attributionRequired: true, commercialWebAllowed: true, cropModifyAllowed: true,
    contextLimitation: "Belgian coastal waters — a species portrait, NOT an Oslofjord record.",
    localPath: "/assets/species/atlantic-cod/SP-009.jpg", localPathMobile: "/assets/species/atlantic-cod/SP-009-mobile.jpg", checked: "2026-08-12",
  },
  "SP-010": {
    assetId: "SP-010", use: "SPECIES / Oslofjord — Blue Mussel profile/food-web",
    provider: "Wikimedia Commons", creator: "Ryan Hodnett",
    sourcePage: "https://commons.wikimedia.org/wiki/File:Blue_Mussel_(Bl%C3%A5skjell)_(Mytilus_edulis)_-_And%C3%B8y,_Norway_2023-07-10_(02).jpg",
    licence: "CC BY-SA 4.0", licenceUrl: L["CC BY-SA 4.0"], attribution: "Ryan Hodnett — CC BY-SA 4.0",
    attributionRequired: true, commercialWebAllowed: true, cropModifyAllowed: true,
    contextLimitation: "Norway-specific, illustrative species media — not an Oslofjord condition record.",
    localPath: "/assets/species/blue-mussel/SP-010.jpg", localPathMobile: "/assets/species/blue-mussel/SP-010-mobile.jpg", checked: "2026-08-12",
  },
  "LS-001": {
    assetId: "LS-001", use: "LIVING SYSTEMS / Oslofjord — Eelgrass habitat scene",
    provider: "Wikimedia Commons", creator: "Sten Porse",
    sourcePage: "https://commons.wikimedia.org/wiki/File:Zostera-marina-habitat.jpg",
    licence: "CC BY-SA 3.0", licenceUrl: L["CC BY-SA 3.0"], attribution: "Sten Porse — CC BY-SA 3.0",
    attributionRequired: true, commercialWebAllowed: true, cropModifyAllowed: true,
    contextLimitation: "Habitat illustration — NOT evidence of current Oslofjord condition.",
    localPath: "", localPathMobile: "", checked: "2026-08-12",
  },
};

export const assetById = (id: string): MediaAsset | undefined => MEDIA_MANIFEST[id];

/** An asset is publicly usable only with a real licence + (required) attribution. */
export function isPubliclyUsable(id: string): boolean {
  const a = MEDIA_MANIFEST[id];
  if (!a || !a.localPath) return false;
  if (!a.licence) return false;
  if (a.attributionRequired && !a.attribution) return false;
  return true;
}

/** The exact credit line to render next to a public asset. */
export function creditLine(id: string): string {
  const a = MEDIA_MANIFEST[id];
  if (!a) return "";
  return `${a.attribution} · via ${a.provider}`;
}
