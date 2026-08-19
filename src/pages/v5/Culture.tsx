import { Link } from "react-router-dom";
import { T, DOMAIN_ACCENT } from "@/styles/tokens";
import { PublicShell } from "@/components/layout/PublicShell";
import { Section, Label, Button, StatusLabel } from "@/components/ui";
import { FIELD_NOTES } from "@/content/fieldNotes";
import { Img } from "@/components/Img";
import { img } from "@/content/imageRegistry";
import { STORIES, type StoryCategory } from "@/content/stories";
import type { DomainKey } from "@/types/content";

const dslug = (k: string) => k.replace("_", "").toLowerCase();
const ORDER: DomainKey[] = ["OCE4N_", "E4RTH_", "S4PIENS_", "4CULTURE_"];
const display: React.CSSProperties = { fontFamily: T.display, fontWeight: 500, letterSpacing: "-.035em" };
const mono: React.CSSProperties = { fontFamily: T.mono, fontSize: 10.5, letterSpacing: ".14em", textTransform: "uppercase" };

const CATEGORY_ORDER: StoryCategory[] = ["Perspectives", "Mission Stories", "Solutions"];

function StoryCard({ slug, image, category, readMins, title, dek, large = false }: { slug: string; image: Parameters<typeof img>[0]; category: string; readMins: number; title: string; dek: string; large?: boolean }) {
  return (
    <Link to={`/magazine/${slug}`} className="mag-story" style={{ display: "block", color: T.ink, textDecoration: "none" }}>
      <div style={{ overflow: "hidden", background: "#050505" }}>
        <Img meta={img(image)} ratio={large ? "16/10" : "3/2"} />
      </div>
      <div style={{ paddingTop: 15 }}>
        <div style={{ ...mono, color: T.blue }}>{category.toUpperCase()} · {readMins} MIN</div>
        <h3 style={{ ...display, marginTop: 8, fontSize: large ? "clamp(25px,3vw,42px)" : "clamp(19px,2vw,27px)", lineHeight: 1.04 }}>{title}</h3>
        <p style={{ marginTop: 10, color: T.dim, fontSize: "clamp(14px,1.1vw,16px)", lineHeight: 1.55, maxWidth: 620 }}>{dek}</p>
      </div>
    </Link>
  );
}

/* /stories + /magazine — one real editorial universe. */
export function Stories() {
  const [lead, second, ...rest] = STORIES;
  return (
    <PublicShell>
      <header style={{ background: "#fff", color: T.ink, borderBottom: `1px solid ${T.lineStrong}` }}>
        <div style={{ maxWidth: 1380, margin: "0 auto", padding: "clamp(50px,7vw,96px) clamp(20px,5vw,72px) 24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 18, alignItems: "end", flexWrap: "wrap" }}>
            <div>
              <div style={{ ...mono, color: T.blue }}>4CULTURE_ / EDITORIAL</div>
              <h1 style={{ ...display, marginTop: 8, fontSize: "clamp(54px,10vw,154px)", lineHeight: .78, letterSpacing: "-.06em" }}>M4GAZINE_</h1>
            </div>
            <p style={{ margin: 0, maxWidth: 470, color: T.dim, fontSize: "clamp(15px,1.3vw,18px)", lineHeight: 1.55 }}>Stories, field intelligence and ideas for seeing the living planet more clearly.</p>
          </div>
          <nav aria-label="Magazine sections" style={{ display: "flex", gap: 18, flexWrap: "wrap", marginTop: 28, paddingTop: 16, borderTop: `1px solid ${T.line}` }}>
            {CATEGORY_ORDER.map((category) => <a key={category} href={`#${category.toLowerCase().replace(/\s+/g, "-")}`} style={{ ...mono, color: T.ink, textDecoration: "none" }}>{category}</a>)}
            <a href="#field-notes" style={{ ...mono, color: T.ink, textDecoration: "none" }}>FIELD NOTES</a>
          </nav>
        </div>
      </header>

      <section style={{ background: "#050505", color: "#fff" }}>
        <div style={{ maxWidth: 1380, margin: "0 auto", padding: "clamp(34px,5vw,70px) clamp(20px,5vw,72px) clamp(48px,7vw,96px)" }}>
          <div style={{ ...mono, color: T.acid }}>COVER STORY</div>
          <Link to={`/magazine/${lead.slug}`} className="mag-cover" style={{ display: "grid", gridTemplateColumns: "minmax(0,1.35fr) minmax(280px,.65fr)", gap: "clamp(24px,5vw,72px)", alignItems: "end", marginTop: 18, color: "#fff", textDecoration: "none" }}>
            <div style={{ overflow: "hidden", minHeight: 360 }}><Img meta={img(lead.image)} ratio="16/10" /></div>
            <div style={{ paddingBottom: 4 }}>
              <div style={{ ...mono, color: T.acid }}>{lead.category.toUpperCase()} · {lead.readMins} MIN READ</div>
              <h2 style={{ ...display, marginTop: 12, fontSize: "clamp(38px,5.6vw,78px)", lineHeight: .9, maxWidth: "10ch" }}>{lead.title}</h2>
              <p style={{ marginTop: 20, color: "rgba(255,255,255,.72)", fontSize: "clamp(15px,1.3vw,18px)", lineHeight: 1.58 }}>{lead.dek}</p>
              <div style={{ ...mono, color: T.acid, marginTop: 24 }}>READ STORY →</div>
            </div>
          </Link>
        </div>
      </section>

      <section style={{ background: "#fff", color: T.ink }}>
        <div style={{ maxWidth: 1380, margin: "0 auto", padding: "clamp(56px,8vw,110px) clamp(20px,5vw,72px)" }}>
          {second && (
            <div style={{ display: "grid", gridTemplateColumns: "minmax(0,.85fr) minmax(0,1.15fr)", gap: "clamp(28px,6vw,90px)", alignItems: "center", paddingBottom: "clamp(54px,8vw,100px)", borderBottom: `1px solid ${T.lineStrong}` }} className="mag-secondary">
              <div>
                <div style={{ ...mono, color: T.blue }}>EDITOR'S PICK</div>
                <h2 style={{ ...display, marginTop: 12, fontSize: "clamp(34px,5vw,68px)", lineHeight: .95 }}>{second.title}</h2>
                <p style={{ marginTop: 18, color: T.dim, fontSize: "clamp(15px,1.4vw,18px)", lineHeight: 1.6 }}>{second.dek}</p>
                <Link to={`/magazine/${second.slug}`} style={{ ...mono, display: "inline-flex", marginTop: 22, color: T.blue, textDecoration: "none" }}>READ STORY →</Link>
              </div>
              <Img meta={img(second.image)} ratio="4/3" />
            </div>
          )}

          <div style={{ marginTop: "clamp(56px,8vw,100px)" }}>
            <div style={{ ...mono, color: T.blue }}>LATEST</div>
            <div className="mag-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: "clamp(28px,3vw,44px)", marginTop: 22 }}>
              {rest.map((s) => <StoryCard key={s.slug} slug={s.slug} image={s.image} category={s.category} readMins={s.readMins} title={s.title} dek={s.dek} />)}
            </div>
          </div>
        </div>
      </section>

      {CATEGORY_ORDER.map((category, ci) => {
        const stories = STORIES.filter((story) => story.category === category);
        return (
          <section id={category.toLowerCase().replace(/\s+/g, "-")} key={category} style={{ background: ci % 2 === 0 ? T.paper : "#fff", borderTop: `1px solid ${T.line}` }}>
            <div style={{ maxWidth: 1380, margin: "0 auto", padding: "clamp(52px,7vw,90px) clamp(20px,5vw,72px)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 18, alignItems: "baseline", flexWrap: "wrap" }}>
                <h2 style={{ ...display, fontSize: "clamp(30px,4vw,56px)", lineHeight: 1 }}>{category}</h2>
                <span style={{ ...mono, color: T.dim }}>{String(stories.length).padStart(2, "0")} STORIES</span>
              </div>
              <div style={{ marginTop: 26, borderTop: `1px solid ${T.lineStrong}` }}>
                {stories.map((s, i) => (
                  <Link key={s.slug} to={`/magazine/${s.slug}`} className="mag-index-row" style={{ display: "grid", gridTemplateColumns: "54px minmax(0,1.15fr) minmax(180px,.65fr) auto", gap: "clamp(12px,3vw,42px)", alignItems: "center", padding: "clamp(22px,3vw,34px) 0", borderBottom: `1px solid ${T.line}`, color: T.ink, textDecoration: "none" }}>
                    <span style={{ ...mono, color: T.blue }}>{String(i + 1).padStart(2, "0")}</span>
                    <span style={{ ...display, fontSize: "clamp(20px,2.3vw,32px)", lineHeight: 1.05 }}>{s.title}</span>
                    <span style={{ color: T.dim, fontSize: 13.5, lineHeight: 1.5 }}>{s.dek}</span>
                    <span style={{ ...mono, color: T.blue }}>{s.readMins} MIN →</span>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        );
      })}

      <section id="field-notes" style={{ background: "#050505", color: "#fff" }}>
        <div style={{ maxWidth: 1380, margin: "0 auto", padding: "clamp(58px,8vw,110px) clamp(20px,5vw,72px)" }}>
          <div style={{ ...mono, color: T.acid }}>FIELD NOTES</div>
          <h2 style={{ ...display, marginTop: 12, fontSize: "clamp(34px,5vw,70px)", lineHeight: .95, maxWidth: "12ch" }}>Four windows into the living world.</h2>
          <div style={{ marginTop: 30, borderTop: "1px solid rgba(255,255,255,.18)" }}>
            {ORDER.map((dk) => {
              const fn = FIELD_NOTES[dk];
              const acc = DOMAIN_ACCENT[dk];
              return (
                <Link key={dk} to={"/domains/" + dslug(dk)} style={{ display: "grid", gridTemplateColumns: "minmax(120px,180px) 1fr auto", gap: "clamp(12px,3vw,32px)", alignItems: "center", padding: "22px 0", borderBottom: "1px solid rgba(255,255,255,.15)", textDecoration: "none", color: "#fff" }} className="fieldnote-row">
                  <span><StatusLabel accent={acc}>{fn.label}</StatusLabel><span style={{ ...mono, color: "rgba(255,255,255,.42)", marginTop: 8, display: "block" }}>{fn.kind} · {dk.replace("_", "")}</span></span>
                  <span><span style={{ fontWeight: 500, fontSize: "clamp(17px,2vw,22px)", letterSpacing: "-.02em", display: "block" }}>{fn.title}</span><span style={{ fontSize: 14, color: "rgba(255,255,255,.62)", display: "block", marginTop: 6, lineHeight: 1.5 }}>{fn.dek}</span></span>
                  <span style={{ color: acc }}>→</span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <style>{`
        .mag-story img,.mag-cover img{transition:transform .6s cubic-bezier(.2,.7,.2,1)}
        .mag-story:hover img,.mag-cover:hover img{transform:scale(1.018)}
        .mag-index-row{transition:padding-left .18s ease}
        .mag-index-row:hover{padding-left:8px}
        @media(max-width:920px){.mag-cover{grid-template-columns:1fr!important}.mag-secondary{grid-template-columns:1fr!important}.mag-grid{grid-template-columns:repeat(2,minmax(0,1fr))!important}}
        @media(max-width:650px){.mag-grid{grid-template-columns:1fr!important}.mag-index-row{grid-template-columns:42px 1fr auto!important}.mag-index-row>span:nth-child(3){grid-column:2/4}.fieldnote-row{grid-template-columns:1fr auto!important}.fieldnote-row>span:nth-child(2){grid-column:1/3}}
        @media(prefers-reduced-motion:reduce){.mag-story img,.mag-cover img,.mag-index-row{transition:none!important}.mag-story:hover img,.mag-cover:hover img{transform:none}}
      `}</style>
    </PublicShell>
  );
}

function CulturePage({ code, title, body }: { code: string; title: string; body: string }) {
  return (
    <PublicShell>
      <Section pad="clamp(48px,7vw,96px)">
        <Label color={T.blue} style={{ marginBottom: 16 }}>{code}</Label>
        <h1 style={{ fontWeight: 500, color: T.ink, fontSize: "clamp(30px,3.6vw,52px)", letterSpacing: "-.035em", lineHeight: 1.04, maxWidth: 820 }}>{title}</h1>
        <p style={{ fontSize: "clamp(16px,2vw,18px)", color: T.dim, marginTop: 20, maxWidth: 640, lineHeight: 1.6 }}>{body}</p>
        <div style={{ marginTop: 30, border: `1px solid ${T.line}`, padding: "clamp(22px,3vw,38px)", maxWidth: 640 }}>
          <div style={{ ...mono, color: T.blue }}>FIRST RELEASE IN DEVELOPMENT</div>
          <p style={{ fontSize: 14.5, color: T.dim, marginTop: 12, lineHeight: 1.55 }}>This part of 4CULTURE is being prepared. M4GAZINE is the active editorial surface now.</p>
        </div>
        <div style={{ marginTop: 26, display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Button to="/magazine" arrow>READ M4GAZINE</Button>
          <Button to="/domains/4culture">ENTER 4CULTURE</Button>
        </div>
      </Section>
    </PublicShell>
  );
}

export const CultureFilm = () => <CulturePage code="4FILM_" title="Films that make the stakes visible." body="Films and moving-image projects that bring the living world — and what threatens it — into clear view." />;
export const CultureTelier = () => <CulturePage code="4RT_" title="Art and visual worlds for ecological attention." body="Art, photography, illustration and design that hold attention on the systems we depend on and connect back to Missions." />;
export const CulturePlay = () => <CulturePage code="4PLAY_" title="Sound, play and cultural participation." body="Music, sound and participatory formats that move the work beyond the page and screen." />;
