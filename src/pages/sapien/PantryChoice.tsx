import { useEffect, useMemo, useRef, useState } from 'react';
import { comparePantryMeals, type FoodRecipe, type PantryItem } from '@/food/pantry-decision.js';
import {
  currentFoodPantrySession,
  loadFoodPantryMemory,
  recordFoodValueEvent,
  removeFoodPantryMemory,
  saveFoodDecision,
  saveFoodPantryMemory,
  type FoodPantryMemory,
} from '@/food/pantryMemory';
import { identityLoginUrl, type FourPlanetSession } from '@/identity/identityClient';
import { trackEvent } from '@/analytics/Analytics';

const DEMO_RECIPES: FoodRecipe[] = [
  { id:'fixture-porridge',name:'Porridge — example',sourceRef:'DEMO_FIXTURE_NOT_VERIFIED',
    ingredients:[{name:'Oats',amount:80,unit:'g'},{name:'Milk',amount:200,unit:'ml'}],allergens:['milk'] },
  { id:'fixture-pasta',name:'Tomato pasta — example',sourceRef:'DEMO_FIXTURE_NOT_VERIFIED',
    ingredients:[{name:'Pasta',amount:100,unit:'g'},{name:'Tinned tomatoes',amount:200,unit:'g'}],allergens:['wheat'] },
  { id:'fixture-chickpeas',name:'Chickpea tomato bowl — example',sourceRef:'DEMO_FIXTURE_NOT_VERIFIED',
    ingredients:[{name:'Chickpeas',amount:150,unit:'g'},{name:'Tinned tomatoes',amount:200,unit:'g'}] },
];

const DEMO_PANTRY: PantryItem[] = [
  {name:'Oats',amount:120,unit:'g'},
  {name:'Milk',amount:250,unit:'ml'},
  {name:'Pasta',amount:70,unit:'g'},
  {name:'Tinned tomatoes',amount:400,unit:'g'},
];

const inputStyle = { minHeight:44, padding:'8px 10px', border:'1px solid #b0b0ad', borderRadius:8, background:'#fff', color:'#080808', fontSize:15 } as const;
const btnStyle = { minHeight:44, padding:'8px 15px', border:'1px solid #080808', borderRadius:8, background:'#080808', color:'#fff', cursor:'pointer' } as const;

type MemoryState = 'CHECKING' | 'SIGNED_OUT' | 'EMPTY' | 'RETURNED' | 'SAVING' | 'SAVED' | 'REMOVED' | 'ERROR';

export default function PantryChoice() {
  const [pantry,setPantry] = useState<PantryItem[]>([]);
  const [name,setName] = useState('');
  const [amount,setAmount] = useState('');
  const [unit,setUnit] = useState('g');
  const [budget,setBudget] = useState('');
  const [session,setSession] = useState<FourPlanetSession|null>(null);
  const [memory,setMemory] = useState<FoodPantryMemory|null>(null);
  const [memoryState,setMemoryState] = useState<MemoryState>('CHECKING');
  const [memoryMessage,setMemoryMessage] = useState('');
  const [decisionState,setDecisionState] = useState<'IDLE'|'SAVING'|'SAVED'|'ERROR'>('IDLE');
  const [decisionMessage,setDecisionMessage] = useState('');
  const [valueSignal,setValueSignal] = useState<boolean|null>(null);
  const startedAtRef = useRef(typeof performance !== 'undefined' ? performance.now() : Date.now());
  const activationSentRef = useRef(false);
  const valueEventSentRef = useRef(false);

  const options = useMemo(() => comparePantryMeals({
    pantry, recipes:DEMO_RECIPES,
    budgetNok:budget.trim() === '' ? null : Number(budget)
  }), [pantry,budget]);

  useEffect(() => {
    let active = true;
    currentFoodPantrySession()
      .then(async current => {
        if (!active) return;
        if (!current) {
          setMemoryState('SIGNED_OUT');
          return;
        }
        setSession(current);
        trackEvent('food_identity_ready',{product_area:'4sapien',loop:'food_first_value_v2'});
        recordFoodValueEvent(current,'food_identity_ready',{
          loop:'food_first_value_v2',
          stage:'identity',
        }).catch(()=>undefined);
        const saved = await loadFoodPantryMemory(current);
        if (!active) return;
        if (!saved) {
          setMemoryState('EMPTY');
          return;
        }
        setMemory(saved);
        setPantry(saved.pantry);
        setBudget(saved.budgetNok === null ? '' : String(saved.budgetNok));
        setMemoryState('RETURNED');
        setMemoryMessage(`Welcome back. Restored ${saved.pantry.length} user-confirmed pantry items from your private 4SAPIEN memory.`);
        trackEvent('return_value', {
          product_area:'4sapien',
          value_kind:'food_pantry_rehydrated',
          item_count:saved.pantry.length,
        });
        recordFoodValueEvent(current,'food_context_returned',{
          loop:'food_first_value_v2',
          stage:'return',
          returning:true,
          item_count:saved.pantry.length,
        }).catch(()=>undefined);
      })
      .catch(() => {
        if (!active) return;
        setMemoryState('ERROR');
        setMemoryMessage('Private pantry memory could not be read. Nothing was assumed or overwritten.');
      });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!pantry.length || !options.length || valueEventSentRef.current) return;
    const returning = memoryState === 'RETURNED';
    const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
    const elapsedMs = Math.max(0,Math.round(now-startedAtRef.current));
    valueEventSentRef.current = true;
    trackEvent(returning ? 'second_value_reached' : 'value_reached', {
      product_area:'4sapien',
      value_kind:'food_pantry_comparison',
      option_count:options.length,
      returning,
      elapsed_ms:elapsedMs,
    });
    if (session) {
      recordFoodValueEvent(session,returning ? 'food_second_value_reached' : 'food_value_reached',{
        loop:'food_first_value_v2',
        stage:returning ? 'second_value' : 'first_value',
        returning,
        elapsed_ms:elapsedMs,
        item_count:pantry.length,
        option_count:options.length,
      }).catch(()=>undefined);
    }
  }, [memoryState,options.length,pantry.length,session]);

  const recordActivation = (stage:'example'|'manual_item') => {
    if (activationSentRef.current) return;
    activationSentRef.current = true;
    trackEvent('food_activation',{product_area:'4sapien',loop:'food_first_value_v2',stage});
    if (session) {
      recordFoodValueEvent(session,'food_activation',{
        loop:'food_first_value_v2',
        stage,
      }).catch(()=>undefined);
    }
  };

  const update = (index:number,patch:Partial<PantryItem>) => {
    setPantry(previous => previous.map((item,i) => i === index ? {...item,...patch} : item));
    if (memoryState === 'SAVED' || memoryState === 'RETURNED') setMemoryState('EMPTY');
  };

  const loadExample = () => {
    setPantry(DEMO_PANTRY.map(item=>({...item})));
    setMemoryState(session ? 'EMPTY' : 'SIGNED_OUT');
    recordActivation('example');
    trackEvent('value_action',{product_area:'4sapien',action_kind:'food_pantry_example_loaded'});
  };

  const clearPantry = () => {
    setPantry([]);
    setBudget('');
    if (memoryState === 'SAVED' || memoryState === 'RETURNED') setMemoryState('EMPTY');
  };

  const savePantry = async () => {
    if (!session) {
      window.location.assign(identityLoginUrl(window.location.href));
      return;
    }
    const budgetNumber = budget.trim() === '' ? null : Number(budget);
    if (budgetNumber !== null && (!Number.isFinite(budgetNumber) || budgetNumber < 0)) {
      setMemoryState('ERROR');
      setMemoryMessage('Check the optional budget before saving.');
      return;
    }
    setMemoryState('SAVING');
    setMemoryMessage('');
    try {
      const saved = await saveFoodPantryMemory(session,pantry,budgetNumber,memory?.id);
      setMemory(saved);
      setMemoryState('SAVED');
      setMemoryMessage('Saved and read back from your private 4SAPIEN memory. It can now improve your next visit.');
      trackEvent('memory_written',{
        product_area:'4sapien',
        memory_kind:'food_pantry',
        item_count:saved.pantry.length,
      });
      recordFoodValueEvent(session,'food_context_saved',{
        loop:'food_first_value_v2',
        stage:'saved_context',
        item_count:saved.pantry.length,
      }).catch(()=>undefined);
    } catch (cause) {
      setMemoryState('ERROR');
      setMemoryMessage(cause instanceof Error && cause.message === 'PANTRY_PRIOR_REVISION_REVIEW_REQUIRED'
        ? 'New pantry revision was saved, but the previous revision needs cleanup review.'
        : 'Private pantry could not be saved. Nothing is presented as remembered.');
    }
  };

  const chooseOption = async (option:(typeof options)[number]) => {
    if (!session) {
      window.location.assign(identityLoginUrl(window.location.href));
      return;
    }
    setDecisionState('SAVING');
    setDecisionMessage('');
    try {
      await saveFoodDecision(session,{
        optionId:option.id,
        sourceRef:option.sourceRef,
        status:option.status,
        missingCount:option.missing.length,
        unknownCount:option.unknown.length,
        comparedOptionIds:options.map(candidate=>candidate.id),
      });
      setDecisionState('SAVED');
      setDecisionMessage('Choice saved as your private decision state. This records the choice, not that the meal was cooked or useful.');
      trackEvent('food_decision_saved',{
        product_area:'4sapien',
        decision_status:option.status,
        missing_count:option.missing.length,
        unknown_count:option.unknown.length,
      });
      recordFoodValueEvent(session,'food_decision_saved',{
        loop:'food_first_value_v2',
        stage:'decision',
        decision_status:option.status,
        missing_count:option.missing.length,
        unknown_count:option.unknown.length,
        source_state:option.sourceRef === 'DEMO_FIXTURE_NOT_VERIFIED' ? 'demo_fixture' : 'source_referenced',
      }).catch(()=>undefined);
    } catch {
      setDecisionState('ERROR');
      setDecisionMessage('The decision could not be saved. Nothing is presented as remembered.');
    }
  };

  const recordValueSignal = (helpful:boolean) => {
    setValueSignal(helpful);
    trackEvent('explicit_value_signal',{
      product_area:'4sapien',
      value_kind:'food_pantry_comparison',
      helpful,
    });
    if (session) {
      recordFoodValueEvent(session,'food_value_signal',{
        loop:'food_first_value_v2',
        stage:'explicit_value',
        helpful,
        returning:memoryState === 'RETURNED',
      }).catch(()=>undefined);
    }
  };

  const removeMemory = async () => {
    if (!session || !memory?.id) return;
    setMemoryState('SAVING');
    setMemoryMessage('');
    try {
      await removeFoodPantryMemory(session,memory.id);
      setMemory(null);
      setPantry([]);
      setBudget('');
      setMemoryState('REMOVED');
      setMemoryMessage('Private pantry memory removed.');
      trackEvent('memory_removed',{product_area:'4sapien',memory_kind:'food_pantry'});
    } catch {
      setMemoryState('ERROR');
      setMemoryMessage('Private pantry memory could not be removed. Reload before relying on its state.');
    }
  };

  return <section aria-labelledby="pantry-choice-title" style={{padding:'clamp(24px,5vw,72px)',background:'#faf9f5',color:'#080808'}}>
    <p className="embla02__eyebrow">FOOD · FIRST-RETURN VALUE LOOP</p>
    <h2 id="pantry-choice-title" style={{fontSize:'clamp(30px,5vw,58px)',lineHeight:1,letterSpacing:'-.04em',margin:'12px 0'}}>What can I make with what I have?</h2>
    <p style={{maxWidth:720,lineHeight:1.6}}>Compare your reported pantry against three clearly labelled example recipes. The comparison is deterministic. Recipes are synthetic test fixtures, not verified nutritional, allergy or environmental guidance.</p>

    <div role="status" aria-live="polite" style={{maxWidth:900,padding:'14px 0',borderTop:'1px solid #c4c4c0',borderBottom:'1px solid #c4c4c0',margin:'18px 0'}}>
      {memoryState === 'CHECKING' && <span>Checking private 4SAPIEN memory…</span>}
      {memoryState === 'SIGNED_OUT' && <span>Anonymous use stays in this browser tab. Sign in with 4PLANET ID to make a user-confirmed pantry available on your next visit.</span>}
      {(memoryState === 'EMPTY' || memoryState === 'RETURNED' || memoryState === 'SAVED' || memoryState === 'REMOVED' || memoryState === 'ERROR') && <span>{memoryMessage || (session ? 'Signed in. Nothing is remembered until you explicitly save.' : 'Not signed in.')}</span>}
      {memoryState === 'SAVING' && <span>Writing private memory and verifying server readback…</span>}
    </div>

    <div style={{display:'flex',flexWrap:'wrap',gap:10,margin:'20px 0'}}>
      <button type="button" onClick={loadExample} style={btnStyle}>Load example pantry</button>
      <button type="button" onClick={clearPantry} style={{...btnStyle,background:'#fff',color:'#080808'}}>Clear</button>
      <button type="button" disabled={memoryState === 'SAVING' || memoryState === 'CHECKING'} onClick={savePantry} style={{...btnStyle,background:'#fff',color:'#080808'}}>
        {session ? 'Remember this pantry' : 'Sign in to remember this'}
      </button>
      {session && memory && <button type="button" disabled={memoryState === 'SAVING'} onClick={removeMemory} style={{...btnStyle,background:'#fff',color:'#080808'}}>Remove remembered pantry</button>}
    </div>

    <div style={{display:'grid',gap:12,maxWidth:900}}>
      {pantry.map((item,index)=><div key={index} style={{display:'flex',flexWrap:'wrap',gap:8}}>
        <input aria-label={`Ingredient ${index+1}`} value={item.name} onChange={e=>update(index,{name:e.target.value})} style={{...inputStyle,flex:'2 1 160px'}}/>
        <input aria-label={`Quantity ${index+1}`} type="number" min="0" step="any" value={item.amount ?? ''} onChange={e=>update(index,{amount:e.target.value===''?null:Number(e.target.value)})} style={{...inputStyle,width:105}}/>
        <select aria-label={`Unit ${index+1}`} value={item.unit} onChange={e=>update(index,{unit:e.target.value})} style={inputStyle}><option value="g">g</option><option value="ml">ml</option><option value="stk">pieces</option></select>
        <button type="button" onClick={()=>{setPantry(previous=>previous.filter((_,i)=>i!==index));if(memoryState==='SAVED'||memoryState==='RETURNED')setMemoryState('EMPTY');}} style={{...btnStyle,background:'#fff',color:'#080808'}}>Remove</button>
      </div>)}
      <form onSubmit={e=>{e.preventDefault();if(!name.trim())return;setPantry(previous=>[...previous,{name:name.trim(),amount:amount===''?null:Number(amount),unit}]);setName('');setAmount('');if(memoryState==='SAVED'||memoryState==='RETURNED')setMemoryState('EMPTY');recordActivation('manual_item');trackEvent('value_action',{product_area:'4sapien',action_kind:'food_pantry_item_added'});}} style={{display:'flex',flexWrap:'wrap',gap:8}}>
        <input aria-label="New ingredient" placeholder="Ingredient" value={name} onChange={e=>setName(e.target.value)} style={{...inputStyle,flex:'2 1 160px'}}/>
        <input aria-label="New quantity" placeholder="Quantity" type="number" min="0" step="any" value={amount} onChange={e=>setAmount(e.target.value)} style={{...inputStyle,width:105}}/>
        <select aria-label="New unit" value={unit} onChange={e=>setUnit(e.target.value)} style={inputStyle}><option value="g">g</option><option value="ml">ml</option><option value="stk">pieces</option></select>
        <button type="submit" style={btnStyle}>Add ingredient</button>
      </form>
      <label style={{display:'flex',gap:12,alignItems:'center',flexWrap:'wrap'}}>Optional additional shopping budget (NOK)
        <input aria-label="Additional shopping budget in NOK" type="number" min="0" step="any" placeholder="Unknown" value={budget} onChange={e=>{setBudget(e.target.value);if(memoryState==='SAVED'||memoryState==='RETURNED')setMemoryState('EMPTY');}} style={{...inputStyle,width:140}}/>
      </label>
    </div>

    <div aria-live="polite" style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:12,marginTop:28}}>
      {pantry.length ? options.map(option=><article key={option.id} style={{padding:18,border:'1px solid #c4c4c0',borderRadius:12,background:'#fff'}}>
        <small style={{fontFamily:'monospace'}}>{option.status.replaceAll('_',' ')}</small>
        <h3 style={{fontSize:24,margin:'8px 0 14px'}}>{option.name}</h3>
        <p>{option.missing.length? `Missing: ${option.missing.map(i=>`${i.name} ${i.amount} ${i.unit}`).join(', ')}`:'No additional ingredients indicated by reported amounts.'}</p>
        {option.unknown.length>0&&<p>Unknown: {option.unknown.map(i=>i.name).join(', ')}. Correct the information before relying on this result.</p>}
        <p>Additional purchase: {option.additionalPurchase.nok===null?'UNKNOWN':`${option.additionalPurchase.nok.toLocaleString('en-GB')} NOK`}. {option.budget.state.replaceAll('_',' ')}.</p>
        <small>Example recipe, not a product-level evidence or allergy guarantee. Total meal cost and ecological effect UNKNOWN.</small>
        <div style={{marginTop:14}}>
          <button type="button" disabled={decisionState==='SAVING'} onClick={()=>chooseOption(option)} style={{...btnStyle,background:'#fff',color:'#080808'}}>
            {session ? 'Use this option' : 'Sign in to save this choice'}
          </button>
        </div>
      </article>):<p>Add ingredients or load the example to compare three test recipes.</p>}
    </div>

    {decisionState!=='IDLE'&&<p role="status" style={{maxWidth:720,marginTop:16}}>{decisionState==='SAVING'?'Saving private decision…':decisionMessage}</p>}

    {pantry.length>0&&options.length>0&&<section aria-label="Value feedback" style={{maxWidth:720,marginTop:28,paddingTop:18,borderTop:'1px solid #c4c4c0'}}>
      <p style={{margin:'0 0 10px'}}>Was this comparison useful for this task?</p>
      <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
        <button type="button" aria-pressed={valueSignal===true} onClick={()=>recordValueSignal(true)} style={{...btnStyle,background:valueSignal===true?'#080808':'#fff',color:valueSignal===true?'#fff':'#080808'}}>Yes</button>
        <button type="button" aria-pressed={valueSignal===false} onClick={()=>recordValueSignal(false)} style={{...btnStyle,background:valueSignal===false?'#080808':'#fff',color:valueSignal===false?'#fff':'#080808'}}>Not yet</button>
      </div>
      {valueSignal!==null&&<p role="status" style={{fontSize:13}}>Value signal recorded{session?' with your authenticated test journey':' for this anonymous session only'}.</p>}
    </section>}

    <p style={{maxWidth:720,fontSize:13,lineHeight:1.6,marginTop:22}}>Privacy boundary: anonymous edits remain in this browser tab only. Signed-in persistence writes only after explicit confirmation to your private Person memory under existing owner RLS. Value-loop analytics contain stage, timing, counts and yes/no usefulness only — never ingredient names, pantry contents, prompts or free text. It is not shared PLANETBRAIN truth. Missing budget or missing dated prices are UNKNOWN, not 0 NOK.</p>
  </section>;
}
