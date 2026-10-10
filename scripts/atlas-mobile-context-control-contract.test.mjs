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

test("relationship-chain nodes expose pointer and keyboard-equivalent activation",async()=>{
  const context=await readFile(new URL("../src/earth/Context.tsx",import.meta.url),"utf8");
  const css=await readFile(new URL("../src/earth/world.css",import.meta.url),"utf8");
  const chain=context.match(/const Chain:[\s\S]*?const Li:/)?.[0]??"";

  assert.match(chain,/className="chain-node"/);
  assert.match(chain,/role="button"/);
  assert.match(chain,/tabIndex=\{0\}/);
  assert.match(chain,/aria-label=\{\`Open \$\{n\?\.label \?\? id\}\`\}/);
  assert.match(chain,/onClick=\{\(\) => onOpen\(id\)\}/);
  assert.match(chain,/onKeyDown=\{\(event\) =>/);
  assert.match(chain,/event\.repeat/);
  assert.match(chain,/event\.key === "Enter" \|\| event\.key === " "/);
  assert.match(chain,/event\.preventDefault\(\)/);
  assert.equal((chain.match(/onOpen\(id\)/g)??[]).length,2);

  assert.match(css,/\.world \[role="button"\]:focus-visible/);
  assert.match(css,/\.world \.chain-node\[role="button"\]/);
  assert.match(css,/@media \(prefers-reduced-motion: reduce\)/);
});
