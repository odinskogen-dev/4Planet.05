import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import type { SpeciesSourceEnvelope } from "@/data/speciesSourceEnvelope";
import { T } from "@/styles/tokens";

const mono: React.CSSProperties = {
  fontFamily: T.mono,
  fontSize: 10,
  letterSpacing: ".12em",
  textTransform: "uppercase",
};

const stateColor = (state: string) => {
  if (state === "KNOWN") return T.acid;
  if (state === "INTERPRETED") return T.blue;
  return "#8A6500";
};

export function SpeciesEvidenceSeam({ envelope }: { envelope?: SpeciesSourceEnvelope }) {
  const [target, setTarget] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setTarget(document.getElementById("main-content"));
  }, []);

  if (!envelope || !target) return null;

  const latestChecked = envelope.records
    .map((record) => record.checkedAt)
    .filter(Boolean)
    .sort()
    .at(-1) ?? "UNKNOWN";

  return createPortal(
    <section
      data-testid="species-source-evidence-seam"
      aria-labelledby="species-source-evidence-title"
      style={{
        borderTop: `1px solid ${T.line}`,
        background: "#fff",
        color: T.ink,
        padding: "clamp(48px,7vw,104px) clamp(20px,5vw,72px)",
      }}
    >
      <div style={{ maxWidth: 1180, margin: "0 auto" }}>
        <div style={{ ...mono, color: T.blue }}>HOW DO WE KNOW? · SOURCE ENVELOPE 01</div>
        <h2
          id="species-source-evidence-title"
          style={{
            marginTop: 14,
            maxWidth: 800,
            fontFamily: T.display,
            fontWeight: 500,
            fontSize: "clamp(32px,5vw,64px)",
            lineHeight: .98,
            letterSpacing: "-.04em",
          }}
        >
          The evidence travels with the species.
        </h2>
        <p style={{ marginTop: 20, maxWidth: 760, color: T.dim, fontSize: 16, lineHeight: 1.6 }}>
          {envelope.scientificName} keeps its sources, provenance, rights notes, uncertainty and update rules attached to one shared species object. Missing evidence stays unknown.
        </p>

        <div style={{ marginTop: 28, display: "flex", gap: 8, flexWrap: "wrap" }}>
          <span style={{ ...mono, border: `1px solid ${T.lineStrong}`, padding: "7px 9px" }}>{envelope.records.length} SOURCE RECORDS</span>
          <span style={{ ...mono, border: `1px solid ${T.lineStrong}`, padding: "7px 9px" }}>CHECKED {latestChecked}</span>
          <span style={{ ...mono, border: `1px solid ${T.lineStrong}`, padding: "7px 9px" }}>BOUNDARIES ATTACHED</span>
        </div>

        <div style={{ display: "grid", gap: 10, marginTop: 30 }}>
          {envelope.records.map((record) => {
            const color = stateColor(record.evidenceState);
            return (
              <details key={record.id} style={{ border: `1px solid ${T.line}`, borderLeft: `3px solid ${color}`, padding: "0 16px" }}>
                <summary style={{ cursor: "pointer", listStyle: "none", padding: "16px 0", display: "flex", justifyContent: "space-between", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
                  <span>
                    <strong style={{ fontFamily: T.display, fontSize: 18, fontWeight: 600 }}>{record.label}</strong>
                    <span style={{ ...mono, display: "block", marginTop: 5, color: T.dim }}>{record.purpose} · {record.sourceFamily}</span>
                  </span>
                  <span style={{ ...mono, color }}>{record.evidenceState}</span>
                </summary>
                <div style={{ borderTop: `1px solid ${T.line}`, padding: "16px 0 20px", display: "grid", gap: 14 }}>
                  <div>
                    <div style={{ ...mono, color: T.dim }}>PROVENANCE</div>
                    <p style={{ marginTop: 6, lineHeight: 1.55 }}>{record.provenance}</p>
                  </div>
                  <div>
                    <div style={{ ...mono, color: "#8A6500" }}>UNCERTAINTY / LIMIT</div>
                    <p style={{ marginTop: 6, lineHeight: 1.55 }}>{record.uncertainty}</p>
                  </div>
                  <div>
                    <div style={{ ...mono, color: T.dim }}>RIGHTS / TERMS</div>
                    <p style={{ marginTop: 6, lineHeight: 1.55 }}>{record.rightsOrTerms}</p>
                  </div>
                  <div>
                    <div style={{ ...mono, color: T.dim }}>UPDATE RULE</div>
                    <p style={{ marginTop: 6, lineHeight: 1.55 }}>{record.updateSemantics}</p>
                  </div>
                  <a href={record.sourceUrl} target="_blank" rel="noreferrer" style={{ ...mono, width: "fit-content", color: T.blue }}>
                    OPEN ORIGINAL SOURCE ↗
                  </a>
                </div>
              </details>
            );
          })}
        </div>

        <details style={{ marginTop: 18, border: `1px solid ${T.line}`, padding: "0 16px" }}>
          <summary style={{ ...mono, cursor: "pointer", padding: "16px 0", color: "#8A6500" }}>WHAT WE DO NOT CLAIM</summary>
          <ul style={{ margin: 0, padding: "0 0 20px 20px", display: "grid", gap: 8, color: T.dim, lineHeight: 1.5 }}>
            {envelope.forbiddenInferences.map((boundary) => <li key={boundary}>{boundary}</li>)}
          </ul>
        </details>
      </div>
    </section>,
    target,
  );
}

export default SpeciesEvidenceSeam;
