import { identityLoginUrl } from "@/identity/identityClient";

export default function CompanyBrainSignIn({onMessage}:{onMessage:(message:string)=>void}){
 const returnTo=typeof window!=="undefined"?window.location.origin+window.location.pathname+"#company-brain":"https://4brands.org/#company-brain";
 const signIn=identityLoginUrl(returnTo);
 const signUp=`https://id.4planet.org/login?mode=signup&return_to=${encodeURIComponent(returnTo)}`;
 return <div style={{display:"flex",gap:8,flexWrap:"wrap",marginTop:16,alignItems:"center"}}>
  <a href={signIn} onClick={()=>onMessage("Continue through 4PLANET ID, then return here.")} style={{border:"1px solid #0a0a0a",background:"#0a0a0a",color:"#fff",padding:"12px 14px",textDecoration:"none",font:"10px Fragment Mono, ui-monospace, monospace"}}>SIGN IN WITH 4PLANET ID</a>
  <a href={signUp} style={{border:"1px solid #bdbdb7",background:"#fff",color:"#111",padding:"12px 14px",textDecoration:"none",font:"10px Fragment Mono, ui-monospace, monospace"}}>CREATE 4PLANET ID</a>
 </div>;
}
