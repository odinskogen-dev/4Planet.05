import "jsr:@supabase/functions-js/edge-runtime.d.ts";

/* 4SAPIEN BRREG 01 — read-only exact-org-number context adapter.
   NLOD public company identity, not account truth, bank truth or a creditor match.
   No provider credentials, persistence, user text search or financial writes. */
const BASE = Deno.env.get("SUPABASE_URL") || "";
const PUBLISHABLE = Deno.env.get("SUPABASE_ANON_KEY") || "";
const ORIGINS = new Set(["https://4sapien.com","https://www.4sapien.com"]);
function allowed(origin:string){
 if(ORIGINS.has(origin))return true;
 try{const u=new URL(origin);return u.protocol==="https:"&&/^four-sapien-embla(-[a-z0-9-]+)?\.[a-z0-9-]+\.workers\.dev$/i.test(u.hostname)}catch{return false}
}
function cors(req:Request){
 const origin=req.headers.get("Origin")||"";
 return {
  "Access-Control-Allow-Origin":allowed(origin)?origin:"https://4sapien.com",
  "Access-Control-Allow-Headers":"authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods":"POST, OPTIONS","Vary":"Origin",
  "Cache-Control":"no-store",
  "Content-Type":"application/json"
 };
}
function response(req:Request,data:unknown,status=200){
 return new Response(JSON.stringify(data),{status,headers:cors(req)});
}
function timeout(ms:number){return AbortSignal.timeout(ms)}
async function loggedIn(req:Request){
 const header=req.headers.get("Authorization")||"";
 if(!/^Bearer\s+\S+$/i.test(header))return false;
 if(!BASE||!PUBLISHABLE)return false;
 try{
  const r=await fetch(`${BASE}/auth/v1/user`,{
   headers:{apikey:PUBLISHABLE,Authorization:header},signal:timeout(5000)
  });
  if(!r.ok)return false;
  const d=await r.json().catch(()=>null);
  return !!d?.id;
 }catch{return false}
}
Deno.serve(async(req:Request)=>{
 if(req.method==="OPTIONS")
  return response(req,{state:"OPTIONS"},204);
 if(req.method!=="POST")return response(req,{ok:false,state:"METHOD_NOT_ALLOWED"},405);
 if(req.headers.get("Origin")&&!allowed(req.headers.get("Origin")||""))
  return response(req,{ok:false,state:"ORIGIN_NOT_ALLOWED"},403);
 if(!(await loggedIn(req)))
  return response(req,{ok:false,state:"UNAUTHENTICATED"},401);
 let input:any;
 try{input=await req.json()}catch{return response(req,{ok:false,state:"INVALID_JSON"},400)}
 const number=String(input?.organization_number||"").trim();
 if(!/^\d{9}$/.test(number))
  return response(req,{ok:false,state:"VALID_NINE_DIGIT_ORGANIZATION_NUMBER_REQUIRED"},400);
 const url=`https://data.brreg.no/enhetsregisteret/api/enheter/${number}`;
 let r:Response;
 try{
  r=await fetch(url,{headers:{
   Accept:"application/vnd.brreg.enhetsregisteret.enhet.v2+json",
   "User-Agent":"4SAPIEN/1.0 (https://4sapien.com; 4PLANET)"
  },signal:timeout(6500)})
 }catch(e:any){
  return response(req,{ok:false,state:["AbortError","TimeoutError"].includes(String(e?.name))?"SOURCE_TIMEOUT":"SOURCE_UNAVAILABLE",
   provider:"BRREG",source_url:url},503);
 }
 if(r.status===404)return response(req,{ok:true,state:"NOT_FOUND",provider:"BRREG",source_url:url});
 if(r.status===410)return response(req,{ok:true,state:"SOURCE_REMOVED",provider:"BRREG",source_url:url});
 if(r.status===429)return response(req,{ok:false,state:"RATE_LIMITED",provider:"BRREG"},503);
 if(!r.ok)return response(req,{ok:false,state:"SOURCE_HTTP_ERROR",http_status:r.status,provider:"BRREG"},503);
 let row:any;
 try{row=await r.json()}catch{return response(req,{ok:false,state:"SOURCE_PARSE_FAILED",provider:"BRREG"},503)}
 if(String(row?.organisasjonsnummer||"")!==number)
   return response(req,{ok:false,state:"SOURCE_IDENTITY_MISMATCH",provider:"BRREG"},503);
 const observed_at=new Date().toISOString();
 return response(req,{
  ok:true,state:"SOURCE_RECORD",provider:"BRREG",
  organization_number:number,
  entity_name:String(row.navn||"").slice(0,240)||null,
  organization_form:row.organisasjonsform?.kode||null,
  registered_date:row.registreringsdatoEnhetsregisteret||null,
  deleted:row.erSlettet===true,
  bankrupt:row.konkurs===true,
  liquidation:row.underAvvikling===true,
  source_url:url,observed_at,source_license:"NLOD 2.0",
  match_rule:"EXACT_USER_SUPPLIED_ORGANIZATION_NUMBER_ONLY",
  truth:"SOURCE_RECORD_NOT_USER_CONFIRMED",
  no_automatic_creditor_match:true,no_financial_event_write:true
 });
});
