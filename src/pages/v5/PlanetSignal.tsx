import { FormEvent, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { PublicShell } from "@/components/layout/PublicShell";
import { Seo } from "@/components/Seo";
import { trackEvent } from "@/analytics/Analytics";
import { T } from "@/styles/tokens";

const mono: React.CSSProperties = { fontFamily: T.mono, fontSize: 10, letterSpacing: ".14em", textTransform: "uppercase" };
const issues = [
  ["KENYA", "One country. Many living systems.", "/place/kenya"],
  ["ORCA", "A reported observation is not a live location.", "/species/orca"],
  ["OSLOFJORD", "A living system under pressure.", "/living-systems/oslofjord"],
  ["GREAT BARRIER REEF", "Heat signals, coral and uncertainty.", "/living-systems/great-barrier-reef"],
  ["JAGUAR", "Follow a species into place and evidence.", "/species/jaguar"],
] as const;

export default function PlanetSignal() {
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [ready, setReady] = useState<boolean | null>(null);
  const [state, setState] = useState<"idle"|"sending"|"success"|"error">("idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/planet-signal", { headers: { accept: "application/json" } })
      .then((r) => r.ok ? r.json() : Promise.reject())
      .then((data) => setReady(data.ready === true))
      .catch(() => setReady(false));
  }, []);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!consent || !email.trim() || state === "sending") return;
    setState("sending"); setMessage("");
    try {
      const response = await fetch("/api/planet-signal", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email: email.trim(), consent: true, company: "" }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || data.subscribed !== true) throw new Error(data.error || "signup_failed");
      setState("success");
      setMessage("You’re on the PLANET SIGNAL list.");
      trackEvent("email_signup", { product_area: "4planet", signup_surface: "planet_signal" });
    } catch (error) {
      setState("error");
      setMessage(error instanceof Error && error.message === "not_configured"
        ? "PLANET SIGNAL signup is not collecting yet."
        : "Signup could not be completed. Please try again later.");
    }
  }

  return <PublicShell>
    <Seo title="PLANET SIGNAL — One useful signal from the living planet | 4PLANET"
      description="Occasional source-grounded signals about a place, species or ecological change — with one clear path back into 4PLANET."
      path="/signal" robots="noindex,follow" />
    <main style={{ minHeight:"100vh", background:"#fff", color:T.ink }}>
      <section style={{ background:"#080808", color:"#fff", padding:"clamp(48px,8vw,112px) clamp(20px,6vw,84px)" }}>
        <div style={{...mono,color:T.acid}}>4PLANET_ / PLANET SIGNAL</div>
        <h1 style={{fontFamily:T.display,fontWeight:500,fontSize:"clamp(62px,12vw,170px)",lineHeight:.82,letterSpacing:"-.07em",margin:"26px 0 0",maxWidth:"8ch"}}>One signal worth seeing.</h1>
        <p style={{fontSize:"clamp(18px,2vw,26px)",lineHeight:1.5,color:"rgba(255,255,255,.72)",maxWidth:760,marginTop:34}}>
          One exceptionally interesting place, species, relationship or ecological development. Short, useful, source-grounded — and connected to the living planet in ATLAS.
        </p>
      </section>

      <section style={{padding:"clamp(42px,7vw,92px) clamp(20px,6vw,84px)",display:"grid",gridTemplateColumns:"minmax(0,1fr) minmax(300px,.8fr)",gap:"clamp(36px,8vw,120px)"}}>
        <div>
          <div style={{...mono,color:T.blue}}>WHAT YOU’LL GET</div>
          <h2 style={{fontFamily:T.display,fontWeight:500,fontSize:"clamp(38px,5vw,72px)",letterSpacing:"-.05em",lineHeight:.94,margin:"14px 0 0"}}>Not a corporate newsletter.</h2>
          <p style={{fontSize:18,lineHeight:1.65,color:T.dim,maxWidth:650,marginTop:22}}>Each issue starts with a real public 4PLANET object, preserves its source limits, and gives you one clear way to explore further.</p>
          <div style={{marginTop:34,borderTop:`1px solid ${T.line}`}}>
            {issues.map(([eyebrow,title,to])=><Link key={eyebrow} to={to} style={{display:"block",padding:"20px 0",borderBottom:`1px solid ${T.line}`,textDecoration:"none",color:T.ink}}>
              <span style={{...mono,color:T.blue}}>{eyebrow}</span><strong style={{display:"block",fontFamily:T.display,fontWeight:500,fontSize:25,marginTop:7}}>{title}</strong>
            </Link>)}
          </div>
        </div>

        <aside style={{border:`1px solid ${T.lineStrong}`,padding:"clamp(24px,4vw,42px)",alignSelf:"start"}}>
          <div style={{...mono,color:ready===true?"#178A4B":T.dim}}>{ready===null?"CHECKING SIGNUP":ready?"SIGNUP READY":"SIGNUP NOT YET CONNECTED"}</div>
          <h2 style={{fontFamily:T.display,fontWeight:500,fontSize:38,letterSpacing:"-.04em",margin:"16px 0 0"}}>Follow the signal.</h2>
          <form onSubmit={submit} style={{marginTop:26}}>
            <label style={{display:"block",fontSize:13,fontWeight:600}}>Email</label>
            <input type="email" required value={email} onChange={(e)=>setEmail(e.target.value)} autoComplete="email"
              style={{width:"100%",boxSizing:"border-box",marginTop:8,border:`1px solid ${T.lineStrong}`,padding:"14px 12px",fontSize:16,fontFamily:"DM Sans, Arial, Helvetica, sans-serif"}} />
            <input tabIndex={-1} aria-hidden name="company" autoComplete="off" style={{position:"absolute",left:"-10000px",width:1,height:1}} />
            <label style={{display:"flex",gap:10,alignItems:"flex-start",fontSize:13,lineHeight:1.5,color:T.dim,marginTop:16}}>
              <input type="checkbox" checked={consent} onChange={(e)=>setConsent(e.target.checked)} style={{marginTop:3}} />
              <span>I want to receive PLANET SIGNAL emails from 4PLANET. I can unsubscribe at any time.</span>
            </label>
            <button type="submit" disabled={!consent||!email.trim()||state==="sending"||ready===false}
              style={{width:"100%",marginTop:20,padding:"14px 18px",border:0,background:"#080808",color:"#fff",fontFamily:T.mono,letterSpacing:".12em",cursor:"pointer",opacity:(!consent||!email.trim()||ready===false)?.5:1}}>
              {state==="sending"?"JOINING…":"JOIN PLANET SIGNAL →"}
            </button>
            {message && <p role="status" style={{fontSize:13,lineHeight:1.5,color:state==="success"?"#178A4B":"#9A3A25",marginTop:14}}>{message}</p>}
            <p style={{fontSize:11,lineHeight:1.55,color:T.dim,marginTop:14}}>Email is used only for this consented subscription. Private 4PLANET ID, Personal Brain and product decisions are not part of this list.</p>
          </form>
        </aside>
      </section>
    </main>
    <style>{`@media(max-width:760px){main section:nth-of-type(2){grid-template-columns:1fr!important}}`}</style>
  </PublicShell>;
}
