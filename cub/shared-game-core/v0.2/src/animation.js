/** Animation scheduling/LOD (not skeleton rigging or an exported baked clip). */
export function validateClip(clip){
 if(!clip?.id||!Number.isFinite(clip.duration)||clip.duration<=0||!Array.isArray(clip.frames)||clip.frames.length<2)throw Error('Invalid clip');
 let previous=-1;for(const f of clip.frames){if(!Number.isFinite(f.t)||f.t<=previous||f.t<0||f.t>clip.duration||!f.pose||typeof f.pose!=='object')throw Error('Invalid pose keyframe');previous=f.t;}
 return true;
}
export function sampleClip(clip,time,{loop=true}={}){
 validateClip(clip);if(!Number.isFinite(time))throw Error('Invalid time');
 const t=loop?((time%clip.duration)+clip.duration)%clip.duration:Math.max(0,Math.min(time,clip.duration));
 const f=clip.frames;let a=f[0],b=f[f.length-1];
 for(let i=0;i<f.length-1;i++)if(t>=f[i].t&&t<=f[i+1].t){a=f[i];b=f[i+1];break;}
 if(t<a.t){a=f[0];b=f[0];}
 const ratio=a===b?0:Math.max(0,Math.min(1,(t-a.t)/(b.t-a.t)));
 const pose={};for(const key of new Set([...Object.keys(a.pose),...Object.keys(b.pose)])){
  const u=a.pose[key]??0,v=b.pose[key]??u;if(!Number.isFinite(u)||!Number.isFinite(v))throw Error('Non-numeric pose channel');pose[key]=u+(v-u)*ratio;
 }return {time:t,pose};
}
export function selectCharacterLOD({distance,visible=true,high=20,medium=55,impostor=110}){
 if(!Number.isFinite(distance)||distance<0)throw Error('Invalid camera distance');
 if(!visible||distance>impostor)return 'culled';if(distance>medium)return 'impostor';if(distance>high)return 'low';return 'full';
}
export function phaseForActor(id,worldSeed=1){let n=2166136261>>>0;for(const c of String(id)+worldSeed){n^=c.charCodeAt(0);n=Math.imul(n,16777619)>>>0;}return n/2**32;}