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
 storage:{from(){return {createSignedUrl:async()=>({data:null,error:null})}}}
})};
`;
test("synthetic first/return UI through existing Food Auth client and mock BACKEND ONLY",async({page})=>{
 test.setTimeout(150000);
 const memory:any[]=[];
 let next=1;
 await page.exposeFunction("__syntheticBackend",async(q:any)=>{
  const user=(q.filters||[]).find((f:any)=>f[1]==="user_id")?.[2]||"synthetic-user-a";
  if(q.table==="four_sapien_profiles")return {data:{user_id:user,diet:"none",store:"KIWI",avoid:[],budget:""},error:null};
  if(q.table==="four_sapien_meal_plans")return {data:null,error:null};
  if(q.table==="four_sapien_list_items"||q.table==="four_sapien_shops")return {data:[],error:null};
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
 await page.goto(BASE.replace(/\/$/,"")+"/app/food/",{waitUntil:"domcontentloaded"});
 await expect(page.getByText("Middager",{exact:true}).first()).toBeVisible({timeout:55000});
 await page.getByText("Middager",{exact:true}).first().click();
 const pantry=page.getByRole("region",{name:"Min mat — privat beholdning"});
 await expect(pantry).toBeVisible();
 await expect(pantry.getByText(/Legg inn ingredienser/)).toBeVisible();
 await pantry.getByLabel("Ny ingrediens").fill("Havregryn");
 await pantry.getByLabel("Ny mengde").fill("100");
 await pantry.getByRole("button",{name:"Legg til"}).click();
 await expect(pantry.getByLabel("Ingrediens 1")).toHaveValue("Havregryn");
 await pantry.getByRole("button",{name:/Bekreft og lagre/}).click();
 await expect(pantry.getByText("Lagring: SAVED",{exact:false})).toBeVisible();
 await page.reload({waitUntil:"domcontentloaded"});
 await page.getByText("Middager",{exact:true}).first().click();
 await expect(pantry.getByText(/Tilbake: 1 tidligere bekreftede ingredienser/)).toBeVisible();
 await expect(pantry.getByLabel("Ingrediens 1")).toHaveValue("Havregryn");
 await pantry.getByLabel("Mengde 1").fill("200");
 await pantry.getByRole("button",{name:/Bekreft og lagre/}).click();
 await expect(pantry.getByText("Lagring: SAVED",{exact:false})).toBeVisible();
 await page.evaluate(()=>sessionStorage.setItem("qaUser","synthetic-user-b"));
 await page.reload({waitUntil:"domcontentloaded"});
 await page.getByText("Middager",{exact:true}).first().click();
 await expect(pantry.getByText(/Legg inn ingredienser/)).toBeVisible();
 await page.evaluate(()=>sessionStorage.setItem("qaUser","synthetic-user-a"));
 await page.reload({waitUntil:"domcontentloaded"});
 await page.getByText("Middager",{exact:true}).first().click();
 await expect(pantry.getByLabel("Mengde 1")).toHaveValue("200");
 await pantry.getByRole("button",{name:/Fjern min lagrede beholdning/}).click();
 await expect(pantry.getByText(/Lagring: REMOVED/)).toBeVisible();
 await page.reload({waitUntil:"domcontentloaded"});
 await page.getByText("Middager",{exact:true}).first().click();
 await expect(pantry.getByText(/Legg inn ingredienser/)).toBeVisible();
 // CI's in-memory mock is not a real Supabase authenticated session or RLS E2E.
});
