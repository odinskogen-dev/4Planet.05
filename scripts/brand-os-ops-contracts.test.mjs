import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const videoFactory = readFileSync(resolve("src/brand-os/video-factory.ts"), "utf8");
const lifecycle = readFileSync(resolve("src/brand-os/lifecycle-engine.ts"), "utf8");
const observability = readFileSync(resolve("src/brand-os/observability-engine.ts"), "utf8");
const adapters = readFileSync(resolve("src/brand-os/publishing-adapters.ts"), "utf8");
const learning = readFileSync(resolve("src/brand-os/learning-engine.ts"), "utf8");
const channels = readFileSync(resolve("src/brand-os/channel-engine.ts"), "utf8");

test("motion factory requires captions, transcript, source footer and bounded duration", () => {
  assert.match(videoFactory, /captionsRequired/);
  assert.match(videoFactory, /transcriptRequired/);
  assert.match(videoFactory, /sourceFooter/);
  assert.match(videoFactory, /durationMs > 180_000/);
  assert.match(videoFactory, /Synthetic media requires explicit disclosure/);
});

test("Bee motion manifest is source-ready but not rights- or release-ready", () => {
  assert.match(videoFactory, /VID-BOS-BEE-001-V1/);
  assert.match(videoFactory, /SRC-017/);
  assert.match(videoFactory, /SRC-019/);
  assert.match(videoFactory, /RD-0014/);
  assert.match(videoFactory, /status: "SOURCE_READY"/);
  assert.match(videoFactory, /NOT ALL FOOD\. NOT ALL POLLINATORS/);
});

test("owned lifecycle is relationship-oriented and consent-aware", () => {
  assert.match(lifecycle, /DISCOVER.*UNDERSTAND.*FOLLOW.*RETURN.*PARTICIPATE.*PROOF/s);
  assert.match(lifecycle, /CONSENTED/);
  assert.match(lifecycle, /WITHDRAWN/);
  assert.match(lifecycle, /Newsletter events may not be recorded after consent withdrawal/);
  assert.match(lifecycle, /Return with a meaningful signal, field note or change/);
});

test("operational health exposes dead letters, incident state and real founder minutes", () => {
  assert.match(observability, /deadLetter/);
  assert.match(observability, /terminalFailureRate/);
  assert.match(observability, /oldestActiveJobAgeMinutes/);
  assert.match(observability, /founderMinutes/);
  assert.match(observability, /safeAutonomyExpansionAllowed/);
  assert.match(observability, /snapshot\.deadLetter === 0/);
});

test("external platform layer remains credential- and founder-gated", () => {
  assert.match(adapters, /AUTH_REQUIRED/);
  assert.match(adapters, /DRY_RUN_ONLY/);
  assert.match(adapters, /secure token storage/);
  assert.match(adapters, /executeExternalPublication/);
  assert.doesNotMatch(adapters, /fetch\(/);
});

test("learning requires minimum observations and localizes conclusions", () => {
  assert.match(learning, /minimumObservations/);
  assert.match(learning, /INSUFFICIENT_EVIDENCE/);
  assert.match(learning, /local evidence, not universal canon/);
  assert.match(learning, /controlledPublicReleases < 1/);
});

test("channel planning preserves truth core and hard-caps verification queues", () => {
  assert.match(channels, /truthCore: story\.truthCore/);
  assert.match(channels, /audienceJob: story\.audienceJob/);
  assert.match(channels, /maximum > 50/);
  assert.match(channels, /topicalFit \* 0\.35/);
});
