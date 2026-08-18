import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { EMODNET_BATHYMETRY, emodnetBathymetrySource } from "@/sandbox/atlasDataSources";

const mono: React.CSSProperties = {
  fontFamily: "'Fragment Mono', ui-monospace, monospace",
  fontSize: 10,
  letterSpacing: ".11em",
};

export default function AtlasDataSandbox() {
  const container = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const [state, setState] = useState<"LOADING" | "MAP_GREEN" | "SOURCE_ERROR" | "WEBGL_ERROR">("LOADING");
  const [detail, setDetail] = useState("Initialising MapLibre and EMODnet WMS…");

  useEffect(() => {
    document.title = "ATLAS DATA SANDBOX · 4PLANET";
    const robots = document.createElement("meta");
    robots.name = "robots";
    robots.content = "noindex,nofollow,noarchive";
    document.head.appendChild(robots);

    if (!container.current || mapRef.current) return () => robots.remove();

    let alive = true;
    let sourceError = false;
    try {
      const map = new maplibregl.Map({
        container: container.current,
        style: "https://tiles.openfreemap.org/styles/liberty",
        center: [8, 57],
        zoom: 3.4,
        attributionControl: true,
      });
      mapRef.current = map;

      map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), "bottom-right");

      map.on("load", () => {
        if (!alive) return;
        map.addSource(EMODNET_BATHYMETRY.id, emodnetBathymetrySource() as maplibregl.RasterSourceSpecification);
        map.addLayer({
          id: EMODNET_BATHYMETRY.id,
          type: "raster",
          source: EMODNET_BATHYMETRY.id,
          paint: { "raster-opacity": 0.78, "raster-fade-duration": 120 },
        }, map.getStyle().layers?.find((layer) => layer.type === "symbol")?.id);
        setDetail("Map loaded. Waiting for first EMODnet raster tile.");
      });

      map.on("sourcedata", (event) => {
        if (!alive || event.sourceId !== EMODNET_BATHYMETRY.id || !event.isSourceLoaded || sourceError) return;
        setState("MAP_GREEN");
        setDetail("EMODnet Bathymetry WMS is loaded through the sandbox MapLibre source.");
      });

      map.on("error", (event) => {
        if (!alive) return;
        const sourceId = (event as unknown as { sourceId?: string }).sourceId;
        if (sourceId === EMODNET_BATHYMETRY.id) {
          sourceError = true;
          setState("SOURCE_ERROR");
          setDetail("EMODnet raster request failed. Source failure is preserved as failure, never converted to zero data.");
          return;
        }
        const message = String((event.error as Error | undefined)?.message ?? "");
        if (/webgl|context/i.test(message)) {
          setState("WEBGL_ERROR");
          setDetail("WebGL is unavailable in this browser/session.");
        }
      });
    } catch (error) {
      setState("WEBGL_ERROR");
      setDetail(error instanceof Error ? error.message : "Map initialisation failed.");
    }

    return () => {
      alive = false;
      mapRef.current?.remove();
      mapRef.current = null;
      robots.remove();
    };
  }, []);

  return (
    <main style={{ position: "fixed", inset: 0, background: "#080808", color: "#fff", overflow: "hidden" }}>
      <div ref={container} aria-label="ATLAS data sandbox map" style={{ position: "absolute", inset: 0 }} />

      <section style={{ position: "absolute", zIndex: 3, left: 18, top: 18, width: "min(430px, calc(100vw - 36px))", background: "rgba(8,8,8,.92)", border: "1px solid rgba(255,255,255,.22)", padding: "18px 18px 16px" }}>
        <div style={{ ...mono, color: "rgba(255,255,255,.55)" }}>4PLANET_ · INTERNAL · DO NOT MERGE</div>
        <h1 style={{ margin: "13px 0 0", fontFamily: "'Instrument Sans', sans-serif", fontWeight: 520, fontSize: "clamp(25px,4vw,42px)", lineHeight: .95, letterSpacing: "-.045em" }}>ATLAS DATA SANDBOX</h1>
        <div style={{ ...mono, marginTop: 18, color: state === "MAP_GREEN" ? "#3AE86F" : state === "LOADING" ? "#fff" : "#FF4D22" }}>{state}</div>
        <p style={{ margin: "9px 0 0", fontFamily: "'DM Sans', sans-serif", fontSize: 13, lineHeight: 1.55, color: "rgba(255,255,255,.75)" }}>{detail}</p>

        <div style={{ marginTop: 18, paddingTop: 15, borderTop: "1px solid rgba(255,255,255,.18)" }}>
          <div style={{ ...mono, color: "#2E2EFF" }}>{EMODNET_BATHYMETRY.label}</div>
          <div style={{ marginTop: 7, fontFamily: "'DM Sans', sans-serif", fontSize: 14 }}>{EMODNET_BATHYMETRY.product}</div>
          <div style={{ ...mono, marginTop: 9, color: "rgba(255,255,255,.52)", lineHeight: 1.55 }}>AUTHORITY · {EMODNET_BATHYMETRY.authority}<br />LAYER · {EMODNET_BATHYMETRY.layer}<br />CHECKED · {EMODNET_BATHYMETRY.checkedAt}</div>
          <p style={{ margin: "11px 0 0", fontFamily: "'DM Sans', sans-serif", fontSize: 12, lineHeight: 1.5, color: "rgba(255,255,255,.62)" }}>{EMODNET_BATHYMETRY.limitation}</p>
          <a href={EMODNET_BATHYMETRY.docs} target="_blank" rel="noreferrer" style={{ ...mono, display: "inline-block", marginTop: 12, color: "#fff" }}>OFFICIAL SERVICE DOCS ↗</a>
        </div>
      </section>
    </main>
  );
}
