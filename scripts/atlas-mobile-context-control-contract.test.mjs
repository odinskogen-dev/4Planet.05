import test from "node:test";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";

test("mobile context sheet leaves native MapLibre navigation controls physically operable",async()=>{
  const css=await readFile(new URL("../src/earth/world.css",import.meta.url),"utf8");
  assert.match(css,/\.world:has\(\.ctx\) \.maplibregl-ctrl-bottom-right/);
  assert.match(css,/bottom: calc\(72vh \+ 34px\)/);
});

test("camera proof still uses a real native zoom-control click, not force-click masking",async()=>{
  const spec=await readFile(new URL("../tests/e2e/atlas-core-parent-release.spec.ts",import.meta.url),"utf8");
  assert.match(spec,/await zoomIn\.click\(\)/);
  assert.doesNotMatch(spec,/zoomIn\.click\(\{\s*force:\s*true/);
});
