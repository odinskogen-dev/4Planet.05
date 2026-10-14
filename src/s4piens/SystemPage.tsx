/**
 * S4PIENS system view — one renderer for every human system.
 * HUMAN → chain stations (one question each) → PLACE (shared ATLAS) → IN A COUNTRY
 * (Climate TRACE via existing proxy, link to 4NATION) → LIVING SYSTEMS → PROBLEMS → SOLUTIONS.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { atlasEmbedHref, atlasFullDestination, atlasHrefForView, type AtlasView } from "@/earth/atlasViewContract";
import { pressureById, solutionById, systemById } from "@/planet/livingSystems";
import type { Solution } from "@/planet/types";
import { atlasCamera, countryByIso, searchCountries, type NationCountry } from "@/nation/geo";
import { compact, fmt } from "@/nation/data";
import { useMyCountry } from "@/nation/NationApp";
import { useSourceDrawer, type SourceRef } from "@/nation/ui";
import { SYSTEMS, systemBySlug, type HumanSystem } from "./systems";
import { HumanFigure } from "./S4Home";
import { OBJECTS } from "./objects";
import { ObjectGlyph, objectHref } from "./ObjectPage";
import { S4Footer, nationOrigin, systemHref } from "./S4App";

const TRACE: SourceRef = {
  label: "Climate TRACE", long: "Climate TRACE — emissions sources (v7 API, via 4PLANET proxy)", licence: "CC BY 4.0",
  url: "https://climatetrace.org/data",
  limitation: "Facility and source emissions are estimates from satellites, sensors and models. They are not live readings and can differ from company or national reports.",
};
const CONTEXT_NOTE = "4PLANET CONTEXT — an explanation of how the system works, not a measured claim.";

/* ── Climate TRACE: largest sources in one country, bounded ─────────────── */
type TraceRow = { id: string; name: string; subsector: string | null; co2e: number | null; year: string | number | null };
type TraceLoad = { status: "idle" | "loading" } | { status: "ready"; rows: TraceRow[]; retrievedAt: string } | { status: "error" };
const traceCache = new Map<string, Promise<{ rows: TraceRow[]; retrievedAt: string }>>();
function useTrace(iso3: string | null, sectors: string | null): TraceLoad {
  const [s, set] = useState<TraceLoad>({ status: "idle" });
  useEffect(() => {
    if (!iso3 || !sectors) { set({ status: "idle" }); return; }
    let alive = true;
    set({ status: "loading" });
    const key = iso3 + "|" + sectors;
    if (!traceCache.has(key)) {
      traceCache.set(key, fetch(`/api/climate-trace?sectors=${encodeURIComponent(sectors)}&countries=${iso3}&limit=500`)
        .then((r) => r.json())
        .then((d) => {
          if (!d || d.ok !== true || !Array.isArray(d.assets)) throw new Error("TRACE_UNAVAILABLE");
          const rows = (d.assets as TraceRow[]).filter((a) => a && (a.co2e === null || Number.isFinite(a.co2e)))
            .sort((a, b) => (b.co2e ?? -1) - (a.co2e ?? -1)).slice(0, 8);
          return { rows, retrievedAt: new Date().toISOString() };
        })
        .catch((e) => { traceCache.delete(key); throw e; }));
    }
    traceCache.get(key)!.then((v) => alive && set({ status: "ready", ...v }), () => alive && set({ status: "error" }));
    return () => { alive = false; };
  }, [iso3, sectors]);
  return s;
}

/* ── small parts ───────────────────────────────────────────────────────── */
const MATURITY: Solution["maturity"][] = ["IDEA", "PILOT", "DEPLOYED", "SCALED"];
const EVIDENCE: Solution["evidenceStrength"][] = ["INSUFFICIENT", "EMERGING", "MODERATE", "STRONG"];
const title = (s: string) => s.charAt(0) + s.slice(1).toLowerCase();
function Scale({ label, steps, value }: { label: string; steps: string[]; value: string }) {
  const i = steps.indexOf(value);
  return (
    <div className="s-scale" role="img" aria-label={`${label}: ${title(value)} (${i + 1} of ${steps.length})`}>
      <span className="s-scale__label">{label}</span>
      <span className="s-scale__pips">{steps.map((st, k) => <i key={st} className={k <= i ? "is-on" : ""} />)}</span>
      <b>{title(value)}</b>
    </div>
  );
}

function CountryPicker({ country, setCountry }: { country: NationCountry | null; setCountry: (c: NationCountry | null) => void }) {
  const [q, setQ] = useState("");
  const results = useMemo(() => searchCountries(q, 6), [q]);
  return (
    <div className="s-picker">
      <div className="n-search">
        <svg viewBox="0 0 16 16" aria-hidden className="n-search__icon"><circle cx="7" cy="7" r="5" /><path d="M11 11l3.5 3.5" /></svg>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={country ? "Change country" : "Choose a country"} aria-label="Choose a country"
          onKeyDown={(e) => { if (e.key === "Enter" && results[0]) { setCountry(results[0]); setQ(""); } }} />
        {results.length > 0 && (
          <ul className="n-search__list" role="listbox">
            {results.map((c) => <li key={c.iso2} role="option" aria-selected={false}><button onClick={() => { setCountry(c); setQ(""); }}><span>{c.name}</span><span className="n-mono">{c.iso3}</span></button></li>)}
          </ul>
        )}
      </div>
      {!country && (
        <div className="s-picker__quick">
          {["NO", "BR", "CN", "US", "IN", "DE"].map((i) => { const c = countryByIso(i); return c ? <button key={i} className="s-chip" onClick={() => setCountry(c)}>{c.short}</button> : null; })}
        </div>
      )}
    </div>
  );
}

/* ── page ──────────────────────────────────────────────────────────────── */
export default function SystemPage({ theme }: { theme: string }) {
  const { slug = "" } = useParams();
  const sys = systemBySlug(slug);
  if (!sys) {
    return (
      <main className="n-notfound">
        <p className="n-mono">THIS SYSTEM IS NOT MAPPED YET</p>
        <h1 className="n-display">Start with food or energy.</h1>
        <div className="n-actions">{SYSTEMS.map((s) => <Link key={s.slug} className="n-btn" to={systemHref(s.slug)}>{s.name}</Link>)}</div>
      </main>
    );
  }
  return <System key={sys.slug} sys={sys} theme={theme} />;
}

function System({ sys }: { sys: HumanSystem; theme: string }) {
  const open = useSourceDrawer();
  const [params, setParams] = useSearchParams();
  const stepId = params.get("step") ?? sys.stations[0].id;
  const idx = Math.max(0, sys.stations.findIndex((s) => s.id === stepId));
  const st = sys.stations[idx];
  const go = (i: number) => { const p = new URLSearchParams(params); p.set("step", sys.stations[(i + sys.stations.length) % sys.stations.length].id); setParams(p, { replace: true }); };
  const [my] = useMyCountry();
  const [country, setCountryState] = useState<NationCountry | null>(() => countryByIso(params.get("c") || "") ?? my ?? null);
  const setCountry = (c: NationCountry | null) => { setCountryState(c); const p = new URLSearchParams(params); c ? p.set("c", c.iso2) : p.delete("c"); setParams(p, { replace: true }); };
  const [sector, setSector] = useState(0);
  const trace = useTrace(country?.iso3 ?? null, sys.traceSectors?.[sector]?.sectors ?? null);
  const placeRef = useRef<HTMLElement>(null);
  const [layers, setLayers] = useState<string[]>(st.atlas?.layers ?? []);
  useEffect(() => { if (st.atlas) setLayers(st.atlas.layers); }, [st.id]);
  const railRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const rail = railRef.current, el = rail?.querySelector<HTMLElement>('[aria-selected="true"]');
    if (rail && el) rail.scrollTo({ left: el.offsetLeft - rail.clientWidth / 2 + el.clientWidth / 2, behavior: "smooth" });
  }, [st.id]);

  useEffect(() => {
    document.title = `${sys.name} — how the system works · S4PIENS`;
    document.querySelector('meta[name="description"]')?.setAttribute("content", `${sys.thesis} Follow ${sys.name.toLowerCase()} from need to end of life, to the places, living systems, problems and solutions it connects to.`);
  }, [sys.slug]);

  const view: AtlasView = {
    kind: "S4PIENS", title: `${sys.name}${country ? " · " + country.short : ""}`,
    camera: country ? atlasCamera(country) : { lng: 15, lat: 25, zoom: 1.3 },
    layers: ["bluemarble", ...layers],
    limitation: "Shared 4PLANET ATLAS. Co-location on the map is not evidence of cause.",
  };
  const embed = atlasEmbedHref(view), full = atlasHrefForView(view);

  const solutions = sys.solutionIds.map((id) => solutionById(id)).filter((s): s is Solution => Boolean(s));
  const living = sys.livingSystemIds.map((id) => systemById(id)).filter(Boolean);
  const stProblems = sys.problems.filter((p) => p.stations.includes(st.id));

  return (
    <main className="s-system">
      <section className="s-sys-hero">
        <div className="s-sys-hero__copy">
          <p className="n-kicker n-mono">S4PIENS · {sys.status === "GOLD" ? "MAPPED IN DEPTH" : "MAPPED"}{sys.mission ? " · " + sys.mission : ""}</p>
          <h1 className="n-display s-sys-title">{sys.name}</h1>
          <p className="n-lead">{sys.thesis}</p>
          <p className="s-need"><span className="n-mono">HUMAN NEED</span>{sys.need}</p>
        </div>
        <div className="s-sys-hero__figure" aria-hidden>
          <HumanFigure className="s-human s-human--small" />
          <ol className="s-hero-chain">
            {sys.stations.map((s, i) => <li key={s.id} className={i === idx ? "is-on" : ""}>{s.label}</li>)}
          </ol>
        </div>
      </section>

      {/* ── the chain ───────────────────────────────────────────────── */}
      <section className="s-chain" aria-label={`${sys.name} value chain`}>
        <div ref={railRef} className="s-rail" role="tablist" aria-label="Steps in the chain"
          onKeyDown={(e) => { if (e.key === "ArrowRight") { e.preventDefault(); go(idx + 1); } if (e.key === "ArrowLeft") { e.preventDefault(); go(idx - 1); } }}>
          {sys.stations.map((s, i) => (
            <button key={s.id} role="tab" aria-selected={i === idx} tabIndex={i === idx ? 0 : -1} className={"s-rail__stop" + (i < idx ? " is-past" : "")} onClick={() => go(i)}>
              <span className="n-mono">{String(i + 1).padStart(2, "0")}</span>
              <span className="s-rail__dot" aria-hidden />
              <span className="s-rail__label">{s.label}</span>
            </button>
          ))}
        </div>

        <article className="s-station" role="tabpanel" aria-labelledby="s-q">
          <div className="s-station__main">
            <span className="n-mono s-station__n">STEP {idx + 1} OF {sys.stations.length}</span>
            <h2 id="s-q" className="s-station__q">{st.question}</h2>
            <p className="s-station__body">{st.body}</p>
            <p className="s-context n-mono" title={CONTEXT_NOTE}>4PLANET CONTEXT</p>
            <ul className="s-parts" aria-label="Parts of this step">{st.parts.map((p) => <li key={p}>{p}</li>)}</ul>
            {st.held && <p className="s-held"><span className="n-mono">NOT SHOWN YET</span>{st.held}</p>}
          </div>
          <aside className="s-station__side">
            {st.atlas && (
              <div className="s-side-block">
                <span className="n-mono">WHERE IT BECOMES PHYSICAL</span>
                <p>{st.atlas.caption}</p>
                <button className="n-btn s-btn" onClick={() => { setLayers(st.atlas!.layers); placeRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }); }}>See it on the Atlas</button>
              </div>
            )}
            {stProblems.length > 0 && (
              <div className="s-side-block">
                <span className="n-mono">WHAT CAN GO WRONG HERE</span>
                <ul className="s-side-list">{stProblems.map((p) => <li key={p.id}><a href={"#problem-" + p.id}>{p.title}</a></li>)}</ul>
              </div>
            )}
            <div className="s-station__nav">
              <button className="n-btn n-btn--ghost" onClick={() => go(idx - 1)} aria-label="Previous step">←</button>
              <button className="n-btn" onClick={() => go(idx + 1)}>{idx === sys.stations.length - 1 ? "Back to the start" : "Next: " + sys.stations[idx + 1].label} →</button>
            </div>
          </aside>
        </article>
        {sys.example && (
          <div className="s-example">
            <span className="n-mono">EXAMPLE · {sys.example.title.toUpperCase()}</span>
            <ol>{sys.example.steps.map((x) => <li key={x}>{x}</li>)}</ol>
          </div>
        )}
        {OBJECTS.some((o) => o.system === sys.slug) && (
          <div className="s-follow">
            <span className="n-mono">FOLLOW ONE THING IN THIS SYSTEM</span>
            <div>{OBJECTS.filter((o) => o.system === sys.slug).map((o) => <Link key={o.slug} className="s-follow__item" to={objectHref(o.slug)}><ObjectGlyph slug={o.slug} />{o.article}</Link>)}</div>
          </div>
        )}
      </section>

      {/* ── place ───────────────────────────────────────────────────── */}
      <section ref={placeRef} id="place" className="n-chapter s-chapter">
        <header className="n-chapter__head">
          <span className="n-mono">PLACE</span>
          <h2>Where {sys.name.toLowerCase()} becomes physical</h2>
          <p>The same 4PLANET ATLAS used everywhere in 4PLANET. Switch on what you want to see. Layers load only when switched on.</p>
        </header>
        <div className="n-chapter__body">
          <div className="s-layerchips" role="group" aria-label="Map layers">
            {[...new Set(sys.stations.flatMap((s) => s.atlas?.layers ?? []))].map((l) => (
              <button key={l} className="s-chip" aria-pressed={layers.includes(l)} onClick={() => setLayers(layers.includes(l) ? layers.filter((x) => x !== l) : [...layers, l])}>{LAYER_NAME[l] ?? l}</button>
            ))}
          </div>
          <div className="s-map">{embed ? <iframe key={embed} src={embed} title={"ATLAS: " + view.title} loading="lazy" referrerPolicy="no-referrer" allowFullScreen /> : <p role="status">No mapped context.</p>}</div>
          <p className="n-fine">{view.limitation}</p>
          {full && <a className="n-link" href={atlasFullDestination(full, window.location.hostname)}>Open in full ATLAS ↗</a>}
        </div>
      </section>

      {/* ── in a country ────────────────────────────────────────────── */}
      {sys.traceSectors && (
        <section id="country" className="n-chapter s-chapter">
          <header className="n-chapter__head">
            <span className="n-mono">IN A COUNTRY</span>
            <h2>{country ? `${sys.name} in ${country.short}` : "Follow it into a country"}</h2>
            <p>Value chains cross borders, but their biggest physical sources sit in specific places. These are the largest estimated emitting sources in this system for one country.</p>
          </header>
          <div className="n-chapter__body">
            <CountryPicker country={country} setCountry={setCountry} />
            {country && (
              <>
                {sys.traceSectors.length > 1 && (
                  <div className="n-seg s-seg" role="tablist" aria-label="Sector">
                    {sys.traceSectors.map((t, i) => <button key={t.sectors} role="tab" aria-selected={i === sector} onClick={() => setSector(i)}>{t.label}</button>)}
                  </div>
                )}
                <div className="s-trace" aria-live="polite">
                  {trace.status === "loading" && <span className="n-skeleton n-skeleton--line" />}
                  {trace.status === "error" && <p className="n-unknown">Climate TRACE is unavailable right now, or holds no mappable sources for this country and sector. This is not the same as zero emissions.</p>}
                  {trace.status === "ready" && (trace.rows.length === 0 ? <p className="n-unknown">No sources returned for this country and sector.</p> : (
                    <ol className="s-trace__list">
                      {trace.rows.map((r, i) => {
                        const max = trace.rows[0].co2e || 1;
                        const k = r.co2e !== null ? compact(r.co2e) : null;
                        return (
                          <li key={r.id ?? i}>
                            <span className="s-trace__rank n-mono">{String(i + 1).padStart(2, "0")}</span>
                            <span className="s-trace__name">{r.name || "Unnamed source"}<small>{(r.subsector || "").replace(/-/g, " ")}</small></span>
                            <span className="s-trace__bar" aria-hidden><i style={{ width: r.co2e ? Math.max(2, (r.co2e / max) * 100) + "%" : 0 }} /></span>
                            <span className="s-trace__val">{k ? <>{k.value}<small> {k.unit ? k.unit + " " : ""}t CO₂e</small></> : <small>Not reported</small>}</span>
                          </li>
                        );
                      })}
                    </ol>
                  ))}
                  {trace.status === "ready" && (
                    <button className="n-source" onClick={() => open({ title: `${sys.traceSectors![sector].label} sources in ${country.short}`, source: TRACE, period: String(trace.rows[0]?.year ?? ""), retrievedAt: trace.retrievedAt, note: "Ranked by estimated CO₂e (100-year), largest first. Up to eight sources shown." })}>
                      <span>{trace.rows[0]?.year ?? ""}</span><span>Climate TRACE</span><i aria-hidden>↗</i>
                    </button>
                  )}
                </div>
                <a className="s-crosslink" href={`${nationOrigin()}/country/${country.slug}`}>
                  <span className="n-mono">4NATION</span>Understand {country.short} — people, economy, nature <b>→</b>
                </a>
              </>
            )}
          </div>
        </section>
      )}

      {/* ── living systems ──────────────────────────────────────────── */}
      <section id="nature" className="n-chapter s-chapter">
        <header className="n-chapter__head">
          <span className="n-mono">NATURE</span>
          <h2>The living systems it touches</h2>
          <p>From the shared 4PLANET living-systems registry — the same entries used by ATLAS and Living Systems.</p>
        </header>
        <div className="n-chapter__body">
          <ul className="s-living">
            {living.map((l) => <li key={l!.id}><h3>{l!.name}</h3><span className="n-mono">{l!.sub}</span><p>{l!.body}</p></li>)}
          </ul>
        </div>
      </section>

      {/* ── problems ────────────────────────────────────────────────── */}
      <section id="problems" className="n-chapter s-chapter">
        <header className="n-chapter__head">
          <span className="n-mono">PROBLEMS</span>
          <h2>Where the system breaks down</h2>
          <p>Each problem names its drivers and what remains uncertain. There is no single score — problems are different in kind.</p>
        </header>
        <div className="n-chapter__body s-problems">
          {sys.problems.map((p) => {
            const pr = pressureById(p.pressureId);
            const affects = (pr?.affects ?? []).filter((id) => sys.livingSystemIds.includes(id)).map((id) => systemById(id)?.name).filter(Boolean);
            return (
              <article key={p.id} id={"problem-" + p.id} className="s-problem">
                <span className="n-mono">{p.stations.map((x) => sys.stations.find((s) => s.id === x)?.label).filter(Boolean).join(" · ").toUpperCase()}</span>
                <h3>{p.title}</h3>
                <p>{p.definition}</p>
                <dl>
                  <div><dt>Where</dt><dd>{p.where}</dd></div>
                  <div><dt>Drivers</dt><dd>{p.drivers.join(" · ")}</dd></div>
                  {affects.length > 0 && <div><dt>Living systems</dt><dd>{affects.join(" · ")}</dd></div>}
                  <div><dt>Uncertain</dt><dd>{p.uncertainty}</dd></div>
                </dl>
              </article>
            );
          })}
        </div>
      </section>

      {/* ── solutions ───────────────────────────────────────────────── */}
      <section id="solutions" className="n-chapter s-chapter">
        <header className="n-chapter__head">
          <span className="n-mono">INNOVATION</span>
          <h2>What people are building</h2>
          <p>Solution families from the shared 4PLANET solutions registry. How mature a solution is and how strong its evidence is are two different questions.</p>
        </header>
        <div className="n-chapter__body s-solutions">
          {solutions.map((s) => (
            <article key={s.id} className="s-solution">
              <h3>{s.name}</h3>
              <p>{s.body}</p>
              <div className="s-scales">
                <Scale label="Maturity" steps={MATURITY} value={s.maturity} />
                <Scale label="Evidence" steps={EVIDENCE} value={s.evidenceStrength} />
              </div>
              <p className="s-solution__limit"><span className="n-mono">LIMITS</span>{s.limitations}</p>
              {s.actors && <p className="n-fine">Who is involved: {s.actors.join(" · ")}</p>}
            </article>
          ))}
          <p className="n-fine">Maturity: idea → pilot → deployed → scaled. Evidence: insufficient → emerging → moderate → strong. A deployed solution can still have weak evidence.</p>
        </div>
      </section>

      <section className="n-band s-next">
        <h2 className="s-next__h">Follow another system</h2>
        <div className="n-actions">{SYSTEMS.filter((s) => s.slug !== sys.slug).map((s) => <Link key={s.slug} className="n-btn s-btn" to={systemHref(s.slug)}>{s.name} →</Link>)}</div>
        <p className="n-fine">{fmt.int(sys.stations.length)} steps · {sys.problems.length} problems · {solutions.length} solution families. Station explanations are 4PLANET context; quantities are sourced.</p>
      </section>
      <S4Footer />
    </main>
  );
}

const LAYER_NAME: Record<string, string> = {
  ndvi: "Vegetation", precip: "Rainfall", truecolor: "Satellite day", forest: "Forest", fires: "Fire detections",
  emissions: "Emitting sources", night: "Lights at night",
};
