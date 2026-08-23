import { Link, useParams } from "react-router-dom";
import { MagazineShell } from "@/components/magazine/MagazineShell";
import { Seo } from "@/components/Seo";
import { MAGAZINE_TOPICS } from "@/content/magazineOperating";
import { signalBySlug } from "@/content/magazineSignals";
import { NotFound } from "@/pages/system";
import "@/styles/magazine-signal.css";

export function MagazineSignalPage() {
  const { slug } = useParams();
  const signal = signalBySlug(slug);
  if (!signal) return <NotFound />;

  return (
    <MagazineShell>
      <Seo
        title={`${signal.title} | PLANET SIGNAL — 4PLANET MAGAZINE`}
        description={signal.dek}
        path={`/magazine/signals/${signal.slug}`}
      />
      <main className="mag-signal-page" data-accent={signal.accent}>
        <header className="mag-signal-hero">
          <div className="mag-signal-meta"><span>PLANET SIGNAL</span><span>FAST / SOURCE-BOUNDED</span><span>AS OF {signal.asOf}</span></div>
          <h1>{signal.title}</h1>
          <p>{signal.dek}</p>
        </header>

        <section className="mag-signal-core">
          <div className="mag-signal-number">01</div>
          <div><p className="mag-signal-label">THE SIGNAL</p><h2>{signal.signal}</h2></div>
        </section>
        <section className="mag-signal-core mag-signal-core--quiet">
          <div className="mag-signal-number">02</div>
          <div><p className="mag-signal-label">WHY IT MATTERS</p><p className="mag-signal-prose">{signal.whyItMatters}</p></div>
        </section>
        <section className="mag-signal-core mag-signal-core--dark">
          <div className="mag-signal-number">03</div>
          <div><p className="mag-signal-label">DO NOT OVER-READ THIS</p><p className="mag-signal-prose">{signal.boundary}</p></div>
        </section>

        <section className="mag-signal-source">
          <div><p>PRIMARY / PEER-REVIEWED SOURCE</p><h2>{signal.publisher}</h2><span>{signal.publishedAt}</span></div>
          <a href={signal.sourceUrl} target="_blank" rel="noreferrer">OPEN SOURCE ↗</a>
        </section>

        <nav className="mag-signal-topics" aria-label="Signal topics">
          {signal.topics.map((topicId) => {
            const topic = MAGAZINE_TOPICS.find((item) => item.id === topicId);
            return <Link key={topicId} to={`/magazine?topic=${topicId}`}>{topic?.label ?? topicId}</Link>;
          })}
        </nav>

        <section className="mag-signal-next"><p>KEEP THE THREAD</p><h2>Fast does not mean context-free.</h2><div><Link to="/magazine/archive">OPEN ARCHIVE →</Link><Link to="/magazine?topic=INNOVATION">MORE INNOVATION →</Link><Link to="/magazine">MAGAZINE HOME →</Link></div></section>
      </main>
    </MagazineShell>
  );
}
