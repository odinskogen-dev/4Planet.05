import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("ORGANISATIONS_ is discoverable through the main universe", async () => {
  const shell = await read("src/components/layout/PublicShell.tsx");
  const home = await read("src/pages/v5/Home.tsx");
  const world = await read("src/earth/World.tsx");
  assert.match(shell, /key: "ORGANISATIONS_"/);
  assert.match(shell, /\["Organisations", "\/actors"\]/);
  assert.match(home, /home-organisations-title/);
  assert.match(home, /EXPLORE ORGANISATIONS/);
  assert.match(world, /\["\/actors", "ORGANISATIONS"/);
});

test("one shared profile template serves ten private-beta profiles", async () => {
  const router = await read("src/routes/router.tsx");
  const page = await read("src/pages/integrated/Actors.tsx");
  const data = await read("src/data/actors.ts");
  assert.match(router, /path="\/actors"/);
  assert.match(router, /path="\/actors\/:slug"/);
  assert.equal((page.match(/export function ActorProfilePage/g) ?? []).length, 1);
  assert.equal((data.match(/buildProfile\(\{/g) ?? []).length, 10);
  for (const slug of [
    "iucn",
    "global-biodiversity-information-facility",
    "wildlife-conservation-society",
    "whale-and-dolphin-conservation",
    "coral-restoration-foundation",
    "global-fishing-watch",
    "panthera",
    "world-land-trust",
    "rainforest-foundation-norway",
    "climate-trace",
  ]) assert.match(data, new RegExp(`slug: "${slug}"`));
});

test("Global Fishing Watch passes the data-only scaling gate", async () => {
  const data = await read("src/data/actors.ts");
  const page = await read("src/pages/integrated/Actors.tsx");
  const router = await read("src/routes/router.tsx");
  assert.match(data, /slug: "global-fishing-watch"/);
  assert.match(data, /Modelled vessel activity or apparent fishing effort is not automatic evidence/);
  assert.doesNotMatch(page, /GlobalFishingWatchProfile|GfwProfile/);
  assert.doesNotMatch(router, /global-fishing-watch" element=/);
});

test("fifty material claims remain source-mapped and bounded", async () => {
  const data = await read("src/data/actors.ts");
  assert.match(data, /ACTOR_CLAIM_COUNT/);
  assert.equal((data.match(/claimStart: \d+,/g) ?? []).length, 10);
  assert.match(data, /claimStart: 1,/);
  assert.match(data, /claimStart: 46,/);
  assert.ok((data.match(/sourceIds:/g) ?? []).length >= 50);
  assert.match(data, /A donation is not automatically a transferable 4PLANET land unit/);
  assert.match(data, /Occurrence records do not establish complete range, abundance, population trend or live tracking/);
  assert.match(data, /Local and Indigenous work must remain attributed/);
});

test("editorial discovery leads while truth remains inspectable", async () => {
  const page = await read("src/pages/integrated/Actors.tsx");
  assert.match(page, /Working for[\s\S]*a living planet/);
  assert.match(page, /ACTOR_COLLECTIONS\.map/);
  assert.match(page, /What this profile does not establish/);
  assert.match(page, /Claims, sources and boundaries/);
  assert.match(page, /Independently researched by 4PLANET from public sources/);
  assert.doesNotMatch(page, /best organisation|most effective|verified by 4PLANET/i);
});

test("official actions remain external and private beta stays noindex", async () => {
  const page = await read("src/pages/integrated/Actors.tsx");
  const metadata = await read("src/utils/metadata.ts");
  const migration = await read("supabase/migrations/20260805184500_p17_actor_private_beta.sql");
  assert.match(page, /4PLANET does not collect payment/);
  assert.match(page, /target="_blank"/);
  assert.match(metadata, /robots = "noindex,nofollow"/);
  assert.match(metadata, /og:image/);
  assert.match(migration, /payment_handled_by_4planet boolean not null default false/);
  assert.match(migration, /check \(payment_handled_by_4planet = false\)/);
});

test("secure review flow stores no sensitive contact data in browser storage", async () => {
  const review = await read("src/data/actorReview.ts");
  const page = await read("src/pages/integrated/Actors.tsx");
  const migration = await read("supabase/migrations/20260805211500_p17_actor_review_v2.sql");
  assert.match(review, /VITE_P17_REVIEW_ENDPOINT/);
  assert.match(review, /status: "STAGING_BLOCKED"/);
  assert.doesNotMatch(review, /localStorage|sessionStorage/);
  assert.doesNotMatch(page, /localStorage\.setItem|sessionStorage\.setItem/);
  assert.match(page, /never change profile content automatically/);
  assert.match(migration, /revoke all on public\.actor_profile_requests, public\.actor_review_events from anon, authenticated/);
  assert.match(migration, /'DISPUTE','APPEAL'/);
});

test("Actor Mode installs native source-aware layers in the existing map", async () => {
  const app = await read("src/App.tsx");
  const overlay = await read("src/earth/ActorAtlasOverlay.tsx");
  assert.match(app, /<ActorAtlasOverlay \/>/);
  assert.match(overlay, /__4planet_map/);
  assert.match(overlay, /map\.addSource\(SOURCE_ID/);
  for (const layer of [
    "p17-actor-hq",
    "p17-actor-operating",
    "p17-actor-programme",
    "p17-actor-partner",
    "p17-actor-project",
  ]) assert.match(overlay, new RegExp(layer));
  assert.match(overlay, /sensitivity !== "RESTRICTED" \|\| geo\.precision === "REGION"/);
  assert.doesNotMatch(overlay, /new maplibregl\.Map/);
});

test("share assets exist for the index and all ten profiles", async () => {
  const data = await read("src/data/actors.ts");
  const assets = [
    "organisations",
    "iucn",
    "global-biodiversity-information-facility",
    "wildlife-conservation-society",
    "whale-and-dolphin-conservation",
    "coral-restoration-foundation",
    "global-fishing-watch",
    "panthera",
    "world-land-trust",
    "rainforest-foundation-norway",
    "climate-trace",
  ];
  for (const asset of assets) {
    const svg = await read(`public/p17/share/${asset}.svg`);
    assert.match(svg, /INDEPENDENT PROFILE|ORGANISATIONS_/);
  }
  assert.match(data, /ogImage: og/);
});
