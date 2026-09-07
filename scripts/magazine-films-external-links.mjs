import fs from "node:fs";

// Closure 06: canonical 40-film WATCH + SOURCE inventory gate.
const source = fs.readFileSync("src/content/magazineFilms.ts", "utf8");
const section = source.split("const published: FilmRecord[] = [")[1]?.split("];\n\nconst research: FilmRecord[] = [")[0] ?? "";
const blocks = [...section.matchAll(/publishedFilm\(\{([\s\S]*?)\}\),/g)].map((match) => match[1]);
const pick = (block, key) => new RegExp(`\\b${key}:\\s*\"([^\"]+)\"`).exec(block)?.[1] ?? "";

if (blocks.length !== 40) throw new Error(`External-link gate expected 40 published films, recovered ${blocks.length}.`);

const lines = [];
for (const block of blocks) {
  const slug = pick(block, "slug");
  const watchUrl = pick(block, "watchUrl");
  const sourceUrl = pick(block, "sourceUrl");
  if (!slug || !watchUrl || !sourceUrl) throw new Error(`Missing slug/watch/source in published film block: ${slug || "UNKNOWN"}`);
  for (const [kind, url] of [["WATCH", watchUrl], ["SOURCE", sourceUrl]]) {
    if (!/^https:\/\//.test(url)) throw new Error(`${slug} ${kind} must use HTTPS: ${url}`);
    lines.push(`${slug}\t${kind}\t${url}`);
  }
}

if (lines.length !== 80) throw new Error(`Expected 80 external link decisions, got ${lines.length}.`);
process.stdout.write(`${lines.join("\n")}\n`);
