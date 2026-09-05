import { useEffect, useMemo, useRef, useState } from "react";
import { ATLAS_TIME_AXES, atlasLeadingTileUrl, type AtlasTimeAxis } from "./atlasLeadingExtensions";

const STORAGE_KEY = "4planet.atlas.time.v1";
const URL_KEY = "atlasTime";

function atlasMap(): any {
  return typeof window === "undefined" ? null : (window as any).__4planet_map;
}

function readStored() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}"); }
  catch { return {}; }
}

function store(value: Record<string, string>) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(value)); } catch { /* localStorage optional */ }
}

function isAllowed(axis: AtlasTimeAxis, value: unknown): value is string {
  return typeof value === "string" && axis.options.some((option) => option.value === value);
}

function readUrlTime() {
  if (typeof window === "undefined") return {};
  const raw = new URLSearchParams(window.location.search).get(URL_KEY);
  if (!raw) return {};
  const parsed: Record<string, string> = {};
  for (const entry of raw.split(",")) {
    const split = entry.indexOf(":");
    if (split <= 0) continue;
    const layerId = entry.slice(0, split);
    const value = entry.slice(split + 1);
    const axis = ATLAS_TIME_AXES.find((item) => item.layerId === layerId);
    if (axis && isAllowed(axis, value)) parsed[layerId] = value;
  }
  return parsed;
}

function writeUrlTime(selected: Record<string, string>) {
  if (typeof window === "undefined") return;
  const params = new URLSearchParams(window.location.search);
  const entries = ATLAS_TIME_AXES
    .map((axis) => [axis.layerId, selected[axis.layerId]] as const)
    .filter(([layerId, value]) => {
      const axis = ATLAS_TIME_AXES.find((item) => item.layerId === layerId);
      return axis && value && isAllowed(axis, value) && value !== axis.defaultValue;
    })
    .map(([layerId, value]) => `${layerId}:${value}`);
  if (entries.length) params.set(URL_KEY, entries.join(","));
  else params.delete(URL_KEY);
  const query = params.toString();
  window.history.replaceState(null, "", `${window.location.pathname}${query ? `?${query}` : ""}${window.location.hash}`);
}

function optionLabel(axis: AtlasTimeAxis, value: string, fallback: string) {
  if (axis.semantic !== "MONTH_CLIMATOLOGY") return fallback;
  const month = Number(value);
  if (!Number.isFinite(month) || month < 1 || month > 12) return fallback;
  return new Intl.DateTimeFormat("en", { month: "short", timeZone: "UTC" })
    .format(new Date(Date.UTC(2020, month - 1, 1)));
}

export default function AtlasTimeControls() {
  const [open, setOpen] = useState(false);
  const [activeIds, setActiveIds] = useState<string[]>([]);
  const applied = useRef(new Map<string, string>());
  const [selected, setSelected] = useState<Record<string, string>>(() => {
    const stored = typeof window === "undefined" ? {} : readStored();
    const fromUrl = readUrlTime();
    return Object.fromEntries(ATLAS_TIME_AXES.map((axis) => {
      const candidate = fromUrl[axis.layerId] ?? stored[axis.layerId];
      return [axis.layerId, isAllowed(axis, candidate) ? candidate : axis.defaultValue];
    }));
  });

  useEffect(() => {
    const readActive = () => {
      const map = atlasMap();
      if (!map) return;
      const next = ATLAS_TIME_AXES.filter((axis) => Boolean(map.getSource(axis.layerId))).map((axis) => axis.layerId);
      for (const axis of ATLAS_TIME_AXES) {
        if (!next.includes(axis.layerId)) applied.current.delete(axis.layerId);
      }
      setActiveIds((current) => current.join("|") === next.join("|") ? current : next);
    };
    readActive();
    const timer = window.setInterval(readActive, 600);
    return () => window.clearInterval(timer);
  }, []);

  const activeAxes = useMemo(() => ATLAS_TIME_AXES.filter((axis) => activeIds.includes(axis.layerId)), [activeIds]);

  useEffect(() => {
    const map = atlasMap();
    if (!map) return;
    for (const axis of activeAxes) {
      const value = selected[axis.layerId] || axis.defaultValue;
      const source = map.getSource(axis.layerId);
      if (!source?.setTiles || applied.current.get(axis.layerId) === value) continue;
      source.setTiles([atlasLeadingTileUrl(axis.layerId, value)]);
      applied.current.set(axis.layerId, value);
    }
  }, [activeAxes, selected]);

  // World owns the main camera/layer URL and rewrites it after move/idle. Keep
  // the bounded TIME fragment attached after those writes so a shared discovery
  // cannot silently drift to another provider slice after the user pans/zooms.
  // We bind only while a recovered time-aware layer is active; no second URL
  // authority or map state machine is introduced.
  useEffect(() => {
    if (!activeAxes.length) return;
    const map = atlasMap();
    if (!map?.on || !map?.off) return;
    const sync = () => writeUrlTime(selected);
    map.on("moveend", sync);
    map.on("idle", sync);
    sync();
    return () => {
      map.off("moveend", sync);
      map.off("idle", sync);
    };
  }, [activeAxes.length, selected]);

  const apply = (layerId: string, value: string) => {
    const axis = ATLAS_TIME_AXES.find((item) => item.layerId === layerId);
    if (!axis || !isAllowed(axis, value)) return;
    const source = atlasMap()?.getSource(layerId);
    if (!source?.setTiles) return;
    source.setTiles([atlasLeadingTileUrl(layerId, value)]);
    applied.current.set(layerId, value);
    const next = { ...selected, [layerId]: value };
    setSelected(next);
    store(next);
    writeUrlTime(next);
  };

  if (!activeAxes.length) return null;

  return (
    <aside className={`atlas-leading-time ${open ? "open" : ""}`} aria-label="ATLAS time controls">
      <button className="atlas-leading-time-toggle" onClick={() => setOpen((value) => !value)} aria-expanded={open}>
        <span>TIME</span><span>{open ? "−" : "+"}</span>
      </button>
      {open && (
        <div className="atlas-leading-time-body">
          {activeAxes.map((axis) => (
            <section key={axis.layerId}>
              <div className="atlas-leading-time-meta">
                <strong>{axis.label}</strong>
                <span>{axis.semantic === "MONTH_CLIMATOLOGY" ? "MONTHLY CLIMATOLOGY" : "YEAR"}</span>
              </div>
              <div className="atlas-leading-time-options">
                {axis.options.map((option) => (
                  <button key={option.value} className={selected[axis.layerId] === option.value ? "on" : ""} onClick={() => apply(axis.layerId, option.value)}>
                    {optionLabel(axis, option.value, option.label)}
                  </button>
                ))}
              </div>
              <p>{axis.explanation}</p>
            </section>
          ))}
          <p>Time choices are included in the ATLAS link when you share this view.</p>
        </div>
      )}
    </aside>
  );
}
