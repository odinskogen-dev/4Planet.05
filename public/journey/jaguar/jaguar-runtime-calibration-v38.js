(()=>{
'use strict';
const d=window.__JAGS33;
if(!d||!Array.isArray(d.min)||!Array.isArray(d.span))throw new Error('[JAGUAR V38] indexed surface metadata missing');
if(d.topology!=='CONTROLLED_DONOR_INDEX_BUFFER')throw new Error('[JAGUAR V38] refuses non-indexed / synthetic topology');
const sourceMin=d.min.slice();
const sourceSpan=d.span.slice();
if(sourceMin.length!==3||sourceSpan.length!==3||sourceSpan.some(v=>!Number.isFinite(v)||v<=0))throw new Error('[JAGUAR V38] invalid source bounds');
const sourceMaxSpan=Math.max(...sourceSpan);
if(!Number.isFinite(sourceMaxSpan)||sourceMaxSpan<=0)throw new Error('[JAGUAR V38] invalid source extent');

// Camera-space fit, not source-geometry mutation. The QPOS16 payload and donor index
// buffer remain immutable; only the decode bounds are remapped so every verified Ear
// derivative occupies a predictable, visible volume in the encounter room.
const targetLongestSpan=3.45;
const fitScale=targetLongestSpan/sourceMaxSpan;
const targetCentre=[0,1.58,0];
const calibratedSpan=sourceSpan.map(v=>v*fitScale);
const calibratedMin=calibratedSpan.map((v,i)=>targetCentre[i]-v/2);

d.min=calibratedMin;
d.span=calibratedSpan;
d.runtimeCalibration={
 version:'room-fit-v39',
 method:'DYNAMIC_BOUNDS_NORMALISATION_DOUBLE_SIDED_VISIBILITY',
 fitScale,
 targetLongestSpan,
 targetCentre,
 sourceMin,
 sourceSpan,
 calibratedMin:d.min.slice(),
 calibratedSpan:d.span.slice(),
 sourceTopology:d.topology,
 purpose:'FIT_RECOGNISABLE_INDEXED_EAR_JAGUAR_TO_ENCOUNTER_CAMERA_WITHOUT_MUTATING_SOURCE_TOPOLOGY_OR_PAYLOAD'
};
window.__JAGUAR_RUNTIME_CALIBRATION_V38=d.runtimeCalibration;

// The controlled Ear proxy preserves donor triangle indices. Winding orientation is
// presentation data, not ecological/source truth. The previous runtime enabled BACK
// face culling unconditionally; if donor winding is opposite the camera convention the
// mesh can report `ready` while every visible triangle is discarded. Scope the fix to
// the Jaguar encounter canvas only and keep the exact indexed topology untouched.
const nativeGetContext=HTMLCanvasElement.prototype.getContext;
HTMLCanvasElement.prototype.getContext=function(type,attrs){
 const ctx=nativeGetContext.call(this,type,attrs);
 if(ctx&&type==='webgl'&&this.parentElement?.id==='three-stage'&&!ctx.__fourplanetJaguarVisibility){
  ctx.__fourplanetJaguarVisibility=true;
  const nativeEnable=ctx.enable.bind(ctx);
  ctx.enable=(cap)=>cap===ctx.CULL_FACE?undefined:nativeEnable(cap);
  ctx.disable(ctx.CULL_FACE);
 }
 return ctx;
};

// One-shot framebuffer evidence. A large canvas is not proof that the creature itself
// rendered. When the runtime reaches ready, sample the actual WebGL framebuffer and
// expose a fail-closed visual state for browser QA.
const root=document.getElementById('jaguar-experience');
const stage=document.getElementById('three-stage');
const verifyPixels=()=>{
 const canvas=stage?.querySelector('canvas');
 if(!canvas)return;
 const gl=nativeGetContext.call(canvas,'webgl');
 if(!gl)return;
 requestAnimationFrame(()=>requestAnimationFrame(()=>{
  try{
   const w=gl.drawingBufferWidth,h=gl.drawingBufferHeight;
   if(!w||!h)return;
   const pixels=new Uint8Array(w*h*4);
   gl.readPixels(0,0,w,h,gl.RGBA,gl.UNSIGNED_BYTE,pixels);
   let opaque=0,lit=0;
   for(let i=0;i<pixels.length;i+=4){
    const a=pixels[i+3];
    if(a>24){opaque++;if(pixels[i]+pixels[i+1]+pixels[i+2]>36)lit++;}
   }
   const ratio=opaque/(w*h),litRatio=lit/(w*h);
   const visible=ratio>0.002&&litRatio>0.001;
   root.dataset.jaguarVisual=visible?'visible':'failed';
   root.dataset.jaguarPixelRatio=ratio.toFixed(5);
   root.dataset.jaguarLitRatio=litRatio.toFixed(5);
   if(!visible)console.error('[JAGUAR V39] WebGL ready without visible creature pixels',{ratio,litRatio,w,h});
  }catch(err){console.error('[JAGUAR V39] framebuffer verification failed',err);root.dataset.jaguarVisual='failed';}
 }));
};
if(root){
 const observer=new MutationObserver(()=>{
  if(root.dataset.jaguar3d==='ready'&&!root.dataset.jaguarVisual){verifyPixels();}
 });
 observer.observe(root,{attributes:true,attributeFilter:['data-jaguar3d']});
 if(root.dataset.jaguar3d==='ready')verifyPixels();
}
})();
