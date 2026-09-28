/**
 * GET /api/statbank-context?q={table search}
 * GET /api/statbank-context?table={5-digit SSB table id}
 *
 * Shared read-through adapter for SSB PxWebApi v2. It deliberately returns
 * the API's default/latest extract for a selected table; it does not infer
 * causal effects or choose a statistic on behalf of a public decision.
 */
interface PagesContext { request:Request; waitUntil?: (p:Promise<unknown>)=>void; }
const BASE="https://data.ssb.no/api/pxwebapi/v2";
const CACHE_SECONDS=900;
const json=(body:unknown,status=200)=>new Response(JSON.stringify(body),{status,headers:{"content-type":"application/json; charset=utf-8","cache-control":"public, max-age=600","x-content-type-options":"nosniff"}});
const clean=(v:unknown,max=500)=>typeof v==="string"?v.replace(/\s+/g," ").trim().slice(0,max):"";

async function cachedFetch(ctx:PagesContext,url:string){
  const req=new Request(url,{headers:{accept:"application/json"}});
  let cache:Cache|undefined;
  try{cache=(caches as unknown as {default?:Cache}).default;}catch{cache=undefined;}
  const hit=cache?await cache.match(req):undefined;
  if(hit)return {response:hit,cacheState:"HIT"};
  const response=await fetch(req);
  if(!response.ok)throw new Error(`SSB_HTTP_${response.status}`);
  if(cache){
    const headers=new Headers(response.headers);headers.set("cache-control",`public, max-age=${CACHE_SECONDS}`);
    const stored=new Response(response.clone().body,{status:response.status,statusText:response.statusText,headers});
    const write=cache.put(req,stored).catch(()=>undefined);if(ctx.waitUntil)ctx.waitUntil(write);else void write;
  }
  return {response,cacheState:"MISS"};
}

export function normalizeSsbTable(row:any){
  const id=clean(row?.id,20),label=clean(row?.label,500);
  if(!/^\d{5}$/.test(id)||!label)return null;
  return {
    id:`statistical-table:ssb:${id}`,tableId:id,label,
    description:clean(row?.description,700)||null,
    updated:clean(row?.updated,80)||null,
    firstPeriod:clean(row?.firstPeriod,80)||null,
    lastPeriod:clean(row?.lastPeriod,80)||null,
    variableNames:Array.isArray(row?.variableNames)?row.variableNames.map((x:unknown)=>clean(x,120)).filter(Boolean).slice(0,20):[],
    source:clean(row?.source,120)||"Statistisk sentralbyrå",
    sourceUrl:`${BASE}/tables/${id}?lang=no`,
  };
}

function categoryCodes(category:any,size:number){
  const index=category?.index;
  if(Array.isArray(index))return index.map((x:unknown)=>String(x)).slice(0,size);
  if(index&&typeof index==="object"){
    return Object.entries(index).sort((a:any,b:any)=>Number(a[1])-Number(b[1])).map(([code])=>code).slice(0,size);
  }
  return Array.from({length:size},(_,i)=>String(i));
}
function flattenJsonStat(dataset:any,limit=24){
  const ids=Array.isArray(dataset?.id)?dataset.id.map(String):[];
  const sizes=Array.isArray(dataset?.size)?dataset.size.map((x:any)=>Number(x)): [];
  if(!ids.length||ids.length!==sizes.length||sizes.some((x:number)=>!Number.isFinite(x)||x<1))return [];
  const total=Math.min(sizes.reduce((a:number,b:number)=>a*b,1),limit);
  const values=dataset?.value;
  const statuses=dataset?.status;
  const dimensions=ids.map((id:string,i:number)=>{
    const dim=dataset?.dimension?.[id]||{};
    const codes=categoryCodes(dim?.category,sizes[i]);
    const labels=dim?.category?.label||{};
    return {id,label:clean(dim?.label,160)||id,codes,labels};
  });
  const get=(container:any,index:number)=>Array.isArray(container)?container[index]:container&&typeof container==="object"?container[index]??container[String(index)]:undefined;
  const rows=[];
  for(let flat=0;flat<total;flat++){
    const coordinates:Record<string,{code:string;label:string}>={};
    for(let i=0;i<ids.length;i++){
      const stride=sizes.slice(i+1).reduce((a:number,b:number)=>a*b,1);
      const pos=Math.floor(flat/stride)%sizes[i];
      const code=dimensions[i].codes[pos]??String(pos);
      coordinates[ids[i]]={code,label:clean(dimensions[i].labels?.[code],180)||code};
    }
    const raw=get(values,flat);
    const value=typeof raw==="number"&&Number.isFinite(raw)?raw:raw===null?null:typeof raw==="string"?clean(raw,80):null;
    const status=get(statuses,flat);
    rows.push({index:flat,value,status:status==null?null:clean(String(status),30),coordinates});
  }
  return rows;
}

export const onRequestGet=async(ctx:PagesContext):Promise<Response>=>{
  const url=new URL(ctx.request.url);
  const q=clean(url.searchParams.get("q"),120);
  const table=clean(url.searchParams.get("table"),20);
  try{
    if(table){
      if(!/^\d{5}$/.test(table))return json({ok:false,error:"INVALID_TABLE_ID"},400);
      const [infoRes,dataRes]=await Promise.all([
        cachedFetch(ctx,`${BASE}/tables/${table}?lang=no`),
        cachedFetch(ctx,`${BASE}/tables/${table}/data?lang=no`),
      ]);
      const info=await infoRes.response.json() as any;
      const data=await dataRes.response.json() as any;
      const normalized=normalizeSsbTable(info);
      if(!normalized)return json({ok:false,error:"TABLE_METADATA_INVALID"},502);
      return json({
        ok:true,state:"DEFAULT_EXTRACT",table:normalized,dataset:{
          label:clean(data?.label,500)||normalized.label,
          updated:clean(data?.updated,80)||normalized.updated,
          dimensions:Array.isArray(data?.id)?data.id:[],
          cells:flattenJsonStat(data,24),
        },
        source:{
          publisher:"Statistisk sentralbyrå (SSB)",
          api:"PxWebApi v2",
          license:"CC BY 4.0",
          commercialReuse:"PERMITTED_WITH_ATTRIBUTION",
          attribution:"Statistisk sentralbyrå (SSB)",
          redistribution:"PERMITTED_WITH_CC_BY_4_0_ATTRIBUTION",
          accessCost:"FREE_OPEN_DATA_API",
          maxExtract:"800000 data cells per documented SSB limit",
          canonicalObjectMapping:"statistical-table:ssb:<tableId>",
          retrievedAt:new Date().toISOString(),
          cacheState:infoRes.cacheState===dataRes.cacheState?infoRes.cacheState:"MIXED",
          rateLimit:"30 queries/minute documented by SSB; 4PLANET caches table metadata/default extracts for 15 minutes.",
        },
        truthBoundary:"This is the SSB default extract for the selected table. Units, categories, footnotes, confidentiality/status markers and table metadata must be read before interpretation. Statistical association is not causal evidence for a policy outcome.",
      });
    }
    if(q){
      const target=new URL(`${BASE}/tables`);target.searchParams.set("query",q);target.searchParams.set("pagesize","8");target.searchParams.set("lang","no");
      const {response,cacheState}=await cachedFetch(ctx,target.toString());
      const payload=await response.json() as any;
      const rows=Array.isArray(payload?.tables)?payload.tables:Array.isArray(payload)?payload:[];
      const tables=rows.map(normalizeSsbTable).filter(Boolean).slice(0,8);
      return json({
        ok:true,state:tables.length?"TABLE_CANDIDATES":"NO_MATCH",query:q,tables,
        source:{publisher:"Statistisk sentralbyrå (SSB)",api:"PxWebApi v2",license:"CC BY 4.0",commercialReuse:"PERMITTED_WITH_ATTRIBUTION",attribution:"Statistisk sentralbyrå (SSB)",accessCost:"FREE_OPEN_DATA_API",rateLimit:"30 queries/minute",cachePolicy:"4PLANET cache 15 minutes",retrievedAt:new Date().toISOString(),cacheState},
        truthBoundary:"Table search is discovery only. 4PLANET does not select a statistic as evidence for a decision until the user opens and evaluates the table context.",
      });
    }
    return json({ok:false,error:"QUERY_OR_TABLE_REQUIRED"},400);
  }catch(error){
    return json({ok:false,error:"SSB_SOURCE_UNAVAILABLE",detail:error instanceof Error?error.message:"SSB unavailable"},503);
  }
};
export const onRequest=async(ctx:PagesContext)=>ctx.request.method==="GET"?onRequestGet(ctx):json({ok:false,error:"METHOD_NOT_ALLOWED"},405);
