import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
const films = read("src/content/magazineFilms.ts");
const page = read("src/pages/v5/MagazineFilms.tsx");
const shell = read("src/components/magazine/MagazineShell.tsx");
const home = read("src/pages/v5/Magazine.tsx");
const css = read("src/styles/magazine-films-gold-02.css");
const sitemap = read("scripts/generate-sitemap.mjs");
const published = films.split("const published: FilmRecord[] = [")[1]?.split("];\n\nconst research: FilmRecord[] = [")[0] ?? "";
const publishedSlugs = [...published.matchAll(/\bslug:\s*"([^"]+)"/g)].map((match) => match[1]);
const researchSlugs = [...films.matchAll(/researchFilm\(\{\s*slug:\s*"([^"]+)"/g)].map((match) => match[1]);

const selection02 = [
  "artifishal",
  "damnation",
  "public-trust",
  "we-the-power",
  "blue-heart",
  "the-custodians",
  "mission-blue",
  "breaking-boundaries",
  "the-ivory-game",
  "the-biggest-little-farm",
];

test("Films has one canonical 50-record registry with 20 published", () => {
  assert.equal(publishedSlugs.length, 20);
  assert.equal(researchSlugs.length, 30);
  assert.equal(new Set([...publishedSlugs, ...researchSlugs]).size, 50);
  assert.equal(fs.existsSync(path.join(root, "src/content/magazineFilmResearch.ts")), false);
  assert.match(films, /export const FILMS: FilmRecord\[\]/);
  assert.match(films, /status: FilmStatus/);
  assert.match(films, /topics: FilmTopic\[\]/);
  assert.match(films, /imageRights: string/);
});

test("Selection 02 ten-film promotion is present", () => {
  for (const slug of selection02) assert.ok(publishedSlugs.includes(slug), `${slug} must be published`);
});

test("Every published film carries source, watch, image and availability decisions", () => {
  assert.equal((published.match(/\bwatchUrl:/g) || []).length, 20);
  assert.equal((published.match(/\bsourceUrl:/g) || []).length, 20);
  assert.equal((published.match(/\bavailabilityNote:/g) || []).length, 20);
  assert.equal((published.match(/\.\.\.contextualImage\(/g) || []).length, 20);
  assert.doesNotMatch(published, /i\.ytimg\.com/);
});

test("Films discovery uses explicit topics and exposes only populated filters", () => {
  assert.match(page, /film\.topics\.includes/);
  assert.doesNotMatch(page, /film\.focus\.includes/);
  assert.match(page, /availableFilters/);
  assert.match(page, /film_filter_use/);
});

test("Films shell identity and active navigation are route-aware", () => {
  assert.match(shell, /const isFilms = location\.pathname === "\/films"/);
  assert.match(shell, /\{isFilms \? "FILMS" : "MAGAZINE"\}/);
  assert.match(shell, /aria-current=\{isFilms \? "page" : undefined\}/);
  assert.match(shell, /data-mag-section=\{isFilms \? "films" : "magazine"\}/);
});

test("Magazine home has the automatic Films discovery rail", () => {
  assert.match(home, /function FilmStream\(\)/);
  assert.match(home, /<FilmStream \/>/);
  assert.match(home, /films_home_rail_open/);
  assert.match(home, /EXPLORE ALL FILMS/);
  assert.match(css, /mag-film-stream-move/);
  assert.match(css, /prefers-reduced-motion/);
  assert.match(css, /touch-action:pan-x/);
});

test("Mobile Films grid is compact two-up and interaction palette is deterministic", () => {
  assert.match(css, /@media \(max-width:640px\)[\s\S]*?\.mag-film-card,[\s\S]*?grid-column:span 6 !important/);
  for (const accent of ["blue", "green", "yellow", "orange", "pink", "violet", "cyan", "ink"]) {
    assert.match(css, new RegExp(`data-accent=\\"${accent}\\"`));
  }
  assert.match(css, /@media \(hover:hover\)/);
  assert.match(css, /@media \(hover:none\)/);
});

test("Detail pages retain source transparency and add related discovery", () => {
  assert.match(page, /relatedFilms\(film\.slug, 3\)/);
  assert.match(page, /KEEP DISCOVERING/);
  assert.match(page, /AVAILABILITY/);
  assert.match(page, /film_watch_click/);
  assert.match(page, /film_source_click/);
  assert.match(page, /youtube-nocookie\.com/);
});

test("Sitemap derives published Films from the canonical registry", () => {
  assert.match(sitemap, /readPublishedFilmSlugs/);
  assert.match(sitemap, /src\/content\/magazineFilms\.ts/);
  assert.match(sitemap, /publishedFilmSlugs\.map/);
  assert.doesNotMatch(sitemap, /const publishedFilmSlugs = \["yanuni"/);
});
