import { Link, useLocation } from "react-router-dom";
import { projectionFor } from "@/planet/livingPlanetProjection";
import { RESEARCH_OBJECTS } from "@/content/livingPlanetCell";

export function LivingPlanetAtlasBridge() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  if (params.get("place") !== "bergen") return null;

  const update = projectionFor("ATLAS_PLACE");
  const research = RESEARCH_OBJECTS.find((item) => item.id === "RES-BGO-PROCLIMATE-01");
  if (!update) return null;

  return (
    <aside
      aria-label="Bergen Living Planet place intelligence"
      style={{
        position: "fixed",
        right: 18,
        top: 74,
        zIndex: 82,
        width: "min(390px, calc(100vw - 36px))",
        background: "rgba(7,10,14,.94)",
        border: "1px solid rgba(255,255,255,.2)",
        color: "#fff",
        padding: 20,
        backdropFilter: "blur(16px)",
        boxShadow: "0 18px 60px rgba(0,0,0,.35)",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, fontFamily: "monospace", fontSize: 9, letterSpacing: ".12em", color: "#7ae0ff" }}>
        <span>PLACE GOLD 01 · BERGEN_</span><span>SOURCE-BACKED</span>
      </div>
      <h2 style={{ fontSize: 30, lineHeight: 1, letterSpacing: "-.035em", marginTop: 22, fontWeight: 520 }}>A decision is changing.</h2>
      <p style={{ fontSize: 14, lineHeight: 1.5, color: "rgba(255,255,255,.76)", marginTop: 14 }}>{update.fact}</p>
      {research ? <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid rgba(255,255,255,.18)" }}>
        <span style={{ fontFamily: "monospace", fontSize: 9, letterSpacing: ".12em", color: "#7ae0ff" }}>RESEARCH CONTEXT · ONGOING</span>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,.65)", marginTop: 8 }}>{research.humanFinding}</p>
      </div> : null}
      <div style={{ display: "flex", gap: 10, marginTop: 20, flexWrap: "wrap" }}>
        <Link to="/places/bergen" style={{ border: "1px solid #fff", padding: "10px 12px", fontFamily: "monospace", fontSize: 9 }}>OPEN BERGEN CELL →</Link>
        <Link to="/get-involved?place=bergen" style={{ border: "1px solid rgba(255,255,255,.34)", padding: "10px 12px", fontFamily: "monospace", fontSize: 9 }}>GET INVOLVED →</Link>
      </div>
      <p style={{ fontFamily: "monospace", fontSize: 8, lineHeight: 1.45, color: "rgba(255,255,255,.42)", marginTop: 16 }}>ATLAS projection carries the canonical update/source lineage. It does not imply a spatial impact surface, live environmental condition or final policy outcome.</p>
    </aside>
  );
}
