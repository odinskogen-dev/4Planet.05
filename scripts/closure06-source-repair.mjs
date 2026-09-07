import fs from "node:fs";

const path = "src/content/magazineFilms.ts";
const original = fs.readFileSync(path, "utf8");
const startMarker = "const published: FilmRecord[] = [";
const endMarker = "];\n\nconst research: FilmRecord[] = [";
const start = original.indexOf(startMarker);
const end = original.indexOf(endMarker, start);
if (start < 0 || end < 0) throw new Error("Could not isolate canonical published Films registry.");

const corrections = {
  treeline: {
    director: "Jordan Manley",
    credit: "Directed by Jordan Manley. Produced by Laura Yale and Monika McClure for Patagonia Films.",
  },
  undammed: {
    director: "Shane Anderson",
    credit: "Directed and produced by Shane Anderson. Patagonia Films / Swiftwater Films.",
  },
  "the-shitthropocene": {
    director: "David Garrett Byars",
    credit: "Directed by David Garrett Byars. Produced by Emily Perry. A Patagonia Films production.",
  },
  "sea-country-malu-lag": {
    director: "Nicole Gormley",
    credit: "Directed by Nicole Gormley. Released by Patagonia Films.",
  },
  "home-grown": {
    director: "Forest Woodward",
    credit: "Directed by Forest Woodward. Produced by Forest Woodward and Laura Yale for Patagonia.",
  },
  "range-rider": {
    runtime: "29 MIN",
    credit: "Directed by Colin Arisman. Produced by Wild Confluence Media. Presented by Peak Design in association with Patagonia Films.",
  },
  "the-last-observers": {
    runtime: "24 MIN",
    credit: "Directed by Maja K. Mikkelsen. Produced by Adam Mikkelsen. Released by Patagonia.",
  },
};

function pick(body, key) {
  return new RegExp(`\\b${key}:\\s*\"([^\"]+)\"`).exec(body)?.[1] ?? "";
}

function setString(body, key, value) {
  const re = new RegExp(`\\b${key}:\\s*\"[^\"]*\"`);
  if (!re.test(body)) throw new Error(`Missing ${key} in published block.`);
  return body.replace(re, `${key}: ${JSON.stringify(value)}`);
}

const publishedPrefix = original.slice(start, end);
let blockCount = 0;
let patagoniaSourceRepairs = 0;
let metadataRepairs = 0;

const repairedPrefix = publishedPrefix.replace(/publishedFilm\(\{([\s\S]*?)\n  \}\),/g, (full, body) => {
  blockCount += 1;
  const slug = pick(body, "slug");
  const watchUrl = pick(body, "watchUrl");
  const platform = pick(body, "platform");
  let next = body;

  if (platform.includes("PATAGONIA") && /^https:\/\/www\.youtube\.com\/watch\?v=/.test(watchUrl)) {
    next = setString(next, "sourceUrl", watchUrl);
    next = setString(next, "sourceLabel", "PATAGONIA / OFFICIAL FULL FILM");
    patagoniaSourceRepairs += 1;
  }

  const correction = corrections[slug];
  if (correction) {
    for (const [key, value] of Object.entries(correction)) next = setString(next, key, value);
    metadataRepairs += 1;
  }

  return `publishedFilm({${next}\n  }),`;
});

if (blockCount !== 40) throw new Error(`Expected 40 published blocks, repaired ${blockCount}.`);
if (patagoniaSourceRepairs < 20) throw new Error(`Expected broad Patagonia source normalisation, got ${patagoniaSourceRepairs}.`);
if (metadataRepairs !== Object.keys(corrections).length) throw new Error(`Expected ${Object.keys(corrections).length} metadata repairs, got ${metadataRepairs}.`);

const repaired = original.slice(0, start) + repairedPrefix + original.slice(end);
if (repaired === original) throw new Error("Repair produced no change.");
if (/director:\s*\"Patagonia Films\"/.test(repaired.slice(start, end))) throw new Error("Generic Patagonia Films director remains in published registry.");

fs.writeFileSync(path, repaired, "utf8");
console.log(`Closure 06 canonical repair: ${patagoniaSourceRepairs} Patagonia source decisions normalised; ${metadataRepairs} metadata records corrected; 40 published records preserved.`);
