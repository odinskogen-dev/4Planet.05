import {test,expect} from "@playwright/test";
const BASE=process.env.FOOD_REVIEW_URL || process.env.BASE_URL;
if(!BASE) throw new Error("FOOD_REVIEW_URL/BASE_URL required; no inferred LIVE domain");
const stub=String.raw`
window.supabase={createClient:()=>({
 auth:{
  getSession:async()=>({data:{session:{user:{id:sessionStorage.getItem("qaUser")||"synthetic-user-a",email:"fixture@example.invalid",user_metadata:{name:"Fixture"}}}}}),
  onAuthStateChange:()=>({sub:{subscription:{unsubscribe(){}}},data:{subscription:{unsubscribe(){}}}}),
  signOut:async()=>({error:null})
 },
 from(table){
  const q={table,filters:[],op:"select",mode:"all",row:null};
  const self={
   select(){return self;},
   eq(k,v){q.filters.push(["eq",k,v]);return self;},
   is(k,v){q.filters.push(["is",k,v]);return self;},
   contains(k,v){q.filters.push(["contains",k,v]);return self;},
   order(k,o){q.order=[k,Boolean(o?.ascending)];return self;},
   limit(n){q.limit=n;return self;},
   insert(v){q.op="insert";q.row=v;return self;},
   update(v){q.op="update";q.row=v;return self;},
   delete(){q.op="delete";return self;},
   upsert(v){q.op="upsert";q.row=v;return self;},
   maybeSingle(){return window.__syntheticBackend({...q,mode:"maybeSingle"});},
   single(){return window.__syntheticBackend({...q,mode:"single"});},
   then(resolve,reject){return window.__syntheticBackend(q).then(resolve,reject)}
  };
  return self;
 },
 functions:{invoke:async(name,options={})=>window.__syntheticFunction(name,options?.body||{})},
 storage:{from(){return {createSignedUrl:async()=>({data:null,error:null})}}}
})};
`;
test("synthetic first/return UI through existing Food Auth client and mock BACKEND ONLY",async({page})=>{
 test.setTimeout(150000);
 const memory:any[]=[];
 const events:any[]=[];
 const decisions:any[]=[];
 const measurements:any[]=[];
 let next=1;
 await page.exposeFunction("__syntheticFunction",async(name:string,body:any)=>{
  measurements.push({name,body});
  if(name==="embla-core-preview"&&body?.measurement_event==="useful_outcome"){
   return {data:{ok:true,state:"MEASUREMENT_RECORDED",measurement_event:"useful_outcome"},error:null};
  }
  return {data:null,error:{message:"UNEXPECTED_SYNTHETIC_FUNCTION"}};
 });
 await page.exposeFunction("__syntheticBackend",async(q:any)=>{
  const user=(q.filters||[]).find((f:any)=>f[1]==="user_id")?.[2]||"synthetic-user-a";
  if(q.table==="four_sapien_profiles")return {data:{user_id:user,diet:"none",store:"KIWI",avoid:[],budget:""},error:null};
  if(q.table==="four_sapien_meal_plans")return {data:null,error:null};
  if(q.table==="four_sapien_list_items"||q.table==="four_sapien_shops")return {data:[],error:null};
  if(q.table==="four_sapien_embla_events"){
   if(q.op==="insert"){const x={...q.row,id:"event-"+next++};events.push(x);return {data:q.mode==="single"?x:[x],error:null};}
   return {data:[],error:null};
  }
  if(q.table==="four_sapien_decisions"){
   if(q.op==="insert"){const x={...q.row,id:"decision-"+next++};decisions.push(x);return {data:q.mode==="single"?x:[x],error:null};}
   return {data:[],error:null};
  }
  if(q.table!=="four_sapien_embla_memories")return {data:[],error:null};
  const matching=()=>{
   let rows=memory.filter(x=>x.user_id===user);
   for(const [op,k,v] of q.filters||[])rows=rows.filter(x=>op==="contains"?Object.entries(v).every(([j,w])=>x[k]?.[j]===w):op==="is"?x[k]==v:x[k]===v);
   if(q.order)rows.sort((a,b)=>String(b[q.order[0]]).localeCompare(String(a[q.order[0]]))*(q.order[1]?-1:1));
   return q.limit?rows.slice(0,q.limit):rows;
  };
  if(q.op==="insert"){const x={...q.row,id:"fake-"+next++,created_at:new Date().toISOString()};memory.push(x);return {data:x,error:null};}
  if(q.op==="update"){const rows=matching();rows.forEach(x=>Object.assign(x,q.row));return {data:rows,error:null};}
  if(q.op==="delete"){const rows=matching();for(const row of rows)memory.splice(memory.indexOf(row),1);return {data:rows,error:null};}
  const rows=matching();
  return {data:q.mode==="single"||q.mode==="maybeSingle"?rows[0]||null:rows,error:null};
 });
 await page.route("**/supabase.min.js",async route=>route.fulfill({status:200,contentType:"application/javascript",body:stub}));
 page.on("pageerror",e=>console.log("SYNTHETIC_PAGE_ERROR",String(e.message).slice(0,350)));
 page.on("console",m=>{if(m.type()==="error")console.log("SYNTHETIC_BROWSER_CONSOLE",m.text().slice(0,350));});
 await page.goto(BASE.replace(/\/$/,"")+"/app/food/",{waitUntil:"domcontentloaded"});
 console.log("SYNTHETIC_BODY_FIRST", (await page.locator("body").innerText()).slice(0,1250));
 console.log("SYNTHETIC_RUNTIME_STATE",await page.evaluate(()=>({sb:typeof window.supabase,matcher:typeof (window as any).FourSapienPantryDecision,body:document.body.children.length})));
 console.log("SYNTHETIC_SCRIPTS",await page.evaluate(()=>Array.from(document.scripts).map(x=>({src:x.src,typ:x.type,inline:x.textContent?.length})).slice(-16)));
 console.log("SYNTHETIC_ROOT",await page.evaluate(()=>Array.from(document.body.children).map(x=>({tag:x.tagName,id:x.id,html:x.outerHTML.slice(0,150)}))));
 await page.waitForTimeout(2300);
 console.log("SYNTHETIC_BODY_AFTER_WAIT",(await page.locator("body").innerText()).slice(0,1400));
 await expect(page.getByText("Middag",{exact:true}).first()).toBeVisible({timeout:15000});
 await page.getByText("Middag",{exact:true}).first().click();
 const pantry=page.getByRole("region",{name:"Min mat — privat beholdning"});
 await expect(pantry).toBeVisible();
 await expect(pantry.getByText(/Legg inn ingredienser/)).toBeVisible();
 await pantry.getByLabel("Ny ingrediens").fill("Havregryn");
 await pantry.getByLabel("Ny mengde").fill("100");
 await pantry.getByRole("button",{name:"Legg til"}).click();
 await expect(pantry.getByLabel("Ingrediens 1")).toHaveValue("Havregryn");
 await pantry.getByRole("button",{name:/Bekreft og lagre/}).click();
 await expect(pantry.getByText("Lagring: SAVED",{exact:false})).toBeVisible();
 await pantry.getByRole("button",{name:"Bruk dette alternativet"}).first().click();
 await expect(pantry.getByText(/Valget er lagret privat/)).toBeVisible();
 await pantry.getByRole("button",{name:"Ja",exact:true}).click();
 await expect(pantry.getByText(/Nyttesignal registrert via eksisterende Human Utility-måling/)).toBeVisible();
 expect(decisions.length).toBeGreaterThan(0);
 expect(decisions.at(-1)?.provenance?.evidence_class).toBe("USER_DECISION");
 expect(measurements.some(x=>x.name==="embla-core-preview"&&x.body?.measurement_event==="useful_outcome"&&x.body?.measurement_value==="yes")).toBeTruthy();
 expect(events.some(x=>x.event_type==="food_context_saved")).toBeTruthy();
 await page.reload({waitUntil:"domcontentloaded"});
 await page.getByText("Middag",{exact:true}).first().click();
 await expect(pantry.getByText(/Tilbake: 1 tidligere bekreftede ingredienser/)).toBeVisible();
 await expect(pantry.getByLabel("Ingrediens 1")).toHaveValue("Havregryn");
 await expect.poll(()=>events.some(x=>x.event_type==="food_context_returned")).toBeTruthy();
 await expect.poll(()=>events.some(x=>x.event_type==="food_second_value_reached")).toBeTruthy();
 await pantry.getByLabel("Mengde 1").fill("200");
 await pantry.getByRole("button",{name:/Bekreft og lagre/}).click();
 await expect(pantry.getByText("Lagring: SAVED",{exact:false})).toBeVisible();
 await page.evaluate(()=>sessionStorage.setItem("qaUser","synthetic-user-b"));
 await page.reload({waitUntil:"domcontentloaded"});
 await page.getByText("Middag",{exact:true}).first().click();
 await expect(pantry.getByText(/Legg inn ingredienser/)).toBeVisible();
 await page.evaluate(()=>sessionStorage.setItem("qaUser","synthetic-user-a"));
 await page.reload({waitUntil:"domcontentloaded"});
 await page.getByText("Middag",{exact:true}).first().click();
 await expect(pantry.getByLabel("Mengde 1")).toHaveValue("200");
 await pantry.getByRole("button",{name:/Fjern min lagrede beholdning/}).click();
 await expect(pantry.getByText(/Lagring: REMOVED/)).toBeVisible();
 await page.reload({waitUntil:"domcontentloaded"});
 await page.getByText("Middag",{exact:true}).first().click();
 await expect(pantry.getByText(/Legg inn ingredienser/)).toBeVisible();
 expect(events.every(x=>!JSON.stringify(x.payload||{}).match(/Havregryn|pantry|prompt/i))).toBeTruthy();
 // CI's in-memory mock is not a real Supabase authenticated session or RLS E2E.
});
