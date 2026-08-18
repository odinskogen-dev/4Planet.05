import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import {
  EMODNET_BATHYMETRY,
  SANDBOX_RASTERS,
  sandboxRasterSource,
  type SandboxRasterDescriptor,
} from "@/sandbox/atlasDataSources";

const mono: React.CSSProperties = {
  fontFamily: "'Fragment Mono', ui-monospace, monospace",
  fontSize: 10,
  letterSpacing: ".11em",
};

type MapState = "LOADING" | "MAP_GREEN" | "SOURCE_ERROR" | "WEBGL_ERROR";

export default function AtlasDataSandbox() {
  const container = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const activeRef = useRef<SandboxRasterDescriptor>(EMODNET_BATHYMETRY);
  const sourceErrors = useRef(new Set<string>());
  const [active, setActive] = useState<SandboxRasterDescriptor>(EMODNET_BATHYMETRY);
  const [state, setState] = useState<MapState>("LOADING");
  const [detail, setDetail] = useState("Initialising MapLibre and EMODnet WMS…");

  const activate = (descriptor: SandboxRasterDescriptor) => {
    const map = mapRef.current;
    activeRef.current = descriptor;
    setActive(descriptor);
    setState("LOADING");
    setDetail(`Loading ${descriptor.product} from ${descriptor.authority}.`);
    if (!map) return;

    for (const candidate of SANDBOX_RASTERS) {
      if (map.getLayer(candidate.id)) {
        map.setLayoutProperty(candidate.id, "visibility", candidate.id === descriptor.id ? "visible" : "none");
      }
    }

    if (sourceErrors.current.has(descriptor.id)) {
      setState("SOURCE_ERROR");
      setDetail("The selected source previously failed in this session. Failure remains explicit rather than being rendered as zero data.");
      return;
    }

    const source = map.getSource(descriptor.id) as maplibregl.RasterTileSource | undefined;
    if (source?.loaded()) {
      setState("MAP_GREEN");
      setDetail(`${descriptor.product} is loaded through the sandbox MapLibre source.`);
    }
  };

  useEffect(() => {
    document.title = "ATLAS DATA SANDBOX · 4PLANET";
    const robots = document.createElement("meta");
    robots.name = "robots";
    robots.content = "noindex,nofollow,noarchive";
    document.head.appendChild(robots);

    if (!container.current || mapRef.current) return () => robots.remove();

    let alive = true;
    try {
      const map = new maplibregl.Map({
        container: container.current,
        style: "https://tiles.openfreemap.org/styles/liberty",
        center: [8, 57],
        zoom: 3.4,
        attributionControl: { compact: true },
      });
      mapRef.current = map;

      map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), "bottom-right");

      map.on("load", () => {
        if (!alive) return;
        const before = map.getStyle().layers?.find((layer) => layer.type === "symbol")?.id;
        for (const descriptor of SANDBOX_RASTERS) {
          map.addSource(descriptor.id, sandboxRasterSource(descriptor) as maplibregl.RasterSourceSpecification);
          map.addLayer({
            id: descriptor.id,
            type: "raster",
            source: descriptor.id,
            layout: { visibility: descriptor.id === activeRef.current.id ? "visible" : "none" },
            paint: { "raster-opacity": descriptor.opacity, "raster-fade-duration": 120 },
          }, before);
        }
        setDetail("Map loaded. Waiting for first EMODnet raster tile.");
      });

      map.on("sourcedata", (event) => {
        if (!alive || event.sourceId !== activeRef.current.id || !event.isSourceLoaded || sourceErrors.current.has(event.sourceId)) return;
        setState("MAP_GREEN");
        setDetail(`${activeRef.current.product} is loaded through the sandbox MapLibre source.`);
      });

      map.on("error", (event) => {
        if (!alive) return;
        const sourceId = (event as unknown as { sourceId?: string }).sourceId;
        if (sourceId && SANDBOX_RASTERS.some((candidate) => candidate.id === sourceId)) {
          sourceErrors.current.add(sourceId);
          if (sourceId === activeRef.current.id) {
            setState("SOURCE_ERROR");
            setDetail("The selected EMODnet raster request failed. Source failure is preserved as failure, never converted to zero data.");
          }
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

      <section style={{ position: "absolute", zIndex: 3, left: 18, top: 18, width: "min(430px, calc(100vw - 36px))", maxHeight: "calc(100vh - 36px)", overflowY: "auto", background: "rgba(8,8,8,.92)", border: "1px solid rgba(255,255,255,.22)", padding: "18px 18px 16px" }}>
        <div style={{ ...mono, color: "rgba(255,255,255,.55)" }}>4PLANET_ · INTERNAL · DO NOT MERGE</div>
        <h1 style={{ margin: "13px 0 0", fontFamily: "'Instrument Sans', sans-serif", fontWeight: 520, fontSize: "clamp(25px,4vw,42px)", lineHeight: .95, letterSpacing: "-.045em" }}>ATLAS DATA SANDBOX</h1>
        <div style={{ ...mono, marginTop: 18, color: state === "MAP_GREEN" ? "#3AE86F" : state === "LOADING" ? "#fff" : "#FF4D22" }}>{state}</div>
        <p style={{ margin: "9px 0 0", fontFamily: "'DM Sans', sans-serif", fontSize: 13, lineHeight: 1.55, color: "rgba(255,255,255,.75)" }}>{detail}</p>

        <div aria-label="Sandbox data layers" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginTop: 16 }}>
          {SANDBOX_RASTERS.map((descriptor) => {
            const selected = descriptor.id === active.id;
            return (
              <button
                key={descriptor.id}
                type="button"
                aria-pressed={selected}
                onClick={() => activate(descriptor)}
                style={{ ...mono, minHeight: 44, border: `1px solid ${selected ? "#fff" : "rgba(255,255,255,.22)"}`, background: selected ? "#fff" : "rgba(0,0,0,.25)", color: selected ? "#080808" : "#fff", padding: "9px 10px", textAlign: "left", cursor: "pointer" }}
              >
                {descriptor.sourceId === "emodnet-bathymetry" ? "BATHYMETRY" : "SEABED HABITATS"}
              </button>
            );
          })}
        </div>

        <div style={{ marginTop: 18, paddingTop: 15, borderTop: "1px solid rgba(255,255,255,.18)" }}>
          <div style={{ ...mono, color: "#2E2EFF" }}>{active.label}</div>
          <div style={{ marginTop: 7, fontFamily: "'DM Sans', sans-serif", fontSize: 14 }}>{active.product}</div>
          <div style={{ ...mono, marginTop: 9, color: "rgba(255,255,255,.52)", lineHeight: 1.55 }}>AUTHORITY · {active.authority}<br />LAYER · {active.layer}<br />CHECKED · {active.checkedAt}</div>
          <p style={{ margin: "11px 0 0", fontFamily: "'DM Sans', sans-serif", fontSize: 12, lineHeight: 1.5, color: "rgba(255,255,255,.62)" }}>{active.limitation}</p>
          <a href={active.docs} target="_blank" rel="noreferrer" style={{ ...mono, display: "inline-block", marginTop: 12, color: "#fff" }}>OFFICIAL SERVICE DOCS ↗</a>
        </div>
      </section>
    </main>
  );
}
