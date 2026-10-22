/** Tiny deterministic tactical grid and siege planning. Not a replacement for Recast or a Three.js navmesh. */
const KINDS = new Set(['open','forest','hill','road','water','bridge','wall','gate','tower','rubble']);
export function makeTerrain({width,height,cells=[],structures=[]}) {
  if(!Number.isSafeInteger(width)||!Number.isSafeInteger(height)||width<3||height<3||width*height>1000000) throw Error('Invalid terrain size');
  const grid=Array.from({length:height},()=>Array.from({length:width},()=>({kind:'open',elevation:0})));
  for(const c of cells){if(!inside(width,height,c.x,c.y)||!KINDS.has(c.kind))throw Error('Invalid terrain cell');
    if(!Number.isFinite(c.elevation??0)) throw Error('Bad height');grid[c.y][c.x]={kind:c.kind,elevation:c.elevation??0};}
  const items=[];
  for(const s of structures){if(!s.id||!inside(width,height,s.x,s.y)||!['wall','gate','tower','bridge'].includes(s.type)||!Number.isSafeInteger(s.hp)||s.hp<0)throw Error('Invalid siege structure');
    if(items.some(x=>x.id===s.id||x.x===s.x&&x.y===s.y))throw Error('Duplicate siege object');items.push({...s,open:!!s.open,destroyed:s.hp===0});}
  return {width,height,cells:grid,structures:items};
}
function inside(w,h,x,y){return Number.isInteger(x)&&Number.isInteger(y)&&x>=0&&y>=0&&x<w&&y<h;}
export function passable(map,x,y,unit='infantry'){
  if(!inside(map.width,map.height,x,y)) return false;
  const c=map.cells[y][x];if(c.kind==='water' || c.kind==='wall' || c.kind==='tower')return false;
  const s=map.structures.find(s=>s.x===x&&s.y===y&&!s.destroyed);
  if(s && (s.type==='wall'||s.type==='tower'||s.type==='gate'&&!s.open))return false;
  if(unit==='cavalry'&&(c.kind==='forest'||c.kind==='hill'&&c.elevation>4))return false;
  if(unit==='siege' && c.kind==='forest') return false;
  return true;
}
export function findTacticalPath(map,start,end,{unit='infantry',maxSlope=4}={}){
  if(!inside(map.width,map.height,start.x,start.y)||!inside(map.width,map.height,end.x,end.y))throw Error('Invalid path endpoints');
  if(!passable(map,start.x,start.y,unit)||!passable(map,end.x,end.y,unit)) return null;
  const key=(x,y)=>`${x},${y}`, startKey=key(start.x,start.y), targetKey=key(end.x,end.y);
  const dist=new Map([[startKey,0]]),previous=new Map(),open=[{x:start.x,y:start.y,cost:0}];
  const directions=[[0,-1],[-1,0],[1,0],[0,1]];
  while(open.length){open.sort((a,b)=>a.cost-b.cost||a.y-b.y||a.x-b.x);
    const p=open.shift(),pid=key(p.x,p.y);if(dist.get(pid)!==p.cost)continue;
    if(pid===targetKey){const path=[{x:p.x,y:p.y}];let cur=pid;while(previous.has(cur)){const prior=previous.get(cur);path.unshift({x:prior.x,y:prior.y});cur=key(prior.x,prior.y);}return {path,cost:p.cost};}
    for(const [dx,dy] of directions){let nx=p.x+dx,ny=p.y+dy;
      if(!passable(map,nx,ny,unit))continue;
      const delta=Math.abs(map.cells[ny][nx].elevation-map.cells[p.y][p.x].elevation);
      if(delta>maxSlope)continue;
      const cell=map.cells[ny][nx];const movement=cell.kind==='road'?0.7:cell.kind==='forest'?1.7:1;
      const nd=p.cost+movement+delta*.3,k=key(nx,ny);
      if(nd < (dist.get(k)??Infinity)-1e-9){dist.set(k,nd);previous.set(k,{x:p.x,y:p.y});open.push({x:nx,y:ny,cost:nd});}
    }
  }
  return null;
}
export function changeGate(map,id,open){const structure=map.structures.find(s=>s.id===id);
 if(!structure||structure.type!=='gate'||structure.destroyed)throw Error('Gate unavailable');
 return {...map,structures:map.structures.map(s=>s.id===id?{...s,open:!!open}:s)};
}
export function damageStructure(map,id,damage){if(!Number.isSafeInteger(damage)||damage<0)throw Error('Invalid siege damage');
 const s=map.structures.find(s=>s.id===id);if(!s)throw Error('Structure missing');
 return {...map,structures:map.structures.map(o=>o.id===id?{...o,hp:Math.max(0,o.hp-damage),destroyed:o.hp-damage<=0}:o)};
}
export function cityPlanToSiegeGrid(plan,{width=13,height=11,wallHp=250,gateHp=350}={}){
 const allowed={fort:'wall',watchtower:'tower',gate:'gate',bridge:'bridge'};
 const structures=(plan?.structures??[]).filter(s=>allowed[s.type]&&s.completed).map(s=>({id:s.id,type:allowed[s.type],x:s.x,y:s.y,hp:allowed[s.type]==='gate'?gateHp:wallHp}));
 return makeTerrain({width,height,structures});
}