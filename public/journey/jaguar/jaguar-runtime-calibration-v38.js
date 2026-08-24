(()=>{
'use strict';
const d=window.__JAGS33;
if(!d||!Array.isArray(d.min)||!Array.isArray(d.span))throw new Error('[JAGUAR V40] indexed surface metadata missing');
if(d.topology!=='CONTROLLED_DONOR_INDEX_BUFFER')throw new Error('[JAGUAR V40] refuses non-indexed / synthetic topology');
const sourceMin=d.min.slice();
const sourceSpan=d.span.slice();
if(sourceMin.length!==3||sourceSpan.length!==3||sourceSpan.some(v=>!Number.isFinite(v)||v<=0))throw new Error('[JAGUAR V40] invalid source bounds');
const sourceMaxSpan=Math.max(...sourceSpan);
if(!Number.isFinite(sourceMaxSpan)||sourceMaxSpan<=0)throw new Error('[JAGUAR V40] invalid source extent');

// Presentation-space fit only. The immutable Ear.Rodriguez donor payload remains in
// JaguarEarProxyV25; TEST KING derives a runtime surface without changing topology.
const targetLongestSpan=3.45;
const fitScale=targetLongestSpan/sourceMaxSpan;
const targetCentre=[0,1.58,0];
const calibratedSpan=sourceSpan.map(v=>v*fitScale);
const calibratedMin=calibratedSpan.map((v,i)=>targetCentre[i]-v/2);
d.min=calibratedMin;
d.span=calibratedSpan;

const decodeBytes=b64=>{const raw=atob(String(b64||'').replace(/\s+/g,''));const out=new Uint8Array(raw.length);for(let i=0;i<raw.length;i++)out[i]=raw.charCodeAt(i);return out};
const encodeBytes=bytes=>{let out='';for(let i=0;i<bytes.length;i+=0x8000)out+=String.fromCharCode(...bytes.subarray(i,Math.min(i+0x8000,bytes.length)));return btoa(out)};

// Founder visual correction: the verified low-poly donor reaches the renderer with a
// presentation pose that reads diagonally/upright in the encounter camera. Rotate the
// derived runtime coordinates around the room centre only; preserve every donor index.
// This is presentation orientation, not original animation or source-geometry custody.
const poseAngle=Math.PI/4;
const pc=Math.cos(poseAngle),ps=Math.sin(poseAngle);
const pBytes=decodeBytes(window.__JAGS33_P);
if(pBytes.byteLength!==d.verts*3*2)throw new Error('[JAGUAR V40] position payload length mismatch');
const pView=new DataView(pBytes.buffer,pBytes.byteOffset,pBytes.byteLength);
const positions=new Float32Array(d.verts*3);
for(let i=0;i<positions.length;i++){
 const axis=i%3;
 positions[i]=d.min[axis]+pView.getUint16(i*2,true)/65535*d.span[axis];
}
for(let i=0;i<d.verts;i++){
 const k=i*3,dx=positions[k]-targetCentre[0],dy=positions[k+1]-targetCentre[1];
 positions[k]=targetCentre[0]+pc*dx-ps*dy;
 positions[k+1]=targetCentre[1]+ps*dx+pc*dy;
}
const poseMin=[Infinity,Infinity,Infinity],poseMax=[-Infinity,-Infinity,-Infinity];
for(let i=0;i<d.verts;i++)for(let a=0;a<3;a++){const v=positions[i*3+a];if(v<poseMin[a])poseMin[a]=v;if(v>poseMax[a])poseMax[a]=v}
const poseSpan=poseMax.map((v,i)=>Math.max(1e-6,v-poseMin[i]));
const q=new Uint16Array(d.verts*3);
for(let i=0;i<q.length;i++){const a=i%3;q[i]=Math.max(0,Math.min(65535,Math.round((positions[i]-poseMin[a])/poseSpan[a]*65535)))}
window.__JAGS33_P=encodeBytes(new Uint8Array(q.buffer,q.byteOffset,q.byteLength));

const nBytes=decodeBytes(window.__JAGS33_N);
if(nBytes.byteLength!==d.verts*3)throw new Error('[JAGUAR V40] normal payload length mismatch');
for(let i=0;i<d.verts;i++){
 const k=i*3,nx=(nBytes[k]-127.5)/127.5,ny=(nBytes[k+1]-127.5)/127.5,nz=(nBytes[k+2]-127.5)/127.5;
 const rx=pc*nx-ps*ny,ry=ps*nx+pc*ny,m=Math.hypot(rx,ry,nz)||1;
 nBytes[k]=Math.max(0,Math.min(255,Math.round(rx/m*127.5+127.5)));
 nBytes[k+1]=Math.max(0,Math.min(255,Math.round(ry/m*127.5+127.5)));
 nBytes[k+2]=Math.max(0,Math.min(255,Math.round(nz/m*127.5+127.5)));
}
window.__JAGS33_N=encodeBytes(nBytes);
d.min=poseMin;
d.span=poseSpan;
d.runtimeCalibration={
 version:'room-fit-v40',
 method:'DYNAMIC_BOUNDS_PLUS_SOURCE_DERIVED_PRESENTATION_POSE',
 fitScale,targetLongestSpan,targetCentre,sourceMin,sourceSpan,
 calibratedMin,calibratedSpan,poseAngleRadians:poseAngle,poseMin:d.min.slice(),poseSpan:d.span.slice(),
 sourceTopology:d.topology,
 sourcePayloadPreservedIn:'window.JaguarEarProxyV25.payload',
 positionDerivative:'ROTATION_ONLY_AFTER_UNIFORM_ROOM_FIT; DONOR INDEX BUFFER UNCHANGED',
 motionTruth:'PROCEDURAL_RUNTIME; NOT ORIGINAL ANIMATION',
 purpose:'PRESENT_A_RECOGNISABLE_HORIZONTAL_EAR_DERIVED_JAGUAR_IN_THE_ENCOUNTER_ROOM'
};
window.__JAGUAR_RUNTIME_CALIBRATION_V38=d.runtimeCalibration;

// Enforce double-sided creature rendering and preserve the tiny low-poly framebuffer so
// exact browser QA reads the same rendered frame the Founder sees. This is scoped only
// to the Jaguar encounter canvas and does not relax geometry/topology assertions.
const nativeGetContext=HTMLCanvasElement.prototype.getContext;
HTMLCanvasElement.prototype.getContext=function(type,attrs){
 let nextAttrs=attrs;
 if(type==='webgl'&&this.parentElement?.id==='three-stage')nextAttrs={...(attrs||{}),preserveDrawingBuffer:true};
 const ctx=nativeGetContext.call(this,type,nextAttrs);
 if(ctx&&type==='webgl'&&this.parentElement?.id==='three-stage'&&!ctx.__fourplanetJaguarVisibility){
  ctx.__fourplanetJaguarVisibility=true;
  const nativeEnable=ctx.enable.bind(ctx);
  ctx.enable=(cap)=>cap===ctx.CULL_FACE?undefined:nativeEnable(cap);
  ctx.disable(ctx.CULL_FACE);
  this.style.filter='sepia(.72) saturate(1.55) hue-rotate(338deg) brightness(.96) contrast(1.08)';
 }
 return ctx;
};

// Fail-closed creature-pixel evidence. preserveDrawingBuffer makes this a valid read of
// the actual rendered encounter rather than an already-discarded browser compositor frame.
const root=document.getElementById('jaguar-experience');
const stage=document.getElementById('three-stage');
const verifyPixels=()=>{
 const canvas=stage?.querySelector('canvas');
 if(!canvas)return;
 const gl=nativeGetContext.call(canvas,'webgl',{preserveDrawingBuffer:true});
 if(!gl)return;
 requestAnimationFrame(()=>requestAnimationFrame(()=>{
  try{
   const w=gl.drawingBufferWidth,h=gl.drawingBufferHeight;
   if(!w||!h)return;
   const pixels=new Uint8Array(w*h*4);
   gl.readPixels(0,0,w,h,gl.RGBA,gl.UNSIGNED_BYTE,pixels);
   let opaque=0,lit=0;
   for(let i=0;i<pixels.length;i+=4){const a=pixels[i+3];if(a>24){opaque++;if(pixels[i]+pixels[i+1]+pixels[i+2]>36)lit++;}}
   const ratio=opaque/(w*h),litRatio=lit/(w*h),visible=ratio>0.002&&litRatio>0.001;
   root.dataset.jaguarVisual=visible?'visible':'failed';
   root.dataset.jaguarPixelRatio=ratio.toFixed(5);
   root.dataset.jaguarLitRatio=litRatio.toFixed(5);
   if(!visible)console.error('[JAGUAR V40] WebGL ready without visible creature pixels',{ratio,litRatio,w,h});
  }catch(err){console.error('[JAGUAR V40] framebuffer verification failed',err);root.dataset.jaguarVisual='failed';}
 }));
};
if(root){
 const observer=new MutationObserver(()=>{if(root.dataset.jaguar3d==='ready'&&!root.dataset.jaguarVisual)verifyPixels()});
 observer.observe(root,{attributes:true,attributeFilter:['data-jaguar3d']});
 if(root.dataset.jaguar3d==='ready')verifyPixels();
}
})();