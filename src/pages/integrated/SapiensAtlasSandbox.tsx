import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { Link } from "react-router-dom";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import "@/styles/sapiens-atlas-story.css";
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

const mono: CSSProperties = {
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

type NeedNode = {
  id: string;
  label: string;
  sub: string;
  x: number;
  y: number;
  body: string;
};

type StoryChapter = {
  id: string;
  number: string;
  eyebrow: string;
  title: string;
  body: string;
  why: string;
  mode: RelationMode;
};

const NEED_NODES: NeedNode[] = [
  { id: "food", label: "EAT", sub: "FOOD_", x: 50, y: 8, body: "Nutrition is a biological dependency delivered through farms, fisheries, inputs, factories, trade, retail and waste systems." },
  { id: "water", label: "DRINK", sub: "WATER", x: 18, y: 28, body: "Freshwater is both a direct human dependency and a critical input into food production, processing and ecosystems." },
  { id: "energy", label: "POWER", sub: "EN4RGY_", x: 82, y: 29, body: "Energy moves through every part of the food system — fertiliser, cold chains, factories, transport, retail and homes." },
  { id: "shelter", label: "SHELTER", sub: "BUILT SYSTEM", x: 16, y: 70, body: "Buildings and cities connect materials, land, energy, water and infrastructure back to the living planet." },
  { id: "wear", label: "WEAR", sub: "F4SHION_", x: 83, y: 70, body: "Clothing links fibres, agriculture, petrochemicals, water, factories, logistics, consumers and waste." },
  { id: "move", label: "MOVE", sub: "MOBILITY", x: 50, y: 92, body: "Mobility connects energy, materials, infrastructure, trade and access across human systems." },
];

const STORY: StoryChapter[] = [
  {
    id: "human",
    number: "01",
    eyebrow: "SPECIES · HOMO SAPIENS",
    title: "You are here.",
    body: "Start with one species — us. The circles are human needs. The lines are relationships into systems that make those needs possible.",
    why: "WHAT YOU ARE SEEING · A semantic map, not a personal footprint score. Relationships become claims only when source evidence supports them.",
    mode: "DEPENDENCY",
  },
  {
    id: "food",
    number: "02",
    eyebrow: "HUMAN NEED · FOOD_",
    title: "Follow one meal.",
    body: "FOOD_ is the first Gold chain because one ordinary human need crosses biology, agriculture, fisheries, water, energy, land, processing, trade and waste.",
    why: "WHY THIS CHAPTER · It turns an abstract planetary system into something every human already understands: eating.",
    mode: "DEPENDENCY",
  },
  {
    id: "earth",
    number: "03",
    eyebrow: "SPATIAL VIEW · ATLAS",
    title: "Now put it on Earth.",
    body: "The chain becomes spatial. Production assets, source records and environmental layers can be opened on the same globe instead of living in separate dashboards.",
    why: "SOURCE-AWARE · Climate TRACE v7 agriculture source records are shown here as the first live seam. Inventory/model records are not live plumes.",
    mode: "PRESSURE",
  },
  {
    id: "pressure",
    number: "04",
    eyebrow: "RELATION · PRESSURE",
    title: "Where does demand meet pressure?",
    body: "Open land, water, climate and biodiversity context around the food system. The system can show co-location and evidence without pretending co-location proves ecological causation.",
    why: "TRUTH RULE · Source → place → pressure context is visible. Local ecological outcome requires stronger evidence than a nearby marker.",
    mode: "PRESSURE",
  },
  {
    id: "life",
    number: "05",
    eyebrow: "RELATION · DEPENDENCY + LIFE",
    title: "Then find the living system.",
    body: "Food depends on water, soils, climate and ecological functions — while food-system pressures can overlap habitats, species and living systems. Those are different relationship classes and must stay distinguishable.",
    why: "NEXT DATA DEPTH · GBIF, forest, water and other qualified spatial layers let the same view move from human system to living context without a second truth model.",
    mode: "DEPENDENCY",
  },
  {
    id: "response",
    number: "06",
    eyebrow: "SOLUTIONS MAP · RESPONSE",
    title: "Where can the system change?",
    body: "The final step is not guilt. It is leverage: interventions, actors, Missions and — only when delivery evidence exists — credible action pathways.",
    why: "RESPONSE ≠ OUTCOME · The cards are intervention hypotheses until effectiveness, operator and delivery evidence support stronger claims.",
    mode: "RESPONSE",
  },
];

const LIFE_NODES = ["LAND + SOILS", "FRESHWATER", "CLIMATE", "BIODIVERSITY"];

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

function HumanGlyph() {
  return (
    <div className="sapiens-human" aria-hidden>
      <svg viewBox="0 0 240 360" role="img">
        <defs>
          <radialGradient id="sapiens-human-glow" cx="50%" cy="46%" r="54%">
            <stop offset="0%" stopColor={accent} stopOpacity=".28" />
            <stop offset="72%" stopColor={accent} stopOpacity=".07" />
            <stop offset="100%" stopColor={accent} stopOpacity="0" />
          </radialGradient>
          <linearGradient id="sapiens-body-line" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(255,255,255,.98)" />
            <stop offset="100%" stopColor="rgba(255,255,255,.54)" />
          </linearGradient>
        </defs>
        <ellipse className="sapiens-human__halo" cx="120" cy="188" rx="112" ry="166" fill="url(#sapiens-human-glow)" />
        <circle cx="120" cy="54" r="29" fill="rgba(255,255,255,.015)" stroke="url(#sapiens-body-line)" strokeWidth="2" />
        <path d="M120 86 C86 86 72 112 74 151 L81 230 L60 329 M120 86 C154 86 168 112 166 151 L159 230 L180 329 M77 132 L38 224 M163 132 L202 224 M81 230 L120 181 L159 230" fill="none" stroke="url(#sapiens-body-line)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="120" cy="112" r="3.5" fill={accent} />
        <circle cx="120" cy="181" r="3.5" fill={accent} />
        <circle cx="120" cy="230" r="3.5" fill={accent} />
      </svg>
      <div className="sapiens-human__caption" style={mono}>HOMO SAPIENS · GBIF 10856082</div>
    </div>
  );
}

export default function SapiensAtlasSandbox() {
  const mapNode = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const [data, setData] = useState<FoodResponse>({ ok: false, state: "LOADING" });
  const [mapReady, setMapReady] = useState(false);
  const [activeChapter, setActiveChapter] = useState(0);
  const [relationMode, setRelationMode] = useState<RelationMode>("DEPENDENCY");
  const [activeStage, setActiveStage] = useState(0);
  const [selectedNeed, setSelectedNeed] = useState<string | null>(null);
  const [selectedSolution, setSelectedSolution] = useState(0);

  const chapter = STORY[activeChapter];
  const foodStage = FOOD_STAGES[activeStage];
  const selectedNeedNode = NEED_NODES.find((node) => node.id === selectedNeed) ?? null;
  const selectedSolutionNode = FOOD_SOLUTION_LEVERS[selectedSolution];

  const sourceCounts = useMemo(() => ({
    live: FOOD_SOURCES.filter((source) => source.state === "LIVE_API").length,
    atlas: FOOD_SOURCES.filter((source) => source.state === "EXISTING_ATLAS").length,
    open: FOOD_SOURCES.filter((source) => source.state === "OPEN_DATASET").length,
    gated: FOOD_SOURCES.filter((source) => source.state === "ACCESS_GATED").length,
  }), []);

  const liveLabel = data.ok
    ? `${data.returned ?? 0} LIVE RECORDS · ${data.apiVersion || "v7"}`
    : data.state === "LOADING"
      ? "LIVE SOURCE LOADING"
      : "LIVE SOURCE UNAVAILABLE";

  const liveColour = data.ok ? "#8DE6B1" : data.state === "LOADING" ? "rgba(255,255,255,.55)" : "#FF9B73";

  const scrollToChapter = (index: number) => {
    document.getElementById(`sapiens-story-${STORY[index].id}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  useEffect(() => {
    const nodes = Array.from(document.querySelectorAll<HTMLElement>("[data-sapiens-story-step]"));
    if (!nodes.length) return;
    const observer = new IntersectionObserver((entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;
      const next = Number((visible.target as HTMLElement).dataset.sapiensStoryStep ?? 0);
      setActiveChapter(next);
      setRelationMode(STORY[next].mode);
    }, { threshold: [0.35, 0.55, 0.72], rootMargin: "-8% 0px -8% 0px" });
    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!mapNode.current || mapRef.current) return;
    const map = new maplibregl.Map({
      container: mapNode.current,
      style: vectorStyle,
      center: [2, 18],
      zoom: 1.25,
      pitch: 0,
      bearing: 0,
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
          "circle-opacity": 0.72,
          "circle-radius": ["interpolate", ["linear"], ["zoom"], 1, 2.4, 6, 5.4, 10, 7],
          "circle-stroke-color": "rgba(255,255,255,.95)",
          "circle-stroke-width": 0.55,
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
        const title = document.createElement("strong");
        title.textContent = String(p.name || "Agriculture source");
        root.append(title, document.createElement("br"));
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

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) return;
    const cameras = [
      { center: [2, 18] as [number, number], zoom: 1.2, duration: 1100 },
      { center: [5, 17] as [number, number], zoom: 1.35, duration: 1300 },
      { center: [5, 17] as [number, number], zoom: 1.55, duration: 1500 },
      { center: [-18, 8] as [number, number], zoom: 1.7, duration: 1400 },
      { center: [-42, 3] as [number, number], zoom: 1.8, duration: 1400 },
      { center: [4, 16] as [number, number], zoom: 1.45, duration: 1500 },
    ];
    map.easeTo(cameras[activeChapter]);
    if (map.getLayer("food-agriculture-points")) {
      const opacity = activeChapter < 2 ? 0.08 : activeChapter === 3 ? 0.9 : activeChapter === 4 ? 0.24 : activeChapter === 5 ? 0.15 : 0.62;
      map.setPaintProperty("food-agriculture-points", "circle-opacity", opacity);
    }
  }, [activeChapter, mapReady]);

  const mapVisible = activeChapter >= 2;
  const networkClass = activeChapter === 0 ? "" : activeChapter === 1 ? "is-dimmed" : "is-ghost";
  const chainVisible = activeChapter >= 1 && activeChapter <= 3;
  const stageCardVisible = activeChapter >= 1 && activeChapter <= 5;

  return (
    <PublicShell>
      <main
        id="main-content"
        className="sapiens-story"
        style={{ "--sapiens-accent": accent } as CSSProperties}
      >
        <div className="sapiens-story-shell">
          <div className="sapiens-stage">
            <div
              ref={mapNode}
              aria-label="Climate TRACE agriculture emissions source map"
              className={`sapiens-stage__map ${mapVisible ? "is-visible" : ""} ${relationMode === "PRESSURE" ? "is-pressure" : relationMode === "RESPONSE" ? "is-response" : ""}`}
            />
            <div className={`sapiens-stage__veil ${mapVisible ? "is-visible" : ""}`} aria-hidden />

            <div className="sapiens-chrome">
              <div className="sapiens-brandline" style={mono}>S4PIENS_ · HUMAN SYSTEMS ATLAS · FOOD_ GOLD</div>
              <div className="sapiens-source-state" style={{ ...mono, color: liveColour }}>
                <span className="sapiens-source-state__dot" />
                <span>{liveLabel}</span>
              </div>
            </div>

            <nav className="sapiens-progress" aria-label="Story chapters">
              {STORY.map((item, index) => (
                <button key={item.id} type="button" className={index === activeChapter ? "is-active" : ""} onClick={() => scrollToChapter(index)} aria-label={`Open chapter ${item.number}: ${item.title}`}>
                  <span style={mono}>{item.number}</span><span />
                </button>
              ))}
            </nav>

            <div className={`sapiens-space ${networkClass}`}>
              <div className="sapiens-orbit">
                <div className="sapiens-orbit__ring" />
                <svg aria-hidden viewBox="0 0 100 100" preserveAspectRatio="none" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", overflow: "visible" }}>
                  {NEED_NODES.map((node) => (
                    <line key={node.id} x1="50" y1="50" x2={node.x} y2={node.y} className={`sapiens-node-line ${node.id === "food" && activeChapter >= 1 ? "is-hot" : ""}`} />
                  ))}
                </svg>
                <HumanGlyph />
                {NEED_NODES.map((node) => (
                  <button
                    key={node.id}
                    type="button"
                    className={`sapiens-node ${node.id === "food" && activeChapter >= 1 ? "is-hot" : ""}`}
                    style={{ left: `${node.x}%`, top: `${node.y}%` }}
                    onClick={() => setSelectedNeed(selectedNeed === node.id ? null : node.id)}
                  >
                    <span style={mono}>{node.label}<span className="sapiens-node__sub">{node.sub}</span></span>
                  </button>
                ))}
                {activeChapter === 0 && selectedNeedNode && (
                  <div className="sapiens-node-card">
                    <div style={{ ...mono, color: selectedNeedNode.id === "food" ? accent : "rgba(255,255,255,.46)" }}>{selectedNeedNode.sub}</div>
                    <h3 style={{ fontFamily: T.display }}>{selectedNeedNode.label}</h3>
                    <p>{selectedNeedNode.body}</p>
                    {selectedNeedNode.id === "food" && (
                      <button type="button" className="sapiens-action is-primary" style={mono} onClick={() => scrollToChapter(1)}>FOLLOW FOOD_ ↓</button>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className={`sapiens-life-lens ${activeChapter === 4 ? "is-visible" : ""}`} aria-hidden={activeChapter !== 4}>
              {LIFE_NODES.map((label) => <div key={label} className="sapiens-life-node" style={mono}>{label}</div>)}
            </div>

            <div className={`sapiens-response-lens ${activeChapter === 5 ? "is-visible" : ""}`} aria-hidden={activeChapter !== 5}>
              {FOOD_SOLUTION_LEVERS.slice(0, 5).map((solution, index) => (
                <button key={solution.label} type="button" className="sapiens-response-node" onClick={() => setSelectedSolution(index)}>
                  <span style={{ ...mono, color: accent }}>{solution.pressure}</span>
                  <strong style={{ display: "block", marginTop: 8, fontFamily: T.display, fontSize: 18, fontWeight: 500, lineHeight: 1.08 }}>{solution.label}</strong>
                </button>
              ))}
            </div>

            <div className={`sapiens-stage-card ${stageCardVisible ? "is-visible" : ""}`}>
              <div style={{ ...mono, color: accent }}>
                {activeChapter === 5 ? `RESPONSE · ${selectedSolutionNode?.pressure ?? "FOOD_"}` : `FOOD_ · ${String(activeStage + 1).padStart(2, "0")} / ${String(FOOD_STAGES.length).padStart(2, "0")}`}
              </div>
              <h3 style={{ fontFamily: T.display }}>{activeChapter === 5 ? selectedSolutionNode?.label : foodStage?.label}</h3>
              <p>{activeChapter === 5 ? selectedSolutionNode?.test : foodStage?.text}</p>
            </div>

            <div className={`sapiens-chainrail ${chainVisible ? "is-visible" : ""}`} aria-label="FOOD journey stages">
              {FOOD_STAGES.map((item, index) => (
                <button key={item.id} type="button" className={activeStage === index ? "is-active" : ""} onClick={() => setActiveStage(index)}>
                  <span className="sapiens-chainrail__dot">{String(index + 1).padStart(2, "0")}</span>
                  <span className="sapiens-chainrail__label" style={mono}>{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="sapiens-story-track">
            {STORY.map((item, index) => (
              <section
                key={item.id}
                id={`sapiens-story-${item.id}`}
                data-sapiens-story-step={index}
                className={`sapiens-story-chapter ${index === activeChapter ? "is-active" : ""}`}
              >
                <article className="sapiens-chapter-card">
                  <div style={{ ...mono, color: accent }}>{item.number} · {item.eyebrow}</div>
                  <h2 style={{ fontFamily: T.display }}>{item.title}</h2>
                  <p>{item.body}</p>
                  <div className="sapiens-chapter-card__why">{item.why}</div>

                  {index === 0 && (
                    <div className="sapiens-action-row">
                      <button type="button" className="sapiens-action is-primary" style={mono} onClick={() => { setSelectedNeed("food"); scrollToChapter(1); }}>FOLLOW FOOD_ ↓</button>
                      <Link className="sapiens-action" style={mono} to="/species/homo-sapiens">OPEN SPECIES →</Link>
                    </div>
                  )}

                  {index === 1 && (
                    <>
                      <p style={{ marginTop: 20, fontFamily: T.display, fontSize: 23, color: "#fff", lineHeight: 1.08 }}>What does a meal touch?</p>
                      <div className="sapiens-action-row">
                        {FOOD_STAGES.map((stage, stageIndex) => (
                          <button key={stage.id} type="button" className={`sapiens-action ${activeStage === stageIndex ? "is-primary" : ""}`} style={mono} onClick={() => setActiveStage(stageIndex)}>{String(stageIndex + 1).padStart(2, "0")}</button>
                        ))}
                      </div>
                    </>
                  )}

                  {index === 2 && (
                    <div className="sapiens-action-row">
                      <span className="sapiens-action" style={{ ...mono, cursor: "default", color: liveColour }}>{liveLabel}</span>
                      <Link className="sapiens-action" style={mono} to={atlasFoodHref(["ndvi", "precip"])}>OPEN SHARED ATLAS →</Link>
                    </div>
                  )}

                  {index === 3 && (
                    <>
                      <div className="sapiens-relation-switch" aria-label="Relationship mode">
                        {(["DEPENDENCY", "PRESSURE", "RESPONSE"] as RelationMode[]).map((mode) => (
                          <button key={mode} type="button" className={relationMode === mode ? "is-active" : ""} style={mono} onClick={() => setRelationMode(mode)}>{mode}</button>
                        ))}
                      </div>
                      <div className="sapiens-action-row">
                        {FOOD_PRESSURES.slice(0, 4).map((pressure) => (
                          <Link key={pressure.id} className="sapiens-action" style={mono} to={atlasFoodHref(pressure.atlasLayers)}>{pressure.label} →</Link>
                        ))}
                      </div>
                    </>
                  )}

                  {index === 4 && (
                    <div className="sapiens-action-row">
                      <Link className="sapiens-action is-primary" style={mono} to={livingSystemsHref()}>OPEN LIVING SYSTEMS →</Link>
                      <Link className="sapiens-action" style={mono} to="/species">EXPLORE SPECIES →</Link>
                    </div>
                  )}

                  {index === 5 && (
                    <div className="sapiens-action-row">
                      <Link className="sapiens-action is-primary" style={mono} to="/missions/food">OPEN FOOD_ MISSION →</Link>
                      <Link className="sapiens-action" style={mono} to={atlasFoodHref(["ndvi", "forest", "precip", "fires", "biodiv"])}>EXPLORE IN ATLAS →</Link>
                    </div>
                  )}
                </article>
              </section>
            ))}
          </div>
        </div>

        <section className="sapiens-proof">
          <div className="sapiens-proof__inner">
            <div style={{ ...mono, color: accent }}>THE MODEL · THREE RELATION CLASSES</div>
            <h2 style={{ margin: "12px 0 0", maxWidth: "12ch", fontFamily: T.display, fontWeight: 500, fontSize: "clamp(42px,6vw,86px)", lineHeight: .9, letterSpacing: "-.055em" }}>Understand the system without flattening it.</h2>
            <div className="sapiens-proof__grid">
              {[
                ["DEPENDENCY", "PLANET → HUMAN", "What people depend on from water, soils, climate and living systems."],
                ["PRESSURE", "HUMAN SYSTEM → PLANET", "Where demand, production, extraction, infrastructure or waste may create pressure, bounded by evidence."],
                ["RESPONSE", "SYSTEM → CHANGE", "Where credible interventions, actors and Missions can change the system."],
              ].map(([name, direction, text]) => (
                <article key={name}>
                  <div style={{ ...mono, color: accent }}>{direction}</div>
                  <h3 style={{ margin: "18px 0 0", fontFamily: T.display, fontSize: 28, fontWeight: 500 }}>{name}</h3>
                  <p style={{ margin: "12px 0 0", color: "rgba(255,255,255,.58)", fontSize: 14.5, lineHeight: 1.6 }}>{text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="sapiens-proof" style={{ background: "#0A0C0C" }}>
          <div className="sapiens-proof__inner">
            <div style={{ ...mono, color: accent }}>SOURCE STACK · FOOD_ · SOURCE-AWARE</div>
            <h2 style={{ margin: "12px 0 0", fontFamily: T.display, fontWeight: 500, fontSize: "clamp(36px,5vw,70px)", lineHeight: .94, letterSpacing: "-.05em" }}>Evidence before interpretation.</h2>
            <p style={{ margin: "18px 0 0", maxWidth: 720, color: "rgba(255,255,255,.56)", lineHeight: 1.65 }}>
              {sourceCounts.live} live API · {sourceCounts.atlas} existing ATLAS · {sourceCounts.open} open datasets · {sourceCounts.gated} access-gated. Missing or failed sources stay missing — never rendered as zero.
            </p>
            <div className="sapiens-source-table">
              {FOOD_SOURCES.map((source) => (
                <article key={source.id} className="sapiens-source-row">
                  <div>
                    <div style={{ ...mono, color: source.state === "LIVE_API" ? "#8DE6B1" : source.state === "ACCESS_GATED" ? "#E0B464" : accent }}>{source.state.replace(/_/g, " ")}</div>
                    <div style={{ ...mono, marginTop: 7, color: "rgba(255,255,255,.34)" }}>{source.authority}</div>
                  </div>
                  <div>
                    <h3 style={{ fontFamily: T.display }}>{source.label}</h3>
                    <p>{source.role}</p>
                    <p style={{ color: "rgba(255,255,255,.36)" }}>LIMIT · {source.limitation}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="sapiens-proof" style={{ background: "#050707" }}>
          <div className="sapiens-proof__inner">
            <div style={{ ...mono, color: accent }}>TRANSFER · 20 HUMAN SYSTEM CHAINS</div>
            <h2 style={{ margin: "12px 0 0", maxWidth: "15ch", fontFamily: T.display, fontWeight: 500, fontSize: "clamp(36px,5vw,70px)", lineHeight: .94, letterSpacing: "-.05em" }}>FOOD_ proves the grammar. Then the map can scale.</h2>
            <div className="sapiens-proof__grid">
              {SAPIENS_CHAINS.slice(0, 8).map((chain, index) => (
                <article key={chain.id} style={{ background: chain.status === "GOLD_STANDARD" ? "rgba(255,99,71,.055)" : undefined }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                    <span style={{ ...mono, color: chain.status === "GOLD_STANDARD" ? accent : "rgba(255,255,255,.32)" }}>{String(index + 1).padStart(2, "0")}</span>
                    <span style={{ ...mono, color: chain.status === "GOLD_STANDARD" ? accent : "rgba(255,255,255,.28)" }}>{chain.status === "GOLD_STANDARD" ? "GOLD" : "NEXT"}</span>
                  </div>
                  <h3 style={{ margin: "26px 0 0", fontFamily: T.display, fontSize: 25, fontWeight: 500 }}>{chain.label}</h3>
                  <div style={{ ...mono, marginTop: 10, color: "rgba(255,255,255,.4)" }}>HUMAN NEED · {chain.humanNeed}</div>
                  <p style={{ marginTop: 16, color: "rgba(255,255,255,.48)", fontSize: 12.5, lineHeight: 1.5 }}>{chain.pressureFamilies.join(" · ").toUpperCase()}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>
    </PublicShell>
  );
}
