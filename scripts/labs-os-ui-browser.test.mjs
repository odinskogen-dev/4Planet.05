import {chromium} from "@playwright/test";
const sample={
 schemaVersion:1,authority:"4PLANET_BRAIN_READ_ONLY",source:"QA synthetic BRAIN",
 checkedAt:"2026-09-22T19:00:00Z",lastSourceUpdate:"2026-09-22T18:00:00Z",
 sourceCount:4,portfolioHydrated:true,lastSuccessfulAutomatedSync:"2026-09-22T18:00:00Z",
 syncStatus:"LAST_SUCCESSFUL_RUN",stale:false,runKey:"999-1",sourceRevision:"1234567890",lastError:null,
 projects:[
  {id:"synthetic-project",title:"QA Synthetic Project Home",objectType:"project_home",
   content:"QA_PROJECT_PRIVATE_DETAIL_ONLY_AFTER_CLICK",folder:"4PLANET/Project Homes",
   sourceModifiedAt:"2026-09-22T18:00:00Z",sourceHash:"qa_project_hash",
   metadata:{readDepth:"CONTENT"},uri:"https://docs.google.com/document/d/qa-synthetic-project/edit"},
  {id:"synthetic-wbs",title:"QA Synthetic WBS Workstream",objectType:"atomic_wbs",
   content:"1: QA_SCHEDULE_PRIVATE_DETAIL_ONLY_AFTER_CLICK",folder:"4PLANET/WBS",
   sourceModifiedAt:"2026-09-22T17:00:00Z",sourceHash:"qa_wbs_hash",
   metadata:{readDepth:"SHEET_ROWS"},uri:"https://docs.google.com/spreadsheets/d/qa-synthetic-sheet/edit"}
 ],
 sources:[
  {id:"synthetic-project",title:"QA Synthetic Project Home",objectType:"project_home",uri:"https://docs.google.com/document/d/qa-synthetic-project/edit",folder:"4PLANET/Project Homes",sourceModifiedAt:"2026-09-22T18:00:00Z",sourceHash:"qa_project_hash",metadata:{readDepth:"CONTENT"}},
  {id:"synthetic-uncopied",title:"QA Synthetic Inventory Only",objectType:"source_inventory",uri:"https://drive.google.com/file/d/qa-synthetic-inventory/view",folder:"4PLANET/Other",sourceModifiedAt:"2026-09-22T16:00:00Z",sourceHash:"qa_inventory",metadata:{readDepth:"INVENTORY_ONLY"}}
 ],knowledge:[]};
const browser=await chromium.launch({headless:true});
try{
 for(const width of [1440,390]){
  const context=await browser.newContext({viewport:{width,height:830}});
  await context.addInitScript(()=>{
   sessionStorage.setItem("fourplanet_os_session",JSON.stringify({
    token:"synthetic.test.mock.jwt",refreshToken:"",expiresAt:Date.now()+60*60*1000
   }));
  });
  const page=await context.newPage();const errors=[];
  page.on("pageerror",e=>errors.push(e.message));
  await page.route("**/os/api/brain",route=>route.fulfill({
   status:200,contentType:"application/json",body:JSON.stringify(sample)
  }));
  const response=await page.goto("https://labs.4planet.org/os",{waitUntil:"domcontentloaded",timeout:35000});
  if(response?.status()!==200)throw Error("OS_HOMEPAGE_NOT_200");
  await page.locator("#workspace:not(.os-hidden)").waitFor({timeout:20000});
  if(await page.locator("#login:not(.os-hidden)").count())throw Error("LOGIN_BLOCK_SHOWN_TO_VALID_FOUNDER_SESSION");
  const originalCss=await page.locator("#labs-shell").evaluate(node=>{
   const s=getComputedStyle(node);
   return [s.getPropertyValue("--accent-nature").trim(),s.getPropertyValue("--accent-ocean").trim(),
    s.getPropertyValue("--accent-culture").trim(),s.getPropertyValue("--accent-content").trim()];
  });
  if(originalCss.join("|")!=="#39ff78|#19baff|#c86bff|#ff6fbd")
   throw Error("ACTUAL_LABS_ACCENT_PALETTE_NOT_USED: "+originalCss.join("|"));
  const tiles=await page.locator("#core-projects .labs-project-box").count();
  if(tiles<5)throw Error("ORIGINAL_LABS_PROJECT_MAP_MISSING "+tiles);
  const colors=await page.locator("#core-projects .labs-project-box").evaluateAll(nodes=>
    [...new Set(nodes.map(n=>getComputedStyle(n).backgroundColor))]);
  if(colors.length<3)throw Error("ALL_PROJECT_CARDS_SAME_COLOR; original LABS palette lost");
  if((await page.locator("#count-homes").innerText()).trim()!=="1")throw Error("HYDRATED_PROJECT_COUNT");
  if((await page.locator("#count-wbs").innerText()).trim()!=="1")throw Error("HYDRATED_WBS_COUNT");
  if((await page.locator("body").innerText()).includes("QA_PROJECT_PRIVATE_DETAIL_ONLY_AFTER_CLICK"))
   throw Error("RAW_PRIVATE_SOURCE_RENDERED_ON_OVERVIEW");
  await page.locator('[data-view="homes"]').first().click();
  await page.locator("#homes-list .os-entry").first().click();
  await page.locator("#inspector-now").getByText("QA_PROJECT_PRIVATE_DETAIL_ONLY_AFTER_CLICK").waitFor({timeout:8000});
  if((await page.locator("#inspector a[href*='docs.google.com']").count())!==1)
   throw Error("ORIGINAL_PROVENANCE_LINK_MISSING");
  await page.locator("#close-inspector").click({force:true});
  await page.locator('[data-view="library"]').first().click();
  if((await page.locator("#library-list .os-entry").count())!==3)throw Error("SOURCE_INVENTORY_COUNT");
  await page.locator("#library-search").fill("Inventory Only");
  if((await page.locator("#library-list .os-entry").count())!==1)throw Error("SEARCH_RESULTS_INCORRECT");
  await page.locator("#white").click({force:true});
  if(await page.locator("#labs-shell").getAttribute("data-theme")!=="light")
   throw Error("ORIGINAL_LABS_WHITE_MODE_BROKEN");
  await page.locator("#dark").click({force:true});
  if(await page.locator("#labs-shell").getAttribute("data-theme")!=="dark")
   throw Error("ORIGINAL_LABS_DARK_MODE_BROKEN");
  if(errors.length)throw Error("BROWSER_JS_ERROR "+errors.slice(0,2).join(" | "));
  console.log("EXACT_LABS_STYLES_OS_QA PASS viewport="+width+" · multicolour original tiles · direct Founder landing · live source cards · inspector · WBS · library search · provenance · white/dark");
  await context.close();
 }
}finally{await browser.close()}
