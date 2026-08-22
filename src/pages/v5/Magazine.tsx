import { Link } from "react-router-dom";
import { PublicShell } from "@/components/layout/PublicShell";
import { STORIES } from "@/content/stories";
import { FIELD_NOTES } from "@/content/fieldNotes";
import { img } from "@/content/imageRegistry";
import { DOMAIN_ACCENT } from "@/styles/tokens";
import type { DomainKey } from "@/types/content";
import "@/styles/magazine.css";

const DOMAIN_ORDER: DomainKey[] = ["OCE4N_", "E4RTH_", "S4PIENS_", "4CULTURE_"];
const sectionLinks = [
  ["LIFE", "/species"],
  ["PLANET", "/atlas"],
  ["HUMAN SYSTEMS", "/domains/s4piens"],
  ["CULTURE", "/domains/4culture"],
  ["SOLUTIONS", "/living-systems"],
] as const;

export default function Magazine() {
  const [lead, ...rest] = STORIES;
  const leadImage = img(lead.image);

  return (
    <PublicShell>
      <main className="magazine" id="main-content">
        <section className="mag-hero" aria-labelledby="magazine-title">
          <img className="mag-hero-media" src={leadImage.src} alt={leadImage.alt} />
          <div className="mag-hero-shade" aria-hidden />
          <div className="mag-hero-topline">
            <span>4PLANET MAGAZINE</span>
            <span>FOR A LIVING PLANET</span>
          </div>
          <div className="mag-hero-copy">
            <p className="mag-kicker">{lead.category.toUpperCase()} · {lead.readMins} MIN READ</p>
            <h1 id="magazine-title">{lead.title}</h1>
            <p>{lead.dek}</p>
            <Link className="mag-read-link" to={`/magazine/${lead.slug}`}>READ THE STORY <span aria-hidden>↗</span></Link>
          </div>
        </section>

        <div className="mag-spectrum" aria-hidden>
          <span /><span /><span /><span />
        </div>

        <nav className="mag-topic-nav" aria-label="Magazine pathways">
          <span className="mag-topic-label">EXPLORE</span>
          {sectionLinks.map(([label, to]) => <Link key={label} to={to}>{label}</Link>)}
        </nav>

        <section className="mag-intro">
          <div className="mag-section-index">01 / THE LIVING WORLD</div>
          <div className="mag-intro-copy">
            <h2>Nature is not a category.<br />It is the world we live inside.</h2>
            <p>Stories from species, ecosystems, science, people in the field, human systems, solutions, innovation and culture — connected by one source-aware view of a living planet.</p>
          </div>
        </section>

        <section className="mag-story-grid" aria-label="Latest stories">
          {rest.map((story, index) => {
            const media = img(story.image);
            const featureClass = index === 0 || index === 3 ? " mag-card--wide" : "";
            return (
              <article className={`mag-card${featureClass}`} key={story.slug}>
                <Link className="mag-card-media" to={`/magazine/${story.slug}`} aria-label={`Read ${story.title}`}>
                  <img src={media.src} alt={media.alt} loading="lazy" />
                </Link>
                <div className="mag-card-copy">
                  <p className="mag-kicker">{story.category.toUpperCase()} · {story.readMins} MIN</p>
                  <h3><Link to={`/magazine/${story.slug}`}>{story.title}</Link></h3>
                  <p>{story.dek}</p>
                </div>
              </article>
            );
          })}
        </section>

        <section className="mag-dark-field">
          <div className="mag-dark-head">
            <div className="mag-section-index mag-section-index--dark">02 / FROM THE FIELD</div>
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
                  <Link to={`/domains/${domain.replace("_", "").toLowerCase()}`}>ENTER THE DOMAIN <span aria-hidden>→</span></Link>
                </article>
              );
            })}
          </div>
        </section>

        <section className="mag-manifesto">
          <div className="mag-manifesto-mark" aria-hidden>4</div>
          <div>
            <div className="mag-section-index">03 / WHY THIS EXISTS</div>
            <h2>Understanding should move.</h2>
            <p>4PLANET MAGAZINE turns credible intelligence into stories people can enter, remember and pass on. When a story has a useful next step, it can open directly into the relevant species, place, organisation, Mission or verified action pathway.</p>
            <p className="mag-manifesto-small">Coverage is not endorsement. Action is shown only when the underlying route is real and evidence-bounded.</p>
          </div>
        </section>

        <section className="mag-last-word">
          <p className="mag-kicker">4PLANET MAGAZINE</p>
          <h2>Stay curious about the world that keeps us alive.</h2>
          <div className="mag-last-actions">
            <Link to="/atlas">OPEN ATLAS <span aria-hidden>→</span></Link>
            <Link to="/species">MEET A SPECIES <span aria-hidden>→</span></Link>
          </div>
        </section>
      </main>
    </PublicShell>
  );
}
