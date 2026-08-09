import { useMemo, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import { Link } from "react-router-dom";
import { PublicShell } from "@/components/layout/PublicShell";
import { img } from "@/content/imageRegistry";
import { RelationshipReveal } from "@/components/phase04/RelationshipReveal";
import { ProvenanceBar } from "@/components/phase04/ProvenanceBar";
import { DataStatePanel } from "@/components/phase04/DataStatePanel";
import {
  ActionPathwayCard,
  ActorSolutionGrid,
  LifeEvidenceGrid,
  PressureEvidenceGrid,
  SignalTimeline,
} from "@/components/place/PlaceEvidence";
import {
  OSLOFJORD_ACTIONS,
  OSLOFJORD_ACTORS,
  OSLOFJORD_LIFE,
  OSLOFJORD_PLACE,
  OSLOFJORD_PRESSURES,
  OSLOFJORD_RELATIONSHIP,
  OSLOFJORD_SIGNALS,
  OSLOFJORD_SOLUTIONS,
  oslofjordSourceById,
} from "@/data/oslofjordenProof";
import type { RelationshipStep } from "@/phase04/model";

const label: CSSProperties = {
  fontFamily: "'Fragment Mono',ui-monospace,monospace",
  fontSize: 10.5,
  letterSpacing: ".1em",
  textTransform: "uppercase",
};

const title: CSSProperties = {
  fontFamily: "'Instrument Sans','DM Sans',sans-serif",
  fontWeight: 500,
  letterSpacing: "-.05em",
  lineHeight: .94,
};

function StateTag({ children, tone = "blue" }: { children: ReactNode; tone?: "blue" | "red" | "green" | "dark" }) {
  const color = tone === "red" ? "#FF4D22" : tone === "green" ? "#0B7A39" : tone === "dark" ? "#0A0A0A" : "#2E2EFF";
  return <span style={{ ...label, color, border: `1px solid ${color}`, padding: "7px 9px", display: "inline-flex" }}>{children}</span>;
}

function SourceRegister() {
  const sources = useMemo(() => {
    const ids = new Set<string>();
    OSLOFJORD_LIFE.forEach((record) => record.sourceIds.forEach((id) => ids.add(id)));
    OSLOFJORD_PRESSURES.forEach((record) => record.sourceIds.forEach((id) => ids.add(id)));
    OSLOFJORD_SIGNALS.forEach((record) => record.sourceIds.forEach((id) => ids.add(id)));
    OSLOFJORD_ACTORS.forEach((record) => record.sourceIds.forEach((id) => ids.add(id)));
    OSLOFJORD_SOLUTIONS.forEach((record) => record.sourceIds.forEach((id) => ids.add(id)));
    OSLOFJORD_ACTIONS.forEach((record) => record.sourceIds.forEach((id) => ids.add(id)));
    return [...ids].map(oslofjordSourceById);
  }, []);
  return (
    <div style={{ borderTop: "1px solid rgba(10,10,10,.24)" }}>
      {sources.map((source, i) => (
        <a key={source.id} href={source.url} target="_blank" rel="noreferrer" style={{ display: "grid", gridTemplateColumns: "54px minmax(0,1fr) minmax(210px,.45fr)", gap: 18, padding: "14px 0", borderBottom: "1px solid rgba(10,10,10,.15)", color: "#0A0A0A", textDecoration: "none" }}>
          <span style={label}>{String(i + 1).padStart(2, "0")}</span>
          <span><span style={{ display: "block", fontWeight: 600 }}>{source.label}</span><span style={{ display: "block", fontSize: 12.5, marginTop: 4, color: "rgba(10,10,10,.6)" }}>{source.scope}</span></span>
          <span style={{ ...label, textAlign: "right", color: "#2E2EFF" }}>{source.publisher} ↗</span>
        </a>
      ))}
      <style>{`@media(max-width:720px){a[style*="grid-template-columns: 54px"]{grid-template-columns:40px 1fr!important}a[style*="grid-template-columns: 54px"]>span:last-child{grid-column:2;text-align:left!important}}`}</style>
    </div>
  );
}

export default function OslofjordenJourney() {
  const [followed, setFollowed] = useState(false);
  const contextImage = img("heroEarth");
  const place = OSLOFJORD_PLACE;
  const relationship: RelationshipStep[] = OSLOFJORD_RELATIONSHIP.map((step) => ({
    id: step.id,
    label: step.label,
    kind: step.kind,
    status: step.grade === "DOCUMENTED" ? "DOCUMENTED" : step.grade === "4PLANET_CONTEXT" ? "4PLANET CONTEXT" : "UNKNOWN",
  }));
  const mainAction = OSLOFJORD_ACTIONS[0];

  return (
    <PublicShell>
      <section style={{ minHeight: "88svh", position: "relative", background: "#0A0A0A", color: "#fff", overflow: "hidden" }}>
        <picture>
          {contextImage.srcMobile && <source media="(max-width:760px)" srcSet={contextImage.srcMobile} />}
          <img src={contextImage.src} alt={contextImage.alt} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: contextImage.objectPosition }} />
        </picture>
        <div aria-hidden style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg,rgba(0,0,0,.15),rgba(0,0,0,.9))" }} />
        <div style={{ position: "relative", minHeight: "88svh", padding: "clamp(90px,12vw,170px) clamp(20px,5vw,72px) clamp(36px,6vw,72px)", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 14, flexWrap: "wrap" }}>
            <div style={{ ...label, color: "#fff" }}>PLACE JOURNEY 01 / OSLOFJORDEN / SOURCE-GROUNDED CANDIDATE</div>
            <div style={{ ...label, color: "#3AE86F" }}>11 CONTROLLED SOURCES / HUMAN VALIDATION NOT RUN</div>
          </div>
          <div>
            <h1 style={{ ...title, fontSize: "clamp(68px,12vw,178px)", margin: 0 }}>OSLO<br />FJORDEN.</h1>
            <p style={{ maxWidth: 820, fontSize: "clamp(20px,2.4vw,31px)", lineHeight: 1.18, letterSpacing: "-.025em", margin: "24px 0 0" }}>A real place, viewed through real surveys, pressures, decisions and the evidence needed to understand what changes next.</p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 24 }}>
              <span style={{ ...label, color: "rgba(255,255,255,.78)" }}>PLANETARY CONTEXT / NASA PUBLIC-DOMAIN FRAME / NOT OSLOFJORDEN LOCATION EVIDENCE</span>
              <span style={{ ...label, color: "#FF8C6A" }}>REAL OSLOFJORDEN HERO ASSET STILL REQUIRED</span>
            </div>
          </div>
        </div>
      </section>

      <main style={{ maxWidth: 1380, margin: "0 auto", padding: "0 clamp(20px,5vw,72px)" }}>
        <section style={chapter}>
          <div style={chapterNo}>01 / PLACE</div>
          <div>
            <StateTag>CURATED SOURCE</StateTag>
            <h2 style={{ ...title, fontSize: "clamp(40px,6vw,84px)", margin: "20px 0 0" }}>One identity. Different geometries for different questions.</h2>
            <p style={body}>Oslofjorden is anchored to Marine Regions MRGID 3379. That gives us a persistent fjord identity and representative point, but not one universal ecological, legal or map polygon. The product now stores each spatial use separately rather than pretending one boundary answers every question.</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(190px,1fr))", borderTop: "1px solid rgba(10,10,10,.24)", borderLeft: "1px solid rgba(10,10,10,.24)", margin: "26px 0 18px" }}>
              {[
                ["IDENTITY", `${place.sourceRecordId} · ${place.kind}`],
                ["SOURCE", place.source.publisher],
                ["POINT", `${place.representativePoint?.lat.toFixed(4)}, ${place.representativePoint?.lng.toFixed(4)}`],
                ["QUERY AREA", "NOT SELECTED"],
                ["DISPLAY AREA", "NOT SELECTED"],
                ["FISHING AREA", "SOURCE EXISTS / NOT INGESTED"],
              ].map(([k, v]) => <div key={k} style={{ borderRight: "1px solid rgba(10,10,10,.24)", borderBottom: "1px solid rgba(10,10,10,.24)", padding: 14 }}><div style={{ ...label, color: "rgba(10,10,10,.52)" }}>{k}</div><div style={{ fontSize: 13.5, lineHeight: 1.4, marginTop: 7 }}>{v}</div></div>)}
            </div>
            <ProvenanceBar value={{ state: "SOURCE", actor: place.source.publisher, source: place.source.url, time: `Checked ${place.source.checkedAt}`, limitation: place.identityLimitation }} />
            <div style={{ marginTop: 18 }}><DataStatePanel state="NOT YET IMPLEMENTED" title="A defensible biodiversity query area has not been selected." detail="GBIF/OBIS place queries stay disabled until we can say exactly what area was queried. A query result must not be confused with semantic membership in the fjord." action={<Link to="/atlas" style={linkButton}>Explore existing ATLAS sources →</Link>} /></div>
          </div>
        </section>

        <section style={chapter}>
          <div style={chapterNo}>02 / LIFE</div>
          <div style={{ minWidth: 0 }}>
            <StateTag tone="green">REAL SURVEY EVIDENCE</StateTag>
            <h2 style={{ ...title, fontSize: "clamp(40px,6vw,84px)", margin: "20px 0 14px" }}>Life is no longer a placeholder.</h2>
            <p style={body}>We begin with bounded evidence: a 2025 pelagic-fish survey, a limited multi-year research-trawl series and habitat-forming eelgrass. These records show what was measured or reported — not live animal positions, complete populations or the condition of the entire fjord.</p>
            <LifeEvidenceGrid records={OSLOFJORD_LIFE} sourceById={oslofjordSourceById} />
          </div>
        </section>

        <section style={chapter}>
          <div style={chapterNo}>03 / RELATIONSHIP</div>
          <div style={{ minWidth: 0 }}>
            <StateTag>DOCUMENTED + 4PLANET CONTEXT</StateTag>
            <h2 style={{ ...title, fontSize: "clamp(40px,6vw,84px)", margin: "20px 0 30px" }}>Reveal one chain — and mark the weak link.</h2>
            <RelationshipReveal steps={relationship} note="Eelgrass chain. Documented steps are separated from the one human-system bridge that still needs a dedicated Oslofjord source." />
            <div style={{ marginTop: 20 }}><ProvenanceBar value={{ state: "4PLANET CONTEXT", actor: "4PLANET", method: "Plain-language relationship synthesis from restoration guidance", time: "Candidate · Aug 2026", limitation: "The ‘fish, recreation and food-system value’ bridge remains 4PLANET context, not a source-reported Oslofjord relationship. It must not be displayed as equally evidenced." }} /></div>
          </div>
        </section>

        <section style={chapter}>
          <div style={chapterNo}>04 / PRESSURE</div>
          <div style={{ minWidth: 0 }}>
            <StateTag>CURATED SOURCES + MODELLED EVIDENCE</StateTag>
            <h2 style={{ ...title, fontSize: "clamp(40px,6vw,84px)", margin: "20px 0 14px" }}>There is no single cause of “the Oslofjord problem”.</h2>
            <p style={body}>The candidate now keeps nutrient loading, wastewater/agriculture, oxygen stress, fishing pressure and habitat degradation separate. Each item carries its own geographic scope and limitation so one local measurement cannot silently become a whole-fjord diagnosis.</p>
            <PressureEvidenceGrid records={OSLOFJORD_PRESSURES} sourceById={oslofjordSourceById} />
          </div>
        </section>

        <section style={chapter}>
          <div style={chapterNo}>05 / SIGNAL</div>
          <div style={{ minWidth: 0 }}>
            <StateTag tone="green">REAL CHANGES TO FOLLOW</StateTag>
            <h2 style={{ ...title, fontSize: "clamp(40px,6vw,84px)", margin: "20px 0 14px" }}>Return when something consequential changes.</h2>
            <p style={body}>Signals are now real dated changes — a consultation, a regulation, a new fish survey and new nitrogen modelling — rather than a generic environmental-news feed.</p>
            <SignalTimeline records={OSLOFJORD_SIGNALS} sourceById={oslofjordSourceById} />
          </div>
        </section>

        <section style={chapter}>
          <div style={chapterNo}>06 / ACTORS + RESPONSES</div>
          <div style={{ minWidth: 0 }}>
            <StateTag>ACTOR ≠ PARTNER</StateTag>
            <h2 style={{ ...title, fontSize: "clamp(40px,6vw,84px)", margin: "20px 0 14px" }}>Who is doing what — without inventing partnerships or effectiveness.</h2>
            <p style={body}>Public authorities, research institutions and implementation actors are mapped from their documented roles. Responses are shown as regulation, guidance, modelling or funded programmes. Their existence does not prove that they work everywhere or that 4PLANET works with the actor.</p>
            <ActorSolutionGrid actors={OSLOFJORD_ACTORS} solutions={OSLOFJORD_SOLUTIONS} sourceById={oslofjordSourceById} />
          </div>
        </section>

        <section style={chapter}>
          <div style={chapterNo}>07 / FOLLOW</div>
          <div>
            <StateTag>PRODUCT EXPERIMENT</StateTag>
            <h2 style={{ ...title, fontSize: "clamp(40px,6vw,84px)", margin: "20px 0 0" }}>Follow the next survey, decision and measured response.</h2>
            <p style={body}>The return logic is now concrete: the consultation closes, a final plan may follow, regulations can be evaluated, later surveys can be compared and measured nitrogen/oxygen indicators can change. The button is still local-session only; no account or notification is created.</p>
            <button type="button" onClick={() => setFollowed((v) => !v)} style={{ ...linkButton, cursor: "pointer" }}>{followed ? "FOLLOWING IN THIS SESSION" : "FOLLOW OSLOFJORDEN — PROTOTYPE"}</button>
          </div>
        </section>

        <section style={chapter}>
          <div style={chapterNo}>08 / ACTION</div>
          <div style={{ minWidth: 0 }}>
            <StateTag tone="green">REAL PUBLIC PATHWAY</StateTag>
            <h2 style={{ ...title, fontSize: "clamp(40px,6vw,84px)", margin: "20px 0 28px" }}>One credible action is better than ten generic buttons.</h2>
            <ActionPathwayCard action={mainAction} sourceById={oslofjordSourceById} />
            <p style={{ ...body, marginTop: 22 }}>This is an official government consultation, not a 4PLANET campaign or delivery programme. No donation, membership, partnership or ecological result is implied.</p>
          </div>
        </section>

        <section style={chapter}>
          <div style={chapterNo}>09 / PROOF</div>
          <div>
            <StateTag>REAL EVIDENCE STATES</StateTag>
            <h2 style={{ ...title, fontSize: "clamp(40px,6vw,84px)", margin: "20px 0 24px" }}>Show what exists. Leave absent proof absent.</h2>
            <div style={{ display: "grid", gap: 14 }}>
              <ProvenanceBar value={{ state: "SOURCE", actor: "Havforskningsinstituttet", source: oslofjordSourceById("hi-sprat-survey-2025").url, time: "Survey 2–11 Dec 2025 · published 4 Mar 2026", limitation: "Survey estimates belong to the defined survey design, period and uncertainty. They are not current live counts or population trend by themselves." }} />
              <ProvenanceBar value={{ state: "4PLANET CONTEXT", actor: "4PLANET", method: "Cross-source product synthesis", time: "Aug 2026 candidate", limitation: "4PLANET connects source records into a user journey but does not promote its synthesis to external scientific assessment." }} />
            </div>
            <div style={{ marginTop: 18 }}><DataStatePanel state="NOT YET IMPLEMENTED" title="No Oslofjorden Partner Report, Assessed Outcome or Verified Outcome is claimed." detail="Those proof states stay empty until a real delivery actor, method, evidence and outcome exist. Product polish cannot fill an evidence gap." /></div>
          </div>
        </section>

        <section style={chapter}>
          <div style={chapterNo}>10 / SOURCES</div>
          <div style={{ minWidth: 0 }}>
            <StateTag>VISIBLE SOURCE REGISTER</StateTag>
            <h2 style={{ ...title, fontSize: "clamp(40px,6vw,84px)", margin: "20px 0 26px" }}>The source is part of the product.</h2>
            <SourceRegister />
          </div>
        </section>
      </main>
      <style>{`@media(max-width:720px){#main-content>main>section{grid-template-columns:1fr!important}}`}</style>
    </PublicShell>
  );
}

const chapter: CSSProperties = { display: "grid", gridTemplateColumns: "120px minmax(0,1fr)", gap: "clamp(20px,4vw,56px)", padding: "clamp(70px,9vw,130px) 0", borderBottom: "1px solid rgba(10,10,10,.22)" };
const chapterNo: CSSProperties = { ...label, color: "rgba(10,10,10,.52)", paddingTop: 7 };
const body: CSSProperties = { maxWidth: 880, fontSize: "clamp(16px,1.5vw,20px)", lineHeight: 1.6, margin: "24px 0" };
const linkButton: CSSProperties = { display: "inline-flex", padding: "11px 14px", border: "1px solid #0A0A0A", background: "#0A0A0A", color: "#fff", textDecoration: "none", fontSize: 13 };
