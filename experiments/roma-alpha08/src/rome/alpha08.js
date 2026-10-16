import * as T from 'three';
import { BUILDINGS, TROOPS, MAP } from '../rts/config.js';
import { Simulation } from '../rts/simulation.js';
import { WorldView } from '../rts/renderer.js';
import './alpha08.css';


// Grand Italia is opt-in only on the Alpha07 document; other games keep their base map.
MAP.width = 400;
MAP.depth = 360;
const legacyRestore = Simulation.restore;
Simulation.restore = function(data) {
  if(data && Array.isArray(data.explored) && data.explored.length===7200){
    const larger=new Array(200*180).fill(0);
    for(let z=0;z<80;z++) for(let x=0;x<90;x++) larger[z*200+x]=data.explored[z*90+x]||0;
    data={...data,explored:larger};
  }
  return legacyRestore.call(this,data);
};
const baseFrontierStep=Simulation.prototype.step;
Simulation.prototype.step=function(dt){
  if(!this.romaFrontier){
    const sites=[
      {id:'campania',name:'Campania',x:244,z:144,owner:-1,progress:0},
      {id:'apulia',name:'Apulia',x:340,z:264,owner:-1,progress:0},
      {id:'etruria',name:'Etruria',x:210,z:310,owner:-1,progress:0}
    ];
    for(const site of sites)if(!this.territories.some(x=>x.id===site.id))this.territories.push(site);
    const deposits=[
      [206,98,'wood'],[286,110,'wood'],[346,178,'wood'],[300,312,'wood'],
      [230,242,'wood'],[359,302,'wood'],[208,201,'food'],[322,86,'food'],
      [350,224,'food'],[269,307,'food'],[285,167,'stone'],[371,260,'stone'],
      [172,297,'stone'],[234,345,'stone'],[263,263,'iron'],[378,146,'iron'],
      [321,337,'iron'],[204,155,'iron']
    ];
    const occupied=new Set(this.resources.map(r=>r.x+'|'+r.z));
    for(const [x,z,type] of deposits)if(!occupied.has(x+'|'+z))
      this.resources.push({id:this.id++,kind:'resource',type,x,z,radius:type==='wood'?6:3,amount:2500,max:2500});
    this.rebuildNav();
    this.romaFrontier=true;
    this.updateVision();
  }
  return baseFrontierStep.call(this,dt);
};
// Isolated ROMA entry: existing Living Kingdom files are never modified.
const originalSave = 'gamelab:rts-core-01:save:v1';
const romanSave = 'gamelab:roma-cloudflare-alpha08:save:v1';
const realGet = Storage.prototype.getItem;
const realSet = Storage.prototype.setItem;
Storage.prototype.getItem = function(key) {
  return realGet.call(this, key === originalSave ? romanSave : key);
};
Storage.prototype.setItem = function(key, value) {
  return realSet.call(this, key === originalSave ? romanSave : key, value);
};

Object.assign(BUILDINGS.town, { name: 'Forum / Castrum', desc: 'Roman settlement and civic centre.' });
Object.assign(BUILDINGS.house, { name: 'Roman House', desc: 'Homes for settlers and legion recruits.' });
Object.assign(BUILDINGS.farm, { name: 'Roman Farm', desc: 'Harvest grain for people and soldiers.' });
Object.assign(BUILDINGS.market, { name: 'Macellum', desc: 'Sell surplus food and timber for coin.' });
Object.assign(BUILDINGS.barracks, { name: 'Legion Barracks', desc: 'Recruit Roman Republican maniples.' });
Object.assign(BUILDINGS.workshop, { name: 'Siege Workshop', desc: 'Build engines to break fortifications.' });
Object.assign(BUILDINGS.wall, { name: 'Stone Wall', desc: 'Draw defensive stone fortifications.' });
Object.assign(BUILDINGS.gate, { name: 'Fort Gate', desc: 'Allows friendly formations to pass.' });
Object.assign(BUILDINGS.tower, { name: 'Watchtower', desc: 'Guards the castrum and nearby land.' });
BUILDINGS.palisade = {
  name: 'Timber Palisade', cost: { wood: 12 }, size: 2,
  hp: 280, time: 8, desc: 'Affordable wooden stakes; drag to lay a line.'
};
Object.assign(TROOPS.line, {
  name: 'Hastati', short: 'HASTATI', men: 48, models: 48,
  range: 4.3, damage: 21, hp: 240
});
Object.assign(TROOPS.light, {
  name: 'Velites', short: 'VELITES', men: 40, models: 40,
  range: 17, damage: 9
});
Object.assign(TROOPS.cavalry, {
  name: 'Equites', short: 'EQUITES', men: 24, models: 24,
  range: 4
});
Object.assign(TROOPS.artillery, {
  name: 'Siege Engines', short: 'SIEGE', men: 6, models: 6,
  range: 26, damage: 33
});
TROOPS.principes = {
  ...TROOPS.line, name: 'Principes', short: 'PRINCIPES',
  men: 48, models: 48, hp: 295, maxHp: 295,
  damage: 28, morale: 118, time: 31, pop: 5,
  cost: { food: 120, iron: 30, coin: 50 }
};
TROOPS.triarii = {
  ...TROOPS.line, name: 'Triarii', short: 'TRIARII',
  men: 48, models: 48, hp: 345,
  damage: 32, range: 4.7, morale: 135,
  time: 39, speed: 2.8, pop: 6,
  cost: { food: 150, iron: 45, coin: 65 }
};

// Constructions stay in the economy queue while all builders are working.
const originalBuild = Simulation.prototype.build;
Simulation.prototype.build = function(type, x, z, side = 0) {
  const result = originalBuild.call(this, type, x, z, side);
  if (result.error !== 'Builders are busy; wait for construction to finish') return result;
  const reason = this.placement(type, x, z, side);
  if (reason) return { error: reason };
  if (!this.pay(BUILDINGS[type].cost, side)) return { error: 'Insufficient resources' };
  const building = this.addBuilding(type, x, z, side, false);
  this.rebuildNav();
  return { building };
};
const originalWorker = Simulation.prototype.updateWorker;
Simulation.prototype.updateWorker = function(worker, dt) {
  if (worker.hp > 0 && !worker.task && worker.carry < 0.01) {
    const site = this.buildings.find(building =>
      building.side === worker.side && building.hp > 0 &&
      building.progress < 1 &&
      this.workers.filter(w => w.task === building.id && w.hp > 0).length < 3
    );
    if (site) {
      worker.task = site.id;
      worker.phase = 'build';
      worker.path = [];
      worker.repath = 0;
    }
  }
  return originalWorker.call(this, worker, dt);
};
const originalStep = Simulation.prototype.step;
Simulation.prototype.step = function(dt) {
  if (!this.romeStarted && !this.paused && this.time < 0.1) {
    this.addArmy('light', 46, 103, 0);
    this.addArmy('line', 138, 52, 1);
    this.romeStarted = true;
    this.log('Your Velites are ready. Build a camp and secure the crossings.');
  }
  return originalStep.call(this, dt);
};
const originalRestore = Simulation.restore;
Simulation.restore = function(data) {
  const restored = originalRestore.call(this, data);
  restored.romeStarted = true;
  return restored;
};

const originalPeople = WorldView.prototype.makeInstancedPeople;
WorldView.prototype.makeInstancedPeople = function() {
  originalPeople.call(this);
  const gear = [
    ['shield', new T.BoxGeometry(0.56, 0.86, 0.14)],
    ['helmet', new T.SphereGeometry(0.265, 8, 6)],
    ['crest', new T.BoxGeometry(0.14, 0.22, 0.60)]
  ];
  this.romeGear = {};
  for (const [name, geo] of gear) {
    const mesh = new T.InstancedMesh(geo, new T.MeshStandardMaterial({color: 0xffffff, roughness: 0.87}), 1700);
    mesh.instanceMatrix.setUsage(T.DynamicDrawUsage);
    mesh.frustumCulled = false;
    mesh.castShadow = name === 'helmet';
    this.romeGear[name] = mesh;
    this.scene.add(mesh);
  }
  this.romeDummy = new T.Object3D();
};
const originalRenderPeople = WorldView.prototype.updatePeople;
WorldView.prototype.updatePeople = function() {
  originalRenderPeople.call(this);
  const counts = { shield: 0, helmet: 0, crest: 0 };
  const d = this.romeDummy;
  const add = (part, x, y, z, angle, color) => {
    const mesh = this.romeGear[part];
    const index = counts[part]++;
    if (index >= 1700) return;
    d.position.set(x, y, z);
    d.rotation.set(0, angle, 0);
    d.scale.setScalar(1);
    d.updateMatrix();
    mesh.setMatrixAt(index, d.matrix);
    mesh.setColorAt(index, new T.Color(color));
  };
  for (const unit of this.sim.armies) {
    if (unit.hp <= 0 || (unit.side !== 0 && !this.sim.seen(unit))) continue;
    if (this.span > 120) continue;
    const kind = TROOPS[unit.type];
    const count = Math.ceil(kind.models * unit.hp / unit.maxHp);
    const cols = unit.mode === 'column' ? 3 : unit.mode === 'skirmish' ? 5 : 8;
    const spacing = unit.mode === 'skirmish' ? 1.9 : 1;
    for (let i = 0; i < count; i++) {
      const dx = ((i % cols) - (Math.min(cols, count) - 1) / 2) * spacing;
      const dz = (Math.floor(i / cols) - 1) * spacing;
      const x = unit.x + dx * Math.cos(unit.angle) + dz * Math.sin(unit.angle);
      const z = unit.z - dx * Math.sin(unit.angle) + dz * Math.cos(unit.angle);
      const y = 0.5 + Math.exp(-((x - 124) ** 2 / 500 + (z - 107) ** 2 / 900)) * 6 +
        Math.sin(x * 0.047) * 0.65 + Math.cos(z * 0.064) * 0.45;
      const rise = unit.type === 'cavalry' ? 0.8 : 0;
      add('shield', x - 0.35, y + rise + 0.85, z + 0.23, unit.angle, unit.side ? 0x737957 : 0xaa372e);
      add('helmet', x, y + rise + 1.41, z, unit.angle, unit.side ? 0x8a8975 : 0xc5a46a);
      add('crest', x, y + rise + 1.74, z, unit.angle, unit.side ? 0x3c493a : 0xa63e2e);
    }
  }
  for (const [part, mesh] of Object.entries(this.romeGear)) {
    mesh.count = Math.min(counts[part], 1700);
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }
};

const originalBuilding = WorldView.prototype.makeBuilding;
WorldView.prototype.makeBuilding = function(building) {
  if (building.type === 'palisade') {
    const group = new T.Group();
    group.position.set(building.x, 0.5 + Math.sin(building.x * 0.047) * 0.65 + Math.cos(building.z * 0.064) * 0.45, building.z);
    const timber = new T.MeshStandardMaterial({ color: 0x77533a, roughness: 1 });
    const beam = new T.MeshStandardMaterial({ color: 0x4f3829, roughness: 1 });
    for (let x = -2.9; x <= 3; x += 0.57) {
      const post = new T.Mesh(new T.CylinderGeometry(0.22, 0.25, 3.4, 5), timber);
      post.position.set(x, 1.8, 0);
      post.castShadow = true;
      group.add(post);
    }
    for (const y of [0.9, 2.1]) {
      const cross = new T.Mesh(new T.BoxGeometry(6.5, 0.2, 0.24), beam);
      cross.position.set(0, y, -0.23);
      group.add(cross);
    }
    this.scene.add(group);
    this.objects.set(building.id, group);
    return group;
  }
  const group = originalBuilding.call(this, building);
  if (['town', 'barracks', 'market'].includes(building.type)) {
    const r = BUILDINGS[building.type].size;
    const pale = new T.MeshStandardMaterial({color: 0xe1d4b5, roughness: 1});
    const roof = new T.MeshStandardMaterial({color: 0xa95137, roughness: 1});
    for (const x of [-r * 0.48, -r * 0.16, r * 0.16, r * 0.48]) {
      const column = new T.Mesh(new T.CylinderGeometry(0.22, 0.26, 2.75, 8), pale);
      column.position.set(x, 1.4, r * 0.76);
      column.castShadow = true;
      group.add(column);
    }
    const frieze = new T.Mesh(new T.BoxGeometry(r * 1.8, 0.33, 1), roof);
    frieze.position.set(0, 3.0, r * 0.76);
    group.add(frieze);
  }
  return group;
};

const cameraBase = WorldView.prototype.updateCamera;
WorldView.prototype.updateCamera = function() {
  cameraBase.call(this);
  if (this.romeAzimuth === undefined) this.romeAzimuth = 0.5;
  const radius = 102;
  this.camera.position.set(
    this.center.x + Math.sin(this.romeAzimuth) * radius,
    95, this.center.z + Math.cos(this.romeAzimuth) * radius
  );
  this.camera.lookAt(this.center);
  this.camera.updateMatrixWorld();
};
WorldView.prototype.rotate = function(angle) {
  this.romeAzimuth = (this.romeAzimuth + angle + Math.PI * 2) % (2 * Math.PI);
  this.updateCamera();
};

import('../rts/main.js').then(() => {

const world = document.getElementById('world');
const turnControls = document.querySelector('.camera-buttons');
const left = document.createElement('button');
const right = document.createElement('button');
left.textContent = '↶';
right.textContent = '↷';
left.setAttribute('aria-label', 'Rotate camera left');
right.setAttribute('aria-label', 'Rotate camera right');
turnControls.prepend(right);
turnControls.prepend(left);
left.onclick = () => window.rtsDebug?.view.rotate(-Math.PI / 8);
right.onclick = () => window.rtsDebug?.view.rotate(Math.PI / 8);

let active = new Map();
let lastAngle = 0;
let wallOrigin = null;
let wallMoved = false;
const pos = e => {
  const bounds = world.getBoundingClientRect();
  return window.rtsDebug?.view.ground(e.clientX - bounds.left, e.clientY - bounds.top);
};
const buildMode = () => {
  const name = document.getElementById('selection-title')?.textContent || '';
  if (name === 'Place Stone Wall') return 'wall';
  if (name === 'Place Timber Palisade') return 'palisade';
  return null;
};
world.addEventListener('pointerdown', e => {
  active.set(e.pointerId, {x: e.clientX, y: e.clientY});
  if (active.size === 2) {
    const p = [...active.values()];
    lastAngle = Math.atan2(p[0].y - p[1].y, p[0].x - p[1].x);
  }
  if (active.size === 1 && buildMode()) {
    wallOrigin = pos(e);
    wallMoved = false;
    world.setPointerCapture(e.pointerId);
    e.stopImmediatePropagation();
  }
}, true);
world.addEventListener('pointermove', e => {
  if (!active.has(e.pointerId)) return;
  active.set(e.pointerId, {x: e.clientX, y: e.clientY});
  if (active.size === 2) {
    const p = [...active.values()];
    const angle = Math.atan2(p[0].y - p[1].y, p[0].x - p[1].x);
    let delta = angle - lastAngle;
    if (delta > Math.PI) delta -= Math.PI * 2;
    if (delta < -Math.PI) delta += Math.PI * 2;
    if (Math.abs(delta) < 0.6) window.rtsDebug?.view.rotate(delta);
    lastAngle = angle;
  }
  if (wallOrigin && buildMode()) {
    wallMoved = true;
    e.stopImmediatePropagation();
  }
}, true);
world.addEventListener('pointerup', e => {
  if (wallOrigin && buildMode()) {
    const finish = pos(e);
    const type = buildMode();
    if (finish && wallMoved && type) {
      const sim = window.rtsDebug.sim;
      const length = Math.hypot(finish.x - wallOrigin.x, finish.z - wallOrigin.z);
      const n = Math.min(28, Math.max(1, Math.ceil(length / 5.8)));
      let built = 0;
      for (let i = 0; i < n; i++) {
        const t = n === 1 ? 0 : i / (n - 1);
        const x = wallOrigin.x + (finish.x - wallOrigin.x) * t;
        const z = wallOrigin.z + (finish.z - wallOrigin.z) * t;
        const outcome = sim.build(type, x, z);
        if (outcome.error) break;
        built++;
      }
      const cancel = [...document.querySelectorAll('#actions button')]
        .find(b => b.textContent?.trim() === 'Cancel');
      if (cancel) cancel.click();
      document.getElementById('toast').textContent = built ?
        built + ' defensive sections ordered. Workers are building them.' :
        'No valid, affordable wall sections could be placed.';
      document.getElementById('toast').classList.remove('hidden');
    }
    wallOrigin = null;
    wallMoved = false;
    active.delete(e.pointerId);
    e.stopImmediatePropagation();
    return;
  }
  active.delete(e.pointerId);
}, true);
world.addEventListener('pointercancel', e => {
  active.delete(e.pointerId);
  wallOrigin = null;
}, true);

function restyleText() {
  const brand = document.querySelector('.wordmark');
  if (brand && brand.textContent !== 'ROMA · THE REPUBLIC') brand.textContent = 'ROMA · THE REPUBLIC';
  const tag = document.querySelector('.version-tag');
  if (tag && tag.textContent !== 'REPUBLIC · 216 BCE') tag.textContent = 'REPUBLIC · 216 BCE';
  const mini = document.querySelector('.mini-label');
  if (mini && mini.textContent !== 'ITALIA · THE RIVER VALLEY') mini.textContent = 'ITALIA · THE RIVER VALLEY';
  const dialog = document.querySelector('.overlay:not(.hidden) .dialog');
  if (dialog) {
    const title = dialog.querySelector('h1');
    if (title && title.textContent?.includes('kingdom starts')) title.innerHTML = 'ROMA<span class="republic-subtitle">THE REPUBLIC</span>';
    const eyebrow = dialog.querySelector('.eyebrow');
    if (eyebrow && eyebrow.textContent?.includes('RTS CORE')) eyebrow.textContent = 'ROMA / ALPHA 08 · GRAND ITALIA MAP';
    const intro = dialog.querySelector('.intro-line');
    if (intro && intro.textContent?.includes('worth fighting for')) intro.textContent = 'Italy · The Second Punic War · c. 216 BCE';
    const paragraphs = dialog.querySelectorAll('p');
    for (const p of paragraphs) {
      if (p.textContent?.includes('Lead Willowmere')) p.textContent =
        'Establish a Roman foothold. Raise Republican maniples, defend your castrum and push through the valley to claim the high ground.';
      if (p.textContent?.includes('240 infantry')) p.textContent =
        'Each counted surviving soldier has one visible model at near zoom; distant formations show readable markers.';
      if (p.textContent?.includes('Kenney Nature Kit oak;')) p.textContent =
        'Live assets: Kenney Nature and Castle Kits (CC0), Three.js (MIT), original procedural Roman buildings, helmets, shields and palisades. 0 A.D. art is researched but not yet imported.';
    }
  }
  const actions = document.getElementById('actions');
  if (actions && document.getElementById('selection-title')?.textContent === 'Legion Barracks') {
    for (const type of ['principes', 'triarii']) {
      if (actions.querySelector('[data-roman-troop="' + type + '"]')) continue;
      const b = document.createElement('button');
      b.dataset.romanTroop = type;
      b.textContent = 'Train ' + TROOPS[type].name;
      b.onclick = () => {
        const sim = window.rtsDebug.sim;
        const barracks = sim.buildings.find(x => x.side === 0 && x.type === 'barracks' && x.progress >= 1);
        const err = barracks ? sim.recruit(barracks, type) : 'Finish the barracks first';
        document.getElementById('toast').textContent = err || TROOPS[type].name + ' queued';
        document.getElementById('toast').classList.remove('hidden');
      };
      actions.append(b);
    }
  }
}
restyleText();
setupPremiumUi();
new MutationObserver(() => {
  requestAnimationFrame(restyleText);
}).observe(document.getElementById('rts-root'), {childList:true,subtree:true});
});

function setupPremiumUi(){
  const root=document.getElementById('rts-root');
  if(!root || document.getElementById('roma6-tools')) return;
  const surface=root.querySelector('.rts-app');
  surface.classList.add('roma6-clean');
  const nav=document.createElement('nav');
  nav.id='roma6-tools';
  nav.setAttribute('aria-label','ROME compact controls');
  const make=(symbol,label,action)=>{
    const button=document.createElement('button');
    button.textContent=symbol;
    button.title=label;
    button.setAttribute('aria-label',label);
    button.addEventListener('click',action);
    nav.appendChild(button);
    return button;
  };
  make('+','Build settlement',()=>{
    let build=[...document.querySelectorAll('#actions button')].find(b=>b.textContent.trim()==='Build');
    if(!build){
      document.getElementById('home')?.click();
      build=[...document.querySelectorAll('#actions button')].find(b=>b.textContent.trim()==='Build');
    }
    if(build)build.click();
    else document.getElementById('toast').textContent='Select your Forum, then choose Build.';
  });
  make('◇','Show or hide tactical map',()=>surface.classList.toggle('roma6-map'));
  make('⋯','Open tactical controls',()=>surface.classList.toggle('roma6-more'));
  make('⌖','Centre on the settlement',()=>document.getElementById('home')?.click()).classList.add('roma6-extra');
  make('◎','Toggle camera buttons',()=>surface.classList.toggle('roma6-camera')).classList.add('roma6-extra');
  make('⚔','Selected formation actions',()=>surface.classList.toggle('roma6-actions')).classList.add('roma6-extra');
  make('?','Toggle objective',()=>surface.classList.toggle('roma6-mission')).classList.add('roma6-extra');
  root.appendChild(nav);
  function strategicLabels() {
    surface.classList.toggle('roma7-strategic',!!(window.rtsDebug?.view?.span>120));
    requestAnimationFrame(strategicLabels);
  }
  requestAnimationFrame(strategicLabels);
  // Building previews need their Confirm action, but regular game chrome stays hidden.
  const selectionTitle=document.getElementById('selection-title');
  if(selectionTitle){
    const syncPlacement=()=>{
      const placement=(selectionTitle.textContent||'').startsWith('Place ');
      if(placement){
        surface.dataset.autoAction='yes';
        surface.classList.add('roma6-actions');
      } else if(surface.dataset.autoAction==='yes'){
        surface.dataset.autoAction='no';
        surface.classList.remove('roma6-actions');
      }
    };
    new MutationObserver(syncPlacement).observe(selectionTitle,{childList:true,subtree:true,characterData:true});
    syncPlacement();
  }
  // Prevent labels from turning the battlefield into a permanent dashboard.
  const oldPick=WorldView.prototype.pick;
  WorldView.prototype.pick=function(x,y){
    let best=null,dist=Number.POSITIVE_INFINITY;
    for(const a of this.sim.armies){
      if(a.hp<=0||(a.side!==0&&!this.sim.seen(a)))continue;
      const point=this.screen(a,1.5);
      const d=Math.hypot(point.x-x,point.y-y);
      if(d<43 && d<dist){best=a;dist=d;}
    }
    return best || oldPick.call(this,x,y);
  };
  const oldMove=Simulation.prototype.move;
  Simulation.prototype.move=function(unit,position,target){
    const before={path:unit.path,target:unit.target,hold:unit.hold,repath:unit.repath};
    const result=oldMove.call(this,unit,position,target);
    if(result)return true;
    if(target && Math.hypot(unit.x-target.x,unit.z-target.z)<
       (TROOPS[unit.type]?.range || 4)+(target.radius||0)+1){
      unit.path=[];unit.target=target.id;unit.hold=false;return true;
    }
    Object.assign(unit,before);return false;
  };
}
