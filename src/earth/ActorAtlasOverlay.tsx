import { type CSSProperties, useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ACTORS, actorById, type ActorGeographyRole } from "@/data/actors";
import { T } from "@/styles/tokens";
import "@/styles/actors.css";

const SOURCE_ID = "p17-actors";
const LAYER_IDS = [
  "p17-actor-operating",
  "p17-actor-programme",
  "p17-actor-partner",
  "p17-actor-project",
  "p17-actor-hq",
  "p17-actor-selected",
] as const;

const mono: CSSProperties = {
  fontFamily: T.mono,
  fontSize: 9.5,
  letterSpacing: ".11em",
  textTransform: "uppercase",
};

const ROLE_COLOURS: Record<ActorGeographyRole, string> = {
  HEADQUARTERS_REFERENCE: "#F3C74B",
  OPERATING_GEOGRAPHY: "#2E2EFF",
  PROGRAMME_GEOGRAPHY: "#3AE86F",
  DOCUMENTED_PROJECT_SITE: "#FFFFFF",
  PARTNER_GEOGRAPHY: "#FF4D22",
};

const getAtlasMap = () =>
  (window as Window & { __4planet_map?: any }).__4planet_map as any | undefined;

function atlasHref(actorId: string, geoId: string, longitude: number, latitude: number, zoom: number) {
  const params = new URLSearchParams({
    mode: "actors",
    entity: actorId,
    actorGeo: geoId,
    c: `${longitude},${latitude}`,
    z: String(zoom),
  });
  return `/atlas?${params.toString()}`;
}

function actorFeatureCollection() {
  return {
    type: "FeatureCollection",
    features: ACTORS.flatMap((actor) =>
      actor.geographies
        .filter((geo) => geo.sensitivity !== "RESTRICTED" || geo.precision === "REGION")
        .map((geo) => ({
          type: "Feature",
          id: geo.id,
          geometry: { type: "Point", coordinates: [geo.longitude, geo.latitude] },
          properties: {
            actorId: actor.id,
            actorSlug: actor.slug,
            actorName: actor.name,
            actorType: actor.actorTypeLabel,
            tagline: actor.tagline,
            geoId: geo.id,
            geoLabel: geo.label,
            role: geo.role,
            precision: geo.precision,
            sensitivity: geo.sensitivity,
            sourceIds: geo.sourceIds.join(","),
            colour: ROLE_COLOURS[geo.role],
          },
        })),
    ),
  };
}

function removeActorLayers(map: any) {
  [...LAYER_IDS].reverse().forEach((id) => {
    if (map.getLayer(id)) map.removeLayer(id);
  });
  if (map.getSource(SOURCE_ID)) map.removeSource(SOURCE_ID);
}

function addRoleLayer(map: any, id: string, role: ActorGeographyRole, radius: number, opacity = 0.86) {
  map.addLayer({
    id,
    type: "circle",
    source: SOURCE_ID,
    filter: ["==", ["get", "role"], role],
    paint: {
      "circle-radius": ["interpolate", ["linear"], ["zoom"], 1, Math.max(3, radius - 2), 8, radius + 1],
      "circle-color": ["get", "colour"],
      "circle-opacity": opacity,
      "circle-stroke-width": role === "DOCUMENTED_PROJECT_SITE" ? 2 : 1,
      "circle-stroke-color": role === "DOCUMENTED_PROJECT_SITE" ? "#2E2EFF" : "#FFFFFF",
      "circle-stroke-opacity": 0.92,
    },
  });
}

export function ActorAtlasOverlay() {
  const location = useLocation();
  const navigate = useNavigate();
  const params = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const actorMode = location.pathname === "/atlas" && params.get("mode") === "actors";
  const selected = actorById(params.get("entity")) ?? ACTORS[0];
  const selectedGeoId = params.get("actorGeo") ?? selected.geographies[0]?.id;
  const [layerState, setLayerState] = useState<"LOADING" | "READY" | "UNAVAILABLE">("LOADING");

  useEffect(() => {
    if (!actorMode) return undefined;
    let alive = true;
    let retry: number | undefined;
    let installedMap: any;
    const clickHandlers = new Map<string, (event: any) => void>();
    const enterHandlers = new Map<string, () => void>();
    const leaveHandlers = new Map<string, () => void>();

    const install = () => {
      if (!alive) return;
      const map = getAtlasMap();
      if (!map) {
        retry = window.setTimeout(install, 120);
        return;
      }
      installedMap = map;
      if (!map.isStyleLoaded()) {
        retry = window.setTimeout(install, 120);
        return;
      }

      try {
        removeActorLayers(map);
        map.addSource(SOURCE_ID, { type: "geojson", data: actorFeatureCollection() });
        addRoleLayer(map, "p17-actor-operating", "OPERATING_GEOGRAPHY", 8, 0.42);
        addRoleLayer(map, "p17-actor-programme", "PROGRAMME_GEOGRAPHY", 7, 0.82);
        addRoleLayer(map, "p17-actor-partner", "PARTNER_GEOGRAPHY", 7, 0.82);
        addRoleLayer(map, "p17-actor-project", "DOCUMENTED_PROJECT_SITE", 6, 0.94);
        addRoleLayer(map, "p17-actor-hq", "HEADQUARTERS_REFERENCE", 5, 0.9);
        map.addLayer({
          id: "p17-actor-selected",
          type: "circle",
          source: SOURCE_ID,
          filter: ["==", ["get", "actorId"], selected.id],
          paint: {
            "circle-radius": ["interpolate", ["linear"], ["zoom"], 1, 8, 8, 13],
            "circle-color": "rgba(0,0,0,0)",
            "circle-stroke-width": 3,
            "circle-stroke-color": "#FFFFFF",
            "circle-stroke-opacity": 1,
          },
        });

        const interactiveLayers = LAYER_IDS.filter((id) => id !== "p17-actor-selected");
        interactiveLayers.forEach((layerId) => {
          const onClick = (event: any) => {
            const feature = event.features?.[0];
            if (!feature) return;
            event.originalEvent?.preventDefault?.();
            event.originalEvent?.stopPropagation?.();
            const properties = feature.properties ?? {};
            const coordinates = feature.geometry?.coordinates ?? [0, 0];
            const actor = actorById(properties.actorId);
            const geo = actor?.geographies.find((item) => item.id === properties.geoId);
            if (!actor || !geo) return;
            map.flyTo({ center: coordinates, zoom: geo.zoom, duration: 900 });
            navigate(atlasHref(actor.id, geo.id, geo.longitude, geo.latitude, geo.zoom), { replace: true });
          };
          const onEnter = () => {
            map.getCanvas().style.cursor = "pointer";
          };
          const onLeave = () => {
            map.getCanvas().style.cursor = "";
          };
          clickHandlers.set(layerId, onClick);
          enterHandlers.set(layerId, onEnter);
          leaveHandlers.set(layerId, onLeave);
          map.on("click", layerId, onClick);
          map.on("mouseenter", layerId, onEnter);
          map.on("mouseleave", layerId, onLeave);
        });

        const selectedGeo = selected.geographies.find((item) => item.id === selectedGeoId) ?? selected.geographies[0];
        if (selectedGeo) {
          map.flyTo({ center: [selectedGeo.longitude, selectedGeo.latitude], zoom: selectedGeo.zoom, duration: 700 });
        }
        setLayerState("READY");
      } catch {
        setLayerState("UNAVAILABLE");
      }
    };

    install();
    return () => {
      alive = false;
      if (retry) window.clearTimeout(retry);
      if (!installedMap) return;
      clickHandlers.forEach((handler, layerId) => installedMap.off("click", layerId, handler));
      enterHandlers.forEach((handler, layerId) => installedMap.off("mouseenter", layerId, handler));
      leaveHandlers.forEach((handler, layerId) => installedMap.off("mouseleave", layerId, handler));
      try {
        removeActorLayers(installedMap);
      } catch {
        // Style transitions can remove sources before React cleanup. No state is persisted.
      }
    };
  }, [actorMode, navigate, selected.id, selectedGeoId]);

  if (!actorMode) return null;

  return (
    <aside
      className="actor-atlas-overlay"
      aria-label="Actor Mode private beta"
      data-p17-native-actor-layer={layerState.toLowerCase()}
    >
      <header>
        <div style={{ ...mono, color: "#3AE86F" }}>ATLAS_ · ORGANISATIONS_</div>
        <h1>Who is working where?</h1>
        <p>
          Native source-aware organisation references inside the existing MapLibre world. Headquarters,
          operating regions, programmes, partner geographies and project sites remain distinct.
        </p>
        <Link to="/atlas" className="actor-atlas-close">
          CLOSE
        </Link>
        <div className="actor-atlas-legend" aria-label="Actor geography legend">
          {(Object.entries(ROLE_COLOURS) as [ActorGeographyRole, string][]).map(([role, colour]) => (
            <div key={role}>
              <i style={{ background: colour }} />
              <span>{role.replaceAll("_", " ")}</span>
            </div>
          ))}
        </div>
        <p>
          Layer state: <strong>{layerState}</strong>. Generalised references are not exact field sites. Restricted
          locations are never emitted as precise points.
        </p>
      </header>

      <nav className="actor-atlas-list" aria-label="Private beta organisations">
        {ACTORS.map((actor) => {
          const geo = actor.geographies[0];
          return geo ? (
            <Link
              key={actor.id}
              to={atlasHref(actor.id, geo.id, geo.longitude, geo.latitude, geo.zoom)}
              aria-current={actor.id === selected.id}
            >
              <strong>{actor.name}</strong>
              <span>{actor.actorTypeLabel} · {actor.primaryGeography}</span>
            </Link>
          ) : null;
        })}
      </nav>

      <section>
        <div style={{ ...mono, color: "#3AE86F" }}>{selected.id} · INDEPENDENT PROFILE</div>
        <h2>{selected.name}</h2>
        <p>{selected.tagline}</p>
        <div className="actor-atlas-geo">
          {selected.geographies.map((geo) => (
            <Link
              key={geo.id}
              to={atlasHref(selected.id, geo.id, geo.longitude, geo.latitude, geo.zoom)}
              aria-current={selectedGeoId === geo.id}
              style={selectedGeoId === geo.id ? { borderColor: ROLE_COLOURS[geo.role] } : undefined}
            >
              <span style={{ color: ROLE_COLOURS[geo.role] }}>{geo.role.replaceAll("_", " ")}</span>
              <strong>{geo.label}</strong>
              <small>{geo.precision.replaceAll("_", " ")} · {geo.sensitivity}</small>
            </Link>
          ))}
        </div>
        <div className="actor-profile-actions">
          <Link className="actor-button actor-button-primary" to={`/actors/${selected.slug}`}>
            OPEN PROFILE →
          </Link>
          <Link className="actor-button" to="/actors">
            ALL ORGANISATIONS →
          </Link>
        </div>
      </section>
    </aside>
  );
}
