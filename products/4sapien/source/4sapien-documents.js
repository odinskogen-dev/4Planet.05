/* 4SAPIEN DOCUMENT INTELLIGENCE 01 — deterministic local PDF reading, explicit user confirmation.
   Never sends original files to a model or third-party OCR; uploads only to existing private Supabase Storage.
   Canonical Finance Twin remains the sole calculation engine. */
(()=>{
"use strict";
const SUPABASE_URL="https://ghvdzetmplqkdtfqiror.supabase.co";
const KEY="sb_publishable_H6TT_u7YO4DVlvQdCJ06mA_VEvgxsOE";
const BUCKET="four-sapien-finance-docs";
const $=id=>document.getElementById(id);
const client=window.supabase?.createClient?.(SUPABASE_URL,KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
let account=null,selectedFile=null,sha=null,pendingBrain=null,pendingFile=null,previewUrl=null,busy=false,ocrBusy=false;
function status(message,isError=false){const el=$("docStatus");el.textContent=message;el.setAttribute("role",isError?"alert":"status");}
function freePreview(){if(previewUrl){window.URL.revokeObjectURL(previewUrl);previewUrl=null;}}
function short(v){return String(v||"").trim().split(/\s+/)[0].slice(0,24)}
function userName(u){return short(u?.user_metadata?.full_name||u?.user_metadata?.name||u?.email?.split("@")[0]||"4PLANET ID")}
function formatDate(v){if(!v)return "UKJENT";return new Date(v+"T12:00:00").toLocaleDateString("nb-NO")}
function formatNok(v){return Number.isFinite(Number(v))?Number(v).toLocaleString("nb-NO")+" kr":"UKJENT"}
function errText(e){return String(e?.message||e?.code||e||"Ukjent feil").slice(0,230)}
async function session(){
  if(!client)throw new Error("SUPABASE_CLIENT_UNAVAILABLE");
  const r=await client.auth.getSession();
  if(r.error)throw r.error;
  if(!r.data.session)throw new Error("UNAUTHENTICATED");
  return r.data.session;
}
async function identify(){
  await session();
  const r=await client.auth.getUser();
  if(r.error||!r.data?.user)throw r.error||new Error("AUTH_USER_UNAVAILABLE");
  account=r.data.user;
  $("docIdentity").textContent=userName(account)+" · ID ✓";
  $("docIdentity").title=account.email||"4PLANET ID";
}
async function recordEvent(type,meta){
  if(!account)return;
  try{await client.from("four_sapien_embla_events").insert({
    user_id:account.id,event_type:type,world:"money",source:"4sapien-document-intake",
    payload:meta||{}
  });}catch(_){}
}
async function readPdf(file){
  const mod=await import("https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/build/pdf.mjs");
  mod.GlobalWorkerOptions.workerSrc="https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/build/pdf.worker.min.mjs";
  const pdf=await mod.getDocument({data:new Uint8Array(await file.arrayBuffer())}).promise;
  try{
    let result="";
    const pages=Math.min(pdf.numPages,30);
    for(let n=1;n<=pages;n++){
      const page=await pdf.getPage(n);
      const content=await page.getTextContent();
      const line=content.items.map(x=>x.str||"").join(" ");
      result+=line+"\n";
      if(result.length>12000)break;
    }
    return result.slice(0,12000).trim();
  }finally{await pdf.destroy();}
}
async function fileHash(file){
  const bytes=await file.arrayBuffer();
  const digest=await crypto.subtle.digest("SHA-256",bytes);
  return Array.from(new Uint8Array(digest),n=>n.toString(16).padStart(2,"0")).join("");
}
function showSuggestions(text){
  const wrap=$("docSuggestions"),buttons=$("docSuggestionList"),items=$("docItemLines");
  wrap.hidden=true;buttons.textContent="";items.textContent="";
  const parsed=window.FourSapienDocumentAnalysis?.propose?.(text,$("docKind").value);
  if(!parsed||(!parsed.amount&&!parsed.date&&!parsed.name&&!parsed.itemLines.length))return;
  const choice=(label,value,field)=>{
    const b=document.createElement("button");b.type="button";b.className="doc-secondary";
    b.textContent=label+": "+String(value)+" · Bruk forslag";
    b.onclick=()=>{ $(field).value=String(value);b.textContent=label+" lagt i feltet · kontroller originalen";b.disabled=true; };
    buttons.appendChild(b);
  };
  if(parsed.amount){
    if(parsed.amount.wholeKroner)choice("Beløp",parsed.amount.kr+" kr","docAmount");
    else {const note=document.createElement("span");note.className="doc-note";note.textContent="Beløp med øre krever manuell kontroll; ingen avrunding er gjort.";buttons.appendChild(note);}
  }
  if(parsed.date)choice($("docKind").value==="bill"?"Forfall":"Dato",parsed.date.value,"docDate");
  if(parsed.name)choice("Avsender / butikk",parsed.name.value,"docName");
  if(parsed.itemLines.length){
    const title=document.createElement("strong");title.textContent="Mulige varelinjer · IKKE registrert i Food:";
    items.appendChild(title);
    const ul=document.createElement("ul");
    for(const line of parsed.itemLines){const li=document.createElement("li");li.textContent=line;ul.appendChild(li);}
    items.appendChild(ul);
  }
  wrap.hidden=false;
}
function loadOcrLib(){
  if(window.Tesseract?.createWorker)return Promise.resolve(window.Tesseract);
  return new Promise((resolve,reject)=>{
    const script=document.createElement("script");
    script.src="https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/dist/tesseract.min.js";
    script.referrerPolicy="no-referrer";
    script.onload=()=>window.Tesseract?.createWorker?resolve(window.Tesseract):reject(new Error("OCR_RUNTIME_UNAVAILABLE"));
    script.onerror=()=>reject(new Error("OCR_RUNTIME_UNAVAILABLE"));
    document.head.appendChild(script);
  });
}
async function runLocalOcr(){
  if(ocrBusy||!selectedFile||!selectedFile.type.startsWith("image/"))return;
  const file=selectedFile,button=$("docOcr");
  ocrBusy=true;button.disabled=true;button.textContent="Leser bildet lokalt…";
  let worker=null;
  try{
    status("Laster lokal OCR-motor. Ikke en AI-skyopplasting. Vent mens bildet leses på enheten.");
    const T=await loadOcrLib();
    worker=await T.createWorker("nor+eng",1);
    const output=await worker.recognize(file);
    if(selectedFile!==file)return;
    const text=String(output?.data?.text||"").slice(0,12000);
    $("docExtractWrap").hidden=false;$("docExtract").value=text;
    showSuggestions(text);
    status(text?"Bilde lest lokalt. OCR kan ta feil. Kontroller originalen og trykk på forslag du ønsker å bruke.":"OCR fant ingen tekst. Fyll inn dokumentopplysninger selv.");
  }catch(e){if(selectedFile===file)status("OCR kunne ikke fullføres på denne enheten. Fyll inn manuelt; dokumentet kan fortsatt lagres.",true)}
  finally{if(worker)await worker.terminate().catch(()=>{});ocrBusy=false;button.disabled=false;button.textContent="Les bildet lokalt (OCR) · valgfritt";}
}

async function fileChanged(){
  freePreview();selectedFile=null;sha=null;
  $("docExtractWrap").hidden=true;$("docExtract").value="";
  $("docSuggestions").hidden=true;$("docSuggestionList").textContent="";
  $("docOcrWrap").hidden=true;
  const f=$("docFile").files?.[0];
  const el=$("docPreview");el.textContent="";
  if(!f){el.textContent="Ingen dokument valgt";return;}
  const valid=["application/pdf","image/jpeg","image/png","image/webp"];
  if(!valid.includes(f.type)||f.size>10*1024*1024||f.size===0){
    $("docFile").value="";status("Ugyldig fil. Bruk PDF, JPEG, PNG eller WEBP på høyst 10 MB.",true);return;
  }
  selectedFile=f;status("");
  el.textContent=f.name+" · "+Math.ceil(f.size/1024)+" KB";
  if(f.type.startsWith("image/")){
    previewUrl=window.URL.createObjectURL(f);
    const img=document.createElement("img");img.src=previewUrl;img.alt="Forhåndsvisning av ditt dokument";
    img.className="doc-preview";el.appendChild(img);
    $("docOcrWrap").hidden=false;
    status("Bilde mottatt. Du kan prøve valgfri lokal OCR, eller fylle inn alle felt selv.");
    return;
  }
  $("docExtractWrap").hidden=false;
  status("Leser eventuell PDF-tekst lokalt. Ingen modell er nødvendig.");
  try{
    const text=await readPdf(f);
    if(selectedFile!==f)return;
    $("docExtract").value=text;
    showSuggestions(text);
    status(text?"PDF-tekst hentet lokalt. Kontroller originalen og alle feltene før lagring.":"PDF mangler uttrekkbar tekst. Fyll inn opplysningene manuelt.");
  }catch(e){
    if(selectedFile!==f)return;
    status("PDF kunne ikke tekstleses her. Dokumentet kan fortsatt lagres med feltene du bekrefter; ingen opplysninger er gjettet.");
  }
}
function docFields(){
  const file=selectedFile,kind=$("docKind").value;
  const name=$("docName").value.trim(),raw=$("docAmount").value,date=$("docDate").value;
  const amount=Number(raw),category=$("docCategory").value.trim();
  if(!file)throw new Error("Velg bilde eller PDF først.");
  if(!name||name.length>180)throw new Error("Oppgi hva dokumentet gjelder.");
  if(!Number.isSafeInteger(amount)||amount<1||amount>1000000000)
    throw new Error("Bekreft et beløp i hele kroner. Øre støttes ikke i denne Finance-versjonen.");
  if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||new Date(date+"T12:00:00").toISOString().slice(0,10)!==date)
    throw new Error("Oppgi gyldig forfallsdato eller kvitteringsdato.");
  if(!["bill","receipt"].includes(kind))throw new Error("Ukjent dokumenttype.");
  return {file,kind,name,amount,date,category};
}
async function duplicateFor(hash){
  const r=await client.from("four_sapien_finance_events").select("id,name,occurred_on,amount")
    .contains("meta",{document_sha256:hash}).neq("state","deleted").limit(1);
  if(r.error)throw r.error;
  return r.data?.[0]||null;
}
function safeName(n){
  const extension=n.toLowerCase().endsWith(".pdf")?".pdf":
    n.toLowerCase().endsWith(".png")?".png":
    n.toLowerCase().endsWith(".webp")?".webp":".jpg";
  return crypto.randomUUID()+extension;
}
async function brainFor(eventId,record,docPath){
  if(!account)throw new Error("UNAUTHENTICATED");
  const existing=await client.from("four_sapien_embla_memories").select("id")
    .contains("value",{finance_event_id:eventId}).eq("state","active").limit(1);
  if(existing.error)throw existing.error;
  if(existing.data?.length)return true;
  const label=record.kind==="bill"?"Regning":"Kvittering";
  const content=label+": "+record.name+" · "+formatNok(record.amount)+" · "+
    (record.kind==="bill"?"forfall ":"registrert dato ")+formatDate(record.date)+
    (record.kind==="bill"?" · ikke markert betalt.":".");
  const r=await client.from("four_sapien_embla_memories").insert({
    user_id:account.id,memory_type:"durable_fact",content,
    value:{brain_profile:true,category:"document",title:label+" · "+record.name,
      finance_event_id:eventId,surface:"finance_document",learning_mode:"confirmed"},
    state:"active",confirmation_state:"user_confirmed",confidence:1,
    provenance:{source:"4sapien_finance_document",source_label:record.file.name,
      document_path:docPath,finance_event_id:eventId,truth_state:"user_input",
      learning_mode:"confirmed"}
  }).select("id").single();
  if(r.error)throw r.error;
  await recordEvent("brain_context_added",{surface:"finance_document",structure_state:"USER_CONFIRMED"});
  return true;
}
function brainRetry(eventId,record,path){
  pendingBrain={eventId,record,path};
  const host=$("docBrainRetry");host.textContent="Finance er lagret. Brain kunne ikke oppdateres.";
  const button=document.createElement("button");button.className="doc-secondary";
  button.type="button";button.textContent="Prøv Brain-lagring igjen";
  button.onclick=async()=>{
    button.disabled=true;
    try{await brainFor(eventId,record,path);host.textContent="Bekreftet kontekst er lagret i Brain.";pendingBrain=null;}
    catch(e){host.firstChild.textContent="Brain er fortsatt utilgjengelig. Finance er bevart. ";button.disabled=false;}
  };
  host.appendChild(button);
}
async function confirm(e){
  e.preventDefault();if(busy)return;
  let record;
  try{record=docFields();}catch(ex){status(errText(ex),true);return;}
  busy=true;$("docSubmit").disabled=true;
  let uploadedPath=null,saved=false;
  try{
    await identify();
    status("Kontrollerer fil og mulige duplikater…");
    const hash=await fileHash(record.file);sha=hash;
    const duplicate=await duplicateFor(hash);
    if(duplicate){
      status("Samme dokument er allerede knyttet til «"+duplicate.name+"» ("+
        formatDate(duplicate.occurred_on)+"). Ingen ny økonomihendelse er opprettet.",true);
      return;
    }
    // Never upload before the user has reviewed and pressed Confirm.
    const path=account.id+"/"+hash+"/"+safeName(record.file.name);
    status("Lagrer originalen i privat dokumentlager…");
    const up=await client.storage.from(BUCKET).upload(path,record.file,{
      contentType:record.file.type,cacheControl:"0",upsert:false
    });
    if(up.error)throw up.error;
    uploadedPath=path;
    status("Oppretter brukerbekreftet Finance-hendelse…");
    const patch={
      p_doc_path:path,p_doc_sha256:hash,p_kind:record.kind,p_name:record.name,
      p_amount:record.amount,p_occurred_on:record.date,p_category:record.category||null,
      p_extracted_text:null
    };
    const r=await client.rpc("four_sapien_finance_confirm_document",patch);
    if(r.error)throw r.error;
    if(r.data?.state==="DUPLICATE"){
      await client.storage.from(BUCKET).remove([path]);
      uploadedPath=null;
      status("Dokumentet var allerede bekreftet. Ingen ny hendelse ble laget.",true);return;
    }
    if(r.data?.state!=="SAVED"||!r.data?.id)throw new Error("CONFIRMATION_READBACK_MISSING");
    saved=true;
    await recordEvent("finance_document_confirmed",{
      document_kind:record.kind,amount:record.amount,has_pdf_text:record.file.type==="application/pdf",
      finance_event_id:r.data.id
    });
    if($("docBrain").checked){
      try{
        await brainFor(r.data.id,record,path);
        status((record.kind==="bill"?"Regning registrert som kommende betaling. ":"Kvittering registrert som utgift. ")+
          "Original privat lagret; bekreftet kontekst er også i Brain.");
      }catch(err){
        status("Finance og originaldokumentet er lagret. Brain kunne ikke oppdateres; du kan prøve igjen.",true);
        brainRetry(r.data.id,record,path);
      }
    }else status("Finance og originaldokumentet er lagret. Brain ble ikke oppdatert etter ditt valg.");
    await refreshDocuments();
    $("docForm").reset();freePreview();selectedFile=null;sha=null;
    $("docExtractWrap").hidden=true;$("docExtract").value="";
    $("docSuggestions").hidden=true;$("docOcrWrap").hidden=true;
    $("docPreview").textContent="Ingen dokument valgt";
  }catch(error){
    await recordEvent("finance_document_failed",{stage:saved?"brain_or_refresh":"storage_or_confirmation",error_code:"DOCUMENT_OPERATION_FAILED"});
    // A network error after RPC could hide a successful commit: never delete the uploaded original.
    status("Kunne ikke bekrefte hele operasjonen: "+errText(error)+
      (uploadedPath&&!saved?" Originalen kan være lagret privat. Sjekk listen før du prøver igjen.":""),true);
    await refreshDocuments().catch(()=>{});
  }finally{busy=false;$("docSubmit").disabled=false;}
}
async function refreshDocuments(){
  const list=$("docList");
  const r=await client.from("four_sapien_finance_events")
    .select("id,name,amount,type,occurred_on,state,doc_path,meta")
    .not("doc_path","is",null).neq("state","deleted")
    .order("created_at",{ascending:false}).limit(60);
  if(r.error)throw r.error;
  list.textContent="";
  const rows=r.data||[];
  if(!rows.length){const li=document.createElement("li");li.className="doc-empty";li.textContent="Ingen bekreftede dokumenter ennå.";list.appendChild(li);return;}
  for(const doc of rows){
    const li=document.createElement("li"),details=document.createElement("div");
    const title=document.createElement("strong");title.className="doc-copy";title.textContent=doc.name;
    const meta=document.createElement("small");meta.textContent=
      (doc.meta?.document_kind==="bill"?"REGNING · IKKE MARKERT BETALT":"KVITTERING")+
      " · "+formatNok(doc.amount)+" · "+formatDate(doc.occurred_on);
    details.append(title,meta);
    const btn=document.createElement("button");btn.type="button";btn.textContent="Åpne original";
    btn.onclick=async()=>{
      btn.disabled=true;
      try{
        const result=await client.storage.from(BUCKET).createSignedUrl(doc.doc_path,60);
        if(result.error||!result.data?.signedUrl)throw result.error||new Error("PRIVATE_URL_FAILED");
        const a=document.createElement("a");a.href=result.data.signedUrl;
        a.target="_blank";a.rel="noopener noreferrer";
        document.body.appendChild(a);a.click();a.remove();
      }catch(err){status("Originalen kunne ikke åpnes: "+errText(err),true)}
      finally{btn.disabled=false}
    };
    li.append(details,btn);list.appendChild(li);
  }
}
function kindChanged(){
  $("docDateLabel").textContent=$("docKind").value==="bill"?"FORFALLSDATO":"KVITTERINGSDATO";
}
function init(){
  $("docTheme").onclick=()=>window.FourSapienTheme?.toggle?.();
  $("docKind").onchange=kindChanged;
  $("docFile").onchange=fileChanged;
  $("docOcr").onclick=runLocalOcr;
  $("docExtract").addEventListener("input",()=>showSuggestions($("docExtract").value));
  $("docKind").addEventListener("change",()=>showSuggestions($("docExtract").value));
  $("docForm").onsubmit=confirm;
  $("docForm").onreset=()=>setTimeout(()=>{
    freePreview();selectedFile=null;sha=null;
    $("docExtractWrap").hidden=true;$("docExtract").value="";
    $("docSuggestions").hidden=true;$("docOcrWrap").hidden=true;
    $("docPreview").textContent="Ingen dokument valgt";kindChanged();
  },0);
  kindChanged();
  identify().then(async()=>{await recordEvent("document_intake_opened",{surface:"money_docs"});await refreshDocuments()}).catch(e=>{
    status("Logg inn via 4SAPIEN for å bruke private dokumenter: "+errText(e),true);
    $("docList").textContent="Logg inn for å vise dine dokumenter.";
  });
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});
else init();
})();