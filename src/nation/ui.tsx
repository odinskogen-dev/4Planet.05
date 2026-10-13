/* 4NATION primitives — readouts, source lines, drawer, charts. */
import { createContext, useContext, useId, useMemo, useRef, useState, type ReactNode } from "react";
import type { CountryMetric, CountrySeries } from "@/data/unescoOpenData";

export type SourceRef = { label: string; long?: string; licence: string; url: string; limitation?: string };
type DrawerItem = { title: string; source: SourceRef; period?: string; retrievedAt?: string; note?: string; series?: CountrySeries; format?: (n: number) => string };

const DrawerCtx = createContext<(item: DrawerItem) => void>(() => undefined);
export const useSourceDrawer = () => useContext(DrawerCtx);

export function SourceDrawerProvider({ children }: { children: ReactNode }) {
  const [item, setItem] = useState<DrawerItem | null>(null);
  return (
    <DrawerCtx.Provider value={setItem}>
      {children}
      {item && (
        <div className="n-drawer" role="dialog" aria-modal="true" aria-label={"Source: " + item.title} onClick={(e) => { if (e.target === e.currentTarget) setItem(null); }}
          onKeyDown={(e) => { if (e.key === "Escape") setItem(null); }}>
          <section className="n-drawer__panel">
            <header className="n-drawer__head">
              <span className="n-mono">SOURCE</span>
              <button className="n-icon-btn" onClick={() => setItem(null)} aria-label="Close source" autoFocus>×</button>
            </header>
            <h3>{item.title}</h3>
            <dl className="n-drawer__meta">
              <div><dt>Source</dt><dd>{item.source.long ?? item.source.label}</dd></div>
              {item.period && <div><dt>Period</dt><dd>{item.period}</dd></div>}
              <div><dt>Licence</dt><dd>{item.source.licence}</dd></div>
              {item.retrievedAt && <div><dt>Retrieved</dt><dd>{new Date(item.retrievedAt).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })}</dd></div>}
            </dl>
            {item.note && <p className="n-drawer__note">{item.note}</p>}
            {item.source.limitation && <p className="n-drawer__limit"><span className="n-mono">DOES NOT SHOW</span>{item.source.limitation}</p>}
            {item.series && item.series.observations.length > 0 && (
              <div className="n-drawer__table-wrap">
                <table className="n-table">
                  <caption className="n-mono">{item.series.label}{item.series.unit ? " · " + item.series.unit : ""}</caption>
                  <thead><tr><th scope="col">Year</th><th scope="col">Value</th></tr></thead>
                  <tbody>{[...item.series.observations].reverse().map((o) => (
                    <tr key={String(o.period)}><td>{o.period}</td><td>{typeof o.value === "number" ? (item.format ? item.format(o.value) : String(o.value)) : String(o.value ?? "—")}</td></tr>
                  ))}</tbody>
                </table>
              </div>
            )}
            <a className="n-link" href={item.source.url} target="_blank" rel="noreferrer">Open original dataset ↗</a>
          </section>
        </div>
      )}
    </DrawerCtx.Provider>
  );
}

export function SourceLine({ source, period, onOpen }: { source: SourceRef; period?: string; onOpen?: () => void }) {
  return (
    <button type="button" className="n-source" onClick={onOpen} aria-label={"Source: " + source.label + (period ? ", " + period : "")}>
      {period && <span>{period}</span>}<span>{source.label}</span><i aria-hidden>↗</i>
    </button>
  );
}

/** A readout cell. `value === null` is UNKNOWN, never zero. */
export function Readout({ label, value, unit, period, source, onSource, loading, size = "m", hint, unavailable }: {
  label: string; value: string | null; unit?: string; period?: string; source?: SourceRef; onSource?: () => void;
  loading?: boolean; size?: "l" | "m"; hint?: string; unavailable?: boolean;
}) {
  return (
    <div className={"n-readout n-readout--" + size}>
      <span className="n-readout__label">{label}</span>
      {loading ? <span className="n-readout__value n-skeleton" aria-label="Loading">&nbsp;</span>
        : unavailable ? <span className="n-readout__value n-readout__value--unknown">Source unavailable</span>
        : value === null ? <span className="n-readout__value n-readout__value--unknown">Not reported</span>
        : <span className="n-readout__value">{value}{unit && <small>{unit}</small>}</span>}
      {hint && <span className="n-readout__hint">{hint}</span>}
      {source && !loading && value !== null && <SourceLine source={source} period={period} onOpen={onSource} />}
    </div>
  );
}

/* ── Line chart: single series, crosshair + tooltip, table via drawer ─── */
export function LineChart({ series, format, height = 140, label }: { series: CountrySeries; format: (n: number) => string; height?: number; label: string }) {
  const pts = useMemo(() => series.observations
    .map((o) => ({ x: Number(o.period), y: typeof o.value === "number" ? o.value : NaN, o }))
    .filter((p) => Number.isFinite(p.x) && Number.isFinite(p.y)), [series]);
  const [hi, setHi] = useState<number | null>(null);
  const ref = useRef<SVGSVGElement>(null);
  const id = useId();
  if (pts.length < 2) return null;
  const W = 600, H = height, padL = 4, padR = 4, padT = 14, padB = 22;
  const x0 = pts[0].x, x1 = pts[pts.length - 1].x;
  let y0 = Math.min(...pts.map((p) => p.y)), y1 = Math.max(...pts.map((p) => p.y));
  if (y0 === y1) { y0 -= 1; y1 += 1; }
  const pad = (y1 - y0) * 0.08; y0 -= pad; y1 += pad;
  const sx = (x: number) => padL + ((x - x0) / (x1 - x0 || 1)) * (W - padL - padR);
  const sy = (y: number) => padT + (1 - (y - y0) / (y1 - y0)) * (H - padT - padB);
  // break the line across gaps in years (missing ≠ zero, ≠ interpolated)
  let d = "";
  pts.forEach((p, i) => { const gap = i > 0 && p.x - pts[i - 1].x > 1; d += (i === 0 || gap ? "M" : "L") + sx(p.x).toFixed(1) + " " + sy(p.y).toFixed(1); });
  const last = pts[pts.length - 1];
  const h = hi !== null ? pts[hi] : null;
  const onMove = (clientX: number) => {
    const r = ref.current?.getBoundingClientRect(); if (!r) return;
    const x = x0 + ((clientX - r.left) / r.width * W - padL) / (W - padL - padR) * (x1 - x0);
    let best = 0; pts.forEach((p, i) => { if (Math.abs(p.x - x) < Math.abs(pts[best].x - x)) best = i; });
    setHi(best);
  };
  return (
    <figure className="n-chart">
      <svg ref={ref} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" role="img" aria-labelledby={id}
        onPointerMove={(e) => onMove(e.clientX)} onPointerDown={(e) => onMove(e.clientX)} onPointerLeave={() => setHi(null)}>
        <title id={id}>{label}: {format(pts[0].y)} in {pts[0].x} to {format(last.y)} in {last.x}</title>
        <line className="n-chart__base" x1={padL} x2={W - padR} y1={H - padB} y2={H - padB} />
        <path className="n-chart__line" d={d} vectorEffect="non-scaling-stroke" />
        {h && <line className="n-chart__cross" x1={sx(h.x)} x2={sx(h.x)} y1={padT - 6} y2={H - padB} vectorEffect="non-scaling-stroke" />}
      </svg>
      <span className="n-chart__dot" style={{ left: `${(sx((h ?? last).x) / W) * 100}%`, top: `${(sy((h ?? last).y) / H) * 100}%` }} aria-hidden />
      {h && (
        <span className="n-chart__tip" style={{ left: `${Math.min(82, Math.max(18, (sx(h.x) / W) * 100))}%` }} role="status">
          <b>{format(h.y)}</b><span>{h.x}</span>
        </span>
      )}
      <figcaption className="n-chart__axis"><span>{x0} · {format(pts[0].y)}</span><span>{x1} · {format(last.y)}</span></figcaption>
    </figure>
  );
}

/** Age structure: three ordered shares of one whole — sequential single hue, direct-labelled. */
export function AgeBar({ parts }: { parts: { label: string; value: number }[] }) {
  const total = parts.reduce((s, p) => s + p.value, 0);
  if (!total) return null;
  return (
    <div className="n-agebar">
      <div className="n-agebar__track" role="img" aria-label={parts.map((p) => `${p.label} ${Math.round((p.value / total) * 100)}%`).join(", ")}>
        {parts.map((p, i) => <span key={p.label} className={"n-agebar__seg n-agebar__seg--" + i} style={{ flexGrow: p.value }} />)}
      </div>
      <div className="n-agebar__legend">
        {parts.map((p, i) => (
          <span key={p.label}><i className={"n-agebar__key n-agebar__seg--" + i} aria-hidden />{p.label}<b>{Math.round((p.value / total) * 100)}%</b></span>
        ))}
      </div>
    </div>
  );
}

export function metricPeriod(m?: CountryMetric) { return m?.period; }
