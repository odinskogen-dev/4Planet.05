import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { Link } from "react-router-dom";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import "@/styles/sapiens-atlas-story.css";
import { PublicShell } from "@/components/layout/PublicShell";
import { img } from "@/content/imageRegistry";
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
const humanImage = img("storyHero");
const foodImage = img("foodHero");

const mono: CSSProperties = {
  fontFamily: T.mono,
  fontSize: 10.5,
  letterSpacing: ".14em",
  textTransform: "uppercase",
};

type RelationMode = "DEPENDENCY" | "PRESSURE" | "RESPONSE";
type SceneMode = "ATLAS" | "HUMAN_GRAPH" | "CHAIN_GRAPH" | "PRESSURE_ATLAS" | "LIFE_GRAPH" | "SOLUTION_GRAPH";
type GraphKind = "human" | "need" | "chain" | "pressure" | "life" | "solution";

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
  kind: GraphKind;
  detail: string;
};

type GraphLink = {
  from: string;
  to: string;
  relation: RelationMode;
};

type GraphScene = {
  nodes: GraphNode[];
  links: GraphLink[];
};

const STORY: StoryChapter[] = [
  {
    id: "atlas",
    number: "01",
    eyebrow: "ATLAS · S4PIENS_",
    title: "You are here.",
    body: "S4PIENS is a map of how human needs become systems across the planet — and where those systems meet the living world.",
    truth: "START WITH EARTH · The globe is the shared spatial canvas. Source records, relationships and interpretations remain separate underneath it.",
    scene: "ATLAS",
    mode: "DEPENDENCY",
  },
  {
    id: "human",
    number: "02",
    eyebrow: "SPECIES · HOMO SAPIENS",
    title: "One species. Many systems.",
    body: "We eat, drink, build, move, power homes and wear things. Each need reaches outward into land, water, energy, materials, trade and other forms of life.",
    truth: "HUMAN-FIRST · This is a systems lens, not an individual footprint score and not a claim that every person drives every pressure equally.",
    scene: "HUMAN_GRAPH",
    mode: "DEPENDENCY",
  },
  {
    id: "food",
    number: "03",
    eyebrow: "GOLD STANDARD CHAIN · FOOD_",
    title: "Follow one meal.",
    body: "FOOD_ is the first Gold Standard chain because one familiar act — eating — can be followed through demand, production, inputs, processing, trade, consumption and waste.",
    truth: "CHAIN ≠ CLAIM · The chain is the organising grammar. Every specific relationship inside it still needs source evidence.",
    scene: "CHAIN_GRAPH",
    mode: "DEPENDENCY",
  },
  {
    id: "pressure",
    number: "04",
    eyebrow: "ATLAS · PRESSURE",
    title: "Now locate the pressure.",
    body: "Put source records back on Earth. Agriculture emissions, forest change, water, climate and biodiversity can be inspected together without pretending proximity alone proves causation.",
    truth: "VISIBLE NOW · NASA Earth imagery + Climate TRACE agriculture-source records. Inventory records are not live plumes or proof of local ecological damage.",
    scene: "PRESSURE_ATLAS",
    mode: "PRESSURE",
  },
  {
    id: "life",
    number: "05",
    eyebrow: "LIVING SYSTEMS · DEPENDENCY",
    title: "Find what the system depends on.",
    body: "Food is not only an economic chain. It sits inside soils, freshwater, climate and biodiversity — and extends into marine systems where seafood is involved.",
    truth: "RELATIONSHIP DEPTH · The graph shows where evidence-backed dependency relationships belong. It must not turn an occurrence point into a causal claim.",
    scene: "LIFE_GRAPH",
    mode: "DEPENDENCY",
  },
  {
    id: "solutions",
    number: "06",
    eyebrow: "SOLUTIONS MAP · RESPONSE",
    title: "Then find leverage.",
    body: "The useful end state is not guilt. It is a map of where the system can change: production, sourcing, nutrient use, water, loss and waste, fisheries, demand and the actors able to move those levers.",
    truth: "RESPONSE ≠ OUTCOME · Solution nodes are intervention hypotheses until effectiveness, operator and delivery evidence support stronger claims.",
    scene: "SOLUTION_GRAPH",
    mode: "RESPONSE",
  },
];

const HUMAN_NEEDS = [
  ["food", "EAT", "FOOD_", "Nutrition is a biological dependency delivered through farms, fisheries, inputs, processing, trade, retail and waste systems."],
  ["water", "DRINK", "WATER", "Freshwater is a direct dependency and a critical input into food production, processing and ecosystems."],
  ["energy", "POWER", "EN4RGY_", "Energy moves through fertiliser, machinery, factories, cold chains, transport, retail and homes."],
  ["shelter", "SHELTER", "BUILT SYSTEM", "Buildings and cities connect land, energy, water, materials and infrastructure back to the living planet."],
  ["wear", "WEAR", "F4SHION_", "Clothing links fibres, agriculture, petrochemicals, water, factories, logistics, consumers and waste."],
  ["move", "MOVE", "MOBILITY", "Mobility connects energy, materials, infrastructure, trade and access across human systems."],
] as const;

const HUMAN_GRAPH: GraphScene = {
  nodes: [
    { id: "human", label: "HOMO SAPIENS", kicker: "SPECIES", x: 50, y: 50, kind: "human", detail: "One species inside the living planet — dependent on ecosystems and also capable of changing the systems that create pressure." },
    { id: "food", label: "EAT", kicker: "FOOD_", x: 19, y: 22, kind: "need", detail: HUMAN_NEEDS[0][3] },
    { id: "water", label: "DRINK", kicker: "WATER", x: 50, y: 12, kind: "need", detail: HUMAN_NEEDS[1][3] },
    { id: "energy", label: "POWER", kicker: "EN4RGY_", x: 82, y: 24, kind: "need", detail: HUMAN_NEEDS[2][3] },
    { id: "shelter", label: "SHELTER", kicker: "BUILT SYSTEM", x: 17, y: 76, kind: "need", detail: HUMAN_NEEDS[3][3] },
    { id: "wear", label: "WEAR", kicker: "F4SHION_", x: 50, y: 88, kind: "need", detail: HUMAN_NEEDS[4][3] },
    { id: "move", label: "MOVE", kicker: "MOBILITY", x: 83, y: 75, kind: "need", detail: HUMAN_NEEDS[5][3] },
  ],
  links: HUMAN_NEEDS.map(([id]) => ({ from: "human", to: id, relation: "DEPENDENCY" as RelationMode })),
};

const CHAIN_GRAPH: GraphScene = {
  nodes: FOOD_STAGES.map((stage, index) => ({
    id: `stage:${stage.id}`,
    label: stage.label,
    kicker: String(index + 1).padStart(2, "0"),
    x: index < 4 ? 12 + index * 25 : 25 + (index - 4) * 25,
    y: index < 4 ? 34 : 70,
    kind: "chain" as GraphKind,
    detail: stage.text,
  })),
  links: FOOD_STAGES.slice(0, -1).map((stage, index) => ({
    from: `stage:${stage.id}`,
    to: `stage:${FOOD_STAGES[index + 1].id}`,
    relation: "DEPENDENCY" as RelationMode,
  })),
};

const LIFE_GRAPH: GraphScene = {
  nodes: [
    { id: "food-system", label: "FOOD SYSTEM", kicker: "HUMAN SYSTEM", x: 50, y: 50, kind: "chain", detail: "The FOOD_ chain becomes a relationship hub rather than a linear dashboard." },
    { id: "soil", label: "SOILS", kicker: "LIVING FOUNDATION", x: 18, y: 22, kind: "life", detail: "A relationship slot for soil condition, soil carbon, nutrients and food production — source depth determines what can be claimed." },
    { id: "freshwater", label: "FRESHWATER", kicker: "DEPENDENCY", x: 50, y: 12, kind: "life", detail: "A relationship slot for water resources, irrigation, withdrawals and water stress, with AQUASTAT as one statistical source family." },
    { id: "climate", label: "CLIMATE", kicker: "CONDITION", x: 82, y: 24, kind: "life", detail: "A relationship slot for temperature, precipitation and greenhouse-gas pressure without collapsing climate into one score." },
    { id: "biodiversity", label: "BIODIVERSITY", kicker: "LIFE", x: 18, y: 77, kind: "life", detail: "A relationship slot for species occurrence and ecological context. GBIF records are observations, not population estimates." },
    { id: "forest", label: "FORESTS", kicker: "LAND SYSTEM", x: 50, y: 88, kind: "life", detail: "A relationship slot for tree-cover and forest-change context. Tree-cover loss is not automatically deforestation or a commodity driver." },
    { id: "ocean", label: "MARINE SYSTEMS", kicker: "SEAFOOD", x: 82, y: 76, kind: "life", detail: "A relationship slot for fisheries, marine life and ocean conditions when the FOOD_ chain extends into seafood." },
  ],
  links: ["soil", "freshwater", "climate", "biodiversity", "forest", "ocean"].map((id) => ({ from: "food-system", to: id, relation: "DEPENDENCY" as RelationMode })),
};

const SOLUTION_GRAPH: GraphScene = {
  nodes: [
    { id: "pressure-core", label: "PRESSURE", kicker: "SYSTEM SIGNAL", x: 50, y: 50, kind: "pressure", detail: "Pressure is split into specific classes so solutions can be matched to the problem they are intended to change." },
    ...FOOD_SOLUTION_LEVERS.slice(0, 6).map((solution, index) => {
      const positions = [[16, 20], [50, 12], [84, 22], [17, 78], [50, 88], [83, 76]];
      return {
        id: `solution:${index}`,
        label: solution.label,
        kicker: solution.pressure,
        x: positions[index][0],
        y: positions[index][1],
        kind: "solution" as GraphKind,
        detail: solution.test,
      };
    }),
  ],
  links: FOOD_SOLUTION_LEVERS.slice(0, 6).map((_, index) => ({ from: "pressure-core", to: `solution:${index}`, relation: "RESPONSE" as RelationMode })),
};

const GRAPH_SCENES: Partial<Record<SceneMode, GraphScene>> = {
  HUMAN_GRAPH,
  CHAIN_GRAPH,
  LIFE_GRAPH,
  SOLUTION_GRAPH,
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

const sourceTone = (state: string) => {
  if (state === "LIVE_API") return "is-live";
  if (state === "EXISTING_ATLAS") return "is-atlas";
  if (state === "OPEN_DATASET") return "is-open";
  if (state === "RIGHTS_REVIEW") return "is-rights";
  return "is-gated";
};

function relationStroke(relation: RelationMode) {
  if (relation === "PRESSURE") return "var(--sapiens-accent)";
  if (relation === "RESPONSE") return "#FFFFFF";
  return "rgba(255,255,255,.36)";
}

function KnowledgeGraph({
  scene,
  activeNode,
  onSelect,
}: {
  scene: SceneMode;
  activeNode: string | null;
  onSelect: (node: GraphNode) => void;
}) {
  const graph = GRAPH_SCENES[scene];
  if (!graph) return null;
  const nodeById = new Map(graph.nodes.map((node) => [node.id, node]));
  return (
    <div className="sapiens-knowledge" aria-label="Interactive S4PIENS system graph">
      <svg className="sapiens-knowledge__links" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
        {graph.links.map((link) => {
          const from = nodeById.get(link.from);
          const to = nodeById.get(link.to);
          if (!from || !to) return null;
          return (
            <line
              key={`${link.from}-${link.to}`}
              x1={from.x}
              y1={from.y}
              x2={to.x}
              y2={to.y}
              style={{ stroke: relationStroke(link.relation) }}
              className={`sapiens-knowledge__link is-${link.relation.toLowerCase()}`}
            />
          );
        })}
      </svg>
      {graph.nodes.map((node) => (
        <button
          key={node.id}
          type="button"
          className={`sapiens-knowledge__node is-${node.kind} ${activeNode === node.id ? "is-active" : ""}`}
          style={{ left: `${node.x}%`, top: `${node.y}%` }}
          onClick={() => onSelect(node)}
          aria-label={`${node.kicker}: ${node.label}`}
        >
          <span className="sapiens-knowledge__kicker" style={mono}>{node.kicker}</span>
          <strong>{node.label}</strong>
        </button>
      ))}
    </div>
  );
}

function HumanSpeciesCard({ visible }: { visible: boolean }) {
  return (
    <aside className={`sapiens-species-card ${visible ? "is-visible" : ""}`} aria-label="Homo sapiens Gold Standard species card">
      <picture>
        {humanImage.srcMobile && <source media="(max-width: 760px)" srcSet={humanImage.srcMobile} />}
        <img src={humanImage.src} alt={humanImage.alt} />
      </picture>
      <div className="sapiens-species-card__body">
        <div className="sapiens-species-card__meta" style={mono}>SPECIES_ · GBIF 10856082 · IDENTITY KNOWN</div>
        <h2>Homo sapiens</h2>
        <p>Human. A species that depends on living systems — and builds systems capable of changing them.</p>
        <div className="sapiens-species-card__facts">
          <span><b>DEPENDENCY</b> planet → human</span>
          <span><b>PRESSURE</b> human system → planet</span>
          <span><b>RESPONSE</b> system → change</span>
        </div>
        <Link to="/species/homo-sapiens" style={mono}>OPEN GOLD SPECIES CARD →</Link>
      </div>
    </aside>
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
  const [selectedSolution, setSelectedSolution] = useState(0);
  const [activeGraphNode, setActiveGraphNode] = useState<GraphNode | null>(null);

  const chapter = STORY[activeChapter];
  const foodStage = FOOD_STAGES[activeStage];
  const selectedSolutionNode = FOOD_SOLUTION_LEVERS[selectedSolution];

  const sourceCounts = useMemo(() => ({
    live: FOOD_SOURCES.filter((source) => source.state === "LIVE_API").length,
    atlas: FOOD_SOURCES.filter((source) => source.state === "EXISTING_ATLAS").length,
    open: FOOD_SOURCES.filter((source) => source.state === "OPEN_DATASET").length,
    gated: FOOD_SOURCES.filter((source) => source.state === "ACCESS_GATED").length,
    rights: FOOD_SOURCES.filter((source) => source.state === "RIGHTS_REVIEW").length,
  }), []);

  const liveLabel = data.ok
    ? `${data.returned ?? 0} CLIMATE TRACE RECORDS · ${data.apiVersion || "v7"}`
    : data.state === "LOADING"
      ? "CLIMATE TRACE LOADING"
      : "CLIMATE TRACE UNAVAILABLE";

  const liveColour = data.ok ? "#FFFFFF" : data.state === "LOADING" ? "rgba(255,255,255,.58)" : accent;
  const currentGraph = GRAPH_SCENES[chapter.scene];

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
      center: [4, 18],
      zoom: 0.9,
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
            paint: { "raster-opacity": 0.96, "raster-saturation": -0.12, "raster-contrast": 0.08 },
          }, firstSymbol);
        }
      } catch { /* base vector style remains available */ }
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
          "circle-opacity": 0.14,
          "circle-radius": ["interpolate", ["linear"], ["zoom"], 1, 2.5, 6, 5.5, 10, 7],
          "circle-stroke-color": "#FFFFFF",
          "circle-stroke-width": 0.5,
        },
      });
      map.on("click", "food-agriculture-points", (event) => {
        const feature = event.features?.[0];
        if (!feature || feature.geometry.type !== "Point") return;
        const coordinates = feature.geometry.coordinates as [number, number];
        const p = feature.properties || {};
        const amount = Number.isFinite(Number(p.emissions)) ? formatEmissions(Number(p.emissions)) : "VALUE NOT EXPOSED";
        const root = document.createElement("div");
        root.style.cssText = "font:12px/1.5 system-ui;color:#0A0A0A;min-width:220px";
        const title = document.createElement("strong");
        title.textContent = String(p.name || "Agriculture source");
        root.append(title, document.createElement("br"));
        root.append(document.createTextNode(String(p.subsector || p.sector || "agriculture")), document.createElement("br"));
        root.append(document.createTextNode(`${p.country ? `${String(p.country)} · ` : ""}${String(p.year || "")}`), document.createElement("br"));
        root.append(document.createTextNode(`${amount} · ${String(p.gas || "source-defined gas")}`), document.createElement("br"));
        const note = document.createElement("span");
        note.style.opacity = ".58";
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
      { center: [4, 18] as [number, number], zoom: 0.9, duration: 1400 },
      { center: [5, 14] as [number, number], zoom: 1.05, duration: 1200 },
      { center: [2, 16] as [number, number], zoom: 1.15, duration: 1200 },
      { center: [-12, 8] as [number, number], zoom: 1.45, duration: 1500 },
      { center: [8, 14] as [number, number], zoom: 1.18, duration: 1300 },
      { center: [3, 16] as [number, number], zoom: 1.0, duration: 1300 },
    ];
    map.easeTo(cameras[activeChapter]);
    if (map.getLayer("food-agriculture-points")) {
      const opacity = chapter.scene === "PRESSURE_ATLAS" ? 0.92 : chapter.scene === "ATLAS" ? 0.18 : 0.07;
      map.setPaintProperty("food-agriculture-points", "circle-opacity", opacity);
    }
    if (map.getLayer("sapiens-blue-marble")) {
      const opacity = chapter.scene.includes("GRAPH") ? 0.36 : 0.96;
      map.setPaintProperty("sapiens-blue-marble", "raster-opacity", opacity);
    }
  }, [activeChapter, chapter.scene, mapReady]);

  const handleGraphSelect = (node: GraphNode) => {
    setActiveGraphNode(node);
    if (node.id.startsWith("stage:")) {
      const stageId = node.id.replace("stage:", "");
      const index = FOOD_STAGES.findIndex((stage) => stage.id === stageId);
      if (index >= 0) setActiveStage(index);
    }
    if (node.id.startsWith("solution:")) {
      const index = Number(node.id.replace("solution:", ""));
      if (Number.isFinite(index)) setSelectedSolution(index);
    }
  };

  return (
    <PublicShell>
      <main id="main-content" className="sapiens-story" style={{ "--sapiens-accent": accent } as CSSProperties}>
        <div className="sapiens-story-shell">
          <div className={`sapiens-stage scene-${chapter.scene.toLowerCase()}`}>
            <div ref={mapNode} aria-label="S4PIENS Atlas — NASA Earth with Climate TRACE agriculture sources" className="sapiens-stage__map" />
            <div className="sapiens-stage__scrim" aria-hidden />

            <div className="sapiens-chrome" aria-hidden>
              <div className="sapiens-brandline" style={mono}>4PLANET_ / S4PIENS_ / HUMAN SYSTEMS ATLAS</div>
              <div className="sapiens-source-state" style={{ ...mono, color: liveColour }}>
                <span>NASA EARTH · {liveLabel}</span>
              </div>
            </div>

            <nav className="sapiens-progress" aria-label="S4PIENS story chapters">
              {STORY.map((item, index) => (
                <button key={item.id} type="button" className={index === activeChapter ? "is-active" : ""} onClick={() => scrollToChapter(index)} aria-label={`Open chapter ${item.number}: ${item.title}`}>
                  <span style={mono}>{item.number}</span><span aria-hidden />
                </button>
              ))}
            </nav>

            <HumanSpeciesCard visible={activeChapter <= 1} />

            {currentGraph && (
              <KnowledgeGraph scene={chapter.scene} activeNode={activeGraphNode?.id ?? null} onSelect={handleGraphSelect} />
            )}

            {activeGraphNode && currentGraph && (
              <aside className="sapiens-node-inspect" aria-live="polite">
                <div style={{ ...mono, color: accent }}>{activeGraphNode.kicker} · {activeGraphNode.kind}</div>
                <h3>{activeGraphNode.label}</h3>
                <p>{activeGraphNode.detail}</p>
                {activeGraphNode.id === "food" && <button type="button" onClick={() => scrollToChapter(2)} style={mono}>FOLLOW FOOD_ →</button>}
              </aside>
            )}

            {(chapter.scene === "CHAIN_GRAPH" || chapter.scene === "PRESSURE_ATLAS") && (
              <div className="sapiens-chainrail" aria-label="FOOD journey stages">
                {FOOD_STAGES.map((item, index) => (
                  <button key={item.id} type="button" className={activeStage === index ? "is-active" : ""} onClick={() => setActiveStage(index)}>
                    <span className="sapiens-chainrail__dot">{String(index + 1).padStart(2, "0")}</span>
                    <span className="sapiens-chainrail__label" style={mono}>{item.label}</span>
                  </button>
                ))}
              </div>
            )}

            {chapter.scene === "CHAIN_GRAPH" && (
              <div className="sapiens-stage-note">
                <div style={{ ...mono, color: accent }}>FOOD_ · {String(activeStage + 1).padStart(2, "0")} / {String(FOOD_STAGES.length).padStart(2, "0")}</div>
                <h3>{foodStage.label}</h3>
                <p>{foodStage.text}</p>
              </div>
            )}

            {chapter.scene === "SOLUTION_GRAPH" && (
              <div className="sapiens-stage-note is-solution">
                <div style={{ ...mono, color: accent }}>RESPONSE · {selectedSolutionNode.pressure}</div>
                <h3>{selectedSolutionNode.label}</h3>
                <p>{selectedSolutionNode.test}</p>
              </div>
            )}

            <div className="sapiens-story-card">
              <div className="sapiens-story-card__eyebrow" style={{ ...mono, color: accent }}>{chapter.number} · {chapter.eyebrow}</div>
              <h1>{chapter.title}</h1>
              <p>{chapter.body}</p>
              <div className="sapiens-story-card__truth">{chapter.truth}</div>

              {activeChapter === 0 && (
                <div className="sapiens-action-row">
                  <button type="button" className="sapiens-action is-primary" style={mono} onClick={() => scrollToChapter(1)}>START WITH THE HUMAN ↓</button>
                  <Link className="sapiens-action" style={mono} to={atlasFoodHref([])}>OPEN FREE ATLAS →</Link>
                </div>
              )}

              {activeChapter === 1 && (
                <div className="sapiens-action-row">
                  <button type="button" className="sapiens-action is-primary" style={mono} onClick={() => { setActiveGraphNode(HUMAN_GRAPH.nodes.find((node) => node.id === "food") ?? null); scrollToChapter(2); }}>FOLLOW FOOD_ ↓</button>
                  <Link className="sapiens-action" style={mono} to="/species/homo-sapiens">OPEN SPECIES_ →</Link>
                </div>
              )}

              {activeChapter === 2 && (
                <div className="sapiens-action-row">
                  <button type="button" className="sapiens-action is-primary" style={mono} onClick={() => scrollToChapter(3)}>PUT THE CHAIN ON EARTH ↓</button>
                  <span className="sapiens-action is-static" style={mono}>7 CHAIN STAGES</span>
                </div>
              )}

              {activeChapter === 3 && (
                <>
                  <div className="sapiens-relation-switch" aria-label="Relationship mode">
                    {(["DEPENDENCY", "PRESSURE", "RESPONSE"] as RelationMode[]).map((mode) => (
                      <button key={mode} type="button" className={relationMode === mode ? "is-active" : ""} style={mono} onClick={() => setRelationMode(mode)}>{mode}</button>
                    ))}
                  </div>
                  <div className="sapiens-action-row sapiens-action-row--pressures">
                    {FOOD_PRESSURES.slice(0, 4).map((pressure) => (
                      <Link key={pressure.id} className="sapiens-action" style={mono} to={atlasFoodHref(pressure.atlasLayers)}>{pressure.label} →</Link>
                    ))}
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
            </div>
          </div>

          <div className="sapiens-story-track" aria-hidden>
            {STORY.map((item, index) => (
              <section key={item.id} id={`sapiens-story-${item.id}`} data-sapiens-story-step={index} className="sapiens-story-trigger" />
            ))}
          </div>
        </div>

        <section className="sapiens-editorial sapiens-editorial--paper">
          <div className="sapiens-editorial__inner">
            <div style={{ ...mono, color: accent }}>WHY FOOD_ FIRST · GOLD STANDARD 01</div>
            <h2>One human need touches almost the whole planet.</h2>
            <p className="sapiens-editorial__lead">FOOD_ is useful because it forces the product to connect human demand, real production systems, trade, land, water, climate, biodiversity and solutions without collapsing them into one score.</p>
            <div className="sapiens-editorial-lines">
              <article><span style={mono}>01 · HUMAN</span><h3>Start with something everybody understands.</h3><p>Eating is immediate. The product can earn attention before introducing systems language.</p></article>
              <article><span style={mono}>02 · PLANET</span><h3>Keep Earth as the shared canvas.</h3><p>ATLAS remains the place where source records become spatial and inspectable.</p></article>
              <article><span style={mono}>03 · CHANGE</span><h3>End with leverage, not guilt.</h3><p>The chain should reveal where actors, interventions and Missions can change the system.</p></article>
            </div>
          </div>
        </section>

        <section className="sapiens-editorial sapiens-editorial--image">
          <picture className="sapiens-editorial-image">
            {foodImage.srcMobile && <source media="(max-width: 760px)" srcSet={foodImage.srcMobile} />}
            <img src={foodImage.src} alt={foodImage.alt} />
          </picture>
          <div className="sapiens-editorial-image__copy">
            <div style={{ ...mono, color: accent }}>FOOD_ · FROM HUMAN NEED TO PLANETARY SYSTEM</div>
            <h2>The chain becomes visible when data layers meet the story.</h2>
            <p>FAOSTAT can describe production and inputs. Trase can deepen selected commodity supply chains. NASA and Global Forest Watch can locate environmental context. GBIF can connect recorded life. Climate TRACE provides the first live emissions-source seam. Each source keeps its own limits.</p>
          </div>
        </section>

        <section className="sapiens-editorial sapiens-editorial--dark">
          <div className="sapiens-editorial__inner">
            <div style={{ ...mono, color: accent }}>SOURCE LEDGER · CHECKED 2026-08-19</div>
            <h2>Evidence before interpretation.</h2>
            <p className="sapiens-editorial__lead is-dark">{sourceCounts.live} live API · {sourceCounts.atlas} existing ATLAS · {sourceCounts.open} open datasets · {sourceCounts.rights} rights review · {sourceCounts.gated} access gated. Missing or failed sources stay missing — never rendered as zero.</p>
            <div className="sapiens-source-ledger">
              {FOOD_SOURCES.map((source) => (
                <a key={source.id} href={source.url} target="_blank" rel="noreferrer" className="sapiens-source-row">
                  <div>
                    <span className={`sapiens-source-badge ${sourceTone(source.state)}`} style={mono}>{source.state.replace(/_/g, " ")}</span>
                    <span className="sapiens-source-authority" style={mono}>{source.authority}</span>
                  </div>
                  <div>
                    <h3>{source.label}</h3>
                    <p>{source.role}</p>
                    <p className="sapiens-source-limit">LIMIT · {source.limitation}</p>
                  </div>
                  <div className="sapiens-source-meta" style={mono}>{source.coverage}<br />CHECKED {source.checkedOn}<br />OPEN SOURCE ↗</div>
                </a>
              ))}
            </div>
          </div>
        </section>

        <section className="sapiens-editorial sapiens-editorial--paper">
          <div className="sapiens-editorial__inner">
            <div style={{ ...mono, color: accent }}>TRANSFER · 20 HUMAN SYSTEM CHAINS</div>
            <h2>FOOD_ proves the grammar. The same map can scale.</h2>
            <div className="sapiens-chain-index">
              {SAPIENS_CHAINS.map((chain, index) => (
                <div key={chain.id} className={chain.status === "GOLD_STANDARD" ? "is-gold" : ""}>
                  <span style={mono}>{String(index + 1).padStart(2, "0")}</span>
                  <strong>{chain.label}</strong>
                  <span>{chain.humanNeed}</span>
                  <span style={mono}>{chain.status === "GOLD_STANDARD" ? "GOLD STANDARD" : "MAPPED NEXT"}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </PublicShell>
  );
}
