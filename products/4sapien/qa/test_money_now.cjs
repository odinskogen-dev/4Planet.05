// Bolk 2 test: real Twin runtime + real money-now surface, mocked control_read payloads.
const fs=require('fs'),{chromium}=require('@playwright/test');
const SITE=process.argv[2]||'products/4sapien/site';const F=SITE+'/app/money/index.html';const s=fs.readFileSync(F,'utf8');
const twin=[...s.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/g)].find(m=>/finance-twin-runtime/.test(m[1]))[2];
const mn=fs.readFileSync(SITE+'/4sapien-money-now.js','utf8');
let pass=0,fail=0;const ok=(c,m)=>{c?pass++:fail++;console.log((c?'PASS ':'FAIL ')+m)};
const AV={state:'AVAILABLE',as_of:'2026-09-22',money_now:{state:'KNOWN_RECORDED',amount:18450,oldest_account_as_of:'2026-09-20',reserved:'UNKNOWN',restricted:'UNKNOWN'},
 next_income_date:'2026-10-15',before_next_income:{state:'MODELLED_NOT_AVAILABLE_CASH',projected_without_income:6200,next_income_date:'2026-10-15'},overdue_unconfirmed:[]};
const UNK=JSON.parse(JSON.stringify(AV));UNK.money_now={state:'UNKNOWN',amount:null,unknown_balance_count:2};UNK.before_next_income={state:'UNKNOWN',projected_without_income:null};
const OVD=JSON.parse(JSON.stringify(AV));OVD.before_next_income={state:'UNRESOLVED_OVERDUE',projected_without_income:null};OVD.overdue_unconfirmed=[{event_id:'b1',name:'Strøm',amount:2100,due_date:'2026-09-10',payment_state:'NOT_CONFIRMED_PAID'}];
(async()=>{const br=await chromium.launch();
const pg=await br.newPage();const errs=[];pg.on('pageerror',e=>errs.push(e.message));
await pg.setContent(`<!doctype html><html><body><div id="root">HENDELSER</div><div id="axeFin"><div id="afBody">LEDGER</div></div>
<script>window.PAYLOAD=null;window.FAIL=false;window.CALLS=0;
window.supabase={createClient:()=>({auth:{getSession:async()=>({data:{session:{user:{id:'u'}}}})},
 rpc:async(n,a)=>{if(n==='four_sapien_finance_control_read'){CALLS++;window.LASTARG=a;if(FAIL)return{data:null,error:{message:'RPC_FAIL'}};return{data:PAYLOAD,error:null}}return{data:{state:'AVAILABLE',year:2026,timeline:{months:[]}},error:null}}})};<\/script>
<script>${twin}<\/script><script>${mn}<\/script></body></html>`);
await pg.waitForTimeout(600);
const txt=()=>pg.evaluate(()=>document.getElementById('fsMoneyNow')?.innerText||'');
ok(await pg.evaluate(()=>typeof window.FourSapienFinanceRuntime.controlRead==='function'),'controlRead exposed on Twin runtime');
ok(await pg.evaluate(()=>!!document.getElementById('fsMoneyNow')),'surface mounts inside #axeFin');
ok(await pg.evaluate(()=>document.getElementById('afBody').innerText==='LEDGER'),'existing ledger untouched');
// T1 known
await pg.evaluate(p=>{PAYLOAD=p;return FourSapienMoneyNow.refresh()},AV);await pg.waitForTimeout(150);
let t=await txt();
ok(/18\s?450/.test(t.replace(/\u00a0/g,' ')),'T1 available amount shown as recorded');
ok(/15\.10\.2026/.test(t),'T1 next income date shown');
ok(/6\s?200/.test(t.replace(/\u00a0/g,' ')),'T1 handlingsrom til lønning shown');
ok(/reservert/i.test(t)&&/ingen bankkobling/i.test(t),'T1 reserved/restricted honestly UNKNOWN');
ok(!/kr 0\b/.test(t),'T1 no invented zero');
ok((await pg.evaluate(()=>document.querySelector('#fsMoneyNow').dataset.truth))==='KNOWN_RECORDED','T1 truth-state attribute');
ok((await pg.evaluate(()=>LASTARG.p_days))===30,'T1 reads 30-day horizon from contract');
// T2 unknown stays unknown
await pg.evaluate(p=>{PAYLOAD=p;return FourSapienMoneyNow.refresh()},UNK);await pg.waitForTimeout(150);t=await txt();
ok(/ukjent/i.test(t)&&!/\b0 kr\b/.test(t),'T2 UNKNOWN stays UNKNOWN, never 0');
ok((await pg.evaluate(()=>document.querySelectorAll('#fsMoneyNow .mnVal[data-truth=UNKNOWN]').length))>=2,'T2 unknown cells marked');
// T3 overdue
await pg.evaluate(p=>{PAYLOAD=p;return FourSapienMoneyNow.refresh()},OVD);await pg.waitForTimeout(150);t=await txt();
ok(/Strøm/.test(t)&&/forfalt/i.test(t),'T3 unconfirmed overdue listed');
ok(/uavklart forfalt/i.test(t),'T3 payday room blocked by unresolved overdue, not guessed');
// T4 rpc failure
await pg.evaluate(()=>{FAIL=true;return FourSapienMoneyNow.refresh()});await pg.waitForTimeout(150);t=await txt();
ok(/kunne ikke hentes/i.test(t)&&/ukjent/i.test(t),'T4 failed read shown as unknown, not stale truth');
// T5 write triggers refresh
await pg.evaluate(p=>{FAIL=false;PAYLOAD=p;CALLS=0;window.dispatchEvent(new CustomEvent('four-sapien-finance-record-changed',{detail:{source:'overlay'}}))},AV);
await pg.waitForTimeout(400);ok((await pg.evaluate(()=>CALLS))>0,'T5 refreshes after a Finance write');
// T6 mobile + dark render
await pg.setViewportSize({width:390,height:844});await pg.waitForTimeout(100);
const box=await pg.evaluate(()=>{const e=document.getElementById('fsMoneyNow').getBoundingClientRect();return{w:e.width,of:document.documentElement.scrollWidth>document.documentElement.clientWidth}});
ok(box.w<=390&&!box.of,'T6 mobile 390: no horizontal overflow');
await pg.evaluate(()=>document.documentElement.setAttribute('data-theme','dark'));await pg.waitForTimeout(80);
ok((await pg.evaluate(()=>getComputedStyle(document.querySelector('#fsMoneyNow')).borderTopColor))!=='rgba(0, 0, 0, 0)','T6 dark: hairline border present');
ok(errs.length===0,'no page errors '+errs.join('|'));
await br.close();console.log(`\n${pass} passed, ${fail} failed`);process.exit(fail?1:0)})();
