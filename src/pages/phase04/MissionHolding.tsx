import type { CSSProperties } from "react";
import { Link, useParams } from "react-router-dom";
import { PublicShell } from "@/components/layout/PublicShell";
import { ProvenanceBar } from "@/components/phase04/ProvenanceBar";

const MISSIONS: Record<string, { code: string; plain: string; territory: string; accent: string }> = {
  cle4n: { code: "CLE4N_", plain: "Clean Ocean Mission", territory: "OCE4N_", accent: "#2E2EFF" },
  cor4l: { code: "COR4L_", plain: "Coral Mission", territory: "OCE4N_", accent: "#2E2EFF" },
  "rewild-marine": { code: "RE:WILD_ MARINE", plain: "Marine Rewilding Mission", territory: "OCE4N_", accent: "#2E2EFF" },
  species: { code: "SPECIES_", plain: "Species Mission", territory: "E4RTH_", accent: "#3AE86F" },
  "rewild-land": { code: "RE:WILD_ LAND", plain: "Land Rewilding Mission", territory: "E4RTH_", accent: "#3AE86F" },
  food: { code: "FOOD_", plain: "Food Mission", territory: "S4PIENS_", accent: "#FF4D22" },
  en4rgy: { code: "EN4RGY_", plain: "Energy Mission", territory: "S4PIENS_", accent: "#FF4D22" },
  "circular-city": { code: "CIRCULAR CITY_", plain: "Circular City Mission", territory: "S4PIENS_", accent: "#FF4D22" },
  f4shion: { code: "F4SHION_", plain: "Fashion Mission", territory: "S4PIENS_", accent: "#FF4D22" },
  m4gazine: { code: "M4GAZINE_", plain: "Magazine Mission", territory: "4CULTURE_", accent: "#2E2EFF" },
  "4film": { code: "4FILM_", plain: "Film Mission", territory: "4CULTURE_", accent: "#2E2EFF" },
  "4rt": { code: "4RT_", plain: "Prints for Planet", territory: "4CULTURE_", accent: "#2E2EFF" },
  "4play": { code: "4PLAY_", plain: "Music and Live Culture Mission", territory: "4CULTURE_", accent: "#2E2EFF" },
};

export function MissionHolding() {
  const { slug = "" } = useParams();
  const m = MISSIONS[slug];
  if (!m) return null;
  return (
    <PublicShell>
      <section style={{ minHeight: "75svh", padding: "clamp(90px,11vw,160px) clamp(20px,5vw,72px) 70px", borderTop: `8px solid ${m.accent}`, display: "flex", flexDirection: "column", justifyContent: "space-between", gap: 60 }}>
        <div><div style={mono}>4PLANET_ → {m.territory} → {m.code}</div><div style={{ fontSize: 14, marginTop: 8 }}>{m.plain} · A 4PLANET mission.</div></div>
        <div><h1 style={{ ...display, fontSize: "clamp(64px,11vw,160px)", margin: 0 }}>{m.code}</h1><p style={{ maxWidth: 760, fontSize: "clamp(19px,2.2vw,28px)", lineHeight: 1.3, margin: "26px 0 0" }}>This canonical mission is part of the locked 4×4 architecture. Its deep Phase 04 universe has not yet been built, so this surface exposes identity and maturity without inventing content, partners or outcomes.</p></div>
      </section>
      <section style={{ maxWidth: 1380, margin: "0 auto", padding: "clamp(60px,8vw,110px) clamp(20px,5vw,72px)" }}>
        <ProvenanceBar value={{ state: "4PLANET CONTEXT", actor: "4PLANET", method: "Canonical mission architecture", time: "Phase 04 candidate", limitation: "Mission identity is canonical; detailed mission intelligence, Signal, Follow, action and proof modules are NOT YET BUILT on this surface." }} />
        <div style={{ display: "flex", gap: 9, flexWrap: "wrap", marginTop: 22 }}><Link to="/missions" style={button}>All missions →</Link><Link to="/" style={{ ...button, background: "#fff", color: "#0A0A0A" }}>Return to 4PLANET</Link></div>
      </section>
    </PublicShell>
  );
}

const display: CSSProperties = { fontFamily: "'Instrument Sans','DM Sans',sans-serif", fontWeight: 500, letterSpacing: "-.06em", lineHeight: .86 };
const mono: CSSProperties = { fontFamily: "'Fragment Mono',ui-monospace,monospace", fontSize: 10.5, letterSpacing: ".1em", textTransform: "uppercase" };
const button: CSSProperties = { display: "inline-flex", padding: "11px 14px", border: "1px solid #0A0A0A", background: "#0A0A0A", color: "#fff", textDecoration: "none", fontSize: 13 };
