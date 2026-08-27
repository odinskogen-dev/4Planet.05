// Truthful public page-type labels (V19 §04). No "FIELD REPORT" unless real field material exists.
export type MissionKind = "MISSION DOSSIER" | "SYSTEM DOSSIER" | "CULTURAL PROJECT";

const SYSTEM = new Set(["food", "en4rgy", "circular-city", "f4shion"]);
const CULTURAL = new Set(["4play", "4film", "4rt", "m4gazine"]);

export function missionKind(slug: string): MissionKind {
  if (SYSTEM.has(slug)) return "SYSTEM DOSSIER";
  if (CULTURAL.has(slug)) return "CULTURAL PROJECT";
  return "MISSION DOSSIER";
}

// Flagship missions get launch-quality depth + image minimums.
export const FLAGSHIP = new Set(["wh4les", "clim4te", "am4zonia", "cle4n"]);
export const isFlagship = (slug: string) => FLAGSHIP.has(slug);
