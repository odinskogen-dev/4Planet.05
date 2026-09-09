(()=>{
'use strict';
const s=window.__JAG29;
if(!s||!s.p||!s.n||!s.c)return;
const decode=(b64,expected,label)=>{
  const clean=String(b64).replace(/\s+/g,'');
  const raw=atob(clean);
  if(raw.length!==expected)throw new Error(`[JAGUAR] ${label} payload length ${raw.length} != ${expected}`);
  const out=new Uint8Array(raw.length);for(let i=0;i<raw.length;i++)out[i]=raw.charCodeAt(i);return out;
};
const encode=typed=>{const bytes=new Uint8Array(typed.buffer,typed.byteOffset,typed.byteLength);let out='';for(let i=0;i<bytes.length;i+=0x8000)out+=String.fromCharCode(...bytes.subarray(i,Math.min(i+0x8000,bytes.length)));return btoa(out)};
const n=s.verts;
const pb=decode(s.p,n*3*2,'position');decode(s.n,n*3,'normal');decode(s.c,n*3,'colour');
const q=new Uint16Array(pb.byteLength/2),view=new DataView(pb.buffer,pb.byteOffset,pb.byteLength),p=new Float32Array(n*3);
for(let i=0;i<q.length;i++){q[i]=view.getUint16(i*2,true);const axis=i%3;p[i]=s.min[axis]+q[i]/65535*s.span[axis];if(!Number.isFinite(p[i]))throw new Error('[JAGUAR] recovered position is non-finite')}
const cell=Math.max(...s.span)/12,key=(x,y,z)=>`${Math.floor(x/cell)},${Math.floor(y/cell)},${Math.floor(z/cell)}`,grid=new Map();
for(let i=0;i<n;i++){const k=key(p[i*3],p[i*3+1],p[i*3+2]);if(!grid.has(k))grid.set(k,[]);grid.get(k).push(i)}
const nearest=i=>{const x=p[i*3],y=p[i*3+1],z=p[i*3+2],cx=Math.floor(x/cell),cy=Math.floor(y/cell),cz=Math.floor(z/cell),cand=[];for(let r=1;r<=3&&cand.length<8;r++)for(let dx=-r;dx<=r;dx++)for(let dy=-r;dy<=r;dy++)for(let dz=-r;dz<=r;dz++){const bucket=grid.get(`${cx+dx},${cy+dy},${cz+dz}`);if(!bucket)continue;for(const j of bucket){if(j===i)continue;const ax=p[j*3]-x,ay=p[j*3+1]-y,az=p[j*3+2]-z;cand.push([ax*ax+ay*ay+az*az,j])}}cand.sort((a,b)=>a[0]-b[0]);return cand.slice(0,5).map(v=>v[1])};
const faceTarget=s.faces,idx=new Uint16Array(faceTarget*3);let f=0;
for(let i=0;i<n&&f<faceTarget;i++){const near=nearest(i);for(let t=0;t+1<near.length&&f<faceTarget;t+=2){const a=near[t],b=near[t+1];if(a===b)continue;idx[f*3]=i;idx[f*3+1]=a;idx[f*3+2]=b;f++}}
for(let i=0;f<faceTarget;i=(i+1)%n){const near=nearest(i);if(near.length<2)continue;idx[f*3]=i;idx[f*3+1]=near[0];idx[f*3+2]=near[1];f++}
const edges=new Set(),edgeList=[],add=(a,b)=>{const lo=Math.min(a,b),hi=Math.max(a,b),k=`${lo}:${hi}`;if(edges.has(k))return;edges.add(k);edgeList.push(lo,hi)};
for(let t=0;t<faceTarget;t++){const a=idx[t*3],b=idx[t*3+1],c=idx[t*3+2];add(a,b);add(b,c);add(c,a)}
if(edgeList.length<6)throw new Error('[JAGUAR] recovered topology has insufficient edges');
const edgePairs=Math.floor(edgeList.length/2),ei=new Uint16Array(edgeList);
window.__JAGS33={version:'surface-v33-recovered-from-v29',assetId:'4P-JAG-3D-EARROD-01',source:'Ear.Rodriguez CC BY 4.0',verts:n,faces:faceTarget,edgePairs,min:s.min,span:s.span,headPositiveX:true,motion:'PROCEDURAL_RUNTIME; ORIGINAL RIGGED MASTER SECURED',recovery:'VALIDATED_V29_DERIVED_PAYLOAD'};
window.__JAGS33_P=s.p;window.__JAGS33_N=s.n;window.__JAGS33_C=s.c;window.__JAGS33_I=encode(idx);window.__JAGS33_E=encode(ei);
})();