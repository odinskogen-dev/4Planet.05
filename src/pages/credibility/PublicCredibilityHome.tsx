import type { CSSProperties } from "react";
import { Link } from "react-router-dom";
import { PublicShell } from "@/components/layout/PublicShell";
import { img } from "@/content/imageRegistry";
import { T } from "@/styles/tokens";

const hero = img("heroEarth");

const proofPaths = [
  {
    eyebrow: "01 / LIFE",
    title: "ORCA",
    body: "Begin with one animal. Follow a real source-reported observation into social, acoustic, food-web and place relationships — without turning one record into a population claim.",
    to: "/species/orca",
    action: "Follow the orca →",
  },
  {
    eyebrow: "02 / PLACE",
    title: "OSLOFJORDEN",
    body: "See one familiar fjord as a changing living system: species, pressures, official evidence, relationships and responses, each kept inside its real scope.",
    to: "/place/oslofjorden",
    action: "Enter Oslofjorden →",
  },
  {
    eyebrow: "03 / RELATIONSHIP",
    title: "BEE → APPLE",
    body: "Trace a hidden dependency from pollinators to pollination and one concrete food example — while keeping the limits of the claim visible.",
    to: "/living-systems/bee-pollination-food",
    action: "Reveal the relationship →",
  },
] as const;

export default function PublicCredibilityHome() {
  return (
    <PublicShell>
      <section className="cred-home-hero" style={{ minHeight: "calc(100svh - 64px)", display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(360px,.92fr)", borderBottom: `1px solid ${T.line}` }}>
        <div style={{ padding: "clamp(54px,8vw,112px) clamp(20px,5vw,72px)", display: "flex", flexDirection: "column", justifyContent: "space-between", gap: 44 }}>
          <div>
            <div style={{ ...mono, color: T.blue }}>4PLANET_ / LIVING PLANET INTELLIGENCE</div>
            <h1 style={{ ...display, margin: "clamp(44px,8vw,104px) 0 0", fontSize: "clamp(64px,10vw,152px)" }}>
              For a<br />Living Planet.
            </h1>
          </div>
          <div style={{ maxWidth: 760 }}>
            <p style={{ margin: 0, fontSize: "clamp(21px,2.35vw,32px)", lineHeight: 1.18, letterSpacing: "-.028em" }}>
              4PLANET helps make the living world easier to understand — how species, places, human systems and pressures connect, and where credible responses may be possible.
            </p>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 28 }}>
              <a href="#proof" style={primaryButton}>Explore the proof →</a>
              <Link to="/about" style={secondaryButton}>Why 4PLANET exists</Link>
            </div>
          </div>
        </div>

        <div style={{ minHeight: 580, position: "relative", overflow: "hidden", background: "#050505" }}>
          <picture>
            {hero.srcMobile && <source media="(max-width:760px)" srcSet={hero.srcMobile} />}
            <img src={hero.src} alt={hero.alt} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: hero.objectPosition }} />
          </picture>
          <div aria-hidden style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg,rgba(0,0,0,.04),rgba(0,0,0,.42))" }} />
          <div style={{ position: "absolute", left: 20, right: 20, bottom: 18, color: "#fff", display: "flex", justifyContent: "space-between", gap: 18, flexWrap: "wrap" }}>
            <span style={mono}>EARTH / DOCUMENTARY REFERENCE</span>
            <span style={mono}>{hero.credit ?? "NASA"} · {hero.licenseNote ?? "PUBLIC DOMAIN"}</span>
          </div>
        </div>
      </section>

      <section id="proof" style={{ maxWidth: 1440, margin: "0 auto", padding: "clamp(76px,10vw,144px) clamp(20px,5vw,72px)" }}>
        <div style={{ ...mono, color: T.blue }}>THREE WAYS IN</div>
        <h2 style={{ ...display, margin: "20px 0 0", fontSize: "clamp(44px,6.5vw,92px)", maxWidth: 1080 }}>
          Start with life. Start with a place. Start with a relationship.
        </h2>
        <p style={{ margin: "28px 0 0", maxWidth: 780, fontSize: 18, lineHeight: 1.55, color: T.dim }}>
          The evidence is there when you need it. It should strengthen the story, not become the story.
        </p>

        <div className="cred-proof-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", borderTop: `1px solid ${T.ink}`, borderLeft: `1px solid ${T.ink}`, marginTop: 48 }}>
          {proofPaths.map((item) => (
            <Link key={item.title} to={item.to} style={{ minHeight: 390, padding: "clamp(22px,3vw,34px)", borderRight: `1px solid ${T.ink}`, borderBottom: `1px solid ${T.ink}`, color: T.ink, textDecoration: "none", display: "flex", flexDirection: "column" }}>
              <span style={{ ...mono, color: T.blue }}>{item.eyebrow}</span>
              <h3 style={{ ...display, fontSize: "clamp(36px,4.4vw,62px)", margin: "44px 0 0" }}>{item.title}</h3>
              <p style={{ margin: "18px 0 0", fontSize: 15.5, lineHeight: 1.55, color: T.dim }}>{item.body}</p>
              <span style={{ ...mono, color: T.blue, marginTop: "auto", paddingTop: 38 }}>{item.action}</span>
            </Link>
          ))}
        </div>
      </section>

      <section style={{ background: T.ink, color: "#fff", padding: "clamp(80px,10vw,150px) clamp(20px,5vw,72px)" }}>
        <div style={{ maxWidth: 1320, margin: "0 auto", display: "grid", gridTemplateColumns: "minmax(0,1.08fr) minmax(300px,.72fr)", gap: "clamp(40px,7vw,100px)" }}>
          <div>
            <div style={{ ...mono, color: T.acid }}>UNDERSTAND → RESPOND</div>
            <h2 style={{ ...display, margin: "18px 0 0", fontSize: "clamp(46px,7vw,96px)" }}>Action should begin where evidence is strong enough.</h2>
          </div>
          <div style={{ alignSelf: "end" }}>
            <p style={{ margin: 0, fontSize: 17, lineHeight: 1.6, color: "rgba(255,255,255,.76)" }}>
              4PLANET is building pathways from understanding to action. No public Impact pathway is open yet; delivery, evidence and reporting have to be real before support can be counted as impact.
            </p>
            <Link to="/impact" style={{ ...primaryButton, display: "inline-flex", marginTop: 24, background: "#fff", color: T.ink, borderColor: "#fff" }}>See pathways in development →</Link>
          </div>
        </div>
      </section>

      <style>{`@media(max-width:900px){.cred-proof-grid{grid-template-columns:1fr!important}}@media(max-width:760px){.cred-home-hero{grid-template-columns:1fr!important}.cred-home-hero>div:last-child{min-height:62svh!important}}`}</style>
    </PublicShell>
  );
}

const display: CSSProperties = { fontFamily: T.display, fontWeight: 500, letterSpacing: "-.058em", lineHeight: .9 };
const mono: CSSProperties = { fontFamily: T.mono, fontSize: 10.5, letterSpacing: ".11em", textTransform: "uppercase" };
const primaryButton: CSSProperties = { display: "inline-flex", padding: "12px 16px", border: `1px solid ${T.ink}`, background: T.ink, color: "#fff", textDecoration: "none", fontSize: 13 };
const secondaryButton: CSSProperties = { ...primaryButton, background: "#fff", color: T.ink };
