import { useEffect, useState } from "react";
import PublicWorld from "@/earth/PublicWorld";
import { C, LAYERS, RASTER_ORDER } from "@/earth/layers";
import { SANDBOX_RASTERS, wmsRasterTileUrl } from "@/sandbox/atlasDataSources";

const SANDBOX_LAYER_IDS = SANDBOX_RASTERS.map((descriptor) => descriptor.id);

function installSandboxLayers() {
  const atlasLayers = LAYERS as any[];
  const rasterOrder = RASTER_ORDER as string[];

  const definitions = SANDBOX_RASTERS.map((descriptor) => {
    const fishing = descriptor.id.includes("fishing-vessel-density");
    const habitat = descriptor.id.includes("seabed-habitats");

    return {
      id: descriptor.id,
      dom: fishing ? "S4PIENS" : "OCE4N",
      group: "EARTH",
      kind: "raster",
      domain: fishing ? ["PLANET", "OCE4N", "S4PIENS"] : ["PLANET", "OCE4N"],
      label: fishing
        ? "FISHING · VESSEL DENSITY 2023"
        : habitat
          ? "SEABED · HABITATS 2025"
          : "OCEAN · BATHYMETRY",
      color: fishing ? C.red : C.blue,
      src: descriptor.authority,
      opacity: descriptor.opacity,
      maxzoom: 14,
      wms: true,
      note: descriptor.limitation,
      tiles: () => wmsRasterTileUrl(descriptor),
      attr: descriptor.attribution,
      sandbox: true,
      sandboxProduct: descriptor.product,
      sandboxCheckedAt: descriptor.checkedAt,
    };
  });

  for (const definition of definitions) {
    if (!atlasLayers.some((layer) => layer.id === definition.id)) {
      atlasLayers.push(definition);
    }
  }

  const missing = SANDBOX_LAYER_IDS.filter((id) => !rasterOrder.includes(id));
  if (missing.length) {
    const anchor = rasterOrder.indexOf("sst");
    if (anchor >= 0) rasterOrder.splice(anchor + 1, 0, ...missing);
    else rasterOrder.push(...missing);
  }
}

installSandboxLayers();

export default function AtlasDataSandbox() {
  const [prepared, setPrepared] = useState(false);

  useEffect(() => {
    document.title = "ATLAS DATA SANDBOX · 4PLANET";

    const robots = document.createElement("meta");
    robots.name = "robots";
    robots.content = "noindex,nofollow,noarchive";
    document.head.appendChild(robots);

    const params = new URLSearchParams(window.location.search);
    if (!params.has("m")) params.set("m", "OCE4N");
    if (!params.has("l")) {
      params.set("l", `bluemarble,${SANDBOX_RASTERS[0].id}`);
    }
    if (!params.has("z")) params.set("z", "3.40");
    if (!params.has("c")) params.set("c", "8.00,57.00");
    window.history.replaceState(null, "", `${window.location.pathname}?${params.toString()}`);

    setPrepared(true);
    return () => robots.remove();
  }, []);

  if (!prepared) {
    return <div style={{ position: "fixed", inset: 0, background: "#080808" }} />;
  }

  return <PublicWorld />;
}
