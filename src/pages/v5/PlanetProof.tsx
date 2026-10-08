import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import * as maplibregl from "maplibre-gl";
import maplibreWorkerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url";
import "maplibre-gl/dist/maplibre-gl.css";
import { planetProofBySlug, type PlanetProof, type ProofMapLayer, type ProofSection } from "@/planet/proofs/planetProofs";
import "@/styles/human-first-public.css";

const VECTOR_STYLE = "https://tiles.openfreemap.org/styles/liberty";

function sourceMap(proof: PlanetProof) {
  return Object.fromEntries(proof.sources.map((source) => [source.id, source]));
}

function EvidenceMap({ proof }: { proof: PlanetProof }) {
  const box = useRef<HTMLDivElement | null>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const [active, setActive] = useState<Record<string, boolean>>(() => Object.fromEntries(proof.mapLayers.map((layer, i) => [layer.id, i === 0])));
  const [degraded, setDegraded] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!box.current) return;
    let alive = true;
    maplibregl.setWorkerUrl(maplibreWorkerUrl);
    const m = new maplibregl.Map({
      container: box.current,
      style: VECTOR_STYLE,
      center: proof.center,
      zoom: proof.zoom,
    });
    map.current = m;
    m.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");
    m.on("load", () => {
      if (!alive) return;
      setReady(true);
      m.fitBounds(proof.bounds, { padding: 28, duration: 0, maxZoom: proof.zoom + 1.2 });
      for (const layer of proof.mapLayers) {
        try {
          m.addSource(`proof-${layer.id}`, {
            type: "raster",
            tiles: [layer.tileUrl],
            tileSize: 256,
            attribution: proof.sources.find((source) => source.id === layer.sourceId)?.authority ?? "Source",
          });
          m.addLayer({
            id: `proof-${layer.id}`,
            type: "raster",
            source: `proof-${layer.id}`,
            paint: { "raster-opacity": layer.opacity },
            layout: { visibility: active[layer.id] ? "visible" : "none" },
          });
        } catch {
          setDegraded(true);
        }
      }
    });
    m.on("error", (event) => {
      const message = String(event.error?.message ?? "");
      if (message && !message.includes("glyph")) setDegraded(true);
    });
    return () => {
      alive = false;
      map.current = null;
      m.remove();
    };
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

  const toggle = (layer: ProofMapLayer) => setActive((current) => ({ ...current, [layer.id]: !current[layer.id] }));

  return (
    <section className="proof-map" aria-label="Explore the fjord map">
      <div className="editorial-wrap proof-map-head">
        <div className="editorial-kicker">Explore the place</div>
        <h2 style={{ margin: "12px 0 0", fontSize: "clamp(34px,5vw,64px)", lineHeight: 1, letterSpacing: "-.04em", fontWeight: 520 }}>
          See the fjord. Change the layers.
        </h2>
        <p className="editorial-note" style={{ marginTop: 16 }}>
          Use the map to move between depth, ecological status and mapped physical interventions.
        </p>
        {degraded && <p className="editorial-note" style={{ marginTop: 10 }}>Some map layers are temporarily unavailable.</p>}
      </div>
      <div ref={box} className="proof-map-canvas" />
      <div role="status" aria-live="polite" className="editorial-note" style={{ margin: "10px 0 0" }}>
        {ready ? "MAP · READY" : "MAP · LOADING"}
      </div>
      {proof.mapLayers.length > 0 && (
        <div className="proof-map-controls">
          {proof.mapLayers.map((layer) => (
            <button
              key={layer.id}
              type="button"
              className="proof-map-control"
              data-active={active[layer.id] ? "true" : "false"}
              onClick={() => toggle(layer)}
            >
              <strong>{layer.label}</strong>
              <span>{layer.description}</span>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}

function StorySection({ section, proof, label }: { section: ProofSection; proof: PlanetProof; label: string }) {
  const sources = useMemo(() => sourceMap(proof), [proof]);
  return (
    <section className="proof-story">
      <div className="editorial-kicker">{label}</div>
      <div>
        <h2>{section.headline}</h2>
        <p>{section.summary}</p>
        <div className="proof-source-links">
          {section.sourceIds.map((id) => {
            const source = sources[id];
            return source ? <a key={id} href={source.url} target="_blank" rel="noreferrer">{source.authority} ↗</a> : null;
          })}
        </div>
      </div>
    </section>
  );
}

function Sources({ proof }: { proof: PlanetProof }) {
  const visible = proof.sources.slice(0, 3);
  const more = proof.sources.slice(3);
  const sourceLink = (source: PlanetProof["sources"][number]) => (
    <a key={source.id} className="editorial-source" href={source.url} target="_blank" rel="noreferrer">
      <strong>{source.authority}</strong>
      <span>{source.label} ↗</span>
    </a>
  );
  return (
    <section className="editorial-section">
      <div className="editorial-kicker">Sources</div>
      <div className="editorial-list">{visible.map(sourceLink)}</div>
      {more.length > 0 && (
        <details style={{ marginTop: 18, borderTop: "1px solid #D9D9D9", paddingTop: 16 }}>
          <summary style={{ cursor: "pointer", fontSize: 14 }}>See all {proof.sources.length} sources</summary>
          <div className="editorial-list" style={{ marginTop: 16 }}>{more.map(sourceLink)}</div>
        </details>
      )}
    </section>
  );
}

export function PlanetProofPage({ slug }: { slug: string }) {
  const proof = planetProofBySlug(slug);
  if (!proof) return null;

  const isOslofjord = proof.slug === "oslofjorden";
  const displayName = isOslofjord ? "Oslofjorden" : proof.name;
  const byId = Object.fromEntries(proof.sections.map((section) => [section.id, section])) as Record<string, ProofSection>;
  const what = byId.WHAT_IS_HAPPENING ?? proof.sections[0];
  const why = byId.WHY ?? proof.sections[1];
  const changed = byId.WHAT_CHANGED ?? proof.sections[2];
  const action = byId.WHAT_CAN_BE_DONE ?? proof.sections[3];

  return (
    <main className="editorial-page" style={{ background: "#FFFFFF" }}>
      <nav className="proof-nav">
        <Link to="/" style={{ fontWeight: 700, letterSpacing: "-.03em" }}>4PLANET_</Link>
        <div style={{ display: "flex", gap: 20, alignItems: "center", fontSize: 12, letterSpacing: ".1em" }}>
          <Link to="/living-systems">LIVING SYSTEMS</Link>
          <Link to="/atlas">ATLAS</Link>
        </div>
      </nav>

      <div className="editorial-wrap">
        <header className="editorial-hero">
          <div className="editorial-kicker">{isOslofjord ? "LIVING SYSTEMS / NORWAY" : "LIVING SYSTEMS"}</div>
          <h1>{displayName}</h1>
          <p className="editorial-deck">
            {isOslofjord
              ? "A fjord under pressure — and a place where change can be measured."
              : proof.oneLine}
          </p>
          {isOslofjord && (
            <p className="editorial-copy">
              This first view focuses on Bunnefjorden, the deep inner basin where oxygen conditions and water renewal have been closely monitored.
            </p>
          )}
        </header>
      </div>

      <EvidenceMap proof={proof} />

      <div className="editorial-wrap">
        {what && <StorySection section={what} proof={proof} label="What’s happening" />}
        {why && <StorySection section={why} proof={proof} label="Why" />}

        {changed && (
          <section className="proof-story">
            <div className="editorial-kicker">What changed</div>
            <div>
              <h2>{changed.headline}</h2>
              <p>{changed.summary}</p>
              {isOslofjord && (
                <>
                  <div className="proof-stat">82%</div>
                  <div className="proof-stat-label">
                    NIVA reported an 82% reduction in the area with anoxic bottom water immediately before deep-water renewal after the wastewater outfall was lowered.
                  </div>
                </>
              )}
              <div className="proof-source-links">
                {changed.sourceIds.map((id) => {
                  const source = sourceMap(proof)[id];
                  return source ? <a key={id} href={source.url} target="_blank" rel="noreferrer">{source.authority} ↗</a> : null;
                })}
              </div>
            </div>
          </section>
        )}

        {action && <StorySection section={action} proof={proof} label="What can be done" />}

        <section className="editorial-section editorial-split">
          <div className="editorial-kicker">Read this correctly</div>
          <div>
            <p className="editorial-copy" style={{ marginTop: 0 }}>
              {isOslofjord
                ? "The reported 82% change concerns anoxic bottom-water area in Bunnefjorden before deep-water renewal. It does not mean the whole Oslofjord ecosystem has been restored."
                : proof.truthBoundary}
            </p>
          </div>
        </section>

        <Sources proof={proof} />
      </div>
    </main>
  );
}
