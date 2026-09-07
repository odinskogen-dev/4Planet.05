import fs from "node:fs";

const path = "tests/e2e/magazine-films-gold.spec.ts";
let source = fs.readFileSync(path, "utf8");
const before = '  test("automatic Films rail becomes static without losing discovery", async ({ page }) => {\n    await page.goto("/magazine");';
const after = '  test("automatic Films rail becomes static without losing discovery", async ({ page }) => {\n    await page.emulateMedia({ reducedMotion: "reduce" });\n    await page.goto("/magazine");';
const count = source.split(before).length - 1;
if (count !== 1) throw new Error(`Expected exactly one reduced-motion test target, found ${count}.`);
source = source.replace(before, after);
fs.writeFileSync(path, source);
console.log("Closure 06 visible-preview fix applied: explicit page reduced-motion emulation.");
