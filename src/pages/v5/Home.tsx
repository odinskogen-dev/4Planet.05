import { Link } from "react-router-dom";
import { T, DOMAIN_ACCENT } from "@/styles/tokens";
import { PublicShell } from "@/components/layout/PublicShell";
import { Section } from "@/components/ui";
import { Reveal } from "@/components/Cinematic";
import { img, type ImageKey } from "@/content/imageRegistry";
import type { DomainKey } from "@/types/content";
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
  ["01", "ATLAS", "SEE THE PLANET", "Move through place, observations and planetary context.", "/atlas", T.blue],
  ["02", "SPECIES", "MEET LIFE", "Enter through a species, then follow habitat, relationships and evidence.", "/species", "#3AE86F"],
  ["03", "LIVING SYSTEMS", "UNDERSTAND", "See dependencies, pressures and responses as one connected system.", "/living-systems", "#FF4D22"],
  ["04", "IMPACT", "HELP", "Move from understanding toward credible action and proof.", "/impact", "#3AE86F"],
] as const;

const WORLDS: Record<DomainKey, { line: string; image: ImageKey }> = {
  OCE4N_: { line: "The living ocean — migration, coasts, reefs and the systems beneath the surface.", image: "oce4nDomainHero" },
  E4RTH_: { line: "Forests, freshwater, soil, species and the recovery of living land.", image: "e4rthDomainHero" },
  S4PIENS_: { line: "Human systems — food, energy, cities and materials shaping planetary pressure.", image: "s4piensDomainHero" },
  "4CULTURE_": { line: "Story, film, art and play shaping attention, meaning and participation.", image: "cultureAnchor" },
};

const ORDER: DomainKey[] = ["OCE4N_", "E4RTH_", "S4PIENS_", "4CULTURE_"];
const dslug = (key: string) => key.replace("_", "").toLowerCase();

const FEATURED = [
  {
    eyebrow: "E4RTH_ · SPECIES × ATLAS × AM4ZONIA",
    title: "Jaguar",
    line: "Meet one animal, then move outward into rainforest, observations, relationships, pressure and response.",
    to: "/species/jaguar",
    image: "amazoniaHero" as ImageKey,
    accent: DOMAIN_ACCENT.E4RTH_,
  },
  {
    eyebrow: "OCE4N_ · SPECIES × WH4LES",
    title: "Orca",
    line: "Follow family, culture, place and pressure through a source-bounded species world.",
    to: "/species/orca",
    image: "wh4lesHero" as ImageKey,
    accent: DOMAIN_ACCENT.OCE4N_,
  },
  {
    eyebrow: "S4PIENS_ · HUMAN SYSTEMS",
    title: "Homo sapiens",
    line: "Put humans back inside the living system — dependent on nature and capable of changing pressure.",
    to: "/species/homo-sapiens",
    image: "s4piensDomainHero" as ImageKey,
    accent: DOMAIN_ACCENT.S4PIENS_,
  },
] as const;

const PATHWAYS = [
  ["PLANT TREES", "PARTNER VALIDATION", "/impact/tree-unit"],
  ["CLEAN OCEAN PLASTIC", "IN DEVELOPMENT", "/impact/ocean-waste"],
  ["PROTECT AMAZON RAINFOREST", "IN DEVELOPMENT", "/impact/amazon-square"],
  ["REWILD DEGRADED LAND", "IN DEVELOPMENT", "/impact/habitat-recovery"],
] as const;

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

function FeaturedJourney({ item, primary = false }: { item: typeof FEATURED[number]; primary?: boolean }) {
  const media = img(item.image);
  return (
    <Link to={item.to} className={`home-journey${primary ? " home-journey--primary" : ""}`} style={{ display: "block", color: "#fff", textDecoration: "none" }}>
      <div style={{ position: "relative", height: "100%", minHeight: primary ? "clamp(520px,64vw,820px)" : "clamp(250px,31vw,400px)", overflow: "hidden", background: "#050505" }}>
        <img src={media.src} alt={media.alt} loading="lazy" decoding="async" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: media.objectPosition ?? "50% 50%" }} />
        <div aria-hidden style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg,rgba(0,0,0,.04),rgba(0,0,0,.12) 45%,rgba(0,0,0,.88))" }} />
        <div style={{ position: "absolute", inset: "auto 0 0", padding: "clamp(22px,3.5vw,46px)" }}>
          <div style={{ ...mono, color: item.accent }}>{item.eyebrow}</div>
          <h3 style={{ ...display, margin: "10px 0 0", fontSize: primary ? "clamp(46px,7vw,94px)" : "clamp(30px,4vw,50px)", lineHeight: .88 }}>{item.title}</h3>
          <p style={{ margin: "14px 0 0", maxWidth: 520, color: "rgba(255,255,255,.8)", fontSize: "clamp(14px,1.15vw,17px)", lineHeight: 1.55 }}>{item.line}</p>
        </div>
      </div>
    </Link>
  );
}

export default function Home() {
  return (
    <PublicShell>
      <AtlasHero />

      <section style={{ background: "#fff", color: T.ink }}>
        <div style={{ maxWidth: 1320, margin: "0 auto", padding: "clamp(54px,7vw,96px) clamp(20px,5vw,72px)" }}>
          <Reveal>
            <div style={{ display: "grid", gridTemplateColumns: "minmax(0,.72fr) minmax(280px,1fr)", gap: "clamp(28px,6vw,94px)", alignItems: "end" }} className="home-lens-intro">
              <div>
                <div style={{ ...mono, color: T.blue }}>ONE PLANET · FOUR PUBLIC LENSES</div>
                <h2 style={{ ...display, margin: "12px 0 0", fontSize: "clamp(38px,5.5vw,74px)", lineHeight: .92, maxWidth: "10ch" }}>One world. Different ways in.</h2>
              </div>
              <p style={{ margin: 0, maxWidth: 650, color: T.dim, fontSize: "clamp(16px,1.4vw,19px)", lineHeight: 1.62 }}>ATLAS, SPECIES, LIVING SYSTEMS and IMPACT stay connected to the same living-planet context. Change lens without losing the world.</p>
            </div>
          </Reveal>
          <div className="home-lens-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4,minmax(0,1fr))", gap: "clamp(18px,3vw,42px)", marginTop: "clamp(34px,5vw,58px)", borderTop: `1px solid ${T.lineStrong}` }}>
            {PRODUCTS.map((item) => <ProductLens key={item[0]} item={item} />)}
          </div>
        </div>
      </section>

      <section style={{ background: "#070707", color: "#fff" }}>
        <div style={{ maxWidth: 1320, margin: "0 auto", padding: "clamp(62px,8vw,112px) clamp(20px,5vw,72px)" }}>
          <div style={{ display: "flex", alignItems: "end", justifyContent: "space-between", gap: 24, flexWrap: "wrap" }}>
            <div>
              <div style={{ ...mono, color: "#3AE86F" }}>BEST OF 4PLANET · ENTER THROUGH LIFE</div>
              <h2 style={{ ...display, margin: "12px 0 0", fontSize: "clamp(38px,5.5vw,74px)", lineHeight: .92, maxWidth: "11ch" }}>Start with something alive.</h2>
            </div>
            <Link to="/species" style={{ ...mono, color: "rgba(255,255,255,.72)", textDecoration: "none" }}>EXPLORE SPECIES →</Link>
          </div>
          <div className="home-journey-grid" style={{ display: "grid", gridTemplateColumns: "minmax(0,1.35fr) minmax(280px,.65fr)", gap: 10, marginTop: "clamp(36px,5vw,64px)" }}>
            <FeaturedJourney item={FEATURED[0]} primary />
            <div style={{ display: "grid", gridTemplateRows: "1fr 1fr", gap: 10 }}>
              <FeaturedJourney item={FEATURED[1]} />
              <FeaturedJourney item={FEATURED[2]} />
            </div>
          </div>
        </div>
      </section>

      <section style={{ background: T.blue, color: "#fff" }}>
        <div style={{ maxWidth: 1320, margin: "0 auto", padding: "clamp(70px,10vw,150px) clamp(20px,5vw,72px)" }}>
          <div style={{ ...mono, color: "rgba(255,255,255,.6)" }}>THE PREMISE</div>
          <p style={{ ...display, margin: "18px 0 0", fontSize: "clamp(40px,7vw,98px)", lineHeight: .9, maxWidth: "13ch" }}>A healthy living planet is infrastructure for human life.</p>
          <div className="home-premise-foot" style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) auto", gap: 30, alignItems: "end", marginTop: 30 }}>
            <p style={{ margin: 0, maxWidth: 760, color: "rgba(255,255,255,.78)", fontSize: "clamp(16px,1.55vw,20px)", lineHeight: 1.62 }}>Food, water, climate regulation, materials, health and prosperity all sit inside living systems. 4PLANET connects understanding to credible action without pretending uncertainty is proof.</p>
            <Link to="/about/story" style={{ ...mono, color: "#fff", textDecoration: "none" }}>READ THE STORY →</Link>
          </div>
        </div>
      </section>

      <section id="worlds" style={{ background: "#050505", color: "#fff" }}>
        <div style={{ maxWidth: 1320, margin: "0 auto", padding: "clamp(56px,7vw,92px) clamp(20px,5vw,72px) 0" }}>
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

      <section style={{ background: "#fff", color: T.ink }}>
        <div style={{ maxWidth: 1320, margin: "0 auto", padding: "clamp(70px,9vw,126px) clamp(20px,5vw,72px)" }}>
          <div className="culture-home" style={{ display: "grid", gridTemplateColumns: "minmax(0,.78fr) minmax(0,1.22fr)", gap: "clamp(34px,7vw,100px)", alignItems: "center" }}>
            <div>
              <div style={{ ...mono, color: DOMAIN_ACCENT["4CULTURE_"] }}>4CULTURE_ · M4GAZINE</div>
              <h2 style={{ ...display, margin: "14px 0 0", fontSize: "clamp(40px,6vw,80px)", lineHeight: .9, maxWidth: "9ch" }}>Attention changes what becomes possible.</h2>
              <p style={{ margin: "22px 0 0", maxWidth: 570, color: T.dim, fontSize: "clamp(16px,1.35vw,18px)", lineHeight: 1.62 }}>M4GAZINE, film, art and play translate planetary intelligence into stories and experiences people can carry into culture.</p>
              <Link to="/magazine" style={{ ...mono, display: "inline-flex", marginTop: 24, color: DOMAIN_ACCENT["4CULTURE_"], textDecoration: "none" }}>ENTER M4GAZINE →</Link>
            </div>
            <Link to="/magazine" style={{ position: "relative", display: "block", minHeight: "clamp(430px,54vw,720px)", overflow: "hidden", background: "#050505" }}>
              <img src={img("cultureAnchor").src} alt={img("cultureAnchor").alt} loading="lazy" decoding="async" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: img("cultureAnchor").objectPosition ?? "50% 50%" }} />
            </Link>
          </div>
        </div>
      </section>

      <section style={{ background: T.paper, color: T.ink }}>
        <div style={{ maxWidth: 1320, margin: "0 auto", padding: "clamp(64px,8vw,112px) clamp(20px,5vw,72px)" }}>
          <div className="home-action-grid" style={{ display: "grid", gridTemplateColumns: "minmax(280px,.7fr) minmax(0,1.3fr)", gap: "clamp(40px,8vw,120px)" }}>
            <div>
              <div style={{ ...mono, color: T.blue }}>ACTION PATHWAYS · CURRENT PUBLIC STATUS</div>
              <h2 style={{ ...display, margin: "12px 0 0", fontSize: "clamp(34px,5vw,66px)", lineHeight: .93, maxWidth: "10ch" }}>Understand first. Then help.</h2>
              <p style={{ margin: "20px 0 0", maxWidth: 500, color: T.dim, fontSize: "clamp(15px,1.25vw,18px)", lineHeight: 1.6 }}>INTEL → ECOSYSTEM → SOLUTIONS → ACCELERATE → PROOF. Action stays closed or clearly marked while delivery and verification are still being built.</p>
            </div>
            <div style={{ borderTop: `1px solid ${T.lineStrong}` }}>
              {PATHWAYS.map(([title, status, to], index) => (
                <Link key={title} to={to} className="home-pathway" style={{ display: "grid", gridTemplateColumns: "38px 1fr auto", gap: "clamp(12px,3vw,28px)", alignItems: "center", padding: "clamp(20px,2.5vw,28px) 0", borderBottom: `1px solid ${T.line}`, color: T.ink, textDecoration: "none" }}>
                  <span style={{ ...mono, color: T.blue }}>0{index + 1}</span>
                  <span style={{ ...display, fontSize: "clamp(18px,2vw,27px)" }}>{title}</span>
                  <span style={{ ...mono, color: T.dim }}>{status}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Section pad="clamp(64px,8vw,112px)">
        <div className="home-take-part" style={{ display: "grid", gridTemplateColumns: "minmax(250px,.7fr) minmax(0,1.3fr)", gap: "clamp(34px,8vw,120px)", alignItems: "start" }}>
          <div>
            <div style={{ ...mono, color: T.blue }}>TAKE PART</div>
            <h2 style={{ ...display, margin: "12px 0 0", fontSize: "clamp(34px,5vw,64px)", lineHeight: .93, maxWidth: "9ch" }}>If you live here, you can help.</h2>
          </div>
          <div style={{ borderTop: `1px solid ${T.lineStrong}` }}>
            {[
              ["4PEOPLE", "Follow the work and participate as credible pathways open.", "/people"],
              ["4BRANDS", "Build environmental action people can understand and follow.", "/brands"],
              ["4PARTNERS", "Bring field delivery and ecological work into the system.", "/partners"],
              ["4FUNDERS", "Help build long-term infrastructure for ecological action.", "/funders"],
            ].map(([title, line, to]) => (
              <Link key={title} to={to} className="home-participate" style={{ display: "grid", gridTemplateColumns: "minmax(120px,.35fr) minmax(0,1fr) auto", gap: 24, alignItems: "baseline", padding: "20px 0", borderBottom: `1px solid ${T.line}`, color: T.ink, textDecoration: "none" }}>
                <span style={{ ...display, fontSize: "clamp(18px,2vw,26px)" }}>{title}</span>
                <span style={{ color: T.dim, fontSize: 14, lineHeight: 1.5 }}>{line}</span>
                <span style={{ ...mono, color: T.blue }}>ENTER →</span>
              </Link>
            ))}
          </div>
        </div>
      </Section>

      <style>{`
        .home-lens,.home-pathway,.home-participate{transition:transform .2s ease,opacity .2s ease}.home-lens:hover,.home-pathway:hover,.home-participate:hover{transform:translateX(5px)}
        .home-world img,.home-journey img,.culture-home img{transition:transform .7s cubic-bezier(.2,.7,.2,1)}.home-world:hover img,.home-journey:hover img,.culture-home a:hover img{transform:scale(1.018)}
        @media(max-width:900px){.home-lens-intro,.home-world-intro,.home-premise-foot,.home-action-grid,.home-take-part,.culture-home{grid-template-columns:1fr!important}.home-lens-grid{grid-template-columns:repeat(2,minmax(0,1fr))!important}.home-journey-grid{grid-template-columns:1fr!important}.culture-home{gap:36px!important}}
        @media(max-width:680px){.home-lens-grid,.home-world-grid{grid-template-columns:1fr!important}.home-journey--primary>div{min-height:520px!important}.home-participate{grid-template-columns:1fr auto!important;gap:8px 18px!important}.home-participate>span:nth-child(2){grid-column:1/3}.home-pathway{grid-template-columns:32px 1fr!important}.home-pathway>span:nth-child(3){grid-column:2}.home-lens{border-bottom:1px solid ${T.line}}}
        @media(prefers-reduced-motion:reduce){.home-lens,.home-pathway,.home-participate,.home-world img,.home-journey img,.culture-home img{transition:none!important}.home-lens:hover,.home-pathway:hover,.home-participate:hover{transform:none}.home-world:hover img,.home-journey:hover img,.culture-home a:hover img{transform:none}}
      `}</style>
    </PublicShell>
  );
}