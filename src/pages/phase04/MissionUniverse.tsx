import type { CSSProperties } from "react";
import { Link } from "react-router-dom";
import { PublicShell } from "@/components/layout/PublicShell";
import { img, type ImageKey } from "@/content/imageRegistry";
import { RelationshipReveal } from "@/components/phase04/RelationshipReveal";
import { ProvenanceBar } from "@/components/phase04/ProvenanceBar";
import type { RelationshipStep } from "@/phase04/model";

export type Phase04MissionKey = "am4zonia" | "wh4les" | "clim4te";

type MissionConfig = {
  code: string;
  plain: string;
  territory: string;
  accent: string;
  image: ImageKey;
  intro: string;
  question: string;
  relation: RelationshipStep[];
};

const CONFIG: Record<Phase04MissionKey, MissionConfig> = {
  am4zonia: {
    code: "AM4ZONIA_",
    plain: "Amazon Rainforest Mission",
    territory: "E4RTH_",
    accent: "#3AE86F",
    image: "amazoniaHero",
    intro: "A deep subject universe for the Amazon Basin: life, forest systems, water, pressures, people, responses and evidence — without becoming a separate organisation.",
    question: "How does a forest become a system you can follow?",
    relation: [
      { id: "forest", label: "Tropical forest", kind: "LIVING SYSTEM", status: "SEEDED PROTOTYPE" },
      { id: "function", label: "Primary production", kind: "FUNCTION", status: "SOURCE REVIEW PENDING" },
      { id: "cycling", label: "Nutrient cycling", kind: "FUNCTION", status: "SOURCE REVIEW PENDING" },
      { id: "human", label: "Food system", kind: "HUMAN SYSTEM", status: "SOURCE REVIEW PENDING" },
    ],
  },
  wh4les: {
    code: "WH4LES_",
    plain: "Whale Protection Mission",
    territory: "OCE4N_",
    accent: "#2E2EFF",
    image: "wh4lesHero",
    intro: "A species-led ocean universe for whales, places, observations, relationships, human pressures, responses and proof — with shared 4PLANET truth infrastructure.",
    question: "A whale is never only a whale.",
    relation: [
      { id: "whale", label: "Whales", kind: "LIFE", status: "PROTOTYPE DATA" },
      { id: "sea", label: "Cold coastal sea", kind: "LIVING SYSTEM", status: "SEEDED PROTOTYPE" },
      { id: "pressure", label: "Human pressures", kind: "PRESSURE", status: "SOURCE REVIEW PENDING" },
      { id: "response", label: "Protection responses", kind: "SOLUTION", status: "NOT YET IMPLEMENTED" },
    ],
  },
  clim4te: {
    code: "CLIM4TE_",
    plain: "Climate Mission",
    territory: "E4RTH_",
    accent: "#3AE86F",
    image: "clim4teHero",
    intro: "A temporal universe for climate signals, places, living systems, human pressures, responses and evidence — designed around change over time rather than a static issue page.",
    question: "What changes when the climate changes?",
    relation: [
      { id: "atmosphere", label: "Climate signal", kind: "SIGNAL", status: "NOT YET IMPLEMENTED" },
      { id: "place", label: "Place", kind: "PLACE", status: "PROTOTYPE DATA" },
      { id: "life", label: "Living system", kind: "LIFE", status: "SOURCE REVIEW PENDING" },
      { id: "response", label: "Human response", kind: "SOLUTION", status: "SOURCE REVIEW PENDING" },
    ],
  },
};

export function MissionUniverse({ mission }: { mission: Phase04MissionKey }) {
  const m = CONFIG[mission];
  const visual = img(m.image);
  return (
    <PublicShell>
      <section style={{ minHeight: "88svh", display: "grid", gridTemplateColumns: "minmax(0,.9fr) minmax(420px,1.1fr)", borderTop: `8px solid ${m.accent}` }}>
        <div style={{ padding: "clamp(90px,10vw,150px) clamp(20px,5vw,72px) 48px", display: "flex", flexDirection: "column", justifyContent: "space-between", gap: 36 }}>
          <div>
            <div className="mono" style={{ fontSize: 10.5, letterSpacing: ".1em" }}>4PLANET_ → {m.territory} → {m.code}</div>
            <div style={{ fontSize: 14, marginTop: 8 }}>{m.plain} · A 4PLANET mission.</div>
          </div>
          <div>
            <h1 style={{ ...display, fontSize: "clamp(70px,10vw,150px)", margin: 0 }}>{m.code}</h1>
            <p style={{ fontSize: "clamp(18px,2vw,26px)", lineHeight: 1.3, maxWidth: 720, margin: "24px 0 0" }}>{m.intro}</p>
          </div>
        </div>
        <div style={{ position: "relative", minHeight: 580, background: "#0A0A0A" }}>
          <picture>{visual.srcMobile && <source media="(max-width:760px)" srcSet={visual.srcMobile} />}<img src={visual.src} alt={visual.alt} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: visual.objectPosition }} /></picture>
          <div aria-hidden style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg,rgba(0,0,0,.02),rgba(0,0,0,.34))" }} />
          <div className="mono" style={{ position: "absolute", left: 18, bottom: 16, color: "#fff", fontSize: 9.5, letterSpacing: ".08em" }}>DOCUMENTARY / EXISTING 4PLANET LIBRARY · NOT EVIDENCE OF A SPECIFIC EVENT</div>
        </div>
      </section>

      <div style={{ maxWidth: 1380, margin: "0 auto", padding: "0 clamp(20px,5vw,72px)" }}>
        <section style={{ padding: "clamp(70px,9vw,125px) 0", display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(300px,.7fr)", gap: "clamp(30px,6vw,90px)" }}>
          <div><div style={{ ...mono, color: m.accent }}>MISSION QUESTION</div><h2 style={{ ...display, fontSize: "clamp(46px,7vw,94px)", margin: "18px 0 0" }}>{m.question}</h2></div>
          <div style={{ alignSelf: "end" }}>
            {[['MASTER','4PLANET endorsement is persistent.'],['CODE',`${m.code} is the family signature.`],['PLAIN',`${m.plain} remains present for comprehension, SEO and accessibility.`],['TRUTH','Source, evidence and proof grammar are inherited from 4PLANET.'],['LOCAL','Imagery, editorial rhythm and subject depth can vary within the shared system.']].map(([k,v]) => <div key={k} style={{ borderTop: "1px solid rgba(10,10,10,.26)", padding: "12px 0", display: "grid", gridTemplateColumns: "86px 1fr", gap: 12 }}><span style={mono}>{k}</span><span style={{ fontSize: 14, lineHeight: 1.45 }}>{v}</span></div>)}
          </div>
        </section>

        <section style={{ padding: "clamp(40px,6vw,80px) 0" }}>
          <RelationshipReveal steps={m.relation} note="Mission proof fixture. Seeded graph edges remain visibly non-canonical until source review." />
        </section>

        <section style={{ padding: "clamp(70px,8vw,110px) 0" }}>
          <div style={{ ...mono, color: m.accent, marginBottom: 20 }}>FOLLOW / SIGNAL / ACTION / PROOF</div>
          <div className="mission-universe-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", borderTop: "1px solid #0A0A0A", borderLeft: "1px solid #0A0A0A" }}>
            {[
              ["FOLLOW", "Local-first follow belongs to shared 4PLANET identity. Mission-specific notification logic is not yet built."],
              ["SIGNAL", "Use the shared Signal object. Do not create a mission news feed."],
              ["ACTION", "Expose only pathways that pass IMPACT readiness gates."],
              ["PROOF", "Use shared provenance and proof states. Mission aesthetics cannot strengthen the claim."],
            ].map(([k,v]) => <div key={k} style={{ minHeight: 220, padding: 22, borderRight: "1px solid #0A0A0A", borderBottom: "1px solid #0A0A0A" }}><div style={mono}>{k}</div><p style={{ fontSize: 14.5, lineHeight: 1.5, margin: "90px 0 0" }}>{v}</p></div>)}
          </div>
        </section>

        <section style={{ padding: "clamp(50px,7vw,90px) 0" }}>
          <ProvenanceBar value={{ state: "4PLANET CONTEXT", actor: "4PLANET", method: "Phase 04 mission-universe prototype", time: "Aug 2026", limitation: "Architecture and interaction prototype. It does not imply complete scientific coverage, active mission delivery, partnership or verified outcomes." }} />
          <div style={{ display: "flex", gap: 9, flexWrap: "wrap", marginTop: 20 }}><Link to="/missions" style={button}>All missions →</Link><Link to="/" style={{ ...button, background: "#fff", color: "#0A0A0A" }}>Return to 4PLANET</Link></div>
        </section>
      </div>
      <style>{`@media(max-width:900px){.mission-universe-grid{grid-template-columns:1fr 1fr!important}}@media(max-width:760px){#main-content>section:first-child{grid-template-columns:1fr!important}.mission-universe-grid{grid-template-columns:1fr!important}}`}</style>
    </PublicShell>
  );
}

const display: CSSProperties = { fontFamily: "'Instrument Sans','DM Sans',sans-serif", fontWeight: 500, letterSpacing: "-.055em", lineHeight: .92 };
const mono: CSSProperties = { fontFamily: "'Fragment Mono',ui-monospace,monospace", fontSize: 10.5, letterSpacing: ".09em", textTransform: "uppercase" };
const button: CSSProperties = { display: "inline-flex", padding: "11px 14px", border: "1px solid #0A0A0A", background: "#0A0A0A", color: "#fff", textDecoration: "none", fontSize: 13 };
