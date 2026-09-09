import { Link } from "react-router-dom";
import { PublicShell } from "@/components/layout/PublicShell";
import { Seo } from "@/components/Seo";
import {
  FOUNDING_EDITION,
  MAGAZINE_EDITORIAL_PRINCIPLES,
  MAGAZINE_SOURCE_WORKFLOW,
} from "@/content/magazineEditorial";

const pageStyle = { maxWidth: 1180, margin: "0 auto", padding: "clamp(70px,10vw,140px) clamp(20px,5vw,72px)" } as const;
const kickerStyle = { fontFamily: "Fragment Mono, monospace", fontSize: 11, letterSpacing: ".12em", opacity: .58 } as const;
const titleStyle = { fontSize: "clamp(48px,8vw,112px)", lineHeight: .9, letterSpacing: "-.055em", margin: "18px 0 28px" } as const;
const bodyStyle = { fontSize: "clamp(17px,1.8vw,22px)", lineHeight: 1.55, maxWidth: 820 } as const;

function MagazineSubnav() {
  return (
    <nav aria-label="Magazine information" style={{ display: "flex", gap: 18, flexWrap: "wrap", paddingTop: 30, marginTop: 42, borderTop: "1px solid rgba(0,0,0,.16)" }}>
      <Link to="/magazine">4PLANET MAGAZINE</Link>
      <Link to="/magazine/about">ABOUT</Link>
      <Link to="/magazine/sources">SOURCES & METHOD</Link>
      <Link to="/magazine/corrections">CORRECTIONS</Link>
    </nav>
  );
}

export function MagazineAbout() {
  return (
    <PublicShell>
      <Seo title="About 4PLANET MAGAZINE" description="The editorial purpose, independence rules and current publication state of 4PLANET MAGAZINE." path="/magazine/about" />
      <article style={pageStyle}>
        <p style={kickerStyle}>4PLANET MAGAZINE / ABOUT</p>
        <h1 style={titleStyle}>A publication about what holds.</h1>
        <p style={bodyStyle}>4PLANET MAGAZINE reports on the living planet as a set of relationships: species, places, pressures, people, culture, science and attempted solutions. It is designed as an editorial system, not a disguised marketing surface.</p>

        <section style={{ marginTop: "clamp(64px,9vw,110px)" }}>
          <p style={kickerStyle}>FOUNDING EDITION</p>
          <h2 style={{ fontSize: "clamp(34px,5vw,68px)", letterSpacing: "-.045em", lineHeight: 1, margin: "14px 0 20px" }}>{FOUNDING_EDITION.workingTitle}</h2>
          <p style={bodyStyle}>{FOUNDING_EDITION.subtitle}</p>
          <p style={{ ...bodyStyle, fontSize: 15, marginTop: 20, opacity: .66 }}>{FOUNDING_EDITION.responsibilityState}. The current edition remains a controlled pre-publication build until source, rights, contributor, responsibility and publication gates are closed.</p>
        </section>

        <section style={{ marginTop: "clamp(64px,9vw,110px)" }}>
          <p style={kickerStyle}>EDITORIAL INDEPENDENCE</p>
          <div style={{ marginTop: 24 }}>
            {MAGAZINE_EDITORIAL_PRINCIPLES.map((principle, index) => (
              <div key={principle} style={{ display: "grid", gridTemplateColumns: "46px 1fr", gap: 20, padding: "18px 0", borderTop: "1px solid rgba(0,0,0,.16)" }}>
                <span style={kickerStyle}>{String(index + 1).padStart(2, "0")}</span>
                <p style={{ fontSize: "clamp(16px,1.5vw,19px)", lineHeight: 1.5 }}>{principle}</p>
              </div>
            ))}
          </div>
        </section>
        <MagazineSubnav />
      </article>
    </PublicShell>
  );
}

export function MagazineSources() {
  return (
    <PublicShell>
      <Seo title="Sources & Method — 4PLANET MAGAZINE" description="How 4PLANET MAGAZINE handles sources, claims, uncertainty, rights and editorial release." path="/magazine/sources" />
      <article style={pageStyle}>
        <p style={kickerStyle}>4PLANET MAGAZINE / SOURCES & METHOD</p>
        <h1 style={titleStyle}>Evidence before certainty.</h1>
        <p style={bodyStyle}>A story is not ready because the prose is finished. Material claims, images and interpretations pass through a source and rights chain before a public version is accepted.</p>

        <section style={{ marginTop: "clamp(64px,9vw,110px)" }}>
          <p style={kickerStyle}>PUBLICATION WORKFLOW</p>
          <div style={{ marginTop: 24 }}>
            {MAGAZINE_SOURCE_WORKFLOW.map((step, index) => (
              <div key={step} style={{ display: "grid", gridTemplateColumns: "54px 1fr", gap: 20, padding: "18px 0", borderTop: "1px solid rgba(0,0,0,.16)" }}>
                <span style={kickerStyle}>{String(index + 1).padStart(2, "0")}</span>
                <strong style={{ fontSize: "clamp(17px,1.8vw,22px)", fontWeight: 500 }}>{step}</strong>
              </div>
            ))}
          </div>
        </section>

        <section style={{ marginTop: "clamp(64px,9vw,110px)", background: "#090909", color: "#fff", padding: "clamp(28px,5vw,64px)" }}>
          <p style={{ ...kickerStyle, opacity: .68 }}>READING THE EVIDENCE</p>
          <h2 style={{ fontSize: "clamp(34px,5vw,64px)", letterSpacing: "-.045em", lineHeight: 1, margin: "18px 0 26px" }}>Observed ≠ modelled ≠ interpreted ≠ unknown.</h2>
          <p style={{ ...bodyStyle, color: "rgba(255,255,255,.8)" }}>4PLANET MAGAZINE should distinguish what a source directly reports from what a model estimates, what the publication interprets and what remains unresolved. 4PLANET products may help a reader explore context, but product output is not automatically editorial evidence.</p>
        </section>
        <MagazineSubnav />
      </article>
    </PublicShell>
  );
}

export function MagazineCorrections() {
  return (
    <PublicShell>
      <Seo title="Corrections — 4PLANET MAGAZINE" description="The 4PLANET MAGAZINE corrections and transparency desk." path="/magazine/corrections" />
      <article style={pageStyle}>
        <p style={kickerStyle}>4PLANET MAGAZINE / CORRECTIONS DESK</p>
        <h1 style={titleStyle}>What changed stays visible.</h1>
        <p style={bodyStyle}>Material factual corrections should be attached to the affected public story rather than silently disappearing into an edit. The correction record should state what changed, why it changed and when.</p>

        <section style={{ marginTop: "clamp(64px,9vw,110px)", borderTop: "1px solid rgba(0,0,0,.16)", paddingTop: 24 }}>
          <p style={kickerStyle}>CURRENT STATE</p>
          <h2 style={{ fontSize: "clamp(30px,4vw,54px)", lineHeight: 1.05, letterSpacing: "-.04em", margin: "18px 0" }}>No public Founding Edition correction entries yet.</h2>
          <p style={{ ...bodyStyle, fontSize: 16, opacity: .7 }}>Reason: the Founding Edition remains in a pre-publication state. This is not a claim that no draft has changed; it means there is not yet a released public story to which a public correction can attach.</p>
        </section>

        <section style={{ marginTop: "clamp(64px,9vw,110px)" }}>
          <p style={kickerStyle}>CORRECTION RULE</p>
          <p style={bodyStyle}>Corrections must remain editorially controlled and separate from partner, funder or product pressure. Material disputes should be recorded rather than resolved by silently weakening or deleting the original evidence trail.</p>
        </section>
        <MagazineSubnav />
      </article>
    </PublicShell>
  );
}
