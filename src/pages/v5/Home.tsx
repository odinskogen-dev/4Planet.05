import { Link } from "react-router-dom";
import { T, DOMAIN_ACCENT } from "@/styles/tokens";
import { PublicShell } from "@/components/layout/PublicShell";
import { Section } from "@/components/ui";
import { Reveal } from "@/components/Cinematic";
import { img, type ImageKey } from "@/content/imageRegistry";
import type { DomainKey } from "@/types/content";
import { AtlasHero } from "./AtlasHero";
import { WorldFirstAct } from "@/components/home/WorldFirstAct";

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

const bodyDim: React.CSSProperties = {
  fontSize: "clamp(16px,1.15vw,19px)",
  color: T.dim,
  lineHeight: 1.62,
  textWrap: "pretty",
};

const PRODUCTS = [
  ["01", "ATLAS", "SEE THE PLANET", "Move through place, observations and planetary context.", "/atlas", T.blue],
  ["02", "SPECIES", "MEET LIFE", "Enter through a species, then follow habitat, relationships and evidence.", "/species", "#3AE86F"],
  ["03", "LIVING SYSTEMS", "UNDERSTAND", "See dependencies, pressures and responses as one connected system.", "/living-systems", "#FF4D22"],
  ["04", "IMPACT", "HELP", "Move from understanding toward credible action and proof.", "/impact", "#3AE86F"],
] as const;

const WORLDS: Record<DomainKey, { line: string; image: ImageKey }> = {
  OCE4N_: { line: "The living ocean — migration, coasts, reefs and the systems beneath the surface.", image: "oce4nDomainHero" },
  E4RTH_: { line: "Forests, freshwater, soil, species and the recovery of living land.", image: "e4rthDomainHero" },
  S4PIENS_: { line: "Human systems — food, energy, cities and materials shaping planetary pressure.", image: "s4piensDomainHero" },
  "4CULTURE_": { line: "Stories, sound, image and ideas shaping attention, meaning and participation.", image: "m4gazineHero" },
};

const ORDER: DomainKey[] = ["OCE4N_", "E4RTH_", "S4PIENS_", "4CULTURE_"];
const dslug = (key: string) => key.replace("_", "").toLowerCase();

const STEPS: [string, string][] = [
  ["Understand", "Explore the living systems, places and challenges under pressure."],
  ["Enter a world", "Find the part of the living planet you care about."],
  ["Follow a mission", "Understand one challenge, what is changing and what can help."],
  ["Join action", "Support credible pathways as they become ready."],
  ["Follow proof", "See how action is delivered, evidenced and reported over time."],
];

const PARTICIPATE: [string, string, string][] = [
  ["4PEOPLE", "Join a clearer way to understand, follow and support the living world.", "/join"],
  ["4BRANDS", "Help build credible environmental action people can understand and believe in.", "/brands"],
  ["4PARTNERS", "Bring real environmental work into a system people can understand, support and follow.", "/partners"],
  ["4FUNDERS", "Help build long-term public infrastructure for environmental action.", "/funders"],
];

function ProductLens({ item }: { item: typeof PRODUCTS[number] }) {
  const [no, name, tag, line, to, accent] = item;
  return (
    <Link to={to} className="home-lens" style={{ display: "block", color: T.ink, textDecoration: "none", padding: "28px 0 30px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 16 }}>
        <span style={{ ...mono, color: accent }}>{no}</span>
        <span aria-hidden style={{ ...mono, color: T.dim }}>OPEN ↗</span>
      </div>
      <h3 style={{ ...display, margin: "22px 0 0", fontSize: "clamp(24px,2.8vw,39px)", lineHeight: .96 }}>{name}</h3>
      <div style={{ ...mono, color: T.dim, marginTop: 12 }}>{tag}</div>
      <p style={{ margin: "12px 0 0", maxWidth: 300, color: T.dim, fontSize: 14.5, lineHeight: 1.55 }}>{line}</p>
    </Link>
  );
}

function WorldPanel({ dk }: { dk: DomainKey }) {
  const world = WORLDS[dk];
  const media = img(world.image);
  const accent = DOMAIN_ACCENT[dk];
  return (
    <Link to={`/domains/${dslug(dk)}`} className="home-world" style={{ position: "relative", minHeight: "clamp(360px,46vw,650px)", display: "flex", alignItems: "flex-end", overflow: "hidden", color: "#fff", textDecoration: "none", background: "#050505" }}>
      <img src={media.src} alt={media.alt} loading="lazy" decoding="async" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: media.objectPosition ?? "50% 50%" }} />
      <div aria-hidden style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg,rgba(0,0,0,.05) 10%,rgba(0,0,0,.16) 54%,rgba(0,0,0,.88) 100%)" }} />
      <div style={{ position: "relative", width: "100%", padding: "clamp(22px,3.5vw,46px)" }}>
        <div style={{ ...mono, color: accent }}>{dk}</div>
        <h3 style={{ ...display, margin: "10px 0 0", fontSize: "clamp(34px,5vw,68px)", lineHeight: .88 }}>{dk.replace("_", "")}</h3>
        <p style={{ margin: "16px 0 0", maxWidth: 430, color: "rgba(255,255,255,.78)", fontSize: "clamp(14px,1.2vw,17px)", lineHeight: 1.55 }}>{world.line}</p>
      </div>
    </Link>
  );
}

export default function Home() {
  return (
    <PublicShell>
      <AtlasHero />
      <div id="meet-life"><WorldFirstAct /></div>

      <section id="why-4planet" style={{ background: T.blue, color: "#fff" }}>
        <div className="home-premise" style={{ maxWidth: 1320, margin: "0 auto", padding: "clamp(74px,10vw,152px) clamp(20px,5vw,72px)", display: "grid", gridTemplateColumns: "minmax(0,1.15fr) minmax(300px,.85fr)", gap: "clamp(36px,8vw,120px)", alignItems: "end" }}>
          <div>
            <div style={{ ...mono, color: "rgba(255,255,255,.62)" }}>WHY 4PLANET_</div>
            <h2 style={{ ...display, margin: "18px 0 0", fontSize: "clamp(42px,7vw,98px)", lineHeight: .9, maxWidth: "13ch" }}>A healthy living planet is infrastructure for human life.</h2>
          </div>
          <div>
            <p style={{ margin: 0, maxWidth: 620, color: "rgba(255,255,255,.82)", fontSize: "clamp(17px,1.55vw,21px)", lineHeight: 1.62 }}>Food, water, climate regulation, materials, health and prosperity all depend on living systems. 4PLANET exists to make those relationships easier to see — and credible ways to act on them easier to find.</p>
            <Link to="/about" style={{ ...mono, display: "inline-flex", marginTop: 28, color: "#fff", textDecoration: "none" }}>THE STORY →</Link>
          </div>
        </div>
      </section>

      <section style={{ background: "#fff", color: T.ink }}>
        <div style={{ maxWidth: 1320, margin: "0 auto", padding: "clamp(58px,7vw,100px) clamp(20px,5vw,72px)" }}>
          <Reveal>
            <div className="home-lens-intro" style={{ display: "grid", gridTemplateColumns: "minmax(0,.72fr) minmax(280px,1fr)", gap: "clamp(28px,6vw,94px)", alignItems: "end" }}>
              <div>
                <div style={{ ...mono, color: T.blue }}>ONE PLANET · FOUR PUBLIC LENSES</div>
                <h2 style={{ ...display, margin: "12px 0 0", fontSize: "clamp(38px,5.5vw,74px)", lineHeight: .92, maxWidth: "10ch" }}>See the same planet from four angles.</h2>
              </div>
              <p style={{ margin: 0, maxWidth: 650, color: T.dim, fontSize: "clamp(16px,1.4vw,19px)", lineHeight: 1.62 }}>ATLAS, SPECIES, LIVING SYSTEMS and IMPACT are connected ways into one shared living-planet model — not separate product worlds.</p>
            </div>
          </Reveal>
          <div className="home-lens-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4,minmax(0,1fr))", gap: "clamp(18px,3vw,42px)", marginTop: "clamp(34px,5vw,58px)", borderTop: `1px solid ${T.lineStrong}` }}>
            {PRODUCTS.map((item) => <ProductLens key={item[0]} item={item} />)}
          </div>
        </div>
      </section>

      <section id="worlds" style={{ background: "#050505", color: "#fff" }}>
        <div style={{ maxWidth: 1320, margin: "0 auto", padding: "clamp(62px,8vw,104px) clamp(20px,5vw,72px) 0" }}>
          <div style={{ ...mono, color: T.acid }}>THE LIVING WORLD</div>
          <div className="home-world-intro" style={{ display: "grid", gridTemplateColumns: "minmax(0,.8fr) minmax(280px,1fr)", gap: "clamp(24px,6vw,90px)", alignItems: "end", marginTop: 12 }}>
            <h2 style={{ ...display, margin: 0, fontSize: "clamp(36px,5.2vw,70px)", lineHeight: .92, maxWidth: "10ch" }}>Four connected domains.</h2>
            <p style={{ margin: 0, maxWidth: 650, color: "rgba(255,255,255,.62)", fontSize: "clamp(15px,1.35vw,18px)", lineHeight: 1.6 }}>The Planetary Map describes the world. Domains make that world navigable. Missions focus where 4PLANET acts inside those domains.</p>
          </div>
        </div>
        <div className="home-world-grid" style={{ display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: 1, marginTop: "clamp(34px,5vw,58px)", background: "rgba(255,255,255,.12)" }}>
          {ORDER.map((dk) => <WorldPanel key={dk} dk={dk} />)}
        </div>
      </section>

      <section id="how" style={{ background: T.paper, color: T.ink }}>
        <div style={{ maxWidth: 1320, margin: "0 auto", padding: "clamp(56px,8vw,120px) clamp(20px,5vw,72px)" }}>
          <Reveal>
            <div style={{ ...mono, color: T.blue, marginBottom: 16 }}>A CLEAR WAY IN</div>
            <h2 style={{ ...display, margin: 0, fontSize: "clamp(24px,3vw,40px)", lineHeight: 1.02, maxWidth: 820 }}>Environmental problems are complex. Participation should not be.</h2>
            <p style={{ ...bodyDim, marginTop: 18, maxWidth: 700 }}>4PLANET organises the living world into connected domains and missions, then brings together people, field organisations, scientists and funders around credible action you can understand, support and follow.</p>
          </Reveal>
          <Reveal delay={60}>
            <div className="process5" style={{ marginTop: "clamp(36px,5vw,60px)", borderTop: `1px solid ${T.line}`, paddingTop: "clamp(24px,3vw,40px)" }}>
              {STEPS.map(([title, line], index) => (
                <div key={title} className="process5-step">
                  <span className="mono" style={{ fontSize: 11, color: T.blue }}>{`0${index + 1}_`}</span>
                  <div style={{ fontWeight: 500, fontSize: "clamp(15px,1.2vw,18px)", marginTop: 12, letterSpacing: "-.01em" }}>{title}</div>
                  <p style={{ fontSize: 13, marginTop: 10, lineHeight: 1.5, color: T.dim }}>{line}</p>
                </div>
              ))}
            </div>
            <div className="mono" style={{ fontSize: 11, letterSpacing: ".18em", color: T.blue, marginTop: "clamp(32px,4vw,52px)" }}>PLANET → DOMAIN → MISSION → ACTION → PROOF</div>
            <p style={{ ...bodyDim, fontSize: 13.5, marginTop: 18, maxWidth: 640 }}>No impact pathway is open for public support yet. Each opens only when its delivery model, evidence and reporting are in place — the ecological facts we show are sourced; the delivery model is shown at its true status.</p>
          </Reveal>
        </div>
      </section>

      <Section pad="clamp(48px,6vw,96px)">
        <Reveal>
          <div style={{ ...mono, color: T.blue, marginBottom: 8 }}>TAKE PART</div>
          <h2 style={{ ...display, margin: 0, fontSize: "clamp(24px,3vw,40px)", lineHeight: 1.02, maxWidth: 820 }}>Build this with us.</h2>
          <div className="part-grid" style={{ marginTop: "clamp(28px,4vw,44px)", borderTop: `1px solid ${T.line}`, borderLeft: `1px solid ${T.line}` }}>
            {PARTICIPATE.map(([title, line, to]) => (
              <Link key={title} to={to} className="part-box" style={{ padding: "clamp(24px,3vw,38px)", textDecoration: "none", color: T.ink, borderRight: `1px solid ${T.line}`, borderBottom: `1px solid ${T.line}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <span style={{ fontFamily: T.display, fontWeight: 500, fontSize: "clamp(20px,2vw,26px)", letterSpacing: "-.02em" }}>{title}</span>
                  <span className="pb-arr" style={{ color: T.faint, transition: "color .18s, transform .18s" }}>→</span>
                </div>
                <p style={{ fontSize: 14, color: T.dim, marginTop: 12, lineHeight: 1.5, maxWidth: 380 }}>{line}</p>
              </Link>
            ))}
          </div>
        </Reveal>
      </Section>

      <style>{`
        .home-lens{transition:transform .2s ease,opacity .2s ease}.home-lens:hover{transform:translateX(5px)}
        .home-world img{transition:transform .7s cubic-bezier(.2,.7,.2,1)}.home-world:hover img,.home-world:focus-visible img{transform:scale(1.018)}
        @media(max-width:900px){.home-premise,.home-lens-intro,.home-world-intro{grid-template-columns:1fr!important}.home-lens-grid{grid-template-columns:repeat(2,minmax(0,1fr))!important}}
        @media(max-width:680px){.home-lens-grid,.home-world-grid{grid-template-columns:1fr!important}.home-lens{border-bottom:1px solid ${T.line}}}
        @media(prefers-reduced-motion:reduce){.home-lens,.home-world img{transition:none!important}.home-lens:hover{transform:none}.home-world:hover img,.home-world:focus-visible img{transform:none}}
      `}</style>
    </PublicShell>
  );
}
