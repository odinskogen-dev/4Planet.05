import fs from "node:fs";

const path = "src/content/magazineFilms.ts";
let source = fs.readFileSync(path, "utf8");

const replacements = [
  [
    'slug: "blue-heart", title: "Blue Heart", year: 2018,',
    'slug: "blue-heart", title: "Blue Heart", year: 2019,',
  ],
  [
    'slug: "corazon-salado", title: "Corazón Salado", year: 2023, focus: "OCEAN / INDIGENOUS STEWARDSHIP / PATAGONIA", topics: ["OCEAN", "PEOPLE", "SOLUTIONS"], accent: "pink", director: "Dani Casado", runtime: "28 MIN",',
    'slug: "corazon-salado", title: "Corazón Salado", year: 2023, focus: "OCEAN / INDIGENOUS STEWARDSHIP / PATAGONIA", topics: ["OCEAN", "PEOPLE", "SOLUTIONS"], accent: "pink", director: "Dani Casado", runtime: "27 MIN",',
  ],
  [
    'slug: "artifishal", title: "Artifishal", year: 2019, focus: "RIVERS / SALMON / AQUACULTURE", topics: ["OCEAN", "FOOD", "SOLUTIONS"], accent: "pink", director: "Liars & Thieves!", runtime: "79 MIN",',
    'slug: "artifishal", title: "Artifishal", year: 2019, focus: "RIVERS / SALMON / AQUACULTURE", topics: ["OCEAN", "FOOD", "SOLUTIONS"], accent: "pink", director: "Josh “Bones” Murphy", runtime: "79 MIN",',
  ],
  [
    'credit: "A Patagonia film. Direction credited by Patagonia to Liars & Thieves!.",',
    'credit: "Directed and produced by Josh “Bones” Murphy; a film by Liars & Thieves!; executive produced by Yvon Chouinard.",',
  ],
];

for (const [before, after] of replacements) {
  if (!source.includes(before)) throw new Error(`Expected metadata target missing: ${before.slice(0, 90)}`);
  source = source.replace(before, after);
}

if (source.includes('slug: "blue-heart", title: "Blue Heart", year: 2018')) throw new Error("Blue Heart stale year remains.");
if (source.includes('slug: "corazon-salado"') && !source.includes('director: "Dani Casado", runtime: "27 MIN"')) throw new Error("Corazón Salado runtime repair missing.");
if (!source.includes('slug: "artifishal"') || !source.includes('director: "Josh “Bones” Murphy"')) throw new Error("Artifishal director repair missing.");

fs.writeFileSync(path, source, "utf8");
console.log("Closure 06 final metadata repair: Blue Heart year, Corazón Salado runtime, Artifishal director/credit corrected from current official/rights-holder evidence.");
