/* 4SAPIEN DOCUMENT ANALYSIS 02 — pure, deterministic suggestions; NEVER silently book.
   Local OCR (optional) lives in 4sapien-documents.js. No original document is sent to an AI model.
   Node-compatible pure parser enables synthetic regression tests. */
(function(root,factory){
  const value=factory();
  if(typeof module==="object"&&module.exports)module.exports=value;
  if(root)root.FourSapienDocumentAnalysis=value;
})(typeof window!=="undefined"?window:null,function(){
"use strict";
const validDate=(s)=>{
  const m=String(s||"").match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if(!m)return null;
  const d=new Date(s+"T12:00:00Z");
  return Number.isFinite(d.getTime())&&d.toISOString().slice(0,10)===s?s:null;
};
function parseAmount(raw){
  let s=String(raw||"").trim().replace(/[\u00a0\u202f\s]/g,"");
  s=s.replace(/(?:kr|nok)$/i,"");
  if(!/^\d[\d.,]*$/.test(s))return null;
  const c=s.lastIndexOf(","),p=s.lastIndexOf(".");
  let whole=s,cents="";
  const last=Math.max(c,p);
  if(last>=0 && /^\d{2}$/.test(s.slice(last+1))){
    whole=s.slice(0,last);cents=s.slice(last+1);
  }else if(last>=0&&/^\d{1}$/.test(s.slice(last+1))){
    whole=s.slice(0,last);cents=s.slice(last+1)+"0";
  }
  if(!/^\d+$/.test(whole.replace(/[.,]/g,"")))return null;
  const n=Number(whole.replace(/[.,]/g,""));
  if(!Number.isSafeInteger(n)||n<1||n>1000000000)return null;
  return {kr:n,ore:cents?Number(cents):0,wholeKroner:!cents||Number(cents)===0};
}
function dateFrom(str){
  const s=String(str||"").trim();
  let m=s.match(/(\d{4})[-.\/](\d{1,2})[-.\/](\d{1,2})/);
  if(m)return validDate(m[1]+"-"+m[2].padStart(2,"0")+"-"+m[3].padStart(2,"0"));
  m=s.match(/(\d{1,2})[.\/\-](\d{1,2})[.\/\-](\d{4})/);
  if(m)return validDate(m[3]+"-"+m[2].padStart(2,"0")+"-"+m[1].padStart(2,"0"));
  return null;
}
function propose(raw,kind){
  const text=String(raw||"").slice(0,12000);
  const lines=text.split(/\r?\n/).map(s=>s.trim()).filter(Boolean);
  const out={amount:null,date:null,name:null,kid:null,account:null,claimStage:null,itemLines:[],warnings:[],source:"LOCAL_TEXT_ONLY"};
  const amountLine=/(?:^|\b)(?:beløp\s*(?:å\s*betale)?|å\s*betale|totalt?\s*å\s*betale|til\s*betaling|total(?:t|beløp)?|sum\s*å\s*betale|sum\s*inkl\.?\s*mva)\s*[:\-]?\s*(?:kr\.?|nok)?\s*([0-9][0-9 \u00a0.,]{0,22})\b/i;
  for(const line of lines){
    const m=line.match(amountLine);
    if(!m)continue;
    const a=parseAmount(m[1]);
    if(!a)continue;
    out.amount={...a,source:line.slice(0,140)};
    if(!a.wholeKroner)out.warnings.push("Beløp har øre. Finance støtter bare hele kroner; kontroller manuelt.");
    break;
  }
  const due=/(?:forfallsdato|forfall|betalingsfrist|due\s*date)\s*[:\-]?\s*(\d{1,4}[.\/\-]\d{1,2}[.\/\-]\d{1,4})/i;
  const receiptDate=/(?:kjøpsdato|handelsdato|dato|date)\s*[:\-]?\s*(\d{1,4}[.\/\-]\d{1,2}[.\/\-]\d{1,4})/i;
  const pattern=kind==="bill"?due:receiptDate;
  for(const line of lines){const m=line.match(pattern);if(m){const d=dateFrom(m[1]);if(d){out.date={value:d,source:line.slice(0,140)};break}}}
  const name=/(?:leverandør|utsteder|butikk|selger|fra)\s*[:\-]\s*(.{3,100})/i;
  for(const line of lines){const m=line.match(name);if(m){const v=m[1].trim();if(v&&!/^(?:kr|nok|\d)/i.test(v)){out.name={value:v.slice(0,180),source:line.slice(0,140)};break}}}
  // KID is a syntactic, unverified extraction, not a validated payment reference.
  const kidRe=/(?:kid(?:[-\s]?nr\.?)?|kundeid(?:entifikasjon)?)\s*[:\-]?\s*([0-9][0-9 \u00a0]{1,26}[0-9])/i;
  for(const line of lines){const m=line.match(kidRe);if(m){const v=m[1].replace(/[\s\u00a0]/g,"");if(/^\d{2,25}$/.test(v)){out.kid={value:v,source:line.slice(0,140)};break}}}
  // Norwegian account number is unverified; never use it to make a payment.
  const accRe=/(?:kontonr\.?|kontonummer|til\s*konto|account\s*no\.?)\s*[:\-]?\s*(\d{4}[ .\u00a0]?\d{2}[ .\u00a0]?\d{5})/i;
  for(const line of lines){const m=line.match(accRe);if(m){const v=m[1].replace(/[\s.\u00a0]/g,"");if(/^\d{11}$/.test(v)){out.account={value:v,source:line.slice(0,140)};break}}}
  // Document label only: keywords do not verify legal stage or any right.
  const stageRe=[["inkassovarsel",/inkassovarsel|varsel\s*om\s*inkasso/i],["betalingsoppfordring",/betalingsoppfordring|inkassokrav|inkassosak|inkassobyr\u00e5/i],["purring",/purring|betalingsp\u00e5minnelse|purregebyr/i],["faktura",/faktura|ordrebekreftelse/i]];
  for(const sp of stageRe){if(sp[1].test(text)){out.claimStage={value:sp[0],source:"tekst"};break}}
  for(const line of lines){
    if(out.itemLines.length>=15)break;
    if(/\b(?:kontonr|kid|iban|mva|sum|total|beløp|forfall|organisasjonsnr)\b/i.test(line))continue;
    if(/.{3,}\s+\d+[.,]\d{2}\s*(?:kr|nok)?\s*$/i.test(line))out.itemLines.push(line.slice(0,180));
  }
  return out;
}
return {parseAmount,dateFrom,propose};
});
