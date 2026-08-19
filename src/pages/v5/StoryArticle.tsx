import { useParams, Link } from "react-router-dom";
import { T } from "@/styles/tokens";
import { PublicShell } from "@/components/layout/PublicShell";
import { Section } from "@/components/ui";
import { CinematicImage, Reveal } from "@/components/Cinematic";
import { Editorial } from "@/components/Editorial";
import { storyBySlug, STORIES } from "@/content/stories";
import { img } from "@/content/imageRegistry";
import { NotFound } from "@/pages/system";

const display: React.CSSProperties = { fontFamily: T.display, fontWeight: 500, letterSpacing: "-.035em" };
const mono: React.CSSProperties = { fontFamily: T.mono, fontSize: 10.5, letterSpacing: ".14em", textTransform: "uppercase" };

const JOURNEY: Record<string, { label: string; to: string; line: string }[]> = {
  "why-4planet-exists": [
    { label: "THE STORY", to: "/about/story", line: "Read the deeper 4PLANET premise." },
    { label: "THE SYSTEM", to: "/about/system", line: "See how the public product family fits together." },
  ],
  "the-four-domains": [
    { label: "ENTER THE DOMAINS", to: "/domains", line: "Move from the editorial model into the four living worlds." },
  ],
  "wh4les-migratory-intelligence": [
    { label: "ENTER WH4LES", to: "/missions/wh4les", line: "See the Mission, evidence state and Atlas context." },
    { label: "MEET ORCA", to: "/species/orca", line: "Continue through the SPECIES lens." },
  ],
  "credible-tree-pathway": [
    { label: "ENTER CLIM4TE", to: "/missions/clim4te", line: "See the Mission and its current pathway status." },
    { label: "VIEW IMPACT", to: "/impact/tree-unit", line: "Inspect the pathway without assuming it is open." },
  ],
  "amazonia-more-than-a-forest": [
    { label: "ENTER AM4ZONIA", to: "/missions/am4zonia", line: "See the Mission, Jaguar and Atlas context." },
    { label: "ENTER AMAZON RAINFOREST", to: "/ecosystems/amazon-rainforest", line: "Continue into the ecosystem world." },
  ],
  "making-impact-easy": [
    { label: "ENTER IMPACT", to: "/impact", line: "See pathway status and proof boundaries." },
  ],
};

export function StoryArticle() {
  const { slug } = useParams();
  const s = slug ? storyBySlug(slug) : undefined;
  if (!s) return <NotFound />;
  const more = STORIES.filter((x) => x.slug !== s.slug).slice(0, 3);
  const journey = JOURNEY[s.slug] ?? [];

  return (
    <PublicShell>
      <header style={{ background: "#fff", borderBottom: `1px solid ${T.line}` }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "clamp(44px,6vw,84px) clamp(20px,5vw,72px) clamp(38px,5vw,68px)" }}>
          <Reveal>
            <Link to="/magazine" style={{ ...mono, color: T.blue, textDecoration: "none" }}>M4GAZINE_ / {s.category.toUpperCase()}</Link>
            <h1 style={{ ...display, color: T.ink, fontSize: "clamp(40px,6vw,84px)", lineHeight: .94, maxWidth: "13ch", marginTop: 18 }}>{s.title}</h1>
            <p style={{ fontSize: "clamp(18px,1.8vw,24px)", color: T.dim, marginTop: 22, maxWidth: 760, lineHeight: 1.5 }}>{s.dek}</p>
            <div style={{ ...mono, color: T.dim, marginTop: 24 }}>{s.readMins} MIN READ · 4PLANET EDITORIAL</div>
          </Reveal>
        </div>
      </header>

      <CinematicImage meta={img(s.image)} height="min(72vh, 760px)" caption={`M4GAZINE / ${s.category.toUpperCase()}`} accent={T.blue} />

      <section style={{ background: "#fff" }}>
        <div style={{ maxWidth: 1120, margin: "0 auto", padding: "clamp(54px,8vw,110px) clamp(20px,5vw,72px)" }}>
          <div className="article-reading-grid" style={{ display: "grid", gridTemplateColumns: "minmax(150px,.28fr) minmax(0,1fr)", gap: "clamp(34px,7vw,100px)", alignItems: "start" }}>
            <aside style={{ position: "sticky", top: 96 }}>
              <div style={{ ...mono, color: T.blue }}>READING NOTE</div>
              <p style={{ marginTop: 12, color: T.dim, fontSize: 12.5, lineHeight: 1.6 }}>Editorial explains the system. Mission, Species, Atlas and Impact pages carry the current public evidence and operational status.</p>
            </aside>
            <div>
              <Editorial blocks={s.blocks} />

              {journey.length > 0 && (
                <div style={{ marginTop: "clamp(54px,7vw,90px)", paddingTop: 24, borderTop: `1px solid ${T.lineStrong}` }}>
                  <div style={{ ...mono, color: T.blue }}>CONTINUE THROUGH THE SYSTEM</div>
                  <div style={{ marginTop: 16, display: "grid", borderTop: `1px solid ${T.line}` }}>
                    {journey.map((item) => (
                      <Link key={item.to} to={item.to} className="article-journey-link" style={{ display: "grid", gridTemplateColumns: "minmax(150px,.42fr) 1fr auto", gap: 18, alignItems: "center", padding: "20px 0", borderBottom: `1px solid ${T.line}`, textDecoration: "none", color: T.ink }}>
                        <span style={{ ...display, fontSize: "clamp(18px,2vw,26px)" }}>{item.label}</span>
                        <span style={{ color: T.dim, fontSize: 13.5, lineHeight: 1.5 }}>{item.line}</span>
                        <span style={{ ...mono, color: T.blue }}>OPEN →</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ marginTop: "clamp(48px,6vw,80px)", borderTop: `1px solid ${T.line}`, paddingTop: 22, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
                <Link to="/magazine" style={{ ...mono, color: T.blue, textDecoration: "none" }}>← M4GAZINE</Link>
                <Link to="/about/story" style={{ ...mono, color: T.ink, textDecoration: "none" }}>WHY 4PLANET →</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Section pad="clamp(50px,7vw,92px)" bg={T.paper}>
        <div style={{ ...mono, color: T.blue, marginBottom: 24 }}>MORE FROM M4GAZINE</div>
        <div className="door-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "clamp(16px,2vw,28px)" }}>
          {more.map((m) => (
            <Link key={m.slug} to={"/magazine/" + m.slug} className="mag-related" style={{ display: "block", textDecoration: "none", borderTop: `1px solid ${T.lineStrong}`, paddingTop: 16 }}>
              <div style={{ position: "relative", aspectRatio: "3/2", overflow: "hidden", background: "#000" }}>
                <img src={img(m.image).src} alt={img(m.image).alt} loading="lazy" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
              <div style={{ paddingTop: 16 }}>
                <div style={{ ...mono, color: T.blue }}>{m.category.toUpperCase()}</div>
                <div style={{ ...display, fontSize: "clamp(18px,2vw,25px)", color: T.ink, marginTop: 8, lineHeight: 1.1 }}>{m.title}</div>
              </div>
            </Link>
          ))}
        </div>
      </Section>

      <style>{`
        .article-journey-link{transition:padding-left .18s ease}.article-journey-link:hover{padding-left:8px}
        .mag-related img{transition:transform .5s ease}.mag-related:hover img{transform:scale(1.018)}
        @media(max-width:760px){.article-reading-grid{grid-template-columns:1fr!important}.article-reading-grid aside{position:static!important;border-bottom:1px solid ${T.line};padding-bottom:20px}.article-journey-link{grid-template-columns:1fr auto!important}.article-journey-link>span:nth-child(2){grid-column:1/3}.door-grid{grid-template-columns:1fr!important}}
        @media(prefers-reduced-motion:reduce){.article-journey-link,.mag-related img{transition:none!important}.article-journey-link:hover{padding-left:0}.mag-related:hover img{transform:none}}
      `}</style>
    </PublicShell>
  );
}
