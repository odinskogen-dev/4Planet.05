import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { PublicShell } from "@/components/layout/PublicShell";
import { EcosystemSystemGraph } from "@/components/ecosystem/EcosystemSystemGraph";
import type { EcosystemProfile } from "@/ecosystems/types";
import "@/styles/ecosystem-gold.css";

type Props = {
  profile: EcosystemProfile;
};

export function EcosystemGoldExperience({ profile }: Props) {
  const [activeNode, setActiveNode] = useState(profile.nodes[0]?.id ?? "");
  const [activeChapter, setActiveChapter] = useState(profile.chapters[0]?.id ?? "");

  useEffect(() => {
    const sections = Array.from(document.querySelectorAll<HTMLElement>("[data-eco-chapter]"));
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target instanceof HTMLElement) {
          setActiveChapter(visible.target.dataset.ecoChapter ?? profile.chapters[0]?.id ?? "");
        }
      },
      { rootMargin: "-34% 0px -52% 0px", threshold: [0, 0.2, 0.55] },
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [profile.chapters]);

  const scrollTo = (id: string) => document.getElementById(`eco-${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });

  return (
    <PublicShell>
      <main
        className="eco-gold"
        style={{
          "--eco-accent": profile.accent,
          "--eco-bg": profile.background,
        } as React.CSSProperties}
      >
        <nav className="eco-progress" aria-label={`${profile.name} story chapters`}>
          {profile.chapters.map((chapter) => (
            <button
              key={chapter.id}
              type="button"
              onClick={() => scrollTo(chapter.id)}
              className={activeChapter === chapter.id ? "is-active" : ""}
              aria-label={`Open chapter ${chapter.number}: ${chapter.title}`}
            >
              <span>{chapter.number}</span>
              <i aria-hidden />
            </button>
          ))}
        </nav>

        <header className="eco-hero">
          <picture className="eco-hero__media">
            {profile.hero.srcMobile && <source media="(max-width: 760px)" srcSet={profile.hero.srcMobile} />}
            <img src={profile.hero.src} alt={profile.hero.alt} style={{ objectPosition: profile.hero.objectPosition }} />
          </picture>
          <div className="eco-hero__shade" aria-hidden />
          <div className="eco-hero__field" aria-hidden>
            <span className="eco-pulse eco-pulse--1" />
            <span className="eco-pulse eco-pulse--2" />
            <span className="eco-pulse eco-pulse--3" />
          </div>
          <div className="eco-shell eco-hero__content">
            <div className="eco-mono eco-hero__eyebrow">{profile.eyebrow}</div>
            <h1>{profile.name}</h1>
            <p className="eco-hero__lead">{profile.lead}</p>
            <p className="eco-hero__body">{profile.body}</p>
            <p className="eco-mono eco-hero__authority-boundary">PUBLIC ECOSYSTEM INTELLIGENCE ≠ FIELD AUTHORITY OR REPRESENTATION</p>
            <div className="eco-actions">
              {profile.primaryActions.map((action, index) => (
                <Link key={action.href} to={action.href} className={index === 0 ? "is-primary" : ""}>
                  {action.label} →
                </Link>
              ))}
            </div>
          </div>
          <div className="eco-hero__footer eco-mono">
            <span>PLACE</span>
            <span>LIFE</span>
            <span>RELATIONSHIPS</span>
            <span>HUMAN RELEVANCE</span>
            <span>RESPONSES</span>
          </div>
        </header>

        <section id="eco-meet" data-eco-chapter="meet" className="eco-section eco-section--graph">
          <div className="eco-shell">
            <div className="eco-section-head">
              <span className="eco-mono">01_ SYSTEM VIEW</span>
              <h2>See the relationships before the categories.</h2>
              <p>{profile.geographyNote}</p>
            </div>
            <EcosystemSystemGraph
              nodes={profile.nodes}
              centreLabel={profile.centreLabel}
              activeId={activeNode}
              accent={profile.accent}
              onSelect={(node) => setActiveNode(node.id)}
            />
          </div>
        </section>

        {profile.chapters.slice(1).map((chapter, index) => (
          <section
            key={chapter.id}
            id={`eco-${chapter.id}`}
            data-eco-chapter={chapter.id}
            className={`eco-section ${index % 2 === 0 ? "eco-section--paper" : "eco-section--ink"}`}
          >
            <div className="eco-shell eco-story-grid">
              <div className="eco-story-index eco-mono">{chapter.number}</div>
              <div>
                <span className="eco-mono eco-story-kicker">{chapter.kicker}</span>
                <h2>{chapter.title}</h2>
                <p>{chapter.body}</p>
              </div>
            </div>
          </section>
        ))}

        <section className="eco-section eco-section--life">
          <div className="eco-shell">
            <div className="eco-section-head">
              <span className="eco-mono">SPECIES_ · ENTRY POINTS</span>
              <h2>Meet life. Then follow the connections.</h2>
            </div>
            <div className="eco-link-rail">
              {profile.species.map((item) => (
                <Link key={item.href} to={item.href}>
                  <span className="eco-mono">{item.meta ?? "SPECIES"}</span>
                  <strong>{item.label}</strong>
                  <i>OPEN →</i>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="eco-section eco-section--actors">
          <div className="eco-shell">
            <div className="eco-section-head">
              <span className="eco-mono">ACTORS_ · WHO SHAPES THE SYSTEM</span>
              <h2>A living system includes people, institutions and choices.</h2>
              <p>Actor profiles connect organisations and communities to a geography, a role, an intervention and evidence. Presence in this layer does not imply partnership with 4PLANET.</p>
            </div>
            <div className="eco-link-rail eco-link-rail--compact">
              {profile.actors.map((item) => (
                <Link key={`${item.href}-${item.label}`} to={item.href}>
                  <span className="eco-mono">{item.meta ?? "ACTOR"}</span>
                  <strong>{item.label}</strong>
                  <i>OPEN →</i>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="eco-section eco-section--sources">
          <div className="eco-shell">
            <div className="eco-section-head">
              <span className="eco-mono">EVIDENCE_ · KNOWN / INTERPRETED / UNKNOWN</span>
              <h2>No single source is the ecosystem.</h2>
              <p>Each source reveals a bounded part of the system. 4PLANET keeps what the source establishes separate from what remains limited or interpreted.</p>
            </div>
            <div className="eco-source-grid">
              {profile.sources.map((source) => (
                <a key={source.href} href={source.href} target="_blank" rel="noreferrer">
                  <span className="eco-mono">{source.authority}</span>
                  <strong>{source.label}</strong>
                  <p>{source.establishes}</p>
                  <small>LIMITATION · {source.limitation}</small>
                  <i>OPEN SOURCE ↗</i>
                </a>
              ))}
            </div>
          </div>
        </section>

        <footer className="eco-final">
          <div className="eco-shell">
            <span className="eco-mono">LIVING SYSTEMS_ → ATLAS_ → SPECIES_ → IMPACT_</span>
            <h2>Understand the system. Then decide what comes next.</h2>
            <div className="eco-actions">
              {profile.primaryActions.map((action, index) => (
                <Link key={`final-${action.href}`} to={action.href} className={index === 2 ? "is-primary" : ""}>
                  {action.label} →
                </Link>
              ))}
            </div>
          </div>
        </footer>
      </main>
    </PublicShell>
  );
}
