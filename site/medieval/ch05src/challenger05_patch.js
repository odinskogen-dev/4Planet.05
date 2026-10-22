/* CUB GAME LAB — MEDIEVAL KINGDOMS CHALLENGER 05
   KINGDOMS AT WAR · 2026-10-22
   Derived gameplay through ROMA's original worker/building/training/navigation systems.
   Build03/04 source remains immutable. Assets and armour are still historically approximate.
*/
let MK05_RTS=false;
const MK05_VERSION='ch05-kingdoms-at-war-01';
const MK05_RESOURCE_START={food:760,wood:590,stone:370,iron:230,coin:190};
const MK05_MAP_MODES=new Set(['hattin-sandbox','belvoir-siege','northern-marches']);
const MK05_BUILDING_NAMES={forum:['Town Centre','Civic hall: recruits workers, stores materials, controls nearby lands.'],domus:['House','Extends population capacity.'],farm:['Farm','Employ villagers to grow food.'],horreum:['Granary','Shortens the food delivery journey.'],lumber:['Lumber Camp','Shortens the wood delivery journey.'],quarry:['Stone Quarry','Shortens the stone and iron delivery journey.'],macellum:['Market','Produces coins and supports trade.'],barracks:['Infantry Barracks','Recruit medieval foot soldiers, spearmen and crossbowmen.'],stables:['Stables','Raise armoured knights and mounted archers.'],fabrica:['Smithy','Research upgrades for armour and weapons.'],temple:['Chapel','Provides morale support to nearby troops.'],tower:['Defensive Tower','Fires against enemy units and extends territory.'],wall:['Stone Curtain Wall','Defensive masonry barrier with collision.'],gate:['Castle Gate','Allows friendly units to pass through a wall.'],castra:['Fortified Field Camp','Build a forward base, garrison troops, and recruit infantry.'],palisade:['Timber Palisade','Affordable wooden fortification.'],punic_hq:['Enemy Town Centre','Enemy economy headquarters.'],punic_barracks:['Enemy Barracks','Produces opposing infantry.'],punic_stables:['Enemy Stables','Produces opposing cavalry.'],punic_tent:['Enemy Houses','Enemy population capacity.'],citadel:['Stone Stronghold','Defensive objective: capture and defend.']};
for(const [id,[name,description]] of Object.entries(MK05_BUILDING_NAMES)) if(tA[id]){tA[id].name=name;tA[id].latin='';tA[id].desc=description;}
// Only this derivative uses medieval faction identities; original source remains unchanged.
for(const id of ['hastati','principes','triarii','velites','equites','libyans','iberians','gauls','balearics','numidians','iberian_cav']) if(LA[id])LA[id].faction='any';
const MK05_STATS={created:0,enemyBuilds:0,enemyRecruits:0};
function mk05WorkerIDs(sim,owner){return [...sim.units.values()].filter(u=>u.alive&&u.owner===owner&&u.type==='worker').map(u=>u.id)}
function mk05FindNode(sim,worker,kind,maxRadius=330){const acceptable=kind==='wood'?['tree']:kind==='food'?['forage']:kind==='stone'?['stone']:['iron'];let best=null,dist=maxRadius;for(const n of sim.nodes.values()){if(n.amount<=0||!acceptable.includes(n.kind))continue;const d=Math.hypot(n.x-worker.x,n.z-worker.z);if(d<dist){best=n;dist=d}}return best}
function mk05AssignGather(sim,worker,resource){const n=mk05FindNode(sim,worker,resource);if(!n)return false;sim.workersGather([worker.id],n.id);return true}
function mk05GrantEconomy(sim){
 const map=MK04_ENGINE.current(); if(!MK05_RTS||!MK05_MAP_MODES.has(map.id))return;
 sim.mk05={rts:true,mapId:map.id,captured:false,castleControl:0,lastEconomicTick:0,castleBonusT:0,castleFortId:null,enemyBuildT:0};
 sim.players[1].res={...MK05_RESOURCE_START};sim.players[2].res={food:650,wood:530,stone:370,iron:240,coin:150};
 // The medieval scenario uses all existing ROMA economy primitives: buildings,
 // workers, drop-off points, resource nodes, training queues and build validation.
 // Place bases away from existing formation spawn points.
 const siege=map.id==='belvoir-siege';const marches=map.id==='northern-marches';
 const p={x:siege?-575:-680,z:siege?75:-720};
 const e={x:siege?-155:-180,z:siege?-115:65};
 sim._spawnBuilding(1,'forum',p.x,p.z,0,true);
 sim._spawnBuilding(1,'domus',p.x+34,p.z-10,0,true);
 sim._spawnBuilding(1,'barracks',p.x+45,p.z+38,0,true);
 sim._spawnBuilding(1,'farm',p.x-37,p.z+16,0,true);
 sim._spawnBuilding(1,'lumber',p.x-48,p.z-38,0,true);
 sim._spawnBuilding(2,'punic_hq',e.x,e.z,0,true);
 sim._spawnBuilding(2,'punic_tent',e.x-38,e.z+4,0,true);
 sim._spawnBuilding(2,'punic_barracks',e.x+42,e.z+42,0,true);
 sim._spawnBuilding(2,'punic_stables',e.x-42,e.z-35,0,true);
 sim.mk05.base={...p};sim.mk05.enemyBase={...e};
 const workers=10;for(let i=0;i<workers;i++)sim.spawnWorker(1,p.x+(i%5-2)*4,p.z-23+Math.floor(i/5)*4);
 for(let i=0;i<8;i++)sim.spawnWorker(2,e.x+(i%4-2)*4,e.z+22+Math.floor(i/4)*4);
 for(const [owner,names] of [[1,['wood','wood','wood','stone','stone','food','food','food','iron','wood']],[2,['wood','wood','stone','food','food','iron','wood','stone']]]){
   const villagers=[...sim.units.values()].filter(u=>u.alive&&u.type==='worker'&&u.owner===owner);
   for(let i=0;i<villagers.length;i++)mk05AssignGather(sim,villagers[i],names[i]||'food');
 }
 // Keep buildings interactively functional and make the central castle a meaningful objective.
 const fort=map.fortress;
 if(fort){let nearest=null,dist=Infinity;for(const b of sim.buildings.values()){
   if(b.type!=='tower'||b.owner!==fort.owner)continue;
   const d=Math.hypot(b.x-fort.x,b.z-fort.z);if(d<dist){nearest=b;dist=d}
 }sim.mk05.castleFortId=nearest?.id||null;}
 sim.recomputePop();sim._exploreCircle(p.x,p.z,350);sim._exploreCircle(map.fortress?.x||-350,map.fortress?.z||-320,135);sim._updateFog();
 sim.ai=new MK05EconomyAI(sim,2);
 sim.msg('KINGDOMS AT WAR · Workers gather resources. Construct bases, recruit regiments and secure the castle.','good');
 MK05_STATS.created++;
}
const mk05SetupOriginal=Wi.prototype._setupScenario;
Wi.prototype._setupScenario=function(...args){const value=mk05SetupOriginal.apply(this,args);mk05GrantEconomy(this);return value};

// Preserve ROMA's proper resource consumption, building work, and train queues.
// An economic AI acts in the same economy, rather than conjuring battle units for free.
class MK05EconomyAI extends MKBattleAI{
 constructor(sim,owner=2){super(sim,owner);this.lastProduction=0;this.lastGather=0;this.firstAttack=95;this.productionIndex=0;this.lastCastleDefence=0;}
 serialize(){return {...super.serialize(),lastProduction:this.lastProduction,lastGather:this.lastGather,productionIndex:this.productionIndex}}
 deserialize(v){super.deserialize(v);if(v){this.lastProduction=v.lastProduction||0;this.lastGather=v.lastGather||0;this.productionIndex=v.productionIndex||0}}
 think(dt){const sim=this.sim;this.time+=dt;
   if(!sim.mk05||sim.outcome)return;
   if(this.time-this.lastGather>=7){this.lastGather=this.time;
     for(const w of sim.units.values())if(w.alive&&w.owner===2&&w.type==='worker'&&(!w.task||w.task.kind==='idle')){
       const r=['wood','food','stone','food','iron'][w.id%5];mk05AssignGather(sim,w,r);
     }
   }
   if(this.time-this.lastProduction>=14){this.lastProduction=this.time;
     const buildings=[...sim.buildings.values()].filter(b=>b.owner===2&&b.done);
     if(this.time>25&&this.productionIndex===0){
       const h=sim.mk05.enemyBase,b=this._tryBuild('punic_tent',h.x-50,h.z+42);
       if(b)this.productionIndex++;
     }
     const barracks=buildings.find(b=>b.type==='punic_barracks');
     const stables=buildings.find(b=>b.type==='punic_stables');
     const unit=this.productionIndex%4===0?'balearics':this.productionIndex%3===0?'gauls':'libyans';
     const source=(this.productionIndex%5===0&&stables)?stables:barracks;
     const type=source===stables?'numidians':unit;
     if(source&&source.queue.length<2){const r=sim.train(source.id,type);if(r.ok){MK05_STATS.enemyRecruits++;this.productionIndex++}}
     if(this.time>70&&this.time<450&&this.productionIndex%7===0){const h=sim.mk05.enemyBase;this._tryBuild('tower',h.x-45,h.z+65)}
   }
   // Give the player time to develop an economy; early troops defend the castle.
   if(this.time<this.firstAttack){if(this.time-this.lastCastleDefence>14){this.lastCastleDefence=this.time;
     for(const r of sim.regiments.values())if(r.owner===2&&r.units.length&&r.order.kind==='idle')r.order={kind:'hold'};
   }return;}
   // Existing tactical behaviour remains the combat authority.
   super.think(dt);
 }
 _tryBuild(type,x,z){const s=this.sim;for(const [dx,dz] of [[0,0],[25,0],[0,25],[-25,0],[0,-25],[40,40]]){
   const xx=x+dx,zz=z+dz;const check=s.validatePlacement(2,type,xx,zz,0);
   if(!check.ok)continue;const result=s.placeBuilding(2,type,xx,zz,0);
   if(result.ok){MK05_STATS.enemyBuilds++;return result.building;}
 }return null}
}

// Capturing the stone stronghold is now a live simulation objective, not just scenery.
const mk05PreviousOutcome=Wi.prototype._checkOutcome;
Wi.prototype._checkOutcome=function(){
 if(!this.mk05?.rts)return mk05PreviousOutcome.call(this);
 if(this.outcome)return;
 const cfg=MK04_ENGINE.current(),fort=cfg.fortress;
 const friendly=[...this.regiments.values()].filter(r=>r.owner===1&&r.units.length>1&&r.state!=='routing');
 const enemy=[...this.regiments.values()].filter(r=>r.owner===2&&r.units.length>1&&r.state!=='routing');
 const hqOwner=owner=>[...this.buildings.values()].some(b=>b.owner===owner&&b.done&&(b.type==='forum'||b.type==='punic_hq'));
 if(!friendly.length&&!hqOwner(1))return this._mkFinish('defeat','You lost your settlement and military force.');
 if(fort){
    const tower=this.buildings.get(this.mk05.castleFortId);
    const near=owner=>[...this.regiments.values()].filter(r=>r.owner===owner&&r.units.length>5&&r.state!=='routing'&&Math.hypot(r.x-fort.x,r.z-fort.z)<105).length;
    const defenders=near(2),attackers=near(1);
    const towerDisabled=!tower||tower.hp<=0||tower.owner===1;
    if(!this.mk05.captured&&towerDisabled&&attackers>=1&&defenders===0){
       this.mk05.castleControl+=40*Fi;
       if(this.mk05.castleControl>15){this.mk05.captured=true;this.msg('STONE CASTLE CAPTURED — You now control the stronghold and its stores.','good');this.events.push({type:'castle_captured',x:fort.x,z:fort.z});if(tower){tower.owner=1;tower.hp=Math.max(tower.hp,250)} }
    } else if(!this.mk05.captured)this.mk05.castleControl=Math.max(0,this.mk05.castleControl-20*Fi);
    // A conquered castle provides stone, food, coins. It is worth the effort.
    if(this.mk05.captured&&this.time-this.mk05.castleBonusT>12){this.mk05.castleBonusT=this.time;this.players[1].res.stone+=12;this.players[1].res.food+=18;this.players[1].res.coin+=7}
 }
 if(this.mk05.captured&&!hqOwner(2))return this._mkFinish('victory','Castle secured and enemy town conquered. Your kingdom prevails.');
 if(!hqOwner(1)&&!friendly.length)return this._mkFinish('defeat','Your kingdom has fallen.');
 if(this.time>1800)this._mkFinish('draw','Nightfall. The war continues.');
};
// Original simulation save includes units, buildings, queues and workers.
const mk05Serialize=Wi.prototype.serialize;
Wi.prototype.serialize=function(...args){const state=mk05Serialize.apply(this,args);state.mk05=this.mk05?{...this.mk05}:null;return state};
const mk05Deserialize=Wi.deserialize;
Wi.deserialize=function(d,...args){const sim=mk05Deserialize.call(this,d,...args);if(d?.mk05?.rts){sim.mk05={...d.mk05};MK05_RTS=true;sim.ai=new MK05EconomyAI(sim,2)}return sim};

// Flag must be set before the source simulation is constructed.
const mk05NewGame=Q0.prototype.newGame;
Q0.prototype.newGame=function(side='jerusalem'){
 MK05_RTS=['sandbox','marches','siege','kingdoms'].includes(side);
 const result=mk05NewGame.call(this,side==='kingdoms'?'sandbox':side);
 if(MK05_RTS){this.hud.root.classList.remove('faded');this.hud.renderRes(true);MK05_UI.show();}
 else MK05_UI.hide();
 return result;
};
const mk05Continue=Q0.prototype.continueGame;
Q0.prototype.continueGame=function(...args){const v=mk05Continue.apply(this,args);if(v){MK05_RTS=!!this.sim?.mk05?.rts;MK05_RTS?MK05_UI.show():MK05_UI.hide()}return v};
const mk05Title=Q0.prototype.showTitle;
Q0.prototype.showTitle=function(...args){MK05_UI.hide();const result=mk05Title.apply(this,args);
 const choices=document.querySelector('.mk-choices');if(choices){
   const btn=document.createElement('button');btn.className='mk-choice';btn.innerHTML='<small>CHALLENGER 05 · NEW</small><strong>KINGDOMS AT WAR</strong><span>Villagers, resources, construction, recruiting and castle conquest.</span><b>BUILD YOUR KINGDOM ↗</b>';
   btn.addEventListener('click',()=>this.newGame('kingdoms'));choices.prepend(btn);
   const others=[...choices.querySelectorAll('button')];for(const b of others){if(/HATTIN — CASTLE SANDBOX/.test(b.textContent))b.querySelector('span').textContent='Economic sandbox: build, recruit and conquer the castle.'}
 }
 return result;
};

const MK05_UI={root:null,ticker:0,
 init(){if(this.root)return;const el=document.createElement('div');el.id='mk05ui';el.className='mk05-hidden';
 el.innerHTML='<div class="mk05-ledger" aria-label="Kingdom resources"><span>FOOD <b data-mk05-res="food">0</b></span><span>WOOD <b data-mk05-res="wood">0</b></span><span>STONE <b data-mk05-res="stone">0</b></span><span>IRON <b data-mk05-res="iron">0</b></span><span>COINS <b data-mk05-res="coin">0</b></span></div><div class="mk05-actions"><button data-mk05="build">BUILD</button><button data-mk05="workers">WORKERS</button><button data-mk05="army">ARMY</button><button data-mk05="castle">CASTLE</button></div><div class="mk05-banner" id="mk05-banner"></div>';
 document.body.appendChild(el);this.root=el;
 el.addEventListener('pointerdown',e=>e.stopPropagation());
 el.querySelectorAll('[data-mk05]').forEach(b=>b.addEventListener('click',()=>{const app=window.ROMA?.app;if(!app?.playing)return;
  switch(b.dataset.mk05){
   case 'build':app.hud.toggleBuild();break;
   case 'workers':app.ctl.selectWorkers(mk05WorkerIDs(app.sim,1));app.hud.toast('Workers selected · tap resources to gather, or use BUILD','info');break;
   case 'army':app.ctl.selectAllArmy();break;
   case 'castle':{const fort=MK04_ENGINE.current().fortress;if(fort){app.view.cam.jumpTo(fort.x,fort.z,130);app.hud.toast('Defeat the defenders, breach the keep, then occupy it to capture the castle','info')}}break;
  }
 }));
 this.ticker=setInterval(()=>this.draw(),480);
 },
 show(){this.init();this.root.classList.remove('mk05-hidden');document.body.classList.add('mk05-rts');this.draw()},
 hide(){this.root?.classList.add('mk05-hidden');document.body.classList.remove('mk05-rts');document.querySelector('#buildmenu')?.classList.add('hidden')},
 draw(){const app=window.ROMA?.app;if(!app?.playing||!MK05_RTS||!app.sim.mk05){if(!MK05_RTS)this.hide();return;}
 const s=app.sim;for(const [type,value] of Object.entries(s.players[1].res)){const n=this.root.querySelector('[data-mk05-res="'+type+'"]');if(n)n.textContent=Math.floor(value)}
 const f=MK04_ENGINE.current().fortress,banner=this.root.querySelector('#mk05-banner');if(f){
   if(s.mk05.captured){banner.textContent='CASTLE SECURED · + FOOD / STONE / COINS';banner.classList.add('mk05-owned')}
   else {const tower=s.buildings.get(s.mk05.castleFortId);const hp=tower?Math.max(0,Math.round(tower.hp/tower.maxHp*100)):0;
   banner.textContent='ENEMY CASTLE · KEEP '+hp+'% · CONTROL '+Math.round(s.mk05.castleControl/15*100)+'%';banner.classList.remove('mk05-owned')}
 }else banner.textContent='BUILD · RECRUIT · CONQUER';
 }
};
queueMicrotask(()=>MK05_UI.init());
window.MEDIEVAL_KINGDOMS_05={version:MK05_VERSION,gameState:()=>{const s=window.ROMA?.sim;return {map:MK04_ENGINE.current().id,rts:MK05_RTS,resources:s?.players[1]?.res,workers:mk05WorkerIDs(s||{units:new Map},1).length,buildings:s?.buildings.size,regiments:s?.regiments.size,captured:!!s?.mk05?.captured,castleControl:s?.mk05?.castleControl,enemyBuilds:MK05_STATS.enemyBuilds,enemyRecruits:MK05_STATS.enemyRecruits}}};
