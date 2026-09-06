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
const css = read("src/styles/magazine-films-gold-02.css") + "\n" + read("src/styles/magazine-films-premium-03.css");
const sitemap = read("scripts/generate-sitemap.mjs");
const published = films.split("const published: FilmRecord[] = [")[1]?.split("];\n\nconst research: FilmRecord[] = [")[0] ?? "";
const research = films.split("const research: FilmRecord[] = [")[1]?.split("];\n\nexport const FILMS")[0] ?? "";
const publishedSlugs = [...published.matchAll(/\bslug:\s*"([^"]+)"/g)].map((match) => match[1]);
const researchSlugs = [...research.matchAll(/\bslug:\s*"([^"]+)"/g)].map((match) => match[1]);

const premiumAdditions = [
  "newtok", "the-scale-of-hope", "takayna", "treeline", "jalpi", "corazon-salado", "undammed", "laxathjod", "range-rider", "the-shitthropocene",
  "a-net-plus", "sea-country-malu-lag", "home-grown", "fire-lines", "this-is-not-a-drill", "the-last-observers", "we-can-get-there-from-here", "before-the-flood", "2040", "reinventing-power",
];

test("Films has one canonical 50-record registry with 40 published", () => {
  assert.equal(publishedSlugs.length, 40);
  assert.equal(researchSlugs.length, 10);
  assert.equal(new Set([...publishedSlugs, ...researchSlugs]).size, 50);
  assert.equal(fs.existsSync(path.join(root, "src/content/magazineFilmResearch.ts")), false);
  assert.match(films, /export const FILMS: FilmRecord\[\]/);
  assert.match(films, /export const PUBLISHED_FILMS = published/);
});

test("Premium 03 promotes the requested twenty additional films", () => {
  for (const slug of premiumAdditions) assert.ok(publishedSlugs.includes(slug), `${slug} must be published`);
});

test("Every public film has a watch route, source, description and film-specific image decision", () => {
  assert.equal((published.match(/\bwatchUrl:/g) || []).length, 40);
  assert.equal((published.match(/\bsourceUrl:/g) || []).length, 40);
  assert.equal((published.match(/\bdescription:/g) || []).length, 40);
  assert.equal((published.match(/\bavailabilityNote:/g) || []).length, 40);
  assert.doesNotMatch(published, /contextualImage/);
  assert.doesNotMatch(published, /\/assets\/(?:brand|domains|missions)\//);
  assert.match(films, /https:\/\/i\.ytimg\.com\/vi\//);
  assert.match(published, /images\.squarespace-cdn\.com[^"]+2040-film\.jpg/);
  assert.match(films, /Official film\/trailer promotional material/);
});

test("Public Films surface contains no internal pipeline language", () => {
  assert.doesNotMatch(page, /EDITORIAL PIPELINE/);
  assert.doesNotMatch(page, /qualified records/);
  assert.doesNotMatch(page, /mag-film-research-note/);
  assert.match(page, /CURATED SELECTION/);
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
  assert.match(shell, /magazine-films-premium-03\.css/);
});

test("Magazine home has the automatic Films discovery rail and film-only fallback", () => {
  assert.match(home, /function FilmStream\(\)/);
  assert.match(home, /<FilmStream \/>/);
  assert.match(home, /films_home_rail_open/);
  assert.match(home, /EXPLORE ALL FILMS/);
  assert.match(home, /filmImageFallback/);
  assert.match(home, /film\.fallbackImageUrl/);
  assert.match(css, /mag-film-stream-move/);
  assert.match(css, /prefers-reduced-motion/);
  assert.match(css, /animation-name:none !important/);
});

test("Films grid is an editorial maze and interaction colour remains deterministic", () => {
  assert.match(page, /MAZE_LAYOUTS/);
  assert.match(page, /data-layout=\{layout\}/);
  for (const layout of ["wide", "portrait", "small", "compact", "feature"]) assert.match(css, new RegExp(`mag-film-card--${layout}`));
  assert.match(css, /grid-auto-flow:dense !important/);
  for (const accent of ["blue", "green", "yellow", "orange", "pink", "violet", "cyan", "ink"]) assert.match(css, new RegExp(`data-accent=\\"${accent}\\"`));
  assert.match(css, /background:var\(--film-accent\) !important/);
});

test("Light mastheads are black and dark mode has a final whole-publication closure layer", () => {
  assert.match(css, /data-mag-theme="light"[^\n]+mag-world-masthead[^\n]+#080808/);
  assert.match(css, /data-mag-theme="dark"[^\n]+mag-world-masthead[^\n]+#f4f2eb/);
  assert.match(css, /data-mag-theme="dark"[^\n]+\.mag-home/);
  assert.match(css, /data-mag-theme="dark"[^\n]+\.mag-films/);
  assert.match(css, /background:var\(--mw-bg\) !important/);
});

test("Detail pages retain source transparency, official media and related discovery", () => {
  assert.match(page, /relatedFilms\(film\.slug, 3\)/);
  assert.match(page, /KEEP DISCOVERING/);
  assert.match(page, /AVAILABILITY/);
  assert.match(page, /film_watch_click/);
  assert.match(page, /film_source_click/);
  assert.match(page, /youtube-nocookie\.com/);
  assert.match(page, /Card image comes from the linked film material/);
});

test("Sitemap derives published Films from the canonical published registry", () => {
  assert.match(sitemap, /readPublishedFilmSlugs/);
  assert.match(sitemap, /src\/content\/magazineFilms\.ts/);
  assert.match(sitemap, /publishedFilmSlugs\.map/);
  assert.doesNotMatch(sitemap, /const publishedFilmSlugs = \["yanuni"/);
});
