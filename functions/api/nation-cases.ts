/**
 * GET /api/nation-cases?q={plain text}
 *
 * Neutral discovery over Stortinget's open-data "saker" export for the
 * current session. This reports source status; it does not rank policies,
 * infer political positions, or convert a parliamentary case into enacted law.
 */
interface PagesContext { request:Request; waitUntil?: (p:Promise<unknown>)=>void; }
const SOURCE="https://data.stortinget.no/eksport/saker?format=JSON";
const CACHE_SECONDS=600;
const json=(body:unknown,status=200)=>new Response(JSON.stringify(body),{status,headers:{"content-type":"application/json; charset=utf-8","cache-control":"public, max-age=300","x-content-type-options":"nosniff"}});
const clean=(v:unknown,max=500)=>typeof v==="string"?v.replace(/\s+/g," ").trim().slice(0,max):"";
const norm=(v:unknown)=>clean(v,500).normalize("NFKD").replace(/[\u0300-\u036f]/g,"").toLocaleLowerCase("nb-NO");

function list<T=any>(value:any,key:string):T[]{
  const candidate=value?.[key];
  if(Array.isArray(candidate))return candidate;
  if(candidate&&typeof candidate==="object"){
    for(const nested of Object.values(candidate))if(Array.isArray(nested))return nested as T[];
  }
  return [];
}
function sourceDate(value:unknown){
  const raw=clean(value,80);
  const ms=/\/Date\((\d+)/.exec(raw)?.[1];
  if(ms){const date=new Date(Number(ms));return Number.isFinite(date.getTime())?date.toISOString():raw;}
  return raw||null;
}
function committee(row:any){
  return clean(row?.komite?.navn??row?.komite?.navn_bokmaal??row?.komite?.id,180)||null;
}
function subjects(row:any){
  const rows=list(row?.emne_liste,"emne").length?list(row?.emne_liste,"emne"):Array.isArray(row?.emne_liste)?row.emne_liste:[];
  return rows.map((x:any)=>clean(x?.navn??x?.navn_bokmaal??x?.id,180)).filter(Boolean).slice(0,12);
}

export function normalizeStortingCase(row:any){
  const id=clean(row?.id,80);
  const title=clean(row?.tittel??row?.korttittel,500);
  if(!id||!title)return null;
  return {
    id:`public-decision:stortinget:${id}`,
    sourceCaseId:id,
    title,
    shortTitle:clean(row?.korttittel,300)||null,
    caseType:clean(row?.type,80)||null,
    status:clean(row?.status,80)||"ukjent",
    documentGroup:clean(row?.dokumentgruppe,100)||null,
    committee:committee(row),
    subjects:subjects(row),
    lastUpdated:sourceDate(row?.sist_oppdatert_dato),
    sourceUrl:`https://data.stortinget.no/eksport/sak?sakid=${encodeURIComponent(id)}&format=JSON`,
  };
}

async function sourceSnapshot(ctx:PagesContext){
  const req=new Request(SOURCE,{headers:{accept:"application/json"}});
  let cache:Cache|undefined;
  try{cache=(caches as unknown as {default?:Cache}).default;}catch{cache=undefined;}
  const hit=cache?await cache.match(req):undefined;
  if(hit)return {response:hit,cacheState:"HIT"};
  const response=await fetch(req);
  if(!response.ok)throw new Error(`STORTINGET_HTTP_${response.status}`);
  if(cache){
    const headers=new Headers(response.headers);headers.set("cache-control",`public, max-age=${CACHE_SECONDS}`);
    const stored=new Response(response.clone().body,{status:response.status,statusText:response.statusText,headers});
    const write=cache.put(req,stored).catch(()=>undefined);if(ctx.waitUntil)ctx.waitUntil(write);else void write;
  }
  return {response,cacheState:"MISS"};
}

export const onRequestGet=async(ctx:PagesContext):Promise<Response>=>{
  const url=new URL(ctx.request.url);
  const q=clean(url.searchParams.get("q"),120);
  if(q.length<2)return json({ok:false,error:"QUERY_REQUIRED"},400);
  try{
    const {response,cacheState}=await sourceSnapshot(ctx);
    const payload=await response.json() as any;
    const rows=list(payload?.saker_liste,"sak").length?list(payload?.saker_liste,"sak"):Array.isArray(payload?.saker_liste)?payload.saker_liste:[];
    const terms=norm(q).split(" ").filter(Boolean);
    const cases=rows
      .map(normalizeStortingCase)
      .filter(Boolean)
      .filter((item:any)=>{
        const hay=norm([item.title,item.shortTitle,item.committee,...item.subjects].filter(Boolean).join(" "));
        return terms.every(term=>hay.includes(term));
      })
      .sort((a:any,b:any)=>String(b.lastUpdated||"").localeCompare(String(a.lastUpdated||"")))
      .slice(0,24);
    return json({
      ok:true,state:cases.length?"SOURCE_CASES":"NO_MATCH",query:q,cases,
      source:{
        publisher:"Stortinget",
        dataset:"Saker — current parliamentary session",
        endpoint:SOURCE,
        license:"NLOD",
        commercialReuse:"PERMITTED_UNDER_NLOD_WITH_ATTRIBUTION_AND_NO_MISLEADING_PRESENTATION",
        redistribution:"PERMITTED_UNDER_NLOD; source attribution required",
        attribution:"Stortinget",
        retrievedAt:new Date().toISOString(),
        cacheState,
        rateLimit:"100 API calls/minute documented by Stortinget; 4PLANET caches the session snapshot for 10 minutes.",
        accessCost:"FREE_OPEN_DATA_API",
        canonicalObjectMapping:"public-decision:stortinget:<sakid>",
      },
      truthBoundary:"The source status describes parliamentary case processing. A case is not legislation or implemented policy unless the source status and underlying records establish that separately. 4PLANET does not rank, recommend or infer political positions.",
      coverage:"Current Stortinget session only. This is not all Norwegian public decisions, municipal/regional decisions or government implementation.",
    });
  }catch(error){
    return json({ok:false,error:"STORTINGET_SOURCE_UNAVAILABLE",detail:error instanceof Error?error.message:"Source unavailable"},503);
  }
};
export const onRequest=async(ctx:PagesContext)=>ctx.request.method==="GET"?onRequestGet(ctx):json({ok:false,error:"METHOD_NOT_ALLOWED"},405);
