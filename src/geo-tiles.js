(function(){
'use strict';
const cache=new Map(),MAX_CACHE=220;
let mode='satellite',redraw=()=>{},stats={ready:0,failed:0,waiting:0};
const SAT='https://tiles.maps.eox.at/wmts/1.0.0/s2cloudless_3857/default/GoogleMapsCompatible/';
const DEM='https://s3.amazonaws.com/elevation-tiles-prod/terrarium/';
const PI=Math.PI;
function merc(lat){return Math.log(Math.tan(PI/4+lat*PI/360));}
function limiter(v,a,b){return Math.max(a,Math.min(b,v));}
function shade(image){
  const c=document.createElement('canvas');c.width=c.height=256;
  const g=c.getContext('2d',{willReadFrequently:true});g.drawImage(image,0,0,256,256);
  const pixels=g.getImageData(0,0,256,256),src=pixels.data;
  const heights=new Float32Array(65536);
  for(let i=0;i<65536;i++){const j=i*4;heights[i]=src[j]*256+src[j+1]+src[j+2]/256-32768;}
  for(let y=0;y<256;y++){for(let x=0;x<256;x++){
    const i=y*256+x,h=heights[i],l=heights[y*256+Math.max(x-1,0)],r=heights[y*256+Math.min(x+1,255)],u=heights[Math.max(y-1,0)*256+x],d=heights[Math.min(y+1,255)*256+x];
    const s=limiter(.84+(l-r)*.012+(u-d)*.017,.35,1.32),j=i*4;
    let rgb;
    if(h<0)rgb=[60,111,128];
    else if(h<100)rgb=[173,166,122];
    else if(h<350)rgb=[153,156,115];
    else if(h<850)rgb=[122,140,104];
    else if(h<1500)rgb=[131,127,111];
    else if(h<2500)rgb=[167,152,133];
    else rgb=[210,207,187];
    src[j]=limiter(rgb[0]*s,0,255);src[j+1]=limiter(rgb[1]*s,0,255);src[j+2]=limiter(rgb[2]*s,0,255);src[j+3]=255;
  }}
  g.putImageData(pixels,0,0);return c;
}
function get(kind,z,x,y){
 const key=kind+'/'+z+'/'+x+'/'+y;
 if(cache.has(key)){const e=cache.get(key);cache.delete(key);cache.set(key,e);return e;}
 const entry={status:'loading',image:null},image=new Image();
 if(kind==='relief')image.crossOrigin='anonymous';
 cache.set(key,entry);
 if(cache.size>MAX_CACHE){const old=cache.keys().next().value;cache.delete(old);}
 image.onload=()=>{
  try{entry.image=kind==='relief'?shade(image):image;entry.status='ready';}
  catch(e){entry.status='failed';entry.error='DEM decoder unavailable';}
  redraw();
 };
 image.onerror=()=>{entry.status='failed';redraw();};
 image.src=kind==='satellite'
  ?SAT+z+'/'+y+'/'+x+'.jpg'
  :DEM+z+'/'+x+'/'+y+'.png';
 return entry;
}
function render(ctx,o){
 stats={ready:0,failed:0,waiting:0};
 if(mode==='historical')return stats;
 const cam=o.cam,n=Math.pow(2,limiter(Math.round(Math.log2(360*o.W*cam.z/(88*256))),3,11));
 const z=Math.log2(n);
 const mTop=merc(o.LAT1),mBottom=merc(o.LAT0),range=mTop-mBottom;
 const vx0=cam.x-o.cw/(2*cam.z),vx1=cam.x+o.cw/(2*cam.z),vy0=cam.y-o.ch/(2*cam.z),vy1=cam.y+o.ch/(2*cam.z);
 const tx0=limiter(Math.floor((o.LON0+vx0/o.W*(o.LON1-o.LON0)+180)/360*n),0,n-1);
 const tx1=limiter(Math.floor((o.LON0+vx1/o.W*(o.LON1-o.LON0)+180)/360*n),0,n-1);
 const ty0=limiter(Math.floor((1-(mTop-vy0/o.H*range)/PI)/2*n),0,n-1);
 const ty1=limiter(Math.floor((1-(mTop-vy1/o.H*range)/PI)/2*n),0,n-1);
 const w=360/n/(o.LON1-o.LON0)*o.W*cam.z;
 const h=(2*PI/n)/range*o.H*cam.z;
 const x0=(((-180+tx0*360/n-o.LON0)/(o.LON1-o.LON0)*o.W-cam.x)*cam.z+o.cw/2);
 const y0=((mTop-(PI-2*PI*ty0/n))/range*o.H-cam.y)*cam.z+o.ch/2;
 const total=(tx1-tx0+1)*(ty1-ty0+1);
 if(total>110)return stats;
 ctx.save();
 ctx.beginPath();ctx.rect(0,0,o.cw,o.ch);ctx.clip();
 if(mode==='satellite')ctx.filter='saturate(.83) contrast(1.07)';
 for(let y=ty0;y<=ty1;y++)for(let x=tx0;x<=tx1;x++){
  const e=get(mode,z,x,y),dx=x0+(x-tx0)*w,dy=y0+(y-ty0)*h;
  if(e.status==='ready'){
    stats.ready++;
    ctx.drawImage(e.image,dx-.3,dy-.3,w+.6,h+.6);
  } else if(e.status==='failed')stats.failed++;else stats.waiting++;
 }
 ctx.restore();
 const status=document.getElementById('geo-status');
 if(status)status.textContent=stats.ready
   ?(mode==='satellite'?'SATELLITE IMAGERY':'ELEVATION-BASED RELIEF')+' · '+stats.ready+'/'+total+' TILES'
   :stats.failed&&stats.waiting===0?'EXTERNAL MAP TILES UNAVAILABLE · HISTORIC FALLBACK':
   (mode==='satellite'?'LOADING SATELLITE TILES':'LOADING ELEVATION TILES')+' · '+stats.waiting+' PENDING';
 return stats;
}
function setMode(value){
 if(!['satellite','relief','historical'].includes(value))return;
 mode=value;
 document.querySelectorAll('[data-map-mode]').forEach(b=>{b.classList.toggle('active',b.dataset.mapMode===value);b.setAttribute('aria-pressed',String(b.dataset.mapMode===value));});
 const credits=document.getElementById('map-credits');
 if(credits){credits.innerHTML=value==='satellite'
  ?'<a href="https://cloudless.eox.at/" target="_blank" rel="noopener noreferrer">EOxCloudless by EOX IT Services GmbH (Contains modified Copernicus Sentinel data 2016 &amp; 2017)</a> · MODERN IMAGERY'
  :value==='relief'
  ?'<a href="https://github.com/tilezen/joerd/blob/master/docs/attribution.md" target="_blank" rel="noopener noreferrer">Mapzen / AWS Terrain Tiles · EU-DEM and source credits</a> · MODERN ELEVATION'
  :'<a href="https://www.naturalearthdata.com/" target="_blank" rel="noopener noreferrer">Natural Earth</a> · ILLUSTRATED MAP';}
 try{localStorage.setItem('roma_campaign_map_mode',value);}catch(_){}
 redraw();
}
function boot(fn){
 redraw=fn;
 const buttons=document.getElementById('basemap');
 if(buttons)buttons.addEventListener('click',e=>{const b=e.target.closest('[data-map-mode]');if(b)setMode(b.dataset.mapMode);});
 let value='satellite';try{value=localStorage.getItem('roma_campaign_map_mode')||value;}catch(_){}
 setMode(value);
}
window.ROMA_GEO={render,boot,setMode,get mode(){return mode;},get stats(){return stats;}};
})();