import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const router = readFileSync(new URL("../src/routes/router.tsx", import.meta.url), "utf8");
const deferredRoutes = readFileSync(new URL("../src/routes/deferredRoutes.tsx", import.meta.url), "utf8");
const bridge = readFileSync(new URL("../src/components/PublicCompletionBridge.tsx", import.meta.url), "utf8");
const shell = readFileSync(new URL("../src/components/layout/PublicShell.tsx", import.meta.url), "utf8");
const css = readFileSync(new URL("../src/styles/premium-completion.css", import.meta.url), "utf8");
const about = readFileSync(new URL("../src/pages/v5/AboutPages.tsx", import.meta.url), "utf8");
const join = readFileSync(new URL("../src/pages/v5/Join.tsx", import.meta.url), "utf8");
const home = readFileSync(new URL("../src/pages/v5/Home.tsx", import.meta.url), "utf8");
const orca = readFileSync(new URL("../public/journey/orca/index.html", import.meta.url), "utf8");

test("participation routes and global menu expose all four ways to take part", () => {
  assert.ok(deferredRoutes.includes('export const Join = lazy(() => import("@/pages/v5/Join"));'));
  assert.match(router, /path="\/join" element={<Join \/>}/);
  assert.match(router, /path="\/people" element={<People \/>}/);
  assert.match(join, /WAYS TO TAKE PART NOW/);
  assert.match(join, /people, partners, brands and funders/);
  for (const label of ["4PEOPLE", "4BRANDS", "4PARTNERS", "4FUNDERS"]) assert.match(shell, new RegExp(label));
  for (const route of ["/people", "/brands", "/partners", "/funders"]) assert.match(shell, new RegExp(route.replace("/", "\\/")));
  assert.doesNotMatch(bridge, /DesktopTakePart|completion-takepart-menu/);
});

test("About routes preserve the approved Story System and Founder surfaces", () => {
  assert.match(router, /path="\/about\/story" element={<AboutStory \/>}/);
  assert.match(router, /path="\/about\/system" element={<AboutSystem \/>}/);
  assert.match(router, /path="\/about\/founder" element={<Founder \/>}/);
  assert.match(about, /Everything I love is alive\./);
  assert.match(about, /founder-grass\.jpg/);
  assert.doesNotMatch(about, /founder-hero\.svg|founder-portrait\.svg/);
});

test("Magazine and Film are external public projects reached through controlled 4planet.org redirect routes", () => {
  assert.match(shell, /4PLANET MAGAZINE/);
  assert.match(shell, /\["4PLANET MAGAZINE", "Editorial", "\/magazine"\]/);
  assert.match(shell, /4PLANET FILM/);
  assert.match(shell, /\["4PLANET FILM", "Film", "\/missions\/4film"\]/);
  assert.match(router, /ExternalRedirect to="https:\/\/4planetmagazine\.com"/);
  assert.match(router, /ExternalRedirect to="https:\/\/4planetmagazine\.com\/films"/);
});

test("4RT reaches its mission surface and product lenses preserve supported context", () => {
  assert.match(router, /path="\/missions\/4rt" element={<MissionDetail \/>}/);
  assert.doesNotMatch(router, /path="\/missions\/4rt" element={toMarket}/);
  assert.match(shell, /import \{ contextHref \} from "@\/product\/ProductNav"/);
  assert.match(shell, /to={contextHref\(to, search\)}/);
  assert.match(shell, /LENSES\.map\(\(\[title, line, to\]\) => <LensLink/);
});

test("mobile navigation exposes Culture and contains keyboard focus", () => {
  assert.match(shell, />CULTURE_<\/div>/);
  assert.match(shell, /CULTURE\.map/);
  assert.match(shell, /id="public-mobile-navigation"/);
  assert.match(shell, /aria-controls="public-mobile-navigation"/);
  assert.match(shell, /className="mobile-nav__close"/);
  assert.match(shell, /event\.key !== "Tab"/);
  assert.match(shell, /document\.activeElement === first/);
  assert.match(shell, /document\.activeElement === last/);
  assert.match(shell, /previousOverflow/);
});

test("public missions expose truthful deeper product handoffs", () => {
  assert.match(bridge, /https:\/\/s4piens\.com/);
  assert.match(bridge, /https:\/\/s4piens\.com\/food/);
  assert.match(bridge, /\/food\/lens/);
  assert.match(bridge, /\/journey\/orca\//);
});

test("public completion styles preserve premium participation Species and Living Systems treatments", () => {
  assert.match(css, /\.part-box:hover/);
  assert.match(css, /background:var\(--blue\)!important/);
  assert.match(css, /main:has\(#species-results\) \.three/);
  assert.match(css, /main:has\(\.ls-anchors\)/);
  assert.match(css, /earth-iss\.jpg/);
});

test("Orca public chrome does not expose internal Gold naming", () => {
  const footer = orca.match(/<footer[\s\S]*?<\/footer>/)?.[0] ?? "";
  assert.ok(footer.length > 0);
  assert.doesNotMatch(footer, /\bGOLD\b/i);
});

test("homepage exposes the complete public universe and three guided entry journeys", () => {
  for (const route of [
    "/atlas",
    "/species",
    "/livingsystems/",
    "/impact",
    "/domains/",
    "/missions",
    "/magazine",
    "/join",
    "/about/founder",
    "/partners",
  ]) {
    assert.match(home, new RegExp(route.replaceAll("/", "\\/")));
  }
  assert.match(home, /Three ways into one living planet\./);
  assert.equal((home.match(/className="home-guided-card"/g) ?? []).length, 1);
  assert.match(home, /GUIDED_ENTRIES\.map/);
  assert.match(home, /Species journey/);
  assert.match(home, /Systems journey/);
  const systemsJourney = home.match(/eyebrow: "Systems journey"[\s\S]*?\n  },/)?.[0] ?? "";
  assert.match(systemsJourney, /to: "\/living-systems\/oslofjord"/);
  assert.doesNotMatch(systemsJourney, /livingsystems|reloadDocument/);
  assert.match(router, /path="\/living-systems\/oslofjord" element={<PlanetProofPage slug="oslofjorden" \/>}/);
  assert.match(home, /Action journey/);
  assert.match(home, /These action pathways are in development\./);
});
