/* 4SAPIEN local bank CSV parser: pure, review-only and no external requests. */
(function(root,factory){
 const value=factory();
 if(typeof module==="object"&&module.exports)module.exports=value;
 if(root)root.FourSapienCsv=value;
})(typeof window!=="undefined"?window:null,function(){
"use strict";
const normalize=s=>String(s??"").normalize("NFKC").toLowerCase().trim().replace(/\s+/g," ");
function delimiter(first){
  let comma=0,semi=0,quoted=false;
  for(let i=0;i<first.length;i++){const c=first[i];if(c==='"')quoted=!quoted;else if(!quoted&&c===",")comma++;else if(!quoted&&c===";")semi++;}
  return semi>=comma?";":",";
}
function parseDelimited(text){
 const str=String(text||"").replace(/^\uFEFF/,"");
 if(!str||str.length>2000000)throw new Error("CSV_SIZE_UNSUPPORTED");
 const sep=delimiter(str.split(/\r?\n/)[0]),out=[];let row=[],cell="",quoted=false;
 for(let i=0;i<str.length;i++){
   const c=str[i];
   if(c==='"'){if(quoted&&str[i+1]==='"'){cell+='"';i++;}else quoted=!quoted;continue;}
   if(!quoted&&c===sep){row.push(cell);cell="";continue;}
   if(!quoted&&(c==="\n"||c==="\r")){
     if(c==="\r"&&str[i+1]==="\n")i++;
     row.push(cell);cell="";
     if(row.some(x=>String(x).trim()))out.push(row);
     row=[];continue;
   }
   cell+=c;
 }
 if(quoted)throw new Error("CSV_UNTERMINATED_QUOTES");
 row.push(cell);if(row.some(x=>String(x).trim()))out.push(row);
 if(out.length<2)throw new Error("CSV_NO_DATA_ROWS");
 return out;
}
function amount(v){
 let s=String(v??"").trim().replace(/[\s\u00a0\u202f]/g,"").replace(/(?:nok|kr)$/i,"");
 if(!s)return null;
 const sign=s.startsWith("-")?-1:1;
 s=s.replace(/^[+-]/,"");
 if(!/^\d[\d,.]*$/.test(s))return null;
 const comma=s.lastIndexOf(","),dot=s.lastIndexOf("."),last=Math.max(comma,dot);
 let ore=0;
 if(last>=0&&/^\d{1,2}$/.test(s.slice(last+1))){ore=Number(s.slice(last+1).padEnd(2,"0"));s=s.slice(0,last);}
 const whole=s.replace(/[.,]/g,"");
 if(!/^\d+$/.test(whole)||!Number.isSafeInteger(Number(whole)))return null;
 const kr=Number(whole);
 if(!kr||kr>1000000000)return null;
 return {kr,sign,ore,wholeKroner:ore===0};
}
function date(value){
 const s=String(value||"").trim();
 let m=s.match(/^(\d{4})[-./](\d{1,2})[-./](\d{1,2})$/);
 let year,month,day;
 if(m){year=m[1];month=m[2];day=m[3];}
 else{m=s.match(/^(\d{1,2})[.\/-](\d{1,2})[.\/-](\d{4})$/);if(!m)return null;day=m[1];month=m[2];year=m[3];}
 const iso=year+"-"+month.padStart(2,"0")+"-"+day.padStart(2,"0");
 const d=new Date(iso+"T12:00:00Z");
 return Number.isFinite(d.getTime())&&d.toISOString().slice(0,10)===iso?iso:null;
}
function key(header,names){
 for(const name of names){const i=header.findIndex(h=>h===name||h.includes(name));if(i>=0)return i;}
 return -1;
}
function interpret(text){
 const table=parseDelimited(text);
 const header=table[0].map(normalize);
 const idx={
   date:key(header,["bokføringsdato","transaksjonsdato","betalingsdato","dato","date"]),
   name:key(header,["beskrivelse","transaksjonstekst","tekst","mottaker","avsender","description","merchant","butikknavn"]),
   amount:key(header,["beløp","belop","amount"]),
   out:key(header,["debet","debit","belastning","ut"]),
   incoming:key(header,["kredit","credit","inn"])
 };
 if(idx.date<0||idx.name<0||(idx.amount<0&&(idx.out<0||idx.incoming<0)))throw new Error("CSV_HEADERS_UNRECOGNISED");
 if(table.length>1001)throw new Error("CSV_MORE_THAN_1000_ROWS");
 const rows=[];
 for(let i=1;i<table.length;i++){
   const cols=table[i],get=j=>j<0?"":String(cols[j]??"").trim();
   const dateValue=date(get(idx.date)),name=get(idx.name).slice(0,180);
   let a=idx.amount>=0?amount(get(idx.amount)):null;
   if(idx.amount<0){
     const debit=amount(get(idx.out)),credit=amount(get(idx.incoming));
     a=debit&&credit?null:debit?{...debit,sign:-1}:credit?{...credit,sign:1}:null;
   }
   const risk=/\b(?:egen konto|egne konto|mellom egne|intern overføring|intern overforing)\b/i.test(name);
   rows.push({row_index:i-1,date:dateValue,name,
     type:a?(a.sign<0?"spend":"income"):null,
     amount:a?.kr??null,ore:a?.ore??null,
     eligible:!!dateValue&&!!name&&!!a?.wholeKroner&&!risk,
     warning:risk?"Mulig overføring mellom egne konti – ikke importer som inntekt/utgift":
       !dateValue?"Ugyldig eller ukjent dato":!name?"Mangler beskrivelse":
       !a?"Ukjent beløp":!a.wholeKroner?"Har øre. Finance støtter bare hele kroner.":""
   });
 }
 return {rows,headers:header,delimiter:delimiter(text.split(/\r?\n/)[0])};
}
return {parseDelimited,amount,date,interpret};
});
