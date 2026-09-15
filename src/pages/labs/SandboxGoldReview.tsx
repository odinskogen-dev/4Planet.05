import { Link, Navigate, useParams } from "react-router-dom";
import { PublicShell } from "@/components/layout/PublicShell";
import { Seo } from "@/components/Seo";
import { GOLD_OBJECT_PROOFS, GOLD_STORY_PROOFS } from "@/content/goldTemplateSystem";
import { goldCompletionObjectBySlug } from "@/content/goldTemplateCompletion";
import { ACTOR_GOLD_PROFILES } from "@/content/actorGold";
import { ActorProfilePage } from "@/pages/v5/ActorGold";
import { GoldRefinedObject, GoldRefinedStory, GoldRefinementBar } from "@/pages/labs/GoldTemplateRefinement02";
import "@/styles/gold-template-refinement-02.css";
import "@/styles/gold-review-index.css";
import "@/styles/actor-gold-refinement.css";

const TEST_ROBOTS = "noindex,nofollow,noarchive,nosnippet";

const REVIEW_OBJECTS = [
  { kind: "SPECIES", slug: "blue-whale", title: "Blue whale", href: "/sandbox/gold/species/blue-whale", note: "Identity, range, dependencies and pressures." },
  { kind: "PLACE", slug: "oslofjord", title: "Oslofjord", href: "/sandbox/gold/place/oslofjord", note: "Spatial context, signals, pressures and decisions." },
  { kind: "LIVING SYSTEM", slug: "oslofjord-living-system", title: "Oslofjord coastal living system", href: "/sandbox/gold/living-system/oslofjord-living-system", note: "Flows, relationships, pressures and response." },
  { kind: "ACTOR", slug: "orca", title: "ORCA", href: "/sandbox/gold/actor/orca", note: "Identity, work, place, participation and evidence." },
  { kind: "SOLUTION", slug: "eelgrass-restoration", title: "Eelgrass restoration", href: "/sandbox/gold/solution/eelgrass-restoration", note: "Mechanism, fit, prerequisites, evidence and limits." },
  { kind: "SIGNAL", slug: "oslofjord-plan-2026", title: "Oslofjord plan 2026–2030", href: "/sandbox/gold/signal/oslofjord-plan-2026", note: "What changed, when, who said so and what remains open." },
  { kind: "PROOF", slug: "eelgrass-proof-record", title: "Eelgrass restoration — proof record", href: "/sandbox/gold/proof/eelgrass-proof-record", note: "Claim, evidence, confidence, uncertainty and boundary." },
] as const;

const REVIEW_STORIES = [
  { kind: "NEWS", slug: "news-august-2026", title: "August just became the hottest August ever recorded", href: "/sandbox/gold/magazine/news-august-2026" },
  { kind: "EXPLAINER", slug: "explainer-1-5c", title: "The planet crossed 1.5°C again", href: "/sandbox/gold/magazine/explainer-1-5c" },
  { kind: "FEATURE", slug: "feature-blue-whale", title: "The largest animal ever known is built on a world of krill", href: "/sandbox/gold/magazine/feature-blue-whale" },
  { kind: "VISUAL STORY", slug: "visual-blue-whale", title: "A blue whale, in six numbers", href: "/sandbox/gold/magazine/visual-blue-whale" },
] as const;

export function SandboxGoldIndex() {
  return <PublicShell><Seo title="Founder Review — Gold Template System 02 | 4PLANET TEST" description="Founder review of distinct 4PLANET Gold object grammars and Magazine story forms." path="/sandbox/gold" robots={TEST_ROBOTS}/><main className="gold2 gold2-index"><GoldRefinementBar label="FOUNDER REVIEW / REFINEMENT 02"/><header className="gold2-index-hero"><p className="gold2-kicker">TEST.4PLANET.ORG / SANDBOX</p><h1>One identity.<br/>Different jobs.</h1><p>White, black and 4PLANET blue form the shared world. Each object type now gets its own information grammar instead of one rigid profile template.</p></header><section className="gold2-index-contract"><div><p className="gold2-kicker">OBJECT GOLD</p><h2>Species · Place · Living System · Actor · Solution · Signal · Proof</h2></div><div><p className="gold2-kicker">DESIGN LAW</p><h2>Shared tokens. Distinct hierarchy. Less interface, more meaning.</h2></div></section><section className="gold2-review-grid">{REVIEW_OBJECTS.map((item)=><Link key={item.kind} to={item.href}><span>{item.kind}</span><h2>{item.title}</h2><p>{item.note}</p><b>OPEN →</b></Link>)}</section><section className="gold2-review-grid gold2-review-grid--stories">{REVIEW_STORIES.map((item)=><Link key={item.kind} to={item.href}><span>{item.kind}</span><h2>{item.title}</h2><p>Editorial reading surface — not an intelligence dashboard.</p><b>READ →</b></Link>)}</section></main></PublicShell>;
}

export function SandboxGoldObjectPage() {
  const { slug } = useParams();
  const existing = GOLD_OBJECT_PROOFS.find((object)=>object.slug===slug);
  if (existing) return <GoldRefinedObject object={existing}/>;
  const completion = goldCompletionObjectBySlug(slug);
  return completion ? <GoldRefinedObject object={completion}/> : <Navigate to="/sandbox/gold" replace/>;
}

export function SandboxGoldStoryPage() {
  const { slug } = useParams();
  const story = GOLD_STORY_PROOFS.find((item)=>item.slug===slug);
  return story ? <GoldRefinedStory story={story}/> : <Navigate to="/sandbox/gold" replace/>;
}

export function SandboxActorGoldPage() {
  const { slug } = useParams();
  if (!ACTOR_GOLD_PROFILES.some((actor)=>actor.slug===slug)) return <Navigate to="/sandbox/gold" replace/>;
  return <><Seo title="Actor Gold Founder Review | 4PLANET TEST" description="Controlled Founder review of Actor Gold." path={`/sandbox/gold/actor/${slug}`} robots={TEST_ROBOTS}/><div className="gold2"><GoldRefinementBar label="ACTOR GOLD"/></div><ActorProfilePage/></>;
}

export const SANDBOX_GOLD_REVIEW_PATHS = [...REVIEW_OBJECTS.map((item)=>item.href),...REVIEW_STORIES.map((item)=>item.href)] as const;
