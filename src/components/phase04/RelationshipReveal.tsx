import { useMemo, useState } from "react";
import type { CSSProperties } from "react";
import type { RelationshipStep } from "@/phase04/model";

export type RelationshipMode = "THREAD" | "ORBIT" | "CONSTELLATION";

const mono: CSSProperties = {
  fontFamily: "'Fragment Mono', ui-monospace, monospace",
  fontSize: 10,
  letterSpacing: ".08em",
  textTransform: "uppercase",
};

export function RelationshipReveal({
  steps,
  initialMode = "THREAD",
  title = "Relationship Reveal",
  note = "Relationship structure shown as prototype context unless a source status says otherwise.",
}: {
  steps: RelationshipStep[];
  initialMode?: RelationshipMode;
  title?: string;
  note?: string;
}) {
  const [mode, setMode] = useState<RelationshipMode>(initialMode);
  const [visible, setVisible] = useState(1);
  const display = useMemo(() => steps.slice(0, Math.max(1, visible)), [steps, visible]);

  return (
    <section aria-label={title} style={{ borderTop: "1px solid rgba(10,10,10,.28)", borderBottom: "1px solid rgba(10,10,10,.28)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 18, alignItems: "center", flexWrap: "wrap", padding: "14px 0" }}>
        <div>
          <div style={{ ...mono, color: "#2E2EFF" }}>{title}</div>
          <div style={{ fontSize: 12.5, color: "rgba(10,10,10,.62)", marginTop: 4 }}>{note}</div>
        </div>
        <div role="group" aria-label="Relationship view" style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {(["THREAD", "ORBIT", "CONSTELLATION"] as RelationshipMode[]).map((m) => (
            <button key={m} type="button" onClick={() => setMode(m)} aria-pressed={mode === m}
              style={{ ...mono, border: "1px solid #0A0A0A", background: mode === m ? "#0A0A0A" : "#fff", color: mode === m ? "#fff" : "#0A0A0A", padding: "8px 10px", cursor: "pointer" }}>
              {m}
            </button>
          ))}
        </div>
      </div>

      {mode === "THREAD" && (
        <div style={{ padding: "18px 0 24px" }}>
          {steps.map((step, i) => {
            const on = i < visible;
            return (
              <div key={step.id} style={{ display: "grid", gridTemplateColumns: "48px minmax(0,1fr) minmax(110px,190px)", gap: 14, padding: "16px 0", borderBottom: "1px solid rgba(10,10,10,.14)", opacity: on ? 1 : .2, transition: "opacity .25s ease" }}>
                <span style={mono}>{String(i + 1).padStart(2, "0")}</span>
                <span style={{ fontFamily: "'Instrument Sans','DM Sans',sans-serif", fontSize: "clamp(22px,3vw,34px)", letterSpacing: "-.035em" }}>{step.label}</span>
                <span style={{ ...mono, textAlign: "right", color: step.status === "SOURCE REVIEW PENDING" ? "#FF4D22" : "rgba(10,10,10,.58)" }}>{step.kind}{step.status ? ` · ${step.status}` : ""}</span>
              </div>
            );
          })}
          <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
            <button type="button" onClick={() => setVisible((v) => Math.min(steps.length, v + 1))} disabled={visible >= steps.length}
              style={{ border: "1px solid #0A0A0A", background: "#0A0A0A", color: "#fff", padding: "10px 14px", cursor: visible >= steps.length ? "default" : "pointer", opacity: visible >= steps.length ? .4 : 1 }}>Reveal next →</button>
            <button type="button" onClick={() => setVisible(1)} style={{ border: "1px solid #0A0A0A", background: "#fff", color: "#0A0A0A", padding: "10px 14px", cursor: "pointer" }}>Reset</button>
          </div>
        </div>
      )}

      {mode === "ORBIT" && (
        <div style={{ position: "relative", minHeight: 460, background: "#0A0A0A", color: "#fff", overflow: "hidden" }}>
          <div aria-hidden style={{ position: "absolute", width: 310, height: 310, border: "1px solid rgba(255,255,255,.26)", borderRadius: "50%", left: "50%", top: "50%", transform: "translate(-50%,-50%)" }} />
          <div aria-hidden style={{ position: "absolute", width: 430, height: 430, border: "1px solid rgba(255,255,255,.14)", borderRadius: "50%", left: "50%", top: "50%", transform: "translate(-50%,-50%)" }} />
          <div style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%,-50%)", width: 150, height: 150, borderRadius: "50%", background: "#fff", color: "#0A0A0A", display: "grid", placeItems: "center", textAlign: "center", padding: 16, fontFamily: "'Instrument Sans',sans-serif", fontSize: 20 }}>{steps[0]?.label}</div>
          {steps.slice(1, 6).map((s, i) => {
            const pos = [[12,20],[73,18],[8,70],[72,72],[43,8]][i] ?? [42,75];
            return <div key={s.id} style={{ position: "absolute", left: `${pos[0]}%`, top: `${pos[1]}%`, ...mono, border: `1px solid ${s.status === "SOURCE REVIEW PENDING" ? "#FF4D22" : "rgba(255,255,255,.78)"}`, padding: "8px 10px", maxWidth: 180 }}>{s.label}</div>;
          })}
        </div>
      )}

      {mode === "CONSTELLATION" && (
        <div style={{ minHeight: 420, background: "#f4f4f0", padding: "clamp(24px,5vw,64px)" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(170px,1fr))", gap: 18 }}>
            {steps.map((s, i) => (
              <div key={s.id} style={{ borderTop: `2px solid ${s.status === "SOURCE REVIEW PENDING" ? "#FF4D22" : "#0A0A0A"}`, paddingTop: 13, minHeight: 120 }}>
                <span style={{ ...mono, color: "rgba(10,10,10,.56)" }}>{String(i + 1).padStart(2, "0")} / {s.kind}</span>
                <div style={{ fontFamily: "'Instrument Sans',sans-serif", fontSize: 22, letterSpacing: "-.03em", marginTop: 10 }}>{s.label}</div>
                {i < steps.length - 1 && <div aria-hidden style={{ marginTop: 18, fontSize: 20 }}>→</div>}
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
