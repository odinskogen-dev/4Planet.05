import { Link, Navigate, useParams } from "react-router-dom";
import { PublicShell } from "@/components/layout/PublicShell";
import { Seo } from "@/components/Seo";
import { GOLD_OBJECT_PROOFS, GOLD_STORY_PROOFS, type GoldObjectProof } from "@/content/goldTemplateSystem";
import { GOLD_COMPLETION_OBJECTS, goldCompletionObjectBySlug } from "@/content/goldTemplateCompletion";
import { ACTOR_GOLD_PROFILES } from "@/content/actorGold";
import { ActorProfilePage } from "@/pages/v5/ActorGold";
import { GoldObjectProofPage, GoldStoryProofPage } from "@/pages/labs/GoldTemplateSystem";
import "@/styles/gold-template-system.css";

const TEST_ROBOTS = "noindex,nofollow,noarchive,nosnippet";

const REVIEW_OBJECTS = [
  { kind: "SPECIES", slug: "blue-whale", title: "Blue whale", href: "/sandbox/gold/species/blue-whale", note: "ORCA used as capability donor only." },
  { kind: "PLACE", slug: "oslofjord", title: "Oslofjord", href: "/sandbox/gold/place/oslofjord", note: "Place → pressure → decision → response." },
  { kind: "LIVING SYSTEM", slug: "oslofjord-living-system", title: "Oslofjord coastal living system", href: "/sandbox/gold/living-system/oslofjord-living-system", note: "Dependencies and pressures before labels." },
  { kind: "ACTOR", slug: "orca", title: "ORCA", href: "/sandbox/gold/actor/orca", note: "Existing Actor Gold reused directly; no duplicate actor system." },
  { kind: "SOLUTION", slug: "eelgrass-restoration", title: "Eelgrass restoration", href: "/sandbox/gold/solution/eelgrass-restoration", note: "Mechanism, evidence, prerequisites and limits." },
  { kind: "SIGNAL", slug: "oslofjord-plan-2026", title: "Oslofjord plan 2026–2030 enters consultation", href: "/sandbox/gold/signal/oslofjord-plan-2026", note: "Time-bounded event; decision is not outcome." },
  { kind: "PROOF", slug: "eelgrass-proof-record", title: "Eelgrass restoration — proof record", href: "/sandbox/gold/proof/eelgrass-proof-record", note: "Activity, observation and outcome remain separate." },
] as const;

const REVIEW_STORIES = [
  { kind: "NEWS", slug: "news-august-2026", title: "August just became the hottest August ever recorded", href: "/sandbox/gold/magazine/news-august-2026" },
  { kind: "EXPLAINER", slug: "explainer-1-5c", title: "The planet crossed 1.5°C again", href: "/sandbox/gold/magazine/explainer-1-5c" },
  { kind: "FEATURE", slug: "feature-blue-whale", title: "The largest animal ever known is built on a world of krill", href: "/sandbox/gold/magazine/feature-blue-whale" },
  { kind: "VISUAL STORY", slug: "visual-blue-whale", title: "A blue whale, in six numbers", href: "/sandbox/gold/magazine/visual-blue-whale" },
] as const;

function TestBar({ label }: { label: string }) {
  return <div className="gold-test-bar" role="note"><strong>CONTROLLED TEST</strong><span>{label}</span><span>NO LIVE RELEASE</span></div>;
}

function EvidenceMark({ state }: { state: "KNOWN" | "INTERPRETED" | "UNKNOWN" }) {
  return <span className={`gold-evidence gold-evidence--${state.toLowerCase()}`}>{state}</span>;
}

function CompletionVisual({ object }: { object: GoldObjectProof }) {
  return (
    <figure className={`gold-object-visual gold-object-visual--${object.visual.toLowerCase()}`} aria-label={`Designed ${object.visual.toLowerCase()} context visual for ${object.title}`}>
      <div className="gold-object-visual__grid" aria-hidden />
      <div className="gold-object-visual__field" aria-hidden>
        {object.visual === "OCEAN" ? <><span className="gold-whale-line gold-whale-line--1" /><span className="gold-whale-line gold-whale-line--2" /><span className="gold-whale-line gold-whale-line--3" /></> : null}
        {object.visual === "FJORD" ? <><span className="gold-fjord-shore gold-fjord-shore--left" /><span className="gold-fjord-shore gold-fjord-shore--right" /><span className="gold-fjord-water" /></> : null}
        {object.visual === "MEADOW" ? <div className="gold-meadow" aria-hidden>{Array.from({ length: 28 }).map((_, index) => <span key={index} style={{ "--blade": index } as React.CSSProperties} />)}</div> : null}
      </div>
      <figcaption><span>{object.kind.replace(/_/g, " ")} / TEST VISUAL</span><strong>{object.title}</strong><small>Designed in-system visual · no third-party media rights required</small></figcaption>
    </figure>
  );
}

function CompletionObjectPage({ object }: { object: GoldObjectProof }) {
  return (
    <PublicShell>
      <Seo title={`${object.title} — ${object.kind.replace(/_/g, " ")} Gold TEST | 4PLANET`} description={object.standfirst} path={`/sandbox/gold/${object.kind.toLowerCase().replace("_", "-")}/${object.slug}`} robots={TEST_ROBOTS} />
      <main className="gold-object" style={{ "--gold-accent": object.accent } as React.CSSProperties}>
        <TestBar label={`OBJECT GOLD / ${object.kind.replace(/_/g, " ")}`} />
        <header className="gold-object-hero">
          <div className="gold-object-hero__copy">
            <Link className="gold-back" to="/sandbox/gold">← FOUNDER REVIEW</Link>
            <p className="gold-kicker">{object.eyebrow}</p>
            <h1>{object.title}</h1>
            <p className="gold-standfirst">{object.standfirst}</p>
            <div className="gold-object-state"><span>{object.status}</span><span>PROVENANCE ATTACHED</span><span>UNKNOWN STAYS UNKNOWN</span></div>
          </div>
          <CompletionVisual object={object} />
        </header>

        <section className="gold-facts" aria-label={`${object.title} key facts`}>
          {object.facts.map((fact) => <article key={`${fact.label}-${fact.value}`}><div className="gold-facts__top"><span>{fact.label}</span>{fact.state ? <EvidenceMark state={fact.state} /> : null}</div><strong>{fact.value}</strong>{fact.note ? <small>{fact.note}</small> : null}</article>)}
        </section>

        <section className="gold-object-story" aria-label={`${object.title} reading journey`}>
          {object.sections.map((section) => <article key={section.index} className="gold-object-section"><div className="gold-object-section__index">{section.index}</div><div className="gold-object-section__body"><p className="gold-kicker">{section.eyebrow}</p><h2>{section.title}</h2>{section.body.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}{section.callout ? <div className="gold-callout">{section.callout}</div> : null}</div></article>)}
        </section>

        <section className="gold-relationships" aria-labelledby="sandbox-relations">
          <div className="gold-section-head"><p className="gold-kicker">RELATIONSHIP GRAPH</p><h2 id="sandbox-relations">The object becomes useful when its relationships stay explicit.</h2></div>
          <div className="gold-relationship-list">
            {object.relationships.map((relationship, index) => {
              const inner = <><div className="gold-relationship-list__number">{String(index + 1).padStart(2, "0")}</div><div><div className="gold-relationship-list__identity"><span>{relationship.kind.replace(/_/g, " ")}</span><EvidenceMark state={relationship.state} /></div><h3>{relationship.label}</h3><p>{relationship.relation}</p>{relationship.boundary ? <small>BOUNDARY · {relationship.boundary}</small> : null}</div>{relationship.href ? <b aria-hidden>↗</b> : null}</>;
              return relationship.href ? <Link key={`${relationship.kind}-${relationship.label}`} to={relationship.href} className="gold-relationship-row">{inner}</Link> : <div key={`${relationship.kind}-${relationship.label}`} className="gold-relationship-row">{inner}</div>;
            })}
          </div>
        </section>

        <section className="gold-truth"><div><p className="gold-kicker">TRUTH BOUNDARY</p><h2>What this page refuses to imply.</h2></div><p>{object.truthBoundary}</p></section>

        <section className="gold-sources" aria-labelledby="sandbox-sources">
          <div className="gold-section-head"><p className="gold-kicker">SOURCES / PROVENANCE</p><h2 id="sandbox-sources">Open the evidence behind the object.</h2></div>
          <div className="gold-source-list">{object.sources.map((source, index) => <a key={source.url} href={source.url} target="_blank" rel="noreferrer" className="gold-source-row"><span>{String(index + 1).padStart(2, "0")}</span><div><strong>{source.label}</strong><p>{source.publisher}</p><small>{source.note}</small></div><time dateTime={source.checkedAt}>CHECKED {source.checkedAt}</time><b aria-hidden>↗</b></a>)}</div>
        </section>

        <section className="gold-next"><p className="gold-kicker">CONNECTED NEXT</p><h2>Go deeper without starting over.</h2><div className="gold-next-list">{object.nextObjects.map((item) => <Link key={`${item.kind}-${item.label}`} to={item.href}><span>{item.kind}</span><strong>{item.label}</strong><b>→</b></Link>)}</div></section>
        <details className="gold-donor-note"><summary>INTERNAL TEST LINEAGE</summary><p>{object.donorNote}</p></details>
      </main>
    </PublicShell>
  );
}

export function SandboxGoldIndex() {
  return (
    <PublicShell>
      <Seo title="Founder Review — Gold Template System 01 | 4PLANET TEST" description="Founder review surface for the seven Planet Object Gold templates and four Magazine Gold story forms." path="/sandbox/gold" robots={TEST_ROBOTS} />
      <main className="gold-index">
        <TestBar label="FOUNDER REVIEW / GOLD TEMPLATE SYSTEM 01" />
        <header className="gold-index-hero">
          <p className="gold-kicker">TEST.4PLANET.ORG / SANDBOX</p>
          <h1>Founder Review.<br />Seven objects. Four stories.</h1>
          <p>Every link below is a controlled, noindex TEST surface. Nothing here authorises LIVE release. Approve, change or reject the reusable forms before they become public production templates.</p>
        </header>

        <section className="gold-index-contract">
          <div><p className="gold-kicker">OBJECT GOLD</p><h2>One shared object grammar. Seven different jobs.</h2></div>
          <div className="gold-index-grid">
            {REVIEW_OBJECTS.map((item) => <Link key={item.kind} to={item.href}><span>{item.kind}</span><h3>{item.title}</h3><p>{item.note}</p><b>REVIEW →</b></Link>)}
          </div>
        </section>

        <section className="gold-index-contract">
          <div><p className="gold-kicker">MAGAZINE GOLD</p><h2>Journalism about the world — not a 4PLANET company blog.</h2></div>
          <div className="gold-index-grid">
            {REVIEW_STORIES.map((item) => <Link key={item.kind} to={item.href}><span>{item.kind}</span><h3>{item.title}</h3><p>Distinct editorial job · source-aware · rights-safe designed visual.</p><b>REVIEW →</b></Link>)}
          </div>
        </section>

        <section className="gold-truth"><div><p className="gold-kicker">RELEASE LAW</p><h2>Founder approval is the final gate.</h2></div><p>Maker ≠ Judge. Browser, mobile, source and rights QA can make a candidate reviewable; they cannot publish it LIVE. LIVE remains blocked until the Founder explicitly says ENIG LIVE for the approved template versions.</p></section>
      </main>
    </PublicShell>
  );
}

export function SandboxGoldObjectPage() {
  const { slug } = useParams();
  const existing = GOLD_OBJECT_PROOFS.find((object) => object.slug === slug);
  if (existing) return <GoldObjectProofPage />;
  const completion = goldCompletionObjectBySlug(slug);
  return completion ? <CompletionObjectPage object={completion} /> : <Navigate to="/sandbox/gold" replace />;
}

export function SandboxGoldStoryPage() {
  const { slug } = useParams();
  if (!GOLD_STORY_PROOFS.some((story) => story.slug === slug)) return <Navigate to="/sandbox/gold" replace />;
  return <GoldStoryProofPage />;
}

export function SandboxActorGoldPage() {
  const { slug } = useParams();
  if (!ACTOR_GOLD_PROFILES.some((actor) => actor.slug === slug)) return <Navigate to="/sandbox/gold" replace />;
  return <><Seo title="Actor Gold Founder Review | 4PLANET TEST" description="Controlled Founder review of the existing Actor Gold template." path={`/sandbox/gold/actor/${slug}`} robots={TEST_ROBOTS} /><TestBar label="ACTOR GOLD / EXISTING ENGINE DONOR" /><ActorProfilePage /></>;
}

export const SANDBOX_GOLD_REVIEW_PATHS = [...REVIEW_OBJECTS.map((item) => item.href), ...REVIEW_STORIES.map((item) => item.href)] as const;
