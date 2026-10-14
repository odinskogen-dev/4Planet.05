/**
 * 4NATION geography — identity index + generalised outlines (Natural Earth, public domain).
 * Static, build-time data (scripts/build-nation-geography.mjs). No statistics live here.
 */
import data from "./countries.generated.json";

export type LonLat = [number, number];
export type Ring = LonLat[];

export interface NationCountry {
  iso2: string;
  iso3: string;
  name: string;
  short: string;
  slug: string;
  type: string;
  sovereign: string;
  continent: string;
  region: string;
  subregion: string;
  label: LonLat;
  bbox: [number, number, number, number];
  areaKm2Approx: number;
  capital: string | null;
  capitalLonLat: LonLat | null;
}

export const GEO_SOURCE = data.source;
export const COUNTRIES = data.countries as NationCountry[];

/** Launch set: profiles reviewed for substance (indexable). Others render but stay noindex. */
export const FEATURED = ["NO", "BR", "JP", "KE"] as const;

const bySlug = new Map(COUNTRIES.map((c) => [c.slug, c]));
const byIso = new Map(COUNTRIES.map((c) => [c.iso2, c]));
export const countryBySlug = (slug: string) => bySlug.get(slug.toLowerCase());
export const countryByIso = (iso2: string) => byIso.get(iso2.toUpperCase());

export function searchCountries(query: string, limit = 8): NationCountry[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const scored: Array<[number, NationCountry]> = [];
  for (const c of COUNTRIES) {
    const n = c.name.toLowerCase(), s = c.short.toLowerCase();
    let score = 0;
    if (s.startsWith(q) || n.startsWith(q)) score = 3;
    else if (c.iso2.toLowerCase() === q || c.iso3.toLowerCase() === q) score = 3;
    else if (n.includes(q)) score = 2;
    else if (c.capital && c.capital.toLowerCase().startsWith(q)) score = 1;
    if (score) scored.push([score, c]);
  }
  return scored.sort((a, b) => b[0] - a[0] || a[1].name.localeCompare(b[1].name)).slice(0, limit).map((x) => x[1]);
}

/* ── lazy geometry ─────────────────────────────────────────────────────── */
type WorldShape = { i: string; r: Ring[] };
let worldPromise: Promise<WorldShape[]> | null = null;
export function loadWorld(): Promise<WorldShape[]> {
  worldPromise ??= fetch("/nation/geo/world-110m.json").then((r) => {
    if (!r.ok) throw new Error("WORLD_GEOMETRY_UNAVAILABLE");
    return r.json();
  });
  return worldPromise;
}
const countryGeo = new Map<string, Promise<Ring[]>>();
export function loadCountryRings(iso2: string): Promise<Ring[]> {
  const key = iso2.toLowerCase();
  if (!countryGeo.has(key)) {
    countryGeo.set(key, fetch(`/nation/geo/c/${key}.json`).then((r) => {
      if (!r.ok) throw new Error("COUNTRY_GEOMETRY_UNAVAILABLE");
      return r.json();
    }).then((d) => d.rings as Ring[]));
  }
  return countryGeo.get(key)!;
}

/* ── geometry helpers ──────────────────────────────────────────────────── */
export function ringBbox(r: Ring): [number, number, number, number] {
  let a = 180, b = 90, c = -180, d = -90;
  for (const [x, y] of r) { if (x < a) a = x; if (y < b) b = y; if (x > c) c = x; if (y > d) d = y; }
  return [a, b, c, d];
}
/** Bbox of the largest ring — keeps far islands from shrinking the main view. */
export function mainBbox(rings: Ring[]): [number, number, number, number] {
  let best: Ring | null = null, bestA = -1;
  for (const r of rings) { const [a, b, c, d] = ringBbox(r); const area = (c - a) * (d - b); if (area > bestA) { bestA = area; best = r; } }
  return best ? ringBbox(best) : [-10, -10, 10, 10];
}

export function pointInRing([x, y]: LonLat, ring: Ring): boolean {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i], [xj, yj] = ring[j];
    if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

/** Atlas navigation camera for a country (navigation only, not a boundary). */
export function atlasCamera(c: NationCountry, rings?: Ring[]) {
  const [a, b, cc, d] = rings ? mainBbox(rings) : c.bbox;
  const span = Math.max((cc - a) * Math.cos(((b + d) / 2) * Math.PI / 180), d - b, 0.5);
  const zoom = Math.max(1.6, Math.min(8, Math.log2(360 / span) - 0.6));
  return { lng: Math.round(((a + cc) / 2) * 1000) / 1000, lat: Math.round(((b + d) / 2) * 1000) / 1000, zoom: Math.round(zoom * 10) / 10 };
}

/** Simple SVG silhouette path (equirectangular, cos-lat corrected) for glyphs. */
export function silhouettePath(rings: Ring[], size = 100, pad = 4): { d: string; w: number; h: number } {
  const [a, b, c, d] = mainBbox(rings);
  const k = Math.cos(((b + d) / 2) * Math.PI / 180);
  const w0 = (c - a) * k, h0 = d - b;
  const s = (size - pad * 2) / Math.max(w0, h0);
  const w = w0 * s + pad * 2, h = h0 * s + pad * 2;
  const parts: string[] = [];
  for (const r of rings) {
    const [ra, rb, rc, rd] = ringBbox(r);
    if (rc < a - 2 || ra > c + 2 || rd < b - 2 || rb > d + 2) continue; // keep the main frame clean
    parts.push("M" + r.map(([x, y]) => ((x - a) * k * s + pad).toFixed(1) + " " + ((d - y) * s + pad).toFixed(1)).join("L") + "Z");
  }
  return { d: parts.join(""), w: Math.round(w), h: Math.round(h) };
}

export function typeLabel(c: NationCountry): string {
  if (c.type === "Dependency") return "territory of " + c.sovereign;
  if (c.type === "Disputed" || c.type === "Indeterminate") return "territory with disputed or undetermined status";
  return "country";
}
