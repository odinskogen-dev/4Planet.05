import { useEffect } from "react";

const LEGACY_BIGDATACLOUD = "api.bigdatacloud.net/data/reverse-geocode-client";

type NamedFeature = {
  properties?: Record<string, unknown>;
  layer?: { type?: string };
};

function featureName(feature: NamedFeature): string {
  const p = feature.properties ?? {};
  for (const key of ["name_en", "name:en", "name", "name_int", "ref"]) {
    const value = p[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return "";
}

function priority(feature: NamedFeature): number {
  const p = feature.properties ?? {};
  const haystack = [p.class, p.type, p.place, p.subclass, p.category]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  if (/city|town|village|hamlet|suburb|neighbou?rhood|locality|place/.test(haystack)) return 100;
  if (/park|reserve|forest|wood|water|river|lake|bay|ocean|sea|beach|peak|mountain|natural/.test(haystack)) return 90;
  if (/poi|landuse|building/.test(haystack)) return 70;
  if (/road|street|highway/.test(haystack)) return 50;
  if (feature.layer?.type === "symbol") return 60;
  return 10;
}

function humanNameFromMap(lat: number, lng: number): string {
  const map = (window as any).__4planet_map;
  if (!map?.project || !map?.queryRenderedFeatures) return "";

  try {
    const point = map.project([lng, lat]);
    const radii = [12, 24, 42];
    for (const radius of radii) {
      const features = map.queryRenderedFeatures([
        [point.x - radius, point.y - radius],
        [point.x + radius, point.y + radius],
      ]) as NamedFeature[];

      const named = features
        .map((feature) => ({ feature, name: featureName(feature), score: priority(feature) }))
        .filter((item) => item.name)
        .sort((a, b) => b.score - a.score);

      if (named[0]?.name) return named[0].name;
    }
  } catch {
    // A map style may be between states. The caller will retain "Selected location".
  }
  return "";
}

/**
 * Compatibility bridge for the recovered V40 map-click flow.
 *
 * The recovered World still asks BigDataCloud's free client endpoint for an
 * arbitrary clicked coordinate. BigDataCloud's published fair-use rules allow
 * that endpoint only for the calling device's own current location, so ATLAS
 * must never send the recovered request.
 *
 * Instead, this ATLAS-only bridge answers that exact legacy request locally from
 * the already-rendered OpenFreeMap/OSM map labels. No extra location request is
 * made, no new place database is created, and a missing label simply fails
 * closed to the existing "Selected location" state.
 */
export function AtlasPlaceNameBridge() {
  useEffect(() => {
    const originalFetch = window.fetch.bind(window);

    const bridgedFetch: typeof window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = typeof input === "string"
        ? input
        : input instanceof URL
          ? input.toString()
          : input.url;

      if (!url.includes(LEGACY_BIGDATACLOUD)) return originalFetch(input, init);

      try {
        const parsed = new URL(url, window.location.href);
        const lat = Number(parsed.searchParams.get("latitude"));
        const lng = Number(parsed.searchParams.get("longitude"));
        if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
          return new Response(null, { status: 400, statusText: "Invalid map coordinate" });
        }

        const name = humanNameFromMap(lat, lng);
        if (!name) return new Response(null, { status: 404, statusText: "No rendered place label" });

        return new Response(JSON.stringify({ locality: name }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      } catch {
        return new Response(null, { status: 404, statusText: "No rendered place label" });
      }
    };

    window.fetch = bridgedFetch;
    return () => {
      if (window.fetch === bridgedFetch) window.fetch = originalFetch;
    };
  }, []);

  return null;
}
