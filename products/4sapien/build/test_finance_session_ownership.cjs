const fs=require('fs'), vm=require('vm'), assert=require('assert/strict');
// Run from repository root; optional producer and exact generated-site paths.
const py=fs.readFileSync(process.argv[2]||'products/4sapien/build/apply_finance_route.py','utf8');
const site=process.argv[3]||'products/4sapien/site';
const val=n=>JSON.parse(py.split('\n').find(l=>l.startsWith(n+' = ')).slice(n.length+3));
const tick=()=>new Promise(r=>setImmediate(r));
function harness(html){
  let handler,cleanup,initialResolve;const pending=[];const state={a:[],e:[],session:undefined,loading:true,error:''};
  const initial=new Promise(r=>initialResolve=r);
  const context={React:{useRef:current=>({current})},sb:{auth:{getSession:()=>initial,onAuthStateChange:fn=>{handler=fn;return{data:{subscription:{unsubscribe(){}}}}}},from:()=>({select:()=>({order:()=>new Promise((resolve,reject)=>pending.push({resolve,reject}))})})},useEffect:fn=>cleanup=fn(),setSession:x=>state.session=x,setLoading:x=>state.loading=x,setErr:x=>state.error=x,setAccounts:x=>state.a=x,setEvents:x=>state.e=x,dbAccount:x=>x,dbEvent:x=>x};
  const lines=html.split('\n');vm.runInNewContext(lines.filter(l=>l.startsWith(' const requestScope=')||l.startsWith(' const load=async')||l.startsWith(' useEffect(()=>{const scope=')).join('\n'),context,{timeout:1000});
  return{state,pending,event:(s)=>handler(s?'SIGNED_IN':'SIGNED_OUT',s?{user:{id:s}}:null),init:s=>initialResolve({data:{session:s?{user:{id:s}}:null}}),cleanup:()=>cleanup(),resolve:(offset,id)=>{pending[offset].resolve({data:[{id}]});pending[offset+1].resolve({data:[{id}]});}};
}
(async()=>{for(const path of ['app/money/index.html','finance.html','finance/index.html']){
  const html=fs.readFileSync(site+'/'+path,'utf8');
  for(const [a,b]of [['old_load','new_load'],['old_auth_effect','new_auth_effect']]){assert.equal(html.includes(val(a)),false,path+': stale generated source');assert.equal(html.split(val(b)).length,2,path+': expected exact generated guard');}
  let h=harness(html);h.init(null);await tick();assert.equal(h.pending.length,0);
  h.event('A');h.resolve(0,'A');await tick();assert.equal(h.state.a[0].id,'A');
  h=harness(html);h.init(null);await tick();h.event('A');h.event(null);h.resolve(0,'A');await tick();assert.equal(h.state.a.length,0);assert.equal(h.state.e.length,0);assert.equal(h.state.session,null);
  h=harness(html);h.init(null);await tick();h.event('A');h.event('B');h.resolve(2,'B');await tick();h.resolve(0,'A');await tick();assert.equal(h.state.a[0].id,'B');assert.equal(h.state.e[0].id,'B');
  h=harness(html);h.init(null);await tick();h.event('A');h.cleanup();const before=JSON.stringify(h.state);h.resolve(0,'A');await tick();assert.equal(JSON.stringify(h.state),before);
  h=harness(html);h.event('B');h.init('A');await tick();assert.equal(h.state.session.user.id,'B');assert.equal(h.pending.length,2);
  h=harness(html);h.init(null);await tick();h.event('A');h.event(null);h.pending[0].reject(new Error('stale'));h.pending[1].resolve({data:[]});await tick();assert.equal(h.state.error,'');assert.equal(h.state.loading,false);
  console.log(path+': PASS normal, anonymous, signout, A-to-B, unmount, late initial session, stale error');
}console.log('All tests no-network; browser/RLS/full build NOT tested.');})();
