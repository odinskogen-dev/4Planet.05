import { useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import { Link } from "react-router-dom";
import { PublicShell } from "@/components/layout/PublicShell";
import { img } from "@/content/imageRegistry";
import { RelationshipReveal } from "@/components/phase04/RelationshipReveal";
import { ProvenanceBar, ProofExplanation } from "@/components/phase04/ProvenanceBar";
import { SignalCard } from "@/components/phase04/SignalCard";
import { OSLOFJORDEN_SEMANTIC_IDENTITY } from "@/phase04/oslofjorden";
import type { RelationshipStep, SignalPresentation } from "@/phase04/model";

const RELATIONSHIP: RelationshipStep[] = [
  { id: "place", label: "Oslofjorden", kind: "PLACE", status: "CURATED SOURCE" },
  { id: "life", label: "Species + habitats", kind: "LIFE", status: "NOT YET IMPLEMENTED" },
  { id: "pressures", label: "Nitrogen + other human pressures", kind: "PRESSURE", status: "CURATED SOURCE" },
  { id: "response", label: "Policy + restoration responses", kind: "RESPONSE", status: "CURATED SOURCE" },
  { id: "monitoring", label: "Ecological indicators over time", kind: "PROOF", status: "NOT YET IMPLEMENTED" },
];

const POLICY_SIGNAL: SignalPresentation = {
  what: "A proposed new Oslofjord plan is under consultation.",
  where: "Oslofjorden · Norway",
  when: "19 JUN 2026",
  source: "Norwegian Government · Ministry of Climate and Environment",
  confidence: "HIGH",
  whyItMatters: "It changes the public policy context around measures, monitoring and restoration for Oslofjorden.",
  relationship: "Policy → measures → pressures → monitoring → ecological response",
  followNext: "Consultation outcome · final plan · implementation · monitoring · ecological indicators",
  dataState: "CURATED SOURCE",
};

const label: CSSProperties = { fontFamily: "'Fragment Mono',ui-monospace,monospace", fontSize: 10.5, letterSpacing: ".1em", textTransform: "uppercase" };
const title: CSSProperties = { fontFamily: "'Instrument Sans','DM Sans',sans-serif", fontWeight: 500, letterSpacing: "-.05em", lineHeight: .94 };

function StateTag({ children, tone = "blue" }: { children: ReactNode; tone?: "blue" | "red" | "dark" }) {
  const color = tone === "red" ? "#FF4D22" : tone === "dark" ? "#0A0A0A" : "#2E2EFF";
  return <span style={{ ...label, color, border: `1px solid ${color}`, padding: "7px 9px", display: "inline-flex" }}>{children}</span>;
}

export default function OslofjordenJourney() {
  const [followed, setFollowed] = useState(false);
  const ocean = img("oce4nDomainHero");
  const place = OSLOFJORDEN_SEMANTIC_IDENTITY;
  return (
    <PublicShell>
      <section style={{ minHeight: "88svh", position: "relative", background: "#0A0A0A", color: "#fff", overflow: "hidden" }}>
        <picture>
          {ocean.srcMobile && <source media="(max-width:760px)" srcSet={ocean.srcMobile} />}
          <img src={ocean.src} alt={ocean.alt} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: ocean.objectPosition }} />
        </picture>
        <div aria-hidden style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg,rgba(0,0,0,.08),rgba(0,0,0,.82))" }} />
        <div style={{ position: "relative", minHeight: "88svh", padding: "clamp(90px,12vw,170px) clamp(20px,5vw,72px) clamp(36px,6vw,72px)", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div><div style={{ ...label, color: "#fff" }}>PLACE JOURNEY 01 / OSLOFJORDEN / INTERNAL PUBLIC PROTOTYPE</div></div>
          <div>
            <h1 style={{ ...title, fontSize: "clamp(68px,12vw,178px)", margin: 0 }}>OSLO<br />FJORDEN.</h1>
            <p style={{ maxWidth: 760, fontSize: "clamp(20px,2.4vw,31px)", lineHeight: 1.18, letterSpacing: "-.025em", margin: "24px 0 0" }}>One place. Many living systems. Many pressures. Evidence that changes over time.</p>
            <div style={{ ...label, marginTop: 22, color: "rgba(255,255,255,.72)" }}>DOCUMENTARY OCEAN IMAGE / NOT OSLOFJORDEN LOCATION EVIDENCE</div>
          </div>
        </div>
      </section>

      <main style={{ maxWidth: 1380, margin: "0 auto", padding: "0 clamp(20px,5vw,72px)" }}>
        <section style={chapter}>
          <div style={chapterNo}>01 / PLACE</div>
          <div>
            <StateTag>CURATED SOURCE</StateTag>
            <h2 style={{ ...title, fontSize: "clamp(40px,6vw,84px)", margin: "20px 0 0" }}>The fjord has a source-backed identity. Its display geometry is a different question.</h2>
            <p style={body}>4PLANET can identify Oslofjorden using Marine Regions MRGID 3379: a persistent marine gazetteer identity for Oslofjorden as a fjord. That record provides a representative coordinate, but it does not justify one universal ecological, legal or management polygon. Phase 04 therefore stores the semantic identity while keeping display geometry unresolved.</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(190px,1fr))", borderTop: "1px solid rgba(10,10,10,.24)", borderLeft: "1px solid rgba(10,10,10,.24)", margin: "26px 0 18px" }}>
              {[
                ["IDENTITY", `${place.sourceId} · ${place.plainType}`],
                ["SOURCE", place.source],
                ["POINT", `${place.representativePoint.lat.toFixed(4)}, ${place.representativePoint.lng.toFixed(4)}`],
                ["PRECISION", `≈ ${Math.round(place.representativePoint.precisionMetres / 1000)} km source precision`],
              ].map(([k, v]) => <div key={k} style={{ borderRight: "1px solid rgba(10,10,10,.24)", borderBottom: "1px solid rgba(10,10,10,.24)", padding: 14 }}><div style={{ ...label, color: "rgba(10,10,10,.52)" }}>{k}</div><div style={{ fontSize: 13.5, lineHeight: 1.4, marginTop: 7 }}>{v}</div></div>)}
            </div>
            <ProvenanceBar value={{ state: "SOURCE", actor: "Marine Regions / VLIZ", source: place.sourceUrl, time: `Checked ${place.checkedAt}`, limitation: place.geometryLimitation }} />
            <div style={{ display: "flex", gap: 9, flexWrap: "wrap", marginTop: 20 }}><Link to="/atlas" style={linkButton}>Open ATLAS →</Link><StateTag tone="red">DISPLAY GEOMETRY / NOT YET IMPLEMENTED</StateTag></div>
          </div>
        </section>

        <section style={chapter}>
          <div style={chapterNo}>02 / LIFE</div>
          <div>
            <StateTag tone="red">NOT YET IMPLEMENTED</StateTag>
            <h2 style={{ ...title, fontSize: "clamp(40px,6vw,84px)", margin: "20px 0 0" }}>Begin with life — but do not manufacture local records.</h2>
            <p style={body}>The integrated product already supports source-aware species records elsewhere. This place journey will only show Oslofjorden-specific observations after a real source query and geographic contract are wired. Until then, no fake pins, abundance claims or “current animal locations” appear here.</p>
            <Link to="/species" style={linkButton}>Explore source-aware SPECIES →</Link>
          </div>
        </section>

        <section style={chapter}>
          <div style={chapterNo}>03 / RELATIONSHIP</div>
          <div style={{ minWidth: 0 }}>
            <StateTag>PROTOTYPE DATA</StateTag>
            <h2 style={{ ...title, fontSize: "clamp(40px,6vw,84px)", margin: "20px 0 30px" }}>Reveal the system without overstating the edges.</h2>
            <RelationshipReveal steps={RELATIONSHIP} note="Place-journey structure. Scientific and causal edges require source review before promotion from prototype." />
          </div>
        </section>

        <section style={chapter}>
          <div style={chapterNo}>04 / PRESSURE</div>
          <div>
            <StateTag>CURATED SOURCE</StateTag>
            <h2 style={{ ...title, fontSize: "clamp(40px,6vw,84px)", margin: "20px 0 0" }}>Nitrogen is a documented pressure. It is not the whole fjord.</h2>
            <p style={body}>Norwegian government material published in April 2026 states that nitrogen emissions need substantial reduction, with agriculture and wastewater identified as the largest inputs in the referenced analysis. The interface keeps this separate from other pressures rather than collapsing the fjord into one causal explanation.</p>
            <ProvenanceBar value={{ state: "SOURCE", actor: "Norwegian Government", source: "Ministry of Climate and Environment · 17 Apr 2026", time: "Checked Aug 2026", limitation: "Policy summary of commissioned analysis; not a complete ecological assessment of Oslofjorden." }} />
          </div>
        </section>

        <section style={chapter}>
          <div style={chapterNo}>05 / SIGNAL</div>
          <div style={{ minWidth: 0 }}><SignalCard signal={POLICY_SIGNAL} /></div>
        </section>

        <section style={chapter}>
          <div style={chapterNo}>06 / ACTORS + SOLUTIONS</div>
          <div>
            <StateTag tone="red">NOT YET IMPLEMENTED</StateTag>
            <h2 style={{ ...title, fontSize: "clamp(40px,6vw,84px)", margin: "20px 0 0" }}>Map actors without turning them into partners.</h2>
            <p style={body}>The next data contract must distinguish public authority, research actor, field implementer, funder, company and 4PLANET partner status. Mere appearance in the graph cannot imply endorsement, partnership or proven effectiveness.</p>
          </div>
        </section>

        <section style={chapter}>
          <div style={chapterNo}>07 / FOLLOW</div>
          <div>
            <StateTag>EXPERIMENT</StateTag>
            <h2 style={{ ...title, fontSize: "clamp(40px,6vw,84px)", margin: "20px 0 0" }}>Return when something meaningful changes.</h2>
            <p style={body}>This button is a local session interaction only. The semantic identity is source-backed, but it is not yet wired into the shared canonical Follow store or a production notification service.</p>
            <button type="button" onClick={() => setFollowed((v) => !v)} style={{ ...linkButton, cursor: "pointer" }}>{followed ? "FOLLOWING IN THIS SESSION" : "FOLLOW OSLOFJORDEN — PROTOTYPE"}</button>
          </div>
        </section>

        <section style={chapter}>
          <div style={chapterNo}>08 / ACTION</div>
          <div>
            <StateTag tone="red">NOT YET IMPLEMENTED</StateTag>
            <h2 style={{ ...title, fontSize: "clamp(40px,6vw,84px)", margin: "20px 0 0" }}>No action button until a credible pathway exists.</h2>
            <p style={body}>Explore the sources and existing IMPACT prototype, but do not imply that 4PLANET currently offers an Oslofjorden delivery pathway.</p>
            <Link to="/impact" style={linkButton}>Explore IMPACT architecture →</Link>
          </div>
        </section>

        <section style={chapter}>
          <div style={chapterNo}>09 / PROOF</div>
          <div>
            <StateTag>FOUNDER-APPROVED GRAMMAR</StateTag>
            <h2 style={{ ...title, fontSize: "clamp(40px,6vw,84px)", margin: "20px 0" }}>Activity, report, assessment and verified outcome are different states.</h2>
            <ProvenanceBar value={{ state: "PARTNER REPORT", actor: "EXAMPLE ACTOR", source: "DEMO FIXTURE", time: "EXAMPLE", limitation: "Interface fixture only. No partner, delivery or outcome is being claimed." }} />
            <div style={{ marginTop: 18 }}><ProofExplanation value={{ state: "PARTNER REPORT", actor: "EXAMPLE ACTOR", source: "DEMO FIXTURE", limitation: "A report from a delivery actor must remain visibly different from assessed or independently verified outcome evidence." }} /></div>
          </div>
        </section>
      </main>
      <style>{`@media(max-width:720px){#main-content>main>section{grid-template-columns:1fr!important}}`}</style>
    </PublicShell>
  );
}

const chapter: CSSProperties = { display: "grid", gridTemplateColumns: "120px minmax(0,1fr)", gap: "clamp(20px,4vw,56px)", padding: "clamp(70px,9vw,130px) 0", borderBottom: "1px solid rgba(10,10,10,.22)" };
const chapterNo: CSSProperties = { ...label, color: "rgba(10,10,10,.52)", paddingTop: 7 };
const body: CSSProperties = { maxWidth: 820, fontSize: "clamp(16px,1.5vw,20px)", lineHeight: 1.6, margin: "24px 0" };
const linkButton: CSSProperties = { display: "inline-flex", padding: "11px 14px", border: "1px solid #0A0A0A", background: "#0A0A0A", color: "#fff", textDecoration: "none", fontSize: 13 };
