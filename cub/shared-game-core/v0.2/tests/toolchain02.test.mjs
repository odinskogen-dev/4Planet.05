import test from 'node:test';
import assert from 'node:assert/strict';
import { makeTerrain,passable,findTacticalPath,changeGate,damageStructure,cityPlanToSiegeGrid,
 planProvinceConstruction,marchArmy,advanceStrategyTurn,transferResources,
 validateClip,sampleClip,selectCharacterLOD,phaseForActor,evaluateBudgets,summarizeBenchmark,validateFaction } from '../src/index.js';

test('siege gates block paths, opening them enables movement, and destruction is reflected',()=>{
  const terrain=makeTerrain({width:7,height:5,
    cells:Array.from({length:7},(_,x)=>({x,y:0,kind:'water'})),
    structures:Array.from({length:5},(_,y)=>({id:y===2?'main-gate':`wall-${y}`,type:y===2?'gate':'wall',x:3,y,hp:100}))});
  assert.equal(findTacticalPath(terrain,{x:1,y:2},{x:5,y:2}),null);
  const opened=changeGate(terrain,'main-gate',true);
  assert.equal(findTacticalPath(opened,{x:1,y:2},{x:5,y:2}).path.some(p=>p.x===3&&p.y===2),true);
  assert.equal(terrain.structures.find(s=>s.id==='main-gate').open,false);
  const breached=damageStructure(terrain,'wall-1',130);
  assert.equal(breached.structures.find(s=>s.id==='wall-1').destroyed,true);
  assert.equal(passable(breached,3,1),true);
});

test('siege paths respect terrain class, elevation and unit types',()=>{
 const t=makeTerrain({width:6,height:5,cells:[{x:1,y:1,kind:'forest'},{x:2,y:2,kind:'hill',elevation:9},{x:3,y:1,kind:'water'}]});
 assert.equal(passable(t,1,1,'cavalry'),false);
 assert.equal(passable(t,1,1,'infantry'),true);
 assert.equal(passable(t,3,1),false);
 const p=findTacticalPath(t,{x:0,y:2},{x:4,y:2},{maxSlope:4});
 assert.ok(p&&p.path.every(c=>!(c.x===2&&c.y===2)));
 assert.throws(()=>findTacticalPath(t,{x:0,y:2},{x:99,y:2}),/Invalid path endpoints/);
});

test('city plan structures project to colliders and leave original plan untouched',()=>{
 const plan={structures:[{id:'w1',type:'fort',x:2,y:4,completed:true},{id:'t1',type:'watchtower',x:2,y:3,completed:false}]};
 const t=cityPlanToSiegeGrid(plan);
 assert.equal(t.structures.length,1);assert.equal(t.structures[0].type,'wall');
 assert.equal(passable(t,2,4),false);assert.equal(plan.structures[0].type,'fort');
});

test('province funds and resources transfer atomically; no negative or cross-faction transfer',()=>{
 const world={turn:0,factions:{rome:{wallet:{wood:60,stone:20,gold:90}},carthage:{wallet:{gold:40}}},
  provinces:{canusium:{owner:'rome',buildings:{},stockpile:{grain:80}},cannae:{owner:'rome',buildings:{},stockpile:{grain:0}},
    tarentum:{owner:'carthage',buildings:{},stockpile:{grain:40}}},armies:[]};
 const built=planProvinceConstruction(world,{provinceId:'canusium',buildingId:'farm',cost:{wood:20,gold:45}});
 assert.equal(built.ok,true);assert.equal(built.state.provinces.canusium.buildings.farm,1);assert.equal(world.factions.rome.wallet.wood,60);
 const unpayable=planProvinceConstruction(world,{provinceId:'canusium',buildingId:'farm',cost:{wood:999}});
 assert.equal(unpayable.ok,false);assert.equal(world.provinces.canusium.buildings.farm,undefined);
 const roads=[{from:'canusium',to:'cannae',cost:2},{from:'canusium',to:'tarentum',cost:2}];
 const moved=transferResources(world,{from:'canusium',to:'cannae',resources:{grain:20},roads});
 assert.equal(moved.ok,true);assert.equal(moved.state.provinces.canusium.stockpile.grain,60);
 assert.equal(moved.state.provinces.cannae.stockpile.grain,20);
 assert.equal(transferResources(world,{from:'canusium',to:'tarentum',resources:{grain:1},roads}).ok,false);
 assert.equal(transferResources(world,{from:'canusium',to:'cannae',resources:{grain:81},roads}).ok,false);
 assert.equal(validateFaction({id:'rome',name:'Roman Republic',form:'sovereign'}).length,0);
});

test('army supply, winter travel and arrival resolve from deterministic turn counts',()=>{
 const roads=[{from:'canusium',to:'venusia',cost:3},{from:'venusia',to:'capua',cost:2}];
 const w={turn:0,armies:[{id:'roman-1',province:'canusium',supplies:250,soldiers:3000,march:null}]};
 const sent=marchArmy(w,{armyId:'roman-1',target:'capua',roads,weather:'winter'});
 assert.equal(sent.ok,true);assert.equal(sent.days,8);assert.equal(sent.supplyCost,48);
 assert.equal(w.armies[0].supplies,250);
 let state=sent.state;for(let i=0;i<7;i++)state=advanceStrategyTurn(state);
 assert.equal(state.armies[0].province,'canusium');state=advanceStrategyTurn(state);
 assert.equal(state.armies[0].province,'capua');assert.equal(state.armies[0].march,null);
 assert.equal(marchArmy({...w,armies:[{...w.armies[0],supplies:1}]},{armyId:'roman-1',target:'capua',roads,weather:'winter'}).reason,'insufficient supplies');
});

test('animation metadata interpolation and mobile-friendly LOD are deterministic',()=>{
 const clip={id:'horse-idle-proxy',duration:1,frames:[{t:0,pose:{neck:0,hoof:0}},{t:1,pose:{neck:20,hoof:15}}]};
 assert.equal(validateClip(clip),true);
 assert.deepEqual(sampleClip(clip,.5).pose,{neck:10,hoof:7.5});
 assert.deepEqual(sampleClip(clip,1.5).pose,{neck:10,hoof:7.5});
 assert.equal(selectCharacterLOD({distance:80}),'impostor');
 assert.equal(selectCharacterLOD({distance:10}),'full');
 assert.equal(selectCharacterLOD({distance:500}),'culled');
 assert.equal(phaseForActor('soldier-5',7),phaseForActor('soldier-5',7));
 assert.throws(()=>validateClip({...clip,frames:[{t:1,pose:{}},{t:0,pose:{}}]}));
});

test('QA budgets distinguish missing measurements from passes and detect p95',()=>{
 let r=evaluateBudgets({frameP95Ms:34,drawCalls:35,triangles:190000,textureMB:30});
 assert.equal(r.pass,false);assert.equal(r.checks.filter(x=>x.status==='fail').length,2);
 assert.equal(evaluateBudgets({drawCalls:30}).checks.find(x=>x.metric==='frameP95Ms').status,'missing');
 assert.equal(summarizeBenchmark([10,12,14,16,18]).p95,18);
});