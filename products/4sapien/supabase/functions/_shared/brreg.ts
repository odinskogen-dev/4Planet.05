export const BRREG_API_BASE="https://data.brreg.no/enhetsregisteret/api";

export interface BrregCompanyRecord {
  organizationNumber:string;
  entityName:string;
  organizationForm:string|null;
  registeredDate:string|null;
  deleted:boolean;
  bankrupt:boolean;
  liquidation:boolean;
  sourceUrl:string;
  sourceLicense:"NLOD 2.0";
  observedAt:string;
}

export class BrregProviderError extends Error {
  state:string;
  httpStatus:number;
  constructor(state:string,message:string,httpStatus=503){super(message);this.state=state;this.httpStatus=httpStatus;}
}

const clean=(value:unknown,max=240)=>typeof value==="string"?value.replace(/\s+/g," ").trim().slice(0,max):"";

export function normalizeBrregEntity(row:any,expectedOrganizationNumber?:string):BrregCompanyRecord {
  const organizationNumber=clean(row?.organisasjonsnummer,20);
  const entityName=clean(row?.navn,240);
  if(!/^\d{9}$/.test(organizationNumber)||!entityName)throw new BrregProviderError("SOURCE_PARSE_FAILED","BRREG record missing canonical identity.");
  if(expectedOrganizationNumber&&organizationNumber!==expectedOrganizationNumber)
    throw new BrregProviderError("SOURCE_IDENTITY_MISMATCH","BRREG returned a different organisation number.");
  return {
    organizationNumber,
    entityName,
    organizationForm:clean(row?.organisasjonsform?.kode,30)||null,
    registeredDate:clean(row?.registreringsdatoEnhetsregisteret,30)||null,
    deleted:row?.erSlettet===true,
    bankrupt:row?.konkurs===true,
    liquidation:row?.underAvvikling===true,
    sourceUrl:`${BRREG_API_BASE}/enheter/${organizationNumber}`,
    sourceLicense:"NLOD 2.0",
    observedAt:new Date().toISOString(),
  };
}

async function brregJson(url:string,fetcher:typeof fetch,signal?:AbortSignal){
  let response:Response;
  try{
    response=await fetcher(url,{headers:{Accept:"application/vnd.brreg.enhetsregisteret.enhet.v2+json","User-Agent":"4PLANET/1.0 (https://4planet.org)"},signal});
  }catch(error){
    const name=error instanceof Error?error.name:"";
    throw new BrregProviderError(["AbortError","TimeoutError"].includes(name)?"SOURCE_TIMEOUT":"SOURCE_UNAVAILABLE","BRREG request failed.");
  }
  if(response.status===404)return null;
  if(response.status===410)throw new BrregProviderError("SOURCE_REMOVED","BRREG source record was removed.",410);
  if(response.status===429)throw new BrregProviderError("RATE_LIMITED","BRREG rate limited the request.",429);
  if(!response.ok)throw new BrregProviderError("SOURCE_HTTP_ERROR",`BRREG returned HTTP ${response.status}.`,response.status);
  try{return await response.json();}catch{throw new BrregProviderError("SOURCE_PARSE_FAILED","BRREG returned invalid JSON.");}
}

export async function fetchBrregExact(
  organizationNumber:string,
  options:{fetcher?:typeof fetch;signal?:AbortSignal}={}
):Promise<BrregCompanyRecord|null>{
  const number=organizationNumber.trim();
  if(!/^\d{9}$/.test(number))throw new BrregProviderError("VALID_NINE_DIGIT_ORGANIZATION_NUMBER_REQUIRED","A valid nine-digit organisation number is required.",400);
  const payload=await brregJson(`${BRREG_API_BASE}/enheter/${number}`,options.fetcher??fetch,options.signal);
  return payload?normalizeBrregEntity(payload,number):null;
}

export async function searchBrregByName(
  name:string,
  options:{fetcher?:typeof fetch;signal?:AbortSignal;limit?:number}={}
):Promise<BrregCompanyRecord[]>{
  const q=clean(name,120);
  if(q.length<2)throw new BrregProviderError("QUERY_TOO_SHORT","Company name must contain at least two characters.",400);
  const limit=Math.max(1,Math.min(options.limit??8,12));
  const url=`${BRREG_API_BASE}/enheter?navn=${encodeURIComponent(q)}&size=${limit}`;
  const payload=await brregJson(url,options.fetcher??fetch,options.signal);
  const rows=Array.isArray(payload?._embedded?.enheter)?payload._embedded.enheter:[];
  return rows.map((row:any)=>{try{return normalizeBrregEntity(row);}catch{return null;}})
    .filter((row:BrregCompanyRecord|null):row is BrregCompanyRecord=>row!==null)
    .slice(0,limit);
}
