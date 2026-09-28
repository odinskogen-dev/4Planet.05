/* 4SAPIEN CSV 01 — offline parsing; authenticated, opt-in canonical Finance writes. */
(()=>{
"use strict";
const SUPABASE_URL="https://ghvdzetmplqkdtfqiror.supabase.co";
const KEY="sb_publishable_H6TT_u7YO4DVlvQdCJ06mA_VEvgxsOE";
const $=id=>document.getElementById(id);
const client=window.supabase?.createClient?.(SUPABASE_URL,KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
let user=null,file=null,sha=null,rows=[],selected=new Set(),busy=false;
const message=(msg,error=false)=>{const el=$("csvStatus");el.textContent=msg;el.setAttribute("role",error?"alert":"status");};
const result=(msg,error=false)=>{const el=$("csvResult");el.textContent=msg;el.setAttribute("role",error?"alert":"status");};
function money(n){return n==null?"UKJENT":Number(n).toLocaleString("nb-NO")+" kr";}
async function identity(){
 if(!client)throw new Error("SUPABASE_CLIENT_UNAVAILABLE");
 const session=await client.auth.getSession();if(session.error||!session.data?.session)throw new Error("UNAUTHENTICATED");
 const r=await client.auth.getUser();if(r.error||!r.data?.user)throw r.error||new Error("UNAUTHENTICATED");
 user=r.data.user;
 const n=user.user_metadata?.full_name||user.user_metadata?.name||user.email?.split("@")[0]||"4PLANET ID";
 $("csvIdentity").textContent=String(n).trim().split(/\s+/)[0].slice(0,24)+" · ID ✓";
}
async function hashFile(f){
 const digest=await crypto.subtle.digest("SHA-256",await f.arrayBuffer());
 return Array.from(new Uint8Array(digest),n=>n.toString(16).padStart(2,"0")).join("");
}
function updateButton(){
 const n=selected.size;
 $("csvConfirm").disabled=!n||busy;
 $("csvConfirm").textContent=n?"Bekreft og importer "+n+" valgte":"Bekreft og importer valgte";
}
function render(){
 const host=$("csvRows");host.textContent="";selected.clear();
 const good=rows.filter(r=>r.eligible).length;
 $("csvSummary").textContent=rows.length+" rader · "+good+" mulig å velge · "+
   (rows.length-good)+" krever manuell oppfølging. Ingen er forhåndsvalgt.";
 for(const r of rows){
  const tr=document.createElement("tr");tr.setAttribute("aria-disabled",r.eligible?"false":"true");
  const checkbox=document.createElement("input");checkbox.type="checkbox";checkbox.disabled=!r.eligible;
  checkbox.setAttribute("aria-label","Velg rad "+(r.row_index+1));
  checkbox.onchange=()=>{if(checkbox.checked)selected.add(r.row_index);else selected.delete(r.row_index);updateButton();};
  const td0=document.createElement("td");td0.appendChild(checkbox);
  const cells=[
    r.date||"UKJENT",r.name||"UKJENT",
    r.type==="income"?"Penger inn":r.type==="spend"?"Penger ut":"UKJENT",
    money(r.amount),
    r.eligible?"Krever ditt valg":r.warning||"UKJENT"
  ];
  tr.appendChild(td0);
  for(const v of cells){const td=document.createElement("td");td.textContent=v;tr.appendChild(td);}
  host.appendChild(tr);
 }
 $("csvReview").hidden=false;updateButton();
}
async function loaded(){
 $("csvReview").hidden=true;result("");rows=[];selected.clear();file=null;sha=null;
 const f=$("csvFile").files?.[0];if(!f)return;
 if(f.size===0||f.size>2000000){message("CSV må være mellom 1 byte og 2 MB. Filen er ikke importert.",true);return;}
 try{
  await identity();message("Leser CSV lokalt – ingen bankopplysninger sendes til AI.");
  const src=await f.text();
  const parsed=window.FourSapienCsv?.interpret(src);
  if(!parsed)throw new Error("CSV_PARSER_UNAVAILABLE");
  if(parsed.rows.length>1000)throw new Error("CSV_MORE_THAN_1000_ROWS");
  file=f;sha=await hashFile(f);rows=parsed.rows;
  render();message("CSV er lest lokalt. Kontroller beløp og dato og velg bare rader du kjenner igjen.");
 }catch(e){message("CSV kunne ikke klargjøres: "+String(e?.message||e).slice(0,160),true);}
}
async function imported(){
 if(busy||!file||!sha||!selected.size)return;
 const input=rows.filter(r=>selected.has(r.row_index));
 if(input.length>100){result("Maks 100 valgte rader per bekreftet batch. Velg færre.",true);return;}
 if(input.some(r=>!r.eligible)){result("Ugyldige eller ukjente rader kan ikke importeres.",true);return;}
 busy=true;updateButton();result("Kontrollerer og lagrer gjennom Finance…");
 try{
  await identity();
  const patch=input.map(r=>({
    row_index:r.row_index,type:r.type,name:r.name,
    amount:r.amount,date:r.date
  }));
  const r=await client.rpc("four_sapien_finance_confirm_csv_import",{
    p_sha256:sha,p_filename:file.name.slice(0,180),p_rows:patch
  });
  if(r.error||r.data?.state!=="REVIEWED")throw r.error||new Error("CSV_IMPORT_READBACK_MISSING");
  const saved=(r.data.results||[]).filter(x=>x.state==="SAVED");
  if(saved.length){
    const check=await client.from("four_sapien_finance_events").select("id")
      .contains("meta",{csv_import_sha256:sha})
      .neq("state","deleted").limit(1000);
    if(check.error)throw check.error;
    const ids=new Set((check.data||[]).map(x=>x.id));
    if(saved.some(x=>!ids.has(x.id)))throw new Error("CSV_EVENT_READBACK_MISSING");
  }
  result("Bekreftet: "+r.data.inserted+" hendelser lagret. "+r.data.duplicates+
    " allerede importert. "+r.data.review_required+
    " mulig eksisterende hendelser ble holdt utenfor – ingen dobbeltføring. Se Finance for retting.");
  selected.clear();
  for(const box of $("csvRows").querySelectorAll("input[type=checkbox]"))box.checked=false;
  updateButton();
  try{await client.from("four_sapien_embla_events").insert({
    user_id:user.id,event_type:"finance_csv_import_confirmed",world:"money",
    source:"4sapien-csv",payload:{inserted:r.data.inserted,duplicates:r.data.duplicates,review_required:r.data.review_required}
  });}catch(_){}
 }catch(e){result("Kunne ikke bekrefte alle hendelser. Kontroller Finance før du prøver igjen: "+
    String(e?.message||e).slice(0,160),true);}
 finally{busy=false;updateButton();}
}
function init(){
 $("csvTheme").onclick=()=>window.FourSapienTheme?.toggle?.();
 $("csvFile").onchange=loaded;$("csvConfirm").onclick=imported;
 identity().then(()=>message("Velg en lokal CSV-fil for å begynne."))
  .catch(()=>message("Logg inn på 4SAPIEN for å importere bankhendelser.",true));
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
})();
