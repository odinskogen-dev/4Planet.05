(()=>{
'use strict';
const root=document.getElementById('jaguar-experience');
const stage=document.getElementById('three-stage');
const status=document.getElementById('runtime-status');
const loading=document.getElementById('loading');
const fallback=document.getElementById('photo-fallback');
const creatureState=document.getElementById('creature-state');
const controls=document.getElementById('controls');
if(!root||!stage)return;

const UID='91c61c329d2a4668816f81f08dfcd492';
const SOURCE='https://sketchfab.com/3d-models/jaguar-91c61c329d2a4668816f81f08dfcd492';
const API_SRC='https://static.sketchfab.com/api/sketchfab-viewer-1.12.1.js';
const READY_TIMEOUT=20000;
let shell=null,iframe=null,api=null,ready=false,failed=false,booted=false,timer=0,animationUid=null;

function setCopy(mode){
 const truth=document.querySelector('.species-card .truth');
 const dialog=document.querySelector('#evidence-dialog p');
 const footer=document.querySelector('.footer span:last-child');
 const lume=document.querySelector('.lume-intel--species small');
 if(mode==='ready'){
  if(status)status.textContent='EAR JAGUAR · SOURCE MODEL ACTIVE';
  if(creatureState)creatureState.textContent='The rights-verified Ear.Rodriguez source model is active in the jungle room. Drag to turn it; MOVE restarts the source animation.';
  if(truth)truth.textContent='EAR.RODRIGUEZ SOURCE MODEL · CC BY 4.0 · EXTERNAL VERIFIED VIEWER · NOT LIVE ANIMAL DATA';
  if(dialog)dialog.textContent='This encounter presents the Ear.Rodriguez Jaguar source model through its official viewer after viewer-ready and scene-graph verification. The model is CC BY 4.0. This is presentation media, not a live animal, occurrence record or ecological measurement.';
  if(footer)footer.textContent='EAR.RODRIGUEZ SOURCE MODEL · JUNGLE ROOM / LUME ROOM · FULL 8-SCENE JOURNEY';
  if(lume)lume.textContent='EAR.RODRIGUEZ SOURCE MODEL · CC BY 4.0';
 }
}

function fail(reason){
 if(failed||ready)return;
 failed=true;
 if(timer)clearTimeout(timer);
 root.dataset.jaguar3d='failed';
 root.dataset.jaguar3dBridge='failed';
 root.dataset.jaguar3dFailure=reason;
 if(shell)shell.remove();
 if(loading)loading.hidden=true;
 if(fallback)fallback.hidden=false;
 if(status)status.textContent='CONTROLLED SPECIES MEDIA';
 if(creatureState)creatureState.textContent='The verified 3D source could not be confirmed on this device. Controlled Jaguar species media remains visible; the full eight-scene journey is still available.';
}

function ensureShell(){
 if(shell)return shell;
 shell=document.createElement('div');
 shell.className='ear-source-bridge-v34';
 shell.dataset.ready='false';
 shell.setAttribute('aria-label','Interactive 3D Jaguar source model by Ear.Rodriguez');
 Object.assign(shell.style,{position:'absolute',inset:'0',zIndex:'4',opacity:'0',transition:'opacity 500ms ease',overflow:'hidden'});
 iframe=document.createElement('iframe');
 iframe.title='Interactive 3D Jaguar by Ear.Rodriguez';
 iframe.allow='autoplay; fullscreen; xr-spatial-tracking';
 iframe.setAttribute('allowfullscreen','');
 iframe.setAttribute('loading','eager');
 Object.assign(iframe.style,{width:'100%',height:'100%',border:'0',display:'block',background:'transparent'});
 shell.appendChild(iframe);
 stage.appendChild(shell);
 return shell;
}

function loadApi(){
 if(window.Sketchfab)return Promise.resolve();
 return new Promise((resolve,reject)=>{
  const existing=document.querySelector('script[data-ear-sketchfab-api]');
  if(existing){
   existing.addEventListener('load',resolve,{once:true});
   existing.addEventListener('error',reject,{once:true});
   if(window.Sketchfab)resolve();
   return;
  }
  const s=document.createElement('script');
  s.src=API_SRC;s.async=true;s.dataset.earSketchfabApi='true';
  s.addEventListener('load',resolve,{once:true});s.addEventListener('error',reject,{once:true});
  document.head.appendChild(s);
 });
}

function verifyScene(){
 if(!api?.getSceneGraph)return fail('scene-graph-check-unavailable');
 api.getSceneGraph((err,graph)=>{
  if(err||!graph)return fail('scene-graph-unavailable');
  api.getAnimations?.((animationError,animations)=>{
   if(!animationError&&Array.isArray(animations)&&animations.length){
    const a=animations[0];animationUid=a?.[0]||a?.uid||null;
    if(animationUid&&api.setCurrentAnimationByUID)api.setCurrentAnimationByUID(animationUid);
    api.setCycleMode?.('loopOne');api.setSpeed?.(.55);api.play?.();
    root.dataset.jaguarAnimation='source-baked';
   }else root.dataset.jaguarAnimation='viewer-motion-unavailable';
  });
  if(timer)clearTimeout(timer);
  ready=true;failed=false;
  root.dataset.jaguar3d='ready';
  root.dataset.jaguar3dSource='ear-rodriguez-official-viewer-v34';
  root.dataset.jaguar3dBridge='verified';
  root.dataset.jaguar3dRights='cc-by-4.0';
  root.dataset.jaguar3dSourceUrl=SOURCE;
  shell.dataset.ready='true';shell.style.opacity='1';
  if(fallback)fallback.hidden=true;
  if(loading)loading.hidden=true;
  controls?.setAttribute('aria-hidden','false');
  setCopy('ready');
 });
}

async function boot(){
 if(booted||ready||failed||root.dataset.entered!=='true')return;
 booted=true;
 ensureShell();
 root.dataset.jaguar3d='loading-source';
 root.dataset.jaguar3dBridge='verifying';
 if(status)status.textContent='VERIFYING EAR JAGUAR SOURCE';
 timer=setTimeout(()=>fail('viewer-ready-timeout'),READY_TIMEOUT);
 try{
  await loadApi();
  if(!window.Sketchfab)return fail('viewer-api-unavailable');
  const client=new window.Sketchfab('1.12.1',iframe);
  client.init(UID,{
   autostart:1,preload:1,transparent:1,animation_autoplay:1,
   ui_controls:0,ui_infos:0,ui_stop:0,ui_watermark:0,ui_watermark_link:0,
   ui_help:0,ui_settings:0,ui_vr:0,ui_fullscreen:0,ui_annotations:0,dnt:1,
   success(nextApi){api=nextApi;api.start?.();api.addEventListener?.('viewerready',verifyScene);},
   error(){fail('viewer-init-error');}
  });
 }catch(err){console.warn('[4PLANET JAGUAR V34]',err);fail('viewer-api-error');}
}

function maybeRecover(){
 if(root.dataset.entered!=='true'||ready||failed)return;
 if(root.dataset.jaguar3d==='failed')boot();
}

controls?.addEventListener('click',event=>{
 if(!ready)return;
 const action=event.target?.dataset?.action;
 if(action==='move'){
  if(animationUid&&api?.setCurrentAnimationByUID)api.setCurrentAnimationByUID(animationUid);
  api?.seekTo?.(0);api?.play?.();
  if(creatureState)creatureState.textContent='The Ear.Rodriguez source animation restarts inside the clearing.';
 }
 if(action==='look'){
  api?.getCameraLookAt?.((err,camera)=>{
   if(err||!camera)return;
   const eye=camera.position||camera[0],target=camera.target||camera[1];
   if(eye&&target&&api.setCameraLookAt)api.setCameraLookAt(eye,target,1.0);
  });
  if(creatureState)creatureState.textContent='The camera settles on the Jaguar source model.';
 }
});

new MutationObserver(maybeRecover).observe(root,{attributes:true,attributeFilter:['data-jaguar3d','data-entered']});
addEventListener('4planet:jaguar-enter',()=>setTimeout(maybeRecover,0));
maybeRecover();
})();