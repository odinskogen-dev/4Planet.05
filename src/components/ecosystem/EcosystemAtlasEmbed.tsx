import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import "maplibre-gl/dist/maplibre-gl.css";

const VECTOR_STYLE = "https://tiles.openfreemap.org/styles/dark";
const EMPTY_CORRIDOR: [number, number][] = [];

type MapState = "IDLE" | "LOADING" | "READY" | "UNAVAILABLE";

type Props = {
  title: string;
  subtitle: string;
  atlasHref: string;
  accent: string;
  centre: [number, number];
  zoom: number;
  region: [number, number][];
  corridor?: [number, number][];
  boundaryNote: string;
};

export function EcosystemAtlasEmbed({
  title,
  subtitle,
  atlasHref,
  accent,
  centre,
  zoom,
  region,
  corridor = EMPTY_CORRIDOR,
  boundaryNote,
}: Props) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const mapRef = useRef<HTMLDivElement | null>(null);
  const [armed, setArmed] = useState(false);
  const [state, setState] = useState<MapState>("IDLE");
  const centreLng = centre[0];
  const centreLat = centre[1];

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
      { rootMargin: "420px 0px" },
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, [armed]);

  useEffect(() => {
    if (!armed || !mapRef.current) return;
    let alive = true;
    let map: import("maplibre-gl").Map | null = null;
    setState("LOADING");

    const boot = async () => {
      try {
        const canvas = document.createElement("canvas");
        if (!canvas.getContext("webgl2") && !canvas.getContext("webgl")) {
          if (alive) setState("UNAVAILABLE");
          return;
        }
        const maplibre = await import("maplibre-gl");
        if (!alive || !mapRef.current) return;
        map = new maplibre.Map({
          container: mapRef.current,
          style: VECTOR_STYLE,
          center: [centreLng, centreLat],
          zoom,
          minZoom: 3,
          maxZoom: 9,
          attributionControl: false,
          dragRotate: false,
          pitchWithRotate: false,
        });
        map.addControl(new maplibre.NavigationControl({ showCompass: false }), "top-right");
        map.addControl(new maplibre.AttributionControl({ compact: true }), "bottom-right");

        map.on("load", () => {
          if (!map || !alive) return;
          const first = region[0];
          const last = region[region.length - 1];
          const isClosed = Boolean(first && last && first[0] === last[0] && first[1] === last[1]);
          const closedRegion = region.length && !isClosed ? [...region, region[0]] : region;
          const regionGeoJSON: GeoJSON.FeatureCollection<GeoJSON.Polygon> = {
            type: "FeatureCollection",
            features: [{
              type: "Feature",
              properties: { kind: "4PLANET_NARRATIVE_FOCUS" },
              geometry: { type: "Polygon", coordinates: [closedRegion] },
            }],
          };
          map.addSource("ecosystem-focus", { type: "geojson", data: regionGeoJSON });
          map.addLayer({
            id: "ecosystem-focus-fill",
            type: "fill",
            source: "ecosystem-focus",
            paint: { "fill-color": accent, "fill-opacity": 0.11 },
          });
          map.addLayer({
            id: "ecosystem-focus-glow",
            type: "line",
            source: "ecosystem-focus",
            paint: { "line-color": accent, "line-width": 9, "line-opacity": 0.22, "line-blur": 8 },
          });
          map.addLayer({
            id: "ecosystem-focus-line",
            type: "line",
            source: "ecosystem-focus",
            paint: { "line-color": accent, "line-width": 2.6, "line-opacity": 0.95 },
          });

          if (corridor.length > 1) {
            const corridorGeoJSON: GeoJSON.FeatureCollection<GeoJSON.LineString> = {
              type: "FeatureCollection",
              features: [{
                type: "Feature",
                properties: { kind: "ILLUSTRATIVE_SURVEY_CORRIDOR" },
                geometry: { type: "LineString", coordinates: corridor },
              }],
            };
            map.addSource("survey-corridor", { type: "geojson", data: corridorGeoJSON });
            map.addLayer({
              id: "survey-corridor-halo",
              type: "line",
              source: "survey-corridor",
              paint: { "line-color": "#ffffff", "line-width": 8, "line-opacity": 0.12, "line-blur": 7 },
            });
            map.addLayer({
              id: "survey-corridor-line",
              type: "line",
              source: "survey-corridor",
              paint: { "line-color": "#ffffff", "line-width": 1.5, "line-opacity": 0.92, "line-dasharray": [2, 2.2] },
            });
          }
          setState("READY");
        });

        map.on("error", () => {
          if (!alive || map?.loaded()) return;
          setState("UNAVAILABLE");
        });
      } catch {
        if (alive) setState("UNAVAILABLE");
      }
    };

    void boot();
    return () => {
      alive = false;
      map?.remove();
    };
  }, [accent, armed, centreLat, centreLng, corridor, region, zoom]);

  return (
    <section ref={sectionRef} className="eco-atlas-embed" aria-labelledby="eco-atlas-title">
      <div className="eco-atlas-embed__copy">
        <span className="eco-mono">ATLAS_ · WHERE</span>
        <h2 id="eco-atlas-title">{title}</h2>
        <p>{subtitle}</p>
        <div className="eco-atlas-embed__truth eco-mono">{boundaryNote}</div>
        <Link to={atlasHref}>OPEN IN FULL ATLAS →</Link>
      </div>
      <div className="eco-atlas-embed__map" aria-busy={state === "LOADING"}>
        <div ref={mapRef} className="eco-atlas-embed__canvas" aria-label={`${title} Atlas map`} />
        {state !== "READY" && (
          <div className="eco-atlas-embed__status eco-mono">
            {state === "IDLE" && "ATLAS · LOADS ON APPROACH"}
            {state === "LOADING" && "ATLAS · LOADING"}
            {state === "UNAVAILABLE" && "ATLAS VIEW UNAVAILABLE · BOUNDARY NOTE PRESERVED"}
          </div>
        )}
        <div className="eco-atlas-embed__legend eco-mono">
          <span><i className="is-region" />4PLANET NARRATIVE FOCUS</span>
          {corridor.length > 1 && <span><i className="is-route" />ILLUSTRATIVE SURVEY CORRIDOR</span>}
        </div>
      </div>
    </section>
  );
}
