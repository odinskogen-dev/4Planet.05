import { Link } from "react-router-dom";
import { T } from "@/styles/tokens";
import { PublicShell } from "@/components/layout/PublicShell";

const mono: React.CSSProperties = { fontFamily: T.mono, fontSize: 10.5, letterSpacing: ".14em", textTransform: "uppercase" };
const display: React.CSSProperties = { fontFamily: T.display, fontWeight: 500, letterSpacing: "-.04em" };
const max: React.CSSProperties = { maxWidth: 1240, margin: "0 auto", paddingLeft: "clamp(20px,5vw,72px)", paddingRight: "clamp(20px,5vw,72px)" };

const DOORS = [
  {
    no: "01",
    title: "THE STORY",
    line: "Why a living planet needs better connective infrastructure — and why 4PLANET exists.",
    to: "/about/story",
  },
  {
    no: "02",
    title: "THE SYSTEM",
    line: "How ATLAS, SPECIES, LIVING SYSTEMS, IMPACT and Missions work from one shared truth core.",
    to: "/about/system",
  },
  {
    no: "03",
    title: "THE FOUNDER",
    line: "Odin Oddekalv on growing up close to environmental action, building systems and why he is building 4PLANET.",
    to: "/about/founder",
  },
] as const;

export function About() {
  return (
    <PublicShell>
      <section style={{ position: "relative", minHeight: "92svh", overflow: "hidden", background: T.ink, color: "#fff", display: "flex", alignItems: "flex-end" }}>
        <img src="/assets/brand/story-hero.jpg" alt="A figure crossing a vast landscape" loading="eager" decoding="async" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "50% 50%", opacity: .82 }} />
        <div aria-hidden style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg,rgba(5,5,5,.18),rgba(5,5,5,.2) 42%,rgba(5,5,5,.88))" }} />
        <div style={{ ...max, position: "relative", width: "100%", paddingTop: 120, paddingBottom: "clamp(54px,8vw,110px)" }}>
          <div style={{ ...mono, color: "rgba(255,255,255,.7)" }}>ABOUT_ · 4PLANET</div>
          <h1 style={{ ...display, marginTop: 18, fontSize: "clamp(48px,8vw,118px)", lineHeight: .86, maxWidth: "11ch" }}>A system for a living planet.</h1>
          <p style={{ marginTop: 28, maxWidth: 740, fontSize: "clamp(18px,2vw,25px)", lineHeight: 1.55, color: "rgba(255,255,255,.86)" }}>4PLANET is being built to make the living world easier to see, understand and help — without simplifying away the truth.</p>
        </div>
      </section>

      <section style={{ background: "#fff", color: T.ink }}>
        <div style={{ ...max, paddingTop: "clamp(64px,9vw,120px)", paddingBottom: "clamp(64px,9vw,120px)" }}>
          <div style={{ ...mono, color: T.blue }}>START HERE</div>
          <p style={{ ...display, marginTop: 20, maxWidth: "18ch", fontSize: "clamp(30px,4.6vw,66px)", lineHeight: 1.02 }}>Human life is inseparable from forests, oceans, species and the systems around us.</p>
          <p style={{ marginTop: 26, maxWidth: 760, color: T.dim, fontSize: "clamp(16px,1.45vw,20px)", lineHeight: 1.68 }}>The question behind 4PLANET is not whether nature matters. It is how truthful understanding becomes relevance, agency, participation and credible action at the scale a living planet requires.</p>

          <div style={{ marginTop: "clamp(48px,7vw,86px)", borderTop: `1px solid ${T.lineStrong}` }}>
            {DOORS.map((door) => (
              <Link key={door.no} to={door.to} className="about-door" style={{ display: "grid", gridTemplateColumns: "72px minmax(170px,.55fr) minmax(0,1fr) auto", gap: "clamp(14px,3vw,44px)", alignItems: "center", padding: "clamp(26px,4vw,46px) 0", borderBottom: `1px solid ${T.line}`, textDecoration: "none", color: T.ink }}>
                <span style={{ ...mono, color: T.blue }}>{door.no}</span>
                <span style={{ ...display, fontSize: "clamp(22px,2.6vw,38px)" }}>{door.title}</span>
                <span style={{ color: T.dim, fontSize: "clamp(14px,1.25vw,17px)", lineHeight: 1.55, maxWidth: 600 }}>{door.line}</span>
                <span aria-hidden style={{ fontFamily: T.mono, color: T.blue, fontSize: 18 }}>→</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section id="road" style={{ background: T.blue, color: "#fff" }}>
        <div style={{ ...max, paddingTop: "clamp(70px,10vw,150px)", paddingBottom: "clamp(70px,10vw,150px)" }}>
          <div style={{ ...mono, color: "rgba(255,255,255,.68)" }}>THE ROAD AHEAD</div>
          <h2 style={{ ...display, marginTop: 22, fontSize: "clamp(36px,6vw,88px)", lineHeight: .94, maxWidth: "14ch" }}>Build the proof before making the promise.</h2>
          <p style={{ marginTop: 28, maxWidth: 720, fontSize: "clamp(16px,1.5vw,20px)", lineHeight: 1.65, color: "rgba(255,255,255,.82)" }}>4PLANET is early and says so. Products, Missions and Impact Pathways should become public at the level their evidence, partners, rights and delivery systems can actually support.</p>
        </div>
      </section>

      <style>{`
        .about-door{transition:padding-left .2s ease,background .2s ease}
        .about-door:hover{padding-left:14px;background:rgba(46,46,255,.025)}
        .about-door:focus-visible{outline:3px solid currentColor;outline-offset:5px}
        @media(max-width:720px){.about-door{grid-template-columns:44px 1fr auto!important}.about-door>span:nth-child(3){grid-column:2/4}}
      `}</style>
    </PublicShell>
  );
}
