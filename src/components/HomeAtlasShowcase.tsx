import { useMemo, useState } from "react";
import { SpeciesAtlasWindow, type SpeciesAtlasEcosystemAnchor } from "@/components/species/SpeciesAtlasWindow";
import { speciesBySlug } from "@/data/species";
import { T } from "@/styles/tokens";

const AMAZON: SpeciesAtlasEcosystemAnchor = {
  label: "AMAZON RAINFOREST",
  href: "/ecosystems/amazon-rainforest",
  relationship: "CURATED REGIONAL LIVING-SYSTEM CONTEXT",
  boundary: "A bounded 4PLANET learning bridge. It is not inferred from GBIF occurrence points and does not assert ecosystem membership for a particular observation, animal or population.",
};

const STATES = [
  {
    slug: "jaguar",
    label: "AMAZONIA · JAGUAR",
    accent: "#3AE86F",
    line: "Enter a forest system through one predator and its reported observations.",
    ecosystems: [AMAZON],
  },
  {
    slug: "orca",
    label: "OCEAN · ORCA",
    accent: "#2E2EFF",
    line: "Shift oceans and follow a wide-ranging marine species without inventing a migration route.",
    ecosystems: [] as SpeciesAtlasEcosystemAnchor[],
  },
  {
    slug: "western-honey-bee",
    label: "FOOD · POLLINATOR",
    accent: "#FF4D22",
    line: "Move into human food systems through one familiar living dependency.",
    ecosystems: [] as SpeciesAtlasEcosystemAnchor[],
  },
] as const;

/**
 * Full-frame front-page ATLAS showcase.
 * Reuses the same SpeciesAtlasWindow / MapLibre / GBIF seam as Jaguar Gold.
 * The state selector changes canonical entity context; it is not a slideshow of
 * fabricated map imagery and it never promotes occurrence into range/population.
 */
export function HomeAtlasShowcase() {
  const [active, setActive] = useState(0);
  const state = STATES[active];
  const profile = useMemo(() => speciesBySlug(state.slug), [state.slug]);
  if (!profile) return null;

  return (
    <section className="home-atlas-showcase" aria-label="Living planet Atlas states" style={{ background: "#050805", color: "#fff", minHeight: "100svh", overflow: "hidden" }}>
      <div style={{ maxWidth: 1440, margin: "0 auto", padding: "clamp(58px,8vw,110px) clamp(20px,5vw,72px) 24px" }}>
        <div style={{ fontFamily: T.mono, fontSize: 10.5, letterSpacing: ".16em", color: state.accent }}>ATLAS_ · LIVING PLANET STATES</div>
        <h2 style={{ margin: "16px 0 0", maxWidth: "13ch", fontFamily: T.display, fontWeight: 500, fontSize: "clamp(42px,7vw,104px)", letterSpacing: "-.055em", lineHeight: .9 }}>
          Change the lens. Keep the planet.
        </h2>
        <p style={{ margin: "22px 0 0", maxWidth: 720, color: "rgba(255,255,255,.76)", fontSize: "clamp(16px,1.45vw,20px)", lineHeight: 1.58 }}>
          One shared Atlas can move between species, places and human dependencies without losing source boundaries or context.
        </p>

        <div role="tablist" aria-label="Atlas state" style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 30 }}>
          {STATES.map((candidate, index) => {
            const selected = index === active;
            return (
              <button
                key={candidate.slug}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => setActive(index)}
                style={{
                  fontFamily: T.mono,
                  fontSize: 10.5,
                  letterSpacing: ".11em",
                  padding: "10px 12px",
                  border: `1px solid ${selected ? candidate.accent : "rgba(255,255,255,.26)"}`,
                  background: selected ? candidate.accent : "transparent",
                  color: selected ? "#050805" : "rgba(255,255,255,.76)",
                  cursor: "pointer",
                }}
              >
                {candidate.label}
              </button>
            );
          })}
        </div>
        <p style={{ margin: "16px 0 0", maxWidth: 650, color: "rgba(255,255,255,.56)", fontSize: 13.5, lineHeight: 1.55 }}>{state.line}</p>
      </div>

      <div className="home-atlas-stage" key={profile.slug} style={{ borderTop: `3px solid ${state.accent}` }}>
        <SpeciesAtlasWindow
          gbifKey={profile.gbifKey}
          commonName={profile.commonName}
          scientificName={profile.scientificName}
          entityId={profile.id}
          journey={`home-${profile.slug}`}
          ecosystems={[...state.ecosystems]}
        />
      </div>

      <style>{`
        .home-atlas-stage > section > div { max-width: none !important; padding-left: clamp(20px,5vw,72px) !important; padding-right: clamp(20px,5vw,72px) !important; }
        .home-atlas-stage [aria-label$="reported occurrence map"] { height: min(72svh, 820px) !important; }
        .home-atlas-showcase [role="tab"]:focus-visible { outline: 3px solid currentColor; outline-offset: 4px; }
        @media(max-width:820px){ .home-atlas-stage [aria-label$="reported occurrence map"] { height: 58svh !important; min-height: 420px; } }
      `}</style>
    </section>
  );
}
