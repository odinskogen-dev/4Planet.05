import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const workflow = readFileSync("../.github/workflows/production-factory-shadow-deploy.yml", "utf8");

test("activation workflow parks a receiver single-writer conflict instead of failing the whole Factory", () => {
  assert.match(workflow, /RECEIVER_SINGLE_WRITER_CONFLICT/);
  assert.match(workflow, /production_started=false/);
  assert.match(workflow, /parked=true/);
  assert.match(workflow, /steps\.proof_start\.outputs\.production_started == 'true'/);
  assert.match(workflow, /Record locally parked package without global Factory failure/);
  assert.match(workflow, /no bypass branch, provider reservation or second writer created/);
});

test("local parking never claims ACTIVE or Human Gold", () => {
  assert.match(workflow, /active:false/);
  assert.match(workflow, /humanGoldFounderOnly:true/);
  assert.match(workflow, /canonPromotion:false/);
  assert.match(workflow, /automaticSpend:false/);
});
