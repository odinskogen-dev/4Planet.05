// 4NATION World Heritage counts, end to end on REAL whc001 records.
// Each record goes through the same path as useCountrySites in src/nation/data.ts:
//   normaliseUnescoAtlasRecord("whc001", raw) -> drop nulls -> unescoRecordMatchesCountry(x, c.iso2, c.short)
// Fixtures are verbatim records from https://4nation.org/api/unesco-data?dataset=whc001 in both shapes seen live:
//   2026-10-21: iso_codes '["NO"]' (JSON string), states_names ['["Norway"]']
//   2026-10-30: iso_codes ["NO"] (array),          states_names ["Norway"]
// Both shapes send coordinates as GeoJSON Feature/MultiPoint in [lon, lat] order.
// Optional: UNESCO_WHC001_FULL=/path/a.json:/path/b.json reruns the counts on full API bodies.
// Run: node --test scripts/4nation-unesco-e2e.test.mjs (Node >= 23.6 strips TS types natively).
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { normaliseUnescoAtlasRecord, normaliseUnescoPoint } from "../src/data/unescoOpenData.ts";
import { unescoRecordMatchesCountry } from "../src/nation/unescoCountryMatch.ts";

const here = (p) => new URL(p, import.meta.url);
const countries = JSON.parse(readFileSync(here("../src/nation/countries.generated.json"), "utf8"));
const country = (iso2) => {
  const list = Array.isArray(countries) ? countries : countries.countries ?? Object.values(countries);
  const c = list.find((x) => x && x.iso2 === iso2);
  assert.ok(c, `country ${iso2} in countries.generated.json`);
  return c;
};
const EXPECTED = { NO: 8, BR: 26, JP: 27, KE: 8 };

const pipeline = (records, iso2) => {
  const c = country(iso2);
  return records
    .map((x) => normaliseUnescoAtlasRecord("whc001", x))
    .filter(Boolean)
    .filter((x) => unescoRecordMatchesCountry(x, c.iso2, c.short));
};

const FIXTURES = [
  ["2026-10-21 string shape", "./fixtures/4nation-whc001-2026-10-21.json", "string"],
  ["2026-10-30 array shape", "./fixtures/4nation-whc001-2026-10-30.json", "array"],
];

for (const [label, file, shape] of FIXTURES) {
  const body = JSON.parse(readFileSync(here(file), "utf8"));
  const records = body.records;

  test(`${label}: fixture really has the ${shape} shape and GeoJSON coordinates`, () => {
    const bryggen = records.find((r) => r.name_en === "Bryggen");
    assert.ok(bryggen);
    assert.equal(shape === "string" ? typeof bryggen.iso_codes : Array.isArray(bryggen.iso_codes) ? "array" : "?", shape === "string" ? "string" : "array");
    assert.equal(bryggen.coordinates.type, "Feature");
    assert.equal(bryggen.coordinates.geometry.type, "MultiPoint");
  });

  test(`${label}: every record with a coordinate survives normaliseUnescoAtlasRecord`, () => {
    const withCoords = records.filter((r) => r.coordinates != null).length;
    const kept = records.map((x) => normaliseUnescoAtlasRecord("whc001", x)).filter(Boolean).length;
    assert.ok(withCoords > 0);
    assert.equal(kept, withCoords);
  });

  test(`${label}: points are read lon-first (Bryggen is in Bergen, not the Indian Ocean)`, () => {
    const b = normaliseUnescoAtlasRecord("whc001", records.find((r) => r.name_en === "Bryggen"));
    assert.ok(Math.abs(b.lat - 60.3975) < 0.01 && Math.abs(b.lon - 5.3242) < 0.01, JSON.stringify(b));
    for (const x of pipeline(records, "KE")) assert.ok(x.lat > -5 && x.lat < 5.5 && x.lon > 33 && x.lon < 42.5, `${x.name} ${x.lat},${x.lon}`);
  });

  for (const [iso2, n] of Object.entries(EXPECTED)) {
    test(`${label}: ${iso2} has ${n} World Heritage sites`, () => {
      assert.equal(pipeline(records, iso2).length, n);
    });
  }
}

for (const full of (process.env.UNESCO_WHC001_FULL || "").split(":").filter(Boolean)) {
  test(`full API body ${full}: NO 8, BR 26, JP 27, KE 8`, () => {
    const records = JSON.parse(readFileSync(full, "utf8")).records;
    assert.ok(records.length > 1000);
    assert.deepEqual(Object.fromEntries(Object.keys(EXPECTED).map((k) => [k, pipeline(records, k).length])), EXPECTED);
  });
}

test("normaliseUnescoPoint: GeoJSON is [lon, lat]; DataHub arrays stay [lat, lon]", () => {
  assert.deepEqual(normaliseUnescoPoint({ type: "Feature", geometry: { type: "Point", coordinates: [10.75, 59.91] } }), { lat: 59.91, lon: 10.75 });
  assert.deepEqual(normaliseUnescoPoint({ type: "Feature", geometry: { type: "MultiPoint", coordinates: [[10.75, 59.91], [5.3, 60.4]] } }), { lat: 59.91, lon: 10.75 });
  assert.deepEqual(normaliseUnescoPoint({ type: "Point", coordinates: [10.75, 59.91] }), { lat: 59.91, lon: 10.75 });
  assert.deepEqual(normaliseUnescoPoint({ type: "MultiPoint", coordinates: [[10.75, 59.91]] }), { lat: 59.91, lon: 10.75 });
  assert.equal(normaliseUnescoPoint({ type: "Feature", geometry: null }), null);
  assert.equal(normaliseUnescoPoint({ type: "Feature", geometry: { type: "MultiPoint", coordinates: [] } }), null);
  assert.equal(normaliseUnescoPoint({ type: "Feature", geometry: { type: "Polygon", coordinates: [[[0, 0], [1, 0], [1, 1], [0, 0]]] } }), null);
  assert.equal(normaliseUnescoPoint({ type: "Feature", geometry: { type: "Point", coordinates: [200, 10] } }), null);
  assert.deepEqual(normaliseUnescoPoint([59.91, 10.75]), { lat: 59.91, lon: 10.75 });
  assert.deepEqual(normaliseUnescoPoint({ lat: 59.91, lon: 10.75 }), { lat: 59.91, lon: 10.75 });
  assert.equal(normaliseUnescoPoint(null), null);
});

test("useCountrySites is wired through the same two functions", () => {
  const src = readFileSync(here("../src/nation/data.ts"), "utf8");
  assert.match(src, /normaliseUnescoAtlasRecord\(id, x\)/);
  assert.match(src, /unescoRecordMatchesCountry\(x, iso2, name\)/);
  const page = readFileSync(here("../src/nation/CountryPage.tsx"), "utf8");
  assert.match(page, /useCountrySites\(c\.iso2, c\.short\)/);
});
