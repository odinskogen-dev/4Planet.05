import type { SourceRefreshSnapshot } from "../sourceRefresh";

export const OPENALEX_WORKS_URL="https://api.openalex.org/works";
export const OPENALEX_PROVIDER="OpenAlex Works API";

export interface OpenAlexWorkPayload {
  id?:string; doi?:string|null; title?:string; display_name?:string;
  publication_year?:number|null; publication_date?:string|null; type?:string|null;
  cited_by_count?:number|null;
  primary_location?:{source?:{id?:string;display_name?:string}|null}|null;
  open_access?:{is_oa?:boolean;oa_status?:string|null}|null;
  [key:string]:unknown;
}
export interface OpenAlexWorkReference {
  openAlexId:string; doi?:string; title:string; publicationYear?:number; publicationDate?:string;
  type?:string; sourceName?:string; citedByCount?:number; isOpenAccess?:boolean; oaStatus?:string;
}
export interface OpenAlexSearchResult {
  provider:typeof OPENALEX_PROVIDER;providerId:string;canonicalLocator:string;query:string;
  works:OpenAlexWorkReference[];snapshot:SourceRefreshSnapshot;
  rights:"OPENALEX_METADATA_CC0_FULLTEXT_AND_PUBLISHER_CONTENT_SEPARATE";
  error?:string;
}

const fnv1a32=(input:string)=>{let hash=0x811c9dc5;for(let i=0;i<input.length;i+=1){hash^=input.charCodeAt(i);hash=Math.imul(hash,0x01000193)>>>0;}return hash.toString(16).padStart(8,"0");};
const stripControlCharacters=(input:string)=>Array.from(input,(char)=>{const code=char.charCodeAt(0);return code<32||code===127?" ":char;}).join("");
const clean=(v:unknown,max=500)=>typeof v==="string"?stripControlCharacters(v).replace(/\s+/g," ").trim().slice(0,max):"";

export const normalizeOpenAlexWork=(work:OpenAlexWorkPayload):OpenAlexWorkReference=>{
  const id=clean(work.id,120),title=clean(work.title||work.display_name,500);
  if(!/^https:\/\/openalex\.org\/W\d+$/i.test(id)||!title) throw new Error("Malformed OpenAlex work payload: stable work ID and title are required.");
  const out:OpenAlexWorkReference={openAlexId:id,title};
  const doi=clean(work.doi,180); if(/^https:\/\/doi\.org\//i.test(doi))out.doi=doi;
  if(Number.isInteger(work.publication_year))out.publicationYear=work.publication_year as number;
  const date=clean(work.publication_date,20);if(/^\d{4}-\d{2}-\d{2}$/.test(date))out.publicationDate=date;
  const type=clean(work.type,80);if(type)out.type=type;
  const sourceName=clean(work.primary_location?.source?.display_name,240);if(sourceName)out.sourceName=sourceName;
  if(typeof work.cited_by_count==="number"&&Number.isFinite(work.cited_by_count)&&work.cited_by_count>=0)out.citedByCount=work.cited_by_count;
  if(typeof work.open_access?.is_oa==="boolean")out.isOpenAccess=work.open_access.is_oa;
  const status=clean(work.open_access?.oa_status,40);if(status)out.oaStatus=status;
  return out;
};

export async function searchOpenAlexWorks(
  query:string,checkedAt:string,
  options:{fetcher?:typeof fetch;signal?:AbortSignal;limit?:number;apiKey?:string}={}
):Promise<OpenAlexSearchResult>{
  const fetcher=options.fetcher??fetch,limit=Math.max(1,Math.min(options.limit??6,20));
  const params=new URLSearchParams({search:query,per_page:String(limit),select:"id,doi,title,publication_year,publication_date,type,cited_by_count,primary_location,open_access"});
  if(options.apiKey)params.set("api_key",options.apiKey);
  const canonicalLocator=`${OPENALEX_WORKS_URL}?${params.toString()}`;
  const providerId=`OPENALEX:works-search:${fnv1a32(query.trim().toLowerCase())}`;
  try{
    const response=await fetcher(canonicalLocator,{headers:{Accept:"application/json"},signal:options.signal});
    if(!response.ok)throw new Error(`OpenAlex returned HTTP ${response.status}.`);
    const payload=await response.json() as {results?:OpenAlexWorkPayload[]};
    if(!Array.isArray(payload?.results))throw new Error("Malformed OpenAlex response: results array missing.");
    const works=payload.results.map(w=>{try{return normalizeOpenAlexWork(w);}catch{return null;}}).filter((w):w is OpenAlexWorkReference=>w!==null);
    const fingerprint=`OPENALEX:works-search-v1:${fnv1a32(works.map(w=>w.openAlexId).join("|"))}`;
    return {provider:OPENALEX_PROVIDER,providerId,canonicalLocator,query,works,rights:"OPENALEX_METADATA_CC0_FULLTEXT_AND_PUBLISHER_CONTENT_SEPARATE",
      snapshot:{checkedAt,fingerprint,fingerprintMethod:"SEMANTIC_VERSION",sourceVersion:fingerprint,verification:"VERIFIED",available:true,providerId,changeScope:"CLAIM_RELEVANT"}};
  }catch(error){
    const message=error instanceof Error?error.message:"Unknown OpenAlex fetch error";
    return {provider:OPENALEX_PROVIDER,providerId,canonicalLocator,query,works:[],rights:"OPENALEX_METADATA_CC0_FULLTEXT_AND_PUBLISHER_CONTENT_SEPARATE",
      snapshot:{checkedAt,fingerprint:`${providerId}:UNAVAILABLE`,fingerprintMethod:"PROVIDER_VERSION",verification:"REVIEW_REQUIRED",available:false,providerId,changeScope:"UNKNOWN"},error:message};
  }
}
