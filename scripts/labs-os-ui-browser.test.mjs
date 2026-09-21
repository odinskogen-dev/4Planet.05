import {chromium} from "@playwright/test";
const sample={
 schemaVersion:1,authority:"4PLANET_BRAIN_READ_ONLY",source:"QA synthetic BRAIN",
 checkedAt:"2026-09-21T20:00:00Z",lastSourceUpdate:"2026-09-21T19:00:00Z",
 sourceCount:4,portfolioHydrated:true,lastSuccessfulAutomatedSync:"2026-09-21T19:00:00Z",
 syncStatus:"LAST_SUCCESSFUL_RUN",stale:false,runKey:"999-1",
 sourceRevision:"1234567890",lastError:null,
 projects:[
  {id:"synthetic-project",title:"QA Synthetic Project Home",objectType:"project_home",
   content:"QA_PROJECT_PRIVATE_DETAIL_ONLY_AFTER_CLICK",folder:"4PLANET/Project Homes",
   sourceModifiedAt:"2026-09-21T19:00:00Z",sourceHash:"qa_project_hash",
   metadata:{readDepth:"CONTENT"},uri:"https://docs.google.com/document/d/qa-synthetic-project/edit"},
  {id:"synthetic-wbs",title:"QA Synthetic WBS Workstream",objectType:"atomic_wbs",
   content:"1: QA_SCHEDULE_PRIVATE_DETAIL_ONLY_AFTER_CLICK",folder:"4PLANET/WBS",
   sourceModifiedAt:"2026-09-21T18:00:00Z",sourceHash:"qa_wbs_hash",
   metadata:{readDepth:"SHEET_ROWS"},uri:"https://docs.google.com/spreadsheets/d/qa-synthetic-sheet/edit"}
 ],
 sources:[
  {id:"synthetic-project",title:"QA Synthetic Project Home",objectType:"project_home",uri:"https://docs.google.com/document/d/qa-synthetic-project/edit",folder:"4PLANET/Project Homes",sourceModifiedAt:"2026-09-21T19:00:00Z",sourceHash:"qa_project_hash",metadata:{readDepth:"CONTENT"}},
  {id:"synthetic-uncopied",title:"QA Synthetic Inventory Only",objectType:"source_inventory",uri:"https://drive.google.com/file/d/qa-synthetic-inventory/view",folder:"4PLANET/Other",sourceModifiedAt:"2026-09-21T17:00:00Z",sourceHash:"qa_inventory",metadata:{readDepth:"INVENTORY_ONLY"}}
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
  await page.locator("#workspace:not(.hide)").waitFor({timeout:20000});
  if((await page.locator("#overview-homes .project").count())!==1)throw Error("PROJECT_HOMES_COUNT");
  if((await page.locator("#overview-wbs .project").count())!==1)throw Error("WBS_COUNT");
  if((await page.locator("body").innerText()).includes("QA_PROJECT_PRIVATE_DETAIL_ONLY_AFTER_CLICK"))
   throw Error("RAW_PRIVATE_DOCUMENT_RENDERED_IN_OVERVIEW");
  await page.locator("#overview-homes .project").first().click();
  await page.getByText("QA_PROJECT_PRIVATE_DETAIL_ONLY_AFTER_CLICK").first().waitFor({timeout:5000});
  if((await page.locator("#inspector a.source-link").count())!==1)throw Error("PROVENANCE_LINK_MISSING");
  await page.locator('[data-view="library"]').click();
  if((await page.locator("#library-list .project").count())!==3)throw Error("SOURCE_INVENTORY_COUNT");
  await page.locator("#library-search").fill("Inventory Only");
  if((await page.locator("#library-list .project").count())!==1)throw Error("SEARCH_RESULTS_INCORRECT");
  await page.locator("#theme").click();
  if(await page.locator("body").getAttribute("data-theme")!=="light")throw Error("WHITE_MODE_BROKEN");
  if(errors.length)throw Error("BROWSER_JS_ERROR "+errors.slice(0,2).join(" | "));
  console.log("LABS_OS_HUMAN_VIEW_QA PASS viewport="+width+" · overview bounded · homes/WBS/search/inspector/provenance/white-mode all PASS");
  await context.close();
 }
}finally{await browser.close()}
