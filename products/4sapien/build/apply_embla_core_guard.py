from pathlib import Path
import sys

p = Path(sys.argv[1])
s = p.read_text()

def replace_once(old, new, label):
    global s
    if s.count(old) != 1:
        raise SystemExit(f"4SAPIEN Embla Core anchor mismatch: {label} ({s.count(old)} matches)")
    s = s.replace(old, new, 1)

component = r'''
/* ---------- EMBLA HUMAN GOLD 02 · canonical Core seam ---------- */
async function emblaCoreRequest(message,conversationId){
 const{data:{session}}=await SB.auth.getSession();
 if(!session?.access_token)throw Object.assign(new Error("AUTH_REQUIRED"),{code:"AUTH_REQUIRED"});
 const run=async(cid)=>{
  const r=await fetch(`${SUPABASE_URL}/functions/v1/embla-core-preview`,{method:"POST",headers:{apikey:SUPABASE_PUBLISHABLE_KEY,Authorization:`Bearer ${session.access_token}`,"Content-Type":"application/json"},body:JSON.stringify({message,conversation_id:cid||null})});
  const d=await r.json().catch(()=>({ok:false,state:"RUNTIME_ERROR"}));
  return{r,d};
 };
 let out=await run(conversationId);
 if(out.r.status===404&&conversationId){sessionStorage.removeItem(`4sapien_embla_conversation_${session.user.id}`);out=await run(null);}
 if(!out.r.ok||!out.d?.ok)throw Object.assign(new Error(out.d?.state||`HTTP_${out.r.status}`),{code:out.d?.state||`HTTP_${out.r.status}`,detail:out.d});
 if(out.d.conversation_id)sessionStorage.setItem(`4sapien_embla_conversation_${session.user.id}`,out.d.conversation_id);
 return out.d;
}
function humanToolLabel(name){const m={calculate_liquidity:"Likviditet",calculate_budget:"Budsjett",read_accounts:"Kontoer",read_transactions:"Transaksjoner",read_obligations:"Forpliktelser",read_goals:"Mål",read_memory:"Minne",propose_memory_write:"Minne",read_food_preferences:"Matprofil",read_food_budget_context:"Matbudsjett",search_food_products:"Produktdata",search_4sapien_knowledge:"Kilder",get_user_context:"Profil"};return m[name]||null;}
function HumanGoldEmbla(){
 const[msg,setMsg]=useState("");const[busy,setBusy]=useState(false);const[err,setErr]=useState("");const[conversationId,setConversationId]=useState(null);const[messages,setMessages]=useState([]);const[memories,setMemories]=useState([]);const[permission,setPermission]=useState("denied");const[editing,setEditing]=useState(null);const[editText,setEditText]=useState("");const[lastTools,setLastTools]=useState([]);
 const loadMemory=useCallback(async()=>{const{data,error}=await SB.from("four_sapien_embla_memories").select("id,memory_type,content,state,confirmation_state,updated_at").in("state",["proposed","active"]).order("updated_at",{ascending:false}).limit(20);if(!error)setMemories(data||[]);},[]);
 const loadPermission=useCallback(async()=>{const{data}=await SB.from("four_sapien_permissions").select("state").eq("consumer_world","food").eq("provider_world","finance").eq("capability","read_budget_context").maybeSingle();setPermission(data?.state||"denied");},[]);
 const loadConversation=useCallback(async()=>{const{data:{session}}=await SB.auth.getSession();if(!session?.user?.id)return;const key=`4sapien_embla_conversation_${session.user.id}`;const cid=sessionStorage.getItem(key);if(!cid)return;const{data,error}=await SB.from("four_sapien_embla_messages").select("id,role,content,created_at").eq("conversation_id",cid).in("role",["user","assistant"]).order("created_at",{ascending:true}).limit(24);if(error){sessionStorage.removeItem(key);return;}setConversationId(cid);setMessages((data||[]).map(x=>({id:x.id,role:x.role,text:x.content})));},[]);
 useEffect(()=>{loadConversation();loadMemory();loadPermission();},[loadConversation,loadMemory,loadPermission]);
 const send=async(e)=>{e?.preventDefault?.();const q=msg.trim();if(!q||busy)return;setBusy(true);setErr("");setMsg("");setMessages(x=>[...x,{id:`u-${Date.now()}`,role:"user",text:q}]);try{const d=await emblaCoreRequest(q,conversationId);setConversationId(d.conversation_id||null);setMessages(x=>[...x,{id:d.message_id||`a-${Date.now()}`,role:"assistant",text:d.answer||"Jeg mangler nok grunnlag til å svare sikkert."}]);setLastTools((d.tools_used||[]).map(humanToolLabel).filter(Boolean));await loadMemory();await loadPermission();}catch(e){const code=e?.code||"RUNTIME_ERROR";setErr(code==="AUTH_REQUIRED"?"Innloggingen må fornyes.":code==="MODEL_UNCONFIGURED"?"Embla-modellen er ikke konfigurert i denne previewen.":"Embla fikk ikke fullført dette forsøket. Ingen ukjente data blir fylt inn.");}finally{setBusy(false);}};
 const confirmMemory=async(id)=>{const{error}=await SB.rpc("four_sapien_confirm_memory",{p_memory_id:id});if(error){setErr("Kunne ikke bekrefte minnet.");return;}await loadMemory();};
 const deleteMemory=async(id)=>{const{error}=await SB.rpc("four_sapien_delete_memory",{p_memory_id:id});if(error){setErr("Kunne ikke slette minnet.");return;}await loadMemory();};
 const startEdit=(m)=>{setEditing(m.id);setEditText(m.content||"");};
 const saveEdit=async(m)=>{const text=editText.trim();if(!text)return;const{error}=await SB.rpc("four_sapien_supersede_memory",{p_memory_id:m.id,p_memory_type:m.memory_type,p_content:text,p_value:{}});if(error){setErr("Kunne ikke endre minnet.");return;}setEditing(null);setEditText("");await loadMemory();};
 const setBudgetPermission=async(allow)=>{const{error}=await SB.rpc("four_sapien_set_permission",{p_consumer_world:"food",p_provider_world:"finance",p_capability:"read_budget_context",p_state:allow?"allowed":"revoked"});if(error){setErr("Kunne ikke endre delingstillatelsen.");return;}await loadPermission();};
 const visible=messages.slice(-8);
 return <section aria-label="Ask Embla" style={{border:"1px solid "+T.line2,borderRadius:16,padding:14,margin:"0 0 24px",background:T.blueWash}}>
  <div style={{display:"flex",alignItems:"baseline",justifyContent:"space-between",gap:10,marginBottom:8}}><div><div style={{fontFamily:T.display,fontSize:17,fontWeight:650,color:T.ink}}>Spør Embla</div><div style={{fontFamily:T.mono,fontSize:9,letterSpacing:.65,color:T.faint,marginTop:3}}>FACTS, NOT ADVICE</div></div>{conversationId&&<span style={{fontFamily:T.mono,fontSize:8.5,color:T.blue}}>SAMTALE AKTIV</span>}</div>
  {visible.length>0&&<div style={{display:"grid",gap:7,margin:"10px 0 12px"}}>{visible.map((m)=><div key={m.id} style={{justifySelf:m.role==="user"?"end":"start",maxWidth:"90%",padding:"9px 11px",borderRadius:12,background:m.role==="user"?T.blue:T.paper,color:m.role==="user"?T.paper:T.ink,border:m.role==="user"?"none":"1px solid "+T.line,fontFamily:T.body,fontSize:13.5,lineHeight:1.48,whiteSpace:"pre-wrap"}}>{m.text}</div>)}</div>}
  <form onSubmit={send} style={{display:"flex",gap:8}}><input value={msg} onChange={e=>setMsg(e.target.value)} disabled={busy} placeholder="Spør om mat, økonomi eller det Embla kjenner…" aria-label="Spør Embla" style={{flex:1,minWidth:0,border:"1px solid "+T.line2,borderRadius:11,padding:"11px 12px",fontFamily:T.body,fontSize:14,background:T.paper,color:T.ink,outline:"none"}}/><button disabled={busy||!msg.trim()} style={{border:0,borderRadius:11,padding:"0 13px",background:T.blue,color:T.paper,fontFamily:T.body,fontWeight:650,cursor:busy?"default":"pointer",opacity:(busy||!msg.trim())?0.55:1}}>{busy?"Henter…":"Send"}</button></form>
  {busy&&<div style={{fontFamily:T.body,fontSize:11.5,color:T.faint,marginTop:7}}>Embla henter bare data hun har tilgang til. Ukjent forblir ukjent.</div>}
  {err&&<div role="status" style={{fontFamily:T.body,fontSize:12,color:T.red,marginTop:8,lineHeight:1.45}}>{err}</div>}
  {lastTools.length>0&&<div style={{fontFamily:T.mono,fontSize:8.5,letterSpacing:.4,color:T.faint,marginTop:8}}>GRUNNLAG · {[...new Set(lastTools)].join(" · ")}</div>}
  <details style={{marginTop:12,borderTop:"1px solid "+T.line,paddingTop:10}}>
   <summary style={{cursor:"pointer",fontFamily:T.body,fontSize:12.5,fontWeight:650,color:T.ink}}>Minne og deling</summary>
   <div style={{marginTop:10}}>
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:10,padding:"9px 0",borderBottom:"1px solid "+T.line}}><div><div style={{fontFamily:T.body,fontSize:12.5,fontWeight:600,color:T.ink}}>Food kan lese matbudsjett</div><div style={{fontFamily:T.body,fontSize:11.5,color:T.faint,marginTop:2}}>Kun matbudsjett-kontekst. Ikke lønn, gjeld, beholdninger eller full transaksjonshistorikk.</div></div><button onClick={()=>setBudgetPermission(permission!=="allowed")} type="button" style={{border:"1px solid "+(permission==="allowed"?T.blue:T.line2),background:permission==="allowed"?T.blueWash:T.paper,color:permission==="allowed"?T.blue:T.ink,borderRadius:9,padding:"7px 9px",fontFamily:T.body,fontSize:11.5,fontWeight:650,cursor:"pointer",flexShrink:0}}>{permission==="allowed"?"Tillatt":"Tillat"}</button></div>
    {memories.length===0?<div style={{fontFamily:T.body,fontSize:11.5,color:T.faint,padding:"10px 0"}}>Ingen aktive eller foreslåtte minner ennå.</div>:memories.map(m=><div key={m.id} style={{padding:"9px 0",borderBottom:"1px solid "+T.line}}>{editing===m.id?<div style={{display:"flex",gap:6}}><input value={editText} onChange={e=>setEditText(e.target.value)} style={{flex:1,minWidth:0,border:"1px solid "+T.line2,borderRadius:8,padding:"7px 8px",fontFamily:T.body,fontSize:12,background:T.paper,color:T.ink}}/><button type="button" onClick={()=>saveEdit(m)} style={{border:0,borderRadius:8,background:T.blue,color:T.paper,padding:"7px 9px",fontFamily:T.body,fontSize:11,fontWeight:650}}>Lagre</button></div>:<><div style={{fontFamily:T.body,fontSize:12.5,color:T.ink,lineHeight:1.4}}>{m.content}</div><div style={{display:"flex",gap:9,alignItems:"center",marginTop:5,fontFamily:T.mono,fontSize:8.5,color:T.faint}}><span>{m.memory_type?.toUpperCase()}</span><span>{m.state==="proposed"?"FORESLÅTT":"AKTIVT"}</span>{m.state==="proposed"&&<button type="button" onClick={()=>confirmMemory(m.id)} style={{border:0,background:"none",padding:0,color:T.blue,fontFamily:T.body,fontSize:11,fontWeight:650,cursor:"pointer"}}>Godkjenn</button>}{m.state==="active"&&<button type="button" onClick={()=>startEdit(m)} style={{border:0,background:"none",padding:0,color:T.blue,fontFamily:T.body,fontSize:11,fontWeight:650,cursor:"pointer"}}>Endre</button>}<button type="button" onClick={()=>deleteMemory(m.id)} style={{border:0,background:"none",padding:0,color:T.faint,fontFamily:T.body,fontSize:11,cursor:"pointer"}}>Slett</button></div></>}</div>)}
   </div>
  </details>
 </section>;
}
'''

replace_once("function Home({go,openAbout,profile}){return(<div>", component + "\nfunction Home({go,openAbout,profile}){return(<div>", "insert Human Gold component")
needle = ' <p style={{fontFamily:T.body,fontSize:14.5,color:T.soft,margin:"0 0 20px",lineHeight:1.5,maxWidth:470}}>Embla gjør det arbeidet for deg, og viser deg kilden — så du kan stole på svaret.</p>'
replace_once(needle, needle + '\n <HumanGoldEmbla/>', "mount Embla Core on Home")

for marker in [
    'EMBLA HUMAN GOLD 02',
    'functions/v1/embla-core-preview',
    'four_sapien_confirm_memory',
    'four_sapien_delete_memory',
    'four_sapien_supersede_memory',
    'four_sapien_set_permission',
    'read_budget_context',
    'FACTS, NOT ADVICE',
    '<HumanGoldEmbla/>',
]:
    if marker not in s:
        raise SystemExit(f"4SAPIEN Human Gold invariant missing: {marker}")

if 'SUPABASE_SERVICE_ROLE_KEY' in s or 'sb_secret_' in s:
    raise SystemExit("4SAPIEN Human Gold frontend contains forbidden server credential marker")

p.write_text(s)
print("4SAPIEN Embla Human Gold Core guard applied")
