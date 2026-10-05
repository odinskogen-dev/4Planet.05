// 4SAPIEN shell regression: one world bar, no lateral drift, safe fixed chrome.
const {chromium,webkit}=require('@playwright/test');
const path=require('path'),http=require('http'),fs=require('fs');
const SITE=process.argv[2]||'/tmp/p/products/4sapien/site';
const BROWSER=(process.env.FS_BROWSER||'chromium').toLowerCase();
const type=BROWSER==='webkit'?webkit:chromium;
let pass=0,fail=0;const ok=(c,m)=>{c?pass++:fail++;console.log((c?'PASS ':'FAIL ')+m)};
const PAGES=[
 ['Penger','/app/money/'],['Mat','/app/food/'],['Forsiden','/'],['Brain','/brain/'],
 ['Dokumenter','/app/money/documents/'],['Import','/app/money/import/']
];
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css'};
const srv=http.createServer((q,res)=>{let f=path.join(SITE,decodeURI(q.url.split('?')[0]));if(f.endsWith('/'))f+='index.html';
 try{const b=fs.readFileSync(f);res.writeHead(200,{'Content-Type':mime[path.extname(f)]||'text/plain'});res.end(b)}catch(e){res.writeHead(404);res.end('x')}});
(async()=>{await new Promise(r=>srv.listen(8099,r));const br=await type.launch();
const ctx=await br.newContext({viewport:{width:390,height:844},deviceScaleFactor:BROWSER==='webkit'?1:3,isMobile:true,hasTouch:true});
await ctx.route('**', r=>r.request().url().startsWith('http://localhost:8099')?r.continue():r.abort());
for(const [name,p] of PAGES){
  const pg=await ctx.newPage();const errs=[];pg.on('pageerror',e=>errs.push(e.message));
  await pg.goto('http://localhost:8099'+p,{waitUntil:'domcontentloaded'});await pg.waitForTimeout(1000);
  const r=await pg.evaluate(()=>{
    const d=document.documentElement,bar=document.getElementById('fsWorlds');
    const links=[...(bar?bar.querySelectorAll('a'):[])].map(a=>({t:a.textContent.trim(),h:a.getAttribute('href'),cur:a.getAttribute('aria-current')}));
    const barRect=bar?bar.getBoundingClientRect():null;
    const old=document.getElementById('fs-global-appnav'),rootWorlds=document.getElementById('worlds');
    return{overflow:d.scrollWidth-d.clientWidth,links,bottom:barRect?Math.round(barRect.bottom):null,top:barRect?barRect.top:null,
      inner:window.innerHeight,padBottom:parseFloat(getComputedStyle(document.body).paddingBottom)||0,
      oldVisible:old?getComputedStyle(old).display!=='none':false,rootWorldsVisible:rootWorlds?getComputedStyle(rootWorlds).display!=='none':false};
  });
  ok(r.overflow<=0,`${BROWSER} ${name}: ingen sidelengs scroll (${r.overflow}px)`);
  ok(r.links.length===5&&r.links.map(x=>x.t).join('|')==='I dag|Penger|Mat|Brain|Meg',`${BROWSER} ${name}: én verdenslinje med 5 verdener`);
  ok(r.links.some(l=>l.cur==='page'),`${BROWSER} ${name}: aktiv verden merket`);
  ok(r.bottom!==null&&Math.abs(r.bottom-r.inner)<=2,`${BROWSER} ${name}: verdenslinjen ligger i bunn`);
  ok(r.padBottom>=60,`${BROWSER} ${name}: innhold klarer verdenslinjen (${r.padBottom})`);
  ok(!r.oldVisible&&!r.rootWorldsVisible,`${BROWSER} ${name}: gamle globale navigasjoner er skjult`);
  ok(errs.length===0,`${BROWSER} ${name}: ingen sidefeil ${errs.join('|')}`);
  if(name==='Forsiden'){
    const overlap=await pg.evaluate(()=>{const e=document.querySelector('.emblabar'),w=document.getElementById('fsWorlds');if(!e||!w)return 0;return e.getBoundingClientRect().bottom-w.getBoundingClientRect().top;});
    ok(overlap<=2,`${BROWSER} Forsiden: Embla-felt overlapper ikke verdenslinjen (${overlap}px)`);
  }
  for(const w of [320,430]){await pg.setViewportSize({width:w,height:800});await pg.waitForTimeout(250);const o=await pg.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);ok(o<=0,`${BROWSER} ${name} @${w}px: ingen sidelengs scroll (${o})`);}
  await pg.evaluate(()=>document.documentElement.setAttribute('data-theme','dark'));await pg.waitForTimeout(150);
  const dark=await pg.evaluate(()=>getComputedStyle(document.getElementById('fsWorlds')).backgroundColor);
  ok(dark==='rgb(0, 0, 0)'||dark==='rgba(0, 0, 0, 1)',`${BROWSER} ${name}: verdenslinjen er ekte svart i dark`);
  await pg.close();
}
const fx=await ctx.newPage();
await fx.setContent(`<!doctype html><html><body><nav id="local" style="position:fixed;left:0;right:0;bottom:0;background:rgba(255,255,255,.75)"><div><button style="font-weight:600">Oversikt</button><button>Penger</button></div></nav><div role="dialog" id="scrim" style="position:fixed;inset:0;background:rgba(0,0,0,.28);display:none"></div><main style="min-height:1800px">x</main><script src="http://localhost:8099/4sapien-shell.js"></script></body></html>`,{waitUntil:'domcontentloaded'});await fx.waitForTimeout(500);
const syn=await fx.evaluate(()=>{const n=document.getElementById('local'),s=document.getElementById('scrim'),cs=getComputedStyle(n);return{sub:n.hasAttribute('data-fs-subnav'),pos:cs.position,top:cs.top,body:document.body.classList.contains('fs-has-subnav'),scrimAttr:s.hasAttribute('data-fs-opaque'),scrimBg:getComputedStyle(s).backgroundColor};});
ok(syn.sub&&syn.pos==='fixed'&&parseFloat(syn.top)===0&&syn.body,`${BROWSER} synthetic: lokal produktmeny er fast toppfelt`);
ok(!syn.scrimAttr&&/0\.28|0\.279|0\.282/.test(syn.scrimBg),`${BROWSER} synthetic: modal-scrim beholder transparens (${syn.scrimBg})`);
await fx.close();
const me=await ctx.newPage();await me.goto('http://localhost:8099/app/food/#meg',{waitUntil:'domcontentloaded'});await me.waitForTimeout(500);
const active=await me.evaluate(()=>document.querySelector('#fsWorlds a[aria-current="page"]')?.textContent.trim());
ok(active==='Meg',`${BROWSER} Meg: hash gir aktiv Meg-verden (${active})`);await me.close();
const pg=await ctx.newPage();await pg.goto('http://localhost:8099/app/money/',{waitUntil:'domcontentloaded'});await pg.waitForTimeout(700);
await pg.evaluate(()=>{const d=document.createElement('div');d.style.height='3000px';document.body.appendChild(d);window.scrollTo(0,900)});await pg.waitForTimeout(120);
await pg.evaluate(()=>{window.dispatchEvent(new CustomEvent('four-sapien-finance-record-changed',{detail:{source:'overlay'}}));window.scrollTo(0,0)});await pg.waitForTimeout(450);
const y=await pg.evaluate(()=>window.scrollY);ok(Math.abs(y-900)<12,`${BROWSER} Penger: scroll-posisjon bevart (${y})`);await pg.close();
await br.close();srv.close();console.log(`\n${pass} passed, ${fail} failed (${BROWSER})`);process.exit(fail?1:0)})().catch(e=>{console.error(e);srv.close();process.exit(1)});
