from pathlib import Path
import re, sys

if len(sys.argv)!=2:
    raise SystemExit('usage: apply_live_hardening_guard.py <site-dir>')
site=Path(sys.argv[1])
root=site/'index.html'; food=site/'app'/'food'/'index.html'; money=site/'app'/'money'/'index.html'; brain=site/'brain'/'index.html'
for p in (root,food,money,brain):
    if not p.exists(): raise SystemExit(f'Hardening target missing: {p}')

def once(s, old, new, label):
    n=s.count(old)
    if n!=1: raise SystemExit(f'{label} anchor mismatch: {n}')
    return s.replace(old,new,1)

def assets(s,label):
    if '/4sapien-live-hardening.css' not in s:
        s=once(s,'</head>','<link rel="stylesheet" href="/4sapien-live-hardening.css">\n</head>',label+' head')
    if '/4sapien-live-hardening.js' not in s:
        s=once(s,'</body>','<script src="/4sapien-live-hardening.js"></script>\n</body>',label+' body')
    return s

# ROOT — truthful model-service state instead of a generic silent failure.
s=root.read_text()
old="if(!r.ok||!data||!data.answer){showEmbla(q,'Embla kunne ikke svare akkurat nå. Ingen data er gjettet eller erstattet.',false);return;}"
new="if(!r.ok||!data||!data.answer){var ec=String((data&&data.error_code)||(data&&data.state)||'');var msg=ec.indexOf('credit_balance_exhausted')>=0?'Embla er midlertidig utilgjengelig fordi modellkontoen mangler API-kreditt. Dine data er ikke endret, og ingenting er gjettet.':'Embla kunne ikke svare akkurat nå. Ingen data er gjettet eller erstattet.';showEmbla(q,msg,false);return;}"
s=once(s,old,new,'root Embla truth error')
old_fetch="var r=await fetch('https://ghvdzetmplqkdtfqiror.supabase.co/functions/v1/embla-core-preview',{method:'POST',headers:{apikey:'sb_publishable_H6TT_u7YO4DVlvQdCJ06mA_VEvgxsOE',Authorization:'Bearer '+token,'Content-Type':'application/json'},body:JSON.stringify({message:q,conversation_id:emblaConversation,world:cur})});"
new_fetch="var ctl=new AbortController(),tm=setTimeout(function(){ctl.abort();},55000);var r;try{r=await fetch('https://ghvdzetmplqkdtfqiror.supabase.co/functions/v1/embla-core-preview',{method:'POST',headers:{apikey:'sb_publishable_H6TT_u7YO4DVlvQdCJ06mA_VEvgxsOE',Authorization:'Bearer '+token,'Content-Type':'application/json'},body:JSON.stringify({message:q,conversation_id:emblaConversation,world:cur}),signal:ctl.signal});}finally{clearTimeout(tm);}"
s=once(s,old_fetch,new_fetch,'root Embla timeout')
s=once(s,"}catch(_e){showEmbla(q,'Embla kunne ikke nås akkurat nå. Prøv igjen.',false);}", "}catch(_e){var msg=_e&&_e.name==='AbortError'?'Embla brukte for lang tid og forespørselen ble avsluttet trygt. Prøv igjen.':'Embla kunne ikke nås akkurat nå. Prøv igjen.';showEmbla(q,msg,false);}", 'root Embla recovery')
s=assets(s,'root')
root.write_text(s)

# FOOD — preserve broad discovery, fix dark mode, identity/home, desktop width, CTA layout.
s=food.read_text()
s=once(s,'dark:{paper:"#000000",ink:"var(--paper)",blue:"#7A7AFF",red:"#FF6A47",green:"#3AE86F",grey:"#6B6B6B",soft:"#C7C2BA",faint:"#8C877F",line:"rgba(255,255,255,0.13)",line2:"rgba(255,255,255,0.22)",blueWash:"rgba(122,122,255,0.12)",redWash:"rgba(255,106,71,0.12)",fill:"#0B0B0B"}', 'dark:{paper:"var(--paper)",ink:"var(--ink)",blue:"var(--wc)",red:"#FF6A47",green:"#3AE86F",grey:"#6B6B6B",soft:"var(--soft)",faint:"var(--faint)",line:"var(--line)",line2:"var(--line2)",blueWash:"rgba(58,232,111,0.10)",redWash:"rgba(255,106,71,0.12)",fill:"var(--fill)"}', 'Food dark theme')
s=once(s,'function ProductRow({p,onOpen,onAdd,added,avoid}){', 'function knownStores(p){return [...new Set([...(p?.prices||[]).map(x=>x?.store),p?.priceStore].filter(Boolean).map(x=>String(x).trim()))]}function storeMatch(p,store){if(!store)return false;const q=String(store).toLocaleLowerCase("nb-NO");return knownStores(p).some(x=>x.toLocaleLowerCase("nb-NO").includes(q)||q.includes(x.toLocaleLowerCase("nb-NO")))}function ProductRow({p,onOpen,onAdd,added,avoid}){', 'Food store helper')
old='([p.brand,p.qty].filter(Boolean).join(" · ")||p.catLabel)'
new='(([p.brand,p.qty].filter(Boolean).join(" · ")||p.catLabel)+(knownStores(p).length?" · Kjent hos "+knownStores(p).join(" · "):""))'
s=once(s,old,new,'Food product availability')
s=once(s,'function SearchResults({initial,openProduct,onAdd,inList,avoid,blueOutline,chips}){','function SearchResults({initial,openProduct,onAdd,inList,avoid,blueOutline,chips,preferredStore}){','Food SearchResults props')
old='const sorted=useMemo(()=>{const band=(x)=>x.relevanceBand==="DIRECT"?2:x.relevanceBand==="RELATED"?1:0;const out=[...res];if(pri==="balanced"||pri==="wallet")return out.sort((a,b)=>(b.relevance??0)-(a.relevance??0));if(pri==="health")return out.sort((a,b)=>band(b)-band(a)||(b.healthScore??-1)-(a.healthScore??-1)||(b.relevance??0)-(a.relevance??0));return out.sort((a,b)=>band(b)-band(a)||(gs(b.eco)??-1)-(gs(a.eco)??-1)||(b.relevance??0)-(a.relevance??0));},[res,pri]);'
new='const sorted=useMemo(()=>{const band=(x)=>x.relevanceBand==="DIRECT"?2:x.relevanceBand==="RELATED"?1:0;const pref=(x)=>preferredStore&&storeMatch(x,preferredStore)?1:0;const out=[...res];if(pri==="balanced"||pri==="wallet")return out.sort((a,b)=>pref(b)-pref(a)||(b.relevance??0)-(a.relevance??0));if(pri==="health")return out.sort((a,b)=>pref(b)-pref(a)||band(b)-band(a)||(b.healthScore??-1)-(a.healthScore??-1)||(b.relevance??0)-(a.relevance??0));return out.sort((a,b)=>pref(b)-pref(a)||band(b)-band(a)||(gs(b.eco)??-1)-(gs(a.eco)??-1)||(b.relevance??0)-(a.relevance??0));},[res,pri,preferredStore]);'
s=once(s,old,new,'Food ranking preference')
s=once(s,'<SearchResults openProduct={openProduct} onAdd={addItem} inList={inList} avoid={avoid} blueOutline/>','<SearchResults openProduct={openProduct} onAdd={addItem} inList={inList} avoid={avoid} blueOutline preferredStore={store}/>','Food Handle preference')
s=once(s,'H2("Handleliste"+(store?" · "+store:""))','H2("Handleliste"+(store?" · foretrukket "+store:""))','Food handle semantics')
s=once(s,'<div style={{fontFamily:T.body,fontSize:11.5,color:T.faint}}>Pris ukjent i forhåndsvisning</div>','<div style={{fontFamily:T.body,fontSize:11.5,color:T.faint}}>{i.p&&knownStores(i.p).length?"Kjent hos "+knownStores(i.p).join(" · "):"Butikktilgjengelighet ukjent"}</div>','Food list availability')
s=once(s,'{sel.size>0&&<div style={{position:"fixed",left:0,right:0,bottom:60,display:"flex",justifyContent:"center",pointerEvents:"none"}}>','{sel.size>0&&<div className="fs-meal-cta" style={{position:"fixed",left:0,right:0,bottom:60,display:"flex",justifyContent:"center",pointerEvents:"none"}}>','Food meal CTA')
s=once(s,'<div style={{width:"100%",maxWidth:520,padding:"0 20px 10px",pointerEvents:"auto"}}>\n    <Btn kind="blue" full onClick={()=>addMany(planIng)}>','<div style={{width:"100%",maxWidth:900,padding:"0 20px 10px",pointerEvents:"auto"}}>\n    <Btn kind="blue" full onClick={()=>addMany(planIng)}>','Food meal CTA width')
old='const store=profile.store;const avoid=profile.avoid;const currentWeek=weekStartISO();'
new='const store=profile.store;const avoid=profile.avoid;const currentWeek=weekStartISO();const displayName=user?.user_metadata?.full_name||user?.user_metadata?.name||user?.email?.split("@")[0]||"4PLANET ID";const shortName=String(displayName).trim().split(/\\s+/)[0].slice(0,24);'
s=once(s,old,new,'Food identity vars')
old='return(<div style={{fontFamily:T.body,background:T.paper,color:T.ink,minHeight:"100vh",display:"flex",justifyContent:"center"}}>\n  <div style={{width:"100%",maxWidth:520,padding:"22px 20px 104px",animation:"fade .3s ease"}}>\n   <header style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:10,marginBottom:20}}><div><div style={{fontFamily:T.display,fontWeight:700,fontSize:23,letterSpacing:-.4,lineHeight:1}}>Ask Embla</div><div style={{fontFamily:T.mono,fontSize:10,letterSpacing:1,color:T.faint,marginTop:6}}>4SAPIEN by 4PLANET</div></div>'
new='return(<div style={{fontFamily:T.body,background:T.paper,color:T.ink,minHeight:"100vh",display:"flex",justifyContent:"center"}}>\n  <div className="fs-food-main" data-food-tab={tab} style={{width:"100%",maxWidth:1180,padding:"22px 20px 104px",animation:"fade .3s ease"}}>\n   <header style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:10,marginBottom:20}}><div><a className="fs-home-link" href="/" style={{fontFamily:T.display,fontWeight:700,fontSize:23,letterSpacing:-.4,lineHeight:1}}>4SAPIEN</a><div style={{fontFamily:T.mono,fontSize:10,letterSpacing:1,color:T.faint,marginTop:6}}>MAT · EMBLA · BY 4PLANET</div></div>'
s=once(s,old,new,'Food shell')
s=once(s,'{tab==="meg"?"LUKK":"4PLANET ID"}</span><span aria-hidden="true"','{tab==="meg"?"LUKK":shortName+" · ID"}</span><span aria-hidden="true"','Food visible identity')
s=once(s,'background:"rgba(255,255,255,0.94)"','background:T.paper','Food nav theme')
s=once(s,'<div style={{width:"100%",maxWidth:520,display:"flex"}}>{NAV.map','<div style={{width:"100%",maxWidth:1180,display:"flex"}}>{NAV.map','Food nav width')
s=assets(s,'food')
food.write_text(s)

# FINANCE — global home identity, desktop workspace. Canonical year/details are added by shared runtime JS.
s=money.read_text()
old='function App(){const[tab,setTab]=useState("now");const[accounts,setAccounts]=useState([]);const[events,setEvents]=useState([]);const[add,setAdd]=useState(null);const[cam,setCam]=useState(false);const[session,setSession]=useState(undefined);'
if old not in s: raise SystemExit('Finance App start missing')
old='return(<div style={{fontFamily:T.body,background:T.paper,color:T.ink,minHeight:"100vh",display:"flex",justifyContent:"center"}}>\n  <div style={{width:"100%",maxWidth:520,padding:"22px 20px 108px",animation:"fade .3s ease"}}>\n   <header style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:20}}>\n    <div><div style={{fontFamily:T.display,fontWeight:700,fontSize:23,letterSpacing:-.4,lineHeight:1}}>Embla<span style={{fontFamily:T.body,fontWeight:500,fontSize:15,color:T.soft,marginLeft:8}}>Finans</span></div><div style={{fontFamily:T.mono,fontSize:10,letterSpacing:1,color:T.faint,marginTop:6}}>4SAPIEN by 4PLANET</div></div>\n    <div style={{display:"flex",gap:7}}><button aria-label="Logg ut" onClick={()=>sb.auth.signOut()} style={{border:"1px solid "+T.line2,background:"transparent",borderRadius:10,padding:"8px 10px",fontFamily:T.body,fontSize:11,color:T.faint,cursor:"pointer"}}>Ut</button><Btn kind="blue" size={13.5} onClick={()=>setAdd({})}><Icon name="plus" size={16}/>Legg til</Btn></div></header>'
new='return(<div style={{fontFamily:T.body,background:T.paper,color:T.ink,minHeight:"100vh",display:"flex",justifyContent:"center"}}>\n  <div className="fs-money-main" data-money-tab={tab} style={{width:"100%",maxWidth:1180,padding:"22px 20px 108px",animation:"fade .3s ease"}}>\n   <header style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:20}}>\n    <div><a className="fs-home-link" href="/" style={{fontFamily:T.display,fontWeight:700,fontSize:23,letterSpacing:-.4,lineHeight:1}}>4SAPIEN</a><div style={{fontFamily:T.mono,fontSize:10,letterSpacing:1,color:T.faint,marginTop:6}}>PENGER · EMBLA · BY 4PLANET</div></div>\n    <div style={{display:"flex",gap:7,alignItems:"center"}}><span data-fs-identity style={{fontFamily:T.body,fontSize:11,fontWeight:600,color:T.ink,border:"1px solid "+T.line2,borderRadius:999,padding:"8px 10px"}}>4PLANET ID</span><button aria-label="Logg ut" onClick={()=>sb.auth.signOut()} style={{border:"1px solid "+T.line2,background:"transparent",borderRadius:10,padding:"8px 10px",fontFamily:T.body,fontSize:11,color:T.faint,cursor:"pointer"}}>Ut</button><Btn kind="blue" size={13.5} onClick={()=>setAdd({})}><Icon name="plus" size={16}/>Legg til</Btn></div></header>'
s=once(s,old,new,'Finance shell')
s=once(s,'<div style={{width:"100%",maxWidth:520,display:"flex"}}>{NAV.map','<div style={{width:"100%",maxWidth:1180,display:"flex"}}>{NAV.map','Finance nav width')
s=assets(s,'money')
money.write_text(s)
(site/'finance.html').write_text(s)
(site/'finance'/'index.html').write_text(s)

# BRAIN — make home identity explicit and preserve direct context even when model credit is unavailable.
s=brain.read_text()
if '/4sapien-design.css' not in s:
    s=once(s,'</head>','<link rel="stylesheet" href="/4sapien-design.css">\n<script src="/4sapien-theme.js"></script>\n</head>','Brain shared theme')
if '<body class="w-embla">' not in s:
    s=once(s,'<body>','<body class="w-embla">','Brain world class')
s=once(s,'<header class="top"><div class="brand">4SAPIEN<small>BRAIN · BY 4PLANET</small></div><a class="back" href="/">← 4SAPIEN</a></header>', '<header class="top"><a class="brand fs-home-link" href="/">4SAPIEN<small>BRAIN · BY 4PLANET</small></a><div style="display:flex;align-items:center;gap:10px"><span id="brainIdentity" class="fs-id-name">4PLANET ID</span><button id="brainTheme" class="fs-theme-btn" aria-label="Bytt tema" onclick="window.FourSapienTheme&&window.FourSapienTheme.toggle()">◐</button><a class="back" href="/">← Hjem</a></div></header>', 'Brain shell')
s=once(s,"async function init(){const r=await sb.auth.getSession();session=r.data.session;user=session?.user||null;if(!user){document.getElementById('authbox').hidden=false;return}document.getElementById('chooser').hidden=false;", "async function init(){const r=await sb.auth.getSession();session=r.data.session;user=session?.user||null;if(!user){document.getElementById('authbox').hidden=false;return}const bi=document.getElementById('brainIdentity');if(bi){const dn=user?.user_metadata?.full_name||user?.user_metadata?.name||user?.email?.split('@')[0]||'4PLANET ID';bi.textContent=String(dn).trim().split(/\\s+/)[0]+' · ID ✓';bi.title=user?.email||'4PLANET ID';}document.getElementById('chooser').hidden=false;", 'Brain identity')
s=once(s,"if(!r.ok)throw new Error(d?.state||d?.error_code||'REQUEST_FAILED');", "if(!r.ok)throw new Error(d?.error_code||d?.state||'REQUEST_FAILED');", 'Brain error detail')
old_api="async function api(payload){const s=(await sb.auth.getSession()).data.session;if(!s)throw new Error('UNAUTHENTICATED');const r=await fetch(FN,{method:'POST',headers:{apikey:SB_KEY,Authorization:'Bearer '+s.access_token,'Content-Type':'application/json'},body:JSON.stringify(payload)});const d=await r.json().catch(()=>null);if(!r.ok)throw new Error(d?.error_code||d?.state||'REQUEST_FAILED');return d}"
new_api="async function api(payload){const s=(await sb.auth.getSession()).data.session;if(!s)throw new Error('UNAUTHENTICATED');const ctl=new AbortController(),tm=setTimeout(()=>ctl.abort(),55000);let r;try{r=await fetch(FN,{method:'POST',headers:{apikey:SB_KEY,Authorization:'Bearer '+s.access_token,'Content-Type':'application/json'},body:JSON.stringify(payload),signal:ctl.signal})}catch(e){if(e?.name==='AbortError')throw new Error('REQUEST_TIMEOUT');throw e}finally{clearTimeout(tm)}const d=await r.json().catch(()=>null);if(!r.ok)throw new Error(d?.error_code||d?.state||'REQUEST_FAILED');return d}"
s=once(s,old_api,new_api,'Brain bounded API timeout')
s=once(s,"}catch(e){a.textContent='The Brain could not answer without guessing.';toast(String(e.message||e))}finally{b.disabled=false;b.textContent='Ask'}}", "}catch(e){const code=String(e?.message||e);a.textContent=code.includes('credit_balance_exhausted')?'Brain-konteksten er trygg, men AI-modellen mangler API-kreditt akkurat nå.':code==='REQUEST_TIMEOUT'?'Brain-forespørselen brukte for lang tid og ble avsluttet trygt.':'The Brain could not answer without guessing.';toast(code)}finally{b.disabled=false;b.textContent='Ask'}}", 'Brain ask recovery')
old="async function ingest(){const input=document.getElementById('contextInput');const text=input.value.trim();if(!text)return toast('Add some context first');const btn=document.getElementById('ingestBtn');btn.disabled=true;btn.textContent='Structuring…';try{const d=await api({action:'ingest',tenant_type:tenantType,company_id:companyId,text,source_label:document.getElementById('fileName').dataset.source||'Direct context'});input.value='';document.getElementById('fileName').dataset.source='';document.getElementById('fileName').textContent='TXT · MD · CSV · JSON';await loadData();openTab('brain');toast(`${d.count} Brain object${d.count===1?'':'s'} added`)}catch(e){toast(String(e.message||e))}finally{btn.disabled=false;btn.textContent='Structure into Brain'}}"
new="async function persistDirectContextFallback(text,label){if(tenantType!=='person')throw new Error('MODEL_REQUIRED_FOR_COMPANY_BRAIN');const row={user_id:user.id,memory_type:'durable_fact',content:text,value:{brain_profile:true,category:'document',title:label||'Direct context',surface:'brain',learning_mode:'confirmed',structure_state:'MODEL_PENDING'},state:'active',confirmation_state:'user_confirmed',confidence:1,provenance:{source:'brain_profile_direct_fallback',source_label:label||'Direct context',truth_state:'user_input',learning_mode:'confirmed',structure_state:'MODEL_PENDING'}};const r=await sb.from('four_sapien_embla_memories').insert(row);if(r.error)throw r.error;return{count:1,fallback:true}}async function ingest(){const input=document.getElementById('contextInput');const text=input.value.trim();if(!text)return toast('Add some context first');const btn=document.getElementById('ingestBtn');const label=document.getElementById('fileName').dataset.source||'Direct context';btn.disabled=true;btn.textContent='Structuring…';try{let d;try{d=await api({action:'ingest',tenant_type:tenantType,company_id:companyId,text,source_label:label})}catch(e){const code=String(e.message||e);if(code.includes('credit_balance_exhausted')||code.includes('MODEL_429'))d=await persistDirectContextFallback(text,label);else throw e}input.value='';document.getElementById('fileName').dataset.source='';document.getElementById('fileName').textContent='TXT · MD · CSV · JSON';await loadData();openTab('brain');toast(d.fallback?'Kontekst lagret. Strukturering venter på modelltilgang.':`${d.count} Brain object${d.count===1?'':'s'} added`)}catch(e){toast(String(e.message||e))}finally{btn.disabled=false;btn.textContent='Structure into Brain'}}"
s=once(s,old,new,'Brain direct fallback')
s=assets(s,'brain')
brain.write_text(s)

for p, markers in {
 root:['4sapien-live-hardening.js','credit_balance_exhausted','AbortController','55000'],
 food:['fs-food-main','knownStores','preferredStore','fs-meal-cta','MAT · EMBLA'],
 money:['fs-money-main','PENGER · EMBLA','4sapien-live-hardening.js'],
 brain:['persistDirectContextFallback','MODEL_PENDING','brainIdentity','brainTheme','/4sapien-theme.js','w-embla','REQUEST_TIMEOUT','AbortController'],
}.items():
    q=p.read_text()
    for m in markers:
        if m not in q: raise SystemExit(f'Hardening marker missing {m}: {p}')
print('4SAPIEN LIVE PRODUCT HARDENING 01 applied: root + Food + Finance + Brain')
