from pathlib import Path
import sys

if len(sys.argv)!=2:
    raise SystemExit('usage: apply_food_money_guard.py <food-html>')
p=Path(sys.argv[1])
s=p.read_text(encoding='utf-8')
if 'FOUR_SAPIEN_FOOD_MONEY_V1' in s:
    raise SystemExit('FOOD × MONEY guard already applied')

component=r'''/* FOUR_SAPIEN_FOOD_MONEY_V1 */
function FoodMoneyContext({ctx,onEnable,onUseBudget}){
 if(!ctx||ctx.state==="LOADING")return <div style={{border:"1px solid "+T.line2,borderRadius:14,padding:14,marginBottom:16}}><div style={{fontFamily:T.mono,fontSize:10,color:T.faint}}>FOOD × MONEY · HENTER STATE</div></div>;
 if(ctx.state==="PERMISSION_REQUIRED")return <div style={{border:"1px solid "+T.line2,borderRadius:14,padding:14,marginBottom:16}}><div style={{fontFamily:T.mono,fontSize:10,color:T.faint,marginBottom:7}}>FOOD × MONEY · AV</div><div style={{fontFamily:T.body,fontSize:13.5,color:T.soft,lineHeight:1.5,marginBottom:10}}>Matdelen bruker ikke økonomidata uten din tillatelse.</div><Btn kind="ghost" onClick={onEnable}>Koble Finance til matplan</Btn></div>;
 if(ctx.state!=="AVAILABLE")return <div style={{border:"1px solid "+T.line2,borderRadius:14,padding:14,marginBottom:16}}><div style={{fontFamily:T.mono,fontSize:10,color:T.faint}}>FOOD × MONEY · UKJENT</div><div style={{fontFamily:T.body,fontSize:13,color:T.soft,marginTop:7}}>Finance-kontekst er ikke tilgjengelig.</div></div>;
 const a=ctx.available_after_known_obligations==null?null:Number(ctx.available_after_known_obligations),days=ctx.days_until_income==null?null:Number(ctx.days_until_income);const share=a==null||days==null?null:Math.max(0,Math.floor(a*Math.min(7,Math.max(1,days))/Math.max(1,days)));
 return <div style={{border:"1px solid "+T.line2,borderRadius:14,padding:14,marginBottom:16,background:T.blueWash}}><div style={{fontFamily:T.mono,fontSize:10,color:T.blue,marginBottom:7}}>FOOD × MONEY · DETERMINISTISK</div><div style={{fontFamily:T.body,fontSize:13.5,color:T.ink,lineHeight:1.5}}>{a==null?"Ramme frem til neste inntekt: UKJENT.":<>Etter kjente forpliktelser frem til <b>{ctx.next_income_date||"UKJENT"}</b>: <b>{kr(a)}</b>.</>}</div>{share!=null&&<><div style={{fontFamily:T.body,fontSize:12,color:T.soft,marginTop:6}}>7-dagersandel ved jevn fordeling: {kr(share)}. Dette er en beregning, ikke et råd.</div><div style={{marginTop:10}}><Btn kind="ghost" onClick={()=>onUseBudget(share)}>Bruk {kr(share)} som ukebudsjett</Btn></div></>}</div>;
}
'''
anchor='function Meals({addMany,budget,setBudget,selectedMeals,setSelectedMeals}){'
if s.count(anchor)!=1: raise SystemExit(f'Meals signature anchor mismatch: {s.count(anchor)}')
s=s.replace(anchor,component+'\nfunction Meals({addMany,budget,setBudget,selectedMeals,setSelectedMeals,financeContext,onEnableFinance,onUseFinanceBudget}){',1)

ret='return(<div style={{paddingBottom:sel.size>0?70:0}}>'
if s.count(ret)!=1: raise SystemExit(f'Meals return anchor mismatch: {s.count(ret)}')
s=s.replace(ret,ret+'<FoodMoneyContext ctx={financeContext} onEnable={onEnableFinance} onUseBudget={onUseFinanceBudget}/>',1)

handle_old='function Handle({store,setStore,openProduct,addItem,inList,avoid,list,removeItem}){return(<div>'
handle_new='function Handle({store,setStore,openProduct,addItem,inList,avoid,list,removeItem,financeContext,budget}){return(<div>'
if s.count(handle_old)!=1: raise SystemExit(f'Handle signature anchor mismatch: {s.count(handle_old)}')
s=s.replace(handle_old,handle_new,1)
store_anchor='<div style={{display:"flex",gap:8,flexWrap:"wrap",margin:"10px 0 20px"}}>{STORES.map((s)=><Chip key={s} active={store===s} onClick={()=>setStore(store===s?"":s)}>{s}</Chip>)}</div>'
store_extra=store_anchor+'{budget&&<div style={{fontFamily:T.body,fontSize:12.5,color:T.soft,border:"1px solid "+T.line2,borderRadius:10,padding:"9px 11px",marginBottom:14}}>Aktiv matramme: <b>{budget} kr</b>{financeContext?.state==="AVAILABLE"&&financeContext?.next_income_date?` · Finance til ${financeContext.next_income_date}`:""}. Eksakt handlekurvsum er UKJENT til produktpriser er dekket.</div>}'
if s.count(store_anchor)!=1: raise SystemExit(f'Handle store anchor mismatch: {s.count(store_anchor)}')
s=s.replace(store_anchor,store_extra,1)

state_anchor='const[profile,setProfile]=useState(emptyProfile());const[tab,setTab]=useState("hjem");const[list,setList]=useState([]);const[shops,setShops]=useState([]);const[mealPlan,setMealPlan]=useState([]);'
state_new=state_anchor+'const[financeContext,setFinanceContext]=useState({state:"LOADING"});'
if s.count(state_anchor)!=1: raise SystemExit(f'App state anchor mismatch: {s.count(state_anchor)}')
s=s.replace(state_anchor,state_new,1)

week_anchor='const store=profile.store;const avoid=profile.avoid;const currentWeek=weekStartISO();'
week_new=week_anchor+'''\n const loadFinanceContext=useCallback(async()=>{if(!user)return;setFinanceContext({state:"LOADING"});const{data,error}=await SB.rpc("four_sapien_embla_finance_tool",{p_tool:"food_until_payday",p_arguments:{}});if(error){cloudLog("FOOD_MONEY_CONTEXT_FAILED");setFinanceContext({state:"UNAVAILABLE"});return;}setFinanceContext(data||{state:"UNAVAILABLE"});},[user?.id]);\n useEffect(()=>{if(user)void loadFinanceContext();else setFinanceContext({state:"LOADING"});},[user?.id]);'''
if s.count(week_anchor)!=1: raise SystemExit(f'Food currentWeek anchor mismatch: {s.count(week_anchor)}')
s=s.replace(week_anchor,week_new,1)

budget_anchor='const setStore=(v)=>persistProfile({...profile,store:v});const setBudget=(b)=>persistProfile({...profile,budget:b});'
budget_new=budget_anchor+'''\n const enableFinanceFood=async()=>{if(!user)return;const row={user_id:user.id,consumer_world:"food",provider_world:"finance",capability:"plan_food_until_payday",state:"allowed",basis:"explicit_user",granted_at:new Date().toISOString(),revoked_at:null,updated_at:new Date().toISOString()};const{error}=await SB.from("four_sapien_permissions").upsert(row,{onConflict:"user_id,consumer_world,provider_world,capability"});if(error){cloudLog("FOOD_MONEY_PERMISSION_FAILED");return;}await loadFinanceContext();};\n const useFinanceBudget=(amount)=>{if(Number.isFinite(Number(amount))&&Number(amount)>=0)setBudget(String(Math.round(Number(amount))))};'''
if s.count(budget_anchor)!=1: raise SystemExit(f'Food budget anchor mismatch: {s.count(budget_anchor)}')
s=s.replace(budget_anchor,budget_new,1)

render_old='{tab==="handle"&&<Handle store={store} setStore={setStore} openProduct={openProduct} addItem={addItem} inList={inList} avoid={avoid} list={list} removeItem={removeItem}/>} {tab==="middager"&&<Meals addMany={addMany} budget={profile.budget} setBudget={setBudget} selectedMeals={mealPlan} setSelectedMeals={persistMealPlan}/>}'
render_new='{tab==="handle"&&<Handle store={store} setStore={setStore} openProduct={openProduct} addItem={addItem} inList={inList} avoid={avoid} list={list} removeItem={removeItem} financeContext={financeContext} budget={profile.budget}/>} {tab==="middager"&&<Meals addMany={addMany} budget={profile.budget} setBudget={setBudget} selectedMeals={mealPlan} setSelectedMeals={persistMealPlan} financeContext={financeContext} onEnableFinance={enableFinanceFood} onUseFinanceBudget={useFinanceBudget}/>}'
if s.count(render_old)!=1: raise SystemExit(f'Food render anchor mismatch: {s.count(render_old)}')
s=s.replace(render_old,render_new,1)

for marker in ('FOUR_SAPIEN_FOOD_MONEY_V1','four_sapien_embla_finance_tool','plan_food_until_payday','FOOD × MONEY · DETERMINISTISK','Eksakt handlekurvsum er UKJENT'):
    if marker not in s: raise SystemExit(f'Food money marker missing: {marker}')
p.write_text(s,encoding='utf-8')
print('4SAPIEN FOOD × MONEY guard applied')
