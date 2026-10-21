// B1c behavioural test: real overlay + real Twin runtime from the materialized Money file, mocked Supabase.
const fs=require('fs'),{chromium}=require('@playwright/test');
const FILE=process.argv[2]||'products/4sapien/site/app/money/index.html';const s=fs.readFileSync(FILE,'utf8');
const mk=s.slice(s.indexOf('<div id="axeFin">'),s.indexOf('<script>',s.indexOf('<div id="axeFin">')));
const scr=[...s.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/g)];
const overlay=scr.find(m=>m[2].includes("async function up(t,id,p)"))[2];
const twin=scr.find(m=>/finance-twin-runtime/.test(m[1]))[2];
const mock=`
window.DB={four_sapien_finance_accounts:[{id:'a1',name:'Brukskonto',balance:1000,kind:'bank',created_at:'2026-01-01'}],
four_sapien_finance_events:[{id:'e1',type:'spend',name:'Husleie',amount:9000,currency:'NOK',occurred_on:'2026-09-01',category:'Bolig',recurring:'monthly',state:'active',created_at:'2026-09-01'}]};
window.FAIL=false;window.TWIN_READS=0;window.LAT=0;window.confirm=()=>true;
function q(t){let op='select',p=null,id=null;const b={select(){return b},order(){return b},
 update(x){op='update';p=x;return b},delete(){op='delete';return b},insert(x){op='insert';p=x;return b},eq(k,v){id=v;return b},
 then(res){const lat=window.LAT;setTimeout(()=>{const T=DB[t];
  if(op==='select'){if(FAIL)return res({data:null,error:{message:'READ_FAIL'}});return res({data:JSON.parse(JSON.stringify(T)),error:null})}
  if(op==='update'){Object.assign(T.find(r=>r.id===id),p)}
  if(op==='delete'){DB[t]=T.filter(r=>r.id!==id)}
  if(op==='insert'){[].concat(p).forEach((r,i)=>T.push({id:'n'+Date.now()+i,created_at:'2026-09-22',...r}))}
  res({data:null,error:null})},lat)}};return b}
var sb={auth:{getSession:async()=>({data:{session:{user:{id:'u'}}}})},from:q,
 rpc:async(n)=>{if(n==='four_sapien_finance_twin'){TWIN_READS++;if(FAIL)return{data:null,error:{message:'TWIN_FAIL'}};return{data:{state:'AVAILABLE',year:2026,timeline:{months:[]},freedom_months:{}},error:null}}return{data:null,error:null}}};
window.supabase={createClient:()=>sb};`;
const html=`<!doctype html><html><body><div id="root">HENDELSER<nav><button>Penger</button></nav></div>${mk}<script>${mock}</script><script>${overlay}</script><script>${twin}</script></body></html>`;
let pass=0,fail=0;const ok=(c,m)=>{c?pass++:fail++;console.log((c?'PASS ':'FAIL ')+m)};
(async()=>{const br=await chromium.launch();
 const pg=await br.newPage();const errs=[];pg.on('pageerror',e=>errs.push(e.message));
 await pg.setContent(html);await pg.waitForTimeout(700);
 const rows=()=>pg.evaluate(()=>[...document.querySelectorAll('[data-e]')].map(r=>r.querySelector('.en')?.value));
 ok((await rows()).includes('Husleie'),'baseline: overlay renders canonical event');
 const t0=await pg.evaluate(()=>TWIN_READS);
 // T1 inline edit
 await pg.evaluate(()=>{const el=document.querySelector('[data-e="e1"] .en');el.value='Husleie sept';el.dispatchEvent(new Event('change'))});
 await pg.waitForTimeout(500);
 ok((await pg.evaluate(()=>DB.four_sapien_finance_events[0].name))==='Husleie sept','T1 edit persisted');
 ok((await rows()).includes('Husleie sept'),'T1 edit visible without reload');
 ok((await pg.evaluate(()=>TWIN_READS))>t0,'T1 Twin re-read after edit');
 ok((await pg.evaluate(()=>document.getElementById('axeFin').dataset.financeSync))==='FRESH','T1 truth-state FRESH');
 // T2 React add (Daniel path, no source) still refreshes overlay
 await pg.evaluate(()=>{DB.four_sapien_finance_events.push({id:'e2',type:'income',name:'Lønn',amount:40000,currency:'NOK',occurred_on:'2026-09-20',category:'Lønn',recurring:'monthly',state:'active',created_at:'2026-09-20'});
  window.dispatchEvent(new CustomEvent('four-sapien-finance-record-changed',{detail:{kind:'event',id:'e2'}}))});
 await pg.waitForTimeout(500);ok((await rows()).includes('Lønn'),'T2 React add still appears in overlay');
 // T3 delete
 const t1=await pg.evaluate(()=>TWIN_READS);
 await pg.evaluate(()=>document.querySelector('[data-e="e2"] .del').click());await pg.waitForTimeout(500);
 ok(!(await rows()).includes('Lønn'),'T3 delete visible without reload');ok((await pg.evaluate(()=>TWIN_READS))>t1,'T3 Twin re-read after delete');
 // T4 serialized: slow first read must not overwrite newer
 await pg.evaluate(async()=>{LAT=300;window.dispatchEvent(new CustomEvent('four-sapien-finance-record-changed',{detail:{source:'overlay'}}));
  await new Promise(r=>setTimeout(r,20));LAT=0;DB.four_sapien_finance_events[0].name='Siste';
  window.dispatchEvent(new CustomEvent('four-sapien-finance-record-changed',{detail:{source:'overlay'}}))});
 await pg.waitForTimeout(900);ok((await rows()).includes('Siste'),'T4 latest write wins (serialized readback)');
 // T5 failed readback: persisted, but marked STALE, never shown as fresh
 await pg.evaluate(()=>{FAIL=true;const el=document.querySelector('[data-e="e1"] .en');el.value='Etter feil';el.dispatchEvent(new Event('change'))});
 await pg.waitForTimeout(600);
 ok((await pg.evaluate(()=>document.getElementById('axeFin').dataset.financeSync))==='STALE','T5 truth-state STALE on failed read');
 ok(/kunne ikke oppdateres/.test(await pg.evaluate(()=>document.getElementById('afToast').textContent)),'T5 user told readback failed');
 ok((await pg.evaluate(()=>window.__FOUR_SAPIEN_FINANCE_TWIN__))===null,'T5 stale Twin dropped, not reused');
 // T6 recovery
 await pg.evaluate(()=>{FAIL=false;window.dispatchEvent(new CustomEvent('four-sapien-finance-record-changed',{detail:{source:'overlay'}}))});
 await pg.waitForTimeout(500);ok((await rows()).includes('Etter feil')&&(await pg.evaluate(()=>document.getElementById('axeFin').dataset.financeSync))==='FRESH','T6 recovers to FRESH');
 ok(errs.length===0,'no page errors '+errs.join('|'));
 await br.close();
 // T7 React silent-readback handler (extracted, stubbed hooks)
 const i=s.indexOf('useEffect(()=>{let seq=0');const j=s.indexOf('},[]);',i)+6;const code=s.slice(i,j);
 let st={};const H={};const win={addEventListener:(n,f)=>H[n]=f,removeEventListener(){}};
 const mkq=(fail)=>({from:t=>({select:()=>({order:()=>Promise.resolve(fail?{data:null,error:{message:'x'}}:{data:[{id:t}],error:null})})})});
 // 4PLANET port: the handler is owner-bound (requestScope from the PR #336 session fix).
 const scopeRef={current:{alive:true,user:'A',generation:1}};
 const run=new Function('useEffect','sb','setAccounts','setEvents','setErr','dbAccount','dbEvent','window','requestScope',code);
 let sbx=mkq(false);run(f=>f(),{from:t=>sbx.from(t)},v=>st.a=v,v=>st.e=v,v=>st.err=v,x=>x,x=>x,win,scopeRef);
 const E='four-sapien-finance-record-changed';
 await H[E]({detail:{}});ok(st.a===undefined,'T7 React ignores its own write (no double read)');
 await H[E]({detail:{source:'overlay'}});ok(st.a?.[0]?.id==='four_sapien_finance_accounts'&&st.err==='','T7 React re-reads after overlay write');
 sbx=mkq(true);st={};await H[E]({detail:{source:'document'}});ok(st.a===undefined&&/kunne ikke/.test(st.err),'T7 React failed read -> message, state untouched');
 // T8 (4PLANET port): an overlay readback started for A must not paint after a switch to B.
 sbx=mkq(false);st={};const pend=H[E]({detail:{source:'overlay'}});scopeRef.current.user='B';scopeRef.current.generation++;await pend;
 ok(st.a===undefined&&st.e===undefined&&st.err===undefined,'T8 React readback for A dropped after switch to B');
 scopeRef.current.alive=false;st={};await H[E]({detail:{source:'overlay'}});ok(st.a===undefined,'T8 no readback after unmount');
 console.log(`\n${pass} passed, ${fail} failed`);process.exit(fail?1:0)})();
