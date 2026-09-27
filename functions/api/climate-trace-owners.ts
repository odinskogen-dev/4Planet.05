/**
 * GET /api/climate-trace-owners?name={owner}
 *
 * Climate TRACE v7 owner discovery. Discovery only: a name result is never
 * joined automatically to a BRREG/GLEIF company identity.
 */

interface PagesContext { request: Request; }
const BASE="https://api.climatetrace.org/v7";
const json=(body:unknown,status=200)=>new Response(JSON.stringify(body),{status,headers:{"content-type":"application/json; charset=utf-8","cache-control":"public, max-age=3600","x-content-type-options":"nosniff"}});
const clean=(value:unknown,max=240)=>typeof value==="string"?value.replace(/\s+/g," ").trim().slice(0,max):"";
const idOf=(row:any)=>clean(row?.id??row?.ownerId??row?.owner_id??row?.entityId??row?.entity_id,120);
const nameOf=(row:any)=>clean(row?.name??row?.ownerName??row?.owner_name??row?.companyName??row?.company_name??row?.entityName??row?.entity_name??row?.fullName??row?.full_name,240);

export function normalizeClimateTraceOwner(row:any){
  const id=idOf(row),name=nameOf(row);
  if(!id||!name)return null;
  return {
    id,name,
    country:clean(row?.country??row?.registrationCountry??row?.registration_country??row?.headquarterCountry??row?.headquarter_country,120)||null,
    type:clean(row?.type??row?.entityType??row?.entity_type,100)||null,
    source:"Climate TRACE v7 owner index",
    sourceUrl:`${BASE}/owners?name=${encodeURIComponent(name)}`,
  };
}

export const onRequestGet=async({request}:PagesContext):Promise<Response>=>{
  const url=new URL(request.url);
  const name=clean(url.searchParams.get("name"),120);
  if(name.length<2)return json({ok:false,error:"OWNER_NAME_REQUIRED"},400);
  const upstream=new URL(`${BASE}/owners`);
  upstream.searchParams.set("name",name);
  upstream.searchParams.set("limit","12");
  try{
    const response=await fetch(upstream,{headers:{accept:"application/json"},cf:{cacheTtl:3600} as RequestInit["cf"]});
    if(!response.ok)return json({ok:false,error:`UPSTREAM_${response.status}`},502);
    const payload=await response.json() as any;
    const rows=Array.isArray(payload)?payload:Array.isArray(payload?.owners)?payload.owners:Array.isArray(payload?.data)?payload.data:Array.isArray(payload?.results)?payload.results:[];
    const candidates=rows.map(normalizeClimateTraceOwner).filter(Boolean);
    return json({
      ok:true,state:candidates.length?"CANDIDATES_REVIEW_REQUIRED":"NO_MATCH",query:name,candidates,
      source:{publisher:"Climate TRACE",apiVersion:"v7 beta",endpoint:"/owners",checkedAt:new Date().toISOString(),license:"MIXED_UPSTREAM_OWNERSHIP_SOURCES_REVIEW_REQUIRED",commercialReuse:"REVIEW_UPSTREAM_OWNERSHIP_SOURCE_TERMS_BEFORE_PERSISTENCE_OR_REDISTRIBUTION",attribution:"Climate TRACE owner index plus underlying ownership sources where applicable",cachePolicy:"4PLANET edge cache 1 hour; discovery results are not canonical company truth",accessCost:"FREE_PUBLIC_API_BETA",rateLimit:"NOT_GUARANTEED; KEEP_VOLUME_LOW"},
      truthBoundary:"Owner-name search is discovery only. A 4PLANET company→Climate TRACE owner relationship requires explicit user review or an independently verified identifier crosswalk.",
    });
  }catch(error){
    return json({ok:false,error:"SOURCE_UNAVAILABLE",detail:error instanceof Error?error.message:"Climate TRACE owner search unavailable"},503);
  }
};
export const onRequest=async(ctx:PagesContext)=>ctx.request.method==="GET"?onRequestGet(ctx):json({ok:false,error:"METHOD_NOT_ALLOWED"},405);
