import { Link } from "react-router-dom";
import { PublicShell } from "@/components/layout/PublicShell";
import { T } from "@/styles/tokens";

const mono: React.CSSProperties = { fontFamily: T.mono, fontSize: 10.5, letterSpacing: ".14em", textTransform: "uppercase" };
const display: React.CSSProperties = { fontFamily: T.display, fontWeight: 500, letterSpacing: "-.04em" };
const max: React.CSSProperties = { maxWidth: 1240, margin: "0 auto", paddingLeft: "clamp(20px,5vw,72px)", paddingRight: "clamp(20px,5vw,72px)" };

function AboutNav({ active }: { active: "story" | "system" | "founder" }) {
  const items = [
    ["STORY", "/about/story", "story"],
    ["SYSTEM", "/about/system", "system"],
    ["FOUNDER", "/about/founder", "founder"],
  ] as const;
  return (
    <nav aria-label="About 4PLANET" style={{ ...max, display: "flex", flexWrap: "wrap", gap: 8, paddingTop: 28, paddingBottom: 28 }}>
      {items.map(([label, to, key]) => (
        <Link key={key} to={to} style={{ ...mono, textDecoration: "none", padding: "9px 11px", border: `1px solid ${active === key ? T.blue : T.line}`, background: active === key ? T.blue : "transparent", color: active === key ? "#fff" : T.ink }}>{label}</Link>
      ))}
    </nav>
  );
}

function Statement({ eyebrow, title, body }: { eyebrow: string; title: string; body: string }) {
  return (
    <section style={{ borderTop: `1px solid ${T.line}` }}>
      <div style={{ ...max, display: "grid", gridTemplateColumns: "minmax(120px,.35fr) minmax(0,1fr)", gap: "clamp(28px,7vw,110px)", paddingTop: "clamp(54px,8vw,110px)", paddingBottom: "clamp(54px,8vw,110px)" }} className="about-split">
        <div style={{ ...mono, color: T.blue }}>{eyebrow}</div>
        <div>
          <h2 style={{ ...display, fontSize: "clamp(32px,5vw,74px)", lineHeight: .96, maxWidth: "16ch" }}>{title}</h2>
          <p style={{ marginTop: 26, maxWidth: 760, fontSize: "clamp(16px,1.5vw,20px)", lineHeight: 1.65, color: T.dim }}>{body}</p>
        </div>
      </div>
    </section>
  );
}

export function AboutStory() {
  return (
    <PublicShell>
      <section style={{ minHeight: "88svh", background: "#050805", color: "#fff", display: "flex", alignItems: "flex-end" }}>
        <div style={{ ...max, width: "100%", paddingTop: 120, paddingBottom: "clamp(54px,8vw,110px)" }}>
          <div style={{ ...mono, color: T.acid }}>ABOUT_ · THE STORY</div>
          <h1 style={{ ...display, marginTop: 18, fontSize: "clamp(50px,9vw,138px)", lineHeight: .82, maxWidth: "10ch" }}>The living planet is not an abstract issue.</h1>
          <p style={{ marginTop: 32, maxWidth: 760, fontSize: "clamp(18px,2vw,25px)", lineHeight: 1.55, color: "rgba(255,255,255,.82)" }}>It is the system beneath food, water, health, prosperity, freedom and almost everything people care about.</p>
        </div>
      </section>
      <AboutNav active="story" />
      <Statement eyebrow="01_ THE PREMISE" title="Human life sits inside living systems." body="Forests move water. Oceans move heat and nutrients. Soil, insects, fungi, plants and animals make food systems possible. The separation between ‘people’ and ‘nature’ is useful on an organisation chart, but false in the world itself." />
      <Statement eyebrow="02_ THE GAP" title="Care is everywhere. Connection is not." body="Science, field organisations, communities, companies, funders and millions of people already care about the living world. Yet understanding, participation, delivery and proof are often fragmented across different systems. 4PLANET is being built to connect those parts without weakening scientific truth." />
      <Statement eyebrow="03_ THE WORK" title="Make the living planet easier to see, understand and help." body="4PLANET combines Living Planet Intelligence, public products, Missions, cultural storytelling and evidence-aware action pathways. The aim is not to make ecological complexity disappear. It is to make complexity navigable enough that more people can act intelligently inside it." />
      <section style={{ background: T.blue, color: "#fff" }}>
        <div style={{ ...max, paddingTop: "clamp(70px,10vw,150px)", paddingBottom: "clamp(70px,10vw,150px)" }}>
          <div style={{ ...mono, color: "rgba(255,255,255,.72)" }}>4PLANET_</div>
          <p style={{ ...display, marginTop: 22, fontSize: "clamp(36px,6.5vw,94px)", lineHeight: .94, maxWidth: "15ch" }}>For a living planet where humans and the rest of life can thrive together.</p>
        </div>
      </section>
      <style>{`@media(max-width:760px){.about-split{grid-template-columns:1fr!important}}`}</style>
    </PublicShell>
  );
}

export function AboutSystem() {
  const products = [
    ["01", "ATLAS", "See the living planet in place — species, observations, pressures and context."],
    ["02", "SPECIES", "Meet life as living worlds, not isolated database records."],
    ["03", "LIVING SYSTEMS", "Follow dependencies, pressures and responses across connected systems."],
    ["04", "IMPACT", "Move toward participation only where a credible pathway and evidence model exist."],
  ];
  return (
    <PublicShell>
      <section style={{ background: "#fff", color: T.ink }}>
        <div style={{ ...max, paddingTop: "clamp(120px,15vw,210px)", paddingBottom: "clamp(64px,9vw,120px)" }}>
          <div style={{ ...mono, color: T.blue }}>ABOUT_ · THE SYSTEM</div>
          <h1 style={{ ...display, marginTop: 18, fontSize: "clamp(48px,8vw,118px)", lineHeight: .86, maxWidth: "10ch" }}>One planet. One shared intelligence core.</h1>
          <p style={{ marginTop: 28, maxWidth: 760, fontSize: "clamp(18px,1.9vw,24px)", lineHeight: 1.55, color: T.dim }}>Different ways in should not create different versions of reality. 4PLANET is built around shared identities, sources and relationships, rendered through different public lenses.</p>
        </div>
      </section>
      <AboutNav active="system" />
      <section style={{ background: "#050805", color: "#fff" }}>
        <div style={{ ...max, paddingTop: "clamp(64px,9vw,120px)", paddingBottom: "clamp(64px,9vw,120px)" }}>
          <div style={{ ...mono, color: T.acid }}>THE PUBLIC PRODUCT FAMILY</div>
          <div style={{ marginTop: 36, borderTop: "1px solid rgba(255,255,255,.18)" }}>
            {products.map(([no, name, line]) => (
              <div key={name} style={{ display: "grid", gridTemplateColumns: "80px minmax(160px,.5fr) minmax(0,1fr)", gap: "clamp(16px,4vw,60px)", padding: "clamp(26px,4vw,50px) 0", borderBottom: "1px solid rgba(255,255,255,.18)" }} className="system-row">
                <span style={{ ...mono, color: T.acid }}>{no}</span>
                <span style={{ ...display, fontSize: "clamp(25px,3vw,44px)" }}>{name}</span>
                <p style={{ margin: 0, color: "rgba(255,255,255,.7)", fontSize: "clamp(15px,1.3vw,18px)", lineHeight: 1.6 }}>{line}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <Statement eyebrow="MISSIONS" title="The Planetary Map describes the world. Missions choose where 4PLANET acts." body="Missions are operational entry points into real problems, places and systems. They can connect intelligence, ecosystems, solutions and acceleration without turning the first set of Missions into a claim that the planet has only sixteen problems." />
      <Statement eyebrow="TRUTH" title="Source boundaries travel with the product." body="An observation is not a range map. A species identity is not a population assessment. A proposed action pathway is not delivered impact. 4PLANET is designed to keep those distinctions visible while still making the experience useful and beautiful." />
      <style>{`@media(max-width:700px){.system-row{grid-template-columns:52px 1fr!important}.system-row p{grid-column:2}} @media(max-width:760px){.about-split{grid-template-columns:1fr!important}}`}</style>
    </PublicShell>
  );
}

export function Founder() {
  return (
    <PublicShell>
      <article style={{ background: "#fff", color: T.ink }}>
        <header className="founder-hero" style={{ minHeight: "100svh", background: "#050505", color: "#fff", position: "relative", overflow: "hidden", display: "flex", alignItems: "flex-end" }}>
          <img className="founder-hero__image" src="/assets/brand/founder-hero.svg" alt="Odin Oddekalv in a Faroese mountain valley" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "54% 50%" }} />
          <div aria-hidden style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg,rgba(0,0,0,.10) 0%,rgba(0,0,0,.18) 35%,rgba(0,0,0,.76) 78%,rgba(0,0,0,.94) 100%)" }} />
          <div style={{ ...max, position: "relative", zIndex: 1, width: "100%", paddingTop: 140, paddingBottom: "clamp(58px,8vw,110px)" }}>
            <div style={{ ...mono, color: T.acid }}>FOUNDER_ · ODIN ODDEKALV</div>
            <h1 style={{ ...display, marginTop: 22, fontSize: "clamp(54px,9.5vw,146px)", lineHeight: .82, maxWidth: "8.5ch", textWrap: "balance" }}>Everything I love is alive.</h1>
            <p style={{ marginTop: 30, maxWidth: 720, fontSize: "clamp(18px,2vw,25px)", lineHeight: 1.55, color: "rgba(255,255,255,.86)", textWrap: "pretty" }}>4PLANET began long before it had a name. It began with a simple fact: the places, animals and people worth fighting for are not separate from one another.</p>
          </div>
        </header>
        <AboutNav active="founder" />

        <section>
          <div style={{ ...max, paddingTop: "clamp(64px,9vw,130px)", paddingBottom: "clamp(64px,9vw,130px)" }}>
            <div style={{ display: "grid", gridTemplateColumns: "minmax(140px,.35fr) minmax(0,1fr)", gap: "clamp(32px,8vw,120px)" }} className="founder-split">
              <div style={{ ...mono, color: T.blue }}>A LIFE CLOSE TO THE FIGHT</div>
              <div style={{ maxWidth: 800 }}>
                <p style={{ ...display, fontSize: "clamp(30px,4.4vw,62px)", lineHeight: 1.02 }}>Environmental work was never abstract in my family.</p>
                <p style={{ marginTop: 28, fontSize: "clamp(16px,1.45vw,20px)", lineHeight: 1.72, color: T.dim }}>I grew up close to wild places on the west coast of Norway, and close to environmental conflict. My father, Kurt Oddekalv, spent his life challenging pollution and ecological destruction. Through him I learned that protecting nature can mean years of evidence, argument, persistence, fieldwork and losing battles before you win one.</p>
                <p style={{ marginTop: 20, fontSize: "clamp(16px,1.45vw,20px)", lineHeight: 1.72, color: T.dim }}>What stayed with me most was not an organisation or a method. It was the underlying reason: living things have value, and human societies are not outside the systems that keep them alive.</p>
              </div>
            </div>
          </div>
        </section>

        <section style={{ background: T.blue, color: "#fff" }}>
          <div style={{ ...max, paddingTop: "clamp(76px,11vw,160px)", paddingBottom: "clamp(76px,11vw,160px)" }}>
            <div style={{ ...mono, color: "rgba(255,255,255,.68)" }}>ALT JEG ELSKER LEVER</div>
            <p style={{ ...display, marginTop: 22, fontSize: "clamp(38px,7vw,104px)", lineHeight: .91, maxWidth: "13ch" }}>Love is not a strategy. But it is a reason to build one.</p>
          </div>
        </section>

        <section>
          <div style={{ ...max, paddingTop: "clamp(64px,9vw,130px)", paddingBottom: "clamp(64px,9vw,130px)" }}>
            <div style={{ display: "grid", gridTemplateColumns: "minmax(140px,.35fr) minmax(0,1fr)", gap: "clamp(32px,8vw,120px)" }} className="founder-split">
              <div style={{ ...mono, color: T.blue }}>BUILDER · STORYTELLER · PHOTOGRAPHER</div>
              <div style={{ maxWidth: 800 }}>
                <p style={{ ...display, fontSize: "clamp(30px,4.4vw,62px)", lineHeight: 1.02 }}>The other half of my life was building systems that move people.</p>
                <p style={{ marginTop: 28, fontSize: "clamp(16px,1.45vw,20px)", lineHeight: 1.72, color: T.dim }}>I spent more than fifteen years working across entrepreneurship, strategy, communication and brand building, alongside photography and environmental work. That combination made a gap increasingly obvious: people care, scientists know a great deal, field organisations are doing real work and capital exists — but the path between understanding and credible participation is fragmented.</p>
                <p style={{ marginTop: 20, fontSize: "clamp(16px,1.45vw,20px)", lineHeight: 1.72, color: T.dim }}>4PLANET is my attempt to build that connective infrastructure: truth that can be explored, relationships that can be understood, action that can be joined when it is real, and proof that can be followed afterwards.</p>
              </div>
            </div>
          </div>
        </section>

        <section style={{ background: "#050805", color: "#fff" }}>
          <div style={{ ...max, paddingTop: "clamp(74px,10vw,150px)", paddingBottom: "clamp(74px,10vw,150px)" }}>
            <div style={{ ...mono, color: T.acid }}>WHY 4PLANET</div>
            <h2 style={{ ...display, marginTop: 20, fontSize: "clamp(38px,6vw,88px)", lineHeight: .93, maxWidth: "14ch" }}>The goal is not to make people care about an environmental abstraction.</h2>
            <p style={{ marginTop: 30, maxWidth: 760, fontSize: "clamp(17px,1.7vw,22px)", lineHeight: 1.65, color: "rgba(255,255,255,.76)" }}>It is to help people see the living systems already underneath their own lives — and give that understanding somewhere credible to go.</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 34 }}>
              <Link to="/about/system" style={{ ...mono, background: T.acid, color: "#050805", padding: "13px 17px", textDecoration: "none" }}>SEE THE SYSTEM →</Link>
              <Link to="/" style={{ ...mono, border: "1px solid rgba(255,255,255,.38)", color: "#fff", padding: "12px 17px", textDecoration: "none" }}>ENTER 4PLANET →</Link>
            </div>
          </div>
        </section>
      </article>
      <style>{`@media(max-width:760px){.founder-split{grid-template-columns:1fr!important}.founder-hero__image{object-position:58% 50%!important}}`}</style>
    </PublicShell>
  );
}
