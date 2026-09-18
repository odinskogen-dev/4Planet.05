import { useEffect, useMemo, useState } from "react";
import hub from "@/content/partnersHub.json";
import { img } from "@/content/imageRegistry";
import "@/styles/partners-hub.css";

type PageKey = "home" | "system" | "proof" | "partnerships" | "capital" | "trust" | "founder" | "brief" | "for";

const BASE = "";
const MAIN_SITE = "https://4planet.org";

const nav = [
  ["System", "/system"],
  ["Proof", "/proof"],
  ["Partnerships", "/partnerships"],
  ["Capital", "/capital"],
  ["Trust", "/trust"],
] as const;

const pdfs: Record<string, string> = {
  overview: "/downloads/4planet-overview.pdf",
  partner: "/downloads/4planet-partner-brief.pdf",
  capital: "/downloads/4planet-capital-funder-brief.pdf",
  company: "/downloads/4planet-company-pilot-brief.pdf",
  foundation: "/downloads/4planet-foundation-brief.pdf",
  science: "/downloads/4planet-science-data-brief.pdf",
};

function resolvePage(pathname: string): { page: PageKey; slug?: string } {
  const path = pathname.replace(/\/+$/, "") || "/";
  if (path === "/system") return { page: "system" };
  if (path === "/proof" || path === "/projects") return { page: "proof" };
  if (path === "/partnerships") return { page: "partnerships" };
  if (path === "/capital" || path === "/roadmap") return { page: "capital" };
  if (path === "/trust") return { page: "trust" };
  if (path === "/founder") return { page: "founder" };
  if (path.startsWith("/briefs/")) return { page: "brief", slug: path.split("/")[2] };
  if (path.startsWith("/for/")) return { page: "for", slug: path.split("/")[2] };
  return { page: "home" };
}

function useDocumentMeta(pageTitle?: string) {
  useEffect(() => {
    const title = pageTitle ? `${pageTitle} — 4PLANET` : hub.meta.title;
    document.title = title;
    const upsert = (name: string, content: string) => {
      let node = document.head.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;
      if (!node) {
        node = document.createElement("meta");
        node.name = name;
        document.head.appendChild(node);
      }
      node.content = content;
    };
    upsert("description", hub.meta.description);
    upsert("robots", "noindex, nofollow, noarchive, nosnippet");
    upsert("googlebot", "noindex, nofollow, noarchive, nosnippet");
    upsert("theme-color", "#ffffff");

    let canonical = document.head.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = `https://${hub.meta.canonicalHost}${window.location.pathname}`;
  }, [pageTitle]);
}

function Arrow() {
  return <span aria-hidden className="ph-arrow">↗</span>;
}

function SiteHeader() {
  const [open, setOpen] = useState(false);
  return (
    <header className="ph-header">
      <a className="ph-brand" href="/" aria-label="4PLANET Partners home">
        <span>4PLANET_</span><small>PARTNERS</small>
      </a>
      <button className="ph-menu" type="button" aria-expanded={open} onClick={() => setOpen(!open)}>
        {open ? "CLOSE" : "MENU"}
      </button>
      <nav className={open ? "ph-nav is-open" : "ph-nav"} aria-label="Partners navigation">
        {nav.map(([label, href]) => <a key={href} href={href} onClick={() => setOpen(false)}>{label}</a>)}
        <a className="ph-nav-main" href={MAIN_SITE}>4planet.org <Arrow /></a>
      </nav>
    </header>
  );
}

function SiteFooter() {
  return (
    <footer className="ph-footer">
      <div className="ph-footer-mark">4PLANET_</div>
      <div className="ph-footer-copy">
        <p>For a Living Planet.</p>
        <p className="ph-small">Current public explanation · {hub.meta.updated} · Direct-link partner surface · NOINDEX</p>
      </div>
      <div className="ph-footer-links">
        <a href="/trust">Evidence & trust</a>
        <a href="/briefs/overview">Briefs</a>
        <a href={MAIN_SITE}>Explore 4PLANET <Arrow /></a>
      </div>
    </footer>
  );
}

function SectionTitle({ index, label, title, intro }: { index: string; label: string; title: string; intro?: string }) {
  return (
    <div className="ph-section-title">
      <div className="ph-kicker"><span>{index}</span>{label}</div>
      <h2>{title}</h2>
      {intro ? <p className="ph-lead">{intro}</p> : null}
    </div>
  );
}

function Status({ children }: { children: string }) {
  return <span className="ph-status">{children}</span>;
}

function PlanetImage({ imageKey = "whyImage", className = "" }: { imageKey?: "whyImage" | "heroEarth" | "footerPlanet" | "frontHero" | "earthrise"; className?: string }) {
  const meta = img(imageKey);
  return (
    <picture className={`ph-image ${className}`}>
      {meta.srcMobile ? <source media="(max-width: 700px)" srcSet={meta.srcMobile} /> : null}
      <img src={meta.src} alt={meta.alt} loading={imageKey === "heroEarth" ? "eager" : "lazy"} />
      {(meta.credit || meta.licenseNote) ? <small>{[meta.credit, meta.licenseNote].filter(Boolean).join(" · ")}</small> : null}
    </picture>
  );
}

function SystemFlow({ compact = false }: { compact?: boolean }) {
  return (
    <div className={compact ? "ph-system-flow compact" : "ph-system-flow"}>
      {hub.system.map((step, i) => (
        <div className="ph-system-step" key={step.id}>
          <div className="ph-system-index">{step.index}</div>
          <div>
            <h3>{step.title}</h3>
            <p className="ph-question">{step.question}</p>
            {!compact ? <p>{step.body}</p> : null}
          </div>
          {i < hub.system.length - 1 ? <span className="ph-system-line" aria-hidden>↓</span> : null}
        </div>
      ))}
    </div>
  );
}

function ProductRows({ includeDeveloping = false }: { includeDeveloping?: boolean }) {
  return (
    <div className="ph-rows">
      {hub.products.map((product, i) => (
        <a className="ph-row" href={product.href} key={product.slug}>
          <span className="ph-row-index">0{i + 1}</span>
          <div className="ph-row-main">
            <Status>{product.state}</Status>
            <h3>{product.name}</h3>
            <p className="ph-question">{product.question}</p>
            <p>{product.summary}</p>
          </div>
          <Arrow />
        </a>
      ))}
      {includeDeveloping ? hub.developing.map((product, i) => (
        <a className="ph-row ph-row-muted" href={product.href} key={product.name}>
          <span className="ph-row-index">D{i + 1}</span>
          <div className="ph-row-main">
            <Status>DEVELOPING INTERFACE</Status>
            <h3>{product.name}</h3>
            <p className="ph-question">{product.question}</p>
            <p>{product.summary}</p>
          </div>
          <Arrow />
        </a>
      )) : null}
    </div>
  );
}

function ProofRows({ limit }: { limit?: number }) {
  const cases = limit ? hub.proofCases.slice(0, limit) : hub.proofCases;
  return (
    <div className="ph-proof-list">
      {cases.map((item) => (
        <article className="ph-proof" key={item.slug}>
          <div className="ph-proof-meta">
            <span>{item.index}</span><span>{item.domain}</span><Status>{item.state}</Status>
          </div>
          <h3>{item.name}</h3>
          <h4>{item.headline}</h4>
          <p>{item.body}</p>
          <p className="ph-boundary"><strong>BOUNDARY</strong> {item.boundary}</p>
          <a className="ph-text-link" href={item.href}>Open current 4PLANET surface <Arrow /></a>
        </article>
      ))}
    </div>
  );
}

function TrustStrip() {
  return (
    <div className="ph-trust-strip">
      {hub.trust.invariants.map((item) => <span key={item}>{item}</span>)}
    </div>
  );
}

function HomePage() {
  useDocumentMeta();
  return (
    <>
      <section className="ph-hero">
        <div className="ph-hero-copy">
          <p className="ph-eyebrow">{hub.hero.eyebrow}</p>
          <h1>{hub.hero.headline}</h1>
          <p className="ph-hero-body">{hub.hero.body}</p>
          <div className="ph-actions">
            <a className="ph-button ph-button-primary" href="#system">{hub.hero.primaryCta}</a>
            <a className="ph-button" href="#products">{hub.hero.secondaryCta}</a>
          </div>
        </div>
        <PlanetImage imageKey="heroEarth" className="ph-hero-image" />
      </section>

      <section className="ph-panel ph-panel-ink">
        <SectionTitle index="01" label={hub.problem.label} title={hub.problem.headline} intro={hub.problem.body} />
        <blockquote>{hub.problem.insight}</blockquote>
      </section>

      <section className="ph-panel ph-hypothesis">
        <div>
          <p className="ph-eyebrow">{hub.hypothesis.label}</p>
          <h2>{hub.hypothesis.headline}</h2>
        </div>
        <div>
          <p className="ph-lead">{hub.hypothesis.body}</p>
          <p className="ph-boundary">{hub.hypothesis.status}</p>
        </div>
      </section>

      <section className="ph-panel" id="system">
        <SectionTitle index="02" label="THE SYSTEM" title="From reality to learning — without losing the evidence in between." intro="The public interface is only one layer. The system is designed to preserve the chain from what is observed to what is understood, done and eventually proven." />
        <SystemFlow compact />
        <a className="ph-text-link ph-more" href="/system">Explore the full system <Arrow /></a>
      </section>

      <section className="ph-bleed-image">
        <PlanetImage imageKey="whyImage" />
        <div className="ph-bleed-caption">
          <span>THE LIVING PLANET IS THE PROTAGONIST.</span>
          <p>The interface should reveal relationships — not turn nature into a dashboard.</p>
        </div>
      </section>

      <section className="ph-panel" id="products">
        <SectionTitle index="03" label="WHAT EXISTS" title="Four core public products. One connected logic." intro="Each product answers a different human question. Together they form a route from place and life to relationships, action and proof." />
        <ProductRows />
      </section>

      <section className="ph-panel ph-panel-blue" id="proof">
        <SectionTitle index="04" label="PROOF" title="Build the system through bounded cases — then keep the limits visible." intro="4PLANET does not treat a polished prototype as proof of product-market fit, and it does not treat funding or delivery as ecological impact. The cases below test specific parts of the system." />
        <ProofRows limit={3} />
        <a className="ph-button ph-button-light" href="/proof">See all current proof cases</a>
      </section>

      <section className="ph-panel">
        <SectionTitle index="05" label="WHY NOW" title="The evidence is growing. The coordination problem is still hard." />
        <div className="ph-three">
          <div><span>01</span><h3>Ecological pressure</h3><p>Living systems are changing while many decisions still treat climate, biodiversity, food, materials and place as separate problems.</p></div>
          <div><span>02</span><h3>Information abundance</h3><p>Public data, research, monitoring and spatial signals are expanding. The challenge is making relationships, scope and uncertainty usable.</p></div>
          <div><span>03</span><h3>New interface capacity</h3><p>Software and AI can lower the cost of organising complex knowledge — but only if source authority, uncertainty and human judgement remain inspectable.</p></div>
        </div>
      </section>

      <section className="ph-panel ph-partner-intro">
        <SectionTitle index="06" label="PARTNER WITH 4PLANET" title="Bring a real problem, capability, place or resource. Build one thing that can be inspected." intro="The strongest collaborations begin with a bounded object and an explicit role — not a logo wall or a generic sustainability promise." />
        <div className="ph-route-links">
          {hub.partnerships.map((route) => <a href={`/partnerships#${route.slug}`} key={route.slug}><span>{route.name}</span><Arrow /></a>)}
        </div>
      </section>

      <section className="ph-panel ph-capital-intro">
        <div>
          <p className="ph-eyebrow">CAPITAL</p>
          <h2>Capital should unlock a real object — not inflate the story.</h2>
        </div>
        <div>
          <p className="ph-lead">4PLANET uses different capital routes for different needs: public-interest proof, R&D, scientific validation, cultural work and bounded company pilots. Amounts and terms stay route-specific.</p>
          <a className="ph-text-link" href="/capital">See the capital architecture <Arrow /></a>
        </div>
      </section>

      <section className="ph-panel ph-panel-ink">
        <SectionTitle index="07" label="TRUST" title="Proof should become more specific as a claim becomes stronger." intro={hub.trust.intro} />
        <TrustStrip />
        <a className="ph-button ph-button-light" href="/trust">How 4PLANET handles evidence</a>
      </section>

      <section className="ph-founder-tease">
        <PlanetImage imageKey="earthrise" />
        <div>
          <p className="ph-eyebrow">FOUNDER / ORIGIN</p>
          <h2>{hub.founder.headline}</h2>
          <p>{hub.founder.body}</p>
          <a className="ph-text-link" href="/founder">Founder and authority model <Arrow /></a>
        </div>
      </section>

      <section className="ph-final">
        <p className="ph-eyebrow">ONE SYSTEM / MANY CONTROLLED DEPTHS</p>
        <h2>Understand the living system. Find the right role. Follow what happens next.</h2>
        <div className="ph-actions">
          <a className="ph-button ph-button-primary" href="/partnerships">Explore partnership routes</a>
          <a className="ph-button" href="/briefs/overview">Open the master brief</a>
        </div>
      </section>
    </>
  );
}

function SystemPage() {
  useDocumentMeta("System");
  return (
    <main className="ph-page">
      <section className="ph-page-hero"><p className="ph-eyebrow">SYSTEM / 01</p><h1>Make the relationships visible — then keep the route to action and proof intact.</h1><p className="ph-lead">4PLANET is not a collection of environmental websites. It is a working hypothesis for connecting planetary reality, human decisions, competent actors, resources, action, evidence and learning.</p></section>
      <section className="ph-panel ph-hypothesis"><div><p className="ph-eyebrow">CORE HYPOTHESIS</p><h2>{hub.hypothesis.headline}</h2></div><div><p className="ph-lead">{hub.hypothesis.body}</p><p className="ph-boundary">{hub.hypothesis.status}</p></div></section>
      <section className="ph-panel"><SectionTitle index="01" label="THE LOOP" title="Seven steps. Every transition has a truth boundary." /><SystemFlow /></section>
      <section className="ph-panel ph-panel-ink"><SectionTitle index="02" label="PUBLIC INTERFACES" title="The products are different windows into the same logic." /><ProductRows includeDeveloping /></section>
      <section className="ph-panel"><SectionTitle index="03" label="MISSION WORLDS" title="Separate worlds. Shared infrastructure. Controlled depth." intro="4PLANET organises work across four public mission territories without forcing every subject into one visual or scientific language." /><div className="ph-four-worlds"><div><span>OCE4N_</span><p>Ocean life, marine systems and human pressure.</p></div><div><span>E4RTH_</span><p>Land, forests, freshwater, species and restoration.</p></div><div><span>S4PIENS_</span><p>Human systems such as food, energy, materials and choice.</p></div><div><span>4CULTURE_</span><p>Stories, images, art and culture as routes into understanding and action.</p></div></div></section>
      <section className="ph-panel ph-panel-blue"><SectionTitle index="04" label="WHAT THIS IS NOT" title="A connected system does not require false certainty." /><TrustStrip /><p className="ph-lead ph-space-top">4PLANET does not replace scientific institutions, field organisations, public authorities or communities. It is designed to make their evidence, roles and the relationships between them easier to inspect.</p></section>
    </main>
  );
}

function ProofPage() {
  useDocumentMeta("Proof");
  return (
    <main className="ph-page">
      <section className="ph-page-hero"><p className="ph-eyebrow">PROOF / 02</p><h1>Prove one link in the chain at a time.</h1><p className="ph-lead">A beautiful interface is not enough. Each case exists to test a bounded question about source integrity, relationship intelligence, usefulness, delivery, economic value or transfer.</p></section>
      <section className="ph-panel"><ProofRows /></section>
      <section className="ph-panel ph-panel-ink"><SectionTitle index="05" label="PROOF DISCIPLINE" title="Claims move through explicit evidence states." intro={hub.trust.intro} /><div className="ph-state-grid">{hub.trust.states.map((state, i) => <div key={state.name}><span>0{i + 1}</span><h3>{state.name}</h3><p>{state.body}</p></div>)}</div><TrustStrip /></section>
      <section className="ph-panel"><SectionTitle index="06" label="NEXT PROOF" title="The next milestone is not more breadth. It is stronger external evidence." /><div className="ph-roadmap">{hub.roadmap.map((step) => <div key={step.name}><h3>{step.name}</h3><p>{step.body}</p></div>)}</div></section>
    </main>
  );
}

function PartnershipsPage() {
  useDocumentMeta("Partnerships");
  return (
    <main className="ph-page">
      <section className="ph-page-hero"><p className="ph-eyebrow">PARTNERSHIPS / 03</p><h1>Start with the object. Make every role explicit.</h1><p className="ph-lead">A good 4PLANET partnership should create something useful even if the relationship never becomes larger: a bounded proof, a clearer method, better evidence or a repeatable product capability.</p></section>
      <section className="ph-panel ph-routes">{hub.partnerships.map((route, i) => <article id={route.slug} key={route.slug}><div className="ph-route-head"><span>0{i + 1}</span><h2>{route.name}</h2></div><div className="ph-route-body"><h3>Why this route</h3><p>{route.why}</p><div className="ph-route-columns"><div><h4>4PLANET MAY BRING</h4><p>{route.brings}</p></div><div><h4>THE OTHER PARTY MAY BRING</h4><p>{route.partner}</p></div></div><p><strong>Example:</strong> {route.example}</p><p className="ph-boundary"><strong>BOUNDARY</strong> {route.boundary}</p></div></article>)}</section>
      <section className="ph-panel ph-panel-blue"><SectionTitle index="07" label="CONTROLLED DEPTH" title="The core explanation stays the same. Relevance changes by audience." intro="Unlisted routes can combine the same canonical 4PLANET truth with one actor-specific problem, proof object and next step — without creating a new pitch truth." /><div className="ph-three ph-three-links"><a href="/for/company"><span>01</span><h3>Company route</h3><p>Buyer problem → bounded pilot → acceptance proof.</p></a><a href="/for/foundation"><span>02</span><h3>Foundation route</h3><p>Public-interest object → funding logic → evidence.</p></a><a href="/for/science"><span>03</span><h3>Science route</h3><p>Method/source question → authority → validation.</p></a></div></section>
    </main>
  );
}

function CapitalPage() {
  useDocumentMeta("Capital");
  return (
    <main className="ph-page">
      <section className="ph-page-hero"><p className="ph-eyebrow">CAPITAL / 04</p><h1>Capital follows the need. The evidence follows the money.</h1><p className="ph-lead">4PLANET does not have one universal public ask. Different objects require different instruments, legal routes, deliverables and proof. Internal opportunity rankings and negotiations stay private.</p></section>
      <section className="ph-panel"><SectionTitle index="01" label="CAPITAL LOGIC" title="Need → object → instrument → delivery → proof → learning." /><div className="ph-capital-chain"><span>REAL NEED</span><b>→</b><span>BOUNDED OBJECT</span><b>→</b><span>RIGHT CAPITAL TYPE</span><b>→</b><span>DELIVERABLE</span><b>→</b><span>PROOF</span><b>→</b><span>LEARNING</span></div></section>
      <section className="ph-panel ph-capital-modules"><SectionTitle index="02" label="MODULES" title="Six reusable capital objects — with route-specific budgets and terms." />{hub.capital.map((item, i) => <article key={item.name}><div><span>0{i + 1}</span><h3>{item.name}</h3><p className="ph-question">{item.for}</p></div><div><h4>WHAT IT ENABLES</h4><p>{item.enables}</p></div><div><h4>WHAT SHOULD BE PROVEN</h4><p>{item.proof}</p></div><div><h4>LIKELY ROUTE</h4><p>{item.route}</p></div></article>)}</section>
      <section className="ph-panel ph-panel-ink"><SectionTitle index="03" label="ECONOMIC TRUTH" title="A capital pipeline is not cash." /><div className="ph-capital-chain ph-capital-chain-dark"><span>PLANNED</span><b>≠</b><span>ASKED</span><b>≠</b><span>SUBMITTED</span><b>≠</b><span>AWARDED</span><b>≠</b><span>CONTRACTED</span><b>≠</b><span>CASH</span></div><p className="ph-lead ph-space-top">The same discipline applies to pilots: a pilot is not paid unless payment is explicit, and a contract is not cash until the economic event actually occurs.</p></section>
      <section className="ph-panel"><SectionTitle index="04" label="ROADMAP" title="Scale should be earned by proof and transfer." /><div className="ph-roadmap">{hub.roadmap.map((step) => <div key={step.name}><h3>{step.name}</h3><p>{step.body}</p></div>)}</div><div className="ph-actions ph-space-top"><a className="ph-button ph-button-primary" href="/briefs/capital">Open capital / funder brief</a><a className="ph-button" href="/briefs/company">Open company pilot brief</a></div></section>
    </main>
  );
}

function TrustPage() {
  useDocumentMeta("Trust");
  return (
    <main className="ph-page">
      <section className="ph-page-hero"><p className="ph-eyebrow">TRUST / 05</p><h1>Make stronger claims harder — not easier — to make.</h1><p className="ph-lead">The point of the evidence layer is not to decorate a claim with sources. It is to preserve what the evidence actually establishes, what 4PLANET adds, where uncertainty sits and who has authority.</p></section>
      <section className="ph-panel"><SectionTitle index="01" label="EVIDENCE STATES" title="A source, an interpretation and an outcome are different objects." /><div className="ph-state-grid">{hub.trust.states.map((state, i) => <div key={state.name}><span>0{i + 1}</span><h3>{state.name}</h3><p>{state.body}</p></div>)}</div></section>
      <section className="ph-panel ph-panel-blue"><SectionTitle index="02" label="UNCERTAINTY" title="Unknown is a valid state." /><div className="ph-flags">{hub.trust.flags.map((flag) => <span key={flag}>{flag}</span>)}</div><p className="ph-lead ph-space-top">Where relevant, claims can remain uncertain, contested, corrected or superseded. Updating a claim is evidence of a working truth system, not a failure to look certain.</p></section>
      <section className="ph-panel ph-panel-ink"><SectionTitle index="03" label="NON-NEGOTIABLE DISTINCTIONS" title="The system should never erase these boundaries." /><TrustStrip /></section>
      <section className="ph-panel"><SectionTitle index="04" label="AUTHORITY" title="4PLANET is the connector — not the owner of every truth it presents." /><p className="ph-lead">Scientific institutions retain scientific authority. Field organisations retain delivery authority. Public bodies retain statutory authority. Communities retain their own knowledge and agency. 4PLANET should make those roles easier to inspect, not absorb them into one brand voice.</p></section>
    </main>
  );
}

function FounderPage() {
  useDocumentMeta("Founder");
  return (
    <main className="ph-page">
      <section className="ph-page-hero ph-founder-page"><p className="ph-eyebrow">FOUNDER / 06</p><h1>{hub.founder.headline}</h1><p className="ph-lead">{hub.founder.body}</p></section>
      <section className="ph-founder-wide"><PlanetImage imageKey="footerPlanet" /><blockquote>{hub.founder.principle}</blockquote></section>
      <section className="ph-panel"><SectionTitle index="01" label="WHY THIS MATTERS" title="A founder can start a system. The system has to become inspectable without the founder." /><div className="ph-three"><div><span>01</span><h3>Founder context</h3><p>Environmental work, entrepreneurship, strategy, communication and visual documentation inform how 4PLANET is being built.</p></div><div><span>02</span><h3>Distributed authority</h3><p>Science, field delivery, public decisions and community knowledge should sit with people and institutions qualified to hold them.</p></div><div><span>03</span><h3>Inspectable proof</h3><p>The long-term test is whether the products, methods, partnerships and outcomes stand up without biography doing the persuading.</p></div></div></section>
      <section className="ph-final"><p className="ph-eyebrow">NEXT</p><h2>The organisation should become stronger as authority becomes clearer and less founder-dependent.</h2><a className="ph-button ph-button-primary" href="/partnerships">See the partnership model</a></section>
    </main>
  );
}

function BriefPage({ slug = "overview" }: { slug?: string }) {
  const brief = hub.briefs.find((item) => item.slug === slug) || hub.briefs[0];
  useDocumentMeta(brief.name);
  const showCompany = slug === "company";
  const showFoundation = slug === "foundation";
  const showScience = slug === "science";
  const showCapital = slug === "capital" || showFoundation;
  return (
    <main className="ph-brief ph-page">
      <section className="ph-page-hero"><p className="ph-eyebrow">BRIEF / {brief.audience.toUpperCase()}</p><h1>{brief.name}</h1><p className="ph-lead">{brief.purpose}</p><div className="ph-actions"><a className="ph-button ph-button-primary" href={pdfs[brief.slug]}>Download PDF</a><button className="ph-button" type="button" onClick={() => window.print()}>Print this view</button></div></section>
      <section className="ph-panel"><SectionTitle index="01" label="THE IDEA" title={hub.hero.headline} intro={hub.hero.body} /><p className="ph-brief-quote">{hub.problem.insight}</p></section>
      <section className="ph-panel"><SectionTitle index="02" label="THE SYSTEM" title="Reality → evidence → understanding → decision → action → proof → learning." /><SystemFlow compact /></section>
      <section className="ph-panel"><SectionTitle index="03" label="WHAT EXISTS" title="Four public core products." /><ProductRows /></section>
      {showCompany ? <section className="ph-panel ph-panel-blue"><SectionTitle index="04" label="COMPANY PILOT" title="One real decision problem. One bounded proof." intro={hub.capital.find((x) => x.name === "COMPANY PAID PILOT")?.enables} /><p className="ph-lead">{hub.partnerships.find((x) => x.slug === "company")?.example}</p><p className="ph-boundary">{hub.partnerships.find((x) => x.slug === "company")?.boundary}</p></section> : null}
      {showFoundation ? <section className="ph-panel ph-panel-blue"><SectionTitle index="04" label="FOUNDATION ROUTE" title="Fund public value without buying the conclusion." intro={hub.partnerships.find((x) => x.slug === "foundation")?.why} /><p className="ph-lead">{hub.partnerships.find((x) => x.slug === "foundation")?.example}</p><p className="ph-boundary">{hub.partnerships.find((x) => x.slug === "foundation")?.boundary}</p></section> : null}
      {showScience ? <section className="ph-panel ph-panel-blue"><SectionTitle index="04" label="SCIENCE & DATA" title="Keep source authority intact while making relationships more usable." intro={hub.partnerships.find((x) => x.slug === "science")?.why} /><p className="ph-lead">{hub.partnerships.find((x) => x.slug === "science")?.example}</p><p className="ph-boundary">{hub.partnerships.find((x) => x.slug === "science")?.boundary}</p></section> : null}
      {showCapital ? <section className="ph-panel"><SectionTitle index="05" label="CAPITAL" title="Different needs require different instruments." /><div className="ph-roadmap">{hub.capital.slice(0, 4).map((item) => <div key={item.name}><h3>{item.name}</h3><p>{item.enables}</p></div>)}</div></section> : <section className="ph-panel"><SectionTitle index="05" label="PROOF" title="A prototype is not an outcome." /><ProofRows limit={2} /></section>}
      <section className="ph-panel ph-panel-ink"><SectionTitle index="06" label="TRUST" title="Keep evidence states separate." /><TrustStrip /></section>
    </main>
  );
}

function ForPage({ slug = "company" }: { slug?: string }) {
  const routeSlug = slug === "foundation" || slug === "science" ? slug : "company";
  const route = hub.partnerships.find((item) => item.slug === routeSlug) || hub.partnerships[0];
  useDocumentMeta(`${route.name} route`);
  return (
    <main className="ph-page ph-for-page">
      <section className="ph-page-hero"><p className="ph-eyebrow">UNLISTED ROUTE TEMPLATE / {route.name}</p><h1>The 4PLANET system — through one relevant problem.</h1><p className="ph-lead">This template demonstrates controlled depth. A named actor page should only be published when its problem, relationship state, proof object, ask and rights are current and verified.</p></section>
      <section className="ph-panel"><SectionTitle index="01" label="CORE TRUTH" title={hub.hero.headline} intro={hub.hero.body} /></section>
      <section className="ph-panel ph-panel-blue"><SectionTitle index="02" label="WHY THIS ROUTE" title={route.why} /><div className="ph-route-columns"><div><h4>4PLANET MAY BRING</h4><p>{route.brings}</p></div><div><h4>THE OTHER PARTY MAY BRING</h4><p>{route.partner}</p></div></div><p className="ph-boundary"><strong>BOUNDARY</strong> {route.boundary}</p></section>
      <section className="ph-panel"><SectionTitle index="03" label="RELEVANT PROOF" title="Choose the smallest proof object that actually matches the problem." /><ProofRows limit={2} /></section>
      <section className="ph-panel"><SectionTitle index="04" label="NEXT STEP" title="Resolve actor → problem → bounded object → evidence → terms → release." intro="Named pages remain unlisted and noindex. They do not create a partnership, funding relationship or customer claim by being drafted." /></section>
    </main>
  );
}

export default function PartnersHub() {
  const route = useMemo(() => resolvePage(typeof window === "undefined" ? "/" : window.location.pathname), []);
  return (
    <div className="partners-hub">
      <SiteHeader />
      {route.page === "home" ? <HomePage /> : null}
      {route.page === "system" ? <SystemPage /> : null}
      {route.page === "proof" ? <ProofPage /> : null}
      {route.page === "partnerships" ? <PartnershipsPage /> : null}
      {route.page === "capital" ? <CapitalPage /> : null}
      {route.page === "trust" ? <TrustPage /> : null}
      {route.page === "founder" ? <FounderPage /> : null}
      {route.page === "brief" ? <BriefPage slug={route.slug} /> : null}
      {route.page === "for" ? <ForPage slug={route.slug} /> : null}
      <SiteFooter />
    </div>
  );
}
