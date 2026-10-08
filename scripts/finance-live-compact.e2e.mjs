import {chromium} from "@playwright/test";
import assert from "node:assert/strict";
import {mkdir} from "node:fs/promises";
const origin="https://finance.4planet.org";
await mkdir("artifacts/finance-live-compact",{recursive:true});
const browser=await chromium.launch({headless:true});
try{
 for(const [name,viewport] of [["desktop",{width:1440,height:900}],["mobile",{width:390,height:844}]]){
  const context=await browser.newContext({viewport,locale:"en-GB"});
  await context.addInitScript(()=>localStorage.setItem("4planet-finance-theme","dark"));
  const page=await context.newPage();
  const errors=[];
  page.on("pageerror",e=>errors.push(e.message));
  const home=await page.goto(origin+"/",{waitUntil:"domcontentloaded",timeout:35000});
  assert.equal(home?.status(),200);
  assert.match(home?.headers()["x-robots-tag"]||"",/noindex/i);
  await page.getByRole("link",{name:"4Finance overview"}).waitFor();
  assert.equal(await page.locator(".fc-root").getAttribute("data-theme"),"dark");
  assert.equal(await page.locator(".fc-root").evaluate(el=>getComputedStyle(el).backgroundColor),"rgb(0, 0, 0)");
  await page.screenshot({path:"artifacts/finance-live-compact/"+name+"-dark.png"});
  await page.getByRole("button",{name:"Open profile and settings"}).click();
  await page.getByRole("button",{name:/Use light mode/i}).click();
  assert.equal(await page.locator(".fc-root").evaluate(el=>getComputedStyle(el).backgroundColor),"rgb(255, 255, 255)");
  await page.screenshot({path:"artifacts/finance-live-compact/"+name+"-light.png"});
  await page.goto(origin+"/funders",{waitUntil:"domcontentloaded"});
  await page.getByRole("heading",{name:"Funders"}).waitFor();
  const rows=page.locator(".fc-funder-directory .fc-funder-row");
  assert.ok(await rows.count()>=3);
  const heights=await rows.evaluateAll(els=>els.slice(0,4).map(el=>el.getBoundingClientRect().height));
  assert.ok(heights.every(h=>h<=85),"Noncompact rows: "+JSON.stringify(heights));
  await page.screenshot({path:"artifacts/finance-live-compact/"+name+"-funders.png"});
  const search=page.getByRole("textbox",{name:"Search all funding opportunities"});
  await search.fill("Blue");await search.press("Enter");
  assert.match(page.url(),/discover\?q=Blue/);
  await page.getByText("Blue Coast 2026").first().waitFor();
  await page.getByRole("button",{name:/save/i}).first().click();
  await page.goto(origin+"/my/pipeline",{waitUntil:"domcontentloaded"});
  await page.getByText("Blue Coast 2026").first().waitFor();
  const submitted=page.getByRole("combobox",{name:/Stage for Blue Coast 2026/i}).locator("option",{hasText:"Submitted"});
  assert.ok(await submitted.isDisabled());
  await page.goto(origin+"/my",{waitUntil:"domcontentloaded"});
  await page.getByRole("heading",{name:/Pipeline analysis/i}).waitFor();
  await page.screenshot({path:"artifacts/finance-live-compact/"+name+"-overview.png"});
  if(name==="mobile"){
    const nav=page.getByRole("navigation",{name:"Primary mobile navigation"});
    assert.equal(await nav.getByRole("link").count(),5);
    const width=await page.evaluate(()=>({document:document.documentElement.scrollWidth,device:innerWidth}));
    assert.ok(width.document<=width.device+3,JSON.stringify(width));
  }
  assert.deepEqual(errors,[]);
  console.log("FINANCE_2_1_LIVE_BROWSER_PASS="+name);
  await context.close();
 }
}finally{await browser.close()}
