import { Link } from "react-router-dom";
import { PublicShell } from "@/components/layout/PublicShell";
import { Seo } from "@/components/Seo";
import { trackEvent } from "@/analytics/Analytics";
import { STORIES } from "@/content/stories";
import { FIELD_NOTES } from "@/content/fieldNotes";
import { FOUNDING_EDITION, MAGAZINE_EDITORIAL_PRINCIPLES } from "@/content/magazineEditorial";
import { img } from "@/content/imageRegistry";
import { DOMAIN_ACCENT } from "@/styles/tokens";
import type { DomainKey } from "@/types/content";
import "@/styles/magazine.css";

const DOMAIN_ORDER: DomainKey[] = ["OCE4N_", "E4RTH_", "S4PIENS_", "4CULTURE_"];

function EditorialNav() {
  return (
    <nav className="mag-topic-nav" aria-label="Magazine editorial information">
      <span className="mag-topic-label">4PLANET MAGAZINE</span>
      <Link to="/magazine/about">ABOUT</Link>
      <Link to="/magazine/sources">SOURCES & METHOD</Link>
      <Link to="/magazine/corrections">CORRECTIONS</Link>
    </nav>
  );
}

export default function Magazine() {
  const hero = img("m4gazineHero");

  return (
    <PublicShell>
      <Seo
        title="4PLANET MAGAZINE — What Holds"
        description="4PLANET MAGAZINE reports on the living planet through species, places, pressures, people, culture, science and attempted solutions. Founding Edition: WHAT HOLDS."
        path="/magazine"
        image={hero.src}
      />
      <div className="magazine">
        <section className="mag-hero" aria-labelledby="magazine-title">
          <img className="mag-hero-media" src={hero.src} alt={hero.alt} />
          <div className="mag-hero-shade" aria-hidden />
          <div className="mag-hero-topline">
            <span>4PLANET MAGAZINE / FOUNDING EDITION</span>
            <span>PRE-PUBLICATION</span>
          </div>
          <div className="mag-hero-copy">
            <p className="mag-kicker">WORKING EDITION 01</p>
            <h1 id="magazine-title">{FOUNDING_EDITION.workingTitle}</h1>
            <p>{FOUNDING_EDITION.subtitle}</p>
            <a className="mag-read-link" href="#founding-edition">ENTER THE EDITION <span aria-hidden>↓</span></a>
          </div>
        </section>

        <div className="mag-spectrum" aria-hidden><span /><span /><span /><span /></div>
        <EditorialNav />

        <section className="mag-intro">
          <div className="mag-section-index">01 / EDITORIAL PURPOSE</div>
          <div className="mag-intro-copy">
            <h2>The living planet is a system of relationships.</h2>
            <p>4PLANET MAGAZINE exists to report on those relationships — between species, places, pressures, people, culture, science and attempted solutions. Its test is whether a story is true enough, useful enough, independent enough and well made enough to deserve a reader’s attention.</p>
            <p style={{ fontSize: 14, opacity: .7, marginTop: 18 }}>Editorial judgement is separate from 4PLANET commercial, partnership and fundraising judgement. A story does not require a call to action.</p>
          </div>
        </section>

        <section id="founding-edition" aria-label="Founding Edition" style={{ padding: "clamp(56px,8vw,112px) clamp(20px,5vw,72px)", background: "#f4f3ef" }}>
          <div style={{ maxWidth: 1320, margin: "0 auto" }}>
            <div className="mag-section-index">02 / WHAT HOLDS — WORKING TABLE OF CONTENTS</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,280px),1fr))", gap: 1, background: "rgba(0,0,0,.15)", marginTop: 32 }}>
              {FOUNDING_EDITION.items.map((item) => (
                <article key={item.id} style={{ background: "#f4f3ef", padding: "clamp(24px,3vw,38px)", minHeight: 320, display: "flex", flexDirection: "column" }}>
                  <p className="mag-kicker">{String(item.order).padStart(2, "0")} / {item.format}</p>
                  <h3 style={{ fontSize: "clamp(24px,2.4vw,36px)", lineHeight: 1.03, letterSpacing: "-.035em", margin: "22px 0 16px" }}>{item.title}</h3>
                  <p style={{ fontSize: 15, lineHeight: 1.58, maxWidth: 520 }}>{item.summary}</p>
                  <div className="mono" style={{ marginTop: "auto", paddingTop: 28, fontSize: 10.5, lineHeight: 1.55, letterSpacing: ".06em", opacity: .62 }}>
                    <div>{item.status.replace(/_/g, " ")}</div>
                    <div>{item.sourceState}</div>
                  </div>
                </article>
              ))}
            </div>
            <p style={{ marginTop: 22, maxWidth: 820, fontSize: 13, lineHeight: 1.55, opacity: .68 }}>These are editorial objects in a controlled pre-publication state. A listed story is not a published claim, commissioned contributor or completed article until its source, rights, responsibility and editorial gates are closed.</p>
          </div>
        </section>

        <section style={{ padding: "clamp(64px,9vw,120px) clamp(20px,5vw,72px)", background: "#fff" }}>
          <div style={{ maxWidth: 1320, margin: "0 auto", display: "grid", gridTemplateColumns: "minmax(0,.7fr) minmax(0,1.3fr)", gap: "clamp(28px,7vw,110px)" }} className="mag-editorial-principles">
            <div>
              <div className="mag-section-index">03 / INDEPENDENCE</div>
              <h2 style={{ fontSize: "clamp(34px,5vw,70px)", lineHeight: .98, letterSpacing: "-.045em", marginTop: 22 }}>The conclusion is not for sale.</h2>
            </div>
            <div style={{ display: "grid", gap: 0 }}>
              {MAGAZINE_EDITORIAL_PRINCIPLES.map((principle, index) => (
                <div key={principle} style={{ display: "grid", gridTemplateColumns: "42px 1fr", gap: 16, padding: "18px 0", borderTop: "1px solid rgba(0,0,0,.16)" }}>
                  <span className="mono" style={{ fontSize: 10.5, opacity: .52 }}>{String(index + 1).padStart(2, "0")}</span>
                  <p style={{ fontSize: "clamp(15px,1.4vw,18px)", lineHeight: 1.5 }}>{principle}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mag-dark-field">
          <div className="mag-dark-head">
            <div className="mag-section-index mag-section-index--dark">04 / FIELD NOTES</div>
            <h2>Four ways into one living planet.</h2>
          </div>
          <div className="mag-field-grid">
            {DOMAIN_ORDER.map((domain) => {
              const note = FIELD_NOTES[domain];
              return (
                <article className="mag-field-note" key={domain} style={{ "--mag-accent": DOMAIN_ACCENT[domain] } as React.CSSProperties}>
                  <div className="mag-field-accent" aria-hidden />
                  <p className="mag-kicker mag-kicker--dark">{domain.replace("_", "")} · {note.label}</p>
                  <h3>{note.title}</h3>
                  <p>{note.dek}</p>
                  <Link to={`/domains/${domain.replace("_", "").toLowerCase()}`}>EXPLORE CONTEXT <span aria-hidden>→</span></Link>
                </article>
              );
            })}
          </div>
        </section>

        <section style={{ padding: "clamp(64px,9vw,120px) clamp(20px,5vw,72px)", background: "#fff" }} aria-labelledby="owned-content-title">
          <div style={{ maxWidth: 1320, margin: "0 auto" }}>
            <div className="mag-section-index">05 / 4PLANET EXPLAINERS</div>
            <h2 id="owned-content-title" style={{ fontSize: "clamp(34px,5vw,68px)", lineHeight: 1, letterSpacing: "-.045em", maxWidth: 900, margin: "20px 0 16px" }}>Organisational stories, clearly separated from independent Magazine editorial.</h2>
            <p style={{ maxWidth: 760, fontSize: 15, lineHeight: 1.6, opacity: .7, marginBottom: 38 }}>These pieces explain 4PLANET’s own system and work. They are not presented as independent editorial reporting.</p>
            <div className="mag-story-grid" aria-label="4PLANET explainers">
              {STORIES.map((story, index) => {
                const media = img(story.image);
                const featureClass = index === 0 ? " mag-card--wide" : "";
                return (
                  <article className={`mag-card${featureClass}`} key={story.slug}>
                    <Link className="mag-card-media" to={`/magazine/${story.slug}`} aria-label={`Read ${story.title}`} onClick={() => trackEvent("magazine_story_open", { story_slug: story.slug, content_type: "4planet_explainer" })}>
                      <img src={media.src} alt={media.alt} loading="lazy" />
                    </Link>
                    <div className="mag-card-copy">
                      <p className="mag-kicker">4PLANET EXPLAINER · {story.readMins} MIN</p>
                      <h3><Link to={`/magazine/${story.slug}`} onClick={() => trackEvent("magazine_story_open", { story_slug: story.slug, content_type: "4planet_explainer" })}>{story.title}</Link></h3>
                      <p>{story.dek}</p>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="mag-last-word">
          <p className="mag-kicker">4PLANET MAGAZINE / TRANSPARENCY</p>
          <h2>Sources, uncertainty and corrections belong in the product.</h2>
          <div className="mag-last-actions">
            <Link to="/magazine/sources">HOW SOURCES WORK <span aria-hidden>→</span></Link>
            <Link to="/magazine/corrections">CORRECTIONS DESK <span aria-hidden>→</span></Link>
          </div>
        </section>
      </div>
    </PublicShell>
  );
}
