import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import ts from "typescript";

const repoRoot = process.cwd();
const sourcePath = path.join(repoRoot, "src/species/media.ts");
const source = fs.readFileSync(sourcePath, "utf8");

function extractFunction(name) {
  const pattern = new RegExp(
    `(?:export\\s+)?function\\s+${name}\\s*\\([^)]*\\)(?:\\s*:\\s*[^\\{]+)?\\s*\\{[\\s\\S]*?\\n\\}`,
  );
  const match = source.match(pattern);
  assert.ok(match, `Expected ${name} in product source`);
  return match[0].replace(/^export\\s+/, "");
}

const executableSource = [
  extractFunction("normaliseLicence"),
  extractFunction("resolveSpeciesImageLicence"),
  "globalThis.__resolveSpeciesImageLicence = resolveSpeciesImageLicence;",
].join("\n");

const transpiled = ts.transpileModule(executableSource, {
  compilerOptions: {
    module: ts.ModuleKind.None,
    target: ts.ScriptTarget.ES2022,
  },
}).outputText;

const sandbox = {};
vm.runInNewContext(transpiled, sandbox);
const resolveSpeciesImageLicence = sandbox.__resolveSpeciesImageLicence;

test("missing item-level licence fails closed even when an occurrence licence exists", () => {
  const occurrenceLicence = "https://creativecommons.org/licenses/by/4.0/";
  assert.equal(resolveSpeciesImageLicence(undefined), "");
  assert.ok(occurrenceLicence);
});

test("explicit item-level licence is preserved and trimmed", () => {
  assert.equal(
    resolveSpeciesImageLicence("  https://creativecommons.org/licenses/by/4.0/  "),
    "https://creativecommons.org/licenses/by/4.0/",
  );
});

test("GBIF image resolution cannot inherit occurrence-level licence", () => {
  assert.doesNotMatch(source, /media\?\.license\s*\?\?\s*row\?\.license/);
  assert.match(
    source,
    /const license = resolveSpeciesImageLicence\(media\?\.license\);/,
  );
});
