import { useParams, Link } from "react-router-dom";
import { T } from "@/styles/tokens";
import { PublicShell } from "@/components/layout/PublicShell";
import { Section } from "@/components/ui";
import { CinematicImage, Reveal } from "@/components/Cinematic";
import { Editorial } from "@/components/Editorial";
import { storyBySlug, STORIES } from "@/content/stories";
import { img } from "@/content/imageRegistry";
import { NotFound } from "@/pages/system";

const display: React.CSSProperties = { fontFamily: T.display, fontWeight: 500, letterSpacing: "-.03em" };

export function StoryArticle() {
  const { slug } = useParams();
  const s = slug ? storyBySlug(slug) : undefined;
  if (!s) return <NotFound />;
  const more = STORIES.filter((x) => x.slug !== s.slug).slice(0, 3);

  return (
    <PublicShell>
      <Section pad="clamp(48px,6vw,88px)">
        <Reveal>
          <div className="mono" style={{ fontSize: 11.5, letterSpacing: ".14em", color: T.blue, marginBottom: 22 }}>
            {s.category.toUpperCase()} · {s.readMins} MIN READ
          </div>
          <h1 style={{ ...display, color: T.ink, fontSize: "clamp(30px,4.6vw,60px)", lineHeight: 1.02, maxWidth: 900 }}>{s.title}</h1>
          <p style={{ fontSize: "clamp(17px,1.6vw,22px)", color: T.ink, opacity: .72, marginTop: 20, maxWidth: 680, lineHeight: 1.45 }}>{s.dek}</p>
        </Reveal>
      </Section>

      <CinematicImage meta={img(s.image)} height="min(64vh, 620px)" caption={`M4GAZINE / ${s.category.toUpperCase()}`} accent={T.blue} />

      <Section pad="clamp(48px,7vw,96px)">
        <Editorial blocks={s.blocks} />
        <div style={{ marginTop: "clamp(48px,6vw,80px)", borderTop: `1px solid ${T.line}`, paddingTop: 22, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
          <Link to="/stories" className="link" style={{ fontSize: 14, color: T.blue }}>← M4GAZINE</Link>
          <Link to="/people" className="link" style={{ fontSize: 14, color: T.ink }}>Join 4Planet →</Link>
        </div>
      </Section>

      <Section pad="clamp(40px,6vw,80px)" bg={T.paper}>
        <div className="mono" style={{ fontSize: 11.5, letterSpacing: ".14em", color: T.blue, marginBottom: 24 }}>MORE FROM M4GAZINE</div>
        <div className="door-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "clamp(16px,2vw,28px)" }}>
          {more.map((m) => (
            <Link key={m.slug} to={"/stories/" + m.slug} className="hov" style={{ display: "block", textDecoration: "none", border: `1px solid ${T.line}` }}>
              <div style={{ position: "relative", aspectRatio: "3/2", overflow: "hidden", background: "#000" }}>
                <img src={img(m.image).src} alt={img(m.image).alt} loading="lazy" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
              <div style={{ padding: "18px 18px 22px" }}>
                <div className="mono" style={{ fontSize: 10.5, letterSpacing: ".12em", color: T.blue }}>{m.category.toUpperCase()}</div>
                <div style={{ ...display, fontSize: 19, color: T.ink, marginTop: 8, lineHeight: 1.15 }}>{m.title}</div>
              </div>
            </Link>
          ))}
        </div>
      </Section>
    </PublicShell>
  );
}
