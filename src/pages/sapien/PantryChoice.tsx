import { useMemo, useState } from 'react';
import { comparePantryMeals, type FoodRecipe, type PantryItem } from '@/food/pantry-decision.js';

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
export default function PantryChoice() {
  const [pantry,setPantry] = useState<PantryItem[]>([]);
  const [name,setName] = useState('');
  const [amount,setAmount] = useState('');
  const [unit,setUnit] = useState('g');
  const [budget,setBudget] = useState('');
  const options = useMemo(() => comparePantryMeals({
    pantry, recipes:DEMO_RECIPES,
    budgetNok:budget.trim() === '' ? null : Number(budget)
  }), [pantry,budget]);
  const update = (index:number,patch:Partial<PantryItem>) =>
    setPantry(previous => previous.map((item,i) => i === index ? {...item,...patch} : item));
  return <section aria-labelledby="pantry-choice-title" style={{padding:'clamp(24px,5vw,72px)',background:'#faf9f5',color:'#080808'}}>
    <p className="embla02__eyebrow">FOOD · INDEPENDENT VALUE LOOP · TEST SURFACE</p>
    <h2 id="pantry-choice-title" style={{fontSize:'clamp(30px,5vw,58px)',lineHeight:1,letterSpacing:'-.04em',margin:'12px 0'}}>What can I make with what I have?</h2>
    <p style={{maxWidth:720,lineHeight:1.6}}>Try a bounded ingredient-matching demonstration. Example recipes are synthetic test fixtures, not verified nutritional, allergy or environmental guidance. Edit your pantry to correct an answer. Nothing here is sent or saved to your account.</p>
    <div style={{display:'flex',flexWrap:'wrap',gap:10,margin:'20px 0'}}>
      <button type="button" onClick={()=>setPantry(DEMO_PANTRY.map(item=>({...item})))} style={btnStyle}>Load example pantry</button>
      <button type="button" onClick={()=>setPantry([])} style={{...btnStyle,background:'#fff',color:'#080808'}}>Clear</button>
    </div>
    <div style={{display:'grid',gap:12,maxWidth:900}}>
      {pantry.map((item,index)=><div key={index} style={{display:'flex',flexWrap:'wrap',gap:8}}>
        <input aria-label={`Ingredient ${index+1}`} value={item.name} onChange={e=>update(index,{name:e.target.value})} style={{...inputStyle,flex:'2 1 160px'}}/>
        <input aria-label={`Quantity ${index+1}`} type="number" min="0" step="any" value={item.amount ?? ''} onChange={e=>update(index,{amount:e.target.value===''?null:Number(e.target.value)})} style={{...inputStyle,width:105}}/>
        <select aria-label={`Unit ${index+1}`} value={item.unit} onChange={e=>update(index,{unit:e.target.value})} style={inputStyle}><option value="g">g</option><option value="ml">ml</option><option value="stk">pieces</option></select>
        <button type="button" onClick={()=>setPantry(previous=>previous.filter((_,i)=>i!==index))} style={{...btnStyle,background:'#fff',color:'#080808'}}>Remove</button>
      </div>)}
      <form onSubmit={e=>{e.preventDefault();if(!name.trim())return;setPantry(previous=>[...previous,{name:name.trim(),amount:amount===''?null:Number(amount),unit}]);setName('');setAmount('');}} style={{display:'flex',flexWrap:'wrap',gap:8}}>
        <input aria-label="New ingredient" placeholder="Ingredient" value={name} onChange={e=>setName(e.target.value)} style={{...inputStyle,flex:'2 1 160px'}}/>
        <input aria-label="New quantity" placeholder="Quantity" type="number" min="0" step="any" value={amount} onChange={e=>setAmount(e.target.value)} style={{...inputStyle,width:105}}/>
        <select aria-label="New unit" value={unit} onChange={e=>setUnit(e.target.value)} style={inputStyle}><option value="g">g</option><option value="ml">ml</option><option value="stk">pieces</option></select>
        <button type="submit" style={btnStyle}>Add ingredient</button>
      </form>
      <label style={{display:'flex',gap:12,alignItems:'center',flexWrap:'wrap'}}>Optional additional shopping budget (NOK)
        <input aria-label="Additional shopping budget in NOK" type="number" min="0" step="any" placeholder="Unknown" value={budget} onChange={e=>setBudget(e.target.value)} style={{...inputStyle,width:140}}/>
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
      </article>):<p>Add ingredients or load the example to compare three test recipes.</p>}
    </div>
    <p style={{maxWidth:720,fontSize:13,lineHeight:1.6,marginTop:22}}>Privacy boundary: this test keeps your edits in this browser tab only. Refresh clears them; account persistence and second-visit learning are NOT implemented here. Missing budget or missing dated prices are UNKNOWN, not 0 NOK.</p>
  </section>;
}
