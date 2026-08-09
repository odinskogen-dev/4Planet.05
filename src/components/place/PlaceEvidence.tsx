import type { CSSProperties, ReactNode } from "react";

export interface PlaceEvidenceSource {
  id: string;
  label: string;
  publisher: string;
  url: string;
  checkedAt: string;
  publishedAt?: string;
  scope?: string;
}

export interface PlaceLifeRecord {
  id: string;
  commonName: string;
  scientificName?: string;
  period: string;
  scope: string;
  headline: string;
  metrics: { label: string; value: string; interval?: string }[];
  sourceIds: string[];
  limitation: string;
}

export interface PlacePressureRecord {
  id: string;
  label: string;
  headline: string;
  evidence: string;
  sourceIds: string[];
  scope: string;
  limitation: string;
  grade: string;
}

export interface PlaceSignalRecord {
  id: string;
  type: string;
  date: string;
  headline: string;
  whyItMatters: string;
  sourceIds: string[];
  confidence: string;
  followNext: string;
  limitation: string;
}

export interface PlaceActorRecord {
  id: string;
  name: string;
  role: string;
  sourceIds: string[];
  limitation: string;
}

export interface PlaceSolutionRecord {
  id: string;
  label: string;
  status: string;
  evidence: string;
  sourceIds: string[];
  limitation: string;
}

export interface PlaceActionRecord {
  id: string;
  label: string;
  actor: string;
  status: string;
  deadline?: string;
  url: string;
  whatYouCanDo: string;
  whyRelevant: string;
  proofBoundary: string;
  sourceIds: string[];
}

type SourceLookup = (id: string) => PlaceEvidenceSource;

const mono: CSSProperties = {
  fontFamily: "'Fragment Mono',ui-monospace,monospace",
  fontSize: 10,
  letterSpacing: ".08em",
  textTransform: "uppercase",
};

const display: CSSProperties = {
  fontFamily: "'Instrument Sans','DM Sans',sans-serif",
  fontWeight: 500,
  letterSpacing: "-.04em",
  lineHeight: 1,
};

function SourceLinks({ ids, sourceById, dark = false }: { ids: string[]; sourceById: SourceLookup; dark?: boolean }) {
  return (
    <div style={{ display: "flex", gap: 7, flexWrap: "wrap", marginTop: 14 }}>
      {ids.map((id) => {
        const source = sourceById(id);
        return (
          <a key={id} href={source.url} target="_blank" rel="noreferrer" style={{ ...mono, fontSize: 9, color: dark ? "#fff" : "#2E2EFF", textDecoration: "none", border: `1px solid ${dark ? "rgba(255,255,255,.42)" : "rgba(46,46,255,.35)"}`, padding: "6px 8px" }}>
            SOURCE / {source.publisher} ↗
          </a>
        );
      })}
    </div>
  );
}

function Limitation({ children, dark = false }: { children: ReactNode; dark?: boolean }) {
  return <p style={{ margin: "14px 0 0", fontSize: 12.5, lineHeight: 1.5, color: dark ? "rgba(255,255,255,.62)" : "rgba(10,10,10,.58)" }}><strong style={{ fontWeight: 600 }}>Limit:</strong> {children}</p>;
}

export function LifeEvidenceGrid({ records, sourceById }: { records: PlaceLifeRecord[]; sourceById: SourceLookup }) {
  return (
    <div className="place-life-grid" style={{ display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", borderTop: "1px solid #0A0A0A", borderLeft: "1px solid #0A0A0A" }}>
      {records.map((record, i) => (
        <article key={record.id} style={{ padding: "clamp(20px,3vw,34px)", minHeight: 350, borderRight: "1px solid #0A0A0A", borderBottom: "1px solid #0A0A0A", display: "flex", flexDirection: "column", justifyContent: "space-between", background: i === 0 ? "#F4F4F0" : "#fff" }}>
          <div>
            <div style={{ ...mono, color: "#2E2EFF" }}>CURATED SURVEY / {record.period}</div>
            <h3 style={{ ...display, fontSize: "clamp(30px,4vw,52px)", margin: "16px 0 0" }}>{record.commonName}</h3>
            {record.scientificName && <div style={{ fontStyle: "italic", fontSize: 14, marginTop: 7, color: "rgba(10,10,10,.62)" }}>{record.scientificName}</div>}
            <p style={{ fontSize: 16, lineHeight: 1.5, margin: "20px 0 0", maxWidth: 660 }}>{record.headline}</p>
            {!!record.metrics.length && <div style={{ marginTop: 22, display: "grid", gap: 10 }}>{record.metrics.map((metric) => <div key={`${record.id}-${metric.label}`} style={{ borderTop: "1px solid rgba(10,10,10,.18)", paddingTop: 9 }}><div style={mono}>{metric.label}</div><div style={{ fontSize: 20, marginTop: 4 }}>{metric.value}</div>{metric.interval && <div style={{ fontSize: 12.5, color: "rgba(10,10,10,.58)", marginTop: 3 }}>{metric.interval}</div>}</div>)}</div>}
          </div>
          <div><div style={{ ...mono, marginTop: 22, color: "rgba(10,10,10,.5)" }}>SCOPE / {record.scope}</div><SourceLinks ids={record.sourceIds} sourceById={sourceById} /><Limitation>{record.limitation}</Limitation></div>
        </article>
      ))}
      <style>{`@media(max-width:760px){.place-life-grid{grid-template-columns:1fr!important}}`}</style>
    </div>
  );
}

export function PressureEvidenceGrid({ records, sourceById }: { records: PlacePressureRecord[]; sourceById: SourceLookup }) {
  return (
    <div className="place-pressure-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: 1, background: "rgba(10,10,10,.22)" }}>
      {records.map((record) => <article key={record.id} style={{ background: "#fff", padding: 24, minHeight: 330 }}><div style={{ ...mono, color: record.grade === "MODELLED" ? "#FF4D22" : "#2E2EFF" }}>{record.grade}</div><h3 style={{ ...display, fontSize: 31, margin: "17px 0 0" }}>{record.label}</h3><p style={{ fontSize: 15, lineHeight: 1.5, margin: "18px 0 0" }}><strong>{record.headline}</strong> {record.evidence}</p><div style={{ ...mono, marginTop: 20, color: "rgba(10,10,10,.5)" }}>SCOPE / {record.scope}</div><SourceLinks ids={record.sourceIds} sourceById={sourceById} /><Limitation>{record.limitation}</Limitation></article>)}
      <style>{`@media(max-width:960px){.place-pressure-grid{grid-template-columns:1fr 1fr!important}}@media(max-width:640px){.place-pressure-grid{grid-template-columns:1fr!important}}`}</style>
    </div>
  );
}

export function SignalTimeline({ records, sourceById }: { records: PlaceSignalRecord[]; sourceById: SourceLookup }) {
  return (
    <div style={{ borderTop: "1px solid #0A0A0A" }}>
      {records.map((record, i) => <article key={record.id} className="place-signal-row" style={{ display: "grid", gridTemplateColumns: "130px minmax(0,1fr) minmax(240px,.6fr)", gap: "clamp(20px,4vw,60px)", borderBottom: "1px solid #0A0A0A", padding: "28px 0" }}><div><div style={{ ...mono, color: "#2E2EFF" }}>{record.type}</div><div style={{ ...mono, marginTop: 8 }}>{record.date}</div><div style={{ ...mono, marginTop: 8, color: "rgba(10,10,10,.5)" }}>0{i + 1}</div></div><div><h3 style={{ ...display, fontSize: "clamp(28px,4vw,50px)", margin: 0 }}>{record.headline}</h3><p style={{ fontSize: 15.5, lineHeight: 1.5, margin: "16px 0 0" }}>{record.whyItMatters}</p><SourceLinks ids={record.sourceIds} sourceById={sourceById} /></div><div><div style={mono}>FOLLOW NEXT</div><p style={{ fontSize: 13.5, lineHeight: 1.5 }}>{record.followNext}</p><div style={{ ...mono, marginTop: 15 }}>CONFIDENCE / {record.confidence}</div><Limitation>{record.limitation}</Limitation></div></article>)}
      <style>{`@media(max-width:760px){.place-signal-row{grid-template-columns:1fr!important}}`}</style>
    </div>
  );
}

export function ActorSolutionGrid({ actors, solutions, sourceById }: { actors: PlaceActorRecord[]; solutions: PlaceSolutionRecord[]; sourceById: SourceLookup }) {
  return (
    <div className="actor-solution-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "clamp(28px,5vw,70px)" }}>
      <div><div style={{ ...mono, color: "#2E2EFF", marginBottom: 16 }}>ACTORS / NOT PARTNERS</div>{actors.map((actor) => <article key={actor.id} style={{ borderTop: "1px solid rgba(10,10,10,.24)", padding: "15px 0" }}><h3 style={{ ...display, fontSize: 26, margin: 0 }}>{actor.name}</h3><p style={{ fontSize: 14, lineHeight: 1.45, margin: "7px 0 0" }}>{actor.role}</p><SourceLinks ids={actor.sourceIds} sourceById={sourceById} /><Limitation>{actor.limitation}</Limitation></article>)}</div>
      <div><div style={{ ...mono, color: "#3AE86F", marginBottom: 16 }}>RESPONSES / EFFECT NOT ASSUMED</div>{solutions.map((solution) => <article key={solution.id} style={{ borderTop: "1px solid rgba(10,10,10,.24)", padding: "15px 0" }}><div style={{ ...mono, color: solution.status === "ACTIVE" ? "#0A0A0A" : "#FF4D22" }}>{solution.status}</div><h3 style={{ ...display, fontSize: 26, margin: "8px 0 0" }}>{solution.label}</h3><p style={{ fontSize: 14, lineHeight: 1.45, margin: "8px 0 0" }}>{solution.evidence}</p><SourceLinks ids={solution.sourceIds} sourceById={sourceById} /><Limitation>{solution.limitation}</Limitation></article>)}</div>
      <style>{`@media(max-width:760px){.actor-solution-grid{grid-template-columns:1fr!important}}`}</style>
    </div>
  );
}

export function ActionPathwayCard({ action, sourceById }: { action: PlaceActionRecord; sourceById: SourceLookup }) {
  return (
    <article style={{ background: "#0A0A0A", color: "#fff", padding: "clamp(28px,5vw,62px)", borderTop: "7px solid #3AE86F" }}>
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1.1fr) minmax(260px,.65fr)", gap: "clamp(28px,6vw,90px)" }}>
        <div><div style={{ ...mono, color: "#3AE86F" }}>{action.status}{action.deadline ? ` / DEADLINE ${action.deadline}` : ""}</div><h3 style={{ ...display, fontSize: "clamp(42px,6vw,82px)", margin: "20px 0 0" }}>{action.label}</h3><p style={{ fontSize: "clamp(17px,1.7vw,22px)", lineHeight: 1.45, margin: "24px 0 0" }}>{action.whatYouCanDo}</p><a href={action.url} target="_blank" rel="noreferrer" style={{ display: "inline-flex", marginTop: 26, padding: "12px 15px", background: "#fff", color: "#0A0A0A", textDecoration: "none", fontSize: 13 }}>OPEN OFFICIAL PROCESS ↗</a></div>
        <div style={{ alignSelf: "end" }}><div style={mono}>WHY RELEVANT</div><p style={{ fontSize: 14.5, lineHeight: 1.5 }}>{action.whyRelevant}</p><div style={{ ...mono, marginTop: 20 }}>PROOF BOUNDARY</div><p style={{ fontSize: 13.5, lineHeight: 1.5, color: "rgba(255,255,255,.7)" }}>{action.proofBoundary}</p><SourceLinks ids={action.sourceIds} sourceById={sourceById} dark /></div>
      </div>
      <style>{`@media(max-width:720px){article>div[style*="grid-template-columns"]{grid-template-columns:1fr!important}}`}</style>
    </article>
  );
}
