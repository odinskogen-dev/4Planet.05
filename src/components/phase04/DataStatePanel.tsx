import type { CSSProperties, ReactNode } from "react";
import type { PublicDataState } from "@/phase04/model";

export type RuntimeState = "LOADING" | "NO RECORDS" | "SOURCE UNAVAILABLE" | PublicDataState;

const mono: CSSProperties = {
  fontFamily: "'Fragment Mono',ui-monospace,monospace",
  fontSize: 10,
  letterSpacing: ".09em",
  textTransform: "uppercase",
};

const tone: Record<RuntimeState, string> = {
  "LIVE DATA": "#3AE86F",
  "CACHED DATA": "#2E2EFF",
  "CURATED SOURCE": "#2E2EFF",
  "PROTOTYPE DATA": "#FF4D22",
  "DEMO FIXTURE": "#FF4D22",
  "NOT YET IMPLEMENTED": "#FF4D22",
  LOADING: "#2E2EFF",
  "NO RECORDS": "#0A0A0A",
  "SOURCE UNAVAILABLE": "#FF4D22",
};

export function DataStatePanel({
  state,
  title,
  detail,
  action,
}: {
  state: RuntimeState;
  title: string;
  detail: string;
  action?: ReactNode;
}) {
  const accent = tone[state];
  return (
    <section role={state === "SOURCE UNAVAILABLE" ? "alert" : undefined} aria-live={state === "LOADING" ? "polite" : undefined}
      style={{ borderTop: `3px solid ${accent}`, borderBottom: "1px solid rgba(10,10,10,.22)", padding: "18px 0 20px" }}>
      <div style={{ ...mono, color: accent }}>{state}</div>
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(220px,.55fr)", gap: "clamp(18px,4vw,54px)", marginTop: 11 }}>
        <h3 style={{ margin: 0, fontFamily: "'Instrument Sans','DM Sans',sans-serif", fontWeight: 500, fontSize: "clamp(24px,3vw,39px)", letterSpacing: "-.04em", lineHeight: 1.02 }}>{title}</h3>
        <div><p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.5, color: "rgba(10,10,10,.67)" }}>{detail}</p>{action && <div style={{ marginTop: 13 }}>{action}</div>}</div>
      </div>
      {state === "LOADING" && <div aria-hidden className="phase04-loading-line" style={{ height: 2, width: "100%", marginTop: 18, background: "linear-gradient(90deg,#2E2EFF 0 24%,rgba(46,46,255,.14) 24% 100%)", transformOrigin: "left" }} />}
      <style>{`@media(max-width:700px){section>div[style*="grid-template-columns"]{grid-template-columns:1fr!important}}@media(prefers-reduced-motion:no-preference){.phase04-loading-line{animation:phase04scan 1.6s ease-in-out infinite alternate}@keyframes phase04scan{from{transform:scaleX(.25)}to{transform:scaleX(1)}}}`}</style>
    </section>
  );
}
