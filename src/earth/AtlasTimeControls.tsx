import { useEffect, useMemo, useState } from "react";
import { ATLAS_TIME_AXES, atlasLeadingTileUrl } from "./atlasLeadingExtensions";

const STORAGE_KEY = "4planet.atlas.time.v1";
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

export default function AtlasTimeControls() {
  const [open, setOpen] = useState(false);
  const [activeIds, setActiveIds] = useState<string[]>([]);
  const [selected, setSelected] = useState<Record<string, string>>(() => {
    const stored = typeof window === "undefined" ? {} : readStored();
    return Object.fromEntries(ATLAS_TIME_AXES.map((axis) => [axis.layerId, stored[axis.layerId] || axis.defaultValue]));
  });

  useEffect(() => {
    const readActive = () => {
      const map = atlasMap();
      if (!map) return;
      const next = ATLAS_TIME_AXES.filter((axis) => Boolean(map.getSource(axis.layerId))).map((axis) => axis.layerId);
      setActiveIds((current) => current.join("|") === next.join("|") ? current : next);
    };
    readActive();
    const timer = window.setInterval(readActive, 600);
    return () => window.clearInterval(timer);
  }, []);

  const activeAxes = useMemo(() => ATLAS_TIME_AXES.filter((axis) => activeIds.includes(axis.layerId)), [activeIds]);

  const apply = (layerId: string, value: string) => {
    const source = atlasMap()?.getSource(layerId);
    if (!source?.setTiles) return;
    source.setTiles([atlasLeadingTileUrl(layerId, value)]);
    const next = { ...selected, [layerId]: value };
    setSelected(next);
    store(next);
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
              <div className="atlas-leading-time-meta"><strong>{axis.label}</strong><span>{axis.semantic.replace(/_/g, " ")}</span></div>
              <div className="atlas-leading-time-options">
                {axis.options.map((option) => (
                  <button key={option.value} className={selected[axis.layerId] === option.value ? "on" : ""} onClick={() => apply(axis.layerId, option.value)}>
                    {option.label}
                  </button>
                ))}
              </div>
              <p>{axis.explanation}</p>
            </section>
          ))}
        </div>
      )}
    </aside>
  );
}
