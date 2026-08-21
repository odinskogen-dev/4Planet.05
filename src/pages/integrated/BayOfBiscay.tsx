import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { PublicShell } from "@/components/layout/PublicShell";
import { EcosystemAtlasEmbed } from "@/components/ecosystem/EcosystemAtlasEmbed";
import { EcosystemSystemGraph } from "@/components/ecosystem/EcosystemSystemGraph";
import { BAY_OF_BISCAY_GOLD } from "@/ecosystems/bayOfBiscay";
import { T } from "@/styles/tokens";
import "@/styles/ecosystem-gold.css";
import "@/styles/bay-of-biscay-gold.css";

const BISCAY_REGION: [number, number][] = [
  [-9.8, 43.1],
  [-10.4, 45.8],
  [-8.8, 48.1],
  [-5.4, 49.3],
  [-1.1, 48.8],
  [0.2, 46.2],
  [-1.6, 43.4],
  [-5.2, 42.9],
];

const SURVEY_CORRIDOR: [number, number][] = [
  [-1.45, 50.55],
  [-2.25, 49.25],
  [-3.15, 47.6],
  [-3.75, 45.8],
  [-3.85, 43.55],
];

function Reveal({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node || typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        setVisible(true);
        observer.disconnect();
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.08 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return <div ref={ref} className={`bay-reveal ${visible ? "is-visible" : ""} ${className}`}>{children}</div>;
}

function OceanCurrentField({ dense = false }: { dense?: boolean }) {
  const paths = dense
    ? [
        "M-40 90 C 160 5, 310 175, 520 72 S 860 12, 1120 104",
        "M-50 124 C 180 36, 330 204, 552 102 S 866 44, 1120 136",
        "M-30 158 C 200 68, 360 236, 584 134 S 890 76, 1120 170",
        "M-20 194 C 230 96, 390 268, 616 166 S 920 110, 1140 202",
        "M-10 228 C 250 132, 420 300, 648 198 S 950 142, 1160 238",
      ]
    : [
        "M-40 110 C 190 18, 340 190, 570 92 S 890 22, 1140 120",
        "M-30 160 C 210 65, 380 234, 610 138 S 930 70, 1160 170",
        "M-20 210 C 240 110, 420 280, 650 184 S 960 120, 1180 222",
      ];

  return (
    <svg className={`bay-current-field ${dense ? "is-dense" : ""}`} viewBox="0 0 1100 300" preserveAspectRatio="none" aria-hidden>
      {paths.map((path, index) => <path key={path} d={path} pathLength="100" style={{ animationDelay: `${index * -1.4}s` }} />)}
    </svg>
  );
}

export default function BayOfBiscay() {
  const profile = BAY_OF_BISCAY_GOLD;
  const [activeNode, setActiveNode] = useState(profile.nodes[0]?.id ?? "cetaceans");

  return (
    <PublicShell>
      <main className="bay-gold">
        <header className="bay-hero">
          <picture className="bay-hero__media">
            <source media="(max-width: 760px)" srcSet={profile.hero.srcMobile} />
            <img src={profile.hero.src} alt={profile.hero.alt} fetchPriority="high" />
          </picture>
          <div className="bay-hero__wash" aria-hidden />
          <OceanCurrentField dense />
          <div className="bay-shell bay-hero__content">
            <Link className="bay-domain-link eco-mono" to="/domains/oce4n">OCE4N_ · THE LIVING OCEAN ↗</Link>
            <div className="eco-mono bay-hero__eyebrow">ECOSYSTEM_ · GOLD STANDARD 01</div>
            <h1>BAY OF<br />BISCAY</h1>
            <p className="bay-hero__lead">{profile.lead}</p>
            <p className="bay-hero__body">{profile.body}</p>
            <div className="bay-actions">
              <Link className="is-white" to="/species/orca">MEET THE ORCA →</Link>
              <Link to="/living-systems/orca">FOLLOW THE ORCA JOURNEY →</Link>
              <Link to="/atlas?journey=bay-of-biscay">OPEN IN ATLAS →</Link>
            </div>
          </div>
          <div className="bay-hero__footer eco-mono">
            <span>PLACE</span><span>LIFE</span><span>CONDITIONS</span><span>PRESSURE</span><span>MONITORING</span>
          </div>
        </header>

        <section className="bay-blue-intro">
          <OceanCurrentField dense />
          <div className="bay-shell">
            <Reveal>
              <div className="eco-mono bay-blue-intro__path">LIVING SYSTEMS_ → ATLAS_ → SPECIES_ → IMPACT_</div>
              <h2>Understand the system.<br />Then decide what comes next.</h2>
              <div className="bay-blue-intro__grid">
                <p>The Bay becomes useful when it stops being a background and becomes a system: depth, water, food, animals, ships, observers, pressures and responses — connected through place and time.</p>
                <Link to="/domains/oce4n"><span className="eco-mono">OCE4N_</span><strong>Enter the living ocean</strong><i>↗</i></Link>
              </div>
            </Reveal>
          </div>
        </section>

        <section className="bay-atlas-stage">
          <div className="bay-shell">
            <Reveal>
              <div className="bay-kicker eco-mono">01_ WHERE · ATLAS_</div>
              <h2 className="bay-display">See the place before the story expands.</h2>
              <p className="bay-intro">The map is the spatial anchor. The blue shape below is a 4PLANET narrative focus for this prototype — not an authoritative ecological boundary. The white line is an illustrative England–Spain survey corridor, not a published operational track.</p>
            </Reveal>
            <Reveal>
              <EcosystemAtlasEmbed
                title="Bay of Biscay"
                subtitle="Explore the marine region in context, then move between the ecosystem, the species and the wider Atlas."
                atlasHref="/atlas?journey=bay-of-biscay"
                accent={T.blue}
                centre={[-4.7, 46.2]}
                zoom={4.25}
                region={BISCAY_REGION}
                corridor={SURVEY_CORRIDOR}
                boundaryNote="4PLANET NARRATIVE FOCUS ≠ AUTHORITATIVE ECOSYSTEM BOUNDARY · ILLUSTRATIVE CORRIDOR ≠ PUBLISHED SURVEY TRACK"
              />
            </Reveal>
          </div>
        </section>

        <section className="bay-orca-stage">
          <div className="bay-shell">
            <Reveal className="bay-orca-card">
              <picture className="bay-orca-card__media">
                <source media="(max-width:760px)" srcSet="/assets/missions/wh4les/hero-real-mobile.jpg" />
                <img src="/assets/missions/wh4les/hero-real.jpg" alt="A wild orca surfacing at sea" />
              </picture>
              <div className="bay-orca-card__shade" aria-hidden />
              <OceanCurrentField />
              <div className="bay-orca-card__copy">
                <div className="eco-mono">02_ SPECIES_ · ORCINUS ORCA</div>
                <h2>ORCA</h2>
                <p>One animal becomes a doorway into a much larger system — prey, ocean conditions, movement, observation effort, human activity and uncertainty.</p>
                <div className="bay-actions">
                  <Link className="is-white" to="/species/orca">OPEN SPECIES PROFILE →</Link>
                  <Link to="/living-systems/orca">ENTER ORCA JOURNEY →</Link>
                </div>
              </div>
              <div className="bay-orca-card__tag eco-mono">SPECIES → ECOSYSTEM → RELATIONSHIPS</div>
            </Reveal>
          </div>
        </section>

        <section className="bay-system-stage">
          <div className="bay-shell">
            <Reveal>
              <div className="bay-kicker eco-mono">03_ HOW · LIVING SYSTEMS_</div>
              <h2 className="bay-display">The ocean is a network, not a backdrop.</h2>
              <p className="bay-intro">Touch a node. The point is to reveal dependencies and overlaps without flattening them into one score.</p>
            </Reveal>
            <Reveal>
              <EcosystemSystemGraph
                nodes={profile.nodes}
                centreLabel={profile.centreLabel}
                activeId={activeNode}
                accent={T.blue}
                onSelect={(node) => setActiveNode(node.id)}
              />
            </Reveal>
          </div>
        </section>

        <section className="bay-water-stage">
          <div className="bay-water-stage__image bay-water-stage__image--one" aria-hidden />
          <div className="bay-water-stage__image bay-water-stage__image--two" aria-hidden />
          <OceanCurrentField dense />
          <div className="bay-shell bay-water-stage__content">
            <Reveal>
              <div className="bay-kicker eco-mono">04_ A MOVING SYSTEM</div>
              <h2>Water connects the story.</h2>
              <p>Depth, temperature, productivity, prey and movement change through space and time. The interface should behave accordingly: information flows, relationships wake up, and the ocean never feels like a static wallpaper.</p>
            </Reveal>
            <Reveal className="bay-image-pair">
              <figure>
                <img src="/assets/missions/wh4les/detail-01.jpg" alt="" />
                <figcaption className="eco-mono">OCE4N_ · MARINE CONTEXT</figcaption>
              </figure>
              <figure>
                <img src="/assets/missions/wh4les/detail-02.jpg" alt="" />
                <figcaption className="eco-mono">LIFE_ · FIELD CONTEXT</figcaption>
              </figure>
            </Reveal>
          </div>
        </section>

        <section className="bay-survey-stage">
          <div className="bay-shell bay-survey-grid">
            <Reveal>
              <div className="bay-kicker eco-mono">05_ MONITORING · EFFORT BEFORE INFERENCE</div>
              <h2 className="bay-display">A sighting only makes sense when we know where we looked.</h2>
              <p className="bay-intro">Survey effort is part of the evidence: route, time, distance, conditions and method establish the context around an observation. This is where the Bay of Biscay pilot can become unusually legible.</p>
              <div className="bay-effort-rail eco-mono">
                <span>ROUTE</span><span>TIME</span><span>DISTANCE</span><span>CONDITIONS</span><span>SIGHTINGS</span>
              </div>
            </Reveal>
            <Reveal className="bay-survey-visual">
              <img src="/assets/missions/wh4les/process.jpg" alt="" />
              <div className="bay-survey-visual__overlay" aria-hidden />
              <div className="bay-survey-visual__copy eco-mono">SURVEY EFFORT_ → OBSERVATIONS_ → INTERPRETATION_</div>
            </Reveal>
          </div>
        </section>

        <section className="bay-human-stage">
          <div className="bay-shell">
            <Reveal>
              <div className="bay-kicker eco-mono">06_ WHY IT MATTERS TO US</div>
              <h2 className="bay-display">We use the same ocean we are trying to understand.</h2>
              <p className="bay-intro">Transport, fisheries, coastal economies, research and public stewardship share this marine system. Human relevance is therefore inside the dependency graph — not a moral appendix after the nature story.</p>
            </Reveal>
            <Reveal className="bay-human-cards">
              <article><span className="eco-mono">DEPENDENCY</span><strong>Ocean conditions support living and human systems.</strong></article>
              <article><span className="eco-mono">PRESSURE</span><strong>Human activity can alter the conditions other life experiences.</strong></article>
              <article><span className="eco-mono">RESPONSE</span><strong>Monitoring, research and decisions can change what happens next.</strong></article>
            </Reveal>
          </div>
        </section>

        <section className="bay-actor-stage">
          <div className="bay-shell bay-actor-grid">
            <Reveal className="bay-actor-stage__media">
              <img src="/assets/missions/wh4les/character.jpg" alt="" />
              <div className="bay-actor-stage__veil" aria-hidden />
              <span className="eco-mono">ACTORS_ · PEOPLE INSIDE THE SYSTEM</span>
            </Reveal>
            <Reveal>
              <div className="bay-kicker eco-mono">07_ ACTORS + RESPONSE</div>
              <h2 className="bay-display">Understanding becomes useful when it reaches people and decisions.</h2>
              <p className="bay-intro">ORCA is the first actor-profile candidate in this journey. The reusable actor layer will connect organisations to geography, monitoring, interventions, evidence and ways to participate — without implying partnership or outcomes that are not evidenced.</p>
              <div className="bay-actions bay-actions--dark">
                <Link className="is-blue" to="/partners">ACTOR LAYER →</Link>
                <Link to="/missions/wh4les">WH4LES_ MISSION →</Link>
              </div>
            </Reveal>
          </div>
        </section>

        <section className="bay-proof-stage">
          <div className="bay-shell">
            <Reveal>
              <div className="bay-kicker eco-mono">08_ PROOF · SOURCES + LIMITS</div>
              <h2 className="bay-display">No single source is the ecosystem.</h2>
            </Reveal>
            <div className="bay-source-grid">
              {profile.sources.map((source) => (
                <Reveal key={source.href} className="bay-source-card">
                  <a href={source.href} target="_blank" rel="noreferrer">
                    <span className="eco-mono">{source.authority}</span>
                    <strong>{source.label}</strong>
                    <p>{source.establishes}</p>
                    <small>LIMITATION · {source.limitation}</small>
                    <i className="eco-mono">OPEN SOURCE ↗</i>
                  </a>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <footer className="bay-final">
          <OceanCurrentField dense />
          <div className="bay-shell">
            <Reveal>
              <div className="eco-mono">OCE4N_ · LIVING SYSTEMS_ → ATLAS_ → SPECIES_ → IMPACT_</div>
              <h2>Meet the ocean as a living system.</h2>
              <div className="bay-actions">
                <Link className="is-white" to="/species/orca">MEET THE ORCA →</Link>
                <Link to="/living-systems/orca">FOLLOW THE JOURNEY →</Link>
                <Link to="/atlas?journey=bay-of-biscay">OPEN IN ATLAS →</Link>
              </div>
            </Reveal>
          </div>
        </footer>
      </main>
    </PublicShell>
  );
}
