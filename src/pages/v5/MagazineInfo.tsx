import { Link } from "react-router-dom";
import { MagazineShell } from "@/components/magazine/MagazineShell";
import { Seo } from "@/components/Seo";
import {
  FOUNDING_EDITION,
  MAGAZINE_EDITORIAL_PRINCIPLES,
  MAGAZINE_SOURCE_WORKFLOW,
} from "@/content/magazineEditorial";
import "@/styles/magazine-world.css";

function MagazineSubnav() {
  return (
    <nav className="mag-info-nav" aria-label="Magazine information">
      <Link to="/magazine">Latest</Link>
      <Link to="/magazine/about">About</Link>
      <Link to="/magazine/sources">Sources & method</Link>
      <Link to="/magazine/corrections">Corrections</Link>
    </nav>
  );
}

export function MagazineAbout() {
  return (
    <MagazineShell>
      <Seo title="About 4PLANET MAGAZINE" description="The editorial purpose, independence rules and current publication state of 4PLANET MAGAZINE." path="/magazine/about" />
      <main className="mag-info-page">
        <p className="mag-info-kicker">ABOUT / 4PLANET MAGAZINE</p>
        <h1>A publication about what holds.</h1>
        <p className="mag-info-lead">4PLANET Magazine reports on the living planet as a set of relationships: species, places, pressures, people, engineering, design, culture, science and attempted solutions. It is an editorial system, not a disguised marketing surface.</p>

        <section className="mag-info-section">
          <p className="mag-info-kicker">FOUNDING EDITION</p>
          <h2>{FOUNDING_EDITION.workingTitle}</h2>
          <p>{FOUNDING_EDITION.subtitle}</p>
          <p>{FOUNDING_EDITION.responsibilityState}. The controlled edition records remain separate from the reader-facing feed until source, rights and editorial gates close.</p>
        </section>

        <section className="mag-info-section">
          <p className="mag-info-kicker">EDITORIAL INDEPENDENCE</p>
          <h2>Interesting beats agreeable.</h2>
          <div className="mag-info-rows">
            {MAGAZINE_EDITORIAL_PRINCIPLES.map((principle, index) => (
              <div className="mag-info-row" key={principle}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <p>{principle}</p>
              </div>
            ))}
          </div>
        </section>
        <MagazineSubnav />
      </main>
    </MagazineShell>
  );
}

export function MagazineSources() {
  return (
    <MagazineShell>
      <Seo title="Sources & Method — 4PLANET MAGAZINE" description="How 4PLANET MAGAZINE handles sources, claims, uncertainty, rights and editorial release." path="/magazine/sources" />
      <main className="mag-info-page">
        <p className="mag-info-kicker">SOURCES & METHOD</p>
        <h1>Evidence before certainty.</h1>
        <p className="mag-info-lead">A story is not ready because the prose is finished. Material claims, images and interpretations pass through a source and rights chain before a public version is accepted.</p>

        <section className="mag-info-section">
          <p className="mag-info-kicker">PUBLICATION WORKFLOW</p>
          <div className="mag-info-rows">
            {MAGAZINE_SOURCE_WORKFLOW.map((step, index) => (
              <div className="mag-info-row" key={step}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <strong>{step}</strong>
              </div>
            ))}
          </div>
        </section>

        <section className="mag-info-dark">
          <p className="mag-info-kicker">READING THE EVIDENCE</p>
          <h2>Observed ≠ modelled ≠ interpreted ≠ unknown.</h2>
          <p>4PLANET Magazine distinguishes what a source directly reports from what a model estimates, what the publication interprets and what remains unresolved. A product view can deepen context without automatically becoming editorial evidence.</p>
        </section>
        <MagazineSubnav />
      </main>
    </MagazineShell>
  );
}

export function MagazineCorrections() {
  return (
    <MagazineShell>
      <Seo title="Corrections — 4PLANET MAGAZINE" description="The 4PLANET MAGAZINE corrections and transparency desk." path="/magazine/corrections" />
      <main className="mag-info-page">
        <p className="mag-info-kicker">CORRECTIONS DESK</p>
        <h1>What changed stays visible.</h1>
        <p className="mag-info-lead">Material factual corrections belong with the affected public story rather than disappearing into a silent edit. The record should say what changed, why and when.</p>

        <section className="mag-info-section">
          <p className="mag-info-kicker">CURRENT STATE</p>
          <h2>No public correction entries yet.</h2>
          <p>This does not mean drafts have never changed. It means the corrections desk has not yet recorded a correction against a released story.</p>
        </section>

        <section className="mag-info-section">
          <p className="mag-info-kicker">CORRECTION RULE</p>
          <h2>The source trail stays intact.</h2>
          <p>Corrections remain editorially controlled and separate from partner, funder or product pressure. Material disputes are recorded rather than resolved by silently weakening the evidence trail.</p>
        </section>
        <MagazineSubnav />
      </main>
    </MagazineShell>
  );
}
