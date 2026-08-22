import { Link } from "react-router-dom";
import { T } from "@/styles/tokens";
import { PublicShell } from "@/components/layout/PublicShell";
import { Section } from "@/components/ui";
import { Reveal } from "@/components/Cinematic";
import { HomeAtlasShowcase } from "@/components/HomeAtlasShowcase";
import { img, type ImageKey } from "@/content/imageRegistry";
import { AtlasHero } from "./AtlasHero";

const mono: React.CSSProperties = {
  fontFamily: T.mono,
  fontSize: 10.5,
  letterSpacing: ".14em",
  textTransform: "uppercase",
};

const display: React.CSSProperties = {
  fontFamily: T.display,
  fontWeight: 500,
  letterSpacing: "-.045em",
};

const PRODUCTS = [
  ["01", "ATLAS", "SEE THE PLANET", "Move through place, observations and planetary context — with source and uncertainty kept visible.", "/atlas"],
  ["02", "SPECIES", "MEET LIFE", "Enter through a species, then follow habitat, relationships, pressure and evidence.", "/species"],
  ["03", "LIVING SYSTEMS", "UNDERSTAND", "See how species, places and human systems depend on one another.", "/living-systems"],
  ["04", "IMPACT", "ACT", "Move from understanding toward credible action and proof — without hiding what is still being built.", "/impact"],
] as const;

const DOMAINS = [
  ["OCE4N_", "The living ocean — migration, coasts, reefs and the systems beneath the surface.", "oce4nDomainHero", "/domains/oce4n"],
  ["E4RTH_", "Forests, freshwater, soil, species and the recovery of living land.", "e4rthDomainHero", "/domains/e4rth"],
  ["S4PIENS_", "Human systems — food, energy, cities and materials shaping planetary pressure.", "s4piensDomainHero", "/s4piens"],
  ["4CULTURE_", "Story, film, art and play shaping attention, meaning and participation.", "m4gazineHero", "/domains/4culture"],
] as const satisfies readonly (readonly [string, string, ImageKey, string])[];

const FLAGSHIPS = [
  {
    eyebrow: "E4RTH_ · SPECIES × ATLAS × AM4ZONIA",
    title: "Jaguar",
    line: "Meet one animal, then move outward into rainforest, observations, relationships, pressure and response.",
    to: "/species/jaguar",
    image: "amazoniaHero" as ImageKey,
  },
  {
    eyebrow: "OCE4N_ · SPECIES × WH4LES × BAY OF BISCAY",
    title: "Orca",
    line: "Follow a source-bounded path from species identity to ocean context, pressure, monitoring, actors and action.",
    to: "/species/orca",
    image: "oce4nDomainHero" as ImageKey,
  },
  {
    eyebrow: "S4PIENS_ · HUMAN SYSTEMS × FOOD",
    title: "Homo sapiens",
    line: "Put humans back inside the living system — dependent on nature, shaping pressure, capable of changing systems.",
    to: "/s4piens",
    image: "s4piensDomainHero" as ImageKey,
  },
] as const;

const MISSION_GROUPS = [
  ["OCE4N_", ["WH4LES_", "COR4L_", "CLE4N_", "RE:WILD_ MARINE"]],
  ["E4RTH_", ["CLIM4TE_", "AM4ZONIA_", "SPECIES_", "RE:WILD_ LAND"]],
  ["S4PIENS_", ["FOOD_", "EN4RGY_", "CIRCULAR CITY_", "F4SHION_"]],
  ["4CULTURE_", ["M4GAZINE_", "4FILM_", "4RT_", "4PLAY_"]],
] as const;

function ProductLens({ item }: { item: typeof PRODUCTS[number] }) {
  const [no, name, tag, line, to] = item;
  return (
    <Link to={to} className="home-lens" style={{ display: "block", color: T.ink, textDecoration: "none", padding: "28px 0 30px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 16 }}>
        <span style={{ ...mono, color: T.blue }}>{no}</span>
        <span aria-hidden style={{ ...mono, color: T.dim }}>OPEN ↗</span>
      </div>
      <h3 style={{ ...display, margin: "22px 0 0", fontSize: "clamp(24px,2.8vw,39px)", lineHeight: .96 }}>{name}</h3>
      <div style={{ ...mono, color: T.dim, marginTop: 12 }}>{tag}</div>
      <p style={{ margin: "12px 0 0", maxWidth: 330, color: T.dim, fontSize: 14.5, lineHeight: 1.55 }}>{line}</p>
    </Link>
  );
}

function DomainPanel({ item }: { item: typeof DOMAINS[number] }) {
  const [name, line, imageKey, to] = item;
  const media = img(imageKey);
  return (
    <Link to={to} className="home-world" style={{ position: "relative", minHeight: "clamp(360px,46vw,650px)", display: "flex", alignItems: "flex-end", overflow: "hidden", color: "#fff", textDecoration: "none", background: "#050505" }}>
      <img src={media.src} alt={media.alt} loading="lazy" decoding="async" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: media.objectPosition ?? "50% 50%", transition: "transform .9s cubic-bezier(.2,.7,.2,1)" }} />
      <div aria-hidden style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg,rgba(0,0,0,.03) 10%,rgba(0,0,0,.12) 48%,rgba(0,0,0,.9) 100%)" }} />
      <div style={{ position: "relative", width: "100%", padding: "clamp(24px,3.8vw,48px)" }}>
        <div style={{ ...mono, color: "rgba(255,255,255,.62)" }}>LIVING DOMAIN</div>
        <h3 style={{ ...display, margin: "10px 0 0", fontSize: "clamp(38px,5vw,72px)", lineHeight: .88 }}>{name}</h3>
        <p style={{ margin: "18px 0 0", maxWidth: 440, color: "rgba(255,255,255,.78)", fontSize: "clamp(14px,1.2vw,17px)", lineHeight: 1.55 }}>{line}</p>
        <div style={{ ...mono, marginTop: 24, color: "#fff" }}>ENTER →</div>
      </div>
    </Link>
  );
}

function Flagship({ item }: { item: typeof FLAGSHIPS[number] }) {
  const media = img(item.image);
  return (
    <Link to={item.to} className="home-journey" style={{ display: "block", color: "#fff", textDecoration: "none" }}>
      <div style={{ position: "relative", minHeight: "clamp(390px,42vw,580px)", overflow: "hidden", background: "#050505" }}>
        <img src={media.src} alt={media.alt} loading="lazy" decoding="async" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: media.objectPosition ?? "50% 50%", transition: "transform .9s cubic-bezier(.2,.7,.2,1)" }} />
        <div aria-hidden style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg,rgba(0,0,0,.02),rgba(0,0,0,.12) 45%,rgba(0,0,0,.9))" }} />
        <div style={{ position: "absolute", inset: "auto 0 0", padding: "clamp(24px,3.4vw,42px)" }}>
          <div style={{ ...mono, color: "rgba(255,255,255,.66)" }}>{item.eyebrow}</div>
          <h3 style={{ ...display, margin: "12px 0 0", fontSize: "clamp(38px,5vw,66px)", lineHeight: .9 }}>{item.title}</h3>
          <p style={{ margin: "16px 0 0", maxWidth: 470, color: "rgba(255,255,255,.82)", fontSize: "clamp(14px,1.15vw,17px)", lineHeight: 1.58 }}>{item.line}</p>
          <div style={{ ...mono, color: "#fff", marginTop: 22 }}>ENTER STORY →</div>
        </div>
      </div>
    </Link>
  );
}

export default function Home() {
  return (
    <PublicShell>
      <AtlasHero />

      <section id="why-4planet" style={{ background: T.blue, color: "#fff" }}>
        <div className="home-premise" style={{ maxWidth: 1320, margin: "0 auto", padding: "clamp(78px,10vw,160px) clamp(20px,5vw,72px)", display: "grid", gridTemplateColumns: "minmax(0,1.15fr) minmax(300px,.85fr)", gap: "clamp(36px,8vw,120px)", alignItems: "end" }}>
          <Reveal>
            <div style={{ ...mono, color: "rgba(255,255,255,.62)" }}>WHY 4PLANET_</div>
            <h2 style={{ ...display, margin: "18px 0 0", fontSize: "clamp(46px,7vw,104px)", lineHeight: .88, maxWidth: "12ch" }}>A healthy living planet is infrastructure for human life.</h2>
          </Reveal>
          <Reveal delay={70}>
            <p style={{ margin: 0, maxWidth: 620, color: "rgba(255,255,255,.84)", fontSize: "clamp(18px,1.55vw,22px)", lineHeight: 1.62 }}>Food, water, climate regulation, materials, health and prosperity depend on living systems. 4PLANET makes those relationships easier to understand — and credible ways to help easier to find.</p>
            <Link to="/about/story" style={{ ...mono, display: "inline-flex", marginTop: 30, color: "#fff", textDecoration: "none" }}>THE STORY →</Link>
          </Reveal>
        </div>
      </section>

      <Section pad="clamp(66px,8vw,120px)">
        <Reveal>
          <div className="home-lens-intro" style={{ display: "grid", gridTemplateColumns: "minmax(0,.72fr) minmax(280px,1fr)", gap: "clamp(28px,6vw,94px)", alignItems: "end" }}>
            <div>
              <div style={{ ...mono, color: T.blue }}>ONE PLANET · FOUR PUBLIC LENSES</div>
              <h2 style={{ ...display, margin: "12px 0 0", fontSize: "clamp(40px,5.5vw,76px)", lineHeight: .91, maxWidth: "10ch" }}>See the same planet from four angles.</h2>
            </div>
            <p style={{ margin: 0, maxWidth: 650, color: T.dim, fontSize: "clamp(16px,1.4vw,19px)", lineHeight: 1.62 }}>ATLAS, SPECIES, LIVING SYSTEMS and IMPACT are connected ways into one shared living-planet model — not four disconnected products.</p>
          </div>
        </Reveal>
        <div className="home-lens-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4,minmax(0,1fr))", gap: "clamp(18px,3vw,42px)", marginTop: "clamp(36px,5vw,62px)", borderTop: `1px solid ${T.lineStrong}` }}>
          {PRODUCTS.map((item) => <ProductLens key={item[0]} item={item} />)}
        </div>
      </Section>

      <HomeAtlasShowcase />

      <section style={{ background: "#050505", color: "#fff" }}>
        <div style={{ maxWidth: 1320, margin: "0 auto", padding: "clamp(72px,9vw,128px) clamp(20px,5vw,72px) clamp(38px,5vw,62px)" }}>
          <Reveal>
            <div style={{ ...mono, color: "rgba(255,255,255,.54)" }}>THREE WAYS INTO THE SYSTEM</div>
            <h2 style={{ ...display, margin: "14px 0 0", fontSize: "clamp(42px,6vw,84px)", lineHeight: .9, maxWidth: "13ch" }}>Start with life. Follow the connections.</h2>
            <p style={{ margin: "20px 0 0", maxWidth: 690, color: "rgba(255,255,255,.66)", fontSize: "clamp(16px,1.4vw,19px)", lineHeight: 1.62 }}>The flagship journeys are where the system must prove itself: one animal, one place, one chain of evidence — then a route toward understanding and action.</p>
          </Reveal>
        </div>
        <div className="home-journey-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: 1, background: "rgba(255,255,255,.12)" }}>
          {FLAGSHIPS.map((item) => <Flagship key={item.title} item={item} />)}
        </div>
      </section>

      <section id="worlds" style={{ background: "#fff", color: T.ink }}>
        <div style={{ maxWidth: 1320, margin: "0 auto", padding: "clamp(72px,9vw,126px) clamp(20px,5vw,72px) clamp(38px,5vw,62px)" }}>
          <Reveal>
            <div style={{ ...mono, color: T.blue }}>THE LIVING WORLD</div>
            <div className="home-world-intro" style={{ display: "grid", gridTemplateColumns: "minmax(0,.8fr) minmax(280px,1fr)", gap: "clamp(24px,6vw,90px)", alignItems: "end", marginTop: 12 }}>
              <h2 style={{ ...display, margin: 0, fontSize: "clamp(40px,5.5vw,76px)", lineHeight: .91, maxWidth: "10ch" }}>Four connected domains.</h2>
              <p style={{ margin: 0, maxWidth: 650, color: T.dim, fontSize: "clamp(15px,1.35vw,18px)", lineHeight: 1.62 }}>The planet is one system. Domains make it navigable. Missions focus where understanding and action can be built without pretending the boundaries are separate worlds.</p>
            </div>
          </Reveal>
        </div>
        <div className="home-world-grid" style={{ display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: 1, background: "#111" }}>
          {DOMAINS.map((item) => <DomainPanel key={item[0]} item={item} />)}
        </div>
      </section>

      <section style={{ background: "#fff", color: T.ink, borderTop: `1px solid ${T.line}` }}>
        <div style={{ maxWidth: 1320, margin: "0 auto", padding: "clamp(72px,9vw,126px) clamp(20px,5vw,72px)" }}>
          <Reveal>
            <div style={{ ...mono, color: T.blue }}>16 MISSIONS · ONE SYSTEM</div>
            <h2 style={{ ...display, margin: "14px 0 0", fontSize: "clamp(40px,5.5vw,76px)", lineHeight: .91, maxWidth: "12ch" }}>Focus without fragmenting the planet.</h2>
          </Reveal>
          <div className="home-mission-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4,minmax(0,1fr))", gap: "clamp(24px,4vw,54px)", marginTop: "clamp(40px,6vw,72px)", borderTop: `1px solid ${T.lineStrong}` }}>
            {MISSION_GROUPS.map(([domain, missions]) => <div key={domain} style={{ paddingTop: 24 }}><div style={{ ...mono, color: T.blue }}>{domain}</div><div style={{ display: "grid", gap: 10, marginTop: 18 }}>{missions.map((mission) => <span key={mission} style={{ fontSize: "clamp(16px,1.35vw,19px)", color: T.ink }}>{mission}</span>)}</div></div>)}
          </div>
          <Link to="/missions" style={{ ...mono, display: "inline-flex", marginTop: 42, color: T.ink, textDecoration: "none", borderBottom: `1px solid ${T.ink}`, paddingBottom: 5 }}>EXPLORE ALL MISSIONS →</Link>
        </div>
      </section>

      <section style={{ background: "#050505", color: "#fff" }}>
        <div className="home-action" style={{ maxWidth: 1320, margin: "0 auto", padding: "clamp(78px,10vw,150px) clamp(20px,5vw,72px)", display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(300px,.72fr)", gap: "clamp(34px,8vw,120px)", alignItems: "end" }}>
          <Reveal>
            <div style={{ ...mono, color: "rgba(255,255,255,.52)" }}>UNDERSTANDING → ACTION → PROOF</div>
            <h2 style={{ ...display, margin: "16px 0 0", fontSize: "clamp(44px,6vw,88px)", lineHeight: .89, maxWidth: "12ch" }}>Action should be as traceable as the evidence behind it.</h2>
          </Reveal>
          <Reveal delay={70}>
            <p style={{ margin: 0, color: "rgba(255,255,255,.72)", fontSize: "clamp(16px,1.4vw,19px)", lineHeight: 1.64 }}>IMPACT is being built to keep contribution, delivery, evidence and ecological outcome separate. Where delivery is not ready, 4PLANET says so.</p>
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginTop: 28 }}>
              <Link to="/impact" style={{ ...mono, color: "#050505", background: "#fff", textDecoration: "none", padding: "13px 18px" }}>EXPLORE IMPACT →</Link>
              <Link to="/join" style={{ ...mono, color: "#fff", textDecoration: "none", padding: "12px 0", borderBottom: "1px solid rgba(255,255,255,.7)" }}>JOIN 4PLANET →</Link>
            </div>
          </Reveal>
        </div>
      </section>

      <style>{`
        .home-lens:hover h3,.home-lens:focus-visible h3{color:${T.blue}}
        .home-world:hover img,.home-world:focus-visible img,.home-journey:hover img,.home-journey:focus-visible img{transform:scale(1.025)}
        .home-lens:focus-visible,.home-world:focus-visible,.home-journey:focus-visible{outline:3px solid ${T.blue};outline-offset:-3px}
        @media(max-width:900px){.home-lens-grid{grid-template-columns:repeat(2,minmax(0,1fr))!important}.home-journey-grid{grid-template-columns:1fr!important}.home-mission-grid{grid-template-columns:repeat(2,minmax(0,1fr))!important}.home-premise,.home-action,.home-lens-intro,.home-world-intro{grid-template-columns:1fr!important}}
        @media(max-width:640px){.home-world-grid,.home-lens-grid,.home-mission-grid{grid-template-columns:1fr!important}.home-world{min-height:520px!important}}
        @media(prefers-reduced-motion:reduce){.home-world img,.home-journey img{transition:none!important}}
      `}</style>
    </PublicShell>
  );
}
