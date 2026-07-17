import { Link } from "react-router-dom";
import { T, DOMAIN_ACCENT } from "@/styles/tokens";
import { PublicShell } from "@/components/layout/PublicShell";
import { Section, Label, Button, StatusLabel } from "@/components/ui";
import { FIELD_NOTES } from "@/content/fieldNotes";
import { Img } from "@/components/Img";
import { img } from "@/content/imageRegistry";
import { STORIES } from "@/content/stories";
import type { DomainKey } from "@/types/content";

const dslug = (k: string) => k.replace("_", "").toLowerCase();
const ORDER: DomainKey[] = ["OCE4N_", "E4RTH_", "S4PIENS_", "4CULTURE_"];
const display: React.CSSProperties = { fontFamily: T.display, fontWeight: 500, letterSpacing: "-.03em" };

/* /stories — M4GAZINE editorial. Every lead: one image, one title, one route, one story. */
export function Stories() {
  const [lead, ...rest] = STORIES;
  return (
    <PublicShell>
      <Section pad="clamp(48px,7vw,96px)">
        <Label color={T.blue} style={{ marginBottom: 16 }}>M4GAZINE_</Label>
        <h1 style={{ ...display, color: T.ink, fontSize: "clamp(32px,4vw,60px)", lineHeight: 1, maxWidth: 880 }}>A cultural field guide for a living planet.</h1>
        <p style={{ fontSize: "clamp(16px,2vw,18.5px)", color: T.ink, opacity: .7, marginTop: 22, maxWidth: 680, lineHeight: 1.6 }}>
          Where 4Planet publishes the stories, ideas and solutions that make environmental challenges visible and worth acting on. Not fear — momentum.
        </p>

        {/* LEAD FEATURE — one image, one title, one route, one story */}
        <Link to={"/stories/" + lead.slug} className="mag-lead-single" style={{ display: "block", textDecoration: "none", color: "inherit", marginTop: "clamp(36px,5vw,60px)" }}>
          <Img meta={img(lead.image)} ratio="16/9" caption={`LEAD FEATURE · ${lead.category.toUpperCase()}`} accent={T.blue} />
          <div style={{ marginTop: 18, maxWidth: 720 }}>
            <span className="mono" style={{ fontSize: 11, color: T.blue, letterSpacing: ".1em" }}>{lead.category.toUpperCase()} · {lead.readMins} MIN</span>
            <h2 style={{ ...display, fontSize: "clamp(26px,3.2vw,42px)", lineHeight: 1.03, marginTop: 10 }}>{lead.title}</h2>
            <p style={{ fontSize: 16, color: T.ink, opacity: .7, marginTop: 12, lineHeight: 1.55 }}>{lead.dek}</p>
          </div>
        </Link>

        {/* ARTICLE GRID */}
        <div className="story-rail" style={{ marginTop: "clamp(44px,6vw,72px)" }}>
          {rest.map((s) => (
            <Link key={s.slug} to={"/stories/" + s.slug} style={{ textDecoration: "none", color: "inherit" }}>
              <Img meta={img(s.image)} ratio="3/2" />
              <span className="mono" style={{ fontSize: 11, color: T.blue, letterSpacing: ".08em", display: "block", marginTop: 12 }}>{s.category.toUpperCase()}</span>
              <h3 style={{ ...display, fontSize: "clamp(17px,1.9vw,22px)", marginTop: 6, lineHeight: 1.15 }}>{s.title}</h3>
              <p style={{ fontSize: 14, color: T.ink, opacity: .62, marginTop: 8, lineHeight: 1.5 }}>{s.dek}</p>
            </Link>
          ))}
        </div>

        {/* FIELD NOTES rail (domain notes) */}
        <div style={{ marginTop: "clamp(44px,6vw,72px)" }}>
          <Label style={{ marginBottom: 14 }}>Field Notes</Label>
          <div style={{ borderTop: `1px solid ${T.lineStrong}` }}>
            {ORDER.map((dk) => { const fn = FIELD_NOTES[dk]; const acc = DOMAIN_ACCENT[dk]; return (
              <Link key={dk} to={"/domains/" + dslug(dk)} className="hov fieldnote-row" style={{ display: "grid", gridTemplateColumns: "minmax(120px,180px) 1fr auto", gap: "clamp(12px,3vw,32px)", alignItems: "center", padding: "22px 0", borderBottom: `1px solid ${T.line}`, textDecoration: "none", color: "inherit" }}>
                <span><StatusLabel accent={acc}>{fn.label}</StatusLabel><span className="mono" style={{ fontSize: 10.5, color: T.ink, opacity: .5, marginTop: 8, display: "block" }}>{fn.kind} · {dk.replace("_", "")}</span></span>
                <span><span style={{ fontWeight: 500, fontSize: "clamp(17px,2vw,22px)", letterSpacing: "-.02em", display: "block" }}>{fn.title}</span><span style={{ fontSize: 14, color: T.ink, opacity: .65, display: "block", marginTop: 6, lineHeight: 1.5 }}>{fn.dek}</span></span>
                <span style={{ color: acc }}>→</span>
              </Link>
            ); })}
          </div>
        </div>
      </Section>
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
          <div className="mono" style={{ fontSize: 11, color: T.blue, letterSpacing: ".08em" }}>FIRST RELEASE IN DEVELOPMENT</div>
          <p style={{ fontSize: 14.5, color: T.dim, marginTop: 12, lineHeight: 1.55 }}>
            This part of 4Culture is being prepared. The brand story and mission dossiers are live now in M4GAZINE_.
          </p>
        </div>
        <div style={{ marginTop: 26, display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Button to="/stories" arrow>READ M4GAZINE_</Button>
          <Button to="/domains">ENTER DOMAINS_</Button>
        </div>
      </Section>
    </PublicShell>
  );
}

export const CultureFilm = () => <CulturePage code="4FILM_" title="Films that make the stakes visible." body="Films and moving-image projects that bring the living world — and what threatens it — into clear view." />;
export const CultureTelier = () => <CulturePage code="4TELIER_" title="Art and visual worlds for ecological attention." body="Art, exhibitions and visual worlds that hold attention on the systems we depend on." />;
export const CulturePlay = () => <CulturePage code="4PLAY_" title="Music and sound that carry the work further." body="Music, sound and cultural releases that move the work beyond the page and screen." />;
