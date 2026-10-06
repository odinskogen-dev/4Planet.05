import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const app = path.join(root, "products", "livingsystems");
const configPath = path.join(app, "next.config.js");
const outPath = path.join(app, "out");
const publicTarget = path.join(root, "public", "livingsystems");

function run(command, args, cwd) {
  const result = spawnSync(command, args, { cwd, stdio: "inherit", shell: process.platform === "win32" });
  if (result.status !== 0) throw new Error(`${command} ${args.join(" ")} failed with status ${result.status}`);
}

const originalConfig = await readFile(configPath, "utf8");
const marker = 'trailingSlash: true,';
if (!originalConfig.includes(marker)) throw new Error("LSI v1.4.2 next.config source marker missing");
if (originalConfig.includes("basePath")) throw new Error("ZERO LOSS violation: committed next.config must remain source-identical");
const runtimeConfig = originalConfig.replace(marker, marker + '\n  basePath: "/livingsystems",');

await writeFile(configPath, runtimeConfig, "utf8");
try {
  run("npm", ["ci", "--no-audit", "--no-fund"], app);
  run("npm", ["run", "build"], app);
  await rm(publicTarget, { recursive: true, force: true });
  await mkdir(publicTarget, { recursive: true });
  await cp(outPath, publicTarget, { recursive: true });
  console.log("LIVING_SYSTEMS_V1.4.2_BUILD=PASS");
  console.log("PUBLIC_TARGET=/livingsystems/");
} finally {
  await writeFile(configPath, originalConfig, "utf8");
}
