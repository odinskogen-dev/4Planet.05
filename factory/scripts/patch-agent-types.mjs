import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const generatedTypesPath = fileURLToPath(new URL("../worker-configuration.d.ts", import.meta.url));
const source = readFileSync(generatedTypesPath, "utf8");
const typedBinding = 'PRODUCTION_FACTORY: DurableObjectNamespace<import("./src/index").ProductionFactoryAgent>;';

if (source.includes(typedBinding)) {
  process.exit(0);
}

const untypedBinding = /PRODUCTION_FACTORY:\s*DurableObjectNamespace(?:<[^;>]+>)?\s*(?:\/\*\s*ProductionFactoryAgent\s*\*\/)?;/;
if (!untypedBinding.test(source)) {
  throw new Error("Unable to locate PRODUCTION_FACTORY Durable Object binding in generated Wrangler types");
}

writeFileSync(generatedTypesPath, source.replace(untypedBinding, typedBinding));
console.log("Factory Agent binding type patched to ProductionFactoryAgent");
