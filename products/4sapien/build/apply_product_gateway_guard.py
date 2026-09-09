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


# Preserve gateway provenance and price fields while keeping Claude's established product model.
old_nm_tail = ''' nova:p.nova_group??null,eco:eco&&/^[a-e]$/i.test(eco)?eco.toLowerCase():null,
 degState:hn?"source":"partial",planetState:eco&&/^[a-e]$/i.test(eco)?"context":"unknown"};}'''
new_nm_tail = ''' nova:p.nova_group??null,eco:eco&&/^[a-e]$/i.test(eco)?eco.toLowerCase():null,
 degState:hn?"source":"partial",planetState:eco&&/^[a-e]$/i.test(eco)?"context":"unknown",
 productSource:p.embla_source||"openfoodfacts",price:p.embla_price??null,priceStore:p.embla_store||"",prices:Array.isArray(p.embla_prices)?p.embla_prices:[]};}'''
replace_once(old_nm_tail, new_nm_tail, "product provenance mapping")


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
 return{items:(d.products||[]).filter((x)=>x&&x.code).map(nm),state:d.state||"OK",cache:d.cache||"miss",kassalappConfigured:!!d.kassalappConfigured};
}'''
replace_once(old_provider, new_provider, "provider gateway")


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

old_filters = '''  {st==="done"&&<div style={{display:"flex",gap:8,marginBottom:6,flexWrap:"wrap"}}>{[["balanced","Balansert"],["health","Helse"],["wallet","Lommebok"],["planet","Planet"]].map(([id,l])=><Chip key={id} active={pri===id} onClick={()=>setPri(id)}>{l}</Chip>)}</div>}'''
new_filters = '''  {st==="done"&&sourceState==="PARTIAL"&&<div style={{fontFamily:T.mono,fontSize:9.5,letterSpacing:.5,color:T.soft,background:T.blueWash,border:"1px solid "+T.line,borderRadius:9,padding:"8px 10px",marginBottom:9}}>DELVIS DATADEKNING · minst én kilde svarte, men ikke alle.</div>}
  {st==="done"&&<div style={{display:"flex",gap:8,marginBottom:6,flexWrap:"wrap"}}>{[["balanced","Balansert"],["health","Helse"],["wallet","Lommebok"],["planet","Planet"]].map(([id,l])=><Chip key={id} active={pri===id} onClick={()=>setPri(id)}>{l}</Chip>)}</div>}'''
replace_once(old_filters, new_filters, "partial source banner")

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
