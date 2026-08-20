import { Link } from "react-router-dom";
import { PublicShell } from "@/components/layout/PublicShell";
import { PressurePath, type PressurePathItem } from "@/components/species/SpeciesPressurePath";
import { T } from "@/styles/tokens";

const mono: React.CSSProperties = { fontFamily: T.mono, fontSize: 10, letterSpacing: ".12em" };
const max: React.CSSProperties = { maxWidth: 1240, margin: "0 auto", paddingLeft: "clamp(18px,5vw,72px)", paddingRight: "clamp(18px,5vw,72px)" };
const NASA_MAP = "https://science.nasa.gov/earth/earth-observatory/mapping-the-amazon-145649/";
const NASA_RAIN = "https://science.nasa.gov/earth/earth-observatory/the-amazon-makes-its-own-wet-season-91161/";
const NASA_LAND_USE = "https://science.nasa.gov/earth/earth-observatory/making-sense-of-amazon-deforestation-patterns-145888/";
const NASA_FIRE = "https://science.nasa.gov/earth/earth-observatory/fires-rage-along-brazils-deforestation-frontier-153175/";
const NASA_DRY = "https://science.nasa.gov/earth/earth-observatory/human-activities-are-drying-out-the-amazon-145834/";

const FUNCTIONS = [
  ["WATER", "Forest vegetation moves large amounts of water from soil to atmosphere through transpiration, helping shape regional rainfall."],
  ["CARBON", "Forest biomass and soils store carbon while respiration, decomposition, fire and land-use change return carbon to the atmosphere."],
  ["HABITAT", "A vast mosaic of forests, rivers, floodplains and wetlands supports extraordinary biological diversity and many distinct ecological communities."],
  ["CONNECTION", "Rivers, seasonal floods, forest structure, animals, plants, fungi, soils and climate processes connect across scales; this page is an entry, not a complete model."],
] as const;

const AMAZON_PRESSURES: PressurePathItem[] = [
  {
    id: "amazon-land-use-change",
    label: "LAND-USE CHANGE",
    summary: "Satellite observations document major forest clearing and land conversion across parts of the Amazon, with patterns and drivers changing across place and time.",
    causeClass: "HUMAN_SYSTEM",
    causeLabel: "Human land-use systems that clear or convert forest. The specific economic and institutional drivers differ by place and period.",
    sourceLabel: "NASA · DEFORESTATION PATTERNS",
    sourceUrl: NASA_LAND_USE,
    boundary: "Regional synthesis with Brazilian Amazon examples. This does not assign one driver, rate or ecological condition to the whole Amazon basin.",
  },
  {
    id: "amazon-fire",
    label: "FIRE",
    summary: "In documented Amazon fire episodes, human ignition associated with deforestation can interact with dry-season and drought conditions that affect how fire spreads.",
    causeClass: "MIXED",
    causeLabel: "Human ignition / deforestation activity + climatic and landscape conditions that influence fire spread and severity.",
    sourceLabel: "NASA · 2024 DEFORESTATION-FRONTIER FIRES",
    sourceUrl: NASA_FIRE,
    boundary: "The cited NASA record describes 2024 activity in parts of the Brazilian Amazon, including Amazonas and Pará. It does not imply that every Amazon fire has the same cause.",
  },
  {
    id: "amazon-atmospheric-drying",
    label: "ATMOSPHERIC DRYING",
    summary: "A NASA-led analysis of 1987–2016 found increasing atmospheric dryness over the Amazon, strongest in the south and southeast, beyond what the study expected from natural variability alone.",
    causeClass: "HUMAN_SYSTEM",
    causeLabel: "The study attributes the observed drying trend primarily to human activities, including elevated greenhouse gases and forest burning / land clearing.",
    sourceLabel: "NASA · AMAZON DRYING STUDY",
    sourceUrl: NASA_DRY,
    boundary: "Study-period and region-pattern evidence, not a current uniform ecological state for the entire Amazon. The strongest systematic drying in the source was south/southeast.",
  },
];

function Head({ k, title, intro }: { k: string; title: string; intro: string }) {
  return <div style={{ maxWidth: 850 }}><div style={{ ...mono, color: T.acid }}>{k}</div><h2 style={{ margin: "18px 0 0", fontFamily: T.display, fontWeight: 500, fontSize: "clamp(40px,6vw,84px)", lineHeight: .91, letterSpacing: "-.052em" }}>{title}</h2><p style={{ margin: "24px 0 0", maxWidth: 730, fontSize: "clamp(16px,2vw,20px)", lineHeight: 1.6, color: "rgba(255,255,255,.72)" }}>{intro}</p></div>;
}

export default function AmazonRainforest() {
  return <PublicShell><article style={{ background: "#020503", color: "#fff" }}>
    <header style={{ minHeight: "min(850px,calc(100vh - 64px))", position: "relative", overflow: "hidden", display: "flex", alignItems: "flex-end" }}>
      <div aria-hidden style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 78% 24%,rgba(58,232,111,.25),transparent 24%),radial-gradient(circle at 18% 75%,rgba(46,46,255,.16),transparent 30%),linear-gradient(130deg,#07150b 0%,#020503 55%,#000 100%)" }} />
      <div aria-hidden style={{ position: "absolute", inset: 0, opacity: .22, backgroundImage: "linear-gradient(rgba(255,255,255,.09) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.09) 1px,transparent 1px)", backgroundSize: "54px 54px", maskImage: "linear-gradient(to bottom,transparent,#000 28%,#000)" }} />
      <div style={{ ...max, position: "relative", width: "100%", paddingTop: 110, paddingBottom: "clamp(52px,8vw,96px)" }}>
        <div style={{ ...mono, color: T.acid }}>ECOSYSTEM_ · E4RTH_ · BOUNDED PUBLIC ENTRY 01</div>
        <h1 style={{ maxWidth: 1100, margin: "22px 0 0", fontFamily: T.display, fontSize: "clamp(66px,12vw,160px)", lineHeight: .77, letterSpacing: "-.072em", fontWeight: 500 }}>AMAZON<br />RAINFOREST</h1>
        <p style={{ maxWidth: 760, margin: "34px 0 0", fontSize: "clamp(18px,2.4vw,26px)", lineHeight: 1.5, color: "rgba(255,255,255,.84)" }}>A living region made of many ecosystems, rivers, forests, floodplains, species and human societies — connected by water, energy, nutrients, movement and change.</p>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 30 }}><Link to="/species/jaguar" style={{ background: T.acid, color: "#071009", padding: "13px 17px", textDecoration: "none", fontWeight: 650, fontSize: 13 }}>RETURN TO JAGUAR →</Link><Link to="/atlas?journey=amazonia" style={{ border: "1px solid rgba(255,255,255,.48)", color: "#fff", padding: "13px 17px", textDecoration: "none", fontWeight: 650, fontSize: 13 }}>OPEN AMAZONIA IN ATLAS →</Link></div>
      </div>
    </header>

    <section style={{ borderTop: "1px solid rgba(255,255,255,.15)" }}><div style={{ ...max, paddingTop: "clamp(58px,8vw,104px)", paddingBottom: "clamp(58px,8vw,104px)" }}><Head k="01_ WHAT + WHERE" title="A region, not one uniform ecosystem." intro="4PLANET uses ‘Amazon Rainforest’ here as a human-readable regional entry. The Amazon basin contains multiple forest, river, wetland and human systems; boundaries and conditions differ by dataset, place and question." /><div className="amazon-two" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0, marginTop: 48, borderTop: "1px solid rgba(255,255,255,.18)", borderLeft: "1px solid rgba(255,255,255,.18)" }}><div style={{ padding: "clamp(24px,4vw,42px)", borderRight: "1px solid rgba(255,255,255,.18)", borderBottom: "1px solid rgba(255,255,255,.18)" }}><div style={{ ...mono, color: T.acid }}>REGIONAL CONTEXT</div><p style={{ fontSize: 19, lineHeight: 1.6, color: "rgba(255,255,255,.8)" }}>NASA describes the Amazon basin as home to Earth’s largest rainforest and the world’s largest river system by discharge and drainage-basin scale.</p><a href={NASA_MAP} target="_blank" rel="noreferrer" style={{ ...mono, color: T.acid }}>NASA SOURCE ↗</a></div><div style={{ padding: "clamp(24px,4vw,42px)", borderRight: "1px solid rgba(255,255,255,.18)", borderBottom: "1px solid rgba(255,255,255,.18)" }}><div style={{ ...mono, color: T.acid }}>BOUNDARY</div><p style={{ fontSize: 19, lineHeight: 1.6, color: "rgba(255,255,255,.8)" }}>This public entry does not claim one authoritative polygon, one ecological condition or one trend for the whole region. Place-specific claims must carry place-specific evidence.</p></div></div></div></section>

    <section style={{ background: "#071009" }}><div style={{ ...max, paddingTop: "clamp(58px,8vw,104px)", paddingBottom: "clamp(58px,8vw,104px)" }}><Head k="02_ HOW IT WORKS" title="Water. Carbon. Habitat. Connection." intro="The point is not to reduce the Amazon to four functions. These are four readable doors into a much larger living-system model." /><div className="amazon-four" style={{ display: "grid", gridTemplateColumns: "repeat(4,minmax(0,1fr))", marginTop: 48, borderTop: "1px solid rgba(255,255,255,.18)", borderLeft: "1px solid rgba(255,255,255,.18)" }}>{FUNCTIONS.map(([title, copy], i) => <article key={title} style={{ minHeight: 285, padding: 24, borderRight: "1px solid rgba(255,255,255,.18)", borderBottom: "1px solid rgba(255,255,255,.18)" }}><div style={{ ...mono, color: T.acid }}>F{String(i + 1).padStart(2, "0")}</div><h3 style={{ fontFamily: T.display, fontSize: "clamp(25px,3vw,36px)", letterSpacing: "-.03em", margin: "28px 0 0" }}>{title}</h3><p style={{ margin: "18px 0 0", fontSize: 14, lineHeight: 1.65, color: "rgba(255,255,255,.68)" }}>{copy}</p></article>)}</div><div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginTop: 22 }}><a href={NASA_RAIN} target="_blank" rel="noreferrer" style={{ ...mono, color: T.acid }}>NASA · WATER CYCLE ↗</a><a href={NASA_MAP} target="_blank" rel="noreferrer" style={{ ...mono, color: T.acid }}>NASA · AMAZON MAPPING ↗</a></div></div></section>

    <section><div style={{ ...max, paddingTop: "clamp(58px,8vw,104px)", paddingBottom: "clamp(58px,8vw,104px)" }}><Head k="03_ LIFE" title="Enter through a species. Keep going." intro="Species are not decorative examples. They are graph entry points into habitats, relationships, functions, observations, pressures and solutions." /><div className="amazon-two" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginTop: 42 }}><Link to="/species/jaguar" style={{ minHeight: 310, padding: "clamp(26px,5vw,50px)", background: T.acid, color: "#071009", textDecoration: "none" }}><div style={{ ...mono }}>PREDATOR · LAND MAMMAL</div><h3 style={{ margin: "40px 0 0", fontFamily: T.display, fontSize: "clamp(42px,7vw,86px)", letterSpacing: "-.055em", lineHeight: .9, fontWeight: 500 }}>JAGUAR</h3><p style={{ marginTop: 20, maxWidth: 480, lineHeight: 1.6 }}>Follow reported observations, habitat context, food-web relationships and pressures.</p></Link><Link to="/species/hyacinth-macaw" style={{ minHeight: 310, padding: "clamp(26px,5vw,50px)", border: "1px solid rgba(255,255,255,.24)", color: "#fff", textDecoration: "none" }}><div style={{ ...mono, color: T.acid }}>BIRD · REGIONAL CONTEXT</div><h3 style={{ margin: "40px 0 0", fontFamily: T.display, fontSize: "clamp(38px,6vw,72px)", letterSpacing: "-.05em", lineHeight: .9, fontWeight: 500 }}>HYACINTH<br />MACAW</h3><p style={{ marginTop: 20, maxWidth: 480, lineHeight: 1.6, color: "rgba(255,255,255,.7)" }}>A separate species entry already present in the 4PLANET catalogue; its habitat context includes parts of the broader Amazon region.</p></Link></div></div></section>

    <PressurePath
      items={AMAZON_PRESSURES}
      eyebrow="04_ CHANGE + PRESSURES · ECOSYSTEM_"
      title="What is changing — and why?"
      intro="Three source-backed pressure paths are exposed here now. They are not an exhaustive diagnosis of the Amazon. Each keeps its own geography, time period and cause boundary so a regional learning object does not become a false basin-wide state claim."
      ariaId="amazon-pressure-title"
    />

    <section style={{ background: T.acid, color: "#071009" }}><div style={{ ...max, paddingTop: "clamp(58px,8vw,104px)", paddingBottom: "clamp(58px,8vw,104px)" }}><div style={{ ...mono }}>05_ FROM UNDERSTANDING TO ACTION</div><h2 style={{ margin: "18px 0 0", maxWidth: 1040, fontFamily: T.display, fontWeight: 500, fontSize: "clamp(48px,8vw,112px)", lineHeight: .85, letterSpacing: "-.06em" }}>Pressure is not the destination.<br />Solutions are part of the map.</h2><p style={{ maxWidth: 760, marginTop: 28, fontSize: 18, lineHeight: 1.6 }}>Continue into AM4ZONIA, Living Systems and ATLAS. 4PLANET does not imply that it represents the Amazon, has a field mandate there, or has delivered ecological outcomes unless those claims are separately evidenced.</p><div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 32 }}><Link to="/missions/am4zonia" style={{ background: "#071009", color: "#fff", padding: "13px 17px", textDecoration: "none", fontWeight: 650, fontSize: 13 }}>AM4ZONIA →</Link><Link to="/living-systems" style={{ border: "1px solid #071009", color: "#071009", padding: "13px 17px", textDecoration: "none", fontWeight: 650, fontSize: 13 }}>LIVING SYSTEMS →</Link><Link to="/atlas?journey=amazonia" style={{ border: "1px solid #071009", color: "#071009", padding: "13px 17px", textDecoration: "none", fontWeight: 650, fontSize: 13 }}>ATLAS →</Link></div><div style={{ ...mono, marginTop: 42, paddingTop: 20, borderTop: "1px solid rgba(7,16,9,.32)", lineHeight: 1.7 }}>PUBLIC ECOSYSTEM INTELLIGENCE ≠ FIELD AUTHORITY OR REPRESENTATION · REGION-WIDE COPY ≠ PLACE-SPECIFIC ECOLOGICAL STATE · SOURCES + UNCERTAINTY STAY VISIBLE.</div></div></section>
  </article><style>{`@media(max-width:820px){.amazon-two{grid-template-columns:1fr!important}.amazon-four{grid-template-columns:1fr 1fr!important}}@media(max-width:520px){.amazon-four{grid-template-columns:1fr!important}}`}</style></PublicShell>;
}
