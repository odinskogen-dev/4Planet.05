import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { OSLOFJORD_PRIMARY_WATERBODY_ID, OSLOFJORD_SPATIAL_REGISTRY } from "@/data/oslofjordenSpatial";
import { fetchVannmiljoRegistrations, type VannmiljoResult } from "@/planet/vannmiljo";
import { fetchWaterbodyGeometry, type WaterbodyGeometryResult } from "@/planet/waterbodyGeometry";

const PLACE_ID = "place:marine-regions:3379";

const mono: React.CSSProperties = {
  fontFamily: "'Fragment Mono',ui-monospace,monospace",
  fontSize: 9.5,
  letterSpacing: ".09em",
  textTransform: "uppercase",
};

function activeOslofjord(search: string) {
  const q = new URLSearchParams(search);
  return q.get("journey") === "oslofjorden" || q.get("place") === PLACE_ID || q.get("entity") === PLACE_ID;
}

export function PlaceProductBridge({ mode }: { mode: "ATLAS" | "SPECIES" }) {
  const location = useLocation();
  const active = useMemo(() => activeOslofjord(location.search), [location.search]);
  const [geometry, setGeometry] = useState<WaterbodyGeometryResult | null>(null);
  const [life, setLife] = useState<VannmiljoResult | null>(null);

  useEffect(() => {
    if (!active) return;
    let alive = true;
    if (mode === "ATLAS") {
      fetchWaterbodyGeometry().then((result) => { if (alive) setGeometry(result); });
    } else {
      fetchVannmiljoRegistrations({ limit: 40 }).then((result) => { if (alive) setLife(result); });
    }
    return () => { alive = false; };
  }, [active, mode]);

  if (!active) return null;

  const spatialRoles = OSLOFJORD_SPATIAL_REGISTRY.map((item) => item.role).filter(Boolean);
  const status = mode === "ATLAS"
    ? geometry == null ? "LOADING SOURCE GEOMETRY" : geometry.ok ? "WATERBODY GEOMETRY LOADED" : `GEOMETRY ${geometry.error.replace(/_/g, " ")}`
    : life == null ? "LOADING LOCAL SOURCE" : life.ok ? `${life.records.filter((row) => row.scientificName).length} SPECIES-LABELLED RECORDS LOADED` : `SOURCE ${life.error.replace(/_/g, " ")}`;

  return (
    <aside
      aria-label="Oslofjorden source-aware product context"
      style={{
        position: "fixed",
        zIndex: 60,
        right: 14,
        top: 58,
        width: "min(390px,calc(100vw - 28px))",
        background: "rgba(255,255,255,.97)",
        color: "#0A0A0A",
        border: "1px solid rgba(10,10,10,.28)",
        padding: 16,
        boxShadow: "0 18px 60px rgba(0,0,0,.16)",
      }}
    >
      <div style={{ ...mono, color: "#2E2EFF" }}>OSLOFJORDEN / {mode} / SHARED PLACE MODEL</div>
      <div style={{ fontFamily: "'Instrument Sans',sans-serif", fontSize: 22, letterSpacing: "-.035em", marginTop: 8 }}>Same place. Source-specific spatial jobs.</div>
      <p style={{ fontSize: 12.5, lineHeight: 1.45, margin: "9px 0 0", color: "rgba(10,10,10,.68)" }}>
        MRGID 3379 remains semantic identity. WaterBodyID {OSLOFJORD_PRIMARY_WATERBODY_ID} is one official source area/query contract — not a universal Oslofjorden polygon.
      </p>
      <div style={{ ...mono, marginTop: 12, padding: "8px 9px", border: "1px solid #0B7A39", color: "#0B7A39" }}>{status}</div>
      {mode === "ATLAS" && geometry?.ok && (
        <div style={{ fontSize: 11.5, lineHeight: 1.45, marginTop: 9 }}>
          SOURCE AREA / {geometry.record.name} · {geometry.record.waterBodyId}<br />ROLE / WATERBODY STATUS · delivered EPSG:4326
        </div>
      )}
      {mode === "SPECIES" && life?.ok && (
        <div style={{ fontSize: 11.5, lineHeight: 1.45, marginTop: 9 }}>
          QUERY / VANNMILJØ WaterBodyIDFilter<br />SOURCE MATCHES / {life.total.toLocaleString()} · LOADED / {life.records.length}
        </div>
      )}
      <div style={{ ...mono, marginTop: 10, color: "rgba(10,10,10,.5)" }}>ROLES / {spatialRoles.join(" · ")}</div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
        <Link to="/place/oslofjorden" style={{ ...mono, color: "#fff", background: "#0A0A0A", padding: "8px 10px", textDecoration: "none" }}>OPEN PLACE →</Link>
        {mode === "ATLAS" ? (
          <Link to={`/species?place=${encodeURIComponent(PLACE_ID)}&journey=oslofjorden`} style={{ ...mono, color: "#0A0A0A", border: "1px solid #0A0A0A", padding: "7px 10px", textDecoration: "none" }}>SPECIES CONTEXT →</Link>
        ) : (
          <Link to="/atlas?journey=oslofjorden&z=6.40&c=10.62,59.67" style={{ ...mono, color: "#0A0A0A", border: "1px solid #0A0A0A", padding: "7px 10px", textDecoration: "none" }}>ATLAS CONTEXT →</Link>
        )}
      </div>
    </aside>
  );
}
