import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
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
    line: "Reported Jaguar observations with bounded Amazon rainforest context.",
    ecosystems: [AMAZON],
  },
  {
    slug: "orca",
    label: "OCEAN · ORCA",
    accent: "#2E2EFF",
    line: "Reported Orca observations without inventing a migration route.",
    ecosystems: [] as SpeciesAtlasEcosystemAnchor[],
  },
  {
    slug: "western-honey-bee",
    label: "FOOD · POLLINATOR",
    accent: "#FF4D22",
    line: "Reported pollinator observations as one entry into human food dependencies.",
    ecosystems: [] as SpeciesAtlasEcosystemAnchor[],
  },
] as const;

/**
 * Source-aware homepage window into the shared ATLAS engine.
 * The state selector changes canonical entity context; occurrence records remain
 * distinct from range, abundance, population and live tracking.
 */
export function HomeAtlasShowcase() {
  const [active, setActive] = useState(0);
  const state = STATES[active];
  const profile = useMemo(() => speciesBySlug(state.slug), [state.slug]);
  if (!profile) return null;

  return (
    <section className="home-atlas-showcase" aria-label="Living planet Atlas states" style={{ background: "#050805", color: "#fff", overflow: "hidden" }}>
      <div className="home-atlas-head" style={{ maxWidth: 1320, margin: "0 auto", padding: "clamp(42px,6vw,76px) clamp(20px,5vw,72px) clamp(28px,4vw,46px)" }}>
        <div className="home-atlas-head__copy">
          <div style={{ fontFamily: T.mono, fontSize: 10.5, letterSpacing: ".16em", color: state.accent }}>ATLAS_ · SOURCE-AWARE PLANET VIEW</div>
          <h2 style={{ margin: "12px 0 0", maxWidth: "12ch", fontFamily: T.display, fontWeight: 500, fontSize: "clamp(34px,4.8vw,66px)", letterSpacing: "-.05em", lineHeight: .92 }}>
            The planet changes. The evidence stays visible.
          </h2>
          <p style={{ margin: "18px 0 0", maxWidth: 650, color: "rgba(255,255,255,.68)", fontSize: "clamp(15px,1.25vw,18px)", lineHeight: 1.56 }}>
            Move between species and places through the same ATLAS engine. Reported occurrences remain observations — not range, population or live tracking.
          </p>
        </div>

        <div className="home-atlas-controls">
          <div role="tablist" aria-label="Atlas state" style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
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
                    fontSize: 10,
                    letterSpacing: ".1em",
                    padding: "9px 11px",
                    border: `1px solid ${selected ? candidate.accent : "rgba(255,255,255,.24)"}`,
                    background: selected ? candidate.accent : "transparent",
                    color: selected ? "#050805" : "rgba(255,255,255,.72)",
                    cursor: "pointer",
                  }}
                >
                  {candidate.label}
                </button>
              );
            })}
          </div>
          <p style={{ margin: "13px 0 0", maxWidth: 520, color: "rgba(255,255,255,.5)", fontSize: 13, lineHeight: 1.5 }}>{state.line}</p>
          <Link to="/atlas" style={{ display: "inline-flex", marginTop: 16, fontFamily: T.mono, fontSize: 10.5, letterSpacing: ".12em", color: "rgba(255,255,255,.8)", textDecoration: "none" }}>OPEN FULL ATLAS →</Link>
        </div>
      </div>

      <div className="home-atlas-stage" key={profile.slug} style={{ borderTop: `2px solid ${state.accent}` }}>
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
        .home-atlas-head{display:grid;grid-template-columns:minmax(0,1fr) minmax(320px,.8fr);gap:clamp(32px,7vw,110px);align-items:end}
        .home-atlas-stage > section > div{max-width:none!important;padding-left:clamp(20px,5vw,72px)!important;padding-right:clamp(20px,5vw,72px)!important}
        .home-atlas-stage [aria-label$="reported occurrence map"]{height:min(54svh,620px)!important;min-height:420px}
        .home-atlas-showcase [role="tab"]:focus-visible{outline:3px solid currentColor;outline-offset:4px}
        @media(max-width:820px){.home-atlas-head{grid-template-columns:1fr}.home-atlas-stage [aria-label$="reported occurrence map"]{height:48svh!important;min-height:390px}}
        @media(max-width:520px){.home-atlas-stage [aria-label$="reported occurrence map"]{height:430px!important;min-height:430px}}
      `}</style>
    </section>
  );
}
