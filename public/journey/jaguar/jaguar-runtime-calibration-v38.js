(()=>{
'use strict';
const d=window.__JAGS33;
if(!d||!Array.isArray(d.min)||!Array.isArray(d.span))throw new Error('[JAGUAR V42] indexed surface metadata missing');
if(d.topology!=='CONTROLLED_DONOR_INDEX_BUFFER')throw new Error('[JAGUAR V42] refuses non-indexed / synthetic topology');
if(d.headPositiveX!==true)throw new Error('[JAGUAR V42] canonical Ear orientation metadata missing');
const sourceMin=d.min.slice();
const sourceSpan=d.span.slice();
if(sourceMin.length!==3||sourceSpan.length!==3||sourceSpan.some(v=>!Number.isFinite(v)||v<=0))throw new Error('[JAGUAR V42] invalid source bounds');
const sourceMaxSpan=Math.max(...sourceSpan);
if(!Number.isFinite(sourceMaxSpan)||sourceMaxSpan<=0)throw new Error('[JAGUAR V42] invalid source extent');

// Legacy fallback calibration only. Ear.Rodriguez QPOS16 payload and controlled donor indices
// remain immutable. V48+ owns the primary local full-source derivative when ready.
const targetLongestSpan=3.45;
const fitScale=targetLongestSpan/sourceMaxSpan;
const targetCentre=[0,1.58,0];
const calibratedSpan=sourceSpan.map(v=>v*fitScale);
const calibratedMin=calibratedSpan.map((v,i)=>targetCentre[i]-v/2);
d.min=calibratedMin;
d.span=calibratedSpan;
d.runtimeCalibration={
 version:'room-fit-v42',
 method:'DYNAMIC_BOUNDS_CANONICAL_QUADRUPED_DOUBLE_SIDED_VISIBILITY_SETTLE_AWARE',
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
 materialTruth:'PRESENTATION COLOUR GRADE ONLY; NOT ORIGINAL EAR TEXTURE OR MATERIAL',
 purpose:'FIT_AND_VERIFY_RECOGNISABLE_INDEXED_EAR_JAGUAR_WITHOUT_MUTATING_SOURCE_TOPOLOGY_PAYLOAD_OR_CANONICAL_QUADRUPED_POSE'
};
window.__JAGUAR_RUNTIME_CALIBRATION_V38=d.runtimeCalibration;

const root=document.getElementById('jaguar-experience');
const stage=document.getElementById('three-stage');
const fullSourceReady=()=>root?.dataset.jaguarEarFull==='ready';
const isLegacyCanvas=(canvas)=>canvas?.parentElement?.id==='three-stage'&&!canvas.classList.contains('jaguar-local-v48');

// Scope legacy visibility hardening strictly to the old fallback canvas. Never mutate
// the V48+ primary canvas filter/material state or its source-bind-pose metadata.
const nativeGetContext=HTMLCanvasElement.prototype.getContext;
HTMLCanvasElement.prototype.getContext=function(type,attrs){
 let nextAttrs=attrs;
 if(type==='webgl'&&isLegacyCanvas(this))nextAttrs={...(attrs||{}),preserveDrawingBuffer:true};
 const ctx=nativeGetContext.call(this,type,nextAttrs);
 if(ctx&&type==='webgl'&&isLegacyCanvas(this)&&!ctx.__fourplanetJaguarVisibility){
  ctx.__fourplanetJaguarVisibility=true;
  const nativeEnable=ctx.enable.bind(ctx);
  ctx.enable=(cap)=>cap===ctx.CULL_FACE?undefined:nativeEnable(cap);
  ctx.disable(ctx.CULL_FACE);
  this.style.filter='sepia(.58) saturate(1.38) hue-rotate(342deg) brightness(1.16) contrast(1.12)';
  this.dataset.jaguarMaterial='presentation-grade-v42';
 }
 return ctx;
};

// Legacy fallback pixel proof only. When the local V48+ source derivative is ready,
// its runtime owns pose/material/visibility truth and this verifier must stand down.
let verifyStart=0;
let verifyTimer=0;
const verifyPixels=()=>{
 if(!root||root.dataset.jaguar3d!=='ready'||fullSourceReady())return;
 const canvas=[...(stage?.querySelectorAll('canvas')||[])].find(isLegacyCanvas);
 if(!canvas)return;
 const gl=nativeGetContext.call(canvas,'webgl',{preserveDrawingBuffer:true});
 if(!gl)return;
 if(!verifyStart)verifyStart=performance.now();
 root.dataset.jaguarVisual='pending';
 requestAnimationFrame(()=>requestAnimationFrame(()=>{
  try{
   if(fullSourceReady())return;
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
   root.dataset.jaguarPixelRatio=ratio.toFixed(5);
   root.dataset.jaguarLitRatio=litRatio.toFixed(5);
   root.dataset.jaguarPose='canonical-quadruped';
   root.dataset.jaguarMaterial='presentation-grade-v42';
   if(visible){
    root.dataset.jaguarVisual='visible';
    if(verifyTimer)clearTimeout(verifyTimer);
    return;
   }
   const elapsed=performance.now()-verifyStart;
   if(elapsed<3200){
    verifyTimer=setTimeout(verifyPixels,180);
   }else{
    root.dataset.jaguarVisual='failed';
    console.error('[JAGUAR V42] WebGL ready without visible creature pixels after settle window',{ratio,litRatio,w,h,elapsed});
   }
  }catch(err){
   console.error('[JAGUAR V42] framebuffer verification failed',err);
   root.dataset.jaguarVisual='failed';
  }
 }));
};
if(root){
 const observer=new MutationObserver(()=>{
  if(root.dataset.jaguar3d==='ready'&&!fullSourceReady()){
   verifyStart=0;
   if(verifyTimer)clearTimeout(verifyTimer);
   verifyPixels();
  }
 });
 observer.observe(root,{attributes:true,attributeFilter:['data-jaguar3d','data-jaguar-ear-full']});
 if(root.dataset.jaguar3d==='ready'&&!fullSourceReady())verifyPixels();
}
})();