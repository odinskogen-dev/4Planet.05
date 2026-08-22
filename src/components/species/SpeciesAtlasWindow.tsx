import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import "maplibre-gl/dist/maplibre-gl.css";
import { taxonOccurrences } from "@/planet/connectors";
import type { Occurrence } from "@/planet/types";
import { T } from "@/styles/tokens";

const VECTOR_STYLE = "https://tiles.openfreemap.org/styles/dark";
const mono: React.CSSProperties = { fontFamily: T.mono, fontSize: 10, letterSpacing: ".12em" };

type AtlasState =
  | { kind: "IDLE" }
  | { kind: "LOADING" }
  | { kind: "READY"; shown: number; total: number }
  | { kind: "EMPTY" }
  | { kind: "UNAVAILABLE"; reason: string };

type Mode = "OBSERVATIONS" | "ECOSYSTEMS";

export interface SpeciesAtlasEcosystemAnchor {
  label: string;
  href: string;
  relationship: string;
  boundary: string;
}

function safeHttpUrl(raw: unknown) {
  if (typeof raw !== "string" || !raw) return null;
  try {
    const url = new URL(raw);
    return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : null;
  } catch {
    return null;
  }
}

function popup(date: string, sourceUrl: string) {
  const root = document.createElement("div");
  root.style.font = "12px/1.45 system-ui";
  root.style.color = "#080808";
  const title = document.createElement("strong");
  title.textContent = "REPORTED OCCURRENCE";
  root.append(title, document.createElement("br"), document.createTextNode(date));
  const safeUrl = safeHttpUrl(sourceUrl);
  if (safeUrl) {
    root.append(document.createElement("br"));
    const link = document.createElement("a");
    link.href = safeUrl;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = "OPEN SOURCE RECORD ↗";
    root.append(link);
  }
  return root;
}

export function SpeciesAtlasWindow({
  gbifKey,
  commonName,
  scientificName,
  entityId,
  journey,
  ecosystems = [],
}: {
  gbifKey: number;
  commonName: string;
  scientificName: string;
  entityId: string;
  journey?: string;
  ecosystems?: SpeciesAtlasEcosystemAnchor[];
}) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const boxRef = useRef<HTMLDivElement | null>(null);
  const [armed, setArmed] = useState(false);
  const [state, setState] = useState<AtlasState>({ kind: "IDLE" });
  const [webgl, setWebgl] = useState(true);
  const [mode, setMode] = useState<Mode>("OBSERVATIONS");

  useEffect(() => {
    if (armed) return;
    const section = sectionRef.current;
    if (!section || typeof IntersectionObserver === "undefined") {
      setArmed(true);
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      setArmed(true);
      observer.disconnect();
    }, { rootMargin: "320px 0px" });
    observer.observe(section);
    return () => observer.disconnect();
  }, [armed]);

  useEffect(() => {
    if (mode !== "OBSERVATIONS" || !armed || !boxRef.current) return;
    let alive = true;
    let map: import("maplibre-gl").Map | null = null;
    setWebgl(true);
    setState({ kind: "LOADING" });

    const boot = async () => {
      try {
        const canvas = document.createElement("canvas");
        const available = Boolean(canvas.getContext("webgl2") || canvas.getContext("webgl"));
        if (!available) {
          if (!alive) return;
          setWebgl(false);
          setState({ kind: "UNAVAILABLE", reason: "WebGL unavailable on this device." });
          return;
        }

        const maplibre = await import("maplibre-gl");
        if (!alive || !boxRef.current) return;
        map = new maplibre.Map({
          container: boxRef.current,
          style: VECTOR_STYLE,
          center: [-30, 18],
          zoom: 1.8,
          minZoom: 1.2,
          maxZoom: 8,
          attributionControl: false,
        });
        map.addControl(new maplibre.NavigationControl({ showCompass: false }), "top-right");
        map.addControl(new maplibre.AttributionControl({ compact: true }), "bottom-right");

        map.on("load", async () => {
          try {
            const result = await taxonOccurrences(gbifKey, 180);
            if (!alive || !map) return;
            if (!result.ok) {
              setState({ kind: "UNAVAILABLE", reason: `GBIF occurrence feed unavailable (${result.error}).` });
              return;
            }
            const rows = result.data.rows.filter((r: Occurrence) => Number.isFinite(r.lat) && Number.isFinite(r.lng));
            if (!rows.length) {
              setState({ kind: "EMPTY" });
              return;
            }
            const geojson: GeoJSON.FeatureCollection<GeoJSON.Point> = {
              type: "FeatureCollection",
              features: rows.map((row) => ({
                type: "Feature",
                geometry: { type: "Point", coordinates: [row.lng, row.lat] },
                properties: { date: row.eventDate ?? "DATE NOT PROVIDED", sourceUrl: row.sourceUrl ?? "" },
              })),
            };
            map.addSource("species-occurrences", { type: "geojson", data: geojson });
            map.addLayer({
              id: "species-occurrences-halo",
              type: "circle",
              source: "species-occurrences",
              paint: { "circle-radius": 6, "circle-color": "rgba(58,232,111,.20)", "circle-stroke-width": 0 },
            });
            map.addLayer({
              id: "species-occurrences",
              type: "circle",
              source: "species-occurrences",
              paint: { "circle-radius": 2.5, "circle-color": T.acid, "circle-stroke-color": "#07100a", "circle-stroke-width": 0.65 },
            });
            const bounds = new maplibre.LngLatBounds();
            rows.forEach((row) => bounds.extend([row.lng, row.lat]));
            if (!bounds.isEmpty()) map.fitBounds(bounds, { padding: 44, maxZoom: 4.3, duration: 0 });
            map.on("click", "species-occurrences", (event) => {
              const feature = event.features?.[0];
              const coords = feature?.geometry?.type === "Point" ? feature.geometry.coordinates : null;
              if (!coords) return;
              new maplibre.Popup({ closeButton: true, maxWidth: "260px" })
                .setLngLat(coords as [number, number])
                .setDOMContent(popup(String(feature?.properties?.date ?? "DATE NOT PROVIDED"), String(feature?.properties?.sourceUrl ?? "")))
                .addTo(map!);
            });
            map.on("mouseenter", "species-occurrences", () => { if (map) map.getCanvas().style.cursor = "pointer"; });
            map.on("mouseleave", "species-occurrences", () => { if (map) map.getCanvas().style.cursor = ""; });
            setState({ kind: "READY", shown: rows.length, total: result.data.total });
          } catch {
            if (alive) setState({ kind: "UNAVAILABLE", reason: "GBIF occurrence feed could not be read." });
          }
        });
      } catch {
        if (alive) setState({ kind: "UNAVAILABLE", reason: "Interactive map unavailable on this device." });
      }
    };

    void boot();
    return () => { alive = false; map?.remove(); };
  }, [armed, gbifKey, mode]);

  const observationMode = mode === "OBSERVATIONS";
  const atlasHref = `/atlas?entity=${encodeURIComponent(entityId)}${journey ? `&journey=${encodeURIComponent(journey)}` : ""}`;

  return (
    <section ref={sectionRef} aria-labelledby="species-atlas-title" style={{ background: "#050805", color: "#fff", borderTop: "1px solid rgba(255,255,255,.13)", borderBottom: "1px solid rgba(255,255,255,.13)" }}>
      <div style={{ maxWidth: 1240, margin: "0 auto", padding: "clamp(44px,7vw,92px) clamp(18px,5vw,72px)" }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 30 }} aria-label="Species Atlas modes">
          <button type="button" onClick={() => setMode("OBSERVATIONS")} aria-pressed={observationMode} style={{ ...mono, cursor: "pointer", border: `1px solid ${observationMode ? T.acid : "rgba(255,255,255,.28)"}`, background: observationMode ? T.acid : "transparent", color: observationMode ? "#071009" : "rgba(255,255,255,.78)", padding: "9px 12px" }}>OBSERVATIONS</button>
          {ecosystems.length > 0 && <button type="button" onClick={() => setMode("ECOSYSTEMS")} aria-pressed={mode === "ECOSYSTEMS"} style={{ ...mono, cursor: "pointer", border: `1px solid ${mode === "ECOSYSTEMS" ? T.acid : "rgba(255,255,255,.28)"}`, background: mode === "ECOSYSTEMS" ? T.acid : "transparent", color: mode === "ECOSYSTEMS" ? "#071009" : "rgba(255,255,255,.78)", padding: "9px 12px" }}>ECOSYSTEMS</button>}
          <span style={{ ...mono, border: "1px solid rgba(255,255,255,.16)", color: "rgba(255,255,255,.42)", padding: "9px 12px" }}>RANGE · NOT PUBLISHED</span>
        </div>

        <div className="species-atlas-grid" style={{ display: "grid", gridTemplateColumns: "minmax(0,.75fr) minmax(0,1.25fr)", gap: "clamp(28px,6vw,80px)", alignItems: "start" }}>
          <div>
            <div style={{ ...mono, color: T.acid }}>{observationMode ? "WHERE · REPORTED OBSERVATIONS" : "WHERE · ECOSYSTEM CONTEXT"}</div>
            <h2 id="species-atlas-title" style={{ fontFamily: T.display, fontWeight: 500, fontSize: "clamp(36px,5vw,70px)", letterSpacing: "-.045em", lineHeight: .94, margin: "18px 0 0" }}>
              {observationMode ? `Where has ${commonName.toLowerCase()} been recorded?` : `Which living systems can you enter from ${commonName.toLowerCase()}?`}
            </h2>
            <p style={{ margin: "22px 0 0", maxWidth: 520, fontSize: 16, lineHeight: 1.62, color: "rgba(255,255,255,.78)" }}>
              {observationMode
                ? <>Reported, georeferenced GBIF occurrence records for <em>{scientificName}</em>. Points are observations — not range, population, abundance or live tracking.</>
                : <>Ecosystem links are curated 4PLANET context. They are not inferred from occurrence dots and do not assert that a particular animal belongs to the linked place.</>}
            </p>
            {observationMode ? (
              <div aria-live="polite" style={{ marginTop: 24, paddingTop: 18, borderTop: "1px solid rgba(255,255,255,.18)", ...mono, color: "rgba(255,255,255,.64)", lineHeight: 1.7 }}>
                {state.kind === "IDLE" && "MAP + RECORDS LOAD AS THIS VIEW APPROACHES."}
                {state.kind === "LOADING" && "LOADING REPORTED OCCURRENCES…"}
                {state.kind === "READY" && `${state.shown} POINTS SHOWN · ${state.total.toLocaleString()} GBIF RECORDS REPORTED`}
                {state.kind === "EMPTY" && "NO GEOCODED OCCURRENCES RETURNED IN THIS CHECK."}
                {state.kind === "UNAVAILABLE" && `ATLAS VIEW UNAVAILABLE · ${state.reason}`}
              </div>
            ) : (
              <div style={{ marginTop: 24, paddingTop: 18, borderTop: "1px solid rgba(255,255,255,.18)", ...mono, color: "rgba(255,255,255,.64)", lineHeight: 1.7 }}>CURATED CONTEXT ≠ OCCURRENCE-DERIVED MEMBERSHIP</div>
            )}
            <Link to={atlasHref} style={{ display: "inline-flex", marginTop: 28, color: "#080808", background: T.acid, padding: "13px 17px", textDecoration: "none", fontWeight: 650, fontSize: 13 }}>OPEN {commonName.toUpperCase()} IN FULL ATLAS →</Link>
          </div>

          {observationMode ? (
            <div aria-busy={state.kind === "LOADING"} style={{ position: "relative", minHeight: 430, border: "1px solid rgba(255,255,255,.18)", background: "#0c100d", overflow: "hidden" }}>
              <div ref={boxRef} aria-label={`${commonName} reported occurrence map`} style={{ width: "100%", height: 520, display: webgl ? "block" : "none" }} />
              {(state.kind === "IDLE" || state.kind === "LOADING") && <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", color: "rgba(255,255,255,.58)", pointerEvents: "none" }}><div style={mono}>{state.kind === "IDLE" ? "ATLAS · LOADS ON APPROACH" : "ATLAS · LOADING"}</div></div>}
              {state.kind === "UNAVAILABLE" && <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", padding: 32, textAlign: "center", color: "rgba(255,255,255,.66)" }}><div><strong style={{ display: "block", color: "#fff", marginBottom: 8 }}>ATLAS VIEW UNAVAILABLE</strong>{state.reason}<br />No substitute range is fabricated.</div></div>}
              <div style={{ position: "absolute", left: 12, top: 12, zIndex: 2, ...mono, background: "rgba(0,0,0,.72)", padding: "7px 9px", color: "rgba(255,255,255,.82)" }}>● REPORTED OCCURRENCE · GBIF</div>
            </div>
          ) : (
            <div style={{ minHeight: 430, border: "1px solid rgba(255,255,255,.18)", background: "#0c100d", display: "grid" }}>
              {ecosystems.map((ecosystem) => <Link key={ecosystem.href} to={ecosystem.href} style={{ padding: "clamp(26px,5vw,52px)", color: "#fff", textDecoration: "none", display: "flex", minHeight: 300, flexDirection: "column", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,.16)" }}><div><div style={{ ...mono, color: T.acid }}>{ecosystem.relationship}</div><h3 style={{ margin: "18px 0 0", fontFamily: T.display, fontWeight: 500, fontSize: "clamp(34px,5vw,68px)", letterSpacing: "-.045em", lineHeight: .95 }}>{ecosystem.label}</h3><p style={{ margin: "24px 0 0", maxWidth: 620, color: "rgba(255,255,255,.68)", fontSize: 13.5, lineHeight: 1.62 }}><strong>BOUNDARY:</strong> {ecosystem.boundary}</p></div><div style={{ ...mono, marginTop: 34, color: T.acid }}>ENTER ECOSYSTEM →</div></Link>)}
            </div>
          )}
        </div>
        <p style={{ margin: "22px 0 0", ...mono, color: "rgba(255,255,255,.46)", lineHeight: 1.7 }}>RANGE IS NOT PUBLISHED UNTIL AN AUTHORITATIVE RANGE GEOMETRY + SOURCE IS ADMITTED. OCCURRENCE POINTS WILL NOT BE CONVERTED INTO RANGE.</p>
      </div>
      <style>{`@media(max-width:820px){.species-atlas-grid{grid-template-columns:1fr!important}}`}</style>
    </section>
  );
}
