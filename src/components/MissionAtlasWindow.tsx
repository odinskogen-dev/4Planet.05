import { SpeciesAtlasWindow, type SpeciesAtlasEcosystemAnchor } from "@/components/species/SpeciesAtlasWindow";
import { speciesBySlug } from "@/data/species";
import { T } from "@/styles/tokens";

type MissionAtlasState = {
  speciesSlug: string;
  label: string;
  title: string;
  intro: string;
  ecosystems?: SpeciesAtlasEcosystemAnchor[];
};

const AMAZON: SpeciesAtlasEcosystemAnchor = {
  label: "AMAZON RAINFOREST",
  href: "/ecosystems/amazon-rainforest",
  relationship: "CURATED REGIONAL LIVING-SYSTEM CONTEXT",
  boundary: "A bounded 4PLANET learning bridge. It is not inferred from GBIF occurrence points and does not assert ecosystem membership for a particular observation, animal or population.",
};

/**
 * Mission → ATLAS bridge using the same SpeciesAtlasWindow already proven in the
 * Jaguar Gold Reference. This deliberately reuses the shared MapLibre + GBIF
 * occurrence seam instead of creating a mission-specific map engine.
 *
 * Only missions with a current canonical Species identity receive an embedded
 * state. Other missions retain the existing full-ATLAS handoff until their
 * place/species/source state is strong enough to render without invention.
 */
const STATES: Record<string, MissionAtlasState> = {
  wh4les: {
    speciesSlug: "orca",
    label: "OCE4N_ · WH4LES_ · ATLAS STATE",
    title: "Follow one whale into the ocean around it.",
    intro: "Start with reported Orca observations, then continue into the wider ocean system. Observation points are records — not migration routes, population estimates or live tracking.",
  },
  am4zonia: {
    speciesSlug: "jaguar",
    label: "E4RTH_ · AM4ZONIA_ · ATLAS STATE",
    title: "Enter the Amazon through one living species.",
    intro: "Jaguar observations provide one bounded doorway into place. The Amazon ecosystem link is curated context, not a claim that every Jaguar record represents Amazon rainforest habitat.",
    ecosystems: [AMAZON],
  },
  species: {
    speciesSlug: "jaguar",
    label: "E4RTH_ · SPECIES_ · GOLD REFERENCE",
    title: "A species becomes a place, a relationship and a system.",
    intro: "The Jaguar Gold Reference shows how SPECIES and ATLAS connect without turning occurrence points into range, abundance or ecological-condition claims.",
    ecosystems: [AMAZON],
  },
  food: {
    speciesSlug: "western-honey-bee",
    label: "S4PIENS_ · FOOD_ · ATLAS STATE",
    title: "Food depends on living relationships.",
    intro: "Begin with one familiar pollinator and follow the spatial evidence outward. These records show reported observations, not pollination service, crop dependence or local population health.",
  },
  "rewild-marine": {
    speciesSlug: "blue-mussel",
    label: "OCE4N_ · RE:WILD MARINE · ATLAS STATE",
    title: "Coastal recovery begins with the life already there.",
    intro: "Blue Mussel observations provide one species-level entry into coastal habitat. They do not by themselves diagnose water quality, reef condition or restoration need at a mapped location.",
  },
};

export function MissionAtlasWindow({ missionSlug, accent }: { missionSlug: string; accent: string }) {
  const state = STATES[missionSlug];
  if (!state) return null;
  const profile = speciesBySlug(state.speciesSlug);
  if (!profile) return null;

  return (
    <section data-testid={`mission-atlas-${missionSlug}`} aria-label={`${missionSlug} Atlas window`} style={{ background: "#050805", color: "#fff", borderTop: `3px solid ${accent}` }}>
      <div style={{ maxWidth: 1240, margin: "0 auto", padding: "clamp(44px,6vw,80px) clamp(18px,5vw,72px) 0" }}>
        <div style={{ fontFamily: T.mono, fontSize: 10.5, letterSpacing: ".14em", color: accent }}>{state.label}</div>
        <h2 style={{ margin: "16px 0 0", maxWidth: "18ch", fontFamily: T.display, fontWeight: 500, fontSize: "clamp(34px,5vw,72px)", lineHeight: .95, letterSpacing: "-.045em" }}>{state.title}</h2>
        <p style={{ margin: "20px 0 0", maxWidth: 690, color: "rgba(255,255,255,.72)", fontSize: "clamp(15px,1.35vw,18px)", lineHeight: 1.6 }}>{state.intro}</p>
        <div style={{ marginTop: 18, fontFamily: T.mono, fontSize: 9.5, letterSpacing: ".08em", color: "rgba(255,255,255,.48)" }}>
          SHARED ATLAS ENGINE · SOURCE-AWARE STATE · OCCURRENCE ≠ RANGE / POPULATION / LIVE TRACKING
        </div>
      </div>
      <SpeciesAtlasWindow
        gbifKey={profile.gbifKey}
        commonName={profile.commonName}
        scientificName={profile.scientificName}
        entityId={profile.id}
        journey={missionSlug}
        ecosystems={state.ecosystems}
      />
    </section>
  );
}
