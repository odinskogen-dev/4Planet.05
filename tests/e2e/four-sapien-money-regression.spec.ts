import {test,expect} from "@playwright/test";

const BASE=process.env.FOUR_SAPIEN_REVIEW_URL || process.env.BASE_URL;
const CACHE_BUST=process.env.FOUR_SAPIEN_REVIEW_CACHE_BUST || "";
if(!BASE) throw new Error("FOUR_SAPIEN_REVIEW_URL/BASE_URL required");

const stub=String.raw`
window.supabase={createClient:()=>({
 auth:{
  getSession:async()=>({data:{session:{user:{id:"synthetic-money-user",email:"fixture@example.invalid",user_metadata:{name:"Fixture"}}}},error:null}),
  getUser:async()=>({data:{user:{id:"synthetic-money-user",email:"fixture@example.invalid",user_metadata:{name:"Fixture"}}},error:null}),
  onAuthStateChange:()=>({data:{subscription:{unsubscribe(){}}}}),
  signOut:async()=>({error:null})
 },
 from(){
  const self={
   select(){return self},eq(){return self},is(){return self},in(){return self},order(){return self},limit(){return self},
   insert(){return self},update(){return self},delete(){return self},upsert(){return self},
   single(){return Promise.resolve({data:null,error:null})},
   maybeSingle(){return Promise.resolve({data:null,error:null})},
   then(resolve,reject){return Promise.resolve({data:[],error:null}).then(resolve,reject)}
  };return self;
 },
 rpc:async(name)=>{
  if(name==="four_sapien_finance_twin")return {data:{state:"AVAILABLE",year:new Date().getFullYear(),accounts:[],liquidity:{state:"UNKNOWN",amount:null,truth:"UNKNOWN"},net_worth:{state:"UNKNOWN",amount:null},monthly_recurring_expense_equivalent:{amount:0},data_quality:{category_review_count:0,unknown_account_balance_count:0},timeline:{months:Array.from({length:12},(_,i)=>({month:i+1,period_state:"KNOWN",actual:{income:0,expense:0},forecast:{income:0,expense:0},scheduled_unconfirmed:{income:0,expense:0}}))}},error:null};
  if(name==="four_sapien_finance_control_read")return {data:{state:"AVAILABLE",as_of:new Date().toISOString().slice(0,10),money_now:{state:"UNKNOWN",amount:null,unknown_balance_count:1},next_income_date:null,before_next_income:{state:"UNKNOWN",projected_without_income:null},overdue_unconfirmed:[]},error:null};
  return {data:null,error:null};
 },
 functions:{invoke:async()=>({data:null,error:null})},
 storage:{from(){return {createSignedUrl:async()=>({data:null,error:null})}}}
})};
`;

function moneyUrl(){
 const suffix=CACHE_BUST?`?qa_release=${encodeURIComponent(CACHE_BUST)}`:"";
 return BASE!.replace(/\/$/,"")+"/app/money/"+suffix;
}

test.beforeEach(async({page})=>{
 const fulfill=async(route:any)=>route.fulfill({status:200,contentType:"application/javascript",body:stub});
 await page.route("**/supabase.min.js",fulfill);
 await page.route("**/npm/@supabase/supabase-js@2*",fulfill);
});

test("Money keeps all proven Finance guards and a usable navigation",async({page})=>{
 await page.goto(moneyUrl(),{waitUntil:"domcontentloaded"});
 await expect(page.locator("body")).toHaveClass(/w-money/);
 const html=await page.content();
 for(const marker of [
  "FOUR_SAPIEN_DANIEL_FINANCE_FIX_01",
  "FOUR_SAPIEN_FINANCE_TRUTH_MATH_V1",
  "FOUR_SAPIEN_FINANCE_SYNC_B1C",
  "FOUR_SAPIEN_MONEY_NOW_V1",
  "FOUR_SAPIEN_FINANCE_TWIN_RUNTIME_V1_1",
  "four-sapien-finance-record-changed"
 ]) expect(html).toContain(marker);

 await expect(page.locator("#fsMoneyNow")).toBeVisible();
 await expect(page.locator("#fsMoneyNow")).toContainText("Penger nå");

 const worldNav=page.locator("#fsWorlds");
 await expect(worldNav).toBeVisible();
 for(const label of ["I dag","Mat","Penger","Brain","Meg"])await expect(worldNav.getByText(label,{exact:true})).toBeVisible();
 await expect(worldNav.locator('a[aria-current="page"]')).toContainText("Penger");
 await expect(page.locator("#fs-global-appnav")).toBeHidden();

 const width=page.viewportSize()?.width||1440;
 if(width<900){
   const productNav=page.locator("body.w-money #root nav").first();
   await expect(productNav).toBeVisible();
   const box=await productNav.boundingBox();
   expect(box).not.toBeNull();
   expect(box!.y).toBeLessThan(80);
 }
});

test("Money remains readable in light and dark modes",async({page})=>{
 await page.goto(moneyUrl(),{waitUntil:"domcontentloaded"});
 for(const mode of ["light","dark"] as const){
  await page.evaluate(m=>(window as any).FourSapienTheme.set(m),mode);
  await expect(page.locator("html")).toHaveAttribute("data-theme",mode);
  const result=await page.evaluate(()=>{
   function rgba(s:string){
    const m=s.match(/rgba?\(([^)]+)\)/);if(!m)return null;
    const p=m[1].split(",").map(x=>Number(x.trim()));
    return {r:p[0],g:p[1],b:p[2],a:p.length>3?p[3]:1};
   }
   const dark=document.documentElement.getAttribute("data-theme")==="dark";
   function bg(el:Element|null):any{
    while(el){const c=rgba(getComputedStyle(el).backgroundColor);if(c&&c.a>0.05)return c;el=el.parentElement}
    return dark?{r:0,g:0,b:0,a:1}:{r:255,g:255,b:255,a:1};
   }
   function lum(c:any){const f=(v:number)=>{v/=255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4)};return .2126*f(c.r)+.7152*f(c.g)+.0722*f(c.b)}
   function ratio(a:any,b:any){const x=lum(a),y=lum(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05)}
   const selectors=[".fs-money-main h1","#axeFin .bar","#axeFin .lab","#fsMoneyNow .mnTitle","#fsMoneyNow .mnVal","body.w-money #root nav button"];
   const checks:any[]=[];
   for(const sel of selectors){
    for(const el of Array.from(document.querySelectorAll(sel)) as HTMLElement[]){
      const visible=!!(el.offsetWidth||el.offsetHeight||el.getClientRects().length);if(!visible)continue;
      const cs=getComputedStyle(el),fg=rgba(cs.color),back=bg(el);
      checks.push({sel,alpha:fg?.a??0,ratio:fg?ratio(fg,back):0});
      break;
    }
   }
   return checks;
  });
  expect(result.length).toBeGreaterThanOrEqual(3);
  for(const x of result){expect(x.alpha,`${mode} ${x.sel} transparent`).toBeGreaterThan(.5);expect(x.ratio,`${mode} ${x.sel} low contrast`).toBeGreaterThan(2);}
 }
});
