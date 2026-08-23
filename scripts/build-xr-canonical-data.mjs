import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import vm from "node:vm";
import ts from "typescript";

const root = resolve(new URL("..", import.meta.url).pathname);

function loadDataModule(relativePath) {
  const filename = resolve(root, relativePath);
  const source = readFileSync(filename, "utf8");
  const output = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
    },
    fileName: filename,
  }).outputText;

  const module = { exports: {} };
  const sandbox = {
    module,
    exports: module.exports,
    require: () => {
      throw new Error(`XR canonical build does not allow runtime imports in ${relativePath}`);
    },
  };
  vm.runInNewContext(output, sandbox, { filename });
  return module.exports;
}

const speciesModule = loadDataModule("src/data/species.ts");
const livingSystemsModule = loadDataModule("src/data/livingSystems.ts");
const speciesRelationshipsModule = loadDataModule("src/data/speciesRelationships.ts");

const FEEDS = [
  {
    slug: "jaguar",
    expectedId: "taxon:gbif:5219426",
    livingSlug: "amazonia",
    output: "public/xr/generated/jaguar-canonical.json",
    requireSpeciesRelationships: true,
  },
  {
    slug: "orca",
    expectedId: "taxon:gbif:2440483",
    livingSlug: "orca",
    output: "public/xr/generated/orca-canonical.json",
    requireSpeciesRelationships: false,
  },
];

for (const definition of FEEDS) {
  const species = speciesModule.SPECIES_PROFILES.find((profile) => profile.slug === definition.slug);
  const livingSystemAnchor = livingSystemsModule.LIVING_SYSTEM_ANCHORS.find((anchor) => anchor.slug === definition.livingSlug);
  const speciesRelationships = speciesRelationshipsModule.SPECIES_RELATIONSHIPS.filter(
    (relationship) => relationship.fromEntityId === definition.expectedId,
  );

  if (!species) throw new Error(`Canonical ${definition.slug} SPECIES profile missing`);
  if (!livingSystemAnchor) throw new Error(`Canonical ${definition.livingSlug} Living Systems anchor missing`);
  if (species.id !== definition.expectedId) throw new Error(`Unexpected ${definition.slug} identity: ${species.id}`);
  if (definition.requireSpeciesRelationships && !speciesRelationships.length) {
    throw new Error(`Canonical ${definition.slug} species relationships missing`);
  }

  const payload = {
    generatedFrom: ["src/data/species.ts", "src/data/livingSystems.ts", "src/data/speciesRelationships.ts"],
    species,
    livingSystemAnchor,
    speciesRelationships,
  };

  const outputPath = resolve(root, definition.output);
  mkdirSync(dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  console.log(`XR canonical feed: ${outputPath}`);
}
