import { C, LAYERS } from "./layers";

let installed=false;

/**
 * Resource-compounding layers that reuse external public infrastructure without
 * creating a second ATLAS state model. First slice is intentionally Norway-
 * bounded while the source contract, visual density and ownership drill-down
 * are proven.
 */
export function installAtlasResourceExtensions(){
  if(installed)return;
  const layers=LAYERS as any[];
  if(!layers.some((layer)=>layer.id==="gem-energy-no")){
    layers.push({
      id:"gem-energy-no",
      dom:"S4PIENS",
      group:"PLACES",
      kind:"point",
      domain:["PLANET","S4PIENS","E4RTH"],
      label:"ENERGY INFRASTRUCTURE · GEM",
      color:C.amber,
      src:"Global Energy Monitor",
      r:4,
      note:"Norway proof: source-grounded energy and industrial assets from Global Energy Monitor. Asset records can be traversed into GEM ownership graphs. Asset ≠ emissions, owner ≠ responsibility, and missing ownership ≠ no owner.",
      load:async()=>{
        const response=await fetch("/api/gem-assets?country=Norway&limit=250");
        const payload=await response.json();
        if(!response.ok||!payload?.ok||!Array.isArray(payload.assets))throw new Error("GEM_ASSET_SOURCE_UNAVAILABLE");
        return payload.assets
          .filter((asset:any)=>Number.isFinite(Number(asset.lat))&&Number.isFinite(Number(asset.lon)))
          .map((asset:any)=>{
            const owner=asset.directOwnerName?String(asset.directOwnerName):"OPEN OWNERSHIP GRAPH";
            const capacity=Number.isFinite(Number(asset.capacity))
              ? `${Number(asset.capacity).toLocaleString()} ${asset.capacityUnit||""}`.trim()
              : "CAPACITY NOT IN THIS RECORD";
            const status=asset.operatingStatus||"STATUS NOT IN THIS RECORD";
            const assetType=String(asset.assetType||"ENERGY / INDUSTRIAL ASSET").replace(/[-_]/g," ").toUpperCase();
            return {
              lon:Number(asset.lon),lat:Number(asset.lat),size:4,
              gemAssetId:asset.id,
              ownershipEndpoint:asset.ownershipEndpoint,
              html:`<b class="nm">${String(asset.name).replace(/[&<>"']/g,"")}</b><br><span class="lat">${assetType} · ${status}</span><br><span class="lat">${capacity}</span><br><span class="lat">OWNER · ${owner}</span><br><span class="lat">GEM ASSET · ${asset.id}</span><br><span class="lat">OWNERSHIP GRAPH AVAILABLE · SOURCE-BOUND</span>`
            };
          });
      }
    });
  }
  installed=true;
}
