import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const read = (path) => readFileSync(resolve(path), "utf8");
const prelive = read("src/brand-os/prelive-closure.ts");
const board = read("src/pages/internal/BrandOSReleaseBoard.tsx");
const adapters = read("src/brand-os/publishing-adapters.ts");

const occurrences = (haystack, needle) => haystack.split(needle).length - 1;

test("pre-live closure defines one exact release family for every P0 story", () => {
  for (const value of [
    "FAM-BOS-ORCA-001",
    "FAM-BOS-BEE-001",
    "FAM-BOS-OSLO-001",
    "STORY-BOS-ORCA-001",
    "STORY-BOS-BEE-001",
    "STORY-BOS-OSLO-001",
  ]) assert.ok(prelive.includes(value), `missing ${value}`);

  assert.match(prelive, /P0_RELEASE_FAMILIES: ReleaseFamily\[\] = \[ORCA_RELEASE_FAMILY, BEE_RELEASE_FAMILY, OSLO_RELEASE_FAMILY\]/);
});

test("every P0 family has exact feed, story, LinkedIn and owned-web founder-review variants", () => {
  for (const prefix of ["ORCA", "BEE", "OSLO"]) {
    for (const suffix of ["IGFEED-001", "IGSTORY-001", "LI-001", "WEB-001"]) {
      assert.ok(prelive.includes(`VAR-BOS-${prefix}-${suffix}`), `missing ${prefix} ${suffix}`);
    }
  }
  assert.ok(occurrences(prelive, 'readiness: "FINAL_FOR_FOUNDER_REVIEW"') >= 13);
});

test("motion production is bounded by learning and truth state", () => {
  assert.ok(prelive.includes("VAR-BOS-BEE-MOTION-001"));
  assert.match(prelive, /QA-ready specification, not claimed rendered/);
  assert.ok(prelive.includes("VAR-BOS-ORCA-MOTION-001"));
  assert.ok(prelive.includes("VAR-BOS-OSLO-MOTION-001"));
  assert.match(prelive, /DEFERRED_UNTIL_LEARNING/);
  assert.match(prelive, /deferredMotion\("VAR-BOS-ORCA-MOTION-001"/);
  assert.match(prelive, /deferredMotion\("VAR-BOS-OSLO-MOTION-001"/);
  assert.match(prelive, /Do not animate one observation into apparent movement, live location or trend/);
  assert.match(prelive, /Do not animate modelled or mapped layers in a way that implies temporal change or live monitoring/);
});

test("BEE is explicitly pre-registered as the first controlled test candidate", () => {
  assert.match(prelive, /FIRST_LIVE_RECOMMENDATION/);
  assert.match(prelive, /storyId: "STORY-BOS-BEE-001"/);
  assert.match(prelive, /variantId: "VAR-BOS-BEE-IGFEED-001"/);
  assert.match(prelive, /rank: 1/);
  assert.match(prelive, /Cleanest first-party\/original visual rights route/);
});

test("Instagram remains auth-gated and external-action disabled", () => {
  assert.match(prelive, /INSTAGRAM_PRELIVE_READINESS/);
  assert.match(prelive, /state: "AUTH_REQUIRED"/);
  assert.match(prelive, /externalActionAllowed: false/);
  assert.match(prelive, /secure server-side token storage/);
  assert.match(prelive, /exact account ID intentionally unresolved until founder-controlled authentication/);
  assert.match(adapters, /mode: "DRY_RUN_ONLY"/);
  assert.match(adapters, /productionEnabled: false/);
});

test("first live learning is pre-registered before exposure and rejects vanity inference", () => {
  assert.match(prelive, /LC-BOS-BEE-IG-001/);
  assert.match(prelive, /No success declaration from reach or likes alone/);
  assert.match(prelive, /Dry-run metrics remain system-test evidence only/);
  assert.match(prelive, /One release cannot authorise a full content-bank scale-up/);
  assert.match(prelive, /7-day metrics before durable mechanism judgment/);
  assert.match(prelive, /founder decision event recorded; duration only if actually instrumented/);
});

test("zero-network rehearsal covers nine fail-closed scenarios", () => {
  for (let index = 1; index <= 9; index += 1) {
    assert.ok(prelive.includes(`PRELIVE-FAIL-${String(index).padStart(3, "0")}`));
  }
  assert.ok(occurrences(prelive, "externalCallAllowed: false") >= 10);
  for (const signal of [
    "Founder gate OPEN",
    "Duplicate idempotency key",
    "Missing/revoked platform auth",
    "Rights gate not PASS/NOT_APPLICABLE",
    "QA gate BLOCKED",
    "Transient platform error",
    "receipt write failed",
    "material correction required",
  ]) assert.ok(prelive.includes(signal), `missing failure simulation ${signal}`);
});

test("First Ten validation bank adds exactly seven bounded next objects at positions 4-10", () => {
  for (let position = 4; position <= 10; position += 1) {
    assert.ok(prelive.includes(`position: ${position},`), `missing First Ten position ${position}`);
  }
  for (const id of [
    "FT-BOS-A23A-004",
    "FT-BOS-HUMPBACK-005",
    "FT-BOS-URCHIN-006",
    "FT-BOS-LISIMA-007",
    "FT-BOS-CANOPY-008",
    "FT-BOS-MOLERAT-009",
    "FT-BOS-GLASS-010",
  ]) assert.ok(prelive.includes(id), `missing ${id}`);
  assert.match(prelive, /VERIFY_PRIMARY_SOURCE_FIRST/);
  assert.match(prelive, /VERIFY_EFFECTIVENESS_AND_RIGHTS_FIRST/);
});

test("structured P0 asset retrieval resolves canonical rights routes without founder folder search", () => {
  for (const [queryId, assetId, decisionId] of [
    ["RET-BOS-ORCA-001", "AST-0025", "RD-0019"],
    ["RET-BOS-OSLO-001", "AST-0022", "RD-0016"],
    ["RET-BOS-BEE-001", "AST-0020", "RD-0014"],
  ]) {
    assert.ok(prelive.includes(queryId));
    assert.ok(prelive.includes(assetId));
    assert.ok(prelive.includes(decisionId));
  }
  assert.ok(occurrences(prelive, 'result: "PASS"') >= 3);
  assert.match(prelive, /without manual founder folder search/);
});

test("founder board exposes exact families while preserving local-only decision semantics", () => {
  assert.match(board, /EXACT RELEASE FAMILY/);
  assert.match(board, /Project Lead recommendation/);
  assert.match(board, /Founder decision — local simulation only/);
  assert.match(board, /do not persist a founder decision to staging and do not authorise live release/);
  assert.match(board, /PLATFORM STATE/);
  assert.match(board, /PRE-REGISTERED LEARNING CONTRACT/);
  assert.match(board, /Nothing here can publish externally/);
});
