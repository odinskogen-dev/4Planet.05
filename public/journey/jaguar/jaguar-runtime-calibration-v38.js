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

// Camera-space fit only. The Ear.Rodriguez QPOS16 payload and donor index buffer stay
// immutable. Presentation pose is injected into the Jaguar vertex shader below.
const targetLongestSpan=3.45;
const fitScale=targetLongestSpan/sourceMaxSpan;
const targetCentre=[0,1.58,0];
const calibratedSpan=sourceSpan.map(v=>v*fitScale);
const calibratedMin=calibratedSpan.map((v,i)=>targetCentre[i]-v/2);
d.min=calibratedMin;
d.span=calibratedSpan;
d.runtimeCalibration={
 version:'room-fit-v40',
 method:'DYNAMIC_BOUNDS_NORMALISATION_DOUBLE_SIDED_VISIBILITY_POSE',
 fitScale,
 targetLongestSpan,
 targetCentre,
 sourceMin,
 sourceSpan,
 calibratedMin:d.min.slice(),
 calibratedSpan:d.span.slice(),
 sourceTopology:d.topology,
 presentationPoseRadians:Math.PI/4,
 sourcePayloadPreservedIn:'window.JaguarEarProxyV25.payload',
 motionTruth:'PROCEDURAL_RUNTIME; NOT ORIGINAL ANIMATION',
 purpose:'FIT_AND_ORIENT_RECOGNISABLE_INDEXED_EAR_JAGUAR_WITHOUT_MUTATING_SOURCE_TOPOLOGY_OR_PAYLOAD'
};
window.__JAGUAR_RUNTIME_CALIBRATION_V38=d.runtimeCalibration;

// Scope all presentation corrections to the Jaguar encounter canvas. The donor geometry
// remains untouched: shader-space pose only, no index/position payload rewrite.
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

  // Source-derived proxy currently presents diagonally/upright in the encounter camera.
  // Rotate only presentation-space positions/normals around the calibrated room centre.
  const nativeShaderSource=ctx.shaderSource.bind(ctx);
  ctx.shaderSource=(shader,src)=>{
   let next=String(src);
   if(next.includes('attribute vec3 aPosition')&&next.includes('p.y=base+(p.y-base)*stretch;')){
    next=next.replace(
     'p.y=base+(p.y-base)*stretch;',
     'p.y=base+(p.y-base)*stretch;vec3 poseCentre=vec3(0.0,1.58,0.0);p-=poseCentre;float poseC=.70710678,poseS=.70710678;p=vec3(poseC*p.x-poseS*p.y,poseS*p.x+poseC*p.y,p.z);p+=poseCentre;'
    );
    next=next.replace(
     'vec3 n=aNormal;',
     'vec3 n=aNormal;n=normalize(vec3(poseC*n.x-poseS*n.y,poseS*n.x+poseC*n.y,n.z));'
    );
   }
   nativeShaderSource(shader,next);
  };
  this.style.filter='sepia(.72) saturate(1.55) hue-rotate(338deg) brightness(.96) contrast(1.08)';
 }
 return ctx;
};

// Fail closed on actual creature pixels. preserveDrawingBuffer makes the delayed QA read
// a valid rendered Jaguar frame instead of an already-discarded compositor buffer.
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
   if(!visible)console.error('[JAGUAR V40] WebGL ready without visible creature pixels',{ratio,litRatio,w,h});
  }catch(err){console.error('[JAGUAR V40] framebuffer verification failed',err);root.dataset.jaguarVisual='failed';}
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