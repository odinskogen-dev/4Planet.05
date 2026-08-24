(()=>{
'use strict';
const d=window.__JAGS33;
if(!d||!Array.isArray(d.min)||!Array.isArray(d.span))throw new Error('[JAGUAR V41] indexed surface metadata missing');
if(d.topology!=='CONTROLLED_DONOR_INDEX_BUFFER')throw new Error('[JAGUAR V41] refuses non-indexed / synthetic topology');
if(d.headPositiveX!==true)throw new Error('[JAGUAR V41] canonical Ear orientation metadata missing');
const sourceMin=d.min.slice();
const sourceSpan=d.span.slice();
if(sourceMin.length!==3||sourceSpan.length!==3||sourceSpan.some(v=>!Number.isFinite(v)||v<=0))throw new Error('[JAGUAR V41] invalid source bounds');
const sourceMaxSpan=Math.max(...sourceSpan);
if(!Number.isFinite(sourceMaxSpan)||sourceMaxSpan<=0)throw new Error('[JAGUAR V41] invalid source extent');

// Camera-space fit only. Ear.Rodriguez QPOS16 payload and controlled donor indices stay
// immutable. The donor metadata already defines headPositiveX: X is the body/head axis,
// Y is vertical. Do NOT rotate X into Y: the previous 45deg XY presentation correction
// turned the quadruped into the diagonal/upright silhouette seen in browser evidence.
const targetLongestSpan=3.45;
const fitScale=targetLongestSpan/sourceMaxSpan;
const targetCentre=[0,1.58,0];
const calibratedSpan=sourceSpan.map(v=>v*fitScale);
const calibratedMin=calibratedSpan.map((v,i)=>targetCentre[i]-v/2);
d.min=calibratedMin;
d.span=calibratedSpan;
d.runtimeCalibration={
 version:'room-fit-v41',
 method:'DYNAMIC_BOUNDS_CANONICAL_QUADRUPED_DOUBLE_SIDED_VISIBILITY',
 fitScale,
 targetLongestSpan,
 targetCentre,
 sourceMin,
 sourceSpan,
 calibratedMin:d.min.slice(),
 calibratedSpan:d.span.slice(),
 sourceTopology:d.topology,
 sourceOrientation:'HEAD_POSITIVE_X_Y_UP',
 presentationPoseRadians:0,
 sourcePayloadPreservedIn:'window.JaguarEarProxyV25.payload',
 motionTruth:'PROCEDURAL_RUNTIME; NOT ORIGINAL ANIMATION',
 purpose:'FIT_RECOGNISABLE_INDEXED_EAR_JAGUAR_WITHOUT_MUTATING_SOURCE_TOPOLOGY_PAYLOAD_OR_CANONICAL_QUADRUPED_POSE'
};
window.__JAGUAR_RUNTIME_CALIBRATION_V38=d.runtimeCalibration;

// Scope visibility hardening to the Jaguar encounter canvas. No geometry mutation.
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
  // Presentation colour only. This is not claimed as original Ear texture/material.
  this.style.filter='sepia(.72) saturate(1.55) hue-rotate(338deg) brightness(1.08) contrast(1.08)';
 }
 return ctx;
};

// Fail closed on actual creature pixels. preserveDrawingBuffer makes the delayed QA read
// the same rendered Jaguar frame that the user sees rather than a discarded backbuffer.
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
   for(let i=0;i<pixels.length;i+=4){
    const a=pixels[i+3];
    if(a>24){opaque++;if(pixels[i]+pixels[i+1]+pixels[i+2]>36)lit++;}
   }
   const ratio=opaque/(w*h),litRatio=lit/(w*h);
   const visible=ratio>0.002&&litRatio>0.001;
   root.dataset.jaguarVisual=visible?'visible':'failed';
   root.dataset.jaguarPixelRatio=ratio.toFixed(5);
   root.dataset.jaguarLitRatio=litRatio.toFixed(5);
   root.dataset.jaguarPose='canonical-quadruped';
   if(!visible)console.error('[JAGUAR V41] WebGL ready without visible creature pixels',{ratio,litRatio,w,h});
  }catch(err){console.error('[JAGUAR V41] framebuffer verification failed',err);root.dataset.jaguarVisual='failed';}
 }));
};
if(root){
 const observer=new MutationObserver(()=>{
  if(root.dataset.jaguar3d==='ready'&&!root.dataset.jaguarVisual)verifyPixels();
 });
 observer.observe(root,{attributes:true,attributeFilter:['data-jaguar3d']});
 if(root.dataset.jaguar3d==='ready')verifyPixels();
}
})();