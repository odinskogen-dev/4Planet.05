/**
 * GET /api/food-reference?q={generic food name}
 * GET /api/food-reference?id={Matvaretabellen foodId}
 *
 * Official Norwegian generic food-composition reference.
 * Branded product identity remains separate and a product→generic-food join
 * requires explicit user confirmation in the client.
 */

interface PagesContext {
  request: Request;
  waitUntil?: (promise: Promise<unknown>) => void;
}

interface SourceFood {
  foodId?: unknown;
  foodName?: unknown;
  foodGroupId?: unknown;
  searchKeywords?: unknown;
  calories?: unknown;
  energy?: unknown;
  constituents?: unknown;
}

interface Measurement {
  quantity?: unknown;
  unit?: unknown;
  sourceId?: unknown;
  nutrientId?: unknown;
}

const SOURCE_URL = "https://matvaretabellen.mattilsynet.io/api/nb/foods.json";
const SOURCE_HOME = "https://matvaretabellen.mattilsynet.io/";
const SOURCE_API = "https://matvaretabellen.mattilsynet.io/api/";
const CACHE_SECONDS = 60 * 60 * 24 * 30;
const ADAPTER_VERSION = "4planet-matvaretabellen-reference-01";

const nutrientAliases: Record<string,string[]> = {
  energyKcal: ["Energi2"],
  fat: ["Fett"],
  saturatedFat: ["Mettet"],
  carbohydrate: ["Karbo"],
  sugars: ["Mono+Di"],
  fibre: ["Fiber"],
  protein: ["Protein"],
  salt: ["NaCl"],
};

const json=(body:unknown,status=200)=>new Response(JSON.stringify(body),{
  status,
  headers:{
    "content-type":"application/json; charset=utf-8",
    "cache-control":"no-store",
    "x-content-type-options":"nosniff",
  },
});

const clean=(value:unknown,max=180)=>typeof value==="string"
  ? value.replace(/\s+/g," ").trim().slice(0,max)
  : "";

const numberOrNull=(value:unknown)=>{
  const n=typeof value==="number"?value:Number(value);
  return Number.isFinite(n)?n:null;
};

const measurement=(value:unknown)=>{
  if(!value||typeof value!=="object"||Array.isArray(value))return null;
  const row=value as Measurement;
  const quantity=numberOrNull(row.quantity);
  if(quantity===null)return null;
  const unit=clean(row.unit,24)||null;
  const sourceId=clean(row.sourceId,80)||null;
  return {quantity,unit,sourceId};
};

const normaliseText=(value:unknown)=>String(value??"")
  .normalize("NFKD")
  .replace(/[\u0300-\u036f]/g,"")
  .toLocaleLowerCase("nb-NO")
  .replace(/[^a-z0-9æøå]+/g," ")
  .trim()
  .replace(/\s+/g," ");

const keywords=(value:unknown)=>Array.isArray(value)
  ? value.filter((x):x is string=>typeof x==="string").map(x=>clean(x)).filter(Boolean)
  : typeof value==="string"
    ? value.split(/[;,|]/).map(x=>clean(x)).filter(Boolean)
    : [];

function constituentMap(food:SourceFood){
  const map=new Map<string,{quantity:number;unit:string|null;sourceId:string|null}>();
  if(Array.isArray(food.constituents)){
    for(const raw of food.constituents){
      if(!raw||typeof raw!=="object"||Array.isArray(raw))continue;
      const row=raw as Measurement;
      const id=clean(row.nutrientId,80);
      const m=measurement(row);
      if(id&&m)map.set(id,m);
    }
  }
  return map;
}

function pickNutrient(map:ReturnType<typeof constituentMap>,aliases:string[]){
  for(const alias of aliases){
    const value=map.get(alias);
    if(value)return {nutrientId:alias,...value};
  }
  return null;
}

export function normaliseMatvaretabellenFood(food:SourceFood){
  const foodId=clean(food.foodId,80);
  const foodName=clean(food.foodName,240);
  if(!foodId||!foodName)throw new Error("MALFORMED_FOOD_IDENTITY");
  const constituents=constituentMap(food);
  const calories=measurement(food.calories) ?? pickNutrient(constituents,nutrientAliases.energyKcal);
  return {
    foodId,
    foodName,
    foodGroupId:clean(food.foodGroupId,80)||null,
    searchKeywords:keywords(food.searchKeywords),
    nutritionPer100:{
      energyKcal:calories,
      fat:pickNutrient(constituents,nutrientAliases.fat),
      saturatedFat:pickNutrient(constituents,nutrientAliases.saturatedFat),
      carbohydrate:pickNutrient(constituents,nutrientAliases.carbohydrate),
      sugars:pickNutrient(constituents,nutrientAliases.sugars),
      fibre:pickNutrient(constituents,nutrientAliases.fibre),
      protein:pickNutrient(constituents,nutrientAliases.protein),
      salt:pickNutrient(constituents,nutrientAliases.salt),
    },
  };
}

function unwrapFoods(payload:unknown):SourceFood[]{
  if(!payload||typeof payload!=="object"||Array.isArray(payload))throw new Error("MALFORMED_SOURCE_ENVELOPE");
  const foods=(payload as {foods?:unknown}).foods;
  if(!Array.isArray(foods))throw new Error("MALFORMED_SOURCE_ENVELOPE");
  return foods.filter((x):x is SourceFood=>Boolean(x)&&typeof x==="object"&&!Array.isArray(x));
}

export function searchMatvaretabellen(payload:unknown,query:string,limit=8){
  const q=normaliseText(query);
  if(q.length<2)return [];
  return unwrapFoods(payload)
    .map((food)=>{
      try{
        const normalized=normaliseMatvaretabellenFood(food);
        const name=normaliseText(normalized.foodName);
        const ks=normalized.searchKeywords.map(normaliseText);
        const qTokens=q.split(" ").filter(Boolean);
        const nameTokens=new Set(name.split(" ").filter(Boolean));
        let score=0;
        if(name===q)score=120;
        else if(qTokens.length&&qTokens.every(t=>nameTokens.has(t)))score=108;
        else if(name.startsWith(q+" "))score=100;
        else if(name.includes(q))score=80;
        else if(ks.some(k=>k===q))score=70;
        else if(ks.some(k=>k.includes(q)))score=55;
        return {normalized,score};
      }catch{return null;}
    })
    .filter((x):x is {normalized:ReturnType<typeof normaliseMatvaretabellenFood>;score:number}=>Boolean(x)&&x.score>0)
    .sort((a,b)=>b.score-a.score||a.normalized.foodName.length-b.normalized.foodName.length)
    .slice(0,Math.max(1,Math.min(limit,12)))
    .map(x=>x.normalized);
}

function exactMatvaretabellen(payload:unknown,id:string){
  for(const food of unwrapFoods(payload)){
    if(clean(food.foodId,80)===id){
      try{return normaliseMatvaretabellenFood(food);}catch{return null;}
    }
  }
  return null;
}

async function readSnapshot(ctx:PagesContext){
  const request=new Request(SOURCE_URL,{headers:{accept:"application/json"}});
  let cache:Cache|undefined;
  try{cache=(caches as unknown as {default?:Cache}).default;}catch{cache=undefined;}
  const cached=cache?await cache.match(request):undefined;
  if(cached){
    return {response:cached,cacheState:"HIT" as const};
  }
  const upstream=await fetch(request);
  if(!upstream.ok)throw new Error(`MATVARETABELLEN_HTTP_${upstream.status}`);
  if(cache){
    const headers=new Headers(upstream.headers);
    headers.set("cache-control",`public, max-age=${CACHE_SECONDS}`);
    const stored=new Response(upstream.clone().body,{status:upstream.status,statusText:upstream.statusText,headers});
    const write=cache.put(request,stored).catch(()=>undefined);
    if(ctx.waitUntil)ctx.waitUntil(write); else void write;
  }
  return {response:upstream,cacheState:"MISS" as const};
}

export const onRequestGet=async(ctx:PagesContext):Promise<Response>=>{
  const url=new URL(ctx.request.url);
  const query=clean(url.searchParams.get("q"),120);
  const id=clean(url.searchParams.get("id"),80);
  if(!query&&!id)return json({ok:false,error:"QUERY_OR_ID_REQUIRED"},400);
  if(query&&query.length<2)return json({ok:false,error:"QUERY_TOO_SHORT"},400);

  try{
    const {response,cacheState}=await readSnapshot(ctx);
    const payload=await response.json();
    const retrievedAt=new Date().toISOString();
    const lastModified=response.headers.get("last-modified");
    const etag=response.headers.get("etag");
    const sourceVersion=etag||lastModified||"UNVERSIONED_ANNUAL_SOURCE";

    const source={
      id:"matvaretabellen",
      publisher:"Mattilsynet",
      exactDataset:SOURCE_URL,
      apiDocumentation:SOURCE_API,
      sourceHome:SOURCE_HOME,
      adapterVersion:ADAPTER_VERSION,
      retrievedAt,
      sourceVersion,
      lastModified,
      cacheState,
      cachePolicy:"4PLANET server-side source snapshot; 30-day edge cache. Matvaretabellen states annual autumn updates and permits local caching.",
      publicationVersion:"Matvaretabellen 2026",
      licence:"COPYRIGHTED_GENERAL_USE_WITH_CLEAR_SOURCE_CITATION",
      commercialReuse:"NOT_EXPLICITLY_STATED_AS_A_SEPARATE_LICENCE_GRANT_ON_THE_CITED_API_OR_COPYRIGHT_PAGES",
      redistribution:"TABLE_VALUES_AND_TEXT_REQUIRE_CLEAR_SOURCE_CITATION; IMAGE_RIGHTS_SEPARATE",
      attribution:"Matvaretabellen 2026. Mattilsynet. www.matvaretabellen.no",
      accessCost:"FREE_PUBLIC_API",
      rateLimit:"NOT_STATED_BY_PUBLISHER_ON_API_PAGE",
      canonicalObjectMapping:"generic-food:matvaretabellen:<foodId>; branded-product relation remains USER_CONFIRMED only",
      scope:"GENERIC_FOOD_COMPOSITION_REFERENCE_NOT_BRANDED_PRODUCT",
      truthBoundary:"A branded product is never joined to this generic reference automatically. The user must explicitly confirm the generic reference.",
    };

    if(id){
      const food=exactMatvaretabellen(payload,id);
      return food?json({ok:true,source,food}):json({ok:true,source,food:null,state:"NOT_FOUND"},200);
    }
    return json({ok:true,source,query,matches:searchMatvaretabellen(payload,query,8)});
  }catch(error){
    return json({ok:false,error:"SOURCE_UNAVAILABLE",detail:error instanceof Error?error.message:"Matvaretabellen unavailable"},503);
  }
};

export const onRequest=async(ctx:PagesContext):Promise<Response>=>{
  if(ctx.request.method==="GET")return onRequestGet(ctx);
  return json({ok:false,error:"METHOD_NOT_ALLOWED"},405);
};
