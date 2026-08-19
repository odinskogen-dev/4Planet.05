import { useEffect, useMemo, useState } from "react";
import { wmsRasterTileUrl } from "@/sandbox/atlasDataSources";
import {
  ATLAS_TIME_AXES,
  readStoredAtlasTime,
  storeAtlasTime,
  type AtlasTimeAxis,
} from "@/sandbox/atlasTimeEngine";

type AtlasMap = {
  getSource: (id: string) => any;
};

declare global {
  interface Window { __4planet_map?: AtlasMap }
}

function optionLabel(axis: AtlasTimeAxis, value: string) {
  return axis.options.find((option) => option.value === value)?.label || value;
}

export default function AtlasTimeControls() {
  const [open, setOpen] = useState(false);
  const [activeIds, setActiveIds] = useState<string[]>([]);
  const [selected, setSelected] = useState<Record<string, string>>(() => {
    const stored = readStoredAtlasTime();
    return Object.fromEntries(ATLAS_TIME_AXES.map((axis) => [axis.layerId, stored[axis.layerId] || axis.defaultValue]));
  });

  useEffect(() => {
    const readActive = () => {
      const map = window.__4planet_map;
      if (!map) return;
      const next = ATLAS_TIME_AXES.filter((axis) => !!map.getSource(axis.layerId)).map((axis) => axis.layerId);
      setActiveIds((current) => current.join("|") === next.join("|") ? current : next);
    };
    readActive();
    const timer = window.setInterval(readActive, 500);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    // A scene may mount an admitted temporal source after this control first
    // renders. Re-apply the persisted/default selection once the source exists.
    const map = window.__4planet_map;
    if (!map) return;
    for (const axis of ATLAS_TIME_AXES) {
      if (!activeIds.includes(axis.layerId)) continue;
      const source = map.getSource(axis.layerId);
      if (!source?.setTiles) continue;
      source.setTiles([wmsRasterTileUrl(axis.descriptor, { time: selected[axis.layerId] || axis.defaultValue })]);
    }
    storeAtlasTime(selected);
  }, [activeIds]);

  const activeAxes = useMemo(
    () => ATLAS_TIME_AXES.filter((axis) => activeIds.includes(axis.layerId)),
    [activeIds],
  );

  const apply = (axis: AtlasTimeAxis, value: string) => {
    const map = window.__4planet_map;
    const source = map?.getSource(axis.layerId);
    if (!source?.setTiles) return;
    source.setTiles([wmsRasterTileUrl(axis.descriptor, { time: value })]);
    const next = { ...selected, [axis.layerId]: value };
    setSelected(next);
    storeAtlasTime(next);
  };

  if (!activeAxes.length) return null;

  const summary = activeAxes.length === 1
    ? optionLabel(activeAxes[0], selected[activeAxes[0].layerId] || activeAxes[0].defaultValue)
    : `${activeAxes.length} AXES`;

  return (
    <aside className={`atlas-time ${open ? "open" : ""}`} aria-label="ATLAS time controls">
      <button className="atlas-time-toggle" onClick={() => setOpen((value) => !value)} aria-expanded={open}>
        <span>TIME</span><strong>{summary}</strong><span>{open ? "−" : "+"}</span>
      </button>
      {open && (
        <div className="atlas-time-body">
          {activeAxes.map((axis) => {
            const value = selected[axis.layerId] || axis.defaultValue;
            const selectedOption = axis.options.find((option) => option.value === value);
            return (
              <section className="atlas-time-axis" key={axis.layerId}>
                <div className="atlas-time-meta">
                  <span>{axis.label}</span>
                  <span>{axis.semantic.replace(/_/g, " ")}</span>
                </div>
                <div className="atlas-time-options" role="group" aria-label={`${axis.label} time`}>
                  {axis.options.map((option) => (
                    <button
                      key={option.value}
                      className={option.value === value ? "on" : ""}
                      onClick={() => apply(axis, option.value)}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
                <p>{axis.explanation}</p>
                {selectedOption?.caveat && <p className="atlas-time-caveat">{selectedOption.caveat}</p>}
              </section>
            );
          })}
        </div>
      )}
    </aside>
  );
}
