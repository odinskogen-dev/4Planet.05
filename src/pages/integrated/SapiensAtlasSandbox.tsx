import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import "@/styles/sapiens-atlas-story.css";
import { PublicShell } from "@/components/layout/PublicShell";

type Relation = "DEPENDENCY" | "PRESSURE" | "RESPONSE";
type GraphNode = {
  id: string;
  label: string;
  kicker: string;
  detail: string;
  x: number;
  y: number;
};

type LiveFoodState = {
  ok?: boolean;
  returned?: number;
  retrievedAt?: string;
  state?: string;
};

const HUMAN_NODES: GraphNode[] = [
  { id: "food", label: "EAT", kicker: "FOOD_", detail: "Nutrition becomes farms, fisheries, inputs, processing, trade, retail and waste.", x: 18, y: 23 },
  { id: "water", label: "DRINK", kicker: "WATER", detail: "Freshwater is a direct human dependency and a critical input into food and ecosystems.", x: 50, y: 12 },
  { id: "energy", label: "POWER", kicker: "EN4RGY_", detail: "Energy runs machinery, fertiliser, factories, cold chains, transport and homes.", x: 82, y: 24 },
  { id: "shelter", label: "SHELTER", kicker: "BUILT SYSTEM", detail: "Shelter connects land, materials, energy, water and infrastructure.", x: 18, y: 76 },
  { id: "wear", label: "WEAR", kicker: "F4SHION_", detail: "Fibres and clothing connect agriculture, petrochemicals, water, production, trade and waste.", x: 82, y: 76 },
  { id: "move", label: "MOVE", kicker: "MOBILITY", detail: "Mobility connects energy, materials, trade and access across human systems.", x: 50, y: 89 },
];

const FOOD_STAGES = [
  ["01", "DEMAND + DIET", "What people eat, want, can afford and culturally value shapes what the system produces."],
  ["02", "FARM + SEA", "Crops, livestock, fisheries and aquaculture turn demand into biological production across land and ocean."],
  ["03", "INPUTS", "Water, fertiliser, feed, energy, machinery and chemicals enter the chain before food reaches a processor."],
  ["04", "PROCESSING", "Milling, slaughter, refrigeration and manufacturing transform raw production into food products."],
  ["05", "TRADE + LOGISTICS", "Storage, shipping, roads, ports and cold chains move food through a globally connected system."],
  ["06", "RETAIL + CONSUMPTION", "Retail, food service and households determine what is sold, eaten, substituted and discarded."],
  ["07", "LOSS + WASTE", "Avoidable loss and waste carry embedded land, water, nutrients, transport and energy with them."],
] as const;

const PROOF = [
  {
    value: "32%",
    title: "of anthropogenic GHG emissions",
    meta: "FAO / FAOSTAT · 2023",
    text: "Global agrifood-system context spanning farm-gate activity, land-use change and pre/post-production processes.",
    limit: "GLOBAL CONTEXT · NOT INDIVIDUAL, COMPANY OR LOCAL ATTRIBUTION",
    href: "https://www.fao.org/statistics/highlights-archive/highlights-detail/greenhouse-gas-emissions-from-agrifood-systems.-global--regional-and-country-trends--2001-2023/en",
  },
  {
    value: "72%",
    title: "of global freshwater withdrawals",
    meta: "FAO · LAND & WATER",
    text: "Agriculture is the largest global water user, with irrigation a major driver of agricultural withdrawals.",
    limit: "GLOBAL SHARE · LOCAL WATER PRESSURE VARIES BY BASIN, SEASON AND CROP",
    href: "https://www.fao.org/land-water/water/agricultural-water-management/water-accounting/en",
  },
  {
    value: "1.05B t",
    title: "food waste generated",
    meta: "UNEP · FOOD WASTE INDEX 2024 · 2022 DATA",
    text: "Estimated retail, food-service and household food waste, including inedible parts.",
    limit: "NOT THE SAME MEASURE AS UPSTREAM FOOD LOSS BEFORE RETAIL",
    href: "https://www.unep.org/resources/publication/food-waste-index-report-2024",
  },
] as const;

const PRESSURES = [
  ["LAND", "Conversion, production footprint and habitat context"],
  ["WATER", "Withdrawals, irrigation, basin stress and water-quality context"],
  ["NUTRIENTS", "Fertiliser inputs, runoff and chemical pressure"],
  ["CLIMATE", "CO₂, CH₄ and N₂O source and inventory context"],
  ["BIODIVERSITY", "Where production geographies meet recorded life and habitats"],
] as const;

const SOURCES = [
  ["LIVE API", "CLIMATE TRACE", "Agriculture emissions source records", "Inventory/model records; not live plumes or proof of ecological damage at a point."],
  ["EXISTING ATLAS", "NASA GIBS", "Earth · vegetation · rain · fire", "Remote-sensing products have source-specific dates and semantics; thermal anomaly is not automatically wildfire."],
  ["EXISTING ATLAS", "GLOBAL FOREST WATCH", "Tree-cover-loss context", "Tree-cover loss is not automatically deforestation and does not establish a commodity driver by itself."],
  ["EXISTING ATLAS", "GBIF", "Species occurrence records", "Observation density reflects sampling effort as well as biodiversity; record count is not population."],
  ["OPEN DATASET", "FAOSTAT", "Production, inputs, land and food-system statistics", "Country and commodity statistics require dataset-specific definitions, periods and units."],
  ["OPEN DATASET", "TRASE", "Selected commodity supply chains", "Coverage is commodity- and geography-specific; a mapped flow is not universal supply-chain coverage."],
  ["RIGHTS REVIEW", "GLORIA MRIO", "Consumption and trade footprint modelling", "Public/commercial use and redistribution require explicit rights review before product activation."],
  ["OPEN DATASET", "AQUASTAT", "Water and agriculture context", "National statistics do not establish local basin conditions."],
  ["ACCESS GATED", "GLOBAL FISHING WATCH", "Fishing-effort and vessel context", "Token/access and use terms apply; AIS-derived apparent effort does not prove illegality or ecological impact."],
] as const;

const LIFE_NODES: GraphNode[] = [
  { id: "soils", label: "SOILS", kicker: "LIVING FOUNDATION", detail: "Soil condition, nutrients and productivity sit beneath much of terrestrial food production.", x: 18, y: 24 },
  { id: "water", label: "FRESHWATER", kicker: "DEPENDENCY", detail: "Water is both a direct dependency and a spatially uneven production constraint.", x: 50, y: 12 },
  { id: "climate", label: "CLIMATE", kicker: "CONDITION", detail: "Temperature, precipitation and greenhouse-gas pressure remain separate signals rather than one score.", x: 82, y: 24 },
  { id: "pollinators", label: "POLLINATORS", kicker: "ECOLOGICAL FUNCTION", detail: "Some crop systems depend on animal pollination; the relationship varies by crop, place and production system.", x: 17, y: 76 },
  { id: "forests", label: "FORESTS", kicker: "LAND SYSTEM", detail: "Forest change can provide spatial context around production landscapes without proving cause by itself.", x: 50, y: 89 },
  { id: "marine", label: "MARINE SYSTEMS", kicker: "SEAFOOD", detail: "Wild capture and aquaculture connect FOOD_ directly to marine habitats, species and ocean conditions.", x: 83, y: 76 },
];

const SOLUTIONS = [
  ["LAND", "AVOID HABITAT CONVERSION", "INTERVENTION HYPOTHESIS"],
  ["NUTRIENTS", "IMPROVE NUTRIENT EFFICIENCY", "INTERVENTION HYPOTHESIS"],
  ["CLIMATE", "REDUCE METHANE + N₂O", "INTERVENTION HYPOTHESIS"],
  ["WATER", "IMPROVE WATER PRODUCTIVITY", "INTERVENTION HYPOTHESIS"],
  ["WASTE", "REDUCE FOOD LOSS + WASTE", "INTERVENTION HYPOTHESIS"],
  ["TRADE", "DEFORESTATION-FREE SOURCING", "INTERVENTION HYPOTHESIS"],
  ["LAND", "RESTORE DEGRADED SYSTEMS", "INTERVENTION HYPOTHESIS"],
  ["SYSTEM", "PROCUREMENT + POLICY", "INTERVENTION HYPOTHESIS"],
  ["SYSTEM", "FINANCE + DATA + MEASUREMENT", "INTERVENTION HYPOTHESIS"],
] as const;

const CHAINS = [
  ["01", "FOOD", "Eat", "GOLD STANDARD"],
  ["02", "ENERGY", "Power", "MAPPED NEXT"],
  ["03", "ROAD MOBILITY", "Move", "MAPPED NEXT"],
  ["04", "AVIATION", "Move", "MAPPED NEXT"],
  ["05", "SHIPPING + PORTS", "Move goods", "MAPPED NEXT"],
  ["06", "BUILDINGS + CITIES", "Shelter", "MAPPED NEXT"],
  ["07", "CEMENT + CONCRETE", "Build", "MAPPED NEXT"],
  ["08", "STEEL + METALS", "Build", "MAPPED NEXT"],
  ["09", "MINING + MINERALS", "Materials", "MAPPED NEXT"],
  ["10", "FASHION + TEXTILES", "Wear", "MAPPED NEXT"],
  ["11", "PLASTICS + PACKAGING", "Package", "MAPPED NEXT"],
  ["12", "CHEMICALS + FERTILISERS", "Produce", "MAPPED NEXT"],
  ["13", "TIMBER + PAPER", "Build + use", "MAPPED NEXT"],
  ["14", "ELECTRONICS", "Connect", "MAPPED NEXT"],
  ["15", "FRESHWATER USE", "Drink + produce", "MAPPED NEXT"],
  ["16", "FISHERIES + SEAFOOD", "Eat", "MAPPED NEXT"],
  ["17", "WASTE + LANDFILLS", "Discard", "MAPPED NEXT"],
  ["18", "TOURISM + TRAVEL", "Experience", "MAPPED NEXT"],
  ["19", "CONSUMER GOODS", "Use", "MAPPED NEXT"],
  ["20", "GLOBAL TRADE + LOGISTICS", "Exchange", "MAPPED NEXT"],
] as const;

const CHAPTERS = [
  ["atlas", "01"],
  ["human", "02"],
  ["food", "03"],
  ["pressure", "04"],
  ["evidence", "05"],
  ["life", "06"],
  ["solutions", "07"],
] as const;

function SystemGraph({ nodes, selected, onSelect, centreLabel }: { nodes: GraphNode[]; selected: string | null; onSelect: (node: GraphNode) => void; centreLabel: string }) {
  return (
    <div className="sapiens-system-graph" aria-label={`${centreLabel} relationship graph`}>
      <svg className="sapiens-system-graph__links" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
        {nodes.map((node) => <line key={node.id} x1="50" y1="50" x2={node.x} y2={node.y} />)}
      </svg>
      <div className="sapiens-system-graph__centre">
        <span>CORE</span>
        <strong>{centreLabel}</strong>
      </div>
      {nodes.map((node) => (
        <button
          key={node.id}
          type="button"
          className={`sapiens-system-node ${selected === node.id ? "is-active" : ""}`}
          style={{ left: `${node.x}%`, top: `${node.y}%` }}
          onClick={() => onSelect(node)}
          aria-label={`${node.kicker}: ${node.label}`}
        >
          <small>{node.kicker}</small>
          <strong>{node.label}</strong>
        </button>
      ))}
    </div>
  );
}

function RelationKey({ active = "DEPENDENCY" }: { active?: Relation }) {
  return (
    <div className="sapiens-relation-key" aria-label="Relationship classes">
      {(["DEPENDENCY", "PRESSURE", "RESPONSE"] as Relation[]).map((item) => <span key={item} className={item === active ? "is-active" : ""}>{item}</span>)}
    </div>
  );
}

export default function SapiensAtlasSandbox() {
  const [activeChapter, setActiveChapter] = useState("atlas");
  const [humanNode, setHumanNode] = useState<GraphNode>(HUMAN_NODES[0]);
  const [lifeNode, setLifeNode] = useState<GraphNode>(LIFE_NODES[0]);
  const [foodStage, setFoodStage] = useState(0);
  const [solution, setSolution] = useState(0);
  const [liveFood, setLiveFood] = useState<LiveFoodState | null>(null);

  useEffect(() => {
    const sections = Array.from(document.querySelectorAll<HTMLElement>("[data-sapiens-story-step]"));
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible?.target instanceof HTMLElement) setActiveChapter(visible.target.dataset.sapiensStoryStep ?? "atlas");
    }, { rootMargin: "-32% 0px -52% 0px", threshold: [0, 0.2, 0.55] });
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/sapiens-food", { signal: controller.signal })
      .then((response) => response.json())
      .then((payload) => setLiveFood(payload as LiveFoodState))
      .catch(() => setLiveFood({ ok: false, state: "UNAVAILABLE" }));
    return () => controller.abort();
  }, []);

  const liveLabel = useMemo(() => {
    if (!liveFood) return "SOURCE CHECKING";
    if (!liveFood.ok) return "SOURCE UNAVAILABLE";
    return `${liveFood.returned ?? 0} SOURCE RECORDS`;
  }, [liveFood]);

  const scrollTo = (id: string) => document.getElementById(`sapiens-${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });

  return (
    <PublicShell>
      <main className="sapiens-story sapiens-premium-v11">
        <nav className="sapiens-progress" aria-label="S4PIENS chapters">
          {CHAPTERS.map(([id, number]) => (
            <button key={id} type="button" onClick={() => scrollTo(id)} className={activeChapter === id ? "is-active" : ""} aria-label={`Open chapter ${number}`}>
              <span>{number}</span><span aria-hidden />
            </button>
          ))}
        </nav>

        <section id="sapiens-atlas" data-sapiens-story-step="atlas" className="sapiens-atlas-hero sapiens-chapter">
          <picture className="sapiens-atlas-hero__earth" aria-hidden>
            <source media="(max-width: 760px)" srcSet="/assets/brand/earth-iss-mobile.jpg" />
            <img src="/assets/brand/earth-iss.jpg" alt="" />
          </picture>
          <div className="sapiens-atlas-hero__shade" aria-hidden />
          <div className="sapiens-atlas-hero__chrome">
            <span>4PLANET_ / S4PIENS_ / HUMAN SYSTEMS ATLAS</span>
            <span>EARTH · SHARED PLANET MODEL · {liveLabel}</span>
          </div>

          <article className="sapiens-atlas-hero__story">
            <span className="sapiens-kicker">01 · ATLAS · S4PIENS_</span>
            <h1>You are here.</h1>
            <p>S4PIENS is a map of how human needs become systems across the planet — and where those systems meet the living world.</p>
            <div className="sapiens-truth-line">START WITH EARTH · THE PLANET IS THE SHARED SPATIAL CANVAS.</div>
            <div className="sapiens-actions">
              <button type="button" className="sapiens-action is-accent" onClick={() => scrollTo("human")}>START WITH THE HUMAN ↓</button>
              <Link className="sapiens-action" to="/atlas?m=S4PIENS&journey=food&entity=taxon%3Agbif%3A10856082">OPEN FREE ATLAS →</Link>
            </div>
          </article>

          <article className="sapiens-species-card">
            <picture><source media="(max-width: 760px)" srcSet="/assets/brand/story-hero-mobile.jpg" /><img src="/assets/brand/story-hero.jpg" alt="A single human figure walking through a vast landscape" /></picture>
            <div className="sapiens-species-card__body">
              <span className="sapiens-kicker">SPECIES_ · GBIF 10856082 · IDENTITY KNOWN</span>
              <h2>Homo sapiens</h2>
              <p>Human. A species that depends on living systems — and builds systems capable of changing them.</p>
              <dl>
                <div><dt>DEPENDENCY</dt><dd>planet → human</dd></div>
                <div><dt>PRESSURE</dt><dd>human system → planet</dd></div>
                <div><dt>RESPONSE</dt><dd>system → change</dd></div>
              </dl>
              <Link to="/species/homo-sapiens">OPEN GOLD SPECIES CARD →</Link>
            </div>
          </article>

          <div className="sapiens-atlas-status" aria-label="Prototype Atlas status">
            <div><span>CANVAS</span><strong>EARTH</strong></div>
            <div><span>CONTEXT</span><strong>S4PIENS_</strong></div>
            <div><span>JOURNEY</span><strong>FOOD_ GOLD</strong></div>
            <div><span>DATA LAYERS</span><strong>PROGRESSIVE</strong></div>
            <div><span>SOURCE STATE</span><strong>{liveFood?.ok ? "AVAILABLE" : liveFood ? "DEGRADED" : "CHECKING"}</strong></div>
            <div><span>RELEASE</span><strong>INTERNAL PROTOTYPE</strong></div>
          </div>
        </section>

        <section id="sapiens-human" data-sapiens-story-step="human" className="sapiens-chapter sapiens-human-chapter sapiens-orange">
          <div className="sapiens-section-grid">
            <div className="sapiens-section-copy">
              <span className="sapiens-kicker">02 · HOMO SAPIENS · HUMAN SYSTEMS</span>
              <h2>One species.<br />Many systems.</h2>
              <p>We depend on living systems for food, water, materials and stable conditions. At the same time, the systems we build can change those living systems.</p>
              <RelationKey active="DEPENDENCY" />
              <div className="sapiens-inspect sapiens-inspect--orange">
                <span>{humanNode.kicker}</span>
                <strong>{humanNode.label}</strong>
                <p>{humanNode.detail}</p>
              </div>
            </div>
            <div className="sapiens-graph-wrap sapiens-graph-wrap--orange">
              <SystemGraph nodes={HUMAN_NODES} selected={humanNode.id} onSelect={(node) => { setHumanNode(node); if (node.id === "food") setTimeout(() => scrollTo("food"), 180); }} centreLabel="HOMO SAPIENS" />
            </div>
          </div>
        </section>

        <section id="sapiens-food" data-sapiens-story-step="food" className="sapiens-chapter sapiens-food-chapter sapiens-paper">
          <div className="sapiens-paper-inner">
            <span className="sapiens-kicker">03 · FOOD_ · GOLD STANDARD 01</span>
            <div className="sapiens-food-heading">
              <h2>Follow one meal.</h2>
              <p>One ordinary human need opens the full system: demand, biological production, inputs, processing, trade, consumption, waste — and the pressures and dependencies underneath it.</p>
            </div>

            <div className="sapiens-chainrail" aria-label="FOOD journey stages">
              {FOOD_STAGES.map(([number, label], index) => (
                <button key={label} type="button" className={foodStage === index ? "is-active" : ""} onClick={() => setFoodStage(index)} aria-label={`${number}: ${label}`}>
                  <span>{number}</span><strong>{label}</strong><i aria-hidden />
                </button>
              ))}
            </div>
            <div className="sapiens-stage-detail">
              <span>{FOOD_STAGES[foodStage][0]} · CHAIN STAGE</span>
              <h3>{FOOD_STAGES[foodStage][1]}</h3>
              <p>{FOOD_STAGES[foodStage][2]}</p>
              <Link to="/atlas?m=S4PIENS&journey=food">LOCATE THIS SYSTEM IN ATLAS →</Link>
            </div>

            <div className="sapiens-proof-grid" aria-label="Three source-backed global FOOD context signals">
              {PROOF.map((item) => (
                <a key={item.value} href={item.href} target="_blank" rel="noreferrer">
                  <span>{item.meta}</span>
                  <strong>{item.value}</strong>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                  <small>{item.limit}</small>
                </a>
              ))}
            </div>
          </div>
        </section>

        <section id="sapiens-pressure" data-sapiens-story-step="pressure" className="sapiens-chapter sapiens-pressure-chapter">
          <picture className="sapiens-pressure-chapter__image" aria-hidden><img src="/assets/missions/food/hero.jpg" alt="" /></picture>
          <div className="sapiens-pressure-chapter__shade" aria-hidden />
          <div className="sapiens-pressure-content">
            <span className="sapiens-kicker">04 · FOOD_ · FROM HUMAN NEED TO PLANETARY SYSTEM</span>
            <h2>The chain becomes visible when data layers meet the story.</h2>
            <p>Source records and environmental layers put the chain back on Earth. They can show where systems and pressures coexist without pretending co-location proves ecological cause.</p>
            <RelationKey active="PRESSURE" />
            <div className="sapiens-pressure-grid">
              {PRESSURES.map(([name, detail]) => <Link key={name} to="/atlas?m=S4PIENS&journey=food" className="sapiens-pressure-item"><span>{name}</span><p>{detail}</p><b>OPEN LAYER →</b></Link>)}
            </div>
            <div className="sapiens-map-truth"><span>SPATIAL TRUTH</span><strong>CO-LOCATION ≠ CAUSATION</strong><p>Local ecological outcome requires evidence beyond a nearby marker.</p></div>
          </div>
        </section>

        <section id="sapiens-evidence" data-sapiens-story-step="evidence" className="sapiens-chapter sapiens-evidence-chapter">
          <div className="sapiens-evidence-head">
            <span className="sapiens-kicker">05 · SOURCE LEDGER · CHECKED 2026-08-19</span>
            <h2>Evidence before interpretation.</h2>
            <p>Each source keeps its own semantics, rights and failure state. Missing or failed sources stay missing — never rendered as zero.</p>
          </div>
          <div className="sapiens-source-summary"><span>LIVE API</span><span>EXISTING ATLAS</span><span>OPEN DATASET</span><span>RIGHTS REVIEW</span><span>ACCESS GATED</span></div>
          <div className="sapiens-source-ledger">
            {SOURCES.map(([state, name, use, limitation]) => (
              <article key={name}>
                <div><span className={`sapiens-source-state is-${state.toLowerCase().replaceAll(" ", "-")}`}>{state}</span><small>{name}</small></div>
                <div><h3>{use}</h3><p>LIMIT · {limitation}</p></div>
                <div><span>CHECKED 2026-08-19</span><strong>{name === "CLIMATE TRACE" ? liveLabel : "SOURCE CONTRACT"}</strong></div>
              </article>
            ))}
          </div>
          <div className="sapiens-evidence-rules"><span>SOURCE FAILURE ≠ ZERO</span><span>OBSERVATION DENSITY ≠ ABUNDANCE</span><span>RECORD ≠ OUTCOME</span></div>
        </section>

        <section id="sapiens-life" data-sapiens-story-step="life" className="sapiens-chapter sapiens-life-chapter">
          <div className="sapiens-section-grid sapiens-section-grid--dark">
            <div className="sapiens-section-copy">
              <span className="sapiens-kicker">06 · UNDERSTAND SYSTEMS · LIVING SYSTEMS VIEW</span>
              <h2>Find what the system depends on.</h2>
              <p>The graph is an explanation layer over the same Planet Model. It exposes dependencies and living context without creating a second map, backend or truth system.</p>
              <RelationKey active="DEPENDENCY" />
              <div className="sapiens-inspect">
                <span>{lifeNode.kicker}</span><strong>{lifeNode.label}</strong><p>{lifeNode.detail}</p>
              </div>
              <Link className="sapiens-inline-link" to="/living-systems?entity=taxon%3Agbif%3A10856082&journey=food">OPEN LIVING SYSTEMS →</Link>
            </div>
            <div className="sapiens-graph-wrap">
              <SystemGraph nodes={LIFE_NODES} selected={lifeNode.id} onSelect={setLifeNode} centreLabel="FOOD SYSTEM" />
            </div>
          </div>
        </section>

        <section id="sapiens-solutions" data-sapiens-story-step="solutions" className="sapiens-chapter sapiens-solutions-chapter sapiens-orange">
          <div className="sapiens-solutions-head">
            <span className="sapiens-kicker">07 · SOLUTIONS MAP · RESPONSE</span>
            <h2>Then find leverage.</h2>
            <p>The endpoint is not guilt. It is a testable map of where people, policy, capital, technology, procurement and restoration may change the system.</p>
            <div className="sapiens-response-rule">RESPONSE ≠ OUTCOME</div>
          </div>
          <div className="sapiens-solutions-layout">
            <div className="sapiens-solution-list">
              {SOLUTIONS.map(([pressure, label, state], index) => (
                <button key={label} type="button" className={solution === index ? "is-active" : ""} onClick={() => setSolution(index)}>
                  <span>{String(index + 1).padStart(2, "0")} · {pressure}</span><strong>{label}</strong><small>{state}</small>
                </button>
              ))}
            </div>
            <div className="sapiens-solution-focus">
              <span>{SOLUTIONS[solution][0]} · RESPONSE</span>
              <h3>{SOLUTIONS[solution][1]}</h3>
              <p>This remains an intervention hypothesis until effectiveness, operator, delivery and evidence support a stronger claim.</p>
              <RelationKey active="RESPONSE" />
            </div>
          </div>
          <div className="sapiens-final-actions">
            <Link to="/missions/food">OPEN FOOD_ MISSION →</Link>
            <Link to="/atlas?m=S4PIENS&journey=food">OPEN ATLAS →</Link>
            <Link to="/species/homo-sapiens">OPEN HOMO SAPIENS →</Link>
            <button type="button" onClick={() => scrollTo("atlas")}>RETURN TO EARTH ↑</button>
          </div>
        </section>

        <section className="sapiens-transfer sapiens-paper" aria-label="Twenty human system chains">
          <div className="sapiens-transfer-head">
            <span className="sapiens-kicker">TRANSFER · 20 HUMAN SYSTEM CHAINS</span>
            <h2>FOOD_ proves the grammar.<br />The same map can scale.</h2>
            <p>One shared Planet Model. Different human needs and value chains. No need for twenty disconnected dashboards.</p>
          </div>
          <div className="sapiens-chain-list">
            {CHAINS.map(([number, label, need, state]) => <div key={number} className={state === "GOLD STANDARD" ? "is-gold" : ""}><span>{number}</span><strong>{label}</strong><em>{need}</em><b>{state}</b></div>)}
          </div>
        </section>

        <footer className="sapiens-prototype-footer">INTERNAL GOLD PROTOTYPE · SOURCE-AWARE · NOT A PRODUCTION RELEASE</footer>
      </main>
    </PublicShell>
  );
}