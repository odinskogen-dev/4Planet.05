import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { BrregProviderError, fetchBrregExact } from "../_shared/brreg.ts";

/* 4SAPIEN BRREG 02 — authenticated read-only exact-org-number context adapter.
   Shared provider implementation is reused by 4BRANDS; no duplicate BRREG truth path. */
const BASE=Deno.env.get("SUPABASE_URL")||"";
const PUBLISHABLE=Deno.env.get("SUPABASE_ANON_KEY")||"";
const ORIGINS=new Set(["https://4sapien.com","https://www.4sapien.com"]);
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
    "Cache-Control":"no-store","Content-Type":"application/json"
  };
}
function response(req:Request,data:unknown,status=200){return new Response(JSON.stringify(data),{status,headers:cors(req)});}
function timeout(ms:number){return AbortSignal.timeout(ms)}
async function loggedIn(req:Request){
  const header=req.headers.get("Authorization")||"";
  if(!/^Bearer\s+\S+$/i.test(header)||!BASE||!PUBLISHABLE)return false;
  try{
    const r=await fetch(`${BASE}/auth/v1/user`,{headers:{apikey:PUBLISHABLE,Authorization:header},signal:timeout(5000)});
    if(!r.ok)return false;
    const d=await r.json().catch(()=>null);
    return !!d?.id;
  }catch{return false}
}
Deno.serve(async(req:Request)=>{
  if(req.method==="OPTIONS")return new Response(null,{status:204,headers:cors(req)});
  if(req.method!=="POST")return response(req,{ok:false,state:"METHOD_NOT_ALLOWED"},405);
  if(req.headers.get("Origin")&&!allowed(req.headers.get("Origin")||""))return response(req,{ok:false,state:"ORIGIN_NOT_ALLOWED"},403);
  if(!(await loggedIn(req)))return response(req,{ok:false,state:"UNAUTHENTICATED"},401);
  let input:any;
  try{input=await req.json()}catch{return response(req,{ok:false,state:"INVALID_JSON"},400)}
  const number=String(input?.organization_number||"").trim();
  try{
    const row=await fetchBrregExact(number,{signal:timeout(6500)});
    if(!row)return response(req,{ok:true,state:"NOT_FOUND",provider:"BRREG",organization_number:number});
    return response(req,{
      ok:true,state:"SOURCE_RECORD",provider:"BRREG",
      organization_number:row.organizationNumber,
      entity_name:row.entityName,
      organization_form:row.organizationForm,
      registered_date:row.registeredDate,
      deleted:row.deleted,bankrupt:row.bankrupt,liquidation:row.liquidation,
      source_url:row.sourceUrl,observed_at:row.observedAt,source_license:row.sourceLicense,
      match_rule:"EXACT_USER_SUPPLIED_ORGANIZATION_NUMBER_ONLY",
      truth:"SOURCE_RECORD_NOT_USER_CONFIRMED",
      no_automatic_creditor_match:true,no_financial_event_write:true
    });
  }catch(error){
    if(error instanceof BrregProviderError)return response(req,{ok:false,state:error.state,provider:"BRREG"},error.httpStatus>=400&&error.httpStatus<500?error.httpStatus:503);
    return response(req,{ok:false,state:"SOURCE_UNAVAILABLE",provider:"BRREG"},503);
  }
});
