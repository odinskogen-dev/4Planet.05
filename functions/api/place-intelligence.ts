/**
 * GET /api/place-intelligence?slug=oslofjord
 *
 * First bounded PLACE CELL. It composes existing 4PLANET source adapters
 * instead of creating another source authority.
 */
interface PagesContext { request: Request; }

const PLACE={
  oslofjord:{
    id:"place:4p:oslofjord",
    name:"Oslofjord",
    kind:"MARINE_AREA",
    bbox:[9.9,58.8,11.1,60.0] as const,
    center:[10.55,59.45] as const,
    atlasZoom:6.3,
  },
} as const;

const json=(body:unknown,status=200)=>new Response(JSON.stringify(body),{status,headers:{
  "content-type":"application/json; charset=utf-8",
  "cache-control":"public, max-age=900",
  "x-content-type-options":"nosniff",
  "access-control-allow-origin":"*",
}});

const inside=(lon:number,lat:number,bbox:readonly [number,number,number,number])=>
  Number.isFinite(lon)&&Number.isFinite(lat)&&lon>=bbox[0]&&lon<=bbox[2]&&lat>=bbox[1]&&lat<=bbox[3];

async function read(url:URL){
  const r=await fetch(url,{headers:{accept:"application/json","user-agent":"4PLANET PLACE CELL composition"}});
  const payload=await r.json().catch(()=>null);
  if(!r.ok||!payload?.ok) throw new Error(payload?.error||("HTTP_"+r.status));
  return payload;
}

export const onRequestGet=async({request}:PagesContext)=>{
  const u=new URL(request.url);
  const slug=(u.searchParams.get("slug")||"").trim().toLowerCase();
  const place=(PLACE as any)[slug];
  if(!place)return json({ok:false,error:"PLACE_NOT_SUPPORTED"},404);

  const gemUrl=new URL("/api/gem-assets?country=Norway&limit=250",u.origin);
  const traceUrl=new URL("/api/climate-trace?countries=NOR&sectors=power&limit=1200&year=2024&gas=co2e_100yr",u.origin);
  const [gemResult,traceResult]=await Promise.allSettled([read(gemUrl),read(traceUrl)]);

  const gemPayload=gemResult.status==="fulfilled"?gemResult.value:null;
  const tracePayload=traceResult.status==="fulfilled"?traceResult.value:null;

  const gemAssets=(Array.isArray(gemPayload?.assets)?gemPayload.assets:[])
    .filter((a:any)=>inside(Number(a.lon),Number(a.lat),place.bbox))
    .slice(0,60)
    .map((a:any)=>({
      id:a.id,name:a.name,assetType:a.assetType??null,operatingStatus:a.operatingStatus??null,
      capacity:a.capacity??null,capacityUnit:a.capacityUnit??null,
      directOwnerName:a.directOwnerName??null,directOwnerId:a.directOwnerId??null,
      lat:a.lat,lon:a.lon,ownershipEndpoint:a.ownershipEndpoint??null,
    }));

  const traceSources=(Array.isArray(tracePayload?.assets)?tracePayload.assets:[])
    .filter((a:any)=>inside(Number(a.lon),Number(a.lat),place.bbox))
    .slice(0,60)
    .map((a:any)=>({
      id:a.id,name:a.name,sector:a.sector??null,subsector:a.subsector??null,
      co2e:a.co2e??null,year:a.year??null,gas:a.gas??null,lat:a.lat,lon:a.lon,
    }));

  const sourceState={
    globalEnergyMonitor:gemResult.status==="fulfilled"?"AVAILABLE":"UNAVAILABLE",
    climateTrace:traceResult.status==="fulfilled"?"AVAILABLE":"UNAVAILABLE",
    worldPop:"REGISTERED_NOT_ACTIVE",
    buildings:"REGISTERED_NOT_ACTIVE",
    alphaEarth:"REGISTERED_NOT_ACTIVE",
  };

  return json({
    ok:true,
    state:gemResult.status==="fulfilled"||traceResult.status==="fulfilled"?"PARTIAL_LIVE_PLACE_INTELLIGENCE":"SOURCE_UNAVAILABLE",
    place,
    live:{
      energyInfrastructure:{count:gemAssets.length,records:gemAssets.slice(0,12)},
      powerEmissionSources:{count:traceSources.length,records:traceSources.slice(0,12),coverage:"Climate TRACE power-sector source records for 2024, filtered to the PLACE navigation bbox."},
    },
    sourceState,
    atlasUrl:"/atlas?m=PLANET&l=gem-energy-no&z=6.3&c=10.55,59.45",
    retrievedAt:new Date().toISOString(),
    truthBoundary:"This PLACE CELL is a source-grounded composition, not a complete assessment. The bbox is navigation geometry. GEM infrastructure records do not by themselves prove emissions or responsibility; Climate TRACE source-level emissions are estimates/observations under their own methodology. Missing records mean source coverage or query absence, not real-world absence. Population, building and AlphaEarth layers remain registered but are not presented as live until their adapters are proven."
  });
};

export const onRequest=async(ctx:PagesContext)=>ctx.request.method==="GET"?onRequestGet(ctx):json({ok:false,error:"METHOD_NOT_ALLOWED"},405);
