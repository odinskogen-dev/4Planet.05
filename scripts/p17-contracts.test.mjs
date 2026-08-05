import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("P17 routes and shared actor template are present", async () => {
  const router = await read("src/routes/router.tsx");
  const page = await read("src/pages/integrated/Actors.tsx");
  assert.match(router, /path="\/actors"/);
  assert.match(router, /path="\/actors\/:slug"/);
  assert.match(page, /export function ActorsIndex/);
  assert.match(page, /export function ActorProfilePage/);
  assert.equal((page.match(/export function ActorProfilePage/g) ?? []).length, 1, "one shared profile template must serve every actor");
});

test("exactly three private-beta actor archetypes are implemented", async () => {
  const data = await read("src/data/actors.ts");
  for (const slug of [
    "world-land-trust",
    "global-biodiversity-information-facility",
    "rainforest-foundation-norway",
  ]) assert.match(data, new RegExp(`slug: "${slug}"`));
  assert.equal((data.match(/slug: "/g) ?? []).length, 3);
  assert.match(data, /OPERATIONAL_CONSERVATION/);
  assert.match(data, /DATA_INFRASTRUCTURE/);
  assert.match(data, /RIGHTS_BASED_NGO/);
});

test("material claims have source mappings and public limitations", async () => {
  const data = await read("src/data/actors.ts");
  assert.equal((data.match(/id: "CLM-/g) ?? []).length, 15);
  assert.ok((data.match(/sourceIds: \[/g) ?? []).length >= 20);
  assert.match(data, /Occurrence records do not establish complete range, abundance, population trend or live tracking/);
  assert.match(data, /must not be presented as work owned or executed solely/);
  assert.match(data, /not automatically a transferable 4PLANET land unit/);
});

test("official actions stay external and never become 4PLANET payments", async () => {
  const page = await read("src/pages/integrated/Actors.tsx");
  const migration = await read("supabase/migrations/20260805184500_p17_actor_private_beta.sql");
  assert.match(page, /4PLANET does not collect payment/);
  assert.match(page, /target="_blank" rel="noopener noreferrer"/);
  assert.match(migration, /payment_handled_by_4planet boolean not null default false/);
  assert.match(migration, /check \(payment_handled_by_4planet = false\)/);
});

test("private preview stays noindex and claim requests cannot self-publish", async () => {
  const metadata = await read("src/utils/metadata.ts");
  const page = await read("src/pages/integrated/Actors.tsx");
  const migration = await read("supabase/migrations/20260805184500_p17_actor_private_beta.sql");
  assert.match(metadata, /robots = "noindex,nofollow"/);
  assert.match(page, /RECEIVED_FOR_INTERNAL_REVIEW/);
  assert.match(page, /do not change the profile, grant editing access, verify every claim or create partner status/);
  assert.match(migration, /no anonymous public read policy is created/);
});

test("Actor Mode reuses the existing Atlas route and camera URL", async () => {
  const app = await read("src/App.tsx");
  const overlay = await read("src/earth/ActorAtlasOverlay.tsx");
  assert.match(app, /<ActorAtlasOverlay \/>/);
  assert.match(overlay, /location.pathname !== "\/atlas"/);
  assert.match(overlay, /params.get\("mode"\) !== "actors"/);
  assert.match(overlay, /CENTRE EXISTING ATLAS HERE/);
  assert.doesNotMatch(overlay, /new maplibregl\.Map/);
});
