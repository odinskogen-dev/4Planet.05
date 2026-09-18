import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (p) => readFileSync(new URL(`../${p}`, import.meta.url), "utf8");

// ── ProductContext (Workstream B) — behaviour mirrored here in plain JS so the
//    encode/decode/validate contract is enforced without a bundler. Keep in sync
//    with src/product/productContext.ts. ──
const ATLAS_STATE_KEYS = ["m", "l", "z", "c", "t", "p", "lens", "entity", "journey", "record"];
const b64urlEncode = (s) => Buffer.from(s, "utf8").toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
const b64urlDecode = (s) => {
  const b64 = s.replace(/-/g, "+").replace(/_/g, "/");
  return Buffer.from(b64 + "===".slice((b64.length + 3) % 4), "base64").toString("utf8");
};
function readAtlasState(search) {
  const p = new URLSearchParams(search); const o = {};
  ATLAS_STATE_KEYS.forEach((k) => { const v = p.get(k); if (v) o[k] = v; });
  return o;
}
function canonicalReturnState(state) {
  if (!(state.record && state.z && state.c && state.entity)) return state;
  const { entity: _redundantEntity, ...cameraOwnedRecordState } = state;
  return cameraOwnedRecordState;
}
function atlasHrefFromState(state) {
  const p = new URLSearchParams();
  ATLAS_STATE_KEYS.forEach((k) => { if (state[k]) p.set(k, state[k]); });
  const q = p.toString();
  return q ? `/atlas?${q}` : "/atlas";
}
function encodeReturnTo(search) {
  const st = canonicalReturnState(readAtlasState(search));
  if (Object.keys(st).length === 0) return "";
  return b64urlEncode(atlasHrefFromState(st));
}
function decodeReturnTo(token) {
  if (!token) return null;
  let d; try { d = b64urlDecode(token); } catch { return null; }
  if (!d.startsWith("/atlas")) return null;
  if (d.includes("://") || d.startsWith("//")) return null;
  const qi = d.indexOf("?");
  return atlasHrefFromState(canonicalReturnState(readAtlasState(qi >= 0 ? d.slice(qi + 1) : "")));
}

test("productContext: camera + record return owns camera and removes redundant entity refocus", () => {
  const search = "?m=PLANET&l=bluemarble&z=6.20&c=9.30,63.45&record=orca-bundled&entity=taxon:gbif:2440483";
  const token = encodeReturnTo(search);
  assert.ok(token.length > 0);
  const href = decodeReturnTo(token);
  assert.match(href, /^\/atlas\?/);
  for (const key of ["m", "l", "z", "c", "record"]) assert.ok(href.includes(`${key}=`), `href preserves ${key}`);
  assert.ok(href.includes("record=orca-bundled"));
  assert.ok(!href.includes("entity="), "record-owned camera return omits only redundant entity focus");
});

test("productContext: direct entity-only return still round-trips entity", () => {
  const search = "?m=PLANET&z=5.40&c=10.75,59.91&entity=taxon:gbif:2440483";
  const href = decodeReturnTo(encodeReturnTo(search));
  assert.ok(href.includes("entity=taxon%3Agbif%3A2440483"));
  assert.ok(href.includes("z=5.40"));
  assert.ok(href.includes("c=10.75%2C59.91"));
});

test("productContext: historical camera + record + entity token is canonicalised on decode", () => {
  const historical = b64urlEncode("/atlas?m=PLANET&z=6.20&c=9.30%2C63.45&record=orca-bundled&entity=taxon%3Agbif%3A2440483");
  const href = decodeReturnTo(historical);
  assert.ok(href.includes("record=orca-bundled"));
  assert.ok(href.includes("z=6.20"));
  assert.ok(!href.includes("entity="));
});

test("productContext: rejects unsafe/external return destinations", () => {
  assert.equal(decodeReturnTo(b64urlEncode("https://evil.example.com")), null);
  assert.equal(decodeReturnTo(b64urlEncode("//evil.example.com")), null);
  assert.equal(decodeReturnTo(b64urlEncode("/species/orca")), null); // not /atlas
  assert.equal(decodeReturnTo("!!!not-base64!!!"), null);
  assert.equal(decodeReturnTo(""), null);
  assert.equal(decodeReturnTo(null), null);
});

test("productContext: empty ATLAS state yields no token (graceful fallback)", () => {
  assert.equal(encodeReturnTo(""), "");
  assert.equal(encodeReturnTo("?foo=bar"), ""); // no known ATLAS keys
});

test("productContext: decode drops unknown keys, keeps only ATLAS state", () => {
  const token = b64urlEncode("/atlas?m=PLANET&evil=1&record=orca-bundled");
  const href = decodeReturnTo(token);
  assert.ok(href.includes("m=PLANET"));
  assert.ok(href.includes("record=orca-bundled"));
  assert.ok(!href.includes("evil"));
});

test("productContext source uses these keys and is wired into visible controls", () => {
  const src = read("src/product/productContext.ts");
  ATLAS_STATE_KEYS.forEach((k) => assert.ok(src.includes(`"${k}"`), `schema documents ${k}`));
  assert.match(src, /canonicalReturnState/);
  assert.match(src, /state\.record && state\.z && state\.c && state\.entity/);
  // Visible return controls exist on Species, Living Systems and the Mission page.
  assert.match(read("src/pages/integrated/Species.tsx"), /data-testid="return-to-atlas"/);
  assert.match(read("src/pages/v5/LivingSystems.tsx"), /data-testid="return-to-atlas"/);
  assert.match(read("src/pages/v5/Missions.tsx"), /data-testid="return-to-atlas"/);
});

// ── Deterministic bundled occurrence (Workstream C) ──
test("bundled Orca occurrence is imported and rendered (not dead code)", () => {
  const world = read("src/earth/World.tsx");
  assert.match(world, /DEMO_WHALE_OBSERVATION/);
  assert.match(world, /record.*orca-bundled|orca-bundled/);
  const demo = read("src/data/demoWhaleOccurrence.ts");
  assert.match(demo, /BUNDLED_ORCA_RECORD_ID = "5939349319"/);
  assert.match(demo, /observation:gbif:\$\{BUNDLED_ORCA_RECORD_ID\}/);
  assert.match(demo, /coordinateUncertaintyM: 1000/);
  // image is local (no hotlink) and labelled illustrative-not-this-occurrence
  assert.match(demo, /\/assets\/species\/orca\/illustrative\.jpg/);
  assert.doesNotMatch(demo, /mediaUrl:\s*"https?:/);
  const ctx = read("src/earth/Context.tsx");
  assert.match(ctx, /ILLUSTRATIVE OF SPECIES — NOT THIS OCCURRENCE/);
  assert.match(ctx, /BUNDLED SOURCE SNAPSHOT/);
});

// ── Locked OCE4N order (Workstream A) ──
test("locked OCE4N order is CLE4N/WH4LES/COR4L/RE:WILD Marine", () => {
  const missions = read("src/content/missions.ts");
  const idx = (needle) => missions.indexOf(needle);
  const cle4n = idx('code: "OCE4N_ / 01", name: "CLE4N_"');
  const wh4les = idx('code: "OCE4N_ / 02", name: "WH4LES_"');
  const cor4l = idx('code: "OCE4N_ / 03", name: "COR4L_"');
  const rewild = idx('code: "OCE4N_ / 04", name: "RE:WILD_ Marine"');
  assert.ok(cle4n > 0 && wh4les > cle4n && cor4l > wh4les && rewild > cor4l, "OCE4N order is 01 CLE4N, 02 WH4LES, 03 COR4L, 04 RE:WILD Marine");
});

// ── Five cetacean profiles consistency (Workstream D) ──
test("five cetacean profiles have consistent id/gbifKey and honest media state", () => {
  const species = read("src/data/species.ts");
  const media = read("src/data/speciesMedia.ts");
  const five = [
    ["orca", 2440483], ["humpback-whale", 5220086], ["sperm-whale", 2440617],
    ["harbour-porpoise", 2440739], ["bottlenose-dolphin", 2440601],
  ];
  five.forEach(([slug, key]) => {
    assert.ok(species.includes(`slug: "${slug}"`), `${slug} profile exists`);
    assert.ok(species.includes(`gbifKey: ${key}`), `${slug} has gbifKey ${key}`);
    assert.ok(species.includes(`id: "taxon:gbif:${key}"`), `${slug} id matches taxon:gbif:${key}`);
    assert.ok(media.includes(`"${slug}"`) || media.includes(`${slug}:`), `${slug} has a media record`);
  });
  // media only shows an image when a real licence is recorded + a local path exists
  assert.match(media, /rightsStatus === "CLEARED" \|\| m\.rightsStatus === "LICENCE_VERIFIED"/);
});

// ── Truth: a bundled / NOT LIVE record must never display LIVE (Control Addendum) ──
test("bundled Orca record is delivered as a snapshot and never labelled LIVE", () => {
  const demo = read("src/data/demoWhaleOccurrence.ts");
  assert.match(demo, /delivery: "BUNDLED_SNAPSHOT"/);
  const ctx = read("src/earth/Context.tsx");
  // The WHAT WAS RECORDED badge is driven by the delivery flag, not hard-coded LIVE.
  assert.match(ctx, /bundled\s*\?\s*"BUNDLED"\s*:\s*"LIVE"/);
  // bundled is derived from the explicit delivery flag, not a loose heuristic.
  assert.match(ctx, /delivery === "BUNDLED_SNAPSHOT"/);
  // The BUNDLED status text must carry NOT LIVE.
  assert.match(ctx, /BUNDLED:\s*"BUNDLED · NOT LIVE"/);
});
