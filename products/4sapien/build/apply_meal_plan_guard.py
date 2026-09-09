from pathlib import Path
import re
import sys

p = Path(sys.argv[1])
s = p.read_text()


def replace_once(old, new, label):
    global s
    if s.count(old) != 1:
        raise SystemExit(f"4SAPIEN meal-plan anchor mismatch: {label}")
    s = s.replace(old, new, 1)


def regex_once(pattern, replacement, label):
    global s
    s2, count = re.subn(pattern, replacement, s, count=1, flags=re.S)
    if count != 1:
        raise SystemExit(f"4SAPIEN meal-plan regex mismatch: {label}")
    s = s2


# Stable Monday key for the current local week.
old_helper = '''async function receiptSignedUrl(path){if(!path)return null;const {data,error}=await SB.storage.from(FOUR_SAPIEN_RECEIPTS).createSignedUrl(path,3600);return error?null:data?.signedUrl||null;}'''
new_helper = old_helper + '''
function weekStartISO(){const d=new Date();const mondayOffset=(d.getDay()+6)%7;d.setHours(12,0,0,0);d.setDate(d.getDate()-mondayOffset);return d.toISOString().slice(0,10);}'''
replace_once(old_helper, new_helper, "week key helper")


# Meals becomes controlled by the App-level database-backed weekly plan.
new_meals = '''function Meals({addMany,budget,setBudget,selectedMeals,setSelectedMeals}){const[show,setShow]=useState(null);const sel=useMemo(()=>new Set(selectedMeals||[]),[selectedMeals]);
 const toggle=(i)=>{const key=MEALS[i].n;const n=new Set(sel);n.has(key)?n.delete(key):n.add(key);setSelectedMeals([...n]);};
 const planIng=useMemo(()=>{const seen=new Set(),out=[];[...sel].forEach((key)=>{const meal=MEALS.find((m)=>m.n===key);if(!meal)return;meal.ing.forEach((g)=>{const k=g.toLowerCase();if(!seen.has(k)){seen.add(k);out.push(g);}});});return out;},[selectedMeals]);
 return(<div style={{paddingBottom:sel.size>0?70:0}}>
  <p style={{fontFamily:T.body,fontSize:14,color:T.soft,margin:"0 0 14px",lineHeight:1.5}}>Velg middagene du vil lage, så samler Embla ingrediensene til én handleliste — uten dobbeltføring. Valgene lagres til 4SAPIEN-profilen din for denne uken.</p>
  <div style={{display:"flex",alignItems:"center",gap:10,border:"1px solid "+T.line2,borderRadius:12,padding:"10px 14px",marginBottom:16}}>
   <Icon name="wallet" size={16} color={T.soft}/><span style={{fontFamily:T.body,fontSize:13,color:T.soft}}>Ukebudsjett (valgfritt)</span>
   <input value={budget} onChange={(e)=>setBudget(e.target.value.replace(/[^0-9]/g,""))} inputMode="numeric" placeholder="0" style={{flex:1,textAlign:"right",border:"none",outline:"none",background:"transparent",fontFamily:T.body,fontSize:15,color:T.ink}}/><span style={{color:T.faint,fontFamily:T.body}}>kr</span></div>
  {MEALS.map((m,i)=>{const on=sel.has(m.n);return(<div key={i} style={{borderTop:"1px solid "+T.line,padding:"14px 0"}}>
   <div style={{display:"flex",gap:12,alignItems:"flex-start"}}>
    <button aria-label="Velg middag" onClick={()=>toggle(i)} style={{marginTop:2,width:24,height:24,borderRadius:7,border:"1.5px solid "+(on?T.blue:T.line2),background:on?T.blue:"transparent",color:T.paper,cursor:"pointer",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center"}}>{on&&<Icon name="check" size={14}/>}</button>
    <div style={{flex:1}}><div style={{fontFamily:T.display,fontSize:16,fontWeight:600,color:T.ink}}>{m.n}</div>
     <div style={{fontFamily:T.body,fontSize:13,color:T.soft,margin:"3px 0 8px"}}>{m.d}</div>
     <button onClick={()=>setShow(show===i?null:i)} style={{background:"none",border:"none",color:T.blue,fontFamily:T.body,fontSize:13,fontWeight:600,cursor:"pointer",padding:0}}>{show===i?"Skjul oppskrift":"Vis oppskrift"}</button>
     {show===i&&<div style={{marginTop:10}}>
      <div style={{fontFamily:T.mono,fontSize:10.5,letterSpacing:.4,color:T.faint,marginBottom:4}}>INGREDIENSER</div>
      <div style={{fontFamily:T.body,fontSize:13,color:T.soft,lineHeight:1.7,marginBottom:11}}>{m.ing.map((x)=>tc(x)).join(" · ")}</div>
      <div style={{fontFamily:T.mono,fontSize:10.5,letterSpacing:.4,color:T.faint,marginBottom:4}}>SLIK GJØR DU</div>
      <ol style={{margin:0,paddingLeft:18}}>{m.s.map((st,si)=><li key={si} style={{fontFamily:T.body,fontSize:13,color:T.soft,lineHeight:1.6,marginBottom:4}}>{st}</li>)}</ol></div>}</div></div></div>);})}
  {sel.size>0&&<div style={{position:"fixed",left:0,right:0,bottom:60,display:"flex",justifyContent:"center",pointerEvents:"none"}}>
   <div style={{width:"100%",maxWidth:520,padding:"0 20px 10px",pointerEvents:"auto"}}>
    <Btn kind="blue" full onClick={()=>addMany(planIng)}><Icon name="cart" size={16}/>Lag handleliste · {sel.size} middager · {planIng.length} varer</Btn>
    <div style={{textAlign:"center",fontFamily:T.body,fontSize:11,color:T.faint,marginTop:6}}>{budget?`Budsjett ${budget} kr. `:""}Kostnad og billigste/sunneste bytter aktiveres når Kassalapp-pris er koblet til.</div></div></div>}
 </div>);}'''
regex_once(r'function Meals\(\{addMany,budget,setBudget\}\).*?(?=\nfunction Economy\()', new_meals + "\n", "controlled weekly meals")


# App-level persistent plan state.
replace_once(
    'const[profile,setProfile]=useState(emptyProfile());const[tab,setTab]=useState("hjem");const[list,setList]=useState([]);const[shops,setShops]=useState([]);',
    'const[profile,setProfile]=useState(emptyProfile());const[tab,setTab]=useState("hjem");const[list,setList]=useState([]);const[shops,setShops]=useState([]);const[mealPlan,setMealPlan]=useState([]);',
    "meal plan state",
)
replace_once(
    'const store=profile.store;const avoid=profile.avoid;',
    'const store=profile.store;const avoid=profile.avoid;const currentWeek=weekStartISO();',
    "current week binding",
)
replace_once(
    'setProfile(emptyProfile());setList([]);setShops([]);',
    'setProfile(emptyProfile());setList([]);setShops([]);setMealPlan([]);',
    "logout meal reset",
)


# Meal-plan read is secondary: it may report partial sync, but can never demote profile identity.
old_queries = '''const[p,l,sh]=await Promise.all([SB.from("four_sapien_profiles").select("*").eq("user_id",user.id).maybeSingle(),SB.from("four_sapien_list_items").select("*").eq("user_id",user.id).order("created_at"),SB.from("four_sapien_shops").select("*").eq("user_id",user.id).order("purchased_on",{ascending:false})]);'''
new_queries = '''const[p,l,sh,mp]=await Promise.all([SB.from("four_sapien_profiles").select("*").eq("user_id",user.id).maybeSingle(),SB.from("four_sapien_list_items").select("*").eq("user_id",user.id).order("created_at"),SB.from("four_sapien_shops").select("*").eq("user_id",user.id).order("purchased_on",{ascending:false}),SB.from("four_sapien_meal_plans").select("meal_names").eq("user_id",user.id).eq("week_start",currentWeek).maybeSingle()]);'''
replace_once(old_queries, new_queries, "meal plan hydration query")

old_tail = '''if(sh.error){partial=true;cloudLog("SHOPS_HYDRATE_FAILED");setShops([]);}else{const mapped=[];for(const r of(sh.data||[])){let photo=null;try{photo=await receiptSignedUrl(r.receipt_path);}catch(e){partial=true;cloudLog("RECEIPT_URL_FAILED");}mapped.push({id:r.id,store:r.store,amount:r.amount,date:r.purchased_on,photo});}setShops(mapped);}setSaveState(partial?"DELVIS SYNK":"LAGRET");'''
new_tail = '''if(sh.error){partial=true;cloudLog("SHOPS_HYDRATE_FAILED");setShops([]);}else{const mapped=[];for(const r of(sh.data||[])){let photo=null;try{photo=await receiptSignedUrl(r.receipt_path);}catch(e){partial=true;cloudLog("RECEIPT_URL_FAILED");}mapped.push({id:r.id,store:r.store,amount:r.amount,date:r.purchased_on,photo});}setShops(mapped);}if(mp.error){partial=true;cloudLog("MEAL_PLAN_HYDRATE_FAILED");setMealPlan([]);}else{setMealPlan(Array.isArray(mp.data?.meal_names)?mp.data.meal_names:[]);}setSaveState(partial?"DELVIS SYNK":"LAGRET");'''
replace_once(old_tail, new_tail, "meal plan hydration result")


# Save plan immediately under the same auth user and weekly key.
old_setters = '''const setStore=(v)=>persistProfile({...profile,store:v});const setBudget=(b)=>persistProfile({...profile,budget:b});'''
new_setters = '''const setStore=(v)=>persistProfile({...profile,store:v});const setBudget=(b)=>persistProfile({...profile,budget:b});
 const persistMealPlan=useCallback(async(next)=>{setMealPlan(next);if(!user)return;setSaveState("LAGRER");const{error}=await SB.from("four_sapien_meal_plans").upsert({user_id:user.id,week_start:currentWeek,meal_names:next,updated_at:new Date().toISOString()},{onConflict:"user_id,week_start"});setSaveState(error?"SYNC-FEIL":"LAGRET");if(error)cloudLog("MEAL_PLAN_SAVE_FAILED");},[user?.id,currentWeek]);'''
replace_once(old_setters, new_setters, "meal plan save")


replace_once(
    '<Meals addMany={addMany} budget={profile.budget} setBudget={setBudget}/>',
    '<Meals addMany={addMany} budget={profile.budget} setBudget={setBudget} selectedMeals={mealPlan} setSelectedMeals={persistMealPlan}/>',
    "meal plan component binding",
)

for marker in [
    'four_sapien_meal_plans',
    'MEAL_PLAN_HYDRATE_FAILED',
    'MEAL_PLAN_SAVE_FAILED',
    'Valgene lagres til 4SAPIEN-profilen din for denne uken.',
    'selectedMeals={mealPlan}',
]:
    if marker not in s:
        raise SystemExit(f"4SAPIEN meal-plan invariant missing: {marker}")

p.write_text(s)
print("4SAPIEN weekly meal-plan persistence guard applied")
