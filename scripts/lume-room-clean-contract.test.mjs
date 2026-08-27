import { readFileSync, statSync } from "node:fs";
import test from "node:test";
import assert from "node:assert/strict";

const page = readFileSync(new URL("../src/pages/v5/LumeRoom.tsx", import.meta.url), "utf8");
const manifest = readFileSync(new URL("../src/content/lumeRoom.ts", import.meta.url), "utf8");
const css = readFileSync(new URL("../src/styles/lume-room.css", import.meta.url), "utf8");
const router = readFileSync(new URL("../src/routes/router.tsx", import.meta.url), "utf8");
const shell = readFileSync(new URL("../src/components/layout/PublicShell.tsx", import.meta.url), "utf8");
const completion = readFileSync(new URL("../src/components/PublicCompletionBridge.tsx", import.meta.url), "utf8");
const image = new URL("../public/assets/species/orca/lume-orca-v1.png", import.meta.url);
const fieldAudio = new URL("../public/assets/species/orca/audio/nps-glacier-bay-orca-echolocation.mp3", import.meta.url);

test("LUME ROOM 02 keeps the clean browser-first route and rejects the legacy ORCA renderer", () => {
  assert.match(router, /path="\/species\/orca\/lume"/);
  assert.doesNotMatch(page, /\/xr\/|orca-lume-|webxr|a-frame|three/i);
  assert.doesNotMatch(css, /\/xr\/|orca-lume-/i);
  assert.ok(statSync(image).size > 100_000, "central transparent species asset should be present");
  assert.match(page, /LUME_ORCA_ROOM/);
  assert.match(manifest, /AI-GENERATED SPECIES VISUALISATION · NOT EVIDENCE \/ NOT A PHOTOGRAPH/);
  assert.match(page, /data-room-version="02"/);
  assert.match(page, /data-subject-motion="2\.5D"/);
  assert.match(page, /LOADING ORCA AUDIO/);
  assert.match(page, /MUTE ORCA AUDIO/);
  assert.match(page, /RETRY ORCA AUDIO/);
  assert.match(manifest, /KILLER WHALE ECHOLOCATION CLICKS/);
  assert.match(manifest, /GLACIER BAY, ALASKA/);
  assert.match(manifest, /NPS \/ C\. GABRIELE/);
  assert.match(manifest, /NPS-CREDITED PUBLIC-DOMAIN MEDIA/);
  assert.match(manifest, /PROCEDURAL ROOM RESPONSE · NOT AN ANIMAL RECORDING/);
  assert.ok(statSync(fieldAudio).size > 100_000, "local field audio should be present");
  assert.match(manifest, /Population, pod, current location and migration remain unknown/i);
  assert.equal((page.match(/className="lume-room__node"/g) ?? []).length, 1, "node UI should be data-driven");
  assert.match(css, /prefers-reduced-motion:reduce/);
  assert.match(css, /max-width:calc\(100vw - 30px\)/);
  assert.doesNotMatch(css, /11[0-9]vw/);
});

test("TAKE PART uses the canonical persistent megamenu instead of a portal", () => {
  assert.match(shell, /type PanelKey = .*"TAKE PART"/);
  assert.match(shell, /height:clamp\(318px,29vw,382px\)/);
  assert.match(shell, /scheduleDesktopClose/);
  assert.doesNotMatch(completion, /DesktopTakePart|completion-takepart-menu|hosts\.desktop|hosts\.mobile/);
});
