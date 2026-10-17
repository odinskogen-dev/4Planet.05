import test from "node:test";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";

test("NATURE SENSOR ingress is fail-closed and never upgrades a measurement into ecological truth",async()=>{
  const sql=await readFile(new URL("../supabase/migrations/20261017091500_naturebrain_sensor_observation_ingress_canonical_v01.sql",import.meta.url),"utf8");
  assert.match(sql,/planetbrain_stage_sensor_observation_v01/);
  assert.match(sql,/measurement != ecological condition/);
  assert.match(sql,/product_publication_ready',false/);
  assert.match(sql,/ITEM_LEVEL_RIGHTS_REQUIRED/);
  assert.match(sql,/RESTRICTED_INTERNAL/);
  assert.match(sql,/review_status.*unreviewed/s);
  assert.match(sql,/gis\.st_makepoint/);
  assert.doesNotMatch(sql,/grant execute .* anon/i);
});

test("NATURE SENSOR accepts device/source/calibration context, not personal identity fields",async()=>{
  const sql=await readFile(new URL("../supabase/migrations/20261017091500_naturebrain_sensor_observation_ingress_canonical_v01.sql",import.meta.url),"utf8");
  for(const field of ["event_id","device_id","provider_name","source_uri","rights_state","metric_key","numeric_value","observed_at","calibration_state","quality_state"]){
    assert.match(sql,new RegExp(field));
  }
  assert.doesNotMatch(sql,/person_id/);
  assert.doesNotMatch(sql,/user_email/);
});
