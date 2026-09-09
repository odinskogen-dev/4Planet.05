(()=>{
'use strict';
const root=document.getElementById('jaguar-experience');
const stage=document.getElementById('three-stage');
const status=document.getElementById('runtime-status');
const fallback=document.getElementById('photo-fallback');
const creatureState=document.getElementById('creature-state');
const controls=document.getElementById('controls');
const loading=document.getElementById('loading');
if(!root||!stage)return;

const reduced=matchMedia('(prefers-reduced-motion:reduce)').matches;
const mobile=matchMedia('(max-width:760px)').matches;
const chapters=[
 {kicker:'01 / 08 · MEET LIFE',title:'Meet the jaguar.',body:'Look first. Then follow the living system around one animal.',boundary:'SOURCE-DERIVED 3D PRESENTATION · NOT A LIVE ANIMAL OR OCCURRENCE RECORD.',image:'/assets/missions/am4zonia/hero.jpg'},
 {kicker:'02 / 08 · LIVING WEB',title:'One life depends on many.',body:'Prey, water, cover and connected habitat make the animal possible.',boundary:'RELATIONSHIPS ARE SOURCE-AWARE; CO-LOCATION ALONE DOES NOT PROVE CAUSATION.',image:'/assets/species/giant-otter/SP-007.jpg'},
 {kicker:'03 / 08 · ECOSYSTEM + ATLAS',title:'The animal is not the whole story.',body:'Move outward from one creature into landscape, place and the wider Amazon system.',boundary:'MAP / HABITAT VIEWS ARE REPRESENTATIONS · NOT LIVE POSITION OR ABUNDANCE.',image:'/assets/missions/am4zonia/detail-01.jpg'},
 {kicker:'04 / 08 · PRESSURE',title:'The landscape changes.',body:'Fragmentation, fire and land-use pressure can reshape the connected system the jaguar depends on.',boundary:'PRESSURE ≠ SPECIFIC OUTCOME WITHOUT SUPPORTING EVIDENCE.',image:'/assets/brand/pressure-doc.jpg'},
 {kicker:'05 / 08 · UNDERSTANDING',title:'See the system before acting.',body:'Evidence, monitoring and local knowledge determine which interventions make sense.',boundary:'EVIDENCE QUALITY AND LIMITATIONS MUST REMAIN ATTACHED TO THE CLAIM.',image:'/assets/brand/about-field.jpg'},
 {kicker:'06 / 08 · SOLUTIONS',title:'Response starts with the system.',body:'Protect, restore and monitor are response classes — not automatic delivery claims.',boundary:'SOLUTION CLASS ≠ VERIFIED PROJECT, PARTNER OR OUTCOME.',image:'/assets/missions/rewild/hero.jpg'},
 {kicker:'07 / 08 · ACTORS + ACTION',title:'Action needs accountable actors.',body:'Stewardship, science, delivery and capital connect understanding to real work.',boundary:'ACTOR ROLE ≠ PARTNERSHIP OR ENDORSEMENT.',image:'/assets/brand/participation-field.jpg'},
 {kicker:'08 / 08 · PROOF',title:'Proof closes the loop.',body:'Where, who, what happened — and only then what monitoring supports about outcome.',boundary:'DELIVERY EVIDENCE ≠ ECOLOGICAL OUTCOME.',image:'/assets/brand/participation-field-2.jpg'}
];
const evidenceCopy=[
 'The encounter uses source-derived local Jaguar geometry reconstructed from the Ear.Rodriguez prototype source. Motion is procedural presentation, not captured animal behaviour.',
 'Living-web relationships must remain attached to their specific evidence and geographic scope. This scene is a relationship explanation, not a claim that every shown species is direct Jaguar prey.',
 'ATLAS and ecosystem context expand from the species into place. Reported observations are not range, abundance, population or live tracking.',
 'Pressure pathways remain separate from ecological outcome claims. Land-use change, fire and fragmentation need source, place and time context.',
 'Monitoring and field evidence determine what can be claimed. Presentation imagery does not itself establish ecological condition.',
 'Protect, restore and monitor are response classes. They are not claims that a named intervention is funded, delivered or effective.',
 'Actor roles describe functions in a response system. A role does not imply partnership, endorsement or contract.',
 'Proof separates delivery evidence from ecological outcome. Monitoring can support outcome claims only when the evidence actually does so.'
];

let sceneIndex=0;
let gl=null,program=null,bufPos=null,bufCol=null,bufNrm=null;
let ready=false,failed=false,frame=0,dragging=false,lastX=0;
let yaw=0,targetYaw=0,pitch=0,targetPitch=0,movePulse=0,lookPulse=0,interaction='emerge',interactionStart=0;
let pointSize=mobile?10.5:8.5;
let parallaxX=0,parallaxY=0;

function b64bytes(s){const raw=atob(s||'');const out=new Uint8Array(raw.length);for(let i=0;i<raw.length;i++)out[i]=raw.charCodeAt(i);return out}
function decodeGeometry(){
 const d=window.__JAG29;if(!d||!d.p||!d.c||!d.n||!d.verts||!d.min||!d.span)throw new Error('Jaguar v29 geometry payload incomplete');
 const pBytes=b64bytes(d.p),cBytes=b64bytes(d.c),nBytes=b64bytes(d.n);
 if(pBytes.byteLength!==d.verts*3*2||cBytes.byteLength!==d.verts*3||nBytes.byteLength!==d.verts*3)throw new Error('Jaguar v29 geometry byte lengths invalid');
 const view=new DataView(pBytes.buffer,pBytes.byteOffset,pBytes.byteLength);
 const pos=new Float32Array(d.verts*3),col=new Float32Array(d.verts*3),nrm=new Float32Array(d.verts*3);
 for(let i=0;i<d.verts*3;i++){
  const axis=i%3;
  pos[i]=d.min[axis]+(view.getUint16(i*2,true)/65535)*d.span[axis];
  col[i]=cBytes[i]/255;
  nrm[i]=(nBytes[i]-127.5)/127.5;
 }
 const center=[d.min[0]+d.span[0]/2,d.min[1]+d.span[1]/2,d.min[2]+d.span[2]/2];
 return{pos,col,nrm,center,count:d.verts};
}
function shader(type,src){const s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(s)||'shader compile failed');return s}
function makeProgram(){
 const vs=`attribute vec3 aPosition;attribute vec3 aColor;attribute vec3 aNormal;uniform vec3 uCenter;uniform float uScale;uniform vec3 uOffset;uniform float uYaw;uniform float uPitch;uniform float uAspect;uniform float uPoint;uniform float uBreath;varying vec3 vColor;varying float vLight;void main(){vec3 p=(aPosition-uCenter)*uScale;float cy=cos(uYaw),sy=sin(uYaw);p=vec3(cy*p.x+sy*p.z,p.y,-sy*p.x+cy*p.z);float cx=cos(uPitch),sx=sin(uPitch);p=vec3(p.x,cx*p.y-sx*p.z,sx*p.y+cx*p.z);p+=uOffset;p.y+=uBreath;vec3 cam=vec3(0.0,0.22,6.1);vec3 v=p-cam;float f=3.42;float near=.08,far=40.0;float A=(far+near)/(near-far),B=(2.0*far*near)/(near-far);gl_Position=vec4(v.x*f/uAspect,v.y*f,A*v.z+B,-v.z);vec3 n=normalize(aNormal);vLight=.46+.54*max(dot(n,normalize(vec3(-.35,.82,.46))),0.0);vColor=aColor;gl_PointSize=uPoint*(6.2/max(2.6,-v.z));}`;
 const fs=`precision mediump float;varying vec3 vColor;varying float vLight;uniform float uLume;void main(){vec2 q=gl_PointCoord-.5;float r=length(q);if(r>.5)discard;float edge=smoothstep(.5,.24,r);vec3 natural=vColor*(.66+.5*vLight);vec3 lume=mix(natural,vec3(.22,.96,.43),uLume*.78);gl_FragColor=vec4(lume,edge*.96);}`;
 const p=gl.createProgram();gl.attachShader(p,shader(gl.VERTEX_SHADER,vs));gl.attachShader(p,shader(gl.FRAGMENT_SHADER,fs));gl.linkProgram(p);if(!gl.getProgramParameter(p,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(p)||'program link failed');return p;
}
function upload(attr,data,size){const loc=gl.getAttribLocation(program,attr),b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,data,gl.STATIC_DRAW);gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,size,gl.FLOAT,false,0,0);return b}
function initialise3D(){
 if(ready||failed)return;
 root.dataset.jaguar3d='loading';if(status)status.textContent='BUILDING LOCAL JAGUAR';
 try{
  const g=decodeGeometry();
  const canvas=document.createElement('canvas');canvas.setAttribute('aria-label','Interactive source-derived 3D Jaguar');
  gl=canvas.getContext('webgl',{alpha:true,antialias:!mobile,premultipliedAlpha:false,powerPreference:'high-performance'})||canvas.getContext('experimental-webgl');
  if(!gl)throw new Error('WebGL unavailable');
  stage.replaceChildren(canvas);program=makeProgram();gl.useProgram(program);
  bufPos=upload('aPosition',g.pos,3);bufCol=upload('aColor',g.col,3);bufNrm=upload('aNormal',g.nrm,3);
  program.count=g.count;program.center=g.center;
  program.uCenter=gl.getUniformLocation(program,'uCenter');program.uScale=gl.getUniformLocation(program,'uScale');program.uOffset=gl.getUniformLocation(program,'uOffset');program.uYaw=gl.getUniformLocation(program,'uYaw');program.uPitch=gl.getUniformLocation(program,'uPitch');program.uAspect=gl.getUniformLocation(program,'uAspect');program.uPoint=gl.getUniformLocation(program,'uPoint');program.uBreath=gl.getUniformLocation(program,'uBreath');program.uLume=gl.getUniformLocation(program,'uLume');
  gl.enable(gl.DEPTH_TEST);gl.depthFunc(gl.LEQUAL);gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);gl.clearColor(0,0,0,0);
  ready=true;root.dataset.jaguar3d='ready';root.dataset.jaguar3dSource='ear-rodriguez-v29-source-derived-points';
  if(status)status.textContent='LOCAL JAGUAR · 3D ACTIVE';
  if(creatureState)creatureState.textContent='Source-derived local 3D Jaguar is active. Drag to turn it; movement is procedural presentation.';
  if(controls){controls.setAttribute('aria-hidden','false');const note=controls.querySelector('span');if(note)note.textContent='DRAG / SWIPE TO TURN';}
  if(fallback)fallback.alt='';
  resize();interaction='emerge';interactionStart=performance.now();start();
 }catch(err){console.error('[4PLANET JAGUAR V31]',err);failed=true;root.dataset.jaguar3d='failed';if(status)status.textContent='CONTROLLED SPECIES MEDIA';if(creatureState)creatureState.textContent='3D could not initialise on this device; the full journey remains available with controlled species media.';if(loading)loading.style.display='none';}
}
function resize(){if(!gl)return;const canvas=gl.canvas,w=Math.max(1,stage.clientWidth),h=Math.max(1,stage.clientHeight),dpr=Math.min(devicePixelRatio||1,mobile?1:1.25);const rw=Math.max(1,Math.floor(w*dpr)),rh=Math.max(1,Math.floor(h*dpr));if(canvas.width!==rw||canvas.height!==rh){canvas.width=rw;canvas.height=rh;canvas.style.width=w+'px';canvas.style.height=h+'px';}gl.viewport(0,0,rw,rh)}
function render(t){
 frame=0;if(!ready||sceneIndex!==0||document.hidden)return;resize();
 yaw+=(targetYaw-yaw)*(dragging?.18:.08);pitch+=(targetPitch-pitch)*.08;
 let ox=mobile?.16:.54,oy=-.18,oz=0,scale=mobile?1.34:1.5,breath=reduced?0:Math.sin(t*.00145)*.018;
 if(interaction==='emerge'){
  const u=Math.min(1,(t-interactionStart)/2500),e=1-Math.pow(1-u,3);ox+=(1-e)*(mobile?1.65:2.3);oz+=(1-e)*-.55;targetYaw=(1-e)*-.42+(e*.06);if(u>=1){interaction='idle';if(creatureState)creatureState.textContent='The jaguar settles into the clearing. Drag to turn it.';}
 }
 if(interaction==='move'){
  const u=Math.min(1,(t-interactionStart)/2200),s=Math.sin(u*Math.PI);ox+=s*(mobile?.32:.55);oz-=s*.3;oy+=Math.abs(Math.sin(u*Math.PI*3))*.025;if(u>=1){interaction='idle';if(creatureState)creatureState.textContent='The jaguar settles back into the clearing.';}
 }
 if(interaction==='look'){
  const u=Math.min(1,(t-interactionStart)/1800);lookPulse=Math.sin(u*Math.PI);targetYaw+=(0-targetYaw)*.06;oz-=lookPulse*.22;scale+=lookPulse*.03;if(u>=1){interaction='idle';if(creatureState)creatureState.textContent='The jaguar holds your presence, then settles.';}
 }
 gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.useProgram(program);
 gl.uniform3fv(program.uCenter,program.center);gl.uniform1f(program.uScale,scale);gl.uniform3f(program.uOffset,ox,oy,oz);gl.uniform1f(program.uYaw,yaw);gl.uniform1f(program.uPitch,pitch);gl.uniform1f(program.uAspect,gl.canvas.width/gl.canvas.height);gl.uniform1f(program.uPoint,pointSize);gl.uniform1f(program.uBreath,breath);gl.uniform1f(program.uLume,root.dataset.lume==='true'?1:0);
 gl.drawArrays(gl.POINTS,0,program.count);
 gl.uniform1f(program.uPoint,pointSize*.46);gl.drawArrays(gl.POINTS,0,program.count);
 frame=requestAnimationFrame(render);
}
function start(){if(!frame&&ready&&sceneIndex===0&&!document.hidden)frame=requestAnimationFrame(render)}
function stop(){if(frame)cancelAnimationFrame(frame);frame=0}

function setScene(i){
 sceneIndex=Math.max(0,Math.min(7,i));const c=chapters[sceneIndex];root.dataset.scene=String(sceneIndex);root.style.setProperty('--scene-image',`url("${c.image}")`);
 const kicker=document.getElementById('chapter-kicker'),title=document.getElementById('chapter-title'),body=document.getElementById('chapter-body'),boundary=document.getElementById('chapter-boundary'),back=document.getElementById('back'),next=document.getElementById('next');
 if(kicker)kicker.textContent=c.kicker;if(title)title.textContent=c.title;if(body)body.textContent=c.body;if(boundary)boundary.textContent=c.boundary;if(back)back.disabled=sceneIndex===0;if(next)next.textContent=sceneIndex===7?'RETURN TO JAGUAR':'FOLLOW THE SYSTEM · '+String(sceneIndex+2).padStart(2,'0')+' →';
 document.querySelectorAll('#progress button').forEach((b,n)=>b.setAttribute('aria-current',String(n===sceneIndex)));
 const d=document.getElementById('evidence-dialog');if(d){const h=d.querySelector('h2'),p=d.querySelector('p');if(h)h.textContent=c.title.replace(/\.$/,'');if(p)p.textContent=evidenceCopy[sceneIndex];}
 if(sceneIndex===0){if(ready)start();if(status)status.textContent=ready?'LOCAL JAGUAR · 3D ACTIVE':'JAGUAR ENCOUNTER';}
 else{stop();if(status)status.textContent=c.kicker.replace(/^[^·]+·\s*/,'');}
}
function buildProgress(){const nav=document.getElementById('progress');if(!nav)return;nav.replaceChildren();chapters.forEach((c,i)=>{const b=document.createElement('button');b.type='button';b.setAttribute('aria-label',c.kicker);b.addEventListener('click',()=>setScene(i));nav.appendChild(b)});setScene(0)}
function enter(){if(root.dataset.entered==='true')return;root.dataset.entered='true';initialise3D();window.dispatchEvent(new CustomEvent('4planet:jaguar-enter'));}

const enterButton=document.getElementById('enter');enterButton?.addEventListener('click',enter);
enterButton?.addEventListener('touchend',e=>{e.preventDefault();enter()},{passive:false});
document.getElementById('next')?.addEventListener('click',()=>setScene(sceneIndex===7?0:sceneIndex+1));
document.getElementById('back')?.addEventListener('click',()=>setScene(sceneIndex-1));
const dialog=document.getElementById('evidence-dialog');document.getElementById('evidence')?.addEventListener('click',()=>dialog?.showModal?.());document.getElementById('evidence-close')?.addEventListener('click',()=>dialog?.close?.());
controls?.addEventListener('click',e=>{if(!ready||sceneIndex!==0)return;const a=e.target?.dataset?.action;if(a==='look'){interaction='look';interactionStart=performance.now();if(creatureState)creatureState.textContent='The jaguar shifts its attention toward you.';}if(a==='move'){interaction='move';interactionStart=performance.now();if(creatureState)creatureState.textContent='The jaguar moves through the clearing.';}if(a==='lume'){root.dataset.lume=root.dataset.lume==='true'?'false':'true';if(creatureState)creatureState.textContent=root.dataset.lume==='true'?'LUME reveals the source-derived 3D structure.':'Living creature presentation restored.';}start();});
stage.addEventListener('pointerdown',e=>{if(!ready||sceneIndex!==0)return;dragging=true;lastX=e.clientX;stage.setPointerCapture?.(e.pointerId)});
stage.addEventListener('pointermove',e=>{const nx=(e.clientX/Math.max(1,innerWidth)-.5)*2,ny=(e.clientY/Math.max(1,innerHeight)-.5)*2;parallaxX=nx;parallaxY=ny;root.style.setProperty('--px',nx.toFixed(3));root.style.setProperty('--py',ny.toFixed(3));if(!dragging||!ready)return;const dx=e.clientX-lastX;lastX=e.clientX;targetYaw=Math.max(-.82,Math.min(.82,targetYaw+dx*.006));start()});
stage.addEventListener('pointerup',e=>{dragging=false;try{stage.releasePointerCapture?.(e.pointerId)}catch{}});stage.addEventListener('pointercancel',()=>dragging=false);
addEventListener('resize',resize,{passive:true});document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();else start()});

root.dataset.lume='false';buildProgress();
})();
