import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Globe } from "./Globe";
import { COUNTRIES, FEATURED, GEO_SOURCE, countryByIso, loadCountryRings, silhouettePath, type NationCountry } from "./geo";
import { CountrySearch, countryHref, nationBase, useMyCountry } from "./NationApp";
import { NationFooter } from "./NationFooter";

function Glyph({ c }: { c: NationCountry }) {
  const [p, setP] = useState<{ d: string; w: number; h: number } | null>(null);
  useEffect(() => { let a = true; loadCountryRings(c.iso2).then((r) => a && setP(silhouettePath(r, 120, 6))).catch(() => undefined); return () => { a = false; }; }, [c.iso2]);
  return (
    <svg className="n-glyph" viewBox={p ? `0 0 ${p.w} ${p.h}` : "0 0 120 120"} aria-hidden>
      {p && <path d={p.d} />}
    </svg>
  );
}

export function CountryTile({ c, tag }: { c: NationCountry; tag?: string }) {
  return (
    <Link to={countryHref(c)} className="n-tile">
      <span className="n-tile__meta n-mono">{tag ?? c.subregion.toUpperCase()}</span>
      <Glyph c={c} />
      <span className="n-tile__name">{c.short}</span>
      <span className="n-tile__sub">{c.capital ? "Capital " + c.capital : c.continent}</span>
    </Link>
  );
}

const CONTINENTS = ["Africa", "Asia", "Europe", "North America", "South America", "Oceania", "Antarctica", "Seven seas (open ocean)"];

export default function NationHome({ theme }: { theme: string }) {
  const nav = useNavigate();
  const [hover, setHover] = useState<string | null>(null);
  const [my] = useMyCountry();
  const [cont, setCont] = useState("Europe");
  const hovered = hover ? countryByIso(hover) : null;
  const list = useMemo(() => COUNTRIES.filter((c) => c.continent === cont), [cont]);
  useEffect(() => {
    document.title = "4NATION — Understand any country";
    document.querySelector('meta[name="description"]')?.setAttribute("content", "Source-backed country profiles: people, land, economy, nature and heritage — every number dated and sourced. From 4PLANET.");
  }, []);
  return (
    <main className="n-home">
      <section className="n-home__hero">
        <div className="n-home__copy">
          <p className="n-kicker n-mono">COUNTRY INTELLIGENCE · FROM 4PLANET</p>
          <h1 className="n-display">Understand<br />any country.</h1>
          <p className="n-lead">People, land, economy, nature and heritage — in one clear view. Every number carries its year and its source.</p>
          <CountrySearch size="l" />
          <p className="n-home__count n-mono">{COUNTRIES.length} COUNTRIES AND TERRITORIES · OPEN SOURCES · NO SCORES</p>
        </div>
        <div className="n-home__globe">
          <Globe focus={null} interactive theme={theme} onHover={setHover}
            onPick={(iso) => { const c = countryByIso(iso); if (c) nav(countryHref(c)); }} label="Interactive globe. Drag to turn, select a country to open its profile." />
          <div className="n-globe-hud n-mono" aria-live="polite">
            <span>ORTHOGRAPHIC · NATURAL EARTH 1:110M</span>
            <span className="n-globe-hud__pick">{hovered ? hovered.short.toUpperCase() + " — OPEN PROFILE" : "DRAG TO TURN · SELECT A COUNTRY"}</span>
          </div>
        </div>
      </section>

      <section className="n-band">
        <header className="n-band__head">
          <span className="n-mono">01</span>
          <h2>Start with a profile</h2>
          <p>Four countries, four continents, one system. Each profile is built by the same engine from the same sources — so every country can be read the same honest way.</p>
        </header>
        <div className="n-tiles">
          {my && !FEATURED.includes(my.iso2 as typeof FEATURED[number]) && <CountryTile c={my} tag="MY COUNTRY" />}
          {FEATURED.map((iso) => { const c = countryByIso(iso); return c ? <CountryTile key={iso} c={c} tag={my?.iso2 === iso ? "MY COUNTRY" : undefined} /> : null; })}
        </div>
        <p className="n-home__compare"><Link className="n-link" to={`${nationBase()}/compare/norway-vs-brazil`}>Compare two countries side by side, at the same scale →</Link></p>
      </section>

      <section className="n-band n-band--how">
        <header className="n-band__head">
          <span className="n-mono">02</span>
          <h2>Read a country in three depths</h2>
        </header>
        <ol className="n-how">
          <li><span className="n-mono">30 SECONDS</span><h3>The readout</h3><p>Population, capital, economy, life expectancy and what the world recognises it for — at a glance.</p></li>
          <li><span className="n-mono">5 MINUTES</span><h3>The chapters</h3><p>Land, people, work, energy, learning, nature and the capital — each with change over time, where the country stands globally, and a source behind every figure.</p></li>
          <li><span className="n-mono">AS DEEP AS YOU LIKE</span><h3>Atlas mode</h3><p>The country on the shared 4PLANET ATLAS: Earth imagery, heritage, biosphere reserves, geoparks and ocean biodiversity.</p></li>
        </ol>
        <p className="n-how__decisions">Public decisions are arriving country by country. The first source-backed case — Norway — is <Link to={`${nationBase()}/decisions`}>open now</Link>.</p>
      </section>

      <section className="n-band">
        <header className="n-band__head">
          <span className="n-mono">03</span>
          <h2>All countries and territories</h2>
        </header>
        <div className="n-continents" role="tablist" aria-label="Continent">
          {CONTINENTS.filter((k) => COUNTRIES.some((c) => c.continent === k)).map((k) => (
            <button key={k} role="tab" aria-selected={cont === k} onClick={() => setCont(k)}>{k.replace(" (open ocean)", "")}</button>
          ))}
        </div>
        <ul className="n-index">
          {list.map((c) => <li key={c.iso2}><Link to={countryHref(c)}>{c.short}<span className="n-mono">{c.iso3}</span></Link></li>)}
        </ul>
        <p className="n-fine">Names and outlines: {GEO_SOURCE.name} ({GEO_SOURCE.licence}). Boundaries are cartographic, not a 4PLANET position.</p>
      </section>
      <NationFooter />
    </main>
  );
}
