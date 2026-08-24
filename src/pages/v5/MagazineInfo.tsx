import { Link } from "react-router-dom";
import { MagazineShell } from "@/components/magazine/MagazineShell";
import { Seo } from "@/components/Seo";
import {
  MAGAZINE_EDITORIAL_PRINCIPLES,
  MAGAZINE_SOURCE_WORKFLOW,
} from "@/content/magazineEditorial";
import {
  MAGAZINE_EDITORIAL_FORMS,
  MAGAZINE_PUBLICATION_PIPELINE,
  MAGAZINE_PUBLICATION_STATE,
  MAGAZINE_RELEASE_STANDARD,
  MAGAZINE_VOICE,
} from "@/content/magazinePublication";
import "@/styles/magazine-world.css";

function MagazineSubnav() {
  return (
    <nav className="mag-info-nav" aria-label="Magazine information">
      <Link to="/magazine">Latest</Link>
      <Link to="/magazine/about">About</Link>
      <Link to="/magazine/sources">Sources & method</Link>
      <Link to="/magazine/corrections">Corrections</Link>
      <Link to="/magazine/privacy">Privacy</Link>
    </nav>
  );
}

export function MagazineAbout() {
  return (
    <MagazineShell>
      <Seo title="About 4PLANET MAGAZINE" description="What 4PLANET MAGAZINE publishes, how editorial independence works and what readers should expect from every story." path="/magazine/about" />
      <main className="mag-info-page">
        <p className="mag-info-kicker">ABOUT / 4PLANET MAGAZINE</p>
        <h1>Stories that earn the time.</h1>
        <p className="mag-info-lead">4PLANET Magazine is the editorial publication of 4PLANET: reporting and explanation about the living world, the people trying to understand it, and the ideas being built around it. We follow species, places, science, engineering, culture and attempted solutions — with sources, uncertainty and visual context kept close to the story.</p>

        <section className="mag-info-section">
          <p className="mag-info-kicker">PUBLICATION STATE</p>
          <h2>Public founding edition.</h2>
          <p>{MAGAZINE_PUBLICATION_STATE.promise}</p>
          <p>Reader-facing stories are public only after their source, editorial and visual checks close. Working commissions and unfinished reporting remain outside the public feed.</p>
        </section>

        <section className="mag-info-section">
          <p className="mag-info-kicker">THE VOICE</p>
          <h2>Curious. Sharp. Never pretending certainty.</h2>
          <div className="mag-info-rows">
            {MAGAZINE_VOICE.map((principle, index) => (
              <div className="mag-info-row" key={principle}><span>{String(index + 1).padStart(2, "0")}</span><p>{principle}</p></div>
            ))}
          </div>
        </section>

        <section className="mag-info-section">
          <p className="mag-info-kicker">EDITORIAL INDEPENDENCE</p>
          <h2>Interesting beats agreeable.</h2>
          <div className="mag-info-rows">
            {MAGAZINE_EDITORIAL_PRINCIPLES.map((principle, index) => (
              <div className="mag-info-row" key={principle}><span>{String(index + 1).padStart(2, "0")}</span><p>{principle}</p></div>
            ))}
          </div>
        </section>

        <section className="mag-info-dark">
          <p className="mag-info-kicker">COMMERCIAL BOUNDARY</p>
          <h2>Money does not buy the conclusion.</h2>
          <p>4PLANET may work with partners, funders and organisations that also appear in our wider ecosystem. That relationship does not purchase favourable coverage, story approval or suppression of material criticism. Partner-submitted material must be labelled. Source-reported editorial stays editorial. A 4PLANET product is never evidence simply because 4PLANET built it.</p>
        </section>
        <MagazineSubnav />
      </main>
    </MagazineShell>
  );
}

export function MagazineSources() {
  return (
    <MagazineShell>
      <Seo title="Sources & Method — 4PLANET MAGAZINE" description="How 4PLANET MAGAZINE handles reporting, sources, claims, uncertainty, image rights, fact checking and publication." path="/magazine/sources" />
      <main className="mag-info-page">
        <p className="mag-info-kicker">SOURCES & METHOD</p>
        <h1>Evidence before certainty.</h1>
        <p className="mag-info-lead">A story is not ready because the prose is finished. Material claims, images and interpretations move through a source, fact-check and rights chain before the public version is accepted.</p>

        <section className="mag-info-section">
          <p className="mag-info-kicker">ARTICLE ENGINE</p>
          <h2>From idea to learning loop.</h2>
          <div className="mag-info-rows">
            {MAGAZINE_PUBLICATION_PIPELINE.map((step, index) => (
              <div className="mag-info-row" key={step}><span>{String(index + 1).padStart(2, "0")}</span><strong>{step}</strong></div>
            ))}
          </div>
        </section>

        <section className="mag-info-section">
          <p className="mag-info-kicker">SOURCE CONTROL</p>
          <div className="mag-info-rows">
            {MAGAZINE_SOURCE_WORKFLOW.map((step, index) => (
              <div className="mag-info-row" key={step}><span>{String(index + 1).padStart(2, "0")}</span><strong>{step}</strong></div>
            ))}
          </div>
        </section>

        <section className="mag-info-dark">
          <p className="mag-info-kicker">READING THE EVIDENCE</p>
          <h2>Observed ≠ modelled ≠ interpreted ≠ unknown.</h2>
          <p>We distinguish what a source directly reports from what a model estimates, what 4PLANET interprets and what remains unresolved. Source-reported editorial is written from published material and does not imply that our journalists were physically present. Original reporting will be labelled as such.</p>
        </section>

        <section className="mag-info-section">
          <p className="mag-info-kicker">VISUAL TRUTH</p>
          <h2>A beautiful image is not field evidence.</h2>
          <p>Every full story carries an image role. Documentary imagery may support a claim only where the source and rights record justify it. Context imagery is labelled as context and must not be read as proof of a named event, location, person or ecological outcome. Credits and rights remain attached to the asset record.</p>
        </section>

        <section className="mag-info-section">
          <p className="mag-info-kicker">AI / EDITORIAL RESPONSIBILITY</p>
          <h2>Tools can assist. Editors remain responsible.</h2>
          <p>4PLANET may use computational and AI tools in research assistance, transcription, synthesis, drafting support, data handling or production. They do not become a source simply by producing text, and they do not remove editorial responsibility. Material factual claims must remain traceable to evidence; invented quotations, fabricated reporting and synthetic documentary evidence are not acceptable. The published story is judged and owned by the editorial process, not by the tool that helped make it.</p>
        </section>

        <section className="mag-info-section">
          <p className="mag-info-kicker">RELEASE STANDARD</p>
          <div className="mag-info-rows">
            {MAGAZINE_RELEASE_STANDARD.map((rule, index) => (
              <div className="mag-info-row" key={rule}><span>{String(index + 1).padStart(2, "0")}</span><p>{rule}</p></div>
            ))}
          </div>
        </section>

        <section className="mag-info-section">
          <p className="mag-info-kicker">FORMATS</p>
          <div className="mag-info-rows">
            {MAGAZINE_EDITORIAL_FORMS.map((form, index) => (
              <div className="mag-info-row" key={form.id}><span>{String(index + 1).padStart(2, "0")}</span><p><strong>{form.label}</strong><br />{form.job}</p></div>
            ))}
          </div>
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
          <p>This does not mean drafts have never changed. It means no material correction has yet been logged against a released story in the current public edition.</p>
        </section>

        <section className="mag-info-section">
          <p className="mag-info-kicker">CORRECTION RULE</p>
          <h2>The source trail stays intact.</h2>
          <p>Typos and purely stylistic edits may be corrected without a formal note. Material errors in fact, attribution, interpretation or visual context require a visible correction. Corrections remain editorially controlled and separate from partner, funder or product pressure.</p>
        </section>
        <MagazineSubnav />
      </main>
    </MagazineShell>
  );
}

export function MagazinePrivacy() {
  return (
    <MagazineShell>
      <Seo title="Privacy — 4PLANET MAGAZINE" description="How optional analytics, saved reading and local reader state work on 4PLANET MAGAZINE." path="/magazine/privacy" />
      <main className="mag-info-page">
        <p className="mag-info-kicker">PRIVACY / READER PRODUCT</p>
        <h1>Read without an account.</h1>
        <p className="mag-info-lead">You do not need an account to read, search, save stories or continue where you left off. Saved and recent-reading state is stored locally in your browser.</p>
        <section className="mag-info-section"><p className="mag-info-kicker">OPTIONAL ANALYTICS</p><h2>Measurement is consent-based.</h2><p>Optional usage analytics are loaded only after consent. They are used to understand whether stories are opened, read deeply, completed, saved, shared and followed into sources, related stories or ATLAS. Advertising-personalisation signals are disabled.</p></section>
        <section className="mag-info-section"><p className="mag-info-kicker">WHAT WE WANT TO LEARN</p><h2>Value, not surveillance.</h2><p>The useful question is not how many pageviews can be accumulated. It is which stories people actually spend time with, which topics help them discover more, and where the reader product fails to earn attention.</p></section>
        <MagazineSubnav />
      </main>
    </MagazineShell>
  );
}