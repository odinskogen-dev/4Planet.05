import test from 'node:test';
import assert from 'node:assert/strict';
import {hash32,seededRandom,deriveSeed,applyTransaction,purchase,forecast,findRoute,marchProgress,interpolateCoordinates,
  lonLatToWebMercator,webMercatorToLonLat,haversineKm,checkHistoricalPlace,encodeSave,decodeSave,browserSaveAdapter,
  createTurnEngine,validateBattleContext,cityToSiegeContext,validateBattleResult,applyBattleResult,
  validateScenario,seedScenario,checkObjectives,productionForSettlement,simulateSettlementDay} from '../src/index.js';

test('seeded randomness repeats, uses distinct derived seeds, emits valid bounds',()=>{
  const a=seededRandom('216-bce'),b=seededRandom('216-bce');
  const v=Array.from({length:20},()=>a.integer(1,15));
  assert.deepEqual(v,Array.from({length:20},()=>b.integer(1,15)));
  assert.ok(v.every(x=>x>=1&&x<=15));
  assert.notEqual(deriveSeed(22,1,'enemy','a'),deriveSeed(22,1,'enemy','b'));
  assert.equal(hash32('a'),hash32('a'));
});
test('atomic resource spend does not partially consume or create currencies',()=>{
  const start={wood:50,stone:5,gold:90};
  assert.deepEqual(purchase(start,{wood:15,stone:6}),{ok:false,reason:'insufficient:stone',wallet:start});
  assert.deepEqual(start,{wood:50,stone:5,gold:90});
  assert.deepEqual(purchase(start,{wood:15,stone:2}).wallet,{wood:35,stone:3,gold:90});
  assert.equal(applyTransaction(start,{iron:3}).reason,'unknown:iron');
  assert.equal(forecast({wood:50},{wood:-3},10).wallet.wood,20);
  assert.throws(()=>purchase(start,{stone:Infinity}));
});
test('province road routing respects blockade, cost and time',()=>{
 const roads=[{from:'rome',to:'capua',cost:4},{from:'capua',to:'canusium',cost:3,id:'campanian-road'},
 {from:'rome',to:'canusium',cost:10}];
 assert.deepEqual(findRoute(roads,'rome','canusium'),{path:['rome','capua','canusium'],cost:7});
 assert.deepEqual(findRoute(roads,'rome','canusium',{blocked:['campanian-road']}),{path:['rome','canusium'],cost:10});
 assert.equal(marchProgress({departAt:3,arriveAt:7},5),.5);
 assert.deepEqual(interpolateCoordinates({x:0,y:4},{x:10,y:10},.5),{x:5,y:7});
});
test('map projections round-trip, no false map archaeology confidence',()=>{
 const italy={lon:16.15,lat:41.29};let web=lonLatToWebMercator(italy.lon,italy.lat);
 const back=webMercatorToLonLat(web.x,web.y);
 assert.ok(Math.abs(back.lon-italy.lon)<1e-9&&Math.abs(back.lat-italy.lat)<1e-9);
 assert.ok(haversineKm(italy,{lon:16.16,lat:41.29})>.5);
 assert.deepEqual(checkHistoricalPlace({id:'cannae',name:'Cannae',lon:16.15,lat:41.29,validFromBCE:218,confidence:'reconstruction',provenance:{url:'https://pleiades.stoa.org'}}),[]);
});
test('versioned save detects corruption, cross-game misuse and migrations',()=>{
 const written=encodeSave({gameId:'roma',version:1,state:{tick:3,cities:[]}});
 const result=decodeSave(written,{gameId:'roma',currentVersion:2,migrate:{1:s=>({...s,armies:[]})}});
 assert.deepEqual(result.state,{tick:3,cities:[],armies:[]});
 assert.throws(()=>decodeSave(written,{gameId:'medieval',currentVersion:2,migrate:{1:x=>x}}),/another game/);
 assert.throws(()=>decodeSave(written.replace('"tick":3','"tick":4'),{gameId:'roma',currentVersion:1}),/checksum/);
 const map=new Map();const fake={getItem:k=>map.get(k)||null,setItem:(k,v)=>map.set(k,v),removeItem:k=>map.delete(k)};
 const local=browserSaveAdapter(fake,'CUB:ROMA'); local.store('test',written);assert.equal(local.load('test'),written);
});
test('turn engine is deterministic, system ordering stable and does not mutate original',()=>{
 const s={tick:0,resources:10,events:[]};const systems=[
  {id:'tax',order:2,apply:(n,{emit})=>{n.resources+=5;emit({kind:'tax',amount:5});}},
  {id:'upkeep',order:1,apply:n=>{n.resources-=2;}}];
 const a=createTurnEngine({initialState:s,systems}),b=createTurnEngine({initialState:s,systems});
 assert.deepEqual(a.advance(4),b.advance(4));
 assert.equal(a.getState().resources,22);assert.equal(s.resources,10);assert.equal(a.getState().events.length,4);
 assert.throws(()=>a.advance(367),/days/);
});
test('battle contract captures city structures and rejects stale/invalid casualty data',()=>{
 const context={schema:'cub.battle.context.v1',battleId:'canusium-7',location:{id:'canusium',lon:16.2,lat:41.3},participants:[
  {armyId:'roma-1',factionId:'rome',soldiers:100},{armyId:'punic-1',factionId:'carthage',soldiers:90}]};
 const city=cityToSiegeContext({settlementId:'canusium',cityPlan:{version:1,structures:[{id:'wall-1',type:'wall',x:2,y:3,completed:true}]},defence:{bonus:.065}});
 context.settlement=city; assert.deepEqual(validateBattleContext(context),[]);
 assert.equal(city.structures[0].tacticalColliderStatus,'NOT_GENERATED');
 const result={schema:'cub.battle.result.v1',battleId:'canusium-7',winnerArmyId:'roma-1',casualties:[
  {armyId:'roma-1',killed:25},{armyId:'punic-1',killed:80}]};
 assert.deepEqual(validateBattleResult(context,result),[]);
 const world={armies:[{id:'roma-1',soldiers:100},{id:'punic-1',soldiers:90}],appliedBattleIds:[]};
 const applied=applyBattleResult(world,context,result);
 assert.equal(applied.ok,true);assert.equal(applied.state.armies[0].soldiers,75);
 const duplicate=applyBattleResult(applied.state,context,result);
 assert.equal(duplicate.duplicate,true);assert.equal(duplicate.state.armies[0].soldiers,75);
 assert.equal(world.armies[0].soldiers,100);
 assert.match(validateBattleResult(context,{...result,casualties:[{armyId:'roma-1',killed:101},{armyId:'punic-1',killed:0}]}).join(','),/invalid casualties/);
 const stale={...world,armies:[{id:'roma-1',soldiers:99},{id:'punic-1',soldiers:90}]};
 assert.equal(applyBattleResult(stale,context,result).ok,false);
});
test('scenario validation prevents unsupported historical certainty and checks victory conditions',()=>{
 const scenario={schema:'cub.scenario.v1',id:'apulia-216',gameId:'roma',title:'Cannae provisions',start:{wallet:{grain:20},settlements:{canusium:{owner:'rome'}},armies:[]},truthStatus:'reconstruction',sources:['Polybius III'],objectives:[{id:'supply',kind:'resource',resource:'grain',minimum:20}]};
 assert.deepEqual(validateScenario(scenario),[]);
 const state=seedScenario(scenario); assert.equal(state.scenarioId,'apulia-216');assert.equal(state.wallet.grain,20);
 assert.deepEqual(checkObjectives(scenario.objectives,state),[{id:'supply',achieved:true}]);
 assert.ok(validateScenario({...scenario,truthStatus:'historical',sources:[]}).length>0);
});
test('settlement production and consumption are honest and deterministic',()=>{
 const defs={farm:{produces:{food:7}},granary:{produces:{food:2},consumes:{gold:1}}};
 const s={wallet:{food:3,gold:5},buildings:{farm:2,granary:1}};
 const day=simulateSettlementDay(s,defs,1);
 assert.equal(day.ok,true);assert.deepEqual(day.settlement.wallet,{food:19,gold:4});
 assert.deepEqual(productionForSettlement(s,defs),{food:16,gold:-1});
 assert.deepEqual(s.wallet,{food:3,gold:5});
 const trouble=simulateSettlementDay({...s,wallet:{food:3,gold:0}},defs,2);
 assert.equal(trouble.ok,false);assert.equal(trouble.settlement.wallet.gold,0);
});

test('all three historical scenario files validate with truth and source labels', async () => {
 const fs=await import('node:fs');const path=await import('node:path');const {fileURLToPath}=await import('node:url');
 const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..','scenarios');
 const names=fs.readdirSync(root).filter(x=>x.endsWith('.json'));assert.equal(names.length,3);
 for(const name of names){const s=JSON.parse(fs.readFileSync(path.join(root,name),'utf8'));
  assert.deepEqual(validateScenario(s),[],`${name} scenario invalid`);assert.equal(seedScenario(s).gameId,s.gameId);
 }
});

test('scenario cannot override canonical game identity or launch tick', () => {
 const bogus={schema:'cub.scenario.v1',id:'first',gameId:'roma',title:'Bogus',truthStatus:'fiction',
   start:{tick:5000, gameId:'another-game',wallet:{}},sources:[]};
 assert.throws(()=>seedScenario(bogus),/reserved key/);
});