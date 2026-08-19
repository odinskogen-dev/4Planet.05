import { Link } from "react-router-dom";
import { T, DOMAIN_ACCENT } from "@/styles/tokens";
import { PublicShell } from "@/components/layout/PublicShell";
import { Section } from "@/components/ui";
import { Reveal } from "@/components/Cinematic";
import { img, type ImageKey } from "@/content/imageRegistry";
import type { DomainKey } from "@/types/content";
import { AtlasHero } from "./AtlasHero";

const PRODUCTS = [
  { no: "01", name: "ATLAS", tag: "EXPLORE", line: "See the living planet in place — observations, species, pressures and context.", to: "/atlas", accent: T.blue },
  { no: "02", name: "SPECIES", tag: "MEET LIFE", line: "Enter the world of a species, then follow its habitat, relationships and evidence.", to: "/species", accent: "#3AE86F" },
  { no: "03", name: "LIVING SYSTEMS", tag: "UNDERSTAND", line: "Follow dependencies, pressures and responses across connected living systems.", to: "/living-systems", accent: "#FF4D22" },
  { no: "04", name: "IMPACT", tag: "ACT", line: "Follow credible action pathways as their delivery and proof systems become ready.", to: "/impact", accent: "#3AE86F" },
] as const;

const ORDER: DomainKey[] = ["OCE4N_", "E4RTH_", "S4PIENS_", "4CULTURE_"];
const dslug = (k: string) => k.replace("_", "").toLowerCase();
const mono: React.CSSProperties = { fontFamily: T.mono, fontSize: 10.5, letterSpacing: ".14em", textTransform: "uppercase" };
const display: React.CSSProperties = { fontFamily: T.display, fontWeight: 500, letterSpacing: "-.04em" };

const WORLDS: Record<DomainKey, { line: string; image: ImageKey; missions: string[] }> = {
  "OCE4N_": { line: "The living ocean — movement, coasts, reefs, migration and the systems beneath the surface.", image: "oce4nDomainHero", missions: ["CLE4N", "WH4LES", "COR4L", "RE:WILD"] },
  "E4RTH_": { line: "The living land — forests, freshwater, soil, species and recovery.", image: "e4rthDomainHero", missions: ["CLIM4TE", "AM4ZONIA", "SPECIES", "RE:WILD"] },
  "S4PIENS_": { line: "Human systems — food, energy, cities and materials shaping planetary pressure.", image: "s4piensDomainHero", missions: ["FOOD", "EN4RGY", "CIRCULAR CITY", "F4SHION"] },
  "4CULTURE_": { line: "Culture — story, film, art and play that shape attention, meaning and participation.", image: "cultureAnchor", missions: ["M4GAZINE", "4FILM", "4RT", "4PLAY"] },
};

const FEATURED: { eyebrow: string; title: string; line: string; to: string; image: ImageKey; accent: string }[] = [
  { eyebrow: "SPECIES × ATLAS × AM4ZONIA", title: "Jaguar", line: "Start with one species, then move into rainforest, observations, pressures and the wider system.", to: "/species/jaguar", image: "amazoniaHero", accent: DOMAIN_ACCENT.E4RTH_ },
  { eyebrow: "SPECIES × ATLAS × WH4LES", title: "Orca", line: "A species world built around family, culture, place, pressure and evidence boundaries.", to: "/species/orca", image: "wh4lesHero", accent: DOMAIN_ACCENT.OCE4N_ },
  { eyebrow: "S4PIENS × SPECIES", title: "Homo sapiens", line: "Put humans back inside the living system — as a species with dependencies, choices and pressures.", to: "/species/homo-sapiens", image: "s4piensDomainHero", accent: DOMAIN_ACCENT.S4PIENS_ },
  { eyebrow: "4CULTURE × EDITORIAL", title: "M4GAZINE", line: "Stories and field intelligence for seeing the living planet more clearly.", to: "/magazine", image: "cultureAnchor", accent: DOMAIN_ACCENT["4CULTURE_"] },
];

const PATHWAYS = [
  ["01", "PLANT TREES", "PARTNER VALIDATION", "/impact/tree-unit"],
  ["02", "CLEAN OCEAN PLASTIC", "IN DEVELOPMENT", "/impact/ocean-waste"],
  ["03", "PROTECT AMAZON RAINFOREST", "IN DEVELOPMENT", "/impact/amazon-square"],
  ["04", "REWILD DEGRADED LAND", "IN DEVELOPMENT", "/impact/habitat-recovery"],
] as const;

function ProductRow({ product }: { product: typeof PRODUCTS[number] }) {
  return (
    <Link to={product.to} className="home-product-row" style={{ display: "grid", gridTemplateColumns: "54px minmax(180px,.5fr) minmax(0,1fr) auto", gap: "clamp(14px,3vw,42px)", alignItems: "center", padding: "clamp(24px,3vw,38px) 0", borderBottom: `1px solid ${T.line}`, color: T.ink, textDecoration: "none" }}>
      <span style={{ ...mono, color: product.accent }}>{product.no}</span>
      <span style={{ ...display, fontSize: "clamp(23px,3vw,40px)" }}>{product.name}</span>
      <span><span style={{ ...mono, color: T.dim }}>{product.tag}</span><span style={{ display: "block", marginTop: 6, color: T.dim, fontSize: "clamp(14px,1.1vw,16.5px)", lineHeight: 1.5, maxWidth: 620 }}>{product.line}</span></span>
      <span aria-hidden style={{ ...mono, color: product.accent }}>OPEN →</span>
    </Link>
  );
}

function WorldTile({ dk }: { dk: DomainKey }) {
  const world = WORLDS[dk];
  const media = img(world.image);
  const accent = DOMAIN_ACCENT[dk];
  return (
    <Link to={`/domains/${dslug(dk)}`} className="home-world" style={{ position: "relative", minHeight: "clamp(420px,52vw,720px)", display: "flex", alignItems: "flex-end", overflow: "hidden", color: "#fff", textDecoration: "none", background: "#050505" }}>
      <img src={media.src} alt={media.alt} loading="lazy" decoding="async" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: media.objectPosition ?? "50% 50%" }} />
      <div aria-hidden style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg,rgba(0,0,0,.04),rgba(0,0,0,.12) 42%,rgba(0,0,0,.88))" }} />
      <div aria-hidden style={{ position: "absolute", top: 0, left: 0, width: 92, height: 4, background: accent }} />
      <div style={{ position: "relative", width: "100%", padding: "clamp(24px,4vw,54px)" }}>
        <div style={{ ...mono, color: accent }}>{dk}</div>
        <h3 style={{ ...display, marginTop: 11, fontSize: "clamp(38px,6vw,86px)", lineHeight: .86 }}>{dk.replace("_", "")}</h3>
        <p style={{ marginTop: 18, maxWidth: 520, color: "rgba(255,255,255,.82)", fontSize: "clamp(15px,1.25vw,18px)", lineHeight: 1.55 }}>{world.line}</p>
        <div style={{ ...mono, color: "rgba(255,255,255,.56)", marginTop: 18 }}>{world.missions.join(" · ")}</div>
      </div>
    </Link>
  );
}

function FeaturedCard({ item }: { item: typeof FEATURED[number] }) {
  const media = img(item.image);
  return (
    <Link to={item.to} className="home-feature" style={{ display: "block", textDecoration: "none", color: T.ink }}>
      <div style={{ position: "relative", aspectRatio: "4/3", overflow: "hidden", background: "#050505" }}>
        <img src={media.src} alt={media.alt} loading="lazy" decoding="async" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: media.objectPosition ?? "50% 50%" }} />
        <div aria-hidden style={{ position: "absolute", top: 0, left: 0, width: 72, height: 4, background: item.accent }} />
      </div>
      <div style={{ paddingTop: 16 }}>
        <div style={{ ...mono, color: item.accent }}>{item.eyebrow}</div>
        <h3 style={{ ...display, marginTop: 8, fontSize: "clamp(25px,3vw,42px)", lineHeight: .96 }}>{item.title}</h3>
        <p style={{ marginTop: 10, color: T.dim, fontSize: 14.5, lineHeight: 1.55, maxWidth: 460 }}>{item.line}</p>
      </div>
    </Link>
  );
}

export default function Home() {
  return (
    <PublicShell>
      <AtlasHero />

      <section style={{ background: "#fff", color: T.ink }}>
        <div style={{ maxWidth: 1320, margin: "0 auto", padding: "clamp(60px,8vw,120px) clamp(20px,5vw,72px)" }}>
          <Reveal>
            <div style={{ ...mono, color: T.blue }}>ONE PLANET · FOUR PUBLIC LENSES</div>
            <h2 style={{ ...display, marginTop: 12, fontSize: "clamp(34px,5vw,72px)", lineHeight: .94, maxWidth: "12ch" }}>Change lens without losing the world.</h2>
            <p style={{ marginTop: 20, maxWidth: 720, color: T.dim, fontSize: "clamp(16px,1.45vw,20px)", lineHeight: 1.65 }}>ATLAS, SPECIES, LIVING SYSTEMS and IMPACT are different ways into the same connected model — not four separate versions of reality.</p>
          </Reveal>
          <div style={{ marginTop: "clamp(42px,6vw,72px)", borderTop: `1px solid ${T.lineStrong}` }}>
            {PRODUCTS.map((product) => <ProductRow key={product.no} product={product} />)}
          </div>
        </div>
      </section>

      <section style={{ background: T.blue, color: "#fff" }}>
        <div style={{ maxWidth: 1320, margin: "0 auto", padding: "clamp(76px,11vw,170px) clamp(20px,5vw,72px)" }}>
          <div style={{ ...mono, color: "rgba(255,255,255,.62)" }}>THE PREMISE</div>
          <p style={{ ...display, marginTop: 20, fontSize: "clamp(40px,7vw,104px)", lineHeight: .9, maxWidth: "14ch" }}>A healthy living planet is infrastructure for human life.</p>
          <p style={{ marginTop: 28, maxWidth: 760, color: "rgba(255,255,255,.8)", fontSize: "clamp(17px,1.7vw,22px)", lineHeight: 1.62 }}>Food, water, climate regulation, materials, health and prosperity all sit inside living systems. Ecological integrity is not somewhere outside human self-interest.</p>
        </div>
      </section>

      <section style={{ background: T.paper, color: T.ink }}>
        <div style={{ maxWidth: 1320, margin: "0 auto", padding: "clamp(60px,8vw,120px) clamp(20px,5vw,72px)" }}>
          <Reveal>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 20, alignItems: "end", flexWrap: "wrap" }}>
              <div><div style={{ ...mono, color: T.blue }}>BEST OF 4PLANET</div><h2 style={{ ...display, marginTop: 10, fontSize: "clamp(34px,5vw,68px)", lineHeight: .94 }}>Start with a living world.</h2></div>
              <Link to="/atlas" style={{ ...mono, color: T.blue, textDecoration: "none" }}>EXPLORE EVERYTHING IN ATLAS →</Link>
            </div>
          </Reveal>
          <div className="home-feature-grid" style={{ display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: "clamp(34px,5vw,72px) clamp(22px,3vw,40px)", marginTop: "clamp(36px,5vw,64px)" }}>
            {FEATURED.map((item) => <FeaturedCard key={item.title} item={item} />)}
          </div>
        </div>
      </section>

      <section id="worlds" style={{ background: "#050505", color: "#fff" }}>
        <div style={{ maxWidth: 1320, margin: "0 auto", padding: "clamp(60px,8vw,110px) clamp(20px,5vw,72px) 0" }}>
          <div style={{ ...mono, color: T.acid }}>THE LIVING WORLD</div>
          <h2 style={{ ...display, marginTop: 12, fontSize: "clamp(36px,5.4vw,76px)", lineHeight: .92, maxWidth: "12ch" }}>Four connected domains.</h2>
          <p style={{ marginTop: 20, maxWidth: 700, color: "rgba(255,255,255,.62)", fontSize: "clamp(16px,1.45vw,19px)", lineHeight: 1.6 }}>The Planetary Map describes the world. Domains make that world navigable. Missions choose where 4PLANET acts.</p>
        </div>
        <div className="home-world-grid" style={{ display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", marginTop: "clamp(38px,5vw,70px)" }}>
          {ORDER.map((dk) => <WorldTile key={dk} dk={dk} />)}
        </div>
      </section>

      <section style={{ background: "#fff", color: T.ink }}>
        <div style={{ maxWidth: 1320, margin: "0 auto", padding: "clamp(64px,9vw,130px) clamp(20px,5vw,72px)" }}>
          <div className="culture-home" style={{ display: "grid", gridTemplateColumns: "minmax(0,.82fr) minmax(0,1.18fr)", gap: "clamp(34px,7vw,110px)", alignItems: "center" }}>
            <div>
              <div style={{ ...mono, color: DOMAIN_ACCENT["4CULTURE_"] }}>4CULTURE_ · ATTENTION IS INFRASTRUCTURE TOO</div>
              <h2 style={{ ...display, marginTop: 14, fontSize: "clamp(38px,6vw,82px)", lineHeight: .91, maxWidth: "10ch" }}>What people notice shapes what they protect.</h2>
              <p style={{ marginTop: 24, maxWidth: 620, color: T.dim, fontSize: "clamp(16px,1.4vw,19px)", lineHeight: 1.65 }}>M4GAZINE, film, art and play translate planetary intelligence into stories and experiences people can actually carry with them.</p>
              <Link to="/magazine" style={{ ...mono, display: "inline-flex", marginTop: 24, color: DOMAIN_ACCENT["4CULTURE_"], textDecoration: "none" }}>ENTER M4GAZINE →</Link>
            </div>
            <div style={{ position: "relative", minHeight: "clamp(500px,60vw,780px)", overflow: "hidden", background: "#050505" }}>
              <img src={img("cultureAnchor").src} alt={img("cultureAnchor").alt} loading="lazy" decoding="async" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: img("cultureAnchor").objectPosition ?? "50% 50%" }} />
            </div>
          </div>
        </div>
      </section>

      <section id="how" style={{ background: T.paper, color: T.ink }}>
        <div style={{ maxWidth: 1320, margin: "0 auto", padding: "clamp(64px,9vw,130px) clamp(20px,5vw,72px)" }}>
          <div style={{ ...mono, color: T.blue }}>HOW 4PLANET MOVES</div>
          <h2 style={{ ...display, marginTop: 12, fontSize: "clamp(34px,5vw,70px)", lineHeight: .94, maxWidth: "13ch" }}>From understanding to action — without skipping the truth.</h2>
          <div className="home-process" style={{ display: "grid", gridTemplateColumns: "repeat(5,minmax(0,1fr))", marginTop: "clamp(38px,5vw,64px)", borderTop: `1px solid ${T.lineStrong}` }}>
            {[
              ["01", "INTEL", "Understand what is happening and what is known."],
              ["02", "ECOSYSTEM", "Map the species, places, actors and relationships."],
              ["03", "SOLUTIONS", "Identify what could reduce pressure or restore function."],
              ["04", "ACCELERATE", "Bring credible actors, capital and participation together."],
              ["05", "PROOF", "Show what was actually delivered and evidenced."],
            ].map(([no, title, line]) => <div key={no} style={{ padding: "24px clamp(12px,2vw,24px) 0 0" }}><div style={{ ...mono, color: T.blue }}>{no}</div><div style={{ ...display, marginTop: 10, fontSize: "clamp(18px,2vw,25px)" }}>{title}</div><p style={{ marginTop: 10, color: T.dim, fontSize: 13.5, lineHeight: 1.55 }}>{line}</p></div>)}
          </div>
        </div>
      </section>

      <section style={{ background: "#fff", color: T.ink }}>
        <div style={{ maxWidth: 1320, margin: "0 auto", padding: "clamp(60px,8vw,120px) clamp(20px,5vw,72px)" }}>
          <div style={{ ...mono, color: T.blue }}>ACTION PATHWAYS · CURRENT PUBLIC STATUS</div>
          <h2 style={{ ...display, marginTop: 12, fontSize: "clamp(32px,4.6vw,64px)", lineHeight: .95, maxWidth: "13ch" }}>Nothing opens before the delivery model is ready.</h2>
          <div style={{ marginTop: 34, borderTop: `1px solid ${T.lineStrong}` }}>
            {PATHWAYS.map(([no, title, status, to]) => (
              <Link key={no} to={to} className="home-pathway" style={{ display: "grid", gridTemplateColumns: "54px 1fr auto auto", gap: "clamp(12px,3vw,34px)", alignItems: "center", padding: "clamp(21px,3vw,30px) 0", borderBottom: `1px solid ${T.line}`, textDecoration: "none", color: T.ink }}>
                <span style={{ ...mono, color: T.blue }}>{no}</span><span style={{ ...display, fontSize: "clamp(19px,2.4vw,30px)" }}>{title}</span><span style={{ ...mono, color: T.dim }}>{status}</span><span style={{ ...mono, color: T.blue }}>VIEW →</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <Section pad="clamp(64px,9vw,130px)">
        <div style={{ ...mono, color: T.blue }}>TAKE PART</div>
        <h2 style={{ ...display, marginTop: 12, fontSize: "clamp(34px,5vw,68px)", lineHeight: .94, maxWidth: "12ch" }}>There is more than one way to help.</h2>
        <div className="participate-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4,minmax(0,1fr))", marginTop: 36, borderTop: `1px solid ${T.lineStrong}`, borderLeft: `1px solid ${T.line}` }}>
          {[["4PEOPLE", "Follow the work and participate as credible pathways open.", "/join"], ["4BRANDS", "Build credible environmental action people can understand and follow.", "/brands"], ["4PARTNERS", "Bring field delivery and ecological work into the system.", "/partners"], ["4FUNDERS", "Help build long-term public infrastructure for ecological action.", "/funders"]].map(([title, line, to]) => (
            <Link key={title} to={to} style={{ padding: "clamp(24px,3vw,36px)", borderRight: `1px solid ${T.line}`, borderBottom: `1px solid ${T.line}`, textDecoration: "none", color: T.ink }}>
              <div style={{ ...display, fontSize: "clamp(21px,2.2vw,30px)" }}>{title}</div><p style={{ marginTop: 12, color: T.dim, fontSize: 14, lineHeight: 1.55 }}>{line}</p><div style={{ ...mono, color: T.blue, marginTop: 18 }}>ENTER →</div>
            </Link>
          ))}
        </div>
      </Section>

      <style>{`
        .home-product-row,.home-pathway{transition:padding-left .18s ease}.home-product-row:hover,.home-pathway:hover{padding-left:8px}
        .home-feature img,.home-world img{transition:transform .65s cubic-bezier(.2,.7,.2,1)}.home-feature:hover img,.home-world:hover img{transform:scale(1.018)}
        @media(max-width:900px){.home-process{grid-template-columns:repeat(2,minmax(0,1fr))!important}.participate-grid{grid-template-columns:repeat(2,minmax(0,1fr))!important}.culture-home{grid-template-columns:1fr!important}}
        @media(max-width:720px){.home-product-row{grid-template-columns:42px 1fr auto!important}.home-product-row>span:nth-child(3){grid-column:2/4}.home-feature-grid,.home-world-grid{grid-template-columns:1fr!important}.home-pathway{grid-template-columns:42px 1fr auto!important}.home-pathway>span:nth-child(3){grid-column:2}.home-process,.participate-grid{grid-template-columns:1fr!important}}
        @media(prefers-reduced-motion:reduce){.home-product-row,.home-pathway,.home-feature img,.home-world img{transition:none!important}.home-product-row:hover,.home-pathway:hover{padding-left:0}.home-feature:hover img,.home-world:hover img{transform:none}}
      `}</style>
    </PublicShell>
  );
}
