import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const product = path.join(root, "products", "livingsystems");
const manifest = JSON.parse(await readFile(path.join(root, "docs", "control", "LIVING_SYSTEMS_V142_SOURCE_MANIFEST.json"), "utf8"));
assert.equal(manifest.source_repository, "odinskogen-dev/4Planet_LivingSystems1.4.2");
assert.equal(manifest.source_commit, "0a849ff3fd28e6cc6abcd04c95c5292410443502");
assert.equal(manifest.source_file_count, 88);
assert.equal(manifest.source_paths.length, 88);
assert.equal(new Set(manifest.source_paths).size, 88);
for (const rel of manifest.source_paths) {
  const content = await readFile(path.join(product, rel));
  assert.ok(content.length > 0, `Recovered source file empty: ${rel}`);
}
const nextConfig = await readFile(path.join(product, "next.config.js"), "utf8");
assert.ok(nextConfig.includes('output: "export"'));
assert.ok(nextConfig.includes('trailingSlash: true'));
assert.ok(!nextConfig.includes("basePath"));
const continuation = await readFile(path.join(product, "CONTINUATION.md"), "utf8");
for (const phrase of ["relationships are the asset","Dependency Engine","Trust Layer","Solution Intelligence","Decision Intelligence","Learning Intelligence","Human Use Translation"]) assert.ok(continuation.includes(phrase), `Missing historical invariant: ${phrase}`);
const home = await readFile(path.join(root, "src", "pages", "v5", "Home.tsx"), "utf8");
assert.ok(home.includes('"/livingsystems/"'));
assert.ok(home.includes('reloadDocument={to === "/livingsystems/"}'));
const router = await readFile(path.join(root, "src", "routes", "router.tsx"), "utf8");
assert.ok(router.includes('<Route path="/living-systems" element={<ExternalRedirect to="/livingsystems/" />} />'));
const redirects = await readFile(path.join(root, "public", "_redirects"), "utf8");
assert.ok(redirects.includes("/livingsystems  /livingsystems/  301"));
assert.ok(redirects.includes("/living-systems  /livingsystems/  301"));
const sitemap = await readFile(path.join(root, "scripts", "generate-sitemap.mjs"), "utf8");
assert.ok(sitemap.includes('"/livingsystems/"'));
console.log("LIVING_SYSTEMS_V1.4.2_ZERO_LOSS=PASS");
console.log("SOURCE_FILES=88");
console.log("SOURCE_COMMIT=0a849ff3fd28e6cc6abcd04c95c5292410443502");
