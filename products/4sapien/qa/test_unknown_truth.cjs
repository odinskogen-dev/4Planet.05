// UNKNOWN is never ZERO: overlay runtime + React donor static invariants.
const fs=require('fs'),{chromium}=require('@playwright/test');
const F=process.argv[2]||'/tmp/p/products/4sapien/site/app/money/index.html';const s=fs.readFileSync(F,'utf8');
const scr=[...s.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/g)];
const overlay=scr.find(m=>m[2].includes('function money(t)'))[2];
const mk=s.slice(s.indexOf('<div id="axeFin">'),s.indexOf('<script>',s.indexOf('<div id="axeFin">')));
let pass=0,fail=0;const ok=(c,m)=>{c?pass++:fail++;console.log((c?'PASS ':'FAIL ')+m)};
const Y=new Date().getFullYear(),M=new Date().getMonth()+1;
const d=(y,m,day)=>`${y}-${String(m).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
const rows=[{id:'e1',type:'spend',name:'Husleie',amount:9000,recurring:'monthly',occurred_on:d(Y,M,1),state:'active',category:'Bolig',currency:'NOK',created_at:'x'},
            {id:'e2',type:'income',name:'Lønn',amount:37000,recurring:'monthly',occurred_on:d(Y,M,15),state:'active',category:'Lønn',currency:'NOK',created_at:'x'}];
const accts=[{id:'a1',name:'Brukskonto',kind:'bank',balance:40000,created_at:'x'},
             {id:'a2',name:'Aksjekonto',kind:'investment',balance:71000,created_at:'x'},
             {id:'a3',name:'Fondskonto',kind:'investment',balance:null,created_at:'x'}];
const mock=(rows,acct)=>`window.DB={four_sapien_finance_accounts:${JSON.stringify(acct)},four_sapien_finance_events:${JSON.stringify(rows)}};
function q(t){const b={select(){return b},order(){return b},update(){return b},delete(){return b},insert(){return b},eq(){return b},
 then(r){setTimeout(()=>r({data:JSON.parse(JSON.stringify(DB[t])),error:null}),0)}};return b}
var sb={auth:{getSession:async()=>({data:{session:{user:{id:'u'}}}})},from:q,rpc:async()=>({data:null,error:null})};window.supabase={createClient:()=>sb};`;
const page=(rows,acct)=>`<!doctype html><html><body><div id="root">Tilgjengelig nå · Scan med Embla</div>${mk}<script>${mock(rows,acct)}<\/script><script>${overlay}<\/script></body></html>`;
(async()=>{const br=await chromium.launch();
const pg=await br.newPage();const errs=[];pg.on('pageerror',e=>errs.push(e.message));
await pg.setContent(page(rows,accts));await pg.waitForTimeout(700);
const body=await pg.evaluate(()=>document.getElementById('afBody').innerText);
const cells=await pg.evaluate(()=>[...document.querySelectorAll('[data-m]')].map(e=>e.innerText.replace(/\s+/g,' ').trim()));
const past=cells.filter((c,i)=>i<new Date().getMonth());
ok(past.length>0&&past.every(c=>/UKJENT/i.test(c)),`tomme tidligere måneder er UKJENT (${past[0]||'ingen'})`);
ok(!past.some(c=>/\+0k|0 kr/.test(c)),'ingen tidligere måned viser falsk 0');
const nowCell=cells[new Date().getMonth()];ok(/NÅ/.test(nowCell),`inneværende måned er NÅ (${nowCell})`);
ok(/Eiendeler[\s\S]{0,40}UKJENT/i.test(body),'Eiendeler er UKJENT når en saldo mangler');
const accountInputs=await pg.evaluate(()=>[...document.querySelectorAll('[data-a]')].map(r=>({name:r.querySelector('.an')?.value,balance:r.querySelector('.ab')?.value,ph:r.querySelector('.ab')?.placeholder})));
const fund=accountInputs.find(x=>x.name==='Fondskonto');ok(fund&&fund.balance===''&&fund.ph==='UKJENT','ukjent kontosaldo står tom/UKJENT, aldri 0');
await pg.evaluate(()=>document.querySelector('[data-cat="asset"]').click());await pg.waitForTimeout(250);
const drill=await pg.evaluate(()=>document.getElementById('afBody').innerText);
ok(/Aksjekonto/.test(drill),'investment-konto vises i Eiendeler-drilldown');
ok(/UKJENT SALDO/.test(drill),'ukjent investering merkes UKJENT SALDO');
ok(/UKJENT/.test(drill),'drilldown-sum blir UKJENT når en saldo mangler');
ok(errs.length===0,'ingen overlay-sidefeil '+errs.join('|'));
const pgNull=await br.newPage();await pgNull.setContent(page(rows,[{id:'b',name:'Brukskonto',kind:'bank',balance:null,created_at:'x'}]));await pgNull.waitForTimeout(650);
const nullBody=await pgNull.evaluate(()=>document.getElementById('afBody').innerText);ok(/Tilgjengelig nå[\s\S]{0,60}UKJENT/i.test(nullBody),'NULL likvid saldo gir UKJENT tilgjengelig');await pgNull.close();
const pg2=await br.newPage();await pg2.setContent(page(rows,accts.map(a=>a.balance===null?{...a,balance:5000}:a)));await pg2.waitForTimeout(650);
const b2=await pg2.evaluate(()=>document.getElementById('afBody').innerText);ok(/116\s?000/.test(b2.replace(/\u00a0/g,' ')),'Eiendeler summerer når alle saldoer er kjent (116 000)');await pg2.close();
ok(s.includes('balance:r.balance===null||r.balance===undefined?null:Number(r.balance)'),'React dbAccount bevarer NULL');
ok(s.includes('function liquidBalance(accounts){const rows=accounts.filter((a)=>a.kind==="bank"||a.kind==="cash")'),'React likviditet bruker bare bank/cash');
ok(s.includes('const kr=(n)=>(n===null||n===undefined||n===""'),'React formatter viser UKJENT for NULL');
ok(!s.includes('balance:+r.balance||0'),'gammel React NULL→0 hydration er borte');
ok(!s.includes('function liquidBalance(accounts){return accounts.filter((a)=>a.kind!=="investment")'),'gammel React likviditetsdefinisjon er borte');
await pg.close();await br.close();console.log(`\n${pass} passed, ${fail} failed`);process.exit(fail?1:0)})().catch(e=>{console.error(e);process.exit(1)});
