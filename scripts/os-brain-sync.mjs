#!/usr/bin/env node
// Read-only organizational Drive -> rebuildable projection in existing BRAIN.
// No ODIN BRAIN, no raw source edits, no Github/Cloudflare publishing of data.
import {createHash,createPrivateKey,sign} from "node:crypto";
import {mkdtempSync,writeFileSync,rmSync} from "node:fs";
import {tmpdir} from "node:os";
import {join} from "node:path";
import {execFileSync} from "node:child_process";
import {CONTROL_ID,LATER_HOMES,normaliseGoldProjectSheets,normaliseLaterProjectHome} from "./os-project-normalizer.mjs";
const ROOT="16UzbrS_xiSxvsrWkmUvp9M3OABOebiSG";
const EXPECTED_EMAIL="id-planet-brain-reader@planet-brain-sync.iam.gserviceaccount.com";
const API="https://ghvdzetmplqkdtfqiror.supabase.co/functions/v1/os-brain-ingest";
const AUDIENCE="4planet-os-brain-ingest";
const runKey=`${process.env.GITHUB_RUN_ID||"0"}-${process.env.GITHUB_RUN_ATTEMPT||"1"}`;
const sourceRevision=process.env.OS_SOURCE_SHA||process.env.GITHUB_SHA||"unknown";
const PRIVATE=/odin brain|odin private|private root|personal brain|personlig|tenant brain|private person|secrets|credentials/i;
const opts={minDelay:80,maxItems:25000,maxContentDocs:110,maxTabs:22};
function sha(s){return createHash("sha256").update(s).digest("hex");}
function safeError(e){return e instanceof Error?e.message.replace(/Bearer\s+[^\s]+/g,"[REDACTED]").slice(0,180):"UNKNOWN";}
async function get(url,headers={},method="GET",body){
 let error;
 for(let retry=0;retry<5;retry++){
  try{
   const r=await fetch(url,{method,headers,body,signal:AbortSignal.timeout(28000),redirect:"error"});
   if([429,500,502,503,504].includes(r.status)){error=new Error("UPSTREAM_TRANSIENT_"+r.status);await new Promise(x=>setTimeout(x,600*(retry+1)**2));continue;}
   if(!r.ok)throw new Error("HTTP_"+r.status+"_"+new URL(url).hostname);
   return r;
  }catch(e){error=e;if(retry===4)break;await new Promise(x=>setTimeout(x,500*(retry+1)));}
 }
 throw error||new Error("UPSTREAM_FAILED");
}
function assertion(account){
 const now=Math.floor(Date.now()/1000),enc=o=>Buffer.from(JSON.stringify(o)).toString("base64url");
 const signed=enc({alg:"RS256",typ:"JWT"})+"."+enc({
  iss:account.client_email,scope:"https://www.googleapis.com/auth/drive.readonly https://www.googleapis.com/auth/spreadsheets.readonly",
  aud:account.token_uri,iat:now,exp:now+1800
 });
 return signed+"."+sign("RSA-SHA256",Buffer.from(signed),createPrivateKey(account.private_key)).toString("base64url");
}
async function googleToken(account){
 const r=await get(account.token_uri,{"Content-Type":"application/x-www-form-urlencoded"},"POST",
  new URLSearchParams({grant_type:"urn:ietf:params:oauth:grant-type:jwt-bearer",assertion:assertion(account)}));
 const j=await r.json();if(!j.access_token)throw Error("GOOGLE_TOKEN_NOT_ISSUED");return j.access_token;
}
async function githubOidc(){
 const req=process.env.ACTIONS_ID_TOKEN_REQUEST_URL,auth=process.env.ACTIONS_ID_TOKEN_REQUEST_TOKEN;
 if(!req||!auth)throw Error("GITHUB_OIDC_NOT_AVAILABLE");
 const sep=req.includes("?")?"&":"?";
 const r=await get(req+sep+"audience="+encodeURIComponent(AUDIENCE),{Authorization:"Bearer "+auth});
 const j=await r.json();if(!j.value)throw Error("GITHUB_OIDC_NOT_ISSUED");return j.value;
}
async function ingest(action,extra={}){
 const jwt=await githubOidc();
 const r=await get(API,{"Authorization":"Bearer "+jwt,"Content-Type":"application/json"},"POST",
  JSON.stringify({action,runKey,...extra}));
 const j=await r.json();if(!j.ok)throw Error("OS_INGEST_"+action+"_REJECTED");return j.accepted;
}
function uri(item){
 if(item.webViewLink?.startsWith("https://"))return item.webViewLink;
 if(item.mimeType==="application/vnd.google-apps.spreadsheet")return "https://docs.google.com/spreadsheets/d/"+item.id+"/edit";
 if(item.mimeType==="application/vnd.google-apps.document")return "https://docs.google.com/document/d/"+item.id+"/edit";
 return "https://drive.google.com/file/d/"+item.id+"/view";
}
function rank(f){
 const t=(f.name+" "+f.path).toLowerCase();
 if(/01_ project lead current|02_ active tasks|read first/.test(t))return 1;
 if(/programme control|program control|atomic programme register|founder control register/.test(t))return 2;
 if(/project packs|project home|wbs|decision register|decisions\.md/.test(t))return 3;
 if(/capital|proof passport|founder decision|actor/.test(t))return 4;
 return 9;
}
function classification(f){
 const t=(f.name+" "+f.path).toLowerCase();
 if(/project lead current/.test(t))return "project_lead";
 if(/active tasks/.test(t))return "active_tasks";
 if(/atomic programme register|atomic wbs|atomic task/.test(t))return "atomic_wbs";
 if(/programme control|program control/.test(t))return "programme_control";
 if(/decision/.test(t))return "decision_register";
 if(/capital/.test(t))return "capital_control";
 if(/project pack/.test(t))return "project_pack";
 if(/project home|\bproject\b/.test(t))return "project_home";
 return "source_document";
}
async function main(){
 let account;try{account=JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON||"");}catch{throw Error("GOOGLE_SERVICE_ACCOUNT_JSON_INVALID");}
 if(account.type!=="service_account"||account.client_email!==EXPECTED_EMAIL||!account.private_key)throw Error("GOOGLE_SERVICE_ACCOUNT_IDENTITY_INVALID");
 const google=await googleToken(account);
 const driveHeaders={Authorization:"Bearer "+google};
 const rootMeta=await (await get("https://www.googleapis.com/drive/v3/files/"+ROOT+"?fields=id,name,mimeType",driveHeaders)).json();
 if(rootMeta.id!==ROOT||rootMeta.mimeType!=="application/vnd.google-apps.folder")throw Error("ORGANIZATIONAL_FOLDER_NOT_VERIFIED");
 const queue=[{id:ROOT,path:"01_ 4PLANET KNOWLEDGE OS"}],seen=new Set([ROOT]),files=[];
 for(let i=0;i<queue.length;i++){
  const folder=queue[i];let next="";
  do{
   const params=new URLSearchParams({q:"'"+folder.id+"' in parents and trashed=false",
    fields:"nextPageToken,files(id,name,mimeType,modifiedTime,webViewLink,parents,description)",
    pageSize:"1000",supportsAllDrives:"true",includeItemsFromAllDrives:"true"});
   if(next)params.set("pageToken",next);
   const data=await(await get("https://www.googleapis.com/drive/v3/files?"+params,driveHeaders)).json();
   for(const f of data.files||[]){
    if(seen.has(f.id))continue;seen.add(f.id);
    const path=folder.path+"/"+f.name;
    if(PRIVATE.test(path))continue;
    if(f.mimeType==="application/vnd.google-apps.folder")queue.push({id:f.id,path});
    else files.push({...f,path});
    if(seen.size>opts.maxItems)throw Error("INVENTORY_LIMIT_REACHED_FAIL_CLOSED");
   }
   next=data.nextPageToken||"";
  }while(next);
 }
 if(!files.length)throw Error("KNOWLEDGE_OS_INVENTORY_EMPTY");
 console.log("Organizational Knowledge OS source inventory complete; folderCount="+queue.length+" fileCount="+files.length+" (filenames/content withheld).");
 const records=files.map(f=>({
  source_id:f.id,title:f.name.slice(0,600),mime_type:f.mimeType,source_url:uri(f),
  parent_path:f.path.slice(0,2990),source_modified_at:f.modifiedTime||null,
  source_hash:sha(f.id+"|"+f.modifiedTime+"|"+f.name),
  object_type:"source_inventory",content:null,
  metadata:{rootId:ROOT,domain:"4planet",tenant:null,readDepth:"INVENTORY_ONLY",sourceFileId:f.id}
 }));
 const sorted=[...files].filter(f=>rank(f)<9).sort((a,b)=>rank(a)-rank(b)||String(b.modifiedTime).localeCompare(String(a.modifiedTime)));
 let readCount=0,denied=0,sheetTabs=0;
 for(const f of sorted){
  if(readCount>=opts.maxContentDocs)break;
  if(f.mimeType==="application/vnd.google-apps.document"||f.mimeType==="text/plain"||f.mimeType==="text/markdown"){
   try{
    let content;
    if(f.mimeType==="application/vnd.google-apps.document")content=await(await get(
     "https://www.googleapis.com/drive/v3/files/"+f.id+"/export?"+new URLSearchParams({mimeType:"text/plain"}),driveHeaders)).text();
    else content=await(await get("https://www.googleapis.com/drive/v3/files/"+f.id+"?alt=media",driveHeaders)).text();
    if(!content?.trim())continue;
    const record=records.find(x=>x.source_id===f.id);
    if(record){
     record.content=content.slice(0,80000);
     record.object_type=classification(f);
     record.source_hash=sha(content);
     record.metadata={...record.metadata,readDepth:"CONTENT",truncated:content.length>80000};
     readCount++;
    }
   }catch(e){denied++;console.log("Source text skipped; reason="+safeError(e).replace(/\d{12,}/g,"[ID]"));}
  } else if(f.mimeType==="application/vnd.google-apps.spreadsheet" && sheetTabs<opts.maxTabs){
   try{
    // Drive export works with the existing Drive reader, even when Sheets API is disabled.
    const response=await get("https://www.googleapis.com/drive/v3/files/"+f.id+
      "/export?"+new URLSearchParams({mimeType:"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"}),driveHeaders);
    const bytes=Buffer.from(await response.arrayBuffer());
    if(bytes.length>10500000)throw Error("DRIVE_SHEET_EXPORT_TOO_LARGE");
    const directory=mkdtempSync(join(tmpdir(),"4planet-os-sheets-"));
    let tabs;
    try{
      const file=join(directory,"source.xlsx");writeFileSync(file,bytes,{mode:0o600});
      tabs=JSON.parse(execFileSync("python3",["scripts/os-xlsx-rows.py",file],{
        encoding:"utf8",maxBuffer:24*1024*1024,timeout:35000,stdio:["ignore","pipe","pipe"]
      }));
    }finally{rmSync(directory,{recursive:true,force:true});}
    for(const s of tabs.slice(0,opts.maxTabs-sheetTabs)){
      const values=(s.rows||[]).slice(0,900);
      if(!values.length)continue;
      const valueText=values.map((r,i)=>String(i+1)+": "+r.map(x=>String(x).replace(/[\r\n]+/g," ")).join(" | ")).join("\n");
      records.push({
       source_id:f.id+"_"+s.sheetId,title:(f.name+" — "+s.name).slice(0,600),
       mime_type:f.mimeType,source_url:uri(f),parent_path:f.path.slice(0,2990),
       source_modified_at:f.modifiedTime||null,source_hash:sha(valueText),object_type:classification(f),
       content:valueText.slice(0,80000),
       metadata:{rootId:ROOT,domain:"4planet",tenant:null,sourceFileId:f.id,sheetId:s.sheetId,
        tab:s.name,readDepth:"SHEET_ROWS",rowsRead:values.length,truncated:valueText.length>80000}
      });sheetTabs++;readCount++;
    }
   }catch(e){denied++;console.log("Structured sheet skipped; reason="+safeError(e).replace(/\d{12,}/g,"[ID]"));}
  }
 }
 // The same existing Drive reader materialises a project VIEW from the specific
 // canonical Gold register. Generic filename ranking/maxTabs must not silently
 // omit Gold Project Contract, Universal WBS or the Master Project Register.
 const canonical=files.find(f=>f.id===CONTROL_ID);
 if(!canonical)throw Error("CANONICAL_PROJECT_REGISTER_NOT_IN_DRIVE_INVENTORY");
 let structured;
 try {
  const res=await get("https://www.googleapis.com/drive/v3/files/"+CONTROL_ID+
   "/export?"+new URLSearchParams({mimeType:"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"}),driveHeaders);
  const bytes=Buffer.from(await res.arrayBuffer());
  if(bytes.length>10500000)throw Error("CANONICAL_PROJECT_REGISTER_EXPORT_TOO_LARGE");
  const directory=mkdtempSync(join(tmpdir(),"4planet-project-view-"));
  try {
   const file=join(directory,"canonical.xlsx");writeFileSync(file,bytes,{mode:0o600});
   const tabs=JSON.parse(execFileSync("python3",["scripts/os-xlsx-rows.py",file],{
    encoding:"utf8",maxBuffer:24*1024*1024,timeout:35000,stdio:["ignore","pipe","pipe"]
   }));
   structured=normaliseGoldProjectSheets(tabs,canonical,ROOT);
  }finally{rmSync(directory,{recursive:true,force:true});}
 }catch(e){throw Error("CANONICAL_PROJECT_VIEW_BLOCKED_"+safeError(e));}
 // A source file inventory row and its derived project rows are different
 // depths of the same authority, not competing master data.
 records.push(...structured.records);
 // The 4SAPIEN / 4BRAND Project Homes are already approved in BRAIN but are
 // absent from the older 41-row Gold register. Keep their OWN source identity
 // and a visible crosswalk gap; no duplicate authority, no synthetic status.
 const later=[];
 for(const spec of LATER_HOMES){
  if(structured.records.some(x=>x.metadata.projectId===spec.id&&x.metadata.wbsCount>=spec.expected))continue;
  const f=files.find(x=>x.id===spec.fileId);
  if(!f){console.log("LATER_PROJECT_HOME_NOT_IN_RECURSIVE_INVENTORY "+spec.id);continue;}
  try{
   const res=await get("https://www.googleapis.com/drive/v3/files/"+spec.fileId+
    "/export?"+new URLSearchParams({mimeType:"text/plain"}),driveHeaders);
   const text=await res.text();
   const derived=normaliseLaterProjectHome(spec,text,f,ROOT);
   const existing=structured.records.findIndex(x=>x.metadata.projectId===spec.id);
   if(existing>=0)structured.records.splice(existing,1);
   later.push(derived);
  }catch(e){console.log("LATER_PROJECT_HOME_PENDING "+spec.id+" "+safeError(e));}
 }
 records.push(...later);
 console.log("PROJECT_VIEW_GOLD_CROSSWALK_GAPS "+(LATER_HOMES.length-later.length));
 console.log("PROJECT_VIEW_DERIVED_FROM_GOLD projects="+structured.metrics.projects+
  " wbs="+structured.metrics.wbs+" without_wbs="+structured.metrics.withoutWbs.length+
  " current_status=UNKNOWN_UNTIL_PROGRAMME_RECONCILIATION");
 // Never claim an un-read inventory title is equivalent to current project truth.
 const ordered=records.sort((a,b)=>a.source_id.localeCompare(b.source_id));
 const manifest=sha(ordered.map(x=>[x.source_id,x.source_hash,x.object_type].join(":")).join("\n"));
 console.log("Read-only Drive extraction completed; authoritative-content="+readCount+
  " structuredTabs="+sheetTabs+" unreadable="+denied+" inventoryEntries="+files.length+
  " projectionRecords="+ordered.length+" ; unhydrated=UNKNOWN.");
 if(readCount<2)throw Error("CANONICAL_SOURCE_READ_TOO_SPARSE");
 await ingest("start",{revision:sourceRevision});
 try{
  for(let i=0;i<ordered.length;i+=50){
   await ingest("batch",{records:ordered.slice(i,i+50)});
   console.log("Persisted source-bound private batch "+(Math.floor(i/50)+1)+"/"+Math.ceil(ordered.length/50));
  }
  const accepted=await ingest("finish",{expected:ordered.length,inventoryHash:manifest});
  const readback=await ingest("status");
  if(!readback || readback.runKey!==runKey || readback.state!=="success" ||
     readback.expectedCount!==ordered.length || readback.observedCount!==ordered.length ||
     readback.inventoryHash!==manifest || readback.isLatestSuccess!==true || !readback.completedAt)
    throw Error("SOURCE_TO_PRIVATE_BRAIN_READBACK_MISMATCH");
  console.log("SYNC_COMMITTED_AND_READBACK_VERIFIED count="+accepted+" inventory_sha256="+manifest+
   " last_success="+readback.completedAt+" source_sha="+sourceRevision);
 }catch(e){
  try{await ingest("fail",{code:safeError(e).replace(/[^A-Z0-9_]/gi,"_")});}catch{}
  throw e;
 }
}
main().catch(e=>{console.error("SYNC_NOT_COMMITTED",safeError(e));process.exitCode=1;});
