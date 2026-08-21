const SOURCE_BASE='https://raw.githubusercontent.com/kristenmarcinek/game615-spring2023-06/728230086493b1f1cee6a410d0a8ea7c0991f6ff/exercise06/Assets/Models/Jaguar/';
const SOURCE_PAGE='https://poly.pizza/m/4fb-oMr2uUF';
const ATTRIBUTION='JAGUAR · POLY BY GOOGLE · CC BY 3.0 · VIA POLY PIZZA';
const root=document.getElementById('browser-experience');
let THREE,MTLLoader,OBJLoader,runtimePromise,host,renderer,scene,camera,model,resizeObserver;
let frame=0,ready=false,loading=false,active=false,dragging=false,pointerX=0;
let yaw=Math.PI/2,targetYaw=Math.PI/2,baseScale=1,basePosition={x:0,y:0,z:0};
let revealStart=0;
const fullTier=()=>root?.dataset.performanceTier!=='lite';
const identityScene=()=>root?.dataset.sceneState==='identity'||root?.dataset.cinematicScene==='identity';
const reduced=()=>window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const clamp=(v,min,max)=>Math.min(max,Math.max(min,v));
const easeOut=(t)=>1-Math.pow(1-clamp(t,0,1),3);
const loadRuntime=()=>runtimePromise||(runtimePromise=Promise.all([import('three'),import('three/addons/loaders/MTLLoader.js'),import('three/addons/loaders/OBJLoader.js')]).then(([three,mtl,obj])=>{THREE=three;MTLLoader=mtl.MTLLoader;OBJLoader=obj.OBJLoader;}));
const ensureHost=()=>{
  if(!root||host)return host;
  host=document.createElement('section');host.className='nature-3d-subject nature-3d-subject--v17';host.dataset.visible='false';host.dataset.ready='false';host.dataset.motion='approach';
  host.setAttribute('aria-label','Interactive 3D Jaguar study — stylised model, not a live animal');
  host.innerHTML=`<div class="nature-3d-subject__halo" aria-hidden="true"></div><div class="nature-3d-subject__depth" aria-hidden="true"></div><div class="nature-3d-subject__viewport"></div><div class="nature-3d-subject__gesture" aria-hidden="true"><b>DRAG TO EXPLORE</b><span>3D STUDY · BROWSER NATIVE</span></div><div class="nature-3d-subject__meta"><span>STYLISED 3D STUDY · NOT A LIVE ANIMAL</span><a href="${SOURCE_PAGE}" target="_blank" rel="noreferrer">${ATTRIBUTION}</a></div><div class="nature-3d-subject__loading">LOADING INTERACTIVE JAGUAR…</div>`;
  root.appendChild(host);
  host.addEventListener('pointerdown',e=>{if(!ready||!active)return;dragging=true;pointerX=e.clientX;host.setPointerCapture?.(e.pointerId);host.dataset.dragging='true';});
  host.addEventListener('pointermove',e=>{if(!dragging||!active)return;const delta=e.clientX-pointerX;pointerX=e.clientX;targetYaw+=delta*.0065;});
  const end=e=>{dragging=false;host.dataset.dragging='false';try{host.releasePointerCapture?.(e.pointerId);}catch{}};
  host.addEventListener('pointerup',end);host.addEventListener('pointercancel',end);
  return host;
};
const resize=()=>{if(!host||!renderer||!camera)return;const vp=host.querySelector('.nature-3d-subject__viewport');const w=Math.max(1,vp?.clientWidth||host.clientWidth),h=Math.max(1,vp?.clientHeight||host.clientHeight);renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();};
const fitModel=object=>{const box=new THREE.Box3().setFromObject(object);const center=box.getCenter(new THREE.Vector3());const size=box.getSize(new THREE.Vector3());const longest=Math.max(size.x,size.y,size.z)||1;baseScale=4.35/longest;object.scale.setScalar(baseScale);basePosition={x:-center.x*baseScale,y:(-center.y+size.y*.015)*baseScale,z:-center.z*baseScale};object.position.set(basePosition.x,basePosition.y,basePosition.z);object.rotation.y=yaw;};
const makeScene=()=>{scene=new THREE.Scene();camera=new THREE.PerspectiveCamera(26,1,.01,100);camera.position.set(0,.02,6.15);camera.lookAt(0,0,0);const vp=host.querySelector('.nature-3d-subject__viewport');renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:'high-performance'});renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.8));renderer.setClearColor(0x000000,0);renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.1;renderer.domElement.setAttribute('aria-hidden','true');vp.appendChild(renderer.domElement);scene.add(new THREE.HemisphereLight(0xeaffef,0x08150c,2.4));const key=new THREE.DirectionalLight(0xfff4df,4.1);key.position.set(-3.8,5.2,5);scene.add(key);const rim=new THREE.DirectionalLight(0x3ae86f,1.7);rim.position.set(4.2,2.5,-3);scene.add(rim);const fill=new THREE.DirectionalLight(0x6da9ff,.9);fill.position.set(-1,-2,4);scene.add(fill);resizeObserver=new ResizeObserver(resize);resizeObserver.observe(vp);resize();};
const loadModel=async()=>{
  if(!root||!fullTier()||ready||loading||!identityScene())return;loading=true;ensureHost();host.dataset.loading='true';root.dataset.jaguar3d='loading';
  try{await loadRuntime();makeScene();const manager=new THREE.LoadingManager();manager.setURLModifier(url=>/Jaguar_BaseColor\.png(?:\?|$)/i.test(url)?`${SOURCE_BASE}Jaguar_BaseColor.png`:url);const mtl=new MTLLoader(manager);mtl.setResourcePath(SOURCE_BASE);const materials=await mtl.loadAsync(`${SOURCE_BASE}Jaguar.mtl`);materials.preload();const obj=new OBJLoader(manager);obj.setMaterials(materials);model=await obj.loadAsync(`${SOURCE_BASE}Jaguar.obj`);model.traverse(child=>{if(!child.isMesh)return;child.frustumCulled=true;const mats=Array.isArray(child.material)?child.material:[child.material];mats.forEach(mat=>{if(!mat)return;mat.transparent=false;mat.depthWrite=true;if('shininess'in mat)mat.shininess=12;});});fitModel(model);scene.add(model);ready=true;loading=false;host.dataset.ready='true';host.dataset.loading='false';root.dataset.jaguar3d='ready';root.dataset.jaguar3dSource='poly-google-ccby3';if(active&&identityScene())show({restartReveal:true});}
  catch(error){loading=false;root.dataset.jaguar3d='failed';host.dataset.loading='false';host.dataset.ready='false';console.warn('[4PLANET JOURNEY] 3D Jaguar failed closed; controlled 2D species media remains.',error);}
};
const show=({restartReveal=false}={})=>{if(!host||!ready||!identityScene())return;active=true;if(restartReveal||!revealStart)revealStart=performance.now();host.dataset.visible='true';host.style.setProperty('display','block','important');host.style.setProperty('visibility','visible','important');host.style.setProperty('opacity','1','important');host.style.setProperty('pointer-events','auto','important');root.dataset.jaguar3dActive='true';root.querySelector('.nature-subject')?.setAttribute('data-three-replaced','true');resize();if(!frame)frame=requestAnimationFrame(tick);};
const hide=()=>{active=false;if(host){host.dataset.visible='false';host.style.setProperty('visibility','hidden','important');host.style.setProperty('opacity','0','important');host.style.setProperty('pointer-events','none','important');}if(root)root.dataset.jaguar3dActive='false';root?.querySelector('.nature-subject')?.setAttribute('data-three-replaced','false');if(frame)cancelAnimationFrame(frame);frame=0;};
const tick=time=>{frame=0;if(!active||!ready||!renderer||!scene||!camera||!model||!identityScene())return;yaw+=(targetYaw-yaw)*.075;model.rotation.y=yaw;const t=reduced()?1:easeOut((time-revealStart)/2100);const approach=reduced()?1:t;const breath=1+Math.sin(time*.0016)*.008;model.scale.setScalar(baseScale*breath*(.78+.22*approach));model.position.set(basePosition.x,basePosition.y+Math.sin(time*.00125)*.014,basePosition.z+(1-approach)*-.62);camera.position.z=6.35-approach*.35;camera.position.x=Math.sin(time*.00022)*.035;camera.lookAt(0,.02,0);renderer.render(scene,camera);host.dataset.approachComplete=String(approach>.985);frame=requestAnimationFrame(tick);};
const setFocus=async isActive=>{if(!isActive){hide();return;}if(!fullTier()||!identityScene())return;active=true;await loadModel();if(ready)show({restartReveal:true});};
if(root){
  ensureHost();
  root.dataset.jaguar3dMode='manual-study';
  root.dataset.jaguar3dActive='false';
  window.addEventListener('4planet:nature-browser-enter',()=>{hide();});
  window.addEventListener('4planet:nature-journey-scene',event=>{const index=Number(event.detail?.index||0);if(index!==0||!identityScene())hide();});
  window.addEventListener('4planet:nature-world-interaction',event=>{if(event.detail?.action==='focus')setFocus(Boolean(event.detail?.active));});
  window.addEventListener('pagehide',()=>{hide();resizeObserver?.disconnect();renderer?.dispose();},{once:true});
}
