import { useEffect } from "react";
import { Link } from "react-router-dom";
import { PublicShell } from "@/components/layout/PublicShell";
import { Seo } from "@/components/Seo";
import { trackEvent } from "@/analytics/Analytics";
import { trackMagazineEntry } from "@/analytics/MagazineAnalytics";
import { STORIES } from "@/content/stories";
import { FIELD_NOTES } from "@/content/fieldNotes";
import { FOUNDING_EDITION, MAGAZINE_EDITORIAL_PRINCIPLES } from "@/content/magazineEditorial";
import { MAGAZINE_GOLD_BAR, MAGAZINE_LANES } from "@/content/magazineOperating";
import { FIELD_PARTNER_DISPATCHES } from "@/content/magazineEngine";
import { img } from "@/content/imageRegistry";
import { DOMAIN_ACCENT } from "@/styles/tokens";
import type { DomainKey } from "@/types/content";
import "@/styles/magazine.css";
import "@/styles/magazine-home.css";

const DOMAIN_ORDER: DomainKey[] = ["OCE4N_", "E4RTH_", "S4PIENS_", "4CULTURE_"];

function EditorialNav() {
  return (
    <>
      <nav className="mag-topic-nav" aria-label="Magazine sections">
        <span className="mag-topic-label">EXPLORE</span>
        {MAGAZINE_LANES.map((lane) => <a key={lane.id} href={`#lane-${lane.id.toLowerCase()}`}>{lane.id}</a>)}
      </nav>
      <nav className="mag-utility-nav" aria-label="Magazine editorial information">
        <span>4PLANET MAGAZINE</span>
        <Link to="/magazine/about">ABOUT</Link>
        <Link to="/magazine/sources">SOURCES & METHOD</Link>
        <Link to="/magazine/corrections">CORRECTIONS</Link>
      </nav>
    </>
  );
}

function MagazineMaze() {
  return (
    <section className="mag-maze" aria-labelledby="mag-maze-title">
      <div className="mag-maze-head">
        <div>
          <div className="mag-section-index mag-section-index--dark">02 / SIX WAYS IN</div>
          <h2 id="mag-maze-title">One planet. Enter where it matters to you.</h2>
        </div>
        <p>The publication stays broad underneath and narrow at the point of entry. Each door has one clear editorial promise; deeper 4PLANET context appears only when it is useful.</p>
      </div>
      <div className="mag-maze-grid">
        {MAGAZINE_LANES.map((lane, index) => (
          <article
            id={`lane-${lane.id.toLowerCase()}`}
            className={`mag-maze-tile mag-maze-tile--${lane.id.toLowerCase()}`}
            key={lane.id}
          >
            <span className="mono">{String(index + 1).padStart(2, "0")}</span>
            <h3>{lane.id}</h3>
            <p>{lane.promise}</p>
            <Link to={lane.primaryPath}>EXPLORE THE CONTEXT <span aria-hidden>→</span></Link>
          </article>
        ))}
      </div>
    </section>
  );
}

export default function Magazine() {
  const hero = img("m4gazineHero");
  const lead = STORIES[2] ?? STORIES[0];
  const leadMedia = img(lead.image);
  const secondary = STORIES.filter((story) => story.slug !== lead.slug).slice(0, 4);
  const publicDispatches = FIELD_PARTNER_DISPATCHES.filter((dispatch) => dispatch.status === "PUBLIC");

  useEffect(() => {
    trackMagazineEntry("home");
  }, []);

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
            <span>LIVE DEVELOPMENT · PRE-PUBLICATION</span>
          </div>
          <div className="mag-hero-copy">
            <p className="mag-kicker">WORKING EDITION 01</p>
            <h1 id="magazine-title">{FOUNDING_EDITION.workingTitle}</h1>
            <p>{FOUNDING_EDITION.subtitle}</p>
            <a className="mag-read-link" href="#read-now">READ NOW <span aria-hidden>↓</span></a>
          </div>
        </section>

        <div className="mag-spectrum" aria-hidden><span /><span /><span /><span /></div>
        <EditorialNav />

        <section className="mag-intro">
          <div className="mag-section-index">01 / A LIVING PLANET PUBLICATION</div>
          <div className="mag-intro-copy">
            <h2>The story is the front door.</h2>
            <p>Nature, science, people in the field, human systems, solutions, innovation and culture — edited as one living world. You never need to understand the whole 4PLANET system before a story becomes useful.</p>
            <p className="mag-intro-note">{MAGAZINE_GOLD_BAR.principle}</p>
          </div>
        </section>

        <MagazineMaze />

        <section id="read-now" className="mag-read-now" aria-labelledby="read-now-title">
          <div className="mag-read-now-head">
            <div>
              <div className="mag-section-index">03 / READ NOW</div>
              <h2 id="read-now-title">Start with one thing worth knowing.</h2>
            </div>
            <p>These pieces are 4PLANET-owned explainers and are visibly separated from future independent Magazine reporting.</p>
          </div>

          <article className="mag-lead-story">
            <Link
              className="mag-lead-media"
              to={`/magazine/${lead.slug}`}
              onClick={() => trackEvent("magazine_story_open", { story_slug: lead.slug, content_type: "4planet_explainer", placement: "magazine_lead" })}
            >
              <img src={leadMedia.src} alt={leadMedia.alt} />
            </Link>
            <div className="mag-lead-copy">
              <p className="mag-kicker">{lead.lane} · {lead.readMins} MIN READ</p>
              <h3><Link to={`/magazine/${lead.slug}`}>{lead.title}</Link></h3>
              <p>{lead.dek}</p>
              <Link className="mag-text-link" to={`/magazine/${lead.slug}`}>READ THE STORY <span aria-hidden>→</span></Link>
            </div>
          </article>

          <div className="mag-secondary-grid">
            {secondary.map((story) => {
              const media = img(story.image);
              return (
                <article key={story.slug} className="mag-secondary-story">
                  <Link
                    className="mag-secondary-media"
                    to={`/magazine/${story.slug}`}
                    onClick={() => trackEvent("magazine_story_open", { story_slug: story.slug, content_type: "4planet_explainer", placement: "magazine_secondary" })}
                  >
                    <img src={media.src} alt={media.alt} loading="lazy" />
                  </Link>
                  <div>
                    <p className="mag-kicker">{story.lane} · {story.readMins} MIN</p>
                    <h3><Link to={`/magazine/${story.slug}`}>{story.title}</Link></h3>
                    <p>{story.dek}</p>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section id="founding-edition" className="mag-edition" aria-label="Founding Edition">
          <div className="mag-edition-inner">
            <div className="mag-edition-head">
              <div>
                <div className="mag-section-index">04 / WHAT HOLDS</div>
                <h2>Eight stories being built in public.</h2>
              </div>
              <p>A permanent record is not a published article. These editorial objects stay pre-publication until source, rights, responsibility and editorial gates close.</p>
            </div>
            <div className="mag-edition-grid">
              {FOUNDING_EDITION.items.map((item) => (
                <article key={item.id} className="mag-edition-card">
                  <p className="mag-kicker">{String(item.order).padStart(2, "0")} / {item.format}</p>
                  <h3>{item.title}</h3>
                  <p>{item.summary}</p>
                  <div className="mono mag-edition-state">
                    <span>{item.status.replace(/_/g, " ")}</span>
                    <span>{item.sourceState}</span>
                  </div>
                  <Link to={`/magazine/stories/${item.id}`}>OPEN STORY RECORD <span aria-hidden>→</span></Link>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="mag-independence">
          <div className="mag-independence-inner">
            <div>
              <div className="mag-section-index">05 / INDEPENDENCE</div>
              <h2>The conclusion is not for sale.</h2>
            </div>
            <div className="mag-principle-list">
              {MAGAZINE_EDITORIAL_PRINCIPLES.map((principle, index) => (
                <div key={principle} className="mag-principle-row">
                  <span className="mono">{String(index + 1).padStart(2, "0")}</span>
                  <p>{principle}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {publicDispatches.length > 0 ? (
          <section className="mag-partner-feed" aria-labelledby="partner-feed-title">
            <div className="mag-dark-head">
              <div className="mag-section-index mag-section-index--dark">06 / FIELD PARTNER FEED</div>
              <h2 id="partner-feed-title">Evidence from people doing the work.</h2>
            </div>
            <div className="mag-partner-feed-grid">
              {publicDispatches.map((dispatch) => (
                <article key={dispatch.id} className="mag-partner-dispatch">
                  <p className="mag-kicker mag-kicker--dark">{dispatch.actorName} · {dispatch.editorialDisclosure.replace(/_/g, " ")}</p>
                  <h3>{dispatch.title}</h3>
                  <p>{dispatch.summary}</p>
                  {dispatch.placeLabel ? <span className="mono">{dispatch.placeLabel}</span> : null}
                </article>
              ))}
            </div>
          </section>
        ) : null}

        <section className="mag-dark-field">
          <div className="mag-dark-head">
            <div className="mag-section-index mag-section-index--dark">06 / FROM THE FIELD</div>
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
