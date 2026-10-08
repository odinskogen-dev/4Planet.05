import { chromium } from "@playwright/test";
import assert from "node:assert/strict";

const origin = "https://finance.4planet.org";
let browser;
try {
 browser = await chromium.launch({headless:true});
 for (const size of [{width:1440,height:900},{width:390,height:844}]) {
  const page=await browser.newPage({viewport:size});
  const runtimeErrors=[];
  page.on("pageerror",error=>runtimeErrors.push(error.message));
  const response=await page.goto(origin+"/",{waitUntil:"domcontentloaded",timeout:30000});
  assert.equal(response?.status(),200,"Finance home should return HTTP 200");
  assert.match(response?.headers()["x-robots-tag"]||"",/noindex/i,"Beta must remain noindex");
  await page.getByRole("heading",{name:/Find the funding/i}).waitFor({timeout:30000});
  await page.getByRole("link",{name:/Explore opportunities/i}).click();
  assert.match(page.url(),/\/discover/);
  await page.getByRole("textbox",{name:"Search opportunities"}).fill("Blue");
  await page.getByText("Blue Coast 2026").first().waitFor();
  await page.getByRole("button",{name:/save/i}).first().click();
  await page.goto(origin+"/my/pipeline",{waitUntil:"domcontentloaded"});
  await page.getByText("Blue Coast 2026").first().waitFor();
  await page.goto(origin+"/my/projects",{waitUntil:"domcontentloaded"});
  await page.getByRole("textbox",{name:"Project name"}).fill("Live-route guest verification");
  await page.getByRole("button",{name:/Create demo project/i}).click();
  await page.goto(origin+"/my/pipeline",{waitUntil:"domcontentloaded"});
  await page.getByRole("combobox",{name:/Project for Blue Coast 2026/i}).selectOption({label:"Live-route guest verification"});
  await page.reload({waitUntil:"domcontentloaded"});
  assert.notEqual(await page.getByRole("combobox",{name:/Project for Blue Coast 2026/i}).inputValue(),"","Guest demo state survives reload");
  await page.goto(origin+"/my/graph",{waitUntil:"domcontentloaded"});
  await page.getByText("Live-route guest verification").first().waitFor();
  await page.goto(origin+"/sign-in",{waitUntil:"domcontentloaded"});
  await page.getByRole("heading",{name:/Sign in to Finance/i}).waitFor();
  await page.getByRole("textbox",{name:"Email address"}).waitFor();
  await page.getByText(/same Supabase Auth account/i).first().waitFor();
  assert.deepEqual(runtimeErrors,[],"No browser JS exceptions");
  console.log("LIVE_FINANCE_BROWSER_PASS="+size.width);
  await page.close();
 }
} finally {if(browser)await browser.close()}
