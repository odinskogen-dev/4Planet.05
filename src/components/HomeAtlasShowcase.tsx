import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { SpeciesAtlasWindow, type SpeciesAtlasEcosystemAnchor } from "@/components/species/SpeciesAtlasWindow";
import { speciesBySlug } from "@/data/species";
import { T } from "@/styles/tokens";

const AMAZON: SpeciesAtlasEcosystemAnchor = {
  label: "AMAZON RAINFOREST",
  href: "/ecosystems/amazon-rainforest",
  relationship: "CURATED REGIONAL CONTEXT",
  boundary: "A bounded 4PLANET learning bridge. It is not inferred from occurrence points and does not assert ecosystem membership for a particular observation, animal or population.",
};

const STATES = [
  { slug: "jaguar", label: "JAGUAR", line: "Reported observations open a path from one species into place, relationships and rainforest context.", ecosystems: [AMAZON] },
  { slug: "orca", label: "ORCA", line: "Reported observations stay distinct from range, abundance, population identity and live tracking.", ecosystems: [] as SpeciesAtlasEcosystemAnchor[] },
  { slug: "western-honey-bee", label: "POLLINATOR", line: "One species can open a path into pollination, food and the human systems that depend on living processes.", ecosystems: [] as SpeciesAtlasEcosystemAnchor[] },
] as const;

export function HomeAtlasShowcase() {
  const [active, setActive] = useState(0);
  const state = STATES[active];
  const profile = useMemo(() => speciesBySlug(state.slug), [state.slug]);
  if (!profile) return null;

  return (
    <section aria-label="4PLANET Atlas source-aware preview" style={{ background: "#050505", color: "#fff", overflow: "hidden" }}>
      <div className="home-atlas-head" style={{ maxWidth: 1320, margin: "0 auto", padding: "clamp(56px,8vw,112px) clamp(20px,5vw,72px) clamp(32px,5vw,54px)", display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(300px,.78fr)", gap: "clamp(32px,7vw,110px)", alignItems: "end" }}>
        <div>
          <div style={{ fontFamily: T.mono, fontSize: 10.5, letterSpacing: ".16em", color: T.blue }}>ATLAS_ · WHY THIS MATTERS</div>
          <h2 style={{ margin: "14px 0 0", maxWidth: "12ch", fontFamily: T.display, fontWeight: 500, fontSize: "clamp(42px,6vw,82px)", letterSpacing: "-.05em", lineHeight: .9 }}>
            Evidence becomes useful when it keeps its meaning.
          </h2>
          <p style={{ margin: "22px 0 0", maxWidth: 680, color: "rgba(255,255,255,.72)", fontSize: "clamp(16px,1.4vw,19px)", lineHeight: 1.6 }}>
            ATLAS connects records to life and place without pretending that an observation is a population, a range map or a live animal position. Start with a species; keep the source visible; move outward into the living system.
          </p>
        </div>
        <div>
          <div role="tablist" aria-label="Choose a living-planet entry" style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
            {STATES.map((candidate, index) => {
              const selected = index === active;
              return <button key={candidate.slug} type="button" role="tab" aria-selected={selected} onClick={() => setActive(index)} style={{ fontFamily: T.mono, fontSize: 10.5, letterSpacing: ".12em", padding: "10px 12px", border: `1px solid ${selected ? T.blue : "rgba(255,255,255,.28)"}`, background: selected ? T.blue : "transparent", color: "#fff", cursor: "pointer" }}>{candidate.label}</button>;
            })}
          </div>
          <p style={{ margin: "14px 0 0", color: "rgba(255,255,255,.56)", fontSize: 13.5, lineHeight: 1.55 }}>{state.line}</p>
          <div style={{ marginTop: 18, fontFamily: T.mono, fontSize: 9.5, letterSpacing: ".11em", color: "rgba(255,255,255,.42)" }}>OBSERVATION ≠ RANGE · POPULATION · ABUNDANCE · LIVE TRACKING</div>
          <Link to={`/atlas?entity=${encodeURIComponent(profile.id)}&journey=${encodeURIComponent(`home-${profile.slug}`)}`} style={{ display: "inline-flex", marginTop: 20, color: "#fff", textDecoration: "none", fontFamily: T.mono, fontSize: 11, letterSpacing: ".12em" }}>ENTER FULL ATLAS →</Link>
        </div>
      </div>
      <div key={profile.slug} style={{ borderTop: `2px solid ${T.blue}` }}>
        <SpeciesAtlasWindow gbifKey={profile.gbifKey} commonName={profile.commonName} scientificName={profile.scientificName} entityId={profile.id} journey={`home-${profile.slug}`} ecosystems={[...state.ecosystems]} />
      </div>
      <style>{`.home-atlas-head [role="tab"]:focus-visible{outline:3px solid #fff;outline-offset:4px}@media(max-width:820px){.home-atlas-head{grid-template-columns:1fr!important}}`}</style>
    </section>
  );
}
