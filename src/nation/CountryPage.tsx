/**
 * 4NATION Country Object — one reusable renderer for every country.
 * PROFILE mode: readout + chapters. ATLAS mode: the shared 4PLANET ATLAS.
 * Every figure carries value, unit, year and source; unknown is never zero.
 */
import { useEffect, useMemo, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { atlasEmbedHref, atlasFullDestination, atlasHrefForView, type AtlasView } from "@/earth/atlasViewContract";
import { nationCaseAsOf, nationDecision } from "@/planet/nationDecisionCase";
import type { CountryDevelopmentContext } from "@/data/unescoCountryContext";
import type { UnescoAtlasRecord } from "@/data/unescoOpenData";
import { Globe } from "./Globe";
import { FEATURED, GEO_SOURCE, atlasCamera, countryBySlug, loadCountryRings, mainBbox, silhouettePath, typeLabel, type NationCountry, type Ring } from "./geo";
import { M, SOURCE_LINES, compact, fmt, latestOf, num, seriesOf, useCountryContext, useCountrySites, type CountrySites, type Load } from "./data";
import { AgeBar, LineChart, Readout, useSourceDrawer, type SourceRef } from "./ui";
import { CountrySearch, nationBase, useMyCountry } from "./NationApp";
import { NationFooter } from "./NationFooter";

const GEO: SourceRef = { label: "Natural Earth", licence: GEO_SOURCE.licence, url: GEO_SOURCE.url, limitation: GEO_SOURCE.limitation };
const sig3 = (n: number) => { const p = Math.pow(10, Math.max(0, Math.floor(Math.log10(n)) - 2)); return Math.round(n / p) * p; };
const coord = ([lon, lat]: [number, number]) => `${Math.abs(lat).toFixed(2)}° ${lat >= 0 ? "N" : "S"} · ${Math.abs(lon).toFixed(2)}° ${lon >= 0 ? "E" : "W"}`;

type Ctx = CountryDevelopmentContext | null | undefined;

function useMeta(c: NationCountry | undefined, sentence: string) {
  useEffect(() => {
    if (!c) return;
    document.title = `${c.short} — country profile · 4NATION`;
    const set = (sel: string, attr: string, val: string, make: () => HTMLElement) => {
      let el = document.head.querySelector(sel) as HTMLElement | null;
      if (!el) { el = make(); document.head.appendChild(el); }
      el.setAttribute(attr, val);
    };
    set('meta[name="description"]', "content", sentence, () => Object.assign(document.createElement("meta"), { name: "description" }));
    const indexable = (FEATURED as readonly string[]).includes(c.iso2);
    set('meta[name="robots"]', "content", indexable ? "index,follow,max-image-preview:large" : "noindex,follow", () => Object.assign(document.createElement("meta"), { name: "robots" }));
  }, [c?.iso2, sentence]);
}

function identitySentence(c: NationCountry, ctx: Ctx) {
  const pop = latestOf(ctx, M.pop), p = num(pop);
  const where = c.subregion && c.subregion !== c.continent ? c.subregion : c.continent;
  let s = `${c.short} is a ${typeLabel(c)} in ${where}`;
  if (p !== null) { const k = compact(p); s += ` with ${k.value} ${k.unit} people (${pop!.period})`; }
  s += ".";
  if (c.capital) s += ` Its capital is ${c.capital}.`;
  return s;
}

/* ── chapter frame ─────────────────────────────────────────────────────── */
function Chapter({ id, n, title, lead, children }: { id: string; n: string; title: string; lead?: string; children: React.ReactNode }) {
  return (
    <section id={id} className="n-chapter" aria-labelledby={id + "-h"}>
      <header className="n-chapter__head">
        <span className="n-mono">{n}</span>
        <h2 id={id + "-h"}>{title}</h2>
        {lead && <p>{lead}</p>}
      </header>
      <div className="n-chapter__body">{children}</div>
    </section>
  );
}

/* ── metric with optional trend ────────────────────────────────────────── */
function Metric({ ctx, load, id, label, format, unitOverride, chart }: {
  ctx: Ctx; load: Load<unknown>; id: string; label: string; format: (n: number) => { value: string; unit?: string }; unitOverride?: string; chart?: boolean;
}) {
  const open = useSourceDrawer();
  const m = latestOf(ctx, id), v = num(m), series = seriesOf(ctx, id);
  const f = v !== null ? format(v) : null;
  const plain = (n: number) => { const x = format(n); return x.value + (x.unit ? " " + x.unit : ""); };
  return (
    <div className={"n-metric" + (chart ? " n-metric--chart" : "")}>
      <Readout label={label} loading={load.status === "loading"} unavailable={load.status === "error"}
        value={f ? f.value : null} unit={unitOverride ?? f?.unit} period={m?.period} source={SOURCE_LINES.wdi}
        onSource={() => open({ title: label, source: SOURCE_LINES.wdi, period: m?.period, retrievedAt: m?.vintage.retrievedAt, series, format: plain })} />
      {chart && series && series.observations.length > 2 && <LineChart series={series} format={plain} label={label} />}
    </div>
  );
}

/* ── atlas mode ────────────────────────────────────────────────────────── */
const ATLAS_GROUPS: { title: string; layers: { id: string; label: string; note: string }[] }[] = [
  { title: "Earth", layers: [
    { id: "truecolor", label: "Satellite day", note: "Recent NASA true-colour imagery; clouds and gaps are real." },
    { id: "night", label: "Lights at night", note: "Night-time light — a proxy for settlement, not population." },
    { id: "forest", label: "Forest", note: "Modelled tree cover; not forest health or ownership." },
  ] },
  { title: "Recognised places", layers: [
    { id: "unesco-world-heritage", label: "World Heritage", note: "Designations — not a measure of present condition." },
    { id: "unesco-biospheres", label: "Biosphere reserves", note: "Representative points, not reserve boundaries." },
    { id: "unesco-geoparks", label: "Global Geoparks", note: "Representative points, not geopark boundaries." },
  ] },
  { title: "Ocean", layers: [
    { id: "unesco-ocean-biodiversity", label: "Ocean biodiversity", note: "Occurrence records reflect sampling effort, not abundance." },
    { id: "sst", label: "Sea temperature", note: "Satellite sea-surface temperature; surface only." },
  ] },
];

function AtlasMode({ c, rings, layers, setLayers }: { c: NationCountry; rings: Ring[] | null; layers: string[]; setLayers: (l: string[]) => void }) {
  const [panel, setPanel] = useState(() => typeof window === "undefined" || window.matchMedia("(min-width: 761px)").matches);
  const view: AtlasView = {
    kind: "NATION", title: c.short + " — country context", camera: atlasCamera(c, rings ?? undefined),
    layers: ["bluemarble", ...layers],
    limitation: "Navigation view over the shared 4PLANET ATLAS. Not an official boundary, jurisdiction or ecological extent.",
  };
  const src = atlasEmbedHref(view);
  const full = atlasHrefForView(view);
  const toggle = (id: string) => setLayers(layers.includes(id) ? layers.filter((x) => x !== id) : [...layers, id]);
  return (
    <section className="n-atlas" aria-label={c.short + " in Atlas mode"}>
      {src ? <iframe key={src} className="n-atlas__frame" src={src} title={"ATLAS: " + c.short} loading="eager" referrerPolicy="no-referrer" allowFullScreen />
        : <p role="status" className="n-atlas__empty">No mapped context is available.</p>}
      <aside className={"n-atlas__panel" + (panel ? " is-open" : "")}>
        <button className="n-atlas__toggle" aria-expanded={panel} onClick={() => setPanel((p) => !p)}>
          <span className="n-mono">LAYERS · {layers.length}</span><span aria-hidden>{panel ? "–" : "+"}</span>
        </button>
        {panel && (
          <div className="n-atlas__groups">
            {ATLAS_GROUPS.map((g) => (
              <fieldset key={g.title}>
                <legend className="n-mono">{g.title.toUpperCase()}</legend>
                {g.layers.map((l) => (
                  <label key={l.id} className="n-switch">
                    <input type="checkbox" checked={layers.includes(l.id)} onChange={() => toggle(l.id)} />
                    <span className="n-switch__ui" aria-hidden /><span className="n-switch__text"><b>{l.label}</b>{layers.includes(l.id) && <small>{l.note}</small>}</span>
                  </label>
                ))}
              </fieldset>
            ))}
            <p className="n-fine">The same engine as the full 4PLANET ATLAS. Layers load only when switched on.</p>
            {full && <a className="n-link" href={atlasFullDestination(full, window.location.hostname)}>Open in full ATLAS ↗</a>}
          </div>
        )}
      </aside>
    </section>
  );
}

/* ── nature lists ──────────────────────────────────────────────────────── */
function SiteList({ title, set, sites, src, empty }: { title: string; set: keyof CountrySites; sites: Load<CountrySites>; src: SourceRef; empty: string }) {
  const open = useSourceDrawer();
  const [all, setAll] = useState(false);
  if (sites.status === "loading") return <div className="n-sites"><h3>{title}</h3><span className="n-skeleton n-skeleton--line" /></div>;
  const entry = sites.status === "ready" ? sites.data[set] : { error: "UNAVAILABLE" };
  if ("error" in entry) return <div className="n-sites"><h3>{title}</h3><p className="n-unknown">Source unavailable right now.</p></div>;
  const recs = [...entry.records].sort((a, b) => String(a.date ?? "").localeCompare(String(b.date ?? "")));
  const shown = all ? recs : recs.slice(0, 6);
  return (
    <div className="n-sites">
      <h3>{title}<span className="n-sites__count">{recs.length}</span></h3>
      {recs.length === 0 ? <p className="n-unknown">{empty}</p> : (
        <ul>
          {shown.map((r: UnescoAtlasRecord) => (
            <li key={r.id}>
              <span className="n-sites__title">{r.title}</span>
              <span className="n-mono">{[r.category, r.date?.slice(0, 4)].filter(Boolean).join(" · ").toUpperCase()}</span>
              {r.metrics?.species !== undefined && (
                <span className="n-sites__metrics">{fmt.int(r.metrics.species)} species recorded · {fmt.int(r.metrics.observations ?? 0)} records{r.metrics.firstYear ? ` · ${r.metrics.firstYear}–${r.metrics.lastYear}` : ""}</span>
              )}
            </li>
          ))}
        </ul>
      )}
      {recs.length > 6 && <button className="n-link" onClick={() => setAll((x) => !x)}>{all ? "Show fewer" : `Show all ${recs.length}`}</button>}
      <button className="n-source" onClick={() => open({ title, source: src, retrievedAt: entry.retrievedAt })}><span>{src.label}</span><i aria-hidden>↗</i></button>
    </div>
  );
}

/* ── page ──────────────────────────────────────────────────────────────── */
const CHAPTERS = [
  ["land", "Land"], ["people", "People"], ["economy", "Economy & work"], ["learning", "Learning"],
  ["nature", "Nature & heritage"], ["capital", "Capital"], ["decisions", "Decisions"], ["sources", "Sources"],
] as const;

export default function CountryPage({ theme }: { theme: string }) {
  const { slug = "" } = useParams();
  const c = countryBySlug(slug);
  if (!c) return <NotFound slug={slug} />;
  return <Country key={c.iso2} c={c} theme={theme} />;
}

function NotFound({ slug }: { slug: string }) {
  return (
    <main className="n-notfound">
      <p className="n-mono">NO COUNTRY MATCHES “{slug.toUpperCase()}”</p>
      <h1 className="n-display">Try another name.</h1>
      <CountrySearch size="l" autoFocus />
    </main>
  );
}

function Country({ c, theme }: { c: NationCountry; theme: string }) {
  const open = useSourceDrawer();
  const [params, setParams] = useSearchParams();
  const mode = params.get("mode") === "atlas" ? "atlas" : "profile";
  const layers = (params.get("l") || "").split(",").filter((x) => /^[a-z0-9-]+$/.test(x));
  const setMode = (m: "profile" | "atlas") => { const p = new URLSearchParams(params); m === "atlas" ? p.set("mode", "atlas") : (p.delete("mode"), p.delete("l")); setParams(p, { replace: false }); window.scrollTo({ top: 0 }); };
  const openAtlas = (l: string[]) => { const p = new URLSearchParams(params); p.set("mode", "atlas"); l.length ? p.set("l", l.join(",")) : p.delete("l"); setParams(p); window.scrollTo({ top: 0 }); };
  const setLayers = (l: string[]) => { const p = new URLSearchParams(params); l.length ? p.set("l", l.join(",")) : p.delete("l"); setParams(p, { replace: true }); };

  const wdi = useCountryContext(c.iso2);
  const ctx = wdi.status === "ready" ? wdi.data : undefined;
  const sites = useCountrySites(c.iso2, c.short);
  const [rings, setRings] = useState<Ring[] | null>(null);
  useEffect(() => { let a = true; loadCountryRings(c.iso2).then((r) => a && setRings(r)).catch(() => undefined); return () => { a = false; }; }, [c.iso2]);
  const [my, setMy] = useMyCountry();
  const [toast, setToast] = useState<string | null>(null);
  const sentence = identitySentence(c, ctx);
  useMeta(c, sentence);

  const sil = useMemo(() => (rings ? silhouettePath(rings, 320, 8) : null), [rings]);
  const span = rings ? mainBbox(rings) : c.bbox;
  const nsKm = Math.round(((span[3] - span[1]) * 111.2) / 10) * 10;
  const whc = sites.status === "ready" ? sites.data.whc001 : null;
  const whcCount = whc && !("error" in whc) ? whc.records.length : null;
  const pop = latestOf(ctx, M.pop), gdppc = latestOf(ctx, M.gdppc), life = latestOf(ctx, M.life);
  const a014 = num(latestOf(ctx, M.pop014)), a1564 = num(latestOf(ctx, M.pop1564)), a65 = num(latestOf(ctx, M.pop65));
  const ageYear = latestOf(ctx, M.pop65)?.period;
  const hasDecision = c.iso2 === "NO";

  const share = async (hash = "") => {
    const url = window.location.origin + window.location.pathname + (mode === "atlas" ? window.location.search : "") + hash;
    try {
      if (navigator.share) { await navigator.share({ title: `${c.short} · 4NATION`, text: sentence, url }); return; }
      await navigator.clipboard.writeText(url); setToast("Link copied");
    } catch { /* dismissed */ }
    window.setTimeout(() => setToast(null), 1800);
  };

  const wdiOpen = (title: string, m = pop, id: string = M.pop) => () => open({ title, source: SOURCE_LINES.wdi, period: m?.period, retrievedAt: m?.vintage.retrievedAt, series: seriesOf(ctx, id) });
  const loading = wdi.status === "loading", failed = wdi.status === "error";
  const usd = (n: number) => ({ value: "US$" + fmt.int(n) });

  return (
    <main className={"n-country n-country--" + mode}>
      <section className="n-hero" aria-labelledby="n-country-name">
        <div className="n-hero__copy">
          <p className="n-kicker n-mono">{c.iso2} · {c.iso3} · {c.continent.toUpperCase()}{c.subregion !== c.continent ? " / " + c.subregion.toUpperCase() : ""}</p>
          <h1 id="n-country-name" className="n-display n-display--country">{c.short}</h1>
          <p className="n-lead">{sentence}</p>
          <div className="n-actions">
            <div className="n-seg" role="tablist" aria-label="View">
              <button role="tab" aria-selected={mode === "profile"} onClick={() => setMode("profile")}>Profile</button>
              <button role="tab" aria-selected={mode === "atlas"} onClick={() => setMode("atlas")}>Atlas</button>
            </div>
            <button className="n-btn" aria-pressed={my?.iso2 === c.iso2} onClick={() => setMy(my?.iso2 === c.iso2 ? null : c.iso2)}>
              {my?.iso2 === c.iso2 ? "✓ My country" : "Set as my country"}
            </button>
            <button className="n-btn n-btn--ghost n-btn--icon" onClick={() => share()} aria-label={"Share " + c.short}>
              <svg viewBox="0 0 16 16" aria-hidden><path d="M8 10V2M5 5l3-3 3 3M3 8v5h10V8" /></svg><span>Share</span>
            </button>
          </div>
          {my?.iso2 === c.iso2 && <p className="n-fine">Saved on this device. Account sync with 4PLANET ID is the next step.</p>}
        </div>

        <div className="n-hero__globe">
          <Globe focus={{ iso2: c.iso2, capital: c.capitalLonLat, capitalName: c.capital }} theme={theme} label={`Globe centred on ${c.short}${c.capital ? ", capital " + c.capital + " marked" : ""}`} />
          <div className="n-globe-hud n-mono">
            <span>{c.capitalLonLat ? (c.capital ?? "").toUpperCase() + " · " + coord(c.capitalLonLat) : c.short.toUpperCase()}</span>
            <span>ORTHOGRAPHIC · NATURAL EARTH 1:50M</span>
          </div>
        </div>

        <div className="n-readouts" aria-label="Key facts">
          <Readout size="l" label="Population" loading={loading} unavailable={failed}
            value={num(pop) !== null ? compact(num(pop)!).value : null} unit={num(pop) !== null ? compact(num(pop)!).unit : undefined}
            period={pop?.period} source={SOURCE_LINES.wdi} onSource={wdiOpen("Population")} />
          <Readout size="l" label="Capital" value={c.capital} hint={c.capitalLonLat ? coord(c.capitalLonLat) : undefined} source={GEO}
            onSource={() => open({ title: "Capital", source: GEO, note: "Admin-0 capital as recorded by Natural Earth populated places." })} />
          <Readout size="l" label="GDP per person" loading={loading} unavailable={failed} value={num(gdppc) !== null ? "US$" + fmt.int(num(gdppc)!) : null}
            period={gdppc?.period} source={SOURCE_LINES.wdi} onSource={wdiOpen("GDP per person", gdppc, M.gdppc)} hint="Current US dollars" />
          <Readout size="l" label="Life expectancy" loading={loading} unavailable={failed} value={num(life) !== null ? fmt.d1(num(life)!) : null} unit="years"
            period={life?.period} source={SOURCE_LINES.wdi} onSource={wdiOpen("Life expectancy at birth", life, M.life)} />
          <Readout size="l" label="Area" value={"≈ " + fmt.int(sig3(c.areaKm2Approx))} unit="km²" hint="Computed from generalised outline" source={GEO}
            onSource={() => open({ title: "Area (approximate)", source: GEO, note: "Spherical area of Natural Earth 1:50m outer rings. Official national figures differ; use this for orientation only." })} />
          <Readout size="l" label="World Heritage" loading={sites.status === "loading"} unavailable={whc !== null && "error" in whc}
            value={whcCount !== null ? String(whcCount) : null} unit={whcCount === 1 ? "site" : "sites"} source={SOURCE_LINES.whc001}
            onSource={() => open({ title: "World Heritage sites", source: SOURCE_LINES.whc001, retrievedAt: whc && !("error" in whc) ? whc.retrievedAt : undefined })} />
        </div>
      </section>

      {mode === "atlas" ? <AtlasMode c={c} rings={rings} layers={layers} setLayers={setLayers} /> : (
        <>
          <nav className="n-chapters" aria-label="Chapters">
            {CHAPTERS.filter(([id]) => id !== "decisions" || hasDecision).map(([id, label]) => <a key={id} href={"#" + id}>{label}</a>)}
          </nav>

          <Chapter id="land" n="01" title="Land" lead={`${c.short} covers roughly ${fmt.int(sig3(c.areaKm2Approx))} km² and stretches about ${fmt.int(nsKm)} km from south to north.`}>
            <div className="n-land">
              {sil && <svg className="n-land__glyph" viewBox={`0 0 ${sil.w} ${sil.h}`} role="img" aria-label={`Outline of ${c.short}`}><path d={sil.d} /></svg>}
              <dl className="n-facts">
                <div><dt>Continent</dt><dd>{c.continent}</dd></div>
                <div><dt>Region</dt><dd>{c.subregion}</dd></div>
                <div><dt>Latitude</dt><dd>{span[1].toFixed(1)}° to {span[3].toFixed(1)}°</dd></div>
                <div><dt>Longitude</dt><dd>{span[0].toFixed(1)}° to {span[2].toFixed(1)}°</dd></div>
                <div><dt>North–south</dt><dd>≈ {fmt.int(nsKm)} km</dd></div>
              </dl>
              <div className="n-cta">
                <p>See the land itself — satellite imagery, forest and lights at night on the shared ATLAS.</p>
                <button className="n-btn" onClick={() => openAtlas(["truecolor"])}>Open the land in Atlas</button>
              </div>
            </div>
            <p className="n-fine">Extent of the main landmass, from {GEO_SOURCE.name} outlines. Outlying islands are not included in the latitude span.</p>
          </Chapter>

          <Chapter id="people" n="02" title="People" lead="How many people live here, how long they live and how the population is changing.">
            <div className="n-grid">
              <Metric ctx={ctx} load={wdi} id={M.pop} label="Population" chart format={(n) => compact(n)} />
              <Metric ctx={ctx} load={wdi} id={M.life} label="Life expectancy at birth" chart format={(n) => ({ value: fmt.d1(n), unit: "years" })} />
              <div className="n-metric">
                <span className="n-readout__label">Age structure{ageYear ? " · " + ageYear : ""}</span>
                {loading ? <span className="n-skeleton n-skeleton--line" /> : a014 !== null && a1564 !== null && a65 !== null
                  ? <AgeBar parts={[{ label: "Under 15", value: a014 }, { label: "15–64", value: a1564 }, { label: "65 and over", value: a65 }]} />
                  : <p className="n-unknown">{failed ? "Source unavailable right now." : "Not reported in this source."}</p>}
              </div>
              <Metric ctx={ctx} load={wdi} id={M.female} label="Women in the population" format={(n) => ({ value: fmt.d1(n), unit: "%" })} />
            </div>
          </Chapter>

          <Chapter id="economy" n="03" title="Economy & work" lead="The size of the economy, output per person and how people take part in work.">
            <div className="n-grid">
              <Metric ctx={ctx} load={wdi} id={M.gdppc} label="GDP per person" chart format={usd} />
              <Metric ctx={ctx} load={wdi} id={M.gdp} label="GDP" format={(n) => { const k = compact(n); return { value: "US$" + k.value, unit: k.unit }; }} />
              <Metric ctx={ctx} load={wdi} id={M.growth} label="Real GDP growth" format={(n) => ({ value: (n > 0 ? "+" : "") + fmt.d1(n), unit: "%" })} />
              <Metric ctx={ctx} load={wdi} id={M.unemp} label="Unemployment" chart format={(n) => ({ value: fmt.d1(n), unit: "% of labour force" })} />
              <Metric ctx={ctx} load={wdi} id={M.lfpF} label="Women in the labour force" format={(n) => ({ value: fmt.d1(n), unit: "% participation" })} />
              <Metric ctx={ctx} load={wdi} id={M.lfpM} label="Men in the labour force" format={(n) => ({ value: fmt.d1(n), unit: "% participation" })} />
            </div>
            <p className="n-fine">GDP in current US dollars is not adjusted for prices or purchasing power. A national average says nothing about how income is shared.</p>
          </Chapter>

          <Chapter id="learning" n="04" title="Learning" lead="School and university enrolment. Gross ratios can exceed 100% when older or younger students enrol.">
            <div className="n-grid">
              <Metric ctx={ctx} load={wdi} id={M.prim} label="Primary enrolment" format={(n) => ({ value: fmt.d1(n), unit: "% gross" })} />
              <Metric ctx={ctx} load={wdi} id={M.sec} label="Secondary enrolment" format={(n) => ({ value: fmt.d1(n), unit: "% gross" })} />
              <Metric ctx={ctx} load={wdi} id={M.ter} label="Tertiary enrolment" chart format={(n) => ({ value: fmt.d1(n), unit: "% gross" })} />
              <Metric ctx={ctx} load={wdi} id={M.lit} label="Adult literacy" format={(n) => ({ value: fmt.d1(n), unit: "%" })} />
            </div>
          </Chapter>

          <Chapter id="nature" n="05" title="Nature & heritage" lead="What the world has formally recognised here — and what has been recorded in its waters. A designation is not proof of present condition.">
            <div className="n-sites-grid">
              <SiteList title="World Heritage" set="whc001" sites={sites} src={SOURCE_LINES.whc001} empty="No World Heritage inscription listed for this country in this source." />
              <SiteList title="Biosphere reserves" set="mab001" sites={sites} src={SOURCE_LINES.mab001} empty="No biosphere reserve listed for this country in this source." />
              <SiteList title="Global Geoparks" set="eg0001" sites={sites} src={SOURCE_LINES.eg0001} empty="No Global Geopark listed for this country in this source." />
              <SiteList title="Marine life recorded" set="ioc001" sites={sites} src={SOURCE_LINES.ioc001} empty="No ocean biodiversity area summary listed for this country in this source." />
            </div>
            <div className="n-cta n-cta--wide">
              <p>Place every site on the map, together with ocean biodiversity areas.</p>
              <button className="n-btn" onClick={() => openAtlas(["unesco-world-heritage", "unesco-biospheres", "unesco-geoparks", "unesco-ocean-biodiversity"])}>Show on the Atlas</button>
            </div>
            <p className="n-fine">Ocean figures count occurrence records and sampling effort. They do not measure abundance, complete species richness or ecosystem health.</p>
          </Chapter>

          <Chapter id="capital" n="06" title={c.capital ? c.capital : "Capital"} lead={c.capital ? `${c.capital} is the capital of ${c.short}. Place context in 4NATION starts here and grows outward to other places.` : "No capital is recorded for this territory in the outline source."}>
            {c.capitalLonLat && (() => {
              const view: AtlasView = { kind: "NATION", title: (c.capital ?? "") + " — capital", camera: { lng: c.capitalLonLat[0], lat: c.capitalLonLat[1], zoom: 7.5 }, layers: ["bluemarble"], limitation: "Navigation view centred on the capital point. Not a municipal or metropolitan boundary." };
              const embed = atlasEmbedHref(view), full = atlasHrefForView(view);
              return (
                <div className="n-capital">
                  <dl className="n-facts">
                    <div><dt>Coordinates</dt><dd>{coord(c.capitalLonLat)}</dd></div>
                    <div><dt>Status</dt><dd>National capital</dd></div>
                  </dl>
                  {embed && <div className="n-capital__map"><iframe src={embed} title={"ATLAS: " + c.capital} loading="lazy" referrerPolicy="no-referrer" /></div>}
                  {full && <a className="n-link" href={atlasFullDestination(full, window.location.hostname)}>Open {c.capital} in full ATLAS ↗</a>}
                  {c.iso2 === "NO" && <p className="n-deeper">A deeper place, further down: <Link to={`${nationBase()}/decisions`}>the Oslofjord</Link> — the first 4NATION decision case.</p>}
                </div>
              );
            })()}
          </Chapter>

          {hasDecision && (
            <Chapter id="decisions" n="07" title="Decisions" lead="Important public choices, read from the original documents. A proposal is not a decision; a decision is not an outcome.">
              <article className="n-decision">
                <span className="n-state n-mono">{nationDecision.status}</span>
                <h3>{nationDecision.title} <small>{nationDecision.period}</small></h3>
                <p>{nationDecision.synopsis}</p>
                <dl className="n-facts">
                  <div><dt>Issued by</dt><dd>{nationDecision.issuer}</dd></div>
                  <div><dt>Jurisdiction</dt><dd>{nationDecision.jurisdiction}</dd></div>
                  <div><dt>As of</dt><dd>{nationCaseAsOf}</dd></div>
                </dl>
                <Link className="n-btn" to={`${nationBase()}/decisions`}>Read the case</Link>
              </article>
              <p className="n-fine">Decision coverage is expanding country by country. Countries without a source-backed case show no decisions chapter.</p>
            </Chapter>
          )}

          <Chapter id="sources" n={hasDecision ? "08" : "07"} title="Sources & method" lead="How this profile is made. Every figure links to its original dataset.">
            <ul className="n-srclist">
              {([SOURCE_LINES.wdi, SOURCE_LINES.whc001, SOURCE_LINES.mab001, SOURCE_LINES.eg0001, SOURCE_LINES.ioc001, GEO] as SourceRef[]).map((s) => (
                <li key={s.label}><a href={s.url} target="_blank" rel="noreferrer">{s.long ?? s.label} ↗</a><span className="n-mono">{s.licence.toUpperCase()}</span><p>{s.limitation}</p></li>
              ))}
            </ul>
            <ul className="n-method">
              <li>Each value shows its own year. Indicators update at different times, so years can differ within one profile.</li>
              <li>“Not reported” means the source holds no value. It never means zero.</li>
              <li>Country averages do not describe every place or group within the country.</li>
              <li>Third-party data remains the property of its publishers and is shown under their licences.</li>
            </ul>
            <button className="n-btn n-btn--ghost" onClick={() => share()}>Share this profile</button>
          </Chapter>
          <NationFooter />
        </>
      )}
      {toast && <div className="n-toast" role="status">{toast}</div>}
    </main>
  );
}
