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

const sandbox = { exports: {} };
vm.runInNewContext(transpiled, sandbox);
const resolveSpeciesImageLicence = sandbox.__resolveSpeciesImageLicence;

function loadSpeciesMediaModule(fetchImpl) {
  const runtimeSource = source.replace(
    /import \{ COL_XR_CHECKLIST_KEY \} from "@\/species\/engine";/,
    'const COL_XR_CHECKLIST_KEY = "COL_XR";',
  );
  const runtime = ts.transpileModule(runtimeSource, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText;
  const moduleSandbox = {
    exports: {},
    module: { exports: {} },
    fetch: fetchImpl,
    AbortController,
    URLSearchParams,
    setTimeout,
    clearTimeout,
  };
  moduleSandbox.module.exports = moduleSandbox.exports;
  vm.runInNewContext(runtime, moduleSandbox);
  return moduleSandbox.module.exports;
}

function jsonResponse(body, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    async json() { return body; },
  };
}

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

test("media licence classifier fails closed on restrictions and negated public-domain text", () => {
  const { classifySpeciesMediaRights } = loadSpeciesMediaModule(async () => jsonResponse({ results: [] }));

  assert.equal(classifySpeciesMediaRights("CC BY NC 4.0"), "REVIEW_REQUIRED");
  assert.equal(classifySpeciesMediaRights("CC BY ND 4.0"), "REVIEW_REQUIRED");
  assert.equal(classifySpeciesMediaRights("Not public domain"), "REVIEW_REQUIRED");
  assert.equal(classifySpeciesMediaRights("https://creativecommons.org/licenses/by-nc/4.0/"), "REVIEW_REQUIRED");
  assert.equal(classifySpeciesMediaRights("https://creativecommons.org/licenses/by/4.0/"), "DISPLAYABLE");
  assert.equal(classifySpeciesMediaRights("CC BY-SA 4.0"), "DISPLAYABLE");
  assert.equal(classifySpeciesMediaRights("https://creativecommons.org/publicdomain/zero/1.0/"), "DISPLAYABLE");
  assert.equal(classifySpeciesMediaRights("https://evil.example/creativecommons.org/licenses/by/4.0/"), "REVIEW_REQUIRED");
  assert.equal(classifySpeciesMediaRights("https://creativecommons.org.evil.example/licenses/by/4.0/"), "REVIEW_REQUIRED");
  assert.equal(classifySpeciesMediaRights("https://creativecommons.org/licenses/by/4.0/?via=forged"), "REVIEW_REQUIRED");
  assert.equal(classifySpeciesMediaRights("CC BY 4.0; All rights reserved"), "REVIEW_REQUIRED");
  assert.equal(classifySpeciesMediaRights("CC0 1.0 / permission required"), "REVIEW_REQUIRED");
  assert.equal(classifySpeciesMediaRights("https://creativecommons.org/publicdomain/mark/1.0/"), "DISPLAYABLE");
});

test("GBIF image resolution cannot inherit occurrence-level licence", () => {
  assert.doesNotMatch(source, /media\?\.license\s*\?\?\s*row\?\.license/);
  assert.match(
    source,
    /const license = resolveSpeciesImageLicence\(media\?\.license\);/,
  );
});

test("mocked GBIF request path withholds unlicensed media across country and global fallback", async () => {
  const requests = [];
  const fetchMock = async (url) => {
    requests.push(String(url));
    return jsonResponse({
      results: [{
        key: 123,
        license: "https://creativecommons.org/licenses/by/4.0/",
        media: [{
          type: "StillImage",
          format: "image/jpeg",
          identifier: "https://example.test/unlicensed.jpg",
        }],
      }],
    });
  };
  const { fetchResolvedSpeciesImages } = loadSpeciesMediaModule(fetchMock);

  const result = await fetchResolvedSpeciesImages("2440483", { countryFirst: "NO", limit: 2 });

  assert.equal(result.ok, true);
  assert.equal(result.data.length, 0);
  assert.equal(result.blockedCount, 1);
  assert.equal(requests.length, 2);
  assert.match(requests[0], /taxonKey=2440483/);
  assert.match(requests[0], /country=NO/);
  assert.doesNotMatch(requests[1], /country=/);
});


test("mocked GBIF request path counts different blocked identifiers separately", async () => {
  const responses = [
    {
      key: 123,
      media: [{
        type: "StillImage",
        format: "image/jpeg",
        identifier: "https://example.test/country-blocked.jpg",
      }],
    },
    {
      key: 456,
      media: [{
        type: "StillImage",
        format: "image/jpeg",
        identifier: "https://example.test/global-blocked.jpg",
      }],
    },
  ];
  let requestIndex = 0;
  const fetchMock = async () => jsonResponse({
    results: [responses[requestIndex++]],
  });
  const { fetchResolvedSpeciesImages } = loadSpeciesMediaModule(fetchMock);

  const result = await fetchResolvedSpeciesImages("2440483", { countryFirst: "NO", limit: 2 });

  assert.equal(result.ok, true);
  assert.equal(result.data.length, 0);
  assert.equal(result.blockedCount, 2);
  assert.match(result.note, /2 media items were withheld/);
});

test("mocked GBIF request path returns only media with its own displayable licence", async () => {
  const fetchMock = async () => jsonResponse({
    results: [{
      key: 456,
      license: "https://creativecommons.org/licenses/by/4.0/",
      scientificName: "Orcinus orca",
      media: [
        {
          type: "StillImage",
          format: "image/jpeg",
          identifier: "https://example.test/inherited-only.jpg",
        },
        {
          type: "StillImage",
          format: "image/jpeg",
          identifier: "https://example.test/item-licensed.jpg",
          license: " https://creativecommons.org/licenses/by-sa/4.0/ ",
          creator: "Example creator",
        },
      ],
    }],
  });
  const { fetchResolvedSpeciesImages } = loadSpeciesMediaModule(fetchMock);

  const result = await fetchResolvedSpeciesImages("2440483", { countryFirst: "NO", limit: 2 });

  assert.equal(result.ok, true);
  assert.equal(result.data.length, 1);
  assert.equal(result.blockedCount, 1);
  assert.equal(result.data[0].identifier, "https://example.test/item-licensed.jpg");
  assert.equal(result.data[0].license, "https://creativecommons.org/licenses/by-sa/4.0/");
  assert.equal(result.data[0].rightsState, "DISPLAYABLE");
});

test("mocked GBIF request path withholds ambiguous licence labels before positive substrings", async () => {
  const licences = [
    ["cc-by-nc.jpg", "CC BY NC 4.0"],
    ["cc-by-nd.jpg", "CC BY ND 4.0"],
    ["not-public-domain.jpg", "Not public domain"],
    ["canonical-by.jpg", "https://creativecommons.org/licenses/by/4.0/"],
    ["forged-path.jpg", "https://evil.example/creativecommons.org/licenses/by/4.0/"],
    ["forged-host.jpg", "https://creativecommons.org.evil.example/licenses/by/4.0/"],
    ["canonical-query.jpg", "https://creativecommons.org/licenses/by/4.0/?via=forged"],
    ["contradictory-by.jpg", "CC BY 4.0; All rights reserved"],
    ["contradictory-cc0.jpg", "CC0 1.0 / permission required"],
    ["canonical-cc0.jpg", "https://creativecommons.org/publicdomain/zero/1.0/"],
  ];
  const fetchMock = async () => jsonResponse({
    results: [{
      key: 789,
      media: licences.map(([name, license]) => ({
        type: "StillImage",
        format: "image/jpeg",
        identifier: `https://example.test/${name}`,
        license,
      })),
    }],
  });
  const { fetchResolvedSpeciesImages } = loadSpeciesMediaModule(fetchMock);

  const result = await fetchResolvedSpeciesImages("2440483", { countryFirst: "NO", limit: 8 });

  assert.equal(result.ok, true);
  assert.deepEqual(
    [...result.data].map((image) => image.identifier),
    ["https://example.test/canonical-by.jpg", "https://example.test/canonical-cc0.jpg"],
  );
  assert.equal(result.blockedCount, 8);
  assert.match(result.note, /8 media items were withheld/);
});
