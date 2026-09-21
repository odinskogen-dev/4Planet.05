import test from "node:test";
import assert from "node:assert/strict";
import {normaliseGoldProjectSheets} from "./os-project-normalizer.mjs";
const ID="SYS-P00-STRAT",root="16UzbrS_xiSxvsrWkmUvp9M3OABOebiSG";
function fixture(n=35){
 const ids=[ID,...Array.from({length:n-1},(_,i)=>"SYS-P00-T"+String(i+1).padStart(2,"0"))];
 const gold={name:"4PLANET_ GOLD PROJECT CONTRACT — PROJECT PACKS v3.0",sheetId:"12",rows:[
 ["Project ID","Project / Working name","Parent","Domain","Audit action","Priority","Primary goal","Purpose","Outcome / Definition of Done"],
 ...ids.map((id,i)=>[id,i?"Work "+i:"Strategy, Goals & Project Operating System",
 "SYS-P00-01","SHARED","KEEP","P1","", "Purpose "+i,"Outcome "+i])]};
 const wbs={name:"4PLANET_ UNIVERSAL WBS — DELIVERY HIERARCHY v2.0",sheetId:"13",rows:[
 ["WBS ID","Level","Project ID","Major deliverable","Work package"],
 ...ids.map((id,i)=>["WBS-"+i,"L1",id,"Deliverable "+i,"Work "+i])]};
 const master={name:"4PLANET_ PROJECT OPERATING SYSTEM — MASTER PROJECT REGISTER v1.0",sheetId:"22",rows:[
 ["Project ID","Project","Classification","Parent","Domain","Lifecycle"],
 ...ids.map(id=>[id,"Project","PROJECT","P00","SHARED","ACTIVE"])]};
 return [gold,wbs,master];
}
test("canonical project/WBS projection preserves identities, source and UNKNOWN status",()=>{
 const {records,metrics}=normaliseGoldProjectSheets(fixture(),{modifiedTime:"2026-09-21T12:00:00Z"},root);
 assert.equal(metrics.projects,35);assert.equal(metrics.wbs,35);
 const p=JSON.parse(records[0].content);assert.equal(p.id,ID);
 assert.equal(p.name,"4PLANET STRATEGY");
 assert.equal(p.currentState,"NOT_RECONCILED_WITH_CURRENT_PROGRAMME");
 assert.equal(p.wbs[0].id,"WBS-0");assert.match(p.source.gold,/docs.google.com/);
 assert.equal(records[0].metadata.tenant,null);
 assert.equal(records[0].metadata.domain,"4planet");
 assert.equal(records[0].metadata.currentStatus,"UNKNOWN_UNTIL_PROGRAMME_RECONCILIATION");
});
test("missing canonical sheet fails closed",()=>{
 assert.throws(()=>normaliseGoldProjectSheets(fixture().slice(0,2),{},root),
 /CANONICAL_PROJECT_TABS_MISSING/);
});
test("duplicate Gold IDs fail closed; do not silently collapse histories",()=>{
 const tabs=fixture();tabs[0].rows.push(tabs[0].rows[1]);
 assert.throws(()=>normaliseGoldProjectSheets(tabs,{},root),/DUPLICATE_GOLD_PROJECT_ID/);
});
test("orphan WBS fails closed instead of being attached to a guessed project",()=>{
 const tabs=fixture();tabs[1].rows.push(["WBS-BAD","L1","EAR-NOT-REGISTERED","X","Y"]);
 assert.throws(()=>normaliseGoldProjectSheets(tabs,{},root),/ORPHAN_WBS/);
});
test("empty WBS remains explicitly incomplete, not done",()=>{
 const tabs=fixture();tabs[1].rows= tabs[1].rows.filter(r=>r[2]!==ID);
 const {records}=normaliseGoldProjectSheets(tabs,{},root);
 assert.equal(JSON.parse(records[0].content).wbsCount,0);
});

test("controlled unregistered products stay visible as gaps, not fake Project Homes",()=>{
 const tabs=fixture();
 const gap=["4PLANET FRONTIER","CURRENT PRODUCT / PROJECT HOME CROSSWALK OPEN",
 "PARENT OPEN","ACTIVE","No Gold ID","TRUE","Recover source","https://docs.google.com/"];
 gap[11]="OPEN / CONTROLLED REGISTRATION GAP";
 tabs.push({name:"4PLANET_ ORPHAN + DUPLICATE CONTROL v1.0",sheetId:"32",
  rows:[["Item / Alias"],gap]});
 const {records,gaps,metrics}=normaliseGoldProjectSheets(tabs,{},root);
 assert.equal(metrics.projects,35);assert.equal(metrics.registrationGaps,1);
 assert.equal(records.length,35);assert.equal(gaps.length,1);
 assert.equal(gaps[0].metadata.projectionType,"registration_gap");
 assert.equal(JSON.parse(gaps[0].content).name,"4PLANET FRONTIER");
});
