import { useEffect, useMemo, useRef, useState } from "react";
import maplibregl, { type Map as MapLibreMap } from "maplibre-gl";
import { Link, useParams } from "react-router-dom";
import { ECOSYSTEM_PROOFS, type EcosystemProof } from "./ecosystemProofs";
import { SourceProvenancePanel } from "../../components/shared/SourceProvenancePanel";
import "maplibre-gl/dist/maplibre-gl.css";
import "./PlanetProof.css";

const MAP_STYLE = "https://tiles.openfreemap.org/styles/liberty";

type MapStatus = "BOOTING" | "READY" | "DEGRADED";

function ProofMap({ proof }: { proof: EcosystemProof }) {
  const container = useRef<HTMLDivElement | null>(null);
  const map = useRef<MapLibreMap | null>(null);
  const [status, setStatus] = useState<MapStatus>("BOOTING");
  const [active, setActive] = useState<Record<string, boolean>>(() => Object.fromEntries(proof.mapLayers.map((layer) => [layer.id, true])));

  const bounds = useMemo(() => {
    const coords = proof.mapLayers.flatMap((layer) => {
      if (layer.geometry.type === "LineString") return layer.geometry.coordinates;
      if (layer.geometry.type === "Polygon") return layer.geometry.coordinates.flat();
      return [];
    });
    if (!coords.length) return null;
    const lons = coords.map(([lon]) => lon);
    const lats = coords.map(([, lat]) => lat);
    return [[Math.min(...lons), Math.min(...lats)], [Math.max(...lons), Math.max(...lats)]] as [[number, number], [number, number]];
  }, [proof.mapLayers]);

  useEffect(() => {
    if (!container.current) return;
    setStatus("BOOTING");
    let alive = true;
    const m = new maplibregl.Map({
      container: container.current,
      style: MAP_STYLE,
      center: proof.mapCenter,
      zoom: proof.mapZoom,
      attributionControl: false,
    });
    map.current = m;
    m.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");
    m.on("load", () => {
      if (!alive) return;
      for (const layer of proof.mapLayers) {
        const id = `proof-${layer.id}`;
        if (!m.getSource(id)) {
          m.addSource(id, { type: "geojson", data: { type: "Feature", properties: {}, geometry: layer.geometry } });
          m.addLayer({
            id,
            type: layer.geometry.type === "LineString" ? "line" : "fill",
            source: id,
            paint: layer.geometry.type === "LineString"
              ? { "line-color": layer.color, "line-width": 3, "line-opacity": 0.9 }
              : { "fill-color": layer.color, "fill-opacity": 0.14, "fill-outline-color": layer.color },
          });
        }
      }
      setStatus((current) => current === "DEGRADED" ? current : "READY");
    });
    m.on("error", (event) => {
      const message = String((event as { error?: Error }).error?.message ?? "");
      if (message && !message.includes("glyph")) setStatus("DEGRADED");
    });
    return () => {
      alive = false;
      map.current = null;
      m.remove();
    };
  // The proof identity owns map construction; visibility is reconciled below.
  }, [proof.slug]);

  useEffect(() => {
    const m = map.current;
    if (!m) return;
    for (const layer of proof.mapLayers) {
      const id = `proof-${layer.id}`;
      if (!m.getLayer(id)) continue;
      m.setLayoutProperty(id, "visibility", active[layer.id] ? "visible" : "none");
    }
  }, [active, proof.mapLayers]);

  useEffect(() => {
    if (!bounds || !map.current) return;
    map.current.fitBounds(bounds, { padding: 40, maxZoom: proof.mapZoom + 2, duration: 0 });
  }, [bounds, proof.mapZoom]);

  return (
    <section className="planet-proof-map-shell" aria-label={`${proof.title} map proof`}>
      <div className="planet-proof-map-toolbar">
        <span className={`planet-proof-map-state state-${status.toLowerCase()}`}>{status}</span>
        {proof.mapLayers.map((layer) => (
          <label key={layer.id} className="planet-proof-layer-toggle">
            <input
              type="checkbox"
              checked={active[layer.id] ?? false}
              onChange={(event) => setActive((current) => ({ ...current, [layer.id]: event.target.checked }))}
            />
            <span aria-hidden="true" className="planet-proof-layer-dot" style={{ background: layer.color }} />
            {layer.label}
          </label>
        ))}
      </div>
      <div ref={container} className="planet-proof-map" />
      {status === "DEGRADED" ? <p className="planet-proof-map-fallback">Map basemap is degraded. The bounded proof data below remains available.</p> : null}
    </section>
  );
}

export default function PlanetProof() {
  const { slug = "" } = useParams();
  const proof = ECOSYSTEM_PROOFS.find((item) => item.slug === slug);

  if (!proof) {
    return (
      <main className="planet-proof planet-proof-missing">
        <p className="planet-proof-kicker">PLANET PROOF</p>
        <h1>Proof not found.</h1>
        <Link to="/">Return to 4PLANET</Link>
      </main>
    );
  }

  return (
    <main className="planet-proof">
      <header className="planet-proof-hero">
        <p className="planet-proof-kicker">PLANET PROOF / {proof.status}</p>
        <h1>{proof.title}</h1>
        <p className="planet-proof-deck">{proof.deck}</p>
        <div className="planet-proof-meta">
          <span>{proof.regionLabel}</span>
          <span>{proof.timeLabel}</span>
          <span>{proof.confidenceLabel}</span>
        </div>
      </header>

      <ProofMap proof={proof} />

      <section className="planet-proof-grid" aria-label="Planet proof intelligence">
        {proof.sections.map((section) => (
          <article key={section.id} className="planet-proof-card">
            <p className="planet-proof-card-kicker">{section.kicker}</p>
            <h2>{section.title}</h2>
            <p>{section.body}</p>
            {section.items?.length ? (
              <ul>{section.items.map((item) => <li key={item}>{item}</li>)}</ul>
            ) : null}
          </article>
        ))}
      </section>

      <section className="planet-proof-sources">
        <div>
          <p className="planet-proof-card-kicker">SOURCE / PROVENANCE</p>
          <h2>What this proof is actually built from.</h2>
        </div>
        <SourceProvenancePanel sources={proof.sources} />
      </section>

      <footer className="planet-proof-actions">
        {proof.actions.map((action) => (
          action.to.startsWith("http") ? (
            <a key={action.label} href={action.to} target="_blank" rel="noreferrer">{action.label}</a>
          ) : (
            <Link key={action.label} to={action.to}>{action.label}</Link>
          )
        ))}
      </footer>
    </main>
  );
}
