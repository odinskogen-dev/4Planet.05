import test from 'node:test';
import assert from 'node:assert/strict';
import { comparePantryMeals } from '../src/food/pantry-decision.js';
const recipes = [
  { id:'r1',name:'Oats',sourceRef:'TEST_FIXTURE',ingredients:[{name:'Oats',amount:100,unit:'g'},{name:'Milk',amount:200,unit:'ml'}],allergens:['milk'] },
  { id:'r2',name:'Tomato pasta',sourceRef:'TEST_FIXTURE',ingredients:[{name:'Pasta',amount:100,unit:'g'},{name:'Tomatoes',amount:200,unit:'g'}],allergens:['wheat'] },
];
const pantry = [{name:'oats',amount:150,unit:'g'},{name:'Milk',amount:250,unit:'ml'},{name:'Pasta',amount:50,unit:'g'}];
test('two meal options and exact missing ingredients',()=>{
  const [a,b]=comparePantryMeals({pantry,recipes});
  assert.equal(a.status,'CAN_MAKE_WITH_REPORTED_STOCK'); assert.equal(a.additionalPurchase.nok,0);
  assert.equal(b.status,'NEEDS_ITEMS');assert.deepEqual(b.missing.map(x=>[x.name,x.amount]),[['Pasta',50],['Tomatoes',200]]);
  assert.equal(b.additionalPurchase.state,'UNKNOWN'); assert.equal(b.additionalPurchase.nok,null);
});
test('dated price only, never fabricated checkout price; budget UNKNOWN when cost unknown',()=>{
  const r=comparePantryMeals({pantry,recipes,budgetNok:50,prices:[{name:'Pasta',priceNok:10,quantity:100,unit:'g',observedAt:'2026-01-01',sourceId:'TEST'}, {name:'Tomatoes',priceNok:20,quantity:200,unit:'g',observedAt:'2026-01-01',sourceId:'TEST'}]})[1];
  assert.equal(r.additionalPurchase.nok,25);assert.equal(r.budget.state,'ESTIMATE_WITHIN_BUDGET');assert.match(r.additionalPurchase.limitation,/not a current checkout-price guarantee/i);
  assert.equal(comparePantryMeals({pantry,recipes,budgetNok:50})[1].budget.state,'UNKNOWN_COST');
});
test('missing budget is UNKNOWN, not 0 NOK',()=>{const r=comparePantryMeals({pantry,recipes})[1];assert.equal(r.budget.state,'UNKNOWN_BUDGET'); assert.equal(r.budget.nok,null)});
test('unknown quantity/unit never becomes CAN_MAKE or zero cost',()=>{const r=comparePantryMeals({pantry:[{name:'oats',amount:null,unit:'g'},{name:'Milk',amount:5,unit:'l'}],recipes:[recipes[0]]})[0];assert.equal(r.status,'UNKNOWN');assert.equal(r.additionalPurchase.nok,null);assert.equal(r.unknown.length,2)});
test('avoidance tags conflict and absent allergy declaration fail closed',()=>{
  const [r]=comparePantryMeals({pantry,recipes:[recipes[0]],avoid:['milk']});assert.equal(r.status,'CONSTRAINT_CONFLICT');
  const [u]=comparePantryMeals({pantry,recipes:[{...recipes[0],allergens:undefined}],avoid:['milk']});assert.equal(u.status,'UNKNOWN');
});
test('pure repeat input yields the same answer; no mutation or persistence inferred',()=>{const input={pantry,recipes};const before=JSON.stringify(input);assert.deepEqual(comparePantryMeals(input),comparePantryMeals(input));assert.equal(JSON.stringify(input),before)});
test('duplicate recipe lines aggregate; duplicate stock never passes silently',()=>{
  const recipe={id:'dup',name:'Double oats',ingredients:[{name:'oats',amount:80,unit:'g'},{name:'Oats',amount:80,unit:'g'}]};
  const [r]=comparePantryMeals({pantry:[{name:'oats',amount:100,unit:'g'}],recipes:[recipe]});assert.equal(r.status,'NEEDS_ITEMS');assert.equal(r.missing[0].amount,60);
  const [u]=comparePantryMeals({pantry:[{name:'oats',amount:100,unit:'g'},{name:'OATS',amount:100,unit:'g'}],recipes:[recipe]});assert.equal(u.status,'UNKNOWN');assert.equal(u.additionalPurchase.nok,null);
});
