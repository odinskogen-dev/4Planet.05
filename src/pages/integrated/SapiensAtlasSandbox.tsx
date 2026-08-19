import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { Link } from "react-router-dom";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import "@/styles/sapiens-atlas-story.css";
import { PublicShell } from "@/components/layout/PublicShell";
import { gibs } from "@/earth/layers";
import { DOMAIN_ACCENT, T } from "@/styles/tokens";
import { FOOD_PRESSURES, FOOD_SOLUTION_LEVERS, FOOD_SOURCES, FOOD_STAGES, SAPIENS_CHAINS } from "@/data/sapiensChains";
import { FOOD_PROOF_SIGNALS } from "@/data/sapiensFoodEvidence";

const accent = DOMAIN_ACCENT["S4PIENS_"] || "#FF4D22";
const humanId = "taxon:gbif:10856082";
const vectorStyle = "https://tiles.openfreemap.org/styles/liberty";

const mono: CSSProperties = {
  fontFamily: T.mono,
  fontSize: 10.5,
  letterSpacing: ".14em",
  textTransform: "uppercase",
};

type RelationMode = "DEPENDENCY" | "PRESSURE" | "RESPONSE";
type FoodSourceRecord = {
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
  apiVersion?: string;
  returned?: number;
  sources?: FoodSourceRecord[];
  state?: string;
  error?: string;
};

type HumanNode = { id: string; label: string; system: string; x: number; y: number; detail: string };
type LivingNode = { id: string; label: string; kicker: string; x: number; y: number; detail: string; relation: RelationMode };

const CHAPTERS = [
  ["earth", "EARTH / ATLAS"],
  ["human", "HOMO SAPIENS"],
  ["food", "FOOD_"],
  ["pressure", "PRESSURE"],
  ["evidence", "EVIDENCE"],
  ["living", "LIVING SYSTEMS"],
  ["solutions", "SOLUTIONS"],
] as const;

const HUMAN_NODES: HumanNode[] = [
  { id: "eat", label: "EAT", system: "FOOD_", x: 18, y: 28, detail: "Nutrition moves through farms, fisheries, inputs, factories, trade, retail and waste." },
  { id: "drink", label: "DRINK", system: "WATER", x: 50, y: 13, detail: "Freshwater is a direct human dependency and a critical input into food and ecosystems." },
  { id: "power", label: "POWER", system: "EN4RGY_", x: 82, y: 28, detail: "Energy enters fertiliser, machinery, factories, cold chains, transport, retail and homes." },
  { id: "shelter", label: "SHELTER", system: "BUILT SYSTEM", x: 18, y: 76, detail: "Buildings and cities connect land, energy, water, materials and infrastructure." },
  { id: "wear", label: "WEAR", system: "F4SHION_", x: 82, y: 76, detail: "Fibres and clothing connect agriculture, petrochemicals, water, manufacturing, trade and waste." },
  { id: "move", label: "MOVE", system: "MOBILITY", x: 50, y: 91, detail: "Mobility connects energy, materials, infrastructure, trade and access." },
];

const LIVING_NODES: LivingNode[] = [
  { id: "soils", label: "SOILS", kicker: "LIVING FOUNDATION", x: 18, y: 28, relation: "DEPENDENCY", detail: "Soil condition, nutrients and production interact, but claims must stay at the depth supported by source evidence." },
  { id: "freshwater", label: "FRESHWATER", kicker: "DEPENDENCY", x: 50, y: 13, relation: "DEPENDENCY", detail: "Water resources, irrigation and stress belong in the same system with source-specific time and geography limits." },
  { id: "climate", label: "CLIMATE", kicker: "CONDITION", x: 82, y: 28, relation: "DEPENDENCY", detail: "Temperature, precipitation and greenhouse-gas pressure remain different signals rather than one collapsed score." },
  { id: "forests", label: "FORESTS", kicker: "LAND SYSTEM", x: 18, y: 76, relation: "PRESSURE", detail: "Tree-cover change adds land context. Tree-cover loss is not automatically deforestation or proof of a commodity driver." },
  { id: "biodiversity", label: "BIODIVERSITY", kicker: "RECORDED LIFE", x: 50, y: 91, relation: "PRESSURE", detail: "GBIF observations can add living context. Observation density is not abundance and co-location is not causal proof." },
  { id: "marine", label: "MARINE SYSTEMS", kicker: "SEAFOOD", x: 82, y: 76, relation: "PRESSURE", detail: "Fisheries, marine life and ocean conditions enter the FOOD_ model when the chain extends into seafood." },
];

function sourceTone(state: string) {
  if (state === "LIVE_API") return "is-live";
  if (state === "EXISTING_ATLAS") return "is-atlas";
  if (state === "OPEN_DATASET") return "is-open";
  if (state === "RIGHTS_REVIEW") return "is-rights";
  return "is-gated";
}

function AtlasGlobe({ className = "", records = [], pressure = false, ariaLabel }: { className?: string; records?: FoodSourceRecord[]; pressure?: boolean; ariaLabel: string }) {
  const node = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);

  useEffect(() => {
    if (!node.current || mapRef.current) return;
    const map = new maplibregl.Map({
      container: node.current,
      style: vectorStyle,
      center: pressure ? [-56, -7] : [-18, 16],
      zoom: pressure ? 2.35 : 0.82,
      pitch: pressure ? 18 : 0,
      bearing: pressure ? -8 : 0,
      attributionControl: { compact: true },
      renderWorldCopies: false,
    });
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "bottom-right");
    map.on("load", () => {
      try { map.setProjection({ type: "globe" }); } catch { /* mercator fallback */ }
      try {
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
          paint: {
            "raster-opacity": pressure ? 0.76 : 0.98,
            "raster-saturation": pressure ? -0.02 : -0.16,
            "raster-contrast": pressure ? 0.18 : 0.12,
            "raster-brightness-max": pressure ? 0.68 : 0.84,
          },
        }, firstSymbol);
      } catch { /* vector basemap remains visible */ }

      if (records.length) {
        try {
          const collection = {
            type: "FeatureCollection",
            features: records.map((record) => ({
              type: "Feature",
              geometry: { type: "Point", coordinates: [record.lon, record.lat] },
              properties: { name: record.name, country: record.country || "", year: record.year },
            })),
          };
          map.addSource("food-agriculture", { type: "geojson", data: collection as never });
          map.addLayer({
            id: "food-agriculture-points",
            type: "circle",
            source: "food-agriculture",
            paint: {
              "circle-color": accent,
              "circle-opacity": pressure ? 0.58 : 0.24,
              "circle-radius": ["interpolate", ["linear"], ["zoom"], 1, 2.4, 6, 5.8, 10, 7.5],
              "circle-stroke-color": "#FF4D22",
              "circle-stroke-width": pressure ? 0.8 : 0.35,
            },
          });
        } catch { /* source layer remains optional */ }
      }
    });
    mapRef.current = map;
    return () => { map.remove(); mapRef.current = null; };
  }, [pressure, records]);

  return <div ref={node} className={`s4x-atlas ${className}`} aria-label={ariaLabel} />;
}

function HumanGraph({ onFood }: { onFood: () => void }) {
  const [active, setActive] = useState(HUMAN_NODES[0]);
  return (
    <div className="s4x-human-graph" aria-label="Homo sapiens human systems graph">
      <svg className="s4x-graph-lines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
        {HUMAN_NODES.map((n) => <line key={n.id} x1="50" y1="52" x2={n.x} y2={n.y} />)}
      </svg>
      <button className="s4x-human-core" type="button" aria-label="Homo sapiens">
        <span style={mono}>SPECIES_</span><strong>HOMO<br/>SAPIENS</strong><small>GBIF 10856082</small>
      </button>
      {HUMAN_NODES.map((n) => (
        <button key={n.id} type="button" className={`s4x-graph-node ${active.id === n.id ? "is-active" : ""}`} style={{ left: `${n.x}%`, top: `${n.y}%` }} onClick={() => { setActive(n); if (n.id === "eat") onFood(); }}>
          <span style={mono}>{n.system}</span><strong>{n.label}</strong>
        </button>
      ))}
      <aside className="s4x-inspect s4x-inspect--orange">
        <span style={mono}>{active.system} · HUMAN NEED</span>
        <h3>{active.label}</h3>
        <p>{active.detail}</p>
      </aside>
    </div>
  );
}

function LivingGraph() {
  const [active, setActive] = useState(LIVING_NODES[0]);
  return (
    <div className="s4x-living-graph" aria-label="FOOD Living Systems relationship graph">
      <svg className="s4x-graph-lines s4x-graph-lines--living" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
        {LIVING_NODES.map((n) => <line key={n.id} x1="50" y1="52" x2={n.x} y2={n.y} className={`is-${n.relation.toLowerCase()}`} />)}
      </svg>
      <div className="s4x-living-core"><span style={mono}>HUMAN SYSTEM</span><strong>FOOD_</strong></div>
      {LIVING_NODES.map((n) => (
        <button key={n.id} type="button" className={`s4x-living-node is-${n.relation.toLowerCase()} ${active.id === n.id ? "is-active" : ""}`} style={{ left: `${n.x}%`, top: `${n.y}%` }} onClick={() => setActive(n)}>
          <span style={mono}>{n.kicker}</span><strong>{n.label}</strong>
        </button>
      ))}
      <aside className="s4x-inspect s4x-inspect--dark">
        <span style={mono}>{active.relation} · {active.kicker}</span>
        <h3>{active.label}</h3>
        <p>{active.detail}</p>
        <div className="s4x-relation-key"><i className="dep"/>DEPENDENCY <i className="press"/>PRESSURE <i className="resp"/>RESPONSE</div>
      </aside>
    </div>
  );
}

export default function SapiensAtlasSandbox() {
  const [activeChapter, setActiveChapter] = useState(0);
  const [activeStage, setActiveStage] = useState(0);
  const [relationMode, setRelationMode] = useState<RelationMode>("PRESSURE");
  const [data, setData] = useState<FoodResponse>({ ok: false, state: "LOADING" });

  const sourceCounts = useMemo(() => ({
    live: FOOD_SOURCES.filter((source) => source.state === "LIVE_API").length,
    atlas: FOOD_SOURCES.filter((source) => source.state === "EXISTING_ATLAS").length,
    open: FOOD_SOURCES.filter((source) => source.state === "OPEN_DATASET").length,
    rights: FOOD_SOURCES.filter((source) => source.state === "RIGHTS_REVIEW").length,
    gated: FOOD_SOURCES.filter((source) => source.state === "ACCESS_GATED").length,
  }), []);

  useEffect(() => {
    document.body.classList.add("sapiens-immersive-nav");
    return () => document.body.classList.remove("sapiens-immersive-nav");
  }, []);

  useEffect(() => {
    const sections = Array.from(document.querySelectorAll<HTMLElement>("[data-s4x-chapter]"));
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;
      setActiveChapter(Number((visible.target as HTMLElement).dataset.s4xChapter || 0));
    }, { threshold: [0.25, 0.45, 0.65], rootMargin: "-12% 0px -24% 0px" });
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
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

  const scrollTo = (id: string) => document.getElementById(`s4x-${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  const liveLabel = data.ok ? `${data.returned ?? 0} CLIMATE TRACE RECORDS · ${data.apiVersion || "V7"}` : data.state === "LOADING" ? "CLIMATE TRACE · LOADING" : "CLIMATE TRACE · SOURCE UNAVAILABLE";

  return (
    <PublicShell>
      <main className="s4x" style={{ "--s4x-accent": accent } as CSSProperties}>
        <nav className="s4x-rail" aria-label="S4PIENS chapters">
          {CHAPTERS.map(([id], index) => (
            <button key={id} type="button" className={activeChapter === index ? "is-active" : ""} onClick={() => scrollTo(id)} aria-label={`Open chapter ${String(index + 1).padStart(2, "0")}`}>
              <span style={mono}>{String(index + 1).padStart(2, "0")}</span><i />
            </button>
          ))}
        </nav>

        <section id="s4x-earth" data-s4x-chapter="0" className="s4x-section s4x-earth">
          <AtlasGlobe ariaLabel="S4PIENS Atlas — NASA Blue Marble Earth" records={data.ok ? data.sources || [] : []} />
          <div className="s4x-earth-scrim" aria-hidden />
          <div className="s4x-topline"><span style={mono}>4PLANET_ / S4PIENS_ / HUMAN SYSTEMS ATLAS</span><span style={mono}>NASA GIBS · BLUE MARBLE · {liveLabel}</span></div>
          <div className="s4x-earth-copy">
            <div className="s4x-eyebrow">01 · EARTH / ATLAS · S4PIENS_</div>
            <h1>You are here.</h1>
            <p>S4PIENS is a map of how human needs become systems across the planet — and where those systems meet the living world.</p>
            <div className="s4x-truth" style={mono}>START WITH EARTH · THE PLANET IS THE SHARED SPATIAL CANVAS.</div>
            <div className="s4x-actions"><button className="is-orange" type="button" onClick={() => scrollTo("human")}>START WITH THE HUMAN ↓</button><Link to="/atlas">OPEN FREE ATLAS →</Link></div>
          </div>
          <aside className="s4x-species-card">
            <img src="/assets/brand/story-hero.jpg" alt="A human figure in a landscape" />
            <div>
              <span className="s4x-eyebrow">SPECIES_ · GBIF 10856082 · IDENTITY KNOWN</span>
              <h2>Homo sapiens</h2>
              <p>Human. A species that depends on living systems — and builds systems capable of changing them.</p>
              <dl><div><dt>DEPENDENCY</dt><dd>planet → human</dd></div><div><dt>PRESSURE</dt><dd>human system → planet</dd></div><div><dt>RESPONSE</dt><dd>system → change</dd></div></dl>
              <Link to="/species/homo-sapiens">OPEN GOLD SPECIES CARD →</Link>
            </div>
          </aside>
          <div className="s4x-status"><span>VIEW <b>EARTH</b></span><span>RELATION <b>DEPENDENCY</b></span><span>ATLAS <b>NASA GIBS</b></span><span>SOURCE <b>{data.ok ? `${data.returned ?? 0} RECORDS` : "STATE VISIBLE"}</b></span><span>STATUS <b>INTERNAL PROTOTYPE</b></span></div>
        </section>

        <section id="s4x-human" data-s4x-chapter="1" className="s4x-section s4x-human">
          <div className="s4x-shell s4x-human-grid">
            <div className="s4x-human-copy">
              <span className="s4x-eyebrow s4x-eyebrow--ink">02 · HOMO SAPIENS · HUMAN SYSTEMS</span>
              <h2>One species.<br/>Many systems.</h2>
              <p>We depend on living systems. Then we build food, water, energy, cities, clothing and mobility systems that reshape the same planet.</p>
              <div className="s4x-human-rule" style={mono}>PLANET → HUMAN = DEPENDENCY · HUMAN SYSTEM → PLANET = PRESSURE · SYSTEM → CHANGE = RESPONSE</div>
              <button type="button" onClick={() => scrollTo("food")}>FOLLOW FOOD_ ↓</button>
            </div>
            <HumanGraph onFood={() => scrollTo("food")} />
          </div>
        </section>

        <section id="s4x-food" data-s4x-chapter="2" className="s4x-section s4x-food">
          <div className="s4x-shell">
            <span className="s4x-eyebrow">03 · FOOD_ · GOLD STANDARD 01</span>
            <div className="s4x-food-head"><h2>Follow one meal.</h2><p>One ordinary human need crosses production, water, energy, land, factories, ports, retail and waste. FOOD_ is the first chain because almost anyone can enter the system here.</p></div>
            <div className="s4x-stage-rail" aria-label="FOOD journey stages">
              {FOOD_STAGES.map((stage, index) => <button key={stage.id} type="button" className={activeStage === index ? "is-active" : ""} onClick={() => setActiveStage(index)}><span style={mono}>{String(index + 1).padStart(2, "0")}</span><strong>{stage.label}</strong></button>)}
            </div>
            <div className="s4x-stage-detail"><span style={mono}>STAGE {String(activeStage + 1).padStart(2, "0")} / 07</span><h3>{FOOD_STAGES[activeStage].label}</h3><p>{FOOD_STAGES[activeStage].text}</p><button type="button" onClick={() => scrollTo("pressure")}>PUT THIS BACK ON EARTH ↓</button></div>
            <div className="s4x-proof-grid">
              {FOOD_PROOF_SIGNALS.map((signal) => <a key={signal.id} href={signal.sourceUrl} target="_blank" rel="noreferrer"><span style={mono}>{signal.theme} · {signal.dataYear}</span><strong>{signal.value}</strong><p>{signal.label}</p><small>{signal.source}<br/>LIMIT · {signal.limitation}</small></a>)}
            </div>
          </div>
        </section>

        <section id="s4x-pressure" data-s4x-chapter="3" className="s4x-section s4x-pressure">
          <img className="s4x-pressure-image" src="/assets/missions/food/hero.jpg" alt="Agricultural landscape" />
          <div className="s4x-pressure-scrim" aria-hidden />
          <div className="s4x-shell s4x-pressure-grid">
            <div className="s4x-pressure-copy">
              <span className="s4x-eyebrow">04 · PRESSURE ON EARTH · SOURCE CONTEXT</span>
              <h2>The chain becomes visible when data layers meet the story.</h2>
              <p>Production and inventory records can be located. Environmental context can be opened around them. Co-location is useful evidence — but it is not causation.</p>
              <div className="s4x-relation-switch">{(["DEPENDENCY","PRESSURE","RESPONSE"] as RelationMode[]).map((mode) => <button key={mode} type="button" className={relationMode === mode ? "is-active" : ""} onClick={() => setRelationMode(mode)}>{mode}</button>)}</div>
              <div className="s4x-pressure-list">{FOOD_PRESSURES.slice(0,5).map((pressure) => <Link key={pressure.id} to={`/atlas?m=S4PIENS&l=bluemarble,${pressure.atlasLayers.join(",")}&journey=food&entity=${humanId}`}><span style={mono}>{pressure.id.toUpperCase()}</span><strong>{pressure.label}</strong><p>{pressure.question}</p><b>OPEN IN ATLAS →</b></Link>)}</div>
            </div>
            <div className="s4x-pressure-map-wrap"><AtlasGlobe className="is-pressure" ariaLabel="FOOD pressure Atlas with NASA Blue Marble and Climate TRACE source records" records={data.ok ? data.sources || [] : []} pressure /><div className="s4x-map-label" style={mono}>PROTOTYPE SPATIAL VIEW · NASA GIBS + CLIMATE TRACE SOURCE RECORDS · NOT LOCAL CAUSAL PROOF</div></div>
          </div>
        </section>

        <section id="s4x-evidence" data-s4x-chapter="4" className="s4x-section s4x-evidence">
          <div className="s4x-shell">
            <span className="s4x-eyebrow">05 · SOURCE LEDGER · CHECKED 2026-08-19</span>
            <div className="s4x-evidence-head"><h2>Evidence before interpretation.</h2><p>{sourceCounts.live} live API · {sourceCounts.atlas} existing ATLAS · {sourceCounts.open} open datasets · {sourceCounts.rights} rights review · {sourceCounts.gated} access gated. Missing or failed sources stay missing — never rendered as zero.</p></div>
            <div className="s4x-source-key"><span>LIVE API</span><span>EXISTING ATLAS</span><span>OPEN DATASET</span><span>RIGHTS REVIEW</span><span>ACCESS GATED</span></div>
            <div className="s4x-source-ledger">
              {FOOD_SOURCES.map((source) => <a key={source.id} href={source.url} target="_blank" rel="noreferrer" className={`s4x-source-row ${sourceTone(source.state)}`}><div><span className="s4x-source-state" style={mono}>{source.state.replaceAll("_"," ")}</span><small style={mono}>{source.authority}</small></div><div><strong>{source.label}</strong><p>{source.role}</p><small>LIMIT · {source.limitation}</small></div><div><span style={mono}>{source.coverage || "SOURCE-SPECIFIC"}</span><small style={mono}>CHECKED {source.checkedOn}</small><b>OPEN SOURCE ↗</b></div></a>)}
            </div>
            <div className="s4x-truth-strip"><span>CO-LOCATION ≠ CAUSATION</span><span>OBSERVATION DENSITY ≠ ABUNDANCE</span><span>SOURCE FAILURE ≠ ZERO</span></div>
          </div>
        </section>

        <section id="s4x-living" data-s4x-chapter="5" className="s4x-section s4x-living">
          <div className="s4x-shell s4x-living-layout">
            <div className="s4x-living-copy"><span className="s4x-eyebrow">06 · LIVING SYSTEMS · UNDERSTAND SYSTEMS</span><h2>Find what the system depends on — and what it can pressure.</h2><p>The graph is the explanation layer. ATLAS is the spatial reality layer. Both sit over the same Planet Model.</p><Link to={`/living-systems?entity=${humanId}&journey=food`}>OPEN LIVING SYSTEMS →</Link></div>
            <LivingGraph />
          </div>
        </section>

        <section id="s4x-solutions" data-s4x-chapter="6" className="s4x-section s4x-solutions">
          <div className="s4x-shell">
            <span className="s4x-eyebrow s4x-eyebrow--ink">07 · SOLUTIONS MAP · RESPONSE</span>
            <div className="s4x-solutions-head"><h2>Then find leverage.</h2><p>The point is not guilt. It is to identify where systems can change — and keep response separate from verified outcome.</p></div>
            <div className="s4x-response-warning" style={mono}>RESPONSE ≠ OUTCOME · SOLUTION NODES ARE INTERVENTION HYPOTHESES UNTIL EFFECTIVENESS / OPERATOR / DELIVERY EVIDENCE EXISTS.</div>
            <div className="s4x-solutions-grid">{FOOD_SOLUTION_LEVERS.map((solution, index) => <article key={solution.label}><span style={mono}>{String(index + 1).padStart(2,"0")} · {solution.pressure}</span><h3>{solution.label}</h3><p>{solution.test}</p><small style={mono}>INTERVENTION HYPOTHESIS</small></article>)}</div>
            <div className="s4x-final-links"><Link to="/missions/food">OPEN FOOD_ MISSION →</Link><Link to="/atlas">OPEN ATLAS →</Link><Link to="/species/homo-sapiens">OPEN HOMO SAPIENS →</Link><button type="button" onClick={() => scrollTo("earth")}>RETURN TO EARTH ↑</button></div>

            <div className="s4x-transfer">
              <div><span className="s4x-eyebrow s4x-eyebrow--ink">TRANSFER · 20 HUMAN SYSTEM CHAINS</span><h3>FOOD_ proves the grammar. The same map can scale.</h3></div>
              <div className="s4x-chain-grid">{SAPIENS_CHAINS.map((chain, index) => <article key={chain.id} className={chain.status === "GOLD_STANDARD" ? "is-gold" : ""}><span style={mono}>{String(index + 1).padStart(2,"0")}</span><strong>{chain.label}</strong><em>{chain.humanNeed}</em><b style={mono}>{chain.status === "GOLD_STANDARD" ? "GOLD STANDARD" : "MAPPED NEXT"}</b></article>)}</div>
            </div>
          </div>
        </section>

        <footer className="s4x-footer" style={mono}>INTERNAL GOLD PROTOTYPE · SOURCE-AWARE · NOT A PRODUCTION RELEASE</footer>
      </main>
    </PublicShell>
  );
}
