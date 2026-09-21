// Read-only Project Pack -> Founder project index. BRAIN sheets remain the only authority.
// This is a materialised VIEW of existing Gold/Universal WBS/Project OS, not a new project registry.
import {createHash} from "node:crypto";
export const CONTROL_ID="18TGuqbFGqcHMLatBz_WqJUYujQKmBhXAeSNN0cXQreU";
const hash=x=>createHash("sha256").update(x).digest("hex");
const friendly={
"SYS-P00-01":"4PLANET FOUNDING BUILD","SYS-P00-STRAT":"4PLANET STRATEGY","SYS-P00-PRODUCT":"ONE INTERFACE",
"SYS-P00-TRUTH":"NATUREBRAIN","SYS-P00-PROOF":"EXTERNAL PROOF","SYS-P00-CAPITAL":"CAPITAL ENGINE",
"SYS-P00-COMPANY":"4PLANET COMPANY","SYS-P00-REL":"RELATIONSHIPS","SYS-P00-BRAND":"4PLANET BRAND",
"SYS-P00-BRAIN":"4PLANET BRAIN","SYS-P00-FOUNDER":"FOUNDER CAPACITY",
"OCE-WH4LES-01":"WH4LES","OCE-COR4L-01":"COR4L","OCE-PL4STIC-01":"PL4STIC / CLE4N",
"OCE-REWILD-M-01":"RE:WILD MARINE","EAR-CLIM4TE-01":"CLIM4TE","EAR-AM4ZONIA-01":"AM4ZONIA",
"EAR-SPECIES-01":"SPECIES","EAR-REWILD-L-01":"RE:WILD LAND",
"SAP-FOOD-01":"FOOD","SAP-EN3RGY-01":"EN3RGY / EN4RGY","SAP-CIRCULAR-01":"CIRCULAR CITY",
"SAP-F4SHION-01":"F4SHION","CUL-M4GAZINE-01":"4PLANET MAGAZINE","CUL-4FILM-01":"4FILM",
"CUL-4RT-01":"4RT","CUL-4PLAY-01":"4PLAY","SYS-P00-PMAP":"PLANETARY MAP",
"SYS-P00-SOLUTIONS":"SOLUTION INTELLIGENCE","SYS-P00-LABS":"4PLANET LABS",
"SAP-SAPIENS-01":"S4PIENS","SYS-P00-DPITCH":"DIGITAL PITCH PACK",
"SYS-P00-ECONOMY":"4PLANET ECONOMY","SYS-SONIC-01":"4PLANET SONIC",
"LAB-CREATOR-01":"CRE4TORS","LAB-ENGINE-FOUNDRY-01":"ENGINE FOUNDRY",
"IMP-MARKET-01":"4PLANET MARKET","SYS-LUME-PROJECT-01":"LUME PLANET",
"SYS-LUME-NODE-01":"LUME NODE","SYS-PAI-01":"TREE OF LIFE / PLANETARY ACTION INTELLIGENCE",
"SYS-P00-NATURE-XR":"NATURE XR"
};
const genre=id=>id.startsWith("OCE-")?"OCE4N_":id.startsWith("EAR-")?"E4RTH_":
id.startsWith("SAP-")?"S4PIENS_":id.startsWith("CUL-")?"4CULTURE_":
id.startsWith("IMP-")?"IMPACT / MARKET":id.startsWith("LAB-")?"LABS / CREATIVE":
id.startsWith("SYS-LUME")||id==="SYS-SONIC-01"?"CULTURE / PRODUCT":
id==="SYS-P00-CAPITAL"||id==="SYS-P00-ECONOMY"?"ECONOMY / CAPITAL":
"4PLANET / SHARED";
const sheet=(tabs,pattern)=>tabs.find(t=>pattern.test(t.name??""));
const recordsAfterHeader=(tab,first)=>{const rows=tab?.rows??[],idx=rows.findIndex(r=>r[0]===first);return idx<0?[]:rows.slice(idx+1).filter(r=>r[0]&&r[0]!=="RULE")};
const safe=s=>String(s??"").trim();
const link=(id,gid)=>"https://docs.google.com/spreadsheets/d/"+id+"/edit"+(gid?"#gid="+gid:"");
export function normaliseGoldProjectSheets(tabs,source,rootId){
 const gold=sheet(tabs,/GOLD PROJECT CONTRACT/i),wbs=sheet(tabs,/UNIVERSAL WBS/i),
 master=sheet(tabs,/MASTER PROJECT REGISTER/i),aliasSheet=sheet(tabs,/ORPHAN.*DUPLICATE/i);
 if(!gold||!wbs||!master)throw Error("CANONICAL_PROJECT_TABS_MISSING");
 const packs=recordsAfterHeader(gold,"Project ID"),tasks=recordsAfterHeader(wbs,"WBS ID"),
 masters=recordsAfterHeader(master,"Project ID"),aliases=recordsAfterHeader(aliasSheet,"Item / Alias");
 const byId=new Map();
 for(const row of packs){const id=safe(row[0]);if(!/^[A-Z0-9-]{6,75}$/.test(id))continue;
   if(byId.has(id))throw Error("DUPLICATE_GOLD_PROJECT_ID");
   byId.set(id,{id,row,wbs:[],master:null,aliases:[]});
 }
 if(byId.size<35)throw Error("GOLD_PORTFOLIO_INCOMPLETE");
 for(const row of tasks){const id=safe(row[2]);if(!id)continue;
  const p=byId.get(id);if(!p)throw Error("ORPHAN_WBS_"+id);
  p.wbs.push({id:safe(row[0]),level:safe(row[1]),deliverable:safe(row[3]),
   workPackage:safe(row[4]),completionCondition:safe(row[5]),owner:safe(row[6]),
   atomicLink:safe(row[7]),dependency:safe(row[8]),sourceReportedState:safe(row[9]),
   nextAction:safe(row[10]),gate:safe(row[11]),evidence:safe(row[12])});
 }
 for(const row of masters){const p=byId.get(safe(row[0]));if(p)p.master=row}
 for(const row of aliases){const p=byId.get(safe(row[2]));if(p)p.aliases.push(safe(row[0]))}
 const out=[];
 for(const p of byId.values()){
 const r=p.row,m=p.master,merged=/MERGE|CLOSED/i.test(safe(r[4])+" "+safe(m?.[5]));
 const document={
  schema:"4PLANET_PROJECT_VIEW_01",id:p.id,name:friendly[p.id]||safe(r[1]),
  sourceName:safe(r[1]),genre:genre(p.id),kind:p.id==="SYS-P00-01"?"programme":
   merged?"historical_or_merged":"project",parent:safe(r[2]),domain:safe(r[3]),
  lifecycleFromSource:safe(m?.[5]),auditActionFromSource:safe(r[4]),
  priorityFromSource:safe(r[5]),purpose:safe(r[7]),outcome:safe(r[8]),
  scopeIn:safe(r[10]),scopeOut:safe(r[11]),sourceReportedState:safe(r[12]),
  currentState:"NOT_RECONCILED_WITH_CURRENT_PROGRAMME",
  nextGateFromSource:safe(r[19]),aliases:p.aliases.filter(Boolean),
  wbs:p.wbs,wbsCount:p.wbs.length,
  source:{gold:link(CONTROL_ID,gold.sheetId),wbs:link(CONTROL_ID,wbs.sheetId),
   register:link(CONTROL_ID,master.sheetId),modifiedAt:source.modifiedTime??null,
   authority:"Drive Gold Project Contract + Universal WBS; Atomic is task detail",
   statusIsHistorical:true}
 };
 const content=JSON.stringify(document);
 if(content.length>80000)throw Error("PROJECT_RECORD_EXCEEDS_SOURCE_LIMIT_"+p.id);
 out.push({source_id:"project_"+p.id,title:document.name,
  mime_type:"application/vnd.4planet.project-view+json",source_url:link(CONTROL_ID,gold.sheetId),
  parent_path:"01_ 4PLANET KNOWLEDGE OS / Founder Control / Project View",
  source_modified_at:source.modifiedTime??null,source_hash:hash(content),
  object_type:"project_pack",content,metadata:{
   rootId,domain:"4planet",tenant:null,readDepth:"DERIVED_FROM_CANONICAL_ROWS",
   projectionType:"project",projectId:p.id,kind:document.kind,
   genre:document.genre,wbsCount:document.wbsCount,
   sourceFileId:CONTROL_ID,sourceSheetIds:[gold.sheetId,wbs.sheetId,master.sheetId],
   currentStatus:"UNKNOWN_UNTIL_PROGRAMME_RECONCILIATION"}});
 }
 return {records:out,metrics:{projects:out.length,wbs:out.reduce((n,p)=>n+p.metadata.wbsCount,0),
  withoutWbs:out.filter(p=>!p.metadata.wbsCount).map(p=>p.metadata.projectId),
  goldRows:packs.length,masterRows:masters.length,aliasRows:aliases.length}};
}
