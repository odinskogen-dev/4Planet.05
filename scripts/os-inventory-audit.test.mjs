import test from "node:test";
import assert from "node:assert/strict";
import {reconcileDocumentedInventory} from "./os-inventory-audit.mjs";
const HEADER=["source_no","provider","provider_id","knowledge_id","parent_id","exact_path",
"title","mime_type","extension","file_or_folder"];
function fixture(){
 const files=Array.from({length:2001},(_,i)=>({id:"SOURCE"+i}));
 const rows=[HEADER,...files.map((f,i)=>[String(i+1),"gdrive",f.id,"","","",
 "Organisation source "+i,"application/vnd.google-apps.document","","file"])];
 return {files,rows};
}
test("documented organisational inventory is fully covered, not falsely entire corpus",()=>{
 const {rows,files}=fixture(),a=reconcileDocumentedInventory(rows,files);
 assert.equal(a.organisationalFilesPresent,2001);
 assert.equal(a.unexplainedOmissions,0);assert.equal(a.safeToCommit,true);
 assert.equal(a.inventoryOpen,true);
});
test("private sources must be excluded but never named in persisted audit",()=>{
 const {rows,files}=fixture();rows.push(["2002","gdrive","PRIVATE-ID","","","","ODIN BRAIN — PRIVATE ROOT POINTER",
 "application/vnd.google-apps.document","","file"]);
 const a=reconcileDocumentedInventory(rows,files);
 assert.equal(a.excludedPrivate,1);assert.equal(a.expectedOrganisationalFiles,2001);
 assert.equal(JSON.stringify(a).includes("PRIVATE-ID"),false);
});
test("missing organisational source fails closed",()=>{
 const {rows,files}=fixture();files.pop();
 const a=reconcileDocumentedInventory(rows,files);
 assert.equal(a.unexplainedOmissions,1);assert.equal(a.safeToCommit,false);
});
test("new organisational source does not get silently counted in legacy census",()=>{
 const {rows,files}=fixture();files.push({id:"NEW_SOURCE"});
 const a=reconcileDocumentedInventory(rows,files);
 assert.equal(a.newOrUnindexedFiles,1);assert.equal(a.inventoryOpen,true);
});
test("duplicate Source Inventory provider IDs fail",()=>{
 const {rows,files}=fixture();rows.push([...rows[1]]);
 assert.throws(()=>reconcileDocumentedInventory(rows,files),/DUPLICATE_PROVIDER_ID/);
});
test("truncated Source Inventory fails rather than certifying zero omissions",()=>{
 const {rows,files}=fixture();assert.throws(()=>reconcileDocumentedInventory(rows.slice(0,900),files),/PARTIAL_EXPORT/);
});
