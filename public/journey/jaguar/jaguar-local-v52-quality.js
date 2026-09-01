(() => {
  'use strict';

  const root=document.getElementById('jaguar-experience');
  const stage=document.getElementById('three-stage');
  const fallback=document.getElementById('photo-fallback');
  const loading=document.getElementById('loading');
  const controls=document.getElementById('controls');
  const enter=document.getElementById('enter');
  const data=window.__JAGUAR_LOCAL_V48;
  if(!root||!stage||!data||root.dataset.jaguarV52Booted==='true')return;

  root.dataset.jaguarV52Booted='true';
  root.dataset.jaguarQualityPass='volumetric-v52';
  root.dataset.jaguarMotionTruth='procedural-presentation-motion-not-source-animation';
  root.dataset.jaguarStaging='three-quarter-v55';

  const mobile=matchMedia('(max-width:760px)').matches;
  const reduced=matchMedia('(prefers-reduced-motion:reduce)').matches;
  const canvas=document.createElement('canvas');
  canvas.className='jaguar-local-v52';
  canvas.setAttribute('aria-label','Interactive volumetric source-derived 3D Jaguar from the Ear.Rodriguez CC BY 4.0 master');

  const style=document.createElement('style');
  style.textContent=`
    .jaguar-local-v52{position:absolute;inset:0;z-index:9;width:100%;height:100%;display:block;touch-action:none;opacity:0;transition:opacity .28s ease;background:transparent;filter:saturate(.92) contrast(1.06)}
    #jaguar-experience[data-jaguar-quality="volumetric-v52"] .jaguar-local-v52{opacity:1}
    #jaguar-experience[data-jaguar-quality="volumetric-v52"] .jaguar-local-v48{opacity:0!important;visibility:hidden!important;pointer-events:none!important}
    #jaguar-experience[data-jaguar-quality="volumetric-v52"] #photo-fallback,
    #jaguar-experience[data-jaguar-quality="volumetric-v52"] #loading{opacity:0!important;visibility:hidden!important;pointer-events:none!important}
    @media(prefers-reduced-motion:reduce){.jaguar-local-v52{transition:none}}
  `;
  document.head.appendChild(style);
  stage.appendChild(canvas);

  let gl,program,posBuffer,normalBuffer,indexBuffer;
  let ready=false,failed=false,raf=0,lastFrame=0;
  let yaw=-.62,targetYaw=-.62,pitch=-.07,targetPitch=-.07;
  let dragging=false,lastX=0,lastY=0,motion='rest',motionStart=0;
  const frameInterval=1000/(mobile?30:52);

  function bytesFromB64(s){const raw=atob(s);const out=new Uint8Array(raw.length);for(let i=0;i<raw.length;i++)out[i]=raw.charCodeAt(i);return out;}
  function rawDeflateRange(bytes){
    if(bytes.length<18||bytes[0]!==0x1f||bytes[1]!==0x8b||bytes[2]!==8)throw new Error('v52-invalid-gzip-envelope');
    const flags=bytes[3];let offset=10;
    if(flags&0x04){if(offset+2>bytes.length-8)throw new Error('v52-invalid-gzip-extra');const xlen=bytes[offset]|(bytes[offset+1]<<8);offset+=2+xlen;}
    if(flags&0x08)while(offset<bytes.length-8&&bytes[offset++]!==0){}
    if(flags&0x10)while(offset<bytes.length-8&&bytes[offset++]!==0){}
    if(flags&0x02)offset+=2;
    const end=bytes.length-8;if(offset>=end)throw new Error('v52-empty-deflate-body');return bytes.subarray(offset,end);
  }
  async function inflateJaguarB64(s){
    if(typeof DecompressionStream!=='function')throw new Error('v52-decompression-unavailable');
    const raw=rawDeflateRange(bytesFromB64(s));
    const reader=new Blob([raw]).stream().pipeThrough(new DecompressionStream('deflate-raw')).getReader();
    const parts=[];let total=0;
    for(;;){const {value,done}=await reader.read();if(done)break;if(!value?.byteLength)continue;parts.push(value);total+=value.byteLength;}
    const out=new Uint8Array(total);let off=0;for(const part of parts){out.set(part,off);off+=part.byteLength;}return out.buffer;
  }
  function computeNormals(p,idx){
    const n=new Float32Array(p.length);
    for(let i=0;i<idx.length;i+=3){
      const ia=idx[i]*3,ib=idx[i+1]*3,ic=idx[i+2]*3;
      const ax=p[ia],ay=p[ia+1],az=p[ia+2];
      const abx=p[ib]-ax,aby=p[ib+1]-ay,abz=p[ib+2]-az;
      const acx=p[ic]-ax,acy=p[ic+1]-ay,acz=p[ic+2]-az;
      const nx=aby*acz-abz*acy,ny=abz*acx-abx*acz,nz=abx*acy-aby*acx;
      n[ia]+=nx;n[ia+1]+=ny;n[ia+2]+=nz;n[ib]+=nx;n[ib+1]+=ny;n[ib+2]+=nz;n[ic]+=nx;n[ic+1]+=ny;n[ic+2]+=nz;
    }
    for(let i=0;i<n.length;i+=3){const l=Math.hypot(n[i],n[i+1],n[i+2])||1;n[i]/=l;n[i+1]/=l;n[i+2]/=l;}return n;
  }
  function shader(type,source){const sh=gl.createShader(type);gl.shaderSource(sh,source);gl.compileShader(sh);if(!gl.getShaderParameter(sh,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(sh)||'v52-shader-compile');return sh;}
  function buildProgram(){
    const vs=`
      attribute vec3 aPosition;attribute vec3 aNormal;
      uniform float uYaw,uPitch,uScale,uBreath;uniform vec2 uOffset;uniform float uAspect;
      varying vec3 vP;varying vec3 vN;varying float vDepth;
      void main(){
        vec3 p=aPosition;p.y=(p.y+.46)*(1.0+uBreath*.005)-.46;
        float cy=cos(uYaw),sy=sin(uYaw),cp=cos(uPitch),sp=sin(uPitch);
        mat3 ry=mat3(cy,0.0,-sy,0.0,1.0,0.0,sy,0.0,cy);mat3 rx=mat3(1.0,0.0,0.0,0.0,cp,sp,0.0,-sp,cp);
        p=rx*ry*p;vec3 n=normalize(rx*ry*aNormal);vP=p;vN=n;
        float cameraZ=4.15-p.z*.92;float focal=3.20*uScale;
        vec2 screen=vec2((p.x+uOffset.x)*focal/uAspect,(p.y+uOffset.y)*focal);
        gl_Position=vec4(screen,cameraZ*.31,cameraZ);vDepth=clamp((cameraZ-3.0)/2.4,0.0,1.0);
      }`;
    const fs=`
      precision mediump float;varying vec3 vP;varying vec3 vN;varying float vDepth;uniform float uLume;
      float hash21(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453123);}
      float rosette(vec2 q){
        vec2 cell=floor(q),f=fract(q)-.5;vec2 j=vec2(hash21(cell+2.13),hash21(cell+7.41))-.5;
        float r=length(f+j*.18);float outer=1.0-smoothstep(.205,.29,r);float inner=1.0-smoothstep(.095,.145,r);
        float ring=max(outer-inner,0.0);float centre=(1.0-smoothstep(.045,.085,r))*step(.78,hash21(cell+11.2));return clamp(ring*.82+centre,0.0,1.0);
      }
      void main(){
        vec3 n=normalize(vN);vec3 key=normalize(vec3(-.34,.82,.45));vec3 fill=normalize(vec3(.70,.18,-.62));vec3 view=normalize(vec3(0.0,.08,1.0));
        float ndl=max(dot(n,key),0.0),fillL=max(dot(n,fill),0.0);float rim=pow(1.0-max(dot(n,view),0.0),2.5);
        vec2 q=vec2(vP.x*22.5+vP.z*4.6,vP.y*27.0-vP.z*3.8);float spots=rosette(q);float micro=hash21(floor(q*2.9));
        float belly=smoothstep(-.04,-.48,vP.y)*.48;vec3 gold=mix(vec3(.34,.145,.035),vec3(.72,.39,.10),.50+ndl*.24);gold=mix(gold,vec3(.62,.53,.35),belly);
        vec3 coat=mix(gold,vec3(.012,.010,.008),spots*.90);coat*=.96+micro*.05;
        float halfSpec=pow(max(dot(n,normalize(key+view)),0.0),18.0);float light=.20+ndl*.76+fillL*.14;
        vec3 natural=coat*light+vec3(.16,.105,.035)*halfSpec*.24+vec3(.11,.075,.025)*rim*.20+vec3(.018,.035,.020)*(1.0-vDepth)*.34;
        vec3 lumeBase=vec3(.010,.055,.062);vec3 lumeGlow=vec3(.05,.66,.54)*(ndl*.55+rim*.34+spots*.10);
        gl_FragColor=vec4(mix(natural,lumeBase+lumeGlow,uLume*.90),1.0);
      }`;
    const p=gl.createProgram();gl.attachShader(p,shader(gl.VERTEX_SHADER,vs));gl.attachShader(p,shader(gl.FRAGMENT_SHADER,fs));gl.linkProgram(p);if(!gl.getProgramParameter(p,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(p)||'v52-program-link');return p;
  }
  function resize(){if(!gl)return;const dpr=Math.min(devicePixelRatio||1,mobile?1:1.25),w=Math.max(1,stage.clientWidth),h=Math.max(1,stage.clientHeight),rw=Math.floor(w*dpr),rh=Math.floor(h*dpr);if(canvas.width!==rw||canvas.height!==rh){canvas.width=rw;canvas.height=rh;canvas.style.width=w+'px';canvas.style.height=h+'px';}gl.viewport(0,0,rw,rh);}
  function active(){return Number(root.dataset.scene||'0')===0&&!document.hidden;}
  function draw(t){
    raf=0;if(!ready||!active())return;if(lastFrame&&t-lastFrame<frameInterval){raf=requestAnimationFrame(draw);return;}lastFrame=t;resize();
    yaw+=(targetYaw-yaw)*(dragging?.22:.075);pitch+=(targetPitch-pitch)*.08;
    let offsetX=mobile?.03:.08,offsetY=mobile?-.02:-.04,scale=mobile?.84:.94;
    if(motion==='move'){const q=Math.min(1,(t-motionStart)/1800),s=Math.sin(q*Math.PI);offsetX+=s*(mobile?.07:.11);targetYaw=-.62+s*.48;if(q>=1){motion='rest';targetYaw=-.62;}}
    if(motion==='look'){const q=Math.min(1,(t-motionStart)/1400),s=Math.sin(q*Math.PI);targetYaw=-.34;scale+=s*.025;if(q>=1){motion='rest';targetYaw=-.48;}}
    const breath=reduced?0:Math.sin(t*.00135);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.useProgram(program);
    gl.uniform1f(gl.getUniformLocation(program,'uYaw'),yaw);gl.uniform1f(gl.getUniformLocation(program,'uPitch'),pitch);gl.uniform1f(gl.getUniformLocation(program,'uScale'),scale);gl.uniform2f(gl.getUniformLocation(program,'uOffset'),offsetX,offsetY);gl.uniform1f(gl.getUniformLocation(program,'uAspect'),canvas.width/Math.max(1,canvas.height));gl.uniform1f(gl.getUniformLocation(program,'uBreath'),breath);gl.uniform1f(gl.getUniformLocation(program,'uLume'),root.dataset.lume==='true'?1:0);
    gl.bindBuffer(gl.ARRAY_BUFFER,posBuffer);const pLoc=gl.getAttribLocation(program,'aPosition');gl.enableVertexAttribArray(pLoc);gl.vertexAttribPointer(pLoc,3,gl.FLOAT,false,0,0);
    gl.bindBuffer(gl.ARRAY_BUFFER,normalBuffer);const nLoc=gl.getAttribLocation(program,'aNormal');gl.enableVertexAttribArray(nLoc);gl.vertexAttribPointer(nLoc,3,gl.FLOAT,false,0,0);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,indexBuffer);gl.drawElements(gl.TRIANGLES,data.indexCount,gl.UNSIGNED_SHORT,0);raf=requestAnimationFrame(draw);
  }
  function start(){if(!raf&&ready&&active())raf=requestAnimationFrame(draw);}function stop(){if(raf)cancelAnimationFrame(raf);raf=0;}
  function fail(reason){failed=true;ready=false;root.dataset.jaguarQuality='v52-fallback';root.dataset.jaguarQualityFailure=reason;canvas.style.display='none';console.error('[4PLANET JAGUAR V52]',reason);}
  async function init(){
    try{
      const [pb,ib]=await Promise.all([inflateJaguarB64(data.posGzipB64),inflateJaguarB64(data.idxGzipB64)]);const qpos=new Uint16Array(pb),idx=new Uint16Array(ib);if(qpos.length!==data.vertexCount*3||idx.length!==data.indexCount)throw new Error('v52-payload-length-mismatch');
      const p=new Float32Array(data.vertexCount*3),min=data.pmin,span=data.pspan,cx=min[0]+span[0]/2,cz=min[2]+span[2]/2,unit=Math.max(span[0],span[1],span[2])/2;
      for(let i=0;i<data.vertexCount;i++){const sx=min[0]+qpos[i*3]/65535*span[0],sy=min[1]+qpos[i*3+1]/65535*span[1],sz=min[2]+qpos[i*3+2]/65535*span[2];p[i*3]=(sz-cz)/unit;p[i*3+1]=(sy-min[1])/unit-.52;p[i*3+2]=-(sx-cx)/unit;}
      const normals=computeNormals(p,idx);gl=canvas.getContext('webgl',{alpha:true,antialias:!mobile,premultipliedAlpha:false,preserveDrawingBuffer:true,powerPreference:'high-performance'});if(!gl)throw new Error('v52-webgl-unavailable');program=buildProgram();
      posBuffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,posBuffer);gl.bufferData(gl.ARRAY_BUFFER,p,gl.STATIC_DRAW);normalBuffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,normalBuffer);gl.bufferData(gl.ARRAY_BUFFER,normals,gl.STATIC_DRAW);indexBuffer=gl.createBuffer();gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,indexBuffer);gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,idx,gl.STATIC_DRAW);
      gl.enable(gl.DEPTH_TEST);gl.depthFunc(gl.LEQUAL);gl.disable(gl.CULL_FACE);gl.clearColor(0,0,0,0);resize();ready=true;
      root.dataset.jaguarQuality='volumetric-v52';root.dataset.jaguarEarFull='ready';root.dataset.jaguar3d='ready';root.dataset.jaguar3dSource='ear-rodriguez-local-v52-source-derived';root.dataset.jaguarPose='source-bind-pose-perspective';root.dataset.jaguarMaterial='procedural-natural-rosette-v52-not-source-texture';root.dataset.jaguarMasterSha256=data.masterSha256;root.dataset.jaguarVisual='visible';root.dataset.jaguarMotionTruth='procedural-presentation-motion-not-source-animation';
      if(fallback){fallback.hidden=true;fallback.setAttribute('aria-hidden','true');}if(loading)loading.hidden=true;const status=document.getElementById('runtime-status');if(status)status.textContent='EAR JAGUAR · VOLUMETRIC 3D ACTIVE';const state=document.getElementById('creature-state');if(state)state.textContent='Ear.Rodriguez source-derived geometry is rendered locally in a three-quarter perspective with computed surface normals and a presentation coat shader. Geometry remains source-derived; coat and motion are presentation layers.';start();
    }catch(e){fail(e?.message||'v52-init-failed');}
  }
  canvas.addEventListener('pointerdown',e=>{dragging=true;lastX=e.clientX;lastY=e.clientY;canvas.setPointerCapture?.(e.pointerId);});canvas.addEventListener('pointermove',e=>{if(!dragging)return;targetYaw+=(e.clientX-lastX)*.007;targetPitch=Math.max(-.22,Math.min(.16,targetPitch+(e.clientY-lastY)*.0035));lastX=e.clientX;lastY=e.clientY;});const end=()=>{dragging=false;};canvas.addEventListener('pointerup',end);canvas.addEventListener('pointercancel',end);
  controls?.addEventListener('click',e=>{const a=e.target?.dataset?.action;if(a==='look'){motion='look';motionStart=performance.now();}if(a==='move'){motion='move';motionStart=performance.now();}});
  const observer=new MutationObserver(()=>active()?start():stop());observer.observe(root,{attributes:true,attributeFilter:['data-scene','data-lume']});enter?.addEventListener('click',()=>requestAnimationFrame(start));document.addEventListener('visibilitychange',()=>document.hidden?stop():start());window.addEventListener('resize',resize,{passive:true});
  init();
})();