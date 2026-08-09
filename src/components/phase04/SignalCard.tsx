import type { CSSProperties } from "react";
import type { SignalPresentation } from "@/phase04/model";

const mono: CSSProperties = {
  fontFamily: "'Fragment Mono', ui-monospace, monospace",
  fontSize: 10,
  letterSpacing: ".08em",
  textTransform: "uppercase",
};

export function SignalCard({ signal, accent = "#2E2EFF" }: { signal: SignalPresentation; accent?: string }) {
  return (
    <article style={{ borderTop: `4px solid ${accent}`, borderBottom: "1px solid rgba(10,10,10,.28)", padding: "20px 0" }}>
      <div style={{ display: "grid", gridTemplateColumns: "minmax(110px,.35fr) minmax(0,1.2fr) minmax(210px,.7fr)", gap: "clamp(18px,3vw,40px)" }}>
        <div style={mono}>
          <div>{signal.dataState}</div>
          <div style={{ marginTop: 8, color: "rgba(10,10,10,.58)" }}>{signal.when}</div>
          <div style={{ marginTop: 8, color: accent }}>CONFIDENCE / {signal.confidence}</div>
        </div>
        <div>
          <div style={{ ...mono, color: "rgba(10,10,10,.58)" }}>{signal.where}</div>
          <h3 style={{ margin: "9px 0 0", fontFamily: "'Instrument Sans','DM Sans',sans-serif", fontWeight: 500, fontSize: "clamp(26px,3vw,42px)", letterSpacing: "-.04em", lineHeight: 1.02 }}>{signal.what}</h3>
          <p style={{ margin: "14px 0 0", fontSize: 15, lineHeight: 1.5 }}>{signal.whyItMatters}</p>
        </div>
        <div style={{ fontSize: 13, lineHeight: 1.5 }}>
          <div style={mono}>SOURCE</div><div style={{ marginTop: 5 }}>{signal.source}</div>
          <div style={{ ...mono, marginTop: 16 }}>RELATIONSHIP</div><div style={{ marginTop: 5 }}>{signal.relationship}</div>
          <div style={{ ...mono, marginTop: 16 }}>FOLLOW NEXT</div><div style={{ marginTop: 5 }}>{signal.followNext}</div>
        </div>
      </div>
      <style>{`@media(max-width:760px){article>div{grid-template-columns:1fr!important}}`}</style>
    </article>
  );
}
