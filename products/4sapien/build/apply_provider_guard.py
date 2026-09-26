from pathlib import Path
import re
import sys

p = Path(sys.argv[1])
s = p.read_text()


def replace_once(old, new, label):
    global s
    if s.count(old) != 1:
        raise SystemExit(f"4SAPIEN patch anchor mismatch: {label}")
    s = s.replace(old, new, 1)


def regex_once(pattern, replacement, label):
    global s
    s2, count = re.subn(pattern, replacement, s, count=1, flags=re.S)
    if count != 1:
        raise SystemExit(f"4SAPIEN regex anchor mismatch: {label}")
    s = s2


# Auth return is product-local. Never rely on the Supabase Site URL fallback
# (4planet.org) for a login initiated from 4sapien.com.
replace_once(
    'options:{emailRedirectTo:window.location.origin}',
    'options:{emailRedirectTo:"https://4sapien.com/"}',
    "email confirmation return",
)
replace_once(
    'options:{redirectTo:window.location.origin}',
    'options:{redirectTo:"https://4sapien.com/"}',
    "Google OAuth return",
)


# Provider guard: only show Google when production Supabase reports it enabled.
old_head = '''function AuthScreen(){
 const[email,setEmail]=useState("");const[password,setPassword]=useState("");const[mode,setMode]=useState("signin");const[busy,setBusy]=useState(false);const[msg,setMsg]=useState("");'''
new_head = '''function AuthScreen(){
 const[email,setEmail]=useState("");const[password,setPassword]=useState("");const[mode,setMode]=useState("signin");const[busy,setBusy]=useState(false);const[msg,setMsg]=useState("");const[googleEnabled,setGoogleEnabled]=useState(false);
 useEffect(()=>{let live=true;fetch(`${SUPABASE_URL}/auth/v1/settings`,{headers:{apikey:SUPABASE_PUBLISHABLE_KEY}}).then(r=>r.ok?r.json():null).then(cfg=>{if(live)setGoogleEnabled(!!cfg?.external?.google);}).catch(()=>{});return()=>{live=false;};},[]);'''

old_ui = '''  <button onClick={google} disabled={busy} style={{width:"100%",border:"1px solid "+T.line2,background:T.paper,borderRadius:12,padding:"13px 16px",fontFamily:T.body,fontSize:14,fontWeight:600,cursor:"pointer",color:T.ink}}>Fortsett med Google</button>
  <div style={{display:"flex",alignItems:"center",gap:10,margin:"18px 0",color:T.faint,fontFamily:T.mono,fontSize:10}}><span style={{height:1,background:T.line,flex:1}}/><span>ELLER</span><span style={{height:1,background:T.line,flex:1}}/></div>'''
new_ui = '''  {googleEnabled&&<><button onClick={google} disabled={busy} style={{width:"100%",border:"1px solid "+T.line2,background:T.paper,borderRadius:12,padding:"13px 16px",fontFamily:T.body,fontSize:14,fontWeight:600,cursor:"pointer",color:T.ink}}>Fortsett med Google</button><div style={{display:"flex",alignItems:"center",gap:10,margin:"18px 0",color:T.faint,fontFamily:T.mono,fontSize:10}}><span style={{height:1,background:T.line,flex:1}}/><span>ELLER</span><span style={{height:1,background:T.line,flex:1}}/></div></>}'''
replace_once(old_head, new_head, "provider AuthScreen")
replace_once(old_ui, new_ui, "provider Google UI")


# Signed-in onboarding must look signed in, not anonymous.
new_onboarding = '''function Onboarding({onDone,user,saveState}){const[p,setP]=useState({household:"",diet:"Alt",avoid:[],store:"",budget:"",priority:"balanced"});const displayName=user?.user_metadata?.full_name||user?.user_metadata?.name||user?.email?.split("@")[0]||"4PLANET-bruker";const provider=user?.app_metadata?.provider==="google"?"Google":(user?.app_metadata?.provider||"4PLANET");return(
 <div style={{fontFamily:T.body,background:T.paper,color:T.ink,minHeight:"100vh",display:"flex",justifyContent:"center"}}>
  <div style={{width:"100%",maxWidth:520,padding:"30px 20px 40px",animation:"fade .3s ease"}}>
   <div style={{fontFamily:T.display,fontWeight:700,fontSize:24,letterSpacing:-.4}}>Ask Embla</div>
   <div style={{fontFamily:T.mono,fontSize:10,letterSpacing:1,color:T.faint,margin:"6px 0 18px"}}>4SAPIEN by 4PLANET</div>
   <div style={{border:"1px solid "+T.line,borderRadius:12,padding:"12px 14px",marginBottom:20,background:T.blueWash}}>
    <div style={{fontFamily:T.mono,fontSize:9.5,letterSpacing:.9,color:T.blue,marginBottom:5}}>4PLANET ID · INNLOGGET</div>
    <div style={{fontFamily:T.display,fontSize:15,fontWeight:650,color:T.ink}}>{displayName}</div>
    <div style={{fontFamily:T.body,fontSize:12,color:T.soft,wordBreak:"break-word",marginTop:2}}>{user?.email}</div>
    <div style={{fontFamily:T.mono,fontSize:9.5,letterSpacing:.6,color:T.faint,marginTop:5}}>{provider} · {saveState}</div>
   </div>
   <p style={{fontFamily:T.display,fontSize:20,fontWeight:500,lineHeight:1.32,color:T.ink,margin:"0 0 8px"}}>Fullfør 4SAPIEN-profilen din.</p>
   <p style={{fontFamily:T.body,fontSize:14,color:T.soft,margin:"0 0 22px",lineHeight:1.5}}>Du er allerede innlogget. Fortell litt om deg, så tilpasser Embla råd, eksklusjoner og forslag. Valgene lagres til din 4PLANET-konto og kan endres senere.</p>
   <ProfileFields p={p} setP={setP}/>
   <div style={{marginTop:22}}><Btn kind="blue" full onClick={()=>onDone(p)}>Lagre profil og fortsett</Btn></div>
   <button onClick={()=>onDone(p)} style={{display:"block",margin:"12px auto 0",background:"none",border:"none",color:T.faint,fontFamily:T.body,fontSize:13,cursor:"pointer"}}>Hopp over for nå</button>
  </div></div>);}'''
regex_once(r'function Onboarding\(\{onDone\}\).*?(?=\nfunction Meg\()', new_onboarding + "\n", "signed-in onboarding")


# Profile screen: explicit identity, provider, sync state and an unmistakable exit.
new_meg = '''function Meg({profile,setProfile,user,onLogout,saveState,onClose}){const displayName=user?.user_metadata?.full_name||user?.user_metadata?.name||user?.email?.split("@")[0]||"4PLANET-bruker";const provider=user?.app_metadata?.provider==="google"?"Google":(user?.app_metadata?.provider||"4PLANET");return(<div>
 <button onClick={onClose} aria-label="Lukk profil" style={{display:"inline-flex",alignItems:"center",gap:6,border:"none",background:"none",padding:"0 0 14px",fontFamily:T.body,fontSize:13.5,fontWeight:600,color:T.blue,cursor:"pointer"}}><Icon name="back" size={16}/>Tilbake</button>
 <p style={{fontFamily:T.body,fontSize:14,color:T.soft,margin:"0 0 18px",lineHeight:1.5}}>4SAPIEN-profilen din styrer hva Embla anbefaler og hva hun ekskluderer. Profilen er koblet til din 4PLANET-konto og følger deg mellom enheter.</p>
 <ProfileFields p={profile} setP={setProfile}/>
 <div style={{marginTop:20,border:"1px solid "+T.line,borderRadius:12,padding:14,fontFamily:T.body,fontSize:12.5,color:T.soft,lineHeight:1.5,background:T.blueWash}}>
  <div style={{fontFamily:T.mono,fontSize:10,letterSpacing:.8,color:T.blue,marginBottom:7}}>4PLANET ID · INNLOGGET</div>
  <div style={{fontFamily:T.display,fontSize:16,fontWeight:650,color:T.ink}}>{displayName}</div>
  <div style={{color:T.soft,wordBreak:"break-word",marginTop:2}}>{user?.email||"Innlogget"}</div>
  <div style={{fontFamily:T.mono,fontSize:9.5,letterSpacing:.6,color:T.faint,marginTop:6}}>{provider} · {saveState}</div>
  <button onClick={onLogout} style={{marginTop:12,border:"1px solid "+T.line2,background:T.paper,borderRadius:10,padding:"9px 12px",fontFamily:T.body,fontSize:13,fontWeight:600,cursor:"pointer",color:T.ink}}>Logg ut</button>
 </div>
</div>);}'''
regex_once(r'function Meg\(\{profile,setProfile,user,onLogout,saveState\}\).*?(?=\n/\* ---------- camera \(receipt\) ---------- \*/)', new_meg + "\n", "4PLANET ID profile card")


# Profile is the authority. Secondary list/shop failures must never demote a signed-in
# user into onboarding. Hydrate each secondary data surface independently.
hydration_pattern = r'useEffect\(\(\)=>\{if\(!user\)return;let cancelled=false;\(async\(\)=>\{setProfileReady\(false\);setSaveState\("SYNKRONISERER"\);hydrating\.current=true;try\{.*?\}\)\(\);return\(\)=>\{cancelled=true;\};\},\[user\?\.id\]\);'
new_hydration = '''useEffect(()=>{if(!user)return;let cancelled=false;(async()=>{setProfileReady(false);setSaveState("SYNKRONISERER");hydrating.current=true;try{const[p,l,sh]=await Promise.all([SB.from("four_sapien_profiles").select("*").eq("user_id",user.id).maybeSingle(),SB.from("four_sapien_list_items").select("*").eq("user_id",user.id).order("created_at"),SB.from("four_sapien_shops").select("*").eq("user_id",user.id).order("purchased_on",{ascending:false})]);if(cancelled)return;if(p.error)throw p.error;if(p.data){setProfile(rowToProfile(p.data));setHasProfile(true);}else{setProfile(emptyProfile());setHasProfile(false);}let partial=false;if(l.error){partial=true;cloudLog("LIST_HYDRATE_FAILED");setList([]);}else{setList((l.data||[]).map(r=>({id:r.id,name:r.name,p:r.product||null})));}if(sh.error){partial=true;cloudLog("SHOPS_HYDRATE_FAILED");setShops([]);}else{const mapped=[];for(const r of(sh.data||[])){let photo=null;try{photo=await receiptSignedUrl(r.receipt_path);}catch(e){partial=true;cloudLog("RECEIPT_URL_FAILED");}mapped.push({id:r.id,store:r.store,amount:r.amount,date:r.purchased_on,photo});}setShops(mapped);}setSaveState(partial?"DELVIS SYNK":"LAGRET");}catch(e){cloudLog("PROFILE_HYDRATE_FAILED");setSaveState("SYNC-FEIL");}finally{hydrating.current=false;setProfileReady(true);}})();return()=>{cancelled=true;};},[user?.id]);'''
regex_once(hydration_pattern, new_hydration, "profile-authority hydration")


# Pass authenticated identity into onboarding.
replace_once('if(!hasProfile)return <Onboarding onDone={completeOnboarding}/>;', 'if(!hasProfile)return <Onboarding onDone={completeOnboarding} user={user} saveState={saveState}/>;', "onboarding identity props")


# Persistent signed-in affordance. On the profile screen the pill also acts as a close/toggle.
old_header = '''   <header style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:20}}><div><div style={{fontFamily:T.display,fontWeight:700,fontSize:23,letterSpacing:-.4,lineHeight:1}}>Ask Embla</div><div style={{fontFamily:T.mono,fontSize:10,letterSpacing:1,color:T.faint,marginTop:6}}>4SAPIEN by 4PLANET</div></div>{store&&tab!=="okonomi"&&tab!=="meg"&&<span style={{fontFamily:T.mono,fontSize:11,color:T.blue,background:T.blueWash,padding:"5px 9px",borderRadius:8}}>{store}</span>}</header>'''
new_header = '''   <header style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:10,marginBottom:20}}><div><div style={{fontFamily:T.display,fontWeight:700,fontSize:23,letterSpacing:-.4,lineHeight:1}}>Ask Embla</div><div style={{fontFamily:T.mono,fontSize:10,letterSpacing:1,color:T.faint,marginTop:6}}>4SAPIEN by 4PLANET</div></div><div style={{display:"flex",alignItems:"center",justifyContent:"flex-end",gap:7,flexWrap:"wrap"}}>{store&&tab!=="okonomi"&&tab!=="meg"&&<span style={{fontFamily:T.mono,fontSize:10.5,color:T.blue,background:T.blueWash,padding:"5px 8px",borderRadius:8}}>{store}</span>}<button onClick={()=>setTab(tab==="meg"?"hjem":"meg")} aria-label={tab==="meg"?"Lukk profil":"4PLANET ID – innlogget"} title={tab==="meg"?"Tilbake til Hjem":(user?.email||"4PLANET ID")} style={{border:"1px solid "+T.line,background:T.paper,borderRadius:999,padding:"5px 8px",display:"flex",alignItems:"center",gap:5,cursor:"pointer",color:T.ink}}><span style={{fontFamily:T.mono,fontSize:8.5,letterSpacing:.45}}>{tab==="meg"?"LUKK":"4PLANET ID"}</span><span aria-hidden="true" style={{fontFamily:T.body,fontSize:10,color:saveState==="SYNC-FEIL"?T.red:T.blue}}>{tab==="meg"?"←":"✓"}</span></button></div></header>'''
replace_once(old_header, new_header, "persistent identity header")

# Pass explicit close action into the profile view.
replace_once('<Meg profile={profile} setProfile={persistProfile} user={user} saveState={saveState} onLogout={()=>SB.auth.signOut()}/>', '<Meg profile={profile} setProfile={persistProfile} user={user} saveState={saveState} onLogout={()=>SB.auth.signOut()} onClose={()=>setTab("hjem")}/>', "profile close action")


# Fail closed if intended authenticated-state invariants are absent.
for marker in [
    'https://4sapien.com/',
    'emailRedirectTo:"https://4sapien.com/"',
    'redirectTo:"https://4sapien.com/"',
    '4PLANET ID · INNLOGGET',
    'Fullfør 4SAPIEN-profilen din.',
    'user={user} saveState={saveState}',
    'LIST_HYDRATE_FAILED',
    'SHOPS_HYDRATE_FAILED',
    'aria-label={tab==="meg"?"Lukk profil":"4PLANET ID – innlogget"}',
    'aria-label="Lukk profil"',
    'onClose={()=>setTab("hjem")}',
]:
    if marker not in s:
        raise SystemExit(f"4SAPIEN authenticated-state invariant missing: {marker}")

if 'redirectTo:window.location.origin' in s or 'emailRedirectTo:window.location.origin' in s:
    raise SystemExit("4SAPIEN OAuth/email return still depends on window.location.origin")

p.write_text(s)
print("4SAPIEN provider + authenticated profile guard applied")
