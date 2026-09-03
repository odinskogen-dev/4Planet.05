import { useEffect, useState, type CSSProperties } from "react";

type SourceState = "inactive" | "zoom_required" | "loading" | "live" | "empty" | "stale" | "unavailable";
type InspectorRecord = {
  kind: "FIRMS" | "INATURALIST";
  title: string;
  subtitle: string;
  when: string;
  where: string;
  source: string;
  known: string;
  unknown: string;
  sourceUrl?: string;
};

type FeatureCollection = { type: "FeatureCollection"; features: any[] };

const EMPTY: FeatureCollection = { type: "FeatureCollection", features: [] };
const FIRMS_SOURCE = "atlas-firms-records";
const FIRMS_CLUSTER = "atlas-firms-records-clusters";
const FIRMS_COUNT = "atlas-firms-records-count";
const FIRMS_POINT = "atlas-firms-records-point";
const INAT_SOURCE = "atlas-inat-records";
const INAT_CLUSTER = "atlas-inat-records-clusters";
const INAT_COUNT = "atlas-inat-records-count";
const INAT_POINT = "atlas-inat-records-point";

const SOURCE_IDS = [FIRMS_SOURCE, INAT_SOURCE] as const;
const LAYER_IDS = [FIRMS_CLUSTER, FIRMS_COUNT, FIRMS_POINT, INAT_CLUSTER, INAT_COUNT, INAT_POINT] as const;

const mono: CSSProperties = {
  fontFamily: "'Fragment Mono', ui-monospace, monospace",
  fontSize: 10,
  letterSpacing: ".08em",
};

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));
const fmtCoord = (value: number) => Number.isFinite(value) ? value.toFixed(4) : "UNKNOWN";

function currentParams() {
  return new URLSearchParams(window.location.search);
}

function layerRequested(id: string) {
  const explicit = (currentParams().get("l") || "").split(",").filter(Boolean);
  return explicit.includes(id);
}

function currentGbifTaxonKey() {
  const entity = currentParams().get("entity") || currentParams().get("f") || "";
  const match = /^taxon:gbif:(\d+)$/.exec(entity);
  return match ? match[1] : "";
}

function safeBbox(map: any) {
  try {
    const bounds = map.getBounds?.();
    if (!bounds) return null;
    const west = clamp(Number(bounds.getWest?.()), -180, 180);
    const south = clamp(Number(bounds.getSouth?.()), -90, 90);
    const east = clamp(Number(bounds.getEast?.()), -180, 180);
    const north = clamp(Number(bounds.getNorth?.()), -90, 90);
    if (![west, south, east, north].every(Number.isFinite)) return null;
    if (west >= east || south >= north) return null;
    if (east - west > 80 || north - south > 50) return null;
    return [west, south, east, north] as [number, number, number, number];
  } catch {
    return null;
  }
}

function ensureClusteredPoints(map: any, sourceId: string, clusterId: string, countId: string, pointId: string, data: FeatureCollection, color: string) {
  const source = map.getSource?.(sourceId);
  if (source?.setData) source.setData(data);
  else map.addSource(sourceId, {
    type: "geojson",
    data,
    cluster: true,
    clusterRadius: 42,
    clusterMaxZoom: 10,
  });

  if (!map.getLayer?.(clusterId)) {
    map.addLayer({
      id: clusterId,
      type: "circle",
      source: sourceId,
      filter: ["has", "point_count"],
      paint: {
        "circle-color": color,
        "circle-opacity": 0.78,
        "circle-stroke-color": "rgba(255,255,255,.82)",
        "circle-stroke-width": 1,
        "circle-radius": ["step", ["get", "point_count"], 13, 20, 17, 80, 22, 250, 28],
      },
    });
  }

  if (!map.getLayer?.(countId)) {
    map.addLayer({
      id: countId,
      type: "symbol",
      source: sourceId,
      filter: ["has", "point_count"],
      layout: {
        "text-field": ["get", "point_count_abbreviated"],
        "text-size": 10,
        "text-allow-overlap": true,
      },
      paint: { "text-color": "#fff" },
    });
  }

  if (!map.getLayer?.(pointId)) {
    map.addLayer({
      id: pointId,
      type: "circle",
      source: sourceId,
      filter: ["!", ["has", "point_count"]],
      paint: {
        "circle-color": color,
        "circle-opacity": 0.88,
        "circle-radius": ["interpolate", ["linear"], ["zoom"], 4, 3.2, 8, 4.4, 13, 6.2],
        "circle-stroke-color": "rgba(255,255,255,.92)",
        "circle-stroke-width": 1,
      },
    });
  }
}

function removeSourceFamily(map: any, sourceId: string, layerIds: string[]) {
  for (const id of [...layerIds].reverse()) {
    try { if (map.getLayer?.(id)) map.removeLayer(id); } catch { /* style transition */ }
  }
  try { if (map.getSource?.(sourceId)) map.removeSource(sourceId); } catch { /* style transition */ }
}

function fitCluster(map: any, sourceId: string, event: any) {
  const feature = event?.features?.[0];
  const clusterId = feature?.properties?.cluster_id;
  const source = map.getSource?.(sourceId);
  if (!feature || clusterId == null || !source?.getClusterExpansionZoom) return;
  source.getClusterExpansionZoom(clusterId, (error: unknown, zoom: number) => {
    if (error) return;
    const coordinates = feature.geometry?.coordinates;
    if (!Array.isArray(coordinates)) return;
    map.easeTo?.({ center: coordinates, zoom: Math.min(zoom, 13), duration: 520 });
  });
}

function stopMapClick(event: any) {
  try { event?.originalEvent?.preventDefault?.(); } catch { /* no-op */ }
  try { event?.originalEvent?.stopPropagation?.(); } catch { /* no-op */ }
}

function closeAccidentalCoordinatePanel() {
  window.requestAnimationFrame(() => {
    const panel = document.querySelector<HTMLElement>(".ctx");
    const kind = panel?.querySelector<HTMLElement>(".ctx-kind")?.textContent || "";
    if (!/COORDINATE/i.test(kind)) return;
    panel?.querySelector<HTMLButtonElement>(".ctx-close")?.click();
  });
}

function publicStatusText(source: "FIRMS" | "INAT", state: SourceState, count: number) {
  if (source === "FIRMS") {
    if (state === "unavailable") return "FIRMS DETAIL UNAVAILABLE · GLOBAL NASA FIRE CONTEXT REMAINS VISIBLE";
    if (state === "stale") return `FIRMS DETAIL · ${count} LAST-GOOD DETECTIONS · SOURCE REFRESH UNAVAILABLE`;
    if (state === "empty") return "FIRMS · NO DETECTIONS RETURNED FOR THIS VIEW · NOT PROOF OF NO FIRE";
  }
  if (source === "INAT") {
    if (state === "unavailable") return "iNATURALIST OBSERVATIONS UNAVAILABLE · NO ABSENCE HAS BEEN INFERRED";
    if (state === "stale") return `iNATURALIST · ${count} LAST-GOOD OBSERVATIONS · SOURCE REFRESH UNAVAILABLE`;
    if (state === "empty") return "iNATURALIST · NO RECORDS RETURNED · NOT PROOF OF SPECIES ABSENCE";
  }
  return "";
}

/**
 * Human Gold evidence bridge.
 *
 * This is deliberately a bounded sidecar over the one existing ATLAS MapLibre
 * engine. It does not create a second map, search surface, truth store or layer
 * registry. It activates record-level depth only when the current human journey
 * calls for it:
 *   - FIRMS/VIIRS detections refine the existing ACTIVE FIRES layer at regional
 *     and local zoom.
 *   - iNaturalist research-grade observations refine the currently selected GBIF
 *     taxon after exact scientific-name resolution.
 *
 * Source failure is explicit, last-good data may remain marked STALE, and empty
 * query results are never described as ecological absence.
 */
export function AtlasLiveEvidenceBridge() {
  const [inspector, setInspector] = useState<InspectorRecord | null>(null);
  const [firmsState, setFirmsState] = useState<SourceState>("inactive");
  const [inatState, setInatState] = useState<SourceState>("inactive");
  const [firmsCount, setFirmsCount] = useState(0);
  const [inatCount, setInatCount] = useState(0);

  useEffect(() => {
    let disposed = false;
    let map: any = null;
    let attachFrame = 0;
    let refreshTimer = 0;
    let pollTimer = 0;
    let firmsController: AbortController | null = null;
    let inatController: AbortController | null = null;
    let lastFirmsKey = "";
    let lastTaxonKey = "";
    let firmsData: FeatureCollection = EMPTY;
    let inatData: FeatureCollection = EMPTY;
    let handlersBound = false;

    const root = document.documentElement;
    const reflect = (source: "firms" | "inat", state: SourceState, count: number) => {
      root.dataset[source === "firms" ? "atlasFirmsRecordState" : "atlasInatRecordState"] = state;
      root.dataset[source === "firms" ? "atlasFirmsRecordCount" : "atlasInatRecordCount"] = String(count);
    };

    const setFirms = (state: SourceState, count = firmsData.features.length) => {
      setFirmsState(state);
      setFirmsCount(count);
      reflect("firms", state, count);
    };

    const setInat = (state: SourceState, count = inatData.features.length) => {
      setInatState(state);
      setInatCount(count);
      reflect("inat", state, count);
    };

    const renderFirms = () => {
      if (!map || !firmsData.features.length) return;
      try { ensureClusteredPoints(map, FIRMS_SOURCE, FIRMS_CLUSTER, FIRMS_COUNT, FIRMS_POINT, firmsData, "#FF4D22"); } catch { /* next style event retries */ }
    };

    const renderInat = () => {
      if (!map || !inatData.features.length) return;
      try { ensureClusteredPoints(map, INAT_SOURCE, INAT_CLUSTER, INAT_COUNT, INAT_POINT, inatData, "#3AE86F"); } catch { /* next style event retries */ }
    };

    const bindHandlers = () => {
      if (!map || handlersBound) return;
      handlersBound = true;

      map.on?.("click", FIRMS_CLUSTER, (event: any) => { stopMapClick(event); fitCluster(map, FIRMS_SOURCE, event); });
      map.on?.("click", INAT_CLUSTER, (event: any) => { stopMapClick(event); fitCluster(map, INAT_SOURCE, event); });

      map.on?.("click", FIRMS_POINT, (event: any) => {
        stopMapClick(event);
        const feature = event?.features?.[0];
        if (!feature) return;
        const p = feature.properties || {};
        const c = feature.geometry?.coordinates || [];
        setInspector({
          kind: "FIRMS",
          title: "Satellite thermal detection",
          subtitle: [p.instrument, p.satellite, p.frpMw ? `${p.frpMw} MW FRP` : ""].filter(Boolean).join(" · "),
          when: p.when || "TIME NOT REPORTED",
          where: `${fmtCoord(Number(c[1]))}, ${fmtCoord(Number(c[0]))}`,
          source: `NASA FIRMS · ${p.sourceProduct || "VIIRS NRT"}`,
          known: "A satellite sensor reported a thermal anomaly at the public coordinate and acquisition time shown here.",
          unknown: "This record alone does not prove wildfire cause, burned area, ecological impact or ground truth.",
          sourceUrl: "https://firms.modaps.eosdis.nasa.gov/",
        });
        closeAccidentalCoordinatePanel();
      });

      map.on?.("click", INAT_POINT, (event: any) => {
        stopMapClick(event);
        const feature = event?.features?.[0];
        if (!feature) return;
        const p = feature.properties || {};
        const c = feature.geometry?.coordinates || [];
        setInspector({
          kind: "INATURALIST",
          title: p.commonName || p.scientificName || "Species observation",
          subtitle: [p.scientificName, p.qualityGrade ? `${String(p.qualityGrade).toUpperCase()} GRADE` : ""].filter(Boolean).join(" · "),
          when: p.observedAt || "DATE NOT REPORTED",
          where: `${fmtCoord(Number(c[1]))}, ${fmtCoord(Number(c[0]))}${p.positionalAccuracyM ? ` · ±${p.positionalAccuracyM} m` : ""}`,
          source: `iNaturalist · observation ${p.recordId || "record"}`,
          known: "iNaturalist returned a public occurrence record for the exactly resolved taxon. The point uses only the public coordinate supplied by the provider.",
          unknown: "An occurrence record is not range, abundance, population trend, live tracking or proof that the species is currently at this location.",
          sourceUrl: p.sourceUrl || undefined,
        });
        closeAccidentalCoordinatePanel();
      });

      for (const id of [FIRMS_CLUSTER, FIRMS_POINT, INAT_CLUSTER, INAT_POINT]) {
        map.on?.("mouseenter", id, () => { try { map.getCanvas().style.cursor = "pointer"; } catch { /* no-op */ } });
        map.on?.("mouseleave", id, () => { try { map.getCanvas().style.cursor = ""; } catch { /* no-op */ } });
      }
    };

    const loadFirms = async () => {
      if (!map) return;
      if (!layerRequested("fires")) {
        firmsController?.abort();
        lastFirmsKey = "";
        firmsData = EMPTY;
        removeSourceFamily(map, FIRMS_SOURCE, [FIRMS_CLUSTER, FIRMS_COUNT, FIRMS_POINT]);
        setFirms("inactive", 0);
        return;
      }

      const zoom = Number(map.getZoom?.() || 0);
      const bbox = safeBbox(map);
      if (zoom < 4.4 || !bbox) {
        firmsController?.abort();
        removeSourceFamily(map, FIRMS_SOURCE, [FIRMS_CLUSTER, FIRMS_COUNT, FIRMS_POINT]);
        setFirms("zoom_required", firmsData.features.length);
        return;
      }

      const rounded = bbox.map((value) => Number(value.toFixed(2)));
      const key = rounded.join(",");
      if (key === lastFirmsKey && firmsData.features.length) {
        renderFirms();
        return;
      }
      lastFirmsKey = key;
      firmsController?.abort();
      firmsController = new AbortController();
      setFirms("loading", firmsData.features.length);

      try {
        const response = await fetch(`/api/firms?bbox=${rounded.join(",")}&dayRange=1&source=VIIRS_NOAA20_NRT`, { signal: firmsController.signal });
        const data = await response.json();
        if (!response.ok || !data?.ok || !Array.isArray(data.records)) throw new Error(data?.error || `HTTP_${response.status}`);
        firmsData = {
          type: "FeatureCollection",
          features: data.records.map((record: any, index: number) => ({
            type: "Feature",
            id: `firms-${index}-${record.longitude}-${record.latitude}`,
            geometry: { type: "Point", coordinates: [record.longitude, record.latitude] },
            properties: {
              kind: "FIRMS",
              sourceProduct: data.source,
              acquiredDate: record.acquiredDate || "",
              acquiredTimeUtc: record.acquiredTimeUtc || "",
              when: [record.acquiredDate, record.acquiredTimeUtc ? `${record.acquiredTimeUtc} UTC` : ""].filter(Boolean).join(" · "),
              satellite: record.satellite || "",
              instrument: record.instrument || "VIIRS",
              confidence: record.confidence || "",
              frpMw: record.frpMw ?? "",
              dayNight: record.dayNight || "",
            },
          })),
        };
        removeSourceFamily(map, FIRMS_SOURCE, [FIRMS_CLUSTER, FIRMS_COUNT, FIRMS_POINT]);
        if (firmsData.features.length) renderFirms();
        setFirms(firmsData.features.length ? "live" : "empty", firmsData.features.length);
      } catch (error: any) {
        if (error?.name === "AbortError" || disposed) return;
        if (firmsData.features.length) {
          renderFirms();
          setFirms("stale", firmsData.features.length);
        } else {
          removeSourceFamily(map, FIRMS_SOURCE, [FIRMS_CLUSTER, FIRMS_COUNT, FIRMS_POINT]);
          setFirms("unavailable", 0);
        }
      }
    };

    const loadInat = async () => {
      if (!map) return;
      const gbifKey = currentGbifTaxonKey();
      if (!gbifKey) {
        inatController?.abort();
        lastTaxonKey = "";
        inatData = EMPTY;
        removeSourceFamily(map, INAT_SOURCE, [INAT_CLUSTER, INAT_COUNT, INAT_POINT]);
        setInat("inactive", 0);
        delete root.dataset.atlasInatTaxon;
        return;
      }

      if (gbifKey === lastTaxonKey && inatData.features.length) {
        renderInat();
        return;
      }
      lastTaxonKey = gbifKey;
      inatController?.abort();
      inatController = new AbortController();
      setInat("loading", inatData.features.length);

      try {
        const gbifResponse = await fetch(`https://api.gbif.org/v1/species/${encodeURIComponent(gbifKey)}`, { signal: inatController.signal });
        const gbif = await gbifResponse.json();
        const scientificName = String(gbif?.canonicalName || gbif?.scientificName || "").trim();
        if (!gbifResponse.ok || !scientificName) throw new Error("GBIF_TAXON_RESOLUTION_FAILED");
        root.dataset.atlasInatTaxon = scientificName;

        const response = await fetch(`/api/inaturalist?q=${encodeURIComponent(scientificName)}&perPage=80&quality=research`, { signal: inatController.signal });
        const data = await response.json();
        if (!response.ok || !data?.ok || !Array.isArray(data.records)) throw new Error(data?.error || `HTTP_${response.status}`);
        inatData = {
          type: "FeatureCollection",
          features: data.records
            .filter((record: any) => record?.publicCoordinates && Number.isFinite(record.publicCoordinates.longitude) && Number.isFinite(record.publicCoordinates.latitude))
            .map((record: any) => ({
              type: "Feature",
              id: `inat-${record.id}`,
              geometry: { type: "Point", coordinates: [record.publicCoordinates.longitude, record.publicCoordinates.latitude] },
              properties: {
                kind: "INATURALIST",
                recordId: record.id || "",
                sourceUrl: record.sourceUrl || "",
                scientificName: record.taxon?.name || scientificName,
                commonName: record.taxon?.preferredCommonName || "",
                observedAt: record.observedAt || "",
                qualityGrade: record.qualityGrade || "",
                positionalAccuracyM: record.positionalAccuracyM ?? "",
                geoprivacy: record.geoprivacy || "",
                observationLicence: record.observationLicence || "",
              },
            })),
        };
        removeSourceFamily(map, INAT_SOURCE, [INAT_CLUSTER, INAT_COUNT, INAT_POINT]);
        if (inatData.features.length) renderInat();
        setInat(inatData.features.length ? "live" : "empty", inatData.features.length);
      } catch (error: any) {
        if (error?.name === "AbortError" || disposed) return;
        if (inatData.features.length) {
          renderInat();
          setInat("stale", inatData.features.length);
        } else {
          removeSourceFamily(map, INAT_SOURCE, [INAT_CLUSTER, INAT_COUNT, INAT_POINT]);
          setInat("unavailable", 0);
        }
      }
    };

    const refresh = () => {
      if (disposed || !map) return;
      if (refreshTimer) window.clearTimeout(refreshTimer);
      refreshTimer = window.setTimeout(() => {
        void loadFirms();
        void loadInat();
      }, 180);
    };

    const onStyle = () => {
      window.setTimeout(() => {
        renderFirms();
        renderInat();
        refresh();
      }, 80);
    };

    const attach = () => {
      if (disposed) return;
      map = (window as any).__4planet_map;
      if (!map?.on) {
        attachFrame = window.requestAnimationFrame(attach);
        return;
      }
      bindHandlers();
      map.on("moveend", refresh);
      map.on("zoomend", refresh);
      map.on("style.load", onStyle);
      window.addEventListener("popstate", refresh);
      pollTimer = window.setInterval(refresh, 900);
      refresh();
    };

    reflect("firms", "inactive", 0);
    reflect("inat", "inactive", 0);
    attach();

    return () => {
      disposed = true;
      firmsController?.abort();
      inatController?.abort();
      if (attachFrame) window.cancelAnimationFrame(attachFrame);
      if (refreshTimer) window.clearTimeout(refreshTimer);
      if (pollTimer) window.clearInterval(pollTimer);
      window.removeEventListener("popstate", refresh);
      if (map) {
        map.off?.("moveend", refresh);
        map.off?.("zoomend", refresh);
        map.off?.("style.load", onStyle);
        for (const sourceId of SOURCE_IDS) {
          const ids = sourceId === FIRMS_SOURCE ? [FIRMS_CLUSTER, FIRMS_COUNT, FIRMS_POINT] : [INAT_CLUSTER, INAT_COUNT, INAT_POINT];
          removeSourceFamily(map, sourceId, ids);
        }
      }
      for (const id of LAYER_IDS) {
        try { if (map?.getLayer?.(id)) map.removeLayer(id); } catch { /* no-op */ }
      }
      delete root.dataset.atlasFirmsRecordState;
      delete root.dataset.atlasFirmsRecordCount;
      delete root.dataset.atlasInatRecordState;
      delete root.dataset.atlasInatRecordCount;
      delete root.dataset.atlasInatTaxon;
    };
  }, []);

  const statuses = [
    publicStatusText("FIRMS", firmsState, firmsCount),
    publicStatusText("INAT", inatState, inatCount),
  ].filter(Boolean);

  return (
    <>
      <style>{`
        .atlas-live-source-status{position:fixed;left:50%;bottom:max(16px,env(safe-area-inset-bottom));transform:translateX(-50%);z-index:58;max-width:min(760px,calc(100vw - 28px));pointer-events:none;background:rgba(8,8,8,.88);border:1px solid rgba(255,255,255,.24);backdrop-filter:blur(12px);color:rgba(255,255,255,.78);padding:8px 11px;font:9px/1.45 'Fragment Mono',ui-monospace,monospace;letter-spacing:.08em;text-align:center}
        .atlas-live-record{position:fixed;left:16px;bottom:max(16px,env(safe-area-inset-bottom));z-index:72;width:min(420px,calc(100vw - 32px));max-height:min(68vh,620px);overflow:auto;background:rgba(8,8,8,.96);border:1px solid rgba(255,255,255,.28);box-shadow:0 22px 70px rgba(0,0,0,.42);backdrop-filter:blur(18px);color:#fff;padding:16px}
        .atlas-live-record h2{margin:9px 40px 0 0;font-size:22px;line-height:1.02;letter-spacing:-.035em;font-weight:560}
        .atlas-live-record p{margin:8px 0 0;font-size:12.5px;line-height:1.5;color:rgba(255,255,255,.72)}
        .atlas-live-record dl{margin:16px 0 0;display:grid;gap:11px}
        .atlas-live-record dt{font:9px/1.3 'Fragment Mono',ui-monospace,monospace;letter-spacing:.1em;color:rgba(255,255,255,.42)}
        .atlas-live-record dd{margin:3px 0 0;font-size:12.5px;line-height:1.48;color:rgba(255,255,255,.86)}
        .atlas-live-record .close{position:absolute;right:9px;top:8px;width:44px;height:44px;border:0;background:transparent;color:#fff;font-size:22px;cursor:pointer}
        .atlas-live-record .source{display:inline-flex;margin-top:15px;min-height:42px;align-items:center;border:1px solid rgba(255,255,255,.3);padding:0 12px;color:#fff;text-decoration:none;font:9.5px/1 'Fragment Mono',ui-monospace,monospace;letter-spacing:.08em}
        @media(max-width:600px){.atlas-live-source-status{bottom:max(74px,calc(env(safe-area-inset-bottom) + 58px));font-size:8.5px}.atlas-live-record{left:10px;bottom:max(72px,calc(env(safe-area-inset-bottom) + 58px));width:calc(100vw - 20px);max-height:56vh;padding:14px}.atlas-live-record h2{font-size:20px}}
      `}</style>

      {statuses.length > 0 && !inspector && (
        <div className="atlas-live-source-status" role="status" data-atlas-live-source-status>
          {statuses.join("  ·  ")}
        </div>
      )}

      {inspector && (
        <aside className="atlas-live-record" data-atlas-live-record-inspector aria-label="Selected source record">
          <button className="close" type="button" aria-label="Close selected record" onClick={() => setInspector(null)}>×</button>
          <div style={{ ...mono, color: inspector.kind === "FIRMS" ? "#FF7D50" : "#3AE86F" }}>
            {inspector.kind === "FIRMS" ? "FIRMS / VIIRS · SOURCE RECORD" : "iNATURALIST · SOURCE RECORD"}
          </div>
          <h2>{inspector.title}</h2>
          {inspector.subtitle && <p>{inspector.subtitle}</p>}
          <dl>
            <div><dt>WHAT IS THIS?</dt><dd>{inspector.kind === "FIRMS" ? "A satellite thermal-anomaly detection." : "A public species observation record."}</dd></div>
            <div><dt>WHERE?</dt><dd>{inspector.where}</dd></div>
            <div><dt>WHEN?</dt><dd>{inspector.when}</dd></div>
            <div><dt>SOURCE?</dt><dd>{inspector.source}</dd></div>
            <div><dt>WHAT DO WE KNOW?</dt><dd>{inspector.known}</dd></div>
            <div><dt>WHAT DON’T WE KNOW?</dt><dd>{inspector.unknown}</dd></div>
            <div><dt>WHAT CAN I EXPLORE NEXT?</dt><dd>{inspector.kind === "FIRMS" ? "Compare this detection with forest loss, place context and other active planetary layers." : "Inspect the taxon, compare other occurrence sources, then return to the same ATLAS context."}</dd></div>
          </dl>
          {inspector.sourceUrl && <a className="source" href={inspector.sourceUrl} target="_blank" rel="noopener noreferrer">OPEN SOURCE ↗</a>}
        </aside>
      )}
    </>
  );
}
