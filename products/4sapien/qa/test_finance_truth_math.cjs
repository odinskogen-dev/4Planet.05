// Finance truth math: one-off events must reach the overview; year must be real.
const fs=require('fs'),{chromium}=require('@playwright/test');
const F=process.argv[2]||'products/4sapien/site/app/money/index.html';const s=fs.readFileSync(F,'utf8');
const scr=[...s.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/g)];
const overlay=scr.find(m=>m[2].includes("function money(t)"))[2];
const mk=s.slice(s.indexOf('<div id="axeFin">'),s.indexOf('<script>',s.indexOf('<div id="axeFin">')));
const ev=(o)=>Object.assign({id:'e'+Math.random().toString(36).slice(2,7),type:'spend',name:'X',amount:0,currency:'NOK',category:'Annet',recurring:'once',state:'active',created_at:'2026-01-01'},o);
let pass=0,fail=0;const ok=(c,m)=>{c?pass++:fail++;console.log((c?'PASS ':'FAIL ')+m)};
const mock=(rows,acct)=>`window.DB={four_sapien_finance_accounts:${JSON.stringify(acct)},four_sapien_finance_events:${JSON.stringify(rows)}};
function q(t){const b={select(){return b},order(){return b},update(){return b},delete(){return b},insert(){return b},eq(){return b},
 then(r){setTimeout(()=>r({data:JSON.parse(JSON.stringify(DB[t])),error:null}),0)}};return b}
var sb={auth:{getSession:async()=>({data:{session:{user:{id:'u'}}}})},from:q,rpc:async()=>({data:null,error:null})};
window.supabase={createClient:()=>sb};`;
const clock=t=>t?`<script>(function(){const R=Date;function F(...a){return a.length?new R(...a):new R(${t})}F.now=()=>${t};F.prototype=R.prototype;F.parse=R.parse;F.UTC=R.UTC;window.Date=F})();<\/script>`:'';
const page=(rows,acct,t)=>`<!doctype html><html><body><div id="root">Tilgjengelig nå · Scan med Embla</div>${mk}${clock(t)}<script>${mock(rows,acct)}<\/script><script>${overlay}<\/script></body></html>`;
const d=(y,m,day)=>`${y}-${String(m).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
(async()=>{const br=await chromium.launch();
const now=new Date(),Y=now.getFullYear(),M=now.getMonth()+1;
const rows=[ev({type:'spend',name:'Husleie',amount:9000,recurring:'monthly',occurred_on:d(Y,1,1)}),
            ev({type:'spend',name:'Bilreparasjon',amount:4500,recurring:'once',occurred_on:d(Y,M,2)}),
            ev({type:'income',name:'Lønn',amount:40000,recurring:'monthly',occurred_on:d(Y,1,15)}),
            ev({type:'income',name:'Frilansoppdrag',amount:12000,recurring:'once',occurred_on:d(Y,M,3)}),
            ev({type:'spend',name:'Fjorårsutgift',amount:7777,recurring:'once',occurred_on:d(Y-1,M,5)})];
const pg=await br.newPage();const errs=[];pg.on('pageerror',e=>errs.push(e.message));
await pg.setContent(page(rows,[{id:'a1',name:'Brukskonto',kind:'bank',balance:25000,created_at:'2026-01-01'}]));
await pg.waitForTimeout(600);
const txt=await pg.evaluate(()=>document.getElementById('afBody').innerText);
const num=l=>{const m=txt.replace(/\u00a0/g,' ').match(new RegExp(l+'[\\s\\S]{0,60}?([\\d  ]{3,})'));return m?Number(m[1].replace(/[^\d]/g,'')):null};
const out=num('Utgift / mnd'),inn=num('Inntekt / mnd');
ok(out===13500,`one-off expense in overview: Utgift/mnd = ${out} (forventet 13500 = 9000 fast + 4500 engangs)`);
ok(inn===52000,`one-off income in overview: Inntekt/mnd = ${inn} (forventet 52000)`);
ok(!/\b7 ?777\b/.test(txt),'engangspost fra i fjor teller ikke i denne måneden');
ok(txt.includes(String(Y)),`visningen bruker inneværende år ${Y}, ikke hardkodet 2026`);
ok(!/tvilling · 2026/.test(txt)||Y===2026,'ingen hardkodet 2026 i overskrift');
// drilldown: one-off must be listed and summed
await pg.evaluate(()=>document.querySelector('[data-cat="spend"]').click());await pg.waitForTimeout(300);
const dt=await pg.evaluate(()=>{const b=document.getElementById('afBody');return b.innerText+' '+[...b.querySelectorAll('input')].map(i=>i.value).join(' ')});
ok(/Bilreparasjon/.test(dt)&&/ENGANGS/.test(dt),'drilldown viser engangsutgiften merket ENGANGS');
// year rollover: same data, clock moved to next 1 January
await pg.evaluate(()=>{});
const pg2=await br.newPage();pg2.on('pageerror',e=>errs.push(e.message));

const rows2=rows.map(r=>({...r,occurred_on:r.occurred_on.replace(String(Y),String(Y+1)).replace(String(Y-1),String(Y))}));
await pg2.setContent(page(rows2,[{id:'a1',name:'Brukskonto',kind:'bank',balance:25000,created_at:'2026-01-01'}],new Date(Y+1,0,15,12).getTime()));
await pg2.waitForTimeout(600);
const t2=await pg2.evaluate(()=>document.getElementById('afBody').innerText);
ok(t2.includes(String(Y+1)),`1. januar ${Y+1}: visningen følger nytt år`);
const out2=Number((t2.replace(/\u00a0/g,' ').match(/Utgift \/ mnd[\s\S]{0,60}?([\d  ]{3,})/)||[])[1]?.replace(/[^\d]/g,''));
ok(out2===9000,`1. januar ${Y+1}: faste utgifter fortsatt synlige (${out2})`);
ok(errs.length===0,'ingen sidefeil '+errs.join('|'));
await br.close();console.log(`\n${pass} passed, ${fail} failed`);process.exit(fail?1:0)})();
