import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { rankByIntent } from "../embla-products/core/relevance.ts";
import { compareHealth, healthEvidence } from "../embla-products/core/health.ts";
import { priceObservationForStore } from "../embla-products/core/store.ts";

const SUPABASE_URL=Deno.env.get("SUPABASE_URL")!;
const ANON=Deno.env.get("SUPABASE_ANON_KEY")!;
const allowed=new Set(["https://4sapien.com","https://four-sapien-embla-megasprint.odin-skogen.workers.dev"]);
function cors(req:Request){const o=req.headers.get("Origin")||"";return {"Access-Control-Allow-Origin":allowed.has(o)?o:"https://4sapien.com","Access-Control-Allow-Headers":"authorization, x-client-info, apikey, content-type","Access-Control-Allow-Methods":"POST, OPTIONS","Vary":"Origin"};}
function json(req:Request,body:unknown,status=200){return new Response(JSON.stringify(body),{status,headers:{...cors(req),"Content-Type":"application/json","Cache-Control":"no-store"}});}
const band=(x:any)=>x?.embla_relevance_band==="DIRECT"?2:x?.embla_relevance_band==="RELATED"?1:0;

Deno.serve(async(req:Request)=>{
  if(req.method==="OPTIONS")return new Response(null,{status:204,headers:cors(req)});
  if(req.method!=="POST")return json(req,{ok:false,state:"METHOD_NOT_ALLOWED"},405);
  const auth=req.headers.get("Authorization")||"";
  if(!auth.toLowerCase().startsWith("bearer "))return json(req,{ok:false,state:"AUTH_REQUIRED"},401);
  let body:any={};try{body=await req.json();}catch{return json(req,{ok:false,state:"BAD_REQUEST"},400);}
  const q=String(body?.q||"").trim();const store=String(body?.store||"").trim();const lens=String(body?.lens||"balanced");
  if(!q)return json(req,{ok:false,state:"BAD_REQUEST"},400);
  const upstream=await fetch(`${SUPABASE_URL}/functions/v1/embla-products`,{method:"POST",headers:{apikey:ANON,Authorization:auth,"Content-Type":"application/json"},body:JSON.stringify({q})});
  const data=await upstream.json().catch(()=>({ok:false,state:"SOURCE_DOWN",products:[]}));
  if(!upstream.ok||!data?.ok)return json(req,data,upstream.status);
  let products=rankByIntent(Array.isArray(data.products)?data.products:[],q).map((p:any)=>{const h=healthEvidence(p);const obs=store?priceObservationForStore(p,store):null;return {...p,embla_health_v1:{nutritionRank:h.nutritionRank,processingRank:h.processingRank,tieBreak:h.tieBreak,confidence:h.confidence,signals:h.signals},embla_store_match:!!obs,embla_store_observation:obs||null};});
  if(lens==="health")products.sort((a:any,b:any)=>band(b)-band(a)||compareHealth(a,b)||(b.embla_relevance-a.embla_relevance));
  else if(lens==="wallet"&&store)products.sort((a:any,b:any)=>Number(b.embla_store_match)-Number(a.embla_store_match)||(b.embla_relevance-a.embla_relevance));
  else products.sort((a:any,b:any)=>(b.embla_relevance-a.embla_relevance));
  return json(req,{...data,products,candidateVersion:"SEARCH_INTELLIGENCE_02_FOUNDATION",lens,selectedStore:store||null,truthNote:"Store match means observed provider/store data when available; never a stock claim."});
});
