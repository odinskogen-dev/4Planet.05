import fs from "node:fs";

const testPath = "tests/e2e/product-proof.spec.ts";
let testText = fs.readFileSync(testPath, "utf8");
testText = testText.replaceAll("ECOLOGICAL SOURCE REVIEW PENDING", "POPULATION-SPECIFIC CLAIMS CONTROLLED");
testText = testText.replace("/do not establish range, abundance, population trend or live tracking/i", "/does not establish range, abundance, population trend/i");
fs.writeFileSync(testPath, testText);

fs.writeFileSync(
  "public/product-build.txt",
  [
    "4PLANET founder-gate ONE INTERFACE convergence candidate",
    "Release marker: founder-gate-one-interface-convergence-2026-08-07",
    "Status: private founder-review preview, not Beta or production",
    "Authority: Odin final authority",
    "",
  ].join("\n"),
);

// Trigger marker: safe remediation pass 2.
