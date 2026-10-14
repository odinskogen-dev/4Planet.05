/**
 * S4PIENS — follow one thing. Two views of the same truth:
 *   OBJECT: the object's own journey, step by step, with the system rail lighting up as you go.
 *   SYSTEM: the system's stations, with the object's steps placed inside them.
 */
import { useEffect, useRef, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { atlasEmbedHref, atlasFullDestination, atlasHrefForView, type AtlasView } from "@/earth/atlasViewContract";
import { OBJECTS, objectBySlug, type EverydayObject } from "./objects";
import { systemBySlug } from "./systems";
import { S4Footer, s4Base, systemHref } from "./S4App";

export const objectHref = (slug: string) => `${s4Base()}/object/${slug}`;

export function ObjectGlyph({ slug }: { slug: string }) {
  // Simple original line pictograms — not photographs, not brand artwork.
  const paths: Record<string, string> = {
    bread: "M8 42 Q8 22 32 22 Q56 22 56 42 Q56 48 50 48 L14 48 Q8 48 8 42 Z M20 34 L25 28 M29 34 L34 28 M38 34 L43 28",
    coffee: "M16 26 L44 26 L41 50 Q40 52 38 52 L22 52 Q20 52 19 50 Z M44 31 Q52 31 52 37 Q52 43 43 43 M24 12 Q20 16 24 20 M32 10 Q28 15 32 20 M40 12 Q36 16 40 20",
    "steel-beam": "M12 18 L52 18 L52 24 L36 24 L36 40 L52 40 L52 46 L12 46 L12 40 L28 40 L28 24 L12 24 Z",
    smartphone: "M22 10 L42 10 Q46 10 46 14 L46 50 Q46 54 42 54 L22 54 Q18 54 18 50 L18 14 Q18 10 22 10 Z M28 14 L36 14 M30 48 L34 48",
  };
  return <svg className="s-glyph" viewBox="0 0 64 64" aria-hidden><path d={paths[slug] ?? "M16 16h32v32H16z"} /></svg>;
}

export default function ObjectPage() {
  const { slug = "" } = useParams();
  const obj = objectBySlug(slug);
  if (!obj) {
    return (
      <main className="n-notfound">
        <p className="n-mono">NOT MAPPED YET</p>
        <h1 className="n-display">Choose something to follow.</h1>
        <div className="n-actions">{OBJECTS.map((o) => <Link key={o.slug} className="n-btn" to={objectHref(o.slug)}>{o.name}</Link>)}</div>
      </main>
    );
  }
  return <ObjectJourney key={obj.slug} obj={obj} />;
}

function ObjectJourney({ obj }: { obj: EverydayObject }) {
  const sys = systemBySlug(obj.system)!;
  const [params, setParams] = useSearchParams();
  const view = params.get("view") === "system" ? "system" : "object";
  const setView = (v: "object" | "system") => { const p = new URLSearchParams(params); v === "system" ? p.set("view", "system") : p.delete("view"); setParams(p, { replace: true }); };
  const [active, setActive] = useState(0);
  const [layers, setLayers] = useState<string[]>(obj.steps.find((s) => s.atlas)?.atlas ?? []);
  const refs = useRef<(HTMLLIElement | null)[]>([]);
  const mapRef = useRef<HTMLElement>(null);

  useEffect(() => {
    document.title = `${obj.article} — follow it · S4PIENS`;
    document.querySelector('meta[name="description"]')?.setAttribute("content", `${obj.line} Follow ${obj.article.toLowerCase()} step by step through the ${sys.name.toLowerCase()} system.`);
  }, [obj.slug]);

  // Light the system rail as the reader moves through the object's steps.
  useEffect(() => {
    if (view !== "object" || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) if (e.isIntersecting) setActive(Number((e.target as HTMLElement).dataset.i));
    }, { rootMargin: "-45% 0px -45% 0px" });
    refs.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, [view, obj.slug]);

  const activeStation = obj.steps[active]?.station;
  const railRef = useRef<HTMLOListElement>(null);
  useEffect(() => {
    const rail = railRef.current, el = rail?.querySelector<HTMLElement>("li.is-on");
    if (rail && el && rail.scrollWidth > rail.clientWidth) rail.scrollTo({ left: el.offsetLeft - rail.clientWidth / 2 + el.clientWidth / 2, behavior: "smooth" });
  }, [activeStation]);
  const passed = new Set(obj.steps.map((s) => s.station));
  const mapView: AtlasView = { kind: "S4PIENS", title: obj.article, camera: { lng: 15, lat: 22, zoom: 1.3 }, layers: ["bluemarble", ...layers], limitation: "Shared 4PLANET ATLAS. A map layer shows where this kind of activity happens in general — not where this particular object came from." };
  const embed = atlasEmbedHref(mapView), full = atlasHrefForView(mapView);

  return (
    <main className="s-object">
      <section className="s-obj-hero">
        <div className="s-obj-hero__copy">
          <p className="n-kicker n-mono">FOLLOW ONE THING · {sys.name.toUpperCase()}</p>
          <h1 className="n-display s-obj-title">{obj.article}</h1>
          <p className="n-lead">{obj.line}</p>
          {obj.mappedVia && <p className="s-held"><span className="n-mono">HOW THIS IS MAPPED</span>{obj.mappedVia}</p>}
          <div className="n-seg s-seg" role="tablist" aria-label="View">
            <button role="tab" aria-selected={view === "object"} onClick={() => setView("object")}>This object</button>
            <button role="tab" aria-selected={view === "system"} onClick={() => setView("system")}>Its system</button>
          </div>
        </div>
        <div className="s-obj-hero__glyph"><ObjectGlyph slug={obj.slug} /><span className="n-mono">{obj.steps.length} STEPS · {passed.size} OF {sys.stations.length} STATIONS IN {sys.name.toUpperCase()}</span></div>
      </section>

      {view === "object" ? (
        <section className="s-journey" aria-label={`The journey of ${obj.article.toLowerCase()}`}>
          <aside className="s-journey__rail" aria-label={`${sys.name} stations`}>
            <span className="n-mono">THE SYSTEM BEHIND IT</span>
            <ol ref={railRef}>
              {sys.stations.map((st) => (
                <li key={st.id} className={(st.id === activeStation ? "is-on " : "") + (passed.has(st.id) ? "is-passed" : "is-skip")}>
                  <Link to={`${systemHref(sys.slug)}?step=${st.id}`}>{st.label}</Link>
                </li>
              ))}
            </ol>
            <Link className="n-link" to={systemHref(sys.slug)}>The whole {sys.name.toLowerCase()} system →</Link>
          </aside>
          <ol className="s-journey__steps">
            {obj.steps.map((s, i) => {
              const st = sys.stations.find((x) => x.id === s.station);
              return (
                <li key={i} ref={(el) => { refs.current[i] = el; }} data-i={i} className={"s-step" + (i === active ? " is-on" : "")}>
                  <span className="s-step__n n-mono">{String(i + 1).padStart(2, "0")} · {st?.label.toUpperCase()}</span>
                  <h2>{s.title}</h2>
                  <p>{s.body}</p>
                  <dl className="s-step__facts">
                    <div><dt>Where</dt><dd>{s.where}</dd></div>
                    <div><dt>Needs</dt><dd>{s.needs.join(" · ")}</dd></div>
                  </dl>
                  {s.nature && <p className="s-step__nature"><span className="n-mono">LIVING WORLD</span>{s.nature}</p>}
                  {s.atlas && <button className="n-btn n-btn--ghost" onClick={() => { setLayers(s.atlas!); mapRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }); }}>Where this happens →</button>}
                </li>
              );
            })}
          </ol>
        </section>
      ) : (
        <section className="s-sysview" aria-label={`${obj.article} inside the ${sys.name.toLowerCase()} system`}>
          {sys.stations.map((st, i) => {
            const mine = obj.steps.filter((s) => s.station === st.id);
            return (
              <article key={st.id} className={"s-sysrow" + (mine.length ? "" : " is-skip")}>
                <div className="s-sysrow__sys">
                  <span className="n-mono">{String(i + 1).padStart(2, "0")} · {st.label.toUpperCase()}</span>
                  <h2>{st.question}</h2>
                  <p>{st.body}</p>
                </div>
                <div className="s-sysrow__obj">
                  {mine.length ? mine.map((m) => (
                    <div key={m.title} className="s-sysrow__step"><span className="s-sysrow__num">{String(obj.steps.indexOf(m) + 1).padStart(2, "0")}</span><div><b>{m.title}</b><p>{m.body}</p></div></div>
                  )) : <p className="n-unknown">{obj.name} does not pass through this step as its own stage.</p>}
                </div>
              </article>
            );
          })}
        </section>
      )}

      <section ref={mapRef} className="n-chapter s-chapter">
        <header className="n-chapter__head">
          <span className="n-mono">PLACE</span>
          <h2>Where this kind of thing happens</h2>
          <p>The shared ATLAS shows where these activities happen in the world in general — not where this particular {obj.name.toLowerCase()} came from.</p>
        </header>
        <div className="n-chapter__body">
          <div className="s-map">{embed ? <iframe key={embed} src={embed} title={"ATLAS: " + obj.article} loading="lazy" referrerPolicy="no-referrer" /> : null}</div>
          {full && <a className="n-link" href={atlasFullDestination(full, window.location.hostname)}>Open in full ATLAS ↗</a>}
        </div>
      </section>

      <section className="n-band">
        <header className="n-band__head"><span className="n-mono">NEXT</span><h2>Follow something else</h2></header>
        <div className="s-objects">
          {OBJECTS.filter((o) => o.slug !== obj.slug).map((o) => <ObjectCard key={o.slug} o={o} />)}
        </div>
      </section>
      <S4Footer />
    </main>
  );
}

export function ObjectCard({ o }: { o: EverydayObject }) {
  const sys = systemBySlug(o.system);
  return (
    <Link to={objectHref(o.slug)} className="s-objcard">
      <ObjectGlyph slug={o.slug} />
      <span className="s-objcard__name">{o.name}</span>
      <span className="s-objcard__line">{o.line}</span>
      <span className="n-mono">{o.steps.length} STEPS · {sys?.name.toUpperCase()}</span>
    </Link>
  );
}
