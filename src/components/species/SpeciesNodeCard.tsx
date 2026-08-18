import { Link } from "react-router-dom";
import { T } from "@/styles/tokens";

const mono: React.CSSProperties = { fontFamily: T.mono, fontSize: 10, letterSpacing: ".12em" };

export interface SpeciesRelationshipNode {
  id: string;
  commonName: string;
  scientificName: string;
  relationshipLabel: string;
  relationshipSummary: string;
  boundary: string;
  sourceLabel: string;
  sourceUrl: string;
  atlasHref?: string;
  speciesHref?: string;
}

export function SpeciesNodeCard({ node, dark = false }: { node: SpeciesRelationshipNode; dark?: boolean }) {
  const ink = dark ? "#fff" : T.ink;
  const dim = dark ? "rgba(255,255,255,.62)" : T.dim;
  const line = dark ? "rgba(255,255,255,.18)" : T.lineStrong;
  const background = dark ? "#071009" : "#fff";

  return (
    <article style={{ border: `1px solid ${line}`, background, color: ink, padding: "clamp(22px,4vw,36px)", minHeight: 340, display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>
        <div style={{ ...mono, color: dark ? T.acid : T.blue }}>{node.relationshipLabel}</div>
        <div style={{ ...mono, color: dim }}>{node.id}</div>
      </div>
      <h3 style={{ margin: "30px 0 0", fontFamily: T.display, fontWeight: 500, fontSize: "clamp(34px,5vw,62px)", letterSpacing: "-.045em", lineHeight: .95 }}>{node.commonName}</h3>
      <p style={{ margin: "9px 0 0", fontFamily: T.display, fontStyle: "italic", fontSize: "clamp(17px,2vw,22px)", color: dim }}>{node.scientificName}</p>
      <p style={{ margin: "24px 0 0", maxWidth: 620, fontSize: 15, lineHeight: 1.62 }}>{node.relationshipSummary}</p>
      <p style={{ margin: "18px 0 0", maxWidth: 680, fontSize: 12.5, lineHeight: 1.6, color: dim }}><strong>BOUNDARY:</strong> {node.boundary}</p>
      <div style={{ marginTop: "auto", paddingTop: 28, display: "flex", flexWrap: "wrap", gap: 9 }}>
        {node.speciesHref && <Link to={node.speciesHref} style={{ ...mono, background: dark ? T.acid : T.ink, color: dark ? "#071009" : "#fff", padding: "11px 13px", textDecoration: "none" }}>OPEN SPECIES WORLD →</Link>}
        {node.atlasHref && <Link to={node.atlasHref} style={{ ...mono, border: `1px solid ${line}`, color: ink, padding: "10px 12px", textDecoration: "none" }}>OPEN IN ATLAS →</Link>}
        <a href={node.sourceUrl} target="_blank" rel="noreferrer" style={{ ...mono, border: `1px solid ${line}`, color: dark ? T.acid : T.blue, padding: "10px 12px", textDecoration: "none" }}>{node.sourceLabel} ↗</a>
      </div>
    </article>
  );
}
