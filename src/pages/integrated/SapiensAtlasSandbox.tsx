import { useEffect, useMemo, useRef, useState } from "react";
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
const dim = "rgba(255,255,255,.64)";
const panel = "rgba(5,7,8,.82)";

const mono: React.CSSProperties = {
  fontFamily: T.mono,
  fontSize: 10.5,
  letterSpacing: ".14em",
  textTransform: "uppercase",
};

type RelationMode = "DEPENDENCY" | "PRESSURE" | "RESPONSE";

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

const relationCopy: Record<RelationMode, { eyebrow: string; title: string; body: string; items: string[] }> = {
  DEPENDENCY: {
    eyebrow: "PLANET → HUMANS",
    title: "What keeps us alive?",
    body: "FOOD begins as dependency. Human nutrition relies on living and physical systems long before it becomes a product on a shelf.",
    items: ["FRESHWATER", "SOILS + NUTRIENT CYCLES", "POLLINATION + ECOLOGICAL FUNCTIONS", "CLIMATE + HABITAT CONDITIONS"],
  },
  PRESSURE: {
    eyebrow: "HUMANS → PLANET",
    title: "Where does demand become pressure?",
    body: "Follow production, inputs, infrastructure and waste into places. A mapped source is evidence of a source record — not automatic proof of ecological damage.",
    items: ["LAND CONVERSION", "WATER", "NUTRIENTS + CHEMICALS", "CLIMATE", "LIFE", "OCEAN EXTRACTION", "LOSS + WASTE"],
  },
  RESPONSE: {
    eyebrow: "SYSTEM → CHANGE",
    title: "Where can the system change?",
    body: "Response connects pressure points to intervention logic, actors and Missions. Solution levers remain hypotheses until evidence supports effectiveness and delivery.",
    items: ["AVOID HABITAT CONVERSION", "NUTRIENT EFFICIENCY", "WATER PRODUCTIVITY", "REDUCE FOOD LOSS + WASTE", "BETTER FISHERIES MANAGEMENT"],
  },
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

const livingSystemsHref = () => {
  const params = new URLSearchParams({ entity: humanId, journey: "food" });
  return `/living-systems?${params.toString()}`;
};

const formatEmissions = (value: number | null) => {
  if (!Number.isFinite(value)) return "VALUE NOT EXPOSED";
  const n = Number(value);
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return Math.round(n).toLocaleString();
};

const HumanMark = ({ mode }: { mode: RelationMode }) => {
  const glow = mode === "DEPENDENCY" ? "#76B8FF" : mode === "PRESSURE" ? accent : "#8DE6B1";
  return (
    <div aria-hidden style={{ position: "relative", width: "min(30vw,250px)", minWidth: 150, aspectRatio: "1 / 1.5", opacity: .94 }}>
      <svg viewBox="0 0 240 360" width="100%" height="100%" role="img">
        <defs>
          <radialGradient id="humanGlow" cx="50%" cy="45%" r="55%">
            <stop offset="0%" stopColor={glow} stopOpacity=".24" />
            <stop offset="100%" stopColor={glow} stopOpacity="0" />
          </radialGradient>
        </defs>
        <ellipse cx="120" cy="188" rx="115" ry="168" fill="url(#humanGlow)" />
        <circle cx="120" cy="54" r="30" fill="none" stroke="rgba(255,255,255,.92)" strokeWidth="2" />
        <path d="M120 86 C85 86 71 112 73 151 L80 232 L59 328 M120 86 C155 86 169 112 167 151 L160 232 L181 328 M76 132 L37 225 M164 132 L203 225 M80 232 L120 180 L160 232" fill="none" stroke="rgba(255,255,255,.82)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        {[54, 112, 177, 232, 292].map((y, index) => (
          <circle key={y} cx={index % 2 ? 151 : 89} cy={y} r="4.5" fill={glow} />
        ))}
      </svg>
      <div style={{ ...mono, position: "absolute", left: "50%", bottom: -8, transform: "translateX(-50%)", color: "rgba(255,255,255,.62)", whiteSpace: "nowrap" }}>HOMO SAPIENS · GBIF 10856082</div>
    </div>
  );
};

export default function SapiensAtlasSandbox() {
  const mapNode = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const [data, setData] = useState<FoodResponse>({ ok: false, state: "LOADING" });
  const [mapReady, setMapReady] = useState(false);
  const [relationMode, setRelationMode] = useState<RelationMode>("DEPENDENCY");
  const [activeStage, setActiveStage] = useState(0);

  const relation = relationCopy[relationMode];
  const stage = FOOD_STAGES[activeStage];
  const liveState = data.ok ? `${data.returned ?? 0} RECORDS · ${data.apiVersion || "v7"}` : data.state === "LOADING" ? "SOURCE LOADING" : "SOURCE UNAVAILABLE";
  const liveColour = data.ok ? "#8DE6B1" : data.state === "LOADING" ? "rgba(255,255,255,.58)" : "#FF9B73";

  const sourceCounts = useMemo(() => ({
    live: FOOD_SOURCES.filter((source) => source.state === "LIVE_API").length,
    atlas: FOOD_SOURCES.filter((source) => source.state === "EXISTING_ATLAS").length,
    open: FOOD_SOURCES.filter((source) => source.state === "OPEN_DATASET").length,
    gated: FOOD_SOURCES.filter((source) => source.state === "ACCESS_GATED").length,
  }), []);

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
        if (error?.name !== "AbortError") setData({ ok: false, state: "UNAVAILABLE", error: String(error?.message || error) });
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
        const root = document.createElement("div");
        root.style.cssText = "font:12px/1.5 system-ui;color:#0A0A0A";
        const strong = document.createElement("strong");
        strong.textContent = String(p.name || "Agriculture source");
        root.append(strong, document.createElement("br"));
        root.append(document.createTextNode(String(p.subsector || p.sector || "agriculture")), document.createElement("br"));
        root.append(document.createTextNode(`${p.country ? `${String(p.country)} · ` : ""}${String(p.year || "")}`), document.createElement("br"));
        root.append(document.createTextNode(`${amount} · ${String(p.gas || "source-defined gas")}`), document.createElement("br"));
        const note = document.createElement("span");
        note.style.opacity = ".62";
        note.textContent = "Climate TRACE inventory/model source · not a live plume";
        root.append(note);
        new maplibregl.Popup({ closeButton: true, maxWidth: "330px" }).setLngLat(coordinates).setDOMContent(root).addTo(map);
      });
      map.on("mouseenter", "food-agriculture-points", () => { map.getCanvas().style.cursor = "pointer"; });
      map.on("mouseleave", "food-agriculture-points", () => { map.getCanvas().style.cursor = ""; });
    }
  }, [data, mapReady]);

  const section: React.CSSProperties = { maxWidth: 1440, margin: "0 auto", padding: "clamp(64px,8vw,112px) clamp(20px,5vw,72px)" };
  const button = (active: boolean): React.CSSProperties => ({
    ...mono,
    appearance: "none",
    cursor: "pointer",
    border: `1px solid ${active ? "rgba(255,255,255,.78)" : line}`,
    background: active ? "rgba(255,255,255,.12)" : "rgba(8,10,10,.62)",
    color: active ? "#fff" : "rgba(255,255,255,.58)",
    padding: "11px 13px",
  });

  return (
    <PublicShell>
      <main id="main-content" style={{ background: "#080A0A", color: "#fff", minHeight: "100vh" }}>
        <section style={{ position: "relative", minHeight: "calc(100svh - 62px)", overflow: "hidden", background: "#020404" }}>
          <div ref={mapNode} aria-label="Climate TRACE agriculture emissions source map" style={{ position: "absolute", inset: 0 }} />
          <div aria-hidden style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "linear-gradient(90deg,rgba(2,4,4,.94) 0%,rgba(2,4,4,.69) 31%,rgba(2,4,4,.08) 56%,rgba(2,4,4,.28) 100%)" }} />
          <div aria-hidden style={{ position: "absolute", inset: 0, pointerEvents: "none", boxShadow: "inset 0 -170px 140px -80px #080A0A" }} />

          <div style={{ position: "relative", zIndex: 2, minHeight: "calc(100svh - 62px)", display: "grid", gridTemplateRows: "1fr auto", pointerEvents: "none" }}>
            <div style={{ width: "100%", maxWidth: 1540, margin: "0 auto", padding: "clamp(30px,5vw,72px)", display: "grid", gridTemplateColumns: "minmax(280px,.9fr) minmax(170px,.5fr) minmax(270px,.75fr)", gap: "clamp(20px,3vw,52px)", alignItems: "center" }}>
              <div style={{ pointerEvents: "auto", alignSelf: "center" }}>
                <div style={{ ...mono, color: accent }}>S4PIENS_ · HUMAN SYSTEMS ATLAS · FOOD_ GOLD 01</div>
                <h1 style={{ margin: "17px 0 0", fontFamily: T.display, fontWeight: 500, fontSize: "clamp(46px,6.8vw,104px)", lineHeight: .84, letterSpacing: "-.058em", maxWidth: "8.2ch" }}>Start with us.</h1>
                <p style={{ margin: "24px 0 0", maxWidth: 610, fontFamily: T.display, fontSize: "clamp(20px,2.2vw,34px)", lineHeight: 1.06, letterSpacing: "-.03em" }}>
                  One species. One food system. One living planet.
                </p>
                <p style={{ margin: "18px 0 0", maxWidth: 610, color: "rgba(255,255,255,.72)", fontSize: 15.5, lineHeight: 1.65 }}>
                  Follow what humans need through production, place and pressure — then trace the same system back to the living relationships that sustain us and the levers that can change it.
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 25 }}>
                  {(["DEPENDENCY", "PRESSURE", "RESPONSE"] as RelationMode[]).map((mode) => (
                    <button key={mode} type="button" onClick={() => setRelationMode(mode)} style={button(relationMode === mode)} aria-pressed={relationMode === mode}>{mode}</button>
                  ))}
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 9, marginTop: 20 }}>
                  <Link to="/species/homo-sapiens" style={{ ...mono, color: "#080A0A", background: "#fff", padding: "12px 15px", textDecoration: "none" }}>HOMO SAPIENS →</Link>
                  <Link to={livingSystemsHref()} style={{ ...mono, color: "#fff", border: `1px solid ${line}`, background: "rgba(5,7,8,.64)", padding: "11px 15px", textDecoration: "none" }}>LIVING SYSTEMS →</Link>
                </div>
              </div>

              <div style={{ display: "grid", placeItems: "center", pointerEvents: "none" }}><HumanMark mode={relationMode} /></div>

              <aside style={{ pointerEvents: "auto", alignSelf: "center", padding: "clamp(20px,2.4vw,32px)", border: `1px solid ${line}`, background: panel, backdropFilter: "blur(18px)" }}>
                <div style={{ ...mono, color: accent }}>{relation.eyebrow} · {relationMode}</div>
                <h2 style={{ margin: "13px 0 0", fontFamily: T.display, fontWeight: 500, fontSize: "clamp(26px,3vw,46px)", lineHeight: .98, letterSpacing: "-.04em" }}>{relation.title}</h2>
                <p style={{ margin: "15px 0 0", color: dim, fontSize: 14.5, lineHeight: 1.6 }}>{relation.body}</p>
                <div style={{ marginTop: 22, borderTop: `1px solid ${line}` }}>
                  {relation.items.map((item) => <div key={item} style={{ ...mono, padding: "11px 0", borderBottom: `1px solid ${line}`, color: "rgba(255,255,255,.82)" }}>{item}</div>)}
                </div>
                <div style={{ marginTop: 22 }}>
                  <div style={{ ...mono, color: liveColour }}>CLIMATE TRACE v7 · {liveState}</div>
                  <p style={{ margin: "8px 0 0", color: "rgba(255,255,255,.52)", fontSize: 12.5, lineHeight: 1.5 }}>Inventory/model source records. Not live plumes. Not proof of local ecosystem damage.</p>
                  {data.error && <p style={{ margin: "8px 0 0", color: "#FF9B73", fontSize: 12 }}>SOURCE STATE · {data.error}</p>}
                </div>
              </aside>
            </div>

            <div style={{ pointerEvents: "auto", borderTop: `1px solid ${line}`, background: "rgba(5,7,8,.88)", backdropFilter: "blur(18px)" }}>
              <div style={{ maxWidth: 1540, margin: "0 auto", padding: "14px clamp(20px,5vw,72px) 18px" }}>
                <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
                  <div style={{ ...mono, color: accent }}>FOOD_ JOURNEY · WHAT DOES A MEAL TOUCH?</div>
                  <div style={{ ...mono, color: "rgba(255,255,255,.44)" }}>SELECT A STAGE · SOURCE-AWARE PROTOTYPE</div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(7,minmax(116px,1fr))", overflowX: "auto", marginTop: 11 }}>
                  {FOOD_STAGES.map((foodStage, index) => (
                    <button key={foodStage.id} type="button" onClick={() => setActiveStage(index)} aria-pressed={activeStage === index} style={{ textAlign: "left", cursor: "pointer", minWidth: 116, minHeight: 88, padding: "13px 14px", color: "#fff", background: activeStage === index ? "rgba(255,255,255,.11)" : "transparent", border: 0, borderTop: `1px solid ${activeStage === index ? accent : line}`, borderRight: `1px solid ${line}` }}>
                      <div style={{ ...mono, color: activeStage === index ? accent : "rgba(255,255,255,.42)" }}>{String(index + 1).padStart(2, "0")}</div>
                      <div style={{ marginTop: 9, fontFamily: T.display, fontSize: 15.5, lineHeight: 1.05 }}>{foodStage.label}</div>
                    </button>
                  ))}
                </div>
                <p style={{ margin: "12px 0 0", color: "rgba(255,255,255,.62)", maxWidth: 860, fontSize: 13.5, lineHeight: 1.55 }}><strong style={{ color: "#fff" }}>{stage.label}.</strong> {stage.text}</p>
              </div>
            </div>
          </div>
        </section>

        <section style={section}>
          <div style={{ ...mono, color: accent }}>GOLD STANDARD 01 · FOOD_ · HUMAN → SYSTEM → PLANET</div>
          <h2 style={{ margin: "14px 0 0", fontFamily: T.display, fontWeight: 500, fontSize: "clamp(38px,5.8vw,86px)", lineHeight: .9, letterSpacing: "-.05em", maxWidth: "11ch" }}>What does a meal touch?</h2>
          <p style={{ margin: "22px 0 0", maxWidth: 800, color: dim, fontSize: 17, lineHeight: 1.65 }}>
            FOOD_ is the first full causal-chain test because it crosses land, water, nutrients, climate, biodiversity, energy, trade and waste in one human need. This is a source-aware prototype, not a personal footprint score.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,220px),1fr))", borderTop: `1px solid ${line}`, borderLeft: `1px solid ${line}`, marginTop: 42 }}>
            {FOOD_STAGES.map((foodStage, index) => (
              <button key={foodStage.id} type="button" onClick={() => setActiveStage(index)} style={{ textAlign: "left", color: "#fff", cursor: "pointer", minHeight: 230, padding: 24, background: activeStage === index ? "#171311" : "transparent", border: 0, borderRight: `1px solid ${line}`, borderBottom: `1px solid ${line}` }}>
                <div style={{ ...mono, color: accent }}>{String(index + 1).padStart(2, "0")}</div>
                <h3 style={{ margin: "22px 0 0", fontFamily: T.display, fontWeight: 500, fontSize: 24 }}>{foodStage.label}</h3>
                <p style={{ margin: "14px 0 0", color: dim, fontSize: 14.5, lineHeight: 1.58 }}>{foodStage.text}</p>
              </button>
            ))}
          </div>
        </section>

        <section style={{ borderTop: `1px solid ${line}`, borderBottom: `1px solid ${line}`, background: "#050606" }}>
          <div style={section}>
            <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(280px,.5fr)", gap: "clamp(30px,5vw,80px)" }}>
              <div>
                <div style={{ ...mono, color: accent }}>PRESSURE MAP · SHARED ATLAS</div>
                <h2 style={{ margin: "12px 0 0", fontFamily: T.display, fontWeight: 500, fontSize: "clamp(32px,4.6vw,70px)", lineHeight: .95, letterSpacing: "-.045em", maxWidth: "15ch" }}>Follow the chain into the planet.</h2>
                <p style={{ margin: "18px 0 0", maxWidth: 700, color: dim, lineHeight: 1.6 }}>The sandbox does not replace ATLAS. Each pressure opens the existing shared spatial engine with the relevant current layers and Homo sapiens/FOOD context preserved.</p>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", borderTop: `1px solid ${line}`, borderLeft: `1px solid ${line}` }}>
                {[["LIVE API", sourceCounts.live], ["ATLAS", sourceCounts.atlas], ["OPEN NEXT", sourceCounts.open], ["GATED", sourceCounts.gated]].map(([label, count]) => (
                  <div key={String(label)} style={{ padding: 18, borderRight: `1px solid ${line}`, borderBottom: `1px solid ${line}` }}><div style={{ ...mono, color: "rgba(255,255,255,.48)" }}>{label}</div><div style={{ marginTop: 8, fontFamily: T.display, fontSize: 34 }}>{count}</div></div>
                ))}
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,280px),1fr))", borderTop: `1px solid ${line}`, borderLeft: `1px solid ${line}`, marginTop: 38 }}>
              {FOOD_PRESSURES.map((pressure) => (
                <Link key={pressure.id} to={atlasFoodHref(pressure.atlasLayers)} style={{ minHeight: 220, padding: 24, color: "#fff", textDecoration: "none", borderRight: `1px solid ${line}`, borderBottom: `1px solid ${line}`, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                  <div><div style={{ ...mono, color: accent }}>{pressure.label}</div><p style={{ margin: "17px 0 0", fontFamily: T.display, fontSize: 23, lineHeight: 1.12 }}>{pressure.question}</p></div>
                  <div style={{ ...mono, color: "rgba(255,255,255,.72)" }}>OPEN SOURCE LAYERS IN ATLAS →</div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section style={{ borderTop: `1px solid ${line}`, background: "#F4F2EC", color: "#0A0A0A" }}>
          <div style={section}>
            <div style={{ ...mono, color: accent }}>SOURCE STACK · FOOD_</div>
            <h2 style={{ margin: "12px 0 0", fontFamily: T.display, fontWeight: 500, fontSize: "clamp(32px,4.6vw,70px)", lineHeight: .95, letterSpacing: "-.045em" }}>Evidence before interpretation.</h2>
            <p style={{ margin: "18px 0 0", maxWidth: 760, color: "rgba(10,10,10,.62)", lineHeight: 1.6 }}>Climate TRACE is the first live seam. Existing ATLAS layers stay shared. Open datasets are admitted only after their time, geography, licence and limitations are made explicit.</p>
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
          <div style={{ ...mono, color: accent }}>SOLUTIONS MAP · RESPONSE · WORKING HYPOTHESES</div>
          <h2 style={{ margin: "12px 0 0", fontFamily: T.display, fontWeight: 500, fontSize: "clamp(32px,4.6vw,70px)", lineHeight: .95, letterSpacing: "-.045em", maxWidth: "13ch" }}>Find leverage where pressure enters.</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,260px),1fr))", borderTop: `1px solid ${line}`, borderLeft: `1px solid ${line}`, marginTop: 38 }}>
            {FOOD_SOLUTION_LEVERS.map((solution) => (
              <article key={solution.label} style={{ minHeight: 225, padding: 24, borderRight: `1px solid ${line}`, borderBottom: `1px solid ${line}` }}>
                <div style={{ ...mono, color: accent }}>{solution.pressure}</div><h3 style={{ margin: "18px 0 0", fontFamily: T.display, fontWeight: 500, fontSize: 23 }}>{solution.label}</h3><p style={{ margin: "14px 0 0", color: dim, fontSize: 14.5, lineHeight: 1.58 }}>{solution.test}</p>
              </article>
            ))}
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 30 }}>
            <Link to="/missions/food" style={{ ...mono, textDecoration: "none", background: "#fff", color: "#080A0A", padding: "13px 18px" }}>ENTER FOOD_ MISSION →</Link>
            <Link to="/species/homo-sapiens" style={{ ...mono, textDecoration: "none", color: "#fff", border: `1px solid ${line}`, padding: "12px 18px" }}>RETURN TO HOMO SAPIENS →</Link>
          </div>
        </section>

        <section style={{ borderTop: `1px solid ${line}`, background: "#050606" }}>
          <div style={section}>
            <div style={{ ...mono, color: accent }}>20 HUMAN SYSTEM CHAINS · ONE SHARED GRAMMAR</div>
            <h2 style={{ margin: "12px 0 0", fontFamily: T.display, fontWeight: 500, fontSize: "clamp(32px,4.6vw,70px)", lineHeight: .95, letterSpacing: "-.045em", maxWidth: "15ch" }}>FOOD_ proves the grammar. Then the map scales.</h2>
            <div style={{ marginTop: 40, display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,240px),1fr))", gap: 1, background: line, border: `1px solid ${line}` }}>
              {SAPIENS_CHAINS.map((chain, index) => (
                <article key={chain.id} style={{ minHeight: 195, padding: 22, background: chain.status === "GOLD_STANDARD" ? "#1B1411" : "#080A0A" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}><span style={{ ...mono, color: chain.status === "GOLD_STANDARD" ? accent : "rgba(255,255,255,.42)" }}>{String(index + 1).padStart(2, "0")}</span><span style={{ ...mono, color: chain.status === "GOLD_STANDARD" ? accent : "rgba(255,255,255,.34)" }}>{chain.status === "GOLD_STANDARD" ? "GOLD STANDARD" : "NEXT"}</span></div>
                  <h3 style={{ margin: "24px 0 0", fontFamily: T.display, fontWeight: 500, fontSize: 24 }}>{chain.label}</h3>
                  <div style={{ ...mono, marginTop: 10, color: "rgba(255,255,255,.52)" }}>HUMAN NEED · {chain.humanNeed}</div>
                  <p style={{ margin: "17px 0 0", color: "rgba(255,255,255,.56)", fontSize: 12.5, lineHeight: 1.5 }}>{chain.pressureFamilies.join(" · ").toUpperCase()}</p>
                </article>
              ))}
            </div>
            <div style={{ marginTop: 34, paddingTop: 22, borderTop: `1px solid ${line}`, display: "flex", justifyContent: "space-between", gap: 18, flexWrap: "wrap" }}>
              <div style={{ ...mono, color: "rgba(255,255,255,.52)" }}>ARCHITECTURE · ATLAS = SPACE · SPECIES = IDENTITY · LIVING SYSTEMS = RELATIONSHIPS · S4PIENS = HUMAN-SYSTEM LENS</div>
              <Link to={atlasFoodHref(["ndvi", "forest", "precip", "fires", "biodiv"])} style={{ ...mono, textDecoration: "none", color: "#fff" }}>OPEN FOOD_ IN SHARED ATLAS →</Link>
            </div>
          </div>
        </section>
      </main>
    </PublicShell>
  );
}
