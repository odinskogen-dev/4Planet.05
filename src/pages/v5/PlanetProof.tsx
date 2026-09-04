import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { Link } from "react-router-dom";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { planetProofBySlug, type PlanetProof, type ProofMapLayer, type ProofSection } from "@/planet/proofs/planetProofs";

const VECTOR_STYLE = "https://tiles.openfreemap.org/styles/liberty";
const ink = "#0a0a0a";
const dim = "#686868";
const line = "#d9d9d4";
const blue = "#2e2eff";
const paper = "#f5f4ef";
const mono: CSSProperties = { fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace", letterSpacing: ".11em", fontSize: 10, textTransform: "uppercase" };

function sourceMap(proof: PlanetProof) {
  return Object.fromEntries(proof.sources.map((source) => [source.id, source]));
}

function EvidenceMap({ proof }: { proof: PlanetProof }) {
  const box = useRef<HTMLDivElement | null>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const [active, setActive] = useState<Record<string, boolean>>(() => Object.fromEntries(proof.mapLayers.map((layer, i) => [layer.id, i === 0])));
  const [status, setStatus] = useState<"LOADING" | "READY" | "DEGRADED">("LOADING");

  useEffect(() => {
    if (!box.current) return;
    let alive = true;
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
          setStatus("DEGRADED");
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

  const toggle = (layer: ProofMapLayer) => setActive((current) => ({ ...current, [layer.id]: !current[layer.id] }));

  return (
    <section aria-label="Source-backed ecosystem map" style={{ background: "#080808", color: "#fff" }}>
      <div style={{ padding: "18px clamp(18px,4vw,54px)", display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap", borderBottom: "1px solid rgba(255,255,255,.16)" }}>
        <div>
          <div style={{ ...mono, color: "#79dcff" }}>REAL GEOSPATIAL EVIDENCE · NO ILLUSTRATED ECOLOGY</div>
          <div style={{ marginTop: 7, fontSize: 14, color: "rgba(255,255,255,.72)" }}>Basemap geometry + named public authority overlays. Turn layers on and off; do not merge unlike evidence into one score.</div>
        </div>
        <div style={{ ...mono, color: status === "READY" ? "#7effa4" : status === "DEGRADED" ? "#ffb347" : "rgba(255,255,255,.56)" }}>MAP · {status}</div>
      </div>
      <div style={{ position: "relative", minHeight: "min(68vh,720px)" }}>
        <div ref={box} style={{ position: "absolute", inset: 0 }} />
        {proof.mapLayers.length > 0 && (
          <div style={{ position: "absolute", left: 16, bottom: 16, zIndex: 3, width: "min(360px,calc(100% - 32px))", background: "rgba(8,8,8,.92)", backdropFilter: "blur(14px)", border: "1px solid rgba(255,255,255,.22)" }}>
            <div style={{ padding: "13px 14px", ...mono, color: "rgba(255,255,255,.6)", borderBottom: "1px solid rgba(255,255,255,.14)" }}>INSPECT THE EVIDENCE</div>
            {proof.mapLayers.map((layer) => (
              <button key={layer.id} type="button" onClick={() => toggle(layer)} style={{ width: "100%", border: 0, borderBottom: "1px solid rgba(255,255,255,.12)", background: "transparent", color: "#fff", textAlign: "left", padding: "13px 14px", cursor: "pointer", display: "grid", gridTemplateColumns: "22px 1fr", gap: 10 }}>
                <span aria-hidden style={{ width: 12, height: 12, marginTop: 3, border: "1px solid rgba(255,255,255,.7)", background: active[layer.id] ? "#fff" : "transparent" }} />
                <span><strong style={{ fontSize: 12.5 }}>{layer.label}</strong><span style={{ display: "block", marginTop: 4, color: "rgba(255,255,255,.57)", fontSize: 11.5, lineHeight: 1.4 }}>{layer.description}</span></span>
              </button>
            ))}
          </div>
        )}
      </div>
      <div style={{ padding: "13px clamp(18px,4vw,54px)", ...mono, color: "rgba(255,255,255,.52)", lineHeight: 1.6 }}>
        MAP BOUNDARY · navigation/view extent, not a claim that the ecosystem ends at the screen edge. Layer coverage differs by source.
      </div>
    </section>
  );
}

function ReadingSection({ section, proof, number }: { section: ProofSection; proof: PlanetProof; number: number }) {
  const sources = useMemo(() => sourceMap(proof), [proof]);
  return (
    <section id={section.id.toLowerCase()} style={{ borderTop: `1px solid ${line}`, padding: "clamp(48px,7vw,92px) clamp(20px,6vw,86px)", display: "grid", gridTemplateColumns: "minmax(110px,.45fr) minmax(0,1.55fr)", gap: "clamp(24px,6vw,90px)" }}>
      <div>
        <div style={{ ...mono, color: blue }}><span aria-hidden>0{number} · </span><span>{section.question}</span></div>
        <div style={{ marginTop: 12, ...mono, color: section.confidence === "HIGH" ? "#157c3d" : section.confidence === "MEDIUM" ? "#8a6500" : "#a03a2a" }}>EVIDENCE · {section.confidence}</div>
      </div>
      <div>
        <h2 style={{ margin: 0, color: ink, fontSize: "clamp(30px,5vw,66px)", lineHeight: .98, letterSpacing: "-.045em", fontWeight: 520, maxWidth: 980 }}>{section.headline}</h2>
        <p style={{ margin: "24px 0 0", maxWidth: 850, color: "#292929", fontSize: "clamp(17px,2vw,22px)", lineHeight: 1.52 }}>{section.summary}</p>
        {section.facts.length > 0 && <div style={{ marginTop: 30, display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,240px),1fr))", borderTop: `1px solid ${line}`, borderLeft: `1px solid ${line}` }}>{section.facts.map((fact) => <div key={fact} style={{ padding: 18, borderRight: `1px solid ${line}`, borderBottom: `1px solid ${line}`, fontSize: 14, lineHeight: 1.55 }}>{fact}</div>)}</div>}
        {section.sourceIds.length > 0 && <div style={{ marginTop: 24, display: "flex", gap: 8, flexWrap: "wrap" }}>{section.sourceIds.map((id) => { const source = sources[id]; return source ? <a key={id} href={source.url} target="_blank" rel="noreferrer" style={{ ...mono, color: blue, textDecoration: "none", borderBottom: `1px solid ${blue}`, paddingBottom: 2 }}>{source.authority} ↗</a> : null; })}</div>}
      </div>
    </section>
  );
}

function SourceLedger({ proof }: { proof: PlanetProof }) {
  return (
    <section style={{ background: "#0a0a0a", color: "#fff", padding: "clamp(54px,8vw,110px) clamp(20px,6vw,86px)" }}>
      <div style={{ ...mono, color: "#79dcff" }}>HOW WE KNOW · SOURCE LEDGER</div>
      <h2 style={{ margin: "15px 0 0", fontSize: "clamp(34px,5vw,68px)", lineHeight: .98, letterSpacing: "-.045em", fontWeight: 520 }}>Nothing important should require trust in 4PLANET alone.</h2>
      <div style={{ marginTop: 38, display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,330px),1fr))", borderTop: "1px solid rgba(255,255,255,.18)", borderLeft: "1px solid rgba(255,255,255,.18)" }}>
        {proof.sources.map((source) => <a key={source.id} href={source.url} target="_blank" rel="noreferrer" style={{ color: "#fff", textDecoration: "none", padding: "22px", borderRight: "1px solid rgba(255,255,255,.18)", borderBottom: "1px solid rgba(255,255,255,.18)" }}><div style={{ ...mono, color: source.state === "OPERATIONAL" ? "#79dcff" : "#7effa4" }}>{source.state}</div><h3 style={{ margin: "10px 0 0", fontSize: 18, lineHeight: 1.16 }}>{source.label}</h3><div style={{ marginTop: 7, color: "rgba(255,255,255,.58)", fontSize: 12 }}>{source.authority}</div><p style={{ margin: "14px 0 0", color: "rgba(255,255,255,.72)", fontSize: 13, lineHeight: 1.55 }}>{source.supports}</p><div style={{ marginTop: 14, ...mono, color: "#fff" }}>OPEN SOURCE ↗</div></a>)}
      </div>
    </section>
  );
}

export function PlanetProofPage({ slug }: { slug: string }) {
  const proof = planetProofBySlug(slug);
  if (!proof) return null;
  const isCandidate = proof.state === "FOUNDER_REVIEW";
  return (
    <main style={{ background: paper, color: ink }}>
      <nav style={{ minHeight: 52, padding: "0 clamp(18px,4vw,54px)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14, borderBottom: `1px solid ${line}`, background: paper }}>
        <Link to="/" style={{ color: ink, textDecoration: "none", fontWeight: 700, letterSpacing: "-.03em" }}>4PLANET_</Link>
        <div style={{ display: "flex", gap: 16, alignItems: "center" }}><Link to="/living-systems" style={{ ...mono, color: ink, textDecoration: "none" }}>LIVING SYSTEMS</Link><Link to="/atlas" style={{ ...mono, color: ink, textDecoration: "none" }}>ATLAS</Link></div>
      </nav>

      <header style={{ minHeight: "74vh", display: "grid", alignContent: "end", padding: "clamp(70px,10vw,150px) clamp(20px,6vw,86px) clamp(46px,7vw,90px)" }}>
        <div style={{ ...mono, color: blue }}><span>{proof.domain} · PLANET PROOF {proof.index} · </span>{isCandidate ? <span>HUMAN GOLD CANDIDATE — NOT FOUNDER APPROVED</span> : <span>TRANSFER PACK — IN DEVELOPMENT</span>}</div>
        <h1 style={{ margin: "18px 0 0", fontSize: "clamp(60px,12vw,176px)", lineHeight: .78, letterSpacing: "-.075em", fontWeight: 520 }}>{proof.name}</h1>
        <div style={{ marginTop: "clamp(32px,5vw,62px)", display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(260px,.7fr)", gap: "clamp(28px,7vw,100px)", alignItems: "end" }}>
          <p style={{ margin: 0, maxWidth: 850, fontSize: "clamp(23px,3.6vw,48px)", lineHeight: 1.04, letterSpacing: "-.03em" }}>{proof.oneLine}</p>
          <p style={{ margin: 0, color: dim, fontSize: 13.5, lineHeight: 1.58 }}>{proof.truthBoundary}</p>
        </div>
      </header>

      <EvidenceMap proof={proof} />

      <section style={{ padding: "clamp(40px,6vw,78px) clamp(20px,6vw,86px)", borderBottom: `1px solid ${line}` }}>
        <div style={{ ...mono, color: blue }}>HUMAN-FIRST READING ORDER</div>
        <div style={{ marginTop: 18, display: "flex", flexWrap: "wrap", gap: "8px 18px" }}>{proof.sections.map((section, index) => <a key={section.id} href={`#${section.id.toLowerCase()}`} style={{ color: ink, textDecoration: "none", fontSize: 13, borderBottom: `1px solid ${line}`, paddingBottom: 5 }}>0{index + 1} {section.question}</a>)}</div>
      </section>

      {proof.sections.map((section, index) => <ReadingSection key={section.id} section={section} proof={proof} number={index + 1} />)}
      <SourceLedger proof={proof} />

      <section style={{ padding: "clamp(50px,8vw,100px) clamp(20px,6vw,86px)", borderBottom: `1px solid ${line}` }}>
        <div style={{ ...mono, color: blue }}>COMPOUNDING / TRANSFER</div>
        <p style={{ margin: "18px 0 0", maxWidth: 900, fontSize: "clamp(22px,3vw,40px)", lineHeight: 1.15, letterSpacing: "-.025em" }}>{proof.transferNote}</p>
        {proof.slug === "oslofjorden" && <div style={{ marginTop: 30, display: "flex", gap: 12, flexWrap: "wrap" }}><span style={{ ...mono, border: `1px solid ${line}`, padding: "11px 13px" }}>NEXT TRANSFER · GREAT BARRIER REEF</span><span style={{ ...mono, border: `1px solid ${line}`, padding: "11px 13px" }}>THIRD TRANSFER · AMAZONIA</span></div>}
      </section>

      <footer style={{ padding: "22px clamp(20px,6vw,86px) 38px", display: "flex", justifyContent: "space-between", gap: 20, flexWrap: "wrap" }}><div style={{ ...mono, color: dim }}>PROOF STATE · {proof.state}</div><div style={{ ...mono, color: dim }}>MAKER ≠ JUDGE · HUMAN GOLD REQUIRES FOUNDER REVIEW</div></footer>
    </main>
  );
}
