import type { ProvenancePresentation } from "@/phase04/model";

const mono: React.CSSProperties = {
  fontFamily: "'Fragment Mono', ui-monospace, monospace",
  fontSize: 10,
  letterSpacing: ".08em",
  textTransform: "uppercase",
};

export function ProvenanceBar({ value, dark = false }: { value: ProvenancePresentation; dark?: boolean }) {
  const fg = dark ? "#fff" : "#0A0A0A";
  const line = dark ? "rgba(255,255,255,.34)" : "rgba(10,10,10,.28)";
  const muted = dark ? "rgba(255,255,255,.7)" : "rgba(10,10,10,.62)";
  const items = [
    ["STATE", value.state],
    ["ACTOR", value.actor],
    [value.source ? "SOURCE" : "METHOD", value.source ?? value.method ?? "NOT STATED"],
    ["TIME", value.time ?? "NOT STATED"],
    ["LIMIT", value.limitation],
  ];
  return (
    <div aria-label={`Proof state ${value.state}`} style={{ border: `1px solid ${line}`, color: fg }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))" }}>
        {items.map(([k, v], i) => (
          <div key={`${k}-${i}`} style={{ padding: "9px 11px", borderRight: `1px solid ${line}`, minWidth: 0 }}>
            <span style={{ ...mono, color: muted, display: "block", marginBottom: 5 }}>{k}</span>
            <span style={{ fontSize: 11.5, lineHeight: 1.35, overflowWrap: "anywhere" }}>{v}</span>
          </div>
        ))}
      </div>
      {!!value.flags?.length && (
        <div style={{ ...mono, borderTop: `1px solid ${line}`, padding: "8px 11px", color: "#FF4D22" }}>
          {value.flags.join(" · ")}
        </div>
      )}
    </div>
  );
}

export function ProofExplanation({ value }: { value: ProvenancePresentation }) {
  return (
    <div style={{ maxWidth: 720 }}>
      <div style={{ ...mono, color: "#2E2EFF", marginBottom: 8 }}>{value.state}</div>
      <p style={{ margin: 0, fontSize: 15, lineHeight: 1.55 }}>{value.limitation}</p>
      {value.state === "PARTNER REPORT" && (
        <p style={{ margin: "10px 0 0", fontSize: 13, lineHeight: 1.5, color: "rgba(10,10,10,.64)" }}>
          A partner-reported activity is not independent verification and is not a verified ecological outcome.
        </p>
      )}
    </div>
  );
}
