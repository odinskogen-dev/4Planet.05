import {chromium} from "@playwright/test";
import assert from "node:assert/strict";
import {spawn} from "node:child_process";
import {mkdir} from "node:fs/promises";
const host="http://127.0.0.1:4179";
const proc=spawn("npm",["run","preview","--","--host","127.0.0.1","--port","4179","--strictPort"],{stdio:"ignore"});
let browser;
async function ready(){for(let n=0;n<70;n++){try{if((await fetch(host+"/finance")).ok)return}catch{}await new Promise(r=>setTimeout(r,500))}throw Error("Finance preview unavailable")}
try{
 await ready();await mkdir("artifacts/finance-insights",{recursive:true});browser=await chromium.launch({headless:true});
 for(const [label,viewport] of [["mobile",{width:390,height:844}],["desktop",{width:1440,height:900}]]){
  const page=await browser.newPage({viewport});const errors=[];page.on("pageerror",e=>errors.push(e.message));
  await page.goto(host+"/finance",{waitUntil:"domcontentloaded"});
  await page.getByRole("heading",{name:/Find the funding/i}).waitFor();
  const topic=page.locator(".fc-category-grid .fc-category").first();
  assert.match(await topic.getAttribute("class"),/fc-theme-/);
  const topicColor=await topic.evaluate(el=>getComputedStyle(el).backgroundColor);
  const rootColor=await page.locator(".fc-root").evaluate(el=>getComputedStyle(el).backgroundColor);
  assert.notEqual(topicColor,rootColor,"Theme cards should have recognizable color");
  await page.screenshot({path:"artifacts/finance-insights/"+label+"-topics.png"});
  await page.goto(host+"/finance/sign-in",{waitUntil:"domcontentloaded"});
  const google=page.getByRole("button",{name:"Continue with Google"});await google.waitFor();
  const card=page.locator(".fc-signin .fc-form-panel");
  await card.waitFor();
  const dark=await page.locator(".fc-root").getAttribute("data-theme");
  const cardColor=await card.evaluate(el=>getComputedStyle(el).backgroundColor);
  assert.ok(dark==="dark"||dark==="light");
  if(dark==="dark")assert.notEqual(cardColor,"rgb(250, 251, 252)","Sign-in must not remain light in dark mode");
  await page.screenshot({path:"artifacts/finance-insights/"+label+"-sign-in.png"});
  await page.goto(host+"/finance/funders",{waitUntil:"domcontentloaded"});
  await page.getByRole("heading",{name:"Funders"}).waitFor();
  const heights=await page.locator(".fc-funder-directory .fc-funder-row").evaluateAll(els=>els.slice(0,4).map(x=>x.getBoundingClientRect().height));
  assert.ok(heights.length>=3&&heights.every(h=>h<=64),"Funder rows must be materially denser: "+JSON.stringify(heights));
  await page.screenshot({path:"artifacts/finance-insights/"+label+"-funders.png"});
  await page.goto(host+"/finance/discover",{waitUntil:"domcontentloaded"});
  await page.getByText("Blue Coast 2026").first().waitFor();
  assert.ok(await page.locator(".fc-theme-chip").count()>0);
  await page.getByRole("button",{name:/save/i}).first().click();
  await page.goto(host+"/finance/my",{waitUntil:"domcontentloaded"});
  await page.getByRole("heading",{name:"Finance at a glance"}).waitFor();
  assert.equal(await page.locator(".fc-decision-panel").count(),4);
  await page.screenshot({path:"artifacts/finance-insights/"+label+"-overview.png"});
  await page.getByRole("link",{name:/Saved:|Oct:|Nov:/}).count().catch(()=>0);
  await page.getByRole("link",{name:/CRM/}).first().click();
  assert.match(page.url(),/my\/pipeline/);
  await page.goto(host+"/finance/my",{waitUntil:"domcontentloaded"});
  await page.getByRole("link",{name:/saved demonstration deadlines/i}).first().click();
  assert.match(page.url(),/my\/calendar\?month=/);
  const size=await page.evaluate(()=>({width:document.documentElement.scrollWidth,viewport:innerWidth}));
  assert.ok(size.width<=size.viewport+3,JSON.stringify(size));assert.deepEqual(errors,[]);
  console.log("FINANCE_INSIGHTS_UI_PASS="+label);await page.close();
 }
}finally{if(browser)await browser.close();proc.kill("SIGTERM")}
