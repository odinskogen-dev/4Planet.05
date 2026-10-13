/**
 * 4NATION Globe — an orthographic illustration of Natural Earth outlines.
 *
 * Not a map engine: no tiles, no data layers, no camera authority. Geographic
 * data exploration happens in the shared 4PLANET ATLAS (Atlas mode). This
 * component only gives a country its sense of place, fast and offline-safe.
 */
import { useEffect, useRef, useState } from "react";
import { loadCountryRings, loadWorld, mainBbox, pointInRing, type LonLat, type Ring } from "./geo";

type Focus = { iso2: string; capital?: LonLat | null; capitalName?: string | null } | null;

interface Props {
  focus: Focus;
  /** Home: slow drift + click to pick. */
  interactive?: boolean;
  onPick?: (iso2: string) => void;
  onHover?: (iso2: string | null) => void;
  /** Re-read colours when the theme changes. */
  theme: string;
  label?: string;
}

const RAD = Math.PI / 180;
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const wrap = (x: number) => ((((x + 180) % 360) + 360) % 360) - 180;

export function Globe({ focus, interactive = false, onPick, onHover, theme, label }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const state = useRef({ lon: 10, lat: 20, zoom: 1, tLon: 10, tLat: 20, tZoom: 1, from: { lon: 10, lat: 20, zoom: 1 }, t0: 0, dur: 0 });
  const world = useRef<{ i: string; r: Ring[] }[] | null>(null);
  const focusRings = useRef<Ring[] | null>(null);
  const hover = useRef<string | null>(null);
  const drag = useRef<{ x: number; y: number; lon: number; lat: number; moved: boolean } | null>(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const reduced = typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => {
    let alive = true;
    loadWorld().then((w) => { if (alive) { world.current = w; setReady(true); } }).catch(() => alive && setFailed(true));
    return () => { alive = false; };
  }, []);

  // Fly to focus.
  useEffect(() => {
    let alive = true;
    const s = state.current;
    const go = (lon: number, lat: number, zoom: number) => {
      s.from = { lon: s.lon, lat: s.lat, zoom: s.zoom };
      s.tLon = s.lon + wrap(lon - s.lon); s.tLat = lat; s.tZoom = zoom;
      s.t0 = performance.now(); s.dur = reduced ? 0 : 1600;
    };
    if (!focus) { focusRings.current = null; go(s.lon, 22, 1); return; }
    loadCountryRings(focus.iso2).then((rings) => {
      if (!alive) return;
      focusRings.current = rings;
      const [a, b, c, d] = mainBbox(rings);
      const lat = (b + d) / 2, lon = (a + c) / 2;
      const span = Math.max((c - a) * Math.cos(lat * RAD), d - b, 1);
      const zoom = Math.max(1.05, Math.min(3.6, 34 / span));
      go(lon, Math.max(-60, Math.min(60, lat)), zoom);
    }).catch(() => { focusRings.current = null; });
    return () => { alive = false; };
  }, [focus?.iso2, reduced]);

  // Render loop.
  useEffect(() => {
    const canvas = canvasRef.current, host = wrapRef.current;
    if (!canvas || !host) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let raf = 0, w = 0, h = 0, dpr = 1;
    const css = getComputedStyle(host);
    const col = (n: string, f: string) => css.getPropertyValue(n).trim() || f;
    const C = {
      line: col("--n-globe-line", "rgba(10,10,10,.28)"), grat: col("--n-globe-grat", "rgba(10,10,10,.08)"),
      limb: col("--n-globe-limb", "rgba(10,10,10,.35)"), accent: col("--n-accent", "#2E2EFF"),
      fill: col("--n-globe-fill", "rgba(46,46,255,.14)"), land: col("--n-globe-land", "rgba(10,10,10,.035)"),
      ink: col("--n-ink", "#0A0A0A"), hover: col("--n-globe-hover", "rgba(46,46,255,.10)"),
    };
    const resize = () => {
      const r = host.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = Math.max(1, r.width); h = Math.max(1, r.height);
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
      canvas.style.width = w + "px"; canvas.style.height = h + "px";
    };
    resize();
    const ro = new ResizeObserver(resize); ro.observe(host);

    const frame = (now: number) => {
      const s = state.current;
      if (s.dur > 0) {
        const t = Math.min(1, (now - s.t0) / s.dur), e = ease(t);
        s.lon = s.from.lon + (s.tLon - s.from.lon) * e; s.lat = s.from.lat + (s.tLat - s.from.lat) * e;
        s.zoom = s.from.zoom * Math.pow(s.tZoom / s.from.zoom, e);
        if (t >= 1) s.dur = 0;
      } else if (s.t0 === 0 || s.dur === 0) {
        s.lon = s.tLon; s.lat = s.tLat; s.zoom = s.tZoom;
        if (interactive && !focus && !drag.current && !reduced) { s.tLon += 0.035; s.lon = s.tLon; }
      }
      draw();
      raf = requestAnimationFrame(frame);
    };

    const draw = () => {
      const s = state.current;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      const R = Math.min(w, h) * 0.44 * s.zoom, cx = w / 2, cy = h / 2;
      const l0 = s.lon * RAD, p0 = s.lat * RAD, sp0 = Math.sin(p0), cp0 = Math.cos(p0);
      const proj = (lon: number, lat: number): [number, number, boolean] => {
        const l = lon * RAD - l0, p = lat * RAD, cp = Math.cos(p), sp = Math.sin(p), cl = Math.cos(l);
        const cosc = sp0 * sp + cp0 * cp * cl;
        let x = cp * Math.sin(l), y = cp0 * sp - sp0 * cp * cl;
        if (cosc < 0) { const n = Math.hypot(x, y) || 1; x /= n; y /= n; }
        return [cx + x * R, cy - y * R, cosc >= 0];
      };
      const path = (ring: Ring) => {
        let started = false, anyVisible = false;
        for (let i = 0; i < ring.length; i++) {
          const [x, y, v] = proj(ring[i][0], ring[i][1]);
          if (v) anyVisible = true;
          if (!started) { ctx.moveTo(x, y); started = true; } else ctx.lineTo(x, y);
        }
        ctx.closePath();
        return anyVisible;
      };
      // sphere
      ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.strokeStyle = C.limb; ctx.lineWidth = 1; ctx.stroke();
      ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.clip();
      // graticule
      ctx.beginPath();
      for (let lon = -180; lon < 180; lon += 15) { let pen = false; for (let lat = -90; lat <= 90; lat += 3) { const [x, y, v] = proj(lon, lat); if (v) { pen ? ctx.lineTo(x, y) : ctx.moveTo(x, y); pen = true; } else pen = false; } }
      for (let lat = -75; lat <= 75; lat += 15) { let pen = false; for (let lon = -180; lon <= 180; lon += 3) { const [x, y, v] = proj(lon, lat); if (v) { pen ? ctx.lineTo(x, y) : ctx.moveTo(x, y); pen = true; } else pen = false; } }
      ctx.strokeStyle = C.grat; ctx.lineWidth = 0.75; ctx.stroke();
      // land
      const wd = world.current;
      if (wd) {
        for (const shape of wd) {
          const isFocus = focus && shape.i === focus.iso2 && focusRings.current;
          if (isFocus) continue;
          ctx.beginPath();
          let vis = false;
          for (const r of shape.r) vis = path(r) || vis;
          if (!vis) continue;
          ctx.fillStyle = hover.current && shape.i === hover.current ? C.hover : C.land; ctx.fill();
          ctx.strokeStyle = C.line; ctx.lineWidth = 0.6; ctx.stroke();
        }
      }
      // focus country (1:50m)
      if (focus && focusRings.current) {
        ctx.beginPath();
        for (const r of focusRings.current) path(r);
        ctx.fillStyle = C.fill; ctx.fill();
        ctx.strokeStyle = C.accent; ctx.lineWidth = 1.4; ctx.lineJoin = "round"; ctx.stroke();
      }
      ctx.restore();
      // capital
      if (focus?.capital && state.current.dur === 0) {
        const [x, y, v] = proj(focus.capital[0], focus.capital[1]);
        if (v) {
          ctx.beginPath(); ctx.arc(x, y, 3.5, 0, Math.PI * 2); ctx.fillStyle = C.accent; ctx.fill();
          ctx.beginPath(); ctx.arc(x, y, 9, 0, Math.PI * 2); ctx.strokeStyle = C.accent; ctx.lineWidth = 1; ctx.stroke();
          if (focus.capitalName) {
            ctx.font = '500 10px "Fragment Mono", ui-monospace, monospace';
            ctx.fillStyle = C.ink; ctx.textBaseline = "middle";
            ctx.fillText(focus.capitalName.toUpperCase(), x + 14, y);
          }
        }
      }
    };

    raf = requestAnimationFrame(frame);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, [theme, ready, focus?.iso2, focus?.capitalName, interactive, reduced]);

  // Pointer: drag to rotate, click to pick (home).
  const lonLatAt = (clientX: number, clientY: number): LonLat | null => {
    const host = wrapRef.current; if (!host) return null;
    const r = host.getBoundingClientRect(), s = state.current;
    const R = Math.min(r.width, r.height) * 0.44 * s.zoom;
    const x = (clientX - r.left - r.width / 2) / R, y = -(clientY - r.top - r.height / 2) / R;
    const rho = Math.hypot(x, y); if (rho > 1) return null;
    const c = Math.asin(rho), sc = Math.sin(c), cc = Math.cos(c), p0 = s.lat * RAD;
    const lat = Math.asin(cc * Math.sin(p0) + (rho ? (y * sc * Math.cos(p0)) / rho : 0));
    const lon = s.lon * RAD + Math.atan2(x * sc, rho * Math.cos(p0) * cc - y * Math.sin(p0) * sc);
    return [wrap(lon / RAD), lat / RAD];
  };
  const pick = (ll: LonLat | null) => {
    if (!ll || !world.current) return null;
    for (const s of world.current) if (s.i && s.r.some((r) => pointInRing(ll, r))) return s.i;
    return null;
  };

  return (
    <div
      ref={wrapRef}
      className={"n-globe" + (interactive ? " n-globe--interactive" : "")}
      role="img"
      aria-label={label ?? "Globe"}
      onPointerDown={(e) => { const s = state.current; drag.current = { x: e.clientX, y: e.clientY, lon: s.lon, lat: s.lat, moved: false }; (e.target as HTMLElement).setPointerCapture?.(e.pointerId); }}
      onPointerMove={(e) => {
        const d = drag.current, s = state.current;
        if (d) {
          const dx = e.clientX - d.x, dy = e.clientY - d.y;
          if (Math.abs(dx) + Math.abs(dy) > 4) d.moved = true;
          if (d.moved) { const k = 0.35 / s.zoom; s.tLon = s.lon = d.lon - dx * k; s.tLat = s.lat = Math.max(-80, Math.min(80, d.lat + dy * k)); s.dur = 0; }
        } else if (interactive && e.pointerType === "mouse") {
          const id = pick(lonLatAt(e.clientX, e.clientY));
          if (id !== hover.current) { hover.current = id; onHover?.(id); }
        }
      }}
      onPointerUp={(e) => { const d = drag.current; drag.current = null; if (d && !d.moved && interactive) { const id = pick(lonLatAt(e.clientX, e.clientY)); if (id) onPick?.(id); } }}
      onPointerLeave={() => { if (hover.current) { hover.current = null; onHover?.(null); } }}
    >
      <canvas ref={canvasRef} />
      {failed && <p className="n-globe__fail" role="status">Outline data unavailable.</p>}
    </div>
  );
}
