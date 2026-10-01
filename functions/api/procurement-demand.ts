/**
 * GET /api/procurement-demand?q={keywords}&country=NOR|ALL
 *
 * Published public-procurement notice discovery through the official,
 * anonymous TED Search API v3. A notice is a market/demand signal only:
 * it is not a sale, award, company fit, willingness-to-pay proof or realised value.
 */

interface PagesContext { request: Request; }
const TED_SEARCH="https://api.ted.europa.eu/v3/notices/search";
const MAX_RESULTS=24;
const COUNTRY=/^[A-Z]{3}$/;

const json=(body:unknown,status=200)=>new Response(JSON.stringify(body),{
  status,
  headers:{
    "content-type":"application/json; charset=utf-8",
    "cache-control":"public, max-age=900",
    "x-content-type-options":"nosniff",
  },
});

const clean=(value:unknown,max=240)=>typeof value==="string"
  ? value.replace(/[\\"]/g," ").replace(/\s+/g," ").trim().slice(0,max)
  : "";

function flattenText(value:unknown):string[]{
  if(typeof value==="string")return [clean(value,500)].filter(Boolean);
  if(Array.isArray(value))return value.flatMap(flattenText).filter(Boolean);
  if(value&&typeof value==="object"){
    const row=value as Record<string,unknown>;
    const preferred=["nor","nob","nno","eng","en","nb","nn"];
    for(const key of preferred){
      if(key in row){
        const picked=flattenText(row[key]);
        if(picked.length)return picked;
      }
    }
    return Object.values(row).flatMap(flattenText).filter(Boolean);
  }
  if(typeof value==="number")return [String(value)];
  return [];
}

const first=(value:unknown)=>flattenText(value)[0]||null;
const unique=(value:unknown)=>Array.from(new Set(flattenText(value))).slice(0,12);

export interface ProcurementSignal {
  id:string;
  title:string;
  buyer:string|null;
  buyerCountry:string|null;
  publicationDate:string|null;
  noticeType:string|null;
  cpv:string[];
  deadline:string|null;
  sourceUrl:string;
}

export function normalizeTedNotice(row:any):ProcurementSignal|null{
  const publicationNumber=clean(row?.["publication-number"]??row?.publicationNumber??row?.id,80);
  const title=first(row?.["notice-title"]??row?.title);
  if(!publicationNumber||!title)return null;
  return {
    id:`procurement:ted:${publicationNumber}`,
    title,
    buyer:first(row?.["buyer-name"]??row?.buyerName),
    buyerCountry:first(row?.["buyer-country"]??row?.buyerCountry),
    publicationDate:first(row?.["publication-date"]??row?.publicationDate),
    noticeType:first(row?.["form-type"]??row?.["notice-type"]??row?.noticeType),
    cpv:unique(row?.["classification-cpv"]??row?.classificationCpv),
    deadline:first(row?.["deadline-receipt-tender-date-lot"]??row?.deadline),
    sourceUrl:`https://ted.europa.eu/en/notice/-/detail/${encodeURIComponent(publicationNumber)}`,
  };
}

function expertQuery(raw:string,country:string){
  const terms=clean(raw,120).split(" ").filter(x=>x.length>=2).slice(0,8);
  if(!terms.length)throw new Error("QUERY_TOO_SHORT");
  const ft=terms.length===1?`FT~${terms[0]}`:`FT~(${terms.join(" ")})`;
  const countryClause=country==="ALL"?"":` AND buyer-country=${country}`;
  return `${ft}${countryClause} SORT BY publication-date DESC`;
}

export const onRequestGet=async({request}:PagesContext):Promise<Response>=>{
  const url=new URL(request.url);
  const q=clean(url.searchParams.get("q"),120);
  const rawCountry=clean(url.searchParams.get("country")||"NOR",12).toUpperCase();
  const country=rawCountry==="ALL"?"ALL":COUNTRY.test(rawCountry)?rawCountry:"NOR";
  if(q.length<2)return json({ok:false,error:"QUERY_REQUIRED"},400);

  let query:string;
  try{query=expertQuery(q,country);}catch{return json({ok:false,error:"QUERY_REQUIRED"},400);}

  try{
    const response=await fetch(TED_SEARCH,{
      method:"POST",
      headers:{"content-type":"application/json",accept:"application/json"},
      body:JSON.stringify({
        query,
        fields:[
          "publication-number","notice-title","buyer-name","buyer-country","publication-date",
          "form-type","classification-cpv","deadline-receipt-tender-date-lot"
        ],
        limit:MAX_RESULTS,
        scope:"ACTIVE",
        paginationMode:"PAGE_NUMBER",
        page:1,
        checkQuerySyntax:true,
      }),
    });
    if(!response.ok)return json({ok:false,error:`TED_UPSTREAM_${response.status}`},502);
    const payload=await response.json() as any;
    const rows=Array.isArray(payload?.notices)?payload.notices:
      Array.isArray(payload?.results)?payload.results:
      Array.isArray(payload?.content)?payload.content:[];
    const signals=rows.map(normalizeTedNotice).filter((x:ProcurementSignal|null):x is ProcurementSignal=>x!==null);
    return json({
      ok:true,
      state:signals.length?"PUBLISHED_NOTICE_SIGNALS":"NO_MATCH",
      query:{keywords:q,country,expertQuery:query,scope:"ACTIVE"},
      total:Number(payload?.totalNoticeCount??payload?.totalSize??payload?.total??signals.length)||signals.length,
      signals,
      source:{
        publisher:"Publications Office of the European Union",
        product:"TED Search API",
        apiVersion:"v3",
        endpoint:TED_SEARCH,
        retrievedAt:new Date().toISOString(),
        access:"ANONYMOUS_PUBLISHED_NOTICE_SEARCH",
        license:"EU_REUSE_POLICY — procurement notices freely reusable for commercial or non-commercial purposes unless otherwise noted; SIMAP metadata CC0",
        commercialReuse:"PERMITTED_UNLESS_OTHERWISE_NOTED",
        attribution:"Publications Office of the European Union / TED; original notice link retained",
        cachePolicy:"4PLANET response cache 15 minutes; source notice remains authoritative",
        accessCost:"FREE_ANONYMOUS_SEARCH_API",
        rateLimit:"NOT_STATED_IN_THIS_ADAPTER; bounded to 24 active results per user query",
      },
      coverage:{
        doffin:"NOT_CONNECTED_IN_THIS_SLICE",
        limitation:"TED results are published procurement notices available in TED. This is not a complete substitute for Norwegian Doffin-only/national notices.",
      },
      truthBoundary:"A published procurement notice is evidence of a published procurement process/market signal. It is not evidence of a sale, award, supplier fit, willingness to pay, realised company value or ecological outcome.",
    });
  }catch(error){
    return json({ok:false,error:"TED_SOURCE_UNAVAILABLE",detail:error instanceof Error?error.message:"TED search unavailable"},503);
  }
};

export const onRequest=async(ctx:PagesContext)=>ctx.request.method==="GET"?onRequestGet(ctx):json({ok:false,error:"METHOD_NOT_ALLOWED"},405);
