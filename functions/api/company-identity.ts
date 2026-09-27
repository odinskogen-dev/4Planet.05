import { BrregProviderError, fetchBrregExact, searchBrregByName, type BrregCompanyRecord } from "../../products/4sapien/supabase/functions/_shared/brreg";

interface PagesContext { request:Request; }
interface GleifCandidate {
  lei:string;
  legalName:string;
  registeredAs:string|null;
  jurisdiction:string|null;
  registrationStatus:string|null;
  sourceUrl:string;
}

const GLEIF_API="https://api.gleif.org/api/v1/lei-records";
const json=(body:unknown,status=200)=>new Response(JSON.stringify(body),{status,headers:{"content-type":"application/json; charset=utf-8","cache-control":"no-store","x-content-type-options":"nosniff"}});
const clean=(value:unknown,max=240)=>typeof value==="string"?value.replace(/\s+/g," ").trim().slice(0,max):"";

function normalizeGleif(row:any):GleifCandidate|null{
  const lei=clean(row?.id,40);
  const legalName=clean(row?.attributes?.entity?.legalName?.name,240);
  if(!/^[A-Z0-9]{20}$/.test(lei)||!legalName)return null;
  return {
    lei,legalName,
    registeredAs:clean(row?.attributes?.entity?.registeredAs,80)||null,
    jurisdiction:clean(row?.attributes?.entity?.jurisdiction,80)||null,
    registrationStatus:clean(row?.attributes?.registration?.status,60)||null,
    sourceUrl:`https://www.gleif.org/lei/${lei}`,
  };
}

async function gleifFor(entity:BrregCompanyRecord){
  const url=new URL(GLEIF_API);
  url.searchParams.set("filter[entity.legalName]",entity.entityName);
  url.searchParams.set("page[size]","8");
  let response:Response;
  try{response=await fetch(url,{headers:{accept:"application/vnd.api+json"}});}
  catch{return {state:"SOURCE_UNAVAILABLE",candidates:[] as GleifCandidate[],verified:null as GleifCandidate|null};}
  if(!response.ok)return {state:response.status===429?"RATE_LIMITED":"SOURCE_HTTP_ERROR",candidates:[] as GleifCandidate[],verified:null as GleifCandidate|null};
  const payload=await response.json().catch(()=>null) as any;
  const candidates=(Array.isArray(payload?.data)?payload.data:[]).map(normalizeGleif).filter((x:GleifCandidate|null):x is GleifCandidate=>x!==null);
  const exact=candidates.filter((x)=>x.registeredAs===entity.organizationNumber);
  return {
    state:exact.length===1?"EXACT_REGISTRATION_ID":candidates.length?"CANDIDATES_REVIEW_REQUIRED":"NO_MATCH",
    candidates,
    verified:exact.length===1?exact[0]:null,
  };
}

export const onRequestGet=async({request}:PagesContext):Promise<Response>=>{
  const url=new URL(request.url);
  const q=clean(url.searchParams.get("q"),120);
  const orgnr=clean(url.searchParams.get("orgnr"),20);
  try{
    if(orgnr){
      const entity=await fetchBrregExact(orgnr,{signal:AbortSignal.timeout(6500)});
      if(!entity)return json({ok:true,state:"NOT_FOUND",entity:null});
      const gleif=await gleifFor(entity);
      return json({
        ok:true,state:"EXACT_BRREG_IDENTITY",entity,gleif,
        sources:{
          brreg:{publisher:"Brønnøysundregistrene",license:"NLOD 2.0",exactDataset:entity.sourceUrl,joinRule:"EXACT_ORGANIZATION_NUMBER"},
          gleif:{publisher:"GLEIF",license:"CC0",api:GLEIF_API,joinRule:gleif.verified?"EXACT_REGISTERED_AS_EQUALS_BRREG_ORGNR":"NO_AUTOMATIC_JOIN"},
        },
        truthBoundary:"Company-name search is discovery. Only exact BRREG organisation number is canonical Norwegian legal identity. LEI is accepted automatically only when GLEIF registeredAs exactly equals the BRREG organisation number.",
      });
    }
    if(q){
      const candidates=await searchBrregByName(q,{signal:AbortSignal.timeout(6500),limit:8});
      return json({
        ok:true,state:candidates.length?"CANDIDATES":"NO_MATCH",query:q,candidates,
        source:{publisher:"Brønnøysundregistrene",license:"NLOD 2.0",api:"https://data.brreg.no/enhetsregisteret/api/enheter",matchRule:"NAME_DISCOVERY_REQUIRES_USER_SELECTION"},
      });
    }
    return json({ok:false,error:"QUERY_OR_ORGNR_REQUIRED"},400);
  }catch(error){
    if(error instanceof BrregProviderError)return json({ok:false,error:error.state,detail:error.message},error.httpStatus>=400&&error.httpStatus<500?error.httpStatus:503);
    return json({ok:false,error:"IDENTITY_SOURCE_UNAVAILABLE"},503);
  }
};

export const onRequest=async(ctx:PagesContext)=>ctx.request.method==="GET"?onRequestGet(ctx):json({ok:false,error:"METHOD_NOT_ALLOWED"},405);
