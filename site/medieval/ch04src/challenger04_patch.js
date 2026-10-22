/* CUB GAME LAB — MEDIEVAL KINGDOMS CHALLENGER 04
 * MAP FACTORY 01 + ARMY FACTORY 01; isolated ROMA-derived candidate.
 * 1187 costumes are research-informed procedural approximations, NOT verified reconstruction.
 * World geography is procedural and specifically NOT sourced elevation data.
 */
let MK04_MAP='hattin-historical', MK04_BALANCE='balanced';
const MK04_MAPS=Object.freeze({
 'hattin-historical':{
  id:'hattin-historical',title:'HATTIN — HISTORICAL',era:1187,region:'Galilee',status:'historically inspired topology; DEM pending',
  terrain:{seed:1187,base:31,roughness:2.6,grass:.065,hills:[[-285,-310,97,83,62],[-117,-325,80,71,52]],rockiness:.8},
  fortress:null,allowCastles:false,armies:'hattin',objectives:['spring','break_army'],references:['Met Museum Medieval Arms and Armor','Battle of Hattin historiography']},
 'hattin-sandbox':{
  id:'hattin-sandbox',title:'HATTIN — CASTLE SANDBOX',era:1187,region:'Galilee / alternative history',status:'fictional tactical sandbox',
  terrain:{seed:1187,base:31,roughness:2.6,grass:.075,hills:[[-285,-310,97,83,62],[-117,-325,80,71,52]],rockiness:.8},
  fortress:{type:'field-keep',x:-395,z:-342,half:23,owner:2},allowCastles:true,armies:'hattin',objectives:['break_army'],references:[]},
 'belvoir-siege':{
  id:'belvoir-siege',title:'BELVOIR — SIEGE LAB',era:1188,region:'Jordan Valley',status:'castle schematic prototype, not archaeological plan',
  terrain:{seed:1188,base:26,roughness:3,grass:.1,hills:[[-320,-290,230,220,36],[-640,-200,150,220,22]],rockiness:.6},
  fortress:{type:'belvoir-prototype',x:-326,z:-280,half:60,owner:2},allowCastles:true,armies:'siege',objectives:['capture_castle'],references:['Belvoir Castle archaeological history']},
 'northern-marches':{
  id:'northern-marches',title:'NORTHERN MARCHES — SANDBOX',era:1190,region:'Fictional European uplands',status:'fictional procedural terrain and war game test',
  terrain:{seed:1190,base:37,roughness:5.8,grass:.55,hills:[[-470,-285,130,160,54],[-80,-280,160,140,63],[145,-130,190,250,38]],rockiness:.5},
  fortress:{type:'border-keep',x:-335,z:-365,half:28,owner:2},allowCastles:true,armies:'hattin',objectives:['break_army'],references:[]}
});
const MK04_ENGINE={
 select(id){if(!MK04_MAPS[id])throw Error('Unknown MAP FACTORY id '+id);MK04_MAP=id;return this.current()},
 current(){return MK04_MAPS[MK04_MAP]},
 list(){return Object.values(MK04_MAPS).map(m=>({id:m.id,title:m.title,era:m.era,region:m.region,status:m.status}))},
 validate(m){if(!m||!m.id||!m.terrain||!m.armies||!Array.isArray(m.terrain.hills))throw Error('Invalid map blueprint');
  for(const h of m.terrain.hills)if(h.length!==5||h.some(v=>!Number.isFinite(v)))throw Error('Invalid map hill');return true}
};
for(const m of Object.values(MK04_MAPS)) MK04_ENGINE.validate(m);
const mk04OriginalHeight=og.prototype.height;
const mk04OriginalForest=og.prototype.forest;
og.prototype.height=function(x,z){
 const t=MK04_ENGINE.current().terrain,n=this.noise;
 let h=t.base+n.fbm(x/385+11.5,z/375-9.4,3)*t.roughness*2+n.fbm(x/115,z/110,2)*t.roughness*.55;
 for(const [cx,cz,rx,rz,amp] of t.hills){const a=((x-cx)/rx)**2+((z-cz)/rz)**2;h+=amp*Math.exp(-a*1.13)}
 h+=this.noise2.ridged(x/156+13,z/168-7,3)*t.roughness*2.2;
 return Math.max(8,h);
};
og.prototype.forest=function(x,z){const t=MK04_ENGINE.current().terrain;return Math.max(.008,t.grass+.05*this.noise2.fbm(x/295,z/305,2))};
// The original ROMA river belongs to Apulia, not Galilee or Northern Marches.
og.prototype.riverInfo=function(){return {d:10000,s:0,side:1}};
og.prototype.riverHalfWidth=function(){return 0};
og.prototype.waterLevelAtS=function(){return -80};

/* ARMY FACTORY: three performance/balance presets. Regiment counts are gameplay,
   not claims about the uncertain 1187 historic troop totals. */
const MK04_PRESETS=Object.freeze({
 balanced:{extras:6,men:22,morale:0,description:'26 regiments, deliberately balanced'},
 historical:{extras:7,men:24,morale:0,description:'28 regiments, asymmetric composition, NOT historical counts'},
 epic:{extras:11,men:26,morale:0,description:'36 regiments, higher load; desktop recommended'}
});
const mk04SpawnPatterns={
 jerusalem:[['triarii',-638,-585],['hastati',-585,-625],['principes',-525,-652],['velites',-475,-622],['equites',-735,-545],['hastati',-390,-630],['velites',-345,-602],['triarii',-710,-640],['equites',-690,-675],['principes',-420,-675],['velites',-600,-680]],
 ayyubid:[['numidians',-690,-86],['balearics',-570,-40],['iberians',-480,-45],['libyans',-395,-85],['iberian_cav',-260,-95],['gauls',-320,-38],['balearics',-415,-15],['numidians',-735,-120],['libyans',-610,-30],['iberians',-335,3],['iberian_cav',-205,-110]],
 siegeAttack:[['libyans',-175,-22],['balearics',-410,-13],['numidians',-512,28],['iberian_cav',-130,-25],['gauls',-290,22],['libyans',-350,58],['balearics',-230,35],['numidians',-465,80],['iberians',-188,70],['gauls',-317,82],['libyans',-375,102]],
 siegeDefense:[['hastati',-360,-325],['triarii',-295,-323],['velites',-343,-281],['principes',-290,-265],['hastati',-327,-235],['velites',-370,-244],['triarii',-305,-306],['principes',-350,-307],['velites',-312,-342],['hastati',-337,-335],['triarii',-320,-290]]
};
function mk04AddFortress(sim,blueprint){if(!blueprint)return;const {x,z,half,owner}=blueprint;
 if(blueprint.type==='belvoir-prototype')return; // existing tested siege fort preserved
 const make=(type,x,z,angle=0)=>sim._spawnBuilding(owner,type,x,z,angle,true);
 for(let i=-half;i<=half;i+=4){
  make('wall',x+i,z-half,0);
  if(Math.abs(i)>5)make('wall',x+i,z+half,0);
  make('wall',x-half,z+i,Math.PI/2);make('wall',x+half,z+i,Math.PI/2);
 }
 make('gate',x,z+half,0);
 for(const a of [-half,half])for(const b of [-half,half])make('tower',x+a,z+b,0);
 // Keep/tower remains functional ROMA building with health and collision.
 make('tower',x,z,0);
}
const mk04SetupBase=Wi.prototype._setupScenario;
Wi.prototype._setupScenario=function(){
 const ret=mk04SetupBase.call(this),map=MK04_ENGINE.current(),preset=MK04_PRESETS[MK04_BALANCE]||MK04_PRESETS.balanced;
 mk04AddFortress(this,map.fortress);
 const siege=map.armies==='siege';
 const extras=Math.max(0,preset.extras-(siege?0:0));
 const side=MK_SIDE==='jerusalem'?'jerusalem':'ayyubid';
 const left=siege?mk04SpawnPatterns.siegeAttack:mk04SpawnPatterns[side];
 const right=siege?mk04SpawnPatterns.siegeDefense:mk04SpawnPatterns[side==='jerusalem'?'ayyubid':'jerusalem'];
 for(let i=0;i<extras;i++){
  const [t,x,z]=left[i], [u,q,r]=right[i];
  this.spawnRegiment(1,t,x,z,siege?Math.PI:side==='jerusalem'?0:Math.PI,Math.min(preset.men,LA[t].size));
  this.spawnRegiment(2,u,q,r,siege?0:side==='jerusalem'?Math.PI:0,Math.min(preset.men,LA[u].size));
 }
 this.mk04={mapId:map.id,balance:MK04_BALANCE,regiments:this.regiments.size,status:map.status};
 this._exploreCircle(-410,-325,800);this._updateFog();
 return ret;
};
const mk04SaveBase=Wi.prototype.serialize;
Wi.prototype.serialize=function(...args){const data=mk04SaveBase.apply(this,args);data.mk=data.mk||{};data.mk.mapId=MK04_MAP;data.mk.balance=MK04_BALANCE;return data};
const mk04DeserializeBase=Wi.deserialize;
Wi.deserialize=function(data,...args){MK04_ENGINE.select(data?.mk?.mapId&&MK04_MAPS[data.mk.mapId]?data.mk.mapId:'hattin-historical');
 MK04_BALANCE=MK04_PRESETS[data?.mk?.balance]?data.mk.balance:'balanced';const sim=mk04DeserializeBase.call(this,data,...args);sim.mk04={mapId:MK04_MAP,balance:MK04_BALANCE,regiments:sim.regiments.size,status:MK04_ENGINE.current().status};return sim};

/* Units use original ROMA instanced GPU skeletal animation system.
   Clothing and equipment are newly specified 1187-inspired geometry combinations.
   Crossbow is custom mesh attached to arm bone; the rest remains source animated. */
const MK04_STYLES={
 hastati:{tunic:'#d7c3a0',head:'pilos',mail:true,shield:'thureos',weapon:'spear',spearLen:2.55,skin:1,sleeves:true},
 principes:{tunic:'#e0d6bd',head:'pilos',mail:true,shield:'round',weapon:'longsword',skin:2,sleeves:true},
 triarii:{tunic:'#cfbd99',head:'pilos',mail:true,shield:'thureos',weapon:'spear',spearLen:2.9,skin:0,sleeves:true},
 velites:{tunic:'#d9c4a4',head:'cap',mail:false,shield:null,weapon:null,skin:1,sleeves:true,trousers:'#695843'},
 equites:{tunic:'#e6d9bc',head:'boeotian',mail:true,shield:'thureos',weapon:'spear',spearLen:3.1,mounted:true,saddle:'#806849',skin:0},
 libyans:{tunic:'#cdb492',head:'pilos',mail:false,shield:'round',weapon:'spear',spearLen:2.55,trousers:'#7d6b4b',skin:2,sleeves:true},
 iberians:{tunic:'#bfab87',head:'cap',shield:'round',weapon:'longsword',trousers:'#604e3d',skin:1,sleeves:true},
 gauls:{tunic:'#b1a07e',head:'pilos',mail:true,shield:'round',weapon:'spear',spearLen:2.6,trousers:'#6d594b',skin:0,sleeves:true},
 balearics:{tunic:'#d7c19b',head:'cap',shield:null,weapon:'javelin',trousers:'#735f46',skin:2,sleeves:true},
 numidians:{tunic:'#ccb493',head:'cap',shield:null,weapon:'javelin',trousers:'#705a40',mounted:true,saddle:'#8b6b49',skin:1},
 iberian_cav:{tunic:'#cfb08f',head:'pilos',mail:true,shield:'round',weapon:'spear',spearLen:2.8,mounted:true,saddle:'#68533b',skin:2}
};
for(const [type,style] of Object.entries(MK04_STYLES))rr[type]={...rr[type],...style};
Object.assign(Ni,{
 rome:['#ded4b7','#ddd7c9','#bda77b','#9b8d6a','#e0d5b8','#b9a587'],
 rome_velites:['#bcb090','#cbb99d','#e1d3b1'],
 carthage:['#8b8067','#9c8871','#ad997e','#746850','#b6a486','#796b56'],
 gauls:['#8b725b','#726145','#897454'],iberians:['#a38a63','#b5a386','#b99f7e']
});
// Earlier Roman cached meshes are invalid after historical re-equipment.
ci.clear();
const mk04EquipmentBase=A0;
A0=function(spec,lod){
 const basic=mk04EquipmentBase(spec,lod);
 // The crossbow combines wood stock, metal bow, steel string and a wooden bolt.
 if(spec!==rr.velites)return basic;
 const weapon=new Se,parts=[
  [new Mt(.065,.09,.65),'#6b4529',M.WOOD,ne(.1,.24,.0,0,0,0)],
  [new Mt(.66,.055,.08),'#65584c',M.WOOD,ne(.1,.38,.0,0,0,0)],
  [new Mt(.62,.014,.025),'#a7a092',M.METAL,ne(.1,.43,.005,0,0,0)],
  [new Pt(.012,.012,.58,5),'#d0c5aa',M.WOOD,ne(.10,.22,.03,Math.PI/2,0,0)]
 ];
 for(const [shape,color,material,matrix] of parts)weapon.add(shape,{},color,material,{part:FA.hR,post:ac(FA.hR,matrix),tint:0});
 const g=weapon.build(),n=g.attributes.position.count,joints=new Float32Array(n*4),weights=new Float32Array(n*4);
 for(let i=0;i<n;i++){joints[i*4]=g.attributes.aPart.getX(i);weights[i*4]=1}
 g.setAttribute('aJ',new GA(joints,4));g.setAttribute('aW',new GA(weights,4));
 for(const p of ['uv','aMat','aPart'])g.deleteAttribute(p);
 return Ag([basic,g]);
};

const mk04NewGameBase=Q0.prototype.newGame;
Q0.prototype.newGame=function(side='jerusalem'){
 const id=side==='siege'?'belvoir-siege':side==='sandbox'?'hattin-sandbox':side==='marches'?'northern-marches':'hattin-historical';
 MK04_ENGINE.select(id);
 const preset=document.querySelector('#mk04balance');if(preset&&MK04_PRESETS[preset.value])MK04_BALANCE=preset.value;
 return mk04NewGameBase.call(this,side==='sandbox'||side==='marches'?'jerusalem':side);
};
const mk04TitleBase=Q0.prototype.showTitle;
Q0.prototype.showTitle=function(){
 mk04TitleBase.call(this);
 const start=document.querySelector('.mk-start'),choices=document.querySelector('.mk-choices');if(!start||!choices)return;
 const label=document.createElement('label');label.className='mk04-select';label.textContent='BATTLE SCALE  ';
 const pick=document.createElement('select');pick.id='mk04balance';
 for(const [v,d] of Object.entries(MK04_PRESETS)){const o=document.createElement('option');o.value=v;o.textContent=v.toUpperCase()+' · '+d.description;pick.appendChild(o)}
 pick.value=MK04_BALANCE;label.appendChild(pick);
 start.insertBefore(label,choices);
 for(const [id,name,text,argument] of [
   ['hattin-sandbox','HATTIN — CASTLE SANDBOX','Alternative history: keep the fortress and fight for it.','sandbox'],
   ['northern-marches','NORTHERN MARCHES','New terrain preset. European uplands and defended border keep.','marches']]){
  const btn=document.createElement('button');btn.className='mk-choice mk04choice';btn.innerHTML='<small>MAP FACTORY 01</small><strong>'+name+'</strong><span>'+text+'</span><b>PLAY MAP ↗</b>';
  btn.onclick=()=>this.newGame(argument);choices.appendChild(btn);
 }
 const note=document.createElement('p');note.className='mk04-note';note.textContent='CHALLENGER 04 · procedural maps; not surveyed historical DEM · costumes are period-inspired working reconstructions';choices.after(note);
};
const mk04ContinueBase=Q0.prototype.continueGame;
Q0.prototype.continueGame=function(){
 try{const raw=JSON.parse(localStorage.getItem(MK_SAVE)||'null');const info=raw?.state?.mk;
  if(info?.mapId&&MK04_MAPS[info.mapId])MK04_MAP=info.mapId;
  if(info?.balance&&MK04_PRESETS[info.balance])MK04_BALANCE=info.balance;
 }catch{}
 return mk04ContinueBase.call(this);
};
// Expose debug-only specifications without exposing unrelated project state.
try{window.MEDIEVAL_MAP_FACTORY={list:()=>MK04_ENGINE.list(),get:(id)=>MK04_MAPS[id],version:'ch04-map-factory-01'}}catch{}
/* CH04 asset binding: three additional original Kenney CC0 OBJ geometries.
   The original OBJ masters, SHA-256 and source are already present in GAME LAB ASSETS.
   This is visual augmentation; functional gate/wall collision remains ROMA's own.
 */
for(const [name,data] of Object.entries(MK04_EXTRA_KENNEY))MK_REAL_ASSET_GEOMETRY[name]=data;
const mk04PrevSetSim=I0.prototype.setSim;
I0.prototype.setSim=function(...args){
 const result=mk04PrevSetSim.apply(this,args);
 const blueprint=MK04_ENGINE.current().fortress;
 if(!blueprint||!this.sim)return result;
 const {x,z,half}=blueprint;
 const nodes={
  corner:[[-half,-half],[half,-half],[-half,half],[half,half]].map(([dx,dz])=>({x:x+dx,z:z+dz,sx:8,sy:12,sz:8})),
  tower_mid:[[-half,-half],[half,-half],[-half,half],[half,half]].map(([dx,dz])=>({x:x+dx,z:z+dz,sx:9,sy:14,sz:9})),
  stairs:[{x:x-half+13,z:z-half+13,sx:8,sy:5,sz:8,yaw:Math.PI/2},
          {x:x+half-13,z:z+half-13,sx:8,sy:5,sz:8,yaw:-Math.PI/2}]
 };
 for(const [name,places] of Object.entries(nodes)){
  for(let part=0;part<MK_REAL_ASSET_GEOMETRY[name].length;part++){
    const mesh=mkMakeGroup(this.scene,this.sim,name,part,places);
    if(mesh)this._mkPremiumMeshes.push(mesh);
  }
 }
 return result;
};
