import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import { resolveBuiltPreviewFile } from "./serve-built-preview.mjs";

test("browser proof preserves the active immutable-SHA run", async () => {
  const workflow = await readFile(
    new URL("../.github/workflows/browser-product-proof.yml", import.meta.url),
    "utf8",
  );

  assert.match(workflow, /group: browser-product-proof-\$\{\{ github\.ref \}\}/);
  assert.match(workflow, /cancel-in-progress: false/);
});

test("built preview prefers prerendered route HTML and preserves SPA fallback", async (t) => {
  const root = await mkdtemp(join(tmpdir(), "4planet-built-preview-"));
  t.after(() => rm(root, { force: true, recursive: true }));

  await mkdir(join(root, "about"), { recursive: true });
  await mkdir(join(root, "now"), { recursive: true });
  await mkdir(join(root, "assets"), { recursive: true });
  await writeFile(join(root, "index.html"), "SPA shell");
  await writeFile(join(root, "about", "index.html"), "About prerender");
  await writeFile(join(root, "now", "index.html"), "Earth Now prerender");
  await writeFile(join(root, "assets", "app.js"), "export {};");

  assert.equal(await resolveBuiltPreviewFile(root, "/now/"), join(root, "now", "index.html"));
  assert.equal(await resolveBuiltPreviewFile(root, "/about"), join(root, "about", "index.html"));
  assert.equal(await resolveBuiltPreviewFile(root, "/place/kenya/"), join(root, "index.html"));
  assert.equal(await resolveBuiltPreviewFile(root, "/assets/app.js"), join(root, "assets", "app.js"));
  assert.equal(await resolveBuiltPreviewFile(root, "/assets/missing.js"), null);
  assert.equal(await resolveBuiltPreviewFile(root, "/%2e%2e/package.json"), null);
});
