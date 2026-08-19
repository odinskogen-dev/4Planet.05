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

const mono: React.CSSProperties = {
  fontFamily: T.mono,
  fontSize: 10.5,
  letterSpacing: ".14em",
  textTransform: "uppercase",
};

const line = "rgba(255,255,255,.16)";
const dim = "rgba(255,255,255,.62)";

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

function formatEmissions(value: number | null) {
  if (!Number.isFinite(value)) return "VALUE NOT EXPOSED";
  const n = Number(value);
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return Math.round(n).toLocaleString();
}

export default function SapiensAtlasSandbox() {
  const mapNode = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const clickBound = useRef(false);
  const [data, setData] = useState<FoodResponse>({ ok: false, state: "LOADING" });
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    if (!mapNode.current || mapRef.current) return;
    const map = new maplibregl.Map({
      container: mapNode.current,
      style: vectorStyle,
      center: [5, 18],
      zoom: 1.45,
      attributionControl: true,
    });
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "bottom-right");
    map.on("load", () => {
      try { map.setProjection({ type: "globe" }); } catch { /* mercator remains truthful fallback */ }
      setMapReady(true);
    });
    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
      clickBound.current = false;
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
        if (error?.name !== "AbortError") setData({ ok: false, state: "UNAVAILABLE", error: String(error?.message || error) });
      });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady || !data.ok || !Array.isArray(data.sources)) return;
    const features = data.sources.map((source) => ({
      type: "Feature" as const,
      geometry: { type: "Point" as const, coordinates: [source.lon, source.lat] },
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
    }));
    const collection = { type: "FeatureCollection" as const, features };
    const existing = map.getSource("food-agriculture") as maplibregl.GeoJSONSource | undefined;
    if (existing) existing.setData(collection);
    else {
      map.addSource("food-agriculture", { type: "geojson", data: collection, cluster: true, clusterRadius: 42, clusterMaxZoom: 5 });
      map.addLayer({
        id: "food-agriculture-clusters",
        type: "circle",
        source: "food-agriculture",
        filter: ["has", "point_count"],
        paint: {
          "circle-color": accent,
          "circle-opacity": 0.78,
          "circle-radius": ["step", ["get", "point_count"], 8, 25, 12, 100, 17, 400, 23],
          "circle-stroke-color": "#0A0A0A",
          "circle-stroke-width": 1,
        },
      });
      map.addLayer({
        id: "food-agriculture-points",
        type: "circle",
        source: "food-agriculture",
        filter: ["!", ["has", "point_count"]],
        paint: {
          "circle-color": accent,
          "circle-opacity": 0.88,
          "circle-radius": 5,
          "circle-stroke-color": "#FFFFFF",
          "circle-stroke-width": 0.7,
        },
      });
    }

    if (!clickBound.current) {
      map.on("click", "food-agriculture-clusters", (event) => {
        const feature = event.features?.[0];
        if (!feature) return;
        const clusterId = feature.properties?.cluster_id;
        const source = map.getSource("food-agriculture") as maplibregl.GeoJSONSource;
        source.getClusterExpansionZoom(clusterId).then((zoom) => {
          const coordinates = (feature.geometry as GeoJSON.Point).coordinates as [number, number];
          map.easeTo({ center: coordinates, zoom });
        }).catch(() => undefined);
      });
      map.on("click", "food-agriculture-points", (event) => {
        const feature = event.features?.[0];
        if (!feature) return;
        const coordinates = (feature.geometry as GeoJSON.Point).coordinates as [number, number];
        const p = feature.properties || {};
        new maplibregl.Popup({ closeButton: true, maxWidth: "320px" })
          .setLngLat(coordinates)
          .setHTML(`<div style="font:12px/1.45 system-ui;color:#0A0A0A"><strong>${String(p.name || "Agriculture source")}</strong><br>${String(p.subsector || p.sector || "agriculture")}<br>${p.country ? `${String(p.country)} · ` : ""}${String(p.year || "")}<br><span style="opacity:.65">Climate TRACE source record · not a live plume</span></div>`)
          .addTo(map);
      });
      clickBound.current = true;
    }
  }, [data, mapReady]);

  return (
    <PublicShell>
      <main id="main-content" style={{ background: "#0A0A0A", color: "#fff", minHeight: "100vh" }}>
        <section style={{ minHeight: "72vh", display: "grid", alignItems: "end", borderBottom: `1px solid ${line}`, padding: "clamp(90px,12vw,170px) clamp(20px,5vw,72px) clamp(48px,7vw,92px)" }}>
          <div style={{ maxWidth: 1320, width: "100%", margin: "0 auto" }}>
            <div style={{ ...mono, color: accent }}>S4PIENS_ · HUMAN SYSTEMS ATLAS · SANDBOX 01</div>
            <h1 style={{ margin: "18px 0 0", fontFamily: T.display, fontWeight: 500, fontSize: "clamp(54px,9.6vw,142px)", lineHeight: .82, letterSpacing: "-.06em", maxWidth: "8.5ch" }}>
              Start with us.
            </h1>
            <p style={{ margin: "28px 0 0", maxWidth: 840, fontFamily: T.display, fontSize: "clamp(23px,3vw,43px)", lineHeight: 1.06, letterSpacing: "-.035em" }}>
              Follow what humans need through the systems that produce it — then see where pressure reaches the living planet.
            </p>
            <p style={{ margin: "22px 0 0", maxWidth: 760, color: dim, fontSize: "clamp(15px,1.3vw,18px)", lineHeight: 1.65 }}>
              This is a source-aware prototype, not a personal footprint calculator. It maps system relationships and pressure evidence without claiming that every person, facility or commodity causes the same ecological outcome.
            </p>
          </div>
        </section>

        <section style={{ maxWidth: 1440, margin: "0 auto", padding: "clamp(60px,8vw,110px) clamp(20px,5vw,72px)" }}>
          <div style={{ ...mono, color: accent }}>GOLD STANDARD 01 · FOOD_</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,420px),1fr))", gap: "clamp(30px,5vw,72px)", alignItems: "end", marginTop: 14 }}>
            <h2 style={{ margin: 0, fontFamily: T.display, fontWeight: 500, fontSize: "clamp(38px,5.8vw,86px)", lineHeight: .9, letterSpacing: "-.05em", maxWidth: "10ch" }}>
              What does a meal touch?
            </h2>
            <p style={{ margin: 0, color: dim, fontSize: "clamp(16px,1.4vw,19px)", lineHeight: 1.65, maxWidth: 620 }}>
              FOOD_ is the first complete chain because it crosses land, water, climate, nutrients, biodiversity, trade, energy, waste and human demand in one system.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,220px),1fr))", borderTop: `1px solid ${line}`, borderLeft: `1px solid ${line}`, marginTop: 46 }}>
            {FOOD_STAGES.map((stage, index) => (
              <article key={stage.id} style={{ minHeight: 245, padding: 24, borderRight: `1px solid ${line}`, borderBottom: `1px solid ${line}` }}>
                <div style={{ ...mono, color: accent }}>0{index + 1}</div>
                <h3 style={{ margin: "22px 0 0", fontFamily: T.display, fontWeight: 500, fontSize: 25, letterSpacing: "-.025em" }}>{stage.label}</h3>
                <p style={{ margin: "15px 0 0", color: dim, fontSize: 14.5, lineHeight: 1.58 }}>{stage.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section style={{ borderTop: `1px solid ${line}`, borderBottom: `1px solid ${line}`, background: "#050505" }}>
          <div style={{ maxWidth: 1440, margin: "0 auto", padding: "clamp(60px,8vw,100px) clamp(20px,5vw,72px)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 24, alignItems: "end", flexWrap: "wrap" }}>
              <div>
                <div style={{ ...mono, color: accent }}>LIVE LAYER · FOOD PRODUCTION PRESSURE</div>
                <h2 style={{ margin: "12px 0 0", fontFamily: T.display, fontWeight: 500, fontSize: "clamp(32px,4.8vw,72px)", lineHeight: .94, letterSpacing: "-.045em", maxWidth: "13ch" }}>
                  Agriculture emissions sources on the planet.
                </h2>
              </div>
              <div style={{ ...mono, color: data.ok ? "#3AE86F" : data.state === "LOADING" ? "rgba(255,255,255,.55)" : "#FF7D50" }}>
                {data.ok ? `LIVE API · ${data.returned ?? 0} RECORDS · CLIMATE TRACE ${data.apiVersion || ""}` : data.state === "LOADING" ? "SOURCE LOADING" : "SOURCE UNAVAILABLE"}
              </div>
            </div>

            <div style={{ position: "relative", height: "min(68vh,720px)", minHeight: 440, marginTop: 34, border: `1px solid ${line}`, overflow: "hidden" }}>
              <div ref={mapNode} style={{ position: "absolute", inset: 0 }} aria-label="Climate TRACE agriculture emissions sources map" />
              <div style={{ position: "absolute", left: 14, bottom: 14, zIndex: 2, maxWidth: 430, padding: "12px 14px", background: "rgba(10,10,10,.88)", border: `1px solid ${line}`, backdropFilter: "blur(8px)" }}>
                <div style={{ ...mono, color: accent }}>WHAT THIS MAP ESTABLISHES</div>
                <p style={{ margin: "8px 0 0", color: "rgba(255,255,255,.76)", fontSize: 12.5, lineHeight: 1.5 }}>
                  Geolocated agriculture-sector greenhouse-gas source records from Climate TRACE. Points are inventory/model records, not live plumes and not proof of local ecosystem damage.
                </p>
                {data.error && <p style={{ margin: "8px 0 0", color: "#FF7D50", fontSize: 12 }}>SOURCE STATE · {data.error}</p>}
              </div>
            </div>
          </div>
        </section>

        <section style={{ maxWidth: 1440, margin: "0 auto", padding: "clamp(60px,8vw,110px) clamp(20px,5vw,72px)" }}>
          <div style={{ ...mono, color: accent }}>PRESSURE MAP · SAME EARTH, MORE LAYERS</div>
          <h2 style={{ margin: "12px 0 0", fontFamily: T.display, fontWeight: 500, fontSize: "clamp(32px,4.6vw,70px)", lineHeight: .95, letterSpacing: "-.045em", maxWidth: "15ch" }}>
            Follow the chain into ATLAS.
          </h2>
          <p style={{ margin: "18px 0 0", maxWidth: 720, color: dim, fontSize: 16, lineHeight: 1.65 }}>
            Each pressure opens the existing shared ATLAS with the relevant open-source layers already available there. The next build step is to let the causal graph control these layers directly without leaving this view.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,280px),1fr))", borderTop: `1px solid ${line}`, borderLeft: `1px solid ${line}`, marginTop: 38 }}>
            {FOOD_PRESSURES.map((pressure) => (
              <Link key={pressure.id} to={atlasFoodHref(pressure.atlasLayers)} style={{ minHeight: 230, padding: 25, color: "#fff", textDecoration: "none", borderRight: `1px solid ${line}`, borderBottom: `1px solid ${line}`, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <div>
                  <div style={{ ...mono, color: accent }}>{pressure.label}</div>
                  <p style={{ margin: "17px 0 0", fontFamily: T.display, fontSize: 24, lineHeight: 1.12, letterSpacing: "-.025em" }}>{pressure.question}</p>
                </div>
                <div style={{ ...mono, color: "rgba(255,255,255,.72)", marginTop: 30 }}>OPEN SOURCE LAYERS →</div>
              </Link>
            ))}
          </div>
        </section>

        <section style={{ borderTop: `1px solid ${line}`, background: "#fff", color: "#0A0A0A" }}>
          <div style={{ maxWidth: 1440, margin: "0 auto", padding: "clamp(60px,8vw,110px) clamp(20px,5vw,72px)" }}>
            <div style={{ ...mono, color: accent }}>SOURCE STACK · FOOD_</div>
            <h2 style={{ margin: "12px 0 0", fontFamily: T.display, fontWeight: 500, fontSize: "clamp(32px,4.6vw,70px)", lineHeight: .95, letterSpacing: "-.045em", maxWidth: "14ch" }}>
              Evidence before interpretation.
            </h2>
            <div style={{ marginTop: 38, borderTop: "1px solid rgba(10,10,10,.18)" }}>
              {FOOD_SOURCES.map((source) => (
                <article key={source.id} style={{ display: "grid", gridTemplateColumns: "minmax(180px,.7fr) 1.4fr", gap: 24, padding: "24px 0", borderBottom: "1px solid rgba(10,10,10,.14)" }}>
                  <div>
                    <div style={{ ...mono, color: source.state === "LIVE_API" ? "#12833d" : source.state === "ACCESS_GATED" ? "#9a5b00" : accent }}>{source.state.replaceAll("_", " ")}</div>
                    <div style={{ ...mono, color: "rgba(10,10,10,.52)", marginTop: 7 }}>{source.authority}</div>
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontFamily: T.display, fontWeight: 500, fontSize: 24, letterSpacing: "-.025em" }}>{source.label}</h3>
                    <p style={{ margin: "10px 0 0", fontSize: 14.5, lineHeight: 1.6 }}>{source.role}</p>
                    <p style={{ margin: "8px 0 0", color: "rgba(10,10,10,.56)", fontSize: 13.5, lineHeight: 1.55 }}>LIMIT · {source.limitation}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section style={{ maxWidth: 1440, margin: "0 auto", padding: "clamp(60px,8vw,110px) clamp(20px,5vw,72px)" }}>
          <div style={{ ...mono, color: accent }}>SOLUTIONS MAP · WORKING HYPOTHESES</div>
          <h2 style={{ margin: "12px 0 0", fontFamily: T.display, fontWeight: 500, fontSize: "clamp(32px,4.6vw,70px)", lineHeight: .95, letterSpacing: "-.045em", maxWidth: "13ch" }}>
            Find leverage where pressure enters.
          </h2>
          <p style={{ margin: "18px 0 0", maxWidth: 760, color: dim, fontSize: 16, lineHeight: 1.65 }}>
            These are candidate intervention levers to investigate against the pressure graph. They are not verified outcomes or universal recommendations.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,260px),1fr))", borderTop: `1px solid ${line}`, borderLeft: `1px solid ${line}`, marginTop: 38 }}>
            {FOOD_SOLUTION_LEVERS.map((solution) => (
              <article key={solution.label} style={{ minHeight: 240, padding: 24, borderRight: `1px solid ${line}`, borderBottom: `1px solid ${line}` }}>
                <div style={{ ...mono, color: accent }}>{solution.pressure}</div>
                <h3 style={{ margin: "18px 0 0", fontFamily: T.display, fontWeight: 500, fontSize: 24, letterSpacing: "-.025em" }}>{solution.label}</h3>
                <p style={{ margin: "14px 0 0", color: dim, fontSize: 14.5, lineHeight: 1.58 }}>{solution.test}</p>
              </article>
            ))}
          </div>
        </section>

        <section style={{ borderTop: `1px solid ${line}`, background: "#050505" }}>
          <div style={{ maxWidth: 1440, margin: "0 auto", padding: "clamp(60px,8vw,110px) clamp(20px,5vw,72px)" }}>
            <div style={{ ...mono, color: accent }}>20 HUMAN SYSTEM CHAINS · WORKING ATLAS FAMILIES</div>
            <h2 style={{ margin: "12px 0 0", fontFamily: T.display, fontWeight: 500, fontSize: "clamp(32px,4.6vw,70px)", lineHeight: .95, letterSpacing: "-.045em", maxWidth: "15ch" }}>
              FOOD_ proves the grammar. Then the map scales.
            </h2>
            <div style={{ marginTop: 40, display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,240px),1fr))", gap: 1, background: line, border: `1px solid ${line}` }}>
              {SAPIENS_CHAINS.map((chain, index) => (
                <article key={chain.id} style={{ minHeight: 205, padding: 22, background: chain.status === "GOLD_STANDARD" ? "#16100f" : "#0A0A0A" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                    <span style={{ ...mono, color: chain.status === "GOLD_STANDARD" ? accent : "rgba(255,255,255,.42)" }}>{String(index + 1).padStart(2, "0")}</span>
                    <span style={{ ...mono, color: chain.status === "GOLD_STANDARD" ? accent : "rgba(255,255,255,.34)" }}>{chain.status === "GOLD_STANDARD" ? "GOLD STANDARD" : "NEXT"}</span>
                  </div>
                  <h3 style={{ margin: "24px 0 0", fontFamily: T.display, fontWeight: 500, fontSize: 24, letterSpacing: "-.025em" }}>{chain.label}</h3>
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
