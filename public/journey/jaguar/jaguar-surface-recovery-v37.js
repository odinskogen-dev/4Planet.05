(()=>{
'use strict';
const donor=window.JaguarEarProxyV25;
if(!donor||!donor.payload)throw new Error('[JAGUAR V37] Ear.Rodriguez indexed donor payload missing');
const raw=atob(String(donor.payload).replace(/\s+/g,''));
const bytes=new Uint8Array(raw.length);for(let i=0;i<raw.length;i++)bytes[i]=raw.charCodeAt(i);
const view=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength);
let o=0;
const u16=()=>{const v=view.getUint16(o,true);o+=2;return v};
const f32=()=>{const v=view.getFloat32(o,true);o+=4;return v};
const verts=u16(),faces=u16();
if(verts!==donor.vertices||faces!==donor.faces)throw new Error(`[JAGUAR V37] donor header ${verts}/${faces} != metadata ${donor.vertices}/${donor.faces}`);
const min=[f32(),f32(),f32()],max=[f32(),f32(),f32()],span=max.map((v,i)=>v-min[i]);
const posBytes=bytes.slice(o,o+verts*3*2);o+=posBytes.byteLength;
const colBytes=bytes.slice(o,o+verts*3);o+=colBytes.byteLength;
const idxCount=faces*3,idx=new Uint16Array(idxCount);
for(let i=0;i<idxCount;i++){if(o+2>bytes.length)throw new Error('[JAGUAR V37] donor index payload truncated');idx[i]=view.getUint16(o,true);o+=2;if(idx[i]>=verts)throw new Error('[JAGUAR V37] donor index out of range')}
if(o!==bytes.length)throw new Error(`[JAGUAR V37] donor payload has ${bytes.length-o} unexpected trailing bytes`);
const pv=new DataView(posBytes.buffer,posBytes.byteOffset,posBytes.byteLength),p=new Float32Array(verts*3);
for(let i=0;i<p.length;i++){const a=i%3;p[i]=min[a]+pv.getUint16(i*2,true)/65535*span[a];if(!Number.isFinite(p[i]))throw new Error('[JAGUAR V37] non-finite position')}
const acc=new Float32Array(verts*3);
for(let t=0;t<idx.length;t+=3){const ia=idx[t]*3,ib=idx[t+1]*3,ic=idx[t+2]*3,abx=p[ib]-p[ia],aby=p[ib+1]-p[ia+1],abz=p[ib+2]-p[ia+2],acx=p[ic]-p[ia],acy=p[ic+1]-p[ia+1],acz=p[ic+2]-p[ia+2],nx=aby*acz-abz*acy,ny=abz*acx-abx*acz,nz=abx*acy-aby*acx;for(const k of [ia,ib,ic]){acc[k]+=nx;acc[k+1]+=ny;acc[k+2]+=nz}}
const nrm=new Uint8Array(verts*3);
for(let i=0;i<verts;i++){const k=i*3,x=acc[k],y=acc[k+1],z=acc[k+2],m=Math.hypot(x,y,z)||1;nrm[k]=Math.max(0,Math.min(255,Math.round((x/m)*127.5+127.5)));nrm[k+1]=Math.max(0,Math.min(255,Math.round((y/m)*127.5+127.5)));nrm[k+2]=Math.max(0,Math.min(255,Math.round((z/m)*127.5+127.5)))}
const edges=new Set(),edge=[];const add=(a,b)=>{const lo=Math.min(a,b),hi=Math.max(a,b),key=`${lo}:${hi}`;if(edges.has(key))return;edges.add(key);edge.push(lo,hi)};
for(let t=0;t<idx.length;t+=3){add(idx[t],idx[t+1]);add(idx[t+1],idx[t+2]);add(idx[t+2],idx[t])}
if(edge.length<6)throw new Error('[JAGUAR V37] indexed donor topology produced insufficient edges');
const edgeIdx=new Uint16Array(edge);
const encodeBytes=(arr)=>{let out='';for(let i=0;i<arr.length;i+=0x8000)out+=String.fromCharCode(...arr.subarray(i,Math.min(i+0x8000,arr.length)));return btoa(out)};
const encodeU16=(arr)=>encodeBytes(new Uint8Array(arr.buffer,arr.byteOffset,arr.byteLength));
window.__JAGS33={version:'surface-v37-ear-v25-indexed',assetId:'4P-JAG-3D-EARROD-V25',source:donor.source,licence:donor.licence,sourceSha256:donor.sourceSha256,proxyPayloadSha256:donor.proxyPayloadSha256,verts,faces,edgePairs:edgeIdx.length/2,min,span,headPositiveX:true,motion:'PROCEDURAL_RUNTIME',recovery:'SOURCE_DERIVED_INDEXED_PROXY',topology:'CONTROLLED_DONOR_INDEX_BUFFER'};
window.__JAGS33_P=encodeBytes(posBytes);window.__JAGS33_N=encodeBytes(nrm);window.__JAGS33_C=encodeBytes(colBytes);window.__JAGS33_I=encodeU16(idx);window.__JAGS33_E=encodeU16(edgeIdx);
})();