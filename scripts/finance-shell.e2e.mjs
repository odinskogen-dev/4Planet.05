import {chromium} from "@playwright/test";
import assert from "node:assert/strict";
import {spawn} from "node:child_process";
import {mkdir} from "node:fs/promises";

const host="http://127.0.0.1:4178";
const proc=spawn("npm",["run","preview","--","--host","127.0.0.1","--port","4178","--strictPort"],{stdio:"ignore"});
let browser;
async function ready(){for(let i=0;i<55;i++){try{if((await fetch(host+"/finance")).ok)return;}catch{}await new Promise(r=>setTimeout(r,500));}throw new Error("Local Finance preview unavailable")}
try{
 await ready();
 await mkdir("artifacts/finance-shell",{recursive:true});
 browser=await chromium.launch({headless:true});
 for(const [label,viewport] of [["desktop",{width:1440,height:900}],["mobile",{width:390,height:844}]]){
  const page=await browser.newPage({viewport});
  const errors=[];page.on("pageerror",x=>errors.push(x.message));
  await page.goto(host+"/finance",{waitUntil:"domcontentloaded"});
  await page.getByRole("heading",{name:/Find the funding/i}).waitFor();
  const search=page.getByRole("textbox",{name:"Search all funding opportunities"});
  await search.waitFor();
  const profile=page.getByRole("button",{name:"Open profile and settings"});
  await profile.click();
  await page.getByRole("menu",{name:"Profile and settings"}).waitFor();
  await page.getByRole("button",{name:/Use (light|dark) mode/i}).click();
  const changed=await page.locator(".fc-root").getAttribute("data-theme");
  assert.ok(changed==="dark"||changed==="light");
  await page.reload({waitUntil:"domcontentloaded"});
  assert.equal(await page.locator(".fc-root").getAttribute("data-theme"),changed,"Saved appearance must persist");
  await page.getByRole("button",{name:"Open profile and settings"}).click();
  await page.getByRole("menu",{name:"Profile and settings"}).waitFor();
  await page.getByRole("button",{name:/Use (light|dark) mode/i}).click();
  await page.screenshot({path:"artifacts/finance-shell/"+label+"-home.png"});
  await search.fill("Blue");
  await search.press("Enter");
  assert.match(page.url(),/discover\?q=Blue/);
  await page.getByText("Blue Coast 2026").first().waitFor();
  await page.getByRole("button",{name:/save/i}).first().click();
  await page.goto(host+"/finance/my/projects",{waitUntil:"domcontentloaded"});
  await page.getByRole("textbox",{name:"Project name"}).fill("Network project");
  await page.getByRole("button",{name:/Create demo project/i}).click();
  await page.goto(host+"/finance/my/pipeline",{waitUntil:"domcontentloaded"});
  await page.getByRole("combobox",{name:/Project for Blue Coast 2026/i}).selectOption({label:"Network project"});
  await page.goto(host+"/finance/my/graph",{waitUntil:"domcontentloaded"});
  await page.getByRole("heading",{name:/Funding map/i}).waitFor();
  await page.getByRole("button",{name:/Opportunity: Blue Coast 2026/i}).click();
  await page.getByRole("region",{name:/Selected funding node details/i}).waitFor();
  await page.screenshot({path:"artifacts/finance-shell/"+label+"-graph.png"});
  await page.goto(host+"/finance/my",{waitUntil:"domcontentloaded"});
  await page.getByRole("heading",{name:/Pipeline analysis/i}).waitFor();
  await page.screenshot({path:"artifacts/finance-shell/"+label+"-dashboard.png"});
  if(label==="mobile"){
   const nav=page.getByRole("navigation",{name:"Primary mobile navigation"});
   await nav.waitFor();
   assert.ok(await nav.getByRole("link").count()===5);
   await nav.getByRole("link",{name:/Year wheel/i}).click();
   assert.match(page.url(),/my\/calendar/);
  }
  const size=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,viewport:window.innerWidth}));
  assert.ok(size.scroll<=size.viewport+3,"Unexpected document overflow: "+JSON.stringify(size));
  assert.deepEqual(errors,[],"Runtime JS errors");
  console.log("FINANCE_NORDIC_SHELL_PASS "+label);
  await page.close();
 }
}finally{if(browser)await browser.close();proc.kill("SIGTERM")}
