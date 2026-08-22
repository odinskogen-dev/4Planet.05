import { useState } from "react";
import { Link } from "react-router-dom";
import { PublicShell } from "@/components/layout/PublicShell";
import { T } from "@/styles/tokens";

const ACCENT="#FF4D22";
const SYSTEMS=[
 {id:"food",label:"FOOD_",meta:"OPEN",x:50,y:15},
 {id:"water",label:"WATER_",meta:"DEPENDENCY",x:24,y:27},
 {id:"energy",label:"EN4RGY_",meta:"SYSTEM",x:76,y:27},
 {id:"materials",label:"MATERIALS_",meta:"SYSTEM",x:12,y:54},
 {id:"fashion",label:"F4SHION_",meta:"SYSTEM",x:88,y:54},
 {id:"home",label:"HOME_",meta:"SYSTEM",x:26,y:82},
 {id:"circular",label:"CIRCULARITY_",meta:"SYSTEM",x:74,y:82},
] as const;
const FOOD=["AGRICULTURE","POLLINATION","SOIL","FRESHWATER","CLIMATE","FERTILISER","TRANSPORT","SPECIES","ACTORS","INNOVATIONS"] as const;
const mono:React.CSSProperties={fontFamily:T.mono,fontSize:10.5,letterSpacing:".14em",textTransform:"uppercase"};
const display:React.CSSProperties={fontFamily:T.display,fontWeight:500,letterSpacing:"-.05em"};

export default function SapiensGold(){
 const [food,setFood]=useState(false);
 return <PublicShell><main style={{background:"#050505",color:"#fff"}}>
  <section style={{minHeight:"100svh",padding:"clamp(110px,14vw,190px) clamp(20px,5vw,72px) clamp(70px,9vw,120px)",maxWidth:1440,margin:"0 auto"}}>
   <div style={{...mono,color:ACCENT}}>S4PIENS_ · HOMO SAPIENS · HUMAN SYSTEMS</div>
   <div className="sapiens-intro" style={{display:"grid",gridTemplateColumns:"minmax(0,1fr) minmax(300px,.62fr)",gap:"clamp(32px,7vw,110px)",alignItems:"end",marginTop:18}}>
    <h1 style={{...display,margin:0,fontSize:"clamp(52px,9vw,132px)",lineHeight:.82,maxWidth:"8ch"}}>What does a human need?</h1>
    <div><p style={{margin:0,color:"rgba(255,255,255,.78)",fontSize:"clamp(17px,1.6vw,21px)",lineHeight:1.62}}>Put our own species back inside the living system. Start with a human need, then follow the living processes, supply chains, pressures, actors and innovations around it.</p><p style={{...mono,color:"rgba(255,255,255,.4)",marginTop:22}}>BIOLOGICAL INTERACTION = INTERFACE GRAMMAR · NOT ECOLOGICAL EVIDENCE</p></div>
   </div>

   <div className={`sapiens-field ${food?"is-food":""}`} style={{position:"relative",minHeight:"clamp(620px,70vw,820px)",marginTop:"clamp(48px,7vw,94px)",borderTop:"1px solid rgba(255,255,255,.14)",borderBottom:"1px solid rgba(255,255,255,.14)",overflow:"hidden"}}>
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden style={{position:"absolute",inset:0,width:"100%",height:"100%"}}>{SYSTEMS.map((n)=><line key={n.id} x1="50" y1="50" x2={n.x} y2={n.y} style={{stroke:n.id==="food"&&food?ACCENT:"rgba(255,255,255,.15)",strokeWidth:n.id==="food"&&food?1:.35,vectorEffect:"non-scaling-stroke",transition:"stroke .5s ease,stroke-width .5s ease"}}/>)}</svg>
    <div style={{position:"absolute",left:"50%",top:"50%",transform:"translate(-50%,-50%)",width:"clamp(170px,22vw,280px)",aspectRatio:1,border:"1px solid rgba(255,255,255,.65)",borderRadius:"50%",display:"grid",placeContent:"center",textAlign:"center",background:"#050505",zIndex:2}}><span style={{...mono,color:ACCENT}}>SPECIES_</span><strong style={{...display,fontSize:"clamp(28px,4vw,54px)",lineHeight:.88,marginTop:10}}>HOMO<br/>SAPIENS</strong><small style={{...mono,color:"rgba(255,255,255,.42)",marginTop:12}}>STABLE REFERENCE</small></div>
    {SYSTEMS.map((n)=><button key={n.id} type="button" onClick={()=>n.id==="food"&&setFood((v)=>!v)} aria-pressed={n.id==="food"?food:undefined} style={{position:"absolute",left:`${n.x}%`,top:`${n.y}%`,transform:"translate(-50%,-50%)",minWidth:110,padding:"12px 14px",border:`1px solid ${n.id==="food"?ACCENT:"rgba(255,255,255,.24)"}`,background:n.id==="food"&&food?ACCENT:"rgba(5,5,5,.9)",color:n.id==="food"&&food?"#050505":"#fff",cursor:n.id==="food"?"pointer":"default",textAlign:"left",zIndex:3,transition:"transform .35s ease,background .35s ease"}}><span style={{...mono,fontSize:8,opacity:.62}}>{n.meta}</span><strong style={{display:"block",fontFamily:T.display,fontSize:15,marginTop:7}}>{n.label}</strong></button>)}
   </div>
  </section>

  <section id="food" style={{background:food?ACCENT:"#fff",color:food?"#050505":T.ink,transition:"background .55s ease,color .55s ease"}}>
   <div style={{maxWidth:1320,margin:"0 auto",padding:"clamp(78px,10vw,146px) clamp(20px,5vw,72px)"}}>
    <div style={{...mono,color:food?"#050505":ACCENT}}>FOOD_ · FIRST OPEN HUMAN SYSTEM</div>
    <h2 style={{...display,margin:"16px 0 0",fontSize:"clamp(46px,7vw,102px)",lineHeight:.89,maxWidth:"12ch"}}>Food is not one industry. It is a dependency network.</h2>
    <p style={{margin:"26px 0 0",maxWidth:760,fontSize:"clamp(17px,1.6vw,21px)",lineHeight:1.65,opacity:.78}}>Agriculture depends on soil, freshwater, climate, pollination and species. It is also shaped by fertiliser, transport, companies, policy and innovation. S4PIENS makes those connections navigable without pretending one diagram proves causality.</p>
    <div className="food-node-grid" style={{display:"grid",gridTemplateColumns:"repeat(5,minmax(0,1fr))",gap:1,background:food?"rgba(5,5,5,.25)":T.lineStrong,marginTop:"clamp(38px,6vw,72px)"}}>{FOOD.map((n)=><div key={n} style={{minHeight:132,padding:18,background:food?"rgba(255,77,34,.92)":"#fff",display:"flex",flexDirection:"column",justifyContent:"space-between"}}><span style={{...mono,fontSize:8,opacity:.6}}>CONNECTED SYSTEM</span><strong style={{fontFamily:T.display,fontWeight:500,fontSize:"clamp(16px,1.6vw,21px)"}}>{n}</strong></div>)}</div>
    <div style={{display:"flex",gap:18,flexWrap:"wrap",marginTop:38}}><a href="https://s4piens.com" style={{...mono,color:food?"#050505":T.ink,textDecoration:"none",borderBottom:"1px solid currentColor",paddingBottom:5}}>OPEN S4PIENS.COM →</a><Link to="/species" style={{...mono,color:food?"#050505":T.ink,textDecoration:"none",borderBottom:"1px solid currentColor",paddingBottom:5}}>MEET LIFE →</Link><Link to="/living-systems" style={{...mono,color:food?"#050505":T.ink,textDecoration:"none",borderBottom:"1px solid currentColor",paddingBottom:5}}>FOLLOW DEPENDENCIES →</Link></div>
   </div>
  </section>
  <style>{`.sapiens-field button:focus-visible{outline:3px solid #fff;outline-offset:4px}.sapiens-field.is-food button[aria-pressed="true"]{transform:translate(-50%,-50%) scale(1.08)}@media(max-width:900px){.sapiens-intro{grid-template-columns:1fr!important}.food-node-grid{grid-template-columns:repeat(2,minmax(0,1fr))!important}}@media(max-width:600px){.sapiens-field{min-height:660px!important}.sapiens-field button{min-width:78px!important;padding:9px!important}.sapiens-field button strong{font-size:11px!important}.food-node-grid{grid-template-columns:1fr!important}}@media(prefers-reduced-motion:reduce){.sapiens-field *{transition:none!important}}`}</style>
 </main></PublicShell>;
}
