/**
 * 4NATION compare — two countries side by side, true to scale.
 * Same sources and positions as the Country Object; nothing is scored or combined.
 */
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { countryBySlug, loadCountryRings, mainBbox, ringBbox, searchCountries, type NationCountry, type Ring } from "./geo";
import { W, WB_SOURCE, compact, fmt, positionOf, useRanks, useWb, type WbCountry, type WbRanks, type Load } from "./data";
import { ordinal } from "@/data/worldBankCountry";
import { useSourceDrawer } from "./ui";
import { countryHref, nationBase } from "./NationApp";
import { NationFooter } from "./NationFooter";

const ROWS: { id: string; label: string; f: (n: number) => string }[] = [
  { id: W.pop, label: "Population", f: (n) => { const k = compact(n); return `${k.value} ${k.unit}`.trim(); } },
  { id: W.life, label: "Life expectancy", f: (n) => fmt.d1(n) + " years" },
  { id: W.gdppc, label: "GDP per person", f: (n) => "US$" + fmt.int(n) },
  { id: W.urban, label: "Living in cities", f: (n) => fmt.d1(n) + "%" },
  { id: W.internet, label: "Using the internet", f: (n) => fmt.d1(n) + "%" },
  { id: W.elec, label: "Access to electricity", f: (n) => fmt.d1(n) + "%" },
  { id: W.renew, label: "Renewable energy", f: (n) => fmt.d1(n) + "% of final use" },
  { id: W.forest, label: "Forest", f: (n) => fmt.d1(n) + "% of land" },
  { id: W.agriLand, label: "Farmland", f: (n) => fmt.d1(n) + "% of land" },
  { id: W.protected, label: "Protected areas", f: (n) => fmt.d1(n) + "%" },
  { id: W.water, label: "Water stress", f: (n) => fmt.d1(n) + "%" },
  { id: W.manuf, label: "Manufacturing", f: (n) => fmt.d1(n) + "% of GDP" },
  { id: W.agriGdp, label: "Farming, forestry, fishing", f: (n) => fmt.d1(n) + "% of GDP" },
];

/** Both outlines at ONE shared scale (km), so size is honest. */
function useTwinShapes(a: NationCountry, b: NationCountry) {
  const [shapes, set] = useState<{ a: string; b: string; wa: number; ha: number; wb: number; hb: number } | null>(null);
  useEffect(() => {
    let alive = true;
    Promise.all([loadCountryRings(a.iso2), loadCountryRings(b.iso2)]).then(([ra, rb]) => {
      if (!alive) return;
      const prep = (rings: Ring[]) => {
        const [x0, y0, x1, y1] = mainBbox(rings), k = Math.cos(((y0 + y1) / 2) * Math.PI / 180);
        const kmX = 111.32 * k, kmY = 110.57;
        const rs = rings.filter((r) => { const [p, q, s, t] = ringBbox(r); return !(s < x0 - 2 || p > x1 + 2 || t < y0 - 2 || q > y1 + 2); });
        return { w: (x1 - x0) * kmX, h: (y1 - y0) * kmY, path: (scale: number) => rs.map((r) => "M" + r.map(([x, y]) => ((x - x0) * kmX * scale).toFixed(1) + " " + ((y1 - y) * kmY * scale).toFixed(1)).join("L") + "Z").join("") };
      };
      const A = prep(ra), B = prep(rb), scale = 400 / Math.max(A.w + B.w, A.h, B.h);
      set({ a: A.path(scale), b: B.path(scale), wa: A.w * scale, ha: A.h * scale, wb: B.w * scale, hb: B.h * scale });
    }).catch(() => undefined);
    return () => { alive = false; };
  }, [a.iso2, b.iso2]);
  return shapes;
}

function Picker({ exclude, onPick, placeholder }: { exclude: string; onPick: (c: NationCountry) => void; placeholder: string }) {
  const [q, setQ] = useState("");
  const res = useMemo(() => searchCountries(q, 6).filter((x) => x.iso2 !== exclude), [q, exclude]);
  return (
    <div className="n-search">
      <svg viewBox="0 0 16 16" aria-hidden className="n-search__icon"><circle cx="7" cy="7" r="5" /><path d="M11 11l3.5 3.5" /></svg>
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={placeholder} aria-label={placeholder}
        onKeyDown={(e) => { if (e.key === "Enter" && res[0]) { onPick(res[0]); setQ(""); } }} />
      {res.length > 0 && <ul className="n-search__list" role="listbox">{res.map((x) => <li key={x.iso2} role="option" aria-selected={false}><button onClick={() => { onPick(x); setQ(""); }}><span>{x.name}</span><span className="n-mono">{x.iso3}</span></button></li>)}</ul>}
    </div>
  );
}

const latest = (wb: Load<WbCountry>, id: string) => {
  if (wb.status !== "ready") return null;
  const s = wb.data.series[id]; const o = s?.observations[s.observations.length - 1];
  return o && typeof o.value === "number" ? { v: o.value, y: o.period ?? "" } : null;
};

function Cell({ wb, ranks, c, row }: { wb: Load<WbCountry>; ranks?: WbRanks; c: NationCountry; row: typeof ROWS[number] }) {
  if (wb.status === "loading") return <td><span className="n-skeleton n-skeleton--line" /></td>;
  const l = latest(wb, row.id);
  if (!l) return <td className="n-unknown">{wb.status === "error" ? "Unavailable" : "Not reported"}</td>;
  const p = positionOf(ranks, row.id, c.iso3);
  return (
    <td>
      <b>{row.f(l.v)}</b>
      <span className="n-cmp__meta n-mono">{l.y}{p ? ` · ${p.rank <= p.of / 2 ? ordinal(p.rank) + " highest" : ordinal(p.of - p.rank + 1) + " lowest"} of ${p.of}` : ""}</span>
    </td>
  );
}

export default function ComparePage({ theme }: { theme: string }) {
  const { pair = "" } = useParams();
  const nav = useNavigate();
  const [sa, sb] = pair.split("-vs-");
  const a = countryBySlug(sa || ""), b = countryBySlug(sb || "");
  useEffect(() => {
    if (!a || !b) return;
    document.title = `${a.short} and ${b.short} compared · 4NATION`;
    let el = document.head.querySelector('meta[name="robots"]');
    if (!el) { el = document.createElement("meta"); el.setAttribute("name", "robots"); document.head.appendChild(el); }
    el.setAttribute("content", "noindex,follow");
  }, [a?.iso2, b?.iso2]);
  if (!a || !b) {
    return (
      <main className="n-notfound">
        <p className="n-mono">COMPARE TWO COUNTRIES</p>
        <h1 className="n-display">Choose two countries.</h1>
        <Picker exclude="" placeholder="First country" onPick={(x) => nav(`${nationBase()}/compare/${x.slug}-vs-${(b ?? countryBySlug("norway"))!.slug}`)} />
      </main>
    );
  }
  return <Compare key={a.iso2 + b.iso2} a={a} b={b} theme={theme} />;
}

function Compare({ a, b }: { a: NationCountry; b: NationCountry; theme: string }) {
  const nav = useNavigate();
  const open = useSourceDrawer();
  const wa = useWb(a.iso3), wbb = useWb(b.iso3);
  const rl = useRanks();
  const ranks = rl.status === "ready" ? rl.data : undefined;
  const twin = useTwinShapes(a, b);
  const go = (x: NationCountry, y: NationCountry) => nav(`${nationBase()}/compare/${x.slug}-vs-${y.slug}`);
  const share = async () => {
    const url = window.location.href;
    try { if (navigator.share) await navigator.share({ title: `${a.short} and ${b.short} · 4NATION`, url }); else await navigator.clipboard.writeText(url); } catch { /* dismissed */ }
  };
  const ratio = a.areaKm2Approx / b.areaKm2Approx;
  return (
    <main className="n-cmp">
      <section className="n-cmp__hero">
        <p className="n-kicker n-mono">COMPARE · SAME SOURCES · SAME SCALE</p>
        <h1 className="n-display n-cmp__title"><Link to={countryHref(a)}>{a.short}</Link> <span>and</span> <Link to={countryHref(b)}>{b.short}</Link></h1>
        <div className="n-cmp__twins" aria-label={`Outlines of ${a.short} and ${b.short} at the same scale`}>
          {twin ? (() => {
            const gap = 40, W = twin.wa + gap + twin.wb, H = Math.max(twin.ha, twin.hb) + 24;
            return (
              <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`${a.short} and ${b.short} outlines at the same scale`}>
                <g transform={`translate(0 ${H - 24 - twin.ha})`}><path d={twin.a} className="is-a" /></g>
                <g transform={`translate(${twin.wa + gap} ${H - 24 - twin.hb})`}><path d={twin.b} className="is-b" /></g>
                <text x={twin.wa / 2} y={H - 4} textAnchor="middle">{a.short.toUpperCase()}</text>
                <text x={twin.wa + gap + twin.wb / 2} y={H - 4} textAnchor="middle">{b.short.toUpperCase()}</text>
              </svg>
            );
          })()
          : <span className="n-skeleton n-skeleton--line" />}
        </div>
        <p className="n-lead">At the same scale, {ratio > 0.92 && ratio < 1.08 ? `${a.short} and ${b.short} are about the same size` : ratio >= 1 ? `${a.short} is about ${ratio >= 1.95 ? fmt.int(Math.round(ratio)) + " times" : fmt.d1(ratio) + " times"} the size of ${b.short}` : `${b.short} is about ${1 / ratio >= 1.95 ? fmt.int(Math.round(1 / ratio)) + " times" : fmt.d1(1 / ratio) + " times"} the size of ${a.short}`} (main landmass outlines, approximate).</p>
        <div className="n-actions">
          <button className="n-btn" onClick={() => go(b, a)}>Swap</button>
          <button className="n-btn n-btn--ghost" onClick={share}>Share</button>
        </div>
        <div className="n-cmp__pickers">
          <Picker exclude={b.iso2} placeholder={`Replace ${a.short}`} onPick={(x) => go(x, b)} />
          <Picker exclude={a.iso2} placeholder={`Replace ${b.short}`} onPick={(x) => go(a, x)} />
        </div>
      </section>
      <section className="n-band">
        <table className="n-cmp__table">
          <thead><tr><th scope="col">Indicator</th><th scope="col">{a.short}</th><th scope="col">{b.short}</th></tr></thead>
          <tbody>
            {ROWS.map((r) => (
              <tr key={r.id}><th scope="row">{r.label}</th><Cell wb={wa} ranks={ranks} c={a} row={r} /><Cell wb={wbb} ranks={ranks} c={b} row={r} /></tr>
            ))}
          </tbody>
        </table>
        <button className="n-source" onClick={() => open({ title: "Comparison", source: WB_SOURCE, note: "Latest reported value for each country; years can differ between the two columns. Positions are among all countries and territories reporting the indicator." })}><span>World Bank</span><i aria-hidden>↗</i></button>
        <p className="n-fine">Nothing here is combined into a score. Years can differ between columns — compare with care.</p>
      </section>
      <NationFooter />
    </main>
  );
}
