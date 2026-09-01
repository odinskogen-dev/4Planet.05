import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { PublicShell } from "@/components/layout/PublicShell";
import { EcosystemSystemGraph } from "@/components/ecosystem/EcosystemSystemGraph";
import type { EcosystemProfile } from "@/ecosystems/types";
import "@/styles/ecosystem-gold.css";

type Props = { profile: EcosystemProfile };

export function EcosystemGoldExperience({ profile }: Props) {
  const [activeNode, setActiveNode] = useState(profile.nodes[0]?.id ?? "");
  const [activeChapter, setActiveChapter] = useState(profile.chapters[0]?.id ?? "");

  useEffect(() => {
    setActiveNode(profile.nodes[0]?.id ?? "");
    setActiveChapter(profile.chapters[0]?.id ?? "");
  }, [profile]);

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    const sections = Array.from(document.querySelectorAll<HTMLElement>("[data-eco-chapter]"));
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible?.target instanceof HTMLElement) setActiveChapter(visible.target.dataset.ecoChapter ?? profile.chapters[0]?.id ?? "");
    }, { rootMargin: "-30% 0px -55% 0px", threshold: [0, 0.2, 0.55] });
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [profile.chapters]);

  const scrollTo = (id: string) => document.getElementById(`eco-${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });

  return (
    <PublicShell>
      <main className="eco-gold" data-ecosystem={profile.slug} data-maturity={profile.maturity} style={{ "--eco-accent": profile.accent, "--eco-bg": profile.background } as React.CSSProperties}>
        <nav className="eco-progress" aria-label={`${profile.name} chapters`}>
          {profile.chapters.map((chapter) => (
            <button key={chapter.id} type="button" onClick={() => scrollTo(chapter.id)} className={activeChapter === chapter.id ? "is-active" : ""} aria-label={`Open chapter ${chapter.number}: ${chapter.title}`}><span>{chapter.number}</span><i aria-hidden /></button>
          ))}
        </nav>

        <header className="eco-hero">
          {profile.hero ? (
            <picture className="eco-hero__media">
              {profile.hero.srcMobile && <source media="(max-width:760px)" srcSet={profile.hero.srcMobile} />}
              <img src={profile.hero.src} alt={profile.hero.alt} style={{ objectPosition: profile.hero.objectPosition }} />
            </picture>
          ) : <div className="eco-hero__media eco-hero__media--field" aria-hidden />}
          <div className="eco-hero__shade" aria-hidden />
          <div className="eco-shell eco-hero__content">
            <div className="eco-mono">{profile.eyebrow}</div>
            <h1>{profile.name}</h1>
            <p className="eco-hero__lead">{profile.lead}</p>
            <p className="eco-hero__body">{profile.body}</p>
            <p className="eco-boundary">PUBLIC ECOSYSTEM INTELLIGENCE ≠ FIELD AUTHORITY · ACTION ≠ OUTCOME</p>
            {profile.maturity === "TRANSFER_CANDIDATE" && <p className="eco-transfer">TRANSFER CANDIDATE · SHARED GRAMMAR UNDER TEST · NOT A COMPLETE CONDITION ASSESSMENT</p>}
            <div className="eco-actions">
              {profile.primaryActions.map((action, index) => <Link key={action.href} to={action.href} className={index === 0 ? "is-primary" : ""}>{action.label} →</Link>)}
            </div>
          </div>
          <div className="eco-hero__rail"><span>PLACE</span><span>LIFE</span><span>RELATIONSHIPS</span><span>PRESSURES</span><span>EVIDENCE</span><span>ACTORS</span></div>
        </header>

        <section id="eco-meet" data-eco-chapter="meet" className="eco-section eco-section--graph">
          <div className="eco-shell">
            <div className="eco-section-head"><span className="eco-mono">01_ SYSTEM VIEW</span><h2>See the relationships before the categories.</h2><p>{profile.geographyNote}</p></div>
            <EcosystemSystemGraph nodes={profile.nodes} centreLabel={profile.centreLabel} activeId={activeNode} accent={profile.accent} onSelect={(node) => setActiveNode(node.id)} />
          </div>
        </section>

        {profile.chapters.slice(1).map((chapter, index) => (
          <section key={chapter.id} id={`eco-${chapter.id}`} data-eco-chapter={chapter.id} className={`eco-section ${index % 2 === 0 ? "eco-section--paper" : "eco-section--ink"}`}>
            <div className="eco-shell eco-story-grid"><div className="eco-story-index">{chapter.number}</div><div><span className="eco-mono">{chapter.kicker}</span><h2>{chapter.title}</h2><p>{chapter.body}</p></div></div>
          </section>
        ))}

        <section className="eco-section eco-section--links">
          <div className="eco-shell">
            <div className="eco-section-head"><span className="eco-mono">LIFE + ACTORS</span><h2>Move from the place into the living network.</h2><p>Species and actors are separate objects. An actor appearing here does not imply partnership, endorsement or ecological outcome.</p></div>
            <div className="eco-link-grid">
              {[...profile.species, ...profile.actors].map((item) => <Link key={`${item.href}-${item.label}`} to={item.href}><span className="eco-mono">{item.meta ?? "CONNECTED OBJECT"}</span><strong>{item.label}</strong><i>OPEN →</i></Link>)}
            </div>
          </div>
        </section>

        <section className="eco-section eco-section--sources">
          <div className="eco-shell">
            <div className="eco-section-head"><span className="eco-mono">EVIDENCE_ · KNOWN / INTERPRETED / UNKNOWN</span><h2>No single source is the ecosystem.</h2><p>Each source carries what it establishes and what it does not. Missing evidence stays missing.</p></div>
            <div className="eco-source-grid">
              {profile.sources.map((item) => <a key={`${item.authority}-${item.href}`} href={item.href} target="_blank" rel="noreferrer"><span className="eco-mono">{item.authority}</span><strong>{item.label}</strong><p>{item.establishes}</p><small>LIMITATION · {item.limitation}</small><i>OPEN SOURCE ↗</i></a>)}
            </div>
          </div>
        </section>

        <footer className="eco-final"><div className="eco-shell"><span className="eco-mono">ECOSYSTEM_ → ATLAS_ → SPECIES_ → ACTORS_ → DECISIONS_</span><h2>Understand the system. Then decide what comes next.</h2><div className="eco-actions">{profile.primaryActions.map((action) => <Link key={`final-${action.href}`} to={action.href}>{action.label} →</Link>)}</div></div></footer>
      </main>
    </PublicShell>
  );
}