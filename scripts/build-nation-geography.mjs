#!/usr/bin/env node
/**
 * 4NATION — country geography build (Natural Earth, public domain).
 *
 * Produces small, static geometry for the Country Object glyph/globe and a
 * country identity index. This is NOT a new country database: runtime facts
 * (population, economy, sites) still come from the shared UNESCO/WDI read path.
 *
 * Inputs (GitHub mirror of naturalearthdata.com, public domain):
 *   ne_110m_admin_0_countries, ne_50m_admin_0_countries, ne_50m_populated_places
 * Outputs:
 *   public/nation/geo/world-110m.json   — all countries, coarse rings (home globe)
 *   public/nation/geo/c/{iso2}.json     — one country, 1:50m rings (country glyph)
 *   src/nation/countries.generated.json — identity index (no statistics)
 *
 * Usage: node scripts/build-nation-geography.mjs [localDir]
 *   localDir: optional folder already containing the three .geojson files.
 */
import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const BASE = "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/";
const FILES = ["ne_110m_admin_0_countries", "ne_50m_admin_0_countries", "ne_50m_populated_places"];
const local = process.argv[2];

async function load(name) {
  if (local && existsSync(join(local, name + ".geojson"))) return JSON.parse(readFileSync(join(local, name + ".geojson"), "utf8"));
  const res = await fetch(BASE + name + ".geojson");
  if (!res.ok) throw new Error(name + " HTTP " + res.status);
  return res.json();
}

const slugify = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase()
  .replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const q = (n, d) => Math.round(n * d) / d;
function rings(geom, d) {
  const polys = geom.type === "Polygon" ? [geom.coordinates] : geom.type === "MultiPolygon" ? geom.coordinates : [];
  const out = [];
  for (const poly of polys) for (const ring of poly.slice(0, 1)) { // outer rings only
    const r = [];
    for (const [x, y] of ring) {
      const p = [q(x, d), q(y, d)];
      const last = r[r.length - 1];
      if (!last || last[0] !== p[0] || last[1] !== p[1]) r.push(p);
    }
    if (r.length >= 4) out.push(r);
  }
  return out;
}

// Spherical polygon area (km²) of outer rings — approximate, documented as such.
const R = 6371.0088;
function ringArea(r) {
  let s = 0;
  for (let i = 0; i < r.length - 1; i++) {
    const [x1, y1] = r[i], [x2, y2] = r[i + 1];
    s += ((x2 - x1) * Math.PI / 180) * (2 + Math.sin(y1 * Math.PI / 180) + Math.sin(y2 * Math.PI / 180));
  }
  return Math.abs(s * R * R / 2);
}

function bbox(rs) {
  let a = 180, b = 90, c = -180, d = -90;
  for (const r of rs) for (const [x, y] of r) { a = Math.min(a, x); b = Math.min(b, y); c = Math.max(c, x); d = Math.max(d, y); }
  return [q(a, 100), q(b, 100), q(c, 100), q(d, 100)];
}

const [c110, c50, places] = await Promise.all(FILES.map(load));
const retrievedAt = new Date().toISOString();

const capitals = new Map();
for (const f of places.features) {
  const p = f.properties;
  if (p.FEATURECLA !== "Admin-0 capital") continue;
  const key = p.ADM0_A3;
  if (!capitals.has(key)) capitals.set(key, { name: p.NAME, lon: q(f.geometry.coordinates[0], 1000), lat: q(f.geometry.coordinates[1], 1000) });
}

const outDir = "public/nation/geo";
mkdirSync(join(outDir, "c"), { recursive: true });
mkdirSync("src/nation", { recursive: true });

const index = [];
const seen = new Set();
for (const f of c50.features) {
  const p = f.properties;
  const iso2 = p.ISO_A2_EH, iso3 = p.ISO_A3_EH;
  if (!/^[A-Z]{2}$/.test(iso2) || seen.has(iso2)) continue;
  seen.add(iso2);
  const rs = rings(f.geometry, 100);
  if (!rs.length) continue;
  const area = Math.round(rs.reduce((s, r) => s + ringArea(r), 0));
  const cap = capitals.get(p.ADM0_A3) || capitals.get(iso3);
  index.push({
    iso2, iso3, name: p.NAME_LONG || p.NAME, short: p.NAME, slug: slugify(p.NAME),
    type: p.TYPE, sovereign: p.SOVEREIGNT, continent: p.CONTINENT, region: p.REGION_UN, subregion: p.SUBREGION,
    label: [q(p.LABEL_X, 100), q(p.LABEL_Y, 100)], bbox: bbox(rs), areaKm2Approx: area,
    capital: cap ? cap.name : null, capitalLonLat: cap ? [cap.lon, cap.lat] : null,
  });
  writeFileSync(join(outDir, "c", iso2.toLowerCase() + ".json"), JSON.stringify({ iso2, rings: rs }));
}
index.sort((a, b) => a.name.localeCompare(b.name));

const world = [];
for (const f of c110.features) {
  const iso2 = f.properties.ISO_A2_EH;
  const rs = rings(f.geometry, 10);
  if (rs.length) world.push({ i: /^[A-Z]{2}$/.test(iso2) ? iso2 : "", r: rs });
}
writeFileSync(join(outDir, "world-110m.json"), JSON.stringify(world));

writeFileSync("src/nation/countries.generated.json", JSON.stringify({
  source: {
    id: "naturalearth", name: "Natural Earth", licence: "Public domain", url: "https://www.naturalearthdata.com/",
    mirror: BASE, files: FILES, retrievedAt,
    limitation: "Cartographic generalisation (1:50m / 1:110m). Boundaries follow Natural Earth's de facto policy and are not an official position of 4PLANET. Area is computed from generalised outer rings and is approximate.",
  },
  countries: index,
}));
console.log("countries:", index.length, "world shapes:", world.length);
