// EXACT CURRENT HEIR QA 2026-10-14
import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import ts from "typescript";

const read = (path) => fs.readFileSync(path, "utf8");

test("UNESCO shared contract is dataset-scoped and ShareAlike-aware", () => {
  const data = read("src/data/unescoOpenData.ts");
  for (const id of ["mab001", "whc001", "eg0001", "ioc001", "cou001"]) {
    assert.match(data, new RegExp(`\\b${id}\\b`));
  }
  assert.match(data, /CC BY-SA 4\.0/);
  assert.match(data, /YES_WITH_ATTRIBUTION_AND_SHAREALIKE/);
  assert.match(data, /shareAlike:\s*true/);
  assert.match(data, /missing|sovereignty|abundance|boundary/i);
});


test("UNESCO ocean metrics preserve missing values while retaining genuine zero", async () => {
  const source = read("src/data/unescoOpenData.ts");
  const javascript = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText;
  const moduleUrl = `data:text/javascript;base64,${Buffer.from(javascript).toString("base64")}`;
  const { normaliseUnescoAtlasRecord } = await import(moduleUrl);

  const base = {
    area_id: "EEZ:QA",
    area_name: "QA Ocean Area",
    coordinates: { lat: 0, lon: 20 },
  };
  const missing = normaliseUnescoAtlasRecord("ioc001", {
    ...base,
    n_observations: null,
    n_species: "",
    n_taxa: "   ",
    n_datasets: undefined,
    n_threatened_species: null,
    pct_threatened: "",
  });
  assert.ok(missing);
  for (const key of ["observations", "species", "taxa", "datasets", "threatenedSpecies", "threatenedShare"]) {
    assert.equal(missing.metrics[key], undefined, `${key} must remain UNKNOWN`);
  }

  const zero = normaliseUnescoAtlasRecord("ioc001", {
    ...base,
    n_observations: 0,
    n_species: "0",
    n_taxa: 0,
    n_datasets: "0",
    n_threatened_species: 0,
    pct_threatened: "0",
  });
  assert.ok(zero);
  for (const key of ["observations", "species", "taxa", "datasets", "threatenedSpecies", "threatenedShare"]) {
    assert.equal(zero.metrics[key], 0, `${key} must preserve genuine zero`);
  }
});

test("UNESCO geopoints fail closed on unknown components while preserving real zero and bounds", async () => {
  const source = read("src/data/unescoOpenData.ts");
  const javascript = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const moduleUrl = `data:text/javascript;base64,${Buffer.from(javascript).toString("base64")}`;
  const { normaliseUnescoPoint, normaliseUnescoAtlasRecord } = await import(moduleUrl);

  for (const coordinates of [
    [null, null],
    [null, 20],
    [undefined, 20],
    ["", 20],
    ["   ", 20],
    [false, 20],
    { lat: "", lon: 20 },
    { lat: true, lon: 20 },
    { lat: 91, lon: 20 },
    { lat: 20, lon: 181 },
  ]) {
    assert.equal(normaliseUnescoPoint(coordinates), null);
    assert.equal(normaliseUnescoAtlasRecord("eg0001", {
      ugg_id: "invalid-point",
      title_en: "Invalid Point",
      coordinates,
    }), null);
  }

  assert.deepEqual(normaliseUnescoPoint([0, 20]), { lat: 0, lon: 20 });
  assert.deepEqual(normaliseUnescoPoint([-90, 180]), { lat: -90, lon: 180 });
  assert.deepEqual(normaliseUnescoPoint({ lat: "0", lon: "20" }), { lat: 0, lon: 20 });
});

test("UNESCO geoparks expose mixed source editions without promoting designation into protection or outcome", async () => {
  const source = read("src/data/unescoOpenData.ts");
  const javascript = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const moduleUrl = `data:text/javascript;base64,${Buffer.from(javascript).toString("base64")}`;
  const { UNESCO_DATASETS, normaliseUnescoAtlasRecord } = await import(moduleUrl);

  const metadata = UNESCO_DATASETS.eg0001;
  assert.equal(metadata.edition.status, "MIXED_EDITION");
  assert.equal(metadata.edition.datasetDescriptionAsOf, "2025-01-15");
  assert.equal(metadata.edition.datasetProcessedAt, "UNKNOWN");
  assert.equal(metadata.edition.referenceUpdatedAt, "2026-07-24");
  assert.equal(metadata.edition.referenceCountSummary, "241 geoparks / 51 countries");
  assert.match(metadata.edition.limitation, /stale reference text/i);
  assert.match(metadata.edition.limitation, /must not be presented as the same edition/i);

  const record = normaliseUnescoAtlasRecord("eg0001", {
    ugg_id: "qa-geopark",
    title_en: "QA Global Geopark",
    coordinates: { lat: 10, lon: 20 },
    date: "2021",
  });
  assert.ok(record);
  assert.equal(record.designationType, "UNESCO_GLOBAL_GEOPARK");
  assert.equal(record.legalProtection, "UNKNOWN");
  assert.equal(record.revalidationStatus, "UNKNOWN");
  assert.equal(record.ecologicalOutcome, "UNKNOWN");

  const layers = read("src/earth/layers.ts");
  assert.match(layers, /description.*stale/i);
  assert.match(layers, /legal protection UNKNOWN/);
  assert.match(layers, /revalidation status UNKNOWN/);
  assert.match(layers, /ecological outcome UNKNOWN/);
  assert.match(layers, /Current UNESCO list/);
});

test("UNESCO API adapter is bounded and allowlisted", () => {
  const api = read("functions/api/unesco-data.ts");
  for (const id of ["mab001", "whc001", "eg0001", "ioc001", "cou001"]) {
    assert.match(api, new RegExp(`\\b${id}\\b`));
  }
  assert.match(api, /UNSUPPORTED_DATASET/);
  assert.match(api, /PAGE_SIZE = 100/);
  assert.match(api, /maxRecords/);
  assert.doesNotMatch(api, /url\.searchParams\.get\(["']url["']\)/);
});

test("ATLAS exposes the four curated P0 layer families without replacing Protected Planet", () => {
  const layers = read("src/earth/layers.ts");
  for (const id of [
    "unesco-biospheres",
    "unesco-world-heritage",
    "unesco-geoparks",
    "unesco-ocean-biodiversity",
  ]) {
    assert.match(layers, new RegExp(`id: "${id}"`));
  }
  assert.match(layers, /id: "protected"[\s\S]*kind: "planned"/);
  assert.match(layers, /not reserve boundaries|not the full site boundary|not geopark boundaries/i);
  assert.match(layers, /not abundance[\s\S]*not live positions/i);
});

test("ATLAS point lifecycle is data-driven and source depth is controlled", () => {
  const atlas = read("src/earth/World.tsx");
  assert.match(atlas, /drawPoints\(l\.id, l\.label, l\.src, l\.note, rows, l\.color, l\.r\)/);
  assert.match(atlas, /l\.kind === "raster"/);
  assert.match(atlas, /l\.kind === "live"/);
  assert.match(atlas, /RIGHTS · \{l\.rights\}/);
  assert.match(atlas, /TIME · \{l\.period\}/);
});

test("ATLAS source control keeps endpoint and map evidence separate from rights", () => {
  const control = read("src/earth/atlasSourceControl.ts");
  for (const id of [
    "unesco-mab",
    "unesco-world-heritage",
    "unesco-geoparks",
    "unesco-obis-ocean-areas",
    "unesco-member-states",
  ]) {
    assert.match(control, new RegExp(`"${id}"`));
  }
  assert.match(control, /endpoint: "PASS"/);
  assert.match(control, /map: "PENDING"/);
  assert.match(control, /rights: "PASS"/);
});


test("WDI country context is country-bounded and preserves mixed vintages", () => {
  const api = read("functions/api/unesco-country.ts");
  const contract = read("src/data/unescoCountryContext.ts");
  assert.match(api, /dataset=wdi001|wdi001/);
  assert.match(api, /INVALID_COUNTRY_ISO2/);
  assert.match(api, /limit: "100"/);
  assert.match(api, /where:/);
  assert.match(contract, /CC BY-SA 4\.0/);
  assert.match(contract, /MIXED_VINTAGE/);
  assert.match(contract, /MISSING_NOT_ZERO/);
  assert.match(contract, /fetchCountryDevelopmentContext/);
  assert.match(contract, /latestCountryMetrics/);
});


test("NATUREBRAIN source-family migration registers metadata but keeps ingestion disabled", () => {
  const migration = read("supabase/migrations/20261013120500_naturebrain_unesco_source_family_v01.sql");
  assert.match(migration, /source:unesco-datahub/);
  for (const id of ["mab001", "whc001", "eg0001", "ioc001", "cou001", "wdi001"]) {
    assert.match(migration, new RegExp(`dataset:unesco:${id}`));
  }
  assert.match(migration, /REGISTERED_DISABLED/);
  assert.match(migration, /enabled=false/);
  assert.match(migration, /no_wholesale_ingest/);
  assert.doesNotMatch(migration, /insert into planetbrain\.source_records/i);
  assert.doesNotMatch(migration, /insert into planetbrain\.claims/i);
  assert.doesNotMatch(migration, /insert into planetbrain\.relationships/i);
});



test("NATUREBRAIN additional qualified source families stay metadata-only and disabled", () => {
  const migration = read("supabase/migrations/20261013133000_naturebrain_green_un_data_sources_v01.sql");
  for (const source of [
    "source:undp-hdro",
    "source:unido-stat",
    "source:ilostat",
    "source:unhcr-refugee-statistics",
    "source:undata-legacy",
  ]) {
    assert.ok(migration.includes(source), source);
  }
  for (const dataset of [
    "dataset:unesco:uis001",
    "dataset:unesco:edp002",
    "dataset:unesco:voc001",
    "dataset:undp:hdro-composite-indices",
    "dataset:unido:country-profile",
    "dataset:unido:indstat4",
    "dataset:unido:national-accounts",
    "dataset:unido:manufacturing-trade",
    "dataset:unido:sdg9",
    "dataset:unhcr:refugee-population-statistics",
    "dataset:undata:country-profiles",
  ]) {
    assert.ok(migration.includes(dataset), dataset);
  }
  assert.match(migration, /REGISTERED_DISABLED/);
  assert.match(migration, /enabled=false/);
  assert.match(migration, /no_wholesale_ingest/);
  assert.doesNotMatch(migration, /insert into planetbrain\.claims/i);
  assert.doesNotMatch(migration, /insert into planetbrain\.relationships/i);
});

test("GREEN DATA source matrix preserves active versus registered-next boundary", () => {
  const matrix = read("docs/control/GREEN_DATA_SOURCE_MATRIX_20261013.md");
  assert.match(matrix, /P0 ACTIVE PRODUCT READS/i);
  assert.match(matrix, /REGISTERED NEXT/i);
  assert.match(matrix, /No bulk claims\/observations were created/i);
  assert.match(matrix, /missing\/source failure is not zero/i);
});
