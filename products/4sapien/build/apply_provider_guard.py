from pathlib import Path
import sys

p = Path(sys.argv[1])
s = p.read_text()

old_head = '''function AuthScreen(){
 const[email,setEmail]=useState("");const[password,setPassword]=useState("");const[mode,setMode]=useState("signin");const[busy,setBusy]=useState(false);const[msg,setMsg]=useState("");'''
new_head = '''function AuthScreen(){
 const[email,setEmail]=useState("");const[password,setPassword]=useState("");const[mode,setMode]=useState("signin");const[busy,setBusy]=useState(false);const[msg,setMsg]=useState("");const[googleEnabled,setGoogleEnabled]=useState(false);
 useEffect(()=>{let live=true;fetch(`${SUPABASE_URL}/auth/v1/settings`,{headers:{apikey:SUPABASE_PUBLISHABLE_KEY}}).then(r=>r.ok?r.json():null).then(cfg=>{if(live)setGoogleEnabled(!!cfg?.external?.google);}).catch(()=>{});return()=>{live=false;};},[]);'''

old_ui = '''  <button onClick={google} disabled={busy} style={{width:"100%",border:"1px solid "+T.line2,background:T.paper,borderRadius:12,padding:"13px 16px",fontFamily:T.body,fontSize:14,fontWeight:600,cursor:"pointer",color:T.ink}}>Fortsett med Google</button>
  <div style={{display:"flex",alignItems:"center",gap:10,margin:"18px 0",color:T.faint,fontFamily:T.mono,fontSize:10}}><span style={{height:1,background:T.line,flex:1}}/><span>ELLER</span><span style={{height:1,background:T.line,flex:1}}/></div>'''
new_ui = '''  {googleEnabled&&<><button onClick={google} disabled={busy} style={{width:"100%",border:"1px solid "+T.line2,background:T.paper,borderRadius:12,padding:"13px 16px",fontFamily:T.body,fontSize:14,fontWeight:600,cursor:"pointer",color:T.ink}}>Fortsett med Google</button><div style={{display:"flex",alignItems:"center",gap:10,margin:"18px 0",color:T.faint,fontFamily:T.mono,fontSize:10}}><span style={{height:1,background:T.line,flex:1}}/><span>ELLER</span><span style={{height:1,background:T.line,flex:1}}/></div></>}'''

if s.count(old_head) != 1:
    raise SystemExit("Provider guard AuthScreen anchor mismatch")
if s.count(old_ui) != 1:
    raise SystemExit("Provider guard Google UI anchor mismatch")

s = s.replace(old_head, new_head, 1).replace(old_ui, new_ui, 1)
p.write_text(s)
print("4SAPIEN provider guard applied")
