import { Link, useParams } from "react-router-dom";
import { MagazineShell } from "@/components/magazine/MagazineShell";
import { Seo } from "@/components/Seo";
import { FOUNDING_EDITION } from "@/content/magazineEditorial";
import { NotFound } from "@/pages/system";

export function MagazineStoryRecord() {
  const { id } = useParams();
  const item = FOUNDING_EDITION.items.find((candidate) => candidate.id === id);
  if (!item) return <NotFound />;

  return (
    <MagazineShell>
      <Seo
        title={`${item.title} — Pre-publication record | 4PLANET MAGAZINE`}
        description={`${item.summary} This is a controlled pre-publication story record, not a published article.`}
        path={`/magazine/stories/${item.id}`}
        robots="noindex,follow"
      />
      <main className="mag-record-page">
        <div className="mag-record-top">
          <Link to="/magazine">4PLANET MAGAZINE / EDITORIAL LAB</Link>
          <span>PRE-PUBLICATION RECORD</span>
        </div>

        <header className="mag-record-header">
          <p className="mag-info-kicker">{String(item.order).padStart(2, "0")} / {item.format}</p>
          <h1>{item.title}</h1>
          <p>{item.summary}</p>
        </header>

        <section className="mag-record-state" aria-labelledby="record-state-title">
          <p className="mag-info-kicker">EDITORIAL GATE STATE</p>
          <h2 id="record-state-title">{item.status.replace(/_/g, " ")}</h2>
          <dl>
            <div><dt>SOURCE STATE</dt><dd>{item.sourceState}</dd></div>
            <div><dt>RIGHTS STATE</dt><dd>{item.rightsState}</dd></div>
            <div><dt>RESPONSIBILITY STATE</dt><dd>{FOUNDING_EDITION.responsibilityState}</dd></div>
            <div><dt>PRODUCT BRIDGE</dt><dd>{item.productBridgeState}</dd></div>
          </dl>
        </section>

        <section className="mag-record-boundary">
          <p className="mag-info-kicker">PUBLICATION BOUNDARY</p>
          <h2>A record is not an article.</h2>
          <p>This URL preserves the editorial object while source, rights, contributor, responsibility or publication gates remain open. It is excluded from search indexing and does not pretend to have a public byline, publication date or cleared reporting state.</p>
          <div className="mag-record-actions">
            <Link to="/magazine">← BACK TO MAGAZINE</Link>
            <Link to="/magazine/sources">SOURCES & METHOD →</Link>
          </div>
        </section>
      </main>
    </MagazineShell>
  );
}
