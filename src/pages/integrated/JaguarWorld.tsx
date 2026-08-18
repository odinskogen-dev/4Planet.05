import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { PublicShell } from "@/components/layout/PublicShell";
import { T } from "@/styles/tokens";
import { taxonOccurrences } from "@/planet/connectors";
import type { Occurrence } from "@/planet/types";
import { speciesMedia } from "@/data/speciesMedia";
import { contextHref } from "@/product/ProductNav";

const mono: React.CSSProperties = { fontFamily: T.mono, fontSize: 10, letterSpacing: ".12em", textTransform: "uppercase" };
const pad = "clamp(28px,5vw,84px)";
const acid = "#C7FF3D";
const earth = "#D7FF45";
const ink = "#F4F5EF";
const dim = "rgba(244,245,239,.66)";
const line = "rgba(244,245,239,.18)";
const panel: React.CSSProperties = { borderTop: `1px solid ${line}`, paddingTop: 18 };

const VIDEO = {
  src: "https://upload.wikimedia.org/wikipedia/commons/3/3b/Pantanal_Jaguar_%28Panthera_onca%29.webm",
  source: "https://commons.wikimedia.org/wiki/File:Pantanal_Jaguar_(Panthera_onca).webm",
  credit: 'Gregory "Slobirdr" Smith',
  licence: "CC BY-SA 2.0",
  limitation: "Wild Pantanal jaguar. The Pantanal is a distinct biome; this footage is species context, not evidence of an Amazon observation or current location.",
};

const sources = [
  { label: "GBIF · Panthera onca", href: "https://www.gbif.org/species/5219426", use: "Taxon identity + occurrence records" },
  { label: "WWF · Jaguar", href: "https://www.worldwildlife.org/species/jaguar/", use: "Habitat, ecological role + pressure context" },
  { label: "Panthera · Jaguar", href: "https://panthera.org/cat/jaguar", use: "Connectivity, prey + coexistence context" },
  { label: "Wikimedia Commons · Jaguar video", href: VIDEO.source, use: "Rights-cleared motion · CC BY-SA 2.0" },
];

const web = [
  { id: "prey-cap", type: "PREY", label: "Capybara", scientific: "Hydrochoerus hydrochaeris", note: "Reported prey in parts of the jaguar range. Relationship strength varies by place and prey community." },
  { id: "prey-peccary", type: "PREY", label: "Peccaries", scientific: "Tayassuidae", note: "Important prey group in multiple jaguar landscapes; this is not a universal diet statement." },
  { id: "prey-caiman", type: "PREY", label: "Caimans", scientific: "Caimaninae", note: "Jaguars can take aquatic and semi-aquatic prey where habitats overlap." },
  { id: "forest", type: "HABITAT", label: "Connected forest", scientific: "Landscape structure", note: "Secure, connected habitat supports movement, hunting and breeding across large territories." },
  { id: "water", type: "HABITAT", label: "Rivers & wetlands", scientific: "Freshwater systems", note: "Jaguars are strongly associated with water in many parts of their range." },
  { id: "people", type: "HUMAN SYSTEM", label: "Farms & ranches", scientific: "Coexistence boundary", note: "Habitat conversion and real or perceived livestock losses can create conflict and retaliatory killing." },
];

function AtlasWindow({ rows, total, status }: { rows: Occurrence[]; total: number; status: string }) {
  const points = useMemo(() => rows.filter(r => Number.isFinite(r.lat) && Number.isFinite(r.lng)).slice(0, 24), [rows]);
  return (
    <section aria-labelledby="atlas-window-title" style={{ background: "#07100A", color: ink, border: `1px solid ${line}`, overflow: "hidden" }}>
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1.45fr) minmax(260px,.55fr)" }} className="jag-atlas-grid">
        <div style={{ minHeight: "clamp(360px,48vw,650px)", position: "relative", background: "radial-gradient(circle at 55% 45%, rgba(80,130,68,.22), transparent 38%), #050806" }}>
          <svg viewBox="0 0 1000 500" role="img" aria-label="Mini Atlas showing reported GBIF jaguar occurrence records" style={{ width: "100%", height: "100%", position: "absolute", inset: 0 }} preserveAspectRatio="xMidYMid slice">
            <defs>
              <pattern id="jg-grid" width="50" height="50" patternUnits="userSpaceOnUse"><path d="M 50 0 L 0 0 0 50" fill="none" stroke="rgba(255,255,255,.07)" strokeWidth="1"/></pattern>
            </defs>
            <rect width="1000" height="500" fill="url(#jg-grid)" />
            <path d="M212 20 C170 72 184 118 214 148 C243 177 247 202 234 231 C224 257 240 285 276 307 C310 330 328 370 346 430 C358 465 383 485 412 495 L474 495 C451 454 435 415 436 367 C438 319 470 285 493 246 C517 204 504 160 467 130 C429 99 388 92 349 79 C303 64 263 43 212 20Z" fill="rgba(103,148,80,.16)" stroke="rgba(199,255,61,.32)" strokeWidth="1.2" />
            <path d="M338 192 C365 171 416 165 466 182 C501 194 526 218 536 250 C520 278 489 307 459 331 C419 337 380 322 350 299 C324 273 316 230 338 192Z" fill="rgba(199,255,61,.10)" stroke="rgba(199,255,61,.32)" strokeDasharray="7 8" />
            {points.map((r, i) => {
              const x = ((r.lng + 180) / 360) * 1000;
              const y = ((90 - r.lat) / 180) * 500;
              return <circle key={`${r.sourceRecordId ?? i}-${x}-${y}`} cx={x} cy={y} r={i < 6 ? 5 : 3.2} fill={earth} fillOpacity={i < 6 ? .95 : .58} />;
            })}
          </svg>
          <div style={{ position: "absolute", top: 18, left: 18, ...mono, color: earth }}>ATLAS WINDOW · REPORTED OBSERVATIONS</div>
          <div style={{ position: "absolute", bottom: 18, left: 18, right: 18, ...mono, color: dim, lineHeight: 1.6 }}>POINTS ARE SOURCE RECORDS · NOT RANGE · NOT POPULATION · NOT LIVE TRACKING</div>
        </div>
        <div style={{ padding: "clamp(24px,3vw,42px)", display: "flex", flexDirection: "column" }}>
          <div style={{ ...mono, color: earth }}>SOURCE STATE · {status.replaceAll("_", " ")}</div>
          <h2 id="atlas-window-title" style={{ margin: "18px 0 0", fontFamily: T.display, fontWeight: 500, fontSize: "clamp(30px,4vw,58px)", lineHeight: .96, letterSpacing: "-.04em" }}>A map is a doorway, not a verdict.</h2>
          <p style={{ margin: "20px 0 0", color: dim, fontSize: 16, lineHeight: 1.6 }}>{total > 0 ? `${total.toLocaleString()} jaguar occurrence records are reported by GBIF; this window plots up to ${points.length} records loaded in this view.` : "This window waits for reported GBIF records. A source failure is never rendered as ecological absence."}</p>
          <p style={{ margin: "16px 0 0", color: dim, fontSize: 13.5, lineHeight: 1.55 }}>Observation density reflects where records exist and where people have looked. It cannot establish current range, abundance, trend or the present location of an animal.</p>
          <Link to={contextHref("/atlas", "", { entity: "taxon:gbif:5219426", journey: "jaguar" })} style={{ marginTop: "auto", paddingTop: 34, ...mono, color: earth, textDecoration: "none" }}>OPEN JAGUAR IN FULL ATLAS →</Link>
        </div>
      </div>
    </section>
  );
}

export function JaguarGoldReference() {
  const location = useLocation();
  const media = speciesMedia("jaguar");
  const [records, setRecords] = useState<{ status: string; rows: Occurrence[]; total: number }>({ status: "LOADING", rows: [], total: 0 });

  useEffect(() => {
    let alive = true;
    taxonOccurrences(5219426, 24).then(result => {
      if (!alive) return;
      if (!result.ok) setRecords({ status: "SOURCE_UNAVAILABLE", rows: [], total: 0 });
      else setRecords({ status: result.data.total > 0 ? "RECORDS_RETRIEVED" : "NO_RECORDS", rows: result.data.rows, total: result.data.total });
    });
    return () => { alive = false; };
  }, []);

  return (
    <PublicShell>
      <main style={{ background: "#050806", color: ink }}>
        <section style={{ minHeight: "100svh", position: "relative", display: "flex", alignItems: "flex-end", overflow: "hidden" }}>
          {media?.localPath ? <img src={media.localPath} alt="Wild jaguar in the Pantanal" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center" }} /> : null}
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg,rgba(0,0,0,.10),rgba(0,0,0,.18) 38%,rgba(0,0,0,.92) 100%)" }} />
          <div style={{ position: "relative", width: "100%", padding: pad, paddingBottom: "clamp(42px,6vw,92px)" }}>
            <div style={{ ...mono, color: earth }}>4PLANET SPECIES_ · E4RTH_ · GOLD REFERENCE 02</div>
            <h1 style={{ margin: "18px 0 0", fontFamily: T.display, fontWeight: 500, fontSize: "clamp(64px,12vw,180px)", lineHeight: .78, letterSpacing: "-.065em" }}>JAGUAR</h1>
            <div style={{ marginTop: 22, display: "flex", gap: 16, flexWrap: "wrap", alignItems: "baseline" }}><em style={{ fontSize: "clamp(18px,2vw,28px)" }}>Panthera onca</em><span style={{ ...mono, color: dim }}>GBIF 5219426 · ACCEPTED TAXON</span></div>
            <p style={{ margin: "28px 0 0", maxWidth: 720, fontSize: "clamp(19px,2.1vw,31px)", lineHeight: 1.24 }}>Follow one animal into the forests, rivers, prey, pressures and human systems that shape its world.</p>
            <div style={{ marginTop: 28, display: "flex", gap: 12, flexWrap: "wrap" }}>
              <a href="#atlas" style={{ ...mono, background: earth, color: "#050806", padding: "13px 16px", textDecoration: "none" }}>ENTER ITS WORLD ↓</a>
              <Link to={contextHref("/atlas", location.search, { entity: "taxon:gbif:5219426", journey: "jaguar" })} style={{ ...mono, border: `1px solid ${ink}`, color: ink, padding: "12px 16px", textDecoration: "none" }}>OPEN IN ATLAS →</Link>
            </div>
            {media?.attribution && <div style={{ marginTop: 24, ...mono, color: "rgba(255,255,255,.55)", lineHeight: 1.5 }}>{media.attribution} · {media.licence}<br/>{media.limitations}</div>}
          </div>
        </section>

        <section style={{ padding: pad, display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 28, background: "#F2F2EA", color: "#070907" }}>
          {[
            ["IDENTITY", "Panthera onca", "Largest native cat in the Americas."],
            ["LIVES ACROSS", "Forests · wetlands · savannas", "Central and South America; habitat use differs by landscape."],
            ["SYSTEM ROLE", "Large predator", "Food-web relationships can shape prey behaviour and abundance; local effects require local evidence."],
            ["TRUTH BOUNDARY", "Observation ≠ range", "A reported point is never population size, trend or live tracking."],
          ].map(([k,v,n]) => <div key={k} style={panel}><div style={{ ...mono, color: "#485436" }}>{k}</div><div style={{ marginTop: 12, fontFamily: T.display, fontSize: 28, lineHeight: 1 }}>{v}</div><p style={{ margin: "12px 0 0", color: "#575A52", lineHeight: 1.5, fontSize: 14 }}>{n}</p></div>)}
        </section>

        <div id="atlas" style={{ padding: pad, paddingBottom: 0 }}><AtlasWindow rows={records.rows} total={records.total} status={records.status} /></div>

        <section style={{ padding: pad }}>
          <div style={{ ...mono, color: earth }}>THE LIVING WEB</div>
          <h2 style={{ margin: "18px 0 0", maxWidth: 940, fontFamily: T.display, fontWeight: 500, fontSize: "clamp(42px,7vw,100px)", lineHeight: .9, letterSpacing: "-.05em" }}>A jaguar is a network of dependencies.</h2>
          <p style={{ maxWidth: 720, margin: "28px 0 0", color: dim, fontSize: 17, lineHeight: 1.65 }}>These nodes are navigational relationship hypotheses and source-backed categories, not a claim that every jaguar eats every prey item or depends on every habitat in the same way.</p>
          <div style={{ marginTop: 52, display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(230px,1fr))", borderTop: `1px solid ${line}` }}>
            {web.map((n, i) => <article key={n.id} style={{ minHeight: 245, padding: "26px 22px 28px", borderRight: `1px solid ${line}`, borderBottom: `1px solid ${line}` }}>
              <div style={{ ...mono, color: n.type === "PREY" ? earth : n.type === "HUMAN SYSTEM" ? "#FF8E75" : "#8FB7FF" }}>{String(i+1).padStart(2,"0")} · {n.type}</div>
              <h3 style={{ margin: "18px 0 0", fontFamily: T.display, fontWeight: 500, fontSize: 32, lineHeight: 1 }}>{n.label}</h3>
              <em style={{ display: "block", marginTop: 8, color: dim, fontSize: 13 }}>{n.scientific}</em>
              <p style={{ margin: "20px 0 0", color: dim, lineHeight: 1.55, fontSize: 13.5 }}>{n.note}</p>
            </article>)}
          </div>
          <Link to="/ecosystems/amazon-rainforest" style={{ display: "inline-block", marginTop: 34, ...mono, color: earth, textDecoration: "none" }}>ENTER THE AMAZON RAINFOREST SYSTEM →</Link>
        </section>

        <section style={{ minHeight: "76svh", position: "relative", display: "grid", placeItems: "center", overflow: "hidden", background: "#000" }}>
          <video controls playsInline preload="metadata" poster={media?.localPath} style={{ width: "100%", minHeight: "76svh", maxHeight: "92svh", objectFit: "cover" }}>
            <source src={VIDEO.src} type="video/webm" />
          </video>
          <div style={{ position: "absolute", top: 20, left: 20, ...mono, color: "#fff", background: "rgba(0,0,0,.66)", padding: "7px 9px" }}>MOTION · WILD PANTANAL JAGUAR</div>
          <div style={{ position: "absolute", bottom: 18, left: 20, right: 20, ...mono, color: "rgba(255,255,255,.78)", background: "rgba(0,0,0,.62)", padding: "8px 10px", lineHeight: 1.55 }}>{VIDEO.credit} · {VIDEO.licence} · <a href={VIDEO.source} target="_blank" rel="noreferrer" style={{ color: "#fff" }}>SOURCE ↗</a><br/>{VIDEO.limitation}</div>
        </section>

        <section style={{ padding: pad, background: "#EEF0E8", color: "#080A08" }}>
          <div style={{ ...mono, color: "#6A311F" }}>PRESSURES → ROOT SYSTEMS</div>
          <h2 style={{ margin: "18px 0 0", maxWidth: 960, fontFamily: T.display, fontWeight: 500, fontSize: "clamp(44px,7vw,96px)", lineHeight: .9, letterSpacing: "-.05em" }}>Follow the pressure upstream.</h2>
          <div style={{ marginTop: 50, display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 26 }}>
            {[
              ["Habitat loss & fragmentation", "LAND USE", "Forest conversion and infrastructure can remove or divide habitat and reduce connectivity."],
              ["Prey depletion", "FOOD SYSTEM / HUNTING", "Where prey communities decline, the ecological and coexistence context changes."],
              ["Retaliatory killing", "COEXISTENCE", "Real or perceived livestock losses can drive conflict between people and large cats."],
              ["Illegal trade & direct killing", "WILDLIFE CRIME", "Direct mortality remains a documented pressure in parts of the range."],
            ].map(([t,k,n]) => <article key={t} style={{ borderTop: "1px solid #A7AAA1", paddingTop: 18 }}><div style={{ ...mono, color: "#6A311F" }}>{k}</div><h3 style={{ margin: "12px 0 0", fontFamily: T.display, fontWeight: 500, fontSize: 30 }}>{t}</h3><p style={{ margin: "14px 0 0", color: "#5B5E57", lineHeight: 1.55 }}>{n}</p></article>)}
          </div>
          <p style={{ margin: "38px 0 0", maxWidth: 760, fontSize: 13, lineHeight: 1.6, color: "#64675F" }}>Pressure categories are general species-level context from WWF and Panthera. They are not diagnoses of any mapped observation, locality or individual.</p>
        </section>

        <section style={{ padding: pad }}>
          <div style={{ ...mono, color: earth }}>FROM UNDERSTANDING → ACTION</div>
          <h2 style={{ margin: "18px 0 0", maxWidth: 900, fontFamily: T.display, fontWeight: 500, fontSize: "clamp(44px,7vw,96px)", lineHeight: .9, letterSpacing: "-.05em" }}>Protect the conditions life depends on.</h2>
          <div style={{ marginTop: 46, display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 2 }}>
            {[
              ["CONNECT HABITAT", "Landscape connectivity is a documented conservation strategy. 4PLANET does not claim to deliver a jaguar corridor."],
              ["REDUCE CONFLICT", "Coexistence work with communities and ranchers can reduce retaliatory killing; implementation is place-specific."],
              ["PROTECT PREY & SPACE", "Secure habitat and viable prey communities are foundations for wild-cat persistence."],
            ].map(([t,n]) => <article key={t} style={{ border: `1px solid ${line}`, padding: "28px", minHeight: 230 }}><div style={{ ...mono, color: earth }}>SOLUTION PATH</div><h3 style={{ margin: "18px 0 0", fontFamily: T.display, fontWeight: 500, fontSize: 31 }}>{t}</h3><p style={{ margin: "16px 0 0", color: dim, lineHeight: 1.55 }}>{n}</p></article>)}
          </div>
          <div style={{ marginTop: 42, display: "flex", gap: 12, flexWrap: "wrap" }}>
            <Link to="/missions/am4zonia" style={{ ...mono, background: earth, color: "#050806", padding: "13px 16px", textDecoration: "none" }}>AM4ZONIA_ →</Link>
            <Link to="/missions/species" style={{ ...mono, border: `1px solid ${ink}`, color: ink, padding: "12px 16px", textDecoration: "none" }}>SPECIES_ →</Link>
            <Link to="/impact" style={{ ...mono, border: `1px solid ${ink}`, color: ink, padding: "12px 16px", textDecoration: "none" }}>IMPACT →</Link>
          </div>
        </section>

        <section style={{ padding: pad, borderTop: `1px solid ${line}` }}>
          <div style={{ ...mono, color: earth }}>SOURCES · RIGHTS · LIMITATIONS</div>
          <div style={{ marginTop: 28, display: "grid", gap: 0 }}>{sources.map(s => <a key={s.href} href={s.href} target="_blank" rel="noreferrer" style={{ color: ink, textDecoration: "none", display: "grid", gridTemplateColumns: "minmax(180px,.8fr) minmax(220px,1.2fr) auto", gap: 18, padding: "18px 0", borderTop: `1px solid ${line}` }}><strong style={{ fontWeight: 500 }}>{s.label}</strong><span style={{ color: dim }}>{s.use}</span><span style={{ ...mono, color: earth }}>OPEN ↗</span></a>)}</div>
          <p style={{ margin: "28px 0 0", maxWidth: 820, color: dim, fontSize: 13.5, lineHeight: 1.65 }}>Prototype truth boundary: this page combines taxonomic identity, source occurrence records, sourced general species context and clearly labelled 4PLANET navigation/interpretation. It does not establish the current location, range, abundance, population trend or health of jaguars, and it does not claim that 4PLANET currently delivers jaguar conservation.</p>
        </section>
      </main>
      <style>{`@media(max-width:820px){.jag-atlas-grid{grid-template-columns:1fr!important}.jag-atlas-grid>div:first-child{min-height:420px!important}}`}</style>
    </PublicShell>
  );
}

export function AmazonRainforestSystem() {
  return (
    <PublicShell>
      <main style={{ background: "#07100A", color: ink }}>
        <section style={{ minHeight: "78svh", padding: pad, display: "flex", flexDirection: "column", justifyContent: "flex-end", borderBottom: `1px solid ${line}`, background: "radial-gradient(circle at 78% 22%,rgba(89,151,80,.20),transparent 36%),#07100A" }}>
          <div style={{ ...mono, color: earth }}>4PLANET ECOSYSTEM_ · FIRST PUBLIC OBJECT</div>
          <h1 style={{ margin: "18px 0 0", fontFamily: T.display, fontWeight: 500, fontSize: "clamp(58px,10vw,150px)", lineHeight: .82, letterSpacing: "-.06em", maxWidth: 1050 }}>Amazon Rainforest</h1>
          <p style={{ margin: "28px 0 0", maxWidth: 760, fontSize: "clamp(19px,2vw,29px)", lineHeight: 1.3 }}>A living system of forest, water, climate, species and people — navigable through the same intelligence spine as Jaguar.</p>
        </section>
        <section style={{ padding: pad }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(250px,1fr))", gap: 28 }}>
            {[
              ["WHAT IT IS", "A vast tropical forest and river system spanning multiple South American countries. This prototype object is a navigational system frame, not a final scientific boundary model."],
              ["LIFE", "Millions of species and ecological relationships occupy forests, floodplains, rivers, wetlands and transition zones."],
              ["HOW IT WORKS", "Water cycling, vegetation, soils, climate, disturbance, food webs and human land use interact across scales."],
              ["WHY IT MATTERS", "The system stores carbon, cycles water, supports extraordinary biodiversity and sustains human lives and cultures."],
              ["CHANGE & PRESSURES", "Deforestation, degradation, fire, extraction, infrastructure and climate pressures vary by place and time and require source-specific evidence."],
              ["SOLUTIONS", "Protection, Indigenous and local stewardship, enforcement, restoration, sustainable production and connectivity can all matter; effectiveness is context-specific."],
            ].map(([k,v]) => <article key={k} style={{ borderTop: `1px solid ${line}`, paddingTop: 18, minHeight: 230 }}><div style={{ ...mono, color: earth }}>{k}</div><p style={{ margin: "18px 0 0", color: dim, fontSize: 16, lineHeight: 1.62 }}>{v}</p></article>)}
          </div>
          <div style={{ marginTop: 54, display: "flex", gap: 12, flexWrap: "wrap" }}><Link to="/species/jaguar" style={{ ...mono, background: earth, color: "#050806", padding: "13px 16px", textDecoration: "none" }}>ENTER THROUGH JAGUAR →</Link><Link to={contextHref("/atlas", "", { entity: "place:4p:amazonia", journey: "amazonia" })} style={{ ...mono, border: `1px solid ${ink}`, color: ink, padding: "12px 16px", textDecoration: "none" }}>OPEN AMAZONIA IN ATLAS →</Link><Link to="/missions/am4zonia" style={{ ...mono, border: `1px solid ${ink}`, color: ink, padding: "12px 16px", textDecoration: "none" }}>AM4ZONIA_ →</Link></div>
          <p style={{ margin: "46px 0 0", maxWidth: 820, color: dim, lineHeight: 1.65 }}>Truth boundary: this is the first reusable ecosystem interface object. It deliberately avoids inventing a single authoritative polygon, current condition score or complete Amazon taxonomy. Those require explicit source and boundary models.</p>
        </section>
      </main>
    </PublicShell>
  );
}
