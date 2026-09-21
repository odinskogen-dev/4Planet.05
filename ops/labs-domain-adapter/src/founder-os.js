
const SB_URL = "https://ghvdzetmplqkdtfqiror.supabase.co";
const SB_PUBLISHABLE = "sb_publishable_H6TT_u7YO4DVlvQdCJ06mA_VEvgxsOE";
const BASE = "/os";
const PRIVATE_FUNCTION = SB_URL + "/functions/v1/private-os-read";
const noStore = {
  "Cache-Control":"private, no-store, max-age=0",
  "X-Robots-Tag":"noindex, nofollow, noarchive",
  "X-Content-Type-Options":"nosniff",
  "Referrer-Policy":"no-referrer",
  "Permissions-Policy":"camera=(), microphone=(), geolocation=()"
};

const html = `<!doctype html><html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex,nofollow,noarchive">
<title>4PLANET_ OS · Founder Command</title>
<style>
:root{color-scheme:dark;--bg:#0a0e0a;--ink:#f7faf4;--muted:#a4b1a1;--line:#38443a;--acid:#c7ff3d;--warn:#ffce73;--card:#131a14}
*{box-sizing:border-box}html{background:var(--bg);color:var(--ink);font-family:Inter,"Helvetica Neue",Arial,sans-serif}body{margin:0;min-height:100vh}
button,input{font:inherit}button{cursor:pointer}a{color:inherit}a:hover{color:var(--acid)}
.shell{max-width:1540px;margin:auto;padding:22px clamp(18px,4vw,66px) 90px}
.top{display:flex;align-items:center;gap:16px;flex-wrap:wrap;border-bottom:1px solid var(--line);padding:15px 0 21px;justify-content:space-between}
.wordmark{font-size:20px;font-weight:900;letter-spacing:-.075em}.wordmark b{color:var(--acid)}
.tag,.small,.eyebrow{font:11px/1.5 ui-monospace,Menlo,monospace;letter-spacing:.11em;text-transform:uppercase;color:var(--muted)}
.tag{border:1px solid var(--line);padding:8px 11px}.topright{display:flex;gap:22px;align-items:center}
.title{font-size:clamp(42px,6vw,86px);line-height:.96;letter-spacing:-.075em;margin:30px 0 18px;font-weight:750}
.title em{font-style:normal;color:var(--acid)}.lede{font-size:clamp(15px,1.8vw,21px);color:var(--muted);line-height:1.55;max-width:820px}
.banner{padding:17px 21px;border:1px solid #654d24;background:#241d0b;color:#ffdea0;line-height:1.55;margin:31px 0}
.grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:1px;background:var(--line);border:1px solid var(--line);margin:32px 0}
.cell{min-height:130px;background:var(--card);padding:22px}.cell strong{display:block;font-size:clamp(20px,2.5vw,35px);margin-top:12px;word-break:break-word}
.actions{display:flex;gap:8px;flex-wrap:wrap;margin:32px 0}button,.pill{padding:12px 17px;background:transparent;border:1px solid var(--line);color:var(--ink);font-size:12px;letter-spacing:.07em;font-weight:700;text-transform:uppercase}
button:hover,.pill:hover,button.active{border-color:var(--acid);color:var(--acid)}button.primary{background:var(--acid);color:#101510;border-color:var(--acid)}button.primary:hover{background:#edffb7;color:#101510}
input{width:100%;padding:14px;background:#0a0e0a;color:#fff;border:1px solid var(--line);border-radius:0;margin:7px 0 14px}
label{font:12px ui-monospace,Menlo,monospace;letter-spacing:.06em;color:var(--muted)}.login{max-width:550px;border:1px solid var(--line);padding:clamp(24px,4vw,50px);margin-top:48px;background:var(--card)}
.login h2{font-size:34px;line-height:1.05;letter-spacing:-.06em}.note{font-size:13px;line-height:1.55;color:var(--muted)}
.half{display:grid;grid-template-columns:1fr 1fr;gap:20px}.panel{border:1px solid var(--line);padding:22px;margin-bottom:14px}
.panel h3{font-size:23px;letter-spacing:-.04em;margin:12px 0}.panel p{color:#bdc9b8;line-height:1.6;white-space:pre-wrap}
.log{border-left:2px solid var(--acid);padding:8px 18px;margin:12px 0}.log strong{display:block;margin-bottom:5px}.log p{font-size:13px;color:var(--muted);margin:3px 0}
.source{font:11px/1.6 ui-monospace,Menlo,monospace;color:var(--muted);word-wrap:break-word}.portfolio{width:100%;height:75vh;min-height:560px;border:1px solid var(--line);background:var(--card)}
.os-projects{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}.os-group{grid-column:1/-1;border-bottom:1px solid var(--line);padding:24px 2px 8px;font-size:16px;color:var(--acid);font-weight:700;letter-spacing:.08em}.os-project{border:1px solid var(--line);background:var(--card);padding:20px;min-width:0}.os-project h3{font-size:27px;margin:9px 0;letter-spacing:-.045em}.os-project p{color:var(--muted);line-height:1.5}.os-project summary{cursor:pointer;color:var(--acid);padding:10px 0}.os-project ol{padding-left:20px;line-height:1.6}.os-project li{margin:8px 0;border-bottom:1px solid var(--line);padding-bottom:8px}.os-project .source{padding:8px 0}.os-project .flag{color:var(--warn);font-size:11px;text-transform:uppercase;letter-spacing:.04em}.hide{display:none!important}footer{margin-top:80px;border-top:1px solid var(--line);padding-top:22px;color:var(--muted);font:11px ui-monospace,Menlo,monospace}
@media(max-width:740px){.os-projects{grid-template-columns:1fr}.grid{grid-template-columns:repeat(2,minmax(0,1fr))}.half{grid-template-columns:1fr}.title{margin-top:42px}.portfolio{height:64vh;min-height:440px}.topright{gap:12px}}
</style></head><body><div class="shell">
<header class="top"><div class="wordmark">4PLANET<b>_</b> <span class="tag">LABS / OS</span></div><div class="topright"><a href="/" class="small">LABS ↗</a><span class="small">PRIVATE · FOUNDER</span><button id="logout" class="hide">LOG OUT</button></div></header>
<section><div class="eyebrow">PRIVATE OPERATING SYSTEM · FOUNDER COMMAND</div><h1 class="title">LIVING<br><em>SYSTEMS.</em><br>OPERATIONS.</h1><p class="lede">One control view for project work, BRAIN evidence, proof and Founder decisions. BRAIN remains the authority. Unverified progress is never promoted.</p></section>
<section id="login" class="login"><div class="eyebrow">FOUNDER-ONLY ACCESS</div><h2>Sign in to your private OS.</h2><p class="note">Continue with the personal Google account already authorised for your 4PLANET OS. This is not the Google Cloud service account, and no separate OS password is required.</p><div class="actions"><button class="primary" id="google" type="button">CONTINUE WITH GOOGLE</button></div><details><summary class="small">OTHER SIGN-IN METHODS</summary><form id="sign-in"><label for="email">YOUR PERSONAL ACCOUNT EMAIL</label><input id="email" type="email" autocomplete="email" required><label for="password">PASSWORD</label><input id="password" type="password" autocomplete="current-password"><div class="actions"><button class="primary" type="submit">SIGN IN</button><button type="button" id="magic">EMAIL LOGIN LINK</button></div><p id="login-message" role="status" class="note">Use your own Google account, not the Google Cloud service-account email. Founder access is verified server-side.</p></form></details><p id="google-status" role="status" class="note">Your private project data is never included on this public sign-in page.</p></section>
<section id="workspace" class="hide">
<div class="banner" id="truth-banner">AUTHENTICATED BRAIN READ · SOURCE FRESHNESS AND LAST SUCCESSFUL AUTOMATIC SYNC ARE SHOWN BELOW. DRIVE SOURCE INVENTORY IS NOT EQUIVALENT TO VERIFIED PROJECT STATUS. HISTORIC LABS SNAPSHOT IS SEPARATE.</div>
<div class="grid"><div class="cell"><div class="small">FOUNDER ACCESS</div><strong id="access">VERIFYING</strong></div><div class="cell"><div class="small">BRAIN OBJECTS</div><strong id="object-count">UNKNOWN</strong></div><div class="cell"><div class="small">LAST SOURCE UPDATE</div><strong id="source-update">UNKNOWN</strong></div><div class="cell"><div class="small">AUTOMATED SYNC</div><strong id="sync">NOT VERIFIED</strong></div></div>
<div class="actions"><button id="tab-brain" class="active" type="button">CURRENT BRAIN</button><button id="tab-portfolio" type="button">PROJECTS + WBS + SOURCE LIBRARY</button><button id="refresh" type="button">RECHECK SOURCE</button><a href="https://github.com/odinskogen-dev/4Planet-OSv3/issues/6" class="pill" target="_blank" rel="noopener noreferrer">OS EXECUTION ↗</a></div>
<div id="brain"><div class="eyebrow">AUTHENTICATED SOURCE READ · NOT A SCHEDULED SYNCHRONIZATION</div><div class="panel"><h3>Operational information must have evidence.</h3><p id="summary">Loading verified 4PLANET-domain source objects.</p><div class="source" id="checked-at">CHECKED: UNKNOWN</div></div><div id="knowledge"></div></div>
<div id="portfolio" class="hide"><div class="panel"><h3>Alle prosjekter · BRAIN</h3><p>Felles prosjektmetode, WBS og kilder. Historisk registerstatus er IKKE dagens verifiserte fremdrift.</p><label for="project-search">SØK PROSJEKT, SJANGER ELLER WBS</label><input id="project-search" type="search" placeholder="SPECIES, 4SAPIEN, kapital …"><p id="project-count" class="small">KONTROLLERER KILDER</p></div><p id="portfolio-coverage" class="source">KONTROLLERER FULL KILDEDEKNING</p><div id="project-index" class="os-projects"></div><details class="panel"><summary>PROSJEKTER SOM MANGLER GOLD-KOBLING</summary><div id="project-gaps"></div></details><details class="panel"><summary>KILDEBIBLIOTEK · FILINVENTAR · IKKE PROSJEKTSTATUS</summary><div id="project-list"></div></details><details class="panel"><summary>OPEN HISTORICAL LABS SNAPSHOT · 21 AUG 2026</summary><p>Public-safe archived orientation, not today's Programme Control.</p><iframe class="portfolio" src="/" title="Historical public-safe LABS portfolio" loading="lazy"></iframe></details></div>
</section>
<footer>4PLANET_ · PRIVATE OS · SOURCE-BOUND · UNKNOWN ≠ VERIFIED · NO ODIN BRAIN DATA</footer></div>
<script>
(function(){
"use strict";
var url="https://ghvdzetmplqkdtfqiror.supabase.co", key="sb_publishable_H6TT_u7YO4DVlvQdCJ06mA_VEvgxsOE", token=null, refreshToken=null, expiresAt=0;
var el=function(id){return document.getElementById(id)};
var status=function(text){el("login-message").textContent=text};
function save(t,r,seconds){
 token=t;refreshToken=r||refreshToken;expiresAt=Date.now()+Math.max(0,Number(seconds||3600)-30)*1000;
 sessionStorage.setItem("fourplanet_os_session",JSON.stringify({token:token,refreshToken:refreshToken,expiresAt:expiresAt}));
}
function forget(){token=null;refreshToken=null;expiresAt=0;sessionStorage.removeItem("fourplanet_os_session");}
function text(x){return x==null||x===""?"UNKNOWN":String(x)}
function shortTime(x){if(!x)return"UNKNOWN";var d=new Date(x);return isNaN(d.getTime())?"UNKNOWN":d.toLocaleString("en-GB",{dateStyle:"medium",timeStyle:"short"})}
async function refresh(){
 if(!refreshToken)return false;
 var r=await fetch(url+"/auth/v1/token?grant_type=refresh_token",{method:"POST",headers:{"apikey":key,"Content-Type":"application/json"},body:JSON.stringify({refresh_token:refreshToken}),cache:"no-store"});
 if(!r.ok)return false;var j=await r.json();if(!j.access_token)return false;save(j.access_token,j.refresh_token,j.expires_in);return true;
}
async function read(){
 if(!token)throw Error("AUTH_REQUIRED");
 if(Date.now()>expiresAt&&!(await refresh()))throw Error("SESSION_EXPIRED");
 var r=await fetch("/os/api/brain",{headers:{"Authorization":"Bearer "+token},cache:"no-store"});
 if(r.status===401||r.status===403)throw Error(r.status===403?"FOUNDER_ACCESS_DENIED":"SESSION_EXPIRED");
 if(!r.ok)throw Error("SOURCE_UNAVAILABLE_"+r.status);
 return r.json();
}
function projectCard(x){
 var box=document.createElement("article");box.className="panel";
 var kicker=document.createElement("div");kicker.className="eyebrow";
 kicker.textContent=text(x.objectType)+" · "+(x.content?"SOURCE CONTENT":"INVENTORY ONLY");
 var h=document.createElement("h3");h.textContent=text(x.title);
 var p=document.createElement("p");
 p.textContent=x.content?String(x.content).slice(0,4500):"Current detail UNKNOWN — metadata only. Open original source for authoritative context.";
 var details=document.createElement("details");var summary=document.createElement("summary");
 summary.textContent=x.content&&String(x.content).length>4500?"READ REMAINING SOURCE CONTENT":"SOURCE PROVENANCE";
 details.appendChild(summary);
 if(x.content&&String(x.content).length>4500){var rest=document.createElement("p");rest.textContent=String(x.content).slice(4500);details.appendChild(rest)}
 var provenance=document.createElement("div");provenance.className="source";
 provenance.textContent="SOURCE UPDATED: "+shortTime(x.sourceModifiedAt)+" · FOLDER: "+text(x.folder)+" · SHA256: "+text(x.sourceHash);
 details.appendChild(provenance);
 if(x.uri&&(x.uri.startsWith("https://docs.google.com/")||x.uri.startsWith("https://drive.google.com/"))){
 var a=document.createElement("a");a.href=x.uri;a.target="_blank";a.rel="noopener noreferrer";
 a.textContent="OPEN ORIGINAL SOURCE ↗";details.appendChild(a);
 }
 box.append(kicker,h,p,details);return box;
}
var latestProjectSources=[];
function projectView(x){
 try{
  if(x.metadata?.projectionType!=="project"||!x.content)return null;
  var p=JSON.parse(x.content);
  return p.schema==="4PLANET_PROJECT_VIEW_01"&&p.id===x.metadata.projectId?p:null;
 }catch{return null}
}
function normalizedProjectCard(p){
 var article=document.createElement("article");article.className="os-project";
 var kicker=document.createElement("div");kicker.className="eyebrow";
 kicker.textContent=p.genre+" · "+p.kind.replaceAll("_"," ");
 var title=document.createElement("h3");title.textContent=p.name;
 var purpose=document.createElement("p");purpose.textContent=p.purpose||"Formål ikke dokumentert.";
 var flag=document.createElement("p");flag.className="flag";
 flag.textContent="NÅSTATUS IKKE AVSTEMT · "+p.wbsCount+" WBS-PAKKER"+(p.goldPackStatus?" · GOLD-CROSSWALK MANGLER":"");
 article.append(kicker,title,purpose,flag);
 var details=document.createElement("details"),summary=document.createElement("summary");
 summary.textContent="PROSJEKT, WBS OG KILDER";details.appendChild(summary);
 var outcome=document.createElement("p");outcome.textContent="RESULTAT: "+(p.outcome||"UKJENT");details.appendChild(outcome);
 var group=document.createElement("p");group.textContent="FORELDER: "+(p.parent||"UKJENT")+" · HISTORISK STATUS: "+(p.sourceReportedState||"UKJENT");
 details.appendChild(group);
 if(p.wbs?.length){
  var list=document.createElement("ol");
  p.wbs.forEach(function(w){
   var row=document.createElement("li"),strong=document.createElement("strong");
   strong.textContent=w.workPackage||w.deliverable||w.id;
   var body=document.createElement("div");body.textContent=w.completionCondition||"Ferdigkriterium ikke dokumentert.";
   var state=document.createElement("div");state.className="source";
   state.textContent="WBS "+w.id+" · KILDERAPPORTERT: "+(w.sourceReportedState||"UKJENT");
   row.append(strong,body,state);list.appendChild(row);
  });details.appendChild(list);
 }else{var empty=document.createElement("p");empty.textContent="EGEN WBS: IKKE REGISTRERT / HISTORISK UNDER ANNET PROSJEKT.";details.appendChild(empty)}
 if(p.atomicTasks?.length){
  var tasks=document.createElement("details"),head=document.createElement("summary");
  head.textContent="ATOMIC ARBEID · "+p.atomicTaskCount+" KILDEKOBLEDE OPPGAVER (SISTE 12 VISES)";
  tasks.appendChild(head);
  var list=document.createElement("ol");
  p.atomicTasks.forEach(function(t){
   var item=document.createElement("li"),strong=document.createElement("strong");
   strong.textContent=t.deliverable||t.id;
   var state=document.createElement("div");state.className="source";
   state.textContent=t.id+" · "+(t.sourceReportedLifecycle||"UKJENT")+" · "+(t.sourceReportedProgrammeStatus||"UKJENT");
   var next=document.createElement("div");next.textContent="NESTE KILDERAPPORTERTE GATE: "+(t.nextGate||"UKJENT");
   item.append(strong,state,next);list.appendChild(item);
  });tasks.appendChild(list);
  var atomic=document.createElement("a");atomic.href=p.source.atomic;atomic.rel="noopener noreferrer";
  atomic.target="_blank";atomic.textContent="ÅPNE ATOMIC TASKS ↗";tasks.appendChild(atomic);
  details.appendChild(tasks);
 }
 var source=document.createElement("a");source.href=p.source.gold;source.target="_blank";source.rel="noopener noreferrer";
 source.textContent=p.goldPackStatus?"ÅPNE EKSISTERENDE PROJECT HOME ↗":"ÅPNE GOLD PROJECT CONTRACT ↗";details.appendChild(source);
 var source2=document.createElement("a");source2.href=p.source.wbs;source2.target="_blank";source2.rel="noopener noreferrer";
 source2.textContent=" · ÅPNE UNIVERSAL WBS ↗";details.appendChild(source2);
 var stamp=document.createElement("p");stamp.className="source";
 stamp.textContent="KILDE SIST ENDRET: "+shortTime(p.source.modifiedAt)+" · Prosjektstatus krever gjeldende Programme Control.";
 details.appendChild(stamp);article.appendChild(details);return article;
}
function renderProjects(){
 var search=el("project-search").value.trim().toLocaleLowerCase();
 var normalized=latestProjectSources.map(projectView).filter(Boolean);
 var hits=normalized.filter(function(p){
 return !search||[p.name,p.sourceName,p.genre,p.parent,p.id,p.purpose,
  ...(p.aliases||[]),...(p.wbs||[]).map(w=>w.workPackage+" "+w.id),
  ...(p.atomicTasks||[]).map(t=>t.id+" "+t.deliverable)].some(v=>String(v||"").toLocaleLowerCase().includes(search));
 });
 var list=el("project-index");list.replaceChildren();
 var order=["4SAPIEN","4BRAND","OCE4N_","E4RTH_","S4PIENS_","4CULTURE_",
  "IMPACT / MARKET","ECONOMY / CAPITAL","4PLANET / SHARED","LABS / CREATIVE","CULTURE / PRODUCT"];
 var groups=[...new Set(hits.map(p=>p.genre))].sort((a,b)=>
  (order.indexOf(a)<0?999:order.indexOf(a))-(order.indexOf(b)<0?999:order.indexOf(b)));
 groups.forEach(function(genre){
  var heading=document.createElement("div");heading.className="os-group";
  var items=hits.filter(p=>p.genre===genre).sort((a,b)=>a.name.localeCompare(b.name,"nb"));
  heading.textContent=genre+" · "+items.length;list.appendChild(heading);
  items.forEach(p=>list.appendChild(normalizedProjectCard(p)));
 });
 if(!normalized.length){var note=document.createElement("p");note.textContent="STRUKTURERT PROSJEKTVISNING MANGLER I SISTE SYNK. Ingen historisk status er oppgradert til nåstatus.";list.appendChild(note)}
 el("project-count").textContent=hits.length+" / "+normalized.length+" PROSJEKTER · "+
 normalized.reduce((n,p)=>n+p.wbsCount,0)+" WBS-PAKKER · SISTE BEKREFTEDE KILDESYNK VISES OVER";
 var gaps=latestProjectSources.filter(x=>x.metadata?.projectionType==="registration_gap");
 var gapList=el("project-gaps");gapList.replaceChildren();
 gaps.forEach(function(x){
  try{
   var p=JSON.parse(x.content),card=document.createElement("article");card.className="panel";
   var h=document.createElement("h3");h.textContent=p.name;
   var info=document.createElement("p");info.textContent=p.sourceReportedStatus+" · "+p.nextAction;
   var source=document.createElement("a");source.href=p.source;source.target="_blank";source.rel="noopener noreferrer";
   source.textContent="ÅPNE EXISTING BRAIN CONTROL ↗";card.append(h,info,source);gapList.appendChild(card);
  }catch{}
 });
 el("project-count").textContent+=" · "+gaps.length+" ÅPNE REGISTRERINGSGAP";
 var others=latestProjectSources.filter(x=>!projectView(x)&&x.metadata?.projectionType!=="registration_gap");
 var library=el("project-list");library.replaceChildren();
 others.filter(x=>!search||[x.title,x.objectType,x.folder].some(v=>String(v||"").toLocaleLowerCase().includes(search)))
  .slice(0,100).forEach(x=>library.appendChild(projectCard(x)));
}
function sourceCard(x){
 var box=document.createElement("article");box.className="panel";
 var kicker=document.createElement("div");kicker.className="eyebrow";kicker.textContent=text(x.objectType)+" · "+text(x.reviewStatus);
 var h=document.createElement("h3");h.textContent=text(x.title);
 var p=document.createElement("p");p.textContent=text(x.content);
 var source=document.createElement("div");source.className="source";source.textContent="SOURCE: "+text(x.uri)+" · UPDATED: "+shortTime(x.updatedAt)+" · ID: "+text(x.id);
 box.append(kicker,h,p,source);return box;
}
async function boot(){
 el("summary").textContent="Checking the current BRAIN source.";
 try{
 var data=await read();
 if(data.authority!=="4PLANET_BRAIN_READ_ONLY")throw Error("AUTHORITY_NOT_VERIFIED");
 el("login").classList.add("hide");el("workspace").classList.remove("hide");el("logout").classList.remove("hide");
 el("access").textContent="FOUNDER";
 el("object-count").textContent=String(data.sourceCount||0);
 el("source-update").textContent=shortTime(data.lastSourceUpdate);
 el("sync").textContent=data.lastSuccessfulAutomatedSync?shortTime(data.lastSuccessfulAutomatedSync):"NOT VERIFIED";
 el("checked-at").textContent="CHECKED: "+shortTime(data.checkedAt)+" · "+text(data.source)+" · SOURCE REVISION: "+text(data.sourceRevision);
 el("truth-banner").textContent=data.lastSuccessfulAutomatedSync
 ? ("LAST SUCCESSFUL DRIVE SYNC "+shortTime(data.lastSuccessfulAutomatedSync)+" · "+text(data.syncStatus)+(data.lastError?" · PREVIOUS ERROR: "+data.lastError:"")+" · UNREAD SOURCES REMAIN UNKNOWN; HISTORICAL LABS SEPARATE.")
 : "GOOGLE DRIVE AUTOMATIC SYNC NOT YET VERIFIED. ALL HISTORICAL LABS STATUS IS STALE.";
 el("summary").textContent=data.portfolioHydrated?"Source-bound Drive BRAIN extraction available; authority remains in original files.":"Full Drive project/WBS hydration not verified. No project status is claimed current.";
 var hydrated=Array.isArray(data.projects)?data.projects:[];
 var hydratedIds=new Set(hydrated.map(function(x){return x.id}));
 var inventory=Array.isArray(data.sources)?data.sources.filter(function(x){return !hydratedIds.has(x.id)}):[];
 latestProjectSources=hydrated.concat(inventory);
 var audit=latestProjectSources.find(x=>x.metadata?.projectionType==="inventory_audit");
 var coverage=el("portfolio-coverage");
 try{
  var a=audit?JSON.parse(audit.content):null;
  coverage.textContent=a&&a.safeToCommit?
   ("DOKUMENTERT KILDEUNIVERS: "+a.organisationalFilesPresent+" ORGANISASJONSFILER · "+
    a.excludedPrivate+" PRIVATE UNNTAK · "+a.unexplainedOmissions+
    " UFORKLARTE MANGLER · HISTORISK KORPUSTELLING ÅPEN"):
   "SAMMENLIGNING MOT SOURCE INVENTORY IKKE VERIFISERT I SISTE LIVE SYNK.";
 }catch{coverage.textContent="KILDEDEKNING UKJENT – IKKE GODKJENT.";}
 renderProjects();
 var list=el("knowledge");list.replaceChildren();
 (data.knowledge||[]).forEach(function(row){list.appendChild(sourceCard(row))});
 if(!data.knowledge||!data.knowledge.length)el("summary").textContent="No authorised 4PLANET BRAIN objects are currently projected. UNKNOWN.";
 }catch(e){var reason=e instanceof Error?e.message:"SOURCE_UNAVAILABLE";el("summary").textContent="BRAIN READ FAILED · "+reason+" · Last shown data must be treated as STALE.";if(reason==="SESSION_EXPIRED"||reason==="AUTH_REQUIRED"||reason==="FOUNDER_ACCESS_DENIED"){forget();el("workspace").classList.add("hide");el("logout").classList.add("hide");el("login").classList.remove("hide");status(reason==="FOUNDER_ACCESS_DENIED"?"This account is not Founder-authorised.":"Your session is missing or expired. Sign in again.");}}
}
el("sign-in").addEventListener("submit",async function(event){
 event.preventDefault();status("Checking your Supabase account.");
 var email=el("email").value.trim();var password=el("password").value;
 if(!password){status("Enter your password, or use EMAIL LOGIN LINK.");return;}
 try{
 var r=await fetch(url+"/auth/v1/token?grant_type=password",{method:"POST",headers:{"apikey":key,"Content-Type":"application/json"},body:JSON.stringify({email:email,password:password}),cache:"no-store"});
 var j=await r.json();if(!r.ok||!j.access_token)throw Error("AUTH_NOT_ACCEPTED");
 save(j.access_token,j.refresh_token,j.expires_in);el("password").value="";await boot();
 }catch(e){status("Sign-in was not accepted. Confirm the correct account or request an email link.");}
});
el("google").addEventListener("click",function(){
 el("google-status").textContent="Opening secure Google sign-in. Select your existing personal 4PLANET account.";
 var redirect="https://labs.4planet.org/os";
 location.assign(url+"/auth/v1/authorize?provider=google&redirect_to="+encodeURIComponent(redirect));
});
el("magic").addEventListener("click",async function(){
 var email=el("email").value.trim();if(!email){status("Enter your verified account email first.");return;}
 status("Requesting your email login link.");
 try{
 var r=await fetch(url+"/auth/v1/otp?redirect_to="+encodeURIComponent("https://labs.4planet.org/os"),{method:"POST",headers:{"apikey":key,"Content-Type":"application/json"},body:JSON.stringify({email:email,create_user:false}),cache:"no-store"});
 status(r.ok?"If this account is eligible, check your email for a login link. The link must return to /os.":"Unable to send the login link. Sign in with your existing account password.");
 }catch{status("Login-link request failed.")}
});
el("project-search").addEventListener("input",renderProjects);
el("refresh").addEventListener("click",boot);
el("logout").addEventListener("click",function(){forget();el("workspace").classList.add("hide");el("logout").classList.add("hide");el("login").classList.remove("hide");status("Signed out.");});
el("tab-brain").addEventListener("click",function(){el("brain").classList.remove("hide");el("portfolio").classList.add("hide");el("tab-brain").classList.add("active");el("tab-portfolio").classList.remove("active")});
el("tab-portfolio").addEventListener("click",function(){el("brain").classList.add("hide");el("portfolio").classList.remove("hide");el("tab-brain").classList.remove("active");el("tab-portfolio").classList.add("active")});
try{
 var params=new URLSearchParams(location.hash.slice(1));
 if(params.has("error")){el("google-status").textContent="Google sign-in did not complete. "+String(params.get("error_description")||"Please try again.");history.replaceState(null,"",location.pathname);};
 if(params.has("access_token")){save(params.get("access_token"),params.get("refresh_token"),params.get("expires_in"));history.replaceState(null,"",location.pathname);};
 var saved=JSON.parse(sessionStorage.getItem("fourplanet_os_session")||"null");
 if(!token&&saved&&saved.token){token=saved.token;refreshToken=saved.refreshToken;expiresAt=saved.expiresAt||0;}
}catch{}
if(token)boot();
})();
</script></body></html>`;

export async function handlePrivateOS(request, incoming) {
  const path=incoming.pathname;
  if (path === BASE+"/_status") return Response.json({
    system:"4PLANET_LABS_OS",release:"PARTIAL",
    privateBrainEndpoint:true,founderBrowserLoginVerified:false,
    fullDrivePortfolioHydrated:false,automaticDriveSyncVerified:false
  },{headers:noStore});
  if (path===BASE+"/api/brain") {
    if(request.method!=="GET")return new Response("Method not allowed",{status:405,headers:noStore});
    const bearer=request.headers.get("Authorization")||"";
    if(!/^Bearer [a-zA-Z0-9._~-]+$/.test(bearer))
      return Response.json({error:"AUTH_REQUIRED"},{status:401,headers:noStore});
    try {
      const response=await fetch(PRIVATE_FUNCTION,{
        method:"GET",
        headers:{"Authorization":bearer,"apikey":SB_PUBLISHABLE},
        redirect:"manual"
      });
      const headers=new Headers(noStore);headers.set("Content-Type","application/json; charset=utf-8");
      if(![200,401,403,503].includes(response.status))return Response.json({error:"SOURCE_UNAVAILABLE"},{status:503,headers});
      return new Response(request.method==="HEAD"?null:response.body,{status:response.status,headers});
    }catch{return Response.json({error:"SOURCE_UNAVAILABLE"},{status:503,headers:noStore});}
  }
  if (request.method!=="GET" && request.method!=="HEAD")
    return new Response("Method not allowed",{status:405,headers:{...noStore,Allow:"GET, HEAD"}});
  if(path!==BASE && path!==BASE+"/")return new Response("Not found",{status:404,headers:noStore});
  const nonce=crypto.randomUUID().replaceAll("-","");
  const headers=new Headers(noStore);
  headers.set("Content-Type","text/html; charset=utf-8");
  headers.set("Content-Security-Policy","default-src 'none'; script-src 'nonce-"+nonce+"'; style-src 'nonce-"+nonce+"'; connect-src 'self' "+SB_URL+"; frame-src 'self'; img-src 'self' data:; base-uri 'none'; form-action 'self'; frame-ancestors 'none'");
  const safeHTML=html.replace("<style>","<style nonce=\""+nonce+"\">").replace("<script>","<script nonce=\""+nonce+"\">");
  return new Response(request.method==="HEAD"?null:safeHTML,{status:200,headers});
}
