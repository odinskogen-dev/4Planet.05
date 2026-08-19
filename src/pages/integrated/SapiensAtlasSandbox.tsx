import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { PublicShell } from "@/components/layout/PublicShell";
import { DOMAIN_ACCENT, T } from "@/styles/tokens";
import {
  FOOD_PRESSURES,
  FOOD_SOLUTION_LEVERS,
  FOOD_SOURCES,
  FOOD_STAGES,
  SAPIENS_CHAINS,
} from "@/data/sapiensChains";

const accent = DOMAIN_ACCENT["S4PIENS_"];
const humanId = "taxon:gbif:10856082";
const vectorStyle = "https://tiles.openfreemap.org/styles/liberty";
const line = "rgba(255,255,255,.16)";
const dim = "rgba(255,255,255,.62)";
const mono: React.CSSProperties = {
  fontFamily: T.mono,
  fontSize: 10.5,
  letterSpacing: ".14em",
  textTransform: "uppercase",
};

type FoodSource = {
  id: string | null;
  name: string;
  sector: string;
  subsector?: string;
  country?: string;
  lat: number;
  lon: number;
  emissions: number | null;
  gas: string;
  year: number;
};

type FoodResponse = {
  ok: boolean;
  source?: string;
  apiVersion?: string;
  retrievedAt?: string;
  returned?: number;
  sources?: FoodSource[];
  limitations?: string[];
  state?: string;
  error?: string;
};

const atlasFoodHref = (layers: readonly string[]) => {
  const params = new URLSearchParams({
    m: "S4PIENS",
    l: ["bluemarble", ...layers].join(","),
    journey: "food",
    entity: humanId,
  });
  return `/atlas?${params.toString()}`;
};

const formatEmissions = (value: number | null) => {
  if (!Number.isFinite(value)) return "VALUE NOT EXPOSED";
  const n = Number(value);
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return Math.round(n).toLocaleString();
};

export default function SapiensAtlasSandbox() {
  const mapNode = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const [data, setData] = useState<FoodResponse>({ ok: false, state: "LOADING" });
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    if (!mapNode.current || mapRef.current) return;
    const map = new maplibregl.Map({
      container: mapNode.current,
      style: vectorStyle,
      center: [5, 18],
      zoom: 1.45,
      attributionControl: { compact: true },
    });
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "bottom-right");
    map.on("load", () => {
      try { map.setProjection({ type: "globe" }); } catch { /* honest mercator fallback */ }
      setMapReady(true);
    });
    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/sapiens-food?year=2024&gas=co2e_100yr&limit=700", { signal: controller.signal })
      .then(async (response) => {
        const body = await response.json();
        if (!response.ok || !body?.ok) throw new Error(body?.error || `HTTP ${response.status}`);
        setData(body);
      })
      .catch((error) => {
        if (error?.name !== "AbortError") {
          setData({ ok: false, state: "UNAVAILABLE", error: String(error?.message || error) });
        }
      });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady || !data.ok || !Array.isArray(data.sources)) return;

    const collection = {
      type: "FeatureCollection",
      features: data.sources.map((source) => ({
        type: "Feature",
        geometry: { type: "Point", coordinates: [source.lon, source.lat] },
        properties: {
          id: source.id || "",
          name: source.name,
          sector: source.sector,
          subsector: source.subsector || "",
          country: source.country || "",
          emissions: source.emissions,
          gas: source.gas,
          year: source.year,
        },
      })),
    } as const;

    const existing = map.getSource("food-agriculture") as maplibregl.GeoJSONSource | undefined;
    if (existing) existing.setData(collection as never);
    else {
      map.addSource("food-agriculture", { type: "geojson", data: collection as never });
      map.addLayer({
        id: "food-agriculture-points",
        type: "circle",
        source: "food-agriculture",
        paint: {
          "circle-color": accent,
          "circle-opacity": 0.84,
          "circle-radius": ["interpolate", ["linear"], ["zoom"], 1, 2.5, 6, 5.5, 10, 7],
          "circle-stroke-color": "#FFFFFF",
          "circle-stroke-width": 0.6,
        },
      });
      map.on("click", "food-agriculture-points", (event) => {
        const feature = event.features?.[0];
        if (!feature || feature.geometry.type !== "Point") return;
        const coordinates = feature.geometry.coordinates as [number, number];
        const p = feature.properties || {};
        const amount = Number.isFinite(Number(p.emissions)) ? formatEmissions(Number(p.emissions)) : "VALUE NOT EXPOSED";
        new maplibregl.Popup({ closeButton: true, maxWidth: "330px" })
          .setLngLat(coordinates)
          .setHTML(`<div style="font:12px/1.5 system-ui;color:#0A0A0A"><strong>${String(p.name || "Agriculture source")}</strong><br>${String(p.subsector || p.sector || "agriculture")}<br>${p.country ? `${String(p.country)} · ` : ""}${String(p.year || "")}<br>${amount} · ${String(p.gas || "source-defined gas")}<br><span style="opacity:.62">Climate TRACE inventory/model source · not a live plume</span></div>`)
          .addTo(map);
      });
    }
  }, [data, mapReady]);

  const section: React.CSSProperties = {
    maxWidth: 1440,
    margin: "0 auto",
    padding: "clamp(60px,8vw,110px) clamp(20px,5vw,72px)",
  };

  return (
    <PublicShell>
      <main id="main-content" style={{ background: "#0A0A0A", color: "#fff", minHeight: "100vh" }}>
        <section style={{ minHeight: "72vh", display: "grid", alignItems: "end", borderBottom: `1px solid ${line}`, padding: "clamp(90px,12vw,170px) clamp(20px,5vw,72px) clamp(48px,7vw,92px)" }}>
          <div style={{ maxWidth: 1320, width: "100%", margin: "0 auto" }}>
            <div style={{ ...mono, color: accent }}>S4PIENS_ · HUMAN SYSTEMS ATLAS · SANDBOX 01</div>
            <h1 style={{ margin: "18px 0 0", fontFamily: T.display, fontWeight: 500, fontSize: "clamp(54px,9.6vw,142px)", lineHeight: .82, letterSpacing: "-.06em", maxWidth: "8.5ch" }}>Start with us.</h1>
            <p style={{ margin: "28px 0 0", maxWidth: 840, fontFamily: T.display, fontSize: "clamp(23px,3vw,43px)", lineHeight: 1.06, letterSpacing: "-.035em" }}>
              Follow what humans need through the systems that produce it — then see where pressure reaches the living planet.
            </p>
            <p style={{ margin: "22px 0 0", maxWidth: 760, color: dim, fontSize: "clamp(15px,1.3vw,18px)", lineHeight: 1.65 }}>
              Source-aware system map, not a personal footprint score. Co-location and source records do not automatically establish ecological causation.
            </p>
          </div>
        </section>

        <section style={section}>
          <div style={{ ...mono, color: accent }}>GOLD STANDARD 01 · FOOD_</div>
          <h2 style={{ margin: "14px 0 0", fontFamily: T.display, fontWeight: 500, fontSize: "clamp(38px,5.8vw,86px)", lineHeight: .9, letterSpacing: "-.05em", maxWidth: "10ch" }}>What does a meal touch?</h2>
          <p style={{ margin: "22px 0 0", maxWidth: 760, color: dim, fontSize: 17, lineHeight: 1.65 }}>
            FOOD_ is the first full causal chain because it crosses land, water, nutrients, climate, biodiversity, energy, trade and waste in one human need.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,220px),1fr))", borderTop: `1px solid ${line}`, borderLeft: `1px solid ${line}`, marginTop: 42 }}>
            {FOOD_STAGES.map((stage, index) => (
              <article key={stage.id} style={{ minHeight: 230, padding: 24, borderRight: `1px solid ${line}`, borderBottom: `1px solid ${line}` }}>
                <div style={{ ...mono, color: accent }}>{String(index + 1).padStart(2, "0")}</div>
                <h3 style={{ margin: "22px 0 0", fontFamily: T.display, fontWeight: 500, fontSize: 24 }}>{stage.label}</h3>
                <p style={{ margin: "14px 0 0", color: dim, fontSize: 14.5, lineHeight: 1.58 }}>{stage.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section style={{ borderTop: `1px solid ${line}`, borderBottom: `1px solid ${line}`, background: "#050505" }}>
          <div style={section}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 24, alignItems: "end", flexWrap: "wrap" }}>
              <div>
                <div style={{ ...mono, color: accent }}>FIRST LIVE DATA SEAM · CLIMATE TRACE v7</div>
                <h2 style={{ margin: "12px 0 0", fontFamily: T.display, fontWeight: 500, fontSize: "clamp(32px,4.8vw,72px)", lineHeight: .94, letterSpacing: "-.045em", maxWidth: "13ch" }}>Agriculture emissions sources on Earth.</h2>
              </div>
              <div style={{ ...mono, color: data.ok ? "#3AE86F" : data.state === "LOADING" ? "rgba(255,255,255,.55)" : "#FF7D50" }}>
                {data.ok ? `${data.returned ?? 0} RECORDS · ${data.apiVersion || "v7"}` : data.state === "LOADING" ? "SOURCE LOADING" : "SOURCE UNAVAILABLE"}
              </div>
            </div>
            <div style={{ position: "relative", height: "min(68vh,720px)", minHeight: 440, marginTop: 34, border: `1px solid ${line}`, overflow: "hidden" }}>
              <div ref={mapNode} style={{ position: "absolute", inset: 0 }} aria-label="Climate TRACE agriculture emissions source map" />
              <div style={{ position: "absolute", left: 14, bottom: 14, zIndex: 2, maxWidth: 430, padding: "12px 14px", background: "rgba(10,10,10,.9)", border: `1px solid ${line}` }}>
                <div style={{ ...mono, color: accent }}>TRUTH BOUNDARY</div>
                <p style={{ margin: "8px 0 0", color: "rgba(255,255,255,.76)", fontSize: 12.5, lineHeight: 1.5 }}>Inventory/model source records. Not live plumes. Not proof of local ecosystem damage.</p>
                {data.error && <p style={{ margin: "8px 0 0", color: "#FF7D50", fontSize: 12 }}>SOURCE STATE · {data.error}</p>}
              </div>
            </div>
          </div>
        </section>

        <section style={section}>
          <div style={{ ...mono, color: accent }}>PRESSURE MAP · SHARED ATLAS</div>
          <h2 style={{ margin: "12px 0 0", fontFamily: T.display, fontWeight: 500, fontSize: "clamp(32px,4.6vw,70px)", lineHeight: .95, letterSpacing: "-.045em", maxWidth: "15ch" }}>Follow the chain into the planet.</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,280px),1fr))", borderTop: `1px solid ${line}`, borderLeft: `1px solid ${line}`, marginTop: 38 }}>
            {FOOD_PRESSURES.map((pressure) => (
              <Link key={pressure.id} to={atlasFoodHref(pressure.atlasLayers)} style={{ minHeight: 220, padding: 24, color: "#fff", textDecoration: "none", borderRight: `1px solid ${line}`, borderBottom: `1px solid ${line}`, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <div><div style={{ ...mono, color: accent }}>{pressure.label}</div><p style={{ margin: "17px 0 0", fontFamily: T.display, fontSize: 23, lineHeight: 1.12 }}>{pressure.question}</p></div>
                <div style={{ ...mono, color: "rgba(255,255,255,.72)" }}>OPEN SOURCE LAYERS →</div>
              </Link>
            ))}
          </div>
        </section>

        <section style={{ borderTop: `1px solid ${line}`, background: "#fff", color: "#0A0A0A" }}>
          <div style={section}>
            <div style={{ ...mono, color: accent }}>SOURCE STACK · FOOD_</div>
            <h2 style={{ margin: "12px 0 0", fontFamily: T.display, fontWeight: 500, fontSize: "clamp(32px,4.6vw,70px)", lineHeight: .95, letterSpacing: "-.045em" }}>Evidence before interpretation.</h2>
            <div style={{ marginTop: 38, borderTop: "1px solid rgba(10,10,10,.18)" }}>
              {FOOD_SOURCES.map((source) => (
                <article key={source.id} style={{ display: "grid", gridTemplateColumns: "minmax(180px,.7fr) 1.4fr", gap: 24, padding: "24px 0", borderBottom: "1px solid rgba(10,10,10,.14)" }}>
                  <div><div style={{ ...mono, color: source.state === "LIVE_API" ? "#12833d" : source.state === "ACCESS_GATED" ? "#9a5b00" : accent }}>{source.state.replace(/_/g, " ")}</div><div style={{ ...mono, color: "rgba(10,10,10,.52)", marginTop: 7 }}>{source.authority}</div></div>
                  <div><h3 style={{ margin: 0, fontFamily: T.display, fontWeight: 500, fontSize: 24 }}>{source.label}</h3><p style={{ margin: "10px 0 0", fontSize: 14.5, lineHeight: 1.6 }}>{source.role}</p><p style={{ margin: "8px 0 0", color: "rgba(10,10,10,.56)", fontSize: 13.5, lineHeight: 1.55 }}>LIMIT · {source.limitation}</p></div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section style={section}>
          <div style={{ ...mono, color: accent }}>SOLUTIONS MAP · WORKING HYPOTHESES</div>
          <h2 style={{ margin: "12px 0 0", fontFamily: T.display, fontWeight: 500, fontSize: "clamp(32px,4.6vw,70px)", lineHeight: .95, letterSpacing: "-.045em", maxWidth: "13ch" }}>Find leverage where pressure enters.</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,260px),1fr))", borderTop: `1px solid ${line}`, borderLeft: `1px solid ${line}`, marginTop: 38 }}>
            {FOOD_SOLUTION_LEVERS.map((solution) => (
              <article key={solution.label} style={{ minHeight: 225, padding: 24, borderRight: `1px solid ${line}`, borderBottom: `1px solid ${line}` }}>
                <div style={{ ...mono, color: accent }}>{solution.pressure}</div><h3 style={{ margin: "18px 0 0", fontFamily: T.display, fontWeight: 500, fontSize: 23 }}>{solution.label}</h3><p style={{ margin: "14px 0 0", color: dim, fontSize: 14.5, lineHeight: 1.58 }}>{solution.test}</p>
              </article>
            ))}
          </div>
        </section>

        <section style={{ borderTop: `1px solid ${line}`, background: "#050505" }}>
          <div style={section}>
            <div style={{ ...mono, color: accent }}>20 HUMAN SYSTEM CHAINS · WORKING ATLAS FAMILIES</div>
            <h2 style={{ margin: "12px 0 0", fontFamily: T.display, fontWeight: 500, fontSize: "clamp(32px,4.6vw,70px)", lineHeight: .95, letterSpacing: "-.045em", maxWidth: "15ch" }}>FOOD_ proves the grammar. Then the map scales.</h2>
            <div style={{ marginTop: 40, display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,240px),1fr))", gap: 1, background: line, border: `1px solid ${line}` }}>
              {SAPIENS_CHAINS.map((chain, index) => (
                <article key={chain.id} style={{ minHeight: 195, padding: 22, background: chain.status === "GOLD_STANDARD" ? "#16100f" : "#0A0A0A" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}><span style={{ ...mono, color: chain.status === "GOLD_STANDARD" ? accent : "rgba(255,255,255,.42)" }}>{String(index + 1).padStart(2, "0")}</span><span style={{ ...mono, color: chain.status === "GOLD_STANDARD" ? accent : "rgba(255,255,255,.34)" }}>{chain.status === "GOLD_STANDARD" ? "GOLD STANDARD" : "NEXT"}</span></div>
                  <h3 style={{ margin: "24px 0 0", fontFamily: T.display, fontWeight: 500, fontSize: 24 }}>{chain.label}</h3>
                  <div style={{ ...mono, marginTop: 10, color: "rgba(255,255,255,.52)" }}>HUMAN NEED · {chain.humanNeed}</div>
                  <p style={{ margin: "17px 0 0", color: "rgba(255,255,255,.56)", fontSize: 12.5, lineHeight: 1.5 }}>{chain.pressureFamilies.join(" · ").toUpperCase()}</p>
                </article>
              ))}
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 34 }}>
              <Link to="/species/homo-sapiens" style={{ ...mono, textDecoration: "none", background: "#fff", color: "#0A0A0A", padding: "13px 18px" }}>HOMO SAPIENS →</Link>
              <Link to="/missions/food" style={{ ...mono, textDecoration: "none", color: "#fff", border: `1px solid ${line}`, padding: "12px 18px" }}>FOOD_ MISSION →</Link>
              <Link to={atlasFoodHref(["ndvi", "forest", "precip", "fires", "biodiv"])} style={{ ...mono, textDecoration: "none", color: "#fff", border: `1px solid ${line}`, padding: "12px 18px" }}>OPEN FOOD_ IN ATLAS →</Link>
            </div>
          </div>
        </section>
      </main>
    </PublicShell>
  );
}
