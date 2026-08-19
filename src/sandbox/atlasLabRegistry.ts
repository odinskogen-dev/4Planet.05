import { C, LAYERS, RASTER_ORDER } from "@/earth/layers";
import {
  EMODNET_BATHYMETRY,
  EMODNET_DISSOLVED_OXYGEN_CLIMATOLOGY,
  EMODNET_FISHING_VESSEL_DENSITY,
  EMODNET_SEABED_HABITATS,
  type SandboxRasterDescriptor,
  wmsRasterTileUrl,
} from "@/sandbox/atlasDataSources";

/**
 * ATLAS DATA LAB — extension registry
 *
 * This is deliberately an adapter onto the existing ATLAS layer machine, not a
 * second map architecture. The production registry stays untouched. The sandbox
 * route installs these extensions before the canonical World mounts.
 *
 * The schema carries more product intelligence than World currently renders so
 * future UI work (time controls, journeys, presets, source detail) can be added
 * without having to rediscover semantics source-by-source.
 */
export type AtlasLabRole =
  | "FOUNDATION"
  | "HABITAT"
  | "PRESSURE"
  | "CONDITION"
  | "LIFE"
  | "HUMAN_SYSTEM";

export type AtlasLabTemporal = {
  kind: "STATIC" | "SNAPSHOT" | "TIME_SERIES" | "CLIMATOLOGY" | "NEAR_REAL_TIME";
  selected?: string;
  advertisedRange?: string;
  caveat?: string;
};

export type AtlasLabJourneyHook = {
  kind: "SPECIES" | "LIVING_SYSTEM" | "PRESSURE" | "MISSION";
  label: string;
  route: string;
  status: "AVAILABLE" | "PLANNED";
};

export type AtlasLabExtension = {
  descriptor: SandboxRasterDescriptor;
  atlas: {
    label: string;
    dom: "PLANET" | "OCE4N" | "E4RTH" | "S4PIENS";
    domain: Array<"PLANET" | "OCE4N" | "E4RTH" | "S4PIENS">;
    group: "EARTH" | "LIFE" | "SIGNALS";
    role: AtlasLabRole;
    color: string;
    stackAfter: string;
    maxzoom: number;
  };
  temporal: AtlasLabTemporal;
  journeyHooks: AtlasLabJourneyHook[];
};

export const ATLAS_LAB_EXTENSIONS: AtlasLabExtension[] = [
  {
    descriptor: EMODNET_BATHYMETRY,
    atlas: {
      label: "OCEAN · BATHYMETRY",
      dom: "OCE4N",
      domain: ["PLANET", "OCE4N"],
      group: "EARTH",
      role: "FOUNDATION",
      color: C.blue,
      stackAfter: "sst",
      maxzoom: 14,
    },
    temporal: { kind: "STATIC" },
    journeyHooks: [
      { kind: "LIVING_SYSTEM", label: "Explore Living Systems", route: "/living-systems", status: "AVAILABLE" },
    ],
  },
  {
    descriptor: EMODNET_SEABED_HABITATS,
    atlas: {
      label: "SEABED · HABITATS 2025",
      dom: "OCE4N",
      domain: ["PLANET", "OCE4N"],
      group: "EARTH",
      role: "HABITAT",
      color: C.blue,
      stackAfter: EMODNET_BATHYMETRY.id,
      maxzoom: 14,
    },
    temporal: {
      kind: "SNAPSHOT",
      selected: "2025",
      caveat: "Predictive broad-scale habitat classification; not current ecological condition.",
    },
    journeyHooks: [
      { kind: "SPECIES", label: "Explore Species", route: "/species", status: "AVAILABLE" },
      { kind: "LIVING_SYSTEM", label: "Explore Living Systems", route: "/living-systems", status: "AVAILABLE" },
    ],
  },
  {
    descriptor: EMODNET_DISSOLVED_OXYGEN_CLIMATOLOGY,
    atlas: {
      label: "OCEAN · OXYGEN CLIMATOLOGY",
      dom: "OCE4N",
      domain: ["PLANET", "OCE4N"],
      group: "EARTH",
      role: "CONDITION",
      color: C.green,
      stackAfter: EMODNET_SEABED_HABITATS.id,
      maxzoom: 10,
    },
    temporal: {
      kind: "CLIMATOLOGY",
      selected: "MONTH 08 · SURFACE",
      advertisedRange: "Monthly climatology · months 01–12 · multiple depth levels",
      caveat: "Climatology is a long-term seasonal pattern, not a current oxygen reading.",
    },
    journeyHooks: [
      { kind: "SPECIES", label: "Explore Species", route: "/species", status: "AVAILABLE" },
      { kind: "LIVING_SYSTEM", label: "Explore Living Systems", route: "/living-systems", status: "AVAILABLE" },
    ],
  },
  {
    descriptor: EMODNET_FISHING_VESSEL_DENSITY,
    atlas: {
      label: "FISHING · VESSEL DENSITY 2023",
      dom: "S4PIENS",
      domain: ["PLANET", "OCE4N", "S4PIENS"],
      group: "SIGNALS",
      role: "PRESSURE",
      color: C.red,
      stackAfter: EMODNET_DISSOLVED_OXYGEN_CLIMATOLOGY.id,
      maxzoom: 14,
    },
    temporal: {
      kind: "TIME_SERIES",
      selected: "2023-01-01T00:00:00Z",
      advertisedRange: "2017–2024 annual slices",
      caveat: "Historical AIS-derived vessel-density context; not live fishing, catch, legality or ecological impact.",
    },
    journeyHooks: [
      { kind: "PRESSURE", label: "Pressure journey", route: "/atlas-data-sandbox", status: "PLANNED" },
    ],
  },
];

export const ATLAS_LAB_SCENES = [
  {
    id: "OCEAN_FOUNDATION",
    label: "OCEAN FOUNDATION",
    mode: "OCE4N",
    layers: ["bluemarble", EMODNET_BATHYMETRY.id],
    purpose: "Read physical ocean form before adding habitat, condition or human pressure.",
  },
  {
    id: "OCEAN_HABITAT",
    label: "OCEAN + HABITAT",
    mode: "OCE4N",
    layers: ["bluemarble", EMODNET_BATHYMETRY.id, EMODNET_SEABED_HABITATS.id],
    purpose: "Compare seabed form with predictive habitat classification.",
  },
  {
    id: "OCEAN_CONDITION",
    label: "OCEAN + CONDITION",
    mode: "OCE4N",
    layers: [
      "bluemarble",
      EMODNET_BATHYMETRY.id,
      EMODNET_SEABED_HABITATS.id,
      EMODNET_DISSOLVED_OXYGEN_CLIMATOLOGY.id,
    ],
    purpose: "Add a bounded climatological condition layer without presenting it as live status.",
  },
  {
    id: "OCEAN_PRESSURE",
    label: "OCEAN + HUMAN PRESSURE",
    mode: "OCE4N",
    layers: [
      "bluemarble",
      EMODNET_BATHYMETRY.id,
      EMODNET_SEABED_HABITATS.id,
      EMODNET_DISSOLVED_OXYGEN_CLIMATOLOGY.id,
      EMODNET_FISHING_VESSEL_DENSITY.id,
    ],
    purpose: "Place historical vessel-density pressure context over physical, habitat and condition layers.",
  },
] as const;

const installed = new Set<string>();

function temporalSummary(temporal: AtlasLabTemporal) {
  const parts = [temporal.kind.replaceAll("_", " ")];
  if (temporal.selected) parts.push(temporal.selected);
  if (temporal.advertisedRange) parts.push(temporal.advertisedRange);
  return parts.join(" · ");
}

function toAtlasLayer(extension: AtlasLabExtension) {
  const { descriptor, atlas, temporal, journeyHooks } = extension;
  const note = [
    descriptor.product,
    descriptor.units ? `UNITS · ${descriptor.units}` : null,
    `TIME · ${temporalSummary(temporal)}`,
    descriptor.limitation,
    descriptor.rightsNote || null,
  ].filter(Boolean).join(" — ");

  return {
    id: descriptor.id,
    dom: atlas.dom,
    group: atlas.group,
    kind: "raster",
    domain: atlas.domain,
    label: atlas.label,
    color: atlas.color,
    src: `${descriptor.authority} · checked ${descriptor.checkedAt}`,
    opacity: descriptor.opacity,
    maxzoom: atlas.maxzoom,
    wms: true,
    note,
    tiles: () => wmsRasterTileUrl(descriptor),
    attr: descriptor.attribution,
    // Extension metadata: ignored safely by current World, available to the
    // next-generation source/detail/time/journey UI without another registry.
    atlasLab: {
      role: atlas.role,
      sourceId: descriptor.sourceId,
      product: descriptor.product,
      checkedAt: descriptor.checkedAt,
      temporal,
      journeyHooks,
      rightsNote: descriptor.rightsNote,
    },
  };
}

function insertAfter(order: string[], id: string, after: string) {
  if (order.includes(id)) return;
  const anchor = order.indexOf(after);
  if (anchor >= 0) order.splice(anchor + 1, 0, id);
  else order.push(id);
}

/** Install sandbox-only extensions into the already-existing ATLAS runtime. */
export function installAtlasLabExtensions() {
  const atlasLayers = LAYERS as any[];
  const rasterOrder = RASTER_ORDER as string[];

  for (const extension of ATLAS_LAB_EXTENSIONS) {
    const id = extension.descriptor.id;
    if (!atlasLayers.some((layer) => layer.id === id)) {
      atlasLayers.push(toAtlasLayer(extension));
    }
    insertAfter(rasterOrder, id, extension.atlas.stackAfter);
    installed.add(id);
  }

  return {
    layerIds: [...installed],
    extensionCount: installed.size,
    sceneCount: ATLAS_LAB_SCENES.length,
  };
}

/** Legacy helper retained for callers that want the default scene only. */
export function applyAtlasLabDefaultScene() {
  const params = new URLSearchParams(window.location.search);
  const scene = ATLAS_LAB_SCENES[0];

  if (!params.has("m")) params.set("m", scene.mode);
  if (!params.has("l")) params.set("l", scene.layers.join(","));
  if (!params.has("z")) params.set("z", "3.40");
  if (!params.has("c")) params.set("c", "8.00,57.00");

  window.history.replaceState(null, "", `${window.location.pathname}?${params.toString()}`);
  return scene;
}
