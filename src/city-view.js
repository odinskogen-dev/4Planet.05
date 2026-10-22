(function () {
  'use strict';
  const W = 1000, H = 610, TW = 64, TH = 36;
  const originX = 500, originY = 95;
  const api = () => window.ROMA_CAMPAIGN;
  const plans = window.ROMA_CITY_PLANS;
  const DESCRIPTIONS = {
    farm: '+11 local grain each campaign day (subject to regional transfer costs).',
    granary: '+3 local grain each day; +80 Republic grain on construction.',
    woodlot: '+3 wood each campaign day across Roman settlements.',
    quarry: '+2 stone each campaign day across Roman settlements.',
    market: '+4 treasury each day across Roman settlements.',
    fort: '+6.5% defence score per wall segment in campaign auto-resolve at a defended settlement (capped with towers).',
    watchtower: '+4% defence score per tower in campaign auto-resolve at a defended settlement.'
  };
  const labels = { ...plans.LABELS };
  let active = false;
  let building = 'farm';
  let tile = null;
  let siteId = 'canusium';
  let frameTime = 0;

  const modal = document.createElement('div');
  modal.id = 'city-layer';
  modal.className = 'hidden';
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  modal.setAttribute('aria-label', 'Settlement builder');
  modal.innerHTML = `
    <header class="city-head">
      <div class="city-logo">ROMA <span>THE REPUBLIC</span></div>
      <div class="city-headline"><small>CHAPTER I · A CITY TO DEFEND</small><h2 id="city-name">CANUSIUM</h2></div>
      <button id="city-close" aria-label="Close city and return to the campaign">BACK TO CAMPAIGN <span>✕</span></button>
    </header>
    <div class="city-main">
      <div class="city-scene">
        <div class="city-overline">SETTLEMENT VIEW · ABSTRACT PLANNING GRID · NOT AN ARCHAEOLOGICAL RECONSTRUCTION</div>
        <canvas id="city-canvas" width="1000" height="610" aria-label="Interactive isometric settlement grid. Select a building and choose an empty tile to place it."></canvas>
        <div class="city-bottom"><div id="city-spot">CHOOSE A BUILDING, THEN A SITE</div><div>13 × 11 BUILDING GRID</div></div>
      </div>
      <aside class="city-menu">
        <div class="city-menu-title"><small>LOCAL GOVERNANCE</small><h3>Shape your city.</h3><p>Structures persist into the campaign. Walls and towers contribute to simulated local defence.</p></div>
        <div id="city-economy" class="city-economy"></div>
        <div class="city-category">PRODUCTION & TRADE</div>
        <div id="city-economic-tools" class="city-tools"></div>
        <div class="city-category">DEFEND THE SETTLEMENT</div>
        <div id="city-defence-tools" class="city-tools"></div>
        <div id="city-description" class="city-description"></div>
        <button id="city-construct" disabled>PLACE STRUCTURE</button>
        <p class="city-warning" id="city-warning">Historical design concept. No changes are sent to the original battle engine.</p>
      </aside>
    </div>
  `;
  document.body.appendChild(modal);
  const $ = id => document.getElementById(id);
  const canvas = $('city-canvas'), ctx = canvas.getContext('2d');
  const structureColours = {
    farm: ['#8c9866', '#b3bc80', '#636f45'],
    granary: ['#a78161', '#ceb18b', '#7b5849'],
    market: ['#b5aa8d', '#e0d6b6', '#777663'],
    woodlot: ['#45684d', '#648368', '#354f3b'],
    quarry: ['#8f918c', '#c0c1ae', '#5d665f'],
    fort: ['#b2a78e', '#e1d4b9', '#837a6b'],
    watchtower: ['#afa28b', '#d9c7a4', '#786956']
  };
  function tilePoint(x, y) {
    return { x: originX + (x - y) * TW / 2, y: originY + (x + y) * TH / 2 };
  }
  function diamond(x, y, c) {
    ctx.beginPath();
    ctx.moveTo(x, y - TH / 2);
    ctx.lineTo(x + TW / 2, y);
    ctx.lineTo(x, y + TH / 2);
    ctx.lineTo(x - TW / 2, y);
    ctx.closePath();
    ctx.fillStyle = c;
    ctx.fill();
  }
  function poly(points, color) {
    ctx.beginPath();
    points.forEach((p, i) => i ? ctx.lineTo(...p) : ctx.moveTo(...p));
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
  }
  function box(x, y, height, palette, width = 22) {
    const w = width, depth = w * 0.54, top = y - height;
    poly([[x-w,top],[x,top-depth],[x+w,top],[x,top+depth]], palette[1]);
    poly([[x-w,top],[x,top+depth],[x,y+depth],[x-w,y]], palette[0]);
    poly([[x+w,top],[x,top+depth],[x,y+depth],[x+w,y]], palette[2]);
  }
  function tree(x, y, size) {
    ctx.fillStyle = '#6b5644';
    ctx.fillRect(x-2,y-size*.6,4,size*.8);
    const g = ctx.createRadialGradient(x-7,y-size,3,x,y-size*.75,size*.8);
    g.addColorStop(0,'#a8ae7e');g.addColorStop(.65,'#536e51');g.addColorStop(1,'#2f4e46');
    ctx.beginPath();ctx.ellipse(x,y-size*.85,size*.75,size*.6,0,0,Math.PI*2);ctx.fillStyle=g;ctx.fill();
  }
  function drawBuilding(item) {
    const p = tilePoint(item.x, item.y);
    const pal = structureColours[item.type] || structureColours.granary;
    ctx.save();
    ctx.shadowColor = '#13221d88'; ctx.shadowBlur = 16;ctx.shadowOffsetY = 8;
    if (item.type === 'farm') {
      diamond(p.x, p.y, '#8c915d');
      for (let d = -2; d <= 2; d++) {
        ctx.strokeStyle = '#d1b67a';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(p.x - 17 + d * 2, p.y - 7 + d * 1);
        ctx.lineTo(p.x + 17 + d * 2, p.y + 7 + d * 1);
        ctx.stroke();
      }
      box(p.x+10, p.y-6, 13, ['#8e7359','#cbb385','#6c5944'], 10);
    } else if (item.type === 'woodlot') {
      tree(p.x-8,p.y+7,29);tree(p.x+13,p.y-3,21);
      box(p.x+4,p.y+10,9,['#8c7050','#bd995f','#6e5139'],10);
    } else if (item.type === 'quarry') {
      box(p.x,p.y+5,13,pal,23);box(p.x-6,p.y,8,['#98968c','#ded9c9','#73786d'],14);
      poly([[p.x-22,p.y+9],[p.x-5,p.y-2],[p.x+11,p.y+4],[p.x-7,p.y+15]], '#eee9d6');
    } else if (item.type === 'fort') {
      box(p.x,p.y+8,30,pal,30);
      ctx.fillStyle = '#e7dcc2';
      for (let i=-2;i<=2;i++)ctx.fillRect(p.x+i*10-4,p.y-28+(i%2?1:0),8,6);
    } else if (item.type === 'watchtower') {
      box(p.x,p.y+5,55,pal,20);box(p.x,p.y-48,8,['#77644d','#ad9b75','#5b4f40'],25);
      ctx.fillStyle = '#322d27';
      ctx.fillRect(p.x-12,p.y-30,5,10);ctx.fillRect(p.x+8,p.y-27,5,9);
    } else if (item.type === 'granary') {
      box(p.x,p.y+7,30,pal,23);
      poly([[p.x-25,p.y-23],[p.x,p.y-52],[p.x+25,p.y-23],[p.x,p.y-12]], '#805c46');
      ctx.fillStyle='#42352b';ctx.fillRect(p.x-5,p.y-10,10,11);
    } else {
      box(p.x,p.y+7,18,pal,25);
      for(let k=-1;k<=1;k++){ctx.strokeStyle='#f4e5c3';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(p.x+k*11,p.y-17);ctx.lineTo(p.x+k*11,p.y+8);ctx.stroke();}
    }
    ctx.restore();
    if (item.type !== 'farm') {
      ctx.fillStyle = '#eee1c2';
      ctx.font = '600 10px DM Sans';
      ctx.textAlign = 'center';
      ctx.fillText(labels[item.type].split(' ')[0],p.x,p.y+30);
    }
  }
  function repaint() {
    if (!active) return;
    const st = api().state, city = st.settlements[siteId], plan = api().cityPlan(siteId);
    ctx.clearRect(0,0,W,H);
    const gradient = ctx.createLinearGradient(0,0,0,H);
    gradient.addColorStop(0,'#49625a');gradient.addColorStop(.55,'#78826a');gradient.addColorStop(1,'#6b7160');
    ctx.fillStyle=gradient;ctx.fillRect(0,0,W,H);
    ctx.globalAlpha=.11;
    for(let i=0;i<70;i++){const x=(i*197)%W,y=(i*103)%H;ctx.beginPath();ctx.arc(x,y,1+(i%4),0,7);ctx.fillStyle='#e7deb6';ctx.fill();}
    ctx.globalAlpha=1;
    for(let y=0;y<plans.ROWS;y++)for(let x=0;x<plans.COLS;x++){
      const p=tilePoint(x,y);
      const center=(x===6&&y===5);
      const road=(x===6||y===5);
      const shaded=(x*7+y*13)%5===0;
      diamond(p.x,p.y,center?'#b9ae87':road?'#a49f83':shaded?'#818d69':'#748364');
      ctx.beginPath();ctx.moveTo(p.x,p.y-TH/2);ctx.lineTo(p.x+TW/2,p.y);ctx.lineTo(p.x,p.y+TH/2);ctx.lineTo(p.x-TW/2,p.y);ctx.closePath();ctx.strokeStyle='#34473b2a';ctx.lineWidth=1;ctx.stroke();
    }
    for(let i=0;i<33;i++){
      const xx=i%13, yy=(i*7+Math.floor(i/8))%11;
      if(xx===6||yy===5||plan.structures.some(s=>s.x===xx&&s.y===yy))continue;
      const p=tilePoint(xx,yy);tree(p.x+(i%4-2)*6,p.y+4,7+(i%5)*2);
    }
    const center=tilePoint(6,5);
    box(center.x,center.y+6,42,['#aea18a','#d4bea1','#736b58'],32);
    poly([[center.x-32,center.y-35],[center.x,center.y-63],[center.x+32,center.y-35],[center.x,center.y-22]],'#8b6652');
    ctx.fillStyle='#f3e6c3';ctx.font='700 11px DM Sans';ctx.textAlign='center';
    ctx.fillText('FORUM',center.x,center.y+33);
    plan.structures.slice().sort((a,b)=>(a.x+a.y)-(b.x+b.y)).forEach(drawBuilding);
    if (tile) {
      const p=tilePoint(tile.x,tile.y), valid=plans.placeable(plan,building,tile.x,tile.y);
      ctx.save();ctx.globalAlpha=.55;diamond(p.x,p.y,valid?'#dae69b':'#d16e61');ctx.restore();
      ctx.lineWidth=2;ctx.strokeStyle=valid?'#fff0b8':'#ffaba5';
      ctx.beginPath();ctx.moveTo(p.x,p.y-TH/2);ctx.lineTo(p.x+TW/2,p.y);ctx.lineTo(p.x,p.y+TH/2);ctx.lineTo(p.x-TW/2,p.y);ctx.closePath();ctx.stroke();
    }
    ctx.fillStyle='rgba(244,235,211,.85)';ctx.font='700 17px Georgia';ctx.textAlign='left';ctx.fillText('YOUR SETTLEMENT · 216 BCE',36,45);
    ctx.fillStyle='#ddd4b9';ctx.font='12px DM Sans';ctx.fillText('PERSISTENT PLACEMENT · STRATEGIC ECONOMY · PROPOSED SIEGE GEOMETRY',37,64);
    if(!city || city.owner!=='rome'){
      ctx.fillStyle='#fff7eddd';ctx.fillRect(250,259,500,73);
      ctx.fillStyle='#5b4237';ctx.textAlign='center';ctx.font='700 17px Georgia';
      ctx.fillText('UNDER FOREIGN CONTROL · VIEW ONLY',500,300);
    }
    frameTime++;
  }
  function spotInfo() {
    const state = api().state, city = state.settlements[siteId];
    const costs = api().cityCosts[building];
    const canAfford = !!costs && Object.entries(costs).every(([res,value])=>state[res]>=value);
    const locationOK = !!tile && plans.placeable(api().cityPlan(siteId),building,tile.x,tile.y);
    const owned = city?.owner==='rome';
    $('city-construct').disabled = !owned || !canAfford || !locationOK;
    $('city-construct').textContent = !owned?'CITY NOT CONTROLLED':!canAfford?'INSUFFICIENT RESOURCES':!tile?'CHOOSE A PLOT':!locationOK?'INVALID OR OCCUPIED SITE':'CONSTRUCT '+labels[building];
    $('city-spot').textContent = tile ? 'PLOT '+(tile.x+1)+' / '+(tile.y+1)+' · '+(locationOK?'AVAILABLE':'NOT AVAILABLE'):'SELECT A BUILDING AND A PLOT';
    $('city-description').innerHTML='<b>'+labels[building]+'</b><p>'+DESCRIPTIONS[building]+'</p><small>'+Object.entries(costs||{}).map(([k,v])=>v+' '+k.toUpperCase()).join(' · ')+'</small>';
    const defence=api().cityDefence(siteId);
    $('city-economy').innerHTML='<div><span>LOCAL GRAIN</span><b>'+(city?.grain||0)+'</b></div>'+
      '<div><span>RESERVES</span><b>'+state.treasury.toLocaleString()+' coin</b></div>'+
      '<div><span>WALLS · TOWERS</span><b>'+defence.wallSegments+' · '+defence.towers+'</b></div>'+
      '<div><span>DEFENCE BONUS</span><b>+'+Math.round(defence.bonus*100)+'%</b></div>';
  }
  function renderTools() {
    const all=['farm','granary','woodlot','quarry','market','fort','watchtower'];
    for(const [target,subset] of [['city-economic-tools',all.slice(0,5)],['city-defence-tools',all.slice(5)]]) {
      $(target).replaceChildren();
      for(const kind of subset){
        const btn=document.createElement('button');btn.type='button';
        btn.className='city-tool'+(kind===building?' is-active':'');
        btn.innerHTML='<span>'+labels[kind]+'</span><small>'+Object.entries(api().cityCosts[kind])
         .map(([res,v])=>v+' '+res).join(' · ')+'</small>';
        btn.addEventListener('click',()=>{building=kind;tile=null;renderTools();spotInfo();repaint();});
        $(target).append(btn);
      }
    }
  }
  function open() {
    const state=api().state;siteId=state.selected;
    if(!state.settlements[siteId])return;
    modal.classList.remove('hidden');active=true;document.body.classList.add('city-active');
    $('city-name').textContent=api().siteInfo(siteId)?.name.toUpperCase()||siteId.toUpperCase();
    const pl=api().cityPlan(siteId);tile=plans.freeSpot(pl,building);
    renderTools();spotInfo();repaint();
    $('city-close').focus();
  }
  function close() { active=false;modal.classList.add('hidden');document.body.classList.remove('city-active');}
  function clicked(event) {
    const r=canvas.getBoundingClientRect();
    const px=(event.clientX-r.left)*W/r.width,py=(event.clientY-r.top)*H/r.height;
    const a=(px-originX)/(TW/2), b=(py-originY)/(TH/2);
    const x=Math.round((a+b)/2), y=Math.round((b-a)/2);
    if(!plans.validCoordinate(x,y))return;
    tile={x,y};spotInfo();repaint();
  }
  function build() {
    if(!tile)return;
    const ok=api().cityBuild(building,tile.x,tile.y);
    if(ok){tile=plans.freeSpot(api().cityPlan(siteId),building);renderTools();}
    spotInfo();repaint();
  }
  canvas.addEventListener('click',clicked);
  $('city-construct').addEventListener('click',build);
  $('city-close').addEventListener('click',close);
  $('city-open').addEventListener('click',open);
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&active){e.preventDefault();close();}});
  document.addEventListener('roma:campaign-render',()=>{if(active){spotInfo();repaint();}});
  window.ROMA_CITY_VIEW = Object.freeze({open,close});
})();