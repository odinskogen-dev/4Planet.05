/**
 * GET /api/atlas-wms
 *
 * Allowlisted same-origin raster bridge for ATLAS. Despite the legacy route
 * name it handles both WMS and WMTS. It is deliberately NOT an open proxy.
 */

type Profile = {
  base: string;
  mode: "PASSTHROUGH_3857" | "NOAA_ERDDAP_CRS84" | "WMTS_EPSG900913";
  fixedLayer?: string;
  fixedStyle?: string;
  fixedMatrixSet?: string;
  fixedFormat?: string;
  maxAge?: number;
};

const PROFILES: Record<string, Profile> = {
  "emodnet-bathymetry": {
    base: "https://ows.emodnet-bathymetry.eu/wms",
    mode: "PASSTHROUGH_3857",
    maxAge: 86400,
  },
  "emodnet-seabed-habitats-wmts": {
    base: "https://ows.emodnet-seabedhabitats.eu/geoserver/emodnet_view/gwc/service/wmts/rest",
    mode: "WMTS_EPSG900913",
    fixedLayer: "eusm2025_eunis2019_full",
    fixedStyle: "emodnet_view:eusm2021_eunis2019_l2_fulldetail",
    fixedMatrixSet: "EPSG:900913",
    fixedFormat: "image/png8",
    maxAge: 86400,
  },
  "emodnet-human-activities": {
    base: "https://ows.emodnet-humanactivities.eu/wms",
    mode: "PASSTHROUGH_3857",
    maxAge: 86400,
  },
  "emodnet-chemistry": {
    base: "https://ec.oceanbrowser.net/emodnet/Python/web/wms",
    mode: "PASSTHROUGH_3857",
    maxAge: 86400,
  },
  "noaa-coral-dhw": {
    base: "https://coastwatch.noaa.gov/erddap/wms/noaacrwdhwDaily/request",
    mode: "NOAA_ERDDAP_CRS84",
    fixedLayer: "noaacrwdhwDaily:degree_heating_week",
    maxAge: 3600,
  },
};

const TRANSPARENT_256_PNG = "iVBORw0KGgoAAAANSUhEUgAAAQAAAAEACAYAAABccqhmAAABFUlEQVR42u3BMQEAAADCoPVP7WsIoAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAeAMBPAAB2ClDBAAAAABJRU5ErkJggg==";

const safeToken = (value: string | null, max = 240) =>
  value && value.length <= max && /^[A-Za-z0-9_:.\-/*]+$/.test(value) ? value : "";

const mercatorToLon = (x: number) => (x / 20037508.342789244) * 180;
const mercatorToLat = (y: number) => {
  const yDeg = (y / 20037508.342789244) * 180;
  return (180 / Math.PI) * (2 * Math.atan(Math.exp((yDeg * Math.PI) / 180)) - Math.PI / 2);
};

function parseBbox3857(value: string | null) {
  const parts = (value || "").split(",").map(Number);
  if (parts.length !== 4 || parts.some((n) => !Number.isFinite(n))) return null;
  const [minX, minY, maxX, maxY] = parts;
  return { minX, minY, maxX, maxY };
}

function boundedTileCoordinate(value: string | null, z: number) {
  if (!value || !/^\d+$/.test(value)) return null;
  const n = Number(value);
  const max = 2 ** z;
  return Number.isInteger(n) && n >= 0 && n < max ? n : null;
}

function transparentTile(source: string, reason: string, maxAge: number) {
  const binary = atob(TRANSPARENT_256_PNG);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new Response(bytes, {
    status: 200,
    headers: {
      "content-type": "image/png",
      "cache-control": `public, max-age=${maxAge}`,
      "access-control-allow-origin": "*",
      "x-4planet-atlas-source": source,
      "x-4planet-atlas-empty": reason,
    },
  });
}

const errorJson = (error: string, status = 400) => new Response(JSON.stringify({ ok: false, error }), {
  status,
  headers: { "content-type": "application/json", "access-control-allow-origin": "*", "cache-control": "no-store" },
});

export const onRequestGet = async ({ request }: { request: Request }) => {
  const incoming = new URL(request.url);
  const source = incoming.searchParams.get("source") || "";
  const profile = PROFILES[source];
  if (!profile) return errorJson("UNSUPPORTED_SOURCE");

  let upstream: URL;

  if (profile.mode === "WMTS_EPSG900913") {
    const zText = incoming.searchParams.get("z") || "";
    if (!/^\d+$/.test(zText)) return errorJson("INVALID_Z");
    const z = Number(zText);
    if (!Number.isInteger(z) || z < 0 || z > 22) return errorJson("INVALID_Z");
    const x = boundedTileCoordinate(incoming.searchParams.get("x"), z);
    const y = boundedTileCoordinate(incoming.searchParams.get("y"), z);
    if (x == null || y == null) return errorJson("INVALID_TILE_COORDINATE");

    const matrixSet = profile.fixedMatrixSet || "EPSG:900913";
    const layer = profile.fixedLayer!;
    const style = profile.fixedStyle!;
    const format = profile.fixedFormat || "image/png8";
    upstream = new URL(`${profile.base}/${layer}/${style}/${matrixSet}/${matrixSet}:${z}/${y}/${x}`);
    upstream.searchParams.set("format", format);
  } else {
    const bbox = parseBbox3857(incoming.searchParams.get("bbox"));
    if (!bbox) return errorJson("INVALID_BBOX");

    const width = Math.min(512, Math.max(64, Number(incoming.searchParams.get("width")) || 256));
    const height = Math.min(512, Math.max(64, Number(incoming.searchParams.get("height")) || 256));
    upstream = new URL(profile.base);
    upstream.searchParams.set("service", "WMS");
    upstream.searchParams.set("request", "GetMap");
    upstream.searchParams.set("format", "image/png");
    upstream.searchParams.set("transparent", "true");
    upstream.searchParams.set("width", String(width));
    upstream.searchParams.set("height", String(height));

    if (profile.mode === "NOAA_ERDDAP_CRS84") {
      upstream.searchParams.set("version", "1.3.0");
      upstream.searchParams.set("layers", profile.fixedLayer!);
      upstream.searchParams.set("styles", profile.fixedStyle || "");
      upstream.searchParams.set("crs", "CRS:84");
      upstream.searchParams.set("bbox", [
        mercatorToLon(bbox.minX),
        mercatorToLat(bbox.minY),
        mercatorToLon(bbox.maxX),
        mercatorToLat(bbox.maxY),
      ].map((n) => n.toFixed(7)).join(","));
      upstream.searchParams.set("time", incoming.searchParams.get("time") || "current");
    } else {
      const version = incoming.searchParams.get("version") === "1.3.0" ? "1.3.0" : "1.1.1";
      const layer = safeToken(incoming.searchParams.get("layers"));
      const style = safeToken(incoming.searchParams.get("styles"));
      if (!layer) return errorJson("INVALID_LAYER");
      upstream.searchParams.set("version", version);
      upstream.searchParams.set("layers", layer);
      upstream.searchParams.set("styles", style);
      upstream.searchParams.set(version === "1.3.0" ? "crs" : "srs", "EPSG:3857");
      upstream.searchParams.set("bbox", [bbox.minX, bbox.minY, bbox.maxX, bbox.maxY].join(","));
      const time = safeToken(incoming.searchParams.get("time"));
      const elevation = safeToken(incoming.searchParams.get("elevation"));
      if (time) upstream.searchParams.set("time", time);
      if (elevation) upstream.searchParams.set("elevation", elevation);
    }
  }

  try {
    const response = await fetch(upstream.toString(), {
      headers: {
        accept: "image/png,image/*;q=0.8,*/*;q=0.5",
        "user-agent": "4PLANET-ATLAS/1.0 (+https://4planet.org)",
      },
      cf: { cacheTtl: profile.maxAge || 3600 } as RequestInit["cf"],
    });

    // A cached WMTS tile can legitimately be absent outside the dataset's
    // coverage/scale. That means "no habitat tile here", not "the source is
    // unavailable". Return a transparent tile so MapLibre does not downgrade
    // the entire layer because one world tile is outside coverage.
    if (!response.ok && profile.mode === "WMTS_EPSG900913" && response.status === 404) {
      return transparentTile(source, "outside-coverage", profile.maxAge || 86400);
    }
    if (!response.ok) return errorJson(`UPSTREAM_${response.status}`, 502);

    const contentType = response.headers.get("content-type") || "";
    if (!contentType.toLowerCase().includes("image")) return errorJson("UPSTREAM_NOT_IMAGE", 502);
    const bytes = await response.arrayBuffer();
    if (bytes.byteLength < 100) return errorJson("UPSTREAM_EMPTY_IMAGE", 502);
    return new Response(bytes, {
      status: 200,
      headers: {
        "content-type": contentType,
        "cache-control": `public, max-age=${profile.maxAge || 3600}`,
        "access-control-allow-origin": "*",
        "x-4planet-atlas-source": source,
      },
    });
  } catch (error) {
    return errorJson(String((error as Error)?.message || error), 502);
  }
};

export const onRequestOptions = () => new Response(null, {
  headers: {
    "access-control-allow-origin": "*",
    "access-control-allow-methods": "GET, OPTIONS",
    "access-control-max-age": "86400",
  },
});
