import { Link } from "react-router-dom";
import { PublicShell } from "@/components/layout/PublicShell";
import { Seo } from "@/components/Seo";
import { GoldThemeToggle } from "@/components/gold/GoldThemeToggle";
import type { GoldObjectProof, GoldStoryProof } from "@/content/goldTemplateSystem";
import "@/styles/gold-template-refinement-02.css";

const TEST_ROBOTS = "noindex,nofollow,noarchive,nosnippet";

export function GoldRefinementBar({ label }: { label: string }) {
  return <div className="gold2-testbar" role="note"><div><strong>TEST</strong><span>{label}</span></div><div><span>NO LIVE RELEASE</span><GoldThemeToggle /></div></div>;
}

function EvidenceMark({ state }: { state: "KNOWN" | "INTERPRETED" | "UNKNOWN" }) {
  return <span className={`gold2-evidence gold2-evidence--${state.toLowerCase()}`}>{state}</span>;
}

const grammarCopy: Record<string, { label: string; title: string; relations: string }> = {
  SPECIES: { label: "LIFE / RANGE / DEPENDENCIES", title: "Life at planetary scale.", relations: "What this species depends on — and what acts on it." },
  PLACE: { label: "PLACE / SIGNALS / PRESSURES", title: "A place is more than a pin.", relations: "What is connected to this place now." },
  LIVING_SYSTEM: { label: "FLOWS / PRESSURES / RESPONSE", title: "Relationships make the system visible.", relations: "The system, expressed as explicit relationships." },
  SOLUTION: { label: "MECHANISM / FIT / EVIDENCE", title: "A solution earns confidence through evidence.", relations: "Where the intervention fits — and what it cannot solve alone." },
  SIGNAL: { label: "CHANGE / TIME / AUTHORITY", title: "A signal is a change worth noticing.", relations: "What this event changes — and what remains unresolved." },
  PROOF: { label: "CLAIM / EVIDENCE / LIMIT", title: "Proof begins where inference stops.", relations: "The evidence chain behind the claim." },
};

function ObjectVisual({ object }: { object: GoldObjectProof }) {
  return <figure className={`gold2-visual gold2-visual--${object.visual.toLowerCase()}`} aria-label={`Designed ${object.visual.toLowerCase()} context visual for ${object.title}`}><div className="gold2-visual-grid" aria-hidden/><div className="gold2-visual-field" aria-hidden>{object.visual === "OCEAN" ? <><span className="gold2-whale gold2-whale--1"/><span className="gold2-whale gold2-whale--2"/></> : null}{object.visual === "FJORD" ? <><span className="gold2-shore gold2-shore--left"/><span className="gold2-shore gold2-shore--right"/><span className="gold2-water"/></> : null}{object.visual === "MEADOW" ? <div className="gold2-meadow">{Array.from({length:22}).map((_,i)=><span key={i} style={{"--blade":i} as React.CSSProperties}/>)}</div> : null}</div><figcaption><span>{object.kind.replace(/_/g," ")}</span><strong>{object.title}</strong></figcaption></figure>;
}

function Facts({ object }: { object: GoldObjectProof }) {
  return <section className="gold2-facts" aria-label={`${object.title} key facts`}>{object.facts.map((fact)=><article key={`${fact.label}-${fact.value}`}><div><span>{fact.label}</span>{fact.state ? <EvidenceMark state={fact.state}/> : null}</div><strong>{fact.value}</strong>{fact.note ? <small>{fact.note}</small> : null}</article>)}</section>;
}

function Sections({ object }: { object: GoldObjectProof }) {
  return <section className="gold2-story">{object.sections.map((section)=><article key={section.index} className="gold2-section"><div className="gold2-section-rail"><span>{section.index}</span><p className="gold2-kicker">{section.eyebrow}</p></div><div className="gold2-section-body"><h2>{section.title}</h2>{section.body[0] ? <p>{section.body[0]}</p> : null}{section.body.length > 1 ? <details className="gold2-more"><summary>MORE CONTEXT</summary>{section.body.slice(1).map((paragraph)=><p key={paragraph}>{paragraph}</p>)}</details> : null}{section.callout ? <div className="gold2-callout">{section.callout}</div> : null}</div></article>)}</section>;
}

function Relations({ object }: { object: GoldObjectProof }) {
  const copy=grammarCopy[object.kind]??grammarCopy.PLACE;
  return <section className="gold2-relations"><div className="gold2-section-head"><p className="gold2-kicker">CONNECTED</p><h2>{copy.relations}</h2></div><div className="gold2-relation-list">{object.relationships.map((relationship)=>{const inner=<><div><span>{relationship.kind.replace(/_/g," ")}</span><EvidenceMark state={relationship.state}/></div><h3>{relationship.label}</h3><p>{relationship.relation}</p>{relationship.boundary ? <small>{relationship.boundary}</small> : null}<b aria-hidden>↗</b></>;return relationship.href ? <Link key={`${relationship.kind}-${relationship.label}`} to={relationship.href} className="gold2-relation-row">{inner}</Link> : <div key={`${relationship.kind}-${relationship.label}`} className="gold2-relation-row">{inner}</div>;})}</div></section>;
}

function ObjectEvidence({ object }: { object: GoldObjectProof }) {
  return <section className="gold2-evidence-dock"><details><summary><span>HOW WE KNOW</span><strong>{object.sources.length} source{object.sources.length===1?"":"s"}</strong><b>+</b></summary><div className="gold2-source-list">{object.sources.map((source)=><a key={source.url} href={source.url} target="_blank" rel="noreferrer"><div><strong>{source.label}</strong><p>{source.publisher}</p><small>{source.note}</small></div><time dateTime={source.checkedAt}>{source.checkedAt}</time><b>↗</b></a>)}</div></details><details><summary><span>TRUTH BOUNDARY</span><strong>What remains unclaimed</strong><b>+</b></summary><p className="gold2-boundary">{object.truthBoundary}</p></details></section>;
}

export function GoldRefinedObject({ object, backTo="/sandbox/gold" }: { object: GoldObjectProof; backTo?: string }) {
  const copy=grammarCopy[object.kind]??grammarCopy.PLACE;
  const kind=object.kind.toLowerCase().replace(/_/g,"-");
  return <PublicShell><Seo title={`${object.title} — ${object.kind.replace(/_/g," ")} Gold TEST | 4PLANET`} description={object.standfirst} path={`/sandbox/gold/${kind}/${object.slug}`} robots={TEST_ROBOTS}/><main className={`gold2 gold2-object gold2-object--${kind}`} style={{"--gold2-accent":object.accent} as React.CSSProperties}><GoldRefinementBar label={`${object.kind.replace(/_/g," ")} GOLD`}/><header className="gold2-hero"><div className="gold2-hero-copy"><Link className="gold2-back" to={backTo}>← FOUNDER REVIEW</Link><p className="gold2-kicker">{copy.label}</p><h1>{object.title}</h1>{object.scientificName ? <p className="gold2-sci">{object.scientificName}</p> : null}<p className="gold2-standfirst">{object.standfirst}</p><div className="gold2-state"><span>{object.status}</span><span>SOURCE-BOUND</span></div></div><ObjectVisual object={object}/></header><div className="gold2-promise"><p className="gold2-kicker">{object.kind.replace(/_/g," ")}</p><h2>{copy.title}</h2></div><Facts object={object}/><Sections object={object}/><Relations object={object}/><ObjectEvidence object={object}/><section className="gold2-next"><p className="gold2-kicker">NEXT</p><h2>Continue through the system.</h2><div>{object.nextObjects.map((item)=><Link key={`${item.kind}-${item.label}`} to={item.href}><span>{item.kind}</span><strong>{item.label}</strong><b>→</b></Link>)}</div></section></main></PublicShell>;
}

function StoryVisual({ story }: { story: GoldStoryProof }) {
  return <figure className={`gold2-story-visual gold2-story-visual--${story.visual.toLowerCase()}`}><div aria-hidden>{story.visual==="THERMAL"?<><span/><span/><span/><span/><span/></>:null}{story.visual==="WHALE"?<><i className="gold2-story-whale"/><i className="gold2-krill gold2-krill--1"/><i className="gold2-krill gold2-krill--2"/></>:null}{story.visual==="THRESHOLD"?<><span className="gold2-threshold"/><b>1.5°C</b><small>SHORT PERIOD ≠ LONG-TERM LEVEL</small></>:null}{story.visual==="NUMBERS"?<strong className="gold2-numberword">SCALE<br/>IS A<br/>SYSTEM</strong>:null}</div><figcaption>DESIGNED TEST VISUAL / RIGHTS-SAFE</figcaption></figure>;
}

function StoryNumbers({ story }: { story: GoldStoryProof }) { return story.numbers?.length ? <section className="gold2-numbers">{story.numbers.map((item)=><article key={`${item.value}-${item.label}`}><strong>{item.value}</strong><span>{item.label}</span><small>{item.note}</small></article>)}</section> : null; }

export function GoldRefinedStory({ story, backTo="/sandbox/gold" }: { story: GoldStoryProof; backTo?: string }) {
  return <PublicShell><Seo title={`${story.headline} | 4PLANET MAGAZINE TEST`} description={story.standfirst} path={`/sandbox/gold/magazine/${story.slug}`} robots={TEST_ROBOTS}/><main className={`gold2 gold2-magazine gold2-magazine--${story.format.toLowerCase()}`} style={{"--gold2-accent":story.accent} as React.CSSProperties}><GoldRefinementBar label={`MAGAZINE / ${story.format.replace(/_/g," ")}`}/><header className="gold2-mag-head"><div className="gold2-mag-meta"><Link to={backTo}>4PLANET MAGAZINE</Link><span>{story.lane}</span><span>{story.readMins} MIN</span></div><p className="gold2-kicker">{story.format.replace(/_/g," ")} · {story.publishedLabel}</p><h1>{story.headline}</h1><p className="gold2-dek">{story.standfirst}</p><div className="gold2-byline"><span>BY {story.byline}</span><span>TEST / NOT PUBLISHED</span></div></header><StoryVisual story={story}/><StoryNumbers story={story}/><article className="gold2-article">{story.sections.map((section,index)=><section key={`${section.kicker}-${index}`}><p className="gold2-kicker">{section.kicker??String(index+1).padStart(2,"0")}</p>{section.title?<h2>{section.title}</h2>:null}{section.paragraphs.map((paragraph,pIndex)=><p className={pIndex===0&&index===0?"gold2-lead":undefined} key={paragraph}>{paragraph}</p>)}</section>)}</article><section className="gold2-evidence-dock"><details><summary><span>HOW WE KNOW</span><strong>{story.sources.length} primary source{story.sources.length===1?"":"s"}</strong><b>+</b></summary><div className="gold2-source-list">{story.sources.map((source)=><a key={source.url} href={source.url} target="_blank" rel="noreferrer"><div><strong>{source.label}</strong><p>{source.publisher}</p><small>{source.note}</small></div><time dateTime={source.checkedAt}>{source.checkedAt}</time><b>↗</b></a>)}</div></details><details><summary><span>EDITORIAL BOUNDARY</span><strong>What this story does not claim</strong><b>+</b></summary><p className="gold2-boundary">{story.editorialBoundary}</p></details></section><section className="gold2-next"><p className="gold2-kicker">EXPLORE NEXT</p><h2>Leave the article. Enter the world.</h2><div>{story.relatedObjects.map((item)=><Link key={`${item.kind}-${item.label}`} to={item.href}><span>{item.kind}</span><strong>{item.label}</strong><b>→</b></Link>)}</div></section></main></PublicShell>;
}
