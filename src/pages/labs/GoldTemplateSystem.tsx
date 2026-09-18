import { Link, Navigate, useParams } from "react-router-dom";
import { PublicShell } from "@/components/layout/PublicShell";
import { Seo } from "@/components/Seo";
import {
  GOLD_OBJECT_KINDS,
  GOLD_OBJECT_PROOFS,
  GOLD_STORY_FORMATS,
  GOLD_STORY_GRAMMAR,
  GOLD_STORY_PROOFS,
  goldObjectBySlug,
  goldStoryBySlug,
  type GoldObjectProof,
  type GoldStoryProof,
} from "@/content/goldTemplateSystem";
import "@/styles/gold-template-system.css";

const TEST_ROBOTS = "noindex,nofollow,noarchive,nosnippet";

function GoldTestBar({ label }: { label: string }) {
  return (
    <div className="gold-test-bar" role="note" aria-label="Controlled test state">
      <strong>CONTROLLED TEST</strong>
      <span>{label}</span>
      <span>NO LIVE RELEASE</span>
    </div>
  );
}

function EvidenceMark({ state }: { state: "KNOWN" | "INTERPRETED" | "UNKNOWN" }) {
  return <span className={`gold-evidence gold-evidence--${state.toLowerCase()}`}>{state}</span>;
}

function ObjectVisual({ object }: { object: GoldObjectProof }) {
  return (
    <figure className={`gold-object-visual gold-object-visual--${object.visual.toLowerCase()}`} aria-label={`Designed ${object.visual.toLowerCase()} context visual for ${object.title}`}>
      <div className="gold-object-visual__grid" aria-hidden />
      <div className="gold-object-visual__field" aria-hidden>
        {object.visual === "OCEAN" ? (
          <>
            <span className="gold-whale-line gold-whale-line--1" />
            <span className="gold-whale-line gold-whale-line--2" />
            <span className="gold-whale-line gold-whale-line--3" />
          </>
        ) : null}
        {object.visual === "FJORD" ? (
          <>
            <span className="gold-fjord-shore gold-fjord-shore--left" />
            <span className="gold-fjord-shore gold-fjord-shore--right" />
            <span className="gold-fjord-water" />
          </>
        ) : null}
        {object.visual === "MEADOW" ? (
          <div className="gold-meadow" aria-hidden>
            {Array.from({ length: 28 }).map((_, index) => <span key={index} style={{ "--blade": index } as React.CSSProperties} />)}
          </div>
        ) : null}
      </div>
      <figcaption>
        <span>{object.kind.replace(/_/g, " ")} / TEST VISUAL</span>
        <strong>{object.title}</strong>
        <small>Designed in-system visual · no third-party media rights required</small>
      </figcaption>
    </figure>
  );
}

function ObjectFacts({ object }: { object: GoldObjectProof }) {
  return (
    <section className="gold-facts" aria-label={`${object.title} key facts`}>
      {object.facts.map((fact) => (
        <article key={`${fact.label}-${fact.value}`}>
          <div className="gold-facts__top">
            <span>{fact.label}</span>
            {fact.state ? <EvidenceMark state={fact.state} /> : null}
          </div>
          <strong>{fact.value}</strong>
          {fact.note ? <small>{fact.note}</small> : null}
        </article>
      ))}
    </section>
  );
}

function GoldObjectShell({ object }: { object: GoldObjectProof }) {
  return (
    <PublicShell>
      <Seo
        title={`${object.title} — ${object.kind.replace(/_/g, " ")} Gold TEST | 4PLANET`}
        description={object.standfirst}
        path={`/labs/gold/object/${object.slug}`}
        robots={TEST_ROBOTS}
      />
      <main className="gold-object" style={{ "--gold-accent": object.accent } as React.CSSProperties}>
        <GoldTestBar label={`OBJECT GOLD / ${object.kind.replace(/_/g, " ")}`} />

        <header className="gold-object-hero">
          <div className="gold-object-hero__copy">
            <Link className="gold-back" to="/labs/gold">← GOLD TEMPLATE SYSTEM 01</Link>
            <p className="gold-kicker">{object.eyebrow}</p>
            <h1>{object.title}</h1>
            {object.scientificName ? <p className="gold-object-sci">{object.scientificName}</p> : null}
            <p className="gold-standfirst">{object.standfirst}</p>
            <div className="gold-object-state">
              <span>{object.status}</span>
              <span>PROVENANCE ATTACHED</span>
              <span>UNKNOWN STAYS UNKNOWN</span>
            </div>
          </div>
          <ObjectVisual object={object} />
        </header>

        <ObjectFacts object={object} />

        <section className="gold-object-story" aria-label={`${object.title} reading journey`}>
          {object.sections.map((section) => (
            <article key={section.index} className="gold-object-section">
              <div className="gold-object-section__index">{section.index}</div>
              <div className="gold-object-section__body">
                <p className="gold-kicker">{section.eyebrow}</p>
                <h2>{section.title}</h2>
                {section.body.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                {section.callout ? <div className="gold-callout">{section.callout}</div> : null}
              </div>
            </article>
          ))}
        </section>

        <section className="gold-relationships" aria-labelledby="gold-relationships-title">
          <div className="gold-section-head">
            <p className="gold-kicker">RELATIONSHIP GRAPH</p>
            <h2 id="gold-relationships-title">The object becomes useful when its relationships stay explicit.</h2>
          </div>
          <div className="gold-relationship-list">
            {object.relationships.map((relationship, index) => {
              const body = (
                <>
                  <div className="gold-relationship-list__number">{String(index + 1).padStart(2, "0")}</div>
                  <div>
                    <div className="gold-relationship-list__identity">
                      <span>{relationship.kind.replace(/_/g, " ")}</span>
                      <EvidenceMark state={relationship.state} />
                    </div>
                    <h3>{relationship.label}</h3>
                    <p>{relationship.relation}</p>
                    {relationship.boundary ? <small>BOUNDARY · {relationship.boundary}</small> : null}
                  </div>
                  {relationship.href ? <b aria-hidden>↗</b> : null}
                </>
              );
              return relationship.href ? (
                <Link key={`${relationship.kind}-${relationship.label}`} to={relationship.href} className="gold-relationship-row">{body}</Link>
              ) : (
                <div key={`${relationship.kind}-${relationship.label}`} className="gold-relationship-row">{body}</div>
              );
            })}
          </div>
        </section>

        <section className="gold-truth" aria-labelledby="gold-truth-title">
          <div>
            <p className="gold-kicker">TRUTH BOUNDARY</p>
            <h2 id="gold-truth-title">What this page refuses to imply.</h2>
          </div>
          <p>{object.truthBoundary}</p>
        </section>

        <section className="gold-sources" aria-labelledby="gold-sources-title">
          <div className="gold-section-head">
            <p className="gold-kicker">SOURCES / PROVENANCE</p>
            <h2 id="gold-sources-title">Open the evidence behind the object.</h2>
          </div>
          <div className="gold-source-list">
            {object.sources.map((source, index) => (
              <a key={source.url} href={source.url} target="_blank" rel="noreferrer" className="gold-source-row">
                <span>{String(index + 1).padStart(2, "0")}</span>
                <div><strong>{source.label}</strong><p>{source.publisher}</p><small>{source.note}</small></div>
                <time dateTime={source.checkedAt}>CHECKED {source.checkedAt}</time>
                <b aria-hidden>↗</b>
              </a>
            ))}
          </div>
        </section>

        <section className="gold-next" aria-labelledby="gold-next-title">
          <p className="gold-kicker">CONNECTED NEXT</p>
          <h2 id="gold-next-title">Go deeper without starting over.</h2>
          <div className="gold-next-list">
            {object.nextObjects.map((item) => (
              <Link key={`${item.kind}-${item.label}`} to={item.href}><span>{item.kind}</span><strong>{item.label}</strong><b>→</b></Link>
            ))}
          </div>
        </section>

        <details className="gold-donor-note">
          <summary>INTERNAL TEST LINEAGE</summary>
          <p>{object.donorNote}</p>
        </details>
      </main>
    </PublicShell>
  );
}

function StorySignal({ story }: { story: GoldStoryProof }) {
  if (!story.numbers?.length) return null;
  return (
    <section className={`gold-story-numbers gold-story-numbers--${story.format.toLowerCase()}`} aria-label="Key reported figures">
      {story.numbers.map((item) => (
        <article key={`${item.value}-${item.label}`}>
          <strong>{item.value}</strong>
          <span>{item.label}</span>
          <small>{item.note}</small>
        </article>
      ))}
    </section>
  );
}

function StoryHeroVisual({ story }: { story: GoldStoryProof }) {
  return (
    <figure className={`gold-story-visual gold-story-visual--${story.visual.toLowerCase()}`} aria-label={`Designed ${story.visual.toLowerCase()} editorial visual`}>
      <div className="gold-story-visual__field" aria-hidden>
        {story.visual === "THERMAL" ? <><span /><span /><span /><span /><span /></> : null}
        {story.visual === "WHALE" ? <><i className="gold-story-whale" /><i className="gold-story-krill gold-story-krill--1" /><i className="gold-story-krill gold-story-krill--2" /></> : null}
        {story.visual === "THRESHOLD" ? <><span className="gold-threshold-line" /><b>1.5°C</b><small>SHORT PERIOD ≠ LONG-TERM LEVEL</small></> : null}
        {story.visual === "NUMBERS" ? <div className="gold-number-word">SCALE<br />IS A<br />SYSTEM</div> : null}
      </div>
      <figcaption>4PLANET MAGAZINE / DESIGNED TEST VISUAL / RIGHTS-SAFE</figcaption>
    </figure>
  );
}

function GoldStoryShell({ story }: { story: GoldStoryProof }) {
  const grammar = GOLD_STORY_GRAMMAR[story.format];
  return (
    <PublicShell>
      <Seo
        title={`${story.headline} | 4PLANET MAGAZINE TEST`}
        description={story.standfirst}
        path={`/labs/gold/story/${story.slug}`}
        robots={TEST_ROBOTS}
      />
      <main className={`gold-story gold-story--${story.format.toLowerCase()}`} style={{ "--gold-accent": story.accent } as React.CSSProperties}>
        <GoldTestBar label={`MAGAZINE STORY GOLD / ${story.format.replace(/_/g, " ")}`} />

        <header className="gold-story-head">
          <div className="gold-story-head__identity">
            <Link to="/labs/gold">4PLANET MAGAZINE / GOLD TEST</Link>
            <span>{story.lane}</span>
            <span>{story.readMins} MIN READ</span>
          </div>
          <div className="gold-story-head__copy">
            <p className="gold-kicker">{story.format.replace(/_/g, " ")} · {story.publishedLabel}</p>
            <h1>{story.headline}</h1>
            <p className="gold-story-dek">{story.standfirst}</p>
            <div className="gold-story-byline"><span>BY {story.byline}</span><span>TEST / NOT PUBLISHED</span></div>
          </div>
        </header>

        <StoryHeroVisual story={story} />
        <StorySignal story={story} />

        <article className="gold-story-body">
          {story.sections.map((section, index) => (
            <section key={`${section.kicker}-${index}`} className="gold-story-section">
              <p className="gold-kicker">{section.kicker ?? `${String(index + 1).padStart(2, "0")}`}</p>
              {section.title ? <h2>{section.title}</h2> : null}
              {section.paragraphs.map((paragraph, paragraphIndex) => (
                paragraphIndex === 0 && index === 0
                  ? <p className="gold-story-lead" key={paragraph}>{paragraph}</p>
                  : <p key={paragraph}>{paragraph}</p>
              ))}
            </section>
          ))}
        </article>

        <aside className="gold-story-grammar" aria-label="Editorial format contract">
          <div><p className="gold-kicker">FORMAT JOB</p><strong>{grammar.job}</strong></div>
          <div><p className="gold-kicker">STORY SPINE</p><strong>{grammar.spine}</strong></div>
        </aside>

        <section className="gold-truth gold-truth--story" aria-labelledby="gold-story-boundary">
          <div><p className="gold-kicker">EDITORIAL BOUNDARY</p><h2 id="gold-story-boundary">What this story does not claim.</h2></div>
          <p>{story.editorialBoundary}</p>
        </section>

        <section className="gold-sources" aria-labelledby="gold-story-sources">
          <div className="gold-section-head"><p className="gold-kicker">HOW WE KNOW</p><h2 id="gold-story-sources">Primary sources belong inside the reading product.</h2></div>
          <div className="gold-source-list">
            {story.sources.map((source, index) => (
              <a key={source.url} href={source.url} target="_blank" rel="noreferrer" className="gold-source-row">
                <span>{String(index + 1).padStart(2, "0")}</span>
                <div><strong>{source.label}</strong><p>{source.publisher}</p><small>{source.note}</small></div>
                <time dateTime={source.checkedAt}>CHECKED {source.checkedAt}</time>
                <b aria-hidden>↗</b>
              </a>
            ))}
          </div>
        </section>

        <section className="gold-next" aria-labelledby="gold-story-next">
          <p className="gold-kicker">SECOND OBJECT</p>
          <h2 id="gold-story-next">The story opens the world. It does not trap the reader inside the article.</h2>
          <div className="gold-next-list">
            {story.relatedObjects.map((item) => (
              <Link key={`${item.kind}-${item.label}`} to={item.href}><span>{item.kind}</span><strong>{item.label}</strong><b>→</b></Link>
            ))}
          </div>
        </section>
      </main>
    </PublicShell>
  );
}

export function GoldTemplateSystemIndex() {
  return (
    <PublicShell>
      <Seo
        title="4PLANET Gold Template System 01 — Controlled TEST"
        description="Controlled TEST proof of reusable Planet Object Gold and Magazine Story Gold systems."
        path="/labs/gold"
        robots={TEST_ROBOTS}
      />
      <main className="gold-index">
        <GoldTestBar label="GOLD TEMPLATE SYSTEM 01" />
        <header className="gold-index-hero">
          <p className="gold-kicker">ONE PLANET · SHARED INFRASTRUCTURE · CONTROLLED DEPTH</p>
          <h1>Two reusable forms.<br />Many worlds.</h1>
          <p>Track A turns Planet Model entities into useful, source-aware internet objects. Track B turns real-world events and questions into journalism with materially different reading forms. This route is TEST-only and deliberately disconnected from LIVE release authority.</p>
        </header>

        <section className="gold-index-contract">
          <div><p className="gold-kicker">OBJECT ENGINE</p><h2>Seven object kinds. One truth grammar.</h2><p>{GOLD_OBJECT_KINDS.join(" · ")}</p></div>
          <div><p className="gold-kicker">STORY ENGINE</p><h2>Nine editorial jobs. Not nine websites.</h2><p>{GOLD_STORY_FORMATS.map((item) => item.replace(/_/g, " ")).join(" · ")}</p></div>
        </section>

        <section className="gold-index-proof" aria-labelledby="gold-object-proofs">
          <div className="gold-section-head"><p className="gold-kicker">TRACK A / REPRESENTATIVE PROOFS</p><h2 id="gold-object-proofs">Three unlike objects stress the shared system.</h2></div>
          <div className="gold-index-links">
            {GOLD_OBJECT_PROOFS.map((object) => (
              <Link key={object.slug} to={`/labs/gold/object/${object.slug}`}>
                <span>{object.kind.replace(/_/g, " ")}</span>
                <strong>{object.title}</strong>
                <p>{object.standfirst}</p>
                <b>OPEN OBJECT PROOF →</b>
              </Link>
            ))}
          </div>
        </section>

        <section className="gold-index-proof" aria-labelledby="gold-story-proofs">
          <div className="gold-section-head"><p className="gold-kicker">TRACK B / REPRESENTATIVE PROOFS</p><h2 id="gold-story-proofs">Four stories. Four different reader jobs.</h2></div>
          <div className="gold-index-links gold-index-links--stories">
            {GOLD_STORY_PROOFS.map((story) => (
              <Link key={story.slug} to={`/labs/gold/story/${story.slug}`}>
                <span>{story.format.replace(/_/g, " ")}</span>
                <strong>{story.headline}</strong>
                <p>{story.standfirst}</p>
                <b>READ STORY PROOF →</b>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </PublicShell>
  );
}

export function GoldObjectProofPage() {
  const { slug } = useParams();
  const object = goldObjectBySlug(slug);
  if (!object) return <Navigate to="/labs/gold" replace />;
  return <GoldObjectShell object={object} />;
}

export function GoldStoryProofPage() {
  const { slug } = useParams();
  const story = goldStoryBySlug(slug);
  if (!story) return <Navigate to="/labs/gold" replace />;
  return <GoldStoryShell story={story} />;
}
