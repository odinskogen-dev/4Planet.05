#!/usr/bin/env node
// Read-only organizational Drive -> rebuildable projection in existing BRAIN.
// No ODIN BRAIN, no raw source edits, no Github/Cloudflare publishing of data.
import {createHash,createPrivateKey,sign} from "node:crypto";
import {mkdtempSync,writeFileSync,rmSync} from "node:fs";
import {tmpdir} from "node:os";
import {join} from "node:path";
import {execFileSync} from "node:child_process";
import {pathToFileURL} from "node:url";
const ROOT="16UzbrS_xiSxvsrWkmUvp9M3OABOebiSG"; // Canonical parent ID for traceability ONLY; NEVER enumerate/share root.
// Reviewed, scoped organisational entrypoints. Share access to ONLY these exact folders,
// never the Knowledge OS parent and never personal / VAULT / archived subtrees.
const SAFE_ROOTS=Object.freeze([
 {id:"1r9nIk160uQDMyaHza9pOvlDWM09ZXoCx",name:"00_ PROJECT LEAD + LLM ENTRY",
  path:"01_ 4PLANET KNOWLEDGE OS/00_ PROJECT LEAD + LLM ENTRY"},
 {id:"1kmdjueCJhVFxJS_qgrV1zFRQ_AZ8A3td",name:"00_ CONSTITUTION & CANON",
  path:"01_ 4PLANET KNOWLEDGE OS/02_ BRAIN SYSTEM/00_ CONSTITUTION & CANON"},
 {id:"1Ko8WAzrc9uo4uhBIoqb8zu_EjX6Ghr9o",name:"01_ SHARED KNOWLEDGE KERNEL",
  path:"01_ 4PLANET KNOWLEDGE OS/02_ BRAIN SYSTEM/01_ SHARED KNOWLEDGE KERNEL"}
]);
const MUST_READ=Object.freeze([
 "14XladRgIy9vCGMCWvuPw37MnCGsa0iJcafyTd2tYKww", // Current Project Lead
 "1dqh16Im3owXVLfT2rUyCFPWal86DEGxlvyeYvh3OvQs" // Active Tasks
]);
const SCOPE_VERSION="ORG_SOURCE_ALLOWLIST_V2";
const EXPECTED_EMAIL="id-planet-brain-reader@planet-brain-sync.iam.gserviceaccount.com";
const API="https://ghvdzetmplqkdtfqiror.supabase.co/functions/v1/os-brain-ingest";
const AUDIENCE="4planet-os-brain-ingest";
const runKey=`${process.env.GITHUB_RUN_ID||"0"}-${process.env.GITHUB_RUN_ATTEMPT||"1"}`;
// The scheduled job checks out labs/overview-v1, while GITHUB_SHA may identify
// its main-branch schedule trigger. Attest the checked-out source, not the trigger.
const sourceRevision=process.env.OS_SOURCE_SHA||
 execFileSync("git",["rev-parse","HEAD"],{encoding:"utf8"}).trim();
// Enforce explicit subtree exclusions even INSIDE approved organisation folders.
const PRIVATE=/odin brain|odin oddekalv|odin private|private root|personal brain|personlig|tenant brain|private person|secrets|credentials|(?:^|[\\/ _-])vault(?:$|[\\/ _-])|code vault|backup|archive|history|recovery|api.?key|password/i;
const CONTENT_SAFETY_VERSION="ORG_CONTENT_CLASSIFIER_V4_MIXED_PII_FAIL_CLOSED";
const CONTENT_RULES=Object.freeze([
 {category:"SECRET",pattern:/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----|\b(?:client[_ -]?secret|api[_ -]?key|password|access[_ -]?token|refresh[_ -]?token)\s*[:=]\s*\S+|\b(?:authorization\s*:\s*)?(?:Basic|Bearer)\s+[A-Za-z0-9._~+\/=\/-]{8,}|\b(?:sk|rk)_(?:live|test)_[A-Za-z0-9]{12,}/i},
 {category:"TENANT",pattern:/\btenant(?:_id)?\s*[:=]\s*(?!null\b|none\b|unknown\b)[A-Za-z0-9_-]+|\b(?:private_context|private_profile|personal_brain_record|tenant_private_data)\s*[:=]/i},
 {category:"PERSON",pattern:/\b(?:social security number|national identity number|f[øo]dselsnummer|date of birth|birth date|f[øo]dselsdato|dob|private address|private e-?mail|personal e-?mail|private contact|personal contact|contact details?|email address)\s*[:=]/i},
 {category:"PERSON",pattern:/\b(?:phone|telephone|mobile|telefon|mobilnummer)\b[^\r\n]{0,24}\+?\d[\d\s().-]{6,}\d|\+\d{1,3}(?:[\s().-]*\d){7,14}\b|\b(?:private|personal|home|postal|street)?\s*(?:address|adresse)\s*[:=]|\b\d{1,5}\s+(?:[A-Za-zÆØÅæøå0-9.'-]+\s+){1,5}(?:street|st\.?|road|rd\.?|avenue|ave\.?|lane|ln\.?|boulevard|blvd\.?|drive|dr\.?|way|gate|gata|vei|veien)\b|\b(?:[A-Za-zÆØÅæøå0-9.'-]+\s+){1,5}(?:gate|gata|vei|veien)\s+\d{1,5}\b/i},
 {category:"HEALTH",pattern:/\b(?:diagnosis|diagnose|medical record|health record|health|medical|helse(?:opplysninger|journal)?|medication|medisin(?:er)?|patient(?:en)?|pasient(?:en)?|chronic condition|kronisk tilstand|har diagnosen|uses? medication|bruker medisin(?:er)?)\b/i},
 {category:"FINANCE",pattern:/\b(?:personal debt|private finance|bank account|account number|bankkonto|kontonummer|iban|swift|bic|routing number|tax debt|private investment account)\s*[:=]|\b(?:pin|passcode|account pin|konto[- ]?pin)\s*[:=]?\s*\d{4,8}\b|\b[A-Z]{2}\d{2}(?:[\s-]?[A-Z0-9]){11,30}\b/i},
 {category:"LEGAL",pattern:/\b(?:personal legal|legal case|court case|lawsuit|case number)\s*[:=]/i}
 ,{category:"AMBIGUOUS_PRIVATE",pattern:/\b(?:confidential|strictly private|sensitive personal|personally identifiable information|pii)\s*[:=]/i}
]);
const SAFE_ORG_CONTENT=Object.freeze([
 /\b(?:4planet|naturebrain|brain|atlas|species|s4piens|impact|labs)\b/i,
 /\b(?:project|programme|program|portfolio|task|wbs|owner|status|state|goal|scope|authority|receiver|branch|commit|sha|pull request|pr\s*#|issue|workflow|runtime|source|dataset|actor|rights?)\b/i,
 /\b(?:release|deploy|build|test|evidence|proof|gold|judge|maker|next|action|decision|result|learning|risk|dependency|gate|qa|ci|candidate|review|correction|canonical|control|public)\b/i,
 /\b(?:blocked|hold|pending|pass(?:ed)?|fail(?:ed)?|success|ready|done|active|current|verified|accepted|rejected|unknown|not live)\b/i
]);
const opts={minDelay:80,maxItems:25000,maxContentDocs:110,maxTabs:22};
function sha(s){return createHash("sha256").update(s).digest("hex");}
function safeError(e){return e instanceof Error?e.message.replace(/Bearer\s+[^\s]+/g,"[REDACTED]").slice(0,180):"UNKNOWN";}
function sensitiveCategories(line){
 return CONTENT_RULES.filter(rule=>rule.pattern.test(line)).map(rule=>rule.category);
}
function explicitlySafeOrganisationalLine(line){
 const body=line.replace(/^\s*\d+:\s*/,"").trim();
 if(!body || /^[-=_*#|:\s]+$/.test(body))return true;
 const cells=body.split("|").map(cell=>cell.trim()).filter(Boolean);
 return cells.length>0 && cells.every(cell=>{
  if(SAFE_ORG_CONTENT.some(pattern=>pattern.test(cell)))return true;
  if(/^(?:[A-Z][A-Z0-9_]{1,20}(?:-[A-Z0-9_]{1,20})+|[a-f0-9]{40}|(?:QA|CI|PR|SHA|WBS|P0|P1|P2|P3))$/i.test(cell))return true;
  if(/^https:\/\/(?:github\.com|docs\.google\.com|drive\.google\.com|(?:[a-z0-9-]+\.)?4planet(?:atlas)?\.(?:org|com))(?:\/[^?#\s]*)?$/i.test(cell))return true;
  return false;
 });
}
export function classifyContentForIngest(input){
 const original=String(input??"");
 const categories=new Set();let redactedLines=0;
 const content=original.split(/\r?\n/).map(line=>{
  const found=sensitiveCategories(line);
  if(!found.length && !explicitlySafeOrganisationalLine(line))found.push("UNREVIEWED");
  if(!found.length)return line;
  found.forEach(category=>categories.add(category));redactedLines++;
  const rowPrefix=line.match(/^\s*\d+:\s*/)?.[0]||"";
  return rowPrefix+"[REDACTED:SENSITIVE]";
 }).join("\n");
 const usable=content.split(/\r?\n/).some(line=>line.trim() && !/^\s*(?:\d+:\s*)?\[REDACTED:SENSITIVE\]\s*$/.test(line));
 return {
  state:redactedLines?(usable?"REDACTED":"QUARANTINED"):"SAFE",
  content:usable||!redactedLines?content:null,
  categories:[...categories].sort(),redactedLines,originalHash:sha(original)
 };
}
export function prepareClassifiedRecords(records,mustRead=MUST_READ){
 let redacted=0,quarantined=0;
 const prepared=records.map(record=>{
  if(typeof record.content!=="string")return record;
  const result=classifyContentForIngest(record.content);
  if(result.state==="REDACTED")redacted++;
  if(result.state==="QUARANTINED")quarantined++;
  const readDepth=result.state==="SAFE"?record.metadata?.readDepth:
   result.state==="REDACTED"?record.metadata?.readDepth+"_REDACTED":"QUARANTINED";
  const eligibleForGraph=result.state==="SAFE" &&
    ["CONTENT","SHEET_ROWS"].includes(record.metadata?.readDepth) &&
    record.metadata?.domain==="4planet" && record.metadata?.tenant===null &&
    record.metadata?.truncated!==true &&
    typeof result.content==="string" && result.content.trim().length>0;
  return {...record,content:result.content,
   source_hash:result.content===null?record.source_hash:sha(result.content),
   object_type:result.content===null?"source_inventory":record.object_type,
   metadata:{...record.metadata,readDepth,
   // GraphRAG's reviewed-source reader accepts an EXPLICIT classification,
    // not just a safe path. Fail closed for inventory-only, partially
    // redacted and quarantined records; never approve unknown source bodies.
    classification:eligibleForGraph ? "INTERNAL_APPROVED" : "PENDING_REVIEW",
   contentSafety:{
    version:CONTENT_SAFETY_VERSION,state:result.state,categories:result.categories,
    redactedLines:result.redactedLines,originalHash:result.originalHash
   }}
  };
 });
 for(const id of mustRead){
  const doc=prepared.find(x=>x.source_id===id);
  if(!doc?.content || !String(doc.metadata?.readDepth||"").startsWith("CONTENT"))
   throw Error("MANDATORY_CANONICAL_SOURCE_UNREADABLE_AFTER_CLASSIFICATION");
 }
 for(const record of prepared){
  if(typeof record.content!=="string")continue;
  if(record.content.split(/\r?\n/).some(line=>sensitiveCategories(line).length))
   throw Error("SENSITIVE_CONTENT_SURVIVED_CLASSIFICATION");
 }
 return {records:prepared,redacted,quarantined,
  usableContent:prepared.filter(x=>typeof x.content==="string"&&x.content.trim()).length};
}
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
 // Each safe root is verified independently. The private Knowledge OS PARENT
 // is never fetched, listed, or added to the service account's read scope.
 for(const root of SAFE_ROOTS){
  const m=await(await get(
   "https://www.googleapis.com/drive/v3/files/"+root.id+"?fields=id,name,mimeType",
   driveHeaders)).json();
  if(m.id!==root.id||m.name!==root.name||
     m.mimeType!=="application/vnd.google-apps.folder")
   throw Error("SAFE_ORGANIZATIONAL_FOLDER_NOT_VERIFIED");
 }
 const queue=SAFE_ROOTS.map(x=>({id:x.id,
  path:x.path,scopeRootId:x.id}));
 const seen=new Set(SAFE_ROOTS.map(x=>x.id)),files=[];
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
    if(f.mimeType==="application/vnd.google-apps.folder")queue.push({
     id:f.id,path,scopeRootId:folder.scopeRootId
    });
    else files.push({...f,path,scopeRootId:folder.scopeRootId});
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
  metadata:{rootId:ROOT,scopeRootId:f.scopeRootId,scopeVersion:SCOPE_VERSION,
   domain:"4planet",tenant:null,readDepth:"INVENTORY_ONLY",sourceFileId:f.id}
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
       metadata:{rootId:ROOT,scopeRootId:f.scopeRootId,scopeVersion:SCOPE_VERSION,
        domain:"4planet",tenant:null,sourceFileId:f.id,sheetId:s.sheetId,
        tab:s.name,readDepth:"SHEET_ROWS",rowsRead:values.length,truncated:valueText.length>80000}
      });sheetTabs++;readCount++;
    }
   }catch(e){denied++;console.log("Structured sheet skipped; reason="+safeError(e).replace(/\d{12,}/g,"[ID]"));}
  }
 }
 // Never claim an un-read inventory title is equivalent to current project truth.
 console.log("Read-only Drive extraction completed; authoritative-content="+readCount+
  " structuredTabs="+sheetTabs+" unreadable="+denied+" inventoryEntries="+files.length+
  " projectionRecords="+records.length+" ; unhydrated=UNKNOWN.");
 // Content is classified before ANY ingest write. Classification failure leaves the
 // last successful projection untouched because ingest("start") has not run yet.
 if(records.some(x=>PRIVATE.test(x.parent_path||"") || PRIVATE.test(x.title||"")))
  throw Error("PRIVATE_OR_ARCHIVED_SOURCE_IN_PROJECTION");
 const classified=prepareClassifiedRecords(records);
 if(classified.usableContent<2)throw Error("CANONICAL_SOURCE_READ_TOO_SPARSE_AFTER_CLASSIFICATION");
 const ordered=classified.records.sort((a,b)=>a.source_id.localeCompare(b.source_id));
 // SUCCESS of an inventory projection is NOT coverage of every source body.
 // This lightweight receipt prevents a matching record-count from being
 // mistaken for a complete organisational knowledge/GraphRAG sync.
 const hydrated=ordered.filter(x=>["CONTENT","SHEET_ROWS"].includes(x.metadata?.readDepth)).length;
 const redacted=ordered.filter(x=>String(x.metadata?.readDepth||"").includes("_REDACTED")).length;
 const inventoryOnly=ordered.filter(x=>x.metadata?.readDepth==="INVENTORY_ONLY").length;
 const quarantined=ordered.filter(x=>x.metadata?.readDepth==="QUARANTINED").length;
 const truncated=ordered.filter(x=>x.metadata?.truncated===true).length;
 console.log("SOURCE_COVERAGE_RECEIPT "+JSON.stringify({totalRecords:ordered.length,hydrated,redacted,inventoryOnly,quarantined,truncated,contentBudget:opts.maxContentDocs,fullCorpusClaim:false}));
 const manifest=sha(ordered.map(x=>[x.source_id,x.source_hash,x.object_type].join(":")).join("\n"));
 console.log("Content safety verified; classifier="+CONTENT_SAFETY_VERSION+
  " redacted="+classified.redacted+" quarantined="+classified.quarantined+
  " usableContent="+classified.usableContent);
 console.log("Safe organisational source scope verified; scope="+SCOPE_VERSION+
  " approvedRoots="+SAFE_ROOTS.length+" mandatoryDocs="+MUST_READ.length);
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
  console.log("SOURCE_PROJECTION_COMMITTED_AND_READBACK_VERIFIED count="+accepted+" inventory_sha256="+manifest+
   " last_success="+readback.completedAt+" source_sha="+sourceRevision);
 }catch(e){
  try{await ingest("fail",{code:safeError(e).replace(/[^A-Z0-9_]/gi,"_")});}catch{}
  throw e;
 }
}
if(process.argv[1] && import.meta.url===pathToFileURL(process.argv[1]).href)
 main().catch(e=>{console.error("SYNC_NOT_COMMITTED",safeError(e));process.exitCode=1;});
