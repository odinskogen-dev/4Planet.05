import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = (path) => readFileSync(new URL("../" + path, import.meta.url), "utf8");
test("ATLAS Embed shares canonical Atlas/ProductContext rather than a new map engine", () => {
  const contract = source("src/earth/atlasViewContract.ts");
  const embed = source("src/earth/AtlasEmbed.tsx");
  assert.match(contract, /placeById/);
  assert.match(contract, /atlasHrefFromState/);
  assert.match(contract, /canonicalReturnState/);
  assert.match(contract, /PRIVATE/);
  assert.match(embed, /atlasEmbedHref/);
  assert.match(embed, /OPEN FULL ATLAS/);
  assert.doesNotMatch(embed, /new maplibregl.Map/);
});
test("Embedded ATLAS reuses first-party renderer without standalone-host recursion", () => {
  const app = source("src/App.tsx");
  const runtime = source("src/earth/AtlasEmbedRuntime.tsx");
  assert.match(app, /isFirstPartyAtlasEmbedRoute/);
  assert.match(app, /<AtlasEmbedRuntime \/>/);
  assert.match(runtime, /ResizeObserver/);
  assert.match(runtime, /map\?\.resize/);
  assert.doesNotMatch(runtime, /flyTo|easeTo|setCenter/);
});
test("NATION and SPECIES use existing identities and honest spatial context", () => {
  const nation = source("src/pages/nation/NationPage.tsx");
  const species = source("src/pages/integrated/Species.tsx");
  assert.match(nation, /placeId: nationPlace.id/);
  assert.match(nation, /Navigation extent only/);
  assert.match(species, /entityId: profile.id/);
  assert.match(species, /Historical occurrence records are not live animal positions/);
});

test("MapLibre v6 uses a self-contained Vite worker, never SPA HTML fallback", () => {
  const world = source("src/earth/World.tsx");
  assert.match(world, /maplibre-gl-worker\.mjs\?worker&url/);
  assert.match(world, /maplibregl\.setWorkerUrl\(maplibreWorkerUrl\)/);
});

test("Standalone product hosts route full Atlas to canonical 4PLANET, with query preserved", () => {
  const view = source("src/earth/atlasViewContract.ts");
  const embed = source("src/earth/AtlasEmbed.tsx");
  assert.match(view, /export function atlasFullDestination/);
  assert.match(view, /https:\/\/4planet\.org/);
  assert.match(view, /4planet-05\.pages\.dev/);
  assert.match(embed, /atlasFullDestination\(full/);
});

test("Contextual embed overrides legacy strict size containment without touching old home globe", () => {
  const component = source("src/earth/AtlasEmbed.tsx");
  const css = source("src/earth/atlas-embed.css");
  assert.match(component, /atlas-embed atlas-embed--contextual/);
  assert.match(css, /\.atlas-embed\.atlas-embed--contextual\{contain:none!important;display:block;min-height:/);
  assert.doesNotMatch(css, /\.atlas-embed\.atlas-embed--contextual\{contain:strict\}/);
});
