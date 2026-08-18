import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import "maplibre-gl/dist/maplibre-gl.css";
import { taxonOccurrences } from "@/planet/connectors";
import type { Occurrence } from "@/planet/types";
import { T } from "@/styles/tokens";

const VECTOR_STYLE = "https://tiles.openfreemap.org/styles/liberty";
const mono: React.CSSProperties = { fontFamily: T.mono, fontSize: 10, letterSpacing: ".12em" };

type AtlasState =
  | { kind: "IDLE" }
  | { kind: "LOADING" }
  | { kind: "READY"; shown: number; total: number }
  | { kind: "EMPTY" }
  | { kind: "UNAVAILABLE"; reason: string };

function safeHttpUrl(raw: unknown) {
  if (typeof raw !== "string" || !raw) return null;
  try {
    const url = new URL(raw);
    return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : null;
  } catch {
    return null;
  }
}

function occurrencePopup(date: string, sourceUrl: string) {
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
}: {
  gbifKey: number;
  commonName: string;
  scientificName: string;
  entityId: string;
  journey?: string;
}) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const boxRef = useRef<HTMLDivElement | null>(null);
  const [armed, setArmed] = useState(false);
  const [state, setState] = useState<AtlasState>({ kind: "IDLE" });
  const [webgl, setWebgl] = useState(true);

  useEffect(() => {
    if (armed) return;
    const section = sectionRef.current;
    if (!section || typeof IntersectionObserver === "undefined") {
      setArmed(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        setArmed(true);
        observer.disconnect();
      },
      { rootMargin: "320px 0px" },
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, [armed]);

  useEffect(() => {
    if (!armed || !boxRef.current) return;
    let alive = true;
    let map: import("maplibre-gl").Map | null = null;
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
          center: [-60, -8],
          zoom: 2.35,
          minZoom: 1.4,
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
                properties: {
                  date: row.eventDate ?? "DATE NOT PROVIDED",
                  sourceUrl: row.sourceUrl ?? "",
                },
              })),
            };

            map.addSource("species-occurrences", { type: "geojson", data: geojson });
            map.addLayer({
              id: "species-occurrences-halo",
              type: "circle",
              source: "species-occurrences",
              paint: {
                "circle-radius": 6,
                "circle-color": "rgba(58,232,111,.20)",
                "circle-stroke-width": 0,
              },
            });
            map.addLayer({
              id: "species-occurrences",
              type: "circle",
              source: "species-occurrences",
              paint: {
                "circle-radius": 2.5,
                "circle-color": T.acid,
                "circle-stroke-color": "#07100a",
                "circle-stroke-width": 0.65,
              },
            });

            const bounds = new maplibre.LngLatBounds();
            rows.forEach((row) => bounds.extend([row.lng, row.lat]));
            if (!bounds.isEmpty()) map.fitBounds(bounds, { padding: 44, maxZoom: 4.3, duration: 0 });

            map.on("click", "species-occurrences", (event) => {
              const feature = event.features?.[0];
              const coordinates = feature?.geometry?.type === "Point" ? feature.geometry.coordinates : null;
              if (!coordinates) return;
              const date = String(feature?.properties?.date ?? "DATE NOT PROVIDED");
              const url = String(feature?.properties?.sourceUrl ?? "");
              new maplibre.Popup({ closeButton: true, maxWidth: "260px" })
                .setLngLat(coordinates as [number, number])
                .setDOMContent(occurrencePopup(date, url))
                .addTo(map!);
            });
            map.on("mouseenter", "species-occurrences", () => { if (map) map.getCanvas().style.cursor = "pointer"; });
            map.on("mouseleave", "species-occurrences", () => { if (map) map.getCanvas().style.cursor = ""; });
            setState({ kind: "READY", shown: rows.length, total: result.data.total });
          } catch {
            if (alive) setState({ kind: "UNAVAILABLE", reason: "GBIF occurrence feed could not be read." });
          }
        });

        map.on("error", () => {
          if (!alive || !map || map.loaded()) return;
          setState({ kind: "UNAVAILABLE", reason: "Map basemap could not be loaded." });
        });
      } catch {
        if (alive) setState({ kind: "UNAVAILABLE", reason: "Interactive map unavailable on this device." });
      }
    };

    void boot();
    return () => {
      alive = false;
      map?.remove();
    };
  }, [armed, gbifKey]);

  const atlasHref = `/atlas?entity=${encodeURIComponent(entityId)}${journey ? `&journey=${encodeURIComponent(journey)}` : ""}`;

  return (
    <section ref={sectionRef} aria-labelledby="species-atlas-title" style={{ background: "#050805", color: "#fff", borderTop: "1px solid rgba(255,255,255,.13)", borderBottom: "1px solid rgba(255,255,255,.13)" }}>
      <div style={{ maxWidth: 1240, margin: "0 auto", padding: "clamp(44px,7vw,92px) clamp(18px,5vw,72px)" }}>
        <div style={{ display: "grid", gridTemplateColumns: "minmax(0,.75fr) minmax(0,1.25fr)", gap: "clamp(28px,6vw,80px)", alignItems: "start" }} className="species-atlas-grid">
          <div>
            <div style={{ ...mono, color: T.acid }}>ATLAS_ · SPECIES WINDOW · OBSERVATIONS</div>
            <h2 id="species-atlas-title" style={{ fontFamily: T.display, fontWeight: 500, fontSize: "clamp(36px,5vw,70px)", letterSpacing: "-.045em", lineHeight: .94, margin: "18px 0 0" }}>Where has {commonName.toLowerCase()} been recorded?</h2>
            <p style={{ margin: "22px 0 0", maxWidth: 520, fontSize: 16, lineHeight: 1.62, color: "rgba(255,255,255,.78)" }}>
              Reported, georeferenced GBIF occurrence records for <em>{scientificName}</em>. These points are records submitted to a biodiversity data network — not a range map, population estimate or live tracking feed.
            </p>
            <div aria-live="polite" style={{ marginTop: 24, paddingTop: 18, borderTop: "1px solid rgba(255,255,255,.18)", ...mono, color: "rgba(255,255,255,.64)", lineHeight: 1.7 }}>
              {state.kind === "IDLE" && "MAP + RECORDS LOAD AS THIS WINDOW APPROACHES VIEW."}
              {state.kind === "LOADING" && "LOADING REPORTED OCCURRENCES…"}
              {state.kind === "READY" && `${state.shown} POINTS SHOWN · ${state.total.toLocaleString()} GBIF RECORDS REPORTED`}
              {state.kind === "EMPTY" && "NO GEOCODED OCCURRENCES RETURNED IN THIS CHECK."}
              {state.kind === "UNAVAILABLE" && `ATLAS WINDOW UNAVAILABLE · ${state.reason}`}
            </div>
            <Link to={atlasHref} style={{ display: "inline-flex", marginTop: 28, color: "#080808", background: T.acid, padding: "13px 17px", textDecoration: "none", fontWeight: 650, fontSize: 13 }}>
              OPEN {commonName.toUpperCase()} IN FULL ATLAS →
            </Link>
          </div>
          <div aria-busy={state.kind === "LOADING"} style={{ position: "relative", minHeight: 430, border: "1px solid rgba(255,255,255,.18)", background: "#0c100d", overflow: "hidden" }}>
            <div ref={boxRef} aria-label={`${commonName} reported occurrence map`} style={{ width: "100%", height: 520, display: webgl ? "block" : "none" }} />
            {(state.kind === "IDLE" || state.kind === "LOADING") && (
              <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", padding: 32, textAlign: "center", color: "rgba(255,255,255,.58)", pointerEvents: "none" }}>
                <div style={mono}>{state.kind === "IDLE" ? "ATLAS WINDOW · LOADS ON APPROACH" : "ATLAS WINDOW · LOADING"}</div>
              </div>
            )}
            {state.kind === "UNAVAILABLE" && (
              <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", padding: 32, textAlign: "center", color: "rgba(255,255,255,.66)" }}>
                <div><strong style={{ display: "block", color: "#fff", marginBottom: 8 }}>ATLAS WINDOW UNAVAILABLE</strong>{state.reason}<br />The source boundary is preserved; no substitute range is fabricated.</div>
              </div>
            )}
            <div style={{ position: "absolute", left: 12, bottom: 12, zIndex: 2, ...mono, background: "rgba(0,0,0,.72)", padding: "7px 9px", color: "rgba(255,255,255,.82)" }}>● REPORTED OCCURRENCE · GBIF</div>
          </div>
        </div>
      </div>
      <style>{`@media(max-width:820px){.species-atlas-grid{grid-template-columns:1fr!important}}`}</style>
    </section>
  );
}
