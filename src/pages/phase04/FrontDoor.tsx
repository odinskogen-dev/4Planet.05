import { Link } from "react-router-dom";
import { PublicShell } from "@/components/layout/PublicShell";
import { img } from "@/content/imageRegistry";
import { RelationshipReveal } from "@/components/phase04/RelationshipReveal";
import { ProvenanceBar } from "@/components/phase04/ProvenanceBar";
import { SignalCard } from "@/components/phase04/SignalCard";
import {
  OSLOFJORD_LIFE,
  OSLOFJORD_RELATIONSHIP,
  OSLOFJORD_SIGNALS,
  oslofjordSourceById,
} from "@/data/oslofjordenProof";
import type { RelationshipStep, SignalPresentation } from "@/phase04/model";

const relationship: RelationshipStep[] = OSLOFJORD_RELATIONSHIP.map((step) => ({
  id: step.id,
  label: step.label,
  kind: step.kind,
  status: step.grade === "DOCUMENTED" ? "DOCUMENTED" : step.grade === "4PLANET_CONTEXT" ? "4PLANET CONTEXT" : "UNKNOWN",
}));

const planSignal = OSLOFJORD_SIGNALS.find((signal) => signal.id === "signal-plan-hearing-2026")!;
const planSource = oslofjordSourceById(planSignal.sourceIds[0]);
const policySignal: SignalPresentation = {
  what: planSignal.headline,
  where: "Oslofjorden · Norway",
  when: "19 JUN 2026",
  source: `${planSource.publisher} · ${planSource.label}`,
  confidence: planSignal.confidence,
  whyItMatters: planSignal.whyItMatters,
  relationship: "Public decision → measures → implementation → monitoring → ecological response",
  followNext: planSignal.followNext,
  dataState: "CURATED SOURCE",
};

const jobs = [
  ["SEE", "ATLAS", "Explore planetary data, places and source records.", "/atlas"],
  ["DISCOVER", "SPECIES", "Begin with life: identity, records, place and evidence.", "/species"],
  ["UNDERSTAND", "LIVING SYSTEMS", "Reveal relationships, dependencies and pressures without hiding evidence status.", "/living-systems"],
  ["ACT + PROVE", "IMPACT", "Move from credible action pathways to explicit delivery and proof states.", "/impact"],
] as const;

export default function Phase04FrontDoor() {
  const earth = img("heroEarth");
  const sprat = OSLOFJORD_LIFE.find((record) => record.id === "life-sprat-2025")!;
  const herring = OSLOFJORD_LIFE.find((record) => record.id === "life-herring-2025")!;
  const anchovy = OSLOFJORD_LIFE.find((record) => record.id === "life-anchovy-2025")!;
  return (
    <PublicShell>
      <section style={{ minHeight: "calc(100svh - 64px)", display: "grid", gridTemplateColumns: "minmax(0,1.02fr) minmax(360px,.98fr)", borderBottom: "1px solid rgba(10,10,10,.22)" }}>
        <div style={{ padding: "clamp(42px,7vw,96px) clamp(20px,5vw,72px)", display: "flex", flexDirection: "column", justifyContent: "space-between", gap: 40 }}>
          <div>
            <div className="mono" style={{ fontSize: 10.5, letterSpacing: ".12em", color: "#2E2EFF" }}>4PLANET_ / SELECTED PLACE / SOURCE-GROUNDED CANDIDATE</div>
            <h1 style={{ margin: "clamp(40px,8vw,100px) 0 0", fontFamily: "'Instrument Sans','DM Sans',sans-serif", fontWeight: 500, fontSize: "clamp(62px,9vw,142px)", letterSpacing: "-.06em", lineHeight: .86 }}>What is<br />happening<br />here?</h1>
          </div>
          <div style={{ maxWidth: 760 }}>
            <div className="mono" style={{ fontSize: 11, letterSpacing: ".1em", color: "rgba(10,10,10,.55)" }}>OSLOFJORDEN / NORWAY</div>
            <p style={{ margin: "12px 0 0", fontSize: "clamp(20px,2.2vw,30px)", lineHeight: 1.2, letterSpacing: "-.025em" }}>
              A living place seen through real surveys, relationships, pressures, public decisions and the evidence needed to understand what changes next.
            </p>
            <div style={{ display: "flex", gap: 9, flexWrap: "wrap", marginTop: 24 }}>
              <Link to="/place/oslofjorden" style={primaryButton}>Enter Oslofjorden →</Link>
              <Link to="/atlas" style={secondaryButton}>Explore the planet</Link>
            </div>
          </div>
        </div>
        <div style={{ position: "relative", minHeight: 580, background: "#080808", overflow: "hidden" }}>
          <picture>
            {earth.srcMobile && <source media="(max-width:760px)" srcSet={earth.srcMobile} />}
            <img src={earth.src} alt={earth.alt} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
          </picture>
          <div aria-hidden style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg,rgba(0,0,0,.05),rgba(0,0,0,.28))" }} />
          <div style={{ position: "absolute", left: 20, right: 20, bottom: 18, color: "#fff", display: "flex", justifyContent: "space-between", gap: 20, flexWrap: "wrap" }}>
            <span className="mono" style={{ fontSize: 9.5, letterSpacing: ".08em" }}>PLANETARY CONTEXT / NASA PUBLIC-DOMAIN FRAME</span>
            <span className="mono" style={{ fontSize: 9.5, letterSpacing: ".08em" }}>NOT OSLOFJORDEN LOCATION EVIDENCE · REAL HERO ASSET STILL REQUIRED</span>
          </div>
        </div>
      </section>

      <section style={{ padding: "0 clamp(20px,5vw,72px)", maxWidth: 1440, margin: "0 auto" }}>
        <div className="front-life-strip" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", borderLeft: "1px solid #0A0A0A" }}>
          {[
            [sprat, "261 million", "2,971 t"],
            [herring, "75 million", "2,718 t"],
            [anchovy, "50 million", "196 t"],
          ].map(([record, count, biomass]) => {
            const life = record as typeof sprat;
            return <div key={life.id} style={{ padding: "22px 20px", borderRight: "1px solid #0A0A0A", borderBottom: "1px solid #0A0A0A" }}><div className="mono" style={{ fontSize: 9.5, letterSpacing: ".08em", color: "#2E2EFF" }}>HI SURVEY / DEC 2025 / ESTIMATE</div><div style={{ fontFamily: "'Instrument Sans',sans-serif", fontSize: 27, letterSpacing: "-.035em", marginTop: 11 }}>{life.commonName}</div><div style={{ display: "flex", gap: 18, marginTop: 18, flexWrap: "wrap" }}><span><strong>{count as string}</strong><small style={{ display: "block", marginTop: 3 }}>estimated individuals</small></span><span><strong>{biomass as string}</strong><small style={{ display: "block", marginTop: 3 }}>estimated biomass</small></span></div><div style={{ fontSize: 11.5, lineHeight: 1.45, color: "rgba(10,10,10,.58)", marginTop: 15 }}>Survey estimate with uncertainty. Not a live count or current position.</div></div>;
          })}
        </div>
      </section>

      <section style={{ padding: "clamp(70px,9vw,124px) clamp(20px,5vw,72px)", maxWidth: 1440, margin: "0 auto" }}>
        <div className="mono" style={{ fontSize: 10.5, letterSpacing: ".12em", color: "#2E2EFF" }}>ONE INTERFACE / FOUR PUBLIC JOBS</div>
        <h2 style={{ margin: "20px 0 44px", fontFamily: "'Instrument Sans','DM Sans',sans-serif", fontWeight: 500, fontSize: "clamp(42px,6vw,86px)", letterSpacing: "-.055em", lineHeight: .94, maxWidth: 1080 }}>See the planet. Begin with life. Understand relationships. Act with proof.</h2>
        <div className="phase04-job-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", borderTop: "1px solid #0A0A0A", borderLeft: "1px solid #0A0A0A" }}>
          {jobs.map(([verb, name, desc, to], i) => (
            <Link key={name} to={to} style={{ minHeight: 260, padding: 24, borderRight: "1px solid #0A0A0A", borderBottom: "1px solid #0A0A0A", color: "#0A0A0A", textDecoration: "none", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <span className="mono" style={{ fontSize: 10, letterSpacing: ".09em" }}>0{i + 1} / {verb}</span>
              <div>
                <div style={{ fontFamily: "'Instrument Sans',sans-serif", fontWeight: 500, fontSize: 30, letterSpacing: "-.04em" }}>{name}</div>
                <p style={{ fontSize: 14.5, lineHeight: 1.5, margin: "10px 0 0", color: "rgba(10,10,10,.68)" }}>{desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section style={{ padding: "clamp(60px,8vw,110px) clamp(20px,5vw,72px)", maxWidth: 1440, margin: "0 auto" }}>
        <RelationshipReveal steps={relationship} note="Oslofjorden eelgrass chain. Documented source-backed steps remain separate from 4PLANET context." />
      </section>

      <section style={{ padding: "clamp(60px,8vw,110px) clamp(20px,5vw,72px)", maxWidth: 1440, margin: "0 auto" }}>
        <div className="mono" style={{ fontSize: 10.5, letterSpacing: ".12em", color: "#2E2EFF", marginBottom: 18 }}>4PLANET SIGNAL_</div>
        <SignalCard signal={policySignal} />
        <div style={{ marginTop: 16 }}>
          <ProvenanceBar value={{
            state: "SOURCE",
            actor: planSource.publisher,
            source: planSource.url,
            time: "Published 19 Jun 2026 · consultation closes 15 Sep 2026",
            limitation: "This is a live public decision process, not a final adopted plan and not evidence of ecological outcome.",
          }} />
        </div>
      </section>

      <section style={{ background: "#0A0A0A", color: "#fff", padding: "clamp(80px,10vw,150px) clamp(20px,5vw,72px)" }}>
        <div style={{ maxWidth: 1320, margin: "0 auto", display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(300px,.8fr)", gap: "clamp(34px,6vw,90px)" }}>
          <div>
            <div className="mono" style={{ fontSize: 10.5, letterSpacing: ".12em", color: "#3AE86F" }}>DEEP WORLDS / SHARED TRUTH</div>
            <h2 style={{ margin: "20px 0 0", fontFamily: "'Instrument Sans',sans-serif", fontWeight: 500, fontSize: "clamp(46px,7vw,96px)", letterSpacing: "-.06em", lineHeight: .92 }}>Go deeper without leaving 4PLANET.</h2>
          </div>
          <div style={{ alignSelf: "end" }}>
            {[['AM4ZONIA_','Amazon Rainforest Mission','/missions/am4zonia'],['WH4LES_','Whale Protection Mission','/missions/wh4les'],['CLIM4TE_','Climate Mission','/missions/clim4te']].map(([name, desc, to]) => (
              <Link key={name} to={to} style={{ display: "block", borderTop: "1px solid rgba(255,255,255,.28)", padding: "17px 0", color: "#fff", textDecoration: "none" }}>
                <span style={{ fontFamily: "'Instrument Sans',sans-serif", fontSize: 25, letterSpacing: "-.035em" }}>{name}</span>
                <span style={{ display: "block", fontSize: 12.5, color: "rgba(255,255,255,.66)", marginTop: 4 }}>{desc} · A 4PLANET mission.</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <style>{`@media(max-width:900px){.phase04-job-grid{grid-template-columns:1fr 1fr!important}}@media(max-width:760px){#main-content>section:first-child{grid-template-columns:1fr!important}.phase04-job-grid,.front-life-strip{grid-template-columns:1fr!important}}`}</style>
    </PublicShell>
  );
}

const primaryButton: React.CSSProperties = { display: "inline-flex", padding: "12px 16px", border: "1px solid #0A0A0A", background: "#0A0A0A", color: "#fff", textDecoration: "none", fontSize: 13 };
const secondaryButton: React.CSSProperties = { ...primaryButton, background: "#fff", color: "#0A0A0A" };
