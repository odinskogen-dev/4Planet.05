import { Link, useParams } from "react-router-dom";
import { PublicShell } from "@/components/layout/PublicShell";
import { T } from "@/styles/tokens";
import { NotFound } from "@/pages/system";

const mono: React.CSSProperties = { fontFamily: T.mono, fontSize: 10.5, letterSpacing: ".15em", textTransform: "uppercase" };
const display: React.CSSProperties = { fontFamily: T.display, fontWeight: 500, letterSpacing: "-.04em" };
const page: React.CSSProperties = { maxWidth: 1440, margin: "0 auto", paddingLeft: "clamp(20px,5vw,72px)", paddingRight: "clamp(20px,5vw,72px)" };

type Article = {
  slug: string;
  category: "IDEA" | "METHODS" | "SPECIES" | "S4PIENS" | "IMPACT" | "SYSTEMS";
  title: string;
  dek: string;
  image: string;
  imageAlt: string;
  read: string;
  standfirst: string;
  sections: { heading?: string; paragraphs: string[] }[];
  pull?: string;
  next: { label: string; to: string }[];
};

export const MAGAZINE_ARTICLES: Article[] = [
  {
    slug: "everything-you-love-is-connected",
    category: "IDEA",
    title: "Everything you love is connected.",
    dek: "The case for treating a living planet as infrastructure for human life — not scenery around it.",
    image: "/assets/brand/earthrise.jpg",
    imageAlt: "Earth seen against the darkness of space",
    read: "6 MIN",
    standfirst: "Environmental language often asks people to care about something called nature as though it sits outside ordinary life. 4PLANET starts somewhere else: with the systems already underneath food, water, health, security, prosperity and freedom.",
    sections: [
      { paragraphs: ["A living planet is not a specialist interest. It is the operating context for every human economy, city and household. That does not make every ecological question simple, and it does not turn every environmental intervention into a good one. It changes the starting point.", "If human life sits inside living systems, ecological integrity is not only an altruistic preference. It is part of our shared self-interest. The practical challenge is to make those relationships visible without turning science into slogans."] },
      { heading: "From truth to agency", paragraphs: ["Information alone does not produce action. People need to understand what a fact means, why it is relevant to their lives and where credible agency actually exists.", "That is the chain 4PLANET is being designed around: truthful intelligence, understandable relationships, felt relevance, participation, solutions and proof. Every link can fail. The product has to make those failures visible rather than hiding them behind confidence."] },
      { heading: "One planet, different lenses", paragraphs: ["ATLAS shows place. SPECIES begins with life. LIVING SYSTEMS follows relationships. IMPACT is where action can become possible. Missions select where 4PLANET works. They are not separate realities; they are different entrances into the same one.", "The ambition is large. The public promise has to remain narrow: show what is known, label what is interpreted, admit what is unknown and never claim delivered impact before it exists."] },
    ],
    pull: "Love is not a strategy. But it is a reason to build one.",
    next: [{ label: "READ THE FOUNDER STORY", to: "/about/founder" }, { label: "ENTER ATLAS", to: "/atlas" }],
  },
  {
    slug: "a-point-is-not-a-range",
    category: "METHODS",
    title: "A point on a map is not a range.",
    dek: "Beautiful interfaces become dangerous when the picture says more than the evidence does.",
    image: "/assets/brand/front-hero.jpg",
    imageAlt: "Planetary landscape used as a 4PLANET editorial field",
    read: "5 MIN",
    standfirst: "A reported occurrence can be useful and still be radically incomplete. Good planetary interfaces have to preserve that distinction in the product itself.",
    sections: [
      { paragraphs: ["A record can tell us that an occurrence was reported at a place and time under the conditions of its source. It does not automatically establish a species' full range, present location, population size, trend, health or the cause of what happened there.", "Those distinctions sound technical until they are rendered on a map. Then a dot, heatmap or smooth polygon can acquire more authority than the underlying evidence deserves."] },
      { heading: "The interface is part of the evidence model", paragraphs: ["Truth boundaries cannot live only in footnotes. They have to influence labels, layer names, colours, interaction and what the system refuses to draw.", "In 4PLANET, occurrence points remain occurrence points. Range is held back until an authoritative geometry and source are admitted. Unknown population identity stays unknown. This is not a limitation to design around; it is part of the design."] },
      { heading: "Useful without pretending", paragraphs: ["Failing closed does not require a dead interface. A record can still open a species world, connect to an ecosystem context, carry a source record and help a person ask a better next question.", "The standard is not certainty everywhere. It is clarity about the difference between observation, interpretation and conclusion."] },
    ],
    pull: "The map should never become more certain than the source beneath it.",
    next: [{ label: "OPEN JAGUAR", to: "/species/jaguar" }, { label: "ENTER ATLAS", to: "/atlas" }],
  },
  {
    slug: "meet-life-before-the-problem",
    category: "SPECIES",
    title: "Meet life before the problem.",
    dek: "A species should not enter the interface only when something is wrong with it.",
    image: "/assets/brand/about-field.jpg",
    imageAlt: "A living landscape",
    read: "4 MIN",
    standfirst: "Conservation products often begin with threat. SPECIES is being built to begin with the living subject — then reveal place, relationships, pressures and possible responses.",
    sections: [
      { paragraphs: ["A whale is more than a conservation status. A jaguar is more than an occurrence record. A bee is more than a service to agriculture. Each is a living organism embedded in relationships that existed before the interface arrived.", "Beginning with life changes the emotional and informational order. Identity and behaviour can come before pressure; place before intervention; uncertainty before prescription."] },
      { heading: "From profile to world", paragraphs: ["The goal is not a prettier encyclopaedia card. A strong species world should connect identity, evidence, observations, living systems, pressures, Missions and credible responses while preserving the boundary between them.", "That is why the same canonical species identity has to travel into ATLAS instead of being recreated there. The page and the map should disagree only when the evidence really does."] },
    ],
    pull: "Protection becomes more intelligible when the subject is allowed to be alive first.",
    next: [{ label: "MEET ORCA", to: "/species/orca" }, { label: "MEET JAGUAR", to: "/species/jaguar" }],
  },
  {
    slug: "humanity-inside-the-system",
    category: "S4PIENS",
    title: "Put the human back inside the system.",
    dek: "Homo sapiens is not standing outside the planetary map looking in.",
    image: "/assets/brand/astronaut.jpg",
    imageAlt: "A human figure framed against a planetary environment",
    read: "7 MIN",
    standfirst: "Food, energy, fashion and cities are human systems, but their inputs and consequences do not stop at the human edge. S4PIENS begins by modelling both directions.",
    sections: [
      { paragraphs: ["Planet to human: food, water, climate regulation, materials, pollination and functioning ecosystems. Human to planet: demand, production, land, water, energy, materials, transport, emissions, waste and pressure on living systems.", "Those are not two different maps. They are opposing directions through the same relationships."] },
      { heading: "A species lens for ourselves", paragraphs: ["Treating Homo sapiens as a first-class species is useful precisely because it prevents the human system from floating above ecology. The human body becomes an entrance into dependencies; consumption becomes an entrance into value chains; places become an entrance into production and pressure.", "The interface must also resist a seductive mistake: a species-level model cannot infer an individual's footprint. A product, household or person requires its own evidence before the system can make a specific claim."] },
      { heading: "Choice needs a truth spine", paragraphs: ["A useful choice system eventually has to connect a normal decision — a meal, garment, journey or purchase — to verified product data, value-chain context and realistic alternatives. That requires much more than a green score.", "The work starts by keeping dependency, pressure and response as different relationship classes. Otherwise the system collapses causes, consequences and solutions into one persuasive but unreliable number."] },
    ],
    pull: "Humans are not the audience outside the map. We are one of the forces moving through it.",
    next: [{ label: "OPEN HOMO SAPIENS", to: "/species/homo-sapiens" }, { label: "ENTER S4PIENS", to: "/domains/s4piens" }],
  },
  {
    slug: "proof-before-promise",
    category: "IMPACT",
    title: "Proof before promise.",
    dek: "An action pathway should become easier to join only as its delivery model becomes more real.",
    image: "/assets/brand/culture-anchor.jpg",
    imageAlt: "4PLANET cultural image used as an editorial anchor",
    read: "5 MIN",
    standfirst: "The pressure to make participation frictionless can produce a worse problem: making unverified impact frictionless too.",
    sections: [
      { paragraphs: ["A button can be operational long before the intervention behind it is. That is why product readiness and ecological readiness cannot be treated as the same thing.", "For 4PLANET, an Impact Pathway can be visible while still closed. People can understand what is being built, which evidence is missing and what has to become true before money or participation is accepted."] },
      { heading: "Status is product information", paragraphs: ["Partner validation, evidence design, delivery, reporting and rights are not backstage administration. They determine what the public interface is allowed to say and do.", "A prototype should look like a prototype where it matters. A proposed split should say proposed. A pathway in development should not imitate a completed programme. Honest status can reduce conversion in the short term and increase the value of trust over time."] },
    ],
    pull: "The action layer earns simplicity only after the delivery layer earns confidence.",
    next: [{ label: "SEE IMPACT", to: "/impact" }, { label: "HOW THE SYSTEM WORKS", to: "/about/system" }],
  },
  {
    slug: "the-map-is-not-the-mission",
    category: "SYSTEMS",
    title: "The map is not the Mission.",
    dek: "A model of the world and an organisation's choice of where to act are different things — and should stay different.",
    image: "/assets/brand/story-hero.jpg",
    imageAlt: "A person moving through a large landscape",
    read: "6 MIN",
    standfirst: "The planet does not organise itself into the first sixteen projects an organisation happens to choose. Architecture gets stronger when it admits that.",
    sections: [
      { paragraphs: ["A planetary model needs to describe relationships whether or not 4PLANET currently has a Mission there. Missions, by contrast, are deliberate operational selections: places where intelligence, actors, solutions and acceleration can be organised into work.", "Confusing the two makes the taxonomy brittle. Every new scientific relationship becomes a branding decision, and every branding decision risks being mistaken for a description of nature."] },
      { heading: "Shared infrastructure, controlled depth", paragraphs: ["The stronger pattern is a broad shared Planet Model underneath narrower public and operational views. ATLAS can render spatial context. SPECIES can render a life-first view. LIVING SYSTEMS can render dependencies. Missions can select a problem. IMPACT can select an action path.", "Each surface can go deep without creating its own private universe of identifiers and facts. That is what allows the system to scale without asking the user to relearn reality every time they change lens."] },
    ],
    pull: "The Planetary Map describes the world. Missions select where 4PLANET acts.",
    next: [{ label: "SEE ALL MISSIONS", to: "/missions" }, { label: "ENTER THE DOMAINS", to: "/domains" }],
  },
];

function ArticleCard({ article, feature = false }: { article: Article; feature?: boolean }) {
  return (
    <Link to={`/magazine/${article.slug}`} className={feature ? "mag-story mag-story--feature" : "mag-story"}>
      <div className="mag-story__image">
        <img src={article.image} alt={article.imageAlt} loading={feature ? "eager" : "lazy"} decoding="async" />
      </div>
      <div className="mag-story__copy">
        <div style={{ ...mono, color: T.blue }}>{article.category} · {article.read}</div>
        <h2 style={{ ...display, marginTop: 12, fontSize: feature ? "clamp(34px,5.5vw,82px)" : "clamp(24px,2.8vw,40px)", lineHeight: .96 }}>{article.title}</h2>
        <p style={{ marginTop: 14, color: T.dim, fontSize: feature ? "clamp(15px,1.4vw,19px)" : 14.5, lineHeight: 1.55, maxWidth: 680 }}>{article.dek}</p>
        <div style={{ ...mono, marginTop: 22, color: T.ink }}>READ STORY →</div>
      </div>
    </Link>
  );
}

export function Magazine() {
  const [lead, ...rest] = MAGAZINE_ARTICLES;
  return (
    <PublicShell>
      <header className="mag-head">
        <div style={{ ...page, paddingTop: "clamp(110px,14vw,190px)", paddingBottom: "clamp(32px,5vw,66px)" }}>
          <div className="mag-masthead">M4GAZINE_</div>
          <div className="mag-head__line">
            <div style={{ ...mono }}>ISSUE 00 · BUILDING THE LIVING PLANET</div>
            <div style={{ ...mono }}>4CULTURE_ / EDITORIAL</div>
          </div>
        </div>
      </header>

      <main>
        <section style={{ ...page, paddingTop: "clamp(32px,5vw,70px)", paddingBottom: "clamp(54px,8vw,110px)" }}>
          <ArticleCard article={lead} feature />
        </section>

        <section style={{ borderTop: `1px solid ${T.lineStrong}`, borderBottom: `1px solid ${T.lineStrong}` }}>
          <div style={{ ...page, paddingTop: 22, paddingBottom: 22, display: "flex", justifyContent: "space-between", gap: 20, flexWrap: "wrap" }}>
            <span style={{ ...mono, color: T.blue }}>LATEST STORIES</span>
            <span style={{ ...mono, color: T.dim }}>IDEA · METHODS · SPECIES · S4PIENS · IMPACT · SYSTEMS</span>
          </div>
        </section>

        <section style={{ ...page, paddingTop: "clamp(40px,6vw,80px)", paddingBottom: "clamp(70px,10vw,140px)" }}>
          <div className="mag-grid">
            {rest.map((article) => <ArticleCard key={article.slug} article={article} />)}
          </div>
        </section>

        <section className="mag-manifesto">
          <div style={{ ...page, paddingTop: "clamp(74px,11vw,160px)", paddingBottom: "clamp(74px,11vw,160px)" }}>
            <div style={{ ...mono, color: T.acid }}>M4GAZINE_ · WHY EDITORIAL EXISTS</div>
            <p style={{ ...display, marginTop: 22, fontSize: "clamp(36px,6.5vw,96px)", lineHeight: .92, maxWidth: "15ch" }}>Data can show a relationship. Story can make a person stay with it.</p>
            <p style={{ marginTop: 28, maxWidth: 700, color: "rgba(255,255,255,.7)", fontSize: "clamp(16px,1.5vw,20px)", lineHeight: 1.65 }}>M4GAZINE is the editorial layer of 4PLANET: field notes, methods, ideas, species, systems and culture. It should add depth without relaxing the evidence standard underneath the rest of the product.</p>
          </div>
        </section>
      </main>

      <style>{`
        .mag-head{background:#fff;color:${T.ink};border-bottom:1px solid ${T.lineStrong}}
        .mag-masthead{font-family:${T.display};font-weight:650;font-size:clamp(62px,13vw,190px);letter-spacing:-.07em;line-height:.72;white-space:nowrap}
        .mag-head__line{display:flex;justify-content:space-between;gap:20px;flex-wrap:wrap;margin-top:clamp(32px,5vw,58px);padding-top:18px;border-top:1px solid ${T.ink}}
        .mag-story{display:grid;grid-template-columns:minmax(0,1.12fr) minmax(280px,.88fr);gap:clamp(24px,5vw,72px);color:${T.ink};text-decoration:none;align-items:center}
        .mag-story__image{position:relative;overflow:hidden;aspect-ratio:4/3;background:#111}
        .mag-story__image img{width:100%;height:100%;object-fit:cover;display:block;transition:transform .55s cubic-bezier(.2,.7,.2,1)}
        .mag-story:hover .mag-story__image img{transform:scale(1.025)}
        .mag-story:focus-visible{outline:3px solid currentColor;outline-offset:7px}
        .mag-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));column-gap:clamp(28px,5vw,70px);row-gap:clamp(58px,8vw,110px)}
        .mag-grid .mag-story{display:block}.mag-grid .mag-story__copy{padding-top:22px}.mag-grid .mag-story__image{aspect-ratio:16/11}
        .mag-manifesto{background:#050505;color:#fff}
        @media(max-width:760px){.mag-masthead{white-space:normal}.mag-story{grid-template-columns:1fr}.mag-grid{grid-template-columns:1fr}.mag-story--feature .mag-story__image{aspect-ratio:5/4}}
        @media(prefers-reduced-motion:reduce){.mag-story__image img{transition:none}.mag-story:hover .mag-story__image img{transform:none}}
      `}</style>
    </PublicShell>
  );
}

export function MagazineArticle() {
  const { slug } = useParams();
  const article = MAGAZINE_ARTICLES.find((item) => item.slug === slug);
  if (!article) return <NotFound />;

  return (
    <PublicShell>
      <article className="mag-article">
        <header style={{ ...page, paddingTop: "clamp(118px,15vw,210px)", paddingBottom: "clamp(44px,7vw,92px)" }}>
          <Link to="/magazine" style={{ ...mono, color: T.blue, textDecoration: "none" }}>← M4GAZINE_</Link>
          <div style={{ ...mono, color: T.dim, marginTop: 30 }}>{article.category} · {article.read}</div>
          <h1 style={{ ...display, marginTop: 18, fontSize: "clamp(48px,8vw,120px)", lineHeight: .86, maxWidth: "11ch" }}>{article.title}</h1>
          <p style={{ marginTop: 30, maxWidth: 800, fontSize: "clamp(19px,2.1vw,27px)", lineHeight: 1.5, color: T.dim }}>{article.dek}</p>
        </header>

        <figure className="mag-article__hero">
          <img src={article.image} alt={article.imageAlt} decoding="async" />
        </figure>

        <div className="mag-article__body">
          <p className="mag-article__standfirst">{article.standfirst}</p>
          {article.sections.map((section, i) => (
            <section key={i}>
              {section.heading && <h2>{section.heading}</h2>}
              {section.paragraphs.map((paragraph, j) => <p key={j}>{paragraph}</p>)}
              {i === 0 && article.pull && <blockquote>{article.pull}</blockquote>}
            </section>
          ))}
        </div>

        <footer className="mag-article__next">
          <div style={{ ...page, paddingTop: "clamp(54px,8vw,100px)", paddingBottom: "clamp(54px,8vw,100px)" }}>
            <div style={{ ...mono, color: T.blue }}>CONTINUE EXPLORING</div>
            <div className="mag-article__next-grid">
              {article.next.map((item) => <Link key={item.to} to={item.to}>{item.label}<span aria-hidden>→</span></Link>)}
              <Link to="/magazine">MORE FROM M4GAZINE<span aria-hidden>→</span></Link>
            </div>
          </div>
        </footer>
      </article>

      <style>{`
        .mag-article{background:#fff;color:${T.ink}}
        .mag-article__hero{margin:0;width:100%;height:min(78vh,840px);overflow:hidden;background:#111}.mag-article__hero img{width:100%;height:100%;object-fit:cover;display:block}
        .mag-article__body{max-width:790px;margin:0 auto;padding:clamp(56px,9vw,130px) 20px clamp(70px,10vw,150px)}
        .mag-article__standfirst{font-family:${T.display};font-size:clamp(23px,3vw,38px);letter-spacing:-.025em;line-height:1.22;margin:0 0 clamp(52px,7vw,84px)}
        .mag-article__body section+section{margin-top:clamp(48px,7vw,78px)}
        .mag-article__body h2{font-family:${T.display};font-size:clamp(30px,4vw,52px);font-weight:500;letter-spacing:-.035em;line-height:1.04;margin:0 0 24px}
        .mag-article__body p:not(.mag-article__standfirst){font-size:clamp(17px,1.25vw,19px);line-height:1.78;color:#292929;margin:0}.mag-article__body p+p{margin-top:22px!important}
        .mag-article__body blockquote{font-family:${T.display};font-size:clamp(30px,4.6vw,64px);font-weight:500;letter-spacing:-.04em;line-height:1.02;margin:clamp(54px,8vw,90px) min(-8vw,-40px);padding:0 0 0 24px;border-left:5px solid ${T.blue};color:${T.ink}}
        .mag-article__next{border-top:1px solid ${T.lineStrong}}
        .mag-article__next-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));margin-top:24px;border-top:1px solid ${T.line};border-left:1px solid ${T.line}}
        .mag-article__next-grid a{display:flex;justify-content:space-between;gap:20px;min-height:130px;padding:22px;color:${T.ink};text-decoration:none;border-right:1px solid ${T.line};border-bottom:1px solid ${T.line};font-family:${T.display};font-size:clamp(18px,1.8vw,25px)}
        .mag-article__next-grid a:hover{background:#f4f4f4}.mag-article__next-grid a:focus-visible{outline:3px solid currentColor;outline-offset:-3px}
        @media(max-width:760px){.mag-article__hero{height:58vh}.mag-article__body blockquote{margin:54px 0}.mag-article__next-grid{grid-template-columns:1fr}}
      `}</style>
    </PublicShell>
  );
}

export default Magazine;
