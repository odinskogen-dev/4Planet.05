import { html } from "./founder-ui.js";

const SB_URL = "https://ghvdzetmplqkdtfqiror.supabase.co";
const SB_PUBLISHABLE = "sb_publishable_H6TT_u7YO4DVlvQdCJ06mA_VEvgxsOE";
const BASE = "/os";
const PRIVATE_FUNCTION = SB_URL + "/functions/v1/private-os-read";
const noStore = {
  "Cache-Control":"private, no-store, max-age=0",
  "X-Robots-Tag":"noindex, nofollow, noarchive",
  "X-Content-Type-Options":"nosniff",
  "Referrer-Policy":"no-referrer",
  "Permissions-Policy":"camera=(), microphone=(), geolocation=()"
};



export async function handlePrivateOS(request, incoming) {
  const path=incoming.pathname;
  if (path === BASE+"/_status") return Response.json({
    system:"4PLANET_LABS_OS",release:"PARTIAL",
    privateBrainEndpoint:true,founderBrowserLoginVerified:false,
    fullDrivePortfolioHydrated:false,automaticDriveSyncVerified:false
  },{headers:noStore});
  if (path===BASE+"/api/brain") {
    if(request.method!=="GET")return new Response("Method not allowed",{status:405,headers:noStore});
    const bearer=request.headers.get("Authorization")||"";
    if(!/^Bearer [a-zA-Z0-9._~-]+$/.test(bearer))
      return Response.json({error:"AUTH_REQUIRED"},{status:401,headers:noStore});
    try {
      const response=await fetch(PRIVATE_FUNCTION,{
        method:"GET",
        headers:{"Authorization":bearer,"apikey":SB_PUBLISHABLE},
        redirect:"manual"
      });
      const headers=new Headers(noStore);headers.set("Content-Type","application/json; charset=utf-8");
      if(![200,401,403,503].includes(response.status))return Response.json({error:"SOURCE_UNAVAILABLE"},{status:503,headers});
      return new Response(request.method==="HEAD"?null:response.body,{status:response.status,headers});
    }catch{return Response.json({error:"SOURCE_UNAVAILABLE"},{status:503,headers:noStore});}
  }
  if (request.method!=="GET" && request.method!=="HEAD")
    return new Response("Method not allowed",{status:405,headers:{...noStore,Allow:"GET, HEAD"}});
  if(path!==BASE && path!==BASE+"/")return new Response("Not found",{status:404,headers:noStore});
  const nonce=crypto.randomUUID().replaceAll("-","");
  const headers=new Headers(noStore);
  headers.set("Content-Type","text/html; charset=utf-8");
  headers.set("Content-Security-Policy","default-src 'none'; script-src 'nonce-"+nonce+"'; style-src 'nonce-"+nonce+"'; connect-src 'self' "+SB_URL+"; frame-src 'self'; img-src 'self' data:; base-uri 'none'; form-action 'self'; frame-ancestors 'none'");
  const safeHTML=html.replaceAll("<style>","<style nonce=\\\""+nonce+"\\\">").replace("<script>","<script nonce=\\\""+nonce+"\\\">");
  return new Response(request.method==="HEAD"?null:safeHTML,{status:200,headers});
}
