import type { SourceRefreshSnapshot } from "../sourceRefresh";

export const MATVARETABELLEN_FOODS_URL = "https://matvaretabellen.mattilsynet.io/api/nb/foods.json";
export const MATVARETABELLEN_PROVIDER = "Matvaretabellen / Mattilsynet";

export interface MatvaretabellenConstituent {
  nutrientId?: string;
  quantity?: number | string | null;
  unit?: string;
  sourceId?: string;
  [key: string]: unknown;
}

export interface MatvaretabellenFoodPayload {
  foodId?: string;
  foodName?: string;
  foodGroupId?: string;
  searchKeywords?: string[] | string;
  constituents?: MatvaretabellenConstituent[] | Record<string, unknown>;
  [key: string]: unknown;
}

export interface MatvaretabellenFoodReference {
  foodId: string;
  foodName: string;
  foodGroupId?: string;
  searchKeywords: string[];
  constituents?: MatvaretabellenFoodPayload["constituents"];
}

export interface MatvaretabellenSearchResult {
  provider: typeof MATVARETABELLEN_PROVIDER;
  providerId: "MATVARETABELLEN:foods:nb";
  canonicalLocator: typeof MATVARETABELLEN_FOODS_URL;
  query: string;
  matches: MatvaretabellenFoodReference[];
  snapshot: SourceRefreshSnapshot;
  scope: "GENERIC_FOOD_COMPOSITION_REFERENCE_NOT_BRANDED_PRODUCT";
  attribution: "Matvaretabellen";
  error?: string;
}

const fnv1a32=(input:string)=>{
  let hash=0x811c9dc5;
  for(let i=0;i<input.length;i+=1){hash^=input.charCodeAt(i);hash=Math.imul(hash,0x01000193)>>>0;}
  return hash.toString(16).padStart(8,"0");
};

const norm=(value:unknown)=>String(value??"")
  .normalize("NFKD").replace(/[\u0300-\u036f]/g,"")
  .toLocaleLowerCase("nb-NO").replace(/[^a-z0-9æøå]+/g," ").trim().replace(/\s+/g," ");

const keywords=(value:unknown)=>{
  if(Array.isArray(value)) return value.filter((v):v is string=>typeof v==="string").map(v=>v.trim()).filter(Boolean);
  if(typeof value==="string") return value.split(/[;,|]/).map(v=>v.trim()).filter(Boolean);
  return [];
};

export const normalizeMatvaretabellenFood=(payload:MatvaretabellenFoodPayload):MatvaretabellenFoodReference=>{
  const foodId=typeof payload.foodId==="string"?payload.foodId.trim():"";
  const foodName=typeof payload.foodName==="string"?payload.foodName.trim():"";
  if(!foodId||!foodName) throw new Error("Malformed Matvaretabellen food payload: foodId and foodName are required.");
  return {
    foodId,foodName,
    ...(typeof payload.foodGroupId==="string"&&payload.foodGroupId.trim()?{foodGroupId:payload.foodGroupId.trim()}:{}),
    searchKeywords:keywords(payload.searchKeywords),
    ...(payload.constituents?{constituents:payload.constituents}:{}),
  };
};

const unwrapFoods=(payload:unknown):MatvaretabellenFoodPayload[]=>{
  if(Array.isArray(payload)) return payload as MatvaretabellenFoodPayload[];
  if(payload&&typeof payload==="object"&&Array.isArray((payload as {foods?:unknown[]}).foods))
    return (payload as {foods:MatvaretabellenFoodPayload[]}).foods;
  throw new Error("Malformed Matvaretabellen response: foods array missing.");
};

export const searchMatvaretabellenFoods=(payload:unknown,query:string,limit=8):MatvaretabellenFoodReference[]=>{
  const q=norm(query);
  if(q.length<2) return [];
  return unwrapFoods(payload)
    .map(food=>{try{return normalizeMatvaretabellenFood(food);}catch{return null;}})
    .filter((food):food is MatvaretabellenFoodReference=>food!==null)
    .map(food=>{
      const name=norm(food.foodName);
      const keys=food.searchKeywords.map(norm);
      let score=0;
      if(name===q) score=100;
      else if(name.startsWith(q+" ")) score=90;
      else if(name.includes(q)) score=75;
      else if(keys.some(k=>k===q)) score=65;
      else if(keys.some(k=>k.includes(q))) score=50;
      return {food,score};
    })
    .filter(row=>row.score>0)
    .sort((a,b)=>b.score-a.score||a.food.foodName.length-b.food.foodName.length)
    .slice(0,Math.max(1,Math.min(limit,20)))
    .map(row=>row.food);
};

export async function fetchMatvaretabellenReference(
  query:string,
  checkedAt:string,
  options:{fetcher?:typeof fetch;signal?:AbortSignal;limit?:number}={}
):Promise<MatvaretabellenSearchResult>{
  const fetcher=options.fetcher??fetch;
  const providerId="MATVARETABELLEN:foods:nb" as const;
  try{
    const response=await fetcher(MATVARETABELLEN_FOODS_URL,{headers:{Accept:"application/json"},signal:options.signal});
    if(!response.ok) throw new Error(`Matvaretabellen returned HTTP ${response.status}.`);
    const payload=await response.json();
    const matches=searchMatvaretabellenFoods(payload,query,options.limit??8);
    const semantic=matches.map(x=>`${x.foodId}:${x.foodName}`).join("|");
    const fingerprint=`MATVARETABELLEN:nb-food-search-v1:${fnv1a32(norm(query)+"|"+semantic)}`;
    return {
      provider:MATVARETABELLEN_PROVIDER,providerId,canonicalLocator:MATVARETABELLEN_FOODS_URL,query,
      matches,scope:"GENERIC_FOOD_COMPOSITION_REFERENCE_NOT_BRANDED_PRODUCT",attribution:"Matvaretabellen",
      snapshot:{checkedAt,fingerprint,fingerprintMethod:"SEMANTIC_VERSION",sourceVersion:fingerprint,verification:"VERIFIED",available:true,providerId,changeScope:"CLAIM_RELEVANT"},
    };
  }catch(error){
    const message=error instanceof Error?error.message:"Unknown Matvaretabellen fetch error";
    return {
      provider:MATVARETABELLEN_PROVIDER,providerId,canonicalLocator:MATVARETABELLEN_FOODS_URL,query,matches:[],
      scope:"GENERIC_FOOD_COMPOSITION_REFERENCE_NOT_BRANDED_PRODUCT",attribution:"Matvaretabellen",
      snapshot:{checkedAt,fingerprint:`${providerId}:UNAVAILABLE`,fingerprintMethod:"PROVIDER_VERSION",verification:"REVIEW_REQUIRED",available:false,providerId,changeScope:"UNKNOWN"},
      error:message,
    };
  }
}
