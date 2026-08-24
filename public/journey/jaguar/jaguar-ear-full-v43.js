(() => {
  'use strict';

  const root = document.getElementById('jaguar-experience');
  const stage = document.getElementById('three-stage');
  const fallback = document.getElementById('photo-fallback');
  const loading = document.getElementById('loading');
  const controls = document.getElementById('controls');
  const enter = document.getElementById('enter');
  const data = window.__JAGUAR_LOCAL_V48;
  if (!root || !stage || !data || root.dataset.jaguarEarFullBooted === 'true') return;

  root.dataset.jaguarEarFullBooted = 'true';
  root.dataset.jaguarEarFull = 'loading';
  root.dataset.jaguarEarDelivery = 'local-source-derivative-v48';
  root.dataset.jaguar3dSource = 'ear-rodriguez-local-v48-source-derived';
  root.dataset.jaguarMotionTruth = 'procedural-presentation-motion-not-source-animation';

  let canvas = document.createElement('canvas');
  canvas.className = 'jaguar-local-v48';
  canvas.setAttribute('aria-label', 'Interactive source-derived 3D Jaguar from the Ear.Rodriguez CC BY 4.0 master');
  let gl = null, program = null, posBuffer = null, indexBuffer = null, ready = false, failed = false;
  let raf = 0, lastFrame = 0, yaw = -.16, targetYaw = -.16, pitch = -.03, targetPitch = -.03;
  let dragging = false, lastX = 0, lastY = 0, motion = 'rest', motionStart = 0;
  const mobile = matchMedia('(max-width:760px)').matches;
  const reduced = matchMedia('(prefers-reduced-motion:reduce)').matches;
  const frameInterval = 1000 / (mobile ? 30 : 52);

  const style = document.createElement('style');
  style.textContent = `
    #three-stage{position:relative;overflow:hidden}
    #three-stage>canvas:not(.jaguar-local-v48){opacity:0!important;visibility:hidden!important;pointer-events:none!important}
    .jaguar-local-v48{position:absolute;inset:0;z-index:8;width:100%;height:100%;display:block;touch-action:none;opacity:0;transition:opacity .34s ease;filter:none!important}
    #jaguar-experience[data-jaguar-ear-full="ready"] .jaguar-local-v48{opacity:1}
    #jaguar-experience[data-jaguar-ear-full="ready"] #photo-fallback,#jaguar-experience[data-jaguar-ear-full="ready"] #loading{opacity:0!important;visibility:hidden!important;pointer-events:none!important}
    .jaguar-local-v48-credit{position:absolute;z-index:10;left:12px;bottom:12px;border:1px solid rgba(255,255,255,.18);border-radius:999px;background:rgba(1,9,5,.64);backdrop-filter:blur(8px);padding:6px 9px;color:rgba(255,255,255,.7);font:600 8px/1.2 ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.12em;pointer-events:none}
    @media(max-width:760px){.jaguar-local-v48-credit{left:8px;bottom:8px;font-size:7px}}
    @media(prefers-reduced-motion:reduce){.jaguar-local-v48{transition:none}}
  `;
  document.head.appendChild(style);

  const credit = document.createElement('div');
  credit.className = 'jaguar-local-v48-credit';
  credit.textContent = 'EAR.RODRIGUEZ · CC BY 4.0 · LOCAL SOURCE-DERIVED 3D';

  function ensureMounted() {
    if (!canvas.isConnected || canvas.parentElement !== stage) stage.appendChild(canvas);
    if (!credit.isConnected || credit.parentElement !== stage) stage.appendChild(credit);
  }
  ensureMounted();

  function bytesFromB64(s) {
    const raw = atob(s); const out = new Uint8Array(raw.length);
    for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
    return out;
  }
  async function gunzip(s) {
    if (typeof DecompressionStream !== 'function') throw new Error('gzip-decompression-unavailable');
    const ds = new DecompressionStream('gzip');
    return new Response(new Blob([bytesFromB64(s)]).stream().pipeThrough(ds)).arrayBuffer();
  }
  function shader(type, source) {
    const sh = gl.createShader(type); gl.shaderSource(sh, source); gl.compileShader(sh);
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(sh) || 'shader-compile');
    return sh;
  }
  function buildProgram() {
    const vs = `
      attribute vec3 aPosition;
      uniform float uYaw; uniform float uPitch; uniform float uScale; uniform vec2 uOffset; uniform float uBreath;
      varying vec3 vP; varying vec3 vN;
      void main(){
        vec3 p=aPosition; p.y=(p.y+.52)*(1.0+uBreath*.012)-.52;
        float cy=cos(uYaw),sy=sin(uYaw),cp=cos(uPitch),sp=sin(uPitch);
        p=vec3(cy*p.x+sy*p.z,p.y,-sy*p.x+cy*p.z);
        p=vec3(p.x,cp*p.y-sp*p.z,sp*p.y+cp*p.z);
        vec3 n=normalize(vec3(p.x*.65,p.y+.05,p.z*.8));
        vP=p; vN=n;
        gl_Position=vec4(p.x*uScale+uOffset.x,p.y*uScale*1.18+uOffset.y,p.z*.18,1.0);
      }`;
    const fs = `
      precision mediump float;
      varying vec3 vP; varying vec3 vN; uniform float uLume;
      float hash21(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453123);}
      void main(){
        vec2 q=vec2(vP.x*7.2+vP.z*2.4,vP.y*10.2+vP.x*.7);
        vec2 cell=floor(q), f=fract(q)-.5;
        float h=hash21(cell); vec2 j=vec2(hash21(cell+3.17),hash21(cell+7.91))-.5;
        float r=length(f+j*.22); float outer=1.0-smoothstep(.31,.36,r); float inner=1.0-smoothstep(.13,.18,r);
        float ring=clamp(outer-inner,0.0,1.0); float dotSpot=(1.0-smoothstep(.08,.14,r))*step(.76,h);
        vec3 gold=vec3(.71,.38,.095); vec3 warm=vec3(.95,.63,.22); vec3 dark=vec3(.028,.021,.016);
        float underside=smoothstep(-.05,-.46,vP.y)*.34; vec3 coat=mix(gold,warm,.24+max(vP.y,0.0)*.18); coat=mix(coat,vec3(.78,.66,.46),underside);
        coat=mix(coat,dark,clamp(ring*.94+dotSpot,0.0,1.0));
        vec3 light=normalize(vec3(-.25,.82,.5)); float lam=.38+.62*abs(dot(normalize(vN),light));
        vec3 natural=coat*lam+vec3(.055,.075,.045)*max(dot(normalize(vN),normalize(vec3(.7,.2,-.5))),0.0);
        vec3 lume=vec3(.025,.22,.19)+vec3(.1,.95,.7)*(lam*.62+ring*.34);
        gl_FragColor=vec4(mix(natural,lume,uLume*.88),1.0);
      }`;
    const p = gl.createProgram(); gl.attachShader(p,shader(gl.VERTEX_SHADER,vs)); gl.attachShader(p,shader(gl.FRAGMENT_SHADER,fs)); gl.linkProgram(p);
    if (!gl.getProgramParameter(p,gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p) || 'program-link');
    return p;
  }
  function resize() {
    if (!gl) return;
    const dpr = Math.min(devicePixelRatio || 1, mobile ? 1 : 1.35);
    const w = Math.max(1, stage.clientWidth), h = Math.max(1, stage.clientHeight);
    const rw = Math.floor(w*dpr), rh = Math.floor(h*dpr);
    if (canvas.width !== rw || canvas.height !== rh) { canvas.width=rw; canvas.height=rh; canvas.style.width=w+'px'; canvas.style.height=h+'px'; }
    gl.viewport(0,0,rw,rh);
  }
  function active() { return Number(root.dataset.scene || '0') === 0 && !document.hidden; }
  function draw(t) {
    raf=0; if (!ready || !active()) return;
    if (lastFrame && t-lastFrame < frameInterval) { raf=requestAnimationFrame(draw); return; } lastFrame=t;
    resize(); yaw += (targetYaw-yaw)*(dragging?.22:.075); pitch += (targetPitch-pitch)*.08;
    let offsetX=mobile?.01:.12, offsetY=mobile?.03:.01, scale=mobile?.82:.78;
    if (motion==='move') { const q=Math.min(1,(t-motionStart)/1900),s=Math.sin(q*Math.PI); offsetX+=s*(mobile?.12:.2); targetYaw=-.16+s*.38; if(q>=1){motion='rest';targetYaw=-.16;} }
    if (motion==='look') { const q=Math.min(1,(t-motionStart)/1500),s=Math.sin(q*Math.PI); targetYaw=0; scale+=s*.035; if(q>=1){motion='rest';targetYaw=-.08;} }
    const breath=reduced?0:Math.sin(t*.00155);
    gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT); gl.useProgram(program);
    gl.uniform1f(gl.getUniformLocation(program,'uYaw'),yaw); gl.uniform1f(gl.getUniformLocation(program,'uPitch'),pitch);
    gl.uniform1f(gl.getUniformLocation(program,'uScale'),scale); gl.uniform2f(gl.getUniformLocation(program,'uOffset'),offsetX,offsetY);
    gl.uniform1f(gl.getUniformLocation(program,'uBreath'),breath); gl.uniform1f(gl.getUniformLocation(program,'uLume'),root.dataset.lume==='true'?1:0);
    gl.bindBuffer(gl.ARRAY_BUFFER,posBuffer); const loc=gl.getAttribLocation(program,'aPosition'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc,3,gl.FLOAT,false,0,0);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,indexBuffer); gl.drawElements(gl.TRIANGLES,data.indexCount,gl.UNSIGNED_SHORT,0);
    raf=requestAnimationFrame(draw);
  }
  function start(){ if(!raf&&ready&&active()) raf=requestAnimationFrame(draw); }
  function stop(){ if(raf) cancelAnimationFrame(raf); raf=0; root.dataset.jaguar3dActive='false'; }
  function fail(reason){ failed=true; ready=false; root.dataset.jaguarEarFull='fallback'; root.dataset.jaguar3d='failed'; root.dataset.jaguarEarFullFailure=reason; canvas.style.display='none'; if(fallback){fallback.hidden=false;fallback.style.opacity='1';fallback.style.visibility='visible';} if(loading)loading.hidden=true; const s=document.getElementById('runtime-status');if(s)s.textContent='JAGUAR · CONTROLLED SPECIES MEDIA'; console.error('[4PLANET JAGUAR V48]',reason); }

  async function init() {
    try {
      ensureMounted(); if (loading) loading.hidden=false;
      const [pb,ib]=await Promise.all([gunzip(data.posGzipB64),gunzip(data.idxGzipB64)]);
      const qpos=new Uint16Array(pb), idx=new Uint16Array(ib); if(qpos.length!==data.vertexCount*3||idx.length!==data.indexCount)throw new Error('derivative-payload-length-mismatch');
      const p=new Float32Array(data.vertexCount*3), min=data.pmin, span=data.pspan;
      const cx=min[0]+span[0]/2, cz=min[2]+span[2]/2, unit=span[2]/2;
      for(let i=0;i<data.vertexCount;i++){const sx=min[0]+qpos[i*3]/65535*span[0],sy=min[1]+qpos[i*3+1]/65535*span[1],sz=min[2]+qpos[i*3+2]/65535*span[2];p[i*3]=(sz-cz)/unit;p[i*3+1]=(sy-min[1])/unit-.56;p[i*3+2]=-(sx-cx)/unit;}
      gl=canvas.getContext('webgl',{alpha:true,antialias:!mobile,premultipliedAlpha:false,preserveDrawingBuffer:true,powerPreference:'high-performance'}); canvas.style.filter='none'; if(!gl)throw new Error('webgl-unavailable');
      program=buildProgram(); posBuffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,posBuffer);gl.bufferData(gl.ARRAY_BUFFER,p,gl.STATIC_DRAW); indexBuffer=gl.createBuffer();gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,indexBuffer);gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,idx,gl.STATIC_DRAW);
      gl.enable(gl.DEPTH_TEST);gl.depthFunc(gl.LEQUAL);gl.disable(gl.CULL_FACE);gl.clearColor(0,0,0,0); resize();
      ready=true; root.dataset.jaguarEarFull='ready'; root.dataset.jaguarEarDelivery='local-source-derivative-v48'; root.dataset.jaguar3d='ready'; root.dataset.jaguar3dSource='ear-rodriguez-local-v48-source-derived'; root.dataset.jaguar3dActive=String(active()); root.dataset.jaguarVisual='visible'; root.dataset.jaguarPose='source-bind-pose-quadruped'; root.dataset.jaguarMaterial='procedural-rosette-presentation-not-source-texture'; root.dataset.jaguarMasterSha256=data.masterSha256;
      if(fallback){fallback.hidden=true;fallback.setAttribute('aria-hidden','true');} if(loading)loading.hidden=true;
      const status=document.getElementById('runtime-status');if(status)status.textContent='EAR JAGUAR · LOCAL 3D ACTIVE'; const state=document.getElementById('creature-state');if(state)state.textContent='Ear.Rodriguez source-derived Jaguar geometry is active locally. Shape is source-derived; current coat shader and motion are presentation layers.';
      controls?.querySelectorAll('button[data-action="look"],button[data-action="move"]').forEach(b=>{b.hidden=false;}); const hint=controls?.querySelector('span');if(hint)hint.textContent='DRAG / SWIPE TO TURN · PRESENTATION MOTION';
      start();
    } catch (e) { fail(e?.message||'local-v48-init-failed'); }
  }

  canvas.addEventListener('pointerdown',e=>{dragging=true;lastX=e.clientX;lastY=e.clientY;canvas.setPointerCapture?.(e.pointerId);});
  canvas.addEventListener('pointermove',e=>{if(!dragging)return;targetYaw+= (e.clientX-lastX)*.008;targetPitch=Math.max(-.28,Math.min(.18,targetPitch+(e.clientY-lastY)*.004));lastX=e.clientX;lastY=e.clientY;});
  const end=()=>dragging=false;canvas.addEventListener('pointerup',end);canvas.addEventListener('pointercancel',end);
  controls?.addEventListener('click',e=>{const a=e.target?.dataset?.action;if(a==='look'){motion='look';motionStart=performance.now();}else if(a==='move'){motion='move';motionStart=performance.now();}});
  const stageObserver=new MutationObserver(()=>{if(!failed){ensureMounted();if(ready){root.dataset.jaguarEarFull='ready';root.dataset.jaguar3d='ready';root.dataset.jaguar3dSource='ear-rodriguez-local-v48-source-derived';if(active())start();}}});
  stageObserver.observe(stage,{childList:true});
  const sceneObserver=new MutationObserver(()=>active()?start():stop());sceneObserver.observe(root,{attributes:true,attributeFilter:['data-scene','data-lume']});
  enter?.addEventListener('click',()=>requestAnimationFrame(()=>{ensureMounted();if(ready){root.dataset.jaguarEarFull='ready';start();}}));
  document.addEventListener('visibilitychange',()=>document.hidden?stop():start());window.addEventListener('resize',resize,{passive:true});window.addEventListener('pagehide',stop,{once:true});
  init();
})();
