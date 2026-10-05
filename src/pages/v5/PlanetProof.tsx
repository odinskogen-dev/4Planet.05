import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { Link } from "react-router-dom";
import * as maplibregl from "maplibre-gl";
import maplibreWorkerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url";
import "maplibre-gl/dist/maplibre-gl.css";
import { planetProofBySlug, type PlanetProof, type ProofMapLayer, type ProofSection } from "@/planet/proofs/planetProofs";

const VECTOR_STYLE = "https://tiles.openfreemap.org/styles/liberty";
const ink = "#0A0A0A";
const dim = "#5E5E5E";
const line = "#E6E6E4";
const blue = "#2E2EFF";
const mono: CSSProperties = {
  fontFamily: "Fragment Mono, ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
  letterSpacing: ".11em",
  fontSize: 10,
  textTransform: "uppercase",
};

function sourceMap(proof: PlanetProof) {
  return Object.fromEntries(proof.sources.map((source) => [source.id, source]));
}

function EvidenceMap({ proof }: { proof: PlanetProof }) {
  const box = useRef<HTMLDivElement | null>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const [active, setActive] = useState<Record<string, boolean>>(
    () => Object.fromEntries(proof.mapLayers.map((layer, i) => [layer.id, i === 0])),
  );
  const [available, setAvailable] = useState(true);

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
      m.fitBounds(proof.bounds, { padding: 24, duration: 0, maxZoom: proof.zoom + 1.2 });
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
          setAvailable(false);
        }
      }
    });
    m.on("error", (event) => {
      const message = String(event.error?.message ?? "");
      if (message && !message.includes("glyph")) setAvailable(false);
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

  const toggle = (layer: ProofMapLayer) =>
    setActive((current) => ({ ...current, [layer.id]: !current[layer.id] }));

  return (
    <section aria-label="Explore the Oslofjord map" style={{ background: "#FFFFFF" }}>
      <div style={{ borderTop: `4px solid ${blue}`, borderBottom: `1px solid ${line}` }}>
        <div ref={box} style={{ width: "100%", height: "min(58svh,680px)", minHeight: 420 }} />
      </div>
      <div style={{ maxWidth: 1080, margin: "0 auto", padding: "22px clamp(20px,5vw,64px) 0" }}>
        <div style={{ ...mono, color: blue }}>EXPLORE THE FJORD</div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 14 }}>
          {proof.mapLayers.map((layer) => (
            <button
              key={layer.id}
              type="button"
              onClick={() => toggle(layer)}
              style={{
                border: `1px solid ${active[layer.id] ? blue : line}`,
                background: active[layer.id] ? blue : "#FFFFFF",
                color: active[layer.id] ? "#FFFFFF" : ink,
                padding: "10px 12px",
                fontSize: 12,
                cursor: "pointer",
              }}
            >
              {layer.label}
            </button>
          ))}
        </div>
        {!available && (
          <p style={{ marginTop: 12, color: dim, fontSize: 13 }}>
            Some map layers are temporarily unavailable. The article and sources remain available below.
          </p>
        )}
      </div>
    </section>
  );
}

function ReadingSection({ section, proof }: { section: ProofSection; proof: PlanetProof }) {
  const sources = useMemo(() => sourceMap(proof), [proof]);
  return (
    <section style={{ maxWidth: 980, margin: "0 auto", padding: "clamp(58px,8vw,104px) clamp(20px,5vw,64px)", borderTop: `1px solid ${line}` }}>
      <div style={{ ...mono, color: blue }}>{section.question}</div>
      <h2 style={{
        margin: "14px 0 0",
        color: ink,
        fontSize: "clamp(36px,6vw,72px)",
        lineHeight: .98,
        letterSpacing: "-.045em",
        fontWeight: 520,
        maxWidth: 900,
      }}>{section.headline}</h2>
      <p style={{
        margin: "24px 0 0",
        maxWidth: 760,
        color: "#292929",
        fontSize: "clamp(18px,2.2vw,24px)",
        lineHeight: 1.5,
      }}>{section.summary}</p>

      {section.facts.length > 0 && (
        <ul style={{ margin: "28px 0 0", padding: 0, listStyle: "none", maxWidth: 760, borderTop: `1px solid ${line}` }}>
          {section.facts.slice(0, 3).map((fact) => (
            <li key={fact} style={{ padding: "16px 0", borderBottom: `1px solid ${line}`, fontSize: 15, lineHeight: 1.55 }}>
              {fact}
            </li>
          ))}
        </ul>
      )}

      {section.sourceIds.length > 0 && (
        <div style={{ display: "flex", gap: "10px 18px", flexWrap: "wrap", marginTop: 22 }}>
          {section.sourceIds.map((id) => {
            const source = sources[id];
            return source ? (
              <a key={id} href={source.url} target="_blank" rel="noreferrer" style={{ color: blue, fontSize: 13, borderBottom: `1px solid ${blue}`, paddingBottom: 2 }}>
                {source.authority} ↗
              </a>
            ) : null;
          })}
        </div>
      )}
    </section>
  );
}

function PublicSources({ proof }: { proof: PlanetProof }) {
  return (
    <details style={{ maxWidth: 980, margin: "0 auto", borderTop: `1px solid ${line}`, padding: "28px clamp(20px,5vw,64px) 70px" }}>
      <summary style={{ ...mono, color: blue, cursor: "pointer", listStyle: "none" }}>SOURCES + METHOD</summary>
      <div style={{ marginTop: 20, display: "grid", gap: 16 }}>
        {proof.sources.map((source) => (
          <a key={source.id} href={source.url} target="_blank" rel="noreferrer" style={{ color: ink, textDecoration: "none", paddingBottom: 14, borderBottom: `1px solid ${line}` }}>
            <strong style={{ display: "block", fontSize: 16 }}>{source.label}</strong>
            <span style={{ display: "block", marginTop: 4, color: dim, fontSize: 13 }}>{source.authority}</span>
          </a>
        ))}
      </div>
    </details>
  );
}

export function PlanetProofPage({ slug }: { slug: string }) {
  const proof = planetProofBySlug(slug);
  if (!proof) return null;

  const isOslofjord = proof.slug === "oslofjorden";
  const displayName = isOslofjord ? "Oslofjorden" : proof.name;
  const sections = (() => {
    if (!isOslofjord) return proof.sections.slice(0, 4);
    const wanted = ["WHAT IS HERE?", "WHAT IS HAPPENING?", "WHY?", "WHAT CAN BE DONE?"];
    const selected = wanted
      .map((question) => proof.sections.find((section) => section.question.toUpperCase() === question))
      .filter(Boolean) as ProofSection[];
    return selected.length >= 3 ? selected : proof.sections.slice(0, 4);
  })();

  return (
    <main style={{ background: "#FFFFFF", color: ink, minHeight: "100vh" }}>
      <nav style={{ minHeight: 64, padding: "0 clamp(20px,5vw,64px)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14, borderBottom: `1px solid ${line}`, background: "#FFFFFF" }}>
        <Link to="/" style={{ color: ink, textDecoration: "none", fontWeight: 700, letterSpacing: "-.03em" }}>4PLANET_</Link>
        <div style={{ display: "flex", gap: 18, alignItems: "center" }}>
          <Link to="/living-systems" style={{ ...mono, color: ink, textDecoration: "none" }}>LIVING SYSTEMS</Link>
          <Link to="/atlas" style={{ ...mono, color: ink, textDecoration: "none" }}>ATLAS</Link>
        </div>
      </nav>

      <header style={{ maxWidth: 1180, margin: "0 auto", padding: "clamp(72px,10vw,132px) clamp(20px,5vw,64px) clamp(60px,8vw,100px)" }}>
        <div style={{ ...mono, color: blue }}>{proof.domain} · LIVING SYSTEM</div>
        <h1 style={{
          margin: "18px 0 0",
          fontSize: "clamp(58px,10vw,124px)",
          lineHeight: .84,
          letterSpacing: "-.065em",
          fontWeight: 520,
        }}>{displayName}</h1>
        {isOslofjord && <div style={{ marginTop: 20, ...mono, color: dim }}>A CLOSER LOOK AT {proof.name.toUpperCase()}</div>}
        <p style={{
          margin: "34px 0 0",
          maxWidth: 820,
          fontFamily: "Instrument Sans, DM Sans, sans-serif",
          fontSize: "clamp(25px,3.8vw,48px)",
          lineHeight: 1.08,
          letterSpacing: "-.035em",
        }}>{proof.oneLine}</p>
      </header>

      <EvidenceMap proof={proof} />

      <section style={{ maxWidth: 980, margin: "0 auto", padding: "clamp(56px,8vw,96px) clamp(20px,5vw,64px)" }}>
        <div style={{ ...mono, color: blue }}>THE SHORT VERSION</div>
        <p style={{ margin: "16px 0 0", maxWidth: 800, fontSize: "clamp(21px,2.8vw,34px)", lineHeight: 1.35, letterSpacing: "-.02em" }}>
          {isOslofjord
            ? "Bunnefjorden is a deep basin inside the Oslofjord where water exchange, oxygen and human pressure meet. The important story is simple: what happens at depth depends on both the shape of the fjord and what enters it."
            : proof.truthBoundary}
        </p>
      </section>

      {sections.map((section) => <ReadingSection key={section.id} section={section} proof={proof} />)}

      <PublicSources proof={proof} />
    </main>
  );
}
