from pathlib import Path
import re
import sys

p = Path(sys.argv[1])
s = p.read_text()


def replace_once(old, new, label):
    global s
    if s.count(old) != 1:
        raise SystemExit(f"4SAPIEN product gateway anchor mismatch: {label}")
    s = s.replace(old, new, 1)


# Preserve gateway provenance, intent relevance and evidence-grounded health fields while
# keeping Claude's established product model.
old_nm_tail = ''' nova:p.nova_group??null,eco:eco&&/^[a-e]$/i.test(eco)?eco.toLowerCase():null,
 degState:hn?"source":"partial",planetState:eco&&/^[a-e]$/i.test(eco)?"context":"unknown"};}'''
new_nm_tail = ''' nova:p.nova_group??null,eco:eco&&/^[a-e]$/i.test(eco)?eco.toLowerCase():null,
 degState:hn?"source":"partial",planetState:eco&&/^[a-e]$/i.test(eco)?"context":"unknown",
 productSource:p.embla_source||"openfoodfacts",price:p.embla_price??null,priceStore:p.embla_store||"",prices:Array.isArray(p.embla_prices)?p.embla_prices:[],
 relevance:p.embla_relevance??0,relevanceBand:p.embla_relevance_band||"WEAK",match:p.embla_match||"",healthScore:p.embla_health_score??null,healthSignals:Array.isArray(p.embla_health_signals)?p.embla_health_signals:[],healthConfidence:p.embla_health_confidence||"UNKNOWN"};}'''
replace_once(old_nm_tail, new_nm_tail, "product provenance + intent mapping")


# Remove browser-to-provider calls. All external product traffic now goes through one authenticated Edge Function.
old_provider = '''async function gj(u,s){const r=await fetch(u,{signal:s});if(!r.ok)throw 0;return r.json();}
async function offSearch(q,s){const base=`https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(q)}&search_simple=1&action=process&json=1&page_size=24&fields=${F}`;
 const map=(d)=>(d.products||[]).filter((p)=>p.code&&(p.product_name||p.brands)).map(nm);
 let it=map(await gj(base+`&tagtype_0=countries&tag_contains_0=contains&tag_0=norway`,s));
 if(it.length<5){const seen=new Set(it.map((i)=>i.code));it=[...it,...map(await gj(base,s)).filter((i)=>!seen.has(i.code))];}return it;}
async function offBarcode(c,s){const d=await gj(`https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(c)}.json?fields=${F}`,s);if(d.status!==1||!d.product)return null;return nm({...d.product,code:c});}'''
new_provider = '''async function productGateway(term,s){
 const{data:{session}}=await SB.auth.getSession();if(!session?.access_token)throw Object.assign(new Error("AUTH_REQUIRED"),{code:"AUTH_REQUIRED"});
 const r=await fetch(`${SUPABASE_URL}/functions/v1/embla-products`,{method:"POST",headers:{apikey:SUPABASE_PUBLISHABLE_KEY,Authorization:`Bearer ${session.access_token}`,"Content-Type":"application/json"},body:JSON.stringify({q:term}),signal:s});
 const d=await r.json().catch(()=>({ok:false,state:"SOURCE_DOWN",products:[]}));
 if(!r.ok||!d.ok)throw Object.assign(new Error(d.state||"SOURCE_DOWN"),{code:d.state||"SOURCE_DOWN"});
 return{items:(d.products||[]).filter((x)=>x&&x.code).map(nm),state:d.state||"OK",cache:d.cache||"miss",ranking:d.ranking||"unknown",kassalappConfigured:!!d.kassalappConfigured};
}'''
replace_once(old_provider, new_provider, "provider gateway")


# Compact evidence signals in search results. These are source signals, not a universal
# good/bad verdict. Missing data stays visibly unknown.
old_product_row = '''function ProductRow({p,onOpen,onAdd,added,avoid}){const ex=avoid&&hasAvoid(p,avoid);return(
 <div style={{borderTop:"1px solid "+T.line,padding:"13px 2px",display:"flex",gap:12,alignItems:"center"}}>
  <button onClick={()=>onOpen(p)} style={{flex:1,minWidth:0,display:"flex",gap:12,alignItems:"center",background:"none",border:"none",textAlign:"left",cursor:"pointer",padding:0}}>
   <Thumb p={p}/><div style={{flex:1,minWidth:0}}><div style={{fontFamily:T.body,fontWeight:600,fontSize:15,color:T.ink,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.name}</div>
    <div style={{fontFamily:T.body,fontSize:12.5,color:T.faint,marginTop:2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{ex?<span style={{color:T.red,fontWeight:600}}>Inneholder {p.allergens.filter((a)=>avoid.includes(a)).map((a)=>AL[a]||tc(a)).join(", ")}</span>:([p.brand,p.qty].filter(Boolean).join(" · ")||p.catLabel)}</div></div></button>
  {onAdd&&<button aria-label="Legg i handleliste" onClick={()=>onAdd(p)} style={{width:36,height:36,borderRadius:10,border:"1px solid "+(added?T.blue:T.line2),background:added?T.blue:"transparent",color:added?T.paper:T.ink,cursor:"pointer",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center"}}><Icon name={added?"check":"plus"} size={16}/></button>}
 </div>);}'''
new_product_row = '''function HealthSignals({p}){const sig=(p.healthSignals||[]).slice(0,2);if(!sig.length)return <div style={{fontFamily:T.mono,fontSize:8.5,letterSpacing:.35,color:T.faint,marginTop:5}}>HELSEDATA UKJENT</div>;return <div style={{display:"flex",gap:5,flexWrap:"wrap",marginTop:5}}>{sig.map((x,i)=>{const warn=x.tone==="warning",pos=x.tone==="positive";return <span key={(x.kind||"s")+i} style={{fontFamily:T.mono,fontSize:8.5,letterSpacing:.25,padding:"2px 5px",borderRadius:5,border:"1px solid "+(warn?"rgba(255,77,34,.28)":pos?"rgba(46,46,255,.22)":T.line),background:warn?T.redWash:pos?T.blueWash:"transparent",color:warn?T.red:pos?T.blue:T.soft}}>{x.label}</span>;})}</div>;}
function ProductRow({p,onOpen,onAdd,added,avoid}){const ex=avoid&&hasAvoid(p,avoid);return(
 <div style={{borderTop:"1px solid "+T.line,padding:"13px 2px",display:"flex",gap:12,alignItems:"center"}}>
  <button onClick={()=>onOpen(p)} style={{flex:1,minWidth:0,display:"flex",gap:12,alignItems:"center",background:"none",border:"none",textAlign:"left",cursor:"pointer",padding:0}}>
   <Thumb p={p}/><div style={{flex:1,minWidth:0}}><div style={{fontFamily:T.body,fontWeight:600,fontSize:15,color:T.ink,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.name}</div>
    <div style={{fontFamily:T.body,fontSize:12.5,color:T.faint,marginTop:2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{ex?<span style={{color:T.red,fontWeight:600}}>Inneholder {p.allergens.filter((a)=>avoid.includes(a)).map((a)=>AL[a]||tc(a)).join(", ")}</span>:([p.brand,p.qty].filter(Boolean).join(" · ")||p.catLabel)}</div><HealthSignals p={p}/></div></button>
  {onAdd&&<button aria-label="Legg i handleliste" onClick={()=>onAdd(p)} style={{width:36,height:36,borderRadius:10,border:"1px solid "+(added?T.blue:T.line2),background:added?T.blue:"transparent",color:added?T.paper:T.ink,cursor:"pointer",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center"}}><Icon name={added?"check":"plus"} size={16}/></button>}
 </div>);}'''
replace_once(old_product_row, new_product_row, "health signal product rows")


# Search state: slower debounce, minimum 3 letters, one server gateway and explicit truth states.
old_state = ''' const[q,setQ]=useState(initial||"");const[st,setSt]=useState(initial?"loading":"idle");const[res,setRes]=useState([]);const[pri,setPri]=useState("balanced");const ab=useRef(null);'''
new_state = ''' const[q,setQ]=useState(initial||"");const[st,setSt]=useState(initial?"loading":"idle");const[res,setRes]=useState([]);const[pri,setPri]=useState("balanced");const[sourceState,setSourceState]=useState("OK");const ab=useRef(null);'''
replace_once(old_state, new_state, "search state")

old_run = ''' const run=useCallback(async(term)=>{term=(term??q).trim();if(!term)return;if(ab.current)ab.current.abort();const c=new AbortController();ab.current=c;const to=setTimeout(()=>c.abort(),9000);setSt("loading");
  try{let it;if(/^\\d{8,14}$/.test(term)){const o=await offBarcode(term,c.signal);it=o?[o]:[];}else it=await offSearch(term,c.signal);clearTimeout(to);setRes(it);setSt(it.length?"done":"empty");}catch(e){clearTimeout(to);if(e&&e.name!=="AbortError")setSt("error");}},[q]);'''
new_run = ''' const run=useCallback(async(term)=>{term=(term??q).trim();const isEan=/^\\d{8,14}$/.test(term);if(!term||(!isEan&&term.length<3))return;if(ab.current)ab.current.abort();const c=new AbortController();ab.current=c;const to=setTimeout(()=>c.abort(),12000);setSt("loading");setSourceState("OK");
  try{const out=await productGateway(term,c.signal);clearTimeout(to);setRes(out.items);setSourceState(out.state);setSt(out.items.length?"done":"empty");}catch(e){clearTimeout(to);if(e&&e.name!=="AbortError"){setSourceState(e.code||"SOURCE_DOWN");setSt("error");}}},[q]);'''
replace_once(old_run, new_run, "gateway search run")

old_debounce = ''' useEffect(()=>{const t=q.trim();if(t.length<2||/^\\d{8,14}$/.test(t))return;const id=setTimeout(()=>run(t),450);return()=>clearTimeout(id);},[q,run]);'''
new_debounce = ''' useEffect(()=>{const t=q.trim();if(t.length<3||/^\\d{8,14}$/.test(t))return;const id=setTimeout(()=>run(t),900);return()=>clearTimeout(id);},[q,run]);'''
replace_once(old_debounce, new_debounce, "search debounce")

# Never let a preference lens destroy query intent. Relevance band is the hard gate;
# health/planet only re-ranks genuinely comparable matches inside the same band.
old_sorted = ''' const sorted=useMemo(()=>{if(pri==="balanced"||pri==="wallet")return res;const d=pri==="planet"?"eco":"nutriscore";return[...res].sort((a,b)=>(gs(b[d])??-1)-(gs(a[d])??-1));},[res,pri]);'''
new_sorted = ''' const sorted=useMemo(()=>{const band=(x)=>x.relevanceBand==="DIRECT"?2:x.relevanceBand==="RELATED"?1:0;const out=[...res];if(pri==="balanced"||pri==="wallet")return out.sort((a,b)=>(b.relevance??0)-(a.relevance??0));if(pri==="health")return out.sort((a,b)=>band(b)-band(a)||(b.healthScore??-1)-(a.healthScore??-1)||(b.relevance??0)-(a.relevance??0));return out.sort((a,b)=>band(b)-band(a)||(gs(b.eco)??-1)-(gs(a.eco)??-1)||(b.relevance??0)-(a.relevance??0));},[res,pri]);'''
replace_once(old_sorted, new_sorted, "intent-safe lens ranking")

old_filters = '''  {st==="done"&&<div style={{display:"flex",gap:8,marginBottom:6,flexWrap:"wrap"}}>{[["balanced","Balansert"],["health","Helse"],["wallet","Lommebok"],["planet","Planet"]].map(([id,l])=><Chip key={id} active={pri===id} onClick={()=>setPri(id)}>{l}</Chip>)}</div>}'''
new_filters = '''  {st==="done"&&sourceState==="PARTIAL"&&<div style={{fontFamily:T.mono,fontSize:9.5,letterSpacing:.5,color:T.soft,background:T.blueWash,border:"1px solid "+T.line,borderRadius:9,padding:"8px 10px",marginBottom:9}}>DELVIS DATADEKNING · minst én kilde svarte, men ikke alle.</div>}
  {st==="done"&&<div style={{display:"flex",gap:8,marginBottom:6,flexWrap:"wrap"}}>{[["balanced","Balansert"],["health","Helse"],["wallet","Lommebok"],["planet","Planet"]].map(([id,l])=><Chip key={id} active={pri===id} onClick={()=>setPri(id)}>{l}</Chip>)}</div>}
  {st==="done"&&pri==="health"&&<div style={{fontFamily:T.body,fontSize:11.5,color:T.faint,lineHeight:1.45,marginBottom:7}}>Helse sorterer bare innenfor relevante varetreff. Nutri-Score og NOVA vises som separate kildesignaler — ikke som en absolutt dom.</div>}'''
replace_once(old_filters, new_filters, "partial source + health explanation")

old_error = '''  {st==="error"&&<div style={{border:"1px solid "+T.line2,borderRadius:14,padding:16,color:T.soft,fontFamily:T.body,fontSize:13.5,lineHeight:1.5}}><b style={{color:T.ink}}>Kilde utilgjengelig.</b> Open Food Facts svarte ikke — vises som «kilde utilgjengelig», aldri som tomt eller null.</div>}'''
new_error = '''  {st==="error"&&<div style={{border:"1px solid "+T.line2,borderRadius:14,padding:16,color:T.soft,fontFamily:T.body,fontSize:13.5,lineHeight:1.5}}><b style={{color:T.ink}}>{sourceState==="RATE_LIMITED"?"Datakildene er midlertidig begrenset.":sourceState==="AUTH_REQUIRED"?"Innloggingen må fornyes.":"En produktkilde svarer ikke akkurat nå."}</b> {sourceState==="RATE_LIMITED"?"Prøv igjen om litt.":sourceState==="AUTH_REQUIRED"?"Logg inn på nytt for å hente produktdata.":"Ingenting vises som null eller oppdiktet."}</div>}'''
replace_once(old_error, new_error, "truthful source errors")


# Wallet lens: show observed price only when a source actually supplied one.
old_wallet = '''  <Lens title="For lommeboken" state="unknown" note="Ekte butikkpris, enhetspris og prishistorikk kobles til fra Kassalapp i full versjon. Ukjent pris vises aldri som billig."><div style={{display:"flex",alignItems:"center",gap:8,color:T.soft,fontFamily:T.body,fontSize:13}}><Icon name="info" size={15} color={T.faint}/> Ingen prisobservasjon her ennå</div></Lens>'''
new_wallet = '''  <Lens title="For lommeboken" state={p.price!=null?"source":"unknown"} note={p.price!=null?"Prisobservasjon fra norsk dagligvarekilde. Pris kan variere mellom butikk, sted og tidspunkt.":"Ukjent pris vises aldri som billig."}>{p.price!=null?<div style={{display:"flex",alignItems:"baseline",gap:8,flexWrap:"wrap"}}><span style={{fontFamily:T.display,fontSize:20,fontWeight:700,color:T.ink}}>{Number(p.price).toFixed(2).replace(".",",")} kr</span>{p.priceStore&&<span style={{fontFamily:T.body,fontSize:12,color:T.soft}}>{p.priceStore}</span>}{p.prices?.length>1&&<span style={{fontFamily:T.mono,fontSize:9.5,color:T.faint}}>{p.prices.length} prisobservasjoner</span>}</div>:<div style={{display:"flex",alignItems:"center",gap:8,color:T.soft,fontFamily:T.body,fontSize:13}}><Icon name="info" size={15} color={T.faint}/> Ingen prisobservasjon her ennå</div>}</Lens>'''
replace_once(old_wallet, new_wallet, "wallet price source")


# Fail closed on the intended architecture.
for marker in [
    'functions/v1/embla-products',
    'RATE_LIMITED',
    'DELVIS DATADEKNING',
    'price:p.embla_price',
    'relevance:p.embla_relevance',
    'healthScore:p.embla_health_score',
    'NOVA vises som separate kildesignaler',
    'HELSEDATA UKJENT',
    'band(b)-band(a)',
    '900);return()=>clearTimeout(id)',
    'Ingenting vises som null eller oppdiktet.',
]:
    if marker not in s:
        raise SystemExit(f"4SAPIEN product gateway invariant missing: {marker}")

for forbidden in ['world.openfoodfacts.org', 'cgi/search.pl', 'offSearch(', 'offBarcode(']:
    if forbidden in s:
        raise SystemExit(f"4SAPIEN direct provider call remains in browser: {forbidden}")

p.write_text(s)
print("4SAPIEN product gateway guard applied")
