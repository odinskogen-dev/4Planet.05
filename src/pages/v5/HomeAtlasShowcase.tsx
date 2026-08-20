import { useState } from "react";
import { Link } from "react-router-dom";
import { SpeciesAtlasWindow, type SpeciesAtlasEcosystemAnchor } from "@/components/species/SpeciesAtlasWindow";
import { T } from "@/styles/tokens";

const mono: React.CSSProperties = { fontFamily: T.mono, fontSize: 10.5, letterSpacing: ".14em", textTransform: "uppercase" };
const display: React.CSSProperties = { fontFamily: T.display, fontWeight: 500, letterSpacing: "-.04em" };

type AtlasState = {
  key: string;
  label: string;
  mission: string;
  commonName: string;
  scientificName: string;
  gbifKey: number;
  entityId: string;
  journey: string;
  ecosystems: SpeciesAtlasEcosystemAnchor[];
};

const STATES: AtlasState[] = [
  {
    key: "jaguar",
    label: "JAGUAR · AMAZON",
    mission: "AM4ZONIA_",
    commonName: "Jaguar",
    scientificName: "Panthera onca",
    gbifKey: 5219426,
    entityId: "taxon:gbif:5219426",
    journey: "am4zonia",
    ecosystems: [{
      label: "Amazon Rainforest",
      href: "/ecosystems/amazon-rainforest",
      relationship: "CURATED LIVING-SYSTEM CONTEXT",
      boundary: "This link opens a curated rainforest context. It does not infer that every reported jaguar occurrence belongs to the Amazon or that a mapped record establishes local ecological condition.",
    }],
  },
  {
    key: "orca",
    label: "ORCA · OCEAN",
    mission: "WH4LES_",
    commonName: "Orca",
    scientificName: "Orcinus orca",
    gbifKey: 2440483,
    entityId: "taxon:gbif:2440483",
    journey: "wh4les",
    ecosystems: [{
      label: "Coastal Sea",
      href: "/living-systems",
      relationship: "CURATED LIVING-SYSTEM CONTEXT",
      boundary: "Species-level coastal-sea context does not identify the population, ecotype, pod, present location or ecological condition of a particular occurrence record.",
    }],
  },
  {
    key: "bee",
    label: "BEE · FOOD",
    mission: "FOOD_",
    commonName: "Western Honey Bee",
    scientificName: "Apis mellifera",
    gbifKey: 1341976,
    entityId: "taxon:gbif:1341976",
    journey: "food",
    ecosystems: [{
      label: "Pollination",
      href: "/living-systems",
      relationship: "CURATED LIVING-SYSTEM CONTEXT",
      boundary: "The relationship is a system entry point. An occurrence point does not measure pollination delivered, crop dependence, colony health or local ecological condition.",
    }],
  },
];

export function HomeAtlasShowcase() {
  const [activeKey, setActiveKey] = useState(STATES[0].key);
  const active = STATES.find((state) => state.key === activeKey) ?? STATES[0];

  return (
    <section className="home-atlas-showcase" aria-labelledby="home-atlas-heading">
      <div className="home-atlas-showcase__intro">
        <div>
          <div style={{ ...mono, color: T.acid }}>ATLAS_ · LIVE WINDOW</div>
          <h2 id="home-atlas-heading" style={{ ...display, marginTop: 14, fontSize: "clamp(38px,6vw,88px)", lineHeight: .92, maxWidth: "12ch" }}>Change the state. Keep the same planet.</h2>
        </div>
        <div className="home-atlas-showcase__copy">
          <p>Three entrances into the same shared spatial system: a predator, a whale and a pollinator. The source boundary travels with each view.</p>
          <div style={{ ...mono, color: "rgba(255,255,255,.48)", marginTop: 16 }}>REPORTED OCCURRENCE ≠ RANGE · POPULATION · LIVE TRACKING</div>
        </div>
      </div>

      <div className="home-atlas-showcase__tabs" role="tablist" aria-label="Atlas showcase states">
        {STATES.map((state, index) => {
          const selected = state.key === active.key;
          return (
            <button
              key={state.key}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => setActiveKey(state.key)}
              className="home-atlas-showcase__tab"
              style={{ color: selected ? "#050805" : "rgba(255,255,255,.76)", background: selected ? T.acid : "transparent", borderColor: selected ? T.acid : "rgba(255,255,255,.24)" }}
            >
              <span>{`0${index + 1}`}</span>
              <span>{state.label}</span>
            </button>
          );
        })}
        <Link to={`/atlas?entity=${encodeURIComponent(active.entityId)}&journey=${encodeURIComponent(active.journey)}`} className="home-atlas-showcase__full">OPEN FULL ATLAS →</Link>
      </div>

      <div role="tabpanel" aria-label={`${active.label} Atlas state`}>
        <div className="home-atlas-showcase__state-label"><span>{active.mission}</span><span>{active.scientificName}</span></div>
        <SpeciesAtlasWindow
          key={active.key}
          gbifKey={active.gbifKey}
          commonName={active.commonName}
          scientificName={active.scientificName}
          entityId={active.entityId}
          journey={active.journey}
          ecosystems={active.ecosystems}
        />
      </div>

      <style>{`
        .home-atlas-showcase{background:#050805;color:#fff;border-top:1px solid rgba(255,255,255,.14);border-bottom:1px solid rgba(255,255,255,.14)}
        .home-atlas-showcase__intro{max-width:1440px;margin:0 auto;padding:clamp(68px,9vw,140px) clamp(20px,5vw,72px) clamp(38px,5vw,66px);display:grid;grid-template-columns:minmax(0,1.15fr) minmax(280px,.55fr);gap:clamp(32px,7vw,110px);align-items:end}
        .home-atlas-showcase__copy{font-size:clamp(15px,1.3vw,18px);line-height:1.62;color:rgba(255,255,255,.72);max-width:520px}
        .home-atlas-showcase__tabs{max-width:1440px;margin:0 auto;padding:0 clamp(20px,5vw,72px) 22px;display:flex;align-items:stretch;gap:8px;flex-wrap:wrap}
        .home-atlas-showcase__tab{appearance:none;border:1px solid;background:transparent;font-family:${T.mono};font-size:10px;letter-spacing:.1em;display:flex;gap:12px;padding:11px 13px;cursor:pointer}
        .home-atlas-showcase__tab:focus-visible,.home-atlas-showcase__full:focus-visible{outline:3px solid currentColor;outline-offset:4px}
        .home-atlas-showcase__full{margin-left:auto;display:inline-flex;align-items:center;padding:10px 0;color:${T.acid};font-family:${T.mono};font-size:10.5px;letter-spacing:.12em;text-decoration:none}
        .home-atlas-showcase__state-label{max-width:1440px;margin:0 auto;padding:12px clamp(20px,5vw,72px);display:flex;justify-content:space-between;gap:16px;border-top:1px solid rgba(255,255,255,.14);border-bottom:1px solid rgba(255,255,255,.14);font-family:${T.mono};font-size:9.5px;letter-spacing:.12em;color:rgba(255,255,255,.5)}
        .home-atlas-showcase .species-atlas-grid{grid-template-columns:minmax(260px,.55fr) minmax(0,1.45fr)!important}
        .home-atlas-showcase [aria-label$="reported occurrence map"]{height:min(72vh,760px)!important}
        .home-atlas-showcase .species-atlas-grid>div:last-child{min-height:min(72vh,760px)!important}
        @media(max-width:820px){.home-atlas-showcase__intro{grid-template-columns:1fr}.home-atlas-showcase__full{margin-left:0;width:100%}.home-atlas-showcase .species-atlas-grid{grid-template-columns:1fr!important}.home-atlas-showcase__state-label{flex-direction:column}.home-atlas-showcase [aria-label$="reported occurrence map"]{height:62vh!important}}
        @media(prefers-reduced-motion:reduce){.home-atlas-showcase__tab{transition:none}}
      `}</style>
    </section>
  );
}
