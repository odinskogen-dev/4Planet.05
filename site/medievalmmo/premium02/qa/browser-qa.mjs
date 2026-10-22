import { chromium } from 'playwright';
import assert from 'node:assert/strict';
const browser=await chromium.launch({channel:'chrome',headless:true,args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-webgl']});
let failed=false;
for(const cfg of [{name:'desktop',width:1366,height:768,mobile:false},{name:'mobile',width:390,height:844,mobile:true}]){
 const ctx=await browser.newContext({viewport:{width:cfg.width,height:cfg.height},deviceScaleFactor:1,hasTouch:cfg.mobile,isMobile:cfg.mobile});
 const page=await ctx.newPage(),errors=[];
 page.on('pageerror',e=>errors.push('PAGE: '+e.message));
 page.on('console',e=>{if(e.type()==='error')errors.push('CONSOLE: '+e.text())});
 page.on('response',r=>{if(r.status()>=400)errors.push('HTTP '+r.status()+' '+r.url())});
 try{
  const response=await page.goto('http://127.0.0.1:8877/',{waitUntil:'domcontentloaded',timeout:60000});
  assert.equal(response.status(),200);
  await page.waitForSelector('#bCamp',{timeout:30000});
  assert.match(await page.title(),/MEDIEVAL KINGDOMS/);
  await page.locator('#bCamp').click();
  await page.waitForSelector('.cmp-map',{state:'visible',timeout:25000});
  assert.match(await page.locator('.cmp-top').innerText(),/1187 AD/);
  const overview=await page.evaluate(()=>{const a=window.CUB_KINGDOMS.app;return {count:a.cmp.c.provinces.length,owned:a.cmp.c.owned('jerusalem').length,player:a.cmp.c.player,route:a.cmp.c.dateText()}});
  assert.equal(overview.count,36);assert.equal(overview.player,'jerusalem');
  await page.screenshot({path:`premium02-kingdom-${cfg.name}.png`,fullPage:true});
  await page.evaluate(()=>{const app=window.CUB_KINGDOMS.app;const p=app.cmp.c.P.find(x=>x.name==='Jerusalem');app.cmp.select({kind:'prov',p:app.cmp.c.provinces[p.id]});});
  await page.locator('#enterSettlement').waitFor({state:'visible'});
  await page.locator('#enterSettlement').click();
  await page.waitForSelector('#kingdom-return',{state:'visible',timeout:20000});
  const data=await page.evaluate(()=>window.CUB_KINGDOMS.state());
  assert(data.buildings.some(b=>b.type==='forum'&&b.owner===1));
  assert(data.workers.length>=10);
  await page.screenshot({path:`premium02-settlement-${cfg.name}.png`,fullPage:true});
  const bw=await page.locator('canvas#world').boundingBox();assert(bw&&bw.width>=cfg.width*.95);
  await page.locator('#kingdom-return').click();
  await page.locator('.cmp-map').waitFor({state:'visible'});
  const saved=await page.evaluate(()=>Object.keys(localStorage).filter(k=>k.startsWith('cub_medieval_kingdoms_settlement_v2_')).length);
  assert(saved>=1);
  await page.evaluate(()=>window.CUB_KINGDOMS.app.cmp.save());
  await page.reload({waitUntil:'domcontentloaded'});
  await page.waitForSelector('#bCampC',{state:'visible',timeout:25000});
  await page.locator('#bCampC').click();
  assert.match(await page.locator('.cmp-top').innerText(),/1187 AD/);
  if(cfg.name==='desktop'){
    await page.evaluate(()=>{const a=window.CUB_KINGDOMS.app,c=a.cmp.c;const friend=c.armies.find(x=>x.f==='jerusalem');const foe=c.armies.find(x=>x.f==='ayyubids'); c.pending={kind:'battle',att:friend.id,def:foe.id,at:13};a.cmp._battlePrompt();});
    await page.locator('[data-a="fight"]').click();
    await page.waitForTimeout(1700);
    const inBattle=await page.evaluate(()=>!!window.CUB_KINGDOMS.app.battle);assert(inBattle);
    await page.screenshot({path:'premium02-tactical-battle-desktop.png',fullPage:true});
    await page.evaluate(()=>window.CUB_KINGDOMS.app._endBattle(true));
    await page.waitForTimeout(3200);
    const after=await page.evaluate(()=>{const a=window.CUB_KINGDOMS.app;return {inBattle:!!a.battle,visible:!a.cmp.hidden,pending:a.cmp.c.pending,saved:!!localStorage.getItem('cub_medieval_kingdoms_campaign_v2')}});
    assert.equal(after.inBattle,false);assert.equal(after.visible,true);assert.equal(after.pending,null);assert.equal(after.saved,true);
  }
  console.log('PREMIUM02_QA_PASS',JSON.stringify({viewport:cfg.name,overview,buildingCount:data.buildings.length,workers:data.workers.length,localSettlementSaves:saved,errors}));
  if(errors.length)throw Error('Runtime errors '+JSON.stringify(errors.slice(0,3)));
 }catch(e){failed=true;console.error('PREMIUM02_QA_FAIL',cfg.name,e.stack||String(e));await page.screenshot({path:`premium02-failed-${cfg.name}.png`,fullPage:true}).catch(()=>{});}
 await ctx.close();
}
await browser.close();if(failed)process.exit(1);