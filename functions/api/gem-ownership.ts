/**
 * GET /api/gem-ownership?root=<GEM asset/entity id>&direction=up&max_depth=8
 * Source-preserving ownership traversal. Never auto-promotes a GEM entity to a
 * 4PLANET legal-company identity without an independently verified crosswalk.
 */
interface PagesContext { request: Request; }
const BASE="https://api.globalenergymonitor.org";
const ROOT=/^[A-Za-z0-9_.:-]{1,120}$/;
const json=(body:unknown,status=200)=>new Response(JSON.stringify(body),{status,headers:{
  "content-type":"application/json; charset=utf-8","cache-control":"public, max-age=3600","x-content-type-options":"nosniff","access-control-allow-origin":"*"
}});
export const onRequestGet=async({request}:PagesContext)=>{
  const u=new URL(request.url);
  const root=(u.searchParams.get("root")||"").trim();
  const direction=u.searchParams.get("direction")==="down"?"down":"up";
  const maxDepth=Math.max(1,Math.min(Number.parseInt(u.searchParams.get("max_depth")||"8",10)||8,12));
  if(!ROOT.test(root))return json({ok:false,error:"VALID_ROOT_REQUIRED"},400);
  const upstream=new URL(BASE+"/ownership/graph");
  upstream.searchParams.set("root",root);
  upstream.searchParams.set("direction",direction);
  upstream.searchParams.set("max_depth",String(maxDepth));
  try{
    const r=await fetch(upstream,{headers:{accept:"application/json","user-agent":"4PLANET ATLAS bounded GEM ownership read"}});
    if(!r.ok)return json({ok:false,error:`GEM_UPSTREAM_${r.status}`},502);
    const graph=await r.json();
    return json({
      ok:true,root,direction,maxDepth,graph,
      source:{publisher:"Global Energy Monitor",product:"Ownership Tracing API · unified ownership graph",endpoint:upstream.toString(),retrievedAt:new Date().toISOString(),attribution:"Global Energy Monitor"},
      truthBoundary:"This is GEM's sourced ownership graph. 4PLANET does not silently convert names into legal-company identity, beneficial-ownership conclusions, responsibility or investment exposure. LEI/PermID/national identifiers should be used for verified crosswalks."
    });
  }catch(error){
    return json({ok:false,error:"GEM_SOURCE_UNAVAILABLE",detail:error instanceof Error?error.message:"GEM unavailable"},503);
  }
};
export const onRequest=async(ctx:PagesContext)=>ctx.request.method==="GET"?onRequestGet(ctx):json({ok:false,error:"METHOD_NOT_ALLOWED"},405);
