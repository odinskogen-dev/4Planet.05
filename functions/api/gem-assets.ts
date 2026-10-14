/**
 * GET /api/gem-assets?country=Norway&q=&operating_status=&asset_type=&limit=200&offset=0
 *
 * Bounded read-through proxy to Global Energy Monitor's Ownership Tracing API.
 * This endpoint exposes infrastructure records as source-grounded map context.
 * It does not infer legal responsibility, environmental effect, current
 * production, emissions or ownership beyond fields GEM actually returns.
 */
interface PagesContext { request: Request; }

const BASE="https://api.globalenergymonitor.org";
const MAX=300;
const clean=(v:unknown,max=180)=>typeof v==="string"?v.replace(/[\u0000-\u001f\u007f]/g," ").replace(/\s+/g," ").trim().slice(0,max):"";
const finite=(...xs:unknown[])=>{for(const x of xs){const n=Number(x);if(Number.isFinite(n))return n;}return null;};
const json=(body:unknown,status=200)=>new Response(JSON.stringify(body),{status,headers:{
  "content-type":"application/json; charset=utf-8",
  "cache-control":"public, max-age=1800",
  "x-content-type-options":"nosniff",
  "access-control-allow-origin":"*",
}});
const rowsOf=(x:any)=>Array.isArray(x)?x:Array.isArray(x?.items)?x.items:Array.isArray(x?.results)?x.results:Array.isArray(x?.data)?x.data:[];

export function normalizeGemAsset(a:any){
  const id=clean(a?.asset_id??a?.id??a?.gem_id,120);
  const name=clean(a?.asset_name??a?.name??a?.project_name,260);
  if(!id||!name)return null;
  const lat=finite(a?.latitude,a?.lat,a?.location?.latitude,a?.location?.lat,a?.coordinates?.[1]);
  const lon=finite(a?.longitude,a?.lon,a?.lng,a?.location?.longitude,a?.location?.lon,a?.coordinates?.[0]);
  const directOwnerName=clean(
    a?.owner_name??a?.direct_owner_name??a?.owner?.entity_name??a?.owner?.name??
    (Array.isArray(a?.owners)?a.owners[0]?.entity_name??a.owners[0]?.name:""),
    260
  )||null;
  const directOwnerId=clean(
    a?.owner_entity_id??a?.direct_owner_entity_id??a?.owner?.entity_id??
    (Array.isArray(a?.owners)?a.owners[0]?.entity_id:""),
    120
  )||null;
  return {
    id,name,
    assetType:clean(a?.asset_type??a?.tracker??a?.type,120)||null,
    operatingStatus:clean(a?.operating_status??a?.status,120)||null,
    country:clean(a?.country,120)||null,
    stateProvince:clean(a?.state_province??a?.stateProvince,120)||null,
    capacity:finite(a?.capacity,a?.capacity_mw,a?.capacity_value),
    capacityUnit:clean(a?.capacity_unit??a?.unit,40)||null,
    lat,lon,
    directOwnerId,directOwnerName,
    sourceUrl:`https://api.globalenergymonitor.org/assets/${encodeURIComponent(id)}`,
    ownershipEndpoint:`/api/gem-ownership?root=${encodeURIComponent(id)}&direction=up&max_depth=8`,
  };
}

export const onRequestGet=async({request}:PagesContext)=>{
  const u=new URL(request.url);
  const upstream=new URL(BASE+"/assets");
  const country=clean(u.searchParams.get("country"),80);
  const q=clean(u.searchParams.get("q"),120);
  const assetType=clean(u.searchParams.get("asset_type"),100);
  const operatingStatus=clean(u.searchParams.get("operating_status"),100);
  const offset=Math.max(0,Number.parseInt(u.searchParams.get("offset")||"0",10)||0);
  const limit=Math.max(1,Math.min(Number.parseInt(u.searchParams.get("limit")||"200",10)||200,MAX));
  if(country)upstream.searchParams.set("country",country);
  if(q)upstream.searchParams.set("q",q);
  if(assetType)upstream.searchParams.append("asset_type",assetType);
  if(operatingStatus)upstream.searchParams.append("operating_status",operatingStatus);
  upstream.searchParams.set("limit",String(limit));
  upstream.searchParams.set("offset",String(offset));
  try{
    const r=await fetch(upstream,{headers:{accept:"application/json","user-agent":"4PLANET ATLAS bounded GEM asset read"}});
    if(!r.ok)return json({ok:false,error:`GEM_UPSTREAM_${r.status}`},502);
    const body=await r.json();
    const upstreamRows=rowsOf(body);
    if(!Array.isArray(upstreamRows))return json({ok:false,error:"GEM_CONTRACT_MISMATCH"},502);
    const assets=upstreamRows.map(normalizeGemAsset).filter(Boolean);
    return json({
      ok:true,
      state:assets.length?"SOURCE_RECORDS":"NO_MATCH",
      query:{country:country||null,q:q||null,assetType:assetType||null,operatingStatus:operatingStatus||null,limit,offset},
      count:assets.length,
      assets,
      source:{
        publisher:"Global Energy Monitor",
        product:"Ownership Tracing API · assets",
        endpoint:upstream.toString(),
        retrievedAt:new Date().toISOString(),
        access:"PUBLIC_BOUNDED_READ",
        rights:"GEM materials are generally reusable under CC BY 4.0 where stated; record/dataset-level third-party exceptions must travel with downstream commercial use.",
        attribution:"Global Energy Monitor",
      },
      truthBoundary:"A GEM asset record describes tracked energy/industrial infrastructure. Coordinates/status/capacity/owner fields remain source records. They do not by themselves establish current operation, emissions, legal responsibility or ecological effect. Owner absence means not present in this response, not no owner."
    });
  }catch(error){
    return json({ok:false,error:"GEM_SOURCE_UNAVAILABLE",detail:error instanceof Error?error.message:"GEM unavailable"},503);
  }
};
export const onRequest=async(ctx:PagesContext)=>ctx.request.method==="GET"?onRequestGet(ctx):json({ok:false,error:"METHOD_NOT_ALLOWED"},405);
