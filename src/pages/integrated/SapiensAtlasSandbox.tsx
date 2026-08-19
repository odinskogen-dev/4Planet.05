import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { Link } from "react-router-dom";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import "@/styles/sapiens-atlas-story.css";
import { PublicShell } from "@/components/layout/PublicShell";
import { gibs } from "@/earth/layers";
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
type SceneMode = "HUMAN_GRAPH" | "CHAIN_GRAPH" | "ATLAS" | "PRESSURE_ATLAS" | "LIFE_GRAPH" | "SOLUTION_GRAPH";
type NodeKind = "human" | "need" | "chain" | "life" | "solution" | "pressure";

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
  state?: string;
  error?: string;
};

type StoryChapter = {
  id: string;
  number: string;
  eyebrow: string;
  title: string;
  body: string;
  truth: string;
  scene: SceneMode;
  mode: RelationMode;
};

type GraphNode = {
  id: string;
  label: string;
  kicker: string;
  x: number;
  y: number;
  kind: NodeKind;
  detail: string;
};

type GraphScene = { nodes: GraphNode[]; links: { from: string; to: string; relation: RelationMode }[] };

const STORY: StoryChapter[] = [
  {
    id: "human",
    number: "01",
    eyebrow: "SPECIES · HOMO SAPIENS",
    title: "You are here.",
    body: "Start with one species — us. The circles are human needs. The lines are relationships into systems that make those needs possible.",
    truth: "WHAT YOU ARE SEEING · A semantic map, not a personal footprint score. Relationships become claims only when source evidence supports them.",
    scene: "HUMAN_GRAPH",
    mode: "DEPENDENCY",
  },
  {
    id: "food",
    number: "02",
    eyebrow: "HUMAN NEED · FOOD_",
    title: "Follow one meal.",
    body: "FOOD_ is the first Gold chain because one ordinary human need crosses biology, agriculture, fisheries, water, energy, land, processing, trade and waste.",
    truth: "WHY THIS CHAPTER · It turns an abstract planetary system into something every human already understands: eating.",
    scene: "CHAIN_GRAPH",
    mode: "DEPENDENCY",
  },
  {
    id: "atlas",
    number: "03",
    eyebrow: "SPATIAL VIEW · ATLAS_",
    title: "Now put it on Earth.",
    body: "The chain becomes spatial. Production assets, source records and environmental layers can be opened on the same globe instead of living in separate dashboards.",
    truth: "SOURCE-AWARE · Climate TRACE agriculture source records are shown here as the first live seam. Inventory/model records are not a live plume.",
    scene: "ATLAS",
    mode: "DEPENDENCY",
  },
  {
    id: "pressure",
    number: "04",
    eyebrow: "RELATION · PRESSURE",
    title: "Where does demand meet pressure?",
    body: "Open land, water, climate and biodiversity context around the food system. The system can show co-location and evidence without pretending co-location proves ecological causation.",
    truth: "TRUTH RULE · Source → place → pressure context is visible. Local ecological outcome requires stronger evidence than a nearby marker.",
    scene: "PRESSURE_ATLAS",
    mode: "PRESSURE",
  },
  {
    id: "life",
    number: "05",
    eyebrow: "RELATION · DEPENDENCY + LIFE",
    title: "Then find the living system.",
    body: "Food depends on water, soils, climate and ecological functions — while food-system pressures can overlap habitats, species and living systems. Those are different relationship classes and must stay distinguishable.",
    truth: "NEXT DATA DEPTH · GBIF, forest, water and other qualified spatial layers let the same view move from human system to living context without a second truth model.",
    scene: "LIFE_GRAPH",
    mode: "DEPENDENCY",
  },
  {
    id: "response",
    number: "06",
    eyebrow: "SOLUTIONS MAP · RESPONSE",
    title: "Where can the system change?",
    body: "The final step is not guilt. It is leverage: interventions, actors, Missions and — only when delivery evidence exists — credible action pathways.",
    truth: "RESPONSE ≠ OUTCOME · The cards are intervention hypotheses until effectiveness, operator and delivery evidence support stronger claims.",
    scene: "SOLUTION_GRAPH",
    mode: "RESPONSE",
  },
];

const HUMAN_GRAPH: GraphScene = {
  nodes: [
    { id: "human", label: "HOMO SAPIENS", kicker: "SPECIES", x: 50, y: 51, kind: "human", detail: "One species inside the living planet — dependent on living systems and capable of changing human systems." },
    { id: "food", label: "EAT", kicker: "FOOD_", x: 18, y: 27, kind: "need", detail: "Nutrition is a biological dependency delivered through farms, fisheries, inputs, factories, trade, retail and waste systems." },
    { id: "water", label: "DRINK", kicker: "WATER", x: 50, y: 14, kind: "need", detail: "Freshwater is a direct dependency and a critical input into food production, processing and ecosystems." },
    { id: "energy", label: "POWER", kicker: "EN4RGY_", x: 82, y: 28, kind: "need", detail: "Energy moves through fertiliser, machinery, factories, cold chains, transport, retail and homes." },
    { id: "shelter", label: "SHELTER", kicker: "BUILT SYSTEM", x: 19, y: 77, kind: "need", detail: "Buildings and cities connect land, energy, water, materials and infrastructure back to the living planet." },
    { id: "wear", label: "WEAR", kicker: "F4SHION_", x: 81, y: 77, kind: "need", detail: "Clothing links fibres, agriculture, petrochemicals, water, factories, logistics, consumers and waste." },
    { id: "move", label: "MOVE", kicker: "MOBILITY", x: 50, y: 89, kind: "need", detail: "Mobility connects energy, materials, infrastructure, trade and access across human systems." },
  ],
  links: ["food", "water", "energy", "shelter", "wear", "move"].map((id) => ({ from: "human", to: id, relation: "DEPENDENCY" as RelationMode })),
};

const chainPositions = [[50, 15], [76, 25], [86, 52], [73, 79], [50, 88], [27, 79], [14, 52]];
const CHAIN_GRAPH: GraphScene = {
  nodes: [
    { id: "food-core", label: "FOOD_", kicker: "HUMAN NEED", x: 50, y: 52, kind: "chain", detail: "One familiar human need becomes a spatial system when its stages, places, dependencies and pressures can be inspected together." },
    ...FOOD_STAGES.map((stage, index) => ({
      id: `stage:${stage.id}`,
      label: stage.label,
      kicker: String(index + 1).padStart(2, "0"),
      x: chainPositions[index][0],
      y: chainPositions[index][1],
      kind: "chain" as NodeKind,
      detail: stage.text,
    })),
  ],
  links: FOOD_STAGES.map((stage) => ({ from: "food-core", to: `stage:${stage.id}`, relation: "DEPENDENCY" as RelationMode })),
};

const LIFE_GRAPH: GraphScene = {
  nodes: [
    { id: "food-system", label: "FOOD SYSTEM", kicker: "HUMAN SYSTEM", x: 50, y: 51, kind: "chain", detail: "The human system becomes a relationship hub rather than a single impact score." },
    { id: "soil", label: "SOILS", kicker: "LIVING FOUNDATION", x: 19, y: 25, kind: "life", detail: "Soil condition, nutrients and food production can be related only at the depth supported by source evidence." },
    { id: "freshwater", label: "FRESHWATER", kicker: "DEPENDENCY", x: 50, y: 14, kind: "life", detail: "Water resources, irrigation, withdrawals and water stress belong in the same relationship model with source-specific limits." },
    { id: "climate", label: "CLIMATE", kicker: "CONDITION", x: 82, y: 27, kind: "life", detail: "Temperature, precipitation and greenhouse-gas pressure remain distinct signals rather than one collapsed score." },
    { id: "biodiversity", label: "BIODIVERSITY", kicker: "LIFE", x: 18, y: 78, kind: "life", detail: "GBIF records are observations, not population estimates. They can add living context without becoming causal proof." },
    { id: "forest", label: "FORESTS", kicker: "LAND SYSTEM", x: 50, y: 89, kind: "life", detail: "Tree-cover change can provide spatial context; tree-cover loss is not automatically deforestation or proof of a commodity driver." },
    { id: "ocean", label: "MARINE SYSTEMS", kicker: "SEAFOOD", x: 82, y: 77, kind: "life", detail: "Fisheries, marine life and ocean conditions enter when the FOOD_ chain extends into seafood." },
  ],
  links: ["soil", "freshwater", "climate", "biodiversity", "forest", "ocean"].map((id) => ({ from: "food-system", to: id, relation: "DEPENDENCY" as RelationMode })),
};

const solutionPositions = [[19, 24], [50, 14], [82, 27], [18, 78], [50, 89], [82, 76]];
const SOLUTION_GRAPH: GraphScene = {
  nodes: [
    { id: "pressure-core", label: "PRESSURE", kicker: "SYSTEM SIGNAL", x: 50, y: 51, kind: "pressure", detail: "Specific pressure classes make it possible to connect interventions to the part of the system they are intended to change." },
    ...FOOD_SOLUTION_LEVERS.slice(0, 6).map((solution, index) => ({
      id: `solution:${index}`,
      label: solution.label,
      kicker: solution.pressure,
      x: solutionPositions[index][0],
      y: solutionPositions[index][1],
      kind: "solution" as NodeKind,
      detail: solution.test,
    })),
  ],
  links: FOOD_SOLUTION_LEVERS.slice(0, 6).map((_, index) => ({ from: "pressure-core", to: `solution:${index}`, relation: "RESPONSE" as RelationMode })),
};

const GRAPH_SCENES: Partial<Record<SceneMode, GraphScene>> = { HUMAN_GRAPH, CHAIN_GRAPH, LIFE_GRAPH, SOLUTION_GRAPH };

const atlasFoodHref = (layers: readonly string[]) => {
  const params = new URLSearchParams({ m: "S4PIENS", l: ["bluemarble", ...layers].join(","), journey: "food", entity: humanId });
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

function relationStroke(relation: RelationMode) {
  if (relation === "PRESSURE") return "var(--sapiens-accent)";
  if (relation === "RESPONSE") return "#8FE6B7";
  return "rgba(255,255,255,.34)";
}

function HumanGlyph() {
  return (
    <svg className="sapiens-human-glyph" viewBox="0 0 180 320" aria-hidden>
      <circle cx="90" cy="35" r="25" />
      <path d="M90 62 C64 62 53 82 55 116 L62 200 L45 292 M90 62 C116 62 127 82 125 116 L118 200 L135 292 M58 102 L31 182 M122 102 L149 182 M62 200 L90 155 L118 200" />
      <circle className="sapiens-human-glyph__core" cx="90" cy="135" r="4" />
    </svg>
  );
}

function KnowledgeGraph({ scene, activeNode, onSelect }: { scene: SceneMode; activeNode: string | null; onSelect: (node: GraphNode) => void }) {
  const graph = GRAPH_SCENES[scene];
  if (!graph) return null;
  const nodeById = new Map(graph.nodes.map((node) => [node.id, node]));
  const humanScene = scene === "HUMAN_GRAPH";
  return (
    <div className={`sapiens-knowledge is-${scene.toLowerCase()}`} aria-label="Interactive S4PIENS system graph">
      <div className="sapiens-orbits" aria-hidden><i /><i /><i /><i /></div>
      <svg className="sapiens-knowledge__links" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
        {graph.links.map((link) => {
          const from = nodeById.get(link.from);
          const to = nodeById.get(link.to);
          if (!from || !to) return null;
          return <line key={`${link.from}-${link.to}`} x1={from.x} y1={from.y} x2={to.x} y2={to.y} style={{ stroke: relationStroke(link.relation) }} className={`sapiens-knowledge__link is-${link.relation.toLowerCase()}`} />;
        })}
      </svg>
      {graph.nodes.map((node) => {
        const isHuman = node.kind === "human";
        return (
          <button
            key={node.id}
            type="button"
            className={`sapiens-knowledge__node is-${node.kind} ${activeNode === node.id ? "is-active" : ""}`}
            style={{ left: `${node.x}%`, top: `${node.y}%` }}
            onClick={() => onSelect(node)}
            aria-label={`${node.kicker}: ${node.label}`}
          >
            {isHuman && humanScene ? <HumanGlyph /> : <><span className="sapiens-knowledge__kicker" style={mono}>{node.kicker}</span><strong>{node.label}</strong></>}
          </button>
        );
      })}
    </div>
  );
}

function sourceTone(state: string) {
  if (state === "LIVE_API") return "is-live";
  if (state === "EXISTING_ATLAS") return "is-atlas";
  if (state === "OPEN_DATASET") return "is-open";
  if (state === "RIGHTS_REVIEW") return "is-rights";
  return "is-gated";
}

export default function SapiensAtlasSandbox() {
  const mapNode = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const [data, setData] = useState<FoodResponse>({ ok: false, state: "LOADING" });
  const [mapReady, setMapReady] = useState(false);
  const [activeChapter, setActiveChapter] = useState(0);
  const [relationMode, setRelationMode] = useState<RelationMode>("DEPENDENCY");
  const [activeStage, setActiveStage] = useState(0);
  const [activeGraphNode, setActiveGraphNode] = useState<GraphNode | null>(null);

  const chapter = STORY[activeChapter];
  const currentGraph = GRAPH_SCENES[chapter.scene];
  const liveLabel = data.ok ? `${data.returned ?? 0} LIVE RECORDS · ${data.apiVersion || "V7"}` : data.state === "LOADING" ? "SOURCE LOADING" : "SOURCE UNAVAILABLE";
  const liveColour = data.ok ? "#8FE6B7" : data.state === "LOADING" ? "rgba(255,255,255,.55)" : accent;

  const sourceCounts = useMemo(() => ({
    live: FOOD_SOURCES.filter((source) => source.state === "LIVE_API").length,
    atlas: FOOD_SOURCES.filter((source) => source.state === "EXISTING_ATLAS").length,
    open: FOOD_SOURCES.filter((source) => source.state === "OPEN_DATASET").length,
    rights: FOOD_SOURCES.filter((source) => source.state === "RIGHTS_REVIEW").length,
    gated: FOOD_SOURCES.filter((source) => source.state === "ACCESS_GATED").length,
  }), []);

  const scrollToChapter = (index: number) => {
    document.getElementById(`sapiens-story-${STORY[index].id}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  useEffect(() => {
    const updateNav = () => document.body.classList.toggle("sapiens-immersive-nav", window.scrollY < window.innerHeight * 5.85);
    updateNav();
    window.addEventListener("scroll", updateNav, { passive: true });
    window.addEventListener("resize", updateNav, { passive: true });
    return () => {
      document.body.classList.remove("sapiens-immersive-nav");
      window.removeEventListener("scroll", updateNav);
      window.removeEventListener("resize", updateNav);
    };
  }, []);

  useEffect(() => {
    const nodes = Array.from(document.querySelectorAll<HTMLElement>("[data-sapiens-story-step]"));
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;
      const next = Number((visible.target as HTMLElement).dataset.sapiensStoryStep ?? 0);
      setActiveChapter(next);
      setRelationMode(STORY[next].mode);
      setActiveGraphNode(null);
    }, { threshold: [0.35, 0.55, 0.72], rootMargin: "-8% 0px -8% 0px" });
    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!mapNode.current || mapRef.current) return;
    const map = new maplibregl.Map({
      container: mapNode.current,
      style: vectorStyle,
      center: [-18, 16],
      zoom: 0.82,
      pitch: 0,
      bearing: 0,
      attributionControl: { compact: true },
      renderWorldCopies: false,
    });
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "bottom-right");
    map.on("load", () => {
      try { map.setProjection({ type: "globe" }); } catch { /* honest mercator fallback */ }
      try {
        if (!map.getSource("sapiens-blue-marble")) {
          map.addSource("sapiens-blue-marble", {
            type: "raster",
            tiles: [gibs("BlueMarble_ShadedRelief_Bathymetry", "default", 8, "jpeg")],
            tileSize: 256,
            attribution: "NASA GIBS / Blue Marble",
          });
          const firstSymbol = map.getStyle().layers?.find((layer) => layer.type === "symbol")?.id;
          map.addLayer({
            id: "sapiens-blue-marble",
            type: "raster",
            source: "sapiens-blue-marble",
            paint: { "raster-opacity": 0.98, "raster-saturation": -0.16, "raster-contrast": 0.12, "raster-brightness-max": 0.82 },
          }, firstSymbol);
        }
      } catch { /* vector basemap remains available */ }
      setMapReady(true);
    });
    mapRef.current = map;
    return () => { map.remove(); mapRef.current = null; };
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/sapiens-food?year=2024&gas=co2e_100yr&limit=700", { signal: controller.signal })
      .then(async (response) => {
        const body = await response.json();
        if (!response.ok || !body?.ok) throw new Error(body?.error || `HTTP ${response.status}`);
        setData(body);
      })
      .catch((error) => { if (error?.name !== "AbortError") setData({ ok: false, state: "UNAVAILABLE", error: String(error?.message || error) }); });
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
        properties: { id: source.id || "", name: source.name, sector: source.sector, subsector: source.subsector || "", country: source.country || "", emissions: source.emissions, gas: source.gas, year: source.year },
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
          "circle-opacity": 0.16,
          "circle-radius": ["interpolate", ["linear"], ["zoom"], 1, 2.4, 6, 5.2, 10, 7],
          "circle-stroke-color": "#FFFFFF",
          "circle-stroke-width": 0.45,
        },
      });
      map.on("click", "food-agriculture-points", (event) => {
        const feature = event.features?.[0];
        if (!feature || feature.geometry.type !== "Point") return;
        const p = feature.properties || {};
        const root = document.createElement("div");
        root.style.cssText = "font:12px/1.5 system-ui;color:#0A0A0A;min-width:220px";
        const title = document.createElement("strong");
        title.textContent = String(p.name || "Agriculture source");
        root.append(title, document.createElement("br"));
        root.append(document.createTextNode(String(p.subsector || p.sector || "agriculture")), document.createElement("br"));
        root.append(document.createTextNode(`${p.country ? `${String(p.country)} · ` : ""}${String(p.year || "")}`), document.createElement("br"));
        root.append(document.createTextNode(`${formatEmissions(Number(p.emissions))} · ${String(p.gas || "source-defined gas")}`), document.createElement("br"));
        const note = document.createElement("span");
        note.style.opacity = ".58";
        note.textContent = "Climate TRACE inventory/model source · not a live plume";
        root.append(note);
        new maplibregl.Popup({ closeButton: true, maxWidth: "330px" }).setLngLat(feature.geometry.coordinates as [number, number]).setDOMContent(root).addTo(map);
      });
    }
  }, [data, mapReady]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) return;
    if (chapter.scene === "ATLAS" || chapter.scene === "PRESSURE_ATLAS") {
      map.easeTo({ center: chapter.scene === "ATLAS" ? [-18, 16] : [-43, 1], zoom: chapter.scene === "ATLAS" ? 0.85 : 1.15, duration: 1450 });
    }
    if (map.getLayer("food-agriculture-points")) {
      map.setPaintProperty("food-agriculture-points", "circle-opacity", chapter.scene === "PRESSURE_ATLAS" ? 0.9 : chapter.scene === "ATLAS" ? 0.28 : 0.03);
    }
    if (map.getLayer("sapiens-blue-marble")) map.setPaintProperty("sapiens-blue-marble", "raster-opacity", chapter.scene === "ATLAS" || chapter.scene === "PRESSURE_ATLAS" ? 0.98 : 0.12);
  }, [chapter.scene, mapReady]);

  const handleGraphSelect = (node: GraphNode) => {
    setActiveGraphNode(node);
    if (node.id.startsWith("stage:")) {
      const stageId = node.id.replace("stage:", "");
      const index = FOOD_STAGES.findIndex((stage) => stage.id === stageId);
      if (index >= 0) setActiveStage(index);
    }
  };

  return (
    <PublicShell>
      <div className="sapiens-story" style={{ "--sapiens-accent": accent } as CSSProperties}>
        <div className="sapiens-story-shell">
          <div className={`sapiens-stage chapter-${activeChapter + 1} scene-${chapter.scene.toLowerCase()}`}>
            <div className="sapiens-cosmos" aria-hidden />
            <div ref={mapNode} aria-label="S4PIENS Atlas — NASA Earth with Climate TRACE agriculture sources" className="sapiens-stage__map" />
            <div className="sapiens-stage__scrim" aria-hidden />

            <div className="sapiens-chrome" aria-hidden>
              <div className="sapiens-brandline" style={mono}>S4PIENS_ · HUMAN SYSTEMS ATLAS · FOOD_ GOLD</div>
              <div className="sapiens-source-state" style={{ ...mono, color: liveColour }}>NASA EARTH · {liveLabel}</div>
            </div>

            <nav className="sapiens-progress" aria-label="S4PIENS story chapters">
              {STORY.map((item, index) => (
                <button key={item.id} type="button" className={index === activeChapter ? "is-active" : ""} onClick={() => scrollToChapter(index)} aria-label={`Open chapter ${item.number}: ${item.title}`}>
                  <span style={mono}>{item.number}</span><span aria-hidden />
                </button>
              ))}
            </nav>

            {currentGraph && <KnowledgeGraph scene={chapter.scene} activeNode={activeGraphNode?.id ?? null} onSelect={handleGraphSelect} />}

            {activeGraphNode && currentGraph && (
              <aside className="sapiens-node-inspect" aria-live="polite">
                <div style={{ ...mono, color: accent }}>{activeGraphNode.kicker}</div>
                <h3>{activeGraphNode.label}</h3>
                <p>{activeGraphNode.detail}</p>
                {activeGraphNode.id === "food" && <button type="button" onClick={() => scrollToChapter(1)} style={mono}>FOLLOW FOOD_ →</button>}
              </aside>
            )}

            <section className="sapiens-story-card" aria-live="polite">
              <div className="sapiens-story-card__eyebrow" style={{ ...mono, color: accent }}>{chapter.number} · {chapter.eyebrow}</div>
              <h1>{chapter.title}</h1>
              <p>{chapter.body}</p>
              <div className="sapiens-story-card__truth">{chapter.truth}</div>

              {activeChapter === 0 && (
                <div className="sapiens-action-row">
                  <button type="button" className="sapiens-action is-primary" style={mono} onClick={() => scrollToChapter(1)}>FOLLOW FOOD_ ↓</button>
                  <Link className="sapiens-action" style={mono} to="/species/homo-sapiens">OPEN SPECIES →</Link>
                </div>
              )}

              {activeChapter === 1 && (
                <>
                  <div className="sapiens-card-question">What does a meal touch?</div>
                  <div className="sapiens-mini-rail" aria-label="FOOD journey stages">
                    {FOOD_STAGES.map((stage, index) => (
                      <button key={stage.id} type="button" className={activeStage === index ? "is-active" : ""} aria-label={`${String(index + 1).padStart(2, "0")}: ${stage.label}`} onClick={() => { setActiveStage(index); setActiveGraphNode(CHAIN_GRAPH.nodes.find((node) => node.id === `stage:${stage.id}`) ?? null); }}>
                        {String(index + 1).padStart(2, "0")}
                      </button>
                    ))}
                  </div>
                  <div className="sapiens-action-row"><button type="button" className="sapiens-action is-primary" style={mono} onClick={() => scrollToChapter(2)}>PUT IT ON EARTH ↓</button></div>
                </>
              )}

              {activeChapter === 2 && (
                <div className="sapiens-action-row">
                  <span className="sapiens-action is-status" style={mono}>{liveLabel}</span>
                  <Link className="sapiens-action is-primary" style={mono} to={atlasFoodHref([])}>OPEN SHARED ATLAS →</Link>
                </div>
              )}

              {activeChapter === 3 && (
                <>
                  <div className="sapiens-relation-switch" aria-label="Relationship mode">
                    {(["DEPENDENCY", "PRESSURE", "RESPONSE"] as RelationMode[]).map((mode) => <button key={mode} type="button" className={relationMode === mode ? "is-active" : ""} style={mono} onClick={() => setRelationMode(mode)}>{mode}</button>)}
                  </div>
                  <div className="sapiens-action-row sapiens-action-row--pressures">
                    {FOOD_PRESSURES.slice(0, 4).map((pressure) => <Link key={pressure.id} className="sapiens-action" style={mono} to={atlasFoodHref(pressure.atlasLayers)}>{pressure.label} →</Link>)}
                  </div>
                </>
              )}

              {activeChapter === 4 && (
                <div className="sapiens-action-row">
                  <Link className="sapiens-action is-primary" style={mono} to={livingSystemsHref()}>OPEN LIVING SYSTEMS →</Link>
                  <Link className="sapiens-action" style={mono} to="/species">EXPLORE SPECIES →</Link>
                </div>
              )}

              {activeChapter === 5 && (
                <div className="sapiens-action-row">
                  <Link className="sapiens-action is-primary" style={mono} to="/missions/food">OPEN FOOD_ MISSION →</Link>
                  <Link className="sapiens-action" style={mono} to={atlasFoodHref(["ndvi", "forest", "precip", "fires", "biodiv"])}>EXPLORE IN ATLAS →</Link>
                </div>
              )}
            </section>

            {activeChapter === 2 && (
              <aside className="sapiens-pressure-teaser">
                <div style={{ ...mono, color: "#7CA8FF" }}>04 · PRESSURE · SYSTEM CONSEQUENCE_</div>
                <h3>What&apos;s the pressure?</h3>
                <div>{FOOD_PRESSURES.slice(0, 4).map((pressure) => <span key={pressure.id}>{pressure.label}</span>)}</div>
                <button type="button" onClick={() => scrollToChapter(3)} aria-label="Continue to pressure">→</button>
              </aside>
            )}

            {(chapter.scene === "ATLAS" || chapter.scene === "PRESSURE_ATLAS") && <div className="sapiens-orbit-hint" style={mono}>DRAG TO ORBIT</div>}
            <div className="sapiens-microcopy sapiens-microcopy--left" style={mono}>SYSTEMS ARE CONNECTED.</div>
            <div className="sapiens-microcopy sapiens-microcopy--right" style={mono}>EVIDENCE BEFORE INTERPRETATION.</div>
          </div>

          <div className="sapiens-story-track" aria-hidden>
            {STORY.map((item, index) => <section key={item.id} id={`sapiens-story-${item.id}`} data-sapiens-story-step={index} className="sapiens-story-trigger" />)}
          </div>
        </div>

        <section className="sapiens-editorial sapiens-editorial--paper">
          <div className="sapiens-editorial__inner">
            <div style={{ ...mono, color: accent }}>WHY FOOD_ FIRST · GOLD STANDARD 01</div>
            <h2>One human need touches almost the whole planet.</h2>
            <p className="sapiens-editorial__lead">FOOD_ is useful because it forces the product to connect human demand, production, trade, land, water, climate, biodiversity and solutions without collapsing them into one score.</p>
            <div className="sapiens-editorial-lines">
              <article><span style={mono}>01 · HUMAN</span><h3>Begin with something everybody understands.</h3><p>Eating earns attention before the product introduces systems language.</p></article>
              <article><span style={mono}>02 · EARTH</span><h3>Let the globe arrive when place matters.</h3><p>ATLAS becomes the spatial canvas exactly when abstraction must become geography.</p></article>
              <article><span style={mono}>03 · CHANGE</span><h3>End with leverage, not guilt.</h3><p>The journey reveals where actors, interventions and Missions can change the system.</p></article>
            </div>
          </div>
        </section>

        <section className="sapiens-editorial sapiens-editorial--dark">
          <div className="sapiens-editorial__inner">
            <div style={{ ...mono, color: accent }}>SOURCE STACK · FOOD_ · SOURCE-AWARE</div>
            <h2>Evidence before interpretation.</h2>
            <p className="sapiens-editorial__lead is-dark">{sourceCounts.live} live API · {sourceCounts.atlas} existing ATLAS · {sourceCounts.open} open datasets · {sourceCounts.rights} rights review · {sourceCounts.gated} access-gated. Missing or failed sources stay missing — never rendered as zero.</p>
            <div className="sapiens-source-ledger">
              {FOOD_SOURCES.map((source) => (
                <a key={source.id} href={source.url} target="_blank" rel="noreferrer" className="sapiens-source-row">
                  <div><span className={`sapiens-source-badge ${sourceTone(source.state)}`} style={mono}>{source.state.replace(/_/g, " ")}</span><span className="sapiens-source-authority" style={mono}>{source.authority}</span></div>
                  <div><h3>{source.label}</h3><p>{source.role}</p><p className="sapiens-source-limit">LIMIT · {source.limitation}</p></div>
                  <div className="sapiens-source-meta" style={mono}>{source.coverage}<br />CHECKED {source.checkedOn}<br />OPEN SOURCE ↗</div>
                </a>
              ))}
            </div>
          </div>
        </section>

        <section className="sapiens-editorial sapiens-editorial--dark sapiens-editorial--transfer">
          <div className="sapiens-editorial__inner">
            <div style={{ ...mono, color: accent }}>TRANSFER · 20 HUMAN SYSTEM CHAINS</div>
            <h2>FOOD_ proves the grammar. Then the map can scale.</h2>
            <div className="sapiens-chain-index">
              {SAPIENS_CHAINS.slice(0, 8).map((chain, index) => (
                <div key={chain.id} className={chain.status === "GOLD_STANDARD" ? "is-gold" : ""}>
                  <span style={mono}>{String(index + 1).padStart(2, "0")}</span><strong>{chain.label}</strong><span>{chain.humanNeed}</span><span style={mono}>{chain.status === "GOLD_STANDARD" ? "GOLD" : "NEXT"}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </PublicShell>
  );
}
