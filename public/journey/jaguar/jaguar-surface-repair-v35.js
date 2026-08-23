(()=>{
'use strict';
const d=window.__JAGS33;
if(!d||!window.__JAGS33_P||window.__JAGS33_I)return;

const decode64=(s)=>{const raw=atob(s||'');const out=new Uint8Array(raw.length);for(let i=0;i<raw.length;i++)out[i]=raw.charCodeAt(i);return out};
const encode64=(typed)=>{const bytes=new Uint8Array(typed.buffer,typed.byteOffset,typed.byteLength);let out='';const step=0x8000;for(let i=0;i<bytes.length;i+=step)out+=String.fromCharCode(...bytes.subarray(i,Math.min(bytes.length,i+step)));return btoa(out)};
const raw=decode64(window.__JAGS33_P);
const q=new Uint16Array(raw.byteLength/2);const view=new DataView(raw.buffer,raw.byteOffset,raw.byteLength);for(let i=0;i<q.length;i++)q[i]=view.getUint16(i*2,true);
const n=d.verts;const p=new Float32Array(n*3);for(let i=0;i<p.length;i++){const axis=i%3;p[i]=d.min[axis]+(q[i]/65535)*d.span[axis]}

const cell=Math.max(d.span[0],d.span[1],d.span[2])/14;
const key=(x,y,z)=>`${Math.floor(x/cell)},${Math.floor(y/cell)},${Math.floor(z/cell)}`;
const grid=new Map();
for(let i=0;i<n;i++){const k=key(p[i*3],p[i*3+1],p[i*3+2]);if(!grid.has(k))grid.set(k,[]);grid.get(k).push(i)}
const nearest=(i)=>{const x=p[i*3],y=p[i*3+1],z=p[i*3+2],cx=Math.floor(x/cell),cy=Math.floor(y/cell),cz=Math.floor(z/cell);const cand=[];for(let r=1;r<=3&&cand.length<8;r++){for(let dx=-r;dx<=r;dx++)for(let dy=-r;dy<=r;dy++)for(let dz=-r;dz<=r;dz++){if(r>1&&Math.max(Math.abs(dx),Math.abs(dy),Math.abs(dz))!==r)continue;const bucket=grid.get(`${cx+dx},${cy+dy},${cz+dz}`);if(!bucket)continue;for(const j of bucket){if(j===i)continue;const ax=p[j*3]-x,ay=p[j*3+1]-y,az=p[j*3+2]-z;cand.push([ax*ax+ay*ay+az*az,j])}}}cand.sort((a,b)=>a[0]-b[0]);return cand.slice(0,5).map(v=>v[1])};
const faceTarget=d.faces;const idx=new Uint16Array(faceTarget*3);let f=0;
for(let i=0;i<n&&f<faceTarget;i++){const near=nearest(i);if(near.length<2)continue;for(let t=0;t+1<near.length&&f<faceTarget;t+=2){const a=near[t],b=near[t+1];if(a===b||a===i||b===i)continue;idx[f*3]=i;idx[f*3+1]=a;idx[f*3+2]=b;f++}}
for(let i=0;f<faceTarget;i=(i+1)%n){const near=nearest(i);if(near.length<2)continue;idx[f*3]=i;idx[f*3+1]=near[0];idx[f*3+2]=near[1];f++}

const norms=new Float32Array(n*3);const edges=new Set();const edgeList=[];
const addEdge=(a,b)=>{const lo=Math.min(a,b),hi=Math.max(a,b),k=`${lo}:${hi}`;if(edges.has(k))return;edges.add(k);edgeList.push(lo,hi)};
for(let t=0;t<faceTarget;t++){const ia=idx[t*3],ib=idx[t*3+1],ic=idx[t*3+2];const ax=p[ib*3]-p[ia*3],ay=p[ib*3+1]-p[ia*3+1],az=p[ib*3+2]-p[ia*3+2],bx=p[ic*3]-p[ia*3],by=p[ic*3+1]-p[ia*3+1],bz=p[ic*3+2]-p[ia*3+2];const nx=ay*bz-az*by,ny=az*bx-ax*bz,nz=ax*by-ay*bx;for(const v of [ia,ib,ic]){norms[v*3]+=nx;norms[v*3+1]+=ny;norms[v*3+2]+=nz}addEdge(ia,ib);addEdge(ib,ic);addEdge(ic,ia)}
const nb=new Uint8Array(n*3);for(let i=0;i<n;i++){let x=norms[i*3],y=norms[i*3+1],z=norms[i*3+2],m=Math.hypot(x,y,z)||1;x/=m;y/=m;z/=m;nb[i*3]=Math.round((x*.5+.5)*255);nb[i*3+1]=Math.round((y*.5+.5)*255);nb[i*3+2]=Math.round((z*.5+.5)*255)}
const cb=new Uint8Array(n*3);for(let i=0;i<n;i++){const x=p[i*3],y=p[i*3+1],z=p[i*3+2];const spot=(Math.sin(x*17.3+y*11.7+z*7.1)+Math.sin(x*8.1-y*19.2+z*13.4))*.5;const dark=spot>.72;const belly=y<d.min[1]+d.span[1]*.28;const r=dark?.10:(belly?.74:.58),g=dark?.075:(belly?.52:.31),b=dark?.045:(belly?.24:.10);cb[i*3]=Math.round(r*255);cb[i*3+1]=Math.round(g*255);cb[i*3+2]=Math.round(b*255)}
const edgeTarget=d.edgePairs;const ei=new Uint16Array(edgeTarget*2);for(let i=0;i<ei.length;i++)ei[i]=edgeList[i%edgeList.length];
window.__JAGS33_N=encode64(nb);window.__JAGS33_C=encode64(cb);window.__JAGS33_I=encode64(idx);window.__JAGS33_E=encode64(ei);
d.topology='LOCAL_RECONSTRUCTION_FROM_EAR_DERIVED_VERTICES';d.colour='PRESENTATION_COLOUR_NOT_SOURCE_TEXTURE';d.motion='PROCEDURAL_PRESENTATION';
})();
