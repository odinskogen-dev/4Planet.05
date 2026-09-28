/* Existing 4SAPIEN FOOD: bounded, consent-gated Person memory, never public PLANETBRAIN. */
function FoodPantryProof({user,avoid}) {
 const [items,setItems]=useState([]);
 const [budget,setBudget]=useState("");
 const [entry,setEntry]=useState({name:"",amount:"",unit:"g"});
 const [record,setRecord]=useState(null);
 const [load,setLoad]=useState("LOADING");
 const [save,setSave]=useState("UNSAVED");
 const [returnCount,setReturnCount]=useState(null);
 const [busy,setBusy]=useState(false);
 const userId=user?.id||null;
 const recipes=[
  {id:"fixture-porridge",name:"Havregrøt (eksempel)",sourceRef:"DEMO_FIXTURE_NOT_VERIFIED",ingredients:[{name:"Havregryn",amount:80,unit:"g"},{name:"Melk",amount:200,unit:"ml"}],allergens:["milk"]},
  {id:"fixture-pasta",name:"Tomatpasta (eksempel)",sourceRef:"DEMO_FIXTURE_NOT_VERIFIED",ingredients:[{name:"Pasta",amount:100,unit:"g"},{name:"Hakkede tomater",amount:200,unit:"g"}],allergens:["wheat"]},
  {id:"fixture-bowl",name:"Kikertbolle (eksempel)",sourceRef:"DEMO_FIXTURE_NOT_VERIFIED",ingredients:[{name:"Kikerter",amount:150,unit:"g"},{name:"Hakkede tomater",amount:200,unit:"g"}]}
 ];
 useEffect(()=>{
  let active=true;
  setItems([]);setBudget("");setRecord(null);setReturnCount(null);setSave("UNSAVED");
  if(!userId){setLoad("AUTH_REQUIRED");return()=>{active=false;};}
  setLoad("LOADING");
  (async()=>{
   const {data,error}=await SB.from("four_sapien_embla_memories")
    .select("id,value,created_at")
    .eq("user_id",userId).eq("memory_type","durable_fact").eq("state","active")
    .is("deleted_at",null).contains("value",{namespace:"food_pantry_v1"})
    .order("created_at",{ascending:false}).limit(1);
   if(!active)return;
   if(error){setLoad("READ_FAILED");return;}
   const row=data?.[0]||null, v=row?.value||{};
   const validated=Array.isArray(v.pantry)?v.pantry.filter(i=>i&&typeof i.name==="string"&&i.name.trim()&&
    (i.amount===null||(typeof i.amount==="number"&&Number.isFinite(i.amount)&&i.amount>=0))&&["g","ml","stk"].includes(i.unit)).slice(0,40):[];
   setItems(validated);setBudget(typeof v.budgetNok==="number"&&Number.isFinite(v.budgetNok)&&v.budgetNok>=0?String(v.budgetNok):"");
   setRecord(row);setReturnCount(row?validated.length:null);
   setLoad(row?"RETURNED":"EMPTY");setSave(row?"SAVED":"UNSAVED");
  })().catch(()=>{if(active)setLoad("READ_FAILED");});
  return()=>{active=false;};
 },[userId]);
 const setItem=(n,patch)=>{setItems(old=>old.map((i,k)=>k===n?{...i,...patch}:i));setSave("UNSAVED");};
 const options=window.FourSapienPantryDecision.comparePantryMeals({
  pantry:items,recipes,budgetNok:budget.trim()===""?null:Number(budget),
  avoid:Array.isArray(avoid)?avoid.filter(x=>typeof x==="string"):[]
 });
 const persist=async()=>{
  if(!userId||busy||load==="LOADING"||load==="READ_FAILED")return;
  const clean=items.filter(i=>i.name?.trim()).slice(0,40).map(i=>({name:i.name.trim().slice(0,100),amount:i.amount,unit:i.unit}));
  if(clean.some(i=>i.amount!==null&&(!Number.isFinite(i.amount)||i.amount<0))|| (budget.trim()!==""&&(!Number.isFinite(Number(budget))||Number(budget)<0))){setSave("CHECK_INPUT");return;}
  setBusy(true);setSave("SAVING");
  const row={user_id:userId,memory_type:"durable_fact",content:"Bekreftet FOOD-beholdning",value:{
    namespace:"food_pantry_v1",pantry:clean,budgetNok:budget.trim()===""?null:Number(budget),
    dataState:"user_confirmed",purchasedIsNotConsumed:true
   },state:"active",confirmation_state:"user_confirmed",
   provenance:{source:"4SAPIEN FOOD",privacy:"private_person",evidence_class:"USER_CONFIRMED",revision:"pantry_v1"},
   supersedes_id:record?.id||null};
  try {
   const {data,error}=await SB.from("four_sapien_embla_memories").insert(row).select("id,value,created_at").single();
   if(error||!data?.id)throw error||new Error("WRITE_READBACK_FAILED");
   const {data:readback,error:readError}=await SB.from("four_sapien_embla_memories")
     .select("id,value").eq("id",data.id).eq("user_id",userId).eq("state","active").maybeSingle();
   if(readError||readback?.value?.namespace!=="food_pantry_v1")throw readError||new Error("WRITE_READBACK_FAILED");
   setRecord(data);setSave("SAVED");setReturnCount(null);
   if(record?.id){
    const {data:prior,error:priorError}=await SB.from("four_sapien_embla_memories")
      .update({state:"superseded",updated_at:new Date().toISOString()})
      .eq("id",record.id).eq("user_id",userId).eq("state","active").select("id");
    if(priorError||!prior?.length)setSave("SAVED_PREVIOUS_REVISION_REVIEW");
   }
  }catch(_){setSave("SAVE_FAILED_RECHECK");}
  finally{setBusy(false);}
 };
 const removeSaved=async()=>{
  if(!record?.id||!userId||busy)return;setBusy(true);setSave("SAVING");
  try{
   const {data,error}=await SB.from("four_sapien_embla_memories")
    .update({state:"deleted",deleted_at:new Date().toISOString(),updated_at:new Date().toISOString()})
    .eq("id",record.id).eq("user_id",userId).eq("state","active").select("id");
   if(error||!data?.length)throw error||new Error("DELETE_FAILED");
   const {data:check,error:err}=await SB.from("four_sapien_embla_memories")
    .select("id").eq("id",record.id).eq("user_id",userId).eq("state","active").maybeSingle();
   if(err||check)throw err||new Error("DELETE_READBACK_FAILED");
   setRecord(null);setItems([]);setBudget("");setReturnCount(null);setSave("REMOVED");setLoad("EMPTY");
  }catch(_){setSave("REMOVE_FAILED_RECHECK");}finally{setBusy(false);}
 };
 const field={minHeight:42,padding:"9px",border:"1px solid var(--line2)",borderRadius:8,background:"var(--paper)",color:"var(--ink)"};
 return <section id="four-sapien-food-pantry" aria-label="Min mat — privat beholdning" style={{margin:"24px 0",padding:"20px",border:"1px solid var(--line2)",borderRadius:14}}>
  <div style={{fontFamily:"monospace",fontSize:11}}>4SAPIEN · MAT · PRIVAT BEHOLDNING</div>
  <h2 style={{fontSize:24,margin:"10px 0"}}>Hva kan jeg lage med maten jeg har?</h2>
  <p>Bekreft det du faktisk har hjemme. Kjøpt betyr ikke tilgjengelig eller spist. Tre tydelig merkede eksempeloppskrifter; ingen dokumentert pris, ernærings- eller miljøpåstand.</p>
  {!userId?<p role="status">Logg inn med eksisterende 4PLANET ID for å bruke privat beholdning.</p>:load==="LOADING"?<p role="status">Leser bekreftet beholdning…</p>:load==="READ_FAILED"?<p role="alert">Privat beholdning kunne ikke leses. Ingenting er antatt eller overskrevet. Prøv å laste siden på nytt.</p>:<>
    {returnCount!==null&&<p role="status">Tilbake: {returnCount} tidligere bekreftede ingredienser er fylt inn fra din private profil. Dette er antall felt, ikke målt tidsbesparelse.</p>}
    <div style={{display:"grid",gap:10}}>
     {items.map((i,k)=><div key={k} style={{display:"flex",gap:6,flexWrap:"wrap"}}>
       <input aria-label={"Ingrediens "+(k+1)} value={i.name} onChange={e=>setItem(k,{name:e.target.value})} style={{...field,flex:"2 1 140px"}}/>
       <input aria-label={"Mengde "+(k+1)} type="number" min="0" step="any" value={i.amount??""} onChange={e=>setItem(k,{amount:e.target.value===""?null:Number(e.target.value)})} style={{...field,width:90}}/>
       <select aria-label={"Enhet "+(k+1)} value={i.unit} onChange={e=>setItem(k,{unit:e.target.value})} style={field}><option value="g">g</option><option value="ml">ml</option><option value="stk">stk</option></select>
       <button type="button" onClick={()=>{setItems(old=>old.filter((_,n)=>n!==k));setSave("UNSAVED");}} style={field}>Fjern</button>
      </div>)}
     <form onSubmit={e=>{e.preventDefault();if(!entry.name.trim())return;setItems(old=>[...old,{name:entry.name.trim(),amount:entry.amount===""?null:Number(entry.amount),unit:entry.unit}]);setEntry({name:"",amount:"",unit:"g"});setSave("UNSAVED");}} style={{display:"flex",gap:6,flexWrap:"wrap"}}>
       <input aria-label="Ny ingrediens" value={entry.name} onChange={e=>setEntry({...entry,name:e.target.value})} placeholder="Matvare" style={{...field,flex:"2 1 140px"}}/>
       <input aria-label="Ny mengde" type="number" min="0" step="any" value={entry.amount} onChange={e=>setEntry({...entry,amount:e.target.value})} placeholder="Mengde" style={{...field,width:90}}/>
       <select aria-label="Ny enhet" value={entry.unit} onChange={e=>setEntry({...entry,unit:e.target.value})} style={field}><option value="g">g</option><option value="ml">ml</option><option value="stk">stk</option></select>
       <button type="submit" style={field}>Legg til</button>
     </form>
     <label>Valgfritt ekstra innkjøpsbudsjett (NOK) <input aria-label="Ekstra matbudsjett" type="number" min="0" step="any" value={budget} onChange={e=>{setBudget(e.target.value);setSave("UNSAVED");}} placeholder="UKJENT" style={{...field,width:110}}/></label>
    </div>
    <div aria-live="polite" style={{display:"grid",gap:10,margin:"20px 0"}}>
     {items.length?options.map(o=><article key={o.id} style={{padding:12,border:"1px solid var(--line2)",borderRadius:10}}>
       <strong>{o.name}</strong><p>{o.missing.length?"Mangler: "+o.missing.map(i=>i.name+" "+i.amount+" "+i.unit).join(", "):"Ingen ytterligere ingredienser ut fra oppgitte mengder."}</p>
       {o.unknown.length>0&&<p>UKJENT: {o.unknown.map(i=>i.name).join(", ")}</p>}
       <p>Ekstra innkjøp: {o.additionalPurchase.nok===null?"UKJENT":o.additionalPurchase.nok+" NOK"} · {o.budget.state.replaceAll("_"," ")}</p>
       <small>Eksempeldata, ikke verifisert oppskrift eller helse-/allergi-/miljøvurdering.</small>
      </article>):<p>Legg inn ingredienser for å se hva som kan matches.</p>}
    </div>
    <button type="button" disabled={busy||load==="READ_FAILED"} onClick={persist} style={{...field,cursor:"pointer"}}>Bekreft og lagre i min private 4SAPIEN</button>
    {record&&<button type="button" disabled={busy} onClick={removeSaved} style={{...field,marginLeft:7}}>Fjern min lagrede beholdning</button>}
    <p role="status">Lagring: {save}. Endringer er ikke lagret før du bekrefter. Privat Person-minne, ikke felles PLANETBRAIN.</p>
   </>}
 </section>;
}
