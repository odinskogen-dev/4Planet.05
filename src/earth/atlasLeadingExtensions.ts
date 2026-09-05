import { C, LAYERS, RASTER_ORDER } from "./layers";

export type AtlasTimeAxis = {
  layerId: string;
  label: string;
  semantic: "YEAR" | "MONTH_CLIMATOLOGY";
  defaultValue: string;
  options: Array<{ value: string; label: string }>;
  explanation: string;
};

type Descriptor = {
  id: string;
  proxyKey: string;
  label: string;
  dom: "PLANET" | "OCE4N" | "E4RTH" | "S4PIENS";
  domain: Array<"PLANET" | "OCE4N" | "E4RTH" | "S4PIENS">;
  group: "EARTH" | "LIFE" | "SIGNALS";
  color: string;
  authority: string;
  product: string;
  layer: string;
  style?: string;
  time?: string;
  elevation?: string;
  version?: "1.1.1" | "1.3.0";
  opacity: number;
  maxzoom: number;
  stackAfter: string;
  attribution: string;
  limitation: string;
};

const DESCRIPTORS: Descriptor[] = [
  {
    id: "emodnet-bathymetry",
    proxyKey: "emodnet-bathymetry",
    label: "OCEAN · BATHYMETRY",
    dom: "OCE4N",
    domain: ["PLANET", "OCE4N"],
    group: "EARTH",
    color: C.blue,
    authority: "EMOdnet Bathymetry",
    product: "Mean seabed depth · multi-colour · no land",
    layer: "emodnet:mean_multicolour",
    style: "mean_multicolour",
    version: "1.3.0",
    opacity: 0.78,
    maxzoom: 14,
    stackAfter: "sst",
    attribution: "EMOdnet Bathymetry",
    limitation: "Seabed-depth context only. Not habitat condition, ecological status or a current event.",
  },
  {
    id: "emodnet-seabed-habitats",
    proxyKey: "emodnet-seabed-habitats",
    label: "SEABED · HABITATS 2025",
    dom: "OCE4N",
    domain: ["PLANET", "OCE4N"],
    group: "LIFE",
    color: C.blue,
    authority: "EMOdnet Seabed Habitats",
    product: "EUSeaMap 2025 · MSFD broad benthic habitat types · 800 m",
    layer: "eusm2025_msfd_800",
    style: "eusm2019_msfd_800",
    version: "1.3.0",
    opacity: 0.72,
    maxzoom: 14,
    stackAfter: "emodnet-bathymetry",
    attribution: "EMOdnet Seabed Habitats / EUSeaMap 2025 · CC BY 4.0",
    limitation: "Broad-scale predictive habitat classification. Not direct field observation, current condition, absence evidence or local habitat confirmation.",
  },
  {
    id: "emodnet-dissolved-oxygen-climatology",
    proxyKey: "emodnet-chemistry",
    label: "OCEAN · OXYGEN CLIMATOLOGY",
    dom: "OCE4N",
    domain: ["PLANET", "OCE4N"],
    group: "EARTH",
    color: C.green,
    authority: "EMOdnet Chemistry / University of Liège",
    product: "Dissolved oxygen concentration · monthly climatology · surface",
    layer: "All_European_Seas/Water_body_dissolved_oxygen_concentration.nc*Water_body_dissolved_oxygen_concentration_L2",
    style: "pcolor_flat",
    time: "08",
    elevation: "-0.0",
    version: "1.3.0",
    opacity: 0.72,
    maxzoom: 10,
    stackAfter: "emodnet-seabed-habitats",
    attribution: "EMOdnet Chemistry · University of Liège",
    limitation: "Monthly climatology, not a live/current oxygen measurement and not evidence of hypoxia at a specific place or time.",
  },
  {
    id: "emodnet-fishing-vessel-density",
    proxyKey: "emodnet-human-activities",
    label: "FISHING · VESSEL DENSITY",
    dom: "S4PIENS",
    domain: ["PLANET", "OCE4N", "S4PIENS"],
    group: "SIGNALS",
    color: C.red,
    authority: "EMOdnet Human Activities",
    product: "Fishing-vessel density · annual average",
    layer: "vesseldensity_01avg",
    style: "VesselDensity",
    time: "2023-01-01T00:00:00Z",
    opacity: 0.74,
    maxzoom: 14,
    stackAfter: "emodnet-dissolved-oxygen-climatology",
    attribution: "EMOdnet Human Activities",
    limitation: "Historical AIS-derived vessel-density context. Not live fishing, catch, legality or ecological impact.",
  },
];

function proxiedTileUrl(descriptor: Descriptor, timeOverride?: string) {
  const params = new URLSearchParams({
    source: descriptor.proxyKey,
    version: descriptor.version || "1.1.1",
    layers: descriptor.layer,
    styles: descriptor.style || "",
    width: "256",
    height: "256",
    bbox: "{bbox-epsg-3857}",
  });
  const time = timeOverride ?? descriptor.time;
  if (time) params.set("time", time);
  if (descriptor.elevation) params.set("elevation", descriptor.elevation);
  return `/api/atlas-wms?${params.toString().replace(encodeURIComponent("{bbox-epsg-3857}"), "{bbox-epsg-3857}")}`;
}

export function atlasLeadingTileUrl(layerId: string, timeOverride?: string) {
  const descriptor = DESCRIPTORS.find((item) => item.id === layerId);
  return descriptor ? proxiedTileUrl(descriptor, timeOverride) : "";
}

function insertAfter(order: string[], id: string, after: string) {
  if (order.includes(id)) return;
  const anchor = order.indexOf(after);
  if (anchor >= 0) order.splice(anchor + 1, 0, id);
  else order.push(id);
}

let installed = false;
export function installAtlasLeadingExtensions() {
  if (installed) return;
  const layers = LAYERS as any[];
  const order = RASTER_ORDER as string[];
  for (const descriptor of DESCRIPTORS) {
    if (!layers.some((layer) => layer.id === descriptor.id)) {
      layers.push({
        id: descriptor.id,
        dom: descriptor.dom,
        group: descriptor.group,
        kind: "raster",
        domain: descriptor.domain,
        label: descriptor.label,
        color: descriptor.color,
        src: descriptor.authority,
        opacity: descriptor.opacity,
        maxzoom: descriptor.maxzoom,
        wms: true,
        note: `${descriptor.product} — ${descriptor.limitation}`,
        tiles: () => proxiedTileUrl(descriptor),
        attr: descriptor.attribution,
      });
    }
    insertAfter(order, descriptor.id, descriptor.stackAfter);
  }
  installed = true;
}

export const ATLAS_TIME_AXES: AtlasTimeAxis[] = [
  {
    layerId: "emodnet-fishing-vessel-density",
    label: "FISHING VESSEL DENSITY",
    semantic: "YEAR",
    defaultValue: "2023-01-01T00:00:00Z",
    options: Array.from({ length: 8 }, (_, index) => {
      const year = 2017 + index;
      return { value: `${year}-01-01T00:00:00Z`, label: String(year) };
    }),
    explanation: "Historical annual vessel-density slices. Changing year changes the provider request.",
  },
  {
    layerId: "emodnet-dissolved-oxygen-climatology",
    label: "DISSOLVED OXYGEN",
    semantic: "MONTH_CLIMATOLOGY",
    defaultValue: "08",
    options: Array.from({ length: 12 }, (_, index) => {
      const month = String(index + 1).padStart(2, "0");
      return { value: month, label: month };
    }),
    explanation: "Monthly climatology. Month changes the provider request; this is not live oxygen status.",
  },
];