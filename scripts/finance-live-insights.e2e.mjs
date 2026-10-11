import {chromium} from "@playwright/test";
import assert from "node:assert/strict";
import {mkdir} from "node:fs/promises";
const origin="https://finance.4planet.org";
await mkdir("artifacts/finance-live-insights",{recursive:true});
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
  await page.screenshot({path:"artifacts/finance-live-insights/"+name+"-dark.png"});
  await page.getByRole("button",{name:"Open profile and settings"}).click();
  await page.getByRole("button",{name:/Use light mode/i}).click();
  assert.equal(await page.locator(".fc-root").evaluate(el=>getComputedStyle(el).backgroundColor),"rgb(255, 255, 255)");
  await page.screenshot({path:"artifacts/finance-live-insights/"+name+"-light.png"});
  await page.goto(origin+"/sign-in",{waitUntil:"domcontentloaded"});
  await page.getByRole("button",{name:"Continue with Google"}).waitFor();
  const form=page.locator(".fc-signin .fc-form-panel");
  const authColor=await form.evaluate(el=>getComputedStyle(el).backgroundColor);
  assert.ok(authColor!=="rgb(250, 251, 252)","Auth card must inherit Finance theme");
  await page.screenshot({path:"artifacts/finance-live-insights/"+name+"-sign-in.png"});
  await page.goto(origin+"/",{waitUntil:"domcontentloaded"});
  const topic=page.locator(".fc-category-grid .fc-category").first();
  const tinted=await topic.evaluate(el=>getComputedStyle(el).backgroundColor);
  assert.notEqual(tinted,"rgb(255, 255, 255)","Thematic cards need color");
  await page.screenshot({path:"artifacts/finance-live-insights/"+name+"-topics.png"});
  await page.goto(origin+"/funders",{waitUntil:"domcontentloaded"});
  await page.getByRole("heading",{name:"Funders"}).waitFor();
  const rows=page.locator(".fc-funder-directory .fc-funder-row");
  assert.ok(await rows.count()>=3);
  const heights=await rows.evaluateAll(els=>els.slice(0,4).map(el=>el.getBoundingClientRect().height));
  assert.ok(heights.every(h=>h<=64),"Funder rows are not compact: "+JSON.stringify(heights));
  await page.screenshot({path:"artifacts/finance-live-insights/"+name+"-funders.png"});
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
  await page.getByRole("heading",{name:"Finance at a glance"}).waitFor();
  assert.equal(await page.locator(".fc-decision-panel").count(),4);
  await page.screenshot({path:"artifacts/finance-live-insights/"+name+"-overview.png"});
  await page.getByRole("link",{name:/saved demonstration deadlines/i}).first().click();
  assert.match(page.url(),/my\/calendar\?month=/);

  if(name==="mobile"){
    const nav=page.getByRole("navigation",{name:"Primary mobile navigation"});
    assert.equal(await nav.getByRole("link").count(),5);
    const width=await page.evaluate(()=>({document:document.documentElement.scrollWidth,device:innerWidth}));
    assert.ok(width.document<=width.device+3,JSON.stringify(width));
  }
  assert.deepEqual(errors,[]);
  console.log("FINANCE_2_2_LIVE_BROWSER_PASS="+name);
  await context.close();
 }
}finally{await browser.close()}
