import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";

const STORAGE = "4planet.analytics.consent.v1";
const GA_ID = "G-Q79Y9HJRL8";
const DOMAINS = ["4planet.org", "4planetmagazine.com", "s4piens.com", "cre4tors.com", "4planetmarket.com"] as const;
type Consent = "granted" | "denied" | null;
type Gtag = (...args: unknown[]) => void;

declare global { interface Window { dataLayer?: unknown[]; gtag?: Gtag; } }
const host = () => window.location.hostname.toLowerCase().replace(/^www\./, "");
const allowed = () => DOMAINS.includes(host() as (typeof DOMAINS)[number]) && !host().endsWith(".pages.dev");
const read = (): Consent => { const v = localStorage.getItem(STORAGE); return v === "granted" || v === "denied" ? v : null; };
function gtagReady() { window.dataLayer = window.dataLayer || []; if (!window.gtag) window.gtag = function(){ window.dataLayer?.push(arguments); } as Gtag; }
function consent(v: "granted" | "denied") { gtagReady(); window.gtag?.("consent", "update", { analytics_storage:v, ad_storage:"denied", ad_user_data:"denied", ad_personalization:"denied" }); }
function install() { if (document.getElementById("4planet-ga4")) return; gtagReady(); window.gtag?.("set","linker",{domains:[...DOMAINS],decorate_forms:true}); window.gtag?.("js",new Date()); window.gtag?.("config",GA_ID,{send_page_view:false,allow_google_signals:false,allow_ad_personalization_signals:false}); const s=document.createElement("script"); s.id="4planet-ga4"; s.async=true; s.src=`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`; document.head.appendChild(s); }
export function Analytics(){ const location=useLocation(); const ok=useMemo(allowed,[]); const [state,setState]=useState<Consent>(read);
  useEffect(()=>{ if(!ok)return; gtagReady(); window.gtag?.("consent","default",{analytics_storage:"denied",ad_storage:"denied",ad_user_data:"denied",ad_personalization:"denied",wait_for_update:500}); if(state==="denied") consent("denied"); },[ok,state]);
  useEffect(()=>{ if(!ok||state!=="granted")return; consent("granted"); install(); window.gtag?.("event","page_view",{page_title:document.title,page_location:window.location.href,page_path:`${location.pathname}${location.search}`,content_group:"s4piens",site_host:host()}); },[ok,state,location.pathname,location.search]);
  if(!ok||state!==null)return null; const decide=(v:"granted"|"denied")=>{localStorage.setItem(STORAGE,v);consent(v);setState(v);};
  return <aside role="region" aria-label="Analytics preferences" style={{position:"fixed",left:12,right:12,bottom:12,zIndex:9999,maxWidth:760,margin:"0 auto",padding:"14px 16px",display:"flex",justifyContent:"space-between",gap:18,background:"#080808",color:"#fff",border:"1px solid rgba(255,255,255,.2)",fontSize:13}}><span>Allow optional usage analytics to help improve 4PLANET. Advertising signals are disabled.</span><span style={{display:"flex",gap:8}}><button onClick={()=>decide("denied")}>DECLINE</button><button onClick={()=>decide("granted")}>ALLOW</button></span></aside>;
}
